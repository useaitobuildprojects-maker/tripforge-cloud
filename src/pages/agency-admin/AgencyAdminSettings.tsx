import { useState } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { Agency, SERVICE_LABELS, ServiceType } from '@/types/agency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useUpdateAgency } from '@/hooks/use-agency-mutations';

const serviceOptions: ServiceType[] = ['car_rental', 'private_driver', 'hotel', 'travel_package'];

const AgencyAdminSettings = () => {
  const { agency } = useOutletContext<{ agency: Agency }>();
  const updateAgency = useUpdateAgency();

  const [form, setForm] = useState({
    name: agency.name,
    contact_email: agency.contact_email,
    city: agency.city,
    country: agency.country,
    domain: agency.domain ?? '',
    services: agency.services as string[],
    meta_title: agency.meta_title ?? '',
    meta_description: agency.meta_description ?? '',
    og_image: agency.og_image ?? '',
  });

  const toggleService = (service: string) => {
    setForm((f) => ({
      ...f,
      services: f.services.includes(service)
        ? f.services.filter((s) => s !== service)
        : [...f.services, service],
    }));
  };

  const handleSave = async () => {
    await updateAgency.mutateAsync({
      id: agency.id,
      name: form.name,
      slug: agency.slug,
      status: agency.status,
      contact_email: form.contact_email,
      city: form.city,
      country: form.country,
      services: form.services,
      domain: form.domain || undefined,
      meta_title: form.meta_title || undefined,
      meta_description: form.meta_description || undefined,
      og_image: form.og_image || undefined,
    });
  };

  return (
    <div className="space-y-8 max-w-[800px]">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <p className="text-[11px] font-semibold text-accent uppercase tracking-[0.2em] mb-1">Configuration</p>
        <h1 className="text-[30px] font-display font-bold text-foreground leading-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1.5 font-light">
          Manage your agency profile and storefront settings
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card-premium rounded-xl p-7 space-y-6"
      >
        <h2 className="text-lg font-display font-bold text-foreground">General Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Agency Name</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Contact Email</Label>
            <Input id="email" type="email" value={form.contact_email} onChange={(e) => setForm((f) => ({ ...f, contact_email: e.target.value }))} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="domain">Custom Domain</Label>
          <Input id="domain" value={form.domain} onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))} placeholder="www.your-agency.com" />
        </div>

        <div className="space-y-3">
          <Label>Services</Label>
          <div className="grid grid-cols-2 gap-3">
            {serviceOptions.map((service) => (
              <label key={service} className="flex items-center gap-2.5 cursor-pointer rounded-lg border border-border p-3 hover:bg-secondary/40 transition-colors">
                <Checkbox checked={form.services.includes(service)} onCheckedChange={() => toggleService(service)} />
                <span className="text-sm text-foreground">{SERVICE_LABELS[service]}</span>
              </label>
            ))}
          </div>
        </div>
      </motion.div>

      {/* SEO Settings */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card-premium rounded-xl p-7 space-y-6"
      >
        <h2 className="text-lg font-display font-bold text-foreground">SEO & Meta Tags</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meta_title">Meta Title <span className="text-muted-foreground font-normal">(max 60 chars)</span></Label>
            <Input id="meta_title" value={form.meta_title} onChange={(e) => setForm((f) => ({ ...f, meta_title: e.target.value }))} maxLength={60} placeholder="e.g. Best Car Rental in Paris" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="meta_desc">Meta Description <span className="text-muted-foreground font-normal">(max 160 chars)</span></Label>
            <textarea
              id="meta_desc"
              value={form.meta_description}
              onChange={(e) => setForm((f) => ({ ...f, meta_description: e.target.value }))}
              maxLength={160}
              rows={2}
              placeholder="Describe your agency..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="og_image">OG Image URL</Label>
            <Input id="og_image" value={form.og_image} onChange={(e) => setForm((f) => ({ ...f, og_image: e.target.value }))} placeholder="https://..." />
          </div>
        </div>
      </motion.div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={updateAgency.isPending}
          className="gradient-accent text-accent-foreground rounded-xl font-semibold px-8"
        >
          {updateAgency.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default AgencyAdminSettings;
