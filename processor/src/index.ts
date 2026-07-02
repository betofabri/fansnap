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
import stampPng from "./assets/wm-stamp.png";

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

async function processPhoto(env: Env, photoId: string): Promise<void> {
  const row = await env.DB
    .prepare(
      `SELECT p.id, p.r2_key, p.status, p.event_id, e.code
       FROM photos p JOIN events e ON e.id = p.event_id
       WHERE p.id = ?`,
    )
    .bind(photoId)
    .first<{ id: string; r2_key: string; status: string | null; event_id: string; code: string }>();
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

  // 2. Pill no canto inferior direito (~28% da largura, alpha pré-cozido no PNG).
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

  // 3. Carimbo central ultra-sutil (~60% da largura) — evidência de marca
  //    mesmo se o pill for cortado.
  const stampSrc = PhotonImage.new_from_byteslice(new Uint8Array(stampPng));
  const stampW = Math.max(60, Math.round(pw * 0.6));
  const stampH = Math.max(17, Math.round(stampSrc.get_height() * (stampW / stampSrc.get_width())));
  const stamp = resize(stampSrc, stampW, stampH, SamplingFilter.Lanczos3);
  stampSrc.free();
  if (stamp.get_width() < pw && stamp.get_height() < ph) {
    watermark(img, stamp, BigInt(Math.round((pw - stamp.get_width()) / 2)), BigInt(Math.round((ph - stamp.get_height()) / 2)));
  }
  stamp.free();

  const jpeg = img.get_bytes_jpeg(82);
  img.free();

  const previewKey = `previews/${row.code}/${row.id}.jpg`;
  await env.PHOTOS.put(previewKey, jpeg, { httpMetadata: { contentType: "image/jpeg" } });

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
