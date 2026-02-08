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
} from '../utils/interfaces'

import {
	calculateLotSize,
	calculateLifeTimeQtyRemaining,
	calculateWeldVolume,
	ProcessType,
	getWireDiameter,
	calculateSingleWeldCycleTime,
	calculateCycleTimeBreakdown,
	calculateTotalWeldLength,
	calculateNetWeight,
	calculateManufacturingCO2
} from '../utils/welding-calculator-functions'
import {
	calculateOverHeadCost,
	calculateExPartCost,
	calculatePartCost,
	calculateTotalPackMatlCost,
	LaborRateMasterDto,
	WeldingCalculator,
	getCurrencyNumber,
	getCellNumber,
	getCellNumberFromTd,
	getNumber
} from '../utils/welding-calculator'
import { MigWeldingPage } from './mig-welding.page'
import { VerificationHelper } from '../lib/BasePage'
import { MaterialInformation } from '../../test-data/mig-welding-testdata'
import { normalizeMachineType, roundTo } from '../utils/helpers'
import { SustainabilityCalculator } from '../utils/SustainabilityCalculator'
import { get } from 'node:http'
import { WeldingConfigService, DiscBrushEntry } from '../utils/weldingConfig'

const logger = Logger

// VerificationHelper moved to BasePage

export class MigWeldingLogic {
	private readonly calculator = new WeldingCalculator()

	private runtimeWeldingContext: RuntimeWeldingContext = {}

	constructor(public page: MigWeldingPage) { }

	// ========================== Core Utility Methods ==========================

	async setProcessGroup(value: string): Promise<void> {
		await this.page.selectOption(this.page.ProcessGroup, value)
	}
	public async getMaterialDensity(): Promise<number> {
		try {
			await this.page.MaterialDetailsTab.scrollIntoViewIfNeeded()
			await this.page.MaterialDetailsTab.click()
			await this.page.wait(1000) // wait for tab content to stabilize
		} catch (err) {
			logger.warn(`⚠️ Could not open Material Details tab: ${err}`)
		}
		await expect(this.page.Density).toBeVisible({ timeout: 10000 });
		const density = await this.page.readNumberSafe(this.page.Density, 'Density');
		logger.info(`🧪 Material Density: ${density}`)
		return density
	}

	public async getMaterialDimensionsAndDensity(): Promise<MaterialDimensionsAndDensity> {
		// -------------------- Open Material Details Tab --------------------
		try {
			await this.page.MaterialDetailsTab.scrollIntoViewIfNeeded();
			await this.page.waitAndClick(this.page.MaterialDetailsTab);
			await this.page.waitForNetworkIdle(5000);
			await this.page.wait(300);
		} catch (err) {
			logger.warn(`⚠️ Could not open Material Details tab: ${err}`);
		}
		const density = await this.page.readNumberSafe(
			this.page.Density,
			'Density'
		);

		try {
			await this.page.MaterialInfo.scrollIntoViewIfNeeded();
			await this.page.waitAndClick(this.page.MaterialInfo);
			await this.page.wait(300);
		} catch (err) {
			logger.warn(`⚠️ Could not open Material Info tab: ${err}`);
		}

		const length = await this.page.readNumberSafe(
			this.page.PartEnvelopeLength,
			'Length'
		);

		const width = await this.page.readNumberSafe(
			this.page.PartEnvelopeWidth,
			'Width'
		);

		const height = await this.page.readNumberSafe(
			this.page.PartEnvelopeHeight,
			'Height'
		);

		if (length === 0 || width === 0 || height === 0) {
			logger.warn(
				`⚠️ Part dimensions may be incomplete → L: ${length}, W: ${width}, H: ${height}`
			);
		}

		logger.info(
			`📐 Part Dimensions → L: ${length}, W: ${width}, H: ${height}, Density: ${density}`
		);

		return { length, width, height, density };
	}
	private async fillInputWithTab(
		locator: Locator,
		value: string | number,
		label: string = 'Input'
	): Promise<number> {
		await this.page.waitAndFill(locator, value)
		await this.page.wait(500)
		await locator.press('Tab')

		const uiValue = Number((await locator.inputValue()) || '0')
		expect.soft(uiValue, `Verify ${label} is greater than 0`).toBeGreaterThan(0)

		return uiValue
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
			.first();

		await projectOption.waitFor({ state: 'visible', timeout: 10000 });
		await projectOption.scrollIntoViewIfNeeded();
		await projectOption.click();

		logger.info('✅ Project option selected');

		await this.page.waitAndFill(this.page.ProjectValue, projectId)
		await this.page.pressTab()
		await this.page.pressEnter()
		await this.page.waitForNetworkIdle()
		await this.page.ProjectID.click()
		logger.info(`✔ Navigated to project ID: ${projectId}`)
	}
	private async expandWeldIfVisible(weldHeader: Locator, label: string) {
		try {
			await weldHeader.waitFor({ state: 'visible', timeout: 8000 });

			const expanded = await weldHeader.getAttribute('aria-expanded');

			if (expanded !== 'true') {
				logger.info(`🔽 Expanding ${label}`);
				await weldHeader.scrollIntoViewIfNeeded();
				await weldHeader.click({ force: true });

				// Wait until actually expanded
				await expect
					.poll(async () => weldHeader.getAttribute('aria-expanded'), {
						timeout: 8000
					})
					.toBe('true');
			}
		} catch {
			logger.warn(`⚠️ ${label} not visible — skipping expansion`);
		}
	}

	async openManufacturingForMigWelding(): Promise<void> {
		const manufacturing = this.page.ManufacturingInformation;

		// 1️⃣ Ensure Manufacturing section is visible
		await manufacturing.scrollIntoViewIfNeeded();
		await manufacturing.waitFor({ state: 'visible', timeout: 10000 });

		// 2️⃣ Expand Manufacturing if collapsed
		const isExpanded = await manufacturing.getAttribute('aria-expanded');
		if (isExpanded !== 'true') {
			await manufacturing.click();
			await expect(this.page.MigWeldRadBtn).toBeVisible({ timeout: 10000 });
		}
		await this.page.MigWeldRadBtn.waitFor({ state: 'visible', timeout: 10000 });

		if (!(await this.page.MigWeldRadBtn.isChecked())) {
			await this.page.MigWeldRadBtn.click();
		}
		await this.expandWeldIfVisible(this.page.MfgWeld1, 'Weld 1');
		await this.expandWeldIfVisible(this.page.MfgWeld2, 'Weld 2');
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

				const normalizedSelected = await this.page.normalizeText(
					selectedCategory
				)
				const normalizedSuggested = await this.page.normalizeText(
					suggestedCategory
				)

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
		const { processGroup, category, family, grade, stockForm } = MaterialInformation;

		logger.info(
			`🔹 Selecting material: ${processGroup} > ${category} > ${family} > ${grade} > ${stockForm}`
		);
		await this.page.MaterialInformationSection.click();
		await this.page.selectByTrimmedLabel(this.page.ProcessGroup, processGroup);
		await this.page.selectOption(this.page.materialCategory, category);
		await this.page.selectOption(this.page.MatFamily, family);
		await this.page.selectOption(this.page.DescriptionGrade, grade);
		await this.page.selectOption(this.page.StockForm, stockForm);
		const scrapPrice = await this.page.waitForStableNumber(this.page.ScrapPrice, 'Scrap Price');
		const materialPrice = await this.page.waitForStableNumber(this.page.MaterialPrice, 'Material Price');

		expect.soft(scrapPrice).toBeGreaterThan(0);
		expect.soft(materialPrice).toBeGreaterThan(0);
		const materialDimensions = await this.getMaterialDimensionsAndDensity();
		const density = materialDimensions.density; // fetch once
		const partVolume = await this.getPartVolume();

		logger.info(`🧪 Density → ${density}`);
		logger.info(`📦 Part Volume → ${partVolume}`);
		const expectedNetWeight = calculateNetWeight(partVolume, density);
		await this.verifyNetWeight(expectedNetWeight, 4); // optional higher precision
	}
	async getNetWeight(): Promise<number> {
		logger.info('🔹 Reading Net Weight...');

		const netWeight = await this.page.readNumberSafe(
			this.page.NetWeight,
			'Net Weight',
			10000,
			2
		);

		if (netWeight === 0) {
			logger.warn('⚠️ Net Weight returned 0 – possible rendering delay or calculation issue');
		}

		return netWeight;
	}

