import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUpdateAgency } from '@/hooks/use-agency-mutations';
import { toast } from 'sonner';

export const useAgencyImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const updateAgency = useUpdateAgency();

  const uploadImage = async (
    agencyId: string,
    agencySlug: string,
    file: File,
    type: 'logo' | 'favicon',
    currentAgency: { slug: string; name: string; status: 'active' | 'inactive' | 'pending'; services: string[]; country: string; city: string; contact_email: string }
  ) => {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `${agencySlug}/${type}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('agency-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('agency-assets')
        .getPublicUrl(filePath);

      const field = type === 'logo' ? 'logo_url' : 'favicon_url';

      await updateAgency.mutateAsync({
        id: agencyId,
        slug: currentAgency.slug,
        name: currentAgency.name,
        status: currentAgency.status,
        services: currentAgency.services,
        country: currentAgency.country,
        city: currentAgency.city,
        contact_email: currentAgency.contact_email,
        [field]: publicUrl,
      });

      toast.success(`${type === 'logo' ? 'Logo' : 'Favicon'} uploaded successfully`);
      return publicUrl;
    } catch (error: any) {
      toast.error(`Failed to upload ${type}: ${error.message}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadImage, uploading };
};
