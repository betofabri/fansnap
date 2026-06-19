// Admin Fans API — the fan registry (users with role='fan').
//   GET    → list fans (newest first)
//   POST   → manually add a fan
//   DELETE → remove by id (?id=…)
//
// Fans mostly arrive automatically (checkout / gallery opt-in → /api/fans/register).
// POST here is the manual entry path, mirroring photographers.
//
// ⚠️ AUTH: must sit behind Cloudflare Access before launch (contains PII).

import { NextResponse } from "next/server";
import { getDB, newId } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  const db = await getDB();
  if (!db) return NextResponse.json({ error: "Database unavailable", fans: [] }, { status: 503 });
  try {
    const { results } = await db
      .prepare(
        `SELECT id, name, first_name, last_name, email, phone, city, country,
                source, language, consent_at, created_at, last_seen_at
         FROM users WHERE role = 'fan'
         ORDER BY COALESCE(last_seen_at, created_at) DESC`,
      )
      .all();
    return NextResponse.json({ fans: results });
  } catch (err) {
    console.error("[admin/fans] read failed", err);
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
    const res = await db
      .prepare(
        `INSERT OR IGNORE INTO users (id, role, email, phone, name, first_name, last_name, country, language, city, source, created_at, last_seen_at)
         VALUES (?, 'fan', ?, ?, ?, ?, ?, ?, ?, ?, 'manual', datetime('now'), datetime('now'))`,
      )
      .bind(
        newId("fan_"), email,
        typeof body.phone === "string" ? body.phone : null,
        name, first || null, last || null,
        typeof body.country === "string" ? body.country : "MX",
        typeof body.language === "string" ? body.language : "es",
        typeof body.city === "string" ? body.city : null,
      )
      .run();
    const meta = res.meta as { changes?: number } | undefined;
    if (meta && meta.changes === 0) {
      return NextResponse.json({ error: "Ya existe un usuario con ese email" }, { status: 409 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/fans] create failed", err);
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request): Promise<Response> {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const db = await getDB();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  try {
    await db.prepare("DELETE FROM users WHERE id = ? AND role = 'fan'").bind(id).run();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/fans] delete failed", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
