import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Agency, ServiceType, SERVICE_LABELS } from '@/types/agency';
import { useCreateAgency, useUpdateAgency } from '@/hooks/use-agency-mutations';

interface AgencyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agency?: Agency | null;
}

const serviceOptions: ServiceType[] = ['car_rental', 'private_driver', 'limousine_services', 'apartment', 'car_driver'];

const AgencyFormDialog = ({ open, onOpenChange, agency }: AgencyFormDialogProps) => {
  const createAgency = useCreateAgency();
  const updateAgency = useUpdateAgency();
  const isEditing = !!agency;

  const [form, setForm] = useState({
    name: '',
    slug: '',
    domain: '',
    status: 'pending' as 'active' | 'inactive' | 'pending',
    services: [] as string[],
    country: '',
    city: '',
    contact_email: '',
    meta_title: '',
    meta_description: '',
    og_image: '',
  });

  useEffect(() => {
    if (agency) {
      setForm({
        name: agency.name, slug: agency.slug, domain: agency.domain ?? '', status: agency.status,
        services: agency.services, country: agency.country, city: agency.city, contact_email: agency.contact_email,
        meta_title: agency.meta_title ?? '', meta_description: agency.meta_description ?? '', og_image: agency.og_image ?? '',
      });
    } else {
      setForm({ name: '', slug: '', domain: '', status: 'pending', services: [], country: '', city: '', contact_email: '', meta_title: '', meta_description: '', og_image: '' });
    }
  }, [agency, open]);

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setForm((f) => ({ ...f, name, slug }));
  };

  const toggleService = (service: string) => {
    setForm((f) => ({
      ...f,
      services: f.services.includes(service)
        ? f.services.filter((s) => s !== service)
        : [...f.services, service],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      domain: form.domain || undefined,
      meta_title: form.meta_title || undefined,
      meta_description: form.meta_description || undefined,
      og_image: form.og_image || undefined,
    };

    if (isEditing && agency) {
      await updateAgency.mutateAsync({ id: agency.id, ...payload });
    } else {
      await createAgency.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  const isPending = createAgency.isPending || updateAgency.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEditing ? 'Edit Agency' : 'Add New Agency'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Agency Name</Label>
              <Input id="name" value={form.name} onChange={(e) => handleNameChange(e.target.value)} required placeholder="e.g. Atlas Travel" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} required placeholder="atlas-travel" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Contact Email</Label>
              <Input id="email" type="email" value={form.contact_email} onChange={(e) => setForm((f) => ({ ...f, contact_email: e.target.value }))} required placeholder="contact@agency.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain">Custom Domain</Label>
              <Input id="domain" value={form.domain} onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value }))} placeholder="www.majestic-rentals.com" />
              <p className="text-[10px] text-muted-foreground">Agency will be accessible at this domain</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} required placeholder="Paris" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} required placeholder="France" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as any }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
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

          {/* SEO Settings */}
          <div className="space-y-3 pt-2 border-t border-border">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">SEO & Meta Tags</Label>
            <div className="space-y-2">
              <Label htmlFor="meta_title">Meta Title <span className="text-muted-foreground font-normal">(max 60 chars)</span></Label>
              <Input id="meta_title" value={form.meta_title} onChange={(e) => setForm((f) => ({ ...f, meta_title: e.target.value }))} placeholder="e.g. Majestic Car Rental | Salzburg" maxLength={60} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meta_desc">Meta Description <span className="text-muted-foreground font-normal">(max 160 chars)</span></Label>
              <textarea id="meta_desc" value={form.meta_description} onChange={(e) => setForm((f) => ({ ...f, meta_description: e.target.value }))} placeholder="Rent premium cars in Salzburg..." maxLength={160} rows={2} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="og_image">OG Image URL</Label>
              <Input id="og_image" value={form.og_image} onChange={(e) => setForm((f) => ({ ...f, og_image: e.target.value }))} placeholder="https://..." />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
            <Button type="submit" disabled={isPending} className="gradient-accent text-accent-foreground rounded-xl font-semibold px-6">
              {isPending ? 'Saving...' : isEditing ? 'Update Agency' : 'Create Agency'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AgencyFormDialog;
