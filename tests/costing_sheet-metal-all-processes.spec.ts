import {
	test,
	chromium,
	type BrowserContext,
	type Page
} from '@playwright/test'
import fs from 'node:fs'
import Logger from './lib/LoggerUtil'
import { SheetMetalLogic } from './pages/sheet-metal-logic'
import { SheetMetalPage } from './pages/sheet-metal.page'
import { LoginPage } from '../pageFactory/pageRepository/LoginPage'

const logger = Logger

const CONFIG = {
	projectId: '14783',
	baseUrl: 'https://qa.truevaluehub.com',
	timeout: 60000,
	userProfilePath: './user-profile-sheetmetal-all',
	authStatePath: 'auth_sheetmetal_all.json'
} as const

let context: BrowserContext
let page: Page
let sheetMetalPage: SheetMetalPage
let sheetMetalLogic: SheetMetalLogic
let loginPage: LoginPage

let hasFailed = false

test.setTimeout(CONFIG.timeout)

test.beforeAll(async () => {
	logger.info('🚀 Starting Sheet Metal - All Processes E2E')

	context = await chromium.launchPersistentContext(CONFIG.userProfilePath, {
		channel: 'msedge',
		headless: false,
		args: ['--start-maximized'],
		viewport: null,
		timeout: CONFIG.timeout
	})

	page = context.pages().length ? context.pages()[0] : await context.newPage()

	loginPage = new LoginPage(page, context)
	sheetMetalPage = new SheetMetalPage(page, context)
	sheetMetalLogic = new SheetMetalLogic(sheetMetalPage)

	await page.waitForLoadState('domcontentloaded')
	await loginPage.loginToApplication()
	await context.storageState({ path: CONFIG.authStatePath })
	await sheetMetalLogic.navigateToProject(CONFIG.projectId)
})

test.afterAll(async () => {
	logger.info('🏁 Completed Sheet Metal - All Processes E2E')
	if (context) await context.close()
})

async function runStep(name: string, fn: () => Promise<void>) {
	try {
		await fn()
	} catch (err: any) {
		await handleFailure(name, err)
		throw err
	}
}

async function handleFailure(name: string, err: any) {
	hasFailed = true
	logger.error(`❌ ${name}: ${err?.message || err}`)
	await takeScreenshot(page, name)
}

async function takeScreenshot(page: Page, name: string) {
	if (!fs.existsSync('screenshots'))
		fs.mkdirSync('screenshots', { recursive: true })
	await page.screenshot({ path: `screenshots/${name}.png`, fullPage: true })
}

test.describe.serial('Sheet Metal - Process Calculations', () => {
	test.beforeEach(() => {
		test.skip(hasFailed, 'Skipping because a previous step failed')
	})

	test('SM01 - Bending calculations', async () => {
		await runStep('SM01_Bending', async () => {
			await sheetMetalLogic.verifyBendingCalculations({})
		})
	})

	test('SM02 - Soft Bending calculations', async () => {
		await runStep('SM02_SoftBending', async () => {
			await sheetMetalLogic.verifySoftBendingCalculations({})
		})
	})

	test('SM03 - Laser Cutting calculations', async () => {
		await runStep('SM03_LaserCutting', async () => {
			await sheetMetalLogic.verifyLaserCuttingCalculations({})
		})
	})

	test('SM04 - Progressive Stamping calculations', async () => {
		await runStep('SM04_StampingProgressive', async () => {
			await sheetMetalLogic.verifyStampingProgressiveCalculations({})
		})
	})

	test('SM05 - Transfer Press calculations', async () => {
		await runStep('SM05_TransferPress', async () => {
			await sheetMetalLogic.verifyTransferPressCalculations()
		})
	})

	test('SM06 - Stamping Stage calculations', async () => {
		await runStep('SM06_StampingStage', async () => {
			await sheetMetalLogic.verifyStampingStageCalculations()
		})
	})

	test('SM07 - Forming calculations', async () => {
		await runStep('SM07_Forming', async () => {
			await sheetMetalLogic.verifyFormingCalculations()
		})
	})

	test('SM08 - Drawing calculations', async () => {
		await runStep('SM08_Drawing', async () => {
			await sheetMetalLogic.verifyDrawingCalculations()
		})
	})

	test('SM09 - TPP calculations', async () => {
		await runStep('SM09_TPP', async () => {
			await sheetMetalLogic.verifyTPPCalculations()
		})
	})

	test('SM10 - Oxy Cutting calculations', async () => {
		await runStep('SM10_OxyCutting', async () => {
			await sheetMetalLogic.verifyOxyCuttingCalculations()
		})
	})

	test('SM11 - Tube Laser calculations', async () => {
		await runStep('SM11_TubeLaser', async () => {
			await sheetMetalLogic.verifyTubeLaserCalculations()
		})
	})

	test('SM12 - Tube Bending calculations', async () => {
		await runStep('SM12_TubeBending', async () => {
			await sheetMetalLogic.verifyTubeBendingMetalCalculations()
		})
	})

	test('SM13 - Shearing calculations', async () => {
		await runStep('SM13_Shearing', async () => {
			await sheetMetalLogic.verifyShearingCalculations()
		})
	})
})
