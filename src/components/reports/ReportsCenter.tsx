import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useTranslation } from '../../translations';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  CreditCard,
  Banknote,
  Smartphone,
  TrendingUp,
  Percent,
} from 'lucide-react';

export const ReportsCenter: React.FC = () => {
  const { state, language } = useRestaurant();
  const t = useTranslation(language);

  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

  const paidOrders = state.orders.filter((o) => o.paymentStatus === 'paid');
  const totalSales = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalTax = paidOrders.reduce((sum, o) => sum + o.taxAmount, 0);
  const totalDiscounts = paidOrders.reduce((sum, o) => sum + o.discountAmount, 0);

  // Method totals
  const cashSales = paidOrders
    .filter((o) => o.paymentMethod === 'cash')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const cardSales = paidOrders
    .filter((o) => o.paymentMethod === 'card')
    .reduce((sum, o) => sum + o.totalAmount, 0);
  const mobileMoneySales = paidOrders
    .filter((o) => o.paymentMethod === 'mobile_money')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Export to CSV functionality
  const handleExportCsv = () => {
    const headers = ['OrderNumber', 'Date', 'Type', 'Table', 'Status', 'PaymentMethod', 'Subtotal', 'Tax', 'Discount', 'Total'];
    const rows = state.orders.map((o) => [
      o.orderNumber,
      o.createdAt,
      o.type,
      o.tableName || '-',
      o.status,
      o.paymentMethod || 'unpaid',
      o.subtotal,
      o.taxAmount,
      o.discountAmount,
      o.totalAmount,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `restaurantos_ventes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintZReport = () => {
    window.print();
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {t.nav.reports}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'fr'
              ? 'Rapports des encaissements, répartition des règlements et exports comptables'
              : 'Financial reports, payment method breakdown, and accounting ledger export'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-lg shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>{t.common.exportCsv}</span>
          </button>
          <button
            onClick={handlePrintZReport}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer Rapport Z / Clôture</span>
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Chiffre d’affaires TTC</div>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {formatCurrency(totalSales, state.organization.currency)}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            {paidOrders.length} additions encaissées
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">TVA Collectée (19.25%)</div>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {formatCurrency(totalTax, state.organization.currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Assiette HT: {formatCurrency(totalSales - totalTax, state.organization.currency)}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Remises & Gestes Commerciaux</div>
          <div className="text-xl font-bold text-rose-600 font-mono tabular-nums mt-1">
            {formatCurrency(totalDiscounts, state.organization.currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Autorisées par le manager</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-medium text-slate-500">Panier Moyen Net</div>
          <div className="text-xl font-bold text-amber-700 font-mono tabular-nums mt-1">
            {formatCurrency(paidOrders.length > 0 ? totalSales / paidOrders.length : 0, state.organization.currency)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Par ticket client</div>
        </div>
      </div>

      {/* Payment Methods Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900">
          Encaissements par Mode de Règlement
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-xs text-slate-800">Espèces (Cash)</div>
                <div className="text-[11px] text-slate-400">Fond de caisse contrôlé</div>
              </div>
            </div>
            <div className="text-right font-mono font-bold text-sm text-slate-900 tabular-nums">
              {formatCurrency(cashSales, state.organization.currency)}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-xs text-slate-800">Orange & MTN MoMo</div>
                <div className="text-[11px] text-slate-400">Paiements mobiles Afrique</div>
              </div>
            </div>
            <div className="text-right font-mono font-bold text-sm text-slate-900 tabular-nums">
              {formatCurrency(mobileMoneySales, state.organization.currency)}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-xs text-slate-800">Cartes Bancaires (TPE)</div>
                <div className="text-[11px] text-slate-400">Visa & Mastercard</div>
              </div>
            </div>
            <div className="text-right font-mono font-bold text-sm text-slate-900 tabular-nums">
              {formatCurrency(cardSales, state.organization.currency)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
