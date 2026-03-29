import { Outlet, useParams, Navigate } from 'react-router-dom';
import { Bell, Search, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAgencyAdmin } from '@/hooks/use-agency-admin';
import { useFavicon } from '@/hooks/use-favicon';
import AgencyAdminSidebar from './AgencyAdminSidebar';
import { Skeleton } from '@/components/ui/skeleton';

const AgencyAdminLayout = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, loading: authLoading } = useAuth();
  const { data: agency, isLoading } = useAgencyAdmin(slug ?? '');

  // Hooks must be called before any early returns
  useFavicon(agency?.favicon_url);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!agency) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have access to this agency dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AgencyAdminSidebar agency={agency} />
      <main className="ml-[260px] min-h-screen">
        <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between border-b border-border bg-card px-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="h-9 w-64 rounded-lg border border-border bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              <Bell className="h-4 w-4" />
            </button>
            <div className="text-right hidden sm:block">
              <p className="text-[13px] font-medium text-foreground leading-none">{agency.name}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{agency.city}, {agency.country}</p>
            </div>
          </div>
        </header>
        <div className="p-6 lg:p-8">
          <Outlet context={{ agency }} />
        </div>
      </main>
    </div>
  );
};

export default AgencyAdminLayout;
