import { Outlet, useParams, useLocation, Link } from 'react-router-dom';
import { useAgencyBySlug } from '@/hooks/use-agencies';
import { useFavicon } from '@/hooks/use-favicon';
import { Mail, MapPin, Facebook, Twitter, Instagram, MessageCircle, Share2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { getShareUrl } from '@/lib/share-url';
import { getTemplateStyles } from '@/lib/template-styles';
import { toast } from 'sonner';

const StorefrontLayout = () => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const { data: agency, isLoading } = useAgencyBySlug(slug ?? '');

  const pathParts = location.pathname.split('/');
  const currentPage = pathParts[pathParts.length - 1] || 'home';
  const page = ['fleet', 'contact', 'about'].includes(currentPage) ? currentPage : 'home';

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

  // Font class mapping
  const fontClass = cfg.font === 'serif' ? 'font-serif' : cfg.font === 'modern' ? 'font-sans tracking-tight' : 'font-sans';

  // Build styles with color overrides from config
  const headerStyle: React.CSSProperties = {
    ...(ts.headerStyle ?? {}),
    ...(cfg.nav_bg_color ? { backgroundColor: cfg.nav_bg_color } : {}),
    ...(cfg.nav_text_color ? { color: cfg.nav_text_color } : {}),
  };
  const footerStyle: React.CSSProperties = {
    ...(ts.footerStyle ?? {}),
    ...(cfg.footer_bg_color ? { backgroundColor: cfg.footer_bg_color } : {}),
    ...(cfg.footer_text_color ? { color: cfg.footer_text_color } : {}),
  };
  const bodyStyle: React.CSSProperties = bgColor ? { backgroundColor: bgColor } : (ts.bodyStyle ?? {});

  return (
    <div className={`min-h-screen ${fontClass} ${!bgColor ? ts.bodyClass : ''}`} style={bodyStyle}>

      {/* Navigation — Blacklane-style clean white */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100" style={cfg.nav_bg_color ? { backgroundColor: cfg.nav_bg_color, borderColor: 'transparent' } : undefined}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to={`/agency/${slug}`} className="flex items-center gap-3">
              {agency.logo_url ? (
                <img src={agency.logo_url} alt={`${agency.name} logo`} className="h-10 w-auto object-contain" />
              ) : (
                <span className="text-xl font-bold tracking-tight text-gray-900" style={cfg.nav_text_color ? { color: cfg.nav_text_color } : undefined}>
                  {agency.name.toUpperCase()}
                </span>
              )}
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link to={`/agency/${slug}`} className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors" style={cfg.nav_text_color ? { color: cfg.nav_text_color } : undefined}>Home</Link>
              <Link to={`/agency/${slug}/services`} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Services</Link>
              <Link to={`/agency/${slug}/contact`} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Contact</Link>
              <Link to={`/agency/${slug}/about`} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">About us</Link>
            </nav>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleShare} className="h-9 w-9 text-gray-500 hover:text-gray-900" title="Share this page">
                <Share2 className="h-4 w-4" />
              </Button>
              <Link to={`/agency/${slug}`} className="text-sm font-medium px-5 py-2 rounded-full border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <Outlet context={{ agency, templateStyles: ts, buttonColor: btnColor, config: cfg }} />

      {/* Footer */}
      <footer className={ts.footerClass} style={footerStyle}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-3">{agency.name}</h3>
              <p className="text-sm opacity-60 leading-relaxed mb-4">
                Your trusted partner for premium car rentals and travel services in {agency.city}, {agency.country}.
              </p>
              <div className="flex items-center gap-4">
                {cfg.facebook_url && <a href={cfg.facebook_url} target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 transition-opacity"><Facebook className="h-5 w-5" /></a>}
                {cfg.twitter_url && <a href={cfg.twitter_url} target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 transition-opacity"><Twitter className="h-5 w-5" /></a>}
                {cfg.instagram_url && <a href={cfg.instagram_url} target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 transition-opacity"><Instagram className="h-5 w-5" /></a>}
                {cfg.whatsapp_number && <a href={`https://wa.me/${encodeURIComponent(cfg.whatsapp_number.replace(/[^0-9+]/g, ''))}`} target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 transition-opacity"><MessageCircle className="h-5 w-5" /></a>}
                {!cfg.facebook_url && !cfg.twitter_url && !cfg.instagram_url && !cfg.whatsapp_number && (
                  <>
                    <span className="opacity-30"><Facebook className="h-5 w-5" /></span>
                    <span className="opacity-30"><Twitter className="h-5 w-5" /></span>
                    <span className="opacity-30"><Instagram className="h-5 w-5" /></span>
                  </>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm opacity-60">
                <li><Link to={`/agency/${slug}/services`} className="hover:opacity-100 transition-opacity">Our Services</Link></li>
                <li><a href="#" className="hover:opacity-100 transition-opacity">Special Offers</a></li>
                <li><a href="#" className="hover:opacity-100 transition-opacity">Terms & Conditions</a></li>
                <li><a href="#" className="hover:opacity-100 transition-opacity">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Contact</h4>
              <ul className="space-y-2 text-sm opacity-60">
                <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> {agency.contact_email}</li>
                <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {agency.city}, {agency.country}</li>
              </ul>
              {agency.domain && (
                <p className="text-xs opacity-40 mt-4">🌐 {agency.domain}</p>
              )}
            </div>
          </div>
          <div className="border-t border-current/10 mt-10 pt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {agency.logo_url ? (
                <img src={agency.logo_url} alt={`${agency.name} logo`} className="h-8 w-8 rounded object-contain" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded bg-accent text-accent-foreground font-bold text-xs">
                  {agency.name.charAt(0)}
                </div>
              )}
              <span className="text-sm font-semibold">{agency.name}</span>
            </div>
            <p className="text-xs opacity-50">© {new Date().getFullYear()} {agency.name}. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StorefrontLayout;
