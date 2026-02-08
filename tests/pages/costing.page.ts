/**
 * @file costing.page.ts
 * @description Central Page Object for all Costing interface interactions
 * Provides common UI element locators and helper methods for cost calculations
 */

import { Locator, Page, BrowserContext, expect } from '@playwright/test'
import Logger from '../lib/LoggerUtil'

const logger = Logger

export class CostingPage {
	readonly page: Page
	readonly context: BrowserContext

	// ============ PART INFORMATION SECTION ============
	readonly PartInformationTab: Locator
	readonly InternalPartNumber: Locator
	readonly BOMQtyNos: Locator
	readonly AnnualVolumeQtyNos: Locator
	readonly LotsizeNos: Locator
	readonly ProductLifeRemainingYrs: Locator
	readonly LifeTimeQtyRemainingNos: Locator
	readonly ManufacturingCategory: Locator
	readonly CostingNotes: Locator
	readonly DrawingNumber: Locator

	// ============ MATERIAL INFORMATION SECTION ============
	readonly MaterialInformationSection: Locator
	readonly ProcessGroup: Locator
	readonly MaterialCategory: Locator
	readonly MaterialFamily: Locator
	readonly MaterialGrade: Locator
	readonly StockForm: Locator
	readonly MaterialPrice: Locator
	readonly ScrapPrice: Locator
	readonly Density: Locator
	readonly NetWeight: Locator
	readonly GrossWeight: Locator

	// ============ MANUFACTURING INFORMATION SECTION ============
	readonly ManufacturingInformation: Locator
	readonly ProcessType: Locator
	readonly MachineType: Locator
	readonly MachineName: Locator
	readonly MachineDescription: Locator
	readonly MachineEfficiency: Locator
	readonly MachineHourRate: Locator
	readonly SkilledLaborRate: Locator
	readonly LaborRate: Locator
	readonly SetupTime: Locator
	readonly RequiredCurrent: Locator
	readonly RequiredVoltage: Locator
	readonly SelectedCurrent: Locator
	readonly SelectedVoltage: Locator

	// ============ COST CALCULATION SECTION ============
	readonly DirectMachineCost: Locator
	readonly DirectSetUpCost: Locator
	readonly DirectLaborCost: Locator
	readonly QAInspectionCost: Locator
	readonly YieldCostPart: Locator
	readonly PowerCost: Locator
	readonly NetProcessCost: Locator
	readonly TotalManufacturingCost: Locator
	readonly NetMaterialCost: Locator
	readonly TotalCost: Locator

	// ============ CYCLE TIME SECTION ============
	readonly CycleTime: Locator
	readonly DryCycleTime: Locator
	readonly LoadingUnloadingTime: Locator
	readonly PartReorientation: Locator

	// ============ MATERIAL DIMENSIONS ============
	readonly PartLength: Locator
	readonly PartWidth: Locator
	readonly PartHeight: Locator
	readonly PartVolume: Locator
	readonly PartSurfaceArea: Locator

	// ============ QUALITY & SUSTAINABILITY ============
	readonly YieldPercentage: Locator
	readonly SamplingRate: Locator
	readonly QAInspectorRate: Locator
	readonly QAInspectionTime: Locator
	readonly PowerConsumptionKW: Locator
	readonly ElectricityUnitCost: Locator
	readonly CO2PerKgMaterial: Locator
	readonly CO2PerPartMaterial: Locator

	// ============ NAVIGATION ============
	readonly ProjectIcon: Locator
	readonly ClearAll: Locator
	readonly SelectAnOption: Locator
	readonly ProjectID: Locator
	readonly ProjectValue: Locator

	// ============ COMMON ACTIONS ============
	readonly SaveButton: Locator
	readonly SubmitButton: Locator
	readonly CancelButton: Locator
	readonly EditButton: Locator

