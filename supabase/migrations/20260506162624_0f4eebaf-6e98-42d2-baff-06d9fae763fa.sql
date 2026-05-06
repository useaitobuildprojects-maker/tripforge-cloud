ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS home_city text,
  ADD COLUMN IF NOT EXISTS home_country text,
  ADD COLUMN IF NOT EXISTS drop_off_mode text NOT NULL DEFAULT 'fixed',
  ADD COLUMN IF NOT EXISTS drop_off_fee numeric DEFAULT 0;