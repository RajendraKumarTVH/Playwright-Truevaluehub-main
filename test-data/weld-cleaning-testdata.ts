/**
 * Weld Cleaning Test Data
 * Based on manufacturing-welding-calculator.service.ts calculationsForWeldingPreparation
 */

import {
    calculatePowerCost,
    calculateManufacturingCO2
} from '../tests/utils/welding-calculator'

// ==================== WELD CLEANING TEST DATA ====================

export interface WeldCleaningData {
    // Project & Part Info
    projectId: string
    internalPartNumber: string
    annualVolumeQty: number
    lotSize: number

    // Material Info
    materialType: string
    netWeight: number // grams
    weldingLength: number // mm
    weldingWidth: number // mm
    weldingHeight: number // mm

    // Process Details
    processGroup: string
    finishType: string
    machineName: string
    machineDescription: string
    machineAutomation: string
    criticalityLevel: string
    efficiency: number // percentage

    // Weld Details
    totalWeldLength: number // mm
    intermediateStops: number

    // Manufacturing Details
    samplingRate: number // percentage
    yieldPercentage: number // percentage
    yieldCostPerPart: number
    directLaborRate: number // $/hr
    noOfDirectLabors: number
    laborCostPerPart: number
    skilledLaborRate: number // $/hr
    machineSetupTime: number // minutes
    setupCostPerPart: number
    qaInspectorRate: number // $/hr
    qaInspectionTime: number // minutes
    qaInspectionCostPerPart: number
    machineHourRate: number // $/hr
    cycleTimePerPart: number // seconds
    machineCostPerPart: number

    // Sustainability
    co2PerKwHr: number
    co2PerPart: number

    // Cost Summary
    netProcessCost: number
}

/**
 * Weld Cleaning Scenario 1: Standard Cleaning
 * Based on user's provided data
 */
export const WeldCleaningScenario1: WeldCleaningData = {
    // Project & Part Info
    projectId: '14783',
    internalPartNumber: '1023729-C-1023729-C-3',
    annualVolumeQty: 170000,
    lotSize: 14167,

    // Material Info
    materialType: 'Carbon Steel',
    netWeight: 26.9154, // grams
    weldingLength: 60, // mm
    weldingWidth: 10, // mm (estimated)
    weldingHeight: 5, // mm (estimated)

    // Process Details
    processGroup: 'Weld Cleaning',
    finishType: 'Weld Cleaning',
    machineName: 'Welding Cleanup',
    machineDescription: 'Default',
    machineAutomation: 'Manual',
    criticalityLevel: 'Level1',
    efficiency: 70, // percentage

    // Weld Details
    totalWeldLength: 60, // mm
    intermediateStops: 2,

    // Manufacturing Details (from user's data)
    samplingRate: 0.8823, // percentage
    yieldPercentage: 98.5, // percentage
    yieldCostPerPart: 0.0005,
    directLaborRate: 1.1051, // $/hr
    noOfDirectLabors: 1,
    laborCostPerPart: 0.0092,
    skilledLaborRate: 1.8627, // $/hr
    machineSetupTime: 30, // minutes
    setupCostPerPart: 0.0001,
    qaInspectorRate: 1.5845, // $/hr
    qaInspectionTime: 0.25, // minutes
    qaInspectionCostPerPart: 0.0001,
    machineHourRate: 2.3247, // $/hr
    cycleTimePerPart: 29.9643, // seconds
    machineCostPerPart: 0.0193,

    // Sustainability
    co2PerKwHr: 28.5734,
    co2PerPart: 0.0044,

    // Cost Summary
    netProcessCost: 0.0292
}

// ==================== CALCULATION FORMULAS FOR WELD CLEANING ====================

/**
 * Weld Cleaning Cycle Time Calculation
 * Based on manufacturing-welding-calculator.service.ts lines 734-745
 * 
 * Formula:
 * cycleTime = handlingTime + roughTimeComponent + finalTimeComponent
 * 
 * where:
 * handlingTime = based on netWeight (10s <5kg, 16s <10kg, 24s <20kg, 32s >20kg)
 * roughTimeComponent = (2 * (weldLength + 5) * noOfPasses * 60) / feedPerRevRough / deburringRPM
 * finalTimeComponent = (2 * (weldLength + 5) * noOfPasses * 60) / feedPerRevFinal / deburringRPM (Cleaning only)
 * feedPerRevRough = discBrushDia / 2
 * feedPerRevFinal = discBrushDia / 4
 * noOfPasses = ceil(weldWidth / discBrushDia)
 */
export interface WeldCleaningCycleTimeCalc {
    handlingTime: number
    discBrushDia: number
    deburringRPM: number
    feedPerRevRough: number
    feedPerRevFinal: number
    noOfPasses: number
    roughTimeComponent: number
    finalTimeComponent: number
    totalCycleTime: number
}

/**
 * Machine Cost Calculation
 * Formula: (machineHourRate * cycleTime) / 3600 / efficiency
 */
export function calculateWeldCleaningMachineCost(
    machineHourRate: number,
    cycleTimeSeconds: number,
    efficiencyPercent: number
): number {
    return Number((
        (machineHourRate * cycleTimeSeconds) / 3600 / (efficiencyPercent / 100)
    ).toFixed(4))
}

