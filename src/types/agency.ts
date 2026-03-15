export type ServiceType = 'car_rental' | 'private_driver' | 'hotel' | 'travel_package';

export type StorefrontPage = 'home' | 'fleet' | 'contact' | 'about';

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
}

export interface DashboardStats {
  total_agencies: number;
  active_agencies: number;
  total_bookings: number;
  total_revenue: number;
  bookings_growth: number;
  revenue_growth: number;
}

export const SERVICE_LABELS: Record<ServiceType, string> = {
  car_rental: 'Car Rentals',
  private_driver: 'Private Drivers',
  hotel: 'Hotels',
  travel_package: 'Travel Packages',
};

export const SERVICE_ICONS: Record<ServiceType, string> = {
  car_rental: 'Car',
  private_driver: 'UserCheck',
  hotel: 'Hotel',
  travel_package: 'Globe',
};

export const PAGE_LABELS: Record<StorefrontPage, string> = {
  home: 'Home',
  fleet: 'Fleet / Services',
  contact: 'Contact',
  about: 'About Us',
};
