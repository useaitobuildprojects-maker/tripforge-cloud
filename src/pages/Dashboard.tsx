import { Building2, Globe, DollarSign, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import StatCard from '@/components/admin/StatCard';
import AgencyStatusBadge from '@/components/admin/AgencyStatusBadge';
import ServiceBadge from '@/components/admin/ServiceBadge';
import { mockAgencies, mockStats } from '@/data/mock-agencies';

const Dashboard = () => {
  const recentAgencies = mockAgencies.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Platform overview across all agencies
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        transition={{ delay: 0.35, duration: 0.4 }}
        className="glass rounded-xl"
      >
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <h2 className="text-sm font-semibold text-foreground">Recent Agencies</h2>
          <a
            href="/agencies"
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View all →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/30">
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Agency
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Services
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Location
                </th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
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
                  className="border-b border-border/20 last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{agency.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {agency.domain || 'No domain'}
                      </p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <AgencyStatusBadge status={agency.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {agency.services.map((s) => (
                        <ServiceBadge key={s} service={s} />
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-foreground">
                      {agency.city}, {agency.country}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <p className="text-sm font-semibold text-foreground">
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
