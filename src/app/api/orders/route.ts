// Orders — Fase 4 (delivery loop WITHOUT a payment gateway).
//
//   POST { email, firstName, lastName, language, items:[...] }
//        → upserts the fan, writes orders + order_lines to D1 on the
//          'free_sponsored' rail with status 'paid' (fake payment — when a
//          real gateway lands it only changes how this status gets flipped),
//          returns { orderId, code, downloads } and fires the receipt email.
//   GET  ?code=FS-XXXXXX&email=…  → the fan's order + download links
//        (powers /pedidos server-side lookup — any device, not just the one
//        that bought).
//
// The order *id* (ord_<crypto>) is the download capability; the short `code`
// is what humans read/type and only resolves together with the buyer email.
//
// Mock-catalog items (the demo events) get a shadow `photos` row
// (id phm_…, r2_key 'mock:<public path>') so order_lines' FK holds; their
// "download" redirects to the public mock asset. Real photos (ph_…) deliver
// the clean R2 original via /api/download.

import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDB, newId, secureToken, type D1Like } from "@/lib/db";
import { sendEmail, orderReceiptEmail } from "@/lib/email";
import { MXN_RATE } from "@/lib/mock";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const IVA_RATE = 0.16;
const SKUS = new Set(["digital", "foto_flat", "print", "tshirt", "mug", "canvas"]);

interface OrderItemIn {
  photoRef?: string;   // "ph_…" (real) or "mock:<event>:<photoId>"
  image?: string;      // public path of the mock preview (delivery + thumb)
  title?: string;
  eventCode?: string;
  sku?: string;
  qty?: number;
  unitPriceUSD?: number;
}

