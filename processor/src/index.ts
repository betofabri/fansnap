// FanSnap processor — queue consumer (Fase 2a).
//
// Job {photoId}: pega o original em R2, gera o preview público com marca
// d'água (resize p/ 1600px + pill "fanSnap · preview" no canto + carimbo
// central sutil — mesmo estilo do process-photos.mjs de build), grava em
// previews/<CODE>/<id>.jpg e publica a foto. Idempotente: redelivery de uma
// foto já publicada é ack sem efeito. O original em originals/ NUNCA é
// tocado nem exposto.
//
// Fase 2b (face descriptors → photo_faces) roda em Container Node — até lá
// face_indexed fica 0 e o match usa só eventos mock.

import { PhotonImage, SamplingFilter, resize, watermark } from "@cf-wasm/photon";
import pillPng from "./assets/wm-pill.png";
import tileSuave from "./assets/wm-tile-suave.png";
import tileMedia from "./assets/wm-tile-media.png";
import tileForte from "./assets/wm-tile-forte.png";

// Nível por evento (events.watermark_level, editável na ficha do admin):
// tile pré-rendido em 3 intensidades + densidade da grade (divisor menor =
// tiles maiores e mais próximos = mais marcada).
const WM_LEVELS: Record<string, { tile: ArrayBuffer; divisor: number }> = {
  suave: { tile: tileSuave, divisor: 3.4 },
  media: { tile: tileMedia, divisor: 2.9 },
  forte: { tile: tileForte, divisor: 2.35 },
};

interface Env {
  DB: D1Database;
  PHOTOS: R2Bucket;
}
interface Job {
  photoId: string;
}

const PREVIEW_EDGE = 1600; // px, lado maior do preview público

export default {
  async queue(batch: MessageBatch<Job>, env: Env): Promise<void> {
    for (const msg of batch.messages) {
      try {
        await processPhoto(env, msg.body.photoId);
        msg.ack();
      } catch (err) {
        console.error("[processor] failed", msg.body.photoId, err);
        msg.retry({ delaySeconds: 60 });
      }
    }
  },
} satisfies ExportedHandler<Env, Job>;

const PIPELINE_VERSION = "wm-v3";

async function processPhoto(env: Env, photoId: string): Promise<void> {
  console.log(`[processor] ${PIPELINE_VERSION}`, photoId);
  const row = await env.DB
    .prepare(
      `SELECT p.id, p.r2_key, p.status, p.event_id, e.code, e.watermark_level
       FROM photos p JOIN events e ON e.id = p.event_id
       WHERE p.id = ?`,
    )
    .bind(photoId)
    .first<{ id: string; r2_key: string; status: string | null; event_id: string; code: string; watermark_level: string | null }>();
  if (!row) return;                       // foto apagada — ack e segue
  if (row.status !== "processing") return; // já publicada/rejeitada — idempotente

  const obj = await env.PHOTOS.get(row.r2_key);
  if (!obj) throw new Error("original_missing"); // retry — upload pode estar chegando

  const bytes = new Uint8Array(await obj.arrayBuffer());
  let img = PhotonImage.new_from_byteslice(bytes);

  // 1. Resize para o lado maior = 1600px (nunca amplia).
  const w = img.get_width();
  const h = img.get_height();
  const scale = Math.min(1, PREVIEW_EDGE / Math.max(w, h));
  if (scale < 1) {
    const resized = resize(img, Math.round(w * scale), Math.round(h * scale), SamplingFilter.Lanczos3);
    img.free();
    img = resized;
  }
  const pw = img.get_width();
  const ph = img.get_height();

  // 2. Trama diagonal proprietária cobrindo o quadro inteiro (estilo agência):
  //    wordmarks rotacionados, alpha visível, com fantasma escuro pra ler em
  //    áreas claras. Grade escalonada — recortar um pedaço da foto ainda leva
  //    marca. Intensidade + densidade vêm do nível do evento.
  const level = WM_LEVELS[row.watermark_level ?? "forte"] ?? WM_LEVELS.forte;
  const tileSrc = PhotonImage.new_from_byteslice(new Uint8Array(level.tile));
  const tileW = Math.max(160, Math.round(pw / level.divisor));
  const tileH = Math.max(110, Math.round(tileSrc.get_height() * (tileW / tileSrc.get_width())));
  const tile = resize(tileSrc, tileW, tileH, SamplingFilter.Lanczos3);
  tileSrc.free();
  if (tile.get_width() <= pw && tile.get_height() <= ph) {
    const tw = tile.get_width();
    const th = tile.get_height();
    let rowIdx = 0;
    for (let y = 0; ; y += th) {
      const yy = Math.min(y, ph - th); // última linha ancora rente à borda
      // Meio-tile de deslocamento em linhas alternadas quebra o alinhamento.
      const startX = rowIdx % 2 === 0 ? 0 : -Math.round(tw / 2);
      for (let x = startX; ; x += tw) {
        const xx = Math.min(Math.max(0, x), pw - tw);
        watermark(img, tile, BigInt(xx), BigInt(yy));
        if (xx >= pw - tw) break; // coluna de borda desenhada — linha completa
      }
      if (yy >= ph - th) break;   // linha de borda desenhada — quadro coberto
      rowIdx += 1;
    }
  }
  tile.free();

  // 3. Pill no canto inferior direito (~28% da largura, alpha pré-cozido no PNG).
  const pillSrc = PhotonImage.new_from_byteslice(new Uint8Array(pillPng));
  const pillW = Math.max(120, Math.round(pw * 0.28));
  const pillH = Math.max(22, Math.round(pillSrc.get_height() * (pillW / pillSrc.get_width())));
  const pill = resize(pillSrc, pillW, pillH, SamplingFilter.Lanczos3);
  pillSrc.free();
  const margin = Math.max(8, Math.round(pw * 0.02));
  if (pill.get_width() + margin < pw && pill.get_height() + margin < ph) {
    watermark(img, pill, BigInt(pw - pill.get_width() - margin), BigInt(ph - pill.get_height() - margin));
  }
  pill.free();

  const jpeg = img.get_bytes_jpeg(82);
  img.free();

  // Versioned key: re-watermarking a photo writes a NEW object (and D1 points
  // at it), so stale CDN/browser caches of the old preview can't linger.
  const previewKey = `previews/${row.code}/${row.id}.${PIPELINE_VERSION}.jpg`;
  await env.PHOTOS.put(previewKey, jpeg, { httpMetadata: { contentType: "image/jpeg" } });
  console.log(`[processor] wrote ${previewKey} (${jpeg.length} bytes)`);

  // Publica só se ainda estiver 'processing' (guarda contra corrida de
  // redelivery); o photo_count denormalizado só incrementa quando o flip
  // realmente aconteceu.
  const res = await env.DB
    .prepare(`UPDATE photos SET status = 'published', watermarked = 1, r2_thumb_key = ? WHERE id = ? AND status = 'processing'`)
    .bind(previewKey, photoId)
    .run();
  if (res.meta.changes > 0) {
    await env.DB
      .prepare(`UPDATE events SET photo_count = photo_count + 1, updated_at = datetime('now') WHERE id = ?`)
      .bind(row.event_id)
      .run();
  }
}
