/**
 * @file costing-logic.ts
 * @description Core business logic for costing verification and calculations
 * Handles cost component calculations, verifications, and test step orchestration
 */

import { expect, Locator } from '@playwright/test'
import CostingPage from './costing.page'
import Logger from '../lib/LoggerUtil'
import { WeldingCalculator, ProcessType } from '../utils/welding-calculator'

const logger = Logger

export interface CostCalculationInputs {
	machineHourRate: number
	laborHourRate: number
	cycleTime: number
	setupTime: number
	lotSize: number
	materialCost: number
	yieldPercentage: number
	inspectionTime: number
	qaRate: number
	samplingRate: number
	powerCost: number
	efficiency: number
}

export interface CostCalculationResult {
	directMachineCost: number
	directLaborCost: number
	directSetupCost: number
	inspectionCost: number
	yieldCost: number
	powerCost: number
	totalProcessCost: number
	totalCost: number
}

export interface MaterialCalculationInputs {
	partVolume: number
	density: number
	materialPrice: number
	wireDiameter?: number
	efficiency?: number
}

export interface MaterialCalculationResult {
	netWeight: number
	weldBeadWeight: number
	wastage: number
	netMaterialCost: number
}

export class CostingLogic {
	private readonly page: CostingPage
	private readonly calculator: WeldingCalculator
	private runtimeContext: Record<string, any> = {}

	constructor(page: CostingPage) {
		this.page = page
		this.calculator = new WeldingCalculator()
	}

	// ============ MATERIAL CALCULATIONS ============

	/**
	 * Verify net weight calculation: netWeight = (partVolume * density) / 1000
	 */
	async verifyNetWeight(
		expectedValue?: number,
		precision: number = 2
	): Promise<number> {
		logger.info('🔹 Verifying Net Weight Calculation')

		let expected = expectedValue
		if (expected === undefined) {
			const partVolume = await this.page.getInputAsNum(this.page.PartVolume)
			const density = await this.page.getInputAsNum(this.page.Density)

			if (partVolume <= 0 || density <= 0) {
				logger.warn('⚠️ Invalid volume or density — skipping calculation')
				return 0
			}

			expected = (partVolume * density) / 1000
			logger.info(`📐 Calculated Net Weight: ${expected.toFixed(precision)} g`)
		}

		const actualNetWeight = await this.page.getInputAsNum(this.page.NetWeight)

		await this.page.verifyUIValue({
			locator: this.page.NetWeight,
			expectedValue: expected,
			label: 'Net Weight',
			precision
		})

		this.runtimeContext.netWeight = actualNetWeight
		return actualNetWeight
	}

	/**
	 * Verify material cost: netMaterialCost = (netWeight / 1000) * materialPrice
	 */
	async verifyNetMaterialCost(precision: number = 2): Promise<number> {
		logger.info('🔹 Verifying Net Material Cost Calculation')

		const netWeight = await this.page.getInputAsNum(this.page.NetWeight)
		const materialPrice = await this.page.getInputAsNum(this.page.MaterialPrice)

		const expectedCost = (netWeight / 1000) * materialPrice

		await this.page.verifyUIValue({
			locator: this.page.NetMaterialCost,
			expectedValue: expectedCost,
			label: 'Net Material Cost',
			precision
		})

		this.runtimeContext.netMaterialCost = expectedCost
		return expectedCost
	}

	// ============ MANUFACTURING COST CALCULATIONS ============

	/**
	 * Calculate direct machine cost: (machineHourRate / 3600) * cycleTime
	 */
	async verifyDirectMachineCost(precision: number = 2): Promise<number> {
		logger.info('🔹 Verifying Direct Machine Cost Calculation')

		const machineHourRate = await this.page.getInputAsNum(
			this.page.MachineHourRate
		)
		const cycleTime = await this.page.getInputAsNum(this.page.CycleTime)

		const expectedCost = (machineHourRate / 3600) * cycleTime

		await this.page.verifyUIValue({
			locator: this.page.DirectMachineCost,
			expectedValue: expectedCost,
			label: 'Direct Machine Cost',
			precision
		})

		this.runtimeContext.directMachineCost = expectedCost
		return expectedCost
	}

	/**
	 * Calculate direct labor cost: (laborRate / 3600) * cycleTime
	 */
	async verifyDirectLaborCost(precision: number = 2): Promise<number> {
		logger.info('🔹 Verifying Direct Labor Cost Calculation')

		const laborRate = await this.page.getInputAsNum(this.page.LaborRate)
		const cycleTime = await this.page.getInputAsNum(this.page.CycleTime)

		const expectedCost = (laborRate / 3600) * cycleTime

		await this.page.verifyUIValue({
			locator: this.page.DirectLaborCost,
			expectedValue: expectedCost,
			label: 'Direct Labor Cost',
			precision
		})

		this.runtimeContext.directLaborCost = expectedCost
		return expectedCost
	}

