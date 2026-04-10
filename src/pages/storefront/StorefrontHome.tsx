import { useOutletContext, Link, useParams } from 'react-router-dom';
import { Agency, StorefrontConfig, ServiceType, SERVICE_LABELS } from '@/types/agency';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, Clock, Phone, Shield, Star, ChevronRight, ChevronLeft, Car, Building, SlidersHorizontal, X, Users, Briefcase, Check, Fuel, Settings2, Play, ArrowDown, Globe, Award, Sparkles, Heart } from 'lucide-react';

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

const DESTINATIONS = [
  { name: 'Ancient Temple\nRuins', location: 'Egypt, North Africa', rating: 4.5, image: destTemple },
  { name: 'Royal Palace\nof Europe', location: 'Vienna, Europe', rating: 4.7, image: destPalace },
  { name: 'Gothic\nCathedral', location: 'Germany, Europe', rating: 4.6, image: destMonument },
];

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
    { title: 'Top 10 Hidden Gems', category: 'Travel', author: 'Editorial Team', excerpt: 'Discover the most beautiful hidden destinations that most tourists never see. Off-the-beaten-path adventures await.' },
    { title: 'Ultimate Road Trip Guide', category: 'Adventure', author: 'Editorial Team', excerpt: 'Everything you need to plan the perfect road trip — from routes to pit stops and scenic viewpoints.' },
    { title: 'Luxury Travel on a Budget', category: 'Tips', author: 'Editorial Team', excerpt: 'How to experience five-star service without breaking the bank. Smart travel hacks from industry insiders.' },
  ];

  const serifFont = { fontFamily: "'Georgia', 'Times New Roman', serif" };

  return (
    <div>
      <StorefrontSeo
        agency={agency}
        page="home"
        fallbackTitle={agency.meta_title || `${agency.name} | ${agency.city}, ${agency.country}`}
        fallbackDescription={agency.meta_description || `Premium travel services by ${agency.name} in ${agency.city}, ${agency.country}.`}
      />

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative overflow-hidden" style={{ minHeight: '100vh' }}>
        <img src={cfg.home_hero_image || defaultHeroImage} alt="" className="absolute inset-0 w-full h-full object-cover scale-105" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/10 to-black/60" />
        
        {/* Decorative lines */}
        <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
          <div className="absolute left-[10%] top-0 bottom-0 w-px bg-white/5" />
          <div className="absolute left-[90%] top-0 bottom-0 w-px bg-white/5" />
        </div>

        <div className="relative flex flex-col items-center justify-center text-center px-4" style={{ minHeight: '100vh', paddingTop: '72px' }}>
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: 'easeOut' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white/80 text-xs font-medium mb-6"
            >
              <Sparkles className="h-3 w-3" />
              Premium Travel Agency in {agency.city}
            </motion.div>

            <h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.05] text-white mb-6 tracking-tight max-w-4xl mx-auto"
              style={{
                ...serifFont,
                ...(cfg.hero_text_color ? { color: cfg.hero_text_color } : {}),
              }}
            >
              {cfg.hero_title || (
                <>
                  Mysteries of<br />
                  <span className="italic" style={{ color: buttonColor }}>The Journey</span>
                </>
              )}
            </h1>
            <p className="text-sm md:text-base text-white/50 max-w-lg mx-auto font-light leading-relaxed" style={cfg.hero_subtitle_color ? { color: cfg.hero_subtitle_color } : undefined}>
              {cfg.hero_subtitle || `Discover extraordinary destinations with ${agency.name}. Premium service, unforgettable experiences.`}
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex items-center gap-4 mt-8"
            >
              <button
                className="px-7 py-3 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90 shadow-lg"
                style={{ backgroundColor: buttonColor }}
                onClick={() => vehiclesRef.current?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore Now
              </button>
              <button className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium text-white/70 bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
                <Play className="h-3.5 w-3.5 fill-white text-white" /> Watch Video
              </button>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium">Scroll</span>
            <div className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent" />
          </motion.div>

          {/* Stats bar */}
          <motion.div
            className="absolute bottom-10 right-8 hidden lg:flex items-center gap-8 text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="text-right">
              <p className="text-xl font-bold">500+</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Happy Clients</p>
            </div>
            <div className="w-px h-8 bg-white/15" />
            <div className="text-right">
              <p className="text-xl font-bold">50+</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Destinations</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ BOOKING BAR ═══════════════ */}
      <section className="relative z-10 px-4 -mt-16 pb-6">
        <div className="max-w-5xl mx-auto">
          {enabledServices.length > 1 && (
            <div className="flex items-end justify-center">
              {enabledServices.map((service) => {
                const Icon = SERVICE_ICONS[service] ?? Car;
                const isActive = activeService === service;
                return (
                  <button
                    key={service}
                    onClick={() => setActiveService(service)}
                    className={`relative flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold tracking-wide transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-gray-900 rounded-t-xl shadow-lg z-10'
                        : 'text-gray-400 bg-gray-100 hover:bg-gray-50 rounded-t-lg'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? '' : 'opacity-60'}`} style={isActive ? { color: buttonColor } : undefined} />
                    <span className="hidden sm:inline">{SERVICE_LABELS[service]}</span>
                    {isActive && <div className="absolute bottom-0 left-4 right-4 h-[2px] rounded-full" style={{ backgroundColor: buttonColor }} />}
                  </button>
                );
              })}
            </div>
          )}

          <AnimatePresence mode="wait">
            {(activeService === 'all' || activeService === 'car_rental') && (
              <motion.div key="vehicle-form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <div className="bg-white rounded-b-2xl rounded-tr-2xl shadow-2xl shadow-black/5 border border-gray-100 p-6 md:p-8">
                  <div className="flex items-center gap-6 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="trip" checked={sameReturn} onChange={() => setSameReturn(true)} style={{ accentColor: buttonColor }} />
                      <span className="text-sm font-medium text-gray-700">Same return</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="trip" checked={!sameReturn} onChange={() => setSameReturn(false)} style={{ accentColor: buttonColor }} />
                      <span className="text-sm font-medium text-gray-700">Different return</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1"><MapPin className="h-3 w-3" /> Pickup</span>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1">
                          <label className="text-[10px] text-gray-400 block mb-0.5">Location</label>
                          <div className="border border-gray-200 rounded-lg p-2 hover:border-gray-300 transition-colors">
                            <LocationAutocomplete value={pickupLocation} onChange={setPickupLocation} placeholder="City" locations={agencyLocations} agencyCity={agency.city} />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400 block mb-0.5">Date</label>
                          <div className="border border-gray-200 rounded-lg p-2 hover:border-gray-300 transition-colors">
                            <input type="date" value={pickupDate} min={todayStr} onChange={(e) => handlePickupDateChange(e.target.value)} className="w-full bg-transparent text-sm text-gray-900 focus:outline-none" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400 block mb-0.5">Time</label>
                          <div className="border border-gray-200 rounded-lg p-2 hover:border-gray-300 transition-colors">
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
                          <div className={`border border-gray-200 rounded-lg p-2 hover:border-gray-300 transition-colors ${sameReturn ? 'opacity-40' : ''}`}>
                            <LocationAutocomplete value={sameReturn ? pickupLocation : dropoffLocation} onChange={(val) => { if (!sameReturn) setDropoffLocation(val); }} placeholder={sameReturn ? 'Same' : 'City'} locations={agencyLocations} agencyCity={agency.city} />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400 block mb-0.5">Date</label>
                          <div className="border border-gray-200 rounded-lg p-2 hover:border-gray-300 transition-colors">
                            <input type="date" value={dropoffDate} onChange={(e) => handleDropoffDateChange(e.target.value)} min={minReturnDate} className="w-full bg-transparent text-sm text-gray-900 focus:outline-none" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400 block mb-0.5">Time</label>
                          <div className="border border-gray-200 rounded-lg p-2 hover:border-gray-300 transition-colors">
                            <input type="time" value={dropoffTime} onChange={(e) => setDropoffTime(e.target.value)} className="w-full bg-transparent text-sm text-gray-900 focus:outline-none" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button className="h-11 px-8 rounded-full font-bold gap-2 text-white text-sm shadow-lg hover:shadow-xl transition-all" style={{ backgroundColor: buttonColor }}
                      onClick={() => { setSearchActive(true); vehiclesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>
                      <Search className="h-4 w-4" /> Search Vehicles
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeService === 'transfer' && (
              <motion.div key="transfer-form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <TransferBookingForm agency={agency} config={cfg} buttonColor={buttonColor} />
              </motion.div>
            )}

            {activeService === 'limo_tour' && (
              <motion.div key="limo-form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <LimoBookingForm agency={agency} config={cfg} buttonColor={buttonColor} />
              </motion.div>
            )}

            {activeService === 'city_tour' && (
              <motion.div key="city-tour-form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <div className="bg-white rounded-b-2xl rounded-tr-2xl shadow-2xl shadow-black/5 border border-gray-100 p-6 md:p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Book a City Tour</h3>
                    <p className="text-sm text-gray-400 mt-1">Guided tours with local expert drivers</p>
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
                    <Button className="h-11 px-8 rounded-full font-bold gap-2 text-white text-sm shadow-lg" style={{ backgroundColor: buttonColor }}
                      onClick={() => setSearchActive(true)}>
                      <Search className="h-4 w-4" /> Find tours
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeService === 'apartment' && (
              <motion.div key="apartment-form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                <div className="bg-white rounded-b-2xl rounded-tr-2xl shadow-2xl shadow-black/5 border border-gray-100 p-6 md:p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Find an Apartment</h3>
                    <p className="text-sm text-gray-400 mt-1">Furnished apartments for short & long stays</p>
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
                    <Button className="h-11 px-8 rounded-full font-bold gap-2 text-white text-sm shadow-lg" style={{ backgroundColor: buttonColor }}
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
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: 'Best Price Guarantee', desc: 'Transparent pricing with no hidden fees. We match any competitor.' },
              { icon: Globe, title: '50+ Destinations', desc: 'Extensive coverage across the region and beyond.' },
              { icon: Award, title: 'Premium Service', desc: '5-star rated by 500+ satisfied travelers.' },
              { icon: Phone, title: '24/7 Support', desc: 'Round-the-clock assistance wherever you are.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center group"
              >
                <div className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg" style={{ backgroundColor: `${buttonColor}10`, color: buttonColor }}>
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">{item.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ EXPLORE DESTINATIONS ═══════════════ */}
      <section className="py-24 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-3" style={{ color: buttonColor }}>Popular Destinations</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={serifFont}>
              Explore the <span className="italic">beautiful</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DESTINATIONS.map((dest, i) => (
              <motion.div
                key={dest.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="group relative rounded-3xl overflow-hidden aspect-[3/4] cursor-pointer shadow-lg hover:shadow-2xl transition-shadow duration-500"
              >
                <img src={dest.image} alt={dest.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" width={800} height={1024} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 shadow-sm backdrop-blur-sm">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-gray-900">{dest.rating}</span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-xl font-bold text-white leading-tight mb-2 whitespace-pre-line" style={serifFont}>{dest.name}</h3>
                  <div className="flex items-center gap-1.5 text-white/60 text-xs">
                    <MapPin className="h-3 w-3" />
                    <span>{dest.location}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ ADVENTURE BANNER ═══════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mb-3">Travel with us</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900" style={serifFont}>
              Conquer the <span className="italic text-4xl md:text-5xl" style={{ color: buttonColor }}>Epic Trails</span>
            </h2>
          </div>

          <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ minHeight: '450px' }}>
            <img src={adventureMountain} alt="Adventure" className="absolute inset-0 w-full h-full object-cover" loading="lazy" width={1920} height={900} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-black/40" />

            <div className="absolute bottom-8 left-8 flex items-end gap-8">
              <div className="text-white">
                <p className="text-4xl font-bold">529+</p>
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="flex -space-x-1.5">
                    {[1,2,3,4].map(j => (
                      <div key={j} className="h-6 w-6 rounded-full border-2 border-white/80" style={{ backgroundColor: `${buttonColor}${60 + j * 15}` }} />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-white/50 mt-2">People Already<br/>Booked</p>
              </div>
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <button className="h-16 w-16 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/25 hover:scale-110 transition-all duration-300 shadow-xl">
                <Play className="h-6 w-6 text-white fill-white ml-0.5" />
              </button>
            </div>

            <div className="absolute bottom-8 right-8 text-right text-white">
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/40">Temperature</p>
              <p className="text-sm font-bold">-20°C to -40°C</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ VEHICLE LISTINGS ═══════════════ */}
      {showVehicles && (
        <section ref={vehiclesRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 scroll-mt-8">
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
              <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-2" style={{ color: buttonColor }}>Our Fleet</p>
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
                      <div className="p-5 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-10 w-full mt-3" />
                      </div>
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
                              {mv.agency_logo_url ? (
                                <img src={mv.agency_logo_url} alt="" className="h-4 w-4 rounded-full object-cover" />
                              ) : (
                                <Briefcase className="h-3 w-3" />
                              )}
                              via {mv.agency_name}
                            </div>
                          )}
                          {vehicle.photo_url ? (
                            <img src={vehicle.photo_url} alt={`${vehicle.brand} ${vehicle.model}`} className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                            <div className="h-48 flex items-center justify-center bg-gray-50">
                              <Car className="h-12 w-12 text-gray-200" />
                            </div>
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
                                <p className="text-lg font-bold text-gray-900">{vehicle.display_price_per_km} €<span className="text-xs font-normal text-gray-400"> /km</span></p>
                              ) : vehicle.daily_rate ? (
                                <p className="text-lg font-bold text-gray-900">{vehicle.daily_rate.toLocaleString()} €<span className="text-xs font-normal text-gray-400"> /day</span></p>
                              ) : (
                                <p className="text-sm text-gray-400">Contact</p>
                              )}
                              <Button size="sm" className="rounded-full text-xs font-bold text-white h-9 px-5" style={{ backgroundColor: buttonColor }}
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

      {/* ═══════════════ OUR SERVICES ═══════════════ */}
      <section className="bg-gray-950 py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-center mb-3" style={{ color: buttonColor }}>What We Offer</p>
          <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-3" style={serifFont}>Our Services</h2>
          <p className="text-center text-sm text-white/40 mb-16 max-w-md mx-auto">Everything you need for seamless travel, all in one place</p>

          <div className="space-y-20">
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
                  className={`flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'} gap-10 items-center`}
                >
                  <Link to={`/agency/${slug}/services/${service}`} className="w-full md:w-1/2 group">
                    <div className="relative rounded-3xl overflow-hidden shadow-xl">
                      <img src={image} alt={label} className="w-full h-60 md:h-80 object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" width={960} height={640} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>
                  </Link>

                  <div className="w-full md:w-1/2 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${buttonColor}20` }}>
                        <Icon className="h-5 w-5" style={{ color: buttonColor }} />
                      </div>
                      <h3 className="text-xl font-bold text-white" style={serifFont}>{label}</h3>
                    </div>
                    <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
                    <ul className="space-y-2">
                      {features.map((feat, j) => (
                        <li key={j} className="flex items-center gap-2.5 text-[13px] text-white/60">
                          <div className="h-4 w-4 rounded-full flex items-center justify-center" style={{ backgroundColor: `${buttonColor}20` }}>
                            <Check className="h-2.5 w-2.5" style={{ color: buttonColor }} />
                          </div>
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <Link to={`/agency/${slug}/services/${service}`} className="inline-flex items-center gap-1.5 text-sm font-semibold mt-2 hover:gap-3 transition-all" style={{ color: buttonColor }}>
                      Learn more <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ TESTIMONIALS ═══════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-center mb-3" style={{ color: buttonColor }}>Testimonials</p>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3 text-gray-900" style={{ ...serifFont, ...(cfg.heading_color ? { color: cfg.heading_color } : {}) }}>
            {cfg.reviews_title || 'What Our Customers Say'}
          </h2>
          <p className="text-center text-sm text-gray-400 mb-14 max-w-md mx-auto">
            {cfg.reviews_subtitle || "Real feedback from real customers"}
          </p>

          <div className="relative">
            <div className="flex items-center gap-4 justify-center">
              <button onClick={() => setReviewIndex(Math.max(0, reviewIndex - 1))} className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shrink-0" style={{ color: buttonColor }}>
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
                        isCenter
                          ? 'bg-gray-950 text-white border-gray-800 shadow-xl scale-[1.02]'
                          : 'bg-gray-50 text-gray-700 border-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`h-11 w-11 rounded-full flex items-center justify-center text-xs font-bold ${isCenter ? 'text-white' : 'text-gray-500'}`}
                          style={{ backgroundColor: isCenter ? `${buttonColor}30` : '#f3f4f6' }}>
                          {t.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className={`font-semibold text-sm ${isCenter ? 'text-white' : 'text-gray-900'}`}>{t.name}</p>
                          <div className="flex gap-0.5 mt-0.5">
                            {[...Array(t.rating)].map((_, j) => (
                              <Star key={j} className="h-3 w-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className={`text-xs leading-relaxed ${isCenter ? 'text-white/60' : 'text-gray-500'}`}>"{t.text}"</p>
                    </motion.div>
                  );
                })}
              </div>

              <button onClick={() => setReviewIndex(Math.min(testimonials.length - 1, reviewIndex + 1))} className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shrink-0" style={{ color: buttonColor }}>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ BLOG ═══════════════ */}
      <section className="py-24 bg-gray-50/70 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-center mb-3" style={{ color: buttonColor }}>Latest News</p>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3 text-gray-900" style={{ ...serifFont, ...(cfg.heading_color ? { color: cfg.heading_color } : {}) }}>{cfg.blog_title || 'From the Blog'}</h2>
          <p className="text-center text-sm text-gray-400 mb-12 max-w-md mx-auto">
            {cfg.blog_subtitle || 'Travel tips, destination guides, and insider stories'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogPosts.map((post, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 group">
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
                  <span className="text-xs text-gray-400 font-medium">Image</span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-semibold uppercase px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: buttonColor }}>{post.category}</span>
                  </div>
                  <h4 className="text-base font-bold text-gray-900 mb-1.5 group-hover:text-gray-600 transition-colors" style={serifFont}>{post.title}</h4>
                  <p className="text-[11px] text-gray-400 mb-2">{post.author}</p>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{post.excerpt}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-10">
            <button className="inline-flex items-center gap-1 text-sm font-semibold hover:gap-2 transition-all" style={{ color: buttonColor }}>View all articles <ChevronRight className="h-4 w-4" /></button>
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
