import { TransferRoute, TransferCategory } from '@/hooks/use-service-pricing';
import { StorefrontConfig } from '@/types/agency';

export interface TransferQuote {
  origin: string;
  destination: string;
  category: TransferCategory;
  price: number;
  source: 'matrix' | 'formula';
  distance_km: number | null;
}

const CATEGORY_PRICE_KEY: Record<TransferCategory, keyof TransferRoute> = {
  economy: 'price_economy',
  business: 'price_business',
  first_class: 'price_first_class',
  van: 'price_van',
};

/** Look up a fixed price from the route matrix (bidirectional) */
export function getMatrixPrice(
  routes: TransferRoute[],
  origin: string,
  destination: string,
  category: TransferCategory
): number | null {
  const route = routes.find(
    (r) =>
      (r.origin === origin && r.destination === destination) ||
      (r.origin === destination && r.destination === origin)
  );
  if (!route) return null;
  return route[CATEGORY_PRICE_KEY[category]] as number;
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
  originCoords: [number, number], // [lng, lat]
  destCoords: [number, number]
): Promise<number | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${originCoords[0]},${originCoords[1]};${destCoords[0]},${destCoords[1]}?overview=false`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes?.[0]) return null;
    return Math.round(data.routes[0].distance / 1000); // meters → km
  } catch {
    return null;
  }
}

/** Geocode a place name using Photon (free) and return [lng, lat] */
export async function geocodePlace(name: string, country?: string): Promise<[number, number] | null> {
  try {
    let url = `https://photon.komoot.io/api/?q=${encodeURIComponent(name)}&limit=1`;
    if (country) {
      // Photon uses ISO country codes — attempt a simple mapping isn't reliable
      // but the name itself usually disambiguates
    }
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const feature = data.features?.[0];
    if (!feature) return null;
    const [lng, lat] = feature.geometry.coordinates;
    return [lng, lat];
  } catch {
    return null;
  }
}

/** Full hybrid pricing: matrix first, then OSRM formula fallback */
export async function calculateTransferPrice(
  routes: TransferRoute[],
  config: StorefrontConfig,
  origin: string,
  destination: string,
  category: TransferCategory,
  country?: string
): Promise<TransferQuote> {
  // 1. Check matrix
  const matrixPrice = getMatrixPrice(routes, origin, destination, category);
  if (matrixPrice !== null) {
    return { origin, destination, category, price: matrixPrice, source: 'matrix', distance_km: null };
  }

  // 2. Fallback: OSRM distance + formula
  const baseFee = config.transfer_base_fee ?? 0;
  const perKmRate = config.transfer_per_km_rate ?? 0;
  if (baseFee === 0 && perKmRate === 0) {
    // No formula configured — return 0
    return { origin, destination, category, price: 0, source: 'formula', distance_km: null };
  }

  const [originCoords, destCoords] = await Promise.all([
    geocodePlace(origin, country),
    geocodePlace(destination, country),
  ]);

  if (!originCoords || !destCoords) {
    return { origin, destination, category, price: 0, source: 'formula', distance_km: null };
  }

  const distanceKm = await getOsrmDistance(originCoords, destCoords);
  if (!distanceKm) {
    return { origin, destination, category, price: 0, source: 'formula', distance_km: null };
  }

  const price = getFormulaPrice(config, distanceKm, category);
  return { origin, destination, category, price, source: 'formula', distance_km: distanceKm };
}
