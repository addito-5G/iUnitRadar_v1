import { createDefaultAppState } from '../lib/month-model.js';
import { STORAGE_KEYS } from '../lib/constants.js';

export function loadMonths() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.months);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveMonths(months) {
  localStorage.setItem(STORAGE_KEYS.months, JSON.stringify(months));
}

export function loadAppState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.state);
    if (!raw) return createDefaultAppState();
    const parsed = JSON.parse(raw);
    return { ...createDefaultAppState(), ...parsed };
  } catch {
    return createDefaultAppState();
  }
}

export function saveAppState(appState) {
  localStorage.setItem(STORAGE_KEYS.state, JSON.stringify(appState));
}
