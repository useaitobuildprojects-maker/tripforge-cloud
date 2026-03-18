import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, ExternalLink, MapPin, SlidersHorizontal, Pencil, Trash2, Eye, Car, CircleDot } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AgencyStatusBadge from '@/components/admin/AgencyStatusBadge';
import ServiceBadge from '@/components/admin/ServiceBadge';
import AgencyFormDialog from '@/components/admin/AgencyFormDialog';
import DeleteAgencyDialog from '@/components/admin/DeleteAgencyDialog';
import { useAgencies } from '@/hooks/use-agencies';
import { useAllVehicles } from '@/hooks/use-vehicles';
import { Agency } from '@/types/agency';
import { Skeleton } from '@/components/ui/skeleton';

const Agencies = () => {
  const [search, setSearch] = useState('');
  const { data: agencies = [], isLoading } = useAgencies();
  const [formOpen, setFormOpen] = useState(false);
  const [editingAgency, setEditingAgency] = useState<Agency | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingAgency, setDeletingAgency] = useState<Agency | null>(null);

  const filtered = agencies.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.city.toLowerCase().includes(search.toLowerCase()) ||
      a.country.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (agency: Agency) => {
    setEditingAgency(agency);
    setFormOpen(true);
  };

  const handleDelete = (agency: Agency) => {
    setDeletingAgency(agency);
    setDeleteOpen(true);
  };

  return (
    <div className="space-y-8 max-w-[1200px]">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold text-accent uppercase tracking-[0.2em] mb-1">Management</p>
          <h1 className="text-[30px] font-display font-bold text-foreground leading-tight">Agencies</h1>
          <p className="text-sm text-muted-foreground mt-1.5 font-light">Manage all travel agencies on the platform</p>
        </div>
        <Button onClick={() => { setEditingAgency(null); setFormOpen(true); }} className="gradient-accent text-accent-foreground gap-2 shadow-md hover:shadow-lg hover:opacity-95 transition-all font-semibold h-11 px-5 rounded-xl">
          <Plus className="h-4 w-4" />
          Add Agency
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }} className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-accent" />
          <input placeholder="Search by name, city or country..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full h-11 rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all duration-200" />
        </div>
        <Button variant="outline" className="gap-2 h-11 rounded-xl border-border hover:border-accent/25 hover:bg-accent/5 px-4">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[240px] rounded-xl" />)
        ) : filtered.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <p className="text-sm text-muted-foreground">
              {search ? 'No agencies match your search.' : 'No agencies yet. Add your first agency to get started.'}
            </p>
          </div>
        ) : (
          filtered.map((agency, i) => (
            <motion.div key={agency.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.07, duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }} className="card-premium rounded-xl p-6 cursor-pointer group relative">
              <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link to={`/agency/${agency.slug}`} target="_blank" className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/80 hover:bg-accent/20 text-muted-foreground hover:text-accent transition-all" title="View Storefront">
                  <Eye className="h-3.5 w-3.5" />
                </Link>
                <button onClick={(e) => { e.stopPropagation(); handleEdit(agency); }} className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/80 hover:bg-accent/20 text-muted-foreground hover:text-accent transition-all">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(agency); }} className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/80 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-accent text-accent-foreground font-bold text-base shadow-sm">
                    {agency.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold text-foreground group-hover:text-accent transition-colors duration-200">{agency.name}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <p className="text-[11px] text-muted-foreground font-light">{agency.city}, {agency.country}</p>
                    </div>
                  </div>
                </div>
                <AgencyStatusBadge status={agency.status} />
              </div>

              <div className="flex flex-wrap gap-1.5 mb-6">
                {agency.services.map((s) => <ServiceBadge key={s} service={s} />)}
              </div>

              <div className="grid grid-cols-3 gap-4 pt-5 border-t border-border/50">
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] font-semibold">Bookings</p>
                  <p className="text-[15px] font-extrabold text-foreground mt-1 tabular-nums">{agency.total_bookings.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] font-semibold">Revenue</p>
                  <p className="text-[15px] font-extrabold text-foreground mt-1 tabular-nums">€{agency.revenue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[9px] text-muted-foreground uppercase tracking-[0.15em] font-semibold">Domain</p>
                  {agency.domain ? (
                    <div className="flex items-center gap-1 mt-1">
                      <ExternalLink className="h-3 w-3 text-accent" />
                      <p className="text-[11px] font-semibold text-accent truncate">{agency.domain}</p>
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-foreground mt-1 italic">Not set</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <AgencyFormDialog open={formOpen} onOpenChange={setFormOpen} agency={editingAgency} />
      <DeleteAgencyDialog open={deleteOpen} onOpenChange={setDeleteOpen} agency={deletingAgency} />
    </div>
  );
};

export default Agencies;
