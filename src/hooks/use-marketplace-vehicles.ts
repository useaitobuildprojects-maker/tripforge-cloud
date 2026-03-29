import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MarketplaceVehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  status: 'available' | 'rented' | 'maintenance';
  photo_url: string | null;
  daily_rate: number | null;
  price_per_km: number | null;
  display_price_per_km: number | null;
  daily_rate_base: number | null;
  free_km_per_day: number | null;
  transmission: string | null;
  seats: number | null;
  fuel_type: string | null;
  category: string | null;
  air_conditioning: boolean | null;
  mileage_policy: string | null;
  // Agency info
  agency_id: string;
  agency_name: string;
  agency_slug: string;
  agency_logo_url: string | null;
  agency_one_way_fee: number;
  is_own: boolean;
  // Commission
  commission_rate: number;
  original_rate: number | null;
  display_rate: number | null;
}

export const useMarketplaceVehicles = (currentAgencyId: string | undefined, commissionRate: number = 10) => {
  return useQuery({
    queryKey: ['marketplace-vehicles', currentAgencyId],
    queryFn: async (): Promise<MarketplaceVehicle[]> => {
      // Fetch ALL available vehicles with agency info
      const { data: vehicles, error } = await supabase
        .from('vehicles')
        .select('id, brand, model, year, status, photo_url, transmission, seats, fuel_type, category, air_conditioning, mileage_policy, price_per_km, daily_rate_base, free_km_per_day, agency_id, agencies!inner(name, slug, logo_url, commission_rate, one_way_fee)')
        .eq('status', 'available')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!vehicles?.length) return [];

      // Fetch pricing for all vehicles
      const vehicleIds = vehicles.map((v: any) => v.id);
      const today = new Date().toISOString().split('T')[0];

      const { data: pricing } = await supabase
        .from('vehicle_pricing')
        .select('vehicle_id, daily_rate')
        .in('vehicle_id', vehicleIds)
        .lte('start_date', today)
        .gte('end_date', today);

      const priceMap: Record<string, number> = {};
      if (pricing) {
        for (const p of pricing as any[]) {
          if (!priceMap[p.vehicle_id]) {
            priceMap[p.vehicle_id] = p.daily_rate;
          }
        }
      }

      // Fallback pricing for vehicles without current season
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

      return (vehicles as any[]).map((v) => {
        const isOwn = v.agency_id === currentAgencyId;
        const originalRate = priceMap[v.id] ?? null;
        const agencyCommission = v.agencies?.commission_rate ?? commissionRate;
        const displayRate = originalRate && !isOwn
          ? Math.round(originalRate * (1 + agencyCommission / 100))
          : originalRate;
        const originalPricePerKm = v.price_per_km ?? null;
        const displayPricePerKm = originalPricePerKm && !isOwn
          ? +(originalPricePerKm * (1 + agencyCommission / 100)).toFixed(2)
          : originalPricePerKm;

        return {
          id: v.id,
          brand: v.brand,
          model: v.model,
          year: v.year,
          status: v.status,
          photo_url: v.photo_url,
          transmission: v.transmission,
          seats: v.seats,
          fuel_type: v.fuel_type,
          category: v.category,
          air_conditioning: v.air_conditioning,
          mileage_policy: v.mileage_policy,
          price_per_km: originalPricePerKm,
          display_price_per_km: displayPricePerKm,
          agency_id: v.agency_id,
          agency_name: v.agencies?.name ?? '',
          agency_slug: v.agencies?.slug ?? '',
          agency_logo_url: v.agencies?.logo_url ?? null,
          is_own: isOwn,
          commission_rate: agencyCommission,
          original_rate: originalRate,
          daily_rate: displayRate,
          display_rate: displayRate,
        };
      });
    },
    enabled: !!currentAgencyId,
  });
};
