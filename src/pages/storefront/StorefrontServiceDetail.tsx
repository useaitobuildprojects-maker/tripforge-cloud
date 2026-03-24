import { useOutletContext, useParams, Link } from 'react-router-dom';
import { Agency, StorefrontConfig, ServiceType, SERVICE_LABELS } from '@/types/agency';
import { motion } from 'framer-motion';
import { Car, UserCheck, Crown, Building, Truck, ChevronLeft, Phone, CheckCircle2, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import StorefrontSeo from '@/components/storefront/StorefrontSeo';
import { TemplateStyles } from '@/lib/template-styles';
import { useStorefrontVehicles } from '@/hooks/use-storefront-vehicles';
import { Skeleton } from '@/components/ui/skeleton';
import { useState, useMemo } from 'react';

const SERVICE_ICONS: Record<ServiceType, React.ElementType> = {
  car_rental: Car,
  private_driver: UserCheck,
  limousine_services: Crown,
  apartment: Building,
  car_driver: Truck,
};

const SERVICE_HERO_TEXTS: Record<ServiceType, { title: string; subtitle: string }> = {
  car_rental: { title: 'Car Rental', subtitle: 'Find the perfect car for your journey with competitive prices and top-quality vehicles.' },
  private_driver: { title: 'Private Driver', subtitle: 'Professional chauffeurs for airport transfers, business trips, and city tours.' },
  limousine_services: { title: 'Limousine Services', subtitle: 'Travel in luxury with our premium limousine fleet for any occasion.' },
  apartment: { title: 'Apartments', subtitle: 'Comfortable furnished apartments for short and long-term stays.' },
  car_driver: { title: 'Car & Driver', subtitle: 'Enjoy the freedom of a personal vehicle with an expert local driver.' },
};

const SERVICE_FEATURES: Record<ServiceType, string[]> = {
  car_rental: ['Wide selection of vehicles', 'Flexible pick-up & drop-off', 'Full insurance included', '24/7 roadside assistance', 'No hidden fees'],
  private_driver: ['Professional licensed drivers', 'Punctual & reliable', 'Airport transfers', 'Hourly or daily booking', 'Multilingual drivers available'],
  limousine_services: ['Luxury fleet', 'Red carpet service', 'Wedding & event transport', 'VIP airport transfers', 'Corporate accounts'],
  apartment: ['Fully furnished', 'Central locations', 'Short & long term stays', 'All utilities included', 'Cleaning service available'],
  car_driver: ['Personal vehicle & driver', 'City tours', 'Intercity travel', 'Flexible scheduling', 'Local expertise'],
};

const PRICE_RANGES = [
  { label: '$0 - $50', min: 0, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: '$100 - $150', min: 100, max: 150 },
  { label: '$150 - $200', min: 150, max: 200 },
  { label: '$200+', min: 200, max: Infinity },
];

const StorefrontServiceDetail = () => {
  const { slug, serviceType } = useParams<{ slug: string; serviceType: string }>();
  const { agency, templateStyles: ts, buttonColor, config: cfg } = useOutletContext<{ agency: Agency; templateStyles: TemplateStyles; buttonColor: string; config: StorefrontConfig }>();

  const service = serviceType as ServiceType;
  const Icon = SERVICE_ICONS[service] ?? Car;
  const heroText = SERVICE_HERO_TEXTS[service] ?? { title: SERVICE_LABELS[service] ?? service, subtitle: '' };
  const features = SERVICE_FEATURES[service] ?? [];

  const { data: vehicles = [], isLoading: vehiclesLoading } = useStorefrontVehicles(agency.id);

  // Filter state
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<number[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Derive unique brands and years from data
  const availableBrands = useMemo(() => [...new Set(vehicles.map(v => v.brand))].sort(), [vehicles]);
  const availableYears = useMemo(() => [...new Set(vehicles.map(v => v.year))].sort((a, b) => b - a), [vehicles]);

  // Apply filters
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      if (selectedBrands.length > 0 && !selectedBrands.includes(v.brand)) return false;
      if (selectedYears.length > 0 && !selectedYears.includes(v.year)) return false;
      if (selectedPriceRanges.length > 0) {
        const price = v.daily_rate ?? 0;
        const inRange = selectedPriceRanges.some(idx => {
          const range = PRICE_RANGES[idx];
          return price >= range.min && price < range.max;
        });
        if (!inRange) return false;
      }
      return true;
    });
  }, [vehicles, selectedBrands, selectedYears, selectedPriceRanges]);

  const hasActiveFilters = selectedPriceRanges.length > 0 || selectedBrands.length > 0 || selectedYears.length > 0;

  const clearAllFilters = () => {
    setSelectedPriceRanges([]);
    setSelectedBrands([]);
    setSelectedYears([]);
  };

  const togglePriceRange = (idx: number) => {
    setSelectedPriceRanges(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };
  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
  };
  const toggleYear = (year: number) => {
    setSelectedYears(prev => prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]);
  };

  // Check if service is enabled
  if (!agency.services?.includes(service)) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-2">Service Not Available</h1>
        <p className="opacity-60 mb-6">This service is not currently offered.</p>
        <Link to={`/agency/${slug}/services`} className="text-sm font-medium" style={{ color: buttonColor }}>
          ← Back to Services
        </Link>
      </div>
    );
  }

  const FilterSidebar = ({ className = '' }: { className?: string }) => (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">Filter</h3>
        {hasActiveFilters && (
          <button onClick={clearAllFilters} className="text-sm font-medium hover:underline" style={{ color: buttonColor }}>
            Clear all filters
          </button>
        )}
      </div>

      {/* Price per day */}
      <div className="mb-6">
        <h4 className="font-semibold text-sm mb-3">Price per day</h4>
        <div className="space-y-2.5">
          {PRICE_RANGES.map((range, idx) => (
            <label key={idx} className="flex items-center gap-2.5 cursor-pointer text-sm">
              <Checkbox
                checked={selectedPriceRanges.includes(idx)}
                onCheckedChange={() => togglePriceRange(idx)}
              />
              {range.label}
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-current/10 my-4" />

      {/* Brand */}
      {availableBrands.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-sm mb-3">Brand</h4>
          <div className="space-y-2.5">
            {availableBrands.map(brand => (
              <label key={brand} className="flex items-center gap-2.5 cursor-pointer text-sm">
                <Checkbox
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={() => toggleBrand(brand)}
                />
                {brand}
              </label>
            ))}
          </div>
        </div>
      )}

      {availableBrands.length > 0 && <div className="border-t border-current/10 my-4" />}

      {/* Year */}
      {availableYears.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-sm mb-3">Year</h4>
          <div className="space-y-2.5">
            {availableYears.map(year => (
              <label key={year} className="flex items-center gap-2.5 cursor-pointer text-sm">
                <Checkbox
                  checked={selectedYears.includes(year)}
                  onCheckedChange={() => toggleYear(year)}
                />
                {year}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div>
      <StorefrontSeo
        agency={agency}
        page="fleet"
        fallbackTitle={`${heroText.title} | ${agency.name}`}
        fallbackDescription={heroText.subtitle}
      />

      {/* Hero */}
      <section className={`relative overflow-hidden ${ts.heroClass}`} style={{ ...ts.heroStyle, ...(cfg.hero_bg_color ? { backgroundColor: cfg.hero_bg_color } : {}) }}>
        {(ts.heroOverlayClass || ts.heroOverlayStyle) && !cfg.hero_bg_color && <div className={`absolute inset-0 ${ts.heroOverlayClass}`} style={ts.heroOverlayStyle} />}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link to={`/agency/${slug}/services`} className={`inline-flex items-center gap-1 text-sm mb-4 opacity-70 hover:opacity-100 transition-opacity ${ts.heroSubtitleClass}`} style={ts.heroSubtitleStyle}>
              <ChevronLeft className="h-4 w-4" /> All Services
            </Link>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-14 w-14 rounded-2xl flex items-center justify-center bg-white/10">
                <Icon className="h-7 w-7" style={{ ...(cfg.hero_text_color ? { color: cfg.hero_text_color } : ts.heroTitleStyle) }} />
              </div>
              <h1 className={`text-3xl md:text-4xl font-bold ${ts.heroTitleClass}`} style={{ ...ts.heroTitleStyle, ...(cfg.hero_text_color ? { color: cfg.hero_text_color } : {}) }}>
                {heroText.title}
              </h1>
            </div>
            <p className={`text-sm md:text-base max-w-xl ${ts.heroSubtitleClass}`} style={{ ...ts.heroSubtitleStyle, ...(cfg.hero_subtitle_color ? { color: cfg.hero_subtitle_color } : {}) }}>
              {heroText.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold mb-8" style={cfg.heading_color ? { color: cfg.heading_color } : undefined}>What's Included</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3 p-4 rounded-xl" style={ts.cardStyle}>
              <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: buttonColor }} />
              <span className="text-sm font-medium">{f}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Listings with Filter Sidebar */}
      <section className={`py-16 ${ts.sectionAltClass}`} style={ts.sectionAltStyle}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold" style={cfg.heading_color ? { color: cfg.heading_color } : undefined}>
              {service === 'apartment' ? 'Available Apartments' : service === 'car_rental' ? 'Choose Your Vehicle' : 'Available Packages'}
            </h2>
            {/* Mobile filter toggle */}
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden gap-2"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filter
              {hasActiveFilters && (
                <span className="ml-1 h-5 w-5 rounded-full text-xs flex items-center justify-center text-white" style={{ backgroundColor: buttonColor }}>
                  {selectedPriceRanges.length + selectedBrands.length + selectedYears.length}
                </span>
              )}
            </Button>
          </div>

          <div className="flex gap-8">
            {/* Desktop sidebar */}
            <FilterSidebar className="hidden lg:block w-64 shrink-0 sticky top-4 self-start" />

            {/* Mobile filter drawer */}
            {mobileFiltersOpen && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
                <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-background p-6 overflow-y-auto shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-lg">Filters</span>
                    <button onClick={() => setMobileFiltersOpen(false)}><X className="h-5 w-5" /></button>
                  </div>
                  <FilterSidebar />
                </div>
              </div>
            )}

            {/* Vehicle grid */}
            <div className="flex-1 min-w-0">
              {vehiclesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="rounded-xl border border-current/10 overflow-hidden" style={ts.cardStyle}>
                      <Skeleton className="h-44 w-full" />
                      <div className="p-5">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-4" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredVehicles.length === 0 ? (
                <div className="text-center py-16 opacity-50">
                  <Icon className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">
                    {hasActiveFilters ? 'No vehicles match your filters. Try adjusting your criteria.' : 'No listings available at the moment. Check back soon!'}
                  </p>
                  {hasActiveFilters && (
                    <button onClick={clearAllFilters} className="mt-3 text-sm font-medium underline" style={{ color: buttonColor }}>
                      Clear all filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-sm opacity-50 mb-4">{filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? 's' : ''} found</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredVehicles.map((vehicle, i) => (
                      <motion.div key={vehicle.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="rounded-xl border border-current/10 overflow-hidden transition-shadow hover:shadow-lg" style={ts.cardStyle}>
                        {vehicle.photo_url ? (
                          <img src={vehicle.photo_url} alt={`${vehicle.brand} ${vehicle.model}`} className="h-44 w-full object-cover" />
                        ) : (
                          <div className="h-44 flex items-center justify-center opacity-10 bg-current">
                            <Icon className="h-14 w-14" />
                          </div>
                        )}
                        <div className="p-5">
                          <h3 className="font-bold text-lg">{vehicle.brand} {vehicle.model}</h3>
                          <p className="text-xs opacity-50 mb-4">{vehicle.year}</p>

                          <div className="flex items-center justify-between pt-3 border-t border-current/10">
                            {vehicle.daily_rate ? (
                              <div>
                                <p className="text-lg font-bold">${vehicle.daily_rate.toLocaleString()}<span className="text-xs font-normal opacity-50"> / {service === 'apartment' ? 'night' : 'day'}</span></p>
                              </div>
                            ) : (
                              <p className="text-sm opacity-50">Contact for price</p>
                            )}
                            <Button size="sm" variant="outline" className="rounded-lg text-sm font-semibold border-2 hover:text-white" style={{ borderColor: buttonColor, color: buttonColor }} onMouseEnter={e => { (e.target as HTMLElement).style.backgroundColor = buttonColor; }} onMouseLeave={e => { (e.target as HTMLElement).style.backgroundColor = 'transparent'; }}>
                              {cfg.cta_text || 'Book Now'}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold mb-3" style={cfg.heading_color ? { color: cfg.heading_color } : undefined}>Ready to Book?</h2>
        <p className="opacity-60 mb-6 max-w-md mx-auto text-sm">Contact us to learn more or make a reservation today.</p>
        <div className="flex items-center justify-center gap-4">
          <Link to={`/agency/${slug}/contact`}>
            <Button className="rounded-lg text-white gap-2" style={{ backgroundColor: buttonColor }}>
              <Phone className="h-4 w-4" /> Contact Us
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default StorefrontServiceDetail;
