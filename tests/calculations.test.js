import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { calculateMetrics } from '../src/lib/calculations.js';
import { createEmptyMonth } from '../src/lib/month-model.js';
import { DEFAULT_THRESHOLDS } from '../src/lib/constants.js';

function baseMonth(overrides = {}) {
  return {
    ...createEmptyMonth('2025-09'),
    customersAtStart: 100,
    newPayingCustomers: 10,
    activatedCustomers: 8,
    churnedCustomers: 5,
    startingMRR: 1_000_000,
    newMRR: 200_000,
    expansionMRR: 50_000,
    contractionMRR: 20_000,
    churnedMRR: 40_000,
    reactivationMRR: 10_000,
    marketingCost: 300_000,
    salesCost: 200_000,
    infraCloudCost: 100_000,
    onboardingCost: 50_000,
    supportCost: 80_000,
    csmCost: 120_000,
    ...overrides,
  };
}

describe('calculateMetrics', () => {
  it('calculates ending MRR from waterfall components', () => {
    const metrics = calculateMetrics(baseMonth(), null, DEFAULT_THRESHOLDS);
    assert.equal(metrics.endingMRR, 1_200_000);
    assert.equal(metrics.mrr, 1_200_000);
    assert.equal(metrics.arr, 14_400_000);
  });

  it('calculates NRR from starting MRR and movements', () => {
    const metrics = calculateMetrics(baseMonth(), null, DEFAULT_THRESHOLDS);
    assert.equal(metrics.nrr, 100);
  });

  it('caps GRR at 100% when churn exceeds starting MRR', () => {
    const metrics = calculateMetrics(baseMonth({
      churnedMRR: 900_000,
      contractionMRR: 200_000,
    }), null, DEFAULT_THRESHOLDS);
    assert.equal(metrics.grr, 0);
    assert.ok(metrics.grr <= 100);
  });

  it('derives LTV:CAC from ARPA, gross margin, and logo churn', () => {
    const metrics = calculateMetrics(baseMonth(), null, DEFAULT_THRESHOLDS);
    assert.ok(metrics.ltv > 0);
    assert.ok(metrics.cac > 0);
    assert.ok(metrics.ltvCacRatio > 0);
  });

  it('flags inconsistent churned customers as validation errors', () => {
    const metrics = calculateMetrics(baseMonth({
      customersAtStart: 10,
      churnedCustomers: 15,
    }), null, DEFAULT_THRESHOLDS);
    assert.ok(metrics.warnings.some((item) => item.field === 'churnedCustomers' && item.severity === 'error'));
  });
});
