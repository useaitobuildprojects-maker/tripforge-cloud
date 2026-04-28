import { Outlet, useParams, useLocation, Link } from 'react-router-dom';
import { useAgencyBySlug } from '@/hooks/use-agencies';
import { useFavicon } from '@/hooks/use-favicon';
import { Mail, MapPin, Facebook, Twitter, Instagram, MessageCircle, Share2, Menu, X, Phone, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { getShareUrl } from '@/lib/share-url';
import { getTemplateStyles, expediaPalette } from '@/lib/template-styles';
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
  const btnColor = agency.button_color ?? '#1a3a4a';
  // For dark templates (e.g. blacklane), ignore any legacy light background_color so the theme actually applies.
  const bgColor = ts.isDark ? undefined : (agency.background_color ?? undefined);
  const cfg = agency.storefront_config ?? {};
  const fontClass = cfg.font === 'serif' ? 'font-serif' : cfg.font === 'modern' ? 'font-sans tracking-tight' : 'font-sans';
  const bodyStyle: React.CSSProperties = bgColor ? { backgroundColor: bgColor } : { ...(ts.bodyStyle ?? {}), ...tk.surface };

  // Editorial logo: Playfair Display, brand-colored on light templates
  const accent = ts.isDark ? btnColor : expediaPalette.brand;
  const logoTextStyle: React.CSSProperties = {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontWeight: 700,
    letterSpacing: '-0.01em',
    color: ts.isDark ? (tk.textPrimary.color as string) : accent,
  };
  const navInactive: React.CSSProperties = tk.textBody;
  const navActive: React.CSSProperties = tk.textPrimary;
  const iconBtnBg = ts.isDark ? 'rgba(255,255,255,0.06)' : '#f9fafb';

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
        className="sticky top-0 z-50 border-b backdrop-blur-md"
        style={{
          ...tk.surface,
          ...tk.border,
          backgroundColor: ts.isDark ? 'rgba(10,10,10,0.85)' : 'rgba(255,255,255,0.88)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            <Link to={`/agency/${slug}`} className="flex items-center gap-2 shrink-0">
              {agency.logo_url ? (
                <img src={agency.logo_url} alt={`${agency.name} logo`} className="h-10 w-auto object-contain" />
              ) : (
                <span className="text-2xl" style={logoTextStyle}>{agency.name}</span>
              )}
            </Link>

            <nav className="hidden md:flex items-center gap-7">
              {navLinks.map((link) => {
                const isActive = (link.label === 'Home' && page === 'home') || link.to.endsWith(page);
                return (
                  <Link
                    key={link.label}
                    to={link.to}
                    data-active={isActive ? 'true' : undefined}
                    className="nav-underline text-[13px] font-medium tracking-wide transition-colors duration-200"
                    style={isActive ? navActive : navInactive}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={handleShare}
                className="h-10 w-10 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
                style={{ backgroundColor: iconBtnBg, ...tk.textBody }}
                title="Share"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <Link
                to={`/agency/${slug}/contact`}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-full text-[13px] font-semibold transition-all hover:brightness-110"
                style={{ backgroundColor: accent, color: '#ffffff' }}
              >
                <Phone className="h-3.5 w-3.5" /> Get in touch
              </Link>
            </div>

            <button
              className="md:hidden h-10 w-10 rounded-full flex items-center justify-center"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ backgroundColor: iconBtnBg, ...tk.textPrimary }}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t px-4 py-5 space-y-1 shadow-lg" style={{ ...tk.surface, ...tk.border }}>
            {navLinks.map((link) => {
              const isActive = (link.label === 'Home' && page === 'home') || link.to.endsWith(page);
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  className="flex items-center justify-between text-base font-medium py-3.5 px-3 rounded-lg transition-colors"
                  style={isActive ? { ...navActive, backgroundColor: ts.isDark ? 'rgba(255,255,255,0.04)' : '#f9fafb' } : tk.textBody}
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
              className="mt-3 flex items-center justify-center gap-2 h-12 rounded-full text-sm font-semibold"
              style={{ backgroundColor: accent, color: '#ffffff' }}
            >
              <Phone className="h-4 w-4" /> Get in touch
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
