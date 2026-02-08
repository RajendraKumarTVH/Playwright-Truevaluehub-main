import { expect } from '@playwright/test'
import { Dialog } from '@playwright/test'
import { WeldingCalculator, ProcessType } from '../utils/welding-calculator'
import Logger from '../lib/LoggerUtil'

const logger = Logger

// Small DTO for helper results
interface WeldingCalculationResult {
	directSetUpCost?: number
	directLaborCost?: number
	directMachineCost?: number
	inspectionCost?: number
	yieldCost?: number
	totalCost?: number
	// add other fields you assert in UI
}
// import { ProcessType } from '../utils/ProcessType'
// import { ProcessInfoDto } from '../utils/ProcessInfoDto'

export class WeldCleaningTestHelper {
	constructor(
		private readonly page: any,
		private readonly calculator = new WeldingCalculator()
	) {}

	/* =====================================================
       UI VALUE COLLECTORS
       ===================================================== */

	async getUIRates() {
		return {
			machineHourRate: await this.page.getInputValueAsNumber(
				this.page.MachineHourRate
			),
			cycleTime: await this.page.getInputValueAsNumber(this.page.CycleTimePart),
			efficiency: await this.page.getInputValueAsNumber(
				this.page.MachineEfficiency
			),
			setupTime: await this.page.getInputValueAsNumber(
				this.page.MachineSetupTime
			),
			directLaborRate: await this.page.getInputValueAsNumber(
				this.page.DirectLaborRate
			),
			noOfDirectLabors: await this.page.getInputValueAsNumber(
				this.page.NoOfDirectLabors
			),
			qaRate: await this.page.getInputValueAsNumber(this.page.QAInspectorRate),
			inspectionTime: await this.page.getInputValueAsNumber(
				this.page.QAInspectionTime
			),
			samplingRate: await this.page.getInputValueAsNumber(
				this.page.SamplingRate
			),
			yieldPer: await this.page.getInputValueAsNumber(this.page.YieldPercentage)
		}
	}

	async getUICosts() {
		return {
			machine: await this.page.getInputValueAsNumber(this.page.MachineCostPart),
			setup: await this.page.getInputValueAsNumber(this.page.SetupCostPart),
			labor: await this.page.getInputValueAsNumber(this.page.LaborCostPart),
			inspection: await this.page.getInputValueAsNumber(
				this.page.QAInspectionCost
			),
			yield: await this.page.getInputValueAsNumber(this.page.YieldCostPart)
		}
	}

	/* =====================================================
       FORMULA-LEVEL VERIFICATION (UI MIRROR)
       ===================================================== */

	verifyMachineCostFormula(
		machineHourRate: number,
		cycleTime: number,
		actualMachineCost: number
	) {
		const expected = (machineHourRate / 3600) * cycleTime
		expect(actualMachineCost).toBeCloseTo(expected, 4)
	}

	/* =====================================================
       CALCULATOR INPUT — STRIPPED TO MIRROR UI
       ===================================================== */

	// buildCalculatorInputForUI(processOverrides: Partial<ProcessInfoDto>) {
	//     const processInfo = {} as ProcessInfoDto

	//     processInfo.processTypeID = ProcessType.WeldingCleaning

	//     // ⚠️ CRITICAL: mirror UI behavior
	//     processInfo.iscycleTimeDirty = false
	//     processInfo.efficiency = 100
	//     processInfo.yieldPer = 100
	//     processInfo.setUpTime = 0
	//     processInfo.lotSize = 1
	//     processInfo.noOfSkilledLabours = 0

	//     Object.assign(processInfo, processOverrides)
	//     return processInfo
	// }

	/* =====================================================
       ENGINE CALCULATION (CONTROLLED)
       ===================================================== */

	// calculate(processInfo: ProcessInfoDto) {
	//     return this.calculator.calculationsForWeldingPreparation(
	//         processInfo,
	//         [],
	//         processInfo
	//     )
	// }

	/* =====================================================
       ENGINE ASSERTIONS (NOT UI FORMULA)
       ===================================================== */
	async clearAllAndWait(): Promise<void> {
		logger.info('🔹 Attempting to Clear All data...')

		// Wait until button is really usable
		await this.page.ClearAll.waitFor({ state: 'visible', timeout: 7000 })
		await expect(this.page.ClearAll).toBeEnabled()

		// Handle browser confirmation dialog if any
		this.page.page.once('dialog', async (dialog: Dialog) => {
			logger.info(`Dialog detected: ${dialog.message()}`)
			await dialog.accept()
		})

		// Click Clear All (retry-safe)
		for (let i = 0; i < 3; i++) {
			try {
				await this.page.ClearAll.click({ timeout: 3000 })
				break
			} catch (e) {
				logger.warn(`⚠ Clear click failed, retry ${i + 1}`)
				await this.page.wait(500)
			}
		}

		// Handle HTML modal confirmation (if app uses custom popup)
		const confirmBtn = this.page.page.getByRole('button', {
			name: /yes|confirm|ok/i
		})
		if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
			logger.info('HTML confirm modal detected, clicking confirm...')
			await confirmBtn.click()
		}

		// Wait for backend + UI refresh
		await this.page.waitForNetworkIdle()

		// HARD validation: form must actually reset
		await expect
			.poll(
				async () => {
					return await this.page.getInputValue(this.page.InternalPartNumber)
				},
				{ timeout: 7000 }
			)
			.toBe('')

		logger.info('✔ Clear All successful and data reset verified')
	}

	verifyEngineVsUI(calculated: any, actualCosts: any) {
		expect(actualCosts.machine).toBeCloseTo(
			Number(calculated.directMachineCost),
			2
		)
		expect(actualCosts.setup).toBeCloseTo(Number(calculated.directSetUpCost), 2)
		expect(actualCosts.labor).toBeCloseTo(Number(calculated.directLaborCost), 2)
		expect(actualCosts.inspection).toBeCloseTo(
			Number(calculated.inspectionCost),
			2
		)

		if (calculated.yieldCost !== undefined) {
			expect(actualCosts.yield).toBeCloseTo(Number(calculated.yieldCost), 2)
		}
	}

	async getWeldingCalculationResult(
		processType: ProcessType,
		manufactureInfo: any
	): Promise<WeldingCalculationResult> {
		const result =
			processType === ProcessType.WeldingCleaning
				? this.calculator.calculationsForWeldingCleaning(
						manufactureInfo,
						[],
						manufactureInfo
					)
				: this.calculator.calculationForWelding(
						manufactureInfo,
						[],
						manufactureInfo,
						[]
					)

		logger.info(`Calculated Results:\n${JSON.stringify(result, null, 2)}`)
		return {
			directSetUpCost: result.directSetUpCost,
			directLaborCost: result.directLaborCost,
			directMachineCost: result.directMachineCost,
			inspectionCost: result.inspectionCost,
			yieldCost: result.yieldCost,
			totalCost: result.totalCost
		}
	}
}
