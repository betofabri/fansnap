// Signed, expiring download links (Fase 4 hardening).
//
// The emailed capability now carries an expiry + HMAC signature:
//   /api/download?order=…&line=…&exp=<unix>&sig=<hmac-sha256 hex>
// Tampering with ANY part (order, line, expiry) breaks the signature, and a
// leaked link dies after LINK_TTL. Permanent access lives in /pedidos (and the
// Fase 5 logged area), which mints FRESH signed links on every lookup — the
// expiry is a property of the link, not of the order.
//
// Key: Worker secret DOWNLOAD_KEY (wrangler secret put; .dev.vars in dev).
// Server-only module.

import { getCloudflareContext } from "@opennextjs/cloudflare";

export const LINK_TTL_SECONDS = 24 * 60 * 60; // 24h — decided by Beto

export async function getDownloadKey(): Promise<string | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const k = (env as unknown as Record<string, unknown>).DOWNLOAD_KEY;
    return typeof k === "string" && k.length >= 32 ? k : null;
  } catch { return null; }
}

async function hmacHex(key: string, payload: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Signed relative URL, valid for LINK_TTL_SECONDS from now. */
export async function makeDownloadUrl(key: string, orderId: string, lineId: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + LINK_TTL_SECONDS;
  const sig = await hmacHex(key, `${orderId}:${lineId}:${exp}`);
  return `/fansnap/api/download?order=${encodeURIComponent(orderId)}&line=${encodeURIComponent(lineId)}&exp=${exp}&sig=${sig}`;
}

/** True only when the signature matches AND the link hasn't expired. */
export async function verifyDownload(key: string, orderId: string, lineId: string, exp: string | null, sig: string | null): Promise<"ok" | "expired" | "invalid"> {
  if (!exp || !sig || !/^\d+$/.test(exp)) return "invalid";
  const expected = await hmacHex(key, `${orderId}:${lineId}:${exp}`);
  // Constant-time-ish compare (same length hex strings).
  if (expected.length !== sig.length) return "invalid";
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  if (diff !== 0) return "invalid";
  if (Math.floor(Date.now() / 1000) > Number(exp)) return "expired";
  return "ok";
}
