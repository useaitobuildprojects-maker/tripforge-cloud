-- Allow public/anonymous customers to create bookings via storefront
CREATE POLICY "Public can create bookings"
ON public.bookings
FOR INSERT
TO anon, authenticated
WITH CHECK (
  agency_id IS NOT NULL
  AND customer_name IS NOT NULL
  AND length(trim(customer_name)) > 0
  AND pickup_date IS NOT NULL
  AND return_date IS NOT NULL
  AND return_date >= pickup_date
  AND status IN ('pending')
);