	/**
	 * Calculate setup cost: ((machineRate + laborRate) * setupTime / 60) / lotSize
	 */
	async verifyDirectSetupCost(precision: number = 2): Promise<number> {
		logger.info('🔹 Verifying Direct Setup Cost Calculation')

		const machineHourRate = await this.page.getInputAsNum(
			this.page.MachineHourRate
		)
		const laborRate = await this.page.getInputAsNum(this.page.LaborRate)
		const setupTime = await this.page.getInputAsNum(this.page.SetupTime)
		const lotSize = await this.page.getInputAsNum(this.page.LotsizeNos)

		if (lotSize === 0) {
			logger.warn('⚠️ Lot size is 0 — cannot calculate setup cost')
			return 0
		}

		const expectedCost =
			((machineHourRate + laborRate) * (setupTime / 60)) / lotSize

		await this.page.verifyUIValue({
			locator: this.page.DirectSetUpCost,
			expectedValue: expectedCost,
			label: 'Direct Setup Cost',
			precision
		})

		this.runtimeContext.directSetupCost = expectedCost
		return expectedCost
	}

	/**
	 * Calculate QA inspection cost: (qaRate / 60) * inspectionTime * (samplingRate / 100) / lotSize
	 */
	async verifyQAInspectionCost(precision: number = 2): Promise<number> {
		logger.info('🔹 Verifying QA Inspection Cost Calculation')

		const qaRate = await this.page.getInputAsNum(this.page.QAInspectorRate)
		const inspectionTime = await this.page.getInputAsNum(
			this.page.QAInspectionTime
		)
		const samplingRate = await this.page.getInputAsNum(this.page.SamplingRate)
		const lotSize = await this.page.getInputAsNum(this.page.LotsizeNos)

		if (lotSize === 0) {
			logger.warn('⚠️ Lot size is 0 — cannot calculate QA cost')
			return 0
		}

		const expectedCost =
			((qaRate / 60) * inspectionTime * (samplingRate / 100)) / lotSize

		await this.page.verifyUIValue({
			locator: this.page.QAInspectionCost,
			expectedValue: expectedCost,
			label: 'QA Inspection Cost',
			precision
		})

		this.runtimeContext.qaInspectionCost = expectedCost
		return expectedCost
	}

	/**
	 * Calculate power cost: (cycleTime / 3600) * powerConsumption * electricityUnitCost
	 */
	async verifyPowerCost(precision: number = 2): Promise<number> {
		logger.info('🔹 Verifying Power Cost Calculation')

		const cycleTime = await this.page.getInputAsNum(this.page.CycleTime)
		const powerConsumption = await this.page.getInputAsNum(
			this.page.PowerConsumptionKW
		)
		const electricityUnitCost = await this.page.getInputAsNum(
			this.page.ElectricityUnitCost
		)

		const expectedCost =
			(cycleTime / 3600) * powerConsumption * electricityUnitCost

		await this.page.verifyUIValue({
			locator: this.page.PowerCost,
			expectedValue: expectedCost,
			label: 'Power Cost',
			precision
		})

		this.runtimeContext.powerCost = expectedCost
		return expectedCost
	}

	/**
	 * Calculate yield cost: (1 - yieldPercentage / 100) * (netMaterialCost + directProcessCost)
	 */
	async verifyYieldCost(precision: number = 2): Promise<number> {
		logger.info('🔹 Verifying Yield Cost Calculation')

		const yieldPercentage = await this.page.getInputAsNum(
			this.page.YieldPercentage
		)
		const netMaterialCost = await this.page.getInputAsNum(
			this.page.NetMaterialCost
		)
		const directProcessCost = await this.page.getInputAsNum(
			this.page.NetProcessCost
		)

		const expectedCost =
			(1 - yieldPercentage / 100) * (netMaterialCost + directProcessCost)

		await this.page.verifyUIValue({
			locator: this.page.YieldCostPart,
			expectedValue: expectedCost,
			label: 'Yield Cost',
			precision
		})

		this.runtimeContext.yieldCost = expectedCost
		return expectedCost
	}

	/**
	 * Verify net process cost summation
	 * netProcessCost = directMachineCost + directLaborCost + setupCost + qaInspectionCost + powerCost
	 */
	async verifyNetProcessCost(precision: number = 2): Promise<number> {
		logger.info('🔹 Verifying Net Process Cost Summation')

		const machineCost = await this.page.getInputAsNum(
			this.page.DirectMachineCost
		)
		const laborCost = await this.page.getInputAsNum(this.page.DirectLaborCost)
		const setupCost = await this.page.getInputAsNum(this.page.DirectSetUpCost)
		const qaInspectionCost = await this.page.getInputAsNum(
			this.page.QAInspectionCost
		)
		const powerCostVal = await this.page.getInputAsNum(this.page.PowerCost)

		const expectedCost =
			machineCost + laborCost + setupCost + qaInspectionCost + powerCostVal

		logger.info(
			`✓ Cost Breakdown: Machine(${machineCost.toFixed(2)}) + Labor(${laborCost.toFixed(2)}) + Setup(${setupCost.toFixed(2)}) + QA(${qaInspectionCost.toFixed(2)}) + Power(${powerCostVal.toFixed(2)}) = ${expectedCost.toFixed(2)}`
		)

		await this.page.verifyUIValue({
			locator: this.page.NetProcessCost,
			expectedValue: expectedCost,
			label: 'Net Process Cost',
			precision
		})

		this.runtimeContext.netProcessCost = expectedCost
		return expectedCost
	}

