import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  DatabaseState,
  loadDatabaseState,
  saveDatabaseState,
  INITIAL_ORGANIZATION,
  INITIAL_ORGANIZATIONS,
  INITIAL_LOCATIONS,
  INITIAL_PROFILES,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_TABLES,
  INITIAL_ORDERS,
  INITIAL_INVENTORY,
  INITIAL_RECIPES,
  INITIAL_RESERVATIONS,
  INITIAL_CUSTOMERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SUBSCRIPTION_PLANS,
  INITIAL_BILLING_TRANSACTIONS,
  INITIAL_STAFF_INVITATIONS,
  INITIAL_REVIEWS,
  INITIAL_INTERNAL_NOTES,
  INITIAL_STAFF_SHIFTS,
  INITIAL_DAILY_Z_REPORTS,
  INITIAL_EXPENSES,
  INITIAL_SUPPORT_TICKETS,
  INITIAL_PLATFORM_SETTINGS,
  STORAGE_KEY,
} from '../data/mockDatabase';
import {
  Language,
  UserRole,
  OrderStatus,
  PaymentMethod,
  TableStatus,
  Order,
  Product,
  Reservation,
  Organization,
  RestaurantLocation,
  Category,
  Table,
  InventoryItem,
  Recipe,
  Customer,
  AuditLog,
  StaffInvitation,
  SubscriptionPlanId,
  SubscriptionPlan,
  ThemeMode,
  CustomerReview,
  InternalStaffNote,
  StaffShift,
  DailyZReport,
  BillingTransaction,
  ExpenseRecord,
  SupportTicket,
  PlatformSettings,
} from '../types/restaurant';

export type AppView =
  | 'marketing'
  | 'login'
  | 'register'
  | 'onboarding'
  | 'restaurants'
  | 'profile'
  | 'user_profile'
  | 'subscription'
  | 'public_menu'
  | 'dashboard'
  | 'pos'
  | 'orders'
  | 'menu'
  | 'tables'
  | 'kitchen'
  | 'reservations'
  | 'inventory'
  | 'recipes'
  | 'customers'
  | 'staff'
  | 'reports'
  | 'reviews'
  | 'ai'
  | 'settings'
  | 'superadmin'
  | 'database_schema'
  | 'qr_ordering';

export function getPathForView(view: AppView): string {
  switch (view) {
    case 'marketing':
      return '/';
    case 'login':
      return '/login';
    case 'register':
      return '/register';
    case 'onboarding':
      return '/onboarding';
    case 'restaurants':
      return '/app/restaurants';
    case 'profile':
      return '/app/profile';
    case 'user_profile':
      return '/app/user-profile';
    case 'subscription':
      return '/app/subscription';
    case 'public_menu':
      return '/public-menu';
    case 'settings':
      return '/app/settings';
    case 'pos':
      return '/app/pos';
    case 'orders':
      return '/app/orders';
    case 'menu':
      return '/app/menu';
    case 'tables':
      return '/app/tables';
    case 'kitchen':
      return '/app/kitchen';
    case 'reservations':
      return '/app/reservations';
    case 'inventory':
      return '/app/inventory';
    case 'recipes':
      return '/app/recipes';
    case 'customers':
      return '/app/customers';
    case 'staff':
      return '/app/staff';
    case 'reports':
      return '/app/reports';
    case 'reviews':
      return '/app/reviews';
    case 'ai':
      return '/app/ai';
    case 'superadmin':
      return '/app/superadmin';
    case 'database_schema':
      return '/app/database_schema';
    case 'qr_ordering':
      return '/qr_ordering';
    case 'dashboard':
    default:
      return '/app/dashboard';
  }
}

export function getViewFromPath(path: string): AppView {
  if (!path || path === '/' || path === '') return 'marketing';
  if (path === '/login') return 'login';
  if (path === '/register') return 'register';
  if (path === '/onboarding') return 'onboarding';
  if (path === '/app/restaurants') return 'restaurants';
  if (path === '/app/profile') return 'profile';
  if (path === '/app/user-profile') return 'user_profile';
  if (path === '/app/subscription' || path === '/subscription') return 'subscription';
  if (path === '/public-menu' || path.startsWith('/public-menu') || path.startsWith('/menu/')) return 'public_menu';
  if (path === '/app/settings') return 'settings';
  if (path === '/app/pos') return 'pos';
  if (path === '/app/orders') return 'orders';
  if (path === '/app/menu') return 'menu';
  if (path === '/app/tables') return 'tables';
  if (path === '/app/kitchen') return 'kitchen';
  if (path === '/app/reservations') return 'reservations';
  if (path === '/app/inventory') return 'inventory';
  if (path === '/app/recipes') return 'recipes';
  if (path === '/app/customers') return 'customers';
  if (path === '/app/staff') return 'staff';
  if (path === '/app/reports') return 'reports';
  if (path === '/app/reviews' || path === '/reviews') return 'reviews';
  if (path === '/app/ai') return 'ai';
  if (path === '/app/superadmin') return 'superadmin';
  if (path === '/app/database_schema') return 'database_schema';
  if (path === '/qr_ordering') return 'qr_ordering';
  if (path.startsWith('/app')) return 'dashboard';
  return 'marketing';
}

interface RestaurantContextType {
  state: DatabaseState;
  language: Language;
  setLanguage: (lang: Language) => void;
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  navigateTo: (view: AppView) => void;
  activeLocation: RestaurantLocation;
  setActiveLocationId: (id: string) => void;
  currentUser: DatabaseState['currentUser'];
  switchUserRole: (role: UserRole) => void;

  // Theme System (Triple: light / dark / auto)
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  effectiveTheme: 'light' | 'dark';

  // Multi-Restaurant
  activeOrganization: Organization;
  userOrganizations: Organization[];
  switchOrganization: (orgId: string) => void;
  createOrganization: (orgData: Partial<Organization>, locationData?: Partial<RestaurantLocation>) => Organization;
  updateOrganization: (orgId: string, updates: Partial<Organization>) => void;
  archiveOrganization: (orgId: string) => void;
  deleteOrganization: (orgId: string) => boolean;

  // Authentication
  isAuthenticated: boolean;
  login: (email: string, password?: string) => { success: boolean; message?: string };
  loginDemo: () => void;
  register: (name: string, email: string, password?: string) => { success: boolean; message?: string };
  logout: () => void;

  // Scoped Data (Strict isolation by active restaurant)
  scopedProducts: Product[];
  scopedOrders: Order[];
  scopedTables: Table[];
  scopedInventory: InventoryItem[];
  scopedCategories: Category[];
  scopedRecipes: Recipe[];
  scopedReservations: Reservation[];
  scopedCustomers: Customer[];
  scopedAuditLogs: AuditLog[];
  scopedLocations: RestaurantLocation[];
  scopedReviews: CustomerReview[];
  scopedInternalNotes: InternalStaffNote[];
  scopedStaffShifts: StaffShift[];
  scopedDailyZReports: DailyZReport[];
  scopedExpenses: ExpenseRecord[];

  // Plan entitlements & trial gating
  getPlanEntitlements: (org?: Organization) => {
    plan: SubscriptionPlan;
    isExpired: boolean;
    maxLocations: number;
    aiIncluded: boolean;
    currentLocationsCount: number;
    canAddLocation: boolean;
    canUseAI: boolean;
  };

  // Finances / Expenses
  addExpense: (expense: Omit<ExpenseRecord, 'id' | 'orgId' | 'createdAt' | 'recordedBy'>) => ExpenseRecord;
  deleteExpense: (expenseId: string) => void;

  // Profile & Vitrine
  updateOrganizationProfile: (updates: Partial<Organization>) => void;
  addGalleryImage: (imageUrl: string) => void;
  removeGalleryImage: (index: number) => void;
  reorderGalleryImages: (fromIndex: number, toIndex: number) => void;

  // Customer Reviews
  addCustomerReview: (review: Omit<CustomerReview, 'id' | 'createdAt' | 'status'>) => CustomerReview;
  updateReviewStatus: (reviewId: string, status: CustomerReview['status']) => void;
  replyToReview: (reviewId: string, replyText: string) => void;

  // Internal Staff Notes
  addInternalNote: (title: string, content: string, urgency?: 'low' | 'medium' | 'high') => void;
  togglePinNote: (noteId: string) => void;
  deleteInternalNote: (noteId: string) => void;

  // Staff Attendance / Clock-in
  clockInStaff: (userName: string, userRole: UserRole, notes?: string) => StaffShift;
  clockOutStaff: (shiftId: string, notes?: string) => void;

  // Daily Activity & Z-Report
  generateZReportData: (date?: string) => Omit<DailyZReport, 'id' | 'createdAt'>;
  performDailyClosing: (closingData: {
    cashDrawerStarting: number;
    cashDrawerActual: number;
    notes?: string;
    openingTime?: string;
    closingTime?: string;
  }) => DailyZReport;

  // Public Storefront & Preview Isolation
  publicPreviewMode: boolean;
  publicTableParam: string | null;
  publicUrlInvalidSlug: string | null;
  openPublicStorefront: (asClientPreview?: boolean, tableNumber?: string) => void;
  exitPublicPreview: () => void;
  checkReservationAvailability: (
    orgId: string,
    date: string,
    time: string,
    guestCount: number,
    area?: string
  ) => { available: boolean; reason?: string; remainingSeats: number; suggestedTimes?: string[] };

