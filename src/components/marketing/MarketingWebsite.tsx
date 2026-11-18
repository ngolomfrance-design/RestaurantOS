import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useTranslation } from '../../translations';
import { INITIAL_SUBSCRIPTION_PLANS } from '../../data/mockDatabase';
import { formatCurrency } from '../../utils/formatters';
import {
  ShoppingBag,
  ChefHat,
  Boxes,
  QrCode,
  ArrowRight,
  CheckCircle2,
  Globe,
  Building2,
  ChevronDown,
  ShieldCheck,
  Phone,
  Mail,
  X,
  Store,
  Layers,
  Users,
  BarChart3,
  CreditCard,
  LayoutGrid,
  Menu,
  Instagram,
  Clock,
} from 'lucide-react';

export const MarketingWebsite: React.FC = () => {
  const { state, navigateTo, language, setLanguage, loginDemo, submitSupportTicket } = useRestaurant();
  const t = useTranslation(language);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [modalType, setModalType] = useState<'contact' | 'terms' | 'privacy' | null>(null);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [supportForm, setSupportForm] = useState({
    requesterName: '',
    restaurantName: '',
    requesterEmail: '',
    requesterPhone: '',
    subject: 'Demande de démonstration / déploiement',
    message: '',
  });
  const activePlans = state.subscriptionPlans?.length ? state.subscriptionPlans : INITIAL_SUBSCRIPTION_PLANS;
  const agencyPhone = state.platformSettings?.supportPhone || '+237 690 37 04 54';
  const agencyEmail = state.platformSettings?.supportEmail || 'dataworkagency0@gmail.com';
  const agencyInstagram = state.platformSettings?.supportInstagram || 'Data Work Agency';

  // 9 Core Real Features
  const features = [
    {
      title: 'Gestion des commandes',
      desc: 'Saisie rapide en salle, au comptoir ou en livraison avec suivi en temps réel du statut de chaque commande.',
      icon: ShoppingBag,
    },
    {
      title: 'Gestion des menus & produits',
      desc: 'Organisation par catégories, variantes, suppléments, allergènes et génération instantanée de QR codes pour les tables.',
      icon: QrCode,
    },
    {
      title: 'Gestion des stocks & ingrédients',
      desc: 'Déduction automatique par fiche recette, alertes de seuil critique et valorisation comptable de votre inventaire.',
      icon: Boxes,
    },
    {
      title: 'Caisse tactile & paiements',
      desc: 'Encaissements rapides avec calcul de monnaie, espèces, cartes bancaires et Mobile Money (Orange Money, MTN MoMo).',
      icon: CreditCard,
    },
    {
      title: 'Gestion du personnel & rôles',
      desc: 'Attribution précise des accès (Directeur, Manager, Caissier, Serveur, Cuisinier, Économat) avec code PIN.',
      icon: Users,
    },
    {
      title: 'Plan de salle & tables',
      desc: 'Visualisation interactive des tables en direct, statut d’occupation et transfert de commande entre tables.',
      icon: LayoutGrid,
    },
    {
      title: 'Écran cuisine KDS',
      desc: 'Transmission instantanée des bons de préparation au chef avec chronomètre d’attente et codes couleur.',
      icon: ChefHat,
    },
    {
      title: 'Rapports & statistiques réelles',
      desc: 'Chiffre d’affaires journalier, répartition par mode de paiement, ticket moyen et export des données pour la comptabilité.',
      icon: BarChart3,
    },
    {
      title: 'Gestion multi-établissements',
      desc: 'Pilotage centralisé de plusieurs restaurants ou franchises depuis un compte unique avec isolation stricte des données.',
      icon: Building2,
    },
  ];

  // 5 Real Advantages
  const benefits = [
    {
      title: 'Centraliser les opérations',
      desc: 'Fini les carnets papier égarés et les informations dispersées. Salle, cuisine, caisse et stocks communiquent en temps réel.',
    },
    {
      title: 'Suivre les ventes en direct',
      desc: 'Consultez votre chiffre d’affaires réel du jour, les encaissements par caissier et la clôture Z en un clic.',
    },
    {
      title: 'Organiser les commandes sans erreur',
      desc: 'Chaque commande est clairement attribuée à une table ou un client, transmise sans délai en cuisine.',
    },
    {
      title: 'Mieux contrôler les stocks',
      desc: 'Surveillez vos ingrédients clés (viandes, poissons, boissons, condiments) et anticipez les ruptures avant le coup de feu.',
    },
    {
      title: 'Interface accessible partout',
      desc: 'Utilisable sur smartphone, tablette Android, iPad, PC portable ou écran tactile de caisse sans matériel propriétaire.',
    },
  ];

  // Establishment Solutions
  const solutions = [
    {
      name: 'Restaurants Traditionnels & Grillades',
      desc: 'Gestion des tables, suivi des poissons et viandes braisées au poids, fiches recettes et encaissement Mobile Money.',
    },
    {
      name: 'Fast-Foods & Snacks',
      desc: 'Prise de commande rapide au comptoir, tickets de caisse immédiats et transmission directe sur écran cuisine.',
    },
    {
      name: 'Bistrots & Gastronomie',
      desc: 'Plan de salle par zone (Salle, Terrasse, VIP), gestion des réservations et calcul précis du coût matière par plat.',
    },
    {
      name: 'Bars, Cafés & Lounges',
      desc: 'Gestion des bouteilles et boissons au verre, happy hours et encaissements séparés au comptoir.',
    },
    {
      name: 'Chaînes & Franchises',
      desc: 'Multi-restaurants avec sélecteur d’établissement, permissions collaborateurs et comparaison des résultats.',
    },
  ];

  const faqs = [
    {
      q: 'Comment tester RestaurantOS dès maintenant ?',
      a: 'Vous pouvez soit créer votre propre restaurant gratuitement, soit cliquer sur « Explorer avec le restaurant de démonstration » pour découvrir immédiatement toutes les fonctionnalités avec des données d’exemple réalistes.',
    },
    {
      q: 'Quels moyens de paiement sont supportés ?',
      a: 'RestaurantOS prend en charge les espèces (avec calcul automatique de monnaie à rendre), Orange Money, MTN Mobile Money, ainsi que les cartes Visa et Mastercard.',
    },
    {
      q: 'Quel matériel informatique est nécessaire ?',
      a: 'Aucun équipement propriétaire requis. RestaurantOS fonctionne directement dans votre navigateur web sur n’importe quel smartphone, tablette ou ordinateur.',
    },
    {
      q: 'Puis-je gérer plusieurs restaurants avec un seul compte ?',
      a: 'Oui. Le sélecteur multi-établissements vous permet d’ajouter et de piloter autant de restaurants que nécessaire avec une isolation stricte de vos données.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B192C] text-slate-100 flex flex-col justify-between selection:bg-amber-500/20 selection:text-amber-300">
      {/* A. BARRE DE NAVIGATION (Clean 3-Zone Contract) */}
      <header className="h-16 px-4 md:px-10 bg-[#0B192C]/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-50 flex items-center justify-between gap-4">
        {/* Zone 1: Single-line Wordmark */}
        <a
          href="#hero"
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-extrabold flex items-center justify-center text-sm shadow-xs">
            R
          </div>
          <span className="text-base font-bold tracking-tight text-white">
            RestaurantOS
          </span>
        </a>

        {/* Zone 2: Clean Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
          <a href="#hero" className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0">
            Accueil
          </a>
          <a href="#features" className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0">
            Fonctionnalités
          </a>
          <a href="#solutions" className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0">
            Solutions
          </a>
          <a href="#pricing" className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0">
            Tarifs
          </a>
          <a href="#faq" className="hover:text-amber-300 transition-colors whitespace-nowrap shrink-0">
            FAQ
          </a>
        </nav>

        {/* Zone 3: Language toggle, Login & Primary CTA */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
            className="text-xs font-semibold uppercase text-slate-300 hover:text-white transition-colors px-2 py-1 rounded cursor-pointer whitespace-nowrap"
          >
            {language}
          </button>

          <button
            onClick={() => navigateTo('login')}
            className="hidden sm:inline-flex px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            Connexion
          </button>

          <button
            onClick={() => navigateTo('register')}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow-sm transition-colors whitespace-nowrap cursor-pointer"
          >
            Commencer gratuitement
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
            className="md:hidden p-2 text-slate-300 hover:text-white cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0F213B] border-b border-white/10 p-4 space-y-2.5 text-xs sticky top-16 z-40">
          <a href="#hero" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-200 hover:text-amber-300">
            Accueil
          </a>
          <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-200 hover:text-amber-300">
            Fonctionnalités
          </a>
          <a href="#solutions" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-200 hover:text-amber-300">
            Solutions
          </a>
          <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-200 hover:text-amber-300">
            Tarifs
          </a>
          <div className="pt-2 border-t border-white/10 flex gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigateTo('login');
              }}
              className="flex-1 py-2.5 text-center bg-white/10 text-white rounded-lg font-semibold cursor-pointer"
            >
              Connexion
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigateTo('register');
              }}
              className="flex-1 py-2.5 text-center bg-amber-500 text-slate-950 rounded-lg font-bold cursor-pointer"
            >
              Créer mon compte
            </button>
          </div>
        </div>
      )}

      {/* Main Flow — Alternating Midnight Blue & Crisp Off-White */}
      <main>
        {/* B. SECTION HERO (Midnight Blue #0B192C + Editorial Luxury Photography) */}
        <section id="hero" className="bg-[#0B192C] px-4 sm:px-6 md:px-10 pt-10 pb-16 lg:pt-16 lg:pb-24">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6 text-center lg:text-left">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-400">
                Essai gratuit 7 jours · Sans carte bancaire · Édité par DATA WORK AGENCY
              </div>

              <h1 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08] text-balance">
                Gérez votre restaurant intelligemment.
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                RestaurantOS centralise vos opérations, vos commandes en salle et à emporter, vos stocks, fiches recettes et performances réelles pour propulser votre établissement.
              </p>

              {/* Dominant Primary CTA + quiet secondary controls */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => navigateTo('register')}
                  className="w-full sm:w-auto px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <span>Créer mon restaurant</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => loginDemo()}
                  className="w-full sm:w-auto px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <Store className="w-4 h-4 text-amber-400" />
                  <span>Découvrir la démonstration</span>
                </button>

                <button
                  onClick={() => navigateTo('login')}
                  className="px-3 py-2 text-xs font-semibold text-slate-300 hover:text-amber-300 underline-offset-4 hover:underline transition-colors cursor-pointer whitespace-nowrap"
                >
                  Se connecter
                </button>
              </div>

              {/* Concrete operational proof strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-white/10 text-left">
                <div>
                  <div className="font-mono tabular-nums text-lg font-extrabold text-amber-400">3 Espaces</div>
                  <div className="text-[11px] text-slate-400">Admin · Pro · Client QR</div>
                </div>
                <div>
                  <div className="font-mono tabular-nums text-lg font-extrabold text-white">100% Live</div>
                  <div className="text-[11px] text-slate-400">Synchro Salle & Cuisine</div>
                </div>
                <div>
                  <div className="font-mono tabular-nums text-lg font-extrabold text-white">XAF / EUR</div>
                  <div className="text-[11px] text-slate-400">Orange Money & MoMo</div>
                </div>
                <div>
                  <div className="font-mono tabular-nums text-lg font-extrabold text-emerald-400">7 Jours</div>
                  <div className="text-[11px] text-slate-400">Essai sans engagement</div>
                </div>
              </div>
            </div>

            {/* Right Visual: Full Hospitality Photograph + Crisp POS Overlay Frame */}
            <div className="lg:col-span-5 flex">
              <div className="relative w-full rounded-3xl overflow-hidden border border-white/15 bg-[#10233D] shadow-2xl flex flex-col justify-between min-h-[380px]">
                <img
                  src="/src/assets/images/hero_restaurant_os_1792835865372.jpg"
                  alt="RestaurantOS — Pilotage salle, caisse et expérience client"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B192C] via-[#0B192C]/55 to-[#0B192C]/25" />

                <div className="relative p-5 flex items-center justify-between text-xs">
                  <span className="font-bold text-white bg-[#0B192C]/80 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/15">
                    Aperçu Caisse & Salle
                  </span>
                  <span className="font-mono tabular-nums text-[11px] text-amber-300 bg-[#0B192C]/80 px-2.5 py-1 rounded-lg border border-amber-400/30">
                    Devise : XAF
                  </span>
                </div>

                <div className="relative p-5 space-y-3 mt-auto">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[#0B192C]/85 backdrop-blur-md rounded-xl border border-white/15">
                      <span className="text-[10px] text-slate-300 block">Commandes en cours</span>
                      <span className="text-lg font-bold font-mono tabular-nums text-white">12 actives</span>
                    </div>
                    <div className="p-3 bg-[#0B192C]/85 backdrop-blur-md rounded-xl border border-white/15">
                      <span className="text-[10px] text-slate-300 block">Tables occupées</span>
                      <span className="text-lg font-bold font-mono tabular-nums text-amber-400">8 / 16</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-[#0B192C]/90 backdrop-blur-md rounded-xl border border-white/15 text-xs space-y-1.5">
                    <div className="flex items-center justify-between py-0.5 border-b border-white/10">
                      <span className="text-slate-200">1x Bar braisé royal (Table 4)</span>
                      <span className="font-mono tabular-nums font-semibold text-amber-400">8 500 XAF</span>
                    </div>
                    <div className="flex items-center justify-between py-0.5">
                      <span className="text-slate-200">2x Ndolé crevettes (Table 2)</span>
                      <span className="font-mono tabular-nums font-semibold text-amber-400">13 000 XAF</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* C. SECTION FONCTIONNALITÉS RÉELLES (Crisp #FAF9F6 Luxury Off-White Bento) */}
        <section id="features" className="bg-[#FAF9F6] text-slate-900 py-20 px-4 sm:px-6 md:px-10">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="max-w-2xl space-y-3">
              <div className="text-[11px] font-bold text-amber-700 uppercase tracking-[0.18em]">
                Fonctionnalités Opérationnelles
              </div>
              <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#0B192C] tracking-tight text-balance">
                Tout ce dont votre établissement a besoin pour réussir
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Chaque module a été conçu pour répondre aux exigences réelles de la restauration au Cameroun et à l’international.
              </p>
            </div>

            {/* Top Bento Highlights (2 flagship cards with varied weights) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7 bg-[#0B192C] text-white rounded-3xl p-7 sm:p-8 flex flex-col justify-between gap-6 shadow-md">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber-400">01 · COEUR MÉTIER</span>
                    <ShoppingBag className="w-5 h-5 text-amber-400" />
                  </div>
                  <h3 className="font-serif-luxury text-2xl font-bold text-white">
                    Caisse POS, Salle & Écran Cuisine KDS Synchronisés
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Prenez les commandes au comptoir, à table ou via QR Code. Chaque ticket est envoyé instantanément en cuisine avec chronomètre d’attente et encaissé en Espèces, Carte, Orange Money ou MTN MoMo.
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-white/10 text-xs">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="font-bold text-white">Ticket 80mm</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Impression thermique</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="font-bold text-white">KDS Live</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Bons cuisine temps réel</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 col-span-2 sm:col-span-1">
                    <div className="font-bold text-white">Plan de salle</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Occupation & QR tables</div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 relative rounded-3xl overflow-hidden border border-slate-200 bg-white shadow-xs flex flex-col justify-between">
                <img
                  src="/src/assets/images/restaurant_terrace_bar_1792835866677.jpg"
                  alt="Ambiance Lounge & Restaurant"
                  className="w-full h-48 object-cover"
                />
                <div className="p-6 space-y-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-amber-700">02 · EXPÉRIENCE CLIENT</span>
                    <h3 className="font-bold text-base text-[#0B192C] mt-1">
                      Menus QR Code, Commande à Table & Suivi Direct
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                      Chaque établissement dispose de sa vitrine publique avec galerie, horaires, avis vérifiés et génération de QR Codes par table sans exposer vos données internes.
                    </p>
                  </div>
                  <button
                    onClick={() => navigateTo('register')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B192C] hover:text-amber-700 pt-2 cursor-pointer"
                  >
                    <span>Générer votre vitrine QR</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Clean Indexed Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div
                    key={i}
                    className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 hover:border-amber-400/60 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/70">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-400 tabular-nums">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <h3 className="font-bold text-[#0B192C] text-sm">{f.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* D. SECTION AVANTAGES (Deep Midnight Blue Band) */}
        <section className="bg-[#0B192C] text-white py-20 px-4 sm:px-6 md:px-10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-4 space-y-3">
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-[0.18em]">
                Bénéfices Concrets
              </div>
              <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-white tracking-tight text-balance">
                Pourquoi choisir RestaurantOS ?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Pensé pour la réalité du service quotidien : fiabilité hors-réseau local, contrôle de caisse rigoureux et simplicité de prise en main par toute l’équipe.
              </p>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {benefits.map((b, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <h4 className="font-bold text-white text-sm">{b.title}</h4>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SOLUTIONS PAR TYPE D'ÉTABLISSEMENT (#FAF9F6) */}
        <section id="solutions" className="bg-[#FAF9F6] text-slate-900 py-20 px-4 sm:px-6 md:px-10">
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-3">
                <div className="text-[11px] font-bold text-amber-700 uppercase tracking-[0.18em]">
                  Adapté à chaque concept
                </div>
                <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#0B192C] tracking-tight text-balance">
                  Une solution pour chaque type de restaurant
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
                  Du grill traditionnel au restaurant gastronomique ou groupe hôtelier, activez uniquement les modules utiles à votre format d’exploitation.
                </p>
              </div>
              <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                <img
                  src="/src/assets/images/dish_grilled_fish_1792835864516.jpg"
                  alt="Bar braisé gastronomique"
                  className="w-full h-36 object-cover rounded-2xl border border-slate-200 shadow-xs"
                />
                <img
                  src="/src/assets/images/dish_ndole_royal_1792835866049.jpg"
                  alt="Cuisine camerounaise authentique"
                  className="w-full h-36 object-cover rounded-2xl border border-slate-200 shadow-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {solutions.map((s, idx) => (
                <div
                  key={idx}
                  className="p-6 bg-white border border-slate-200 rounded-2xl space-y-2"
                >
                  <h4 className="font-bold text-[#0B192C] text-sm">{s.name}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TARIFS RÉELS (#0B192C) */}
        <section id="pricing" className="bg-[#0B192C] text-white py-20 px-4 sm:px-6 md:px-10">
          <div className="max-w-7xl mx-auto space-y-10">
            <div className="text-center space-y-2.5 max-w-xl mx-auto">
              <div className="text-[11px] font-bold text-amber-400 uppercase tracking-[0.18em]">
                Tarification Transparente
              </div>
              <h2 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-white tracking-tight text-balance">
                Des formules simples et adaptées à votre taille
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Facturation en Francs CFA (XAF) sans frais cachés ni engagement obligatoire.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {activePlans.slice(0, 3).map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-3xl border p-7 flex flex-col justify-between space-y-6 ${
                    plan.popular
                      ? 'bg-[#122642] border-amber-400 ring-2 ring-amber-400/20 shadow-2xl'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-lg text-white">{plan.name}</h3>
                      {plan.popular && (
                        <span className="text-[10px] font-bold text-slate-950 bg-amber-400 px-2 py-0.5 rounded-md">
                          Recommandé
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold font-mono tabular-nums text-white">
                        {formatCurrency(plan.priceXAF, 'XAF')}
                      </span>
                      <span className="text-xs text-slate-400">/ mois</span>
                    </div>
                    <p className="text-xs text-slate-300">{plan.descriptionFr}</p>

                    <div className="pt-4 border-t border-white/10 space-y-2">
                      {plan.featuresFr.map((feat, fidx) => (
                        <div key={fidx} className="flex items-center gap-2 text-xs text-slate-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => navigateTo('register')}
                    className={`w-full py-3 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                      plan.popular
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                  >
                    Commencer avec {plan.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ (#FAF9F6) */}
        <section id="faq" className="bg-[#FAF9F6] text-slate-900 py-20 px-4 sm:px-6 md:px-10">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <div className="text-[11px] font-bold text-amber-700 uppercase tracking-[0.18em]">
                Réponses Directes
              </div>
              <h2 className="font-serif-luxury text-3xl font-bold text-[#0B192C] tracking-tight">
                Questions fréquentes
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 text-xs sm:text-sm font-semibold text-[#0B192C] cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 shrink-0 transition-transform ${
                        activeFaq === idx ? 'rotate-180 text-amber-600' : ''
                      }`}
                    />
                  </button>
                  {activeFaq === idx && (
                    <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* E. PIED DE PAGE COMPLET */}
      <footer className="border-t border-white/10 bg-[#07111F] pt-12 pb-8 px-4 sm:px-6 md:px-10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-white/10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                R
              </div>
              <span className="font-bold text-white text-sm">RestaurantOS</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Plateforme SaaS professionnelle de gestion de restaurants développée par DATA WORK AGENCY.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-semibold text-white uppercase text-[11px] tracking-wider">Navigation</h5>
            <ul className="space-y-1.5 text-[11px]">
              <li><a href="#hero" className="hover:text-white">Accueil</a></li>
              <li><a href="#features" className="hover:text-white">Fonctionnalités</a></li>
              <li><a href="#solutions" className="hover:text-white">Solutions</a></li>
              <li><a href="#pricing" className="hover:text-white">Tarifs</a></li>
              <li>
                <button onClick={() => navigateTo('login')} className="hover:text-white cursor-pointer">
                  Connexion
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-semibold text-white uppercase text-[11px] tracking-wider">Contact & Support</h5>
            <ul className="space-y-1.5 text-[11px]">
              <li className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{agencyEmail}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="tabular-nums">{agencyPhone} (Douala / Yaoundé)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Instagram : {agencyInstagram}</span>
              </li>
              <li>
                <button
                  onClick={() => {
                    setContactSubmitted(false);
                    setModalType('contact');
                  }}
                  className="text-amber-400 hover:underline cursor-pointer"
                >
                  Demander une assistance dédiée
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-semibold text-white uppercase text-[11px] tracking-wider">Informations</h5>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button onClick={() => setModalType('terms')} className="hover:text-white cursor-pointer">
                  Mentions légales
                </button>
              </li>
              <li>
                <button onClick={() => setModalType('privacy')} className="hover:text-white cursor-pointer">
                  Politique de confidentialité
                </button>
              </li>
              <li>Version : v2.5 Multi-Tenants</li>
            </ul>
          </div>
        </div>

        {/* Required Attribution Signature */}
        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-slate-400 text-[11px]">
          <div>
            RestaurantOS — Une solution développée par <strong className="text-slate-200">DATA WORK AGENCY</strong>
          </div>
          <div>
            © {new Date().getFullYear()} DATA WORK AGENCY. Tous droits réservés.
          </div>
        </div>
      </footer>

      {/* Simple Modals for Contact, Terms & Privacy */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0F213B] border border-white/15 rounded-2xl max-w-md w-full p-6 text-xs space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-bold text-white text-sm">
                {modalType === 'contact' && 'Contacter DATA WORK AGENCY'}
                {modalType === 'terms' && 'Mentions Légales'}
                {modalType === 'privacy' && 'Politique de Confidentialité'}
              </h4>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalType === 'contact' && (
              <div className="space-y-3">
                <p className="text-slate-300 leading-relaxed">
                  L’équipe d’ingénieurs et de support DATA WORK AGENCY est à votre écoute pour déployer RestaurantOS dans vos établissements.
                </p>
                <div className="p-3 bg-[#0B192C] rounded-xl space-y-1.5 border border-white/10 text-[11px] text-slate-200">
                  <div><strong>Email :</strong> {agencyEmail}</div>
                  <div><strong>Téléphone :</strong> {agencyPhone}</div>
                  <div><strong>Instagram :</strong> {agencyInstagram}</div>
                  <div><strong>Éditeur :</strong> DATA WORK AGENCY (Cameroun & International)</div>
                </div>

                {contactSubmitted ? (
                  <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-200 space-y-1 text-xs">
                    <div className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Demande transmise à DATA WORK AGENCY</span>
                    </div>
                    <p className="text-[11px] text-emerald-100/90">
                      Votre ticket est enregistré dans notre console support. Notre équipe vous contactera rapidement par téléphone ou e-mail.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!supportForm.requesterName.trim() || !supportForm.requesterEmail.trim() || !supportForm.message.trim()) return;
                      submitSupportTicket({
                        requesterName: supportForm.requesterName.trim(),
                        restaurantName: supportForm.restaurantName.trim() || 'Nouveau Prospect',
                        requesterEmail: supportForm.requesterEmail.trim(),
                        requesterPhone: supportForm.requesterPhone.trim(),
                        subject: supportForm.subject.trim() || 'Assistance RestaurantOS',
                        message: supportForm.message.trim(),
                        priority: 'normal',
                      });
                      setContactSubmitted(true);
                      setSupportForm({
                        requesterName: '',
                        restaurantName: '',
                        requesterEmail: '',
                        requesterPhone: '',
                        subject: 'Demande de démonstration / déploiement',
                        message: '',
                      });
                    }}
                    className="space-y-2.5 pt-1"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Votre nom *"
                        value={supportForm.requesterName}
                        onChange={(e) => setSupportForm({ ...supportForm, requesterName: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#0B192C] border border-white/15 text-white placeholder:text-slate-400 text-xs focus:outline-none focus:border-amber-400"
                      />
                      <input
                        type="text"
                        placeholder="Nom du restaurant"
                        value={supportForm.restaurantName}
                        onChange={(e) => setSupportForm({ ...supportForm, restaurantName: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#0B192C] border border-white/15 text-white placeholder:text-slate-400 text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="email"
                        required
                        placeholder="Email professionnel *"
                        value={supportForm.requesterEmail}
                        onChange={(e) => setSupportForm({ ...supportForm, requesterEmail: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#0B192C] border border-white/15 text-white placeholder:text-slate-400 text-xs focus:outline-none focus:border-amber-400"
                      />
                      <input
                        type="text"
                        placeholder="Téléphone (+237...)"
                        value={supportForm.requesterPhone}
                        onChange={(e) => setSupportForm({ ...supportForm, requesterPhone: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#0B192C] border border-white/15 text-white placeholder:text-slate-400 text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Objet de votre demande"
                      value={supportForm.subject}
                      onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#0B192C] border border-white/15 text-white placeholder:text-slate-400 text-xs focus:outline-none focus:border-amber-400"
                    />
                    <textarea
                      required
                      rows={3}
                      placeholder="Décrivez votre besoin (nombre d'établissements, caisse POS, menu QR, formation...)"
                      value={supportForm.message}
                      onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[#0B192C] border border-white/15 text-white placeholder:text-slate-400 text-xs focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Envoyer la demande à DATA WORK AGENCY
                    </button>
                  </form>
                )}
              </div>
            )}

            {modalType === 'terms' && (
              <div className="space-y-2 text-slate-300 leading-relaxed text-[11px]">
                <p>RestaurantOS est un service SaaS édité et maintenu par DATA WORK AGENCY.</p>
                <p>Les données commerciales de chaque établissement sont isolées au niveau logiciel et protégées conformément aux réglementations applicables.</p>
              </div>
            )}

            {modalType === 'privacy' && (
              <div className="space-y-2 text-slate-300 leading-relaxed text-[11px]">
                <p>Vos données de vente, d’ingrédients et de personnel restent la propriété exclusive de votre restaurant.</p>
                <p>DATA WORK AGENCY n’exploite ni ne commercialise vos informations opérationnelles auprès de tiers.</p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
