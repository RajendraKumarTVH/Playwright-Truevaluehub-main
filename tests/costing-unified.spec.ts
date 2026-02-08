/**
 * @file costing-unified.spec.ts
 * @description Unified E2E test suite for all manufacturing process costing
 * Converts AngularJS-based Karma tests to comprehensive Playwright automation
 *
 * Coverage:
 * - Material cost calculations
 * - Manufacturing cost calculations (machine, labor, setup, QA)
 * - Power consumption costs
 * - Total cost verification
 * - Process-specific scenarios
 */

import {
	test,
	chromium,
	type BrowserContext,
	type Page,
	expect as playwrightExpect
} from '@playwright/test'
import fs from 'node:fs'
import Logger from './lib/LoggerUtil'
import CostingPage from './pages/costing.page'
import CostingLogic from './pages/costing-logic'
import { LoginPage } from '../pageFactory/pageRepository/LoginPage'
import {
	CostingTestData,
	ManufacturingProcess,
	COSTING_TEST_CONFIG,
	type CostingTestScenario
} from './utils/costing-test-data'

const logger = Logger

// ============================================================
// 🔧 GLOBAL CONFIGURATION & SETUP
// ============================================================

let context: BrowserContext
let page: Page
let costingPage: CostingPage
let costingLogic: CostingLogic
let loginPage: LoginPage

// Test results tracking
const testResults = {
	passed: 0,
	failed: 0,
	skipped: 0,
	scenarios: [] as any[]
}

test.setTimeout(COSTING_TEST_CONFIG.timeout)

// ============================================================
// 🧪 UTILITY FUNCTIONS
// ============================================================

async function runStep(
	stepName: string,
	fn: () => Promise<void>,
	options: { skipOnFailure?: boolean } = {}
) {
	try {
		logger.info(`➤ ${stepName}`)
		await fn()
		logger.info(`✅ ${stepName} - PASSED`)
	} catch (err: any) {
		logger.error(`❌ ${stepName} - FAILED: ${err.message}`)
		await takeScreenshot(page, stepName.replace(/\s+/g, '_'))

		if (!options.skipOnFailure) {
			throw err
		}
	}
}

async function takeScreenshot(pageInstance: Page, name: string) {
	if (!fs.existsSync('screenshots')) {
		fs.mkdirSync('screenshots', { recursive: true })
	}

	if (pageInstance?.isClosed?.()) return

	try {
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
		await pageInstance.screenshot({
			path: `screenshots/${name}-${timestamp}.png`,
			fullPage: true
		})
	} catch (err) {
		logger.warn(`⚠️ Failed to take screenshot: ${err}`)
	}
}

async function setupBrowser() {
	logger.info('═══════════════════════════════════════════════════════════')
	logger.info('🚀 Initializing Costing Test Suite')
	logger.info('═══════════════════════════════════════════════════════════\n')

	context = await chromium.launchPersistentContext(
		COSTING_TEST_CONFIG.userProfilePath,
		{
			channel: COSTING_TEST_CONFIG.browser as 'msedge',
			headless: COSTING_TEST_CONFIG.headless,
			args: ['--start-maximized'],
			viewport: null,
			timeout: COSTING_TEST_CONFIG.timeout,
			slowMo: COSTING_TEST_CONFIG.slowMo
		}
	)

	page = context.pages().length ? context.pages()[0] : await context.newPage()
	loginPage = new LoginPage(page, context)
	costingPage = new CostingPage(page, context)
	costingLogic = new CostingLogic(costingPage)

	await page.waitForLoadState('domcontentloaded')
	await loginPage.loginToApplication()
	await costingPage.waitForNetworkIdle()
	await context.storageState({ path: COSTING_TEST_CONFIG.authStatePath })

	logger.info('✅ Browser setup completed\n')
}

async function cleanupBrowser() {
	logger.info('\n═══════════════════════════════════════════════════════════')
	logger.info('🏁 Costing Test Suite Completed')
	logger.info('═══════════════════════════════════════════════════════════')
	logger.info(
		`📊 Results: ${testResults.passed} Passed | ${testResults.failed} Failed | ${testResults.skipped} Skipped\n`
	)

	if (context) {
		try {
			await context.close()
			logger.info('✅ Browser context closed')
		} catch (err) {
			logger.warn(`⚠️ Failed to close context: ${err}`)
		}
	}

	// Cleanup user profile (best-effort)
	const profilePath = COSTING_TEST_CONFIG.userProfilePath
	if (fs.existsSync(profilePath)) {
		for (let attempt = 1; attempt <= 3; attempt++) {
			try {
				await new Promise(res => setTimeout(res, 2000))
				fs.rmSync(profilePath, { recursive: true, force: true })
				logger.info('✅ User profile cleaned')
				break
			} catch (err) {
				if (attempt === 3) {
					logger.warn('⚠️ Skipping profile cleanup (file lock)')
				}
			}
		}
	}

	// Generate test report
	generateTestReport()
}

