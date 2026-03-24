import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface StorefrontVehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  status: 'available' | 'rented' | 'maintenance';
  photo_url: string | null;
  daily_rate: number | null;
}

export const useStorefrontVehicles = (agencyId: string | undefined) => {
  return useQuery({
    queryKey: ['storefront-vehicles', agencyId],
    queryFn: async (): Promise<StorefrontVehicle[]> => {
      // Fetch available vehicles for this agency
      const { data: vehicles, error } = await supabase
        .from('vehicles')
        .select('id, brand, model, year, status, photo_url')
        .eq('agency_id', agencyId!)
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!vehicles?.length) return [];

      // Fetch current pricing for these vehicles
      const vehicleIds = vehicles.map((v: any) => v.id);
      const today = new Date().toISOString().split('T')[0];

      const { data: pricing } = await supabase
        .from('vehicle_pricing')
        .select('vehicle_id, daily_rate')
        .in('vehicle_id', vehicleIds)
        .lte('start_date', today)
        .gte('end_date', today);

      // Build a map of vehicle_id -> daily_rate (use first matching season)
      const priceMap: Record<string, number> = {};
      if (pricing) {
        for (const p of pricing as any[]) {
          if (!priceMap[p.vehicle_id]) {
            priceMap[p.vehicle_id] = p.daily_rate;
          }
        }
      }

      // If no seasonal pricing, try to get any pricing as fallback
      const missingIds = vehicleIds.filter((id: string) => !priceMap[id]);
      if (missingIds.length > 0) {
        const { data: fallback } = await supabase
          .from('vehicle_pricing')
          .select('vehicle_id, daily_rate')
          .in('vehicle_id', missingIds)
          .order('start_date', { ascending: true });

        if (fallback) {
          for (const p of fallback as any[]) {
            if (!priceMap[p.vehicle_id]) {
              priceMap[p.vehicle_id] = p.daily_rate;
            }
          }
        }
      }

      return (vehicles as any[]).map((v) => ({
        ...v,
        daily_rate: priceMap[v.id] ?? null,
      }));
    },
    enabled: !!agencyId,
  });
};
