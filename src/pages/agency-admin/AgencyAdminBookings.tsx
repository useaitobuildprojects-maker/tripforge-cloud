import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { CalendarDays, Info, CreditCard, Loader2, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { Agency } from '@/types/agency';
import { useAgencyBookings } from '@/hooks/use-agency-admin';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const AgencyAdminBookings = () => {
  const { agency } = useOutletContext<{ agency: Agency }>();
  const { data: bookings, isLoading, isError } = useAgencyBookings(agency.id);
  const [chargingId, setChargingId] = useState<string | null>(null);

  const handleCharge = async (bookingId: string) => {
    setChargingId(bookingId);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { booking_id: bookingId },
      });
      if (error) throw error;
      if (!data?.url) throw new Error('No checkout URL returned');
      window.open(data.url, '_blank');
    } catch (err: any) {
      toast({
        title: 'Could not start checkout',
        description: err?.message ?? 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setChargingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-[1200px]">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <p className="text-[11px] font-semibold text-accent uppercase tracking-[0.2em] mb-1">Management</p>
        <h1 className="text-[30px] font-display font-bold text-foreground leading-tight">Bookings</h1>
        <p className="text-sm text-muted-foreground mt-1.5 font-light">
          Manage bookings for <span className="font-medium text-foreground">{agency.name}</span>
        </p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : isError || !bookings || bookings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-premium rounded-xl p-12 text-center"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
              <CalendarDays className="h-8 w-8 text-accent" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground">No Bookings Yet</h2>
            <div className="flex items-start gap-2 max-w-md text-left bg-secondary/40 rounded-xl p-4">
              <Info className="h-4 w-4 text-accent mt-0.5 shrink-0" />
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Bookings will appear here once customers start making reservations through your storefront.
                Make sure your agency status is <strong>active</strong> and services are configured.
              </p>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-premium rounded-xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/70">
                  <th className="px-7 py-3.5 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-[0.14em] bg-secondary/40">Customer</th>
                  <th className="px-6 py-3.5 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-[0.14em] bg-secondary/40">Service</th>
                  <th className="px-6 py-3.5 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-[0.14em] bg-secondary/40">Status</th>
                  <th className="px-6 py-3.5 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-[0.14em] bg-secondary/40">Date</th>
                  <th className="px-7 py-3.5 text-right text-[10px] font-bold text-muted-foreground uppercase tracking-[0.14em] bg-secondary/40">Amount</th>
                  <th className="px-6 py-3.5 text-right text-[10px] font-bold text-muted-foreground uppercase tracking-[0.14em] bg-secondary/40">Payment</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking: any, i: number) => (
                  <motion.tr
                    key={booking.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 + i * 0.05 }}
                    className="border-t border-border/40 hover:bg-accent/[0.03] transition-colors"
                  >
                    <td className="px-7 py-4 text-[13px] font-medium text-foreground">{booking.customer_name}</td>
                    <td className="px-6 py-4 text-[13px] text-muted-foreground">{booking.service_type}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-accent/10 text-accent">
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-muted-foreground">
                      {new Date(booking.booking_date || booking.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-7 py-4 text-right text-[14px] font-bold text-foreground tabular-nums">
                      €{Number(booking.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {booking.payment_status === 'paid' ? (
                        <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-500">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Paid
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={chargingId === booking.id || !Number(booking.amount)}
                          onClick={() => handleCharge(booking.id)}
                          className="h-8 gap-1.5 text-[12px]"
                        >
                          {chargingId === booking.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CreditCard className="h-3.5 w-3.5" />
                          )}
                          {booking.payment_status === 'pending' ? 'Resume' : 'Confirm & Charge'}
                        </Button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AgencyAdminBookings;
