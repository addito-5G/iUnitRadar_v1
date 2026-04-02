import { clamp } from './formatters.js';

const NUMERIC_FIELDS = [
  'customersAtStart', 'newSignedCustomers', 'newPayingCustomers', 'activatedCustomers', 'churnedCustomers', 'reactivatedCustomers',
  'activePayingCustomersEnd', 'startingMRR', 'newMRR', 'expansionMRR', 'contractionMRR', 'churnedMRR', 'reactivationMRR',
  'recurringRevenueRecognized', 'subscriptionCashIn', 'oneTimeServicesRevenue', 'discountsCreditsRefunds', 'totalRecognizedRevenue', 'totalCashIn',
  'averageBaseFee', 'modulesRevenue', 'usageBasedRevenue', 'activeCabinets', 'activeSKUs', 'managedGMV', 'activeUsersOrSeats', 'marketingCost',
  'salesCost', 'partnerAcquisitionCost', 'onboardingCost', 'supportCost', 'csmCost', 'analystServiceCost', 'infraCloudCost', 'apiAiCost',
  'partnerCommissions', 'timeToValueDays', 'featureUsageCount', 'connectedCabinetsCount', 'activeDaysForActivation',
];

const INTEGER_FIELDS = new Set([
  'customersAtStart', 'newSignedCustomers', 'newPayingCustomers', 'activatedCustomers', 'churnedCustomers', 'reactivatedCustomers', 'activePayingCustomersEnd',
  'activeCabinets', 'activeSKUs', 'activeUsersOrSeats', 'timeToValueDays', 'featureUsageCount', 'connectedCabinetsCount', 'activeDaysForActivation',
]);

export function createFormValues(month) {
  const form = {};
  for (const [key, value] of Object.entries(month)) {
    if (typeof value === 'number') {
      form[key] = value === 0 ? '' : String(value);
    } else if (typeof value === 'boolean') {
      form[key] = value;
    } else {
      form[key] = value ?? '';
    }
  }
  return form;
}

export function parseNumericInput(raw, { integer = false } = {}) {
  if (raw == null || raw === '') return 0;
  const normalized = String(raw).replace(/\s+/g, '').replace(',', '.');
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return 0;
  return integer ? Math.round(parsed) : parsed;
}

export function normalizeMonthForm(formValues, existingMonth) {
  const next = { ...existingMonth };
  for (const field of NUMERIC_FIELDS) {
    next[field] = parseNumericInput(formValues[field], { integer: INTEGER_FIELDS.has(field) });
  }
  next.month = String(formValues.month || '').trim();
  next.notes = String(formValues.notes || '').trim();
  next.activationThresholdPassed = Boolean(formValues.activationThresholdPassed);
  next.updatedAt = new Date().toISOString();
  return next;
}

