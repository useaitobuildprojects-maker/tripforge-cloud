import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useAgencies, useDashboardStats } from '@/hooks/use-agencies';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = ['hsl(var(--accent))', 'hsl(var(--primary))', 'hsl(var(--muted-foreground))', 'hsl(var(--destructive))'];

const Analytics = () => {
  const { data: agencies = [], isLoading: agenciesLoading } = useAgencies();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const isLoading = agenciesLoading || statsLoading;

  // Revenue by agency chart data
  const revenueData = agencies
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8)
    .map((a) => ({ name: a.name.length > 12 ? a.name.slice(0, 12) + '…' : a.name, revenue: a.revenue, bookings: a.total_bookings }));

  // Status distribution
  const statusCounts = agencies.reduce(
    (acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; },
    {} as Record<string, number>
  );
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // Services distribution
  const serviceCounts = agencies.reduce((acc, a) => {
    a.services.forEach((s) => { acc[s] = (acc[s] || 0) + 1; });
    return acc;
  }, {} as Record<string, number>);
  const serviceData = Object.entries(serviceCounts).map(([name, value]) => ({ name: name.replace('_', ' '), value }));

  // Bookings by agency
  const bookingsData = agencies
    .sort((a, b) => b.total_bookings - a.total_bookings)
    .slice(0, 8)
    .map((a) => ({ name: a.name.length > 12 ? a.name.slice(0, 12) + '…' : a.name, bookings: a.total_bookings }));

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-[1200px]">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[320px] rounded-xl" />)}
        </div>
      </div>
    );
  }

  const noData = agencies.length === 0;

  return (
    <div className="space-y-8 max-w-[1200px]">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <p className="text-[11px] font-semibold text-accent uppercase tracking-[0.2em] mb-1">Insights</p>
        <h1 className="text-[30px] font-display font-bold text-foreground leading-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1.5 font-light">Platform performance overview with real-time data</p>
      </motion.div>

      {noData ? (
        <div className="card-premium rounded-xl p-16 text-center">
          <p className="text-muted-foreground">Add some agencies to see analytics data here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue by Agency */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-premium rounded-xl p-6">
            <h3 className="text-[15px] font-display font-bold text-foreground mb-1">Revenue by Agency</h3>
            <p className="text-[11px] text-muted-foreground mb-6">Top performing agencies by revenue</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="revenue" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Agency Status Distribution */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-premium rounded-xl p-6">
            <h3 className="text-[15px] font-display font-bold text-foreground mb-1">Agency Status</h3>
            <p className="text-[11px] text-muted-foreground mb-6">Distribution of agency statuses</p>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                  {statusData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Bookings by Agency */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card-premium rounded-xl p-6">
            <h3 className="text-[15px] font-display font-bold text-foreground mb-1">Bookings by Agency</h3>
            <p className="text-[11px] text-muted-foreground mb-6">Total bookings per agency</p>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={bookingsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="bookings" stroke="hsl(var(--accent))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--accent))', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Services Distribution */}
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card-premium rounded-xl p-6">
            <h3 className="text-[15px] font-display font-bold text-foreground mb-1">Services Offered</h3>
            <p className="text-[11px] text-muted-foreground mb-6">Popular service types across agencies</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={serviceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} width={100} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
