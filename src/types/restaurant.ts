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
  description?: string;
  coverImage?: string;
  taxRate: number; // e.g. 19.25% in Cameroon (TVA) or 0%
  enableOnlineOrdering: boolean;
  enableTableOrdering: boolean;
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
