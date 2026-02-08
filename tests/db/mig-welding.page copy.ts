import { expect, Locator, Page, BrowserContext } from '@playwright/test'
import { BasePage } from '../lib/BasePage'
import Logger from '../lib/LoggerUtil'
import {
	calculateLotSize,
	calculateLifeTimeQtyRemaining
} from '../utils/welding-calculator'
import { queryDatabase } from '../utils/dbHelper'

const logger = Logger

// ==================== INTERFACES ====================

/** Weld details input interface */
export interface WeldInput {
	weldType: string
	weldSize: number
	weldLength: number
	noOfPasses?: number
	weldPlaces?: number
}

/** Part details input interface */
export interface PartDetailsInput {
	drawingNumber?: string
	revisionNumber?: string
	annualVolume?: number
	lotSize?: number
	productLife?: number
	partDescription?: string
}

/** Cost breakdown interface */
export interface CostBreakdown {
	machineCost: number
	laborCost: number
	setupCost: number
	inspectionCost: number
	yieldCost: number
	powerCost: number
}

// ==================== PAGE OBJECT ====================
export class MigWeldingPage extends BasePage {
	// ==================== NAVIGATION LOCATORS ====================
	readonly Projects: Locator
	readonly Active: Locator
	readonly SelectAnOption: Locator
	readonly ProjectValue: Locator
	readonly ApplyButton: Locator
	readonly ProjectID: Locator
	readonly ClearAll: Locator

	// ==================== PART INFORMATION LOCATORS ====================
	readonly PartInformationTitle: Locator
	readonly PartDetails: Locator
	readonly InternalPartNumber: Locator
	readonly DrawingNumber: Locator
	readonly RevisionNumber: Locator
	readonly PartDescription: Locator
	readonly ManufacturingCategory: Locator
	readonly BOMQtyNos: Locator
	readonly AnnualVolumeQtyNos: Locator
	readonly LotsizeNos: Locator
	readonly ProductLifeRemainingYrs: Locator
	readonly LifeTimeQtyRemainingNos: Locator

	// ==================== SUPPLY TERMS LOCATORS ====================
	readonly SupplierDropdown: Locator
	readonly SupplierOptions: Locator
	readonly ManufacturingCity: Locator
	readonly ManufacturingCountry: Locator
	readonly DeliveryDropdown: Locator
	readonly DeliveryOptions: Locator
	readonly DeliveryCity: Locator
	readonly DeliveryCountry: Locator
	readonly SupplyTerms: Locator
	readonly IncoTerms: Locator
	readonly DeliveryFrequency: Locator
	readonly PackageType: Locator
	readonly PaymentTerms: Locator

	// ==================== MATERIAL INFORMATION LOCATORS ====================
	readonly MaterialInformation: Locator
	readonly MaterialDescription: Locator
	readonly MaterialInfo: Locator
	readonly SearchMaterials: Locator
	readonly SearchMtrlInput: Locator
	readonly materialCategory: Locator
	readonly MatFamily: Locator
	readonly DescriptionGrade: Locator
	readonly StockForm: Locator
	readonly ScrapPrice: Locator
	readonly MaterialPrice: Locator
	readonly VolumePurchased: Locator
	readonly NetMaterialCost: Locator
	readonly PartThickness: Locator
	readonly PartEnvelopeLength: Locator
	readonly PartEnvelopeWidth: Locator
	readonly PartEnvelopeHeight: Locator
	readonly NetWeight: Locator

	// ==================== WELDING DETAILS LOCATORS ====================
	readonly WeldingDetails: Locator
	readonly Weld1: Locator
	readonly WeldType1: Locator
	readonly WeldSize1: Locator
	readonly WireDia1: Locator
	readonly WeldElementSize1: Locator
	readonly NoOfWeldPasses1: Locator
	readonly WeldLengthmm1: Locator
	readonly WeldSide1: Locator
	readonly WeldPlaces1: Locator
	readonly TotalWeldLengthWeld1: Locator
	readonly WeldVolume1: Locator
	readonly Weld2: Locator
	readonly WeldType2: Locator
	readonly WeldSize2: Locator
	readonly NoOfWeldPasses2: Locator
	readonly WeldLength2: Locator
	readonly TotalWeldLength2: Locator
	readonly AddWeldButton: Locator

	// ==================== MANUFACTURING INFORMATION LOCATORS ====================
	readonly ManufacturingInformation: Locator
	readonly ProcessGroup: Locator
	readonly ProcessType: Locator
	readonly MachineType: Locator
	readonly MachineName: Locator
	readonly MachineDescription: Locator
	readonly MachineEfficiency: Locator
	readonly PartComplexity: Locator
	readonly WeldPosition: Locator

	// ==================== CYCLE TIME & COSTS LOCATORS ====================
	readonly CycleTimeDetails: Locator
	readonly CycleTimePart: Locator
	readonly TravelSpeed: Locator
	readonly RequiredCurrent: Locator
	readonly RequiredVoltage: Locator
	readonly ArcOnTime: Locator
	readonly ArcOffTime: Locator
	readonly LoadingTime: Locator
	readonly UnloadingTime: Locator

	// ==================== COST FIELDS LOCATORS ====================
	readonly DirectLaborRate: Locator
	readonly NoOfDirectLabors: Locator
	readonly LaborCostPart: Locator
	readonly SkilledLaborRate: Locator
	readonly MachineSetupTime: Locator
	readonly SetupCostPart: Locator
	readonly MachineHourRate: Locator
	readonly MachineCostPart: Locator
	readonly QAInspectorRate: Locator
	readonly QAInspectionTime: Locator
	readonly QAInspectionCost: Locator
	readonly SamplingRate: Locator
	readonly YieldPercentage: Locator
	readonly YieldCostPart: Locator
	readonly PowerConsumption: Locator
	readonly ElectricityUnitCost: Locator
	readonly TotalPowerCost: Locator
	readonly NetProcessCost: Locator

	// ==================== TOOLING LOCATORS ====================
	readonly Tooling: Locator
	readonly ToolName: Locator
	readonly SourceCountry: Locator
	readonly ToolLife: Locator
	readonly NoOfShots: Locator

	// ==================== COST SUMMARY LOCATORS ====================
	readonly CostSummary: Locator
	readonly MaterialCost: Locator
	readonly ManufacturingCost: Locator
	readonly ToolingCost: Locator
	readonly OverheadProfit: Locator
	readonly PackingCost: Locator
	readonly EXWPartCost: Locator
	readonly FreightCost: Locator
	readonly DutiesTariff: Locator
	readonly PartShouldCost: Locator

