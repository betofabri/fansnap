// Photographer photo uploads (Fase 1 do pipeline real — model A).
//
//   GET  ?event=CODE      → { mode: 'live' | 'mock', photos: [...] }
//                           'live' only when the event exists in D1 with
//                           photo_source='live'; anything else → 'mock' and the
//                           dashboard keeps its simulation. This is the switch
//                           that lets demo events and real events coexist.
//   POST {eventCode, name, size, type, width, height}
//                         → validates + creates the `photos` row (status
//                           'uploading'), returns { id }.
//   PUT  ?id=<photoId>    → raw body streamed into R2 originals/<CODE>/<id>.<ext>,
//                           then status → 'processing' (Fase 2's queue+container
//                           will watermark + face-index and flip to 'published').
//
// AUTH: photographer accounts land in Fase 5 (magic-link). Until then this is
// gated by the preview cookie — good enough pre-launch (same guard as /mapa),
// and it keeps the route from being an open write endpoint on the public URL.
// The uploader is attributed to the event's first assigned photographer, else
// to an internal dev-uploader user (role 'admin' so it never shows in rosters).

import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDB, newId } from "@/lib/db";
import { hasPreviewCookie } from "@/lib/gate";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "heic", "heif", "webp"]);
const MAX_BYTES = 50 * 1024 * 1024;
const MIN_EDGE = 2000;

interface R2BucketLike {
  put(key: string, value: ReadableStream | ArrayBuffer | null, options?: { httpMetadata?: { contentType?: string } }): Promise<{ etag: string; size: number } | null>;
}
interface QueueLike {
  send(body: unknown): Promise<void>;
}

async function getBucket(): Promise<R2BucketLike | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return ((env as unknown as Record<string, unknown>).PHOTOS as R2BucketLike) ?? null;
  } catch { return null; }
}

async function getQueue(): Promise<QueueLike | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return ((env as unknown as Record<string, unknown>).PROCESS_QUEUE as QueueLike) ?? null;
  } catch { return null; }
}

async function findLiveEvent(db: NonNullable<Awaited<ReturnType<typeof getDB>>>, code: string) {
  return db
    .prepare(`SELECT id, code, photo_source FROM events
              WHERE UPPER(code) = UPPER(?) AND deleted_at IS NULL`)
    .bind(code)
    .first<{ id: string; code: string; photo_source: string }>();
}

