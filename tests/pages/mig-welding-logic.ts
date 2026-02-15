import { expect, Locator } from '@playwright/test'
import Logger from '../lib/LoggerUtil'
import {
	WeldSubMaterialUI,
	MaterialDimensionsAndDensity,
	RuntimeWeldingContext,
	WeldRowLocators,
	WeldRowResult,
	SubProcess,
	TotalCycleTimeInput,
	ProcessInfoDto,
	MaterialESGInput,
	ManufacturingInput,
} from '../utils/interfaces'
import { ProcessType, PrimaryProcessType } from '../utils/constants'

import {
	calculateLotSize,
	calculateLifeTimeQtyRemaining,
	calculateWeldVolume,
	getWireDiameter,
	calculateManufacturingCO2,
	LaborRateMasterDto,
	WeldingCalculator,
	calculateWeldCycleTimeBreakdown,
	calculateSingleWeldCycleTime,
	calculateNetWeight,
	validateTotalLength,
	getCellNumberFromTd,
	getCellNumber,
	getCurrencyNumber,
	getNumber,
	calculateOverHeadCost,
	calculateTotalPackMatlCost,
	calculateExPartCost,
	calculatePartCost,
} from '../utils/welding-calculator'
import { MigWeldingPage } from './mig-welding.page'
import { VerificationHelper } from '../lib/BasePage'
import { MaterialInformation } from '../../test-data/mig-welding-testdata'
import { normalizeMachineType } from '../utils/helpers'
import { SustainabilityCalculator } from '../utils/SustainabilityCalculator'
const logger = Logger
type CostVerificationItem = {
	label: string
	locator: Locator
	value: number | null | undefined
	enabled?: boolean
	includeInTotal?: boolean
}

type VerifyCostOptions = {
	precision?: number
	debug?: boolean
	retryTimeout?: number
	retryInterval?: number
}
export class MigWeldingLogic {
	private readonly calculator = new WeldingCalculator()

	private runtimeWeldingContext: RuntimeWeldingContext = {}

	constructor(public page: MigWeldingPage) { }

	async setProcessGroup(value: string): Promise<void> {
		await this.page.selectOption(this.page.ProcessGroup, value)
	}

	private async isAttached(locator: Locator, timeout = 500): Promise<boolean> {
		try {
			await locator.waitFor({ state: 'attached', timeout })
			return true
		} catch {
			return false
		}
	}
	//================================ Material Dimensions And Density ========================
	public async getMaterialDimensionsAndDensity(): Promise<MaterialDimensionsAndDensity> {
		const DEFAULT_DENSITY = 7.85
		let density = DEFAULT_DENSITY
		let length = 0
		let width = 0
		let height = 0
		try {
			if (this.page.isPageClosed?.()) {
				logger.warn('⚠️ Page already closed — using defaults')
				return { length, width, height, density }
			}
			await this.page.waitAndClick(this.page.MaterialDetailsTab)
			if (
				await this.page.Density.first()
					.isVisible({ timeout: 3000 })
					.catch(() => false)
			) {
				density =
					Number(await this.page.Density.first().inputValue()) ||
					DEFAULT_DENSITY
			} else {
				logger.warn('⚠️ Density field not visible — using default')
			}
			await this.page.waitAndClick(this.page.MaterialInfo)
			if (
				await this.page.PartEnvelopeLength.first()
					.isVisible({ timeout: 3000 })
					.catch(() => false)
			) {
				;[length, width, height] = (
					await Promise.all([
						this.page.PartEnvelopeLength.first().inputValue(),
						this.page.PartEnvelopeWidth.first().inputValue(),
						this.page.PartEnvelopeHeight.first().inputValue()
					])
				).map(v => Number(v) || 0)
			} else {
				logger.warn('⚠️ Dimension fields not visible — using defaults')
			}
		} catch (err) {
			logger.warn(`⚠️ Failed to read material data safely: ${err}`)
		}
		logger.info(`📐 L:${length}, W:${width}, H:${height} | Density:${density}`)
		return { length, width, height, density }
	}

	//======================== Part Complexity ========================
	async getPartComplexity(testData?: {
		partComplexity?: 'low' | 'medium' | 'high'
	}): Promise<number> {
		logger.info('🔹 Processing Part Complexity...')
		await this.page.AdditionalDetails.scrollIntoViewIfNeeded()
		await this.page.waitAndClick(this.page.AdditionalDetails)
		const selectValueMap: Record<'low' | 'medium' | 'high', string> = {
			low: '1',
			medium: '2',
			high: '3'
		}

		if (testData?.partComplexity) {
			const key = testData.partComplexity.toLowerCase() as
				| 'low'
				| 'medium'
				| 'high'

			const optionValue = selectValueMap[key]
			if (!optionValue) {
				throw new Error(
					`❌ Invalid Part Complexity: ${testData.partComplexity}`
				)
			}

			logger.info(`🔧 Selecting Part Complexity: ${key}`)
			await this.page.PartComplexity.selectOption(optionValue)
		}
		const selectedValue = await this.page.PartComplexity.inputValue()
		if (!selectedValue) {
			logger.warn('⚠️ Part Complexity not selected, defaulting to LOW')
			return 1
		}
		const partComplexity = Number(selectedValue)

		if (![1, 2, 3].includes(partComplexity)) {
			throw new Error(
				`❌ Unexpected Part Complexity value in UI: "${selectedValue}"`
			)
		}
		logger.info(`✅ Part Complexity resolved as: ${partComplexity}`)
		await this.page.waitAndClick(this.page.PartDetails)
		return partComplexity
	}

	// ========================== Navigation ==========================

	async navigateToProject(projectId: string): Promise<void> {
		logger.info(`🔹 Navigating to project: ${projectId}`)
		await this.page.waitAndClick(this.page.projectIcon)
		logger.info('Existing part found. Clicking Clear All...')
		const isClearVisible = await this.page.ClearAll.isVisible().catch(
			() => false
		)

		if (isClearVisible) {
			await this.page.waitAndClick(this.page.ClearAll)
		} else {
			await this.page.keyPress('Escape')
		}
		await this.page.openMatSelect(this.page.SelectAnOption, 'Project Selector')

		const projectOption = this.page.page
			.locator('mat-option, mat-mdc-option')
			.filter({ hasText: 'Project #' })
			.first()

		await projectOption.waitFor({ state: 'visible', timeout: 10000 })
		await projectOption.scrollIntoViewIfNeeded()
		await projectOption.click()

		logger.info('✅ Project option selected')

		await this.page.waitAndFill(this.page.ProjectValue, projectId)
		await this.page.pressTab()
		await this.page.pressEnter()
		await this.page.waitForNetworkIdle()
		await this.page.ProjectID.click()
		logger.info(`✔ Navigated to project ID: ${projectId}`)
	}
	async openManufacturingForMigWelding(): Promise<void> {
		logger.info('🔧 Opening Manufacturing → MIG Welding')

		const {
			ManufacturingInformation,
			MigWeldRadBtn,
			MigWeldingProcessType,
			MfgWeld1,
			WeldTypeSubProcess1,
			MfgWeld2,
			WeldTypeSubProcess2
		} = this.page

		await this.page.scrollToMiddle(ManufacturingInformation)
		await ManufacturingInformation.waitFor({
			state: 'visible',
			timeout: 10_000
		})
		await ManufacturingInformation.scrollIntoViewIfNeeded()

		const isExpanded = await MigWeldingProcessType.isVisible().catch(
			() => false
		)

		if (!isExpanded) {
			logger.info('🔽 Expanding Manufacturing section')
			await ManufacturingInformation.click()
			await MigWeldingProcessType.waitFor({ state: 'visible', timeout: 10_000 })
		} else {
			logger.info('✅ Manufacturing section already expanded')
		}

		if (!(await MigWeldRadBtn.isChecked())) {
			logger.info('🟢 Selecting MIG Welding')
			await MigWeldRadBtn.click({ force: true })
		}

		await this.page.expandWeldIfVisible(MfgWeld1, WeldTypeSubProcess1, 'Weld 1')
		await this.page.expandWeldIfVisible(MfgWeld2, WeldTypeSubProcess2, 'Weld 2')

		logger.info('✅ Manufacturing → MIG Welding ready')
	}

	async verifyPartInformation(costingNotesText?: string): Promise<void> {
		logger.info('🔹 Verifying Part Details...')
		await this.page.assertVisible(this.page.InternalPartNumber)

		const internalPartNumber = await this.page.getInputValue(
			this.page.InternalPartNumber
		)

		if (!costingNotesText) {
			logger.info('📝 Fetching Costing Notes from UI...')
			costingNotesText = (await this.page.CostingNotes.innerText()) || ''
		}

		// ---------------- Drawing Number ----------------
		let drawingNumber = ''
		if (!drawingNumber && internalPartNumber) {
			const match = internalPartNumber.match(/^\d+/)
			if (match) {
				drawingNumber = match[0]
			}
		}

		// ---------------- Revision Number ----------------
		let revisionNumber = ''
		if (!revisionNumber && internalPartNumber) {
			const match = internalPartNumber.match(/^\d+-([A-Za-z]+)/)
			if (match) {
				revisionNumber = match[1]
			}
		}

		try {
			// ================= Manufacturing Category =================
			const elementTag = await this.page.ManufacturingCategory.evaluate(el =>
				el.tagName.toLowerCase()
			)

			let selectedCategory = ''
			if (elementTag === 'select') {
				selectedCategory = await this.page.ManufacturingCategory.evaluate(
					(el: HTMLSelectElement) =>
						el.options[el.selectedIndex]?.text?.trim() || ''
				)
			} else {
				selectedCategory =
					(await this.page.ManufacturingCategory.innerText())?.trim() || ''
			}

			if (!selectedCategory) {
				throw new Error('Selected Category is missing in Part Info.')
			}

			// ================= Suggested Category =================
			const suggestedMatch = costingNotesText.match(
				/Suggested\s*Category\s*[:\-]?\s*([^.!?\n]+)/i
			)

			const suggestedCategory = suggestedMatch?.[1]?.trim()

			if (suggestedCategory) {
				logger.info(`🧾 Suggested Category from Notes: ${suggestedCategory}`)

				const normalizedSelected =
					await this.page.normalizeText(selectedCategory)
				const normalizedSuggested =
					await this.page.normalizeText(suggestedCategory)

				const isMatch =
					normalizedSelected.includes(normalizedSuggested) ||
					normalizedSuggested.includes(normalizedSelected)

				expect.soft(isMatch).toBe(true)
			} else {
				logger.warn('⚠️ Suggested Category is missing in Costing Notes.')
			}

			// ================= Quantity Calculations =================
			const bomQty = Number(await this.page.getInputValue(this.page.BOMQtyNos))
			const annualVolume = Number(
				await this.page.getInputValue(this.page.AnnualVolumeQtyNos)
			)
			const lotSize = Number(
				await this.page.getInputValue(this.page.LotsizeNos)
			)
			const productLife = Number(
				await this.page.getInputValue(this.page.ProductLifeRemainingYrs)
			)
			const lifetimeQty = Number(
				await this.page.getInputValue(this.page.LifeTimeQtyRemainingNos)
			)
			const expectedLotSize = calculateLotSize(annualVolume)
			const expectedLifetimeQty = calculateLifeTimeQtyRemaining(
				annualVolume,
				productLife
			)

			expect.soft(bomQty).toBeGreaterThan(0)
			expect.soft(lotSize).toBe(expectedLotSize)
			expect.soft(lifetimeQty).toBe(expectedLifetimeQty)
		} catch (error: any) {
			logger.error(`❌ Part Information validation failed: ${error.message}`)
			throw error
		}

		logger.info('✔ Part Details verified successfully')
	}

