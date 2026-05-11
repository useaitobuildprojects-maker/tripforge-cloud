import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Vehicle {
  id: string;
  agency_id: string;
  brand: string;
  model: string;
  year: number;
  license_plate: string | null;
  vin: string | null;
  status: 'available' | 'rented' | 'maintenance';
  photo_url: string | null;
  daily_rate_base: number | null;
  vehicle_class?: string | null;
  serial_number?: string | null;
  created_at: string;
}

export const useAgencyVehicles = (agencyId: string | undefined) => {
  return useQuery({
    queryKey: ['vehicles', agencyId],
    queryFn: async (): Promise<Vehicle[]> => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('agency_id', agencyId!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []) as Vehicle[];
    },
    enabled: !!agencyId,
  });
};

export interface VehicleWithAgency extends Vehicle {
  agency_name: string;
  agency_slug: string;
}

export const useAllVehicles = () => {
  return useQuery({
    queryKey: ['vehicles', 'all'],
    queryFn: async (): Promise<VehicleWithAgency[]> => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*, agencies!inner(name, slug)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []).map((v: any) => ({
        ...v,
        agency_name: v.agencies?.name ?? '',
        agency_slug: v.agencies?.slug ?? '',
      })) as VehicleWithAgency[];
    },
  });
};
