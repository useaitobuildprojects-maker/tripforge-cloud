import { Outlet, useParams, useLocation, Link } from 'react-router-dom';
import { useAgencyBySlug } from '@/hooks/use-agencies';
import { useFavicon } from '@/hooks/use-favicon';
import { Mail, MapPin, Facebook, Twitter, Instagram, MessageCircle, Share2, Menu, X, Phone, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { getShareUrl } from '@/lib/share-url';
import { getTemplateStyles } from '@/lib/template-styles';
import { toast } from 'sonner';
import { useState } from 'react';

const StorefrontLayout = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const { data: agency, isLoading } = useAgencyBySlug(slug ?? '');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pathParts = location.pathname.split('/');
  const currentPage = pathParts[pathParts.length - 1] || 'home';
  const page = ['fleet', 'contact', 'about', 'services'].includes(currentPage) ? currentPage : 'home';

  const handleShare = () => {
    const shareUrl = getShareUrl(slug ?? '', page);
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard!');
  };

  useFavicon(agency?.favicon_url);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Agency not found</h1>
          <p className="text-muted-foreground">The agency you're looking for doesn't exist.</p>
          <Link to="/" className="text-accent hover:underline mt-4 inline-block">Back to admin</Link>
        </div>
      </div>
    );
  }

  const ts = getTemplateStyles(agency.storefront_template);
  const tk = ts.tokens;
  // Use the template's CTA as default; allow per-agency override.
  const btnColor = agency.button_color ?? ts.palette.cta;
  // For dark templates (e.g. blacklane), ignore any legacy light background_color so the theme actually applies.
  const bgColor = ts.isDark ? undefined : (agency.background_color ?? undefined);
  const cfg = agency.storefront_config ?? {};
  const fontClass = cfg.font === 'serif' ? 'font-serif' : cfg.font === 'modern' ? 'font-sans tracking-tight' : 'font-sans';
  // Apply the template's body font globally to the storefront so every page,
  // section and component picks up the correct typography.
  const bodyStyle: React.CSSProperties = {
    ...(bgColor ? { backgroundColor: bgColor } : { ...(ts.bodyStyle ?? {}), ...tk.surface }),
    fontFamily: ts.typography.body,
  };

  // Header derives its colors from the active template's palette so each
  // template (Classic, Minimal, Elegant, Corporate, Fresh, Coastal, Blacklane)
  // visually distinguishes itself.
  const pal = ts.palette;
  const accent = btnColor;
  const headerBg = pal.brandDeep;
  const headerText = pal.onBrandDeep;
  const headerTextMuted = 'rgba(255,255,255,0.75)';
  const logoTextStyle: React.CSSProperties = {
    fontFamily: ts.typography.heading,
    fontWeight: 800,
    letterSpacing: '-0.025em',
    color: headerText,
  };
  const iconBtnBg = 'rgba(255,255,255,0.12)';

  const navLinks = [
    { label: 'Home', to: `/agency/${slug}` },
    { label: 'Services', to: `/agency/${slug}/services` },
    { label: 'About Us', to: `/agency/${slug}/about` },
    { label: 'Contact Us', to: `/agency/${slug}/contact` },
  ];

  return (
    <div className={`min-h-screen ${fontClass}`} style={bodyStyle}>
      {/* ═══ Nav ═══ */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          backgroundColor: headerBg,
          borderColor: 'rgba(255,255,255,0.08)',
          color: headerText,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[60px]">
            <Link to={`/agency/${slug}`} className="flex items-center gap-2 shrink-0">
              {agency.logo_url ? (
                <img src={agency.logo_url} alt={`${agency.name} logo`} className="h-8 w-auto object-contain" />
              ) : (
                <span className="text-xl" style={logoTextStyle}>{agency.name}</span>
              )}
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = (link.label === 'Home' && page === 'home') || link.to.endsWith(page);
                return (
                  <Link
                    key={link.label}
                    to={link.to}
                    data-active={isActive ? 'true' : undefined}
                    className="px-3 py-2 rounded-md text-sm font-semibold transition-colors"
                    style={{
                      color: headerText,
                      backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden md:flex items-center gap-2">
              <Link
                to={`/agency/${slug}/contact`}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-md text-sm font-bold transition-all border-2"
                style={{ backgroundColor: 'transparent', color: headerText, borderColor: 'rgba(255,255,255,0.5)' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = '#ffffff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; }}
              >
                <Phone className="h-3.5 w-3.5" /> Contact
              </Link>
            </div>

            <button
              className="md:hidden h-9 w-9 rounded-md flex items-center justify-center"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ backgroundColor: iconBtnBg, color: headerText }}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t px-4 py-4 space-y-1" style={{ backgroundColor: headerBg, borderColor: 'rgba(255,255,255,0.1)' }}>
            {navLinks.map((link) => {
              const isActive = (link.label === 'Home' && page === 'home') || link.to.endsWith(page);
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  className="flex items-center justify-between text-base font-semibold py-3 px-3 rounded-md transition-colors"
                  style={{ color: headerText, backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                  <ArrowRight className="h-4 w-4 opacity-40" />
                </Link>
              );
            })}
            <Link
              to={`/agency/${slug}/contact`}
              onClick={() => setMobileMenuOpen(false)}
              className="mt-3 flex items-center justify-center gap-2 h-11 rounded-md text-sm font-bold"
              style={{ backgroundColor: pal.cta, color: pal.ctaText }}
            >
              <Phone className="h-4 w-4" /> Contact us
            </Link>
          </div>
        )}
      </header>

      {/* Content */}
      <Outlet context={{ agency, templateStyles: ts, buttonColor: btnColor, config: cfg }} />

      {/* ═══ Footer — Expedia clean light ═══ */}
      <footer className="border-t" style={{ ...tk.surfaceAlt, ...tk.border }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-4">
              {agency.logo_url ? (
                <img src={agency.logo_url} alt="" className="h-9 w-auto object-contain mb-4" />
              ) : (
                <h3 className="text-2xl mb-4" style={logoTextStyle}>{agency.name}</h3>
              )}
              <p className="text-sm leading-relaxed mb-5 max-w-xs" style={tk.textMuted}>
                Book vehicles, transfers and experiences in {agency.city} with confidence.
              </p>
              <div className="flex items-center gap-2">
                {[
                  { url: cfg.facebook_url, Icon: Facebook },
                  { url: cfg.twitter_url, Icon: Twitter },
                  { url: cfg.instagram_url, Icon: Instagram },
                ].filter(s => s.url).map(({ url, Icon }, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                    className="h-9 w-9 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
                    style={{ backgroundColor: iconBtnBg, color: accent }}>
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <h4 className="text-xs font-bold uppercase tracking-wider mb-4" style={tk.textPrimary}>Company</h4>
              <ul className="space-y-2.5 text-sm" style={tk.textBody}>
                <li><Link to={`/agency/${slug}/about`} className="hover:underline">About Us</Link></li>
                <li><Link to={`/agency/${slug}/services`} className="hover:underline">Services</Link></li>
                <li><Link to={`/agency/${slug}/fleet`} className="hover:underline">Fleet</Link></li>
                <li><Link to={`/agency/${slug}/contact`} className="hover:underline">Contact</Link></li>
              </ul>
            </div>
            <div className="md:col-span-3">
              <h4 className="text-xs font-bold uppercase tracking-wider mb-4" style={tk.textPrimary}>Support</h4>
              <ul className="space-y-2.5 text-sm" style={tk.textBody}>
                <li>Help Center</li>
                <li>Privacy Policy</li>
                <li>Terms & Conditions</li>
              </ul>
            </div>
            <div className="md:col-span-3">
              <h4 className="text-xs font-bold uppercase tracking-wider mb-4" style={tk.textPrimary}>Contact</h4>
              <ul className="space-y-2.5 text-sm" style={tk.textBody}>
                <li className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0" style={{ color: accent }} /> {agency.contact_email}</li>
                <li className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" style={{ color: accent }} /> {agency.city}, {agency.country}</li>
                {cfg.phone && <li className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0" style={{ color: accent }} /> {cfg.phone}</li>}
              </ul>
            </div>
          </div>
          <div className="border-t mt-10 pt-5 flex flex-wrap items-center justify-between gap-3" style={tk.border}>
            <p className="text-xs" style={tk.textMuted}>© {new Date().getFullYear()} {agency.name}. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StorefrontLayout;
