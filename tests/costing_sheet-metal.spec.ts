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

// ============================================================
// 🔧 CONFIGURATION
// ============================================================

const CONFIG = {
    projectId: '14783', // Update with actual sheet metal project ID
    baseUrl: 'https://qa.truevaluehub.com',
    timeout: 30000,
    userProfilePath: './user-profile-sheetmetal',
    authStatePath: 'auth_sheetmetal.json'
} as const

// ============================================================
// 🌐 GLOBAL OBJECTS
// ============================================================

let context: BrowserContext
let page: Page
let sheetMetalPage: SheetMetalPage
let sheetMetalLogic: SheetMetalLogic
let loginPage: LoginPage

let hasFailed = false
let calculatedCosts: Record<string, number> = {}

test.setTimeout(CONFIG.timeout)

// ============================================================
// 🚀 SUITE SETUP & TEARDOWN
// ============================================================

test.beforeAll(async () => {
    logger.info('═══════════════════════════════════════════════════════════')
    logger.info('🚀 Starting Sheet Metal E2E Test Suite')
    logger.info(`📋 Project ID: ${CONFIG.projectId}`)

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
    logger.info('🏁 Sheet Metal E2E Test Suite Completed')

    if (context) {
        await context.close()
    }

    if (fs.existsSync(CONFIG.userProfilePath)) {
        try {
            // fs.rmSync(CONFIG.userProfilePath, { recursive: true, force: true })
        } catch (e) {
            console.error('Failed to cleanup profile: ', e)
        }
    }
})

async function runStep(name: string, fn: () => Promise<void>) {
    try {
        await fn()
    } catch (err) {
        await handleFailure(name, err)
        throw err
    }
}

// ============================================================
// 🧪 TESTS
// ============================================================

test.describe.serial('Sheet Metal - Complete E2E Flow', () => {
    // ------------------------------------------------------------
    // 🛡 Global skip + failure tracking
    // ------------------------------------------------------------

    test.beforeEach(async () => {
        console.log(`🔹 Before Test: Opening Manufacturing for Sheet Metal`)
        test.skip(
            hasFailed,
            'Skipping remaining tests because a previous test failed'
        )
    })

    test.afterEach(async () => {
        // Failure tracking through global state
    })

    // ------------------------------------------------------------
    // 1️⃣ PART INFORMATION
    // ------------------------------------------------------------

    test('TC001: Verify Part Information', { tag: '@smoke' }, async () => {
        await runStep('TC001_Part_Info_Failure', async () => {
            logger.info('🔹 TC001: Verifying Part Information')
            await sheetMetalLogic.verifyPartInformation()
        })
    })

    // ------------------------------------------------------------
    // 2️⃣ MATERIAL INFORMATION
    // ------------------------------------------------------------

    test(
        'TC002: Verify Material Information',
        { tag: '@smoke' },
        async () => {
            await runStep('TC002_Material_Info_Failure', async () => {
                logger.info('🔹 TC002: Verifying Material Information')
                await sheetMetalLogic.verifyMaterialInformation()
            })
        }
    )

    // ------------------------------------------------------------
    // 3️⃣ MANUFACTURING & COST
    // ------------------------------------------------------------

    test('TC003: Verify Manufacturing Cost', { tag: '@smoke' }, async () => {
        await runStep('TC003_Manufacturing_Cost_Failure', async () => {
            logger.info('🔹 TC003: Verifying Manufacturing Cost')
            calculatedCosts = await sheetMetalLogic.verifyManufacturingCosts()
        })
    })

    test('TC004: Verify Direct Process Cost Breakdown', { tag: '@smoke' }, async () => {
        await runStep('TC004_Direct_Process_Cost_Failure', async () => {
            logger.info('🔹 TC004: Verifying Direct Process Cost Summation')
            await sheetMetalLogic.verifyDirectProcessCostCalculation()
        })
    })

    // ------------------------------------------------------------
    // 4️⃣ BENDING CALCULATIONS
    // ------------------------------------------------------------

    test('TC005: Verify Bending Calculations', { tag: '@smoke' }, async () => {
        await runStep('TC005_Bending_Calculations_Failure', async () => {
            logger.info('🔹 TC005: Verifying Bending Calculations')
            await sheetMetalLogic.verifyBendingCalculations({})
        })
    })

    // ------------------------------------------------------------
    // 5️⃣ COST SUMMARY
    // ------------------------------------------------------------

    test('TC006: Verify Cost Summary', { tag: '@smoke' }, async () => {
        await runStep('TC006_Cost_Summary_Failure', async () => {
            logger.info('🔹 TC006: Verifying Cost Summary')
            await sheetMetalLogic.verifyCostSummary()
        })
    })

    // ------------------------------------------------------------
    // 6️⃣ MASTER END-TO-END
    // ------------------------------------------------------------

    test(
        'TC007: Verify Complete Sheet Metal Process',
        { tag: '@smoke' },
        async () => {
            await runStep('TC007_Complete_Process_Failure', async () => {
                logger.info('🔹 TC007: Verifying Complete Sheet Metal Process')
                await sheetMetalLogic.verifyCompleteSheetMetalProcess()
            })
        }
    )
})

// ============================================================
// 🧰 UTILITIES
// ============================================================

async function handleFailure(name: string, err: any) {
    hasFailed = true
    logger.error(`❌ ${name}: ${err.message}`)
    await takeScreenshot(page, name)
    throw err
}

async function takeScreenshot(page: Page, name: string) {
    if (!fs.existsSync('screenshots')) {
        fs.mkdirSync('screenshots', { recursive: true })
    }

    await page.screenshot({
        path: `screenshots/${name}.png`,
        fullPage: true
    })
}
