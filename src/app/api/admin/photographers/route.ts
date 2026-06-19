// Admin Photographers API — the roster (users with role='photographer').
//   GET    → list photographers (+ event-assignment count)
//   POST   → manually add a photographer (the "we insert them ourselves" path)
//   DELETE → remove by id (?id=…)
//
// Photographers also arrive automatically when an application is approved
// (see /api/admin/applications PATCH). This route is the manual entry point.
//
// ⚠️ AUTH: must sit behind Cloudflare Access before launch.

import { NextResponse } from "next/server";
import { getDB, newId } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const db = await getDB();
  if (!db) return NextResponse.json({ error: "Database unavailable", photographers: [] }, { status: 503 });
  try {
    const { results } = await db
      .prepare(
        `SELECT u.id, u.name, u.first_name, u.last_name, u.handle, u.email, u.phone,
                u.city, u.country, u.portfolio, u.bio, u.specialties, u.equipment,
                u.tier, u.status, u.payout_method, u.payout_account, u.tax_id,
                u.onboarding_token, u.onboarding_status,
                u.created_at, u.last_seen_at,
                (SELECT COUNT(*) FROM event_photographers ep WHERE ep.photographer_id = u.id) AS event_count
         FROM users u
         WHERE u.role = 'photographer'
         ORDER BY u.created_at DESC`,
      )
      .all();
    return NextResponse.json({ photographers: results });
  } catch (err) {
    console.error("[admin/photographers] read failed", err);
    return NextResponse.json({ error: "Read failed" }, { status: 500 });
  }
}

export async function POST(req: Request): Promise<Response> {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const first = typeof body.firstName === "string" ? body.firstName.trim() : "";
  const last = typeof body.lastName === "string" ? body.lastName.trim() : "";
  const name = [first, last].filter(Boolean).join(" ") || (typeof body.name === "string" ? body.name.trim() : "");
  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!name || !email || !email.includes("@")) {
    return NextResponse.json({ error: "name and a valid email are required" }, { status: 422 });
  }

  const db = await getDB();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  try {
    const id = newId("usr_");
    const res = await db
      .prepare(
        `INSERT OR IGNORE INTO users
           (id, role, email, phone, name, first_name, last_name, country, language,
            city, portfolio, tier, status, created_at)
         VALUES (?, 'photographer', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'standard', 'active', datetime('now'))`,
      )
      .bind(
        id, email,
        typeof body.phone === "string" ? body.phone : null,
        name, first || null, last || null,
        typeof body.country === "string" ? body.country : "MX",
        typeof body.language === "string" ? body.language : "es",
        typeof body.city === "string" ? body.city : null,
        typeof body.portfolio === "string" ? body.portfolio : null,
      )
      .run();
    // INSERT OR IGNORE silently no-ops on a duplicate email.
    const meta = res.meta as { changes?: number } | undefined;
    if (meta && meta.changes === 0) {
      return NextResponse.json({ error: "Ya existe un fotógrafo con ese email" }, { status: 409 });
    }
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error("[admin/photographers] create failed", err);
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}

// Editable account fields — fixed allowlist (column names never user input).
const PHOTOG_FIELDS = new Set([
  "first_name", "last_name", "phone", "city", "country", "handle", "bio",
  "portfolio", "tier", "status", "payout_method", "payout_account", "tax_id",
]);

export async function PATCH(req: Request): Promise<Response> {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const sets: string[] = [];
  const vals: unknown[] = [];
  for (const [k, v] of Object.entries(body)) {
    if (k === "id" || !PHOTOG_FIELDS.has(k)) continue;
    sets.push(`${k} = ?`);
    vals.push(typeof v === "string" ? v : v == null ? null : String(v));
  }
  // Keep `name` in sync when either name part changes.
  if ("first_name" in body || "last_name" in body) {
    const nm = [body.first_name, body.last_name].filter((x) => typeof x === "string" && x).join(" ");
    if (nm) { sets.push("name = ?"); vals.push(nm); }
  }
  if (sets.length === 0) return NextResponse.json({ error: "no valid fields" }, { status: 400 });

  const db = await getDB();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  try {
    await db.prepare(`UPDATE users SET ${sets.join(", ")} WHERE id = ? AND role = 'photographer'`).bind(...vals, id).run();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/photographers] update failed", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request): Promise<Response> {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const db = await getDB();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  try {
    // Their event assignments go too (ON DELETE CASCADE in the schema).
    await db.prepare("DELETE FROM users WHERE id = ? AND role = 'photographer'").bind(id).run();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/photographers] delete failed", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
