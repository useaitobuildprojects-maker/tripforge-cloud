import { useState } from 'react';
import { Plus, X, MapPin, Plane, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LocationEntry {
  name: string;
  type: 'station' | 'airport' | 'city';
  address?: string;
}

interface LocationsEditorProps {
  locations: LocationEntry[];
  onChange: (locations: LocationEntry[]) => void;
}

const TYPE_LABELS: Record<string, string> = { station: 'Station', airport: 'Airport', city: 'City' };
const TYPE_ICONS: Record<string, React.ElementType> = { station: MapPin, airport: Plane, city: Building2 };

const LocationsEditor = ({ locations, onChange }: LocationsEditorProps) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'station' | 'airport' | 'city'>('station');
  const [address, setAddress] = useState('');

  const addLocation = () => {
    if (!name.trim()) return;
    onChange([...locations, { name: name.trim(), type, address: address.trim() || undefined }]);
    setName('');
    setAddress('');
  };

  const removeLocation = (index: number) => {
    onChange(locations.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); addLocation(); }
  };

  return (
    <div className="space-y-4">
      {locations.length > 0 && (
        <div className="space-y-2">
          {locations.map((loc, i) => {
            const Icon = TYPE_ICONS[loc.type] || MapPin;
            return (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-secondary/20 px-4 py-3 group">
                <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-foreground">{loc.name}</span>
                  {loc.address && <span className="text-xs text-muted-foreground ml-2">— {loc.address}</span>}
                </div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{TYPE_LABELS[loc.type]}</span>
                <button onClick={() => removeLocation(i)} className="h-6 w-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {locations.length === 0 && (
        <p className="text-sm text-muted-foreground italic py-4 text-center">No locations added yet. Add pickup & drop-off points below.</p>
      )}

      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-1.5">
          <label className="text-xs text-muted-foreground">Location name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={handleKeyDown} placeholder="e.g. Paris Airport CDG" />
        </div>
        <div className="w-28 space-y-1.5">
          <label className="text-xs text-muted-foreground">Type</label>
          <Select value={type} onValueChange={(v) => setType(v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="station">Station</SelectItem>
              <SelectItem value="airport">Airport</SelectItem>
              <SelectItem value="city">City</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 space-y-1.5">
          <label className="text-xs text-muted-foreground">Address (optional)</label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} onKeyDown={handleKeyDown} placeholder="e.g. Terminal 2, Roissy" />
        </div>
        <Button type="button" onClick={addLocation} disabled={!name.trim()} className="gradient-accent text-accent-foreground rounded-xl h-10 px-4">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default LocationsEditor;
