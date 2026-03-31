import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Navigation, Globe, Map, Car, Download, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';
import {
  useTransferRoutes, useAddTransferRoute, useDeleteTransferRoute,
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
}

const ServicePricingEditor = ({ agencyId, enabledServices, storefrontConfig, onConfigChange }: Props) => {
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

// ── Transfer Tab ──
const TransferPricingTab = ({ agencyId, storefrontConfig, onConfigChange }: { agencyId: string; storefrontConfig: StorefrontConfig; onConfigChange: (c: StorefrontConfig) => void }) => {
  const { data: routes = [], isLoading } = useTransferRoutes(agencyId);
  const addRoute = useAddTransferRoute();
  const deleteRoute = useDeleteTransferRoute();
  const fileRef = useRef<HTMLInputElement>(null);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [price, setPrice] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const [maxPass, setMaxPass] = useState('4');
  const [uploading, setUploading] = useState(false);

  const handleAdd = () => {
    if (!origin || !destination || !price) return;
    addRoute.mutate({ agency_id: agencyId, origin, destination, price: Number(price), distance_km: distanceKm ? Number(distanceKm) : null, max_passengers: Number(maxPass) || 4, notes: null });
    setOrigin(''); setDestination(''); setPrice(''); setDistanceKm('');
  };

  const downloadTemplate = () => {
    const data = [
      { Origin: 'Airport', Destination: 'City Center', 'Price (€)': 45, 'Distance (km)': 25, 'Max Passengers': 4 },
      { Origin: 'Airport', Destination: 'Hotel Zone', 'Price (€)': 55, 'Distance (km)': 30, 'Max Passengers': 4 },
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 12 }, { wch: 14 }, { wch: 16 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transfer Routes');
    XLSX.writeFile(wb, 'transfer_routes_template.xlsx');
  };

  const downloadCurrent = () => {
    if (!routes.length) { toast.info('No routes to export'); return; }
    const data = routes.map(r => ({
      Origin: r.origin, Destination: r.destination, 'Price (€)': r.price,
      'Distance (km)': r.distance_km ?? '', 'Max Passengers': r.max_passengers ?? 4,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 12 }, { wch: 14 }, { wch: 16 }];
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
        const p = Number(row['Price (€)'] || row['price'] || row['Price'] || 0);
        if (!o || !d || !p) continue;
        const dist = Number(row['Distance (km)'] || row['distance_km'] || row['Distance'] || 0) || null;
        const pax = Number(row['Max Passengers'] || row['max_passengers'] || 4);
        await addRoute.mutateAsync({ agency_id: agencyId, origin: o, destination: d, price: p, distance_km: dist, max_passengers: pax, notes: null });
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
      {/* Auto-pricing formula */}
      <div className="rounded-lg border border-accent/30 bg-accent/5 p-4 space-y-3">
        <h4 className="text-xs font-semibold text-foreground">Auto-Pricing Formula (Sixt-style)</h4>
        <p className="text-[11px] text-muted-foreground">When no fixed route exists, price = Base Fee + (Distance × Per-KM Rate)</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-[11px]">Base Fee (€)</Label>
            <Input
              type="number" min={0} step={0.5}
              placeholder="15"
              value={storefrontConfig.transfer_base_fee ?? ''}
              onChange={(e) => onConfigChange({ ...storefrontConfig, transfer_base_fee: e.target.value ? Number(e.target.value) : undefined })}
              className="text-xs font-mono"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Per-KM Rate (€)</Label>
            <Input
              type="number" min={0} step={0.1}
              placeholder="1.20"
              value={storefrontConfig.transfer_per_km_rate ?? ''}
              onChange={(e) => onConfigChange({ ...storefrontConfig, transfer_per_km_rate: e.target.value ? Number(e.target.value) : undefined })}
              className="text-xs font-mono"
            />
          </div>
        </div>
        {(storefrontConfig.transfer_base_fee || storefrontConfig.transfer_per_km_rate) && (
          <p className="text-[11px] text-accent font-medium">
            Example: 30 km trip = €{((storefrontConfig.transfer_base_fee ?? 0) + 30 * (storefrontConfig.transfer_per_km_rate ?? 0)).toFixed(2)}
          </p>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" size="sm" className="text-xs" onClick={downloadTemplate}>
          <Download className="h-3.5 w-3.5 mr-1" /> Download Template
        </Button>
        <Button variant="outline" size="sm" className="text-xs" onClick={downloadCurrent} disabled={!routes.length}>
          <Download className="h-3.5 w-3.5 mr-1" /> Export Current
        </Button>
        <Button variant="outline" size="sm" className="text-xs" onClick={() => fileRef.current?.click()} disabled={uploading}>
          <Upload className="h-3.5 w-3.5 mr-1" /> {uploading ? 'Importing...' : 'Import Excel'}
        </Button>
        <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleUpload} />
      </div>
      <p className="text-[11px] text-muted-foreground -mt-2">Fixed routes below override the auto-pricing formula</p>
      <div className="grid grid-cols-5 gap-2">
        <div className="space-y-1"><Label className="text-[11px]">Origin</Label><Input placeholder="Airport" value={origin} onChange={(e) => setOrigin(e.target.value)} className="text-xs" /></div>
        <div className="space-y-1"><Label className="text-[11px]">Destination</Label><Input placeholder="City center" value={destination} onChange={(e) => setDestination(e.target.value)} className="text-xs" /></div>
        <div className="space-y-1"><Label className="text-[11px]">Price (€)</Label><Input type="number" min={0} placeholder="50" value={price} onChange={(e) => setPrice(e.target.value)} className="text-xs font-mono" /></div>
        <div className="space-y-1"><Label className="text-[11px]">Distance (km)</Label><Input type="number" min={0} placeholder="25" value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} className="text-xs font-mono" /></div>
        <div className="flex items-end"><Button size="sm" onClick={handleAdd} disabled={addRoute.isPending || !origin || !destination || !price} className="gradient-accent text-accent-foreground w-full"><Plus className="h-3.5 w-3.5 mr-1" /> Add</Button></div>
      </div>
      {isLoading ? <p className="text-xs text-muted-foreground">Loading...</p> : routes.length === 0 ? <p className="text-xs text-muted-foreground py-6 text-center">No transfer routes configured yet. Download the template, fill it in, and import!</p> : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-secondary/50"><tr><th className="px-3 py-2 text-left font-medium text-muted-foreground">Origin</th><th className="px-3 py-2 text-left font-medium text-muted-foreground">Destination</th><th className="px-3 py-2 text-right font-medium text-muted-foreground">Price</th><th className="px-3 py-2 text-right font-medium text-muted-foreground">Dist.</th><th className="px-3 py-2 text-right font-medium text-muted-foreground">Pax</th><th className="px-3 py-2 w-10" /></tr></thead>
            <tbody>{routes.map((r) => (<tr key={r.id} className="border-t border-border hover:bg-secondary/20"><td className="px-3 py-2 text-foreground">{r.origin}</td><td className="px-3 py-2 text-foreground">{r.destination}</td><td className="px-3 py-2 text-right font-mono text-foreground">€{r.price}</td><td className="px-3 py-2 text-right text-muted-foreground">{r.distance_km ? `${r.distance_km} km` : '—'}</td><td className="px-3 py-2 text-right text-muted-foreground">{r.max_passengers ?? 4}</td><td className="px-3 py-2"><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteRoute.mutate({ id: r.id, agencyId })}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></td></tr>))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ── Limo Tour Tab ──
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
      daily_rate: Number(dailyRate),
      weekly_rate: weeklyRate ? Number(weeklyRate) : null,
      monthly_rate: monthlyRate ? Number(monthlyRate) : null,
      drop_off_fee: Number(dropOff) || 0,
      description: desc || null,
    });
    setVehicleClass(''); setDailyRate(''); setWeeklyRate(''); setMonthlyRate(''); setDropOff(''); setDesc('');
  };

  const downloadTemplate = () => {
    const data = [
      { 'Vehicle Class': 'Economy', 'Daily Rate (€)': 35, 'Weekly Rate (€)': 210, 'Monthly Rate (€)': 750, 'Drop-off Fee (€)': 25, Notes: 'A/C, Manual' },
      { 'Vehicle Class': 'Compact', 'Daily Rate (€)': 45, 'Weekly Rate (€)': 280, 'Monthly Rate (€)': 950, 'Drop-off Fee (€)': 25, Notes: 'A/C, Automatic' },
      { 'Vehicle Class': 'SUV', 'Daily Rate (€)': 85, 'Weekly Rate (€)': 520, 'Monthly Rate (€)': 1800, 'Drop-off Fee (€)': 40, Notes: '4WD, 7 seats' },
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [{ wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 24 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Car Rental Pricing');
    XLSX.writeFile(wb, 'car_rental_pricing_template.xlsx');
  };

  const downloadCurrent = () => {
    if (!prices.length) { toast.info('No pricing to export'); return; }
    const data = prices.map(p => ({
      'Vehicle Class': p.vehicle_class, 'Daily Rate (€)': p.daily_rate,
      'Weekly Rate (€)': p.weekly_rate ?? '', 'Monthly Rate (€)': p.monthly_rate ?? '',
      'Drop-off Fee (€)': p.drop_off_fee, Notes: p.description ?? '',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws['!cols'] = [{ wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 24 }];
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
        const wr = Number(row['Weekly Rate (€)'] || row['weekly_rate'] || 0) || null;
        const mr = Number(row['Monthly Rate (€)'] || row['monthly_rate'] || 0) || null;
        const df = Number(row['Drop-off Fee (€)'] || row['drop_off_fee'] || 0);
        const notes = row['Notes'] || row['description'] || null;
        await addPrice.mutateAsync({ agency_id: agencyId, vehicle_class: vc, daily_rate: dr, weekly_rate: wr, monthly_rate: mr, drop_off_fee: df, description: notes });
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
        <h4 className="text-xs font-semibold text-foreground">Mileage Settings (Sixt-style)</h4>
        <p className="text-[11px] text-muted-foreground">Set included free km/day and extra km rate for all car rentals</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-[11px]">Free KM / Day</Label>
            <Input
              type="number" min={0} step={10}
              placeholder="200"
              value={storefrontConfig.car_rental_free_km ?? ''}
              onChange={(e) => onConfigChange({ ...storefrontConfig, car_rental_free_km: e.target.value ? Number(e.target.value) : undefined })}
              className="text-xs font-mono"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Extra KM Rate (€)</Label>
            <Input
              type="number" min={0} step={0.05}
              placeholder="0.25"
              value={storefrontConfig.car_rental_extra_km_rate ?? ''}
              onChange={(e) => onConfigChange({ ...storefrontConfig, car_rental_extra_km_rate: e.target.value ? Number(e.target.value) : undefined })}
              className="text-xs font-mono"
            />
          </div>
        </div>
        {(storefrontConfig.car_rental_free_km || storefrontConfig.car_rental_extra_km_rate) && (
          <p className="text-[11px] text-accent font-medium">
            {storefrontConfig.car_rental_free_km ?? 0} km/day free • Extra at €{storefrontConfig.car_rental_extra_km_rate ?? 0}/km
          </p>
        )}
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

      {/* Add form */}
      <div className="grid grid-cols-6 gap-2">
        <div className="space-y-1"><Label className="text-[11px]">Vehicle Class</Label><Input placeholder="Economy" value={vehicleClass} onChange={(e) => setVehicleClass(e.target.value)} className="text-xs" /></div>
        <div className="space-y-1"><Label className="text-[11px]">Per Night (€)</Label><Input type="number" min={0} placeholder="45" value={dailyRate} onChange={(e) => setDailyRate(e.target.value)} className="text-xs font-mono" /></div>
        <div className="space-y-1"><Label className="text-[11px]">Per Week (€)</Label><Input type="number" min={0} placeholder="250" value={weeklyRate} onChange={(e) => setWeeklyRate(e.target.value)} className="text-xs font-mono" /></div>
        <div className="space-y-1"><Label className="text-[11px]">Per Month (€)</Label><Input type="number" min={0} placeholder="850" value={monthlyRate} onChange={(e) => setMonthlyRate(e.target.value)} className="text-xs font-mono" /></div>
        <div className="space-y-1"><Label className="text-[11px]">Drop-off (€)</Label><Input type="number" min={0} placeholder="30" value={dropOff} onChange={(e) => setDropOff(e.target.value)} className="text-xs font-mono" /></div>
        <div className="flex items-end"><Button size="sm" onClick={handleAdd} disabled={addPrice.isPending || !vehicleClass || !dailyRate} className="gradient-accent text-accent-foreground w-full"><Plus className="h-3.5 w-3.5 mr-1" /> Add</Button></div>
      </div>
      <div className="space-y-1"><Label className="text-[11px]">Notes (optional)</Label><Input placeholder="Includes A/C, Automatic, Bluetooth..." value={desc} onChange={(e) => setDesc(e.target.value)} className="text-xs" /></div>

      {/* Table */}
      {isLoading ? <p className="text-xs text-muted-foreground">Loading...</p> : prices.length === 0 ? <p className="text-xs text-muted-foreground py-6 text-center">No car rental pricing configured yet. Download the template to get started!</p> : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-secondary/50"><tr><th className="px-3 py-2 text-left font-medium text-muted-foreground">Class</th><th className="px-3 py-2 text-right font-medium text-muted-foreground">Per Night</th><th className="px-3 py-2 text-right font-medium text-muted-foreground">Per Week</th><th className="px-3 py-2 text-right font-medium text-muted-foreground">Per Month</th><th className="px-3 py-2 text-right font-medium text-muted-foreground">Drop-off</th><th className="px-3 py-2 text-left font-medium text-muted-foreground">Notes</th><th className="px-3 py-2 w-10" /></tr></thead>
            <tbody>{prices.map((p) => (<tr key={p.id} className="border-t border-border hover:bg-secondary/20"><td className="px-3 py-2 text-foreground font-medium">{p.vehicle_class}</td><td className="px-3 py-2 text-right font-mono text-foreground">€{p.daily_rate}</td><td className="px-3 py-2 text-right font-mono text-muted-foreground">{p.weekly_rate ? `€${p.weekly_rate}` : '—'}</td><td className="px-3 py-2 text-right font-mono text-muted-foreground">{p.monthly_rate ? `€${p.monthly_rate}` : '—'}</td><td className="px-3 py-2 text-right font-mono text-muted-foreground">€{p.drop_off_fee}</td><td className="px-3 py-2 text-muted-foreground max-w-[120px] truncate">{p.description || '—'}</td><td className="px-3 py-2"><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deletePrice.mutate({ id: p.id, agencyId })}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></td></tr>))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ServicePricingEditor;
