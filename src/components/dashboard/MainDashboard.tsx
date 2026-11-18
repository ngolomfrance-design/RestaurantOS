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
  Eye,
} from 'lucide-react';
import { QuickActionsMenu } from './QuickActionsMenu';

export const MainDashboard: React.FC = () => {
  const {
    activeOrganization,
    scopedOrders,
    scopedProducts,
    scopedTables,
    scopedInventory,
    scopedExpenses,
    currentUser,
    navigateTo,
    openPublicStorefront,
    language,
  } = useRestaurant();
  const t = useTranslation(language);

  // Temporal Filter State
  const [period, setPeriod] = React.useState<'today' | 'yesterday' | 'week' | 'month' | 'custom'>('today');
  const [customStart, setCustomStart] = React.useState('');
  const [customEnd, setCustomEnd] = React.useState('');

  // Date filtering logic
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const yesterday = new Date(now.getTime() - 86400000);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const filteredOrders = scopedOrders.filter((ord) => {
    const ordDate = new Date(ord.createdAt);
    if (period === 'today') {
      return ord.createdAt.startsWith(todayStr);
    }
    if (period === 'yesterday') {
      return ord.createdAt.startsWith(yesterdayStr);
    }
    if (period === 'week') {
      return ordDate >= sevenDaysAgo;
    }
    if (period === 'month') {
      return ordDate >= startOfMonth;
    }
    if (period === 'custom') {
      if (!customStart && !customEnd) return true;
      const start = customStart ? new Date(customStart) : new Date(0);
      const end = customEnd ? new Date(customEnd + 'T23:59:59') : new Date();
      return ordDate >= start && ordDate <= end;
    }
    return true;
  });

  // Calculate real metrics strictly from filtered orders and expenses of current tenant
  const paidOrders = filteredOrders.filter((o) => o.paymentStatus === 'paid');
  const todaySales = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const filteredExpenses = scopedExpenses.filter((exp) => {
    const expDate = new Date(exp.date);
    if (period === 'today') return exp.date === todayStr;
    if (period === 'yesterday') return exp.date === yesterdayStr;
    if (period === 'week') return expDate >= sevenDaysAgo;
    if (period === 'month') return expDate >= startOfMonth;
    if (period === 'custom') {
      if (!customStart && !customEnd) return true;
      const start = customStart ? new Date(customStart) : new Date(0);
      const end = customEnd ? new Date(customEnd + 'T23:59:59') : new Date();
      return expDate >= start && expDate <= end;
    }
    return true;
  });
  const periodExpensesTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const periodNetBalance = todaySales - periodExpensesTotal;
  const totalOrdersCount = filteredOrders.length;
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

  // Top selling dishes calculated dynamically from filtered orders
  const productSalesMap: Record<string, { name: string; count: number; revenue: number; image?: string }> = {};
  filteredOrders.forEach((ord) => {
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

  // Real 7-Day Revenue & Orders Analytics computed strictly from scopedOrders
  const last7DaysData = React.useMemo(() => {
    const days: { dateKey: string; label: string; revenue: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateKey = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'short' });
      const dayOrders = scopedOrders.filter((o) => o.createdAt.startsWith(dateKey) && o.status !== 'cancelled');
      const dayRev = dayOrders
        .filter((o) => o.paymentStatus === 'paid')
        .reduce((sum, o) => sum + o.totalAmount, 0);
      days.push({ dateKey, label: dayLabel.replace('.', ''), revenue: dayRev, orders: dayOrders.length });
    }
    return days;
  }, [scopedOrders, language]);

  const maxDayRevenue = Math.max(1, ...last7DaysData.map((d) => d.revenue));

  // Payment channel distribution from paidOrders in active period
  const paymentBreakdown = React.useMemo(() => {
    const total = paidOrders.reduce((s, o) => s + o.totalAmount, 0);
    const cash = paidOrders.filter((o) => o.paymentMethod === 'cash').reduce((s, o) => s + o.totalAmount, 0);
    const card = paidOrders.filter((o) => o.paymentMethod === 'card').reduce((s, o) => s + o.totalAmount, 0);
    const momo = paidOrders.filter((o) => o.paymentMethod === 'mobile_money').reduce((s, o) => s + o.totalAmount, 0);
    return {
      total,
      cash,
      card,
      momo,
      cashPct: total > 0 ? Math.round((cash / total) * 100) : 0,
      cardPct: total > 0 ? Math.round((card / total) * 100) : 0,
      momoPct: total > 0 ? Math.round((momo / total) * 100) : 0,
    };
  }, [paidOrders]);

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header Row with Active Restaurant Name, Date, Settings & Profile */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-500/20">
              {activeOrganization.name}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
              · {activeOrganization.city}, {activeOrganization.country}
            </span>
            {activeOrganization.isDemo && (
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-semibold">
                Données d’exemple Démo
              </span>
            )}
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {language === 'fr' ? 'Tableau de Bord de Gestion' : 'Management Dashboard'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 capitalize flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{currentDateFormatted}</span>
          </p>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <button
            onClick={() => openPublicStorefront(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30 rounded-xl transition-colors cursor-pointer"
            title={language === 'fr' ? 'Ouvrir la page publique telle que vue par vos clients' : 'Open public restaurant page as viewed by guests'}
          >
            <Eye className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{language === 'fr' ? 'Voir comme un client' : 'View as Customer'}</span>
          </button>

          <button
            onClick={() => navigateTo('restaurants')}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Changer d'établissement"
          >
            <Store className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">Mes restaurants</span>
          </button>

          <button
            onClick={() => navigateTo('settings')}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Paramètres de l'établissement"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigateTo('user_profile')}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            title={language === 'fr' ? 'Mon profil personnel' : 'My personal profile'}
          >
            <span className="w-5 h-5 rounded-md bg-slate-900 text-amber-400 text-[10px] font-bold flex items-center justify-center">
              {currentUser.name.charAt(0)}
            </span>
            <span className="hidden sm:inline">{currentUser.name}</span>
          </button>

          <button
            onClick={() => navigateTo('pos')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0B192C] hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-slate-950 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400 dark:text-slate-950" />
            <span>{language === 'fr' ? 'Nouvelle Commande (POS)' : 'New Order (POS)'}</span>
          </button>
        </div>
      </div>

      {/* Temporal Filter Selector Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 hidden md:inline">
            {language === 'fr' ? 'Période analysée :' : 'Time period:'}
          </span>
          {(
            [
              { key: 'today', fr: "Aujourd'hui", en: 'Today' },
              { key: 'yesterday', fr: 'Hier', en: 'Yesterday' },
              { key: 'week', fr: '7 derniers jours', en: 'Last 7 days' },
              { key: 'month', fr: 'Ce mois', en: 'This month' },
              { key: 'custom', fr: 'Personnalisé', en: 'Custom range' },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              onClick={() => setPeriod(item.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                period === item.key
                  ? item.key === 'custom'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-[#0B192C] dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {language === 'fr' ? item.fr : item.en}
            </button>
          ))}
        </div>

        {period === 'custom' && (
          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-2.5 py-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100"
            />
            <span className="text-slate-400">à</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-2.5 py-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateTo('reports')}
            className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 hover:text-amber-800 font-semibold px-2.5 py-1 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 rounded-xl transition-colors cursor-pointer"
          >
            <span>{language === 'fr' ? 'Clôture Z & Exports' : 'Z-Report & Exports'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Zero state alert if no orders in period */}
      {filteredOrders.length === 0 && (
        <div className="bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center space-y-1 text-xs text-slate-500 dark:text-slate-400">
          <div className="font-semibold text-slate-700 dark:text-slate-200">
            {language === 'fr'
              ? 'Aucune commande enregistrée pour cette période'
              : 'No orders recorded for this period'}
          </div>
          <p className="text-[11px]">
            {language === 'fr'
              ? 'Toutes les métriques de ventes et d’encaissement sont à 0 pour ce filtre.'
              : 'All sales and collection metrics are at 0 for this filter.'}
          </p>
        </div>
      )}

      {/* Row of Real KPI Widgets (Strictly from current tenant data) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
        {/* Widget 1: Real Daily Revenue */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {language === 'fr' ? 'Chiffre d’Affaires Encaissé' : 'Collected Revenue'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>

          <div className="my-2.5">
            <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums tracking-tight">
              {formatCurrency(todaySales, activeOrganization.currency)}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex-wrap">
              <span className="tabular-nums font-mono font-medium">
                {paidOrders.length} {language === 'fr' ? 'addition(s) encaissée(s)' : 'paid order(s)'}
              </span>
              {paidOrders.length > 0 && (
                <>
                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                  <span>Panier moyen : {formatCurrency(avgBasket, activeOrganization.currency)}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] mt-1.5 tabular-nums flex-wrap">
              <span className="text-rose-600 dark:text-rose-400 font-medium">
                {language === 'fr' ? 'Dépenses' : 'Expenses'} : {formatCurrency(periodExpensesTotal, activeOrganization.currency)}
              </span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className={`font-bold ${periodNetBalance >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {language === 'fr' ? 'Solde net' : 'Net'} : {formatCurrency(periodNetBalance, activeOrganization.currency)}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Données réelles encaissées</span>
            <button
              onClick={() => navigateTo('reports')}
              className="text-amber-600 dark:text-amber-400 hover:text-amber-700 font-semibold cursor-pointer"
            >
              Finances & Rapport Z →
            </button>
          </div>
        </div>

        {/* Widget 2: Real Active Orders */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {language === 'fr' ? 'Commandes Actives' : 'Active Orders'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>

          <div className="my-2.5">
            <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums tracking-tight">
              {activeOrdersCount} <span className="text-base font-semibold text-slate-500 dark:text-slate-400">en cours</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1.5">
              <span className="text-amber-700 dark:text-amber-400 font-semibold">
                {preparingOrders} en cuisine
              </span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                {readyOrders} prête(s) à servir
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Suivi cuisine en direct</span>
            <button
              onClick={() => navigateTo('kitchen')}
              className="text-amber-600 dark:text-amber-400 hover:text-amber-700 font-semibold cursor-pointer"
            >
              Écran KDS →
            </button>
          </div>
        </div>

        {/* Widget 3: Real Occupied Tables */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {language === 'fr' ? 'Occupation des Tables' : 'Occupied Tables'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <LayoutGrid className="w-4 h-4" />
            </div>
          </div>

          <div className="my-2.5">
            <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums tracking-tight">
              {occupiedTables} <span className="text-base font-semibold text-slate-500 dark:text-slate-400">/ {totalTables} tables</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1.5">
              <span className="text-blue-700 dark:text-blue-400 font-semibold">
                {tableOccupancyRate}% du restaurant occupé
              </span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span>{totalTables - occupiedTables} libre(s)</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Plan de salle en direct</span>
            <button
              onClick={() => navigateTo('tables')}
              className="text-amber-600 dark:text-amber-400 hover:text-amber-700 font-semibold cursor-pointer"
            >
              Plan de salle →
            </button>
          </div>
        </div>
      </div>

      {/* IF NO ORDERS: RENDER PROFESSIONAL EMPTY STATE AS REQUIRED */}
      {scopedOrders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xs max-w-3xl mx-auto my-4 animate-in fade-in">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Aucune commande pour le moment.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
              Les commandes de votre établissement « {activeOrganization.name} » apparaîtront ici dès leur saisie au point de vente tactile ou leur commande à table.
            </p>
          </div>

          {/* Real Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-left">
            <button
              onClick={() => navigateTo('menu')}
              className="p-4 bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex flex-col justify-between space-y-2 transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Ajouter un produit</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Plats, boissons, menus</span>
              </div>
            </button>

            <button
              onClick={() => navigateTo('pos')}
              className="p-4 bg-amber-50 dark:bg-amber-500/15 hover:bg-amber-100/80 dark:hover:bg-amber-500/25 rounded-2xl border border-amber-300 dark:border-amber-500/30 text-xs font-bold text-amber-950 dark:text-amber-200 flex flex-col justify-between space-y-2 transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-950 dark:text-white block">Créer une commande</span>
                <span className="text-[11px] text-amber-900 dark:text-amber-300 font-normal">Ouvrir la caisse POS</span>
              </div>
            </button>

            <button
              onClick={() => navigateTo('inventory')}
              className="p-4 bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex flex-col justify-between space-y-2 transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                <Boxes className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Consulter les stocks</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">Inventaire & alertes</span>
              </div>
            </button>

            <button
              onClick={() => navigateTo('settings')}
              className="p-4 bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 flex flex-col justify-between space-y-2 transition-all cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Configurer le restaurant</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">TVA, devise, coordonnées</span>
              </div>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Interactive Analytics Row: 7-Day Revenue SVG Chart + Payment Channels */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-500" />
                    <span>{language === 'fr' ? 'Tendance des Ventes (7 derniers jours)' : '7-Day Revenue Trend'}</span>
                  </h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Recettes encaissées par jour pour « {activeOrganization.name} »
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                  {formatCurrency(
                    last7DaysData.reduce((sum, d) => sum + d.revenue, 0),
                    activeOrganization.currency
                  )}
                </span>
              </div>

              {/* Clean Responsive SVG Bar Chart */}
              <div className="pt-2">
                <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end h-36">
                  {last7DaysData.map((day) => {
                    const heightPct = day.revenue > 0 ? Math.max(10, Math.round((day.revenue / maxDayRevenue) * 100)) : 4;
                    const isToday = day.dateKey === todayStr;
                    return (
                      <div key={day.dateKey} className="flex flex-col items-center justify-end h-full gap-1.5 group">
                        <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity truncate max-w-full">
                          {day.orders} cmd
                        </div>
                        <div className="w-full flex-1 flex items-end justify-center px-1 sm:px-2">
                          <div
                            style={{ height: `${heightPct}%` }}
                            title={`${day.label}: ${formatCurrency(day.revenue, activeOrganization.currency)} (${day.orders} cmd)`}
                            className={`w-full max-w-[38px] rounded-t-lg transition-all duration-300 ${
                              day.revenue === 0
                                ? 'bg-slate-100 dark:bg-slate-800'
                                : isToday
                                ? 'bg-amber-500 shadow-xs'
                                : 'bg-[#0B192C] dark:bg-slate-600 group-hover:bg-amber-500'
                            }`}
                          />
                        </div>
                        <span
                          className={`text-[10px] uppercase tracking-wider font-semibold ${
                            isToday ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {day.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Payment Breakdown Card */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  {language === 'fr' ? 'Canaux d’Encaissement' : 'Payment Channels'}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Répartition sur la période sélectionnée
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-700 dark:text-slate-300">Mobile Money (OM / MoMo)</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      {paymentBreakdown.momoPct}% · {formatCurrency(paymentBreakdown.momo, activeOrganization.currency)}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${paymentBreakdown.momoPct}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-700 dark:text-slate-300">Espèces (Caisse)</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      {paymentBreakdown.cashPct}% · {formatCurrency(paymentBreakdown.cash, activeOrganization.currency)}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${paymentBreakdown.cashPct}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-700 dark:text-slate-300">Carte Bancaire (TPE / Web)</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      {paymentBreakdown.cardPct}% · {formatCurrency(paymentBreakdown.card, activeOrganization.currency)}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0B192C] dark:bg-indigo-400 rounded-full" style={{ width: `${paymentBreakdown.cardPct}%` }} />
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigateTo('reports')}
                className="w-full py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Ouvrir Clôture Z détaillée →
              </button>
            </div>
          </div>

          {/* REAL ORDERS & ACTIVITY VIEW */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Recent Orders (8 cols) */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-0.5">
                  <h2 className="font-bold text-slate-900 dark:text-white text-sm">
                    {language === 'fr' ? 'Commandes Récentes du Restaurant' : 'Recent Restaurant Orders'}
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    {scopedOrders.length} {language === 'fr' ? 'commande(s) enregistrée(s)' : 'order(s) recorded'}
                  </p>
                </div>

                <button
                  onClick={() => navigateTo('orders')}
                  className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 font-semibold cursor-pointer"
                >
                  {language === 'fr' ? 'Voir toutes les commandes →' : 'View all orders →'}
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="py-2.5 px-3">N° Commande</th>
                      <th className="py-2.5 px-3">Table / Type</th>
                      <th className="py-2.5 px-3">Articles</th>
                      <th className="py-2.5 px-3">Statut</th>
                      <th className="py-2.5 px-3 text-right">Montant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {scopedOrders.slice(0, 6).map((ord) => {
                      const badge = getOrderStatusBadge(ord.status);
                      return (
                        <tr key={ord.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-3 font-mono font-semibold text-slate-900 dark:text-white">
                            {ord.orderNumber}
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-medium text-slate-800 dark:text-slate-200">{ord.tableName || ord.customerName}</span>
                            <span className="text-[10px] text-slate-400 block capitalize">{ord.type}</span>
                          </td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-300 max-w-[200px] truncate">
                            {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${badge.bg} ${badge.text}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
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
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    {language === 'fr' ? 'Plats les plus vendus' : 'Top Selling Dishes'}
                  </h3>
                  <button
                    onClick={() => navigateTo('menu')}
                    className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 font-semibold cursor-pointer"
                  >
                    Menu →
                  </button>
                </div>

                {topSellers.length > 0 ? (
                  <div className="space-y-3">
                    {topSellers.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate">{item.name}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-slate-900 dark:text-white font-mono tabular-nums">{item.count} ventes</span>
                          <span className="text-[10px] text-slate-400 block font-mono tabular-nums">
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
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      {language === 'fr' ? 'Stocks Critiques' : 'Low Stock Alerts'}
                    </h3>
                  </div>
                  <button
                    onClick={() => navigateTo('inventory')}
                    className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-700 font-semibold cursor-pointer"
                  >
                    Inventaire →
                  </button>
                </div>

                {lowStockItems.length > 0 ? (
                  <div className="space-y-2.5">
                    {lowStockItems.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/60 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-rose-900 dark:text-rose-200">{item.name}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">Seuil alerte : {item.minThreshold} {item.unit}</div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-rose-700 dark:text-rose-400 font-mono text-sm tabular-nums">{item.currentStock} {item.unit}</span>
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
        </div>
      )}

      {/* Floating Quick Actions Menu */}
      <QuickActionsMenu />

      {/* Footer Attribution */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
        RestaurantOS — Une solution développée par <strong className="text-slate-600 dark:text-slate-300">DATA WORK AGENCY</strong>
      </div>
    </div>
  );
};
