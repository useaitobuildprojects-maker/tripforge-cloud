import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building, Search, Pencil, Trash2, BedDouble, Bath, Users as UsersIcon, MapPin, Circle } from 'lucide-react';
import { Agency } from '@/types/agency';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAgencyApartments, useDeleteApartment, Apartment } from '@/hooks/use-apartments';
import ApartmentDialog from '@/components/agency-admin/ApartmentDialog';

const statusConfig: Record<string, { label: string; className: string }> = {
  available: { label: 'Available', className: 'bg-success/10 text-success border-success/20' },
  booked: { label: 'Booked', className: 'bg-accent/10 text-accent border-accent/20' },
};

const AgencyAdminApartments = () => {
  const { agency } = useOutletContext<{ agency: Agency }>();
  const { data: apartments = [], isLoading } = useAgencyApartments(agency.id);
  const deleteApartment = useDeleteApartment();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Apartment | null>(null);

  if (!agency.services?.includes('apartment')) {
    return (
      <div className="card-premium rounded-xl p-12 text-center">
        <Building className="h-10 w-10 mx-auto mb-4 text-muted-foreground/40" />
        <h2 className="text-lg font-semibold text-foreground mb-1">Apartment service not enabled</h2>
        <p className="text-sm text-muted-foreground">Enable the Apartment service in Settings to manage listings.</p>
      </div>
    );
  }

  const filtered = apartments.filter((a) =>
    `${a.title} ${a.city} ${a.country} ${a.serial_number ?? ''}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-[1200px]">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold text-accent uppercase tracking-[0.2em] mb-1">Listings</p>
          <h1 className="text-[30px] font-display font-bold text-foreground leading-tight">Apartments</h1>
          <p className="text-sm text-muted-foreground mt-1.5 font-light">Manage your short-term rental listings</p>
        </div>
        <ApartmentDialog agencyId={agency.id} />
      </motion.div>

      <div className="relative group max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search apartments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 rounded-xl border border-border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-premium rounded-xl p-12 text-center">
          <Building className="h-10 w-10 mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No apartments yet. Add your first listing to get started.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((apt, i) => {
            const status = statusConfig[apt.status] ?? statusConfig.available;
            return (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.4 }}
                className="card-premium rounded-xl overflow-hidden hover:shadow-md transition-shadow group"
              >
                <div className="h-40 bg-muted/30 flex items-center justify-center overflow-hidden">
                  {apt.photos[0] ? (
                    <img src={apt.photos[0]} alt={apt.title} className="w-full h-full object-cover" />
                  ) : (
                    <Building className="h-12 w-12 text-muted-foreground/20" />
                  )}
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-foreground truncate">{apt.title}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" /> {apt.city}, {apt.country}
                      </p>
                      {apt.serial_number && (
                        <p className="text-[10px] font-mono text-accent mt-1 tracking-wider">{apt.serial_number}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100" onClick={() => setEditing(apt)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive"
                        onClick={() => {
                          if (confirm('Delete this apartment?')) deleteApartment.mutate({ id: apt.id, agency_id: agency.id });
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5" /> {apt.bedrooms}</span>
                    <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" /> {apt.bathrooms}</span>
                    <span className="flex items-center gap-1"><UsersIcon className="h-3.5 w-3.5" /> {apt.max_guests}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div>
                      <p className="text-base font-semibold text-foreground tabular-nums">€{apt.nightly_rate}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">/ night</p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${status.className}`}>
                      <Circle className="h-2 w-2 mr-1 fill-current" />
                      {status.label}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <ApartmentDialog
        agencyId={agency.id}
        apartment={editing}
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
      />
    </div>
  );
};

export default AgencyAdminApartments;
