import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, Crown, Truck, AlertCircle, MessageCircle, CalendarIcon, Clock, Shield, Plus, Trash2, Clock4, Clock8 } from 'lucide-react';
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

interface ItineraryDay {
  city: string;
  dayType: DayType;
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

  const [startDate, setStartDate] = useState<Date>();
  const [time, setTime] = useState('');
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([
    { city: cityRates[0]?.city ?? '', dayType: 'full' },
  ]);

  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let h = 0; h < 24; h++) for (const m of [0, 30]) slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    return slots;
  }, []);

  const addDay = () => setItinerary(p => [...p, { city: availableCities[0] ?? '', dayType: 'full' }]);
  const removeDay = (idx: number) => itinerary.length > 1 && setItinerary(p => p.filter((_, i) => i !== idx));
  const updateDay = (idx: number, updates: Partial<ItineraryDay>) =>
    setItinerary(p => p.map((d, i) => i === idx ? { ...d, ...updates } : d));

  // Per-day price breakdown using selected vehicle class multiplier
  const breakdown = useMemo(() => {
    const catMult = selectedClass?.multiplier ?? 1;
    return itinerary.map(day => {
      const rate = cityRates.find(cr => cr.city === day.city);
      if (!rate) return { city: day.city, dayType: day.dayType, price: 0 };
      const base = day.dayType === 'full' ? rate.full_day_rate : rate.half_day_rate;
      return { city: day.city, dayType: day.dayType, price: Math.round(base * catMult) };
    });
  }, [itinerary, selectedClass, cityRates]);

  const total = breakdown.reduce((s, b) => s + b.price, 0);

  const handleWhatsApp = () => {
    if (!config.whatsapp_number) return;
    const dateStr = startDate ? format(startDate, 'PPP') : 'Not specified';
    const timeStr = time || 'Not specified';
    const catLabel = selectedClass?.label ?? LIMO_CATEGORIES.find(c => c.id === selectedCategory)?.label;
    const plan = breakdown
      .map((d, i) => `  Day ${i + 1}: ${d.city} (${d.dayType === 'full' ? '10h' : '8h'}) — €${d.price}`)
      .join('\n');
    const msg = `Hello ${agency.name}!\n\nI'd like to book a Limo Service:\n📅 Starting: ${dateStr} at ${timeStr}\n🚗 Category: ${catLabel}\n\n📋 Itinerary:\n${plan}\n\n💰 Total: €${total}\n\nPlease confirm availability.`;
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
            {/* Start date & time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <CalendarIcon className="h-3.5 w-3.5" style={{ color: buttonColor }} /> Start Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-10", !startDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" style={{ color: buttonColor }} /> Pickup Time
                </Label>
                <Select value={time} onValueChange={setTime}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Select time" /></SelectTrigger>
                  <SelectContent>{timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            {/* Day-by-day plan */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Day-by-Day Itinerary</Label>
              {itinerary.map((day, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/20">
                  <span className="text-xs font-semibold text-muted-foreground w-14 shrink-0">Day {idx + 1}</span>
                  <Select value={day.city} onValueChange={(v) => updateDay(idx, { city: v })}>
                    <SelectTrigger className="h-9 text-xs flex-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {cityRates.map(cr => (
                        <SelectItem key={cr.city} value={cr.city}>
                          {cr.city}{cr.country ? ` · ${cr.country}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-1">
                    <button
                      onClick={() => updateDay(idx, { dayType: 'half' })}
                      className={cn(
                        "flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all border",
                        day.dayType === 'half' ? 'shadow-sm text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                      )}
                      style={day.dayType === 'half' ? { borderColor: buttonColor, color: buttonColor } : undefined}
                    >
                      <Clock4 className="h-3 w-3" /> 8h
                    </button>
                    <button
                      onClick={() => updateDay(idx, { dayType: 'full' })}
                      className={cn(
                        "flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all border",
                        day.dayType === 'full' ? 'shadow-sm text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                      )}
                      style={day.dayType === 'full' ? { borderColor: buttonColor, color: buttonColor } : undefined}
                    >
                      <Clock8 className="h-3 w-3" /> 10h
                    </button>
                  </div>
                  {itinerary.length > 1 && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeDay(idx)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" className="text-xs w-full" onClick={addDay}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Day
              </Button>
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
                  {selectedClass?.label ?? LIMO_CATEGORIES.find(c => c.id === selectedCategory)?.label} · {itinerary.length} day{itinerary.length !== 1 ? 's' : ''}
                </p>

                <div className="space-y-1.5 text-sm">
                  {breakdown.map((b, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <span className="text-muted-foreground">
                        Day {i + 1}: {b.city} ({b.dayType === 'full' ? '10h' : '8h'})
                      </span>
                      <span className="font-medium tabular-nums">€{b.price}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-3xl font-bold" style={{ color: buttonColor }}>€{total}</span>
                </div>
                <p className="text-xs text-muted-foreground text-center">Estimated price · Includes professional chauffeur</p>

                {config.whatsapp_number && (
                  <Button
                    className="w-full h-12 rounded-xl font-bold text-white gap-2 mt-2"
                    style={{ backgroundColor: '#25D366' }}
                    onClick={handleWhatsApp}
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