  // Business logic actions
  createOrder: (orderData: Partial<Order>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  recordOrderPayment: (orderId: string, method: PaymentMethod, provider?: any) => void;
  updateTableStatus: (tableId: string, status: TableStatus, currentOrderId?: string, guestName?: string) => void;
  transferTableOrder: (fromTableId: string, toTableId: string) => boolean;
  addInventoryMovement: (itemId: string, type: 'purchase' | 'usage' | 'waste' | 'adjustment', quantity: number, reason: string) => void;
  createReservation: (
    res: Omit<Reservation, 'id' | 'createdAt' | 'orgId' | 'locationId'>,
    targetOrgId?: string
  ) => Reservation;
  updateReservationStatus: (id: string, status: Reservation['status']) => void;
  createProduct: (product: Omit<Product, 'id' | 'orgId'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleProductAvailability: (id: string) => void;
  createCategory: (name: string) => Category;
  createInventoryItem: (item: Omit<InventoryItem, 'id' | 'orgId'>) => InventoryItem;
  updateCurrentUser: (updates: Partial<DatabaseState['currentUser']>) => void;
  recordBillingTransaction: (tx: BillingTransaction) => void;
  updateOrganizationSettings: (updates: Partial<Organization>) => void;
  completeOnboarding: (orgData: Partial<Organization>, locationData: Partial<RestaurantLocation>) => void;
  resetToDemo: () => void;
  addAuditLog: (action: string, details: string) => void;

  // Staff Invitations
  createStaffInvitation: (role: UserRole, invitedName?: string, invitedEmail?: string) => StaffInvitation;
  revokeStaffInvitation: (invitationId: string) => void;
  acceptStaffInvitation: (code: string) => { success: boolean; message: string; organization?: Organization };

  // Support Tickets
  submitSupportTicket: (
    ticket: Omit<SupportTicket, 'id' | 'status' | 'createdAt' | 'updatedAt'>
  ) => SupportTicket;
  updateSupportTicketStatus: (
    ticketId: string,
    status: SupportTicket['status'],
    adminNote?: string
  ) => void;

  // SuperAdmin Platform Operations
  updateSubscriptionPlanPrice: (planId: SubscriptionPlanId, newPriceXAF: number) => void;
  updateSubscriptionPlan: (planId: SubscriptionPlanId, updates: Partial<SubscriptionPlan>) => void;
  approveBillingTransaction: (txId: string) => void;
  rejectBillingTransaction: (txId: string, reason?: string) => void;
  updateUserRole: (userId: string, role: UserRole) => void;
  updatePlatformSettings: (updates: Partial<PlatformSettings>) => void;
  toggleRestaurantStatus: (orgId: string) => void;
  extendTrialDays: (orgId: string, days?: number) => void;
  activateSubscriptionManually: (orgId: string, planId?: SubscriptionPlanId, durationMonths?: number) => void;
  populateStarterMenu: (orgId: string) => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DatabaseState>(() => loadDatabaseState());
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('restaurantos_lang') as Language) || 'fr';
  });

  // Triple Theme system: light, dark, auto
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('restaurantos_theme') as ThemeMode) || 'auto';
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const effectiveTheme: 'light' | 'dark' =
    theme === 'auto' ? (systemPrefersDark ? 'dark' : 'light') : theme;

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (effectiveTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [effectiveTheme]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('restaurantos_theme', newTheme);
    } catch (e) {
      console.error('Could not save theme:', e);
    }
  };

  // Read initial view from URL path & query parameters
  const [activeView, setActiveViewState] = useState<AppView>(() => {
    if (typeof window !== 'undefined') {
      const initialFromUrl = getViewFromPath(window.location.pathname);
      return initialFromUrl;
    }
    return 'marketing';
  });

  const [publicPreviewMode, setPublicPreviewMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('preview') === 'client';
    }
    return false;
  });

  const [publicTableParam, setPublicTableParam] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('table');
    }
    return null;
  });

  const [publicUrlInvalidSlug, setPublicUrlInvalidSlug] = useState<string | null>(null);

  // Save state on any update
  useEffect(() => {
    saveDatabaseState(state);
  }, [state]);

  // Enforce automatic 7-day trial expiration check without altering active paid subscriptions
  useEffect(() => {
    const nowMs = Date.now();
    const hasExpiredTrial = state.organizations.some(
      (org) =>
        org.subscriptionStatus === 'trial' &&
        org.trialEndsAt &&
        new Date(org.trialEndsAt).getTime() <= nowMs
    );

    if (hasExpiredTrial) {
      setState((prev) => {
        const updatedOrgs = prev.organizations.map((org) =>
          org.subscriptionStatus === 'trial' &&
          org.trialEndsAt &&
          new Date(org.trialEndsAt).getTime() <= nowMs
            ? { ...org, subscriptionStatus: 'expired' as const }
            : org
        );
        const currentOrg = updatedOrgs.find((o) => o.id === prev.activeOrgId) || prev.organization;
        return {
          ...prev,
          organizations: updatedOrgs,
          organization: currentOrg,
        };
      });
    }
  }, [state.activeOrgId, state.organizations.length]);

  // Handle browser Back / Forward buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const targetView = getViewFromPath(window.location.pathname);
      const params = new URLSearchParams(window.location.search);
      setPublicTableParam(params.get('table'));
      setPublicPreviewMode(params.get('preview') === 'client' && state.isAuthenticated);
      setActiveViewState(targetView);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [state.isAuthenticated]);

  // Synchronize public menu restaurant if accessed via /menu/:slugOrId
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/menu/')) {
      const slugOrId = decodeURIComponent(
        window.location.pathname.replace('/menu/', '').split('?')[0].split('/')[0]
      )
        .trim()
        .toLowerCase();

      const params = new URLSearchParams(window.location.search);
      const tbl = params.get('table');
      if (tbl !== null && tbl !== publicTableParam) {
        setPublicTableParam(tbl);
      }

      if (slugOrId) {
        const matched = state.organizations.find(
          (o) =>
            o.status !== 'archived' &&
            (o.slug.toLowerCase() === slugOrId || o.id.toLowerCase() === slugOrId)
        );
        if (matched) {
          setPublicUrlInvalidSlug(null);
          if (matched.id !== state.activeOrgId) {
            setState((prev) => ({
              ...prev,
              activeOrgId: matched.id,
              organization: matched,
            }));
          }
        } else {
          setPublicUrlInvalidSlug(slugOrId);
        }
      }
    } else if (publicUrlInvalidSlug) {
      setPublicUrlInvalidSlug(null);
    }
  }, [state.organizations, state.activeOrgId, activeView]);

  // Enforce access control rules on view changes
  useEffect(() => {
    const isPublic =
      activeView === 'marketing' ||
      activeView === 'login' ||
      activeView === 'register' ||
      activeView === 'qr_ordering' ||
      activeView === 'public_menu';

    // Rule 2: Unauthenticated user trying to access private route -> redirect to login
    if (!state.isAuthenticated && !isPublic) {
      navigateTo('login');
      return;
    }

    // Rule 4: Authenticated user with no restaurant trying to access dashboard -> redirect to onboarding
    if (state.isAuthenticated && activeView === 'dashboard') {
      const orgs = state.organizations.filter(
        (o) =>
          o.status !== 'archived' &&
          (o.ownerId === state.currentUser.id ||
            state.currentUser.organizationIds?.includes(o.id) ||
            o.isDemo)
      );
      if (orgs.length === 0) {
        navigateTo('onboarding');
      }
    }
  }, [activeView, state.isAuthenticated]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('restaurantos_lang', lang);
  };

  // Navigates and synchronizes browser history URL
  const navigateTo = (view: AppView) => {
    let targetView = view;

    // Check auth protection
    const isPublic =
      view === 'marketing' ||
      view === 'login' ||
      view === 'register' ||
      view === 'qr_ordering' ||
      view === 'public_menu';

    if (!state.isAuthenticated && !isPublic) {
      targetView = 'login';
    }

    setActiveViewState(targetView);

    if (typeof window !== 'undefined') {
      const targetPath = getPathForView(targetView);
      if (targetView !== 'public_menu' && window.location.pathname !== targetPath) {
        window.history.pushState({ view: targetView }, '', targetPath);
      } else if (targetView === 'public_menu' && !window.location.pathname.startsWith('/menu/')) {
        const slug = activeOrganization?.slug || activeOrganization?.id || 'restaurant';
        window.history.pushState({ view: 'public_menu' }, '', `/menu/${slug}`);
      }
    }
  };

  const setActiveView = (view: AppView) => {
    navigateTo(view);
  };

  const openPublicStorefront = (asClientPreview: boolean = true, tableNumber?: string) => {
    const slug = activeOrganization?.slug || activeOrganization?.id || 'restaurant';
    const isPreview = asClientPreview && state.isAuthenticated;
    setPublicPreviewMode(isPreview);
    setPublicTableParam(tableNumber || null);
    setPublicUrlInvalidSlug(null);

    const searchParams = new URLSearchParams();
    if (tableNumber) searchParams.set('table', tableNumber);
    if (isPreview) searchParams.set('preview', 'client');
    const queryStr = searchParams.toString();
    const targetUrl = `/menu/${slug}${queryStr ? `?${queryStr}` : ''}`;

    setActiveViewState('public_menu');
    if (typeof window !== 'undefined') {
      window.history.pushState({ view: 'public_menu' }, '', targetUrl);
    }
  };

  const exitPublicPreview = () => {
    setPublicPreviewMode(false);
    setPublicTableParam(null);
    if (state.isAuthenticated) {
      navigateTo('dashboard');
    } else {
      navigateTo('marketing');
    }
  };

  // Computed: currently active organization
  const activeOrganization: Organization =
    state.organizations.find((o) => o.id === state.activeOrgId) ||
    state.organization ||
    INITIAL_ORGANIZATION;

  // Computed: user's accessible restaurants
  const userOrganizations: Organization[] = state.organizations.filter(
    (o) =>
      o.ownerId === state.currentUser.id ||
      state.currentUser.organizationIds?.includes(o.id) ||
      o.isDemo
  );

  // Scoped Data by active restaurant ID
  const currentOrgId = activeOrganization.id;

  const scopedProducts = state.products.filter((p) => p.orgId === currentOrgId);
  const scopedOrders = state.orders.filter((o) => o.orgId === currentOrgId);
  const scopedTables = state.tables.filter((t) => t.orgId === currentOrgId);
  const scopedInventory = state.inventory.filter((i) => i.orgId === currentOrgId);
  const scopedCategories = state.categories.filter((c) => c.orgId === currentOrgId);
  const scopedRecipes = state.recipes.filter((r) => r.orgId === currentOrgId);
  const scopedReservations = state.reservations.filter((res) => res.orgId === currentOrgId);
  const scopedCustomers = state.customers.filter((c) => c.orgId === currentOrgId);
  const scopedAuditLogs = state.auditLogs.filter((a) => a.orgId === currentOrgId);
  const scopedLocations = state.locations.filter((l) => l.orgId === currentOrgId);
  const scopedReviews = (state.reviews || []).filter((r) => r.orgId === currentOrgId);
  const scopedInternalNotes = (state.internalNotes || []).filter((n) => n.orgId === currentOrgId);
  const scopedStaffShifts = (state.staffShifts || []).filter((s) => s.orgId === currentOrgId);
  const scopedDailyZReports = (state.dailyZReports || []).filter((z) => z.orgId === currentOrgId);
  const scopedExpenses = (state.expenses || []).filter((e) => e.orgId === currentOrgId);

  const getPlanEntitlements = (targetOrg?: Organization) => {
    const org = targetOrg || activeOrganization;
    const plan =
      state.subscriptionPlans.find((p) => p.id === org.subscriptionPlan) ||
      state.subscriptionPlans[0];
    const nowMs = Date.now();
    const trialExpired =
      org.subscriptionStatus === 'expired' ||
      (org.subscriptionStatus === 'trial' &&
        org.trialEndsAt &&
        new Date(org.trialEndsAt).getTime() <= nowMs);
    const activeOrganizationsCount = userOrganizations.filter(
      (o) => o.status !== 'archived'
    ).length;
    const isTrialActive = org.subscriptionStatus === 'trial' && !trialExpired;
    const isPaidActive = org.subscriptionStatus === 'active';
    const maxLocations = plan.maxLocations || 1;
    const aiIncluded = Boolean(plan.aiIncluded);
    const isPlatformAdmin =
      state.currentUser.role === 'platform_admin' ||
      state.currentUser.email === 'dataworkagency0@gmail.com';

    return {
      plan,
      isExpired: Boolean(trialExpired),
      maxLocations,
      aiIncluded,
      currentLocationsCount: activeOrganizationsCount,
      canAddLocation:
        isPlatformAdmin ||
        (!trialExpired && activeOrganizationsCount < maxLocations),
      canUseAI:
        isPlatformAdmin ||
        (!trialExpired && (isTrialActive || (isPaidActive && aiIncluded))),
    };
  };

  const activeLocation =
    scopedLocations.find((l) => l.id === state.activeLocationId) ||
    scopedLocations[0] ||
    state.locations[0] ||
    INITIAL_LOCATIONS[0];

  const setActiveLocationId = (id: string) => {
    setState((prev) => ({ ...prev, activeLocationId: id }));
  };

  // Multi-Restaurant Operations
  const switchOrganization = (orgId: string) => {
    const targetOrg = state.organizations.find((o) => o.id === orgId);
    if (!targetOrg) return;

    const orgLocations = state.locations.filter((l) => l.orgId === orgId);
    const newLocId = orgLocations[0]?.id || state.activeLocationId;

    setState((prev) => ({
      ...prev,
      activeOrgId: orgId,
      organization: targetOrg,
      activeLocationId: newLocId,
      auditLogs: [
        {
          id: `log_${Date.now()}`,
          orgId,
          actorName: prev.currentUser.name,
          action: 'Changement de restaurant actif',
          details: `Établissement basculé sur « ${targetOrg.name} » (${targetOrg.city})`,
          createdAt: new Date().toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));
  };

  const createOrganization = (
    orgData: Partial<Organization>,
    locationData?: Partial<RestaurantLocation>
  ): Organization => {
    const orgId = `org_${Date.now()}`;
    const locId = `loc_${Date.now()}`;

    const trialDays = Math.min(7, Math.max(1, state.platformSettings?.defaultTrialDays || 7));

    const newOrg: Organization = {
      id: orgId,
      name: orgData.name || 'Mon Restaurant',
      slug: (orgData.name || 'restaurant').toLowerCase().replace(/[^a-z0-9]/g, '-'),
      type: orgData.type || 'traditional',
      country: orgData.country || 'Cameroun',
      city: orgData.city || 'Douala',
      currency: orgData.currency || 'XAF',
      language: orgData.language || 'fr',
      phone: orgData.phone || '',
      email: orgData.email || '',
      address: orgData.address || '',
      subscriptionPlan: orgData.subscriptionPlan || 'starter',
      subscriptionStatus: 'trial',
      trialStartedAt: new Date().toISOString(),
      trialEndsAt: new Date(Date.now() + trialDays * 86400000).toISOString(),
      paymentStatus: 'pending',
      billingPeriod: 'monthly',
      taxRate: orgData.currency === 'XAF' ? 19.25 : 0,
      enableOnlineOrdering: true,
      enableTableOrdering: true,
      createdAt: new Date().toISOString(),
      status: 'active',
      timezone: orgData.timezone || 'Africa/Douala',
      logo: orgData.logo,
      ownerId: state.currentUser.id,
      isDemo: false,
    };

    const newLoc: RestaurantLocation = {
      id: locId,
      orgId,
      name: locationData?.name || `${newOrg.name} (Principal)`,
      address: locationData?.address || newOrg.address,
      city: locationData?.city || newOrg.city,
      phone: locationData?.phone || newOrg.phone,
      isPrimary: true,
      tableCount: 12,
    };

    // Initialize clean starter tables for the new restaurant
    const starterTables: Table[] = [
      { id: `tbl_${orgId}_1`, orgId, locationId: locId, number: '1', name: 'Table 1', capacity: 2, area: 'main_hall', status: 'available' },
      { id: `tbl_${orgId}_2`, orgId, locationId: locId, number: '2', name: 'Table 2', capacity: 4, area: 'main_hall', status: 'available' },
      { id: `tbl_${orgId}_3`, orgId, locationId: locId, number: '3', name: 'Table 3', capacity: 4, area: 'main_hall', status: 'available' },
      { id: `tbl_${orgId}_4`, orgId, locationId: locId, number: '4', name: 'Table 4', capacity: 6, area: 'main_hall', status: 'available' },
      { id: `tbl_${orgId}_5`, orgId, locationId: locId, number: '5', name: 'Terrasse 1', capacity: 2, area: 'terrace', status: 'available' },
      { id: `tbl_${orgId}_6`, orgId, locationId: locId, number: '6', name: 'Terrasse 2', capacity: 4, area: 'terrace', status: 'available' },
    ];

    // Initialize clean starter categories
    const starterCategories: Category[] = [
      { id: `cat_${orgId}_1`, orgId, name: 'Plats Principaux', nameFr: 'Plats Principaux', iconName: 'UtensilsCrossed', sortOrder: 1, isActive: true },
      { id: `cat_${orgId}_2`, orgId, name: 'Boissons & Cocktails', nameFr: 'Boissons & Cocktails', iconName: 'Coffee', sortOrder: 2, isActive: true },
      { id: `cat_${orgId}_3`, orgId, name: 'Desserts & Douceurs', nameFr: 'Desserts & Douceurs', iconName: 'IceCream', sortOrder: 3, isActive: true },
    ];

    setState((prev) => {
      const updatedUserOrgs = [...(prev.currentUser.organizationIds || []), orgId];
      return {
        ...prev,
        organizations: [newOrg, ...prev.organizations],
        activeOrgId: orgId,
        organization: newOrg,
        locations: [newLoc, ...prev.locations],
        activeLocationId: locId,
        tables: [...starterTables, ...prev.tables],
        categories: [...starterCategories, ...prev.categories],
        currentUser: {
          ...prev.currentUser,
          orgId,
          organizationIds: updatedUserOrgs,
        },
        auditLogs: [
          {
            id: `log_${Date.now()}`,
            orgId,
            actorName: prev.currentUser.name,
            action: 'Création d’établissement',
            details: `Établissement « ${newOrg.name} » créé avec devise ${newOrg.currency}`,
            createdAt: new Date().toISOString(),
          },
          ...prev.auditLogs,
        ],
      };
    });

    return newOrg;
  };

  const updateOrganization = (orgId: string, updates: Partial<Organization>) => {
    setState((prev) => {
      const updatedOrgs = prev.organizations.map((o) =>
        o.id === orgId ? { ...o, ...updates } : o
      );
      const activeOrg = updatedOrgs.find((o) => o.id === prev.activeOrgId) || prev.organization;
      return {
        ...prev,
        organizations: updatedOrgs,
        organization: activeOrg,
        auditLogs: [
          {
            id: `log_${Date.now()}`,
            orgId,
            actorName: prev.currentUser.name,
            action: 'Mise à jour restaurant',
            details: `Paramètres mis à jour pour « ${activeOrg.name} »`,
            createdAt: new Date().toISOString(),
          },
          ...prev.auditLogs,
        ],
      };
    });
  };

  const archiveOrganization = (orgId: string) => {
    setState((prev) => {
      const updatedOrgs = prev.organizations.map((o) =>
        o.id === orgId ? { ...o, status: 'archived' as const } : o
      );
      // If the archived org was active, switch to another non-archived org if possible
      let nextActiveOrgId = prev.activeOrgId;
      if (prev.activeOrgId === orgId) {
        const remaining = updatedOrgs.filter((o) => o.id !== orgId && o.status !== 'archived');
        nextActiveOrgId = remaining[0]?.id || null;
      }

      const activeOrg = updatedOrgs.find((o) => o.id === nextActiveOrgId) || prev.organization;

      return {
        ...prev,
        organizations: updatedOrgs,
        activeOrgId: nextActiveOrgId,
        organization: activeOrg,
        auditLogs: [
          {
            id: `log_${Date.now()}`,
            orgId,
            actorName: prev.currentUser.name,
            action: 'Archivage de restaurant',
            details: `Établissement archivé (données de vente conservées)`,
            createdAt: new Date().toISOString(),
          },
          ...prev.auditLogs,
        ],
      };
    });
  };

  const deleteOrganization = (orgId: string): boolean => {
    archiveOrganization(orgId);
    return true;
  };

  // Authentication Operations
  const login = (email: string, password?: string) => {
    const existingProfile =
      (state.users || []).find((p) => p.email.toLowerCase() === email.toLowerCase()) ||
      INITIAL_PROFILES.find((p) => p.email.toLowerCase() === email.toLowerCase());

    const isAgencyAdmin = email.trim().toLowerCase() === 'dataworkagency0@gmail.com';
    const user: DatabaseState['currentUser'] = existingProfile || {
      id: `usr_${Date.now()}`,
      name: isAgencyAdmin ? 'DATA WORK AGENCY (Admin)' : email.split('@')[0],
      email,
      role: isAgencyAdmin ? 'platform_admin' : 'owner',
      organizationIds: isAgencyAdmin ? state.organizations.map((o) => o.id) : [],
    };

    setState((prev) => {
      const existsInUsers = (prev.users || []).some((u) => u.email.toLowerCase() === user.email.toLowerCase());
      return {
        ...prev,
        isAuthenticated: true,
        currentUser: user,
        users: existsInUsers ? prev.users : [user, ...(prev.users || [])],
      };
    });

    // Check user's restaurants
    const availableOrgs = state.organizations.filter(
      (o) =>
        o.status !== 'archived' &&
        (isAgencyAdmin || o.ownerId === user.id || user.organizationIds?.includes(o.id) || o.isDemo)
    );

    if (availableOrgs.length === 0) {
      navigateTo('onboarding');
    } else {
      switchOrganization(availableOrgs[0].id);
      navigateTo(isAgencyAdmin ? 'superadmin' : 'dashboard');
    }

    return { success: true };
  };

  const loginDemo = () => {
    setState((prev) => ({
      ...prev,
      isAuthenticated: true,
      currentUser: INITIAL_PROFILES[0],
      activeOrgId: INITIAL_ORGANIZATION.id,
      organization: INITIAL_ORGANIZATION,
    }));
    switchOrganization(INITIAL_ORGANIZATION.id);
    navigateTo('dashboard');
  };

  const register = (name: string, email: string, password?: string) => {
    if (state.platformSettings && !state.platformSettings.allowNewRegistrations) {
      return {
        success: false,
        message: 'Les nouvelles inscriptions sont temporairement suspendues par DATA WORK AGENCY.',
      };
    }

    const newUser: DatabaseState['currentUser'] = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role: 'owner',
      organizationIds: [],
    };

    setState((prev) => ({
      ...prev,
      isAuthenticated: true,
      currentUser: newUser,
      users: [newUser, ...(prev.users || [])],
    }));

    // New user has 0 restaurants, route to onboarding directly!
    navigateTo('onboarding');
    return { success: true };
  };

  const logout = () => {
    setState((prev) => ({
      ...prev,
      isAuthenticated: false,
    }));
    navigateTo('marketing');
  };

  const switchUserRole = (role: UserRole) => {
    const existing = INITIAL_PROFILES.find((p) => p.role === role);
    const updatedUser = existing
      ? { ...existing, orgId: activeOrganization.id }
      : {
          id: `usr_${role}`,
          orgId: activeOrganization.id,
          name: `${role.toUpperCase()} (Session)`,
          email: `${role}@restaurant.cm`,
          role,
        };
    setState((prev) => ({ ...prev, currentUser: updatedUser }));
  };

  const createOrder = (orderData: Partial<Order>): Order => {
    const orderNumber = `CMD-${Math.floor(1000 + Math.random() * 9000)}`;
    const isClientOrder = orderData.source === 'public_web' || orderData.source === 'qr_table';
    const actorDisplayName =
      orderData.createdBy ||
      (orderData.source === 'qr_table'
        ? 'Client (QR Table)'
        : orderData.source === 'public_web'
        ? 'Client (Menu Public)'
        : state.currentUser.name);

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber,
      orgId: orderData.orgId || activeOrganization.id,
      locationId: orderData.locationId || state.activeLocationId,
      tableId: orderData.tableId,
      tableName: orderData.tableName,
      type: orderData.type || 'dine_in',
      status: orderData.status || (isClientOrder ? 'pending' : 'confirmed'),
      paymentStatus: orderData.paymentStatus || 'unpaid',
      paymentMethod: orderData.paymentMethod,
      paymentProvider: orderData.paymentProvider,
      customerName:
        orderData.customerName ||
        (orderData.tableId ? `Client ${orderData.tableName || ''}` : 'Client Comptoir'),
      customerPhone: orderData.customerPhone,
      deliveryAddress: orderData.deliveryAddress,
      source: orderData.source || 'pos',
      clientTrackingToken:
        orderData.clientTrackingToken || `trk_${Math.random().toString(36).slice(2, 10)}`,
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      taxAmount: orderData.taxAmount || 0,
      discountAmount: orderData.discountAmount || 0,
      totalAmount: orderData.totalAmount || 0,
      notes: orderData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: actorDisplayName,
      prepTimeMinutes: orderData.prepTimeMinutes || 20,
    };

    // Recipe-based inventory deduction
    let updatedInventory = [...state.inventory];
    if (orderData.items && orderData.items.length > 0) {
      orderData.items.forEach((item) => {
        const recipe = state.recipes.find((r) => r.productId === item.productId);
        if (recipe && recipe.items) {
          recipe.items.forEach((ri) => {
            const invIndex = updatedInventory.findIndex((inv) => inv.id === ri.inventoryItemId);
            if (invIndex !== -1) {
              const totalDeducted = ri.quantity * item.quantity;
              const newStock = Math.max(0, updatedInventory[invIndex].currentStock - totalDeducted);
              updatedInventory[invIndex] = {
                ...updatedInventory[invIndex],
                currentStock: Number(newStock.toFixed(2)),
              };
            }
          });
        }
      });
    }

    // Update table status if dine-in
    let updatedTables = [...state.tables];
    if (newOrder.tableId && newOrder.type === 'dine_in') {
      updatedTables = updatedTables.map((t) =>
        t.id === newOrder.tableId
          ? {
              ...t,
              status: 'occupied',
              currentOrderId: newOrder.id,
              currentGuestName: newOrder.customerName,
              seatedAt: new Date().toISOString(),
            }
          : t
      );
    }

    setState((prev) => ({
      ...prev,
      orders: [newOrder, ...prev.orders],
      inventory: updatedInventory,
      tables: updatedTables,
      auditLogs: [
        {
          id: `log_${Date.now()}`,
          orgId: activeOrganization.id,
          actorName: prev.currentUser.name,
          action: 'Création de commande',
          details: `Commande ${orderNumber} créée (${newOrder.totalAmount} ${activeOrganization.currency})`,
          createdAt: new Date().toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setState((prev) => {
      const order = prev.orders.find((o) => o.id === orderId);
      if (!order) return prev;

      const updatedOrders = prev.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status,
              updatedAt: new Date().toISOString(),
              completedAt: status === 'completed' ? new Date().toISOString() : o.completedAt,
            }
          : o
      );

      let updatedTables = prev.tables;
      if (order.tableId && (status === 'completed' || status === 'cancelled')) {
        updatedTables = prev.tables.map((t) =>
          t.id === order.tableId
            ? { ...t, status: 'cleaning', currentOrderId: undefined, currentGuestName: undefined }
            : t
        );
      }

      return {
        ...prev,
        orders: updatedOrders,
        tables: updatedTables,
      };
    });
  };

  const recordOrderPayment = (orderId: string, method: PaymentMethod, provider?: any) => {
    setState((prev) => {
      const updatedOrders = prev.orders.map((o) =>
        o.id === orderId
          ? {
              ...o,
              paymentStatus: 'paid' as const,
              paymentMethod: method,
              paymentProvider: provider,
              status: o.status === 'served' ? ('completed' as const) : o.status,
              completedAt: o.status === 'served' ? new Date().toISOString() : o.completedAt,
              updatedAt: new Date().toISOString(),
            }
          : o
      );

      return {
        ...prev,
        orders: updatedOrders,
        auditLogs: [
          {
            id: `log_${Date.now()}`,
            orgId: activeOrganization.id,
            actorName: prev.currentUser.name,
            action: 'Encaissement validé',
            details: `Paiement enregistré par ${method} pour la commande`,
            createdAt: new Date().toISOString(),
          },
          ...prev.auditLogs,
        ],
      };
    });
  };

  const updateTableStatus = (
    tableId: string,
    status: TableStatus,
    currentOrderId?: string,
    guestName?: string
  ) => {
    setState((prev) => ({
      ...prev,
      tables: prev.tables.map((t) =>
        t.id === tableId
          ? {
              ...t,
              status,
              currentOrderId: status === 'available' ? undefined : (currentOrderId ?? t.currentOrderId),
              currentGuestName: status === 'available' ? undefined : (guestName ?? t.currentGuestName),
            }
          : t
      ),
    }));
  };

  const transferTableOrder = (fromTableId: string, toTableId: string): boolean => {
    const fromTable = state.tables.find((t) => t.id === fromTableId);
    const toTable = state.tables.find((t) => t.id === toTableId);

    if (!fromTable || !toTable || toTable.status !== 'available' || !fromTable.currentOrderId) {
      return false;
    }

    const orderId = fromTable.currentOrderId;

    setState((prev) => ({
      ...prev,
      tables: prev.tables.map((t) => {
        if (t.id === fromTableId) {
          return { ...t, status: 'cleaning', currentOrderId: undefined, currentGuestName: undefined };
        }
        if (t.id === toTableId) {
          return {
            ...t,
            status: 'occupied',
            currentOrderId: orderId,
            currentGuestName: fromTable.currentGuestName,
          };
        }
        return t;
      }),
      orders: prev.orders.map((o) =>
        o.id === orderId
          ? { ...o, tableId: toTableId, tableName: toTable.name, updatedAt: new Date().toISOString() }
          : o
      ),
      auditLogs: [
        {
          id: `log_${Date.now()}`,
          orgId: activeOrganization.id,
          actorName: prev.currentUser.name,
          action: 'Transfert de table',
          details: `Commande transférée de ${fromTable.name} vers ${toTable.name}`,
          createdAt: new Date().toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));

    return true;
  };

  const addInventoryMovement = (
    itemId: string,
    type: 'purchase' | 'usage' | 'waste' | 'adjustment',
    quantity: number,
    reason: string
  ) => {
    setState((prev) => {
      const item = prev.inventory.find((i) => i.id === itemId);
      if (!item) return prev;

      const delta =
        type === 'purchase' || (type === 'adjustment' && quantity > 0)
          ? Math.abs(quantity)
          : -Math.abs(quantity);
      const newStock = Math.max(0, item.currentStock + delta);

      const updatedInventory = prev.inventory.map((inv) =>
        inv.id === itemId ? { ...inv, currentStock: Number(newStock.toFixed(2)) } : inv
      );

      return {
        ...prev,
        inventory: updatedInventory,
        auditLogs: [
          {
            id: `log_${Date.now()}`,
            orgId: activeOrganization.id,
            actorName: prev.currentUser.name,
            action: `Mouvement de stock (${type})`,
            details: `${delta > 0 ? '+' : ''}${delta} ${item.unit} pour « ${item.name} » - Motif: ${reason}`,
            createdAt: new Date().toISOString(),
          },
          ...prev.auditLogs,
        ],
      };
    });
  };

  const checkReservationAvailability = (
    orgId: string,
    date: string,
    time: string,
    guestCount: number,
    area?: string
  ): { available: boolean; reason?: string; remainingSeats: number; suggestedTimes?: string[] } => {
    const org = state.organizations.find((o) => o.id === orgId) || activeOrganization;
    const parseMins = (hhmm: string) => {
      const [h, m] = hhmm.split(':').map(Number);
      return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
    };

    // Check day opening hours
    if (org.businessHoursSchedule && org.businessHoursSchedule.length > 0 && date) {
      const dayNamesFr = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
      const d = new Date(`${date}T12:00:00`);
      const dayLabel = dayNamesFr[d.getDay()];
      const daySchedule = org.businessHoursSchedule.find(
        (h) => h.day.toLowerCase() === dayLabel.toLowerCase()
      );
      if (daySchedule) {
        if (daySchedule.isClosed) {
          return {
            available: false,
            reason:
              language === 'fr'
                ? `L’établissement est fermé le ${dayLabel}.`
                : `The restaurant is closed on ${dayLabel}.`,
            remainingSeats: 0,
          };
        }
        const reqMin = parseMins(time);
        const openMin = parseMins(daySchedule.open);
        let closeMin = parseMins(daySchedule.close);
        if (closeMin <= openMin) closeMin += 24 * 60;
        const effectiveReqMin = reqMin < openMin && closeMin > 24 * 60 ? reqMin + 24 * 60 : reqMin;

        if (effectiveReqMin < openMin || effectiveReqMin > closeMin - 30) {
          return {
            available: false,
            reason:
              language === 'fr'
                ? `Horaires d’ouverture le ${dayLabel} : ${daySchedule.open} - ${daySchedule.close}.`
                : `Opening hours on ${dayLabel}: ${daySchedule.open} - ${daySchedule.close}.`,
            remainingSeats: 0,
          };
        }
      }
    }

    const orgTables = state.tables.filter((t) => t.orgId === orgId && t.status !== 'out_of_service');
    const normalizeArea = (val?: string) => (val || '').toLowerCase();
    const matchingAreaTables =
      area && area !== 'all'
        ? orgTables.filter((t) => {
            const ta = t.area.toLowerCase();
            const ra = normalizeArea(area);
            if (ra.includes('terrasse') || ra.includes('terrace')) return ta === 'terrace';
            if (ra.includes('vip')) return ta === 'vip_lounge';
            if (ra.includes('bar')) return ta === 'bar';
            return ta === 'main_hall';
          })
        : orgTables;

    const totalCapacity =
      matchingAreaTables.length > 0
        ? matchingAreaTables.reduce((sum, t) => sum + t.capacity, 0)
        : orgTables.length > 0
        ? orgTables.reduce((sum, t) => sum + t.capacity, 0)
        : 24;

    const reqMins = parseMins(time);
    const sameDayActiveRes = state.reservations.filter(
      (r) => r.orgId === orgId && r.date === date && r.status !== 'cancelled'
    );

    const computeRemainingForTime = (targetMins: number) => {
      const bookedSeats = sameDayActiveRes
        .filter((r) => Math.abs(parseMins(r.time) - targetMins) < 90)
        .filter((r) => {
          if (!area || area === 'all' || matchingAreaTables.length === 0) return true;
          return normalizeArea(r.area) === normalizeArea(area);
        })
        .reduce((sum, r) => sum + r.guestCount, 0);
      return Math.max(0, totalCapacity - bookedSeats);
    };

    const remainingSeats = computeRemainingForTime(reqMins);
    if (guestCount > remainingSeats) {
      const candidateTimes = ['12:00', '13:30', '19:00', '20:30', '21:30'];
      const suggestedTimes = candidateTimes.filter(
        (ct) => ct !== time && computeRemainingForTime(parseMins(ct)) >= guestCount
      );
      return {
        available: false,
        reason:
          language === 'fr'
            ? `Capacité insuffisante à ${time} (${remainingSeats} place(s) restante(s) pour ${guestCount} personne(s)).`
            : `Not enough seats at ${time} (${remainingSeats} seat(s) left for ${guestCount} guest(s)).`,
        remainingSeats,
        suggestedTimes,
      };
    }

    return { available: true, remainingSeats };
  };

  const createReservation = (
    res: Omit<Reservation, 'id' | 'createdAt' | 'orgId' | 'locationId'>,
    targetOrgId?: string
  ): Reservation => {
    const orgId = targetOrgId || activeOrganization.id;
    const reservationCode = `RES-${Math.floor(1000 + Math.random() * 9000)}`;
    const newReservation: Reservation = {
      ...res,
      id: `res_${Date.now()}`,
      reservationCode,
      orgId,
      locationId: state.activeLocationId,
      createdAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      reservations: [newReservation, ...prev.reservations],
      auditLogs: [
        {
          id: `log_${Date.now()}`,
          orgId,
          actorName: prev.isAuthenticated ? prev.currentUser.name : `${newReservation.customerName} (Client)`,
          action: 'Nouvelle réservation',
          details: `Réservation ${reservationCode} pour ${newReservation.customerName} (${newReservation.guestCount} pers., ${newReservation.date} à ${newReservation.time})`,
          createdAt: new Date().toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));

    return newReservation;
  };

  const updateReservationStatus = (id: string, status: Reservation['status']) => {
    setState((prev) => ({
      ...prev,
      reservations: prev.reservations.map((r) => (r.id === id ? { ...r, status } : r)),
    }));
  };

  const createProduct = (product: Omit<Product, 'id' | 'orgId'>) => {
    const newProduct: Product = {
      ...product,
      id: `prd_${Date.now()}`,
      orgId: activeOrganization.id,
    };
    setState((prev) => ({
      ...prev,
      products: [newProduct, ...prev.products],
      auditLogs: [
        {
          id: `log_${Date.now()}`,
          orgId: activeOrganization.id,
          actorName: prev.currentUser.name,
          action: 'Création produit',
          details: `Article « ${newProduct.name} » ajouté au menu (${newProduct.price} ${activeOrganization.currency})`,
          createdAt: new Date().toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  };

  const deleteProduct = (id: string) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== id),
    }));
  };

  const toggleProductAvailability = (id: string) => {
    setState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === id ? { ...p, isAvailable: !p.isAvailable } : p
      ),
    }));
  };

  const createCategory = (name: string): Category => {
    const cleanName = name.trim();
    const newCat: Category = {
      id: `cat_${Date.now()}`,
      orgId: activeOrganization.id,
      name: cleanName,
      nameFr: cleanName,
      iconName: 'Utensils',
      sortOrder: scopedCategories.length + 1,
      isActive: true,
    };
    setState((prev) => ({
      ...prev,
      categories: [...prev.categories, newCat],
      auditLogs: [
        {
          id: `log_${Date.now()}`,
          orgId: activeOrganization.id,
          actorName: prev.currentUser.name,
          action: 'Création catégorie menu',
          details: `Catégorie « ${cleanName} » ajoutée`,
          createdAt: new Date().toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));
    return newCat;
  };

  const createInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'orgId'>): InventoryItem => {
    const newItem: InventoryItem = {
      ...itemData,
      id: `inv_${Date.now()}`,
      orgId: activeOrganization.id,
      lastRestockedAt: new Date().toISOString().split('T')[0],
    };
    setState((prev) => ({
      ...prev,
      inventory: [newItem, ...prev.inventory],
      auditLogs: [
        {
          id: `log_${Date.now()}`,
          orgId: activeOrganization.id,
          actorName: prev.currentUser.name,
          action: 'Nouvel ingrédient créé',
          details: `Article « ${newItem.name} » (${newItem.currentStock} ${newItem.unit}) ajouté au stock`,
          createdAt: new Date().toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));
    return newItem;
  };

  const updateCurrentUser = (updates: Partial<DatabaseState['currentUser']>) => {
    setState((prev) => ({
      ...prev,
      currentUser: {
        ...prev.currentUser,
        ...updates,
      },
      auditLogs: [
        {
          id: `log_${Date.now()}`,
          orgId: activeOrganization.id,
          actorName: updates.name || prev.currentUser.name,
          action: 'Mise à jour profil utilisateur',
          details: `Profil personnel mis à jour pour ${updates.name || prev.currentUser.name}`,
          createdAt: new Date().toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));
  };

  const recordBillingTransaction = (tx: BillingTransaction) => {
    setState((prev) => ({
      ...prev,
      billingTransactions: [tx, ...(prev.billingTransactions || [])],
      auditLogs: [
        {
          id: `log_${Date.now()}`,
          orgId: tx.orgId || activeOrganization.id,
          actorName: prev.currentUser.name,
          action: 'Facturation SaaS enregistrée',
          details: `Facture ${tx.invoiceNumber} — ${tx.amount} ${tx.currency} (${tx.paymentMethod})`,
          createdAt: new Date().toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));
  };

  const updateOrganizationSettings = (updates: Partial<Organization>) => {
    updateOrganization(activeOrganization.id, updates);
  };

  const completeOnboarding = (
    orgData: Partial<Organization>,
    locationData: Partial<RestaurantLocation>
  ) => {
    createOrganization(orgData, locationData);
    navigateTo('dashboard');
  };

  const resetToDemo = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('restaurantos_tenant_state_v1');
    setState({
      organizations: INITIAL_ORGANIZATIONS,
      activeOrgId: INITIAL_ORGANIZATION.id,
      organization: INITIAL_ORGANIZATION,
      locations: INITIAL_LOCATIONS,
      activeLocationId: 'loc_bonapriso',
      isAuthenticated: true,
      currentUser: INITIAL_PROFILES[0],
      users: INITIAL_PROFILES,
      categories: INITIAL_CATEGORIES,
      products: INITIAL_PRODUCTS,
      tables: INITIAL_TABLES,
      orders: INITIAL_ORDERS,
      inventory: INITIAL_INVENTORY,
      recipes: INITIAL_RECIPES,
      reservations: INITIAL_RESERVATIONS,
      customers: INITIAL_CUSTOMERS,
      auditLogs: INITIAL_AUDIT_LOGS,
      subscriptionPlans: INITIAL_SUBSCRIPTION_PLANS,
      billingTransactions: INITIAL_BILLING_TRANSACTIONS,
      staffInvitations: INITIAL_STAFF_INVITATIONS,
      reviews: INITIAL_REVIEWS,
      internalNotes: INITIAL_INTERNAL_NOTES,
      staffShifts: INITIAL_STAFF_SHIFTS,
      dailyZReports: INITIAL_DAILY_Z_REPORTS,
      expenses: INITIAL_EXPENSES,
      supportTickets: INITIAL_SUPPORT_TICKETS,
      platformSettings: INITIAL_PLATFORM_SETTINGS,
    });
    navigateTo('dashboard');
  };

  const addAuditLog = (action: string, details: string) => {
    setState((prev) => ({
      ...prev,
      auditLogs: [
        {
          id: `log_${Date.now()}`,
          orgId: activeOrganization.id,
          actorName: prev.currentUser.name,
          action,
          details,
          createdAt: new Date().toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));
  };

  const createStaffInvitation = (
    role: UserRole,
    invitedName?: string,
    invitedEmail?: string
  ): StaffInvitation => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let codePart = '';
    for (let i = 0; i < 6; i++) {
      codePart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const code = `RST-${codePart}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const newInvitation: StaffInvitation = {
      id: `inv_${Date.now()}`,
      orgId: activeOrganization.id,
      role,
      code,
      invitedName,
      invitedEmail,
      expiresAt,
      isRevoked: false,
      isAccepted: false,
      createdAt: new Date().toISOString(),
      createdBy: `${state.currentUser.name} (${state.currentUser.role})`,
    };

    setState((prev) => ({
      ...prev,
      staffInvitations: [newInvitation, ...(prev.staffInvitations || [])],
      auditLogs: [
        {
          id: `log_${Date.now()}`,
          orgId: activeOrganization.id,
          actorName: prev.currentUser.name,
          action: 'Création d’invitation collaborateur',
          details: `Code ${code} généré pour le rôle ${role} (${invitedName || invitedEmail || 'Général'})`,
          createdAt: new Date().toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));

    return newInvitation;
  };

  const revokeStaffInvitation = (invitationId: string) => {
    setState((prev) => ({
      ...prev,
      staffInvitations: (prev.staffInvitations || []).map((inv) =>
        inv.id === invitationId ? { ...inv, isRevoked: true } : inv
      ),
      auditLogs: [
        {
          id: `log_${Date.now()}`,
          orgId: activeOrganization.id,
          actorName: prev.currentUser.name,
          action: 'Révocation invitation',
          details: `Invitation ${invitationId} révoquée`,
          createdAt: new Date().toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));
  };

  const acceptStaffInvitation = (
    code: string
  ): { success: boolean; message: string; organization?: Organization } => {
    const trimmedCode = code.trim().toUpperCase();
    const invitation = (state.staffInvitations || []).find(
      (inv) => inv.code.toUpperCase() === trimmedCode
    );

    if (!invitation) {
      return { success: false, message: 'Code d’invitation introuvable ou incorrect.' };
    }

    if (invitation.isRevoked) {
      return { success: false, message: 'Ce code d’invitation a été révoqué par le restaurant.' };
    }

    if (invitation.isAccepted) {
      return { success: false, message: 'Ce code d’invitation a déjà été utilisé.' };
    }

    const now = new Date().getTime();
    if (new Date(invitation.expiresAt).getTime() < now) {
      return { success: false, message: 'Ce code d’invitation a expiré (validité 7 jours).' };
    }

    const targetOrg = state.organizations.find((o) => o.id === invitation.orgId);
    if (!targetOrg) {
      return { success: false, message: 'Le restaurant associé à cette invitation est introuvable.' };
    }

    // Attach user to this organization with the invited role
    setState((prev) => {
      const userOrgs = Array.from(new Set([...(prev.currentUser.organizationIds || []), targetOrg.id]));
      return {
        ...prev,
        staffInvitations: (prev.staffInvitations || []).map((inv) =>
          inv.id === invitation.id ? { ...inv, isAccepted: true } : inv
        ),
        activeOrgId: targetOrg.id,
        organization: targetOrg,
        currentUser: {
          ...prev.currentUser,
          orgId: targetOrg.id,
          role: invitation.role,
          organizationIds: userOrgs,
        },
        auditLogs: [
          {
            id: `log_${Date.now()}`,
            orgId: targetOrg.id,
            actorName: prev.currentUser.name,
            action: 'Adhésion d’un collaborateur',
            details: `${prev.currentUser.name} a rejoint l’équipe avec le rôle ${invitation.role} via le code ${trimmedCode}`,
            createdAt: new Date().toISOString(),
          },
          ...prev.auditLogs,
        ],
      };
    });

    return {
      success: true,
      message: `Bienvenue dans l’équipe de « ${targetOrg.name} » avec le rôle de ${invitation.role} !`,
      organization: targetOrg,
    };
  };

  const updateSubscriptionPlanPrice = (planId: SubscriptionPlanId, newPriceXAF: number) => {
    setState((prev) => ({
      ...prev,
      subscriptionPlans: prev.subscriptionPlans.map((p) =>
        p.id === planId ? { ...p, priceXAF: newPriceXAF } : p
      ),
      auditLogs: [
        {
          id: `log_${Date.now()}`,
          orgId: 'system',
          actorName: prev.currentUser.name,
          action: 'Tarif SaaS modifié (DATA WORK AGENCY)',
          details: `Plan ${planId} ajusté à ${newPriceXAF} XAF/mois`,
          createdAt: new Date().toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));
  };

  const updateSubscriptionPlan = (planId: SubscriptionPlanId, updates: Partial<SubscriptionPlan>) => {
    setState((prev) => ({
      ...prev,
      subscriptionPlans: prev.subscriptionPlans.map((p) =>
        p.id === planId ? { ...p, ...updates } : p
      ),
      auditLogs: [
        {
          id: `log_${Date.now()}`,
          orgId: 'system',
          actorName: prev.currentUser.name,
          action: 'Formule SaaS modifiée (DATA WORK AGENCY)',
          details: `Plan ${planId} mis à jour`,
          createdAt: new Date().toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));
  };

  const approveBillingTransaction = (txId: string) => {
    setState((prev) => {
      const targetTx = (prev.billingTransactions || []).find((tx) => tx.id === txId);
      if (!targetTx) return prev;

      const durationMonths =
        targetTx.period === 'annual' ? 12 : targetTx.period === 'quarterly' ? 3 : 1;
      const now = new Date();
      const newEnd = new Date(now.getTime() + durationMonths * 30 * 86400000).toISOString();

      const updatedTransactions = prev.billingTransactions.map((tx) =>
        tx.id === txId
          ? {
              ...tx,
              status: 'confirmed' as const,
              confirmedAt: now.toISOString(),
              operatorReference: tx.operatorReference || `DWA-VAL-${Date.now().toString().slice(-6)}`,
            }
          : tx
      );

      const updatedOrgs = prev.organizations.map((org) =>
        org.id === targetTx.orgId
          ? {
              ...org,
              subscriptionPlan: targetTx.planId,
              subscriptionStatus: 'active' as const,
              subscriptionStartedAt: now.toISOString(),
              subscriptionEndsAt: newEnd,
              paymentStatus: 'paid' as const,
              billingPeriod: targetTx.period,
            }
          : org
      );
      const activeOrg = updatedOrgs.find((o) => o.id === prev.activeOrgId) || prev.organization;

      return {
        ...prev,
        billingTransactions: updatedTransactions,
        organizations: updatedOrgs,
        organization: activeOrg,
        auditLogs: [
          {
            id: `log_${Date.now()}`,
            orgId: targetTx.orgId,
            actorName: prev.currentUser.name,
            action: 'Paiement SaaS approuvé (DATA WORK AGENCY)',
            details: `Facture ${targetTx.invoiceNumber} confirmée (${targetTx.amount} ${targetTx.currency}) — Licence ${targetTx.planId.toUpperCase()} activée`,
            createdAt: now.toISOString(),
          },
          ...prev.auditLogs,
        ],
      };
    });
  };

  const rejectBillingTransaction = (txId: string, reason?: string) => {
    setState((prev) => {
      const targetTx = (prev.billingTransactions || []).find((tx) => tx.id === txId);
      if (!targetTx) return prev;

      return {
        ...prev,
        billingTransactions: prev.billingTransactions.map((tx) =>
          tx.id === txId ? { ...tx, status: 'failed' as const } : tx
        ),
        auditLogs: [
          {
            id: `log_${Date.now()}`,
            orgId: targetTx.orgId,
            actorName: prev.currentUser.name,
            action: 'Paiement SaaS rejeté (DATA WORK AGENCY)',
            details: `Transaction ${targetTx.invoiceNumber} refusée${reason ? ` : ${reason}` : ''}`,
            createdAt: new Date().toISOString(),
          },
          ...prev.auditLogs,
        ],
      };
    });
  };

  const updateUserRole = (userId: string, role: UserRole) => {
    setState((prev) => ({
      ...prev,
      users: (prev.users || []).map((u) => (u.id === userId ? { ...u, role } : u)),
      currentUser:
        prev.currentUser.id === userId ? { ...prev.currentUser, role } : prev.currentUser,
      auditLogs: [
        {
          id: `log_${Date.now()}`,
          orgId: 'system',
          actorName: prev.currentUser.name,
          action: 'Rôle utilisateur modifié',
          details: `Utilisateur ${userId} attribué au rôle ${role}`,
          createdAt: new Date().toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));
  };

  const updatePlatformSettings = (updates: Partial<PlatformSettings>) => {
    const safeTrialDays =
      updates.defaultTrialDays !== undefined
        ? Math.min(7, Math.max(1, updates.defaultTrialDays))
        : undefined;
    setState((prev) => ({
      ...prev,
      platformSettings: {
        ...(prev.platformSettings || INITIAL_PLATFORM_SETTINGS),
        ...updates,
        ...(safeTrialDays !== undefined ? { defaultTrialDays: safeTrialDays } : {}),
      },
      auditLogs: [
        {
          id: `log_${Date.now()}`,
          orgId: 'system',
          actorName: prev.currentUser.name,
          action: 'Paramètres SaaS mis à jour (DATA WORK AGENCY)',
          details: 'Configuration générale de la plateforme actualisée',
          createdAt: new Date().toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));
  };

  const addExpense = (
    expense: Omit<ExpenseRecord, 'id' | 'orgId' | 'createdAt' | 'recordedBy'>
  ): ExpenseRecord => {
    const newExp: ExpenseRecord = {
      ...expense,
      id: `exp_${Date.now()}`,
      orgId: currentOrgId,
      recordedBy: state.currentUser.name,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      expenses: [newExp, ...(prev.expenses || [])],
      auditLogs: [
        {
          id: `log_${Date.now()}`,
          orgId: currentOrgId,
          actorName: prev.currentUser.name,
          action: 'Dépense enregistrée',
          details: `${newExp.title} (${newExp.amount} ${activeOrganization.currency})`,
          createdAt: new Date().toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));
    return newExp;
  };

  const deleteExpense = (expenseId: string) => {
    setState((prev) => ({
      ...prev,
      expenses: (prev.expenses || []).filter((e) => e.id !== expenseId),
    }));
  };

  const submitSupportTicket = (
    ticket: Omit<SupportTicket, 'id' | 'status' | 'createdAt' | 'updatedAt'>
  ): SupportTicket => {
    const now = new Date().toISOString();
    const newTicket: SupportTicket = {
      ...ticket,
      id: `tkt_${Date.now()}`,
      status: 'open',
      createdAt: now,
      updatedAt: now,
    };
    setState((prev) => ({
      ...prev,
      supportTickets: [newTicket, ...(prev.supportTickets || [])],
    }));
    return newTicket;
  };

  const updateSupportTicketStatus = (
    ticketId: string,
    status: SupportTicket['status'],
    adminNote?: string
  ) => {
    setState((prev) => ({
      ...prev,
      supportTickets: (prev.supportTickets || []).map((tkt) =>
        tkt.id === ticketId
          ? {
              ...tkt,
              status,
              adminNote: adminNote !== undefined ? adminNote : tkt.adminNote,
              updatedAt: new Date().toISOString(),
            }
          : tkt
      ),
    }));
  };

  const toggleRestaurantStatus = (orgId: string) => {
    setState((prev) => {
      const updatedOrgs = prev.organizations.map((org) => {
        if (org.id === orgId) {
          const nextStatus = org.status === 'archived' ? ('active' as const) : ('archived' as const);
          return { ...org, status: nextStatus };
        }
        return org;
      });
      const activeOrg = updatedOrgs.find((o) => o.id === prev.activeOrgId) || prev.organization;
      return {
        ...prev,
        organizations: updatedOrgs,
        organization: activeOrg,
      };
    });
  };

  const extendTrialDays = (orgId: string, days: number = 7) => {
    setState((prev) => {
      const updatedOrgs = prev.organizations.map((org) => {
        if (org.id === orgId) {
          const currentEnd = new Date(org.trialEndsAt).getTime();
          const baseTime = currentEnd > Date.now() ? currentEnd : Date.now();
          const newEnd = new Date(baseTime + days * 86400000).toISOString();
          return {
            ...org,
            trialEndsAt: newEnd,
            subscriptionStatus: 'trial' as const,
          };
        }
        return org;
      });
      const activeOrg = updatedOrgs.find((o) => o.id === prev.activeOrgId) || prev.organization;
      return {
        ...prev,
        organizations: updatedOrgs,
        organization: activeOrg,
        auditLogs: [
          {
            id: `log_${Date.now()}`,
            orgId,
            actorName: prev.currentUser.name,
            action: 'Prolongation administrative essai (DATA WORK AGENCY)',
            details: `Période d'essai prolongée de +${days} jours pour ${activeOrg.name}`,
            createdAt: new Date().toISOString(),
          },
          ...prev.auditLogs,
        ],
      };
    });
  };

  const activateSubscriptionManually = (orgId: string, planId: SubscriptionPlanId = 'business', durationMonths: number = 1) => {
    setState((prev) => {
      const now = new Date();
      const newEnd = new Date(now.getTime() + durationMonths * 30 * 86400000).toISOString();
      const updatedOrgs = prev.organizations.map((org) => {
        if (org.id === orgId) {
          return {
            ...org,
            subscriptionPlan: planId,
            subscriptionStatus: 'active' as const,
            subscriptionStartedAt: now.toISOString(),
            subscriptionEndsAt: newEnd,
            paymentStatus: 'paid' as const,
          };
        }
        return org;
      });
      const activeOrg = updatedOrgs.find((o) => o.id === prev.activeOrgId) || prev.organization;
      return {
        ...prev,
        organizations: updatedOrgs,
        organization: activeOrg,
        auditLogs: [
          {
            id: `log_${Date.now()}`,
            orgId,
            actorName: prev.currentUser.name,
            action: 'Activation manuelle abonnement (DATA WORK AGENCY)',
            details: `Abonnement ${planId.toUpperCase()} activé pour ${durationMonths} mois`,
            createdAt: new Date().toISOString(),
          },
          ...prev.auditLogs,
        ],
      };
    });
  };

  const populateStarterMenu = (orgId: string) => {
    const starterCategories: Category[] = [
      { id: `cat_${orgId}_grill`, orgId, name: 'Grillades & Poissons', nameFr: 'Grillades & Poissons', iconName: 'Flame', sortOrder: 1, isActive: true },
      { id: `cat_${orgId}_plats`, orgId, name: 'Plats Traditionnels', nameFr: 'Plats Traditionnels', iconName: 'UtensilsCrossed', sortOrder: 2, isActive: true },
      { id: `cat_${orgId}_drinks`, orgId, name: 'Boissons & Jus Frais', nameFr: 'Boissons & Jus Frais', iconName: 'Coffee', sortOrder: 3, isActive: true },
      { id: `cat_${orgId}_desserts`, orgId, name: 'Desserts & Douceurs', nameFr: 'Desserts & Douceurs', iconName: 'IceCream', sortOrder: 4, isActive: true },
    ];

    const starterProducts: Product[] = [
      {
        id: `prod_${orgId}_1`,
        orgId,
        categoryId: `cat_${orgId}_grill`,
        name: 'Bar Braisé Maison & Plantain Frit',
        nameFr: 'Bar Braisé Maison & Plantain Frit',
        description: 'Bar entier mariné aux épices du terroir, braisé au feu de bois avec beignets de plantain mûr (alloco).',
        descriptionFr: 'Bar entier mariné aux épices du terroir, braisé au feu de bois avec beignets de plantain mûr (alloco).',
        price: 5500,
        costPrice: 2200,
        image: '/src/assets/images/dish_grilled_fish_1792835864516.jpg',
        isAvailable: true,
        prepTimeMinutes: 25,
        allergens: ['Poisson'],
        sku: 'BRZ-01',
      },
      {
        id: `prod_${orgId}_2`,
        orgId,
        categoryId: `cat_${orgId}_plats`,
        name: 'Ndolé Royal aux Crevettes & Viande',
        nameFr: 'Ndolé Royal aux Crevettes & Viande',
        description: 'Feuilles de ndolé mijotées aux arachides fraîches, crevettes fumées et morceaux de bœuf tendre, servi avec miondo.',
        descriptionFr: 'Feuilles de ndolé mijotées aux arachides fraîches, crevettes fumées et morceaux de bœuf tendre, servi avec miondo.',
        price: 4500,
        costPrice: 1800,
        image: '/src/assets/images/dish_ndole_royal_1792835866049.jpg',
        isAvailable: true,
        prepTimeMinutes: 20,
        allergens: ['Arachides', 'Crustacés'],
        sku: 'NDL-02',
      },
      {
        id: `prod_${orgId}_3`,
        orgId,
        categoryId: `cat_${orgId}_plats`,
        name: 'Poulet DG aux Légumes Croquants',
        nameFr: 'Poulet DG aux Légumes Croquants',
        description: 'Poulet fermier doré sauté avec rondelles de plantain mûr, poivrons colorés, carottes, haricots verts et aromates.',
        descriptionFr: 'Poulet fermier doré sauté avec rondelles de plantain mûr, poivrons colorés, carottes, haricots verts et aromates.',
        price: 5000,
        costPrice: 2000,
        image: '/src/assets/images/dish_ndole_royal_1792835866049.jpg',
        isAvailable: true,
        prepTimeMinutes: 20,
        allergens: [],
        sku: 'PDG-03',
      },
      {
        id: `prod_${orgId}_4`,
        orgId,
        categoryId: `cat_${orgId}_drinks`,
        name: 'Jus de Bissap & Gingembre Frais',
        nameFr: 'Jus de Bissap & Gingembre Frais',
        description: 'Infusion de fleurs d’hibiscus bio, menthe fraîche et touche de gingembre piquant 100% naturel.',
        descriptionFr: 'Infusion de fleurs d’hibiscus bio, menthe fraîche et touche de gingembre piquant 100% naturel.',
        price: 1500,
        costPrice: 400,
        image: '/src/assets/images/restaurant_terrace_bar_1792835866677.jpg',
        isAvailable: true,
        prepTimeMinutes: 5,
        allergens: [],
        sku: 'BSP-04',
      },
    ];

    setState((prev) => ({
      ...prev,
      categories: [...starterCategories, ...prev.categories.filter((c) => c.orgId !== orgId)],
      products: [...starterProducts, ...prev.products.filter((p) => p.orgId !== orgId)],
      auditLogs: [
        {
          id: `log_${Date.now()}`,
          orgId,
          actorName: prev.currentUser.name,
          action: 'Suggestions de menu chargées',
          details: '4 plats signatures et catégories types créés',
          createdAt: new Date().toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));
  };

  // Profile & Vitrine Management
  const updateOrganizationProfile = (updates: Partial<Organization>) => {
    setState((prev) => {
      const updatedOrgs = prev.organizations.map((org) => {
        if (org.id === currentOrgId) {
          return { ...org, ...updates };
        }
        return org;
      });
      const activeOrg = updatedOrgs.find((o) => o.id === currentOrgId) || prev.organization;
      return {
        ...prev,
        organizations: updatedOrgs,
        organization: activeOrg,
        auditLogs: [
          {
            id: `log_${Date.now()}`,
            orgId: currentOrgId,
            actorName: prev.currentUser.name,
            action: 'Mise à jour vitrine & profil restaurant',
            details: 'Coordonnées, horaires ou galerie photos modifiés',
            createdAt: new Date().toISOString(),
          },
          ...prev.auditLogs,
        ],
      };
    });
  };

  const addGalleryImage = (imageUrl: string) => {
    if (!imageUrl || !imageUrl.trim()) return;
    const existingGallery = activeOrganization.gallery || [];
    updateOrganizationProfile({
      gallery: [...existingGallery, imageUrl.trim()],
    });
  };

  const removeGalleryImage = (index: number) => {
    const existingGallery = activeOrganization.gallery || [];
    const updated = existingGallery.filter((_, i) => i !== index);
    updateOrganizationProfile({ gallery: updated });
  };

  const reorderGalleryImages = (fromIndex: number, toIndex: number) => {
    const existingGallery = [...(activeOrganization.gallery || [])];
    if (fromIndex < 0 || fromIndex >= existingGallery.length || toIndex < 0 || toIndex >= existingGallery.length) return;
    const [moved] = existingGallery.splice(fromIndex, 1);
    existingGallery.splice(toIndex, 0, moved);
    updateOrganizationProfile({ gallery: existingGallery });
  };

  // Customer Reviews
  const addCustomerReview = (reviewData: Omit<CustomerReview, 'id' | 'createdAt' | 'status'>): CustomerReview => {
    const newReview: CustomerReview = {
      ...reviewData,
      id: `rev_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'published',
    };
    setState((prev) => ({
      ...prev,
      reviews: [newReview, ...(prev.reviews || [])],
      auditLogs: [
        {
          id: `log_${Date.now()}`,
          orgId: newReview.orgId,
          actorName: newReview.customerName,
          action: 'Avis client déposé',
          details: `Note: ${newReview.rating}/5 ${newReview.isVerifiedOrder ? '(Commande vérifiée)' : ''}`,
          createdAt: new Date().toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));
    return newReview;
  };

  const updateReviewStatus = (reviewId: string, status: CustomerReview['status']) => {
    setState((prev) => ({
      ...prev,
      reviews: (prev.reviews || []).map((r) => (r.id === reviewId ? { ...r, status } : r)),
    }));
  };

  const replyToReview = (reviewId: string, replyText: string) => {
    setState((prev) => ({
      ...prev,
      reviews: (prev.reviews || []).map((r) =>
        r.id === reviewId
          ? {
              ...r,
              reply: {
                text: replyText,
                authorName: `${prev.currentUser.name} (Direction)`,
                repliedAt: new Date().toISOString(),
              },
            }
          : r
      ),
    }));
  };

  // Internal Staff Notes
  const addInternalNote = (title: string, content: string, urgency: 'low' | 'medium' | 'high' = 'medium') => {
    const newNote: InternalStaffNote = {
      id: `note_${Date.now()}`,
      orgId: currentOrgId,
      authorName: state.currentUser.name,
      authorRole: state.currentUser.role,
      title,
      content,
      urgency,
      pinned: false,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => ({
      ...prev,
      internalNotes: [newNote, ...(prev.internalNotes || [])],
    }));
  };

  const togglePinNote = (noteId: string) => {
    setState((prev) => ({
      ...prev,
      internalNotes: (prev.internalNotes || []).map((n) =>
        n.id === noteId ? { ...n, pinned: !n.pinned } : n
      ),
    }));
  };

  const deleteInternalNote = (noteId: string) => {
    setState((prev) => ({
      ...prev,
      internalNotes: (prev.internalNotes || []).filter((n) => n.id !== noteId),
    }));
  };

  // Staff Shifts & Clock-in
  const clockInStaff = (userName: string, userRole: UserRole, notes?: string): StaffShift => {
    const newShift: StaffShift = {
      id: `shift_${Date.now()}`,
      orgId: currentOrgId,
      userId: state.currentUser.id,
      userName,
      userRole,
      clockIn: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      status: 'active',
      notes,
    };
    setState((prev) => ({
      ...prev,
      staffShifts: [newShift, ...(prev.staffShifts || [])],
      auditLogs: [
        {
          id: `log_${Date.now()}`,
          orgId: currentOrgId,
          actorName: userName,
          action: 'Prise de service (Clock-in)',
          details: `Arrivée pointée à ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          createdAt: new Date().toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));
    return newShift;
  };

  const clockOutStaff = (shiftId: string, notes?: string) => {
    const now = new Date();
    setState((prev) => ({
      ...prev,
      staffShifts: (prev.staffShifts || []).map((s) => {
        if (s.id === shiftId) {
          const diffMinutes = Math.max(1, Math.round((now.getTime() - new Date(s.clockIn).getTime()) / 60000));
          return {
            ...s,
            clockOut: now.toISOString(),
            status: 'completed',
            totalMinutes: diffMinutes,
            notes: notes || s.notes,
          };
        }
        return s;
      }),
    }));
  };

  // Daily Activity & Z-Report
  const generateZReportData = (dateStr?: string): Omit<DailyZReport, 'id' | 'createdAt'> => {
    const targetDate = dateStr || new Date().toISOString().split('T')[0];
    const dayOrders = scopedOrders.filter((o) => o.createdAt.startsWith(targetDate));
    const completed = dayOrders.filter((o) => o.status === 'completed' || o.paymentStatus === 'paid');
    const cancelled = dayOrders.filter((o) => o.status === 'cancelled');

    const grossRevenue = completed.reduce((sum, o) => sum + (o.subtotal + o.taxAmount), 0);
    const discountsTotal = completed.reduce((sum, o) => sum + (o.discountAmount || 0), 0);
    const refundsTotal = dayOrders.filter((o) => o.paymentStatus === 'refunded').reduce((sum, o) => sum + o.totalAmount, 0);
    const netRevenue = Math.max(0, grossRevenue - discountsTotal - refundsTotal);
    const taxTotal = completed.reduce((sum, o) => sum + (o.taxAmount || 0), 0);
    const averageOrderValue = completed.length > 0 ? Math.round(netRevenue / completed.length) : 0;

    const paymentBreakdown = {
      cash: completed.filter((o) => o.paymentMethod === 'cash').reduce((sum, o) => sum + o.totalAmount, 0),
      card: completed.filter((o) => o.paymentMethod === 'card').reduce((sum, o) => sum + o.totalAmount, 0),
      mobile_money: completed.filter((o) => o.paymentMethod === 'mobile_money').reduce((sum, o) => sum + o.totalAmount, 0),
    };

    // Category breakdown
    const catMap = new Map<string, { categoryId: string; categoryName: string; revenue: number; quantity: number }>();
    for (const ord of completed) {
      for (const itm of ord.items) {
        const prod = scopedProducts.find((p) => p.id === itm.productId);
        const cat = scopedCategories.find((c) => c.id === prod?.categoryId);
        const catId = cat?.id || 'other';
        const catName = cat ? (language === 'fr' ? cat.nameFr : cat.name) : 'Autres';
        const curr = catMap.get(catId) || { categoryId: catId, categoryName: catName, revenue: 0, quantity: 0 };
        curr.revenue += itm.totalPrice;
        curr.quantity += itm.quantity;
        catMap.set(catId, curr);
      }
    }

    // Hourly heatmap
    const hourMap = new Array(24).fill(0).map((_, h) => ({ hour: h, orderCount: 0, revenue: 0 }));
    for (const ord of completed) {
      const h = new Date(ord.createdAt).getHours();
      if (hourMap[h]) {
        hourMap[h].orderCount += 1;
        hourMap[h].revenue += ord.totalAmount;
      }
    }

    // Top dishes
    const dishMap = new Map<string, { productId: string; productName: string; quantity: number; revenue: number }>();
    for (const ord of completed) {
      for (const itm of ord.items) {
        const curr = dishMap.get(itm.productId) || { productId: itm.productId, productName: itm.name, quantity: 0, revenue: 0 };
        curr.quantity += itm.quantity;
        curr.revenue += itm.totalPrice;
        dishMap.set(itm.productId, curr);
      }
    }
    const dishes = Array.from(dishMap.values());
    const topDishesByQuantity = [...dishes].sort((a, b) => b.quantity - a.quantity).slice(0, 5);
    const topDishesByRevenue = [...dishes].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    // Staff attendance
    const dayShifts = scopedStaffShifts.filter((s) => s.date === targetDate);
    const staffAttendance = dayShifts.map((s) => ({
      staffName: s.userName,
      role: s.userRole,
      clockIn: new Date(s.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      clockOut: s.clockOut ? new Date(s.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
      durationHours: s.totalMinutes ? Math.round((s.totalMinutes / 60) * 10) / 10 : 0,
    }));

    return {
      orgId: currentOrgId,
      reportDate: targetDate,
      openingTime: '10:00',
      closingTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      closedBy: `${state.currentUser.name} (${state.currentUser.role})`,
      grossRevenue,
      discountsTotal,
      refundsTotal,
      netRevenue,
      taxTotal,
      totalOrders: dayOrders.length,
      completedOrders: completed.length,
      cancelledOrders: cancelled.length,
      averageOrderValue,
      paymentBreakdown,
      categoryBreakdown: Array.from(catMap.values()),
      hourlyHeatmap: hourMap.filter((h) => h.orderCount > 0),
      topDishesByQuantity,
      topDishesByRevenue,
      staffAttendance,
      cashDrawerStarting: 50000,
      cashDrawerActual: 50000 + paymentBreakdown.cash,
      cashDiscrepancy: 0,
      notes: '',
    };
  };

  const performDailyClosing = (closingData: {
    cashDrawerStarting: number;
    cashDrawerActual: number;
    notes?: string;
    openingTime?: string;
    closingTime?: string;
  }): DailyZReport => {
    const generated = generateZReportData();
    const cashSales = generated.paymentBreakdown.cash;
    const expectedCash = closingData.cashDrawerStarting + cashSales;
    const discrepancy = closingData.cashDrawerActual - expectedCash;

    const newReport: DailyZReport = {
      ...generated,
      id: `zrep_${Date.now()}`,
      createdAt: new Date().toISOString(),
      openingTime: closingData.openingTime || generated.openingTime,
      closingTime: closingData.closingTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cashDrawerStarting: closingData.cashDrawerStarting,
      cashDrawerActual: closingData.cashDrawerActual,
      cashDiscrepancy: discrepancy,
      notes: closingData.notes || '',
    };

    setState((prev) => ({
      ...prev,
      dailyZReports: [newReport, ...(prev.dailyZReports || [])],
      auditLogs: [
        {
          id: `log_${Date.now()}`,
          orgId: currentOrgId,
          actorName: prev.currentUser.name,
          action: 'Clôture de journée (Rapport Z)',
          details: `Net: ${newReport.netRevenue} XAF | Écart caisse: ${discrepancy} XAF`,
          createdAt: new Date().toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));

    return newReport;
  };

  return (
    <RestaurantContext.Provider
      value={{
        state,
        language,
        setLanguage,
        theme,
        setTheme,
        effectiveTheme,
        activeView,
        setActiveView,
        navigateTo,
        activeLocation,
        setActiveLocationId,
        currentUser: state.currentUser,
        switchUserRole,

        // Multi-Restaurant
        activeOrganization,
        userOrganizations,
        switchOrganization,
        createOrganization,
        updateOrganization,
        archiveOrganization,
        deleteOrganization,

        // Authentication
        isAuthenticated: state.isAuthenticated,
        login,
        loginDemo,
        register,
        logout,

        // Scoped Data
        scopedProducts,
        scopedOrders,
        scopedTables,
        scopedInventory,
        scopedCategories,
        scopedRecipes,
        scopedReservations,
        scopedCustomers,
        scopedAuditLogs,
        scopedLocations,
        scopedReviews,
        scopedInternalNotes,
        scopedStaffShifts,
        scopedDailyZReports,
        scopedExpenses,
        getPlanEntitlements,
        addExpense,
        deleteExpense,

        // Profile & Vitrine
        updateOrganizationProfile,
        addGalleryImage,
        removeGalleryImage,
        reorderGalleryImages,

        // Customer Reviews
        addCustomerReview,
        updateReviewStatus,
        replyToReview,

        // Internal Staff Notes
        addInternalNote,
        togglePinNote,
        deleteInternalNote,

        // Staff Attendance
        clockInStaff,
        clockOutStaff,

        // Daily Activity & Z-Report
        generateZReportData,
        performDailyClosing,

        // Public Storefront & Preview Isolation
        publicPreviewMode,
        publicTableParam,
        publicUrlInvalidSlug,
        openPublicStorefront,
        exitPublicPreview,
        checkReservationAvailability,

        // Business logic
        createOrder,
        updateOrderStatus,
        recordOrderPayment,
        updateTableStatus,
        transferTableOrder,
        addInventoryMovement,
        createReservation,
        updateReservationStatus,
        createProduct,
        updateProduct,
        deleteProduct,
        toggleProductAvailability,
        createCategory,
        createInventoryItem,
        updateCurrentUser,
        recordBillingTransaction,
        updateOrganizationSettings,
        completeOnboarding,
        resetToDemo,
        addAuditLog,

        // Staff Invitations
        createStaffInvitation,
        revokeStaffInvitation,
        acceptStaffInvitation,

        // Support Tickets
        submitSupportTicket,
        updateSupportTicketStatus,

        // SuperAdmin Platform Operations
        updateSubscriptionPlanPrice,
        updateSubscriptionPlan,
        approveBillingTransaction,
        rejectBillingTransaction,
        updateUserRole,
        updatePlatformSettings,
        toggleRestaurantStatus,
        extendTrialDays,
        activateSubscriptionManually,
        populateStarterMenu,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};
