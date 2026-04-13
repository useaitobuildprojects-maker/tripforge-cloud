import { useOutletContext, Link, useParams } from 'react-router-dom';
import { Agency, StorefrontConfig, ServiceType, SERVICE_LABELS } from '@/types/agency';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, Clock, Car, Building, Navigation, Briefcase, Globe, Users, Star, ChevronRight, ChevronLeft, Fuel, Settings2, X, SlidersHorizontal, ArrowRight, Check, Shield, Zap, Award } from 'lucide-react';

import { Button } from '@/components/ui/button';
import StorefrontSeo from '@/components/storefront/StorefrontSeo';
import { TemplateStyles } from '@/lib/template-styles';
import defaultHeroImage from '@/assets/hero-desert.jpg';
import serviceTransfer from '@/assets/service-transfer.jpg';
import serviceLimo from '@/assets/service-limo.jpg';
import serviceRental from '@/assets/service-rental.jpg';
import serviceApartment from '@/assets/service-apartment.jpg';
import serviceCityTour from '@/assets/service-city-tour.jpg';
import { useMarketplaceVehicles, MarketplaceVehicle } from '@/hooks/use-marketplace-vehicles';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useMemo, useRef } from 'react';
import VehicleFilterSidebar, { VehicleFilters, emptyFilters, hasAnyFilter, countActiveFilters, applyFilters } from '@/components/storefront/VehicleFilterSidebar';
import LocationAutocomplete, { getAgencyLocations } from '@/components/storefront/LocationAutocomplete';
import BookingQuoteDialog from '@/components/storefront/BookingQuoteDialog';
import TransferBookingForm from '@/components/storefront/TransferBookingForm';
import LimoBookingForm from '@/components/storefront/LimoBookingForm';

const SERVICE_ICONS: Record<ServiceType, React.ElementType> = {
  car_rental: Car,
  apartment: Building,
  transfer: Navigation,
  limo_tour: Briefcase,
  city_tour: Globe,
};

const SERVICE_SHORT_DESC: Record<ServiceType, string> = {
  car_rental: 'Wide selection of quality vehicles for every need.',
  apartment: 'Furnished apartments for comfortable stays.',
  transfer: 'Airport transfers & point-to-point rides with professional drivers.',
  limo_tour: 'Premium chauffeur service — hourly hire or luxury point-to-point rides.',
  city_tour: 'Guided city tours with local expert drivers.',
};

const SERVICE_IMAGES: Record<ServiceType, string> = {
  transfer: serviceTransfer,
  limo_tour: serviceLimo,
  car_rental: serviceRental,
  apartment: serviceApartment,
  city_tour: serviceCityTour,
};

