/**
 * Welding Calculator - Refactored for Playwright Testing
 *
 * Purpose: Provide streamlined, test-friendly welding cost and cycle time calculations
 * Structure: Organized by calculation domains with clear separation of concerns
 */

import Logger from '../lib/LoggerUtil'

const logger = Logger

// ============================================================================
// CONSTANTS & ENUMS
// ============================================================================

export enum PartComplexity {
	Low = 1,
	Medium = 2,
	High = 3
}

export enum ProcessType {
	WeldingPreparation = 36,
	MigWelding = 39,
	TigWelding = 40,
	StickWelding = 41,
	WeldingCleaning = 42,
	SpotWelding = 43,
	SeamWelding = 44
}

// ============================================================================
// INTERFACES & TYPES
// ============================================================================

/**
 * Manufacturing information gathered from UI
 */
export interface ManufacturingInfo {
	processTypeID: ProcessType
	cycleTime: number // seconds
	dryCycleTime: number // seconds
	machineHourRate: number // $/hr
	directLaborRate: number // $/hr
	lowSkilledLaborRatePerHour: number // $/hr
	skilledLaborRatePerHour: number // $/hr
	setUpTime: number // minutes
	powerConsumption: number // kW
	electricityUnitCost: number // $/kWh
	qaOfInspectorRate: number // $/hr
	inspectionTime: number // minutes
	samplingRate: number // %
	yieldPer: number // %
	partComplexity: PartComplexity
	density: number // g/cm³
	netWeight: number // kg
	noOfDirectLabors?: number
	noOfLowSkilledLabours?: number
}

/**
 * Weld input data
 */
export interface WeldInput {
	weldType: string
	weldSize: number
	weldLength: number
	weldPlaces: number
	weldSide: string
	noOfWeldPasses: number
	wireDia: number
	weldElementSize: number
}

/**
 * Cost breakdown result
 */
export interface CostBreakdown {
	directMachineCost: number
	directLaborCost: number
	directSetUpCost: number
	totalPowerCost: number
	inspectionCost: number
	yieldCost: number
	directProcessCost: number
}

/**
 * Cycle time breakdown result
 */
