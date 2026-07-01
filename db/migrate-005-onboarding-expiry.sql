-- migrate-005-onboarding-expiry.sql — audit Lote A.
-- ⚠️ NOT idempotent (ALTER ADD COLUMN). Run ONCE per database (remote + local).
--
-- Onboarding links used to live forever; a leaked link stayed valid in 2030.
-- New tokens get +7 days on approval (re-approving re-arms the window).
-- NULL = legacy/no expiry (treated as valid — there are no live legacy tokens).

ALTER TABLE users ADD COLUMN onboarding_token_expires_at TEXT;
