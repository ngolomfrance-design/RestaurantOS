import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useTranslation } from '../../translations';
import { formatCurrency } from '../../utils/formatters';
import { Product, OrderItem } from '../../types/restaurant';
import {
  ArrowLeft,
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle2,
  Clock,
  Utensils,
  ChevronRight,
  ShieldCheck,
  X,
} from 'lucide-react';

export const CustomerQrOrderView: React.FC = () => {
  const { state, language, createOrder, setActiveView } = useRestaurant();
  const t = useTranslation(language);

  const [selectedTableNumber, setSelectedTableNumber] = useState<string>('3');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [submittedOrder, setSubmittedOrder] = useState<any | null>(null);
  const [showCartDrawer, setShowCartDrawer] = useState<boolean>(false);

  const filteredProducts = state.products.filter(
    (p) => p.isAvailable && (selectedCategory === 'all' || p.categoryId === selectedCategory)
  );

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + 1, totalPrice: (i.quantity + 1) * i.unitPrice }
            : i
        );
      }
      return [
        ...prev,
        {
          id: `qi_${Date.now()}_${Math.random()}`,
          productId: product.id,
          name: language === 'fr' ? product.nameFr : product.name,
          unitPrice: product.price,
          quantity: 1,
          totalPrice: product.price,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.productId === productId) {
            const newQty = i.quantity + delta;
            return newQty > 0
              ? { ...i, quantity: newQty, totalPrice: newQty * i.unitPrice }
              : null;
          }
          return i;
        })
        .filter(Boolean) as OrderItem[]
    );
  };

  const totalCart = cart.reduce((sum, i) => sum + i.totalPrice, 0);

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || !customerName) return;

    const targetTable = state.tables.find((t) => t.number === selectedTableNumber);

    const order = createOrder({
      type: 'dine_in',
      tableId: targetTable?.id,
      tableName: targetTable ? targetTable.name : `Table ${selectedTableNumber}`,
      customerName,
      customerPhone,
      items: cart,
      subtotal: totalCart,
      taxAmount: Math.round((totalCart * state.organization.taxRate) / 100),
      totalAmount: totalCart + Math.round((totalCart * state.organization.taxRate) / 100),
      notes: orderNotes,
      paymentStatus: 'unpaid',
    });

    setSubmittedOrder(order);
    setCart([]);
    setShowCartDrawer(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between max-w-lg mx-auto shadow-2xl border-x border-slate-200">
      {/* Top Customer Header with Table identifier */}
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('dashboard')}
            className="p-1 text-slate-400 hover:text-white transition-colors"
            title="Quitter la démo QR"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-sm tracking-tight">{state.organization.name}</h1>
            <div className="text-[11px] text-amber-400 flex items-center gap-1 font-medium">
              <span>{state.organization.city}</span>
              <span>·</span>
              <span className="bg-amber-500/20 px-1.5 py-0.2 rounded text-[10px]">
                Table N° {selectedTableNumber}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowCartDrawer(true)}
          className="relative p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-white transition-colors"
        >
          <ShoppingBag className="w-5 h-5 text-amber-400" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-slate-950 font-bold text-xs rounded-full flex items-center justify-center font-mono">
              {cart.reduce((sum, i) => sum + i.quantity, 0)}
            </span>
          )}
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 space-y-4">
        {/* Banner with Restaurant Ambience */}
        <div className="relative rounded-2xl overflow-hidden aspect-16/9 shadow-sm">
          <img
            src="/src/assets/images/hero_restaurant_os_1792835865372.jpg"
            alt={state.organization.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent p-4 flex flex-col justify-end">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
              Menu Digital Officiel
            </span>
            <h2 className="text-white font-bold text-base">
              Bienvenue au {state.organization.name}
            </h2>
            <p className="text-slate-300 text-xs">
              Commandez directement depuis votre smartphone, servi à votre table.
            </p>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none sticky top-16 bg-slate-50/95 backdrop-blur-xs py-2 z-20">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-700'
            }`}
          >
            Tous les plats
          </button>
          {state.categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === c.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-700'
              }`}
            >
              {language === 'fr' ? c.nameFr : c.name}
            </button>
          ))}
        </div>

        {/* Product Cards List */}
        <div className="space-y-3">
          {filteredProducts.map((p) => {
            const inCart = cart.find((i) => i.productId === p.id);
            return (
              <div
                key={p.id}
                className="bg-white p-3.5 rounded-2xl border border-slate-200 flex gap-3.5 items-center justify-between shadow-2xs"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-slate-900">
                    {language === 'fr' ? p.nameFr : p.name}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                    {language === 'fr' ? p.descriptionFr : p.description}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-900 tabular-nums">
                      {formatCurrency(p.price, state.organization.currency)}
                    </span>
                    {p.prepTimeMinutes && (
                      <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {p.prepTimeMinutes} min
                      </span>
                    )}
                  </div>
                </div>

                <div className="relative shrink-0 flex flex-col items-center gap-2">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-20 h-20 rounded-xl object-cover border border-slate-100"
                  />
                  {inCart ? (
                    <div className="flex items-center gap-1.5 bg-slate-900 text-white rounded-lg px-2 py-0.5 text-xs font-mono font-bold">
                      <button onClick={() => updateQuantity(p.id, -1)} className="px-1 text-slate-300">
                        -
                      </button>
                      <span>{inCart.quantity}</span>
                      <button onClick={() => updateQuantity(p.id, 1)} className="px-1 text-slate-300">
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(p)}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow-2xs transition-colors"
                    >
                      Ajouter
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Bottom Bar if Cart Has Items */}
      {cart.length > 0 && !showCartDrawer && (
        <div className="p-4 bg-white border-t border-slate-200 sticky bottom-0 z-30 shadow-lg">
          <button
            onClick={() => setShowCartDrawer(true)}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-between shadow-md transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center font-mono text-[11px]">
                {cart.reduce((sum, i) => sum + i.quantity, 0)}
              </span>
              <span>Voir ma commande</span>
            </div>
            <span className="font-mono text-sm text-amber-400">
              {formatCurrency(totalCart, state.organization.currency)}
            </span>
          </button>
        </div>
      )}

      {/* Cart & Customer Checkout Drawer */}
      {showCartDrawer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl max-w-lg w-full p-5 border-t border-slate-200 shadow-2xl max-h-[85vh] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Mon Panier</h3>
                  <div className="text-xs text-slate-500">Service à la Table N° {selectedTableNumber}</div>
                </div>
                <button onClick={() => setShowCartDrawer(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 py-2">
                {cart.map((item) => (
                  <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="font-mono text-slate-500 text-[11px]">
                        {formatCurrency(item.unitPrice, state.organization.currency)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, -1)}
                        className="w-6 h-6 rounded bg-slate-100 text-slate-700 flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, 1)}
                        className="w-6 h-6 rounded bg-slate-100 text-slate-700 flex items-center justify-center"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer Contact Form */}
              <form onSubmit={handleSubmitOrder} className="pt-3 space-y-2 border-t border-slate-100 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Votre Prénom ou Nom *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Sophie M."
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Numéro WhatsApp / Tél</label>
                  <input
                    type="tel"
                    placeholder="+237 6xx xx xx xx"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Consigne de préparation</label>
                  <input
                    type="text"
                    placeholder="Ex: Sauce pimentée à part, sans oignon..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-3">
                  <div className="flex justify-between font-bold text-sm text-slate-900 pb-2">
                    <span>Total de la commande</span>
                    <span className="font-mono text-amber-700">
                      {formatCurrency(totalCart, state.organization.currency)}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                  >
                    Envoyer ma commande en cuisine
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation & Live Order Status Modal */}
      {submittedOrder && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-slate-200 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                Commande transmise en cuisine
              </span>
              <h3 className="font-bold text-lg text-slate-900 mt-1">
                {submittedOrder.orderNumber}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Merci {submittedOrder.customerName} ! Notre brigade prépare vos plats.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Table :</span>
                <span className="font-semibold">{submittedOrder.tableName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Statut en direct :</span>
                <span className="font-semibold text-amber-600">En cuisine (KDS)</span>
              </div>
              <div className="flex justify-between font-bold pt-1 border-t border-slate-200">
                <span>Total à régler :</span>
                <span className="font-mono text-slate-900">
                  {formatCurrency(submittedOrder.totalAmount, state.organization.currency)}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setSubmittedOrder(null);
                setActiveView('kitchen');
              }}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Voir la commande sur l'écran cuisine (KDS)
            </button>
          </div>
        </div>
      )}

      {/* Footer Branding */}
      <footer className="p-4 text-center text-[11px] text-slate-400 border-t border-slate-200 bg-white">
        RestaurantOS · Développé par DATA WORK AGENCY
      </footer>
    </div>
  );
};
