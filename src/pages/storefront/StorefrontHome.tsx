import { useOutletContext, Link, useParams } from 'react-router-dom';
import { Agency, StorefrontConfig, ServiceType, SERVICE_LABELS } from '@/types/agency';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, Clock, Phone, Shield, Star, ChevronRight, Car, Users, Fuel, Settings2, UserCheck, Crown, Building, Truck, SlidersHorizontal, X } from 'lucide-react';
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

const SERVICE_SHORT_DESC: Record<ServiceType, string> = {
  car_rental: 'Wide selection of quality vehicles for every need.',
  private_driver: 'Professional drivers for transfers and tours.',
  limousine_services: 'Premium limousines for special occasions.',
  apartment: 'Furnished apartments for comfortable stays.',
  car_driver: 'Personal car and driver packages.',
};

const StorefrontHome = () => {
  const { slug } = useParams();
  const { agency, templateStyles: ts, buttonColor, config: cfg } = useOutletContext<{ agency: Agency; templateStyles: TemplateStyles; buttonColor: string; config: StorefrontConfig }>();

  const enabledServices = agency.services ?? [];
  const { data: vehicles = [], isLoading: vehiclesLoading } = useStorefrontVehicles(agency.id);

  // Filter state
  const PRICE_RANGES = [
    { label: '$0 - $50', min: 0, max: 50 },
    { label: '$50 - $100', min: 50, max: 100 },
    { label: '$100 - $150', min: 100, max: 150 },
    { label: '$150 - $200', min: 150, max: 200 },
    { label: '$200+', min: 200, max: Infinity },
  ];

  const [selectedPriceRanges, setSelectedPriceRanges] = useState<number[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const availableBrands = useMemo(() => [...new Set(vehicles.map(v => v.brand))].sort(), [vehicles]);
  const availableYears = useMemo(() => [...new Set(vehicles.map(v => v.year))].sort((a, b) => b - a), [vehicles]);

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
  const clearAllFilters = () => { setSelectedPriceRanges([]); setSelectedBrands([]); setSelectedYears([]); };
  const togglePriceRange = (idx: number) => setSelectedPriceRanges(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  const toggleBrand = (brand: string) => setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
  const toggleYear = (year: number) => setSelectedYears(prev => prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]);

  const FilterSidebar = ({ className = '' }: { className?: string }) => (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold">Filter</h3>
        {hasActiveFilters && (
          <button onClick={clearAllFilters} className="text-sm font-medium hover:underline" style={{ color: buttonColor }}>Clear all</button>
        )}
      </div>
      <div className="mb-6">
        <h4 className="font-semibold text-sm mb-3">Price per day</h4>
        <div className="space-y-2.5">
          {PRICE_RANGES.map((range, idx) => (
            <label key={idx} className="flex items-center gap-2.5 cursor-pointer text-sm">
              <Checkbox checked={selectedPriceRanges.includes(idx)} onCheckedChange={() => togglePriceRange(idx)} />
              {range.label}
            </label>
          ))}
        </div>
      </div>
      <div className="border-t border-current/10 my-4" />
      {availableBrands.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-sm mb-3">Brand</h4>
          <div className="space-y-2.5">
            {availableBrands.map(brand => (
              <label key={brand} className="flex items-center gap-2.5 cursor-pointer text-sm">
                <Checkbox checked={selectedBrands.includes(brand)} onCheckedChange={() => toggleBrand(brand)} />
                {brand}
              </label>
            ))}
          </div>
        </div>
      )}
      {availableBrands.length > 0 && <div className="border-t border-current/10 my-4" />}
      {availableYears.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-sm mb-3">Year</h4>
          <div className="space-y-2.5">
            {availableYears.map(year => (
              <label key={year} className="flex items-center gap-2.5 cursor-pointer text-sm">
                <Checkbox checked={selectedYears.includes(year)} onCheckedChange={() => toggleYear(year)} />
                {year}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const testimonials = [
    { name: 'Eva Hicks', text: 'Excellent service and well-maintained vehicles. The staff was incredibly helpful throughout the entire rental process.', rating: 5 },
    { name: 'Donald Wolf', text: 'Best car rental experience I\'ve ever had. Will definitely be coming back for our next trip!', rating: 5 },
    { name: 'Sarah Klein', text: 'Great selection of vehicles and transparent pricing. The booking process was seamless.', rating: 4 },
  ];

  return (
    <div>
      <StorefrontSeo
        agency={agency}
        page="home"
        fallbackTitle={agency.meta_title || `${agency.name} | ${agency.city}, ${agency.country}`}
        fallbackDescription={agency.meta_description || `Premium travel services by ${agency.name} in ${agency.city}, ${agency.country}.`}
      />

      {/* Hero Section */}
      <section className={`relative overflow-hidden ${ts.heroClass}`} style={{ ...ts.heroStyle, ...(cfg.hero_bg_color ? { backgroundColor: cfg.hero_bg_color } : {}), minHeight: '420px' }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        {(ts.heroOverlayClass || ts.heroOverlayStyle) && !cfg.hero_bg_color && <div className={`absolute inset-0 ${ts.heroOverlayClass}`} style={{ ...ts.heroOverlayStyle, opacity: 0.85 }} />}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
            <p className={`text-xs uppercase tracking-[0.25em] font-semibold mb-4 ${ts.heroSubtitleClass}`} style={{ ...ts.heroSubtitleStyle, ...(cfg.hero_subtitle_color ? { color: cfg.hero_subtitle_color } : {}) }}>
              {agency.city} - {agency.country}
            </p>
            <h1 className={`text-3xl md:text-5xl font-bold mb-4 leading-tight tracking-tight uppercase ${ts.heroTitleClass}`} style={{ ...ts.heroTitleStyle, ...(cfg.hero_text_color ? { color: cfg.hero_text_color } : {}) }}>
              {cfg.hero_title || <>Promote Mobility: Rent a Car<br />Tailored to Your Needs</>}
            </h1>
            <p className={`text-sm md:text-base max-w-xl mx-auto ${ts.heroSubtitleClass}`} style={{ ...ts.heroSubtitleStyle, ...(cfg.hero_subtitle_color ? { color: cfg.hero_subtitle_color } : {}) }}>
              {cfg.hero_subtitle || `Discover the best deals on car rentals at ${agency.name} in ${agency.city}`}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
          className={`p-5 md:p-6 ${ts.searchBarClass}`} style={ts.searchBarStyle}>
          <div className="flex items-center gap-6 mb-4">
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input type="radio" name="trip" defaultChecked className="accent-accent" /> Pick-up
            </label>
            <label className="flex items-center gap-2 text-sm font-medium opacity-60 cursor-pointer">
              <input type="radio" name="trip" className="accent-accent" /> Drop-off
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold opacity-50 uppercase tracking-wider block mb-1.5">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
                <select className="w-full h-11 rounded-lg border border-current/10 bg-current/5 pl-10 pr-4 text-sm focus:outline-none appearance-none">
                  <option>Select your city</option>
                  <option>{agency.city}</option>
                </select>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold opacity-50 uppercase tracking-wider block mb-1.5">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
                <input type="date" className="w-full h-11 rounded-lg border border-current/10 bg-current/5 pl-10 pr-4 text-sm focus:outline-none" />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold opacity-50 uppercase tracking-wider block mb-1.5">Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
                <input type="time" className="w-full h-11 rounded-lg border border-current/10 bg-current/5 pl-10 pr-4 text-sm focus:outline-none" />
              </div>
            </div>
            <div>
              <Button className="w-full h-11 rounded-lg font-semibold gap-2 text-white" style={{ backgroundColor: buttonColor }}>
                <Search className="h-4 w-4" /> Search
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12" style={cfg.heading_color ? { color: cfg.heading_color } : undefined}>Why Choose Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Phone, title: 'Customer Support', desc: 'Our dedicated team is available 24/7 to assist you with any questions or issues.' },
            { icon: Shield, title: 'Best Price Guarantee', desc: 'We guarantee the best prices on all our vehicles with no hidden fees.' },
            { icon: MapPin, title: 'Many Locations', desc: 'Pick up and drop off your vehicle at convenient locations across the region.' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`text-center p-8 rounded-2xl transition-shadow ${ts.cardClass} ${ts.cardHoverClass}`} style={ts.cardStyle}>
              <div className={`inline-flex items-center justify-center h-16 w-16 rounded-full mb-5 ${ts.iconBgClass}`} style={ts.iconBgStyle}>
                <item.icon className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-sm opacity-60 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Our Services */}
      {enabledServices.length > 0 && (
        <section className={`py-20 ${ts.sectionAltClass}`} style={ts.sectionAltStyle}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-3" style={cfg.heading_color ? { color: cfg.heading_color } : undefined}>Our Services</h2>
            <p className="text-center text-sm opacity-60 mb-10 max-w-lg mx-auto">Explore the range of services we offer to make your experience exceptional.</p>
            <div className={`grid grid-cols-1 ${enabledServices.length <= 2 ? 'md:grid-cols-2' : enabledServices.length <= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-3'} gap-6`}>
              {enabledServices.map((service, i) => {
                const Icon = SERVICE_ICONS[service] ?? Car;
                return (
                  <motion.div key={service} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                    <Link
                      to={`/agency/${slug}/services/${service}`}
                      className={`block text-center p-8 rounded-2xl transition-all group ${ts.cardClass} ${ts.cardHoverClass}`}
                      style={ts.cardStyle}
                    >
                      <div className={`inline-flex items-center justify-center h-16 w-16 rounded-full mb-5 ${ts.iconBgClass}`} style={ts.iconBgStyle}>
                        <Icon className="h-7 w-7" />
                      </div>
                      <h3 className="text-lg font-bold mb-2">{SERVICE_LABELS[service]}</h3>
                      <p className="text-sm opacity-60 leading-relaxed mb-3">{SERVICE_SHORT_DESC[service]}</p>
                      <span className="inline-flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all" style={{ color: buttonColor }}>
                        Learn More <ChevronRight className="h-4 w-4" />
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Featured Vehicle — first from database */}
      {vehicles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className={`rounded-2xl overflow-hidden ${ts.heroClass}`} style={{ ...ts.heroStyle, position: 'relative', ...(cfg.hero_bg_color ? { backgroundColor: cfg.hero_bg_color } : {}) }}>
            {(ts.heroOverlayClass || ts.heroOverlayStyle) && !cfg.hero_bg_color && <div className={`absolute inset-0 ${ts.heroOverlayClass}`} style={ts.heroOverlayStyle} />}
            <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <span className={`text-xs uppercase tracking-[0.2em] font-semibold ${ts.heroSubtitleClass}`} style={{ ...ts.heroSubtitleStyle, ...(cfg.hero_subtitle_color ? { color: cfg.hero_subtitle_color } : {}) }}>Best Offer</span>
                <h3 className={`text-2xl md:text-3xl font-bold mt-2 mb-1 ${ts.heroTitleClass}`} style={{ ...ts.heroTitleStyle, ...(cfg.hero_text_color ? { color: cfg.hero_text_color } : {}) }}>
                  {vehicles[0].brand} {vehicles[0].model} {vehicles[0].year}
                </h3>
                {vehicles[0].daily_rate && (
                  <p className="text-2xl font-bold text-accent">${vehicles[0].daily_rate.toLocaleString()} / day</p>
                )}
              </div>
              <div className="flex-1 flex items-center justify-center">
                {vehicles[0].photo_url ? (
                  <img src={vehicles[0].photo_url} alt={`${vehicles[0].brand} ${vehicles[0].model}`} className="w-80 h-48 rounded-xl object-cover" />
                ) : (
                  <div className="w-80 h-48 rounded-xl flex items-center justify-center bg-white/5">
                    <Car className="h-24 w-24 opacity-20" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Vehicle Listings from Database */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-3" style={cfg.heading_color ? { color: cfg.heading_color } : undefined}>Our Vehicles</h2>
        <p className="text-center text-sm opacity-60 mb-10 max-w-lg mx-auto">Find the perfect car for your journey with competitive prices and top-quality vehicles.</p>

        {vehiclesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`overflow-hidden ${ts.cardClass}`} style={ts.cardStyle}>
                <Skeleton className="h-44 w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-8 w-full mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-12 opacity-50">
            <Car className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No vehicles available at the moment. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {vehicles.slice(0, 8).map((vehicle, i) => (
              <motion.div key={vehicle.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
                className={`overflow-hidden transition-all group ${ts.cardClass} ${ts.cardHoverClass}`} style={ts.cardStyle}>
                {vehicle.photo_url ? (
                  <img src={vehicle.photo_url} alt={`${vehicle.brand} ${vehicle.model}`} className="h-44 w-full object-cover" />
                ) : (
                  <div className="h-44 flex items-center justify-center opacity-30">
                    <Car className="h-16 w-16" />
                  </div>
                )}
                <div className="p-4">
                  <h4 className="font-bold text-sm">{vehicle.brand} {vehicle.model} {vehicle.year}</h4>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-current/10">
                    <div>
                      {vehicle.daily_rate ? (
                        <p className="text-base font-bold">${vehicle.daily_rate.toLocaleString()} <span className="text-xs font-normal opacity-50">/ day</span></p>
                      ) : (
                        <p className="text-sm opacity-50">Contact for price</p>
                      )}
                    </div>
                    <Button size="sm" className="rounded-lg text-xs h-9 px-4 text-white" style={{ backgroundColor: buttonColor }}>
                      {cfg.cta_text || 'Book now'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link to={`/agency/${slug}/services`} className="text-sm font-medium opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1 mx-auto justify-center">
            View all services <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Blog Section */}
      <section className={`py-20 ${ts.sectionAltClass}`} style={ts.sectionAltStyle}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3" style={cfg.heading_color ? { color: cfg.heading_color } : undefined}>Blog</h2>
          <p className="text-center text-sm opacity-60 mb-10 max-w-lg mx-auto">
            Discover the latest news and useful articles about car rental and travel tips
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((_, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className={`overflow-hidden transition-all ${ts.cardClass} ${ts.cardHoverClass}`} style={ts.cardStyle}>
                <div className="h-48 opacity-10 bg-current" />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase">Blog Title</span>
                    <span className="text-[10px] text-accent font-medium uppercase">Category</span>
                  </div>
                  <p className="text-xs opacity-50 mb-2">Author · a min ago</p>
                  <p className="text-sm opacity-60 leading-relaxed">
                    Discover useful tips and insights about car rental, travel, and getting the most from your journey.
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button className="text-sm font-medium text-accent hover:opacity-80 transition-opacity">More →</button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-3" style={cfg.heading_color ? { color: cfg.heading_color } : undefined}>Trusted by Thousands of Happy Customers</h2>
        <p className="text-center text-sm opacity-60 mb-12 max-w-lg mx-auto">
          Our customers' opinions help us improve your experience and offer the best services
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className={`p-6 rounded-2xl border ${i === 1 ? ts.testimonialHighlightClass : ts.testimonialNormalClass}`} style={i === 1 ? ts.testimonialHighlightStyle : ts.testimonialNormalStyle}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold ${i === 1 ? 'bg-white/20' : 'opacity-30 bg-current'}`}>
                  {t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <div className="flex gap-0.5 mt-0.5">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} className="h-3 w-3 fill-accent text-accent" />
                    ))}
                  </div>
                </div>
              </div>
              <p className={`text-sm leading-relaxed ${i === 1 ? 'opacity-80' : 'opacity-60'}`}>{t.text}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default StorefrontHome;
