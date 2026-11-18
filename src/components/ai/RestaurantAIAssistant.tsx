import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useTranslation } from '../../translations';
import { formatCurrency } from '../../utils/formatters';
import {
  Sparkles,
  Send,
  RefreshCw,
  Lock,
  ArrowRight,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isFallback?: boolean;
}

export const RestaurantAIAssistant: React.FC = () => {
  const {
    language,
    currentUser,
    activeOrganization,
    scopedInventory,
    scopedOrders,
    scopedProducts,
    scopedReservations,
    getPlanEntitlements,
    navigateTo,
  } = useRestaurant();
  const t = useTranslation(language);
  const entitlements = getPlanEntitlements();

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const buildWelcomeMessage = (): ChatMessage => ({
    id: `msg_welcome_${activeOrganization.id}`,
    sender: 'assistant',
    text:
      language === 'fr'
        ? `Bonjour ${currentUser.name || 'Directeur'}, je suis RestaurantOS AI, votre copilote analytique développé par DATA WORK AGENCY. J'analyse en continu vos ventes, vos fiches recettes et vos stocks à ${activeOrganization.name}. Comment puis-je vous éclairer aujourd'hui ?`
        : `Hello ${currentUser.name || 'Manager'}, I am RestaurantOS AI, your decision co-pilot developed by DATA WORK AGENCY. I continuously analyze your sales, recipes, and stock at ${activeOrganization.name}. How can I assist you today?`,
    timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => [buildWelcomeMessage()]);

  useEffect(() => {
    setMessages([buildWelcomeMessage()]);
  }, [activeOrganization.id, language]);

  const quickPrompts = [
    t.ai.suggest1,
    t.ai.suggest2,
    t.ai.suggest3,
    t.ai.suggest4,
  ];

  const handleSendMessage = async (textToSend: string) => {
    const query = textToSend.trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    const lowStockSummary = scopedInventory
      .filter((i) => i.currentStock <= i.minThreshold)
      .map((i) => ({ name: i.name, stock: `${i.currentStock} ${i.unit}`, min: `${i.minThreshold} ${i.unit}`, supplier: i.supplier }));

    const paidOrders = scopedOrders.filter((o) => o.paymentStatus === 'paid');
    const totalSales = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const restaurantContext = {
      restaurantName: activeOrganization.name,
      currency: activeOrganization.currency,
      totalSalesToday: totalSales,
      orderCount: scopedOrders.length,
      lowStockAlerts: lowStockSummary,
      activeMenuProductsCount: scopedProducts.length,
      sampleDishes: scopedProducts.map((p) => ({
        name: p.nameFr || p.name,
        price: p.price,
        cost: p.costPrice || 0,
        marginPct: p.price > 0 ? `${Math.round(((p.price - (p.costPrice || 0)) / p.price) * 100)}%` : '0%',
      })),
      recentReservations: scopedReservations.length,
    };

    try {
      const response = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          restaurantContext,
          language,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur réseau du serveur');
      }

      const data = await response.json();

      const aiMsg: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        sender: 'assistant',
        text: data.reply || "Je n'ai pas pu générer d'analyse pour cette question.",
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        isFallback: data.fallback,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.warn('AI query fallback triggered:', err);
      const topMargins = [...scopedProducts]
        .filter((p) => p.price > 0)
        .sort((a, b) => ((b.price - (b.costPrice || 0)) / b.price) - ((a.price - (a.costPrice || 0)) / a.price))
        .slice(0, 2)
        .map((p) => `${p.nameFr || p.name} (${Math.round(((p.price - (p.costPrice || 0)) / p.price) * 100)}% de marge)`)
        .join(' · ');

      const fallbackMsg: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        sender: 'assistant',
        text:
          language === 'fr'
            ? `Analyse basée sur les données de « ${activeOrganization.name} » :
- Chiffre d'affaires enregistré : ${formatCurrency(totalSales, activeOrganization.currency)} sur ${paidOrders.length} addition(s) payée(s).
- Alerte Stock Critique : ${lowStockSummary.length} ingrédient(s) sous le seuil${lowStockSummary.length > 0 ? ` (${lowStockSummary.map((s) => s.name).join(', ')})` : ''}.
- Meilleures marges actuelles : ${topMargins || 'Ajoutez des plats et coûts matière pour calculer les marges.'}

(Le moteur serveur Gemini est prêt pour les analyses prédictives avancées.)`
            : `Analysis based on "${activeOrganization.name}" data:
- Recorded revenue: ${formatCurrency(totalSales, activeOrganization.currency)} across ${paidOrders.length} paid check(s).
- Critical stock alerts: ${lowStockSummary.length} item(s) low${lowStockSummary.length > 0 ? ` (${lowStockSummary.map((s) => s.name).join(', ')})` : ''}.
- Top current margins: ${topMargins || 'Add menu items and food costs to compute margins.'}`,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        isFallback: true,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (!entitlements.canUseAI) {
    return (
      <div className="p-6 md:p-10 max-w-3xl mx-auto">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-5 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              {entitlements.isExpired
                ? language === 'fr'
                  ? 'Essai gratuit expiré (7 jours)'
                  : 'Free trial expired (7 days)'
                : `${language === 'fr' ? 'Formule actuelle' : 'Current plan'} : ${entitlements.plan.name}`}
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {language === 'fr'
                ? 'RestaurantOS AI est réservé aux formules Premium & Enterprise'
                : 'RestaurantOS AI requires Premium or Enterprise'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
              {entitlements.isExpired
                ? language === 'fr'
                  ? 'Votre période d’essai de 7 jours est arrivée à échéance. Activez une formule Premium ou Enterprise pour retrouver l’assistant analytique IA en direct.'
                  : 'Your 7-day trial has ended. Subscribe to Premium or Enterprise to restore live AI analytics.'
                : language === 'fr'
                ? 'Activez le plan Premium ou Enterprise (ou profitez de l’essai complet 7 jours) pour débloquer l’analyse automatique des marges, prévisions de stocks et conseils de rentabilité.'
                : 'Upgrade to Premium or Enterprise to unlock AI margin analysis, stock forecasting, and profitability advice.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigateTo('subscription')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <span>{language === 'fr' ? 'Activer ou mettre à niveau' : 'Upgrade Subscription'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateTo('dashboard')}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              {language === 'fr' ? 'Retour au tableau de bord' : 'Back to Dashboard'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-5xl mx-auto h-[calc(100vh-4rem)] flex flex-col justify-between">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-bold shadow-xs shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2 flex-wrap">
              <span>{t.ai.title}</span>
              <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded">
                DATA WORK AGENCY
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.ai.subtitle}</p>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 hidden sm:block text-right">
          <div>Données analysées : <strong className="text-slate-700 dark:text-slate-200">{activeOrganization.name}</strong></div>
          <div className="font-mono text-emerald-600 dark:text-emerald-400">Isolation Tenant RLS Active</div>
        </div>
      </div>

      {/* Chat Messages Flow */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs leading-relaxed ${
                isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-[#0B192C] dark:bg-slate-800 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs font-bold text-xs">
                  R
                </div>
              )}

              <div
                className={`max-w-xl p-4 rounded-2xl ${
                  isUser
                    ? 'bg-[#0B192C] dark:bg-amber-500 text-white dark:text-slate-950 rounded-tr-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-2xs rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                <div
                  className={`text-[10px] font-mono mt-2 flex items-center justify-between tabular-nums ${
                    isUser ? 'text-slate-400 dark:text-slate-800' : 'text-slate-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <span className="text-amber-700 dark:text-amber-400 font-medium">RestaurantOS Intelligence</span>
                  )}
                </div>
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs shadow-2xs">
                  {(currentUser.name || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 text-xs items-center text-slate-500 dark:text-slate-400">
            <div className="w-7 h-7 rounded-lg bg-[#0B192C] text-amber-400 flex items-center justify-center shrink-0">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-2xs italic">
              RestaurantOS AI analyse vos données de caisse et de stocks...
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompt Chips & Input Bar */}
      <div className="space-y-3 shrink-0 pt-2 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {quickPrompts.map((promptText, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(promptText)}
              className="text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              {promptText}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputQuery);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={t.ai.placeholder}
            className="flex-1 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 rounded-xl text-xs focus:outline-none focus:border-amber-500 shadow-2xs"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || loading}
            className="p-3 bg-[#0B192C] dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 disabled:opacity-50 text-white dark:text-slate-950 rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[10px] text-slate-400 text-center">
          {t.ai.disclaimer}
        </p>
      </div>
    </div>
  );
};
