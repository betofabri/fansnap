// POST /api/photographers/refer
//
// Sister to /api/photographers/apply — accepts a referral where the sender
// (an existing or prospective member of the roster) recommends someone else.
// Same shape style as the apply endpoint: validate, log, return a protocol
// code so the UI can display a confirmation.
//
// Doc: src/components/AplicaLanding.tsx → ReferModal

import { NextResponse } from "next/server";

export const runtime = "nodejs";

interface ReferBody {
  referrerEmail?: string;
  referredName?: string;
  referredContact?: string;     // email or phone/whatsapp
  referredPortfolio?: string;   // optional URL or @handle
  note?: string;
  language?: "en" | "pt" | "es";
}

function newReferralCode(): string {
  const d = new Date();
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9999).toString().padStart(4, "0");
  return `RF-${yy}-${mm}-${rand}`;
}

export async function POST(req: Request): Promise<Response> {
  let raw: unknown;
  try { raw = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!raw || typeof raw !== "object") {
    return NextResponse.json({ error: "Body must be an object" }, { status: 400 });
  }
  const body = raw as ReferBody;

  const referrerEmail = body.referrerEmail?.trim();
  const referredName = body.referredName?.trim();
  const referredContact = body.referredContact?.trim();

  const missing: string[] = [];
  if (!referrerEmail || !referrerEmail.includes("@")) missing.push("referrerEmail");
  if (!referredName) missing.push("referredName");
  if (!referredContact) missing.push("referredContact");
  if (missing.length > 0) {
    return NextResponse.json({ error: "Missing required fields", missing }, { status: 422 });
  }

  const referredPortfolio = body.referredPortfolio?.trim() ?? "";
  const note = body.note?.trim() ?? "";
  const language = body.language === "en" || body.language === "pt" || body.language === "es" ? body.language : "es";

  const referralCode = newReferralCode();

  // TODO Fatia 3: insert into D1 `photographer_referrals` + queue email to
  // the referred photographer with a personal invite link.
  console.log("[photographer-referral]", JSON.stringify({
    referralCode,
    referrerEmail,
    referredName,
    referredContact,
    referredPortfolio,
    note,
    language,
    receivedAt: new Date().toISOString(),
  }));

  return NextResponse.json({
    ok: true,
    referralCode,
    receivedAt: new Date().toISOString(),
  }, { status: 200 });
}

export async function GET(): Promise<Response> {
  return NextResponse.json(
    {
      ok: true,
      service: "fansnap:photographer-referral",
      version: "0.1.0",
      note: "POST { referrerEmail, referredName, referredContact, referredPortfolio?, note? }",
    },
    { status: 200 },
  );
}