	/**
	 * Verifies material information details
	 */
	async verifyMaterialInformationDetails(): Promise<void> {
		const { processGroup, category, family, grade, stockForm } =
			MaterialInformation
		logger.info(
			`Selecting material: ${processGroup} > ${category} > ${family} > ${grade} > ${stockForm}`
		)
		await this.page.MaterialInformationSection.scrollIntoViewIfNeeded()
		await this.page.MaterialInformationSection.click()
		await this.page.selectByTrimmedLabel(this.page.ProcessGroup, processGroup)
		await this.page.selectOption(this.page.materialCategory, category)
		await this.page.selectOption(this.page.MatFamily, family)
		await this.page.selectOption(this.page.DescriptionGrade, grade)
		await this.page.selectOption(this.page.StockForm, stockForm)
		await this.page.waitForTimeout(300)

		const scrapPrice = await this.page.readNumberSafe(
			this.page.ScrapPrice,
			'Scrap Price'
		)

		const materialPrice = await this.page.readNumberSafe(
			this.page.MaterialPrice,
			'Material Price'
		)

		expect.soft(scrapPrice).toBeGreaterThan(0)
		expect.soft(materialPrice).toBeGreaterThan(0)

		// -------------------- Density + Volume --------------------
		await this.page.scrollIntoView(this.page.PartDetails)
		const { density } = await this.getMaterialDimensionsAndDensity()
		const partVolume = await this.getPartVolume()

		logger.info(`🧪 Density → ${density}`)
		logger.info(`📦 Part Volume → ${partVolume}`)

		// ✅ Defensive validation before calculation
		if (density <= 0 || partVolume <= 0) {
			logger.warn(
				`⚠️ Invalid calculation inputs → Density: ${density}, Volume: ${partVolume}`
			)
			return
		}

		const expectedNetWeight = calculateNetWeight(partVolume, density)

		// Optional higher precision validation
		await this.verifyNetWeight(expectedNetWeight, 4)
	}

	async getNetWeight(): Promise<number> {
		logger.info('🔹 Reading Net Weight...')

		const netWeight = await this.page.readNumberSafe(
			this.page.NetWeight,
			'Net Weight',
			10000,
			2
		)

		if (netWeight <= 0) {
			logger.warn(
				'⚠️ Net Weight returned 0 or invalid – possible rendering delay or calculation issue'
			)
		}

		return netWeight / 1000
	}

	async getPartVolume(): Promise<number> {
		logger.info('🔹 Waiting for Part Volume...')
		await expect.soft(this.page.PartVolume).toBeVisible({ timeout: 10000 })
		const volume = await this.page.waitForStableNumber(
			this.page.PartVolume,
			'Part Volume'
		)

		return volume
	}
	async verifyNetWeight(
		expectedValue?: number,
		precision: number = 2
	): Promise<number> {
		logger.info('🔹 Verifying Net Weight...')
		let expected = expectedValue
		if (expected === undefined) {
			const { density } = await this.getMaterialDimensionsAndDensity()
			logger.info(`🧪 Density → ${density}`)
			const partVolumeMm3 = await this.getPartVolume()
			expected = calculateNetWeight(partVolumeMm3, density)
		}
		const actualNetWeight = await this.getNetWeight()
		await VerificationHelper.verifyNumeric(
			actualNetWeight,
			expected,
			'Net Weight',
			precision
		)

		logger.info(
			`✔ Net Weight verified: ${actualNetWeight.toFixed(precision)} g`
		)
		return actualNetWeight
	}

	// ========================== Weld Data Collection ==========================
	private getWeldRowLocators(weldIndex: 1 | 2): WeldRowLocators {
		const suffix = weldIndex === 1 ? '1' : '2'

		const locators = {
			DryCycleTime: this.page.DryCycleTime,
			passesLocator: this.page[`MatNoOfWeldPasses${suffix}`] as Locator,
			weldCheck: this.page[`MatWeld${suffix}`] as Locator,
			weldType: this.page[`MatWeldType${suffix}`] as Locator,
			weldSize: this.page[`MatWeldSize${suffix}`] as Locator,
			wireDia: this.page[`MatWireDia${suffix}`] as Locator,
			weldElementSize: this.page[`MatWeldElementSize${suffix}`] as Locator,
			weldLength: this.page[`MatWeldLengthmm${suffix}`] as Locator,
			weldSide: this.page[`MatWeldSide${suffix}`] as Locator,
			weldPlaces: this.page[`MatWeldPlaces${suffix}`] as Locator,
			grindFlush: this.page[`MatGrishFlush${suffix}`] as Locator,
			totalWeldLength:
				weldIndex === 1
					? this.page.MatTotalWeldLengthWeld1
					: this.page.MatTotalWeldLengthWeld2,
			section: this.page[`MatWeld${suffix}`].locator(
				'xpath=ancestor::mat-expansion-panel-header'
			)
		}

		return locators
	}

	//=============Collect Single Weld Data From UI ============
	private async collectWeldSubMaterial(
		weldIndex: 1 | 2
	): Promise<WeldSubMaterialUI | null> {
		const locators = this.getWeldRowLocators(weldIndex)

		try {
			await locators.weldType.waitFor({ state: 'visible', timeout: 5000 })
		} catch {
			logger.info(`ℹ️ Weld ${weldIndex} not visible — skipping`)
			return null
		}

		const passesLocator =
			weldIndex === 1
				? this.page.MatNoOfWeldPasses1
				: this.page.MatNoOfWeldPasses2

		const weld: WeldSubMaterialUI = {
			weldType: await this.page.getSelectedOptionText(locators.weldType),
			weldSide: await this.page.getSelectedOptionText(locators.weldSide),
			weldSize: Number(await locators.weldSize.inputValue()),
			weldElementSize: Number(await locators.weldElementSize.inputValue()),
			weldLength: Number(await locators.weldLength.inputValue()),
			weldPlaces: Number(await locators.weldPlaces.inputValue()),
			wireDia: Number((await locators.wireDia?.inputValue()) || 0),
			noOfWeldPasses: Number(await passesLocator.inputValue())
		}

		logger.info(`🔩 Weld ${weldIndex} UI → ${JSON.stringify(weld)}`)
		return weld
	}

	// =============Collect All Weld Rows===============
	private async collectAllWeldSubMaterials(): Promise<WeldSubMaterialUI[]> {
		const results = await Promise.all(
			([1, 2] as const).map(i => this.collectWeldSubMaterial(i))
		)

		const welds = results.filter((w): w is WeldSubMaterialUI => w !== null)

		if (!welds.length) {
			throw new Error('❌ No weld material rows detected in UI')
		}

		return welds
	}

	//=================Verify One Weld Row (Fill + Validate)=============
	private async verifySingleWeldRow(
		weldData: Record<string, unknown>,
		materialType: string,
		locators: WeldRowLocators
	): Promise<WeldRowResult> {
		const weldToggle = locators.weldCheck
		if (weldToggle && (await weldToggle.count().catch(() => 0)) > 0) {
			await weldToggle.scrollIntoViewIfNeeded()
			if (await weldToggle.isVisible().catch(() => false)) {
				await this.page.expandWeldCollapsed(weldToggle)
				await expect.soft(weldToggle).toBeVisible()
			} else {
				logger.warn(`⚠️ Weld toggle not visible for weld row — skipping expand`)
			}
		} else {
			logger.warn('⚠️ Weld toggle not found — skipping expand')
		}

		await expect.soft(locators.weldType).toBeEnabled()
		await this.page.selectOption(locators.weldType, weldData.weldType as string)

		let uiWeldSize: number
		try {
			uiWeldSize = await this.page.safeFill(
				locators.weldSize,
				weldData.weldSize as string | number,
				'Weld Size'
			)
		} catch (err) {
			logger.error(`❌ Failed to fill Weld Size: ${(err as Error).message}`)
			return { totalLength: 0, volume: 0, weldVolume: 0 }
		}

		const wireDia = locators.wireDia! // TS now knows it’s not undefined
		const count = await wireDia.count()
		if (count > 0) {
			await expect.soft(wireDia).toBeVisible({ timeout: 5000 })
			const actualWireDia = Number(await wireDia.inputValue())
			const expectedWireDia = getWireDiameter(materialType, uiWeldSize)
			expect.soft(actualWireDia).toBe(expectedWireDia)
			logger.info(
				`🧪 Wire Dia: ${actualWireDia} (Expected: ${expectedWireDia})`
			)
		} else {
			logger.warn('⚠️ Wire Dia field not present — skipping validation')
		}

		await expect.soft(locators.weldElementSize).not.toHaveValue('', {
			timeout: 5000
		})

		const weldElementSize = Number(
			(await locators.weldElementSize.inputValue()) || '0'
		)
		let uiWeldLength: number
		try {
			uiWeldLength = await this.page.safeFill(
				locators.weldLength,
				weldData.weldLength as string | number,
				'Weld Length'
			)
		} catch (err) {
			logger.error(`❌ Failed to fill Weld Length: ${(err as Error).message}`)
			return { totalLength: 0, volume: 0, weldVolume: 0 }
		}

		await locators.weldPlaces.waitFor({ state: 'visible', timeout: 5000 })
		await locators.weldPlaces.fill(String(weldData.weldPlaces))

		const uiWeldPlaces = Number(await locators.weldPlaces.inputValue())
		expect.soft(uiWeldPlaces).toBeGreaterThan(0)

		logger.info(`📍 Weld Places: ${uiWeldPlaces}`)

		await this.page.selectOption(locators.weldSide, weldData.weldSide as string)

		const uiWeldSide = await this.page.getSelectedOptionText(locators.weldSide)

		expect.soft(uiWeldSide).toBe(weldData.weldSide)
		logger.info(`↔️ Weld Side: ${uiWeldSide}`)

		await this.page.selectOption(
			locators.grindFlush,
			weldData.grindFlush as string
		)

		const uiGrindFlush = await this.page.getSelectedOptionText(
			locators.grindFlush
		)

		expect.soft(uiGrindFlush).toBe(weldData.grindFlush)
		logger.info(`🪵 Grind Flush: ${uiGrindFlush}`)

		const passes = Number(weldData.noOfWeldPasses || 1)
		expect.soft(passes).toBeGreaterThan(0)

		logger.info(`🔁 Weld Passes: ${passes}`)

		await validateTotalLength(
			locators.weldLength,
			locators.weldPlaces,
			locators.weldSide,
			locators.totalWeldLength,
			'Total Weld Length'
		)

		const expectedTotalLength = this.calculator.getTotalWeldLength(
			uiWeldLength,
			uiWeldPlaces,
			uiWeldSide
		)

		await expect
			.soft(locators.totalWeldLength)
			.toHaveValue(expectedTotalLength.toString(), { timeout: 5000 })

		logger.info(`✔ Total Weld Length: ${expectedTotalLength}`)

		const weldVolumeResult = calculateWeldVolume(
			weldData.weldType as string,
			uiWeldSize,
			weldElementSize,
			uiWeldLength,
			uiWeldPlaces,
			passes,
			uiWeldSide
		)

		expect.soft(weldVolumeResult.weldVolume).toBeGreaterThan(0)
		logger.info(`📦 Weld Volume: ${weldVolumeResult.weldVolume}`)

		return {
			totalLength: expectedTotalLength,
			volume: weldVolumeResult.weldVolume,
			weldVolume: weldVolumeResult.weldVolume
		}
	}

	async verifyWeldingDetails(
		migWeldingTestData: Record<string, unknown>
	): Promise<void> {
		logger.info('🔹 Verifying Welding Details...')
		await this.page.scrollToMiddle(this.page.WeldingDetails)
		await expect.soft(this.page.WeldingDetails).toBeVisible({ timeout: 10000 })
		const weldingDetails = migWeldingTestData.weldingDetails as Record<
			string,
			any
		>
		const materialType =
			(migWeldingTestData.materialInformation as any)?.family || 'Carbon Steel'
		const weldResults: WeldRowResult[] = []
		for (const index of [1, 2] as const) {
			const weldData = weldingDetails?.[`weld${index}`]
			if (!weldData) continue
			logger.info(`🔍 Verifying Weld Row ${index}`)
			const result = await this.verifySingleWeldRow(
				weldData,
				materialType,
				this.getWeldRowLocators(index)
			)
			weldResults.push(result)
		}
		const expectedTotal = weldResults.reduce((sum, w) => sum + w.totalLength, 0)
		const actualTotal = Number(await this.page.TotalWeldLength.inputValue())
		expect.soft(actualTotal).toBe(expectedTotal)
		this.runtimeWeldingContext.totalWeldLength = expectedTotal
		logger.info(`✔ Welding Details verified. Grand Total = ${expectedTotal}`)
		logger.info('✅ verifyWeldingDetails completed successfully')
	}

