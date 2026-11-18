import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useTranslation } from '../../translations';
import { CustomerReview } from '../../types/restaurant';
import {
  Star,
  ShieldCheck,
  EyeOff,
  Eye,
  Flag,
  MessageSquare,
  Pin,
  Trash2,
  Plus,
  Send,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Calendar,
  X,
  Filter,
} from 'lucide-react';

export const ReviewsManagement: React.FC = () => {
  const {
    activeOrganization,
    scopedReviews,
    scopedInternalNotes,
    updateReviewStatus,
    replyToReview,
    addInternalNote,
    togglePinNote,
    deleteInternalNote,
    currentUser,
    language,
  } = useRestaurant();
  const t = useTranslation(language);

  const [activeTab, setActiveTab] = useState<'reviews' | 'notes'>('reviews');
  const [reviewFilter, setReviewFilter] = useState<'all' | 'published' | 'hidden' | 'flagged' | 'verified'>('all');

  // Replying state
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Internal Note form state
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteUrgency, setNoteUrgency] = useState<'low' | 'medium' | 'high'>('medium');

  // Dynamic calculations for reviews
  const publishedReviews = scopedReviews.filter((r) => r.status === 'published');
  const totalReviewsCount = scopedReviews.length;
  const averageRating =
    publishedReviews.length > 0
      ? Math.round(
          (publishedReviews.reduce((sum, r) => sum + r.rating, 0) / publishedReviews.length) * 10
        ) / 10
      : 5.0;

  // Rating star counts
  const starCounts = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: publishedReviews.filter((r) => r.rating === stars).length,
    percent:
      publishedReviews.length > 0
        ? Math.round((publishedReviews.filter((r) => r.rating === stars).length / publishedReviews.length) * 100)
        : 0,
  }));

  // Filtered reviews
  const filteredReviews = scopedReviews.filter((r) => {
    if (reviewFilter === 'published') return r.status === 'published';
    if (reviewFilter === 'hidden') return r.status === 'hidden';
    if (reviewFilter === 'flagged') return r.status === 'flagged';
    if (reviewFilter === 'verified') return r.isVerifiedOrder;
    return true;
  });

  const handleSendReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    replyToReview(reviewId, replyText.trim());
    setReplyText('');
    setReplyingReviewId(null);
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;
    addInternalNote(noteTitle.trim(), noteContent.trim(), noteUrgency);
    setNoteTitle('');
    setNoteContent('');
    setNoteUrgency('medium');
    setShowAddNoteModal(false);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold tracking-wider uppercase text-amber-700 dark:text-amber-400">
              {activeOrganization.name}
            </span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{activeOrganization.city}</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            {language === 'fr' ? 'Avis Clients & Notes Internes de Service' : 'Customer Reviews & Staff Notes'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'fr'
              ? 'Modérez les avis de vos convives, répondez publiquement et partagez des consignes privées d’équipe.'
              : 'Moderate customer reviews, reply publicly, and communicate private internal team instructions.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activeTab === 'notes' && (
            <button
              onClick={() => setShowAddNoteModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0B192C] dark:bg-amber-500 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-amber-400 rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400 dark:text-slate-950" />
              <span>{language === 'fr' ? 'Nouvelle Note Interne' : 'New Internal Note'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'reviews'
              ? 'bg-[#0B192C] dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Star className={`w-4 h-4 ${activeTab === 'reviews' ? 'text-amber-400 fill-amber-400 dark:text-slate-950 dark:fill-slate-950' : 'text-amber-500 fill-amber-500'}`} />
          <span>{language === 'fr' ? 'Avis Clients & Modération' : 'Customer Reviews'}</span>
          <span className="font-mono tabular-nums opacity-80">({scopedReviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
            activeTab === 'notes'
              ? 'bg-[#0B192C] dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Lock className={`w-4 h-4 ${activeTab === 'notes' ? 'text-amber-400 dark:text-slate-950' : 'text-amber-600 dark:text-amber-400'}`} />
          <span>{language === 'fr' ? 'Notes Internes de Service (Privé)' : 'Internal Staff Notes'}</span>
          <span className="font-mono tabular-nums opacity-80">({scopedInternalNotes.length})</span>
        </button>
      </div>

      {/* ================= TAB 1: AVIS CLIENTS & MODÉRATION ================= */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          {/* Average Rating KPI Header Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="text-center md:text-left space-y-1">
              <div className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums tracking-tight">
                {averageRating} <span className="text-lg text-slate-400">/ 5</span>
              </div>
              <div className="flex justify-center md:justify-start items-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(averageRating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200 dark:text-slate-700'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                Basé sur {publishedReviews.length} avis publiés ({totalReviewsCount} au total)
              </p>
            </div>

            {/* Star Distribution Progress Bars */}
            <div className="md:col-span-2 space-y-1.5 text-xs">
              {starCounts.map((item) => (
                <div key={item.stars} className="flex items-center gap-3">
                  <span className="w-8 font-semibold font-mono tabular-nums text-slate-600 dark:text-slate-300">{item.stars} ★</span>
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-mono tabular-nums text-slate-400 dark:text-slate-500">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-semibold mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Filtrer :</span>
            </span>
            <button
              onClick={() => setReviewFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                reviewFilter === 'all'
                  ? 'bg-[#0B192C] dark:bg-amber-500 text-white dark:text-slate-950'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Tous ({scopedReviews.length})
            </button>
            <button
              onClick={() => setReviewFilter('verified')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                reviewFilter === 'verified'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Commandes vérifiées</span>
            </button>
            <button
              onClick={() => setReviewFilter('published')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                reviewFilter === 'published'
                  ? 'bg-[#0B192C] dark:bg-amber-500 text-white dark:text-slate-950'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Publiés
            </button>
            <button
              onClick={() => setReviewFilter('hidden')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                reviewFilter === 'hidden'
                  ? 'bg-[#0B192C] dark:bg-amber-500 text-white dark:text-slate-950'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Masqués
            </button>
            <button
              onClick={() => setReviewFilter('flagged')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                reviewFilter === 'flagged'
                  ? 'bg-rose-700 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Signalés
            </button>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            {filteredReviews.length > 0 ? (
              filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className={`bg-white dark:bg-slate-900 border rounded-3xl p-5 shadow-xs space-y-4 transition-all ${
                    rev.status === 'hidden'
                      ? 'border-slate-300 dark:border-slate-700 opacity-65 bg-slate-50/50 dark:bg-slate-900/50'
                      : rev.status === 'flagged'
                      ? 'border-rose-300 dark:border-rose-800 bg-rose-50/20 dark:bg-rose-950/20'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#0B192C] dark:bg-amber-500 text-amber-400 dark:text-slate-950 font-bold flex items-center justify-center text-xs shrink-0">
                        {rev.customerName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-xs">{rev.customerName}</span>
                          {rev.isVerifiedOrder && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 tabular-nums">
                              <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                              <span>Commande vérifiée {rev.orderNumber ? `(${rev.orderNumber})` : ''}</span>
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                          {new Date(rev.createdAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Rating Stars */}
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Moderation Badges */}
                      {rev.status === 'hidden' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md">
                          Masqué
                        </span>
                      )}
                      {rev.status === 'flagged' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded-md">
                          Signalé
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Comment Body */}
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                    « {rev.comment} »
                  </p>

                  {/* Public Reply if existing */}
                  {rev.reply && (
                    <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/50 rounded-2xl space-y-1 text-xs">
                      <div className="flex items-center justify-between text-amber-900 dark:text-amber-300 font-semibold text-[11px]">
                        <span>Réponse officielle de {rev.reply.authorName} :</span>
                        <span className="text-slate-500 dark:text-slate-400 font-normal tabular-nums">
                          {new Date(rev.reply.repliedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                        {rev.reply.text}
                      </p>
                    </div>
                  )}

                  {/* Moderation Actions Toolbar */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateReviewStatus(rev.id, rev.status === 'hidden' ? 'published' : 'hidden')}
                        className="flex items-center gap-1 px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {rev.status === 'hidden' ? (
                          <>
                            <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Publier l'avis</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                            <span>Masquer</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => updateReviewStatus(rev.id, rev.status === 'flagged' ? 'published' : 'flagged')}
                        className="flex items-center gap-1 px-2.5 py-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <Flag className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                        <span>{rev.status === 'flagged' ? 'Annuler signalement' : 'Signaler'}</span>
                      </button>
                    </div>

                    {!rev.reply && replyingReviewId !== rev.id && (
                      <button
                        onClick={() => {
                          setReplyingReviewId(rev.id);
                          setReplyText('');
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0B192C] dark:bg-amber-500 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-amber-400 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-amber-400 dark:text-slate-950" />
                        <span>Répondre publiquement</span>
                      </button>
                    )}
                  </div>

                  {/* Reply Input Box */}
                  {replyingReviewId === rev.id && (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        Votre réponse officielle à {rev.customerName} :
                      </div>
                      <textarea
                        rows={2}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Remerciez le client et partagez votre engagement qualité..."
                        className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setReplyingReviewId(null)}
                          className="px-3 py-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={() => handleSendReply(rev.id)}
                          className="flex items-center gap-1 px-4 py-1.5 bg-[#0B192C] dark:bg-amber-500 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-amber-400 text-white font-semibold rounded-lg cursor-pointer whitespace-nowrap"
                        >
                          <Send className="w-3 h-3 text-amber-400 dark:text-slate-950" />
                          <span>Publier la réponse</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-2">
                <Star className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <p>Aucun avis trouvé pour ce filtre.</p>
                <p className="text-[11px]">Les avis laissés par vos clients apparaîtront ici avec le badge « Commande vérifiée ».</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: NOTES INTERNES DE SERVICE ================= */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
            <Lock className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Espace Privé d'Équipe (Cahier de Liaison) :</span>
              <p className="text-[11px] text-amber-800 dark:text-amber-300/90 mt-0.5 leading-relaxed">
                Ces notes sont strictement confidentielles et ne sont jamais visibles sur le menu public ou pour les clients. Utilisez-les pour les consignes de service, allergies signalées, consignes de caisse ou rappels d'inventaire.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {scopedInternalNotes.length > 0 ? (
              scopedInternalNotes.map((note) => (
                <div
                  key={note.id}
                  className={`bg-white dark:bg-slate-900 border rounded-3xl p-5 shadow-xs space-y-3 transition-all ${
                    note.pinned ? 'border-amber-300 dark:border-amber-700 bg-amber-50/20 dark:bg-amber-950/20' : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {note.pinned && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                            <Pin className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            <span>Épinglé en tête</span>
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                            note.urgency === 'high'
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                              : note.urgency === 'medium'
                              ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          {note.urgency === 'high' ? 'Urgent / Prioritaire' : note.urgency === 'medium' ? 'Normale' : 'Information'}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                          {new Date(note.createdAt).toLocaleDateString()} à {new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{note.title}</h3>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => togglePinNote(note.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          note.pinned ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300' : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                        title={note.pinned ? 'Détacher' : 'Épingler'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteInternalNote(note.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                        title="Supprimer la note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {note.content}
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Auteur : <strong className="text-slate-700 dark:text-slate-200">{note.authorName}</strong> ({note.authorRole})</span>
                    <span>Visibilité : Équipe RestaurantOS uniquement</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-2">
                <Lock className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <p>Aucune consigne interne enregistrée.</p>
                <p className="text-[11px]">Créez une note pour transmettre des directives à vos équipes de salle et de cuisine.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL: AJOUTER UNE NOTE INTERNE ================= */}
      {showAddNoteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateNote}
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-in fade-in text-xs"
          >
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Nouvelle Note Interne de Service</h3>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">Visible uniquement par l'équipe de l'établissement</p>
              </div>
              <button type="button" onClick={() => setShowAddNoteModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Titre de la consigne</label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Ex : Table VIP 4 allergie fruits de mer"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Niveau d'urgence</label>
                <select
                  value={noteUrgency}
                  onChange={(e) => setNoteUrgency(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="low">Information générale</option>
                  <option value="medium">Important (Service du jour)</option>
                  <option value="high">Urgent / Alerte critique</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Contenu détaillé</label>
                <textarea
                  rows={4}
                  required
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Détaillez la consigne pour les serveurs, le chef ou le caissier..."
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddNoteModal(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-semibold cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#0B192C] dark:bg-amber-500 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-amber-400 rounded-xl shadow-xs cursor-pointer"
              >
                Enregistrer la Note
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
