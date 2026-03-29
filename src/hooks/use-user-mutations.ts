import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateUserInput {
  email: string;
  password: string;
  fullName: string;
  role: 'agency_admin' | 'super_admin';
  agencyId?: string;
}

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateUserInput) => {
      // 1. Create the user via signUp
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: { full_name: input.fullName },
          emailRedirectTo: window.location.origin,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      const userId = authData.user.id;

      // 2. Assign role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: input.role });

      if (roleError) throw roleError;

      // 3. Link to agency if agency_admin
      if (input.role === 'agency_admin' && input.agencyId) {
        const { error: memberError } = await supabase
          .from('agency_members')
          .insert({ user_id: userId, agency_id: input.agencyId });

        if (memberError) throw memberError;
      }

      return { userId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create user: ${error.message}`);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { error: memberError } = await supabase
        .from('agency_members')
        .delete()
        .eq('user_id', userId);

      if (memberError) throw memberError;

      const { data: deletedRoles, error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .select('id');

      if (roleError) throw roleError;

      if (!deletedRoles || deletedRoles.length === 0) {
        throw new Error('Delete blocked by permissions (RLS). Please allow super_admin to delete user_roles.');
      }

      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User removed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete user: ${error.message}`);
    },
  });
};
