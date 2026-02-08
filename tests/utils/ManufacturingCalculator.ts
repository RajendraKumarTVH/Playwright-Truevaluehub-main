/**
 * ManufacturingCalculator - shared test-side calculation utilities
 * Implements common formulas used across many manufacturing services so tests
 * can verify UI values against expected calculations.
 */
export class ManufacturingCalculator {
	// Direct Machine Cost = (machineHourRate / 3600) * cycleTime
	static directMachineCost(machineHourRate: number, cycleTime: number): number {
		if (!Number.isFinite(machineHourRate) || !Number.isFinite(cycleTime))
			return 0
		return (machineHourRate / 3600) * cycleTime
	}

	// Direct Setup Cost = (((skilledLaborRate + machineHourRate) / 60) * setupTime) / lotSize
	static directSetupCost(
		skilledLaborRate: number,
		machineHourRate: number,
		setupTime: number,
		lotSize: number
	): number {
		if (!lotSize || lotSize === 0) return 0
		return (((skilledLaborRate + machineHourRate) / 60) * setupTime) / lotSize
	}

	// Direct Labor Cost = (laborRate / 3600) * (cycleTime * noOfLaborers)
	static directLaborCost(
		laborRate: number,
		cycleTime: number,
		noOfLaborers: number
	): number {
		return (laborRate / 3600) * (cycleTime * noOfLaborers)
	}

	// QA Inspection Cost = ((qaRate / 60) * inspectionTime * samplingParts) / lotSize
	static qaInspectionCost(
		qaRate: number,
		inspectionTime: number,
		samplingRatePercent: number,
		lotSize: number
	): number {
		const samplingParts = Math.ceil((samplingRatePercent / 100) * lotSize)
		if (!lotSize || lotSize === 0) return 0
		return ((qaRate / 60) * inspectionTime * samplingParts) / lotSize
	}

	// Yield Cost = (1 - yield%) * (materialCost + processCosts) - (1 - yield%) * scrapValue
	static yieldCost(
		yieldPercentage: number,
		materialCost: number,
		processCosts: number,
		materialWeight: number,
		scrapPrice: number
	): number {
		const yieldFactor = 1 - yieldPercentage / 100
		const scrapValue = (materialWeight * scrapPrice) / 1000
		return (
			yieldFactor * (materialCost + processCosts) - yieldFactor * scrapValue
		)
	}

	// Net Process Cost = sum of components
	static netProcessCost(
		directMachine: number,
		directSetup: number,
		directLabor: number,
		qaInspection: number,
		yieldCostValue: number
	): number {
		return (
			directMachine + directSetup + directLabor + qaInspection + yieldCostValue
		)
	}

	// Progressive Cycle Time: 60 / (strokeRate × efficiency × noOfStrokes)
	static progressiveCycleTime(
		strokeRate: number,
		noOfStrokes: number,
		efficiency: number
	): number {
		if (!strokeRate || strokeRate <= 0) return 0
		if (!efficiency || efficiency <= 0) efficiency = 1
		return 60 / strokeRate / noOfStrokes / efficiency
	}
}

export default ManufacturingCalculator
