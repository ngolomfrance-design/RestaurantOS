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
import { RestaurantProfileView } from './components/profile/RestaurantProfileView';
import { ReviewsManagement } from './components/reviews/ReviewsManagement';
import { SubscriptionBillingView } from './components/subscription/SubscriptionBillingView';
import { PublicRestaurantMenuView } from './components/qrmenu/PublicRestaurantMenuView';
import { Menu, X, Clock, AlertTriangle, Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeOrganization, activeView, navigateTo, currentUser, extendTrialDays, language } = useRestaurant();
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

  // Trial calculations
  const now = Date.now();
  const trialEndMs = activeOrganization?.trialEndsAt ? new Date(activeOrganization.trialEndsAt).getTime() : now;
  const msRemaining = trialEndMs - now;
  const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
  const isTrial = activeOrganization?.subscriptionStatus === 'trial';
  const isTrialExpired = activeOrganization?.subscriptionStatus === 'expired' || (isTrial && msRemaining <= 0);

  // Role permissions gate
  const userRole = currentUser.role || 'owner';
  const isOwnerOrAdmin = userRole === 'owner' || userRole === 'platform_admin';
  const isPlatformAdmin = userRole === 'platform_admin' || currentUser.email === 'dataworkagency0@gmail.com';

  // Core Multi-Tenant RestaurantOS Application Workspace
  const renderWorkspaceView = () => {
    // Permission checks
    if (activeView === 'superadmin' && !isPlatformAdmin) {
      return (
        <div className="p-8 max-w-lg mx-auto text-center space-y-4 my-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Accès Réservé à DATA WORK AGENCY</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            La console Super-Admin est strictement réservée aux administrateurs de la plateforme.
          </p>
          <button
            onClick={() => navigateTo('dashboard')}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            Retourner au tableau de bord
          </button>
        </div>
      );
    }

    if (activeView === 'subscription' && !isOwnerOrAdmin) {
      return (
        <div className="p-8 max-w-lg mx-auto text-center space-y-4 my-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Accès Restreint</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Seul le propriétaire de l’établissement ou un administrateur peut gérer la formule et les factures.
          </p>
          <button
            onClick={() => navigateTo('pos')}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            Aller à la caisse POS
          </button>
        </div>
      );
    }

    switch (activeView) {
      case 'dashboard':
        return <MainDashboard />;
      case 'restaurants':
        return <RestaurantsManagement />;
      case 'profile':
        return <RestaurantProfileView />;
      case 'user_profile':
        return <UserProfileView />;
      case 'reviews':
        return <ReviewsManagement />;
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
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Desktop App Sidebar */}
      <div className="hidden md:flex">
        <AppSidebar />
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 md:hidden flex"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-64 h-full bg-[#0B192C] flex flex-col border-r border-slate-800 shadow-2xl"
          >
            <div className="h-14 px-4 flex items-center justify-between border-b border-slate-800/80 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-slate-950 text-sm">
                  R
                </div>
                <div>
                  <div className="font-bold text-xs text-white leading-tight">RestaurantOS</div>
                  <div className="text-[9px] text-amber-400 font-semibold uppercase tracking-wider">DATA WORK AGENCY</div>
                </div>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Fermer le menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <AppSidebar onNavigate={() => setMobileSidebarOpen(false)} isMobileDrawer />
          </div>
        </div>
      )}

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <AppNavbar onOpenMobileMenu={() => setMobileSidebarOpen(true)} />

        {/* 7-DAY FREE TRIAL NOTIFICATION BANNER */}
        {isTrial && !isTrialExpired && (
          <div className="bg-[#0B192C] border-b border-amber-500/30 text-slate-200 px-3 sm:px-4 py-1.5 flex items-center justify-between gap-2 text-[11px] sm:text-xs shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">
                <strong className="text-white">Essai gratuit :</strong>{' '}
                <strong className="text-amber-400 font-mono tabular-nums">{daysRemaining} jour(s)</strong> restants
                <span className="hidden sm:inline"> pour tester toutes les fonctionnalités sans engagement.</span>
              </span>
            </div>
            <button
              onClick={() => navigateTo('subscription')}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-md transition-colors shadow-2xs flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Activer</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* TRIAL EXPIRED NOTIFICATION BANNER */}
        {isTrialExpired && (
          <div className="bg-rose-950 border-b border-rose-800 text-rose-100 px-3 sm:px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong className="text-white font-bold">Votre période d'essai de 7 jours est arrivée à échéance.</strong> Choisissez votre formule (Orange Money, MTN MoMo, Carte) pour pérenniser l’encaissement et la gestion de votre restaurant.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isPlatformAdmin && (
                <button
                  onClick={() => extendTrialDays(activeOrganization.id, 7)}
                  className="px-2.5 py-1 bg-rose-900 hover:bg-rose-800 text-rose-200 font-semibold rounded-md border border-rose-700 transition-colors cursor-pointer"
                  title="Prolonger l'essai de 7 jours (SuperAdmin)"
                >
                  +7 jours admin
                </button>
              )}
              <button
                onClick={() => navigateTo('subscription')}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-md transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
              >
                <span>Régulariser mon abonnement</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Main View Area */}
        <main className="flex-1 overflow-y-auto bg-slate-100/60 dark:bg-slate-950">
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
