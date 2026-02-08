import { test, expect, BrowserContext, Page, chromium } from '@playwright/test'
import { MigWeldingLogic } from './pages/mig-welding-logic'
import { LoginPage } from '@pages/LoginPage'
import Logger from './lib/LoggerUtil'
import fs from 'fs'
// Test Data Imports
import { MigWeldingTestData } from '../test-data/mig-welding-testdata'
import { MigWeldingPage } from './pages/mig-welding.page'
import { WeldingCalculator } from './utils/welding-calculator'

const logger = Logger
const RUN_ID = Date.now()

// ==================== TEST CONFIGURATION ====================
const CONFIG = {
	projectId: MigWeldingTestData.config?.baseUrl
		? MigWeldingTestData.project.projectId
		: '14783',
	baseUrl: MigWeldingTestData.config?.baseUrl || 'https://qa.truevaluehub.com',
	timeout: MigWeldingTestData.config?.defaultTimeout || 30000,
	userProfilePath: `./user-profile-${RUN_ID}`,
	authStatePath: 'auth.json'
} as const
const calculator = new WeldingCalculator()
// ==================== MAIN TEST SUITE ====================
test.describe('MIG Welding - Complete E2E Test Suite', () => {
	let context: BrowserContext
	let page: Page
	let migWeldingPage: MigWeldingPage
	let migWeldingLogic: MigWeldingLogic
	let loginPage: LoginPage

	test.describe.configure({ mode: 'serial' })

	// ==================== SETUP & TEARDOWN ====================
	test.beforeAll(async () => {
		logger.info('═══════════════════════════════════════════════════════════')
		logger.info('🚀 Starting MIG Welding E2E Test Suite')
		logger.info('═══════════════════════════════════════════════════════════')
		logger.info(`📋 Project ID: ${CONFIG.projectId}`)
		logger.info(`🌐 Base URL: ${CONFIG.baseUrl}`)

		context = await chromium.launchPersistentContext(CONFIG.userProfilePath, {
			channel: 'msedge',
			headless: false,
			args: ['--start-maximized'],
			viewport: null,
			timeout: CONFIG.timeout
		})

		page =
			context.pages().length > 0 ? context.pages()[0] : await context.newPage()
		loginPage = new LoginPage(page, context)
		migWeldingPage = new MigWeldingPage(page, context)
		migWeldingLogic = new MigWeldingLogic(migWeldingPage)

		await loginPage.loginToApplication()
		await context.storageState({ path: CONFIG.authStatePath })
		await migWeldingLogic.navigateToProject(CONFIG.projectId)
	})

	test.afterAll(async () => {
		try {
			logger.info('🏁 MIG Welding E2E Test Suite Completed')
		} finally {
			if (context) await context.close()
			if (fs.existsSync(CONFIG.userProfilePath)) {
				try {
					fs.rmSync(CONFIG.userProfilePath, { recursive: true, force: true })
				} catch {
					// best-effort cleanup
				}
			}
		}
	})

	test.afterEach(async ({ }, testInfo) => {
		if (testInfo.status !== testInfo.expectedStatus) {
			const screenshotName = `screenshots/${testInfo.title.replace(
				/\s+/g,
				'_'
			)}_error.png`
			if (page && !page.isClosed()) {
				if (!fs.existsSync('screenshots'))
					fs.mkdirSync('screenshots', { recursive: true })
				await page.screenshot({ path: screenshotName, fullPage: true })
				logger.error(
					`❌ Test "${testInfo.title}" failed. Screenshot: ${screenshotName}`
				)
			}
		}
	})

	// ==================== TEST CATEGORIES ====================

	test.describe('Phase 1: Project & Material Configuration', () => {
		test('TC001: Verify Part Information from Project', async () => {
			logger.info('🔹 Phase 1: Verifying Part Information')
			await migWeldingLogic.verifyPartInformation()
			logger.info('🔹 Phase 1: Verifying Dropdowns')
			await migWeldingLogic.verifyDropdown('Supplier')
			await migWeldingLogic.verifyDropdown('Delivery')

		})

	})

	test('TC002: Configure Material Information', async () => {
		logger.info('🔹 Phase 1: Configuring Material Info')
		await migWeldingLogic.verifyMaterialInformationDetails()
	})

	test.describe('Phase 2: Welding Parameters & Weight Calculations', () => {
		test('TC003: Enter Welding Details', async () => {
			logger.info('🔹 Phase 2: Entering Welding Details')
			await migWeldingLogic.verifyWeldingDetails(MigWeldingTestData)
		})

		test('TC004: Verify Net Weight and Material Cost', async () => {
			logger.info('🔹 Phase 2: Verifying Net Weight & Cost')
			await migWeldingLogic.verifyNetWeight(); // calculator will compute expected
		})

		test('TC005: Verify Weld Length & Material Weight', async () => {
			logger.info('🔹 Phase 2: Verifying Weld Metrics')
			await migWeldingLogic.verifyTotalWeldLength()
			await migWeldingLogic.verifyTotalWeldMaterialWeight()
			await migWeldingLogic.verifyWeldingMaterialCalculations()
		})
	})

	test.describe('Phase 3: Manufacturing Cost Analysis', () => {
		test.beforeAll(async () => {
			await migWeldingPage.ManufacturingInformation.scrollIntoViewIfNeeded()
			await migWeldingLogic.verifyManufacturingInformationDetails(
				MigWeldingTestData
			)
		})

		test('TC006: Verify Setup and Machine Costs', async () => {
			logger.info('🔹 Phase 3: Verifying Setup & Machine Costs')
			await migWeldingLogic.verifySetupCost()
			await migWeldingLogic.verifyMachineCost()
		})

		test('TC007: Verify Labor and Power Costs', async () => {
			logger.info('🔹 Phase 3: Verifying Labor & Power Costs')
			await migWeldingLogic.verifyLaborCost()
			await migWeldingLogic.verifyPowerCost()
		})

		test('TC008: Verify QA Inspection and Yield Costs', async () => {
			logger.info('🔹 Phase 3: Verifying QA & Yield Costs')
			// QA Inspection manually calculated in test as a spot check
			const rate = await migWeldingPage.getInputValueAsNumber(
				migWeldingPage.QAInspectorRate
			)
			const time = await migWeldingPage.getInputValueAsNumber(
				migWeldingPage.QAInspectionTime
			)
			const actual = await migWeldingPage.getInputValueAsNumber(
				migWeldingPage.QAInspectionCost
			)
			const expected = (rate / 3600) * time
			expect(actual).toBeCloseTo(expected, 4)

			await migWeldingLogic.verifyYieldCost()
		})
	})

	test.describe('Phase 4: Advanced Process & Sustainability', () => {
		test('TC009: Verify Material Sustainability (CO2)', async () => {
			logger.info('🔹 Phase 4: Verifying Sustainability')
			await migWeldingLogic.verifyMaterialSustainability()
		})

		test('TC010: Verify Weld Cycle Time Breakdown', async () => {
			logger.info('🔹 Phase 4: Verifying Cycle Time')
			await migWeldingLogic.verifyWeldCycleTimeDetails(MigWeldingTestData)
		})

		test('TC011: Verify Weld Cleaning Process Toggle', async () => {
			logger.info('🔹 Phase 4: Testing Weld Cleaning Process')
			await migWeldingPage.ManufacturingInformation.scrollIntoViewIfNeeded()
			await migWeldingPage.WeldCleanRadBtn.click()
			await page.waitForTimeout(1000)
			await migWeldingLogic.verifyAllWeldingCalculations()
		})

		test('TC012: Final Recalculation & Comprehensive Verification', async () => {
			logger.info('🔹 Phase 4: Comprehensive Final Check')
			if (!(await migWeldingPage.MigWeldRadBtn.isChecked())) {
				await migWeldingPage.MigWeldRadBtn.click()
				await page.waitForTimeout(1000)
			}
			await migWeldingLogic.verifyAllWeldingCalculations()
		})
	})
})
