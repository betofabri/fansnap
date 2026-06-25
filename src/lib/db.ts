// D1 access helper.
//
// The DB binding is exposed through OpenNext's getCloudflareContext(). We keep
// a minimal D1 surface typed locally so we don't take a hard dependency on
// @cloudflare/workers-types. getDB() returns null when the binding is absent
// (e.g. plain `next dev` without wrangler, or a misconfigured env) so callers
// can degrade gracefully to logging instead of throwing.

import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<{ success: boolean; meta: unknown }>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  first<T = Record<string, unknown>>(colName?: string): Promise<T | null>;
}

export interface D1Like {
  prepare(query: string): D1PreparedStatement;
}

export async function getDB(): Promise<D1Like | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = (env as unknown as Record<string, unknown>).DB;
    return (db as D1Like) ?? null;
  } catch {
    // Outside a Cloudflare request context (build, some dev setups).
    return null;
  }
}

/** Generate a short ULID-ish id (time-sortable, no external dep). Good enough
 *  for primary keys on low-volume intake tables. */
export function newId(prefix = ""): string {
  const ts = Date.now().toString(36);
  let rand = "";
  for (let i = 0; i < 12; i++) rand += Math.floor(Math.random() * 36).toString(36);
  return `${prefix}${ts}${rand}`;
}
