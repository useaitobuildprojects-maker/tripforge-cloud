import { useOutletContext, Link, useParams } from 'react-router-dom';
import { Agency, StorefrontConfig, ServiceType, SERVICE_LABELS } from '@/types/agency';
import { motion } from 'framer-motion';
import { Car, UserCheck, Crown, Building, Truck, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StorefrontSeo from '@/components/storefront/StorefrontSeo';
import { TemplateStyles } from '@/lib/template-styles';

const SERVICE_ICONS: Record<ServiceType, React.ElementType> = {
  car_rental: Car,
  apartment: Building,
  transfer: UserCheck,
  limo_tour: Crown,
  city_tour: Car,
};

const SERVICE_DESCRIPTIONS: Record<ServiceType, string> = {
  car_rental: 'Browse our curated fleet of vehicles — from economy to luxury SUVs — ready for your next adventure.',
  apartment: 'Comfortable furnished apartments for short and long-term stays, conveniently located near key destinations.',
  transfer: 'Professional drivers for airport transfers, hotel pickups, and point-to-point rides.',
  limo_tour: 'Multi-day luxury chauffeured tours across cities and countries — your journey, your pace.',
  city_tour: 'Guided city tours with knowledgeable drivers covering the best landmarks and hidden gems.',
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

      {/* Hero */}
      <section className={`py-16 ${ts.subHeroClass}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl md:text-4xl font-bold mb-3" style={cfg.heading_color ? { color: cfg.heading_color } : undefined}>Our Services</h1>
            <p className="opacity-60 max-w-2xl mx-auto">
              Discover our range of premium services tailored to your needs in {agency.city}.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {enabledServices.length === 0 ? (
          <p className="text-center opacity-50">No services configured yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {enabledServices.map((service, i) => {
              const Icon = SERVICE_ICONS[service] ?? Car;
              const label = SERVICE_LABELS[service] ?? service;
              const desc = SERVICE_DESCRIPTIONS[service] ?? 'Explore this service.';

              return (
                <motion.div
                  key={service}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link
                    to={`/agency/${slug}/services/${service}`}
                    className={`block p-8 rounded-2xl transition-all group ${ts.cardClass} ${ts.cardHoverClass}`}
                    style={ts.cardStyle}
                  >
                    <div className={`inline-flex items-center justify-center h-16 w-16 rounded-full mb-5 ${ts.iconBgClass}`} style={ts.iconBgStyle}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{label}</h3>
                    <p className="text-sm opacity-60 leading-relaxed mb-4">{desc}</p>
                    <span className="inline-flex items-center gap-1 text-sm font-medium group-hover:gap-2 transition-all" style={{ color: buttonColor }}>
                      Explore <ChevronRight className="h-4 w-4" />
                    </span>
                  </Link>
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
