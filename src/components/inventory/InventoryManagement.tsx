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
  const {
    scopedInventory,
    activeOrganization,
    language,
    addInventoryMovement,
    createInventoryItem,
  } = useRestaurant();
  const t = useTranslation(language);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [movementModalItem, setMovementModalItem] = useState<InventoryItem | null>(null);
  const [movementType, setMovementType] = useState<'purchase' | 'waste' | 'adjustment'>('purchase');
  const [movementQuantity, setMovementQuantity] = useState<number>(5);
  const [movementReason, setMovementReason] = useState<string>('Livraison fournisseur conforme');

  // Create new ingredient modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newItemForm, setNewItemForm] = useState({
    name: '',
    sku: `ING-${Math.floor(100 + Math.random() * 900)}`,
    category: 'Poissons & Fruits de Mer',
    currentStock: 10,
    unit: 'kg' as InventoryItem['unit'],
    minThreshold: 5,
    costPerUnit: 2500,
    supplier: 'Marché Central',
    supplierContact: '',
  });

  const categories = ['all', 'Poissons & Fruits de Mer', 'Viandes & Volailles', 'Légumes & Tubercules', 'Épicerie & Condiments', 'Cave & Alcools'];

  const filteredItems = scopedInventory.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const lowStockItems = scopedInventory.filter((i) => i.currentStock <= i.minThreshold);
  const totalStockValuation = scopedInventory.reduce(
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

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemForm.name.trim()) return;
    createInventoryItem({
      name: newItemForm.name.trim(),
      sku: newItemForm.sku.trim() || `ING-${Date.now().toString().slice(-4)}`,
      category: newItemForm.category,
      currentStock: Number(newItemForm.currentStock),
      unit: newItemForm.unit,
      minThreshold: Number(newItemForm.minThreshold),
      costPerUnit: Number(newItemForm.costPerUnit),
      supplier: newItemForm.supplier.trim() || 'Fournisseur Local',
      supplierContact: newItemForm.supplierContact.trim() || undefined,
    });
    setShowCreateModal(false);
    setNewItemForm({
      name: '',
      sku: `ING-${Math.floor(100 + Math.random() * 900)}`,
      category: 'Poissons & Fruits de Mer',
      currentStock: 10,
      unit: 'kg',
      minThreshold: 5,
      costPerUnit: 2500,
      supplier: 'Marché Central',
      supplierContact: '',
    });
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title & Fast Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t.inventory.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {activeOrganization.name} · {t.inventory.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-xl shadow-2xs">
            <div className="text-[10px] text-slate-400 font-medium">{t.inventory.stockValuation}</div>
            <div className="text-sm font-bold text-slate-900 dark:text-white font-mono tabular-nums">
              {formatCurrency(totalStockValuation, activeOrganization.currency)}
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#0B192C] hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400 dark:text-slate-950" />
            <span>Nouvel ingrédient</span>
          </button>
        </div>
      </div>

      {/* Critical Stock Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <div>
              <div className="font-bold text-rose-900 dark:text-rose-200">
                {lowStockItems.length} {t.inventory.lowStockItemsCount}
              </div>
              <div className="text-rose-700 dark:text-rose-300 text-[11px] mt-0.5">
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
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shrink-0 transition-colors cursor-pointer"
          >
            Réapprovisionner le stock critique
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#0B192C] dark:bg-amber-500 text-white dark:text-slate-950 font-semibold'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
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
            className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Empty State vs Table */}
      {scopedInventory.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-10 text-center space-y-3 max-w-lg mx-auto">
          <Boxes className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Aucun ingrédient enregistré pour « {activeOrganization.name} »
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Ajoutez vos matières premières et boissons pour suivre automatiquement vos stocks et marges.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            + Créer mon premier ingrédient
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 text-slate-400 font-semibold">
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
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredItems.map((item) => {
                  const isCritical = item.currentStock <= item.minThreshold;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white">{item.name}</div>
                        <div className="text-[11px] font-mono text-slate-400">{item.sku}</div>
                      </td>

                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{item.category}</td>

                      <td className="py-3 px-3 text-right font-mono font-bold text-sm tabular-nums">
                        <span className={isCritical ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}>
                          {item.currentStock} {item.unit}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-slate-400 tabular-nums">
                        {item.minThreshold} {item.unit}
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                        {formatCurrency(item.costPerUnit, activeOrganization.currency)} / {item.unit}
                      </td>

                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        <div>{item.supplier}</div>
                        {item.supplierContact && (
                          <div className="text-[11px] text-slate-400 font-mono">{item.supplierContact}</div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            isCritical
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                              : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
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
                            className="px-2.5 py-1 bg-[#0B192C] hover:bg-slate-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-slate-950 rounded text-[11px] font-semibold transition-colors cursor-pointer"
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
                            className="px-2.5 py-1 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-700 dark:text-rose-300 rounded text-[11px] font-medium transition-colors cursor-pointer"
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
      )}

      {/* MODAL: Record Stock Movement */}
      {movementModalItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Mouvement de Stock</h3>
                <div className="text-xs text-slate-500 dark:text-slate-400">{movementModalItem.name}</div>
              </div>
              <button onClick={() => setMovementModalItem(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyMovement} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">Type d’opération</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMovementType('purchase');
                      setMovementReason('Réception fournisseur conforme');
                    }}
                    className={`p-2 rounded-lg border text-center transition-colors cursor-pointer ${
                      movementType === 'purchase'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
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
                    className={`p-2 rounded-lg border text-center transition-colors cursor-pointer ${
                      movementType === 'waste'
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-300 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
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
                    className={`p-2 rounded-lg border text-center transition-colors cursor-pointer ${
                      movementType === 'adjustment'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 font-bold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    Ajustement
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Quantité ({movementModalItem.unit}) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={movementQuantity}
                  onChange={(e) => setMovementQuantity(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Motif / Justification</label>
                <input
                  type="text"
                  required
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-slate-600 dark:text-slate-300 text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span>Stock actuel :</span>
                  <span className="font-mono font-semibold">{movementModalItem.currentStock} {movementModalItem.unit}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                  <span>Nouveau stock estimé :</span>
                  <span className="font-mono text-amber-700 dark:text-amber-400">
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
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0B192C] dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Valider le mouvement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Create New Inventory Ingredient */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Nouvel ingrédient / article</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{activeOrganization.name}</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nom de l'ingrédient *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Bar frais, Huile végétale..."
                    value={newItemForm.name}
                    onChange={(e) => setNewItemForm({ ...newItemForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">SKU</label>
                  <input
                    type="text"
                    value={newItemForm.sku}
                    onChange={(e) => setNewItemForm({ ...newItemForm, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Catégorie</label>
                  <select
                    value={newItemForm.category}
                    onChange={(e) => setNewItemForm({ ...newItemForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-amber-500"
                  >
                    {categories.filter((c) => c !== 'all').map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Unité</label>
                  <select
                    value={newItemForm.unit}
                    onChange={(e) => setNewItemForm({ ...newItemForm, unit: e.target.value as InventoryItem['unit'] })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-amber-500"
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="L">L</option>
                    <option value="cL">cL</option>
                    <option value="unit">unit</option>
                    <option value="bouteille">bouteille</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Stock initial</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={newItemForm.currentStock}
                    onChange={(e) => setNewItemForm({ ...newItemForm, currentStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Seuil alerte</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={newItemForm.minThreshold}
                    onChange={(e) => setNewItemForm({ ...newItemForm, minThreshold: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Coût unit.</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={newItemForm.costPerUnit}
                    onChange={(e) => setNewItemForm({ ...newItemForm, costPerUnit: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Fournisseur</label>
                  <input
                    type="text"
                    value={newItemForm.supplier}
                    onChange={(e) => setNewItemForm({ ...newItemForm, supplier: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Téléphone</label>
                  <input
                    type="text"
                    placeholder="+237 6..."
                    value={newItemForm.supplierContact}
                    onChange={(e) => setNewItemForm({ ...newItemForm, supplierContact: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-lg font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Enregistrer l'ingrédient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
