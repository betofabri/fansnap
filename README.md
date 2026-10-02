# FanSnap

> _You were there. We have the proof._
> The memory layer of live entertainment: facial-recognition photo platform for concerts, conventions, festivals and sports.

**Status (Oct 2026):** pre-launch. Public site deployed behind a launch gate (`SITE_LIVE = false`), real photo pipeline running in production (upload, watermark, purchase, delivery). Face matching works on demo events only; live-event indexing is the main open item.
**Owner:** Beto Fabri (VP Content, CCXP / Omelete Company).
**Launch market:** Mexico (CDMX first), multi-country LATAM later.
**Prod URL:** `https://betofabri.com/fansnap` (custom route on a personal domain; `workers.dev` kept as fallback).

Execution plan and open phases: `docs/roadmap-real-pipeline.md`.

---

## What is in here right now

| Surface | State |
|---|---|
| Launch gate: everyone sees ComingSoon except `/aplica` and `/admin`; preview cookie unlocks the full site per browser | Done |
| Homepage, event page, selfie + scan, gallery, photo detail, cart, checkout, order confirmation | Done |
| EN/PT/ES, dark/light, mobile responsive | Done |
| `/aplica`: photographer pre-registration landing (Spanish) + referral | Done |
| `/fotografos` and `/marcas` landings, `/mapa` internal navigation hub | Done |
| Admin on real D1: events, photographer roster, applications queue, fans list, onboarding links with expiry, per-event watermark level | Done |
| Admin fan detail view (purchases, scans, consent, activity) | Mockup, fixed sample data (Fase 4b) |
| Photographer dashboard with in-dashboard upload (assigned events still mock) | Done (upload real, data mock) |
| Real upload to R2 for events with `photo_source = 'live'` | Done |
| Processing pipeline: Queue + separate `fansnap-processor` Worker (resize 1600px + watermark v3, three intensities) | Done |
| Purchase loop without a gateway: D1 orders on the `free_sponsored` rail, status `paid` stub | Done |
| Delivery: signed 24h download links (HMAC), clean original streamed from R2, recovery at `/pedidos` by code + email | Done |
| Receipt email with watermarked thumbs (Cloudflare Email binding) | Done, pending domain onboarding to actually send |
| Face recognition: face-api.js in the browser against a static `face-index.json` built at deploy time | Done for mock events only |
| Face indexing for live events (`photo_faces`) | Pending (Fase 2b, blocked by Docker + Containers plan) |
| Per-event face index endpoint + `scans` / `scan_matches` logging | Pending (Fase 3) |
| Magic-link auth for fans and photographers | Pending (Fase 5) |
| Biometric consent step + legal pages (MX) | Pending (Fase 6) |
| Payment gateway (Stripe / MercadoPago / OXXO) + photographer payouts | Out of scope for now |
| Cloudflare Access on `/admin` | Pending (#43) |

## Real vs simulated

| Piece | Today |
|---|---|
| Photographer upload | Real: stream to R2 `originals/<code>/<id>` (only when the event is `live`; mock events keep the simulated UI) |
| Storage | R2 bucket `fansnap-photos`: originals private, previews served through the Worker |
| Watermark / resize | Real, server-side per upload, versioned preview keys (`wm-v3`) |
| Face index | Static JSON for the 10 demo events; nothing for live events yet |
| Match | Client-side, browser, mock events only |
| Order | Real rows in `orders` / `order_lines`, `localStorage` kept as demo fallback |
| Original delivery | Real: signed link, 24h TTL, byte-identical original |
| Auth | None (order id is the download capability; admin unprotected except by obscurity) |
| Biometric consent | Checkbox at checkout only |
| `/api/scan` | Still the Fatia 1 stub (returns mock matches); the browser does the real matching |

---

## Stack

- **Next.js 16.2.6** (App Router, Turbopack, React 19.2), inline styles, no Tailwind. Read `node_modules/next/dist/docs/` before touching Next APIs (see `AGENTS.md`).
- **Cloudflare Workers** via `@opennextjs/cloudflare` with Workers Static Assets. `basePath: "/fansnap"`.
- **D1** `fansnap` (schema in `db/schema.sql`, incremental migrations `db/migrate-00N-*.sql`).
- **R2** `fansnap-photos` (binding `PHOTOS`).
- **Queues** `fansnap-process` (producer in the site Worker, consumer in `processor/`).
- **Email Sending** binding `EMAIL` (sender `roster@betofabri.com`; domain onboarding still to confirm).
- **Photon WASM** (`@cf-wasm/photon`) for resize + watermark compositing in the processor.
- **face-api.js** (`@vladmandic/face-api`) in the browser for matching; `tfjs-node` + `canvas` only for the build-time index script.
- **Space Grotesk + JetBrains Mono** via `next/font/google`. Lucide icons.

### Worker secrets

| Secret | Used by |
|---|---|
| `PREVIEW_KEY` | Launch-gate bypass cookie (`/fansnap/api/preview?key=...`, `?off=1` to drop it) |
| `DOWNLOAD_KEY` | HMAC for signed download links |

Set with `wrangler secret put <NAME>`; mirror in `.dev.vars` for `next dev`.

---

## Local development

```bash
npm run dev       # next dev on :3000 (writes build info, syncs mock photos)
npm run preview   # OpenNext build + wrangler preview (closer to prod, bindings live)
```

## Deploy

```bash
npm run deploy                                    # site Worker (fansnap)
npx wrangler deploy -c processor/wrangler.jsonc   # processor Worker (fansnap-processor)
```

`npm run deploy` runs `prebuild-mocks` first: build info, mock photo processing, mock sync and the static face index. The processor is a separate Worker and must be deployed on its own whenever `processor/` changes.

### Migrations

Migrations use `ALTER TABLE ADD COLUMN` and are **not idempotent**. Run each one once, remote and local:

```bash
npx wrangler d1 execute fansnap --remote --file db/migrate-00N-xxx.sql
npx wrangler d1 execute fansnap --local  --file db/migrate-00N-xxx.sql
```

Applied so far: 002 profiles, 003 onboarding, 004 pipeline, 005 onboarding expiry, 006 orders, 007 watermark.

### Opening the site to the public

Flip `SITE_LIVE` to `true` in `src/lib/launch.ts` and deploy. It is a build-time constant; there is no runtime toggle.

---

## Project layout

```
fansnap/
├─ src/
│  ├─ app/
│  │  ├─ page.tsx                      # home (FanSnapApp SPA)
│  │  ├─ eventos/[code]/               # event page
│  │  ├─ aplica/ fotografos/ marcas/   # landings
│  │  ├─ fotografos/dashboard/         # photographer dashboard + upload
│  │  ├─ onboarding/[token]/           # photographer onboarding
│  │  ├─ pedidos/                      # order lookup + re-download
│  │  ├─ mapa/                         # internal nav hub (preview cookie only)
│  │  ├─ admin/                        # events, photographers, applications, fans
│  │  └─ api/
│  │     ├─ admin/*                    # D1 CRUD for the admin
│  │     ├─ photographer/uploads       # init / PUT stream / complete (enqueue)
│  │     ├─ orders                     # create order (free_sponsored rail)
│  │     ├─ download                   # signed link -> clean original
│  │     ├─ photos/preview             # watermarked preview from R2
│  │     ├─ photographers/apply|refer  # /aplica form + referral
│  │     ├─ fans/register  brands/contact  onboarding  preview
│  │     └─ scan                       # Fatia 1 stub (unused by the real flow)
│  ├─ components/                      # FanSnapApp, landings, dashboard, admin/*
│  └─ lib/                             # theme, i18n, mock, cart, db, email, sign,
│                                      # gate + launch, face-recognition, photo-manifest
├─ processor/                          # fansnap-processor Worker (queue consumer)
│  ├─ src/index.ts                     # resize + watermark + publish
│  └─ src/assets/wm-tile-{suave,media,forte}.png
├─ db/                                 # schema.sql + migrate-00N + seed-events.sql
├─ scripts/                            # process-photos, sync-mock-photos, build-face-index,
│                                      # diagnose-match, write-build-info
├─ docs/
│  ├─ roadmap-real-pipeline.md         # technical plan, phase status, decisions
│  ├─ roadmap-lancamento.md            # business track: photographers, brand, OCESA, pilot
│  └─ photographers-landing-brief.md   # original brief for /aplica (built)
├─ public/                             # mock photos, face-index.json, face-api models
├─ wrangler.jsonc                      # site Worker (D1, R2, Queue producer, Email)
├─ open-next.config.ts  next.config.ts
└─ package.json
```

## Next steps

In order of leverage (details in the roadmap):

1. **Fase 2b**: face indexing for live events (needs Docker Desktop for the container image and a Cloudflare plan with Containers).
2. **Fase 3**: per-event face index endpoint from D1 + `scans` / `scan_matches` logging.
3. **Fase 6**: biometric consent step before the selfie + legal pages (required before opening in MX).
4. **Fase 5**: magic-link auth; photographer dashboard on real data.
5. **#43**: Cloudflare Access on `/admin`.
6. Confirm Email Sending onboarding for `betofabri.com` so receipts actually go out.
