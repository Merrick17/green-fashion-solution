/**
 * Format a millimes value (integer) to a human-readable currency string.
 * Millimes are the smallest unit — divide by 1000 for display.
 */
export function formatCurrency(millimes: number, currency = 'TND'): string {
  const value = millimes / 1000;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

/**
 * Format an ISO date string to a locale-readable string.
 */
export function formatDate(date: string, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

/**
 * Format an ISO date string with time.
 */
export function formatDateTime(date: string, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/**
 * Format a date as a relative time string (e.g. "2 hours ago", "3 days ago").
 */
export function timeAgo(date: string | Date | null | undefined): string {
  if (!date) return 'Never';
  const ms = Date.now() - new Date(date).getTime();
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

/** Format a project budget range enum value for display. */
export function formatBudgetRange(budget: string): string {
  if (budget.startsWith('RANGE_')) {
    const parts = budget.replace('RANGE_', '').split('_');
    return `$${parts[0]} – $${parts[1]}`;
  }
  switch (budget) {
    case 'UNDER_10K':
      return 'Under $10K';
    case 'OVER_100K':
      return 'Over $100K';
    default:
      return budget.replace(/_/g, ' ').toLowerCase();
  }
}