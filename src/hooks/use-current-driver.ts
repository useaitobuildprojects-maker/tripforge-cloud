import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CurrentDriver {
  id: string;
  agency_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  status: 'available' | 'on_trip' | 'offline';
  current_lat: number | null;
  current_lng: number | null;
}

export const useCurrentDriver = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['current-driver', user?.id],
    queryFn: async (): Promise<CurrentDriver | null> => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('drivers')
        .select('id, agency_id, full_name, email, phone, status, current_lat, current_lng')
        .eq('auth_user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data as CurrentDriver | null;
    },
    enabled: !!user,
  });
};