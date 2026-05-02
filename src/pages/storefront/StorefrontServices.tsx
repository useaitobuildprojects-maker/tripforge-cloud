import { useOutletContext, Link, useParams } from 'react-router-dom';
import { Agency, StorefrontConfig, ServiceType, SERVICE_LABELS } from '@/types/agency';
import { motion } from 'framer-motion';
import { Car, UserCheck, Crown, Building, Star, ChevronRight, Check, ArrowRight, Globe } from 'lucide-react';
import StorefrontSeo from '@/components/storefront/StorefrontSeo';
import { TemplateStyles } from "@/lib/template-styles";
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

const headingFont = { fontFamily: 'var(--font-sans)', fontWeight: 800, letterSpacing: '-0.025em' };

const StorefrontServices = () => {
  const { slug } = useParams();
  const { agency, templateStyles: ts, buttonColor, config: cfg } = useOutletContext<{ agency: Agency; templateStyles: TemplateStyles; buttonColor: string; config: StorefrontConfig }>();
  const tk = ts.tokens;
  const enabledServices = agency.services ?? [];
  const EXP = ts.palette;
  const accent = ts.isDark ? buttonColor : EXP.brand;
  const ctaBg = ts.isDark ? buttonColor : EXP.cta;
  const ctaTextColor = ts.isDark ? '#ffffff' : EXP.ctaText;

  return (
    <div style={tk.surface}>
      <StorefrontSeo
        agency={agency}
        page="fleet"
        fallbackTitle={`Our Services | ${agency.name}`}
        fallbackDescription={`Explore the services offered by ${agency.name} in ${agency.city}, ${agency.country}.`}
      />

      {/* Compact header band — Booking.com style */}
      <section className="relative" style={tk.surfaceDeep}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <h1 className="text-3xl md:text-4xl lg:text-5xl mb-2" style={{ ...headingFont, ...tk.textOnDeep }}>
            {cfg.services_title || 'Our services'}
          </h1>
          <p className="max-w-2xl text-sm md:text-base" style={tk.textOnDeepMuted}>
            {cfg.services_subtitle || `Browse vehicles, transfers and tours across ${agency.city}. Best price guaranteed.`}
          </p>
        </div>
      </section>

      {/* Detailed service cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 pb-16">
        {enabledServices.length === 0 ? (
          <p className="text-center py-20" style={tk.textMuted}>No services configured yet.</p>
        ) : (
          <div className="space-y-10">
            {enabledServices.map((service, i) => {
              const Icon = SERVICE_ICONS[service] ?? Car;
              const label = SERVICE_LABELS[service] ?? service;
              const customDesc = cfg.service_descriptions?.[service];
              const desc = customDesc || SERVICE_DESCRIPTIONS[service] || 'Explore this service.';
              const image = SERVICE_IMAGES[service];
              const features = SERVICE_FEATURES[service] ?? [];
              const isReversed = i % 2 === 1;

              return (
                <motion.div id={`service-${service}`} key={service}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.4 }}
                  className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-stretch gap-0 rounded-md overflow-hidden border hover:shadow-lg transition-all duration-300`}
                  style={{ ...tk.surface, ...tk.border }}>
                  <div className="lg:w-2/5 relative overflow-hidden group">
                    <img src={image} alt={label} className="w-full h-56 lg:h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <span className="inline-flex items-center gap-1.5 bg-white text-xs font-extrabold px-2.5 py-1 rounded-sm" style={{ color: accent }}>
                        <Icon className="h-3.5 w-3.5" /> {label}
                      </span>
                    </div>
                  </div>

                  <div className="lg:w-3/5 p-6 lg:p-8 flex flex-col justify-center">
                    <h2 className="text-xl lg:text-2xl mb-2" style={{ ...headingFont, ...tk.textPrimary }}>{label}</h2>
                    <p className="text-sm leading-relaxed mb-5" style={tk.textBody}>{desc}</p>

                    <div className="grid grid-cols-2 gap-2 mb-5">
                      {features.map((feat, fi) => (
                        <div key={fi} className="flex items-center gap-2 text-sm" style={tk.textBody}>
                          <Check className="h-4 w-4 shrink-0" style={{ color: 'hsl(155 50% 36%)' }} />
                          {feat}
                        </div>
                      ))}
                    </div>

                    <Link to={`/agency/${slug}/services/${service}`}>
                      <Button className="rounded-md font-extrabold gap-2 px-6 h-11 text-sm hover:brightness-95" style={{ backgroundColor: accent, color: '#ffffff' }}>
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
      <section className="py-12" style={tk.surfaceDeep}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-2xl md:text-3xl mb-3" style={{ ...headingFont, ...tk.textOnDeep }}>Ready to start your journey?</h2>
            <p className="text-sm mb-6 max-w-lg mx-auto" style={tk.textOnDeepMuted}>Best price guarantee. Free cancellation on most bookings. 24/7 support.</p>
            <Link to={`/agency/${slug}/contact`}>
              <Button className="rounded-md font-extrabold gap-2 px-8 h-11 text-sm hover:brightness-95" style={{ backgroundColor: ctaBg, color: ctaTextColor }}>
                Contact us <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default StorefrontServices;
