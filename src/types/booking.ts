// ── Insurance Tiers ──
export interface InsuranceTier {
  id: string;
  name: string;
  description: string;
  daily_price: number;
  coverage: string[];
}

export const INSURANCE_TIERS: InsuranceTier[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Third-party liability coverage',
    daily_price: 0,
    coverage: ['Third-party liability', 'Roadside assistance'],
  },
  {
    id: 'medium',
    name: 'Medium',
    description: 'Reduced excess & theft protection',
    daily_price: 12,
    coverage: ['Third-party liability', 'Reduced excess (€500)', 'Theft protection', 'Roadside assistance', 'Windscreen cover'],
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Zero excess & full protection',
    daily_price: 24,
    coverage: ['Third-party liability', 'Zero excess', 'Theft protection', 'Roadside assistance', 'Windscreen cover', 'Tire & key cover', 'Personal accident insurance'],
  },
];

// ── Extras / Add-ons ──
export interface BookingExtra {
  id: string;
  name: string;
  icon: string;
  price_per_day: number;
  max_quantity: number;
  description: string;
}

export const BOOKING_EXTRAS: BookingExtra[] = [
  { id: 'gps', name: 'GPS Navigation', icon: 'Navigation', price_per_day: 5, max_quantity: 1, description: 'Built-in GPS device' },
  { id: 'child_seat', name: 'Child Seat', icon: 'Baby', price_per_day: 7, max_quantity: 3, description: 'Infant or toddler car seat' },
  { id: 'additional_driver', name: 'Additional Driver', icon: 'UserPlus', price_per_day: 8, max_quantity: 2, description: 'Register an extra driver' },
  { id: 'wifi', name: 'Mobile WiFi', icon: 'Wifi', price_per_day: 6, max_quantity: 1, description: 'Portable WiFi hotspot' },
  { id: 'snow_chains', name: 'Snow Chains', icon: 'Snowflake', price_per_day: 4, max_quantity: 1, description: 'Winter driving equipment' },
  { id: 'roof_rack', name: 'Roof Rack', icon: 'Package', price_per_day: 10, max_quantity: 1, description: 'Extra luggage capacity' },
];

// ── Booking Quote Calculator ──
export interface BookingQuote {
  vehicle_daily_rate: number;
  num_days: number;
  estimated_km: number;
  price_per_km: number;
  free_km_per_day: number;
  extra_km: number;
  km_charge: number;
  base_rental: number;
  one_way_fee: number;
  insurance_daily: number;
  insurance_total: number;
  extras_daily: number;
  extras_total: number;
  subtotal: number;
  commission: number;
  total: number;
}

export function calculateQuote(params: {
  daily_rate: number;
  price_per_km: number;
  free_km_per_day: number;
  num_days: number;
  estimated_km: number;
  is_one_way: boolean;
  one_way_fee: number;
  insurance_daily: number;
  extras_daily: number;
  commission_rate: number;
  is_external: boolean;
}): BookingQuote {
  const {
    daily_rate, price_per_km, free_km_per_day, num_days,
    estimated_km, is_one_way, one_way_fee,
    insurance_daily, extras_daily, commission_rate, is_external,
  } = params;

  const base_rental = daily_rate * num_days;
  const free_km = free_km_per_day * num_days;
  const extra_km = Math.max(0, estimated_km - free_km);
  const km_charge = +(extra_km * price_per_km).toFixed(2);
  const owf = is_one_way ? one_way_fee : 0;
  const insurance_total = insurance_daily * num_days;
  const extras_total = extras_daily * num_days;
  const subtotal = base_rental + km_charge + owf + insurance_total + extras_total;
  const commission = is_external ? +(subtotal * commission_rate / 100).toFixed(2) : 0;
  const total = +(subtotal + commission).toFixed(2);

  return {
    vehicle_daily_rate: daily_rate,
    num_days,
    estimated_km,
    price_per_km,
    free_km_per_day,
    extra_km,
    km_charge,
    base_rental,
    one_way_fee: owf,
    insurance_daily,
    insurance_total,
    extras_daily,
    extras_total,
    subtotal,
    commission,
    total,
  };
}
