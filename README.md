# FanSnap

> _You were there. We have the proof._
> The memory layer of live entertainment — facial-recognition photo platform for concerts, conventions, festivals and sports.

**Status:** Fatia 1 — public site navigable end-to-end with mock data, deployed to Cloudflare Workers.
**Owner:** Beto Fabri (VP Content, CCXP / Omelete Company).
**Launch market:** Mexico (CDMX first), multi-country LATAM later.

---

## What's in here right now

| Surface | State |
|---|---|
| Homepage (hero + featured event pass card + recent/upcoming feeds + categories + search) | ✅ |
| Event page (hero, stats strip, highlights grid, scan CTA) | ✅ |
| Selfie step (upload + biometric consent + face-detection reticle) | ✅ |
| Scanning (radar animation + counter + phase labels) | ✅ (cosmetic timer — Rekognition lands in Fatia 3) |
| Gallery (12 mock photos, multi-select, timestamps, watermark) | ✅ |
| Photo detail + 5 product cards with size/color/qty | ✅ |
| EN/PT/ES + dark/light toggle + mobile responsive | ✅ |
| `/api/scan` stub returning mock matches | ✅ |
| D1 schema for the 3 business models + commission tiers (`db/schema.sql`) | ✅ drafted, not wired |
| Cart + checkout (Stripe + Conekta/OXXO) | ⏳ Fatia 3 |
| Photographer & admin dashboards | ⏳ Fatia 4 |

See the project brief (`fansnap-context.md`, kept separately) for the full product context — business models, pricing, design system, financials.

---

## Stack

- **Next.js 16.2.6** (App Router, Turbopack, React 19.2) — no Tailwind, inline styles preserve the brutalist design system 1:1 with the validated prototype.
- **Cloudflare Workers** via **`@opennextjs/cloudflare`** with Workers Static Assets. (Cloudflare Pages is being aged out for Next.js — Workers is the supported path.)
- **D1** (Cloudflare SQLite) for the database — schema drafted at `db/schema.sql`, binding stubbed in `wrangler.jsonc`.
- **R2** for photo storage (Fatia 2 — requires adding R2 scope to the deploy token; currently not in scope).
- **AWS Rekognition** planned for face matching (Fatia 3, per brief §6).
- **Stripe Connect + Conekta/OXXO** for the dual-rail payment architecture (Fatia 3).
- **Space Grotesk + JetBrains Mono** via `next/font/google`. Lucide icons.

---

## Local development

```bash
# Standard Next dev server (port 3000, hot reload, no Worker runtime)
npm run dev

# Worker-runtime preview — builds with OpenNext + runs in wrangler (closer to prod)
npm run preview
```

`npm run dev` is the fast path for UI iteration. Use `npm run preview` before pushing if you've touched anything that depends on the Cloudflare runtime (bindings, env vars, the `/api/scan` route).

## Deploy

```bash
# Production deploy to Cloudflare Workers
npm run deploy
```

This runs the OpenNext build, then `wrangler deploy`. The worker is reachable at `https://fansnap.<your-cf-subdomain>.workers.dev` (and any custom domain bound to it).

The Cloudflare token currently used has scopes for D1, Pages, Workers, KV, Workers AI, Queues, Email, and Browser. **R2 scope must be added** before Fatia 2 (photo uploads).

## Project layout

```
fansnap/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx           # html shell + Space Grotesk / JetBrains Mono fonts
│  │  ├─ page.tsx             # mounts FanSnapApp (Fatia 1: single client component)
│  │  ├─ globals.css          # reset + keyframes (pulse, fadeUp, rotate-line)
│  │  └─ api/
│  │     └─ scan/route.ts     # POST /api/scan stub (Fatia 3: real Rekognition)
│  ├─ components/
│  │  └─ FanSnapApp.tsx       # ported prototype — 6 screens, theme + lang state
│  └─ lib/
│     ├─ theme.ts             # design tokens (dark + light)
│     ├─ i18n.ts              # EN / PT / ES copy dictionary
│     └─ mock.ts              # mock events + photos + product catalog (Fatia 1 only)
├─ db/
│  └─ schema.sql              # D1 schema — 3 business_models + commission tiers
├─ public/
│  └─ _headers                # long-cache for /_next/static/*
├─ wrangler.jsonc             # Worker config (bindings stubbed, ready for Fatia 2)
├─ open-next.config.ts        # OpenNext adapter config (no R2 cache yet)
├─ next.config.ts             # initOpenNextCloudflareForDev() bootstraps bindings in dev
└─ package.json               # scripts: dev / build / lint / preview / deploy / cf-typegen
```

## What's intentionally not done yet (and why)

- **Real per-event URLs** (`/event/[code]`, `/gallery/[photoId]`). The prototype was SPA-state; deep-linking lands once the data is real (Fatia 2).
- **Auth.** Adds friction; Fatia 1 is for showing the flow to promoters, not for actual purchases.
- **Cart / checkout.** Locked to Fatia 3 alongside Stripe + Conekta integration.
- **Rekognition.** Stubbed in `/api/scan`. Plugging it in needs the AWS account + the per-event FaceCollection lifecycle, which is a chunk of work that belongs in its own slice.
- **R2 photo storage.** Token scope needs to be added by the workspace admin.

## Roadmap

| Slice | What ships |
|---|---|
| **Fatia 1** (now) | Demo-quality public site, mock data, deployed |
| Fatia 2 | D1 wired, real event admin, R2 photo uploads, photographer dashboard |
| Fatia 3 | AWS Rekognition matching, Stripe + Conekta/OXXO checkout, sponsored-event variant |
| Fatia 4 | Photographer commissions UI + payouts, admin metrics, B2B lead pipeline |
| Fatia 5+ | Multi-country, marathon vertical, SDK for embed-in-promoter-app |

---

🤖 _Initial scaffold + prototype port built with Claude Code._
