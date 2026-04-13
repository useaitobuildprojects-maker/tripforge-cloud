import { Outlet, useParams, useLocation, Link } from 'react-router-dom';
import { useAgencyBySlug } from '@/hooks/use-agencies';
import { useFavicon } from '@/hooks/use-favicon';
import { Mail, MapPin, Facebook, Twitter, Instagram, Share2, Menu, X, Phone, Globe, ChevronDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
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
  const btnColor = agency.button_color ?? '#000000';
  const bgColor = agency.background_color ?? undefined;
  const cfg = agency.storefront_config ?? {};
  const fontClass = 'font-sans';
  const bodyStyle: React.CSSProperties = bgColor ? { backgroundColor: bgColor } : (ts.bodyStyle ?? {});

  const navLinks = [
    { label: 'Home', to: `/agency/${slug}` },
    { label: 'Services', to: `/agency/${slug}/services` },
    { label: 'About', to: `/agency/${slug}/about` },
    { label: 'Contact', to: `/agency/${slug}/contact` },
  ];

  return (
    <div className={`min-h-screen bg-white ${fontClass}`} style={bodyStyle}>
      {/* ═══ Uber-style black header ═══ */}
      <header className="sticky top-0 z-50 bg-black">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[64px]">
            {/* Logo */}
            <Link to={`/agency/${slug}`} className="flex items-center gap-2 shrink-0">
              {agency.logo_url ? (
                <img src={agency.logo_url} alt={`${agency.name} logo`} className="h-7 w-auto object-contain brightness-0 invert" />
              ) : (
                <span className="text-xl font-bold tracking-tight text-white">
                  {agency.name}
                </span>
              )}
            </Link>

            {/* Center nav */}
            <nav className="hidden md:flex items-center gap-1 ml-10">
              {navLinks.map((link) => {
                const isActive = (link.label === 'Home' && page === 'home') || link.to.endsWith(page);
                return (
                  <Link
                    key={link.label}
                    to={link.to}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right actions */}
            <div className="hidden md:flex items-center gap-2 ml-auto">
              <button onClick={handleShare} className="h-9 px-4 rounded-full text-white/60 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium flex items-center gap-1.5">
                <Share2 className="h-3.5 w-3.5" /> Share
              </button>
              <Link
                to={`/agency/${slug}/contact`}
                className="h-9 px-5 rounded-full bg-white text-black text-sm font-medium flex items-center gap-1.5 hover:bg-gray-100 transition-colors"
              >
                Contact
              </Link>
            </div>

            {/* Mobile */}
            <button className="md:hidden p-2 text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-black border-t border-white/10 px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.label} to={link.to} className="block text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-white/5 text-white/70 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <Outlet context={{ agency, templateStyles: ts, buttonColor: btnColor, config: cfg }} />

      {/* ═══ Footer — Uber style ═══ */}
      <footer className="bg-black text-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-4">
              {agency.logo_url ? (
                <img src={agency.logo_url} alt="" className="h-8 w-auto object-contain mb-6 brightness-0 invert" />
              ) : (
                <h3 className="text-2xl font-bold mb-6">{agency.name}</h3>
              )}
              <p className="text-sm text-white/40 leading-relaxed mb-6 max-w-xs">
                {cfg.footer_text || `Your trusted travel partner in ${agency.city}. Premium services, professional team.`}
              </p>
              <div className="flex items-center gap-3">
                {[
                  { url: cfg.facebook_url, Icon: Facebook },
                  { url: cfg.twitter_url, Icon: Twitter },
                  { url: cfg.instagram_url, Icon: Instagram },
                ].map(({ url, Icon }, i) => (
                  url ? (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all"><Icon className="h-4 w-4" /></a>
                  ) : (
                    <span key={i} className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center text-white/15"><Icon className="h-4 w-4" /></span>
                  )
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <h4 className="text-sm font-bold mb-5">Company</h4>
              <ul className="space-y-3 text-sm text-white/40">
                <li><Link to={`/agency/${slug}/about`} className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to={`/agency/${slug}/services`} className="hover:text-white transition-colors">Services</Link></li>
                <li><Link to={`/agency/${slug}/fleet`} className="hover:text-white transition-colors">Our Fleet</Link></li>
              </ul>
            </div>
            <div className="md:col-span-3">
              <h4 className="text-sm font-bold mb-5">Support</h4>
              <ul className="space-y-3 text-sm text-white/40">
                <li><Link to={`/agency/${slug}/contact`} className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms & Privacy</a></li>
              </ul>
            </div>
            <div className="md:col-span-3">
              <h4 className="text-sm font-bold mb-5">Contact</h4>
              <ul className="space-y-3 text-sm text-white/40">
                <li className="flex items-center gap-2.5"><Mail className="h-4 w-4 shrink-0" /> {agency.contact_email}</li>
                <li className="flex items-center gap-2.5"><MapPin className="h-4 w-4 shrink-0" /> {agency.city}, {agency.country}</li>
                {cfg.phone && <li className="flex items-center gap-2.5"><Phone className="h-4 w-4 shrink-0" /> {cfg.phone}</li>}
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-14 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/30">© {new Date().getFullYear()} {agency.name}. All rights reserved.</p>
            <div className="flex items-center gap-2 text-xs text-white/30">
              <Globe className="h-3.5 w-3.5" /> {agency.country}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StorefrontLayout;
