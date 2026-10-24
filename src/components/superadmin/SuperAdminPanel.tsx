import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useTranslation } from '../../translations';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { SubscriptionPlanId, SubscriptionPlan } from '../../types/restaurant';
import {
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  ShieldAlert,
  Search,
  ExternalLink,
  Plus,
  CheckCircle2,
  Clock,
  Edit2,
  Save,
  X,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Receipt,
  Smartphone,
} from 'lucide-react';

export const SuperAdminPanel: React.FC = () => {
  const {
    state,
    language,
    resetToDemo,
    updateSubscriptionPlanPrice,
    toggleRestaurantStatus,
    switchOrganization,
    navigateTo,
  } = useRestaurant();
  const t = useTranslation(language);

  const [activeTab, setActiveTab] = useState<'overview' | 'tenants' | 'billing' | 'plans'>('overview');
  const [searchOrg, setSearchOrg] = useState('');
  const [editingPlanId, setEditingPlanId] = useState<SubscriptionPlanId | null>(null);
  const [editingPlanPrice, setEditingPlanPrice] = useState<number>(0);

  // Real organizations from state
  const allOrganizations = state.organizations;
  const filteredOrgs = allOrganizations.filter((o) =>
    o.name.toLowerCase().includes(searchOrg.toLowerCase()) ||
    o.city.toLowerCase().includes(searchOrg.toLowerCase()) ||
    o.country.toLowerCase().includes(searchOrg.toLowerCase())
  );

  // Billing analytics
  const billingTransactions = state.billingTransactions || [];
  const confirmedTransactions = billingTransactions.filter((tx) => tx.status === 'confirmed');
  const pendingTransactions = billingTransactions.filter((tx) => tx.status === 'pending');

  const totalConfirmedRevenue = confirmedTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const totalPendingRevenue = pendingTransactions.reduce((sum, tx) => sum + tx.amount, 0);

  // MRR calculation based on active plans
  const totalMrr = allOrganizations
    .filter((o) => o.status !== 'archived' && (o.subscriptionStatus === 'active' || o.subscriptionStatus === 'trial'))
    .reduce((sum, o) => {
      const plan = state.subscriptionPlans.find((p) => p.id === o.subscriptionPlan);
      return sum + (plan ? plan.priceXAF : 20000);
    }, 0);

  const activeTenantsCount = allOrganizations.filter((o) => o.status !== 'archived').length;
  const trialTenantsCount = allOrganizations.filter((o) => o.subscriptionStatus === 'trial' && o.status !== 'archived').length;
  const activePaidCount = allOrganizations.filter((o) => o.subscriptionStatus === 'active' && o.status !== 'archived').length;

  const handleStartEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlanId(plan.id);
    setEditingPlanPrice(plan.priceXAF);
  };

  const handleSavePlanPrice = (planId: SubscriptionPlanId) => {
    if (editingPlanPrice <= 0) {
      alert('Le montant doit être supérieur à 0 XAF.');
      return;
    }
    updateSubscriptionPlanPrice(planId, Number(editingPlanPrice));
    setEditingPlanId(null);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title & Operator Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Console Super-Admin DATA WORK AGENCY
            </h1>
            <span className="text-[10px] font-bold bg-[#0B192C] text-amber-400 px-2.5 py-0.5 rounded shadow-2xs">
              Éditeur SaaS Officiel
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Supervision multi-tenant, encaissement des abonnements, tarification et gouvernance des instances clientes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (window.confirm('Voulez-vous vraiment réinitialiser le restaurant de démonstration aux paramètres d’usine ?')) {
                resetToDemo();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser Démo</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Revenu Total Encaissé</span>
            <Receipt className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-1.5">
            {formatCurrency(totalConfirmedRevenue, 'XAF')}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            {confirmedTransactions.length} transaction(s) MoMo & Carte validée(s)
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">MRR Plateforme (Revenu Mensuel)</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-1.5">
            {formatCurrency(totalMrr, 'XAF')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            ARR projeté : {formatCurrency(totalMrr * 12, 'XAF')}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Restaurants Enregistrés</span>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-1.5">
            {activeTenantsCount} établissement(s)
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {activePaidCount} payant(s) · {trialTenantsCount} en essai (7 jours)
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Transactions En Attente</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-amber-700 font-mono tabular-nums mt-1.5">
            {formatCurrency(totalPendingRevenue, 'XAF')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {pendingTransactions.length} confirmation(s) USSD en cours
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center p-1 bg-slate-200/80 rounded-lg text-xs font-medium w-fit overflow-x-auto max-w-full">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            activeTab === 'overview' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Annuaire des Établissements ({allOrganizations.length})
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            activeTab === 'billing' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Transactions & Encaissements ({billingTransactions.length})
        </button>
        <button
          onClick={() => setActiveTab('plans')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            activeTab === 'plans' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Gestion des Tarifs SaaS ({state.subscriptionPlans.length})
        </button>
      </div>

      {/* TAB 1: Tenants List */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden space-y-4">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-xs font-bold text-slate-900">
                Instances Multi-Tenant Gérées par DATA WORK AGENCY
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Chaque restaurant bénéficie d'une isolation stricte de ses données de vente, menus et utilisateurs
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher par nom, ville..."
                value={searchOrg}
                onChange={(e) => setSearchOrg(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Restaurant</th>
                  <th className="py-3 px-3">Localisation</th>
                  <th className="py-3 px-3">Formule SaaS</th>
                  <th className="py-3 px-3">Statut Licence</th>
                  <th className="py-3 px-3 text-right">Tarif Mensuel</th>
                  <th className="py-3 px-3 text-center">État Instance</th>
                  <th className="py-3 px-4 text-right">Actions Opérateur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrgs.map((org) => {
                  const plan = state.subscriptionPlans.find((p) => p.id === org.subscriptionPlan);
                  const isArchived = org.status === 'archived';
                  const isDemo = org.isDemo;

                  return (
                    <tr key={org.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{org.name}</span>
                          {isDemo && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-normal">
                              Démo
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          ID: {org.id} · {org.currency}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {org.city}, {org.country}
                      </td>
                      <td className="py-3 px-3">
                        <span className="uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                          {org.subscriptionPlan}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold capitalize ${
                            org.subscriptionStatus === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {org.subscriptionStatus === 'active' ? 'Abonnement Actif' : 'Essai 7 Jours'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {formatCurrency(plan ? plan.priceXAF : 20000, 'XAF')}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            isArchived
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {isArchived ? 'Suspendu' : 'Opérationnel'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              switchOrganization(org.id);
                              navigateTo('dashboard');
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded transition-colors cursor-pointer"
                            title="Ouvrir le tableau de bord de ce restaurant"
                          >
                            Ouvrir
                          </button>
                          <button
                            onClick={() => toggleRestaurantStatus(org.id)}
                            className={`px-2.5 py-1 text-[11px] font-semibold rounded transition-colors cursor-pointer ${
                              isArchived
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                            }`}
                          >
                            {isArchived ? 'Réactiver' : 'Suspendre'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Billing & Transactions */}
      {activeTab === 'billing' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-bold text-slate-900">
                Journal des Encaissements SaaS DATA WORK AGENCY
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Paiements par MTN MoMo, Orange Money et Cartes Bancaires
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              Total Encaissé : {formatCurrency(totalConfirmedRevenue, 'XAF')}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Facture N°</th>
                  <th className="py-3 px-3">Restaurant Client</th>
                  <th className="py-3 px-3">Formule & Période</th>
                  <th className="py-3 px-3">Mode de Paiement</th>
                  <th className="py-3 px-3 text-right">Montant</th>
                  <th className="py-3 px-3 text-center">Statut</th>
                  <th className="py-3 px-4 text-right">Date & Heure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {billingTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {tx.invoiceNumber}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-800">{tx.restaurantName}</div>
                      <div className="text-[10px] text-slate-400">{tx.payerPhone || tx.payerEmail}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="capitalize font-medium text-slate-800">{tx.planId}</span>
                      <span className="text-slate-400 text-[11px]"> ({tx.period})</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-medium text-slate-800 uppercase text-[11px]">
                        {tx.paymentMethod === 'orange_money' ? 'Orange Money' : tx.paymentMethod === 'mtn_momo' ? 'MTN MoMo' : 'Carte Bancaire'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatCurrency(tx.amount, tx.currency)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {tx.status === 'confirmed' ? 'Confirmé' : 'En attente'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 font-mono text-[11px]">
                      {new Date(tx.createdAt).toLocaleDateString('fr-FR')} {new Date(tx.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Plan Pricing Editor */}
      {activeTab === 'plans' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Grille Tarifaire RestaurantOS (XAF / Mois)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                En tant qu'opérateur DATA WORK AGENCY, vous pouvez ajuster les tarifs publics affichés aux restaurants.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {state.subscriptionPlans.map((plan) => {
                const isEditing = editingPlanId === plan.id;

                return (
                  <div
                    key={plan.id}
                    className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-slate-900">{plan.nameFr}</h3>
                      {plan.popular && (
                        <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded">
                          Populaire
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 min-h-[36px]">
                      {plan.descriptionFr}
                    </p>

                    <div className="pt-2 border-t border-slate-200">
                      <div className="text-[11px] text-slate-400 font-medium">Prix mensuel :</div>
                      {isEditing ? (
                        <div className="mt-1 space-y-2">
                          <input
                            type="number"
                            value={editingPlanPrice}
                            onChange={(e) => setEditingPlanPrice(Number(e.target.value))}
                            className="w-full px-2 py-1 text-sm font-mono font-bold border border-amber-400 rounded bg-white text-slate-900"
                          />
                          <div className="flex items-center gap-1.5 justify-end">
                            <button
                              onClick={() => setEditingPlanId(null)}
                              className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded"
                            >
                              Annuler
                            </button>
                            <button
                              onClick={() => handleSavePlanPrice(plan.id)}
                              className="px-2.5 py-1 text-xs font-semibold bg-[#0B192C] text-amber-400 hover:bg-slate-800 rounded flex items-center gap-1 cursor-pointer"
                            >
                              <Save className="w-3 h-3" />
                              <span>Enregistrer</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-1 flex items-baseline justify-between">
                          <div className="text-lg font-bold font-mono text-slate-900">
                            {formatCurrency(plan.priceXAF, 'XAF')}
                            <span className="text-xs font-normal text-slate-500"> / mois</span>
                          </div>
                          <button
                            onClick={() => handleStartEditPlan(plan)}
                            className="p-1 text-slate-400 hover:text-amber-600 rounded hover:bg-slate-200 transition-colors cursor-pointer"
                            title="Modifier le prix de ce plan"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-500 space-y-1 pt-1">
                      <div>Établissements max : <span className="font-semibold text-slate-800">{plan.maxLocations}</span></div>
                      <div>Assistant IA inclus : <span className="font-semibold text-slate-800">{plan.aiIncluded ? 'Oui' : 'Non'}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
