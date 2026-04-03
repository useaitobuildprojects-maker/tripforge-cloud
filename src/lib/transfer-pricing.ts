import { TransferCategory } from '@/hooks/use-service-pricing';
import { StorefrontConfig } from '@/types/agency';
import { CityPricing } from '@/hooks/use-city-pricing';
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

/** Fetch driving distance using Mapbox Directions API (primary) or OSRM (fallback) */
export async function getDrivingDistance(
  originCoords: [number, number],
  destCoords: [number, number]
): Promise<number | null> {
  // Try Mapbox Directions first
  const token = import.meta.env.VITE_MAPBOX_TOKEN;
  if (token) {
    try {
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${originCoords[0]},${originCoords[1]};${destCoords[0]},${destCoords[1]}?overview=false&access_token=${token}`;
      console.log('[Transfer] Distance via Mapbox Directions');
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.code === 'Ok' && data.routes?.[0]) {
          const km = Math.round(data.routes[0].distance / 1000);
          console.log('[Transfer] Mapbox distance:', km, 'km');
          return km;
        }
      }
      console.warn('[Transfer] Mapbox Directions failed, trying OSRM fallback');
    } catch (e) {
      console.warn('[Transfer] Mapbox Directions error, trying OSRM:', e);
    }
  }

  // Fallback: OSRM (free, no API key)
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${originCoords[0]},${originCoords[1]};${destCoords[0]},${destCoords[1]}?overview=false`;
    console.log('[Transfer] Distance via OSRM fallback');
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

/** Try to find city-specific pricing for origin or destination */
function findCityRate(
  cityPricing: CityPricing[],
  origin: string,
  destination: string
): CityPricing | null {
  if (!cityPricing.length) return null;
  const normalize = (s: string) => s.toLowerCase().trim();
  const o = normalize(origin);
  const d = normalize(destination);
  // Match on origin city first, then destination
  for (const cp of cityPricing) {
    const cn = normalize(cp.city_name);
    if (o.includes(cn) || d.includes(cn)) return cp;
  }
  return null;
}

/** Calculate transfer price using OSRM distance + formula */
export async function calculateTransferPrice(
  config: StorefrontConfig,
  origin: string,
  destination: string,
  category: TransferCategory,
  country?: string,
  cityPricing: CityPricing[] = [],
  preOriginCoords?: [number, number],
  preDestCoords?: [number, number]
): Promise<TransferQuote> {
  console.log('[Transfer] calculateTransferPrice:', { origin, destination, category, country });

  // Check for city-specific rates first
  const cityRate = findCityRate(cityPricing, origin, destination);
  const baseFee = cityRate?.transfer_base_fee ?? config.transfer_base_fee ?? 0;
  const perKmRate = cityRate?.transfer_per_km_rate ?? config.transfer_per_km_rate ?? 0;

  if (cityRate) {
    console.log('[Transfer] Using city-specific rate for:', cityRate.city_name, { baseFee, perKmRate });
  } else {
    console.log('[Transfer] Using global rate:', { baseFee, perKmRate });
  }

  if (baseFee === 0 && perKmRate === 0) {
    console.warn('[Transfer] No formula configured (base=0, perKm=0)');
    return { origin, destination, category, price: 0, source: 'formula', distance_km: null, error: 'no_formula' };
  }

  const [originCoords, destCoords] = await Promise.all([
    preOriginCoords ? Promise.resolve(preOriginCoords) : geocodePlace(origin, country),
    preDestCoords ? Promise.resolve(preDestCoords) : geocodePlace(destination, country),
  ]);

  if (preOriginCoords || preDestCoords) {
    console.log('[Transfer] Using pre-resolved coords:', { origin: !!preOriginCoords, dest: !!preDestCoords });
  }

  if (!originCoords) {
    return { origin, destination, category, price: 0, source: 'formula', distance_km: null, error: 'geocode_origin' };
  }
  if (!destCoords) {
    return { origin, destination, category, price: 0, source: 'formula', distance_km: null, error: 'geocode_destination' };
  }

  const distanceKm = await getDrivingDistance(originCoords, destCoords);
  if (!distanceKm) {
    console.warn('[Transfer] No distance from any provider');
    return { origin, destination, category, price: 0, source: 'formula', distance_km: null, error: 'osrm_failed' };
  }

  // Use city-specific or global rates for formula
  const multiplier = getCategoryMultiplier(config, category);
  const price = Math.round(baseFee + distanceKm * perKmRate * multiplier);
  console.log('[Transfer] Formula result:', { distanceKm, price, cityRate: cityRate?.city_name ?? 'global' });
  return { origin, destination, category, price, source: 'formula', distance_km: distanceKm };
}
