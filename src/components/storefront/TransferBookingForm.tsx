import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, ArrowRight, Car, Crown, Truck, Loader2, AlertCircle, MessageCircle, CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StorefrontConfig, Agency } from '@/types/agency';
import { TRANSFER_CATEGORIES, TransferCategory } from '@/hooks/use-service-pricing';
import { calculateTransferPrice, TransferQuote } from '@/lib/transfer-pricing';
import LocationAutocomplete, { getAgencyLocations, LocationSelection } from '@/components/storefront/LocationAutocomplete';

const CATEGORY_ICONS: Record<TransferCategory, React.ElementType> = {
  economy: Car,
  business: Car,
  first_class: Crown,
};

interface Props {
  agency: Agency;
  config: StorefrontConfig;
  buttonColor: string;
}

const TransferBookingForm = ({ agency, config, buttonColor }: Props) => {
  
  const agencyLocations = useMemo(() => {
    const configLocs = config.locations;
    if (configLocs && configLocs.length > 0) {
      return configLocs.map((l, i) => ({ id: `loc-${i}`, name: l.name, type: l.type, address: l.address, fullName: l.address ? `${l.name}, ${l.address}` : l.name }));
    }
    return getAgencyLocations(agency.city, agency.country);
  }, [config.locations, agency.city, agency.country]);

  const [origin, setOrigin] = useState('');
  const [originLabel, setOriginLabel] = useState('');
  const [destination, setDestination] = useState('');
  const [destLabel, setDestLabel] = useState('');
  const [originCoords, setOriginCoords] = useState<[number, number] | undefined>();
  const [destCoords, setDestCoords] = useState<[number, number] | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<TransferCategory>('economy');
  const [quote, setQuote] = useState<TransferQuote | null>(null);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);

  const effectiveOrigin = origin;
  const effectiveDest = destination;

  // Generate time slots every 30 minutes
  const timeSlots = useMemo(() => {
    const slots: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (const m of [0, 30]) {
        slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }
    return slots;
  }, []);

  const handleGetQuote = async () => {
    if (!effectiveOrigin || !effectiveDest) return;
    setLoading(true);
    try {
      const result = await calculateTransferPrice(
        config, effectiveOrigin, effectiveDest, selectedCategory, agency.country, [],
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
    if (!quote || !config.whatsapp_number) return;
    const dateStr = date ? format(date, 'PPP') : 'Not specified';
    const timeStr = time || 'Not specified';
    const msg = `Hello ${agency.name}!\n\nI'd like to book a transfer:\n📍 ${effectiveOrigin} → ${effectiveDest}\n📅 ${dateStr} at ${timeStr}\n🚗 Category: ${TRANSFER_CATEGORIES.find(c => c.id === selectedCategory)?.label}\n📏 ${quote.distance_km ? `~${quote.distance_km} km` : ''}${quote.duration_min ? ` · ~${quote.duration_min} min` : ''}\n💰 Price: €${quote.price}\n\nPlease confirm availability.`;
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
          <h3 className="text-xl font-bold">Book Your Transfer</h3>
          <p className="text-sm text-muted-foreground mt-1">Select your route and vehicle category</p>
        </div>

        {/* Route Selection */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-3 items-end">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" style={{ color: buttonColor }} /> Pickup
            </Label>
            <LocationAutocomplete
              value={origin}
              onChange={(v, sel?: LocationSelection) => { setOrigin(v); setOriginLabel(sel?.name?.split(',')[0] || v); setOriginCoords(sel?.coords); setQuote(null); }}
              placeholder="Airport, hotel, or address"
              locations={agencyLocations}
              agencyCity={agency.city}
              agencyCountry={agency.country}
            />
          </div>

          <div className="hidden md:flex items-center justify-center pb-1">
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" style={{ color: buttonColor }} /> Drop-off
            </Label>
            <LocationAutocomplete
              value={destination}
              onChange={(v, sel?: LocationSelection) => { setDestination(v); setDestLabel(sel?.name?.split(',')[0] || v); setDestCoords(sel?.coords); setQuote(null); }}
              placeholder="Destination address"
              locations={agencyLocations}
              agencyCity={agency.city}
              agencyCountry={agency.country}
            />
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5" style={{ color: buttonColor }} /> Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-10",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" style={{ color: buttonColor }} /> Time
            </Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Category Selection */}
        <div className="space-y-3">
          <Label className="text-xs font-medium">Vehicle Category</Label>
          <div className="grid grid-cols-3 gap-3">
            {TRANSFER_CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id];
              const isSelected = selectedCategory === cat.id;
              const seats = cat.id === 'economy' ? (config.transfer_seats_economy ?? cat.defaultSeats)
                : cat.id === 'business' ? (config.transfer_seats_business ?? cat.defaultSeats)
                : (config.transfer_seats_first_class ?? cat.defaultSeats);

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
                  <p className="text-[10px] text-muted-foreground mt-0.5">{seats} seats</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Get Quote / Results */}
        {effectiveOrigin && effectiveDest && effectiveOrigin !== effectiveDest && (
          <>
              <>
                {!quote && (
                  <Button
                    className="w-full h-12 rounded-xl font-bold text-white"
                    style={{ backgroundColor: buttonColor }}
                    onClick={handleGetQuote}
                    disabled={loading}
                  >
                    {loading ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Calculating route...</>
                    ) : (
                      'Get Price Quote'
                    )}
                  </Button>
                )}

                {quote && quote.price > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl p-5 space-y-4"
                    style={{ backgroundColor: `${buttonColor}10` }}
                  >
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        {originLabel || effectiveOrigin} → {destLabel || effectiveDest}
                      </p>
                      <div className="flex items-center justify-center gap-3 mt-1 text-xs text-muted-foreground">
                        {quote.distance_km && <span>~{quote.distance_km} km</span>}
                        {quote.duration_min && <span>· ~{quote.duration_min} min</span>}
                      </div>
                      <p className="text-3xl font-bold mt-2" style={{ color: buttonColor }}>€{quote.price}</p>
                    </div>

                    {/* Uber-style fare breakdown */}
                    <div className="space-y-1.5 text-xs border-t border-border/50 pt-3">
                      {quote.base_fee > 0 && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>Base fare</span>
                          <span>€{quote.base_fee}</span>
                        </div>
                      )}
                      {quote.distance_charge > 0 && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>Distance ({quote.distance_km} km)</span>
                          <span>€{quote.distance_charge}</span>
                        </div>
                      )}
                      {quote.time_charge > 0 && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>Time ({quote.duration_min} min)</span>
                          <span>€{quote.time_charge}</span>
                        </div>
                      )}
                      {quote.drop_off_fee > 0 && (
                        <div className="flex justify-between text-muted-foreground">
                          <span>Drop-off fee</span>
                          <span>€{quote.drop_off_fee}</span>
                        </div>
                      )}
                      {quote.minimum_fare > 0 && quote.price === Math.round(quote.minimum_fare) && (
                        <div className="flex justify-between text-muted-foreground italic">
                          <span>Minimum fare applied</span>
                          <span>€{Math.round(quote.minimum_fare)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold text-sm pt-1 border-t border-border/30">
                        <span>Total</span>
                        <span style={{ color: buttonColor }}>€{quote.price}</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-muted-foreground text-center">
                      {TRANSFER_CATEGORIES.find(c => c.id === selectedCategory)?.label} · Estimated fare
                    </p>

                    {config.whatsapp_number && (
                      <Button
                        className="w-full h-12 rounded-xl font-bold text-white gap-2"
                        style={{ backgroundColor: '#25D366' }}
                        onClick={handleWhatsApp}
                      >
                        <MessageCircle className="h-5 w-5" /> Book via WhatsApp
                      </Button>
                    )}
                  </motion.div>
                )}

                {quote && quote.price === 0 && (
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-center">
                    <AlertCircle className="h-5 w-5 mx-auto mb-2 text-destructive" />
                    <p className="text-sm font-medium">
                      {quote.error === 'no_formula' && 'Pricing formula not configured'}
                      {quote.error === 'geocode_origin' && `Could not locate "${effectiveOrigin}"`}
                      {quote.error === 'geocode_destination' && `Could not locate "${effectiveDest}"`}
                      {quote.error === 'osrm_failed' && 'Could not calculate route distance'}
                      {!quote.error && 'Price unavailable for this route'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {quote.error === 'no_formula'
                        ? 'The agency has not set up distance-based pricing yet.'
                        : 'Please contact us directly for a custom quote.'}
                    </p>
                    {config.whatsapp_number && (
                      <Button variant="outline" size="sm" className="mt-3 gap-1" onClick={() => {
                        const msg = `Hello ${agency.name}, I need a quote for transfer from ${effectiveOrigin} to ${effectiveDest}. Please advise.`;
                        window.open(`https://wa.me/${config.whatsapp_number!.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                      }}>
                        <MessageCircle className="h-3.5 w-3.5" /> Contact Us
                      </Button>
                    )}
                  </div>
                )}
              </>

          </>
        )}
      </motion.div>
    </div>
  );
};

export default TransferBookingForm;