	constructor(page: Page, context: BrowserContext) {
		this.page = page
		this.context = context

		// Part Information
		this.PartInformationTab = page.locator(
			'mat-tab-label:has-text("Part Information")'
		)
		this.InternalPartNumber = page.locator(
			'input[formControlName="internalPartNumber"]'
		)
		this.BOMQtyNos = page.locator('input[formControlName="bomQuantity"]')
		this.AnnualVolumeQtyNos = page.locator(
			'input[formControlName="annualVolume"]'
		)
		this.LotsizeNos = page.locator('input[formControlName="lotSize"]')
		this.ProductLifeRemainingYrs = page.locator(
			'input[formControlName="productLife"]'
		)
		this.LifeTimeQtyRemainingNos = page.locator(
			'input[formControlName="lifeTimeQty"]'
		)
		this.ManufacturingCategory = page.locator(
			'select[formControlName="manufacturingCategory"], mat-select[formControlName="manufacturingCategory"]'
		)
		this.CostingNotes = page.locator('[data-testid="costing-notes"]')
		this.DrawingNumber = page.locator('input[formControlName="drawingNumber"]')

		// Material Information
		this.MaterialInformationSection = page.locator(
			'mat-expansion-panel-header:has-text("Material Information")'
		)
		this.ProcessGroup = page.locator(
			'mat-select[formControlName="processGroup"]'
		)
		this.MaterialCategory = page.locator(
			'mat-select[formControlName="materialCategory"]'
		)
		this.MaterialFamily = page.locator(
			'mat-select[formControlName="materialFamily"]'
		)
		this.MaterialGrade = page.locator(
			'mat-select[formControlName="materialGrade"]'
		)
		this.StockForm = page.locator('mat-select[formControlName="stockForm"]')
		this.MaterialPrice = page.locator('input[formControlName="materialPrice"]')
		this.ScrapPrice = page.locator('input[formControlName="scrapPrice"]')
		this.Density = page.locator('input[formControlName="density"]')
		this.NetWeight = page.locator('input[formControlName="netWeight"]')
		this.GrossWeight = page.locator('input[formControlName="grossWeight"]')

		// Manufacturing Information
		this.ManufacturingInformation = page.locator(
			'mat-expansion-panel-header:has-text("Manufacturing Information")'
		)
		this.ProcessType = page.locator('mat-select[formControlName="processType"]')
		this.MachineType = page.locator('mat-select[formControlName="machineType"]')
		this.MachineName = page.locator('mat-select[formControlName="machineName"]')
		this.MachineDescription = page.locator(
			'input[formControlName="machineDescription"]'
		)
		this.MachineEfficiency = page.locator(
			'input[formControlName="machineEfficiency"]'
		)
		this.MachineHourRate = page.locator(
			'input[formControlName="machineHourRate"]'
		)
		this.SkilledLaborRate = page.locator(
			'input[formControlName="skilledLaborRate"]'
		)
		this.LaborRate = page.locator(
			'input[formControlName="lowSkilledLaborRate"]'
		)
		this.SetupTime = page.locator('input[formControlName="setupTime"]')
		this.RequiredCurrent = page.locator(
			'input[formControlName="requiredCurrent"]'
		)
		this.RequiredVoltage = page.locator(
			'input[formControlName="requiredVoltage"]'
		)
		this.SelectedCurrent = page.locator(
			'input[formControlName="selectedCurrent"]'
		)
		this.SelectedVoltage = page.locator(
			'input[formControlName="selectedVoltage"]'
		)

		// Cost Calculations
		this.DirectMachineCost = page.locator(
			'input[formControlName="directMachineCost"]'
		)
		this.DirectSetUpCost = page.locator(
			'input[formControlName="directSetupCost"]'
		)
		this.DirectLaborCost = page.locator(
			'input[formControlName="directLaborCost"]'
		)
		this.QAInspectionCost = page.locator(
			'input[formControlName="qaInspectionCost"]'
		)
		this.YieldCostPart = page.locator('input[formControlName="yieldCost"]')
		this.PowerCost = page.locator('input[formControlName="powerCost"]')
		this.NetProcessCost = page.locator(
			'input[formControlName="netProcessCost"]'
		)
		this.TotalManufacturingCost = page.locator(
			'input[formControlName="totalManufacturingCost"]'
		)
		this.NetMaterialCost = page.locator(
			'input[formControlName="netMaterialCost"]'
		)
		this.TotalCost = page.locator('input[formControlName="totalCost"]')

		// Cycle Time
		this.CycleTime = page.locator('input[formControlName="cycleTime"]')
		this.DryCycleTime = page.locator('input[formControlName="dryCycleTime"]')
		this.LoadingUnloadingTime = page.locator(
			'input[formControlName="loadingUnloadingTime"]'
		)
		this.PartReorientation = page.locator(
			'input[formControlName="partReorientation"]'
		)

		// Material Dimensions
		this.PartLength = page.locator('input[formControlName="partLength"]')
		this.PartWidth = page.locator('input[formControlName="partWidth"]')
		this.PartHeight = page.locator('input[formControlName="partHeight"]')
		this.PartVolume = page.locator('input[formControlName="partVolume"]')
		this.PartSurfaceArea = page.locator('input[formControlName="surfaceArea"]')

		// Quality & Sustainability
		this.YieldPercentage = page.locator(
			'input[formControlName="yieldPercentage"]'
		)
		this.SamplingRate = page.locator('input[formControlName="samplingRate"]')
		this.QAInspectorRate = page.locator(
			'input[formControlName="qaInspectorRate"]'
		)
		this.QAInspectionTime = page.locator(
			'input[formControlName="inspectionTime"]'
		)
		this.PowerConsumptionKW = page.locator(
			'input[formControlName="powerConsumption"]'
		)
		this.ElectricityUnitCost = page.locator(
			'input[formControlName="electricityUnitCost"]'
		)
		this.CO2PerKgMaterial = page.locator(
			'input[formControlName="co2PerKgMaterial"]'
		)
		this.CO2PerPartMaterial = page.locator(
			'input[formControlName="co2PerPart"]'
		)

		// Navigation
		this.ProjectIcon = page.locator('[data-testid="project-icon"]')
		this.ClearAll = page.locator('button:has-text("Clear All")')
		this.SelectAnOption = page.locator('mat-select[formControlName="project"]')
		this.ProjectID = page.locator('input[formControlName="projectId"]')
		this.ProjectValue = page.locator('input[placeholder*="Project"]')

		// Common Actions
		this.SaveButton = page.locator('button:has-text("Save")')
		this.SubmitButton = page.locator('button:has-text("Submit")')
		this.CancelButton = page.locator('button:has-text("Cancel")')
		this.EditButton = page.locator('button:has-text("Edit")')
	}

