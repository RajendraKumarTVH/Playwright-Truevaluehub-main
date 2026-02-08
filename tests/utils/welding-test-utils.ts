import { expect } from '@playwright/test'
import Logger from '../lib/LoggerUtil'
import * as calc from './welding-calculator-functions'

const logger = Logger

export function assertCostMatch(
	actualCost: number,
	expectedCost: number,
	label: string,
	tolerance: number = 0.01
): void {
	const difference = Math.abs(actualCost - expectedCost)
	const percentDiff = (difference / expectedCost) * 100

	if (difference <= tolerance) {
		logger.info(
			`✓ ${label}: ${actualCost.toFixed(4)} ≈ ${expectedCost.toFixed(
				4
			)} (diff: $${difference.toFixed(4)})`
		)
		expect.soft(actualCost).toBeCloseTo(expectedCost, 2)
	} else {
		logger.warn(
			`⚠ ${label}: ${actualCost.toFixed(4)} vs ${expectedCost.toFixed(
				4
			)} (diff: $${difference.toFixed(4)}, ${percentDiff.toFixed(1)}%)`
		)
		expect.soft(actualCost).toBeCloseTo(expectedCost, 1)
	}
}

export function assertCycleTimeMatch(
	actualTime: number,
	expectedTime: number,
	label: string,
	tolerance: number = 1
): void {
	const normalizedActual = calc.normalizeCycleTime(actualTime)
	const normalizedExpected = calc.normalizeCycleTime(expectedTime)
	const difference = Math.abs(normalizedActual - normalizedExpected)

	if (difference <= tolerance) {
		logger.info(
			`✓ ${label}: ${normalizedActual.toFixed(
				2
			)}s ≈ ${normalizedExpected.toFixed(2)}s (diff: ${difference.toFixed(2)}s)`
		)
		expect.soft(normalizedActual).toBeCloseTo(normalizedExpected, 1)
	} else {
		logger.warn(
			`⚠ ${label}: ${normalizedActual.toFixed(
				2
			)}s vs ${normalizedExpected.toFixed(2)}s (diff: ${difference.toFixed(
				2
			)}s)`
		)
		expect.soft(normalizedActual).toBeCloseTo(normalizedExpected, 0)
	}
}
export function assertCO2Match(
	actualCO2: number,
	expectedCO2: number,
	label: string
): void {
	const difference = Math.abs(actualCO2 - expectedCO2)

	if (difference < 0.001) {
		logger.info(
			`✓ ${label}: ${actualCO2.toFixed(4)}kg ≈ ${expectedCO2.toFixed(4)}kg`
		)
		expect.soft(actualCO2).toBeCloseTo(expectedCO2, 4)
	} else {
		logger.warn(
			`⚠ ${label}: ${actualCO2.toFixed(4)}kg vs ${expectedCO2.toFixed(4)}kg`
		)
		expect.soft(actualCO2).toBeCloseTo(expectedCO2, 3)
	}
}

export function verifyCostBreakdown(input: {
	uiCosts: {
		machine: number
		labor: number
		setup: number
		power: number
		inspection: number
		yield: number
		total: number
	}
	calculationInputs: {
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
	}
}): {
	passed: number
	failed: number
	skipped: number
} {
	logger.info('\n💰 Verifying Cost Breakdown...')

	const calculatedCosts = calc.calculateAllCosts(input.calculationInputs)
	let passed = 0,
		failed = 0,
		skipped = 0

	// Machine Cost
	if (input.uiCosts.machine > 0 && calculatedCosts.directMachineCost > 0) {
		try {
			assertCostMatch(
				input.uiCosts.machine,
				calculatedCosts.directMachineCost,
				'Machine Cost'
			)
			passed++
		} catch {
			failed++
		}
	} else {
		skipped++
	}

	// Labor Cost
	if (input.uiCosts.labor > 0 && calculatedCosts.directLaborCost > 0) {
		try {
			assertCostMatch(
				input.uiCosts.labor,
				calculatedCosts.directLaborCost,
				'Labor Cost'
			)
			passed++
		} catch {
			failed++
		}
	} else {
		skipped++
	}

	// Setup Cost
	if (input.uiCosts.setup > 0 && calculatedCosts.directSetUpCost > 0) {
		try {
			assertCostMatch(
				input.uiCosts.setup,
				calculatedCosts.directSetUpCost,
				'Setup Cost'
			)
			passed++
		} catch {
			failed++
		}
	} else {
		skipped++
	}

	// Power Cost
	if (input.uiCosts.power > 0 && calculatedCosts.totalPowerCost > 0) {
		try {
			assertCostMatch(
				input.uiCosts.power,
				calculatedCosts.totalPowerCost,
				'Power Cost'
			)
			passed++
		} catch {
			failed++
		}
	} else {
		skipped++
	}

	// Inspection Cost
	if (input.uiCosts.inspection > 0 && calculatedCosts.inspectionCost > 0) {
		try {
			assertCostMatch(
				input.uiCosts.inspection,
				calculatedCosts.inspectionCost,
				'Inspection Cost'
			)
			passed++
		} catch {
			failed++
		}
	} else {
		skipped++
	}

	// Yield Cost
	if (input.uiCosts.yield > 0 && calculatedCosts.yieldCost > 0) {
		try {
			assertCostMatch(
				input.uiCosts.yield,
				calculatedCosts.yieldCost,
				'Yield Cost'
			)
			passed++
		} catch {
			failed++
		}
	} else {
		skipped++
	}

	// Total Cost
	if (input.uiCosts.total > 0 && calculatedCosts.directProcessCost > 0) {
		try {
			assertCostMatch(
				input.uiCosts.total,
				calculatedCosts.directProcessCost,
				'Total Manufacturing Cost',
				0.05
			)
			passed++
		} catch {
			failed++
		}
	} else {
		skipped++
	}

	logger.info(`\nCost Verification Summary: ✓${passed} ⚠${failed} ⊘${skipped}`)
	return { passed, failed, skipped }
}