async function navigateToScenarioProject(projectId: string) {
	logger.info(`📍 Navigating to project: ${projectId}`)

	await costingPage.clickButton(costingPage.ProjectIcon)

	const isClearVisible = await costingPage.isVisible(costingPage.ClearAll, 2000)
	if (isClearVisible) {
		await costingPage.clickButton(costingPage.ClearAll)
	} else {
		await page.keyboard.press('Escape')
	}

	await costingPage.clickButton(costingPage.SelectAnOption)
	await costingPage.waitForNetworkIdle()
	await costingPage.fillInput(costingPage.ProjectValue, projectId)
	await page.keyboard.press('Enter')
	await costingPage.waitForNetworkIdle()

	logger.info('✅ Project loaded')
}

function generateTestReport() {
	const report = {
		timestamp: new Date().toISOString(),
		summary: {
			total: testResults.scenarios.length,
			passed: testResults.passed,
			failed: testResults.failed,
			skipped: testResults.skipped,
			successRate:
				(
					(testResults.passed / (testResults.passed + testResults.failed)) *
					100
				).toFixed(2) + '%'
		},
		details: testResults.scenarios
	}

	const reportPath = 'test-results/costing-report.json'
	fs.mkdirSync('test-results', { recursive: true })
	fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))

	logger.info(`📋 Test report saved to ${reportPath}`)
}

// ============================================================
// 🧪 TEST SUITES BY MANUFACTURING PROCESS
// ============================================================

test.describe.serial('Costing - Unified E2E Suite', () => {
	test.beforeAll(async () => {
		await setupBrowser()
	})

	test.afterAll(async () => {
		await cleanupBrowser()
	})

	// ==================== MIG WELDING ====================
	test.describe('MIG Welding - Cost Verification', () => {
		test('MIG-001: Basic MIG Welding Cost Calculation @smoke @mig', async () => {
			const scenario = CostingTestData.MIG_WELDING_BASIC

			await runStep('Navigate to MIG Welding Project', async () => {
				await navigateToScenarioProject(scenario.projectId)
			})

			await runStep('Verify Net Weight Calculation', async () => {
				await costingLogic.verifyNetWeight()
			})

			await runStep('Verify Material Cost Calculation', async () => {
				await costingLogic.verifyNetMaterialCost()
			})

			await runStep('Verify All Manufacturing Costs', async () => {
				const costs = await costingLogic.verifyAllCostCalculations()
				playwrightExpect(costs.totalCost).toBeGreaterThan(0)

				testResults.scenarios.push({
					scenario: 'MIG-001',
					process: 'MIG Welding',
					result: 'PASSED',
					costs
				})
				testResults.passed++
			})
		})

		test('MIG-002: Advanced MIG Welding Cost Calculation @regression @mig', async () => {
			const scenario = CostingTestData.MIG_WELDING_ADVANCED

			await runStep('Navigate to Advanced MIG Project', async () => {
				await navigateToScenarioProject(scenario.projectId)
			})

			await runStep('Verify Complete Cost Suite', async () => {
				const costs = await costingLogic.verifyAllCostCalculations({
					precision: 2,
					debug: true
				})

				// Verify expected cost ranges
				if (scenario.expectedCosts) {
					logger.info('🔍 Validating cost ranges against expectations')
					playwrightExpect(costs.totalCost).toBeGreaterThanOrEqual(
						scenario.expectedCosts.totalCostMin
					)
					playwrightExpect(costs.totalCost).toBeLessThanOrEqual(
						scenario.expectedCosts.totalCostMax
					)
				}

				testResults.scenarios.push({
					scenario: 'MIG-002',
					process: 'MIG Welding - Advanced',
					result: 'PASSED',
					costs
				})
				testResults.passed++
			})
		})
	})

	// ==================== SHEET METAL ====================
	test.describe('Sheet Metal - Cost Verification', () => {
		test('SM-001: Basic Sheet Metal Cost Calculation @smoke @sheetmetal', async () => {
			const scenario = CostingTestData.SHEET_METAL_BASIC

			await runStep('Navigate to Sheet Metal Project', async () => {
				await navigateToScenarioProject(scenario.projectId)
			})

			await runStep('Verify Net Weight', async () => {
				await costingLogic.verifyNetWeight()
			})

			await runStep('Verify Net Material Cost', async () => {
				await costingLogic.verifyNetMaterialCost()
			})

			await runStep('Verify All Costs', async () => {
				const costs = await costingLogic.verifyAllCostCalculations()
				playwrightExpect(costs.totalCost).toBeGreaterThan(0)

				testResults.scenarios.push({
					scenario: 'SM-001',
					process: 'Sheet Metal',
					result: 'PASSED',
					costs
				})
				testResults.passed++
			})
		})

		test('SM-002: Complex Sheet Metal Cost Calculation @regression @sheetmetal', async () => {
			const scenario = CostingTestData.SHEET_METAL_COMPLEX

			await runStep('Navigate to Complex Sheet Metal Project', async () => {
				await navigateToScenarioProject(scenario.projectId)
			})

			await runStep('Verify Complete Cost Analysis', async () => {
				const costs = await costingLogic.verifyAllCostCalculations({
					precision: 2
				})

				if (scenario.expectedCosts) {
					playwrightExpect(costs.totalCost).toBeGreaterThanOrEqual(
						scenario.expectedCosts.totalCostMin
					)
					playwrightExpect(costs.totalCost).toBeLessThanOrEqual(
						scenario.expectedCosts.totalCostMax
					)
				}

				testResults.scenarios.push({
					scenario: 'SM-002',
					process: 'Sheet Metal - Complex',
					result: 'PASSED',
					costs
				})
				testResults.passed++
			})
		})
	})

	// ==================== MACHINING ====================
	test.describe('Machining - Cost Verification', () => {
		test('MACH-001: Basic Machining Cost Calculation @smoke @machining', async () => {
			const scenario = CostingTestData.MACHINING_BASIC

			await runStep('Navigate to Machining Project', async () => {
				await navigateToScenarioProject(scenario.projectId)
			})

			await runStep('Verify Material Calculations', async () => {
				await costingLogic.verifyNetWeight()
				await costingLogic.verifyNetMaterialCost()
			})

			await runStep('Verify Manufacturing Costs', async () => {
				const costs = await costingLogic.verifyAllCostCalculations()

				testResults.scenarios.push({
					scenario: 'MACH-001',
					process: 'Machining',
					result: 'PASSED',
					costs
				})
				testResults.passed++
			})
		})
	})

	// ==================== CASTING ====================
	test.describe('Casting - Cost Verification', () => {
		test('CAST-001: Basic Casting Cost Calculation @smoke @casting', async () => {
			const scenario = CostingTestData.CASTING_BASIC

			await runStep('Navigate to Casting Project', async () => {
				await navigateToScenarioProject(scenario.projectId)
			})

			await runStep('Verify All Costing Calculations', async () => {
				const costs = await costingLogic.verifyAllCostCalculations()

				testResults.scenarios.push({
					scenario: 'CAST-001',
					process: 'Casting',
					result: 'PASSED',
					costs
				})
				testResults.passed++
			})
		})
	})

	// ==================== SMOKE TEST SUITE ====================
	test.describe('Smoke Tests - Quick Validation', () => {
		CostingTestData.getSmokeTestScenarios().forEach(scenario => {
			test(`Smoke: ${scenario.processName} - Quick Validation`, async () => {
				await runStep('Navigate to Project', async () => {
					await navigateToScenarioProject(scenario.projectId)
				})

				await runStep(
					`Quick Cost Sanity Check - ${scenario.processName}`,
					async () => {
						const costs = await costingLogic.collectCostSummary()

						playwrightExpect(costs.totalCost).toBeGreaterThan(0)
						playwrightExpect(costs.directMachineCost).toBeGreaterThanOrEqual(0)
						playwrightExpect(costs.directLaborCost).toBeGreaterThanOrEqual(0)

						testResults.scenarios.push({
							scenario: `Smoke-${scenario.processName}`,
							process: scenario.processName,
							result: 'PASSED',
							costs
						})
						testResults.passed++
					}
				)
			})
		})
	})
})

export { testResults }
