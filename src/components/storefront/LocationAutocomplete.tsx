import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MapPin, Plane, X, Search, Loader2, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchPOIs } from '@/data/poi-database';

interface LocationOption {
  id: string;
  name: string;
  type: 'station' | 'airport' | 'city' | 'hotel_zone';
  address?: string;
  source?: 'configured' | 'search' | 'poi';
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  locations: LocationOption[];
  agencyCity: string;
  agencyCountry?: string;
}

interface PhotonFeature {
  properties: {
    name?: string;
    city?: string;
    state?: string;
    country?: string;
    osm_value?: string;
    osm_key?: string;
  };
}

function detectTypeFromPhoton(feat: PhotonFeature): LocationOption['type'] {
  const { osm_value, osm_key, name } = feat.properties;
  const lower = (name || '').toLowerCase();
  if (osm_value === 'aerodrome' || osm_key === 'aeroway' || lower.includes('airport') || lower.includes('aéroport')) return 'airport';
  if (osm_value === 'city' || osm_value === 'town' || osm_value === 'village' || osm_key === 'place') return 'city';
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

const TYPE_ICONS: Record<string, React.ElementType> = { station: MapPin, airport: Plane, city: Building2, hotel_zone: MapPin };

const LocationAutocomplete = ({ value, onChange, placeholder = 'Enter location', locations, agencyCity, agencyCountry }: LocationAutocompleteProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [searchResults, setSearchResults] = useState<LocationOption[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const countryHints = useMemo(() => {
    const fromAgency = (agencyCountry || '')
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const fromAddresses = locations
      .map((l) => l.address?.split(',').pop()?.trim())
      .filter((c): c is string => !!c);

    return Array.from(new Set([...fromAgency, ...fromAddresses])).slice(0, 6);
  }, [agencyCountry, locations]);

  const countryHintsLower = useMemo(
    () => new Set(countryHints.map((c) => c.toLowerCase())),
    [countryHints]
  );

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const searchPhoton = useCallback(async (q: string) => {
    const normalized = q.trim();
    if (normalized.length < 1) { setSearchResults([]); return; }

    setLoading(true);
    try {
      const normalizedLower = normalized.toLowerCase();
      const queryAlreadyScopedToCountry = countryHints.some((country) =>
        normalizedLower.includes(country.toLowerCase())
      );

      const queries = Array.from(new Set([
        ...(queryAlreadyScopedToCountry || countryHints.length === 0
          ? [normalized]
          : countryHints.map((country) => `${normalized}, ${country}`)),
        normalized,
      ]));

      const responses = await Promise.all(
        queries.map(async (singleQuery) => {
          const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(singleQuery)}&limit=8&lang=en`);
          if (!res.ok) return [];
          const data = await res.json();
          return (data.features || []) as PhotonFeature[];
        })
      );

      const tokens = normalized.toLowerCase().split(/\s+/).filter(Boolean);
      const genericTokens = new Set(['airport', 'airports', 'station', 'stations', 'city', 'hotel', 'port', 'terminal']);
      const significantTokens = tokens.filter((t) => !genericTokens.has(t));

      const seen = new Set<string>();
      const rankedResults: Array<LocationOption & { score: number }> = [];

      responses.flat().forEach((feat) => {
        const name = feat.properties.name || 'Unknown';
        const address = buildAddress(feat);
        const type = detectTypeFromPhoton(feat);
        const featureCountry = (feat.properties.country || '').toLowerCase();
        const haystack = `${name} ${address}`.toLowerCase();
        const key = `${name.toLowerCase()}|${address.toLowerCase()}`;
        if (seen.has(key)) return;

        const hasAllSignificantTokens = significantTokens.every((t) => haystack.includes(t));
        if (significantTokens.length > 0 && !hasAllSignificantTokens) return;

        let score = 0;
        if (haystack.includes(normalized.toLowerCase())) score += 100;
        for (const token of tokens) {
          if (haystack.includes(token)) score += 20;
          if (token.includes('airport') && type === 'airport') score += 15;
          if (token.includes('city') && type === 'city') score += 10;
        }
        if (name.toLowerCase().startsWith(tokens[0] || '')) score += 8;
        if (agencyCity && haystack.includes(agencyCity.toLowerCase())) score += 10;

        if (countryHintsLower.size > 0 && featureCountry) {
          if (countryHintsLower.has(featureCountry)) score += 28;
          else score -= 24;
        }

        seen.add(key);
        rankedResults.push({
          id: `search-${rankedResults.length}`,
          name,
          type,
          address,
          source: 'search',
          score,
        });
      });

      rankedResults.sort((a, b) => b.score - a.score);

      const cleanedResults = rankedResults.map(({ score: _score, ...rest }) => rest);
      const countryScopedResults = countryHintsLower.size > 0
        ? cleanedResults.filter((loc) => {
            const haystack = `${loc.name} ${loc.address || ''}`.toLowerCase();
            return Array.from(countryHintsLower).some((country) => haystack.includes(country));
          })
        : cleanedResults;

      setSearchResults((countryScopedResults.length > 0 ? countryScopedResults : cleanedResults).slice(0, 12));
    } catch {
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [agencyCity, countryHints, countryHintsLower]);

  // Filter configured locations
  const filteredConfigured = locations.filter((loc) =>
    loc.name.toLowerCase().includes(query.toLowerCase()) ||
    (loc.address && loc.address.toLowerCase().includes(query.toLowerCase()))
  );

  // Merge: configured first, then search results (deduplicated)
  const configuredNames = new Set(filteredConfigured.map((l) => l.name.toLowerCase()));
  const dedupedSearch = searchResults.filter((r) => !configuredNames.has(r.name.toLowerCase()));
  const allResults = [...filteredConfigured, ...dedupedSearch];

  const handleInputChange = (val: string) => {
    setQuery(val);
    onChange(val);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchPhoton(val), 350);
  };

  const handleSelect = (loc: LocationOption) => {
    onChange(loc.name);
    setQuery(loc.name);
    setOpen(false);
  };

  const grouped = {
    configured: filteredConfigured,
    searchAirport: dedupedSearch.filter((l) => l.type === 'airport'),
    searchCity: dedupedSearch.filter((l) => l.type === 'city'),
    searchStation: dedupedSearch.filter((l) => l.type === 'station'),
  };

  return (
    <div ref={wrapperRef} className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      {loading && <Loader2 className="absolute right-9 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground animate-spin" />}
      <input
        type="text"
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full h-11 rounded-lg border border-border bg-muted/30 pl-10 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      {query && (
        <button
          onClick={() => { setQuery(''); onChange(''); setSearchResults([]); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      <AnimatePresence>
        {open && query.length >= 1 && allResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 bg-popover border border-border rounded-xl shadow-lg max-h-72 overflow-y-auto"
          >
            {/* Configured locations (agency's own) */}
            {grouped.configured.length > 0 && (
              <div>
                <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Our locations</div>
                {grouped.configured.map((loc) => {
                  const Icon = TYPE_ICONS[loc.type] || MapPin;
                  return (
                    <button key={loc.id} onClick={() => handleSelect(loc)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors text-left">
                      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{loc.name}</div>
                        {loc.address && <div className="text-xs text-muted-foreground truncate">{loc.address}</div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Search results from web */}
            {dedupedSearch.length > 0 && (
              <div>
                <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-t border-border">
                  Other places
                </div>
                {dedupedSearch.map((loc) => {
                  const Icon = TYPE_ICONS[loc.type] || MapPin;
                  return (
                    <button key={loc.id} onClick={() => handleSelect(loc)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors text-left">
                      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{loc.name}</div>
                        {loc.address && <div className="text-xs text-muted-foreground truncate">{loc.address}</div>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Generate demo locations based on agency city
export const getAgencyLocations = (city: string, country: string): LocationOption[] => {
  const cityLower = city.toLowerCase();
  return [
    { id: `${cityLower}-downtown`, name: `${city} Downtown`, type: 'station', address: `Central ${city}, ${country}` },
    { id: `${cityLower}-station`, name: `${city} Train Station`, type: 'station', address: `Main Railway Station, ${city}` },
    { id: `${cityLower}-airport-1`, name: `${city} International Airport`, type: 'airport', address: `Main Airport Terminal, ${city}` },
    { id: `${cityLower}-airport-2`, name: `${city} Regional Airport`, type: 'airport', address: `Regional Terminal, ${city}` },
    { id: `${cityLower}-city`, name: city, type: 'city' },
    { id: `${cityLower}-north`, name: `${city} North`, type: 'station', address: `North District, ${city}` },
    { id: `${cityLower}-south`, name: `${city} South`, type: 'station', address: `South District, ${city}` },
    { id: `${cityLower}-port`, name: `${city} Port`, type: 'station', address: `Harbor Area, ${city}` },
  ];
};

export default LocationAutocomplete;
