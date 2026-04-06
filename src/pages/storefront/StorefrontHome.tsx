import { useOutletContext, Link, useParams } from 'react-router-dom';
import { Agency, StorefrontConfig, ServiceType, SERVICE_LABELS } from '@/types/agency';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, Clock, Phone, Shield, Star, ChevronRight, ChevronLeft, Car, Building, SlidersHorizontal, X, Users, Briefcase, Check, Fuel, Settings2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import StorefrontSeo from '@/components/storefront/StorefrontSeo';
import { TemplateStyles } from '@/lib/template-styles';
import defaultHeroImage from '@/assets/hero-chauffeur.jpg';
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
  transfer: Users,
  limo_tour: Briefcase,
  city_tour: Star,
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
  transfer: { icon: Users, items: ['Professional drivers', 'Airport pickup & drop-off', 'Flight tracking', 'Meet & greet service'] },
  limo_tour: { icon: Briefcase, items: ['Professional chauffeurs', 'Hourly & point-to-point', 'Luxury vehicles', 'Airport & event service'] },
  city_tour: { icon: Star, items: ['Half-day & full-day tours', 'Local expert drivers', 'Popular landmarks', 'Flexible schedules'] },
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
    { name: 'Eva Hicks', text: 'Excellent service and well-maintained vehicles. The staff was incredibly helpful throughout the entire rental process.', rating: 5 },
    { name: 'Donald Wolf', text: 'Best car rental experience I\'ve ever had. Will definitely be coming back for our next trip!', rating: 5 },
    { name: 'Sarah Klein', text: 'Great selection of vehicles and transparent pricing. The booking process was seamless.', rating: 4 },
  ];
  const [reviewIndex, setReviewIndex] = useState(0);

  const blogPosts = cfg.blog_posts ?? [
    { title: 'Blog Title', category: 'Category', author: 'Author', excerpt: 'Discover useful tips and insights about car rental, travel, and getting the most from your journey.' },
    { title: 'Blog Title', category: 'Category', author: 'Author', excerpt: 'Discover useful tips and insights about car rental, travel, and getting the most from your journey.' },
    { title: 'Blog Title', category: 'Category', author: 'Author', excerpt: 'Discover useful tips and insights about car rental, travel, and getting the most from your journey.' },
  ];

  return (
    <div>
      <StorefrontSeo
        agency={agency}
        page="home"
        fallbackTitle={agency.meta_title || `${agency.name} | ${agency.city}, ${agency.country}`}
        fallbackDescription={agency.meta_description || `Premium travel services by ${agency.name} in ${agency.city}, ${agency.country}.`}
      />

      {/* ═══════════════ HERO — Full-bleed with centered text + tabs at bottom ═══════════════ */}
      <section className="relative" style={{ minHeight: '480px' }}>
        <img src={cfg.home_hero_image || defaultHeroImage} alt="" className="absolute inset-0 w-full h-full object-cover" width={1920} height={960} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />

        {/* Centered headline */}
        <div className="relative flex flex-col items-center justify-center text-center px-4 pt-20 md:pt-28 pb-32 md:pb-36">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white mb-4 uppercase tracking-wider drop-shadow-lg" style={cfg.hero_text_color ? { color: cfg.hero_text_color } : undefined}>
              {cfg.hero_title || `Mobility Made Easy: Rent a Car Tailored to Your Needs`}
            </h1>
            <p className="text-base md:text-lg text-white/70 max-w-2xl mx-auto" style={cfg.hero_subtitle_color ? { color: cfg.hero_subtitle_color } : undefined}>
              {cfg.hero_subtitle || `Professional car rental, transfers & chauffeur services in ${agency.city}`}
            </p>
          </motion.div>
        </div>

        {/* Service tabs pinned to bottom of hero */}
        {enabledServices.length > 1 && (
          <div className="absolute -bottom-1 left-0 right-0 z-10">
            <div className="max-w-7xl mx-auto px-4 flex items-end">
              {enabledServices.map((service) => {
                const Icon = SERVICE_ICONS[service] ?? Car;
                const isActive = activeService === service;
                return (
                  <button
                    key={service}
                    onClick={() => setActiveService(service)}
                    className={`relative flex items-center gap-2.5 px-6 py-3.5 text-sm font-semibold tracking-wide transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-gray-900 rounded-t-2xl shadow-lg z-10'
                        : 'text-white/70 hover:text-white hover:bg-white/10 rounded-t-xl'
                    }`}
                  >
                    <Icon className={`h-4.5 w-4.5 ${isActive ? '' : 'opacity-70'}`} style={isActive ? { color: buttonColor } : undefined} />
                    <span className="hidden sm:inline">{SERVICE_LABELS[service]}</span>
                    {isActive && <div className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full" style={{ backgroundColor: buttonColor }} />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* ═══════════════ BOOKING FORM SECTION ═══════════════ */}
      <section className="relative z-10 px-4 pb-8" style={{ marginTop: enabledServices.length > 1 ? '0' : '-40px' }}>
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {/* ---- CAR RENTAL (inline card) ---- */}
            {(activeService === 'all' || activeService === 'car_rental') && (
              <motion.div key="vehicle-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 md:p-10">
                  <div className="flex items-center gap-6 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="trip" checked={sameReturn} onChange={() => setSameReturn(true)} className="accent-current" style={{ accentColor: buttonColor }} />
                      <span className="text-sm font-medium text-gray-700">Same return</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="trip" checked={!sameReturn} onChange={() => setSameReturn(false)} className="accent-current" style={{ accentColor: buttonColor }} />
                      <span className="text-sm font-medium text-gray-700">Different return</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1"><MapPin className="h-3 w-3" /> Pickup</span>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1">
                          <label className="text-[10px] text-gray-400 block mb-0.5">Location</label>
                          <div className="border border-gray-200 rounded-lg p-2">
                            <LocationAutocomplete value={pickupLocation} onChange={setPickupLocation} placeholder="City" locations={agencyLocations} agencyCity={agency.city} />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400 block mb-0.5">Date</label>
                          <div className="border border-gray-200 rounded-lg p-2">
                            <input type="date" value={pickupDate} min={todayStr} onChange={(e) => handlePickupDateChange(e.target.value)} className="w-full bg-transparent text-sm text-gray-900 focus:outline-none" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400 block mb-0.5">Time</label>
                          <div className="border border-gray-200 rounded-lg p-2">
                            <input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className="w-full bg-transparent text-sm text-gray-900 focus:outline-none" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1"><MapPin className="h-3 w-3" /> Return</span>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1">
                          <label className="text-[10px] text-gray-400 block mb-0.5">Location</label>
                          <div className={`border border-gray-200 rounded-lg p-2 ${sameReturn ? 'opacity-40' : ''}`}>
                            <LocationAutocomplete
                              value={sameReturn ? pickupLocation : dropoffLocation}
                              onChange={(val) => { if (!sameReturn) setDropoffLocation(val); }}
                              placeholder={sameReturn ? 'Same' : 'City'}
                              locations={agencyLocations}
                              agencyCity={agency.city}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400 block mb-0.5">Date</label>
                          <div className="border border-gray-200 rounded-lg p-2">
                            <input type="date" value={dropoffDate} onChange={(e) => handleDropoffDateChange(e.target.value)} min={minReturnDate} className="w-full bg-transparent text-sm text-gray-900 focus:outline-none" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400 block mb-0.5">Time</label>
                          <div className="border border-gray-200 rounded-lg p-2">
                            <input type="time" value={dropoffTime} onChange={(e) => setDropoffTime(e.target.value)} className="w-full bg-transparent text-sm text-gray-900 focus:outline-none" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button className="h-11 px-8 rounded-lg font-bold gap-2 text-white text-sm shadow-lg" style={{ backgroundColor: buttonColor }}
                      onClick={() => { setSearchActive(true); vehiclesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
                      <Search className="h-4 w-4" /> Search
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ---- TRANSFER (own card) ---- */}
            {activeService === 'transfer' && (
              <motion.div key="transfer-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <TransferBookingForm agency={agency} config={cfg} buttonColor={buttonColor} />
              </motion.div>
            )}

            {/* ---- LIMO SERVICE (own card) ---- */}
            {activeService === 'limo_tour' && (
              <motion.div key="limo-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <LimoBookingForm agency={agency} config={cfg} buttonColor={buttonColor} />
              </motion.div>
            )}

            {/* ---- CITY TOUR (inline card) ---- */}
            {activeService === 'city_tour' && (
              <motion.div key="city-tour-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 md:p-10">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Book a City Tour</h3>
                    <p className="text-sm text-gray-500 mt-1">Guided tours with local expert drivers</p>
                  </div>
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-gray-400 block mb-0.5">City</label>
                        <div className="border border-gray-200 rounded-lg p-2">
                          <LocationAutocomplete value={pickupLocation} onChange={setPickupLocation} placeholder={`e.g. ${agency.city}`} locations={agencyLocations} agencyCity={agency.city} />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 block mb-0.5">Date</label>
                        <div className="border border-gray-200 rounded-lg p-2">
                          <input type="date" value={pickupDate} min={todayStr} onChange={(e) => handlePickupDateChange(e.target.value)} className="w-full bg-transparent text-sm text-gray-900 focus:outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 block mb-0.5">Duration</label>
                        <div className="border border-gray-200 rounded-lg p-2">
                          <select className="w-full bg-transparent text-sm text-gray-900 focus:outline-none appearance-none">
                            <option value="8">Full day (8h)</option>
                            <option value="12">Extended (12h)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <Button className="h-11 px-8 rounded-lg font-bold gap-2 text-white text-sm shadow-lg" style={{ backgroundColor: buttonColor }}
                      onClick={() => setSearchActive(true)}>
                      <Search className="h-4 w-4" /> Find tours
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ---- APARTMENT (inline card) ---- */}
            {activeService === 'apartment' && (
              <motion.div key="apartment-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 md:p-10">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Find an Apartment</h3>
                    <p className="text-sm text-gray-500 mt-1">Furnished apartments for short & long stays</p>
                  </div>
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-gray-400 block mb-0.5">Location</label>
                        <div className="border border-gray-200 rounded-lg p-2">
                          <LocationAutocomplete value={pickupLocation} onChange={setPickupLocation} placeholder="Neighborhood" locations={agencyLocations} agencyCity={agency.city} />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 block mb-0.5">Check-in</label>
                        <div className="border border-gray-200 rounded-lg p-2">
                          <input type="date" value={pickupDate} min={todayStr} onChange={(e) => handlePickupDateChange(e.target.value)} className="w-full bg-transparent text-sm text-gray-900 focus:outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 block mb-0.5">Check-out</label>
                        <div className="border border-gray-200 rounded-lg p-2">
                          <input type="date" value={dropoffDate} onChange={(e) => handleDropoffDateChange(e.target.value)} min={minReturnDate} className="w-full bg-transparent text-sm text-gray-900 focus:outline-none" />
                        </div>
                      </div>
                    </div>
                    <Button className="h-11 px-8 rounded-lg font-bold gap-2 text-white text-sm shadow-lg" style={{ backgroundColor: buttonColor }}
                      onClick={() => { setSearchActive(true); vehiclesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
                      <Search className="h-4 w-4" /> Search
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ═══════════════ WHY CHOOSE US ═══════════════ */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-900" style={cfg.heading_color ? { color: cfg.heading_color } : undefined}>
          Why Choose Us
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { icon: Phone, title: 'Customer Support', desc: 'Our dedicated team is available around the clock to assist you with any questions or needs.' },
            { icon: Shield, title: 'Best Price Guarantee', desc: 'We guarantee the best prices on all our vehicles with full transparency — no hidden fees.' },
            { icon: MapPin, title: 'Many Locations', desc: 'Pick up and drop off at convenient locations across the region with flexible options.' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex flex-col items-center text-center">
              <div className="h-16 w-16 rounded-full border-2 border-gray-200 flex items-center justify-center mb-5">
                <item.icon className="h-7 w-7" style={{ color: buttonColor }} />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════ FEATURED VEHICLE — Dark banner ═══════════════ */}
      {showVehicles && vehicles.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-8">
          <div className="rounded-2xl overflow-hidden bg-gray-900 relative">
            <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-white">
                <span className="text-xs uppercase tracking-[0.2em] font-semibold text-gray-400">Best Offer</span>
                <h3 className="text-2xl md:text-3xl font-bold mt-2 mb-1">
                  {vehicles[0].brand} {vehicles[0].model} {vehicles[0].year}
                </h3>
                {vehicles[0].display_price_per_km ? (
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-bold" style={{ color: buttonColor }}>{vehicles[0].display_price_per_km} €/km</span>
                  </div>
                ) : vehicles[0].daily_rate ? (
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-2xl font-bold" style={{ color: buttonColor }}>{vehicles[0].daily_rate.toLocaleString()} €/day</span>
                  </div>
                ) : null}
                <div className="flex items-center gap-1 mt-3">
                  {[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center">
                {vehicles[0].photo_url ? (
                  <img src={vehicles[0].photo_url} alt={`${vehicles[0].brand} ${vehicles[0].model}`} className="w-80 h-48 rounded-xl object-cover" />
                ) : (
                  <div className="w-80 h-48 rounded-xl flex items-center justify-center bg-white/5">
                    <Car className="h-24 w-24 opacity-20 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ VEHICLE LISTINGS — Majestic-style cards ═══════════════ */}
      {showVehicles && (
        <section ref={vehiclesRef} className="max-w-6xl mx-auto px-4 pb-20 scroll-mt-8">
          {searchActive && (pickupLocation || pickupDate || dropoffLocation || dropoffDate) && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-wrap items-center gap-4 text-sm">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span><strong>Pickup:</strong> {pickupLocation || 'Any'}{pickupDate ? ` · ${pickupDate}` : ''}{pickupTime ? ` ${pickupTime}` : ''}</span>
              <span className="text-gray-300">→</span>
              <span><strong>Return:</strong> {dropoffLocation || 'Any'}{dropoffDate ? ` · ${dropoffDate}` : ''}{dropoffTime ? ` ${dropoffTime}` : ''}</span>
              <button onClick={() => { setSearchActive(false); setPickupLocation(''); setPickupDate(''); setPickupTime(''); setDropoffLocation(''); setDropoffDate(''); setDropoffTime(''); }} className="ml-auto text-xs font-medium text-gray-500 hover:text-gray-800 underline">Clear</button>
            </motion.div>
          )}

          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900" style={cfg.heading_color ? { color: cfg.heading_color } : undefined}>Best Deals & Offers</h2>
              <p className="text-sm text-gray-500 mt-1">Find the perfect car for your journey with competitive prices.</p>
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

          <div className="flex gap-8">
            <VehicleFilterSidebar vehicles={vehicles} filters={filters} onChange={setFilters} buttonColor={buttonColor} className="hidden lg:block w-64 shrink-0 sticky top-4 self-start" />

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
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-xl border border-gray-100 overflow-hidden">
                      <Skeleton className="h-40 w-full" />
                      <div className="p-4 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-10 w-full mt-3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredVehicles.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Car className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">{hasAnyFilter(filters) ? 'No vehicles match your filters.' : 'No vehicles available at the moment.'}</p>
                  {hasAnyFilter(filters) && (
                    <button onClick={() => setFilters(emptyFilters)} className="mt-3 text-sm font-medium underline" style={{ color: buttonColor }}>Clear all filters</button>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-400 mb-4">{filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? 's' : ''} found</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                    {filteredVehicles.map((vehicle, i) => {
                      const mv = vehicle as MarketplaceVehicle;
                      return (
                        <motion.div key={vehicle.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                          className="rounded-xl border border-gray-100 bg-white overflow-hidden hover:shadow-lg transition-shadow group relative">
                          {mv.agency_name && !mv.is_own && (
                            <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-[10px] font-semibold">
                              {mv.agency_logo_url ? (
                                <img src={mv.agency_logo_url} alt="" className="h-4 w-4 rounded-full object-cover" />
                              ) : (
                                <Briefcase className="h-3 w-3" />
                              )}
                              via {mv.agency_name}
                            </div>
                          )}
                          {vehicle.photo_url ? (
                            <img src={vehicle.photo_url} alt={`${vehicle.brand} ${vehicle.model}`} className="h-40 w-full object-cover" />
                          ) : (
                            <div className="h-40 flex items-center justify-center bg-gray-50">
                              <Car className="h-12 w-12 text-gray-200" />
                            </div>
                          )}
                          <div className="p-4">
                            <h4 className="font-bold text-sm text-gray-900">{vehicle.brand} {vehicle.model} {vehicle.year}</h4>
                            {/* Specs row */}
                            <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-400">
                              <span className="flex items-center gap-1"><Fuel className="h-3 w-3" /> {vehicle.fuel_type || 'Petrol'}</span>
                              <span className="flex items-center gap-1"><Settings2 className="h-3 w-3" /> {vehicle.transmission || 'Manual'}</span>
                              <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {vehicle.seats || 5}</span>
                            </div>
                            {/* Rating */}
                            <div className="flex items-center gap-1 mt-2">
                              {[...Array(5)].map((_, j) => <Star key={j} className="h-3 w-3 fill-yellow-400 text-yellow-400" />)}
                              <span className="text-[10px] text-gray-400 ml-1">(450+)</span>
                            </div>
                            {/* Price */}
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                              {vehicle.display_price_per_km ? (
                                <p className="text-base font-bold text-gray-900">{vehicle.display_price_per_km} €<span className="text-xs font-normal text-gray-400"> /km</span></p>
                              ) : vehicle.daily_rate ? (
                                <p className="text-base font-bold text-gray-900">{vehicle.daily_rate.toLocaleString()} €<span className="text-xs font-normal text-gray-400"> /day</span></p>
                              ) : (
                                <p className="text-sm text-gray-400">Contact</p>
                              )}
                              <Button size="sm" className="rounded-lg text-xs font-bold text-white h-8 px-4" style={{ backgroundColor: buttonColor }}
                                onClick={() => setBookingVehicle(mv)}>
                                {cfg.cta_text || 'Book Now'}
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  <div className="text-center mt-8">
                    <Link to={`/agency/${slug}/fleet`} className="text-sm font-medium hover:underline" style={{ color: buttonColor }}>
                      Show more vehicles →
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════ OUR SERVICES ═══════════════ */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-3" style={cfg.heading_color ? { color: cfg.heading_color } : undefined}>Our Services</h2>
          <p className="text-center text-sm text-gray-500 mb-14 max-w-lg mx-auto">Everything you need for seamless travel, all in one place</p>

          <div className="space-y-16">
            {enabledServices.map((service, i) => {
              const Icon = SERVICE_ICONS[service] ?? Car;
              const label = SERVICE_LABELS[service] ?? service;
              const desc = SERVICE_SHORT_DESC[service];
              const image = SERVICE_IMAGES[service];
              const features = SERVICE_FEATURES[service]?.items ?? [];
              const isReversed = i % 2 !== 0;

              return (
                <motion.div
                  key={service}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className={`flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 items-center`}
                >
                  {/* Image side */}
                  <Link to={`/agency/${slug}/services/${service}`} className="w-full md:w-1/2 group">
                    <div className="relative rounded-2xl overflow-hidden shadow-lg">
                      <img src={image} alt={label} className="w-full h-64 md:h-72 object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" width={960} height={640} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>
                  </Link>

                  {/* Text side */}
                  <div className="w-full md:w-1/2 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${buttonColor}15` }}>
                        <Icon className="h-5 w-5" style={{ color: buttonColor }} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{label}</h3>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                    <ul className="space-y-2">
                      {features.map((feat, j) => (
                        <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                          <Check className="h-4 w-4 shrink-0" style={{ color: buttonColor }} />
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <Link to={`/agency/${slug}/services/${service}`} className="inline-flex items-center gap-1.5 text-sm font-semibold mt-2 hover:gap-2.5 transition-all" style={{ color: buttonColor }}>
                      Learn more <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>



      {/* ═══════════════ BLOG ═══════════════ */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3 text-gray-900" style={cfg.heading_color ? { color: cfg.heading_color } : undefined}>{cfg.blog_title || 'Blog'}</h2>
          <p className="text-center text-sm text-gray-500 mb-10 max-w-lg mx-auto">
            {cfg.blog_subtitle || 'Discover the latest news and useful articles about car rental and travel tips'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogPosts.map((post, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-200" />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-900 uppercase">{post.title}</span>
                    <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{post.category}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mb-3">{post.author} · a min ago</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{post.excerpt}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button className="text-sm font-medium hover:underline" style={{ color: buttonColor }}>More →</button>
          </div>
        </div>
      </section>

      {/* ═══════════════ TESTIMONIALS — Carousel style ═══════════════ */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-3 text-gray-900" style={cfg.heading_color ? { color: cfg.heading_color } : undefined}>
          {cfg.reviews_title || 'Trusted by Thousands of Happy Customers'}
        </h2>
        <p className="text-center text-sm text-gray-500 mb-12 max-w-lg mx-auto">
          {cfg.reviews_subtitle || "Our customers' opinions help us improve your experience and offer the best services"}
        </p>

        <h3 className="text-lg font-bold text-center mb-8 text-gray-900">Reviews</h3>

        <div className="relative">
          <div className="flex items-center gap-4 justify-center">
            <button onClick={() => setReviewIndex(Math.max(0, reviewIndex - 1))} className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shrink-0" style={{ color: buttonColor }}>
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex gap-4 overflow-hidden max-w-4xl">
              {testimonials.map((t, i) => {
                const isCenter = i === reviewIndex;
                return (
                  <motion.div
                    key={i}
                    layout
                    className={`p-6 rounded-2xl border transition-all duration-300 min-w-[260px] flex-1 ${
                      isCenter
                        ? 'bg-gray-900 text-white border-gray-800 scale-105 shadow-xl'
                        : 'bg-white text-gray-700 border-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold ${isCenter ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                        {t.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${isCenter ? 'text-white' : 'text-gray-900'}`}>{t.name}</p>
                        <div className="flex gap-0.5 mt-0.5">
                          {[...Array(t.rating)].map((_, j) => (
                            <Star key={j} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className={`text-sm leading-relaxed ${isCenter ? 'text-white/80' : 'text-gray-500'}`}>{t.text}</p>
                  </motion.div>
                );
              })}
            </div>

            <button onClick={() => setReviewIndex(Math.min(testimonials.length - 1, reviewIndex + 1))} className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shrink-0" style={{ color: buttonColor }}>
              <ChevronRight className="h-5 w-5" />
            </button>
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
