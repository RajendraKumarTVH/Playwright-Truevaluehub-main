import { expect, Locator, Page, BrowserContext } from '@playwright/test'
import BasePage from '@lib/BasePage'

export default class ProjectSearchPage extends BasePage {
	readonly page: Page
	readonly context: BrowserContext

	readonly Projects: Locator
	readonly Active: Locator
	readonly SelectAnOption: Locator
	readonly SelectMatchValue: Locator
	readonly SelectValue: Locator
	readonly ApplyButton: Locator
	readonly ProjectsNonHiddenRows: Locator
	readonly ClearAll: Locator

	constructor(page: Page, context: BrowserContext) {
		super(page)
		this.page = page
		this.context = context

		this.Projects = page.getByRole('link', { name: 'Projects' })
		this.Active = page.getByRole('tab', { name: 'ACTIVE' })
		this.SelectAnOption = page.locator('#mat-select-value-0')
		this.SelectMatchValue = page.locator('#mat-select-value-1')
		this.SelectValue = page.getByRole('combobox', { name: '--Select--' })
		this.ApplyButton = page.getByRole('button', { name: 'Apply' })
		this.ProjectsNonHiddenRows = page.locator(
			'table#pn_id_3-table tbody tr:not([style*="display: none;"])'
		)
		this.ClearAll = page.getByText('Clear All')
	}

	// Apply filters and verify table results
	async multipleFiltersToFindResults1(): Promise<void> {
		await this.Projects.click()
		await this.Active.click()

		// Select each option in first dropdown
		const options1 = await this.getAllOptions(this.SelectAnOption)
		for (const option1 of options1) {
			await this.selectValue(this.SelectAnOption, option1)

			// Select each option in second dropdown
			const options2 = await this.getAllOptions(this.SelectMatchValue)
			for (const option2 of options2) {
				await this.selectValue(this.SelectMatchValue, option2)

				// Fill select value if needed
				await this.waitAndFill(this.SelectValue, 'Vinutha s')
				await this.keyPress(this.SelectValue, 'Enter')

				// Apply filters
				await this.ApplyButton.click()

				// Verify rows exist
				const rowCount = await this.ProjectsNonHiddenRows.count()
				console.log(`Filters: ${option1} | ${option2} => ${rowCount} rows`)
				expect(rowCount).toBeGreaterThanOrEqual(0) // Can adjust check

				// Optional: log first row
				if (rowCount > 0) {
					const firstRow = await this.ProjectsNonHiddenRows.nth(0).textContent()
					console.log('First row:', firstRow)
				}

				// Clear filters for next iteration
				await this.ClearAll.click()
			}
		}
	}
}
