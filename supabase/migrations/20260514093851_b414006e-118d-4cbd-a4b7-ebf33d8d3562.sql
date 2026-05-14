-- Track when driver location was last updated
ALTER TABLE public.drivers
  ADD COLUMN IF NOT EXISTS current_location_updated_at timestamptz;

-- Drivers can read their own row
CREATE POLICY "Drivers can view own row"
  ON public.drivers FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());

-- Drivers can update their own location & status
CREATE POLICY "Drivers can update own row"
  ON public.drivers FOR UPDATE
  TO authenticated
  USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Helper: get the driver_id of the current authenticated user
CREATE OR REPLACE FUNCTION public.current_driver_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.drivers WHERE auth_user_id = auth.uid() LIMIT 1
$$;

-- Drivers can view bookings assigned to them
CREATE POLICY "Drivers can view own bookings"
  ON public.bookings FOR SELECT
  TO authenticated
  USING (driver_id = public.current_driver_id());

-- Drivers can update status of their own bookings
CREATE POLICY "Drivers can update own bookings"
  ON public.bookings FOR UPDATE
  TO authenticated
  USING (driver_id = public.current_driver_id())
  WITH CHECK (driver_id = public.current_driver_id());