/**
 * Labor Cost Calculation  
 * Formula: (noOfLabors * laborRate * cycleTime) / 3600 / efficiency
 */
export function calculateWeldCleaningLaborCost(
    noOfLabors: number,
    laborRate: number,
    cycleTimeSeconds: number,
    efficiencyPercent: number
): number {
    return Number((
        (noOfLabors * laborRate * cycleTimeSeconds) / 3600 / (efficiencyPercent / 100)
    ).toFixed(4))
}

/**
 * Setup Cost Calculation
 * Formula: ((noOfLabors * setupTime / 60) * laborRate + (noOfSkilledLabors * setupTime / 60) * skilledRate) / efficiency / lotSize
 */
export function calculateWeldCleaningSetupCost(
    noOfLabors: number,
    laborRate: number,
    noOfSkilledLabors: number,
    skilledRate: number,
    setupTimeMinutes: number,
    efficiencyPercent: number,
    lotSize: number
): number {
    const unskilledComponent = ((noOfLabors * setupTimeMinutes) / 60) * laborRate / (efficiencyPercent / 100) / lotSize
    const skilledComponent = ((noOfSkilledLabors * skilledRate) / 60) * setupTimeMinutes / (efficiencyPercent / 100) / lotSize
    return Number((unskilledComponent + skilledComponent).toFixed(4))
}

/**
 * Inspection Cost Calculation
 * Formula: ((inspectionTime / 60) * qaOfInspector * qaRate) / efficiency / lotSize
 */
export function calculateWeldCleaningInspectionCost(
    inspectionTimeMinutes: number,
    qaOfInspector: number,
    qaRate: number,
    efficiencyPercent: number,
    lotSize: number
): number {
    return Number((
        ((inspectionTimeMinutes / 60) * qaOfInspector * qaRate) / (efficiencyPercent / 100) / lotSize
    ).toFixed(4))
}

/**
 * Net Process Cost Calculation
 * Formula: machineCost + laborCost + setupCost + inspectionCost + yieldCost
 */
export function calculateWeldCleaningNetProcessCost(costs: {
    machineCost: number
    laborCost: number
    setupCost: number
    inspectionCost: number
    yieldCost: number
}): number {
    return Number((
        costs.machineCost +
        costs.laborCost +
        costs.setupCost +
        costs.inspectionCost +
        costs.yieldCost
    ).toFixed(4))
}

// ==================== VALIDATION HELPERS ====================

/**
 * Validate all calculated values for Weld Cleaning
 */
export function validateWeldCleaningCalculations(
    actual: WeldCleaningData,
    expected: WeldCleaningData,
    tolerance: number = 0.0001
): {
    valid: boolean
    errors: string[]
} {
    const errors: string[] = []

    // Validate machine cost
    if (Math.abs(actual.machineCostPerPart - expected.machineCostPerPart) > tolerance) {
        errors.push(`Machine Cost mismatch: ${actual.machineCostPerPart} vs ${expected.machineCostPerPart}`)
    }

    // Validate labor cost
    if (Math.abs(actual.laborCostPerPart - expected.laborCostPerPart) > tolerance) {
        errors.push(`Labor Cost mismatch: ${actual.laborCostPerPart} vs ${expected.laborCostPerPart}`)
    }

    // Validate setup cost
    if (Math.abs(actual.setupCostPerPart - expected.setupCostPerPart) > tolerance) {
        errors.push(`Setup Cost mismatch: ${actual.setupCostPerPart} vs ${expected.setupCostPerPart}`)
    }

    // Validate inspection cost
    if (Math.abs(actual.qaInspectionCostPerPart - expected.qaInspectionCostPerPart) > tolerance) {
        errors.push(`Inspection Cost mismatch: ${actual.qaInspectionCostPerPart} vs ${expected.qaInspectionCostPerPart}`)
    }

    // Validate yield cost
    if (Math.abs(actual.yieldCostPerPart - expected.yieldCostPerPart) > tolerance) {
        errors.push(`Yield Cost mismatch: ${actual.yieldCostPerPart} vs ${expected.yieldCostPerPart}`)
    }

    // Validate net process cost
    if (Math.abs(actual.netProcessCost - expected.netProcessCost) > tolerance) {
        errors.push(`Net Process Cost mismatch: ${actual.netProcessCost} vs ${expected.netProcessCost}`)
    }

    // Validate CO2 per part
    if (Math.abs(actual.co2PerPart - expected.co2PerPart) > tolerance) {
        errors.push(`CO2 per part mismatch: ${actual.co2PerPart} vs ${expected.co2PerPart}`)
    }

    return {
        valid: errors.length === 0,
        errors
    }
}

// Export default for easy import
export default {
    WeldCleaningScenario1,
    calculateWeldCleaningMachineCost,
    calculateWeldCleaningLaborCost,
    calculateWeldCleaningSetupCost,
    calculateWeldCleaningInspectionCost,
    calculateWeldCleaningNetProcessCost,
    validateWeldCleaningCalculations
}
