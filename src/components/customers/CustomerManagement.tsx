import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useTranslation } from '../../translations';
import { formatCurrency } from '../../utils/formatters';
import {
  Users,
  Search,
  Award,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  Plus,
  CreditCard,
} from 'lucide-react';

export const CustomerManagement: React.FC = () => {
  const { state, language } = useRestaurant();
  const t = useTranslation(language);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = state.customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {t.nav.customers}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'fr'
              ? 'Fichier clients, historique des dépenses et programme de fidélité'
              : 'Customer profiles, historical revenue, and loyalty point accounts'}
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom ou numéro..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => (
          <div
            key={customer.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5 hover:border-amber-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">{customer.name}</h3>
                <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span className="font-mono">{customer.phone}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full text-[11px] font-semibold border border-amber-200/60">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span className="font-mono">{customer.loyaltyPoints} pts</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Visites totales</span>
                <span className="font-bold text-slate-800 font-mono">{customer.totalVisits} fois</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Dépenses cumulées</span>
                <span className="font-bold text-slate-900 font-mono tabular-nums">
                  {formatCurrency(customer.totalSpent, state.organization.currency)}
                </span>
              </div>
            </div>

            {customer.favoriteDish && (
              <div className="text-[11px] text-slate-600">
                <span className="text-slate-400">Plat favori : </span>
                <span className="font-semibold text-slate-800">{customer.favoriteDish}</span>
              </div>
            )}

            {customer.notes && (
              <div className="text-[11px] text-slate-600 italic bg-amber-50/40 p-2 rounded border border-amber-100">
                {customer.notes}
              </div>
            )}

            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 flex items-center justify-between">
              <span>Dernière visite: {customer.lastVisitAt}</span>
              <span className="text-amber-700 font-medium">Profil Actif</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
