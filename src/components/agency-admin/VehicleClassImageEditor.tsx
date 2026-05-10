import { useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Upload, X, Loader2 } from 'lucide-react';
import { getVehicleClassImage } from '@/lib/vehicle-class-images';

interface Props {
  agencyId: string;
  category?: string;
  imageUrl?: string;
  onChange: (url: string | undefined) => void;
}

const VehicleClassImageEditor = ({ agencyId, category, imageUrl, onChange }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'png';
      const path = `${agencyId}/vehicle-classes/${category || 'class'}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('agency-assets').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('agency-assets').getPublicUrl(path);
      onChange(publicUrl);
      toast.success('Image uploaded');
    } catch (e: any) {
      toast.error(`Upload failed: ${e.message}`);
    } finally {
      setUploading(false);
    }
  };

  const src = imageUrl || getVehicleClassImage(category);

  return (
    <div className="relative h-10 w-14 shrink-0 group">
      <img src={src} alt={category || 'class'} className="h-10 w-14 object-contain rounded border border-border bg-background" />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded"
        title="Upload custom image"
      >
        {uploading ? <Loader2 className="h-3.5 w-3.5 text-white animate-spin" /> : <Upload className="h-3.5 w-3.5 text-white" />}
      </button>
      {imageUrl && !uploading && (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100"
          title="Reset to default"
        >
          <X className="h-2.5 w-2.5" />
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
      />
    </div>
  );
};

export default VehicleClassImageEditor;