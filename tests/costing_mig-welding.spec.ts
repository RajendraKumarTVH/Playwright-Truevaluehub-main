import {
	test,
	chromium,
	type BrowserContext,
	type Page
} from '@playwright/test'
import fs from 'node:fs'
import Logger from './lib/LoggerUtil'
import { MigWeldingLogic } from './pages/mig-welding-logic'
import { MigWeldingPage } from './pages/mig-welding.page'
import { LoginPage } from '../pageFactory/pageRepository/LoginPage'
import { MigWeldingTestData } from '../test-data/mig-welding-testdata'

const logger = Logger

// ============================================================
// 🔧 CONFIGURATION
// ============================================================
const CONFIG = {
	projectId: MigWeldingTestData.config?.baseUrl
		? MigWeldingTestData.project.projectId
		: '14783',
	baseUrl: MigWeldingTestData.config?.baseUrl || 'https://qa.truevaluehub.com',
	timeout: MigWeldingTestData.config?.defaultTimeout || 30_000,
	userProfilePath: './user-profile-spec',
	authStatePath: 'auth_spec.json'
} as const

// ============================================================
// 🌐 GLOBAL OBJECTS
// ============================================================
let context: BrowserContext
let page: Page
let migWeldingPage: MigWeldingPage
let migWeldingLogic: MigWeldingLogic
let loginPage: LoginPage
let calculatedCosts: Record<string, number> = {}

test.setTimeout(CONFIG.timeout)

// ============================================================
// 🧪 UTILITIES
// ============================================================

async function runStep(name: string, fn: () => Promise<void>) {
	try {
		await fn()
	} catch (err: any) {
		await handleFailure(name, err)
		throw err
	}
}

async function handleFailure(name: string, err: any) {
	logger.error(`❌ ${name}: ${err.message}`)
	await takeScreenshot(page, name)
}

async function takeScreenshot(page: Page, name: string) {
	if (!fs.existsSync('screenshots')) {
		fs.mkdirSync('screenshots', { recursive: true })
	}
	if (page?.isClosed?.()) return
	await page.screenshot({ path: `screenshots/${name}.png`, fullPage: true })
}

test.describe.serial('MIG Welding - Complete E2E Flow', () => {
	test.beforeAll(async () => {
		logger.info('═══════════════════════════════════════════════════════════')
		logger.info('🚀 Starting MIG Welding E2E Test Suite')
		logger.info(`📋 Project ID: ${CONFIG.projectId}`)
		const isCI = !!process.env.CI;

		context = await chromium.launchPersistentContext(
			CONFIG.userProfilePath,
			{
				channel: 'msedge',
				headless: isCI,          // ✅ headless in CI
				args: isCI ? [] : ['--start-maximized'],
			}
		);

		page = context.pages().length ? context.pages()[0] : await context.newPage()

		loginPage = new LoginPage(page, context)
		migWeldingPage = new MigWeldingPage(page, context)
		migWeldingLogic = new MigWeldingLogic(migWeldingPage)

		await page.waitForLoadState('domcontentloaded')
		await loginPage.loginToApplication()
		await page
			.waitForLoadState('networkidle', { timeout: 30000 })
			.catch(() => null)
		await context.storageState({ path: CONFIG.authStatePath })
		await migWeldingLogic.navigateToProject(CONFIG.projectId)
	})
	test.afterAll(async () => {
		logger.info('🏁 MIG Welding E2E Test Suite Completed')

		if (context) {
			try {
				await context.close()
				logger.info('✅ Browser context closed')
			} catch (err) {
				logger.warn('⚠️ Context already closed or failed to close', err)
			}
		}

		// Windows-safe cleanup (best-effort only)
		const profilePath = CONFIG.userProfilePath

		if (fs.existsSync(profilePath)) {
			for (let attempt = 1; attempt <= 3; attempt++) {
				try {
					await new Promise(res => setTimeout(res, 2000))
					fs.rmSync(profilePath, { recursive: true, force: true })
					logger.info('✅ User profile cleaned successfully')
					break
				} catch (err) {
					logger.warn(`⚠️ Cleanup attempt ${attempt} failed`)
					if (attempt === 3) {
						logger.warn('⚠️ Skipping profile cleanup (Windows file lock)')
					}
				}
			}
		}
	})

	test('TC001: Verify Part Information', { tag: '@smoke' }, async () => {
		await runStep('TC001_Verify_Part_Info_Failure', async () => {
			logger.info('🔹 TC001: Verifying Part Information')
			await migWeldingLogic.verifyPartInformation()
		})
	})

	test(
		'TC002: Verify Material Information Details',
		{ tag: '@smoke' },
		async () => {
			await runStep('TC002_Material_Info_Failure', async () => {
				logger.info('🔹 TC002: Verifying Material Information Details')
				await migWeldingLogic.verifyMaterialInformationDetails()
			})
		}
	)

	test('TC003: Verify Net Weight', { tag: '@smoke' }, async () => {
		await runStep('TC003_Net_Weight_Failure', async () => {
			await migWeldingLogic.verifyNetWeight()
		})
	})

	test(
		'TC004: Verify Welding Details',
		{ tag: '@smoke', timeout: 120000 } as any,
		async () => {
			await runStep('TC004_Welding_Details_Failure', async () => {
				await migWeldingLogic.verifyWeldingDetails(MigWeldingTestData)
			})
		}
	)

	test(
		'TC005: Verify Total Weld Length',
		{ tag: '@smoke', timeout: 120000 } as any,
		async () => {
			await runStep('TC005_Total_Weld_Length_Failure', async () => {
				await migWeldingLogic.verifyWeldingMaterialCalculations()
			})
		}
	)

	test.skip(
		'TC006: Verify Net Material Sustainability Cost',
		{ tag: '@smoke' },
		async () => {
			await runStep('TC006_Net_Material_Sustainability_Failure', async () => {
				logger.info('🔹 TC006: Verifying Net Material Sustainability Cost')
				await migWeldingLogic.verifyNetMaterialSustainabilityCost()
			})
		}
	)

	test.skip(
		'TC007: Verify Weld Cycle Time Details',
		{ tag: '@smoke', timeout: 120000 } as any,
		async () => {
			await runStep('TC007_Weld_Cycle_Time_Failure', async () => {
				await migWeldingLogic.verifyWeldCycleTimeDetails(MigWeldingTestData)
			})
		}
	)

	test(
		'TC008: Verify Manufacturing Cost',
		{ tag: '@smoke', timeout: 120000 } as any,
		async () => {
			await runStep('TC008_Manufacturing_Cost_Failure', async () => {
				logger.info('🔹 TC008: Verifying Manufacturing Cost')
				await migWeldingLogic.verifyMigCosts()
				await migWeldingLogic.verifyWeldCleaningCost()
			})
		}
	)

	test(
		'TC009: Verify Manufacturing Sustainability',
		{ tag: '@smoke' },
		async () => {
			await runStep('TC009_Manufacturing_Sustainability_Failure', async () => {
				logger.info('🔹 TC009: Verifying Manufacturing Sustainability')
				await migWeldingLogic.verifyManufacturingSustainability()
			})
		}
	)

	test.skip('TC010: Verify Manufacturing CO2', { tag: '@smoke' }, async () => {
		await runStep('TC010_Manufacturing_CO2_Failure', async () => {
			logger.info('🔹 TC010: Verifying Manufacturing CO2')
			await migWeldingLogic.verifyManufacturingCO2()
		})
	})

	test.skip(
		'TC011: Verify Complete Welding Process',
		{ tag: '@smoke', timeout: 120000 } as any,
		async () => {
			await runStep('TC011_Complete_Welding_Process_Failure', async () => {
				await migWeldingLogic.verifyCompleteWeldingProcess()
			})
		}
	)

	test(
		'TC012: Verify Cost Summary',
		{ tag: '@smoke', timeout: 120000 } as any,
		async () => {
			await runStep('TC012_Cost_Summary_Failure', async () => {
				await migWeldingLogic.verifyCostSummary()
			})
		}
	)
})
