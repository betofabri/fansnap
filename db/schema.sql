-- FanSnap — Cloudflare D1 schema (Fatia 2)
--
-- Not wired yet. This is the contract: all three business models, all VIP
-- commission fields, biometric consent log. The point is so that when we
-- enable the D1 binding in wrangler.jsonc, the schema is already correct
-- and we don't have to migrate later.
--
-- Apply locally:  wrangler d1 execute fansnap --local --file=./db/schema.sql
-- Apply remote:   wrangler d1 execute fansnap --remote --file=./db/schema.sql
--
-- Conventions:
--   - All IDs are TEXT (ULID/UUID) to keep multi-region merges sane.
--   - Money is stored in INTEGER cents (USD or MXN) — never floats.
--   - Timestamps are ISO 8601 strings; UTC.

PRAGMA foreign_keys = ON;

-- ============================================================================
-- USERS — fans, photographers, admins, B2B contacts. One auth table to rule.
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id              TEXT PRIMARY KEY,
  role            TEXT NOT NULL CHECK (role IN ('fan', 'photographer', 'admin', 'b2b')),
  email           TEXT UNIQUE,
  phone           TEXT,
  name            TEXT,
  country         TEXT,
  language        TEXT DEFAULT 'es',          -- en | pt | es
  city            TEXT,                       -- photographer roster display
  portfolio       TEXT,                       -- photographer portfolio / IG / web
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen_at    TEXT
);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================================
-- EVENTS — the three business models live in one table. business_model is
-- the branch point for pricing, visibility, commission, checkout flow.
-- ============================================================================
CREATE TABLE IF NOT EXISTS events (
  id                 TEXT PRIMARY KEY,
  code               TEXT NOT NULL UNIQUE,          -- e.g. BB-001, CCXP-26
  name               TEXT NOT NULL,
  business_model     TEXT NOT NULL CHECK (business_model IN ('marketplace', 'official', 'sponsored')),
  category           TEXT NOT NULL CHECK (category IN ('music', 'conventions', 'sports', 'parties', 'corporate')),
  venue              TEXT,
  city               TEXT,
  country            TEXT DEFAULT 'MX',
  start_at           TEXT NOT NULL,
  end_at             TEXT,
  status             TEXT NOT NULL CHECK (status IN ('draft', 'upcoming', 'live', 'recent', 'archived')) DEFAULT 'draft',
  featured           INTEGER NOT NULL DEFAULT 0,
  -- sponsored events: flat fee charged to client; photos free for attendees
  sponsor_org_id     TEXT,                          -- FK to organizations later
  sponsor_fee_cents  INTEGER,                       -- USD cents, B2B contract value
  -- marketplace: photographer self-registered; we take a cut
  marketplace_owner_id TEXT REFERENCES users(id),
  -- pricing override (NULL = use defaults)
  price_override_json TEXT,
  cover_color        TEXT DEFAULT '#9D4EFF',
  -- denormalized count of indexed photos, for quick admin display (source of
  -- truth is the photos table; refreshed when photos are ingested)
  photo_count        INTEGER NOT NULL DEFAULT 0,
  -- 'mock' = build-time demo photo set (the 10 seed events); 'live' = real R2
  -- pipeline (upload → process → index). Default 'mock' keeps demo events intact.
  photo_source       TEXT NOT NULL DEFAULT 'mock',
  -- soft delete: NULL = active, ISO timestamp = in the trash (recoverable)
  deleted_at         TEXT,
  created_at         TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at         TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_events_status         ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_business_model ON events(business_model);
CREATE INDEX IF NOT EXISTS idx_events_start_at       ON events(start_at);

-- ============================================================================
-- EVENT ↔ PHOTOGRAPHER assignment with full commission schema. We ship
-- with Standard only in MVP but every VIP/Pro field exists from day 1.
-- ============================================================================
CREATE TABLE IF NOT EXISTS event_photographers (
  id                    TEXT PRIMARY KEY,
  event_id              TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  photographer_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tier                  TEXT NOT NULL CHECK (tier IN ('standard', 'pro', 'vip')) DEFAULT 'standard',
  commission_rate       REAL NOT NULL DEFAULT 0.50, -- 0..1, photographer's share of net
  -- VIP-only fields: NULL for Standard / Pro. Year-1 stays NULL (cash-flow safety).
  fixed_fee_cents       INTEGER,                    -- cachê paid in USD cents
  minimum_guarantee_cents INTEGER,                  -- floor against commission
  guarantee_recoupable  INTEGER NOT NULL DEFAULT 1, -- boolean
  approved              INTEGER NOT NULL DEFAULT 0,
  created_at            TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(event_id, photographer_id)
);
CREATE INDEX IF NOT EXISTS idx_ep_event ON event_photographers(event_id);
CREATE INDEX IF NOT EXISTS idx_ep_phot  ON event_photographers(photographer_id);

-- ============================================================================
-- PHOTOS — metadata only; the bytes live in R2 under PHOTOS bucket.
-- Each photo also gets indexed in the event's Rekognition FaceCollection.
-- ============================================================================
CREATE TABLE IF NOT EXISTS photos (
  id                TEXT PRIMARY KEY,
  event_id          TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  photographer_id   TEXT NOT NULL REFERENCES users(id),
  r2_key            TEXT NOT NULL,         -- e.g. "events/BB-001/raw/abc123.jpg"
  r2_thumb_key      TEXT,
  width             INTEGER,
  height            INTEGER,
  size_bytes        INTEGER,
  taken_at          TEXT,                  -- EXIF
  watermarked       INTEGER NOT NULL DEFAULT 0,
  face_indexed      INTEGER NOT NULL DEFAULT 0,
  rekog_image_id    TEXT,                  -- FaceCollection mapping
  status            TEXT,                  -- uploading | processing | published | rejected
  reject_reason     TEXT,
  content_hash      TEXT,                  -- sha256 of original bytes, for dedupe
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_photos_event        ON photos(event_id);
CREATE INDEX IF NOT EXISTS idx_photos_phot         ON photos(photographer_id);
CREATE INDEX IF NOT EXISTS idx_photos_taken        ON photos(taken_at);
CREATE INDEX IF NOT EXISTS idx_photos_event_status ON photos(event_id, status);

-- ============================================================================
-- PHOTO_FACES — 128-d face-api descriptors, one row per detected face. Lets the
-- client pull a per-event index (live events) instead of the static global JSON.
-- ============================================================================
CREATE TABLE IF NOT EXISTS photo_faces (
  photo_id   TEXT NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  face_idx   INTEGER NOT NULL,        -- 0-based index of the face within the photo
  descriptor TEXT NOT NULL,           -- JSON array of 128 floats
  PRIMARY KEY (photo_id, face_idx)
);
CREATE INDEX IF NOT EXISTS idx_photo_faces_photo ON photo_faces(photo_id);

-- ============================================================================
-- SCANS — each fan selfie session. Biometric consent + audit trail.
-- LFPDPPP/GDPR: we keep the *face vector* hash for retrieval but throw away
-- the raw selfie after processing (see brief §6).
-- ============================================================================
CREATE TABLE IF NOT EXISTS scans (
  id                  TEXT PRIMARY KEY,
  user_id             TEXT REFERENCES users(id),  -- may be null (guest scan)
  event_id            TEXT NOT NULL REFERENCES events(id),
  consent_text_id     TEXT NOT NULL,              -- versioned consent text reference
  consent_accepted_at TEXT NOT NULL,
  selfie_hash         TEXT,                       -- sha256 of selfie bytes
  face_vector_hash    TEXT,                       -- sha256 of the vector we kept
  match_count         INTEGER DEFAULT 0,
  ip_address          TEXT,
  user_agent          TEXT,
  created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_scans_user  ON scans(user_id);
CREATE INDEX IF NOT EXISTS idx_scans_event ON scans(event_id);

CREATE TABLE IF NOT EXISTS scan_matches (
  scan_id    TEXT NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
  photo_id   TEXT NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  similarity REAL NOT NULL,                       -- 0..1
  PRIMARY KEY (scan_id, photo_id)
);

-- ============================================================================
-- ORDERS + ORDER LINES — checkout, MXN primary, Stripe + Conekta dual-rail.
-- ============================================================================
CREATE TABLE IF NOT EXISTS orders (
  id                  TEXT PRIMARY KEY,
  user_id             TEXT NOT NULL REFERENCES users(id),
  event_id            TEXT NOT NULL REFERENCES events(id),
  business_model      TEXT NOT NULL,                          -- denormalized at order time
  currency            TEXT NOT NULL DEFAULT 'MXN' CHECK (currency IN ('MXN', 'USD')),
  subtotal_cents      INTEGER NOT NULL,
  iva_cents           INTEGER NOT NULL DEFAULT 0,             -- 16% in MX
  total_cents         INTEGER NOT NULL,
  -- dual-rail payment processing (brief §5)
  payment_rail        TEXT NOT NULL CHECK (payment_rail IN ('stripe', 'conekta_oxxo', 'free_sponsored')),
  status              TEXT NOT NULL CHECK (status IN ('pending', 'awaiting_oxxo', 'paid', 'fulfilled', 'cancelled', 'refunded')) DEFAULT 'pending',
  stripe_payment_id   TEXT,
  conekta_order_id    TEXT,
  oxxo_reference      TEXT,
  paid_at             TEXT,
  fulfilled_at        TEXT,
  created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_orders_user  ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_event ON orders(event_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

CREATE TABLE IF NOT EXISTS order_lines (
  id           TEXT PRIMARY KEY,
  order_id     TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  photo_id     TEXT NOT NULL REFERENCES photos(id),
  product_sku  TEXT NOT NULL CHECK (product_sku IN ('digital', 'foto_flat', 'print', 'tshirt', 'mug', 'canvas')),
  variant_json TEXT,                              -- {size, color, ...}
  qty          INTEGER NOT NULL DEFAULT 1,
  unit_cents   INTEGER NOT NULL,
  total_cents  INTEGER NOT NULL,
  -- commission snapshot at sale time (per brief §3 — never look up live)
  photographer_commission_cents INTEGER NOT NULL DEFAULT 0,
  platform_net_cents            INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_order_lines_order ON order_lines(order_id);
CREATE INDEX IF NOT EXISTS idx_order_lines_photo ON order_lines(photo_id);

-- ============================================================================
-- INTAKE — pre-launch lead capture. Powers /aplica (photographer apply),
-- the referral modal, and /marcas (brand contact). Deliberately standalone
-- (no FKs into users) so they work before auth exists. The /aplica table is
-- the launch-critical one: it goes live before the rest of the site.
-- ============================================================================
CREATE TABLE IF NOT EXISTS photographer_applications (
  id                    TEXT PRIMARY KEY,
  code                  TEXT NOT NULL UNIQUE,        -- PA-YYYY-MM-XXXX
  full_name             TEXT NOT NULL,
  email                 TEXT NOT NULL,
  phone                 TEXT,
  city                  TEXT,
  portfolio             TEXT,
  event_types           TEXT,                        -- JSON array string
  equipment             TEXT,                        -- JSON array string
  big_event_experience  INTEGER NOT NULL DEFAULT 0,  -- boolean
  big_event_notes       TEXT,
  verification          TEXT,                        -- 'email' | 'whatsapp'
  language              TEXT DEFAULT 'es',
  status                TEXT NOT NULL DEFAULT 'new'
                          CHECK (status IN ('new','reviewing','approved','rejected','archived')),
  user_agent            TEXT,
  created_at            TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_pa_email   ON photographer_applications(email);
CREATE INDEX IF NOT EXISTS idx_pa_status  ON photographer_applications(status);
CREATE INDEX IF NOT EXISTS idx_pa_created ON photographer_applications(created_at);

CREATE TABLE IF NOT EXISTS photographer_referrals (
  id                  TEXT PRIMARY KEY,
  code                TEXT NOT NULL UNIQUE,          -- RF-YYYY-MM-XXXX
  referrer_email      TEXT NOT NULL,
  referred_name       TEXT NOT NULL,
  referred_contact    TEXT NOT NULL,
  referred_portfolio  TEXT,
  note                TEXT,
  language            TEXT DEFAULT 'es',
  status              TEXT NOT NULL DEFAULT 'new'
                        CHECK (status IN ('new','contacted','converted','archived')),
  created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_rf_referrer ON photographer_referrals(referrer_email);
CREATE INDEX IF NOT EXISTS idx_rf_status   ON photographer_referrals(status);

CREATE TABLE IF NOT EXISTS brand_leads (
  id              TEXT PRIMARY KEY,
  code            TEXT NOT NULL UNIQUE,              -- BR-YYYY-MM-XXXX
  company         TEXT NOT NULL,
  full_name       TEXT NOT NULL,
  role            TEXT,
  email           TEXT NOT NULL,
  phone           TEXT,
  event_interest  TEXT,
  budget          TEXT,
  message         TEXT NOT NULL,
  language        TEXT DEFAULT 'es',
  status          TEXT NOT NULL DEFAULT 'new'
                    CHECK (status IN ('new','contacted','qualified','won','lost','archived')),
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_br_status  ON brand_leads(status);
CREATE INDEX IF NOT EXISTS idx_br_created ON brand_leads(created_at);
