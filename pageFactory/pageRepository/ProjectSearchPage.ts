import BasePage from '@lib/BasePage'
import logger from '@lib/LoggerUtil'
import { expect, Locator, Page, BrowserContext } from '@playwright/test'

export default class ProjectSearchPage extends BasePage {
	readonly page: Page
	readonly context: BrowserContext

	readonly Projects: Locator
	readonly Active: Locator
	readonly SelectAnOption: Locator
	readonly SelectMatchValue: Locator
	readonly SelectValue: Locator
	readonly ProjectsTable: Locator
	readonly ProjectRows: Locator
	readonly ProjectsColumns: Locator
	readonly ProjectsNonHiddenRows: Locator
	readonly ApplyButton: Locator
	readonly SortValues: Locator
	readonly CreatedByDropdown: Locator
	readonly ClearAll: Locator

	constructor(page: Page, context: BrowserContext) {
		super(page)
		this.page = page
		this.context = context

		this.Projects = page.getByRole('link', { name: 'Projects' })
		this.Active = page.getByRole('tab', { name: 'ACTIVE' })
		this.ProjectsTable = page.locator('table#pn_id_3-table')
		this.ProjectRows = page.locator('table#pn_id_3-table tbody tr')
		this.ProjectsColumns = page.locator('table#pn_id_3-table tr th')
		this.ProjectsNonHiddenRows = page.locator(
			'table#pn_id_1-table tbody tr:not([style*="display: none;"])'
		)

		// Dropdowns
		this.SelectAnOption = page.locator('#mat-select-value-0')
		this.SelectMatchValue = page.locator('#mat-select-value-1')
		this.SelectValue = page.getByRole('combobox', { name: '--Select--' })

		this.ApplyButton = page.getByRole('button', { name: 'Apply' })
		this.SortValues = page
			.getByRole('columnheader', { name: 'Project #' })
			.getByRole('img')
		this.CreatedByDropdown = page.getByRole('option', { name: 'Created By' })
		this.ClearAll = page.getByText('Clear All')
	}

	async multipleFiltersToFindResults(): Promise<void> {
		console.log(`Applying multiple filters to find results...`)

		await this.Projects.click()
		await this.Active.click()
		logger.info('Select active tab')

		await this.selectValue(this.SelectAnOption, 'Created By')
		logger.info('SelectAnOption')
		await this.selectValue(this.SelectMatchValue, 'Is')
		logger.info('Select Match value')
		await this.waitAndFill(this.SelectValue, 'Vinutha s')
		logger.info('Fill select value')
		await this.keyPress(this.SelectValue, 'Enter')
		await this.ApplyButton.click()
		logger.info('ApplyButton')
		// ✅ Verify rows exist
		const rowCount = await this.ProjectsNonHiddenRows.count()
		expect(rowCount).toBeGreaterThan(0)

		// ✅ Optionally log first row text
		const firstRowText = await this.ProjectsNonHiddenRows.nth(0).textContent()
		console.log('First matching row:', firstRowText)

		await this.ClearAll.click()
	}
}
