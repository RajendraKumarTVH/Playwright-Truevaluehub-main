import Logger from '../lib/LoggerUtil'
import { TotalCycleTimeInput } from './interfaces'

// Logger instantiation removed

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export enum PartComplexity {
	Low = 1,
	Medium = 2,
	High = 3
}

export enum ProcessType {
	WeldingPreparation = 176,
	MigWelding = 39,
	TigWelding = 67, // Updated from 40 to match constants.ts (67 usually? constants says 67)
	StickWelding = 209, // Updated from 41 to 209
	WeldingCleaning = 177,
	SpotWelding = 59, // Updated from 43 to 59
	SeamWelding = 88 // Updated from 44 to 88
}

export const DEFAULT_INSPECTION_TIME_BY_COMPLEXITY: Record<number, number> = {
	[PartComplexity.Low]: 2,
	[PartComplexity.Medium]: 5,
	[PartComplexity.High]: 10
}

// ============================================================================
// CYCLE TIME UTILITIES
// ============================================================================

export function isValidCycleTime(cycleTime: number): boolean {
	return cycleTime > 0 && cycleTime < 10000
}

/**
 * Converts cycle time from tenths of seconds to seconds if needed
 */
export function normalizeCycleTime(cycleTime: number): number {
	// If the value is very large, it might be in tenths of seconds (common in some UI/backend outputs)
	if (cycleTime > 1000) {
		return cycleTime / 10
	}
	return cycleTime
}


export function calculateMachineCost(
	machineHourRate: number,
	cycleTime: number
): number {
	const safeTime = safeCycleTime(cycleTime)
	const cost = (machineHourRate / 3600) * safeTime

	Logger.debug(
		`[calculateMachineCost] Rate: $${machineHourRate}/hr, CycleTime: ${safeTime}s = $${cost.toFixed(4)}`
	)

	return cost
}

export function calculateLaborCost(
	laborRate: number,
	cycleTime: number,
	noOfLabors: number = 1
): number {
	const safeTime = safeCycleTime(cycleTime)
	const cost = (laborRate / 3600) * (safeTime * noOfLabors)

	Logger.debug(
		`[calculateLaborCost] Rate: $${laborRate}/hr, CycleTime: ${safeTime}s, Workers: ${noOfLabors} = $${cost.toFixed(4)}`
	)
	return cost
}

export function calculateSetupCost(
	setupLaborRate: number,
	machineHourRate: number,
	setupTimeMinutes: number,
	lotSize: number
): number {
	if (lotSize <= 0) {
		Logger.warn(
			`[calculateSetupCost] Invalid lot size: ${lotSize}, returning 0`
		)
		return 0
	}

	const totalRate = setupLaborRate + machineHourRate
	const setupCostTotal = totalRate * (setupTimeMinutes / 60)
	const costPerPart = setupCostTotal / lotSize

	Logger.debug(
		`[calculateSetupCost] Setup Rate: $${totalRate}/hr, Time: ${setupTimeMinutes}min, Lot: ${lotSize} = $${costPerPart.toFixed(
			4
		)}`
	)
	return costPerPart
}

export function calculatePowerCost(
	cycleTime: number,
	powerConsumptionKW: number,
	electricityUnitCost: number
): number {
	const safeTime = safeCycleTime(cycleTime)
	const cost = (safeTime / 3600) * powerConsumptionKW * electricityUnitCost
	Logger.debug(
		`[calculatePowerCost] CycleTime: ${safeTime}s, Power: ${powerConsumptionKW}kW, Rate: $${electricityUnitCost}/kWh = $${cost.toFixed(
			4
		)}`
	)
	return cost
}
export function calculateInspectionCost(params: {
	inspectionTimeMinutes: number
	numberOfInspectors: number
	inspectorRate: number            // per hour
	efficiency: number              // e.g. 70 (NOT 0.7)
	lotSize: number
	samplingPercentage?: number      // optional (for logging / future use)
}): number {
	const safeTimeMin = Math.max(0, Number(params.inspectionTimeMinutes) || 0)
	const safeInspectors = Math.max(0, Number(params.numberOfInspectors) || 0)
	const safeRate = Math.max(0, Number(params.inspectorRate) || 0)
	const safeEfficiency = Math.max(1, Number(params.efficiency) || 100) // avoid divide by 0
	const safeLotSize = Math.max(1, Number(params.lotSize) || 1)

	const hours = safeTimeMin / 60

	const cost =
		(hours * safeInspectors * safeRate) /
		safeEfficiency /
		safeLotSize

	Logger.debug(
		`[calculateInspectionCost] Time=${safeTimeMin}min (${hours.toFixed(
			2
		)}h), Inspectors=${safeInspectors}, Rate=${safeRate}/hr, Efficiency=${safeEfficiency}, Lot=${safeLotSize} => Cost=${cost.toFixed(
			4
		)}`
	)

	return cost
}

