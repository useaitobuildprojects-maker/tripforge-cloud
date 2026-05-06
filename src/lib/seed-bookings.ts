import { supabase } from '@/integrations/supabase/client';

export async function seedAtlasTravelBookings() {
  // Get atlas-travel agency ID
  const { data: agency, error: agencyErr } = await supabase
    .from('agencies')
    .select('id')
    .eq('slug', 'atlas-travel')
    .single();

  if (agencyErr || !agency) {
    console.error('Agency not found:', agencyErr);
    return;
  }

  const agencyId = agency.id;

  const bookings = [
    { agency_id: agencyId, customer_name: 'Ahmed Ben Ali', service_type: 'car_rental', status: 'confirmed', amount: 450, booking_date: '2026-03-15' },
    { agency_id: agencyId, customer_name: 'Sophie Martin', service_type: 'transfer', status: 'completed', amount: 1200, booking_date: '2026-03-10' },
    { agency_id: agencyId, customer_name: 'Marco Rossi', service_type: 'travel_package', status: 'pending', amount: 3500, booking_date: '2026-03-18' },
    { agency_id: agencyId, customer_name: 'Fatima Zahra', service_type: 'hotel', status: 'confirmed', amount: 890, booking_date: '2026-03-12' },
    { agency_id: agencyId, customer_name: 'Jean Dupont', service_type: 'car_rental', status: 'in_progress', amount: 275, booking_date: '2026-03-16' },
    { agency_id: agencyId, customer_name: 'Lina Kaddouri', service_type: 'transfer', status: 'completed', amount: 600, booking_date: '2026-03-08' },
    { agency_id: agencyId, customer_name: 'Thomas Weber', service_type: 'travel_package', status: 'cancelled', amount: 2100, booking_date: '2026-03-05' },
    { agency_id: agencyId, customer_name: 'Yasmine Belkacem', service_type: 'hotel', status: 'confirmed', amount: 1450, booking_date: '2026-03-14' },
  ];

  const { error } = await supabase.from('bookings').insert(bookings as any);

  if (error) {
    console.error('Failed to seed bookings:', error);
  } else {
    console.log('✅ Seeded 8 dummy bookings for atlas-travel');
  }
}
