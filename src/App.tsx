import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import DomainRouter from "@/components/DomainRouter";
import AdminLayout from "./components/admin/AdminLayout";
import StorefrontLayout from "./components/storefront/StorefrontLayout";
import StorefrontHome from "./pages/storefront/StorefrontHome";
import AgencyAdminLayout from "./components/agency-admin/AgencyAdminLayout";
import AgencyAdminDashboard from "./pages/agency-admin/AgencyAdminDashboard";
import AgencyAdminBookings from "./pages/agency-admin/AgencyAdminBookings";
import AgencyAdminSettings from "./pages/agency-admin/AgencyAdminSettings";
import AgencyAdminDrivers from "./pages/agency-admin/AgencyAdminDrivers";
import AgencyAdminVehicles from "./pages/agency-admin/AgencyAdminVehicles";
import Dashboard from "./pages/Dashboard";
import Agencies from "./pages/Agencies";
import Bookings from "./pages/Bookings";
import Users from "./pages/Users";
import Analytics from "./pages/Analytics";
import ComingSoon from "./pages/ComingSoon";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <DomainRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route
                  element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/agencies" element={<Agencies />} />
                  <Route path="/bookings" element={<Bookings />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/settings" element={<ComingSoon title="Settings" />} />
                </Route>
                {/* Agency Admin Dashboard — isolated per agency */}
                <Route path="/agency/:slug/admin" element={<AgencyAdminLayout />}>
                  <Route index element={<AgencyAdminDashboard />} />
                  <Route path="bookings" element={<AgencyAdminBookings />} />
                  <Route path="drivers" element={<AgencyAdminDrivers />} />
                  <Route path="analytics" element={<ComingSoon title="Analytics" />} />
                  <Route path="settings" element={<AgencyAdminSettings />} />
                </Route>
                {/* Agency public storefronts */}
                <Route path="/agency/:slug" element={<StorefrontLayout />}>
                  <Route index element={<StorefrontHome />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </DomainRouter>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
