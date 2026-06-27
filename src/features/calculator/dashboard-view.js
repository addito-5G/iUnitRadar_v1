import { formatCurrency, formatGrowthDelta, formatMonth, formatMonthShort, formatNumber, formatPercent } from '../../lib/formatters.js';
import { GLOSSARY, METHODOLOGY_NOTE } from './glossary.js';

function renderEmptyDashboard() {
  return `
    <section class="empty-state-hero">
      <div class="empty-state-hero__content">
        <span class="badge badge--neutral">Демо B2B SaaS · маркетплейсы РФ</span>
        <h2>Начните с готового сценария</h2>
        <p>
          Три месяца реалистичных данных: MRR, NRR, CAC, gross margin, health score и валидация входов.
          Подходит, чтобы быстро показать логику калькулятора или проверить гипотезу по unit economics.
        </p>
        <div class="empty-state-hero__actions">
          <button class="button button--primary" data-action="load-sample">Загрузить демо-сценарий</button>
          <button class="button button--ghost" data-action="add-month">Создать пустой месяц</button>
        </div>
      </div>
      <div class="empty-state-hero__card card">
        <h3 class="section__title" style="font-size:18px;">Что внутри демо</h3>
        <div class="meta-list">
          <li>Сентябрь — запуск когорты партнёров Wildberries</li>
          <li>Октябрь — рост GMV, первые клиенты Ozon</li>
          <li>Ноябрь — предсезонный рост и крупные кабинеты</li>
        </div>
      </div>
    </section>
  `;
}

function renderKpis(metrics) {
  if (!metrics) return '';

  const items = [
    ['MRR', formatCurrency(metrics.mrr, true), formatGrowthDelta(metrics.mrrGrowthPct), 'Конечный recurring revenue за месяц.'],
    ['NRR', formatPercent(metrics.nrr), 'Удержание выручки по существующей базе.', 'Ключевая retention-метрика B2B SaaS.'],
    ['Gross Margin', formatPercent(metrics.grossMarginPct), `COGS ${formatCurrency(metrics.totalCOGS, true)}`, 'Маржа после infra и delivery cost.'],
    ['LTV:CAC', `${formatNumber(metrics.ltvCacRatio, 1)}×`, `Payback ${formatNumber(metrics.paybackMonths, 1)} мес`, 'Эффективность unit economics.'],
  ];

  return `
    <div class="kpi-grid">
      ${items.map(([label, value, delta, hint]) => `
        <article class="kpi-card">
          <div class="kpi-card__label">${label}</div>
          <div class="kpi-card__value">${value}</div>
          <div class="kpi-card__delta is-neutral">${delta}</div>
          <div class="kpi-card__hint">${hint}</div>
        </article>
      `).join('')}
    </div>
  `;
}

function renderSummary(metrics) {
  if (!metrics) return '';
  return `
    <section class="section-card">
      <div class="section__header">
        <div>
          <h2 class="section__title">Обзор выбранного месяца</h2>
          <p class="section__description">Сводка по revenue, efficiency и retention для ${formatMonth(metrics.month)}.</p>
        </div>
        <span class="badge ${metrics.healthScore >= 75 ? 'badge--success' : metrics.healthScore >= 50 ? 'badge--warning' : 'badge--danger'}">Health ${metrics.healthScore}</span>
      </div>
      <div class="overview-grid">
        <div class="card">
          <table class="summary-table">
            <tbody>
              <tr><td>ARR</td><td>${formatCurrency(metrics.arr, true)}</td></tr>
              <tr><td>ARPA</td><td>${formatCurrency(metrics.arpa)}</td></tr>
              <tr><td>CAC</td><td>${formatCurrency(metrics.cac)}</td></tr>
              <tr><td>ROMI</td><td>${formatPercent(metrics.romi, 0)}</td></tr>
              <tr><td>Quick Ratio</td><td>${formatNumber(metrics.quickRatio, 2)}</td></tr>
              <tr><td>Rule of 40</td><td>${metrics.ruleOf40 == null ? '—' : formatPercent(metrics.ruleOf40, 1)}</td></tr>
            </tbody>
          </table>
        </div>
        <div class="card">
          <table class="summary-table">
            <tbody>
              <tr><td>Клиентов на конец</td><td>${formatNumber(metrics.customersAtEnd, 0)}</td></tr>
              <tr><td>Activation Rate</td><td>${formatPercent(metrics.activationRate)}</td></tr>
              <tr><td>Logo Churn</td><td>${formatPercent(metrics.logoChurnRate, 2)}</td></tr>
              <tr><td>Revenue Churn</td><td>${formatPercent(metrics.revenueChurnRate, 2)}</td></tr>
              <tr><td>Recognized Revenue</td><td>${formatCurrency(metrics.totalRevenueRecognized, true)}</td></tr>
              <tr><td>Cash-in</td><td>${formatCurrency(metrics.totalRevenueCash, true)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `;
}

