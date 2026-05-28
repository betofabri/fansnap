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

// MOCKUP PHOTOS — two ways to use real photos from your machine:
//
//   1) PER-EVENT cover:  public/mock/events/<event-code-lowercase>.jpg
//      e.g. public/mock/events/ccxp-26.jpg becomes the CCXP México tile.
//
//   2) GALLERY photos:   public/mock/photos/<n>.jpg   for n = 1..12
//      e.g. public/mock/photos/3.jpg becomes the 3rd photo in the scan
//      result.
//
// Drop ANY format (jpg, png, webp). Keep width <= 1600px so the page
// stays fast. When a file is missing, the colored fallback tile
// (event.color) shows through underneath — no broken-image icon.
//
// USE_LOCAL_MOCKS toggle: set to true once you've dropped real files.
// When false (default for the live demo), picsum.photos is used so we
// always have *something* showing.
const USE_LOCAL_MOCKS = true;

const eventImg = (code: string, w: number, h: number): string =>
  USE_LOCAL_MOCKS
    ? `/fansnap/mock/events/${code.toLowerCase()}.jpg`
    : pic(code, w, h);

const photoImg = (n: number): string =>
  USE_LOCAL_MOCKS
    ? `/fansnap/mock/photos/${n}.jpg`
    : pic(`photo-${n}`, 800, 1000);

// Picsum.photos = deterministic placeholder per `seed/{code}` pair —
// used as fallback and for the highlight tiles inside event pages.
const pic = (seed: string, w: number, h: number) => `https://picsum.photos/seed/fansnap-${seed}/${w}/${h}`;

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
