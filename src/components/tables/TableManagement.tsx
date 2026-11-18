import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useTranslation } from '../../translations';
import { Table, TableStatus } from '../../types/restaurant';
import { formatCurrency, formatTime, getTableStatusBadge } from '../../utils/formatters';
import {
  Users,
  Clock,
  ArrowRightLeft,
  Receipt,
  X,
  QrCode,
  Copy,
  Check,
  Eye,
} from 'lucide-react';

export const TableManagement: React.FC = () => {
  const {
    scopedTables,
    scopedOrders,
    activeOrganization,
    language,
    updateTableStatus,
    transferTableOrder,
    setActiveView,
    openPublicStorefront,
  } = useRestaurant();
  const t = useTranslation(language);

  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [activeTableModal, setActiveTableModal] = useState<Table | null>(null);
  const [transferTargetId, setTransferTargetId] = useState<string>('');
  const [transferError, setTransferError] = useState<string>('');
  const [copiedTableQr, setCopiedTableQr] = useState<boolean>(false);

  const areas = [
    { id: 'all', labelFr: 'Tout l’établissement', labelEn: 'All Areas' },
    { id: 'main_hall', labelFr: 'Salle Principale', labelEn: 'Main Dining Hall' },
    { id: 'terrace', labelFr: 'Terrasse Jardin', labelEn: 'Garden Terrace' },
    { id: 'vip_lounge', labelFr: 'Salons VIP Privés', labelEn: 'VIP Lounges' },
    { id: 'bar', labelFr: 'Comptoir Bar', labelEn: 'Bar Counter' },
  ];

  const filteredTables = scopedTables.filter(
    (tb) => selectedArea === 'all' || tb.area === selectedArea
  );

  const occupiedCount = scopedTables.filter((tb) => tb.status === 'occupied').length;
  const availableCount = scopedTables.filter((tb) => tb.status === 'available').length;
  const reservedCount = scopedTables.filter((tb) => tb.status === 'reserved').length;
  const cleaningCount = scopedTables.filter((tb) => tb.status === 'cleaning').length;

  const handleTableClick = (table: Table) => {
    setActiveTableModal(table);
    setTransferTargetId('');
    setTransferError('');
    setCopiedTableQr(false);
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
    ? scopedOrders.find((o) => o.id === activeTableModal.currentOrderId)
    : null;

  const getTableQrUrl = (tableNumber: string) =>
    `${window.location.origin}/menu/${activeOrganization.slug || activeOrganization.id}?table=${encodeURIComponent(tableNumber)}`;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header and Live Occupancy Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t.tables.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {activeOrganization.name} · {t.tables.subtitle}
          </p>
        </div>

        {/* Status Summary Strip */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="font-bold font-mono tabular-nums">{availableCount}</span>
            <span className="whitespace-nowrap">{t.tables.status.available}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <span className="font-bold font-mono tabular-nums">{occupiedCount}</span>
            <span className="whitespace-nowrap">{t.tables.status.occupied}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <span className="font-bold font-mono tabular-nums">{reservedCount}</span>
            <span className="whitespace-nowrap">{t.tables.status.reserved}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
            <span className="font-bold font-mono tabular-nums">{cleaningCount}</span>
            <span className="whitespace-nowrap">{t.tables.status.cleaning}</span>
          </div>
        </div>
      </div>

      {/* Area Selector Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto scrollbar-none">
        {areas.map((a) => (
          <button
            key={a.id}
            onClick={() => setSelectedArea(a.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              selectedArea === a.id
                ? 'bg-[#0B192C] dark:bg-amber-500 text-white dark:text-slate-950 font-semibold'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
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
            <button
              type="button"
              key={table.id}
              onClick={() => handleTableClick(table)}
              className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between min-h-[140px] hover:shadow-md ${
                isOccupied
                  ? 'border-rose-300 dark:border-rose-800 bg-rose-50/40 dark:bg-rose-950/30 hover:border-rose-400'
                  : isReserved
                  ? 'border-amber-300 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/30 hover:border-amber-400'
                  : isCleaning
                  ? 'border-sky-300 dark:border-sky-800 bg-sky-50/30 dark:bg-sky-950/30 hover:border-sky-400'
                  : 'border-emerald-200 dark:border-emerald-900/70 bg-white dark:bg-slate-900 hover:border-emerald-400 dark:hover:border-emerald-600'
              }`}
            >
              <div className="flex items-start justify-between w-full gap-2">
                <div className="min-w-0">
                  <div className="text-base font-bold text-slate-900 dark:text-white tracking-tight font-mono tabular-nums">
                    {table.number}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                    {table.name}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium shrink-0 font-mono tabular-nums">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{table.capacity}</span>
                </div>
              </div>

              {/* Status & Active Order Info */}
              <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-1 w-full">
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-semibold text-[11px] ${badge.color}`}>{badge.label}</span>
                </div>
                {table.currentGuestName && (
                  <div className="text-[11px] font-medium text-slate-700 dark:text-slate-200 truncate">
                    {table.currentGuestName}
                  </div>
                )}
                {isOccupied && table.seatedAt && (
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-mono tabular-nums">
                    <Clock className="w-3 h-3" />
                    <span>Depuis {formatTime(table.seatedAt)}</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* MODAL: Table Detail, Bill Review, Order Transfer & Status Management */}
      {activeTableModal && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {activeTableModal.name} ({activeTableModal.capacity} personnes)
                </h3>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Zone : {areas.find((a) => a.id === activeTableModal.area)?.labelFr || activeTableModal.area}
                </div>
              </div>
              <button
                onClick={() => setActiveTableModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Override */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Changer l&apos;état de la table</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['available', 'occupied', 'reserved', 'cleaning'] as TableStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      updateTableStatus(activeTableModal.id, st);
                      setActiveTableModal({ ...activeTableModal, status: st });
                    }}
                    className={`py-2 px-2 rounded-lg text-xs font-medium border text-center transition-colors whitespace-nowrap cursor-pointer ${
                      activeTableModal.status === st
                        ? 'border-[#0B192C] dark:border-amber-500 bg-[#0B192C] dark:bg-amber-500 text-white dark:text-slate-950 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {getTableStatusBadge(st, language).label}
                  </button>
                ))}
              </div>
            </div>

            {/* If Occupied with an Active Order */}
            {linkedOrder && (
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    Commande en cours : {linkedOrder.orderNumber}
                  </span>
                  <span className="font-mono tabular-nums font-bold text-xs text-amber-700 dark:text-amber-400 whitespace-nowrap">
                    {formatCurrency(linkedOrder.totalAmount, activeOrganization.currency)}
                  </span>
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {linkedOrder.items.map((it) => (
                    <div key={it.id} className="pt-1 first:pt-0 flex justify-between text-slate-700 dark:text-slate-300">
                      <span>{it.quantity}x {it.name}</span>
                      <span className="font-mono tabular-nums">
                        {formatCurrency(it.totalPrice, activeOrganization.currency)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Transfer Order to another available table */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>Transférer l&apos;addition vers une autre table libre</span>
                  </div>

                  <div className="flex gap-2">
                    <select
                      value={transferTargetId}
                      onChange={(e) => setTransferTargetId(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-xs"
                    >
                      <option value="">Sélectionner une table libre...</option>
                      {scopedTables
                        .filter((tb) => tb.id !== activeTableModal.id && tb.status === 'available')
                        .map((tb) => (
                          <option key={tb.id} value={tb.id}>
                            {tb.name} ({tb.capacity} pers.)
                          </option>
                        ))}
                    </select>
                    <button
                      disabled={!transferTargetId}
                      onClick={handleTransfer}
                      className="px-3 py-1.5 bg-[#0B192C] dark:bg-amber-500 dark:text-slate-950 disabled:opacity-40 text-white font-semibold text-xs rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Transférer
                    </button>
                  </div>
                  {transferError && (
                    <div className="text-xs text-rose-600 dark:text-rose-400 font-medium">{transferError}</div>
                  )}
                </div>
              </div>
            )}

            {/* Table QR Code Generator (Public Table Ordering URL - Zero Admin Secrets) */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-20 h-20 rounded-xl border border-slate-200 dark:border-slate-700 bg-white p-1.5 shrink-0 flex items-center justify-center">
                <QRCodeSVG
                  value={getTableQrUrl(activeTableModal.number)}
                  size={68}
                  level="M"
                  bgColor="#FFFFFF"
                  fgColor="#0B192C"
                />
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                  <QrCode className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>QR Code Public — {activeTableModal.name}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                  {getTableQrUrl(activeTableModal.number)}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(getTableQrUrl(activeTableModal.number));
                      setCopiedTableQr(true);
                      setTimeout(() => setCopiedTableQr(false), 2000);
                    }}
                    className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1 whitespace-nowrap cursor-pointer"
                  >
                    {copiedTableQr ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedTableQr ? 'Copié' : 'Copier lien'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const tableNum = activeTableModal.number;
                      setActiveTableModal(null);
                      openPublicStorefront(true, tableNum);
                    }}
                    className="px-2.5 py-1 bg-[#0B192C] dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-[11px] font-semibold text-white flex items-center gap-1 whitespace-nowrap cursor-pointer"
                  >
                    <Eye className="w-3 h-3 text-amber-400" />
                    <span>Voir comme un client</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              <button
                onClick={() => {
                  setActiveTableModal(null);
                  setActiveView('pos');
                }}
                className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <span>Prendre commande sur cette table</span>
              </button>
              {activeTableModal.status === 'cleaning' && (
                <button
                  onClick={() => {
                    updateTableStatus(activeTableModal.id, 'available');
                    setActiveTableModal(null);
                  }}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors whitespace-nowrap cursor-pointer"
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
