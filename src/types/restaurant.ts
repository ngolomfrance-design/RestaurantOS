export type Currency = 'XAF' | 'EUR' | 'USD';
export type Language = 'fr' | 'en';

export type UserRole =
  | 'owner'
  | 'manager'
  | 'cashier'
  | 'server'
  | 'kitchen'
  | 'inventory'
  | 'platform_admin';

export type SubscriptionPlanId = 'starter' | 'business' | 'premium' | 'enterprise';

export interface SubscriptionPlan {
  id: SubscriptionPlanId;
  name: string;
  nameFr: string;
  priceXAF: number;
  period: 'month' | 'year';
  description: string;
  descriptionFr: string;
  features: string[];
  featuresFr: string[];
  maxLocations: number;
  aiIncluded: boolean;
  popular?: boolean;
}

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface SocialLinks {
  whatsapp?: string;
  phone?: string;
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  googleMaps?: string;
  website?: string;
}

export interface OpeningHourDay {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  type: 'gastronomic' | 'fast_food' | 'traditional' | 'cafe_bar' | 'hotel' | 'chain';
  country: string;
  city: string;
  currency: Currency;
  language: Language;
  phone: string;
  email: string;
  address: string;
  subscriptionPlan: SubscriptionPlanId;
  subscriptionStatus: 'trial' | 'active' | 'past_due' | 'expired' | 'cancelled';
  trialStartedAt?: string;
  trialEndsAt: string;
  subscriptionStartedAt?: string;
  subscriptionEndsAt?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'unpaid';
  billingPeriod?: 'monthly' | 'quarterly' | 'annual';
  openingHours?: string;
  businessHoursSchedule?: OpeningHourDay[];
  description?: string;
  coverImage?: string;
  gallery?: string[];
  socialLinks?: SocialLinks;
  taxRate: number; // e.g. 19.25% in Cameroon (TVA) or 0%
  enableOnlineOrdering: boolean;
  enableTableOrdering: boolean;
  enableReservations?: boolean;
  isPublicPublished?: boolean;
  createdAt: string;
  status?: 'active' | 'archived' | 'inactive';
  timezone?: string;
  logo?: string;
  isDemo?: boolean;
  ownerId?: string;
}

export interface BillingTransaction {
  id: string;
  orgId: string;
  restaurantName: string;
  planId: SubscriptionPlanId;
  period: 'monthly' | 'quarterly' | 'annual';
  amount: number;
  currency: Currency;
  paymentMethod: 'orange_money' | 'mtn_momo' | 'card' | 'bank_transfer';
  status: 'pending' | 'confirmed' | 'failed' | 'cancelled';
  transactionReference: string;
  operatorReference?: string;
  payerPhone?: string;
  payerEmail?: string;
  createdAt: string;
  confirmedAt?: string;
  invoiceNumber: string;
}

export interface StaffInvitation {
  id: string;
  orgId: string;
  role: UserRole;
  code: string;
  invitedEmail?: string;
  invitedName?: string;
  expiresAt: string;
  isRevoked: boolean;
  isAccepted: boolean;
  createdAt: string;
  createdBy: string;
}

export interface RestaurantLocation {
  id: string;
  orgId: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  isPrimary: boolean;
  tableCount: number;
}

export interface UserProfile {
  id: string;
  orgId?: string;
  locationId?: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  pinCode?: string;
  organizationIds?: string[];
}

export interface Category {
  id: string;
  orgId: string;
  name: string;
  nameFr: string;
  iconName: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  nameFr: string;
  priceDelta: number;
}

export interface ProductExtra {
  id: string;
  name: string;
  nameFr: string;
  price: number;
}

export interface Product {
  id: string;
  orgId: string;
  categoryId: string;
  name: string;
  nameFr: string;
  description: string;
  descriptionFr: string;
  price: number;
  costPrice: number; // estimated or calculated from recipe
  sku?: string; // internal reference
  image: string;
  isAvailable: boolean;
  prepTimeMinutes: number;
  allergens: string[];
  variants?: ProductVariant[];
  extras?: ProductExtra[];
  popular?: boolean;
}

export type TableStatus =
  | 'available'
  | 'occupied'
  | 'reserved'
  | 'cleaning'
  | 'out_of_service';

export interface Table {
  id: string;
  orgId: string;
  locationId: string;
  number: string;
  name: string;
  capacity: number;
  area: 'main_hall' | 'terrace' | 'vip_lounge' | 'bar';
  status: TableStatus;
  currentOrderId?: string;
  currentGuestName?: string;
  seatedAt?: string;
}

export type OrderType = 'dine_in' | 'takeaway' | 'delivery';
export type OrderStatus =
  | 'draft'
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'served'
  | 'completed'
  | 'cancelled';

