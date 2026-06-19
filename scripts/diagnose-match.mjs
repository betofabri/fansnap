#!/usr/bin/env node
// Diagnostic: take a query face photo, rank ALL indexed faces by L2 distance.
// Tells us where a known person's real photos fall vs everyone else, so we can
// pick a threshold that separates them. Usage:
//   node scripts/diagnose-match.mjs public/mock/events/ro-014/24.jpg
import util from "node:util";
if (typeof util.isNullOrUndefined !== "function") {
  util.isNullOrUndefined = (v) => v === null || v === undefined;
}
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const faceapi = await import("@vladmandic/face-api");
const canvas  = (await import("canvas")).default;
const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const modelDir = join(root, "public/models");
await faceapi.nets.tinyFaceDetector.loadFromDisk(modelDir);
await faceapi.nets.faceLandmark68Net.loadFromDisk(modelDir);
await faceapi.nets.faceRecognitionNet.loadFromDisk(modelDir);

const queryPath = process.argv[2] || "public/mock/events/ro-014/24.jpg";
const eventFilter = process.argv[3] ? process.argv[3].toLowerCase() : null; // optional event-code filter
const index = JSON.parse(readFileSync(join(root, "public/face-index.json"), "utf8"));

const l2 = (a, b) => { let s = 0; for (let i = 0; i < a.length; i++) { const d = a[i] - b[i]; s += d * d; } return Math.sqrt(s); };

const img = await canvas.loadImage(join(root, queryPath));
const det = new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.3 });
const q = await faceapi.detectSingleFace(img, det).withFaceLandmarks().withFaceDescriptor();
if (!q) { console.log("No face in query:", queryPath); process.exit(1); }
const qd = Array.from(q.descriptor);

const rows = [];
for (const [code, photos] of Object.entries(index)) {
  if (eventFilter && code.toLowerCase() !== eventFilter) continue;
  for (const [fn, faces] of Object.entries(photos))
    for (const f of faces) rows.push({ code, fn, d: l2(qd, f.descriptor) });
}

rows.sort((a, b) => a.d - b.d);
console.log(`\nQuery: ${queryPath}`);
console.log(`Indexed faces: ${rows.length}\n`);
console.log("Top 30 closest (lower = more similar):");
for (const r of rows.slice(0, 30)) {
  const bar = "█".repeat(Math.max(0, Math.round((0.8 - r.d) * 25)));
  console.log(`  ${r.d.toFixed(3)}  ${(r.code + "/" + r.fn).padEnd(28)} ${bar}`);
}
// Distance distribution buckets
const buckets = { "<0.40": 0, "0.40-0.50": 0, "0.50-0.55": 0, "0.55-0.60": 0, "0.60-0.70": 0, ">0.70": 0 };
for (const r of rows) {
  if (r.d < 0.40) buckets["<0.40"]++;
  else if (r.d < 0.50) buckets["0.40-0.50"]++;
  else if (r.d < 0.55) buckets["0.50-0.55"]++;
  else if (r.d < 0.60) buckets["0.55-0.60"]++;
  else if (r.d < 0.70) buckets["0.60-0.70"]++;
  else buckets[">0.70"]++;
}
console.log("\nDistribution:", JSON.stringify(buckets));
