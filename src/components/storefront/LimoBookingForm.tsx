import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, Crown, Truck, AlertCircle, MessageCircle, CalendarIcon, Shield, Plus, Trash2, Clock4, Clock8, Users, Search, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StorefrontConfig, Agency } from '@/types/agency';
import { LIMO_CATEGORIES, LimoCategory } from '@/hooks/use-service-pricing';
import { getVehicleClassImage } from '@/lib/vehicle-class-images';

const LIMO_CATEGORY_ICONS: Record<LimoCategory, React.ElementType> = {
  economy: Car,
  business: Car,
  first_class: Crown,
  van: Truck,
  suv: Shield,
};

const DEFAULT_LIMO_MULTIPLIERS: Record<LimoCategory, number> = {
  economy: 0.7,
  business: 1,
  first_class: 2.4,
  van: 1.6,
  suv: 1.6,
};

type DayType = 'full' | 'half'; // full = 10h, half = 8h

interface ItineraryStop {
  city: string;
  days: number;
  dayType: DayType;
  pickupDate?: Date;
  dropoffDate?: Date;
  pickupTime?: string;
}

interface Props {
  agency: Agency;
  config: StorefrontConfig;
  buttonColor: string;
  variant?: 'full' | 'hero';
  hideItineraryFields?: boolean;
  initialCities?: string[];
  initialPax?: number;
  initialPackage?: DayType;
  initialStart?: string;
  initialEnd?: string;
  onSearch?: (payload: {
    pickup?: string;
    dropoff?: string;
    start?: string;
    end?: string;
    pax?: number;
    package?: DayType;
    cities?: string[];
    vehicleClass?: string;
  }) => void;
}

