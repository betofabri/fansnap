// Server-side launch gate check. Reads the preview cookie so a holder of the
// preview key can browse the full site while it's still gated for the public.
// Reading cookies() opts the calling page into dynamic rendering — fine for
// the gated pages, which don't need static caching pre-launch.
//
// The preview key is a Worker secret (env.PREVIEW_KEY — set with
// `wrangler secret put PREVIEW_KEY`, mirrored in .dev.vars for `next dev`).
// It used to be a hardcoded constant, but the repo is public, so anyone could
// read it and unlock the site pre-launch. Fail closed: no secret → no preview.

import { cookies } from "next/headers";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { SITE_LIVE, PREVIEW_COOKIE } from "./launch";

/** The preview key from the Worker secret, or null outside a CF context. */
export async function getPreviewKey(): Promise<string | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const key = (env as unknown as Record<string, unknown>).PREVIEW_KEY;
    return typeof key === "string" && key.length > 0 ? key : null;
  } catch {
    return null; // build time / outside a request context
  }
}

/** True when this request carries a valid preview cookie (regardless of SITE_LIVE).
 *  Used by internal-only pages (/mapa) that must stay gated even after launch. */
export async function hasPreviewCookie(): Promise<boolean> {
  try {
    const key = await getPreviewKey();
    if (!key) return false;
    const jar = await cookies();
    return jar.get(PREVIEW_COOKIE)?.value === key;
  } catch {
    return false;
  }
}

export async function siteVisible(): Promise<boolean> {
  if (SITE_LIVE) return true;
  return hasPreviewCookie();
}
