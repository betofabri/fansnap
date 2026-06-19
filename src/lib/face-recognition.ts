/**
 * Browser-side face recognition for FanSnap.
 *
 * - Lazy-loads @vladmandic/face-api + 3 model files (~6.7 MB total) on first
 *   use. Cached by the browser thereafter.
 * - Loads the build-time face-index.json that pairs each event photo with
 *   the 128-dim descriptors of every face we detected in it.
 * - Computes the descriptor of the user's selfie and returns the matches.
 *
 * Everything runs in the browser — the selfie never leaves the device
 * (per FanSnap brief §6, LFPDPPP/GDPR-aligned by design).
 */

// Pull the type-only module surface in eagerly; the *implementation* is
// loaded dynamically below so the worker bundle doesn't ship 6 MB of
// neural net weights to people who never run a scan.
import type * as FaceApi from "@vladmandic/face-api";

// face-api `descriptor` is a Float32Array of length 128. We persist as
// plain number[] in face-index.json so JSON.parse works without massaging.
export type Descriptor = readonly number[];

export interface IndexedFace {
  /** Bounding box on the source photo (in source pixels). */
  box: { x: number; y: number; w: number; h: number };
  /** Detection confidence (0-1). */
  score: number;
  descriptor: Descriptor;
}

/** Face index: { eventCode: { filename: [face, face, ...] } }. */
export type FaceIndex = Record<string, Record<string, IndexedFace[]>>;

export interface PhotoMatch {
  eventCode: string;
  filename: string;
  url: string;
  /** L2 distance, 0..√2. < 0.5 = strong match, < 0.6 = match, > 0.7 = none. */
  distance: number;
  /** 1 - distance, displayed as % to fans. */
  similarity: number;
}

// ─── module-level state (one-shot loads) ────────────────────────────────────

let faceapiPromise: Promise<typeof FaceApi> | null = null;
let modelsLoadedPromise: Promise<void> | null = null;
let indexPromise: Promise<FaceIndex> | null = null;

const BASE_PATH = "/fansnap";
const MODEL_URL = `${BASE_PATH}/models`;
const INDEX_URL = `${BASE_PATH}/face-index.json`;

/** Load the @vladmandic/face-api ESM bundle on demand. */
async function getFaceApi(): Promise<typeof FaceApi> {
  if (!faceapiPromise) {
    // dynamic import → code-split: ~600 KB JS only loaded when scan starts
    faceapiPromise = import("@vladmandic/face-api") as Promise<typeof FaceApi>;
  }
  return faceapiPromise;
}

/** Load the 3 model files (~6.7 MB) from /public/models/. */
async function ensureModels(): Promise<void> {
  if (modelsLoadedPromise) return modelsLoadedPromise;
  modelsLoadedPromise = (async () => {
    const faceapi = await getFaceApi();
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
  })();
  return modelsLoadedPromise;
}

/** Load (and cache) the static face index JSON. */
async function getFaceIndex(): Promise<FaceIndex> {
  if (!indexPromise) {
    indexPromise = fetch(INDEX_URL, { cache: "force-cache" })
      .then((r) => {
        if (!r.ok) throw new Error(`face-index.json HTTP ${r.status}`);
        return r.json() as Promise<FaceIndex>;
      });
  }
  return indexPromise;
}

/** Kick off all three downloads in parallel — useful to call when the user
 *  lands on the selfie screen so the spinner has less to wait for. */
export async function prefetchFaceModels(): Promise<void> {
  void ensureModels();
  void getFaceIndex();
}

/** L2 (Euclidean) distance between two 128-dim descriptors. */
function l2distance(a: Descriptor, b: Descriptor): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    s += d * d;
  }
  return Math.sqrt(s);
}

/** Encode a filename for use inside a URL path. */
const enc = (fn: string) => fn.split("/").map(encodeURIComponent).join("/");

export interface ScanOptions {
  /** Only return matches within this event code (case-insensitive). When
   *  omitted, searches across every event in the index. */
  eventCode?: string;
  /** Distance threshold: lower = stricter. Default 0.6.
   *  face-api's reference FaceMatcher uses 0.6; for event photos we favour
   *  recall (fans want to find their shots) so we keep that. */
  threshold?: number;
  /** Cap on returned matches. Default 60. */
  maxMatches?: number;
}

/** Width/height of any element face-api can read, normalized. */
function dimsOf(el: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement): { w: number; h: number } {
  if (el instanceof HTMLVideoElement) return { w: el.videoWidth, h: el.videoHeight };
  if (el instanceof HTMLImageElement) return { w: el.naturalWidth || el.width, h: el.naturalHeight || el.height };
  return { w: el.width, h: el.height };
}

/** Return a horizontally-flipped canvas copy of the element. Used to make
 *  matching mirror-invariant: front-camera selfies are often mirrored (and
 *  our capture canvas also mirrors for UX), but the catalog photos are not.
 *  Face descriptors are NOT flip-invariant, so we detect on both orientations
 *  and keep the closer match. */
