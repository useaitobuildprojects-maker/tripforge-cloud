import { useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Plus, UserCheck, Circle, Search } from 'lucide-react';
import { Agency } from '@/types/agency';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAgencyDrivers } from '@/hooks/use-drivers';
import CreateDriverDialog from '@/components/agency-admin/CreateDriverDialog';

const statusConfig = {
  available: { label: 'Available', className: 'bg-success/10 text-success border-success/20' },
  busy: { label: 'On Trip', className: 'bg-accent/10 text-accent border-accent/20' },
  offline: { label: 'Offline', className: 'bg-muted text-muted-foreground border-border' },
};

const AgencyAdminDrivers = () => {
  const { agency } = useOutletContext<{ agency: Agency }>();
  const { data: drivers = [], isLoading } = useAgencyDrivers(agency.id);
  const [search, setSearch] = useState('');

  const filtered = drivers.filter((d) =>
    d.full_name.toLowerCase().includes(search.toLowerCase()) ||
    d.base_location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-[1200px]">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold text-accent uppercase tracking-[0.2em] mb-1">Fleet</p>
          <h1 className="text-[30px] font-display font-bold text-foreground leading-tight">Drivers</h1>
          <p className="text-sm text-muted-foreground mt-1.5 font-light">Manage your drivers and track their locations</p>
        </div>
        <CreateDriverDialog agencyId={agency.id} />
      </motion.div>

      {/* Search */}
      <div className="relative group max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-accent" />
        <input
          type="text"
          placeholder="Search drivers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 rounded-xl border border-border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all"
        />
      </div>

      {/* Drivers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-premium rounded-xl p-12 text-center">
          <UserCheck className="h-10 w-10 mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No drivers found. Add your first driver to get started.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((driver, i) => {
            const status = statusConfig[driver.status] ?? statusConfig.offline;
            return (
              <motion.div
                key={driver.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.4 }}
                className="card-premium rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm">
                      {driver.full_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{driver.full_name}</h3>
                      <Badge variant="outline" className={`text-[10px] mt-1 ${status.className}`}>
                        <Circle className="h-2 w-2 mr-1 fill-current" />
                        {status.label}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 text-[13px]">
                  {driver.phone && (
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span>{driver.phone}</span>
                    </div>
                  )}
                  {driver.email && (
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{driver.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>{driver.base_location || 'No location set'}</span>
                  </div>
                  {driver.current_lat && driver.current_lng && (
                    <div className="flex items-center gap-2.5 text-accent text-[11px]">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span>GPS: {driver.current_lat.toFixed(4)}, {driver.current_lng.toFixed(4)}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AgencyAdminDrivers;
