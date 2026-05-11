import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Apartment {
  id: string;
  agency_id: string;
  serial_number?: string | null;
  title: string;
  description: string | null;
  photos: string[];
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  address: string | null;
  city: string;
  country: string;
  nightly_rate: number;
  cleaning_fee: number;
  amenities: string[];
  status: 'available' | 'booked' | 'maintenance';
  created_at: string;
}

export const useAgencyApartments = (agencyId: string | undefined) => {
  return useQuery({
    queryKey: ['apartments', agencyId],
    queryFn: async (): Promise<Apartment[]> => {
      const { data, error } = await (supabase as any)
        .from('apartments')
        .select('*')
        .eq('agency_id', agencyId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Apartment[];
    },
    enabled: !!agencyId,
  });
};

export type ApartmentInput = Omit<Apartment, 'id' | 'created_at'>;

export const useUpsertApartment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<Apartment> & { agency_id: string }) => {
      if (id) {
        const { data, error } = await (supabase as any).from('apartments').update(input).eq('id', id).select().single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await (supabase as any).from('apartments').insert(input).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['apartments', vars.agency_id] });
      toast.success('Apartment saved');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useDeleteApartment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; agency_id: string }) => {
      const { error } = await (supabase as any).from('apartments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['apartments', vars.agency_id] });
      toast.success('Apartment deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });
};

export const useUploadApartmentPhoto = () => {
  return useMutation({
    mutationFn: async ({ file, agencyId }: { file: File; agencyId: string }) => {
      const ext = file.name.split('.').pop();
      const path = `apartments/${agencyId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from('vehicle-photos').upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from('vehicle-photos').getPublicUrl(path);
      return data.publicUrl;
    },
    onError: (e: Error) => toast.error('Photo upload failed: ' + e.message),
  });
};

export const AMENITY_OPTIONS = [
  'wifi', 'kitchen', 'air_conditioning', 'heating', 'parking', 'pool',
  'washer', 'dryer', 'tv', 'workspace', 'elevator', 'gym', 'balcony', 'pets_allowed',
];
