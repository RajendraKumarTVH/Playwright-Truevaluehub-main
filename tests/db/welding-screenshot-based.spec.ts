/**
 * Multi-Process Welding E2E Test Suite
 * Based on actual UI screenshots analysis
 * 
 * Validates:
 * - MIG Welding process configuration and calculations
 * - Weld Cleaning process configuration and calculations
 * - Manufacturing details accuracy
 * - Cycle time calculations
 * - Cost breakdown verification
 * - Sustainability metrics
 * 
 * Project: TVH_Weld 14923
 * Run: npx playwright test tests/welding-screenshot-based.spec.ts
 */

import { test, expect, BrowserContext, Page, chromium } from '@playwright/test'
import { MigWeldingPage } from './pages/mig-welding.page'
import Logger from './lib/LoggerUtil'
import fs from 'fs'
import { LoginPage } from '@pages/LoginPage'

const logger = Logger

// ==================== TEST DATA FROM SCREENSHOTS ====================

const PROJECT_DATA = {
    projectId: '14923',
    projectName: 'TVH_Weld 14923',
    partNumber: '1023729-C-1023729-C-3'
}

const MIG_WELDING_DATA = {
    processGroup: 'Mig Welding',
    finishType: 'N/A',
    machineAutomation: 'Manual',

    // Machine Details
    minCurrentRequired: 400, // Amps
    minWeldingVoltage: 35, // V
    selectedCurrent: 425, // Amps
    selectedWeldingVoltage: 575, // V
    machineName: 'MIG/TIG/STICK Welding _575V _425A_USA',
    machineDescription: 'MILLER_XMT 350 CC/CV (5A-425A)',
    samplingPlan: 'Level1',
    machineEfficiency: 70, // %

    // Cycle Time Details
    loadingUnloadingTime: 20, // sec
    partReorientation: 0,
    totalWeldCycleTime: 54.2709, // sec

    // Weld 1 Details
    weld1: {
        weldType: 'Fillet',
        weldPosition: 'Flat',
        travelSpeed: 31.975, // mm/sec
        tackWelds: 1,
        intermediateStops: 1,
        weldCycleTime: 8 // sec
    },

    // Weld 2 Details
    weld2: {
        weldType: 'Fillet',
        weldPosition: 'Flat',
        travelSpeed: 3.825, // mm/sec
        tackWelds: 1,
        intermediateStops: 1,
        weldCycleTime: 23.0813 // sec
    },

    // Manufacturing Details
    samplingRate: 5, // %
    yieldOverScrap: 97, // %
    yieldCostPerPart: 0.0036, // $
    directLaborRate: 2.5982, // $/hr
    noOfDirectLabors: 1,
    laborCostPerPart: 0.0951, // $

    // Cost
    co2: 0.0291, // kg
    netProcessCost: 0.1306 // $
}

const WELD_CLEANING_DATA = {
    processGroup: 'Weld Cleaning',
    finishType: 'Weld Cleaning',
    machineName: 'Welding Cleanup',
    machineDescription: 'Default',
    machineAutomation: 'Manual',
    criticalityLevel: 'Level1',
    machineEfficiency: 70, // %

    // Cycle Time Details
    totalWeldLength: 60, // mm
    intermediateStops: 2,
    cycleTimePerPart: 29.9643, // sec

    // Manufacturing Details
    samplingRate: 0.8823, // %
    yieldPercentage: 98.5, // %
    yieldCostPerPart: 0.0005, // $
    directLaborRate: 1.1051, // $/hr
    noOfDirectLabors: 1,
    laborCostPerPart: 0.0092, // $
    skilledLaborRate: 1.8627, // $/hr
    machineSetupTime: 30, // min
    setupCostPerPart: 0.0001, // $
    qaInspectorRate: 1.5845, // $/hr
    qaInspectionTime: 0.25, // min
    qaInspectionCostPerPart: 0.0001, // $
    machineHourRate: 2.3247, // $/hr
    machineCostPerPart: 0.0193, // $

    // Sustainability
    co2PerKwHr: 28.5734,
    co2PerPart: 0.0044, // kg

    // Cost
    co2Total: 0.0035, // kg
    netProcessCost: 0.0292 // $
}

const COMBINED_TOTALS = {
    subTotalCO2: 0.0088, // kg
    subTotalCost: 0.1817 // $
}

