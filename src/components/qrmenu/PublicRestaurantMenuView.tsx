import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useTranslation } from '../../translations';
import { formatCurrency } from '../../utils/formatters';
import {
  QrCode,
  Download,
  Printer,
  Share2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Search,
  ShoppingBag,
  ExternalLink,
  X,
  Check,
  ChevronDown,
} from 'lucide-react';

export const PublicRestaurantMenuView: React.FC = () => {
  const {
    activeOrganization,
    scopedProducts,
    scopedCategories,
    language,
    navigateTo,
    createOrder,
  } = useRestaurant();
  const t = useTranslation(language);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [cart, setCart] = useState<{ productId: string; name: string; price: number; quantity: number }[]>([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [orderSent, setOrderSent] = useState(false);

  // Dynamic public URL for this restaurant
  const publicMenuUrl = `${window.location.origin}/menu/${activeOrganization.slug || activeOrganization.id}`;
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=12&data=${encodeURIComponent(publicMenuUrl)}`;

  // Filter products
  const filteredProducts = scopedProducts.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const handleSendOrder = () => {
    if (cart.length === 0) return;
    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    createOrder({
      customerName: 'Commande en ligne (Menu Public)',
      type: 'delivery',
      items: cart.map((c) => ({
        id: `item_${Date.now()}_${c.productId}`,
        productId: c.productId,
        name: c.name,
        quantity: c.quantity,
        unitPrice: c.price,
        totalPrice: c.price * c.quantity,
      })),
      subtotal: totalAmount,
      totalAmount,
    });

    setCart([]);
    setOrderSent(true);
    setTimeout(() => {
      setOrderSent(false);
      setShowCartDrawer(false);
    }, 3000);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Banner Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-sm shadow-xs">
            {activeOrganization.name.charAt(0)}
          </div>
          <div>
            <h1 className="font-bold text-sm text-slate-900">{activeOrganization.name}</h1>
            <p className="text-[11px] text-slate-500">{activeOrganization.city}, {activeOrganization.country}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* QR Code Action Button */}
          <button
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">QR Code du Restaurant</span>
            <span className="sm:hidden">QR</span>
          </button>

          {/* Cart trigger button */}
          {cartItemCount > 0 && (
            <button
              onClick={() => setShowCartDrawer(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              <span>{cartItemCount} ({formatCurrency(cartTotal, activeOrganization.currency)})</span>
            </button>
          )}

          <button
            onClick={() => navigateTo('dashboard')}
            className="text-xs text-slate-500 hover:text-slate-800 ml-2"
          >
            ← Espace Pro
          </button>
        </div>
      </header>

      {/* Hero Cover Banner */}
      <div className="relative h-48 sm:h-64 bg-slate-900 overflow-hidden">
        <img
          src={activeOrganization.coverImage || '/src/assets/images/restaurant_terrace_bar_1792835866677.jpg'}
          alt={activeOrganization.name}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white">
          <div className="max-w-4xl space-y-1.5">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {activeOrganization.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {activeOrganization.description || 'Bienvenue dans notre établissement. Découvrez notre carte de saison et nos spécialités culinaires préparées chaque jour.'}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-300 font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                {activeOrganization.address || activeOrganization.city}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {activeOrganization.openingHours || 'Lun - Dim: 11h - 23h'}
              </span>
              {activeOrganization.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  {activeOrganization.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 space-y-6">
        {/* Search & Category Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un plat, une boisson..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-hidden focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Tous les plats ({scopedProducts.length})
            </button>
            {scopedCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat.nameFr || cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dishes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className={`bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between ${
                !product.isAvailable ? 'opacity-60' : ''
              }`}
            >
              <div>
                <div className="relative h-44 bg-slate-100">
                  <img
                    src={product.image || '/src/assets/images/dish_grilled_fish_1792835864516.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {!product.isAvailable && (
                    <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center">
                      <span className="text-white text-xs font-bold uppercase tracking-wider bg-rose-600 px-3 py-1 rounded-md">
                        Épuisé pour le service
                      </span>
                    </div>
                  )}
                  {product.prepTimeMinutes && (
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-950/70 text-white text-[10px] font-mono flex items-center gap-1 backdrop-blur-xs">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{product.prepTimeMinutes} min</span>
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{product.name}</h3>
                    <span className="font-mono font-bold text-amber-900 text-sm whitespace-nowrap">
                      {formatCurrency(product.price, activeOrganization.currency)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {product.description || 'Préparé avec des ingrédients frais selon notre recette artisanale.'}
                  </p>

                  {product.allergens && product.allergens.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {product.allergens.map((all, idx) => (
                        <span key={idx} className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {all}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  type="button"
                  disabled={!product.isAvailable}
                  onClick={() => addToCart(product)}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Commander ce plat</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-xs">
            Aucun plat ne correspond à votre recherche dans cet établissement.
          </div>
        )}
      </div>

      {/* QR CODE MODAL FOR DOWNLOAD & PRINT */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm">QR Code du Menu Public</h3>
              </div>
              <button onClick={() => setShowQrModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 text-center space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border inline-block">
                <img
                  src={qrCodeImageUrl}
                  alt="QR Code du Restaurant"
                  className="w-48 h-48 block mx-auto"
                />
                <span className="text-xs font-bold text-slate-800 block mt-2">{activeOrganization.name}</span>
                <span className="text-[11px] text-slate-400">Scannez pour ouvrir le menu</span>
              </div>

              <div className="p-2.5 bg-slate-50 border rounded-xl flex items-center justify-between text-xs font-mono text-slate-600">
                <span className="truncate pr-2">{publicMenuUrl}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(publicMenuUrl);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2500);
                  }}
                  className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg shrink-0"
                >
                  {copiedLink ? 'Copié !' : 'Copier'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <a
                  href={qrCodeImageUrl}
                  download={`QR_Code_${activeOrganization.name}.png`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger</span>
                </a>
                <button
                  onClick={() => window.print()}
                  className="py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimer</span>
                </button>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-400">
              RestaurantOS — Propulsé par DATA WORK AGENCY
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-base text-slate-900">Mon Panier</h3>
                </div>
                <button onClick={() => setShowCartDrawer(false)} className="p-1 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {orderSent && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
                  Votre commande a été transmise directement au restaurant ! Merci de votre visite.
                </div>
              )}

              <div className="divide-y divide-slate-100">
                {cart.map((item) => (
                  <div key={item.productId} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-slate-500 font-mono">
                        {item.quantity} x {formatCurrency(item.price, activeOrganization.currency)}
                      </div>
                    </div>
                    <div className="font-mono font-bold text-slate-900">
                      {formatCurrency(item.price * item.quantity, activeOrganization.currency)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t space-y-3">
              <div className="flex justify-between font-bold text-base">
                <span>Total :</span>
                <span className="font-mono text-amber-900">
                  {formatCurrency(cartTotal, activeOrganization.currency)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleSendOrder}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Confirmer la commande
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
