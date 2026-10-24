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
} from 'lucide-react';

export const MarketingWebsite: React.FC = () => {
  const { navigateTo, language, setLanguage, loginDemo } = useRestaurant();
  const t = useTranslation(language);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [modalType, setModalType] = useState<'contact' | 'terms' | 'privacy' | null>(null);
  const [contactSubmitted, setContactSubmitted] = useState(false);

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500/20 selection:text-amber-300">
      {/* A. BARRE DE NAVIGATION */}
      <header className="h-16 px-4 md:px-12 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50 flex items-center justify-between gap-4">
        {/* Logo RestaurantOS */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-bold flex items-center justify-center text-sm shadow-xs">
            R
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white block leading-tight">
              RestaurantOS
            </span>
            <span className="text-[10px] text-amber-400 font-medium tracking-wider block uppercase">
              DATA WORK AGENCY
            </span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
          <a href="#hero" className="hover:text-white transition-colors">
            Accueil
          </a>
          <a href="#features" className="hover:text-white transition-colors">
            Fonctionnalités
          </a>
          <a href="#solutions" className="hover:text-white transition-colors">
            Solutions
          </a>
          <a href="#pricing" className="hover:text-white transition-colors">
            Tarifs
          </a>
          <a href="#faq" className="hover:text-white transition-colors">
            FAQ
          </a>
        </nav>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Language toggle */}
          <button
            onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
            className="text-xs font-semibold uppercase text-slate-400 hover:text-white transition-colors px-2 py-1 rounded"
          >
            {language}
          </button>

          {/* Connexion */}
          <button
            onClick={() => navigateTo('login')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
          >
            Connexion
          </button>

          {/* Bouton principal « Commencer gratuitement » */}
          <button
            onClick={() => navigateTo('register')}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg shadow-sm transition-colors whitespace-nowrap cursor-pointer"
          >
            Commencer gratuitement
          </button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-3 text-xs">
          <a
            href="#hero"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-300 hover:text-white"
          >
            Accueil
          </a>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-300 hover:text-white"
          >
            Fonctionnalités
          </a>
          <a
            href="#solutions"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-300 hover:text-white"
          >
            Solutions
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-300 hover:text-white"
          >
            Tarifs
          </a>
          <div className="pt-2 border-t border-slate-800 flex gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigateTo('login');
              }}
              className="flex-1 py-2 text-center bg-slate-800 text-white rounded-lg font-semibold"
            >
              Connexion
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigateTo('register');
              }}
              className="flex-1 py-2 text-center bg-amber-500 text-slate-950 rounded-lg font-bold"
            >
              Créer mon compte
            </button>
          </div>
        </div>
      )}

      {/* Main Flow */}
      <main className="space-y-24 pb-20">
        {/* B. SECTION HERO */}
        <section id="hero" className="px-4 sm:px-6 md:px-12 pt-12 md:pt-20 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                <span>Logiciel SaaS de Gestion de Restaurant</span>
              </div>

              {/* Titre officiel exigé */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
                Gérez votre restaurant intelligemment.
              </h1>

              {/* Sous-titre officiel exigé */}
              <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                RestaurantOS centralise vos opérations, vos commandes, vos stocks et vos performances pour vous aider à piloter votre établissement plus efficacement.
              </p>

              {/* Boutons officiels exigés */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => navigateTo('register')}
                  className="w-full sm:w-auto px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Commencer gratuitement</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <a
                  href="#features"
                  className="w-full sm:w-auto px-5 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <span>Découvrir les fonctionnalités</span>
                </a>
              </div>

              {/* Accès Démo direct */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 text-xs text-slate-400">
                <button
                  onClick={() => loginDemo()}
                  className="text-amber-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Tester immédiatement le restaurant de démonstration (Le Wouri Gourmet) →</span>
                </button>
              </div>
            </div>

            {/* Visual SaaS App Mockup Presentation */}
            <div className="lg:col-span-5">
              <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-semibold text-slate-200">Aperçu Caisse & Salle</span>
                  </div>
                  <span className="text-[11px] text-amber-400 font-mono">Devise : XAF</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Commandes en cours</span>
                    <span className="text-xl font-bold text-white">12 actives</span>
                    <span className="text-[10px] text-emerald-400 block mt-1">Cuisine & Salle synchronisées</span>
                  </div>
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Tables occupées</span>
                    <span className="text-xl font-bold text-amber-400">8 / 16 tables</span>
                    <span className="text-[10px] text-slate-400 block mt-1">Plan interactif</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <span>Dernières ventes</span>
                    <span>Montant</span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800">
                    <span>1x Bar braisé royal (Table 4)</span>
                    <span className="font-mono text-amber-400">8 500 XAF</span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1 border-b border-slate-800">
                    <span>2x Ndolé crevettes (Table 2)</span>
                    <span className="font-mono text-amber-400">13 000 XAF</span>
                  </div>
                  <div className="flex items-center justify-between text-xs py-1">
                    <span>1x Cocktail Wouri (Bar)</span>
                    <span className="font-mono text-amber-400">3 500 XAF</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* C. SECTION FONCTIONNALITÉS RÉELLES */}
        <section id="features" className="px-4 sm:px-6 md:px-12 max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Fonctionnalités Opérationnelles
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Tout ce dont votre établissement a besoin pour réussir
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Chaque module a été conçu pour répondre aux exigences réelles de la restauration en Afrique et à l’international.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-3 hover:border-slate-700 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white text-base">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* D. SECTION AVANTAGES */}
        <section className="px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12 space-y-8">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Bénéfices Concrets
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Pourquoi choisir RestaurantOS ?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
              {benefits.map((b, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <h4 className="font-bold text-white text-sm">{b.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pl-6">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SOLUTIONS PAR TYPE D'ÉTABLISSEMENT */}
        <section id="solutions" className="px-4 sm:px-6 md:px-12 max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Adapté à chaque concept
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Une solution pour chaque type de restaurant
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {solutions.map((s, idx) => (
              <div
                key={idx}
                className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl space-y-2"
              >
                <h4 className="font-bold text-white text-sm">{s.name}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TARIFS RÉELS */}
        <section id="pricing" className="px-4 sm:px-6 md:px-12 max-w-7xl mx-auto space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Tarification Transparente
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Des formules simples et adaptées à votre taille
            </h2>
            <p className="text-xs text-slate-400">
              Facturation en Francs CFA (XAF) sans frais cachés ni engagement obligatoire.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {INITIAL_SUBSCRIPTION_PLANS.slice(0, 3).map((plan) => (
              <div
                key={plan.id}
                className={`bg-slate-900/80 rounded-2xl border p-6 flex flex-col justify-between space-y-6 ${
                  plan.popular
                    ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-xl'
                    : 'border-slate-800'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-white">{plan.name}</h3>
                    {plan.popular && (
                      <span className="text-[10px] font-bold text-amber-950 bg-amber-400 px-2 py-0.5 rounded">
                        Recommandé
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-white">
                      {formatCurrency(plan.priceXAF, 'XAF')}
                    </span>
                    <span className="text-xs text-slate-400">/ mois</span>
                  </div>
                  <p className="text-xs text-slate-400">{plan.descriptionFr}</p>

                  <div className="pt-4 border-t border-slate-800 space-y-2">
                    {plan.featuresFr.map((feat, fidx) => (
                      <div key={fidx} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => navigateTo('register')}
                  className={`w-full py-2.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                    plan.popular
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  Commencer avec {plan.name}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="px-4 sm:px-6 md:px-12 max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">Questions fréquentes</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-200"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      activeFaq === idx ? 'rotate-180 text-amber-400' : ''
                    }`}
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* E. PIED DE PAGE COMPLET */}
      <footer className="border-t border-slate-800/80 bg-slate-950 pt-12 pb-8 px-4 sm:px-6 md:px-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-slate-900">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                R
              </div>
              <span className="font-bold text-white text-sm">RestaurantOS</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
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
                <button onClick={() => navigateTo('login')} className="hover:text-white">
                  Connexion
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-semibold text-white uppercase text-[11px] tracking-wider">Contact & Support</h5>
            <ul className="space-y-1.5 text-[11px]">
              <li className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>contact@dataworkagency.cm</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>+237 699 45 88 12 (Douala, Cameroun)</span>
              </li>
              <li>
                <button
                  onClick={() => setModalType('contact')}
                  className="text-amber-400 hover:underline"
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
                <button onClick={() => setModalType('terms')} className="hover:text-white">
                  Mentions légales
                </button>
              </li>
              <li>
                <button onClick={() => setModalType('privacy')} className="hover:text-white">
                  Politique de confidentialité
                </button>
              </li>
              <li>Version : v2.4 Multi-Tenants</li>
            </ul>
          </div>
        </div>

        {/* Required Attribution Signature */}
        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-slate-500 text-[11px]">
          <div>
            RestaurantOS — Une solution développée par <strong className="text-slate-300">DATA WORK AGENCY</strong>
          </div>
          <div>
            © {new Date().getFullYear()} DATA WORK AGENCY. Tous droits réservés.
          </div>
        </div>
      </footer>

      {/* Simple Modals for Contact, Terms & Privacy */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-xs space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-bold text-white text-sm">
                {modalType === 'contact' && 'Contacter DATA WORK AGENCY'}
                {modalType === 'terms' && 'Mentions Légales'}
                {modalType === 'privacy' && 'Politique de Confidentialité'}
              </h4>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalType === 'contact' && (
              <div className="space-y-3">
                <p className="text-slate-300 leading-relaxed">
                  L’équipe d’ingénieurs et de support DATA WORK AGENCY est à votre écoute pour déployer RestaurantOS dans vos établissements.
                </p>
                <div className="p-3 bg-slate-950 rounded-xl space-y-1 border border-slate-800 text-[11px]">
                  <div><strong>Email :</strong> contact@dataworkagency.cm</div>
                  <div><strong>Téléphone :</strong> +237 699 45 88 12</div>
                  <div><strong>Siège :</strong> Douala / Yaoundé, Cameroun</div>
                </div>
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
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold"
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
