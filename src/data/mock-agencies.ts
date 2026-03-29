import { Agency, DashboardStats } from '@/types/agency';

export const mockAgencies: Agency[] = [
  {
    id: '1', name: 'EuroRide Express', slug: 'euroride', domain: 'euroride.travel', logo_url: null, status: 'active',
    services: ['car_rental'], country: 'France', city: 'Paris', contact_email: 'admin@euroride.travel',
    created_at: '2024-11-15', total_bookings: 1243, revenue: 187500, meta_title: null, meta_description: null, og_image: null, favicon_url: null, page_seo: null, storefront_template: 'classic', button_color: null, background_color: null, storefront_config: null, commission_rate: 10,
  },
  {
    id: '2', name: 'Mediterranean Stays', slug: 'medstays', domain: 'medstays.com', logo_url: null, status: 'active',
    services: ['apartment'], country: 'Spain', city: 'Barcelona', contact_email: 'hello@medstays.com',
    created_at: '2024-09-20', total_bookings: 876, revenue: 234100, meta_title: null, meta_description: null, og_image: null, favicon_url: null, page_seo: null, storefront_template: 'minimal', button_color: null, background_color: null, storefront_config: null, commission_rate: 10,
  },
  {
    id: '3', name: 'Alpine Adventures', slug: 'alpine', domain: 'alpine-adventures.eu', logo_url: null, status: 'active',
    services: ['car_rental', 'apartment'], country: 'Switzerland', city: 'Zurich', contact_email: 'info@alpine-adventures.eu',
    created_at: '2025-01-10', total_bookings: 562, revenue: 312800, meta_title: null, meta_description: null, og_image: null, favicon_url: null, page_seo: null, storefront_template: 'elegant', button_color: null, background_color: null, storefront_config: null, commission_rate: 10,
  },
  {
    id: '4', name: 'Adriatic Transfers', slug: 'adriatic', domain: null, logo_url: null, status: 'pending',
    services: ['private_driver'], country: 'Croatia', city: 'Split', contact_email: 'contact@adriatic-transfers.hr',
    created_at: '2025-03-01', total_bookings: 0, revenue: 0, meta_title: null, meta_description: null, og_image: null, favicon_url: null, page_seo: null, storefront_template: 'classic', button_color: null, background_color: null, storefront_config: null, commission_rate: 10,
  },
  {
    id: '5', name: 'Nordic Wheels', slug: 'nordicwheels', domain: 'nordicwheels.no', logo_url: null, status: 'inactive',
    services: ['car_rental'], country: 'Norway', city: 'Oslo', contact_email: 'support@nordicwheels.no',
    created_at: '2024-06-05', total_bookings: 389, revenue: 67200, meta_title: null, meta_description: null, og_image: null, favicon_url: null, page_seo: null, storefront_template: 'classic', button_color: null, background_color: null, storefront_config: null, commission_rate: 10,
  },
];

export const mockStats: DashboardStats = {
  total_agencies: 5,
  active_agencies: 3,
  total_bookings: 3070,
  total_revenue: 801600,
  bookings_growth: 12.5,
  revenue_growth: 18.3,
};