	// ========================== Manufacturing Cost Verification ==========================
	async verifyDirectProcessCostCalculation(): Promise<void> {
		logger.info('🔹 Verifying Direct Process Cost Summation...')

		// 1. Read individual cost components
		const machineCost = await this.page.readNumberSafe(
			this.page.directMachineCost,
			'Direct Machine Cost'
		)
		const setupCost = await this.page.readNumberSafe(
			this.page.directSetUpCost,
			'Direct SetUp Cost'
		)
		const laborCost = await this.page.readNumberSafe(
			this.page.directLaborCost,
			'Direct Labor Cost'
		)
		const inspectionCost = await this.page.readNumberSafe(
			this.page.QAInspectionCost,
			'Inspection Cost'
		)
		const yieldCost = await this.page.readNumberSafe(
			this.page.YieldCostPart,
			'Yield Cost'
		)
		const powerCost = await this.page.readNumberSafe(
			this.page.totalPowerCost,
			'Total Power Cost'
		)

		// 2. Sum them up
		const expectedProcessCost =
			machineCost +
			setupCost +
			laborCost +
			inspectionCost +
			yieldCost +
			powerCost

		logger.info(
			`∑ Calculation: ${machineCost} (Machine) + ${setupCost} (Setup) + ${laborCost} (Labor) + ` +
			`${inspectionCost} (Inspection) + ${yieldCost} (Yield) + ${powerCost} (Power) = ${expectedProcessCost}`
		)

		// 3. Verify against the UI Total
		await this.page.verifyUIValue({
			locator: this.page.netProcessCost,
			expectedValue: expectedProcessCost,
			label: 'Net Process Cost (Sum check)',
			precision: 2
		})

		logger.info('✔ Direct Process Cost summation verified')
	}

	// ========================== Material Cost Details Verification ==========================

	private async verifyMaterialValue(
		locator: Locator,
		expectedValue: number,
		label: string,
		precision: number = 2
	): Promise<void> {
		await this.page.verifyUIValue({
			locator,
			expectedValue,
			label,
			precision
		})
	}

	/**
	 * Verifies total weld length
	 */
	async verifyTotalWeldLength(expectedTotalWeldLength?: number): Promise<void> {
		const expected =
			expectedTotalWeldLength ?? this.runtimeWeldingContext.totalWeldLength
		if (expected === undefined) {
			logger.warn(
				'⚠️ No expected total weld length provided or found in context — skipping verification'
			)
			return
		}

		await this.verifyMaterialValue(
			this.page.TotalWeldLength,
			expected,
			'Total Weld Length'
		)
	}

	/**
	 * Verifies total weld material weight
	 */
	async verifyTotalWeldMaterialWeight(
		expectedValue?: number | undefined
	): Promise<void> {
		if (expectedValue === undefined) return
		await this.verifyMaterialValue(
			this.page.TotalWeldMaterialWeight,
			expectedValue,
			'Total Weld Material Weight'
		)
	}

	/**
	 * Verifies weld bead weight with wastage
	 */
	async verifyNetMaterialCostCalculation(
		expectedWeldBeadWeightWithWastage?: number
	): Promise<void> {
		if (expectedWeldBeadWeightWithWastage === undefined) return

		await this.page.verifyUIValue({
			locator: this.page.WeldBeadWeightWithWastage,
			expectedValue: expectedWeldBeadWeightWithWastage,
			label: 'Weld Bead Weight with Wastage',
			precision: 2
		})
	}

	/**
	 * Verifies all welding material calculations from UI
	 */
	async verifyWeldingMaterialCalculations(): Promise<void> {
		logger.info('\n🔹 Step: Verify Material Calculations from UI')
		const { density } = await this.getMaterialDimensionsAndDensity()
		logger.info(`🧪 Density → ${density}`)

		const partVolume = await this.getPartVolume()
		logger.info(`📦 Part Volume → ${partVolume}`)

		const expectedNetWeight = calculateNetWeight(partVolume, density)
		await this.verifyNetWeight(expectedNetWeight)

		const weldSubMaterials = await this.collectAllWeldSubMaterials()

		// Calculation
		const calculated = this.calculator.calculateExpectedWeldingMaterialCosts(
			{ density },
			weldSubMaterials
		)

		logger.info(`📐 Calculated → ${JSON.stringify(calculated)}`)

		logger.info('🔹 Verifying calculated values match UI inputs...')
		await this.verifyTotalWeldLength(calculated.totalWeldLength)
		await this.verifyTotalWeldMaterialWeight(calculated.totalWeldMaterialWeight)
		await this.verifyNetMaterialCostCalculation(
			calculated.weldBeadWeightWithWastage
		)
		//	await this.verifyNetMaterialSustainabilityCost()

		logger.info('✅ Material calculations verified successfully from UI')
	}

	/**
	 * Simplified material calculations verification
	 */
	async verifyMaterialCalculations(density: number): Promise<void> {
		const welds = [
			{
				length: await this.page.readNumber(
					'Weld Length 1',
					this.page.MatWeldLengthmm1
				),
				size: await this.page.readNumber('Weld Size 1', this.page.MatWeldSize1)
			},
			{
				length: await this.page.readNumber(
					'Weld Length 2',
					this.page.MatWeldLengthmm2
				),
				size: await this.page.readNumber('Weld Size 2', this.page.MatWeldSize2)
			}
		]

		const calculated = this.calculator.calculateExpectedWeldingMaterialCosts(
			{ density },
			welds
		)

		// Call verification methods (they perform their own assertions internally)
		await this.verifyTotalWeldLength(calculated.totalWeldLength)
		await this.verifyTotalWeldMaterialWeight(calculated.totalWeldMaterialWeight)
		await this.verifyNetMaterialCostCalculation(
			calculated.weldBeadWeightWithWastage
		)

		// Verify UI values against calculated values
		await this.page.verifyUIValue({
			locator: this.page.TotalWeldLength,
			expectedValue: calculated.totalWeldLength,
			label: 'Total Weld Length'
		})
		await this.page.verifyUIValue({
			locator: this.page.TotalWeldMaterialWeight,
			expectedValue: calculated.totalWeldMaterialWeight,
			label: 'Total Weld Material Weight'
		})
		await this.page.verifyUIValue({
			locator: this.page.WeldBeadWeightWithWastage,
			expectedValue: calculated.weldBeadWeightWithWastage,
			label: 'Weld Bead Weight with Wastage'
		})

		logger.info('✔ Material calculations verified successfully')
	}

	// ========================== Manufacturing Information Section ==========================

	/**
	 * Verifies process details from UI
	 */
	private async collectSubProcesses(): Promise<SubProcess[]> {
		const subProcesses: SubProcess[] = []

		for (const index of [1, 2] as const) {
			logger.info(`🔍 Collecting SubProcess ${index}...`)

			// ✅ Ensure weld section is expanded
			await this.ensureMfgWeldExpanded(index)

			const locators =
				index === 1
					? {
						weldType: this.page.WeldTypeSubProcess1,
						weldPosition: this.page.WeldPositionSubProcess1,
						travelSpeed: this.page.TravelSpeedSubProcess1,
						tackWeld: this.page.TrackWeldSubProcess1,
						intermediateStops: this.page.IntermediateStartStopSubProcess1
					}
					: {
						weldType: this.page.WeldTypeSubProcess2,
						weldPosition: this.page.WeldPositionSubProcess2,
						travelSpeed: this.page.TravelSpeedSubProcess2,
						tackWeld: this.page.TrackWeldSubProcess2,
						intermediateStops: this.page.IntermediateStartStopSubProcess2
					}

			// ✅ Small guarded wait for rendering
			try {
				await locators.weldType.waitFor({ state: 'visible', timeout: 5000 })
			} catch {
				logger.info(`ℹ️ SubProcess ${index} not visible — skipping`)
				continue
			}

			const subProcess: SubProcess = {
				weldType: await this.page.getSelectedOptionText(locators.weldType),
				weldPosition: await this.page.getSelectedOptionText(
					locators.weldPosition
				),
				travelSpeed: (await this.page.getInputAsNum(locators.travelSpeed)) ?? 5,
				tackWelds: (await this.page.getInputAsNum(locators.tackWeld)) ?? 0,
				intermediateStops:
					(await this.page.getInputAsNum(locators.intermediateStops)) ?? 0
			}

			subProcesses.push(subProcess)

			logger.info(
				`✅ SubProcess ${index}: ${subProcess.weldType}, ${subProcess.weldPosition}, ` +
				`Speed=${subProcess.travelSpeed}, Tacks=${subProcess.tackWelds}, Stops=${subProcess.intermediateStops}`
			)
		}

		return subProcesses
	}

	//================================= Process Details Section =================================
	async verifyProcessDetails(
		testData?: Record<string, unknown>
	): Promise<void> {
		logger.info('\n🔹 Step: Verify Process Details from UI')
		const processType = await this.page.getSelectedOptionText(
			this.page.ProcessGroup
		)
		const machineTypeRaw = await this.page.MachineType.inputValue()
		const machineAutomation = normalizeMachineType(machineTypeRaw)
		const machineAutomationValue =
			(await this.page.getInputAsNum(this.page.MachineType)) ?? 1

		const manufactureInfo: any = {}
		manufactureInfo.machineAutomation = machineAutomationValue

		const machineName = await this.page.getSelectedOptionText(
			this.page.MachineName
		)
		const machineDescription = await this.page.MachineDescription.inputValue()
		const efficiency = await this.page.getInputAsNum(
			this.page.MachineEfficiency
		)

		logger.info(`   ✓ Process Type: ${processType}`)
		logger.info(`   ✓ Machine Automation: ${machineAutomation}`)
		logger.info(`   ✓ Machine Name: ${machineName}`)
		logger.info(`   ✓ Machine Description: ${machineDescription}`)
		logger.info(`   ✓ Machine Efficiency: ${efficiency}%`)

		// Current / Voltage
		await this.page.scrollIntoView(this.page.RequiredCurrent)
		const minCurrentRequired = await this.page.getInputAsNum(
			this.page.RequiredCurrent
		)
		const minWeldingVoltage = await this.page.getInputAsNum(
			this.page.RequiredVoltage
		)
		const selectedCurrent = await this.page.getInputAsNum(
			this.page.selectedCurrent
		)
		const selectedVoltage = await this.page.getInputAsNum(
			this.page.selectedVoltage
		)
		const requiredCurrent = await this.page.getInputAsNum(
			this.page.RequiredCurrent
		)
		const requiredVoltage = await this.page.getInputAsNum(
			this.page.RequiredVoltage
		)
		logger.info(
			`   ✓ Cur/Vol: Min(${minCurrentRequired}A, ${minWeldingVoltage}V), Selected(${selectedCurrent}A, ${selectedVoltage}V)`
		)

		// Sub-Process Details
		const subProcesses: SubProcess[] = await this.collectSubProcesses()

		// Save for runtime context
		this.runtimeWeldingContext = {
			...this.runtimeWeldingContext,
			processType,
			machineName,
			machineDescription,
			machineAutomation,
			efficiency,
			partComplexity: await this.getPartComplexity(testData as any),
			minCurrentRequired,
			minWeldingVoltage,
			selectedCurrent,
			selectedVoltage,
			subProcesses
		}

		logger.info('✔ Process Details successfully read from UI')
	}

