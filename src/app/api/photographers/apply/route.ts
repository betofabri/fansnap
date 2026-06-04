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

export const runtime = "nodejs";

interface ApplyBody {
  fullName?: string;
  email?: string;
  phone?: string;
  city?: string;
  portfolio?: string;
  eventTypes?: string[];
  equipment?: string[];
  bigEventExperience?: boolean;
  bigEventNotes?: string;
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

  // TODO Fatia 3: insert into D1 `photographer_applications` + queue email.
  // For now we just write to the worker log so we can spot-check incoming
  // applications in `wrangler tail`.
  console.log("[photographer-application]", JSON.stringify({
    applicationCode,
    fullName,
    email,
    phone,
    city,
    portfolio,
    eventTypes,
    equipment,
    bigEventExperience,
    bigEventNotes,
    language,
    receivedAt: new Date().toISOString(),
  }));

  const res: ApplyResponse = {
    ok: true,
    applicationCode,
    receivedAt: new Date().toISOString(),
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
