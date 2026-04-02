/**
 * @typedef {Object} ThresholdRange
 * @property {number} green
 * @property {number} yellow
 *
 * @typedef {Object} Thresholds
 * @property {ThresholdRange} nrr
 * @property {ThresholdRange} grr
 * @property {ThresholdRange} logoChurn
 * @property {ThresholdRange} grossMargin
 * @property {ThresholdRange} quickRatio
 * @property {ThresholdRange} ltvCac
 * @property {ThresholdRange} payback
 * @property {ThresholdRange} activationRate
 * @property {ThresholdRange} ruleOf40
 *
 * @typedef {Object} ActivationConfig
 * @property {number} minCabinets
 * @property {number} minActiveDays
 * @property {number} minActiveSKU
 * @property {boolean} requiredFeatureUsed
 * @property {string} label
 *
 * @typedef {Object} MonthInput
 * @property {string} id
 * @property {string} month
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {number} customersAtStart
 * @property {number} newSignedCustomers
 * @property {number} newPayingCustomers
 * @property {number} activatedCustomers
 * @property {number} churnedCustomers
 * @property {number} reactivatedCustomers
 * @property {number} activePayingCustomersEnd
 * @property {number} startingMRR
 * @property {number} newMRR
 * @property {number} expansionMRR
 * @property {number} contractionMRR
 * @property {number} churnedMRR
 * @property {number} reactivationMRR
 * @property {number} recurringRevenueRecognized
 * @property {number} subscriptionCashIn
 * @property {number} oneTimeServicesRevenue
 * @property {number} discountsCreditsRefunds
 * @property {number} totalRecognizedRevenue
 * @property {number} totalCashIn
 * @property {number} averageBaseFee
 * @property {number} modulesRevenue
 * @property {number} usageBasedRevenue
 * @property {number} activeCabinets
 * @property {number} activeSKUs
 * @property {number} managedGMV
 * @property {number} activeUsersOrSeats
 * @property {number} marketingCost
 * @property {number} salesCost
 * @property {number} partnerAcquisitionCost
 * @property {number} onboardingCost
 * @property {number} supportCost
 * @property {number} csmCost
 * @property {number} analystServiceCost
 * @property {number} infraCloudCost
 * @property {number} apiAiCost
 * @property {number} partnerCommissions
 * @property {number} timeToValueDays
 * @property {number} featureUsageCount
 * @property {number} connectedCabinetsCount
 * @property {number} activeDaysForActivation
 * @property {boolean} activationThresholdPassed
 * @property {string} notes
 *
 * @typedef {Object} ValidationIssue
 * @property {string} field
 * @property {string} message
 * @property {'error' | 'warning' | 'info'} severity
 *
 * @typedef {Object} HealthFlag
 * @property {string} metricKey
 * @property {string} label
 * @property {'green' | 'yellow' | 'red' | 'neutral'} status
 * @property {number} value
 * @property {string} threshold
 * @property {string} message
 *
 * @typedef {Object} ComputedMetrics
 * @property {string} monthId
 * @property {string} month
 * @property {number} mrr
 * @property {number} arr
 * @property {number} arpa
 * @property {number} arpu
 * @property {number} acv
 * @property {number} endingMRR
 * @property {number} netNewMRR
 * @property {number} recurringRevenue
 * @property {number} oneTimeRevenue
 * @property {number} totalRevenueCash
 * @property {number} totalRevenueRecognized
 * @property {number} logoChurnRate
 * @property {number} revenueChurnRate
 * @property {number} contractionRate
 * @property {number} expansionRate
 * @property {number} grr
 * @property {number} nrr
 * @property {number} reactivationRate
 * @property {number} quickRatio
 * @property {number} cac
 * @property {number} cacActivated
 * @property {number} activationRate
 * @property {number} totalAcquisitionCost
 * @property {number} totalCOGS
 * @property {number} totalCustomerSuccessCost
 * @property {number} totalServicesDeliveryCost
 * @property {number} grossProfit
 * @property {number} grossMarginPct
 * @property {number} subscriptionGrossMarginPct
 * @property {number} serviceGrossMarginPct
 * @property {number} cm1
 * @property {number} cm2
 * @property {number} ltv
 * @property {number} ltvCacRatio
 * @property {number} paybackMonths
 * @property {number} activatedPaybackMonths
 * @property {number} romi
 * @property {number | null} revenueGrowthPct
 * @property {number | null} mrrGrowthPct
 * @property {number} profitMarginPct
 * @property {number | null} ruleOf40
 * @property {number} customersAtEnd
 * @property {number} healthScore
 * @property {HealthFlag[]} healthFlags
 * @property {ValidationIssue[]} warnings
 *
 * @typedef {Object} SharedSnapshotV1
 * @property {1} schemaVersion
 * @property {string} appName
 * @property {string} createdAt
 * @property {{months: MonthInput[], selectedMonthId: string | null, thresholds: Thresholds, activationConfig: ActivationConfig}} data
 */
export {};
