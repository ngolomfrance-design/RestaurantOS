import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useTranslation } from '../../translations';
import { Table, TableStatus } from '../../types/restaurant';
import { formatCurrency, getTableStatusBadge } from '../../utils/formatters';
import {
  LayoutGrid,
  Users,
  Clock,
  ArrowRightLeft,
  CheckCircle,
  Plus,
  Receipt,
  X,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

export const TableManagement: React.FC = () => {
  const { state, language, updateTableStatus, transferTableOrder, setActiveView } = useRestaurant();
  const t = useTranslation(language);

  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [activeTableModal, setActiveTableModal] = useState<Table | null>(null);
  const [transferTargetId, setTransferTargetId] = useState<string>('');
  const [transferError, setTransferError] = useState<string>('');

  const areas = [
    { id: 'all', labelFr: 'Tout l’établissement', labelEn: 'All Areas' },
    { id: 'main_hall', labelFr: 'Salle Principale', labelEn: 'Main Dining Hall' },
    { id: 'terrace', labelFr: 'Terrasse Jardin', labelEn: 'Garden Terrace' },
    { id: 'vip_lounge', labelFr: 'Salons VIP Privés', labelEn: 'VIP Lounges' },
    { id: 'bar', labelFr: 'Comptoir Bar', labelEn: 'Bar Counter' },
  ];

  const filteredTables = state.tables.filter(
    (t) => selectedArea === 'all' || t.area === selectedArea
  );

  const occupiedCount = state.tables.filter((t) => t.status === 'occupied').length;
  const availableCount = state.tables.filter((t) => t.status === 'available').length;
  const reservedCount = state.tables.filter((t) => t.status === 'reserved').length;
  const cleaningCount = state.tables.filter((t) => t.status === 'cleaning').length;

  const handleTableClick = (table: Table) => {
    setActiveTableModal(table);
    setTransferTargetId('');
    setTransferError('');
  };

  const handleTransfer = () => {
    if (!activeTableModal || !transferTargetId) return;
    const success = transferTableOrder(activeTableModal.id, transferTargetId);
    if (success) {
      setActiveTableModal(null);
    } else {
      setTransferError(
        language === 'fr'
          ? 'Transfert impossible : la table cible n’est pas libre.'
          : 'Transfer failed: target table is not available.'
      );
    }
  };

  // Find linked order if occupied
  const linkedOrder = activeTableModal?.currentOrderId
    ? state.orders.find((o) => o.id === activeTableModal.currentOrderId)
    : null;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header and Live Occupancy Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {t.tables.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {state.organization.name} · {t.tables.subtitle}
          </p>
        </div>

        {/* Status Counter Pills (Interactive stats) */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold font-mono tabular-nums">{availableCount}</span>
            <span>{t.tables.status.available}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="font-semibold font-mono tabular-nums">{occupiedCount}</span>
            <span>{t.tables.status.occupied}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="font-semibold font-mono tabular-nums">{reservedCount}</span>
            <span>{t.tables.status.reserved}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span className="font-semibold font-mono tabular-nums">{cleaningCount}</span>
            <span>{t.tables.status.cleaning}</span>
          </div>
        </div>
      </div>

      {/* Area Selector Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {areas.map((a) => (
          <button
            key={a.id}
            onClick={() => setSelectedArea(a.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              selectedArea === a.id
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {language === 'fr' ? a.labelFr : a.labelEn}
          </button>
        ))}
      </div>

      {/* Visual Table Grid / Floor Plan */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {filteredTables.map((table) => {
          const badge = getTableStatusBadge(table.status, language);
          const isOccupied = table.status === 'occupied';
          const isCleaning = table.status === 'cleaning';
          const isReserved = table.status === 'reserved';

          return (
            <div
              key={table.id}
              onClick={() => handleTableClick(table)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[140px] hover:shadow-md ${
                isOccupied
                  ? 'border-rose-300 bg-rose-50/30 hover:border-rose-400'
                  : isReserved
                  ? 'border-amber-300 bg-amber-50/20 hover:border-amber-400'
                  : isCleaning
                  ? 'border-sky-300 bg-sky-50/20 hover:border-sky-400'
                  : 'border-emerald-200 bg-white hover:border-emerald-400'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-base font-bold text-slate-900 tracking-tight">
                    {table.number}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium truncate max-w-[110px]">
                    {table.name}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{table.capacity}</span>
                </div>
              </div>

              {/* Status & Active Order Info */}
              <div className="mt-4 pt-2 border-t border-slate-100 flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-semibold text-[11px] ${badge.color}`}>{badge.label}</span>
                </div>
                {table.currentGuestName && (
                  <div className="text-[11px] font-medium text-slate-700 truncate">
                    {table.currentGuestName}
                  </div>
                )}
                {isOccupied && table.seatedAt && (
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Depuis 12h40</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Table Detail, Bill Review, Order Transfer & Status Management */}
      {activeTableModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {activeTableModal.name} ({activeTableModal.capacity} personnes)
                </h3>
                <div className="text-xs text-slate-500">
                  Zone : {areas.find((a) => a.id === activeTableModal.area)?.labelFr || activeTableModal.area}
                </div>
              </div>
              <button
                onClick={() => setActiveTableModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Override */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Changer l'état de la table</label>
              <div className="grid grid-cols-4 gap-2">
                {(['available', 'occupied', 'reserved', 'cleaning'] as TableStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      updateTableStatus(activeTableModal.id, st);
                      setActiveTableModal({ ...activeTableModal, status: st });
                    }}
                    className={`py-2 px-2 rounded-lg text-xs font-medium border text-center transition-colors ${
                      activeTableModal.status === st
                        ? 'border-slate-900 bg-slate-900 text-white font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {getTableStatusBadge(st, language).label}
                  </button>
                ))}
              </div>
            </div>

            {/* If Occupied with an Active Order */}
            {linkedOrder && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-slate-600" />
                    Commande en cours : {linkedOrder.orderNumber}
                  </span>
                  <span className="font-mono font-bold text-xs text-amber-700">
                    {formatCurrency(linkedOrder.totalAmount, state.organization.currency)}
                  </span>
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1 divide-y divide-slate-100 text-xs">
                  {linkedOrder.items.map((it) => (
                    <div key={it.id} className="pt-1 first:pt-0 flex justify-between text-slate-700">
                      <span>{it.quantity}x {it.name}</span>
                      <span className="font-mono tabular-nums">
                        {formatCurrency(it.totalPrice, state.organization.currency)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Transfer Order to another available table */}
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <div className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500" />
                    <span>Transférer l'addition vers une autre table libre</span>
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={transferTargetId}
                      onChange={(e) => setTransferTargetId(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      <option value="">Sélectionner une table libre...</option>
                      {state.tables
                        .filter((t) => t.id !== activeTableModal.id && t.status === 'available')
                        .map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.capacity} pers.)
                          </option>
                        ))}
                    </select>
                    <button
                      disabled={!transferTargetId}
                      onClick={handleTransfer}
                      className="px-3 py-1.5 bg-slate-900 disabled:opacity-40 text-white font-medium text-xs rounded-lg transition-colors"
                    >
                      Transférer
                    </button>
                  </div>
                  {transferError && (
                    <div className="text-xs text-rose-600 font-medium">{transferError}</div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions Footer */}
            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => {
                  setActiveTableModal(null);
                  setActiveView('pos');
                }}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Prendre commande sur cette table</span>
              </button>
              {activeTableModal.status === 'cleaning' && (
                <button
                  onClick={() => {
                    updateTableStatus(activeTableModal.id, 'available');
                    setActiveTableModal(null);
                  }}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors"
                >
                  Marquer libre
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
