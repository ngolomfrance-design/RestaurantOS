import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useTranslation } from '../../translations';
import { Organization, Currency } from '../../types/restaurant';
import {
  Building2,
  Plus,
  Store,
  MapPin,
  ExternalLink,
  Edit2,
  Archive,
  CheckCircle2,
  AlertTriangle,
  X,
  Save,
  ShieldCheck,
  Check,
} from 'lucide-react';

export const RestaurantsManagement: React.FC = () => {
  const {
    state,
    userOrganizations,
    activeOrganization,
    switchOrganization,
    createOrganization,
    updateOrganization,
    archiveOrganization,
    navigateTo,
    language,
    addAuditLog,
  } = useRestaurant();
  const t = useTranslation(language);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [confirmArchiveId, setConfirmArchiveId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state for creating restaurant
  const [newOrgData, setNewOrgData] = useState({
    name: '',
    type: 'gastronomic' as Organization['type'],
    country: 'Cameroun',
    city: 'Douala',
    address: '',
    phone: '',
    email: '',
    currency: 'XAF' as Currency,
    timezone: 'Africa/Douala',
  });
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const restaurantTypes: { id: Organization['type']; labelFr: string; labelEn: string }[] = [
    { id: 'gastronomic', labelFr: 'Restaurant Gastronomique & Bistrot', labelEn: 'Gastronomic & Bistro' },
    { id: 'fast_food', labelFr: 'Fast-Food & Burger Bar', labelEn: 'Fast-Food & Burgers' },
    { id: 'traditional', labelFr: 'Restaurant Traditionnel & Grillades', labelEn: 'Traditional & Grill' },
    { id: 'cafe_bar', labelFr: 'Café, Bar & Lounge', labelEn: 'Café, Bar & Lounge' },
    { id: 'hotel', labelFr: 'Service Restauration Hôtelière', labelEn: 'Hotel Restaurant Service' },
    { id: 'chain', labelFr: 'Chaîne multi-établissements', labelEn: 'Restaurant Chain' },
  ];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const errors: Record<string, string> = {};
    if (!newOrgData.name.trim()) {
      errors.name = language === 'fr' ? 'Le nom du restaurant est obligatoire' : 'Restaurant name is required';
    }
    if (!newOrgData.city.trim()) {
      errors.city = language === 'fr' ? 'La ville est obligatoire' : 'City is required';
    }
    if (!newOrgData.address.trim()) {
      errors.address = language === 'fr' ? 'L’adresse est obligatoire' : 'Address is required';
    }

    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const created = createOrganization({
        name: newOrgData.name.trim(),
        type: newOrgData.type,
        country: newOrgData.country.trim(),
        city: newOrgData.city.trim(),
        address: newOrgData.address.trim(),
        phone: newOrgData.phone.trim(),
        email: newOrgData.email.trim(),
        currency: newOrgData.currency,
        timezone: newOrgData.timezone,
      });

      setShowAddModal(false);
      setNewOrgData({
        name: '',
        type: 'gastronomic',
        country: 'Cameroun',
        city: 'Douala',
        address: '',
        phone: '',
        email: '',
        currency: 'XAF',
        timezone: 'Africa/Douala',
      });
      setCreateErrors({});
      setSuccessMessage(
        language === 'fr'
          ? `L'établissement « ${created.name} » a été créé avec succès.`
          : `Restaurant "${created.name}" created successfully.`
      );
      setTimeout(() => setSuccessMessage(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrg) return;

    updateOrganization(editingOrg.id, {
      name: editingOrg.name,
      type: editingOrg.type,
      city: editingOrg.city,
      country: editingOrg.country,
      address: editingOrg.address,
      phone: editingOrg.phone,
      email: editingOrg.email,
      currency: editingOrg.currency,
    });

    setEditingOrg(null);
    setSuccessMessage(
      language === 'fr'
        ? `Informations de « ${editingOrg.name} » mises à jour.`
        : `Updated details for "${editingOrg.name}".`
    );
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleArchive = (orgId: string) => {
    archiveOrganization(orgId);
    setConfirmArchiveId(null);
    setSuccessMessage(
      language === 'fr'
        ? 'Établissement archivé. Les données historiques comptables sont préservées.'
        : 'Restaurant archived. Historical sales records are safely preserved.'
    );
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {language === 'fr' ? 'Mes restaurants' : 'My Restaurants'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'fr'
              ? 'Gérez et basculez entre vos différents établissements indépendants.'
              : 'Manage and switch between your independent restaurant locations.'}
          </p>
        </div>

        <button
          onClick={() => {
            setShowAddModal(true);
            setCreateErrors({});
          }}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>{language === 'fr' ? '+ Ajouter un restaurant' : '+ Add a Restaurant'}</span>
        </button>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Active Organization Alert */}
      <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-amber-700 font-bold block">
              {language === 'fr' ? 'Établissement actuellement actif' : 'Currently Active Restaurant'}
            </span>
            <span className="text-sm font-bold text-slate-900">{activeOrganization?.name}</span>
            <span className="text-slate-500 ml-2">({activeOrganization?.city}, {activeOrganization?.country})</span>
          </div>
        </div>

        <button
          onClick={() => navigateTo('dashboard')}
          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium self-start sm:self-auto transition-colors"
        >
          {language === 'fr' ? 'Aller au Tableau de bord →' : 'Go to Dashboard →'}
        </button>
      </div>

      {/* Grid of Restaurants */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {userOrganizations.map((org) => {
          const isActive = org.id === activeOrganization?.id;
          const isArchived = org.status === 'archived';

          return (
            <div
              key={org.id}
              className={`rounded-2xl border transition-all p-5 flex flex-col justify-between space-y-4 bg-white ${
                isActive
                  ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 shadow-xs'
              } ${isArchived ? 'opacity-60 bg-slate-50' : ''}`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">{org.name}</h3>
                      {isActive && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                          {language === 'fr' ? 'Actif' : 'Active'}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium block">
                      {restaurantTypes.find((t) => t.id === org.type)?.labelFr || org.type}
                    </span>
                  </div>

                  {org.isDemo && (
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Démo
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{org.address || org.city}, {org.country}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Devise : <strong className="text-slate-600">{org.currency}</strong> • Formule : <strong className="text-slate-600 capitalize">{org.subscriptionPlan}</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingOrg({ ...org })}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs font-medium transition-colors"
                    title={language === 'fr' ? 'Modifier les informations' : 'Edit details'}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {!org.isDemo && !isArchived && (
                    <button
                      onClick={() => setConfirmArchiveId(org.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-medium transition-colors"
                      title={language === 'fr' ? 'Archiver cet établissement' : 'Archive restaurant'}
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {isActive ? (
                  <button
                    onClick={() => navigateTo('dashboard')}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <span>{language === 'fr' ? 'Ouvrir' : 'Open'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      switchOrganization(org.id);
                      navigateTo('dashboard');
                    }}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <span>{language === 'fr' ? 'Sélectionner' : 'Select'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: + Ajouter un restaurant */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm">
                  {language === 'fr' ? 'Ajouter un nouvel établissement' : 'Add New Restaurant'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  {language === 'fr' ? 'Nom du restaurant *' : 'Restaurant Name *'}
                </label>
                <input
                  type="text"
                  value={newOrgData.name}
                  onChange={(e) => setNewOrgData({ ...newOrgData, name: e.target.value })}
                  placeholder="ex: Le Bistro Akwa"
                  className={`w-full px-3 py-2 border rounded-lg text-xs ${
                    createErrors.name ? 'border-rose-500 bg-rose-50/50' : 'border-slate-300'
                  }`}
                />
                {createErrors.name && (
                  <p className="text-[11px] text-rose-500">{createErrors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    {language === 'fr' ? 'Type d’établissement' : 'Restaurant Type'}
                  </label>
                  <select
                    value={newOrgData.type}
                    onChange={(e) => setNewOrgData({ ...newOrgData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    {restaurantTypes.map((t) => (
                      <option key={t.id} value={t.id}>
                        {language === 'fr' ? t.labelFr : t.labelEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    {language === 'fr' ? 'Devise principale' : 'Currency'}
                  </label>
                  <select
                    value={newOrgData.currency}
                    onChange={(e) => setNewOrgData({ ...newOrgData, currency: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="XAF">XAF (FCFA Cameroun / CEMAC)</option>
                    <option value="EUR">EUR (€ Euro)</option>
                    <option value="USD">USD ($ US Dollar)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    {language === 'fr' ? 'Ville *' : 'City *'}
                  </label>
                  <input
                    type="text"
                    value={newOrgData.city}
                    onChange={(e) => setNewOrgData({ ...newOrgData, city: e.target.value })}
                    placeholder="Douala, Yaoundé..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                  {createErrors.city && (
                    <p className="text-[11px] text-rose-500">{createErrors.city}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    {language === 'fr' ? 'Pays' : 'Country'}
                  </label>
                  <input
                    type="text"
                    value={newOrgData.country}
                    onChange={(e) => setNewOrgData({ ...newOrgData, country: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  {language === 'fr' ? 'Adresse complète *' : 'Address *'}
                </label>
                <input
                  type="text"
                  value={newOrgData.address}
                  onChange={(e) => setNewOrgData({ ...newOrgData, address: e.target.value })}
                  placeholder="Boulevard de la Liberté, Akwa"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
                {createErrors.address && (
                  <p className="text-[11px] text-rose-500">{createErrors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    {language === 'fr' ? 'Téléphone' : 'Phone'}
                  </label>
                  <input
                    type="text"
                    value={newOrgData.phone}
                    onChange={(e) => setNewOrgData({ ...newOrgData, phone: e.target.value })}
                    placeholder="+237 600 00 00 00"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">
                    {language === 'fr' ? 'E-mail professionnel' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={newOrgData.email}
                    onChange={(e) => setNewOrgData({ ...newOrgData, email: e.target.value })}
                    placeholder="contact@restaurant.cm"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg"
                >
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting
                    ? (language === 'fr' ? 'Création...' : 'Creating...')
                    : (language === 'fr' ? 'Enregistrer le restaurant' : 'Save Restaurant')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Modifier un restaurant */}
      {editingOrg && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm">
                  {language === 'fr' ? 'Modifier l’établissement' : 'Edit Restaurant'}
                </h3>
              </div>
              <button
                onClick={() => setEditingOrg(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Nom du restaurant</label>
                <input
                  type="text"
                  value={editingOrg.name}
                  onChange={(e) => setEditingOrg({ ...editingOrg, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Ville</label>
                  <input
                    type="text"
                    value={editingOrg.city}
                    onChange={(e) => setEditingOrg({ ...editingOrg, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Pays</label>
                  <input
                    type="text"
                    value={editingOrg.country}
                    onChange={(e) => setEditingOrg({ ...editingOrg, country: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Adresse</label>
                <input
                  type="text"
                  value={editingOrg.address}
                  onChange={(e) => setEditingOrg({ ...editingOrg, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Téléphone</label>
                  <input
                    type="text"
                    value={editingOrg.phone}
                    onChange={(e) => setEditingOrg({ ...editingOrg, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Devise</label>
                  <select
                    value={editingOrg.currency}
                    onChange={(e) => setEditingOrg({ ...editingOrg, currency: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="XAF">XAF (FCFA)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingOrg(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Archive Restaurant */}
      {confirmArchiveId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">
                {language === 'fr' ? 'Archiver cet établissement ?' : 'Archive restaurant?'}
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {language === 'fr'
                ? 'Conformément aux normes comptables, les commandes, les encaissements et les historiques de stock ne seront PAS supprimés. L’établissement sera simplement désactivé de vos points de vente actifs.'
                : 'In accordance with accounting regulations, historical orders, payments, and stock movements will NOT be deleted. The restaurant will be archived from active operations.'}
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmArchiveId(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-lg"
              >
                {language === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
              <button
                onClick={() => handleArchive(confirmArchiveId)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg"
              >
                {language === 'fr' ? 'Confirmer l’archivage' : 'Confirm Archive'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Attribution */}
      <div className="pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
        RestaurantOS — Une solution développée par <strong className="text-slate-600">DATA WORK AGENCY</strong>
      </div>
    </div>
  );
};
