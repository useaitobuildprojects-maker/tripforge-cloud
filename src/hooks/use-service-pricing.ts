import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ── Types ──
export interface TransferRoute {
  id: string;
  agency_id: string;
  origin: string;
  destination: string;
  distance_km: number | null;
  price: number;
  max_passengers: number | null;
  notes: string | null;
  created_at: string;
}

export interface LimoTourPrice {
  id: string;
  agency_id: string;
  city: string;
  daily_rate: number;
  min_days: number | null;
  description: string | null;
  created_at: string;
}

export interface CityTourPrice {
  id: string;
  agency_id: string;
  tour_name: string;
  daily_rate: number;
  duration_hours: number | null;
  description: string | null;
  created_at: string;
}

export interface CarRentalPrice {
  id: string;
  agency_id: string;
  vehicle_class: string;
  daily_rate: number;
  weekly_rate: number | null;
  monthly_rate: number | null;
  drop_off_fee: number;
  description: string | null;
  brand: string | null;
  model: string | null;
  year: number | null;
  transmission: string | null;
  fuel_type: string | null;
  seats: number | null;
  image_url: string | null;
  created_at: string;
}

// ── Transfer Routes ──
export const useTransferRoutes = (agencyId: string | undefined) =>
  useQuery({
    queryKey: ['transfer-routes', agencyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transfer_routes')
        .select('*')
        .eq('agency_id', agencyId!)
        .order('origin');
      if (error) throw error;
      return (data ?? []) as TransferRoute[];
    },
    enabled: !!agencyId,
  });

export const useAddTransferRoute = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<TransferRoute, 'id' | 'created_at'>) => {
      const { data, error } = await supabase.from('transfer_routes').insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: ['transfer-routes', v.agency_id] }); toast.success('Route added'); },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeleteTransferRoute = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, agencyId }: { id: string; agencyId: string }) => {
      const { error } = await supabase.from('transfer_routes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: ['transfer-routes', v.agencyId] }); },
  });
};

// ── Limo Tour Pricing ──
export const useLimoTourPricing = (agencyId: string | undefined) =>
  useQuery({
    queryKey: ['limo-tour-pricing', agencyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('limo_tour_pricing')
        .select('*')
        .eq('agency_id', agencyId!)
        .order('city');
      if (error) throw error;
      return (data ?? []) as LimoTourPrice[];
    },
    enabled: !!agencyId,
  });

export const useAddLimoTourPrice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<LimoTourPrice, 'id' | 'created_at'>) => {
      const { data, error } = await supabase.from('limo_tour_pricing').insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: ['limo-tour-pricing', v.agency_id] }); toast.success('City pricing added'); },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeleteLimoTourPrice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, agencyId }: { id: string; agencyId: string }) => {
      const { error } = await supabase.from('limo_tour_pricing').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: ['limo-tour-pricing', v.agencyId] }); },
  });
};

// ── City Tour Pricing ──
export const useCityTourPricing = (agencyId: string | undefined) =>
  useQuery({
    queryKey: ['city-tour-pricing', agencyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('city_tour_pricing')
        .select('*')
        .eq('agency_id', agencyId!)
        .order('tour_name');
      if (error) throw error;
      return (data ?? []) as CityTourPrice[];
    },
    enabled: !!agencyId,
  });

export const useAddCityTourPrice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<CityTourPrice, 'id' | 'created_at'>) => {
      const { data, error } = await supabase.from('city_tour_pricing').insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: ['city-tour-pricing', v.agency_id] }); toast.success('Tour pricing added'); },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeleteCityTourPrice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, agencyId }: { id: string; agencyId: string }) => {
      const { error } = await supabase.from('city_tour_pricing').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: ['city-tour-pricing', v.agencyId] }); },
  });
};

// ── Car Rental Pricing ──
export const useCarRentalPricing = (agencyId: string | undefined) =>
  useQuery({
    queryKey: ['car-rental-pricing', agencyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('car_rental_pricing')
        .select('*')
        .eq('agency_id', agencyId!)
        .order('vehicle_class');
      if (error) throw error;
      return (data ?? []) as CarRentalPrice[];
    },
    enabled: !!agencyId,
  });

export const useAddCarRentalPrice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<CarRentalPrice, 'id' | 'created_at'>) => {
      const { data, error } = await supabase.from('car_rental_pricing').insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: ['car-rental-pricing', v.agency_id] }); toast.success('Car rental pricing added'); },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeleteCarRentalPrice = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, agencyId }: { id: string; agencyId: string }) => {
      const { error } = await supabase.from('car_rental_pricing').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: ['car-rental-pricing', v.agencyId] }); },
  });
};
