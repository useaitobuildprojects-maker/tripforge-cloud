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

  // Logo styles depend on dark template
  const logoTextStyle: React.CSSProperties = { fontFamily: "'Georgia', 'Times New Roman', serif", ...tk.textPrimary };
  const navPillBg = ts.isDark ? 'rgba(255,255,255,0.06)' : '#f9fafb';
  const navPillActiveBg = ts.isDark ? 'rgba(255,255,255,0.12)' : '#ffffff';
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
      <header className="sticky top-0 z-50 border-b" style={{ ...tk.surface, ...tk.border }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[68px]">
            <Link to={`/agency/${slug}`} className="flex items-center gap-2">
              {agency.logo_url ? (
                <img src={agency.logo_url} alt={`${agency.name} logo`} className="h-9 w-auto object-contain" />
              ) : (
                <span className="text-xl font-bold tracking-tight" style={logoTextStyle}>{agency.name}</span>
              )}
            </Link>

            <nav className="hidden md:flex items-center gap-1 rounded-full px-1.5 py-1" style={{ backgroundColor: navPillBg }}>
              {navLinks.map((link) => {
                const isActive = (link.label === 'Home' && page === 'home') || link.to.endsWith(page);
                return (
                  <Link key={link.label} to={link.to}
                    className="px-4 py-2 text-[13px] font-medium rounded-full transition-all duration-200"
                    style={isActive ? { backgroundColor: navPillActiveBg, ...navActive, boxShadow: ts.isDark ? '0 1px 2px rgba(0,0,0,0.4)' : '0 1px 2px rgba(0,0,0,0.05)' } : navInactive}>
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <button onClick={handleShare} className="h-9 w-9 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: iconBtnBg, ...tk.textBody }} title="Share">
                <Share2 className="h-4 w-4" />
              </button>
              <Link to={`/agency/${slug}/contact`} className="h-9 w-9 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: iconBtnBg, ...tk.textBody }}>
                <Phone className="h-4 w-4" />
              </Link>
            </div>

            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={tk.textPrimary}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t px-4 py-4 space-y-1 shadow-lg" style={{ ...tk.surface, ...tk.border }}>
            {navLinks.map((link) => (
              <Link key={link.label} to={link.to} className="block text-sm font-medium py-2.5 px-3 rounded-lg" style={tk.textBody} onClick={() => setMobileMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <Outlet context={{ agency, templateStyles: ts, buttonColor: btnColor, config: cfg }} />

      {/* ═══ Footer (always dark for editorial contrast) ═══ */}
      <footer className="text-white" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            <div className="md:col-span-4">
              {agency.logo_url ? (
                <img src={agency.logo_url} alt="" className="h-10 w-auto object-contain mb-5 brightness-0 invert" />
              ) : (
                <h3 className="text-2xl font-bold mb-5" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>{agency.name}</h3>
              )}
              <p className="text-sm text-white/40 leading-relaxed mb-6 max-w-xs">
                Explore stunning destinations, unique experiences, and unforgettable journeys with {agency.name}.
              </p>
              <div className="flex items-center gap-2">
                {[
                  { url: cfg.facebook_url, Icon: Facebook },
                  { url: cfg.twitter_url, Icon: Twitter },
                  { url: cfg.instagram_url, Icon: Instagram },
                ].map(({ url, Icon }, i) => (
                  url ? (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"><Icon className="h-4 w-4" /></a>
                  ) : (
                    <span key={i} className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center text-white/10"><Icon className="h-4 w-4" /></span>
                  )
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <h4 className="text-xs font-bold uppercase tracking-[0.15em] mb-5 text-white/50">About</h4>
              <ul className="space-y-3 text-sm text-white/40">
                <li><Link to={`/agency/${slug}/about`} className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to={`/agency/${slug}/services`} className="hover:text-white transition-colors">Our Services</Link></li>
                <li><Link to={`/agency/${slug}/contact`} className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div className="md:col-span-3">
              <h4 className="text-xs font-bold uppercase tracking-[0.15em] mb-5 text-white/50">Support</h4>
              <ul className="space-y-3 text-sm text-white/40">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms and Conditions</a></li>
              </ul>
            </div>
            <div className="md:col-span-3">
              <h4 className="text-xs font-bold uppercase tracking-[0.15em] mb-5 text-white/50">Contact</h4>
              <ul className="space-y-3 text-sm text-white/40">
                <li className="flex items-center gap-2.5"><Mail className="h-4 w-4 shrink-0" /> {agency.contact_email}</li>
                <li className="flex items-center gap-2.5"><MapPin className="h-4 w-4 shrink-0" /> {agency.city}, {agency.country}</li>
                {cfg.phone && <li className="flex items-center gap-2.5"><Phone className="h-4 w-4 shrink-0" /> {cfg.phone}</li>}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 mt-12 pt-6 text-center">
            <p className="text-[11px] text-white/20">© {new Date().getFullYear()} {agency.name}. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StorefrontLayout;
