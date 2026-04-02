import { formatMonth, formatMonthShort } from '../../lib/formatters.js';
import { isRemoteSharingConfigured } from '../../lib/supabase-rest.js';

export function renderSharePanel(state) {
  const shareStatus = state.ui.shareStatus;
  const selected = state.selectedMetrics;
  const remoteConfigured = isRemoteSharingConfigured();
  const shareStatusBadgeClass = shareStatus.type === 'success'
    ? 'badge--success'
    : shareStatus.type === 'error'
      ? 'badge--danger'
      : shareStatus.type === 'loading'
        ? 'badge--warning'
        : 'badge--neutral';

  return `
    <section class="section-card">
      <div class="section__header">
        <div>
          <h2 class="section__title">Поделиться расчётом</h2>
          <p class="section__description">Shared-link сохраняет удалённый snapshot всех входных данных и конфигурации калькулятора. На другом устройстве откроются те же данные и тот же результат.</p>
        </div>
        <span class="badge ${shareStatusBadgeClass}">${shareStatus.type === 'idle' ? 'готово' : shareStatus.type}</span>
      </div>
      <div class="share-grid">
        <div class="card">
          <div class="share-box">
            <div class="share-list">
              <li><strong>Remote storage:</strong> ${remoteConfigured ? 'настроен' : 'не настроен'}</li>
              <li><strong>Последнее сохранение:</strong> ${state.ui.lastSharedAt ? new Date(state.ui.lastSharedAt).toLocaleString('ru-RU') : 'ещё не было'}</li>
              <li><strong>В shared payload попадёт:</strong> ${state.months.length} месяц(а/ев), thresholds, activation config и selected month.</li>
              ${state.ui.viewingSharedSnapshot ? `<li><strong>Режим просмотра:</strong> открыт shared snapshot <code>${state.ui.activeRemoteId}</code></li>` : ''}
            </div>
            <div class="split">
              <button class="button button--primary" data-share-save ${remoteConfigured ? '' : 'disabled'}>Сохранить и получить ссылку</button>
              <button class="button" data-share-copy ${state.ui.lastShareUrl ? '' : 'disabled'}>Скопировать ссылку</button>
              ${state.ui.viewingSharedSnapshot ? '<button class="button button--ghost" data-share-detach>Создать локальную копию</button>' : ''}
            </div>
            <div class="share-link">
              <div class="share-link__value">${state.ui.lastShareUrl || 'Пока ссылка не создана.'}</div>
            </div>
            ${shareStatus.message ? `<div class="warning-item__message">${shareStatus.message}</div>` : ''}
            ${!remoteConfigured ? '<div class="field__hint">Чтобы включить шаринг, заполните <code>config.js</code> значениями Supabase.</div>' : ''}
          </div>
        </div>
        <div class="card">
          <h3 class="section__title" style="font-size:18px;">Snapshot preview</h3>
          ${selected ? `
            <table class="summary-table">
              <tbody>
                <tr><td>Выбранный месяц</td><td>${formatMonth(selected.month)}</td></tr>
                <tr><td>MRR</td><td>${selected.mrr.toLocaleString('ru-RU')} ₽</td></tr>
                <tr><td>NRR</td><td>${selected.nrr.toLocaleString('ru-RU')}%</td></tr>
                <tr><td>Gross Margin</td><td>${selected.grossMarginPct.toLocaleString('ru-RU')}%</td></tr>
                <tr><td>LTV:CAC</td><td>${selected.ltvCacRatio.toLocaleString('ru-RU')}×</td></tr>
                <tr><td>Timeline</td><td>${state.metrics.map((item) => formatMonthShort(item.month)).join(', ')}</td></tr>
              </tbody>
            </table>
          ` : '<div class="warning-item__message">Нет выбранного месяца для превью.</div>'}
        </div>
      </div>
    </section>
  `;
}
