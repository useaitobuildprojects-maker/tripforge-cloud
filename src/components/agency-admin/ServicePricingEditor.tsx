import { useState, useRef, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCityPricing, useAddCityPricing, useUpdateCityPricing, useDeleteCityPricing, DistanceTier } from '@/hooks/use-city-pricing';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Navigation, Globe, Map, Car, Settings2, Download, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import LocationsEditor from '@/components/agency-admin/LocationsEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { COUNTRY_LIST } from '@/lib/country-utils';
import { getCitiesForCountry } from '@/data/city-database';
import {
  TRANSFER_CATEGORIES,
  useLimoTourPricing, useAddLimoTourPrice, useDeleteLimoTourPrice,
  useCityTourPricing, useAddCityTourPrice, useDeleteCityTourPrice,
  useCarRentalPricing, useAddCarRentalPrice, useDeleteCarRentalPrice,
} from '@/hooks/use-service-pricing';

import { StorefrontConfig } from '@/types/agency';

interface Props {
  agencyId: string;
  enabledServices: string[];
  storefrontConfig: StorefrontConfig;
  onConfigChange: (config: StorefrontConfig) => void;
  country?: string;
}

const ServicePricingEditor = ({ agencyId, enabledServices, storefrontConfig, onConfigChange, country }: Props) => {
  const hasTransfer = enabledServices.includes('transfer');
  const hasLimo = enabledServices.includes('limo_tour');
  const hasCityTour = enabledServices.includes('city_tour');
  const hasCarRental = enabledServices.includes('car_rental');

  if (!hasTransfer && !hasLimo && !hasCityTour && !hasCarRental) return null;

  const tabs = [
    ...(hasTransfer ? [{ id: 'transfer', label: 'Transfer', icon: Navigation }] : []),
    ...(hasLimo ? [{ id: 'limo_tour', label: 'Limo Service', icon: Globe }] : []),
    ...(hasCityTour ? [{ id: 'city_tour', label: 'City Tour', icon: Map }] : []),
    ...(hasCarRental ? [{ id: 'car_rental', label: 'Car Rental', icon: Car }] : []),
  ];

  const defaultTab = tabs[0]?.id ?? 'transfer';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="card-premium rounded-xl p-7 space-y-6"
    >
      <div>
        <h2 className="text-lg font-display font-bold text-foreground">Service Pricing</h2>
        <p className="text-sm text-muted-foreground mt-1">Configure pricing for each enabled service type</p>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className={`grid w-full`} style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
          {tabs.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className="text-xs flex items-center gap-1.5">
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {hasTransfer && <TabsContent value="transfer" className="mt-4"><TransferPricingTab agencyId={agencyId} storefrontConfig={storefrontConfig} onConfigChange={onConfigChange} country={country} /></TabsContent>}
        {hasLimo && <TabsContent value="limo_tour" className="mt-4"><LimoServicePricingTab storefrontConfig={storefrontConfig} onConfigChange={onConfigChange} /></TabsContent>}
        {hasCityTour && <TabsContent value="city_tour" className="mt-4"><CityTourPricingTab agencyId={agencyId} storefrontConfig={storefrontConfig} onConfigChange={onConfigChange} /></TabsContent>}
        {hasCarRental && <TabsContent value="car_rental" className="mt-4"><CarRentalPricingTab agencyId={agencyId} storefrontConfig={storefrontConfig} onConfigChange={onConfigChange} /></TabsContent>}
      </Tabs>
    </motion.div>
  );
};

// ── Tier helpers (multiplier model) ──
const tierEffectiveMultiplier = (
  t: { from_km: number; to_km: number; fixed_price?: number; multiplier?: number },
  basePerKm: number
): number => {
  if (typeof t.multiplier === 'number' && t.multiplier > 0) return t.multiplier;
  if (typeof t.fixed_price === 'number' && t.fixed_price > 0 && basePerKm > 0) {
    const span = t.to_km - t.from_km;
    if (span > 0) return +(t.fixed_price / (basePerKm * span)).toFixed(2);
  }
  return 1;
};

// ── City Pricing Section ──
const CityPricingSection = ({ agencyId, globalTiers, country }: { agencyId: string; globalTiers: { from_km: number; to_km: number; fixed_price?: number; multiplier?: number }[]; country?: string }) => {
  const { data: cities = [], isSuccess } = useCityPricing(agencyId);
  const addCity = useAddCityPricing();
  const updateCity = useUpdateCityPricing();
  const deleteCity = useDeleteCityPricing();

  const [expanded, setExpanded] = useState<string | null>(null);
  const [newCityCountry, setNewCityCountry] = useState(country || 'Italy');
  const [newCityName, setNewCityName] = useState('');
  const availableCities = useMemo(() => getCitiesForCountry(newCityCountry), [newCityCountry]);

  // Tier editing state per city
  const [newTierFrom, setNewTierFrom] = useState('');
  const [newTierTo, setNewTierTo] = useState('');
  const [newTierMultiplier, setNewTierMultiplier] = useState('');
  const [newCityBasePerKm, setNewCityBasePerKm] = useState('');

  // Seed dummy cities based on agency country if none exist for that country yet
  const [seeded, setSeeded] = useState(false);
  useEffect(() => {
    if (!isSuccess || seeded) return;
    const targetCountry = country || 'Italy';
    const hasForCountry = cities.some(c => c.country === targetCountry);
    if (hasForCountry) { setSeeded(true); return; }
    const standardTiers = [
      { from_km: 0, to_km: 50, multiplier: 1.0 },
      { from_km: 50, to_km: 100, multiplier: 0.9 },
      { from_km: 100, to_km: 200, multiplier: 0.8 },
      { from_km: 200, to_km: 400, multiplier: 0.7 },
      { from_km: 400, to_km: 600, multiplier: 0.65 },
    ];
    const seedsByCountry: Record<string, { city: string; base: number }[]> = {
      Italy:    [{ city: 'Rome', base: 1.40 }, { city: 'Milan', base: 1.50 }, { city: 'Naples', base: 1.20 }, { city: 'Florence', base: 1.30 }],
      Morocco:  [{ city: 'Marrakech', base: 0.80 }, { city: 'Casablanca', base: 0.90 }, { city: 'Fes', base: 0.75 }, { city: 'Agadir', base: 0.85 }],
      Tunisia:  [{ city: 'Tunis', base: 0.70 }, { city: 'Sousse', base: 0.65 }, { city: 'Djerba', base: 0.75 }, { city: 'Hammamet', base: 0.70 }],
      France:   [{ city: 'Paris', base: 1.80 }, { city: 'Nice', base: 1.60 }, { city: 'Lyon', base: 1.50 }, { city: 'Marseille', base: 1.50 }],
      Spain:    [{ city: 'Madrid', base: 1.40 }, { city: 'Barcelona', base: 1.50 }, { city: 'Seville', base: 1.20 }, { city: 'Valencia', base: 1.20 }],
      Portugal: [{ city: 'Lisbon', base: 1.30 }, { city: 'Porto', base: 1.20 }, { city: 'Faro', base: 1.10 }],
      Greece:   [{ city: 'Athens', base: 1.20 }, { city: 'Thessaloniki', base: 1.10 }, { city: 'Heraklion', base: 1.20 }],
      Turkey:   [{ city: 'Istanbul', base: 0.90 }, { city: 'Antalya', base: 0.80 }, { city: 'Izmir', base: 0.80 }, { city: 'Bodrum', base: 0.85 }],
      Germany:  [{ city: 'Berlin', base: 1.70 }, { city: 'Munich', base: 1.80 }, { city: 'Frankfurt', base: 1.70 }, { city: 'Hamburg', base: 1.60 }],
    };
    const dummyCities = seedsByCountry[targetCountry] ?? [{ city: targetCountry, base: 1.20 }];
    setSeeded(true);
    dummyCities.forEach((d) => {
      addCity.mutate({
        agency_id: agencyId,
        city_name: d.city,
        country: targetCountry,
        transfer_base_fee: 0,
        transfer_per_km_rate: d.base,
        drop_off_fee: 0,
        distance_tiers: standardTiers,
      });
    });
  }, [isSuccess, cities, seeded, agencyId, addCity, country]);

  const handleAddCity = () => {
    if (!newCityName.trim()) return;
    const basePerKm = Number(newCityBasePerKm);
    if (isNaN(basePerKm) || basePerKm <= 0) return;
    addCity.mutate({
      agency_id: agencyId,
      city_name: newCityName.trim(),
      country: newCityCountry,
      transfer_base_fee: 0,
      transfer_per_km_rate: basePerKm,
      drop_off_fee: 0,
      distance_tiers: [...globalTiers],
    });
    setNewCityName('');
    setNewCityBasePerKm('');
  };

  const handleAddTier = (cityId: string) => {
    const from = Number(newTierFrom);
    const to = Number(newTierTo);
    const mult = Number(newTierMultiplier);
    if (isNaN(from) || isNaN(to) || isNaN(mult) || to <= from || mult <= 0) return;
    const city = cities.find(c => c.id === cityId);
    if (!city) return;
    const updated = [...(city.distance_tiers || []), { from_km: from, to_km: to, multiplier: mult }].sort((a, b) => a.from_km - b.from_km);
    updateCity.mutate({ id: cityId, agencyId, distance_tiers: updated });
    setNewTierFrom(''); setNewTierTo(''); setNewTierMultiplier('');
  };

  const handleRemoveTier = (cityId: string, tierIdx: number) => {
    const city = cities.find(c => c.id === cityId);
    if (!city) return;
    const updated = city.distance_tiers.filter((_, i) => i !== tierIdx);
    updateCity.mutate({ id: cityId, agencyId, distance_tiers: updated });
  };

  const handleUpdateDropOff = (cityId: string, value: number) => {
    updateCity.mutate({ id: cityId, agencyId, drop_off_fee: value });
  };

  const handleUpdateBasePerKm = (cityId: string, value: number) => {
    updateCity.mutate({ id: cityId, agencyId, transfer_per_km_rate: value });
  };

  const handleUpdateTierMultiplier = (cityId: string, tierIdx: number, value: number) => {
    const city = cities.find(c => c.id === cityId);
    if (!city) return;
    const updated = city.distance_tiers.map((t, i) =>
      i === tierIdx ? { from_km: t.from_km, to_km: t.to_km, multiplier: value } : t
    );
    updateCity.mutate({ id: cityId, agencyId, distance_tiers: updated });
  };

  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <div>
        <h4 className="text-xs font-semibold text-foreground">Step 3 — City-Specific Pricing</h4>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Override distance tiers per city. Trips originating from a city use that city's tiers instead of global ones.
        </p>
      </div>

      {/* Existing cities */}
      {cities.map((city) => (
        <div key={city.id} className="border border-border rounded-lg overflow-hidden">
          <div
            className="flex items-center justify-between px-3 py-2 bg-secondary/30 cursor-pointer"
            onClick={() => setExpanded(expanded === city.id ? null : city.id)}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">{city.city_name}</span>
              <span className="text-[10px] text-muted-foreground">{city.country}</span>
              <span className="text-[10px] text-muted-foreground">·</span>
              <span className="text-[10px] text-muted-foreground">{city.distance_tiers.length} tiers</span>
              {city.drop_off_fee > 0 && (
                <span className="text-[10px] text-muted-foreground">· Drop-off: €{city.drop_off_fee}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); deleteCity.mutate({ id: city.id, agencyId }); }}>
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          </div>

          {expanded === city.id && (
            <div className="p-3 space-y-3">
              {/* Base per-km + Drop-off fee */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[10px] whitespace-nowrap">Base price per km (€)</Label>
                  <Input type="number" min={0} step={0.05} value={city.transfer_per_km_rate ?? 0}
                    onChange={(e) => handleUpdateBasePerKm(city.id, Number(e.target.value) || 0)}
                    className="text-xs font-mono w-full" />
                  <p className="text-[10px] text-muted-foreground">Each tier multiplier scales this base.</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] whitespace-nowrap">Drop-off fee (€)</Label>
                  <Input type="number" min={0} step={1} value={city.drop_off_fee}
                    onChange={(e) => handleUpdateDropOff(city.id, Number(e.target.value) || 0)}
                    className="text-xs font-mono w-full" />
                  <p className="text-[10px] text-muted-foreground">Applied for intercity trips.</p>
                </div>
              </div>

              {/* Tiers table */}
              {city.distance_tiers.length > 0 && (
                <table className="w-full text-xs border border-border rounded-lg overflow-hidden">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="px-3 py-1.5 text-left font-medium text-muted-foreground">From (km)</th>
                      <th className="px-3 py-1.5 text-left font-medium text-muted-foreground">To (km)</th>
                      <th className="px-3 py-1.5 text-right font-medium text-muted-foreground">Multiplier (×)</th>
                      <th className="px-3 py-1.5 text-right font-medium text-muted-foreground">€/km</th>
                      <th className="px-3 py-1.5 w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {city.distance_tiers.map((t, i) => {
                      const base = city.transfer_per_km_rate ?? 0;
                      const eff = tierEffectiveMultiplier(t, base);
                      return (
                        <tr key={i} className="border-t border-border">
                          <td className="px-3 py-1.5 font-mono">{t.from_km}</td>
                          <td className="px-3 py-1.5 font-mono">{t.to_km}</td>
                          <td className="px-3 py-1.5 text-right font-mono">
                            <Input
                              type="number"
                              min={0.1}
                              step={0.05}
                              value={eff}
                              onChange={(e) => handleUpdateTierMultiplier(city.id, i, Number(e.target.value) || 0)}
                              className="text-xs font-mono w-20 ml-auto"
                            />
                          </td>
                          <td className="px-3 py-1.5 text-right font-mono text-muted-foreground">
                            €{(base * eff).toFixed(2)}
                          </td>
                          <td className="px-3 py-1.5">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveTier(city.id, i)}>
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {/* Add tier */}
              <div className="grid grid-cols-4 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px]">From (km)</Label>
                  <Input type="number" min={0} placeholder="0" value={newTierFrom} onChange={(e) => setNewTierFrom(e.target.value)} className="text-xs font-mono" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">To (km)</Label>
                  <Input type="number" min={0} placeholder="50" value={newTierTo} onChange={(e) => setNewTierTo(e.target.value)} className="text-xs font-mono" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Multiplier (×)</Label>
                  <Input type="number" min={0.1} step={0.05} placeholder="1.0" value={newTierMultiplier} onChange={(e) => setNewTierMultiplier(e.target.value)} className="text-xs font-mono" />
                </div>
                <div className="flex items-end">
                  <Button size="sm" onClick={() => handleAddTier(city.id)} disabled={!newTierFrom || !newTierTo || !newTierMultiplier} className="gradient-accent text-accent-foreground w-full h-8">
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add new city */}
      <div className="flex items-end gap-2 pt-2 border-t border-border">
        <div className="space-y-1 w-36">
          <Label className="text-[10px]">Country</Label>
          <Select value={newCityCountry} onValueChange={(v) => { setNewCityCountry(v); setNewCityName(''); }}>
            <SelectTrigger className="text-xs h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              {COUNTRY_LIST.map((c) => (
                <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1 flex-1">
          <Label className="text-[10px]">City</Label>
          <Select value={newCityName} onValueChange={setNewCityName}>
            <SelectTrigger className="text-xs h-8"><SelectValue placeholder="Select city…" /></SelectTrigger>
            <SelectContent>
              {availableCities.map((c) => (
                <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1 w-32">
          <Label className="text-[10px]">Base €/km</Label>
          <Input
            type="number"
            min={0.05}
            step={0.05}
            placeholder="1.20"
            value={newCityBasePerKm}
            onChange={(e) => setNewCityBasePerKm(e.target.value)}
            className="text-xs font-mono h-8"
          />
        </div>
        <Button
          size="sm"
          onClick={handleAddCity}
          disabled={!newCityName.trim() || !newCityBasePerKm || Number(newCityBasePerKm) <= 0 || addCity.isPending}
          className="gradient-accent text-accent-foreground h-8"
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> Add City
        </Button>
      </div>
    </div>
  );
};

// ── Transfer Tab ──
const TransferPricingTab = ({ agencyId, storefrontConfig, onConfigChange, country }: { agencyId: string; storefrontConfig: StorefrontConfig; onConfigChange: (c: StorefrontConfig) => void; country?: string }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showTiers, setShowTiers] = useState(false);
  const [newTierFrom, setNewTierFrom] = useState('');
  const [newTierTo, setNewTierTo] = useState('');
  const [newTierMultiplier, setNewTierMultiplier] = useState('');

  // Vehicle classes
  const [newClassCategory, setNewClassCategory] = useState<'economy' | 'business' | 'first_class'>('economy');
  const [newClassLabel, setNewClassLabel] = useState('');
  const [newClassSeats, setNewClassSeats] = useState('');
  const [newClassMultiplier, setNewClassMultiplier] = useState('');

  const vehicleClasses = storefrontConfig.transfer_vehicle_classes ?? [
    { category: 'economy' as const, label: 'Economy Sedan', seats: 3, multiplier: 1 },
    { category: 'economy' as const, label: 'Economy MPV', seats: 4, multiplier: 1.1 },
    { category: 'business' as const, label: 'Business Sedan', seats: 3, multiplier: 1.6 },
    { category: 'first_class' as const, label: 'First Class', seats: 3, multiplier: 2.4 },
  ];

  const tiers = storefrontConfig.transfer_distance_tiers ?? [
    { from_km: 0, to_km: 50, multiplier: 1.0 },
    { from_km: 50, to_km: 100, multiplier: 0.9 },
    { from_km: 100, to_km: 200, multiplier: 0.8 },
    { from_km: 200, to_km: 300, multiplier: 0.75 },
    { from_km: 300, to_km: 500, multiplier: 0.7 },
  ];

  const globalBasePerKm = storefrontConfig.transfer_per_km_rate ?? 0;

  const addVehicleClass = () => {
    const seats = Number(newClassSeats);
    const multiplier = Number(newClassMultiplier);
    if (!newClassLabel || isNaN(seats) || seats < 1 || isNaN(multiplier) || multiplier <= 0) return;
    const updated = [...vehicleClasses, { category: newClassCategory, label: newClassLabel, seats, multiplier }];
    onConfigChange({ ...storefrontConfig, transfer_vehicle_classes: updated });
    setNewClassLabel(''); setNewClassSeats(''); setNewClassMultiplier('');
  };

  const removeVehicleClass = (idx: number) => {
    const updated = vehicleClasses.filter((_, i) => i !== idx);
    onConfigChange({ ...storefrontConfig, transfer_vehicle_classes: updated.length ? updated : undefined });
  };

  const updateVehicleClass = (idx: number, field: string, value: string | number) => {
    const updated = [...vehicleClasses];
    updated[idx] = { ...updated[idx], [field]: value };
    onConfigChange({ ...storefrontConfig, transfer_vehicle_classes: updated });
  };

  const addTier = () => {
    const from = Number(newTierFrom);
    const to = Number(newTierTo);
    const mult = Number(newTierMultiplier);
    if (isNaN(from) || isNaN(to) || isNaN(mult) || to <= from || mult <= 0) return;
    const updated = [...tiers, { from_km: from, to_km: to, multiplier: mult }].sort((a, b) => a.from_km - b.from_km);
    onConfigChange({ ...storefrontConfig, transfer_distance_tiers: updated });
    setNewTierFrom(''); setNewTierTo(''); setNewTierMultiplier('');
  };

  const updateGlobalTierMultiplier = (idx: number, value: number) => {
    const updated = tiers.map((t, i) => i === idx ? { from_km: t.from_km, to_km: t.to_km, multiplier: value } : t);
    onConfigChange({ ...storefrontConfig, transfer_distance_tiers: updated });
  };

  const removeTier = (idx: number) => {
    const updated = tiers.filter((_, i) => i !== idx);
    onConfigChange({ ...storefrontConfig, transfer_distance_tiers: updated.length ? updated : undefined });
  };

  // Group by category for display
  const categoryOrder = ['economy', 'business', 'first_class'] as const;
  const categoryLabels: Record<string, string> = { economy: 'Economy', business: 'Business', first_class: 'First Class' };

  return (
    <div className="space-y-5">
      {/* Step 1: Vehicle Classes */}
      <div className="rounded-lg border border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-foreground">Step 1 — Vehicle Classes</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">Each category can have multiple vehicle classes with different seat counts and price multipliers.</p>
          </div>
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setShowSettings(!showSettings)}>
            <Settings2 className="h-3.5 w-3.5 mr-1" /> {showSettings ? 'Hide' : 'Edit'}
          </Button>
        </div>
        {showSettings && (
          <div className="space-y-4 pt-2 border-t border-border">
            {/* Existing classes grouped by category */}
            {categoryOrder.map((cat) => {
              const catClasses = vehicleClasses.map((vc, origIdx) => ({ ...vc, origIdx })).filter(vc => vc.category === cat);
              if (catClasses.length === 0) return null;
              return (
                <div key={cat} className="space-y-2">
                  <p className="text-[11px] font-semibold text-foreground">{categoryLabels[cat]}</p>
                  <div className="space-y-1.5">
                    {catClasses.map((vc) => (
                      <div key={vc.origIdx} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20">
                        <Input value={vc.label || ''} placeholder="Label" className="text-xs flex-1"
                          onChange={(e) => updateVehicleClass(vc.origIdx, 'label', e.target.value)} />
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-muted-foreground">Seats:</span>
                          <Input type="number" min={1} max={50} value={vc.seats} className="text-xs font-mono w-16"
                            onChange={(e) => updateVehicleClass(vc.origIdx, 'seats', Number(e.target.value) || 1)} />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-muted-foreground">×</span>
                          <Input type="number" min={0.1} step={0.1} value={vc.multiplier} className="text-xs font-mono w-16"
                            onChange={(e) => updateVehicleClass(vc.origIdx, 'multiplier', Number(e.target.value) || 1)} />
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeVehicleClass(vc.origIdx)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Add new class */}
            <div className="border-t border-border pt-3 space-y-2">
              <p className="text-[11px] font-semibold text-foreground">Add New Vehicle Class</p>
              <div className="grid grid-cols-5 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px]">Category</Label>
                  <Select value={newClassCategory} onValueChange={(v) => setNewClassCategory(v as any)}>
                    <SelectTrigger className="text-xs h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="economy">Economy</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="first_class">First Class</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Label</Label>
                  <Input placeholder="e.g. Minibus" value={newClassLabel} onChange={(e) => setNewClassLabel(e.target.value)} className="text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Seats</Label>
                  <Input type="number" min={1} placeholder="8" value={newClassSeats} onChange={(e) => setNewClassSeats(e.target.value)} className="text-xs font-mono" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Multiplier</Label>
                  <Input type="number" min={0.1} step={0.1} placeholder="1.5" value={newClassMultiplier} onChange={(e) => setNewClassMultiplier(e.target.value)} className="text-xs font-mono" />
                </div>
                <div className="flex items-end">
                  <Button size="sm" onClick={addVehicleClass} disabled={!newClassLabel || !newClassSeats || !newClassMultiplier} className="gradient-accent text-accent-foreground w-full h-8">
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        {!showSettings && (
          <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
            {vehicleClasses.map((vc, i) => (
              <span key={i} className="bg-muted/30 px-2 py-0.5 rounded">
                {vc.label || `${categoryLabels[vc.category]} ${vc.seats}s`}: <strong className="text-foreground">{vc.multiplier}× · {vc.seats} seats</strong>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Step 2: Distance Tiers (multipliers) */}
      <div className="rounded-lg border border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-foreground">Step 2 — Distance Tier Multipliers</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Each tier multiplies the base per-km rate (Step 4) for km in that range. Beyond the last tier, the last multiplier applies.
            </p>
          </div>
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setShowTiers(!showTiers)}>
            <Settings2 className="h-3.5 w-3.5 mr-1" /> {showTiers ? 'Hide' : 'Edit'} Tiers
          </Button>
        </div>
        {showTiers && (
          <div className="space-y-3 pt-2 border-t border-border">
            {tiers.length > 0 && (
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-secondary/50">
                    <tr>
                      <th className="px-3 py-1.5 text-left font-medium text-muted-foreground">From (km)</th>
                      <th className="px-3 py-1.5 text-left font-medium text-muted-foreground">To (km)</th>
                      <th className="px-3 py-1.5 text-right font-medium text-muted-foreground">Multiplier (×)</th>
                      <th className="px-3 py-1.5 text-right font-medium text-muted-foreground">€/km</th>
                      <th className="px-3 py-1.5 w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {tiers.map((t, i) => {
                      const eff = tierEffectiveMultiplier(t, globalBasePerKm);
                      return (
                        <tr key={i} className="border-t border-border">
                          <td className="px-3 py-1.5 font-mono">{t.from_km}</td>
                          <td className="px-3 py-1.5 font-mono">{t.to_km}</td>
                          <td className="px-3 py-1.5 text-right">
                            <Input type="number" min={0.1} step={0.05} value={eff}
                              onChange={(e) => updateGlobalTierMultiplier(i, Number(e.target.value) || 0)}
                              className="text-xs font-mono w-20 ml-auto" />
                          </td>
                          <td className="px-3 py-1.5 text-right font-mono text-muted-foreground">
                            €{(globalBasePerKm * eff).toFixed(2)}
                          </td>
                          <td className="px-3 py-1.5">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeTier(i)}>
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <div className="grid grid-cols-4 gap-2">
              <div className="space-y-1">
                <Label className="text-[11px]">From (km)</Label>
                <Input type="number" min={0} step={50} placeholder="0" value={newTierFrom} onChange={(e) => setNewTierFrom(e.target.value)} className="text-xs font-mono" />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">To (km)</Label>
                <Input type="number" min={0} step={50} placeholder="100" value={newTierTo} onChange={(e) => setNewTierTo(e.target.value)} className="text-xs font-mono" />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Multiplier (×)</Label>
                <Input type="number" min={0.1} step={0.05} placeholder="1.0" value={newTierMultiplier} onChange={(e) => setNewTierMultiplier(e.target.value)} className="text-xs font-mono" />
              </div>
              <div className="flex items-end">
                <Button size="sm" onClick={addTier} disabled={!newTierFrom || !newTierTo || !newTierMultiplier} className="gradient-accent text-accent-foreground w-full">
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Tier
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Step 3: City-Specific Pricing */}
      <CityPricingSection agencyId={agencyId} globalTiers={tiers} country={country} />

      {/* Step 4: Global base per-km — used by global tiers and as fallback for cities without their own */}
      <div className="rounded-lg border border-border bg-muted/5 p-4 space-y-3">
        <h4 className="text-xs font-semibold text-foreground">Step 4 — Base Per-KM Rate</h4>
        <p className="text-[11px] text-muted-foreground">
          Base €/km used by global tier multipliers. Cities can override this with their own base per-km rate.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-[11px]">Per-KM Price (€)</Label>
            <Input type="number" min={0} step={0.05} placeholder="1.20"
              value={storefrontConfig.transfer_per_km_rate ?? ''}
              onChange={(e) => onConfigChange({ ...storefrontConfig, transfer_per_km_rate: e.target.value ? Number(e.target.value) : undefined })}
              className="text-xs font-mono" />
          </div>
        </div>
      </div>

    </div>
  );
};

// ── Limo Service Tab (city daily rates + itinerary pricing) ──
const DEFAULT_LIMO_MULTIPLIERS = { business: 1, first_class: 2.4, van: 1.6, suv: 1.6 };

const DEFAULT_LIMO_VEHICLE_CLASSES: NonNullable<StorefrontConfig['limo_vehicle_classes']> = [
  { category: 'business', label: 'Business Sedan', seats: 3, multiplier: 1 },
  { category: 'business', label: 'Business Van', seats: 7, multiplier: 1.6 },
  { category: 'first_class', label: 'First Class Sedan', seats: 3, multiplier: 2.4 },
  { category: 'suv', label: 'Luxury SUV', seats: 5, multiplier: 1.6 },
];

const LIMO_CATEGORY_ORDER = ['business', 'first_class', 'suv'] as const;
const LIMO_CATEGORY_LABELS: Record<string, string> = {
  business: 'Business',
  first_class: 'First Class',
  suv: 'SUV',
};

const DEFAULT_LIMO_CITY_RATES: NonNullable<StorefrontConfig['limo_city_rates']> = [
  { city: 'Rome', country: 'Italy', full_day_rate: 380, half_day_rate: 230, max_days: 5 },
  { city: 'Milan', country: 'Italy', full_day_rate: 400, half_day_rate: 240, max_days: 4 },
  { city: 'Florence', country: 'Italy', full_day_rate: 350, half_day_rate: 210, max_days: 3 },
  { city: 'Paris', country: 'France', full_day_rate: 450, half_day_rate: 270, max_days: 5 },
  { city: 'Barcelona', country: 'Spain', full_day_rate: 380, half_day_rate: 230, max_days: 4 },
  { city: 'Istanbul', country: 'Turkey', full_day_rate: 320, half_day_rate: 190, max_days: 5 },
];

const LimoServicePricingTab = ({ storefrontConfig, onConfigChange }: { storefrontConfig: StorefrontConfig; onConfigChange: (c: StorefrontConfig) => void }) => {
  const [newCountry, setNewCountry] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newFullDay, setNewFullDay] = useState('');
  const [newHalfDay, setNewHalfDay] = useState('');
  const [newMaxDays, setNewMaxDays] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const [showClasses, setShowClasses] = useState(false);

  // Vehicle class form state
  const [newClassCategory, setNewClassCategory] = useState<'business' | 'first_class' | 'suv'>('business');
  const [newClassLabel, setNewClassLabel] = useState('');
  const [newClassSeats, setNewClassSeats] = useState('');
  const [newClassMultiplier, setNewClassMultiplier] = useState('');

  const cityRates = storefrontConfig.limo_city_rates ?? [];
  const vehicleClasses = storefrontConfig.limo_vehicle_classes ?? DEFAULT_LIMO_VEHICLE_CLASSES;
  const newCityOptions = newCountry ? getCitiesForCountry(newCountry) : [];

  const downloadTemplate = () => {
    const data = [
      { Country: 'Italy', City: 'Milan', '10h Rate (€)': 400, '8h Rate (€)': 240, 'Max Days': 4 },
      { Country: 'Italy', City: 'Florence', '10h Rate (€)': 350, '8h Rate (€)': 210, 'Max Days': 3 },
      { Country: 'Italy', City: 'Rome', '10h Rate (€)': 380, '8h Rate (€)': 230, 'Max Days': 5 },
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Limo City Rates');
    XLSX.writeFile(wb, 'limo_city_rates_template.xlsx');
  };

  const exportRates = () => {
    if (cityRates.length === 0) { toast.error('No city rates to export'); return; }
    const data = cityRates.map((cr) => ({
      Country: cr.country ?? '',
      City: cr.city,
      '10h Rate (€)': cr.full_day_rate,
      '8h Rate (€)': cr.half_day_rate,
      'Max Days': cr.max_days ?? '',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Limo City Rates');
    XLSX.writeFile(wb, 'limo_city_rates_export.xlsx');
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const ab = await file.arrayBuffer();
      const wb = XLSX.read(ab);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(ws);
      const merged = [...cityRates];
      let added = 0; let updated = 0;
      for (const row of rows) {
        const country = String(row['Country'] ?? '').trim();
        const city = String(row['City'] ?? '').trim();
        const full = Number(row['10h Rate (€)'] ?? row['10h Rate'] ?? 0);
        const half = Number(row['8h Rate (€)'] ?? row['8h Rate'] ?? 0) || Math.round(full * 0.6);
        const maxDaysRaw = Number(row['Max Days'] ?? row['MaxDays'] ?? 0);
        const max_days = maxDaysRaw > 0 ? maxDaysRaw : undefined;
        if (!city || !full) continue;
        const existing = merged.findIndex((c) => c.city.toLowerCase() === city.toLowerCase());
        if (existing >= 0) { merged[existing] = { city, country: country || merged[existing].country, full_day_rate: full, half_day_rate: half, max_days: max_days ?? merged[existing].max_days }; updated++; }
        else { merged.push({ city, country: country || undefined, full_day_rate: full, half_day_rate: half, max_days }); added++; }
      }
      onConfigChange({ ...storefrontConfig, limo_city_rates: merged });
      toast.success(`Imported: ${added} added, ${updated} updated`);
    } catch (err) {
      toast.error('Failed to import Excel file');
      console.error(err);
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const addVehicleClass = () => {
    const seats = Number(newClassSeats);
    const multiplier = Number(newClassMultiplier);
    if (!newClassLabel || isNaN(seats) || seats < 1 || isNaN(multiplier) || multiplier <= 0) return;
    const updated = [...vehicleClasses, { category: newClassCategory, label: newClassLabel, seats, multiplier }];
    onConfigChange({ ...storefrontConfig, limo_vehicle_classes: updated });
    setNewClassLabel(''); setNewClassSeats(''); setNewClassMultiplier('');
  };

  const removeVehicleClass = (idx: number) => {
    const updated = vehicleClasses.filter((_, i) => i !== idx);
    onConfigChange({ ...storefrontConfig, limo_vehicle_classes: updated.length ? updated : undefined });
  };

  const updateVehicleClass = (idx: number, field: string, value: string | number) => {
    const updated = [...vehicleClasses];
    updated[idx] = { ...updated[idx], [field]: value };
    onConfigChange({ ...storefrontConfig, limo_vehicle_classes: updated });
  };

  const addCityRate = () => {
    if (!newCity || !newFullDay) return;
    const max_days = Number(newMaxDays);
    const updated = [...cityRates, {
      city: newCity,
      country: newCountry || undefined,
      full_day_rate: Number(newFullDay),
      half_day_rate: Number(newHalfDay) || Math.round(Number(newFullDay) * 0.6),
      max_days: max_days > 0 ? max_days : undefined,
    }];
    onConfigChange({ ...storefrontConfig, limo_city_rates: updated });
    setNewCity(''); setNewFullDay(''); setNewHalfDay(''); setNewMaxDays('');
  };

  const updateCityRate = (idx: number, field: 'max_days' | 'full_day_rate' | 'half_day_rate', value: number | undefined) => {
    const updated = [...cityRates];
    updated[idx] = { ...updated[idx], [field]: value } as typeof updated[number];
    onConfigChange({ ...storefrontConfig, limo_city_rates: updated });
  };

  const removeCityRate = (idx: number) => {
    const updated = cityRates.filter((_, i) => i !== idx);
    onConfigChange({ ...storefrontConfig, limo_city_rates: updated.length ? updated : undefined });
  };

  return (
    <div className="space-y-5">
      {/* How it works */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
        <h4 className="text-xs font-semibold text-foreground">How Limo pricing works</h4>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Customers build a day-by-day itinerary. For each day they pick a <strong>city</strong> and choose <strong>8h</strong> or <strong>10h</strong> service.
          Total = sum of (city rate × days) × vehicle multiplier.
        </p>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          <strong>Example:</strong> Milan 10h €400 × 3 + Florence 10h €350 × 2 + Rome 10h €380 × 4 = €1,200 + €700 + €1,520 = <strong>€3,420</strong> (Business Sedan).
        </p>
      </div>

      {/* City Daily Rates */}
      <div className="rounded-lg border border-border p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-xs font-semibold text-foreground">City Rates</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">Set the 8h and 10h chauffeur rate for each city you serve.</p>
          </div>
          <div className="flex gap-1.5 shrink-0 flex-wrap justify-end">
            <Button size="sm" variant="outline" onClick={() => {
              const merged = [...cityRates];
              let added = 0;
              for (const sample of DEFAULT_LIMO_CITY_RATES) {
                if (!merged.some((c) => c.city.toLowerCase() === sample.city.toLowerCase())) {
                  merged.push(sample); added++;
                }
              }
              onConfigChange({ ...storefrontConfig, limo_city_rates: merged });
              toast.success(added ? `Added ${added} sample cities` : 'Sample cities already present');
            }} className="h-7 text-[11px]">
              <Plus className="h-3 w-3 mr-1" /> Load Sample
            </Button>
            <Button size="sm" variant="outline" onClick={downloadTemplate} className="h-7 text-[11px]">
              <Download className="h-3 w-3 mr-1" /> Template
            </Button>
            <Button size="sm" variant="outline" onClick={exportRates} className="h-7 text-[11px]">
              <Download className="h-3 w-3 mr-1" /> Export
            </Button>
            <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} className="h-7 text-[11px]">
              <Upload className="h-3 w-3 mr-1" /> Import
            </Button>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleUpload} />
          </div>
        </div>

        {cityRates.length > 0 && (
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-3 py-1.5 text-left font-medium text-muted-foreground">Country</th>
                  <th className="px-3 py-1.5 text-left font-medium text-muted-foreground">City</th>
                  <th className="px-3 py-1.5 text-right font-medium text-muted-foreground">10h Rate (€)</th>
                  <th className="px-3 py-1.5 text-right font-medium text-muted-foreground">8h Rate (€)</th>
                  <th className="px-3 py-1.5 text-right font-medium text-muted-foreground">Max Days</th>
                  <th className="px-3 py-1.5 w-10" />
                </tr>
              </thead>
              <tbody>
                {cityRates.map((cr, i) => (
                  <tr key={i} className="border-t border-border hover:bg-secondary/20">
                    <td className="px-3 py-1.5 text-muted-foreground">{cr.country ?? '—'}</td>
                    <td className="px-3 py-1.5 text-foreground font-medium">{cr.city}</td>
                    <td className="px-3 py-1.5 text-right font-mono text-foreground">€{cr.full_day_rate}</td>
                    <td className="px-3 py-1.5 text-right font-mono text-foreground">€{cr.half_day_rate}</td>
                    <td className="px-3 py-1.5">
                      <Input
                        type="number"
                        min={1}
                        max={30}
                        value={cr.max_days ?? ''}
                        placeholder="∞"
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          updateCityRate(i, 'max_days', v > 0 ? v : undefined);
                        }}
                        className="text-xs font-mono h-7 w-16 ml-auto text-right"
                      />
                    </td>
                    <td className="px-3 py-1.5">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeCityRate(i)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="grid grid-cols-6 gap-2">
          <div className="space-y-1">
            <Label className="text-[11px]">Country</Label>
            <Select value={newCountry} onValueChange={(v) => { setNewCountry(v); setNewCity(''); }}>
              <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select country" /></SelectTrigger>
              <SelectContent>
                {COUNTRY_LIST.map((c) => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">City</Label>
            <Select value={newCity} onValueChange={setNewCity} disabled={!newCountry}>
              <SelectTrigger className="h-9 text-xs"><SelectValue placeholder={newCountry ? 'Select city' : 'Pick country first'} /></SelectTrigger>
              <SelectContent>
                {newCityOptions.map((c) => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">10h Rate (€)</Label>
            <Input type="number" min={0} placeholder="300" value={newFullDay} onChange={(e) => setNewFullDay(e.target.value)} className="text-xs font-mono" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">8h Rate (€)</Label>
            <Input type="number" min={0} placeholder="180" value={newHalfDay} onChange={(e) => setNewHalfDay(e.target.value)} className="text-xs font-mono" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Max Days</Label>
            <Input type="number" min={1} max={30} placeholder="5" value={newMaxDays} onChange={(e) => setNewMaxDays(e.target.value)} className="text-xs font-mono" />
          </div>
          <div className="flex items-end">
            <Button size="sm" onClick={addCityRate} disabled={!newCity || !newFullDay} className="gradient-accent text-accent-foreground w-full">
              <Plus className="h-3.5 w-3.5 mr-1" /> Add
            </Button>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground">If 8h is blank, defaults to 60% of 10h. Max Days caps how many days a customer can stay in this city (blank = unlimited).</p>
      </div>

      {/* Vehicle Classes (Transfer-style: multiple sub-classes per category) */}
      <div className="rounded-lg border border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-foreground">Vehicle Classes</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Each category can have multiple vehicle classes with different seat counts and price multipliers. City rates are for the base 1× class.
            </p>
          </div>
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setShowClasses(!showClasses)}>
            <Settings2 className="h-3.5 w-3.5 mr-1" /> {showClasses ? 'Hide' : 'Edit'}
          </Button>
        </div>

        {showClasses && (
          <div className="space-y-4 pt-2 border-t border-border">
            {LIMO_CATEGORY_ORDER.map((cat) => {
              const catClasses = vehicleClasses.map((vc, origIdx) => ({ ...vc, origIdx })).filter(vc => vc.category === cat);
              if (catClasses.length === 0) return null;
              return (
                <div key={cat} className="space-y-2">
                  <p className="text-[11px] font-semibold text-foreground">{LIMO_CATEGORY_LABELS[cat]}</p>
                  <div className="space-y-1.5">
                    {catClasses.map((vc) => (
                      <div key={vc.origIdx} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20">
                        <Input value={vc.label || ''} placeholder="Label" className="text-xs flex-1"
                          onChange={(e) => updateVehicleClass(vc.origIdx, 'label', e.target.value)} />
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-muted-foreground">Seats:</span>
                          <Input type="number" min={1} max={50} value={vc.seats} className="text-xs font-mono w-16"
                            onChange={(e) => updateVehicleClass(vc.origIdx, 'seats', Number(e.target.value) || 1)} />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-muted-foreground">×</span>
                          <Input type="number" min={0.1} step={0.1} value={vc.multiplier} className="text-xs font-mono w-16"
                            onChange={(e) => updateVehicleClass(vc.origIdx, 'multiplier', Number(e.target.value) || 1)} />
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeVehicleClass(vc.origIdx)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="border-t border-border pt-3 space-y-2">
              <p className="text-[11px] font-semibold text-foreground">Add New Vehicle Class</p>
              <div className="grid grid-cols-5 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px]">Category</Label>
                  <Select value={newClassCategory} onValueChange={(v) => setNewClassCategory(v as any)}>
                    <SelectTrigger className="text-xs h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="first_class">First Class</SelectItem>
                      <SelectItem value="van">Van</SelectItem>
                      <SelectItem value="suv">SUV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Label</Label>
                  <Input placeholder="e.g. Premium Van" value={newClassLabel} onChange={(e) => setNewClassLabel(e.target.value)} className="text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Seats</Label>
                  <Input type="number" min={1} placeholder="7" value={newClassSeats} onChange={(e) => setNewClassSeats(e.target.value)} className="text-xs font-mono" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Multiplier</Label>
                  <Input type="number" min={0.1} step={0.1} placeholder="1.5" value={newClassMultiplier} onChange={(e) => setNewClassMultiplier(e.target.value)} className="text-xs font-mono" />
                </div>
                <div className="flex items-end">
                  <Button size="sm" onClick={addVehicleClass} disabled={!newClassLabel || !newClassSeats || !newClassMultiplier} className="gradient-accent text-accent-foreground w-full h-8">
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!showClasses && (
          <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
            {vehicleClasses.map((vc, i) => (
              <span key={i} className="bg-muted/30 px-2 py-0.5 rounded">
                {vc.label || `${LIMO_CATEGORY_LABELS[vc.category]} ${vc.seats}s`}: <strong className="text-foreground">{vc.multiplier}× · {vc.seats} seats</strong>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── City Tour Tab ──
const DEFAULT_CITY_TOUR_VEHICLE_CLASSES: NonNullable<StorefrontConfig['city_tour_vehicle_classes']> = [
  { category: 'economy', label: 'Economy Sedan', seats: 4, multiplier: 1 },
  { category: 'business', label: 'Business Sedan', seats: 3, multiplier: 1.3 },
  { category: 'first_class', label: 'First Class Sedan', seats: 3, multiplier: 1.8 },
  { category: 'van', label: 'Business Van', seats: 7, multiplier: 1.5 },
  { category: 'suv', label: 'Luxury SUV', seats: 4, multiplier: 1.7 },
];

const CITY_TOUR_CATEGORY_ORDER: Array<NonNullable<StorefrontConfig['city_tour_vehicle_classes']>[number]['category']> = ['economy', 'business', 'first_class', 'van', 'suv'];
const CITY_TOUR_CATEGORY_LABELS: Record<NonNullable<StorefrontConfig['city_tour_vehicle_classes']>[number]['category'], string> = {
  economy: 'Economy', business: 'Business', first_class: 'First Class', van: 'Van', suv: 'SUV',
};

const CityTourPricingTab = ({ agencyId, storefrontConfig, onConfigChange }: { agencyId: string; storefrontConfig: StorefrontConfig; onConfigChange: (c: StorefrontConfig) => void }) => {
  const { data: tours = [], isLoading } = useCityTourPricing(agencyId);
  const addTour = useAddCityTourPrice();
  const deleteTour = useDeleteCityTourPrice();
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [rate, setRate] = useState('');
  const [hours, setHours] = useState('8');
  const [halfRate, setHalfRate] = useState('');
  const [halfHours, setHalfHours] = useState('4');
  const [desc, setDesc] = useState('');

  const vehicleClasses = storefrontConfig.city_tour_vehicle_classes ?? DEFAULT_CITY_TOUR_VEHICLE_CLASSES;
  const [showClasses, setShowClasses] = useState(false);
  const [newClassCategory, setNewClassCategory] = useState<NonNullable<StorefrontConfig['city_tour_vehicle_classes']>[number]['category']>('business');
  const [newClassLabel, setNewClassLabel] = useState('');
  const [newClassSeats, setNewClassSeats] = useState('');
  const [newClassMultiplier, setNewClassMultiplier] = useState('');

  const updateVehicleClass = (idx: number, field: 'label' | 'seats' | 'multiplier', value: string | number) => {
    const updated = [...vehicleClasses];
    updated[idx] = { ...updated[idx], [field]: value } as typeof updated[number];
    onConfigChange({ ...storefrontConfig, city_tour_vehicle_classes: updated });
  };
  const removeVehicleClass = (idx: number) => {
    const updated = vehicleClasses.filter((_, i) => i !== idx);
    onConfigChange({ ...storefrontConfig, city_tour_vehicle_classes: updated.length ? updated : undefined });
  };
  const addVehicleClass = () => {
    const seats = Number(newClassSeats);
    const multiplier = Number(newClassMultiplier);
    if (!newClassLabel || isNaN(seats) || seats < 1 || isNaN(multiplier) || multiplier <= 0) return;
    onConfigChange({ ...storefrontConfig, city_tour_vehicle_classes: [...vehicleClasses, { category: newClassCategory, label: newClassLabel, seats, multiplier }] });
    setNewClassLabel(''); setNewClassSeats(''); setNewClassMultiplier('');
  };

  const cityOptions = country ? getCitiesForCountry(country) : [];

  const handleAdd = () => {
    if (!name || !rate || !country || !city) return;
    const fullRate = Number(rate);
    const hRate = halfRate ? Number(halfRate) : Math.round(fullRate * 0.6);
    addTour.mutate({
      agency_id: agencyId,
      tour_name: name,
      country,
      city,
      daily_rate: fullRate,
      duration_hours: Number(hours) || 8,
      half_day_rate: hRate,
      half_day_hours: Number(halfHours) || 4,
      description: desc || null,
    });
    setName(''); setCountry(''); setCity(''); setRate(''); setHours('8'); setHalfRate(''); setHalfHours('4'); setDesc('');
  };

  const loadDemo = () => {
    const demos: Array<Omit<Parameters<typeof addTour.mutate>[0], 'agency_id'>> = [
      { tour_name: 'Rome Highlights', country: 'Italy', city: 'Rome', daily_rate: 450, duration_hours: 8, half_day_rate: 270, half_day_hours: 4, description: 'Colosseum, Vatican, Trevi Fountain — guided tour with luxury sedan.' },
      { tour_name: 'Paris Romantic Day', country: 'France', city: 'Paris', daily_rate: 520, duration_hours: 8, half_day_rate: 320, half_day_hours: 4, description: 'Eiffel Tower, Louvre, Champs-Élysées with English-speaking driver.' },
      { tour_name: 'Istanbul Old City', country: 'Turkey', city: 'Istanbul', daily_rate: 380, duration_hours: 8, half_day_rate: 230, half_day_hours: 4, description: 'Hagia Sophia, Blue Mosque, Grand Bazaar — half or full day options.' },
      { tour_name: 'Barcelona Gaudí Tour', country: 'Spain', city: 'Barcelona', daily_rate: 420, duration_hours: 8, half_day_rate: 250, half_day_hours: 4, description: 'Sagrada Família, Park Güell, Casa Batlló with private chauffeur.' },
    ];
    demos.forEach(d => addTour.mutate({ agency_id: agencyId, ...d }));
    toast.success('Loading 4 demo city tours...');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={loadDemo} disabled={addTour.isPending}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Load demo tours
        </Button>
      </div>
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Location & Tour</p>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label className="text-[11px]">Country</Label>
            <Select value={country} onValueChange={(v) => { setCountry(v); setCity(''); }}>
              <SelectTrigger className="text-xs h-9"><SelectValue placeholder="Select country" /></SelectTrigger>
              <SelectContent>{COUNTRY_LIST.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">City</Label>
            <Select value={city} onValueChange={setCity} disabled={!country}>
              <SelectTrigger className="text-xs h-9"><SelectValue placeholder={country ? 'Select city' : 'Pick country first'} /></SelectTrigger>
              <SelectContent>{cityOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label className="text-[11px]">Tour Name</Label><Input placeholder="Rome Highlights" value={name} onChange={(e) => setName(e.target.value)} className="text-xs h-9" /></div>
        </div>
      </div>
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Full Day</p>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1"><Label className="text-[11px]">Full-Day Price (€)</Label><Input type="number" min={0} placeholder="450" value={rate} onChange={(e) => setRate(e.target.value)} className="text-xs h-9 font-mono" /></div>
          <div className="space-y-1"><Label className="text-[11px]">Full-Day Hours</Label><Input type="number" min={1} placeholder="8" value={hours} onChange={(e) => setHours(e.target.value)} className="text-xs h-9 font-mono" /></div>
          <div className="flex items-end"><Button size="sm" onClick={handleAdd} disabled={addTour.isPending || !name || !rate || !country || !city} className="gradient-accent text-accent-foreground w-full"><Plus className="h-3.5 w-3.5 mr-1" /> Add Tour</Button></div>
        </div>
      </div>
      <div>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Half Day (optional — defaults to 60% of full-day)</p>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1 col-span-2"><Label className="text-[11px]">Half-Day Price (€)</Label><Input type="number" min={0} placeholder="auto = 60%" value={halfRate} onChange={(e) => setHalfRate(e.target.value)} className="text-xs h-9 font-mono" /></div>
          <div className="space-y-1"><Label className="text-[11px]">Half-Day Hours</Label><Input type="number" min={1} placeholder="4" value={halfHours} onChange={(e) => setHalfHours(e.target.value)} className="text-xs h-9 font-mono" /></div>
        </div>
      </div>
      <div className="space-y-1"><Label className="text-[11px]">Description (optional)</Label><Input placeholder="Guided city tour with historical landmarks..." value={desc} onChange={(e) => setDesc(e.target.value)} className="text-xs" /></div>
      {isLoading ? <p className="text-xs text-muted-foreground">Loading...</p> : tours.length === 0 ? <p className="text-xs text-muted-foreground py-6 text-center">No city tours configured yet</p> : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-secondary/50"><tr>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Location</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Tour Name</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">Full Day</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">Half Day</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Description</th>
              <th className="px-3 py-2 w-10" />
            </tr></thead>
            <tbody>{tours.map((t) => {
              const halfR = t.half_day_rate ?? Math.round(t.daily_rate * 0.6);
              const halfH = t.half_day_hours ?? Math.max(2, Math.floor((t.duration_hours ?? 8) / 2));
              return (
                <tr key={t.id} className="border-t border-border hover:bg-secondary/20">
                  <td className="px-3 py-2 text-muted-foreground">{t.city ?? '—'}{t.country ? `, ${t.country}` : ''}</td>
                  <td className="px-3 py-2 text-foreground font-medium">{t.tour_name}</td>
                  <td className="px-3 py-2 text-right font-mono text-foreground">€{t.daily_rate} <span className="text-muted-foreground">/ {t.duration_hours ?? 8}h</span></td>
                  <td className="px-3 py-2 text-right font-mono text-foreground">€{halfR} <span className="text-muted-foreground">/ {halfH}h</span></td>
                  <td className="px-3 py-2 text-muted-foreground max-w-[200px] truncate">{t.description || '—'}</td>
                  <td className="px-3 py-2"><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteTour.mutate({ id: t.id, agencyId })}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></td>
                </tr>
              );
            })}</tbody>
          </table>
        </div>
      )}

      {/* Vehicle Classes — multipliers applied on top of each tour's daily rate */}
      <div className="rounded-lg border border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-foreground">Vehicle Classes</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Each category can have multiple vehicle classes with different seat counts and price multipliers. Tour prices above are for the base 1× class.
            </p>
          </div>
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setShowClasses(!showClasses)}>
            <Settings2 className="h-3.5 w-3.5 mr-1" /> {showClasses ? 'Hide' : 'Edit'}
          </Button>
        </div>

        {showClasses && (
          <div className="space-y-4 pt-2 border-t border-border">
            {CITY_TOUR_CATEGORY_ORDER.map((cat) => {
              const catClasses = vehicleClasses.map((vc, origIdx) => ({ ...vc, origIdx })).filter(vc => vc.category === cat);
              if (catClasses.length === 0) return null;
              return (
                <div key={cat} className="space-y-2">
                  <p className="text-[11px] font-semibold text-foreground">{CITY_TOUR_CATEGORY_LABELS[cat]}</p>
                  <div className="space-y-1.5">
                    {catClasses.map((vc) => (
                      <div key={vc.origIdx} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20">
                        <Input value={vc.label || ''} placeholder="Label" className="text-xs flex-1"
                          onChange={(e) => updateVehicleClass(vc.origIdx, 'label', e.target.value)} />
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-muted-foreground">Seats:</span>
                          <Input type="number" min={1} max={50} value={vc.seats} className="text-xs font-mono w-16"
                            onChange={(e) => updateVehicleClass(vc.origIdx, 'seats', Number(e.target.value) || 1)} />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-muted-foreground">×</span>
                          <Input type="number" min={0.1} step={0.1} value={vc.multiplier} className="text-xs font-mono w-16"
                            onChange={(e) => updateVehicleClass(vc.origIdx, 'multiplier', Number(e.target.value) || 1)} />
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => removeVehicleClass(vc.origIdx)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="border-t border-border pt-3 space-y-2">
              <p className="text-[11px] font-semibold text-foreground">Add New Vehicle Class</p>
              <div className="grid grid-cols-5 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px]">Category</Label>
                  <Select value={newClassCategory} onValueChange={(v) => setNewClassCategory(v as any)}>
                    <SelectTrigger className="text-xs h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="economy">Economy</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="first_class">First Class</SelectItem>
                      <SelectItem value="van">Van</SelectItem>
                      <SelectItem value="suv">SUV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Label</Label>
                  <Input placeholder="e.g. Premium Sedan" value={newClassLabel} onChange={(e) => setNewClassLabel(e.target.value)} className="text-xs" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Seats</Label>
                  <Input type="number" min={1} placeholder="4" value={newClassSeats} onChange={(e) => setNewClassSeats(e.target.value)} className="text-xs font-mono" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px]">Multiplier</Label>
                  <Input type="number" min={0.1} step={0.1} placeholder="1.5" value={newClassMultiplier} onChange={(e) => setNewClassMultiplier(e.target.value)} className="text-xs font-mono" />
                </div>
                <div className="flex items-end">
                  <Button size="sm" onClick={addVehicleClass} disabled={!newClassLabel || !newClassSeats || !newClassMultiplier} className="gradient-accent text-accent-foreground w-full h-8">
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!showClasses && (
          <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
            {vehicleClasses.map((vc, i) => (
              <span key={i} className="bg-muted/30 px-2 py-0.5 rounded">
                {vc.label || `${CITY_TOUR_CATEGORY_LABELS[vc.category]} ${vc.seats}s`}: <strong className="text-foreground">{vc.multiplier}× · {vc.seats} seats</strong>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Car Rental Tab ──
const CarRentalPricingTab = ({ agencyId, storefrontConfig, onConfigChange }: { agencyId: string; storefrontConfig: StorefrontConfig; onConfigChange: (c: StorefrontConfig) => void }) => {
  const { data: prices = [], isLoading } = useCarRentalPricing(agencyId);
  const addPrice = useAddCarRentalPrice();
  const deletePrice = useDeleteCarRentalPrice();
  const fileRef = useRef<HTMLInputElement>(null);
  const [vehicleClass, setVehicleClass] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [transmission, setTransmission] = useState('automatic');
  const [fuelType, setFuelType] = useState('gasoline');
  const [seats, setSeats] = useState('5');
  const [dailyRate, setDailyRate] = useState('');
  const [weeklyRate, setWeeklyRate] = useState('');
  const [monthlyRate, setMonthlyRate] = useState('');
  const [dropOff, setDropOff] = useState('');
  const [desc, setDesc] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleAdd = () => {
    if (!vehicleClass || !dailyRate) return;
    addPrice.mutate({
      agency_id: agencyId,
      vehicle_class: vehicleClass,
      brand: brand || null,
      model: model || null,
      year: year ? Number(year) : null,
      transmission,
      fuel_type: fuelType,
      seats: Number(seats) || 5,
      image_url: null,
      daily_rate: Number(dailyRate),
      weekly_rate: weeklyRate ? Number(weeklyRate) : null,
      monthly_rate: monthlyRate ? Number(monthlyRate) : null,
      drop_off_fee: Number(dropOff) || 0,
      description: desc || null,
    });
    setVehicleClass(''); setBrand(''); setModel(''); setYear(new Date().getFullYear().toString());
    setTransmission('automatic'); setFuelType('gasoline'); setSeats('5');
    setDailyRate(''); setWeeklyRate(''); setMonthlyRate(''); setDropOff(''); setDesc('');
  };

  const downloadTemplate = () => {
    const data = [
      { 'Vehicle Class': 'Economy', Brand: 'Toyota', Model: 'Yaris', Year: 2024, Transmission: 'automatic', 'Fuel Type': 'gasoline', Seats: 5, 'Daily Rate (€)': 35, 'Weekly Rate (€)': 210, 'Monthly Rate (€)': 750, 'Drop-off Fee (€)': 25, Notes: 'A/C included' },
      { 'Vehicle Class': 'SUV', Brand: 'BMW', Model: 'X5', Year: 2024, Transmission: 'automatic', 'Fuel Type': 'diesel', Seats: 7, 'Daily Rate (€)': 85, 'Weekly Rate (€)': 520, 'Monthly Rate (€)': 1800, 'Drop-off Fee (€)': 40, Notes: '4WD' },
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Car Rental Pricing');
    XLSX.writeFile(wb, 'car_rental_pricing_template.xlsx');
  };

  const downloadCurrent = () => {
    if (!prices.length) { toast.info('No pricing to export'); return; }
    const data = prices.map(p => ({
      'Vehicle Class': p.vehicle_class, Brand: p.brand ?? '', Model: p.model ?? '', Year: p.year ?? '',
      Transmission: p.transmission ?? '', 'Fuel Type': p.fuel_type ?? '', Seats: p.seats ?? '',
      'Daily Rate (€)': p.daily_rate, 'Weekly Rate (€)': p.weekly_rate ?? '', 'Monthly Rate (€)': p.monthly_rate ?? '',
      'Drop-off Fee (€)': p.drop_off_fee, Notes: p.description ?? '',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Car Rental Pricing');
    XLSX.writeFile(wb, 'car_rental_pricing_export.xlsx');
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ab = await file.arrayBuffer();
      const wb = XLSX.read(ab);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(ws);
      let added = 0;
      for (const row of rows) {
        const vc = row['Vehicle Class'] || row['vehicle_class'] || '';
        const dr = Number(row['Daily Rate (€)'] || row['daily_rate'] || 0);
        if (!vc || !dr) continue;
        await addPrice.mutateAsync({
          agency_id: agencyId,
          vehicle_class: vc,
          brand: row['Brand'] || row['brand'] || null,
          model: row['Model'] || row['model'] || null,
          year: Number(row['Year'] || row['year'] || 0) || null,
          transmission: row['Transmission'] || row['transmission'] || 'automatic',
          fuel_type: row['Fuel Type'] || row['fuel_type'] || 'gasoline',
          seats: Number(row['Seats'] || row['seats'] || 5),
          image_url: null,
          daily_rate: dr,
          weekly_rate: Number(row['Weekly Rate (€)'] || row['weekly_rate'] || 0) || null,
          monthly_rate: Number(row['Monthly Rate (€)'] || row['monthly_rate'] || 0) || null,
          drop_off_fee: Number(row['Drop-off Fee (€)'] || row['drop_off_fee'] || 0),
          description: row['Notes'] || row['description'] || null,
        });
        added++;
      }
      toast.success(`Imported ${added} pricing entries`);
    } catch (err: any) {
      toast.error('Failed to parse file: ' + err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-5">
      {/* Mileage config */}
      <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 space-y-3">
        <h4 className="text-xs font-semibold text-foreground">Mileage Settings</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-[11px]">Free KM / Day</Label>
            <Input type="number" min={0} step={10} placeholder="200"
              value={storefrontConfig.car_rental_free_km ?? ''}
              onChange={(e) => onConfigChange({ ...storefrontConfig, car_rental_free_km: e.target.value ? Number(e.target.value) : undefined })}
              className="text-xs font-mono" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Extra KM Rate (€)</Label>
            <Input type="number" min={0} step={0.05} placeholder="0.25"
              value={storefrontConfig.car_rental_extra_km_rate ?? ''}
              onChange={(e) => onConfigChange({ ...storefrontConfig, car_rental_extra_km_rate: e.target.value ? Number(e.target.value) : undefined })}
              className="text-xs font-mono" />
          </div>
        </div>
      </div>

      {/* Excel import/export */}
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" className="text-xs" onClick={downloadTemplate}>
          <Download className="h-3.5 w-3.5 mr-1" /> Download Template
        </Button>
        <Button variant="outline" size="sm" className="text-xs" onClick={downloadCurrent} disabled={!prices.length}>
          <Download className="h-3.5 w-3.5 mr-1" /> Export Current
        </Button>
        <Button variant="outline" size="sm" className="text-xs" onClick={() => fileRef.current?.click()} disabled={uploading}>
          <Upload className="h-3.5 w-3.5 mr-1" /> {uploading ? 'Importing...' : 'Import Excel'}
        </Button>
        <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleUpload} />
      </div>

      {/* Add form - Vehicle info */}
      <div className="rounded-lg border border-border p-4 space-y-3">
        <h4 className="text-xs font-semibold text-foreground">Add Vehicle Pricing</h4>
        <div className="grid grid-cols-4 gap-2">
          <div className="space-y-1"><Label className="text-[11px]">Vehicle Class *</Label><Input placeholder="Economy" value={vehicleClass} onChange={(e) => setVehicleClass(e.target.value)} className="text-xs" /></div>
          <div className="space-y-1"><Label className="text-[11px]">Brand</Label><Input placeholder="Toyota" value={brand} onChange={(e) => setBrand(e.target.value)} className="text-xs" /></div>
          <div className="space-y-1"><Label className="text-[11px]">Model</Label><Input placeholder="Corolla" value={model} onChange={(e) => setModel(e.target.value)} className="text-xs" /></div>
          <div className="space-y-1"><Label className="text-[11px]">Year</Label><Input type="number" value={year} onChange={(e) => setYear(e.target.value)} className="text-xs font-mono" /></div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label className="text-[11px]">Transmission</Label>
            <Select value={transmission} onValueChange={setTransmission}>
              <SelectTrigger className="text-xs h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="automatic">Automatic</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Fuel Type</Label>
            <Select value={fuelType} onValueChange={setFuelType}>
              <SelectTrigger className="text-xs h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="gasoline">Gasoline</SelectItem>
                <SelectItem value="diesel">Diesel</SelectItem>
                <SelectItem value="electric">Electric</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
                <SelectItem value="lpg">LPG</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label className="text-[11px]">Seats</Label><Input type="number" min={1} max={50} value={seats} onChange={(e) => setSeats(e.target.value)} className="text-xs font-mono" /></div>
        </div>
        {/* Pricing row */}
        <div className="grid grid-cols-5 gap-2">
          <div className="space-y-1"><Label className="text-[11px]">Per Night (€) *</Label><Input type="number" min={0} placeholder="45" value={dailyRate} onChange={(e) => setDailyRate(e.target.value)} className="text-xs font-mono" /></div>
          <div className="space-y-1"><Label className="text-[11px]">Per Week (€)</Label><Input type="number" min={0} placeholder="250" value={weeklyRate} onChange={(e) => setWeeklyRate(e.target.value)} className="text-xs font-mono" /></div>
          <div className="space-y-1"><Label className="text-[11px]">Per Month (€)</Label><Input type="number" min={0} placeholder="850" value={monthlyRate} onChange={(e) => setMonthlyRate(e.target.value)} className="text-xs font-mono" /></div>
          <div className="space-y-1"><Label className="text-[11px]">Drop-off (€)</Label><Input type="number" min={0} placeholder="30" value={dropOff} onChange={(e) => setDropOff(e.target.value)} className="text-xs font-mono" /></div>
          <div className="flex items-end"><Button size="sm" onClick={handleAdd} disabled={addPrice.isPending || !vehicleClass || !dailyRate} className="gradient-accent text-accent-foreground w-full"><Plus className="h-3.5 w-3.5 mr-1" /> Add</Button></div>
        </div>
        <div className="space-y-1"><Label className="text-[11px]">Notes (optional)</Label><Input placeholder="Includes A/C, Bluetooth..." value={desc} onChange={(e) => setDesc(e.target.value)} className="text-xs" /></div>
      </div>

      {/* Table */}
      {isLoading ? <p className="text-xs text-muted-foreground">Loading...</p> : prices.length === 0 ? <p className="text-xs text-muted-foreground py-6 text-center">No car rental pricing configured yet. Download the template to get started!</p> : (
        <div className="border border-border rounded-lg overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Vehicle</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Details</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Per Night</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Per Week</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Per Month</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Drop-off</th>
                <th className="px-3 py-2 w-10" />
              </tr>
            </thead>
            <tbody>
              {prices.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-secondary/20">
                  <td className="px-3 py-2">
                    <div className="font-medium text-foreground">{p.brand && p.model ? `${p.brand} ${p.model}` : p.vehicle_class}</div>
                    <div className="text-muted-foreground">{p.vehicle_class}{p.year ? ` • ${p.year}` : ''}</div>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {[p.transmission, p.fuel_type, p.seats ? `${p.seats} seats` : null].filter(Boolean).join(' • ')}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-foreground">€{p.daily_rate}</td>
                  <td className="px-3 py-2 text-right font-mono text-muted-foreground">{p.weekly_rate ? `€${p.weekly_rate}` : '—'}</td>
                  <td className="px-3 py-2 text-right font-mono text-muted-foreground">{p.monthly_rate ? `€${p.monthly_rate}` : '—'}</td>
                  <td className="px-3 py-2 text-right font-mono text-muted-foreground">€{p.drop_off_fee}</td>
                  <td className="px-3 py-2"><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deletePrice.mutate({ id: p.id, agencyId })}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ServicePricingEditor;
