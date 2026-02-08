// Pure calculation functions for welding operations
// Refactored for testability and Playwright integration

import {
	WeldingWeightLossData,
	MigWeldingData
} from './welding-enums-constants'

/**
 * Validates and normalizes a number value
 * Returns 0 for invalid numbers
 */
export function isValidNumber(n: any): number {
	return !n || Number.isNaN(n) || !Number.isFinite(Number(n)) || n < 0
		? 0
		: Number(Number(n).toFixed(4))
}

/**
 * Get wire diameter for a given material and weld size
 */
export function getWireDiameter(
	materialType: string,
	weldSize: number
): number {
	const candidates = MigWeldingData.filter(d => d.MaterialType === materialType)

	const exact = candidates.find(d => d.PlateThickness_mm === weldSize)
	if (exact) return exact.WireDiameter_mm

	const thickness = Number(weldSize)
	const sorted = candidates.sort(
		(a, b) => a.PlateThickness_mm - b.PlateThickness_mm
	)
	const ge = sorted.find(d => d.PlateThickness_mm >= thickness)

	if (ge) return ge.WireDiameter_mm
	if (sorted.length > 0) return sorted[sorted.length - 1].WireDiameter_mm

	return 0
}

/**
 * Calculate net weight from volume and density
 */
export function calculateNetWeight(
	partVolumeMm3: number,
	density: number // g/cm3
): number {
	const volumeCm3 = partVolumeMm3 / 1000
	return volumeCm3 * density
}

/**
 * Calculate net material cost
 */
export function calculateNetMaterialCost(
	weldBeadWeightWithWastage: number,
	materialPricePerKg: number,
	volumeDiscountPercentage: number = 0
): number {
	let netMatCost = (weldBeadWeightWithWastage / 1000) * materialPricePerKg
	if (volumeDiscountPercentage > 0) {
		netMatCost = netMatCost * (1 - volumeDiscountPercentage / 100)
	}
	return isValidNumber(netMatCost)
}

/**
 * Calculate lot size from annual volume
 */
export function calculateLotSize(annualVolumeQty: number): number {
	if (!annualVolumeQty || annualVolumeQty <= 0) {
		return 1
	}
	return Math.round(annualVolumeQty / 12)
}

/**
 * Calculate power consumption from current and voltage
 */
export function calculatePowerConsumption(
	current: number,
	voltage: number
): number {
	return (current * voltage) / 1000
}

/**
 * Calculate power cost
 */
export function calculatePowerCost(
	cycleTimeSeconds: number,
	powerConsumptionKW: number,
	electricityUnitCost: number
): number {
	return isValidNumber(
		(cycleTimeSeconds / 3600) * powerConsumptionKW * electricityUnitCost
	)
}

/**
 * Calculate machine cost
 */
export function calculateMachineCost(
	machineHourRate: number,
	cycleTime: number // in seconds
): number {
	return isValidNumber((machineHourRate / 3600) * cycleTime)
}

/**
 * Calculate labor cost
 */
export function calculateLaborCost(
	laborHourRate: number,
	cycleTime: number, // in seconds
	noOfLabors: number
): number {
	return isValidNumber((laborHourRate / 3600) * cycleTime * noOfLabors)
}

/**
 * Calculate setup cost
 */
export function calculateSetupCost(
	setupTime: number, // in minutes
	machineHourRate: number,
	laborHourRate: number, // skilled labor
	lotSize: number
): number {
	return isValidNumber(
		((laborHourRate + machineHourRate) * (setupTime / 60)) / lotSize
	)
}

/**
 * Calculate yield cost
 */
export function calculateYieldCost(
	yieldPercentage: number,
	processCostSum: number, // Machine + Setup + Labor + Inspection
	materialCost: number
): number {
	return isValidNumber(
		(1 - yieldPercentage / 100) * (materialCost + processCostSum)
	)
}

/**
 * Get weight loss for material and wire diameter
 */
export function getMaxNearestWeightLoss(
	materialType: string,
	wireDiameter: number
): number {
	const filtered = WeldingWeightLossData.filter(
		(item: { MaterialType: string; WireDiameter_mm: number; loss_g: number }) =>
			item.MaterialType === materialType && item.WireDiameter_mm >= wireDiameter
	).sort(
		(a: { WireDiameter_mm: number }, b: { WireDiameter_mm: number }) =>
			a.WireDiameter_mm - b.WireDiameter_mm
	)

	return filtered.length > 0 ? filtered[0].loss_g : 0
}

