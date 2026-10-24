import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import {
  Database,
  ShieldCheck,
  Key,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Layers,
  Server,
} from 'lucide-react';

export const SupabaseSchemaModal: React.FC = () => {
  const { state, language } = useRestaurant();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'schema' | 'rls' | 'guide'>('overview');

  const supabaseDdlScript = `-- ====================================================================
-- RESTAURANTOS: COMPLETE MULTI-TENANT POSTGRESQL SCHEMA WITH RLS
-- Developed & Architected by DATA WORK AGENCY
-- Target: Supabase / PostgreSQL 15+
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ORGANIZATIONS (TENANTS)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    type VARCHAR(50) DEFAULT 'gastronomic',
    country VARCHAR(100) DEFAULT 'Cameroun',
    city VARCHAR(100) DEFAULT 'Douala',
    currency VARCHAR(10) DEFAULT 'XAF',
    tax_rate NUMERIC(5,2) DEFAULT 19.25,
    subscription_plan VARCHAR(50) DEFAULT 'business',
    subscription_status VARCHAR(50) DEFAULT 'trial',
    trial_ends_at TIMESTAMPTZ,
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RESTAURANT LOCATIONS
CREATE TABLE restaurant_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    is_primary BOOLEAN DEFAULT FALSE,
    table_count INT DEFAULT 12,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PROFILES & USERS
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    location_id UUID REFERENCES restaurant_locations(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'manager', 'cashier', 'server', 'kitchen', 'inventory', 'platform_admin')),
    pin_code VARCHAR(10),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CATEGORIES
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    name_fr VARCHAR(255) NOT NULL,
    icon_name VARCHAR(50) DEFAULT 'Utensils',
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PRODUCTS
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    name_fr VARCHAR(255) NOT NULL,
    description TEXT,
    description_fr TEXT,
    price NUMERIC(12,2) NOT NULL,
    cost_price NUMERIC(12,2) DEFAULT 0,
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    prep_time_minutes INT DEFAULT 15,
    allergens TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. INVENTORY ITEMS (STOCKS)
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    current_stock NUMERIC(12,3) NOT NULL DEFAULT 0,
    unit VARCHAR(20) NOT NULL,
    min_threshold NUMERIC(12,3) NOT NULL DEFAULT 5,
    cost_per_unit NUMERIC(12,2) NOT NULL DEFAULT 0,
    supplier VARCHAR(255),
    supplier_contact VARCHAR(100),
    last_restocked_at DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, sku)
);

-- 8. RECIPES & RECIPE ITEMS
CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    yield_portions INT DEFAULT 1,
    preparation_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE recipe_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
    quantity NUMERIC(10,3) NOT NULL,
    unit VARCHAR(20) NOT NULL
);

-- 9. TABLES & FLOOR PLAN
CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES restaurant_locations(id) ON DELETE CASCADE,
    number VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    capacity INT DEFAULT 4,
    area VARCHAR(50) DEFAULT 'main_hall',
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'cleaning', 'out_of_service')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ORDERS & ORDER ITEMS
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES restaurant_locations(id) ON DELETE CASCADE,
    order_number VARCHAR(50) NOT NULL,
    table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
    type VARCHAR(30) DEFAULT 'dine_in' CHECK (type IN ('dine_in', 'takeaway', 'delivery')),
    status VARCHAR(30) DEFAULT 'confirmed' CHECK (status IN ('draft', 'pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled')),
    payment_status VARCHAR(30) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
    payment_method VARCHAR(30) CHECK (payment_method IN ('cash', 'card', 'mobile_money')),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(50),
    subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(12,2) NOT NULL,
    total_price NUMERIC(12,2) NOT NULL,
    selected_variant VARCHAR(100),
    selected_extras TEXT[],
    notes TEXT
);

-- 11. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's organization_id from profiles
CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
    SELECT organization_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Enforce strict tenant isolation: users only see their own organization's records
CREATE POLICY "Tenant Isolation: Organizations" ON organizations
    FOR ALL USING (id = get_user_org_id());

CREATE POLICY "Tenant Isolation: Products" ON products
    FOR ALL USING (organization_id = get_user_org_id());

CREATE POLICY "Tenant Isolation: Orders" ON orders
    FOR ALL USING (organization_id = get_user_org_id());

CREATE POLICY "Tenant Isolation: Inventory" ON inventory_items
    FOR ALL USING (organization_id = get_user_org_id());

CREATE POLICY "Tenant Isolation: Tables" ON tables
    FOR ALL USING (organization_id = get_user_org_id());
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(supabaseDdlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Architecture Supabase & PostgreSQL RLS
            </h1>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded">
              Spécification Technique Officielle
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Schéma relationnel complet, Row Level Security (RLS) multi-tenant et guide de raccordement
          </p>
        </div>

        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Script SQL copié !' : 'Copier le script SQL DDL'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activeTab === 'overview' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
          }`}
        >
          Vue d’ensemble & RLS
        </button>
        <button
          onClick={() => setActiveTab('schema')}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activeTab === 'schema' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
          }`}
        >
          Script SQL PostgreSQL (27 tables)
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activeTab === 'guide' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600'
          }`}
        >
          Guide de Connexion Supabase
        </button>
      </div>

      {/* TAB 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Isolation Multi-Tenant Stricte</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Chaque table contient une clé étrangère <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">organization_id</code>. Les politiques PostgreSQL RLS interdisent formellement à un restaurant d'accéder aux données d'un autre établissement.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Sécurité & Privilèges Serveur</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Les clés API secrètes (Service Role & Gemini) ne sont jamais exposées au navigateur. Les transactions financières et l'intelligence artificielle transitent par des routes backend sécurisées.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Architecture Modulaire Évolutive</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Développé par DATA WORK AGENCY pour soutenir l'expansion du marché camerounais (XAF) vers l'Afrique centrale, l'Europe et l'international avec gestion multi-devises et multi-sites.
              </p>
            </div>
          </div>

          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
            <Key className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Statut Actuel de l'Environnement</span>
              <p className="mt-0.5 text-amber-800 leading-relaxed">
                L'application fonctionne actuellement avec une couche de persistance locale isolée par tenant (LocalStorage & Mock State) permettant une exécution immédiate sans configuration préalable. Pour brancher votre instance Cloud Supabase de production, suivez les étapes du guide ci-dessous.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SQL DDL */}
      {activeTab === 'schema' && (
        <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-xs">
            <span className="font-mono text-slate-400">schema_restaurantos_v1.sql</span>
            <button
              onClick={copyToClipboard}
              className="text-amber-400 hover:text-amber-300 font-semibold"
            >
              {copied ? 'Copié !' : 'Copier tout le SQL'}
            </button>
          </div>
          <pre className="font-mono text-xs text-slate-300 overflow-x-auto p-2 leading-relaxed max-h-[500px]">
            {supabaseDdlScript}
          </pre>
        </div>
      )}

      {/* TAB 3: Guide */}
      {activeTab === 'guide' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 text-xs text-slate-700">
          <h2 className="font-bold text-sm text-slate-900">
            Étapes de Déploiement vers Supabase Production
          </h2>

          <ol className="list-decimal list-inside space-y-3 leading-relaxed">
            <li>
              <strong>Créer un projet Supabase</strong> : Rendez-vous sur <code className="bg-slate-100 px-1 py-0.5 rounded">supabase.com</code> et créez un nouveau projet (région Frankfurt ou Paris pour l'Afrique/Europe).
            </li>
            <li>
              <strong>Exécuter le script SQL</strong> : Ouvrez le <em>SQL Editor</em> dans votre console Supabase, collez le script DDL fourni dans l'onglet "Script SQL", puis cliquez sur <em>Run</em>.
            </li>
            <li>
              <strong>Renseigner les variables d'environnement</strong> : Ajoutez dans votre fichier <code className="bg-slate-100 px-1 py-0.5 rounded">.env</code> :
              <pre className="bg-slate-900 text-slate-200 p-3 rounded-lg font-mono text-[11px] mt-1.5">
VITE_SUPABASE_URL="https://votre-projet.supabase.co"&#10;VITE_SUPABASE_ANON_KEY="votre-anon-key-publique"&#10;SUPABASE_SERVICE_ROLE_KEY="votre-cle-service-serveur"
              </pre>
            </li>
            <li>
              <strong>Activer Supabase Auth</strong> : Activez l'authentification par email/mot de passe et éventuellement Google OAuth dans la console Supabase.
            </li>
          </ol>
        </div>
      )}
    </div>
  );
};
