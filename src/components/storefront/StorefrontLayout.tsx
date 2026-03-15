import { Outlet, useParams, Link } from 'react-router-dom';
import { useAgencyBySlug } from '@/hooks/use-agencies';
import { Mail, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const StorefrontLayout = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: agency, isLoading } = useAgencyBySlug(slug ?? '');

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

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to={`/agency/${slug}`} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                {agency.name.charAt(0)}
              </div>
              <div>
                <span className="text-lg font-bold text-foreground tracking-tight">{agency.name}</span>
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] -mt-0.5">
                  {agency.city} - {agency.country}
                </p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link to={`/agency/${slug}`} className="text-sm font-medium text-foreground hover:text-accent transition-colors">Home</Link>
              <Link to={`/agency/${slug}/fleet`} className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors">Services</Link>
              <Link to={`/agency/${slug}/contact`} className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors">Contact</Link>
              <Link to={`/agency/${slug}/about`} className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors">About us</Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link to={`/agency/${slug}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Register</Link>
              <Link to={`/agency/${slug}`} className="text-sm font-medium bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">Sign in</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <Outlet context={{ agency }} />

      {/* Footer */}
      <footer className="bg-card border-t border-border text-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-3">{agency.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Your trusted partner for premium car rentals and travel services in {agency.city}, {agency.country}.
              </p>
              <div className="flex items-center gap-4">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Facebook className="h-5 w-5" /></a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Twitter className="h-5 w-5" /></a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Instagram className="h-5 w-5" /></a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Youtube className="h-5 w-5" /></a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to={`/agency/${slug}/fleet`} className="hover:text-foreground transition-colors">Our Fleet</Link></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Special Offers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms & Conditions</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Contact</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> {agency.contact_email}</li>
                <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {agency.city}, {agency.country}</li>
              </ul>
              {agency.domain && (
                <p className="text-xs text-muted-foreground/60 mt-4">🌐 {agency.domain}</p>
              )}
            </div>
          </div>
          <div className="border-t border-border mt-10 pt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-accent text-accent-foreground font-bold text-xs">
                {agency.name.charAt(0)}
              </div>
              <span className="text-sm font-semibold">{agency.name}</span>
            </div>
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} {agency.name}. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StorefrontLayout;