export interface CycleTimeBreakdown {
	arcOnTime: number
	arcOffTime: number
	cycleTime: number
	dryCycleTime: number
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Converts cycle time from tenths of seconds to seconds if needed
 */
export function normalizeCycleTime(cycleTime: number): number {
	if (cycleTime > 100) {
		return cycleTime / 10
	}
	return cycleTime
}

/**
 * Rounds a number to specified decimal places
 */
export function round(value: number, decimals: number = 2): number {
	const factor = Math.pow(10, decimals)
	return Math.round(value * factor) / factor
}

/**
 * Validates that a number is positive
 */
export function isValidNumber(value: any): boolean {
	return typeof value === 'number' && value > 0
}

// ============================================================================
// COST CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculates direct machine cost per part
 * Formula: (Machine Hour Rate / 3600) * Cycle Time
 */
export function calculateMachineCost(
	machineHourRate: number,
	cycleTime: number
): number {
	const normalizedCycleTime = normalizeCycleTime(cycleTime)
	return round((machineHourRate / 3600) * normalizedCycleTime, 4)
}

/**
 * Calculates direct labor cost per part
 * Formula: (Labor Rate / 3600) * Cycle Time * Number of Labors
 */
export function calculateLaborCost(
	laborRate: number,
	cycleTime: number,
	noOfLabors: number = 1
): number {
	const normalizedCycleTime = normalizeCycleTime(cycleTime)
	return round((laborRate / 3600) * (normalizedCycleTime * noOfLabors), 4)
}

/**
 * Calculates setup cost per part
 * Formula: ((Setup Labor Rate + Machine Hour Rate) * Setup Time) / Lot Size
 */
export function calculateSetupCost(
	setupLaborRate: number,
	machineHourRate: number,
	setupTimeMinutes: number,
	lotSize: number
): number {
	if (lotSize <= 0) return 0
	const totalSetupRate = setupLaborRate + machineHourRate
	return round((totalSetupRate * (setupTimeMinutes / 60)) / lotSize, 4)
}

/**
 * Calculates total power cost per part
 * Formula: (Cycle Time / 3600) * Power Consumption * Electricity Cost
 */
export function calculatePowerCost(
	cycleTime: number,
	powerConsumptionKW: number,
	electricityUnitCost: number
): number {
	const normalizedCycleTime = normalizeCycleTime(cycleTime)
	return round(
		(normalizedCycleTime / 3600) * powerConsumptionKW * electricityUnitCost,
		4
	)
}

/**
 * Calculates QA inspection cost per part
 * Formula: (Sampling % / 100) * (Inspection Time / 60 minutes) * Inspector Rate
 */
export function calculateInspectionCost(
	inspectionTimeMinutes: number,
	inspectorRate: number,
	samplingPercentage: number = 100
): number {
	return round(
		(samplingPercentage / 100) * (inspectionTimeMinutes / 60) * inspectorRate,
		4
	)
}

/**
 * Calculates yield cost per part
 * Formula: (1 - Yield % / 100) * Total Direct Cost
 */
export function calculateYieldCost(
	yieldPercentage: number,
	totalDirectCost: number
): number {
	const yieldLoss = 1 - yieldPercentage / 100
	return round(yieldLoss * totalDirectCost, 4)
}

/**
 * Calculates total manufacturing cost (all cost components)
 */
export function calculateTotalManufacturingCost(
	machineHourRate: number,
	laborRate: number,
	setupLaborRate: number,
	setupTimeMinutes: number,
	cycleTime: number,
	powerConsumption: number,
	electricityUnitCost: number,
	inspectionTimeMinutes: number,
	inspectorRate: number,
	samplingPercentage: number,
	yieldPercentage: number,
	lotSize: number,
	noOfLabors: number = 1
): CostBreakdown {
	const machineCost = calculateMachineCost(machineHourRate, cycleTime)
	const laborCost = calculateLaborCost(laborRate, cycleTime, noOfLabors)
	const setupCost = calculateSetupCost(
		setupLaborRate,
		machineHourRate,
		setupTimeMinutes,
		lotSize
	)
	const powerCost = calculatePowerCost(
		cycleTime,
		powerConsumption,
		electricityUnitCost
	)
	const inspectionCost = calculateInspectionCost(
		inspectionTimeMinutes,
		inspectorRate,
		samplingPercentage
	)

	const directCosts =
		machineCost + laborCost + setupCost + powerCost + inspectionCost
	const yieldCost = calculateYieldCost(yieldPercentage, directCosts)

	return {
		directMachineCost: machineCost,
		directLaborCost: laborCost,
		directSetUpCost: setupCost,
		totalPowerCost: powerCost,
		inspectionCost: inspectionCost,
		yieldCost: yieldCost,
		directProcessCost: directCosts + yieldCost
	}
}

// ============================================================================
// CYCLE TIME CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculates arc-on time (actual welding time)
 * Based on weld length and travel speed
 */
export function calculateArcOnTime(
	totalWeldLength: number,
	travelSpeed: number = 5 // mm/sec
): number {
	if (travelSpeed <= 0) return 0
	return round(totalWeldLength / travelSpeed, 2)
}

/**
 * Calculates arc-off time (setup and cleanup between welds)
 */
export function calculateArcOffTime(
	tackWelds: number = 0,
	intermediateStops: number = 0
): number {
	const tackWeldTime = tackWelds * 3 // 3 sec per tack weld
	const intermediateTime = intermediateStops * 2 // 2 sec per intermediate stop
	return round(tackWeldTime + intermediateTime, 2)
}

/**
 * Calculates single weld cycle time
 */
export function calculateSingleWeldCycleTime(input: {
	totalWeldLength: number
	travelSpeed?: number
	tackWelds?: number
	intermediateStops?: number
}): number {
	const arcOnTime = calculateArcOnTime(
		input.totalWeldLength,
		input.travelSpeed || 5
	)
	const arcOffTime = calculateArcOffTime(
		input.tackWelds || 0,
		input.intermediateStops || 0
	)
	return round(arcOnTime + arcOffTime, 2)
}

/**
 * Calculates weld cycle time breakdown
 */
export function calculateWeldCycleTimeBreakdown(input: {
	subProcessCycleTimes: number[]
	loadingUnloadingTime: number
	partReorientation: number
	efficiency: number
}): CycleTimeBreakdown {
	const totalSubProcessTime = input.subProcessCycleTimes.reduce(
		(sum, t) => sum + t,
		0
	)

	// Calculate total cycle time with efficiency factor
	const efficiencyFactor = 1 / (input.efficiency / 100)
	const cycleTime = round(
		(totalSubProcessTime +
			input.loadingUnloadingTime +
			input.partReorientation) *
			efficiencyFactor,
		2
	)

	return {
		arcOnTime: round(totalSubProcessTime * 0.8, 2), // Approximate arc-on portion
		arcOffTime: round(input.loadingUnloadingTime + input.partReorientation, 2),
		dryCycleTime: round(
			totalSubProcessTime +
				input.loadingUnloadingTime +
				input.partReorientation,
			2
		),
		cycleTime: cycleTime
	}
}

/**
 * Calculates total weld cycle time from sub-processes
 */
export function calculateTotalWeldCycleTime(
	subProcessCycleTimes: number[],
	loadingUnloadingTime: number,
	partReorientation: number,
	efficiency: number
): number {
	const breakdown = calculateWeldCycleTimeBreakdown({
		subProcessCycleTimes,
		loadingUnloadingTime,
		partReorientation,
		efficiency
	})
	return breakdown.cycleTime
}

// ============================================================================
// MANUFACTURING CO2 CALCULATION
// ============================================================================

/**
 * Calculates manufacturing CO2 emissions per part
 * Formula: (Cycle Time / 3600) * Power Consumption * CO2 per kWhr
 */
export function calculateManufacturingCO2(
	cycleTimeSec: number,
	powerConsumptionKW: number,
	co2PerKwHr: number
): number {
	const normalizedCycleTime = normalizeCycleTime(cycleTimeSec)
	return round(
		(normalizedCycleTime / 3600) * powerConsumptionKW * co2PerKwHr,
		4
	)
}

// ============================================================================
// WELD CALCULATION FUNCTIONS
// ============================================================================

/**
 * Gets wire diameter based on material type and weld size
 */
export function getWireDiameter(
	materialType: string,
	weldSize: number
): number {
	const wireDiameterMap: Record<string, Record<number, number>> = {
		'Carbon Steel': {
			1: 0.8,
			1.6: 0.8,
			3: 0.8,
			4: 1.2,
			5: 1.2,
			6: 1.2,
			8: 1.2
		},
		'Stainless Steel': {
			1: 0.8,
			1.6: 0.8,
			3: 1.0,
			4: 1.2,
			5: 1.2,
			6: 1.2,
			8: 1.2
		},
		Aluminum: {
			1: 1.2,
			1.6: 1.2,
			3: 1.2,
			4: 1.6,
			5: 1.6,
			6: 1.6,
			8: 2.0
		}
	}

	const materialKey = materialType || 'Carbon Steel'
	const sizeMap =
		wireDiameterMap[materialKey] || wireDiameterMap['Carbon Steel']
	return sizeMap[weldSize] || 0.8
}

/**
 * Calculates total weld length with multiplier for weld sides
 */
export function calculateTotalWeldLength(
	weldLength: number,
	weldPlaces: number,
	weldSide: string
): number {
	const sideMultiplier =
		weldSide && weldSide.toLowerCase() === 'both sides' ? 2 : 1
	return round(weldLength * weldPlaces * sideMultiplier, 2)
}

/**
 * Calculates weld volume for material weight estimation
 */
export function calculateWeldVolume(
	weldType: string,
	weldSize: number,
	weldElementSize: number,
	weldLength: number,
	weldPlaces: number,
	noOfPasses: number,
	weldSide: string
): number {
	const totalLength = calculateTotalWeldLength(weldLength, weldPlaces, weldSide)

	// Volume = Cross-sectional area * Total length * Number of passes
	const crossSectionalArea = (weldElementSize * weldElementSize) / 2 // Approximate triangular area
	const volume = crossSectionalArea * totalLength * noOfPasses

	return round(volume, 2)
}

// ============================================================================
// LOT SIZE & QUANTITY CALCULATIONS
// ============================================================================

/**
 * Calculates lot size based on annual volume
 */
export function calculateLotSize(annualVolumeQty: number): number {
	if (annualVolumeQty <= 0) return 1
	if (annualVolumeQty <= 100) return 50
	if (annualVolumeQty <= 500) return 100
	if (annualVolumeQty <= 1000) return 250
	if (annualVolumeQty <= 5000) return 500
	return Math.min(Math.ceil(annualVolumeQty / 10), 5000)
}

/**
 * Calculates lifetime quantity remaining
 */
export function calculateLifeTimeQtyRemaining(
	annualVolumeQty: number,
	productLifeYears: number
): number {
	const lifetimeQty = annualVolumeQty * productLifeYears
	return Math.min(lifetimeQty, 100000000)
}

/**
 * Calculates net weight
 */
export function calculateNetWeight(volumeMm3: number, density: number): number {
	// Convert mm³ to cm³ and then to kg
	const volumeCm3 = volumeMm3 / 1000
	const weightKg = (volumeCm3 * density) / 1000
	return round(weightKg, 2)
}

// ============================================================================
// WELD TYPE & PROCESS HELPERS
// ============================================================================

/**
 * Gets weld type ID from string
 */
export function getWeldTypeId(weldType: string | number): number {
	if (typeof weldType === 'number') return weldType

	const weldTypeMap: Record<string, number> = {
		Fillet: 1,
		Butt: 2,
		Slot: 3,
		Plug: 4,
		Spot: 5,
		Seam: 6,
		Back: 7,
		Surfacing: 8
	}

	return weldTypeMap[weldType] || 1 // Default to Fillet
}

/**
 * Gets process type from string
 */
export function getProcessType(processTypeText: string): ProcessType {
	const processTypeMap: Record<string, ProcessType> = {
		'Welding MIG': ProcessType.MigWelding,
		Welding: ProcessType.MigWelding,
		MIG: ProcessType.MigWelding,
		'MIG Welding': ProcessType.MigWelding,
		'Welding Cleaning': ProcessType.WeldingCleaning,
		Cleaning: ProcessType.WeldingCleaning,
		TIG: ProcessType.TigWelding,
		'TIG Welding': ProcessType.TigWelding,
		'Welding TIG': ProcessType.TigWelding,
		Stick: ProcessType.StickWelding,
		'Stick Welding': ProcessType.StickWelding
	}

	return processTypeMap[processTypeText] || ProcessType.MigWelding
}

// ============================================================================
// LOGGING HELPERS (Test-friendly)
// ============================================================================

/**
 * Logs cost breakdown in a structured format
 */
export function logCostBreakdown(
	costs: CostBreakdown,
	title: string = 'Cost Breakdown'
): void {
	logger.info(`\n💰 ===== ${title} =====`)
	logger.info(`   Machine Cost:     $${costs.directMachineCost.toFixed(4)}`)
	logger.info(`   Labor Cost:       $${costs.directLaborCost.toFixed(4)}`)
	logger.info(`   Setup Cost:       $${costs.directSetUpCost.toFixed(4)}`)
	logger.info(`   Power Cost:       $${costs.totalPowerCost.toFixed(4)}`)
	logger.info(`   Inspection Cost:  $${costs.inspectionCost.toFixed(4)}`)
	logger.info(`   Yield Cost:       $${costs.yieldCost.toFixed(4)}`)
	logger.info(`   ─────────────────────────────`)
	logger.info(`   Total Cost:       $${costs.directProcessCost.toFixed(4)}`)
}

/**
 * Logs cycle time breakdown in a structured format
 */
export function logCycleTimeBreakdown(
	breakdown: CycleTimeBreakdown,
	title: string = 'Cycle Time'
): void {
	logger.info(`\n⏱️  ===== ${title} =====`)
	logger.info(`   Arc On Time:      ${breakdown.arcOnTime.toFixed(2)} sec`)
	logger.info(`   Arc Off Time:     ${breakdown.arcOffTime.toFixed(2)} sec`)
	logger.info(`   Dry Cycle Time:   ${breakdown.dryCycleTime.toFixed(2)} sec`)
	logger.info(`   Total Cycle Time: ${breakdown.cycleTime.toFixed(2)} sec`)
}

// ============================================================================
// BATCH CALCULATION CLASS (For complex scenarios)
// ============================================================================

/**
 * Advanced calculator for batch operations
 */
export class ManufacturingCalculator {
	private info: ManufacturingInfo

