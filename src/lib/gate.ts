// Server-side launch gate check. Reads the preview cookie so a holder of the
// preview key can browse the full site while it's still gated for the public.
// Reading cookies() opts the calling page into dynamic rendering — fine for
// the gated pages, which don't need static caching pre-launch.

import { cookies } from "next/headers";
import { SITE_LIVE, PREVIEW_KEY, PREVIEW_COOKIE } from "./launch";

export async function siteVisible(): Promise<boolean> {
  if (SITE_LIVE) return true;
  try {
    const jar = await cookies();
    return jar.get(PREVIEW_COOKIE)?.value === PREVIEW_KEY;
  } catch {
    return false;
  }
}