export function calculateYieldCost(
	yieldPercentage: number,
	totalDirectCost: number
): number {
	const safeYield = Math.max(0, Math.min(Number(yieldPercentage) || 100, 100))
	const safeCost = Math.max(0, Number(totalDirectCost) || 0)

	const yieldFactor = safeYield / 100
	const scrapFactor = 1 - yieldFactor
	const cost = scrapFactor * safeCost

	Logger.debug(
		`[calculateYieldCost] Yield: ${safeYield}%, Total Cost: $${safeCost.toFixed(
			4
		)} = $${cost.toFixed(4)}`
	)

	return cost
}


export function calculateAllCosts(input: {
	machineHourRate: number
	laborRate: number
	setupLaborRate: number
	setupTimeMinutes: number
	cycleTime: number
	powerConsumptionKW: number
	electricityUnitCost: number
	inspectionTimeMinutes: number
	inspectorRate: number
	samplingPercentage: number
	yieldPercentage: number
	lotSize: number
	noOfLabors?: number
	numberOfInspectors?: number
	efficiency?: number
}): {
	directMachineCost: number
	directLaborCost: number
	directSetUpCost: number
	totalPowerCost: number
	inspectionCost: number
	yieldCost: number
	directProcessCost: number
} {
	const noOfLabors = input.noOfLabors || 1

	const machineCost = calculateMachineCost(
		input.machineHourRate,
		input.cycleTime
	)
	const laborCost = calculateLaborCost(
		input.laborRate,
		input.cycleTime,
		noOfLabors
	)
	const setupCost = calculateSetupCost(
		input.setupLaborRate,
		input.machineHourRate,
		input.setupTimeMinutes,
		input.lotSize
	)
	const powerCost = calculatePowerCost(
		input.cycleTime,
		input.powerConsumptionKW,
		input.electricityUnitCost
	)
	const inspectionCost = calculateInspectionCost({
		inspectionTimeMinutes: input.inspectionTimeMinutes,
		numberOfInspectors: input.numberOfInspectors || 1,
		inspectorRate: input.inspectorRate,
		efficiency: input.efficiency || 100,
		lotSize: input.lotSize,
		samplingPercentage: input.samplingPercentage
	})

	// Sum of variable costs (before yield adjustment)
	const variableCosts =
		machineCost + laborCost + setupCost + powerCost + inspectionCost

	const yieldCost = calculateYieldCost(input.yieldPercentage, variableCosts)
	const totalCost = variableCosts + yieldCost

	Logger.info(`\n💰 ===== Cost Summary =====`)
	Logger.info(`   Machine:     $${machineCost.toFixed(4)}`)
	Logger.info(`   Labor:       $${laborCost.toFixed(4)}`)
	Logger.info(`   Setup:       $${setupCost.toFixed(4)}`)
	Logger.info(`   Power:       $${powerCost.toFixed(4)}`)
	Logger.info(`   Inspection:  $${inspectionCost.toFixed(4)}`)
	Logger.info(`   Yield Loss:  $${yieldCost.toFixed(4)}`)
	Logger.info(`   ───────────────────────`)
	Logger.info(`   TOTAL:       $${totalCost.toFixed(4)}`)

	return {
		directMachineCost: machineCost,
		directLaborCost: laborCost,
		directSetUpCost: setupCost,
		totalPowerCost: powerCost,
		inspectionCost: inspectionCost,
		yieldCost: yieldCost,
		directProcessCost: totalCost
	}
}

// ============================================================================
// CYCLE TIME CALCULATION FUNCTIONS
// ============================================================================

export function calculateArcOnTime(
	totalWeldLength: number,
	travelSpeed: number = 5
): number {
	if (travelSpeed <= 0) {
		Logger.warn(`[calculateArcOnTime] Invalid travel speed: ${travelSpeed}`)
		return 0
	}

	const arcOnTime = totalWeldLength / travelSpeed
	Logger.debug(
		`[calculateArcOnTime] Length: ${totalWeldLength}mm, Speed: ${travelSpeed}mm/sec = ${arcOnTime.toFixed(
			2
		)}s`
	)
	return arcOnTime
}
export function safeCycleTime(cycleTime: number, fallback = 0): number {
	Logger.debug(`[safeCycleTime] Input: ${cycleTime}`)

	if (!Number.isFinite(cycleTime) || cycleTime <= 0) {
		Logger.warn(`[safeCycleTime] Invalid cycleTime: ${cycleTime}, using fallback`)
		return fallback
	}
	return cycleTime
}


