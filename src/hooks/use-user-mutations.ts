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

      // 2. Auto-confirm email so admin-created users can sign in immediately
      const { data: confirmed, error: confirmError } = await supabase.rpc('confirm_user_email', {
        target_user_id: userId,
      });

      if (confirmError) {
        if (confirmError.code === '42883') {
          throw new Error('Missing confirm_user_email function. Please run SQL setup in Supabase first.');
        }
        throw confirmError;
      }

      if (!confirmed) {
        throw new Error('User created, but email confirmation failed.');
      }

      // 3. Assign role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: input.role });

      if (roleError) throw roleError;

      // 4. Link to agency if agency_admin
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
      const { data, error } = await supabase.rpc('delete_user_account', {
        target_user_id: userId,
      });

      if (error) {
        if (error.code === '42883') {
          throw new Error('Delete function is missing. Please run the SQL setup for delete_user_account first.');
        }
        throw error;
      }

      if (!data) {
        throw new Error('User was not deleted from authentication.');
      }

      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted from platform and authentication');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete user: ${error.message}`);
    },
  });
};
