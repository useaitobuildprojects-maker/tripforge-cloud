import { NavLink, useLocation, useParams } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Settings,
  Car,
  LogOut,
  ChevronRight,
  BarChart3,
  Users,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Agency } from '@/types/agency';

interface AgencyAdminSidebarProps {
  agency: Agency | null;
}

const AgencyAdminSidebar = ({ agency }: AgencyAdminSidebarProps) => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const base = `/agency/${slug}/admin`;

  const navItems = [
    { to: base, icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { to: `${base}/bookings`, icon: CalendarDays, label: 'Bookings' },
    { to: `${base}/drivers`, icon: Users, label: 'Drivers' },
    { to: `${base}/vehicles`, icon: Car, label: 'Vehicles' },
    { to: `${base}/analytics`, icon: BarChart3, label: 'Analytics' },
    { to: `${base}/settings`, icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col bg-card border-r border-border">
      {/* Agency Branding */}
      <div className="flex h-[68px] items-center gap-3 px-6">
        {agency?.logo_url ? (
          <img src={agency.logo_url} alt={agency.name} className="h-9 w-9 rounded-lg object-cover" />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            {agency?.name?.charAt(0) ?? 'A'}
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-foreground leading-none truncate">
            {agency?.name ?? 'Agency'}
          </h1>
          <p className="text-[10px] text-muted-foreground mt-1">
            Admin Panel
          </p>
        </div>
      </div>

      <div className="mx-5 h-px bg-border" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
          Management
        </p>
        {navItems.map((item) => {
          const isActive = item.exact
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <item.icon className="h-[17px] w-[17px] shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="h-3.5 w-3.5 opacity-50" />}
            </NavLink>
          );
        })}
      </nav>

      {/* Storefront Link */}
      <div className="px-3 pb-2">
        <NavLink
          to={`/agency/${slug}`}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <ExternalLink className="h-[17px] w-[17px] shrink-0" />
          <span className="flex-1">View Storefront</span>
        </NavLink>
      </div>

      {/* Footer */}
      <div className="mx-5 h-px bg-border" />
      <div className="p-4 px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground text-[11px] font-bold">
            {user?.email?.charAt(0).toUpperCase() ?? 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-foreground truncate leading-none">
              {user?.user_metadata?.full_name || 'Admin'}
            </p>
            <p className="text-[10px] text-muted-foreground truncate mt-1">
              {user?.email ?? ''}
            </p>
          </div>
          <button
            onClick={signOut}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AgencyAdminSidebar;
