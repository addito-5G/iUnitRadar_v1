import { buildMetricsTimeline } from '../lib/calculations.js';
import { createDefaultAppState, createEmptyMonth, createSeedMonths } from '../lib/month-model.js';
import { loadAppState, loadMonths, saveAppState, saveMonths } from './local-storage.js';

function sortMonths(months) {
  return [...months].sort((left, right) => left.month.localeCompare(right.month));
}

function createInitialState() {
  let months = loadMonths();
  const appState = loadAppState();
  if (!months.length) {
    months = createSeedMonths();
    saveMonths(months);
    saveAppState(appState);
  }
  return {
    months: sortMonths(months),
    appState: { ...createDefaultAppState(), ...appState },
    ui: {
      activeSection: 'dashboard',
      editorMonthId: null,
      shareStatus: { type: 'idle', message: '' },
      lastShareUrl: '',
      lastSharedAt: '',
      activeRemoteId: null,
      viewingSharedSnapshot: false,
      remoteLoadState: 'idle',
      remoteLoadMessage: '',
    },
  };
}

export class AppStore {
  constructor() {
    this.state = createInitialState();
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit() {
    for (const listener of this.listeners) listener(this.getState());
  }

  getState() {
    const metrics = buildMetricsTimeline(this.state.months, this.state.appState);
    const latestMetrics = metrics[metrics.length - 1] ?? null;
    const selectedMetrics = this.state.appState.selectedMonthId
      ? metrics.find((item) => item.monthId === this.state.appState.selectedMonthId) ?? latestMetrics
      : latestMetrics;
    return {
      ...this.state,
      months: sortMonths(this.state.months),
      metrics,
      latestMetrics,
      selectedMetrics,
    };
  }

  persist() {
    saveMonths(this.state.months);
    saveAppState(this.state.appState);
  }

  setActiveSection(section) {
    this.state.ui.activeSection = section;
    this.emit();
  }

  setEditorMonthId(monthId) {
    this.state.ui.editorMonthId = monthId;
    this.emit();
  }

  addMonth(month) {
    this.state.months = sortMonths([...this.state.months, month]);
    this.persist();
    this.emit();
  }

  addEmptyMonth(monthKey) {
    const month = createEmptyMonth(monthKey);
    this.addMonth(month);
    this.setEditorMonthId(month.id);
    return month;
  }

  updateMonth(monthId, nextMonth) {
    this.state.months = sortMonths(this.state.months.map((item) => item.id === monthId ? nextMonth : item));
    this.persist();
    this.emit();
  }

  deleteMonth(monthId) {
    this.state.months = this.state.months.filter((item) => item.id !== monthId);
    if (this.state.appState.selectedMonthId === monthId) {
      this.state.appState.selectedMonthId = null;
    }
    if (this.state.ui.editorMonthId === monthId) {
      this.state.ui.editorMonthId = null;
    }
    this.persist();
    this.emit();
  }

  duplicateMonth(monthId, nextMonthKey) {
    const source = this.state.months.find((item) => item.id === monthId);
    if (!source) return null;
    if (this.state.months.some((item) => item.month === nextMonthKey)) return null;
    const duplicate = {
      ...source,
      id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      month: nextMonthKey,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.addMonth(duplicate);
    return duplicate;
  }

  replaceAll(months, partialAppState = {}) {
    this.state.months = sortMonths(months);
    this.state.appState = { ...createDefaultAppState(), ...this.state.appState, ...partialAppState };
    this.persist();
    this.emit();
  }

  selectMonth(monthId) {
    this.state.appState.selectedMonthId = monthId;
    this.persist();
    this.emit();
  }

  setThresholds(thresholds) {
    this.state.appState.thresholds = thresholds;
    this.persist();
    this.emit();
  }

  setActivationConfig(config) {
    this.state.appState.activationConfig = config;
    this.persist();
    this.emit();
  }

  setShareStatus(type, message) {
    this.state.ui.shareStatus = { type, message };
    this.emit();
  }

  setShareInfo({ lastShareUrl, lastSharedAt, activeRemoteId, viewingSharedSnapshot }) {
    if (typeof lastShareUrl === 'string') this.state.ui.lastShareUrl = lastShareUrl;
    if (typeof lastSharedAt === 'string') this.state.ui.lastSharedAt = lastSharedAt;
    if (typeof activeRemoteId === 'string' || activeRemoteId === null) this.state.ui.activeRemoteId = activeRemoteId;
    if (typeof viewingSharedSnapshot === 'boolean') this.state.ui.viewingSharedSnapshot = viewingSharedSnapshot;
    this.emit();
  }

  setRemoteLoadState(remoteLoadState, remoteLoadMessage = '') {
    this.state.ui.remoteLoadState = remoteLoadState;
    this.state.ui.remoteLoadMessage = remoteLoadMessage;
    this.emit();
  }

  clearSharedView() {
    this.state.ui.viewingSharedSnapshot = false;
    this.state.ui.activeRemoteId = null;
    this.state.ui.remoteLoadState = 'idle';
    this.state.ui.remoteLoadMessage = '';
    this.emit();
  }
}
