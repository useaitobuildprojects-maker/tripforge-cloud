CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.apartments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  photos text[] NOT NULL DEFAULT '{}',
  bedrooms integer NOT NULL DEFAULT 1,
  bathrooms integer NOT NULL DEFAULT 1,
  max_guests integer NOT NULL DEFAULT 2,
  address text,
  city text NOT NULL,
  country text NOT NULL,
  nightly_rate numeric NOT NULL DEFAULT 0,
  cleaning_fee numeric NOT NULL DEFAULT 0,
  amenities text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'available',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.apartments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read apartments"
ON public.apartments FOR SELECT
USING (true);

CREATE POLICY "Agency members manage apartments"
ON public.apartments FOR ALL
TO authenticated
USING (
  agency_id IN (SELECT agency_id FROM public.agency_members WHERE user_id = auth.uid())
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  agency_id IN (SELECT agency_id FROM public.agency_members WHERE user_id = auth.uid())
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE TRIGGER update_apartments_updated_at
BEFORE UPDATE ON public.apartments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_apartments_agency ON public.apartments(agency_id);