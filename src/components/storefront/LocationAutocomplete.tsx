import { useState, useRef, useEffect } from 'react';
import { MapPin, Plane, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LocationOption {
  id: string;
  name: string;
  type: 'station' | 'airport' | 'city';
  address?: string;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  locations: LocationOption[];
  agencyCity: string;
}

const LocationAutocomplete = ({ value, onChange, placeholder = 'Enter location', locations, agencyCity }: LocationAutocompleteProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = locations.filter((loc) =>
    loc.name.toLowerCase().includes(query.toLowerCase()) ||
    (loc.address && loc.address.toLowerCase().includes(query.toLowerCase()))
  );

  const grouped = {
    station: filtered.filter((l) => l.type === 'station'),
    airport: filtered.filter((l) => l.type === 'airport'),
    city: filtered.filter((l) => l.type === 'city'),
  };

  const handleSelect = (loc: LocationOption) => {
    onChange(loc.name);
    setQuery(loc.name);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full h-11 rounded-lg border border-border bg-muted/30 pl-10 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      {query && (
        <button
          onClick={() => { setQuery(''); onChange(''); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      <AnimatePresence>
        {open && query.length >= 1 && filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 bg-popover border border-border rounded-xl shadow-lg max-h-72 overflow-y-auto"
          >
            {grouped.station.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Station</div>
                {grouped.station.map((loc) => (
                  <button key={loc.id} onClick={() => handleSelect(loc)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors text-left">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{loc.name}</div>
                      {loc.address && <div className="text-xs text-muted-foreground truncate">{loc.address}</div>}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {grouped.airport.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border-t border-border">Airport</div>
                {grouped.airport.map((loc) => (
                  <button key={loc.id} onClick={() => handleSelect(loc)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors text-left">
                    <Plane className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{loc.name}</div>
                      {loc.address && <div className="text-xs text-muted-foreground truncate">{loc.address}</div>}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {grouped.city.length > 0 && (
              <div>
                <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border-t border-border">City</div>
                {grouped.city.map((loc) => (
                  <button key={loc.id} onClick={() => handleSelect(loc)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors text-left">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{loc.name}</div>
                    </div>
                  </button>
                ))}
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
