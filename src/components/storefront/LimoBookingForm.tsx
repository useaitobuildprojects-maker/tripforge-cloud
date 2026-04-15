import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, ArrowRight, Car, Crown, Truck, Loader2, AlertCircle, MessageCircle, CalendarIcon, Clock, Timer, Route, Shield, Plus, Trash2, Sun, SunMedium } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StorefrontConfig, Agency } from '@/types/agency';
import { LIMO_CATEGORIES, LimoCategory } from '@/hooks/use-service-pricing';
import { calculateTransferPrice, TransferQuote } from '@/lib/transfer-pricing';
import { useCityPricing } from '@/hooks/use-city-pricing';
import LocationAutocomplete, { getAgencyLocations, LocationSelection } from '@/components/storefront/LocationAutocomplete';

const LIMO_CATEGORY_ICONS: Record<LimoCategory, React.ElementType> = {
  business: Car,
  first_class: Crown,
  van: Truck,
  suv: Shield,
};

// Map limo categories to transfer multipliers (business sedan = base 1x)
const LIMO_MULTIPLIERS: Record<LimoCategory, number> = {
  business: 1,
  first_class: 2.4,
  van: 1.6,
  suv: 1.6,
};

function getLimoCategoryMultiplier(_config: StorefrontConfig, cat: LimoCategory): number {
  return LIMO_MULTIPLIERS[cat] ?? 1;
}

type DayType = 'full' | 'half';

interface ItineraryDay {
  city: string;
  dayType: DayType;
}

type LimoMode = 'itinerary' | 'p2p';

interface Props {
  agency: Agency;
  config: StorefrontConfig;
  buttonColor: string;
}

