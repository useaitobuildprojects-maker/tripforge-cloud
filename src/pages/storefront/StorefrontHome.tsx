import { useOutletContext, Link, useParams } from 'react-router-dom';
import { Agency, StorefrontConfig, ServiceType, SERVICE_LABELS } from '@/types/agency';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, Clock, Phone, Shield, Star, ChevronRight, ChevronLeft, Car, Building, SlidersHorizontal, X, Users, Briefcase, Check, Fuel, Settings2, Play, ArrowRight, Plane, Train, Bus, Navigation, Globe, Award, Heart } from 'lucide-react';

import { Button } from '@/components/ui/button';
import StorefrontSeo from '@/components/storefront/StorefrontSeo';
import { TemplateStyles } from '@/lib/template-styles';
import defaultHeroImage from '@/assets/hero-desert.jpg';
import serviceTransfer from '@/assets/service-transfer.jpg';
import serviceLimo from '@/assets/service-limo.jpg';
import serviceRental from '@/assets/service-rental.jpg';
import serviceApartment from '@/assets/service-apartment.jpg';
import serviceCityTour from '@/assets/service-city-tour.jpg';
import destTemple from '@/assets/dest-temple.jpg';
import destPalace from '@/assets/dest-palace.jpg';
import destMonument from '@/assets/dest-monument.jpg';
import adventureMountain from '@/assets/adventure-mountain.jpg';
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

const SERVICE_FEATURES: Record<ServiceType, { icon: React.ElementType; items: string[] }> = {
  car_rental: { icon: Car, items: ['Free cancellation up to 24h', 'Unlimited mileage options', 'Full insurance included', 'Airport pickup available'] },
  apartment: { icon: Building, items: ['Fully furnished', 'Weekly & monthly rates', 'Central locations', 'Self check-in'] },
  transfer: { icon: Navigation, items: ['Professional drivers', 'Airport pickup & drop-off', 'Flight tracking', 'Meet & greet service'] },
  limo_tour: { icon: Briefcase, items: ['Professional chauffeurs', 'Hourly & point-to-point', 'Luxury vehicles', 'Airport & event service'] },
  city_tour: { icon: Globe, items: ['Half-day & full-day tours', 'Local expert drivers', 'Popular landmarks', 'Flexible schedules'] },
};

const SERVICE_IMAGES: Record<ServiceType, string> = {
  transfer: serviceTransfer,
  limo_tour: serviceLimo,
  car_rental: serviceRental,
  apartment: serviceApartment,
  city_tour: serviceCityTour,
};

const DESTINATIONS = [
  { name: 'Ancient Temple Ruins', location: 'Egypt, North Africa', rating: 5.5, price: 456.80, image: destTemple, features: ['Including Accommodation', 'Free Professional Guide Tour', '3 Days 2 Nights Trip'] },
  { name: 'Royal Palace Tour', location: 'Vienna, Europe', rating: 5.6, price: 456.80, image: destPalace, features: ['Including Accommodation', 'Free Professional Guide Tour', '3 Days 2 Nights Trip'] },
  { name: 'Gothic Cathedral Visit', location: 'Germany, Europe', rating: 5.8, price: 456.80, image: destMonument, features: ['Including Accommodation', 'Free Professional Guide Tour', '3 Days 2 Nights Trip'] },
];

