import { AppStore } from './state/app-store.js';
import { createMonthEditor } from './features/calculator/month-editor.js';
import { renderDashboardOverview, renderGlossarySection, renderImportExportSection, renderMonthsManager } from './features/calculator/dashboard-view.js';
import { renderSharePanel } from './features/share/share-panel.js';
import { createExportPayload, downloadFile, monthsToCsv, parseImportPayload } from './lib/exporters.js';
import { formatCurrency, formatMonth, formatPercent } from './lib/formatters.js';
import { createEmptyMonth } from './lib/month-model.js';
import { copyText, loadSharedCalculation, readCalcIdFromUrl, removeCalcIdFromUrl, saveSharedCalculation } from './features/share/share-service.js';

const NAV_ITEMS = [
  ['dashboard', 'Обзор'],
  ['months', 'Месяцы'],
  ['share', 'Поделиться'],
  ['importExport', 'Импорт / экспорт'],
  ['glossary', 'Справочник'],
];

const store = new AppStore();
const app = document.getElementById('app');
const monthEditor = createMonthEditor({ store });
document.body.appendChild(monthEditor.element);

function renderShell(state) {
  const latest = state.latestMetrics;
  const warningCount = state.metrics.reduce((acc, item) => acc + item.warnings.filter((w) => w.severity === 'error').length, 0);
  const activeSection = state.ui.activeSection;
  const hasMonths = state.months.length > 0;

  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand__logo">IU</div>
          <div>
            <div class="brand__title">iUnitRadar</div>
            <div class="brand__subtitle">Unit economics для B2B SaaS</div>
          </div>
        </div>
        <nav class="nav">
          ${NAV_ITEMS.map(([key, label]) => `
            <button class="nav__button ${activeSection === key ? 'is-active' : ''}" data-section="${key}">
              <span>${label}</span>
              ${key === 'months' && warningCount > 0 ? `<span class="badge badge--danger">${warningCount}</span>` : ''}
            </button>
          `).join('')}
        </nav>
        <div class="sidebar__footer footer-note">
          Черновики хранятся локально. Ссылки на сценарии — через Supabase snapshot.
        </div>
      </aside>
      <main class="main">
        <div class="container">
          <section class="hero">
            <div class="hero__top">
              <div>
                <h1>Unit economics B2B SaaS</h1>
                <p>
                  Соберите помесячные данные, проверьте качество входов и сравните retention, маржу и эффективность
                  привлечения до решений по roadmap и бюджету.
                </p>
              </div>
              <div class="hero__actions">
                ${!hasMonths ? '<button class="button button--primary" data-action="load-sample">Загрузить демо-сценарий</button>' : ''}
                <button class="button ${hasMonths ? 'button--primary' : ''}" data-action="add-month">Добавить месяц</button>
                ${hasMonths ? `
                  <button class="button" data-action="share-save">Сохранить и поделиться</button>
                  <button class="button button--ghost" data-action="share-copy" ${state.ui.lastShareUrl ? '' : 'disabled'}>Скопировать ссылку</button>
                  <button class="button button--ghost" data-action="load-sample">Сбросить к демо</button>
                ` : ''}
              </div>
            </div>
            ${hasMonths ? `
              <div class="hero__meta">
                <span class="meta-pill">${state.months.length} мес. в сценарии</span>
                <span class="meta-pill">${latest ? `MRR ${formatCurrency(latest.mrr, true)}` : '—'}</span>
                <span class="meta-pill">${latest ? `NRR ${formatPercent(latest.nrr, 1)}` : '—'}</span>
                <span class="meta-pill">${state.ui.viewingSharedSnapshot ? `Shared: ${state.ui.activeRemoteId}` : 'Локальный черновик'}</span>
              </div>
            ` : ''}
          </section>

          <div class="section-tabs" aria-label="Навигация">
            ${NAV_ITEMS.map(([key, label]) => `<button class="button ${activeSection === key ? 'button--primary' : ''}" data-section="${key}">${label}</button>`).join('')}
          </div>

          ${hasMonths ? `
            <section class="status-banner">
              <div class="status-banner__row">
                <div>
                  <strong>${state.ui.remoteLoadState === 'loading' ? 'Загрузка shared snapshot…' : state.ui.shareStatus.message || 'Готово к работе.'}</strong>
                  <div class="warning-item__message">
                    ${state.ui.remoteLoadMessage || (state.selectedMetrics ? `Выбран ${formatMonth(state.selectedMetrics.month)}.` : 'Выберите месяц или создайте новый расчёт.')}
                  </div>
                </div>
                <div class="status-banner__actions">
                  ${state.ui.viewingSharedSnapshot ? '<button class="button button--ghost" data-action="detach-shared">Создать локальную копию</button>' : ''}
                  <button class="button" data-action="export-json">Экспорт JSON</button>
                  <button class="button" data-action="export-csv">Экспорт CSV</button>
                  <label class="button button--ghost">Импорт JSON<input class="hidden" type="file" accept=".json" data-action="import-json" /></label>
                </div>
              </div>
            </section>
          ` : ''}

          ${activeSection === 'dashboard' ? renderDashboardOverview(state) : ''}
          ${activeSection === 'share' ? renderSharePanel(state) : ''}
          ${activeSection === 'months' ? renderMonthsManager(state) : ''}
          ${activeSection === 'importExport' ? renderImportExportSection(state) : ''}
          ${activeSection === 'glossary' ? renderGlossarySection() : ''}
        </div>
      </main>
    </div>
  `;

  bindEvents(state);
}

function bindEvents(state) {
  app.querySelectorAll('[data-section]').forEach((button) => {
    button.addEventListener('click', () => store.setActiveSection(button.dataset.section));
  });

  app.querySelector('[data-action="load-sample"]')?.addEventListener('click', () => {
    if (state.months.length && !window.confirm('Текущие данные будут заменены демо-сценарием. Продолжить?')) return;
    store.loadSampleScenario();
    store.setShareStatus('success', 'Демо-сценарий загружен: 3 месяца B2B SaaS для селлеров маркетплейсов.');
  });

  app.querySelectorAll('[data-select-month]').forEach((row) => {
    row.addEventListener('click', () => store.selectMonth(row.dataset.selectMonth));
    row.style.cursor = 'pointer';
  });

  app.querySelectorAll('[data-edit-month]').forEach((button) => {
    button.addEventListener('click', () => {
      const month = store.getState().months.find((item) => item.id === button.dataset.editMonth);
      if (month) monthEditor.open(month);
    });
  });

  app.querySelectorAll('[data-delete-month]').forEach((button) => {
    button.addEventListener('click', () => {
      const monthLabel = button.dataset.deleteName;
      if (window.confirm(`Удалить ${monthLabel}? Это действие нельзя отменить.`)) {
        store.deleteMonth(button.dataset.deleteMonth);
        store.setShareStatus('success', `Месяц ${monthLabel} удалён.`);
      }
    });
  });

  app.querySelectorAll('[data-duplicate-month]').forEach((button) => {
    button.addEventListener('click', () => {
      const sourceMonth = button.dataset.duplicateFrom;
      const nextMonth = window.prompt('Новый месяц для копии (YYYY-MM)', sourceMonth);
      if (!nextMonth) return;
      const duplicate = store.duplicateMonth(button.dataset.duplicateMonth, nextMonth);
      if (!duplicate) {
        store.setShareStatus('error', 'Не удалось создать копию: возможно, такой месяц уже существует.');
        return;
      }
      store.setShareStatus('success', `Создана копия ${nextMonth}.`);
      monthEditor.open(duplicate);
    });
  });

  app.querySelector('[data-action="add-month"]')?.addEventListener('click', () => {
    const month = new Date();
    const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
    if (state.months.some((item) => item.month === key)) {
      const nextMonth = prompt('Месяц уже существует. Введите другой YYYY-MM');
      if (!nextMonth) return;
      if (state.months.some((item) => item.month === nextMonth)) {
        store.setShareStatus('error', 'Такой месяц уже существует.');
        return;
      }
      const created = createEmptyMonth(nextMonth);
      store.addMonth(created);
      monthEditor.open(created);
      return;
    }
    const created = createEmptyMonth(key);
    store.addMonth(created);
    monthEditor.open(created);
  });

  app.querySelector('[data-action="share-save"]')?.addEventListener('click', handleShareSave);
  app.querySelector('[data-action="share-copy"]')?.addEventListener('click', handleShareCopy);
  app.querySelector('[data-share-save]')?.addEventListener('click', handleShareSave);
  app.querySelector('[data-share-copy]')?.addEventListener('click', handleShareCopy);
  app.querySelector('[data-action="detach-shared"]')?.addEventListener('click', detachSharedMode);
  app.querySelector('[data-share-detach]')?.addEventListener('click', detachSharedMode);
  app.querySelector('[data-action="export-json"]')?.addEventListener('click', exportJson);
  app.querySelector('[data-export-json]')?.addEventListener('click', exportJson);
  app.querySelector('[data-action="export-csv"]')?.addEventListener('click', exportCsv);
  app.querySelector('[data-export-csv]')?.addEventListener('click', exportCsv);

  [app.querySelector('[data-action="import-json"]'), app.querySelector('[data-import-file]')].filter(Boolean).forEach((input) => {
    input.addEventListener('change', async () => {
      await handleImport(input);
    });
  });
}

function exportJson() {
  const state = store.getState();
  const payload = createExportPayload(state.months, state.appState);
  downloadFile(`iunitradar-export-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(payload, null, 2), 'application/json');
  store.setShareStatus('success', 'JSON-экспорт сформирован.');
}

