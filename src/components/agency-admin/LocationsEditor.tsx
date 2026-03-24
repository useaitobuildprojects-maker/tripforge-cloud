import { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, X, MapPin, Plane, Building2, Search, Loader2, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

interface LocationEntry {
  name: string;
  type: 'station' | 'airport' | 'city';
  address?: string;
}

interface LocationsEditorProps {
  locations: LocationEntry[];
  onChange: (locations: LocationEntry[]) => void;
}

interface PhotonFeature {
  properties: {
    name?: string;
    city?: string;
    state?: string;
    country?: string;
    osm_value?: string;
    osm_key?: string;
    type?: string;
    street?: string;
    housenumber?: string;
    postcode?: string;
  };
  geometry: { coordinates: [number, number] };
}

const TYPE_LABELS: Record<string, string> = { station: 'Station', airport: 'Airport', city: 'City' };
const TYPE_ICONS: Record<string, React.ElementType> = { station: MapPin, airport: Plane, city: Building2 };
const TYPE_COLORS: Record<string, string> = {
  station: 'bg-blue-500/10 text-blue-700 border-blue-200',
  airport: 'bg-amber-500/10 text-amber-700 border-amber-200',
  city: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
};

function detectTypeFromPhoton(feat: PhotonFeature): LocationEntry['type'] {
  const { osm_value, osm_key, name } = feat.properties;
  const lower = (name || '').toLowerCase();
  if (osm_value === 'aerodrome' || osm_key === 'aeroway' || lower.includes('airport') || lower.includes('aéroport')) return 'airport';
  if (osm_value === 'city' || osm_value === 'town' || osm_value === 'village' || osm_value === 'hamlet' || osm_key === 'place') return 'city';
  return 'station';
}

function buildAddress(feat: PhotonFeature): string {
  const p = feat.properties;
  const parts: string[] = [];
  if (p.city && p.city !== p.name) parts.push(p.city);
  if (p.state) parts.push(p.state);
  if (p.country) parts.push(p.country);
  return parts.join(', ');
}

function buildDisplayName(feat: PhotonFeature): string {
  return feat.properties.name || 'Unknown location';
}

const LocationsEditor = ({ locations, onChange }: LocationsEditorProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PhotonFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const searchLocations = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=8&lang=en`);
      const data = await res.json();
      setResults(data.features || []);
      setShowDropdown(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchLocations(val), 300);
  };

  const addFromResult = (feat: PhotonFeature) => {
    const name = buildDisplayName(feat);
    if (locations.some((l) => l.name.toLowerCase() === name.toLowerCase())) {
      setShowDropdown(false);
      setQuery('');
      return;
    }
    const type = detectTypeFromPhoton(feat);
    const address = buildAddress(feat);
    onChange([...locations, { name, type, address: address || undefined }]);
    setQuery('');
    setShowDropdown(false);
    setResults([]);
  };

  const addManual = () => {
    const name = query.trim();
    if (!name) return;
    if (locations.some((l) => l.name.toLowerCase() === name.toLowerCase())) return;
    const AIRPORT_KW = ['airport', 'aéroport', 'aeropuerto', 'flughafen', 'aeroporto', 'cdg', 'ory', 'jfk', 'lhr'];
    const lower = name.toLowerCase();
    const type = AIRPORT_KW.some((kw) => lower.includes(kw)) ? 'airport' : 'city';
    onChange([...locations, { name, type }]);
    setQuery('');
    setShowDropdown(false);
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); addManual(); }
  };

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div ref={wrapperRef} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />}
        <Input
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
          onKeyDown={handleKeyDown}
          placeholder="Search for a city, airport, or station..."
          className="pl-10 pr-10"
        />

        <AnimatePresence>
          {showDropdown && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 bg-popover border border-border rounded-xl shadow-lg max-h-72 overflow-y-auto"
            >
              {results.map((feat, i) => {
                const type = detectTypeFromPhoton(feat);
                const Icon = TYPE_ICONS[type];
                const name = buildDisplayName(feat);
                const addr = buildAddress(feat);
                const alreadyAdded = locations.some((l) => l.name.toLowerCase() === name.toLowerCase());
                return (
                  <button
                    key={i}
                    onClick={() => addFromResult(feat)}
                    disabled={alreadyAdded}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{name}</div>
                      {addr && <div className="text-xs text-muted-foreground truncate">{addr}</div>}
                    </div>
                    <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${TYPE_COLORS[type]}`}>
                      {TYPE_LABELS[type]}
                    </span>
                    {alreadyAdded && <span className="text-[10px] text-muted-foreground">Added</span>}
                  </button>
                );
              })}
              {query.trim() && (
                <button
                  onClick={addManual}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors text-left border-t border-border"
                >
                  <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground">Add "<span className="font-medium text-foreground">{query.trim()}</span>" manually</span>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
        <Sparkles className="h-3 w-3" />
        Search real places worldwide. Type detects automatically. Click the badge to change type.
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
                {loc.address && <span className="text-[10px] opacity-60 hidden sm:inline">— {loc.address}</span>}
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
          <p className="text-xs text-muted-foreground mt-1">Search and add real locations above</p>
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
