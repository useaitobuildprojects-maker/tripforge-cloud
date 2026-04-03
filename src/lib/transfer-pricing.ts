import { TransferCategory } from '@/hooks/use-service-pricing';
import { StorefrontConfig } from '@/types/agency';
import POI_DB from '@/data/poi-database';

export interface TransferQuote {
  origin: string;
  destination: string;
  category: TransferCategory;
  price: number;
  source: 'formula';
  distance_km: number | null;
  error?: 'no_formula' | 'geocode_origin' | 'geocode_destination' | 'no_route' | 'osrm_failed';
}

/** Get multiplier for a category from config */
function getCategoryMultiplier(config: StorefrontConfig, category: TransferCategory): number {
  switch (category) {
    case 'economy': return 1;
    case 'business': return config.transfer_multiplier_business ?? 1.6;
    case 'first_class': return config.transfer_multiplier_first_class ?? 2.4;
    case 'van': return config.transfer_multiplier_van ?? 1.8;
  }
}

/** Calculate price using the fallback formula: Base + (Distance × Per-KM × Multiplier) */
export function getFormulaPrice(
  config: StorefrontConfig,
  distanceKm: number,
  category: TransferCategory
): number {
  const baseFee = config.transfer_base_fee ?? 0;
  const perKmRate = config.transfer_per_km_rate ?? 0;
  const multiplier = getCategoryMultiplier(config, category);
  return Math.round(baseFee + distanceKm * perKmRate * multiplier);
}

/** Fetch driving distance between two points using OSRM (free, no API key) */
export async function getOsrmDistance(
  originCoords: [number, number],
  destCoords: [number, number]
): Promise<number | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${originCoords[0]},${originCoords[1]};${destCoords[0]},${destCoords[1]}?overview=false`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes?.[0]) return null;
    return Math.round(data.routes[0].distance / 1000);
  } catch {
    return null;
  }
}

/** Try to find a POI match — returns coords if available, or a better query string */
function resolvePoiMatch(name: string): { coords?: [number, number]; query: string } {
  const normalized = name.toLowerCase().trim();
  const poi = POI_DB.find(p => 
    p.name.toLowerCase() === normalized ||
    (p.iata && p.iata.toLowerCase() === normalized)
  );
  if (poi) {
    if (poi.coords) {
      return { coords: poi.coords, query: `${poi.name}, ${poi.address}` };
    }
    return { query: `${poi.name}, ${poi.address}` };
  }
  return { query: name };
}

/** Geocode a place name and return [lng, lat] */
export async function geocodePlace(name: string, _country?: string): Promise<[number, number] | null> {
  // Check POI database first — if coords exist, skip geocoding entirely
  const match = resolvePoiMatch(name);
  if (match.coords) {
    console.log('[Transfer] POI coords hit:', name, '→', match.coords);
    return match.coords;
  }

  const query = match.query;

  // Try Mapbox first
  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  if (token) {
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&limit=1`;
      console.log('[Transfer] Geocoding (Mapbox):', query);
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const feature = data?.features?.[0];
        if (feature) {
          const [lng, lat] = feature.center;
          console.log('[Transfer] Geocoded:', query, '→', [lng, lat]);
          return [lng, lat];
        }
      }
    } catch (e) {
      console.warn('[Transfer] Mapbox geocode error, trying fallback:', e);
    }
  }

  // Fallback: Nominatim (OpenStreetMap) — free, no API key
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    console.log('[Transfer] Geocoding (Nominatim):', query);
    const res = await fetch(url, { headers: { 'User-Agent': 'TripForge/1.0' } });
    if (!res.ok) { console.warn('[Transfer] Nominatim HTTP error:', res.status); return null; }
    const data = await res.json();
    if (!data?.[0]) { console.warn('[Transfer] No geocode result for:', query); return null; }
    const lng = parseFloat(data[0].lon);
    const lat = parseFloat(data[0].lat);
    console.log('[Transfer] Geocoded (Nominatim):', query, '→', [lng, lat]);
    return [lng, lat];
  } catch (e) {
    console.error('[Transfer] Geocode error:', e);
    return null;
  }
}

/** Calculate transfer price using OSRM distance + formula */
export async function calculateTransferPrice(
  config: StorefrontConfig,
  origin: string,
  destination: string,
  category: TransferCategory,
  country?: string
): Promise<TransferQuote> {
  console.log('[Transfer] calculateTransferPrice:', { origin, destination, category, country });
  console.log('[Transfer] Config:', { base: config.transfer_base_fee, perKm: config.transfer_per_km_rate });

  const baseFee = config.transfer_base_fee ?? 0;
  const perKmRate = config.transfer_per_km_rate ?? 0;
  if (baseFee === 0 && perKmRate === 0) {
    console.warn('[Transfer] No formula configured (base=0, perKm=0)');
    return { origin, destination, category, price: 0, source: 'formula', distance_km: null, error: 'no_formula' };
  }

  const [originCoords, destCoords] = await Promise.all([
    geocodePlace(origin, country),
    geocodePlace(destination, country),
  ]);

  if (!originCoords) {
    return { origin, destination, category, price: 0, source: 'formula', distance_km: null, error: 'geocode_origin' };
  }
  if (!destCoords) {
    return { origin, destination, category, price: 0, source: 'formula', distance_km: null, error: 'geocode_destination' };
  }

  const distanceKm = await getOsrmDistance(originCoords, destCoords);
  if (!distanceKm) {
    console.warn('[Transfer] OSRM returned no distance');
    return { origin, destination, category, price: 0, source: 'formula', distance_km: null, error: 'osrm_failed' };
  }

  const price = getFormulaPrice(config, distanceKm, category);
  console.log('[Transfer] Formula result:', { distanceKm, price });
  return { origin, destination, category, price, source: 'formula', distance_km: distanceKm };
}
