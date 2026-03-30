import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Navigation, Globe, Map } from 'lucide-react';
import {
  useTransferRoutes, useAddTransferRoute, useDeleteTransferRoute,
  useLimoTourPricing, useAddLimoTourPrice, useDeleteLimoTourPrice,
  useCityTourPricing, useAddCityTourPrice, useDeleteCityTourPrice,
} from '@/hooks/use-service-pricing';

interface Props {
  agencyId: string;
  enabledServices: string[];
}

const ServicePricingEditor = ({ agencyId, enabledServices }: Props) => {
  const hasTransfer = enabledServices.includes('transfer');
  const hasLimo = enabledServices.includes('limo_tour');
  const hasCityTour = enabledServices.includes('city_tour');

  if (!hasTransfer && !hasLimo && !hasCityTour) return null;

  const tabs = [
    ...(hasTransfer ? [{ id: 'transfer', label: 'Transfer', icon: Navigation }] : []),
    ...(hasLimo ? [{ id: 'limo_tour', label: 'Limo Tour', icon: Globe }] : []),
    ...(hasCityTour ? [{ id: 'city_tour', label: 'City Tour', icon: Map }] : []),
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

        {hasTransfer && (
          <TabsContent value="transfer" className="mt-4">
            <TransferPricingTab agencyId={agencyId} />
          </TabsContent>
        )}
        {hasLimo && (
          <TabsContent value="limo_tour" className="mt-4">
            <LimoTourPricingTab agencyId={agencyId} />
          </TabsContent>
        )}
        {hasCityTour && (
          <TabsContent value="city_tour" className="mt-4">
            <CityTourPricingTab agencyId={agencyId} />
          </TabsContent>
        )}
      </Tabs>
    </motion.div>
  );
};

