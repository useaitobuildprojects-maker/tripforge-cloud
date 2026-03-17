import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Driver {
  id: string;
  agency_id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  base_location: string | null;
  current_lat: number | null;
  current_lng: number | null;
  status: 'available' | 'on_trip' | 'offline';
  created_at: string;
}

export const useAgencyDrivers = (agencyId: string | undefined) => {
  return useQuery({
    queryKey: ['drivers', agencyId],
    queryFn: async (): Promise<Driver[]> => {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('agency_id', agencyId!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as Driver[];
    },
    enabled: !!agencyId,
  });
};
