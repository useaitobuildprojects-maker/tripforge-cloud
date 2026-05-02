import { useOutletContext, useParams, Link } from 'react-router-dom';
import { Agency, StorefrontConfig } from '@/types/agency';
import { motion } from 'framer-motion';
import { Car, Users, Fuel, Settings2, Briefcase, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StorefrontSeo from '@/components/storefront/StorefrontSeo';
import { TemplateStyles } from "@/lib/template-styles";
import { useMarketplaceVehicles, MarketplaceVehicle } from '@/hooks/use-marketplace-vehicles';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useMemo } from 'react';
import VehicleFilterSidebar, {
  VehicleFilters, emptyFilters, hasAnyFilter, countActiveFilters, applyFilters,
} from '@/components/storefront/VehicleFilterSidebar';
import BookingQuoteDialog from '@/components/storefront/BookingQuoteDialog';

const StorefrontFleet = () => {
  const { slug } = useParams();
  const { agency, templateStyles: ts, buttonColor, config: cfg } =
    useOutletContext<{ agency: Agency; templateStyles: TemplateStyles; buttonColor: string; config: StorefrontConfig }>();
  const tk = ts.tokens;
  const EXP = ts.palette;
  const accent = buttonColor || EXP.brand;
  const headingFont: React.CSSProperties = { fontFamily: ts.typography.heading, letterSpacing: '-0.015em' };

  const { data: vehicles = [], isLoading } = useMarketplaceVehicles(agency.id, agency.commission_rate);

  const [filters, setFilters] = useState<VehicleFilters>(emptyFilters);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'price_asc' | 'price_desc'>('recommended');
  const [bookingVehicle, setBookingVehicle] = useState<MarketplaceVehicle | null>(null);

  const filteredVehicles = useMemo(() => {
    const base = applyFilters(vehicles, filters);
    if (sortBy === 'price_asc') return [...base].sort((a, b) => (a.daily_rate ?? 9e9) - (b.daily_rate ?? 9e9));
    if (sortBy === 'price_desc') return [...base].sort((a, b) => (b.daily_rate ?? 0) - (a.daily_rate ?? 0));
    return base;
  }, [vehicles, filters, sortBy]);

  const activeFilterCount = countActiveFilters(filters);

  return (
    <div style={tk.surface}>
      <StorefrontSeo
        agency={agency}
        page="fleet"
        fallbackTitle={`Our Fleet | ${agency.name}`}
        fallbackDescription={`Browse our premium fleet of vehicles available for rent at ${agency.name} in ${agency.city}, ${agency.country}.`}
      />

      {/* Compact navy header band — Booking.com style */}
      <section style={tk.surfaceDeep}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
          <h1 className="text-3xl md:text-4xl mb-2" style={{ ...headingFont, ...tk.textOnDeep }}>
            {cfg.fleet_title || `Vehicles in ${agency.city}`}
          </h1>
          <p className="max-w-2xl text-sm md:text-base" style={tk.textOnDeepMuted}>
            {cfg.fleet_subtitle || `Browse our full fleet — best price guarantee, free cancellation on most rentals.`}
          </p>
        </div>
      </section>

      {/* Results bar */}
      <section className="border-b" style={{ ...tk.surface, ...tk.border }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm" style={tk.textBody}>
            <span className="font-extrabold" style={tk.textPrimary}>{filteredVehicles.length}</span>{' '}
            vehicle{filteredVehicles.length !== 1 ? 's' : ''} available
          </p>
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold hidden sm:inline" style={tk.textMuted}>Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="h-9 rounded-md border-2 px-2 text-sm font-semibold focus:outline-none"
              style={{ ...tk.inputSurface, ...tk.inputBorder, ...tk.textPrimary }}
            >
              <option value="recommended">Our top picks</option>
              <option value="price_asc">Price (lowest first)</option>
              <option value="price_desc">Price (highest first)</option>
            </select>
            <Button variant="outline" size="sm" className="lg:hidden gap-2 rounded-md font-bold" onClick={() => setMobileFiltersOpen(true)}>
              <SlidersHorizontal className="h-4 w-4" /> Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 h-5 w-5 rounded-full text-[10px] flex items-center justify-center text-white" style={{ backgroundColor: accent }}>
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </section>

      <section className="py-6" style={tk.surfaceAlt}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-6">
          <VehicleFilterSidebar
            vehicles={vehicles}
            filters={filters}
            onChange={setFilters}
            buttonColor={accent}
            className="hidden lg:block w-64 shrink-0 sticky top-20 self-start"
          />

          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
              <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] p-6 overflow-y-auto shadow-xl" style={tk.surface}>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-extrabold text-lg" style={tk.textPrimary}>Filters</span>
                  <button onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters">
                    <X className="h-5 w-5" style={tk.textPrimary} />
                  </button>
                </div>
                <VehicleFilterSidebar vehicles={vehicles} filters={filters} onChange={setFilters} buttonColor={accent} />
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-md border overflow-hidden" style={{ ...tk.surface, ...tk.border }}>
                    <Skeleton className="h-44 w-full" />
                    <div className="p-4 space-y-2"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-9 w-full mt-2" /></div>
                  </div>
                ))}
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="text-center py-20 rounded-md border" style={{ ...tk.surface, ...tk.border }}>
                <Car className="h-12 w-12 mx-auto mb-3 opacity-30" style={tk.textFaint} />
                <p className="text-sm" style={tk.textMuted}>
                  {hasAnyFilter(filters) ? 'No vehicles match your filters.' : 'No vehicles available right now.'}
                </p>
                {hasAnyFilter(filters) && (
                  <button onClick={() => setFilters(emptyFilters)} className="mt-3 text-sm font-bold underline" style={{ color: accent }}>
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredVehicles.map((vehicle, i) => {
                  const mv = vehicle as MarketplaceVehicle;
                  return (
                    <motion.div
                      key={vehicle.id}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.04 }}
                      className="rounded-md border overflow-hidden hover:shadow-lg transition-all duration-200 group relative"
                      style={{ ...tk.surface, ...tk.border }}
                    >
                      {mv.agency_name && !mv.is_own && (
                        <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-black/75 text-white text-[10px] font-bold">
                          {mv.agency_logo_url ? (
                            <img src={mv.agency_logo_url} alt="" className="h-4 w-4 rounded-full object-cover" />
                          ) : (
                            <Briefcase className="h-3 w-3" />
                          )}
                          via {mv.agency_name}
                        </div>
                      )}
                      {vehicle.photo_url ? (
                        <img
                          src={vehicle.photo_url}
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-40 flex items-center justify-center" style={tk.surfaceAlt}>
                          <Car className="h-12 w-12" style={tk.textFaint} />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-extrabold text-base leading-tight hover:underline" style={{ color: accent }}>
                          {vehicle.brand} {vehicle.model}
                        </h3>
                        <p className="text-[11px] mt-0.5" style={tk.textMuted}>{vehicle.year}</p>

                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="px-1.5 py-0.5 rounded-sm text-[11px] font-extrabold text-white" style={{ backgroundColor: accent }}>4.7</span>
                          <span className="text-xs font-bold" style={tk.textPrimary}>Very good</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px]" style={tk.textMuted}>
                          <span className="flex items-center gap-1"><Fuel className="h-3 w-3" /> {vehicle.fuel_type || 'Petrol'}</span>
                          <span className="flex items-center gap-1"><Settings2 className="h-3 w-3" /> {vehicle.transmission || 'Manual'}</span>
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {vehicle.seats || 5}</span>
                        </div>

                        <p className="text-[11px] mt-2 font-bold" style={{ color: 'hsl(155 50% 36%)' }}>✓ Free cancellation</p>

                        <div className="flex items-end justify-between mt-3 pt-3 border-t" style={tk.border}>
                          <div>
                            {vehicle.display_price_per_km ? (
                              <>
                                <p className="text-[10px]" style={tk.textMuted}>From</p>
                                <p className="text-xl font-extrabold leading-tight" style={tk.textPrimary}>
                                  {vehicle.display_price_per_km}€<span className="text-xs font-normal" style={tk.textMuted}> /km</span>
                                </p>
                              </>
                            ) : vehicle.daily_rate ? (
                              <>
                                <p className="text-[10px] line-through" style={tk.textMuted}>{Math.round(vehicle.daily_rate * 1.2).toLocaleString()}€</p>
                                <p className="text-xl font-extrabold leading-tight" style={tk.textPrimary}>
                                  {vehicle.daily_rate.toLocaleString()}€<span className="text-xs font-normal" style={tk.textMuted}> /day</span>
                                </p>
                                <p className="text-[10px]" style={tk.textMuted}>Incl. taxes & fees</p>
                              </>
                            ) : (
                              <p className="text-sm" style={tk.textMuted}>Contact</p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            className="rounded-md text-xs font-extrabold h-9 px-4 hover:brightness-95"
                            style={{ backgroundColor: accent, color: '#ffffff' }}
                            onClick={() => setBookingVehicle(mv)}
                          >
                            {cfg.cta_text || 'See availability'}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {bookingVehicle && (
        <BookingQuoteDialog
          open={!!bookingVehicle}
          onOpenChange={(open) => !open && setBookingVehicle(null)}
          vehicle={bookingVehicle}
          buttonColor={accent}
          oneWayFee={agency.one_way_fee}
          isOneWay={false}
          numDays={1}
        />
      )}
    </div>
  );
};

export default StorefrontFleet;
