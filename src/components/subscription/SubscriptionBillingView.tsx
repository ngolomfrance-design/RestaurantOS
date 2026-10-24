import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useTranslation } from '../../translations';
import { SubscriptionPlanId, Currency, BillingTransaction } from '../../types/restaurant';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  Download,
  Calendar,
  Smartphone,
  Building2,
  Check,
  Sparkles,
  ArrowRight,
  X,
  FileText,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const SubscriptionBillingView: React.FC = () => {
  const {
    activeOrganization,
    state,
    language,
    navigateTo,
    addAuditLog,
    updateOrganization,
  } = useRestaurant();
  const t = useTranslation(language);

  const [selectedPlanId, setSelectedPlanId] = useState<SubscriptionPlanId>(activeOrganization.subscriptionPlan);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'quarterly' | 'annual'>(
    (activeOrganization.billingPeriod as any) || 'monthly'
  );
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'orange_money' | 'mtn_momo' | 'card'>('orange_money');
  const [payerPhone, setPayerPhone] = useState(activeOrganization.phone || '+237 6');
  const [payerEmail, setPayerEmail] = useState(activeOrganization.email || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'select' | 'waiting' | 'confirmed' | 'failed'>('select');
  const [currentTransaction, setCurrentTransaction] = useState<any>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<BillingTransaction | null>(null);

  // Trial calculations
  const now = Date.now();
  const trialEndMs = new Date(activeOrganization.trialEndsAt).getTime();
  const msRemaining = trialEndMs - now;
  const daysRemaining = Math.max(0, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)));
  const isTrial = activeOrganization.subscriptionStatus === 'trial';
  const isExpired = activeOrganization.subscriptionStatus === 'expired' || (isTrial && msRemaining <= 0);

  // Dynamic plans from state
  const plans = state.subscriptionPlans;
  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[1];

  // Calculate pricing based on period
  const getPeriodMultiplier = (p: 'monthly' | 'quarterly' | 'annual') => {
    switch (p) {
      case 'quarterly':
        return 3 * 0.9; // 10% discount
      case 'annual':
        return 12 * 0.8; // 20% discount
      case 'monthly':
      default:
        return 1;
    }
  };

  const calculatePrice = (baseXAF: number, period: 'monthly' | 'quarterly' | 'annual') => {
    return Math.round(baseXAF * getPeriodMultiplier(period));
  };

  // Filter transactions for current restaurant
  const orgTransactions = state.billingTransactions.filter(
    (tx) => tx.orgId === activeOrganization.id
  );

  const handleInitiatePayment = async () => {
    setIsProcessing(true);
    setPaymentStep('waiting');

    const totalAmount = calculatePrice(selectedPlan.priceXAF, billingPeriod);

    try {
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: activeOrganization.id,
          planId: selectedPlan.id,
          period: billingPeriod,
          amount: totalAmount,
          currency: activeOrganization.currency,
          paymentMethod,
          payerPhone,
          payerEmail,
        }),
      });

      const data = await response.json();
      setCurrentTransaction(data.transaction);

      // Simulate payment network roundtrip (2.5 seconds)
      setTimeout(async () => {
        try {
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transactionId: data.transaction.id }),
          });
          const verifyData = await verifyRes.json();

          // Calculate new subscription end date
          const durationMonths = billingPeriod === 'annual' ? 12 : billingPeriod === 'quarterly' ? 3 : 1;
          const newEndDate = new Date(Date.now() + durationMonths * 30 * 86400000).toISOString();

          // Update organization server state
          updateOrganization(activeOrganization.id, {
            subscriptionPlan: selectedPlan.id,
            subscriptionStatus: 'active',
            subscriptionStartedAt: new Date().toISOString(),
            subscriptionEndsAt: newEndDate,
            paymentStatus: 'paid',
            billingPeriod,
          });

          // Append to state billing transactions
          const newTx: BillingTransaction = {
            ...data.transaction,
            status: 'confirmed',
            confirmedAt: new Date().toISOString(),
            restaurantName: activeOrganization.name,
          };
          state.billingTransactions.unshift(newTx);

          addAuditLog(
            'Abonnement renouvelé',
            `Paiement de ${totalAmount} ${activeOrganization.currency} validé via ${paymentMethod} pour la formule ${selectedPlan.name} (${billingPeriod})`
          );

          setCurrentTransaction(newTx);
          setPaymentStep('confirmed');
        } catch (e) {
          setPaymentStep('failed');
        } finally {
          setIsProcessing(false);
        }
      }, 2500);
    } catch (err) {
      setPaymentStep('failed');
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Abonnement & Facturation
            </h1>
            <span className="text-xs bg-amber-50 text-amber-800 font-semibold px-2.5 py-0.5 rounded-md border border-amber-200">
              {activeOrganization.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gérez votre formule, renouvelez vos accès et consultez vos factures officielles émises par <strong>DATA WORK AGENCY</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedPlanId(activeOrganization.subscriptionPlan);
              setShowCheckoutModal(true);
              setPaymentStep('select');
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Renouveler / Changer de formule
          </button>
        </div>
      </div>

      {/* Trial Status or Active Subscription Alert */}
      {isTrial ? (
        <div className={`rounded-2xl p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          daysRemaining <= 2
            ? 'bg-rose-50 border-rose-300 text-rose-900'
            : 'bg-amber-50/70 border-amber-300 text-amber-950'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${
              daysRemaining <= 2 ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-950'
            }`}>
              {daysRemaining}j
            </div>
            <div className="space-y-0.5">
              <div className="font-bold text-sm flex items-center gap-2">
                <span>Période d'Essai Gratuit de 7 Jours en cours</span>
                <span className="text-[10px] bg-white/80 px-2 py-0.5 rounded font-mono font-bold">
                  {daysRemaining > 0 ? `${daysRemaining} jour(s) restant(s)` : 'Expire aujourd’hui'}
                </span>
              </div>
              <p className="text-xs opacity-85 leading-relaxed">
                Votre essai a débuté le {formatDate(activeOrganization.trialStartedAt || activeOrganization.createdAt)}. Vous bénéficiez de l'accès complet à RestaurantOS. Choisissez une formule dès maintenant pour continuer sans interruption.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setShowCheckoutModal(true);
              setPaymentStep('select');
            }}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shrink-0 transition-colors cursor-pointer"
          >
            Activer l'abonnement →
          </button>
        </div>
      ) : isExpired ? (
        <div className="rounded-2xl p-5 bg-rose-50 border border-rose-300 text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-rose-600 shrink-0" />
            <div>
              <h3 className="font-bold text-sm">Période d'essai expirée</h3>
              <p className="text-xs text-rose-800">
                L’accès opérationnel à vos fonctionnalités avancées est temporairement restreint. Régularisez votre abonnement ci-dessous pour reprendre vos activités.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowCheckoutModal(true);
              setPaymentStep('select');
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shrink-0"
          >
            Régulariser maintenant
          </button>
        </div>
      ) : (
        <div className="rounded-2xl p-5 bg-emerald-50 border border-emerald-300 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
            <div>
              <h3 className="font-bold text-sm flex items-center gap-2">
                <span>Abonnement Actif — Formule {selectedPlan.name}</span>
                <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded uppercase">
                  Payé
                </span>
              </h3>
              <p className="text-xs text-emerald-800">
                Prochaine échéance le {formatDate(activeOrganization.subscriptionEndsAt || activeOrganization.trialEndsAt)}. Encaissement assuré par <strong>DATA WORK AGENCY</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Current Subscription Card & Details */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Formule en cours</span>
          <div className="text-lg font-bold text-slate-900 capitalize">{activeOrganization.subscriptionPlan}</div>
          <span className="text-xs text-slate-500 font-mono">
            {formatCurrency(selectedPlan.priceXAF, activeOrganization.currency)} / mois
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Statut du compte</span>
          <div className="text-lg font-bold text-slate-900 flex items-center gap-1.5 capitalize">
            {activeOrganization.subscriptionStatus === 'trial' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Essai 7 jours</span>
              </>
            ) : activeOrganization.subscriptionStatus === 'active' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Actif</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>Expiré</span>
              </>
            )}
          </div>
          <span className="text-xs text-slate-500">Paiement : {activeOrganization.paymentStatus || 'unpaid'}</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Échéance & Renouvellement</span>
          <div className="text-lg font-bold text-slate-900 font-mono">
            {new Date(activeOrganization.subscriptionEndsAt || activeOrganization.trialEndsAt).toLocaleDateString()}
          </div>
          <span className="text-xs text-slate-500">Cycle : {billingPeriod}</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Compte Marchand</span>
          <div className="text-xs font-bold text-slate-900 truncate">DATA WORK AGENCY</div>
          <span className="text-[11px] text-slate-500">Orange Money / MTN / Visa</span>
        </div>
      </div>

      {/* Plan Selection Section with Period Selector */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Nos Formules d'Abonnement Professionnelles
            </h2>
            <p className="text-xs text-slate-500">
              Choisissez la formule la plus adaptée au volume de votre restaurant.
            </p>
          </div>

          {/* Period Tabs */}
          <div className="p-1 bg-slate-100 rounded-xl flex items-center self-start sm:self-auto text-xs font-semibold text-slate-600">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                billingPeriod === 'monthly' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingPeriod('quarterly')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                billingPeriod === 'quarterly' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Trimestriel <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-1 rounded">-10%</span>
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                billingPeriod === 'annual' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Annuel <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1 rounded">-20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan) => {
            const isCurrent = activeOrganization.subscriptionPlan === plan.id;
            const price = calculatePrice(plan.priceXAF, billingPeriod);

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl border p-5 flex flex-col justify-between space-y-5 transition-all ${
                  plan.popular
                    ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-md'
                    : 'border-slate-200 shadow-xs'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-base">{plan.name}</h3>
                    {plan.popular && (
                      <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                        Recommandé
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="text-2xl font-extrabold text-slate-900 font-mono">
                      {formatCurrency(price, activeOrganization.currency)}
                    </div>
                    <span className="text-xs text-slate-400">
                      {billingPeriod === 'annual' ? '/ an (facturé annuellement)' : billingPeriod === 'quarterly' ? '/ trimestre' : '/ mois'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">{plan.descriptionFr}</p>

                  <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                    {plan.featuresFr.map((feat, fidx) => (
                      <div key={fidx} className="flex items-start gap-2 text-slate-600">
                        <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-tight">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedPlanId(plan.id);
                    setShowCheckoutModal(true);
                    setPaymentStep('select');
                  }}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                    isCurrent
                      ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                      : plan.popular
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {isCurrent ? 'Renouveler ma formule' : `Choisir ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transaction & Invoices History */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Historique des Transactions & Factures</h3>
            <p className="text-[11px] text-slate-400">Toutes les transactions passées pour cet établissement.</p>
          </div>
          <span className="text-xs font-mono text-slate-500">{orgTransactions.length} transaction(s)</span>
        </div>

        {orgTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Référence Facture</th>
                  <th className="py-2.5 px-3">Formule</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3">Montant</th>
                  <th className="py-2.5 px-3">Statut</th>
                  <th className="py-2.5 px-3 text-right">Facture</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orgTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 text-slate-600">{formatDate(tx.createdAt)}</td>
                    <td className="py-3 px-3 font-mono font-medium text-slate-900">{tx.invoiceNumber}</td>
                    <td className="py-3 px-3 capitalize font-medium text-slate-800">{tx.planId} ({tx.period})</td>
                    <td className="py-3 px-3 uppercase text-[11px] text-slate-600 font-mono">
                      {tx.paymentMethod.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {formatCurrency(tx.amount, tx.currency)}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : tx.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {tx.status === 'confirmed' ? 'Payé' : tx.status === 'pending' ? 'En attente' : 'Échoué'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedInvoice(tx)}
                        className="text-amber-600 hover:text-amber-700 font-semibold text-xs flex items-center gap-1 justify-end cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Reçu</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400 text-center py-6">
            Aucun paiement enregistré pour l'instant pour ce restaurant.
          </p>
        )}
      </div>

      {/* CHECKOUT MODAL WITH MTN / ORANGE / CARD INTEGRATION */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-sm">
                  R
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">Règlement d'Abonnement RestaurantOS</h3>
                  <p className="text-[11px] text-slate-300">Paiement sécurisé au profit de DATA WORK AGENCY</p>
                </div>
              </div>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {paymentStep === 'select' && (
                <div className="space-y-4">
                  {/* Summary Box */}
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900 text-sm">
                      <span>Formule {selectedPlan.name} ({billingPeriod})</span>
                      <span className="font-mono text-amber-900">
                        {formatCurrency(calculatePrice(selectedPlan.priceXAF, billingPeriod), activeOrganization.currency)}
                      </span>
                    </div>
                    <div className="text-slate-600 text-[11px]">
                      Établissement : <strong>{activeOrganization.name}</strong> ({activeOrganization.city})
                    </div>
                    <div className="text-slate-500 text-[10px]">
                      Bénéficiaire : <strong>DATA WORK AGENCY</strong> (Compte Marchand Professionnel)
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 block">
                      Mode de paiement sécurisé :
                    </label>

                    <div className="grid grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('orange_money')}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          paymentMethod === 'orange_money'
                            ? 'border-orange-500 bg-orange-50/50 text-orange-950 font-bold ring-2 ring-orange-500/20'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full bg-orange-500 text-white font-bold text-[10px] flex items-center justify-center mx-auto mb-1">
                          OM
                        </div>
                        <span className="text-[11px] block">Orange Money</span>
                        <span className="text-[9px] text-slate-400 font-normal">Cameroun #150#</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('mtn_momo')}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          paymentMethod === 'mtn_momo'
                            ? 'border-yellow-500 bg-yellow-50/50 text-yellow-950 font-bold ring-2 ring-yellow-500/20'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full bg-yellow-500 text-slate-950 font-bold text-[10px] flex items-center justify-center mx-auto mb-1">
                          MTN
                        </div>
                        <span className="text-[11px] block">MTN MoMo</span>
                        <span className="text-[9px] text-slate-400 font-normal">Cameroun *126#</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          paymentMethod === 'card'
                            ? 'border-blue-600 bg-blue-50/50 text-blue-950 font-bold ring-2 ring-blue-600/20'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <CreditCard className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                        <span className="text-[11px] block">Carte Visa/MC</span>
                        <span className="text-[9px] text-slate-400 font-normal">International</span>
                      </button>
                    </div>
                  </div>

                  {/* Phone & Email Inputs */}
                  <div className="space-y-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Numéro de téléphone pour la validation {paymentMethod === 'card' ? 'SMS' : 'Mobile Money'}
                      </label>
                      <input
                        type="text"
                        value={payerPhone}
                        onChange={(e) => setPayerPhone(e.target.value)}
                        placeholder="+237 699 00 00 00"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Email pour la réception de la facture officielle
                      </label>
                      <input
                        type="email"
                        value={payerEmail}
                        onChange={(e) => setPayerEmail(e.target.value)}
                        placeholder="comptabilite@restaurant.cm"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  {/* Security Note */}
                  <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 leading-relaxed border border-slate-200 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      Ne saisissez jamais votre code secret sur cette page. Vous validerez la transaction directement depuis votre téléphone via le prompt USSD de votre opérateur.
                    </span>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowCheckoutModal(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                    >
                      Annuler
                    </button>

                    <button
                      type="button"
                      onClick={handleInitiatePayment}
                      className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
                    >
                      Lancer la transaction →
                    </button>
                  </div>
                </div>
              )}

              {paymentStep === 'waiting' && (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full border-4 border-amber-400 border-t-transparent animate-spin mx-auto"></div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-base">En attente de validation opérateur...</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Une demande de débit a été envoyée sur votre téléphone {payerPhone}. Validez sur votre écran pour finaliser votre abonnement.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl text-xs font-mono text-slate-700 max-w-xs mx-auto border">
                    Réf : {currentTransaction?.transactionReference || 'DWA-PENDING'}
                  </div>
                </div>
              )}

              {paymentStep === 'confirmed' && (
                <div className="py-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-lg">Paiement validé avec succès !</h4>
                    <p className="text-xs text-slate-600 max-w-sm mx-auto">
                      Votre abonnement RestaurantOS <strong>{selectedPlan.name}</strong> a été activé. Merci de votre confiance en <strong>DATA WORK AGENCY</strong>.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl text-xs text-left space-y-1 border max-w-sm mx-auto font-mono">
                    <div><strong>Facture N° :</strong> {currentTransaction?.invoiceNumber}</div>
                    <div><strong>Réf Opérateur :</strong> {currentTransaction?.operatorReference || 'OP-CONFIRMED'}</div>
                    <div><strong>Montant :</strong> {formatCurrency(currentTransaction?.amount || 0, activeOrganization.currency)}</div>
                  </div>
                  <button
                    onClick={() => setShowCheckoutModal(false)}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
                  >
                    Retour au tableau de bord
                  </button>
                </div>
              )}

              {paymentStep === 'failed' && (
                <div className="py-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-base">La transaction n'a pas pu aboutir</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      La demande a expiré ou le solde est insuffisant. Vous pouvez réessayer avec un autre numéro ou contacter DATA WORK AGENCY.
                    </p>
                  </div>
                  <button
                    onClick={() => setPaymentStep('select')}
                    className="px-5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl"
                  >
                    Réessayer
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-400">
              RestaurantOS — Solution commercialisée par <strong>DATA WORK AGENCY</strong>
            </div>
          </div>
        </div>
      )}

      {/* INVOICE PREVIEW MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden p-6 space-y-5 animate-in fade-in">
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <div className="font-bold text-slate-900 text-base">FACTURE D'ABONNEMENT</div>
                <div className="text-xs font-mono text-slate-500">{selectedInvoice.invoiceNumber}</div>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Éditeur & Vendeur :</span>
                <span className="font-bold text-slate-900 text-right">
                  DATA WORK AGENCY<br />
                  <span className="font-normal text-slate-500 text-[11px]">Douala / Yaoundé, Cameroun</span>
                </span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Client / Établissement :</span>
                <span className="font-bold text-slate-900 text-right">
                  {selectedInvoice.restaurantName}<br />
                  <span className="font-normal text-slate-500 text-[11px]">{selectedInvoice.payerEmail || activeOrganization.email}</span>
                </span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Désignation :</span>
                <span className="font-medium text-slate-900">
                  Licence SaaS RestaurantOS — Formule {selectedInvoice.planId.toUpperCase()} ({selectedInvoice.period})
                </span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="text-slate-500">Mode de paiement :</span>
                <span className="font-mono text-slate-900 uppercase">{selectedInvoice.paymentMethod}</span>
              </div>

              <div className="flex justify-between pt-2 text-sm font-bold">
                <span>Total Net Encaissé :</span>
                <span className="font-mono text-emerald-700">
                  {formatCurrency(selectedInvoice.amount, selectedInvoice.currency)}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center text-xs">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-semibold flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Imprimer / Télécharger</span>
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl font-semibold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
