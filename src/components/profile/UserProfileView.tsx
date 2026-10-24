import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useTranslation } from '../../translations';
import { UserRole } from '../../types/restaurant';
import {
  User,
  Mail,
  Phone,
  Shield,
  KeyRound,
  LogOut,
  Building2,
  CheckCircle2,
  Save,
  Check,
} from 'lucide-react';

export const UserProfileView: React.FC = () => {
  const {
    currentUser,
    userOrganizations,
    activeOrganization,
    switchUserRole,
    logout,
    language,
    addAuditLog,
  } = useRestaurant();
  const t = useTranslation(language);

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [pinCode, setPinCode] = useState(currentUser.pinCode || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const roles: { role: UserRole; labelFr: string; labelEn: string; descFr: string }[] = [
    { role: 'owner', labelFr: 'Directeur Général (Owner)', labelEn: 'Owner', descFr: 'Accès total à tous les modules, configurations et finances.' },
    { role: 'manager', labelFr: 'Manager d’Exploitation', labelEn: 'Operations Manager', descFr: 'Gestion des commandes, tables, stocks, réservations et caisse.' },
    { role: 'cashier', labelFr: 'Caissier Principal', labelEn: 'Cashier', descFr: 'Caisse tactile POS, encaissements et clôture Z.' },
    { role: 'server', labelFr: 'Chef de Rang / Serveur', labelEn: 'Server', descFr: 'Plan de salle, prise de commande et suivi des tables.' },
    { role: 'kitchen', labelFr: 'Chef de Cuisine (KDS)', labelEn: 'Kitchen Chef', descFr: 'Écran de préparation en cuisine et temps de service.' },
    { role: 'inventory', labelFr: 'Responsable Économat', labelEn: 'Inventory Manager', descFr: 'Gestion des stocks, fiches recettes et réapprovisionnements.' },
    { role: 'platform_admin', labelFr: 'Opérateur DATA WORK', labelEn: 'DATA WORK Admin', descFr: 'Administration globale multi-tenants et monitoring.' },
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    currentUser.name = name;
    currentUser.email = email;
    currentUser.phone = phone;
    currentUser.pinCode = pinCode;
    addAuditLog('Profil mis à jour', `Mise à jour des coordonnées utilisateur pour ${name}`);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {language === 'fr' ? 'Mon Profil Utilisateur' : 'My User Profile'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'fr'
              ? 'Gérez vos coordonnées, votre code PIN de caisse et vos autorisations.'
              : 'Manage your contact details, POS PIN code, and permissions.'}
          </p>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4 text-rose-600" />
          <span>{language === 'fr' ? 'Se déconnecter' : 'Sign Out'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{language === 'fr' ? 'Profil enregistré avec succès.' : 'Profile saved successfully.'}</span>
        </div>
      )}

      {/* Grid: 2 columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="md:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-900 text-amber-400 font-bold text-2xl flex items-center justify-center mx-auto shadow-md">
            {currentUser.name.charAt(0)}
          </div>

          <div>
            <h2 className="font-bold text-slate-900 text-base">{currentUser.name}</h2>
            <p className="text-xs text-slate-500">{currentUser.email}</p>
            <span className="inline-block mt-2 px-2.5 py-1 text-[11px] font-bold text-amber-800 bg-amber-100 rounded-md capitalize">
              {currentUser.role}
            </span>
          </div>

          <div className="pt-4 border-t border-slate-100 text-left space-y-2 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Restaurant actif :</span>
              <span className="font-medium text-slate-800">{activeOrganization?.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Établissements :</span>
              <span className="font-medium text-slate-800">{userOrganizations.length} accessible(s)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Form & Role Matrix */}
        <div className="md:col-span-2 space-y-6">
          {/* Edit Form */}
          <form onSubmit={handleSaveProfile} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-600" />
              <span>{language === 'fr' ? 'Coordonnées personnelles' : 'Personal Details'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  {language === 'fr' ? 'Nom et prénom' : 'Full Name'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  {language === 'fr' ? 'Adresse e-mail' : 'Email'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  {language === 'fr' ? 'Numéro de téléphone' : 'Phone'}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  {language === 'fr' ? 'Code PIN de caisse (4 chiffres)' : 'POS PIN Code (4 digits)'}
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-amber-400" />
                <span>{language === 'fr' ? 'Enregistrer les modifications' : 'Save Changes'}</span>
              </button>
            </div>
          </form>

          {/* Role simulation */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-600" />
              <span>{language === 'fr' ? 'Rôle & Autorisations d’accès' : 'Role & Access Permissions'}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'fr'
                ? 'Sélectionnez un rôle pour simuler immédiatement l’expérience utilisateur correspondante dans RestaurantOS :'
                : 'Select a role to test the corresponding user interface permissions:'}
            </p>

            <div className="space-y-2 pt-2">
              {roles.map((r) => {
                const isCurrent = currentUser.role === r.role;
                return (
                  <div
                    key={r.role}
                    onClick={() => switchUserRole(r.role)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors flex items-center justify-between ${
                      isCurrent
                        ? 'border-amber-400 bg-amber-50/50 text-slate-900 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold">{language === 'fr' ? r.labelFr : r.labelEn}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{r.descFr}</div>
                    </div>
                    {isCurrent && (
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-bold shrink-0">
                        ✓
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Attribution */}
      <div className="pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
        RestaurantOS — Une solution développée par <strong className="text-slate-600">DATA WORK AGENCY</strong>
      </div>
    </div>
  );
};
