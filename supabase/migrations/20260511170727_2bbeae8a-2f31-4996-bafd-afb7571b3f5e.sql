ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS apartment_id UUID;
CREATE INDEX IF NOT EXISTS idx_bookings_apartment_id ON public.bookings(apartment_id);