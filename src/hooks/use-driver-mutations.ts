import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CreateDriverInput {
  agency_id: string;
  full_name: string;
  phone?: string;
  email?: string;
  base_location?: string;
  status: 'available' | 'on_trip' | 'offline';
}

export const useCreateDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateDriverInput) => {
      const { data, error } = await supabase
        .from('drivers')
        .insert([input])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['drivers', variables.agency_id] });
      toast.success('Driver added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add driver: ${error.message}`);
    },
  });
};

interface UpdateDriverInput {
  id: string;
  agency_id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  base_location: string | null;
  status: 'available' | 'busy' | 'offline';
}

export const useUpdateDriver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateDriverInput) => {
      const { data, error } = await supabase
        .from('drivers')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['drivers', variables.agency_id] });
      toast.success('Driver updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update driver: ${error.message}`);
    },
  });
};
