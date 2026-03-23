import { useState } from 'react';
import { motion } from 'framer-motion';
import { Car, CircleDot, CalendarDays } from 'lucide-react';
import { useAllVehicles, Vehicle } from '@/hooks/use-vehicles';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import VehiclePricingDialog from '@/components/agency-admin/VehiclePricingDialog';

const Vehicles = () => {
  const { data: vehicles = [], isLoading } = useAllVehicles();
  const [pricingVehicle, setPricingVehicle] = useState<Vehicle | null>(null);

  return (
    <div className="space-y-8 max-w-[1200px]">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-[11px] font-semibold text-accent uppercase tracking-[0.2em] mb-1">
          Fleet
        </p>
        <h1 className="text-[30px] font-display font-bold text-foreground leading-tight">
          Vehicles
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5 font-light">
          All vehicles across every agency
        </p>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[260px] rounded-xl" />
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-16">
          <Car className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">No vehicles found across agencies.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {vehicles.map((vehicle, i) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.04, duration: 0.5 }}
              className="card-premium rounded-xl overflow-hidden group"
            >
              {vehicle.photo_url ? (
                <div className="h-44 overflow-hidden bg-secondary/30">
                  <img
                    src={vehicle.photo_url}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="h-44 flex items-center justify-center bg-secondary/30">
                  <Car className="h-14 w-14 text-muted-foreground/30" />
                </div>
              )}
              <div className="p-5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-bold text-foreground">
                    {vehicle.brand} {vehicle.model}
                  </h3>
                  <Badge
                    variant={vehicle.status === 'available' ? 'default' : vehicle.status === 'rented' ? 'secondary' : 'outline'}
                    className="text-[10px] capitalize"
                  >
                    <CircleDot className="h-2.5 w-2.5 mr-1" />
                    {vehicle.status}
                  </Badge>
                </div>
                <p className="text-[12px] text-muted-foreground">{vehicle.year} · {vehicle.agency_name}</p>
                {vehicle.license_plate && (
                  <p className="text-[11px] text-muted-foreground/70 font-mono">{vehicle.license_plate}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Vehicles;
