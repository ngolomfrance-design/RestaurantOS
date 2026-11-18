import React, { useState, useEffect, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useRestaurant } from '../../context/RestaurantContext';
import { formatCurrency, formatTime, getOrderStatusBadge } from '../../utils/formatters';
import {
  OrderItem,
  OrderType,
  Product,
  ProductExtra,
  ProductVariant,
} from '../../types/restaurant';
import {
  QrCode,
  Download,
  Printer,
  Phone,
  Mail,
  MapPin,
  Clock,
  Search,
  ShoppingBag,
  X,
  Check,
  Star,
  ShieldCheck,
  MessageCircle,
  Instagram,
  Facebook,
  Camera,
  CheckCircle2,
  Plus,
  Minus,
  Globe,
  CalendarDays,
  Users,
  UtensilsCrossed,
  Truck,
  PackageCheck,
  Eye,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Copy,
  Info,
  Receipt,
  CreditCard,
  Banknote,
  Smartphone,
} from 'lucide-react';

interface GatewayStatus {
  configured: boolean;
  providers: {
    orange_money: boolean;
    mtn_momo: boolean;
    card: boolean;
  };
  currency: string;
}

export const PublicRestaurantMenuView: React.FC = () => {
  const {
    activeOrganization,
    scopedProducts,
    scopedCategories,
    scopedReviews,
    scopedOrders,
    scopedTables,
    scopedReservations,
    addCustomerReview,
    language,
    setLanguage,
    createOrder,
    createReservation,
    checkReservationAvailability,
    isAuthenticated,
    publicPreviewMode,
    publicTableParam,
    publicUrlInvalidSlug,
    exitPublicPreview,
    navigateTo,
  } = useRestaurant();

  const isFr = language === 'fr';
  const isProPreview = isAuthenticated && publicPreviewMode;

  // Navigation tabs for the public guest storefront
  const [activeTab, setActiveTab] = useState<'menu' | 'reserve' | 'info' | 'tracking'>('menu');

  // Menu state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Dish Options Modal state
  const [optionProduct, setOptionProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);
  const [selectedExtras, setSelectedExtras] = useState<ProductExtra[]>([]);
  const [itemNote, setItemNote] = useState('');

  // Cart & Checkout Drawer state
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [orderType, setOrderType] = useState<OrderType>(() => {
    if (publicTableParam && activeOrganization.enableTableOrdering !== false) return 'dine_in';
    if (activeOrganization.enableTableOrdering !== false) return 'dine_in';
    return 'takeaway';
  });
  const [selectedTableNumber, setSelectedTableNumber] = useState<string>(
    publicTableParam || scopedTables[0]?.number || ''
  );
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [preferredSettlement, setPreferredSettlement] = useState<'cash' | 'mobile_money' | 'card'>('cash');
  const [orderError, setOrderError] = useState('');
  const [justSubmittedOrderId, setJustSubmittedOrderId] = useState<string | null>(null);

  // Payment Gateway Status (verified from backend without secrets)
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatus | null>(null);

  // QR Code Modal state
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrModalTableNum, setQrModalTableNum] = useState<string>(publicTableParam || '');
  const [copiedQrLink, setCopiedQrLink] = useState(false);

  // Photo Gallery Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Review Modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewOrderNum, setReviewOrderNum] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Reservation Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const [resDate, setResDate] = useState(todayStr);
  const [resTime, setResTime] = useState('19:30');
  const [resGuests, setResGuests] = useState(2);
  const [resArea, setResArea] = useState('Salle Principale');
  const [resName, setResName] = useState('');
  const [resPhone, setResPhone] = useState('+237 6');
  const [resEmail, setResEmail] = useState('');
  const [resNotes, setResNotes] = useState('');
  const [resError, setResError] = useState('');
  const [confirmedReservationId, setConfirmedReservationId] = useState<string | null>(null);

  // Private Client Session Storage (Only stores IDs of orders & reservations created in this browser session)
  const orderStorageKey = `restaurantos_client_orders_${activeOrganization.id}`;
  const resStorageKey = `restaurantos_client_reservations_${activeOrganization.id}`;

  const [sessionOrderIds, setSessionOrderIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(orderStorageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [sessionReservationIds, setSessionReservationIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(resStorageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Lookup state (requires exact Reference + Phone match so guests never view others' records)
  const [lookupRef, setLookupRef] = useState('');
  const [lookupPhone, setLookupPhone] = useState('');
  const [lookupError, setLookupError] = useState('');

  // Sync URL table parameter if changed
  useEffect(() => {
    if (publicTableParam) {
      setSelectedTableNumber(publicTableParam);
      if (activeOrganization.enableTableOrdering !== false) {
        setOrderType('dine_in');
      }
    }
  }, [publicTableParam, activeOrganization.enableTableOrdering]);

  // Reload session tracking IDs when switching restaurant
  useEffect(() => {
    try {
      const oRaw = localStorage.getItem(`restaurantos_client_orders_${activeOrganization.id}`);
      const rRaw = localStorage.getItem(`restaurantos_client_reservations_${activeOrganization.id}`);
      setSessionOrderIds(oRaw ? JSON.parse(oRaw) : []);
      setSessionReservationIds(rRaw ? JSON.parse(rRaw) : []);
    } catch {
      setSessionOrderIds([]);
      setSessionReservationIds([]);
    }
  }, [activeOrganization.id]);

  // Query real backend gateway status (never simulates or exposes secrets)
  useEffect(() => {
    let active = true;
    fetch('/api/payments/gateway-status')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data) setGatewayStatus(data);
      })
      .catch(() => {
        if (active) {
          setGatewayStatus({
            configured: false,
            providers: { orange_money: false, mtn_momo: false, card: false },
            currency: activeOrganization.currency || 'XAF',
          });
        }
      });
    return () => {
      active = false;
    };
  }, [activeOrganization.currency]);

  // Ensure invalid slug or unpublished storefront never leaks private restaurant data
  if (publicUrlInvalidSlug) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6 text-slate-900">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="font-serif-luxury text-2xl font-bold text-[#0B192C]">
            {isFr ? 'Restaurant introuvable' : 'Restaurant Not Found'}
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            {isFr
              ? `Aucun établissement actif ne correspond au lien « /menu/${publicUrlInvalidSlug} ». Vérifiez le QR code ou le lien communiqué par le restaurant.`
              : `No active restaurant matches "/menu/${publicUrlInvalidSlug}". Please verify the QR code or link provided by the restaurant.`}
          </p>
          <button
            onClick={() => navigateTo('marketing')}
            className="px-4 py-2.5 bg-[#0B192C] hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            {isFr ? 'Accueil RestaurantOS' : 'RestaurantOS Home'}
          </button>
        </div>
      </div>
    );
  }

  if (activeOrganization.isPublicPublished === false && !isProPreview) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6 text-slate-900">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <h1 className="font-serif-luxury text-2xl font-bold text-[#0B192C]">{activeOrganization.name}</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            {isFr
              ? 'La page publique de cet établissement est actuellement en cours de mise à jour par le restaurateur.'
              : 'This restaurant’s public page is currently being updated by the establishment.'}
          </p>
        </div>
      </div>
    );
  }

  // Dynamic public URLs & Client-Side QR PNG Exporter
  const basePublicUrl = `${window.location.origin}/menu/${activeOrganization.slug || activeOrganization.id}`;
  const qrTargetUrl = qrModalTableNum
    ? `${basePublicUrl}?table=${encodeURIComponent(qrModalTableNum)}`
    : basePublicUrl;

  const handleDownloadQrPng = () => {
    const svgEl = document.getElementById('public-storefront-qr-svg');
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = 480;
      canvas.height = 480;
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 40, 40, 400, 400);
        const pngUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = `qrcode_${activeOrganization.slug || activeOrganization.id}${qrModalTableNum ? `_table_${qrModalTableNum}` : ''}.png`;
        link.click();
      }
    };
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  // Filter products (keep unavailable visible as "Épuisé" so guest understands menu availability)
  const filteredProducts = scopedProducts.filter((product) => {
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      product.name.toLowerCase().includes(q) ||
      product.nameFr.toLowerCase().includes(q) ||
      product.description.toLowerCase().includes(q) ||
      product.descriptionFr.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  // Published reviews
  const publishedReviews = scopedReviews.filter((r) => r.status === 'published');
  const averageRating =
    publishedReviews.length > 0
      ? Math.round(
          (publishedReviews.reduce((sum, r) => sum + r.rating, 0) / publishedReviews.length) * 10
        ) / 10
      : 5.0;

  // Cart totals
  const cartSubtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const cartTax = Math.round((cartSubtotal * (activeOrganization.taxRate || 0)) / 100);
  const cartTotal = cartSubtotal + cartTax;
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Ordering capability check
  const canDineIn = activeOrganization.enableTableOrdering !== false;
  const canOnline = activeOrganization.enableOnlineOrdering !== false;
  const canOrderAtAll = canDineIn || canOnline;
  const canReserve = activeOrganization.enableReservations !== false;

  const openDishModalOrAdd = (product: Product) => {
    if (!product.isAvailable || !canOrderAtAll) return;
    if (
      (product.variants && product.variants.length > 0) ||
      (product.extras && product.extras.length > 0)
    ) {
      setOptionProduct(product);
      setSelectedVariant(product.variants?.[0]);
      setSelectedExtras([]);
      setItemNote('');
    } else {
      addItemToCart(product, undefined, [], '');
    }
  };

  const addItemToCart = (
    product: Product,
    variant?: ProductVariant,
    extras: ProductExtra[] = [],
    notes?: string
  ) => {
    if (!product.isAvailable) return;
    const variantPrice = variant ? variant.priceDelta : 0;
    const extrasPrice = extras.reduce((sum, e) => sum + e.price, 0);
    const unitPrice = product.price + variantPrice + extrasPrice;
    const variantLabel = variant ? (isFr ? variant.nameFr : variant.name) : undefined;
    const extraLabels = extras.map((e) => (isFr ? e.nameFr : e.name));
    const displayName = isFr ? product.nameFr || product.name : product.name || product.nameFr;

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (i) =>
          i.productId === product.id &&
          i.selectedVariant === variantLabel &&
          JSON.stringify(i.selectedExtras || []) === JSON.stringify(extraLabels) &&
          (i.notes || '') === (notes || '')
      );
      if (existingIdx !== -1) {
        const copy = [...prev];
        const qty = copy[existingIdx].quantity + 1;
        copy[existingIdx] = { ...copy[existingIdx], quantity: qty, totalPrice: qty * unitPrice };
        return copy;
      }
      return [
        ...prev,
        {
          id: `pub_item_${Date.now()}_${Math.random()}`,
          productId: product.id,
          name: displayName,
          unitPrice,
          quantity: 1,
          totalPrice: unitPrice,
          selectedVariant: variantLabel,
          selectedExtras: extraLabels,
          notes: notes?.trim() || undefined,
        },
      ];
    });
    setOptionProduct(null);
  };

  const updateCartItemQty = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty, totalPrice: newQty * item.unitPrice } : null;
          }
          return item;
        })
        .filter(Boolean) as OrderItem[]
    );
  };

  // Checkout submit
  const handleSendOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError('');

    if (cart.length === 0) return;
    if (!customerName.trim()) {
      setOrderError(isFr ? 'Veuillez renseigner votre nom.' : 'Please enter your name.');
      return;
    }
    if ((orderType === 'takeaway' || orderType === 'delivery') && !customerPhone.trim()) {
      setOrderError(
        isFr
          ? 'Un numéro de téléphone est nécessaire pour confirmer et suivre votre commande.'
          : 'A phone number is required to confirm and track your order.'
      );
      return;
    }
    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      setOrderError(
        isFr ? 'Veuillez indiquer votre adresse de livraison.' : 'Please provide your delivery address.'
      );
      return;
    }

    const matchedTable =
      orderType === 'dine_in' && selectedTableNumber
        ? scopedTables.find((t) => t.number === selectedTableNumber)
        : undefined;

    const created = createOrder({
      orgId: activeOrganization.id,
      type: orderType,
      source: orderType === 'dine_in' && selectedTableNumber ? 'qr_table' : 'public_web',
      tableId: matchedTable?.id,
      tableName:
        orderType === 'dine_in'
          ? matchedTable?.name || (selectedTableNumber ? `Table ${selectedTableNumber}` : 'En salle')
          : undefined,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress.trim() : undefined,
      items: cart,
      subtotal: cartSubtotal,
      taxAmount: cartTax,
      totalAmount: cartTotal,
      notes: orderNotes.trim() || undefined,
      paymentStatus: 'unpaid',
      paymentMethod: preferredSettlement,
    });

    const nextIds = Array.from(new Set([created.id, ...sessionOrderIds]));
    setSessionOrderIds(nextIds);
    try {
      localStorage.setItem(orderStorageKey, JSON.stringify(nextIds));
    } catch {
      // ignore storage quota errors
    }

    setCart([]);
    setOrderNotes('');
    setJustSubmittedOrderId(created.id);
  };

  // Live availability for reservation inputs
  const availability = useMemo(
    () =>
      checkReservationAvailability(
        activeOrganization.id,
        resDate,
        resTime,
        Number(resGuests) || 2,
        resArea
      ),
    [activeOrganization.id, resDate, resTime, resGuests, resArea, scopedReservations, scopedTables]
  );

  const handleSubmitReservation = (e: React.FormEvent) => {
    e.preventDefault();
    setResError('');

    if (!resName.trim() || !resPhone.trim()) {
      setResError(
        isFr
          ? 'Veuillez indiquer votre nom et votre numéro de téléphone.'
          : 'Please enter your name and phone number.'
      );
      return;
    }

    if (!availability.available) {
      setResError(
        availability.reason ||
          (isFr ? 'Ce créneau n’est plus disponible.' : 'This time slot is unavailable.')
      );
      return;
    }

    const createdRes = createReservation(
      {
        customerName: resName.trim(),
        customerPhone: resPhone.trim(),
        customerEmail: resEmail.trim() || undefined,
        guestCount: Number(resGuests),
        date: resDate,
        time: resTime,
        area: resArea,
        status: 'pending',
        notes: resNotes.trim() || undefined,
      },
      activeOrganization.id
    );

    const nextIds = Array.from(new Set([createdRes.id, ...sessionReservationIds]));
    setSessionReservationIds(nextIds);
    try {
      localStorage.setItem(resStorageKey, JSON.stringify(nextIds));
    } catch {
      // ignore
    }

    setConfirmedReservationId(createdRes.id);
    setResNotes('');
  };

  // Verified Private Lookup: Requires BOTH exact Reference AND matching phone digits
  const normalizePhoneDigits = (p?: string) => (p || '').replace(/[^0-9]/g, '');

  const handlePrivateLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    const ref = lookupRef.trim().toUpperCase();
    const phoneDigits = normalizePhoneDigits(lookupPhone);

    if (!ref || phoneDigits.length < 6) {
      setLookupError(
        isFr
          ? 'Saisissez votre code (ex: CMD-1234 ou RES-1234) ET votre numéro de téléphone complet.'
          : 'Enter both your reference code (e.g. CMD-1234 or RES-1234) and phone number.'
      );
      return;
    }

    const matchedOrder = scopedOrders.find(
      (o) =>
        o.orderNumber.toUpperCase() === ref &&
        o.customerPhone &&
        normalizePhoneDigits(o.customerPhone).endsWith(phoneDigits.slice(-6))
    );

    if (matchedOrder) {
      const next = Array.from(new Set([matchedOrder.id, ...sessionOrderIds]));
      setSessionOrderIds(next);
      localStorage.setItem(orderStorageKey, JSON.stringify(next));
      setLookupRef('');
      return;
    }

    const matchedRes = scopedReservations.find(
      (r) =>
        (r.reservationCode?.toUpperCase() === ref || r.id.toUpperCase() === ref) &&
        normalizePhoneDigits(r.customerPhone).endsWith(phoneDigits.slice(-6))
    );

    if (matchedRes) {
      const next = Array.from(new Set([matchedRes.id, ...sessionReservationIds]));
      setSessionReservationIds(next);
      localStorage.setItem(resStorageKey, JSON.stringify(next));
      setLookupRef('');
      return;
    }

    setLookupError(
      isFr
        ? 'Aucune commande ou réservation correspondante trouvée avec ce code et ce numéro.'
        : 'No matching order or reservation found for that code and phone number.'
    );
  };

  // Client's own visible orders & reservations ONLY
  const clientOrders = scopedOrders.filter((o) => sessionOrderIds.includes(o.id));
  const clientReservations = scopedReservations.filter((r) => sessionReservationIds.includes(r.id));
  const justSubmittedOrder = justSubmittedOrderId
    ? scopedOrders.find((o) => o.id === justSubmittedOrderId) || null
    : null;
  const confirmedReservation = confirmedReservationId
    ? scopedReservations.find((r) => r.id === confirmedReservationId) || null
    : null;

  // Submit review
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;

    const trimmedOrderNum = reviewOrderNum.trim().toUpperCase();
    const matchedOrder = trimmedOrderNum
      ? scopedOrders.find(
          (o) =>
            o.orderNumber.toUpperCase() === trimmedOrderNum ||
            o.id.toUpperCase() === trimmedOrderNum
        )
      : null;

    addCustomerReview({
      orgId: activeOrganization.id,
      customerName: reviewName.trim(),
      rating: reviewRating,
      comment: reviewComment.trim(),
      orderId: matchedOrder?.id,
      orderNumber: matchedOrder ? matchedOrder.orderNumber : trimmedOrderNum || undefined,
      isVerifiedOrder: Boolean(matchedOrder),
    });

    setReviewSubmitted(true);
    setTimeout(() => {
      setReviewSubmitted(false);
      setShowReviewModal(false);
      setReviewName('');
      setReviewComment('');
      setReviewOrderNum('');
    }, 2200);
  };

  const gallery = activeOrganization.gallery || [];
  const socialLinks = activeOrganization.socialLinks;
  const hoursList = activeOrganization.businessHoursSchedule || [];

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900 pb-24">
      {/* Unified Single Sticky Top Bar (<= 15% mobile height) */}
      <div className="sticky top-0 z-40 bg-[#0B192C] text-white shadow-md">
        {isProPreview && (
          <div className="bg-amber-500 text-slate-950 px-4 sm:px-8 py-1.5 text-[11px] font-bold flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Eye className="w-3.5 h-3.5 shrink-0" />
              <span>
                {isFr
                  ? `Aperçu Client — ${activeOrganization.name}`
                  : `Customer Preview — ${activeOrganization.name}`}
              </span>
              {activeOrganization.isPublicPublished === false && (
                <span className="px-2 py-0.5 bg-rose-900 text-white rounded text-[10px]">
                  {isFr ? 'Brouillon' : 'Draft'}
                </span>
              )}
              <span className="hidden md:inline font-mono text-[11px] bg-amber-600/20 px-2 py-0.5 rounded">
                {basePublicUrl}
              </span>
            </div>
            <button
              onClick={exitPublicPreview}
              className="px-2.5 py-0.5 bg-[#0B192C] hover:bg-slate-800 text-white rounded-md text-[11px] font-bold flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>{isFr ? 'Espace Pro' : 'Exit Pro Preview'}</span>
            </button>
          </div>
        )}

        <header className="max-w-6xl mx-auto px-4 sm:px-8 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-sm shadow-xs overflow-hidden shrink-0">
              {activeOrganization.logo ? (
                <img
                  src={activeOrganization.logo}
                  alt={activeOrganization.name}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                  className="w-full h-full object-cover"
                />
              ) : (
                activeOrganization.name.charAt(0)
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-bold text-sm text-white truncate">{activeOrganization.name}</h1>
                {publicTableParam && (
                  <span className="text-[11px] text-amber-400 font-mono tabular-nums font-bold shrink-0">
                    · Table {publicTableParam}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 truncate">
                {activeOrganization.city}, {activeOrganization.country}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* FR / EN Switcher */}
            <button
              onClick={() => setLanguage(isFr ? 'en' : 'fr')}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer whitespace-nowrap"
              title="FR / EN"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span className="uppercase">{language}</span>
            </button>

            {/* QR Code Modal Trigger */}
            <button
              onClick={() => setShowQrModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{isFr ? 'QR Code' : 'QR Code'}</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setShowCartDrawer(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap tabular-nums"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>
                {cartItemCount > 0
                  ? `${cartItemCount} · ${formatCurrency(cartTotal, activeOrganization.currency)}`
                  : isFr
                  ? 'Panier'
                  : 'Cart'}
              </span>
            </button>
          </div>
        </header>
      </div>

      {/* Hero Cover Banner */}
      <div className="relative h-60 sm:h-76 bg-[#0B192C] overflow-hidden">
        <img
          src={
            activeOrganization.coverImage ||
            '/src/assets/images/restaurant_terrace_bar_1792835866677.jpg'
          }
          alt={activeOrganization.name}
          referrerPolicy="no-referrer"
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            if (!img.src.includes('restaurant_terrace_bar')) {
              img.src = '/src/assets/images/restaurant_terrace_bar_1792835866677.jpg';
            }
          }}
          className="w-full h-full object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B192C] via-[#0B192C]/60 to-transparent flex flex-col justify-end p-5 sm:p-8 text-white">
          <div className="max-w-6xl mx-auto w-full space-y-2.5">
            <div className="flex items-center gap-2.5 flex-wrap text-xs">
              <span className="text-[11px] uppercase font-bold tracking-[0.14em] text-amber-400">
                {activeOrganization.type.replace('_', ' ')}
              </span>
              <span className="text-white/40">·</span>
              <div className="flex items-center gap-1 text-amber-300 font-bold tabular-nums">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>
                  {averageRating} / 5 ({publishedReviews.length}{' '}
                  {isFr ? 'avis' : 'reviews'})
                </span>
              </div>
              {publicTableParam && (
                <>
                  <span className="text-white/40">·</span>
                  <span className="text-emerald-300 font-semibold font-mono tabular-nums">
                    {isFr
                      ? `Table N° ${publicTableParam}`
                      : `Table N° ${publicTableParam}`}
                  </span>
                </>
              )}
            </div>

            <h2 className="font-serif-luxury text-3xl sm:text-5xl font-bold tracking-tight text-white text-balance">
              {activeOrganization.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed line-clamp-2">
              {activeOrganization.description ||
                (isFr
                  ? 'Bienvenue dans notre établissement. Découvrez notre carte, réservez votre table ou commandez directement.'
                  : 'Welcome to our restaurant. Explore our digital menu, book a table, or order directly.')}
            </p>

            {/* Restaurant Direct Contact & Social Links */}
            <div className="pt-1 flex flex-wrap items-center gap-2 text-xs text-slate-200 font-medium">
              <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{activeOrganization.address || activeOrganization.city}</span>
              </span>
              <span className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg tabular-nums">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{activeOrganization.openingHours || '11:00 - 23:30'}</span>
              </span>

              {activeOrganization.phone && (
                <a
                  href={`tel:${activeOrganization.phone}`}
                  className="flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors tabular-nums"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>{activeOrganization.phone}</span>
                </a>
              )}

              {socialLinks?.whatsapp && (
                <a
                  href={`https://wa.me/${socialLinks.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600/85 hover:bg-emerald-600 rounded-lg text-white font-semibold transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              )}

              {socialLinks?.instagram && (
                <a
                  href={`https://instagram.com/${socialLinks.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 bg-pink-600/85 hover:bg-pink-600 rounded-lg text-white transition-colors"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>{socialLinks.instagram}</span>
                </a>
              )}

              {socialLinks?.googleMaps && (
                <a
                  href={socialLinks.googleMaps}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 bg-blue-600/85 hover:bg-blue-600 rounded-lg text-white transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Maps</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Storefront Navigation Tabs (Non-sticky in flow for unobstructed reading) */}
      <div className="bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-none text-xs">
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'menu'
                ? 'bg-[#0B192C] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-amber-500" />
            <span>{isFr ? 'Carte & Commande' : 'Menu & Order'}</span>
          </button>

          <button
            onClick={() => setActiveTab('reserve')}
            className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'reserve'
                ? 'bg-[#0B192C] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5 text-amber-500" />
            <span>{isFr ? 'Réserver une table' : 'Book a Table'}</span>
          </button>

          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 tabular-nums ${
              activeTab === 'info'
                ? 'bg-[#0B192C] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Info className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {isFr ? `Infos, Galerie & Avis (${publishedReviews.length})` : `Info, Gallery & Reviews (${publishedReviews.length})`}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tracking')}
            className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 tabular-nums ${
              activeTab === 'tracking'
                ? 'bg-[#0B192C] text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {isFr ? 'Mon Suivi' : 'My Tracking'}
              {clientOrders.length + clientReservations.length > 0 &&
                ` (${clientOrders.length + clientReservations.length})`}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-8">
        {/* TAB 1: MENU & ORDERING */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            {!canOrderAtAll && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {isFr
                    ? 'Consultation du menu uniquement : la prise de commande en ligne est actuellement désactivée par l’établissement.'
                    : 'Menu consultation only: online self-ordering is currently disabled by this restaurant.'}
                </span>
              </div>
            )}

            {/* Search & Categories */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative max-w-sm w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isFr ? 'Rechercher un plat, une boisson...' : 'Search dish or drink...'}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full text-xs">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-[#0B192C] text-white font-bold'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {isFr ? `Tous (${scopedProducts.length})` : `All (${scopedProducts.length})`}
                </button>
                {scopedCategories
                  .filter((c) => c.isActive !== false)
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'bg-[#0B192C] text-white font-bold'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {isFr ? cat.nameFr || cat.name : cat.name || cat.nameFr}
                    </button>
                  ))}
              </div>
            </div>

            {/* Menu Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-500">
                <UtensilsCrossed className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="font-semibold text-slate-700">
                  {isFr ? 'Aucun plat trouvé pour cette recherche.' : 'No dishes match your filter.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map((product) => {
                  const title = isFr ? product.nameFr || product.name : product.name || product.nameFr;
                  const desc = isFr
                    ? product.descriptionFr || product.description
                    : product.description || product.descriptionFr;
                  const hasOptions =
                    (product.variants && product.variants.length > 0) ||
                    (product.extras && product.extras.length > 0);

                  return (
                    <div
                      key={product.id}
                      className={`bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs transition-all flex flex-col justify-between ${
                        !product.isAvailable ? 'opacity-70' : 'hover:shadow-md'
                      }`}
                    >
                      <div className="relative h-44 bg-slate-100 overflow-hidden">
                        <img
                          src={product.image || '/src/assets/images/dish_grilled_fish_1792835864516.jpg'}
                          alt={title}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const img = e.currentTarget as HTMLImageElement;
                            if (!img.src.includes('dish_grilled_fish')) {
                              img.src = '/src/assets/images/dish_grilled_fish_1792835864516.jpg';
                            }
                          }}
                          className="w-full h-full object-cover"
                        />
                        {product.popular && product.isAvailable && (
                          <span className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-bold text-[10px] px-2.5 py-0.5 rounded-md shadow-xs">
                            {isFr ? 'Spécialité' : 'Popular'}
                          </span>
                        )}
                        {!product.isAvailable && (
                          <span className="absolute top-3 left-3 bg-rose-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-md shadow-xs">
                            {isFr ? 'Indisponible' : 'Sold out'}
                          </span>
                        )}
                        <span className="absolute bottom-3 right-3 bg-[#0B192C]/90 backdrop-blur-xs text-white font-mono tabular-nums font-bold text-xs px-2.5 py-1 rounded-xl">
                          {formatCurrency(product.price, activeOrganization.currency)}
                        </span>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <h3 className="font-bold text-sm text-[#0B192C]">{title}</h3>
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{desc}</p>
                          {product.allergens && product.allergens.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {product.allergens.map((al) => (
                                <span
                                  key={al}
                                  className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                                >
                                  {al}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <span className="text-[11px] text-slate-400">
                            {product.prepTimeMinutes
                              ? `⏱ ~${product.prepTimeMinutes} min`
                              : isFr
                              ? 'Fait maison'
                              : 'Freshly made'}
                          </span>

                          {canOrderAtAll && (
                            <button
                              type="button"
                              disabled={!product.isAvailable}
                              onClick={() => openDishModalOrAdd(product)}
                              className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors ${
                                product.isAvailable
                                  ? 'bg-[#0B192C] hover:bg-slate-800 text-white cursor-pointer'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              <Plus className="w-3.5 h-3.5 text-amber-400" />
                              <span>
                                {!product.isAvailable
                                  ? isFr
                                    ? 'Épuisé'
                                    : 'Unavailable'
                                  : hasOptions
                                  ? isFr
                                    ? 'Choisir'
                                    : 'Options'
                                  : isFr
                                  ? 'Ajouter'
                                  : 'Add'}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RESERVATIONS */}
        {activeTab === 'reserve' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-amber-500" />
                  <span>{isFr ? 'Réserver une table' : 'Book a Table'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {isFr
                    ? `Vérification en direct des disponibilités selon les horaires et la capacité de ${activeOrganization.name}.`
                    : `Live availability checked against ${activeOrganization.name}’s opening hours and seating capacity.`}
                </p>
              </div>

              {!canReserve ? (
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 space-y-2">
                  <p className="font-semibold text-slate-800">
                    {isFr
                      ? 'La réservation en ligne est actuellement désactivée par cet établissement.'
                      : 'Online reservations are currently disabled by this establishment.'}
                  </p>
                  {activeOrganization.phone && (
                    <p>
                      {isFr ? 'Contactez directement le restaurant : ' : 'Contact the restaurant directly: '}
                      <a href={`tel:${activeOrganization.phone}`} className="font-bold text-amber-700 underline">
                        {activeOrganization.phone}
                      </a>
                    </p>
                  )}
                </div>
              ) : confirmedReservation ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-emerald-950">
                        {isFr ? 'Demande de réservation enregistrée !' : 'Reservation Request Recorded!'}
                      </h4>
                      <p className="text-emerald-800">
                        {isFr ? 'Code de référence :' : 'Reference code:'}{' '}
                        <strong className="font-mono">{confirmedReservation.reservationCode || confirmedReservation.id}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-emerald-200/70 grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-400 block">{isFr ? 'Date & Heure' : 'Date & Time'}</span>
                      <strong className="text-slate-900 font-mono">
                        {confirmedReservation.date} · {confirmedReservation.time}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">{isFr ? 'Couverts & Zone' : 'Guests & Area'}</span>
                      <strong className="text-slate-900">
                        {confirmedReservation.guestCount} pers. · {confirmedReservation.area}
                      </strong>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setActiveTab('tracking')}
                      className="px-4 py-2 bg-[#0B192C] text-white font-bold rounded-xl cursor-pointer"
                    >
                      {isFr ? 'Suivre ma réservation' : 'Track My Booking'}
                    </button>
                    <button
                      onClick={() => setConfirmedReservationId(null)}
                      className="px-4 py-2 bg-white border border-emerald-300 text-emerald-900 font-semibold rounded-xl cursor-pointer"
                    >
                      {isFr ? 'Faire une autre demande' : 'Book Another'}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitReservation} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        {isFr ? 'Date souhaitée *' : 'Date *'}
                      </label>
                      <input
                        type="date"
                        min={todayStr}
                        required
                        value={resDate}
                        onChange={(e) => setResDate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        {isFr ? 'Heure *' : 'Time *'}
                      </label>
                      <input
                        type="time"
                        required
                        value={resTime}
                        onChange={(e) => setResTime(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        {isFr ? 'Nombre de personnes *' : 'Party Size *'}
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        required
                        value={resGuests}
                        onChange={(e) => setResGuests(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      {isFr ? 'Espace préféré' : 'Preferred Area'}
                    </label>
                    <select
                      value={resArea}
                      onChange={(e) => setResArea(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:border-amber-500"
                    >
                      <option value="Salle Principale">
                        {isFr ? 'Salle Principale' : 'Main Dining Hall'}
                      </option>
                      <option value="Terrasse">
                        {isFr ? 'Terrasse Jardin' : 'Garden Terrace'}
                      </option>
                      <option value="VIP Lounge">
                        {isFr ? 'Salon VIP' : 'VIP Lounge'}
                      </option>
                    </select>
                  </div>

                  {/* Real-time availability indicator */}
                  <div
                    className={`p-3.5 rounded-xl border flex flex-col gap-2 ${
                      availability.available
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold">
                      {availability.available ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>
                            {isFr
                              ? `Disponible pour ${resGuests} pers. (${availability.remainingSeats} places libres sur ce créneau)`
                              : `Available for ${resGuests} guests (${availability.remainingSeats} seats left in this slot)`}
                          </span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>{availability.reason}</span>
                        </>
                      )}
                    </div>

                    {!availability.available &&
                      availability.suggestedTimes &&
                      availability.suggestedTimes.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[11px] font-medium">
                            {isFr ? 'Créneaux suggérés :' : 'Suggested slots:'}
                          </span>
                          {availability.suggestedTimes.map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setResTime(slot)}
                              className="px-2.5 py-1 bg-white border border-rose-200 hover:border-amber-500 text-slate-900 rounded-lg font-mono font-bold text-[11px] cursor-pointer"
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        {isFr ? 'Votre Nom complet *' : 'Full Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Jean-Claude Mbarga"
                        value={resName}
                        onChange={(e) => setResName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        {isFr ? 'Téléphone / WhatsApp *' : 'Phone / WhatsApp *'}
                      </label>
                      <input
                        type="tel"
                        required
                        value={resPhone}
                        onChange={(e) => setResPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        {isFr ? 'Email (facultatif)' : 'Email (optional)'}
                      </label>
                      <input
                        type="email"
                        placeholder="client@exemple.com"
                        value={resEmail}
                        onChange={(e) => setResEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        {isFr ? 'Demande particulière' : 'Special Notes'}
                      </label>
                      <input
                        type="text"
                        placeholder={isFr ? 'Anniversaire, allergie, table calme...' : 'Birthday, allergy, quiet corner...'}
                        value={resNotes}
                        onChange={(e) => setResNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {resError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-semibold">
                      {resError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!availability.available}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    {isFr ? 'Confirmer ma demande de réservation' : 'Submit Reservation Request'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: INFO, GALLERY & REVIEWS */}
        {activeTab === 'info' && (
          <div className="space-y-8">
            {/* Hours & Coordinates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 text-xs">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span>{isFr ? 'Coordonnées du Restaurant' : 'Restaurant Contact & Location'}</span>
                </h3>
                <div className="space-y-2.5 text-slate-700">
                  <div>
                    <span className="text-slate-400 block">{isFr ? 'Adresse' : 'Address'}</span>
                    <strong className="text-slate-900">
                      {activeOrganization.address || activeOrganization.city}, {activeOrganization.country}
                    </strong>
                  </div>
                  {activeOrganization.phone && (
                    <div>
                      <span className="text-slate-400 block">{isFr ? 'Téléphone' : 'Phone'}</span>
                      <a
                        href={`tel:${activeOrganization.phone}`}
                        className="font-mono font-bold text-amber-700 hover:underline"
                      >
                        {activeOrganization.phone}
                      </a>
                    </div>
                  )}
                  {activeOrganization.email && (
                    <div>
                      <span className="text-slate-400 block">Email</span>
                      <a
                        href={`mailto:${activeOrganization.email}`}
                        className="font-medium text-slate-900 hover:underline"
                      >
                        {activeOrganization.email}
                      </a>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                <div className="pt-2 flex flex-wrap gap-2">
                  {socialLinks?.whatsapp && (
                    <a
                      href={`https://wa.me/${socialLinks.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-semibold flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                  {socialLinks?.facebook && (
                    <a
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl font-semibold flex items-center gap-1.5"
                    >
                      <Facebook className="w-3.5 h-3.5" />
                      <span>Facebook</span>
                    </a>
                  )}
                  {socialLinks?.instagram && (
                    <a
                      href={`https://instagram.com/${socialLinks.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-pink-50 border border-pink-200 text-pink-800 rounded-xl font-semibold flex items-center gap-1.5"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                      <span>Instagram</span>
                    </a>
                  )}
                  {socialLinks?.googleMaps && (
                    <a
                      href={socialLinks.googleMaps}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-slate-100 border border-slate-200 text-slate-800 rounded-xl font-semibold flex items-center gap-1.5"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Google Maps</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 text-xs">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>{isFr ? 'Horaires d’Ouverture' : 'Opening Hours'}</span>
                </h3>
                {hoursList.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {hoursList.map((h) => (
                      <div key={h.day} className="py-2 flex items-center justify-between">
                        <span className="font-semibold text-slate-800">{h.day}</span>
                        {h.isClosed ? (
                          <span className="text-rose-600 font-semibold">
                            {isFr ? 'Fermé' : 'Closed'}
                          </span>
                        ) : (
                          <span className="font-mono text-slate-600">
                            {h.open} – {h.close}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-600">{activeOrganization.openingHours || '11:00 – 23:30'}</p>
                )}
              </div>
            </div>

            {/* Clickable Photo Gallery */}
            {gallery.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Camera className="w-4 h-4 text-amber-600" />
                    <span>{isFr ? 'Galerie Photos' : 'Photo Gallery'}</span>
                  </h3>
                  <span className="text-xs text-slate-400">{gallery.length} photos</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {gallery.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setLightboxIndex(i)}
                      className="h-36 rounded-2xl overflow-hidden border border-slate-200 shadow-2xs group cursor-pointer"
                    >
                      <img
                        src={img}
                        alt={`${activeOrganization.name} photo ${i + 1}`}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const el = e.currentTarget as HTMLImageElement;
                          if (!el.src.includes('restaurant_terrace_bar')) {
                            el.src = '/src/assets/images/restaurant_terrace_bar_1792835866677.jpg';
                          }
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Published Customer Reviews */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    <h3 className="font-bold text-base text-slate-900">
                      {isFr ? 'Avis & Retours des Convives' : 'Guest Reviews'}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isFr
                      ? `Note moyenne : ${averageRating} / 5 (${publishedReviews.length} avis publiés)`
                      : `Average rating: ${averageRating} / 5 (${publishedReviews.length} published reviews)`}
                  </p>
                </div>

                <button
                  onClick={() => setShowReviewModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#0B192C] hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isFr ? 'Laisser un avis' : 'Leave a Review'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {publishedReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-[#0B192C]">{rev.customerName}</span>
                        {rev.isVerifiedOrder && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>{isFr ? 'Commande vérifiée' : 'Verified Order'}</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${
                              s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-slate-700 italic">« {rev.comment} »</p>

                    {rev.reply && (
                      <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200/60 text-[11px] space-y-0.5">
                        <span className="font-semibold text-amber-900">
                          {isFr ? 'Réponse du restaurant :' : 'Restaurant reply:'}
                        </span>
                        <p className="text-slate-600">{rev.reply.text}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SECURE PRIVATE CLIENT TRACKING (NEVER EXPOSES OTHER GUESTS' DATA) */}
        {activeTab === 'tracking' && (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Reference + Phone Private Verification Lookup */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>
                    {isFr ? 'Suivre ma commande ou ma réservation' : 'Track My Order or Reservation'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {isFr
                    ? 'Seules les commandes et réservations passées depuis votre session ou vérifiées par code + téléphone sont affichées.'
                    : 'Only orders and bookings placed in your session or verified with reference + phone number are displayed.'}
                </p>
              </div>

              <form onSubmit={handlePrivateLookup} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <input
                  type="text"
                  placeholder={isFr ? 'N° (ex: CMD-4821 ou RES-1092)' : 'Ref (e.g. CMD-4821 or RES-1092)'}
                  value={lookupRef}
                  onChange={(e) => setLookupRef(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-xl font-mono focus:outline-hidden focus:border-amber-500"
                />
                <input
                  type="tel"
                  placeholder={isFr ? 'Votre téléphone (ex: +237 6...)' : 'Your phone number'}
                  value={lookupPhone}
                  onChange={(e) => setLookupPhone(e.target.value)}
                  className="px-3 py-2 border border-slate-200 rounded-xl font-mono focus:outline-hidden focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="py-2 px-4 bg-[#0B192C] hover:bg-slate-800 text-white font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {isFr ? 'Vérifier & Afficher' : 'Verify & Show'}
                </button>
              </form>

              {lookupError && (
                <div className="text-xs text-rose-600 font-semibold">{lookupError}</div>
              )}
            </div>

            {/* Client's Session Orders */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {isFr ? 'Mes commandes' : 'My Orders'} ({clientOrders.length})
              </h4>

              {clientOrders.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500">
                  {isFr
                    ? 'Aucune commande enregistrée dans cette session.'
                    : 'No orders recorded in this session.'}
                </div>
              ) : (
                clientOrders.map((ord) => {
                  const badge = getOrderStatusBadge(ord.status, language);
                  const stepOrder = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed'];
                  const currentStepIdx = stepOrder.indexOf(ord.status);

                  return (
                    <div
                      key={ord.id}
                      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3 text-xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <span className="font-mono font-bold text-sm text-slate-900">
                            {ord.orderNumber}
                          </span>
                          <span className="ml-2 text-slate-500">
                            {ord.type === 'dine_in'
                              ? ord.tableName || (isFr ? 'Sur place' : 'Dine-in')
                              : ord.type === 'takeaway'
                              ? isFr
                                ? 'À emporter'
                                : 'Takeaway'
                              : isFr
                              ? 'Livraison'
                              : 'Delivery'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-md font-bold ${badge.bg} ${badge.text}`}>
                            {badge.label}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md font-semibold ${
                              ord.paymentStatus === 'paid'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-800'
                            }`}
                          >
                            {ord.paymentStatus === 'paid'
                              ? isFr
                                ? 'Payé'
                                : 'Paid'
                              : isFr
                              ? 'À régler au restaurant'
                              : 'Pay on site'}
                          </span>
                        </div>
                      </div>

                      {/* Progress timeline */}
                      {ord.status !== 'cancelled' && (
                        <div className="grid grid-cols-4 gap-1.5 text-[10px] text-center">
                          {[
                            { label: isFr ? 'Reçue' : 'Received', minIdx: 0 },
                            { label: isFr ? 'En préparation' : 'Preparing', minIdx: 2 },
                            {
                              label:
                                ord.type === 'delivery'
                                  ? isFr
                                    ? 'Prête / En route'
                                    : 'Ready / Out'
                                  : isFr
                                  ? 'Prête'
                                  : 'Ready',
                              minIdx: 3,
                            },
                            { label: isFr ? 'Servie / Livrée' : 'Delivered', minIdx: 4 },
                          ].map((st) => {
                            const reached = currentStepIdx >= st.minIdx;
                            return (
                              <div
                                key={st.label}
                                className={`py-1.5 px-1 rounded-lg font-semibold ${
                                  reached
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                {st.label}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="space-y-1 text-slate-600">
                        {ord.items.map((it) => (
                          <div key={it.id} className="flex justify-between">
                            <span>
                              {it.quantity}x {it.name}
                            </span>
                            <span className="font-mono">
                              {formatCurrency(it.totalPrice, activeOrganization.currency)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-100 font-bold text-slate-900">
                        <span className="text-[11px] font-normal text-slate-400">
                          {formatTime(ord.createdAt)}
                        </span>
                        <span className="font-mono text-amber-800">
                          Total : {formatCurrency(ord.totalAmount, activeOrganization.currency)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Client's Session Reservations */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {isFr ? 'Mes réservations' : 'My Reservations'} ({clientReservations.length})
              </h4>

              {clientReservations.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500">
                  {isFr
                    ? 'Aucune réservation enregistrée dans cette session.'
                    : 'No reservations recorded in this session.'}
                </div>
              ) : (
                clientReservations.map((res) => (
                  <div
                    key={res.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900">
                        {res.reservationCode || res.id} · {res.date} {isFr ? 'à' : 'at'} {res.time}
                      </div>
                      <div className="text-slate-500 mt-0.5">
                        {res.guestCount} {isFr ? 'personne(s)' : 'guest(s)'} · {res.area}
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg font-bold capitalize ${
                        res.status === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : res.status === 'pending'
                          ? 'bg-amber-50 text-amber-700'
                          : res.status === 'seated'
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {res.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar on Mobile */}
      {cartItemCount > 0 && !showCartDrawer && activeTab === 'menu' && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-30">
          <button
            onClick={() => setShowCartDrawer(true)}
            className="w-full py-3.5 px-5 bg-[#0B192C] hover:bg-slate-800 text-white font-bold text-xs rounded-2xl flex items-center justify-between shadow-xl border border-amber-500/40 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center font-mono font-bold">
                {cartItemCount}
              </span>
              <span>{isFr ? 'Finaliser ma commande' : 'View Cart & Checkout'}</span>
            </div>
            <span className="font-mono text-sm text-amber-400">
              {formatCurrency(cartTotal, activeOrganization.currency)}
            </span>
          </button>
        </div>
      )}

      {/* Discrete Publisher Footer (DATA WORK AGENCY separated cleanly from restaurant info) */}
      <footer className="mt-12 px-4 text-center text-xs text-slate-400 space-y-1">
        <div>
          {activeOrganization.name} · {activeOrganization.city}, {activeOrganization.country}
        </div>
        <div>
          RestaurantOS — Une solution développée par{' '}
          <strong className="text-slate-600">DATA WORK AGENCY</strong> (+237 690 37 04 54 · dataworkagency0@gmail.com)
        </div>
      </footer>

      {/* MODAL: Dish Options / Variants / Extras */}
      {optionProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 p-6 max-h-[85vh] overflow-y-auto space-y-4 text-xs">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  {isFr ? optionProduct.nameFr || optionProduct.name : optionProduct.name}
                </h3>
                <div className="font-mono font-bold text-amber-700 mt-0.5">
                  {formatCurrency(optionProduct.price, activeOrganization.currency)}
                </div>
              </div>
              <button
                onClick={() => setOptionProduct(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {optionProduct.variants && optionProduct.variants.length > 0 && (
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  {isFr ? 'Format / Variante' : 'Variant / Size'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {optionProduct.variants.map((v) => (
                    <button
                      type="button"
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                        selectedVariant?.id === v.id
                          ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div>{isFr ? v.nameFr || v.name : v.name}</div>
                      <div className="font-mono text-[11px] text-slate-500">
                        {v.priceDelta > 0
                          ? `+${formatCurrency(v.priceDelta, activeOrganization.currency)}`
                          : isFr
                          ? 'Inclus'
                          : 'Included'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {optionProduct.extras && optionProduct.extras.length > 0 && (
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  {isFr ? 'Suppléments' : 'Extras'}
                </label>
                <div className="space-y-1.5">
                  {optionProduct.extras.map((ex) => {
                    const active = selectedExtras.some((s) => s.id === ex.id);
                    return (
                      <button
                        type="button"
                        key={ex.id}
                        onClick={() =>
                          setSelectedExtras(
                            active
                              ? selectedExtras.filter((s) => s.id !== ex.id)
                              : [...selectedExtras, ex]
                          )
                        }
                        className={`w-full p-2.5 rounded-xl border flex justify-between items-center cursor-pointer ${
                          active
                            ? 'border-amber-500 bg-amber-50 text-amber-950 font-bold'
                            : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{isFr ? ex.nameFr || ex.name : ex.name}</span>
                        <span className="font-mono">
                          +{formatCurrency(ex.price, activeOrganization.currency)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {isFr ? 'Consigne cuisine (facultatif)' : 'Preparation note (optional)'}
              </label>
              <input
                type="text"
                placeholder={isFr ? 'Ex: Bien cuit, sauce à part...' : 'E.g. Well done, sauce on side...'}
                value={itemNote}
                onChange={(e) => setItemNote(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <button
              type="button"
              onClick={() => addItemToCart(optionProduct, selectedVariant, selectedExtras, itemNote)}
              className="w-full py-3 bg-[#0B192C] hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer"
            >
              {isFr ? 'Ajouter au panier' : 'Add to Cart'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL: QR Code (Public Restaurant + Per-Table QR Generator) */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full border border-slate-200 overflow-hidden text-center animate-in fade-in">
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-800">
                  {isFr ? 'QR Code Public du Restaurant' : 'Public Restaurant QR Code'}
                </span>
                <button
                  onClick={() => setShowQrModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {scopedTables.length > 0 && (
                <div className="text-left text-xs space-y-1">
                  <label className="font-semibold text-slate-700">
                    {isFr ? 'Cible du QR Code :' : 'QR Code Target:'}
                  </label>
                  <select
                    value={qrModalTableNum}
                    onChange={(e) => setQrModalTableNum(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="">
                      {isFr ? 'Page publique générale du restaurant' : 'General restaurant page'}
                    </option>
                    {scopedTables.map((tb) => (
                      <option key={tb.id} value={tb.number}>
                        {tb.name} (Table {tb.number} · {tb.capacity} pers.)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="p-4 bg-white border border-slate-200 rounded-2xl flex justify-center">
                <QRCodeSVG
                  id="public-storefront-qr-svg"
                  value={qrTargetUrl}
                  size={192}
                  level="M"
                  includeMargin
                  bgColor="#FFFFFF"
                  fgColor="#0B192C"
                />
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-[#0B192C] text-sm">
                  {activeOrganization.name}
                  {qrModalTableNum ? ` · Table ${qrModalTableNum}` : ''}
                </h4>
                <p className="text-[11px] font-mono text-slate-500 break-all">{qrTargetUrl}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(qrTargetUrl);
                    setCopiedQrLink(true);
                    setTimeout(() => setCopiedQrLink(false), 2000);
                  }}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                >
                  {copiedQrLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedQrLink ? 'OK' : isFr ? 'Copier' : 'Copy'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadQrPng}
                  className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PNG</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="py-2.5 bg-[#0B192C] hover:bg-slate-800 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isFr ? 'Imprimer' : 'Print'}</span>
                </button>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500">
              RestaurantOS — Propulsé par DATA WORK AGENCY
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Photo Gallery Lightbox */}
      {lightboxIndex !== null && gallery[lightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          {gallery.length > 1 && (
            <button
              onClick={() => setLightboxIndex((lightboxIndex - 1 + gallery.length) % gallery.length)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white mr-2 cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <img
            src={gallery[lightboxIndex]}
            alt={activeOrganization.name}
            referrerPolicy="no-referrer"
            onError={(e) => {
              const el = e.currentTarget as HTMLImageElement;
              if (!el.src.includes('restaurant_terrace_bar')) {
                el.src = '/src/assets/images/restaurant_terrace_bar_1792835866677.jpg';
              }
            }}
            className="max-h-[82vh] max-w-[85vw] rounded-2xl object-contain shadow-2xl"
          />
          {gallery.length > 1 && (
            <button
              onClick={() => setLightboxIndex((lightboxIndex + 1) % gallery.length)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white ml-2 cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>
      )}

      {/* MODAL: Laisser un avis client */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitReview}
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4 animate-in fade-in text-xs max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {isFr ? 'Donner votre avis' : 'Leave a Review'}
                </h3>
                <p className="text-slate-500 text-[11px]">{activeOrganization.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reviewSubmitted ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <div className="font-bold">{isFr ? 'Merci pour votre avis !' : 'Thank you!'}</div>
                <p className="text-[11px]">
                  {isFr
                    ? 'Votre retour a été enregistré et publié sur la page.'
                    : 'Your review has been saved and published.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">{isFr ? 'Votre Nom' : 'Your Name'}</label>
                  <input
                    type="text"
                    required
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    placeholder="Ex : Patrick N."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">{isFr ? 'Votre Note' : 'Rating'}</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="font-bold text-slate-700 ml-2">{reviewRating} / 5</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">
                    {isFr ? 'Numéro de commande (facultatif)' : 'Order number (optional)'}
                  </label>
                  <input
                    type="text"
                    value={reviewOrderNum}
                    onChange={(e) => setReviewOrderNum(e.target.value)}
                    placeholder="Ex : CMD-2398"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">
                    {isFr ? 'Votre Commentaire' : 'Comment'}
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder={isFr ? 'Partagez votre expérience...' : 'Share your experience...'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold cursor-pointer"
                  >
                    {isFr ? 'Annuler' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0B192C] hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    {isFr ? 'Publier' : 'Submit'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Cart & Checkout Drawer */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto text-xs">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-base text-slate-900">
                    {isFr ? 'Ma Commande' : 'My Order'}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowCartDrawer(false);
                    setJustSubmittedOrderId(null);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {justSubmittedOrder ? (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2.5 text-emerald-800 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>
                      {isFr ? 'Commande enregistrée !' : 'Order Submitted!'}
                    </span>
                  </div>
                  <p className="text-slate-700">
                    {isFr ? 'Numéro de suivi :' : 'Tracking number:'}{' '}
                    <strong className="font-mono text-slate-950">{justSubmittedOrder.orderNumber}</strong>
                  </p>
                  <p className="text-slate-600">
                    {isFr
                      ? 'Statut : En attente de prise en charge. Règlement prévu sur place / à réception (aucun débit en ligne effectué).'
                      : 'Status: Pending restaurant confirmation. Payment scheduled on site / upon delivery (no online charge was made).'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCartDrawer(false);
                      setJustSubmittedOrderId(null);
                      setActiveTab('tracking');
                    }}
                    className="w-full py-2.5 bg-[#0B192C] text-white font-bold rounded-xl cursor-pointer"
                  >
                    {isFr ? 'Suivre ma commande en direct' : 'Track Order Live'}
                  </button>
                </div>
              ) : cart.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <ShoppingBag className="w-10 h-10 mx-auto text-slate-300" />
                  <p>{isFr ? 'Votre panier est vide.' : 'Your cart is empty.'}</p>
                </div>
              ) : (
                <>
                  {/* Items in cart */}
                  <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="py-2.5 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">{item.name}</div>
                          {item.selectedVariant && (
                            <div className="text-[11px] text-amber-700">{item.selectedVariant}</div>
                          )}
                          {item.selectedExtras && item.selectedExtras.length > 0 && (
                            <div className="text-[10px] text-slate-400">
                              + {item.selectedExtras.join(', ')}
                            </div>
                          )}
                          {item.notes && (
                            <div className="text-[10px] text-slate-500 italic">Note: {item.notes}</div>
                          )}
                          <div className="text-slate-500 font-mono text-[11px]">
                            {formatCurrency(item.unitPrice, activeOrganization.currency)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => updateCartItemQty(item.id, -1)}
                            className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono font-bold w-5 text-center">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateCartItemQty(item.id, 1)}
                            className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Checkout Form */}
                  <form id="public-checkout-form" onSubmit={handleSendOrder} className="space-y-3 pt-3 border-t border-slate-100">
                    {/* Consumption Mode */}
                    <div>
                      <label className="font-bold text-slate-700 block mb-1.5">
                        {isFr ? 'Mode de consommation' : 'Order Mode'}
                      </label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {canDineIn && (
                          <button
                            type="button"
                            onClick={() => setOrderType('dine_in')}
                            className={`p-2 rounded-xl border font-semibold flex flex-col items-center gap-1 cursor-pointer ${
                              orderType === 'dine_in'
                                ? 'border-amber-500 bg-amber-50 text-amber-950'
                                : 'border-slate-200 text-slate-600'
                            }`}
                          >
                            <UtensilsCrossed className="w-3.5 h-3.5" />
                            <span>{isFr ? 'Sur place' : 'Dine-in'}</span>
                          </button>
                        )}
                        {canOnline && (
                          <>
                            <button
                              type="button"
                              onClick={() => setOrderType('takeaway')}
                              className={`p-2 rounded-xl border font-semibold flex flex-col items-center gap-1 cursor-pointer ${
                                orderType === 'takeaway'
                                  ? 'border-amber-500 bg-amber-50 text-amber-950'
                                  : 'border-slate-200 text-slate-600'
                              }`}
                            >
                              <PackageCheck className="w-3.5 h-3.5" />
                              <span>{isFr ? 'À emporter' : 'Takeaway'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setOrderType('delivery')}
                              className={`p-2 rounded-xl border font-semibold flex flex-col items-center gap-1 cursor-pointer ${
                                orderType === 'delivery'
                                  ? 'border-amber-500 bg-amber-50 text-amber-950'
                                  : 'border-slate-200 text-slate-600'
                              }`}
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>{isFr ? 'Livraison' : 'Delivery'}</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Table picker when Dine-in */}
                    {orderType === 'dine_in' && scopedTables.length > 0 && (
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">
                          {isFr ? 'Numéro de table' : 'Table Number'}
                        </label>
                        <select
                          value={selectedTableNumber}
                          onChange={(e) => setSelectedTableNumber(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                        >
                          {scopedTables.map((tb) => (
                            <option key={tb.id} value={tb.number}>
                              {tb.name} (Table {tb.number})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">
                          {isFr ? 'Votre Nom *' : 'Your Name *'}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Marie K."
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">
                          {isFr
                            ? orderType === 'dine_in'
                              ? 'Téléphone'
                              : 'Téléphone *'
                            : orderType === 'dine_in'
                            ? 'Phone'
                            : 'Phone *'}
                        </label>
                        <input
                          type="tel"
                          required={orderType !== 'dine_in'}
                          placeholder="+237 6..."
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                        />
                      </div>
                    </div>

                    {orderType === 'delivery' && (
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">
                          {isFr ? 'Adresse de livraison *' : 'Delivery Address *'}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder={isFr ? 'Quartier, rue, repère...' : 'District, street, landmark...'}
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                        />
                      </div>
                    )}

                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        {isFr ? 'Instructions (facultatif)' : 'Order notes (optional)'}
                      </label>
                      <input
                        type="text"
                        placeholder={isFr ? 'Allergies, piment à part...' : 'Allergies, extra instructions...'}
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                      />
                    </div>

                    {/* Honest Payment Transparency Section (Étape 6 - Zero fake online payment) */}
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">
                          {isFr ? 'Mode de règlement prévu' : 'Planned Payment Method'}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            gatewayStatus?.configured
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {gatewayStatus?.configured
                            ? isFr
                              ? 'Passerelle active'
                              : 'Gateway active'
                            : isFr
                            ? 'Paiement à réception / sur place'
                            : 'Pay on site / delivery'}
                        </span>
                      </div>

                      {!gatewayStatus?.configured && (
                        <p className="text-[11px] text-slate-500 leading-snug">
                          {isFr
                            ? 'Le paiement en ligne direct est en attente de configuration marchand par le restaurant. Réglez sur place ou à la livraison :'
                            : 'Direct online pre-payment awaits merchant gateway credentials. Pay on site or upon delivery:'}
                        </p>
                      )}

                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPreferredSettlement('cash')}
                          className={`p-2 rounded-xl border text-[11px] font-semibold flex flex-col items-center gap-1 cursor-pointer ${
                            preferredSettlement === 'cash'
                              ? 'border-amber-500 bg-white text-slate-900'
                              : 'border-slate-200 text-slate-500'
                          }`}
                        >
                          <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{isFr ? 'Espèces' : 'Cash'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreferredSettlement('mobile_money')}
                          className={`p-2 rounded-xl border text-[11px] font-semibold flex flex-col items-center gap-1 cursor-pointer ${
                            preferredSettlement === 'mobile_money'
                              ? 'border-amber-500 bg-white text-slate-900'
                              : 'border-slate-200 text-slate-500'
                          }`}
                        >
                          <Smartphone className="w-3.5 h-3.5 text-amber-600" />
                          <span>OM / MoMo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreferredSettlement('card')}
                          className={`p-2 rounded-xl border text-[11px] font-semibold flex flex-col items-center gap-1 cursor-pointer ${
                            preferredSettlement === 'card'
                              ? 'border-amber-500 bg-white text-slate-900'
                              : 'border-slate-200 text-slate-500'
                          }`}
                        >
                          <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                          <span>{isFr ? 'Carte TPE' : 'POS Card'}</span>
                        </button>
                      </div>
                    </div>

                    {orderError && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-semibold">
                        {orderError}
                      </div>
                    )}
                  </form>
                </>
              )}
            </div>

            {cart.length > 0 && !justSubmittedOrder && (
              <div className="pt-4 border-t border-slate-200 space-y-2.5 mt-4">
                <div className="space-y-1 text-slate-600">
                  <div className="flex justify-between">
                    <span>{isFr ? 'Sous-total' : 'Subtotal'}</span>
                    <span className="font-mono">
                      {formatCurrency(cartSubtotal, activeOrganization.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>TVA ({activeOrganization.taxRate}%)</span>
                    <span className="font-mono">
                      {formatCurrency(cartTax, activeOrganization.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-base text-slate-900 pt-1 border-t border-slate-100">
                    <span>Total :</span>
                    <span className="font-mono text-amber-800">
                      {formatCurrency(cartTotal, activeOrganization.currency)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  form="public-checkout-form"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  {isFr ? 'Envoyer la commande au restaurant' : 'Confirm & Send Order'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
