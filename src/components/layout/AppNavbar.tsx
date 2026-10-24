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
} from 'lucide-react';
import { UserRole } from '../../types/restaurant';

export const AppNavbar: React.FC = () => {
  const {
    state,
    language,
    setLanguage,
    activeOrganization,
    userOrganizations,
    switchOrganization,
    activeLocation,
    setActiveLocationId,
    currentUser,
    switchUserRole,
    navigateTo,
    scopedInventory,
    scopedOrders,
  } = useRestaurant();
  const t = useTranslation(language);

  const [showRestaurantMenu, setShowRestaurantMenu] = useState(false);
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
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
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between gap-4 shrink-0 z-30 sticky top-0">
      {/* Zone 1: Restaurant Selector & Location Selector */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Prominent Multi-Restaurant Selector: [ Restaurant actif : Mon restaurant ▼ ] */}
        <div className="relative">
          <button
            onClick={() => {
              setShowRestaurantMenu(!showRestaurantMenu);
              setShowLocationMenu(false);
              setShowRoleMenu(false);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-amber-50 hover:bg-amber-100/80 border border-amber-300/80 rounded-xl transition-all shadow-xs cursor-pointer"
            title="Changer de restaurant actif"
          >
            <Store className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="text-slate-500 font-normal hidden sm:inline">Restaurant actif :</span>
            <span className="font-bold text-slate-900 max-w-[140px] sm:max-w-[200px] truncate">
              {activeOrganization?.name || 'Sélectionner un restaurant'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          </button>

          {/* Restaurant Selector Dropdown */}
          {showRestaurantMenu && (
            <div className="absolute left-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                <span>{language === 'fr' ? 'Vos établissements' : 'Your Restaurants'}</span>
                <span className="text-amber-600 font-bold">{userOrganizations.length} disponible(s)</span>
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {userOrganizations.map((org) => {
                  const isCurrent = org.id === activeOrganization?.id;
                  return (
                    <button
                      key={org.id}
                      onClick={() => {
                        switchOrganization(org.id);
                        setShowRestaurantMenu(false);
                      }}
                      className={`w-full text-left p-3 flex items-start justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                        isCurrent ? 'bg-amber-50/60 font-semibold' : ''
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 text-xs truncate">{org.name}</span>
                          {org.isDemo && (
                            <span className="text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-medium">
                              Démo
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {org.city}, {org.country} • <span className="capitalize">{org.type}</span>
                        </div>
                      </div>
                      {isCurrent && (
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="p-2 border-t border-slate-100 space-y-1 bg-slate-50/60 rounded-b-2xl">
                <button
                  onClick={() => {
                    setShowRestaurantMenu(false);
                    navigateTo('restaurants');
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-800 hover:text-amber-700 hover:bg-white rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-600" />
                  <span>{language === 'fr' ? '+ Créer un nouveau restaurant' : '+ Add New Restaurant'}</span>
                </button>
                <button
                  onClick={() => {
                    setShowRestaurantMenu(false);
                    navigateTo('restaurants');
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
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
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <span className="max-w-[120px] truncate">{activeLocation?.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showLocationMenu && (
              <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50">
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
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 ${
                        loc.id === activeLocation?.id ? 'font-semibold text-amber-700 bg-amber-50/50' : 'text-slate-700'
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
      <div className="hidden lg:flex items-center gap-4 text-xs font-medium text-slate-600">
        <button
          onClick={() => navigateTo('public_menu')}
          className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          title="Consulter le menu en ligne du restaurant avec QR code imprimable"
        >
          <QrCode className="w-3.5 h-3.5 text-emerald-600" />
          <span>{language === 'fr' ? 'Menu Public & QR' : 'Public Menu & QR'}</span>
        </button>

        <button
          onClick={() => navigateTo('qr_ordering')}
          className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          title="Tester la commande par QR Code pour un client à table"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-600" />
          <span>{language === 'fr' ? 'Commande Table' : 'Table Ordering'}</span>
        </button>

        <span className="text-slate-300">|</span>

        {/* Role simulator switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setShowRoleMenu(!showRoleMenu);
              setShowRestaurantMenu(false);
              setShowLocationMenu(false);
              setShowNotifications(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-amber-600" />
            <span className="capitalize">{currentUser.role}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50">
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
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                    currentUser.role === r.role ? 'font-semibold text-amber-700 bg-amber-50/50' : 'text-slate-700'
                  }`}
                >
                  <span>{language === 'fr' ? r.labelFr : r.labelEn}</span>
                  {currentUser.role === r.role && <span className="text-amber-600 text-xs">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Language switcher */}
        <button
          onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
          className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors px-2 py-1 rounded-md hover:bg-slate-100 cursor-pointer"
          title="Changer de langue (FR / EN)"
        >
          <Globe className="w-3.5 h-3.5 text-slate-500" />
          <span className="uppercase font-semibold text-xs">{language}</span>
        </button>
      </div>

      {/* Zone 3: Mobile Links, Notifications, POS button, Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Mobile Preview Link & QR Code trigger */}
        <button
          onClick={() => setShowMobileModal(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-xl transition-colors whitespace-nowrap cursor-pointer"
          title="Ouvrir RestaurantOS sur votre téléphone"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-600" />
          <span className="hidden sm:inline">📱 Lien Mobile & QR</span>
          <span className="sm:hidden">📱 Mobile</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowRestaurantMenu(false);
              setShowLocationMenu(false);
              setShowRoleMenu(false);
            }}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors relative cursor-pointer"
            title="Notifications d'exploitation"
          >
            <Bell className="w-4 h-4" />
            {lowStockCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 text-xs">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between font-semibold text-slate-800">
                <span>{language === 'fr' ? 'Notifications & Alertes' : 'Operational Alerts'}</span>
                <span className="text-[11px] text-slate-400">{activeOrganization.name}</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {lowStockCount > 0 ? (
                  <div
                    onClick={() => {
                      navigateTo('inventory');
                      setShowNotifications(false);
                    }}
                    className="p-3 hover:bg-rose-50/50 cursor-pointer flex gap-2.5 items-start"
                  >
                    <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-rose-800">
                        {lowStockCount} {language === 'fr' ? 'ingrédients en stock critique' : 'ingredients low on stock'}
                      </div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        {language === 'fr' ? 'Cliquez pour réapprovisionner' : 'Click to review & reorder'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 text-slate-500 text-center">
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
                    className="p-3 hover:bg-slate-50 cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-slate-700 font-medium">
                      <span>{ord.orderNumber} ({ord.tableName || ord.type})</span>
                      <span className="text-[11px] text-amber-600">{ord.status}</span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-0.5 truncate">
                      {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile avatar shortcut */}
        <button
          onClick={() => navigateTo('profile')}
          className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center transition-colors cursor-pointer shadow-xs"
          title={language === 'fr' ? 'Voir mon profil' : 'View profile'}
        >
          {currentUser.name.charAt(0)}
        </button>

        {/* Primary Action Button: Ouvrir Caisse POS */}
        <button
          onClick={() => navigateTo('pos')}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">{t.dashboard.quickPos}</span>
          <span className="sm:hidden">POS</span>
        </button>
      </div>

      {/* Modal: Accès Mobile & Scanner QR */}
      {showMobileModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
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
              {/* QR Code Card */}
              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs shrink-0 flex flex-col items-center">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=https%3A%2F%2Fais-pre-iz7hz5uihaizdhttbrfnoq-284366077744.europe-west2.run.app"
                    alt="QR Code RestaurantOS"
                    className="w-32 h-32 block"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 font-mono">Scanner avec l'appareil</span>
                </div>
                <div className="space-y-1.5 text-center sm:text-left">
                  <span className="inline-block px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded">
                    Lien Prêt & Compilé
                  </span>
                  <h4 className="font-semibold text-slate-900 text-sm">Scannez directement l'écran</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Ouvrez l'appareil photo de votre smartphone (iPhone ou Android), visez le QR code et touchez la bannière pour ouvrir RestaurantOS.
                  </p>
                </div>
              </div>

              {/* Direct links with one-click copy */}
              <div className="space-y-3">
                {/* Preview URL (Primary) */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Lien Aperçu Public (Recommandé)
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('https://ais-pre-iz7hz5uihaizdhttbrfnoq-284366077744.europe-west2.run.app');
                        setCopiedLink('pre');
                        setTimeout(() => setCopiedLink(null), 2500);
                      }}
                      className="flex items-center gap-1 text-[11px] font-medium text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
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
                  <div className="p-2 bg-slate-50 rounded text-[11px] font-mono text-slate-600 break-all border border-slate-100 flex items-center justify-between gap-2">
                    <span className="truncate">https://ais-pre-iz7hz5uihaizdhttbrfnoq-284366077744.europe-west2.run.app</span>
                    <a
                      href="https://ais-pre-iz7hz5uihaizdhttbrfnoq-284366077744.europe-west2.run.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-slate-700 shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Dev URL (Secondary) */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      Lien Direct Développement
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('https://ais-dev-iz7hz5uihaizdhttbrfnoq-284366077744.europe-west2.run.app');
                        setCopiedLink('dev');
                        setTimeout(() => setCopiedLink(null), 2500);
                      }}
                      className="flex items-center gap-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
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
                  <div className="p-2 bg-slate-50 rounded text-[11px] font-mono text-slate-600 break-all border border-slate-100 flex items-center justify-between gap-2">
                    <span className="truncate">https://ais-dev-iz7hz5uihaizdhttbrfnoq-284366077744.europe-west2.run.app</span>
                    <a
                      href="https://ais-dev-iz7hz5uihaizdhttbrfnoq-284366077744.europe-west2.run.app"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-slate-700 shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
              <span className="font-medium text-[11px]">RestaurantOS — Développé par DATA WORK AGENCY</span>
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
