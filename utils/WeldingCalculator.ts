// tests/utils/WeldingCalculator.ts
import { SharedService } from './sharedService'

// Helper interfaces
export interface WeldSubProcess {
	formLength: number // Position ID
	shoulderWidth: number // Thickness? Used for lookup
	lengthOfCut: number // Type of cut (1-5)
	blankArea: number // Used for length calculation?
	noOfBends: number
	noOfHoles: number
	formingForce: number // Used as multiplier
}

export interface MIGCalculationInput {
	netWeight: number // kg
	processTypeID: number // 20 for MIG
	semiAutoOrAuto: number // 1=Auto, 2=Manual
	efficiency?: number // 0-100
	reorientationCount: number
	subProcesses: WeldSubProcess[]
	materialType: string
}

export interface CycleTimeResult {
	loadingUnloadingTime: number
	reorientationCount: number
	totalWeldCycleTime: number
	arcOnTime: number
	arcOffTime: number
	finalTotalCycleTime: number
}

export class WeldingCalculator {
	private shareService = new SharedService()

	// Data from WeldingConfigService
	private unloadingTimeData = [
		{
			minWeight: 0,
			maxWeight: 1000,
			complexity: 'Very Simple',
			unloadingTimeSec: 10
		},
		{
			minWeight: 1001,
			maxWeight: 4000,
			complexity: 'Simple',
			unloadingTimeSec: 30
		},
		{
			minWeight: 40001,
			maxWeight: 10000,
			complexity: 'Medium',
			unloadingTimeSec: 60
		},
		{
			minWeight: 10001,
			maxWeight: 25000,
			complexity: 'High',
			unloadingTimeSec: 120
		},
		{
			minWeight: 25001,
			maxWeight: Infinity,
			complexity: 'Very High',
			unloadingTimeSec: 300
		}
	]

	// Simplified welding data table (Manual)
	private migWeldingData = [
		{
			MaterialType: 'Carbon Steel',
			Type: 'Manual',
			PlateThickness_mm: 1,
			TravelSpeed_mm_per_sec: 6.97
		},
		{
			MaterialType: 'Carbon Steel',
			Type: 'Manual',
			PlateThickness_mm: 1.6,
			TravelSpeed_mm_per_sec: 6.06
		},
		{
			MaterialType: 'Carbon Steel',
			Type: 'Manual',
			PlateThickness_mm: 3,
			TravelSpeed_mm_per_sec: 5.27
		},
		{
			MaterialType: 'Carbon Steel',
			Type: 'Manual',
			PlateThickness_mm: 4,
			TravelSpeed_mm_per_sec: 4.17
		},
		{
			MaterialType: 'Carbon Steel',
			Type: 'Manual',
			PlateThickness_mm: 5,
			TravelSpeed_mm_per_sec: 4.75
		},
		{
			MaterialType: 'Carbon Steel',
			Type: 'Manual',
			PlateThickness_mm: 6,
			TravelSpeed_mm_per_sec: 4.5
		}
	]

	private weldingEfficiencies = [
		{
			weldingPositionId: 1,
			efficiency: { automated: 0.9, manual: 0.85 }
		}, // Flat
		{
			weldingPositionId: 2,
			efficiency: { automated: 0.9, manual: 0.85 }
		}, // Horizontal
		{
			weldingPositionId: 3,
			efficiency: { automated: 0.85, manual: 0.8 }
		}, // Vertical
		{
			weldingPositionId: 4,
			efficiency: { automated: 0.8, manual: 0.75 }
		}, // Overhead
		{
			weldingPositionId: 5,
			efficiency: { automated: 0.8, manual: 0.75 }
		}, // Circular
		{
			weldingPositionId: 6,
			efficiency: { automated: 0.86, manual: 0.81 }
		} // Combination
	]

