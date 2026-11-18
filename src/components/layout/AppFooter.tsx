import React from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useTranslation } from '../../translations';
import { ShieldCheck } from 'lucide-react';

export const AppFooter: React.FC = () => {
  const { language, navigateTo } = useRestaurant();
  const t = useTranslation(language);

  return (
    <footer className="h-10 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 shrink-0 select-none">
      <div className="flex items-center gap-2 truncate">
        <span className="font-semibold text-slate-800 dark:text-slate-200">RestaurantOS</span>
        <span aria-hidden="true">·</span>
        <span className="text-amber-800 dark:text-amber-400 font-medium truncate">
          Une solution développée par <strong>DATA WORK AGENCY</strong>
        </span>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => navigateTo('database_schema')}
          className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="hidden sm:inline">Isolation Multi-Tenants & RLS Active</span>
        </button>
        <span aria-hidden="true" className="hidden sm:inline">·</span>
        <span className="hidden sm:inline font-mono">XAF / CEMAC</span>
      </div>
    </footer>
  );
};
