import { Locator, Page, BrowserContext } from '@playwright/test'
import { BasePage } from '../lib/BasePage'

export class ManufacturingTestingPage extends BasePage {
	readonly ManufacturingInformation: Locator
	readonly MfgDetailsTab: Locator
	readonly ProcessGroup: Locator
	readonly MachineType: Locator
	readonly MachineName: Locator
	readonly MachineEfficiency: Locator
	readonly CycleTimePart: Locator
	readonly DirectMachineCost: Locator
	readonly DirectSetUpCost: Locator
	readonly DirectLaborCost: Locator
	readonly QAInspectionCost: Locator
	readonly YieldCostPart: Locator
	readonly NetProcessCost: Locator
	readonly RecommendedTonnage: Locator
	readonly BendingLineLength: Locator
	readonly NoOfBends: Locator
	readonly InnerRadius: Locator

	constructor(page: Page, context: BrowserContext) {
		super(page, context)

		this.ManufacturingInformation = page.locator(
			"//h6[normalize-space(text())='Manufacturing Information']"
		)
		this.MfgDetailsTab = page.getByRole('tab', {
			name: 'Manufacturing Details'
		})
		this.ProcessGroup = page.locator(
			"//select[@formcontrolname='matPrimaryProcessName']"
		)
		this.MachineType = page.locator(
			"//select[@placeholder='Select M/c Automation']"
		)
		this.MachineName = page.locator('select[formcontrolname="machineId"]')
		this.MachineEfficiency = page.locator('input[formcontrolname="efficiency"]')
		this.CycleTimePart = page
			.locator('input[formcontrolname="cycleTime"]')
			.first()
		this.DirectMachineCost = page.locator('input[name="directMachineCost"]')
		this.DirectSetUpCost = page.locator('input[name="directSetUpCost"]')
		this.DirectLaborCost = page.locator('input[name="directLaborCost"]')
		this.QAInspectionCost = page.locator('input[name="inspectionCost"]')
		this.YieldCostPart = page.locator('input[name="yieldCost"]')
		this.NetProcessCost = page.locator('input[name="directProcessCost"]')
		this.RecommendedTonnage = page.locator(
			'input[formcontrolname="recommendTonnage"]'
		)
		this.BendingLineLength = page.locator(
			'input[formcontrolname="bendingLineLength"]'
		)
		this.NoOfBends = page.locator('input[formcontrolname="noOfbends"]')
		this.InnerRadius = page.locator('input[formcontrolname="innerRadius"]')
	}

	async openManufacturingSection(): Promise<void> {
		await this.ManufacturingInformation.scrollIntoViewIfNeeded()
		await this.ManufacturingInformation.click()
		await this.page.waitForTimeout(500)
	}

	async readManufacturingValues(): Promise<Record<string, number>> {
		await this.openManufacturingSection()
		await this.MfgDetailsTab.click()
		await this.page.waitForTimeout(500)

		const cycleTime = await this.getInputValueAsNumber(this.CycleTimePart)
		const machineEff = await this.getInputValueAsNumber(this.MachineEfficiency)
		const directMachineCost = await this.getInputValueAsNumber(
			this.DirectMachineCost
		)
		const directSetupCost = await this.getInputValueAsNumber(
			this.DirectSetUpCost
		)
		const directLaborCost = await this.getInputValueAsNumber(
			this.DirectLaborCost
		)
		const qaInspectionCost = await this.getInputValueAsNumber(
			this.QAInspectionCost
		)
		const yieldCost = await this.getInputValueAsNumber(this.YieldCostPart)
		const netProcessCost = await this.getInputValueAsNumber(this.NetProcessCost)
		const recommendedTonnage = await this.getInputValueAsNumber(
			this.RecommendedTonnage
		)

		return {
			cycleTime,
			machineEfficiency: machineEff,
			directMachineCost,
			directSetupCost,
			directLaborCost,
			qaInspectionCost,
			yieldCost,
			netProcessCost,
			recommendedTonnage
		}
	}
}