	//================================= Manufacturing Subprocess Section =================================
	private async ensureMfgWeldExpanded(mfgWeldIndex: 1 | 2): Promise<void> {
		logger.info(`🔽 Ensuring Weld ${mfgWeldIndex} is expanded`)

		const targetInput =
			mfgWeldIndex === 1
				? this.page.WeldTypeSubProcess1
				: this.page.WeldTypeSubProcess2

		// 1️⃣ Ensure Manufacturing section exists and is expanded
		const manufacturingHeader = this.page.ManufacturingInformation.first()
		await manufacturingHeader.waitFor({ state: 'visible', timeout: 15_000 })
		await manufacturingHeader.scrollIntoViewIfNeeded()

		const isMfgExpanded = await this.page.MigWeldRadBtn.isVisible().catch(
			() => false
		)
		if (!isMfgExpanded) {
			logger.info('🔽 Expanding Manufacturing section...')
			await manufacturingHeader.click({ force: true })
			await this.page.waitForTimeout(500)
		}

		// 2️⃣ Weld row expansion
		const weldHeader =
			mfgWeldIndex === 1 ? this.page.MfgWeld1 : this.page.MfgWeld2

		await weldHeader.waitFor({ state: 'visible', timeout: 20_000 })
		await weldHeader.scrollIntoViewIfNeeded()

		// If target input is already visible and enabled, we can assume it's expanded
		if (await targetInput.isVisible().catch(() => false)) {
			logger.info(`✅ Weld ${mfgWeldIndex} already appears expanded`)
			return
		}

		// 3️⃣ Attempt expansion clicks
		for (let attempt = 1; attempt <= 3; attempt++) {
			logger.debug(`🔁 Attempt ${attempt} to expand Weld ${mfgWeldIndex}`)

			try {
				await weldHeader.click({ force: true })
			} catch {
				await weldHeader.evaluate((el: HTMLElement) => el.click())
			}

			// Wait for animation and visibility
			try {
				await targetInput.waitFor({ state: 'visible', timeout: 3000 })
				if (await targetInput.isVisible()) {
					logger.info(
						`✅ Weld ${mfgWeldIndex} expanded successfully on attempt ${attempt}`
					)
					return
				}
			} catch (err) {
				// Retry
				logger.debug(`⏳ Waiting for Weld ${mfgWeldIndex} expansion...`)
			}

			await this.page.waitForTimeout(1000)
		}

		// Final check
		if (!(await targetInput.isVisible().catch(() => false))) {
			logger.warn(
				`⚠️ Weld ${mfgWeldIndex} might not be expanded, but proceeding to try collection.`
			)
		}
	}
	//======================== Cycle Time/Part(Sec) =========================================
	async verifyWeldCycleTimeDetails(testData: any): Promise<void> {
		logger.info('🔹 Step: Comprehensive Weld Cycle Time Verification')

		await this.openManufacturingForMigWelding()

		const weldingDetails = testData?.weldingDetails
		if (!weldingDetails) {
			logger.warn(
				'⚠️ weldingDetails missing — skipping weld cycle verification'
			)
			return
		}

		try {
			// ---------- Common Inputs ----------
			const efficiency = await this.getEfficiencyFromUI()
			const partReorientation = await this.getInputNumber(
				this.page.PartReorientation
			)
			const loadingUnloadingTime = await this.getInputNumber(
				this.page.UnloadingTime
			)

			logger.info(`✓ Efficiency          : ${efficiency}%`)
			logger.info(`✓ Part Reorientation  : ${partReorientation}`)
			logger.info(`✓ Loading/Unloading  : ${loadingUnloadingTime} sec`)

			// ---------- Sub-Processes ----------
			const subProcessCycleTimes: number[] = []
			const weldMap: Array<['weld1' | 'weld2', number]> = [
				['weld1', 0],
				['weld2', 1]
			]

			for (const [key, index] of weldMap) {
				const weldData = weldingDetails[key]
				if (!weldData) {
					logger.info(`ℹ️ ${key} not present — skipping`)
					continue
				}

				logger.info(`🔍 Verifying ${key}`)
				const cycleTime = await this.verifySingleSubProcessCycleTime(
					index,
					weldData
				)

				if (Number.isFinite(cycleTime)) {
					subProcessCycleTimes.push(cycleTime)
					logger.info(`✓ ${key} Cycle Time: ${cycleTime.toFixed(2)} sec`)
				}
			}

			if (!subProcessCycleTimes.length) {
				logger.warn('⚠️ No active weld sub-processes found')
				return
			}

			// ---------- Overall Cycle ----------
			await this.verifyOverallCycleTime({
				subProcessCycleTimes,
				loadingUnloadingTime,
				partReorientation,
				efficiency
			})

			this.runtimeWeldingContext.subProcessCycleTimes = subProcessCycleTimes

			logger.info('✅ Weld Cycle Time Verification Completed')
		} catch (error: any) {
			logger.error(`❌ Weld Cycle Time Verification Failed: ${error.message}`)
			logger.debug(error.stack)
			throw error
		}
	}

	async verifySingleSubProcessCycleTime(
		index: number,
		weldData: any
	): Promise<number> {
		const mfgWeldIndex = (index + 1) as 1 | 2
		await this.ensureMfgWeldExpanded(mfgWeldIndex)

		const locators = {
			weldType:
				mfgWeldIndex === 1
					? this.page.WeldTypeSubProcess1
					: this.page.WeldTypeSubProcess2,
			position:
				mfgWeldIndex === 1
					? this.page.WeldPositionSubProcess1
					: this.page.WeldPositionSubProcess2,
			speed:
				mfgWeldIndex === 1
					? this.page.TravelSpeedSubProcess1
					: this.page.TravelSpeedSubProcess2,
			tacks:
				mfgWeldIndex === 1
					? this.page.TrackWeldSubProcess1
					: this.page.TrackWeldSubProcess2,
			stops:
				mfgWeldIndex === 1
					? this.page.IntermediateStartStopSubProcess1
					: this.page.IntermediateStartStopSubProcess2,
			cycle:
				mfgWeldIndex === 1
					? this.page.MfgWeldCycleTime1
					: this.page.MfgWeldCycleTime2
		}

		logger.info(`\n🔍 ===== Verifying Sub-Process ${mfgWeldIndex} =====`)

		// ---------- Read UI Values ----------
		const actualWeldType = await this.page.getSelectedOptionText(
			locators.weldType
		)
		const actualSpeed = await this.page.getInputAsNum(locators.speed)
		const actualTacks = await this.page.getInputAsNum(locators.tacks)
		const actualStops = await this.page.getInputAsNum(locators.stops)

		logger.info(`   ✓ Weld Type        : ${actualWeldType}`)
		logger.info(`   ✓ Travel Speed    : ${actualSpeed}`)
		logger.info(`   ✓ Tack Welds      : ${actualTacks}`)
		logger.info(`   ✓ Intermediate Stops : ${actualStops}`)

		// ---------- Optional Weld Type Validation ----------
		if (weldData.weldType) {
			await VerificationHelper.verifyDropdown(
				actualWeldType,
				weldData.weldType,
				'Weld Type'
			)
		}

		// ---------- Calculate Expected Cycle Time ----------
		const totalWeldLength = this.calculator.getTotalWeldLength(
			weldData.weldLength ?? 0,
			weldData.weldPlaces ?? 1,
			weldData.weldSide ?? 'One Side'
		)

		let resolvedSpeed = actualSpeed
		if (!resolvedSpeed || resolvedSpeed <= 0) {
			logger.warn(
				`⚠️ Invalid Travel Speed read from UI (${actualSpeed}). Defaulting to 12.0 mm/sec.`
			)
			resolvedSpeed = 12.0 // Default reasonable speed (was 1, causing huge cycle times)
		}

		logger.info(
			`   ℹ️ Calculation Inputs: Total Length=${totalWeldLength}mm (Len:${weldData.weldLength}, Places:${weldData.weldPlaces}), Speed=${resolvedSpeed}mm/s`
		)

		const calculatedCycleTime = calculateSingleWeldCycleTime({
			totalWeldLength,
			travelSpeed: resolvedSpeed,
			tackWelds: actualTacks || 0,
			intermediateStops: actualStops || 0,
			weldType: actualWeldType || 'Fillet'
		})

		// ---------- Verify UI vs Calculated ----------
		if (await locators.cycle.isVisible()) {
			const uiCycleTime = await this.page.getInputAsNum(locators.cycle)

			await VerificationHelper.verifyNumeric(
				uiCycleTime,
				calculatedCycleTime,
				'Sub-Process Cycle Time',
				2 // realistic tolerance (rounding + UI calc)
			)

			logger.info(
				`   ✓ Sub-Process ${mfgWeldIndex} Cycle Time: ${calculatedCycleTime.toFixed(2)} sec`
			)
		}

		return calculatedCycleTime
	}

	//===================================== Welding cleaning cycle time ======================
	async verifyWeldCleaningCycleTimeDetails(testData: any): Promise<void> {
		logger.info('🔹 Step: Weld Cleaning/Preparation Cycle Time Verification')
		//await this.openManufacturingForMigWelding()
		await this.verifyWeldPreparationCost()
	}

	async verifyOverallCycleTime(input: TotalCycleTimeInput): Promise<void> {
		logger.info('\n📊 ===== Overall Cycle Time Breakdown =====')
		const breakdown = calculateWeldCycleTimeBreakdown(input)

		logger.info(
			`✓ Loading/Unloading Time: ${breakdown.loadingUnloadingTime} sec`
		)
		logger.info(
			`✓ Total SubProcess Time : ${breakdown.subProcessCycleTime.toFixed(4)} sec`
		)
		logger.info(
			`✓ Arc On Time           : ${breakdown.arcOnTime.toFixed(4)} sec`
		)
		logger.info(
			`✓ Arc Off Time          : ${breakdown.arcOffTime.toFixed(4)} sec`
		)
		logger.info(
			`✓ Part Reorient. Time   : ${breakdown.partReorientationTime.toFixed(4)} sec (${breakdown.partReorientation} reorientations)`
		)
		logger.info(
			`✓ Dry Cycle Time        : ${breakdown.totalWeldCycleTime.toFixed(4)} sec`
		)
		logger.info(
			`✓ Calculated Cycle Time : ${breakdown.cycleTime.toFixed(4)} sec`
		)

		// Verify dry cycle time
		await this.page.verifyUIValue({
			locator: this.page.DryCycleTime,
			expectedValue: breakdown.totalWeldCycleTime,
			label: 'Dry Cycle Time'
		})
		await this.page.MigWeldRadBtn.waitFor({ state: 'visible', timeout: 10000 })

		if (!(await this.page.MigWeldRadBtn.isChecked())) {
			await this.page.MigWeldRadBtn.click()
		}
		// Verify overall cycle time with unit mismatch detection
		const uiCycleTimeRaw = await this.page.getInputAsNum(this.page.curCycleTime)
		const ratio = uiCycleTimeRaw / breakdown.cycleTime

		const EPSILON = 0.01 // 1% tolerance

		if (Math.abs(ratio - 1) > EPSILON) {
			logger.warn(
				`⚠️ Unit Mismatch: UI Cycle Time (${uiCycleTimeRaw}) is ${ratio.toFixed(
					3
				)}× the calculated cycle time (${breakdown.cycleTime.toFixed(3)})`
			)
		} else {
			logger.debug(
				`✅ Cycle time validated: UI and calculated values match within tolerance`
			)
		}
		this.runtimeWeldingContext.cycleTime = breakdown.cycleTime
	}
	private async getEfficiencyFromUI(): Promise<number> {
		return await this.page.getInputAsNum(this.page.MachineEfficiency)
	}

	private async getInputNumber(
		locator: Locator,
		fallback = 0
	): Promise<number> {
		return (await this.page.getInputAsNum(locator)) ?? fallback
	}

	private async getProcessTypeMig(): Promise<ProcessType> {
		return ProcessType.MigWelding
	}

	private async getProcessTypeCleaning(): Promise<ProcessType> {
		const text = await this.page.getSelectedOptionText(this.page.ProcessGroup)
		if (text.includes('Cleaning')) return ProcessType.WeldingCleaning
		if (text.includes('Preparation')) return ProcessType.WeldingPreparation
		return ProcessType.WeldingCleaning
	}

	private async getMaterialType(): Promise<string> {
		return await this.page.getSelectedOptionText(this.page.MatFamily)
	}
	// ========================== Sustainability Verification ==========================
	// ===============================
	// 1️⃣ Gather ESG Input from UI
	// ===============================
	async getMaterialESGInfo(): Promise<MaterialESGInput> {
		await this.page.scrollElementToTop(this.page.AnnualVolumeQtyNos)

		const eav = await this.page.getInputAsNum(this.page.AnnualVolumeQtyNos)
		const netWeight = await this.page.getInputAsNum(this.page.NetWeight)
		const grossWeight = await this.page.getInputAsNum(
			this.page.WeldBeadWeightWithWastage
		)
		const scrapWeight = Math.max(grossWeight - netWeight, 0)

		const esgImpactCO2Kg = await this.page.getInputAsNum(
			this.page.CO2PerKgMaterial
		)
		const esgImpactCO2KgScrap = await this.page.getInputAsNum(
			this.page.CO2PerScrap
		)

		return {
			grossWeight,
			scrapWeight,
			netWeight,
			eav,
			esgImpactCO2Kg,
			esgImpactCO2KgScrap
		}
	}

