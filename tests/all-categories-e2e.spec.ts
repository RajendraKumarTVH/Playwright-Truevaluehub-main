import {
	test,
	chromium,
	type BrowserContext,
	type Page
} from '@playwright/test'
import Logger from './lib/LoggerUtil'
import { SheetMetalPage } from './pages/sheet-metal.page'
import { SheetMetalLogic } from './pages/sheet-metal-logic'
import { MigWeldingPage } from './pages/mig-welding.page'
import { MigWeldingLogic } from './pages/mig-welding-logic'
import { PlasticRubberPage } from './pages/plastic-rubber.page'
import { PlasticRubberLogic } from './pages/plastic-rubber-logic'
import { ToolingPage } from './pages/tooling.page'
import { ToolingLogic } from './pages/tooling-logic'
import { LoginPage } from '../pageFactory/pageRepository/LoginPage'

const logger = Logger

const CONFIG = {
	projectId: '14783',
	timeout: 60000,
	userProfilePath: './user-profile-all-categories',
	authStatePath: 'auth_all_categories.json'
} as const

let context: BrowserContext
let page: Page

test.setTimeout(CONFIG.timeout)

test.beforeAll(async () => {
	logger.info('🚀 Starting All Categories E2E')
	context = await chromium.launchPersistentContext(CONFIG.userProfilePath, {
		channel: 'msedge',
		headless: false,
		args: ['--start-maximized'],
		viewport: null,
		timeout: CONFIG.timeout
	})
	page = context.pages().length ? context.pages()[0] : await context.newPage()

	const loginPage = new LoginPage(page, context)
	await page.waitForLoadState('domcontentloaded')
	await loginPage.loginToApplication()
	await context.storageState({ path: CONFIG.authStatePath })
})

test.afterAll(async () => {
	if (context) await context.close()
	logger.info('🏁 All Categories E2E Completed')
})

async function runStep(name: string, fn: () => Promise<void>) {
	try {
		await fn()
	} catch (err: any) {
		logger.error(`❌ ${name}: ${err?.message || err}`)
		throw err
	}
}

test.describe.serial('All Categories - smoke', () => {
	test('Category: Sheet Metal - End-to-end verification', async () => {
		await runStep('SheetMetal_EndToEnd', async () => {
			const sheetPage = new SheetMetalPage(page, context)
			const logic = new SheetMetalLogic(sheetPage)
			await logic.navigateToProject(CONFIG.projectId)
			await logic.verifyCompleteSheetMetalProcess()
		})
	})

	test('Category: MIG Welding - End-to-end verification', async () => {
		await runStep('MigWelding_EndToEnd', async () => {
			const mwPage = new MigWeldingPage(page, context)
			const logic = new MigWeldingLogic(mwPage)
			await logic.navigateToProject(CONFIG.projectId)
			await logic.verifyCompleteWeldingProcess()
		})
	})

	test('Category: Plastic & Rubber - End-to-end verification', async () => {
		await runStep('PlasticRubber_EndToEnd', async () => {
			const prPage = new PlasticRubberPage(page, context)
			const logic = new PlasticRubberLogic(prPage)
			//await logic.navigateToProject(CONFIG.projectId)
			await logic.verifyInjectionMoulding()
		})
	})

	test('Category: Tooling - End-to-end verification', async () => {
		await runStep('Tooling_EndToEnd', async () => {
			const tPage = new ToolingPage(page, context)
			const logic = new ToolingLogic(tPage)
			//await logic.navigateToProject(CONFIG.projectId)
			// simple tooling verification flow
			await logic.verifyToolingCalculations()
		})
	})
})
