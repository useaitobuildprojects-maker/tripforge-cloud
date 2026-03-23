import { motion } from 'framer-motion';
import { CalendarDays, Info } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const useAllBookings = () => {
  return useQuery({
    queryKey: ['all-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, agencies(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
  });
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-600',
  confirmed: 'bg-accent/10 text-accent',
  in_progress: 'bg-blue-500/10 text-blue-600',
  completed: 'bg-green-500/10 text-green-600',
  cancelled: 'bg-destructive/10 text-destructive',
};

const Bookings = () => {
  const { data: bookings, isLoading, isError } = useAllBookings();

  return (
    <div className="space-y-8 max-w-[1200px]">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <p className="text-[11px] font-semibold text-accent uppercase tracking-[0.2em] mb-1">Management</p>
        <h1 className="text-[30px] font-display font-bold text-foreground leading-tight">Bookings</h1>
        <p className="text-sm text-muted-foreground mt-1.5 font-light">View and manage all bookings across agencies</p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : isError || !bookings || bookings.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-premium rounded-xl p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
              <CalendarDays className="h-8 w-8 text-accent" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground">No Bookings Yet</h2>
            <div className="flex items-start gap-2 max-w-md text-left bg-secondary/40 rounded-xl p-4">
              <Info className="h-4 w-4 text-accent mt-0.5 shrink-0" />
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Bookings will appear here once customers start making reservations through agency storefronts.
              </p>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-premium rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/70">
                  <th className="px-7 py-3.5 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-[0.14em] bg-secondary/40">Customer</th>
                  <th className="px-6 py-3.5 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-[0.14em] bg-secondary/40">Agency</th>
                  <th className="px-6 py-3.5 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-[0.14em] bg-secondary/40">Service</th>
                  <th className="px-6 py-3.5 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-[0.14em] bg-secondary/40">Status</th>
                  <th className="px-6 py-3.5 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-[0.14em] bg-secondary/40">Date</th>
                  <th className="px-7 py-3.5 text-right text-[10px] font-bold text-muted-foreground uppercase tracking-[0.14em] bg-secondary/40">Amount</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking: any, i: number) => (
                  <motion.tr
                    key={booking.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 + i * 0.04 }}
                    className="border-t border-border/40 hover:bg-accent/[0.03] transition-colors"
                  >
                    <td className="px-7 py-4 text-[13px] font-medium text-foreground">{booking.customer_name}</td>
                    <td className="px-6 py-4 text-[13px] text-muted-foreground">{booking.agencies?.name ?? '—'}</td>
                    <td className="px-6 py-4 text-[13px] text-muted-foreground">{booking.service_type}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusColors[booking.status] ?? 'bg-secondary text-muted-foreground'}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-muted-foreground">
                      {new Date(booking.booking_date || booking.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-7 py-4 text-right text-[14px] font-bold text-foreground tabular-nums">
                      €{Number(booking.amount).toLocaleString()}
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

export default Bookings;
