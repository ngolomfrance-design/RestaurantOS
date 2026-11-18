import React, { useState, useRef, useEffect } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useTranslation } from '../../translations';
import { Product } from '../../types/restaurant';
import { formatCurrency } from '../../utils/formatters';
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  Sparkles,
  X,
  AlertCircle,
  TrendingUp,
  Upload,
  LayoutGrid,
  List,
  FolderPlus,
  ArrowUpDown,
} from 'lucide-react';

export const MenuManagement: React.FC = () => {
  const {
    activeOrganization,
    scopedProducts,
    scopedCategories,
    language,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductAvailability,
    createCategory,
    openPublicStorefront,
    currentUser,
    populateStarterMenu,
  } = useRestaurant();
  const t = useTranslation(language);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'priceAsc' | 'priceDesc'>('name');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State for Dish
  const [formData, setFormData] = useState({
    name: '',
    nameFr: '',
    description: '',
    descriptionFr: '',
    price: 3500,
    costPrice: 1200,
    sku: '',
    categoryId: scopedCategories[0]?.id || '',
    image: '/src/assets/images/dish_grilled_fish_1792835864516.jpg',
    prepTimeMinutes: 15,
    isAvailable: true,
    allergens: '',
  });

  const [imagePreview, setImagePreview] = useState<string>('/src/assets/images/dish_grilled_fish_1792835864516.jpg');

  useEffect(() => {
    setSelectedCategory('all');
    setFormData((prev) => ({
      ...prev,
      categoryId: scopedCategories[0]?.id || '',
    }));
  }, [activeOrganization.id]);

  // Filter & Sort Products
  let processedProducts = scopedProducts.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (sortBy === 'priceAsc') {
    processedProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'priceDesc') {
    processedProducts.sort((a, b) => b.price - a.price);
  } else {
    processedProducts.sort((a, b) => a.name.localeCompare(b.name));
  }

  const showNotification = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      nameFr: '',
      description: '',
      descriptionFr: '',
      price: 3500,
      costPrice: 1200,
      sku: `PLT-${Math.floor(100 + Math.random() * 900)}`,
      categoryId: scopedCategories[0]?.id || '',
      image: '/src/assets/images/dish_grilled_fish_1792835864516.jpg',
      prepTimeMinutes: 15,
      isAvailable: true,
      allergens: '',
    });
    setImagePreview('/src/assets/images/dish_grilled_fish_1792835864516.jpg');
    setImageUploadError(null);
    setShowProductModal(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      nameFr: product.nameFr || product.name,
      description: product.description,
      descriptionFr: product.descriptionFr || product.description,
      price: product.price,
      costPrice: product.costPrice || 0,
      sku: product.sku || '',
      categoryId: product.categoryId,
      image: product.image,
      prepTimeMinutes: product.prepTimeMinutes || 15,
      isAvailable: product.isAvailable,
      allergens: (product.allergens || []).join(', '),
    });
    setImagePreview(product.image);
    setImageUploadError(null);
    setShowProductModal(true);
  };

  // Image Upload handler with FileReader
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageUploadError(null);
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setImageUploadError(
          language === 'fr' ? 'La photo ne doit pas dépasser 5 Mo.' : 'Image size must be under 5MB.'
        );
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setImagePreview(base64);
        setFormData((prev) => ({ ...prev, image: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const allergensList = formData.allergens
      ? formData.allergens.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formData.name.trim(),
        nameFr: formData.name.trim(),
        description: formData.description.trim(),
        descriptionFr: formData.description.trim(),
        price: Number(formData.price),
        costPrice: Number(formData.costPrice || 0),
        sku: formData.sku.trim(),
        categoryId: formData.categoryId,
        image: formData.image,
        prepTimeMinutes: Number(formData.prepTimeMinutes),
        isAvailable: formData.isAvailable,
        allergens: allergensList,
      });
      showNotification(`Plat « ${formData.name} » mis à jour avec succès.`);
    } else {
      createProduct({
        categoryId: formData.categoryId || scopedCategories[0]?.id || `cat_${Date.now()}`,
        name: formData.name.trim(),
        nameFr: formData.name.trim(),
        description: formData.description.trim(),
        descriptionFr: formData.description.trim(),
        price: Number(formData.price),
        costPrice: Number(formData.costPrice || 0),
        sku: formData.sku.trim(),
        image: formData.image,
        prepTimeMinutes: Number(formData.prepTimeMinutes),
        isAvailable: formData.isAvailable,
        allergens: allergensList,
      });
      showNotification(`Nouveau plat « ${formData.name} » ajouté à la carte.`);
    }

    setShowProductModal(false);
  };

  const handleDuplicateProduct = (product: Product) => {
    createProduct({
      categoryId: product.categoryId,
      name: `${product.name} (Copie)`,
      nameFr: `${product.name} (Copie)`,
      description: product.description,
      descriptionFr: product.description,
      price: product.price,
      costPrice: product.costPrice,
      sku: `${product.sku || 'PLT'}-DUP`,
      image: product.image,
      prepTimeMinutes: product.prepTimeMinutes,
      isAvailable: product.isAvailable,
      allergens: product.allergens || [],
    });
    showNotification(`Plat « ${product.name} » dupliqué avec succès.`);
  };

  const handleDeleteProduct = (id: string) => {
    deleteProduct(id);
    setDeleteConfirmId(null);
    showNotification('Plat supprimé du menu.');
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    const newCat = createCategory(newCategoryName.trim());
    setNewCategoryName('');
    setShowCategoryModal(false);
    showNotification(`Catégorie « ${newCat.name} » créée.`);
  };

  // Estimated gross margin computation for active product
  const estimatedMargin = Math.max(0, formData.price - (formData.costPrice || 0));
  const estimatedMarginPct = formData.price > 0 ? Math.round((estimatedMargin / formData.price) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-20 right-6 z-50 p-3.5 bg-emerald-600 text-white rounded-xl shadow-lg text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Carte & Menu du Restaurant
            </h1>
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
              {activeOrganization.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gérez vos plats, vos prix en {activeOrganization.currency}, vos photos, disponibilités et calculez vos marges réelles.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          <button
            onClick={() => openPublicStorefront(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">Voir comme un client (Menu & QR)</span>
            <span className="sm:hidden">Voir Client</span>
          </button>

          <button
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <FolderPlus className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>+ Catégorie</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white dark:text-slate-950 bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4 text-amber-400 dark:text-slate-950" />
            <span>Ajouter un plat</span>
          </button>
        </div>
      </div>

      {/* Filter, Search & Layout Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, ingrédient ou référence SKU..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-amber-400"
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
            <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-700 dark:text-slate-200 font-medium"
              >
                <option value="name">Trier par nom (A-Z)</option>
                <option value="priceAsc">Prix croissant</option>
                <option value="priceDesc">Prix décroissant</option>
              </select>
            </div>

            <div className="hidden sm:flex items-center border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 bg-slate-50 dark:bg-slate-800">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-md cursor-pointer ${viewMode === 'cards' ? 'bg-white dark:bg-slate-900 shadow-2xs text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'}`}
                title="Affichage en cartes"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md cursor-pointer ${viewMode === 'table' ? 'bg-white dark:bg-slate-900 shadow-2xs text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'}`}
                title="Affichage en tableau détaillé"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 font-bold'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            Tous les plats (<span className="tabular-nums">{scopedProducts.length}</span>)
          </button>

          {scopedCategories.map((cat) => {
            const count = scopedProducts.filter((p) => p.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{cat.nameFr || cat.name}</span>
                <span className="ml-1 text-[11px] opacity-70 tabular-nums">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* EMPTY STATES OR PRODUCT LIST */}
      {scopedProducts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Votre carte est actuellement vide</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Vous n'avez pas encore ajouté de plat ou de boisson pour « {activeOrganization.name} ». Vous pouvez créer vos plats personnalisés ou importer des suggestions types pour démarrer immédiatement.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
            <button
              onClick={handleOpenCreateModal}
              className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Ajouter mon premier plat</span>
            </button>
            <button
              onClick={() => {
                populateStarterMenu(activeOrganization.id);
                showNotification('Suggestions de plats types chargées avec succès !');
              }}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Charger des suggestions types</span>
            </button>
          </div>
        </div>
      ) : processedProducts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center max-w-md mx-auto space-y-3">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-xs text-slate-600 dark:text-slate-300">Aucun plat ne correspond à vos filtres actuels.</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg cursor-pointer"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {processedProducts.map((product) => {
            const margin = Math.max(0, product.price - (product.costPrice || 0));
            const marginPct = product.price > 0 ? Math.round((margin / product.price) * 100) : 0;
            const categoryObj = scopedCategories.find((c) => c.id === product.categoryId);

            return (
              <div
                key={product.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between ${
                  !product.isAvailable ? 'opacity-65 bg-slate-50 dark:bg-slate-900/60' : ''
                }`}
              >
                <div>
                  <div className="relative h-44 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <img
                      src={product.image || '/src/assets/images/dish_grilled_fish_1792835864516.jpg'}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = '/src/assets/images/dish_grilled_fish_1792835864516.jpg';
                      }}
                      className="w-full h-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => toggleProductAvailability(product.id)}
                      className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md cursor-pointer transition-colors shadow-xs ${
                        product.isAvailable
                          ? 'bg-emerald-600/90 text-white hover:bg-emerald-700'
                          : 'bg-rose-600/90 text-white hover:bg-rose-700'
                      }`}
                    >
                      {product.isAvailable ? 'En vente' : 'Indisponible'}
                    </button>

                    {product.sku && (
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 text-white text-[10px] font-mono">
                        {product.sku}
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          {categoryObj?.nameFr || 'Plat'}
                        </span>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">{product.name}</h3>
                      </div>
                      <span className="font-mono font-bold text-amber-900 dark:text-amber-400 text-sm whitespace-nowrap tabular-nums">
                        {formatCurrency(product.price, activeOrganization.currency)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {product.description || 'Aucune description saisie.'}
                    </p>

                    {(currentUser.role === 'owner' || currentUser.role === 'manager' || currentUser.role === 'platform_admin') && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
                        <span>Coût : <strong className="font-mono tabular-nums text-slate-800 dark:text-slate-200">{formatCurrency(product.costPrice || 0, activeOrganization.currency)}</strong></span>
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5 tabular-nums">
                          <TrendingUp className="w-3 h-3" />
                          Marge : {marginPct}% ({formatCurrency(margin, activeOrganization.currency)})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDuplicateProduct(product)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Dupliquer ce plat"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(product.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Supprimer ce plat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(product)}
                    className="px-3 py-1.5 bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3 text-amber-400 dark:text-slate-950" />
                    <span>Modifier</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* DETAILED DESKTOP TABLE VIEW */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Photo & Nom</th>
                  <th className="py-3 px-3">Catégorie</th>
                  <th className="py-3 px-3">Réf SKU</th>
                  <th className="py-3 px-3">Prix Vente</th>
                  <th className="py-3 px-3">Coût Matière</th>
                  <th className="py-3 px-3">Marge Estimée</th>
                  <th className="py-3 px-3">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {processedProducts.map((product) => {
                  const margin = Math.max(0, product.price - (product.costPrice || 0));
                  const marginPct = product.price > 0 ? Math.round((margin / product.price) * 100) : 0;
                  const categoryObj = scopedCategories.find((c) => c.id === product.categoryId);

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image || '/src/assets/images/dish_grilled_fish_1792835864516.jpg'}
                            alt={product.name}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.src = '/src/assets/images/dish_grilled_fish_1792835864516.jpg';
                            }}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{product.name}</div>
                            <div className="text-[11px] text-slate-400 truncate max-w-xs">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{categoryObj?.nameFr || 'Plat'}</td>
                      <td className="py-3 px-3 font-mono text-slate-500 dark:text-slate-400">{product.sku || '—'}</td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                        {formatCurrency(product.price, activeOrganization.currency)}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300 tabular-nums">
                        {formatCurrency(product.costPrice || 0, activeOrganization.currency)}
                      </td>
                      <td className="py-3 px-3 font-semibold text-emerald-700 dark:text-emerald-400 font-mono tabular-nums">
                        {marginPct}% ({formatCurrency(margin, activeOrganization.currency)})
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => toggleProductAvailability(product.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                            product.isAvailable ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                          }`}
                        >
                          {product.isAvailable ? 'En vente' : 'Épuisé'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleDuplicateProduct(product)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                            title="Dupliquer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                            title="Modifier"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(product.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* MODAL: AJOUTER / MODIFIER UN PLAT */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh] flex flex-col justify-between animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm tracking-tight">
                  {editingProduct ? 'Modifier le plat' : 'Ajouter un plat au menu'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowProductModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Photo du plat (Importation depuis téléphone ou ordinateur)
                </label>

                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 relative group">
                    <img src={imagePreview} alt="Aperçu" className="w-full h-full object-cover" />
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                      <span>Choisir une photo locale</span>
                    </button>
                    <p className="text-[11px] text-slate-400">
                      Formats JPG, PNG, WebP (max 5 Mo). Stockage persistant.
                    </p>
                    {imageUploadError && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">{imageUploadError}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Nom & Référence SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nom du plat *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="ex: Poulet DG royal, Ndolé, Burger Maison..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Référence interne</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="ex: PLT-01"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              {/* Catégorie & Temps de préparation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Catégorie *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {scopedCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameFr || c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Temps de préparation (min)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.prepTimeMinutes}
                    onChange={(e) => setFormData({ ...formData, prepTimeMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs font-mono tabular-nums"
                  />
                </div>
              </div>

              {/* Prix de vente & Coût de revient */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Prix de vente ({activeOrganization.currency}) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="50"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 tabular-nums"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Coût de revient matière ({activeOrganization.currency})
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={formData.costPrice}
                      onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                      placeholder="Facultatif"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400">Marge brute estimée :</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono tabular-nums">
                    {formatCurrency(estimatedMargin, activeOrganization.currency)} ({estimatedMarginPct}%)
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description commerciale</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Détail des accompagnements, sauces, cuisson..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs"
                />
              </div>

              {/* Allergènes */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Allergènes (séparés par des virgules)
                </label>
                <input
                  type="text"
                  value={formData.allergens}
                  onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                  placeholder="ex: Arachides, Crustacés, Gluten..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="availCheck"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="w-4 h-4 text-amber-500 rounded"
                />
                <label htmlFor="availCheck" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  Plat immédiatement disponible à la vente
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {editingProduct ? 'Enregistrer les modifications' : 'Ajouter le plat à la carte'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOUVELLE CATÉGORIE */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Nouvelle catégorie de menu</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nom de la catégorie</label>
                <input
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="ex: Poissons Braisés, Desserts, Cocktails..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-3 py-1.5 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 rounded-lg cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-semibold text-xs rounded-lg cursor-pointer"
                >
                  Créer la catégorie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-5 space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
              <Trash2 className="w-5 h-5 shrink-0" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Supprimer ce plat ?</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Êtes-vous sûr de vouloir retirer définitivement ce plat de votre carte ? Cette action ne supprime pas les commandes passées.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-1.5 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteProduct(deleteConfirmId)}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
