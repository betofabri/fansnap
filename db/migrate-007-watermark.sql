-- migrate-007-watermark.sql — nível de marca d'água configurável por evento.
-- ⚠️ NOT idempotent (ALTER ADD COLUMN). Run ONCE per database (remote + local).
-- suave | media | forte — o admin escolhe na ficha do evento; o processador
-- aplica no próximo processamento (fotos já publicadas precisam de reprocesso).
ALTER TABLE events ADD COLUMN watermark_level TEXT NOT NULL DEFAULT 'forte';
