import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface BookingDraft {
  agency_id: string;
  service_type: string;
  amount: number;
  vehicle_id?: string | null;
  pickup_date: string;   // ISO
  return_date: string;   // ISO
  pickup_location?: string | null;
  return_location?: string | null;
  summary: string;       // human-readable lines for notes
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  draft: BookingDraft;
  buttonColor: string;
  agencyName: string;
  showDates?: boolean; // when service has no return date concept (transfer/limo/tour)
}

const schema = z.object({
  name: z.string().trim().min(2, 'Full name required').max(120),
  email: z.string().trim().email('Valid email required').max(255),
  phone: z.string().trim().min(5, 'Phone required').max(40),
  notes: z.string().trim().max(500).optional().or(z.literal('')),
});

const BookingCustomerDialog = ({ open, onOpenChange, draft, buttonColor, agencyName }: Props) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Please complete required fields');
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-booking-checkout', {
        body: {
          agency_id: draft.agency_id,
          vehicle_id: draft.vehicle_id ?? null,
          service_type: draft.service_type,
          amount: draft.amount,
          pickup_date: draft.pickup_date,
          return_date: draft.return_date,
          pickup_location: draft.pickup_location ?? null,
          return_location: draft.return_location ?? null,
          summary: draft.summary,
          customer_name: parsed.data.name,
          customer_email: parsed.data.email,
          customer_phone: parsed.data.phone,
          customer_notes: parsed.data.notes || null,
        },
      });
      if (error) throw error;
      if (!data?.url) throw new Error('No checkout URL returned');
      window.location.href = data.url;
    } catch (err: any) {
      console.error('Booking insert failed', err);
      toast.error(err?.message || 'Could not submit booking. Please try again.');
      setSubmitting(false);
    }
  };

  const close = (next: boolean) => {
    if (!next) {
      setTimeout(() => { setForm({ name: '', email: '', phone: '', notes: '' }); }, 200);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Confirm & pay</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-2">
            <div className="rounded-md border bg-muted/30 p-3 text-xs whitespace-pre-line">
              {draft.summary}
              <div className="flex justify-between pt-2 mt-2 border-t border-border/40 font-bold text-sm">
                <span>Total to pay</span>
                <span style={{ color: buttonColor }}>€{draft.amount.toFixed(2)}</span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Full name *</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Jane Doe" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Email *</Label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" />
              </div>
              <div className="space-y-1.5">
                <Label>Phone *</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+33 6 12 34 56 78" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Notes (optional)</Label>
              <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Flight number, special requests…" maxLength={500} />
            </div>
            <Button
              className="w-full h-12 rounded-xl font-bold text-white mt-2"
              style={{ backgroundColor: buttonColor }}
              disabled={submitting}
              onClick={submit}
            >
              {submitting ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Redirecting to Stripe…</>) : `Pay €${draft.amount.toFixed(2)} with Stripe`}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">
              You'll be redirected to Stripe's secure checkout to complete payment.
            </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingCustomerDialog;