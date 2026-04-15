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
  duration_min: number | null;
  drop_off_fee: number;
  // Uber-style breakdown
  base_fee: number;
  distance_charge: number;
  time_charge: number;
  minimum_fare: number;
  error?: 'no_formula' | 'geocode_origin' | 'geocode_destination' | 'no_route' | 'osrm_failed';
}

export interface RouteInfo {
  distance_km: number;
  duration_min: number;
}

/** Get multiplier for a category from config */
function getCategoryMultiplier(config: StorefrontConfig, category: TransferCategory): number {
  switch (category) {
    case 'economy': return 1;
    case 'business': return config.transfer_multiplier_business ?? 1.6;
    case 'first_class': return config.transfer_multiplier_first_class ?? 2.4;
  }
}

/** Calculate tiered distance charge: each 100km bracket can have its own per-km rate */
function getTieredDistanceCharge(config: StorefrontConfig, distanceKm: number): number {
  const tiers = config.transfer_distance_tiers;
  if (!tiers || tiers.length === 0) {
    // Flat rate fallback
    return distanceKm * (config.transfer_per_km_rate ?? 0);
  }
  // Sort tiers by from_km
  const sorted = [...tiers].sort((a, b) => a.from_km - b.from_km);
  let charge = 0;
  let remaining = distanceKm;

  for (const tier of sorted) {
    if (remaining <= 0) break;
    const bracketSize = tier.to_km - tier.from_km;
    const kmInThisBracket = Math.min(remaining, bracketSize);
    if (distanceKm > tier.from_km) {
      const usable = Math.min(kmInThisBracket, distanceKm - tier.from_km);
      charge += usable * tier.per_km_rate;
      remaining -= usable;
    }
  }
  // If distance exceeds all defined tiers, use the last tier's rate for the rest
  if (remaining > 0 && sorted.length > 0) {
    charge += remaining * sorted[sorted.length - 1].per_km_rate;
  }
  return charge;
}

/** Get seat-based multiplier: category_multiplier × (1 + seat_factor × max(0, seats - base_seats)) */
function getSeatMultiplier(config: StorefrontConfig, category: TransferCategory, seatCount?: number): number {
  const catMult = getCategoryMultiplier(config, category);
  if (!seatCount) return catMult;
  const baseSeats = config.transfer_base_seats ?? 3;
  const seatFactor = config.transfer_seat_factor ?? 0;
  const extraSeats = Math.max(0, seatCount - baseSeats);
  return catMult * (1 + seatFactor * extraSeats);
}

/** Calculate price using formula: (Base + TieredDistance + Duration×PerMin) × Multiplier, with minimum fare */
export function getFormulaPrice(
  config: StorefrontConfig,
  distanceKm: number,
  category: TransferCategory,
  durationMin?: number,
  seatCount?: number
): number {
  const baseFee = config.transfer_base_fee ?? 0;
  const perMinRate = config.transfer_per_minute_rate ?? 0;
  const minFare = config.transfer_minimum_fare ?? 0;
  const multiplier = getSeatMultiplier(config, category, seatCount);
  const distanceCharge = getTieredDistanceCharge(config, distanceKm);
  const raw = (baseFee + distanceCharge + (durationMin ?? 0) * perMinRate) * multiplier;
  return Math.round(Math.max(raw, minFare * multiplier));
}

/** Fetch driving distance and duration using Google Routes API (primary) or OSRM (fallback) */
export async function getDrivingRoute(
  originCoords: [number, number],
  destCoords: [number, number]
): Promise<RouteInfo | null> {
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

      console.log('[Transfer] Route via Google Routes API');
      const res = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration',
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        const route = data.routes?.[0];
        if (route?.distanceMeters) {
          const km = Math.round(route.distanceMeters / 1000);
          const durationSec = parseInt(route.duration?.replace('s', '') ?? '0', 10);
          const min = Math.round(durationSec / 60);
          console.log('[Transfer] Google Routes:', km, 'km,', min, 'min');
          return { distance_km: km, duration_min: min };
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
    console.log('[Transfer] Route via OSRM fallback');
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes?.[0]) return null;
    const km = Math.round(data.routes[0].distance / 1000);
    const min = Math.round(data.routes[0].duration / 60);
    return { distance_km: km, duration_min: min };
  } catch {
    return null;
  }
}

/** Backwards-compatible wrapper */
export async function getDrivingDistance(
  originCoords: [number, number],
  destCoords: [number, number]
): Promise<number | null> {
  const route = await getDrivingRoute(originCoords, destCoords);
  return route?.distance_km ?? null;
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

/** Geocode a place name using Google Places Text Search (New) with Nominatim fallback */
export async function geocodePlace(name: string, _country?: string): Promise<[number, number] | null> {
  const match = resolvePoiMatch(name);
  if (match.coords) {
    console.log('[Transfer] POI coords hit:', name, '→', match.coords);
    return match.coords;
  }

  const query = match.query;

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

/** Calculate transfer price using distance + duration + formula */
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

  const emptyQuote = (error: TransferQuote['error']): TransferQuote => ({
    origin, destination, category, price: 0, source: 'formula',
    distance_km: null, duration_min: null, drop_off_fee: 0,
    base_fee: 0, distance_charge: 0, time_charge: 0, minimum_fare: 0,
    error,
  });

  const cityRate = findCityRate(cityPricing, origin, destination);
  const baseFee = cityRate?.transfer_base_fee ?? config.transfer_base_fee ?? 0;
  const perKmRate = cityRate?.transfer_per_km_rate ?? config.transfer_per_km_rate ?? 0;
  const perMinRate = config.transfer_per_minute_rate ?? 0;
  const minFare = config.transfer_minimum_fare ?? 0;

  if (cityRate) {
    console.log('[Transfer] Using city-specific rate for:', cityRate.city_name, { baseFee, perKmRate });
  } else {
    console.log('[Transfer] Using global rate:', { baseFee, perKmRate, perMinRate });
  }

  if (baseFee === 0 && perKmRate === 0 && perMinRate === 0) {
    console.warn('[Transfer] No formula configured');
    return emptyQuote('no_formula');
  }

  const [originCoords, destCoords] = await Promise.all([
    preOriginCoords ? Promise.resolve(preOriginCoords) : geocodePlace(origin, country),
    preDestCoords ? Promise.resolve(preDestCoords) : geocodePlace(destination, country),
  ]);

  if (!originCoords) return emptyQuote('geocode_origin');
  if (!destCoords) return emptyQuote('geocode_destination');

  const route = await getDrivingRoute(originCoords, destCoords);
  if (!route) {
    console.warn('[Transfer] No route from any provider');
    return emptyQuote('osrm_failed');
  }

  const { distance_km: distanceKm, duration_min: durationMin } = route;

  const dropOffFee = cityRate?.drop_off_fee ?? 0;
  const isIntercity = cityRate ? !destination.toLowerCase().includes(cityRate.city_name.toLowerCase()) : false;
  const appliedDropOff = isIntercity ? dropOffFee : 0;

  const multiplier = getSeatMultiplier(config, category);
  const distanceCharge = getTieredDistanceCharge(config, distanceKm);
  const timeCharge = durationMin * perMinRate;
  const rawPrice = (baseFee + distanceCharge + timeCharge) * multiplier + appliedDropOff;
  const effectiveMinFare = minFare * multiplier;
  const price = Math.round(Math.max(rawPrice, effectiveMinFare));

  console.log('[Transfer] Formula result:', { distanceKm, durationMin, price, dropOff: appliedDropOff });

  return {
    origin, destination, category, price, source: 'formula',
    distance_km: distanceKm, duration_min: durationMin, drop_off_fee: appliedDropOff,
    base_fee: Math.round(baseFee * multiplier),
    distance_charge: Math.round(distanceCharge * multiplier),
    time_charge: Math.round(timeCharge * multiplier),
    minimum_fare: effectiveMinFare,
  };
}
