// POST /api/photographers/apply
//
// Stub for the photographer roster pre-registration form. Validates the
// payload shape, generates an application code, returns it to the client.
// Real persistence (D1 `photographer_applications` table + transactional
// email via Cloudflare Email Service) lands in Fatia 3 — for now we just
// log it and let the landing show the confirmation state.
//
// Doc: src/app/aplica/page.tsx is the public landing this endpoint backs.

import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDB, newId } from "@/lib/db";
import { sendEmail, applicationConfirmationEmail } from "@/lib/email";

export const runtime = "nodejs";

interface ApplyBody {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  city?: string;
  portfolio?: string;
  eventTypes?: string[];
  equipment?: string[];
  bigEventExperience?: boolean;
  bigEventNotes?: string;
  verification?: string; // 'email' | 'whatsapp'
  language?: "en" | "pt" | "es";
}

interface ApplyResponse {
  ok: true;
  applicationCode: string;
  receivedAt: string;
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

function newApplicationCode(): string {
  const d = new Date();
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9999).toString().padStart(4, "0");
  return `PA-${yy}-${mm}-${rand}`;
}

export async function POST(req: Request): Promise<Response> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!raw || typeof raw !== "object") {
    return NextResponse.json({ error: "Body must be an object" }, { status: 400 });
  }
  const body = raw as ApplyBody;

  // Required fields
  const fullName = body.fullName?.trim();
  const email = body.email?.trim();
  const phone = body.phone?.trim();
  const city = body.city?.trim();
  const portfolio = body.portfolio?.trim();

  const missing: string[] = [];
  if (!fullName) missing.push("fullName");
  if (!email || !email.includes("@")) missing.push("email");
  if (!phone) missing.push("phone");
  if (!city) missing.push("city");
  if (!portfolio) missing.push("portfolio");
  if (missing.length > 0) {
    return NextResponse.json({ error: "Missing required fields", missing }, { status: 422 });
  }

  // Optional fields — normalize defensively (untrusted input).
  const eventTypes = isStringArray(body.eventTypes) ? body.eventTypes : [];
  const equipment = isStringArray(body.equipment) ? body.equipment : [];
  const bigEventExperience = typeof body.bigEventExperience === "boolean" ? body.bigEventExperience : false;
  const bigEventNotes = (body.bigEventNotes ?? "").toString().trim();
  const language = body.language === "en" || body.language === "pt" || body.language === "es" ? body.language : "es";

  const applicationCode = newApplicationCode();
  const receivedAt = new Date().toISOString();

  // Persist to D1. If the binding is somehow absent we still return success
  // and log, so a fan's application is never silently rejected — but we flag
  // it loudly so it shows up in `wrangler tail`.
  const db = await getDB();
  if (db) {
    try {
      await db
        .prepare(
          `INSERT INTO photographer_applications
             (id, code, full_name, first_name, last_name, email, phone, city, portfolio,
              event_types, equipment, big_event_experience, big_event_notes,
              verification, language, user_agent, created_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        )
        .bind(
          newId("pa_"),
          applicationCode,
          fullName,
          body.firstName?.trim() ?? null,
          body.lastName?.trim() ?? null,
          email,
          phone,
          city,
          portfolio,
          JSON.stringify(eventTypes),
          JSON.stringify(equipment),
          bigEventExperience ? 1 : 0,
          bigEventNotes,
          typeof body.verification === "string" ? body.verification : null,
          language,
          req.headers.get("user-agent") ?? null,
          receivedAt,
        )
        .run();
    } catch (err) {
      // No PII in logs (name/email/phone would land in Cloudflare logs) — and
      // fail LOUDLY: pretending success here would silently drop the lead.
      console.error("[photographer-application] D1 insert failed", err, applicationCode);
      return NextResponse.json({ error: "No pudimos guardar tu solicitud. Inténtalo de nuevo." }, { status: 503 });
    }
  } else {
    console.error("[photographer-application] no DB binding", applicationCode);
    return NextResponse.json({ error: "No pudimos guardar tu solicitud. Inténtalo de nuevo." }, { status: 503 });
  }

  // Fire the confirmation email without blocking the response. sendEmail()
  // no-ops gracefully until the domain is onboarded to Email Sending.
  const mail = applicationConfirmationEmail({ name: fullName!, code: applicationCode });
  const send = sendEmail({ to: email!, subject: mail.subject, html: mail.html, text: mail.text });
  try {
    const { ctx } = await getCloudflareContext({ async: true });
    ctx.waitUntil(send);
  } catch {
    void send; // outside CF context (e.g. local) — let it run, errors are swallowed in sendEmail
  }

  const res: ApplyResponse = {
    ok: true,
    applicationCode,
    receivedAt,
  };
  return NextResponse.json(res, { status: 200 });
}

export async function GET(): Promise<Response> {
  return NextResponse.json(
    {
      ok: true,
      service: "fansnap:photographer-application",
      version: "0.1.0",
      note: "POST { fullName, email, phone, city, portfolio, eventTypes[], equipment[], bigEventExperience, bigEventNotes }",
    },
    { status: 200 },
  );
}
