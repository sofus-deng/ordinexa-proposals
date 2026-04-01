/**
 * Client-facing label mappings for internal status values
 */
const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  review: "In Review",
  sent: "Sent",
  won: "Won",
  archived: "Archived",
};

/**
 * Client-facing label mappings for internal project type values
 */
const PROJECT_TYPE_LABELS: Record<string, string> = {
  "office-fit-out": "Office Fit-Out",
  "commercial-showroom": "Commercial Showroom",
  "workspace-refresh": "Workspace Refresh",
  "reception-upgrade": "Reception Upgrade",
};

/**
 * Client-facing label mappings for internal style option values
 */
const STYLE_LABELS: Record<string, string> = {
  "premium-executive": "Premium Executive",
  "modern-corporate": "Modern Corporate",
  "industrial-minimal": "Industrial Minimal",
};

/**
 * Formats a currency value for display
 */
export function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formats a currency range for display with consistent client-facing style
 */
export function formatCurrencyRange(min: number, max: number, currency = "USD"): string {
  if (min === max) {
    return formatCurrency(min, currency);
  }
  return `${formatCurrency(min, currency)} – ${formatCurrency(max, currency)}`;
}

/**
 * Formats a timeline range for display with consistent client-facing style
 */
export function formatTimelineRange(minWeeks: number, maxWeeks: number): string {
  if (minWeeks === maxWeeks) {
    return `${minWeeks} week${minWeeks !== 1 ? "s" : ""}`;
  }
  return `${minWeeks} – ${maxWeeks} weeks`;
}

/**
 * Formats a date for display
 */
export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

/**
 * Returns a client-facing label for a status value
 */
export function formatStatus(status: string): string {
  return STATUS_LABELS[status] || status;
}

/**
 * Returns a client-facing label for a project type value
 */
export function formatProjectType(projectTypeId: string): string {
  return PROJECT_TYPE_LABELS[projectTypeId] || projectTypeId;
}

/**
 * Returns a client-facing label for a style option value
 */
export function formatStyle(styleOptionId: string): string {
  return STYLE_LABELS[styleOptionId] || styleOptionId;
}
