import { clamp, round, safeDivide } from './formatters.js';
import { calculateHealthScore, scoreThreshold, validateMonth } from './validators.js';

export function calculateMetrics(month, previousMonth, thresholds) {
  const warnings = validateMonth(month);
  const endingMRR = Math.max(0, month.startingMRR + month.newMRR + month.expansionMRR + month.reactivationMRR - month.contractionMRR - month.churnedMRR);
  const netNewMRR = month.newMRR + month.expansionMRR + month.reactivationMRR - month.contractionMRR - month.churnedMRR;
  const recurringRevenue = endingMRR;
  const oneTimeRevenue = month.oneTimeServicesRevenue + month.modulesRevenue + month.usageBasedRevenue;
  const totalRevenueRecognized = month.recurringRevenueRecognized > 0
    ? month.recurringRevenueRecognized + oneTimeRevenue - month.discountsCreditsRefunds
    : recurringRevenue + oneTimeRevenue - month.discountsCreditsRefunds;
  const totalRevenueCash = month.totalCashIn > 0
    ? month.totalCashIn
    : month.subscriptionCashIn + oneTimeRevenue - month.discountsCreditsRefunds;

  const customersAtEnd = month.activePayingCustomersEnd > 0
    ? month.activePayingCustomersEnd
    : Math.max(0, month.customersAtStart + month.newPayingCustomers - month.churnedCustomers + month.reactivatedCustomers);

  const arpa = round(safeDivide(recurringRevenue, customersAtEnd), 0);
  const arpu = round(safeDivide(totalRevenueRecognized, Math.max(month.activeUsersOrSeats, customersAtEnd)), 0);
  const acv = arpa * 12;

  const logoChurnRate = round(safeDivide(month.churnedCustomers, month.customersAtStart) * 100, 2);
  const revenueChurnRate = round(safeDivide(month.churnedMRR, month.startingMRR) * 100, 2);
  const contractionRate = round(safeDivide(month.contractionMRR, month.startingMRR) * 100, 2);
  const expansionRate = round(safeDivide(month.expansionMRR, month.startingMRR) * 100, 2);

  const grr = month.startingMRR > 0
    ? round(clamp(safeDivide(month.startingMRR - month.churnedMRR - month.contractionMRR, month.startingMRR) * 100, 0, 100), 1)
    : 0;
  const nrr = month.startingMRR > 0
    ? round(safeDivide(month.startingMRR + month.expansionMRR + month.reactivationMRR - month.contractionMRR - month.churnedMRR, month.startingMRR) * 100, 1)
    : 0;
  const reactivationRate = round(safeDivide(month.reactivatedCustomers, Math.max(month.churnedCustomers, 1)) * 100, 1);

  const quickRatio = (() => {
    const churnPool = month.churnedMRR + month.contractionMRR;
    const growthPool = month.newMRR + month.expansionMRR + month.reactivationMRR;
    if (churnPool <= 0) return growthPool > 0 ? 999 : 0;
    return round(safeDivide(growthPool, churnPool), 2);
  })();

  const totalAcquisitionCost = month.marketingCost + month.salesCost + month.partnerAcquisitionCost;
  const cac = round(safeDivide(totalAcquisitionCost, Math.max(month.newPayingCustomers, 1)), 0);
  const activationRate = round(safeDivide(month.activatedCustomers, Math.max(month.newSignedCustomers, 1)) * 100, 1);
  const cacActivated = round(safeDivide(totalAcquisitionCost, Math.max(month.activatedCustomers, 1)), 0);

  const infraAndAi = month.infraCloudCost + month.apiAiCost;
  const servicesDelivery = month.onboardingCost + month.analystServiceCost;
  const totalCOGS = infraAndAi + servicesDelivery;
  const customerSuccess = month.supportCost + month.csmCost;
  const grossProfit = totalRevenueRecognized - totalCOGS;
  const grossMarginPct = round(safeDivide(grossProfit, totalRevenueRecognized) * 100, 1);

  const subscriptionGrossProfit = recurringRevenue - infraAndAi;
  const subscriptionGrossMarginPct = round(safeDivide(subscriptionGrossProfit, Math.max(recurringRevenue, 1)) * 100, 1);

  const servicesGrossProfit = month.oneTimeServicesRevenue - servicesDelivery;
  const serviceGrossMarginPct = month.oneTimeServicesRevenue > 0
    ? round(safeDivide(servicesGrossProfit, month.oneTimeServicesRevenue) * 100, 1)
    : 0;

  const cm1 = totalRevenueRecognized - totalCOGS;
  const cm2 = cm1 - customerSuccess;

  const churnFraction = safeDivide(logoChurnRate, 100);
  const marginFraction = safeDivide(grossMarginPct, 100);
  const ltv = churnFraction > 0 ? round(safeDivide(arpa * marginFraction, churnFraction), 0) : 0;
  const ltvCacRatio = round(safeDivide(ltv, Math.max(cac, 1)), 2);

  const marginRevenuePerCustomer = safeDivide(grossProfit, Math.max(customersAtEnd, 1));
  const paybackMonths = marginRevenuePerCustomer > 0 ? round(safeDivide(cac, marginRevenuePerCustomer), 1) : 0;
  const activatedMarginRevenue = safeDivide(grossProfit, Math.max(month.activatedCustomers, 1));
  const activatedPaybackMonths = activatedMarginRevenue > 0 ? round(safeDivide(cacActivated, activatedMarginRevenue), 1) : 0;
  const romi = totalAcquisitionCost > 0 ? round(safeDivide(ltv - cac, Math.max(cac, 1)) * 100, 0) : 0;

  const previousEndingMRR = previousMonth
    ? previousMonth.startingMRR + previousMonth.newMRR + previousMonth.expansionMRR + previousMonth.reactivationMRR - previousMonth.contractionMRR - previousMonth.churnedMRR
    : null;
  const mrrGrowthPct = previousEndingMRR && previousEndingMRR > 0
    ? round(safeDivide(endingMRR - previousEndingMRR, previousEndingMRR) * 100, 1)
    : null;

  const previousRecognizedRevenue = previousMonth
    ? (previousMonth.recurringRevenueRecognized > 0 ? previousMonth.recurringRevenueRecognized : previousEndingMRR ?? 0) + previousMonth.oneTimeServicesRevenue
    : null;
  const revenueGrowthPct = previousRecognizedRevenue && previousRecognizedRevenue > 0
    ? round(safeDivide(totalRevenueRecognized - previousRecognizedRevenue, previousRecognizedRevenue) * 100, 1)
    : null;

  const profitMarginPct = round(safeDivide(grossProfit, totalRevenueRecognized) * 100, 1);
  const ruleOf40 = revenueGrowthPct != null ? round(revenueGrowthPct + profitMarginPct, 1) : null;

  const healthFlags = [];
  const pushFlag = (metricKey, label, value, green, yellow, higherIsBetter, thresholdLabel, messageBuilder) => {
    if (value == null) return;
    const status = scoreThreshold(value, green, yellow, higherIsBetter);
    healthFlags.push({ metricKey, label, status, value, threshold: thresholdLabel, message: messageBuilder(status) });
  };

  pushFlag('nrr', 'NRR', nrr, thresholds.nrr.green, thresholds.nrr.yellow, true, `≥${thresholds.nrr.green}% = зелёный`, (status) => (
    status === 'green' ? 'Отличное удержание выручки.' : status === 'yellow' ? 'Удержание выручки под контролем.' : 'Выручка сокращается — разберите churn и downgrade.'
  ));
  pushFlag('grr', 'GRR', grr, thresholds.grr.green, thresholds.grr.yellow, true, `≥${thresholds.grr.green}% = зелёный`, (status) => (
    status === 'green' ? 'Базовое удержание хорошее.' : status === 'yellow' ? 'Базовое удержание нужно улучшить.' : 'Высокий churn — требуется работа с клиентами.'
  ));
  pushFlag('logoChurn', 'Logo Churn', logoChurnRate, thresholds.logoChurn.green, thresholds.logoChurn.yellow, false, `≤${thresholds.logoChurn.green}% = зелёный`, (status) => (
    status === 'green' ? 'Отток клиентов в норме.' : status === 'yellow' ? 'Умеренный отток — следите за трендом.' : 'Отток клиентов критичен.'
  ));
  pushFlag('grossMargin', 'Gross Margin', grossMarginPct, thresholds.grossMargin.green, thresholds.grossMargin.yellow, true, `≥${thresholds.grossMargin.green}% = зелёный`, (status) => (
    status === 'green' ? 'Маржа хорошая.' : status === 'yellow' ? 'Маржа приемлема, но есть потенциал.' : 'Низкая маржа — анализируйте структуру расходов.'
  ));
  pushFlag('quickRatio', 'Quick Ratio', quickRatio < 999 ? quickRatio : null, thresholds.quickRatio.green, thresholds.quickRatio.yellow, true, `≥${thresholds.quickRatio.green} = зелёный`, (status) => (
    status === 'green' ? 'Рост опережает отток.' : status === 'yellow' ? 'Рост умеренный относительно оттока.' : 'Отток опережает рост — бизнес теряет выручку.'
  ));
  pushFlag('ltvCac', 'LTV:CAC', ltvCacRatio, thresholds.ltvCac.green, thresholds.ltvCac.yellow, true, `≥${thresholds.ltvCac.green}x = зелёный`, (status) => (
    status === 'green' ? 'Хорошая возвратность инвестиций в привлечение.' : status === 'yellow' ? 'LTV:CAC приемлем, но есть потенциал.' : 'LTV:CAC низкий — привлечение окупается плохо.'
  ));
  pushFlag('payback', 'Payback', paybackMonths > 0 ? paybackMonths : null, thresholds.payback.green, thresholds.payback.yellow, false, `≤${thresholds.payback.green} мес = зелёный`, (status) => (
    status === 'green' ? 'Быстрая окупаемость привлечения.' : status === 'yellow' ? 'Окупаемость в рамках нормы.' : 'Долгая окупаемость — давление на cash flow.'
  ));
  if (activationRate > 0) {
    pushFlag('activationRate', 'Activation Rate', activationRate, thresholds.activationRate.green, thresholds.activationRate.yellow, true, `≥${thresholds.activationRate.green}% = зелёный`, (status) => (
      status === 'green' ? 'Высокая активация новых клиентов.' : status === 'yellow' ? 'Активация умеренная — улучшайте онбординг.' : 'Низкая активация — клиенты не доходят до ценности.'
    ));
  }
  if (ruleOf40 != null) {
    pushFlag('ruleOf40', 'Rule of 40', ruleOf40, thresholds.ruleOf40.green, thresholds.ruleOf40.yellow, true, `≥${thresholds.ruleOf40.green} = зелёный`, (status) => (
      status === 'green' ? 'Отличный баланс роста и прибыльности.' : status === 'yellow' ? 'Rule of 40 приемлем.' : 'Рост не компенсирует ухудшение экономики.'
    ));
  }

  return {
    monthId: month.id,
    month: month.month,
    mrr: recurringRevenue,
    arr: recurringRevenue * 12,
    arpa,
    arpu,
    acv,
    endingMRR,
    netNewMRR,
    recurringRevenue,
    oneTimeRevenue,
    totalRevenueCash,
    totalRevenueRecognized,
    logoChurnRate,
    revenueChurnRate,
    contractionRate,
    expansionRate,
    grr,
    nrr,
    reactivationRate,
    quickRatio,
    cac,
    cacActivated,
    activationRate,
    totalAcquisitionCost,
    totalCOGS,
    totalCustomerSuccessCost: customerSuccess,
    totalServicesDeliveryCost: servicesDelivery,
    grossProfit,
    grossMarginPct,
    subscriptionGrossMarginPct,
    serviceGrossMarginPct,
    cm1,
    cm2,
    ltv,
    ltvCacRatio,
    paybackMonths,
    activatedPaybackMonths,
    romi,
    revenueGrowthPct,
    mrrGrowthPct,
    profitMarginPct,
    ruleOf40,
    customersAtEnd,
    healthScore: calculateHealthScore(healthFlags),
    healthFlags,
    warnings,
  };
}

export function buildMetricsTimeline(months, appState) {
  const sorted = [...months].sort((left, right) => left.month.localeCompare(right.month));
  return sorted.map((month, index) => {
    const previous = index > 0 ? sorted[index - 1] : null;
    return calculateMetrics(month, previous, appState.thresholds);
  });
}