function exportCsv() {
  const state = store.getState();
  const csv = monthsToCsv(state.months);
  downloadFile(`iunitradar-export-${new Date().toISOString().slice(0, 10)}.csv`, csv, 'text/csv;charset=utf-8');
  store.setShareStatus('success', 'CSV-экспорт сформирован.');
}

async function handleImport(input) {
  const file = input.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = parseImportPayload(text);
    store.replaceAll(parsed.months, parsed.appState);
    store.setShareStatus('success', 'Импорт выполнен: данные заменены новым snapshot.');
  } catch (error) {
    store.setShareStatus('error', error instanceof Error ? error.message : 'Не удалось импортировать файл.');
  } finally {
    input.value = '';
  }
}

async function handleShareSave() {
  try {
    store.setShareStatus('loading', 'Сохраняю shared snapshot…');
    const result = await saveSharedCalculation(store);
    store.setShareInfo({
      lastShareUrl: result.shareUrl,
      lastSharedAt: result.createdAt,
      activeRemoteId: result.id,
      viewingSharedSnapshot: true,
    });
    store.setShareStatus('success', 'Snapshot сохранён. Ссылку можно отправлять коллегам.');
  } catch (error) {
    store.setShareStatus('error', error instanceof Error ? error.message : 'Не удалось сохранить shared snapshot.');
  }
}

