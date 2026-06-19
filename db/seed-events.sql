-- Seed the events table from the canonical demo event set (mirrors the events
-- the public site shows). photo_count = REAL indexed file count per event
-- (public/mock/events/<code>/), not the inflated mock marketing numbers.
-- Idempotent: INSERT OR REPLACE keyed on the stable evt_<code> id.
--
-- Apply:  wrangler d1 execute fansnap --remote --file=./db/seed-events.sql
--         wrangler d1 execute fansnap --local  --file=./db/seed-events.sql

INSERT OR REPLACE INTO events
  (id, code, name, business_model, category, venue, city, country, start_at, status, featured, cover_color, photo_count, created_at, updated_at)
VALUES
  ('evt_ccxp-26','CCXP-26','CCXP México 2026','official','conventions','Centro Banamex','CDMX','MX','2026-05-29T11:00:00Z','live',1,'#00B8D4',39, datetime('now'), datetime('now')),
  ('evt_bb-001','BB-001','Bad Bunny — Most Wanted Tour','official','music','Estadio GNP Seguros','CDMX','MX','2026-05-08T21:00:00Z','live',1,'#9D4EFF',38, datetime('now'), datetime('now')),
  ('evt_ff-26','FF-26','Festa da Firma','sponsored','parties','Omelete Company','São Paulo','BR','2026-06-02T20:00:00Z','recent',1,'#9D4EFF',241, datetime('now'), datetime('now')),
  ('evt_ro-014','RO-014','Rosalía — Motomami World Tour','official','music','Foro Sol','CDMX','MX','2026-05-04T21:00:00Z','recent',0,'#FF3B6E',37, datetime('now'), datetime('now')),
  ('evt_mx-mtn','MX-MTN','Maratón CDMX 2026','official','sports','Reforma → Estadio Olímpico','CDMX','MX','2026-05-02T06:00:00Z','recent',0,'#00B8D4',38, datetime('now'), datetime('now')),
  ('evt_cc-26','CC-26','Corona Capital','official','music','Autódromo Hermanos Rodríguez','CDMX','MX','2026-05-01T16:00:00Z','recent',0,'#9D4EFF',38, datetime('now'), datetime('now')),
  ('evt_fcj-22','FCJ-22','FC Juárez vs Pumas','official','sports','Estadio Olímpico','CDMX','MX','2026-04-28T19:00:00Z','recent',0,'#FF3B6E',38, datetime('now'), datetime('now')),
  ('evt_ae-08','AE-08','Anime Expo Guadalajara','official','conventions','Expo Guadalajara','GDL','MX','2026-04-22T10:00:00Z','recent',0,'#9D4EFF',38, datetime('now'), datetime('now')),
  ('evt_edc-26','EDC-26','EDC México 2026','official','music','Autódromo Hermanos Rodríguez','CDMX','MX','2026-06-22T18:00:00Z','upcoming',0,'#00B8D4',38, datetime('now'), datetime('now')),
  ('evt_ll-26','LL-26','Lollapalooza México 2026','official','music','Foro Sol','CDMX','MX','2026-07-12T14:00:00Z','upcoming',0,'#FF3B6E',38, datetime('now'), datetime('now'));
