import { useOutletContext, Link, useParams } from 'react-router-dom';
import { Agency, StorefrontConfig, ServiceType, SERVICE_LABELS } from '@/types/agency';
import { motion } from 'framer-motion';
import { Car, UserCheck, Crown, Building, Star, ChevronRight, Check, ArrowRight, Globe } from 'lucide-react';
import StorefrontSeo from '@/components/storefront/StorefrontSeo';
import { TemplateStyles, expediaPalette } from '@/lib/template-styles';
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

const serifFont = { fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600, letterSpacing: '-0.015em' };

const StorefrontServices = () => {
  const { slug } = useParams();
  const { agency, templateStyles: ts, buttonColor, config: cfg } = useOutletContext<{ agency: Agency; templateStyles: TemplateStyles; buttonColor: string; config: StorefrontConfig }>();
  const tk = ts.tokens;
  const enabledServices = agency.services ?? [];
  const EXP = expediaPalette;
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

      {/* Hero — uses surfaceDeep so it's "very dark" on light templates and seamless on dark ones */}
      <section className="relative overflow-hidden" style={{ ...tk.surfaceDeep, minHeight: '340px' }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.05)_0%,_transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center" style={{ minHeight: '340px' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="editorial-eyebrow mb-5 mx-auto" style={{ color: accent }}>What we offer</p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl mb-6" style={{ ...serifFont, ...tk.textOnDeep }}>
              {cfg.services_title || 'Our Services'}
            </h1>
            <p className="max-w-xl mx-auto text-base md:text-lg leading-relaxed font-light" style={tk.textOnDeepMuted}>
              {cfg.services_subtitle || `Premium travel services designed around your comfort and convenience in ${agency.city}.`}
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full"><path d="M0 60V30C360 0 720 0 1080 30C1260 45 1350 52 1440 60H0Z" fill={ts.surfaceFill} /></svg>
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
                <motion.a key={service} href={`#service-${service}`}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="group flex flex-col items-center gap-3 p-5 rounded-2xl border hover:shadow-lg transition-all duration-300 text-center"
                  style={{ ...tk.surface, ...tk.border }}>
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: `${accent}12` }}>
                    <Icon className="h-5 w-5 transition-colors duration-300" style={{ color: accent }} />
                  </div>
                  <span className="text-sm font-semibold" style={tk.textPrimary}>{label}</span>
                </motion.a>
              );
            })}
          </div>
        )}
      </section>

      {/* Detailed service cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {enabledServices.length === 0 ? (
          <p className="text-center py-20" style={tk.textMuted}>No services configured yet.</p>
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
                <motion.div id={`service-${service}`} key={service}
                  initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6 }}
                  className={`flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-stretch gap-0 rounded-3xl overflow-hidden border shadow-sm hover:shadow-xl transition-all duration-500`}
                  style={{ ...tk.surface, ...tk.border }}>
                  <div className="lg:w-1/2 relative overflow-hidden group">
                    <img src={image} alt={label} className="w-full h-72 lg:h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6">
                      <span className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm text-xs font-semibold px-3 py-1.5 rounded-full" style={{ color: '#111827' }}>
                        <Icon className="h-3.5 w-3.5" /> {label}
                      </span>
                    </div>
                  </div>

                  <div className="lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                    <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-3" style={{ color: accent }}>
                      {`0${i + 1}.`}
                    </p>
                    <h2 className="text-2xl lg:text-3xl font-bold mb-4" style={{ ...serifFont, ...tk.textPrimary }}>{label}</h2>
                    <p className="leading-relaxed mb-8" style={tk.textBody}>{desc}</p>

                    <div className="grid grid-cols-2 gap-3 mb-8">
                      {features.map((feat, fi) => (
                        <div key={fi} className="flex items-center gap-2.5 text-sm" style={tk.textBody}>
                          <span className="h-5 w-5 rounded-full flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: accent }}>
                            <Check className="h-3 w-3" />
                          </span>
                          {feat}
                        </div>
                      ))}
                    </div>

                    <Link to={`/agency/${slug}/services/${service}`}>
                      <Button className="rounded-xl font-bold gap-2 px-8 h-12 text-sm hover:brightness-95" style={{ backgroundColor: ctaBg, color: ctaTextColor }}>
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
      <section className="py-20" style={tk.surfaceDeep}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ ...serifFont, ...tk.textOnDeep }}>Ready to Start Your Journey?</h2>
            <p className="mb-8 max-w-lg mx-auto" style={tk.textOnDeepMuted}>Book any of our services with confidence. Professional support, premium vehicles, and unforgettable experiences await.</p>
            <Link to={`/agency/${slug}/contact`}>
              <Button className="rounded-xl font-bold gap-2 px-10 h-12 text-sm hover:brightness-95" style={{ backgroundColor: ctaBg, color: ctaTextColor }}>
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
