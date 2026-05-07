import { useOutletContext, useParams, useSearchParams, Link } from 'react-router-dom';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, MapPin, ArrowRight, Calendar, Users } from 'lucide-react';
import { Agency, StorefrontConfig, ServiceType, SERVICE_LABELS } from '@/types/agency';
import { TemplateStyles } from '@/lib/template-styles';
import StorefrontSeo from '@/components/storefront/StorefrontSeo';
import RouteMap from '@/components/storefront/RouteMap';
import TransferBookingForm from '@/components/storefront/TransferBookingForm';
import LimoBookingForm from '@/components/storefront/LimoBookingForm';
import CityTourBookingForm from '@/components/storefront/CityTourBookingForm';

const StorefrontSearch = () => {
  const { slug, serviceType } = useParams<{ slug: string; serviceType: string }>();
  const [params] = useSearchParams();
  const { agency, templateStyles: ts, buttonColor, config: cfg } = useOutletContext<{
    agency: Agency; templateStyles: TemplateStyles; buttonColor: string; config: StorefrontConfig
  }>();
  const tk = ts.tokens;
  const accent = buttonColor || ts.palette.brand;
  const headingFont: React.CSSProperties = { fontFamily: ts.typography.heading, letterSpacing: '-0.015em' };

  const service = serviceType as ServiceType;
  const pickup = params.get('pickup') || '';
  const dropoff = params.get('dropoff') || '';
  const start = params.get('start') || '';
  const end = params.get('end') || '';
  const pax = params.get('pax') || '';

  const title = useMemo(() => SERVICE_LABELS[service] ?? 'Search', [service]);

  if (!agency.services?.includes(service)) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center" style={tk.surface}>
        <h1 className="text-2xl font-bold mb-2" style={tk.textPrimary}>Service Not Available</h1>
        <Link to={`/agency/${slug}`} className="text-sm font-bold" style={{ color: accent }}>← Back home</Link>
      </div>
    );
  }

  const renderForm = () => {
    if (service === 'transfer') return <TransferBookingForm agency={agency} config={cfg} buttonColor={buttonColor} />;
    if (service === 'limo_tour') return <LimoBookingForm agency={agency} config={cfg} buttonColor={buttonColor} />;
    if (service === 'city_tour') return <CityTourBookingForm agency={agency} config={cfg} buttonColor={buttonColor} />;
    return null;
  };

  return (
    <div style={tk.surface}>
      <StorefrontSeo agency={agency} page="fleet" fallbackTitle={`${title} search | ${agency.name}`} fallbackDescription={`Plan your ${title.toLowerCase()} with ${agency.name}.`} />

      {/* Trip summary bar */}
      <section className="border-b" style={{ ...tk.surface, ...tk.border }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center gap-3">
          <Link to={`/agency/${slug}`} className="inline-flex items-center gap-1 text-xs font-bold hover:underline shrink-0" style={tk.textBody}>
            <ChevronLeft className="h-4 w-4" /> Edit search
          </Link>
          <div className="flex-1 min-w-0 flex flex-wrap items-center gap-2">
            {pickup && (
              <div className="inline-flex items-center gap-2 px-3 h-9 rounded-md border-2 text-sm font-semibold" style={{ ...tk.inputSurface, ...tk.inputBorder, ...tk.textPrimary }}>
                <MapPin className="h-3.5 w-3.5" style={{ color: accent }} />
                <span className="truncate max-w-[220px]">{pickup}</span>
              </div>
            )}
            {dropoff && (
              <>
                <ArrowRight className="h-4 w-4" style={tk.textMuted} />
                <div className="inline-flex items-center gap-2 px-3 h-9 rounded-md border-2 text-sm font-semibold" style={{ ...tk.inputSurface, ...tk.inputBorder, ...tk.textPrimary }}>
                  <MapPin className="h-3.5 w-3.5" style={{ color: accent }} />
                  <span className="truncate max-w-[220px]">{dropoff}</span>
                </div>
              </>
            )}
            {(start || end) && (
              <div className="inline-flex items-center gap-2 px-3 h-9 rounded-md border-2 text-sm font-semibold" style={{ ...tk.inputSurface, ...tk.inputBorder, ...tk.textPrimary }}>
                <Calendar className="h-3.5 w-3.5" style={{ color: accent }} />
                <span>{start}{end ? ` → ${end}` : ''}</span>
              </div>
            )}
            {pax && (
              <div className="inline-flex items-center gap-2 px-3 h-9 rounded-md border-2 text-sm font-semibold" style={{ ...tk.inputSurface, ...tk.inputBorder, ...tk.textPrimary }}>
                <Users className="h-3.5 w-3.5" style={{ color: accent }} />
                <span>{pax} pax</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main: form (left) + map (right) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <h1 className="text-2xl md:text-3xl mb-1" style={{ ...headingFont, ...tk.textPrimary }}>
            Choose your experience
          </h1>
          <p className="text-sm mb-6" style={tk.textMuted}>
            Pick a vehicle class, confirm details, and get an instant quote.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 min-w-0">
            {renderForm()}
          </div>
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-20 space-y-4">
              <RouteMap origin={pickup} destination={dropoff} height={300} />
              <div className="rounded-md border p-4 text-xs" style={{ ...tk.surface, ...tk.border, ...tk.textBody }}>
                <p className="font-extrabold text-sm mb-1" style={tk.textPrimary}>All fees included</p>
                <p>Free cancellation up to 1 hour before pickup. Professional chauffeurs and meet-and-greet on every booking.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StorefrontSearch;