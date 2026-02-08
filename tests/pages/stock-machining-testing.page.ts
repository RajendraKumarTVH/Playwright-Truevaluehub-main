import { Page, BrowserContext } from '@playwright/test'
import { MaterialTestingPage } from './material-testing.page'
import { ManufacturingTestingPage } from './manufacturing-testing.page'

export class StockMachiningTestingPage {
	readonly material: MaterialTestingPage
	readonly manufacturing: ManufacturingTestingPage

	constructor(page: Page, context: BrowserContext) {
		this.material = new MaterialTestingPage(page, context)
		this.manufacturing = new ManufacturingTestingPage(page, context)
	}

	async readAll(): Promise<Record<string, any>> {
		const mat = await this.material.readMaterialValues()
		const mfg = await this.manufacturing.readManufacturingValues()
		return { ...mat, ...mfg }
	}
}