function isEmail(v: unknown): v is string {
  return typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

async function upsertFan(db: D1Like, args: { email: string; firstName?: string; lastName?: string; language?: string }): Promise<string | null> {
  const name = [args.firstName, args.lastName].filter(Boolean).join(" ") || null;
  await db
    .prepare(
      `INSERT INTO users (id, role, email, name, first_name, last_name, language, source, created_at, last_seen_at)
       VALUES (?, 'fan', ?, ?, ?, ?, ?, 'checkout', datetime('now'), datetime('now'))
       ON CONFLICT(email) DO UPDATE SET
         name = COALESCE(excluded.name, name),
         first_name = COALESCE(excluded.first_name, first_name),
         last_name = COALESCE(excluded.last_name, last_name),
         last_seen_at = datetime('now')`,
    )
    .bind(newId("usr_"), args.email, name, args.firstName ?? null, args.lastName ?? null, args.language ?? "es")
    .run();
  const row = await db.prepare(`SELECT id FROM users WHERE email = ?`).bind(args.email).first<{ id: string }>();
  return row?.id ?? null;
}

export async function POST(req: Request): Promise<Response> {
  let body: { email?: string; firstName?: string; lastName?: string; language?: string; items?: OrderItemIn[] };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const email = body.email?.trim().toLowerCase();
  const items = Array.isArray(body.items) ? body.items : [];
  if (!isEmail(email)) return NextResponse.json({ error: "email inválido" }, { status: 422 });
  if (items.length === 0 || items.length > 50) return NextResponse.json({ error: "items required" }, { status: 422 });

  const db = await getDB();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  try {
    const userId = await upsertFan(db, { email, firstName: body.firstName, lastName: body.lastName, language: body.language });
    if (!userId) throw new Error("fan_upsert_failed");

    // Order event = first item's event (multi-event carts denormalize to it).
    const firstCode = items[0]?.eventCode?.trim() ?? "";
    const ev = await db
      .prepare(`SELECT id, business_model FROM events WHERE UPPER(code) = UPPER(?) AND deleted_at IS NULL`)
      .bind(firstCode)
      .first<{ id: string; business_model: string }>();
    if (!ev) return NextResponse.json({ error: "event_not_found" }, { status: 422 });

    const orderId = `ord_${secureToken(24)}`;
    const code = `FS-${secureToken(6).toUpperCase()}`;

    const stmts = [];
    const lines: { lineId: string; title: string }[] = [];
    let subtotal = 0;

    for (const it of items) {
      const sku = SKUS.has(it.sku ?? "") ? (it.sku as string) : "digital";
      const qty = Math.max(1, Math.min(20, Math.round(Number(it.qty ?? 1))));
      const unitCents = Math.max(0, Math.round(Number(it.unitPriceUSD ?? 0) * MXN_RATE * 100));
      const lineTotal = unitCents * qty;
      subtotal += lineTotal;

      let photoId = it.photoRef?.trim() ?? "";
      const title = (it.title ?? "Foto").slice(0, 120);

      if (photoId.startsWith("ph_")) {
        const exists = await db.prepare(`SELECT id FROM photos WHERE id = ?`).bind(photoId).first<{ id: string }>();
        if (!exists) return NextResponse.json({ error: `photo_not_found:${photoId}` }, { status: 422 });
      } else {
        // Shadow row for a mock-catalog item: deterministic id so repeat
        // purchases reuse it; r2_key carries the public asset path.
        const image = typeof it.image === "string" ? it.image : "";
        if (!image.startsWith("/fansnap/")) return NextResponse.json({ error: "mock item sem image" }, { status: 422 });
        const itemEv = it.eventCode?.trim() === firstCode
          ? ev
          : await db.prepare(`SELECT id FROM events WHERE UPPER(code) = UPPER(?) AND deleted_at IS NULL`).bind(it.eventCode?.trim() ?? "").first<{ id: string }>();
        if (!itemEv) return NextResponse.json({ error: "event_not_found" }, { status: 422 });
        photoId = `phm_${(it.eventCode ?? "x")}_${photoId.replace(/[^a-zA-Z0-9]/g, "")}`.slice(0, 60);
        stmts.push(
          db.prepare(
            `INSERT OR IGNORE INTO photos (id, event_id, photographer_id, r2_key, r2_thumb_key, status, watermarked, face_indexed, created_at)
             VALUES (?, ?, 'usr_dev_uploader', ?, ?, 'published', 1, 0, datetime('now'))`,
          ).bind(photoId, itemEv.id, `mock:${image}`, `mock:${image}`),
        );
      }

      const lineId = newId("ol_");
      lines.push({ lineId, title });
      stmts.push(
        db.prepare(
          `INSERT INTO order_lines (id, order_id, photo_id, product_sku, qty, unit_cents, total_cents, photographer_commission_cents, platform_net_cents)
           VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0)`,
        ).bind(lineId, orderId, photoId, sku, qty, unitCents, lineTotal),
      );
    }

    const iva = Math.round(subtotal * IVA_RATE);
    const total = subtotal + iva;

    // The dev-uploader user must exist before shadow-photo FKs resolve.
    stmts.unshift(
      db.prepare(
        `INSERT OR IGNORE INTO users (id, role, email, name, created_at)
         VALUES ('usr_dev_uploader', 'admin', 'dev-uploader@fansnap.internal', 'Dev Uploader', datetime('now'))`,
      ),
      db.prepare(
        `INSERT INTO orders (id, code, email, user_id, event_id, business_model, currency, subtotal_cents, iva_cents, total_cents, payment_rail, status, paid_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'MXN', ?, ?, ?, 'free_sponsored', 'paid', datetime('now'), datetime('now'))`,
      ).bind(orderId, code, email, userId, ev.id, ev.business_model, subtotal, iva, total),
    );
    await db.batch(stmts);

    const downloads = lines.map((l) => ({
      title: l.title,
      url: `/fansnap/api/download?order=${orderId}&line=${l.lineId}`,
    }));

    // Receipt email — fire-and-forget; sendEmail degrades gracefully until the
    // domain is onboarded to Email Sending.
    const mail = orderReceiptEmail({
      name: body.firstName || "fan",
      code,
      totalMXN: total / 100,
      downloads: downloads.map((d) => ({ title: d.title, url: `https://betofabri.com${d.url}` })),
    });
    const send = sendEmail({ to: email, subject: mail.subject, html: mail.html, text: mail.text });
    try {
      const { ctx } = await getCloudflareContext({ async: true });
      ctx.waitUntil(send);
    } catch { void send; }

    return NextResponse.json({ ok: true, orderId, code, downloads });
  } catch (err) {
    console.error("[orders] create failed", err);
    return NextResponse.json({ error: "Order failed" }, { status: 500 });
  }
}

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const code = url.searchParams.get("code")?.trim().toUpperCase();
  const email = url.searchParams.get("email")?.trim().toLowerCase();
  if (!code || !isEmail(email)) return NextResponse.json({ error: "code and email required" }, { status: 400 });

  const db = await getDB();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  try {
    const order = await db
      .prepare(`SELECT id, code, email, total_cents, iva_cents, subtotal_cents, status, created_at FROM orders WHERE code = ? AND email = ?`)
      .bind(code, email)
      .first<{ id: string; code: string; email: string; total_cents: number; iva_cents: number; subtotal_cents: number; status: string; created_at: string }>();
    if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });

    const { results } = await db
      .prepare(
        `SELECT ol.id AS line_id, ol.product_sku, ol.qty, ol.unit_cents, ol.total_cents,
                p.id AS photo_id, p.r2_thumb_key
         FROM order_lines ol JOIN photos p ON p.id = ol.photo_id
         WHERE ol.order_id = ?`,
      )
      .bind(order.id)
      .all();

    const lines = (results as Array<{ line_id: string; product_sku: string; qty: number; unit_cents: number; total_cents: number; photo_id: string; r2_thumb_key: string | null }>).map((l) => ({
      lineId: l.line_id,
      sku: l.product_sku,
      qty: l.qty,
      unitCents: l.unit_cents,
      totalCents: l.total_cents,
      thumb: l.r2_thumb_key?.startsWith("mock:")
        ? l.r2_thumb_key.slice(5)
        : `/fansnap/api/photos/preview?id=${encodeURIComponent(l.photo_id)}`,
      download: `/fansnap/api/download?order=${order.id}&line=${l.line_id}`,
    }));

    return NextResponse.json({ ok: true, order: { code: order.code, status: order.status, totalCents: order.total_cents, createdAt: order.created_at }, lines });
  } catch (err) {
    console.error("[orders] lookup failed", err);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