	/**
	 * Verify total cost: netMaterialCost + netProcessCost + yieldCost
	 */
	async verifyTotalCost(precision: number = 2): Promise<number> {
		logger.info('🔹 Verifying Total Cost Calculation')

		const netMaterialCost = await this.page.getInputAsNum(
			this.page.NetMaterialCost
		)
		const netProcessCost = await this.page.getInputAsNum(
			this.page.NetProcessCost
		)
		const yieldCost = await this.page.getInputAsNum(this.page.YieldCostPart)

		const expectedCost = netMaterialCost + netProcessCost + yieldCost

		logger.info(
			`✓ Total Cost Breakdown: Material(${netMaterialCost.toFixed(2)}) + Process(${netProcessCost.toFixed(2)}) + Yield(${yieldCost.toFixed(2)}) = ${expectedCost.toFixed(2)}`
		)

		await this.page.verifyUIValue({
			locator: this.page.TotalCost,
			expectedValue: expectedCost,
			label: 'Total Cost',
			precision
		})

		this.runtimeContext.totalCost = expectedCost
		return expectedCost
	}

	// ============ COMPREHENSIVE VERIFICATION ============

	/**
	 * Verify all cost calculations in sequence
	 */
	async verifyAllCostCalculations(
		options: { precision?: number; debug?: boolean } = {}
	): Promise<CostCalculationResult> {
		const { precision = 2, debug = false } = options

		logger.info('\n💰 ═══════════════════════════════════════════════════════')
		logger.info('🔹 Comprehensive Cost Verification Suite')
		logger.info('═══════════════════════════════════════════════════════\n')

		try {
			// Material Costs
			logger.info('📦 MATERIAL COST VERIFICATION')
			await this.verifyNetWeight(undefined, precision)
			await this.verifyNetMaterialCost(precision)

			// Manufacturing Costs
			logger.info('\n⚙️ MANUFACTURING COST VERIFICATION')
			await this.verifyDirectMachineCost(precision)
			await this.verifyDirectLaborCost(precision)
			await this.verifyDirectSetupCost(precision)

			// Quality Costs
			logger.info('\n✅ QUALITY COST VERIFICATION')
			await this.verifyQAInspectionCost(precision)
			await this.verifyPowerCost(precision)

			// Totals
			logger.info('\n📊 TOTAL COST VERIFICATION')
			await this.verifyNetProcessCost(precision)
			await this.verifyYieldCost(precision)
			await this.verifyTotalCost(precision)

			logger.info('\n✅ All cost calculations verified successfully!')

			return {
				directMachineCost: this.runtimeContext.directMachineCost || 0,
				directLaborCost: this.runtimeContext.directLaborCost || 0,
				directSetupCost: this.runtimeContext.directSetupCost || 0,
				inspectionCost: this.runtimeContext.qaInspectionCost || 0,
				yieldCost: this.runtimeContext.yieldCost || 0,
				powerCost: this.runtimeContext.powerCost || 0,
				totalProcessCost: this.runtimeContext.netProcessCost || 0,
				totalCost: this.runtimeContext.totalCost || 0
			}
		} catch (error: any) {
			logger.error(`❌ Cost verification failed: ${error.message}`)
			if (debug) {
				logger.debug(error.stack)
			}
			throw error
		}
	}

	/**
	 * Collect all cost values for reporting
	 */
	async collectCostSummary(): Promise<CostCalculationResult> {
		return {
			directMachineCost: await this.page.getInputAsNum(
				this.page.DirectMachineCost
			),
			directLaborCost: await this.page.getInputAsNum(this.page.DirectLaborCost),
			directSetupCost: await this.page.getInputAsNum(this.page.DirectSetUpCost),
			inspectionCost: await this.page.getInputAsNum(this.page.QAInspectionCost),
			yieldCost: await this.page.getInputAsNum(this.page.YieldCostPart),
			powerCost: await this.page.getInputAsNum(this.page.PowerCost),
			totalProcessCost: await this.page.getInputAsNum(this.page.NetProcessCost),
			totalCost: await this.page.getInputAsNum(this.page.TotalCost)
		}
	}

	/**
	 * Get runtime context for test reporting
	 */
	getRuntimeContext(): Record<string, any> {
		return this.runtimeContext
	}
}

export default CostingLogic
