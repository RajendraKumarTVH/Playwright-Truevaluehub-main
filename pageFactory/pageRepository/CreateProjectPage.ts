import { Locator, Page, BrowserContext } from '@playwright/test'
import getTimeStamp from '../../lib/timezone'
import BasePage from '@lib/BasePage'
import path from 'path'
import { dragAndDropFiles } from '@lib/dragAndDropFiles'
export default class CreateProjectPage extends BasePage {
	readonly page: Page
	readonly context: BrowserContext

	// Navigation & main fields
	readonly Create: Locator
	readonly ProjectNameOrNumber: Locator
	readonly Description: Locator
	readonly Tag: Locator
	readonly CostingTargetMonth: Locator
	readonly SaveDraft: Locator

	// File upload related
	readonly ChooseFilesUpload: Locator
	readonly uploadButton: Locator
	readonly FileInput: Locator

	// Data table fields
	readonly EditDatatable: Locator
	readonly DescriptionPart: Locator
	readonly AnnualVolume: Locator
	readonly category: Locator
	readonly Supplier: Locator
	readonly DeliveryDate: Locator
	readonly DeliverySite: Locator

	// File confirmation after upload
	readonly ExtractionFile: Locator
	readonly SupportingFile: Locator

	// Action buttons
	readonly ConfirmButton: Locator
	readonly ActivateProject: Locator
	readonly EditCancel: Locator
	readonly Help: Locator
	public static readonly projectName: string = `Proj_${getTimeStamp()}`

	constructor(page: Page, context: BrowserContext) {
		super(page)
		this.page = page
		this.context = context

		// Navigation & main fields
		this.Create = page.getByRole('link', { name: 'Create' })
		this.ProjectNameOrNumber = page.locator('#pninput')
		this.Description = page.getByRole('textbox', { name: 'Description' })
		this.Tag = page.getByRole('textbox', { name: 'Tag' })
		this.CostingTargetMonth = page.getByRole('textbox').nth(4)
		this.SaveDraft = page.getByRole('button', { name: 'Save to Draft' })

		// File upload related (✅ fixed: locate actual <input type="file">)
		this.ChooseFilesUpload = page.getByText('Choose files')
		this.uploadButton = page.getByText('Choose files')
		this.FileInput = page.locator('//*[@id="folder-drop1"]')

		// Data table fields
		this.EditDatatable = page.locator(
			'//*[@id="pn_id_2-table"]/tbody/tr/td[11]/div/button[1]'
		)

		this.DescriptionPart = page.locator(
			'#pn_id_1-table > tbody > tr > td:nth-child(3) > p-celleditor > input'
		)
		this.AnnualVolume = page.locator(
			'#pn_id_1-table > tbody > tr > td.col-width-150 > p-celleditor > input'
		)
		this.category = page.locator('#pn_id_7')
		this.Supplier = page.locator('#pn_id_9')
		this.DeliverySite = page.locator('#pn_id_11')
		this.DeliveryDate = page.locator('#pn_id_11')

		// File confirmation after upload
		this.ExtractionFile = page.locator(
			'#pn_id_1-table > tbody > tr > td:nth-child(9) > div:nth-child(1) > ul > li > span'
		)
		this.SupportingFile = page.locator(
			'#pn_id_1-table > tbody > tr > td.relative.no-border-right > div:nth-child(1) > ul > li'
		)

		// Action buttons
		this.ActivateProject = page.getByRole('button', {
			name: 'Activate Project'
		})
		this.ConfirmButton = page.getByRole('button').filter({ hasText: 'check' })
		this.EditCancel = page.locator('.p-datatable-row-editor-cancel')
		this.Help = page.getByRole('button', { name: 'Open asap' })
	}

	// 🧪 Create new project
	async createNewProject(): Promise<void> {
		console.log(`🟢 Creating new project: ${CreateProjectPage.projectName}`)

		// Step 1️⃣ – Click create
		await this.Create.click()
		await this.ProjectNameOrNumber.fill(CreateProjectPage.projectName)
		await this.Description.fill('SheetMetal')
		await this.Tag.fill('Bending')
		//await this.page.pause()
		await this.page.evaluate(() => {
			const input = document.querySelector('#folder-drop1 input[type="file"]')
			if (!input) throw new Error('File input not found!')
			input.removeAttribute('webkitdirectory')
			input.removeAttribute('mozdirectory')
		})

		const files = [
			'test-data/1023729-C-110-01 4.pdf',
			'test-data/1023729-C-1023729-C 3.stp'
		]

		const filePath = path.resolve('test-data/relive.docx')
		//await this.page.setInputFiles('#folder-drop1 input[type="file"]', files)
		await dragAndDropFiles(this.page, this.FileInput, [filePath])
		//await this.dragAndDropFiles(this.page, this.FileInput, filePath)
		await this.FileInput.waitFor({ state: 'attached', timeout: 5000 })
		console.log('File uploaded')
		await this.Help.click()
		await this.EditDatatable.click()
		await this.DescriptionPart.fill('UPS Top Bracket')
		await this.AnnualVolume.fill('125')
		await this.selectValue(this.category, 'Sheet Metal and Fabrication')
		await this.selectValue(this.Supplier, 'Target Vendor - India')
		await this.selectValue(this.DeliverySite, 'ADS - Buford')

		// Step 5️⃣ – (Optional) Activate project
		// await this.ActivateProject.click()
	}
}