function renderHealth(metrics) {
  if (!metrics) return '';
  const warnings = metrics.warnings.length
    ? metrics.warnings.map((warning) => `
      <div class="warning-item">
        <div class="warning-item__top">
          <strong>${warning.field}</strong>
          <span class="badge ${warning.severity === 'error' ? 'badge--danger' : warning.severity === 'warning' ? 'badge--warning' : 'badge--neutral'}">${warning.severity}</span>
        </div>
        <div class="warning-item__message">${warning.message}</div>
      </div>
    `).join('')
    : '<div class="warning-item"><strong>Замечаний нет</strong><div class="warning-item__message">Данные выглядят согласованными.</div></div>';

  return `
    <section class="section-card">
      <div class="section__header">
        <div>
          <h2 class="section__title">Health flags и валидация</h2>
          <p class="section__description">Сигналы считаются централизованно по порогам и не зависят от UI.</p>
        </div>
      </div>
      <div class="health-grid">
        <div class="card">
          <h3 class="section__title" style="font-size:18px;">Health flags</h3>
          <div class="health-flag-list">
            ${metrics.healthFlags.map((flag) => `
              <div class="health-flag">
                <div class="health-flag__top">
                  <strong>${flag.label}</strong>
                  <span class="badge ${flag.status === 'green' ? 'badge--success' : flag.status === 'yellow' ? 'badge--warning' : flag.status === 'red' ? 'badge--danger' : 'badge--neutral'}">${flag.threshold}</span>
                </div>
                <div class="warning-item__message">${flag.message}</div>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="card">
          <h3 class="section__title" style="font-size:18px;">Validation feed</h3>
          <div class="warning-list">${warnings}</div>
        </div>
      </div>
    </section>
  `;
}

export function renderDashboardOverview(state) {
  if (!state.months.length) {
    return `<section class="section">${renderEmptyDashboard()}</section>`;
  }

  const selected = state.selectedMetrics;
  return `
    <section class="section">
      ${renderKpis(selected)}
      ${renderSummary(selected)}
      ${renderHealth(selected)}
      <section class="section-card">
        <div class="section__header">
          <div>
            <h2 class="section__title">Timeline</h2>
            <p class="section__description">Динамика по месяцам в одной таблице.</p>
          </div>
        </div>
        <div class="table-shell">
          <table class="table">
            <thead>
              <tr>
                <th>Месяц</th>
                <th class="table__cell--numeric">MRR</th>
                <th class="table__cell--numeric">Recognized Revenue</th>
                <th class="table__cell--numeric">NRR</th>
                <th class="table__cell--numeric">CAC</th>
                <th class="table__cell--numeric">Payback</th>
                <th class="table__cell--numeric">Rule of 40</th>
              </tr>
            </thead>
            <tbody>
              ${state.metrics.map((metrics) => `
                <tr data-select-month="${metrics.monthId}">
                  <td>${formatMonthShort(metrics.month)}</td>
                  <td class="table__cell--numeric">${formatCurrency(metrics.mrr, true)}</td>
                  <td class="table__cell--numeric">${formatCurrency(metrics.totalRevenueRecognized, true)}</td>
                  <td class="table__cell--numeric">${formatPercent(metrics.nrr, 1)}</td>
                  <td class="table__cell--numeric">${formatCurrency(metrics.cac)}</td>
                  <td class="table__cell--numeric">${formatNumber(metrics.paybackMonths, 1)} мес</td>
                  <td class="table__cell--numeric">${metrics.ruleOf40 == null ? '—' : formatPercent(metrics.ruleOf40, 1)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  `;
}

export function renderMonthsManager(state) {
  if (!state.months.length) {
    return renderEmptyDashboard();
  }
  const metricMap = new Map(state.metrics.map((item) => [item.monthId, item]));
  return `
    <section class="section-card">
      <div class="section__header">
        <div>
          <h2 class="section__title">Данные по месяцам</h2>
          <p class="section__description">Редактирование формы отделено от расчётов и предупреждений.</p>
        </div>
      </div>
      <div class="table-shell">
        <table class="table">
          <thead>
            <tr>
              <th>Месяц</th>
              <th class="table__cell--numeric">MRR</th>
              <th class="table__cell--numeric">Клиенты</th>
              <th class="table__cell--numeric">NRR</th>
              <th class="table__cell--numeric">Gross Margin</th>
              <th class="table__cell--numeric">Health</th>
              <th class="table__cell--numeric">Действия</th>
            </tr>
          </thead>
          <tbody>
            ${[...state.months].reverse().map((month) => {
              const metrics = metricMap.get(month.id);
              const selectedClass = state.appState.selectedMonthId === month.id ? 'is-selected' : '';
              return `
                <tr class="table__row ${selectedClass}">
                  <td data-select-month="${month.id}">
                    <strong>${formatMonth(month.month)}</strong>
                    ${month.notes ? `<div class="field__hint">${month.notes}</div>` : ''}
                  </td>
                  <td class="table__cell--numeric">${metrics ? formatCurrency(metrics.mrr, true) : '—'}</td>
                  <td class="table__cell--numeric">${metrics ? formatNumber(metrics.customersAtEnd, 0) : '—'}</td>
                  <td class="table__cell--numeric">${metrics ? formatPercent(metrics.nrr, 1) : '—'}</td>
                  <td class="table__cell--numeric">${metrics ? formatPercent(metrics.grossMarginPct, 1) : '—'}</td>
                  <td class="table__cell--numeric">${metrics ? metrics.healthScore : '—'}</td>
                  <td class="table__cell--numeric">
                    <div class="table__actions">
                      <button class="button button--ghost" data-edit-month="${month.id}">Изменить</button>
                      <button class="button button--ghost" data-duplicate-month="${month.id}" data-duplicate-from="${month.month}">Копия</button>
                      <button class="button button--danger" data-delete-month="${month.id}" data-delete-name="${month.month}">Удалить</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

export function renderImportExportSection(state) {
  return `
    <section class="section-card">
      <div class="section__header">
        <div>
          <h2 class="section__title">Импорт / экспорт</h2>
          <p class="section__description">JSON сохраняет полный snapshot, CSV — входные поля для Excel / BI.</p>
        </div>
      </div>
      <div class="share-grid">
        <div class="card">
          <div class="share-box">
            <div class="meta-list">
              <li>В сценарии сейчас <strong>${state.months.length}</strong> мес.</li>
              <li>JSON включает thresholds, activation config и выбранный месяц.</li>
              <li>CSV включает только входные поля без derived metrics.</li>
            </div>
            <div class="split">
              <button class="button" data-export-json>Экспорт JSON</button>
              <button class="button" data-export-csv>Экспорт CSV</button>
              <label class="button button--ghost" style="display:inline-flex; align-items:center; gap:8px;">
                Импорт JSON
                <input type="file" accept=".json" data-import-file class="hidden" />
              </label>
            </div>
          </div>
        </div>
        <div class="card">
          <h3 class="section__title" style="font-size:18px;">Хранение данных</h3>
          <div class="meta-list">
            <li><strong>Локальный черновик</strong> — быстрое редактирование и офлайн.</li>
            <li><strong>Remote snapshot</strong> — надёжный шаринг по ссылке.</li>
            <li><strong>Версионирование payload</strong> — задел под миграции схемы.</li>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function renderGlossarySection() {
  return `
    <section class="section-card">
      <div class="section__header">
        <div>
          <h2 class="section__title">Справочник метрик</h2>
          <p class="section__description">${METHODOLOGY_NOTE}</p>
        </div>
      </div>
      <div class="glossary-list">
        ${GLOSSARY.map((item) => `
          <article class="glossary-item">
            <div class="glossary-item__top">
              <strong>${item.name}</strong>
              <span class="badge badge--neutral">${item.category}</span>
            </div>
            <div class="warning-item__message">${item.definition}</div>
            <code>${item.formula}</code>
            <div class="warning-item__message">${item.interpretation}</div>
            ${item.assumption ? `<div class="field__hint glossary-item__assumption">${item.assumption}</div>` : ''}
          </article>
        `).join('')}
      </div>
    </section>
  `;
}
