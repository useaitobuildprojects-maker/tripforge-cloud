import { Outlet, useParams, Navigate } from 'react-router-dom';
import { Bell, Search, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAgencyAdmin } from '@/hooks/use-agency-admin';
import AgencyAdminSidebar from './AgencyAdminSidebar';
import { Skeleton } from '@/components/ui/skeleton';

const AgencyAdminLayout = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, loading: authLoading } = useAuth();
  const { data: agency, isLoading } = useAgencyAdmin(slug ?? '');

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
      <main className="ml-[270px] min-h-screen">
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-border bg-card/95 backdrop-blur-lg px-8">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-accent" />
              <input
                type="text"
                placeholder="Search bookings, customers..."
                className="h-10 w-72 rounded-xl border border-border bg-background/80 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all duration-200"
              />
            </div>
          </div>
          <div className="flex items-center gap-5">
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background/80 text-muted-foreground hover:text-foreground hover:border-accent/25 hover:bg-card transition-all duration-200">
              <Bell className="h-[18px] w-[18px]" />
            </button>
            <div className="h-8 w-px bg-border" />
            <button className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-secondary/60 transition-colors duration-200 -mr-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-accent text-[11px] font-bold text-accent-foreground shadow-sm">
                {agency.name.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-[13px] font-semibold text-foreground leading-none">{agency.name}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{agency.city}, {agency.country}</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-1 hidden sm:block" />
            </button>
          </div>
        </header>
        <div className="p-8 lg:p-10">
          <Outlet context={{ agency }} />
        </div>
      </main>
    </div>
  );
};

export default AgencyAdminLayout;
