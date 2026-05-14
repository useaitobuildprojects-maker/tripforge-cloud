import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { CalendarDays, Info, CreditCard, Loader2, CheckCircle2, CalendarRange, List } from 'lucide-react';
import { useState, useMemo } from 'react';
import { eachDayOfInterval, parseISO, format, isSameDay } from 'date-fns';
import { Agency } from '@/types/agency';
import { useAgencyBookings } from '@/hooks/use-agency-admin';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const AgencyAdminBookings = () => {
  const { agency } = useOutletContext<{ agency: Agency }>();
  const { data: bookings, isLoading, isError } = useAgencyBookings(agency.id);
  const [chargingId, setChargingId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(new Date());

  const { bookedDays, pendingDays } = useMemo(() => {
    const booked: Date[] = [];
    const pending: Date[] = [];
    (bookings ?? []).forEach((b: any) => {
      try {
        const days = eachDayOfInterval({
          start: parseISO(b.pickup_date),
          end: parseISO(b.return_date),
        });
        if (b.status === 'pending') pending.push(...days);
        else booked.push(...days);
      } catch {}
    });
    return { bookedDays: booked, pendingDays: pending };
  }, [bookings]);

  const dayBookings = useMemo(() => {
    if (!selectedDay || !bookings) return [];
    return bookings.filter((b: any) => {
      try {
        const days = eachDayOfInterval({
          start: parseISO(b.pickup_date),
          end: parseISO(b.return_date),
        });
        return days.some((d) => isSameDay(d, selectedDay));
      } catch {
        return false;
      }
    });
  }, [selectedDay, bookings]);

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

  const renderListTable = (rows: any[]) => (
    <div className="card-premium rounded-xl overflow-hidden">
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
            {rows.map((booking: any, i: number) => (
              <motion.tr
                key={booking.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 + i * 0.03 }}
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
                  {booking.pickup_date ? format(parseISO(booking.pickup_date), 'MMM d, yyyy') : new Date(booking.created_at).toLocaleDateString()}
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
    </div>
  );

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
        >
          <Tabs defaultValue="calendar" className="w-full">
            <TabsList>
              <TabsTrigger value="calendar" className="gap-1.5">
                <CalendarRange className="h-3.5 w-3.5" /> Calendar
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-1.5">
                <List className="h-3.5 w-3.5" /> List
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="mt-4 space-y-5">
              <div className="card-premium rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-3 w-3 rounded-sm bg-accent/30 border border-accent/50" /> Confirmed
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block h-3 w-3 rounded-sm bg-amber-500/30 border border-amber-500/50" /> Pending
                  </span>
                </div>
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    numberOfMonths={2}
                    selected={selectedDay}
                    onSelect={setSelectedDay}
                    modifiers={{ booked: bookedDays, pending: pendingDays }}
                    modifiersClassNames={{
                      booked: 'bg-accent/30 text-accent-foreground font-semibold',
                      pending: 'bg-amber-500/30 text-foreground font-semibold',
                    }}
                    className={cn('p-3 pointer-events-auto rounded-md border border-border')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  {selectedDay ? format(selectedDay, 'EEEE, MMM d, yyyy') : 'Select a day'}
                </p>
                {dayBookings.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">No bookings on this day.</p>
                ) : (
                  <div className="space-y-2">
                    {dayBookings.map((b: any) => (
                      <div key={b.id} className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3">
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium text-foreground">{b.customer_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(b.pickup_date), 'MMM d')} — {format(parseISO(b.return_date), 'MMM d, yyyy')} · {b.service_type}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-foreground tabular-nums">€{Number(b.amount).toLocaleString()}</span>
                          <Badge variant="outline" className="text-[10px] capitalize">{b.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="list" className="mt-4">
              {renderListTable(bookings)}
            </TabsContent>
          </Tabs>
        </motion.div>
      )}
    </div>
  );
};

export default AgencyAdminBookings;