export function calculateArcOffTime(
	tackWelds: number = 0,
	intermediateStops: number = 0
): number {
	const tackTime = Math.max(0, tackWelds) * 3 // 3 sec per tack
	const stopTime = Math.max(0, intermediateStops) * 2 // 2 sec per stop
	const arcOffTime = tackTime + stopTime

	Logger.debug(
		`[calculateArcOffTime] Tacks: ${tackWelds}×3s, Stops: ${intermediateStops}×2s = ${arcOffTime.toFixed(
			2
		)}s`
	)
	return arcOffTime
}

export function calculateSingleWeldCycleTime(input: {
	totalWeldLength: number
	travelSpeed?: number
	tackWelds?: number
	intermediateStops?: number
	weldType?: string | number
	numberOfWelds?: number // number of weld starts (places * sides)
}): number {
	const arcOnTime = calculateArcOnTime(
		input.totalWeldLength,
		input.travelSpeed || 5
	)
	const arcOffTime = calculateArcOffTime(
		input.tackWelds || 0,
		input.intermediateStops || 0
	)
	// Base Process Overhead (Arc Start, etc.) - UI adds ~3s per weld start
	const processOverheadPerWeld = 3
	const totalProcessOverhead = processOverheadPerWeld * (input.numberOfWelds || 1)
	let cycleTime = arcOnTime + arcOffTime + totalProcessOverhead

	const typeId = getWeldTypeId(input.weldType || '')
	if (typeId === 4) {
		cycleTime *= 0.95
	} else if (typeId === 5) {
		cycleTime *= 1.5
	}

	Logger.debug(
		`[calculateSingleWeldCycleTime] Arc-On: ${arcOnTime.toFixed(
			2
		)}s + Arc-Off: ${arcOffTime.toFixed(
			2
		)}s + Overhead: ${totalProcessOverhead.toFixed(2)}s (Welds: ${input.numberOfWelds || 1}, TypeAdj: ${typeId}) = ${cycleTime.toFixed(2)}s`
	)
	return cycleTime
}
export function calculateDryCycleTime(
	subProcessCycleTimes: number[],
	loadingUnloadingTime = 0,
	partReorientation = 0,
	noOfWeldPasses = 0
): number {
	const subProcessTotal = subProcessCycleTimes.reduce((s, t) => s + t, 0)

	const loadingTime = loadingUnloadingTime
	const unloadingTime = loadingUnloadingTime

	const arcOnTime = subProcessTotal + unloadingTime
	const arcOffTime = arcOnTime * 0.05

	return (
		noOfWeldPasses * loadingTime +
		arcOnTime +
		arcOffTime +
		partReorientation
	)

}
export function calculateOverallCycleTime(
	dryCycleTime: number,
	efficiencyPercentage: number = 100
): number {
	const efficiencyFactor = Math.max(
		0.1,
		Math.min(efficiencyPercentage / 100, 1)
	) // Clamp to 10-100%
	const cycleTime = dryCycleTime / efficiencyFactor

	Logger.debug(
		`[calculateOverallCycleTime] Dry: ${dryCycleTime.toFixed(
			2
		)}s, Efficiency: ${efficiencyPercentage}% = ${cycleTime.toFixed(2)}s`
	)
	return cycleTime
}
export function calculateCycleTimeBreakdown(input: TotalCycleTimeInput) {
	const subProcessTotal = input.subProcessCycleTimes.reduce((a, b) => a + b, 0)

	const loadingUnloading = input.loadingUnloadingTime ?? 0
	const partReorientation = input.partReorientation ?? 0
	const noOfWeldPasses = input.noWeldPasses ?? 0

	// UI logic: loading and unloading are equal halves
	const loadingTime = loadingUnloading
	const unloadingTime = loadingTime
	// Arc-On includes unloading
	const arcOnTime = subProcessTotal + unloadingTime

	// UI rule: Arc-Off = 5% of Arc-On
	const arcOffTime = arcOnTime * 0.05

	const intermediateWeldClean = input.intermediateWeldClean ?? 0

	// Dry cycle
	const dryCycleTime =
		noOfWeldPasses * loadingTime +
		arcOnTime +
		arcOffTime +
		partReorientation +
		intermediateWeldClean

	// Final cycle with efficiency
	const efficiencyFactor = Math.max(
		0.1,
		(input.efficiency || 100) / 100
	)

	const cycleTime = dryCycleTime / efficiencyFactor

	Logger.debug(
		`[calculateCycleTimeBreakdown] Sub:${subProcessTotal.toFixed(
			2
		)} | ArcOn:${arcOnTime.toFixed(
			2
		)} | ArcOff:${arcOffTime.toFixed(
			2
		)} | Dry:${dryCycleTime.toFixed(
			2
		)} | Final:${cycleTime.toFixed(2)}`
	)

	return {
		subProcessTotal,
		arcOnTime,
		arcOffTime,
		dryCycleTime,
		cycleTime
	}
}

