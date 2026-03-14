import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, ExternalLink, MapPin } from 'lucide-react';
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
    <div className="space-y-6 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-display font-bold text-foreground">Agencies</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all travel agencies on the platform
          </p>
        </div>
        <Button className="gradient-accent text-accent-foreground gap-2 shadow-md hover:shadow-lg transition-shadow font-semibold">
          <Plus className="h-4 w-4" />
          Add Agency
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, city or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-card border-border"
          />
        </div>
        <Button variant="outline" size="sm" className="gap-2 h-10">
          <Filter className="h-3.5 w-3.5" />
          Filters
        </Button>
      </div>

      {/* Agency Cards Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((agency, i) => (
          <motion.div
            key={agency.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.45 }}
            className="bg-card rounded-lg p-6 card-premium cursor-pointer group hover:shadow-lg hover:border-accent/20 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg gradient-accent text-accent-foreground font-bold text-sm">
                  {agency.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground group-hover:text-accent transition-colors">
                    {agency.name}
                  </h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <p className="text-[11px] text-muted-foreground">
                      {agency.city}, {agency.country}
                    </p>
                  </div>
                </div>
              </div>
              <AgencyStatusBadge status={agency.status} />
            </div>

            <div className="flex flex-wrap gap-1.5 mb-5">
              {agency.services.map((s) => (
                <ServiceBadge key={s} service={s} />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border/60">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.1em] font-medium">
                  Bookings
                </p>
                <p className="text-sm font-bold font-display text-foreground mt-0.5">
                  {agency.total_bookings.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.1em] font-medium">
                  Revenue
                </p>
                <p className="text-sm font-bold font-display text-foreground mt-0.5">
                  €{agency.revenue.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.1em] font-medium">
                  Domain
                </p>
                {agency.domain ? (
                  <div className="flex items-center gap-1 mt-0.5">
                    <ExternalLink className="h-3 w-3 text-accent" />
                    <p className="text-[11px] font-semibold text-accent truncate">
                      {agency.domain}
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground mt-0.5">—</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Agencies;