const serifFont = { fontFamily: "'Georgia', 'Times New Roman', serif" };

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
    { name: 'Eva Hicks', text: 'Excellent service and well-maintained vehicles. The staff was incredibly helpful throughout the entire rental process.', rating: 5 },
    { name: 'Donald Wolf', text: 'Best car rental experience I\'ve ever had. Will definitely be coming back for our next trip!', rating: 5 },
    { name: 'Sarah Klein', text: 'Great selection of vehicles and transparent pricing. The booking process was seamless.', rating: 4 },
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

      {/* ═══════════════ HERO — Split layout like WayFarer ═══════════════ */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-0">
          {/* Top: heading + description */}
          <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex-1 max-w-xl">
              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-[1.1] text-gray-900 tracking-tight" style={serifFont}>
                {cfg.hero_title || (
                  <>Your Next<br />Adventure Awaits</>
                )}
              </h1>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="flex-1 max-w-sm pt-2">
              <p className="text-sm text-gray-500 leading-relaxed mb-5">
                {cfg.hero_subtitle || `Explore stunning destinations, unique experiences, and unforgettable journeys with ${agency.name}.`}
              </p>
              <button
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: buttonColor }}
              >
                Booking
              </button>
            </motion.div>
          </div>

          {/* Hero image — wide landscape with rounded corners */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="relative rounded-3xl overflow-hidden"
            style={{ height: '420px' }}
          >
            <img src={cfg.home_hero_image || defaultHeroImage} alt="" className="w-full h-full object-cover" width={1920} height={1080} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          </motion.div>

          {/* Booking bar — overlapping hero bottom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="relative z-10 -mt-10 mx-4 md:mx-10"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 md:p-5 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2.5 flex-1 min-w-[150px]">
                <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 font-medium">Location</p>
                  <div className="text-sm text-gray-900">
                    <LocationAutocomplete value={pickupLocation} onChange={setPickupLocation} placeholder={agency.city} locations={agencyLocations} agencyCity={agency.city} />
                  </div>
                </div>
              </div>
              <div className="w-px h-8 bg-gray-200 hidden md:block" />
              <div className="flex items-center gap-2.5 flex-1 min-w-[140px]">
                <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 font-medium">Check In</p>
                  <input type="date" value={pickupDate} min={todayStr} onChange={(e) => handlePickupDateChange(e.target.value)} className="text-sm text-gray-900 bg-transparent focus:outline-none w-full" />
                </div>
              </div>
              <div className="w-px h-8 bg-gray-200 hidden md:block" />
              <div className="flex items-center gap-2.5 flex-1 min-w-[140px]">
                <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 font-medium">Check Out</p>
                  <input type="date" value={dropoffDate} min={minReturnDate} onChange={(e) => handleDropoffDateChange(e.target.value)} className="text-sm text-gray-900 bg-transparent focus:outline-none w-full" />
                </div>
              </div>
              <div className="w-px h-8 bg-gray-200 hidden md:block" />
              <div className="flex items-center gap-2.5 flex-1 min-w-[120px]">
                <Users className="h-4 w-4 text-gray-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-400 font-medium">People</p>
                  <p className="text-sm text-gray-900">2 Adults</p>
                </div>
              </div>
              <button
                className="h-11 w-11 rounded-full flex items-center justify-center text-white shrink-0 hover:opacity-90 transition-opacity shadow-lg"
                style={{ backgroundColor: buttonColor }}
                onClick={() => { setSearchActive(true); vehiclesRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ TOUR PACKAGES ═══════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">Tour Packages</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight" style={serifFont}>
                Explore Our Exclusive<br />Tour Packages
              </h2>
            </div>
            <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
              Find your perfect getaway with our curated tour packages. Adventure, relaxation or culture — it's all here for you!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DESTINATIONS.map((dest, i) => (
              <motion.div
                key={dest.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className={`group rounded-3xl overflow-hidden bg-white border border-gray-100 ${i === 0 ? 'shadow-xl ring-1 ring-gray-100' : 'hover:shadow-xl transition-shadow'}`}
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <img src={dest.image} alt={dest.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" width={800} height={1024} />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-bold text-gray-900 shadow-sm"
                      style={{ color: buttonColor }}
                    >
                      {dest.location.split(',')[0]}
                    </span>
                  </div>
                  {i !== 0 && (
                    <div className="absolute top-3 right-3">
                      <div className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm" style={{ color: buttonColor }}>
                        <ArrowRight className="h-4 w-4 -rotate-45" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-gray-900">{dest.name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-bold text-gray-900">{dest.rating}</span>
                    </div>
                  </div>
                  <p className="text-lg font-bold mb-3" style={{ color: buttonColor }}>${dest.price.toFixed(2)}</p>

                  {i === 0 && (
                    <>
                      <div className="space-y-1.5 mb-4">
                        {dest.features.map((feat, j) => (
                          <div key={j} className="flex items-center gap-2 text-xs text-gray-500">
                            <Check className="h-3 w-3 shrink-0" style={{ color: buttonColor }} />
                            {feat}
                          </div>
                        ))}
                      </div>
                      <button
                        className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                        style={{ backgroundColor: buttonColor }}
                      >
                        Booking
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ EVERY STEP + TRANSPORT ═══════════════ */}
      <section className="py-24 bg-gray-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left — Every Step of the Way */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900" style={serifFont}>Every Step of the Way</h3>
                  <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: buttonColor }}>
                    <ArrowRight className="h-4 w-4 text-white -rotate-45" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed mb-5">
                  Travel with ease and comfort. From private transfers to group tours, we ensure seamless transportation throughout your journey.
                </p>
                <div className="rounded-2xl overflow-hidden h-56">
                  <img src={adventureMountain} alt="Travel" className="w-full h-full object-cover" loading="lazy" width={1920} height={900} />
                </div>
              </div>
            </motion.div>

            {/* Right — Effortless Travel (Transport modes) */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="text-xs text-gray-400 font-medium mb-1">Transport</p>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8" style={serifFont}>Effortless Travel</h3>

              <div className="space-y-5">
                {enabledServices.length > 0 ? enabledServices.map((service, i) => {
                  const Icon = SERVICE_ICONS[service] ?? Car;
                  const label = SERVICE_LABELS[service] ?? service;
                  const desc = SERVICE_SHORT_DESC[service];
                  return (
                    <Link to={`/agency/${slug}/services/${service}`} key={service} className="flex items-start gap-4 group">
                      <div
                        className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-all ${i === 0 ? 'text-white shadow-lg' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}`}
                        style={i === 0 ? { backgroundColor: buttonColor } : undefined}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-0.5">{label}</h4>
                        <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
                      </div>
                    </Link>
                  );
                }) : (
                  [
                    { icon: Plane, label: 'Plane', desc: 'We provide flights with schedules according to the Airport or can be customized.' },
                    { icon: Train, label: 'Train', desc: 'We provide train travel with a schedule according to the Station or can be customized.' },
                    { icon: Bus, label: 'Bus', desc: 'We provide Bus Trips with a schedule according to the Bus Stop or can be customized.' },
                    { icon: Navigation, label: 'Local Transportation', desc: 'We provide local vehicle trips with schedules according to the application or can be customized.' },
                  ].map((item, i) => (
                    <div key={item.label} className="flex items-start gap-4">
                      <div
                        className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${i === 0 ? 'text-white shadow-lg' : 'bg-gray-100 text-gray-500'}`}
                        style={i === 0 ? { backgroundColor: buttonColor } : undefined}
                      >
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-0.5">{item.label}</h4>
                        <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════ VEHICLE LISTINGS ═══════════════ */}
      {showVehicles && (
        <section ref={vehiclesRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 scroll-mt-8">
          {searchActive && (pickupLocation || pickupDate || dropoffLocation || dropoffDate) && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-3 rounded-xl border border-gray-200 bg-gray-50 flex flex-wrap items-center gap-4 text-sm">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span><strong>Pickup:</strong> {pickupLocation || 'Any'}{pickupDate ? ` · ${pickupDate}` : ''}{pickupTime ? ` ${pickupTime}` : ''}</span>
              <span className="text-gray-300">→</span>
              <span><strong>Return:</strong> {dropoffLocation || 'Any'}{dropoffDate ? ` · ${dropoffDate}` : ''}{dropoffTime ? ` ${dropoffTime}` : ''}</span>
              <button onClick={() => { setSearchActive(false); setPickupLocation(''); setPickupDate(''); setPickupTime(''); setDropoffLocation(''); setDropoffDate(''); setDropoffTime(''); }} className="ml-auto text-xs font-medium text-gray-500 hover:text-gray-800 underline">Clear</button>
            </motion.div>
          )}

          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-xs text-gray-400 font-medium mb-1">Our Fleet</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ ...serifFont, ...(cfg.heading_color ? { color: cfg.heading_color } : {}) }}>Best Deals & Offers</h2>
              <p className="text-sm text-gray-400 mt-1.5">Find the perfect vehicle for your journey.</p>
            </div>
            <Button variant="outline" size="sm" className="lg:hidden gap-2 rounded-full" onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}>
              <SlidersHorizontal className="h-4 w-4" /> Filter
              {activeFilterCount > 0 && (
                <span className="ml-1 h-5 w-5 rounded-full text-xs flex items-center justify-center text-white" style={{ backgroundColor: buttonColor }}>
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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                    <button onClick={() => setFilters(emptyFilters)} className="mt-3 text-sm font-medium underline" style={{ color: buttonColor }}>Clear all filters</button>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-400 mb-5">{filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? 's' : ''} found</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredVehicles.map((vehicle, i) => {
                      const mv = vehicle as MarketplaceVehicle;
                      return (
                        <motion.div key={vehicle.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                          className="rounded-2xl border border-gray-100 bg-white overflow-hidden hover:shadow-xl transition-all duration-300 group relative">
                          {mv.agency_name && !mv.is_own && (
                            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold">
                              {mv.agency_logo_url ? <img src={mv.agency_logo_url} alt="" className="h-4 w-4 rounded-full object-cover" /> : <Briefcase className="h-3 w-3" />}
                              via {mv.agency_name}
                            </div>
                          )}
                          {vehicle.photo_url ? (
                            <img src={vehicle.photo_url} alt={`${vehicle.brand} ${vehicle.model}`} className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                            <div className="h-48 flex items-center justify-center bg-gray-50"><Car className="h-12 w-12 text-gray-200" /></div>
                          )}
                          <div className="p-5">
                            <h4 className="font-bold text-sm text-gray-900">{vehicle.brand} {vehicle.model} {vehicle.year}</h4>
                            <div className="flex items-center gap-3 mt-2.5 text-[11px] text-gray-400">
                              <span className="flex items-center gap-1"><Fuel className="h-3 w-3" /> {vehicle.fuel_type || 'Petrol'}</span>
                              <span className="flex items-center gap-1"><Settings2 className="h-3 w-3" /> {vehicle.transmission || 'Manual'}</span>
                              <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {vehicle.seats || 5}</span>
                            </div>
                            <div className="flex items-center gap-1 mt-2.5">
                              {[...Array(5)].map((_, j) => <Star key={j} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
                              <span className="text-[10px] text-gray-400 ml-1">(450+)</span>
                            </div>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                              {vehicle.display_price_per_km ? (
                                <p className="text-lg font-bold" style={{ color: buttonColor }}>{vehicle.display_price_per_km} €<span className="text-xs font-normal text-gray-400"> /km</span></p>
                              ) : vehicle.daily_rate ? (
                                <p className="text-lg font-bold" style={{ color: buttonColor }}>{vehicle.daily_rate.toLocaleString()} €<span className="text-xs font-normal text-gray-400"> /day</span></p>
                              ) : (
                                <p className="text-sm text-gray-400">Contact</p>
                              )}
                              <Button size="sm" className="rounded-xl text-xs font-bold text-white h-9 px-5" style={{ backgroundColor: buttonColor }}
                                onClick={() => setBookingVehicle(mv)}>
                                {cfg.cta_text || 'Book Now'}
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  <div className="text-center mt-10">
                    <Link to={`/agency/${slug}/fleet`} className="inline-flex items-center gap-1 text-sm font-semibold hover:gap-2 transition-all" style={{ color: buttonColor }}>
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
      <section className="py-24 bg-gray-50/70">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-xs text-gray-400 font-medium text-center mb-1">Testimonials</p>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-14 text-gray-900" style={serifFont}>
            {cfg.reviews_title || 'What Our Customers Say'}
          </h2>

          <div className="relative">
            <div className="flex items-center gap-4 justify-center">
              <button onClick={() => setReviewIndex(Math.max(0, reviewIndex - 1))} className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-white transition-colors shrink-0" style={{ color: buttonColor }}>
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex gap-5 overflow-hidden max-w-3xl">
                {testimonials.map((t, i) => {
                  const isCenter = i === reviewIndex;
                  return (
                    <motion.div
                      key={i}
                      layout
                      className={`p-6 rounded-2xl border transition-all duration-300 min-w-[240px] flex-1 ${
                        isCenter ? 'bg-white text-gray-900 border-gray-200 shadow-lg' : 'bg-white/50 text-gray-700 border-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-11 w-11 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: buttonColor }}>
                          {t.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                          <div className="flex gap-0.5 mt-0.5">
                            {[...Array(t.rating)].map((_, j) => (
                              <Star key={j} className="h-3 w-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed text-gray-500">"{t.text}"</p>
                    </motion.div>
                  );
                })}
              </div>

              <button onClick={() => setReviewIndex(Math.min(testimonials.length - 1, reviewIndex + 1))} className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-white transition-colors shrink-0" style={{ color: buttonColor }}>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA ═══════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="rounded-3xl p-12 md:p-16 text-white relative overflow-hidden" style={{ backgroundColor: buttonColor }}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px), radial-gradient(circle at 70% 50%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-bold mb-3" style={serifFont}>Let's Turn Your Dream Into Reality!</h2>
              <p className="text-white/60 text-sm max-w-md mx-auto mb-6">
                Ready for your next adventure? Let us handle the details while you enjoy the journey.
              </p>
              <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-sm font-bold hover:bg-gray-100 transition-colors" style={{ color: buttonColor }}>
                Contact Us <ArrowRight className="h-4 w-4" />
              </button>
            </div>
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