export type PaymentMethod = 'cash' | 'card' | 'mobile_money';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  selectedVariant?: string;
  selectedExtras?: string[];
  notes?: string;
  isKitchenReady?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  orgId: string;
  locationId: string;
  tableId?: string;
  tableName?: string;
  type: OrderType;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentProvider?: 'cash' | 'visa_mastercard' | 'orange_money' | 'mtn_momo';
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  source?: 'pos' | 'public_web' | 'qr_table';
  clientTrackingToken?: string;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  createdBy: string;
  prepTimeMinutes?: number;
}

export interface Reservation {
  id: string;
  reservationCode?: string;
  orgId: string;
  locationId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  guestCount: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  tableId?: string;
  tableName?: string;
  area: string;
  status: 'pending' | 'confirmed' | 'seated' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  orgId: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  unit: 'kg' | 'g' | 'L' | 'cL' | 'unit' | 'bouteille';
  minThreshold: number;
  costPerUnit: number; // in restaurant currency
  supplier: string;
  supplierContact?: string;
  lastRestockedAt?: string;
}

export interface StockMovement {
  id: string;
  orgId: string;
  itemId: string;
  itemName: string;
  type: 'purchase' | 'usage' | 'waste' | 'adjustment';
  quantityDelta: number;
  newStock: number;
  reason: string;
  recordedBy: string;
  createdAt: string;
}

export interface RecipeItem {
  inventoryItemId: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  id: string;
  orgId: string;
  productId: string;
  productName: string;
  items: RecipeItem[];
  yieldPortions: number;
  preparationNotes: string;
  calculatedCostPerPortion: number;
}

export interface Customer {
  id: string;
  orgId: string;
  name: string;
  phone: string;
  email?: string;
  totalVisits: number;
  totalSpent: number;
  loyaltyPoints: number;
  notes?: string;
  lastVisitAt: string;
  favoriteDish?: string;
}

export interface AuditLog {
  id: string;
  orgId: string;
  actorName: string;
  action: string;
  details: string;
  createdAt: string;
}

export interface CustomerReview {
  id: string;
  orgId: string;
  orderId?: string;
  orderNumber?: string;
  isVerifiedOrder: boolean;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  rating: number; // 1 to 5
  comment: string;
  status: 'published' | 'hidden' | 'flagged';
  createdAt: string;
  reply?: {
    text: string;
    authorName: string;
    repliedAt: string;
  };
}

export interface InternalStaffNote {
  id: string;
  orgId: string;
  authorName: string;
  authorRole: UserRole;
  title: string;
  content: string;
  urgency: 'low' | 'medium' | 'high';
  createdAt: string;
  pinned?: boolean;
}

export interface StaffShift {
  id: string;
  orgId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  clockIn: string; // ISO datetime
  clockOut?: string; // ISO datetime
  date: string; // YYYY-MM-DD
  totalMinutes?: number;
  status: 'active' | 'completed';
  notes?: string;
}

export interface DailyZReport {
  id: string;
  orgId: string;
  reportDate: string; // YYYY-MM-DD
  openingTime: string;
  closingTime: string;
  closedBy: string;
  grossRevenue: number;
  discountsTotal: number;
  refundsTotal: number;
  netRevenue: number;
  taxTotal: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
  paymentBreakdown: {
    cash: number;
    card: number;
    mobile_money: number;
  };
  categoryBreakdown: {
    categoryId: string;
    categoryName: string;
    revenue: number;
    quantity: number;
  }[];
  hourlyHeatmap: {
    hour: number; // 0-23
    orderCount: number;
    revenue: number;
  }[];
  topDishesByQuantity: {
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }[];
  topDishesByRevenue: {
    productId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }[];
  staffAttendance: {
    staffName: string;
    role: string;
    clockIn: string;
    clockOut?: string;
    durationHours: number;
  }[];
  cashDrawerStarting: number;
  cashDrawerActual: number;
  cashDiscrepancy: number; // actual - (starting + cash sales)
  notes?: string;
  createdAt: string;
}

export type ExpenseCategory =
  | 'inventory_purchase'
  | 'rent'
  | 'utilities'
  | 'payroll'
  | 'marketing'
  | 'equipment'
  | 'other';

export interface ExpenseRecord {
  id: string;
  orgId: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod | 'bank_transfer';
  vendor?: string;
  notes?: string;
  recordedBy: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  orgId?: string;
  restaurantName: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'normal' | 'high';
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformSettings {
  defaultTrialDays: number;
  allowNewRegistrations: boolean;
  maintenanceMode: boolean;
  supportPhone: string;
  supportEmail: string;
  supportInstagram: string;
  merchantInstructions: string;
}


