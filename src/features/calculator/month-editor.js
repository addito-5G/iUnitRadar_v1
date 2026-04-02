import { FIELD_GROUPS } from './field-config.js';
import { createFormValues, issueMap, normalizeMonthForm, validateMonth } from '../../lib/validators.js';

function createFieldMarkup(field, formValues, issues) {
  const [key, label, type = 'number', hint = ''] = field;
  const issue = issues[key];

  if (type === 'checkbox') {
    return `
      <label class="field">
        <span class="field__label">${label}</span>
        <div class="split">
          <input data-field="${key}" type="checkbox" ${formValues[key] ? 'checked' : ''} style="width:auto; margin-right:8px;" />
          <span class="field__hint">Флажок нужен для быстрых sanity-check и совместного просмотра расчёта.</span>
        </div>
        ${issue ? `<div class="${issue.severity === 'error' ? 'field__error' : 'field__info'}">${issue.message}</div>` : ''}
      </label>
    `;
  }

  if (type === 'textarea') {
    return `
      <label class="field">
        <span class="field__label">${label}</span>
        <textarea data-field="${key}" placeholder="Контекст, гипотезы, комментарии для шаринга">${formValues[key] ?? ''}</textarea>
        ${hint ? `<div class="field__hint">${hint}</div>` : ''}
        ${issue ? `<div class="${issue.severity === 'error' ? 'field__error' : 'field__info'}">${issue.message}</div>` : ''}
      </label>
    `;
  }

  if (type === 'month') {
    return `
      <label class="field">
        <span class="field__label">${label}</span>
        <input data-field="${key}" type="month" value="${formValues[key] ?? ''}" />
        ${issue ? `<div class="${issue.severity === 'error' ? 'field__error' : 'field__info'}">${issue.message}</div>` : ''}
      </label>
    `;
  }

  return `
    <label class="field">
      <span class="field__label">${label}</span>
      <input data-field="${key}" inputmode="decimal" type="text" value="${formValues[key] ?? ''}" />
      ${hint ? `<div class="field__hint">${hint}</div>` : ''}
      ${issue ? `<div class="${issue.severity === 'error' ? 'field__error' : 'field__info'}">${issue.message}</div>` : ''}
    </label>
  `;
}

export function createMonthEditor({ store }) {
  const dialog = document.createElement('dialog');
  dialog.className = 'dialog';

  const shell = document.createElement('div');
  shell.className = 'editor-panel';
  dialog.appendChild(shell);

  let currentMonth = null;
  let formValues = null;

  function getDraftMonth() {
    return normalizeMonthForm(formValues, currentMonth);
  }

  function getIssues() {
    return issueMap(validateMonth(getDraftMonth()));
  }

  function close() {
    dialog.close();
    store.setEditorMonthId(null);
  }

  function render() {
    if (!currentMonth || !formValues) return;
    const issues = getIssues();
    const draft = getDraftMonth();
    const issueList = validateMonth(draft);
    const issueMarkup = issueList.length
      ? issueList.map((issue) => `
          <div class="warning-item">
            <div class="warning-item__top">
              <strong>${issue.field}</strong>
              <span class="badge ${issue.severity === 'error' ? 'badge--danger' : issue.severity === 'warning' ? 'badge--warning' : 'badge--neutral'}">${issue.severity}</span>
            </div>
            <div class="warning-item__message">${issue.message}</div>
          </div>
        `).join('')
      : '<div class="warning-item"><strong>Проблем не найдено.</strong><div class="warning-item__message">Валидация проходит без ошибок.</div></div>';

    shell.innerHTML = `
      <div class="editor-panel__header">
        <div>
          <h2 class="editor-panel__title">Редактор месяца — ${draft.month || currentMonth.month}</h2>
          <p class="section__description">Форма и доменные расчёты разделены: пока вы редактируете строки, приложение работает с нормализованным snapshot.</p>
        </div>
        <div class="split">
          <button class="button button--ghost" data-action="close">Закрыть</button>
          <button class="button button--primary" data-action="save">Сохранить изменения</button>
        </div>
      </div>
      <div class="form-grid">
        ${FIELD_GROUPS.map((group) => `
          <section class="form-section">
            <div>
              <h3 class="form-section__title">${group.title}</h3>
              <p class="form-section__hint">${group.hint}</p>
            </div>
            ${group.fields.map((field) => createFieldMarkup(field, formValues, issues)).join('')}
          </section>
        `).join('')}
      </div>
      <div class="editor-panel__footer">
        <section class="section-card">
          <div class="section__header">
            <div>
              <h3 class="section__title">Live validation</h3>
              <p class="section__description">Ошибки, warning и info считаются централизованно теми же pure-функциями, что и на дашборде.</p>
            </div>
            <span class="inline-pill">${issueList.length} сообщений</span>
          </div>
          <div class="warning-list">${issueMarkup}</div>
        </section>
      </div>
    `;

    shell.querySelector('[data-action="close"]').addEventListener('click', close);
    shell.querySelector('[data-action="save"]').addEventListener('click', () => {
      const normalized = getDraftMonth();
      const blockingErrors = validateMonth(normalized).filter((issue) => issue.severity === 'error');
      if (blockingErrors.length) {
        store.setShareStatus('error', 'Сохранение заблокировано: сначала исправьте ошибки валидации.');
        render();
        return;
      }
      store.updateMonth(currentMonth.id, normalized);
      store.selectMonth(currentMonth.id);
      store.setShareStatus('success', `Месяц ${normalized.month} сохранён.`);
      close();
    });

    shell.querySelectorAll('[data-field]').forEach((element) => {
      element.addEventListener('input', (event) => {
        const target = event.currentTarget;
        const field = target.dataset.field;
        formValues[field] = target.type === 'checkbox' ? target.checked : target.value;
        render();
      });
      if (element.type === 'checkbox') {
        element.addEventListener('change', (event) => {
          const target = event.currentTarget;
          formValues[target.dataset.field] = target.checked;
          render();
        });
      }
    });
  }

  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    close();
  });

  return {
    element: dialog,
    open(month) {
      currentMonth = month;
      formValues = createFormValues(month);
      render();
      if (!dialog.open) dialog.showModal();
    },
    close,
  };
}
