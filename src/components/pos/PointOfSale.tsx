import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useTranslation } from '../../translations';
import { formatCurrency, formatTime } from '../../utils/formatters';
import { Product, OrderType, PaymentMethod, OrderItem, ProductVariant, ProductExtra } from '../../types/restaurant';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Receipt,
  Printer,
  CheckCircle2,
  CreditCard,
  Banknote,
  Smartphone,
  Tag,
  UtensilsCrossed,
  ArrowRight,
  X,
} from 'lucide-react';

export const PointOfSale: React.FC = () => {
  const {
    scopedProducts,
    scopedCategories,
    scopedTables,
    activeOrganization,
    language,
    createOrder,
    setActiveView,
  } = useRestaurant();
  const t = useTranslation(language);

  // Filters & Cart State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [selectedTableId, setSelectedTableId] = useState<string>(scopedTables[0]?.id || '');
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [discountPct, setDiscountPct] = useState<number>(0);
  const [orderNotes, setOrderNotes] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');

  useEffect(() => {
    setSelectedCategory('all');
    setSelectedTableId(scopedTables[0]?.id || '');
    setCartItems([]);
  }, [activeOrganization.id]);

  // Modals
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  const [modalVariant, setModalVariant] = useState<ProductVariant | undefined>(undefined);
  const [modalExtras, setModalExtras] = useState<ProductExtra[]>([]);
  const [modalNotes, setModalNotes] = useState<string>('');

  // Payment & Receipt
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [mobilePhoneRef, setMobilePhoneRef] = useState<string>('+237 6');
  const [createdReceiptOrder, setCreatedReceiptOrder] = useState<any | null>(null);

  // Filter products
  const filteredProducts = scopedProducts.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameFr.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Open variant & extras modal or add directly
  const handleProductClick = (product: Product) => {
    if (!product.isAvailable) return;
    if ((product.variants && product.variants.length > 0) || (product.extras && product.extras.length > 0)) {
      setSelectedProductForModal(product);
      setModalVariant(product.variants?.[0]);
      setModalExtras([]);
      setModalNotes('');
    } else {
      addToCart(product, undefined, [], '');
    }
  };

  const addToCart = (
    product: Product,
    variant?: ProductVariant,
    extras: ProductExtra[] = [],
    notes?: string
  ) => {
    const variantPrice = variant ? variant.priceDelta : 0;
    const extrasPrice = extras.reduce((sum, e) => sum + e.price, 0);
    const unitPrice = product.price + variantPrice + extrasPrice;

    setCartItems((prev) => {
      // Check if identical item (same variant, extras, notes) already exists
      const existingIdx = prev.findIndex(
        (i) =>
          i.productId === product.id &&
          i.selectedVariant === (variant ? (language === 'fr' ? variant.nameFr : variant.name) : undefined) &&
          (i.notes || '') === (notes || '')
      );

      if (existingIdx !== -1) {
        const copy = [...prev];
        const newQty = copy[existingIdx].quantity + 1;
        copy[existingIdx] = {
          ...copy[existingIdx],
          quantity: newQty,
          totalPrice: newQty * copy[existingIdx].unitPrice,
        };
        return copy;
      }

      const newItem: OrderItem = {
        id: `oi_${Date.now()}_${Math.random()}`,
        productId: product.id,
        name: language === 'fr' ? product.nameFr : product.name,
        unitPrice,
        quantity: 1,
        totalPrice: unitPrice,
        selectedVariant: variant ? (language === 'fr' ? variant.nameFr : variant.name) : undefined,
        selectedExtras: extras.map((e) => (language === 'fr' ? e.nameFr : e.name)),
        notes,
      };

      return [...prev, newItem];
    });

    setSelectedProductForModal(null);
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0
              ? { ...item, quantity: newQty, totalPrice: newQty * item.unitPrice }
              : null;
          }
          return item;
        })
        .filter(Boolean) as OrderItem[]
    );
  };

  const removeItem = (itemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, i) => sum + i.totalPrice, 0);
  const discountAmount = Math.round((subtotal * discountPct) / 100);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round((taxableAmount * activeOrganization.taxRate) / 100);
  const totalAmount = taxableAmount + taxAmount;

  // Selected table name
  const selectedTable = scopedTables.find((t) => t.id === selectedTableId);

  // Complete Payment & Generate Order
  const handleConfirmOrder = () => {
    if (cartItems.length === 0) return;

    const newOrder = createOrder({
      type: orderType,
      tableId: orderType === 'dine_in' ? selectedTableId : undefined,
      tableName: orderType === 'dine_in' ? selectedTable?.name : undefined,
      customerName: customerName || (orderType === 'dine_in' ? `Table ${selectedTable?.number}` : 'Client Comptoir'),
      items: cartItems,
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
      notes: orderNotes,
      paymentStatus: 'paid',
      paymentMethod: selectedPaymentMethod,
      paymentProvider:
        selectedPaymentMethod === 'mobile_money'
          ? (mobilePhoneRef.includes('69') || mobilePhoneRef.includes('65') ? 'orange_money' : 'mtn_momo')
          : undefined,
    });

    setCreatedReceiptOrder(newOrder);
    setShowPaymentModal(false);
    setCartItems([]);
    setOrderNotes('');
    setDiscountPct(0);
    setCustomerName('');
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row lg:h-full overflow-y-auto lg:overflow-hidden bg-slate-100 dark:bg-slate-950">
      {/* Left Area: Categories & Product Catalog */}
      <div className="flex-1 flex flex-col min-w-0 lg:border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {/* Top Control Bar: Search & Categories */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 shrink-0">
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t.pos.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg text-xs focus:outline-none focus:border-amber-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dine-in vs Takeaway selector */}
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
              <button
                onClick={() => setOrderType('dine_in')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  orderType === 'dine_in'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.pos.dineIn}
              </button>
              <button
                onClick={() => setOrderType('takeaway')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  orderType === 'takeaway'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.pos.takeaway}
              </button>
            </div>

            <button
              onClick={() => setActiveView('reports')}
              className="px-3 py-2 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title={language === 'fr' ? 'Ouvrir la clôture de caisse (Rapport Z)' : 'Open Z-Report closing'}
            >
              {language === 'fr' ? 'Clôture Z' : 'Z-Report'}
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#0B192C] dark:bg-amber-500 text-white dark:text-slate-950 font-semibold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {t.pos.allCategories}
            </button>
            {scopedCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#0B192C] dark:bg-amber-500 text-white dark:text-slate-950 font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {language === 'fr' ? cat.nameFr : cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 lg:overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map((product) => (
              <button
                type="button"
                key={product.id}
                onClick={() => handleProductClick(product)}
                className={`bg-white dark:bg-slate-950 text-left rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between group ${
                  !product.isAvailable ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                <div className="aspect-4/3 w-full bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                  <img
                    src={product.image || '/src/assets/images/dish_ndole_royal_1792835866049.jpg'}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = '/src/assets/images/dish_ndole_royal_1792835866049.jpg';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {!product.isAvailable && (
                    <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center text-white text-xs font-semibold">
                      Épuisé
                    </div>
                  )}
                  {product.popular && (
                    <span className="absolute top-2 left-2 bg-amber-500 text-slate-950 font-bold text-[10px] px-1.5 py-0.5 rounded shadow-2xs">
                      Populaire
                    </span>
                  )}
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between w-full">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">
                      {language === 'fr' ? product.nameFr : product.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5">
                      {language === 'fr' ? product.descriptionFr : product.description}
                    </p>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-white tabular-nums">
                      {formatCurrency(product.price, activeOrganization.currency)}
                    </span>
                    <span className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs transition-colors font-bold">
                      +
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-xs">
              <UtensilsCrossed className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
              <span>{language === 'fr' ? 'Aucun plat correspondant.' : 'No items match your search.'}</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Area: Order Ticket & Checkout (384px on lg) */}
      <div className="w-full lg:w-96 bg-white dark:bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 flex flex-col lg:h-full shrink-0 shadow-lg lg:shadow-none">
        {/* Ticket Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 space-y-2.5 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-slate-700 dark:text-amber-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">{t.pos.currentCart}</h2>
            </div>
            <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
              {cartItems.length} {cartItems.length > 1 ? 'articles' : 'article'}
            </span>
          </div>

          {/* Table selector if dine-in */}
          {orderType === 'dine_in' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0">{t.pos.selectTable}:</span>
              <select
                value={selectedTableId}
                onChange={(e) => setSelectedTableId(e.target.value)}
                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-500"
              >
                {scopedTables.map((tb) => (
                  <option key={tb.id} value={tb.id}>
                    {tb.name} ({tb.capacity} pers. - {tb.status === 'occupied' ? 'Occupée' : 'Libre'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Customer name input */}
          <input
            type="text"
            placeholder={language === 'fr' ? 'Nom du client ou note...' : 'Guest name / company...'}
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded text-xs focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Cart Item List */}
        <div className="flex-1 lg:overflow-y-auto p-4 divide-y divide-slate-100 dark:divide-slate-800 min-h-[160px]">
          {cartItems.map((item) => (
            <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3 text-xs">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900 dark:text-white truncate">{item.name}</div>
                {item.selectedVariant && (
                  <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">{item.selectedVariant}</div>
                )}
                {item.selectedExtras && item.selectedExtras.length > 0 && (
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">
                    + {item.selectedExtras.join(', ')}
                  </div>
                )}
                {item.notes && (
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 italic mt-0.5">Note: {item.notes}</div>
                )}
                <div className="text-slate-500 dark:text-slate-400 font-mono tabular-nums text-[11px] mt-0.5">
                  {formatCurrency(item.unitPrice, activeOrganization.currency)}
                </div>
              </div>

              {/* Quantity controls */}
              <div className="flex items-center gap-1.5 shrink-0 pt-1">
                <button
                  onClick={() => updateQuantity(item.id, -1)}
                  className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold cursor-pointer"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center font-mono font-bold text-xs tabular-nums text-slate-900 dark:text-white">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, 1)}
                  className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => removeItem(item.id)}
                  className="w-6 h-6 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center ml-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {cartItems.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-xs py-10">
              <Receipt className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
              <span>{t.pos.emptyCart}</span>
            </div>
          )}
        </div>

        {/* Ticket Financial Summary & Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 space-y-2 shrink-0">
          {/* Quick Discount buttons */}
          <div className="flex items-center justify-between text-xs pb-1">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Tag className="w-3 h-3 text-slate-400" /> {t.pos.discount}:
            </span>
            <div className="flex items-center gap-1">
              {[0, 5, 10, 15].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setDiscountPct(pct)}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-mono tabular-nums cursor-pointer ${
                    discountPct === pct
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>{t.pos.subtotal}</span>
              <span className="font-mono tabular-nums">
                {formatCurrency(subtotal, activeOrganization.currency)}
              </span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-rose-600 dark:text-rose-400 font-medium">
                <span>Remise ({discountPct}%)</span>
                <span className="font-mono tabular-nums">
                  -{formatCurrency(discountAmount, activeOrganization.currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-slate-500 dark:text-slate-400 text-[11px]">
              <span>{t.pos.tax}</span>
              <span className="font-mono tabular-nums">
                {formatCurrency(taxAmount, activeOrganization.currency)}
              </span>
            </div>
            <div className="flex justify-between text-slate-900 dark:text-white font-bold text-sm pt-2 border-t border-slate-200 dark:border-slate-800">
              <span>{t.pos.total}</span>
              <span className="font-mono tabular-nums text-base text-amber-700 dark:text-amber-400">
                {formatCurrency(totalAmount, activeOrganization.currency)}
              </span>
            </div>
          </div>

          {/* Pay / Validate Button */}
          <button
            disabled={cartItems.length === 0}
            onClick={() => setShowPaymentModal(true)}
            className="w-full mt-3 py-3 px-4 bg-[#0B192C] dark:bg-amber-500 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>{t.pos.payment}</span>
            <span className="font-mono tabular-nums">({formatCurrency(totalAmount, activeOrganization.currency)})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MODAL 1: Product Variants & Extras Selection */}
      {selectedProductForModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {language === 'fr' ? selectedProductForModal.nameFr : selectedProductForModal.name}
                </h3>
                <div className="text-xs text-amber-700 dark:text-amber-400 font-mono tabular-nums font-semibold mt-0.5">
                  Base: {formatCurrency(selectedProductForModal.price, activeOrganization.currency)}
                </div>
              </div>
              <button
                onClick={() => setSelectedProductForModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Variants options */}
            {selectedProductForModal.variants && selectedProductForModal.variants.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Taille / Variante</label>
                <div className="grid grid-cols-2 gap-2">
                  {selectedProductForModal.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setModalVariant(v)}
                      className={`p-2.5 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                        modalVariant?.id === v.id
                          ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-semibold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div>{language === 'fr' ? v.nameFr : v.name}</div>
                      <div className="font-mono tabular-nums text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {v.priceDelta > 0 ? `+${formatCurrency(v.priceDelta, activeOrganization.currency)}` : 'Inclus'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Extras options */}
            {selectedProductForModal.extras && selectedProductForModal.extras.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Suppléments & Accompagnements</label>
                <div className="space-y-1.5">
                  {selectedProductForModal.extras.map((extra) => {
                    const isSelected = modalExtras.some((e) => e.id === extra.id);
                    return (
                      <button
                        key={extra.id}
                        onClick={() => {
                          if (isSelected) {
                            setModalExtras(modalExtras.filter((e) => e.id !== extra.id));
                          } else {
                            setModalExtras([...modalExtras, extra]);
                          }
                        }}
                        className={`w-full p-2 rounded-lg border text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-medium'
                            : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>{language === 'fr' ? extra.nameFr : extra.name}</span>
                        <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                          +{formatCurrency(extra.price, activeOrganization.currency)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Preparation note */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Instruction pour la cuisine
              </label>
              <input
                type="text"
                placeholder="Ex: Cuisson bien cuite, sans piment, sauce à part..."
                value={modalNotes}
                onChange={(e) => setModalNotes(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              onClick={() => addToCart(selectedProductForModal, modalVariant, modalExtras, modalNotes)}
              className="w-full py-2.5 bg-[#0B192C] dark:bg-amber-500 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-amber-400 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Ajouter au ticket
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: Payment Modal (Cash with change, Card, Orange/MTN Mobile Money) */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Encaisser la commande</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Montant total net</div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums mt-1">
                {formatCurrency(totalAmount, activeOrganization.currency)}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Mode de règlement</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('cash')}
                  className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                    selectedPaymentMethod === 'cash'
                      ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs whitespace-nowrap">Espèces</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('mobile_money')}
                  className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                    selectedPaymentMethod === 'mobile_money'
                      ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs whitespace-nowrap">Orange / MTN</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                    selectedPaymentMethod === 'card'
                      ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs whitespace-nowrap">Carte CB</span>
                </button>
              </div>
            </div>

            {/* Cash details: Tendered & Change */}
            {selectedPaymentMethod === 'cash' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Montant reçu du client</label>
                <div className="flex flex-wrap gap-2">
                  <input
                    type="number"
                    placeholder="Montant remis (XAF)"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    className="flex-1 min-w-[140px] px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono tabular-nums font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                  {[5000, 10000, 20000, 50000].map((quick) => (
                    <button
                      key={quick}
                      type="button"
                      onClick={() => setCashTendered(quick.toString())}
                      className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-mono tabular-nums rounded font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      {quick / 1000}k
                    </button>
                  ))}
                </div>
                {Number(cashTendered) >= totalAmount && (
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-medium">
                    <span>Monnaie à rendre :</span>
                    <span className="font-mono tabular-nums font-bold text-sm">
                      {formatCurrency(Number(cashTendered) - totalAmount, activeOrganization.currency)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Mobile money reference */}
            {selectedPaymentMethod === 'mobile_money' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Numéro Mobile Money du client</label>
                <input
                  type="text"
                  value={mobilePhoneRef}
                  onChange={(e) => setMobilePhoneRef(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-mono tabular-nums text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Supporte Orange Money (69x) et MTN Mobile Money (67x / 68x) au Cameroun.
                </span>
              </div>
            )}

            <button
              onClick={handleConfirmOrder}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Valider l’encaissement & Imprimer ticket</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: Thermal Receipt Preview Modal (Printable) */}
      {createdReceiptOrder && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-white">Ticket de caisse validé</span>
              <button onClick={() => setCreatedReceiptOrder(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Physical Thermal Receipt Container with id #thermal-receipt (kept light paper even in dark mode) */}
            <div
              id="thermal-receipt"
              className="bg-[#FAF9F6] print:bg-white p-4 rounded-lg border border-slate-200 font-mono text-xs text-slate-900 space-y-3"
            >
              <div className="text-center space-y-0.5 border-b border-dashed border-slate-300 pb-2">
                <div className="font-bold text-sm tracking-tight">{activeOrganization.name}</div>
                <div className="text-[11px] text-slate-500">{activeOrganization.address}</div>
                <div className="text-[11px] text-slate-500">Tél: {activeOrganization.phone}</div>
                <div className="text-[10px] text-slate-500 mt-1">N° Contribuable: M0123456789</div>
              </div>

              <div className="text-[11px] space-y-0.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Ticket: {createdReceiptOrder.orderNumber}</span>
                  <span className="tabular-nums">{formatTime(createdReceiptOrder.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{createdReceiptOrder.tableName || 'Comptoir'}</span>
                  <span>Opérateur: {createdReceiptOrder.createdBy}</span>
                </div>
                {createdReceiptOrder.customerName && (
                  <div>Client: {createdReceiptOrder.customerName}</div>
                )}
              </div>

              <div className="border-t border-b border-dashed border-slate-300 py-2 space-y-1">
                {createdReceiptOrder.items.map((it: any) => (
                  <div key={it.id} className="flex justify-between text-[11px]">
                    <span className="truncate max-w-[180px]">
                      {it.quantity}x {it.name}
                    </span>
                    <span className="tabular-nums">
                      {formatCurrency(it.totalPrice, activeOrganization.currency)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Sous-total HT</span>
                  <span className="tabular-nums">
                    {formatCurrency(createdReceiptOrder.subtotal, activeOrganization.currency)}
                  </span>
                </div>
                {createdReceiptOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Remise accordée</span>
                    <span className="tabular-nums">
                      -{formatCurrency(createdReceiptOrder.discountAmount, activeOrganization.currency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>TVA (19.25%)</span>
                  <span className="tabular-nums">
                    {formatCurrency(createdReceiptOrder.taxAmount, activeOrganization.currency)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
                  <span>TOTAL TTC</span>
                  <span className="tabular-nums">
                    {formatCurrency(createdReceiptOrder.totalAmount, activeOrganization.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 pt-1">
                  <span>Règlement :</span>
                  <span className="uppercase font-semibold">{createdReceiptOrder.paymentMethod}</span>
                </div>
              </div>

              <div className="text-center text-[10px] text-slate-500 border-t border-dashed border-slate-300 pt-2 space-y-0.5">
                <div>Merci de votre visite et à très bientôt !</div>
                <div className="font-semibold text-slate-700">
                  RestaurantOS — DATA WORK AGENCY
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 py-2.5 bg-[#0B192C] dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer ticket (80mm)</span>
              </button>
              <button
                onClick={() => {
                  setCreatedReceiptOrder(null);
                  setActiveView('kitchen');
                }}
                className="px-3 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer whitespace-nowrap"
              >
                Voir en cuisine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
