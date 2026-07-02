-- migrate-006-orders.sql — Fase 4 (entrega sem gateway).
-- ⚠️ NOT idempotent (ALTER ADD COLUMN). Run ONCE per database (remote + local).
--
-- orders.code  = short display code (FS-XXXXXX) the fan sees/types in /pedidos.
-- orders.email = denormalized buyer email for code+email lookup without join.
-- The order *id* (ord_<crypto>) stays the capability for download URLs.

ALTER TABLE orders ADD COLUMN code  TEXT;
ALTER TABLE orders ADD COLUMN email TEXT;
CREATE INDEX IF NOT EXISTS idx_orders_code ON orders(code);
