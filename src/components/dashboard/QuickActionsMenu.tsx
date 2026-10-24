import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useTranslation } from '../../translations';
import { formatCurrency } from '../../utils/formatters';
import { INITIAL_PROFILES } from '../../data/mockDatabase';
import {
  Zap,
  KeyRound,
  CalendarPlus,
  Clock,
  BellRing,
  ShoppingBag,
  Boxes,
  FileSpreadsheet,
  CheckCircle2,
  X,
  Lock,
  ChevronUp,
  UserCheck,
  Building,
  Volume2,
} from 'lucide-react';

export const QuickActionsMenu: React.FC = () => {
  const {
    state,
    language,
    currentUser,
    setActiveView,
    addAuditLog,
    createReservation,
    addInventoryMovement,
    updateTableStatus,
  } = useRestaurant();
  const t = useTranslation(language);

  const [isOpen, setIsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [showCashDrawerModal, setShowCashDrawerModal] = useState(false);
  const [cashDrawerReason, setCashDrawerReason] = useState('Monnaie pour client');

  const [showClockInModal, setShowClockInModal] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState(currentUser.id || INITIAL_PROFILES[0].id);
  const [enteredPin, setEnteredPin] = useState('');
  const [clockType, setClockType] = useState<'in' | 'out'>('in');
  const [clockError, setClockError] = useState('');

  const [showQuickReservationModal, setShowQuickReservationModal] = useState(false);
  const [resName, setResName] = useState('');
  const [resPhone, setResPhone] = useState('+237 6');
  const [resGuests, setResGuests] = useState(2);
  const [resTime, setResTime] = useState('20:00');
  const [resTableId, setResTableId] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sound synthesis utility for physical hardware feedback
  const playCashDrawerSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch (e) {
      // Audio fallback
    }
  };

  const playKitchenBellSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1560, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      // Audio fallback
    }
  };

  // 1. Action: Open Cash Drawer
  const handleOpenCashDrawer = () => {
    playCashDrawerSound();
    addAuditLog(
      'Ouverture tiroir-caisse',
      `Tiroir-caisse ouvert manuellement par ${currentUser.name} (${currentUser.role}). Motif: ${cashDrawerReason}`
    );
    setShowCashDrawerModal(false);
    showToast(
      language === 'fr'
        ? `Tiroir-caisse ouvert avec succès (${cashDrawerReason})`
        : `Cash drawer opened successfully (${cashDrawerReason})`
    );
  };

  // 2. Action: Clock In / Clock Out Staff
  const handleClockStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const staff = INITIAL_PROFILES.find((p) => p.id === selectedStaffId) || currentUser;

    if (staff.pinCode && enteredPin !== staff.pinCode) {
      setClockError(
        language === 'fr'
          ? `Code PIN erroné pour ${staff.name} (Code démo: ${staff.pinCode})`
          : `Invalid PIN for ${staff.name} (Demo PIN: ${staff.pinCode})`
      );
      return;
    }

    const actionText = clockType === 'in' ? 'Prise de poste (Arrivée)' : 'Fin de service (Départ)';
    addAuditLog(
      `Pointage horaire: ${actionText}`,
      `${staff.name} (${staff.role}) a validé son pointage à ${new Date().toLocaleTimeString('fr-FR')}`
    );

    setShowClockInModal(false);
    setEnteredPin('');
    setClockError('');
    showToast(
      language === 'fr'
        ? `Pointage validé : ${staff.name} (${actionText})`
        : `Clock recorded: ${staff.name} (${actionText})`
    );
  };

  // 3. Action: Add Quick Reservation
  const handleCreateQuickReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resName) return;

    createReservation({
      customerName: resName,
      customerPhone: resPhone,
      guestCount: Number(resGuests),
      date: new Date().toISOString().split('T')[0],
      time: resTime,
      area: 'Salle Principale',
      tableId: resTableId || undefined,
      tableName: resTableId ? state.tables.find((t) => t.id === resTableId)?.name : undefined,
      status: 'confirmed',
      notes: 'Réservation express créée depuis les Actions Rapides',
    });

    setShowQuickReservationModal(false);
    setResName('');
    showToast(
      language === 'fr'
        ? `Réservation enregistrée pour ${resName} (${resGuests} pers. à ${resTime})`
        : `Reservation booked for ${resName} (${resGuests} guests at ${resTime})`
    );
  };

  // 4. Action: Kitchen Server Call
  const handleKitchenCall = () => {
    playKitchenBellSound();
    addAuditLog(
      'Appel Cuisine vers Salle',
      `Chef de cuisine a émis un signal de plats prêts pour le service en salle`
    );
    showToast(
      language === 'fr'
        ? 'Signal de service envoyé en salle : Plats prêts pour le service !'
        : 'Kitchen alert sent to dining room: Dishes ready to serve!'
    );
  };

  // Determine authorized actions based on current role
  const isOwnerOrManager = currentUser.role === 'owner' || currentUser.role === 'manager' || currentUser.role === 'platform_admin';
  const isCashier = currentUser.role === 'cashier' || isOwnerOrManager;
  const isServer = currentUser.role === 'server' || isOwnerOrManager;
  const isKitchen = currentUser.role === 'kitchen' || isOwnerOrManager;
  const isInventory = currentUser.role === 'inventory' || isOwnerOrManager;

  return (
    <>
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl border border-amber-500/50 shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Floating Action Trigger & Menu Container */}
      <div className="fixed bottom-6 right-6 z-40 select-none">
        {/* Expanded Floating Menu */}
        {isOpen && (
          <div className="mb-3 w-80 bg-[#0B192C] text-slate-200 rounded-2xl border border-slate-700/80 shadow-2xl p-4 space-y-3 animate-in fade-in zoom-in-95">
            {/* Header with Role indicator */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-xs text-white">
                  {language === 'fr' ? 'Actions Rapides' : 'Quick Actions'}
                </span>
              </div>

              <span className="text-[10px] uppercase font-mono font-bold bg-slate-800 text-amber-400 px-2 py-0.5 rounded border border-slate-700">
                {currentUser.role}
              </span>
            </div>

            {/* List of Role-Tailored One-Click Actions */}
            <div className="space-y-1.5 text-xs">
              {/* Cashier / Manager: Open Cash Drawer */}
              {isCashier && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setShowCashDrawerModal(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-800/90 hover:text-white transition-colors group"
                >
                  <KeyRound className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-semibold text-slate-100">
                      {language === 'fr' ? 'Ouvrir le tiroir-caisse' : 'Open Cash Drawer'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {language === 'fr' ? 'Éjection manuelle & contrôle' : 'Manual cash eject'}
                    </div>
                  </div>
                </button>
              )}

              {/* Staff / All: Clock In Staff */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowClockInModal(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-800/90 hover:text-white transition-colors group"
              >
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                <div>
                  <div className="font-semibold text-slate-100">
                    {language === 'fr' ? 'Pointage équipe (Clock In/Out)' : 'Clock In / Out Staff'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {language === 'fr' ? 'Prise ou fin de service horodatée' : 'Record shift attendance'}
                  </div>
                </div>
              </button>

              {/* Server / Manager: Add Reservation */}
              {(isServer || isOwnerOrManager) && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setShowQuickReservationModal(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-800/90 hover:text-white transition-colors group"
                >
                  <CalendarPlus className="w-4 h-4 text-blue-400 shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-semibold text-slate-100">
                      {language === 'fr' ? 'Ajouter une réservation express' : 'Quick Reservation'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {language === 'fr' ? 'Blocage immédiat d’une table' : 'Instant table booking'}
                    </div>
                  </div>
                </button>
              )}

              {/* Kitchen: Ping Dining Room Server */}
              {isKitchen && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleKitchenCall();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-800/90 hover:text-white transition-colors group"
                >
                  <BellRing className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <div className="font-semibold text-slate-100">
                      {language === 'fr' ? 'Appel service salle (Plat prêt)' : 'Ping Waiter (Dishes Ready)'}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {language === 'fr' ? 'Signal sonore vers le personnel' : 'Kitchen call to floor'}
                    </div>
                  </div>
                </button>
              )}

              {/* Fast navigation shortcuts based on role */}
              <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-1.5 text-[11px]">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setActiveView('pos');
                  }}
                  className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                  <span>Vente POS</span>
                </button>

                <button
                  onClick={() => {
                    setIsOpen(false);
                    setActiveView('kitchen');
                  }}
                  className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <BellRing className="w-3.5 h-3.5 text-blue-400" />
                  <span>Écran KDS</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Trigger Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-full font-bold text-xs shadow-2xl transition-all duration-200 border ${
            isOpen
              ? 'bg-slate-900 text-white border-amber-500 scale-105'
              : 'bg-[#0B192C] text-amber-400 border-amber-500/40 hover:border-amber-400 hover:bg-slate-900 hover:scale-105'
          }`}
          title="Actions Rapides selon votre rôle"
        >
          <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
            <Zap className="w-3 h-3" />
          </div>
          <span className="font-semibold text-white">
            {language === 'fr' ? 'Actions Rapides' : 'Quick Actions'}
          </span>
          <ChevronUp
            className={`w-3.5 h-3.5 text-amber-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {/* MODAL 1: Open Cash Drawer Confirmation */}
      {showCashDrawerModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  {language === 'fr' ? 'Ouverture manuelle du tiroir' : 'Open Cash Drawer'}
                </h3>
              </div>
              <button
                onClick={() => setShowCashDrawerModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
              <p className="font-medium">
                {language === 'fr'
                  ? 'Cette opération physique est journalisée dans l’audit de sécurité de la caisse.'
                  : 'This physical operation will be recorded in the security audit log.'}
              </p>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-slate-700 block">Motif de l’ouverture :</label>
              <select
                value={cashDrawerReason}
                onChange={(e) => setCashDrawerReason(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-amber-500"
              >
                <option value="Monnaie pour client">Appoint de monnaie pour client</option>
                <option value="Comptage fond de caisse">Comptage de fond de caisse</option>
                <option value="Prélèvement d'espèces">Prélèvement d'espèces (Banque / Coffre)</option>
                <option value="Vérification technique caisse">Vérification technique / Test</option>
              </select>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setShowCashDrawerModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleOpenCashDrawer}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Déclencher l'ouverture</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Clock In / Clock Out Staff */}
      {showClockInModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  {language === 'fr' ? 'Pointage du Personnel' : 'Staff Clock-In Terminal'}
                </h3>
              </div>
              <button
                onClick={() => setShowClockInModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleClockStaff} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Employé :</label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => {
                    setSelectedStaffId(e.target.value);
                    setClockError('');
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-amber-500 font-medium"
                >
                  {INITIAL_PROFILES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.role.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Type de pointage :</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setClockType('in')}
                    className={`py-2 rounded-lg font-semibold border transition-colors ${
                      clockType === 'in'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Prise de poste
                  </button>
                  <button
                    type="button"
                    onClick={() => setClockType('out')}
                    className={`py-2 rounded-lg font-semibold border transition-colors ${
                      clockType === 'out'
                        ? 'border-rose-500 bg-rose-50 text-rose-800'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Fin de service
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Code PIN collaborateur :</label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  placeholder="Code PIN à 4 chiffres (ex: 1234, 3333)"
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono tracking-widest text-center text-sm focus:outline-none focus:border-amber-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Chaque membre d'équipe dispose d'un code PIN sécurisé.
                </span>
              </div>

              {clockError && (
                <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-[11px] font-semibold">
                  {clockError}
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowClockInModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-colors"
                >
                  Enregistrer pointage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Quick Reservation */}
      {showQuickReservationModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CalendarPlus className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  {language === 'fr' ? 'Réservation Express' : 'Quick Reservation'}
                </h3>
              </div>
              <button
                onClick={() => setShowQuickReservationModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuickReservation} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nom du client *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: M. Fabrice Noah"
                  value={resName}
                  onChange={(e) => setResName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={resPhone}
                    onChange={(e) => setResPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Couverts</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={resGuests}
                    onChange={(e) => setResGuests(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Heure de service</label>
                  <input
                    type="time"
                    value={resTime}
                    onChange={(e) => setResTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Table assignée</label>
                  <select
                    value={resTableId}
                    onChange={(e) => setResTableId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Sélection auto</option>
                    {state.tables.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.capacity}p)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowQuickReservationModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-colors"
                >
                  Bloquer la table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
