ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS vehicle_class text NOT NULL DEFAULT 'economy';