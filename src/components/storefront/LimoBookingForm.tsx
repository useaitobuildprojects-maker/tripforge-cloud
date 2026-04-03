import { useState, useMemo } from 'react';
import { useCityPricing } from '@/hooks/use-city-pricing';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, ArrowRight, Car, Crown, Truck, Loader2, AlertCircle, MessageCircle, CalendarIcon, Clock, Timer, Route, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StorefrontConfig, Agency } from '@/types/agency';
import { LIMO_CATEGORIES, LimoCategory } from '@/hooks/use-service-pricing';
import { calculateTransferPrice, TransferQuote } from '@/lib/transfer-pricing';
import LocationAutocomplete, { getAgencyLocations, LocationSelection } from '@/components/storefront/LocationAutocomplete';

const LIMO_CATEGORY_ICONS: Record<LimoCategory, React.ElementType> = {
  business: Car,
  first_class: Crown,
  van: Truck,
  suv: Shield,
};

type LimoMode = 'package' | 'p2p';
type LimoPackage = '8h' | '10h';

interface Props {
  agency: Agency;
  config: StorefrontConfig;
  buttonColor: string;
}

const LimoBookingForm = ({ agency, config, buttonColor }: Props) => {
  const { data: cityPricingData = [] } = useCityPricing(agency.id);
  const agencyLocations = useMemo(() => {
    const configLocs = config.locations;
    if (configLocs && configLocs.length > 0) {
      return configLocs.map((l, i) => ({ id: `loc-${i}`, name: l.name, type: l.type, address: l.address }));
    }
    return getAgencyLocations(agency.city, agency.country);
  }, [config.locations, agency.city, agency.country]);

  const [mode, setMode] = useState<LimoMode>('package');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originCoords, setOriginCoords] = useState<[number, number] | undefined>();
  const [destCoords, setDestCoords] = useState<[number, number] | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<LimoCategory>('business');
  const [selectedPackage, setSelectedPackage] = useState<LimoPackage>('8h');
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState('');
  const [quote, setQuote] = useState<TransferQuote | null>(null);
  const [loading, setLoading] = useState(false);

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

  const getPackagePrice = (cat: LimoCategory, pkg: LimoPackage): number => {
    if (pkg === '8h') {
      switch (cat) {
        case 'business': return config.limo_price_8h_business ?? 0;
        case 'first_class': return config.limo_price_8h_first_class ?? 0;
        case 'van': return config.limo_price_8h_van ?? 0;
        case 'suv': return config.limo_price_8h_suv ?? 0;
      }
    } else {
      switch (cat) {
        case 'business': return config.limo_price_10h_business ?? 0;
        case 'first_class': return config.limo_price_10h_first_class ?? 0;
        case 'van': return config.limo_price_10h_van ?? 0;
        case 'suv': return config.limo_price_10h_suv ?? 0;
      }
    }
  };

  const packagePrice = getPackagePrice(selectedCategory, selectedPackage);

  const handleGetP2PQuote = async () => {
    if (!origin || !destination) return;
    setLoading(true);
    try {
      const limoConfig: StorefrontConfig = {
        ...config,
        transfer_base_fee: config.limo_p2p_base_fee ?? config.transfer_base_fee,
        transfer_per_km_rate: config.limo_p2p_per_km_rate ?? config.transfer_per_km_rate,
      };
      const transferCategory = selectedCategory === 'suv' ? 'first_class' as const : selectedCategory;
      const result = await calculateTransferPrice(
        limoConfig, origin, destination, transferCategory, agency.country, cityPricingData,
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
    const dateStr = date ? format(date, 'PPP') : 'Not specified';
    const timeStr = time || 'Not specified';
    
    let msg: string;
    if (mode === 'package') {
      msg = `Hello ${agency.name}!\n\nI'd like to book a Limo Service (${selectedPackage} Package):\n📍 Pickup: ${origin || 'To be confirmed'}\n📅 ${dateStr} at ${timeStr}\n🚗 Category: ${LIMO_CATEGORIES.find(c => c.id === selectedCategory)?.label}\n💰 Price: €${packagePrice}\n\nPlease confirm availability.`;
    } else {
      msg = `Hello ${agency.name}!\n\nI'd like to book a Limo Service (Point-to-Point):\n📍 ${origin} → ${destination}\n📅 ${dateStr} at ${timeStr}\n🚗 Category: ${LIMO_CATEGORIES.find(c => c.id === selectedCategory)?.label}\n💰 Price: €${quote?.price ?? 'TBD'}\n\nPlease confirm availability.`;
    }
    const url = `https://wa.me/${config.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const hasPackagePricing = getPackagePrice('business', '8h') > 0 || getPackagePrice('first_class', '8h') > 0 || getPackagePrice('van', '8h') > 0 || getPackagePrice('suv', '8h') > 0
    || getPackagePrice('business', '10h') > 0 || getPackagePrice('first_class', '10h') > 0 || getPackagePrice('van', '10h') > 0 || getPackagePrice('suv', '10h') > 0;
  const hasP2PPricing = (config.limo_p2p_base_fee ?? config.transfer_base_fee ?? 0) > 0 || (config.limo_p2p_per_km_rate ?? config.transfer_per_km_rate ?? 0) > 0;

  return (
    <div className="max-w-2xl mx-auto">
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
          <button
            onClick={() => { setMode('package'); setQuote(null); }}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all",
              mode === 'package' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Timer className="h-4 w-4" /> Package (8h / 10h)
          </button>
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

        {/* Pickup Location */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" style={{ color: buttonColor }} /> Pickup Location
          </Label>
          <LocationAutocomplete
            value={origin}
            onChange={(v) => { setOrigin(v); setQuote(null); }}
            onChange={(v, sel?: LocationSelection) => { setOrigin(v); setOriginCoords(sel?.coords); setQuote(null); }}
            placeholder="Airport, hotel, or address"
            locations={agencyLocations}
            agencyCity={agency.city}
            agencyCountry={agency.country}
          />
        </div>

        {/* Drop-off (P2P only) */}
        {mode === 'p2p' && (
          <div className="space-y-1.5">
            <Label className="text-xs font-medium flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" style={{ color: buttonColor }} /> Drop-off Location
            </Label>
            <LocationAutocomplete
              value={destination}
              onChange={(v) => { setDestination(v); setQuote(null); }}
            onChange={(v, sel?: LocationSelection) => { setDestination(v); setDestCoords(sel?.coords); setQuote(null); }}
              placeholder="Destination address"
              locations={agencyLocations}
              agencyCity={agency.city}
              agencyCountry={agency.country}
            />
          </div>
        )}

        {/* Date, Time & Package */}
        <div className={cn("grid gap-3", mode === 'package' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2')}>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5" style={{ color: buttonColor }} /> Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal h-10", !date && "text-muted-foreground")}
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
                  className="p-3 pointer-events-auto"
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
          {mode === 'package' && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium flex items-center gap-1.5">
                <Timer className="h-3.5 w-3.5" style={{ color: buttonColor }} /> Package
              </Label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedPackage('8h')}
                  className={cn(
                    "flex-1 h-10 rounded-lg border-2 text-sm font-semibold transition-all",
                    selectedPackage === '8h' ? 'shadow-sm text-foreground' : 'border-border text-muted-foreground hover:border-muted-foreground/30'
                  )}
                  style={selectedPackage === '8h' ? { borderColor: buttonColor, color: buttonColor } : undefined}
                >
                  8 Hours
                </button>
                <button
                  onClick={() => setSelectedPackage('10h')}
                  className={cn(
                    "flex-1 h-10 rounded-lg border-2 text-sm font-semibold transition-all",
                    selectedPackage === '10h' ? 'shadow-sm text-foreground' : 'border-border text-muted-foreground hover:border-muted-foreground/30'
                  )}
                  style={selectedPackage === '10h' ? { borderColor: buttonColor, color: buttonColor } : undefined}
                >
                  10 Hours
                </button>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Category Selection */}
        <div className="space-y-3">
          <Label className="text-xs font-medium">Vehicle Category</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {LIMO_CATEGORIES.map((cat) => {
              const Icon = LIMO_CATEGORY_ICONS[cat.id];
              const isSelected = selectedCategory === cat.id;
              const price = mode === 'package' ? getPackagePrice(cat.id, selectedPackage) : 0;

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
                  {mode === 'package' && price > 0 && (
                    <p className="text-xs font-semibold mt-1" style={{ color: buttonColor }}>€{price}</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Package Mode — Instant Price */}
        {mode === 'package' && hasPackagePricing && packagePrice > 0 && origin && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-5 text-center space-y-3"
            style={{ backgroundColor: `${buttonColor}10` }}
          >
            <p className="text-sm text-muted-foreground">
              {LIMO_CATEGORIES.find(c => c.id === selectedCategory)?.label} · {selectedPackage === '8h' ? '8' : '10'} hours
            </p>
            <p className="text-3xl font-bold" style={{ color: buttonColor }}>€{packagePrice}</p>
            <p className="text-xs text-muted-foreground">Fixed package price</p>

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

        {mode === 'package' && !hasPackagePricing && (
          <div className="rounded-xl border border-muted bg-muted/10 p-4 text-center">
            <AlertCircle className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">Package pricing not configured</p>
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
                  This route is ~{quote.distance_km} km, but Limo P2P is limited to {maxKm} km. Please use our <strong>Transfer</strong> service instead, or contact us directly.
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
