import { useOutletContext, useParams, Link } from 'react-router-dom';
import { Agency, StorefrontConfig, ServiceType, SERVICE_LABELS } from '@/types/agency';
import { motion } from 'framer-motion';
import { Car, UserCheck, Crown, Building, Truck, ChevronLeft, Phone, CheckCircle2, SlidersHorizontal, X, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StorefrontSeo from '@/components/storefront/StorefrontSeo';
import { TemplateStyles } from '@/lib/template-styles';
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
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-2">Service Not Available</h1>
        <p className="opacity-60 mb-6">This service is not currently offered.</p>
        <Link to={`/agency/${slug}/services`} className="text-sm font-medium" style={{ color: buttonColor }}>
          ← Back to Services
        </Link>
      </div>
    );
  }

  return (
    <div>
      <StorefrontSeo agency={agency} page="fleet" fallbackTitle={`${heroText.title} | ${agency.name}`} fallbackDescription={heroText.subtitle} />

      {/* Hero */}
      <section className={`relative overflow-hidden ${ts.heroClass}`} style={{ ...ts.heroStyle, ...(cfg.hero_bg_color ? { backgroundColor: cfg.hero_bg_color } : {}) }}>
        {(ts.heroOverlayClass || ts.heroOverlayStyle) && !cfg.hero_bg_color && <div className={`absolute inset-0 ${ts.heroOverlayClass}`} style={ts.heroOverlayStyle} />}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link to={`/agency/${slug}/services`} className={`inline-flex items-center gap-1 text-sm mb-4 opacity-70 hover:opacity-100 transition-opacity ${ts.heroSubtitleClass}`} style={ts.heroSubtitleStyle}>
              <ChevronLeft className="h-4 w-4" /> All Services
            </Link>
            <div className="flex items-center gap-4 mb-5">
              <div className="h-14 w-14 rounded-2xl flex items-center justify-center bg-white/10">
                <Icon className="h-7 w-7" style={{ ...(cfg.hero_text_color ? { color: cfg.hero_text_color } : ts.heroTitleStyle) }} />
              </div>
              <h1 className={`font-editorial text-4xl md:text-5xl lg:text-6xl ${ts.heroTitleClass}`} style={{ ...ts.heroTitleStyle, ...(cfg.hero_text_color ? { color: cfg.hero_text_color } : {}) }}>
                {heroText.title}
              </h1>
            </div>
            <p className={`text-base md:text-lg max-w-xl font-light leading-relaxed ${ts.heroSubtitleClass}`} style={{ ...ts.heroSubtitleStyle, ...(cfg.hero_subtitle_color ? { color: cfg.hero_subtitle_color } : {}) }}>
              {heroText.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <p className="editorial-eyebrow mb-3 text-foreground/60">Included</p>
        <h2 className="font-editorial text-3xl md:text-4xl mb-10" style={cfg.heading_color ? { color: cfg.heading_color } : undefined}>What's included</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3 p-4 rounded-xl" style={ts.cardStyle}>
              <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: buttonColor }} />
              <span className="text-sm font-medium">{f}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {isTransfer ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <TransferBookingForm agency={agency} config={cfg} buttonColor={buttonColor} />
        </section>
      ) : isLimo ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <LimoBookingForm agency={agency} config={cfg} buttonColor={buttonColor} />
        </section>
      ) : isCityTour ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <CityTourBookingForm agency={agency} config={cfg} buttonColor={buttonColor} />
        </section>
      ) : (
        /* Vehicle/Package Listings with Filter Sidebar */
        <section className={`py-16 ${ts.sectionAltClass}`} style={ts.sectionAltStyle}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold" style={cfg.heading_color ? { color: cfg.heading_color } : undefined}>
                {service === 'apartment' ? 'Available Apartments' : service === 'car_rental' ? 'Choose Your Vehicle' : 'Available Packages'}
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 h-9 rounded-md border border-input px-3 bg-background">
                  <Users className="h-3.5 w-3.5" style={{ color: buttonColor }} />
                  <span className="text-xs font-medium hidden sm:inline">Passengers</span>
                  <button type="button" onClick={() => setPax(p => Math.max(1, p - 1))}
                    className="h-6 w-6 rounded-md border border-border hover:bg-muted text-xs font-bold">−</button>
                  <span className="w-5 text-center text-sm font-semibold">{pax}</span>
                  <button type="button" onClick={() => setPax(p => Math.min(20, p + 1))}
                    className="h-6 w-6 rounded-md border border-border hover:bg-muted text-xs font-bold">+</button>
                </div>
                <Button variant="outline" size="sm" className="lg:hidden gap-2" onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}>
                  <SlidersHorizontal className="h-4 w-4" /> Filter
                  {activeFilterCount > 0 && (
                    <span className="ml-1 h-5 w-5 rounded-full text-xs flex items-center justify-center text-white" style={{ backgroundColor: buttonColor }}>
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>

            <div className="flex gap-8">
              <VehicleFilterSidebar vehicles={vehicles} filters={filters} onChange={setFilters} buttonColor={buttonColor} className="hidden lg:block w-64 shrink-0 sticky top-4 self-start" />

              {mobileFiltersOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                  <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
                  <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-background p-6 overflow-y-auto shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-bold text-lg">Filters</span>
                      <button onClick={() => setMobileFiltersOpen(false)}><X className="h-5 w-5" /></button>
                    </div>
                    <VehicleFilterSidebar vehicles={vehicles} filters={filters} onChange={setFilters} buttonColor={buttonColor} />
                  </div>
                </div>
              )}

              <div className="flex-1 min-w-0">
                {vehiclesLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="rounded-xl border border-current/10 overflow-hidden" style={ts.cardStyle}>
                        <Skeleton className="h-44 w-full" />
                        <div className="p-5">
                          <Skeleton className="h-5 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-1/2 mb-4" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredVehicles.length === 0 ? (
                  <div className="text-center py-16 opacity-50">
                    <Icon className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">
                      {hasAnyFilter(filters) ? 'No vehicles match your filters. Try adjusting your criteria.' : 'No listings available at the moment. Check back soon!'}
                    </p>
                    {hasAnyFilter(filters) && (
                      <button onClick={() => setFilters(emptyFilters)} className="mt-3 text-sm font-medium underline" style={{ color: buttonColor }}>
                        Clear all filters
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <p className="text-sm opacity-50 mb-4">{filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? 's' : ''} found</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {filteredVehicles.map((vehicle, i) => (
                        <motion.div key={vehicle.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                          className="rounded-xl border border-current/10 overflow-hidden transition-shadow hover:shadow-lg" style={ts.cardStyle}>
                          {vehicle.photo_url ? (
                            <img src={vehicle.photo_url} alt={`${vehicle.brand} ${vehicle.model}`} className="h-44 w-full object-cover" />
                          ) : (
                            <div className="h-44 flex items-center justify-center opacity-10 bg-current">
                              <Icon className="h-14 w-14" />
                            </div>
                          )}
                          <div className="p-5">
                            <h3 className="font-bold text-lg">{vehicle.brand} {vehicle.model}</h3>
                            <p className="text-xs opacity-50 mb-4">{vehicle.year}</p>
                            <div className="flex items-center justify-between pt-3 border-t border-current/10">
                              {vehicle.daily_rate ? (
                                <p className="text-lg font-bold">${vehicle.daily_rate.toLocaleString()}<span className="text-xs font-normal opacity-50"> / {service === 'apartment' ? 'night' : 'day'}</span></p>
                              ) : (
                                <p className="text-sm opacity-50">Contact for price</p>
                              )}
                              <Button size="sm" variant="outline" className="rounded-lg text-sm font-semibold border-2" style={{ borderColor: buttonColor, color: buttonColor }}
                                onMouseEnter={e => { const el = e.target as HTMLElement; el.style.backgroundColor = buttonColor; el.style.color = '#fff'; }}
                                onMouseLeave={e => { const el = e.target as HTMLElement; el.style.backgroundColor = 'transparent'; el.style.color = buttonColor; }}>
                                {cfg.cta_text || 'Book Now'}
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold mb-3" style={cfg.heading_color ? { color: cfg.heading_color } : undefined}>Ready to Book?</h2>
        <p className="opacity-60 mb-6 max-w-md mx-auto text-sm">Contact us to learn more or make a reservation today.</p>
        <div className="flex items-center justify-center gap-4">
          <Link to={`/agency/${slug}/contact`}>
            <Button className="rounded-lg text-white gap-2" style={{ backgroundColor: buttonColor }}>
              <Phone className="h-4 w-4" /> Contact Us
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default StorefrontServiceDetail;
