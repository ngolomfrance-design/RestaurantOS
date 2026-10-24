import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useTranslation } from '../../translations';
import { formatCurrency, formatTime, getOrderStatusBadge } from '../../utils/formatters';
import { OrderStatus, PaymentStatus } from '../../types/restaurant';
import {
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  Receipt,
  Printer,
  ChevronRight,
  Plus,
  X,
} from 'lucide-react';

export const OrdersView: React.FC = () => {
  const { state, language, updateOrderStatus, recordOrderPayment, setActiveView } = useRestaurant();
  const t = useTranslation(language);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const filteredOrders = state.orders.filter((ord) => {
    const matchesStatus = statusFilter === 'all' || ord.status === statusFilter;
    const matchesSearch =
      ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ord.tableName && ord.tableName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ord.customerName && ord.customerName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {t.nav.orders}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'fr'
              ? 'Suivi de la chaîne des commandes : de la prise en caisse à la livraison client'
              : 'Complete order pipeline: from terminal ticket to kitchen and guest dispatch'}
          </p>
        </div>

        <button
          onClick={() => setActiveView('pos')}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.dashboard.quickPos}</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['all', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st === 'all' ? 'Toutes les commandes' : st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par N° commande, table..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-semibold">
                <th className="py-3 px-4">Commande</th>
                <th className="py-3 px-3">Service / Table</th>
                <th className="py-3 px-3">Heure</th>
                <th className="py-3 px-3">Détail des Plats</th>
                <th className="py-3 px-3">État Cuisine</th>
                <th className="py-3 px-3">Règlement</th>
                <th className="py-3 px-3 text-right">Montant TTC</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((ord) => {
                const badge = getOrderStatusBadge(ord.status, language);
                const isPaid = ord.paymentStatus === 'paid';

                return (
                  <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {ord.orderNumber}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">
                        {ord.tableName || (ord.type === 'takeaway' ? 'À emporter' : 'Livraison')}
                      </div>
                      {ord.customerName && (
                        <div className="text-[11px] text-slate-400 truncate max-w-[120px]">
                          {ord.customerName}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-500 text-[11px]">
                      {formatTime(ord.createdAt)}
                    </td>

                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                      {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </td>

                    <td className="py-3 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${badge.bg} ${badge.text}`}>
                        {badge.label}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          isPaid ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {isPaid ? 'Encaissé' : 'À régler'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatCurrency(ord.totalAmount, state.organization.currency)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="px-2.5 py-1 text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded font-semibold text-[11px] transition-colors"
                      >
                        Détails
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Order Detail & Status Transition */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {selectedOrder.orderNumber} ({selectedOrder.tableName || selectedOrder.type})
                </h3>
                <div className="text-xs text-slate-400">
                  Pris à {formatTime(selectedOrder.createdAt)} par {selectedOrder.createdBy}
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Articles commandés :</span>
              <div className="max-h-48 overflow-y-auto space-y-1.5 divide-y divide-slate-100 text-xs">
                {selectedOrder.items.map((it: any) => (
                  <div key={it.id} className="pt-1.5 first:pt-0 flex justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">
                        {it.quantity}x {it.name}
                      </div>
                      {it.notes && <div className="text-[10px] text-amber-700 italic">Note: {it.notes}</div>}
                    </div>
                    <span className="font-mono font-medium text-slate-900 tabular-nums">
                      {formatCurrency(it.totalPrice, state.organization.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Sous-total HT</span>
                <span className="font-mono">{formatCurrency(selectedOrder.subtotal, state.organization.currency)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>TVA (19.25%)</span>
                <span className="font-mono">{formatCurrency(selectedOrder.taxAmount, state.organization.currency)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-sm pt-1 border-t border-slate-200">
                <span>Total TTC</span>
                <span className="font-mono text-amber-700">
                  {formatCurrency(selectedOrder.totalAmount, state.organization.currency)}
                </span>
              </div>
            </div>

            {/* Quick Status Advances */}
            <div className="pt-2 border-t border-slate-100 flex gap-2">
              {selectedOrder.paymentStatus !== 'paid' && (
                <button
                  onClick={() => {
                    recordOrderPayment(selectedOrder.id, 'cash');
                    setSelectedOrder(null);
                  }}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors"
                >
                  Marquer Payé
                </button>
              )}
              {selectedOrder.status !== 'completed' && (
                <button
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, 'completed');
                    setSelectedOrder(null);
                  }}
                  className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
                >
                  Clôturer commande
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
