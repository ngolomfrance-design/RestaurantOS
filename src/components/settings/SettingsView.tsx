import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useTranslation } from '../../translations';
import { Currency, Language } from '../../types/restaurant';
import {
  Building,
  Globe,
  Smartphone,
  Save,
  CheckCircle2,
  Eye,
  QrCode,
  CalendarDays,
  ShoppingBag,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    activeOrganization,
    language,
    setLanguage,
    updateOrganizationSettings,
    openPublicStorefront,
  } = useRestaurant();
  const t = useTranslation(language);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [name, setName] = useState(activeOrganization.name);
  const [phone, setPhone] = useState(activeOrganization.phone);
  const [email, setEmail] = useState(activeOrganization.email);
  const [address, setAddress] = useState(activeOrganization.address);
  const [currency, setCurrency] = useState<Currency>(activeOrganization.currency);
  const [taxRate, setTaxRate] = useState<number>(activeOrganization.taxRate);
  const [isPublicPublished, setIsPublicPublished] = useState<boolean>(
    activeOrganization.isPublicPublished !== false
  );
  const [enableTableOrdering, setEnableTableOrdering] = useState<boolean>(
    activeOrganization.enableTableOrdering !== false
  );
  const [enableOnlineOrdering, setEnableOnlineOrdering] = useState<boolean>(
    activeOrganization.enableOnlineOrdering !== false
  );
  const [enableReservations, setEnableReservations] = useState<boolean>(
    activeOrganization.enableReservations !== false
  );

  useEffect(() => {
    setName(activeOrganization.name);
    setPhone(activeOrganization.phone);
    setEmail(activeOrganization.email);
    setAddress(activeOrganization.address);
    setCurrency(activeOrganization.currency);
    setTaxRate(activeOrganization.taxRate);
    setIsPublicPublished(activeOrganization.isPublicPublished !== false);
    setEnableTableOrdering(activeOrganization.enableTableOrdering !== false);
    setEnableOnlineOrdering(activeOrganization.enableOnlineOrdering !== false);
    setEnableReservations(activeOrganization.enableReservations !== false);
  }, [activeOrganization]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrganizationSettings({
      name,
      phone,
      email,
      address,
      currency,
      taxRate: Number(taxRate),
      isPublicPublished,
      enableTableOrdering,
      enableOnlineOrdering,
      enableReservations,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const publicUrl = `${window.location.origin}/menu/${activeOrganization.slug || activeOrganization.id}`;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t.nav.settings}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'fr'
              ? 'Configuration de l’établissement, devise, taxes, vitrine publique et options client'
              : 'Restaurant profile, currency preferences, tax rates, public storefront & guest options'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => openPublicStorefront(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-xs transition-colors self-start sm:self-auto cursor-pointer whitespace-nowrap"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{language === 'fr' ? 'Voir comme un client' : 'View as Customer'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Paramètres mis à jour avec succès.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Profile Details */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Identité du Restaurant</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nom commercial</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Téléphone de contact</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg font-mono tabular-nums focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Email officiel</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Adresse physique / Quartier</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Public Storefront & Guest Services Controls */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <QrCode className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Vitrine Publique, QR Menu & Services Clients</span>
            </h2>
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate max-w-xs">{publicUrl}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-500/60 cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/40">
              <input
                type="checkbox"
                checked={isPublicPublished}
                onChange={(e) => setIsPublicPublished(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 dark:border-slate-600 text-amber-600 focus:ring-amber-500"
              />
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Vitrine publique active</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Rend la page publique du restaurant et son menu numérique accessibles aux clients.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-500/60 cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/40">
              <input
                type="checkbox"
                checked={enableTableOrdering}
                onChange={(e) => setEnableTableOrdering(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 dark:border-slate-600 text-amber-600 focus:ring-amber-500"
              />
              <div>
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Commande sur table (QR Code)</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Permet aux clients assis à table de commander depuis leur téléphone.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-500/60 cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/40">
              <input
                type="checkbox"
                checked={enableOnlineOrdering}
                onChange={(e) => setEnableOnlineOrdering(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 dark:border-slate-600 text-amber-600 focus:ring-amber-500"
              />
              <div>
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>À emporter & Livraison</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Active la prise de commande en ligne à emporter ou en livraison.
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-500/60 cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/40">
              <input
                type="checkbox"
                checked={enableReservations}
                onChange={(e) => setEnableReservations(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 dark:border-slate-600 text-amber-600 focus:ring-amber-500"
              />
              <div>
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Réservations de table en ligne</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Permet aux clients de réserver selon vos horaires et votre capacité réelle.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Currency & Localization */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Devise & Localisation</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Devise principale</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              >
                <option value="XAF">Franc CFA (XAF) - Cameroun / CEMAC</option>
                <option value="EUR">Euro (€)</option>
                <option value="USD">Dollar Américain ($)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Langue de l'interface</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              >
                <option value="fr">Français (Par défaut)</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Taux de TVA (%)</label>
              <input
                type="number"
                step="0.01"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg font-mono tabular-nums focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                Standard Cameroun : 19.25%
              </span>
            </div>
          </div>
        </div>

        {/* Payment Channels Enabled */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Moyens de Règlement Acceptés sur Place / Livraison</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/20 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Espèces (Cash)</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Caisse, à table ou livraison</div>
              </div>
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">Actif</span>
            </div>

            <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/30 dark:bg-amber-950/20 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Orange & MTN MoMo</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Paiement mobile sur place</div>
              </div>
              <span className="text-amber-700 dark:text-amber-400 font-bold">Actif</span>
            </div>

            <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-800/60 bg-blue-50/30 dark:bg-blue-950/20 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Cartes Bancaires (TPE)</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">Visa / Mastercard au comptoir</div>
              </div>
              <span className="text-blue-700 dark:text-blue-400 font-bold">Actif</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4 text-amber-400 dark:text-slate-950" />
            <span>Enregistrer les modifications</span>
          </button>
        </div>
      </form>
    </div>
  );
};