// ── Transfer Tab ──
const TransferPricingTab = ({ agencyId }: { agencyId: string }) => {
  const { data: routes = [], isLoading } = useTransferRoutes(agencyId);
  const addRoute = useAddTransferRoute();
  const deleteRoute = useDeleteTransferRoute();

  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [price, setPrice] = useState('');
  const [distanceKm, setDistanceKm] = useState('');
  const [maxPass, setMaxPass] = useState('4');

  const handleAdd = () => {
    if (!origin || !destination || !price) return;
    addRoute.mutate({
      agency_id: agencyId,
      origin,
      destination,
      price: Number(price),
      distance_km: distanceKm ? Number(distanceKm) : null,
      max_passengers: Number(maxPass) || 4,
      notes: null,
    });
    setOrigin(''); setDestination(''); setPrice(''); setDistanceKm('');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-5 gap-2">
        <div className="space-y-1">
          <Label className="text-[11px]">Origin</Label>
          <Input placeholder="Airport" value={origin} onChange={(e) => setOrigin(e.target.value)} className="text-xs" />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px]">Destination</Label>
          <Input placeholder="City center" value={destination} onChange={(e) => setDestination(e.target.value)} className="text-xs" />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px]">Price (€)</Label>
          <Input type="number" min={0} placeholder="50" value={price} onChange={(e) => setPrice(e.target.value)} className="text-xs font-mono" />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px]">Distance (km)</Label>
          <Input type="number" min={0} placeholder="25" value={distanceKm} onChange={(e) => setDistanceKm(e.target.value)} className="text-xs font-mono" />
        </div>
        <div className="flex items-end">
          <Button size="sm" onClick={handleAdd} disabled={addRoute.isPending || !origin || !destination || !price} className="gradient-accent text-accent-foreground w-full">
            <Plus className="h-3.5 w-3.5 mr-1" /> Add
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-xs text-muted-foreground">Loading...</p>
      ) : routes.length === 0 ? (
        <p className="text-xs text-muted-foreground py-6 text-center">No transfer routes configured yet</p>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Origin</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Destination</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Price</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Dist.</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Pax</th>
                <th className="px-3 py-2 w-10" />
              </tr>
            </thead>
            <tbody>
              {routes.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-secondary/20">
                  <td className="px-3 py-2 text-foreground">{r.origin}</td>
                  <td className="px-3 py-2 text-foreground">{r.destination}</td>
                  <td className="px-3 py-2 text-right font-mono text-foreground">€{r.price}</td>
                  <td className="px-3 py-2 text-right text-muted-foreground">{r.distance_km ? `${r.distance_km} km` : '—'}</td>
                  <td className="px-3 py-2 text-right text-muted-foreground">{r.max_passengers ?? 4}</td>
                  <td className="px-3 py-2">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteRoute.mutate({ id: r.id, agencyId })}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
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
    addPrice.mutate({
      agency_id: agencyId,
      city,
      daily_rate: Number(rate),
      min_days: Number(minDays) || 1,
      description: desc || null,
    });
    setCity(''); setRate(''); setMinDays('1'); setDesc('');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        <div className="space-y-1">
          <Label className="text-[11px]">City</Label>
          <Input placeholder="Paris" value={city} onChange={(e) => setCity(e.target.value)} className="text-xs" />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px]">Daily Rate (€)</Label>
          <Input type="number" min={0} placeholder="350" value={rate} onChange={(e) => setRate(e.target.value)} className="text-xs font-mono" />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px]">Min Days</Label>
          <Input type="number" min={1} placeholder="1" value={minDays} onChange={(e) => setMinDays(e.target.value)} className="text-xs font-mono" />
        </div>
        <div className="flex items-end">
          <Button size="sm" onClick={handleAdd} disabled={addPrice.isPending || !city || !rate} className="gradient-accent text-accent-foreground w-full">
            <Plus className="h-3.5 w-3.5 mr-1" /> Add
          </Button>
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-[11px]">Description / Itinerary (optional)</Label>
        <Input placeholder="E.g. 10-day Europe tour covering Paris, Rome, Barcelona..." value={desc} onChange={(e) => setDesc(e.target.value)} className="text-xs" />
      </div>

      {isLoading ? (
        <p className="text-xs text-muted-foreground">Loading...</p>
      ) : prices.length === 0 ? (
        <p className="text-xs text-muted-foreground py-6 text-center">No limo tour pricing configured yet</p>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">City</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Daily Rate</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Min Days</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Description</th>
                <th className="px-3 py-2 w-10" />
              </tr>
            </thead>
            <tbody>
              {prices.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-secondary/20">
                  <td className="px-3 py-2 text-foreground font-medium">{p.city}</td>
                  <td className="px-3 py-2 text-right font-mono text-foreground">€{p.daily_rate}/day</td>
                  <td className="px-3 py-2 text-right text-muted-foreground">{p.min_days ?? 1}</td>
                  <td className="px-3 py-2 text-muted-foreground max-w-[200px] truncate">{p.description || '—'}</td>
                  <td className="px-3 py-2">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deletePrice.mutate({ id: p.id, agencyId })}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
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
    addTour.mutate({
      agency_id: agencyId,
      tour_name: name,
      daily_rate: Number(rate),
      duration_hours: Number(hours) || 4,
      description: desc || null,
    });
    setName(''); setRate(''); setHours('4'); setDesc('');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        <div className="space-y-1">
          <Label className="text-[11px]">Tour Name</Label>
          <Input placeholder="Downtown Tour" value={name} onChange={(e) => setName(e.target.value)} className="text-xs" />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px]">Price (€/day)</Label>
          <Input type="number" min={0} placeholder="120" value={rate} onChange={(e) => setRate(e.target.value)} className="text-xs font-mono" />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px]">Duration (hrs)</Label>
          <Input type="number" min={1} placeholder="4" value={hours} onChange={(e) => setHours(e.target.value)} className="text-xs font-mono" />
        </div>
        <div className="flex items-end">
          <Button size="sm" onClick={handleAdd} disabled={addTour.isPending || !name || !rate} className="gradient-accent text-accent-foreground w-full">
            <Plus className="h-3.5 w-3.5 mr-1" /> Add
          </Button>
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-[11px]">Description (optional)</Label>
        <Input placeholder="Guided city tour with historical landmarks..." value={desc} onChange={(e) => setDesc(e.target.value)} className="text-xs" />
      </div>

      {isLoading ? (
        <p className="text-xs text-muted-foreground">Loading...</p>
      ) : tours.length === 0 ? (
        <p className="text-xs text-muted-foreground py-6 text-center">No city tours configured yet</p>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Tour Name</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Price/Day</th>
                <th className="px-3 py-2 text-right font-medium text-muted-foreground">Duration</th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Description</th>
                <th className="px-3 py-2 w-10" />
              </tr>
            </thead>
            <tbody>
              {tours.map((t) => (
                <tr key={t.id} className="border-t border-border hover:bg-secondary/20">
                  <td className="px-3 py-2 text-foreground font-medium">{t.tour_name}</td>
                  <td className="px-3 py-2 text-right font-mono text-foreground">€{t.daily_rate}</td>
                  <td className="px-3 py-2 text-right text-muted-foreground">{t.duration_hours ?? 4}h</td>
                  <td className="px-3 py-2 text-muted-foreground max-w-[200px] truncate">{t.description || '—'}</td>
                  <td className="px-3 py-2">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteTour.mutate({ id: t.id, agencyId })}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </td>
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
