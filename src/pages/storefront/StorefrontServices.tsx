import { useOutletContext, Link, useParams } from 'react-router-dom';
import { Agency, StorefrontConfig, ServiceType, SERVICE_LABELS } from '@/types/agency';
import { motion } from 'framer-motion';
import { Car, UserCheck, Crown, Building, Star, ChevronRight, Check } from 'lucide-react';
import StorefrontSeo from '@/components/storefront/StorefrontSeo';
import { TemplateStyles } from '@/lib/template-styles';
import { Button } from '@/components/ui/button';

import serviceTransfer from '@/assets/service-transfer.jpg';
import serviceLimo from '@/assets/service-limo.jpg';
import serviceRental from '@/assets/service-rental.jpg';
import serviceApartment from '@/assets/service-apartment.jpg';
import serviceCityTour from '@/assets/service-city-tour.jpg';

const SERVICE_ICONS: Record<ServiceType, React.ElementType> = {
  car_rental: Car,
  apartment: Building,
  transfer: UserCheck,
  limo_tour: Crown,
  city_tour: Star,
};

const SERVICE_IMAGES: Record<ServiceType, string> = {
  transfer: serviceTransfer,
  limo_tour: serviceLimo,
  car_rental: serviceRental,
  apartment: serviceApartment,
  city_tour: serviceCityTour,
};

const SERVICE_DESCRIPTIONS: Record<ServiceType, string> = {
  car_rental: 'Browse our curated fleet of vehicles — from economy to luxury SUVs — ready for your next adventure.',
  apartment: 'Comfortable furnished apartments for short and long-term stays, conveniently located near key destinations.',
  transfer: 'Professional drivers for airport transfers, hotel pickups, and seamless point-to-point rides.',
  limo_tour: 'Multi-day luxury chauffeured tours across cities and countries — your journey, your pace.',
  city_tour: 'Guided city tours with knowledgeable drivers covering the best landmarks and hidden gems.',
};

const SERVICE_FEATURES: Record<ServiceType, string[]> = {
  car_rental: ['Wide selection of vehicles', 'Full insurance included', 'Free cancellation up to 24h', 'Unlimited mileage options'],
  apartment: ['Fully furnished', 'Central locations', 'Weekly & monthly rates', 'Self check-in'],
  transfer: ['Professional chauffeurs', 'Flight tracking', 'Meet & greet service', 'Fixed prices'],
  limo_tour: ['Luxury vehicles', 'Hourly & point-to-point', 'Airport & event service', 'Multilingual drivers'],
  city_tour: ['Expert local guides', 'Half-day & full-day', 'Popular landmarks', 'Flexible schedules'],
};

const StorefrontServices = () => {
  const { slug } = useParams();
  const { agency, templateStyles: ts, buttonColor, config: cfg } = useOutletContext<{ agency: Agency; templateStyles: TemplateStyles; buttonColor: string; config: StorefrontConfig }>();

  const enabledServices = agency.services ?? [];

  return (
    <div>
      <StorefrontSeo
        agency={agency}
        page="fleet"
        fallbackTitle={`Our Services | ${agency.name}`}
        fallbackDescription={`Explore the services offered by ${agency.name} in ${agency.city}, ${agency.country}.`}
      />

      {/* Hero header */}
      <section className="relative overflow-hidden bg-gray-900" style={{ minHeight: '280px' }}>
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/95 to-gray-900/80" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {cfg.services_title || 'Our Services'}
            </h1>
            <p className="text-white/50 max-w-2xl mx-auto text-base">
              {cfg.services_subtitle || `Discover our range of premium services tailored to your needs in ${agency.city}.`}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Service cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {enabledServices.length === 0 ? (
          <p className="text-center text-gray-500">No services configured yet.</p>
        ) : (
          <div className="space-y-8">
            {enabledServices.map((service, i) => {
              const Icon = SERVICE_ICONS[service] ?? Car;
              const label = SERVICE_LABELS[service] ?? service;
              const customDesc = cfg.service_descriptions?.[service];
              const desc = customDesc || SERVICE_DESCRIPTIONS[service] || 'Explore this service.';
              const image = SERVICE_IMAGES[service];
              const features = SERVICE_FEATURES[service] ?? [];
              const isReversed = i % 2 === 1;

              return (
                <motion.div
                  key={service}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className={`flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-stretch bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300`}
                >
                  {/* Image side */}
                  <div className="md:w-1/2 relative overflow-hidden">
                    <img
                      src={image}
                      alt={label}
                      className="w-full h-64 md:h-full object-cover transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                      width={960}
                      height={640}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent md:hidden" />
                  </div>

                  {/* Content side */}
                  <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-gray-100">
                        <Icon className="h-5 w-5 text-gray-700" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">{label}</h2>
                    </div>
                    <p className="text-gray-500 leading-relaxed mb-6">{desc}</p>

                    {/* Features */}
                    <ul className="space-y-2.5 mb-8">
                      {features.map((feat, fi) => (
                        <li key={fi} className="flex items-center gap-3 text-sm text-gray-700">
                          <span className="h-5 w-5 rounded-full flex items-center justify-center text-white text-xs shrink-0" style={{ backgroundColor: buttonColor }}>
                            <Check className="h-3 w-3" />
                          </span>
                          {feat}
                        </li>
                      ))}
                    </ul>

                    <Link to={`/agency/${slug}/services/${service}`}>
                      <Button className="rounded-xl font-semibold gap-2 text-white px-6 h-11" style={{ backgroundColor: buttonColor }}>
                        Explore {label} <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default StorefrontServices;
