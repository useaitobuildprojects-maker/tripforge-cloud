import { useOutletContext, Link, useParams } from 'react-router-dom';
import { Agency, StorefrontConfig, ServiceType, SERVICE_LABELS } from '@/types/agency';
import { motion } from 'framer-motion';
import { Car, UserCheck, Crown, Building, Star, ChevronRight, Check, ArrowRight, Globe } from 'lucide-react';
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

const serifFont = { fontFamily: "'Georgia', 'Times New Roman', serif" };

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
      <section className="relative bg-gray-950 overflow-hidden" style={{ minHeight: '340px' }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.05)_0%,_transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center" style={{ minHeight: '340px' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-4" style={{ color: buttonColor }}>What We Offer</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5" style={serifFont}>
              {cfg.services_title || 'Our Services'}
            </h1>
            <p className="text-white/40 max-w-xl mx-auto text-base leading-relaxed">
              {cfg.services_subtitle || `Premium travel services designed around your comfort and convenience in ${agency.city}.`}
            </p>
          </motion.div>
        </div>
        {/* Decorative bottom curve */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full"><path d="M0 60V30C360 0 720 0 1080 30C1260 45 1350 52 1440 60H0Z" fill="white"/></svg>
        </div>
      </section>

      {/* Services overview grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {enabledServices.length > 1 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-16">
            {enabledServices.map((service, i) => {
              const Icon = SERVICE_ICONS[service] ?? Car;
              const label = SERVICE_LABELS[service] ?? service;
              return (
                <motion.a
                  key={service}
                  href={`#service-${service}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-100 bg-white hover:shadow-lg hover:border-gray-200 transition-all duration-300 text-center"
                >
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: `${buttonColor}12` }}>
                    <Icon className="h-5 w-5 transition-colors duration-300" style={{ color: buttonColor }} />
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{label}</span>
                </motion.a>
              );
            })}
          </div>
        )}
      </section>

      {/* Detailed service cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {enabledServices.length === 0 ? (
          <p className="text-center text-gray-400 py-20">No services configured yet.</p>
        ) : (
          <div className="space-y-20">
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
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.6 }}
                  className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-stretch gap-0 bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500`}
                >
                  {/* Image */}
                  <div className="lg:w-1/2 relative overflow-hidden group">
                    <img
                      src={image}
                      alt={label}
                      className="w-full h-72 lg:h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6">
                      <span className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-full">
                        <Icon className="h-3.5 w-3.5" /> {label}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                    <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-3" style={{ color: buttonColor }}>
                      {`0${i + 1}.`}
                    </p>
                    <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4" style={serifFont}>{label}</h2>
                    <p className="text-gray-500 leading-relaxed mb-8">{desc}</p>

                    <div className="grid grid-cols-2 gap-3 mb-8">
                      {features.map((feat, fi) => (
                        <div key={fi} className="flex items-center gap-2.5 text-sm text-gray-600">
                          <span className="h-5 w-5 rounded-full flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: buttonColor }}>
                            <Check className="h-3 w-3" />
                          </span>
                          {feat}
                        </div>
                      ))}
                    </div>

                    <Link to={`/agency/${slug}/services/${service}`}>
                      <Button className="rounded-full font-semibold gap-2 text-white px-8 h-12 text-sm" style={{ backgroundColor: buttonColor }}>
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

      {/* CTA Banner */}
      <section className="bg-gray-950 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={serifFont}>Ready to Start Your Journey?</h2>
            <p className="text-white/40 mb-8 max-w-lg mx-auto">Book any of our services with confidence. Professional support, premium vehicles, and unforgettable experiences await.</p>
            <Link to={`/agency/${slug}/contact`}>
              <Button className="rounded-full font-semibold gap-2 text-white px-10 h-12 text-sm" style={{ backgroundColor: buttonColor }}>
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
