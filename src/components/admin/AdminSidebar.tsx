import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Globe,
  Settings,
  Users,
  BarChart3,
  Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/agencies', icon: Building2, label: 'Agencies' },
  { to: '/bookings', icon: Globe, label: 'Bookings' },
  { to: '/users', icon: Users, label: 'Users' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col gradient-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-[72px] items-center gap-3 px-6 border-b border-sidebar-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-accent">
          <Crown className="h-5 w-5 text-accent-foreground" />
        </div>
        <div>
          <h1 className="text-[15px] font-display font-bold text-sidebar-accent-foreground tracking-wide">
            TravelHub
          </h1>
          <p className="text-[9px] font-semibold text-sidebar-primary uppercase tracking-[0.2em]">
            Super Admin
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        <p className="text-[9px] font-bold text-sidebar-foreground uppercase tracking-[0.2em] px-3 mb-3">
          Menu
        </p>
        {navItems.map((item) => {
          const isActive =
            item.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-200',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary border-l-2 border-sidebar-primary'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full gradient-accent text-[11px] font-bold text-accent-foreground">
            SA
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-sidebar-accent-foreground truncate">
              Super Admin
            </p>
            <p className="text-[10px] text-sidebar-foreground truncate">
              admin@travelhub.io
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
