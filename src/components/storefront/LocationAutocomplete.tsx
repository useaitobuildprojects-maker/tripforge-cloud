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
  accentColor?: string;
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

const LocationAutocomplete = ({ value, onChange, placeholder = 'Enter location', locations, agencyCity, agencyCountry, accentColor = '#0f172a' }: LocationAutocompleteProps) => {
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

  // POI results (instant, from local database)
  const poiResults = useMemo(() => {
    if (!query || query.length < 1) return [];
    const pois = searchPOIs(query, agencyCountry || '');
    return pois.map((p, i) => ({
        id: `poi-${i}`,
        name: p.name,
        type: p.type,
        address: p.address,
        source: 'poi' as const,
        coords: p.coords,
        fullName: p.address ? `${p.name}, ${p.address}` : p.name,
      }));
  }, [query, agencyCountry]);

  // Merge: POI first, then search results (deduplicated)
  const allNames = new Set(poiResults.map((l) => l.name.toLowerCase()));
  const dedupedSearch = searchResults.filter((r) => !allNames.has(r.name.toLowerCase()));
  const allResults = [...poiResults, ...dedupedSearch];

  const grouped = {
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
      {loading && <Loader2 className="absolute right-7 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground animate-spin" />}
      <input
        type="text"
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full bg-transparent border-0 p-0 pr-6 text-sm focus:outline-none focus:ring-0 placeholder:text-muted-foreground/60"
      />
      {query && (
        <button
          onClick={() => { setQuery(''); onChange(''); setSearchResults([]); }}
          className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      <AnimatePresence>
        {open && query.length >= 1 && allResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-[calc(100%+12px)] z-50 bg-white rounded-md shadow-[0_20px_50px_-12px_rgba(15,23,42,0.25)] border border-[#e5e7eb] max-h-[420px] overflow-y-auto w-[460px] max-w-[92vw]"
          >
            {(['poi','searchResults'] as const).map((groupKey, gi) => {
              const items = grouped[groupKey];
              if (items.length === 0) return null;
              const labels = { poi: 'Popular destinations', searchResults: 'More places' };
              const showDivider = groupKey === 'searchResults' && grouped.poi.length > 0;
              const typeLabel = (t: string) => t === 'airport' ? 'Airport' : t === 'city' ? 'City' : t === 'hotel_zone' ? 'Hotel zone' : 'Station';
              return (
                <div key={groupKey}>
                  {showDivider && <div className="h-px bg-[#eef0f3] mx-4" />}
                  <div className="px-4 pt-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] flex items-center gap-2" style={{ color: accentColor }}>
                    <span className="inline-block h-1 w-1 rounded-full" style={{ backgroundColor: accentColor }} />
                    <span>{labels[groupKey]}</span>
                    <span className="flex-1 h-px bg-[#f1f3f6]" />
                  </div>
                  {items.map((loc) => {
                    const Icon = TYPE_ICONS[loc.type] || MapPin;
                    return (
                      <button
                        key={loc.id}
                        onClick={() => handleSelect(loc)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#f7f9fc] transition-all text-left group border-l-2 border-transparent"
                        onMouseEnter={(e) => { e.currentTarget.style.borderLeftColor = accentColor; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderLeftColor = 'transparent'; }}
                      >
                        <span className="h-9 w-9 rounded-md bg-[#f4f6fa] flex items-center justify-center shrink-0 group-hover:bg-white group-hover:shadow-[0_2px_8px_rgba(15,23,42,0.08)] group-hover:ring-1 group-hover:ring-[#e5e7eb] transition-all">
                          <Icon className="h-4 w-4" style={{ color: accentColor }} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-semibold text-[#0f172a] truncate">{loc.name}</div>
                            <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0" style={{ backgroundColor: `${accentColor}14`, color: accentColor }}>{typeLabel(loc.type)}</span>
                          </div>
                          {loc.address && <div className="text-xs text-[#64748b] truncate mt-0.5">{loc.address}</div>}
                        </div>
                        <span className="text-[#cbd5e1] transition-colors shrink-0 text-xs group-hover:font-bold" style={{}}>
                          <span className="inline-block transition-transform group-hover:translate-x-0.5" style={{ color: 'inherit' }}>→</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
            <div className="px-4 py-2 border-t border-[#f1f3f6] bg-[#fafbfc] text-[10px] text-[#94a3b8] flex items-center justify-between">
              <span>Powered by Google Places</span>
              <span className="font-semibold" style={{ color: accentColor }}>{allResults.length} result{allResults.length !== 1 ? 's' : ''}</span>
            </div>
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
