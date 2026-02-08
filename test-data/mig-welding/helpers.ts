import { ExpectedValues as _ExpectedValues } from './expected'
import {
	calculateLotSize,
	calculateLifeTimeQtyRemaining
} from '../../tests/utils/welding-calculator'

// ==================== INTERFACES ====================

/** Test configuration interface */
export interface ITestConfig {
	baseUrl: string
	defaultTimeout: number
	retryCount: number
}

/** Project data interface */
export interface IProjectData {
	projectId: string
	projectName: string
	targetMonth: string
	createdBy: string
	status: string
}

/** Part information interface */
export interface IPartInformation {
	internalPartNumber: string
	drawingNumber: string
	revisionNumber: string
	partDescription: string
	manufacturingCategory: string
	bomQty: number
	annualVolumeQty: number
	lotSize: number
	productLifeRemaining: number
	lifeTimeQtyRemaining: number
}

/** Weld details interface for a single weld */
export interface IWeldDetail {
	weldType: string
	weldSize: number
	wireDia: number
	weldElementSize: number
	noOfWeldPasses: number
	weldLength: number
	weldSide: 'Single' | 'Both'
	weldPlaces: number
	grindFlush: 'Yes' | 'No'
	totalWeldLength: number
	weldVolume: number
}

/** Cost item with amount and percentage */
export interface ICostItem {
	amount: number
	percent: number
}

/** Cost summary interface */
export interface ICostSummary {
	materialCost: ICostItem
	manufacturingCost: ICostItem
	toolingCost: ICostItem
	overheadProfit: ICostItem
	packingCost: ICostItem
	exwPartCost: ICostItem
	freightCost: ICostItem
	dutiesTariff: ICostItem
	partShouldCost: ICostItem
}

// ==================== HELPER FUNCTIONS (re-usable) ====================

/** Get weld element size based on weld size using lookup table */
export function getWeldElementSize(
	weldSize: number,
	ExpectedValues: typeof _ExpectedValues = _ExpectedValues
): number {
	if (weldSize <= 3) return weldSize
	for (const lookup of ExpectedValues.weldElementSizeLookup) {
		if (weldSize <= lookup.maxWeldSize) {
			return lookup.elementSize
		}
	}
	return 8
}

export function calculateTotalWeldLength(
	weldLength: number,
	weldSide: 'Single' | 'Both',
	weldPlaces: number
): number {
	const sideMultiplier = weldSide === 'Both' ? 2 : 1
	return weldLength * sideMultiplier * weldPlaces
}

export function compareWithTolerance(
	actual: number,
	expected: number,
	tolerance: number = _ExpectedValues.tolerance
): boolean {
	return Math.abs(actual - expected) <= tolerance
}

export function formatCurrency(amount: number, decimals: number = 4): string {
	return `$${amount.toFixed(decimals)}`
}

export function calculateMachineCost(
	machineHourRate: number,
	cycleTimeSeconds: number
): number {
	return (machineHourRate / 3600) * cycleTimeSeconds
}

export function calculateLaborCost(
	laborRate: number,
	cycleTimeSeconds: number,
	numberOfLabors: number = 1
): number {
	return (laborRate / 3600) * cycleTimeSeconds * numberOfLabors
}

export function calculateSetupCost(
	laborRate: number,
	machineRate: number,
	setupTimeMinutes: number,
	lotSize: number
): number {
	return ((laborRate + machineRate) * (setupTimeMinutes / 60)) / lotSize
}

// Small helpers that depended on welding-calculator
export { calculateLotSize, calculateLifeTimeQtyRemaining }
