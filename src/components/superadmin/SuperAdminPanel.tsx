import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { formatCurrency } from '../../utils/formatters';
import {
  SubscriptionPlanId,
  SubscriptionPlan,
  UserRole,
  SupportTicket,
} from '../../types/restaurant';
import {
  Building2,
  Users,
  TrendingUp,
  Search,
  ExternalLink,
  CheckCircle2,
  Clock,
  Edit2,
  Save,
  RotateCcw,
  Receipt,
  LifeBuoy,
  Settings,
  XCircle,
  Check,
  ShieldCheck,
  Mail,
  Phone,
  Instagram,
} from 'lucide-react';

export const SuperAdminPanel: React.FC = () => {
  const {
    state,
    resetToDemo,
    updateSubscriptionPlanPrice,
    updateSubscriptionPlan,
    approveBillingTransaction,
    rejectBillingTransaction,
    updateUserRole,
    updatePlatformSettings,
    toggleRestaurantStatus,
    extendTrialDays,
    activateSubscriptionManually,
    updateSupportTicketStatus,
    switchOrganization,
    navigateTo,
  } = useRestaurant();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'billing' | 'plans' | 'support' | 'settings'
  >('overview');

  // Overview filters
  const [searchOrg, setSearchOrg] = useState('');
  const [orgFilter, setOrgFilter] = useState<'all' | 'active' | 'trial' | 'expired' | 'archived'>('all');

  // Users filters
  const [searchUser, setSearchUser] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | UserRole>('all');

  // Billing filters
  const [txFilter, setTxFilter] = useState<'all' | 'pending' | 'confirmed' | 'failed'>('all');

  // Plan editor
  const [editingPlanId, setEditingPlanId] = useState<SubscriptionPlanId | null>(null);
  const [editingPlanPrice, setEditingPlanPrice] = useState<number>(0);
  const [editingPlanMaxLoc, setEditingPlanMaxLoc] = useState<number>(1);
  const [editingPlanAi, setEditingPlanAi] = useState<boolean>(false);
  const [planError, setPlanError] = useState<string | null>(null);

  // Support ticket inline note
  const [ticketNoteDrafts, setTicketNoteDrafts] = useState<Record<string, string>>({});
  const [supportFilter, setSupportFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');

  // Platform Settings draft
  const [settingsSavedMsg, setSettingsSavedMsg] = useState(false);
  const [settingsForm, setSettingsForm] = useState(() => state.platformSettings);

  const [confirmResetDemo, setConfirmResetDemo] = useState(false);

  // Organizations calculations
  const allOrganizations = state.organizations;
  const nowMs = Date.now();
  const getEffectiveSubStatus = (org: (typeof allOrganizations)[number]) => {
    if (org.subscriptionStatus === 'active') return 'active';
    if (
      org.subscriptionStatus === 'expired' ||
      (org.subscriptionStatus === 'trial' && org.trialEndsAt && new Date(org.trialEndsAt).getTime() <= nowMs)
    ) {
      return 'expired';
    }
    return org.subscriptionStatus;
  };

  const filteredOrgs = allOrganizations.filter((o) => {
    const matchesSearch =
      o.name.toLowerCase().includes(searchOrg.toLowerCase()) ||
      o.city.toLowerCase().includes(searchOrg.toLowerCase()) ||
      o.country.toLowerCase().includes(searchOrg.toLowerCase());
    if (!matchesSearch) return false;
    const effStatus = getEffectiveSubStatus(o);
    if (orgFilter === 'archived') return o.status === 'archived';
    if (orgFilter === 'active') return o.status !== 'archived' && effStatus === 'active';
    if (orgFilter === 'trial') return o.status !== 'archived' && effStatus === 'trial';
    if (orgFilter === 'expired') return o.status !== 'archived' && effStatus === 'expired';
    return true;
  });

  // Billing analytics
  const billingTransactions = state.billingTransactions || [];
  const confirmedTransactions = billingTransactions.filter((tx) => tx.status === 'confirmed');
  const pendingTransactions = billingTransactions.filter((tx) => tx.status === 'pending');
  const filteredTransactions = billingTransactions.filter((tx) =>
    txFilter === 'all' ? true : tx.status === txFilter
  );

  const totalConfirmedRevenue = confirmedTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const totalPendingRevenue = pendingTransactions.reduce((sum, tx) => sum + tx.amount, 0);

  // Global Platform GMV (sum of all paid restaurant orders across platform)
  const totalPlatformOrders = state.orders.length;
  const totalPlatformGmv = state.orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalMrr = allOrganizations
    .filter((o) => o.status !== 'archived' && getEffectiveSubStatus(o) === 'active')
    .reduce((sum, o) => {
      const plan = state.subscriptionPlans.find((p) => p.id === o.subscriptionPlan);
      return sum + (plan ? plan.priceXAF : 20000);
    }, 0);

  const activeTenantsCount = allOrganizations.filter((o) => o.status !== 'archived').length;
  const trialTenantsCount = allOrganizations.filter(
    (o) => o.status !== 'archived' && getEffectiveSubStatus(o) === 'trial'
  ).length;
  const expiredTenantsCount = allOrganizations.filter(
    (o) => o.status !== 'archived' && getEffectiveSubStatus(o) === 'expired'
  ).length;
  const activePaidCount = allOrganizations.filter(
    (o) => o.status !== 'archived' && getEffectiveSubStatus(o) === 'active'
  ).length;

  // Users directory
  const allUsers = state.users || [];
  const filteredUsers = allUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase());
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Support Tickets
  const supportTickets = state.supportTickets || [];
  const openTicketsCount = supportTickets.filter((t) => t.status !== 'resolved').length;
  const filteredTickets = supportTickets.filter((t) =>
    supportFilter === 'all' ? true : t.status === supportFilter
  );

  const handleStartEditPlan = (plan: SubscriptionPlan) => {
    setPlanError(null);
    setEditingPlanId(plan.id);
    setEditingPlanPrice(plan.priceXAF);
    setEditingPlanMaxLoc(plan.maxLocations);
    setEditingPlanAi(plan.aiIncluded);
  };

  const handleSavePlan = (planId: SubscriptionPlanId) => {
    if (editingPlanPrice <= 0) {
      setPlanError('Le montant mensuel doit être supérieur à 0 XAF.');
      return;
    }
    setPlanError(null);
    updateSubscriptionPlanPrice(planId, Number(editingPlanPrice));
    updateSubscriptionPlan(planId, {
      priceXAF: Number(editingPlanPrice),
      maxLocations: Math.max(1, Number(editingPlanMaxLoc)),
      aiIncluded: editingPlanAi,
    });
    setEditingPlanId(null);
  };

  const handleSavePlatformSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updatePlatformSettings(settingsForm);
    setSettingsSavedMsg(true);
    setTimeout(() => setSettingsSavedMsg(false), 3000);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title & Operator Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-[#0B192C] text-white p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              DATA WORK AGENCY · ENTERPRISE CONSOLE
            </span>
            {pendingTransactions.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                {pendingTransactions.length} paiement(s) à valider
              </span>
            )}
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white mt-1">
            Administration Plateforme RestaurantOS
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Supervision multi-tenant, validation des paiements, utilisateurs, support et paramètres SaaS · +237 690 37 04 54
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={() => navigateTo('database_schema')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span>Schéma Supabase RLS</span>
          </button>

          {!confirmResetDemo ? (
            <button
              onClick={() => setConfirmResetDemo(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-300 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/80 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser Démo</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 bg-rose-950 border border-rose-700 px-2.5 py-1 rounded-lg">
              <span className="text-[11px] text-rose-200 font-medium">Confirmer ?</span>
              <button
                onClick={() => {
                  resetToDemo();
                  setConfirmResetDemo(false);
                }}
                className="px-2 py-0.5 text-[11px] font-bold bg-rose-600 hover:bg-rose-500 text-white rounded cursor-pointer"
              >
                Oui
              </button>
              <button
                onClick={() => setConfirmResetDemo(false)}
                className="px-2 py-0.5 text-[11px] font-medium text-slate-300 hover:text-white cursor-pointer"
              >
                Non
              </button>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Revenus SaaS Confirmés</span>
            <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-1.5">
            {formatCurrency(totalConfirmedRevenue, 'XAF')}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            {confirmedTransactions.length} facture(s) confirmée(s)
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">MRR Actif</span>
            <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-1.5">
            {formatCurrency(totalMrr, 'XAF')}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Volume POS : {formatCurrency(totalPlatformGmv, 'XAF')} ({totalPlatformOrders} cmd)
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Établissements</span>
            <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-1.5">
            {activeTenantsCount} actif(s)
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {activePaidCount} payant · {trialTenantsCount} essai · {expiredTenantsCount} expiré
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Utilisateurs</span>
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-1.5">
            {allUsers.length} compte(s)
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {(state.staffInvitations || []).filter((i) => !i.isAccepted && !i.isRevoked).length} invitation(s) ouverte(s)
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">À Traiter (Paiements / Support)</span>
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-lg font-bold text-amber-700 dark:text-amber-400 font-mono tabular-nums mt-1.5">
            {formatCurrency(totalPendingRevenue, 'XAF')}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {pendingTransactions.length} tx en attente · {openTicketsCount} ticket(s)
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center p-1 bg-slate-200/80 dark:bg-slate-800/80 rounded-xl text-xs font-medium w-full overflow-x-auto gap-1">
        {(
          [
            { id: 'overview', label: `Établissements (${allOrganizations.length})` },
            { id: 'users', label: `Utilisateurs & Rôles (${allUsers.length})` },
            {
              id: 'billing',
              label: `Transactions (${billingTransactions.length})`,
              badge: pendingTransactions.length,
            },
            { id: 'plans', label: `Formules & Tarifs (${state.subscriptionPlans.length})` },
            { id: 'support', label: `Assistance (${supportTickets.length})`, badge: openTicketsCount },
            { id: 'settings', label: 'Paramètres SaaS' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            {'badge' in tab && tab.badge && tab.badge > 0 ? (
              <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 text-[10px] font-bold tabular-nums">
                {tab.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* ================= TAB 1: TENANTS ================= */}
      {activeTab === 'overview' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden space-y-4">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
            <div>
              <h2 className="text-xs font-bold text-slate-900 dark:text-white">
                Instances Multi-Tenant Gérées par DATA WORK AGENCY
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Isolation stricte par établissement, contrôle des licences (essai max 7 jours) et activation manuelle.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-[11px]">
                {(
                  [
                    { id: 'all', label: 'Tous' },
                    { id: 'active', label: 'Actifs' },
                    { id: 'trial', label: 'Essai' },
                    { id: 'expired', label: 'Expirés' },
                    { id: 'archived', label: 'Suspendus' },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setOrgFilter(f.id)}
                    className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                      orgFilter === f.id
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher nom, ville..."
                  value={searchOrg}
                  onChange={(e) => setSearchOrg(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-semibold">
                  <th className="py-3 px-4">Restaurant</th>
                  <th className="py-3 px-3">Localisation</th>
                  <th className="py-3 px-3">Formule</th>
                  <th className="py-3 px-3">Licence</th>
                  <th className="py-3 px-3 text-right">Volume POS</th>
                  <th className="py-3 px-3 text-center">Instance</th>
                  <th className="py-3 px-4 text-right">Actions Opérateur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrgs.map((org) => {
                  const isArchived = org.status === 'archived';
                  const effStatus = getEffectiveSubStatus(org);
                  const orgOrders = state.orders.filter((o) => o.orgId === org.id);
                  const orgGmv = orgOrders
                    .filter((o) => o.paymentStatus === 'paid')
                    .reduce((s, o) => s + o.totalAmount, 0);

                  return (
                    <tr key={org.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{org.name}</span>
                          {org.isDemo && (
                            <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.2 rounded font-normal">
                              Démo
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {org.email || org.id} · {org.currency}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        {org.city}, {org.country}
                      </td>
                      <td className="py-3 px-3">
                        <span className="uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {org.subscriptionPlan}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            effStatus === 'active'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : effStatus === 'expired'
                              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {effStatus === 'active'
                            ? 'Abonnement Actif'
                            : effStatus === 'expired'
                            ? 'Expiré'
                            : 'Essai 7 Jours'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-900 dark:text-white tabular-nums">
                        <div className="font-bold">{formatCurrency(orgGmv, org.currency)}</div>
                        <div className="text-[10px] text-slate-400">{orgOrders.length} cmd</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            isArchived
                              ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                              : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          }`}
                        >
                          {isArchived ? 'Suspendu' : 'Opérationnel'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            onClick={() => extendTrialDays(org.id, 7)}
                            className="px-2 py-1 text-[10px] font-bold bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 rounded transition-colors cursor-pointer"
                            title="Accorder +7 jours d'essai"
                          >
                            +7j Essai
                          </button>
                          {effStatus !== 'active' && (
                            <button
                              onClick={() => activateSubscriptionManually(org.id, org.subscriptionPlan || 'business', 1)}
                              className="px-2 py-1 text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 rounded transition-colors cursor-pointer"
                              title="Activer l'abonnement manuellement pour 1 mois"
                            >
                              Activer 1 mois
                            </button>
                          )}
                          <button
                            onClick={() => {
                              switchOrganization(org.id);
                              navigateTo('dashboard');
                            }}
                            className="px-2 py-1 text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded transition-colors cursor-pointer"
                          >
                            Ouvrir
                          </button>
                          <button
                            onClick={() => toggleRestaurantStatus(org.id)}
                            className={`px-2 py-1 text-[10px] font-semibold rounded transition-colors cursor-pointer ${
                              isArchived
                                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 border border-rose-200 dark:border-rose-800'
                            }`}
                          >
                            {isArchived ? 'Réactiver' : 'Suspendre'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredOrgs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Aucun établissement ne correspond à ce filtre.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 2: USERS & ROLES ================= */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xs font-bold text-slate-900 dark:text-white">
                Répertoire Global des Utilisateurs & Contrôle des Rôles
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Gérez les comptes propriétaires, gérants, caissiers et opérateurs plateforme.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
              >
                <option value="all">Tous les rôles</option>
                <option value="owner">Propriétaire (owner)</option>
                <option value="manager">Manager</option>
                <option value="cashier">Caissier</option>
                <option value="server">Serveur</option>
                <option value="kitchen">Cuisine</option>
                <option value="inventory">Économat</option>
                <option value="platform_admin">Super Admin</option>
              </select>
              <div className="relative w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Nom ou email..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-semibold">
                  <th className="py-3 px-4">Utilisateur</th>
                  <th className="py-3 px-3">E-mail / Téléphone</th>
                  <th className="py-3 px-3">Établissement rattaché</th>
                  <th className="py-3 px-4 text-right">Rôle attribué</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((user) => {
                  const org = allOrganizations.find((o) => o.id === user.orgId);
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {user.name}
                        <span className="block text-[10px] font-mono font-normal text-slate-400">{user.id}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        <div>{user.email}</div>
                        {user.phone && <div className="text-[10px] font-mono text-slate-400">{user.phone}</div>}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        {org ? org.name : 'Multi-établissements / Non assigné'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value as UserRole)}
                          className="px-2.5 py-1 text-xs font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 cursor-pointer"
                        >
                          <option value="owner">owner</option>
                          <option value="manager">manager</option>
                          <option value="cashier">cashier</option>
                          <option value="server">server</option>
                          <option value="kitchen">kitchen</option>
                          <option value="inventory">inventory</option>
                          <option value="platform_admin">platform_admin</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: BILLING & TRANSACTIONS ================= */}
      {activeTab === 'billing' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xs font-bold text-slate-900 dark:text-white">
                Journal des Abonnements & Validation des Paiements DATA WORK AGENCY
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Validez ou rejetez les demandes de paiement en attente après vérification du reçu Orange Money / MoMo / Banque.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-[11px]">
                {(
                  [
                    { id: 'all', label: 'Toutes' },
                    { id: 'pending', label: `En attente (${pendingTransactions.length})` },
                    { id: 'confirmed', label: 'Confirmées' },
                    { id: 'failed', label: 'Rejetées' },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setTxFilter(f.id)}
                    className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                      txFilter === f.id
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded border border-emerald-200 dark:border-emerald-800">
                Encaissé : {formatCurrency(totalConfirmedRevenue, 'XAF')}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-semibold">
                  <th className="py-3 px-4">Facture N°</th>
                  <th className="py-3 px-3">Restaurant Client</th>
                  <th className="py-3 px-3">Formule & Période</th>
                  <th className="py-3 px-3">Mode</th>
                  <th className="py-3 px-3 text-right">Montant</th>
                  <th className="py-3 px-3 text-center">Statut</th>
                  <th className="py-3 px-4 text-right">Validation / Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                      {tx.invoiceNumber}
                      <div className="text-[10px] font-normal text-slate-400">{tx.transactionReference}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{tx.restaurantName}</div>
                      <div className="text-[10px] text-slate-400">{tx.payerPhone || tx.payerEmail}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="capitalize font-medium text-slate-800 dark:text-slate-200">{tx.planId}</span>
                      <span className="text-slate-400 text-[11px]"> ({tx.period})</span>
                    </td>
                    <td className="py-3 px-3 uppercase text-[11px] font-medium text-slate-800 dark:text-slate-200">
                      {tx.paymentMethod.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      {formatCurrency(tx.amount, tx.currency)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.status === 'confirmed'
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : tx.status === 'pending'
                            ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {tx.status === 'confirmed' ? 'Confirmé' : tx.status === 'pending' ? 'En attente' : 'Rejeté'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {tx.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => approveBillingTransaction(tx.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-md cursor-pointer"
                            title="Confirmer réception paiement & activer licence"
                          >
                            <Check className="w-3 h-3" />
                            <span>Approuver</span>
                          </button>
                          <button
                            onClick={() => rejectBillingTransaction(tx.id, 'Paiement non reçu')}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[11px] font-semibold rounded-md cursor-pointer"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Rejeter</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                          {new Date(tx.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 4: PLANS & PRICING ================= */}
      {activeTab === 'plans' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Grille Tarifaire & Quotas RestaurantOS (XAF / Mois)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ajustez les tarifs mensuels, le nombre maximal d&apos;établissements et l&apos;accès à l&apos;Assistant IA.
              </p>
            </div>
            {planError && (
              <div className="text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 px-3 py-1.5 rounded-lg">
                {planError}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {state.subscriptionPlans.map((plan) => {
              const isEditing = editingPlanId === plan.id;

              return (
                <div
                  key={plan.id}
                  className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{plan.nameFr}</h3>
                    {plan.popular && (
                      <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded">
                        Populaire
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 min-h-[36px]">
                    {plan.descriptionFr}
                  </p>

                  {isEditing ? (
                    <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                      <div>
                        <label className="text-[11px] text-slate-500 block">Prix mensuel (XAF)</label>
                        <input
                          type="number"
                          value={editingPlanPrice}
                          onChange={(e) => setEditingPlanPrice(Number(e.target.value))}
                          className="w-full px-2 py-1 mt-0.5 text-sm font-mono font-bold border border-amber-400 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-500 block">Établissements max</label>
                        <input
                          type="number"
                          min={1}
                          value={editingPlanMaxLoc}
                          onChange={(e) => setEditingPlanMaxLoc(Number(e.target.value))}
                          className="w-full px-2 py-1 mt-0.5 text-xs font-mono border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingPlanAi}
                          onChange={(e) => setEditingPlanAi(e.target.checked)}
                          className="rounded border-slate-300"
                        />
                        <span className="text-slate-700 dark:text-slate-300">Assistant IA inclus</span>
                      </label>
                      <div className="flex items-center gap-1.5 justify-end pt-1">
                        <button
                          onClick={() => {
                            setEditingPlanId(null);
                            setPlanError(null);
                          }}
                          className="px-2 py-1 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded cursor-pointer"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={() => handleSavePlan(plan.id)}
                          className="px-2.5 py-1 text-xs font-semibold bg-[#0B192C] text-amber-400 hover:bg-slate-800 rounded flex items-center gap-1 cursor-pointer"
                        >
                          <Save className="w-3 h-3" />
                          <span>Enregistrer</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                        <div className="text-[11px] text-slate-400 font-medium">Prix mensuel :</div>
                        <div className="mt-1 flex items-baseline justify-between">
                          <div className="text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                            {formatCurrency(plan.priceXAF, 'XAF')}
                            <span className="text-xs font-normal text-slate-500 dark:text-slate-400"> / mois</span>
                          </div>
                          <button
                            onClick={() => handleStartEditPlan(plan)}
                            className="p-1 text-slate-400 hover:text-amber-600 rounded hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Modifier cette formule"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 pt-1">
                        <div>
                          Établissements max :{' '}
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{plan.maxLocations}</span>
                        </div>
                        <div>
                          Assistant IA inclus :{' '}
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {plan.aiIncluded ? 'Oui' : 'Non'}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 5: SUPPORT REQUESTS ================= */}
      {activeTab === 'support' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <LifeBuoy className="w-5 h-5 text-amber-500" />
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Demandes d&apos;Assistance & Déploiement
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tickets envoyés depuis le site vitrine ou les établissements clients.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-[11px]">
              {(['all', 'open', 'in_progress', 'resolved'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setSupportFilter(st)}
                  className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${
                    supportFilter === st
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {st === 'all' ? 'Tous' : st === 'open' ? 'Ouverts' : st === 'in_progress' ? 'En cours' : 'Résolus'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredTickets.map((ticket: SupportTicket) => {
              const draftNote = ticketNoteDrafts[ticket.id] ?? ticket.adminNote ?? '';
              return (
                <div
                  key={ticket.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 space-y-3 text-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{ticket.subject}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ticket.status === 'resolved'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                              : ticket.status === 'in_progress'
                              ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {ticket.status === 'resolved'
                            ? 'Résolu'
                            : ticket.status === 'in_progress'
                            ? 'En cours'
                            : 'Nouveau'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <strong>{ticket.restaurantName}</strong> · {ticket.requesterName} ({ticket.requesterEmail}
                        {ticket.requesterPhone ? ` · ${ticket.requesterPhone}` : ''})
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                    {ticket.message}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                    <input
                      type="text"
                      value={draftNote}
                      onChange={(e) =>
                        setTicketNoteDrafts((prev) => ({ ...prev, [ticket.id]: e.target.value }))
                      }
                      placeholder="Note de suivi DATA WORK AGENCY..."
                      className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white"
                    />
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => updateSupportTicketStatus(ticket.id, 'in_progress', draftNote)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-[11px] cursor-pointer"
                      >
                        Prendre en charge
                      </button>
                      <button
                        onClick={() => updateSupportTicketStatus(ticket.id, 'resolved', draftNote)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-[11px] cursor-pointer"
                      >
                        Marquer Résolu
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredTickets.length === 0 && (
              <div className="py-10 text-center text-xs text-slate-400">
                Aucune demande d&apos;assistance dans cette catégorie.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 6: GLOBAL SAAS SETTINGS ================= */}
      {activeTab === 'settings' && (
        <form
          onSubmit={handleSavePlatformSettings}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs p-6 space-y-5 max-w-3xl"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <Settings className="w-5 h-5 text-amber-500" />
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Paramètres Généraux de la Plateforme SaaS
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configuration éditeur DATA WORK AGENCY, essai gratuit (max 7 jours) et coordonnées officielles.
                </p>
              </div>
            </div>
            {settingsSavedMsg && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Enregistré
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Durée essai gratuit par défaut (max 7j)</span>
              </label>
              <input
                type="number"
                min={1}
                max={7}
                value={settingsForm.defaultTrialDays}
                onChange={(e) =>
                  setSettingsForm({
                    ...settingsForm,
                    defaultTrialDays: Math.min(7, Math.max(1, Number(e.target.value))),
                  })
                }
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-xl text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-500" />
                <span>Téléphone officiel DATA WORK AGENCY</span>
              </label>
              <input
                type="text"
                value={settingsForm.supportPhone}
                onChange={(e) => setSettingsForm({ ...settingsForm, supportPhone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-xl text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-500" />
                <span>E-mail officiel éditeur</span>
              </label>
              <input
                type="email"
                value={settingsForm.supportEmail}
                onChange={(e) => setSettingsForm({ ...settingsForm, supportEmail: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-xl text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-amber-500" />
                <span>Compte Instagram officiel</span>
              </label>
              <input
                type="text"
                value={settingsForm.supportInstagram}
                onChange={(e) => setSettingsForm({ ...settingsForm, supportInstagram: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-xl text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Instructions de règlement marchand affichées aux restaurants
            </label>
            <textarea
              rows={2}
              value={settingsForm.merchantInstructions}
              onChange={(e) => setSettingsForm({ ...settingsForm, merchantInstructions: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settingsForm.allowNewRegistrations}
                onChange={(e) => setSettingsForm({ ...settingsForm, allowNewRegistrations: e.target.checked })}
                className="rounded border-slate-300"
              />
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Autoriser les nouvelles inscriptions de restaurants
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settingsForm.maintenanceMode}
                onChange={(e) => setSettingsForm({ ...settingsForm, maintenanceMode: e.target.checked })}
                className="rounded border-slate-300"
              />
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Mode maintenance plateforme
              </span>
            </label>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0B192C] dark:bg-amber-500 text-white dark:text-slate-950 font-bold text-xs rounded-xl hover:bg-slate-800 dark:hover:bg-amber-400 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Enregistrer la configuration SaaS</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