// ============================================================================
// WELD GEOMETRY CALCULATION FUNCTIONS
// ============================================================================
export function calculateTotalWeldLength(
	weldLength: number,
	weldPlaces: number,
	weldSide: string = 'One Side'
): number {
	const sideMultiplier =
		weldSide && weldSide.toLowerCase().includes('both') ? 2 : 1
	const totalLength = weldLength * weldPlaces * sideMultiplier

	Logger.debug(
		`[calculateTotalWeldLength] Length: ${weldLength}mm × Places: ${weldPlaces} × Sides: ${sideMultiplier} = ${totalLength.toFixed(
			2
		)}mm`
	)
	return totalLength
}

export interface WeldCalculationResult {
	totalWeldLength: number
	weldVolume: number
	weldMass: number
}

function getWeldTypeId(weldType: string | number): number {
	if (typeof weldType === 'number') return weldType
	if (!weldType) return 1

	const lowerType = weldType.toString().toLowerCase()
	if (lowerType.includes('fillet')) return 1
	if (lowerType.includes('square')) return 2
	if (lowerType.includes('plug')) return 3
	if (lowerType.includes('bevel') || lowerType.includes('v groove')) return 4
	if (lowerType.includes('u/j')) return 5

	return 1
}

export function calculateWeldVolume(
	weldType: string | number,
	weldSize: number,
	weldElementSize: number,
	weldLength: number,
	weldPlaces: number,
	weldPasses: number = 1,
	weldSide: string | number = 'One Side'
): WeldCalculationResult {
	const typeId = getWeldTypeId(weldType)

	let weldCrossSection = 0
	const size = weldElementSize
	const height = weldSize

	if (typeId === 1 || typeId === 2) {
		weldCrossSection = (size * height) / 2
	} else if (typeId === 3) {
		weldCrossSection = size * size + height
	} else if (typeId === 4) {
		weldCrossSection = size * size + height / 2
	} else {
		weldCrossSection = (size * height * 3) / 2
	}

	let sideMultiplier = 1
	if (
		weldSide === 2 ||
		(typeof weldSide === 'string' &&
			(weldSide.toLowerCase() === 'both' ||
				weldSide.toLowerCase().includes('both')))
	) {
		sideMultiplier = 2
	}

	const totalWeldLength = weldPasses * weldLength * weldPlaces * sideMultiplier
	const weldVolume = totalWeldLength * weldCrossSection

	Logger.debug(
		`[calculateWeldVolume] Type: ${weldType}, Size: ${weldSize}, Length: ${weldLength}, Places: ${weldPlaces}, Passes: ${weldPasses}, Volume: ${weldVolume.toFixed(
			2
		)}`
	)

	return {
		totalWeldLength,
		weldVolume,
		weldMass: 0
	}
}

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
		Aluminum: { 1: 1.2, 1.6: 1.2, 3: 1.2, 4: 1.6, 5: 1.6, 6: 1.6, 8: 2.0 }
	}

	const material = materialType || 'Carbon Steel'
	const sizeMap = wireDiameterMap[material] || wireDiameterMap['Carbon Steel']
	const diameter = sizeMap[weldSize] || 0.8

	Logger.debug(
		`[getWireDiameter] Material: ${material}, Size: ${weldSize}mm = ${diameter}mm`
	)
	return diameter
}

// ============================================================================
// MANUFACTURING CO2 CALCULATION
// ============================================================================
export function calculateManufacturingCO2(
	cycleTimeSec: number,
	powerConsumptionKW: number,
	co2PerKwHr: number
): number {
	const safeTime = safeCycleTime(cycleTimeSec)

	const co2 = (safeTime / 3600) * powerConsumptionKW * co2PerKwHr

	Logger.debug(
		`[calculateManufacturingCO2] Time: ${safeTime}s, Power: ${powerConsumptionKW}kW, CO2: ${co2PerKwHr}kg/kWh = ${co2.toFixed(4)}kg`
	)

	return co2
}

