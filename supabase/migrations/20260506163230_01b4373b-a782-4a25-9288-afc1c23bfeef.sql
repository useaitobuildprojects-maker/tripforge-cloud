-- =======================================================================
-- 1. car_rental_pricing: restrict writes to agency members
-- =======================================================================
DROP POLICY IF EXISTS "Anyone can read car_rental_pricing" ON public.car_rental_pricing;
DROP POLICY IF EXISTS "Authenticated can delete car_rental_pricing" ON public.car_rental_pricing;
DROP POLICY IF EXISTS "Authenticated can insert car_rental_pricing" ON public.car_rental_pricing;

CREATE POLICY "Public can read car_rental_pricing"
  ON public.car_rental_pricing FOR SELECT
  USING (true);

CREATE POLICY "Agency members manage car_rental_pricing"
  ON public.car_rental_pricing FOR ALL
  TO authenticated
  USING (
    agency_id IN (SELECT agency_id FROM public.agency_members WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'super_admin')
  )
  WITH CHECK (
    agency_id IN (SELECT agency_id FROM public.agency_members WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'super_admin')
  );

-- =======================================================================
-- 2. vehicle_pricing: restrict to agency members through vehicles
-- =======================================================================
DROP POLICY IF EXISTS "Authenticated users can manage vehicle pricing" ON public.vehicle_pricing;

CREATE POLICY "Agency members manage vehicle_pricing"
  ON public.vehicle_pricing FOR ALL
  TO authenticated
  USING (
    vehicle_id IN (
      SELECT v.id FROM public.vehicles v
      WHERE v.agency_id IN (SELECT agency_id FROM public.agency_members WHERE user_id = auth.uid())
    )
    OR public.has_role(auth.uid(), 'super_admin')
  )
  WITH CHECK (
    vehicle_id IN (
      SELECT v.id FROM public.vehicles v
      WHERE v.agency_id IN (SELECT agency_id FROM public.agency_members WHERE user_id = auth.uid())
    )
    OR public.has_role(auth.uid(), 'super_admin')
  );

-- =======================================================================
-- 3. vehicle_blocked_dates: restrict to agency members through vehicles
-- =======================================================================
DROP POLICY IF EXISTS "Authenticated users can manage blocked dates" ON public.vehicle_blocked_dates;

CREATE POLICY "Public can read vehicle_blocked_dates"
  ON public.vehicle_blocked_dates FOR SELECT
  USING (true);

CREATE POLICY "Agency members manage vehicle_blocked_dates"
  ON public.vehicle_blocked_dates FOR ALL
  TO authenticated
  USING (
    vehicle_id IN (
      SELECT v.id FROM public.vehicles v
      WHERE v.agency_id IN (SELECT agency_id FROM public.agency_members WHERE user_id = auth.uid())
    )
    OR public.has_role(auth.uid(), 'super_admin')
  )
  WITH CHECK (
    vehicle_id IN (
      SELECT v.id FROM public.vehicles v
      WHERE v.agency_id IN (SELECT agency_id FROM public.agency_members WHERE user_id = auth.uid())
    )
    OR public.has_role(auth.uid(), 'super_admin')
  );

-- =======================================================================
-- 4. transfer_routes / city_tour_pricing / limo_tour_pricing: fix broken ownership check
-- =======================================================================
DROP POLICY IF EXISTS "Agency can manage own transfer routes" ON public.transfer_routes;
CREATE POLICY "Public can read transfer_routes"
  ON public.transfer_routes FOR SELECT USING (true);
CREATE POLICY "Agency members manage transfer_routes"
  ON public.transfer_routes FOR ALL
  TO authenticated
  USING (
    agency_id IN (SELECT agency_id FROM public.agency_members WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'super_admin')
  )
  WITH CHECK (
    agency_id IN (SELECT agency_id FROM public.agency_members WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'super_admin')
  );

DROP POLICY IF EXISTS "Agency can manage own city tour pricing" ON public.city_tour_pricing;
CREATE POLICY "Public can read city_tour_pricing"
  ON public.city_tour_pricing FOR SELECT USING (true);
