// Sitemap for FanSnap MX. Sitemap `url` entries must be absolute (Next does
// not apply basePath here), so we hard-code the full origin + /fansnap prefix.
// Event detail pages are the main reason this exists — they're the indexable,
// shareable surface for each event; the SPA home can't expose them to crawlers.

import type { MetadataRoute } from "next";
import { EVENTS } from "@/lib/mock";

const BASE = "https://betofabri.com/fansnap";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/fotografos`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/marcas`, changeFrequency: "monthly", priority: 0.8 },
  ];

  const eventPages: MetadataRoute.Sitemap = EVENTS.map((e) => ({
    url: `${BASE}/eventos/${e.code.toLowerCase()}`,
    changeFrequency: "weekly",
    priority: e.featured ? 0.9 : 0.6,
  }));

  return [...staticPages, ...eventPages];
}
