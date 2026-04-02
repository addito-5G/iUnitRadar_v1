import { APP_NAME, SHARE_SCHEMA_VERSION } from './constants.js';
import { createDefaultAppState } from './month-model.js';

export function buildSharedSnapshot(months, appState) {
  return {
    schemaVersion: SHARE_SCHEMA_VERSION,
    appName: APP_NAME,
    createdAt: new Date().toISOString(),
    data: {
      months,
      selectedMonthId: appState.selectedMonthId,
      thresholds: appState.thresholds,
      activationConfig: appState.activationConfig,
    },
  };
}

export function parseSharedSnapshot(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Пустой payload shared-расчёта.');
  }
  if (payload.appName !== APP_NAME) {
    throw new Error('Этот shared-снимок создан не нашим калькулятором.');
  }
  if (payload.schemaVersion !== SHARE_SCHEMA_VERSION) {
    throw new Error(`Неподдерживаемая версия shared-схемы: ${payload.schemaVersion}.`);
  }
  if (!Array.isArray(payload.data?.months)) {
    throw new Error('Shared-снимок не содержит список месяцев.');
  }
  return {
    months: payload.data.months,
    appState: {
      ...createDefaultAppState(),
      selectedMonthId: payload.data.selectedMonthId ?? null,
      thresholds: payload.data.thresholds ?? createDefaultAppState().thresholds,
      activationConfig: payload.data.activationConfig ?? createDefaultAppState().activationConfig,
    },
  };
}
