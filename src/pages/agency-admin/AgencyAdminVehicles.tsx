import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, Search, Circle, Hash, KeyRound, Pencil } from 'lucide-react';
import { Agency } from '@/types/agency';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAgencyVehicles, Vehicle } from '@/hooks/use-vehicles';
import CreateVehicleDialog from '@/components/agency-admin/CreateVehicleDialog';
import EditVehicleDialog from '@/components/agency-admin/EditVehicleDialog';

const statusConfig = {
  available: { label: 'Available', className: 'bg-success/10 text-success border-success/20' },
  rented: { label: 'Rented', className: 'bg-accent/10 text-accent border-accent/20' },
  maintenance: { label: 'Maintenance', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

const AgencyAdminVehicles = () => {
  const { agency } = useOutletContext<{ agency: Agency }>();
  const { data: vehicles = [], isLoading } = useAgencyVehicles(agency.id);
  const [search, setSearch] = useState('');
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const filtered = vehicles.filter((v) =>
    `${v.brand} ${v.model}`.toLowerCase().includes(search.toLowerCase()) ||
    v.license_plate?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-[1200px]">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold text-accent uppercase tracking-[0.2em] mb-1">Fleet</p>
          <h1 className="text-[30px] font-display font-bold text-foreground leading-tight">Vehicles</h1>
          <p className="text-sm text-muted-foreground mt-1.5 font-light">Manage your car fleet and availability</p>
        </div>
        <CreateVehicleDialog agencyId={agency.id} />
      </motion.div>

      {/* Search */}
      <div className="relative group max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-accent" />
        <input
          type="text"
          placeholder="Search vehicles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 rounded-xl border border-border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all"
        />
      </div>

      {/* Vehicles Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-premium rounded-xl p-12 text-center">
          <Car className="h-10 w-10 mx-auto mb-4 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No vehicles found. Add your first vehicle to get started.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((vehicle, i) => {
            const status = statusConfig[vehicle.status] ?? statusConfig.available;
            return (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.4 }}
                className="card-premium rounded-xl overflow-hidden hover:shadow-md transition-shadow group"
              >
                {/* Photo */}
                <div className="h-40 bg-muted/30 flex items-center justify-center overflow-hidden">
                  {vehicle.photo_url ? (
                    <img src={vehicle.photo_url} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-cover" />
                  ) : (
                    <Car className="h-12 w-12 text-muted-foreground/20" />
                  )}
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{vehicle.brand} {vehicle.model}</h3>
                      <p className="text-xs text-muted-foreground">{vehicle.year}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setEditingVehicle(vehicle)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Badge variant="outline" className={`text-[10px] ${status.className}`}>
                        <Circle className="h-2 w-2 mr-1 fill-current" />
                        {status.label}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[13px]">
                    {vehicle.license_plate && (
                      <div className="flex items-center gap-2.5 text-muted-foreground">
                        <Hash className="h-3.5 w-3.5 shrink-0" />
                        <span>{vehicle.license_plate}</span>
                      </div>
                    )}
                    {vehicle.vin && (
                      <div className="flex items-center gap-2.5 text-muted-foreground">
                        <KeyRound className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate text-xs">{vehicle.vin}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AgencyAdminVehicles;
