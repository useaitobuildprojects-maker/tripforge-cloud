import { useOutletContext, Link, useParams, useNavigate } from 'react-router-dom';
import { Agency, StorefrontConfig, ServiceType, SERVICE_LABELS } from '@/types/agency';
import { motion } from 'framer-motion';
import {
  Search, MapPin, Calendar, Star, ChevronRight, Car, Building, Users, Briefcase,
  Fuel, Settings2, Navigation, Globe, Heart, ShieldCheck, BadgePercent,
  HeadphonesIcon, ArrowRight, Plane, UserCheck, Crown, Clock,
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
import LimoBookingForm from '@/components/storefront/LimoBookingForm';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const SERVICE_ICONS: Record<ServiceType, React.ElementType> = {
  car_rental: Car,
  apartment: Building,
  transfer: UserCheck,
  limo_tour: Crown,
  city_tour: Globe,
};

const HERO_SEARCH_COPY: Record<ServiceType, {
  originLabel: string;
  originPlaceholder: string;
  destinationLabel: string;
  destinationPlaceholder: string;
  startDateLabel: string;
  startDatePlaceholder: string;
  endDateLabel: string;
  endDatePlaceholder: string;
  countLabel: string;
  cta: string;
}> = {
  car_rental: {
    originLabel: 'Pick-up',
    originPlaceholder: 'Pick-up location',
    destinationLabel: 'Drop-off',
    destinationPlaceholder: 'Same as pick-up',
    startDateLabel: 'Pick-up',
    startDatePlaceholder: 'Select date',
    endDateLabel: 'Drop-off',
    endDatePlaceholder: 'Select date',
    countLabel: 'Pax',
    cta: 'Search Car Rental',
  },
  apartment: {
    originLabel: 'Destination',
    originPlaceholder: 'City or area',
    destinationLabel: 'Location',
    destinationPlaceholder: 'Any area',
    startDateLabel: 'Check-in',
    startDatePlaceholder: 'Select date',
    endDateLabel: 'Check-out',
    endDatePlaceholder: 'Select date',
    countLabel: 'Guests',
    cta: 'Search Apartments',
  },
  transfer: {
    originLabel: 'Pickup',
    originPlaceholder: 'Airport, hotel, or address',
    destinationLabel: 'Drop-off',
    destinationPlaceholder: 'Destination address',
    startDateLabel: 'Date',
    startDatePlaceholder: 'Select date',
    endDateLabel: 'Time',
    endDatePlaceholder: 'Select time',
    countLabel: 'Pax',
    cta: 'Search Transfer',
  },
  limo_tour: {
    originLabel: 'Service city',
    originPlaceholder: 'Choose city',
    destinationLabel: 'Package',
    destinationPlaceholder: '8h chauffeur day',
    startDateLabel: 'Pickup date',
    startDatePlaceholder: 'Select date',
    endDateLabel: 'Drop-off date',
    endDatePlaceholder: 'Select date',
    countLabel: 'Pax',
    cta: 'Open Limo Service',
  },
  city_tour: {
    originLabel: 'City',
    originPlaceholder: 'Tour city',
    destinationLabel: 'Pickup point',
    destinationPlaceholder: 'Hotel or meeting point',
    startDateLabel: 'Tour date',
    startDatePlaceholder: 'Select date',
    endDateLabel: 'Duration',
    endDatePlaceholder: 'Select duration',
    countLabel: 'Pax',
    cta: 'Search City Tour',
  },
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
  const navigate = useNavigate();
  const { agency, templateStyles: ts, buttonColor, config: cfg } = useOutletContext<{ agency: Agency; templateStyles: TemplateStyles; buttonColor: string; config: StorefrontConfig }>();
  const tk = ts.tokens;
  const enabledServices = agency.services ?? [];
  const { data: vehicles = [], isLoading: vehiclesLoading } = useMarketplaceVehicles(agency.id, agency.commission_rate);

  const [activeService, setActiveService] = useState<ServiceType>(enabledServices[0] ?? 'car_rental');
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [dropoffLocation, setDropoffLocation] = useState('');
  const [dropoffDate, setDropoffDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [passengers, setPassengers] = useState<number>(1);
  const [limoPackage, setLimoPackage] = useState<'half' | 'full'>('half');
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

  const handleSearch = (overrides?: {
    pickup?: string;
    dropoff?: string;
    start?: string;
    end?: string;
    pax?: number;
    package?: string;
    cities?: string[];
    vehicleClass?: string;
  }) => {
    setSearchActive(true);
    const params = new URLSearchParams();
    const searchPickup = overrides?.pickup ?? pickupLocation;
    const searchDropoff = overrides?.dropoff ?? dropoffLocation;
    const isTimeService = activeService === 'transfer' || activeService === 'city_tour';
    const searchStart = overrides?.start ?? (isTimeService && pickupDate && pickupTime ? `${pickupDate}T${pickupTime}` : pickupDate);
    const searchEnd = overrides?.end ?? dropoffDate;
    const searchPax = overrides?.pax ?? passengers;
    const searchPackage = overrides?.package ?? (activeService === 'limo_tour' ? limoPackage : undefined);
    if (searchPickup) params.set('pickup', searchPickup);
    if (searchDropoff) params.set('dropoff', searchDropoff);
    if (searchStart) params.set('start', searchStart);
    if (searchEnd) params.set('end', searchEnd);
    if (searchPax) params.set('pax', String(searchPax));
    if (searchPackage) params.set('package', searchPackage);
    if (overrides?.cities?.length) params.set('cities', overrides.cities.join('|'));
    if (overrides?.vehicleClass) params.set('class', overrides.vehicleClass);
    const qs = params.toString();
    const chauffeur = activeService === 'transfer' || activeService === 'limo_tour' || activeService === 'city_tour';
    const base = chauffeur ? `/agency/${slug}/search/${activeService}` : `/agency/${slug}/services/${activeService}`;
    navigate(`${base}${qs ? `?${qs}` : ''}`);
  };

  const formatLocalDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const todayStr = useMemo(() => formatLocalDate(new Date()), []);
  const minReturnDate = useMemo(() => {
    if (!pickupDate) return todayStr;
    const d = new Date(pickupDate);
    d.setDate(d.getDate() + 1);
    return formatLocalDate(d);
  }, [pickupDate, todayStr]);

  const todayDate = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);
  const pickupDateObj = pickupDate ? new Date(pickupDate) : undefined;
  const dropoffDateObj = dropoffDate ? new Date(dropoffDate) : undefined;
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (const m of [0, 30]) {
        slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }
    return slots;
  }, []);
  const minReturnDateObj = useMemo(() => {
    if (!pickupDateObj) return todayDate;
    const d = new Date(pickupDateObj); d.setDate(d.getDate() + 1); return d;
  }, [pickupDateObj, todayDate]);

  // Pull colors from the active template's palette so switching templates
  // visually changes hero / CTA / accent treatments across the storefront.
  const EXP = ts.palette;
  const accent = buttonColor || EXP.brand;
  const ctaBg = buttonColor || EXP.cta;
  const ctaTextColor = EXP.ctaText;
  const typo = ts.typography;
  const shape = ts.shape;
  const headingFontStyle: React.CSSProperties = { fontFamily: typo.heading };
  const searchCopy = HERO_SEARCH_COPY[activeService];
  const limoPackageLabel = limoPackage === 'half' ? '8h chauffeur day' : '10h chauffeur day';

  return (
    <div>
      <StorefrontSeo
        agency={agency}
        page="home"
        fallbackTitle={agency.meta_title || `${agency.name} | ${agency.city}, ${agency.country}`}
        fallbackDescription={agency.meta_description || `Premium travel services by ${agency.name} in ${agency.city}, ${agency.country}.`}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'TravelAgency',
            name: agency.name,
            url: agency.domain ? `https://${agency.domain}` : undefined,
            image: agency.logo_url || agency.og_image || undefined,
            address: {
              '@type': 'PostalAddress',
              addressLocality: agency.city,
              addressCountry: agency.country,
            },
            email: agency.contact_email || undefined,
          },
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: agency.name,
            url: agency.domain ? `https://${agency.domain}` : undefined,
          },
        ]}
      />

      {/* ═══════════════ HERO — Booking.com style ═══════════════ */}
      <section className="relative" style={{ backgroundColor: EXP.brandDeep, ...(ts.heroStyle ?? {}) }}>
        {/* Background image with strong navy wash */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={cfg.home_hero_image || defaultHeroImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-30 sm:opacity-40"
            width={1920}
            height={1080}
          />
          {/* Base brand wash — deeper on mobile for readability */}
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${EXP.brandDeep}E8 0%, ${EXP.brandDeep}F0 50%, ${EXP.brandDeep} 100%)` }} />
          {/* Mobile top-anchor: extra density behind headline text */}
          <div className="absolute inset-x-0 top-0 h-[55%] sm:hidden" style={{ background: `linear-gradient(180deg, ${EXP.brandDeep} 0%, ${EXP.brandDeep}80 60%, transparent 100%)` }} />
          {/* Luxury editorial vignette — draws eye to center, darkens edges */}
          <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 85% 70% at 50% 35%, transparent 35%, ${EXP.brandDeep}90 100%)` }} />
        </div>

        <div className={cn(
          "relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-10 sm:pt-10",
          "pb-6 sm:pb-8",
          activeService === 'limo_tour' ? "md:pb-60" : "md:pb-32"
        )}>
          <motion.p
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.24em] sm:tracking-[0.28em] text-white/85 mb-3 sm:mb-4"
          >
            {agency.city} · Curated travel
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className={`text-white text-[2.25rem] sm:text-5xl lg:text-[3.75rem] leading-[1.05] tracking-tight max-w-[18rem] sm:max-w-3xl ${ts.heroTitleClass}`}
            style={headingFontStyle}
          >
            {cfg.hero_title || `Find your next trip in ${agency.city}`}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
            className="mt-3 sm:mt-5 text-sm sm:text-base md:text-lg leading-relaxed text-white/80 max-w-[20rem] sm:max-w-xl font-light"
          >
            {cfg.hero_subtitle || `Search low prices on vehicles, transfers and tours across ${agency.city}.`}
          </motion.p>

          {/* Search card sitting at bottom of hero, with yellow border */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="relative mt-6 sm:mt-5 md:mt-0 md:absolute md:left-6 md:right-6 lg:left-8 lg:right-8 md:-bottom-7 max-w-7xl mx-auto">
            <div className="shadow-2xl border" style={{ ...tk.surface, ...tk.border, borderRadius: shape.cardRadius }}>
              <div style={{ ...tk.surface, borderRadius: `calc(${shape.cardRadius} - 1px)` }}>
              {/* Service tabs */}
              {enabledServices.length > 0 && (
                <div className="flex flex-nowrap overflow-x-auto items-center gap-1.5 sm:gap-2 px-2 sm:px-3 pt-2 sm:pt-3 pb-1.5 sm:pb-1 scrollbar-hide">
                  {enabledServices.map((service) => {
                    const Icon = SERVICE_ICONS[service] ?? Car;
                    const isActive = activeService === service;
                    return (
                      <button
                        key={service}
                        onClick={() => setActiveService(service)}
                        className="inline-flex shrink-0 items-center gap-1.5 sm:gap-2 px-3 sm:px-4 h-8 sm:h-9 text-xs sm:text-sm font-semibold rounded-full border-2 transition-all whitespace-nowrap"
                        style={isActive
                          ? { color: '#ffffff', backgroundColor: accent, borderColor: accent }
                          : { ...tk.textBody, backgroundColor: 'transparent', borderColor: 'hsl(var(--border))' }}
                      >
                        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span>{SERVICE_LABELS[service] ?? service}</span>
                      </button>
                    );
                  })}
                </div>
              )}
              {/* Search fields row */}
              {activeService === 'limo_tour' ? (
                <div className="p-3">
                  <LimoBookingForm agency={agency} config={cfg} buttonColor={buttonColor} variant="hero" onSearch={handleSearch} />
                </div>
              ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-2 sm:gap-1.5 p-2 sm:p-1.5 sm:pb-3">
                {activeService !== 'city_tour' && (
                  <div className="min-h-12 sm:min-h-0 md:col-span-3 px-3 py-2 sm:py-0.5 rounded-md border-2 flex items-center gap-2.5" style={{ ...tk.inputSurface, borderColor: 'hsl(var(--border))' }}>
                    <MapPin className="h-4 w-4 shrink-0" style={{ color: accent }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-wide leading-tight" style={tk.textMuted}>{searchCopy.originLabel}</p>
                      <LocationAutocomplete value={pickupLocation} onChange={setPickupLocation} placeholder={searchCopy.originPlaceholder} locations={agencyLocations} agencyCity={agency.city} agencyCountry={agency.country} accentColor={accent} />
                    </div>
                  </div>
                )}
                <div className={cn("min-h-12 sm:min-h-0 px-3 py-2 sm:py-0.5 rounded-md border-2 flex items-center gap-2.5", activeService === 'city_tour' ? "md:col-span-5" : "md:col-span-2")} style={{ ...tk.inputSurface, borderColor: 'hsl(var(--border))' }}>
                  <MapPin className="h-4 w-4 shrink-0" style={{ color: accent }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-wide leading-tight" style={tk.textMuted}>{activeService === 'city_tour' ? 'Tour location' : searchCopy.destinationLabel}</p>
                    <LocationAutocomplete value={dropoffLocation} onChange={setDropoffLocation} placeholder={searchCopy.destinationPlaceholder} locations={agencyLocations} agencyCity={agency.city} agencyCountry={agency.country} accentColor={accent} />
                  </div>
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <button type="button" className="min-h-12 sm:min-h-0 md:col-span-2 px-3 py-2 sm:py-0.5 rounded-md border-2 flex items-center gap-2.5 text-left hover:border-[#cbd5e1] transition-colors" style={{ ...tk.inputSurface, borderColor: 'hsl(var(--border))' }}>
                      <Calendar className="h-4 w-4 shrink-0" style={{ color: accent }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-wide leading-tight" style={tk.textMuted}>{searchCopy.startDateLabel}</p>
                        <p className={cn("text-sm truncate", !pickupDateObj && "text-muted-foreground")} style={pickupDateObj ? tk.textPrimary : undefined}>
                          {pickupDateObj ? format(pickupDateObj, 'EEE, MMM d') : searchCopy.startDatePlaceholder}
                        </p>
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-md border border-[#e5e7eb] shadow-[0_12px_40px_-8px_rgba(0,0,0,0.18)]" align="start">
                    <CalendarPicker
                      mode="single"
                      selected={pickupDateObj}
                      onSelect={(d) => d && setPickupDate(formatLocalDate(d))}
                      disabled={(d) => d < todayDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                      modifiersStyles={{ selected: { backgroundColor: accent, color: '#ffffff' } }}
                    />
                  </PopoverContent>
                </Popover>
                {activeService === 'transfer' || activeService === 'city_tour' ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button type="button" className="min-h-12 sm:min-h-0 md:col-span-2 px-3 py-2 sm:py-0.5 rounded-md border-2 flex items-center gap-2.5 text-left hover:border-[#cbd5e1] transition-colors" style={{ ...tk.inputSurface, borderColor: 'hsl(var(--border))' }}>
                        <Clock className="h-4 w-4 shrink-0" style={{ color: accent }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-bold uppercase tracking-wide leading-tight" style={tk.textMuted}>{searchCopy.endDateLabel}</p>
                          <p className={cn("text-sm truncate tabular-nums", !pickupTime && "text-muted-foreground")} style={pickupTime ? tk.textPrimary : undefined}>
                            {pickupTime || searchCopy.endDatePlaceholder}
                          </p>
                        </div>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-44 p-2 rounded-md border border-[#e5e7eb] shadow-[0_12px_40px_-8px_rgba(0,0,0,0.18)]" align="start">
                      <div className="max-h-64 overflow-y-auto grid grid-cols-2 gap-1">
                        {timeSlots.map(t => {
                          const selected = t === pickupTime;
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setPickupTime(t)}
                              className={cn(
                                "h-8 rounded-md text-xs font-semibold tabular-nums transition-colors",
                                selected ? "text-white" : "hover:bg-muted"
                              )}
                              style={selected ? { backgroundColor: accent } : tk.textBody}
                            >
                              {t}
                            </button>
                          );
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                <Popover>
                  <PopoverTrigger asChild>
                    <button type="button" className="min-h-12 sm:min-h-0 md:col-span-2 px-3 py-2 sm:py-0.5 rounded-md border-2 flex items-center gap-2.5 text-left hover:border-[#cbd5e1] transition-colors" style={{ ...tk.inputSurface, borderColor: 'hsl(var(--border))' }}>
                      <Calendar className="h-4 w-4 shrink-0" style={{ color: accent }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-wide leading-tight" style={tk.textMuted}>{searchCopy.endDateLabel}</p>
                        <p className={cn("text-sm truncate", !dropoffDateObj && "text-muted-foreground")} style={dropoffDateObj ? tk.textPrimary : undefined}>
                          {dropoffDateObj ? format(dropoffDateObj, 'EEE, MMM d') : searchCopy.endDatePlaceholder}
                        </p>
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-md border border-[#e5e7eb] shadow-[0_12px_40px_-8px_rgba(0,0,0,0.18)]" align="start">
                    <CalendarPicker
                      mode="single"
                      selected={dropoffDateObj}
                      onSelect={(d) => d && setDropoffDate(formatLocalDate(d))}
                      disabled={(d) => d < minReturnDateObj}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                      modifiersStyles={{ selected: { backgroundColor: accent, color: '#ffffff' } }}
                    />
                  </PopoverContent>
                </Popover>
                )}
                <Popover>
                  <PopoverTrigger asChild>
                    <button type="button" className="min-h-12 sm:min-h-0 md:col-span-1 px-3 sm:px-2 py-2 sm:py-0.5 rounded-md border-2 flex items-center gap-2 text-left hover:border-[#cbd5e1] transition-colors" style={{ ...tk.inputSurface, borderColor: 'hsl(var(--border))' }}>
                      <Users className="h-4 w-4 shrink-0" style={{ color: accent }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-wide leading-tight" style={tk.textMuted}>{searchCopy.countLabel}</p>
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
                <div className="sm:col-span-2 md:col-span-2 flex items-stretch">
                  <button
                    className="w-full min-h-12 sm:min-h-0 px-6 py-3 sm:py-0 rounded-md font-bold text-sm inline-flex items-center justify-center gap-2 transition-all hover:brightness-95 tracking-tight"
                    style={{ backgroundColor: accent, color: '#ffffff' }}
                    onClick={() => handleSearch()}
                  >
                    <Search className="h-4 w-4" />
                    <span>Search</span>
                  </button>
                </div>
              </div>
              )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ TRUST STRIP ═══════════════ */}
      <section className="pt-16 md:pt-24 pb-4" style={tk.surface}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {TRUST_ITEMS.map((item) => (
            <div key={item.title} className="flex items-start gap-4 p-5 rounded-md border" style={{ ...tk.surface, ...tk.border }}>
              <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: ts.isDark ? 'rgba(255,255,255,0.06)' : EXP.brandSoftBg, color: accent }}>
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[15px] font-semibold tracking-tight" style={{ ...tk.textPrimary, fontFamily: typo.heading }}>{item.title}</p>
                <p className="text-xs mt-1 leading-relaxed font-light" style={tk.textMuted}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ DEAL CARDS ═══════════════ */}
      <section className="py-16 md:py-20" style={tk.surface}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
            <div className="max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] mb-3" style={{ color: accent }}>Editor's picks</p>
              <h2 className={`text-3xl md:text-4xl tracking-tight leading-tight ${ts.heroTitleClass}`} style={{ ...tk.textPrimary, fontFamily: typo.heading }}>
                Deals for the weekend
              </h2>
              <p className="text-sm mt-3 font-light leading-relaxed" style={tk.textMuted}>A curated selection of stays for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} – {new Date(Date.now() + 2*86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.</p>
            </div>
            <Link to={`/agency/${slug}/services`} className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] hover:gap-2.5 transition-all" style={{ color: accent }}>
              See all deals <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {DESTINATIONS.map((dest, i) => (
              <motion.div key={dest.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="group rounded-md overflow-hidden border hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                style={{ ...tk.surface, ...tk.border }}>
                <div className="relative h-56 overflow-hidden">
                  <img src={dest.image} alt={dest.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-sm text-[10px] font-semibold uppercase tracking-[0.18em]"
                    style={{ backgroundColor: EXP.cta, color: EXP.ctaText }}>
                    {dest.tag}
                  </span>
                  <button aria-label={`Save ${dest.name} to favorites`} className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/95 flex items-center justify-center hover:bg-white shadow-md transition-colors">
                    <Heart className="h-4 w-4" style={{ color: accent }} />
                  </button>
                </div>
                <div className="p-6">
                  <h3 className="text-xl tracking-tight mb-1.5 group-hover:underline underline-offset-4 decoration-1" style={{ ...tk.textPrimary, fontFamily: typo.heading }}>{dest.name}</h3>
                  <p className="text-xs mb-3 font-light" style={tk.textMuted}>
                    <MapPin className="h-3 w-3 inline mr-1" />{dest.location} · {dest.nights} nights
                  </p>
                  <div className="flex items-center gap-1.5 mb-4">
                    <Star className="h-3.5 w-3.5 fill-current" style={{ color: accent }} />
                    <span className="text-xs font-semibold" style={tk.textPrimary}>{dest.rating}</span>
                    <span className="text-xs font-light" style={tk.textMuted}>· {dest.reviews.toLocaleString()} reviews</span>
                  </div>
                  <div className="flex items-end justify-between pt-4 border-t" style={tk.border}>
                    <div>
                      <p className="text-[10px] line-through font-light" style={tk.textMuted}>${Math.round(dest.price * 1.25)}</p>
                      <p className="text-2xl leading-tight tracking-tight" style={{ ...tk.textPrimary, fontFamily: typo.heading }}>
                        ${dest.price}
                      </p>
                      <p className="text-[10px] font-light mt-0.5" style={tk.textMuted}>per person · taxes incl.</p>
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
      <section ref={vehiclesRef} className="py-16 md:py-20 scroll-mt-8" style={tk.surfaceAlt}>
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

          <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
            <div className="max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] mb-3" style={{ color: accent }}>The fleet</p>
              <h2 className={`text-3xl md:text-4xl tracking-tight leading-tight ${ts.heroTitleClass}`} style={{ ...tk.textPrimary, fontFamily: typo.heading }}>Top vehicles in {agency.city}</h2>
              <p className="text-sm mt-3 font-light" style={tk.textMuted}><span className="font-medium" style={tk.textPrimary}>{filteredVehicles.length}</span> available · sorted by our top picks</p>
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
                        <div className="p-5">
                          <h3 className="text-lg tracking-tight leading-tight group-hover:underline underline-offset-4 decoration-1" style={{ ...tk.textPrimary, fontFamily: typo.heading }}>{vehicle.brand} {vehicle.model}</h3>
                          <p className="text-[11px] mt-0.5 font-light" style={tk.textMuted}>{vehicle.year}</p>
                          <div className="flex items-center gap-1.5 mt-2">
                            <Star className="h-3.5 w-3.5 fill-current" style={{ color: accent }} />
                            <span className="text-xs font-semibold" style={tk.textPrimary}>4.7</span>
                            <span className="text-xs font-light" style={tk.textMuted}>· 450+ reviews</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-[11px] font-light" style={tk.textMuted}>
                            <span className="flex items-center gap-1"><Fuel className="h-3 w-3" /> {vehicle.fuel_type || 'Petrol'}</span>
                            <span className="flex items-center gap-1"><Settings2 className="h-3 w-3" /> {vehicle.transmission || 'Manual'}</span>
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {vehicle.seats || 5}</span>
                          </div>
                          <p className="text-[11px] mt-3 font-medium" style={{ color: 'hsl(155 50% 36%)' }}>✓ Free cancellation</p>
                          <div className="flex items-end justify-between mt-4 pt-4 border-t" style={tk.border}>
                            <div>
                              {vehicle.daily_rate ? (
                                <>
                                  <p className="text-[10px] line-through font-light" style={tk.textMuted}>{Math.round(vehicle.daily_rate * 1.2).toLocaleString()}€</p>
                                  <p className="text-2xl tracking-tight leading-tight" style={{ ...tk.textPrimary, fontFamily: typo.heading }}>{vehicle.daily_rate.toLocaleString()}€<span className="text-xs font-light" style={tk.textMuted}> /day</span></p>
                                  <p className="text-[10px] font-light mt-0.5" style={tk.textMuted}>Incl. taxes & fees</p>
                                </>
                              ) : (
                                <p className="text-sm font-light" style={tk.textMuted}>Contact</p>
                              )}
                            </div>
                            <Button size="sm" className="rounded-md text-xs font-semibold tracking-wide h-10 px-5 hover:brightness-95"
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
              <div className="text-center mt-12">
                <Link to={`/agency/${slug}/fleet`} className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] hover:gap-2.5 transition-all" style={{ color: accent }}>
                  View entire fleet <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ INSPIRATION CTA ═══════════════ */}
      <section className="py-16 md:py-20" style={tk.surface}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-md overflow-hidden relative h-[320px] md:h-[420px]" style={{ backgroundColor: EXP.brandDeep }}>
            <div className="absolute inset-0 overflow-hidden">
              <img src={adventureMountain} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
            </div>
            <div className="absolute inset-0" style={{ background: `linear-gradient(90deg, ${EXP.brandDeep}F2 0%, ${EXP.brandDeep}55 100%)` }} />
            <div className="relative h-full flex flex-col justify-center px-8 md:px-16 max-w-xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] mb-4" style={{ color: EXP.cta }}><Plane className="h-3.5 w-3.5 inline mr-1.5" /> Plan ahead</p>
              <h2 className={`text-white text-3xl md:text-5xl leading-[1.05] tracking-tight ${ts.heroTitleClass}`} style={headingFontStyle}>Where to next?</h2>
              <p className="text-white/80 mt-4 text-sm md:text-base font-light leading-relaxed">Discover top destinations and member-only offers from {agency.name}.</p>
              <Link to={`/agency/${slug}/services`} className="mt-7 w-fit">
                <Button className="rounded-md font-semibold tracking-wide gap-2 h-12 px-7 text-sm hover:brightness-95"
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
          pickupCity={pickupLocation || agency.city}
        />
      )}

    </div>
  );
};

export default StorefrontHome;