CREATE POLICY "Agency members manage city_tour_pricing"
  ON public.city_tour_pricing FOR ALL
  TO authenticated
  USING (
    agency_id IN (SELECT agency_id FROM public.agency_members WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'super_admin')
  )
  WITH CHECK (
    agency_id IN (SELECT agency_id FROM public.agency_members WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'super_admin')
  );

DROP POLICY IF EXISTS "Agency can manage own limo tour pricing" ON public.limo_tour_pricing;
CREATE POLICY "Public can read limo_tour_pricing"
  ON public.limo_tour_pricing FOR SELECT USING (true);
CREATE POLICY "Agency members manage limo_tour_pricing"
  ON public.limo_tour_pricing FOR ALL
  TO authenticated
  USING (
    agency_id IN (SELECT agency_id FROM public.agency_members WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'super_admin')
  )
  WITH CHECK (
    agency_id IN (SELECT agency_id FROM public.agency_members WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'super_admin')
  );

-- =======================================================================
-- 5. agencies: hide revenue / total_bookings from anon (column-level)
--    contact_email kept public (intentionally shown on storefront contact page)
-- =======================================================================
REVOKE SELECT (revenue, total_bookings) ON public.agencies FROM anon;

-- =======================================================================
-- 6. vehicles: hide vin / license_plate from anon (column-level)
-- =======================================================================
REVOKE SELECT (vin, license_plate) ON public.vehicles FROM anon;

-- =======================================================================
-- 7. Storage: restrict listing/uploads/deletes by path-based agency ownership
-- =======================================================================
-- vehicle-photos: path is `${agencyId}/...`
DROP POLICY IF EXISTS "Anyone can view vehicle photos" ON storage.objects;
DROP POLICY IF EXISTS "Agency members can upload vehicle photos" ON storage.objects;
DROP POLICY IF EXISTS "Agency members can delete vehicle photos" ON storage.objects;

CREATE POLICY "Agency members upload vehicle photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'vehicle-photos'
    AND (
      (storage.foldername(name))[1]::uuid IN (SELECT agency_id FROM public.agency_members WHERE user_id = auth.uid())
      OR public.has_role(auth.uid(), 'super_admin')
    )
  );

CREATE POLICY "Agency members delete vehicle photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'vehicle-photos'
    AND (
      (storage.foldername(name))[1]::uuid IN (SELECT agency_id FROM public.agency_members WHERE user_id = auth.uid())
      OR public.has_role(auth.uid(), 'super_admin')
    )
  );

-- agency-assets: path is `${agencySlug}/...`
DROP POLICY IF EXISTS "Public read access for agency assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload agency assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update agency assets" ON storage.objects;

CREATE POLICY "Agency members upload agency assets"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'agency-assets'
    AND (
      (storage.foldername(name))[1] IN (SELECT a.slug FROM public.agencies a JOIN public.agency_members m ON m.agency_id = a.id WHERE m.user_id = auth.uid())
      OR public.has_role(auth.uid(), 'super_admin')
    )
  );

CREATE POLICY "Agency members update agency assets"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'agency-assets'
    AND (
      (storage.foldername(name))[1] IN (SELECT a.slug FROM public.agencies a JOIN public.agency_members m ON m.agency_id = a.id WHERE m.user_id = auth.uid())
      OR public.has_role(auth.uid(), 'super_admin')
    )
  );

CREATE POLICY "Agency members delete agency assets"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'agency-assets'
    AND (
      (storage.foldername(name))[1] IN (SELECT a.slug FROM public.agencies a JOIN public.agency_members m ON m.agency_id = a.id WHERE m.user_id = auth.uid())
      OR public.has_role(auth.uid(), 'super_admin')
    )
  );

-- Public file SERVING continues to work via the bucket's public flag (CDN getPublicUrl)
-- without needing a broad SELECT policy on storage.objects (which was enabling listing).

-- =======================================================================
-- 8. Lock down admin-only SECURITY DEFINER functions from anon
-- =======================================================================
REVOKE EXECUTE ON FUNCTION public.get_users_with_roles() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_users_with_roles() TO authenticated;

REVOKE EXECUTE ON FUNCTION public.delete_user_account(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_user_account(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.confirm_user_email(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.confirm_user_email(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.create_user_admin(text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_user_admin(text, text, text) TO authenticated;