
-- 1. Remove overly broad agency update policy (privilege escalation fix)
DROP POLICY IF EXISTS "Agency admins can update agencies" ON public.agencies;

-- 2. Hide sensitive financial columns from anonymous users
REVOKE SELECT (revenue, total_bookings) ON public.agencies FROM anon;

-- 3. Hide license plates from anonymous storefront visitors
REVOKE SELECT (license_plate) ON public.vehicles FROM anon;
REVOKE SELECT (license_plate) ON public.vehicles FROM authenticated;
GRANT SELECT (license_plate) ON public.vehicles TO authenticated;
-- Note: RLS still controls row visibility; column grant ensures anon cannot read it even via the public policy.

-- 4. Add missing SELECT policy on bookings so agency members can read their own agency's bookings
CREATE POLICY "Agency members can view bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (
  agency_id IN (
    SELECT agency_members.agency_id
    FROM agency_members
    WHERE agency_members.user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'super_admin'::app_role)
);
