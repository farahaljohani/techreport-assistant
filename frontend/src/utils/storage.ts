// Tiny typed wrapper around localStorage. All reads are fault-tolerant so
// any corrupted/missing key simply falls back to the default value.

const PREFIX = 'tra.';

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Quota exceeded / private mode — ignore silently.
  }
}

export function removeKey(key: string): void {
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}

// Common keys used across the app
export const StorageKeys = {
  report: 'report',
  equations: 'equations',
  glossary: 'glossary',
  favoriteEquations: 'equations.favorites',
  expandedTools: 'tools.expanded',
  expandedSidebar: 'sidebar.expanded',
  recentReports: 'recentReports',
  unitPrecision: 'unitConverter.precision',
  askHistory: 'ask.history',
} as const;
