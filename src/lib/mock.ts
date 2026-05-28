// FanSnap mock data — Fatia 1.5.
// When the real DB is wired (Fatia 2), this file goes away.
// Keep the EventCategory / Event / Photo / Product shapes — they match what the
// API will return so swapping the source is mechanical.

export type EventCategory = "music" | "conventions" | "sports" | "parties";
export type EventStatus = "live" | "upcoming" | "recent";

export interface Event {
  id: number;
  code: string;
  name: string;
  venue: string;
  city: string;
  country: string;
  date: string; // ISO yyyy-mm-dd
  category: EventCategory;
  photoCount: number;
  photogCount: number;
  color: string; // accent + fallback when image unavailable
  initials: string; // overlay over cover image
  status: EventStatus;
  featured?: boolean;
  /** Cover image. Currently picsum.photos seeded by code; replaced by R2-hosted real shots in Fatia 2. */
  image: string;
  /** Larger version for event hero / pass card. */
  imageHero: string;
}

export interface Photo {
  id: number;
  color: string;
  timestamp: string; // HH:MM
  photographer: string;
  /** Placeholder cover; replaced by R2-hosted real shots in Fatia 2. */
  image: string;
}

export interface ProductDef {
  iconKey: "download" | "image" | "shirt" | "coffee" | "frame";
  priceUSD: number;
  fulfillment: number | "instant"; // days or "instant"
  sizes?: readonly string[];
  sizePrices?: readonly number[];
  colors?: readonly { name: string; hex: string }[];
  badge?: "most_popular" | "new_format";
}

// MOCKUP PHOTOS — drop real photos in:
//
//   public/mock/events/<code>/NN.jpg   per-event photo set (preferred)
//                                       1st file = cover, rest = gallery
//   public/mock/events/<code>.jpg      legacy single cover (fallback)
//   public/mock/photos/*.jpg           legacy shared pool (last resort)
//
// `scripts/sync-mock-photos.mjs` (auto-runs before dev/build/deploy)
// scans the folders and emits photo-manifest.ts. Drop files with any
// names — no manual renaming required.
//
// USE_PICSUM_FALLBACK keeps picsum.photos placeholders for any event
// that has no local photos yet — demo never breaks.
import { EVENT_PHOTOS, EVENT_COVERS, PHOTO_FILES } from "./photo-manifest";

const USE_PICSUM_FALLBACK = true;

const pic = (seed: string, w: number, h: number) =>
  `https://picsum.photos/seed/fansnap-${seed}/${w}/${h}`;

/** URL-encode each path segment so spaces / parens / accents work. */
const enc = (fn: string) => fn.split("/").map(encodeURIComponent).join("/");

const eventBase = (code: string) => `/fansnap/mock/events/${code.toLowerCase()}`;

/** Cover photo for an event tile / hero / pass card.
 *  Priority: per-event folder cover → legacy single-file cover → picsum. */
const eventImg = (code: string, w: number, h: number): string => {
  const lc = code.toLowerCase();
  const set = EVENT_PHOTOS[lc];
  if (set && set.length > 0) return `${eventBase(code)}/${enc(set[0])}`;
  const single = EVENT_COVERS[lc];
  if (single) return `/fansnap/mock/events/${enc(single)}`;
  return USE_PICSUM_FALLBACK ? pic(code, w, h) : "";
};

/** N-th photo in the *default* gallery (used when an event has no specific
 *  set yet — keeps the static MOCK_PHOTOS array below working). */
const photoImg = (n: number): string => {
  if (PHOTO_FILES.length > 0) {
    const fn = PHOTO_FILES[(n - 1) % PHOTO_FILES.length];
    return `/fansnap/mock/photos/${enc(fn)}`;
  }
  return USE_PICSUM_FALLBACK ? pic(`photo-${n}`, 800, 1000) : "";
};

/** Per-event gallery — returned to the Gallery component as the scan result.
 *  Uses the photos in public/mock/events/<code>/ (skipping the cover, which
 *  is photo #1). Falls back to MOCK_PHOTOS when an event has no folder. */
