import { useState, useMemo, useEffect } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { Car, Crown, Truck, Shield, AlertCircle, MessageCircle, CalendarIcon, MapPin, Users, Clock4, Clock8 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StorefrontConfig, Agency } from '@/types/agency';
import { CityTourPrice, useCityTourPricing } from '@/hooks/use-service-pricing';

type TourCategory = 'economy' | 'business' | 'first_class' | 'van' | 'suv';

const CATEGORY_ICONS: Record<TourCategory, React.ElementType> = {
  economy: Car,
  business: Car,
  first_class: Crown,
  van: Truck,
  suv: Shield,
};

const CATEGORY_LABELS: Record<TourCategory, string> = {
  economy: 'Economy',
  business: 'Business',
  first_class: 'First Class',
  van: 'Van',
  suv: 'SUV',
};

const DEFAULT_VEHICLE_CLASSES = [
  { category: 'economy' as TourCategory, label: 'Economy', seats: 4, multiplier: 0.8 },
  { category: 'business' as TourCategory, label: 'Business Sedan', seats: 3, multiplier: 1 },
  { category: 'first_class' as TourCategory, label: 'First Class', seats: 3, multiplier: 1.8 },
  { category: 'van' as TourCategory, label: 'Business Van', seats: 7, multiplier: 1.4 },
  { category: 'suv' as TourCategory, label: 'Luxury SUV', seats: 5, multiplier: 1.5 },
];

type DurationType = 'full' | 'half';

interface Props {
  agency: Agency;
  config: StorefrontConfig;
  buttonColor: string;
}