async function handleShareCopy() {
  const { ui } = store.getState();
  if (!ui.lastShareUrl) return;
  try {
    await copyText(ui.lastShareUrl);
    store.setShareStatus('success', 'Ссылка скопирована в буфер обмена.');
  } catch (error) {
    store.setShareStatus('error', error instanceof Error ? error.message : 'Не удалось скопировать ссылку.');
  }
}

function detachSharedMode() {
  removeCalcIdFromUrl();
  store.clearSharedView();
  store.setShareStatus('success', 'Shared mode выключен. Текущие данные остались локально.');
}

async function bootstrapRemoteSnapshot() {
  const calcId = readCalcIdFromUrl();
  if (!calcId) return;
  try {
    store.setRemoteLoadState('loading', 'Читаю remote snapshot по ссылке…');
    const snapshot = await loadSharedCalculation(calcId);
    store.replaceAll(snapshot.months, snapshot.appState);
    store.setShareInfo({
      activeRemoteId: snapshot.id,
      viewingSharedSnapshot: true,
      lastShareUrl: window.location.href,
      lastSharedAt: snapshot.createdAt,
    });
    store.setRemoteLoadState('success', `Shared snapshot ${snapshot.id} загружен.`);
    store.setShareStatus('success', 'Открыт shared snapshot — вы видите тот же расчёт, что и автор ссылки.');
  } catch (error) {
    store.setRemoteLoadState('error', error instanceof Error ? error.message : 'Не удалось загрузить shared snapshot.');
    store.setShareStatus('error', error instanceof Error ? error.message : 'Не удалось загрузить shared snapshot.');
  }
}

store.subscribe((state) => {
  renderShell(state);
});

renderShell(store.getState());
bootstrapRemoteSnapshot();
