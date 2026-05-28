#!/usr/bin/env node
/**
 * Build-time face descriptor index.
 *
 * Walks public/mock/events/<code>/*.jpg, runs face-api.js in Node (via the
 * `canvas` package), and emits public/face-index.json mapping every photo
 * to the 128-dim face descriptors of every face detected in it.
 *
 * The browser then loads face-index.json (~1MB or so) on the selfie step,
 * computes the descriptor of the user's selfie, and finds matches in
 * O(N × faces) — all client-side. No selfie ever leaves the device.
 *
 * Run manually: npm run build-face-index
 * Auto-runs before deploy via the package.json prebuild chain.
 */
// Node 24+ removed `util.isNullOrUndefined`, which @tensorflow/tfjs-node
// still relies on. Shim it before face-api / tfjs-node load so the rest
// of the script can use a normal static import flow downstream.
import util from "node:util";
if (typeof util.isNullOrUndefined !== "function") {
  util.isNullOrUndefined = (v) => v === null || v === undefined;
}

import { readdirSync, statSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Dynamic imports so the shim above is in effect when these load.
const faceapi = await import("@vladmandic/face-api");
const canvas  = (await import("canvas")).default;

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const eventsDir = join(root, "public/mock/events");
const modelDir  = join(root, "public/models");
const outFile   = join(root, "public/face-index.json");

// face-api expects a browser-ish Canvas + Image API. canvas package provides it.
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

console.log("Loading face-api models from disk…");
await faceapi.nets.tinyFaceDetector.loadFromDisk(modelDir);
await faceapi.nets.faceLandmark68Net.loadFromDisk(modelDir);
await faceapi.nets.faceRecognitionNet.loadFromDisk(modelDir);
console.log("✓ models loaded");

const detectorOpts = new faceapi.TinyFaceDetectorOptions({
  inputSize: 416,       // good balance of speed/accuracy
  scoreThreshold: 0.4,  // accept slightly weaker detections
});

const events = readdirSync(eventsDir)
  .filter((n) => {
    try { return statSync(join(eventsDir, n)).isDirectory(); } catch { return false; }
  });

// Lossless precision: keep 5 decimals. ~6 chars per float × 128 = ~768B per face.
const round = (v) => Math.round(v * 1e5) / 1e5;

const index = {};
let totalPhotos = 0;
let totalFaces = 0;

for (const code of events) {
  index[code] = {};
  const photos = readdirSync(join(eventsDir, code))
    .filter((n) => /\.(jpe?g|png|webp)$/i.test(n))
    .sort();

  let photoCount = 0;
  let faceCount = 0;

  for (const filename of photos) {
    const path = join(eventsDir, code, filename);
    let img;
    try {
      img = await canvas.loadImage(path);
    } catch (err) {
      console.warn(`  ! could not load ${code}/${filename}: ${err.message}`);
      continue;
    }

    const results = await faceapi
      .detectAllFaces(img, detectorOpts)
      .withFaceLandmarks()
      .withFaceDescriptors();

    photoCount++;
    if (results.length > 0) {
      index[code][filename] = results.map((r) => ({
        box: {
          x: Math.round(r.detection.box.x),
          y: Math.round(r.detection.box.y),
          w: Math.round(r.detection.box.width),
          h: Math.round(r.detection.box.height),
        },
        score: Math.round(r.detection.score * 1000) / 1000,
        descriptor: Array.from(r.descriptor).map(round),
      }));
      faceCount += results.length;
    }
  }

  totalPhotos += photoCount;
  totalFaces += faceCount;
  console.log(`  ${code}: ${photoCount} photos, ${faceCount} faces detected`);
}

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, JSON.stringify(index));

const size = (existsSync(outFile) ? statSync(outFile).size : 0) / 1024;
console.log(
  `\n✓ face-index written: ${totalFaces} faces across ${totalPhotos} photos → ${size.toFixed(0)} KB`,
);
