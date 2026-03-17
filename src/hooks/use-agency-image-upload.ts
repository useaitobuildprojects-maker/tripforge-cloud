import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useAgencyImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const uploadImage = async (
    agencyId: string,
    agencySlug: string,
    file: File,
    type: 'logo' | 'favicon' | 'og',
  ) => {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `${agencySlug}/${type}-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('agency-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('agency-assets')
        .getPublicUrl(filePath);

      // For logo/favicon, update the agency record directly
      if (type !== 'og') {
        const field = type === 'logo' ? 'logo_url' : 'favicon_url';

        const { data: updatedAgency, error: updateError } = await supabase
          .from('agencies')
          .update({ [field]: publicUrl })
          .eq('id', agencyId)
          .select('id')
          .maybeSingle();

        if (updateError) throw updateError;
        if (!updatedAgency) throw new Error('Update blocked by access policy. Please verify agency update permissions.');
      }

      queryClient.invalidateQueries({ queryKey: ['agencies'] });
      queryClient.invalidateQueries({ queryKey: ['agency-admin'] });
      queryClient.invalidateQueries({ queryKey: ['agency'] });

      const label = type === 'logo' ? 'Logo' : type === 'favicon' ? 'Favicon' : 'OG Image';
      toast.success(`${label} uploaded successfully`);
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