// ============================================================================
// QUANTITY & WEIGHT CALCULATION FUNCTIONS
// ============================================================================

export function calculateLotSize(annualVolumeQty: number): number {
	if (annualVolumeQty <= 0) return 1
	return Math.round(annualVolumeQty / 12)
}

export function calculateLifeTimeQtyRemaining(
	annualVolumeQty: number,
	productLifeYears: number
): number {
	const lifetimeQty = annualVolumeQty * productLifeYears
	return Math.min(lifetimeQty, 100000000)
}

export function calculateNetWeight(
	volumeMm3: number,
	densityGCm3: number
): number {
	// Convert mm³ → cm³ → kg
	const volumeCm3 = volumeMm3 / 1000
	const weightGrams = volumeCm3 * densityGCm3
	//const weightKg = weightGrams / 1000

	Logger.debug(
		`[calculateNetWeight] Volume: ${volumeMm3}mm³, Density: ${densityGCm3}g/cm³ = ${weightGrams.toFixed(
			4
		)}g`
	)
	return weightGrams
}

// ============================================================================
// HELPER & VALIDATION FUNCTIONS
// ============================================================================

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

	const processType = processTypeMap[processTypeText] || ProcessType.MigWelding
	Logger.debug(
		`[getProcessType] Text: '${processTypeText}' = ProcessType ${processType}`
	)
	return processType
}

export function getDefaultInspectionTime(
	complexity: PartComplexity | number
): number {
	const time = DEFAULT_INSPECTION_TIME_BY_COMPLEXITY[complexity] || 5
	Logger.debug(
		`[getDefaultInspectionTime] Complexity: ${complexity} = ${time} min`
	)
	return time
}

export function round(value: number, decimals: number = 2): number {
	const factor = Math.pow(10, decimals)
	return Math.round(value * factor) / factor
}

// ============================================================================
// BATCH OPERATIONS & REPORTING
// ============================================================================

/**
 * Generates cost report for logging/debugging
 */
export function generateCostReport(
	costs: ReturnType<typeof calculateAllCosts>
): string {
	const lines = [
		'',
		'💰 ===== Manufacturing Cost Report =====',
		`Machine Cost:        $${costs.directMachineCost.toFixed(4)}`,
		`Labor Cost:          $${costs.directLaborCost.toFixed(4)}`,
		`Setup Cost:          $${costs.directSetUpCost.toFixed(4)}`,
		`Power Cost:          $${costs.totalPowerCost.toFixed(4)}`,
		`Inspection Cost:     $${costs.inspectionCost.toFixed(4)}`,
		`Yield/Scrap Loss:    $${costs.yieldCost.toFixed(4)}`,
		'─────────────────────────────',
		`TOTAL COST:          $${costs.directProcessCost.toFixed(4)}`,
		''
	]
	return lines.join('\n')
}

/**
 * Generates cycle time report for logging/debugging
 */
export function generateCycleTimeReport(
	breakdown: ReturnType<typeof calculateCycleTimeBreakdown>
): string {
	const lines = [
		'',
		'⏱️  ===== Cycle Time Breakdown =====',
		`Dry Cycle Time:      ${breakdown.dryCycleTime.toFixed(2)} sec`,
		`Overall Cycle Time:  ${breakdown.cycleTime.toFixed(2)} sec`,
		''
	]
	return lines.join('\n')
}

export default {
	// Enums
	PartComplexity,
	ProcessType,
	isValidCycleTime,
	calculateMachineCost,
	calculateLaborCost,
	calculateSetupCost,
	calculatePowerCost,
	calculateInspectionCost,
	calculateYieldCost,
	calculateAllCosts,
	calculateArcOnTime,
	calculateArcOffTime,
	calculateSingleWeldCycleTime,
	calculateDryCycleTime,
	calculateOverallCycleTime,
	calculateCycleTimeBreakdown,

	// Manufacturing CO2
	calculateManufacturingCO2,

	// Weld geometry
	calculateTotalWeldLength,
	calculateWeldVolume,
	getWireDiameter,

	// Quantity & weight
	calculateLotSize,
	calculateLifeTimeQtyRemaining,
	calculateNetWeight,

	// Helpers
	getProcessType,
	getDefaultInspectionTime,
	round,

	// Reporting
	generateCostReport,
	generateCycleTimeReport
}
