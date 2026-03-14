import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, ExternalLink, MapPin, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <div className="space-y-8 max-w-[1200px]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-end justify-between"
      >
        <div>
          <p className="text-[11px] font-semibold text-accent uppercase tracking-[0.2em] mb-1">
            Management
          </p>
          <h1 className="text-[30px] font-display font-bold text-foreground leading-tight">
            Agencies
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 font-light">
            Manage all travel agencies on the platform
          </p>
        </div>
        <Button className="gradient-accent text-accent-foreground gap-2 shadow-md hover:shadow-lg hover:opacity-95 transition-all font-semibold h-11 px-5 rounded-xl">
          <Plus className="h-4 w-4" />
          Add Agency
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex items-center gap-3"
      >
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-accent" />
          <input
            placeholder="Search by name, city or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all duration-200"
          />
        </div>
        <Button variant="outline" className="gap-2 h-11 rounded-xl border-border hover:border-accent/25 hover:bg-accent/5 px-4">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </motion.div>

      {/* Agency Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((agency, i) => (
          <motion.div
            key={agency.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.07, duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
            className="card-premium rounded-xl p-6 cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-accent text-accent-foreground font-bold text-base shadow-sm">
                  {agency.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-foreground group-hover:text-accent transition-colors duration-200">
                    {agency.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <p className="text-[11px] text-muted-foreground font-light">
                      {agency.city}, {agency.country}
                    </p>
                  </div>
                </div>
              </div>
              <AgencyStatusBadge status={agency.status} />
            </div>

            <div className="flex flex-wrap gap-1.5 mb-6">
              {agency.services.map((s) => (
                <ServiceBadge key={s} service={s} />
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 pt-5 border-t border-border/50">
              <div>
                <p className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] font-semibold">
                  Bookings
                </p>
                <p className="text-[15px] font-bold font-display text-foreground mt-1 tabular-nums">
                  {agency.total_bookings.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] font-semibold">
                  Revenue
                </p>
                <p className="text-[15px] font-bold font-display text-foreground mt-1 tabular-nums">
                  €{agency.revenue.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] font-semibold">
                  Domain
                </p>
                {agency.domain ? (
                  <div className="flex items-center gap-1 mt-1">
                    <ExternalLink className="h-3 w-3 text-accent" />
                    <p className="text-[11px] font-semibold text-accent truncate">
                      {agency.domain}
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground mt-1 italic">Not set</p>
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
