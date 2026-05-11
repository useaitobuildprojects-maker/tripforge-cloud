import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, ArrowRight, Car, Crown, Loader2, AlertCircle, MessageCircle, CalendarIcon, Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StorefrontConfig, Agency } from '@/types/agency';
import { TransferCategory } from '@/hooks/use-service-pricing';
import { calculateTransferPrice, TransferQuote, getVehicleClasses } from '@/lib/transfer-pricing';
import { useCityPricing } from '@/hooks/use-city-pricing';
import LocationAutocomplete, { getAgencyLocations, LocationSelection } from '@/components/storefront/LocationAutocomplete';
import { getVehicleClassImage } from '@/lib/vehicle-class-images';
import BookingCustomerDialog, { BookingDraft } from '@/components/storefront/BookingCustomerDialog';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  economy: Car,
  business: Car,
  first_class: Crown,
};

interface Props {
  agency: Agency;
  config: StorefrontConfig;
  buttonColor: string;
  initialOrigin?: string;
  initialDestination?: string;
  initialDate?: string; // yyyy-MM-dd or yyyy-MM-ddTHH:mm
  initialPax?: number;
  hideRouteFields?: boolean;
  onDraftReady?: (draft: BookingDraft | null) => void;
}

const TransferBookingForm = ({ agency, config, buttonColor, initialOrigin, initialDestination, initialDate, initialPax, hideRouteFields, onDraftReady }: Props) => {
  const { data: cityPricing = [] } = useCityPricing(agency.id);

  const agencyLocations = useMemo(() => {
    const configLocs = config.locations;
    if (configLocs && configLocs.length > 0) {
      return configLocs.map((l, i) => ({ id: `loc-${i}`, name: l.name, type: l.type, address: l.address, fullName: l.address ? `${l.name}, ${l.address}` : l.name }));
    }
    return getAgencyLocations(agency.city, agency.country);
  }, [config.locations, agency.city, agency.country]);

  const [origin, setOrigin] = useState(initialOrigin ?? '');
  const [originLabel, setOriginLabel] = useState(initialOrigin ?? '');
  const [destination, setDestination] = useState(initialDestination ?? '');
  const [destLabel, setDestLabel] = useState(initialDestination ?? '');
  const [originCoords, setOriginCoords] = useState<[number, number] | undefined>();
  const [destCoords, setDestCoords] = useState<[number, number] | undefined>();
  const [selectedClassIndex, setSelectedClassIndex] = useState(0);
  const [quote, setQuote] = useState<TransferQuote | null>(null);
  const [quoteClassIdx, setQuoteClassIdx] = useState<number>(0);
  const [date, setDate] = useState<Date | undefined>(() => {
    if (!initialDate) return undefined;
    const d = new Date(initialDate);
    return isNaN(d.getTime()) ? undefined : d;
  });
  const [time, setTime] = useState(initialDate && initialDate.includes('T') ? initialDate.split('T')[1].slice(0, 5) : '');
  const [pax, setPax] = useState<number>(initialPax && initialPax > 0 ? initialPax : 1);
  const [loading, setLoading] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  const vehicleClasses = useMemo(() => getVehicleClasses(config), [config]);

  // Auto-fetch quote when arriving with prefilled origin/destination
  useEffect(() => {
    if (hideRouteFields && initialOrigin && initialDestination && initialOrigin !== initialDestination && !quote && !loading) {
      handleGetQuote();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter classes by seat capacity
  const suitableClasses = useMemo(
    () => vehicleClasses.map((vc, idx) => ({ ...vc, idx })).filter(vc => vc.seats >= pax),
    [vehicleClasses, pax]
  );

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
    const vc = vehicleClasses[selectedClassIndex];
    try {
      const result = await calculateTransferPrice(
        config, effectiveOrigin, effectiveDest, vc?.category as TransferCategory ?? 'economy', agency.country, cityPricing,
        originCoords, destCoords, selectedClassIndex
      );
      setQuote(result);
      setQuoteClassIdx(selectedClassIndex);
    } catch {
      setQuote(null);
    } finally {
      setLoading(false);
    }
  };

  // Base distance price (without class multiplier or drop-off) derived from quote
  const quoteBaseDistance = useMemo(() => {
    if (!quote || quote.price <= 0) return 0;
    const m = vehicleClasses[quoteClassIdx]?.multiplier ?? 1;
    return m > 0 ? (quote.distance_charge / m) : 0;
  }, [quote, quoteClassIdx, vehicleClasses]);

  const priceForClass = (mult: number) => {
    if (!quote || quote.price <= 0) return 0;
    return Math.round(quoteBaseDistance * mult + (quote.drop_off_fee ?? 0));
  };

  const currentPrice = quote ? priceForClass(vehicleClasses[selectedClassIndex]?.multiplier ?? 1) : 0;

  const handleWhatsApp = () => {
    if (!quote || !config.whatsapp_number) return;
    const vc = vehicleClasses[selectedClassIndex];
    const dateStr = date ? format(date, 'PPP') : 'Not specified';
    const timeStr = time || 'Not specified';
    const msg = `Hello ${agency.name}!\n\nI'd like to book a transfer:\n📍 ${effectiveOrigin} → ${effectiveDest}\n📅 ${dateStr} at ${timeStr}\n👥 Passengers: ${pax}\n🚗 ${vc?.label ?? 'Economy'} (${vc?.seats ?? 3} seats)\n📏 ${quote.distance_km ? `~${quote.distance_km} km` : ''}${quote.duration_min ? ` · ~${quote.duration_min} min` : ''}\n💰 Price: €${currentPrice}\n\nPlease confirm availability.`;
    const url = `https://wa.me/${config.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const buildBookingDraft = (): BookingDraft | null => {
    if (!quote || quote.price <= 0) return null;
    const vc = vehicleClasses[selectedClassIndex];
    const dateStr = date ? format(date, 'PPP') : 'Not specified';
    const timeStr = time || '09:00';
    const pickupDate = (() => {
      if (!date) return new Date().toISOString();
      const [hh, mm] = (time || '09:00').split(':').map(n => parseInt(n) || 0);
      const d = new Date(date);
      d.setHours(hh, mm, 0, 0);
      return d.toISOString();
    })();
    return {
      agency_id: agency.id,
      service_type: 'transfer',
      amount: currentPrice,
      vehicle_id: null,
      pickup_date: pickupDate,
      return_date: pickupDate,
      pickup_location: effectiveOrigin,
      return_location: effectiveDest,
      summary: [
        `Transfer: ${effectiveOrigin} → ${effectiveDest}`,
        `When: ${dateStr} at ${timeStr}`,
        `Passengers: ${pax}`,
        `Vehicle class: ${vc?.label ?? 'Economy'} (${vc?.seats ?? 3} seats)`,
        quote.distance_km ? `Distance: ~${quote.distance_km} km${quote.duration_min ? ` · ~${quote.duration_min} min` : ''}` : '',
      ].filter(Boolean).join('\n'),
    };
  };

  const draft = buildBookingDraft();

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
        {!hideRouteFields && (
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
        )}

        {/* Date & Time */}
        {!hideRouteFields && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
          <div className="space-y-1.5">
            <Label className="text-xs font-medium flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" style={{ color: buttonColor }} /> Passengers
            </Label>
            <div className="flex items-center gap-2 h-10 rounded-md border border-input px-3">
              <button type="button" onClick={() => setPax(p => Math.max(1, p - 1))}
                className="h-7 w-7 rounded-md border border-border hover:bg-muted text-sm font-bold">−</button>
              <span className="flex-1 text-center text-sm font-semibold">{pax}</span>
              <button type="button" onClick={() => setPax(p => Math.min(20, p + 1))}
                className="h-7 w-7 rounded-md border border-border hover:bg-muted text-sm font-bold">+</button>
            </div>
          </div>
        </div>
        )}

        {!hideRouteFields && <Separator />}

        {/* Category Selection */}
        <div className="space-y-3">
          <Label className="text-xs font-medium">Vehicle Class</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {suitableClasses.map((vc) => {
              const isSelected = selectedClassIndex === vc.idx;

              return (
                <button
                  key={vc.idx}
                  onClick={() => setSelectedClassIndex(vc.idx)}
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
                    <p className="text-sm font-bold truncate">{vc.label || `${vc.category} ${vc.seats}s`}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <Users className="h-3 w-3" /> {vc.seats}
                    </p>
                  </div>
                  {quote && quote.price > 0 && (
                    <span className="text-sm font-bold tabular-nums shrink-0" style={{ color: buttonColor }}>
                      €{priceForClass(vc.multiplier)}
                    </span>
                  )}
                  {isSelected && (
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: buttonColor }} />
                  )}
                </button>
              );
            })}
          </div>
          {suitableClasses.length === 0 && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-2.5 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-[11px] text-destructive">No vehicle fits {pax} passengers. Reduce passenger count or contact us.</p>
            </div>
          )}
        </div>

        {/* Get Quote / Results */}
        {effectiveOrigin && effectiveDest && effectiveOrigin === effectiveDest && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">Pickup and drop-off are the same location. Please choose a different destination to see the price.</p>
          </div>
        )}
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
                      <p className="text-3xl font-bold mt-2" style={{ color: buttonColor }}>€{currentPrice}</p>
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
                          <span>€{Math.round(quoteBaseDistance * (vehicleClasses[selectedClassIndex]?.multiplier ?? 1))}</span>
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
                        <span style={{ color: buttonColor }}>€{currentPrice}</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-muted-foreground text-center">
                      {vehicleClasses[selectedClassIndex]?.label ?? 'Economy'} · Estimated fare
                    </p>

                    <Button
                      className="h-12 rounded-xl font-bold text-white px-8"
                      style={{ backgroundColor: buttonColor }}
                      disabled={!draft}
                      onClick={() => setBookingOpen(true)}
                    >
                      Book this vehicle
                    </Button>

                    {config.whatsapp_number && (
                      <Button
                        className="w-full h-11 rounded-xl font-bold text-white gap-2"
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

      {draft && (
        <BookingCustomerDialog
          open={bookingOpen}
          onOpenChange={setBookingOpen}
          draft={draft}
          buttonColor={buttonColor}
          agencyName={agency.name}
        />
      )}
    </div>
  );
};

export default TransferBookingForm;
