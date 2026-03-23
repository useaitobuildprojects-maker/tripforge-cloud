import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface VehiclePricing {
  id: string;
  vehicle_id: string;
  season_name: string;
  start_date: string;
  end_date: string;
  daily_rate: number;
  weekly_rate: number | null;
  monthly_rate: number | null;
  created_at: string;
}

export interface VehicleBlockedDate {
  id: string;
  vehicle_id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  created_at: string;
}

export const useVehiclePricing = (vehicleId: string | undefined) => {
  return useQuery({
    queryKey: ['vehicle-pricing', vehicleId],
    queryFn: async (): Promise<VehiclePricing[]> => {
      const { data, error } = await supabase
        .from('vehicle_pricing')
        .select('*')
        .eq('vehicle_id', vehicleId!)
        .order('start_date', { ascending: true });

      if (error) throw error;
      return (data ?? []) as VehiclePricing[];
    },
    enabled: !!vehicleId,
  });
};

export const useVehicleBlockedDates = (vehicleId: string | undefined) => {
  return useQuery({
    queryKey: ['vehicle-blocked-dates', vehicleId],
    queryFn: async (): Promise<VehicleBlockedDate[]> => {
      const { data, error } = await supabase
        .from('vehicle_blocked_dates')
        .select('*')
        .eq('vehicle_id', vehicleId!)
        .order('start_date', { ascending: true });

      if (error) throw error;
      return (data ?? []) as VehicleBlockedDate[];
    },
    enabled: !!vehicleId,
  });
};

export const useAddPricing = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (pricing: Omit<VehiclePricing, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('vehicle_pricing')
        .insert(pricing)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['vehicle-pricing', vars.vehicle_id] });
    },
  });
};

export const useDeletePricing = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, vehicleId }: { id: string; vehicleId: string }) => {
      const { error } = await supabase.from('vehicle_pricing').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['vehicle-pricing', vars.vehicleId] });
    },
  });
};

export const useAddBlockedDate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (blocked: Omit<VehicleBlockedDate, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('vehicle_blocked_dates')
        .insert(blocked)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['vehicle-blocked-dates', vars.vehicle_id] });
    },
  });
};

export const useDeleteBlockedDate = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, vehicleId }: { id: string; vehicleId: string }) => {
      const { error } = await supabase.from('vehicle_blocked_dates').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['vehicle-blocked-dates', vars.vehicleId] });
    },
  });
};
