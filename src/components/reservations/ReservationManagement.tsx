import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useTranslation } from '../../translations';
import { Reservation } from '../../types/restaurant';
import {
  CalendarDays,
  Plus,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
  UserCheck,
  X,
  Search,
} from 'lucide-react';

export const ReservationManagement: React.FC = () => {
  const { scopedReservations, scopedTables, language, createReservation, updateReservationStatus } = useRestaurant();
  const t = useTranslation(language);

  const todayStr = new Date().toISOString().split('T')[0];
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [filterDate, setFilterDate] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '+237 6',
    customerEmail: '',
    guestCount: 2,
    date: todayStr,
    time: '20:00',
    area: 'Salle Principale',
    tableId: '',
    notes: '',
  });

  const filteredReservations = scopedReservations.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const matchesDate = !filterDate || r.date === filterDate;
    return matchesStatus && matchesDate;
  });

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.date || !formData.time) return;

    createReservation({
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerEmail: formData.customerEmail,
      guestCount: Number(formData.guestCount),
      date: formData.date,
      time: formData.time,
      area: formData.area,
      tableId: formData.tableId || undefined,
      tableName: formData.tableId
        ? scopedTables.find((t) => t.id === formData.tableId)?.name
        : undefined,
      status: 'confirmed',
      notes: formData.notes,
    });

    setShowCreateModal(false);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t.nav.reservations}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'fr'
              ? 'Gestion des réservations en salle et demandes en ligne'
              : 'Dining room reservations, seating allocations, and online booking requests'}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0B192C] dark:bg-amber-500 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-amber-400 rounded-lg shadow-xs transition-colors self-start sm:self-auto whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{language === 'fr' ? 'Nouvelle Réservation' : 'New Reservation'}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg text-xs font-mono tabular-nums font-medium focus:outline-none focus:border-amber-500"
          />
          {filterDate && (
            <button
              onClick={() => setFilterDate('')}
              className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              Toutes dates
            </button>
          )}
          <div className="flex items-center gap-1 flex-wrap">
            {['all', 'confirmed', 'pending', 'seated'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#0B192C] dark:bg-amber-500 text-white dark:text-slate-950 font-semibold'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {st === 'all' ? 'Toutes' : st}
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums whitespace-nowrap">
          {filteredReservations.length} {language === 'fr' ? 'réservations trouvées' : 'bookings'}
        </div>
      </div>

      {/* Reservation Cards / Grid */}
      {filteredReservations.length === 0 ? (
        <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500 space-y-2">
          <CalendarDays className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
          <p>Aucune réservation trouvée pour ces filtres.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReservations.map((res) => {
            const isConfirmed = res.status === 'confirmed';
            const isPending = res.status === 'pending';
            const isSeated = res.status === 'seated';

            return (
              <div
                key={res.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-4 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">{res.customerName}</h3>
                        {res.reservationCode && (
                          <span className="font-mono tabular-nums text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-1.5 py-0.5 rounded">
                            {res.reservationCode}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="font-mono tabular-nums">{res.customerPhone}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize whitespace-nowrap shrink-0 ${
                        isConfirmed
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : isPending
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          : isSeated
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {res.status}
                    </span>
                  </div>

                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium">Date & Heure</span>
                      <span className="font-mono tabular-nums font-bold text-slate-800 dark:text-slate-200">
                        {res.time} · {res.date}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium">Couverts & Table</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 font-mono tabular-nums">
                        {res.guestCount} pers. ({res.tableName || res.area})
                      </span>
                    </div>
                  </div>

                  {res.notes && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 italic bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100/60 dark:border-amber-900/60 p-2 rounded-lg mt-2">
                      Note: {res.notes}
                    </div>
                  )}
                </div>

                {/* Status Action Buttons */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  {isPending && (
                    <button
                      onClick={() => updateReservationStatus(res.id, 'confirmed')}
                      className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Confirmer
                    </button>
                  )}
                  {isConfirmed && (
                    <button
                      onClick={() => updateReservationStatus(res.id, 'seated')}
                      className="flex-1 py-1.5 px-3 bg-[#0B192C] dark:bg-amber-500 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-amber-400 text-white font-semibold text-xs rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Installer à table
                    </button>
                  )}
                  {isSeated && (
                    <div className="text-xs text-indigo-700 dark:text-indigo-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>En cours de repas</span>
                    </div>
                  )}
                  {res.status !== 'cancelled' && !isSeated && (
                    <button
                      onClick={() => updateReservationStatus(res.id, 'cancelled')}
                      className="px-2.5 py-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 text-xs transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Create Reservation */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Enregistrer une réservation</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReservation} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nom du client *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: M. Paul Kamga"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Téléphone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg font-mono tabular-nums focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Couverts (personnes) *</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={formData.guestCount}
                    onChange={(e) => setFormData({ ...formData, guestCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg font-mono tabular-nums focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg font-mono tabular-nums focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Heure de service *</label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg font-mono tabular-nums focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Zone souhaitée</label>
                  <select
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Salle Principale">Salle Principale</option>
                    <option value="Terrasse">Terrasse Jardin</option>
                    <option value="VIP Lounge">Salon VIP</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Table pré-affectée</label>
                  <select
                    value={formData.tableId}
                    onChange={(e) => setFormData({ ...formData, tableId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Automatique selon dispo</option>
                    {scopedTables.map((tb) => (
                      <option key={tb.id} value={tb.id}>
                        {tb.name} ({tb.capacity} pers.)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Notes & Demandes particulières</label>
                <input
                  type="text"
                  placeholder="Ex: Fête d’anniversaire, table au calme..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0B192C] dark:bg-amber-500 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-amber-400 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Valider la réservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