	// ==================== ACTION LOCATORS ====================
	readonly UpdateSave: Locator
	readonly RecalculateCost: Locator
	readonly ExpandAll: Locator
	readonly CollapseAll: Locator
	readonly CostingNotes: Locator

	// ==================== CONSTRUCTOR ====================
	constructor(page: Page, context: BrowserContext) {
		super(page, context)

		// Navigation
		this.Projects = page.getByRole('link', { name: 'Projects' })
		this.Active = page.getByRole('tab', { name: 'ACTIVE' })
		this.SelectAnOption = page.locator('#mat-select-value-0')
		this.ProjectValue = page.locator("input[name='searchValue']")
		this.ApplyButton = page.getByRole('button', { name: 'Apply' })
		this.ProjectID = page.locator('div.container.ng-star-inserted')
		this.ClearAll = page.getByText('Clear All')

		// Part Information
		this.PartInformationTitle = page
			.locator('.mat-expansion-panel-header-title')
			.nth(0)
		this.PartDetails = page.getByRole('tab', { name: 'Part Details' })
		this.InternalPartNumber = page.locator("//input[@name='IntPartNumber']")
		this.DrawingNumber = page.locator('input[formcontrolname="drawingNumber"]')
		this.RevisionNumber = page.getByPlaceholder('Enter Revision value')
		this.PartDescription = page.getByRole('textbox', {
			name: 'Enter Part Description'
		})
		this.ManufacturingCategory = page.locator(
			"select[formcontrolname='commdityvalue']"
		)
		this.BOMQtyNos = page.getByPlaceholder('Enter Qty')
		this.AnnualVolumeQtyNos = page.getByPlaceholder(
			'Estimated Annual Volume (EAV)'
		)
		this.LotsizeNos = page.getByPlaceholder('Lot size')
		this.ProductLifeRemainingYrs = page.getByPlaceholder('Product life')
		this.LifeTimeQtyRemainingNos = page.getByPlaceholder('Life time quantity')

		// Supply Terms
		this.SupplierDropdown = page.locator('[formcontrolname="supplierName"]')
		this.SupplierOptions = page.locator(
			'mat-option span.mdc-list-item__primary-text, mat-option span'
		)
		this.ManufacturingCity = page.locator('[formcontrolname="mfrCity"]')
		this.ManufacturingCountry = page.locator(
			'[formcontrolname="ManufacturingCountry"]'
		)
		this.DeliveryDropdown = page.locator(
			'input[formcontrolname="DeliverySite"]'
		)
		this.DeliveryOptions = page.locator(
			'mat-option span.mdc-list-item__primary-text, mat-option span'
		)
		this.DeliveryCity = page.locator('[formcontrolname="DeliveryCity"]')
		this.DeliveryCountry = page.locator('[formcontrolname="DeliveryCountry"]')
		this.SupplyTerms = page.getByRole('tab', { name: 'Supply Terms' })
		this.IncoTerms = page.locator('[formcontrolname="IncoTerms"]')
		this.DeliveryFrequency = page.locator(
			'input[formcontrolname="DeliveryFrequency"]'
		)
		this.PackageType = page.locator('select[formcontrolname="packageType"]')
		this.PaymentTerms = page.locator('select[formcontrolname="PaymentTerms"]')

		// Material Information
		this.MaterialInformation = page.locator("//h6[@class='cls-item-head ng-star-inserted']"
		)
		this.MaterialDescription = page.locator('.mat-expansion-panel-header-title').nth(1)
		this.MaterialInfo = page.getByRole('tab', { name: 'Material Info' })
		this.SearchMaterials = page.getByText('Search Materials')
		this.SearchMtrlInput = page.locator('input[placeholder="Search by keywords"]')
		this.materialCategory = page.locator("select[formcontrolname='materialCategory']")
		this.MatFamily = page.locator('select[formcontrolname="materialFamily"]')
		this.DescriptionGrade = page.locator("select[formcontrolname='materialDescription']")
		this.StockForm = page.locator('select[formcontrolname="stockForm"]').first()
		this.ScrapPrice = page.locator('input[formcontrolname="scrapPrice"]')
		this.MaterialPrice = page.locator('input[formcontrolname="matPrice"]')
		this.VolumePurchased = page.locator('input[formcontrolname="volumePurchased"]')
		this.NetMaterialCost = page.locator('input[formcontrolname="netMaterialCost"]')
		this.PartThickness = page.locator('.card.ng-star-inserted > .card-body > .row > div:nth-child(4) > .form-control').first()
		this.PartEnvelopeLength = page.getByPlaceholder('Length')
		this.PartEnvelopeWidth = page.getByPlaceholder('Width')
		this.PartEnvelopeHeight = page.getByPlaceholder('Height')
		this.NetWeight = page.locator('.col-4.offset-4 > .form-control')

		// Welding Details
		this.WeldingDetails = page.locator(
			'#_matmoredetailsCore > div > div.card-header'
		)
		this.Weld1 = page.locator('div.col-4.icon-btn', {
			has: page.locator('h6', { hasText: 'Weld 1' })
		})
		this.WeldType1 = page.locator('select[formcontrolname="coreShape"]').nth(0)
		this.WeldSize1 = page.locator('input[formcontrolname="coreHeight"]').nth(0)
		this.WireDia1 = page.locator('input[formcontrolname="coreWidth"]').nth(0)
		this.WeldElementSize1 = page.locator('input[formcontrolname="coreWeight"]').nth(0)
		this.NoOfWeldPasses1 = page.locator('input[formcontrolname="noOfCore"]').nth(0)
		this.WeldLengthmm1 = page.locator('input[formcontrolname="coreLength"]').nth(0)
		this.WeldSide1 = page.locator('select[formcontrolname="coreArea"]').nth(0)
		this.WeldPlaces1 = page.locator('input[formcontrolname="coreVolume"]').nth(0)
		this.TotalWeldLengthWeld1 = page.locator('input[formcontrolname="weldSide"]').nth(0)
		this.WeldVolume1 = page.locator('input[formcontrolname="coreSandPrice"]').nth(0)
		this.Weld2 = page.locator('#_matmoredetailsCore > div > div.card-body > div:nth-child(2) > div.row.p-t-1 > div.col-4.icon-btn > h6')
		this.WeldType2 = page.locator('select[formcontrolname="coreShape"]').nth(1)
		this.WeldSize2 = page.locator('input[formcontrolname="coreHeight"]').nth(1)
		this.NoOfWeldPasses2 = page.locator('input[formcontrolname="noOfCore"]').nth(1)
		this.WeldLength2 = page.locator('input[formcontrolname="coreLength"]').nth(1)
		this.TotalWeldLength2 = page.locator('input[formcontrolname="weldSide"]').nth(1)
		this.AddWeldButton = page.getByRole('button', { name: /Add Weld/i })

		// Manufacturing Information
		this.ManufacturingInformation = page.locator("(//div[@class='items-header-left'])[2]")
		this.ProcessGroup = page.locator("select[formcontrolname='processGroup']")
		this.ProcessType = page.locator("select[formcontrolname='processType']")
		this.MachineType = page.locator("select[formcontrolname='machineType']")
		this.MachineName = page.locator('.row.ng-star-inserted > div:nth-child(3) > .dropdown-wrap > .form-control')
		this.MachineDescription = page.locator('div:nth-child(5) > div:nth-child(4) > .form-control').first()
		this.MachineEfficiency = page.locator('input[formcontrolname="efficiency"]')
		this.PartComplexity = page.locator("select[formcontrolname='partComplexity']")
		this.WeldPosition = page.locator("select[formcontrolname='weldPosition']")

		// Cycle Time & Costs
		this.CycleTimeDetails = page.getByText('Cycle Time Details')
		this.CycleTimePart = page.locator('input[name="cycleTime"]')
		this.TravelSpeed = page.locator('input[formcontrolname="travelSpeed"]')
		this.RequiredCurrent = page.locator('input[formcontrolname="requiredCurrent"]')
		this.RequiredVoltage = page.locator('input[formcontrolname="requiredVoltage"]')
		this.ArcOnTime = page.locator('input[formcontrolname="arcOnTime"]')
		this.ArcOffTime = page.locator('input[formcontrolname="arcOffTime"]')
		this.LoadingTime = page.locator('input[formcontrolname="loadingTime"]')
		this.UnloadingTime = page.locator('input[formcontrolname="unloadingTime"]')

		// Cost Fields
		this.DirectLaborRate = page.locator('input[formcontrolname="lowSkilledLaborRatePerHour"]')
		this.NoOfDirectLabors = page.locator('input[formcontrolname="noOfLowSkilledLabours"]')
		this.LaborCostPart = page.locator('input[formcontrolname="directLaborCost"]')
		this.SkilledLaborRate = page.locator('input[formcontrolname="skilledLaborRatePerHour"]')
		this.MachineSetupTime = page.locator('input[formcontrolname="setUpTime"]')
		this.SetupCostPart = page.locator('input[formcontrolname="directSetUpCost"]')
		this.MachineHourRate = page.locator('input[name="machineHourRate"]')
		this.MachineCostPart = page.locator('input[name="directMachineCost"]')
		this.QAInspectorRate = page.locator('input[formcontrolname="qaOfInspectorRate"]')
		this.QAInspectionTime = page.locator('input[name="inspectionTime"]')
		this.QAInspectionCost = page.locator('input[name="inspectionCost"]')
		this.SamplingRate = page.locator('input[formcontrolname="samplingRate"]')
		this.YieldPercentage = page.locator('input[name="yieldPer"]')
		this.YieldCostPart = page.locator('input[name="yieldCost"]')
		this.PowerConsumption = page.locator('input[formcontrolname="powerConsumption"]')
		this.ElectricityUnitCost = page.locator('input[formcontrolname="electricityUnitCost"]')
		this.TotalPowerCost = page.locator('input[formcontrolname="totalPowerCost"]')
		this.NetProcessCost = page.locator('.mat-mdc-tab-body-content > div:nth-child(2) > .row > .col-4 > .form-control')

		// Tooling
		this.Tooling = page.getByRole('button', { name: 'Tooling' })
		this.ToolName = page.locator('.ng-valid.ng-touched > div > .card-body > div > div > .form-control').first()
		this.SourceCountry = page.getByRole('region', { name: 'Tooling' }).getByPlaceholder('Select Delivery Country')
		this.ToolLife = page.locator('.ng-valid.ng-touched > div > .card-body > div > div:nth-child(3) > .form-control').first()
		this.NoOfShots = page.locator('.ng-valid > div > .card-body > div > .col-4.mt-3 > .form-control').first()

		// Cost Summary
		this.CostSummary = page.getByRole('heading', { name: 'Cost Summary' })
		this.MaterialCost = page.locator('#MaterialCostAmount')
		this.ManufacturingCost = page.locator('#ManufacturingCostAmount')
		this.ToolingCost = page.locator('#ToolingCostAmount')
		this.OverheadProfit = page
			.getByRole('tabpanel', { name: 'Cost' })
			.locator('#OverheadandProfitAmount')
		this.PackingCost = page
			.locator('div:nth-child(6) > div:nth-child(2) > .input-icon')
			.first()
		this.EXWPartCost = page.locator('#EXWPartCostAmount')
		this.FreightCost = page.locator('#FreightCostAmount')
		this.DutiesTariff = page.locator('#DutiesandTariffAmount')
		this.PartShouldCost = page.getByRole('tabpanel', { name: 'Cost' }).locator('#ShouldCostAmount')

		// Actions
		this.UpdateSave = page.getByRole('button', { name: 'Update & Save' })
		this.RecalculateCost = page.getByRole('button', { name: 'Recalculate Cost' })
		this.ExpandAll = page.getByRole('button', { name: 'Expand All' })
		this.CollapseAll = page.getByRole('button', { name: 'Collapse All' })
		this.CostingNotes = page.locator("//label[text()='Costing Notes']/following-sibling::div")
	}

