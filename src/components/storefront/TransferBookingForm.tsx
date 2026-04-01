import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, ArrowRight, Users, Car, Crown, Truck, Loader2, AlertCircle, MessageCircle } from 'lucide-react';
import { StorefrontConfig, Agency } from '@/types/agency';
import { TransferRoute, TRANSFER_CATEGORIES, TransferCategory } from '@/hooks/use-service-pricing';
import { getMatrixPrice, getFormulaPrice, calculateTransferPrice, TransferQuote } from '@/lib/transfer-pricing';

const CATEGORY_ICONS: Record<TransferCategory, React.ElementType> = {
  economy: Car,
  business: Car,
  first_class: Crown,
  van: Truck,
};

interface Props {
  agency: Agency;
  config: StorefrontConfig;
  routes: TransferRoute[];
  buttonColor: string;
}

const TransferBookingForm = ({ agency, config, routes, buttonColor }: Props) => {
  const locations = config.locations ?? [];
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [customOrigin, setCustomOrigin] = useState('');
  const [customDestination, setCustomDestination] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TransferCategory>('economy');
  const [quote, setQuote] = useState<TransferQuote | null>(null);
  const [loading, setLoading] = useState(false);

  const useCustomOrigin = origin === '__custom__';
  const useCustomDest = destination === '__custom__';
  const effectiveOrigin = useCustomOrigin ? customOrigin : origin;
  const effectiveDest = useCustomDest ? customDestination : destination;

  // Quick matrix prices for all categories (instant, no API call)
  const matrixPrices = useMemo(() => {
    if (!effectiveOrigin || !effectiveDest || effectiveOrigin === effectiveDest) return null;
    const prices: Partial<Record<TransferCategory, number>> = {};
    let hasAny = false;
    for (const cat of TRANSFER_CATEGORIES) {
      const p = getMatrixPrice(routes, effectiveOrigin, effectiveDest, cat.id);
      if (p !== null) {
        prices[cat.id] = p;
        hasAny = true;
      }
    }
    return hasAny ? prices : null;
  }, [routes, effectiveOrigin, effectiveDest]);

  const handleGetQuote = async () => {
    if (!effectiveOrigin || !effectiveDest) return;
    setLoading(true);
    try {
      const result = await calculateTransferPrice(
        routes, config, effectiveOrigin, effectiveDest, selectedCategory, agency.country
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
    const msg = `Hello ${agency.name}!\n\nI'd like to book a transfer:\n📍 ${effectiveOrigin} → ${effectiveDest}\n🚗 Category: ${TRANSFER_CATEGORIES.find(c => c.id === selectedCategory)?.label}\n💰 Price: €${quote.price}\n\nPlease confirm availability.`;
    const url = `https://wa.me/${config.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const availableDestinations = useMemo(() => {
    return locations.filter(l => l.name !== origin);
  }, [locations, origin]);

  return (
    <div className="max-w-2xl mx-auto">
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
            <Select value={origin} onValueChange={(v) => { setOrigin(v); setQuote(null); }}>
              <SelectTrigger className="text-sm"><SelectValue placeholder="Select pickup..." /></SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.name} value={loc.name}>
                    <span className="flex items-center gap-2">
                      {loc.name}
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">{loc.type}</Badge>
                    </span>
                  </SelectItem>
                ))}
                <SelectItem value="__custom__">✏️ Enter custom address</SelectItem>
              </SelectContent>
            </Select>
            {useCustomOrigin && (
              <Input
                placeholder="Enter address..."
                value={customOrigin}
                onChange={(e) => { setCustomOrigin(e.target.value); setQuote(null); }}
                className="text-sm mt-1"
              />
            )}
          </div>

          <div className="hidden md:flex items-center justify-center pb-1">
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" style={{ color: buttonColor }} /> Drop-off
            </Label>
            <Select value={destination} onValueChange={(v) => { setDestination(v); setQuote(null); }}>
              <SelectTrigger className="text-sm"><SelectValue placeholder="Select drop-off..." /></SelectTrigger>
              <SelectContent>
                {availableDestinations.map((loc) => (
                  <SelectItem key={loc.name} value={loc.name}>
                    <span className="flex items-center gap-2">
                      {loc.name}
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">{loc.type}</Badge>
                    </span>
                  </SelectItem>
                ))}
                <SelectItem value="__custom__">✏️ Enter custom address</SelectItem>
              </SelectContent>
            </Select>
            {useCustomDest && (
              <Input
                placeholder="Enter address..."
                value={customDestination}
                onChange={(e) => { setCustomDestination(e.target.value); setQuote(null); }}
                className="text-sm mt-1"
              />
            )}
          </div>
        </div>

        <Separator />

        {/* Category Selection */}
        <div className="space-y-3">
          <Label className="text-xs font-medium">Vehicle Category</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TRANSFER_CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id];
              const isSelected = selectedCategory === cat.id;
              const matrixPrice = matrixPrices?.[cat.id];

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
                  {matrixPrice !== undefined && (
                    <p className="text-sm font-bold mt-2" style={{ color: buttonColor }}>€{matrixPrice}</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Get Quote / Results */}
        {effectiveOrigin && effectiveDest && effectiveOrigin !== effectiveDest && (
          <>
            {matrixPrices && matrixPrices[selectedCategory] !== undefined ? (
              /* Instant price from matrix */
              <div className="rounded-xl p-5 text-center space-y-3" style={{ backgroundColor: `${buttonColor}10` }}>
                <p className="text-sm text-muted-foreground">
                  {effectiveOrigin} → {effectiveDest} · {TRANSFER_CATEGORIES.find(c => c.id === selectedCategory)?.label}
                </p>
                <p className="text-3xl font-bold" style={{ color: buttonColor }}>€{matrixPrices[selectedCategory]}</p>
                <p className="text-xs text-muted-foreground">Fixed price • No hidden fees</p>

                {config.whatsapp_number && (
                  <Button
                    className="w-full h-12 rounded-xl font-bold text-white gap-2 mt-2"
                    style={{ backgroundColor: '#25D366' }}
                    onClick={handleWhatsApp}
                  >
                    <MessageCircle className="h-5 w-5" /> Book via WhatsApp
                  </Button>
                )}
              </div>
            ) : (
              /* Need to calculate via OSRM */
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
                    className="rounded-xl p-5 text-center space-y-3"
                    style={{ backgroundColor: `${buttonColor}10` }}
                  >
                    <p className="text-sm text-muted-foreground">
                      {effectiveOrigin} → {effectiveDest}
                      {quote.distance_km && ` · ~${quote.distance_km} km`}
                    </p>
                    <p className="text-3xl font-bold" style={{ color: buttonColor }}>€{quote.price}</p>
                    <p className="text-xs text-muted-foreground">
                      {TRANSFER_CATEGORIES.find(c => c.id === selectedCategory)?.label} · Estimated price
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
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default TransferBookingForm;