	constructor(manufacturingInfo: ManufacturingInfo) {
		this.info = manufacturingInfo
	}

	/**
	 * Calculates all costs at once
	 */
	calculateAllCosts(): CostBreakdown {
		return calculateTotalManufacturingCost(
			this.info.machineHourRate,
			this.info.directLaborRate,
			this.info.skilledLaborRatePerHour,
			this.info.setUpTime,
			this.info.cycleTime,
			this.info.powerConsumption,
			this.info.electricityUnitCost,
			this.info.inspectionTime,
			this.info.qaOfInspectorRate,
			this.info.samplingRate,
			this.info.yieldPer,
			1, // Default lot size
			this.info.noOfDirectLabors || 1
		)
	}

	/**
	 * Calculates manufacturing CO2
	 */
	calculateCO2(co2PerKwHr: number): number {
		return calculateManufacturingCO2(
			this.info.cycleTime,
			this.info.powerConsumption,
			co2PerKwHr
		)
	}

	/**
	 * Logs all calculations
	 */
	logAllCalculations(): void {
		const costs = this.calculateAllCosts()
		logCostBreakdown(costs, 'Manufacturing Costs')
	}
}

// ============================================================================
// EXPORT SUMMARY
// ============================================================================

export default {
	// Enums
	PartComplexity,
	ProcessType,

	// Cost calculations
	calculateMachineCost,
	calculateLaborCost,
	calculateSetupCost,
	calculatePowerCost,
	calculateInspectionCost,
	calculateYieldCost,
	calculateTotalManufacturingCost,

	// Cycle time calculations
	calculateArcOnTime,
	calculateArcOffTime,
	calculateSingleWeldCycleTime,
	calculateWeldCycleTimeBreakdown,
	calculateTotalWeldCycleTime,

	// Manufacturing CO2
	calculateManufacturingCO2,

	// Weld calculations
	getWireDiameter,
	calculateTotalWeldLength,
	calculateWeldVolume,

	// Quantity calculations
	calculateLotSize,
	calculateLifeTimeQtyRemaining,
	calculateNetWeight,

	// Helpers
	getWeldTypeId,
	getProcessType,
	normalizeCycleTime,
	round,

	// Logging
	logCostBreakdown,
	logCycleTimeBreakdown,

	// Advanced
	ManufacturingCalculator
}
