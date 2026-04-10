import { Outlet, useParams, useLocation, Link } from 'react-router-dom';
import { useAgencyBySlug } from '@/hooks/use-agencies';
import { useFavicon } from '@/hooks/use-favicon';
import { Mail, MapPin, Facebook, Twitter, Instagram, MessageCircle, Share2, Search, Menu, X } from 'lucide-react';
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
  const btnColor = agency.button_color ?? '#c8a951';
  const bgColor = agency.background_color ?? undefined;
  const cfg = agency.storefront_config ?? {};

  const fontClass = cfg.font === 'serif' ? 'font-serif' : cfg.font === 'modern' ? 'font-sans tracking-tight' : 'font-sans';

  const bodyStyle: React.CSSProperties = bgColor ? { backgroundColor: bgColor } : (ts.bodyStyle ?? {});

  const navLinks = [
    { label: 'Homepage', to: `/agency/${slug}` },
    { label: 'About', to: `/agency/${slug}/about` },
    { label: 'Services', to: `/agency/${slug}/services` },
  ];
  const navLinksRight = [
    { label: 'Blog', to: `/agency/${slug}` },
    { label: 'Contact', to: `/agency/${slug}/contact` },
  ];

  return (
    <div className={`min-h-screen ${fontClass} ${!bgColor ? ts.bodyClass : ''}`} style={bodyStyle}>

      {/* ═══ Navigation — Centered logo, editorial style ═══ */}
      <header
        className="sticky top-0 z-50 border-b transition-all duration-300"
        style={{
          backgroundColor: cfg.nav_bg_color || '#ffffff',
          borderColor: cfg.nav_bg_color ? 'transparent' : 'rgba(0,0,0,0.06)',
          color: cfg.nav_text_color || '#1a1a1a',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[64px]">
            {/* Left nav */}
            <div className="hidden md:flex items-center gap-1">
              <button onClick={handleShare} className="p-2 rounded-full hover:bg-black/5 transition-colors" title="Search">
                <Search className="h-4 w-4 opacity-50" />
              </button>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-[13px] font-medium tracking-wide hover:opacity-60 transition-opacity"
                  style={{ color: cfg.nav_text_color || '#1a1a1a' }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Center logo */}
            <Link to={`/agency/${slug}`} className="flex items-center gap-2">
              {agency.logo_url ? (
                <img src={agency.logo_url} alt={`${agency.name} logo`} className="h-10 w-auto object-contain" />
              ) : (
                <div className="text-center">
                  <span
                    className="text-lg font-bold tracking-tight leading-none"
                    style={{ color: cfg.nav_text_color || '#1a1a1a' }}
                  >
                    {agency.name.toLowerCase()}
                  </span>
                </div>
              )}
            </Link>

            {/* Right nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinksRight.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-[13px] font-medium tracking-wide hover:opacity-60 transition-opacity"
                  style={{ color: cfg.nav_text_color || '#1a1a1a' }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="hidden md:flex items-center gap-1">
              <button className="p-2 rounded-full hover:bg-black/5 transition-colors">
                <Menu className="h-4 w-4 opacity-50" />
              </button>
            </div>

            {/* Mobile menu toggle */}
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-black/5 bg-white px-4 py-4 space-y-3">
            {[...navLinks, ...navLinksRight].map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="block text-sm font-medium py-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Page Content */}
      <Outlet context={{ agency, templateStyles: ts, buttonColor: btnColor, config: cfg }} />

      {/* ═══ Footer — Dark editorial ═══ */}
      <footer
        className="text-white"
        style={{
          backgroundColor: cfg.footer_bg_color || '#1a1a1a',
          color: cfg.footer_text_color || '#ffffff',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-1">
              {agency.logo_url ? (
                <img src={agency.logo_url} alt={`${agency.name} logo`} className="h-10 w-auto object-contain mb-4 brightness-0 invert" />
              ) : (
                <h3 className="text-xl font-bold mb-4 tracking-tight">{agency.name.toLowerCase()}</h3>
              )}
              <p className="text-xs text-white/40 leading-relaxed">
                Your trusted partner for premium travel services in {agency.city}, {agency.country}.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.15em] mb-4 text-white/60">Navigation</h4>
              <ul className="space-y-2 text-sm text-white/40">
                <li><Link to={`/agency/${slug}`} className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to={`/agency/${slug}/about`} className="hover:text-white transition-colors">About</Link></li>
                <li><Link to={`/agency/${slug}/services`} className="hover:text-white transition-colors">Services</Link></li>
                <li><Link to={`/agency/${slug}/contact`} className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.15em] mb-4 text-white/60">Contact</h4>
              <ul className="space-y-2 text-sm text-white/40">
                <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {agency.contact_email}</li>
                <li className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {agency.city}, {agency.country}</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-[0.15em] mb-4 text-white/60">Social</h4>
              <div className="flex items-center gap-3">
                {cfg.facebook_url && <a href={cfg.facebook_url} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-colors"><Facebook className="h-4 w-4" /></a>}
                {cfg.twitter_url && <a href={cfg.twitter_url} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-colors"><Twitter className="h-4 w-4" /></a>}
                {cfg.instagram_url && <a href={cfg.instagram_url} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-colors"><Instagram className="h-4 w-4" /></a>}
                {cfg.whatsapp_number && <a href={`https://wa.me/${encodeURIComponent(cfg.whatsapp_number.replace(/[^0-9+]/g, ''))}`} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-colors"><MessageCircle className="h-4 w-4" /></a>}
                {!cfg.facebook_url && !cfg.twitter_url && !cfg.instagram_url && !cfg.whatsapp_number && (
                  <>
                    <span className="text-white/15"><Facebook className="h-4 w-4" /></span>
                    <span className="text-white/15"><Twitter className="h-4 w-4" /></span>
                    <span className="text-white/15"><Instagram className="h-4 w-4" /></span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="border-t border-white/8 mt-10 pt-6 text-center">
            <p className="text-[11px] text-white/25">© {new Date().getFullYear()} {agency.name}. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StorefrontLayout;
