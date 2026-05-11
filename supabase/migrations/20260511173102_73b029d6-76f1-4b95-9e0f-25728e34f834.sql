DELETE FROM public.car_rental_pricing a
USING public.car_rental_pricing b
WHERE a.agency_id = b.agency_id
  AND lower(coalesce(a.brand,'')) = lower(coalesce(b.brand,''))
  AND lower(coalesce(a.model,'')) = lower(coalesce(b.model,''))
  AND coalesce(a.year, 0) = coalesce(b.year, 0)
  AND a.created_at > b.created_at;