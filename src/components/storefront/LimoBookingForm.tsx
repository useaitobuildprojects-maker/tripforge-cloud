import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, Crown, Truck, AlertCircle, MessageCircle, CalendarIcon, Shield, Plus, Trash2, Clock4, Clock8 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StorefrontConfig, Agency } from '@/types/agency';
import { LIMO_CATEGORIES, LimoCategory } from '@/hooks/use-service-pricing';

const LIMO_CATEGORY_ICONS: Record<LimoCategory, React.ElementType> = {
  business: Car,
  first_class: Crown,
  van: Truck,
  suv: Shield,
};

const DEFAULT_LIMO_MULTIPLIERS: Record<LimoCategory, number> = {
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
}

interface Props {
  agency: Agency;
  config: StorefrontConfig;
  buttonColor: string;
}

const LimoBookingForm = ({ agency, config, buttonColor }: Props) => {
  const cityRates = config.limo_city_rates ?? [];
  const legacyMultipliers = config.limo_category_multipliers ?? DEFAULT_LIMO_MULTIPLIERS;

  // Build effective vehicle classes: prefer new limo_vehicle_classes, fall back to legacy single-per-category
  const vehicleClasses = useMemo(() => {
    if (config.limo_vehicle_classes && config.limo_vehicle_classes.length > 0) {
      return config.limo_vehicle_classes;
    }
    return [
      { category: 'business' as const, label: 'Business Sedan', seats: 3, multiplier: legacyMultipliers.business ?? 1 },
      { category: 'first_class' as const, label: 'First Class', seats: 3, multiplier: legacyMultipliers.first_class ?? 2.4 },
      { category: 'van' as const, label: 'Business Van', seats: 7, multiplier: legacyMultipliers.van ?? 1.6 },
      { category: 'suv' as const, label: 'Luxury SUV', seats: 5, multiplier: legacyMultipliers.suv ?? 1.6 },
    ];
  }, [config.limo_vehicle_classes, legacyMultipliers]);

  const hasItineraryPricing = cityRates.length > 0;
  const availableCities = cityRates.map(cr => cr.city);

  // Selected class index within vehicleClasses
  const [selectedClassIdx, setSelectedClassIdx] = useState(0);
  const selectedClass = vehicleClasses[selectedClassIdx] ?? vehicleClasses[0];
  const selectedCategory: LimoCategory = selectedClass?.category ?? 'business';

  const [itinerary, setItinerary] = useState<ItineraryStop[]>([
    { city: cityRates[0]?.city ?? '', days: 1, dayType: 'full' },
  ]);

  const addStop = () => setItinerary(p => [...p, { city: availableCities[0] ?? '', days: 1, dayType: 'full' }]);
  const removeStop = (idx: number) => itinerary.length > 1 && setItinerary(p => p.filter((_, i) => i !== idx));
  const updateStop = (idx: number, updates: Partial<ItineraryStop>) =>
    setItinerary(p => p.map((d, i) => {
      if (i !== idx) return d;
      const next = { ...d, ...updates };
      // Auto-compute days from dates if both present
      if (next.pickupDate && next.dropoffDate) {
        const ms = next.dropoffDate.getTime() - next.pickupDate.getTime();
        if (ms >= 0) next.days = Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)) + 1);
      }
      return next;
    }));

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
        const pu = stop.pickupDate ? format(stop.pickupDate, 'PPP') : 'TBD';
        const dr = stop.dropoffDate ? format(stop.dropoffDate, 'PPP') : 'TBD';
        return `  Stop ${i + 1}: ${d.city} — ${pu} → ${dr} (${d.days} day${d.days !== 1 ? 's' : ''} × ${d.dayType === 'full' ? '10h' : '8h'}, €${d.perDay}/day) = €${d.price}`;
      })
      .join('\n');
    const multLine = catMult !== 1 ? `\n✖️ ${catLabel} multiplier: × ${catMult}` : '';
    const msg = `Hello ${agency.name}!\n\nI'd like to book a Limo Service:\n🚗 Category: ${catLabel}\n\n📋 Itinerary (${totalDays} day${totalDays !== 1 ? 's' : ''}):\n${plan}\n\nSubtotal: €${subtotal}${multLine}\n💰 Total: €${total}\n\nPlease confirm availability.`;
    const url = `https://wa.me/${config.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6 shadow-lg"
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
            <div className="space-y-2">
              <Label className="text-xs font-medium">Itinerary ({totalDays} day{totalDays !== 1 ? 's' : ''})</Label>
              {itinerary.map((stop, idx) => {
                const rate = cityRates.find(cr => cr.city === stop.city);
                const maxDays = rate?.max_days ?? 30;
                const dayOptions = Array.from({ length: maxDays }, (_, i) => i + 1);
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
                          <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-9 text-xs", !stop.pickupDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                            {stop.pickupDate ? format(stop.pickupDate, "MMM d, yyyy") : <span>Pickup date</span>}
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

            <Separator />

            {/* Vehicle Class (grouped by category) */}
            <div className="space-y-3">
              <Label className="text-xs font-medium">Vehicle Class</Label>
              {(['business', 'first_class', 'suv'] as LimoCategory[]).map((cat) => {
                const classesInCat = vehicleClasses
                  .map((vc, idx) => ({ ...vc, idx }))
                  .filter(vc => vc.category === cat);
                if (classesInCat.length === 0) return null;
                const catMeta = LIMO_CATEGORIES.find(c => c.id === cat);
                const Icon = LIMO_CATEGORY_ICONS[cat];
                return (
                  <div key={cat} className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                      <Icon className="h-3 w-3" /> {catMeta?.label ?? cat}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {classesInCat.map((vc) => {
                        const isSelected = selectedClassIdx === vc.idx;
                        return (
                          <button
                            key={vc.idx}
                            onClick={() => setSelectedClassIdx(vc.idx)}
                            className={`p-3 rounded-xl border-2 text-left transition-all ${
                              isSelected ? 'shadow-md' : 'border-border hover:border-muted-foreground/30'
                            }`}
                            style={isSelected ? { borderColor: buttonColor } : undefined}
                          >
                            <p className="text-sm font-bold">{vc.label || `${catMeta?.label} ${vc.seats}p`}</p>
                            <p className="text-[10px] text-muted-foreground">{vc.seats} seats · {vc.multiplier}×</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price Summary with breakdown */}
            {total > 0 && (
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
