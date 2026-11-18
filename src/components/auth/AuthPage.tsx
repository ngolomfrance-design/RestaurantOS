import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useTranslation } from '../../translations';
import {
  Store,
  Mail,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building2,
} from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login' }) => {
  const { login, loginDemo, register, navigateTo, language } = useRestaurant();
  const t = useTranslation(language);

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError(language === 'fr' ? 'Veuillez saisir votre adresse e-mail' : 'Please enter your email');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = login(email.trim(), password);
      setLoading(false);
      if (!res.success) {
        setError(res.message || (language === 'fr' ? 'Erreur de connexion' : 'Login failed'));
      }
    }, 300);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError(language === 'fr' ? 'Veuillez saisir une adresse e-mail valide' : 'Please enter a valid email');
      return;
    }
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setResetSent(true);
    }, 500);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError(language === 'fr' ? 'Veuillez indiquer votre nom complet' : 'Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError(language === 'fr' ? 'Veuillez saisir une adresse e-mail valide' : 'Please enter a valid email');
      return;
    }
    if (password.length < 6) {
      setError(language === 'fr' ? 'Le mot de passe doit contenir au moins 6 caractères' : 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const res = register(name.trim(), email.trim(), password);
      setLoading(false);
      if (!res.success) {
        setError(language === 'fr' ? "Erreur lors de l'inscription" : 'Registration failed');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#0B192C] text-slate-100 flex flex-col justify-between selection:bg-amber-500/20 selection:text-amber-300">
      {/* Header bar */}
      <header className="h-16 px-6 md:px-12 border-b border-white/10 flex items-center justify-between">
        <button
          onClick={() => navigateTo('marketing')}
          className="flex items-center gap-2.5 text-left group cursor-pointer whitespace-nowrap"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-extrabold flex items-center justify-center text-sm shadow-xs group-hover:scale-105 transition-transform">
            R
          </div>
          <span className="text-base font-bold tracking-tight text-white">
            RestaurantOS
          </span>
        </button>

        <button
          onClick={() => navigateTo('marketing')}
          className="text-xs text-slate-300 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
        >
          {language === 'fr' ? '← Retour au site public' : '← Back to public website'}
        </button>
      </header>

      {/* Main Form Center */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
        <div className="max-w-md w-full bg-[#10223A] border border-white/15 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-md space-y-6">
          {/* Mode Switcher Tabs */}
          {mode !== 'forgot' ? (
            <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setResetSent(false);
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  mode === 'login'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {language === 'fr' ? 'Connexion' : 'Sign In'}
              </button>
              <button
                onClick={() => {
                  setMode('register');
                  setError(null);
                  setResetSent(false);
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  mode === 'register'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {language === 'fr' ? 'Créer un compte' : 'Sign Up'}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                {language === 'fr' ? 'Récupération de compte' : 'Account Recovery'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setResetSent(false);
                }}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {language === 'fr' ? '← Retour à la connexion' : '← Back to Sign In'}
              </button>
            </div>
          )}

          {/* Title & Explanatory text */}
          <div className="space-y-1 text-center">
            <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold tracking-tight text-white text-balance">
              {mode === 'login'
                ? language === 'fr'
                  ? 'Accéder à votre espace restaurant'
                  : 'Sign in to your restaurant workspace'
                : mode === 'register'
                ? language === 'fr'
                  ? 'Créer votre compte RestaurantOS'
                  : 'Create your RestaurantOS account'
                : language === 'fr'
                ? 'Réinitialiser votre mot de passe'
                : 'Reset your password'}
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              {mode === 'login'
                ? language === 'fr'
                  ? 'Connectez-vous pour piloter vos commandes, stocks et ventes.'
                  : 'Manage your live orders, inventory, and restaurant sales.'
                : mode === 'register'
                ? language === 'fr'
                  ? 'Configurez votre premier restaurant et démarrez vos 7 jours d’essai.'
                  : 'Set up your restaurant and start your 7-day free trial.'
                : language === 'fr'
                ? 'Saisissez votre e-mail pour recevoir les instructions de réinitialisation sécurisée.'
                : 'Enter your email to receive secure reset instructions.'}
            </p>
          </div>

          {/* Error notice */}
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Reset Sent Confirmation */}
          {resetSent && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{language === 'fr' ? 'E-mail de réinitialisation transmis !' : 'Reset email sent!'}</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {language === 'fr'
                  ? `Un lien sécurisé de réinitialisation a été généré pour ${email}. Consultez votre boîte de réception ou contactez le support DATA WORK AGENCY.`
                  : `A secure reset link has been dispatched to ${email}. Check your inbox or contact DATA WORK AGENCY support.`}
              </p>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setResetSent(false);
                }}
                className="mt-2 text-xs font-semibold text-amber-400 hover:underline cursor-pointer"
              >
                {language === 'fr' ? 'Revenir à la page de connexion' : 'Return to sign in'}
              </button>
            </div>
          )}

          {/* Forms */}
          {mode === 'forgot' && !resetSent ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-slate-300">
                  {language === 'fr' ? 'Votre adresse e-mail de compte' : 'Your account email'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="directeur@restaurant.cm"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? (language === 'fr' ? 'Génération du lien...' : 'Generating link...') : (language === 'fr' ? 'Envoyer le lien de réinitialisation' : 'Send reset link')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-slate-300">
                  {language === 'fr' ? 'Adresse e-mail professionnelle' : 'Work Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="directeur@restaurant.cm"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">
                    {language === 'fr' ? 'Mot de passe' : 'Password'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                      setResetSent(false);
                    }}
                    className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                  >
                    {language === 'fr' ? 'Mot de passe oublié ?' : 'Forgot password?'}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? (language === 'fr' ? 'Connexion en cours...' : 'Signing in...') : (language === 'fr' ? 'Se connecter' : 'Sign In')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-slate-300">
                  {language === 'fr' ? 'Nom et prénom' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex: Mireille Ngo"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-slate-300">
                  {language === 'fr' ? 'Adresse e-mail professionnelle' : 'Work Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mireille.ngo@restaurant.cm"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-slate-300">
                  {language === 'fr' ? 'Créer un mot de passe' : 'Create Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="6 caractères minimum"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400 transition-colors"
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-400 leading-relaxed">
                {language === 'fr'
                  ? 'En vous inscrivant, vous accéderez au parcours d’onboarding pour créer et configurer votre premier restaurant.'
                  : 'By signing up, you will proceed to the onboarding wizard to configure your first restaurant.'}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? (language === 'fr' ? 'Création du compte...' : 'Creating account...') : (language === 'fr' ? 'Créer mon compte RestaurantOS' : 'Create My Account')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Separator */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full"></div>
            <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              {language === 'fr' ? 'Ou test direct' : 'Or direct test'}
            </span>
          </div>

          {/* Explore with Demo Restaurant */}
          <div className="space-y-2">
            <button
              onClick={() => loginDemo()}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-white text-xs font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Store className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {language === 'fr'
                  ? 'Explorer avec le restaurant de démonstration (Le Wouri Gourmet)'
                  : 'Explore with Demo Restaurant (Le Wouri Gourmet)'}
              </span>
            </button>
            <p className="text-[10px] text-slate-500 text-center">
              {language === 'fr'
                ? 'Accès immédiat avec données d’exemple (Douala & Yaoundé)'
                : 'Instant access with preloaded sample data (Douala & Yaoundé)'}
            </p>
          </div>
        </div>
      </main>

      {/* Footer attribution */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-white/10">
        RestaurantOS — Une solution développée par <strong className="text-slate-200">DATA WORK AGENCY</strong> (+237 690 37 04 54 · dataworkagency0@gmail.com)
      </footer>
    </div>
  );
};
