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
} from 'lucide-react';

interface AppSidebarProps {
  onNavigate?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ onNavigate }) => {
  const { activeView, navigateTo, language, scopedOrders, scopedInventory, currentUser, logout } = useRestaurant();
  const t = useTranslation(language);

  const handleNav = (view: AppView) => {
    navigateTo(view);
    if (onNavigate) {
      onNavigate();
    }
  };

  const mainNavItems: { id: AppView; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'restaurants', label: language === 'fr' ? 'Mes restaurants' : 'My Restaurants', icon: Store },
    { id: 'subscription', label: language === 'fr' ? 'Abonnement & Factures' : 'Subscription & Billing', icon: CreditCard },
    { id: 'pos', label: t.nav.pos, icon: ShoppingBag },
    { id: 'orders', label: t.nav.orders, icon: Clock, badge: scopedOrders.filter((o) => o.status === 'preparing' || o.status === 'confirmed').length },
    { id: 'menu', label: t.nav.menu, icon: BookOpen },
    { id: 'tables', label: t.nav.tables, icon: LayoutGrid },
    { id: 'kitchen', label: t.nav.kitchen, icon: ChefHat, badge: scopedOrders.filter((o) => o.status === 'preparing').length },
    { id: 'reservations', label: t.nav.reservations, icon: CalendarDays },
    { id: 'inventory', label: t.nav.inventory, icon: Boxes, badge: scopedInventory.filter((i) => i.currentStock <= i.minThreshold).length },
    { id: 'recipes', label: t.nav.recipes, icon: Scroll },
    { id: 'customers', label: t.nav.customers, icon: Users },
    { id: 'staff', label: t.nav.staff, icon: ShieldCheck },
    { id: 'reports', label: t.nav.reports, icon: BarChart3 },
    { id: 'ai', label: t.nav.aiAssistant, icon: Sparkles },
    { id: 'settings', label: t.nav.settings, icon: Settings },
  ];

  const adminNavItems: { id: AppView; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'superadmin', label: t.nav.superAdmin, icon: Building2 },
    { id: 'database_schema', label: t.nav.database, icon: Database },
  ];

  return (
    <aside className="w-64 bg-[#0B192C] text-slate-300 flex flex-col shrink-0 h-screen sticky top-0 border-r border-slate-800 select-none z-40">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80">
        <button
          onClick={() => handleNav('dashboard')}
          className="flex items-center gap-2.5 text-left cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center font-bold text-slate-950 text-base shadow-xs">
            R
          </div>
          <div>
            <div className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              <span>RestaurantOS</span>
            </div>
            <div className="text-[10px] text-amber-400 font-medium tracking-wide uppercase">
              DATA WORK AGENCY
            </div>
          </div>
        </button>
      </div>

      {/* Main Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          {language === 'fr' ? 'Gestion Restaurant' : 'Restaurant Suite'}
        </div>

        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-500/15 text-amber-400 font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-3 px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          {language === 'fr' ? 'Plateforme & Cloud' : 'Platform & Backend'}
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
                  ? 'bg-amber-500/15 text-amber-400 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}

        <div className="pt-3 px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          {language === 'fr' ? 'Liens Publics' : 'External & Public'}
        </div>

        <button
          onClick={() => handleNav('marketing')}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <ExternalLink className="w-4 h-4 text-slate-500" />
            <span className="truncate">{t.nav.website}</span>
          </div>
        </button>

        <button
          onClick={() => handleNav('public_menu')}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span className="truncate">{language === 'fr' ? 'Menu Restaurant (QR)' : 'Public QR Menu'}</span>
          </div>
        </button>

        <button
          onClick={() => handleNav('qr_ordering')}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <QrCode className="w-4 h-4 text-amber-500" />
            <span className="truncate">{t.nav.qrMenuDemo}</span>
          </div>
        </button>
      </div>

      {/* User Session Footer Card */}
      <div className="p-3 border-t border-slate-800 bg-[#07111E]">
        <div className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg">
          <button
            onClick={() => handleNav('profile')}
            className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-full bg-slate-700 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors flex items-center justify-center text-xs font-bold text-amber-400 shrink-0">
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
