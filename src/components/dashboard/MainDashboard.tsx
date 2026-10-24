import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useTranslation } from '../../translations';
import { formatCurrency, formatDate, getOrderStatusBadge } from '../../utils/formatters';
import {
  TrendingUp,
  ShoppingBag,
  Receipt,
  ChefHat,
  Percent,
  AlertTriangle,
  Calendar,
  ArrowUpRight,
  Plus,
  Coins,
  Flame,
  LayoutGrid,
  Users,
  Boxes,
  Settings,
  Store,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { QuickActionsMenu } from './QuickActionsMenu';

export const MainDashboard: React.FC = () => {
  const {
    activeOrganization,
    scopedOrders,
    scopedProducts,
    scopedTables,
    scopedInventory,
    currentUser,
    navigateTo,
    language,
  } = useRestaurant();
  const t = useTranslation(language);

  // Calculate real metrics strictly from current tenant data
  const paidOrders = scopedOrders.filter((o) => o.paymentStatus === 'paid');
  const todaySales = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrdersCount = scopedOrders.length;
  const avgBasket = paidOrders.length > 0 ? Math.round(todaySales / paidOrders.length) : 0;
  const preparingOrders = scopedOrders.filter((o) => o.status === 'preparing').length;
  const readyOrders = scopedOrders.filter((o) => o.status === 'ready').length;
  const activeOrdersCount = scopedOrders.filter(
    (o) => o.status === 'confirmed' || o.status === 'preparing' || o.status === 'ready'
  ).length;

  const occupiedTables = scopedTables.filter((t) => t.status === 'occupied').length;
  const totalTables = scopedTables.length;
  const tableOccupancyRate = totalTables > 0 ? Math.round((occupiedTables / totalTables) * 100) : 0;

  // Real Low stock items
  const lowStockItems = scopedInventory.filter((i) => i.currentStock <= i.minThreshold);

  // Top selling dishes calculated dynamically from real orders
  const productSalesMap: Record<string, { name: string; count: number; revenue: number; image?: string }> = {};
  scopedOrders.forEach((ord) => {
    ord.items.forEach((item) => {
      if (!productSalesMap[item.productId]) {
        const prod = scopedProducts.find((p) => p.id === item.productId);
        productSalesMap[item.productId] = {
          name: item.name,
          count: 0,
          revenue: 0,
          image: prod?.image || '/src/assets/images/dish_grilled_fish_1792835864516.jpg',
        };
      }
      productSalesMap[item.productId].count += item.quantity;
      productSalesMap[item.productId].revenue += item.totalPrice;
    });
  });
  const topSellers = Object.values(productSalesMap).sort((a, b) => b.count - a.count).slice(0, 4);

  const currentDateFormatted = new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header Row with Active Restaurant Name, Date, Settings & Profile */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs uppercase tracking-wider text-amber-700 font-bold bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200/60">
              {activeOrganization.name}
            </span>
            <span className="text-xs text-slate-400 capitalize">· {activeOrganization.city}, {activeOrganization.country}</span>
            {activeOrganization.isDemo && (
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                Données d’exemple Démo
              </span>
            )}
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
            {language === 'fr' ? 'Tableau de Bord de Gestion' : 'Management Dashboard'}
          </h1>
          <p className="text-xs text-slate-500 capitalize flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentDateFormatted}</span>
          </p>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          <button
            onClick={() => navigateTo('restaurants')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            title="Changer d'établissement"
          >
            <Store className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Mes restaurants</span>
          </button>

          <button
            onClick={() => navigateTo('settings')}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            title="Paramètres de l'établissement"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigateTo('profile')}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <span className="w-5 h-5 rounded-full bg-slate-900 text-amber-400 text-[10px] font-bold flex items-center justify-center">
              {currentUser.name.charAt(0)}
            </span>
            <span className="hidden sm:inline">{currentUser.name}</span>
          </button>

          <button
            onClick={() => navigateTo('pos')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'fr' ? 'Nouvelle Commande (POS)' : 'New Order (POS)'}</span>
          </button>
        </div>
      </div>

      {/* Row of Real KPI Widgets (Strictly from current tenant data) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
        {/* Widget 1: Real Daily Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'fr' ? 'Chiffre d’Affaires du Jour' : 'Daily Revenue'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>

          <div className="my-2.5">
            <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
              {formatCurrency(todaySales, activeOrganization.currency)}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1.5">
              <span className="tabular-nums font-mono font-medium">
                {paidOrders.length} {language === 'fr' ? 'addition(s) encaissée(s)' : 'paid order(s)'}
              </span>
              {paidOrders.length > 0 && (
                <>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span>Panier moyen : {formatCurrency(avgBasket, activeOrganization.currency)}</span>
                </>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Données réelles encaissées</span>
            <button
              onClick={() => navigateTo('reports')}
              className="text-amber-600 hover:text-amber-700 font-semibold cursor-pointer"
            >
              Rapport financier →
            </button>
          </div>
        </div>

        {/* Widget 2: Real Active Orders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'fr' ? 'Commandes Actives' : 'Active Orders'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>

          <div className="my-2.5">
            <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
              {activeOrdersCount} <span className="text-base font-semibold text-slate-500">en cours</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1.5">
              <span className="text-amber-700 font-semibold">
                {preparingOrders} en cuisine
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="text-emerald-700 font-semibold">
                {readyOrders} prête(s) à servir
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Suivi cuisine en direct</span>
            <button
              onClick={() => navigateTo('kitchen')}
              className="text-amber-600 hover:text-amber-700 font-semibold cursor-pointer"
            >
              Écran KDS →
            </button>
          </div>
        </div>

        {/* Widget 3: Real Occupied Tables */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {language === 'fr' ? 'Occupation des Tables' : 'Occupied Tables'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <LayoutGrid className="w-4 h-4" />
            </div>
          </div>

          <div className="my-2.5">
            <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 font-mono tabular-nums tracking-tight">
              {occupiedTables} <span className="text-base font-semibold text-slate-500">/ {totalTables} tables</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1.5">
              <span className="text-blue-700 font-semibold">
                {tableOccupancyRate}% du restaurant occupé
              </span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span>{totalTables - occupiedTables} libre(s)</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Plan de salle en direct</span>
            <button
              onClick={() => navigateTo('tables')}
              className="text-amber-600 hover:text-amber-700 font-semibold cursor-pointer"
            >
              Plan de salle →
            </button>
          </div>
        </div>
      </div>

      {/* IF NO ORDERS: RENDER PROFESSIONAL EMPTY STATE AS REQUIRED */}
      {scopedOrders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xs max-w-3xl mx-auto my-4 animate-in fade-in">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Aucune commande pour le moment.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
              Les commandes de votre établissement « {activeOrganization.name} » apparaîtront ici dès leur saisie au point de vente tactile ou leur commande à table.
            </p>
          </div>

          {/* Real Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-left">
            <button
              onClick={() => navigateTo('menu')}
              className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-800 flex flex-col justify-between space-y-2 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Ajouter un produit</span>
                <span className="text-[11px] text-slate-500 font-normal">Plats, boissons, menus</span>
              </div>
            </button>

            <button
              onClick={() => navigateTo('pos')}
              className="p-4 bg-amber-50 hover:bg-amber-100/80 rounded-2xl border border-amber-300 text-xs font-bold text-amber-950 flex flex-col justify-between space-y-2 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-950 block">Créer une commande</span>
                <span className="text-[11px] text-amber-900 font-normal">Ouvrir la caisse POS</span>
              </div>
            </button>

            <button
              onClick={() => navigateTo('inventory')}
              className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-800 flex flex-col justify-between space-y-2 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center">
                <Boxes className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Consulter les stocks</span>
                <span className="text-[11px] text-slate-500 font-normal">Inventaire & alertes</span>
              </div>
            </button>

            <button
              onClick={() => navigateTo('settings')}
              className="p-4 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-800 flex flex-col justify-between space-y-2 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center">
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 block">Configurer le restaurant</span>
                <span className="text-[11px] text-slate-500 font-normal">TVA, devise, coordonnées</span>
              </div>
            </button>
          </div>
        </div>
      ) : (
        /* REAL ORDERS & ACTIVITY VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Recent Orders (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="space-y-0.5">
                <h2 className="font-bold text-slate-900 text-sm">
                  {language === 'fr' ? 'Commandes Récentes du Restaurant' : 'Recent Restaurant Orders'}
                </h2>
                <p className="text-[11px] text-slate-400">
                  {scopedOrders.length} {language === 'fr' ? 'commande(s) enregistrée(s)' : 'order(s) recorded'}
                </p>
              </div>

              <button
                onClick={() => navigateTo('orders')}
                className="text-xs text-amber-600 hover:text-amber-700 font-semibold cursor-pointer"
              >
                {language === 'fr' ? 'Voir toutes les commandes →' : 'View all orders →'}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-3">N° Commande</th>
                    <th className="py-2.5 px-3">Table / Type</th>
                    <th className="py-2.5 px-3">Articles</th>
                    <th className="py-2.5 px-3">Statut</th>
                    <th className="py-2.5 px-3 text-right">Montant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scopedOrders.slice(0, 6).map((ord) => {
                    const badge = getOrderStatusBadge(ord.status);
                    return (
                      <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-3 font-mono font-semibold text-slate-900">
                          {ord.orderNumber}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-medium text-slate-800">{ord.tableName || ord.customerName}</span>
                          <span className="text-[10px] text-slate-400 block capitalize">{ord.type}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-600 max-w-[200px] truncate">
                          {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${badge.bgColor} ${badge.color}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(ord.totalAmount, activeOrganization.currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Low Stock Alerts & Top Sellers (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Top Selling Dishes */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm">
                  {language === 'fr' ? 'Plats les plus vendus' : 'Top Selling Dishes'}
                </h3>
                <button
                  onClick={() => navigateTo('menu')}
                  className="text-xs text-amber-600 hover:text-amber-700 font-semibold cursor-pointer"
                >
                  Menu →
                </button>
              </div>

              {topSellers.length > 0 ? (
                <div className="space-y-3">
                  {topSellers.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-slate-100 font-mono text-[11px] font-bold text-slate-600 flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-slate-800 truncate">{item.name}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-slate-900 font-mono">{item.count} ventes</span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {formatCurrency(item.revenue, activeOrganization.currency)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">
                  Aucune vente enregistrée pour ce restaurant.
                </p>
              )}
            </div>

            {/* Low Stock Alerts */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    {language === 'fr' ? 'Stocks Critiques' : 'Low Stock Alerts'}
                  </h3>
                </div>
                <button
                  onClick={() => navigateTo('inventory')}
                  className="text-xs text-amber-600 hover:text-amber-700 font-semibold cursor-pointer"
                >
                  Inventaire →
                </button>
              </div>

              {lowStockItems.length > 0 ? (
                <div className="space-y-2.5">
                  {lowStockItems.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-rose-50/50 border border-rose-200/60 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-semibold text-rose-900">{item.name}</div>
                        <div className="text-[10px] text-slate-500">Seuil alerte : {item.minThreshold} {item.unit}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-rose-700 font-mono text-sm">{item.currentStock} {item.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">
                  Tous les stocks de cet établissement sont au-dessus du seuil d'alerte.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Quick Actions Menu */}
      <QuickActionsMenu />

      {/* Footer Attribution */}
      <div className="pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
        RestaurantOS — Une solution développée par <strong className="text-slate-600">DATA WORK AGENCY</strong>
      </div>
    </div>
  );
};
