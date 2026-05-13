
-- 1. Revoke sensitive columns from anon role
REVOKE SELECT (license_plate, vin) ON public.vehicles FROM anon;
REVOKE SELECT (revenue, total_bookings, commission_rate, one_way_fee) ON public.agencies FROM anon;

-- 2. Super admins can view all agency_members
DROP POLICY IF EXISTS "Super admins can view all agency_members" ON public.agency_members;
CREATE POLICY "Super admins can view all agency_members"
ON public.agency_members
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- 3. Drivers DELETE policy
DROP POLICY IF EXISTS "Agency members can delete drivers" ON public.drivers;
CREATE POLICY "Agency members can delete drivers"
ON public.drivers
FOR DELETE
TO authenticated
USING (
  (agency_id IN (SELECT agency_id FROM public.agency_members WHERE user_id = auth.uid()))
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

-- 4. Bookings UPDATE & DELETE policies
DROP POLICY IF EXISTS "Agency members can update bookings" ON public.bookings;
CREATE POLICY "Agency members can update bookings"
ON public.bookings
FOR UPDATE
TO authenticated
USING (
  (agency_id IN (SELECT agency_id FROM public.agency_members WHERE user_id = auth.uid()))
  OR has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  (agency_id IN (SELECT agency_id FROM public.agency_members WHERE user_id = auth.uid()))
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

DROP POLICY IF EXISTS "Agency members can delete bookings" ON public.bookings;
CREATE POLICY "Agency members can delete bookings"
ON public.bookings
FOR DELETE
TO authenticated
USING (
  (agency_id IN (SELECT agency_id FROM public.agency_members WHERE user_id = auth.uid()))
  OR has_role(auth.uid(), 'super_admin'::app_role)
);
