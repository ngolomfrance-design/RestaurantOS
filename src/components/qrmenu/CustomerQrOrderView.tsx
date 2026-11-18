import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { formatCurrency, getOrderStatusBadge } from '../../utils/formatters';
import { Product, OrderItem } from '../../types/restaurant';
import {
  ArrowLeft,
  ShoppingBag,
  CheckCircle2,
  Clock,
  X,
  Eye,
  ShieldAlert,
} from 'lucide-react';

export const CustomerQrOrderView: React.FC = () => {
  const {
    activeOrganization,
    scopedProducts,
    scopedCategories,
    scopedTables,
    scopedOrders,
    language,
    setLanguage,
    createOrder,
    isAuthenticated,
    publicPreviewMode,
    publicTableParam,
    exitPublicPreview,
  } = useRestaurant();

  const [selectedTableNumber, setSelectedTableNumber] = useState<string>(
    publicTableParam || scopedTables[0]?.number || '1'
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [submittedOrderId, setSubmittedOrderId] = useState<string | null>(null);
  const [showCartDrawer, setShowCartDrawer] = useState<boolean>(false);

  useEffect(() => {
    if (publicTableParam) {
      setSelectedTableNumber(publicTableParam);
    }
  }, [publicTableParam]);

  const submittedOrder = submittedOrderId
    ? scopedOrders.find((o) => o.id === submittedOrderId) || null
    : null;

  const filteredProducts = scopedProducts.filter(
    (p) => selectedCategory === 'all' || p.categoryId === selectedCategory
  );

  const addToCart = (product: Product) => {
    if (!product.isAvailable) return;
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
  const taxAmount = Math.round((totalCart * (activeOrganization.taxRate || 0)) / 100);
  const grandTotal = totalCart + taxAmount;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || !customerName.trim()) return;
    if (activeOrganization.enableTableOrdering === false) return;

    const targetTable = scopedTables.find((t) => t.number === selectedTableNumber);

    const order = createOrder({
      orgId: activeOrganization.id,
      type: 'dine_in',
      source: 'qr_table',
      tableId: targetTable?.id,
      tableName: targetTable ? targetTable.name : `Table ${selectedTableNumber}`,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      items: cart,
      subtotal: totalCart,
      taxAmount,
      totalAmount: grandTotal,
      notes: orderNotes.trim(),
      paymentStatus: 'unpaid',
    });

    setSubmittedOrderId(order.id);
    setCart([]);
    setShowCartDrawer(false);
  };

  const showPreviewReturnBar = isAuthenticated && publicPreviewMode;

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-between max-w-lg mx-auto shadow-2xl border-x border-slate-200 pb-20">
      {/* Unified Single Sticky Top Bar (Strictly <= 15% viewport height) */}
      <div className="sticky top-0 z-30 bg-[#0B192C] text-white shadow-md">
        {showPreviewReturnBar && (
          <div className="bg-amber-500 text-slate-950 px-3 py-1.5 text-[11px] font-bold flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 truncate">
              <Eye className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{language === 'fr' ? 'Aperçu Client QR Table' : 'QR Table Preview'}</span>
            </span>
            <button
              onClick={exitPublicPreview}
              className="px-2 py-0.5 bg-[#0B192C] text-white rounded-md flex items-center gap-1 cursor-pointer shrink-0 whitespace-nowrap"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>{language === 'fr' ? 'Espace Pro' : 'Pro Workspace'}</span>
            </button>
          </div>
        )}

        <header className="px-4 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            {activeOrganization.logo ? (
              <img
                src={activeOrganization.logo}
                alt={activeOrganization.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
                className="w-9 h-9 rounded-xl object-cover border border-white/20 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0">
                {activeOrganization.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="font-bold text-sm tracking-tight truncate">{activeOrganization.name}</h1>
              <div className="text-[11px] text-amber-400 flex items-center gap-1.5 font-medium truncate">
                <span className="truncate">{activeOrganization.city}</span>
                <span>·</span>
                <span className="font-mono tabular-nums shrink-0">Table N° {selectedTableNumber}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
              className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-bold uppercase cursor-pointer"
            >
              {language}
            </button>
            <button
              onClick={() => setShowCartDrawer(true)}
              aria-label="Panier"
              className="relative p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-slate-950 font-bold text-xs rounded-full flex items-center justify-center font-mono tabular-nums">
                  {cart.reduce((sum, i) => sum + i.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </header>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 space-y-5">
        {/* Banner with Restaurant Ambience */}
        <div className="relative rounded-2xl overflow-hidden aspect-16/9 shadow-sm border border-slate-200">
          <img
            src={activeOrganization.coverImage || '/src/assets/images/hero_restaurant_os_1792835865372.jpg'}
            alt={activeOrganization.name}
            referrerPolicy="no-referrer"
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              if (!img.src.includes('hero_restaurant_os')) {
                img.src = '/src/assets/images/hero_restaurant_os_1792835865372.jpg';
              }
            }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B192C]/90 via-[#0B192C]/40 to-transparent p-4 flex flex-col justify-end">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-[0.16em]">
              {language === 'fr' ? `Menu Digital · Table ${selectedTableNumber}` : `Digital Menu · Table ${selectedTableNumber}`}
            </span>
            <h2 className="font-serif-luxury text-white font-bold text-2xl leading-tight mt-0.5 text-balance">
              {language === 'fr' ? `Bienvenue au ${activeOrganization.name}` : `Welcome to ${activeOrganization.name}`}
            </h2>
            <p className="text-slate-200 text-xs mt-1">
              {language === 'fr'
                ? 'Commandez directement depuis votre smartphone, servi à votre table.'
                : 'Order directly from your smartphone, served straight to your table.'}
            </p>
          </div>
        </div>

        {activeOrganization.enableTableOrdering === false && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              {language === 'fr'
                ? 'La commande directe sur table est temporairement désactivée. Vous pouvez consulter la carte et commander auprès de votre serveur.'
                : 'Direct table ordering is currently disabled. Please consult the menu and order with your server.'}
            </span>
          </div>
        )}

        {/* Categories Bar (Non-sticky in document flow so top sticky height stays slim) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#0B192C] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {language === 'fr' ? 'Tous les plats' : 'All Dishes'}
          </button>
          {scopedCategories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-[#0B192C] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
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
                className={`bg-white p-3.5 rounded-2xl border border-slate-200 flex gap-3.5 items-center justify-between shadow-2xs ${
                  !p.isAvailable ? 'opacity-65' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-bold text-xs text-[#0B192C]">
                      {language === 'fr' ? p.nameFr : p.name}
                    </div>
                    {!p.isAvailable && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                        {language === 'fr' ? 'Indisponible' : 'Sold out'}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                    {language === 'fr' ? p.descriptionFr : p.description}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-amber-800 tabular-nums">
                      {formatCurrency(p.price, activeOrganization.currency)}
                    </span>
                    {p.prepTimeMinutes && (
                      <span className="text-[10px] text-slate-500 flex items-center gap-0.5 tabular-nums">
                        <Clock className="w-3 h-3" />
                        {p.prepTimeMinutes} min
                      </span>
                    )}
                  </div>
                </div>

                <div className="relative shrink-0 flex flex-col items-center gap-2">
                  <img
                    src={p.image || '/src/assets/images/dish_ndole_royal_1792835866049.jpg'}
                    alt={p.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      if (!img.src.includes('dish_ndole_royal')) {
                        img.src = '/src/assets/images/dish_ndole_royal_1792835866049.jpg';
                      }
                    }}
                    className="w-20 h-20 rounded-xl object-cover border border-slate-100"
                  />
                  {activeOrganization.enableTableOrdering !== false && p.isAvailable && (
                    inCart ? (
                      <div className="flex items-center gap-1.5 bg-[#0B192C] text-white rounded-lg px-2 py-0.5 text-xs font-mono font-bold tabular-nums">
                        <button onClick={() => updateQuantity(p.id, -1)} className="px-1 text-slate-300 hover:text-white cursor-pointer">
                          -
                        </button>
                        <span>{inCart.quantity}</span>
                        <button onClick={() => updateQuantity(p.id, 1)} className="px-1 text-slate-300 hover:text-white cursor-pointer">
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(p)}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-2xs transition-colors cursor-pointer"
                      >
                        {language === 'fr' ? 'Ajouter' : 'Add'}
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Bottom Bar if Cart Has Items */}
      {cart.length > 0 && !showCartDrawer && (
        <div className="fixed bottom-3 left-0 right-0 max-w-lg mx-auto px-4 z-30">
          <button
            onClick={() => setShowCartDrawer(true)}
            className="w-full py-3.5 px-4 bg-[#0B192C] hover:bg-slate-800 text-white font-bold text-xs rounded-2xl flex items-center justify-between shadow-xl border border-amber-500/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center font-mono tabular-nums text-[11px] font-extrabold">
                {cart.reduce((sum, i) => sum + i.quantity, 0)}
              </span>
              <span>{language === 'fr' ? 'Voir ma commande' : 'View Order'}</span>
            </div>
            <span className="font-mono tabular-nums text-sm text-amber-400">
              {formatCurrency(grandTotal, activeOrganization.currency)}
            </span>
          </button>
        </div>
      )}

      {/* Cart & Customer Checkout Drawer */}
      {showCartDrawer && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl max-w-lg w-full p-5 border-t border-slate-200 shadow-2xl max-h-[85vh] overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    {language === 'fr' ? 'Mon Panier' : 'My Cart'}
                  </h3>
                  <div className="text-xs text-slate-500">
                    {language === 'fr' ? `Service à la Table N° ${selectedTableNumber}` : `Table N° ${selectedTableNumber}`}
                  </div>
                </div>
                <button onClick={() => setShowCartDrawer(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 py-2">
                {cart.map((item) => (
                  <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="font-mono text-slate-500 text-[11px]">
                        {formatCurrency(item.unitPrice, activeOrganization.currency)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, -1)}
                        className="w-6 h-6 rounded bg-slate-100 text-slate-700 flex items-center justify-center cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-mono font-bold w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, 1)}
                        className="w-6 h-6 rounded bg-slate-100 text-slate-700 flex items-center justify-center cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Customer Contact Form */}
              <form onSubmit={handleSubmitOrder} className="pt-3 space-y-2.5 border-t border-slate-100 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {language === 'fr' ? 'Votre Prénom ou Nom *' : 'Your Name *'}
                  </label>
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
                  <label className="font-semibold text-slate-700 block mb-1">
                    {language === 'fr' ? 'Numéro WhatsApp / Tél' : 'WhatsApp / Phone'}
                  </label>
                  <input
                    type="tel"
                    placeholder="+237 6xx xx xx xx"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    {language === 'fr' ? 'Consigne de préparation' : 'Preparation Notes'}
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Sauce pimentée à part, sans oignon..."
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="pt-2 bg-slate-50 p-3 rounded-xl space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>{language === 'fr' ? 'Sous-total' : 'Subtotal'}</span>
                    <span className="font-mono">{formatCurrency(totalCart, activeOrganization.currency)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>{language === 'fr' ? `Taxes (${activeOrganization.taxRate}%)` : `Tax (${activeOrganization.taxRate}%)`}</span>
                    <span className="font-mono">{formatCurrency(taxAmount, activeOrganization.currency)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
                    <span>{language === 'fr' ? 'Total à régler sur place' : 'Total to pay on site'}</span>
                    <span className="font-mono text-amber-700">
                      {formatCurrency(grandTotal, activeOrganization.currency)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  {language === 'fr' ? 'Envoyer ma commande au restaurant' : 'Send Order to Restaurant'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Client-Only Confirmation & Live Order Status Modal (ZERO Admin/KDS access) */}
      {submittedOrder && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-slate-200 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                {language === 'fr' ? 'Commande enregistrée' : 'Order Received'}
              </span>
              <h3 className="font-bold text-lg text-slate-900 mt-1">
                {submittedOrder.orderNumber}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {language === 'fr'
                  ? `Merci ${submittedOrder.customerName} ! Votre commande a été transmise à l’équipe.`
                  : `Thank you ${submittedOrder.customerName}! Your order has been sent to the team.`}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Table :</span>
                <span className="font-semibold">{submittedOrder.tableName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{language === 'fr' ? 'Statut :' : 'Status:'}</span>
                <span className="font-semibold text-amber-700">
                  {getOrderStatusBadge(submittedOrder.status, language).label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{language === 'fr' ? 'Règlement :' : 'Payment:'}</span>
                <span className="font-semibold text-slate-700">
                  {language === 'fr' ? 'Au restaurant / À table' : 'Pay at table / counter'}
                </span>
              </div>
              <div className="flex justify-between font-bold pt-1 border-t border-slate-200">
                <span>Total :</span>
                <span className="font-mono text-slate-900">
                  {formatCurrency(submittedOrder.totalAmount, activeOrganization.currency)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSubmittedOrderId(null)}
              className="w-full py-2.5 bg-[#0B192C] hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              {language === 'fr' ? 'Retour au menu' : 'Back to Menu'}
            </button>
          </div>
        </div>
      )}

      {/* Footer Branding */}
      <footer className="p-4 text-center text-[11px] text-slate-400 border-t border-slate-200 bg-white">
        {activeOrganization.name} · Propulsé par RestaurantOS (DATA WORK AGENCY)
      </footer>
    </div>
  );
};
