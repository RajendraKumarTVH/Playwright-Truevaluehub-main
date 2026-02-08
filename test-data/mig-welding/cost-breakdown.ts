/**
 * Cost Breakdown Test Data for MIG Welding
 * Based on actual calculation formulas from manufacturing-welding-calculator.service.ts
 */

// ==================== COST BREAKDOWN FORMULAS ====================
/**
 * directMachineCost = (machineHourRate / 3600) * cycleTime
 * directLaborCost = (laborRatePerHour / 3600) * cycleTime * noOfLabors
 * directSetUpCost = ((setupLaborRate + machineHourRate) * (setupTime / 60)) / lotSize
 * inspectionCost = (samplingRate / 100) * ((inspectionTime * qaRate) / 3600)
 * sum = directMachineCost + directSetUpCost + directLaborCost + inspectionCost
 * yieldCost = (1 - yieldPer / 100) * (netMaterialCost + sum)
 * directProcessCost = sum + yieldCost + totalPowerCost
 */

export interface CostBreakdownData {
    // Input values
    netMaterialCost: number
    cycleTime: number
    machineHourRate: number
    laborRatePerHour: number
    noOfLabors: number
    setupLaborRate: number
    setupTime: number
    lotSize: number
    qaInspectorRate: number
    qaInspectionTime: number
    samplingRate: number
    yieldPercentage: number
    powerConsumption: number
    electricityUnitCost: number

    // Calculated values
    directMachineCost: number
    directLaborCost: number
    directSetUpCost: number
    inspectionCost: number
    yieldCost: number
    totalPowerCost: number
    directProcessCost: number

    // Cost summary percentages
    materialCostPercent: number
    manufacturingCostPercent: number
    overheadProfitPercent: number
}

// Example: Based on user's provided data
export const CostBreakdown_Example1: CostBreakdownData = {
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
}

// Calculate yield cost
const sum = CostBreakdown_Example1.directMachineCost +
    CostBreakdown_Example1.directSetUpCost +
    CostBreakdown_Example1.directLaborCost +
    CostBreakdown_Example1.inspectionCost

CostBreakdown_Example1.yieldCost = Number(
    ((1 - CostBreakdown_Example1.yieldPercentage / 100) *
        (CostBreakdown_Example1.netMaterialCost + sum)).toFixed(4)
)

CostBreakdown_Example1.directProcessCost = Number(
    (sum + CostBreakdown_Example1.yieldCost + CostBreakdown_Example1.totalPowerCost).toFixed(4)
)

// ==================== ESG CALCULATIONS ====================
export interface ESGData {
    // Material ESG
    materialCO2PerPart: number

    // Manufacturing ESG
    manufacturingCO2PerPart: number

    // Total ESG
    totalPartESG: number
    annualESG: number
    lifetimeESG: number

    // Input data
    annualVolume: number
    productLife: number
}

export const ESGData_Example1: ESGData = {
    // Input
    annualVolume: 170000,
    productLife: 2,

    // Calculated
    materialCO2PerPart: 0.3713,
    manufacturingCO2PerPart: 0.2137, // from calculateManufacturingCO2
    totalPartESG: 0.585, // materialCO2 + manufacturingCO2
    annualESG: 99445, // totalPartESG * annualVolume
    lifetimeESG: 198890 // annualESG * productLife
}

// ==================== COST SUMMARY ====================
export interface CostSummaryData {
    materialCost: { amount: number; percent: number }
    manufacturingCost: { amount: number; percent: number }
    toolingCost: { amount: number; percent: number }
    overheadProfit: { amount: number; percent: number }
    packingCost: { amount: number; percent: number }
    exwPartCost: { amount: number; percent: number }
    freightCost: { amount: number; percent: number }
    dutiesTariff: { amount: number; percent: number }
    partShouldCost: { amount: number; percent: number }
}

export const CostSummary_Example1: CostSummaryData = {
    materialCost: { amount: 0.007, percent: 3.88 },
    manufacturingCost: { amount: 0.1517, percent: 84.14 },
    toolingCost: { amount: 0, percent: 0 },
    overheadProfit: { amount: 0.0205, percent: 11.37 },
    packingCost: { amount: 0.0009, percent: 0.50 },
    exwPartCost: { amount: 0.1801, percent: 99.89 },
    freightCost: { amount: 0.0002, percent: 0.11 },
    dutiesTariff: { amount: 0, percent: 0 },
    partShouldCost: { amount: 0.1803, percent: 100.00 }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Calculate direct machine cost
 * Formula: (machineHourRate / 3600) * cycleTimeSeconds
 */
export function calculateDirectMachineCost(
    machineHourRate: number,
    cycleTimeSeconds: number
): number {
    return Number(((machineHourRate / 3600) * cycleTimeSeconds).toFixed(4))
}

/**
 * Calculate direct labor cost
 * Formula: (laborRate / 3600) * cycleTimeSeconds * noOfLabors
 */
export function calculateDirectLaborCost(
    laborRate: number,
    cycleTimeSeconds: number,
    noOfLabors: number
): number {
    return Number(((laborRate / 3600) * cycleTimeSeconds * noOfLabors).toFixed(4))
}

/**
 * Calculate direct setup cost
 * Formula: ((setupLaborRate + machineRate) * (setupTimeMinutes / 60)) / lotSize
 */
export function calculateDirectSetupCost(
    setupLaborRate: number,
    machineRate: number,
    setupTimeMinutes: number,
    lotSize: number
): number {
    return Number((((setupLaborRate + machineRate) * (setupTimeMinutes / 60)) / lotSize).toFixed(4))
}

/**
 * Calculate inspection cost
 * Formula: (samplingRate / 100) * ((inspectionTimeSeconds * qaRate) / 3600)
 */
export function calculateInspectionCost(
    samplingRate: number,
    inspectionTimeSeconds: number,
    qaRate: number
): number {
    return Number(((samplingRate / 100) * ((inspectionTimeSeconds * qaRate) / 3600)).toFixed(4))
}

/**
 * Calculate yield cost
 * Formula: (1 - yieldPercent / 100) * (materialCost + manufacturingSum)
 */
export function calculateYieldCost(
    yieldPercent: number,
    materialCost: number,
    manufacturingSum: number
): number {
    return Number(((1 - yieldPercent / 100) * (materialCost + manufacturingSum)).toFixed(4))
}

/**
 * Calculate net process cost (Manufacturing Cost)
 * Formula: machineC + laborCost + setupCost + inspectionCost + yieldCost + powerCost
 */
export function calculateNetProcessCost(costs: {
    machineCost: number
    laborCost: number
    setupCost: number
    inspectionCost: number
    yieldCost: number
    powerCost: number
}): number {
    const sum = costs.machineCost + costs.laborCost + costs.setupCost + costs.inspectionCost
    return Number((sum + costs.yieldCost + costs.powerCost).toFixed(4))
}
