
-- Restrict anonymous read of internal business metrics on agencies
REVOKE SELECT (revenue, total_bookings) ON public.agencies FROM anon;

-- Restrict anonymous read of vehicle license plate (not used publicly)
REVOKE SELECT (license_plate, vin) ON public.vehicles FROM anon;

-- Add UPDATE policy on storage objects for vehicle-photos to mirror INSERT/DELETE
CREATE POLICY "Agency members update vehicle photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'vehicle-photos'
  AND (
    (((storage.foldername(name))[1])::uuid IN (
      SELECT agency_members.agency_id FROM public.agency_members
      WHERE agency_members.user_id = auth.uid()
    ))
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  )
)
WITH CHECK (
  bucket_id = 'vehicle-photos'
  AND (
    (((storage.foldername(name))[1])::uuid IN (
      SELECT agency_members.agency_id FROM public.agency_members
      WHERE agency_members.user_id = auth.uid()
    ))
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  )
);
