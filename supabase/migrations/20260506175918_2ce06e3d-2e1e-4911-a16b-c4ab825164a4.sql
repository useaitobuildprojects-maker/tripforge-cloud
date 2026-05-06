ALTER TABLE public.vehicles
  DROP COLUMN IF EXISTS price_per_km,
  DROP COLUMN IF EXISTS drop_off_fee,
  DROP COLUMN IF EXISTS drop_off_mode,
  DROP COLUMN IF EXISTS free_km_per_day;