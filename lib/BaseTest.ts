import { TestInfo, test as baseTest, BrowserContext } from '@playwright/test'
import { WebActions } from '@lib/WebActions'
import AxeBuilder from '@axe-core/playwright'
import { LoginPage } from '../pageFactory/pageRepository/LoginPage'
import fs from 'node:fs'
import path from 'node:path'
import CreateProjectPage from '../pageFactory/pageRepository/CreateProjectPage'
import ProjectSearchPage from '@pages/ProjectSearchPage'

const storageFile = path.resolve(__dirname, '../user-data/storageState.json')

const test = baseTest.extend<{
	webActions: WebActions
	loginPage: LoginPage
	createProjectPage: CreateProjectPage
	projectSearchPage: ProjectSearchPage
	makeAxeBuilder: AxeBuilder
	context: BrowserContext
	testInfo: TestInfo
}>({
	page: async ({ page }, use) => {
		// Reuse login state if available
		await page.context().addCookies([]) // optional safety
		await use(page)
	},
	webActions: async ({ page, context }, use) => {
		await use(new WebActions(page, context))
	},

	loginPage: async ({ page, context }, use) => {
		await use(new LoginPage(page, context))
	},
	createProjectPage: async ({ page, context }, use) => {
		await use(new CreateProjectPage(page, context))
	},
	projectSearchPage: async ({ page, context }, use) => {
		await use(new ProjectSearchPage(page, context))
	},
	makeAxeBuilder: async ({ page }, use) => {
		await use(
			new AxeBuilder({ page })
				.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
				.exclude('#commonly-reused-element-with-known-issue')
		)
	},

	context: async ({ browser }, use) => {
		let context: BrowserContext

		// Use persistent login if storage file exists
		if (fs.existsSync(storageFile)) {
			context = await browser.newContext({ storageState: storageFile })
		} else {
			context = await browser.newContext()
		}

		await use(context)

		// Save login state after tests if not already saved
		const pages = context.pages()
		if (pages.length > 0) {
			await context.storageState({ path: storageFile })
		}

		await context.close()
	}
})

export default test
