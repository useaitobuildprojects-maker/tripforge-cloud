import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2 } from 'lucide-react';
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
  const [done, setDone] = useState<string | null>(null);

  const submit = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? 'Please complete required fields');
      return;
    }
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          agency_id: draft.agency_id,
          vehicle_id: draft.vehicle_id ?? null,
          customer_name: parsed.data.name,
          customer_email: parsed.data.email,
          customer_phone: parsed.data.phone,
          pickup_date: draft.pickup_date,
          return_date: draft.return_date,
          pickup_location: draft.pickup_location ?? null,
          return_location: draft.return_location ?? null,
          service_type: draft.service_type,
          amount: draft.amount,
          status: 'pending',
          notes: [draft.summary, parsed.data.notes ? `Customer note: ${parsed.data.notes}` : null].filter(Boolean).join('\n'),
        })
        .select('id')
        .single();
      if (error) throw error;
      setDone(data?.id ?? null);
      toast.success('Booking request received');
    } catch (err: any) {
      console.error('Booking insert failed', err);
      toast.error(err?.message || 'Could not submit booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const close = (next: boolean) => {
    if (!next) {
      setTimeout(() => { setDone(null); setForm({ name: '', email: '', phone: '', notes: '' }); }, 200);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{done ? 'Request received' : 'Confirm your booking'}</DialogTitle>
        </DialogHeader>

        {done ? (
          <div className="py-4 text-center space-y-4">
            <div className="mx-auto h-14 w-14 rounded-full flex items-center justify-center" style={{ backgroundColor: `${buttonColor}20` }}>
              <CheckCircle2 className="h-8 w-8" style={{ color: buttonColor }} />
            </div>
            <p className="text-sm text-muted-foreground">
              Thank you, {form.name.split(' ')[0]}. {agencyName} will contact you at <strong>{form.email}</strong> to confirm your booking shortly.
            </p>
            <p className="text-xs text-muted-foreground">Reference: <span className="font-mono">{done.slice(0, 8).toUpperCase()}</span></p>
            <Button className="w-full h-11 rounded-xl font-bold text-white" style={{ backgroundColor: buttonColor }} onClick={() => close(false)}>
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-3 mt-2">
            <div className="rounded-md border bg-muted/30 p-3 text-xs whitespace-pre-line">
              {draft.summary}
              <div className="flex justify-between pt-2 mt-2 border-t border-border/40 font-bold text-sm">
                <span>Estimated total</span>
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
              {submitting ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting…</>) : 'Confirm booking request'}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">
              No payment now. The agency will contact you to confirm.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingCustomerDialog;