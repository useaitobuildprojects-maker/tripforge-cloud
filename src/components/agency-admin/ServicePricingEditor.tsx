import { useState, useRef, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Navigation, Globe, Map, Car, Download, Upload, Settings2 } from 'lucide-react';
import LocationsEditor from '@/components/agency-admin/LocationsEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import {
  useTransferRoutes, useAddTransferRoute, useDeleteTransferRoute, TRANSFER_CATEGORIES,
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
    ...(hasLimo ? [{ id: 'limo_tour', label: 'Limo Tour', icon: Globe }] : []),
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

        {hasTransfer && <TabsContent value="transfer" className="mt-4"><TransferPricingTab agencyId={agencyId} storefrontConfig={storefrontConfig} onConfigChange={onConfigChange} /></TabsContent>}
        {hasLimo && <TabsContent value="limo_tour" className="mt-4"><LimoTourPricingTab agencyId={agencyId} /></TabsContent>}
        {hasCityTour && <TabsContent value="city_tour" className="mt-4"><CityTourPricingTab agencyId={agencyId} /></TabsContent>}
        {hasCarRental && <TabsContent value="car_rental" className="mt-4"><CarRentalPricingTab agencyId={agencyId} storefrontConfig={storefrontConfig} onConfigChange={onConfigChange} /></TabsContent>}
      </Tabs>
    </motion.div>
  );
};

// ── Transfer Tab with Zone Matrix ──
const TransferPricingTab = ({ agencyId, storefrontConfig, onConfigChange }: { agencyId: string; storefrontConfig: StorefrontConfig; onConfigChange: (c: StorefrontConfig) => void }) => {
  const { data: routes = [], isLoading } = useTransferRoutes(agencyId);
  const addRoute = useAddTransferRoute();
  const deleteRoute = useDeleteTransferRoute();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const locations = storefrontConfig.locations ?? [];
  const multBusiness = storefrontConfig.transfer_multiplier_business ?? 1.6;
  const multFirstClass = storefrontConfig.transfer_multiplier_first_class ?? 2.4;
  const multVan = storefrontConfig.transfer_multiplier_van ?? 1.8;

  // Build a lookup map: "origin|destination" -> route
  const routeMap = useMemo(() => {
    const map: Record<string, typeof routes[0]> = {};
    routes.forEach(r => {
      map[`${r.origin}|${r.destination}`] = r;
    });
    return map;
  }, [routes]);

  // Generate all unique pairs from locations
  const pairs = useMemo(() => {
    const result: { origin: string; destination: string }[] = [];
    for (let i = 0; i < locations.length; i++) {
      for (let j = i + 1; j < locations.length; j++) {
        result.push({ origin: locations[i].name, destination: locations[j].name });
      }
    }
    return result;
  }, [locations]);

  // Save/update a route price
  const handlePriceChange = async (origin: string, destination: string, economyPrice: number) => {
    // Check if route exists (either direction)
    const existingKey1 = `${origin}|${destination}`;
    const existingKey2 = `${destination}|${origin}`;
    const existing = routeMap[existingKey1] || routeMap[existingKey2];

    if (existing) {
      // Delete old and re-add with new price
      await deleteRoute.mutateAsync({ id: existing.id, agencyId });
    }

    if (economyPrice > 0) {
      await addRoute.mutateAsync({
        agency_id: agencyId,
        origin,
        destination,
        price_economy: economyPrice,
        price_business: Math.round(economyPrice * multBusiness),
        price_first_class: Math.round(economyPrice * multFirstClass),
        price_van: Math.round(economyPrice * multVan),
        distance_km: null,
        notes: null,
      });
    }
  };

  // Recalculate all category prices when multipliers change
  const recalculateAllPrices = async () => {
    for (const route of routes) {
      if (route.price_economy > 0) {
        await deleteRoute.mutateAsync({ id: route.id, agencyId });
        await addRoute.mutateAsync({
          agency_id: agencyId,
          origin: route.origin,
          destination: route.destination,
          price_economy: route.price_economy,
          price_business: Math.round(route.price_economy * multBusiness),
          price_first_class: Math.round(route.price_economy * multFirstClass),
          price_van: Math.round(route.price_economy * multVan),
          distance_km: route.distance_km,
          notes: route.notes,
        });
      }
    }
    toast.success('All category prices recalculated');
  };

  const getEconomyPrice = (origin: string, destination: string): string => {
    const route = routeMap[`${origin}|${destination}`] || routeMap[`${destination}|${origin}`];
    return route ? String(route.price_economy) : '';
  };

  // Excel import/export
  const downloadTemplate = () => {
    const data = pairs.length > 0
      ? pairs.map(p => ({ Origin: p.origin, Destination: p.destination, 'Economy Price (€)': '' }))
      : [{ Origin: 'Airport', Destination: 'City Center', 'Economy Price (€)': 35 }];
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [{ wch: 25 }, { wch: 25 }, { wch: 18 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transfer Routes');
    XLSX.writeFile(wb, 'transfer_routes_template.xlsx');
  };

  const downloadCurrent = () => {
    if (!routes.length) { toast.info('No routes to export'); return; }
    const data = routes.map(r => ({
      Origin: r.origin, Destination: r.destination,
      'Economy (€)': r.price_economy, 'Business (€)': r.price_business,
      'First Class (€)': r.price_first_class, 'VAN (€)': r.price_van,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transfer Routes');
    XLSX.writeFile(wb, 'transfer_routes_export.xlsx');
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
        const o = row['Origin'] || row['origin'] || '';
        const d = row['Destination'] || row['destination'] || '';
        const pe = Number(row['Economy Price (€)'] || row['Economy (€)'] || row['price_economy'] || row['Price'] || 0);
        if (!o || !d || !pe) continue;
        // Delete existing route for this pair
        const existingKey1 = `${o}|${d}`;
        const existingKey2 = `${d}|${o}`;
        const existing = routeMap[existingKey1] || routeMap[existingKey2];
        if (existing) await deleteRoute.mutateAsync({ id: existing.id, agencyId });
        await addRoute.mutateAsync({
          agency_id: agencyId, origin: o, destination: d,
          price_economy: pe,
          price_business: Math.round(pe * multBusiness),
          price_first_class: Math.round(pe * multFirstClass),
          price_van: Math.round(pe * multVan),
          distance_km: null, notes: null,
        });
        added++;
      }
      toast.success(`Imported ${added} routes`);
    } catch (err: any) {
      toast.error('Failed to parse file: ' + err.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="space-y-5">
      {/* Step 1: Locations */}
      <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 space-y-3">
        <h4 className="text-xs font-semibold text-foreground">Step 1 — Define Locations</h4>
        <p className="text-[11px] text-muted-foreground">Add airports, hotels, cities, and stations. The system auto-generates price pairs between all locations.</p>
        <LocationsEditor
          locations={locations}
          onChange={(locs) => onConfigChange({ ...storefrontConfig, locations: locs })}
        />
      </div>

      {/* Step 2: Category Multipliers */}
      <div className="rounded-lg border border-border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-foreground">Step 2 — Category Multipliers</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">Set the economy base price per route. Other categories are auto-calculated.</p>
          </div>
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setShowSettings(!showSettings)}>
            <Settings2 className="h-3.5 w-3.5 mr-1" /> {showSettings ? 'Hide' : 'Edit'} Multipliers
          </Button>
        </div>
        {showSettings && (
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border">
            <div className="space-y-1">
              <Label className="text-[11px]">Business (×)</Label>
              <Input type="number" min={1} step={0.1} value={multBusiness}
                onChange={(e) => onConfigChange({ ...storefrontConfig, transfer_multiplier_business: Number(e.target.value) || 1.6 })}
                className="text-xs font-mono" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px]">First Class (×)</Label>
              <Input type="number" min={1} step={0.1} value={multFirstClass}
                onChange={(e) => onConfigChange({ ...storefrontConfig, transfer_multiplier_first_class: Number(e.target.value) || 2.4 })}
                className="text-xs font-mono" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px]">VAN (×)</Label>
              <Input type="number" min={1} step={0.1} value={multVan}
                onChange={(e) => onConfigChange({ ...storefrontConfig, transfer_multiplier_van: Number(e.target.value) || 1.8 })}
                className="text-xs font-mono" />
            </div>
          </div>
        )}
        {!showSettings && (
          <div className="flex gap-4 text-[11px] text-muted-foreground">
            <span>Economy: <strong className="text-foreground">1.0×</strong></span>
            <span>Business: <strong className="text-foreground">{multBusiness}×</strong></span>
            <span>First Class: <strong className="text-foreground">{multFirstClass}×</strong></span>
            <span>VAN: <strong className="text-foreground">{multVan}×</strong></span>
          </div>
        )}
        {showSettings && routes.length > 0 && (
          <Button variant="outline" size="sm" className="text-xs" onClick={recalculateAllPrices}>
            Recalculate all {routes.length} routes with new multipliers
          </Button>
        )}
      </div>

      {/* Excel import/export */}
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" className="text-xs" onClick={downloadTemplate}>
          <Download className="h-3.5 w-3.5 mr-1" /> {pairs.length > 0 ? `Download Template (${pairs.length} pairs)` : 'Download Template'}
        </Button>
        <Button variant="outline" size="sm" className="text-xs" onClick={downloadCurrent} disabled={!routes.length}>
          <Download className="h-3.5 w-3.5 mr-1" /> Export Current
        </Button>
        <Button variant="outline" size="sm" className="text-xs" onClick={() => fileRef.current?.click()} disabled={uploading}>
          <Upload className="h-3.5 w-3.5 mr-1" /> {uploading ? 'Importing...' : 'Import Excel'}
        </Button>
        <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleUpload} />
      </div>

      {/* Step 3: Price Matrix */}
      {locations.length < 2 ? (
        <p className="text-xs text-muted-foreground py-8 text-center">Add at least 2 locations above to see the price matrix</p>
      ) : isLoading ? (
        <p className="text-xs text-muted-foreground">Loading routes...</p>
      ) : (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-foreground">Step 3 — Price Matrix (Economy base price in €)</h4>
          <p className="text-[11px] text-muted-foreground">Enter the economy price for each route. Business, First Class, and VAN are calculated automatically.</p>
          <div className="border border-border rounded-lg overflow-x-auto">
            <table className="text-xs">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground sticky left-0 bg-secondary/50 z-10 min-w-[140px]">From ↓ / To →</th>
                  {locations.map((loc, i) => (
                    <th key={i} className="px-2 py-2 text-center font-medium text-muted-foreground min-w-[90px] whitespace-nowrap">
                      {loc.name.length > 15 ? loc.name.substring(0, 13) + '…' : loc.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {locations.map((rowLoc, ri) => (
                  <tr key={ri} className="border-t border-border">
                    <td className="px-3 py-2 font-medium text-foreground sticky left-0 bg-background z-10 whitespace-nowrap">
                      {rowLoc.name.length > 18 ? rowLoc.name.substring(0, 16) + '…' : rowLoc.name}
                    </td>
                    {locations.map((colLoc, ci) => {
                      if (ri === ci) {
                        return <td key={ci} className="px-2 py-1 text-center bg-muted/30">—</td>;
                      }
                      // Only show editable cells for upper triangle (ri < ci), mirror for lower
                      const isUpper = ri < ci;
                      const origin = isUpper ? rowLoc.name : colLoc.name;
                      const destination = isUpper ? colLoc.name : rowLoc.name;
                      const currentPrice = getEconomyPrice(origin, destination);
                      
                      if (!isUpper) {
                        // Lower triangle: show read-only mirror
                        return (
                          <td key={ci} className="px-2 py-1 text-center text-muted-foreground bg-muted/10 font-mono">
                            {currentPrice ? `€${currentPrice}` : ''}
                          </td>
                        );
                      }

                      return (
                        <td key={ci} className="px-1 py-1">
                          <Input
                            type="number"
                            min={0}
                            placeholder="—"
                            defaultValue={currentPrice}
                            onBlur={(e) => {
                              const val = Number(e.target.value) || 0;
                              const prev = Number(currentPrice) || 0;
                              if (val !== prev) {
                                handlePriceChange(origin, destination, val);
                              }
                            }}
                            className="text-xs font-mono h-7 w-[80px] text-center px-1"
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary with calculated prices */}
          {routes.length > 0 && (
            <div className="text-[11px] text-muted-foreground pt-2">
              {routes.length} route{routes.length !== 1 ? 's' : ''} configured. 
              Example: {routes[0].origin} → {routes[0].destination}: 
              Economy €{routes[0].price_economy} · 
              Business €{routes[0].price_business} · 
              First Class €{routes[0].price_first_class} · 
              VAN €{routes[0].price_van}
            </div>
          )}
        </div>
      )}

      {/* Fallback formula */}
      <div className="rounded-lg border border-border bg-muted/5 p-4 space-y-3">
        <h4 className="text-xs font-semibold text-foreground">Fallback Formula (optional)</h4>
        <p className="text-[11px] text-muted-foreground">For custom addresses not in your locations list: Price = Base Fee + (Distance × Per-KM Rate)</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-[11px]">Base Fee (€)</Label>
            <Input type="number" min={0} step={0.5} placeholder="15"
              value={storefrontConfig.transfer_base_fee ?? ''}
              onChange={(e) => onConfigChange({ ...storefrontConfig, transfer_base_fee: e.target.value ? Number(e.target.value) : undefined })}
              className="text-xs font-mono" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Per-KM Rate (€)</Label>
            <Input type="number" min={0} step={0.1} placeholder="1.20"
              value={storefrontConfig.transfer_per_km_rate ?? ''}
              onChange={(e) => onConfigChange({ ...storefrontConfig, transfer_per_km_rate: e.target.value ? Number(e.target.value) : undefined })}
              className="text-xs font-mono" />
          </div>
        </div>
      </div>
    </div>
  );
};
const LimoTourPricingTab = ({ agencyId }: { agencyId: string }) => {
  const { data: prices = [], isLoading } = useLimoTourPricing(agencyId);
  const addPrice = useAddLimoTourPrice();
  const deletePrice = useDeleteLimoTourPrice();
  const [city, setCity] = useState('');
  const [rate, setRate] = useState('');
  const [minDays, setMinDays] = useState('1');
  const [desc, setDesc] = useState('');

  const handleAdd = () => {
    if (!city || !rate) return;
    addPrice.mutate({ agency_id: agencyId, city, daily_rate: Number(rate), min_days: Number(minDays) || 1, description: desc || null });
    setCity(''); setRate(''); setMinDays('1'); setDesc('');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        <div className="space-y-1"><Label className="text-[11px]">City</Label><Input placeholder="Paris" value={city} onChange={(e) => setCity(e.target.value)} className="text-xs" /></div>
        <div className="space-y-1"><Label className="text-[11px]">Daily Rate (€)</Label><Input type="number" min={0} placeholder="350" value={rate} onChange={(e) => setRate(e.target.value)} className="text-xs font-mono" /></div>
        <div className="space-y-1"><Label className="text-[11px]">Min Days</Label><Input type="number" min={1} placeholder="1" value={minDays} onChange={(e) => setMinDays(e.target.value)} className="text-xs font-mono" /></div>
        <div className="flex items-end"><Button size="sm" onClick={handleAdd} disabled={addPrice.isPending || !city || !rate} className="gradient-accent text-accent-foreground w-full"><Plus className="h-3.5 w-3.5 mr-1" /> Add</Button></div>
      </div>
      <div className="space-y-1"><Label className="text-[11px]">Description / Itinerary (optional)</Label><Input placeholder="E.g. 10-day Europe tour covering Paris, Rome, Barcelona..." value={desc} onChange={(e) => setDesc(e.target.value)} className="text-xs" /></div>
      {isLoading ? <p className="text-xs text-muted-foreground">Loading...</p> : prices.length === 0 ? <p className="text-xs text-muted-foreground py-6 text-center">No limo tour pricing configured yet</p> : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-secondary/50"><tr><th className="px-3 py-2 text-left font-medium text-muted-foreground">City</th><th className="px-3 py-2 text-right font-medium text-muted-foreground">Daily Rate</th><th className="px-3 py-2 text-right font-medium text-muted-foreground">Min Days</th><th className="px-3 py-2 text-left font-medium text-muted-foreground">Description</th><th className="px-3 py-2 w-10" /></tr></thead>
            <tbody>{prices.map((p) => (<tr key={p.id} className="border-t border-border hover:bg-secondary/20"><td className="px-3 py-2 text-foreground font-medium">{p.city}</td><td className="px-3 py-2 text-right font-mono text-foreground">€{p.daily_rate}/day</td><td className="px-3 py-2 text-right text-muted-foreground">{p.min_days ?? 1}</td><td className="px-3 py-2 text-muted-foreground max-w-[200px] truncate">{p.description || '—'}</td><td className="px-3 py-2"><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deletePrice.mutate({ id: p.id, agencyId })}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></td></tr>))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── City Tour Tab ──
const CityTourPricingTab = ({ agencyId }: { agencyId: string }) => {
  const { data: tours = [], isLoading } = useCityTourPricing(agencyId);
  const addTour = useAddCityTourPrice();
  const deleteTour = useDeleteCityTourPrice();
  const [name, setName] = useState('');
  const [rate, setRate] = useState('');
  const [hours, setHours] = useState('4');
  const [desc, setDesc] = useState('');

  const handleAdd = () => {
    if (!name || !rate) return;
    addTour.mutate({ agency_id: agencyId, tour_name: name, daily_rate: Number(rate), duration_hours: Number(hours) || 4, description: desc || null });
    setName(''); setRate(''); setHours('4'); setDesc('');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        <div className="space-y-1"><Label className="text-[11px]">Tour Name</Label><Input placeholder="Downtown Tour" value={name} onChange={(e) => setName(e.target.value)} className="text-xs" /></div>
        <div className="space-y-1"><Label className="text-[11px]">Price (€/day)</Label><Input type="number" min={0} placeholder="120" value={rate} onChange={(e) => setRate(e.target.value)} className="text-xs font-mono" /></div>
        <div className="space-y-1"><Label className="text-[11px]">Duration (hrs)</Label><Input type="number" min={1} placeholder="4" value={hours} onChange={(e) => setHours(e.target.value)} className="text-xs font-mono" /></div>
        <div className="flex items-end"><Button size="sm" onClick={handleAdd} disabled={addTour.isPending || !name || !rate} className="gradient-accent text-accent-foreground w-full"><Plus className="h-3.5 w-3.5 mr-1" /> Add</Button></div>
      </div>
      <div className="space-y-1"><Label className="text-[11px]">Description (optional)</Label><Input placeholder="Guided city tour with historical landmarks..." value={desc} onChange={(e) => setDesc(e.target.value)} className="text-xs" /></div>
      {isLoading ? <p className="text-xs text-muted-foreground">Loading...</p> : tours.length === 0 ? <p className="text-xs text-muted-foreground py-6 text-center">No city tours configured yet</p> : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-secondary/50"><tr><th className="px-3 py-2 text-left font-medium text-muted-foreground">Tour Name</th><th className="px-3 py-2 text-right font-medium text-muted-foreground">Price/Day</th><th className="px-3 py-2 text-right font-medium text-muted-foreground">Duration</th><th className="px-3 py-2 text-left font-medium text-muted-foreground">Description</th><th className="px-3 py-2 w-10" /></tr></thead>
            <tbody>{tours.map((t) => (<tr key={t.id} className="border-t border-border hover:bg-secondary/20"><td className="px-3 py-2 text-foreground font-medium">{t.tour_name}</td><td className="px-3 py-2 text-right font-mono text-foreground">€{t.daily_rate}</td><td className="px-3 py-2 text-right text-muted-foreground">{t.duration_hours ?? 4}h</td><td className="px-3 py-2 text-muted-foreground max-w-[200px] truncate">{t.description || '—'}</td><td className="px-3 py-2"><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteTour.mutate({ id: t.id, agencyId })}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></td></tr>))}</tbody>
          </table>
        </div>
      )}
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