export function validateMonth(month) {
  const issues = [];
  const push = (field, message, severity) => issues.push({ field, message, severity });

  if (!/^\d{4}-\d{2}$/.test(month.month)) {
    push('month', 'Формат месяца должен быть YYYY-MM, например 2025-11.', 'error');
  }

  if (month.customersAtStart < 0) push('customersAtStart', 'Клиентов на начало не может быть отрицательным.', 'error');
  if (month.newSignedCustomers < 0) push('newSignedCustomers', 'Новых подписанных не может быть отрицательным.', 'error');
  if (month.churnedCustomers < 0) push('churnedCustomers', 'Ушедших клиентов не может быть отрицательным.', 'error');
  if (month.reactivatedCustomers < 0) push('reactivatedCustomers', 'Реактивированных клиентов не может быть отрицательным.', 'error');
  if (month.activatedCustomers < 0) push('activatedCustomers', 'Активированных клиентов не может быть отрицательным.', 'error');
  if (month.activePayingCustomersEnd < 0) push('activePayingCustomersEnd', 'Активных плательщиков на конец не может быть отрицательным.', 'error');

  if (month.churnedCustomers > month.customersAtStart && month.customersAtStart > 0) {
    push('churnedCustomers', `Ушедших (${month.churnedCustomers}) больше, чем клиентов на начало (${month.customersAtStart}).`, 'error');
  }

  if (month.activatedCustomers > month.newSignedCustomers && month.newSignedCustomers > 0) {
    push('activatedCustomers', 'Активированных больше, чем новых подписанных. Проверьте, не смешаны ли активации из других месяцев.', 'warning');
  }

  if (month.startingMRR < 0) push('startingMRR', 'Starting MRR не может быть отрицательным.', 'error');
  if (month.newMRR < 0) push('newMRR', 'New MRR не может быть отрицательным.', 'error');
  if (month.expansionMRR < 0) push('expansionMRR', 'Expansion MRR не может быть отрицательным.', 'error');
  if (month.contractionMRR < 0) push('contractionMRR', 'Contraction MRR не может быть отрицательным.', 'error');
  if (month.churnedMRR < 0) push('churnedMRR', 'Churned MRR не может быть отрицательным.', 'error');
  if (month.reactivationMRR < 0) push('reactivationMRR', 'Reactivation MRR не может быть отрицательным.', 'error');

  if (month.churnedMRR > month.startingMRR && month.startingMRR > 0) {
    push('churnedMRR', `Churned MRR (${month.churnedMRR.toLocaleString('ru-RU')} ₽) превышает Starting MRR (${month.startingMRR.toLocaleString('ru-RU')} ₽).`, 'error');
  }

  if (month.contractionMRR > month.startingMRR && month.startingMRR > 0) {
    push('contractionMRR', 'Contraction MRR превышает Starting MRR.', 'error');
  }

  if (month.oneTimeServicesRevenue < 0) push('oneTimeServicesRevenue', 'Выручка от услуг не может быть отрицательной.', 'error');
  if (month.discountsCreditsRefunds < 0) push('discountsCreditsRefunds', 'Скидки и рефанды указываются положительным числом.', 'error');
  if (month.timeToValueDays < 0) push('timeToValueDays', 'Time to Value не может быть отрицательным.', 'error');

  const nonNegativeLabels = [
    ['marketingCost', 'Маркетинг'],
    ['salesCost', 'Продажи'],
    ['partnerAcquisitionCost', 'Привлечение партнёров'],
    ['onboardingCost', 'Онбординг'],
    ['supportCost', 'Поддержка'],
    ['csmCost', 'CSM'],
    ['analystServiceCost', 'Аналитика / сервис'],
    ['infraCloudCost', 'Инфра / Cloud'],
    ['apiAiCost', 'API / AI'],
    ['partnerCommissions', 'Комиссии партнёров'],
  ];

  for (const [field, label] of nonNegativeLabels) {
    if (typeof month[field] === 'number' && month[field] < 0) {
      push(field, `${label}: значение не может быть отрицательным.`, 'error');
    }
  }

  if (month.startingMRR === 0 && month.customersAtStart > 0) {
    push('startingMRR', 'Starting MRR равен 0 при наличии клиентов. NRR и GRR будут неинформативны.', 'warning');
  }

  if (month.infraCloudCost === 0 && month.apiAiCost === 0) {
    push('infraCloudCost', 'Инфра и API/AI равны 0. Для SaaS с интеграциями это нетипично — проверьте данные.', 'info');
  }

  if (month.managedGMV > 0 && month.managedGMV < 1_000_000) {
    push('managedGMV', `Управляемый GMV (${month.managedGMV.toLocaleString('ru-RU')} ₽) выглядит заниженным.`, 'info');
  }

  return issues;
}

export function issueMap(issues) {
  return issues.reduce((acc, issue) => {
    acc[issue.field] = issue;
    return acc;
  }, {});
}

export function scoreThreshold(value, green, yellow, higherIsBetter = true) {
  if (higherIsBetter) {
    if (value >= green) return 'green';
    if (value >= yellow) return 'yellow';
    return 'red';
  }
  if (value <= green) return 'green';
  if (value <= yellow) return 'yellow';
  return 'red';
}

export function calculateHealthScore(flags) {
  if (!flags.length) return 50;
  const scored = flags.filter((flag) => flag.status !== 'neutral');
  if (!scored.length) return 50;
  const total = scored.reduce((acc, flag) => {
    if (flag.status === 'green') return acc + 100;
    if (flag.status === 'yellow') return acc + 50;
    return acc;
  }, 0);
  return clamp(Math.round(total / scored.length), 0, 100);
}
