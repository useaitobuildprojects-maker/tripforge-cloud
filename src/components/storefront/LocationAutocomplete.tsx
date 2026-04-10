import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MapPin, Plane, X, Search, Loader2, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchPOIs } from '@/data/poi-database';
import { countryToISO } from '@/lib/country-utils';

interface LocationOption {
  id: string;
  name: string;
  type: 'station' | 'airport' | 'city' | 'hotel_zone';
  address?: string;
  source?: 'configured' | 'search' | 'poi';
  coords?: [number, number];
  fullName?: string;
}

export interface LocationSelection {
  name: string;
  fullName?: string;
  coords?: [number, number];
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string, selection?: LocationSelection) => void;
  placeholder?: string;
  locations: LocationOption[];
  agencyCity: string;
  agencyCountry?: string;
}

interface GooglePlaceSuggestion {
  placePrediction: {
    placeId: string;
    text: { text: string };
    structuredFormat?: {
      mainText: { text: string };
      secondaryText?: { text: string };
    };
    types?: string[];
  };
}

function detectTypeFromGoogle(types: string[]): LocationOption['type'] {
  if (types.some(t => t === 'airport' || t === 'aerodrome')) return 'airport';
  if (types.some(t => ['locality', 'administrative_area_level_3', 'administrative_area_level_2', 'sublocality'].includes(t))) return 'city';
  return 'station';
}

const TYPE_ICONS: Record<string, React.ElementType> = { station: MapPin, airport: Plane, city: Building2, hotel_zone: MapPin };

const LocationAutocomplete = ({ value, onChange, placeholder = 'Enter location', locations, agencyCity, agencyCountry }: LocationAutocompleteProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [searchResults, setSearchResults] = useState<LocationOption[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const countryCode = useMemo(() => countryToISO(agencyCountry || ''), [agencyCountry]);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const searchLocation = useCallback(async (q: string) => {
    const normalized = q.trim();
    if (normalized.length < 2) { setSearchResults([]); return; }

    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
      if (!apiKey) { setSearchResults([]); setLoading(false); return; }

      // Use Google Places Autocomplete (New) API
      const euroCountries = ['al','ad','at','be','ba','bg','hr','cy','cz','dk','ee','fi','fr','de','gr','hu','is','ie','it','xk','lv','li','lt','lu','mt','md','mc','me','nl','mk','no','pl','pt','ro','rs','sk','si','es','se','ch','tr','ua','gb'];
      const countries = countryCode ? [countryCode] : euroCountries;

      const body: any = {
        input: normalized,
        languageCode: 'en',
        includedRegionCodes: countries,
      };

      // Bias toward agency city
      if (agencyCity) {
        body.inputOffset = normalized.length;
      }

      const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) { setSearchResults([]); setLoading(false); return; }
      const data = await res.json();
      const suggestions = (data.suggestions || []) as GooglePlaceSuggestion[];

      // Fetch place details for coords in parallel
      const results: LocationOption[] = await Promise.all(
        suggestions.slice(0, 10).map(async (s, i) => {
          const pred = s.placePrediction;
          const mainText = pred.structuredFormat?.mainText?.text || pred.text.text;
          const secondaryText = pred.structuredFormat?.secondaryText?.text || '';
          const types = pred.types || [];

          // Fetch place details for coordinates
          let coords: [number, number] | undefined;
          try {
            const detailRes = await fetch(
              `https://places.googleapis.com/v1/places/${pred.placeId}?languageCode=en`,
              {
                headers: {
                  'X-Goog-Api-Key': apiKey,
                  'X-Goog-FieldMask': 'location',
                },
              }
            );
            if (detailRes.ok) {
              const detail = await detailRes.json();
              if (detail.location) {
                coords = [detail.location.longitude, detail.location.latitude];
              }
            }
          } catch { /* coords will be undefined */ }

          return {
            id: `search-${i}`,
            name: mainText,
            type: detectTypeFromGoogle(types),
            address: secondaryText,
            source: 'search' as const,
            coords,
            fullName: pred.text.text,
          };
        })
      );

      setSearchResults(results.slice(0, 12));
    } catch {
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [agencyCity, countryCode]);

  // Filter configured locations
  const filteredConfigured = locations.filter((loc) =>
    loc.name.toLowerCase().includes(query.toLowerCase()) ||
    (loc.address && loc.address.toLowerCase().includes(query.toLowerCase()))
  );

  // POI results (instant, from local database)
  const poiResults = useMemo(() => {
    if (!query || query.length < 1) return [];
    const pois = searchPOIs(query, agencyCountry || '');
    const configuredNames = new Set(locations.map((l) => l.name.toLowerCase()));
    return pois
      .filter((p) => !configuredNames.has(p.name.toLowerCase()))
      .map((p, i) => ({
        id: `poi-${i}`,
        name: p.name,
        type: p.type,
        address: p.address,
        source: 'poi' as const,
        coords: p.coords,
        fullName: p.address ? `${p.name}, ${p.address}` : p.name,
      }));
  }, [query, agencyCountry, locations]);

  // Merge: configured first, then POI, then search results (deduplicated)
  const allNames = new Set([
    ...filteredConfigured.map((l) => l.name.toLowerCase()),
    ...poiResults.map((l) => l.name.toLowerCase()),
  ]);
  const dedupedSearch = searchResults.filter((r) => !allNames.has(r.name.toLowerCase()));
  const allResults = [...filteredConfigured, ...poiResults, ...dedupedSearch];

  const grouped = {
    configured: filteredConfigured,
    poi: poiResults,
    searchResults: dedupedSearch,
  };
  const handleInputChange = (val: string) => {
    setQuery(val);
    onChange(val);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchLocation(val), 400);
  };

  const handleSelect = (loc: LocationOption) => {
    const displayName = loc.fullName || loc.name;
    onChange(displayName, { name: displayName, fullName: loc.fullName, coords: loc.coords });
    setQuery(loc.name);
    setOpen(false);
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

            {/* POI database results (instant, local) */}
            {grouped.poi.length > 0 && (
              <div>
                <div className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground ${grouped.configured.length > 0 ? 'border-t border-border' : ''}`}>
                  Popular locations
                </div>
                {grouped.poi.map((loc) => {
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

            {/* Search results from Google Places */}
            {grouped.searchResults.length > 0 && (
              <div>
                <div className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground ${(grouped.configured.length > 0 || grouped.poi.length > 0) ? 'border-t border-border' : ''}`}>
                  Other places
                </div>
                {grouped.searchResults.map((loc) => {
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
