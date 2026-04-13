import { useOutletContext, Link, useParams } from 'react-router-dom';
import { Agency, StorefrontConfig, ServiceType, SERVICE_LABELS } from '@/types/agency';
import { motion } from 'framer-motion';
import { Car, UserCheck, Crown, Building, Globe, Check, ArrowRight } from 'lucide-react';
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
  city_tour: Globe,
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
    <div className="bg-white">
      <StorefrontSeo
        agency={agency}
        page="fleet"
        fallbackTitle={`Our Services | ${agency.name}`}
        fallbackDescription={`Explore the services offered by ${agency.name} in ${agency.city}, ${agency.country}.`}
      />

      {/* Hero */}
      <section className="bg-black py-20 lg:py-28">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-5">
              {cfg.services_title || 'Our Services'}
            </h1>
            <p className="text-white/40 text-base leading-relaxed">
              {cfg.services_subtitle || `Premium travel services designed around your comfort and convenience in ${agency.city}.`}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services grid — Uber card style */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {enabledServices.length === 0 ? (
          <p className="text-center text-gray-400 py-20">No services configured yet.</p>
        ) : (
          <div className="space-y-5">
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
                  id={`service-${service}`}
                  key={service}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5 }}
                  className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300`}
                >
                  {/* Image */}
                  <div className="lg:w-1/2 relative overflow-hidden group">
                    <img src={image} alt={label} className="w-full h-64 lg:h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  </div>

                  {/* Content */}
                  <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-lg bg-black flex items-center justify-center">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h2 className="text-xl lg:text-2xl font-bold text-black tracking-tight">{label}</h2>
                    </div>
                    <p className="text-gray-500 leading-relaxed mb-6">{desc}</p>

                    <div className="grid grid-cols-2 gap-2.5 mb-8">
                      {features.map((feat, fi) => (
                        <div key={fi} className="flex items-center gap-2 text-sm text-gray-600">
                          <Check className="h-4 w-4 text-black shrink-0" />
                          {feat}
                        </div>
                      ))}
                    </div>

                    <Link to={`/agency/${slug}/services/${service}`}>
                      <Button className="rounded-lg font-semibold gap-2 text-white px-8 h-11 text-sm bg-black hover:bg-gray-800">
                        Explore {label} <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-black py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Ready to start your journey?</h2>
            <p className="text-white/40 mb-8 max-w-lg mx-auto">Book any of our services with confidence. Professional support and unforgettable experiences await.</p>
            <Link to={`/agency/${slug}/contact`}>
              <Button className="rounded-lg font-semibold gap-2 bg-white text-black px-10 h-12 text-sm hover:bg-gray-100">
                Contact Us <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default StorefrontServices;
