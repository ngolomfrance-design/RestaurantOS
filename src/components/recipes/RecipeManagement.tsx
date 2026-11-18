import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useTranslation } from '../../translations';
import { formatCurrency } from '../../utils/formatters';
import {
  Scroll,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';

export const RecipeManagement: React.FC = () => {
  const {
    scopedRecipes,
    scopedProducts,
    scopedInventory,
    activeOrganization,
    language,
    navigateTo,
  } = useRestaurant();
  const t = useTranslation(language);

  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(scopedRecipes[0]?.id || '');

  useEffect(() => {
    setSelectedRecipeId(scopedRecipes[0]?.id || '');
  }, [activeOrganization.id]);

  const activeRecipe = scopedRecipes.find((r) => r.id === selectedRecipeId) || scopedRecipes[0];
  const linkedProduct = activeRecipe
    ? scopedProducts.find((p) => p.id === activeRecipe.productId)
    : null;

  // Calculate detailed ingredient line costs
  const recipeBreakdown = activeRecipe?.items.map((ri) => {
    const invItem = scopedInventory.find((i) => i.id === ri.inventoryItemId);
    const unitCost = invItem?.costPerUnit || 0;
    const lineCost = Math.round(ri.quantity * unitCost);
    return {
      ingredientName: invItem?.name || ri.inventoryItemId,
      quantity: ri.quantity,
      unit: ri.unit,
      costPerUnit: unitCost,
      lineCost,
      supplier: invItem?.supplier || 'Marché Local',
    };
  }) || [];

  const totalCalculatedCost = recipeBreakdown.reduce((sum, b) => sum + b.lineCost, 0);
  const sellingPrice = linkedProduct?.price || 0;
  const estimatedGrossMargin = sellingPrice - totalCalculatedCost;
  const estimatedGrossMarginPct = sellingPrice > 0
    ? Math.round((estimatedGrossMargin / sellingPrice) * 100)
    : 0;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t.nav.recipes} — {activeOrganization.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'fr'
              ? 'Calcul du coût matière par portion, déduction automatique des stocks et marge brute théorique'
              : 'Food costing, theoretical ingredient consumption, and gross margin analysis'}
          </p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-xs px-3 py-2 rounded-xl border border-amber-200 dark:border-amber-800/60 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
          <span>
            {language === 'fr'
              ? 'La marge brute affichée est une estimation sur le coût matière (Food Cost), distincte du bénéfice net.'
              : 'Gross margin is estimated based strictly on ingredient food cost, excluding labor and overhead.'}
          </span>
        </div>
      </div>

      {scopedRecipes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center space-y-3 max-w-lg mx-auto">
          <Scroll className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Aucune fiche technique active pour « {activeOrganization.name} »
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configurez d'abord vos plats dans le menu et vos matières premières en économat pour suivre les coûts de revient.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => navigateTo('menu')}
              className="px-4 py-2 bg-[#0B192C] dark:bg-amber-500 text-white dark:text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
            >
              Gérer le Menu
            </button>
            <button
              onClick={() => navigateTo('inventory')}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl cursor-pointer"
            >
              Voir l'Économat
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side: Recipe Selector */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs p-4 space-y-2">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 pb-1">
              Fiches Techniques Actives ({scopedRecipes.length})
            </div>

            <div className="space-y-1">
              {scopedRecipes.map((r) => {
                const isSelected = r.id === (activeRecipe?.id || selectedRecipeId);
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRecipeId(r.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between text-xs ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-500/10 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 dark:text-white truncate">{r.productName}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {r.items.length} ingrédients · Rendement: {r.yieldPortions} portion
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'}`} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Side: Detailed Food Cost Breakdown */}
          {activeRecipe && (
            <div className="lg:col-span-2 space-y-6">
              {/* KPI Cards Strip for this dish */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Prix de vente TTC</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white font-mono tabular-nums mt-1">
                    {formatCurrency(sellingPrice, activeOrganization.currency)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Fixé sur la carte</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Coût matière calculé</div>
                  <div className="text-lg font-bold text-rose-600 dark:text-rose-400 font-mono tabular-nums mt-1">
                    {formatCurrency(totalCalculatedCost, activeOrganization.currency)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Ratio Food Cost : {sellingPrice > 0 ? Math.round((totalCalculatedCost / sellingPrice) * 100) : 0}%
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Marge brute estimée</div>
                  <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono tabular-nums mt-1">
                    {estimatedGrossMarginPct}%
                  </div>
                  <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-1">
                    +{formatCurrency(estimatedGrossMargin, activeOrganization.currency)} / portion
                  </div>
                </div>
              </div>

              {/* Ingredients Table */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      Ingrédients & Consommation par portion
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Déduit automatiquement de l'inventaire lors de la vente en caisse ou QR code
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 text-slate-400 font-semibold">
                        <th className="py-2.5 px-4">Ingrédient</th>
                        <th className="py-2.5 px-3 text-right">Quantité</th>
                        <th className="py-2.5 px-3 text-right">Prix d'Achat Unit.</th>
                        <th className="py-2.5 px-3 text-right">Coût Ligne</th>
                        <th className="py-2.5 px-4">Fournisseur</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {recipeBreakdown.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-4 font-semibold text-slate-800 dark:text-slate-200">{row.ingredientName}</td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700 dark:text-slate-300">
                            {row.quantity} {row.unit}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-500 dark:text-slate-400">
                            {formatCurrency(row.costPerUnit, activeOrganization.currency)} / {row.unit}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-white">
                            {formatCurrency(row.lineCost, activeOrganization.currency)}
                          </td>
                          <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400">{row.supplier}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Preparation Notes */}
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs text-xs space-y-2">
                <span className="font-bold text-slate-900 dark:text-white block">Protocole de préparation cuisine</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{activeRecipe.preparationNotes}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
