// Public watermarked preview of a real-pipeline photo.
// GET ?id=ph_… → streams previews/<CODE>/<id>.<ver>.jpg from R2 (the
// watermarked derivative — safe to be public by design; originals stay
// private behind /api/download's order capability). Mock photos never hit
// this route (their thumbs are plain public paths).

import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDB } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface R2GetLike {
  get(key: string): Promise<{ body: ReadableStream; httpMetadata?: { contentType?: string } } | null>;
}

export async function GET(req: Request): Promise<Response> {
  const id = new URL(req.url).searchParams.get("id")?.trim();
  if (!id?.startsWith("ph_")) return NextResponse.json({ error: "id required" }, { status: 400 });

  const db = await getDB();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  try {
    const row = await db
      .prepare(`SELECT r2_thumb_key FROM photos WHERE id = ? AND status = 'published'`)
      .bind(id)
      .first<{ r2_thumb_key: string | null }>();
    if (!row?.r2_thumb_key || row.r2_thumb_key.startsWith("mock:")) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    const { env } = await getCloudflareContext({ async: true });
    const bucket = (env as unknown as Record<string, unknown>).PHOTOS as R2GetLike | undefined;
    const obj = bucket ? await bucket.get(row.r2_thumb_key) : null;
    if (!obj) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return new Response(obj.body, {
      headers: {
        "Content-Type": obj.httpMetadata?.contentType ?? "image/jpeg",
        // Immutable-ish: the key carries the pipeline version, so cache hard.
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (err) {
    console.error("[photos/preview] failed", err);
    return NextResponse.json({ error: "Preview failed" }, { status: 500 });
  }
}
