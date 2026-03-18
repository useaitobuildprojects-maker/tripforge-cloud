import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Agency } from '@/types/agency';
import { useAuth } from '@/contexts/AuthContext';

const mapAgency = (a: any): Agency => ({
  id: a.id,
  name: a.name,
  slug: a.slug,
  domain: a.domain,
  logo_url: a.logo_url,
  favicon_url: a.favicon_url ?? null,
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
  page_seo: a.page_seo ?? null,
  storefront_template: a.storefront_template ?? 'classic',
  button_color: a.button_color ?? null,
  background_color: a.background_color ?? null,
  storefront_config: a.storefront_config ?? null,
});

/** Fetch the agency that the current user administrates (by slug + RLS) */
export const useAgencyAdmin = (slug: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['agency-admin', slug, user?.id],
    queryFn: async (): Promise<Agency | null> => {
      const { data, error } = await supabase
        .from('agencies')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw error;
      return data ? mapAgency(data) : null;
    },
    enabled: !!slug && !!user,
  });
};

/** Fetch bookings scoped to a specific agency */
export const useAgencyBookings = (agencyId: string | undefined) => {
  return useQuery({
    queryKey: ['agency-bookings', agencyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('agency_id', agencyId!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!agencyId,
  });
};
