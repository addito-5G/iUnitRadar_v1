import { buildSharedSnapshot, parseSharedSnapshot } from '../../lib/share-payload.js';
import { createSharedRecord, fetchSharedRecord, isRemoteSharingConfigured } from '../../lib/supabase-rest.js';

const UUID_LIKE = /^[a-zA-Z0-9-]{8,}$/;

export function readCalcIdFromUrl() {
  const currentUrl = new URL(window.location.href);
  return currentUrl.searchParams.get('calc');
}

export function removeCalcIdFromUrl() {
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.delete('calc');
  history.replaceState({}, '', currentUrl.toString());
}

export function buildShareUrl(id) {
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set('calc', id);
  return currentUrl.toString();
}

export async function saveSharedCalculation(store) {
  if (!isRemoteSharingConfigured()) {
    throw new Error('Remote sharing не настроен. Заполните config.js для Supabase.');
  }
  const { months, appState } = store.getState();
  if (!months.length) {
    throw new Error('Нечего сохранять: список месяцев пуст.');
  }
  const snapshot = buildSharedSnapshot(months, appState);
  const record = await createSharedRecord(snapshot);
  return {
    id: record.id,
    createdAt: record.created_at,
    shareUrl: buildShareUrl(record.id),
  };
}

export async function loadSharedCalculation(calcId) {
  if (!calcId) return null;
  if (!UUID_LIKE.test(calcId)) {
    throw new Error('Некорректный идентификатор shared-расчёта.');
  }
  const record = await fetchSharedRecord(calcId);
  if (!record) {
    throw new Error('Shared-расчёт не найден. Возможно, ссылка устарела или была удалена.');
  }
  const parsed = parseSharedSnapshot(record.payload);
  return {
    id: record.id,
    createdAt: record.created_at,
    ...parsed,
  };
}

export async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  textarea.remove();
}
