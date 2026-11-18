import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useTranslation } from '../../translations';
import { Currency, Organization } from '../../types/restaurant';
import {
  Store,
  Users,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Building,
  AlertCircle,
  Clock,
  Sparkles,
  Phone,
  Mail,
  ShieldCheck,
} from 'lucide-react';

export const OnboardingWizard: React.FC = () => {
  const { createOrganization, acceptStaffInvitation, navigateTo, language, currentUser } = useRestaurant();
  const t = useTranslation(language);

  const [mode, setMode] = useState<'welcome' | 'create' | 'join'>('welcome');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Form fields
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantType, setRestaurantType] = useState<Organization['type']>('traditional');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Douala');
  const [country, setCountry] = useState('Cameroun');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [currency, setCurrency] = useState<Currency>('XAF');
  const [timezone, setTimezone] = useState('Africa/Douala');
  const [logoUrl, setLogoUrl] = useState('');

  // Invitation code for join mode
  const [inviteCode, setInviteCode] = useState('');
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const restaurantTypes: { id: Organization['type']; labelFr: string; descFr: string }[] = [
    { id: 'traditional', labelFr: 'Restaurant traditionnel & Grillades', descFr: 'Service à table, cuisine locale, plats mijotés et braisés' },
    { id: 'fast_food', labelFr: 'Fast-food & Burger bar', descFr: 'Commandes au comptoir, flux rapide et transmission cuisine' },
    { id: 'gastronomic', labelFr: 'Restaurant gastronomique & Bistrot', descFr: 'Plats raffinés, accords mets & vins, réservations' },
    { id: 'cafe_bar', labelFr: 'Café, Bar & Lounge', descFr: 'Comptoir, boissons chaudes, cocktails et tapas' },
    { id: 'hotel', labelFr: 'Hôtel avec service restaurant', descFr: 'Petit-déjeuner, room-service et facturation centralisée' },
    { id: 'chain', labelFr: 'Snack, Pâtisserie ou Autre', descFr: 'Vente à emporter, formules midi et salon de thé' },
  ];

  const handleCreateRestaurant = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const validationErrors: Record<string, string> = {};
    if (!restaurantName.trim()) {
      validationErrors.name = language === 'fr' ? 'Le nom du restaurant est obligatoire.' : 'Restaurant name is required.';
    }
    if (!city.trim()) {
      validationErrors.city = language === 'fr' ? 'La ville est obligatoire.' : 'City is required.';
    }
    if (!country.trim()) {
      validationErrors.country = language === 'fr' ? 'Le pays est obligatoire.' : 'Country is required.';
    }
    if (!address.trim()) {
      validationErrors.address = language === 'fr' ? 'L’adresse de l’établissement est obligatoire.' : 'Address is required.';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const newOrg = createOrganization({
        name: restaurantName.trim(),
        type: restaurantType,
        address: address.trim(),
        city: city.trim(),
        country: country.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        currency,
        timezone,
        logo: logoUrl.trim() || undefined,
      });

      setSuccessNotice(
        language === 'fr'
          ? `Votre établissement « ${newOrg.name} » a été configuré avec succès ! Redirection vers votre tableau de bord...`
          : `Restaurant "${newOrg.name}" successfully configured! Redirecting to your dashboard...`
      );

      setTimeout(() => {
        navigateTo('dashboard');
      }, 1200);
    } catch (err: any) {
      setErrors({ form: err.message || 'Erreur lors de la création du restaurant' });
      setIsSubmitting(false);
    }
  };

  const handleJoinRestaurant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      setInviteError(language === 'fr' ? 'Veuillez saisir votre code d’invitation' : 'Please enter your invite code');
      return;
    }

    setInviteError(null);
    setIsSubmitting(true);

    const result = acceptStaffInvitation(inviteCode.trim());
    if (!result.success) {
      setInviteError(result.message);
      setIsSubmitting(false);
      return;
    }

    setSuccessNotice(result.message);
    setTimeout(() => {
      navigateTo('dashboard');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0B192C] text-slate-100 flex flex-col justify-between p-4 sm:p-6 selection:bg-amber-500/20 selection:text-amber-300">
      {/* Top Header */}
      <header className="max-w-3xl w-full mx-auto flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5 whitespace-nowrap">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-extrabold flex items-center justify-center text-sm shadow-xs">
            R
          </div>
          <div className="font-bold text-base text-white">RestaurantOS</div>
        </div>

        <button
          onClick={() => navigateTo('marketing')}
          className="text-xs text-slate-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
        >
          {language === 'fr' ? 'Quitter la configuration' : 'Exit Setup'}
        </button>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl w-full mx-auto my-8">
        {/* Success Notice */}
        {successNotice && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-semibold">{successNotice}</span>
          </div>
        )}

        {/* STEP 1: WELCOME SCREEN */}
        {mode === 'welcome' && (
          <div className="bg-[#10223A] border border-white/15 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md space-y-8 text-center animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-400/25 text-amber-400 flex items-center justify-center mx-auto">
              <Store className="w-8 h-8" />
            </div>

            <div className="space-y-3">
              <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold tracking-tight text-white text-balance">
                Bienvenue sur RestaurantOS !
              </h1>
              <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                Commençons par configurer votre établissement afin de personnaliser votre espace de gestion, votre monnaie locale et vos opérations quotidiennes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto pt-2">
              <button
                onClick={() => setMode('create')}
                className="p-5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl font-bold text-xs shadow-lg transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer hover:scale-[1.02]"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-950/10 flex items-center justify-center">
                  <Store className="w-5 h-5 text-slate-950" />
                </div>
                <span className="text-sm">Créer mon restaurant</span>
                <span className="text-[11px] text-slate-800 font-normal">
                  Nouveau restaurant ou point de vente
                </span>
              </button>

              <button
                onClick={() => setMode('join')}
                className="p-5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-white rounded-2xl font-semibold text-xs transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer hover:scale-[1.02]"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center">
                  <Users className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-sm">Rejoindre un restaurant</span>
                <span className="text-[11px] text-slate-400 font-normal">
                  Via code invitation manager
                </span>
              </button>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Chaque établissement bénéficie d'un espace totalement isolé et sécurisé.</span>
            </div>
          </div>
        )}

        {/* STEP 2: CREATE RESTAURANT FORM */}
        {mode === 'create' && (
          <div className="bg-[#10223A] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <button
                onClick={() => setMode('welcome')}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Retour au choix</span>
              </button>
              <span className="text-xs text-amber-400 font-semibold">Création d'établissement</span>
            </div>

            <div className="space-y-1">
              <h2 className="font-serif-luxury text-2xl font-bold tracking-tight text-white">
                Configurer votre restaurant
              </h2>
              <p className="text-xs text-slate-400">
                Remplissez les informations essentielles de votre établissement.
              </p>
            </div>

            {/* Error banner */}
            {errors.form && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errors.form}</span>
              </div>
            )}

            <form onSubmit={handleCreateRestaurant} className="space-y-4">
              {/* Nom du restaurant */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Nom du restaurant <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="ex: Chez Mama Titi, Le Jardin Gourmet, Burger Akwa..."
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-amber-400 transition-colors ${
                    errors.name ? 'border-rose-500 bg-rose-500/5' : 'border-slate-700'
                  }`}
                />
                {errors.name && <p className="text-[11px] text-rose-400">{errors.name}</p>}
              </div>

              {/* Type d'établissement */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Type d’établissement <span className="text-amber-400">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {restaurantTypes.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setRestaurantType(t.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                        restaurantType === t.id
                          ? 'border-amber-400 bg-amber-500/10 text-white'
                          : 'border-slate-800 bg-slate-950/60 hover:bg-slate-800/50 text-slate-300'
                      }`}
                    >
                      <div className="font-bold flex items-center justify-between">
                        <span>{t.labelFr}</span>
                        {restaurantType === t.id && <span className="text-amber-400 font-bold">✓</span>}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{t.descFr}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Devise et Fuseau horaire */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Devise de facturation <span className="text-amber-400">*</span>
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-hidden focus:border-amber-400"
                  >
                    <option value="XAF">XAF - Franc CFA (Cameroun, CEMAC) [Recommandé]</option>
                    <option value="EUR">EUR - Euro (€)</option>
                    <option value="USD">USD - Dollar US ($)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Fuseau horaire
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-hidden focus:border-amber-400"
                  >
                    <option value="Africa/Douala">Africa/Douala (GMT+1 - Cameroun)</option>
                    <option value="Africa/Lagos">Africa/Lagos (GMT+1 - Nigeria)</option>
                    <option value="Africa/Abidjan">Africa/Abidjan (GMT+0 - Côte d'Ivoire)</option>
                    <option value="Europe/Paris">Europe/Paris (GMT+1 / GMT+2)</option>
                    <option value="UTC">UTC (Standard International)</option>
                  </select>
                </div>
              </div>

              {/* Ville et Pays */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Ville <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Douala, Yaoundé, Bafoussam..."
                    className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-amber-400 ${
                      errors.city ? 'border-rose-500 bg-rose-500/5' : 'border-slate-700'
                    }`}
                  />
                  {errors.city && <p className="text-[11px] text-rose-400">{errors.city}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Pays <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-amber-400 ${
                      errors.country ? 'border-rose-500 bg-rose-500/5' : 'border-slate-700'
                    }`}
                  />
                </div>
              </div>

              {/* Adresse */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Adresse de l'établissement <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="ex: Rue des Palmiers, Quartier Bonapriso"
                  className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-amber-400 ${
                    errors.address ? 'border-rose-500 bg-rose-500/5' : 'border-slate-700'
                  }`}
                />
                {errors.address && <p className="text-[11px] text-rose-400">{errors.address}</p>}
              </div>

              {/* Téléphone et Email pro (facultatifs) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Téléphone professionnel (facultatif)
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+237 600 00 00 00"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Email de contact (facultatif)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@restaurant.cm"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Submit Button (Anti-double-click protection) */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMode('welcome')}
                  className="px-4 py-2.5 text-xs text-slate-400 hover:text-white"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>
                    {isSubmitting ? 'Enregistrement en cours...' : 'Valider & Ouvrir mon restaurant'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: JOIN RESTAURANT */}
        {mode === 'join' && (
          <div className="bg-[#10223A] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <button
                onClick={() => setMode('welcome')}
                className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Retour au choix</span>
              </button>
              <span className="text-xs text-amber-400 font-semibold">Adhésion d'équipe</span>
            </div>

            <div className="space-y-1">
              <h2 className="font-serif-luxury text-2xl font-bold tracking-tight text-white">
                Rejoindre un restaurant existant
              </h2>
              <p className="text-xs text-slate-400">
                Entrez le code d'invitation à 8 caractères fourni par le propriétaire ou directeur de votre établissement.
              </p>
            </div>

            {inviteError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{inviteError}</span>
              </div>
            )}

            <form onSubmit={handleJoinRestaurant} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Code d’invitation
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="ex: RST-7842"
                  maxLength={10}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-3 text-sm font-mono tracking-wider text-center text-white placeholder:text-slate-600 focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMode('create')}
                  className="text-xs text-amber-400 hover:underline cursor-pointer"
                >
                  Vous préférez créer votre propre restaurant ?
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Vérifier l’invitation
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Footer Attribution */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-white/10">
        RestaurantOS — Une solution développée par <strong className="text-slate-200">DATA WORK AGENCY</strong>
      </footer>
    </div>
  );
};
