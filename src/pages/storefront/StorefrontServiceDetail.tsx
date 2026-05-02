import { useOutletContext, useParams, Link } from 'react-router-dom';
import { Agency, StorefrontConfig, ServiceType, SERVICE_LABELS } from '@/types/agency';
import { motion } from 'framer-motion';
import { Car, UserCheck, Crown, Building, ChevronLeft, Phone, CheckCircle2, SlidersHorizontal, X, Users, Fuel, Settings2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StorefrontSeo from '@/components/storefront/StorefrontSeo';
import { TemplateStyles } from "@/lib/template-styles";
import { useStorefrontVehicles } from '@/hooks/use-storefront-vehicles';

import { Skeleton } from '@/components/ui/skeleton';
import { useState, useMemo } from 'react';
import TransferBookingForm from '@/components/storefront/TransferBookingForm';
import LimoBookingForm from '@/components/storefront/LimoBookingForm';
import CityTourBookingForm from '@/components/storefront/CityTourBookingForm';
import VehicleFilterSidebar, { VehicleFilters, emptyFilters, hasAnyFilter, countActiveFilters, applyFilters } from '@/components/storefront/VehicleFilterSidebar';

const SERVICE_ICONS: Record<ServiceType, React.ElementType> = {
  car_rental: Car,
  apartment: Building,
  transfer: UserCheck,
  limo_tour: Crown,
  city_tour: Car,
};

const SERVICE_HERO_TEXTS: Record<ServiceType, { title: string; subtitle: string }> = {
  car_rental: { title: 'Car Rental', subtitle: 'Find the perfect car for your journey with competitive prices and top-quality vehicles.' },
  apartment: { title: 'Apartments', subtitle: 'Comfortable furnished apartments for short and long-term stays.' },
  transfer: { title: 'Transfer', subtitle: 'Reliable airport transfers and point-to-point rides with professional drivers.' },
  limo_tour: { title: 'Limo Service', subtitle: 'Premium chauffeur service — hourly hire or point-to-point with luxury vehicles.' },
  city_tour: { title: 'City Tour', subtitle: 'Guided city tours covering top landmarks with knowledgeable local drivers.' },
};

const SERVICE_FEATURES: Record<ServiceType, string[]> = {
  car_rental: ['Wide selection of vehicles', 'Flexible pick-up & drop-off', 'Full insurance included', '24/7 roadside assistance', 'No hidden fees'],
  apartment: ['Fully furnished', 'Central locations', 'Short & long term stays', 'All utilities included', 'Cleaning service available'],
  transfer: ['Professional drivers', 'Airport pickup & drop-off', 'Flight tracking', 'Meet & greet service', 'Fixed prices'],
  limo_tour: ['Professional chauffeurs', 'Hourly & point-to-point options', 'Luxury vehicles', 'Airport & event service', 'Custom routes available'],
  city_tour: ['Half-day & full-day options', 'Local expert drivers', 'Popular landmarks', 'Flexible schedules', 'Private tours available'],
};

const StorefrontServiceDetail = () => {
  const { slug, serviceType } = useParams<{ slug: string; serviceType: string }>();
  const { agency, templateStyles: ts, buttonColor, config: cfg } = useOutletContext<{ agency: Agency; templateStyles: TemplateStyles; buttonColor: string; config: StorefrontConfig }>();
  const tk = ts.tokens;
  const EXP = ts.palette;
  const accent = buttonColor || EXP.brand;
  const headingFont: React.CSSProperties = { fontFamily: ts.typography.heading, letterSpacing: '-0.015em' };

  const service = serviceType as ServiceType;
  const Icon = SERVICE_ICONS[service] ?? Car;
  const heroText = SERVICE_HERO_TEXTS[service] ?? { title: SERVICE_LABELS[service] ?? service, subtitle: '' };
  const features = SERVICE_FEATURES[service] ?? [];

  const { data: vehicles = [], isLoading: vehiclesLoading } = useStorefrontVehicles(agency.id);
  

  const isTransfer = service === 'transfer';
  const isLimo = service === 'limo_tour';
  const isCityTour = service === 'city_tour';

  const [filters, setFilters] = useState<VehicleFilters>(emptyFilters);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [pax, setPax] = useState<number>(1);
  const filteredVehicles = useMemo(
    () => applyFilters(vehicles, filters).filter(v => (v.seats ?? 99) >= pax),
    [vehicles, filters, pax]
  );
  const activeFilterCount = countActiveFilters(filters);

  if (!agency.services?.includes(service)) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center" style={tk.surface}>
        <h1 className="text-2xl font-bold mb-2" style={tk.textPrimary}>Service Not Available</h1>
        <p className="mb-6" style={tk.textBody}>This service is not currently offered.</p>
        <Link to={`/agency/${slug}/services`} className="text-sm font-bold" style={{ color: accent }}>
          ← Back to Services
        </Link>
      </div>
    );
  }

  return (
    <div style={tk.surface}>
      <StorefrontSeo agency={agency} page="fleet" fallbackTitle={`${heroText.title} | ${agency.name}`} fallbackDescription={heroText.subtitle} />

      {/* Hero — compact navy band, Booking.com style */}
      <section className="relative" style={tk.surfaceDeep}>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Link to={`/agency/${slug}/services`} className="inline-flex items-center gap-1 text-xs font-bold mb-4 hover:underline" style={tk.textOnDeepMuted}>
              <ChevronLeft className="h-4 w-4" /> All Services
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-11 w-11 rounded-md flex items-center justify-center bg-white/10">
                <Icon className="h-5 w-5" style={tk.textOnDeep} />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl" style={{ ...headingFont, ...tk.textOnDeep }}>
                {heroText.title}
              </h1>
            </div>
            <p className="text-sm md:text-base max-w-2xl" style={tk.textOnDeepMuted}>
              {heroText.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Trust strip — compact, Booking-style */}
      <section className="border-b py-4" style={{ ...tk.surface, ...tk.border }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {features.slice(0, 5).map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-xs md:text-sm">
              <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: 'hsl(155 50% 36%)' }} />
              <span className="font-semibold" style={tk.textBody}>{f}</span>
            </div>
          ))}
        </div>
      </section>

      {isTransfer ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <TransferBookingForm agency={agency} config={cfg} buttonColor={buttonColor} />
        </section>
      ) : isLimo ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <LimoBookingForm agency={agency} config={cfg} buttonColor={buttonColor} />
        </section>
      ) : isCityTour ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <CityTourBookingForm agency={agency} config={cfg} buttonColor={buttonColor} />
        </section>
      ) : (
        /* Vehicle/Package Listings with Filter Sidebar */
        <section className="py-8" style={tk.surfaceAlt}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
              <div>
                <h2 className="text-xl md:text-2xl" style={{ ...headingFont, ...tk.textPrimary }}>
                  {service === 'apartment' ? 'Available apartments' : service === 'car_rental' ? 'Choose your vehicle' : 'Available packages'}
                </h2>
                <p className="text-xs mt-1" style={tk.textMuted}>
                  <span className="font-bold" style={tk.textPrimary}>{filteredVehicles.length}</span>{' '}
                  result{filteredVehicles.length !== 1 ? 's' : ''} · sorted by our top picks
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 h-9 rounded-md border-2 px-3" style={{ ...tk.inputSurface, ...tk.inputBorder }}>
                  <Users className="h-3.5 w-3.5" style={{ color: accent }} />
                  <span className="text-xs font-bold hidden sm:inline" style={tk.textPrimary}>Guests</span>
                  <button type="button" onClick={() => setPax(p => Math.max(1, p - 1))}
                    className="h-6 w-6 rounded-md border text-xs font-extrabold hover:bg-black/5" style={tk.border}>−</button>
                  <span className="w-5 text-center text-sm font-extrabold" style={tk.textPrimary}>{pax}</span>
                  <button type="button" onClick={() => setPax(p => Math.min(20, p + 1))}
                    className="h-6 w-6 rounded-md border text-xs font-extrabold hover:bg-black/5" style={tk.border}>+</button>
                </div>
                <Button variant="outline" size="sm" className="lg:hidden gap-2 rounded-md font-bold" onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}>
                  <SlidersHorizontal className="h-4 w-4" /> Filter
                  {activeFilterCount > 0 && (
                    <span className="ml-1 h-5 w-5 rounded-full text-[10px] flex items-center justify-center text-white" style={{ backgroundColor: accent }}>
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>

            <div className="flex gap-6">
              <VehicleFilterSidebar vehicles={vehicles} filters={filters} onChange={setFilters} buttonColor={accent} className="hidden lg:block w-64 shrink-0 sticky top-20 self-start" />

              {mobileFiltersOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                  <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
                  <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] p-6 overflow-y-auto shadow-xl" style={tk.surface}>
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-extrabold text-lg" style={tk.textPrimary}>Filters</span>
                      <button onClick={() => setMobileFiltersOpen(false)}><X className="h-5 w-5" style={tk.textPrimary} /></button>
                    </div>
                    <VehicleFilterSidebar vehicles={vehicles} filters={filters} onChange={setFilters} buttonColor={accent} />
                  </div>
                </div>
              )}

              <div className="flex-1 min-w-0">
                {vehiclesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="rounded-md border overflow-hidden" style={{ ...tk.surface, ...tk.border }}>
                        <Skeleton className="h-44 w-full" />
                        <div className="p-4 space-y-2"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-9 w-full mt-2" /></div>
                      </div>
                    ))}
                  </div>
                ) : filteredVehicles.length === 0 ? (
                  <div className="text-center py-16 rounded-md border" style={{ ...tk.surface, ...tk.border }}>
                    <Icon className="h-12 w-12 mx-auto mb-3 opacity-30" style={tk.textFaint} />
                    <p className="text-sm" style={tk.textMuted}>
                      {hasAnyFilter(filters) ? 'No vehicles match your filters. Try adjusting your criteria.' : 'No listings available at the moment. Check back soon!'}
                    </p>
                    {hasAnyFilter(filters) && (
                      <button onClick={() => setFilters(emptyFilters)} className="mt-3 text-sm font-bold underline" style={{ color: accent }}>
                        Clear all filters
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredVehicles.map((vehicle, i) => (
                      <motion.div key={vehicle.id} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                        className="rounded-md border overflow-hidden hover:shadow-lg transition-all duration-200 group" style={{ ...tk.surface, ...tk.border }}>
                        {vehicle.photo_url ? (
                          <img src={vehicle.photo_url} alt={`${vehicle.brand} ${vehicle.model}`} className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                        ) : (
                          <div className="h-40 flex items-center justify-center" style={tk.surfaceAlt}>
                            <Icon className="h-12 w-12" style={tk.textFaint} />
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="font-extrabold text-base leading-tight hover:underline" style={{ color: accent }}>{vehicle.brand} {vehicle.model}</h3>
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
                              {vehicle.daily_rate ? (
                                <>
                                  <p className="text-[10px] line-through" style={tk.textMuted}>{Math.round(vehicle.daily_rate * 1.2).toLocaleString()}€</p>
                                  <p className="text-xl font-extrabold leading-tight" style={tk.textPrimary}>{vehicle.daily_rate.toLocaleString()}€<span className="text-xs font-normal" style={tk.textMuted}> / {service === 'apartment' ? 'night' : 'day'}</span></p>
                                  <p className="text-[10px]" style={tk.textMuted}>Incl. taxes & fees</p>
                                </>
                              ) : (
                                <p className="text-sm" style={tk.textMuted}>Contact for price</p>
                              )}
                            </div>
                            <Button size="sm" className="rounded-md text-xs font-extrabold h-9 px-4 hover:brightness-95"
                              style={{ backgroundColor: accent, color: '#ffffff' }}>
                              {cfg.cta_text || 'See availability'}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA — navy band */}
      <section className="py-10" style={tk.surfaceDeep}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl mb-2" style={{ ...headingFont, ...tk.textOnDeep }}>Need help booking?</h2>
          <p className="text-sm mb-5 max-w-lg mx-auto" style={tk.textOnDeepMuted}>Real people, ready to help anywhere, anytime.</p>
          <Link to={`/agency/${slug}/contact`}>
            <Button className="rounded-md font-extrabold gap-2 px-8 h-11 text-sm hover:brightness-95"
              style={{ backgroundColor: EXP.cta, color: EXP.ctaText }}>
              <Phone className="h-4 w-4" /> Contact us <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default StorefrontServiceDetail;
