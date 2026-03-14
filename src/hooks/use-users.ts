import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AppUser {
  id: string;
  email: string;
  created_at: string;
  role: string | null;
}

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<AppUser[]> => {
      // Fetch user roles - we can only see roles, not auth.users directly
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('*');

      if (error) throw error;

      return (roles ?? []).map((r: any) => ({
        id: r.user_id,
        email: r.user_id, // We'll show user_id since we can't access auth.users
        created_at: r.id, // placeholder
        role: r.role,
      }));
    },
  });
};
