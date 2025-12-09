/**
 * Utilities for persisting user preferences to localStorage
 */

const STORAGE_KEYS = {
  VIEW_MODE: 'notes-app-view-mode',
  INCLUDE_TITLE: 'notes-app-include-title',
  PAGE_SIZE: 'notes-app-page-size',
} as const;

export function saveViewMode(mode: 'card' | 'list'): void {
  try {
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, mode);
  } catch (error) {
    console.warn('Failed to save view mode to localStorage:', error);
  }
}

export function loadViewMode(): 'card' | 'list' | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.VIEW_MODE);
    if (stored === 'card' || stored === 'list') {
      return stored;
    }
    return null;
  } catch (error) {
    console.warn('Failed to load view mode from localStorage:', error);
    return null;
  }
}

export function saveIncludeTitle(includeTitle: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.INCLUDE_TITLE, String(includeTitle));
  } catch (error) {
    console.warn('Failed to save include title preference to localStorage:', error);
  }
}

export function loadIncludeTitle(): boolean | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.INCLUDE_TITLE);
    if (stored === null) return null;
    return stored === 'true';
  } catch (error) {
    console.warn('Failed to load include title preference from localStorage:', error);
    return null;
  }
}

export function savePageSize(pageSize: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PAGE_SIZE, String(pageSize));
  } catch (error) {
    console.warn('Failed to save page size to localStorage:', error);
  }
}

export function loadPageSize(): number | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PAGE_SIZE);
    if (stored === null) return null;
    const parsed = parseInt(stored, 10);
    return isNaN(parsed) ? null : parsed;
  } catch (error) {
    console.warn('Failed to load page size from localStorage:', error);
    return null;
  }
}
