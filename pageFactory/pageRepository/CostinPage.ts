import BasePage from '@lib/BasePage'
import logger from '@lib/LoggerUtil'
import { expect, Locator, Page, BrowserContext } from '@playwright/test'

export default class CostingPage extends BasePage {
	readonly page: Page
	readonly context: BrowserContext
	readonly ProjectID: Locator

	constructor(page: Page, context: BrowserContext) {
		super(page)
		this.page = page
		this.context = context

		this.ProjectID = page.getByRole('button', { name: '13476' })
	}
}