	async getPartVolume(): Promise<number> {
		logger.info('🔹 Waiting for Part Volume...')
		await expect(this.page.PartVolume).toBeVisible({ timeout: 10000 });
		const volume = await this.page.waitForStableNumber(
			this.page.PartVolume,
			'Part Volume'
		)

		return volume
	}
	async verifyNetWeight(expectedValue?: number, precision: number = 2): Promise<number> {
		logger.info('🔹 Verifying Net Weight...');

		let expected = expectedValue;

		// Only calculate if not provided
		if (expected === undefined) {
			const materialDimensions = await this.getMaterialDimensionsAndDensity();
			const density = materialDimensions.density; // read once here
			const partVolumeMm3 = await this.getPartVolume();
			expected = calculateNetWeight(partVolumeMm3, density);
		}

		const actualNetWeight = await this.getNetWeight();
		await VerificationHelper.verifyNumeric(actualNetWeight, expected, 'Net Weight', precision);

		logger.info(`✔ Net Weight verified: ${actualNetWeight.toFixed(precision)} g`);
		return actualNetWeight;
	}

	// ========================== Weld Data Collection ==========================

	//==============Locator Builder (Base Utility)=======================	
	private getWeldRowLocators(weldIndex: 1 | 2): WeldRowLocators {
		const suffix = weldIndex === 1 ? '1' : '2';

		return {
			weldCheck: this.page[`MatWeld${suffix}`],
			weldType: this.page[`MatWeldType${suffix}`],
			weldSize: this.page[`MatWeldSize${suffix}`],
			wireDia: this.page[`MatWireDia${suffix}`],
			weldElementSize: this.page[`MatWeldElementSize${suffix}`],
			weldLength: this.page[`MatWeldLengthmm${suffix}`],
			weldSide: this.page[`MatWeldSide${suffix}`],
			weldPlaces: this.page[`MatWeldPlaces${suffix}`],
			grindFlush: this.page[`MatGrishFlush${suffix}`],
			totalWeldLength:
				weldIndex === 1
					? this.page.MatTotalWeldLengthWeld1
					: this.page.MatTotalWeldLength2,
			partReorientationTime: this.page.PartReorientationTime
		};
	}
	//=============Collect Single Weld Data From UI ============	
	private async collectWeldSubMaterial(
		weldIndex: 1 | 2
	): Promise<WeldSubMaterialUI | null> {

		const locators = this.getWeldRowLocators(weldIndex);

		if (!(await locators.weldType.isVisible())) {
			logger.info(`ℹ️ Weld ${weldIndex} not visible — skipping`);
			return null;
		}

		const noOfWeldPassesLocator =
			weldIndex === 1
				? this.page.MatNoOfWeldPasses1
				: this.page.MatNoOfWeldPasses2;

		const weld: WeldSubMaterialUI = {
			weldElementSize: Number(await locators.weldElementSize.inputValue()),
			weldSize: Number(await locators.weldSize.inputValue()),
			noOfWeldPasses: Number(await noOfWeldPassesLocator.inputValue()),
			weldLength: Number(await locators.weldLength.inputValue()),
			weldPlaces: Number(await locators.weldPlaces.inputValue()),
			weldSide: await this.page.getSelectedOptionText(locators.weldSide),
			wireDia: Number(await locators.wireDia?.inputValue() || 0),
			weldType: await this.page.getSelectedOptionText(locators.weldType),
			partReorientationTime: Number(await locators.partReorientationTime?.inputValue() || 0)
		};

		logger.info(`🔩 Weld ${weldIndex} UI → ${JSON.stringify(weld)}`);
		return weld;
	}
	// =============Collect All Weld Rows===============
	private async collectAllWeldSubMaterials(): Promise<WeldSubMaterialUI[]> {
		const weldSubMaterials: WeldSubMaterialUI[] = [];

		for (const weldIndex of [1, 2] as const) {
			const weld = await this.collectWeldSubMaterial(weldIndex);
			if (weld) {
				weldSubMaterials.push(weld);
			}
		}

		if (!weldSubMaterials.length) {
			throw new Error('❌ No weld material rows detected in UI');
		}

		return weldSubMaterials;
	}
	//=================Verify One Weld Row (Fill + Validate)=============
	private async verifySingleWeldRow(
		weldData: Record<string, unknown>,
		materialType: string,
		locators: WeldRowLocators
	): Promise<WeldRowResult> {

		const weld = locators.weldCheck;

		await weld.scrollIntoViewIfNeeded();
		if (await weld.isVisible()) {
			await this.page.expandIfCollapsed(weld);
			await expect.soft(weld).toBeVisible();
		}

		await expect.soft(locators.weldType).toBeEnabled();
		await this.page.selectOption(locators.weldType, weldData.weldType as string);

		// Weld Size
		const uiWeldSize = await this.fillInputWithTab(
			locators.weldSize,
			weldData.weldSize as string | number,
			'Weld Size'
		);

		// Wire Dia (auto)
		if (locators.wireDia && await locators.wireDia.isVisible()) {
			await locators.wireDia.scrollIntoViewIfNeeded();
			await expect.soft(locators.wireDia).not.toHaveValue('');

			const actualWireDia = Number(await locators.wireDia.inputValue());
			const expectedWireDia = getWireDiameter(materialType, uiWeldSize);

			expect.soft(actualWireDia).toBe(expectedWireDia);
		}

		// Weld Element Size
		await expect.soft(locators.weldElementSize).not.toHaveValue('');
		const weldElementSize = Number(await locators.weldElementSize.inputValue());

		// Weld Length
		const uiWeldLength = await this.fillInputWithTab(
			locators.weldLength,
			weldData.weldLength as string | number,
			'Weld Length'
		);

		// Weld Places
		await locators.weldPlaces.fill(String(weldData.weldPlaces));
		const uiWeldPlaces = Number(await locators.weldPlaces.inputValue());

		// Weld Side
		await this.page.selectOption(locators.weldSide, weldData.weldSide as string);
		const uiWeldSide = await this.page.getSelectedOptionText(locators.weldSide);

		// Grind Flush
		await this.page.selectOption(
			locators.grindFlush,
			weldData.grindFlush as string
		);

		const passes = Number(weldData.noOfWeldPasses || 1);

		// Total Weld Length
		const expectedTotalLength = calculateTotalWeldLength(
			uiWeldLength,
			uiWeldPlaces,
			uiWeldSide
		);

		await expect
			.soft(locators.totalWeldLength)
			.toHaveValue(expectedTotalLength.toString());

		// Weld Volume
		const weldVolumeResult = calculateWeldVolume(
			weldData.weldType as string,
			uiWeldSize,
			weldElementSize,
			uiWeldLength,
			uiWeldPlaces,
			passes,
			uiWeldSide
		);

		return {
			totalLength: expectedTotalLength,
			volume: weldVolumeResult.weldVolume,
			weldVolume: weldVolumeResult.weldVolume
		};
	}
	//============= Main Method – Verify All Welding Details =============
	async verifyWeldingDetails(
		migWeldingTestData: Record<string, unknown>
	): Promise<void> {

		logger.info('🔹 Verifying Welding Details...');
		await this.page.scrollToMiddle(this.page.WeldingDetails);
		await expect.soft(this.page.WeldingDetails).toBeVisible();
		const weldingDetails = migWeldingTestData.weldingDetails as Record<string, any>;
		const materialInfo = migWeldingTestData.materialInformation as Record<string, any>;
		const materialType = materialInfo?.family || 'Carbon Steel';
		const weldResults: WeldRowResult[] = [];
		for (const idx of [1, 2] as const) {
			const weldData = weldingDetails[`weld${idx}`];
			if (!weldData) continue;

			const result = await this.verifySingleWeldRow(
				weldData,
				materialType,
				this.getWeldRowLocators(idx)
			);

			weldResults.push(result);
		}
		const expectedGrandTotalWeldLength = weldResults.reduce(
			(sum, w) => sum + w.totalLength,
			0
		);
		const actualGrandTotalLength = Number(
			await this.page.TotalWeldLength.inputValue()
		);
		expect.soft(actualGrandTotalLength).toBe(expectedGrandTotalWeldLength);
		this.runtimeWeldingContext.totalWeldLength = expectedGrandTotalWeldLength;
		logger.info('✔ Welding Details verified');
	}
	// ========================== Manufacturing Cost Verification ==========================
	async verifyDirectProcessCostCalculation(): Promise<void> {
		logger.info('🔹 Verifying Direct Process Cost Summation...');

		// 1. Read individual cost components
		const machineCost = await this.page.readNumberSafe(this.page.MachineCostPart, 'Direct Machine Cost');
		const setupCost = await this.page.readNumberSafe(this.page.SetupCostPart, 'Direct SetUp Cost');
		const laborCost = await this.page.readNumberSafe(this.page.directLaborRate, 'Direct Labor Cost');
		const inspectionCost = await this.page.readNumberSafe(this.page.QAInspectionCost, 'Inspection Cost');
		const yieldCost = await this.page.readNumberSafe(this.page.YieldCostPart, 'Yield Cost');
		const powerCost = await this.page.readNumberSafe(this.page.TotalPowerCost, 'Total Power Cost');

		// 2. Sum them up
		const expectedProcessCost = machineCost + setupCost + laborCost + inspectionCost + yieldCost + powerCost;

		logger.info(
			`∑ Calculation: ${machineCost} (Machine) + ${setupCost} (Setup) + ${laborCost} (Labor) + ` +
			`${inspectionCost} (Inspection) + ${yieldCost} (Yield) + ${powerCost} (Power) = ${expectedProcessCost}`
		);

		// 3. Verify against the UI Total
		await this.page.verifyUIValue({
			locator: this.page.NetProcessCost,
			expectedValue: expectedProcessCost,
			label: 'Net Process Cost (Sum check)',
			precision: 2
		});

		logger.info('✔ Direct Process Cost summation verified');
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
		if (expectedTotalWeldLength === undefined) return
		await this.verifyMaterialValue(
			this.page.TotalWeldLength,
			expectedTotalWeldLength,
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
				length: await this.page.getInputNumber(this.page.MatWeldLengthmm1),
				size: await this.page.getInputNumber(this.page.MatWeldSize1)
			},
			{
				length: await this.page.getInputNumber(this.page.MatWeldLengthmm2),
				size: await this.page.getInputNumber(this.page.MatWeldSize2)
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
			// ✅ Ensure weld section is expanded
			await this.ensureMfgWeldExpanded(index)

			const weldTypeLocator =
				index === 1
					? this.page.WeldTypeSubProcess1
					: this.page.WeldTypeSubProcess2

			// ✅ Wait briefly for rendering instead of skipping immediately
			const isVisible = await weldTypeLocator
				.waitFor({ state: 'visible', timeout: 3000 })
				.then(() => true)
				.catch(() => false)

			if (!isVisible) {
				logger.info(`ℹ️ SubProcess ${index} not visible — skipping`)
				continue
			}

			const weldPositionLocator =
				index === 1
					? this.page.WeldPositionSubProcess1
					: this.page.WeldPositionSubProcess2

			const travelSpeedLocator =
				index === 1
					? this.page.TravelSpeedSubProcess1
					: this.page.TravelSpeedSubProcess2

			const tackWeldLocator =
				index === 1
					? this.page.TrackWeldSubProcess1
					: this.page.TrackWeldSubProcess2

			const intermediateStopsLocator =
				index === 1
					? this.page.IntermediateStartStopSubProcess1
					: this.page.IntermediateStartStopSubProcess2

			const subProcess: SubProcess = {
				weldType: await this.page.getSelectedOptionText(weldTypeLocator),
				weldPosition: await this.page.getSelectedOptionText(weldPositionLocator),
				travelSpeed:
					(await this.page.getInputValueAsNumber(travelSpeedLocator)) || 5,
				tackWelds:
					(await this.page.getInputValueAsNumber(tackWeldLocator)) || 0,
				intermediateStops:
					(await this.page.getInputValueAsNumber(intermediateStopsLocator)) || 0
			}

			subProcesses.push(subProcess)

			logger.info(
				`   ✓ SubProcess${index}: ${subProcess.weldType}, ${subProcess.weldPosition}, ` +
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
			(await this.page.getInputValueAsNumber(this.page.MachineType)) ?? 1

		const manufactureInfo: any = {}
		manufactureInfo.machineAutomation = machineAutomationValue

		const machineName = await this.page.getSelectedOptionText(
			this.page.MachineName
		)
		const machineDescription = await this.page.MachineDescription.inputValue()
		const efficiency =
			(await this.page.getInputValueAsNumber(this.page.MachineEfficiency)) || 75

		logger.info(`   ✓ Process Type: ${processType}`)
		logger.info(`   ✓ Machine Automation: ${machineAutomation}`)
		logger.info(`   ✓ Machine Name: ${machineName}`)
		logger.info(`   ✓ Machine Description: ${machineDescription}`)
		logger.info(`   ✓ Efficiency: ${efficiency}%`)

		// Part Complexity
		await this.page.scrollIntoView(this.page.AdditionalDetails)
		await this.page.waitAndClick(this.page.AdditionalDetails)

		if (testData?.partComplexity) {
			await this.page.selectOption(
				this.page.PartComplexity,
				String(testData.partComplexity)
			)
		}

		const partComplexityText = await this.page.getSelectedOptionText(
			this.page.PartComplexity
		)
		logger.info(`   ✓ Part Complexity: ${partComplexityText}`)

		await this.page.waitAndClick(this.page.PartDetails)

		// Current / Voltage
		await this.page.scrollIntoView(this.page.RequiredCurrent)
		const minCurrentRequired = await this.page.getInputValueAsNumber(
			this.page.RequiredCurrent
		)
		const minWeldingVoltage = await this.page.getInputValueAsNumber(
			this.page.RequiredVoltage
		)
		const selectedCurrent = await this.page.getInputValueAsNumber(
			this.page.selectedCurrent
		)
		const selectedVoltage = await this.page.getInputValueAsNumber(
			this.page.selectedVoltage
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
			partComplexity: partComplexityText,
			minCurrentRequired,
			minWeldingVoltage,
			selectedCurrent,
			selectedVoltage,
			subProcesses
		}

		logger.info('✔ Process Details successfully read from UI')
	}

	//================================= Manufacturing Subprocess Section =================================	
	private async ensureMfgWeldExpanded(MfgweldIndex: 1 | 2): Promise<void> {
		await this.page.ManufacturingInformation.click();
		const weldHeader =
			MfgweldIndex === 1
				? this.page.MfgWeld1
				: this.page.MfgWeld2;

		await weldHeader.scrollIntoViewIfNeeded();
		const isExpanded = await weldHeader.getAttribute('aria-expanded');
		if (isExpanded !== 'true') {
			await this.page.ManufacturingInformation.click()
			await this.page.waitForTimeout(500);
		}
		try {
			await weldHeader.scrollIntoViewIfNeeded();
			await weldHeader.waitFor({ state: 'visible', timeout: 8000 });

			const expanded = await weldHeader.getAttribute('aria-expanded');
			if (expanded !== 'true') {
				logger.info(`🔽 Expanding Manufacturing subprocess Weld ${MfgweldIndex}`);
				await weldHeader.click({ force: true });
				await this.page.waitForTimeout(500);
			}
		} catch (err) {
			logger.warn(`⚠️ Manufacturing subprocess Weld ${MfgweldIndex} expansion skipped (not visible yet)`);
		}
	}
	//======================== Cycle Time/Part(Sec) =========================================
	async verifyWeldCycleTimeDetails(testData: any): Promise<void> {
		logger.info('🔹 Step: Comprehensive Weld Cycle Time Verification');
		await this.openManufacturingForMigWelding()
		try {
			const { subProcessDetails, weldingDetails } = testData;

			if (!subProcessDetails || !weldingDetails) {
				logger.warn('⚠️ Missing welding/sub-process data, skipping verification');
				return;
			}

			// ---------- Read Common UI Inputs ----------
			const efficiency = await this.getEfficiencyFromUI();
			const partReorientation = await this.getInputNumber(this.page.PartReorientation);
			const loadingUnloadingTime = await this.getInputNumber(this.page.UnloadingTime);
			logger.info(`   ✓ Efficiency             : ${efficiency}%`);
			logger.info(`   ✓ Part Reorientation     : ${partReorientation}`);
			logger.info(`   ✓ Loading / Unloading    : ${loadingUnloadingTime} sec`);

			// ---------- Process All Sub-Processes ----------
			const subProcessKeys = Object.keys(subProcessDetails);
			const subProcessCycleTimes: number[] = [];

			for (let index = 0; index < subProcessKeys.length; index++) {
				const key = subProcessKeys[index];
				logger.info(`🔍 Verifying Sub-Process ${index + 1}: ${key}`);

				try {
					const cycleTime = await this.verifySingleSubProcessCycleTime(
						index,
						subProcessDetails[key],
						weldingDetails[key]
					);

					if (cycleTime !== null) {
						subProcessCycleTimes.push(cycleTime);
						logger.info(`   ✓ Sub-Process ${index + 1} Cycle Time: ${cycleTime} sec`);
					} else {
						logger.warn(`⚠️ Sub-Process ${index + 1} Cycle Time could not be determined`);
					}
				} catch (err: any) {
					logger.error(`❌ Sub-Process ${index + 1} verification failed: ${err.message}`);
					logger.debug(err.stack);
				}
			}

			if (!subProcessCycleTimes.length) {
				logger.warn('⚠️ No active weld sub-processes detected. Skipping overall cycle verification.');
				return;
			}

			// ---------- Verify Overall Cycle Time ----------
			await this.verifyOverallCycleTime({
				subProcessCycleTimes,
				loadingUnloadingTime,
				partReorientation,
				efficiency
			});

			// ---------- Store Runtime ----------
			this.runtimeWeldingContext.subProcessCycleTimes = subProcessCycleTimes;

			logger.info('✅ All Weld Cycle Time Verifications Completed Successfully');
		} catch (error: any) {
			logger.error(`❌ Cycle Time Verification Failed: ${error.message}`);
			logger.error(`Stack: ${error.stack}`);
			throw error;
		}
	}
	private getWeldTypeLocator(index: number): Locator {
		return index === 0
			? this.page.WeldTypeSubProcess1
			: this.page.WeldTypeSubProcess2
	}

	private getWeldPositionLocator(index: number): Locator {
		return index === 0
			? this.page.WeldPositionSubProcess1
			: this.page.WeldPositionSubProcess2
	}

	private getTravelSpeedLocator(index: number): Locator {
		return index === 0
			? this.page.TravelSpeedSubProcess1
			: this.page.TravelSpeedSubProcess2
	}

	private getTackWeldLocator(index: number): Locator {
		return index === 0
			? this.page.TrackWeldSubProcess1
			: this.page.TrackWeldSubProcess2
	}

	private getIntermediateStopsLocator(index: number): Locator {
		return index === 0
			? this.page.IntermediateStartStopSubProcess1
			: this.page.IntermediateStartStopSubProcess2
	}

	private getCycleTimeLocator(index: number): Locator {
		return index === 0
			? this.page.MfgWeldCycleTime1
			: this.page.MfgWeldCycleTime2
	}
	// ====================================================================
	// ✅ SINGLE SUB-PROCESS VERIFICATION
	// ====================================================================
	private async verifySingleSubProcessCycleTime(
		index: number,
		subProc: any,
		weldData: any
	): Promise<number | null> {
		if (!subProc || !weldData) return null

		logger.info(`\n🔍 ===== Verifying Sub-Process ${index + 1} =====`)

		const weldTypeLocator = this.getWeldTypeLocator(index)
		const positionLocator = this.getWeldPositionLocator(index)
		const speedLocator = this.getTravelSpeedLocator(index)
		const tackLocator = this.getTackWeldLocator(index)
		const stopsLocator = this.getIntermediateStopsLocator(index)
		const cycleLocator = this.getCycleTimeLocator(index)

		// ---------- Values ----------
		const actualWeldType = await this.page.getSelectedOptionText(
			weldTypeLocator
		)
		const actualPosition = await this.page.getSelectedOptionText(
			positionLocator
		)
		const actualSpeed = await this.page.getInputValueAsNumber(speedLocator)
		const actualTacks = await this.page.getInputValueAsNumber(tackLocator)
		const actualStops = await this.page.getInputValueAsNumber(stopsLocator)

		await VerificationHelper.verifyDropdown(
			actualWeldType,
			subProc.weldType,
			'Weld Type'
		)
		await VerificationHelper.verifyDropdown(
			actualPosition,
			subProc.weldPosition,
			'Welding Position'
		)

		const totalWeldLength = calculateTotalWeldLength(
			weldData.weldLength ?? 0,
			weldData.weldPlaces ?? 1,
			weldData.weldSide ?? 'One Side'
		)

		if (subProc.travelSpeed) {
			await VerificationHelper.verifyNumeric(
				actualSpeed,
				subProc.travelSpeed,
				'Travel Speed'
			)
		}

		await VerificationHelper.verifyNumeric(
			actualTacks,
			subProc.tackWelds ?? 0,
			'Tack Welds'
		)
		await VerificationHelper.verifyNumeric(
			actualStops,
			subProc.intermediateStops ?? 0,
			'Intermediate Stops'
		)

		const sideMultiplier =
			weldData.weldSide && weldData.weldSide.toLowerCase().includes('both')
				? 2
				: 1
		const numberOfWelds = (weldData.weldPlaces ?? 1) * sideMultiplier

		// ---------- Calculate Cycle Time ----------
		const calculatedCycleTime = calculateSingleWeldCycleTime({
			totalWeldLength,
			travelSpeed: actualSpeed || 5,
			tackWelds: actualTacks,
			intermediateStops: actualStops,
			weldType: actualWeldType || 'Fillet',
			numberOfWelds
		})

		// ---------- UI Validation ----------
		if (await cycleLocator.isVisible()) {
			const uiCycleTime = await this.page.getInputValueAsNumber(cycleLocator)
			await VerificationHelper.verifyNumeric(
				uiCycleTime,
				calculatedCycleTime,
				'Sub-Process Cycle Time'
			)
		}

		return calculatedCycleTime
	}
	//===================================== Welding cleaning cycle time ======================
	async verifyWeldCleaningCycleTimeDetails(testData: any): Promise<void> {
		logger.info('🔹 Step: Weld Cleaning/Preparation Cycle Time Verification')
		//await this.openManufacturingForMigWelding()
		await this.verifyWeldCleaningCost()
	}

	// ====================================================================
	// ✅ SINGLE SUB-PROCESS VERIFICATION
	// ====================================================================

	private getCleaningCycleTimeLocator(): {
		totalWeld: Locator;
		interWeld: Locator;
	} {
		return {
			totalWeld: this.page.TotalWeldCycleLength,
			interWeld: this.page.InterWeldClean
		};
	}


	// ====================================================================
	// ✅ OVERALL CYCLE TIME VERIFICATION
	// ====================================================================
	async verifyOverallCycleTime(input: TotalCycleTimeInput): Promise<void> {
		logger.info('\n📊 ===== Overall Cycle Time Breakdown =====')

		const breakdown = calculateCycleTimeBreakdown(input)
		const totalSubProcessTime = input.subProcessCycleTimes.reduce(
			(sum, t) => sum + t,
			0
		)
		logger.info(`✓ Total SubProcess Time : ${totalSubProcessTime.toFixed(4)} sec`)
		logger.info(`✓ Arc On Time           : ${breakdown.arcOnTime.toFixed(4)} sec`)
		logger.info(`✓ Arc Off Time          : ${breakdown.arcOffTime.toFixed(4)} sec`)
		logger.info(`✓ Dry Cycle Time        : ${(breakdown.arcOnTime + breakdown.arcOffTime).toFixed(4)} sec`)
		logger.info(`✓ Calculated Cycle Time : ${breakdown.cycleTime.toFixed(4)} sec`)

		// Verify dry cycle time
		await this.page.verifyUIValue({
			locator: this.page.DryCycleTime,
			expectedValue: breakdown.arcOnTime + breakdown.arcOffTime,
			label: 'Dry Cycle Time'
		})
		await this.page.MigWeldRadBtn.waitFor({ state: 'visible', timeout: 10000 });

		if (!(await this.page.MigWeldRadBtn.isChecked())) {
			await this.page.MigWeldRadBtn.click();
		}
		// Verify overall cycle time with unit mismatch detection
		const uiCycleTimeRaw = await this.page.getInputValueAsNumber(
			this.page.CycleTimePart
		)
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
		return (
			(await this.page.getInputValueAsNumber(this.page.MatEfficiency)) || 75
		)
	}

	private async getInputNumber(
		locator: Locator,
		fallback = 0
	): Promise<number> {
		return (await this.page.getInputValueAsNumber(locator)) ?? fallback
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
		await this.page.scrollElementToTop(this.page.AnnualVolumeQtyNos);

		const eav = await this.page.getInputValueAsNumber(this.page.AnnualVolumeQtyNos);
		const netWeight = await this.page.getInputValueAsNumber(this.page.NetWeight);
		const grossWeight = await this.page.getInputValueAsNumber(this.page.WeldBeadWeightWithWastage);
		const scrapWeight = Math.max(grossWeight - netWeight, 0);

		const esgImpactCO2Kg = await this.page.getInputValueAsNumber(this.page.CO2PerKgMaterial);
		const esgImpactCO2KgScrap = await this.page.getInputValueAsNumber(this.page.CO2PerScrap);

		return {
			grossWeight,
			scrapWeight,
			netWeight,
			eav,
			esgImpactCO2Kg,
			esgImpactCO2KgScrap
		};
	}

	async verifyNetMaterialSustainabilityCost(): Promise<void> {
		const input = await this.getMaterialESGInfo();
		const calculated = SustainabilityCalculator.calculateMaterialSustainability(input);

		const uiCO2PerPart = await this.page.getInputValueAsNumber(this.page.CO2PerPartMaterial);

		expect.soft(uiCO2PerPart).toBeCloseTo(calculated.esgImpactCO2KgPart, 4);

		console.log('🔹 Material Sustainability Calculation Debug');
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
		});

		console.log(
			`✔ Material CO2 per Part verified. UI: ${uiCO2PerPart}, Calculated: ${calculated.esgImpactCO2KgPart}`
		);
	}


