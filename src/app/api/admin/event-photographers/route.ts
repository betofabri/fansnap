// Admin Event↔Photographer assignments — the M:N join `event_photographers`.
//   GET    ?eventId=…       → photographers assigned to an event (+ their info)
//   POST   {eventId, photographerId, tier} → assign (idempotent on the pair)
//   PATCH  {id, tier}       → change the assignment's tier
//   DELETE ?id=…            → unassign
//
// Each assignment carries its own tier + commission (the deal lives on the
// relationship, not on the photographer). commission_rate is seeded from tier.
//
// ⚠️ AUTH: must sit behind Cloudflare Access before launch.

import { NextResponse } from "next/server";
import { getDB, newId } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIERS = ["standard", "pro", "vip"];
const TIER_RATE: Record<string, number> = { standard: 0.6, pro: 0.7, vip: 0.75 };

export async function GET(req: Request): Promise<Response> {
  const eventId = new URL(req.url).searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });
  const db = await getDB();
  if (!db) return NextResponse.json({ error: "Database unavailable", assignments: [] }, { status: 503 });
  try {
    const { results } = await db
      .prepare(
        `SELECT ep.id, ep.tier, ep.commission_rate, ep.approved, ep.created_at,
                u.id AS photographer_id, u.name, u.email, u.city
         FROM event_photographers ep
         JOIN users u ON u.id = ep.photographer_id
         WHERE ep.event_id = ?
         ORDER BY ep.created_at DESC`,
      )
      .bind(eventId)
      .all();
    return NextResponse.json({ assignments: results });
  } catch (err) {
    console.error("[admin/event-photographers] read failed", err);
    return NextResponse.json({ error: "Read failed" }, { status: 500 });
  }
}

export async function POST(req: Request): Promise<Response> {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const eventId = typeof body.eventId === "string" ? body.eventId : "";
  const photographerId = typeof body.photographerId === "string" ? body.photographerId : "";
  const tier = typeof body.tier === "string" && TIERS.includes(body.tier) ? body.tier : "standard";
  if (!eventId || !photographerId) {
    return NextResponse.json({ error: "eventId and photographerId required" }, { status: 422 });
  }

  const db = await getDB();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  try {
    const res = await db
      .prepare(
        `INSERT OR IGNORE INTO event_photographers
           (id, event_id, photographer_id, tier, commission_rate, approved, created_at)
         VALUES (?, ?, ?, ?, ?, 1, datetime('now'))`,
      )
      .bind(newId("ep_"), eventId, photographerId, tier, TIER_RATE[tier])
      .run();
    const meta = res.meta as { changes?: number } | undefined;
    if (meta && meta.changes === 0) {
      return NextResponse.json({ error: "Este fotógrafo já está atribuído a este evento" }, { status: 409 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/event-photographers] assign failed", err);
    return NextResponse.json({ error: "Assign failed" }, { status: 500 });
  }
}

export async function PATCH(req: Request): Promise<Response> {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const id = typeof body.id === "string" ? body.id : "";
  const tier = typeof body.tier === "string" && TIERS.includes(body.tier) ? body.tier : "";
  if (!id || !tier) return NextResponse.json({ error: "id and valid tier required" }, { status: 422 });

  const db = await getDB();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  try {
    await db.prepare("UPDATE event_photographers SET tier = ?, commission_rate = ? WHERE id = ?")
      .bind(tier, TIER_RATE[tier], id).run();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/event-photographers] patch failed", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request): Promise<Response> {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const db = await getDB();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  try {
    await db.prepare("DELETE FROM event_photographers WHERE id = ?").bind(id).run();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/event-photographers] delete failed", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
