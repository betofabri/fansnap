-- Migration 002 — first/last name standard + photographer account profile.
-- Adds split-name columns everywhere a person is captured, plus the
-- photographer business fields (tier, payout, tax) and fan source/consent.
-- ADD COLUMN is not idempotent — run once per database.
--
--   wrangler d1 execute fansnap --remote --file=./db/migrate-002-profiles.sql
--   wrangler d1 execute fansnap --local  --file=./db/migrate-002-profiles.sql

-- users: split name + photographer profile/financial + fan activity
ALTER TABLE users ADD COLUMN first_name     TEXT;
ALTER TABLE users ADD COLUMN last_name      TEXT;
ALTER TABLE users ADD COLUMN handle         TEXT;   -- photographer @
ALTER TABLE users ADD COLUMN bio            TEXT;
ALTER TABLE users ADD COLUMN specialties    TEXT;   -- JSON array
ALTER TABLE users ADD COLUMN equipment      TEXT;   -- JSON array
ALTER TABLE users ADD COLUMN tier           TEXT;   -- default tier: standard|pro|vip
ALTER TABLE users ADD COLUMN status         TEXT;   -- roster status: active|paused|archived
ALTER TABLE users ADD COLUMN payout_method  TEXT;   -- clabe|stripe|paypal
ALTER TABLE users ADD COLUMN payout_account TEXT;   -- CLABE / account ref (store last digits)
ALTER TABLE users ADD COLUMN tax_id         TEXT;   -- RFC (MX)
ALTER TABLE users ADD COLUMN source         TEXT;   -- fan: checkout|gallery|manual
ALTER TABLE users ADD COLUMN consent_at     TEXT;   -- fan: biometric consent timestamp

-- intake tables: split name (keep full_name as the concatenation)
ALTER TABLE photographer_applications ADD COLUMN first_name TEXT;
ALTER TABLE photographer_applications ADD COLUMN last_name  TEXT;
ALTER TABLE brand_leads ADD COLUMN first_name TEXT;
ALTER TABLE brand_leads ADD COLUMN last_name  TEXT;