	// ============ HELPER METHODS ============

	async getInputValue(locator: Locator): Promise<string> {
		return await locator.inputValue().catch(() => '')
	}

	async getInputAsNum(locator: Locator): Promise<number> {
		const val = await this.getInputValue(locator)
		return Number(val) || 0
	}

	async fillInput(locator: Locator, value: string | number): Promise<void> {
		await locator.scrollIntoViewIfNeeded()
		await locator.fill(String(value))
		await this.page.waitForTimeout(200)
	}

	async selectOption(locator: Locator, value: string): Promise<void> {
		await locator.click()
		const option = this.page.locator(`mat-option:has-text("${value}")`)
		await option.first().click()
	}

	async getSelectedOptionText(locator: Locator): Promise<string> {
		const innerText = await locator.locator('span').first().textContent()
		return innerText?.trim() || ''
	}

	async isVisible(locator: Locator, timeout = 5000): Promise<boolean> {
		try {
			await locator.waitFor({ state: 'visible', timeout })
			return true
		} catch {
			return false
		}
	}

	async verifyUIValue(input: {
		locator: Locator
		expectedValue: number
		label: string
		precision?: number
	}): Promise<void> {
		const { locator, expectedValue, label, precision = 2 } = input

		if (!Number.isFinite(expectedValue)) {
			logger.warn(
				`⚠️ Skipping verification of ${label} - invalid expected value`
			)
			return
		}

		const actualValue = await this.getInputAsNum(locator)
		const tolerance = Math.pow(10, -precision)
		const diff = Math.abs(actualValue - expectedValue)

		if (diff <= tolerance) {
			logger.info(
				`✅ ${label}: ${actualValue.toFixed(precision)} (Expected: ${expectedValue.toFixed(precision)})`
			)
		} else {
			logger.warn(
				`⚠️ ${label}: ${actualValue.toFixed(precision)} ≠ ${expectedValue.toFixed(precision)} (Diff: ${diff.toFixed(precision)})`
			)
		}

		expect(diff).toBeLessThanOrEqual(tolerance)
	}

	async scrollToElement(locator: Locator): Promise<void> {
		await locator.scrollIntoViewIfNeeded()
	}

	async waitForElement(locator: Locator, timeout = 10000): Promise<void> {
		await locator.waitFor({ state: 'visible', timeout })
	}

	async clickButton(locator: Locator): Promise<void> {
		await locator.click()
		await this.page.waitForTimeout(500)
	}

	async waitForNetworkIdle(): Promise<void> {
		await this.page.waitForLoadState('networkidle').catch(() => null)
	}

	async takeScreenshot(name: string): Promise<void> {
		await this.page.screenshot({
			path: `screenshots/${name}.png`,
			fullPage: true
		})
	}

	async isPageClosed(): Promise<boolean> {
		return this.page.isClosed?.() || false
	}
}

export default CostingPage