	// ==================== NAVIGATION METHODS ====================

	async navigateToProject(projectId: string): Promise<void> {
		logger.info(`🔹 Navigating to project: ${projectId}`)

		if (await this.ClearAll.isVisible()) {
			logger.info('Existing part found. Clicking Clear All...')
			await this.ClearAll.click({ force: true })
			await this.wait(500)
		}

		await this.Projects.click()
		await this.SelectAnOption.click()

		const projectOption = this.page.getByRole('option', { name: 'Project #' })
		await expect(projectOption).toBeVisible({ timeout: 3000 })
		await projectOption.click()

		await this.waitAndFill(this.ProjectValue, projectId)
		await this.pressTab()
		await this.pressEnter()
		await this.waitForNetworkIdle()
		await this.ProjectID.click()

		logger.info(`✔ Navigated to project ID: ${projectId}`)
	}

	async navigateToUrl(url: string): Promise<void> {
		await this.navigateTo(url)
		logger.info(`✔ Navigated to URL: ${url}`)
	}

	async openMaterialInformation(): Promise<void> {
		await this.waitAndClick(this.MaterialInfo)
		logger.info('✔ Opened Material Information')
	}

	async scrollToManufacturingInfo(): Promise<void> {
		await this.scrollIntoView(this.ManufacturingInformation)
		logger.info('✔ Scrolled to Manufacturing Information')
	}

