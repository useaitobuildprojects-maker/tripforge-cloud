import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Agency } from '@/types/agency';

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

/** Known platform hostnames that should NOT trigger domain-based routing */
const PLATFORM_HOSTS = [
  'localhost',
  '127.0.0.1',
  'lovable.app',
  'lovable.dev',
  'tripforge-cloud.lovable.app',
];

const isPlatformHost = (hostname: string): boolean => {
  return PLATFORM_HOSTS.some(
    (h) => hostname === h || hostname.endsWith(`.${h}`)
  );
};

/**
 * Returns the current hostname if it's a custom agency domain,
 * or null if it's a platform domain.
 */
export const getCustomDomain = (): string | null => {
  const hostname = window.location.hostname;
  if (isPlatformHost(hostname)) return null;
  return hostname;
};

/** Look up an agency by its custom domain */
export const useAgencyByDomain = (domain: string | null) => {
  return useQuery({
    queryKey: ['agency-by-domain', domain],
    queryFn: async (): Promise<Agency | null> => {
      if (!domain) return null;

      // Try with and without www prefix
      const variants = [domain];
      if (domain.startsWith('www.')) {
        variants.push(domain.replace('www.', ''));
      } else {
        variants.push(`www.${domain}`);
      }

      const { data, error } = await supabase
        .from('agencies')
        .select('*')
        .in('domain', variants)
        .maybeSingle();

      if (error) throw error;
      return data ? mapAgency(data) : null;
    },
    enabled: !!domain,
  });
};