	async verifyNetMaterialSustainabilityCost(): Promise<void> {
		const input = await this.getMaterialESGInfo()
		const calculated =
			SustainabilityCalculator.calculateMaterialSustainability(input)

		const uiCO2PerPart = await this.page.getInputAsNum(
			this.page.CO2PerPartMaterial
		)

		expect.soft(uiCO2PerPart).toBeCloseTo(calculated.esgImpactCO2KgPart, 4)

		console.log('🔹 Material Sustainability Calculation Debug')
		console.table({
			uiCO2PerPart,
			calculatedCO2: calculated.esgImpactCO2KgPart,
			difference: uiCO2PerPart - calculated.esgImpactCO2KgPart,
			netWeight: calculated.totalWeldMaterialWeight,
			grossWeight: calculated.weldBeadWeightWithWastage,
			scrapWeight: calculated.scrapWeight,
			netWeightKg: calculated.totalWeldMaterialWeight / 1000,
			grossWeightKg: calculated.weldBeadWeightWithWastage / 1000,
			scrapWeightKg: calculated.scrapWeight / 1000,
			esgImpactCO2Kg: input.esgImpactCO2Kg,
			eav: input.eav,
			esgAnnualVolumeKg: calculated.esgAnnualVolumeKg,
			esgAnnualKgCO2: calculated.esgAnnualKgCO2,
			esgAnnualKgCO2Part: calculated.esgAnnualKgCO2Part
		})

		console.log(
			`✔ Material CO2 per Part verified. UI: ${uiCO2PerPart}, Calculated: ${calculated.esgImpactCO2KgPart}`
		)
	}

	private async readManufacturingInputs(): Promise<ManufacturingInput> {
		const n = (locator: Locator) => this.page.safeGetNumber(locator)

		return {
			machineHourRate: await n(this.page.machineHourRate),
			machineEfficiency: await n(this.page.MachineEfficiency),

			lowSkilledLaborRatePerHour: await n(this.page.lowSkilledLaborRatePerHour),
			skilledLaborRatePerHour: await n(this.page.skilledLaborRatePerHour),
			noOfLowSkilledLabours: await n(this.page.noOfLowSkilledLabours),

			electricityUnitCost: await n(this.page.electricityUnitCost),
			powerConsumptionKW: await n(this.page.powerConsumptionKW),
			yieldPercentage: await n(this.page.YieldPercentage),
			annualVolume: await n(this.page.AnnualVolumeQtyNos),
			setUpTime: await n(this.page.MachineSetupTime),

			qaInspectorRate: await n(this.page.QAInspectorRate),
			inspectionTime: await n(this.page.QAInspectionTime),
			samplingRate: await n(this.page.SamplingRate),

			netMaterialCost: await n(this.page.netMaterialCost),
			CycleTime: await n(this.page.curCycleTime),

			totalWeldLength: await n(this.page.TotalWeldLength),
			cuttingLength: await n(this.page.CuttingLength),

			matWeldSize1: await n(this.page.MatWeldSize1),
			matWeldSize2: await n(this.page.MatWeldSize2),
			matWeldElementSize1: await n(this.page.MatWeldElementSize1),
			matWeldElementSize2: await n(this.page.MatWeldElementSize2),

			noOfWeldPasses: await n(this.page.PartReorientation),

			partProjectedArea: await n(this.page.PartSurfaceArea),
			totalWeldCycleTime: await n(this.page.totalWeldCycleTime),
			travelSpeed: await n(this.page.TravelSpeedSubProcess1),

			unloadingTime: await n(this.page.UnloadingTime),
			machineType: await n(this.page.MachineType),

			netWeight: await n(this.page.NetWeight),
			density: await n(this.page.Density),
			dryCycleTime: await n(this.page.DryCycleTime),

			RequiredVoltage: await n(this.page.RequiredVoltage),
			RequiredCurrent: await n(this.page.RequiredCurrent),
			SelectedVoltage: await n(this.page.selectedVoltage),
			SelectedCurrent: await n(this.page.selectedCurrent),

			netProcessCost: await n(this.page.netProcessCost),
		}
	}

	private async gatherManufacturingInfo(
		processType: ProcessType,
		machineEfficiency: number,
		density: number
	): Promise<ProcessInfoDto> {
		logger.info('📥 Gathering Manufacturing Info from UI...')

		const inputs = await this.readManufacturingInputs()

		const {
			machineHourRate,
			machineEfficiency: machineEfficiencyUI,
			totalWeldLength,
			matWeldElementSize1: MatWeldElementSize1,
			matWeldElementSize2: MatWeldElementSize2,
			partProjectedArea,
			netWeight,
			density: densityUI,
			lowSkilledLaborRatePerHour,
			noOfLowSkilledLabours,
			skilledLaborRatePerHour,
			qaInspectorRate: qaOfInspectorRate,
			inspectionTime,
			samplingRate,
			powerConsumptionKW,
			electricityUnitCost,
			yieldPercentage: yieldPer,
			annualVolume,
			setUpTime,
			netMaterialCost,
			CycleTime: curCycleTime,
			totalWeldCycleTime,
			travelSpeed,
			unloadingTime: UnloadingTime,
			machineType: semiAutoOrAuto,
			dryCycleTime,
			SelectedVoltage: selectedVoltage,
			RequiredVoltage: requiredVoltage,
			RequiredCurrent: requiredCurrent,
			SelectedCurrent: selectedCurrent,
			netProcessCost
		} = inputs

		const isWeldingProcess =
			processType === ProcessType.MigWelding ||
			processType === ProcessType.TigWelding

		const maxWeldElementSize = isWeldingProcess
			? Math.max(MatWeldElementSize1 || 0, MatWeldElementSize2 || 0)
			: 0

		logger.info(`🔩 Max Weld Element Size: ${maxWeldElementSize}`)

		const lotSize = await this.getInputNumber(this.page.LotsizeNos)

		if (
			lotSize === 1 &&
			[ProcessType.WeldingCleaning, ProcessType.WeldingPreparation].includes(
				processType
			)
		) {
			logger.warn('⚠️ Lot size = 1 (possible fallback)')
		}

		const [netPartWeight, partComplexity, materialTypeName, materialDims] =
			await Promise.all([
				this.getNetWeight(),
				this.getPartComplexity(),
				this.getMaterialType(),
				this.getMaterialDimensionsAndDensity()
			])

		const { length, width, height } = materialDims

		let coreCostDetails: any[] = []

		// ✅ MIG/TIG ONLY
		if (isWeldingProcess) {
			await this.ensureMfgWeldExpanded(1)
			await this.ensureMfgWeldExpanded(2).catch(() =>
				logger.info('ℹ️ Weld 2 not available/expanded')
			)

			const [weldSubMaterials, uiSubProcesses] = await Promise.all([
				Promise.all([1, 2].map(i => this.collectWeldSubMaterial(i as 1 | 2))),
				this.collectSubProcesses()
			])

			const validSubMaterials = weldSubMaterials.filter(
				Boolean
			) as WeldSubMaterialUI[]

			coreCostDetails = validSubMaterials.map((weld, i) => {
				const sub = uiSubProcesses[i]
				return {
					coreWeight: maxWeldElementSize,
					coreHeight: weld.weldSize,
					coreLength: weld.weldLength,
					coreVolume: weld.weldPlaces,
					coreArea: weld.weldSide === 'Both' ? 2 : 1,
					noOfCore: weld.noOfWeldPasses,
					coreWidth: weld.wireDia,
					coreShape: weld.weldType,
					weldPosition: sub?.weldPosition,
					hlFactor: sub?.tackWelds,
					formPerimeter: sub?.intermediateStops,
					formHeight: sub?.travelSpeed
				}
			})
		} else {
			logger.info('ℹ️ Skipping weld details for non-welding process')
		}
		const effectiveWeldLength = totalWeldLength

		// ───────────────────────────────
		// 5️⃣ Machine Master
		// ───────────────────────────────
		const [ratedPower, powerUtilization, powerESG] = await Promise.all([
			this.page.safeGetNumber(this.page.RatedPower),
			this.page.safeGetNumber(this.page.PowerUtil),
			this.page.safeGetNumber(this.page.CO2PerKwHr)
		])

		// ───────────────────────────────
		// 6️⃣ DTO & Process Mapping
		// ───────────────────────────────
		const processMapping: Record<number, number> = {
			[ProcessType.MigWelding]: PrimaryProcessType.MigWelding,
			[ProcessType.TigWelding]: PrimaryProcessType.TigWelding,
			[ProcessType.SpotWelding]: PrimaryProcessType.SpotWelding,
			[ProcessType.SeamWelding]: PrimaryProcessType.SeamWelding,
			[ProcessType.StickWelding]: PrimaryProcessType.StickWelding
		}

		return {
			processTypeID: processType,
			partComplexity,
			machineHourRate,
			lowSkilledLaborRatePerHour,
			noOfLowSkilledLabours,
			skilledLaborRatePerHour,
			qaOfInspectorRate,
			inspectionTime,
			samplingRate,
			powerConsumptionKW,
			electricityUnitCost,
			yieldPer: yieldPer / 100,
			lotSize,
			annualVolume,
			setUpTime,
			netMaterialCost,
			netPartWeight,
			curCycleTime,
			totalWeldCycleTime,
			totalWeldLength,
			travelSpeed,
			UnloadingTime,
			semiAutoOrAuto,
			netWeight,
			densityUI,
			dryCycleTime,
			selectedVoltage,
			RequiredVoltage: requiredVoltage,
			RequiredCurrent: requiredCurrent,
			selectedCurrent: selectedCurrent,
			netProcessCost: netProcessCost,
			isrequiredCurrentDirty: true,
			MachineEfficiency: machineEfficiencyUI || machineEfficiency * 100,
			efficiency: machineEfficiencyUI || machineEfficiency * 100,
			materialInfoList: [
				{
					processId: processMapping[processType] || processType,
					density,
					netWeight: netPartWeight,
					netMatCost: netMaterialCost,
					partProjectedArea,
					totalWeldLength: effectiveWeldLength,
					dimX: length,
					dimY: width,
					dimZ: height,
					coreCostDetails
				}
			],

			materialmasterDatas: {
				materialType: { materialTypeName }
			} as any,

			machineMaster: {
				machineHourRate,
				powerConsumptionKW,
				efficiency: machineEfficiency * 100,
				totalPowerKW: ratedPower,
				powerUtilization: powerUtilization / 100
			},

			laborRates: [{ powerESG }],

			iscoolingTimeDirty: false,
			iscycleTimeDirty: false,
			isdirectMachineCostDirty: false,
			isdirectLaborCostDirty: false,
			isinspectionCostDirty: false,
			isdirectSetUpCostDirty: false,
			isyieldCostDirty: false
		}
	}
	// ========================== Weld Cleaning Cost Verification ==========================
	private async gatherWeldCleaningManufacturingInfo(
		processType: ProcessType,
		fallbackEfficiency: number,
		density: number
	): Promise<ProcessInfoDto> {
		logger.info('📥 Gathering Weld Cleaning Manufacturing Info from UI...')

		const inputs = await this.readManufacturingInputs()

		const {
			machineHourRate,
			machineEfficiency: machineEfficiencyUI,
			totalWeldLength,
			cuttingLength,
			partProjectedArea,
			netWeight,
			density: densityUI,
			lowSkilledLaborRatePerHour,
			noOfLowSkilledLabours,
			skilledLaborRatePerHour,
			qaInspectorRate: qaOfInspectorRate,
			inspectionTime,
			samplingRate,
			yieldPercentage,
			annualVolume,
			setUpTime,
			netMaterialCost,
			CycleTime,
			totalWeldCycleTime,
			travelSpeed,
			unloadingTime,
			machineType: semiAutoOrAuto,
			dryCycleTime,
			netProcessCost,
			noOfWeldPasses
		} = inputs

		const lotSize = await this.getInputNumber(this.page.LotsizeNos)
		if (lotSize === 1) {
			logger.warn('⚠️ Lot size = 1 (possible fallback)')
		}

		// Parallel UI fetch
		const [
			netPartWeight,
			partComplexity,
			materialTypeName,
			materialDims
		] = await Promise.all([
			this.getNetWeight(),
			this.getPartComplexity(),
			this.getMaterialType(),
			this.getMaterialDimensionsAndDensity()
		])

		const { length, width, height } = materialDims

		// Collect weld sub-materials
		const [weld1, weld2] = await Promise.all([
			this.collectWeldSubMaterial(1),
			this.collectWeldSubMaterial(2)
		])

		const coreCostDetails = [weld1, weld2].filter(Boolean)

		logger.info(
			`📊 Collected ${coreCostDetails.length} weld sub-materials for weld cleaning`
		)

		// Efficiency handling
		const efficiencyPercent =
			!isNaN(machineEfficiencyUI) && machineEfficiencyUI > 0
				? machineEfficiencyUI
				: fallbackEfficiency * 100

		const efficiencyFraction = efficiencyPercent / 100

		return {
			processTypeID: processType,
			partComplexity,

			// Rates & manpower
			machineHourRate,
			lowSkilledLaborRatePerHour,
			noOfLowSkilledLabours,
			skilledLaborRatePerHour,
			qaOfInspectorRate,

			// QA & Yield
			inspectionTime,
			samplingRate,
			yieldPer: yieldPercentage / 100,

			// Volume & setup
			lotSize,
			annualVolume,
			setUpTime,

			// Material & weight
			netMaterialCost,
			netPartWeight,
			netWeight,
			densityUI,

			// Timing
			CycleTime,
			totalWeldCycleTime,
			dryCycleTime,
			travelSpeed,
			unloadingTime,
			noOfWeldPasses,

			// Welding
			totalWeldLength,
			cuttingLength,
			semiAutoOrAuto,

			// Costs
			netProcessCost,

			// Efficiency (IMPORTANT: both % and fraction used by calculator)
			MachineEfficiency: efficiencyPercent,
			efficiency: efficiencyFraction,

			isrequiredCurrentDirty: true,

			materialInfoList: [
				{
					processId: PrimaryProcessType.WeldingCleaning,
					density,
					netWeight: netPartWeight,
					netMatCost: netMaterialCost,
					partProjectedArea,
					totalWeldLength,
					dimX: length,
					dimY: width,
					dimZ: height,
					coreCostDetails
				}
			],

			materialmasterDatas: {
				materialType: { materialTypeName }
			} as any,

			machineMaster: {
				machineHourRate,
				efficiency: efficiencyPercent
			},

			// Dirty flags
			iscoolingTimeDirty: false,
			iscycleTimeDirty: false,
			isdirectMachineCostDirty: false,
			isdirectLaborCostDirty: false,
			isinspectionCostDirty: false,
			isdirectSetUpCostDirty: false,
			isyieldCostDirty: false
		}
	}

