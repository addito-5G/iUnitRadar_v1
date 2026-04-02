export const DEFAULT_THRESHOLDS = {
  nrr: { green: 105, yellow: 95 },
  grr: { green: 90, yellow: 80 },
  logoChurn: { green: 3, yellow: 5 },
  grossMargin: { green: 70, yellow: 55 },
  quickRatio: { green: 4, yellow: 2 },
  ltvCac: { green: 3, yellow: 1 },
  payback: { green: 12, yellow: 24 },
  activationRate: { green: 70, yellow: 50 },
  ruleOf40: { green: 40, yellow: 20 },
};

export const DEFAULT_ACTIVATION_CONFIG = {
  minCabinets: 1,
  minActiveDays: 7,
  minActiveSKU: 10,
  requiredFeatureUsed: true,
  label: '≥1 кабинет + ≥7 дней + ≥10 SKU + ключевая функция',
};

export const STORAGE_KEYS = {
  months: 'iunitradar_v3_months',
  state: 'iunitradar_v3_state',
};

export const APP_NAME = 'iUnitRadar';
export const LOCAL_SCHEMA_VERSION = 1;
export const SHARE_SCHEMA_VERSION = 1;
