import { APP_NAME } from './constants.js';

export function createExportPayload(months, appState) {
  return {
    version: '4.0',
    appName: APP_NAME,
    exportedAt: new Date().toISOString(),
    months,
    config: {
      activationConfig: appState.activationConfig,
      thresholds: appState.thresholds,
      selectedMonthId: appState.selectedMonthId,
    },
  };
}

export function parseImportPayload(text) {
  const parsed = JSON.parse(text);
  if (parsed.appName !== APP_NAME) {
    throw new Error('Неверный формат файла — это не экспорт iUnitRadar.');
  }
  if (!Array.isArray(parsed.months)) {
    throw new Error('Файл не содержит списка месяцев.');
  }
  return {
    months: parsed.months.map((month) => ({
      ...month,
      id: `m_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      createdAt: month.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
    appState: {
      activationConfig: parsed.config?.activationConfig,
      thresholds: parsed.config?.thresholds,
      selectedMonthId: parsed.config?.selectedMonthId ?? null,
    },
  };
}

export function monthsToCsv(months) {
  if (!months.length) return '';
  const columns = Object.keys(months[0]).filter((key) => !['id', 'createdAt', 'updatedAt', 'notes'].includes(key));
  const rows = months.map((row) => columns.map((column) => csvValue(row[column])).join(','));
  return [columns.join(','), ...rows].join('\n');
}

function csvValue(value) {
  const raw = String(value ?? '');
  if (/[",\n]/.test(raw)) {
    return `"${raw.replaceAll('"', '""')}"`;
  }
  return raw;
}

export function downloadFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
