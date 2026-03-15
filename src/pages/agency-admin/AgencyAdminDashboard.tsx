import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { CalendarDays, DollarSign, TrendingUp, Users } from 'lucide-react';
import StatCard from '@/components/admin/StatCard';
import { Agency } from '@/types/agency';
import ServiceBadge from '@/components/admin/ServiceBadge';
import AgencyStatusBadge from '@/components/admin/AgencyStatusBadge';

const AgencyAdminDashboard = () => {
  const { agency } = useOutletContext<{ agency: Agency }>();

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
          Welcome back — here's how <span className="font-medium text-foreground">{agency.name}</span> is performing
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Bookings" value={agency.total_bookings.toLocaleString()} icon={CalendarDays} index={0} />
        <StatCard title="Revenue" value={`€${agency.revenue.toLocaleString()}`} icon={DollarSign} index={1} />
        <StatCard title="Status" value={agency.status.charAt(0).toUpperCase() + agency.status.slice(1)} icon={TrendingUp} index={2} />
        <StatCard title="Services" value={agency.services.length.toString()} icon={Users} index={3} />
      </div>

      {/* Agency Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.55 }}
        className="card-premium rounded-xl p-7"
      >
        <h2 className="text-lg font-display font-bold text-foreground mb-5">Agency Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.14em] mb-1">Location</p>
              <p className="text-sm text-foreground">{agency.city}, {agency.country}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.14em] mb-1">Contact Email</p>
              <p className="text-sm text-foreground">{agency.contact_email}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.14em] mb-1">Custom Domain</p>
              <p className="text-sm text-foreground">{agency.domain || 'Not configured'}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.14em] mb-1">Status</p>
              <AgencyStatusBadge status={agency.status} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.14em] mb-1">Active Services</p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {agency.services.map((s) => <ServiceBadge key={s} service={s} />)}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.14em] mb-1">Member Since</p>
              <p className="text-sm text-foreground">
                {new Date(agency.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AgencyAdminDashboard;
