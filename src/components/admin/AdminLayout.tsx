import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="ml-64 min-h-screen">
        <header className="sticky top-0 z-30 flex h-14 items-center border-b border-border bg-card/80 backdrop-blur-sm px-8">
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-[11px] font-bold text-primary-foreground">
              SA
            </div>
          </div>
        </header>
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
