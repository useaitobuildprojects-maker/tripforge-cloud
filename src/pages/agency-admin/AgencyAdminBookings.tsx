import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { CalendarDays, Info } from 'lucide-react';
import { Agency } from '@/types/agency';
import { useAgencyBookings } from '@/hooks/use-agency-admin';
import { Skeleton } from '@/components/ui/skeleton';
import { seedAtlasTravelBookings } from '@/lib/seed-bookings';
import { useQueryClient } from '@tanstack/react-query';

const AgencyAdminBookings = () => {
  const { agency } = useOutletContext<{ agency: Agency }>();
  const { data: bookings, isLoading, isError } = useAgencyBookings(agency.id);
  const queryClient = useQueryClient();
  const seeded = useRef(false);

  useEffect(() => {
    if (!seeded.current && !isLoading && (!bookings || bookings.length === 0) && agency.slug === 'atlas-travel') {
      seeded.current = true;
      console.log('🚀 Starting seed...');
      seedAtlasTravelBookings().then(() => {
        console.log('🚀 Seed complete, refreshing...');
        queryClient.invalidateQueries({ queryKey: ['agency-bookings'] });
      }).catch(e => console.error('Seed failed:', e));
    }
  }, [isLoading, bookings, queryClient, agency.slug]);

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
