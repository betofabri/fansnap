// Admin Events API — real CRUD over the D1 `events` table.
//   GET    → list events (+ live photographer-assignment count)
//   POST   → create an event
//   PATCH  → update fields by id
//   DELETE → remove by id  (?id=…)
//
// ⚠️ AUTH: same as /api/admin/applications — must sit behind Cloudflare Access
// before launch. No app-level auth here yet.

import { NextResponse } from "next/server";
import { getDB, newId } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUSINESS_MODELS = ["marketplace", "official", "sponsored"];
const CATEGORIES = ["music", "conventions", "sports", "parties", "corporate"];
const STATUSES = ["draft", "upcoming", "live", "recent", "archived"];

// Columns a PATCH/POST may set, with validators. Keeps SQL injection-safe
// (only these fixed column names ever reach the query).
const FIELDS: Record<string, (v: unknown) => boolean> = {
  name: (v) => typeof v === "string" && v.trim().length > 0,
  business_model: (v) => typeof v === "string" && BUSINESS_MODELS.includes(v),
  category: (v) => typeof v === "string" && CATEGORIES.includes(v),
  venue: (v) => typeof v === "string",
  city: (v) => typeof v === "string",
  country: (v) => typeof v === "string",
  start_at: (v) => typeof v === "string" && v.length > 0,
  status: (v) => typeof v === "string" && STATUSES.includes(v),
  featured: (v) => v === 0 || v === 1 || typeof v === "boolean",
  cover_color: (v) => typeof v === "string",
  photo_count: (v) => typeof v === "number" && v >= 0,
};

function norm(field: string, v: unknown): unknown {
  if (field === "featured") return v === true || v === 1 ? 1 : 0;
  return v;
}

export async function GET(req: Request): Promise<Response> {
  const trash = new URL(req.url).searchParams.get("trash") === "1";
  const db = await getDB();
  if (!db) return NextResponse.json({ error: "Database unavailable", events: [] }, { status: 503 });
  try {
    const where = trash ? "e.deleted_at IS NOT NULL" : "e.deleted_at IS NULL";
    const { results } = await db
      .prepare(
        `SELECT e.*,
                (SELECT COUNT(*) FROM event_photographers ep WHERE ep.event_id = e.id) AS photographer_count
         FROM events e
         WHERE ${where}
         ORDER BY ${trash ? "e.deleted_at" : "e.start_at"} DESC`,
      )
      .all();
    return NextResponse.json({ events: results });
  } catch (err) {
    console.error("[admin/events] read failed", err);
    return NextResponse.json({ error: "Read failed" }, { status: 500 });
  }
}

export async function POST(req: Request): Promise<Response> {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const business_model = typeof body.business_model === "string" ? body.business_model : "official";
  const category = typeof body.category === "string" ? body.category : "music";
  const start_at = typeof body.start_at === "string" && body.start_at ? body.start_at : "";
  if (!code || !name || !start_at) {
    return NextResponse.json({ error: "code, name and start_at are required" }, { status: 422 });
  }
  if (!BUSINESS_MODELS.includes(business_model)) return NextResponse.json({ error: "bad business_model" }, { status: 422 });
  if (!CATEGORIES.includes(category)) return NextResponse.json({ error: "bad category" }, { status: 422 });

  const db = await getDB();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  try {
    const id = newId("evt_");
    await db
      .prepare(
        `INSERT INTO events
           (id, code, name, business_model, category, venue, city, country,
            start_at, status, featured, cover_color, photo_count, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'),datetime('now'))`,
      )
      .bind(
        id, code, name, business_model, category,
        typeof body.venue === "string" ? body.venue : "",
        typeof body.city === "string" ? body.city : "",
        typeof body.country === "string" ? body.country : "MX",
        start_at,
        STATUSES.includes(body.status as string) ? body.status : "draft",
        body.featured ? 1 : 0,
        typeof body.cover_color === "string" ? body.cover_color : "#9D4EFF",
        typeof body.photo_count === "number" ? body.photo_count : 0,
      )
      .run();
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error("[admin/events] create failed", err);
    return NextResponse.json({ error: "Create failed (code may already exist)" }, { status: 500 });
  }
}

export async function PATCH(req: Request): Promise<Response> {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // Restore from trash (deleted_at → NULL) is its own small action.
  if (body.restore === true) {
    const db = await getDB();
    if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
    try {
      await db.prepare("UPDATE events SET deleted_at = NULL, updated_at = datetime('now') WHERE id = ?").bind(id).run();
      return NextResponse.json({ ok: true });
    } catch (err) {
      console.error("[admin/events] restore failed", err);
      return NextResponse.json({ error: "Restore failed" }, { status: 500 });
    }
  }

  const sets: string[] = [];
  const vals: unknown[] = [];
  for (const [field, validate] of Object.entries(FIELDS)) {
    if (field in body) {
      if (!validate(body[field])) return NextResponse.json({ error: `bad ${field}` }, { status: 422 });
      sets.push(`${field} = ?`);
      vals.push(norm(field, body[field]));
    }
  }
  if (sets.length === 0) return NextResponse.json({ error: "no valid fields" }, { status: 400 });
  sets.push("updated_at = datetime('now')");

  const db = await getDB();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  try {
    await db.prepare(`UPDATE events SET ${sets.join(", ")} WHERE id = ?`).bind(...vals, id).run();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/events] update failed", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// DELETE ?id=…            → soft delete (move to trash; recoverable)
// DELETE ?id=…&permanent=1 → hard delete (only from trash, irreversible)
export async function DELETE(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const permanent = url.searchParams.get("permanent") === "1";
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const db = await getDB();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  try {
    if (permanent) {
      // Safety invariant: a hard delete can ONLY purge a row that's already in
      // the trash. An active event can never be destroyed in one step — it must
      // be trashed first. Prevents accidental data loss from a stray id.
      await db.prepare("DELETE FROM events WHERE id = ? AND deleted_at IS NOT NULL").bind(id).run();
    } else {
      await db.prepare("UPDATE events SET deleted_at = datetime('now'), updated_at = datetime('now') WHERE id = ? AND deleted_at IS NULL").bind(id).run();
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/events] delete failed", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