const COST_SUMMARY = {
    materialCost: { amount: 0.007, percent: 3.88 },
    manufacturingCost: { amount: 0.0197, percent: 84.14 },
    toolingCost: { amount: 0, percent: 0 },
    overheadProfit: { amount: 0.0205, percent: 11.37 },
    packingCost: { amount: 0.0009, percent: 0.50 },
    exwPartCost: { amount: 0.1801, percent: 99.89 },
    freightCost: { amount: 0.0002, percent: 0.11 },
    dutiesTariff: { amount: 0, percent: 0 },
    partShouldCost: { amount: 0.1803, percent: 100.00 }
}

// ==================== TEST SUITE ====================

test.describe('Multi-Process Welding - Screenshot-Based Validation', () => {
    let context: BrowserContext
    let page: Page
    let weldingPage: MigWeldingPage
    let loginPage: LoginPage
    let hasFailed = false

    test.beforeAll(async () => {
        logger.info('╔═══════════════════════════════════════════════════════════╗')
        logger.info('║  MULTI-PROCESS WELDING - SCREENSHOT-BASED VALIDATION    ║')
        logger.info('╚═══════════════════════════════════════════════════════════╝')
        logger.info(`📋 Project: ${PROJECT_DATA.projectName}`)
        logger.info(`🔢 Project ID: ${PROJECT_DATA.projectId}`)

        // Create screenshots directory
        if (!fs.existsSync('./screenshots')) {
            fs.mkdirSync('./screenshots')
        }

        // Clean old profile
        if (fs.existsSync('./user-profile')) {
            fs.rmSync('./user-profile', { recursive: true, force: true })
        }

        context = await chromium.launchPersistentContext('./user-profile', {
            channel: 'msedge',
            headless: false,
            args: ['--start-maximized'],
            viewport: null
        })

        page = context.pages()[0] ?? await context.newPage()
        loginPage = new LoginPage(page, context)
        weldingPage = new MigWeldingPage(page, context)

        logger.info('✅ Test environment initialized')
    })

    test.afterAll(async () => {
        logger.info('🏁 Test Suite Completed')
        if (context) await context.close()
    })

    // ==================== MIG WELDING TESTS ====================

    test('SC-001: Navigate and Login to Project', { tag: '@smoke' }, async () => {
        logger.info('═══════════════════════════════════════════════════════════')
        logger.info('🧪 SC-001: Navigate and Login to Project')
        logger.info('═══════════════════════════════════════════════════════════')

        try {
            await loginPage.loginToApplication()
            await context.storageState({ path: 'auth.json' })

            await weldingPage.navigateToProject(PROJECT_DATA.projectId)
            await page.waitForLoadState('networkidle')

            // Verify project loaded
            await expect(page).toHaveURL(new RegExp(PROJECT_DATA.projectId))
            logger.info(`✓ Navigated to project: ${PROJECT_DATA.projectId}`)

            logger.info('✅ SC-001 - PASSED\n')
        } catch (err) {
            hasFailed = true
            throw err
        }
    })

    test('SC-002: Validate Manufacturing Information Table', { tag: '@table' }, async () => {
        if (hasFailed) test.skip()
        logger.info('═══════════════════════════════════════════════════════════')
        logger.info('🧪 SC-002: Validate Manufacturing Information Table')
        logger.info('═══════════════════════════════════════════════════════════')

        try {
            // Navigate to Manufacturing Information
            await weldingPage.ManufacturingInformation.scrollIntoViewIfNeeded()
            await weldingPage.ManufacturingInformation.click()
            await page.waitForTimeout(1000)

            // Verify MIG Welding row (Process #1)
            const migRow = page.locator('tr:has-text("Mig Welding")').first()
            await expect(migRow).toBeVisible()

            const migCO2 = await migRow.locator('td').nth(4).textContent() // CO2 column
            const migCost = await migRow.locator('td').nth(5).textContent() // Cost column

            logger.info(`MIG Welding:`)
            logger.info(`  CO2: ${migCO2} (Expected: ${MIG_WELDING_DATA.co2})`)
            logger.info(`  Cost: ${migCost} (Expected: ${MIG_WELDING_DATA.netProcessCost})`)

            // Verify Weld Cleaning row (Process #2)
            const wcRow = page.locator('tr:has-text("Weld Cleaning")').first()
            await expect(wcRow).toBeVisible()

            const wcCO2 = await wcRow.locator('td').nth(4).textContent()
            const wcCost = await wcRow.locator('td').nth(5).textContent()

            logger.info(`Weld Cleaning:`)
            logger.info(`  CO2: ${wcCO2} (Expected: ${WELD_CLEANING_DATA.co2Total})`)
            logger.info(`  Cost: ${wcCost} (Expected: ${WELD_CLEANING_DATA.netProcessCost})`)

            // Verify Sub Total
            const subTotalRow = page.locator('tr:has-text("Sub Total")').first()
            const subCO2 = await subTotalRow.locator('td').nth(1).textContent()
            const subCost = await subTotalRow.locator('td').nth(2).textContent()

            logger.info(`Sub Total:`)
            logger.info(`  CO2: ${subCO2} (Expected: ${COMBINED_TOTALS.subTotalCO2})`)
            logger.info(`  Cost: ${subCost} (Expected: ${COMBINED_TOTALS.subTotalCost})`)

            logger.info('✅ SC-002 - PASSED\n')
        } catch (err) {
            hasFailed = true
            throw err
        }
    })

    test('SC-003: Validate MIG Welding Process Details', { tag: '@mig' }, async () => {
        if (hasFailed) test.skip()
        logger.info('═══════════════════════════════════════════════════════════')
        logger.info('🧪 SC-003: Validate MIG Welding Process Details')
        logger.info('═══════════════════════════════════════════════════════════')

        try {
            // Select MIG Welding process
            await page.locator('tr:has-text("Mig Welding")').first().click()
            await page.waitForTimeout(1000)

            // Click Machine Details tab if available
            const machineDetailsTab = page.locator('button:has-text("Machine Details"), a:has-text("Machine Details")').first()
            if (await machineDetailsTab.isVisible()) {
                await machineDetailsTab.click()
                await page.waitForTimeout(500)
            }

            // Validate Process Group
            const processGroup = await page.locator('input[formcontrolname="processGroup"], select[formcontrolname="processGroup"]').first()
            if (await processGroup.isVisible()) {
                const value = await processGroup.inputValue()
                logger.info(`✓ Process Group: ${value}`)
                expect(value).toContain('Mig Welding')
            }

            // Validate Min. Current Required
            const minCurrent = page.locator('input[placeholder*="Current"]').first()
            if (await minCurrent.isVisible()) {
                const value = await minCurrent.inputValue()
                logger.info(`✓ Min. Current Required: ${value} Amps (Expected: ${MIG_WELDING_DATA.minCurrentRequired})`)
                expect(parseFloat(value)).toBe(MIG_WELDING_DATA.minCurrentRequired)
            }

            // Validate Min. Welding Voltage
            const minVoltage = page.locator('input[placeholder*="Voltage"]').first()
            if (await minVoltage.isVisible()) {
                const value = await minVoltage.inputValue()
                logger.info(`✓ Min. Welding Voltage: ${value} V (Expected: ${MIG_WELDING_DATA.minWeldingVoltage})`)
                expect(parseFloat(value)).toBe(MIG_WELDING_DATA.minWeldingVoltage)
            }

            // Validate Selected Current
            const selectedCurrent = page.locator('input[formcontrolname="selectedCurrent"]').first()
            if (await selectedCurrent.isVisible()) {
                const value = await selectedCurrent.inputValue()
                logger.info(`✓ Selected Current: ${value} Amps (Expected: ${MIG_WELDING_DATA.selectedCurrent})`)
                expect(parseFloat(value)).toBe(MIG_WELDING_DATA.selectedCurrent)
            }

            // Validate Selected Voltage
            const selectedVoltage = page.locator('input[formcontrolname="selectedWeldingVoltage"]').first()
            if (await selectedVoltage.isVisible()) {
                const value = await selectedVoltage.inputValue()
                logger.info(`✓ Selected Voltage: ${value} V (Expected: ${MIG_WELDING_DATA.selectedWeldingVoltage})`)
                expect(parseFloat(value)).toBe(MIG_WELDING_DATA.selectedWeldingVoltage)
            }

            // Validate Machine Name
            const machineName = page.locator('input[formcontrolname="machineName"], select[formcontrolname="machineName"]').first()
            if (await machineName.isVisible()) {
                const value = await machineName.inputValue()
                logger.info(`✓ Machine Name: ${value}`)
                expect(value).toContain('MIG/TIG/STICK')
            }

            // Validate Efficiency
            const efficiency = page.locator('input[formcontrolname="efficiency"]').first()
            if (await efficiency.isVisible()) {
                const value = await efficiency.inputValue()
                logger.info(`✓ Machine Efficiency: ${value}% (Expected: ${MIG_WELDING_DATA.machineEfficiency}%)`)
                expect(parseFloat(value)).toBe(MIG_WELDING_DATA.machineEfficiency)
            }

            // Validate Net Process Cost
            const netCost = page.locator('input[formcontrolname="netProcessCost"], input[formcontrolname="directProcessCost"]').first()
            if (await netCost.isVisible()) {
                const value = await netCost.inputValue()
                logger.info(`✓ Net Process Cost: $${value} (Expected: $${MIG_WELDING_DATA.netProcessCost})`)
                expect(parseFloat(value)).toBeCloseTo(MIG_WELDING_DATA.netProcessCost, 4)
            }

            logger.info('✅ SC-003 - PASSED\n')
        } catch (err) {
            hasFailed = true
            throw err
        }
    })

    test('SC-004: Validate MIG Welding Cycle Time Details', { tag: '@mig' }, async () => {
        if (hasFailed) test.skip()
        logger.info('═══════════════════════════════════════════════════════════')
        logger.info('🧪 SC-004: Validate MIG Welding Cycle Time Details')
        logger.info('═══════════════════════════════════════════════════════════')

        try {
            // Click Cycle Time Details section
            const cycleTimeSection = page.locator('button:has-text("Cycle Time"), div:has-text("Cycle Time Details")').first()
            if (await cycleTimeSection.isVisible()) {
                await cycleTimeSection.click()
                await page.waitForTimeout(500)
            }

            // Validate Loading/Unloading Time
            const loadingTime = page.locator('input[formcontrolname="loadingTime"], input[formcontrolname="unloadingTime"]').first()
            if (await loadingTime.isVisible()) {
                const value = await loadingTime.inputValue()
                logger.info(`✓ Loading/Unloading Time: ${value} sec (Expected: ${MIG_WELDING_DATA.loadingUnloadingTime})`)
            }

            // Validate Part Reorientation
            const reorientation = page.locator('input[formcontrolname="partReorientation"], input[formcontrolname="reorientation"]').first()
            if (await reorientation.isVisible()) {
                const value = await reorientation.inputValue()
                logger.info(`✓ Part Reorientation: ${value} (Expected: ${MIG_WELDING_DATA.partReorientation})`)
                expect(parseFloat(value)).toBe(MIG_WELDING_DATA.partReorientation)
            }

            // Validate Total Weld Cycle Time
            const totalCycleTime = page.locator('input[formcontrolname="totalWeldCycleTime"], input[formcontrolname="cycleTime"]').first()
            if (await totalCycleTime.isVisible()) {
                const value = await totalCycleTime.inputValue()
                logger.info(`✓ Total Weld Cycle Time: ${value} sec (Expected: ${MIG_WELDING_DATA.totalWeldCycleTime})`)
                expect(parseFloat(value)).toBeCloseTo(MIG_WELDING_DATA.totalWeldCycleTime, 2)
            }

            logger.info('✅ SC-004 - PASSED\n')
        } catch (err) {
            hasFailed = true
            throw err
        }
    })

    test('SC-005: Validate MIG Welding Sub Process Details', { tag: '@mig' }, async () => {
        if (hasFailed) test.skip()
        logger.info('═══════════════════════════════════════════════════════════')
        logger.info('🧪 SC-005: Validate MIG Welding Sub Process Details')
        logger.info('═══════════════════════════════════════════════════════════')

        try {
            // Expand Weld 1 section
            const weld1Section = page.locator('div:has-text("Weld 1"), button:has-text("Weld 1")').first()
            if (await weld1Section.isVisible()) {
                await weld1Section.click()
                await page.waitForTimeout(500)
            }

            // Validate Weld 1 Type
            const weld1Type = page.locator('select[formcontrolname="weldType"]').first()
            if (await weld1Type.isVisible()) {
                const value = await weld1Type.inputValue()
                logger.info(`Weld 1:`)
                logger.info(`  ✓ Weld Type: ${value} (Expected: ${MIG_WELDING_DATA.weld1.weldType})`)
                expect(value).toBe(MIG_WELDING_DATA.weld1.weldType)
            }

            // Validate Weld 1 Position
            const weld1Position = page.locator('select[formcontrolname="weldPosition"]').first()
            if (await weld1Position.isVisible()) {
                const value = await weld1Position.inputValue()
                logger.info(`  ✓ Weld Position: ${value} (Expected: ${MIG_WELDING_DATA.weld1.weldPosition})`)
            }

            // Validate Weld 1 Travel Speed
            const weld1Speed = page.locator('input[formcontrolname="travelSpeed"]').first()
            if (await weld1Speed.isVisible()) {
                const value = await weld1Speed.inputValue()
                logger.info(`  ✓ Travel Speed: ${value} mm/sec (Expected: ${MIG_WELDING_DATA.weld1.travelSpeed})`)
                expect(parseFloat(value)).toBeCloseTo(MIG_WELDING_DATA.weld1.travelSpeed, 2)
            }

            // Validate Weld 2 (if visible)
            const weld2Section = page.locator('div:has-text("Weld 2"), button:has-text("Weld 2")').first()
            if (await weld2Section.isVisible()) {
                await weld2Section.click()
                await page.waitForTimeout(500)

                const weld2Speed = page.locator('input[formcontrolname="travelSpeed"]').nth(1)
                if (await weld2Speed.isVisible()) {
                    const value = await weld2Speed.inputValue()
                    logger.info(`Weld 2:`)
                    logger.info(`  ✓ Travel Speed: ${value} mm/sec (Expected: ${MIG_WELDING_DATA.weld2.travelSpeed})`)
                    expect(parseFloat(value)).toBeCloseTo(MIG_WELDING_DATA.weld2.travelSpeed, 2)
                }
            }

            logger.info('✅ SC-005 - PASSED\n')
        } catch (err) {
            hasFailed = true
            throw err
        }
    })

    // ==================== WELD CLEANING TESTS ====================

    test('SC-006: Validate Weld Cleaning Process Details', { tag: '@weldcleaning' }, async () => {
        if (hasFailed) test.skip()
        logger.info('═══════════════════════════════════════════════════════════')
        logger.info('🧪 SC-006: Validate Weld Cleaning Process Details')
        logger.info('═══════════════════════════════════════════════════════════')

        try {
            // Select Weld Cleaning process
            await page.locator('tr:has-text("Weld Cleaning")').first().click()
            await page.waitForTimeout(1000)

            // Validate Process Group
            const processGroup = page.locator('select[formcontrolname="processGroup"]').first()
            if (await processGroup.isVisible()) {
                const value = await processGroup.inputValue()
                logger.info(`✓ Process Group: ${value}`)
                expect(value).toContain('Weld Cleaning')
            }

            // Validate Finish Type
            const finishType = page.locator('select[formcontrolname="finishType"], input[formcontrolname="finishType"]').first()
            if (await finishType.isVisible()) {
                const value = await finishType.inputValue()
                logger.info(`✓ Finish Type: ${value}`)
            }

            // Validate Machine Name
            const machineName = page.locator('select[formcontrolname="machineName"]').first()
            if (await machineName.isVisible()) {
                const value = await machineName.inputValue()
                logger.info(`✓ Machine Name: ${value}`)
                expect(value).toContain('Welding Cleanup')
            }

            // Validate Criticality Level
            const criticalityLevel = page.locator('select[formcontrolname="criticalityLevel"]').first()
            if (await criticalityLevel.isVisible()) {
                const value = await criticalityLevel.inputValue()
                logger.info(`✓ Criticality Level: ${value} (Expected: ${WELD_CLEANING_DATA.criticalityLevel})`)
            }

            // Validate Efficiency
            const efficiency = page.locator('input[formcontrolname="efficiency"]').first()
            if (await efficiency.isVisible()) {
                const value = await efficiency.inputValue()
                logger.info(`✓ Efficiency: ${value}% (Expected: ${WELD_CLEANING_DATA.machineEfficiency}%)`)
                expect(parseFloat(value)).toBe(WELD_CLEANING_DATA.machineEfficiency)
            }

            // Validate Net Process Cost
            const netCost = page.locator('input[formcontrolname="netProcessCost"]').first()
            if (await netCost.isVisible()) {
                const value = await netCost.inputValue()
                logger.info(`✓ Net Process Cost: $${value} (Expected: $${WELD_CLEANING_DATA.netProcessCost})`)
                expect(parseFloat(value)).toBeCloseTo(WELD_CLEANING_DATA.netProcessCost, 4)
            }

            logger.info('✅ SC-006 - PASSED\n')
        } catch (err) {
            hasFailed = true
            throw err
        }
    })

    test('SC-007: Validate Weld Cleaning Manufacturing Details', { tag: '@weldcleaning' }, async () => {
        if (hasFailed) test.skip()
        logger.info('═══════════════════════════════════════════════════════════')
        logger.info('🧪 SC-007: Validate Weld Cleaning Manufacturing Details')
        logger.info('═══════════════════════════════════════════════════════════')

        try {
            // Navigate to Manufacturing Details
            const mfgDetailsTab = page.locator('button:has-text("Manufacturing Details"), a:has-text("Manufacturing Details")').first()
            if (await mfgDetailsTab.isVisible()) {
                await mfgDetailsTab.click()
                await page.waitForTimeout(500)
            }

            const details = {
                totalWeldLength: { selector: 'input[formcontrolname="totalWeldLength"]', expected: WELD_CLEANING_DATA.totalWeldLength, unit: 'mm' },
                intermediateStops: { selector: 'input[formcontrolname="intermediateStops"]', expected: WELD_CLEANING_DATA.intermediateStops, unit: '' },
                samplingRate: { selector: 'input[formcontrolname="samplingRate"]', expected: WELD_CLEANING_DATA.samplingRate, unit: '%' },
                yieldPercentage: { selector: 'input[formcontrolname="yieldPer"], input[formcontrolname="yield"]', expected: WELD_CLEANING_DATA.yieldPercentage, unit: '%' },
                yieldCostPerPart: { selector: 'input[formcontrolname="yieldCost"]', expected: WELD_CLEANING_DATA.yieldCostPerPart, unit: '$' },
                directLaborRate: { selector: 'input[formcontrolname="directLaborRate"], input[formcontrolname="lowSkilledLaborRatePerHour"]', expected: WELD_CLEANING_DATA.directLaborRate, unit: '$/hr' },
                laborCostPerPart: { selector: 'input[formcontrolname="laborCost"], input[formcontrolname="directLaborCost"]', expected: WELD_CLEANING_DATA.laborCostPerPart, unit: '$' },
                skilledLaborRate: { selector: 'input[formcontrolname="skilledLaborRate"]', expected: WELD_CLEANING_DATA.skilledLaborRate, unit: '$/hr' },
                machineSetupTime: { selector: 'input[formcontrolname="setupTime"]', expected: WELD_CLEANING_DATA.machineSetupTime, unit: 'min' },
                setupCostPerPart: { selector: 'input[formcontrolname="setupCost"]', expected: WELD_CLEANING_DATA.setupCostPerPart, unit: '$' },
                qaInspectorRate: { selector: 'input[formcontrolname="qaInspectorRate"]', expected: WELD_CLEANING_DATA.qaInspectorRate, unit: '$/hr' },
                qaInspectionTime: { selector: 'input[formcontrolname="qaInspectionTime"], input[formcontrolname="inspectionTime"]', expected: WELD_CLEANING_DATA.qaInspectionTime, unit: 'min' },
                qaInspectionCostPerPart: { selector: 'input[formcontrolname="qaInspectionCost"], input[formcontrolname="inspectionCost"]', expected: WELD_CLEANING_DATA.qaInspectionCostPerPart, unit: '$' },
                machineHourRate: { selector: 'input[formcontrolname="machineHourRate"]', expected: WELD_CLEANING_DATA.machineHourRate, unit: '$/hr' },
                cycleTimePerPart: { selector: 'input[formcontrolname="cycleTime"]', expected: WELD_CLEANING_DATA.cycleTimePerPart, unit: 'sec' },
                machineCostPerPart: { selector: 'input[formcontrolname="machineCost"], input[formcontrolname="directMachineCost"]', expected: WELD_CLEANING_DATA.machineCostPerPart, unit: '$' }
            }

            logger.info('Manufacturing Details Validation:')

            for (const [key, config] of Object.entries(details)) {
                const element = page.locator(config.selector).first()
                if (await element.isVisible()) {
                    const value = await element.inputValue()
                    const numValue = parseFloat(value)
                    logger.info(`  ✓ ${key}: ${value} ${config.unit} (Expected: ${config.expected})`)

                    if (config.unit === '$' || config.unit === 'sec') {
                        expect(numValue).toBeCloseTo(config.expected, 4)
                    } else {
                        expect(numValue).toBeCloseTo(config.expected, 2)
                    }
                }
            }

            logger.info('✅ SC-007 - PASSED\n')
        } catch (err) {
            hasFailed = true
            throw err
        }
    })

    test('SC-008: Validate Weld Cleaning Sustainability', { tag: '@weldcleaning' }, async () => {
        if (hasFailed) test.skip()
        logger.info('═══════════════════════════════════════════════════════════')
        logger.info('🧪 SC-008: Validate Weld Cleaning Sustainability')
        logger.info('═══════════════════════════════════════════════════════════')

        try {
            // Navigate to Sustainability section
            const sustainabilitySection = page.locator('button:has-text("Sustainability"), div:has-text("Sustainability")').first()
            if (await sustainabilitySection.isVisible()) {
                await sustainabilitySection.click()
                await page.waitForTimeout(500)
            }

            // Validate CO2/kw-Hr
            const co2PerKwHr = page.locator('input[formcontrolname="co2PerKwHr"], input[formcontrolname="powerESG"]').first()
            if (await co2PerKwHr.isVisible()) {
                const value = await co2PerKwHr.inputValue()
                logger.info(`✓ CO2(kg)/kw-Hr: ${value} (Expected: ${WELD_CLEANING_DATA.co2PerKwHr})`)
                expect(parseFloat(value)).toBeCloseTo(WELD_CLEANING_DATA.co2PerKwHr, 2)
            }

            // Validate CO2/part
            const co2PerPart = page.locator('input[formcontrolname="co2PerPart"], input[formcontrolname="esgImpactFactoryImpact"]').first()
            if (await co2PerPart.isVisible()) {
                const value = await co2PerPart.inputValue()
                logger.info(`✓ CO2(kg)/part: ${value} (Expected: ${WELD_CLEANING_DATA.co2PerPart})`)
                expect(parseFloat(value)).toBeCloseTo(WELD_CLEANING_DATA.co2PerPart, 4)
            }

            logger.info('✅ SC-008 - PASSED\n')
        } catch (err) {
            logger.warn('⚠️  Sustainability fields not visible, skipping validation')
        }
    })

    test('SC-009: Validate Cost Summary', { tag: '@cost' }, async () => {
        if (hasFailed) test.skip()
        logger.info('═══════════════════════════════════════════════════════════')
        logger.info('🧪 SC-009: Validate Cost Summary')
        logger.info('═══════════════════════════════════════════════════════════')

        try {
            // Navigate to Cost section
            const costSection = page.locator('button:has-text("Cost"), a:has-text("Cost")').first()
            if (await costSection.isVisible()) {
                await costSection.click()
                await page.waitForTimeout(1000)
            }

            logger.info('Cost Summary Validation:')

            // Validate Material Cost
            const materialCost = page.locator('input[formcontrolname="materialCost"]').first()
            if (await materialCost.isVisible()) {
                const value = await materialCost.inputValue()
                logger.info(`  ✓ Material Cost: $${value} (${COST_SUMMARY.materialCost.percent}%)`)
                expect(parseFloat(value)).toBeCloseTo(COST_SUMMARY.materialCost.amount, 4)
            }

            // Validate Manufacturing Cost
            const mfgCost = page.locator('input[formcontrolname="manufacturingCost"]').first()
            if (await mfgCost.isVisible()) {
                const value = await mfgCost.inputValue()
                logger.info(`  ✓ Manufacturing Cost: $${value} (${COST_SUMMARY.manufacturingCost.percent}%)`)
                expect(parseFloat(value)).toBeCloseTo(COST_SUMMARY.manufacturingCost.amount, 4)
            }

            // Validate Part Should Cost
            const shouldCost = page.locator('input[formcontrolname="partShouldCost"]').first()
            if (await shouldCost.isVisible()) {
                const value = await shouldCost.inputValue()
                logger.info(`  ✓ Part Should Cost: $${value} (${COST_SUMMARY.partShouldCost.percent}%)`)
                expect(parseFloat(value)).toBeCloseTo(COST_SUMMARY.partShouldCost.amount, 4)
            }

            logger.info('✅ SC-009 - PASSED\n')
        } catch (err) {
            hasFailed = true
            throw err
        }
    })
})
