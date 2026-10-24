import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useTranslation } from '../../translations';
import { Currency, Language } from '../../types/restaurant';
import {
  Settings,
  Building,
  Globe,
  DollarSign,
  Percent,
  Receipt,
  Smartphone,
  Save,
  CheckCircle2,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { state, language, setLanguage, updateOrganizationSettings } = useRestaurant();
  const t = useTranslation(language);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [name, setName] = useState(state.organization.name);
  const [phone, setPhone] = useState(state.organization.phone);
  const [email, setEmail] = useState(state.organization.email);
  const [address, setAddress] = useState(state.organization.address);
  const [currency, setCurrency] = useState<Currency>(state.organization.currency);
  const [taxRate, setTaxRate] = useState<number>(state.organization.taxRate);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrganizationSettings({
      name,
      phone,
      email,
      address,
      currency,
      taxRate: Number(taxRate),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          {t.nav.settings}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {language === 'fr'
            ? 'Configuration de l’établissement, devise, taxes et options de paiement'
            : 'Restaurant profile, currency preferences, tax rates, and payment methods'}
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Paramètres mis à jour avec succès.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Profile Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-500" />
            <span>Identité du Restaurant</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Nom commercial</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Téléphone de contact</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email officiel</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Adresse physique / Quartier</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Currency & Localization */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-500" />
            <span>Devise & Localisation</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Devise principale</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-amber-500"
              >
                <option value="XAF">Franc CFA (XAF) - Cameroun / CEMAC</option>
                <option value="EUR">Euro (€)</option>
                <option value="USD">Dollar Américain ($)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Langue de l'interface</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-amber-500"
              >
                <option value="fr">Français (Par défaut)</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Taux de TVA (%)</label>
              <input
                type="number"
                step="0.01"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Standard Cameroun : 19.25%
              </span>
            </div>
          </div>
        </div>

        {/* Payment Channels Enabled */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-slate-500" />
            <span>Moyens de Règlement Acceptés</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/30 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Espèces (Cash)</div>
                <div className="text-[11px] text-slate-500">Fond de caisse direct</div>
              </div>
              <span className="text-emerald-700 font-bold">Actif</span>
            </div>

            <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/30 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Orange & MTN MoMo</div>
                <div className="text-[11px] text-slate-500">Paiement sans contact</div>
              </div>
              <span className="text-amber-700 font-bold">Actif</span>
            </div>

            <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/30 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Cartes Bancaires</div>
                <div className="text-[11px] text-slate-500">Visa / Mastercard</div>
              </div>
              <span className="text-blue-700 font-bold">Actif</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>Enregistrer les modifications</span>
          </button>
        </div>
      </form>
    </div>
  );
};
