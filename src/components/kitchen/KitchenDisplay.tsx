import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useTranslation } from '../../translations';
import { formatTime } from '../../utils/formatters';
import { OrderStatus } from '../../types/restaurant';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertCircle,
  Volume2,
  VolumeX,
  Flame,
  ArrowRight,
  BellRing,
} from 'lucide-react';

export const KitchenDisplay: React.FC = () => {
  const { state, language, updateOrderStatus } = useRestaurant();
  const t = useTranslation(language);

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'preparing' | 'ready'>('all');
  const [now, setNow] = useState(Date.now());

  // Update elapsed minutes timer every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter kitchen-relevant orders (exclude cancelled or draft)
  const kitchenOrders = state.orders
    .filter((o) => o.status !== 'cancelled' && o.status !== 'draft')
    .filter((o) => {
      if (activeTab === 'preparing') return o.status === 'confirmed' || o.status === 'preparing';
      if (activeTab === 'ready') return o.status === 'ready';
      return o.status === 'confirmed' || o.status === 'preparing' || o.status === 'ready';
    });

  const getElapsedMinutes = (createdAt: string) => {
    const diffMs = now - new Date(createdAt).getTime();
    return Math.max(0, Math.floor(diffMs / 60000));
  };

  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      // Audio context may require initial user gesture
    }
  };

  const handleAdvanceStatus = (orderId: string, currentStatus: OrderStatus) => {
    playBeep();
    if (currentStatus === 'confirmed') {
      updateOrderStatus(orderId, 'preparing');
    } else if (currentStatus === 'preparing') {
      updateOrderStatus(orderId, 'ready');
    } else if (currentStatus === 'ready') {
      updateOrderStatus(orderId, 'served');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-900 text-slate-100">
      {/* Top Header Bar */}
      <div className="h-16 px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              <span>{t.kitchen.title}</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {kitchenOrders.length} {language === 'fr' ? 'en cours' : 'active'}
              </span>
            </h1>
            <div className="text-[11px] text-slate-400">
              {state.organization.name} · {t.kitchen.subtitle}
            </div>
          </div>
        </div>

        {/* Tab Filters & Sound Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-slate-800 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'all' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {language === 'fr' ? 'Tous les bons' : 'All Tickets'}
            </button>
            <button
              onClick={() => setActiveTab('preparing')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'preparing' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.kitchen.inProgress}
            </button>
            <button
              onClick={() => setActiveTab('ready')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'ready' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.kitchen.readyToServe}
            </button>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
              soundEnabled
                ? 'border-slate-700 text-amber-400 bg-slate-800'
                : 'border-slate-800 text-slate-500'
            }`}
            title="Signal sonore de commande"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline text-[11px]">Bip</span>
          </button>
        </div>
      </div>

      {/* Main Order Cards Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {kitchenOrders.map((order) => {
            const elapsed = getElapsedMinutes(order.createdAt);
            const isUrgent = elapsed > 20;
            const isWarning = elapsed > 12 && !isUrgent;

            const borderColor = isUrgent
              ? 'border-rose-500 ring-1 ring-rose-500/50'
              : isWarning
              ? 'border-amber-500'
              : order.status === 'ready'
              ? 'border-emerald-500'
              : 'border-slate-800';

            const headerBg = isUrgent
              ? 'bg-rose-950/60 text-rose-200'
              : isWarning
              ? 'bg-amber-950/40 text-amber-200'
              : order.status === 'ready'
              ? 'bg-emerald-950/50 text-emerald-200'
              : 'bg-slate-800/80 text-slate-200';

            return (
              <div
                key={order.id}
                className={`bg-slate-950 rounded-xl border ${borderColor} flex flex-col justify-between overflow-hidden shadow-md`}
              >
                {/* Order Header */}
                <div className={`p-3.5 ${headerBg} flex items-center justify-between border-b border-slate-800`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-white">
                        {order.orderNumber}
                      </span>
                      {isUrgent && (
                        <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded animate-pulse">
                          RETARD
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-slate-300 mt-0.5">
                      {order.tableName ? order.tableName : `À emporter (${order.customerName || 'Client'})`}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 font-mono font-bold text-xs text-slate-100">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{elapsed} min</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {formatTime(order.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Items Body */}
                <div className="p-4 flex-1 space-y-3 divide-y divide-slate-800/60 overflow-y-auto max-h-72">
                  {order.items.map((item, idx) => (
                    <div key={item.id} className="pt-2 first:pt-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded bg-slate-800 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                            {item.quantity}
                          </span>
                          <div>
                            <div className="font-semibold text-xs text-white leading-snug">
                              {item.name}
                            </div>
                            {item.selectedVariant && (
                              <div className="text-[11px] text-amber-400 font-medium">
                                • {item.selectedVariant}
                              </div>
                            )}
                            {item.selectedExtras && item.selectedExtras.length > 0 && (
                              <div className="text-[10px] text-slate-400">
                                + {item.selectedExtras.join(', ')}
                              </div>
                            )}
                            {item.notes && (
                              <div className="text-[11px] text-rose-300 bg-rose-950/40 border border-rose-900/60 px-2 py-0.5 rounded mt-1">
                                Note: {item.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {order.notes && (
                    <div className="pt-2 text-[11px] text-amber-300 bg-amber-950/30 p-2 rounded border border-amber-900/40">
                      Consigne générale: {order.notes}
                    </div>
                  )}
                </div>

                {/* Order Footer & Transition Button */}
                <div className="p-3 bg-slate-900 border-t border-slate-800">
                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => handleAdvanceStatus(order.id, 'confirmed')}
                      className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <Flame className="w-4 h-4" />
                      <span>{t.kitchen.markPreparing}</span>
                    </button>
                  )}

                  {order.status === 'preparing' && (
                    <button
                      onClick={() => handleAdvanceStatus(order.id, 'preparing')}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t.kitchen.markReady}</span>
                    </button>
                  )}

                  {order.status === 'ready' && (
                    <button
                      onClick={() => handleAdvanceStatus(order.id, 'ready')}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <BellRing className="w-4 h-4" />
                      <span>{t.kitchen.markServed}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {kitchenOrders.length === 0 && (
          <div className="h-96 flex flex-col items-center justify-center text-slate-500 text-xs">
            <ChefHat className="w-12 h-12 text-slate-700 mb-3" />
            <span className="text-sm font-semibold text-slate-300">
              {language === 'fr' ? 'Aucune commande en attente de cuisine' : 'No pending kitchen tickets'}
            </span>
            <span className="text-slate-500 mt-1">
              {language === 'fr' ? 'Les nouvelles commandes du POS ou QR s’afficheront en direct ici.' : 'New orders will stream into this view live.'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
