export type ServiceType = 'car_rental' | 'private_driver' | 'limousine_services' | 'apartment' | 'car_driver';

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
  private_driver: 'Private Driver',
  limousine_services: 'Limousine Services',
  apartment: 'Apartment',
  car_driver: 'Car Driver',
};

export const SERVICE_ICONS: Record<ServiceType, string> = {
  car_rental: 'Car',
  private_driver: 'UserCheck',
  limousine_services: 'Crown',
  apartment: 'Building',
  car_driver: 'Truck',
};

export const PAGE_LABELS: Record<StorefrontPage, string> = {
  home: 'Home',
  fleet: 'Fleet / Services',
  contact: 'Contact',
  about: 'About Us',
};
