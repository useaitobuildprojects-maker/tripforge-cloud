import { StorefrontConfig, StorefrontFont, FONT_OPTIONS } from '@/types/agency';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Facebook, Instagram, Twitter, MessageCircle, Phone, Clock, Type, Pencil, Palette, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface StorefrontConfigEditorProps {
  config: StorefrontConfig;
  onChange: (config: StorefrontConfig) => void;
  agencyName: string;
}

const ColorInput = ({
  label,
  value,
  onChange,
  onClear,
  placeholder,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  onClear: () => void;
  placeholder?: string;
}) => (
  <div className="space-y-1.5">
    <Label className="text-xs">{label}</Label>
    <div className="flex items-center gap-2">
      <div className="relative">
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="w-9 h-9 rounded-lg border border-border cursor-pointer p-0.5"
        />
      </div>
      <Input
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? 'Template default'}
        className="flex-1 h-9 text-xs font-mono"
      />
      {value && (
        <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={onClear} title="Reset to template default">
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  </div>
);

const StorefrontConfigEditor = ({ config, onChange, agencyName }: StorefrontConfigEditorProps) => {
  const update = (field: keyof StorefrontConfig, value: string) => {
    onChange({ ...config, [field]: value });
  };

  const clear = (field: keyof StorefrontConfig) => {
    const next = { ...config };
    delete next[field];
    onChange(next);
  };

  return (
    <div className="space-y-8">
      {/* Hero Text */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="card-premium rounded-xl p-7 space-y-5"
      >
        <div className="flex items-center gap-2">
          <Pencil className="h-4 w-4 text-accent" />
          <h2 className="text-lg font-display font-bold text-foreground">Hero & Tagline</h2>
        </div>
        <p className="text-sm text-muted-foreground -mt-2">Customize the main headline visitors see first</p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Headline</Label>
            <Input
              value={config.hero_title ?? ''}
              onChange={(e) => update('hero_title', e.target.value)}
              placeholder={`Promote Mobility: Rent a Car Tailored to Your Needs`}
            />
          </div>
          <div className="space-y-2">
            <Label>Subtitle</Label>
            <Input
              value={config.hero_subtitle ?? ''}
              onChange={(e) => update('hero_subtitle', e.target.value)}
              placeholder={`Discover the best deals on car rentals at ${agencyName}`}
            />
          </div>
          <div className="space-y-2">
            <Label>CTA Button Text</Label>
            <Input
              value={config.cta_text ?? ''}
              onChange={(e) => update('cta_text', e.target.value)}
              placeholder="Book Now"
            />
          </div>
        </div>
      </motion.div>

      {/* Color Overrides */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14 }}
        className="card-premium rounded-xl p-7 space-y-5"
      >
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-accent" />
          <h2 className="text-lg font-display font-bold text-foreground">Color Overrides</h2>
        </div>
        <p className="text-sm text-muted-foreground -mt-2">Override template colors — leave empty to use template defaults</p>

        {/* Navigation */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Navigation Bar</h3>
          <div className="grid grid-cols-2 gap-4">
            <ColorInput label="Background" value={config.nav_bg_color} onChange={(v) => update('nav_bg_color', v)} onClear={() => clear('nav_bg_color')} />
            <ColorInput label="Text Color" value={config.nav_text_color} onChange={(v) => update('nav_text_color', v)} onClear={() => clear('nav_text_color')} />
          </div>
        </div>

        {/* Hero */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Hero Section</h3>
          <div className="grid grid-cols-3 gap-4">
            <ColorInput label="Background" value={config.hero_bg_color} onChange={(v) => update('hero_bg_color', v)} onClear={() => clear('hero_bg_color')} />
            <ColorInput label="Title Color" value={config.hero_text_color} onChange={(v) => update('hero_text_color', v)} onClear={() => clear('hero_text_color')} />
            <ColorInput label="Subtitle Color" value={config.hero_subtitle_color} onChange={(v) => update('hero_subtitle_color', v)} onClear={() => clear('hero_subtitle_color')} />
          </div>
        </div>

        {/* Footer */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Footer</h3>
          <div className="grid grid-cols-2 gap-4">
            <ColorInput label="Background" value={config.footer_bg_color} onChange={(v) => update('footer_bg_color', v)} onClear={() => clear('footer_bg_color')} />
            <ColorInput label="Text Color" value={config.footer_text_color} onChange={(v) => update('footer_text_color', v)} onClear={() => clear('footer_text_color')} />
          </div>
        </div>

        {/* Headings */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Content</h3>
          <div className="grid grid-cols-2 gap-4">
            <ColorInput label="Heading Color" value={config.heading_color} onChange={(v) => update('heading_color', v)} onClear={() => clear('heading_color')} />
          </div>
        </div>

        {/* Live Preview */}
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="h-8 flex items-center px-3 text-xs font-medium" style={{ backgroundColor: config.nav_bg_color || '#ffffff', color: config.nav_text_color || '#111827' }}>
            <span>Nav Preview</span>
            <span className="ml-auto opacity-50">Links</span>
          </div>
          <div className="h-16 flex items-center justify-center" style={{ backgroundColor: config.hero_bg_color || '#1a1f36' }}>
            <span className="text-sm font-bold" style={{ color: config.hero_text_color || '#ffffff' }}>Hero Title</span>
          </div>
          <div className="h-8 flex items-center justify-center px-3" style={{ backgroundColor: config.footer_bg_color || '#f9fafb', color: config.footer_text_color || '#111827' }}>
            <span className="text-xs">Footer Preview</span>
          </div>
        </div>
      </motion.div>

      {/* Font Selection */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
        className="card-premium rounded-xl p-7 space-y-5"
      >
        <div className="flex items-center gap-2">
          <Type className="h-4 w-4 text-accent" />
          <h2 className="text-lg font-display font-bold text-foreground">Typography</h2>
        </div>
        <p className="text-sm text-muted-foreground -mt-2">Choose a font style for your storefront</p>

        <div className="grid grid-cols-2 gap-3">
          {FONT_OPTIONS.map((font) => {
            const selected = (config.font ?? 'sans') === font.id;
            return (
              <button
                key={font.id}
                type="button"
                onClick={() => update('font', font.id)}
                className={`text-left rounded-xl border-2 p-4 transition-all ${
                  selected
                    ? 'border-accent bg-accent/5'
                    : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                <p className={`text-lg font-bold ${font.preview}`}>{font.name}</p>
                <p className={`text-sm text-muted-foreground mt-1 ${font.preview}`}>
                  The quick brown fox jumps over the lazy dog
                </p>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Social Media Links */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card-premium rounded-xl p-7 space-y-5"
      >
        <h2 className="text-lg font-display font-bold text-foreground">Social Media</h2>
        <p className="text-sm text-muted-foreground -mt-2">Add your social links shown in the footer</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><Facebook className="h-3.5 w-3.5 text-blue-600" /> Facebook</Label>
            <Input
              value={config.facebook_url ?? ''}
              onChange={(e) => update('facebook_url', e.target.value)}
              placeholder="https://facebook.com/youragency"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><Instagram className="h-3.5 w-3.5 text-pink-500" /> Instagram</Label>
            <Input
              value={config.instagram_url ?? ''}
              onChange={(e) => update('instagram_url', e.target.value)}
              placeholder="https://instagram.com/youragency"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><Twitter className="h-3.5 w-3.5 text-sky-500" /> Twitter / X</Label>
            <Input
              value={config.twitter_url ?? ''}
              onChange={(e) => update('twitter_url', e.target.value)}
              placeholder="https://x.com/youragency"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5 text-green-500" /> WhatsApp</Label>
            <Input
              value={config.whatsapp_number ?? ''}
              onChange={(e) => update('whatsapp_number', e.target.value)}
              placeholder="+1234567890"
            />
          </div>
        </div>
      </motion.div>

      {/* Contact Details */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24 }}
        className="card-premium rounded-xl p-7 space-y-5"
      >
        <h2 className="text-lg font-display font-bold text-foreground">Contact Details</h2>
        <p className="text-sm text-muted-foreground -mt-2">Phone and working hours shown on your storefront</p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Phone Number</Label>
            <Input
              value={config.phone ?? ''}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Weekday Hours</Label>
              <Input
                value={config.working_hours ?? ''}
                onChange={(e) => update('working_hours', e.target.value)}
                placeholder="Mon–Fri: 8:00 AM – 8:00 PM"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Weekend Hours</Label>
              <Input
                value={config.working_hours_weekend ?? ''}
                onChange={(e) => update('working_hours_weekend', e.target.value)}
                placeholder="Sat–Sun: 9:00 AM – 6:00 PM"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StorefrontConfigEditor;
