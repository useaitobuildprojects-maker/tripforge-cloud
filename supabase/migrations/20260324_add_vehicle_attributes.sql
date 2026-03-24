ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS transmission text DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS seats integer DEFAULT 5,
  ADD COLUMN IF NOT EXISTS fuel_type text DEFAULT 'gasoline',
  ADD COLUMN IF NOT EXISTS category text DEFAULT 'sedan',
  ADD COLUMN IF NOT EXISTS air_conditioning boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS mileage_policy text DEFAULT 'unlimited';