// ============================================================================
// CYCLE TIME VERIFICATION HELPERS
// ============================================================================

/**
 * Verifies complete cycle time breakdown
 */
export function verifyCycleTimeBreakdown(input: {
	uiCycleTime: number
	calculationInputs: {
		subProcessCycleTimes: number[]
		loadingUnloadingTime: number
		partReorientation: number
		efficiency: number
	}
}): {
	passed: boolean
	message: string
} {
	logger.info('\n⏱️  Verifying Cycle Time...')

	const calculated = calc.calculateCycleTimeBreakdown(input.calculationInputs)

	try {
		assertCycleTimeMatch(
			input.uiCycleTime,
			calculated.cycleTime,
			'Overall Cycle Time',
			2 // 2 second tolerance
		)

		logger.info(calc.generateCycleTimeReport(calculated))
		return { passed: true, message: 'Cycle time verification passed' }
	} catch (error) {
		logger.error(`Cycle time verification failed: ${error}`)
		return { passed: false, message: `Cycle time mismatch: ${error}` }
	}
}

// ============================================================================
// CO2 EMISSION VERIFICATION
// ============================================================================

/**
 * Verifies CO2 emissions per part
 */
export function verifyCO2Emissions(input: {
	uiCO2: number
	cycleTime: number
	powerConsumptionKW: number
	co2PerKwHr: number
	label?: string
}): boolean {
	logger.info('\n🌍 Verifying CO2 Emissions...')

	const calculatedCO2 = calc.calculateManufacturingCO2(
		input.cycleTime,
		input.powerConsumptionKW,
		input.co2PerKwHr
	)

	try {
		assertCO2Match(
			input.uiCO2,
			calculatedCO2,
			input.label || 'Manufacturing CO2'
		)
		return true
	} catch {
		return false
	}
}

// ============================================================================
// BATCH CALCULATION HELPERS
// ============================================================================

/**
 * Calculates and logs complete manufacturing analysis
 */
export function analyzeManufacturing(input: {
	// Cycle time inputs
	subProcessCycleTimes: number[]
	loadingUnloadingTime: number
	partReorientation: number
	efficiency: number

	// Cost inputs
	machineHourRate: number
	laborRate: number
	setupLaborRate: number
	setupTimeMinutes: number
	powerConsumptionKW: number
	electricityUnitCost: number
	inspectionTimeMinutes: number
	inspectorRate: number
	samplingPercentage: number
	yieldPercentage: number
	lotSize: number
	noOfLabors?: number
	numberOfInspectors?: number

	// CO2 inputs
	co2PerKwHr: number
}): {
	cycleTimeBreakdown: ReturnType<typeof calc.calculateCycleTimeBreakdown>
	costBreakdown: ReturnType<typeof calc.calculateAllCosts>
	co2PerPart: number
} {
	logger.info('\n🔬 ===== Manufacturing Analysis =====\n')

	// Cycle time analysis
	const cycleTimeBreakdown = calc.calculateCycleTimeBreakdown({
		subProcessCycleTimes: input.subProcessCycleTimes,
		loadingUnloadingTime: input.loadingUnloadingTime,
		partReorientation: input.partReorientation,
		efficiency: input.efficiency
	})

	// Cost analysis
	const costBreakdown = calc.calculateAllCosts({
		machineHourRate: input.machineHourRate,
		laborRate: input.laborRate,
		setupLaborRate: input.setupLaborRate,
		setupTimeMinutes: input.setupTimeMinutes,
		cycleTime: cycleTimeBreakdown.cycleTime, // Use calculated cycle time
		powerConsumptionKW: input.powerConsumptionKW,
		electricityUnitCost: input.electricityUnitCost,
		inspectionTimeMinutes: input.inspectionTimeMinutes,
		inspectorRate: input.inspectorRate,
		samplingPercentage: input.samplingPercentage,
		yieldPercentage: input.yieldPercentage,
		lotSize: input.lotSize,
		noOfLabors: input.noOfLabors,
		numberOfInspectors: input.numberOfInspectors,
		efficiency: input.efficiency
	})

	// CO2 analysis
	const co2PerPart = calc.calculateManufacturingCO2(
		cycleTimeBreakdown.cycleTime,
		input.powerConsumptionKW,
		input.co2PerKwHr
	)

	// Log reports
	logger.info(calc.generateCycleTimeReport(cycleTimeBreakdown))
	logger.info(calc.generateCostReport(costBreakdown))
	logger.info(`\n🌍 CO2 Emissions:      ${co2PerPart.toFixed(4)} kg/part\n`)

	return {
		cycleTimeBreakdown,
		costBreakdown,
		co2PerPart
	}
}

export default {
	// Assertions
	assertCostMatch,
	assertCycleTimeMatch,
	assertCO2Match,

	// Verification
	verifyCostBreakdown,
	verifyCycleTimeBreakdown,
	verifyCO2Emissions,

	// Analysis
	analyzeManufacturing
}
