
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS serial_number text;
ALTER TABLE public.apartments ADD COLUMN IF NOT EXISTS serial_number text;

-- Backfill vehicles
WITH ranked AS (
  SELECT id, agency_id,
         row_number() OVER (PARTITION BY agency_id ORDER BY created_at, id) AS rn
  FROM public.vehicles
)
UPDATE public.vehicles v
SET serial_number = 'V-' || lpad(r.rn::text, 3, '0')
FROM ranked r
WHERE v.id = r.id AND v.serial_number IS NULL;

-- Backfill apartments
WITH ranked AS (
  SELECT id, agency_id,
         row_number() OVER (PARTITION BY agency_id ORDER BY created_at, id) AS rn
  FROM public.apartments
)
UPDATE public.apartments a
SET serial_number = 'A-' || lpad(r.rn::text, 3, '0')
FROM ranked r
WHERE a.id = r.id AND a.serial_number IS NULL;

-- Trigger function for vehicles
CREATE OR REPLACE FUNCTION public.assign_vehicle_serial()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  next_n int;
BEGIN
  IF NEW.serial_number IS NULL OR NEW.serial_number = '' THEN
    SELECT COALESCE(MAX(NULLIF(regexp_replace(serial_number, '\D', '', 'g'), '')::int), 0) + 1
      INTO next_n
      FROM public.vehicles
      WHERE agency_id = NEW.agency_id;
    NEW.serial_number := 'V-' || lpad(next_n::text, 3, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_assign_vehicle_serial ON public.vehicles;
CREATE TRIGGER trg_assign_vehicle_serial
BEFORE INSERT ON public.vehicles
FOR EACH ROW EXECUTE FUNCTION public.assign_vehicle_serial();

-- Trigger function for apartments
CREATE OR REPLACE FUNCTION public.assign_apartment_serial()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  next_n int;
BEGIN
  IF NEW.serial_number IS NULL OR NEW.serial_number = '' THEN
    SELECT COALESCE(MAX(NULLIF(regexp_replace(serial_number, '\D', '', 'g'), '')::int), 0) + 1
      INTO next_n
      FROM public.apartments
      WHERE agency_id = NEW.agency_id;
    NEW.serial_number := 'A-' || lpad(next_n::text, 3, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_assign_apartment_serial ON public.apartments;
CREATE TRIGGER trg_assign_apartment_serial
BEFORE INSERT ON public.apartments
FOR EACH ROW EXECUTE FUNCTION public.assign_apartment_serial();

CREATE UNIQUE INDEX IF NOT EXISTS uniq_vehicles_agency_serial ON public.vehicles(agency_id, serial_number);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_apartments_agency_serial ON public.apartments(agency_id, serial_number);
