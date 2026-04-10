import { Outlet, useParams, useLocation, Link } from 'react-router-dom';
import { useAgencyBySlug } from '@/hooks/use-agencies';
import { useFavicon } from '@/hooks/use-favicon';
import { Mail, MapPin, Facebook, Twitter, Instagram, MessageCircle, Share2, Search, Menu, X, Phone, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { getShareUrl } from '@/lib/share-url';
import { getTemplateStyles } from '@/lib/template-styles';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

const StorefrontLayout = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const { data: agency, isLoading } = useAgencyBySlug(slug ?? '');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const pathParts = location.pathname.split('/');
  const currentPage = pathParts[pathParts.length - 1] || 'home';
  const page = ['fleet', 'contact', 'about', 'services'].includes(currentPage) ? currentPage : 'home';
  const isHome = page === 'home';

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
  const btnColor = agency.button_color ?? '#c8a951';
  const bgColor = agency.background_color ?? undefined;
  const cfg = agency.storefront_config ?? {};

  const fontClass = cfg.font === 'serif' ? 'font-serif' : cfg.font === 'modern' ? 'font-sans tracking-tight' : 'font-sans';
  const bodyStyle: React.CSSProperties = bgColor ? { backgroundColor: bgColor } : (ts.bodyStyle ?? {});

  const navLinks = [
    { label: 'Home', to: `/agency/${slug}` },
    { label: 'About', to: `/agency/${slug}/about` },
    { label: 'Services', to: `/agency/${slug}/services` },
    { label: 'Contact', to: `/agency/${slug}/contact` },
  ];

  // Nav becomes solid on scroll or on non-home pages
  const navSolid = scrolled || !isHome;

  return (
    <div className={`min-h-screen ${fontClass} ${!bgColor ? ts.bodyClass : ''}`} style={bodyStyle}>

      {/* ═══ Navigation — Transparent over hero, solid on scroll ═══ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          navSolid
            ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100'
            : 'bg-transparent'
        }`}
        style={cfg.nav_bg_color && navSolid ? { backgroundColor: cfg.nav_bg_color, borderColor: 'transparent' } : undefined}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            {/* Logo */}
            <Link to={`/agency/${slug}`} className="flex items-center gap-2 z-10">
              {agency.logo_url ? (
                <img src={agency.logo_url} alt={`${agency.name} logo`} className={`h-10 w-auto object-contain transition-all duration-300 ${!navSolid ? 'brightness-0 invert' : ''}`} />
              ) : (
                <span
                  className={`text-xl font-bold tracking-tight transition-colors duration-300 ${
                    navSolid ? 'text-gray-900' : 'text-white'
                  }`}
                  style={cfg.nav_text_color && navSolid ? { color: cfg.nav_text_color } : undefined}
                >
                  {agency.name}
                </span>
              )}
            </Link>

            {/* Center nav links */}
            <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {navLinks.map((link) => {
                const isActive = (link.label === 'Home' && page === 'home') || link.to.endsWith(page);
                return (
                  <Link
                    key={link.label}
                    to={link.to}
                    className={`px-4 py-2 text-[13px] font-medium rounded-full transition-all duration-300 ${
                      navSolid
                        ? isActive
                          ? 'text-gray-900 bg-gray-100'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        : isActive
                          ? 'text-white bg-white/15 backdrop-blur-sm'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-3 z-10">
              <button onClick={handleShare} className={`p-2 rounded-full transition-colors ${navSolid ? 'hover:bg-gray-100 text-gray-500' : 'hover:bg-white/10 text-white/70'}`} title="Share">
                <Share2 className="h-4 w-4" />
              </button>
              <Link
                to={`/agency/${slug}/contact`}
                className="text-[13px] font-semibold px-5 py-2 rounded-full transition-all duration-300 text-white"
                style={{ backgroundColor: btnColor }}
              >
                Book Now
              </Link>
            </div>

            {/* Mobile menu toggle */}
            <button className={`md:hidden p-2 z-10 ${navSolid ? 'text-gray-900' : 'text-white'}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1 shadow-xl">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="block text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-gray-50 text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to={`/agency/${slug}/contact`}
              className="block text-center text-sm font-semibold py-2.5 px-3 rounded-lg text-white mt-2"
              style={{ backgroundColor: btnColor }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Book Now
            </Link>
          </div>
        )}
      </header>

      {/* Page Content */}
      <Outlet context={{ agency, templateStyles: ts, buttonColor: btnColor, config: cfg }} />

      {/* ═══ CTA Banner ═══ */}
      <section className="relative overflow-hidden" style={{ backgroundColor: btnColor }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
            Ready for Your Next Adventure?
          </h2>
          <p className="text-white/70 text-sm max-w-lg mx-auto mb-6">
            Let us handle the details while you enjoy the journey. Premium service, competitive prices.
          </p>
          <Link
            to={`/agency/${slug}/contact`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-sm font-bold hover:bg-gray-100 transition-colors"
            style={{ color: btnColor }}
          >
            Get Started <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
            {/* Brand */}
            <div className="md:col-span-4">
              {agency.logo_url ? (
                <img src={agency.logo_url} alt={`${agency.name} logo`} className="h-10 w-auto object-contain mb-5 brightness-0 invert" />
              ) : (
                <h3 className="text-2xl font-bold mb-5 tracking-tight">{agency.name}</h3>
              )}
              <p className="text-sm text-white/40 leading-relaxed mb-6 max-w-xs">
                Your trusted partner for premium travel services in {agency.city}, {agency.country}. Exceptional experiences, unforgettable journeys.
              </p>
              <div className="flex items-center gap-3">
                {cfg.facebook_url && <a href={cfg.facebook_url} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"><Facebook className="h-4 w-4" /></a>}
                {cfg.twitter_url && <a href={cfg.twitter_url} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"><Twitter className="h-4 w-4" /></a>}
                {cfg.instagram_url && <a href={cfg.instagram_url} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"><Instagram className="h-4 w-4" /></a>}
                {cfg.whatsapp_number && <a href={`https://wa.me/${encodeURIComponent(cfg.whatsapp_number.replace(/[^0-9+]/g, ''))}`} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"><MessageCircle className="h-4 w-4" /></a>}
                {!cfg.facebook_url && !cfg.twitter_url && !cfg.instagram_url && !cfg.whatsapp_number && (
                  <>
                    <span className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center text-white/10"><Facebook className="h-4 w-4" /></span>
                    <span className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center text-white/10"><Twitter className="h-4 w-4" /></span>
                    <span className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center text-white/10"><Instagram className="h-4 w-4" /></span>
                  </>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="md:col-span-2">
              <h4 className="text-xs font-bold uppercase tracking-[0.15em] mb-5 text-white/50">Explore</h4>
              <ul className="space-y-3 text-sm text-white/40">
                {navLinks.map((link) => (
                  <li key={link.label}><Link to={link.to} className="hover:text-white transition-colors">{link.label}</Link></li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div className="md:col-span-3">
              <h4 className="text-xs font-bold uppercase tracking-[0.15em] mb-5 text-white/50">Services</h4>
              <ul className="space-y-3 text-sm text-white/40">
                <li><Link to={`/agency/${slug}/services`} className="hover:text-white transition-colors">Car Rental</Link></li>
                <li><Link to={`/agency/${slug}/services`} className="hover:text-white transition-colors">Airport Transfer</Link></li>
                <li><Link to={`/agency/${slug}/services`} className="hover:text-white transition-colors">Limo Service</Link></li>
                <li><Link to={`/agency/${slug}/services`} className="hover:text-white transition-colors">City Tours</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="md:col-span-3">
              <h4 className="text-xs font-bold uppercase tracking-[0.15em] mb-5 text-white/50">Contact</h4>
              <ul className="space-y-3 text-sm text-white/40">
                <li className="flex items-center gap-2.5"><Mail className="h-4 w-4 shrink-0" /> {agency.contact_email}</li>
                <li className="flex items-center gap-2.5"><MapPin className="h-4 w-4 shrink-0" /> {agency.city}, {agency.country}</li>
                {cfg.phone && <li className="flex items-center gap-2.5"><Phone className="h-4 w-4 shrink-0" /> {cfg.phone}</li>}
              </ul>
              {agency.domain && (
                <p className="text-xs text-white/15 mt-4">🌐 {agency.domain}</p>
              )}
            </div>
          </div>

          <div className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-[11px] text-white/20">© {new Date().getFullYear()} {agency.name}. All Rights Reserved.</p>
            <div className="flex items-center gap-5 text-[11px] text-white/20">
              <a href="#" className="hover:text-white/40 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white/40 transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StorefrontLayout;
