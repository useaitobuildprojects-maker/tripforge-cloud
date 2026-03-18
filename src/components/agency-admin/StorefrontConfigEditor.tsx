import { StorefrontConfig, StorefrontFont, FONT_OPTIONS } from '@/types/agency';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Facebook, Instagram, Twitter, MessageCircle, Phone, Clock, Type, Pencil } from 'lucide-react';
import { motion } from 'framer-motion';

interface StorefrontConfigEditorProps {
  config: StorefrontConfig;
  onChange: (config: StorefrontConfig) => void;
  agencyName: string;
}

const StorefrontConfigEditor = ({ config, onChange, agencyName }: StorefrontConfigEditorProps) => {
  const update = (field: keyof StorefrontConfig, value: string) => {
    onChange({ ...config, [field]: value });
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