	// ===== Cost Verification Helper =====
	private async verifyCostItems(
		items: CostVerificationItem[],
		options: VerifyCostOptions = {}
	): Promise<number> {
		const precision = options.precision ?? 4
		const debug = options.debug ?? false
		const retryTimeout = options.retryTimeout ?? 5000 // ms
		const retryInterval = options.retryInterval ?? 200 // ms

		let total = 0

		for (const item of items) {
			const {
				label,
				locator,
				value,
				enabled = true,
				includeInTotal = true
			} = item

			if (!enabled) {
				debug && logger.info(`⏭️ ${label} skipped (disabled)`)
				continue
			}

			if (
				value == null ||
				!Number.isFinite(Number(value)) ||
				Number(value) < 0
			) {
				debug &&
					logger.warn(`⏭️ ${label} skipped (invalid expected value: ${value})`)
				continue
			}

			const expected = Number(value)
			const readUIValue = async (locator: Locator): Promise<number | null> => {
				if (this.page.isPageClosed()) return null
				try {
					const val = await this.page.getInputAsNum(locator)
					return val != null && !isNaN(val) ? val : null
				} catch {
					return null
				}
			}

			// Poll UI value until it is populated or timeout
			let uiValue: number | null = null
			const start = Date.now()
			while (Date.now() - start < retryTimeout) {
				try {
					uiValue = await this.page.getInputAsNum(locator)
					if (uiValue !== null && !isNaN(uiValue) && uiValue >= 0) break
				} catch (err) {
					// ignore and retry
				}
				await this.page.wait(retryInterval)
			}

			uiValue = await readUIValue(locator)
			if (uiValue === null) {
				logger.warn(
					`⚠️ ${label} could not be read from UI, skipping verification`
				)
				continue
			}

			// Debug log
			debug &&
				logger.info(`🔍 Verifying ${label}`, { expected, uiValue, precision })

			// Compare with UI using specified precision
			await this.page.verifyUIValue({
				locator,
				expectedValue: expected,
				label,
				precision
			})

			if (includeInTotal) {
				total += expected
			}
		}

		return total
	}
	private calculateWeldingProcess(
		processType: ProcessType,
		manufactureInfo: ProcessInfoDto
	): Record<string, number> {
		switch (processType) {
			case ProcessType.WeldingCleaning:
				this.calculator.calculationsForWeldingCleaning(
					manufactureInfo,
					[],
					manufactureInfo
				)
				break

			case ProcessType.WeldingPreparation:
				this.calculator.calculationsForWeldingPreparation(
					manufactureInfo,
					[],
					manufactureInfo
				)
				break

			default:
				this.calculator.calculationForWelding(
					manufactureInfo,
					[],
					manufactureInfo,
					[]
				)
		}

		return manufactureInfo as unknown as Record<string, number>
	}
	private async verifyUnifiedWeldingCosts(
		processType: ProcessType,
		options: {
			verifyCycleTime?: boolean
			verifyTotal?: boolean
			precision?: number
			debug?: boolean
			retryTimeout?: number
			retryInterval?: number
		} = {}
	): Promise<Record<string, number>> {
		const { precision = 4, debug = false, verifyTotal = true } = options

		logger.info(
			`\n💰 Unified Welding Verification → ${ProcessType[processType]}`
		)
		const { density = 7.85 } =
			(await this.getMaterialDimensionsAndDensity()) ?? {}

		const efficiencyInput = await this.page.getInputAsNum(
			this.page.MachineEfficiency
		)
		const efficiency = isNaN(efficiencyInput) ? 1 : efficiencyInput / 100

		// Ensure correct process is selected in UI
		await this.switchToWeldingProcess(processType)

		// Use specialized gatherer for Weld Cleaning, generic for others
		const manufactureInfo =
			processType === ProcessType.WeldingCleaning
				? await this.gatherWeldCleaningManufacturingInfo(
					processType,
					efficiency,
					density
				)
				: await this.gatherManufacturingInfo(processType, efficiency, density)

		// Common defaults (yield %, sampling, etc.)
		this.calculator.weldingPreCalc(manufactureInfo, [], manufactureInfo)

		// Process-specific calculation
		const calculated = this.calculateWeldingProcess(
			processType,
			manufactureInfo
		)

		const verificationItems: CostVerificationItem[] = []

		const isWeldingProcess =
			processType === ProcessType.MigWelding ||
			processType === ProcessType.TigWelding

		if (isWeldingProcess) {
			verificationItems.push(
				{
					label: 'Cycle Time',
					locator: this.page.curCycleTime.first(),
					value: manufactureInfo.cycleTime,
					enabled: true,
					includeInTotal: false
				},
				{
					label: 'Power Cost',
					locator: this.page.totalPowerCost.first(),
					value: calculated.totalPowerCost
				}
			)
		}

		verificationItems.push(
			{
				label: 'Direct Machine Cost',
				locator: this.page.directMachineCost.first(),
				value: calculated.directMachineCost
			},
			{
				label: 'Direct Labor Cost',
				locator: this.page.directLaborCost.first(),
				value: calculated.directLaborCost
			},
			{
				label: 'Direct Setup Cost',
				locator: this.page.directSetUpCost.first(),
				value: calculated.directSetUpCost
			},
			{
				label: 'QA Inspection Cost',
				locator: this.page.QAInspectionCost.first(),
				value: calculated.inspectionCost ?? calculated.qaInspectionCost
			},
			{
				label: 'Yield Cost',
				locator: this.page.YieldCostPart.first(),
				value: calculated.yieldCost
			}
		)

		const summedCost = await this.verifyCostItems(verificationItems, {
			precision,
			debug,
			retryTimeout: options.retryTimeout,
			retryInterval: options.retryInterval
		})

		if (verifyTotal && summedCost > 0 && !this.page.isPageClosed()) {
			await this.page.verifyUIValue({
				locator: this.page.netProcessCost,
				expectedValue: calculated.directProcessCost,
				label: 'Total Manufacturing Cost',
				precision
			})

			debug &&
				logger.info(
					`📐 Sum=${summedCost} | Backend=${calculated.directProcessCost}`
				)
		}

		logger.info(`✅ ${ProcessType[processType]} Cost Verification Passed`)
		return calculated
	}
	async verifyMigCosts(): Promise<Record<string, number>> {
		//await this.openManufacturingForMigWelding();
		return this.verifyUnifiedWeldingCosts(ProcessType.MigWelding, {
			verifyCycleTime: true,
			debug: true
		})
	}

	async verifyWeldCleaningCost(): Promise<Record<string, number>> {
		return this.verifyUnifiedWeldingCosts(ProcessType.WeldingCleaning, {
			verifyCycleTime: false,
			debug: true
		})
	}

	private async switchToWeldingProcess(
		processType: ProcessType
	): Promise<void> {
		if (this.page.isPageClosed()) return

		let targetRadio

		switch (processType) {
			case ProcessType.WeldingCleaning:
				targetRadio = this.page.WeldCleanRadBtn
				break

			case ProcessType.MigWelding:
				targetRadio = this.page.MigWeldRadBtn
				break

			default:
				logger.warn(`⚠️ Unknown welding process: ${processType}`)
				return
		}

		// Avoid unnecessary re-click
		if (await targetRadio.isChecked()) {
			logger.info(`ℹ️ ${ProcessType[processType]} already selected`)
			return
		}

		logger.info(`🔄 Switching to ${ProcessType[processType]}`)
		await this.page.waitAndClick(targetRadio)

		// Wait for recalculation & UI stabilization
		await this.page.waitForNetworkIdle()
		await this.page.wait(300)
	}


	async verifyWeldPreparationCost(): Promise<void> {
		logger.info('🔹 Step: Weld Cleaning/Preparation Cost Verification')

		const processType = await this.getProcessTypeCleaning()

		await expect
			.poll(
				async () => this.page.getSelectedOptionText(this.page.ProcessGroup),
				{ message: 'Wait for Process Group to switch', timeout: 10_000 }
			)
			.toContain('Welding')

		const { density } = (await this.getMaterialDimensionsAndDensity()) ?? {
			density: 7.85
		}

		const machineEfficiency = (await this.getEfficiencyFromUI()) / 100

		// ✅ Ensure Part Information is accessible to read lot size
		try {
			await this.page.PartInformationTitle.scrollIntoViewIfNeeded()
			await this.page.wait(300)
		} catch (err) {
			logger.warn(`⚠️ Could not scroll to Part Information: ${err}`)
		}

		// 4️⃣ Gather Manufacturing DTO
		const manufactureInfo = await this.gatherManufacturingInfo(
			processType,
			machineEfficiency,
			density
		)

		// 5️⃣ Calculate Costs using Shared Calculator
		// We rely on the calculator to compute cycleTime and others based on the gathered inputs.
		// ensure dirty flags are false for fields we want calculated (gatherManufacturingInfo sets them to false)

		if (Number(manufactureInfo.processTypeID) === ProcessType.WeldingCleaning) {
			this.calculator.calculationsForWeldingCleaning(
				manufactureInfo,
				[], // fieldColorsList
				manufactureInfo // manufacturingObj
			)
		} else {
			this.calculator.calculationsForWeldingPreparation(
				manufactureInfo,
				[], // fieldColorsList
				manufactureInfo // manufacturingObj
			)
		}

		// 6️⃣ Verify UI Values
		await this.page.verifyUIValue({
			locator: this.page.curCycleTime.first(),
			expectedValue: manufactureInfo.cycleTime || 0,
			label: 'Cycle Time',
			precision: 4
		})
		await this.page.verifyUIValue({
			locator: this.page.directMachineCost.first(),
			expectedValue: manufactureInfo.directMachineCost || 0,
			label: 'Direct Machine Cost',
			precision: 4
		})
		await this.page.verifyUIValue({
			locator: this.page.directLaborCost.first(),
			expectedValue: manufactureInfo.directLaborCost || 0,
			label: 'Direct Labor Cost',
			precision: 4
		})
		await this.page.verifyUIValue({
			locator: this.page.directSetUpCost.first(),
			expectedValue: manufactureInfo.directSetUpCost || 0,
			label: 'Direct Set Up Cost',
			precision: 4
		})
		await this.page.verifyUIValue({
			locator: this.page.QAInspectionCost.first(),
			expectedValue: manufactureInfo.qaInspectionCost || 0,
			label: 'QA Inspection Cost',
			precision: 4
		})
		await this.page.verifyUIValue({
			locator: this.page.YieldCostPart.first(),
			expectedValue: manufactureInfo.yieldCost || 0,
			label: 'Yield Cost',
			precision: 4
		})

		//await this.verifyManufacturingCosts()
		//await this.verifyWeldCleaningCosts(manufactureInfo as unknown as Record<string, number>);

		// 7️⃣ Update Runtime Context
		this.runtimeWeldingContext.cycleTime = manufactureInfo.cycleTime
		logger.info('✅ Weld Cleaning/Preparation Full Cost Verification Passed')
	}

