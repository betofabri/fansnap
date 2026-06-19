// GET /api/preview?key=<PREVIEW_KEY>  → drop the preview cookie, redirect home
// GET /api/preview?off=1              → clear the preview cookie
// GET /api/preview?key=...&to=/fotografos → redirect somewhere specific
//
// Lets the team browse the full site while SITE_LIVE is false. The cookie is
// httpOnly and read server-side by src/lib/gate.ts → siteVisible().

import { NextResponse } from "next/server";
import { PREVIEW_KEY, PREVIEW_COOKIE } from "@/lib/launch";

export const runtime = "nodejs";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

function safeTarget(to: string | null): string {
  // Only allow same-app relative paths; default to the fan home.
  if (to && to.startsWith("/fansnap")) return to;
  return "/fansnap";
}

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  const off = url.searchParams.get("off");
  const target = safeTarget(url.searchParams.get("to"));

  const res = NextResponse.redirect(new URL(target, url.origin));

  if (off !== null) {
    res.cookies.set(PREVIEW_COOKIE, "", { path: "/", maxAge: 0 });
    return res;
  }

  if (key === PREVIEW_KEY) {
    res.cookies.set(PREVIEW_COOKIE, PREVIEW_KEY, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: THIRTY_DAYS,
    });
    return res;
  }

  // Wrong/empty key → bounce to the public coming-soon home, no cookie set.
  return res;
}
