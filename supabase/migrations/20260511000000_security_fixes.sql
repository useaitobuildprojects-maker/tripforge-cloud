-- Restrict sensitive vehicle columns from anonymous access
REVOKE SELECT (license_plate, vin) ON public.vehicles FROM anon;

-- Add explicit booking management policies for agency members
CREATE POLICY "Agency members can insert bookings"
ON public.bookings
FOR INSERT
TO authenticated
WITH CHECK (
  (agency_id IN (SELECT agency_id FROM public.agency_members WHERE user_id = auth.uid()))
  OR has_role(auth.uid(), 'super_admin'::app_role)
);

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

CREATE POLICY "Agency members can delete bookings"
ON public.bookings
FOR DELETE
TO authenticated
USING (
  (agency_id IN (SELECT agency_id FROM public.agency_members WHERE user_id = auth.uid()))
  OR has_role(auth.uid(), 'super_admin'::app_role)
);
