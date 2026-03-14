import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { Bell, Search, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AdminLayout = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="ml-[270px] min-h-screen">
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-border bg-card/95 backdrop-blur-lg px-8">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-accent" />
              <input
                type="text"
                placeholder="Search anything..."
                className="h-10 w-72 rounded-xl border border-border bg-background/80 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/40 transition-all duration-200"
              />
            </div>
          </div>
          <div className="flex items-center gap-5">
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background/80 text-muted-foreground hover:text-foreground hover:border-accent/25 hover:bg-card transition-all duration-200">
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute -top-1 -right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full gradient-accent text-[8px] font-bold text-accent-foreground shadow-sm">
                3
              </span>
            </button>
            <div className="h-8 w-px bg-border" />
            <button className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-secondary/60 transition-colors duration-200 -mr-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-accent text-[11px] font-bold text-accent-foreground shadow-sm">
                {user?.email?.charAt(0).toUpperCase() ?? 'SA'}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-[13px] font-semibold text-foreground leading-none">Super Admin</p>
                <p className="text-[10px] text-muted-foreground mt-1">{user?.email ?? ''}</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground ml-1 hidden sm:block" />
            </button>
          </div>
        </header>
        <div className="p-8 lg:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