	getUnloadingTime(weightKgs: number): number {
		// Assuming weight in Grams for lookup if logic is consistent, strictly based on config data
		// Code logic: getUnloadingTime(netWeight).
		// Table: maxWeight 1000.
		// If input is kg, we convert to grams? Or is the table in kg?
		// "Very Simple" < 1000. 1000kg is HUGE. 1000g (1kg) is reasonable.
		// So input weightKgs should be converted to grams.
		const weightGrams = weightKgs * 1000
		return (
			this.unloadingTimeData.find(
				d => weightGrams >= d.minWeight && weightGrams <= d.maxWeight
			)?.unloadingTimeSec || 10
		)
	}

	getWeldingEfficiency(position: number, isAutomated: boolean): number {
		const entry = this.weldingEfficiencies.find(
			item => item.weldingPositionId === position
		)
		return entry
			? isAutomated
				? entry.efficiency.automated
				: entry.efficiency.manual
			: 0.75
	}

	getTravelSpeed(material: string, thickness: number): number {
		const match = this.migWeldingData.find(
			d => d.MaterialType === material && d.PlateThickness_mm >= thickness
		)
		return match ? match.TravelSpeed_mm_per_sec : 5.0
	}

	public calculateMIGCycleTime(input: MIGCalculationInput): CycleTimeResult {
		let totalWeldCycleTimeAccumulated = 0

		// Loading/Unloading
		const loadingTime = this.getUnloadingTime(input.netWeight)
		const unloadingTime = loadingTime
		const loadingUnloadingSum = loadingTime + unloadingTime

		for (const sub of input.subProcesses) {
			const efficiency = this.getWeldingEfficiency(
				sub.formLength,
				input.semiAutoOrAuto === 1
			)

			// Travel Speed
			const baseSpeed = this.getTravelSpeed(input.materialType, sub.shoulderWidth)
			let travelSpeed = 0
			if (input.semiAutoOrAuto === 1) {
				travelSpeed = (baseSpeed / 0.8) * efficiency
			} else {
				travelSpeed = baseSpeed * efficiency
			}

			// Total Weld Length calculation
			const totalWeldLength =
				sub.blankArea * sub.noOfBends * sub.noOfHoles * sub.formingForce

			// Intermediate Stops
			let formPerimeter =
				sub.formingForce === 1
					? sub.noOfHoles
					: sub.noOfHoles * sub.formingForce
			const cycleTimeForIntermediateStops = formPerimeter * 5

			// Tack Welda
			let hlFactor = sub.noOfHoles
			if (sub.noOfBends > 100) {
				hlFactor = Math.round(sub.noOfBends / 100) * sub.noOfHoles
			}
			const cycleTimeForTackWeld = hlFactor * 3

			// Recommend Tonnage (Time for this weld)
			let weldTime =
				totalWeldLength / travelSpeed +
				cycleTimeForIntermediateStops +
				cycleTimeForTackWeld

			// Length of Cut factor
			if (sub.lengthOfCut === 4) weldTime *= 0.95
			else if (sub.lengthOfCut === 5) weldTime *= 1.5

			totalWeldCycleTimeAccumulated += weldTime
		}

		// Final calculations
		const arcOnTime = totalWeldCycleTimeAccumulated + loadingUnloadingSum
		const arcOffTime = arcOnTime * 0.05
		const totalWeldCycleTime =
			input.reorientationCount * loadingTime + arcOnTime + arcOffTime

		return {
			loadingUnloadingTime: loadingUnloadingSum,
			reorientationCount: input.reorientationCount,
			totalWeldCycleTime: totalWeldCycleTime,
			arcOnTime,
			arcOffTime,
			finalTotalCycleTime: totalWeldCycleTime
		}
	}
}

// Standalone exports
export function calculateLotSize(annualVolume: number): number {
	return Math.round(annualVolume / 12)
}

export function calculateLifeTimeQtyRemaining(
	annualVolume: number,
	productLife: number
): number {
	return annualVolume * productLife
}
