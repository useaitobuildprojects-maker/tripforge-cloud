import { useOutletContext, Link, useParams } from 'react-router-dom';
import { Agency, StorefrontConfig, ServiceType, SERVICE_LABELS } from '@/types/agency';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, Clock, Phone, Shield, Star, ChevronRight, Car, UserCheck, Crown, Building, Truck, SlidersHorizontal, X, Users, Briefcase, Plane, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StorefrontSeo from '@/components/storefront/StorefrontSeo';
import { TemplateStyles } from '@/lib/template-styles';
import { useMarketplaceVehicles, MarketplaceVehicle } from '@/hooks/use-marketplace-vehicles';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useMemo, useRef } from 'react';
import VehicleFilterSidebar, { VehicleFilters, emptyFilters, hasAnyFilter, countActiveFilters, applyFilters } from '@/components/storefront/VehicleFilterSidebar';
import LocationAutocomplete, { getAgencyLocations } from '@/components/storefront/LocationAutocomplete';

const SERVICE_ICONS: Record<ServiceType, React.ElementType> = {
  car_rental: Car,
  apartment: Building,
};

const SERVICE_SHORT_DESC: Record<ServiceType, string> = {
  car_rental: 'Wide selection of quality vehicles for every need.',
  apartment: 'Furnished apartments for comfortable stays.',
};

const SERVICE_FEATURES: Record<ServiceType, { icon: React.ElementType; items: string[] }> = {
  car_rental: { icon: Car, items: ['Free cancellation up to 24h', 'Unlimited mileage options', 'Full insurance included', 'Airport pickup available'] },
  apartment: { icon: Building, items: ['Fully furnished', 'Weekly & monthly rates', 'Central locations', 'Self check-in'] },
};

