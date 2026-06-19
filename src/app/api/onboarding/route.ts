// Photographer onboarding by tokenized link.
//   GET  ?token=…  → minimal profile + status (to greet + gate the form)
//   POST {token, ...account fields} → fills the roster profile, marks complete
//
// The token is a capability URL sent via email/WhatsApp on approval. It only
// exposes the photographer's own first name + status; POST updates their own
// users row. Public route (the photographer isn't logged in yet).

import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  const token = new URL(req.url).searchParams.get("token");
  if (!token) return NextResponse.json({ error: "token required" }, { status: 400 });
  const db = await getDB();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  try {
    const u = await db
      .prepare(`SELECT first_name, last_name, name, email, phone, city, tier, onboarding_status
                FROM users WHERE onboarding_token = ? AND role = 'photographer'`)
      .bind(token)
      .first<Record<string, unknown>>();
    if (!u) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true, photographer: u });
  } catch (err) {
    console.error("[onboarding] read failed", err);
    return NextResponse.json({ error: "Read failed" }, { status: 500 });
  }
}

const FIELDS = new Set([
  "first_name", "last_name", "phone", "city", "payout_method", "payout_account", "tax_id", "bio",
]);

export async function POST(req: Request): Promise<Response> {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const token = typeof body.token === "string" ? body.token : "";
  if (!token) return NextResponse.json({ error: "token required" }, { status: 400 });
  if (body.consent !== true) return NextResponse.json({ error: "consent required" }, { status: 422 });

  const sets: string[] = [];
  const vals: unknown[] = [];
  for (const [k, v] of Object.entries(body)) {
    if (!FIELDS.has(k)) continue;
    sets.push(`${k} = ?`);
    vals.push(typeof v === "string" ? v : v == null ? null : String(v));
  }
  // JSON-array fields
  for (const k of ["specialties", "equipment"]) {
    if (Array.isArray(body[k])) { sets.push(`${k} = ?`); vals.push(JSON.stringify(body[k])); }
  }
  if ("first_name" in body || "last_name" in body) {
    const nm = [body.first_name, body.last_name].filter((x) => typeof x === "string" && x).join(" ");
    if (nm) { sets.push("name = ?"); vals.push(nm); }
  }
  sets.push("onboarding_status = 'complete'");

  const db = await getDB();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  try {
    const u = await db.prepare("SELECT id FROM users WHERE onboarding_token = ? AND role = 'photographer'").bind(token).first<{ id: string }>();
    if (!u) return NextResponse.json({ error: "not_found" }, { status: 404 });
    await db.prepare(`UPDATE users SET ${sets.join(", ")} WHERE onboarding_token = ?`).bind(...vals, token).run();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[onboarding] update failed", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
