import { StorefrontConfig, ServiceType, SERVICE_LABELS } from '@/types/agency';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Upload, Plus, Trash2, Home, Info, Phone, Car, Layers, BookOpen, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useAgencyImageUpload } from '@/hooks/use-agency-image-upload';

interface PageContentEditorProps {
  config: StorefrontConfig;
  onChange: (config: StorefrontConfig) => void;
  agencyId: string;
  agencySlug: string;
  agencyName: string;
  enabledServices: string[];
}

const ImageUploadField = ({
  label,
  currentUrl,
  agencyId,
  agencySlug,
  imageKey,
  onUploaded,
  hint,
}: {
  label: string;
  currentUrl?: string;
  agencyId: string;
  agencySlug: string;
  imageKey: string;
  onUploaded: (url: string) => void;
  hint?: string;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, uploading } = useAgencyImageUpload();

  const handleFile = async (file: File) => {
    const url = await uploadImage(agencyId, agencySlug, file, imageKey as any);
    if (url) onUploaded(url);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        onClick={() => inputRef.current?.click()}
        className="relative group cursor-pointer rounded-xl border-2 border-dashed border-border hover:border-accent h-36 flex items-center justify-center bg-secondary/20 transition-colors overflow-hidden"
      >
        {currentUrl ? (
          <>
            <img src={currentUrl} alt={label} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Upload className="h-5 w-5 text-muted-foreground" />
            </div>
          </>
        ) : (
          <div className="text-center">
            <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-1.5" />
            <p className="text-xs text-muted-foreground">Click to upload</p>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      {uploading && <p className="text-xs text-accent animate-pulse">Uploading...</p>}
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
};

const PageContentEditor = ({ config, onChange, agencyId, agencySlug, agencyName, enabledServices }: PageContentEditorProps) => {
  const update = (field: keyof StorefrontConfig, value: any) => {
    onChange({ ...config, [field]: value });
  };

  const values = config.about_values ?? [
    { title: 'Trust & Safety', description: 'Every vehicle is thoroughly inspected and insured for your peace of mind.' },
    { title: 'Premium Quality', description: 'We maintain a curated fleet of top-tier vehicles from leading manufacturers.' },
    { title: 'Customer First', description: 'Our dedicated team is available around the clock to assist you.' },
    { title: 'Flexibility', description: 'Easy booking, free cancellation, and flexible rental periods.' },
  ];

  const updateValue = (index: number, field: 'title' | 'description', value: string) => {
    const updated = [...values];
    updated[index] = { ...updated[index], [field]: value };
    update('about_values', updated);
  };

  const addValue = () => {
    update('about_values', [...values, { title: '', description: '' }]);
  };

  const removeValue = (index: number) => {
    update('about_values', values.filter((_, i) => i !== index));
  };

  const serviceDescs = config.service_descriptions ?? {};
  const updateServiceDesc = (service: string, desc: string) => {
    update('service_descriptions', { ...serviceDescs, [service]: desc });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18 }}
      className="card-premium rounded-xl p-7 space-y-5"
    >
      <div>
        <h2 className="text-lg font-display font-bold text-foreground">Page Content</h2>
        <p className="text-sm text-muted-foreground mt-1">Edit text and images shown on each storefront page</p>
      </div>

      <Tabs defaultValue="home" className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="home" className="gap-1.5 text-xs"><Home className="h-3.5 w-3.5" /> Home</TabsTrigger>
          <TabsTrigger value="about" className="gap-1.5 text-xs"><Info className="h-3.5 w-3.5" /> About</TabsTrigger>
          <TabsTrigger value="contact" className="gap-1.5 text-xs"><Phone className="h-3.5 w-3.5" /> Contact</TabsTrigger>
          <TabsTrigger value="fleet" className="gap-1.5 text-xs"><Car className="h-3.5 w-3.5" /> Fleet</TabsTrigger>
          <TabsTrigger value="services" className="gap-1.5 text-xs"><Layers className="h-3.5 w-3.5" /> Services</TabsTrigger>
        </TabsList>

        {/* HOME */}
        <TabsContent value="home" className="space-y-4 mt-4">
          <ImageUploadField
            label="Hero Background Image"
            currentUrl={config.home_hero_image}
            agencyId={agencyId}
            agencySlug={agencySlug}
            imageKey="hero"
            onUploaded={(url) => update('home_hero_image', url)}
            hint="Recommended: 1920×800px. Displayed as the main hero background."
          />
          <p className="text-xs text-muted-foreground">Hero title, subtitle, and CTA are edited in the "Hero & Tagline" section above.</p>
        </TabsContent>

        {/* ABOUT */}
        <TabsContent value="about" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Page Title</Label>
              <Input
                value={config.about_title ?? ''}
                onChange={(e) => update('about_title', e.target.value)}
                placeholder={`About ${agencyName}`}
              />
            </div>
            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input
                value={config.about_subtitle ?? ''}
                onChange={(e) => update('about_subtitle', e.target.value)}
                placeholder={`Your trusted partner for premium travel services`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Our Story — Paragraph 1</Label>
            <Textarea
              value={config.about_story_1 ?? ''}
              onChange={(e) => update('about_story_1', e.target.value)}
              placeholder={`Founded with a passion for exceptional travel experiences, ${agencyName} has grown into one of the most trusted travel service providers...`}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Our Story — Paragraph 2</Label>
            <Textarea
              value={config.about_story_2 ?? ''}
              onChange={(e) => update('about_story_2', e.target.value)}
              placeholder="Our team of dedicated professionals works tirelessly to ensure that every customer receives personalized attention..."
              rows={3}
            />
          </div>

          <ImageUploadField
            label="About Page Image"
            currentUrl={config.about_image_url}
            agencyId={agencyId}
            agencySlug={agencySlug}
            imageKey="about"
            onUploaded={(url) => update('about_image_url', url)}
            hint="Shown alongside the 'Our Story' section. Recommended: 600×400px."
          />

          {/* Values */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Our Values</Label>
              <Button type="button" variant="outline" size="sm" onClick={addValue} className="gap-1 text-xs">
                <Plus className="h-3 w-3" /> Add
              </Button>
            </div>
            {values.map((v, i) => (
              <div key={i} className="flex gap-3 items-start p-3 rounded-lg border border-border bg-secondary/20">
                <div className="flex-1 space-y-2">
                  <Input
                    value={v.title}
                    onChange={(e) => updateValue(i, 'title', e.target.value)}
                    placeholder="Value title"
                    className="h-8 text-sm"
                  />
                  <Input
                    value={v.description}
                    onChange={(e) => updateValue(i, 'description', e.target.value)}
                    placeholder="Value description"
                    className="h-8 text-sm"
                  />
                </div>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive" onClick={() => removeValue(i)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* CONTACT */}
        <TabsContent value="contact" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Page Title</Label>
            <Input
              value={config.contact_title ?? ''}
              onChange={(e) => update('contact_title', e.target.value)}
              placeholder="Contact Us"
            />
          </div>
          <div className="space-y-2">
            <Label>Subtitle</Label>
            <Input
              value={config.contact_subtitle ?? ''}
              onChange={(e) => update('contact_subtitle', e.target.value)}
              placeholder="Have a question or need assistance? We'd love to hear from you."
            />
          </div>
          <p className="text-xs text-muted-foreground">Phone, working hours, and email are edited in the "Contact Details" and "General Information" sections.</p>
        </TabsContent>

        {/* FLEET */}
        <TabsContent value="fleet" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Page Title</Label>
            <Input
              value={config.fleet_title ?? ''}
              onChange={(e) => update('fleet_title', e.target.value)}
              placeholder="Our Fleet"
            />
          </div>
          <div className="space-y-2">
            <Label>Subtitle</Label>
            <Input
              value={config.fleet_subtitle ?? ''}
              onChange={(e) => update('fleet_subtitle', e.target.value)}
              placeholder={`Explore our carefully curated selection of premium vehicles, ready for your next adventure.`}
            />
          </div>
        </TabsContent>

        {/* SERVICES */}
        <TabsContent value="services" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Page Title</Label>
              <Input
                value={config.services_title ?? ''}
                onChange={(e) => update('services_title', e.target.value)}
                placeholder="Our Services"
              />
            </div>
            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input
                value={config.services_subtitle ?? ''}
                onChange={(e) => update('services_subtitle', e.target.value)}
                placeholder={`Discover our range of premium services tailored to your needs.`}
              />
            </div>
          </div>

          {enabledServices.length > 0 && (
            <div className="space-y-3">
              <Label>Service Descriptions</Label>
              {enabledServices.map((service) => (
                <div key={service} className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">{SERVICE_LABELS[service as ServiceType]}</Label>
                  <Textarea
                    value={serviceDescs[service as ServiceType] ?? ''}
                    onChange={(e) => updateServiceDesc(service, e.target.value)}
                    placeholder={`Custom description for ${SERVICE_LABELS[service as ServiceType]}...`}
                    rows={2}
                    className="text-sm"
                  />
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default PageContentEditor;
