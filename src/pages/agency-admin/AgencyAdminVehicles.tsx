import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, Search, Circle, Hash, KeyRound, Pencil, Sparkles, CalendarRange } from 'lucide-react';
import { Agency } from '@/types/agency';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAgencyVehicles, Vehicle } from '@/hooks/use-vehicles';
import CreateVehicleDialog from '@/components/agency-admin/CreateVehicleDialog';
import EditVehicleDialog from '@/components/agency-admin/EditVehicleDialog';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { eachDayOfInterval, parseISO, format } from 'date-fns';
import { cn } from '@/lib/utils';

const DUMMY_VEHICLES = [
  { brand: 'Mercedes-Benz', model: 'S-Class', year: 2023, license_plate: 'AB-100-CD', category: 'luxury', transmission: 'automatic', seats: 5, fuel_type: 'gasoline', air_conditioning: true, mileage_policy: 'unlimited', daily_rate_base: 180, status: 'available', photo_url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800' },
  { brand: 'BMW', model: '5 Series', year: 2023, license_plate: 'AB-101-CD', category: 'sedan', transmission: 'automatic', seats: 5, fuel_type: 'diesel', air_conditioning: true, mileage_policy: 'unlimited', daily_rate_base: 120, status: 'available', photo_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800' },
  { brand: 'Audi', model: 'Q7', year: 2022, license_plate: 'AB-102-CD', category: 'suv', transmission: 'automatic', seats: 7, fuel_type: 'diesel', air_conditioning: true, mileage_policy: 'limited', daily_rate_base: 150, status: 'available', photo_url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800' },
  { brand: 'Volkswagen', model: 'Golf', year: 2024, license_plate: 'AB-103-CD', category: 'hatchback', transmission: 'manual', seats: 5, fuel_type: 'gasoline', air_conditioning: true, mileage_policy: 'unlimited', daily_rate_base: 55, status: 'available', photo_url: 'https://images.unsplash.com/photo-1606220838315-056192d5e927?w=800' },
  { brand: 'Tesla', model: 'Model 3', year: 2024, license_plate: 'AB-104-CD', category: 'electric', transmission: 'automatic', seats: 5, fuel_type: 'electric', air_conditioning: true, mileage_policy: 'unlimited', daily_rate_base: 110, status: 'available', photo_url: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800' },
  { brand: 'Renault', model: 'Clio', year: 2023, license_plate: 'AB-105-CD', category: 'hatchback', transmission: 'manual', seats: 5, fuel_type: 'gasoline', air_conditioning: true, mileage_policy: 'unlimited', daily_rate_base: 38, status: 'available', photo_url: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800' },
  { brand: 'Porsche', model: 'Cayenne', year: 2023, license_plate: 'AB-106-CD', category: 'luxury', transmission: 'automatic', seats: 5, fuel_type: 'gasoline', air_conditioning: true, mileage_policy: 'limited', daily_rate_base: 240, status: 'maintenance', photo_url: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800' },
  { brand: 'Fiat', model: '500', year: 2024, license_plate: 'AB-107-CD', category: 'hatchback', transmission: 'manual', seats: 4, fuel_type: 'gasoline', air_conditioning: true, mileage_policy: 'unlimited', daily_rate_base: 32, status: 'rented', photo_url: 'https://images.unsplash.com/photo-1583267826935-bcb371fbc0f9?w=800' },
];

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
  const [seeding, setSeeding] = useState(false);
  const qc = useQueryClient();

  const { data: reservations = [] } = useQuery({
    queryKey: ['agency-bookings', agency.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, customer_name, pickup_date, return_date, status, vehicle_id')
        .eq('agency_id', agency.id)
        .not('vehicle_id', 'is', null)
        .order('pickup_date', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const vehicleById = new Map(vehicles.map((v) => [v.id, v]));
  const reservedDays: Date[] = reservations.flatMap((b: any) => {
    try {
      return eachDayOfInterval({ start: parseISO(b.pickup_date), end: parseISO(b.return_date) });
    } catch { return []; }
  });

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const rows = DUMMY_VEHICLES.map(v => ({ ...v, agency_id: agency.id }));
      const { error } = await supabase.from('vehicles').insert(rows);
      if (error) throw error;
      toast.success(`Added ${rows.length} dummy vehicles`);
      qc.invalidateQueries({ queryKey: ['vehicles', agency.id] });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSeeding(false);
    }
  };


  const filtered = vehicles.filter((v) =>
    `${v.brand} ${v.model}`.toLowerCase().includes(search.toLowerCase()) ||
    v.license_plate?.toLowerCase().includes(search.toLowerCase()) ||
    v.serial_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-[1200px]">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold text-accent uppercase tracking-[0.2em] mb-1">Fleet</p>
          <h1 className="text-[30px] font-display font-bold text-foreground leading-tight">Vehicles</h1>
          <p className="text-sm text-muted-foreground mt-1.5 font-light">Manage your car fleet and availability</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSeed} disabled={seeding} className="gap-2 rounded-xl">
            <Sparkles className="h-4 w-4" />
            {seeding ? 'Seeding...' : 'Seed dummy vehicles'}
          </Button>
          <CreateVehicleDialog agencyId={agency.id} />
        </div>
      </motion.div>

      {/* Fleet-wide reservations calendar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card-premium rounded-xl p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarRange className="h-4 w-4 text-accent" />
            <h2 className="text-sm font-semibold text-foreground">Reservations Calendar</h2>
          </div>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm bg-accent/30 border border-accent/50" /> Reserved day
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[auto,1fr] gap-6">
          <div className="flex justify-center">
            <Calendar
              mode="multiple"
              numberOfMonths={2}
              selected={[]}
              onSelect={() => {}}
              modifiers={{ reserved: reservedDays }}
              modifiersClassNames={{ reserved: 'bg-accent/30 text-accent-foreground font-semibold' }}
              className={cn('p-3 pointer-events-auto rounded-md border border-border')}
            />
          </div>

          <div className="space-y-2 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {reservations.length} reservation{reservations.length === 1 ? '' : 's'}
            </p>
            {reservations.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No reservations yet.</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {reservations.map((b: any) => {
                  const v = vehicleById.get(b.vehicle_id);
                  return (
                    <div key={b.id} className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3 gap-3">
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {v ? `${v.brand} ${v.model}` : 'Vehicle'} <span className="text-muted-foreground font-normal">· {b.customer_name}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(b.pickup_date), 'MMM d, yyyy')} → {format(parseISO(b.return_date), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[10px] capitalize shrink-0">{b.status}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
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
                      <p className="text-xs text-muted-foreground">
                        {vehicle.year}
                        {vehicle.vehicle_class && (
                          <> · <span className="capitalize">{vehicle.vehicle_class.replace('_', ' ')}</span></>
                        )}
                      </p>
                      {vehicle.serial_number && (
                        <p className="text-[10px] font-mono text-accent mt-1 tracking-wider">{vehicle.serial_number}</p>
                      )}
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

      <EditVehicleDialog
        vehicle={editingVehicle}
        open={!!editingVehicle}
        onOpenChange={(open) => !open && setEditingVehicle(null)}
      />
    </div>
  );
};

export default AgencyAdminVehicles;