export function getPhotosForEvent(code: string): Photo[] {
  const lc = code.toLowerCase();
  const set = EVENT_PHOTOS[lc];
  if (!set || set.length <= 1) return [...MOCK_PHOTOS];

  // skip the first file (it's the cover) → the rest are the gallery
  const gallery = set.slice(1);
  return gallery.map((fn, i) => ({
    id: i + 1,
    color: ["#9D4EFF", "#FF3B6E", "#00B8D4"][i % 3],
    timestamp: photoTimestamp(i),
    photographer: photoCredits[i % photoCredits.length],
    image: `${eventBase(code)}/${enc(fn)}`,
  }));
}

const photoCredits = ["M. Suárez", "C. Reyes", "A. Núñez", "R. Castillo", "L. Fernández"];

/** Spread N photos across an evening (21:30 – 23:55) so the timestamps
 *  feel real on the gallery page. */
function photoTimestamp(index: number): string {
  const startMin = 21 * 60 + 30;
  const endMin = 23 * 60 + 55;
  const step = Math.max(1, Math.floor((endMin - startMin) / Math.max(11, index + 1)));
  const total = startMin + index * step;
  const h = Math.min(23, Math.floor(total / 60));
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export const EVENTS: readonly Event[] = [
  // ── PRIMARY FEATURED (CCXP MX) ───────────────────────────────────────────
  // CCXP México is the anchor event per brief §1 (powered-by-CCXP).
  // Featured first in the hero rotation. Marked as live with a healthy
  // photoCount so the "FIND MY PHOTOS" CTA looks active.
  {
    id: 2, code: "CCXP-26", name: "CCXP México 2026",
    venue: "Centro Banamex", city: "CDMX", country: "MX",
    date: "2026-05-29", category: "conventions",
    photoCount: 24850, photogCount: 12,
    color: "#00B8D4", initials: "CCXP",
    status: "live", featured: true,
    image: eventImg("CCXP-26", 1200, 800),
    imageHero: eventImg("CCXP-26", 1920, 1080),
  },
  // ── SECONDARY FEATURED ───────────────────────────────────────────────────
  {
    id: 1, code: "BB-001", name: "Bad Bunny — Most Wanted Tour",
    venue: "Estadio GNP Seguros", city: "CDMX", country: "MX",
    date: "2026-05-08", category: "music",
    photoCount: 47283, photogCount: 6,
    color: "#9D4EFF", initials: "BB",
    status: "live", featured: true,
    image: eventImg("BB-001", 1200, 800),
    imageHero: eventImg("BB-001", 1920, 1080),
  },
  // ── RECENT ───────────────────────────────────────────────────────────────
  {
    id: 3, code: "RO-014", name: "Rosalía — Motomami World Tour",
    venue: "Foro Sol", city: "CDMX", country: "MX",
    date: "2026-05-04", category: "music",
    photoCount: 38192, photogCount: 5,
    color: "#FF3B6E", initials: "RO",
    status: "recent",
    image: eventImg("RO-014", 1200, 800),
    imageHero: eventImg("RO-014", 1920, 1080),
  },
  {
    id: 4, code: "MX-MTN", name: "Maratón CDMX 2026",
    venue: "Reforma → Estadio Olímpico", city: "CDMX", country: "MX",
    date: "2026-05-02", category: "sports",
    photoCount: 124891, photogCount: 18,
    color: "#00B8D4", initials: "MX",
    status: "recent",
    image: eventImg("MX-MTN", 1200, 800),
    imageHero: eventImg("MX-MTN", 1920, 1080),
  },
  {
    id: 5, code: "CC-26", name: "Corona Capital",
    venue: "Autódromo Hermanos Rodríguez", city: "CDMX", country: "MX",
    date: "2026-05-01", category: "music",
    photoCount: 89421, photogCount: 14,
    color: "#9D4EFF", initials: "CC",
    status: "recent",
    image: eventImg("CC-26", 1200, 800),
    imageHero: eventImg("CC-26", 1920, 1080),
  },
  {
    id: 6, code: "FCJ-22", name: "FC Juárez vs Pumas",
    venue: "Estadio Olímpico", city: "CDMX", country: "MX",
    date: "2026-04-28", category: "sports",
    photoCount: 18402, photogCount: 4,
    color: "#FF3B6E", initials: "FCJ",
    status: "recent",
    image: eventImg("FCJ-22", 1200, 800),
    imageHero: eventImg("FCJ-22", 1920, 1080),
  },
  {
    id: 7, code: "AE-08", name: "Anime Expo Guadalajara",
    venue: "Expo Guadalajara", city: "GDL", country: "MX",
    date: "2026-04-22", category: "conventions",
    photoCount: 28394, photogCount: 8,
    color: "#9D4EFF", initials: "AE",
    status: "recent",
    image: eventImg("AE-08", 1200, 800),
    imageHero: eventImg("AE-08", 1920, 1080),
  },
  // ── UPCOMING ─────────────────────────────────────────────────────────────
  {
    id: 8, code: "EDC-26", name: "EDC México 2026",
    venue: "Autódromo Hermanos Rodríguez", city: "CDMX", country: "MX",
    date: "2026-06-22", category: "music",
    photoCount: 0, photogCount: 16,
    color: "#00B8D4", initials: "EDC",
    status: "upcoming",
    image: eventImg("EDC-26", 1200, 800),
    imageHero: eventImg("EDC-26", 1920, 1080),
  },
  {
    id: 9, code: "LL-26", name: "Lollapalooza México 2026",
    venue: "Foro Sol", city: "CDMX", country: "MX",
    date: "2026-07-12", category: "music",
    photoCount: 0, photogCount: 0,
    color: "#FF3B6E", initials: "LL",
    status: "upcoming",
    image: eventImg("LL-26", 1200, 800),
    imageHero: eventImg("LL-26", 1920, 1080),
  },
];

export const FEATURED_EVENTS = EVENTS.filter((e) => e.featured);
export const RECENT_EVENTS = EVENTS.filter((e) => e.status === "recent" || e.status === "live");
export const UPCOMING_EVENTS = EVENTS.filter((e) => e.status === "upcoming");

export const MOCK_PHOTOS: readonly Photo[] = [
  { id: 1,  color: "#9D4EFF", timestamp: "21:34", photographer: "M. Suárez", image: photoImg(1) },
  { id: 2,  color: "#FF3B6E", timestamp: "21:42", photographer: "M. Suárez", image: photoImg(2) },
  { id: 3,  color: "#00B8D4", timestamp: "21:51", photographer: "C. Reyes",  image: photoImg(3) },
  { id: 4,  color: "#9D4EFF", timestamp: "22:03", photographer: "A. Núñez",  image: photoImg(4) },
  { id: 5,  color: "#FF3B6E", timestamp: "22:18", photographer: "M. Suárez", image: photoImg(5) },
  { id: 6,  color: "#00B8D4", timestamp: "22:27", photographer: "A. Núñez",  image: photoImg(6) },
  { id: 7,  color: "#9D4EFF", timestamp: "22:41", photographer: "C. Reyes",  image: photoImg(7) },
  { id: 8,  color: "#FF3B6E", timestamp: "22:55", photographer: "M. Suárez", image: photoImg(8) },
  { id: 9,  color: "#00B8D4", timestamp: "23:08", photographer: "A. Núñez",  image: photoImg(9) },
  { id: 10, color: "#9D4EFF", timestamp: "23:21", photographer: "M. Suárez", image: photoImg(10) },
  { id: 11, color: "#FF3B6E", timestamp: "23:34", photographer: "C. Reyes",  image: photoImg(11) },
  { id: 12, color: "#00B8D4", timestamp: "23:48", photographer: "A. Núñez",  image: photoImg(12) },
];

// Prices below are USD; converted to MXN on display via MXN_RATE.
// Final SKU pricing (FanSnap brief §4) ships in Fatia 3 alongside the cart.
export const PRODUCTS: Record<string, ProductDef> = {
  digital: { iconKey: "download", priceUSD: 8, fulfillment: "instant", badge: "most_popular" },
  print:   { iconKey: "image",    priceUSD: 18, fulfillment: 5, sizes: ["20×30cm", "30×45cm", "40×60cm"], sizePrices: [18, 28, 42] },
  tshirt:  { iconKey: "shirt",    priceUSD: 32, fulfillment: 7, sizes: ["S", "M", "L", "XL", "XXL"], colors: [{ name: "BLACK", hex: "#0A0A0F" }, { name: "WHITE", hex: "#F5F5F7" }, { name: "PURPLE", hex: "#9D4EFF" }] },
  mug:     { iconKey: "coffee",   priceUSD: 22, fulfillment: 6, badge: "new_format" },
  canvas:  { iconKey: "frame",    priceUSD: 65, fulfillment: 10, sizes: ["30×40cm", "50×70cm", "70×100cm"], sizePrices: [65, 110, 180] },
};

export const MXN_RATE = 18.5;
