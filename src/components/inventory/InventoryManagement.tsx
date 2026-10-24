import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useTranslation } from '../../translations';
import { formatCurrency } from '../../utils/formatters';
import { InventoryItem } from '../../types/restaurant';
import {
  Boxes,
  Plus,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Search,
  Truck,
  FileSpreadsheet,
  X,
  CheckCircle2,
} from 'lucide-react';

export const InventoryManagement: React.FC = () => {
  const { state, language, addInventoryMovement } = useRestaurant();
  const t = useTranslation(language);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [movementModalItem, setMovementModalItem] = useState<InventoryItem | null>(null);
  const [movementType, setMovementType] = useState<'purchase' | 'waste' | 'adjustment'>('purchase');
  const [movementQuantity, setMovementQuantity] = useState<number>(5);
  const [movementReason, setMovementReason] = useState<string>('Livraison fournisseur conforme');

  const categories = ['all', 'Poissons & Fruits de Mer', 'Viandes & Volailles', 'Légumes & Tubercules', 'Épicerie & Condiments', 'Cave & Alcools'];

  const filteredItems = state.inventory.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const lowStockItems = state.inventory.filter((i) => i.currentStock <= i.minThreshold);
  const totalStockValuation = state.inventory.reduce(
    (sum, i) => sum + i.currentStock * i.costPerUnit,
    0
  );

  const handleApplyMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementModalItem || movementQuantity <= 0) return;

    addInventoryMovement(
      movementModalItem.id,
      movementType,
      Number(movementQuantity),
      movementReason
    );

    setMovementModalItem(null);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title & Fast Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            {t.inventory.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {state.organization.name} · {t.inventory.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs">
            <div className="text-[10px] text-slate-400 font-medium">{t.inventory.stockValuation}</div>
            <div className="text-sm font-bold text-slate-900 font-mono tabular-nums">
              {formatCurrency(totalStockValuation, state.organization.currency)}
            </div>
          </div>
        </div>
      </div>

      {/* Critical Stock Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <div className="font-bold text-rose-900">
                {lowStockItems.length} {t.inventory.lowStockItemsCount}
              </div>
              <div className="text-rose-700 text-[11px] mt-0.5">
                {lowStockItems.map((i) => `${i.name} (${i.currentStock} ${i.unit})`).join(', ')}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (lowStockItems[0]) {
                setMovementModalItem(lowStockItems[0]);
                setMovementType('purchase');
                setMovementQuantity(10);
                setMovementReason('Réapprovisionnement d’urgence');
              }
            }}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shrink-0 transition-colors"
          >
            Réapprovisionner le stock critique
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat === 'all' ? 'Toutes les catégories' : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom, SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-semibold">
                <th className="py-3 px-4">Ingrédient & Référence</th>
                <th className="py-3 px-3">Catégorie</th>
                <th className="py-3 px-3 text-right">Stock Actuel</th>
                <th className="py-3 px-3 text-right">Seuil Critique</th>
                <th className="py-3 px-3 text-right">Coût Unitaire</th>
                <th className="py-3 px-3">Fournisseur Habituel</th>
                <th className="py-3 px-3 text-center">État Stock</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => {
                const isCritical = item.currentStock <= item.minThreshold;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{item.sku}</div>
                    </td>

                    <td className="py-3 px-3 text-slate-600">{item.category}</td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-sm tabular-nums">
                      <span className={isCritical ? 'text-rose-600' : 'text-slate-900'}>
                        {item.currentStock} {item.unit}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-400 tabular-nums">
                      {item.minThreshold} {item.unit}
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-700 tabular-nums">
                      {formatCurrency(item.costPerUnit, state.organization.currency)} / {item.unit}
                    </td>

                    <td className="py-3 px-3 text-slate-600">
                      <div>{item.supplier}</div>
                      {item.supplierContact && (
                        <div className="text-[11px] text-slate-400 font-mono">{item.supplierContact}</div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          isCritical
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {isCritical ? 'Stock critique' : 'Normal'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setMovementModalItem(item);
                            setMovementType('purchase');
                            setMovementQuantity(5);
                            setMovementReason('Réception livraison');
                          }}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-medium transition-colors"
                        >
                          + Entrée
                        </button>
                        <button
                          onClick={() => {
                            setMovementModalItem(item);
                            setMovementType('waste');
                            setMovementQuantity(1);
                            setMovementReason('Perte / Casse / Avarie');
                          }}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-[11px] font-medium transition-colors"
                        >
                          Perte
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Record Stock Movement */}
      {movementModalItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Mouvement de Stock</h3>
                <div className="text-xs text-slate-500">{movementModalItem.name}</div>
              </div>
              <button onClick={() => setMovementModalItem(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyMovement} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 block">Type d’opération</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMovementType('purchase');
                      setMovementReason('Réception fournisseur conforme');
                    }}
                    className={`p-2 rounded-lg border text-center transition-colors ${
                      movementType === 'purchase'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Entrée / Achat
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMovementType('waste');
                      setMovementReason('Pertes cuisine / date dépassée');
                    }}
                    className={`p-2 rounded-lg border text-center transition-colors ${
                      movementType === 'waste'
                        ? 'border-rose-500 bg-rose-50 text-rose-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Perte / Casse
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMovementType('adjustment');
                      setMovementReason('Ajustement inventaire physique');
                    }}
                    className={`p-2 rounded-lg border text-center transition-colors ${
                      movementType === 'adjustment'
                        ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Ajustement
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Quantité ({movementModalItem.unit}) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={movementQuantity}
                  onChange={(e) => setMovementQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Motif / Justification</label>
                <input
                  type="text"
                  required
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-slate-600 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span>Stock actuel :</span>
                  <span className="font-mono font-semibold">{movementModalItem.currentStock} {movementModalItem.unit}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Nouveau stock estimé :</span>
                  <span className="font-mono text-amber-700">
                    {movementType === 'purchase'
                      ? movementModalItem.currentStock + Number(movementQuantity)
                      : Math.max(0, movementModalItem.currentStock - Number(movementQuantity))}{' '}
                    {movementModalItem.unit}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMovementModalItem(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-colors"
                >
                  Valider le mouvement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
