export function safeDivide(value, divisor) {
  if (!Number.isFinite(value) || !Number.isFinite(divisor) || divisor === 0) {
    return 0;
  }
  return value / divisor;
}

export function round(value, decimals = 0) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function formatCurrency(value, compact = false) {
  if (!Number.isFinite(value)) {
    return '—';
  }
  if (compact) {
    const abs = Math.abs(value);
    if (abs >= 1_000_000_000) return `${round(value / 1_000_000_000, 1)} млрд ₽`;
    if (abs >= 1_000_000) return `${round(value / 1_000_000, 1)} млн ₽`;
    if (abs >= 1_000) return `${round(value / 1_000, 0)}K ₽`;
    return `${round(value, 0)} ₽`;
  }
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value, decimals = 1) {
  if (!Number.isFinite(value)) {
    return '—';
  }
  return `${round(value, decimals)}%`;
}

export function formatNumber(value, decimals = 1) {
  if (!Number.isFinite(value)) {
    return '—';
  }
  return new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0,
  }).format(round(value, decimals));
}

const MONTHS_FULL = ['', 'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const MONTHS_SHORT = ['', 'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

export function formatMonth(yyyyMm) {
  const [year, month] = String(yyyyMm).split('-');
  return `${MONTHS_FULL[Number(month)] ?? month} ${year}`;
}

export function formatMonthShort(yyyyMm) {
  const [year, month] = String(yyyyMm).split('-');
  return `${MONTHS_SHORT[Number(month)] ?? month} ${String(year).slice(2)}`;
}

export function formatGrowthDelta(value) {
  if (value == null || !Number.isFinite(value)) return 'Нет базы сравнения';
  if (value > 0) return `+${formatPercent(value, 1)} к прошлому периоду`;
  if (value < 0) return `${formatPercent(value, 1)} к прошлому периоду`;
  return 'Без изменений к прошлому периоду';
}
