#!/usr/bin/env node
/**
 * Resize + watermark + flatten every photo dropped under
 * public/mock/events/<code>/.
 *
 * Recursive: photos can be dropped in subfolders (e.g. directly drag the
 * Canon SD card folder structure in). The script walks the whole tree,
 * processes every image, moves it to the event-code root with a unique
 * filename, then deletes the empty intermediate directories.
 *
 * Per-photo pipeline:
 *   1. Read the file.
 *   2. If width <= MAX_W AND it's already at the event root, skip (idempotent).
 *   3. Resize to MAX_W keeping aspect ratio (clamped).
 *   4. Paint the FanSnap watermark in the bottom-right corner.
 *   5. Re-encode as 85% JPEG and write to the event root.
 *   6. Delete the original (if it was in a subfolder).
 *
 * After processing each event folder, remove any now-empty subdirectories.
 *
 * Runs as part of prebuild-mocks BEFORE build-face-index, so the index is
 * built against the processed final files.
 */
import {
  readdirSync, statSync, writeFileSync, readFileSync, renameSync, unlinkSync, rmdirSync, existsSync,
} from "node:fs";
import { basename, dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const canvas = (await import("canvas")).default;
const { createCanvas, loadImage } = canvas;

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const eventsDir = join(root, "public/mock/events");

const MAX_W = 1280;
const JPEG_QUALITY = 0.85;
const IMG_RX = /\.(jpe?g|png|webp|avif)$/i;

function listEvents() {
  try {
    return readdirSync(eventsDir).filter((n) => {
      try { return statSync(join(eventsDir, n)).isDirectory(); } catch { return false; }
    });
  } catch { return []; }
}

/** Recursively collect every image file path under `dir`. */
function walkImages(dir) {
  const out = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walkImages(path));
    } else if (IMG_RX.test(entry.name)) {
      out.push(path);
    }
  }
  return out;
}

/** Recursively remove empty directories under `dir` (but not `dir` itself). */
function pruneEmptyDirs(dir) {
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const sub = join(dir, entry.name);
    pruneEmptyDirs(sub);
    try {
      const remaining = readdirSync(sub);
      if (remaining.length === 0) rmdirSync(sub);
    } catch { /* keep going */ }
  }
}

/** Pick a free filename inside `targetDir` based on the desired name,
 *  suffixing -2, -3, ... if there's a collision. */
function uniqueName(targetDir, desired) {
  const ext = extname(desired);
  const base = basename(desired, ext);
  let candidate = `${base}.jpg`; // always normalize to .jpg
  let i = 1;
  while (existsSync(join(targetDir, candidate))) {
    i += 1;
    candidate = `${base}-${i}.jpg`;
  }
  return candidate;
}

/** Paint the bottom-right watermark over the active 2D context. */
function paintWatermark(ctx, w, h, eventCode) {
  const text = `fanSnap · ${eventCode}`;
  const fontPx = Math.max(14, Math.round(w / 80));
  ctx.font = `bold ${fontPx}px "Space Grotesk", "Helvetica Neue", Arial, sans-serif`;

  const metrics = ctx.measureText(text);
  const textW = metrics.width;
  const padX = Math.round(fontPx * 0.7);
  const padY = Math.round(fontPx * 0.45);
  const pillW = textW + padX * 2;
  const pillH = fontPx + padY * 2;
  const margin = Math.round(fontPx * 1.0);

  const x = w - pillW - margin;
  const y = h - pillH - margin;

  ctx.fillStyle = "rgba(10,10,15,0.55)";
  ctx.fillRect(x, y, pillW, pillH);

  ctx.strokeStyle = "rgba(0,229,255,0.45)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x + 0.75, y + 0.75, pillW - 1.5, pillH - 1.5);

  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + padX, y + pillH / 2);

  // Diagonal "© FanSnap" stamp in the centre — ultra-subtle so cropping
  // out the corner pill still leaves brand evidence.
  ctx.save();
  ctx.globalAlpha = 0.07;
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `bold ${Math.round(fontPx * 0.9)}px "Space Grotesk", sans-serif`;
  ctx.translate(w / 2, h / 2);
  ctx.rotate(-Math.PI / 9);
  ctx.textAlign = "center";
  ctx.fillText("© FanSnap", 0, 0);
  ctx.restore();
}

async function processPhoto(srcPath, eventCode, eventRootDir) {
  const inSubfolder = dirname(srcPath) !== eventRootDir;

  let buf;
  try { buf = readFileSync(srcPath); } catch { return { skipped: true, reason: "read" }; }

  let img;
  try { img = await loadImage(buf); } catch { return { skipped: true, reason: "decode" }; }

  // Idempotency: if image is already small AND already at the event root,
  // leave it alone. (Subfolder files still get moved + re-encoded.)
  if (img.width <= MAX_W && !inSubfolder) {
    return { skipped: true, reason: "already-small" };
  }

  const ratio = Math.min(1, MAX_W / img.width);
  const newW = Math.round(img.width * ratio);
  const newH = Math.round(img.height * ratio);

  const c = createCanvas(newW, newH);
  const ctx = c.getContext("2d");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, newW, newH);

  paintWatermark(ctx, newW, newH, eventCode);

  const out = c.toBuffer("image/jpeg", { quality: JPEG_QUALITY });

  // Pick the final destination at the event root with a unique name.
  const desiredName = basename(srcPath);
  const finalName = inSubfolder
    ? uniqueName(eventRootDir, desiredName)
    : basename(srcPath, extname(srcPath)) + ".jpg"; // normalize ext only

  const finalPath = join(eventRootDir, finalName);

  // If we're rewriting in place AND extension is changing (png → jpg etc.),
  // remove the original first so we don't leave duplicates.
  if (!inSubfolder && finalPath !== srcPath) {
    try { unlinkSync(srcPath); } catch { /* keep going */ }
  }

  writeFileSync(finalPath, out);

  // If we pulled the file out of a subfolder, delete the original.
  if (inSubfolder && srcPath !== finalPath) {
    try { unlinkSync(srcPath); } catch { /* keep going */ }
  }

  return {
    skipped: false,
    fromKB: Math.round(buf.length / 1024),
    toKB: Math.round(out.length / 1024),
    fromW: img.width,
    toW: newW,
    movedFrom: inSubfolder ? relative(eventRootDir, srcPath) : null,
  };
}

const events = listEvents();
let totalProcessed = 0;
let totalSkipped = 0;
let totalBytesSaved = 0;

for (const code of events) {
  const eventRootDir = join(eventsDir, code);
  const photos = walkImages(eventRootDir);
  if (photos.length === 0) continue;

  let touched = 0;
  let saved = 0;

  for (const srcPath of photos) {
    const result = await processPhoto(srcPath, code, eventRootDir);
    if (result.skipped) {
      totalSkipped += 1;
    } else {
      touched += 1;
      totalProcessed += 1;
      const delta = result.fromKB - result.toKB;
      saved += delta;
      totalBytesSaved += delta;
    }
  }

  // Clear out the now-empty Canon-card / sub-folders the user dropped.
  pruneEmptyDirs(eventRootDir);

  if (touched > 0) {
    console.log(`  ${code}: processed ${touched}/${photos.length} (saved ~${Math.round(saved / 1024)} MB)`);
  }
}

console.log(
  `✓ process-photos: ${totalProcessed} resized + watermarked + flattened, ` +
  `${totalSkipped} already small, ` +
  `~${Math.round(totalBytesSaved / 1024)} MB freed.`,
);
