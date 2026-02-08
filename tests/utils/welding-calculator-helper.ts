/**
 * Welding Calculator Helper Functions
 * Utility functions for welding calculations used in Playwright tests
 */

export interface WeldingCalculationInput {
    processTypeID: number
    partComplexity: number
    semiAutoOrAuto: number
    weldingPosition: number
    efficiency?: number
    lotSize: number
    setUpTime: number
    machineHourRate: number
    lowSkilledLaborRatePerHour: number
    noOfLowSkilledLabours: number
    skilledLaborRatePerHour: number
    noOfSkilledLabours: number
    inspectionTime?: number
    qaOfInspectorRate: number
    qaOfInspector: number
    samplingRate?: number
    yieldPer?: number
    requiredCurrent?: number
    requiredWeldingVoltage?: number
    electricityUnitCost?: number
    powerConsumption?: number
    netMaterialCost?: number
    netPartWeight?: number
    [key: string]: any
}

export interface WeldingCalculationResult {
    cycleTime: number
    efficiency: number
    directLaborCost: number
    directSetUpCost: number
    inspectionCost: number
    directMachineCost: number
    totalPowerCost: number
    yieldCost: number
    directProcessCost: number
    [key: string]: any
}

/**
 * Calculate MIG welding parameters
 */
export function calculateMigWelding(input: WeldingCalculationInput): WeldingCalculationResult {
    const efficiency = input.efficiency || 80
    const cycleTime = input.cycleTime || 0

    // Direct Machine Cost: (Machine Hour Rate / 3600) * Cycle Time
    const directMachineCost = (input.machineHourRate / 3600) * cycleTime

    // Direct Labor Cost: (Labor Rate / 3600) * Cycle Time * No of Labours
    const directLaborCost =
        (input.lowSkilledLaborRatePerHour / 3600) *
        cycleTime *
        input.noOfLowSkilledLabours

    // Direct Setup Cost: ((Labor Rate + Machine Rate) * Setup Time / 60) / Lot Size
    const directSetUpCost =
        ((input.skilledLaborRatePerHour + input.machineHourRate) *
            (input.setUpTime / 60)) /
        input.lotSize

    // Inspection Cost: (Sampling Rate / 100) * ((Inspection Time * QA Rate) / 3600)
    const inspectionTime = input.inspectionTime || 2
    const samplingRate = input.samplingRate || 5
    const inspectionCost =
        (samplingRate / 100) *
        ((inspectionTime * input.qaOfInspectorRate) / 3600)

    // Power Cost: (Cycle Time / 3600) * Power Consumption * Unit Cost
    const powerConsumption = input.powerConsumption ||
        ((input.requiredCurrent || 0) * (input.requiredWeldingVoltage || 0)) / 1000
    const totalPowerCost =
        (cycleTime / 3600) *
        powerConsumption *
        (input.electricityUnitCost || 0)

    // Sum of direct costs
    const sum = directMachineCost + directSetUpCost + directLaborCost + inspectionCost

    // Yield Cost: (1 - Yield% / 100) * (Material Cost + Sum)
    const yieldPer = input.yieldPer || 97
    const yieldCost =
        (1 - yieldPer / 100) *
        ((input.netMaterialCost || 0) + sum)

    // Direct Process Cost: Sum + Yield Cost + Power Cost
    const directProcessCost = sum + yieldCost + totalPowerCost

    return {
        cycleTime,
        efficiency,
        directLaborCost,
        directSetUpCost,
        inspectionCost,
        directMachineCost,
        totalPowerCost,
        yieldCost,
        directProcessCost,
        powerConsumption
    }
}

/**
 * Calculate welding efficiency based on position and machine type
 */
export function getWeldingEfficiency(
    weldingPosition: number,
    semiAutoOrAuto: number,
    processType: number
): number {
    const positions = [
        { id: 1, name: 'Flat', auto: 80, manual: 70, semiAuto: 80 },
        { id: 2, name: 'Horizontal', auto: 80, manual: 70, semiAuto: 80 },
        { id: 3, name: 'Vertical', auto: 75, manual: 65, semiAuto: 75 },
        { id: 4, name: 'OverHead', auto: 75, manual: 65, semiAuto: 75 }
    ]

    const position = positions.find(p => p.id === weldingPosition)
    if (!position) return 75

    if (semiAutoOrAuto === 1) return position.auto
    if (semiAutoOrAuto === 3) return position.manual
    return position.semiAuto
}

/**
 * Calculate default yield percentage based on process and complexity
 */
export function getDefaultYieldPercentage(
    processTypeID: number,
    partComplexity: number
): number {
    const defaults: Record<number, Record<number, number>> = {
        39: { 1: 97, 2: 95, 3: 93 }, // MIG Welding
        67: { 1: 98, 2: 96, 3: 94 }, // TIG Welding
        209: { 1: 97, 2: 95, 3: 93 }, // Stick Welding
        59: { 1: 97, 2: 95, 3: 93 }, // Spot Welding
        218: { 1: 97, 2: 95, 3: 93 }  // Seam Welding
    }

    return defaults[processTypeID]?.[partComplexity] || 95
}

/**
 * Calculate default sampling rate based on process and complexity
 */
export function getDefaultSamplingRate(
    processTypeID: number,
    partComplexity: number
): number {
    const defaults: Record<number, Record<number, number>> = {
        39: { 1: 5, 2: 8, 3: 10 }, // MIG Welding
        67: { 1: 4, 2: 6, 3: 8 }, // TIG Welding
        209: { 1: 5, 2: 8, 3: 10 }, // Stick Welding
        59: { 1: 4, 2: 6, 3: 8 }, // Spot Welding
        218: { 1: 4, 2: 6, 3: 8 }  // Seam Welding
    }

    return defaults[processTypeID]?.[partComplexity] || 5
}

/**
 * Calculate inspection time based on part complexity
 */
export function getDefaultInspectionTime(partComplexity: number): number {
    if (partComplexity === 1) return 2  // Low
    if (partComplexity === 2) return 5  // Medium
    if (partComplexity === 3) return 10 // High
    return 2
}

/**
 * Safe division utility
 */
export function safeDiv(numerator: number, denominator: number): number {
    if (!denominator || denominator === 0) return 0
    return numerator / denominator
}

/**
 * Validate and format number
 */
export function isValidNumber(n: any): number {
    if (n === null || n === undefined) return 0
    const num = Number(n)
    if (Number.isNaN(num) || !Number.isFinite(num) || num < 0) return 0
    return Number(num.toFixed(4))
}
