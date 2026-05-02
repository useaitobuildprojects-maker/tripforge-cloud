import { useOutletContext, Link, useParams } from 'react-router-dom';
import { Agency, StorefrontConfig, ServiceType, SERVICE_LABELS } from '@/types/agency';
import { motion } from 'framer-motion';
import {
  Search, MapPin, Calendar, Star, ChevronRight, Car, Building, Users, Briefcase,
  Fuel, Settings2, Navigation, Globe, Heart, ShieldCheck, BadgePercent,
  HeadphonesIcon, ArrowRight, Plane,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import StorefrontSeo from '@/components/storefront/StorefrontSeo';
import { TemplateStyles } from '@/lib/template-styles';
import defaultHeroImage from '@/assets/hero-desert.jpg';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const SERVICE_ICONS: Record<ServiceType, React.ElementType> = {
  car_rental: Car,
  apartment: Building,
  transfer: Navigation,
  limo_tour: Briefcase,
  city_tour: Globe,
};

const DESTINATIONS = [
  { name: 'Ancient Temple Ruins', location: 'Egypt', tag: 'Top rated', rating: 4.8, reviews: 2456, price: 456, image: destTemple, nights: 3 },
  { name: 'Royal Palace Tour', location: 'Vienna', tag: "Member's deal", rating: 4.7, reviews: 1832, price: 389, image: destPalace, nights: 2 },
  { name: 'Gothic Cathedral Visit', location: 'Germany', tag: 'New', rating: 4.9, reviews: 980, price: 512, image: destMonument, nights: 4 },
];

const TRUST_ITEMS = [
  { icon: BadgePercent, title: 'Best price guarantee', desc: 'Find a cheaper rate? We refund the difference.' },
  { icon: ShieldCheck, title: 'Free cancellation', desc: 'On most rentals up to 24 hours before pickup.' },
  { icon: HeadphonesIcon, title: '24/7 support', desc: 'Real people, ready to help anywhere, anytime.' },
];

const StorefrontHome = () => {
  const { slug } = useParams();
  const { agency, templateStyles: ts, buttonColor, config: cfg } = useOutletContext<{ agency: Agency; templateStyles: TemplateStyles; buttonColor: string; config: StorefrontConfig }>();
  const tk = ts.tokens;
  const enabledServices = agency.services ?? [];
  const { data: vehicles = [], isLoading: vehiclesLoading } = useMarketplaceVehicles(agency.id, agency.commission_rate);

  const [activeService, setActiveService] = useState<ServiceType>(enabledServices[0] ?? 'car_rental');
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [dropoffDate, setDropoffDate] = useState('');
  const [passengers, setPassengers] = useState<number>(1);
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
  const filteredVehicles = useMemo(() => applyFilters(vehicles, filters), [vehicles, filters]);
  const activeFilterCount = countActiveFilters(filters);
  const [bookingVehicle, setBookingVehicle] = useState<MarketplaceVehicle | null>(null);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const minReturnDate = useMemo(() => {
    if (!pickupDate) return todayStr;
    const d = new Date(pickupDate);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, [pickupDate, todayStr]);

  const todayDate = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const pickupDateObj = pickupDate ? new Date(pickupDate) : undefined;
  const dropoffDateObj = dropoffDate ? new Date(dropoffDate) : undefined;
  const minReturnDateObj = useMemo(() => {
    if (!pickupDateObj) return todayDate;
    const d = new Date(pickupDateObj); d.setDate(d.getDate() + 1); return d;
  }, [pickupDateObj, todayDate]);

  // Pull colors from the active template's palette so switching templates
  // visually changes hero / CTA / accent treatments across the storefront.
  const EXP = ts.palette;
  const accent = ts.isDark ? buttonColor : EXP.brand;
  const ctaBg = ts.isDark ? buttonColor : EXP.cta;
  const ctaTextColor = ts.isDark ? '#ffffff' : EXP.ctaText;
  const typo = ts.typography;
  const shape = ts.shape;
  const headingFontStyle: React.CSSProperties = { fontFamily: typo.heading };

  return (
    <div>
      <StorefrontSeo
        agency={agency}
        page="home"
        fallbackTitle={agency.meta_title || `${agency.name} | ${agency.city}, ${agency.country}`}
        fallbackDescription={agency.meta_description || `Premium travel services by ${agency.name} in ${agency.city}, ${agency.country}.`}
      />

      {/* ═══════════════ HERO — Booking.com style ═══════════════ */}
      <section className="relative" style={{ backgroundColor: EXP.brandDeep, ...(ts.heroStyle ?? {}) }}>
        {/* Background image with strong navy wash */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={cfg.home_hero_image || defaultHeroImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-40"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${EXP.brandDeep}E0 0%, ${EXP.brandDeep}F5 100%)` }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-28 sm:pb-32">
          <motion.h1
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className={`text-white text-3xl sm:text-4xl lg:text-5xl leading-[1.1] max-w-3xl ${ts.heroTitleClass}`}
            style={headingFontStyle}
          >
            {cfg.hero_title || `Find your next trip in ${agency.city}`}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="mt-3 text-base md:text-lg text-white/85 max-w-2xl"
          >
            {cfg.hero_subtitle || `Search low prices on vehicles, transfers and tours across ${agency.city}.`}
          </motion.p>

          {/* Search card sitting at bottom of hero, with yellow border */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="absolute left-4 right-4 sm:left-6 sm:right-6 lg:left-8 lg:right-8 -bottom-7 max-w-7xl mx-auto">
            <div className="shadow-2xl border" style={{ ...tk.surface, ...tk.border, borderRadius: shape.cardRadius }}>
              <div style={{ ...tk.surface, borderRadius: `calc(${shape.cardRadius} - 1px)` }}>
              {/* Service tabs */}
              {enabledServices.length > 0 && (
                <div className="flex flex-nowrap overflow-x-auto items-center gap-2 px-3 pt-3 pb-1 scrollbar-hide">
                  {enabledServices.map((service) => {
                    const Icon = SERVICE_ICONS[service] ?? Car;
                    const isActive = activeService === service;
                    return (
                      <button
                        key={service}
                        onClick={() => setActiveService(service)}
                        className="inline-flex shrink-0 items-center gap-2 px-4 h-9 text-sm font-semibold rounded-full border-2 transition-all whitespace-nowrap"
                        style={isActive
                          ? { color: '#ffffff', backgroundColor: accent, borderColor: accent }
                          : { ...tk.textBody, backgroundColor: 'transparent', borderColor: 'hsl(var(--border))' }}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{SERVICE_LABELS[service] ?? service}</span>
                      </button>
                    );
                  })}
                </div>
              )}
              {/* Search fields row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-1.5 p-1.5">
                <div className="md:col-span-3 px-3 py-2.5 rounded-md border-2 flex items-center gap-2.5" style={{ ...tk.inputSurface, borderColor: 'hsl(var(--border))' }}>
                  <MapPin className="h-4 w-4 shrink-0" style={{ color: accent }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide" style={tk.textMuted}>Pick-up</p>
                    <LocationAutocomplete value={pickupLocation} onChange={setPickupLocation} placeholder={agency.city} locations={agencyLocations} agencyCity={agency.city} agencyCountry={agency.country} accentColor={accent} />
                  </div>
                </div>
                <div className="md:col-span-2 px-3 py-2.5 rounded-md border-2 flex items-center gap-2.5" style={{ ...tk.inputSurface, borderColor: 'hsl(var(--border))' }}>
                  <MapPin className="h-4 w-4 shrink-0" style={{ color: accent }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide" style={tk.textMuted}>Drop-off</p>
                    <LocationAutocomplete value={dropoffLocation} onChange={setDropoffLocation} placeholder="Same as pick-up" locations={agencyLocations} agencyCity={agency.city} agencyCountry={agency.country} accentColor={accent} />
                  </div>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <button type="button" className="md:col-span-2 px-3 py-2.5 rounded-md border-2 flex items-center gap-2.5 text-left hover:border-[#cbd5e1] transition-colors" style={{ ...tk.inputSurface, borderColor: 'hsl(var(--border))' }}>
                      <Calendar className="h-4 w-4 shrink-0" style={{ color: accent }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wide" style={tk.textMuted}>Pick-up</p>
                        <p className={cn("text-sm truncate", !pickupDateObj && "text-muted-foreground")} style={pickupDateObj ? tk.textPrimary : undefined}>
                          {pickupDateObj ? format(pickupDateObj, 'EEE, MMM d') : 'Select date'}
                        </p>
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-md border border-[#e5e7eb] shadow-[0_12px_40px_-8px_rgba(0,0,0,0.18)]" align="start">
                    <CalendarPicker
                      mode="single"
                      selected={pickupDateObj}
                      onSelect={(d) => d && setPickupDate(d.toISOString().split('T')[0])}
                      disabled={(d) => d < todayDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <button type="button" className="md:col-span-2 px-3 py-2.5 rounded-md border-2 flex items-center gap-2.5 text-left hover:border-[#cbd5e1] transition-colors" style={{ ...tk.inputSurface, borderColor: 'hsl(var(--border))' }}>
                      <Calendar className="h-4 w-4 shrink-0" style={{ color: accent }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wide" style={tk.textMuted}>Drop-off</p>
                        <p className={cn("text-sm truncate", !dropoffDateObj && "text-muted-foreground")} style={dropoffDateObj ? tk.textPrimary : undefined}>
                          {dropoffDateObj ? format(dropoffDateObj, 'EEE, MMM d') : 'Select date'}
                        </p>
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-md border border-[#e5e7eb] shadow-[0_12px_40px_-8px_rgba(0,0,0,0.18)]" align="start">
                    <CalendarPicker
                      mode="single"
                      selected={dropoffDateObj}
                      onSelect={(d) => d && setDropoffDate(d.toISOString().split('T')[0])}
                      disabled={(d) => d < minReturnDateObj}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <button type="button" className="md:col-span-1 px-2 py-2.5 rounded-md border-2 flex items-center gap-2 text-left hover:border-[#cbd5e1] transition-colors" style={{ ...tk.inputSurface, borderColor: 'hsl(var(--border))' }}>
                      <Users className="h-4 w-4 shrink-0" style={{ color: accent }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wide" style={tk.textMuted}>Pax</p>
                        <p className="text-sm truncate" style={tk.textPrimary}>{passengers}</p>
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-3 rounded-md border border-[#e5e7eb] shadow-[0_12px_40px_-8px_rgba(0,0,0,0.18)]" align="start">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium" style={tk.textPrimary}>Passengers</span>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setPassengers(p => Math.max(1, p - 1))}
                          className="h-8 w-8 rounded-md border border-border hover:bg-muted text-base font-bold">−</button>
                        <span className="w-6 text-center text-sm font-semibold" style={tk.textPrimary}>{passengers}</span>
                        <button type="button" onClick={() => setPassengers(p => Math.min(20, p + 1))}
                          className="h-8 w-8 rounded-md border border-border hover:bg-muted text-base font-bold">+</button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <div className="sm:col-span-2 md:col-span-2 flex items-center justify-center">
                  <button
                    className="h-11 px-8 rounded-md font-bold text-sm inline-flex items-center justify-center gap-2 transition-all hover:brightness-95 tracking-tight"
                    style={{ backgroundColor: accent, color: '#ffffff' }}
                    onClick={() => { setSearchActive(true); vehiclesRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
                  >
                    <Search className="h-4 w-4" /> Search
                  </button>
                </div>
              </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ MEMBER PROMO BANNER ═══════════════ */}
      <section className="pt-16 pb-4" style={tk.surface}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-md border-2 p-4 flex flex-wrap items-center justify-between gap-3" style={{ backgroundColor: EXP.brandSoftBg, borderColor: accent }}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md flex items-center justify-center text-white font-bold shrink-0" style={{ backgroundColor: accent }}>
                <BadgePercent className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-extrabold" style={tk.textPrimary}>Sign in, save 10% or more</p>
                <p className="text-xs mt-0.5" style={tk.textBody}>Members get access to exclusive Genius prices on selected vehicles and tours.</p>
              </div>
            </div>
            <Link to={`/agency/${slug}/contact`}
              className="inline-flex items-center gap-1 text-sm font-bold px-4 h-9 rounded-md border-2 transition-colors hover:bg-white"
              style={{ color: accent, borderColor: accent }}>
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════ TRUST STRIP ═══════════════ */}
      <section className="py-4" style={tk.surface}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-3">
          {TRUST_ITEMS.map((item) => (
            <div key={item.title} className="flex items-start gap-3 p-3 rounded-md border" style={{ ...tk.surface, ...tk.border }}>
              <div className="h-9 w-9 rounded-md flex items-center justify-center shrink-0"
                style={{ backgroundColor: ts.isDark ? 'rgba(255,255,255,0.06)' : EXP.brandSoftBg, color: accent }}>
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-extrabold" style={tk.textPrimary}>{item.title}</p>
                <p className="text-xs mt-0.5 leading-relaxed" style={tk.textMuted}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ DEAL CARDS ═══════════════ */}
      <section className="py-10" style={tk.surface}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-5 gap-4 flex-wrap">
            <div>
              <h2 className={`text-2xl md:text-3xl ${ts.heroTitleClass}`} style={tk.textPrimary}>
                Deals for the weekend
              </h2>
              <p className="text-sm mt-1" style={tk.textMuted}>Save on stays for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} – {new Date(Date.now() + 2*86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.</p>
            </div>
            <Link to={`/agency/${slug}/services`} className="hidden md:inline-flex items-center gap-1 text-sm font-bold" style={{ color: accent }}>
              See all deals <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DESTINATIONS.map((dest, i) => (
              <motion.div key={dest.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="group rounded-md overflow-hidden border hover:shadow-lg transition-all duration-200 cursor-pointer"
                style={{ ...tk.surface, ...tk.border }}>
                <div className="relative h-44 overflow-hidden">
                  <img src={dest.image} alt={dest.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-sm text-[10px] font-extrabold uppercase tracking-wide"
                    style={{ backgroundColor: EXP.cta, color: EXP.ctaText }}>
                    {dest.tag}
                  </span>
                  <button className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/95 flex items-center justify-center hover:bg-white transition-colors">
                    <Heart className="h-4 w-4" style={{ color: accent }} />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-base font-extrabold mb-1 hover:underline" style={{ color: accent }}>{dest.name}</h3>
                  <p className="text-xs mb-2" style={tk.textMuted}>
                    <MapPin className="h-3 w-3 inline mr-1" />{dest.location} · {dest.nights} nights
                  </p>
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="px-1.5 py-0.5 rounded-sm text-[11px] font-extrabold text-white" style={{ backgroundColor: accent }}>{dest.rating}</span>
                    <span className="text-xs font-bold" style={tk.textPrimary}>Excellent</span>
                    <span className="text-xs" style={tk.textMuted}>· {dest.reviews.toLocaleString()} reviews</span>
                  </div>
                  <div className="flex items-end justify-between pt-2 border-t" style={tk.border}>
                    <div>
                      <p className="text-[10px] line-through" style={tk.textMuted}>${Math.round(dest.price * 1.25)}</p>
                      <p className="text-xl font-extrabold leading-tight" style={tk.textPrimary}>
                        ${dest.price}
                      </p>
                      <p className="text-[10px]" style={tk.textMuted}>per person · taxes incl.</p>
                    </div>
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" style={{ color: accent }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ VEHICLE LISTINGS ═══════════════ */}
      <section ref={vehiclesRef} className="py-10 scroll-mt-8" style={tk.surfaceAlt}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {searchActive && (pickupLocation || pickupDate || dropoffLocation || dropoffDate) && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 rounded-xl border flex flex-wrap items-center gap-3 text-sm"
              style={{ ...tk.surface, ...tk.border }}>
              <MapPin className="h-4 w-4" style={{ color: accent }} />
              <span style={tk.textPrimary}><strong>Pick-up:</strong> {pickupLocation || 'Any'}{pickupDate ? ` · ${pickupDate}` : ''}</span>
              <span style={tk.textFaint}>→</span>
              <span style={tk.textPrimary}><strong>Drop-off:</strong> {dropoffLocation || 'Any'}{dropoffDate ? ` · ${dropoffDate}` : ''}</span>
              <button onClick={() => { setSearchActive(false); setPickupLocation(''); setPickupDate(''); setDropoffLocation(''); setDropoffDate(''); }} className="ml-auto text-xs font-bold underline" style={{ color: accent }}>Clear</button>
            </motion.div>
          )}

          <div className="flex items-end justify-between mb-5 gap-4 flex-wrap">
            <div>
              <h2 className={`text-2xl md:text-3xl ${ts.heroTitleClass}`} style={tk.textPrimary}>Top vehicles in {agency.city}</h2>
              <p className="text-sm mt-1" style={tk.textMuted}><span className="font-bold" style={tk.textPrimary}>{filteredVehicles.length}</span> available · sorted by our top picks</p>
            </div>
          </div>

          <div className="flex gap-6">
            <VehicleFilterSidebar vehicles={vehicles} filters={filters} onChange={setFilters} buttonColor={accent} className="hidden lg:block w-64 shrink-0 sticky top-24 self-start" />

            <div className="flex-1 min-w-0">
              {vehiclesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-2xl border overflow-hidden" style={{ ...tk.surface, ...tk.border }}>
                      <Skeleton className="h-44 w-full" />
                      <div className="p-4 space-y-2"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-9 w-full mt-2" /></div>
                    </div>
                  ))}
                </div>
              ) : filteredVehicles.length === 0 ? (
                <div className="text-center py-20 rounded-2xl border" style={{ ...tk.surface, ...tk.border, ...tk.textMuted }}>
                  <Car className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">{hasAnyFilter(filters) ? 'No vehicles match your filters.' : 'No vehicles available right now.'}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredVehicles.map((vehicle, i) => {
                    const mv = vehicle as MarketplaceVehicle;
                    return (
                      <motion.div key={vehicle.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                        className="rounded-md border overflow-hidden hover:shadow-lg transition-all duration-200 group relative"
                        style={{ ...tk.surface, ...tk.border }}>
                        {mv.agency_name && !mv.is_own && (
                          <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-black/75 text-white text-[10px] font-bold">
                            {mv.agency_logo_url ? <img src={mv.agency_logo_url} alt="" className="h-4 w-4 rounded-full object-cover" /> : <Briefcase className="h-3 w-3" />}
                            via {mv.agency_name}
                          </div>
                        )}
                        {vehicle.photo_url ? (
                          <img src={vehicle.photo_url} alt={`${vehicle.brand} ${vehicle.model}`} className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="h-40 flex items-center justify-center" style={tk.surfaceAlt}><Car className="h-12 w-12" style={tk.textFaint} /></div>
                        )}
                        <div className="p-4">
                          <h4 className="font-extrabold text-base leading-tight hover:underline" style={{ color: accent }}>{vehicle.brand} {vehicle.model}</h4>
                          <p className="text-[11px] mt-0.5" style={tk.textMuted}>{vehicle.year}</p>
                          <div className="flex items-center gap-1.5 mt-2">
                            <span className="px-1.5 py-0.5 rounded-sm text-[11px] font-extrabold text-white" style={{ backgroundColor: accent }}>4.7</span>
                            <span className="text-xs font-bold" style={tk.textPrimary}>Very good</span>
                            <span className="text-xs" style={tk.textMuted}>· 450+ reviews</span>
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
                                  <p className="text-xl font-extrabold leading-tight" style={tk.textPrimary}>{vehicle.display_price_per_km}€<span className="text-xs font-normal" style={tk.textMuted}> /km</span></p>
                                </>
                              ) : vehicle.daily_rate ? (
                                <>
                                  <p className="text-[10px] line-through" style={tk.textMuted}>{Math.round(vehicle.daily_rate * 1.2).toLocaleString()}€</p>
                                  <p className="text-xl font-extrabold leading-tight" style={tk.textPrimary}>{vehicle.daily_rate.toLocaleString()}€<span className="text-xs font-normal" style={tk.textMuted}> /day</span></p>
                                  <p className="text-[10px]" style={tk.textMuted}>Incl. taxes & fees</p>
                                </>
                              ) : (
                                <p className="text-sm" style={tk.textMuted}>Contact</p>
                              )}
                            </div>
                            <Button size="sm" className="rounded-md text-xs font-extrabold h-9 px-4 hover:brightness-95"
                              style={{ backgroundColor: accent, color: '#ffffff' }}
                              onClick={() => setBookingVehicle(mv)}>
                              {cfg.cta_text || 'See availability'}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
              <div className="text-center mt-10">
                <Link to={`/agency/${slug}/fleet`} className="inline-flex items-center gap-1 text-sm font-bold hover:gap-2 transition-all" style={{ color: accent }}>
                  View entire fleet <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ INSPIRATION CTA ═══════════════ */}
      <section className="py-10" style={tk.surface}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-md overflow-hidden relative h-[260px] md:h-[320px]" style={{ backgroundColor: EXP.brandDeep }}>
            <div className="absolute inset-0 overflow-hidden">
              <img src={adventureMountain} alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
            </div>
            <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${EXP.brandDeep} 0%, ${EXP.brandDeep}66 100%)` }} />
            <div className="relative h-full flex flex-col justify-center px-8 md:px-14 max-w-xl">
              <p className="text-xs font-extrabold uppercase tracking-widest mb-3" style={{ color: EXP.cta }}><Plane className="h-3.5 w-3.5 inline mr-1" /> Plan ahead</p>
              <h2 className={`text-white text-2xl md:text-4xl leading-tight ${ts.heroTitleClass}`}>Where to next?</h2>
              <p className="text-white/85 mt-2 text-sm md:text-base">Discover top destinations and member-only offers from {agency.name}.</p>
              <Link to={`/agency/${slug}/services`} className="mt-5 w-fit">
                <Button className="rounded-md font-extrabold gap-2 h-11 px-6 text-sm hover:brightness-95"
                  style={{ backgroundColor: EXP.cta, color: EXP.ctaText }}>
                  Explore destinations <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
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

export default StorefrontHome;
