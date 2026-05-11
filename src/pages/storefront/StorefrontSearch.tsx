import { useOutletContext, useParams, useSearchParams, Link } from 'react-router-dom';
import { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, MapPin, ArrowRight, Calendar, Users, Route, Clock } from 'lucide-react';
import { Agency, StorefrontConfig, ServiceType, SERVICE_LABELS } from '@/types/agency';
import { TemplateStyles } from '@/lib/template-styles';
import StorefrontSeo from '@/components/storefront/StorefrontSeo';
import RouteMap from '@/components/storefront/RouteMap';
import TransferBookingForm from '@/components/storefront/TransferBookingForm';
import LimoBookingForm from '@/components/storefront/LimoBookingForm';
import CityTourBookingForm from '@/components/storefront/CityTourBookingForm';
import { geocodePlace, getDrivingRoute } from '@/lib/transfer-pricing';

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
  const cities = params.get('cities') || '';
  const pkg = params.get('package') || '';

  const title = useMemo(() => SERVICE_LABELS[service] ?? 'Search', [service]);

  const [routeInfo, setRouteInfo] = useState<{ distance_km: number; duration_min: number } | null>(null);
  useEffect(() => {
    let cancelled = false;
    setRouteInfo(null);
    if (service !== 'transfer' || !pickup || !dropoff || pickup === dropoff) return;
    (async () => {
      const [o, d] = await Promise.all([geocodePlace(pickup), geocodePlace(dropoff)]);
      if (!o || !d || cancelled) return;
      const r = await getDrivingRoute(o, d);
      if (!cancelled && r) setRouteInfo(r);
    })();
    return () => { cancelled = true; };
  }, [service, pickup, dropoff]);

  if (!agency.services?.includes(service)) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center" style={tk.surface}>
        <h1 className="text-2xl font-bold mb-2" style={tk.textPrimary}>Service Not Available</h1>
        <Link to={`/agency/${slug}`} className="text-sm font-bold" style={{ color: accent }}>← Back home</Link>
      </div>
    );
  }

  const renderForm = () => {
    if (service === 'transfer') return <TransferBookingForm agency={agency} config={cfg} buttonColor={buttonColor} initialOrigin={pickup} initialDestination={dropoff} initialDate={start} initialPax={pax ? Number(pax) : undefined} hideRouteFields />;
    if (service === 'limo_tour') return <LimoBookingForm agency={agency} config={cfg} buttonColor={buttonColor} hideItineraryFields initialCities={cities ? cities.split('|').filter(Boolean) : undefined} initialPax={pax ? Number(pax) : undefined} initialPackage={pkg === 'half' || pkg === 'full' ? pkg : undefined} initialStart={start || undefined} initialEnd={end || undefined} />;
    if (service === 'city_tour') return <CityTourBookingForm agency={agency} config={cfg} buttonColor={buttonColor} hideItineraryFields initialCity={pickup || cities} initialDate={start} initialPax={pax ? Number(pax) : undefined} />;
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

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 min-w-0">
            {renderForm()}
          </div>
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-20 space-y-4">
              <div className="rounded-md border overflow-hidden" style={{ ...tk.surface, ...tk.border }}>
                <RouteMap origin={pickup} destination={dropoff} height={360} />
                {(pickup || dropoff) && (
                  <div className="p-4 space-y-3">
                    <div className="flex items-start gap-2 text-xs" style={tk.textBody}>
                      <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: accent }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate" style={tk.textPrimary}>{pickup}</p>
                        <p className="text-[11px]" style={tk.textMuted}>Pickup</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-xs" style={tk.textBody}>
                      <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" style={{ color: accent }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate" style={tk.textPrimary}>{dropoff}</p>
                        <p className="text-[11px]" style={tk.textMuted}>Drop-off</p>
                      </div>
                    </div>
                    {routeInfo && (
                      <div className="flex items-center gap-4 pt-3 border-t" style={tk.border}>
                        <div className="flex items-center gap-1.5 text-sm font-bold" style={tk.textPrimary}>
                          <Route className="h-4 w-4" style={{ color: accent }} />
                          {routeInfo.distance_km} km
                        </div>
                        <div className="flex items-center gap-1.5 text-sm font-bold" style={tk.textPrimary}>
                          <Clock className="h-4 w-4" style={{ color: accent }} />
                          ~{routeInfo.duration_min} min
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
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