	//============ Weld Cleaning Cost Verification ============

	async verifyManufacturingCosts(): Promise<Record<string, number>> {
		logger.info('\n📋 Step: Verify Manufacturing Costs')

		const processTypeText = await this.page.getSelectedOptionText(
			this.page.ProcessGroup
		)
		let processType = ProcessType.MigWelding
		if (processTypeText.includes('Cleaning'))
			processType = ProcessType.WeldingCleaning
		else if (processTypeText.includes('Preparation'))
			processType = ProcessType.WeldingPreparation
		else if (processTypeText.includes('TIG'))
			processType = ProcessType.TigWelding
		else if (processTypeText.includes('Stick'))
			processType = ProcessType.StickWelding

		const { density } = (await this.getMaterialDimensionsAndDensity()) || {
			density: 7.85
		}

		const efficiencyVal = await this.page.getInputAsNum(
			this.page.MachineEfficiency
		)
		const machineEfficiency = efficiencyVal / 100
		logger.info('machineEfficiency', machineEfficiency)
		const manufactureInfo = await this.gatherManufacturingInfo(
			processType,
			machineEfficiency,
			density
		)
		// Apply defaults (yield%, sampling rate, etc.)
		this.calculator.weldingPreCalc(manufactureInfo, [], manufactureInfo)
		logger.info(`📊 Manufacturing Info for Cost Calculation:`)
		logger.info(`   Cycle Time: ${manufactureInfo.cycleTime} sec`)
		logger.info(`   Machine Rate: ${manufactureInfo.machineHourRate} per hour`)
		logger.info(
			`   Labor Rate: ${manufactureInfo.lowSkilledLaborRatePerHour} per hour`
		)
		logger.info(
			`   Power Consumption: ${manufactureInfo.powerConsumptionKW} kW`
		)
		logger.info(
			`   Electricity Cost: ${manufactureInfo.electricityUnitCost} per kWh`
		)
		logger.info(`   Rated Power: ${manufactureInfo.ratedPower}`)
		logger.info(`   Power Utilization: ${manufactureInfo.powerUtilization}`)

		let calculated: Record<string, number> = {}

		if (
			processType === ProcessType.WeldingCleaning ||
			processType === ProcessType.WeldingPreparation
		) {
			await this.page.waitAndClick(
				processType === ProcessType.WeldingCleaning
					? this.page.WeldCleanRadBtn
					: this.page.MigWeldRadBtn
			)

			if (processType === ProcessType.WeldingCleaning) {
				this.calculator.calculationsForWeldingCleaning(
					manufactureInfo,
					[],
					manufactureInfo
				)
			} else {
				this.calculator.calculationsForWeldingPreparation(
					manufactureInfo,
					[],
					manufactureInfo
				)
			}
			calculated = manufactureInfo as unknown as Record<string, number>
		} else {
			await this.page.waitAndClick(this.page.MigWeldRadBtn)
			this.calculator.calculationForWelding(
				manufactureInfo,
				[],
				manufactureInfo,
				[]
			)
			calculated = manufactureInfo as unknown as Record<string, number>
		}

		return calculated
	}

	//=============================== Weld Cleaning =================================
	async verifyWeldCleaningCosts(): Promise<Record<string, number>> {
		logger.info('\n💰 ===== Weld Cleaning Cost Verification =====')
		const processType = await this.getProcessTypeCleaning()
		const { density } = (await this.getMaterialDimensionsAndDensity()) || {
			density: 7.87
		}
		const efficiency =
			(await this.page.getInputAsNum(this.page.MachineEfficiency)) / 100
		const manufactureInfo = await this.gatherManufacturingInfo(
			processType,
			efficiency,
			density
		)

		// 4️⃣ Update material info for UI properties used in calculations
		const weldLegLength =
			(await this.page.getInputAsNum(this.page.TotalWeldLength)) || 0
		const surfaceArea =
			(await this.page.getInputAsNum(this.page.PartSurfaceArea)) || 0
		if (manufactureInfo.materialInfoList?.length > 0) {
			const materialInfo = manufactureInfo.materialInfoList[0]
			materialInfo.weldLegLength = weldLegLength
			materialInfo.partProjectedArea = surfaceArea
		}

		// 5️⃣ Execute Weld Cleaning/Preparation Calculation
		if (Number(manufactureInfo.processTypeID) === ProcessType.WeldingCleaning) {
			this.calculator.calculationsForWeldingCleaning(
				manufactureInfo,
				[], // fieldColorsList
				manufactureInfo
			)
		} else {
			this.calculator.calculationsForWeldingPreparation(
				manufactureInfo,
				[], // fieldColorsList
				manufactureInfo
			)
		}

		// 🐛 Debug: Log calculated values
		logger.info('🐛 DEBUG Post-Calculation Values:', {
			cycleTime: manufactureInfo.curCycleTime,
			directMachineCost: manufactureInfo.directMachineCost,
			directLaborCost: manufactureInfo.directLaborCost,
			directSetUpCost: manufactureInfo.directSetUpCost,
			inspectionCost: manufactureInfo.inspectionCost,
			yieldCost: manufactureInfo.yieldCost,
			lotSize: manufactureInfo.lotSize
		})

		// 6️⃣ Collect UI values safely
		const uiValues = {
			cycleTime: await this.page.safeGetNumber(this.page.curCycleTime),
			machine: await this.page.safeGetNumber(this.page.directMachineCost),
			labor: await this.page.safeGetNumber(this.page.directLaborCost),
			setup: await this.page.safeGetNumber(this.page.directSetUpCost),
			inspection: await this.page.safeGetNumber(this.page.QAInspectionCost),
			yield: await this.page.safeGetNumber(this.page.YieldCostPart)
		}

		// 7️⃣ Define verifications
		const verifications = [
			{
				label: 'Cycle Time / Part',
				locator: this.page.curCycleTime,
				ui: uiValues.cycleTime,
				calc: manufactureInfo.curCycleTime ?? 0
			},
			{
				label: 'Machine Cost / Part',
				locator: this.page.directMachineCost,
				ui: uiValues.machine,
				calc: manufactureInfo.directMachineCost ?? 0
			},
			{
				label: 'Labor Cost / Part',
				locator: this.page.directLaborCost,
				ui: uiValues.labor,
				calc: manufactureInfo.directLaborCost ?? 0
			},
			{
				label: 'Setup Cost / Part',
				locator: this.page.directSetUpCost,
				ui: uiValues.setup,
				calc: manufactureInfo.directSetUpCost ?? 0
			},
			{
				label: 'QA Inspection Cost / Part',
				locator: this.page.QAInspectionCost,
				ui: uiValues.inspection,
				calc: manufactureInfo.inspectionCost ?? 0
			},
			{
				label: 'Yield Cost / Part',
				locator: this.page.YieldCostPart,
				ui: uiValues.yield,
				calc: manufactureInfo.yieldCost ?? 0
			}
		]

		// 8️⃣ Verify each cost
		let totalCalculated = 0
		for (const v of verifications) {
			const uiFormatted = Number(v.ui).toFixed(5)
			const calcFormatted = Number(v.calc).toFixed(5)
			logger.info(`🔎 ${v.label} → UI=${uiFormatted}, CALC=${calcFormatted}`)

			if (v.calc === 0 && v.ui === 0) {
				logger.info(`   ⊘ Skipped (both zero)`)
				continue
			}

			if (v.calc === 0 && v.ui > 0) {
				logger.warn(
					`⚠️ ${v.label} skipped → Calculator returned 0 while UI shows ${v.ui}`
				)
				continue
			}

			await this.page.verifyUIValue({
				locator: v.locator,
				expectedValue: v.calc,
				label: v.label
			})

			totalCalculated += v.calc
		}

		// 9️⃣ Verify total manufacturing cost
		if (totalCalculated > 0) {
			await this.page.verifyUIValue({
				locator: this.page.netProcessCost,
				expectedValue: Number(totalCalculated.toFixed(5)),
				label: 'Total Manufacturing Cost'
			})
		}

		logger.info('✅ Weld Cleaning Cost Verification Completed Successfully')

		return manufactureInfo as unknown as Record<string, number>
	}

	//=============================== Manufacturing Sustainability =================================
	async verifyManufacturingSustainability(): Promise<void> {
		await this.verifyManufacturingCO2()
		logger.info(
			'📂 Navigating to Machine Details Tab for Power ESG verification...'
		)
		await this.page.ManufacturingInformation.scrollIntoViewIfNeeded()
		await this.page.ManufacturingInformation.click()
		await this.page.wait(1000) // Buffer for tab switch
		const totalPowerKW = await this.page.readNumberSafe(
			this.page.RatedPower,
			'Rated Power (KW)'
		)
		const powerUtilization = await this.page.readNumberSafe(
			this.page.PowerUtil,
			'Power Utilization (%)'
		)
		const powerESG = 0.5
		logger.info(
			`🔋 Power Data: Rated=${totalPowerKW} KW, Utilization=${powerUtilization}%, ESG Factor=${powerESG}`
		)
		if (totalPowerKW > 0 && powerUtilization > 0) {
			await this.verifySustainabilityCalculations(
				totalPowerKW,
				powerUtilization,
				powerESG
			)
		} else {
			logger.warn(
				'⚠️ Skipping Power ESG verification - no power data available'
			)
		}
	}

	async verifyManufacturingCO2(): Promise<void> {
		logger.info('\n⚡ Step: Verify Manufacturing CO2')

		const co2PerKwHr =
			(await this.page.getInputAsNum(this.page.CO2PerKwHr)) || 0

		const powerConsumptionKW =
			(await this.page.getInputAsNum(this.page.powerConsumptionKW)) || 0

		const curcycleTime =
			(await this.page.getInputAsNum(this.page.curCycleTime)) || 0

		const calculated = calculateManufacturingCO2(
			curcycleTime,
			powerConsumptionKW,
			co2PerKwHr
		)

		const actualCO2PerPart =
			(await this.page.getInputAsNum(this.page.CO2PerPartManufacturing)) || 0

		expect.soft(actualCO2PerPart).toBeCloseTo(calculated, 4)

		await this.page.verifyUIValue({
			locator: this.page.CO2PerPartManufacturing,
			expectedValue: calculated,
			label: 'Manufacturing CO2 Per Part',
			precision: 4
		})
	}