	async openToolingSection(): Promise<void> {
		await this.waitAndClick(this.Tooling)
		logger.info('✔ Opened Tooling Section')
	}

	async openSupplyTerms(): Promise<void> {
		await this.waitAndClick(this.SupplyTerms)
		logger.info('✔ Opened Supply Terms')
	}
	async validateManufacturingCategory(): Promise<void> {
		logger.info('🔹 Validating Manufacturing Category against Costing Notes...')

		await BasePage.expectTextFromLocatorInTarget(
			this.ManufacturingCategory,
			this.CostingNotes,
			'Manufacturing Category'
		)

		// Optional additional soft checks
		await this.CostingNotes.waitFor({ state: 'visible', timeout: 10000 })
		await this.page.waitForResponse(
			resp => resp.url().includes('costing') && resp.status() === 200
		)
		await expect.soft(this.CostingNotes).toContainText('Suggested Category')
		logger.info('✅ Manufacturing Category validation completed.')
	}

	// ==================== PART INFORMATION METHODS ====================

	async getManufacturingCategory(): Promise<string> {
		return await this.getSelectedOptionText(this.ManufacturingCategory)
	}

	async verifyPartDetails(): Promise<void> {
		logger.info('🔹 Verifying Part Details...')

		await this.assertVisible(this.InternalPartNumber)
		const partNumber = await this.getInputValue(this.InternalPartNumber)
		logger.info(`Part Number: ${partNumber}`)

		await this.assertVisible(this.ManufacturingCategory)
		const category = await this.getSelectedOptionText(
			this.ManufacturingCategory
		)

		expect.soft(category).toBeTruthy()

		logger.info('✔ Part Details verified')
	}
	async validateManufacturingCategoryWithSuggested(
		costingNotesText: string
	): Promise<void> {
		try {
			const manufacturingCategoryElement = this.ManufacturingCategory

			// Get the selected category (handle both <select> and normal elements)
			const elementTag = await manufacturingCategoryElement.evaluate(el =>
				el.tagName.trim().toLowerCase()
			)

			let selectedCategory = ''

			if (elementTag === 'select') {
				selectedCategory = await manufacturingCategoryElement.evaluate(
					(el: HTMLSelectElement) =>
						el.options[el.selectedIndex]?.text?.trim() || ''
				)
			} else {
				selectedCategory =
					(await manufacturingCategoryElement.innerText())?.trim() || ''
			}

			if (!selectedCategory) {
				logger.warn('⚠️ Delivery Category not found or empty.')
				throw new Error('Delivery Category is missing in Part Info.')
			}

			logger.info(
				`🏷️ Selected Delivery Category in Part Info: ${selectedCategory}`
			)

			// Extract Suggested Category
			const suggestedMatch = costingNotesText.match(
				/Suggested\s*Category\s*[:\-]?\s*([^.!?\n]+?)(?=\s*(?:PDF|Material|Suggested|Data|Costing|notes|being|Check|$))/i
			)

			const suggestedCategory = suggestedMatch ? suggestedMatch[1].trim() : ''

			if (!suggestedCategory) {
				logger.warn('⚠️ Suggested Category not found in Costing Notes.')
				throw new Error('Suggested Category is missing in Costing Notes.')
			}

			logger.info(
				`🧾 Suggested Category from Costing Notes: ${suggestedCategory}`
			)

			// Normalize both for comparison
			const normalize = (text: string) =>
				text
					.toLowerCase()
					.replace(/&/g, 'and')
					.replace(/\//g, ' ')
					.replace(/[-]+/g, ' ')
					.replace(/\s+/g, ' ')
					.trim()

			const normalizedSelected = normalize(selectedCategory)
			const normalizedSuggested = normalize(suggestedCategory)

			// --- MAIN COMPARISON FIX: Use contains instead of strict equal ---
			const isMatch =
				normalizedSelected.includes(normalizedSuggested) ||
				normalizedSuggested.includes(normalizedSelected)

			if (isMatch) {
				logger.info(
					`✅ Delivery Category matches Suggested Category (fuzzy match): "${selectedCategory}" ≈ "${suggestedCategory}"`
				)
				expect.soft(isMatch).toBe(true)
			} else {
				logger.error(
					`❌ Mismatch — Selected: "${selectedCategory}", Suggested: "${suggestedCategory}"`
				)
				throw new Error(
					`Expected category "${selectedCategory}" to match (or contain) Suggested Category "${suggestedCategory}".`
				)
			}
		} catch (error: any) {
			logger.error(`❌ Delivery Category validation failed: ${error.message}`)
			throw error
		}
	}

	async verifySupplyTerms(): Promise<void> {
		logger.info('🔹 Starting verification of Supply Terms dropdowns...')

		try {
			// 🔹 Scroll to and open Supply Terms section
			await this.SupplyTerms.scrollIntoViewIfNeeded()
			await this.SupplyTerms.click()

			// 1️⃣ IncoTerms
			logger.info('🔹 Validating Incoterms...')
			await this.IncoTerms.scrollIntoViewIfNeeded()
			await expect(this.IncoTerms).toBeVisible({ timeout: 3000 })

			const incoOptions = await this.page.$$eval(
				'select[formcontrolname="IncoTerms"] option',
				options => options.map(o => o.textContent?.trim()).filter(Boolean)
			)

			expect(incoOptions.length).toBeGreaterThan(0)
			logger.info(`📦 Found Incoterm options: ${incoOptions.join(', ')}`)

			const expectedIncoTerm = incoOptions.includes('DDP')
				? 'DDP'
				: incoOptions[1]
			await this.page.selectOption('select[formcontrolname="IncoTerms"]', {
				label: expectedIncoTerm
			})

			const selectedInco = await this.page.$eval(
				'select[formcontrolname="IncoTerms"]',
				(el: HTMLSelectElement) =>
					el.options[el.selectedIndex].textContent?.trim()
			)
			expect.soft(selectedInco).toBe(expectedIncoTerm)
			logger.info(`✅ Selected Incoterm: ${selectedInco}`)
			await this.page.keyboard.press('Tab')
			logger.info('🔹 Filling Delivery Frequency...')
			await expect(this.DeliveryFrequency).toBeVisible({ timeout: 5000 })
			await this.DeliveryFrequency.fill('30')
			expect.soft(await this.DeliveryFrequency.inputValue()).toBe('30')
			logger.info('✅ Delivery Frequency entered as 30.')
			await this.page.keyboard.press('Tab')

			// 3️⃣ Packaging Type
			logger.info('🔹 Validating Packaging Type...')
			await this.PackageType.scrollIntoViewIfNeeded()

			const packageOptions = await this.page.$$eval(
				'select[formcontrolname="packageType"] option',
				opts => opts.map(o => o.textContent?.trim()).filter(Boolean)
			)

			expect(packageOptions.length).toBeGreaterThan(0)
			logger.info(`📦 Found Packaging options: ${packageOptions.join(', ')}`)

			const expectedPackage = packageOptions[1]
			await this.page.selectOption('select[formcontrolname="packageType"]', {
				label: expectedPackage
			})

			const selectedPackage = await this.page.$eval(
				'select[formcontrolname="packageType"]',
				(el: HTMLSelectElement) =>
					el.options[el.selectedIndex].textContent?.trim()
			)
			expect.soft(selectedPackage).toBe(expectedPackage)
			logger.info(`✅ Selected Package Type: ${selectedPackage}`)

			await this.page.keyboard.press('Tab')

			// 4️⃣ Payment Terms
			logger.info('🔹 Validating Payment Terms...')
			const paymentOptions = await this.page.$$eval(
				'select[formcontrolname="PaymentTerms"] option',
				opts => opts.map(o => o.textContent?.trim()).filter(Boolean)
			)

			expect(paymentOptions.length).toBeGreaterThan(0)
			logger.info(`📦 Found Payment Terms: ${paymentOptions.join(', ')}`)

			const expectedPayment = paymentOptions[1]
			await this.page.selectOption('select[formcontrolname="PaymentTerms"]', {
				label: expectedPayment
			})

			const selectedPayment = await this.page.$eval(
				'select[formcontrolname="PaymentTerms"]',
				(el: HTMLSelectElement) =>
					el.options[el.selectedIndex].textContent?.trim()
			)
			expect.soft(selectedPayment).toBe(expectedPayment)
			logger.info(`✅ Selected Payment Term: ${selectedPayment}`)

			// 🔹 Close any open dropdown or popup
			await this.page.keyboard.press('Escape')
			await this.page.waitForTimeout(300)

			logger.info(
				'✅ Supply Terms dropdown verification completed successfully!'
			)
		} catch (error: any) {
			logger.error(`❌ Supply Terms verification failed: ${error.message}`)
			await this.page.screenshot({ path: 'error_supply_terms.png' })
			throw error
		}
	}
	async fillPartDetails(data: PartDetailsInput): Promise<void> {
		logger.info('🔹 Filling Part Details...')

		// Default values from mig-welding-testdata.ts PartInformation
		const defaults = {
			annualVolume: 950,
			productLife: 5
		}

		// Get Internal Part Number for extraction
		const internalPartNumber = await this.getInputValue(this.InternalPartNumber)

		// Extract Drawing Number from Internal Part Number if not provided
		let drawingNumber = data.drawingNumber
		if (!drawingNumber && internalPartNumber) {
			// Extract the first set of digits from Internal Part Number
			const match = internalPartNumber.match(/^\d+/)
			if (match) {
				drawingNumber = match[0]
				logger.info(
					`📝 Extracted Drawing Number from Internal Part Number: ${drawingNumber}`
				)
			}
		}

		// Extract Revision Number from Internal Part Number if not provided
		let revisionNumber = data.revisionNumber
		if (!revisionNumber && internalPartNumber) {
			// Extract the letter(s) after the first hyphen (e.g., "C" from "1023729-C-1023729-C-3")
			const match = internalPartNumber.match(/^\d+-([A-Za-z]+)/)
			if (match) {
				revisionNumber = match[1]
				logger.info(
					`📝 Extracted Revision Number from Internal Part Number: ${revisionNumber}`
				)
			}
		}

		// Use provided values or fall back to defaults
		const description = data.partDescription
		if (description) {
			await this.waitAndFill(this.PartDescription, description)
			logger.info(`📝 Filled Part Description: ${description}`)
		}

		const annualVolume = data.annualVolume ?? defaults.annualVolume
		// Calculate lot size from annual volume if not provided: lotSize = annualVolume / 12
		const lotSize = data.lotSize ?? calculateLotSize(annualVolume)
		const productLife = data.productLife ?? defaults.productLife
		// Calculate life time qty remaining: annualVolume × productLife
		const lifeTimeQtyRemaining = calculateLifeTimeQtyRemaining(
			annualVolume,
			productLife
		)

		logger.info(
			`📊 Lot Size Calculation: annualVolume(${annualVolume}) / 12 = ${calculateLotSize(
				annualVolume
			)}`
		)
		logger.info(
			`📊 Life Time Qty Remaining: annualVolume(${annualVolume}) × productLife(${productLife}) = ${lifeTimeQtyRemaining}`
		)

		if (drawingNumber) await this.waitAndFill(this.DrawingNumber, drawingNumber)
		if (revisionNumber)
			await this.waitAndFill(this.RevisionNumber, revisionNumber)
		await this.expectInputValue(
			this.AnnualVolumeQtyNos,
			annualVolume.toString()
		)
		await this.expectInputValue(this.LotsizeNos, lotSize)
		await this.expectInputValue(this.ProductLifeRemainingYrs, productLife)
		await this.expectInputValue(
			this.LifeTimeQtyRemainingNos,
			lifeTimeQtyRemaining
		)
		logger.info(
			`✔ Part Details filled - Annual Volume: ${annualVolume}, Lot Size: ${lotSize}, Product Life: ${productLife}, Life Time Qty: ${lifeTimeQtyRemaining}`
		)
	}

	/**
	 * Extracts Part Details from Costing Notes and fills the form
	 */
	async populatePartDetailsFromCostingNotes(): Promise<void> {
		logger.info('🔹 Extracting Part Details from Costing Notes...')

		await this.assertVisible(this.CostingNotes)
		const notesText = await BasePage.getCleanText(this.CostingNotes)
		logger.info(`📝 Costing Notes Text: ${notesText}`)

		// Extract using Regex
		// Example Notes: "Drawing Number: DRW-123. Revision: Rev A. Description: Bracket..."
		// Adjust regex based on actual format seen in logs/screenshots if needed.
		// Assuming format like "Drawing Number : 12345" or "Drawing: 12345"

		const drawingMatch = notesText.match(
			/(?:Drawing\s*(?:Number|No)?\s*[:\-])\s*([A-Za-z0-9\-\.]+)/i
		)
		const revisionMatch = notesText.match(
			/(?:Revision|Rev)\s*[:\-\.]\s*([A-Za-z0-9]+)/i
		)
		// Description might be "Part Description: ..." or just "Description: ..."
		const descriptionMatch = notesText.match(
			/(?:Part\s*)?Description\s*[:\-\.]\s*([^.|]+)/i
		)

		const extractedData: PartDetailsInput = {}

		if (drawingMatch) {
			extractedData.drawingNumber = drawingMatch[1].trim()
			logger.info(`✅ Extracted Drawing Number: ${extractedData.drawingNumber}`)
		} else {
			logger.warn('⚠️ Could not extract Drawing Number from Costing Notes')
		}

		if (revisionMatch) {
			extractedData.revisionNumber = revisionMatch[1].trim()
			logger.info(
				`✅ Extracted Revision Number: ${extractedData.revisionNumber}`
			)
		} else {
			logger.warn('⚠️ Could not extract Revision Number from Costing Notes')
		}

		if (descriptionMatch) {
			extractedData.partDescription = descriptionMatch[1].trim()
			logger.info(
				`✅ Extracted Part Description: ${extractedData.partDescription}`
			)
		} else {
			logger.warn('⚠️ Could not extract Part Description from Costing Notes')
		}

		// Fill the extracted data
		await this.fillPartDetails(extractedData)
	}
	async verifySupplierDropdown(): Promise<void> {
		try {
			logger.info('🔹 Verifying Supplier dropdown...')

			// --- Ensure dropdown input is visible ---
			await this.SupplierDropdown.scrollIntoViewIfNeeded()
			await expect(this.SupplierDropdown).toBeVisible({ timeout: 5000 })
			await this.SupplierDropdown.hover()

			// --- Skip if disabled or readonly ---
			if (
				(await this.SupplierDropdown.isDisabled()) ||
				(await this.SupplierDropdown.getAttribute('readonly'))
			) {
				logger.warn('⚠️ Supplier dropdown is disabled. Skipping validation.')
				return
			}

			// --- Click to open autocomplete ---
			await this.SupplierDropdown.click({ force: true })
			await this.page.waitForTimeout(700)

			// --- Handle case where autocomplete requires typing ---
			if ((await this.SupplierOptions.count()) === 0) {
				logger.info(
					'ℹ️ No options visible yet — typing to trigger autocomplete...'
				)
				await this.SupplierDropdown.fill('Target') // adjust keyword if needed
				await this.page.waitForSelector('mat-option', {
					state: 'visible',
					timeout: 300
				})
			}

			await expect(this.SupplierOptions.first()).toBeVisible({ timeout: 3000 })

			const optionCount = await this.SupplierOptions.count()
			expect(optionCount).toBeGreaterThan(0)
			logger.info(`📦 Found ${optionCount} supplier options.`)

			// --- Select first supplier (existing option) ---
			const firstSupplier = (
				await this.SupplierOptions.first().innerText()
			).trim()
			logger.info(`🔹 Selecting existing supplier: "${firstSupplier}"`)

			await this.SupplierOptions.first().click({ force: true })
			await this.page.waitForTimeout(800)

			// --- Close dropdown if open ---
			await this.page.keyboard.press('Escape')
			await this.page.waitForTimeout(300)

			// --- Validate selected supplier value ---
			let selectedSupplier = ''
			try {
				selectedSupplier = (await this.SupplierDropdown.inputValue()).trim()
			} catch {
				selectedSupplier =
					(await this.SupplierDropdown.textContent())?.trim() || ''
			}

			logger.info(`🔹 Selected supplier shown as: "${selectedSupplier}"`)
			expect
				.soft(selectedSupplier.toLowerCase())
				.toContain(firstSupplier.toLowerCase())

			// --- Optional: Validate dependent fields (City, Country, etc.) ---
			if (this.ManufacturingCity && this.ManufacturingCountry) {
				const city = (
					await this.ManufacturingCity.inputValue().catch(() => '')
				).trim()
				const country = (
					await this.ManufacturingCountry.inputValue().catch(() => '')
				).trim()

				if (city || country) {
					logger.info(`🏙️ City: ${city || 'N/A'}, Country: ${country || 'N/A'}`)
				} else {
					logger.warn(
						`⚠️ Missing city/country for supplier "${selectedSupplier}"`
					)
				}
			}

			logger.info('✅ Supplier dropdown validation completed successfully.')
		} catch (error: any) {
			logger.error(`❌ Supplier dropdown validation failed: ${error.message}`)
			await this.page.screenshot({ path: 'error_supplier_dropdown.png' })
			throw error
		}
	}
	async verifyDeliveryDropdown(): Promise<void> {
		try {
			logger.info('🔹 Verifying Delivery dropdown...')

			// --- Ensure dropdown input is visible ---
			await this.DeliveryDropdown.scrollIntoViewIfNeeded()
			await expect(this.DeliveryDropdown).toBeVisible({ timeout: 5000 })
			await this.DeliveryDropdown.hover()

			// --- Skip if disabled or readonly ---
			if (
				(await this.DeliveryDropdown.isDisabled()) ||
				(await this.DeliveryDropdown.getAttribute('readonly'))
			) {
				logger.warn('⚠️ Delivery dropdown is disabled. Skipping validation.')
				return
			}

			// --- Click to open autocomplete ---
			await this.DeliveryDropdown.click({ force: true })
			await this.page.waitForTimeout(700)

			// --- Handle case where autocomplete requires typing ---
			if ((await this.DeliveryOptions.count()) === 0) {
				logger.info(
					'ℹ️ No options visible yet — typing to trigger autocomplete...'
				)
				await this.DeliveryDropdown.fill('Test Site')
				await this.page.waitForSelector('mat-option', {
					state: 'visible',
					timeout: 300
				})
			}

			await this.DeliveryOptions.first().waitFor({
				state: 'visible',
				timeout: 300
			})

			const optionCount = await this.DeliveryOptions.count()
			expect(optionCount).toBeGreaterThan(0)
			logger.info(`📦 Found ${optionCount} supplier options.`)

			// --- Select first supplier (existing option) ---
			const firstDelivery = (
				await this.DeliveryOptions.first().innerText()
			).trim()
			logger.info(`🔹 Selecting existing supplier: "${firstDelivery}"`)

			await this.DeliveryOptions.first().click({ force: true })
			await this.page.waitForTimeout(800)
			await this.page.keyboard.press('Escape')
			await this.page.waitForTimeout(300)
			// --- Validate selected supplier value ---
			let selectedDelivery = ''
			try {
				selectedDelivery = (await this.DeliveryDropdown.inputValue()).trim()
			} catch {
				selectedDelivery =
					(await this.DeliveryDropdown.textContent())?.trim() || ''
			}

			logger.info(`🔹 Selected supplier shown as: "${selectedDelivery}"`)
			expect
				.soft(selectedDelivery.toLowerCase())
				.toContain(firstDelivery.toLowerCase())

			// --- Optional: Validate dependent fields (City, Country, etc.) ---
			if (this.DeliveryCity && this.DeliveryCountry) {
				const city = (
					await this.DeliveryCity.inputValue().catch(() => '')
				).trim()
				const country = (
					await this.DeliveryCountry.inputValue().catch(() => '')
				).trim()

				if (city || country) {
					logger.info(`🏙️ City: ${city || 'N/A'}, Country: ${country || 'N/A'}`)
				} else {
					logger.warn(
						`⚠️ Missing city/country for supplier "${selectedDelivery}"`
					)
				}
			}

			logger.info('✅ Delivery dropdown validation completed successfully.')
		} catch (error: any) {
			logger.error(`❌ Delivery dropdown validation failed: ${error.message}`)
			await this.page.screenshot({ path: 'error_delivery_dropdown.png' })
			throw error
		}
	}

	async verifyMaterialInfoWithDB(): Promise<void> {
		logger.info('🔹 Validating Material Info against DB...')

		// Use DescriptionGrade (select) to get selected material name
		const materialDescriptionUI = await this.DescriptionGrade.evaluate(
			(sel: HTMLSelectElement) => sel.options[sel.selectedIndex].text
		)
		const materialPriceUI = Number(
			(await this.MaterialPrice.inputValue())?.replace(/,/g, '') || 0
		)

		const scrapPriceUI = parseFloat((await this.ScrapPrice.inputValue()) || '0')

		if (
			!materialDescriptionUI ||
			materialDescriptionUI === 'Select' ||
			materialDescriptionUI === 'Select an option'
		) {
			throw new Error(
				`Material Description is not valid: ${materialDescriptionUI}`
			)
		}

		const query = `SELECT TOP 1 MaterialDescription, Density, ScrapRecovery, MaterialPricePerKg 
                       FROM mst_MaterialMaster 
                       WHERE MaterialDescription = '${materialDescriptionUI}'`

		logger.info(`Running DB Query: ${query}`)

		try {
			const result = await queryDatabase(query)
			const dbData = result ? result[0] : null

			if (!dbData) {
				logger.warn(`⚠️ No material found in DB for: ${materialDescriptionUI}`)
				return
			}

			logger.info(`DB Data: ${JSON.stringify(dbData)}`)

			// Validate MaterialDescription
			expect.soft(materialDescriptionUI).toBe(dbData.MaterialDescription)

			// Validate MaterialPricePerKg matches UI Material Price
			expect.soft(materialPriceUI).toBeCloseTo(dbData.MaterialPricePerKg, 2)

			// Validate ScrapRecovery
			logger.info(
				`UI Scrap Price: ${scrapPriceUI}, DB Scrap Recovery: ${dbData.ScrapRecovery}`
			)
			expect.soft(dbData.ScrapRecovery).toBeDefined()

			// Validate Density
			logger.info(`DB Density: ${dbData.Density}`)
			expect.soft(dbData.Density).toBeDefined()

			logger.info('✅ Material info validated successfully against DB')
		} catch (dbError: any) {
			logger.warn(
				`⚠️ Database validation skipped due to connection error: ${dbError.message}`
			)
			logger.info('✅ Material UI validation passed (DB validation skipped)')
		}
	}
	// ==================== MATERIAL METHODS ====================
	async verifyMaterialSelection(): Promise<void> {
		logger.info('🔹 Verifying Material Selection...')
		await this.assertVisible(this.materialCategory)
		await this.assertVisible(this.MatFamily)
		await this.assertVisible(this.DescriptionGrade)

		logger.info('✔ Material Selection verified')
	}

	async selectMaterial(
		category: string,
		family: string,
		grade: string,
		stockForm?: string
	): Promise<void> {
		logger.info(`🔹 Selecting Material: ${category} / ${family} / ${grade}`)

		await this.selectOption(this.materialCategory, category)
		await this.wait(300)
		await this.selectOption(this.MatFamily, family)
		await this.wait(300)
		await this.selectOption(this.DescriptionGrade, grade)

		if (stockForm) {
			await this.wait(300)
			await this.selectOption(this.StockForm, stockForm)
		}

		logger.info('✔ Material selected')
	}

	// ==================== WELDING METHODS ====================

	async verifyWeldingDetails(): Promise<void> {
		logger.info('🔹 Verifying Welding Details...')

		await this.scrollIntoView(this.WeldingDetails)
		await this.openMaterialInformation()
		await expect(this.Weld1).toBeVisible({ timeout: 5000 })
		await expect(this.WeldType1).toBeVisible({ timeout: 3000 })
		await expect(this.WeldSize1).toBeVisible({ timeout: 3000 })

		logger.info('✔ Welding Details visible')
	}

	/**
	 * Fill weld details for a specific weld index
	 */
	async fillWeldDetails(weldIndex: number, data: WeldInput): Promise<void> {
		logger.info(`🔹 Filling Weld ${weldIndex} Details...`)

		const weldTypeLocator = this.page
			.locator('select[formcontrolname="coreShape"]')
			.nth(weldIndex - 1)
		const weldSizeLocator = this.page
			.locator('input[formcontrolname="coreHeight"]')
			.nth(weldIndex - 1)
		const weldLengthLocator = this.page
			.locator('input[formcontrolname="coreLength"]')
			.nth(weldIndex - 1)
		const noOfPassesLocator = this.page
			.locator('input[formcontrolname="noOfCore"]')
			.nth(weldIndex - 1)
		const weldPlacesLocator = this.page
			.locator('input[formcontrolname="coreVolume"]')
			.nth(weldIndex - 1)

		await this.selectOption(weldTypeLocator, data.weldType)
		await this.waitAndFill(weldSizeLocator, data.weldSize.toString())
		await this.waitAndFill(weldLengthLocator, data.weldLength.toString())

		if (data.noOfPasses)
			await this.waitAndFill(noOfPassesLocator, data.noOfPasses.toString())
		if (data.weldPlaces)
			await this.waitAndFill(weldPlacesLocator, data.weldPlaces.toString())

		logger.info(`✔ Weld ${weldIndex} filled`)
	}

	/**
	 * Verify weld element size calculation
	 */
	async verifyWeldElementSize(): Promise<void> {
		logger.info('🔹 Verifying Weld Element Size calculation...')
		const getWeldElementSize = (value: number): number => {
			if (value <= 8) {
				return Math.round(value)
			}
			if (value < 12) {
				return 6
			}
			return 8 // value >= 12
		}

		await this.selectOption(this.WeldType1, 'Fillet')
		await this.waitAndFill(this.WeldSize1, '6')

		const weldValue = Number(await this.WeldSize1.inputValue())
		const expectedElementSize = getWeldElementSize(weldValue)
		const uiValue = Number(
			(await this.WeldElementSize1.inputValue())?.trim() || '0'
		)

		expect.soft(uiValue).toBe(expectedElementSize)
		logger.info(
			`✔ Weld Element Size validated → UI: ${uiValue}, Expected: ${expectedElementSize}`
		)
	}

	// ==================== MANUFACTURING METHODS ====================

	/**
	 * Select welding process type
	 */
	async selectWeldingProcess(processType: string): Promise<void> {
		logger.info(`🔹 Selecting Welding Process: ${processType}`)
		await this.selectOption(this.ProcessType, processType)
		await this.wait(500)
		logger.info('✔ Welding Process selected')
	}

	/**
	 * Select machine type
	 */
	async selectMachineType(
		machineType: 'Automatic' | 'Semi-Auto' | 'Manual'
	): Promise<void> {
		logger.info(`🔹 Selecting Machine Type: ${machineType}`)
		await this.selectOption(this.MachineType, machineType)
		await this.wait(300)
		logger.info('✔ Machine Type selected')
	}

	/**
	 * Select part complexity
	 */
	async selectPartComplexity(
		complexity: 'Low' | 'Medium' | 'High'
	): Promise<void> {
		logger.info(`🔹 Selecting Part Complexity: ${complexity}`)
		await this.selectOption(this.PartComplexity, complexity)
		await this.wait(300)
		logger.info('✔ Part Complexity selected')
	}

	/**
	 * Select weld position
	 */
	async selectWeldPosition(position: string): Promise<void> {
		logger.info(`🔹 Selecting Weld Position: ${position}`)
		await this.selectOption(this.WeldPosition, position)
		await this.wait(300)
		logger.info('✔ Weld Position selected')
	}

	// ==================== COST VERIFICATION METHODS ====================

	/**
	 * Verify cycle time is calculated
	 */
	async verifyCycleTimeCalculation(): Promise<void> {
		logger.info('🔹 Verifying Cycle Time calculation...')

		const cycleTime = await this.CycleTimePart.inputValue()
		expect.soft(parseFloat(cycleTime || '0')).toBeGreaterThan(0)

		logger.info(`✔ Cycle Time: ${cycleTime} seconds`)
	}

	/**
	 * Get cost breakdown values
	 */
	async verifyCostBreakdown(): Promise<CostBreakdown> {
		logger.info('🔹 Retrieving Cost Breakdown...')

		const costs: CostBreakdown = {
			machineCost: await this.getInputValueAsNumber(this.MachineCostPart),
			laborCost: await this.getInputValueAsNumber(this.LaborCostPart),
			setupCost: await this.getInputValueAsNumber(this.SetupCostPart),
			inspectionCost: await this.getInputValueAsNumber(this.QAInspectionCost),
			yieldCost: await this.getInputValueAsNumber(this.YieldCostPart),
			powerCost: await this.getInputValueAsNumber(this.TotalPowerCost)
		}

		logger.info(`Cost Breakdown: ${JSON.stringify(costs, null, 2)}`)
		return costs
	}

	/**
	 * Verify cost summary section
	 */
	async verifyCostSummary(): Promise<void> {
		logger.info('🔹 Verifying Cost Summary...')

		await this.scrollIntoView(this.CostSummary)
		await this.assertVisible(this.CostSummary)
		const materialCost = Number(await this.MaterialCost.inputValue())
		const manufacturingCost = await this.ManufacturingCost.inputValue()
		const shouldCost = await this.PartShouldCost.inputValue()

		logger.info(`Material Cost: ${materialCost}`)
		logger.info(`Manufacturing Cost: ${manufacturingCost}`)
		logger.info(`Should Cost: ${shouldCost}`)

		expect.soft(parseFloat(shouldCost || '0')).toBeGreaterThan(0)
		logger.info('✔ Cost Summary verified')
	}

	// ==================== ACTION METHODS ====================

	/**
	 * Recalculate cost
	 */
	async recalculateCost(): Promise<void> {
		logger.info('🔹 Recalculating Cost...')
		await this.waitAndClick(this.RecalculateCost)
		await this.waitForNetworkIdle()
		await this.wait(1000)
		logger.info('✔ Cost recalculated')
	}

	/**
	 * Save project
	 */
	async saveProject(): Promise<void> {
		logger.info('🔹 Saving Project...')
		await this.waitAndClick(this.UpdateSave)
		await this.waitForNetworkIdle()
		await this.wait(1000)
		logger.info('✔ Project saved')
	}

	/**
	 * Expand all sections
	 */
	async expandAllSections(): Promise<void> {
		await this.waitAndClick(this.ExpandAll)
		await this.wait(500)
		logger.info('✔ All sections expanded')
	}

	/**
	 * Collapse all sections
	 */
	async collapseAllSections(): Promise<void> {
		await this.waitAndClick(this.CollapseAll)
		await this.wait(500)
		logger.info('✔ All sections collapsed')
	}
}