function flipHorizontally(
  el: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
): HTMLCanvasElement | null {
  const { w, h } = dimsOf(el);
  if (!w || !h) return null;
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext("2d");
  if (!ctx) return null;
  ctx.translate(w, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(el, 0, 0, w, h);
  return cv;
}

export interface ScanResult {
  /** All matches sorted by ascending distance (closest first). */
  matches: PhotoMatch[];
  /** Total photos compared (across the entire searched set). */
  photosScanned: number;
  /** Number of faces compared across all photos. */
  facesScanned: number;
  /** Whether we successfully found a face in the selfie. */
  selfieHasFace: boolean;
}

/**
 * Run the full pipeline against an HTMLImageElement / HTMLVideoElement /
 * HTMLCanvasElement of the user's selfie.
 *
 * Returns matches sorted by ascending distance (best match first).
 */
export async function scanSelfie(
  selfieEl: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
  opts: ScanOptions = {},
): Promise<ScanResult> {
  // 0.50: a person's own photos sit well below this (CCXP match ~0.07-0.3);
  // look-alike strangers start ~0.56. The tighter bar matters most when the
  // fan ISN'T in an event — we'd rather show "no matches" than a few similar
  // strangers (the FF-26 case, where Beto simply wasn't in the photos). If real
  // matches ever get missed, dial back toward 0.55. See scripts/diagnose-match.mjs.
  const threshold = opts.threshold ?? 0.5;
  const maxMatches = opts.maxMatches ?? 60;

  const [faceapi, index] = await Promise.all([
    (async () => { await ensureModels(); return getFaceApi(); })(),
    getFaceIndex(),
  ]);

  // Match the index builder's detector settings (inputSize 416) so the selfie
  // descriptor is produced under the same conditions as the catalog faces.
  // A lower scoreThreshold helps when the selfie is poorly lit / off-angle.
  const detectorOpts = new faceapi.TinyFaceDetectorOptions({
    inputSize: 416,
    scoreThreshold: 0.3,
  });

  // Detect on the selfie AND on a horizontally-flipped copy, then keep both
  // descriptors. Front-camera selfies are commonly mirrored relative to the
  // (un-mirrored) catalog photos, and descriptors are not flip-invariant —
  // trying both orientations and keeping the closer one removes that whole
  // class of misses.
  const selfieDescs: Descriptor[] = [];
  const original = await faceapi
    .detectSingleFace(selfieEl, detectorOpts)
    .withFaceLandmarks()
    .withFaceDescriptor();
  if (original) selfieDescs.push(Array.from(original.descriptor) as Descriptor);

  const flipped = flipHorizontally(selfieEl);
  if (flipped) {
    const flippedFace = await faceapi
      .detectSingleFace(flipped, detectorOpts)
      .withFaceLandmarks()
      .withFaceDescriptor();
    if (flippedFace) selfieDescs.push(Array.from(flippedFace.descriptor) as Descriptor);
  }

  if (selfieDescs.length === 0) {
    return { matches: [], photosScanned: 0, facesScanned: 0, selfieHasFace: false };
  }

  // Compare against the indexed faces
  const searchSet: Array<[string, Record<string, IndexedFace[]>]> = opts.eventCode
    ? [[opts.eventCode.toLowerCase(), index[opts.eventCode.toLowerCase()] ?? {}]]
    : Object.entries(index);

  // Pick ONE selfie orientation — the one whose closest catalog face is nearest
  // overall (i.e. the orientation that actually found this person). Matching
  // with the min of both orientations per-face gave every photo two chances and
  // dragged strangers under the threshold (false positives). With the correct
  // orientation chosen once, we compare against it alone.
  let selfieDesc = selfieDescs[0];
  if (selfieDescs.length > 1) {
    let bestGlobal = Infinity;
    for (const desc of selfieDescs) {
      let m = Infinity;
      for (const [, photos] of searchSet) {
        for (const faces of Object.values(photos)) {
          for (const face of faces) {
            const d = l2distance(desc, face.descriptor);
            if (d < m) m = d;
          }
        }
      }
      if (m < bestGlobal) { bestGlobal = m; selfieDesc = desc; }
    }
  }

  let photosScanned = 0;
  let facesScanned = 0;
  const matches: PhotoMatch[] = [];

  for (const [eventCode, photos] of searchSet) {
    for (const [filename, faces] of Object.entries(photos)) {
      photosScanned += 1;
      let bestDist = Infinity;
      for (const face of faces) {
        facesScanned += 1;
        const d = l2distance(selfieDesc, face.descriptor);
        if (d < bestDist) bestDist = d;
      }
      if (bestDist <= threshold) {
        matches.push({
          eventCode,
          filename,
          url: `/fansnap/mock/events/${eventCode}/${enc(filename)}`,
          distance: bestDist,
          similarity: Math.max(0, 1 - bestDist),
        });
      }
    }
  }

  matches.sort((a, b) => a.distance - b.distance);
  return {
    matches: matches.slice(0, maxMatches),
    photosScanned,
    facesScanned,
    selfieHasFace: true,
  };
}
