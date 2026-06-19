// POST /api/fans/register — PUBLIC fan registration (called from the fan SPA:
// checkout auto-registers the buyer, and the gallery "avísame" opt-in).
// Upserts a `users` row (role='fan') keyed on email — idempotent, so a repeat
// buyer just refreshes last_seen_at and fills any missing name/phone/city.
//
// Search stays free + anonymous (no gate); a fan only lands here when they
// volunteer an email (buying, or opting in to be notified).

import { NextResponse } from "next/server";
import { getDB, newId } from "@/lib/db";

export const runtime = "nodejs";

interface Body {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  city?: string;
  source?: string; // 'checkout' | 'gallery' | ...
  language?: "en" | "pt" | "es";
}

export async function POST(req: Request): Promise<Response> {
  let body: Body;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const email = body.email?.trim();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "valid email required" }, { status: 422 });
  }
  const first = body.firstName?.trim() || null;
  const last = body.lastName?.trim() || null;
  const name = body.name?.trim() || [first, last].filter(Boolean).join(" ") || null;
  const phone = body.phone?.trim() || null;
  const city = body.city?.trim() || null;
  const source = body.source?.trim() || null;
  const language = body.language === "en" || body.language === "pt" || body.language === "es" ? body.language : "es";

  const db = await getDB();
  if (!db) {
    // Don't break the buy flow if the DB is unavailable — just log.
    console.warn("[fans/register] no DB — skipping", email);
    return NextResponse.json({ ok: true, persisted: false });
  }
  try {
    // Upsert on the unique email. COALESCE keeps existing non-null values when
    // a later touch (e.g. gallery opt-in) sends fewer fields than checkout.
    await db
      .prepare(
        `INSERT INTO users (id, role, email, phone, name, first_name, last_name, country, language, city, source, created_at, last_seen_at)
         VALUES (?, 'fan', ?, ?, ?, ?, ?, 'MX', ?, ?, ?, datetime('now'), datetime('now'))
         ON CONFLICT(email) DO UPDATE SET
           last_seen_at = datetime('now'),
           name       = COALESCE(excluded.name, users.name),
           first_name = COALESCE(excluded.first_name, users.first_name),
           last_name  = COALESCE(excluded.last_name, users.last_name),
           phone      = COALESCE(excluded.phone, users.phone),
           city       = COALESCE(excluded.city, users.city),
           source     = COALESCE(users.source, excluded.source)`,
      )
      .bind(newId("fan_"), email, phone, name, first, last, language, city, source)
      .run();
    return NextResponse.json({ ok: true, persisted: true });
  } catch (err) {
    console.error("[fans/register] upsert failed", err);
    return NextResponse.json({ ok: true, persisted: false });
  }
}
