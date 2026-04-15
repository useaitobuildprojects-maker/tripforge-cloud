export type ServiceType = 'car_rental' | 'apartment' | 'transfer' | 'limo_tour' | 'city_tour';

export type StorefrontPage = 'home' | 'fleet' | 'contact' | 'about';
export type StorefrontTemplate = 'classic' | 'minimal' | 'elegant' | 'corporate' | 'fresh' | 'coastal';
export type StorefrontFont = 'sans' | 'serif' | 'modern' | 'rounded';

export interface StorefrontConfig {
  // Hero
  hero_title?: string;
  hero_subtitle?: string;
  cta_text?: string;
  // Font
  font?: StorefrontFont;
  // Color overrides
  nav_bg_color?: string;
  nav_text_color?: string;
  hero_bg_color?: string;
  hero_text_color?: string;
  hero_subtitle_color?: string;
  footer_bg_color?: string;
  footer_text_color?: string;
  heading_color?: string;
  // Social links
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  whatsapp_number?: string;
  // Contact details
  phone?: string;
  working_hours?: string;
  working_hours_weekend?: string;
  // Locations (pickup/drop-off points)
  locations?: { name: string; type: 'station' | 'airport' | 'city'; address?: string }[];
  // Transfer auto-pricing (base fee + per-km rate + per-minute rate)
  transfer_base_fee?: number;
  transfer_per_km_rate?: number;
  transfer_per_minute_rate?: number;
  transfer_minimum_fare?: number;
  // Transfer vehicle classes: each main category can have multiple sub-classes with seat counts and multipliers
  // e.g. Economy: [{seats: 3, multiplier: 1}, {seats: 4, multiplier: 1.1}, {seats: 8, multiplier: 1.5}]
  transfer_vehicle_classes?: {
    category: 'economy' | 'business' | 'first_class';
    label?: string;
    seats: number;
    multiplier: number;
  }[];
  // Car rental mileage settings
  car_rental_free_km?: number;
  car_rental_extra_km_rate?: number;
  // Limo amenities (displayed on storefront)
  limo_amenities?: string[];
  // Limo service fixed package pricing (per category)
  limo_price_8h_business?: number;
  limo_price_8h_first_class?: number;
  limo_price_8h_van?: number;
  limo_price_8h_suv?: number;
  limo_price_10h_business?: number;
  limo_price_10h_first_class?: number;
  limo_price_10h_van?: number;
  limo_price_10h_suv?: number;
  limo_max_km?: number;
  // Limo point-to-point uses the same transfer formula (base + per-km × multiplier)
  limo_p2p_base_fee?: number;
  limo_p2p_per_km_rate?: number;

  // Transfer: tiered distance pricing (per 100km brackets)
  transfer_distance_tiers?: { from_km: number; to_km: number; per_km_rate: number }[];
  // Transfer: seat-based multiplier (base seats + factor per extra seat)
  transfer_base_seats?: number; // e.g. 3 (default sedan capacity)
  transfer_seat_factor?: number; // e.g. 0.1 = +10% per extra seat above base

  // Limo: city daily rates (half/full day)
  limo_city_rates?: { city: string; full_day_rate: number; half_day_rate: number }[];
  // Limo: multi-day discount (% off when days >= cities)
  limo_multi_day_discount?: number;

  // ── Page Content (editable from admin) ──
  // Home
  home_hero_image?: string;

  // About
  about_title?: string;
  about_subtitle?: string;
  about_story_1?: string;
  about_story_2?: string;
  about_image_url?: string;
  about_values?: { title: string; description: string }[];

  // Contact
  contact_title?: string;
  contact_subtitle?: string;

  // Fleet
  fleet_title?: string;
  fleet_subtitle?: string;

  // Services
  services_title?: string;
  services_subtitle?: string;
  service_descriptions?: Partial<Record<ServiceType, string>>;

  // Blog
  blog_title?: string;
  blog_subtitle?: string;
  blog_posts?: { title: string; category: string; author: string; excerpt: string; image_url?: string }[];

  // Testimonials / Reviews
  reviews_title?: string;
  reviews_subtitle?: string;
  reviews?: { name: string; text: string; rating: number }[];
}

export interface PageSeoEntry {
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
}

export type PageSeo = Partial<Record<StorefrontPage, PageSeoEntry>>;

export interface Agency {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  status: 'active' | 'inactive' | 'pending';
  services: ServiceType[];
  country: string;
  city: string;
  contact_email: string;
  created_at: string;
  total_bookings: number;
  revenue: number;
  meta_title: string | null;
  meta_description: string | null;
  og_image: string | null;
  page_seo: PageSeo | null;
  storefront_template: StorefrontTemplate;
  button_color: string | null;
  background_color: string | null;
  storefront_config: StorefrontConfig | null;
  commission_rate: number;
  one_way_fee: number;
}

export const FONT_OPTIONS: { id: StorefrontFont; name: string; preview: string }[] = [
  { id: 'sans', name: 'Sans Serif', preview: 'font-sans' },
  { id: 'serif', name: 'Serif', preview: 'font-serif' },
  { id: 'modern', name: 'Modern', preview: 'font-sans tracking-tight' },
  { id: 'rounded', name: 'Rounded', preview: 'font-sans' },
];

export interface DashboardStats {
  total_agencies: number;
  active_agencies: number;
  total_bookings: number;
  total_revenue: number;
  bookings_growth: number;
  revenue_growth: number;
}

export const SERVICE_LABELS: Record<ServiceType, string> = {
  car_rental: 'Car Rental',
  apartment: 'Apartment',
  transfer: 'Transfer',
  limo_tour: 'Limo Service',
  city_tour: 'City Tour',
};

export const SERVICE_ICONS: Record<ServiceType, string> = {
  car_rental: 'Car',
  apartment: 'Building',
  transfer: 'Navigation',
  limo_tour: 'Globe',
  city_tour: 'Map',
};

export const PAGE_LABELS: Record<StorefrontPage, string> = {
  home: 'Home',
  fleet: 'Fleet / Services',
  contact: 'Contact',
  about: 'About Us',
};
