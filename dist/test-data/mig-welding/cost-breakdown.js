"use strict";
/**
 * Cost Breakdown Test Data for MIG Welding
 * Based on actual calculation formulas from manufacturing-welding-calculator.service.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CostSummary_Example1 = exports.ESGData_Example1 = exports.CostBreakdown_Example1 = void 0;
exports.calculateDirectMachineCost = calculateDirectMachineCost;
exports.calculateDirectLaborCost = calculateDirectLaborCost;
exports.calculateDirectSetupCost = calculateDirectSetupCost;
exports.calculateInspectionCost = calculateInspectionCost;
exports.calculateYieldCost = calculateYieldCost;
exports.calculateNetProcessCost = calculateNetProcessCost;
// Example: Based on user's provided data
exports.CostBreakdown_Example1 = {
    // Input values
    netMaterialCost: 0.007,
    cycleTime: 95.2069, // seconds
    machineHourRate: 3.8548,
    laborRatePerHour: 42.7557,
    noOfLabors: 1,
    setupLaborRate: 34.1925,
    setupTime: 30, // minutes
    lotSize: 14167,
    qaInspectorRate: 29.9182,
    qaInspectionTime: 2, // seconds
    samplingRate: 5, // percent
    yieldPercentage: 97, // percent
    powerConsumption: 14, // kW
    electricityUnitCost: 0.132, // $ per kWh
    // Calculated values (from formulas)
    directMachineCost: Number(((3.8548 / 3600) * 95.2069).toFixed(4)),
    directLaborCost: Number(((42.7557 / 3600) * 95.2069 * 1).toFixed(4)),
    directSetUpCost: Number((((34.1925 + 3.8548) * (30 / 60)) / 14167).toFixed(4)),
    inspectionCost: Number(((5 / 100) * ((2 * 29.9182) / 3600)).toFixed(4)),
    yieldCost: 0, // calculated in test
    totalPowerCost: Number(((95.2069 / 3600) * 14 * 0.132).toFixed(4)),
    directProcessCost: 0, // calculated in test
    // Cost summary percentages
    materialCostPercent: 3.88,
    manufacturingCostPercent: 84.14,
    overheadProfitPercent: 11.37
};
// Calculate yield cost
const sum = exports.CostBreakdown_Example1.directMachineCost +
    exports.CostBreakdown_Example1.directSetUpCost +
    exports.CostBreakdown_Example1.directLaborCost +
    exports.CostBreakdown_Example1.inspectionCost;
exports.CostBreakdown_Example1.yieldCost = Number(((1 - exports.CostBreakdown_Example1.yieldPercentage / 100) *
    (exports.CostBreakdown_Example1.netMaterialCost + sum)).toFixed(4));
exports.CostBreakdown_Example1.directProcessCost = Number((sum + exports.CostBreakdown_Example1.yieldCost + exports.CostBreakdown_Example1.totalPowerCost).toFixed(4));
exports.ESGData_Example1 = {
    // Input
    annualVolume: 170000,
    productLife: 2,
    // Calculated
    materialCO2PerPart: 0.3713,
    manufacturingCO2PerPart: 0.2137, // from calculateManufacturingCO2
    totalPartESG: 0.585, // materialCO2 + manufacturingCO2
    annualESG: 99445, // totalPartESG * annualVolume
    lifetimeESG: 198890 // annualESG * productLife
};
exports.CostSummary_Example1 = {
    materialCost: { amount: 0.007, percent: 3.88 },
    manufacturingCost: { amount: 0.1517, percent: 84.14 },
    toolingCost: { amount: 0, percent: 0 },
    overheadProfit: { amount: 0.0205, percent: 11.37 },
    packingCost: { amount: 0.0009, percent: 0.50 },
    exwPartCost: { amount: 0.1801, percent: 99.89 },
    freightCost: { amount: 0.0002, percent: 0.11 },
    dutiesTariff: { amount: 0, percent: 0 },
    partShouldCost: { amount: 0.1803, percent: 100.00 }
};
// ==================== HELPER FUNCTIONS ====================
/**
 * Calculate direct machine cost
 * Formula: (machineHourRate / 3600) * cycleTimeSeconds
 */
function calculateDirectMachineCost(machineHourRate, cycleTimeSeconds) {
    return Number(((machineHourRate / 3600) * cycleTimeSeconds).toFixed(4));
}
/**
 * Calculate direct labor cost
 * Formula: (laborRate / 3600) * cycleTimeSeconds * noOfLabors
 */
function calculateDirectLaborCost(laborRate, cycleTimeSeconds, noOfLabors) {
    return Number(((laborRate / 3600) * cycleTimeSeconds * noOfLabors).toFixed(4));
}
/**
 * Calculate direct setup cost
 * Formula: ((setupLaborRate + machineRate) * (setupTimeMinutes / 60)) / lotSize
 */
function calculateDirectSetupCost(setupLaborRate, machineRate, setupTimeMinutes, lotSize) {
    return Number((((setupLaborRate + machineRate) * (setupTimeMinutes / 60)) / lotSize).toFixed(4));
}
/**
 * Calculate inspection cost
 * Formula: (samplingRate / 100) * ((inspectionTimeSeconds * qaRate) / 3600)
 */
function calculateInspectionCost(samplingRate, inspectionTimeSeconds, qaRate) {
    return Number(((samplingRate / 100) * ((inspectionTimeSeconds * qaRate) / 3600)).toFixed(4));
}
/**
 * Calculate yield cost
 * Formula: (1 - yieldPercent / 100) * (materialCost + manufacturingSum)
 */
function calculateYieldCost(yieldPercent, materialCost, manufacturingSum) {
    return Number(((1 - yieldPercent / 100) * (materialCost + manufacturingSum)).toFixed(4));
}
/**
 * Calculate net process cost (Manufacturing Cost)
 * Formula: machineC + laborCost + setupCost + inspectionCost + yieldCost + powerCost
 */
function calculateNetProcessCost(costs) {
    const sum = costs.machineCost + costs.laborCost + costs.setupCost + costs.inspectionCost;
    return Number((sum + costs.yieldCost + costs.powerCost).toFixed(4));
}
