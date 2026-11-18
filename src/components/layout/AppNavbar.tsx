import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useTranslation } from '../../translations';
import {
  Globe,
  Store,
  ChevronDown,
  ShoppingBag,
  Bell,
  UserCheck,
  QrCode,
  ShieldAlert,
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  X,
  Plus,
  Settings,
  User,
  Building2,
  Sun,
  Moon,
  Monitor,
  Menu,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { UserRole } from '../../types/restaurant';

interface AppNavbarProps {
  onOpenMobileMenu?: () => void;
}

export const AppNavbar: React.FC<AppNavbarProps> = ({ onOpenMobileMenu }) => {
  const {
    state,
    language,
    setLanguage,
    theme,
    setTheme,
    effectiveTheme,
    activeOrganization,
    userOrganizations,
    switchOrganization,
    activeLocation,
    setActiveLocationId,
    currentUser,
    switchUserRole,
    navigateTo,
    openPublicStorefront,
    scopedInventory,
    scopedOrders,
  } = useRestaurant();
  const t = useTranslation(language);

  const [showRestaurantMenu, setShowRestaurantMenu] = useState(false);
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState<'pre' | 'dev' | null>(null);

  const roles: { role: UserRole; labelFr: string; labelEn: string }[] = [
    { role: 'owner', labelFr: 'Directeur Général (Owner)', labelEn: 'Owner (All Access)' },
    { role: 'manager', labelFr: 'Manager d’Exploitation', labelEn: 'Operations Manager' },
    { role: 'cashier', labelFr: 'Caissier Principal', labelEn: 'Cashier (POS & Sales)' },
    { role: 'server', labelFr: 'Chef de Rang / Serveur', labelEn: 'Server (Tables & Orders)' },
    { role: 'kitchen', labelFr: 'Chef de Cuisine (KDS)', labelEn: 'Kitchen Chef (KDS)' },
    { role: 'inventory', labelFr: 'Responsable Économat', labelEn: 'Inventory Manager' },
    { role: 'platform_admin', labelFr: 'Opérateur DATA WORK', labelEn: 'DATA WORK Platform Admin' },
  ];

  // Calculate live low stock count
  const lowStockCount = scopedInventory.filter((i) => i.currentStock <= i.minThreshold).length;

  return (
    <header className="h-14 md:h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-3 sm:px-4 md:px-6 flex items-center justify-between gap-2 sm:gap-4 shrink-0 z-30 sticky top-0 transition-colors">
      {/* Zone 1: Mobile Menu Trigger, Restaurant Selector & Location Selector */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 -ml-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
            aria-label={language === 'fr' ? 'Ouvrir le menu' : 'Open navigation menu'}
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Prominent Multi-Restaurant Selector: [ Restaurant actif : Mon restaurant ▼ ] */}
        <div className="relative min-w-0">
          <button
            onClick={() => {
              setShowRestaurantMenu(!showRestaurantMenu);
              setShowLocationMenu(false);
              setShowRoleMenu(false);
              setShowNotifications(false);
              setShowThemeMenu(false);
            }}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100/80 dark:hover:bg-amber-500/20 border border-amber-300/80 dark:border-amber-500/30 rounded-xl transition-all shadow-xs cursor-pointer max-w-full"
            title="Changer de restaurant actif"
          >
            <Store className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="text-slate-500 dark:text-slate-400 font-normal hidden sm:inline shrink-0">Restaurant actif :</span>
            <span className="font-bold text-slate-900 dark:text-white max-w-[110px] sm:max-w-[190px] truncate">
              {activeOrganization?.name || 'Sélectionner un restaurant'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
          </button>

          {/* Restaurant Selector Dropdown */}
          {showRestaurantMenu && (
            <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                <span>{language === 'fr' ? 'Vos établissements' : 'Your Restaurants'}</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">{userOrganizations.length} disponible(s)</span>
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {userOrganizations.map((org) => {
                  const isCurrent = org.id === activeOrganization?.id;
                  return (
                    <button
                      key={org.id}
                      onClick={() => {
                        switchOrganization(org.id);
                        setShowRestaurantMenu(false);
                      }}
                      className={`w-full text-left p-3 flex items-start justify-between hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors cursor-pointer ${
                        isCurrent ? 'bg-amber-50/60 dark:bg-amber-500/10 font-semibold' : ''
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-white text-xs truncate">{org.name}</span>
                          {org.isDemo && (
                            <span className="text-[9px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.2 rounded font-medium">
                              Démo
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {org.city}, {org.country} · <span className="capitalize">{org.type}</span>
                        </div>
                      </div>
                      {isCurrent && (
                        <span className="w-5 h-5 rounded-md bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="p-2 border-t border-slate-100 dark:border-slate-800 space-y-1 bg-slate-50/60 dark:bg-slate-950/60 rounded-b-2xl">
                <button
                  onClick={() => {
                    setShowRestaurantMenu(false);
                    navigateTo('restaurants');
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>{language === 'fr' ? 'Créer un nouveau restaurant' : 'Add New Restaurant'}</span>
                </button>
                <button
                  onClick={() => {
                    setShowRestaurantMenu(false);
                    navigateTo('restaurants');
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>{language === 'fr' ? 'Gérer tous les établissements' : 'Manage All Locations'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Location selector for active restaurant (if multi-site) */}
        {state.locations.filter((l) => l.orgId === activeOrganization.id).length > 1 && (
          <div className="relative hidden md:block">
            <button
              onClick={() => {
                setShowLocationMenu(!showLocationMenu);
                setShowRestaurantMenu(false);
                setShowRoleMenu(false);
                setShowNotifications(false);
                setShowThemeMenu(false);
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <span className="max-w-[120px] truncate">{activeLocation?.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showLocationMenu && (
              <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1.5 z-50">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Points de vente
                </div>
                {state.locations
                  .filter((l) => l.orgId === activeOrganization.id)
                  .map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => {
                        setActiveLocationId(loc.id);
                        setShowLocationMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer ${
                        loc.id === activeLocation?.id ? 'font-semibold text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-500/10' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="truncate">{loc.name}</span>
                      <span className="text-[11px] text-slate-400">{loc.city}</span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Zone 2: Navigation Links & Role Simulator */}
      <div className="hidden lg:flex items-center gap-3 text-xs font-medium text-slate-600 dark:text-slate-300 shrink-0">
        <button
          onClick={() => openPublicStorefront(true)}
          className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          title="Consulter la page publique du restaurant telle que vue par un client"
        >
          <QrCode className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{language === 'fr' ? 'Voir comme un client' : 'View as Customer'}</span>
        </button>

        <button
          onClick={() => openPublicStorefront(true, '3')}
          className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          title="Tester le parcours QR code d'une table client"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>{language === 'fr' ? 'Test QR Table' : 'Test Table QR'}</span>
        </button>

        <span className="text-slate-300 dark:text-slate-700">|</span>

        {/* Role simulator switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setShowRoleMenu(!showRoleMenu);
              setShowRestaurantMenu(false);
              setShowLocationMenu(false);
              setShowNotifications(false);
              setShowThemeMenu(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="capitalize">{currentUser.role}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1.5 z-50">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {language === 'fr' ? 'Tester un rôle utilisateur' : 'Simulate User Role'}
              </div>
              {roles.map((r) => (
                <button
                  key={r.role}
                  onClick={() => {
                    switchUserRole(r.role);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                    currentUser.role === r.role ? 'font-semibold text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-500/10' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span>{language === 'fr' ? r.labelFr : r.labelEn}</span>
                  {currentUser.role === r.role && <span className="text-amber-600 dark:text-amber-400 text-xs">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Language switcher */}
        <button
          onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
          className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap shrink-0 cursor-pointer"
          title="Changer de langue (FR / EN)"
        >
          <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span className="uppercase font-semibold text-xs">{language}</span>
        </button>

        {/* Triple Theme Switcher (Clair / Sombre / Auto) */}
        <div className="relative">
          <button
            onClick={() => {
              setShowThemeMenu(!showThemeMenu);
              setShowRestaurantMenu(false);
              setShowLocationMenu(false);
              setShowRoleMenu(false);
              setShowNotifications(false);
            }}
            className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap shrink-0 cursor-pointer"
            title={language === 'fr' ? 'Mode d’affichage (Clair, Sombre, Système)' : 'Display theme (Light, Dark, System)'}
          >
            {theme === 'light' ? (
              <Sun className="w-3.5 h-3.5 text-amber-500" />
            ) : theme === 'dark' ? (
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
            ) : (
              <Monitor className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span className="text-xs font-semibold hidden md:inline capitalize">
              {theme === 'auto' ? (language === 'fr' ? 'Auto' : 'System') : theme === 'light' ? (language === 'fr' ? 'Clair' : 'Light') : (language === 'fr' ? 'Sombre' : 'Dark')}
            </span>
          </button>

          {showThemeMenu && (
            <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-1.5 z-50 text-xs animate-in fade-in">
              <button
                onClick={() => {
                  setTheme('light');
                  setShowThemeMenu(false);
                }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                  theme === 'light' ? 'font-bold text-amber-600 bg-amber-50/50 dark:bg-amber-500/10' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>{language === 'fr' ? 'Thème Clair' : 'Light Theme'}</span>
                </span>
                {theme === 'light' && <span className="text-amber-600 text-xs font-bold">✓</span>}
              </button>
              <button
                onClick={() => {
                  setTheme('dark');
                  setShowThemeMenu(false);
                }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                  theme === 'dark' ? 'font-bold text-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Moon className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{language === 'fr' ? 'Thème Sombre' : 'Dark Theme'}</span>
                </span>
                {theme === 'dark' && <span className="text-indigo-500 text-xs font-bold">✓</span>}
              </button>
              <button
                onClick={() => {
                  setTheme('auto');
                  setShowThemeMenu(false);
                }}
                className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                  theme === 'auto' ? 'font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800' : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Monitor className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                  <span>{language === 'fr' ? 'Auto (Système)' : 'System Mode'}</span>
                </span>
                {theme === 'auto' && <span className="text-amber-600 text-xs font-bold">✓</span>}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Zone 3: Mobile Links, Notifications, POS button, Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Mobile Preview Link & QR Code trigger */}
        <button
          onClick={() => setShowMobileModal(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 border border-amber-200/80 dark:border-amber-500/30 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          title="Ouvrir RestaurantOS sur votre téléphone"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span className="hidden xl:inline">{language === 'fr' ? 'Lien Mobile & QR' : 'Mobile Link'}</span>
          <span className="xl:hidden hidden sm:inline">Mobile</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowRestaurantMenu(false);
              setShowLocationMenu(false);
              setShowRoleMenu(false);
              setShowThemeMenu(false);
            }}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative cursor-pointer"
            title="Notifications d'exploitation"
          >
            <Bell className="w-4 h-4" />
            {lowStockCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-2 z-50 text-xs">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between font-semibold text-slate-800 dark:text-slate-100">
                <span>{language === 'fr' ? 'Notifications & Alertes' : 'Operational Alerts'}</span>
                <span className="text-[11px] text-slate-400 truncate max-w-[130px]">{activeOrganization.name}</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {lowStockCount > 0 ? (
                  <div
                    onClick={() => {
                      navigateTo('inventory');
                      setShowNotifications(false);
                    }}
                    className="p-3 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 cursor-pointer flex gap-2.5 items-start"
                  >
                    <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-rose-800 dark:text-rose-300">
                        {lowStockCount} {language === 'fr' ? 'ingrédients en stock critique' : 'ingredients low on stock'}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                        {language === 'fr' ? 'Cliquez pour réapprovisionner' : 'Click to review & reorder'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 text-slate-500 dark:text-slate-400 text-center">
                    {language === 'fr' ? 'Aucune alerte critique' : 'No critical alerts'}
                  </div>
                )}
                {scopedOrders.slice(0, 3).map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => {
                      navigateTo('kitchen');
                      setShowNotifications(false);
                    }}
                    className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-200 font-medium">
                      <span>{ord.orderNumber} ({ord.tableName || ord.type})</span>
                      <span className="text-[11px] text-amber-600 dark:text-amber-400">{ord.status}</span>
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 truncate">
                      {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile avatar shortcut -> user_profile */}
        <button
          onClick={() => navigateTo('user_profile')}
          className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-amber-400 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer shadow-xs shrink-0"
          title={language === 'fr' ? 'Mon compte & profil personnel' : 'Personal profile'}
        >
          {currentUser.name.charAt(0)}
        </button>

        {/* Primary Action Button: Ouvrir Caisse POS */}
        <button
          onClick={() => navigateTo('pos')}
          className="flex items-center gap-2 px-3 sm:px-3.5 py-2 text-xs font-semibold text-white bg-[#0B192C] hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 rounded-xl shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-amber-400 dark:text-slate-950" />
          <span className="hidden sm:inline">{t.dashboard.quickPos}</span>
          <span className="sm:hidden">POS</span>
        </button>
      </div>

      {/* Modal: Accès Mobile & Scanner QR */}
      {showMobileModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#0B192C] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">Ouvrir RestaurantOS sur Téléphone</h3>
                  <p className="text-[11px] text-slate-300">Testez le responsive et la caisse tactile en direct</p>
                </div>
              </div>
              <button
                onClick={() => setShowMobileModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {(() => {
                const liveOrigin =
                  typeof window !== 'undefined' && window.location?.origin
                    ? window.location.origin
                    : 'https://ais-pre-iz7hz5uihaizdhttbrfnoq-284366077744.europe-west2.run.app';
                const publicClientUrl = `${liveOrigin}/menu/${encodeURIComponent(activeOrganization.slug || activeOrganization.id)}`;
                return (
                  <>
                    {/* QR Code Card */}
                    <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs shrink-0 flex flex-col items-center">
                        <QRCodeSVG
                          value={liveOrigin}
                          size={120}
                          level="M"
                          bgColor="#ffffff"
                          fgColor="#0B192C"
                        />
                        <span className="text-[10px] text-slate-500 mt-1.5 font-mono">Scanner avec l&apos;appareil</span>
                      </div>
                      <div className="space-y-1.5 text-center sm:text-left">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded">
                          Lien Prêt &amp; Compilé
                        </span>
                        <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Scannez directement l&apos;écran</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          Ouvrez l&apos;appareil photo de votre smartphone (iPhone ou Android), visez le QR code et touchez la bannière pour ouvrir RestaurantOS.
                        </p>
                      </div>
                    </div>

                    {/* Direct links with one-click copy */}
                    <div className="space-y-3">
                      {/* Restaurant Client Storefront Link */}
                      <div className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Lien Client Public ({activeOrganization.name})
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(publicClientUrl);
                              setCopiedLink('pre');
                              setTimeout(() => setCopiedLink(null), 2500);
                            }}
                            className="flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-300 hover:text-amber-800 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                          >
                            {copiedLink === 'pre' ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Copié !</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copier</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded text-[11px] font-mono text-slate-600 dark:text-slate-300 break-all border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                          <span className="truncate">{publicClientUrl}</span>
                          <a
                            href={publicClientUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-slate-700 dark:hover:text-white shrink-0"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>

                      {/* SaaS Platform URL (For Manager/Admin login) */}
                      <div className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            Lien Plateforme SaaS &amp; Administration
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(liveOrigin);
                              setCopiedLink('dev');
                              setTimeout(() => setCopiedLink(null), 2500);
                            }}
                            className="flex items-center gap-1 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                          >
                            {copiedLink === 'dev' ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Copié !</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copier</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded text-[11px] font-mono text-slate-600 dark:text-slate-300 break-all border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                          <span className="truncate">{liveOrigin}</span>
                          <a
                            href={liveOrigin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-slate-700 dark:hover:text-white shrink-0"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-[11px]">RestaurantOS — Développé par DATA WORK AGENCY ({state.platformSettings?.supportPhone || '+237 690 37 04 54'})</span>
              <button
                onClick={() => setShowMobileModal(false)}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