const LimoBookingForm = ({ agency, config, buttonColor, variant = 'full', onSearch, hideItineraryFields, initialCities, initialPax, initialPackage, initialStart, initialEnd }: Props) => {
  const cityRates = config.limo_city_rates ?? [];
  const legacyMultipliers = config.limo_category_multipliers ?? DEFAULT_LIMO_MULTIPLIERS;

  // Build effective vehicle classes: prefer new limo_vehicle_classes, fall back to legacy single-per-category
  const vehicleClasses = useMemo(() => {
    if (config.limo_vehicle_classes && config.limo_vehicle_classes.length > 0) {
      return config.limo_vehicle_classes;
    }
    return [
      { category: 'economy' as const, label: 'Economy', seats: 3, multiplier: legacyMultipliers.economy ?? 0.7 },
      { category: 'business' as const, label: 'Business Sedan', seats: 3, multiplier: legacyMultipliers.business ?? 1 },
      { category: 'first_class' as const, label: 'First Class', seats: 3, multiplier: legacyMultipliers.first_class ?? 2.4 },
      { category: 'van' as const, label: 'Business Van', seats: 7, multiplier: legacyMultipliers.van ?? 1.6 },
      { category: 'suv' as const, label: 'Luxury SUV', seats: 5, multiplier: legacyMultipliers.suv ?? 1.6 },
    ];
  }, [config.limo_vehicle_classes, legacyMultipliers]);

  const hasItineraryPricing = cityRates.length > 0;
  const availableCities = cityRates.map(cr => cr.city);

  // Time slots every 30 minutes
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (const m of [0, 30]) {
        slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }
    return slots;
  }, []);

  // Selected class index within vehicleClasses
  const [selectedClassIdx, setSelectedClassIdx] = useState(0);
  const selectedClass = vehicleClasses[selectedClassIdx] ?? vehicleClasses[0];
  const selectedCategory: LimoCategory = selectedClass?.category ?? 'business';
  const [pax, setPax] = useState<number>(initialPax && initialPax > 0 ? initialPax : 1);

  const [itinerary, setItinerary] = useState<ItineraryStop[]>(() => {
    const parsedStart = initialStart ? new Date(initialStart) : undefined;
    const parsedEnd = initialEnd ? new Date(initialEnd) : undefined;
    const validStart = parsedStart && !isNaN(parsedStart.getTime()) ? parsedStart : undefined;
    const validEnd = parsedEnd && !isNaN(parsedEnd.getTime()) ? parsedEnd : undefined;
    const pickupTime = validStart
      ? `${String(validStart.getHours()).padStart(2, '0')}:${String(validStart.getMinutes()).padStart(2, '0')}`
      : '09:00';
    const computeDays = (a?: Date, b?: Date) => {
      if (!a || !b) return 1;
      const ms = b.getTime() - a.getTime();
      if (ms < 0) return 1;
      return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)) + 1);
    };
    if (initialCities && initialCities.length > 0) {
      const n = initialCities.length;
      return initialCities.map((c, i) => {
        const isFirst = i === 0;
        const isLast = i === n - 1;
        const pickupDate = isFirst ? validStart : undefined;
        const dropoffDate = isLast ? validEnd : undefined;
        return {
          city: c,
          days: n === 1 ? computeDays(validStart, validEnd) : 1,
          dayType: initialPackage ?? 'full',
          pickupTime,
          pickupDate,
          dropoffDate,
        };
      });
    }
    return [{
      city: cityRates[0]?.city ?? '',
      days: computeDays(validStart, validEnd),
      dayType: initialPackage ?? 'full',
      pickupTime,
      pickupDate: validStart,
      dropoffDate: validEnd,
    }];
  });

  const addStop = () => setItinerary(p => {
    const last = p[p.length - 1];
    return [...p, { city: availableCities[0] ?? '', days: 1, dayType: 'full', pickupDate: last?.dropoffDate, pickupTime: last?.pickupTime ?? '09:00' }];
  });
  const removeStop = (idx: number) => itinerary.length > 1 && setItinerary(p => p.filter((_, i) => i !== idx));
  const updateStop = (idx: number, updates: Partial<ItineraryStop>) =>
    setItinerary(p => {
      const arr = p.map((d, i) => {
        if (i !== idx) return d;
        const next = { ...d, ...updates };
        if (next.pickupDate && next.dropoffDate) {
          const ms = next.dropoffDate.getTime() - next.pickupDate.getTime();
          if (ms >= 0) next.days = Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)) + 1);
          if (next.dropoffDate < next.pickupDate) next.dropoffDate = undefined;
        }
        return next;
      });
      // Cascade: each subsequent stop's pickup = previous stop's dropoff
      for (let i = idx; i < arr.length - 1; i++) {
        const prev = arr[i];
        const curr = arr[i + 1];
        if (prev.dropoffDate) {
          const newPickup = prev.dropoffDate;
          const newDropoff = curr.dropoffDate && curr.dropoffDate >= newPickup ? curr.dropoffDate : undefined;
          let newDays = curr.days;
          if (newDropoff) {
            const ms = newDropoff.getTime() - newPickup.getTime();
            newDays = Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)) + 1);
          }
          arr[i + 1] = { ...curr, pickupDate: newPickup, dropoffDate: newDropoff, days: newDays };
        }
      }
      return arr;
    });

  // Per-stop base price (no multiplier); multiplier applied to subtotal → total
  const catMult = selectedClass?.multiplier ?? 1;
  const breakdown = useMemo(() => {
    return itinerary.map(stop => {
      const rate = cityRates.find(cr => cr.city === stop.city);
      if (!rate) return { city: stop.city, days: stop.days, dayType: stop.dayType, perDay: 0, price: 0 };
      const perDay = stop.dayType === 'full' ? rate.full_day_rate : rate.half_day_rate;
      return { city: stop.city, days: stop.days, dayType: stop.dayType, perDay, price: perDay * stop.days };
    });
  }, [itinerary, cityRates]);

  const subtotal = breakdown.reduce((s, b) => s + b.price, 0);
  const total = Math.round(subtotal * catMult);
  const totalDays = itinerary.reduce((s, d) => s + d.days, 0);

  // Per-city day counts and any cities exceeding their max_days cap
  const cityDayCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const d of itinerary) counts[d.city] = (counts[d.city] ?? 0) + d.days;
    return counts;
  }, [itinerary]);

  const exceededCities = useMemo(() => {
    return cityRates
      .filter(cr => cr.max_days && (cityDayCounts[cr.city] ?? 0) > cr.max_days)
      .map(cr => ({ city: cr.city, used: cityDayCounts[cr.city] ?? 0, max: cr.max_days! }));
  }, [cityRates, cityDayCounts]);

  const handleWhatsApp = () => {
    if (!config.whatsapp_number) return;
    const catLabel = selectedClass?.label ?? LIMO_CATEGORIES.find(c => c.id === selectedCategory)?.label;
    const plan = breakdown
      .map((d, i) => {
        const stop = itinerary[i];
        const pu = stop.pickupDate ? `${format(stop.pickupDate, 'PPP')}${stop.pickupTime ? ` at ${stop.pickupTime}` : ''}` : 'TBD';
        const dr = stop.dropoffDate ? format(stop.dropoffDate, 'PPP') : 'TBD';
        return `  Stop ${i + 1}: ${d.city} — ${pu} → ${dr} (${d.days} day${d.days !== 1 ? 's' : ''} × ${d.dayType === 'full' ? '10h' : '8h'}, €${d.perDay}/day) = €${d.price}`;
      })
      .join('\n');
    const multLine = catMult !== 1 ? `\n✖️ ${catLabel} multiplier: × ${catMult}` : '';
    const msg = `Hello ${agency.name}!\n\nI'd like to book a Limo Service:\n🚗 Category: ${catLabel}\n👥 Passengers: ${pax}\n\n📋 Itinerary (${totalDays} day${totalDays !== 1 ? 's' : ''}):\n${plan}\n\nSubtotal: €${subtotal}${multLine}\n💰 Total: €${total}\n\nPlease confirm availability.`;
    const url = `https://wa.me/${config.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleSearch = () => {
    const firstStop = itinerary[0];
    const lastStop = itinerary[itinerary.length - 1];
    onSearch?.({
      pickup: firstStop?.city,
      dropoff: lastStop && lastStop !== firstStop ? lastStop.city : firstStop?.city,
      start: firstStop?.pickupDate
        ? `${format(firstStop.pickupDate, 'yyyy-MM-dd')}${firstStop.pickupTime ? `T${firstStop.pickupTime}` : ''}`
        : undefined,
      end: lastStop?.dropoffDate ? format(lastStop.dropoffDate, 'yyyy-MM-dd') : undefined,
      pax,
      package: firstStop?.dayType,
      cities: itinerary.map(stop => stop.city).filter(Boolean),
      vehicleClass: selectedClass?.label,
    });
  };

  if (variant === 'hero') {
    const firstStop = itinerary[0];
    const lastStop = itinerary[itinerary.length - 1];

    return (
      <div className="space-y-1.5 p-1.5">
        {itinerary.map((stop, idx) => (
          <div key={idx} className="grid grid-cols-1 gap-1.5 items-stretch md:[grid-template-columns:repeat(12,minmax(0,1fr))]">
            {/* City */}
            <div className="md:col-span-4 px-3 py-0.5 rounded-md border border-input bg-background min-w-0 flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0" style={{ color: buttonColor }} />
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-wide leading-tight text-muted-foreground">Stop {idx + 1}</p>
                <Select value={stop.city} onValueChange={(v) => updateStop(idx, { city: v })}>
                  <SelectTrigger className="h-7 text-xs border-0 px-0 bg-transparent shadow-none focus:ring-0">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cityRates.map(cr => (
                      <SelectItem key={cr.city} value={cr.city}>
                        {cr.city}{cr.country ? ` · ${cr.country}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {itinerary.length > 1 && (
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeStop(idx)}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              )}
            </div>

            {/* Pickup date */}
            <Popover>
              <PopoverTrigger asChild>
                <button type="button" disabled={idx > 0} className="md:col-span-2 px-3 py-0.5 rounded-md border border-input bg-background flex items-center gap-2 text-left transition-colors hover:bg-accent disabled:opacity-70 disabled:hover:bg-background">
                  <CalendarIcon className="h-4 w-4 shrink-0" style={{ color: buttonColor }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-wide leading-tight text-muted-foreground">Pickup</p>
                    <p className={cn("text-xs truncate", !stop.pickupDate && "text-muted-foreground")}>
                      {stop.pickupDate ? format(stop.pickupDate, 'EEE, MMM d') : (idx > 0 ? 'Auto' : 'Select')}
                    </p>
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={stop.pickupDate} onSelect={(d) => updateStop(idx, { pickupDate: d })} disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>

            {/* Drop-off date */}
            <Popover>
              <PopoverTrigger asChild>
                <button type="button" className="md:col-span-2 px-3 py-0.5 rounded-md border border-input bg-background flex items-center gap-2 text-left transition-colors hover:bg-accent">
                  <CalendarIcon className="h-4 w-4 shrink-0" style={{ color: buttonColor }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-wide leading-tight text-muted-foreground">Drop-off</p>
                    <p className={cn("text-xs truncate", !stop.dropoffDate && "text-muted-foreground")}>
                      {stop.dropoffDate ? format(stop.dropoffDate, 'EEE, MMM d') : 'Select'}
                    </p>
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={stop.dropoffDate} onSelect={(d) => updateStop(idx, { dropoffDate: d })} disabled={(d) => d < (stop.pickupDate ?? new Date(new Date().setHours(0, 0, 0, 0)))} initialFocus className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>

            {/* Hours */}
            <div className="md:col-span-2 px-2 py-0.5 rounded-md border border-input bg-background">
              <p className="text-[9px] font-bold uppercase tracking-wide leading-tight text-muted-foreground">Hours</p>
              <div className="mt-0.5 flex gap-1">
                <button type="button" onClick={() => updateStop(idx, { dayType: 'half' })} className={cn("h-6 px-2 rounded-md border text-xs font-bold", stop.dayType === 'half' ? 'text-foreground' : 'text-muted-foreground')} style={stop.dayType === 'half' ? { borderColor: buttonColor, color: buttonColor } : undefined}>8h</button>
                <button type="button" onClick={() => updateStop(idx, { dayType: 'full' })} className={cn("h-6 px-2 rounded-md border text-xs font-bold", stop.dayType === 'full' ? 'text-foreground' : 'text-muted-foreground')} style={stop.dayType === 'full' ? { borderColor: buttonColor, color: buttonColor } : undefined}>10h</button>
              </div>
            </div>

            {/* Days display */}
            <div className="md:col-span-2 px-2 py-0.5 rounded-md border border-input bg-background flex items-center gap-2">
              <Clock4 className="h-4 w-4 shrink-0" style={{ color: buttonColor }} />
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wide leading-tight text-muted-foreground">Days</p>
                <p className="text-xs font-semibold">{stop.days}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Footer row: add city + pax + search */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-1.5 items-stretch pt-0.5">
          <button
            type="button"
            onClick={addStop}
            className="md:col-span-3 px-3 py-0.5 rounded-md border border-input bg-background flex items-center gap-2 text-left transition-colors hover:bg-accent"
          >
            <Plus className="h-4 w-4 shrink-0" style={{ color: buttonColor }} />
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-wide leading-tight text-muted-foreground">Itinerary</p>
              <p className="text-xs font-semibold">Add city</p>
            </div>
          </button>

          <div className="md:col-span-3 px-3 py-0.5 rounded-md border border-input bg-background flex items-center gap-2">
            <Users className="h-4 w-4 shrink-0" style={{ color: buttonColor }} />
            <div className="flex-1">
              <p className="text-[9px] font-bold uppercase tracking-wide leading-tight text-muted-foreground">Passengers</p>
              <div className="mt-0.5 flex items-center gap-1">
                <button type="button" onClick={() => setPax(p => Math.max(1, p - 1))} className="h-6 w-6 rounded-md border text-xs font-bold">−</button>
                <span className="w-5 text-center text-sm font-semibold">{pax}</span>
                <button type="button" onClick={() => setPax(p => Math.min(20, p + 1))} className="h-6 w-6 rounded-md border text-xs font-bold">+</button>
              </div>
            </div>
          </div>

          <div className="md:col-span-6 flex items-stretch">
            <button
              type="button"
              onClick={handleSearch}
              className="w-full rounded-md font-bold text-sm inline-flex items-center justify-center gap-2 transition-all hover:brightness-95 text-primary-foreground"
              style={{ backgroundColor: buttonColor }}
            >
              <Search className="h-4 w-4" /> Search Limo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-border bg-card space-y-6 rounded-2xl p-6 md:p-8 shadow-lg"
      >
        <div className="text-center mb-2">
          <h3 className="text-xl font-bold">Book Your Chauffeur</h3>
          <p className="text-sm text-muted-foreground mt-1">Build your itinerary — 1 city or many, 8h or 10h per day</p>
        </div>

        {!hasItineraryPricing ? (
          <div className="rounded-xl border border-muted bg-muted/10 p-4 text-center">
            <AlertCircle className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">City pricing not configured</p>
            <p className="text-xs text-muted-foreground mt-1">Please contact us directly for a quote.</p>
            {config.whatsapp_number && (
              <Button variant="outline" size="sm" className="mt-3 gap-1" onClick={handleWhatsApp}>
                <MessageCircle className="h-3.5 w-3.5" /> Contact Us
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* City stops with day count */}
            {!hideItineraryFields && (
            <div className="space-y-2">
              <Label className="text-xs font-medium">Itinerary ({totalDays} day{totalDays !== 1 ? 's' : ''})</Label>
              {itinerary.map((stop, idx) => {
                return (
                  <div key={idx} className="p-3 rounded-lg border border-border bg-muted/20 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-muted-foreground w-14 shrink-0">Stop {idx + 1}</span>
                      <Select value={stop.city} onValueChange={(v) => updateStop(idx, { city: v, days: 1 })}>
                        <SelectTrigger className="h-9 text-xs flex-1 min-w-[140px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {cityRates.map(cr => (
                            <SelectItem key={cr.city} value={cr.city}>
                              {cr.city}{cr.country ? ` · ${cr.country}` : ''}{cr.max_days ? ` (max ${cr.max_days}d)` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {itinerary.length > 1 && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeStop(idx)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            disabled={idx > 0}
                            className={cn("w-full justify-start text-left font-normal h-9 text-xs", !stop.pickupDate && "text-muted-foreground")}
                          >
                            <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                            {stop.pickupDate ? format(stop.pickupDate, "MMM d, yyyy") : <span>{idx > 0 ? 'Auto from prev' : 'Pickup date'}</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={stop.pickupDate} onSelect={(d) => updateStop(idx, { pickupDate: d })} disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus className="p-3 pointer-events-auto" />
                        </PopoverContent>
                      </Popover>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-9 text-xs", !stop.dropoffDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                            {stop.dropoffDate ? format(stop.dropoffDate, "MMM d, yyyy") : <span>Drop-off date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar mode="single" selected={stop.dropoffDate} onSelect={(d) => updateStop(idx, { dropoffDate: d })} disabled={(d) => d < (stop.pickupDate ?? new Date(new Date().setHours(0, 0, 0, 0)))} initialFocus className="p-3 pointer-events-auto" />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        {stop.pickupDate && stop.dropoffDate
                          ? `${stop.days} day${stop.days !== 1 ? 's' : ''}`
                          : 'Select dates'}
                      </span>
                      <div className="flex gap-1 ml-auto">
                      <button
                        onClick={() => updateStop(idx, { dayType: 'half' })}
                        className={cn(
                          "flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all border",
                          stop.dayType === 'half' ? 'shadow-sm text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                        )}
                        style={stop.dayType === 'half' ? { borderColor: buttonColor, color: buttonColor } : undefined}
                      >
                        <Clock4 className="h-3 w-3" /> 8h
                      </button>
                      <button
                        onClick={() => updateStop(idx, { dayType: 'full' })}
                        className={cn(
                          "flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all border",
                          stop.dayType === 'full' ? 'shadow-sm text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                        )}
                        style={stop.dayType === 'full' ? { borderColor: buttonColor, color: buttonColor } : undefined}
                      >
                        <Clock8 className="h-3 w-3" /> 10h
                      </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              <Button variant="outline" size="sm" className="text-xs w-full" onClick={addStop}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add City
              </Button>
              {exceededCities.length > 0 && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-2.5 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <div className="text-[11px] text-destructive">
                    {exceededCities.map(e => (
                      <p key={e.city}>
                        <strong>{e.city}</strong>: {e.used} days selected, max allowed is {e.max}.
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
            )}

            {!hideItineraryFields && <Separator />}

            {/* Vehicle Class (grouped by category) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <Label className="text-xs font-medium">Vehicle Class</Label>
                <div className="flex items-center gap-2">
                  <Label className="text-xs font-medium flex items-center gap-1">
                    <Users className="h-3 w-3" /> Passengers
                  </Label>
                  <div className="flex items-center gap-2 h-9 rounded-md border border-input px-2">
                    <button type="button" onClick={() => setPax(p => Math.max(1, p - 1))}
                      className="h-6 w-6 rounded-md border border-border hover:bg-muted text-xs font-bold">−</button>
                    <span className="w-6 text-center text-sm font-semibold">{pax}</span>
                    <button type="button" onClick={() => setPax(p => Math.min(20, p + 1))}
                      className="h-6 w-6 rounded-md border border-border hover:bg-muted text-xs font-bold">+</button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {vehicleClasses
                  .map((vc, idx) => ({ ...vc, idx }))
                  .filter(vc => vc.seats >= pax)
                  .map((vc) => {
                    const isSelected = selectedClassIdx === vc.idx;
                    const catMeta = LIMO_CATEGORIES.find(c => c.id === vc.category);
                    const rowTotal = Math.round(subtotal * (vc.multiplier ?? 1));
                    return (
                      <button
                        key={vc.idx}
                        onClick={() => setSelectedClassIdx(vc.idx)}
                        className={`group relative flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                          isSelected ? 'shadow-md bg-muted/40' : 'border-border hover:border-muted-foreground/30 hover:bg-muted/20'
                        }`}
                        style={isSelected ? { borderColor: buttonColor } : undefined}
                      >
                        <div className="h-16 w-24 shrink-0 rounded-lg bg-muted/30 flex items-center justify-center overflow-hidden">
                          <img
                            src={vc.image_url || getVehicleClassImage(vc.category)}
                            alt={vc.label || vc.category}
                            loading="lazy"
                            className="h-full w-full object-contain transition-transform group-hover:scale-105"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{vc.label || `${catMeta?.label} ${vc.seats}p`}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">{catMeta?.label ?? vc.category}</p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-1">
                            <Users className="h-3 w-3" /> {vc.seats}
                            <span className="text-muted-foreground/40">·</span>
                            {subtotal > 0 ? (
                              <span className="font-semibold tabular-nums" style={isSelected ? { color: buttonColor } : undefined}>€{rowTotal}</span>
                            ) : (
                              <span className="tabular-nums">{vc.multiplier}×</span>
                            )}
                          </p>
                        </div>
                        {isSelected && (
                          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: buttonColor }} />
                        )}
                      </button>
                    );
                  })}
              </div>
              {vehicleClasses.filter(vc => vc.seats >= pax).length === 0 && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-2.5 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-[11px] text-destructive">No vehicle fits {pax} passengers. Reduce passenger count or contact us.</p>
                </div>
              )}
            </div>

            {/* Price Summary with breakdown */}
            {variant === 'full' && total > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-5 space-y-3"
                style={{ backgroundColor: `${buttonColor}10` }}
              >
                <p className="text-sm text-muted-foreground text-center">
                  {selectedClass?.label ?? LIMO_CATEGORIES.find(c => c.id === selectedCategory)?.label} · {totalDays} day{totalDays !== 1 ? 's' : ''}
                </p>

                <div className="space-y-1.5 text-sm">
                  {breakdown.map((b, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        {b.city}: {b.days} × {b.dayType === 'full' ? '10h' : '8h'} (€{b.perDay}/day)
                      </span>
                      <span className="font-medium tabular-nums">€{b.price}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-border text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium tabular-nums">€{subtotal}</span>
                </div>
                {catMult !== 1 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">
                      {selectedClass?.label} multiplier
                    </span>
                    <span className="font-medium tabular-nums">× {catMult}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-3xl font-bold" style={{ color: buttonColor }}>€{total}</span>
                </div>
                <p className="text-xs text-muted-foreground text-center">Estimated price · Includes professional chauffeur</p>

                {config.whatsapp_number && (
                  <Button
                    className="w-full h-12 rounded-xl font-bold text-white gap-2 mt-2"
                    style={{ backgroundColor: '#25D366', opacity: exceededCities.length > 0 ? 0.5 : 1 }}
                    onClick={handleWhatsApp}
                    disabled={exceededCities.length > 0}
                  >
                    <MessageCircle className="h-5 w-5" /> Book via WhatsApp
                  </Button>
                )}
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default LimoBookingForm;