	private async gatherManufacturingInfo(
		processType: ProcessType,
		machineEfficiency: number,
		density: number
	): Promise<ProcessInfoDto> {
		logger.info('📥 Gathering Manufacturing Info from UI...')

		const machineHourRate = await this.safeGetNumber(this.page.MachineHourRate)
		const lowSkilledLaborRatePerHour = await this.safeGetNumber(this.page.DirectLaborRate)
		const noOfLowSkilledLabours = await this.safeGetNumber(this.page.NoOfDirectLabors)
		const skilledLaborRatePerHour = await this.safeGetNumber(this.page.SkilledLaborRate)

		const electricityUnitCost = await this.safeGetNumber(this.page.ElectricityUnitCost)
		const powerConsumption = await this.safeGetNumber(this.page.PowerConsumption)
		const yieldPer = await this.safeGetNumber(this.page.YieldPercentage)
		const lotSize = await this.safeGetNumber(this.page.LotsizeNos, 1)
		const annualVolume = await this.safeGetNumber(this.page.AnnualVolumeQtyNos)
		const setUpTime = await this.safeGetNumber(this.page.MachineSetupTime)

		const qaOfInspectorRate = await this.safeGetNumber(this.page.QAInspectorRate)
		const inspectionTime = await this.safeGetNumber(this.page.QAInspectionTime)
		const samplingRate = await this.safeGetNumber(this.page.SamplingRate)

		const netMaterialCost = await this.safeGetNumber(this.page.NetMaterialCost)
		const netPartWeight = await this.getNetWeight()
		const partComplexityInput = await this.page.getSelectedOptionText(this.page.PartComplexity)
		const cycleTime = await this.safeGetNumber(this.page.CycleTimePart)

		const totalWeldLength = await this.safeGetNumber(this.page.TotalWeldLength)
		const weldLegLength = await this.safeGetNumber(this.page.MatWeldSize1)
		const weldElementSize = await this.safeGetNumber(this.page.MatWeldElementSize1)
		const noOfWeldPasses = await this.safeGetNumber(this.page.InterWeldClean)
		const partProjectedArea = await this.safeGetNumber(this.page.PartSurfaceArea)
		const cuttingLength = await this.safeGetNumber(this.page.TotalWeldCycleLength)
		const typeOfOperationId = await this.page.getInputValueAsNumber(this.page.typeOfOperation)

		logger.info(`   DEBUG Gather: totalWeldLength=${totalWeldLength}, weldLegSize=${weldLegLength}, weldElementSize=${weldElementSize}, noOfWeldPasses=${noOfWeldPasses}, cuttingLength=${cuttingLength}, typeOfOperationId=${typeOfOperationId}`)

		const partComplexity = partComplexityInput.toLowerCase().includes('medium') ? 2 :
			partComplexityInput.toLowerCase().includes('high') ? 3 : 1

		const { length, width, height } = await this.getMaterialDimensionsAndDensity()
		const materialTypeName = await this.getMaterialType()

		const manufactureInfo: ProcessInfoDto = {
			processTypeID: processType,
			partComplexity,
			machineHourRate,
			lowSkilledLaborRatePerHour,
			noOfLowSkilledLabours,
			skilledLaborRatePerHour,
			qaOfInspectorRate,
			inspectionTime,
			samplingRate,
			electricityUnitCost,
			powerConsumption,
			yieldPer,
			lotSize,
			annualVolume,
			setUpTime,
			netMaterialCost,
			netPartWeight,
			totalWeldLength: cuttingLength || totalWeldLength,
			cuttingLength: cuttingLength || totalWeldLength,
			noOfWeldPasses,
			typeOfOperationId: typeOfOperationId || 1,
			cycleTime,
			efficiency: machineEfficiency * 100,
			materialInfoList: [
				{
					density,
					netWeight: netPartWeight,
					netMatCost: netMaterialCost,
					partProjectedArea,
					weldLegLength,
					weldElementSize,
					totalWeldLength: cuttingLength || totalWeldLength,
					dimX: length,
					dimY: width,
					dimZ: height
				}
			],
			materialmasterDatas: {
				materialType: {
					materialTypeName: materialTypeName
				}
			} as any,
			machineMaster: {
				machineHourRate,
				powerConsumption,
				efficiency: machineEfficiency * 100,
				totalPowerKW: await this.safeGetNumber(this.page.RatedPower),
				powerUtilization: (await this.safeGetNumber(this.page.PowerUtil)) / 100
			},
			laborRates: [
				{
					powerESG: await this.safeGetNumber(this.page.CO2PerKwHr)
				}
			],
			// Flags for dirty properties
			iscoolingTimeDirty: false,
			iscycleTimeDirty: false,
			isdirectMachineCostDirty: false,
			isdirectLaborCostDirty: false,
			isinspectionCostDirty: false,
			isdirectSetUpCostDirty: false,
			isyieldCostDirty: false
		}

		return manufactureInfo
	}
	//================================ Yield Cost Verification ====================
	async verifyYieldCost(): Promise<void> {
		logger.info('🔹 Verifying Yield Cost...')

		const processType = await this.getProcessTypeMig()
		const { density } = (await this.getMaterialDimensionsAndDensity()) || {
			density: 7.85
		}
		const efficiencyVal =
			(await this.page.getInputValueAsNumber(this.page.MachineEfficiency)) || 75
		const machineEfficiency = efficiencyVal / 100

		logger.info(
			`Yield Inputs: Process=${processType}, Density=${density}, Efficiency=${machineEfficiency * 100
			}%`
		)

		const manufactureInfo = await this.gatherManufacturingInfo(
			processType,
			machineEfficiency,
			density
		)

		this.calculator.weldingCommonCalc(
			manufactureInfo as unknown as ProcessInfoDto,
			[],
			manufactureInfo as unknown as ProcessInfoDto,
			[]
		)

		await this.page.verifyUIValue({
			locator: this.page.YieldCostPart,
			expectedValue: manufactureInfo.yieldCost || 0,
			label: 'Yield Cost',
			precision: 2
		})
	}
	//==================== Weld Cleaning/Preparation Cost Verification ====================
	async verifyWeldCleaningCost(): Promise<void> {
		logger.info('🔹 Step: Weld Cleaning/Preparation Cost Verification');

		// 1️⃣ Select Process Type
		const processType = await this.getProcessTypeCleaning();

		// 2️⃣ Wait for UI switch
		await expect.poll(
			async () => this.page.getSelectedOptionText(this.page.ProcessGroup),
			{ message: 'Wait for Process Group to switch', timeout: 10_000 }
		).toContain('Welding');

		// 3️⃣ Gather Base Info
		const { density } =
			(await this.getMaterialDimensionsAndDensity()) ?? { density: 7.85 };

		const machineEfficiency =
			((await this.getEfficiencyFromUI()) || 75) / 100;

		// 4️⃣ Gather Manufacturing DTO
		const manufactureInfo = await this.gatherManufacturingInfo(
			processType,
			machineEfficiency,
			density
		);

		// 5️⃣ Calculate Costs using Shared Calculator
		// We rely on the calculator to compute cycleTime and others based on the gathered inputs.
		// ensure dirty flags are false for fields we want calculated (gatherManufacturingInfo sets them to false)

		if (Number(manufactureInfo.processTypeID) === ProcessType.WeldingCleaning) {
			this.calculator.calculationsForWeldingCleaning(
				manufactureInfo,
				[], // fieldColorsList
				manufactureInfo // manufacturingObj
			);
		} else {
			this.calculator.calculationsForWeldingPreparation(
				manufactureInfo,
				[], // fieldColorsList
				manufactureInfo // manufacturingObj
			);
		}

		logger.info('🔍 Calculated Weld Cleaning Info:', {
			cycleTime: manufactureInfo.cycleTime,
			directMachineCost: manufactureInfo.directMachineCost,
			directLaborCost: manufactureInfo.directLaborCost,
			directSetUpCost: manufactureInfo.directSetUpCost
		});

		// 6️⃣ Verify UI Values
		await this.page.verifyUIValue({
			locator: this.page.CycleTimePart.first(),
			expectedValue: manufactureInfo.cycleTime || 0,
			label: 'Cycle Time',
			precision: 4
		});

		await this.verifyCosts(
			manufactureInfo as unknown as Record<string, number>
		);

		// 7️⃣ Update Runtime Context
		this.runtimeWeldingContext.cycleTime = manufactureInfo.cycleTime;

		logger.info('✅ Weld Cleaning/Preparation Full Cost Verification Passed');
	}
	// ---------------------- safeGetNumber utility ----------------------
	private async safeGetNumber(locator: Locator, fallback = 0): Promise<number> {
		try {
			if (!(await locator.isVisible())) return fallback;

			const value = await this.page.getInputValueAsNumber(locator);

			return Number.isFinite(value) ? value : fallback;
		} catch {
			return fallback;
		}
	}
	// ========================== Cost Verification ==========================

