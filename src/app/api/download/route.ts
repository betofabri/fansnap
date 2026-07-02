// Original delivery — Fase 4.
// GET ?order=ord_<capability>&line=<lineId>
//   Valida que o pedido está pago e que a linha pertence a ele, então entrega:
//   - foto real (ph_…):   stream do ORIGINAL limpo em R2 (originals/…) com
//                          Content-Disposition attachment;
//   - item mock (phm_…):  redirect pro asset público de demo (o catálogo demo
//                          não tem original limpo no servidor — limitação
//                          honesta até os eventos reais).
// Sem gate de preview: o order id criptográfico É a credencial (links do email
// precisam funcionar em qualquer dispositivo). Não expira por ora — re-download
// é um recurso do produto; auth de fã (Fase 5) endurece isso.

import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getDB } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface R2GetLike {
  get(key: string): Promise<{ body: ReadableStream; httpMetadata?: { contentType?: string } } | null>;
}

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("order")?.trim();
  const lineId = url.searchParams.get("line")?.trim();
  if (!orderId?.startsWith("ord_") || !lineId) {
    return NextResponse.json({ error: "order and line required" }, { status: 400 });
  }

  const db = await getDB();
  if (!db) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
  try {
    const row = await db
      .prepare(
        `SELECT o.status, p.id AS photo_id, p.r2_key
         FROM orders o
         JOIN order_lines ol ON ol.order_id = o.id AND ol.id = ?
         JOIN photos p ON p.id = ol.photo_id
         WHERE o.id = ?`,
      )
      .bind(lineId, orderId)
      .first<{ status: string; photo_id: string; r2_key: string }>();
    if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });
    if (row.status !== "paid" && row.status !== "fulfilled") {
      return NextResponse.json({ error: "order_not_paid" }, { status: 402 });
    }

    if (row.r2_key.startsWith("mock:")) {
      return NextResponse.redirect(new URL(row.r2_key.slice(5), url.origin), 302);
    }

    const { env } = await getCloudflareContext({ async: true });
    const bucket = (env as unknown as Record<string, unknown>).PHOTOS as R2GetLike | undefined;
    const obj = bucket ? await bucket.get(row.r2_key) : null;
    if (!obj) return NextResponse.json({ error: "file_missing" }, { status: 404 });

    const filename = row.r2_key.split("/").pop() ?? "foto.jpg";
    return new Response(obj.body, {
      headers: {
        "Content-Type": obj.httpMetadata?.contentType ?? "image/jpeg",
        "Content-Disposition": `attachment; filename="fansnap-${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("[download] failed", err);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
