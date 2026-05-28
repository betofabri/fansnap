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
  /** Distance threshold: lower = stricter. Default 0.55. */
  threshold?: number;
  /** Cap on returned matches. Default 60. */
  maxMatches?: number;
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
  const threshold = opts.threshold ?? 0.55;
  const maxMatches = opts.maxMatches ?? 60;

  const [faceapi, index] = await Promise.all([
    (async () => { await ensureModels(); return getFaceApi(); })(),
    getFaceIndex(),
  ]);

  // Detect the selfie's face
  const detectorOpts = new faceapi.TinyFaceDetectorOptions({
    inputSize: 320,
    scoreThreshold: 0.4,
  });
  const selfie = await faceapi
    .detectSingleFace(selfieEl, detectorOpts)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!selfie) {
    return { matches: [], photosScanned: 0, facesScanned: 0, selfieHasFace: false };
  }
  const selfieDesc = Array.from(selfie.descriptor) as Descriptor;

  // Compare against the indexed faces
  const searchSet: Array<[string, Record<string, IndexedFace[]>]> = opts.eventCode
    ? [[opts.eventCode.toLowerCase(), index[opts.eventCode.toLowerCase()] ?? {}]]
    : Object.entries(index);

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
