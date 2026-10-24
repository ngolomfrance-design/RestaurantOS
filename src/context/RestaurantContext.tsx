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
} from '../types/restaurant';

export type AppView =
  | 'marketing'
  | 'login'
  | 'register'
  | 'onboarding'
  | 'restaurants'
  | 'profile'
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

  // Business logic actions
  createOrder: (orderData: Partial<Order>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  recordOrderPayment: (orderId: string, method: PaymentMethod, provider?: any) => void;
  updateTableStatus: (tableId: string, status: TableStatus, currentOrderId?: string, guestName?: string) => void;
  transferTableOrder: (fromTableId: string, toTableId: string) => boolean;
  addInventoryMovement: (itemId: string, type: 'purchase' | 'usage' | 'waste' | 'adjustment', quantity: number, reason: string) => void;
  createReservation: (res: Omit<Reservation, 'id' | 'createdAt' | 'orgId' | 'locationId'>) => void;
  updateReservationStatus: (id: string, status: Reservation['status']) => void;
  createProduct: (product: Omit<Product, 'id' | 'orgId'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleProductAvailability: (id: string) => void;
  updateOrganizationSettings: (updates: Partial<Organization>) => void;
  completeOnboarding: (orgData: Partial<Organization>, locationData: Partial<RestaurantLocation>) => void;
  resetToDemo: () => void;
  addAuditLog: (action: string, details: string) => void;

  // Staff Invitations
  createStaffInvitation: (role: UserRole, invitedName?: string, invitedEmail?: string) => StaffInvitation;
  revokeStaffInvitation: (invitationId: string) => void;
  acceptStaffInvitation: (code: string) => { success: boolean; message: string; organization?: Organization };

  // SuperAdmin Platform Operations
  updateSubscriptionPlanPrice: (planId: SubscriptionPlanId, newPriceXAF: number) => void;
  toggleRestaurantStatus: (orgId: string) => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export const RestaurantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<DatabaseState>(() => loadDatabaseState());
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('restaurantos_lang') as Language) || 'fr';
  });

  // Read initial view from URL path
  const [activeView, setActiveViewState] = useState<AppView>(() => {
    if (typeof window !== 'undefined') {
      const initialFromUrl = getViewFromPath(window.location.pathname);
      return initialFromUrl;
    }
    return 'marketing';
  });

  // Save state on any update
  useEffect(() => {
    saveDatabaseState(state);
  }, [state]);

  // Handle browser Back / Forward buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      const targetView = getViewFromPath(window.location.pathname);
      setActiveViewState(targetView);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ view: targetView }, '', targetPath);
      }
    }
  };

  const setActiveView = (view: AppView) => {
    navigateTo(view);
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
      trialEndsAt: new Date(Date.now() + 14 * 86400000).toISOString(),
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
    // Find matching profile or create session
    const existingProfile = INITIAL_PROFILES.find((p) => p.email.toLowerCase() === email.toLowerCase());

    const user: DatabaseState['currentUser'] = existingProfile || {
      id: `usr_${Date.now()}`,
      name: email.split('@')[0],
      email,
      role: 'owner',
      organizationIds: [],
    };

    setState((prev) => ({
      ...prev,
      isAuthenticated: true,
      currentUser: user,
    }));

    // Check user's restaurants
    const availableOrgs = state.organizations.filter(
      (o) =>
        o.status !== 'archived' &&
        (o.ownerId === user.id || user.organizationIds?.includes(o.id) || o.isDemo)
    );

    if (availableOrgs.length === 0) {
      navigateTo('onboarding');
    } else {
      switchOrganization(availableOrgs[0].id);
      navigateTo('dashboard');
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
    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber,
      orgId: activeOrganization.id,
      locationId: state.activeLocationId,
      tableId: orderData.tableId,
      tableName: orderData.tableName,
      type: orderData.type || 'dine_in',
      status: 'confirmed',
      paymentStatus: orderData.paymentStatus || 'unpaid',
      paymentMethod: orderData.paymentMethod,
      customerName:
        orderData.customerName ||
        (orderData.tableId ? `Client ${orderData.tableName || ''}` : 'Client Comptoir'),
      customerPhone: orderData.customerPhone,
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      taxAmount: orderData.taxAmount || 0,
      discountAmount: orderData.discountAmount || 0,
      totalAmount: orderData.totalAmount || 0,
      notes: orderData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: state.currentUser.name,
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

  const createReservation = (
    res: Omit<Reservation, 'id' | 'createdAt' | 'orgId' | 'locationId'>
  ) => {
    const newReservation: Reservation = {
      ...res,
      id: `res_${Date.now()}`,
      orgId: activeOrganization.id,
      locationId: state.activeLocationId,
      createdAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      reservations: [newReservation, ...prev.reservations],
      auditLogs: [
        {
          id: `log_${Date.now()}`,
          orgId: activeOrganization.id,
          actorName: prev.currentUser.name,
          action: 'Nouvelle réservation',
          details: `Réservation pour ${newReservation.customerName} (${newReservation.guestCount} personnes, table ${newReservation.tableName || ''})`,
          createdAt: new Date().toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));
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

  return (
    <RestaurantContext.Provider
      value={{
        state,
        language,
        setLanguage,
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
        updateOrganizationSettings,
        completeOnboarding,
        resetToDemo,
        addAuditLog,

        // Staff Invitations
        createStaffInvitation,
        revokeStaffInvitation,
        acceptStaffInvitation,

        // SuperAdmin Platform Operations
        updateSubscriptionPlanPrice,
        toggleRestaurantStatus,
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
