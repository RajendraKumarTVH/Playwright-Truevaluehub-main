
// ==================== ADDITIONAL SCENARIOS ====================

import { calculatePowerCost } from "tests/utils/welding-calculator"

/**
 * Specific Manufacturing Scenario for detailed testing
 * Uses calculated power cost and CO2 values
 */
export const SpecificManufacturingScenario = {
    samplingRate: 5,
    yieldPercentage: 97,
    yieldCostPerPart: 0.0028,
    directLaborRate: 2.5582,
    noOfDirectLabors: 1,
    laborCostPerPart: 0.0551,
    setupLaborRate: 1.8627,
    machineSetupTime: 30,
    setupCostPerPart: 0.0001,
    qaInspectorRate: 1.5845,
    qaInspectionTime: 2,
    qaInspectionCostPerPart: 0,
    machineHourRate: 1.5226,
    cycleTimePerPart: 77.5295,
    machineCostPerPart: 0.0328,
    powerUnitCost: 0.132,
    powerConsumption: 14,
    totalPowerCost: Number(calculatePowerCost(77.5295, 14, 0.132).toFixed(4)),
    co2PerKwHr: 14.9461,
    // co2PerPart: Number(calculateManufacturingCO2(77.5295, 14, 14.9461).toFixed(4))
} as const

// ==================== COST BREAKDOWN ====================

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

export const CostBreakdown_Example1: CostBreakdownData = {
    netMaterialCost: 0.007,
    cycleTime: 95.2069,
    machineHourRate: 3.8548,
    laborRatePerHour: 42.7557,
    noOfLabors: 1,
    setupLaborRate: 34.1925,
    setupTime: 30,
    lotSize: 14167,
    qaInspectorRate: 29.9182,
    qaInspectionTime: 2,
    samplingRate: 5,
    yieldPercentage: 97,
    powerConsumption: 14,
    electricityUnitCost: 0.132,

    directMachineCost: Number(((3.8548 / 3600) * 95.2069).toFixed(4)),
    directLaborCost: Number(((42.7557 / 3600) * 95.2069 * 1).toFixed(4)),
    directSetUpCost: Number((((34.1925 + 3.8548) * (30 / 60)) / 14167).toFixed(4)),
    inspectionCost: Number(((5 / 100) * ((2 * 29.9182) / 3600)).toFixed(4)),
    yieldCost: 0,
    totalPowerCost: Number(((95.2069 / 3600) * 14 * 0.132).toFixed(4)),
    directProcessCost: 0,

    materialCostPercent: 3.88,
    manufacturingCostPercent: 84.14,
    overheadProfitPercent: 11.37
}

// Calculate dependent values
const sum1 = CostBreakdown_Example1.directMachineCost +
    CostBreakdown_Example1.directSetUpCost +
    CostBreakdown_Example1.directLaborCost +
    CostBreakdown_Example1.inspectionCost

CostBreakdown_Example1.yieldCost = Number(
    ((1 - CostBreakdown_Example1.yieldPercentage / 100) *
        (CostBreakdown_Example1.netMaterialCost + sum1)).toFixed(4)
)

CostBreakdown_Example1.directProcessCost = Number(
    (sum1 + CostBreakdown_Example1.yieldCost + CostBreakdown_Example1.totalPowerCost).toFixed(4)
)

// ==================== ESG DATA ====================

export interface ESGData {
    materialCO2PerPart: number
    manufacturingCO2PerPart: number
    totalPartESG: number
    annualESG: number
    lifetimeESG: number
    annualVolume: number
    productLife: number
}

export const ESGData_Example1: ESGData = {
    annualVolume: 170000,
    productLife: 2,
    materialCO2PerPart: 0.3713,
    manufacturingCO2PerPart: 0.2137,
    totalPartESG: 0.585,
    annualESG: 99445,
    lifetimeESG: 198890
}

// ==================== COST BREAKDOWN HELPER FUNCTIONS ====================

export function calculateDirectMachineCost(machineHourRate: number, cycleTimeSeconds: number): number {
    return Number(((machineHourRate / 3600) * cycleTimeSeconds).toFixed(4))
}

export function calculateDirectLaborCost(laborRate: number, cycleTimeSeconds: number, noOfLabors: number): number {
    return Number(((laborRate / 3600) * cycleTimeSeconds * noOfLabors).toFixed(4))
}

export function calculateDirectSetupCost(setupLaborRate: number, machineRate: number, setupTimeMinutes: number, lotSize: number): number {
    return Number((((setupLaborRate + machineRate) * (setupTimeMinutes / 60)) / lotSize).toFixed(4))
}

export function calculateInspectionCost(samplingRate: number, inspectionTimeSeconds: number, qaRate: number): number {
    return Number(((samplingRate / 100) * ((inspectionTimeSeconds * qaRate) / 3600)).toFixed(4))
}

export function calculateYieldCost(yieldPercent: number, materialCost: number, manufacturingSum: number): number {
    return Number(((1 - yieldPercent / 100) * (materialCost + manufacturingSum)).toFixed(4))
}

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

// ==================== SUSTAINABILITY HELPER FUNCTIONS ====================

/**
 * Helper function to calculate material sustainability dynamically
 */
export function calculateMaterialSustainabilityHelper(weights: {
    grossWeight: number
    scrapWeight: number
    netWeight: number
    eav: number
}) {
    const MATERIAL_CO2_PER_KG = 13.7958
    const SCRAP_CO2_PER_KG = 13.7958

    // return SustainabilityCalculator.calculateMaterialSustainability({
    //     esgImpactCO2Kg: MATERIAL_CO2_PER_KG,
    //     esgImpactCO2KgScrap: SCRAP_CO2_PER_KG,
    //     ...weights
    // })
}

/**
 * Helper function to calculate manufacturing sustainability dynamically
 */
export function calculateManufacturingSustainabilityHelper(manufacturing: {
    totalPowerKW: number
    powerUtilization: number
    cycleTime: number
    efficiency: number
    setUpTime: number
    lotSize: number
    eav: number
}) {
    const ELECTRICITY_CO2_PER_KWH = 1.7317

    // return SustainabilityCalculator.calculateManufacturingSustainability({
    //     ...manufacturing,
    //     powerESG: ELECTRICITY_CO2_PER_KWH
    // })
}
