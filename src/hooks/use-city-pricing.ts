import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CityPricing {
  id: string;
  agency_id: string;
  city_name: string;
  country: string;
  transfer_base_fee: number;
  transfer_per_km_rate: number;
  drop_off_fee: number;
  created_at: string;
}

export const useCityPricing = (agencyId: string | undefined) =>
  useQuery({
    queryKey: ['city-pricing', agencyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('city_pricing')
        .select('*')
        .eq('agency_id', agencyId!)
        .order('city_name');
      if (error) throw error;
      return (data ?? []).map((row: any) => ({
        ...row,
        drop_off_fee: row.drop_off_fee ?? 0,
      })) as CityPricing[];
    },
    enabled: !!agencyId,
  });

export const useAddCityPricing = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<CityPricing, 'id' | 'created_at'>) => {
      const { data, error } = await supabase.from('city_pricing').insert(input as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['city-pricing', v.agency_id] });
      toast.success('City pricing added');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeleteCityPricing = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, agencyId }: { id: string; agencyId: string }) => {
      const { error } = await supabase.from('city_pricing').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['city-pricing', v.agencyId] });
    },
  });
};
