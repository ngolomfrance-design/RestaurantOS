import React, { useState } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useTranslation } from '../../translations';
import { INITIAL_PROFILES } from '../../data/mockDatabase';
import { UserRole, StaffInvitation } from '../../types/restaurant';
import {
  ShieldCheck,
  Users,
  KeyRound,
  FileText,
  Check,
  X as XIcon,
  Phone,
  Mail,
  Lock,
  UserPlus,
  Copy,
  Clock,
  AlertTriangle,
  Trash2,
  Sparkles,
} from 'lucide-react';

export const StaffManagement: React.FC = () => {
  const {
    state,
    language,
    switchUserRole,
    currentUser,
    activeOrganization,
    scopedAuditLogs,
    createStaffInvitation,
    revokeStaffInvitation,
  } = useRestaurant();
  const t = useTranslation(language);

  const [activeTab, setActiveTab] = useState<'employees' | 'invitations' | 'permissions' | 'audit'>('employees');

  // Modal State for New Invitation
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteRole, setInviteRole] = useState<UserRole>('server');
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [createdInvitation, setCreatedInvitation] = useState<StaffInvitation | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null);

  // Scoped active members for active restaurant
  const orgDemoMembers = INITIAL_PROFILES.filter(
    (p) => p.orgId === activeOrganization.id || p.organizationIds?.includes(activeOrganization.id)
  );
  const hasCurrentUser = orgDemoMembers.some((p) => p.id === currentUser.id || p.email === currentUser.email);
  const activeMembers = hasCurrentUser
    ? orgDemoMembers
    : [
        {
          id: currentUser.id,
          orgId: activeOrganization.id,
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role,
          phone: currentUser.phone,
          pinCode: currentUser.pinCode,
          isActive: true,
        },
        ...orgDemoMembers,
      ];

  // Scoped invitations for current restaurant
  const currentInvitations = (state.staffInvitations || []).filter(
    (inv) => inv.orgId === activeOrganization.id
  );

  const pendingInvitations = currentInvitations.filter(
    (inv) => !inv.isAccepted && !inv.isRevoked && new Date(inv.expiresAt).getTime() > Date.now()
  );

  const permissionsList = [
    { key: 'pos_sell', label: 'Encaissement & Vente POS', roles: ['owner', 'manager', 'cashier', 'server'] },
    { key: 'apply_discount', label: 'Application de remises tarifaires', roles: ['owner', 'manager'] },
    { key: 'cancel_order', label: 'Annulation de commandes validées', roles: ['owner', 'manager'] },
    { key: 'view_kds', label: 'Accès Écran Cuisine (KDS)', roles: ['owner', 'manager', 'kitchen', 'server'] },
    { key: 'inventory_adjust', label: 'Mouvements & Ajustements de stock', roles: ['owner', 'manager', 'inventory'] },
    { key: 'recipe_costs', label: 'Consultation & Édition fiches recettes', roles: ['owner', 'manager'] },
    { key: 'financial_reports', label: 'Rapports financiers & Chiffre d’affaires', roles: ['owner', 'manager'] },
    { key: 'manage_team', label: 'Gestion des rôles & Invitations', roles: ['owner'] },
  ];

  const roleDescriptions: Record<UserRole, { titleFr: string; descFr: string; color: string }> = {
    owner: {
      titleFr: 'Propriétaire / Gérant',
      descFr: 'Accès total à tous les modules, finances, paramétrages, abonnements et équipes.',
      color: 'bg-amber-100 text-amber-900 border-amber-300',
    },
    manager: {
      titleFr: 'Manager Général',
      descFr: 'Supervise la salle, la cuisine, les stocks, annule des commandes et gère les remises.',
      color: 'bg-blue-100 text-blue-900 border-blue-300',
    },
    cashier: {
      titleFr: 'Caissier(e)',
      descFr: 'Encaissement rapide au terminal POS, clôture de session de caisse et tickets de caisse.',
      color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    },
    server: {
      titleFr: 'Serveur(se)',
      descFr: 'Prise de commande à table sur smartphone/tablette, transfert en cuisine et suivi.',
      color: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    },
    kitchen: {
      titleFr: 'Chef / Cuisine (KDS)',
      descFr: 'Consultation des bons de commande sur l’écran de cuisine, préparation et notifications.',
      color: 'bg-orange-100 text-orange-900 border-orange-300',
    },
    inventory: {
      titleFr: 'Économe / Stocks',
      descFr: 'Réception des marchandises, inventaires, gestion des alertes de rupture et pertes.',
      color: 'bg-purple-100 text-purple-900 border-purple-300',
    },
    platform_admin: {
      titleFr: 'Administrateur SaaS',
      descFr: 'Supervision globale DATA WORK AGENCY.',
      color: 'bg-slate-900 text-amber-400 border-slate-700',
    },
  };

  const handleGenerateInvitation = (e: React.FormEvent) => {
    e.preventDefault();
    const newInv = createStaffInvitation(inviteRole, inviteName.trim() || undefined, inviteEmail.trim() || undefined);
    setCreatedInvitation(newInv);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              {t.nav.staff} — {activeOrganization.name}
            </h1>
            <span className="text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
              RBAC Sécurisé
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {language === 'fr'
              ? 'Contrôle d’accès par rôle, codes d’invitation pour nouveaux employés et journal d’audit'
              : 'Role-based access control, employee invitation codes, and tamper-proof audit trail'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setCreatedInvitation(null);
              setInviteName('');
              setInviteEmail('');
              setInviteRole('server');
              setShowInviteModal(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-[#0B192C] dark:bg-amber-500 text-amber-400 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-amber-400 rounded-lg shadow-2xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Inviter un collaborateur</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center p-1 bg-slate-200/80 dark:bg-slate-800 rounded-lg text-xs font-medium w-fit overflow-x-auto max-w-full">
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'employees'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Membres actifs (<span className="tabular-nums">{activeMembers.length}</span>)
        </button>
        <button
          onClick={() => setActiveTab('invitations')}
          className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'invitations'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span>Invitations</span>
          {pendingInvitations.length > 0 && (
            <span className="bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded text-[10px] font-bold tabular-nums">
              {pendingInvitations.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'permissions'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Matrice des droits
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === 'audit'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Journal d’audit (<span className="tabular-nums">{scopedAuditLogs.length}</span>)
        </button>
      </div>

      {/* TAB 1: Employees List */}
      {activeTab === 'employees' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeMembers.map((emp) => {
            const isCurrent = currentUser.role === emp.role;
            const roleMeta = roleDescriptions[emp.role] || {
              titleFr: emp.role,
              descFr: '',
              color: 'bg-slate-100 text-slate-800 border-slate-200',
            };

            return (
              <div
                key={emp.id}
                className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border shadow-2xs space-y-3 transition-colors ${
                  isCurrent ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-800 text-amber-400 font-bold flex items-center justify-center text-sm shrink-0">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{emp.name}</h3>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border inline-block mt-0.5 ${roleMeta.color}`}>
                        {roleMeta.titleFr}
                      </span>
                    </div>
                  </div>

                  {isCurrent && (
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      Rôle actif
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {roleMeta.descFr}
                </p>

                <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  {emp.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono tabular-nums">{emp.phone}</span>
                    </div>
                  )}
                  {emp.pinCode && (
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono">Code PIN caisse : ••••</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: {emp.id}
                  </span>
                  <button
                    onClick={() => switchUserRole(emp.role)}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Basculer sur ce compte
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: Invitations Management */}
      {activeTab === 'invitations' && (
        <div className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-4 rounded-xl flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              <span className="font-bold">Fonctionnement des invitations : </span>
              Pour intégrer un serveur, cuisinier, caissier ou manager sans lui donner accès à la propriété du restaurant,
              générez un code sécurisé (ex: <code className="font-mono font-bold bg-amber-100 dark:bg-amber-900/60 px-1 py-0.5 rounded">RST-XXXXXX</code>).
              L’employé ouvre RestaurantOS, choisit « Rejoindre un restaurant existant » lors de l’inscription
              et saisit ce code pour accéder immédiatement à son espace de travail.
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-xs text-slate-900 dark:text-white">
                  Codes d'invitations générés pour « {activeOrganization.name} »
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Chaque code est valable 7 jours à compter de sa génération
                </p>
              </div>
              <button
                onClick={() => {
                  setCreatedInvitation(null);
                  setInviteName('');
                  setInviteEmail('');
                  setInviteRole('server');
                  setShowInviteModal(true);
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Nouveau code</span>
              </button>
            </div>

            {currentInvitations.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-3">
                <Users className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-xs font-medium">Aucune invitation générée pour ce restaurant pour le moment.</p>
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-[#0B192C] dark:bg-amber-500 text-amber-400 dark:text-slate-950 rounded-lg hover:bg-slate-800 dark:hover:bg-amber-400 transition-colors cursor-pointer"
                >
                  Générer votre premier code d'invitation
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold">
                      <th className="py-3 px-4">Code d'accès</th>
                      <th className="py-3 px-3">Rôle attribué</th>
                      <th className="py-3 px-3">Bénéficiaire visé</th>
                      <th className="py-3 px-3">Statut</th>
                      <th className="py-3 px-3">Expiration</th>
                      <th className="py-3 px-3">Créé par</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {currentInvitations.map((inv) => {
                      const isExpired = new Date(inv.expiresAt).getTime() < Date.now();
                      let statusBadge = (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                          <Check className="w-3 h-3" /> Prêt / En attente
                        </span>
                      );

                      if (inv.isAccepted) {
                        statusBadge = (
                          <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                            Acceptée & Activée
                          </span>
                        );
                      } else if (inv.isRevoked) {
                        statusBadge = (
                          <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                            Révoquée
                          </span>
                        );
                      } else if (isExpired) {
                        statusBadge = (
                          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            Expirée
                          </span>
                        );
                      }

                      return (
                        <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded tracking-wider text-xs tabular-nums">
                                {inv.code}
                              </span>
                              {!inv.isRevoked && !inv.isAccepted && !isExpired && (
                                <button
                                  onClick={() => copyToClipboard(inv.code)}
                                  title="Copier le code"
                                  className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="capitalize font-semibold text-slate-800 dark:text-slate-200">
                              {inv.role}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                            {inv.invitedName || inv.invitedEmail ? (
                              <div>
                                {inv.invitedName && <div className="font-medium text-slate-800 dark:text-slate-200">{inv.invitedName}</div>}
                                {inv.invitedEmail && <div className="text-[11px] text-slate-400">{inv.invitedEmail}</div>}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Tout collaborateur</span>
                            )}
                          </td>
                          <td className="py-3 px-3">{statusBadge}</td>
                          <td className="py-3 px-3 text-slate-500 dark:text-slate-400 font-mono text-[11px] tabular-nums">
                            {new Date(inv.expiresAt).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="py-3 px-3 text-slate-500 dark:text-slate-400 text-[11px]">
                            {inv.createdBy}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {!inv.isAccepted && !inv.isRevoked && (
                              confirmRevokeId === inv.id ? (
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    onClick={() => {
                                      revokeStaffInvitation(inv.id);
                                      setConfirmRevokeId(null);
                                    }}
                                    className="px-2 py-1 text-[11px] font-bold bg-rose-600 text-white rounded hover:bg-rose-700 cursor-pointer"
                                  >
                                    Confirmer
                                  </button>
                                  <button
                                    onClick={() => setConfirmRevokeId(null)}
                                    className="px-2 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200 cursor-pointer"
                                  >
                                    Annuler
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmRevokeId(inv.id)}
                                  className="px-2 py-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 rounded transition-colors cursor-pointer"
                                >
                                  Révoquer
                                </button>
                              )
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Permissions Matrix */}
      {activeTab === 'permissions' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold">
                  <th className="py-3 px-4">Fonctionnalité & Opération</th>
                  <th className="py-3 px-3 text-center">Owner</th>
                  <th className="py-3 px-3 text-center">Manager</th>
                  <th className="py-3 px-3 text-center">Caissier</th>
                  <th className="py-3 px-3 text-center">Serveur</th>
                  <th className="py-3 px-3 text-center">Cuisine</th>
                  <th className="py-3 px-3 text-center">Économat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {permissionsList.map((perm) => (
                  <tr key={perm.key} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">{perm.label}</td>
                    {(['owner', 'manager', 'cashier', 'server', 'kitchen', 'inventory'] as UserRole[]).map((r) => {
                      const hasPerm = perm.roles.includes(r);
                      return (
                        <td key={r} className="py-3 px-3 text-center">
                          {hasPerm ? (
                            <span className="w-5 h-5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 inline-flex items-center justify-center font-bold">
                              ✓
                            </span>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-600">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="font-bold text-xs text-slate-900 dark:text-white">
              Journal des Événements Sensibles — {activeOrganization.name}
            </h3>
            <span className="text-[11px] text-slate-400">
              Traces des modifications de prix, remises, réceptions, invitations et créations
            </span>
          </div>

          {scopedAuditLogs.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-400">
              Aucun événement enregistré pour cet établissement pour le moment.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {scopedAuditLogs.map((log) => (
                <div key={log.id} className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">{log.action}</span>
                      <span className="text-slate-300 dark:text-slate-600">·</span>
                      <span className="text-amber-700 dark:text-amber-400 font-medium">{log.actorName}</span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 mt-0.5">{log.details}</div>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px] shrink-0 tabular-nums">
                    {new Date(log.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: Generate Staff Invitation */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Inviter un nouveau collaborateur</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Pour l'établissement : {activeOrganization.name}</p>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {createdInvitation ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2 text-center">
                  <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-emerald-950 dark:text-emerald-200">Code d'invitation généré !</h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300">
                    Transmettez ce code à votre collaborateur pour qu’il se connecte à RestaurantOS.
                  </p>

                  <div className="pt-2 flex items-center justify-center gap-2">
                    <div className="font-mono text-xl font-bold bg-white dark:bg-slate-950 text-slate-900 dark:text-white px-4 py-2 rounded-lg border border-emerald-300 dark:border-emerald-700 tracking-wider tabular-nums">
                      {createdInvitation.code}
                    </div>
                    <button
                      onClick={() => copyToClipboard(createdInvitation.code)}
                      className="p-2.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
                      title="Copier le code"
                    >
                      {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  {copiedCode && (
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">Copié dans le presse-papier !</span>
                  )}
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between">
                    <span>Rôle attribué :</span>
                    <span className="font-semibold text-slate-900 dark:text-white capitalize">{createdInvitation.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Validité :</span>
                    <span className="font-semibold text-slate-900 dark:text-white">7 jours</span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      setShowInviteModal(false);
                      setActiveTab('invitations');
                    }}
                    className="w-full py-2.5 text-xs font-semibold bg-[#0B192C] dark:bg-amber-500 text-amber-400 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-amber-400 rounded-lg transition-colors cursor-pointer"
                  >
                    Terminé & Voir la liste des invitations
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleGenerateInvitation} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Rôle de l'employé dans RestaurantOS *
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="server">Serveur / Serveuse (Prise de commande en salle)</option>
                    <option value="cashier">Caissier / Caissière (Terminal POS et encaissements)</option>
                    <option value="kitchen">Cuisine / KDS (Chef et brigade de cuisine)</option>
                    <option value="inventory">Économat / Responsable Stocks</option>
                    <option value="manager">Manager Général (Supervision opérationnelle)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nom du collaborateur (facultatif)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Patrick Kamga"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email de contact (facultatif)
                  </label>
                  <input
                    type="email"
                    placeholder="Ex: patrick@restaurant.cm"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold bg-[#0B192C] dark:bg-amber-500 text-amber-400 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-amber-400 rounded-lg transition-colors cursor-pointer"
                  >
                    Générer le code d'accès
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