const LimoBookingForm = ({ agency, config, buttonColor }: Props) => {
  const { data: cityPricing = [] } = useCityPricing(agency.id);
  const agencyLocations = useMemo(() => {
    const configLocs = config.locations;
    if (configLocs && configLocs.length > 0) {
      return configLocs.map((l, i) => ({ id: `loc-${i}`, name: l.name, type: l.type, address: l.address }));
    }
    return getAgencyLocations(agency.city, agency.country);
  }, [config.locations, agency.city, agency.country]);

  const cityRates = config.limo_city_rates ?? [];
  const multiDayDiscount = config.limo_multi_day_discount ?? 0;
  const hasItineraryPricing = cityRates.length > 0;

  const [mode, setMode] = useState<LimoMode>(hasItineraryPricing ? 'itinerary' : 'p2p');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originCoords, setOriginCoords] = useState<[number, number] | undefined>();
  const [destCoords, setDestCoords] = useState<[number, number] | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<LimoCategory>('business');
  const [startDate, setStartDate] = useState<Date>();
  const [time, setTime] = useState('');
  const [quote, setQuote] = useState<TransferQuote | null>(null);
  const [loading, setLoading] = useState(false);

  // Itinerary planner
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([{ city: cityRates[0]?.city ?? '', dayType: 'full' }]);

  const maxKm = config.limo_max_km ?? 35;

  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (const m of [0, 30]) {
        slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }
    return slots;
  }, []);

  const availableCities = cityRates.map(cr => cr.city);

  const addDay = () => {
    setItinerary(prev => [...prev, { city: availableCities[0] ?? '', dayType: 'full' }]);
  };

  const removeDay = (idx: number) => {
    if (itinerary.length <= 1) return;
    setItinerary(prev => prev.filter((_, i) => i !== idx));
  };

  const updateDay = (idx: number, updates: Partial<ItineraryDay>) => {
    setItinerary(prev => prev.map((d, i) => i === idx ? { ...d, ...updates } : d));
  };

  // Calculate itinerary price
  const itineraryPrice = useMemo(() => {
    if (!hasItineraryPricing || itinerary.length === 0) return null;

    const catMultiplier = getLimoCategoryMultiplier(config, selectedCategory);
    let total = 0;

    for (const day of itinerary) {
      const rate = cityRates.find(cr => cr.city === day.city);
      if (!rate) continue;
      const dayPrice = day.dayType === 'full' ? rate.full_day_rate : rate.half_day_rate;
      total += dayPrice * catMultiplier;
    }

    // Multi-day discount: if days > unique cities, apply discount to extra days
    const uniqueCities = new Set(itinerary.map(d => d.city)).size;
    const totalDays = itinerary.length;
    if (multiDayDiscount > 0 && totalDays > uniqueCities) {
      const extraDays = totalDays - uniqueCities;
      const discountAmount = (total / totalDays) * extraDays * (multiDayDiscount / 100);
      total -= discountAmount;
    }

    return Math.round(total);
  }, [itinerary, selectedCategory, cityRates, config, multiDayDiscount, hasItineraryPricing]);

  const hasDiscount = multiDayDiscount > 0 && itinerary.length > new Set(itinerary.map(d => d.city)).size;

  const handleGetP2PQuote = async () => {
    if (!origin || !destination) return;
    setLoading(true);
    try {
      const limoConfig: StorefrontConfig = {
        ...config,
        transfer_base_fee: config.limo_p2p_base_fee ?? config.transfer_base_fee,
        transfer_per_km_rate: config.limo_p2p_per_km_rate ?? config.transfer_per_km_rate,
      };
      const transferCategory = (selectedCategory === 'suv' || selectedCategory === 'van') ? 'first_class' as const : selectedCategory as 'economy' | 'business' | 'first_class';
      const result = await calculateTransferPrice(
        limoConfig, origin, destination, transferCategory, agency.country, cityPricing,
        originCoords, destCoords
      );
      setQuote(result);
    } catch {
      setQuote(null);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = () => {
    if (!config.whatsapp_number) return;
    const dateStr = startDate ? format(startDate, 'PPP') : 'Not specified';
    const timeStr = time || 'Not specified';

    let msg: string;
    if (mode === 'itinerary') {
      const plan = itinerary.map((d, i) => `  Day ${i + 1}: ${d.city} (${d.dayType === 'full' ? 'Full Day' : 'Half Day'})`).join('\n');
      msg = `Hello ${agency.name}!\n\nI'd like to book a Limo Service:\n📅 Starting: ${dateStr} at ${timeStr}\n🚗 Category: ${LIMO_CATEGORIES.find(c => c.id === selectedCategory)?.label}\n\n📋 Itinerary:\n${plan}\n\n💰 Estimated: €${itineraryPrice ?? 'TBD'}${hasDiscount ? ` (${multiDayDiscount}% multi-day discount applied)` : ''}\n\nPlease confirm availability.`;
    } else {
      msg = `Hello ${agency.name}!\n\nI'd like to book a Limo Service (Point-to-Point):\n📍 ${origin} → ${destination}\n📅 ${dateStr} at ${timeStr}\n🚗 Category: ${LIMO_CATEGORIES.find(c => c.id === selectedCategory)?.label}\n💰 Price: €${quote?.price ?? 'TBD'}\n\nPlease confirm availability.`;
    }
    const url = `https://wa.me/${config.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const hasP2PPricing = (config.limo_p2p_base_fee ?? config.transfer_base_fee ?? 0) > 0 || (config.limo_p2p_per_km_rate ?? config.transfer_per_km_rate ?? 0) > 0;

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6 shadow-lg"
      >
        <div className="text-center mb-2">
          <h3 className="text-xl font-bold">Book Your Chauffeur</h3>
          <p className="text-sm text-muted-foreground mt-1">Premium vehicles with professional drivers</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 p-1 rounded-xl bg-muted/50">
          {hasItineraryPricing && (
            <button
              onClick={() => { setMode('itinerary'); setQuote(null); }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all",
                mode === 'itinerary' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Timer className="h-4 w-4" /> Multi-Day Tour
            </button>
          )}
          <button
            onClick={() => { setMode('p2p'); setQuote(null); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all",
              mode === 'p2p' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Route className="h-4 w-4" /> Point-to-Point
          </button>
        </div>

        {/* Itinerary Mode — Day-by-Day Builder */}
        {mode === 'itinerary' && (
          <div className="space-y-4">
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
                      {availableCities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-1">
                    <button
                      onClick={() => updateDay(idx, { dayType: 'full' })}
                      className={cn(
                        "flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all border",
                        day.dayType === 'full' ? 'shadow-sm text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                      )}
                      style={day.dayType === 'full' ? { borderColor: buttonColor, color: buttonColor } : undefined}
                    >
                      <Sun className="h-3 w-3" /> Full
                    </button>
                    <button
                      onClick={() => updateDay(idx, { dayType: 'half' })}
                      className={cn(
                        "flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all border",
                        day.dayType === 'half' ? 'shadow-sm text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
                      )}
                      style={day.dayType === 'half' ? { borderColor: buttonColor, color: buttonColor } : undefined}
                    >
                      <SunMedium className="h-3 w-3" /> Half
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
          </div>
        )}

        {/* P2P Mode — Locations */}
        {mode === 'p2p' && (
          <>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" style={{ color: buttonColor }} /> Pickup Location
              </Label>
              <LocationAutocomplete value={origin} onChange={(v, sel?: LocationSelection) => { setOrigin(v); setOriginCoords(sel?.coords); setQuote(null); }} placeholder="Airport, hotel, or address" locations={agencyLocations} agencyCity={agency.city} agencyCountry={agency.country} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" style={{ color: buttonColor }} /> Drop-off Location
              </Label>
              <LocationAutocomplete value={destination} onChange={(v, sel?: LocationSelection) => { setDestination(v); setDestCoords(sel?.coords); setQuote(null); }} placeholder="Destination address" locations={agencyLocations} agencyCity={agency.city} agencyCountry={agency.country} />
            </div>
            {/* Date & Time for P2P */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium flex items-center gap-1.5">
                  <CalendarIcon className="h-3.5 w-3.5" style={{ color: buttonColor }} /> Date
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
                  <Clock className="h-3.5 w-3.5" style={{ color: buttonColor }} /> Time
                </Label>
                <Select value={time} onValueChange={setTime}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Select time" /></SelectTrigger>
                  <SelectContent>{timeSlots.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Category Selection */}
        <div className="space-y-3">
          <Label className="text-xs font-medium">Vehicle Category</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {LIMO_CATEGORIES.map((cat) => {
              const Icon = LIMO_CATEGORY_ICONS[cat.id];
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setQuote(null); }}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected ? 'shadow-md' : 'border-border hover:border-muted-foreground/30'
                  }`}
                  style={isSelected ? { borderColor: buttonColor } : undefined}
                >
                  <Icon className="h-6 w-6 mb-2 opacity-60" />
                  <p className="text-sm font-bold">{cat.label}</p>
                  <p className="text-[10px] text-muted-foreground">{cat.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Itinerary Mode — Price Summary */}
        {mode === 'itinerary' && hasItineraryPricing && itineraryPrice !== null && itineraryPrice > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-5 text-center space-y-3"
            style={{ backgroundColor: `${buttonColor}10` }}
          >
            <p className="text-sm text-muted-foreground">
              {LIMO_CATEGORIES.find(c => c.id === selectedCategory)?.label} · {itinerary.length} day{itinerary.length !== 1 ? 's' : ''}
            </p>
            <p className="text-3xl font-bold" style={{ color: buttonColor }}>€{itineraryPrice}</p>
            {hasDiscount && (
              <p className="text-xs font-medium" style={{ color: buttonColor }}>
                {multiDayDiscount}% multi-day discount applied!
              </p>
            )}
            <p className="text-xs text-muted-foreground">Estimated price · Different vehicle per day possible</p>

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

        {mode === 'itinerary' && !hasItineraryPricing && (
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
        )}

        {/* P2P Mode — Get Quote */}
        {mode === 'p2p' && origin && destination && origin !== destination && (
          <>
            {!quote && (
              <Button
                className="w-full h-12 rounded-xl font-bold text-white"
                style={{ backgroundColor: buttonColor }}
                onClick={handleGetP2PQuote}
                disabled={loading}
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Calculating route...</>
                ) : (
                  'Get Price Quote'
                )}
              </Button>
            )}

            {quote && quote.price > 0 && quote.distance_km && quote.distance_km > maxKm ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-destructive/20 bg-destructive/5 p-5 text-center space-y-2"
              >
                <AlertCircle className="h-5 w-5 mx-auto text-destructive" />
                <p className="text-sm font-medium">Route too long for Limo Service</p>
                <p className="text-xs text-muted-foreground">
                  This route is ~{quote.distance_km} km, but Limo P2P is limited to {maxKm} km. Please use our <strong>Transfer</strong> service instead.
                </p>
                {config.whatsapp_number && (
                  <Button variant="outline" size="sm" className="mt-2 gap-1" onClick={handleWhatsApp}>
                    <MessageCircle className="h-3.5 w-3.5" /> Contact Us
                  </Button>
                )}
              </motion.div>
            ) : quote && quote.price > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-5 text-center space-y-3"
                style={{ backgroundColor: `${buttonColor}10` }}
              >
                <p className="text-sm text-muted-foreground">
                  {origin} → {destination}
                  {quote.distance_km && ` · ~${quote.distance_km} km`}
                </p>
                <p className="text-3xl font-bold" style={{ color: buttonColor }}>€{quote.price}</p>
                <p className="text-xs text-muted-foreground">
                  {LIMO_CATEGORIES.find(c => c.id === selectedCategory)?.label} · Estimated price
                </p>
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
            ) : null}

            {quote && quote.price === 0 && (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-center">
                <AlertCircle className="h-5 w-5 mx-auto mb-2 text-destructive" />
                <p className="text-sm font-medium">
                  {quote.error === 'no_formula' && 'Pricing not configured'}
                  {quote.error === 'geocode_origin' && `Could not locate "${origin}"`}
                  {quote.error === 'geocode_destination' && `Could not locate "${destination}"`}
                  {quote.error === 'osrm_failed' && 'Could not calculate route distance'}
                  {!quote.error && 'Price unavailable for this route'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Please contact us directly for a custom quote.</p>
                {config.whatsapp_number && (
                  <Button variant="outline" size="sm" className="mt-3 gap-1" onClick={handleWhatsApp}>
                    <MessageCircle className="h-3.5 w-3.5" /> Contact Us
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default LimoBookingForm;
