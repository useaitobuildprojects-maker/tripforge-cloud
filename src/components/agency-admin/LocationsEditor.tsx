import { useState, useRef } from 'react';
import { Plus, X, MapPin, Plane, Building2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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
const TYPE_COLORS: Record<string, string> = {
  station: 'bg-blue-500/10 text-blue-700 border-blue-200',
  airport: 'bg-amber-500/10 text-amber-700 border-amber-200',
  city: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
};

const AIRPORT_KEYWORDS = ['airport', 'aéroport', 'aeropuerto', 'flughafen', 'aeroporto', 'cdg', 'ory', 'jfk', 'lhr', 'bcn', 'fco', 'terminal'];
const STATION_KEYWORDS = ['station', 'gare', 'train', 'railway', 'bus', 'port', 'harbor', 'harbour', 'terminal', 'downtown', 'north', 'south', 'east', 'west', 'central', 'office', 'desk', 'counter', 'branch'];

function detectType(name: string): 'station' | 'airport' | 'city' {
  const lower = name.toLowerCase();
  if (AIRPORT_KEYWORDS.some((kw) => lower.includes(kw))) return 'airport';
  if (STATION_KEYWORDS.some((kw) => lower.includes(kw))) return 'station';
  return 'city';
}

const LocationsEditor = ({ locations, onChange }: LocationsEditorProps) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addLocation = (raw: string) => {
    const name = raw.trim();
    if (!name) return;
    // Avoid duplicates
    if (locations.some((l) => l.name.toLowerCase() === name.toLowerCase())) return;
    const type = detectType(name);
    onChange([...locations, { name, type }]);
    setInput('');
  };

  const addMultiple = (text: string) => {
    // Support comma or newline separated bulk paste
    const names = text.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
    if (names.length <= 1) {
      addLocation(text);
      return;
    }
    const existing = new Set(locations.map((l) => l.name.toLowerCase()));
    const newLocs = names
      .filter((n) => !existing.has(n.toLowerCase()))
      .map((n) => ({ name: n, type: detectType(n) }));
    if (newLocs.length > 0) onChange([...locations, ...newLocs]);
    setInput('');
  };

  const removeLocation = (index: number) => {
    onChange(locations.filter((_, i) => i !== index));
  };

  const cycleType = (index: number) => {
    const order: LocationEntry['type'][] = ['station', 'airport', 'city'];
    const current = locations[index].type;
    const next = order[(order.indexOf(current) + 1) % order.length];
    const updated = [...locations];
    updated[index] = { ...updated[index], type: next };
    onChange(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addMultiple(input);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text');
    if (pasted.includes(',') || pasted.includes('\n')) {
      e.preventDefault();
      addMultiple(pasted);
    }
  };

  const detectedType = input.trim() ? detectType(input) : null;

  return (
    <div className="space-y-4">
      {/* Quick-add input */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Type a location name and press Enter  (e.g. Paris CDG Airport)"
            className="pl-10 pr-24"
          />
          {detectedType && (
            <span className={`absolute right-12 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${TYPE_COLORS[detectedType]}`}>
              {TYPE_LABELS[detectedType]}
            </span>
          )}
        </div>
        <Button
          type="button"
          onClick={() => addMultiple(input)}
          disabled={!input.trim()}
          size="sm"
          className="h-10 px-4"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
        <Sparkles className="h-3 w-3" />
        Auto-detects type from name. Click the type badge to change it. Paste a comma-separated list to bulk-add.
      </p>

      {/* Location chips */}
      {locations.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {locations.map((loc, i) => {
            const Icon = TYPE_ICONS[loc.type] || MapPin;
            return (
              <div
                key={i}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-all group ${TYPE_COLORS[loc.type]}`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="font-medium">{loc.name}</span>
                <button
                  onClick={() => cycleType(i)}
                  className="text-[9px] uppercase tracking-wider font-bold opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                  title="Click to change type"
                >
                  {TYPE_LABELS[loc.type]}
                </button>
                <button
                  onClick={() => removeLocation(i)}
                  className="h-4 w-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-all ml-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 rounded-lg border border-dashed border-border">
          <MapPin className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No pickup/drop-off locations yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Add locations like "Paris CDG Airport", "Nice Train Station", "Marseille"
          </p>
        </div>
      )}

      {locations.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {locations.filter((l) => l.type === 'airport').length} airports · {locations.filter((l) => l.type === 'station').length} stations · {locations.filter((l) => l.type === 'city').length} cities
        </p>
      )}
    </div>
  );
};

export default LocationsEditor;
