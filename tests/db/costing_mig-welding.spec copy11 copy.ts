import { test, expect, BrowserContext, Page, chromium } from '@playwright/test'

import { MigWeldingLogic } from './pages/mig-welding-logic'
import { LoginPage } from '@pages/LoginPage'
import Logger from './lib/LoggerUtil'
import fs from 'fs'
// Test Data Imports
import { MigWeldingTestData } from '../test-data/mig-welding-testdata'
import { MigWeldingPage } from './pages/mig-welding.page'

const logger = Logger
const RUN_ID = Date.now()

// ==================== TEST CONFIGURATION ====================
const CONFIG = {
	projectId: MigWeldingTestData.config?.baseUrl ? MigWeldingTestData.project.projectId : '14783',
	baseUrl: MigWeldingTestData.config?.baseUrl || 'https://qa.truevaluehub.com',
	timeout: MigWeldingTestData.config?.defaultTimeout || 30000,
	userProfilePath: `./user-profile-${RUN_ID}`,
	authStatePath: 'auth.json'
} as const

// ==================== MAIN TEST SUITE ====================
test.describe('MIG Welding - Complete E2E Test Suite', () => {
	let context: BrowserContext
	let page: Page
	let migWeldingPage: MigWeldingPage
	let migWeldingLogic: MigWeldingLogic
	let loginPage: LoginPage
	let hasFailed = false

	// ==================== SETUP & TEARDOWN ====================
	test.beforeAll(async () => {
		logger.info('═══════════════════════════════════════════════════════════')
		logger.info('🚀 Starting MIG Welding E2E Test Suite')
		logger.info('═══════════════════════════════════════════════════════════')
		logger.info(`📋 Project ID: ${CONFIG.projectId}`)
		logger.info(`🌐 Base URL: ${CONFIG.baseUrl}`)
		logger.info(
			`🧹 Using isolated user profile folder: ${CONFIG.userProfilePath}`
		)

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
		logger.info('✅ Browser context and page objects initialized')

		await loginPage.loginToApplication()
		await context.storageState({ path: CONFIG.authStatePath })
		await migWeldingLogic.navigateToProject(CONFIG.projectId)
	})

	test.afterAll(async () => {
		try {
			logger.info('═══════════════════════════════════════════════════════════')
			logger.info('🏁 MIG Welding E2E Test Suite Completed')
			logger.info('═══════════════════════════════════════════════════════════')
		} finally {
			if (context) await context.close()
			if (fs.existsSync(CONFIG.userProfilePath)) {
				try {
					fs.rmSync(CONFIG.userProfilePath, { recursive: true, force: true })
				} catch {
					// best-effort cleanup; ignore Windows file locks
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
			if (!page || page.isClosed()) {
				logger.error(
					`❌ Test "${testInfo.title}" failed, but page is already closed. Skipping screenshot.`
				)
				return
			}
			if (!fs.existsSync('screenshots')) {
				fs.mkdirSync('screenshots', { recursive: true })
			}
			await page.screenshot({ path: screenshotName, fullPage: true })
			logger.error(
				`❌ Test "${testInfo.title}" failed. Screenshot: ${screenshotName}`
			)
		}
	})

	// ==================== TEST CASES ====================

	test.describe('1. Project Setup & Data Entry', () => {
		test(
			'TC001: Verify Part Information',
			{ tag: '@smoke' },
			async () => {
				if (hasFailed) test.skip()
				try {
					logger.info('🔹 TC001: Verifying Part Information')
					await migWeldingLogic.verifyPartInformation()
				} catch (err) {
					hasFailed = true
					throw err
				}
			}
		)

		test(
			'TC002: Enter and Verify Welding Details',
			{ tag: '@smoke' },
			async () => {
				if (hasFailed) test.skip()
				try {
					logger.info('🔹 TC002: Entering and Verifying Welding Details')
					await migWeldingLogic.verifyMaterialInformationDetails()
					// await migWeldingLogic.verifySupplierDropdown()
					// await migWeldingLogic.verifyDeliveryDropdown()
					await migWeldingLogic.verifyWeldingDetails(MigWeldingTestData)

					await migWeldingLogic.getNetWeight()
					await migWeldingLogic.verifyNetWeight()
					await migWeldingLogic.verifyNetMaterialCostCalculation()
					await migWeldingLogic.getNetMaterialCost()
					await migWeldingLogic.getTotalWeldLength()
					await migWeldingLogic.verifyTotalWeldLength()
					await migWeldingLogic.getTotalWeldMaterialWeight()
					await migWeldingLogic.verifyTotalWeldMaterialWeight()
					await migWeldingLogic.getEfficiency()
					await migWeldingLogic.getWeldBeadWeightWithWastage()
					await migWeldingLogic.verifyWeldingMaterialCalculations()
					await migWeldingLogic.verifyMaterialSustainability()
					await migWeldingLogic.verifyMachineCost()
					await migWeldingLogic.verifyLaborCost()
					await migWeldingLogic.verifySetupCost()
					await migWeldingLogic.verifyPowerCost()
					await migWeldingLogic.verifyYieldCost()
					await migWeldingLogic.verifyWeldCycleTimeDetails(MigWeldingTestData)
					await migWeldingLogic.getProcessType()
				} catch (err) {
					hasFailed = true
					throw err
				}
			}
		)
	})

	test.describe('2. Manufacturing & Cost Verifications', () => {
		test(
			'TC003: Verify Setup Cost/Part',
			{ tag: ['@manufacturing', '@cost'] },
			async () => {
				if (hasFailed) test.skip()
				try {
					logger.info('🔹 TC003: Verifying Setup Cost/Part')
					await migWeldingPage.ManufacturingInformation.scrollIntoViewIfNeeded()
					await migWeldingLogic.verifyManufacturingInformationDetails(MigWeldingTestData)
					await migWeldingLogic.verifySetupCost()
				} catch (err) {
					hasFailed = true
					throw err
				}
			}
		)

		test(
			'TC004: Verify Machine Cost/Part',
			{ tag: ['@manufacturing', '@cost'] },
			async () => {
				if (hasFailed) test.skip()
				try {
					logger.info('🔹 TC004: Verifying Machine Cost/Part')
					await migWeldingLogic.verifyMachineCost()
				} catch (err) {
					hasFailed = true
					throw err
				}
			}
		)

		test(
			'TC005: Verify Labor Cost/Part',
			{ tag: ['@manufacturing', '@cost'] },
			async () => {
				if (hasFailed) test.skip()
				try {
					logger.info('🔹 TC005: Verifying Labor Cost/Part')
					await migWeldingLogic.verifyLaborCost()
				} catch (err) {
					hasFailed = true
					throw err
				}
			}
		)

		test(
			'TC006: Verify QA Inspection Cost/Part',
			{ tag: ['@manufacturing', '@cost'] },
			async () => {
				if (hasFailed) test.skip()
				try {
					logger.info('🔹 TC006: Verifying QA Inspection Cost/Part')
					const rate = await migWeldingPage.getInputValueAsNumber(migWeldingPage.QAInspectorRate)
					const time = await migWeldingPage.getInputValueAsNumber(migWeldingPage.QAInspectionTime)
					const actual = await migWeldingPage.getInputValueAsNumber(migWeldingPage.QAInspectionCost)
					const expected = (rate / 3600) * time
					expect(actual).toBeCloseTo(expected, 4)
				} catch (err) {
					hasFailed = true
					throw err
				}
			}
		)

		test(
			'TC007: Verify Yield Cost/Part',
			{ tag: ['@manufacturing', '@cost'] },
			async () => {
				if (hasFailed) test.skip()
				try {
					logger.info('🔹 TC007: Verifying Yield Cost/Part')
					await migWeldingLogic.verifyYieldCost()
				} catch (err) {
					hasFailed = true
					throw err
				}
			}
		)

		test(
			'TC008: Verify Total Power Cost',
			{ tag: ['@manufacturing', '@cost'] },
			async () => {
				if (hasFailed) test.skip()
				try {
					logger.info('🔹 TC008: Verifying Total Power Cost')
					await migWeldingLogic.verifyPowerCost()
				} catch (err) {
					hasFailed = true
					throw err
				}
			}
		)
	})

	test.describe('3. Calculations & Process Verifications', () => {
		test(
			'TC009: Verify Weld Cycle Time/Part',
			{ tag: ['@manufacturing', '@calculation'] },
			async () => {
				if (hasFailed) test.skip()
				try {
					logger.info('🔹 TC009: Verifying Weld Cycle Time (Backend vs UI)')
					await migWeldingLogic.verifyWeldCycleTimeDetails(MigWeldingTestData)
				} catch (err) {
					hasFailed = true
					throw err
				}
			}
		)

		test(
			'TC010: Verify Welding Material Calculations',
			{ tag: ['@manufacturing', '@calculation'] },
			async () => {
				if (hasFailed) test.skip()
				try {
					logger.info('🔹 TC010: Verifying Welding Material Calculations')
					await migWeldingLogic.verifyWeldingMaterialCalculations()
				} catch (err) {
					hasFailed = true
					throw err
				}
			}
		)

		test(
			'TC011: Verify Weld Cleaning Process',
			async () => {
				if (hasFailed) test.skip()
				try {
					logger.info('🔹 TC011: Verifying Weld Cleaning process')
					await migWeldingPage.WeldCleanRadBtn.click()
					await page.waitForTimeout(2000)
					await migWeldingLogic.verifyAllWeldingCalculations()
				} catch (err) {
					hasFailed = true
					throw err
				}
			}
		)

		test(
			'TC012: Comprehensive Welding Calculations Verification',
			{ tag: ['@manufacturing', '@calculation'] },
			async () => {
				if (hasFailed) test.skip()
				try {
					logger.info('🔹 TC012: Performing Comprehensive Verification')
					if (!(await migWeldingPage.MigWeldRadBtn.isChecked())) {
						await migWeldingPage.MigWeldRadBtn.click()
						await page.waitForTimeout(1000)
					}
					await migWeldingLogic.verifyAllWeldingCalculations()
				} catch (err) {
					hasFailed = true
					throw err
				}
			}
		)
	})
})