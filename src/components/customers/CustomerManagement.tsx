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
  const { scopedCustomers, activeOrganization, language } = useRestaurant();
  const t = useTranslation(language);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = scopedCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t.nav.customers} — {activeOrganization.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
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
            className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Empty State or Customer Cards Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center space-y-2 max-w-lg mx-auto">
          <Users className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {scopedCustomers.length === 0
              ? `Aucun client enregistré pour « ${activeOrganization.name} »`
              : 'Aucun client ne correspond à votre recherche'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Les fiches clients et points de fidélité apparaîtront automatiquement au fil des commandes et réservations.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3.5 hover:border-amber-300 dark:hover:border-amber-500/40 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{customer.name}</h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span className="font-mono">{customer.phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-md text-[11px] font-semibold border border-amber-200/60 dark:border-amber-500/30">
                  <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span className="font-mono tabular-nums">{customer.loyaltyPoints} pts</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Visites totales</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono tabular-nums">{customer.totalVisits} fois</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Dépenses cumulées</span>
                  <span className="font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                    {formatCurrency(customer.totalSpent, activeOrganization.currency)}
                  </span>
                </div>
              </div>

              {customer.favoriteDish && (
                <div className="text-[11px] text-slate-600 dark:text-slate-300">
                  <span className="text-slate-400">Plat favori : </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{customer.favoriteDish}</span>
                </div>
              )}

              {customer.notes && (
                <div className="text-[11px] text-slate-600 dark:text-slate-300 italic bg-amber-50/40 dark:bg-amber-950/30 p-2 rounded border border-amber-100 dark:border-amber-800/40">
                  {customer.notes}
                </div>
              )}

              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span>Dernière visite: {customer.lastVisitAt}</span>
                <span className="text-amber-700 dark:text-amber-400 font-medium">Profil Actif</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
