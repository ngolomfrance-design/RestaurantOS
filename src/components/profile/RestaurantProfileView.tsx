import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useTranslation } from '../../translations';
import { OpeningHourDay, SocialLinks } from '../../types/restaurant';
import {
  Store,
  Camera,
  Image as ImageIcon,
  Clock,
  Share2,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  CheckCircle2,
  Save,
  Globe,
  MapPin,
  Phone,
  MessageCircle,
  Instagram,
  Facebook,
  Eye,
  AlertCircle,
} from 'lucide-react';

export const RestaurantProfileView: React.FC = () => {
  const {
    activeOrganization,
    updateOrganizationProfile,
    addGalleryImage,
    removeGalleryImage,
    reorderGalleryImages,
    navigateTo,
    openPublicStorefront,
    language,
  } = useRestaurant();
  const t = useTranslation(language);

  const [activeTab, setActiveTab] = useState<'profile' | 'gallery' | 'hours' | 'social'>('profile');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const defaultHours: OpeningHourDay[] = [
    { day: 'Lundi', open: '11:00', close: '23:30', isClosed: false },
    { day: 'Mardi', open: '11:00', close: '23:30', isClosed: false },
    { day: 'Mercredi', open: '11:00', close: '23:30', isClosed: false },
    { day: 'Jeudi', open: '11:00', close: '23:30', isClosed: false },
    { day: 'Vendredi', open: '11:00', close: '01:00', isClosed: false },
    { day: 'Samedi', open: '11:00', close: '02:00', isClosed: false },
    { day: 'Dimanche', open: '12:00', close: '23:00', isClosed: false },
  ];

  // Form states initialized with activeOrganization
  const [name, setName] = useState(activeOrganization.name);
  const [description, setDescription] = useState(activeOrganization.description || '');
  const [phone, setPhone] = useState(activeOrganization.phone);
  const [email, setEmail] = useState(activeOrganization.email);
  const [address, setAddress] = useState(activeOrganization.address);
  const [city, setCity] = useState(activeOrganization.city);
  const [country, setCountry] = useState(activeOrganization.country);
  const [coverImage, setCoverImage] = useState(activeOrganization.coverImage || '');
  const [logo, setLogo] = useState(activeOrganization.logo || '');

  // Social Links state
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(
    activeOrganization.socialLinks || {
      whatsapp: '',
      phone: activeOrganization.phone,
      facebook: '',
      instagram: '',
      tiktok: '',
      googleMaps: '',
      website: '',
    }
  );

  const [hoursSchedule, setHoursSchedule] = useState<OpeningHourDay[]>(
    activeOrganization.businessHoursSchedule || defaultHours
  );

  // New gallery image input
  const [newImageUrl, setNewImageUrl] = useState('');
  const [imageError, setImageError] = useState('');

  useEffect(() => {
    setName(activeOrganization.name);
    setDescription(activeOrganization.description || '');
    setPhone(activeOrganization.phone);
    setEmail(activeOrganization.email);
    setAddress(activeOrganization.address);
    setCity(activeOrganization.city);
    setCountry(activeOrganization.country);
    setCoverImage(activeOrganization.coverImage || '');
    setLogo(activeOrganization.logo || '');
    setSocialLinks(
      activeOrganization.socialLinks || {
        whatsapp: '',
        phone: activeOrganization.phone,
        facebook: '',
        instagram: '',
        tiktok: '',
        googleMaps: '',
        website: '',
      }
    );
    setHoursSchedule(activeOrganization.businessHoursSchedule || defaultHours);
    setSaveSuccess(false);
    setImageError('');
  }, [activeOrganization.id]);

  const galleryList = activeOrganization.gallery || [];

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrganizationProfile({
      name,
      description,
      phone,
      email,
      address,
      city,
      country,
      coverImage,
      logo,
      socialLinks,
      businessHoursSchedule: hoursSchedule,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAddImage = () => {
    if (!newImageUrl.trim()) {
      setImageError(language === 'fr' ? 'Veuillez saisir une URL d’image valide.' : 'Please enter a valid image URL.');
      return;
    }
    addGalleryImage(newImageUrl.trim());
    setNewImageUrl('');
    setImageError('');
  };

  const handleHourChange = (index: number, field: keyof OpeningHourDay, value: any) => {
    const updated = [...hoursSchedule];
    updated[index] = { ...updated[index], [field]: value };
    setHoursSchedule(updated);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 dark:bg-slate-800 text-amber-400 font-bold flex items-center justify-center text-xl shrink-0 overflow-hidden shadow-xs border border-slate-800 dark:border-slate-700">
            {logo ? (
              <img
                src={logo}
                alt={activeOrganization.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
                className="w-full h-full object-cover"
              />
            ) : (
              activeOrganization.name.charAt(0)
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase font-bold tracking-wider text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-800/60">
                {activeOrganization.type.toUpperCase()}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 capitalize">· {activeOrganization.city}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
              {activeOrganization.name} — Profil & Vitrine
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Personnalisation visuelle, galerie photos, horaires d’ouverture et liens sociaux de votre établissement.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => openPublicStorefront(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
            title="Voir la vitrine publique du restaurant"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>{language === 'fr' ? 'Voir comme un client' : 'View as Customer'}</span>
          </button>
          <button
            onClick={handleSaveGeneral}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white dark:text-slate-950 bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 rounded-xl shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <Save className="w-3.5 h-3.5 text-amber-400 dark:text-slate-950" />
            <span>{language === 'fr' ? 'Enregistrer les Modifications' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Profil et vitrine du restaurant enregistrés avec succès.</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Identité & Visuels</span>
        </button>

        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'gallery'
              ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Galerie Photos ({galleryList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('hours')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'hours'
              ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Horaires d’Ouverture</span>
        </button>

        <button
          onClick={() => setActiveTab('social')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'social'
              ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Share2 className="w-4 h-4" />
          <span>Réseaux Sociaux & Contact</span>
        </button>
      </div>

      {/* ================= TAB 1: IDENTITÉ & VISUELS ================= */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveGeneral} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              Coordonnées Officielles du Restaurant
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Nom commercial de l’établissement</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Slogan ou Description courte</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex : Braiserie contemporaine et lounge..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Téléphone de l’établissement (réservations)</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl font-mono tabular-nums"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">E-mail de contact du restaurant</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Adresse géographique complète</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Ex : Rue des Palmiers, Quartier Bonapriso"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Ville</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Pays</label>
                <input
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Cover & Logo visual preview */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
              Photo de Couverture & Logo
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <label className="font-semibold text-slate-700 dark:text-slate-300">URL Photo de Couverture (Bannière)</label>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="/src/assets/images/... ou URL HTTPS"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl font-mono text-xs"
                />
                {coverImage && (
                  <div className="h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                    <img
                      src={coverImage}
                      alt="Cover Preview"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/src/assets/images/hero_restaurant_os_1792835865372.jpg';
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="font-semibold text-slate-700 dark:text-slate-300">URL Logo de l’Établissement</label>
                <input
                  type="text"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="URL du logo carré ou rond"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl font-mono text-xs"
                />
                {logo && (
                  <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                    <img
                      src={logo}
                      alt="Logo Preview"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Enregistrer les Coordonnées
            </button>
          </div>
        </form>
      )}

      {/* ================= TAB 2: GALERIE PHOTOS ================= */}
      {activeTab === 'gallery' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Galerie d’Images & Ambiance</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ces photos s'affichent sur votre menu QR et vitrine publique pour attirer les convives.
              </p>
            </div>
          </div>

          {/* Add Image Box */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3 text-xs">
            <div className="font-semibold text-slate-800 dark:text-slate-200">Ajouter une nouvelle photo</div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newImageUrl}
                onChange={(e) => {
                  setNewImageUrl(e.target.value);
                  setImageError('');
                }}
                placeholder="Entrez l'URL de l'image (ex: /src/assets/images/... ou lien web)"
                className="flex-1 px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl font-mono text-xs"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-4 py-2 bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5 text-amber-400 dark:text-slate-950" />
                <span>Ajouter</span>
              </button>
            </div>
            {imageError && (
              <p className="text-rose-600 dark:text-rose-400 text-[11px] font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{imageError}</span>
              </p>
            )}
          </div>

          {/* Photos Grid with Reorder and Delete */}
          {galleryList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryList.map((imgUrl, index) => (
                <div
                  key={index}
                  className="group relative bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xs aspect-4/3 flex flex-col justify-between"
                >
                  <img
                    src={imgUrl}
                    alt={`Photo restaurant ${index + 1}`}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/src/assets/images/restaurant_terrace_bar_1792835866677.jpg';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Overlay Controls */}
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-between">
                    <div className="flex justify-between items-center text-white">
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-900/80 rounded-md tabular-nums">
                        #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors cursor-pointer"
                        title="Supprimer la photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex justify-center gap-2">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => reorderGalleryImages(index, index - 1)}
                          className="px-2.5 py-1 bg-white/90 hover:bg-white text-slate-800 text-[11px] font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                          title="Déplacer vers la gauche"
                        >
                          <ArrowUp className="w-3 h-3 rotate-270" />
                          <span>Précédent</span>
                        </button>
                      )}
                      {index < galleryList.length - 1 && (
                        <button
                          type="button"
                          onClick={() => reorderGalleryImages(index, index + 1)}
                          className="px-2.5 py-1 bg-white/90 hover:bg-white text-slate-800 text-[11px] font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                          title="Déplacer vers la droite"
                        >
                          <span>Suivant</span>
                          <ArrowDown className="w-3 h-3 rotate-270" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500 space-y-2">
              <Camera className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p>Aucune photo dans la galerie.</p>
              <p className="text-[11px]">Ajoutez les plus beaux clichés de vos plats et de votre salle pour séduire vos clients.</p>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: HORAIRES D'OUVERTURE ================= */}
      {activeTab === 'hours' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Horaires d’Ouverture Hebdomadaires</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Renseignez les plages de service affichées sur votre vitrine publique et sur Google Maps.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveGeneral}
              className="px-4 py-2 bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
            >
              Enregistrer Horaires
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {hoursSchedule.map((schedule, idx) => (
              <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="w-28 font-bold text-slate-800 dark:text-slate-200">{schedule.day}</div>

                <div className="flex items-center gap-4 flex-wrap">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={schedule.isClosed}
                      onChange={(e) => handleHourChange(idx, 'isClosed', e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Fermé</span>
                  </label>

                  {!schedule.isClosed ? (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 dark:text-slate-500">De</span>
                      <input
                        type="time"
                        value={schedule.open}
                        onChange={(e) => handleHourChange(idx, 'open', e.target.value)}
                        className="px-2.5 py-1 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg font-mono tabular-nums text-xs"
                      />
                      <span className="text-slate-400 dark:text-slate-500">à</span>
                      <input
                        type="time"
                        value={schedule.close}
                        onChange={(e) => handleHourChange(idx, 'close', e.target.value)}
                        className="px-2.5 py-1 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-lg font-mono tabular-nums text-xs"
                      />
                    </div>
                  ) : (
                    <span className="text-rose-500 dark:text-rose-400 italic text-[11px]">Établissement fermé ce jour</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 4: RÉSEAUX SOCIAUX & CONTACT DU RESTAURANT ================= */}
      {activeTab === 'social' && (
        <form onSubmit={handleSaveGeneral} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Liens Réseaux Sociaux & Contact Direct du Restaurant
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ces liens permettent à vos clients de vous contacter directement sur WhatsApp, de réserver ou de trouver votre restaurant sur Google Maps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>WhatsApp Commandes & Réservations (avec indicatif)</span>
              </label>
              <input
                type="text"
                value={socialLinks.whatsapp || ''}
                onChange={(e) => setSocialLinks({ ...socialLinks, whatsapp: e.target.value })}
                placeholder="+237699458812"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl font-mono tabular-nums"
              />
              <span className="text-[10px] text-slate-400 dark:text-slate-500">Génère un lien direct https://wa.me/ sur votre menu</span>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400" />
                <span>Nom de compte Instagram du restaurant</span>
              </label>
              <input
                type="text"
                value={socialLinks.instagram || ''}
                onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                placeholder="Ex : lewourigourmet"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Facebook className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Page Facebook</span>
              </label>
              <input
                type="text"
                value={socialLinks.facebook || ''}
                onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                placeholder="https://facebook.com/..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-slate-800 dark:text-slate-300" />
                <span>Compte TikTok du restaurant</span>
              </label>
              <input
                type="text"
                value={socialLinks.tiktok || ''}
                onChange={(e) => setSocialLinks({ ...socialLinks, tiktok: e.target.value })}
                placeholder="@nomdurestaurant"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>Lien Google Maps / Itinéraire</span>
              </label>
              <input
                type="text"
                value={socialLinks.googleMaps || ''}
                onChange={(e) => setSocialLinks({ ...socialLinks, googleMaps: e.target.value })}
                placeholder="https://maps.google.com/?q=..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                <span>Site Internet Officiel (optionnel)</span>
              </label>
              <input
                type="text"
                value={socialLinks.website || ''}
                onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Enregistrer les Liens Sociaux
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