const StorefrontHome = () => {
  const { slug } = useParams();
  const { agency, templateStyles: ts, buttonColor, config: cfg } = useOutletContext<{ agency: Agency; templateStyles: TemplateStyles; buttonColor: string; config: StorefrontConfig }>();

  const enabledServices = agency.services ?? [];
  const { data: vehicles = [], isLoading: vehiclesLoading } = useMarketplaceVehicles(agency.id, agency.commission_rate);

  // Active service tab
  const [activeService, setActiveService] = useState<ServiceType | 'all'>('all');

  // Search state
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

  // Filter state
  const [filters, setFilters] = useState<VehicleFilters>(emptyFilters);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const filteredVehicles = useMemo(() => applyFilters(vehicles, filters), [vehicles, filters]);
  const activeFilterCount = countActiveFilters(filters);

  // Show vehicles section only for car-related services
  const vehicleServices: ServiceType[] = ['car_rental'];
  const showVehicles = activeService === 'all' || vehicleServices.includes(activeService);

  const testimonials = [
    { name: 'Eva Hicks', text: 'Excellent service and well-maintained vehicles. The staff was incredibly helpful throughout the entire rental process.', rating: 5 },
    { name: 'Donald Wolf', text: 'Best car rental experience I\'ve ever had. Will definitely be coming back for our next trip!', rating: 5 },
    { name: 'Sarah Klein', text: 'Great selection of vehicles and transparent pricing. The booking process was seamless.', rating: 4 },
  ];

  return (
    <div>
      <StorefrontSeo
        agency={agency}
        page="home"
        fallbackTitle={agency.meta_title || `${agency.name} | ${agency.city}, ${agency.country}`}
        fallbackDescription={agency.meta_description || `Premium travel services by ${agency.name} in ${agency.city}, ${agency.country}.`}
      />

      {/* Hero Section */}
      <section className={`relative overflow-hidden ${ts.heroClass}`} style={{ ...ts.heroStyle, ...(cfg.hero_bg_color ? { backgroundColor: cfg.hero_bg_color } : {}), minHeight: '420px' }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        {(ts.heroOverlayClass || ts.heroOverlayStyle) && !cfg.hero_bg_color && <div className={`absolute inset-0 ${ts.heroOverlayClass}`} style={{ ...ts.heroOverlayStyle, opacity: 0.85 }} />}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
            <p className={`text-xs uppercase tracking-[0.25em] font-semibold mb-4 ${ts.heroSubtitleClass}`} style={{ ...ts.heroSubtitleStyle, ...(cfg.hero_subtitle_color ? { color: cfg.hero_subtitle_color } : {}) }}>
              {agency.city} - {agency.country}
            </p>
            <h1 className={`text-3xl md:text-5xl font-bold mb-4 leading-tight tracking-tight uppercase ${ts.heroTitleClass}`} style={{ ...ts.heroTitleStyle, ...(cfg.hero_text_color ? { color: cfg.hero_text_color } : {}) }}>
              {cfg.hero_title || <>Your All-in-One Travel<br />& Mobility Partner</>}
            </h1>
            <p className={`text-sm md:text-base max-w-xl mx-auto mb-8 ${ts.heroSubtitleClass}`} style={{ ...ts.heroSubtitleStyle, ...(cfg.hero_subtitle_color ? { color: cfg.hero_subtitle_color } : {}) }}>
              {cfg.hero_subtitle || `Car rental, chauffeur services, apartments & more — all from ${agency.name} in ${agency.city}`}
            </p>

            {/* Service Tabs in Hero */}
            {enabledServices.length > 1 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-1 p-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
                <button
                  onClick={() => setActiveService('all')}
                  className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeService === 'all' ? 'text-white shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                  style={activeService === 'all' ? { backgroundColor: buttonColor } : undefined}
                >
                  All Services
                </button>
                {enabledServices.map((service) => {
                  const Icon = SERVICE_ICONS[service] ?? Car;
                  return (
                    <button
                      key={service}
                      onClick={() => setActiveService(service)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeService === service ? 'text-white shadow-lg' : 'text-white/70 hover:text-white hover:bg-white/10'}`}
                      style={activeService === service ? { backgroundColor: buttonColor } : undefined}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{SERVICE_LABELS[service]}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Contextual Search Bar */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
          className={`p-6 md:p-8 ${ts.searchBarClass}`} style={ts.searchBarStyle}>

          <AnimatePresence mode="wait">
            {/* ---- CAR RENTAL / CAR DRIVER / LIMOUSINE / ALL ---- */}
            {(activeService === 'all' || activeService === 'car_rental' || activeService === 'car_driver' || activeService === 'limousine_services') && (
              <motion.div key="vehicle-form" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">
                    {activeService === 'limousine_services' ? 'Book your limousine' : activeService === 'car_driver' ? 'Book car & driver' : 'Book your ride'}
                  </h3>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <button
                      type="button"
                      onClick={() => setSameReturn(!sameReturn)}
                      className="h-5 w-5 rounded border-2 flex items-center justify-center transition-all duration-200"
                      style={sameReturn ? { backgroundColor: buttonColor, borderColor: buttonColor } : { borderColor: 'hsl(var(--border))' }}
                    >
                      {sameReturn && <Check className="h-3.5 w-3.5 text-white" />}
                    </button>
                    <span className="text-sm text-muted-foreground">Return to same location</span>
                  </label>
                </div>

                <div className="space-y-5">
                  {/* Pickup row */}
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-0 bottom-0 flex flex-col items-center">
                      <div className="h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: buttonColor }}>
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: buttonColor }} />
                      </div>
                      <div className="w-0.5 flex-1 bg-border my-1" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 items-start">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Pickup location</label>
                        <LocationAutocomplete value={pickupLocation} onChange={setPickupLocation} placeholder="City, airport, or address" locations={agencyLocations} agencyCity={agency.city} />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Pickup date</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} className="w-[180px] h-11 rounded-lg border border-border bg-background pl-10 pr-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Pickup time</label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          <input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className="w-[170px] h-11 rounded-lg border border-border bg-background pl-10 pr-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Return row */}
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-0 flex flex-col items-center">
                      <div className="h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 bg-muted" style={{ borderColor: 'hsl(var(--border))' }}>
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 items-start">
                      <div className={sameReturn ? 'opacity-50 pointer-events-none' : ''}>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Return location</label>
                        <LocationAutocomplete value={sameReturn ? pickupLocation : dropoffLocation} onChange={(val) => { if (!sameReturn) setDropoffLocation(val); }} placeholder={sameReturn ? pickupLocation || 'Same as pickup' : 'Return city or airport'} locations={agencyLocations} agencyCity={agency.city} />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Return date</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          <input type="date" value={dropoffDate} onChange={(e) => setDropoffDate(e.target.value)} className="w-[180px] h-11 rounded-lg border border-border bg-background pl-10 pr-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Return time</label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          <input type="time" value={dropoffTime} onChange={(e) => setDropoffTime(e.target.value)} className="w-[170px] h-11 rounded-lg border border-border bg-background pl-10 pr-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Button className="w-full h-12 mt-6 rounded-xl font-bold gap-2.5 text-white text-sm tracking-wide shadow-lg hover:shadow-xl transition-all duration-200" style={{ backgroundColor: buttonColor }}
                  onClick={() => { setSearchActive(true); vehiclesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
                  <Search className="h-4 w-4" /> Search available vehicles
                </Button>
              </motion.div>
            )}

            {/* ---- PRIVATE DRIVER ---- */}
            {activeService === 'private_driver' && (
              <motion.div key="driver-form" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
                <div className="mb-6">
                  <h3 className="text-lg font-bold">Book a private driver</h3>
                  <p className="text-sm text-muted-foreground mt-1">Professional chauffeur at your service</p>
                </div>

                <div className="space-y-5">
                  {/* Pickup */}
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-0 bottom-0 flex flex-col items-center">
                      <div className="h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: buttonColor }}>
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: buttonColor }} />
                      </div>
                      <div className="w-0.5 flex-1 bg-border my-1" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 items-start">
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Pickup location</label>
                        <LocationAutocomplete value={pickupLocation} onChange={setPickupLocation} placeholder="Hotel, airport, or address" locations={agencyLocations} agencyCity={agency.city} />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} className="w-[180px] h-11 rounded-lg border border-border bg-background pl-10 pr-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Time</label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                          <input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className="w-[170px] h-11 rounded-lg border border-border bg-background pl-10 pr-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-0 flex flex-col items-center">
                      <div className="h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0 bg-muted" style={{ borderColor: 'hsl(var(--border))' }}>
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Destination</label>
                      <LocationAutocomplete value={dropoffLocation} onChange={setDropoffLocation} placeholder="Where are you going?" locations={agencyLocations} agencyCity={agency.city} />
                    </div>
                  </div>

                  {/* Passengers & duration */}
                  <div className="grid grid-cols-2 gap-3 pl-8">
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Passengers</label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <select className="w-full h-11 rounded-lg border border-border bg-background pl-10 pr-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow appearance-none">
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n} {n === 1 ? 'passenger' : 'passengers'}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Trip type</label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <select className="w-full h-11 rounded-lg border border-border bg-background pl-10 pr-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow appearance-none">
                          <option value="transfer">Airport transfer</option>
                          <option value="hourly">Hourly booking</option>
                          <option value="daily">Full day</option>
                          <option value="tour">City tour</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <Button className="w-full h-12 mt-6 rounded-xl font-bold gap-2.5 text-white text-sm tracking-wide shadow-lg hover:shadow-xl transition-all duration-200" style={{ backgroundColor: buttonColor }}
                  onClick={() => { setSearchActive(true); vehiclesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
                  <Search className="h-4 w-4" /> Find a driver
                </Button>
              </motion.div>
            )}

            {/* ---- APARTMENT ---- */}
            {activeService === 'apartment' && (
              <motion.div key="apartment-form" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }}>
                <div className="mb-6">
                  <h3 className="text-lg font-bold">Find an apartment</h3>
                  <p className="text-sm text-muted-foreground mt-1">Furnished apartments for short & long stays</p>
                </div>

                <div className="space-y-5">
                  {/* Location */}
                  <div className="relative pl-8">
                    <div className="absolute left-0 top-0 flex flex-col items-center">
                      <div className="h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: buttonColor }}>
                        <Building className="h-3 w-3" style={{ color: buttonColor }} />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Location</label>
                      <LocationAutocomplete value={pickupLocation} onChange={setPickupLocation} placeholder="Neighborhood or area" locations={agencyLocations} agencyCity={agency.city} />
                    </div>
                  </div>

                  {/* Check-in / Check-out */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-8">
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Check-in</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} className="w-full h-11 rounded-lg border border-border bg-background pl-10 pr-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Check-out</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <input type="date" value={dropoffDate} onChange={(e) => setDropoffDate(e.target.value)} className="w-full h-11 rounded-lg border border-border bg-background pl-10 pr-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow" />
                      </div>
                    </div>
                  </div>

                  {/* Guests */}
                  <div className="pl-8">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Guests</label>
                    <div className="relative w-48">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <select className="w-full h-11 rounded-lg border border-border bg-background pl-10 pr-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow appearance-none">
                        {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <Button className="w-full h-12 mt-6 rounded-xl font-bold gap-2.5 text-white text-sm tracking-wide shadow-lg hover:shadow-xl transition-all duration-200" style={{ backgroundColor: buttonColor }}
                  onClick={() => { setSearchActive(true); vehiclesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
                  <Search className="h-4 w-4" /> Search apartments
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12" style={cfg.heading_color ? { color: cfg.heading_color } : undefined}>Why Choose Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Phone, title: 'Customer Support', desc: 'Our dedicated team is available 24/7 to assist you with any questions or issues.' },
            { icon: Shield, title: 'Best Price Guarantee', desc: 'We guarantee the best prices on all our vehicles with no hidden fees.' },
            { icon: MapPin, title: 'Many Locations', desc: 'Pick up and drop off your vehicle at convenient locations across the region.' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`text-center p-8 rounded-2xl transition-shadow ${ts.cardClass} ${ts.cardHoverClass}`} style={ts.cardStyle}>
              <div className={`inline-flex items-center justify-center h-16 w-16 rounded-full mb-5 ${ts.iconBgClass}`} style={ts.iconBgStyle}>
                <item.icon className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-sm opacity-60 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Unified Service Sections */}
      <AnimatePresence mode="wait">
        {(activeService === 'all' ? enabledServices : [activeService]).map((service, sectionIdx) => {
          const Icon = SERVICE_ICONS[service] ?? Car;
          const label = SERVICE_LABELS[service] ?? service;
          const desc = SERVICE_SHORT_DESC[service];
          const features = SERVICE_FEATURES[service];

          return (
            <motion.section
              key={service}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: sectionIdx * 0.1 }}
              className={`py-16 ${sectionIdx % 2 === 0 ? ts.sectionAltClass : ''}`}
              style={sectionIdx % 2 === 0 ? ts.sectionAltStyle : undefined}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-start gap-12">
                  {/* Service Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl ${ts.iconBgClass}`} style={ts.iconBgStyle}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold" style={cfg.heading_color ? { color: cfg.heading_color } : undefined}>
                        {label}
                      </h2>
                    </div>
                    <p className="text-sm opacity-60 leading-relaxed mb-6 max-w-lg">{desc}</p>

                    {/* Feature checklist */}
                    <ul className="space-y-3 mb-6">
                      {features.items.map((feat, fi) => (
                        <motion.li
                          key={fi}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: fi * 0.05 }}
                          className="flex items-center gap-3 text-sm"
                        >
                          <span className="h-5 w-5 rounded-full flex items-center justify-center text-white text-xs shrink-0" style={{ backgroundColor: buttonColor }}>✓</span>
                          {feat}
                        </motion.li>
                      ))}
                    </ul>

                    <Link to={`/agency/${slug}/services/${service}`}>
                      <Button className="rounded-lg font-semibold gap-2 text-white" style={{ backgroundColor: buttonColor }}>
                        Explore {label} <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>

                  {/* Service visual / mini cards */}
                  <div className="flex-1 min-w-0 w-full">
                    {vehicleServices.includes(service) && vehicles.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {vehicles.slice(0, 4).map((vehicle) => (
                          <div key={vehicle.id} className={`rounded-xl border border-current/10 overflow-hidden ${ts.cardClass}`} style={ts.cardStyle}>
                            {vehicle.photo_url ? (
                              <img src={vehicle.photo_url} alt={`${vehicle.brand} ${vehicle.model}`} className="h-32 w-full object-cover" />
                            ) : (
                              <div className="h-32 flex items-center justify-center opacity-10 bg-current">
                                <Car className="h-10 w-10" />
                              </div>
                            )}
                            <div className="p-3">
                              <h4 className="font-bold text-sm">{vehicle.brand} {vehicle.model}</h4>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs opacity-50">{vehicle.year}</span>
                                {vehicle.display_price_per_km ? (
                                  <span className="text-sm font-bold" style={{ color: buttonColor }}>{vehicle.display_price_per_km} €/km</span>
                                ) : vehicle.daily_rate ? (
                                  <span className="text-sm font-bold" style={{ color: buttonColor }}>{vehicle.daily_rate} €/day</span>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={`rounded-2xl p-8 text-center ${ts.cardClass}`} style={ts.cardStyle}>
                        <Icon className="h-16 w-16 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-bold mb-2">{label}</p>
                        <p className="text-sm opacity-50">Contact us for availability and pricing</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.section>
          );
        })}
      </AnimatePresence>

      {/* Featured Vehicle — first from database */}
      {showVehicles && vehicles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className={`rounded-2xl overflow-hidden ${ts.heroClass}`} style={{ ...ts.heroStyle, position: 'relative', ...(cfg.hero_bg_color ? { backgroundColor: cfg.hero_bg_color } : {}) }}>
            {(ts.heroOverlayClass || ts.heroOverlayStyle) && !cfg.hero_bg_color && <div className={`absolute inset-0 ${ts.heroOverlayClass}`} style={ts.heroOverlayStyle} />}
            <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <span className={`text-xs uppercase tracking-[0.2em] font-semibold ${ts.heroSubtitleClass}`} style={{ ...ts.heroSubtitleStyle, ...(cfg.hero_subtitle_color ? { color: cfg.hero_subtitle_color } : {}) }}>Best Offer</span>
                <h3 className={`text-2xl md:text-3xl font-bold mt-2 mb-1 ${ts.heroTitleClass}`} style={{ ...ts.heroTitleStyle, ...(cfg.hero_text_color ? { color: cfg.hero_text_color } : {}) }}>
                  {vehicles[0].brand} {vehicles[0].model} {vehicles[0].year}
                </h3>
                {vehicles[0].display_price_per_km ? (
                  <p className="text-2xl font-bold text-accent">{vehicles[0].display_price_per_km} €/km</p>
                ) : vehicles[0].daily_rate ? (
                  <p className="text-2xl font-bold text-accent">{vehicles[0].daily_rate.toLocaleString()} €/day</p>
                ) : null}
              </div>
              <div className="flex-1 flex items-center justify-center">
                {vehicles[0].photo_url ? (
                  <img src={vehicles[0].photo_url} alt={`${vehicles[0].brand} ${vehicles[0].model}`} className="w-80 h-48 rounded-xl object-cover" />
                ) : (
                  <div className="w-80 h-48 rounded-xl flex items-center justify-center bg-white/5">
                    <Car className="h-24 w-24 opacity-20" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Full Vehicle Listings */}
      {showVehicles && (
        <section ref={vehiclesRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 scroll-mt-8">
          {searchActive && (pickupLocation || pickupDate || dropoffLocation || dropoffDate) && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl border border-border bg-muted/30 flex flex-wrap items-center gap-4 text-sm">
              <MapPin className="h-4 w-4 opacity-50" />
              <span><strong>Pickup:</strong> {pickupLocation || 'Any'}{pickupDate ? ` · ${pickupDate}` : ''}{pickupTime ? ` ${pickupTime}` : ''}</span>
              <span className="opacity-30">→</span>
              <span><strong>Drop-off:</strong> {dropoffLocation || 'Any'}{dropoffDate ? ` · ${dropoffDate}` : ''}{dropoffTime ? ` ${dropoffTime}` : ''}</span>
              <button onClick={() => { setSearchActive(false); setPickupLocation(''); setPickupDate(''); setPickupTime(''); setDropoffLocation(''); setDropoffDate(''); setDropoffTime(''); }} className="ml-auto text-xs font-medium underline opacity-60 hover:opacity-100">Clear</button>
            </motion.div>
          )}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold" style={cfg.heading_color ? { color: cfg.heading_color } : undefined}>Choose Your Vehicle</h2>
              <p className="text-sm opacity-60 mt-1">Find the perfect car for your journey with competitive prices and top-quality vehicles.</p>
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
                      <div className="p-5 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-10 w-full mt-3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredVehicles.length === 0 ? (
                <div className="text-center py-16 opacity-50">
                  <Car className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">{hasAnyFilter(filters) ? 'No vehicles match your filters.' : 'No vehicles available at the moment.'}</p>
                  {hasAnyFilter(filters) && (
                    <button onClick={() => setFilters(emptyFilters)} className="mt-3 text-sm font-medium underline" style={{ color: buttonColor }}>Clear all filters</button>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-sm opacity-50 mb-4">{filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? 's' : ''} found</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredVehicles.map((vehicle, i) => {
                      const mv = vehicle as MarketplaceVehicle;
                      return (
                      <motion.div key={vehicle.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                        className="rounded-xl border border-current/10 overflow-hidden transition-shadow hover:shadow-lg relative" style={ts.cardStyle}>
                        {/* Partner badge */}
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
                          <img src={vehicle.photo_url} alt={`${vehicle.brand} ${vehicle.model}`} className="h-44 w-full object-cover" />
                        ) : (
                          <div className="h-44 flex items-center justify-center opacity-10 bg-current">
                            <Car className="h-14 w-14" />
                          </div>
                        )}
                        <div className="p-5">
                          <h4 className="font-bold text-lg">{vehicle.brand} {vehicle.model}</h4>
                          <p className="text-xs opacity-50 mb-4">{vehicle.year}</p>
                          <div className="flex items-center justify-between pt-3 border-t border-current/10">
                            {vehicle.display_price_per_km ? (
                              <p className="text-lg font-bold">{vehicle.display_price_per_km} €<span className="text-xs font-normal opacity-50"> / km</span></p>
                            ) : vehicle.daily_rate ? (
                              <p className="text-lg font-bold">{vehicle.daily_rate.toLocaleString()} €<span className="text-xs font-normal opacity-50"> / day</span></p>
                            ) : (
                              <p className="text-sm opacity-50">Contact for price</p>
                            )}
                            <Button size="sm" variant="outline" className="rounded-lg text-sm font-semibold border-2 hover:text-white"
                              style={{ borderColor: buttonColor, color: buttonColor }}
                              onMouseEnter={e => { (e.target as HTMLElement).style.backgroundColor = buttonColor; }}
                              onMouseLeave={e => { (e.target as HTMLElement).style.backgroundColor = 'transparent'; }}>
                              {cfg.cta_text || 'Book Now'}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Blog Section */}
      <section className={`py-20 ${ts.sectionAltClass}`} style={ts.sectionAltStyle}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3" style={cfg.heading_color ? { color: cfg.heading_color } : undefined}>Blog</h2>
          <p className="text-center text-sm opacity-60 mb-10 max-w-lg mx-auto">
            Discover the latest news and useful articles about car rental and travel tips
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((_, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`overflow-hidden transition-all ${ts.cardClass} ${ts.cardHoverClass}`} style={ts.cardStyle}>
                <div className="h-48 opacity-10 bg-current" />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase">Blog Title</span>
                    <span className="text-[10px] text-accent font-medium uppercase">Category</span>
                  </div>
                  <p className="text-xs opacity-50 mb-2">Author · a min ago</p>
                  <p className="text-sm opacity-60 leading-relaxed">
                    Discover useful tips and insights about car rental, travel, and getting the most from your journey.
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button className="text-sm font-medium text-accent hover:opacity-80 transition-opacity">More →</button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-3" style={cfg.heading_color ? { color: cfg.heading_color } : undefined}>Trusted by Thousands of Happy Customers</h2>
        <p className="text-center text-sm opacity-60 mb-12 max-w-lg mx-auto">
          Our customers' opinions help us improve your experience and offer the best services
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className={`p-6 rounded-2xl border ${i === 1 ? ts.testimonialHighlightClass : ts.testimonialNormalClass}`} style={i === 1 ? ts.testimonialHighlightStyle : ts.testimonialNormalStyle}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold ${i === 1 ? 'bg-white/20' : 'opacity-30 bg-current'}`}>
                  {t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <div className="flex gap-0.5 mt-0.5">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} className="h-3 w-3 fill-accent text-accent" />
                    ))}
                  </div>
                </div>
              </div>
              <p className={`text-sm leading-relaxed ${i === 1 ? 'opacity-80' : 'opacity-60'}`}>{t.text}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default StorefrontHome;
