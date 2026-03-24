import { useOutletContext, useParams, Link } from 'react-router-dom';
import { Agency, StorefrontConfig, ServiceType, SERVICE_LABELS } from '@/types/agency';
import { motion } from 'framer-motion';
import { Car, UserCheck, Crown, Building, Truck, Star, ChevronLeft, Phone, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StorefrontSeo from '@/components/storefront/StorefrontSeo';
import { TemplateStyles } from '@/lib/template-styles';
import { useStorefrontVehicles } from '@/hooks/use-storefront-vehicles';
import { Skeleton } from '@/components/ui/skeleton';

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

const StorefrontServiceDetail = () => {
  const { slug, serviceType } = useParams<{ slug: string; serviceType: string }>();
  const { agency, templateStyles: ts, buttonColor, config: cfg } = useOutletContext<{ agency: Agency; templateStyles: TemplateStyles; buttonColor: string; config: StorefrontConfig }>();

  const service = serviceType as ServiceType;
  const Icon = SERVICE_ICONS[service] ?? Car;
  const heroText = SERVICE_HERO_TEXTS[service] ?? { title: SERVICE_LABELS[service] ?? service, subtitle: '' };
  const features = SERVICE_FEATURES[service] ?? [];

  const { data: vehicles = [], isLoading: vehiclesLoading } = useStorefrontVehicles(agency.id);

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

      {/* Listings from Database */}
      <section className={`py-16 ${ts.sectionAltClass}`} style={ts.sectionAltStyle}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8" style={cfg.heading_color ? { color: cfg.heading_color } : undefined}>
            {service === 'apartment' ? 'Available Apartments' : service === 'car_rental' ? 'Available Vehicles' : 'Available Packages'}
          </h2>

          {vehiclesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`p-6 rounded-2xl ${ts.cardClass}`} style={ts.cardStyle}>
                  <Skeleton className="h-40 w-full rounded-xl mb-4" />
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-12 opacity-50">
              <Icon className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No listings available at the moment. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {vehicles.map((vehicle, i) => (
                <motion.div key={vehicle.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className={`p-6 rounded-2xl transition-all ${ts.cardClass} ${ts.cardHoverClass}`} style={ts.cardStyle}>
                  {vehicle.photo_url ? (
                    <img src={vehicle.photo_url} alt={`${vehicle.brand} ${vehicle.model}`} className="h-40 w-full rounded-xl object-cover mb-4" />
                  ) : (
                    <div className="h-40 rounded-xl flex items-center justify-center opacity-10 bg-current mb-4">
                      <Icon className="h-12 w-12" />
                    </div>
                  )}
                  <h3 className="font-bold mb-1">{vehicle.brand} {vehicle.model} {vehicle.year}</h3>
                  <div className="flex items-center justify-between pt-3 border-t border-current/10 mt-3">
                    {vehicle.daily_rate ? (
                      <p className="text-lg font-bold">${vehicle.daily_rate.toLocaleString()}<span className="text-xs font-normal opacity-50"> / {service === 'apartment' ? 'night' : 'day'}</span></p>
                    ) : (
                      <p className="text-sm opacity-50">Contact for price</p>
                    )}
                    <Button size="sm" className="rounded-lg text-xs text-white" style={{ backgroundColor: buttonColor }}>
                      {cfg.cta_text || 'Book Now'}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
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
