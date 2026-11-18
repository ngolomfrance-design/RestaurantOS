import React, { useState, useEffect } from 'react';
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
    recordBillingTransaction,
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
  const [paymentStep, setPaymentStep] = useState<
    'select' | 'waiting' | 'pending_verification' | 'confirmed' | 'failed'
  >('select');
  const [currentTransaction, setCurrentTransaction] = useState<any>(null);
  const [paymentInstructions, setPaymentInstructions] = useState<string>('');
  const [selectedInvoice, setSelectedInvoice] = useState<BillingTransaction | null>(null);
  const [gatewayStatus, setGatewayStatus] = useState<{
    configured: boolean;
    providers: { orange_money: boolean; mtn_momo: boolean; card: boolean };
  } | null>(null);

  useEffect(() => {
    fetch('/api/payments/gateway-status')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setGatewayStatus(data);
      })
      .catch(() => {
        setGatewayStatus({
          configured: false,
          providers: { orange_money: false, mtn_momo: false, card: false },
        });
      });
  }, []);

  useEffect(() => {
    setSelectedPlanId(activeOrganization.subscriptionPlan);
    setBillingPeriod((activeOrganization.billingPeriod as any) || 'monthly');
    setPayerPhone(activeOrganization.phone || '+237 6');
    setPayerEmail(activeOrganization.email || '');
  }, [activeOrganization.id, activeOrganization.subscriptionPlan, activeOrganization.billingPeriod, activeOrganization.phone, activeOrganization.email]);

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

      if (!response.ok) {
        throw new Error('Failed to initiate transaction');
      }

      const data = await response.json();
      setPaymentInstructions(data.instructions || '');

      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: data.transaction.id }),
      });
      const verifyData = await verifyRes.json();

      if (verifyData.status === 'confirmed' && verifyData.configured) {
        const durationMonths = billingPeriod === 'annual' ? 12 : billingPeriod === 'quarterly' ? 3 : 1;
        const newEndDate = new Date(Date.now() + durationMonths * 30 * 86400000).toISOString();

        updateOrganization(activeOrganization.id, {
          subscriptionPlan: selectedPlan.id,
          subscriptionStatus: 'active',
          subscriptionStartedAt: new Date().toISOString(),
          subscriptionEndsAt: newEndDate,
          paymentStatus: 'paid',
          billingPeriod,
        });

        const confirmedTx: BillingTransaction = {
          ...data.transaction,
          status: 'confirmed',
          confirmedAt: new Date().toISOString(),
          operatorReference: verifyData.transaction?.operatorReference,
          restaurantName: activeOrganization.name,
        };
        recordBillingTransaction(confirmedTx);
        addAuditLog(
          'Abonnement renouvelé',
          `Paiement de ${totalAmount} ${activeOrganization.currency} validé via ${paymentMethod} pour la formule ${selectedPlan.name} (${billingPeriod})`
        );

        setCurrentTransaction(confirmedTx);
        setPaymentStep('confirmed');
      } else {
        // Honest pending state: never simulate confirmed real-money payment
        const pendingTx: BillingTransaction = {
          ...data.transaction,
          status: 'pending',
          restaurantName: activeOrganization.name,
        };
        recordBillingTransaction(pendingTx);
        addAuditLog(
          'Demande de paiement enregistrée (en attente)',
          `Demande ${pendingTx.invoiceNumber} de ${totalAmount} ${activeOrganization.currency} via ${paymentMethod} en attente de validation opérateur / DATA WORK AGENCY`
        );

        setCurrentTransaction(pendingTx);
        setPaymentStep('pending_verification');
      }
    } catch (err) {
      setPaymentStep('failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Abonnement & Facturation
            </h1>
            <span className="text-xs bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold px-2.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/60">
              {activeOrganization.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gérez votre formule, renouvelez vos accès et consultez vos factures officielles émises par <strong className="text-slate-700 dark:text-slate-200">DATA WORK AGENCY</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedPlanId(activeOrganization.subscriptionPlan);
              setShowCheckoutModal(true);
              setPaymentStep('select');
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            Renouveler / Changer de formule
          </button>
        </div>
      </div>

      {/* Trial Status or Active Subscription Alert */}
      {isTrial ? (
        <div className={`rounded-2xl p-5 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          daysRemaining <= 2
            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/70 text-amber-950 dark:text-amber-200'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 tabular-nums ${
              daysRemaining <= 2 ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-950'
            }`}>
              {daysRemaining}j
            </div>
            <div className="space-y-0.5">
              <div className="font-bold text-sm flex items-center gap-2 flex-wrap">
                <span>Période d'Essai Gratuit de 7 Jours en cours</span>
                <span className="text-[10px] bg-white/80 dark:bg-slate-900/80 text-slate-900 dark:text-amber-300 px-2 py-0.5 rounded font-mono font-bold tabular-nums">
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
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 text-xs font-semibold rounded-xl shrink-0 transition-colors cursor-pointer whitespace-nowrap"
          >
            Activer l'abonnement →
          </button>
        </div>
      ) : isExpired ? (
        <div className="rounded-2xl p-5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-rose-600 dark:text-rose-400 shrink-0" />
            <div>
              <h3 className="font-bold text-sm">Période d'essai expirée</h3>
              <p className="text-xs text-rose-800 dark:text-rose-300">
                L’accès opérationnel à vos fonctionnalités avancées est temporairement restreint. Régularisez votre abonnement ci-dessous pour reprendre vos activités.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowCheckoutModal(true);
              setPaymentStep('select');
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shrink-0 cursor-pointer whitespace-nowrap"
          >
            Régulariser maintenant
          </button>
        </div>
      ) : (
        <div className="rounded-2xl p-5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/70 text-emerald-950 dark:text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <h3 className="font-bold text-sm flex items-center gap-2 flex-wrap">
                <span>Abonnement Actif — Formule {selectedPlan.name}</span>
                <span className="text-[10px] bg-emerald-200 dark:bg-emerald-900/70 text-emerald-900 dark:text-emerald-200 font-bold px-2 py-0.5 rounded uppercase">
                  Payé
                </span>
              </h3>
              <p className="text-xs text-emerald-800 dark:text-emerald-300">
                Prochaine échéance le {formatDate(activeOrganization.subscriptionEndsAt || activeOrganization.trialEndsAt)}. Encaissement assuré par <strong>DATA WORK AGENCY</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Current Subscription Card & Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Formule en cours</span>
          <div className="text-lg font-bold text-slate-900 dark:text-white capitalize">{activeOrganization.subscriptionPlan}</div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            {formatCurrency(selectedPlan.priceXAF, activeOrganization.currency)} / mois
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Statut du compte</span>
          <div className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5 capitalize">
            {activeOrganization.subscriptionStatus === 'trial' ? (
              <span className="text-amber-600 dark:text-amber-400">Essai 7 jours</span>
            ) : activeOrganization.subscriptionStatus === 'active' ? (
              <span className="text-emerald-600 dark:text-emerald-400">Actif</span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400">Expiré</span>
            )}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">Paiement : {activeOrganization.paymentStatus || 'unpaid'}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Échéance & Renouvellement</span>
          <div className="text-lg font-bold text-slate-900 dark:text-white font-mono tabular-nums">
            {new Date(activeOrganization.subscriptionEndsAt || activeOrganization.trialEndsAt).toLocaleDateString()}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">Cycle : {billingPeriod}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Compte Marchand</span>
          <div className="text-xs font-bold text-slate-900 dark:text-white truncate">DATA WORK AGENCY</div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Orange Money / MTN / Visa</span>
        </div>
      </div>

      {/* Plan Selection Section with Period Selector */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              Nos Formules d'Abonnement Professionnelles
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Choisissez la formule la plus adaptée au volume de votre restaurant.
            </p>
          </div>

          {/* Period Tabs */}
          <div className="p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center self-start sm:self-auto text-xs font-semibold text-slate-600 dark:text-slate-400">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                billingPeriod === 'monthly' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingPeriod('quarterly')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                billingPeriod === 'quarterly' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Trimestriel <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold bg-amber-100 dark:bg-amber-950/70 px-1 rounded tabular-nums">-10%</span>
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                billingPeriod === 'annual' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs' : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Annuel <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100 dark:bg-emerald-950/70 px-1 rounded tabular-nums">-20%</span>
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
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 flex flex-col justify-between space-y-5 transition-all ${
                  plan.popular
                    ? 'border-amber-400 dark:border-amber-500 ring-2 ring-amber-400/20 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 shadow-xs'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{plan.name}</h3>
                    {plan.popular && (
                      <span className="text-[10px] font-bold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded">
                        Recommandé
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
                      {formatCurrency(price, activeOrganization.currency)}
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {billingPeriod === 'annual' ? '/ an (facturé annuellement)' : billingPeriod === 'quarterly' ? '/ trimestre' : '/ mois'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{plan.descriptionFr}</p>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                    {plan.featuresFr.map((feat, fidx) => (
                      <div key={fidx} className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                        <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
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
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                      : plan.popular
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs'
                      : 'bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white'
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Historique des Transactions & Factures</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Toutes les transactions passées pour cet établissement.</p>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">{orgTransactions.length} transaction(s)</span>
        </div>

        {orgTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Référence Facture</th>
                  <th className="py-2.5 px-3">Formule</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3">Montant</th>
                  <th className="py-2.5 px-3">Statut</th>
                  <th className="py-2.5 px-3 text-right">Facture</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orgTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 tabular-nums">{formatDate(tx.createdAt)}</td>
                    <td className="py-3 px-3 font-mono font-medium text-slate-900 dark:text-white tabular-nums">{tx.invoiceNumber}</td>
                    <td className="py-3 px-3 capitalize font-medium text-slate-800 dark:text-slate-200">{tx.planId} ({tx.period})</td>
                    <td className="py-3 px-3 uppercase text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                      {tx.paymentMethod.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      {formatCurrency(tx.amount, tx.currency)}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.status === 'confirmed'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : tx.status === 'pending'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                      }`}>
                        {tx.status === 'confirmed' ? 'Payé' : tx.status === 'pending' ? 'En attente' : 'Échoué'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedInvoice(tx)}
                        className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-semibold text-xs inline-flex items-center gap-1 justify-end cursor-pointer"
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
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">
            Aucun paiement enregistré pour l'instant pour ce restaurant.
          </p>
        )}
      </div>

      {/* CHECKOUT MODAL WITH MTN / ORANGE / CARD INTEGRATION */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
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
                  <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white text-sm">
                      <span>Formule {selectedPlan.name} ({billingPeriod})</span>
                      <span className="font-mono tabular-nums text-amber-900 dark:text-amber-300">
                        {formatCurrency(calculatePrice(selectedPlan.priceXAF, billingPeriod), activeOrganization.currency)}
                      </span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-300 text-[11px]">
                      Établissement : <strong>{activeOrganization.name}</strong> ({activeOrganization.city})
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-[10px]">
                      Bénéficiaire : <strong>DATA WORK AGENCY</strong> (Compte Marchand Professionnel)
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Mode de paiement sécurisé :
                    </label>

                    <div className="grid grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('orange_money')}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          paymentMethod === 'orange_money'
                            ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/40 text-orange-950 dark:text-orange-200 font-bold ring-2 ring-orange-500/20'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-lg bg-orange-500 text-white font-bold text-[10px] flex items-center justify-center mx-auto mb-1">
                          OM
                        </div>
                        <span className="text-[11px] block">Orange Money</span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-normal">Cameroun #150#</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('mtn_momo')}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          paymentMethod === 'mtn_momo'
                            ? 'border-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/40 text-yellow-950 dark:text-yellow-200 font-bold ring-2 ring-yellow-500/20'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-lg bg-yellow-500 text-slate-950 font-bold text-[10px] flex items-center justify-center mx-auto mb-1">
                          MTN
                        </div>
                        <span className="text-[11px] block">MTN MoMo</span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-normal">Cameroun *126#</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          paymentMethod === 'card'
                            ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-950 dark:text-blue-200 font-bold ring-2 ring-blue-600/20'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                        <span className="text-[11px] block">Carte Visa/MC</span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-normal">International</span>
                      </button>
                    </div>
                  </div>

                  {/* Phone & Email Inputs */}
                  <div className="space-y-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Numéro de téléphone pour la validation {paymentMethod === 'card' ? 'SMS' : 'Mobile Money'}
                      </label>
                      <input
                        type="text"
                        value={payerPhone}
                        onChange={(e) => setPayerPhone(e.target.value)}
                        placeholder="+237 699 00 00 00"
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl text-xs font-mono tabular-nums"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Email pour la réception de la facture officielle
                      </label>
                      <input
                        type="email"
                        value={payerEmail}
                        onChange={(e) => setPayerEmail(e.target.value)}
                        placeholder="comptabilite@restaurant.cm"
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  {/* Security Note */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed border border-slate-200 dark:border-slate-700 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      Ne saisissez jamais votre code secret sur cette page. Vous validerez la transaction directement depuis votre téléphone via le prompt USSD de votre opérateur.
                    </span>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowCheckoutModal(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
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
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">Initialisation de la transaction...</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                      Vérification de la passerelle de paiement sécurisée DATA WORK AGENCY.
                    </p>
                  </div>
                </div>
              )}

              {paymentStep === 'pending_verification' && (
                <div className="py-4 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
                    <Clock className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">
                      Demande enregistrée — En attente de règlement
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
                      {gatewayStatus?.configured
                        ? `Validez la demande sur votre téléphone (${payerPhone}). Votre licence sera activée automatiquement dès réception de la confirmation opérateur.`
                        : `Aucune passerelle automatique (Orange Money / MTN MoMo / Carte) n'est connectée sur cette instance. Votre pro-forma est enregistrée pour validation manuelle par DATA WORK AGENCY dès réception du règlement.`}
                    </p>
                  </div>
                  {paymentInstructions && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl text-xs text-amber-900 dark:text-amber-200 text-left">
                      <strong>Instructions :</strong> {paymentInstructions}
                    </div>
                  )}
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-left space-y-1 border border-slate-200 dark:border-slate-700 max-w-sm mx-auto font-mono text-slate-800 dark:text-slate-200 tabular-nums">
                    <div><strong>Facture Pro-forma :</strong> {currentTransaction?.invoiceNumber}</div>
                    <div><strong>Réf Demande :</strong> {currentTransaction?.transactionReference}</div>
                    <div><strong>Montant :</strong> {formatCurrency(currentTransaction?.amount || 0, activeOrganization.currency)}</div>
                    <div><strong>Support DATA WORK AGENCY :</strong> +237 690 37 04 54</div>
                  </div>
                  <button
                    onClick={() => setShowCheckoutModal(false)}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Fermer et suivre l&apos;état
                  </button>
                </div>
              )}

              {paymentStep === 'confirmed' && (
                <div className="py-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-lg">Paiement validé avec succès !</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                      Votre abonnement RestaurantOS <strong>{selectedPlan.name}</strong> a été activé. Merci de votre confiance en <strong>DATA WORK AGENCY</strong>.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-left space-y-1 border border-slate-200 dark:border-slate-700 max-w-sm mx-auto font-mono text-slate-800 dark:text-slate-200 tabular-nums">
                    <div><strong>Facture N° :</strong> {currentTransaction?.invoiceNumber}</div>
                    <div><strong>Réf Opérateur :</strong> {currentTransaction?.operatorReference || 'OP-CONFIRMED'}</div>
                    <div><strong>Montant :</strong> {formatCurrency(currentTransaction?.amount || 0, activeOrganization.currency)}</div>
                  </div>
                  <button
                    onClick={() => setShowCheckoutModal(false)}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Retour au tableau de bord
                  </button>
                </div>
              )}

              {paymentStep === 'failed' && (
                <div className="py-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">La transaction n'a pas pu aboutir</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                      La demande a expiré ou le solde est insuffisant. Vous pouvez réessayer avec un autre numéro ou contacter DATA WORK AGENCY.
                    </p>
                  </div>
                  <button
                    onClick={() => setPaymentStep('select')}
                    className="px-5 py-2 bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Réessayer
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-center text-[11px] text-slate-400 dark:text-slate-500">
              RestaurantOS — Solution commercialisée par <strong className="text-slate-600 dark:text-slate-300">DATA WORK AGENCY</strong>
            </div>
          </div>
        </div>
      )}

      {/* INVOICE PREVIEW MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 overflow-hidden p-6 space-y-5 animate-in fade-in">
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-base">FACTURE D'ABONNEMENT</div>
                <div className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">{selectedInvoice.invoiceNumber}</div>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2 gap-4">
                <span className="text-slate-500 dark:text-slate-400 shrink-0">Éditeur & Vendeur :</span>
                <span className="font-bold text-slate-900 dark:text-white text-right">
                  DATA WORK AGENCY<br />
                  <span className="font-normal text-slate-500 dark:text-slate-400 text-[11px]">Tél : +237 690 37 04 54 | dataworkagency0@gmail.com</span><br />
                  <span className="font-normal text-slate-500 dark:text-slate-400 text-[11px]">Instagram : Data Work Agency (Douala / Yaoundé)</span>
                </span>
              </div>

              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2 gap-4">
                <span className="text-slate-500 dark:text-slate-400 shrink-0">Client / Établissement :</span>
                <span className="font-bold text-slate-900 dark:text-white text-right">
                  {selectedInvoice.restaurantName}<br />
                  <span className="font-normal text-slate-500 dark:text-slate-400 text-[11px]">{selectedInvoice.payerEmail || activeOrganization.email}</span>
                </span>
              </div>

              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2 gap-4">
                <span className="text-slate-500 dark:text-slate-400 shrink-0">Désignation :</span>
                <span className="font-medium text-slate-900 dark:text-slate-200 text-right">
                  Licence SaaS RestaurantOS — Formule {selectedInvoice.planId.toUpperCase()} ({selectedInvoice.period})
                </span>
              </div>

              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2 gap-4">
                <span className="text-slate-500 dark:text-slate-400 shrink-0">Mode de paiement :</span>
                <span className="font-mono text-slate-900 dark:text-slate-200 uppercase">{selectedInvoice.paymentMethod}</span>
              </div>

              <div className="flex justify-between pt-2 text-sm font-bold text-slate-900 dark:text-white">
                <span>
                  {selectedInvoice.status === 'confirmed'
                    ? 'Total Net Encaissé :'
                    : selectedInvoice.status === 'pending'
                    ? 'Montant Pro-forma (En attente) :'
                    : 'Montant (Rejeté) :'}
                </span>
                <span className="font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
                  {formatCurrency(selectedInvoice.amount, selectedInvoice.currency)}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center text-xs">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Imprimer / Télécharger</span>
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 rounded-xl font-semibold cursor-pointer"
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
