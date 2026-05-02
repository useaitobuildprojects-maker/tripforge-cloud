ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS price_per_km numeric,
  ADD COLUMN IF NOT EXISTS daily_rate_base numeric,
  ADD COLUMN IF NOT EXISTS free_km_per_day integer DEFAULT 200;