// ─── GET: mode + current photos for an event ────────────────────────────────
export async function GET(req: Request): Promise<Response> {
  if (!(await hasPreviewCookie())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const code = new URL(req.url).searchParams.get("event")?.trim();
  if (!code) return NextResponse.json({ error: "event required" }, { status: 400 });
  const db = await getDB();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  try {
    const ev = await findLiveEvent(db, code);
    if (!ev || ev.photo_source !== "live") {
      return NextResponse.json({ ok: true, mode: "mock", photos: [] });
    }
    const { results } = await db
      .prepare(`SELECT id, status, reject_reason, width, height, size_bytes, created_at
                FROM photos WHERE event_id = ? ORDER BY created_at DESC LIMIT 500`)
      .bind(ev.id)
      .all();
    return NextResponse.json({ ok: true, mode: "live", photos: results });
  } catch (err) {
    console.error("[uploads] read failed", err);
    return NextResponse.json({ error: "Read failed" }, { status: 500 });
  }
}

// ─── POST: register an upload (creates the photos row) ─────────────────────
export async function POST(req: Request): Promise<Response> {
  if (!(await hasPreviewCookie())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  // Operational retry: POST ?reprocess=<photoId> re-enqueues a photo stuck in
  // 'processing' (lost message / consumer failure past max_retries).
  const reprocess = new URL(req.url).searchParams.get("reprocess")?.trim();
  if (reprocess) {
    const db = await getDB();
    if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    const photo = await db.prepare(`SELECT status FROM photos WHERE id = ?`).bind(reprocess).first<{ status: string | null }>();
    if (!photo) return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (photo.status !== "processing") {
      return NextResponse.json({ error: "not_processing", status: photo.status }, { status: 409 });
    }
    const queue = await getQueue();
    if (!queue) return NextResponse.json({ error: "Queue unavailable" }, { status: 503 });
    await queue.send({ photoId: reprocess });
    return NextResponse.json({ ok: true, requeued: reprocess });
  }

  let body: { eventCode?: string; name?: string; size?: number; type?: string; width?: number; height?: number };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const code = body.eventCode?.trim();
  const name = body.name?.trim() ?? "";
  const size = Number(body.size ?? 0);
  const width = Number(body.width ?? 0) || null;
  const height = Number(body.height ?? 0) || null;
  if (!code || !name) return NextResponse.json({ error: "eventCode and name required" }, { status: 400 });

  // Server re-checks what the client validated — the client is advisory only.
  const ext = (name.split(".").pop() ?? "").toLowerCase();
  if (!ALLOWED_EXT.has(ext)) return NextResponse.json({ error: "unsupported_format" }, { status: 422 });
  if (size > MAX_BYTES) return NextResponse.json({ error: "too_large" }, { status: 422 });
  if (width && height && Math.max(width, height) < MIN_EDGE) {
    return NextResponse.json({ error: "resolution_too_low" }, { status: 422 });
  }

  const db = await getDB();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  try {
    const ev = await findLiveEvent(db, code);
    if (!ev || ev.photo_source !== "live") {
      return NextResponse.json({ error: "event_not_live" }, { status: 409 });
    }

    // Attribute to the event's first assigned photographer; else the internal
    // dev-uploader (created on demand; role 'admin' keeps it out of rosters).
    let uploader = await db
      .prepare(`SELECT photographer_id AS id FROM event_photographers WHERE event_id = ? LIMIT 1`)
      .bind(ev.id)
      .first<{ id: string }>();
    if (!uploader) {
      await db
        .prepare(`INSERT OR IGNORE INTO users (id, role, email, name, created_at)
                  VALUES ('usr_dev_uploader', 'admin', 'dev-uploader@fansnap.internal', 'Dev Uploader', datetime('now'))`)
        .run();
      uploader = { id: "usr_dev_uploader" };
    }

    const id = newId("ph_");
    const key = `originals/${ev.code}/${id}.${ext}`;
    await db
      .prepare(`INSERT INTO photos (id, event_id, photographer_id, r2_key, width, height, size_bytes, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'uploading', datetime('now'))`)
      .bind(id, ev.id, uploader.id, key, width, height, size)
      .run();
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error("[uploads] init failed", err);
    return NextResponse.json({ error: "Init failed" }, { status: 500 });
  }
}

// ─── PUT: the bytes — stream into R2, flip to 'processing' ─────────────────
export async function PUT(req: Request): Promise<Response> {
  if (!(await hasPreviewCookie())) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id")?.trim();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_BYTES) return NextResponse.json({ error: "too_large" }, { status: 413 });

  const db = await getDB();
  const bucket = await getBucket();
  if (!db || !bucket) return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
  try {
    const photo = await db
      .prepare(`SELECT r2_key, status FROM photos WHERE id = ?`)
      .bind(id)
      .first<{ r2_key: string; status: string | null }>();
    if (!photo) return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (photo.status !== "uploading") return NextResponse.json({ error: "already_uploaded" }, { status: 409 });

    // Buffer the body: R2 put() rejects streams of unknown length (the body
    // loses its content-length through the framework), and ≤50MB fits Worker
    // memory comfortably. Buffering also lets us hash the real bytes.
    const buf = await req.arrayBuffer();
    if (buf.byteLength === 0) return NextResponse.json({ error: "empty_body" }, { status: 400 });
    if (buf.byteLength > MAX_BYTES) return NextResponse.json({ error: "too_large" }, { status: 413 });
    const digest = await crypto.subtle.digest("SHA-256", buf);
    const hash = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");

    const obj = await bucket.put(photo.r2_key, buf, {
      httpMetadata: { contentType: req.headers.get("content-type") ?? "application/octet-stream" },
    });
    if (!obj) throw new Error("r2_put_failed");

    await db
      .prepare(`UPDATE photos SET status = 'processing', size_bytes = ?, content_hash = ? WHERE id = ?`)
      .bind(buf.byteLength, hash, id)
      .run();

    // Hand off to the processor (watermark + publish). If the enqueue fails
    // the photo stays 'processing' and can be re-sent via POST ?reprocess=<id>.
    try {
      const queue = await getQueue();
      if (queue) await queue.send({ photoId: id });
      else console.error("[uploads] PROCESS_QUEUE missing — photo stuck processing", id);
    } catch (err) {
      console.error("[uploads] enqueue failed", err, id);
    }
    return NextResponse.json({ ok: true, id, status: "processing" });
  } catch (err) {
    console.error("[uploads] put failed", err, id);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
