import { Currency, OrderStatus, TableStatus } from '../types/restaurant';

export function formatCurrency(amount: number, currency: Currency = 'XAF'): string {
  if (isNaN(amount)) return '0 XAF';

  if (currency === 'XAF') {
    // Standard Central African CFA franc formatting e.g. 12 500 XAF
    return `${Math.round(amount).toLocaleString('fr-FR')} XAF`;
  }
  if (currency === 'EUR') {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  }
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }
  return `${amount.toLocaleString()} ${currency}`;
}

export function formatDate(dateString: string, lang: 'fr' | 'en' = 'fr'): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatTime(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getOrderStatusBadge(status: OrderStatus, lang: 'fr' | 'en' = 'fr') {
  const mapFr: Record<OrderStatus, { label: string; bg: string; text: string }> = {
    draft: { label: 'Brouillon', bg: 'bg-slate-100', text: 'text-slate-700' },
    pending: { label: 'En attente', bg: 'bg-amber-50', text: 'text-amber-700' },
    confirmed: { label: 'Confirmé', bg: 'bg-blue-50', text: 'text-blue-700' },
    preparing: { label: 'En cuisine', bg: 'bg-amber-100', text: 'text-amber-800' },
    ready: { label: 'Prêt', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    served: { label: 'Servi', bg: 'bg-indigo-50', text: 'text-indigo-700' },
    completed: { label: 'Terminé', bg: 'bg-emerald-100', text: 'text-emerald-800' },
    cancelled: { label: 'Annulé', bg: 'bg-rose-50', text: 'text-rose-700' },
  };

  const mapEn: Record<OrderStatus, { label: string; bg: string; text: string }> = {
    draft: { label: 'Draft', bg: 'bg-slate-100', text: 'text-slate-700' },
    pending: { label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700' },
    confirmed: { label: 'Confirmed', bg: 'bg-blue-50', text: 'text-blue-700' },
    preparing: { label: 'Preparing', bg: 'bg-amber-100', text: 'text-amber-800' },
    ready: { label: 'Ready', bg: 'bg-emerald-50', text: 'text-emerald-700' },
    served: { label: 'Served', bg: 'bg-indigo-50', text: 'text-indigo-700' },
    completed: { label: 'Completed', bg: 'bg-emerald-100', text: 'text-emerald-800' },
    cancelled: { label: 'Cancelled', bg: 'bg-rose-50', text: 'text-rose-700' },
  };

  return lang === 'fr' ? mapFr[status] : mapEn[status];
}

export function getTableStatusBadge(status: TableStatus, lang: 'fr' | 'en' = 'fr') {
  const mapFr: Record<TableStatus, { label: string; color: string; border: string }> = {
    available: { label: 'Libre', color: 'text-emerald-600', border: 'border-emerald-300' },
    occupied: { label: 'Occupée', color: 'text-rose-600', border: 'border-rose-400' },
    reserved: { label: 'Réservée', color: 'text-amber-600', border: 'border-amber-400' },
    cleaning: { label: 'Nettoyage', color: 'text-sky-600', border: 'border-sky-300' },
    out_of_service: { label: 'Hors service', color: 'text-slate-400', border: 'border-slate-300' },
  };

  const mapEn: Record<TableStatus, { label: string; color: string; border: string }> = {
    available: { label: 'Available', color: 'text-emerald-600', border: 'border-emerald-300' },
    occupied: { label: 'Occupied', color: 'text-rose-600', border: 'border-rose-400' },
    reserved: { label: 'Reserved', color: 'text-amber-600', border: 'border-amber-400' },
    cleaning: { label: 'Cleaning', color: 'text-sky-600', border: 'border-sky-300' },
    out_of_service: { label: 'Out of service', color: 'text-slate-400', border: 'border-slate-300' },
  };

  return lang === 'fr' ? mapFr[status] : mapEn[status];
}