/**
 * Get weld type ID from string or number
 */
export function getWeldTypeId(weldType: string | number): number {
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

/**
 * Calculate total weld length
 */
export function getTotalWeldLength(
	weldLength: number,
	weldPlaces: number,
	weldSide: string | number,
	noOfPasses: number = 1
): number {
	let sideMultiplier = 1
	if (typeof weldSide === 'string') {
		sideMultiplier = weldSide.toLowerCase() === 'both' ? 2 : 1
	} else if (typeof weldSide === 'number') {
		sideMultiplier = weldSide === 2 ? 2 : 1
	}
	return weldLength * weldPlaces * noOfPasses * sideMultiplier
}

/**
 * Calculate total weld material weight
 */
export function getTotalWeldMaterialWeight(
	partVolume: number,
	density: number
): number {
	return isValidNumber((partVolume * density) / 1000)
}

/**
 * Calculate weld bead weight with wastage
 */
export function getWeldBeadWeightWithWastage(
	grossWeight: number,
	wastagePercentage: number
): number {
	const multiplier = 1 + wastagePercentage / 100
	return isValidNumber(grossWeight * multiplier)
}

/**
 * Normalize efficiency to percentage (0-100)
 */
export function normalizeEfficiency(efficiency: number): number {
	if (!efficiency || efficiency < 0) return 75
	return efficiency <= 1 ? efficiency * 100 : efficiency
}

/**
 * Calculate manufacturing CO2
 */
export function calculateManufacturingCO2(
	cycleTimeSeconds: number,
	powerConsumptionKW: number,
	co2PerKwHr: number
): number {
	return (cycleTimeSeconds / 3600) * powerConsumptionKW * co2PerKwHr
}

/**
 * Calculate lifetime quantity remaining
 */
export function calculateLifeTimeQtyRemaining(
	annualVolumeQty: number,
	productLifeRemaining: number
): number {
	if (!annualVolumeQty || annualVolumeQty <= 0) return 0
	if (!productLifeRemaining || productLifeRemaining <= 0) return 0
	const lifeTimeQty = annualVolumeQty * productLifeRemaining
	return lifeTimeQty > 100000000 ? 100000000 : lifeTimeQty
}

/**
 * Calculate inspection cost
 */
export function calculateInspectionCost(
	inspectionTime: number,
	inspectorRate: number,
	samplingRate: number,
	lotSize: number,
	isSeamWelding: boolean
): number {
	if (isSeamWelding) {
		return isValidNumber(
			(inspectionTime * inspectorRate) / (lotSize * (samplingRate / 100))
		)
	} else {
		return isValidNumber(
			(samplingRate / 100) * ((inspectionTime * inspectorRate) / 3600)
		)
	}
}

/**
 * Safe division helper
 */
export function safeDiv(num: number, denom1: number, denom2: number): number {
	if (!denom1 || !denom2) return 0
	return isValidNumber(num / denom1 / denom2)
}

export interface WeldCalculationResult {
	totalWeldLength: number
	weldVolume: number
	weldMass: number
}

/**
 * Calculate weld volume based on parameters
 */
export function calculateWeldVolume(
	weldType: string | number,
	weldSize: number,
	weldElementSize: number,
	weldLength: number,
	weldPlaces: number,
	weldPasses: number,
	weldSide: string | number
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
	if (weldSide === 'Both' || weldSide === 2) {
		sideMultiplier = 2
	} else {
		sideMultiplier = 1
	}

	const totalWeldLength = weldPasses * weldLength * weldPlaces * sideMultiplier
	const weldVolume = totalWeldLength * weldCrossSection

	return {
		totalWeldLength,
		weldVolume,
		weldMass: 0
	}
}

/**
 * Calculate total weld length from multiple welds
 */
export function calculateTotalWeldLength(
	welds: { totalWeldLength: number }[]
): number {
	return welds.reduce((sum, weld) => sum + weld.totalWeldLength, 0)
}

