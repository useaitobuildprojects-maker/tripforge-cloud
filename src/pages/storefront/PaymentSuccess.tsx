import { useEffect, useState } from 'react';
import { useSearchParams, Link, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, AlertCircle, Calendar, CreditCard, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Agency, StorefrontConfig } from '@/types/agency';
import { TemplateStyles } from '@/lib/template-styles';

interface OutletContext {
  agency: Agency;
  templateStyles: TemplateStyles;
  buttonColor: string;
  config: StorefrontConfig;
}

interface BookingStatus {
  id: string;
  status: string;
  payment_status: string;
  amount: number;
  customer_name: string;
  service_type: string;
  pickup_date: string;
  return_date: string;
  paid_at: string | null;
}

const PaymentSuccess = () => {
  const { agency, buttonColor } = useOutletContext<OutletContext>();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('booking');
  const [booking, setBooking] = useState<BookingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) {
      setError('No booking reference found in the URL.');
      setLoading(false);
      return;
    }

    const fetchStatus = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-booking-status', {
          body: { booking_id: bookingId },
        });
        if (error) throw error;
        if (!data?.booking) throw new Error('Booking not found');
        setBooking(data.booking);
      } catch (err: any) {
        console.error('Failed to fetch booking status', err);
        setError(err?.message || 'Unable to retrieve booking details.');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    // Poll every 3s for up to 30s in case webhook hasn't fired yet
    const interval = setInterval(fetchStatus, 3000);
    const timeout = setTimeout(() => clearInterval(interval), 30000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [bookingId]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full text-center space-y-6"
      >
        {loading ? (
          <div className="py-12 flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin" style={{ color: buttonColor }} />
            <p className="text-muted-foreground text-sm">Confirming your payment…</p>
          </div>
        ) : error ? (
          <div className="py-8 space-y-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Something went wrong</h2>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
            <Link to={`/agency/${agency.slug}`}>
              <Button className="mt-2 h-11 rounded-xl font-bold text-white" style={{ backgroundColor: buttonColor }}>
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to {agency.name}
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mx-auto h-20 w-20 rounded-full flex items-center justify-center" style={{ backgroundColor: `${buttonColor}20` }}>
              <CheckCircle2 className="h-10 w-10" style={{ color: buttonColor }} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                Payment successful
              </h1>
              <p className="text-muted-foreground mt-2">
                Thank you, {booking?.customer_name?.split(' ')[0] ?? 'Guest'}. Your booking is confirmed.
              </p>
            </div>

            {booking && (
              <div className="rounded-xl border bg-muted/30 p-5 text-left space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-border/40">
                  <span className="text-sm text-muted-foreground">Booking reference</span>
                  <span className="font-mono text-sm font-bold">{booking.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Dates
                  </span>
                  <span className="text-sm font-medium">{formatDate(booking.pickup_date)} – {formatDate(booking.return_date)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> Amount paid
                  </span>
                  <span className="text-sm font-bold" style={{ color: buttonColor }}>€{Number(booking.amount).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    <CheckCircle2 className="h-3 w-3" /> {booking.payment_status === 'paid' ? 'Paid' : 'Pending confirmation'}
                  </span>
                </div>
                {booking.paid_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Paid at</span>
                    <span className="text-sm font-medium">{new Date(booking.paid_at).toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              A confirmation email has been sent to you.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link to={`/agency/${agency.slug}`} className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full h-11 rounded-xl font-bold"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" /> Back to home
                </Button>
              </Link>
              <Link to={`/agency/${agency.slug}/services`} className="w-full sm:w-auto">
                <Button
                  className="w-full h-11 rounded-xl font-bold text-white"
                  style={{ backgroundColor: buttonColor }}
                >
                  Explore more services
                </Button>
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
