import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageSeo, StorefrontTemplate, StorefrontConfig } from '@/types/agency';
import { toast } from 'sonner';

interface CreateAgencyInput {
  name: string;
  slug: string;
  domain?: string;
  status: 'active' | 'inactive' | 'pending';
  services: string[];
  country: string;
  city: string;
  contact_email: string;
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
  page_seo?: PageSeo;
  logo_url?: string;
  favicon_url?: string;
  storefront_template?: StorefrontTemplate;
  button_color?: string;
  background_color?: string;
  storefront_config?: StorefrontConfig;
}

export const useCreateAgency = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateAgencyInput) => {
      const { data, error } = await supabase
        .from('agencies')
        .insert([input])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencies'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Agency created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create agency: ${error.message}`);
    },
  });
};

export const useUpdateAgency = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: CreateAgencyInput & { id: string }) => {
      const { data, error } = await supabase
        .from('agencies')
        .update(input)
        .eq('id', id)
        .select()
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencies'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Agency updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update agency: ${error.message}`);
    },
  });
};

export const useDeleteAgency = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('agencies')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agencies'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Agency deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete agency: ${error.message}`);
    },
  });
};
