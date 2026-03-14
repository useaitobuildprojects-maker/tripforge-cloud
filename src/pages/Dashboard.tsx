import { Building2, Globe, DollarSign, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import StatCard from '@/components/admin/StatCard';
import AgencyStatusBadge from '@/components/admin/AgencyStatusBadge';
import ServiceBadge from '@/components/admin/ServiceBadge';
import { mockAgencies, mockStats } from '@/data/mock-agencies';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const recentAgencies = mockAgencies.slice(0, 4);

  return (
    <div className="space-y-8 max-w-[1200px]">
      {/* Header */}
      <div>
        <h1 className="text-[26px] font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Platform overview across all agencies
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Agencies"
          value={mockStats.total_agencies.toString()}
          icon={Building2}
          index={0}
        />
        <StatCard
          title="Active Agencies"
          value={mockStats.active_agencies.toString()}
          icon={TrendingUp}
          index={1}
        />
        <StatCard
          title="Total Bookings"
          value={mockStats.total_bookings.toLocaleString()}
          change={mockStats.bookings_growth}
          icon={Globe}
          index={2}
        />
        <StatCard
          title="Total Revenue"
          value={`€${(mockStats.total_revenue / 1000).toFixed(0)}k`}
          change={mockStats.revenue_growth}
          icon={DollarSign}
          index={3}
        />
      </div>

      {/* Recent Agencies Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="bg-card rounded-lg card-premium overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-5">
          <div>
            <h2 className="text-[15px] font-display font-bold text-foreground">Recent Agencies</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Latest agencies on the platform</p>
          </div>
          <Link
            to="/agencies"
            className="text-xs font-semibold text-accent hover:text-accent/80 transition-colors px-3 py-1.5 rounded-lg hover:bg-accent/5"
          >
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-border">
                <th className="px-6 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.12em] bg-secondary/50">
                  Agency
                </th>
                <th className="px-6 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.12em] bg-secondary/50">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.12em] bg-secondary/50">
                  Services
                </th>
                <th className="px-6 py-3 text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.12em] bg-secondary/50">
                  Location
                </th>
                <th className="px-6 py-3 text-right text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.12em] bg-secondary/50">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody>
              {recentAgencies.map((agency, i) => (
                <motion.tr
                  key={agency.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 + i * 0.06 }}
                  className="border-t border-border/50 hover:bg-secondary/30 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-accent text-accent-foreground font-bold text-sm shrink-0">
                        {agency.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{agency.name}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {agency.domain || 'No domain assigned'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <AgencyStatusBadge status={agency.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {agency.services.map((s) => (
                        <ServiceBadge key={s} service={s} />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-foreground">
                      {agency.city}, {agency.country}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="text-sm font-bold font-display text-foreground">
                      €{agency.revenue.toLocaleString()}
                    </p>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
