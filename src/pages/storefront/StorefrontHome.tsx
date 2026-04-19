import { useOutletContext, Link, useParams } from 'react-router-dom';
import { Agency, StorefrontConfig, ServiceType, SERVICE_LABELS } from '@/types/agency';
import { motion } from 'framer-motion';
import {
  Search, MapPin, Calendar, Star, ChevronRight, Car, Building, Users, Briefcase,
  Fuel, Settings2, Navigation, Globe, Heart, ShieldCheck, BadgePercent,
  HeadphonesIcon, ArrowRight, Tag, Plane,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import StorefrontSeo from '@/components/storefront/StorefrontSeo';
import { TemplateStyles, expediaPalette } from '@/lib/template-styles';
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

  // Expedia accent — fall back to palette when agency uses default-ish color
  const EXP = expediaPalette;
  const accent = ts.isDark ? buttonColor : EXP.brand;
  const ctaBg = ts.isDark ? buttonColor : EXP.cta;
  const ctaTextColor = ts.isDark ? '#ffffff' : EXP.ctaText;

  return (
    <div>
      <StorefrontSeo
        agency={agency}
        page="home"
        fallbackTitle={agency.meta_title || `${agency.name} | ${agency.city}, ${agency.country}`}
        fallbackDescription={agency.meta_description || `Premium travel services by ${agency.name} in ${agency.city}, ${agency.country}.`}
      />

      {/* ═══════════════ HERO — Expedia style ═══════════════ */}
      <section className="relative" style={tk.surface}>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-32">
          <div className="relative rounded-3xl overflow-hidden h-[440px] md:h-[520px]">
            <img
              src={cfg.home_hero_image || defaultHeroImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              width={1920}
              height={1080}
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.45) 100%)' }} />
            <div className="relative h-full flex flex-col justify-center px-6 sm:px-12 lg:px-20 max-w-3xl">
              {(cfg as any).hero_eyebrow && (
                <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="inline-flex w-fit items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-[11px] font-bold tracking-wide mb-4"
                  style={{ color: accent }}>
                  <Tag className="h-3 w-3" /> {(cfg as any).hero_eyebrow}
                </motion.span>
              )}
              <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.05] tracking-tight">
                {cfg.hero_title || 'Your next trip starts here'}
              </motion.h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                className="mt-4 text-base md:text-lg text-white/90 max-w-xl leading-relaxed">
                {cfg.hero_subtitle || `Book vehicles, transfers, and experiences across ${agency.city} and beyond — all in one place.`}
              </motion.p>
            </div>
          </div>

          {/* Search card overlapping hero */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
            className="absolute left-4 right-4 sm:left-6 sm:right-6 lg:left-8 lg:right-8 -bottom-2 max-w-7xl mx-auto">
            <div className="rounded-2xl shadow-2xl border overflow-hidden" style={{ ...tk.surface, ...tk.border }}>
              {/* Service tabs */}
              {enabledServices.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 px-4 pt-3 border-b" style={tk.border}>
                  {enabledServices.map((service) => {
                    const Icon = SERVICE_ICONS[service] ?? Car;
                    const isActive = activeService === service;
                    return (
                      <button
                        key={service}
                        onClick={() => setActiveService(service)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-all relative"
                        style={isActive
                          ? { color: accent, backgroundColor: 'transparent' }
                          : { ...tk.textBody, backgroundColor: 'transparent' }}
                      >
                        <Icon className="h-4 w-4" />
                        {SERVICE_LABELS[service] ?? service}
                        {isActive && (
                          <span className="absolute left-3 right-3 -bottom-px h-0.5 rounded-full" style={{ backgroundColor: accent }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Search fields row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 p-3">
                <div className="md:col-span-3 px-3 py-2.5 rounded-xl border flex items-center gap-2.5" style={{ ...tk.inputSurface, ...tk.inputBorder }}>
                  <MapPin className="h-4 w-4 shrink-0" style={{ color: accent }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide" style={tk.textMuted}>Pick-up</p>
                    <LocationAutocomplete value={pickupLocation} onChange={setPickupLocation} placeholder={agency.city} locations={agencyLocations} agencyCity={agency.city} />
                  </div>
                </div>
                <div className="md:col-span-3 px-3 py-2.5 rounded-xl border flex items-center gap-2.5" style={{ ...tk.inputSurface, ...tk.inputBorder }}>
                  <MapPin className="h-4 w-4 shrink-0" style={{ color: accent }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide" style={tk.textMuted}>Drop-off</p>
                    <LocationAutocomplete value={dropoffLocation} onChange={setDropoffLocation} placeholder="Same as pick-up" locations={agencyLocations} agencyCity={agency.city} />
                  </div>
                </div>
                <div className="md:col-span-2 px-3 py-2.5 rounded-xl border flex items-center gap-2.5" style={{ ...tk.inputSurface, ...tk.inputBorder }}>
                  <Calendar className="h-4 w-4 shrink-0" style={{ color: accent }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide" style={tk.textMuted}>Pick-up date</p>
                    <input type="date" value={pickupDate} min={todayStr} onChange={(e) => setPickupDate(e.target.value)}
                      className="text-sm bg-transparent focus:outline-none w-full" style={tk.textPrimary} />
                  </div>
                </div>
                <div className="md:col-span-2 px-3 py-2.5 rounded-xl border flex items-center gap-2.5" style={{ ...tk.inputSurface, ...tk.inputBorder }}>
                  <Calendar className="h-4 w-4 shrink-0" style={{ color: accent }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide" style={tk.textMuted}>Drop-off date</p>
                    <input type="date" value={dropoffDate} min={minReturnDate} onChange={(e) => setDropoffDate(e.target.value)}
                      className="text-sm bg-transparent focus:outline-none w-full" style={tk.textPrimary} />
                  </div>
                </div>
                <button
                  className="md:col-span-2 h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:brightness-95"
                  style={{ backgroundColor: ctaBg, color: ctaTextColor }}
                  onClick={() => { setSearchActive(true); vehiclesRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
                >
                  <Search className="h-4 w-4" /> Search
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ MEMBER PROMO BANNER ═══════════════ */}
      <section className="pt-20 pb-6" style={tk.surface}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl p-5 md:p-6 flex flex-wrap items-center justify-between gap-4" style={{ backgroundColor: ts.isDark ? 'rgba(255,255,255,0.04)' : EXP.brandSoftBg }}>
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-xl flex items-center justify-center text-white font-bold shrink-0" style={{ backgroundColor: accent }}>
                <BadgePercent className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold" style={tk.textPrimary}>Members save 10% or more</p>
                <p className="text-xs mt-0.5" style={tk.textBody}>Sign in to unlock instant savings on selected vehicles and tours.</p>
              </div>
            </div>
            <Link to={`/agency/${slug}/contact`}
              className="text-sm font-bold underline-offset-4 hover:underline" style={{ color: accent }}>
              Sign in or join free →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════ TRUST STRIP ═══════════════ */}
      <section className="py-6" style={tk.surface}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-3">
          {TRUST_ITEMS.map((item) => (
            <div key={item.title} className="flex items-start gap-3 p-4 rounded-xl border" style={{ ...tk.surface, ...tk.border }}>
              <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: ts.isDark ? 'rgba(255,255,255,0.06)' : EXP.brandSoftBg, color: accent }}>
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold" style={tk.textPrimary}>{item.title}</p>
                <p className="text-xs mt-0.5 leading-relaxed" style={tk.textMuted}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ DEAL CARDS ═══════════════ */}
      <section className="py-16" style={tk.surface}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight" style={tk.textPrimary}>
                Last-minute weekend deals
              </h2>
              <p className="text-sm mt-1.5" style={tk.textMuted}>Hand-picked offers for short, unforgettable getaways.</p>
            </div>
            <Link to={`/agency/${slug}/services`} className="hidden md:inline-flex items-center gap-1 text-sm font-bold" style={{ color: accent }}>
              See all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {DESTINATIONS.map((dest, i) => (
              <motion.div key={dest.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="group rounded-2xl overflow-hidden border hover:shadow-xl transition-all duration-300 cursor-pointer"
                style={{ ...tk.surface, ...tk.border }}>
                <div className="relative h-52 overflow-hidden">
                  <img src={dest.image} alt={dest.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-bold"
                    style={{ backgroundColor: ctaBg, color: ctaTextColor }}>
                    {dest.tag}
                  </span>
                  <button className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/95 flex items-center justify-center hover:bg-white transition-colors">
                    <Heart className="h-4 w-4" style={{ color: accent }} />
                  </button>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-1 mb-1.5">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold" style={tk.textPrimary}>{dest.rating}</span>
                    <span className="text-xs" style={tk.textMuted}>({dest.reviews.toLocaleString()})</span>
                  </div>
                  <h3 className="text-base font-bold mb-1" style={tk.textPrimary}>{dest.name}</h3>
                  <p className="text-xs mb-3" style={tk.textMuted}>
                    <MapPin className="h-3 w-3 inline mr-1" />{dest.location} · {dest.nights} nights
                  </p>
                  <div className="flex items-baseline justify-between pt-3 border-t" style={tk.border}>
                    <div>
                      <p className="text-[10px]" style={tk.textMuted}>From</p>
                      <p className="text-xl font-extrabold" style={tk.textPrimary}>
                        ${dest.price}
                        <span className="text-xs font-normal" style={tk.textMuted}> /person</span>
                      </p>
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
      <section ref={vehiclesRef} className="py-16 scroll-mt-8" style={tk.surfaceAlt}>
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

          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight" style={tk.textPrimary}>Top vehicles in {agency.city}</h2>
              <p className="text-sm mt-1.5" style={tk.textMuted}>{filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? 's' : ''} available now.</p>
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
                        className="rounded-2xl border overflow-hidden hover:shadow-xl transition-all duration-300 group relative"
                        style={{ ...tk.surface, ...tk.border }}>
                        {mv.agency_name && !mv.is_own && (
                          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-sm text-white text-[10px] font-semibold">
                            {mv.agency_logo_url ? <img src={mv.agency_logo_url} alt="" className="h-4 w-4 rounded-full object-cover" /> : <Briefcase className="h-3 w-3" />}
                            via {mv.agency_name}
                          </div>
                        )}
                        {vehicle.photo_url ? (
                          <img src={vehicle.photo_url} alt={`${vehicle.brand} ${vehicle.model}`} className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="h-44 flex items-center justify-center" style={tk.surfaceAlt}><Car className="h-12 w-12" style={tk.textFaint} /></div>
                        )}
                        <div className="p-5">
                          <div className="flex items-center gap-1 mb-1">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="text-xs font-bold" style={tk.textPrimary}>4.7</span>
                            <span className="text-xs" style={tk.textMuted}>(450+)</span>
                          </div>
                          <h4 className="font-bold text-sm" style={tk.textPrimary}>{vehicle.brand} {vehicle.model} {vehicle.year}</h4>
                          <div className="flex items-center gap-3 mt-2 text-[11px]" style={tk.textMuted}>
                            <span className="flex items-center gap-1"><Fuel className="h-3 w-3" /> {vehicle.fuel_type || 'Petrol'}</span>
                            <span className="flex items-center gap-1"><Settings2 className="h-3 w-3" /> {vehicle.transmission || 'Manual'}</span>
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {vehicle.seats || 5}</span>
                          </div>
                          <div className="flex items-center justify-between mt-4 pt-3 border-t" style={tk.border}>
                            <div>
                              <p className="text-[10px]" style={tk.textMuted}>From</p>
                              {vehicle.display_price_per_km ? (
                                <p className="text-lg font-extrabold" style={tk.textPrimary}>{vehicle.display_price_per_km}€<span className="text-xs font-normal" style={tk.textMuted}> /km</span></p>
                              ) : vehicle.daily_rate ? (
                                <p className="text-lg font-extrabold" style={tk.textPrimary}>{vehicle.daily_rate.toLocaleString()}€<span className="text-xs font-normal" style={tk.textMuted}> /day</span></p>
                              ) : (
                                <p className="text-sm" style={tk.textMuted}>Contact</p>
                              )}
                            </div>
                            <Button size="sm" className="rounded-lg text-xs font-bold h-9 px-4 hover:brightness-95"
                              style={{ backgroundColor: ctaBg, color: ctaTextColor }}
                              onClick={() => setBookingVehicle(mv)}>
                              {cfg.cta_text || 'Reserve'}
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
      <section className="py-16" style={tk.surface}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl overflow-hidden relative h-[280px] md:h-[340px]">
            <img src={adventureMountain} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)' }} />
            <div className="relative h-full flex flex-col justify-center px-8 md:px-14 max-w-xl">
              <Plane className="h-7 w-7 text-white mb-4" />
              <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">Where to next?</h2>
              <p className="text-white/85 mt-3 text-sm md:text-base">Get inspired with curated trips, hidden gems, and exclusive member offers from {agency.name}.</p>
              <Link to={`/agency/${slug}/services`} className="mt-6 w-fit">
                <Button className="rounded-xl font-bold gap-2 h-12 px-7 text-sm hover:brightness-95"
                  style={{ backgroundColor: ctaBg, color: ctaTextColor }}>
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
