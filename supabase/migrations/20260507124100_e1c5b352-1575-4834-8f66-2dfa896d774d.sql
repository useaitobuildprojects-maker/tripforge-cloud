INSERT INTO public.apartments (agency_id, title, description, photos, bedrooms, bathrooms, max_guests, address, city, country, nightly_rate, cleaning_fee, amenities, status)
SELECT id,
  'Sunny 2BR Loft in Medina',
  'Bright, modern loft steps from the old medina with a rooftop terrace and panoramic skyline views.',
  ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200','https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200'],
  2, 1, 4,
  '12 Rue des Oliviers',
  'Marrakech', 'Morocco',
  95, 25,
  ARRAY['wifi','kitchen','air_conditioning','washer','tv','balcony'],
  'available'
FROM public.agencies WHERE slug = 'sahara-tours';