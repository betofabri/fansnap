// GET  /api/admin/applications        → lists intake records from D1
// PATCH /api/admin/applications        → update a record's status
//
// Backs the admin review queue (/admin/applications). Reads the three intake
// tables wired in Fatia 3: photographer_applications, photographer_referrals,
// brand_leads.
//
// ⚠️ AUTH: there is no app-level auth here yet. /fansnap/admin* and
// /fansnap/api/admin* MUST sit behind Cloudflare Access (Google SSO,
// @omeletecompany.com) before launch — same policy as betofabri.com/lab —
// otherwise applicant PII is publicly readable. Tracked as a launch blocker.

import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TABLES = {
  applications: {
    table: "photographer_applications",
    statuses: ["new", "reviewing", "approved", "rejected", "archived"],
  },
  referrals: {
    table: "photographer_referrals",
    statuses: ["new", "contacted", "converted", "archived"],
  },
  leads: {
    table: "brand_leads",
    statuses: ["new", "contacted", "qualified", "won", "lost", "archived"],
  },
} as const;

type Kind = keyof typeof TABLES;

export async function GET(): Promise<Response> {
  const db = await getDB();
  if (!db) {
    return NextResponse.json(
      { error: "Database unavailable", applications: [], referrals: [], leads: [] },
      { status: 503 },
    );
  }
  try {
    const [applications, referrals, leads] = await Promise.all([
      db.prepare("SELECT * FROM photographer_applications ORDER BY created_at DESC LIMIT 500").all(),
      db.prepare("SELECT * FROM photographer_referrals ORDER BY created_at DESC LIMIT 500").all(),
      db.prepare("SELECT * FROM brand_leads ORDER BY created_at DESC LIMIT 500").all(),
    ]);
    return NextResponse.json({
      applications: applications.results,
      referrals: referrals.results,
      leads: leads.results,
    });
  } catch (err) {
    console.error("[admin/applications] read failed", err);
    return NextResponse.json({ error: "Read failed" }, { status: 500 });
  }
}

export async function PATCH(req: Request): Promise<Response> {
  let body: { kind?: string; id?: string; status?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const kind = body.kind as Kind | undefined;
  const id = body.id?.trim();
  const status = body.status?.trim();
  if (!kind || !(kind in TABLES) || !id || !status) {
    return NextResponse.json({ error: "kind, id and status are required" }, { status: 400 });
  }
  const def = TABLES[kind];
  if (!(def.statuses as readonly string[]).includes(status)) {
    return NextResponse.json({ error: `Invalid status for ${kind}` }, { status: 422 });
  }

  const db = await getDB();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  try {
    // Table name comes from a fixed allowlist (def.table) — never user input —
    // so it's safe to interpolate; id/status stay bound parameters.
    await db
      .prepare(`UPDATE ${def.table} SET status = ? WHERE id = ?`)
      .bind(status, id)
      .run();

    // Approving a photographer application promotes the applicant into the
    // roster: create a `users` row (role=photographer). Idempotent via the
    // email UNIQUE constraint (INSERT OR IGNORE) — re-approving is a no-op.
    let promoted = false;
    let onboardingToken: string | null = null;
    if (kind === "applications" && status === "approved") {
      const app = await db
        .prepare("SELECT full_name, first_name, last_name, email, phone, city, portfolio, event_types, equipment, language FROM photographer_applications WHERE id = ?")
        .bind(id)
        .first<{ full_name: string; first_name: string | null; last_name: string | null; email: string; phone: string | null; city: string | null; portfolio: string | null; event_types: string | null; equipment: string | null; language: string | null }>();
      if (app?.email) {
        onboardingToken = newToken();
        await db
          .prepare(
            `INSERT OR IGNORE INTO users
               (id, role, email, phone, name, first_name, last_name, country, language,
                city, portfolio, specialties, equipment, tier, status,
                onboarding_token, onboarding_status, created_at)
             VALUES (?, 'photographer', ?, ?, ?, ?, ?, 'MX', ?, ?, ?, ?, ?, 'standard', 'active', ?, 'pending', datetime('now'))`,
          )
          .bind(
            newUserId(), app.email, app.phone, app.full_name,
            app.first_name, app.last_name, app.language ?? "es",
            app.city, app.portfolio, app.event_types, app.equipment, onboardingToken,
          )
          .run();
        // If the user already existed (re-approval), make sure they have a token.
        await db
          .prepare(`UPDATE users SET onboarding_token = COALESCE(onboarding_token, ?), onboarding_status = COALESCE(onboarding_status, 'pending') WHERE email = ? AND role = 'photographer'`)
          .bind(onboardingToken, app.email)
          .run();
        const row = await db.prepare("SELECT onboarding_token FROM users WHERE email = ? AND role = 'photographer'").bind(app.email).first<{ onboarding_token: string }>();
        onboardingToken = row?.onboarding_token ?? onboardingToken;
        promoted = true;
      }
    }
    return NextResponse.json({ ok: true, promoted, onboardingToken });
  } catch (err) {
    console.error("[admin/applications] update failed", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

function newUserId(): string {
  const ts = Date.now().toString(36);
  let rand = "";
  for (let i = 0; i < 10; i++) rand += Math.floor(Math.random() * 36).toString(36);
  return `usr_${ts}${rand}`;
}

// Unguessable onboarding token for the email/WhatsApp link.
function newToken(): string {
  let t = "";
  for (let i = 0; i < 28; i++) t += Math.floor(Math.random() * 36).toString(36);
  return t;
}
