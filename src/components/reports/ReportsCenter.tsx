import React, { useState, useEffect } from 'react';
import { useRestaurant } from '../../context/RestaurantContext';
import { useTranslation } from '../../translations';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { DailyZReport, UserRole, ExpenseCategory, PaymentMethod } from '../../types/restaurant';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  CreditCard,
  Banknote,
  Smartphone,
  TrendingUp,
  Percent,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Mail,
  ArrowUpRight,
  Send,
  History,
  UserCheck,
  RefreshCw,
  X,
  ChevronRight,
  ShieldCheck,
  DollarSign,
  Wallet,
  Plus,
  Trash2,
} from 'lucide-react';

export const ReportsCenter: React.FC = () => {
  const {
    state,
    language,
    activeOrganization,
    scopedOrders,
    scopedProducts,
    scopedCategories,
    scopedStaffShifts,
    scopedDailyZReports,
    scopedExpenses,
    generateZReportData,
    performDailyClosing,
    clockInStaff,
    clockOutStaff,
    addExpense,
    deleteExpense,
  } = useRestaurant();
  const t = useTranslation(language);

  const [activeTab, setActiveTab] = useState<'z_report' | 'finances' | 'archives' | 'attendance' | 'exports'>('z_report');
  const [selectedReportDate, setSelectedReportDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [viewingArchivedReport, setViewingArchivedReport] = useState<DailyZReport | null>(null);

  // Closing Modal state
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [drawerStartingInput, setDrawerStartingInput] = useState('50000');
  const [drawerActualInput, setDrawerActualInput] = useState('');
  const [closingNotes, setClosingNotes] = useState('');
  const [isClosingSubmitting, setIsClosingSubmitting] = useState(false);

  // Email Modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailStatusMessage, setEmailStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Clock-in Modal state
  const [showClockInModal, setShowClockInModal] = useState(false);
  const [clockInName, setClockInName] = useState('');
  const [clockInRole, setClockInRole] = useState<UserRole>('server');
  const [clockInNotes, setClockInNotes] = useState('');

  // Expense Form State
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('inventory_purchase');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expensePayment, setExpensePayment] = useState<PaymentMethod | 'bank_transfer'>('cash');
  const [expenseVendor, setExpenseVendor] = useState('');
  const [expenseNotes, setExpenseNotes] = useState('');
  const [expenseFeedback, setExpenseFeedback] = useState<string | null>(null);

  useEffect(() => {
    setViewingArchivedReport(null);
    setEmailStatusMessage(null);
  }, [activeOrganization.id]);

  // Generate live or load archived report for the selected date
  const isSelectedDateArchived = scopedDailyZReports.some((z) => z.reportDate === selectedReportDate);
  const currentReport: DailyZReport = viewingArchivedReport
    ? viewingArchivedReport
    : scopedDailyZReports.find((z) => z.reportDate === selectedReportDate) || {
        ...generateZReportData(selectedReportDate),
        id: `preview_${selectedReportDate}`,
        createdAt: new Date().toISOString(),
      };

  // Calculations for live drawer modal
  const startingNum = parseFloat(drawerStartingInput) || 0;
  const actualNum = parseFloat(drawerActualInput) || 0;
  const expectedCash = startingNum + currentReport.paymentBreakdown.cash;
  const discrepancy = actualNum - expectedCash;

  // Perform daily closing
  const handleExecuteClosing = () => {
    setIsClosingSubmitting(true);
    try {
      const closed = performDailyClosing({
        cashDrawerStarting: startingNum,
        cashDrawerActual: actualNum,
        notes: closingNotes,
      });
      setViewingArchivedReport(closed);
      setShowCloseModal(false);
    } catch (e) {
      console.error('Error during daily closing:', e);
    } finally {
      setIsClosingSubmitting(false);
    }
  };

  // Print Report Handler
  const handlePrint = () => {
    window.print();
  };

  // Send Report Email via server API
  const handleSendEmail = async () => {
    if (!recipientEmail || !recipientEmail.includes('@')) {
      setEmailStatusMessage({
        text: language === 'fr' ? 'Veuillez saisir une adresse e-mail valide.' : 'Please enter a valid email address.',
        isError: true,
      });
      return;
    }

    setIsSendingEmail(true);
    setEmailStatusMessage(null);

    try {
      const response = await fetch('/api/reports/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: currentReport.id,
          recipientEmail,
          restaurantName: activeOrganization.name,
          reportDate: currentReport.reportDate,
          summary: {
            netRevenue: currentReport.netRevenue,
            totalOrders: currentReport.totalOrders,
            currency: activeOrganization.currency,
          },
          language,
        }),
      });

      const data = await response.json();
      if (data.configured) {
        setEmailStatusMessage({ text: data.message, isError: false });
        setTimeout(() => {
          setShowEmailModal(false);
          setEmailStatusMessage(null);
        }, 2000);
      } else {
        // Clear informative explanation if SMTP is not configured yet
        setEmailStatusMessage({
          text: data.message,
          isError: true,
        });
      }
    } catch (err: any) {
      setEmailStatusMessage({
        text: language === 'fr'
          ? "Erreur de connexion au serveur d'envoi. Téléchargez le rapport au format PDF ou CSV."
          : "Server connection error. Please download the report as PDF or CSV.",
        isError: true,
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Export CSV functions
  const handleExportZReportCsv = () => {
    const lines = [
      ['RAPPORT Z / CLÔTURE JOURNALIÈRE - RESTAURANTOS'],
      ['Éditeur', 'DATA WORK AGENCY'],
      ['Établissement', activeOrganization.name],
      ['Date du rapport', currentReport.reportDate],
      ['Heures de service', `${currentReport.openingTime} à ${currentReport.closingTime}`],
      ['Clôturé par', currentReport.closedBy],
      [''],
      ['INDICATEURS FINANCIERS', 'MONTANT (' + activeOrganization.currency + ')'],
      ['Chiffre d’affaires Brut', currentReport.grossRevenue],
      ['Remises accordées', currentReport.discountsTotal],
      ['Remboursements', currentReport.refundsTotal],
      ['Chiffre d’affaires Net', currentReport.netRevenue],
      ['TVA Collectée (19.25%)', currentReport.taxTotal],
      ['Total commandes', currentReport.totalOrders],
      ['Commandes encaissées', currentReport.completedOrders],
      ['Commandes annulées', currentReport.cancelledOrders],
      ['Panier moyen', currentReport.averageOrderValue],
      [''],
      ['MODES DE PAIEMENT', 'TOTAL (' + activeOrganization.currency + ')'],
      ['Espèces (Cash)', currentReport.paymentBreakdown.cash],
      ['Mobile Money (OM & MoMo)', currentReport.paymentBreakdown.mobile_money],
      ['Cartes Bancaires', currentReport.paymentBreakdown.card],
      [''],
      ['CONTRÔLE DU TIROIR CAISSE', 'MONTANT (' + activeOrganization.currency + ')'],
      ['Fond de caisse initial', currentReport.cashDrawerStarting],
      ['Ventes espèces enregistrées', currentReport.paymentBreakdown.cash],
      ['Total théorique espèces', currentReport.cashDrawerStarting + currentReport.paymentBreakdown.cash],
      ['Espèces réelles comptées', currentReport.cashDrawerActual],
      ['Écart de caisse', currentReport.cashDiscrepancy],
      [''],
      ['TOP PLATS (PAR QUANTITÉ)', 'QUANTITÉ', 'CA'],
      ...currentReport.topDishesByQuantity.map((d) => [d.productName, d.quantity, d.revenue]),
      [''],
      ['PRÉSENCE ÉQUIPE', 'RÔLE', 'ARRIVÉE', 'DÉPART', 'DURÉE (H)'],
      ...currentReport.staffAttendance.map((s) => [s.staffName, s.role, s.clockIn, s.clockOut || '-', s.durationHours]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + lines.map((row) => row.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rapport_Z_${activeOrganization.slug}_${currentReport.reportDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportOrdersCsv = () => {
    const headers = ['Numéro', 'Date', 'Type', 'Table', 'Statut', 'Paiement', 'Sous-total', 'TVA', 'Remise', 'Total'];
    const rows = scopedOrders.map((o) => [
      o.orderNumber,
      o.createdAt,
      o.type,
      o.tableName || '-',
      o.status,
      o.paymentMethod || 'non_payé',
      o.subtotal,
      o.taxAmount,
      o.discountAmount,
      o.totalAmount,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `restaurantos_commandes_${activeOrganization.slug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Financial P&L Calculations from actual paid orders, food cost, and expenses
  const paidNonCancelledOrders = scopedOrders.filter((o) => o.paymentStatus === 'paid' && o.status !== 'cancelled');
  const totalCollectedRevenue = paidNonCancelledOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalCogs = paidNonCancelledOrders.reduce((sum, ord) => {
    const orderCost = ord.items.reduce((itemSum, item) => {
      const prod = scopedProducts.find((p) => p.id === item.productId);
      return itemSum + (prod?.costPrice || 0) * item.quantity;
    }, 0);
    return sum + orderCost;
  }, 0);
  const totalOperatingExpenses = scopedExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netRealProfit = totalCollectedRevenue - totalCogs - totalOperatingExpenses;
  const netMarginPct = totalCollectedRevenue > 0 ? Math.round((netRealProfit / totalCollectedRevenue) * 100) : 0;

  const expenseCategoryLabels: Record<ExpenseCategory, string> = {
    inventory_purchase: language === 'fr' ? 'Achats & Marchandises' : 'Inventory Purchases',
    rent: language === 'fr' ? 'Loyer & Bail' : 'Rent & Lease',
    utilities: language === 'fr' ? 'Eau / Électricité / Gaz / Internet' : 'Utilities & Telecom',
    payroll: language === 'fr' ? 'Salaires & Primes' : 'Payroll',
    marketing: language === 'fr' ? 'Marketing & Communication' : 'Marketing',
    equipment: language === 'fr' ? 'Matériel & Maintenance' : 'Equipment & Repairs',
    other: language === 'fr' ? 'Autres charges' : 'Other Expenses',
  };

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(expenseAmount);
    if (!expenseTitle.trim() || !numAmount || numAmount <= 0) return;

    addExpense({
      title: expenseTitle.trim(),
      category: expenseCategory,
      amount: numAmount,
      date: expenseDate || new Date().toISOString().split('T')[0],
      paymentMethod: expensePayment,
      vendor: expenseVendor.trim() || undefined,
      notes: expenseNotes.trim() || undefined,
    });

    setExpenseTitle('');
    setExpenseAmount('');
    setExpenseVendor('');
    setExpenseNotes('');
    setExpenseFeedback(language === 'fr' ? 'Dépense enregistrée dans le grand livre.' : 'Expense recorded in ledger.');
    setTimeout(() => setExpenseFeedback(null), 3500);
  };

  const handleExportExpensesCsv = () => {
    const headers = ['Date', 'Libellé', 'Catégorie', 'Fournisseur', 'Paiement', `Montant (${activeOrganization.currency})`, 'Enregistré par'];
    const rows = scopedExpenses.map((e) => [
      e.date,
      `"${e.title.replace(/"/g, '""')}"`,
      expenseCategoryLabels[e.category] || e.category,
      `"${(e.vendor || '-').replace(/"/g, '""')}"`,
      e.paymentMethod,
      e.amount,
      e.recordedBy,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `restaurantos_depenses_${activeOrganization.slug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header Row with Title & Quick Tabs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-md border border-amber-200/60 dark:border-amber-800/60">
              {activeOrganization.name}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 capitalize">· {activeOrganization.city}</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            {language === 'fr' ? 'Rapports d’Activité & Clôture Journalière (Rapport Z)' : 'Daily Activity & Z-Report'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {language === 'fr'
              ? 'Synthèse financière, encaissements, écarts de caisse, présence effective et archivage légal.'
              : 'Financial summary, payment collection, cash discrepancy, actual staff attendance, and legal archives.'}
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Imprimer ou enregistrer en PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>{language === 'fr' ? 'Imprimer / PDF' : 'Print / PDF'}</span>
          </button>
          <button
            onClick={handleExportZReportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Télécharger les données en tableau Excel CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Excel / CSV</span>
          </button>
          <button
            onClick={() => setShowEmailModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200/80 dark:border-amber-800/60 rounded-xl transition-colors cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{language === 'fr' ? 'Envoyer par e-mail' : 'Email Report'}</span>
          </button>
          {!isSelectedDateArchived && (
            <button
              onClick={() => {
                setDrawerActualInput(String(currentReport.cashDrawerStarting + currentReport.paymentBreakdown.cash));
                setShowCloseModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white dark:text-slate-950 bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 dark:text-slate-950" />
              <span>{language === 'fr' ? 'Clôturer la journée (Z)' : 'Perform Daily Close (Z)'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab('z_report');
            setViewingArchivedReport(null);
          }}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'z_report'
              ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{language === 'fr' ? 'Rapport Z du Jour' : 'Daily Z-Report'}</span>
        </button>

        <button
          onClick={() => setActiveTab('finances')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'finances'
              ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>{language === 'fr' ? 'Finances & Rentabilité' : 'Finances & P&L'}</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md font-bold tabular-nums">
            {scopedExpenses.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('archives')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'archives'
              ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>{language === 'fr' ? 'Archives des Clôtures' : 'Closed Z-Reports Archive'}</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md font-bold tabular-nums">
            {scopedDailyZReports.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'attendance'
              ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>{language === 'fr' ? 'Pointages & Présence Équipe' : 'Staff Clock-in Attendance'}</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md font-bold tabular-nums">
            {scopedStaffShifts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('exports')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'exports'
              ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>{language === 'fr' ? 'Grand Livre & Données Comptables' : 'Ledger & Accounting Exports'}</span>
        </button>
      </div>

      {/* ================= TAB 1: RAPPORT Z JOURNALIER ================= */}
      {activeTab === 'z_report' && (
        <div className="space-y-6">
          {/* Date Selector & Archive Notice */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">{language === 'fr' ? 'Date analysée :' : 'Select Date:'}</span>
              <input
                type="date"
                value={selectedReportDate}
                onChange={(e) => {
                  setSelectedReportDate(e.target.value);
                  setViewingArchivedReport(null);
                }}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-white tabular-nums"
              />
            </div>

            <div className="flex items-center gap-2">
              {isSelectedDateArchived ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg font-semibold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  {language === 'fr' ? 'Clôture Z archivée et verrouillée' : 'Z-Report archived & locked'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-lg font-semibold text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  {language === 'fr' ? 'Journée en cours (Données en direct)' : 'Day in progress (Live figures)'}
                </span>
              )}
            </div>
          </div>

          {/* Printable Official Z-Report Ticket Frame */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 print:border-none print:shadow-none print:bg-white print:text-slate-900">
            {/* Header Attribution */}
            <div className="border-b border-slate-200 dark:border-slate-800 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 print:text-slate-900">
                  <span>{activeOrganization.name}</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {activeOrganization.address} · {activeOrganization.city}, {activeOrganization.country}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 tabular-nums">
                  Tél : {activeOrganization.phone} | Réf Système : {activeOrganization.slug}
                </div>
              </div>

              <div className="text-left sm:text-right space-y-1">
                <div className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase print:text-slate-900">
                  TICKET RAPPORT Z OFFICIEL
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  Date : <strong>{currentReport.reportDate}</strong>
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">
                  Ouverture: {currentReport.openingTime} · Clôture: {currentReport.closingTime}
                </div>
                <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                  Opérateur : {currentReport.closedBy}
                </div>
              </div>
            </div>

            {/* Financial Totals: CA Brut, Remises, Remboursements, CA Net */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">CA Brut TTC</div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums mt-1">
                  {formatCurrency(currentReport.grossRevenue, activeOrganization.currency)}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Ventes brutes totales</div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Remises & Remboursements</div>
                <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400 font-mono tabular-nums mt-1">
                  - {formatCurrency(currentReport.discountsTotal + currentReport.refundsTotal, activeOrganization.currency)}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 tabular-nums">
                  Remises: {formatCurrency(currentReport.discountsTotal, activeOrganization.currency)}
                </div>
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/60">
                <div className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 uppercase">Chiffre d’Affaires Net</div>
                <div className="text-2xl font-extrabold text-amber-950 dark:text-amber-200 font-mono tabular-nums mt-1">
                  {formatCurrency(currentReport.netRevenue, activeOrganization.currency)}
                </div>
                <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 tabular-nums">
                  TVA incluse ({activeOrganization.taxRate}%) : {formatCurrency(currentReport.taxTotal, activeOrganization.currency)}
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Activité & Commandes</div>
                <div className="text-xl font-extrabold text-slate-900 dark:text-white font-mono tabular-nums mt-1">
                  {currentReport.completedOrders} / {currentReport.totalOrders}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 tabular-nums">
                  Panier moyen : {formatCurrency(currentReport.averageOrderValue, activeOrganization.currency)}
                </div>
              </div>
            </div>

            {/* Payment Methods Breakdown & Drawer Discrepancy */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payment Methods */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h3 className="font-bold text-xs uppercase text-slate-700 dark:text-slate-300 tracking-wider flex items-center justify-between">
                  <span>Répartition des Règlements Encaissés</span>
                  <span className="font-mono tabular-nums text-slate-400 dark:text-slate-500 font-normal">
                    {formatCurrency(currentReport.netRevenue, activeOrganization.currency)}
                  </span>
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Espèces (Cash)</span>
                    </div>
                    <div className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                      {formatCurrency(currentReport.paymentBreakdown.cash, activeOrganization.currency)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <Smartphone className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Mobile Money (Orange & MTN MoMo)</span>
                    </div>
                    <div className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                      {formatCurrency(currentReport.paymentBreakdown.mobile_money, activeOrganization.currency)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Cartes Bancaires (TPE Visa / Mastercard)</span>
                    </div>
                    <div className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                      {formatCurrency(currentReport.paymentBreakdown.card, activeOrganization.currency)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cash Drawer Reconciliation */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h3 className="font-bold text-xs uppercase text-slate-700 dark:text-slate-300 tracking-wider flex items-center justify-between">
                  <span>Rapprochement & Contrôle de Caisse</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-500 dark:text-slate-400">Fond de caisse initial :</span>
                    <span className="font-mono tabular-nums font-bold text-slate-800 dark:text-slate-200">
                      {formatCurrency(currentReport.cashDrawerStarting, activeOrganization.currency)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-500 dark:text-slate-400">+ Encaissements espèces de la journée :</span>
                    <span className="font-mono tabular-nums font-bold text-emerald-700 dark:text-emerald-400">
                      + {formatCurrency(currentReport.paymentBreakdown.cash, activeOrganization.currency)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Total théorique attendu en caisse :</span>
                    <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                      {formatCurrency(currentReport.cashDrawerStarting + currentReport.paymentBreakdown.cash, activeOrganization.currency)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">Montant réel compté :</span>
                    <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                      {formatCurrency(currentReport.cashDrawerActual, activeOrganization.currency)}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 bg-white dark:bg-slate-900 px-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="font-bold text-slate-900 dark:text-white">Écart de caisse :</span>
                    <span
                      className={`font-mono tabular-nums font-extrabold text-sm ${
                        currentReport.cashDiscrepancy === 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : currentReport.cashDiscrepancy > 0
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {currentReport.cashDiscrepancy === 0
                        ? '0 (Parfaitement conforme)'
                        : `${currentReport.cashDiscrepancy > 0 ? '+' : ''}${formatCurrency(
                            currentReport.cashDiscrepancy,
                            activeOrganization.currency
                          )}`}
                    </span>
                  </div>
                  {currentReport.notes && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-1">
                      Remarque : « {currentReport.notes} »
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Performance des Plats (Top Quantité & Top CA) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-bold text-xs uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                  Top Plats par Quantité Vendue
                </h3>
                {currentReport.topDishesByQuantity.length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
                    {currentReport.topDishesByQuantity.map((d, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold flex items-center justify-center tabular-nums">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">{d.productName}</span>
                        </div>
                        <div className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                          {d.quantity} portions
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                    Aucune vente enregistrée pour ce jour
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-xs uppercase text-slate-700 dark:text-slate-300 tracking-wider">
                  Top Plats par Chiffre d’Affaires
                </h3>
                {currentReport.topDishesByRevenue.length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
                    {currentReport.topDishesByRevenue.map((d, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 text-[10px] font-bold flex items-center justify-center tabular-nums">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-slate-800 dark:text-slate-200">{d.productName}</span>
                        </div>
                        <div className="font-mono tabular-nums font-bold text-amber-700 dark:text-amber-400">
                          {formatCurrency(d.revenue, activeOrganization.currency)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                    Aucune vente enregistrée pour ce jour
                  </div>
                )}
              </div>
            </div>

            {/* Real Staff Attendance on this Day */}
            <div className="space-y-3">
              <h3 className="font-bold text-xs uppercase text-slate-700 dark:text-slate-300 tracking-wider flex items-center justify-between">
                <span>Présence Effective du Personnel (Pointages Réels)</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal tabular-nums">
                  {currentReport.staffAttendance.length} collaborateur(s) pointé(s)
                </span>
              </h3>

              {currentReport.staffAttendance.length > 0 ? (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="py-2.5 px-3">Collaborateur</th>
                        <th className="py-2.5 px-3">Rôle / Poste</th>
                        <th className="py-2.5 px-3">Prise de Poste</th>
                        <th className="py-2.5 px-3">Fin de Service</th>
                        <th className="py-2.5 px-3 text-right">Durée Pointée</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
                      {currentReport.staffAttendance.map((staff, idx) => (
                        <tr key={idx} className="hover:bg-white/60 dark:hover:bg-slate-900/40">
                          <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{staff.staffName}</td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 capitalize">{staff.role}</td>
                          <td className="py-2.5 px-3 font-mono tabular-nums text-emerald-700 dark:text-emerald-400">{staff.clockIn}</td>
                          <td className="py-2.5 px-3 font-mono tabular-nums text-slate-600 dark:text-slate-400">{staff.clockOut || 'En cours...'}</td>
                          <td className="py-2.5 px-3 font-mono tabular-nums text-right font-bold text-slate-900 dark:text-white">
                            {staff.durationHours > 0 ? `${staff.durationHours}h` : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                  Aucun pointage enregistré pour cette date. Utilisez l’onglet « Pointages & Présence » pour enregistrer l’arrivée de votre équipe.
                </div>
              )}
            </div>

            {/* Z-Report Footer Signature */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-slate-400 dark:text-slate-500 text-[11px] gap-2">
              <div>
                Rapport officiel certifié conforme · RestaurantOS ({activeOrganization.name})
              </div>
              <div>
                Plateforme développée par <strong className="text-slate-600 dark:text-slate-300">DATA WORK AGENCY</strong> (+237 690 37 04 54)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB FINANCES: RECETTES, DÉPENSES & BÉNÉFICE NET ================= */}
      {activeTab === 'finances' && (
        <div className="space-y-6">
          {/* P&L 4-card summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <div className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                {language === 'fr' ? 'Recettes Encaissées' : 'Collected Revenue'}
              </div>
              <div className="text-2xl font-extrabold font-mono tabular-nums text-slate-900 dark:text-white">
                {formatCurrency(totalCollectedRevenue, activeOrganization.currency)}
              </div>
              <div className="text-[11px] text-slate-400">
                {paidNonCancelledOrders.length} {language === 'fr' ? 'commandes réglées' : 'paid orders'}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <div className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                {language === 'fr' ? 'Coût Matière (COGS)' : 'Food Cost (COGS)'}
              </div>
              <div className="text-2xl font-extrabold font-mono tabular-nums text-amber-700 dark:text-amber-400">
                - {formatCurrency(totalCogs, activeOrganization.currency)}
              </div>
              <div className="text-[11px] text-slate-400">
                {language === 'fr' ? 'Calculé selon fiches coûts plats' : 'From dish cost prices'}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <div className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400">
                {language === 'fr' ? 'Dépenses d’Exploitation' : 'Operating Expenses'}
              </div>
              <div className="text-2xl font-extrabold font-mono tabular-nums text-rose-600 dark:text-rose-400">
                - {formatCurrency(totalOperatingExpenses, activeOrganization.currency)}
              </div>
              <div className="text-[11px] text-slate-400">
                {scopedExpenses.length} {language === 'fr' ? 'charge(s) enregistrée(s)' : 'recorded expense(s)'}
              </div>
            </div>

            <div className={`p-5 rounded-2xl border shadow-xs space-y-1 ${
              netRealProfit >= 0
                ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800'
            }`}>
              <div className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-300">
                {language === 'fr' ? 'Bénéfice Net Réel' : 'Net Real Profit'}
              </div>
              <div className={`text-2xl font-extrabold font-mono tabular-nums ${
                netRealProfit >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'
              }`}>
                {formatCurrency(netRealProfit, activeOrganization.currency)}
              </div>
              <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 tabular-nums">
                {language === 'fr' ? 'Marge nette :' : 'Net margin:'} {netMarginPct}%
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form: Add Expense */}
            <form
              onSubmit={handleAddExpenseSubmit}
              className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4 self-start"
            >
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Plus className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {language === 'fr' ? 'Enregistrer une Dépense' : 'Record Expense'}
                </h3>
              </div>

              {expenseFeedback && (
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{expenseFeedback}</span>
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Libellé de la dépense *</label>
                  <input
                    type="text"
                    required
                    value={expenseTitle}
                    onChange={(e) => setExpenseTitle(e.target.value)}
                    placeholder="Ex: Achat poisson frais & plantains"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Montant ({activeOrganization.currency}) *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                      placeholder="25000"
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl font-mono tabular-nums font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Date</label>
                    <input
                      type="date"
                      value={expenseDate}
                      onChange={(e) => setExpenseDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl tabular-nums"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Catégorie</label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl"
                  >
                    {(Object.keys(expenseCategoryLabels) as ExpenseCategory[]).map((cat) => (
                      <option key={cat} value={cat}>
                        {expenseCategoryLabels[cat]}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Paiement</label>
                    <select
                      value={expensePayment}
                      onChange={(e) => setExpensePayment(e.target.value as PaymentMethod | 'bank_transfer')}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl"
                    >
                      <option value="cash">Espèces</option>
                      <option value="mobile_money">Mobile Money</option>
                      <option value="card">Carte Bancaire</option>
                      <option value="bank_transfer">Virement</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Fournisseur</label>
                    <input
                      type="text"
                      value={expenseVendor}
                      onChange={(e) => setExpenseVendor(e.target.value)}
                      placeholder="Marché / ENEO..."
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Justificatif / Notes</label>
                  <input
                    type="text"
                    value={expenseNotes}
                    onChange={(e) => setExpenseNotes(e.target.value)}
                    placeholder="N° facture, remarque..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#0B192C] dark:bg-amber-500 text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-amber-400 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                {language === 'fr' ? 'Ajouter au Grand Livre' : 'Add Expense'}
              </button>
            </form>

            {/* Expense Ledger Table */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {language === 'fr' ? 'Registre des Dépenses & Charges' : 'Expenses Ledger'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {language === 'fr'
                      ? 'Suivi isolé par établissement pour calculer votre rentabilité réelle.'
                      : 'Tenant-isolated expense register for net margin tracking.'}
                  </p>
                </div>
                <button
                  onClick={handleExportExpensesCsv}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exporter CSV</span>
                </button>
              </div>

              {scopedExpenses.length > 0 ? (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3 whitespace-nowrap">Date</th>
                        <th className="py-2.5 px-3">Libellé &amp; Fournisseur</th>
                        <th className="py-2.5 px-3 whitespace-nowrap">Catégorie</th>
                        <th className="py-2.5 px-3 text-right whitespace-nowrap">Montant</th>
                        <th className="py-2.5 px-3 text-right whitespace-nowrap">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {scopedExpenses.map((exp) => (
                        <tr key={exp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-mono tabular-nums text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {exp.date}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-900 dark:text-white">{exp.title}</div>
                            {(exp.vendor || exp.notes) && (
                              <div className="text-[11px] text-slate-400">
                                {exp.vendor}{exp.vendor && exp.notes ? ' · ' : ''}{exp.notes}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                              {expenseCategoryLabels[exp.category] || exp.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                            - {formatCurrency(exp.amount, activeOrganization.currency)}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => deleteExpense(exp.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                              title="Supprimer cette dépense"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-10 text-center text-xs text-slate-400 dark:text-slate-500">
                  Aucune dépense enregistrée pour « {activeOrganization.name} ».
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: ARCHIVES DES CLÔTURES PASSÉES ================= */}
      {activeTab === 'archives' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">
              Historique des Clôtures Journalières Archivées
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums whitespace-nowrap">
              {scopedDailyZReports.length} clôture(s) enregistrée(s)
            </span>
          </div>

          {scopedDailyZReports.length > 0 ? (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4 whitespace-nowrap">Date Rapport</th>
                    <th className="py-3 px-4 whitespace-nowrap">Heures</th>
                    <th className="py-3 px-4 whitespace-nowrap">Responsable</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">CA Net</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Écart Caisse</th>
                    <th className="py-3 px-4 text-center whitespace-nowrap">Commandes</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {scopedDailyZReports.map((z) => (
                    <tr key={z.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white font-mono tabular-nums whitespace-nowrap">{z.reportDate}</td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono tabular-nums whitespace-nowrap">{z.openingTime} - {z.closingTime}</td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-200">{z.closedBy}</td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {formatCurrency(z.netRevenue, activeOrganization.currency)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold whitespace-nowrap">
                        <span
                          className={
                            z.cashDiscrepancy === 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : z.cashDiscrepancy > 0
                              ? 'text-blue-600 dark:text-blue-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }
                        >
                          {z.cashDiscrepancy === 0 ? 'Conforme (0)' : formatCurrency(z.cashDiscrepancy, activeOrganization.currency)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-600 dark:text-slate-300">
                        {z.completedOrders} / {z.totalOrders}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setViewingArchivedReport(z);
                            setSelectedReportDate(z.reportDate);
                            setActiveTab('z_report');
                          }}
                          className="px-3 py-1 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-semibold rounded-lg text-xs transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Consulter Z
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500 space-y-2">
              <History className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
              <p>Aucune clôture Z archivée pour cet établissement.</p>
              <p className="text-[11px]">
                Effectuez une clôture journalière depuis l&apos;onglet « Rapport Z du Jour » pour constituer votre registre légal.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: POINTAGES & PRÉSENCE RÉELLE DE L'ÉQUIPE ================= */}
      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">
                Registre des Pointages & Heures Effectives
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Heures d’arrivée, durée réelle de service et respect des plannings (sans présences simulées).
              </p>
            </div>

            <button
              onClick={() => {
                setClockInName('');
                setClockInNotes('');
                setShowClockInModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#0B192C] dark:bg-amber-500 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-amber-400 rounded-xl transition-colors cursor-pointer self-start sm:self-auto whitespace-nowrap shrink-0"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-400 dark:text-slate-950" />
              <span>Pointer une Arrivée</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 whitespace-nowrap">Collaborateur</th>
                  <th className="py-3 px-4 whitespace-nowrap">Poste</th>
                  <th className="py-3 px-4 whitespace-nowrap">Date</th>
                  <th className="py-3 px-4 whitespace-nowrap">Arrivée</th>
                  <th className="py-3 px-4 whitespace-nowrap">Départ</th>
                  <th className="py-3 px-4 whitespace-nowrap">Durée</th>
                  <th className="py-3 px-4 whitespace-nowrap">Statut</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {scopedStaffShifts.map((shift) => (
                  <tr key={shift.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white whitespace-nowrap">{shift.userName}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 capitalize whitespace-nowrap">{shift.userRole}</td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 font-mono tabular-nums whitespace-nowrap">{shift.date}</td>
                    <td className="py-3 px-4 font-mono tabular-nums text-emerald-700 dark:text-emerald-400 font-semibold whitespace-nowrap">
                      {new Date(shift.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {shift.clockOut
                        ? new Date(shift.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '-'}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-800 dark:text-slate-200 font-semibold whitespace-nowrap">
                      {shift.totalMinutes ? `${Math.round((shift.totalMinutes / 60) * 10) / 10}h` : 'En cours'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {shift.status === 'active' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          En service
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          Clôturé
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {shift.status === 'active' && (
                        <button
                          onClick={() => clockOutStaff(shift.id)}
                          className="px-2.5 py-1 bg-[#0B192C] dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold rounded-lg text-[11px] transition-colors cursor-pointer"
                        >
                          Pointer Départ
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 4: GRAND LIVRE & DONNÉES COMPTABLES ================= */}
      {activeTab === 'exports' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
          <div>
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">
              Grand Livre & Exports Comptables Normés
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Exports prêts pour votre expert-comptable, rapprochement bancaire et déclarations TVA (Cameroun & International).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/70 dark:bg-slate-950/60 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-xs text-slate-900 dark:text-white">Journal des Ventes & Commandes</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Tableau complet de chaque addition avec date, numéro, table, mode de règlement, montants HT et TVA.
                </p>
              </div>
              <button
                onClick={handleExportOrdersCsv}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-[#0B192C] dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exporter Journal CSV</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/70 dark:bg-slate-950/60 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-xs text-slate-900 dark:text-white">Journal Rapprochement Mobile Money</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Liste exhaustive de toutes les transactions encaissées par Orange Money et MTN MoMo pour rapprochement avec vos relevés d&apos;opérateurs.
                </p>
              </div>
              <button
                onClick={handleExportZReportCsv}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exporter Relevé MoMo</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/70 dark:bg-slate-950/60 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-xs text-slate-900 dark:text-white">Certificat Rapport Z & Fiscalité</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Fiche récapitulative officielle du chiffre d’affaires net et de la taxe sur la valeur ajoutée collectée (TVA 19.25%).
                </p>
              </div>
              <button
                onClick={handlePrint}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimer Attestation Fiscale</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CLÔTURE DE JOURNÉE (RAPPORT Z) ================= */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Clôture Journalière de Caisse (Rapport Z)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Date : {currentReport.reportDate} · {activeOrganization.name}</p>
              </div>
              <button onClick={() => setShowCloseModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl text-amber-900 dark:text-amber-200 space-y-1">
                <div className="font-bold">Information Importante :</div>
                <div className="text-[11px] leading-relaxed">
                  La clôture de caisse fige les chiffres de la journée, calcule l’écart de caisse et archive le rapport Z dans votre historique légal.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Fond de caisse initial ({activeOrganization.currency})</label>
                  <input
                    type="number"
                    value={drawerStartingInput}
                    onChange={(e) => setDrawerStartingInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl font-mono tabular-nums text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Espèces réelles comptées ({activeOrganization.currency})</label>
                  <input
                    type="number"
                    value={drawerActualInput}
                    onChange={(e) => setDrawerActualInput(e.target.value)}
                    className="w-full px-3 py-2 border border-amber-400 dark:border-amber-600 bg-amber-50/30 dark:bg-amber-950/30 rounded-xl font-mono tabular-nums text-sm font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Live discrepancy preview */}
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5 font-mono tabular-nums text-xs">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Espèces attendues (Fond + Ventes Cash) :</span>
                  <span>{formatCurrency(expectedCash, activeOrganization.currency)}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-slate-200 dark:border-slate-800 pt-1.5 text-slate-900 dark:text-white">
                  <span>Écart de caisse calculé :</span>
                  <span
                    className={
                      discrepancy === 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : discrepancy > 0
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }
                  >
                    {discrepancy === 0
                      ? '0 (Conforme)'
                      : `${discrepancy > 0 ? '+' : ''}${formatCurrency(discrepancy, activeOrganization.currency)}`}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Observations / Justificatifs éventuels</label>
                <textarea
                  rows={2}
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  placeholder="Ex : Remise autorisée par le gérant pour client d’affaires..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowCloseModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                disabled={isClosingSubmitting}
                onClick={handleExecuteClosing}
                className="px-5 py-2 text-xs font-bold text-white bg-[#0B192C] dark:bg-amber-500 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-amber-400 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {isClosingSubmitting ? 'Verrouillage...' : 'Confirmer et Archiver le Rapport Z'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ENVOI DU RAPPORT PAR E-MAIL ================= */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Envoyer le Rapport par E-mail</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Transmission à la direction ou au service comptable</p>
              </div>
              <button onClick={() => setShowEmailModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Adresse e-mail du destinataire</label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="direction@restaurant.cm ou comptabilite@..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl text-xs font-medium"
                />
              </div>

              {emailStatusMessage && (
                <div
                  className={`p-3 rounded-xl text-xs leading-relaxed ${
                    emailStatusMessage.isError
                      ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800'
                      : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                  }`}
                >
                  {emailStatusMessage.text}
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Fermer
              </button>
              <button
                disabled={isSendingEmail}
                onClick={handleSendEmail}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-[#0B192C] dark:bg-amber-500 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-amber-400 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-amber-400 dark:text-slate-950" />
                <span>{isSendingEmail ? 'Transmission...' : 'Envoyer Maintenant'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CLOCK-IN D'UN COLLABORATEUR ================= */}
      {showClockInModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Enregistrer une Prise de Service (Clock-in)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Pointage effectif de présence</p>
              </div>
              <button onClick={() => setShowClockInModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Nom du collaborateur</label>
                <input
                  type="text"
                  value={clockInName}
                  onChange={(e) => setClockInName(e.target.value)}
                  placeholder="Ex : Christian Kamdem"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Poste / Rôle</label>
                <select
                  value={clockInRole}
                  onChange={(e) => setClockInRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-xl text-xs bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                >
                  <option value="server">Chef de rang / Serveur</option>
                  <option value="cashier">Caissier Principal</option>
                  <option value="kitchen">Cuisinier / Chef de partie</option>
                  <option value="manager">Manager d&apos;exploitation</option>
                  <option value="inventory">Responsable économat</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Note de prise de poste</label>
                <input
                  type="text"
                  value={clockInNotes}
                  onChange={(e) => setClockInNotes(e.target.value)}
                  placeholder="Ex : Service terrasse & salle VIP..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowClockInModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  if (clockInName.trim()) {
                    clockInStaff(clockInName.trim(), clockInRole, clockInNotes.trim());
                    setShowClockInModal(false);
                  }
                }}
                className="px-5 py-2 text-xs font-bold text-white bg-[#0B192C] dark:bg-amber-500 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-amber-400 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Valider le Pointage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
