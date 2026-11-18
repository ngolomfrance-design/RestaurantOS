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
  const { scopedOrders, activeOrganization, language, updateOrderStatus, recordOrderPayment, setActiveView } = useRestaurant();
  const t = useTranslation(language);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const filteredOrders = scopedOrders.filter((ord) => {
    const matchesStatus = statusFilter === 'all' || ord.status === statusFilter;
    const matchesSearch =
      ord.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ord.tableName && ord.tableName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ord.customerName && ord.customerName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t.nav.orders}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'fr'
              ? 'Suivi de la chaîne des commandes : de la prise en caisse à la livraison client'
              : 'Complete order pipeline: from terminal ticket to kitchen and guest dispatch'}
          </p>
        </div>

        <button
          onClick={() => setActiveView('pos')}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0B192C] dark:bg-amber-500 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-amber-400 rounded-lg shadow-xs transition-colors self-start sm:self-auto whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t.dashboard.quickPos}</span>
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['all', 'pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#0B192C] dark:bg-amber-500 text-white dark:text-slate-950 font-semibold'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {st === 'all' ? 'Toutes les commandes' : st === 'pending' ? 'En attente (Clients)' : st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par N° commande, table..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-lg text-xs focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold">
                <th className="py-3 px-4 whitespace-nowrap">Commande</th>
                <th className="py-3 px-3 whitespace-nowrap">Service / Table</th>
                <th className="py-3 px-3 whitespace-nowrap">Heure</th>
                <th className="py-3 px-3 whitespace-nowrap">Détail des Plats</th>
                <th className="py-3 px-3 whitespace-nowrap">État Cuisine</th>
                <th className="py-3 px-3 whitespace-nowrap">Règlement</th>
                <th className="py-3 px-3 text-right whitespace-nowrap">Montant TTC</th>
                <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                    Aucune commande ne correspond aux critères sélectionnés.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const badge = getOrderStatusBadge(ord.status, language);
                  const isPaid = ord.paymentStatus === 'paid';

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 font-mono tabular-nums font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {ord.orderNumber}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {ord.tableName || (ord.type === 'takeaway' ? 'À emporter' : 'Livraison')}
                        </div>
                        {ord.customerName && (
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[140px]">
                            {ord.customerName}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 font-mono tabular-nums text-slate-500 dark:text-slate-400 text-[11px] whitespace-nowrap">
                        {formatTime(ord.createdAt)}
                      </td>

                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        {ord.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${badge.bg} ${badge.text}`}>
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            isPaid
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {isPaid ? 'Encaissé' : 'À régler'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums whitespace-nowrap">
                        {formatCurrency(ord.totalAmount, activeOrganization.currency)}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="px-2.5 py-1 text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded font-semibold text-[11px] transition-colors cursor-pointer"
                        >
                          Détails
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Order Detail & Status Transition */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {selectedOrder.orderNumber} ({selectedOrder.tableName || selectedOrder.type})
                </h3>
                <div className="text-xs text-slate-400 dark:text-slate-500">
                  Pris à {formatTime(selectedOrder.createdAt)} par {selectedOrder.createdBy}
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedOrder.deliveryAddress && (
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-900 dark:text-amber-200">
                <span className="font-bold">Adresse de livraison : </span>
                <span>{selectedOrder.deliveryAddress}</span>
              </div>
            )}

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Articles commandés :</span>
              <div className="max-h-48 overflow-y-auto space-y-1.5 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {selectedOrder.items.map((it: any) => (
                  <div key={it.id} className="pt-1.5 first:pt-0 flex justify-between gap-2">
                    <div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {it.quantity}x {it.name}
                      </div>
                      {it.notes && <div className="text-[10px] text-amber-700 dark:text-amber-400 italic">Note: {it.notes}</div>}
                    </div>
                    <span className="font-mono font-medium text-slate-900 dark:text-white tabular-nums whitespace-nowrap">
                      {formatCurrency(it.totalPrice, activeOrganization.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Sous-total HT</span>
                <span className="font-mono tabular-nums">{formatCurrency(selectedOrder.subtotal, activeOrganization.currency)}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>TVA ({activeOrganization.taxRate}%)</span>
                <span className="font-mono tabular-nums">{formatCurrency(selectedOrder.taxAmount, activeOrganization.currency)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 dark:text-white text-sm pt-1 border-t border-slate-200 dark:border-slate-800">
                <span>Total TTC</span>
                <span className="font-mono tabular-nums text-amber-700 dark:text-amber-400">
                  {formatCurrency(selectedOrder.totalAmount, activeOrganization.currency)}
                </span>
              </div>
            </div>

            {/* Quick Status Advances */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
              {selectedOrder.status === 'pending' && (
                <button
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, 'confirmed');
                    setSelectedOrder(null);
                  }}
                  className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors whitespace-nowrap cursor-pointer"
                >
                  Accepter en cuisine
                </button>
              )}
              {selectedOrder.paymentStatus !== 'paid' && (
                <button
                  onClick={() => {
                    recordOrderPayment(selectedOrder.id, 'cash');
                    setSelectedOrder(null);
                  }}
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors whitespace-nowrap cursor-pointer"
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
                  className="flex-1 py-2 px-3 bg-[#0B192C] dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors whitespace-nowrap cursor-pointer"
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
