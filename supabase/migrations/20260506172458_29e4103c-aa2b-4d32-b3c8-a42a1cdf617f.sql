
ALTER TABLE public.car_rental_pricing
  ADD COLUMN IF NOT EXISTS free_km_per_day integer DEFAULT 200,
  ADD COLUMN IF NOT EXISTS extra_km_rate numeric DEFAULT 0.25,
  ADD COLUMN IF NOT EXISTS drop_off_mode text NOT NULL DEFAULT 'fixed',
  ADD COLUMN IF NOT EXISTS price_per_km numeric DEFAULT 0;