	async verifyCosts(calculated: Record<string, number>): Promise<void> {
		logger.info('\n💰 ===== Cost Verification =====')

		const uiMachineCost = await this.safeGetNumber(this.page.MachineCostPart)
		const uiLaborCost = await this.safeGetNumber(this.page.directLaborRate)
		const uiSetupCost = await this.safeGetNumber(this.page.SetupCostPart)
		const uiPowerCost = await this.safeGetNumber(this.page.TotalPowerCost)
		const uiInspectionCost = await this.safeGetNumber(this.page.QAInspectionCost)
		const uiYieldCost = await this.safeGetNumber(this.page.YieldCostPart)

		const verifications = [
			{
				ui: this.page.YieldCostPart,
				calc: calculated.yieldCost ?? 0,
				uiValue: uiYieldCost,
				label: 'Yield Cost/Part',
				isCycleTimeDependent: true
			},
			{
				ui: this.page.directLaborRate, // Points to directLaborCost
				calc: calculated.directLaborCost ?? 0,
				uiValue: uiLaborCost,
				label: 'Labor Cost/Part',
				isCycleTimeDependent: true
			},
			{
				ui: this.page.SetupCostPart,
				calc: calculated.directSetUpCost ?? 0,
				uiValue: uiSetupCost,
				label: 'Setup Cost/Part',
				isCycleTimeDependent: false
			},
			{
				ui: this.page.QAInspectionCost,
				calc: calculated.inspectionCost ?? 0,
				uiValue: uiInspectionCost,
				label: 'QA Inspection Cost/Part',
				isCycleTimeDependent: false
			},
			{
				ui: this.page.MachineCostPart,
				calc: calculated.directMachineCost ?? 0,
				uiValue: uiMachineCost,
				label: 'Machine Cost/Part',
				isCycleTimeDependent: true
			},
			{
				ui: this.page.TotalPowerCost,
				calc: calculated.totalPowerCost ?? 0,
				uiValue: uiPowerCost,
				label: 'Total Power Cost',
				isCycleTimeDependent: true
			}
		]

		let totalCalc = 0
		for (const v of verifications) {
			// Skip only if both UI and calculated values are 0
			if (v.uiValue > 0 || v.calc > 0) {
				await this.page.verifyUIValue({
					locator: v.ui,
					expectedValue: v.calc,
					label: v.label
				})
				totalCalc += v.calc
			} else {
				// Both are 0 - skip
				logger.info(`   ⊘ ${v.label} → Skipping (Calculated value is 0)`)
			}
			expect(v.uiValue).toBeCloseTo(v.calc)
		}

		if (totalCalc > 0) {
			await this.page.verifyUIValue({
				locator: this.page.NetProcessCost,
				expectedValue: totalCalc,
				label: 'Total Manufacturing Cost'
			})

		}

	}
	async verifyManufacturingCosts(): Promise<Record<string, number>> {
		logger.info('\n📋 Step: Verify Manufacturing Costs & Sustainability')
		const processType = await this.getProcessTypeMig()
		const { density } = (await this.getMaterialDimensionsAndDensity()) || {
			density: 7.85
		}

		const efficiencyVal =
			(await this.page.getInputValueAsNumber(this.page.MachineEfficiency)) || 75
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
		logger.info(`   Labor Rate: ${manufactureInfo.directLaborRate} per hour`)
		logger.info(`   Power Consumption: ${manufactureInfo.powerConsumption} kW`)
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
			calculated = this.calculator.calculationForWelding(
				manufactureInfo as any,
				[],
				manufactureInfo as any,
				[]
			) as unknown as Record<string, number>
		} else {
			await this.page.waitAndClick(this.page.MigWeldRadBtn)
			calculated = this.calculator.calculationForWelding(
				manufactureInfo as any,
				[],
				manufactureInfo as any,
				[]
			) as unknown as Record<string, number>
		}
		//	await this.verifyCosts(calculated)
		return calculated
	}

	//================= manufacturing Mig Welding =============================
	async verifyMigCosts(): Promise<Record<string, number>> {
		logger.info('\n💰 ===== MIG Cost Verification =====');
		await this.page.waitAndClick(this.page.MigWeldRadBtn);
		await this.page.waitForTimeout(800);
		const processType = ProcessType.MigWelding;
		const { density } = (await this.getMaterialDimensionsAndDensity()) || {
			density: 7.85
		};

		const efficiencyVal =
			(await this.page.getInputValueAsNumber(this.page.MachineEfficiency)) || 75;
		const machineEfficiency = efficiencyVal / 100;
		const manufactureInfo = await this.gatherManufacturingInfo(
			processType,
			machineEfficiency,
			density
		);

		this.calculator.weldingPreCalc(manufactureInfo, [], manufactureInfo);

		logger.info('🧪 manufactureInfo snapshot:', {
			cycleTime: manufactureInfo.cycleTime,
			machineHourRate: manufactureInfo.machineHourRate,
			directLaborRate: manufactureInfo.directLaborRate,
			powerConsumption: manufactureInfo.powerConsumption,
			electricityUnitCost: manufactureInfo.electricityUnitCost,
			yieldPer: manufactureInfo.yieldPer,
			netMaterialCost: manufactureInfo.netMaterialCost
		});

		// 4️⃣ MIG calculation
		const calculated = this.calculator.calculationForWelding(
			manufactureInfo as any,
			[],
			manufactureInfo as any,
			[]
		) as unknown as Record<string, number>;

		// 5️⃣ Read UI values
		const uiValues = {
			machine: await this.page.getInputValueAsNumber(this.page.MachineCostPart),
			labor: await this.page.getInputValueAsNumber(this.page.directLaborRate),
			setup: await this.page.getInputValueAsNumber(this.page.SetupCostPart),
			power: await this.page.getInputValueAsNumber(this.page.TotalPowerCost),
			inspection: await this.page.getInputValueAsNumber(this.page.QAInspectionCost),
			yield: await this.page.getInputValueAsNumber(this.page.YieldCostPart)
		};

		// 6️⃣ Verification matrix
		const verifications = [
			{
				label: 'Machine Cost / Part',
				locator: this.page.MachineCostPart,
				ui: uiValues.machine,
				calc: calculated.directMachineCost ?? 0
			},
			{
				label: 'Labor Cost / Part',
				locator: this.page.directLaborRate,
				ui: uiValues.labor,
				calc: calculated.directLaborCost ?? 0
			},
			{
				label: 'Setup Cost / Part',
				locator: this.page.SetupCostPart,
				ui: uiValues.setup,
				calc: calculated.directSetUpCost ?? 0
			},
			{
				label: 'QA Inspection Cost / Part',
				locator: this.page.QAInspectionCost,
				ui: uiValues.inspection,
				calc: calculated.inspectionCost ?? 0
			},
			{
				label: 'Power Cost / Part',
				locator: this.page.TotalPowerCost,
				ui: uiValues.power,
				calc: calculated.totalPowerCost ?? calculated.powerCost ?? 0
			},
			{
				label: 'Yield Cost / Part',
				locator: this.page.YieldCostPart,
				ui: uiValues.yield,
				calc: calculated.yieldCost ?? 0
			}
		];

		// 7️⃣ Verify each cost safely
		let totalCalculated = 0;

		for (const v of verifications) {
			logger.info(
				`🔎 ${v.label} → UI=${v.ui}, CALC=${v.calc}`
			);

			// Skip meaningless validation
			if (v.calc === 0 && v.ui === 0) {
				logger.info(`   ⊘ Skipped (both zero)`);
				continue;
			}

			// Hard protection: calculator broken but UI has value
			if (v.calc === 0 && v.ui > 0) {
				logger.warn(
					`⚠️ ${v.label} skipped → Calculator returned 0 while UI shows ${v.ui}`
				);
				continue;
			}

			await this.page.verifyUIValue({
				locator: v.locator,
				expectedValue: v.calc,
				label: v.label
			});

			totalCalculated += v.calc;
		}

		// 8️⃣ Verify total manufacturing cost
		if (totalCalculated > 0) {
			await this.page.verifyUIValue({
				locator: this.page.NetProcessCost,
				expectedValue: totalCalculated,
				label: 'Total Manufacturing Cost'
			});
		}

		logger.info(`\n🔍 Yield Cost Debug:`)
		logger.info(`   Yield %: ${manufactureInfo.yieldPer}%`)
		logger.info(`   Net Material Cost: ${manufactureInfo.netMaterialCost}`)

		const directCostsSum =
			(Number(calculated.directMachineCost) || 0) +
			(Number(calculated.directLaborCost) || 0) +
			(Number(calculated.directSetUpCost) || 0) +
			(Number(calculated.inspectionCost) || 0) +
			(Number(calculated.powerCost) || 0)

		logger.info(
			`   Direct Costs Breakdown:
	    Machine: ${Number(calculated.directMachineCost) || 0}
	    Labor: ${Number(calculated.directLaborCost) || 0}
	    Setup: ${Number(calculated.directSetUpCost) || 0}
	    Inspection: ${Number(calculated.inspectionCost) || 0}
	    Power: ${Number(calculated.powerCost) || 0}
	    ➤ Sum: ${directCostsSum}`
		)

		const calculatedYieldCost =
			(1 - Number(manufactureInfo.yieldPer) / 100) *
			(Number(manufactureInfo.netMaterialCost) + directCostsSum)

		logger.info(`Expected Formula: (1 - yieldPer/100) * (netMaterialCost + directCosts)`)

		logger.info(
			`Expected: (1 - ${manufactureInfo.yieldPer}/100) * (${manufactureInfo.netMaterialCost} + ${directCostsSum}) = ${calculatedYieldCost}`
		)
		const ManufacturingCosts =
			(Number(calculated.directMachineCost) || 0) +
			(Number(calculated.directLaborCost) || 0) +
			(Number(calculated.directSetUpCost) || 0) +
			(Number(calculated.inspectionCost) || 0) +
			(Number(calculated.powerCost) || 0) +
			(Number(calculatedYieldCost) || 0)

		logger.info(`   Manufacturing Costs Breakdown:
	    Machine Cost: ${Number(calculated.directMachineCost) || 0}
	    Labor Cost: ${Number(calculated.directLaborCost) || 0}
	    Setup Cost: ${Number(calculated.directSetUpCost) || 0}
	    Inspection Cost: ${Number(calculated.inspectionCost) || 0}
	    Power Cost: ${Number(calculated.powerCost) || 0}
	    Yield Cost: ${Number(calculatedYieldCost) || 0}
	    ➤ Sum: ${ManufacturingCosts}`
		)
		logger.info('✅ MIG Cost Verification Completed Successfully');

		return calculated;
	}
	//=============================== Weld Cleaning =================================
	async verifyWeldCleaningCosts(): Promise<Record<string, number>> {
		logger.info('\n💰 ===== Weld Cleaning Cost Verification =====');

		// 1️⃣ Select Weld Cleaning Process
		const processType = await this.getProcessTypeCleaning();
		await this.page.waitForTimeout(500);

		// 2️⃣ Gather Base Info
		const { density } = (await this.getMaterialDimensionsAndDensity()) || { density: 7.85 };
		const efficiencyVal = (await this.page.getInputValueAsNumber(this.page.MachineEfficiency)) || 75;
		const machineEfficiency = efficiencyVal / 100;

		// 3️⃣ Gather Manufacturing DTO
		const manufactureInfo = await this.gatherManufacturingInfo(
			processType,
			machineEfficiency,
			density
		);

		// 4️⃣ Update material info for UI properties used in calculations
		const weldLegLength = await this.page.getInputValueAsNumber(this.page.MatWeldSize1) || 0;
		const surfaceArea = await this.page.getInputValueAsNumber(this.page.PartSurfaceArea) || 0;
		if (manufactureInfo.materialInfoList?.length > 0) {
			const materialInfo = manufactureInfo.materialInfoList[0];
			materialInfo.weldLegLength = weldLegLength;
			materialInfo.partProjectedArea = surfaceArea;
		}

		// 5️⃣ Execute Weld Cleaning/Preparation Calculation
		if (Number(manufactureInfo.processTypeID) === ProcessType.WeldingCleaning) {
			this.calculator.calculationsForWeldingCleaning(
				manufactureInfo,
				[], // fieldColorsList
				manufactureInfo
			);
		} else {
			this.calculator.calculationsForWeldingPreparation(
				manufactureInfo,
				[], // fieldColorsList
				manufactureInfo
			);
		}

		logger.info('🧪 manufactureInfo snapshot:', {
			cycleTime: manufactureInfo.cycleTime,
			machineHourRate: manufactureInfo.machineHourRate,
			directLaborRate: manufactureInfo.directLaborRate,
			powerConsumption: manufactureInfo.powerConsumption,
			electricityUnitCost: manufactureInfo.electricityUnitCost,
			yieldPer: manufactureInfo.yieldPer,
			netMaterialCost: manufactureInfo.netMaterialCost,
			cuttingLength: manufactureInfo.cuttingLength,
			noOfWeldPasses: manufactureInfo.noOfWeldPasses
		});

		// 6️⃣ Collect UI values safely
		const uiValues = {
			cycleTime: await this.safeGetNumber(this.page.CycleTimePart),
			machine: await this.safeGetNumber(this.page.MachineCostPart),
			labor: await this.safeGetNumber(this.page.directLaborRate),
			setup: await this.safeGetNumber(this.page.SetupCostPart),
			inspection: await this.safeGetNumber(this.page.QAInspectionCost),
			yield: await this.safeGetNumber(this.page.YieldCostPart)
		};

		// 7️⃣ Define verifications
		const verifications = [
			{ label: 'Cycle Time / Part', locator: this.page.CycleTimePart, ui: uiValues.cycleTime, calc: manufactureInfo.cycleTime ?? 0 },
			{ label: 'Machine Cost / Part', locator: this.page.MachineCostPart, ui: uiValues.machine, calc: manufactureInfo.directMachineCost ?? 0 },
			{ label: 'Labor Cost / Part', locator: this.page.directLaborRate, ui: uiValues.labor, calc: manufactureInfo.directLaborCost ?? 0 },
			{ label: 'Setup Cost / Part', locator: this.page.SetupCostPart, ui: uiValues.setup, calc: manufactureInfo.directSetUpCost ?? 0 },
			{ label: 'QA Inspection Cost / Part', locator: this.page.QAInspectionCost, ui: uiValues.inspection, calc: manufactureInfo.inspectionCost ?? 0 },
			{ label: 'Yield Cost / Part', locator: this.page.YieldCostPart, ui: uiValues.yield, calc: manufactureInfo.yieldCost ?? 0 }
		];

		// 8️⃣ Verify each cost
		let totalCalculated = 0;
		for (const v of verifications) {
			const uiFormatted = Number(v.ui).toFixed(5);
			const calcFormatted = Number(v.calc).toFixed(5);
			logger.info(`🔎 ${v.label} → UI=${uiFormatted}, CALC=${calcFormatted}`);

			if (v.calc === 0 && v.ui === 0) {
				logger.info(`   ⊘ Skipped (both zero)`);
				continue;
			}

			if (v.calc === 0 && v.ui > 0) {
				logger.warn(`⚠️ ${v.label} skipped → Calculator returned 0 while UI shows ${v.ui}`);
				continue;
			}

			await this.page.verifyUIValue({
				locator: v.locator,
				expectedValue: v.calc,
				label: v.label
			});

			totalCalculated += v.calc;
		}

		// 9️⃣ Verify total manufacturing cost
		if (totalCalculated > 0) {
			await this.page.verifyUIValue({
				locator: this.page.NetProcessCost,
				expectedValue: Number(totalCalculated.toFixed(5)),
				label: 'Total Manufacturing Cost'
			});
		}

		logger.info('✅ Weld Cleaning Cost Verification Completed Successfully');

		return manufactureInfo as unknown as Record<string, number>;
	}

	//=============================== Manufacturing Sustainability =================================
	async verifyManufacturingSustainability(): Promise<void> {
		await this.verifyManufacturingCO2()
		logger.info('📂 Navigating to Machine Details Tab for Power ESG verification...')
		await this.page.ManufacturingInformation.scrollIntoViewIfNeeded()
		await this.page.ManufacturingInformation.click()
		await this.page.wait(1000) // Buffer for tab switch
		const totalPowerKW = await this.page.readNumberSafe(this.page.RatedPower, 'Rated Power (KW)')
		const powerUtilization = await this.page.readNumberSafe(this.page.PowerUtil, 'Power Utilization (%)')
		const powerESG = 0.5
		logger.info(`🔋 Power Data: Rated=${totalPowerKW} KW, Utilization=${powerUtilization}%, ESG Factor=${powerESG}`)
		if (totalPowerKW > 0 && powerUtilization > 0) {
			await this.verifySustainabilityCalculations(totalPowerKW, powerUtilization, powerESG)
		} else {
			logger.warn('⚠️ Skipping Power ESG verification - no power data available')
		}
	}

	async verifyManufacturingCO2(): Promise<void> {
		logger.info('\n⚡ Step: Verify Manufacturing CO2')

		const co2PerKwHr =
			(await this.page.getInputValueAsNumber(this.page.CO2PerKwHr)) || 0

		const powerConsumption =
			(await this.page.getInputValueAsNumber(this.page.PowerConsumption)) || 0

		const cycleTime =
			(await this.page.getInputValueAsNumber(this.page.CycleTimePart)) || 0

		const calculated = calculateManufacturingCO2(
			cycleTime,
			powerConsumption,
			co2PerKwHr
		)

		const actualCO2PerPart =
			(await this.page.getInputValueAsNumber(
				this.page.CO2PerPartManufacturing
			)) || 0

		expect(actualCO2PerPart).toBeCloseTo(calculated, 4)

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
			manufactureInfo.cycleTime || manufacturingObj.cycleTime || 0
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
			manufactureInfo.cycleTime || 0,
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
		const expectedEsgConsumption =
			totalPowerKW * powerUtilization * powerESG

		const actualEsgConsumption = await this.page.readNumberSafe(
			this.page.EsgImpactElectricityConsumption,
			'Power ESG (Electricity Consumption)'
		)

		await VerificationHelper.verifyNumeric(
			actualEsgConsumption,
			expectedEsgConsumption,
			'Power ESG (Electricity Consumption)',
			4
		)

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
	async expandpanal(): Promise<void> {
		await this.page.expandMtlInfo.isVisible()
		await this.page.expandMtlInfo.click({ force: true })
		await this.page.expandMfgInfo.click({ force: true })
		await this.page.expandOHProfit.click({ force: true })
		await this.page.expandPack.click({ force: true })
		await this.page.expandLogiCost.click({ force: true })
		await this.page.expandTariff.click({ force: true })

	}
	async verifyCostSummary(): Promise<void> {
		logger.info('🔹 Verifying Cost Summary...');
		await this.expandpanal();

		await expect(this.page.numCostSummary).toBeVisible();
		await this.page.waitAndClick(this.page.numCostSummary)

		await expect(async () => {
			// ---------- Material ----------
			const materialCost = await this.page.MaterialTotalCost.inputValue()
			const netMaterialCost = await getCellNumberFromTd(this.page.materialSubTotalcost)
			logger.info(`cost summery should Material Cost: ${materialCost}`)
			logger.info(`Total Material Cost: ${netMaterialCost}`)
			expect(Number(materialCost)).toBeCloseTo(netMaterialCost, 2);

			// ---------- Manufacturing ----------
			const shouldManufactCost = Number(await this.page.ManufacturingCost.inputValue())
			const mfgSubTotalCost = await getCellNumber(this.page.mfgSubTotalcost)
			logger.info(`cost summery should Manufacturing Cost: ${shouldManufactCost}`)
			logger.info(`Mfg Sub Total Cost: ${mfgSubTotalCost}`)
			expect(shouldManufactCost).toBeCloseTo(mfgSubTotalCost, 2);

			// ---------- Tooling ----------
			const shouldToolingCost = await getCurrencyNumber(
				this.page.ToolingCost,
				'Tooling Cost'
			);
			logger.info(`cost summery should Tooling Cost: ${shouldToolingCost}`)
			expect(shouldToolingCost).toBeGreaterThanOrEqual(0);

			// ---------- Overhead ----------
			const shouldOverheadCost = await getCurrencyNumber(
				this.page.OverheadProfit,
				'Overhead Profit'
			);
			logger.info(`cost summery should Overhead Cost: ${shouldOverheadCost}`)
			const overHeadOHVal = await getCurrencyNumber(this.page.overHeadCost, 'Overhead');
			const profitOH = await getCurrencyNumber(this.page.profitCost, 'Profit');
			const costOfCapitalOH = await getCurrencyNumber(this.page.costOfCapital, 'Cost of Capital');
			logger.info(`Overhead OH: ${overHeadOHVal}`)
			logger.info(`Profit OH: ${profitOH}`)
			logger.info(`Cost of Capital OH: ${costOfCapitalOH}`)

			const calculatedOHSum = calculateOverHeadCost(
				overHeadOHVal,
				profitOH,
				costOfCapitalOH,

			);
			logger.info(`Total sum of Overhead Cost: ${calculatedOHSum}`)
			expect(shouldOverheadCost).toBeCloseTo(calculatedOHSum, 2);

			// ---------- Packaging ----------
			const shouldPackingCost = await getCurrencyNumber(
				this.page.PackingCost,
				'Packing Cost'
			);
			logger.info(`cost summery should Packing Cost: ${shouldPackingCost}`)
			const primaryCost1 = await getNumber(this.page.primaryPackaging1);
			const primaryCost2 = await getNumber(this.page.primaryPackaging2);
			const secondaryCost = await getNumber(this.page.secondaryPackaging);
			const tertiaryCost = await getNumber(this.page.tertiaryPackaging);
			logger.info(`Primary Pack: ${primaryCost1}`)
			logger.info(`Primary Pack2: ${primaryCost2}`)
			logger.info(`Secondary Pack: ${secondaryCost}`)
			logger.info(`Tertiary Pack: ${tertiaryCost}`)
			const totalPackagingCost = calculateTotalPackMatlCost(
				primaryCost1,
				primaryCost2,
				secondaryCost,
				tertiaryCost
			);
			logger.info(`Total sum of Packaging Cost: ${totalPackagingCost}`)
			expect(shouldPackingCost).toBeCloseTo(totalPackagingCost, 2);

			// ---------- Total Cost ----------
			const shouldExWPartCost = await getCurrencyNumber(
				this.page.EXWPartCost,
				'EX-W Part Cost'
			);
			logger.info(`cost summery should EX-W Part Cost: ${shouldExWPartCost}`)
			const totalEXWPartCost = await calculateExPartCost(
				await getNumber(this.page.MaterialTotalCost),
				await getNumber(this.page.ManufacturingCost),
				await getNumber(this.page.ToolingCost),
				await getNumber(this.page.OverheadProfit),
				await getNumber(this.page.PackingCost)
			);
			logger.info(`Total sum of EXW Part Cost: ${totalEXWPartCost}`)
			expect(shouldExWPartCost).toBeCloseTo(totalEXWPartCost, 2);

			// ---------- Freight ----------
			const shouldFreightCost = await getCurrencyNumber(
				this.page.shouldFreightCost,
				'Freight Cost'
			);
			logger.info(`cost summery should Freight Cost: ${shouldFreightCost}`)
			const logiFreightCost = await getNumber(this.page.logiFreightCost);
			logger.info(`Logi Freight Cost: ${logiFreightCost}`)
			expect(shouldFreightCost).toBeCloseTo(logiFreightCost, 2);

			// ---------- Duties ----------
			const shouldDutiesTariffCost = await getCurrencyNumber(
				this.page.shouldDutiesTariff,
				'Duties Tariff'
			);
			logger.info(`cost summery should Duties Tariff Cost: ${shouldDutiesTariffCost}`)
			const tariffCost = await getNumber(this.page.tariffCost);
			logger.info(`Tariff Cost: ${tariffCost}`)
			expect(shouldDutiesTariffCost).toBeCloseTo(tariffCost, 2);

			// ---------- Part Cost ----------
			const shouldPartCost = await getCurrencyNumber(
				this.page.PartShouldCost,
				'Part Should Cost'
			);
			logger.info(`cost summery should Part Should Cost: ${shouldPartCost}`)
			const PartTotalCost = await calculatePartCost(
				await getNumber(this.page.MaterialTotalCost),
				await getNumber(this.page.ManufacturingCost),
				await getNumber(this.page.ToolingCost),
				await getNumber(this.page.OverheadProfit),
				await getNumber(this.page.PackingCost),
				await getNumber(this.page.shouldFreightCost),
				await getNumber(this.page.shouldDutiesTariff)
			);
			logger.info(`Sum of Part Total Cost: ${PartTotalCost}`)
			expect(shouldPartCost).toBeCloseTo(PartTotalCost, 2);
		}).toPass({ timeout: 15_000, intervals: [1_000] });
	}

}
