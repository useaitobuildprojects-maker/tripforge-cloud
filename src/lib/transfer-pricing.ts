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
  drop_off_fee: number;
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

/** Fetch driving distance using Google Routes API (primary) or OSRM (fallback) */
export async function getDrivingDistance(
  originCoords: [number, number],
  destCoords: [number, number]
): Promise<number | null> {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
  if (apiKey) {
    try {
      const body = {
        origin: {
          location: {
            latLng: { latitude: originCoords[1], longitude: originCoords[0] },
          },
        },
        destination: {
          location: {
            latLng: { latitude: destCoords[1], longitude: destCoords[0] },
          },
        },
        travelMode: 'DRIVE',
        routingPreference: 'TRAFFIC_UNAWARE',
      };

      console.log('[Transfer] Distance via Google Routes API');
      const res = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'routes.distanceMeters',
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.routes?.[0]?.distanceMeters) {
          const km = Math.round(data.routes[0].distanceMeters / 1000);
          console.log('[Transfer] Google Routes distance:', km, 'km');
          return km;
        }
      }
      console.warn('[Transfer] Google Routes failed, trying OSRM fallback');
    } catch (e) {
      console.warn('[Transfer] Google Routes error, trying OSRM:', e);
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

/** Geocode a place name using Google Places Text Search (New) with OSRM fallback */
export async function geocodePlace(name: string, _country?: string): Promise<[number, number] | null> {
  // Check POI database first — if coords exist, skip geocoding entirely
  const match = resolvePoiMatch(name);
  if (match.coords) {
    console.log('[Transfer] POI coords hit:', name, '→', match.coords);
    return match.coords;
  }

  const query = match.query;

  // Try Google Places Text Search (New API)
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
  if (apiKey) {
    try {
      console.log('[Transfer] Geocoding (Google Places):', query);
      const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'places.location',
        },
        body: JSON.stringify({ textQuery: query, maxResultCount: 1 }),
      });
      if (res.ok) {
        const data = await res.json();
        const place = data.places?.[0];
        if (place?.location) {
          const coords: [number, number] = [place.location.longitude, place.location.latitude];
          console.log('[Transfer] Geocoded (Google):', query, '→', coords);
          return coords;
        }
      }
    } catch (e) {
      console.warn('[Transfer] Google geocode error, trying fallback:', e);
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

/** Find city rate: origin city first (driver's base), then destination, then null. */
function findCityRate(
  cityPricing: CityPricing[],
  origin: string,
  destination: string
): CityPricing | null {
  if (!cityPricing.length) return null;

  const normalize = (s: string) => s.toLowerCase().trim();
  const o = normalize(origin);
  const d = normalize(destination);

  const originMatch = cityPricing.find((cp) => o.includes(normalize(cp.city_name)));
  if (originMatch) return originMatch;

  const destMatch = cityPricing.find((cp) => d.includes(normalize(cp.city_name)));
  if (destMatch) return destMatch;

  return null;
}

/** Calculate transfer price using distance + formula */
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
    return { origin, destination, category, price: 0, source: 'formula', distance_km: null, drop_off_fee: 0, error: 'no_formula' };
  }

  const [originCoords, destCoords] = await Promise.all([
    preOriginCoords ? Promise.resolve(preOriginCoords) : geocodePlace(origin, country),
    preDestCoords ? Promise.resolve(preDestCoords) : geocodePlace(destination, country),
  ]);

  if (preOriginCoords || preDestCoords) {
    console.log('[Transfer] Using pre-resolved coords:', { origin: !!preOriginCoords, dest: !!preDestCoords });
  }

  if (!originCoords) {
    return { origin, destination, category, price: 0, source: 'formula', distance_km: null, drop_off_fee: 0, error: 'geocode_origin' };
  }
  if (!destCoords) {
    return { origin, destination, category, price: 0, source: 'formula', distance_km: null, drop_off_fee: 0, error: 'geocode_destination' };
  }

  const distanceKm = await getDrivingDistance(originCoords, destCoords);
  if (!distanceKm) {
    console.warn('[Transfer] No distance from any provider');
    return { origin, destination, category, price: 0, source: 'formula', distance_km: null, drop_off_fee: 0, error: 'osrm_failed' };
  }

  const dropOffFee = cityRate?.drop_off_fee ?? 0;
  const isIntercity = cityRate ? !destination.toLowerCase().includes(cityRate.city_name.toLowerCase()) : false;
  const appliedDropOff = isIntercity ? dropOffFee : 0;

  const multiplier = getCategoryMultiplier(config, category);
  const price = Math.round(baseFee + distanceKm * perKmRate * multiplier + appliedDropOff);
  console.log('[Transfer] Formula result:', { distanceKm, price, dropOff: appliedDropOff, cityRate: cityRate?.city_name ?? 'global' });
  return { origin, destination, category, price, source: 'formula', distance_km: distanceKm, drop_off_fee: appliedDropOff };
}
