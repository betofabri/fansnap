// POST /api/brands/contact
//
// Sister to /api/photographers/apply — accepts an inbound lead from a brand
// or agency interested in sponsoring / activating on FanSnap events.
// Mirrors the apply shape: validate, log, return a protocol code.
//
// Doc: src/components/MarcasLanding.tsx → ContactForm

import { NextResponse } from "next/server";
import { getDB, newId } from "@/lib/db";

export const runtime = "nodejs";

interface ContactBody {
  company?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  email?: string;
  phone?: string;
  eventInterest?: string;
  budget?: string;
  message?: string;
  language?: "en" | "pt" | "es";
}

function newLeadCode(): string {
  const d = new Date();
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9999).toString().padStart(4, "0");
  return `BR-${yy}-${mm}-${rand}`;
}

export async function POST(req: Request): Promise<Response> {
  let raw: unknown;
  try { raw = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!raw || typeof raw !== "object") {
    return NextResponse.json({ error: "Body must be an object" }, { status: 400 });
  }
  const body = raw as ContactBody;

  const company = body.company?.trim();
  const fullName = body.fullName?.trim();
  const email = body.email?.trim();
  const message = body.message?.trim();

  const missing: string[] = [];
  if (!company) missing.push("company");
  if (!fullName) missing.push("fullName");
  if (!email || !email.includes("@")) missing.push("email");
  if (!message) missing.push("message");
  if (missing.length > 0) {
    return NextResponse.json({ error: "Missing required fields", missing }, { status: 422 });
  }

  const role = body.role?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const eventInterest = body.eventInterest?.trim() ?? "";
  const budget = body.budget?.trim() ?? "";
  const language = body.language === "en" || body.language === "pt" || body.language === "es"
    ? body.language : "es";

  const leadCode = newLeadCode();
  const receivedAt = new Date().toISOString();

  const db = await getDB();
  if (db) {
    try {
      await db
        .prepare(
          `INSERT INTO brand_leads
             (id, code, company, full_name, first_name, last_name, role, email, phone,
              event_interest, budget, message, language, created_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        )
        .bind(
          newId("br_"),
          leadCode,
          company,
          fullName,
          body.firstName?.trim() ?? null,
          body.lastName?.trim() ?? null,
          role,
          email,
          phone,
          eventInterest,
          budget,
          message,
          language,
          receivedAt,
        )
        .run();
    } catch (err) {
      console.error("[brand-contact-lead] D1 insert failed", err, JSON.stringify({
        leadCode, company, fullName, role, email, phone, eventInterest, budget, message, language, receivedAt,
      }));
    }
  } else {
    console.warn("[brand-contact-lead] no DB binding — logging only", JSON.stringify({
      leadCode, company, fullName, role, email, phone, eventInterest, budget, message, language, receivedAt,
    }));
  }

  return NextResponse.json({
    ok: true,
    leadCode,
    receivedAt,
  }, { status: 200 });
}

export async function GET(): Promise<Response> {
  return NextResponse.json(
    {
      ok: true,
      service: "fansnap:brand-contact",
      version: "0.1.0",
      note: "POST { company, fullName, role?, email, phone?, eventInterest?, budget?, message }",
    },
    { status: 200 },
  );
}
