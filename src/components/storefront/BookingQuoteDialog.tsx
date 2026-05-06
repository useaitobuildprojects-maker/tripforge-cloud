import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Check, Shield, Navigation, Baby, UserPlus, Wifi, Snowflake, Package, Info } from 'lucide-react';
import { INSURANCE_TIERS, BOOKING_EXTRAS, calculateQuote, InsuranceTier, BookingExtra } from '@/types/booking';
import { MarketplaceVehicle } from '@/hooks/use-marketplace-vehicles';

const EXTRA_ICONS: Record<string, React.ElementType> = {
  Navigation, Baby, UserPlus, Wifi, Snowflake, Package,
};

interface Props {
  vehicle: MarketplaceVehicle;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buttonColor: string;
  numDays: number;
  isOneWay: boolean;
  oneWayFee: number;
  pickupCity?: string;
}

const BookingQuoteDialog = ({ vehicle, open, onOpenChange, buttonColor, numDays: initialDays, isOneWay, oneWayFee, pickupCity }: Props) => {
  const [numDays, setNumDays] = useState(Math.max(1, initialDays));
  const [estimatedKm, setEstimatedKm] = useState(100);
  const [crossCityDistance, setCrossCityDistance] = useState(0);
  const [selectedInsurance, setSelectedInsurance] = useState<string>('basic');
  const [selectedExtras, setSelectedExtras] = useState<Record<string, number>>({});

  const insurance = INSURANCE_TIERS.find(t => t.id === selectedInsurance) ?? INSURANCE_TIERS[0];
  const extrasDailyTotal = Object.entries(selectedExtras).reduce((sum, [id, qty]) => {
    const extra = BOOKING_EXTRAS.find(e => e.id === id);
    return sum + (extra ? extra.price_per_day * qty : 0);
  }, 0);

  const dailyRate = vehicle.daily_rate ?? 0;
  const pricePerKm = vehicle.display_price_per_km ?? vehicle.price_per_km ?? 0;
  const freeKmPerDay = (vehicle as any).free_km_per_day ?? 200;

  // Cross-city drop-off: if vehicle has a home city and pickup is in a different city,
  // charge either a fixed drop_off_fee or distance × price_per_km.
  const norm = (s?: string | null) => (s ?? '').trim().toLowerCase();
  const isCrossCity = !!vehicle.home_city && !!pickupCity && norm(vehicle.home_city) !== norm(pickupCity);
  const dropOffFee = useMemo(() => {
    if (!isCrossCity) return 0;
    if (vehicle.drop_off_mode === 'per_km') {
      return +(crossCityDistance * pricePerKm).toFixed(2);
    }
    return Number(vehicle.drop_off_fee ?? 0);
  }, [isCrossCity, vehicle.drop_off_mode, vehicle.drop_off_fee, crossCityDistance, pricePerKm]);

  const effectiveOneWayFee = isCrossCity ? dropOffFee : oneWayFee;
  const effectiveIsOneWay = isCrossCity ? true : isOneWay;

  const quote = useMemo(() => calculateQuote({
    daily_rate: dailyRate,
    price_per_km: pricePerKm,
    free_km_per_day: freeKmPerDay,
    num_days: numDays,
    estimated_km: estimatedKm,
    is_one_way: effectiveIsOneWay,
    one_way_fee: effectiveOneWayFee,
    insurance_daily: insurance.daily_price,
    extras_daily: extrasDailyTotal,
    commission_rate: vehicle.commission_rate,
    is_external: !vehicle.is_own,
  }), [dailyRate, pricePerKm, freeKmPerDay, numDays, estimatedKm, effectiveIsOneWay, effectiveOneWayFee, insurance, extrasDailyTotal, vehicle]);

  const toggleExtra = (extra: BookingExtra) => {
    setSelectedExtras(prev => {
      const current = prev[extra.id] ?? 0;
      if (current > 0) {
        const next = { ...prev };
        delete next[extra.id];
        return next;
      }
      return { ...prev, [extra.id]: 1 };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {vehicle.brand} {vehicle.model} <span className="text-muted-foreground font-normal text-base">({vehicle.year})</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          {/* Trip Details */}
          <div>
            <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider text-muted-foreground">Trip Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Rental days</Label>
                <Input type="number" min={1} max={365} value={numDays} onChange={e => setNumDays(Math.max(1, parseInt(e.target.value) || 1))} />
              </div>
              <div className="space-y-1.5">
                <Label>Estimated distance (km)</Label>
                <Input type="number" min={0} step={50} value={estimatedKm} onChange={e => setEstimatedKm(Math.max(0, parseInt(e.target.value) || 0))} />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Info className="h-3 w-3" /> {freeKmPerDay} km/day included free • Extra km at {pricePerKm} €/km
            </p>
            {isCrossCity && (
              <div className="mt-3 p-3 rounded-md border border-border bg-muted/40 space-y-2">
                <p className="text-xs font-semibold flex items-center gap-1">
                  <Info className="h-3 w-3" /> Cross-city pickup
                </p>
                <p className="text-xs text-muted-foreground">
                  This car is based in <strong>{vehicle.home_city}</strong> and your pickup is in <strong>{pickupCity}</strong>.
                  {vehicle.drop_off_mode === 'fixed'
                    ? ` A fixed delivery fee of ${Number(vehicle.drop_off_fee ?? 0).toFixed(2)} € applies.`
                    : ' Delivery is charged by distance × price/km.'}
                </p>
                {vehicle.drop_off_mode === 'per_km' && (
                  <div className="space-y-1">
                    <Label className="text-xs">Distance from {vehicle.home_city} to {pickupCity} (km)</Label>
                    <Input
                      type="number" min={0} step={1}
                      value={crossCityDistance}
                      onChange={e => setCrossCityDistance(Math.max(0, parseInt(e.target.value) || 0))}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Insurance */}
          <div>
            <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" /> Insurance
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {INSURANCE_TIERS.map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setSelectedInsurance(tier.id)}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                    selectedInsurance === tier.id
                      ? 'shadow-md'
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                  style={selectedInsurance === tier.id ? { borderColor: buttonColor } : undefined}
                >
                  {selectedInsurance === tier.id && (
                    <div className="absolute top-2 right-2 h-5 w-5 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: buttonColor }}>
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  <p className="font-bold text-sm">{tier.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{tier.description}</p>
                  <p className="font-bold mt-2" style={{ color: buttonColor }}>
                    {tier.daily_price === 0 ? 'Included' : `+${tier.daily_price} €/day`}
                  </p>
                  <ul className="mt-2 space-y-1">
                    {tier.coverage.slice(0, 3).map(c => (
                      <li key={c} className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Check className="h-2.5 w-2.5 shrink-0" style={{ color: buttonColor }} /> {c}
                      </li>
                    ))}
                    {tier.coverage.length > 3 && (
                      <li className="text-[10px] text-muted-foreground">+{tier.coverage.length - 3} more</li>
                    )}
                  </ul>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Extras */}
          <div>
            <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider text-muted-foreground">Extras & Add-ons</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {BOOKING_EXTRAS.map((extra) => {
                const Icon = EXTRA_ICONS[extra.icon] ?? Package;
                const isSelected = (selectedExtras[extra.id] ?? 0) > 0;
                return (
                  <button
                    key={extra.id}
                    onClick={() => toggleExtra(extra)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      isSelected ? 'shadow-sm' : 'border-border hover:border-muted-foreground/30'
                    }`}
                    style={isSelected ? { borderColor: buttonColor } : undefined}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-4 w-4 opacity-60" />
                      <span className="text-xs font-semibold">{extra.name}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{extra.description}</p>
                    <p className="text-xs font-bold mt-1" style={{ color: buttonColor }}>+{extra.price_per_day} €/day</p>
                  </button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Price Breakdown */}
          <div>
            <h4 className="text-sm font-semibold mb-3 uppercase tracking-wider text-muted-foreground">Price Estimate</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Base rental ({numDays} day{numDays > 1 ? 's' : ''} × {dailyRate} €)</span>
                <span className="font-medium">{quote.base_rental.toFixed(2)} €</span>
              </div>
              {quote.extra_km > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Extra mileage ({quote.extra_km} km × {pricePerKm} €)</span>
                  <span>{quote.km_charge.toFixed(2)} €</span>
                </div>
              )}
              {quote.one_way_fee > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>{isCrossCity ? `Cross-city delivery (${vehicle.home_city} → ${pickupCity})` : 'One-way drop-off fee'}</span>
                  <span>{quote.one_way_fee.toFixed(2)} €</span>
                </div>
              )}
              {quote.insurance_total > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>{insurance.name} insurance ({numDays} days)</span>
                  <span>{quote.insurance_total.toFixed(2)} €</span>
                </div>
              )}
              {quote.extras_total > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Extras ({numDays} days)</span>
                  <span>{quote.extras_total.toFixed(2)} €</span>
                </div>
              )}
              {quote.commission > 0 && (
                <div className="flex justify-between text-muted-foreground text-xs">
                  <span>Partner service fee</span>
                  <span>{quote.commission.toFixed(2)} €</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold pt-1">
                <span>Total</span>
                <span style={{ color: buttonColor }}>{quote.total.toFixed(2)} €</span>
              </div>
            </div>
          </div>

          <Button className="w-full h-12 rounded-xl font-bold text-white" style={{ backgroundColor: buttonColor }}>
            Proceed to Booking
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingQuoteDialog;
