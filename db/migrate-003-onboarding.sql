-- Migration 003 — photographer onboarding via tokenized link.
-- On approval we mint a token + set status 'pending'; the photographer opens
-- /fansnap/onboarding/<token> to fill account/financial data themselves.
ALTER TABLE users ADD COLUMN onboarding_token  TEXT;
ALTER TABLE users ADD COLUMN onboarding_status TEXT;  -- pending | complete