const CityTourBookingForm = ({ agency, config, buttonColor }: Props) => {
  const { data: configuredTours = [], isLoading } = useCityTourPricing(agency.id);

  const fallbackTours = useMemo<CityTourPrice[]>(() => {
    if (configuredTours.length > 0) return [];
    return (config.limo_city_rates ?? []).map((rate, index) => ({
      id: `city-tour-fallback-${index}`,
      agency_id: agency.id,
      tour_name: `${rate.city} City Tour`,
      country: rate.country ?? null,
      city: rate.city,
      daily_rate: rate.full_day_rate,
      duration_hours: 8,
      half_day_rate: rate.half_day_rate,
      half_day_hours: 4,
      description: `Private guided city tour in ${rate.city}.`,
      created_at: '',
    }));
  }, [agency.id, config.limo_city_rates, configuredTours.length]);

  const tours = configuredTours.length > 0 ? configuredTours : fallbackTours;

  const vehicleClasses = config.city_tour_vehicle_classes && config.city_tour_vehicle_classes.length > 0
    ? config.city_tour_vehicle_classes
    : DEFAULT_VEHICLE_CLASSES;

  const [selectedTourId, setSelectedTourId] = useState<string>('');
  const [tourDate, setTourDate] = useState<Date | undefined>();
  const [pax, setPax] = useState<number>(2);
  const [durationType, setDurationType] = useState<DurationType>('full');
  const [selectedClassIdx, setSelectedClassIdx] = useState(0);

  const selectedTour = useMemo(() => tours.find(t => t.id === selectedTourId), [tours, selectedTourId]);

  // Auto-select first tour once data arrives
  useEffect(() => {
    if (!selectedTourId && tours.length > 0) {
      setSelectedTourId(tours[0].id);
    }
  }, [tours, selectedTourId]);

  const hasHalfDay = !!selectedTour?.half_day_rate;
  const effectiveDurationType: DurationType = hasHalfDay ? durationType : 'full';

  const baseRate = useMemo(() => {
    if (!selectedTour) return 0;
    if (effectiveDurationType === 'half' && selectedTour.half_day_rate) return selectedTour.half_day_rate;
    return selectedTour.daily_rate;
  }, [selectedTour, effectiveDurationType]);

  const durationHours = useMemo(() => {
    if (!selectedTour) return 0;
    if (effectiveDurationType === 'half') return selectedTour.half_day_hours ?? 4;
    return selectedTour.duration_hours ?? 8;
  }, [selectedTour, effectiveDurationType]);

  const selectedClass = vehicleClasses[selectedClassIdx] ?? vehicleClasses[0];
  const multiplier = selectedClass?.multiplier ?? 1;
  const total = Math.round(baseRate * multiplier);

  // Filter classes that fit the pax count
  const suitableClasses = useMemo(
    () => vehicleClasses.map((vc, idx) => ({ ...vc, idx })).filter(vc => vc.seats >= pax),
    [vehicleClasses, pax]
  );

  const handleWhatsApp = () => {
    if (!config.whatsapp_number || !selectedTour) return;
    const dateStr = tourDate ? format(tourDate, 'PPP') : 'TBD';
    const classLabel = selectedClass?.label ?? CATEGORY_LABELS[selectedClass?.category as TourCategory] ?? 'Vehicle';
    const msg = `Hello ${agency.name}!\n\nI'd like to book a City Tour:\n🗺️ Tour: ${selectedTour.tour_name}${selectedTour.city ? ` (${selectedTour.city})` : ''}\n📅 Date: ${dateStr}\n⏱️ Duration: ${effectiveDurationType === 'full' ? 'Full day' : 'Half day'} (~${durationHours}h)\n👥 Passengers: ${pax}\n🚗 Vehicle: ${classLabel} (${selectedClass?.seats} seats)\n\n💰 Total: €${total}\n\nPlease confirm availability.`;
    const url = `https://wa.me/${config.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-4 shadow-lg">
        <Skeleton className="h-6 w-48 mx-auto" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6 shadow-lg"
      >
        <div className="text-center mb-2">
          <h3 className="text-xl font-bold">Book Your City Tour</h3>
          <p className="text-sm text-muted-foreground mt-1">Pick a tour, choose your date and vehicle</p>
        </div>

        {tours.length === 0 ? (
          <div className="rounded-xl border border-muted bg-muted/10 p-4 text-center">
            <AlertCircle className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">No tours configured yet</p>
            <p className="text-xs text-muted-foreground mt-1">Please contact us for a custom itinerary.</p>
            {config.whatsapp_number && (
              <Button variant="outline" size="sm" className="mt-3 gap-1" onClick={() => {
                const url = `https://wa.me/${config.whatsapp_number!.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${agency.name}, I'd like to inquire about a city tour.`)}`;
                window.open(url, '_blank');
              }}>
                <MessageCircle className="h-3.5 w-3.5" /> Contact Us
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Tour cards */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Choose a Tour</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {tours.map(tour => {
                  const isSelected = tour.id === selectedTourId;
                  return (
                    <button
                      key={tour.id}
                      onClick={() => setSelectedTourId(tour.id)}
                      className={cn(
                        'p-3 rounded-xl border-2 text-left transition-all',
                        isSelected ? 'shadow-md' : 'border-border hover:border-muted-foreground/30'
                      )}
                      style={isSelected ? { borderColor: buttonColor } : undefined}
                    >
                      <p className="text-sm font-bold leading-tight">{tour.tour_name}</p>
                      {(tour.city || tour.country) && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {[tour.city, tour.country].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-muted-foreground">
                          {tour.duration_hours ? `${tour.duration_hours}h` : 'Full day'}
                          {tour.half_day_rate ? ' / Half-day' : ''}
                        </span>
                        <span className="text-sm font-bold" style={{ color: isSelected ? buttonColor : undefined }}>
                          from €{tour.half_day_rate ?? tour.daily_rate}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              {selectedTour?.description && (
                <p className="text-[11px] text-muted-foreground italic px-1">{selectedTour.description}</p>
              )}
            </div>

            <Separator />

            {/* Date + duration + pax */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Tour Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn('w-full justify-start text-left font-normal h-10 text-sm', !tourDate && 'text-muted-foreground')}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {tourDate ? format(tourDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={tourDate}
                      onSelect={setTourDate}
                      disabled={d => d < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium flex items-center gap-1">
                  <Users className="h-3 w-3" /> Passengers
                </Label>
                <div className="flex items-center gap-2 h-10 rounded-md border border-input px-3">
                  <button
                    type="button"
                    onClick={() => setPax(p => Math.max(1, p - 1))}
                    className="h-7 w-7 rounded-md border border-border hover:bg-muted text-sm font-bold"
                  >−</button>
                  <span className="flex-1 text-center text-sm font-semibold">{pax}</span>
                  <button
                    type="button"
                    onClick={() => setPax(p => Math.min(20, p + 1))}
                    className="h-7 w-7 rounded-md border border-border hover:bg-muted text-sm font-bold"
                  >+</button>
                </div>
              </div>
            </div>

            {/* Duration toggle (only if tour has half-day option) */}
            {hasHalfDay && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Duration</Label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDurationType('half')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all border-2',
                      durationType === 'half' ? 'shadow-sm' : 'border-border text-muted-foreground hover:text-foreground'
                    )}
                    style={durationType === 'half' ? { borderColor: buttonColor, color: buttonColor } : undefined}
                  >
                    <Clock4 className="h-3.5 w-3.5" />
                    Half day (~{selectedTour?.half_day_hours ?? 4}h) · €{selectedTour?.half_day_rate}
                  </button>
                  <button
                    onClick={() => setDurationType('full')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all border-2',
                      durationType === 'full' ? 'shadow-sm' : 'border-border text-muted-foreground hover:text-foreground'
                    )}
                    style={durationType === 'full' ? { borderColor: buttonColor, color: buttonColor } : undefined}
                  >
                    <Clock8 className="h-3.5 w-3.5" />
                    Full day (~{selectedTour?.duration_hours ?? 8}h) · €{selectedTour?.daily_rate}
                  </button>
                </div>
              </div>
            )}

            <Separator />

            {/* Vehicle Class */}
            <div className="space-y-3">
              <Label className="text-xs font-medium">Vehicle Class</Label>
              {(['economy', 'business', 'first_class', 'van', 'suv'] as TourCategory[]).map(cat => {
                const inCat = suitableClasses.filter(vc => vc.category === cat);
                if (inCat.length === 0) return null;
                const Icon = CATEGORY_ICONS[cat];
                return (
                  <div key={cat} className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                      <Icon className="h-3 w-3" /> {CATEGORY_LABELS[cat]}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {inCat.map(vc => {
                        const isSelected = selectedClassIdx === vc.idx;
                        return (
                          <button
                            key={vc.idx}
                            onClick={() => setSelectedClassIdx(vc.idx)}
                            className={cn(
                              'p-3 rounded-xl border-2 text-left transition-all',
                              isSelected ? 'shadow-md' : 'border-border hover:border-muted-foreground/30'
                            )}
                            style={isSelected ? { borderColor: buttonColor } : undefined}
                          >
                            <p className="text-sm font-bold">{vc.label || CATEGORY_LABELS[vc.category]}</p>
                            <p className="text-[10px] text-muted-foreground">{vc.seats} seats · {vc.multiplier}×</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {suitableClasses.length === 0 && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-2.5 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <p className="text-[11px] text-destructive">No vehicle fits {pax} passengers. Reduce passenger count or contact us.</p>
                </div>
              )}
            </div>

            {/* Summary */}
            {total > 0 && suitableClasses.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-5 space-y-3"
                style={{ backgroundColor: `${buttonColor}10` }}
              >
                <p className="text-sm text-muted-foreground text-center">
                  {selectedTour?.tour_name} · {effectiveDurationType === 'full' ? 'Full day' : 'Half day'} · {selectedClass?.label}
                </p>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Base rate</span>
                  <span className="font-medium tabular-nums">€{baseRate}</span>
                </div>
                {multiplier !== 1 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{selectedClass?.label} multiplier</span>
                    <span className="font-medium tabular-nums">× {multiplier}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-3xl font-bold" style={{ color: buttonColor }}>€{total}</span>
                </div>
                <p className="text-xs text-muted-foreground text-center">Estimated price · Includes driver & guided itinerary</p>

                {config.whatsapp_number && (
                  <Button
                    className="w-full h-12 rounded-xl font-bold text-white gap-2 mt-2"
                    style={{ backgroundColor: '#25D366' }}
                    onClick={handleWhatsApp}
                    disabled={!tourDate}
                  >
                    <MessageCircle className="h-5 w-5" /> {tourDate ? 'Book via WhatsApp' : 'Pick a date to book'}
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

export default CityTourBookingForm;