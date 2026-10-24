import React, { useState } from 'react';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext';
import { AppNavbar } from './components/layout/AppNavbar';
import { AppSidebar } from './components/layout/AppSidebar';
import { AppFooter } from './components/layout/AppFooter';
import { MainDashboard } from './components/dashboard/MainDashboard';
import { PointOfSale } from './components/pos/PointOfSale';
import { KitchenDisplay } from './components/kitchen/KitchenDisplay';
import { TableManagement } from './components/tables/TableManagement';
import { MenuManagement } from './components/menu/MenuManagement';
import { InventoryManagement } from './components/inventory/InventoryManagement';
import { RecipeManagement } from './components/recipes/RecipeManagement';
import { ReservationManagement } from './components/reservations/ReservationManagement';
import { CustomerManagement } from './components/customers/CustomerManagement';
import { StaffManagement } from './components/staff/StaffManagement';
import { ReportsCenter } from './components/reports/ReportsCenter';
import { RestaurantAIAssistant } from './components/ai/RestaurantAIAssistant';
import { SettingsView } from './components/settings/SettingsView';
import { SuperAdminPanel } from './components/superadmin/SuperAdminPanel';
import { SupabaseSchemaModal } from './components/supabase/SupabaseSchemaModal';
import { OrdersView } from './components/orders/OrdersView';
import { CustomerQrOrderView } from './components/qrmenu/CustomerQrOrderView';
import { OnboardingWizard } from './components/onboarding/OnboardingWizard';
import { MarketingWebsite } from './components/marketing/MarketingWebsite';
import { AuthPage } from './components/auth/AuthPage';
import { RestaurantsManagement } from './components/restaurants/RestaurantsManagement';
import { UserProfileView } from './components/profile/UserProfileView';
import { SubscriptionBillingView } from './components/subscription/SubscriptionBillingView';
import { PublicRestaurantMenuView } from './components/qrmenu/PublicRestaurantMenuView';
import { Menu, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeView } = useRestaurant();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Standalone full-screen pages
  if (activeView === 'marketing') {
    return <MarketingWebsite />;
  }

  if (activeView === 'login') {
    return <AuthPage initialMode="login" />;
  }

  if (activeView === 'register') {
    return <AuthPage initialMode="register" />;
  }

  if (activeView === 'onboarding') {
    return <OnboardingWizard />;
  }

  if (activeView === 'qr_ordering') {
    return <CustomerQrOrderView />;
  }

  if (activeView === 'public_menu') {
    return <PublicRestaurantMenuView />;
  }

  // Core Multi-Tenant RestaurantOS Application Workspace
  const renderWorkspaceView = () => {
    switch (activeView) {
      case 'dashboard':
        return <MainDashboard />;
      case 'restaurants':
        return <RestaurantsManagement />;
      case 'profile':
        return <UserProfileView />;
      case 'subscription':
        return <SubscriptionBillingView />;
      case 'pos':
        return <PointOfSale />;
      case 'orders':
        return <OrdersView />;
      case 'menu':
        return <MenuManagement />;
      case 'tables':
        return <TableManagement />;
      case 'kitchen':
        return <KitchenDisplay />;
      case 'reservations':
        return <ReservationManagement />;
      case 'inventory':
        return <InventoryManagement />;
      case 'recipes':
        return <RecipeManagement />;
      case 'customers':
        return <CustomerManagement />;
      case 'staff':
        return <StaffManagement />;
      case 'reports':
        return <ReportsCenter />;
      case 'ai':
        return <RestaurantAIAssistant />;
      case 'settings':
        return <SettingsView />;
      case 'superadmin':
        return <SuperAdminPanel />;
      case 'database_schema':
        return <SupabaseSchemaModal />;
      default:
        return <MainDashboard />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Desktop App Sidebar */}
      <div className="hidden md:flex">
        <AppSidebar />
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 md:hidden"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-64 h-full bg-[#0B192C]"
          >
            <div className="p-3 flex justify-end">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <AppSidebar onNavigate={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Mobile menu trigger in top bar */}
        <div className="md:hidden bg-slate-950 text-white p-2 flex items-center justify-between px-4 border-b border-slate-800">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-1.5 text-slate-300 hover:text-white flex items-center gap-2 text-xs font-semibold"
          >
            <Menu className="w-5 h-5" />
            <span>RestaurantOS Menu</span>
          </button>
        </div>

        <AppNavbar />

        {/* Scrollable Main View Area */}
        <main className="flex-1 overflow-y-auto bg-slate-100/60">
          {renderWorkspaceView()}
        </main>

        <AppFooter />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <RestaurantProvider>
      <AppContent />
    </RestaurantProvider>
  );
}
