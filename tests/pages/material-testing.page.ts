import { Locator, Page, BrowserContext } from '@playwright/test'
import { BasePage } from '../lib/BasePage'

export class MaterialTestingPage extends BasePage {
	// Common material locators used across commodity pages
	readonly MaterialInformationSection: Locator
	readonly MaterialInfoTab: Locator
	readonly SearchMtrlInput: Locator
	readonly NetMaterialCost: Locator
	readonly PartThickness: Locator
	readonly NetWeight: Locator
	readonly TensileStrength: Locator
	readonly ShearingStrength: Locator
	readonly MaterialTotalCost: Locator

	constructor(page: Page, context: BrowserContext) {
		super(page, context)

		this.MaterialInformationSection = page.locator(
			"//h6[@class='cls-item-head ng-star-inserted']"
		)
		this.MaterialInfoTab = page.getByRole('tab', { name: 'Material Info' })
		this.SearchMtrlInput = page.locator(
			'input[placeholder="Search by keywords"]'
		)
		this.NetMaterialCost = page.locator(
			'input[formcontrolname="netMaterialCost"]'
		)
		this.PartThickness = page
			.locator('input[formcontrolname="partThickness"]')
			.first()
		this.NetWeight = page.locator('input[formcontrolname="netWeight"]')
		this.TensileStrength = page.locator(
			'input[formcontrolname="ultimateTensileStrength"]'
		)
		this.ShearingStrength = page.locator('input[formcontrolname="meltTemp"]')
		this.MaterialTotalCost = page.locator('#MaterialCostAmount')
	}

	async openMaterialSection(): Promise<void> {
		await this.MaterialInformationSection.scrollIntoViewIfNeeded()
		await this.MaterialInformationSection.click()
		await this.page.waitForTimeout(500)
	}

	async readMaterialValues(): Promise<Record<string, number | string>> {
		await this.openMaterialSection()
		const thickness = await this.getInputValueAsNumber(this.PartThickness)
		const netWeight = await this.getInputValueAsNumber(this.NetWeight)
		const tensile = await this.getInputValueAsNumber(this.TensileStrength)
		const shear = await this.getInputValueAsNumber(this.ShearingStrength)
		const netMatCost = await this.getInputValueAsNumber(this.NetMaterialCost)
		const totalMatCost =
			(await this.getTextContent(this.MaterialTotalCost)) || ''

		return {
			partThickness: thickness,
			netWeight,
			tensileStrength: tensile,
			shearingStrength: shear,
			netMaterialCost: netMatCost,
			materialTotalCost: totalMatCost
		}
	}
}
