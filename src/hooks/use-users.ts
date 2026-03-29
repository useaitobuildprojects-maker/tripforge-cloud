import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AppUser {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  role: string | null;
}

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<AppUser[]> => {
      const { data, error } = await supabase.rpc('get_users_with_roles');
      if (error) throw error;
      return (data ?? []) as AppUser[];
    },
  });
};
