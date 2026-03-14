import { Building2, Globe, DollarSign, TrendingUp, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import StatCard from '@/components/admin/StatCard';
import AgencyStatusBadge from '@/components/admin/AgencyStatusBadge';
import ServiceBadge from '@/components/admin/ServiceBadge';
import { useAgencies, useDashboardStats } from '@/hooks/use-agencies';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const { data: agencies = [], isLoading: agenciesLoading } = useAgencies();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const recentAgencies = agencies.slice(0, 4);

  const defaultStats = { total_agencies: 0, active_agencies: 0, total_bookings: 0, total_revenue: 0, bookings_growth: 0, revenue_growth: 0 };
  const s = stats ?? defaultStats;

  return (
    <div className="space-y-10 max-w-[1200px]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-[11px] font-semibold text-accent uppercase tracking-[0.2em] mb-1">
          Overview
        </p>
        <h1 className="text-[30px] font-display font-bold text-foreground leading-tight">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5 font-light">
          Monitor your platform performance across all travel agencies
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-xl" />
          ))
        ) : (
          <>
            <StatCard title="Total Agencies" value={s.total_agencies.toString()} icon={Building2} index={0} />
            <StatCard title="Active Agencies" value={s.active_agencies.toString()} icon={TrendingUp} index={1} />
            <StatCard title="Total Bookings" value={s.total_bookings.toLocaleString()} change={s.bookings_growth} icon={Globe} index={2} />
            <StatCard title="Total Revenue" value={`€${(s.total_revenue / 1000).toFixed(0)}k`} change={s.revenue_growth} icon={DollarSign} index={3} />
          </>
        )}
      </div>

      {/* Recent Agencies Table */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.55 }}
        className="card-premium rounded-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-7 py-6">
          <div>
            <h2 className="text-lg font-display font-bold text-foreground">Recent Agencies</h2>
            <p className="text-[13px] text-muted-foreground mt-0.5 font-light">
              Latest agencies added to the platform
            </p>
          </div>
          <Link
            to="/agencies"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-accent hover:text-accent/80 transition-colors px-4 py-2 rounded-lg hover:bg-accent/5"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-border/70">
                <th className="px-7 py-3.5 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-[0.14em] bg-secondary/40">Agency</th>
                <th className="px-6 py-3.5 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-[0.14em] bg-secondary/40">Status</th>
                <th className="px-6 py-3.5 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-[0.14em] bg-secondary/40">Services</th>
                <th className="px-6 py-3.5 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-[0.14em] bg-secondary/40">Location</th>
                <th className="px-7 py-3.5 text-right text-[10px] font-bold text-muted-foreground uppercase tracking-[0.14em] bg-secondary/40">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {agenciesLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-t border-border/40">
                    <td className="px-7 py-4" colSpan={5}><Skeleton className="h-10 w-full" /></td>
                  </tr>
                ))
              ) : recentAgencies.length === 0 ? (
                <tr className="border-t border-border/40">
                  <td colSpan={5} className="px-7 py-12 text-center text-sm text-muted-foreground">
                    No agencies yet. Add your first agency to get started.
                  </td>
                </tr>
              ) : (
                recentAgencies.map((agency, i) => (
                  <motion.tr
                    key={agency.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 + i * 0.07 }}
                    className="border-t border-border/40 hover:bg-accent/3 transition-colors cursor-pointer group"
                  >
                    <td className="px-7 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-accent text-accent-foreground font-bold text-sm shrink-0 shadow-sm">
                          {agency.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-foreground group-hover:text-accent transition-colors">{agency.name}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 font-light">{agency.domain || 'No domain assigned'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><AgencyStatusBadge status={agency.status} /></td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {agency.services.map((s) => <ServiceBadge key={s} service={s} />)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[13px] text-foreground">{agency.city}, {agency.country}</p>
                    </td>
                    <td className="px-7 py-4 text-right">
                      <p className="text-[14px] font-bold text-foreground tabular-nums">€{agency.revenue.toLocaleString()}</p>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
