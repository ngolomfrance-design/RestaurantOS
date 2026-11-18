import React from 'react';
import { useRestaurant, AppView } from '../../context/RestaurantContext';
import { useTranslation } from '../../translations';
import {
  LayoutDashboard,
  Store,
  ShoppingBag,
  Clock,
  BookOpen,
  LayoutGrid,
  ChefHat,
  CalendarDays,
  Boxes,
  Scroll,
  Users,
  ShieldCheck,
  BarChart3,
  Sparkles,
  Settings,
  Database,
  Building2,
  ExternalLink,
  QrCode,
  LogOut,
  User,
  CreditCard,
  Star,
  Camera,
} from 'lucide-react';

interface AppSidebarProps {
  onNavigate?: () => void;
  isMobileDrawer?: boolean;
}

interface NavItemConfig {
  id: AppView;
  label: string;
  icon: React.FC<{ className?: string }>;
  badge?: number;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ onNavigate, isMobileDrawer = false }) => {
  const { activeView, navigateTo, language, scopedOrders, scopedInventory, currentUser, logout } = useRestaurant();
  const t = useTranslation(language);

  const handleNav = (view: AppView) => {
    navigateTo(view);
    if (onNavigate) {
      onNavigate();
    }
  };

  const navGroups: { titleFr: string; titleEn: string; items: NavItemConfig[] }[] = [
    {
      titleFr: 'Pilotage & IA',
      titleEn: 'Analytics & AI',
      items: [
        { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
        { id: 'reports', label: language === 'fr' ? 'Rapports & Clôture Z' : 'Reports & Z-Close', icon: BarChart3 },
        { id: 'ai', label: t.nav.aiAssistant, icon: Sparkles },
      ],
    },
    {
      titleFr: 'Service & Salle',
      titleEn: 'Operations & Floor',
      items: [
        { id: 'pos', label: t.nav.pos, icon: ShoppingBag },
        { id: 'orders', label: t.nav.orders, icon: Clock, badge: scopedOrders.filter((o) => o.status === 'preparing' || o.status === 'confirmed').length },
        { id: 'kitchen', label: t.nav.kitchen, icon: ChefHat, badge: scopedOrders.filter((o) => o.status === 'preparing').length },
        { id: 'tables', label: t.nav.tables, icon: LayoutGrid },
        { id: 'reservations', label: t.nav.reservations, icon: CalendarDays },
      ],
    },
    {
      titleFr: 'Carte & Économat',
      titleEn: 'Menu & Inventory',
      items: [
        { id: 'menu', label: t.nav.menu, icon: BookOpen },
        { id: 'inventory', label: t.nav.inventory, icon: Boxes, badge: scopedInventory.filter((i) => i.currentStock <= i.minThreshold).length },
        { id: 'recipes', label: t.nav.recipes, icon: Scroll },
      ],
    },
    {
      titleFr: 'Clientèle & Établissement',
      titleEn: 'Guests & Organization',
      items: [
        { id: 'customers', label: t.nav.customers, icon: Users },
        { id: 'reviews', label: language === 'fr' ? 'Avis & Modération' : 'Reviews & Notes', icon: Star },
        { id: 'staff', label: t.nav.staff, icon: ShieldCheck },
        { id: 'restaurants', label: language === 'fr' ? 'Mes restaurants' : 'My Restaurants', icon: Store },
        { id: 'profile', label: language === 'fr' ? 'Profil & Vitrine' : 'Profile & Showcase', icon: Camera },
        { id: 'subscription', label: language === 'fr' ? 'Abonnement & Factures' : 'Subscription & Billing', icon: CreditCard },
        { id: 'settings', label: t.nav.settings, icon: Settings },
      ],
    },
  ];

  // Role-based navigation filtering
  const userRole = currentUser.role || 'owner';
  const isItemAllowed = (id: AppView): boolean => {
    if (userRole === 'platform_admin' || userRole === 'owner') return true;
    if (userRole === 'manager') return id !== 'subscription';
    if (userRole === 'cashier') return ['pos', 'orders', 'tables', 'customers', 'reports'].includes(id);
    if (userRole === 'server') return ['pos', 'orders', 'tables'].includes(id);
    if (userRole === 'kitchen') return ['kitchen', 'orders'].includes(id);
    if (userRole === 'inventory') return ['inventory', 'recipes', 'orders'].includes(id);
    return true;
  };

  const adminNavItems: { id: AppView; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'superadmin', label: t.nav.superAdmin, icon: Building2 },
    { id: 'database_schema', label: t.nav.database, icon: Database },
  ];

  const showAdminSection = userRole === 'platform_admin' || currentUser.email === 'dataworkagency0@gmail.com';

  return (
    <aside
      className={`w-64 bg-[#0B192C] text-slate-300 flex flex-col shrink-0 border-r border-slate-800/90 select-none z-40 ${
        isMobileDrawer ? 'flex-1 min-h-0 h-full' : 'h-screen sticky top-0'
      }`}
    >
      {/* Brand Header */}
      {!isMobileDrawer && (
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80 shrink-0">
          <button
            onClick={() => handleNav('dashboard')}
            className="flex items-center gap-2.5 text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-slate-950 text-base shadow-xs">
              R
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                <span>RestaurantOS</span>
              </div>
              <div className="text-[10px] text-amber-400 font-semibold tracking-wider uppercase">
                DATA WORK AGENCY
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Main Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
        {navGroups.map((group) => {
          const allowedItems = group.items.filter((item) => isItemAllowed(item.id));
          if (allowedItems.length === 0) return null;

          return (
            <div key={group.titleEn} className="space-y-0.5">
              <div className="px-3 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                {language === 'fr' ? group.titleFr : group.titleEn}
              </div>

              {allowedItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-400 font-semibold border border-amber-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded shrink-0 ${
                          isActive ? 'bg-amber-500/25 text-amber-300' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}

        {showAdminSection && (
          <div className="space-y-0.5 pt-1 border-t border-slate-800/70">
            <div className="pt-2 px-3 py-1 text-[10px] font-semibold text-amber-400/80 uppercase tracking-wider">
              {language === 'fr' ? 'Console DATA WORK' : 'Platform & Backend'}
            </div>

            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-400 font-semibold border border-amber-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="space-y-0.5 pt-1 border-t border-slate-800/70">
          <div className="pt-2 px-3 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            {language === 'fr' ? 'Portail Public Client' : 'Public Guest Portal'}
          </div>

          <button
            onClick={() => handleNav('marketing')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <ExternalLink className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="truncate">{t.nav.website}</span>
            </div>
          </button>

          <button
            onClick={() => handleNav('public_menu')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <QrCode className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">{language === 'fr' ? 'Menu Restaurant (QR)' : 'Public QR Menu'}</span>
            </div>
          </button>

          <button
            onClick={() => handleNav('qr_ordering')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <QrCode className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="truncate">{t.nav.qrMenuDemo}</span>
            </div>
          </button>
        </div>
      </div>

      {/* User Session Footer Card */}
      <div className="p-3 border-t border-slate-800 bg-[#07111E] shrink-0">
        <div className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg">
          <button
            onClick={() => handleNav('user_profile')}
            className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer group"
            title={language === 'fr' ? 'Mon profil personnel' : 'My personal profile'}
          >
            <div className="w-7 h-7 rounded-lg bg-slate-700 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors flex items-center justify-center text-xs font-bold text-amber-400 shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate group-hover:text-amber-400 transition-colors">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-400 capitalize truncate">
                {currentUser.role}
              </div>
            </div>
          </button>
          <button
            onClick={logout}
            title={language === 'fr' ? 'Se déconnecter' : 'Sign out'}
            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