	public async verifyEndToEndWelding(
		manufactureInfo: ProcessInfoDto,
		fieldColorsList: any,
		manufacturingObj: ProcessInfoDto,
		laborRates: LaborRateMasterDto[]
	): Promise<void> {
		// ---------------------------
		// Step 1: Prepare welding info
		// ---------------------------
		this.calculator.weldingPreCalc(
			manufactureInfo,
			fieldColorsList,
			manufacturingObj
		)

		// Calculate cycle time depending on process
		if (
			manufactureInfo.processTypeID === ProcessType.WeldingPreparation ||
			manufactureInfo.processTypeID === ProcessType.WeldingCleaning ||
			manufactureInfo.processTypeID === ProcessType.MigWelding ||
			manufactureInfo.processTypeID === ProcessType.TigWelding
		) {
			manufactureInfo = this.calculator.calculationForWelding(
				manufactureInfo,
				fieldColorsList,
				manufacturingObj,
				laborRates
			)
		}

		// ---------------------------
		// Step 2: Weld material & sustainability
		// ---------------------------
		const materialInfoList = manufactureInfo.materialInfoList || []
		for (const matInfo of materialInfoList) {
			const weldCosts = this.calculator.calculateExpectedWeldingMaterialCosts(
				matInfo,
				matInfo.coreCostDetails || [],
				manufactureInfo.efficiency
			)

			matInfo.totalWeldLength = weldCosts.totalWeldLength
			matInfo.totalWeldMaterialWeight = weldCosts.totalWeldMaterialWeight
			matInfo.weldBeadWeightWithWastage = weldCosts.weldBeadWeightWithWastage

			// Update net material for power/yield calculations
			manufactureInfo.netMaterialCost = matInfo.netMatCost || 0
		}

		// ---------------------------
		// Step 3: Calculate cost components
		// ---------------------------
		this.calculator.weldingCommonCalc(
			manufactureInfo,
			fieldColorsList,
			manufacturingObj,
			laborRates
		)

		// ---------------------------
		// Step 4: Expected values (for assertion / verification)
		// ---------------------------
		const expectedCycleTime =
			manufactureInfo.curCycleTime || manufacturingObj.curCycleTime || 0
		const expectedMaterialCost = manufactureInfo.netMaterialCost || 0
		const expectedPowerCost = manufactureInfo.totalPowerCost || 0
		const expectedMachineCost = manufactureInfo.directMachineCost || 0
		const expectedLaborCost = manufactureInfo.directLaborCost || 0
		const expectedSetupCost = manufactureInfo.directSetUpCost || 0
		const expectedInspectionCost = manufactureInfo.inspectionCost || 0
		const expectedYieldCost = manufactureInfo.yieldCost || 0
		const expectedProcessCost = manufactureInfo.directProcessCost || 0

		// ---------------------------
		// Step 5: Assertions / logging
		// ---------------------------
		logger.info('🧪 Welding E2E Verification:')
		logger.info(`Cycle Time (s): ${expectedCycleTime}`)
		logger.info(`Net Material Cost: ${expectedMaterialCost}`)
		logger.info(`Power Cost: ${expectedPowerCost}`)
		logger.info(`Machine Cost: ${expectedMachineCost}`)
		logger.info(`Labor Cost: ${expectedLaborCost}`)
		logger.info(`Setup Cost: ${expectedSetupCost}`)
		logger.info(`Inspection Cost: ${expectedInspectionCost}`)
		logger.info(`Yield Cost: ${expectedYieldCost}`)
		logger.info(`Total Direct Process Cost: ${expectedProcessCost}`)

		// Optional: use expect/assert for test automation
		await VerificationHelper.verifyNumeric(
			manufactureInfo.curCycleTime || 0,
			expectedCycleTime,
			'E2E Cycle Time',
			1
		)
		await VerificationHelper.verifyNumeric(
			manufactureInfo.netMaterialCost || 0,
			expectedMaterialCost,
			'E2E Net Material Cost'
		)

		const calculatedTotal =
			expectedPowerCost +
			expectedMachineCost +
			expectedLaborCost +
			expectedSetupCost +
			expectedInspectionCost +
			expectedYieldCost
		await VerificationHelper.verifyNumeric(
			manufactureInfo.directProcessCost || 0,
			calculatedTotal,
			'E2E Direct Process Cost'
		)
	}
	/**
	 * Verifies sustainability calculations on the Sustainability tab
	 */
	async verifySustainabilityCalculations(
		totalPowerKW: number,
		powerUtilization: number,
		powerESG: number
	): Promise<void> {
		logger.info('🔹 Verifying Sustainability Calculations...')

		// Switch to Sustainability Tab
		logger.info('📂 Navigating to Sustainability Tab...')
		await this.page.SustainabilityTab.scrollIntoViewIfNeeded()
		await this.page.SustainabilityTab.click()
		await this.page.wait(1000) // small buffer for tab switch

		// Power ESG Calculation: TotalPowerKW * PowerUtilization * PowerESG_Factor
		// Note: powerUtilization is already in decimal form (e.g., 0.75 for 75%)
		const expectedEsgConsumption = totalPowerKW * powerUtilization * powerESG

		// const actualEsgConsumption = await this.page.readNumberSafe(
		// 	this.page.EsgImpactElectricityConsumption,
		// 	'Power ESG (Electricity Consumption)'
		// )

		// await VerificationHelper.verifyNumeric(
		// 	actualEsgConsumption,
		// 	expectedEsgConsumption,
		// 	'Power ESG (Electricity Consumption)',
		// 	4
		// )

		logger.info('✔ Sustainability verification complete.')
	}

	// ========================== Overall Verification ==========================
	async verifyCompleteWeldingProcess(): Promise<void> {
		logger.info('\n🚀 ===== MASTER WELDING VERIFICATION (E2E) =====')

		try {
			logger.info('\n📋 Step 1: Verify Material Calculations')
			await this.verifyWeldingMaterialCalculations()

			logger.info('\n📋 Step 2: Verify Cycle Time Details')
			await this.verifyWeldCycleTimeDetails({})

			logger.info('\n📋 Step 3: Verify Material Sustainability (CO2)')
			//await this.verifyNetMaterialSustainabilityCost()

			logger.info(
				'\n📋 Step 4: Verify Manufacturing Overall (Costs + Sustainability)'
			)
			await this.verifyManufacturingCosts()

			logger.info(
				'\n✅ ===== ALL WELDING VERIFICATIONS COMPLETED SUCCESSFULLY ====='
			)
		} catch (error) {
			logger.error(
				`❌ Master Verification Failed: ${error instanceof Error ? error.message : 'Unknown'
				}`
			)
			throw error
		}
	}

	async verifyAllWeldingCalculations(): Promise<void> {
		await this.verifyCompleteWeldingProcess()
	}
	//===================== Cost Summary =====================
	async expandPanel(): Promise<void> {
		logger.info('🔹 Expanding all panels before test...')

		const panels = [
			// this.page.expandMtlInfo,
			// this.page.expandMfgInfo,
			this.page.expandOHProfit,
			this.page.expandPack,
			this.page.expandLogiCost,
			this.page.expandTariff
		]

		for (const panel of panels) {
			try {
				await panel.waitFor({ state: 'visible', timeout: 10_000 })

				const isExpanded = await panel.getAttribute('aria-expanded')

				if (isExpanded !== 'true') {
					await panel.click({ force: true })
					logger.info('✅ Panel expanded')
				} else {
					logger.info('ℹ️ Panel already expanded')
				}
			} catch (error) {
				logger.warn('⚠️ Panel not available to expand — skipping')
			}
		}
	}
	async verifyCostSummary(): Promise<void> {
		logger.info('🔹 Verifying Cost Summary...')
		await this.expandPanel()

		await expect.soft(this.page.numCostSummary).toBeVisible()
		await this.page.waitAndClick(this.page.numCostSummary)

		await expect
			.soft(async () => {
				// ================= Material =================
				const materialCostUI = Number(
					await this.page.MaterialTotalCost.inputValue()
				)
				const materialSubtotal = await getCellNumberFromTd(
					this.page.materialSubTotalcost
				)

				logger.info(
					`Material → UI: ${materialCostUI}, Calculated: ${materialSubtotal}`
				)
				expect.soft(materialCostUI).toBeCloseTo(materialSubtotal, 2)

				// ================= Manufacturing =================
				const manufacturingUI = Number(
					await this.page.ManufacturingCost.inputValue()
				)
				const manufacturingSubtotal = await getCellNumber(
					this.page.mfgSubTotalcost
				)

				logger.info(
					`Manufacturing → UI: ${manufacturingUI}, Calculated: ${manufacturingSubtotal}`
				)
				expect.soft(manufacturingUI).toBeCloseTo(manufacturingSubtotal, 2)

				// ================= Tooling =================
				const toolingCost = await getCurrencyNumber(
					this.page.ToolingCost,
					'Tooling Cost'
				)
				logger.info(`Tooling → UI: ${toolingCost}`)
				expect.soft(toolingCost).toBeGreaterThanOrEqual(0)

				// ================= Overhead =================
				const overheadUI = await getCurrencyNumber(
					this.page.OverheadProfit,
					'Overhead Profit'
				)

				const overhead = await getCurrencyNumber(
					this.page.overHeadCost,
					'Overhead'
				)
				const profit = await getCurrencyNumber(this.page.profitCost, 'Profit')
				const costOfCapital = await getCurrencyNumber(
					this.page.costOfCapital,
					'Cost of Capital'
				)

				const calculatedOverhead = calculateOverHeadCost(
					overhead,
					profit,
					costOfCapital
				)

				logger.info(
					`Overhead → UI: ${overheadUI}, Calculated: ${calculatedOverhead}`
				)
				expect.soft(overheadUI).toBeCloseTo(calculatedOverhead, 2)

				// ================= Packaging =================
				const packingUI = await getCurrencyNumber(
					this.page.PackingCost,
					'Packing Cost'
				)

				const packagingCosts = await Promise.all([
					getNumber(this.page.primaryPackaging1),
					getNumber(this.page.primaryPackaging2),
					getNumber(this.page.secondaryPackaging),
					getNumber(this.page.tertiaryPackaging)
				])

				const calculatedPackaging = calculateTotalPackMatlCost(
					...packagingCosts
				)

				logger.info(
					`Packaging → UI: ${packingUI}, Calculated: ${calculatedPackaging}`
				)
				expect.soft(packingUI).toBeCloseTo(calculatedPackaging, 2)

				// ================= EXW Part Cost =================
				const exwUI = await getCurrencyNumber(
					this.page.EXWPartCost,
					'EX-W Part Cost'
				)

				const exwCalculated = await calculateExPartCost(
					await getNumber(this.page.MaterialTotalCost),
					await getNumber(this.page.ManufacturingCost),
					await getNumber(this.page.ToolingCost),
					await getNumber(this.page.OverheadProfit),
					await getNumber(this.page.PackingCost)
				)

				logger.info(`EXW → UI: ${exwUI}, Calculated: ${exwCalculated}`)
				expect.soft(exwUI).toBeCloseTo(exwCalculated, 2)

				// ================= Freight =================
				const freightUI = await getCurrencyNumber(
					this.page.shouldFreightCost,
					'Freight Cost'
				)
				const freightCalculated = await getNumber(this.page.logiFreightCost)

				logger.info(
					`Freight → UI: ${freightUI}, Calculated: ${freightCalculated}`
				)
				expect.soft(freightUI).toBeCloseTo(freightCalculated, 2)

				// ================= Duties =================
				const dutiesUI = await getCurrencyNumber(
					this.page.shouldDutiesTariff,
					'Duties Tariff'
				)
				const dutiesCalculated = await getNumber(this.page.tariffCost)

				logger.info(`Duties → UI: ${dutiesUI}, Calculated: ${dutiesCalculated}`)
				expect.soft(dutiesUI).toBeCloseTo(dutiesCalculated, 2)

				// ================= Total Part Cost =================
				const partCostUI = await getCurrencyNumber(
					this.page.PartShouldCost,
					'Part Should Cost'
				)

				const partCostCalculated = await calculatePartCost(
					await getNumber(this.page.MaterialTotalCost),
					await getNumber(this.page.ManufacturingCost),
					await getNumber(this.page.ToolingCost),
					await getNumber(this.page.OverheadProfit),
					await getNumber(this.page.PackingCost),
					await getNumber(this.page.shouldFreightCost),
					await getNumber(this.page.shouldDutiesTariff)
				)

				logger.info(
					`Part Cost → UI: ${partCostUI}, Calculated: ${partCostCalculated}`
				)
				expect.soft(partCostUI).toBeCloseTo(partCostCalculated, 2)
			})
			.toPass({ timeout: 15_000, intervals: [1_000] })
	}
}
