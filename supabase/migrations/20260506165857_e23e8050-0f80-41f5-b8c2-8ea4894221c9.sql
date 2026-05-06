
-- Insert dummy vehicles for Sahara Tours
WITH agency AS (SELECT id, city, country FROM public.agencies WHERE slug='sahara-tours' LIMIT 1),
ins AS (
  INSERT INTO public.vehicles (
    agency_id, brand, model, year, status, transmission, seats, fuel_type, category,
    air_conditioning, mileage_policy, daily_rate_base, free_km_per_day, price_per_km,
    home_city, home_country, drop_off_mode, drop_off_fee, license_plate, photo_url
  )
  SELECT a.id, v.brand, v.model, v.year, 'available', v.transmission, v.seats, v.fuel_type, v.category,
         true, 'limited', v.daily_rate, v.free_km, v.price_km,
         a.city, a.country, v.mode, v.fee, v.plate,
         'https://images.unsplash.com/' || v.photo
  FROM agency a, (VALUES
    ('Fiat',        '500',         2023, 'manual',    4, 'gasoline', 'economy',  45,  200, 0.25, 'fixed',   50,  'MI-100-AA', 'photo-1471444928139-48c5bf5173f8?w=800'),
    ('Volkswagen',  'Golf',        2024, 'automatic', 5, 'diesel',   'compact',  65,  250, 0.30, 'fixed',   80,  'MI-200-BB', 'photo-1606664515524-ed2f786a0bd6?w=800'),
    ('BMW',         '3 Series',    2024, 'automatic', 5, 'gasoline', 'sedan',   110,  250, 0.45, 'per_km',  0,   'MI-300-CC', 'photo-1555215695-3004980ad54e?w=800'),
    ('Mercedes-Benz','E-Class',    2024, 'automatic', 5, 'diesel',   'luxury',  160,  300, 0.60, 'per_km',  0,   'MI-400-DD', 'photo-1617531653332-bd46c24f2068?w=800'),
    ('Audi',        'Q5',          2023, 'automatic', 5, 'diesel',   'suv',     140,  300, 0.55, 'fixed',   120, 'MI-500-EE', 'photo-1606152421802-db97b9c7a11b?w=800'),
    ('Mercedes-Benz','V-Class',    2024, 'automatic', 8, 'diesel',   'van',     180,  350, 0.70, 'per_km',  0,   'MI-600-FF', 'photo-1609520505218-7421df11722a?w=800')
  ) AS v(brand, model, year, transmission, seats, fuel_type, category, daily_rate, free_km, price_km, mode, fee, plate, photo)
  RETURNING id, daily_rate_base
)
INSERT INTO public.vehicle_pricing (vehicle_id, season_name, start_date, end_date, daily_rate, weekly_rate, monthly_rate)
SELECT id, 'Standard 2026', '2026-01-01', '2026-12-31', daily_rate_base, daily_rate_base * 6, daily_rate_base * 24
FROM ins;
