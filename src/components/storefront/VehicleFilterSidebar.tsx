import { Checkbox } from '@/components/ui/checkbox';
import { MarketplaceVehicle } from '@/hooks/use-marketplace-vehicles';
import { useMemo } from 'react';

export const PRICE_RANGES = [
  { label: '$0 - $50', min: 0, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: '$100 - $150', min: 100, max: 150 },
  { label: '$150 - $200', min: 150, max: 200 },
  { label: '$200+', min: 200, max: Infinity },
];

const CATEGORY_LABELS: Record<string, string> = {
  sedan: 'Sedan',
  suv: 'SUV',
  hatchback: 'Hatchback',
  coupe: 'Coupe',
  convertible: 'Convertible',
  minivan: 'Minivan',
  pickup: 'Pickup Truck',
  luxury: 'Luxury',
  sports: 'Sports',
  electric: 'Electric',
};

const TRANSMISSION_LABELS: Record<string, string> = {
  manual: 'Manual',
  automatic: 'Automatic',
};

const FUEL_LABELS: Record<string, string> = {
  gasoline: 'Gasoline',
  diesel: 'Diesel',
  electric: 'Electric',
  hybrid: 'Hybrid',
  lpg: 'LPG',
};

const MILEAGE_LABELS: Record<string, string> = {
  unlimited: 'Unlimited',
  limited: 'Limited',
};

export interface VehicleFilters {
  priceRanges: number[];
  brands: string[];
  years: number[];
  categories: string[];
  transmissions: string[];
  fuelTypes: string[];
  seatCounts: number[];
  airConditioning: boolean | null;
  mileagePolicies: string[];
}

export const emptyFilters: VehicleFilters = {
  priceRanges: [],
  brands: [],
  years: [],
  categories: [],
  transmissions: [],
  fuelTypes: [],
  seatCounts: [],
  airConditioning: null,
  mileagePolicies: [],
};

export const hasAnyFilter = (f: VehicleFilters) =>
  f.priceRanges.length > 0 || f.brands.length > 0 || f.years.length > 0 ||
  f.categories.length > 0 || f.transmissions.length > 0 || f.fuelTypes.length > 0 ||
  f.seatCounts.length > 0 || f.airConditioning !== null || f.mileagePolicies.length > 0;

export const countActiveFilters = (f: VehicleFilters) =>
  f.priceRanges.length + f.brands.length + f.years.length +
  f.categories.length + f.transmissions.length + f.fuelTypes.length +
  f.seatCounts.length + (f.airConditioning !== null ? 1 : 0) + f.mileagePolicies.length;

export const applyFilters = (vehicles: MarketplaceVehicle[], f: VehicleFilters) => {
  return vehicles.filter(v => {
    if (f.brands.length > 0 && !f.brands.includes(v.brand)) return false;
    if (f.years.length > 0 && !f.years.includes(v.year)) return false;
    if (f.categories.length > 0 && !f.categories.includes(v.category ?? '')) return false;
    if (f.transmissions.length > 0 && !f.transmissions.includes(v.transmission ?? '')) return false;
    if (f.fuelTypes.length > 0 && !f.fuelTypes.includes(v.fuel_type ?? '')) return false;
    if (f.seatCounts.length > 0 && !f.seatCounts.includes(v.seats ?? 0)) return false;
    if (f.airConditioning !== null && v.air_conditioning !== f.airConditioning) return false;
    if (f.mileagePolicies.length > 0 && !f.mileagePolicies.includes(v.mileage_policy ?? '')) return false;
    if (f.priceRanges.length > 0) {
      const price = v.daily_rate ?? 0;
      const inRange = f.priceRanges.some(idx => {
        const range = PRICE_RANGES[idx];
        return price >= range.min && price < range.max;
      });
      if (!inRange) return false;
    }
    return true;
  });
};

interface Props {
  vehicles: MarketplaceVehicle[];
  filters: VehicleFilters;
  onChange: (filters: VehicleFilters) => void;
  buttonColor: string;
  className?: string;
}

const toggle = <T,>(arr: T[], val: T) => arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-5">
    <h4 className="font-semibold text-sm mb-3">{title}</h4>
    <div className="space-y-2.5">{children}</div>
  </div>
);

const FilterCheck = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) => (
  <label className="flex items-center gap-2.5 cursor-pointer text-sm">
    <Checkbox checked={checked} onCheckedChange={onChange} />
    {label}
  </label>
);

const VehicleFilterSidebar = ({ vehicles, filters, onChange, buttonColor, className = '' }: Props) => {
  const f = filters;
  const set = (patch: Partial<VehicleFilters>) => onChange({ ...f, ...patch });

  const availableBrands = useMemo(() => [...new Set(vehicles.map(v => v.brand))].sort(), [vehicles]);
  const availableYears = useMemo(() => [...new Set(vehicles.map(v => v.year))].sort((a, b) => b - a), [vehicles]);
  const availableCategories = useMemo(() => [...new Set(vehicles.map(v => v.category).filter(Boolean) as string[])].sort(), [vehicles]);
  const availableTransmissions = useMemo(() => [...new Set(vehicles.map(v => v.transmission).filter(Boolean) as string[])].sort(), [vehicles]);
  const availableFuelTypes = useMemo(() => [...new Set(vehicles.map(v => v.fuel_type).filter(Boolean) as string[])].sort(), [vehicles]);
  const availableSeats = useMemo(() => [...new Set(vehicles.map(v => v.seats).filter(Boolean) as number[])].sort((a, b) => a - b), [vehicles]);
  const availableMileage = useMemo(() => [...new Set(vehicles.map(v => v.mileage_policy).filter(Boolean) as string[])].sort(), [vehicles]);
  const hasAC = useMemo(() => vehicles.some(v => v.air_conditioning === true), [vehicles]);
  const hasNoAC = useMemo(() => vehicles.some(v => v.air_conditioning === false), [vehicles]);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">Filter</h3>
        {hasAnyFilter(f) && (
          <button onClick={() => onChange(emptyFilters)} className="text-sm font-medium hover:underline" style={{ color: buttonColor }}>
            Clear all
          </button>
        )}
      </div>

      {/* Price */}
      <FilterSection title="Price per day">
        {PRICE_RANGES.map((range, idx) => (
          <FilterCheck key={idx} label={range.label} checked={f.priceRanges.includes(idx)} onChange={() => set({ priceRanges: toggle(f.priceRanges, idx) })} />
        ))}
      </FilterSection>
      <div className="border-t border-current/10 my-4" />

      {/* Category */}
      {availableCategories.length > 0 && (
        <>
          <FilterSection title="Vehicle Type">
            {availableCategories.map(cat => (
              <FilterCheck key={cat} label={CATEGORY_LABELS[cat] ?? cat} checked={f.categories.includes(cat)} onChange={() => set({ categories: toggle(f.categories, cat) })} />
            ))}
          </FilterSection>
          <div className="border-t border-current/10 my-4" />
        </>
      )}

      {/* Brand */}
      {availableBrands.length > 0 && (
        <>
          <FilterSection title="Brand">
            {availableBrands.map(brand => (
              <FilterCheck key={brand} label={brand} checked={f.brands.includes(brand)} onChange={() => set({ brands: toggle(f.brands, brand) })} />
            ))}
          </FilterSection>
          <div className="border-t border-current/10 my-4" />
        </>
      )}

      {/* Transmission */}
      {availableTransmissions.length > 0 && (
        <>
          <FilterSection title="Transmission">
            {availableTransmissions.map(t => (
              <FilterCheck key={t} label={TRANSMISSION_LABELS[t] ?? t} checked={f.transmissions.includes(t)} onChange={() => set({ transmissions: toggle(f.transmissions, t) })} />
            ))}
          </FilterSection>
          <div className="border-t border-current/10 my-4" />
        </>
      )}

      {/* Fuel Type */}
      {availableFuelTypes.length > 0 && (
        <>
          <FilterSection title="Fuel Type">
            {availableFuelTypes.map(ft => (
              <FilterCheck key={ft} label={FUEL_LABELS[ft] ?? ft} checked={f.fuelTypes.includes(ft)} onChange={() => set({ fuelTypes: toggle(f.fuelTypes, ft) })} />
            ))}
          </FilterSection>
          <div className="border-t border-current/10 my-4" />
        </>
      )}

      {/* Seats */}
      {availableSeats.length > 0 && (
        <>
          <FilterSection title="Seats">
            {availableSeats.map(s => (
              <FilterCheck key={s} label={`${s} seats`} checked={f.seatCounts.includes(s)} onChange={() => set({ seatCounts: toggle(f.seatCounts, s) })} />
            ))}
          </FilterSection>
          <div className="border-t border-current/10 my-4" />
        </>
      )}

      {/* Air Conditioning */}
      {(hasAC || hasNoAC) && (
        <>
          <FilterSection title="Air Conditioning">
            {hasAC && <FilterCheck label="With A/C" checked={f.airConditioning === true} onChange={() => set({ airConditioning: f.airConditioning === true ? null : true })} />}
            {hasNoAC && <FilterCheck label="Without A/C" checked={f.airConditioning === false} onChange={() => set({ airConditioning: f.airConditioning === false ? null : false })} />}
          </FilterSection>
          <div className="border-t border-current/10 my-4" />
        </>
      )}

      {/* Mileage Policy */}
      {availableMileage.length > 0 && (
        <FilterSection title="Mileage">
          {availableMileage.map(m => (
            <FilterCheck key={m} label={MILEAGE_LABELS[m] ?? m} checked={f.mileagePolicies.includes(m)} onChange={() => set({ mileagePolicies: toggle(f.mileagePolicies, m) })} />
          ))}
        </FilterSection>
      )}

      {/* Year */}
      {availableYears.length > 0 && (
        <>
          <div className="border-t border-current/10 my-4" />
          <FilterSection title="Year">
            {availableYears.map(year => (
              <FilterCheck key={year} label={String(year)} checked={f.years.includes(year)} onChange={() => set({ years: toggle(f.years, year) })} />
            ))}
          </FilterSection>
        </>
      )}
    </div>
  );
};

export default VehicleFilterSidebar;