const StorefrontHome = () => {
  const { slug } = useParams();
  const { agency, templateStyles: ts, buttonColor, config: cfg } = useOutletContext<{ agency: Agency; templateStyles: TemplateStyles; buttonColor: string; config: StorefrontConfig }>();

  const enabledServices = agency.services ?? [];
  const { data: vehicles = [], isLoading: vehiclesLoading } = useMarketplaceVehicles(agency.id, agency.commission_rate);

  const [activeService, setActiveService] = useState<ServiceType | 'all'>(enabledServices[0] ?? 'car_rental');
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [dropoffDate, setDropoffDate] = useState('');
  const [dropoffTime, setDropoffTime] = useState('');
  const [sameReturn, setSameReturn] = useState(true);
  const [searchActive, setSearchActive] = useState(false);
  const vehiclesRef = useRef<HTMLDivElement>(null);
  const agencyLocations = useMemo(() => {
    const configLocs = cfg?.locations;
    if (configLocs && configLocs.length > 0) {
      return configLocs.map((l, i) => ({ id: `loc-${i}`, name: l.name, type: l.type, address: l.address }));
    }
    return getAgencyLocations(agency.city, agency.country);
  }, [cfg?.locations, agency.city, agency.country]);

  const [filters, setFilters] = useState<VehicleFilters>(emptyFilters);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const filteredVehicles = useMemo(() => applyFilters(vehicles, filters), [vehicles, filters]);
  const activeFilterCount = countActiveFilters(filters);

  const [bookingVehicle, setBookingVehicle] = useState<MarketplaceVehicle | null>(null);
  const isOneWay = !sameReturn && pickupLocation !== dropoffLocation && !!dropoffLocation;
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const minReturnDate = useMemo(() => {
    if (!pickupDate) return todayStr;
    const d = new Date(pickupDate);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, [pickupDate, todayStr]);

  const handlePickupDateChange = (val: string) => {
    setPickupDate(val);
    if (val) {
      const min = new Date(val);
      min.setDate(min.getDate() + 1);
      const minStr = min.toISOString().split('T')[0];
      if (!dropoffDate || dropoffDate < minStr) setDropoffDate(minStr);
    }
  };
  const handleDropoffDateChange = (val: string) => {
    if (pickupDate && val <= pickupDate) return;
    setDropoffDate(val);
  };

  const numDays = useMemo(() => {
    if (pickupDate && dropoffDate) {
      const diff = Math.ceil((new Date(dropoffDate).getTime() - new Date(pickupDate).getTime()) / 86400000);
      return diff > 0 ? diff : 1;
    }
    return 1;
  }, [pickupDate, dropoffDate]);

  const vehicleServices: ServiceType[] = ['car_rental'];
  const showVehicles = activeService === 'all' || vehicleServices.includes(activeService);

  const testimonials = cfg.reviews ?? [
    { name: 'Eva Hicks', text: 'Excellent service and well-maintained vehicles. The staff was incredibly helpful throughout.', rating: 5 },
    { name: 'Donald Wolf', text: 'Best car rental experience I\'ve ever had. Will definitely be coming back!', rating: 5 },
    { name: 'Sarah Klein', text: 'Great selection of vehicles and transparent pricing. Seamless booking process.', rating: 4 },
  ];
  const [reviewIndex, setReviewIndex] = useState(0);

  return (
    <div>
      <StorefrontSeo
        agency={agency}
        page="home"
        fallbackTitle={agency.meta_title || `${agency.name} | ${agency.city}, ${agency.country}`}
        fallbackDescription={agency.meta_description || `Premium travel services by ${agency.name} in ${agency.city}, ${agency.country}.`}
      />

      {/* ═══════════════ HERO — Uber split style ═══════════════ */}
      <section className="bg-black">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[520px]">
            {/* Left — text + booking form */}
            <div className="flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-16 lg:py-20">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.08] text-white tracking-tight mb-6">
                  {cfg.hero_title || `Go anywhere with ${agency.name}`}
                </h1>
                <p className="text-white/50 text-base mb-8 max-w-md">
                  {cfg.hero_subtitle || `Premium travel services in ${agency.city}. Book your ride, rental, or transfer in seconds.`}
                </p>
              </motion.div>

              {/* Booking inputs — Uber style */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
                <div className="space-y-3 max-w-md">
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-white z-10" />
                    <div className="bg-white/10 rounded-lg pl-10">
                      <LocationAutocomplete value={pickupLocation} onChange={setPickupLocation} placeholder="Pickup location" locations={agencyLocations} agencyCity={agency.city} />
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 h-2 w-2 bg-white z-10" />
                    <div className="bg-white/10 rounded-lg pl-10">
                      <LocationAutocomplete value={dropoffLocation} onChange={setDropoffLocation} placeholder="Dropoff location" locations={agencyLocations} agencyCity={agency.city} />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1 bg-white/10 rounded-lg px-4 py-3">
                      <input type="date" value={pickupDate} min={todayStr} onChange={(e) => handlePickupDateChange(e.target.value)} className="bg-transparent text-white text-sm w-full focus:outline-none [color-scheme:dark]" />
                    </div>
                    <div className="flex-1 bg-white/10 rounded-lg px-4 py-3">
                      <input type="date" value={dropoffDate} min={minReturnDate} onChange={(e) => handleDropoffDateChange(e.target.value)} className="bg-transparent text-white text-sm w-full focus:outline-none [color-scheme:dark]" />
                    </div>
                  </div>
                  <button
                    className="w-full py-3.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 text-black bg-white"
                    onClick={() => { setSearchActive(true); vehiclesRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
                  >
                    See prices
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Right — hero image */}
            <div className="hidden lg:block relative overflow-hidden">
              <motion.img
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                src={cfg.home_hero_image || defaultHeroImage}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
                width={1920} height={1080}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ EXPLORE SERVICES — Uber card grid ═══════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-black mb-10 tracking-tight"
          >
            Explore what you can do
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(enabledServices.length > 0 ? enabledServices : ['car_rental', 'transfer', 'limo_tour'] as ServiceType[]).map((service, i) => {
              const Icon = SERVICE_ICONS[service] ?? Car;
              const label = SERVICE_LABELS[service] ?? service;
              const desc = SERVICE_SHORT_DESC[service];
              const image = SERVICE_IMAGES[service];
              return (
                <motion.div
                  key={service}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link
                    to={`/agency/${slug}/services/${service}`}
                    className="group flex items-center gap-5 p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all duration-200"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-black mb-1">{label}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed mb-3 line-clamp-2">{desc}</p>
                      <span className="inline-flex items-center text-sm font-medium text-black group-hover:underline">
                        Details
                      </span>
                    </div>
                    {image && (
                      <img src={image} alt={label} className="h-[100px] w-[100px] rounded-xl object-cover shrink-0" loading="lazy" />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ WHY CHOOSE US — Stats ═══════════════ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'Safety first', desc: 'Every ride is insured and tracked for your peace of mind.' },
              { icon: Zap, title: 'Fast booking', desc: 'Get a price estimate and book in under 60 seconds.' },
              { icon: Award, title: 'Professional drivers', desc: 'Vetted, experienced drivers who know the city.' },
              { icon: Clock, title: '24/7 support', desc: 'Our team is always available to help, day or night.' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="p-6"
              >
                <item.icon className="h-7 w-7 text-black mb-4" />
                <h3 className="text-base font-bold text-black mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ VEHICLE LISTINGS ═══════════════ */}
      {showVehicles && (
        <section ref={vehiclesRef} className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 scroll-mt-8">
          {searchActive && (pickupLocation || pickupDate || dropoffLocation || dropoffDate) && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-3 rounded-xl border border-gray-200 bg-gray-50 flex flex-wrap items-center gap-4 text-sm">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span><strong>Pickup:</strong> {pickupLocation || 'Any'}{pickupDate ? ` · ${pickupDate}` : ''}{pickupTime ? ` ${pickupTime}` : ''}</span>
              <span className="text-gray-300">→</span>
              <span><strong>Return:</strong> {dropoffLocation || 'Any'}{dropoffDate ? ` · ${dropoffDate}` : ''}{dropoffTime ? ` ${dropoffTime}` : ''}</span>
              <button onClick={() => { setSearchActive(false); setPickupLocation(''); setPickupDate(''); setPickupTime(''); setDropoffLocation(''); setDropoffDate(''); setDropoffTime(''); }} className="ml-auto text-xs font-medium text-gray-500 hover:text-gray-800 underline">Clear</button>
            </motion.div>
          )}

          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-black tracking-tight">Available vehicles</h2>
              <p className="text-sm text-gray-500 mt-1">Find the perfect vehicle for your journey.</p>
            </div>
            <Button variant="outline" size="sm" className="lg:hidden gap-2 rounded-full" onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}>
              <SlidersHorizontal className="h-4 w-4" /> Filter
              {activeFilterCount > 0 && (
                <span className="ml-1 h-5 w-5 rounded-full text-xs flex items-center justify-center text-white bg-black">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>

          <div className="flex gap-8">
            <VehicleFilterSidebar vehicles={vehicles} filters={filters} onChange={setFilters} buttonColor={buttonColor} className="hidden lg:block w-64 shrink-0 sticky top-20 self-start" />

            {mobileFiltersOpen && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
                <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white p-6 overflow-y-auto shadow-xl">
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-2xl border border-gray-100 overflow-hidden">
                      <Skeleton className="h-48 w-full" />
                      <div className="p-5 space-y-2"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-10 w-full mt-3" /></div>
                    </div>
                  ))}
                </div>
              ) : filteredVehicles.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                  <Car className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">{hasAnyFilter(filters) ? 'No vehicles match your filters.' : 'No vehicles available at the moment.'}</p>
                  {hasAnyFilter(filters) && (
                    <button onClick={() => setFilters(emptyFilters)} className="mt-3 text-sm font-medium underline text-black">Clear all filters</button>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-400 mb-5">{filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? 's' : ''} found</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filteredVehicles.map((vehicle, i) => {
                      const mv = vehicle as MarketplaceVehicle;
                      return (
                        <motion.div key={vehicle.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                          className="rounded-2xl border border-gray-100 bg-white overflow-hidden hover:shadow-lg transition-all duration-300 group relative">
                          {mv.agency_name && !mv.is_own && (
                            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold">
                              {mv.agency_logo_url ? <img src={mv.agency_logo_url} alt="" className="h-4 w-4 rounded-full object-cover" /> : <Briefcase className="h-3 w-3" />}
                              via {mv.agency_name}
                            </div>
                          )}
                          {vehicle.photo_url ? (
                            <div className="bg-gray-50 p-4">
                              <img src={vehicle.photo_url} alt={`${vehicle.brand} ${vehicle.model}`} className="h-40 w-full object-contain transition-transform duration-500 group-hover:scale-105" />
                            </div>
                          ) : (
                            <div className="h-48 flex items-center justify-center bg-gray-50"><Car className="h-12 w-12 text-gray-200" /></div>
                          )}
                          <div className="p-5">
                            <h4 className="font-bold text-sm text-black">{vehicle.brand} {vehicle.model} {vehicle.year}</h4>
                            <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
                              <span className="flex items-center gap-1"><Fuel className="h-3 w-3" /> {vehicle.fuel_type || 'Petrol'}</span>
                              <span className="flex items-center gap-1"><Settings2 className="h-3 w-3" /> {vehicle.transmission || 'Manual'}</span>
                              <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {vehicle.seats || 5}</span>
                            </div>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                              {vehicle.display_price_per_km ? (
                                <p className="text-lg font-bold text-black">{vehicle.display_price_per_km} €<span className="text-xs font-normal text-gray-400"> /km</span></p>
                              ) : vehicle.daily_rate ? (
                                <p className="text-lg font-bold text-black">{vehicle.daily_rate.toLocaleString()} €<span className="text-xs font-normal text-gray-400"> /day</span></p>
                              ) : (
                                <p className="text-sm text-gray-400">Contact</p>
                              )}
                              <Button size="sm" className="rounded-lg text-xs font-bold text-white h-9 px-5 bg-black hover:bg-gray-800"
                                onClick={() => setBookingVehicle(mv)}>
                                {cfg.cta_text || 'Book'}
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  <div className="text-center mt-10">
                    <Link to={`/agency/${slug}/fleet`} className="inline-flex items-center gap-1 text-sm font-semibold text-black hover:underline">
                      View entire fleet <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ TESTIMONIALS ═══════════════ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-black mb-12 tracking-tight text-center">
            {cfg.reviews_title || 'What our customers say'}
          </h2>

          <div className="relative">
            <div className="flex items-center gap-4 justify-center">
              <button onClick={() => setReviewIndex(Math.max(0, reviewIndex - 1))} className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-white transition-colors shrink-0 text-black">
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex gap-4 overflow-hidden max-w-3xl">
                {testimonials.map((t, i) => {
                  const isCenter = i === reviewIndex;
                  return (
                    <motion.div
                      key={i}
                      layout
                      className={`p-6 rounded-2xl border transition-all duration-300 min-w-[240px] flex-1 ${
                        isCenter ? 'bg-white border-gray-200 shadow-md' : 'bg-white/50 border-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-black flex items-center justify-center text-xs font-bold text-white">
                          {t.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-black">{t.name}</p>
                          <div className="flex gap-0.5 mt-0.5">
                            {[...Array(t.rating)].map((_, j) => (
                              <Star key={j} className="h-3 w-3 fill-black text-black" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-gray-500">"{t.text}"</p>
                    </motion.div>
                  );
                })}
              </div>

              <button onClick={() => setReviewIndex(Math.min(testimonials.length - 1, reviewIndex + 1))} className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-white transition-colors shrink-0 text-black">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA ═══════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="rounded-2xl p-12 md:p-16 bg-black text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">Ready to get started?</h2>
            <p className="text-white/40 text-sm max-w-md mx-auto mb-8">
              Book your ride, rental, or transfer in seconds. Professional service guaranteed.
            </p>
            <Link to={`/agency/${slug}/contact`}>
              <button className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-white text-black text-sm font-bold hover:bg-gray-100 transition-colors">
                Get in touch <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Booking Quote Dialog */}
      {bookingVehicle && (
        <BookingQuoteDialog
          vehicle={bookingVehicle}
          open={!!bookingVehicle}
          onOpenChange={(open) => { if (!open) setBookingVehicle(null); }}
          buttonColor={buttonColor}
          numDays={numDays}
          isOneWay={isOneWay}
          oneWayFee={agency.one_way_fee}
        />
      )}
    </div>
  );
};

export default StorefrontHome;
