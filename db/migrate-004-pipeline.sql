-- migrate-004-pipeline.sql — Fase 0 of the real-photo pipeline.
-- ⚠️ NOT idempotent (ALTER ADD COLUMN). Run ONCE per database (remote + local).
--
-- Additive only. Existing rows/behaviour untouched:
--   • events.photo_source switches an event between the build-time mock set
--     ('mock', the default for the 10 demo events) and the live R2 pipeline ('live').
--   • photos gains a status machine + dedupe hash + reject reason for real uploads.
--   • photo_faces stores the 128-d descriptors per detected face, so the client
--     can match per-event (replacing the single static face-index.json for live events).

ALTER TABLE events ADD COLUMN photo_source TEXT NOT NULL DEFAULT 'mock';

ALTER TABLE photos ADD COLUMN status        TEXT;   -- uploading | processing | published | rejected
ALTER TABLE photos ADD COLUMN reject_reason TEXT;
ALTER TABLE photos ADD COLUMN content_hash  TEXT;   -- sha256 of original bytes, for dedupe

CREATE TABLE IF NOT EXISTS photo_faces (
  photo_id   TEXT NOT NULL REFERENCES photos(id) ON DELETE CASCADE,
  face_idx   INTEGER NOT NULL,        -- 0-based index of the face within the photo
  descriptor TEXT NOT NULL,           -- JSON array of 128 floats (face-api 128-d embedding)
  PRIMARY KEY (photo_id, face_idx)
);

CREATE INDEX IF NOT EXISTS idx_photos_event_status ON photos(event_id, status);
CREATE INDEX IF NOT EXISTS idx_photo_faces_photo   ON photo_faces(photo_id);
