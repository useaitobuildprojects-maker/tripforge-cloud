import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Agency, DashboardStats } from '@/types/agency';

const mapAgency = (a: any): Agency => ({
  id: a.id,
  name: a.name,
  slug: a.slug,
  domain: a.domain,
  logo_url: a.logo_url,
  status: a.status,
  services: a.services ?? [],
  country: a.country,
  city: a.city,
  contact_email: a.contact_email,
  created_at: a.created_at,
  total_bookings: a.total_bookings ?? 0,
  revenue: Number(a.revenue) ?? 0,
  meta_title: a.meta_title ?? null,
  meta_description: a.meta_description ?? null,
  og_image: a.og_image ?? null,
});

export const useAgencies = () => {
  return useQuery({
    queryKey: ['agencies'],
    queryFn: async (): Promise<Agency[]> => {
      const { data, error } = await supabase
        .from('agencies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []).map(mapAgency);
    },
  });
};

export const useAgencyBySlug = (slug: string) => {
  return useQuery({
    queryKey: ['agency', slug],
    queryFn: async (): Promise<Agency | null> => {
      const { data, error } = await supabase
        .from('agencies')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      return data ? mapAgency(data) : null;
    },
    enabled: !!slug,
  });
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const { data, error } = await supabase
        .from('agencies')
        .select('status, total_bookings, revenue');

      if (error) throw error;

      const agencies = data ?? [];
      const total_agencies = agencies.length;
      const active_agencies = agencies.filter((a: any) => a.status === 'active').length;
      const total_bookings = agencies.reduce((sum: number, a: any) => sum + (a.total_bookings ?? 0), 0);
      const total_revenue = agencies.reduce((sum: number, a: any) => sum + Number(a.revenue ?? 0), 0);

      return {
        total_agencies,
        active_agencies,
        total_bookings,
        total_revenue,
        bookings_growth: 0,
        revenue_growth: 0,
      };
    },
  });
};
