import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AgencyStatusBadge from '@/components/admin/AgencyStatusBadge';
import ServiceBadge from '@/components/admin/ServiceBadge';
import { mockAgencies } from '@/data/mock-agencies';

const Agencies = () => {
  const [search, setSearch] = useState('');

  const filtered = mockAgencies.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.city.toLowerCase().includes(search.toLowerCase()) ||
      a.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Agencies</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all travel agencies on the platform
          </p>
        </div>
        <Button className="gradient-primary text-primary-foreground gap-2 shadow-lg">
          <Plus className="h-4 w-4" />
          Add Agency
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search agencies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-card border-border/50"
          />
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-3.5 w-3.5" />
          Filters
        </Button>
      </div>

      {/* Agency Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((agency, i) => (
          <motion.div
            key={agency.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            className="glass rounded-xl p-5 hover:border-primary/30 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                  {agency.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {agency.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {agency.city}, {agency.country}
                  </p>
                </div>
              </div>
              <AgencyStatusBadge status={agency.status} />
            </div>

            <div className="flex flex-wrap gap-1 mb-4">
              {agency.services.map((s) => (
                <ServiceBadge key={s} service={s} />
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border/30">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Bookings
                </p>
                <p className="text-sm font-semibold text-foreground">
                  {agency.total_bookings.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Revenue
                </p>
                <p className="text-sm font-semibold text-foreground">
                  €{agency.revenue.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Domain
                </p>
                <p className="text-xs font-medium text-primary">
                  {agency.domain || '—'}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Agencies;
