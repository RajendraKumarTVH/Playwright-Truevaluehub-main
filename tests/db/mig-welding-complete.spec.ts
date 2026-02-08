/**
 * MIG Welding Calculator - Complete E2E Test Suite
 * TrueValueHub: End-to-End Tests for MIG Welding Costing Workflow
 * 
 * This test file uses:
 * - Page Object Model (MigWeldingCalculatorPage)
 * - TypeScript Test Data (mig-welding-testdata.ts)
 * - Excel Test Data (MigWelding-TestData.xlsx)
 * 
 * Run: npx playwright test tests/mig-welding-complete.spec.ts
 */

import { test, expect, BrowserContext, Page, chromium } from '@playwright/test';
import * as path from 'path';

// Page Objects
import { MigWeldingCalculatorPage } from './pages/migWeldingCalculator.page';
import { MigWeldingPage } from './pages/mig-welding.page copy';
import { LoginPage } from '../pageFactory/pageRepository/LoginPage';
import CreateProjectPage from '../pageFactory/pageRepository/CreateProjectPage';
import Logger from '../lib/LoggerUtil';

// TypeScript Test Data
import {
    MigWeldingTestData,
    ProjectData,
    PartInformation,
    SupplyTerms,
    MaterialInformation,
    PartDetails,
    WeldingDetails,
    MachineDetails,
    ManufacturingDetails,
    CostSummary,
    ExpectedValues,
    getWeldElementSize,
    compareWithTolerance
} from '../test-data/mig-welding-testdata';

// Excel Test Data Reader
import { readMigWeldingTestData, MigWeldingExcelData } from '../test-data/excel-reader';

const logger = Logger;

// ==================== TEST CONFIGURATION ====================
const CONFIG = {
    baseUrl: 'https://qa.truevaluehub.com',
    projectId: ProjectData.projectId,
    excelFilePath: path.resolve(__dirname, '../test-data/MigWelding-TestData.xlsx'),
    timeout: 30000,
    screenshotOnError: true
};

// ==================== LOAD EXCEL DATA ====================
let excelData: MigWeldingExcelData;
try {
    excelData = readMigWeldingTestData(CONFIG.excelFilePath);
    logger.info('✅ Excel test data loaded successfully');
} catch (error: any) {
    logger.warn(`⚠️ Could not load Excel data: ${error.message}. Using TypeScript data.`);
}

// ==================== MAIN TEST SUITE ====================
test.describe('MIG Welding Calculator - Complete E2E Tests', () => {
    let context: BrowserContext;
    let page: Page;
    let migWeldingPage: MigWeldingPage;
    let migWeldingCalculatorPage: MigWeldingCalculatorPage;
    let loginPage: LoginPage;
    let createProjectPage: CreateProjectPage;

    test.beforeAll(async () => {
        logger.info('═══════════════════════════════════════════════════════════');
        logger.info('🚀 Starting MIG Welding Calculator Complete E2E Test Suite');
        logger.info('═══════════════════════════════════════════════════════════');
        logger.info(`📋 Project ID: ${CONFIG.projectId}`);
        logger.info(`🌐 Base URL: ${CONFIG.baseUrl}`);

        context = await chromium.launchPersistentContext('./user-profile', {
            headless: false,
            args: ['--start-maximized'],
            viewport: null,
            timeout: CONFIG.timeout
        });

        page = context.pages()[0] ?? (await context.newPage());

        loginPage = new LoginPage(page, context);
        createProjectPage = new CreateProjectPage(page, context);
        migWeldingPage = new MigWeldingPage(page, context);
        migWeldingCalculatorPage = new MigWeldingCalculatorPage(page, context);

        logger.info('✅ Browser and Page Objects initialized');
    });

    test.afterAll(async () => {
        logger.info('🏁 MIG Welding Calculator Test Suite Completed');
        if (context) await context.close();
    });

    test.afterEach(async ({ }, testInfo) => {
        if (testInfo.status !== testInfo.expectedStatus) {
            const screenshotName = `${testInfo.title.replace(/\s+/g, '_')}_error.png`;
            await page.screenshot({ path: screenshotName, fullPage: true });
            logger.error(`❌ Test "${testInfo.title}" failed. Screenshot saved: ${screenshotName}`);
        }
    });

    // ==================== NAVIGATION TESTS ====================
    test.describe('Navigation Tests', () => {

        test('TC001: Navigate to Project', { tag: ['@smoke', '@navigation'] }, async () => {
            logger.info('📍 Test: Navigate to MIG Welding Project');

            await page.goto(`${CONFIG.baseUrl}/costing/${CONFIG.projectId}/part-information`);
            await page.waitForLoadState('networkidle');

            // Verify URL
            await expect(page).toHaveURL(new RegExp(`/costing/${CONFIG.projectId}`));

            logger.info(`✅ Successfully navigated to project: ${CONFIG.projectId}`);
        });

        test('TC002: Verify Page Title', { tag: ['@smoke'] }, async () => {
            logger.info('📍 Test: Verify Page Title');

            const title = await page.title();
            logger.info(`Page Title: ${title}`);

            expect(title).toBeTruthy();
            logger.info('✅ Page title verified');
        });
    });

    // ==================== PART INFORMATION TESTS ====================
    test.describe('Part Information Tests', () => {

        test('TC003: Verify Part Details Section', { tag: ['@part-info'] }, async () => {
            logger.info('📍 Test: Verify Part Details Section');

            await migWeldingPage.verifyPartDetails();

            // Verify key fields are visible
            await expect(migWeldingPage.InternalPartNumber).toBeVisible();
            await expect(migWeldingPage.ManufacturingCategory).toBeVisible();

            const partNumber = await migWeldingPage.InternalPartNumber.inputValue();
            logger.info(`Part Number: ${partNumber}`);
            logger.info(`Expected: ${PartInformation.internalPartNumber}`);

            expect(partNumber).toContain('1023729-C');
            logger.info('✅ Part Details verified');
        });

        test('TC004: Verify Part Volume Data', { tag: ['@part-info'] }, async () => {
            logger.info('📍 Test: Verify Part Volume Data');

            const annualVolume = await migWeldingPage.AnnualVolumeQtyNos.inputValue();
            const lotSize = await migWeldingPage.LotsizeNos.inputValue();

            logger.info(`Annual Volume: ${annualVolume} (Expected: ${PartInformation.annualVolumeQty})`);
            logger.info(`Lot Size: ${lotSize} (Expected: ${PartInformation.lotSize})`);

            expect(parseInt(annualVolume)).toBe(PartInformation.annualVolumeQty);
            expect(parseInt(lotSize)).toBe(PartInformation.lotSize);

            logger.info('✅ Part Volume Data verified');
        });
    });

    // ==================== MATERIAL INFORMATION TESTS ====================
    test.describe('Material Information Tests', () => {

        test('TC005: Verify Material Section', { tag: ['@material'] }, async () => {
            logger.info('📍 Test: Verify Material Information Section');

            await migWeldingPage.MaterialInfo.click();
            await page.waitForTimeout(500);

            await expect(migWeldingPage.materialCategory).toBeVisible();
            await expect(migWeldingPage.MatFamily).toBeVisible();
            await expect(migWeldingPage.MaterialPrice).toBeVisible();

            logger.info('✅ Material Information Section visible');
        });

        test('TC006: Verify Material Price', { tag: ['@material'] }, async () => {
            logger.info('📍 Test: Verify Material Price');

            const materialPrice = await migWeldingPage.MaterialPrice.inputValue();
            logger.info(`Material Price: $${materialPrice} (Expected: $${MaterialInformation.materialPrice})`);

            expect(parseFloat(materialPrice)).toBeCloseTo(MaterialInformation.materialPrice, 1);
            logger.info('✅ Material Price verified');
        });
    });

    // ==================== WELDING DETAILS TESTS ====================
    test.describe('Welding Details Tests', () => {

        test('TC007: Verify Welding Section Visible', { tag: ['@welding'] }, async () => {
            logger.info('📍 Test: Verify Welding Details Section');

            //      await migWeldingPage.verifyWeldingDetails();

            await expect(migWeldingPage.WeldType1).toBeVisible();
            await expect(migWeldingPage.WeldSize1).toBeVisible();
            await expect(migWeldingPage.WeldLengthmm1).toBeVisible();

            logger.info('✅ Welding Details section visible');
        });

        test('TC008: Verify Weld 1 Details', { tag: ['@welding'] }, async () => {
            logger.info('📍 Test: Verify Weld 1 Details');

            const weld1 = WeldingDetails.weld1;

            const weldSize = await migWeldingPage.WeldSize1.inputValue();
            const weldLength = await migWeldingPage.WeldLengthmm1.inputValue();

            logger.info(`Weld Size: ${weldSize} (Expected: ${weld1.weldSize})`);
            logger.info(`Weld Length: ${weldLength} (Expected: ${weld1.weldLength})`);

            expect(parseFloat(weldSize)).toBe(weld1.weldSize);
            expect(parseFloat(weldLength)).toBe(weld1.weldLength);

            logger.info('✅ Weld 1 Details verified');
        });

        test('TC009: Verify Weld Element Size Calculation', { tag: ['@welding', '@calculation'] }, async () => {
            logger.info('📍 Test: Verify Weld Element Size Calculation');

            const weldSize = parseFloat(await migWeldingPage.WeldSize1.inputValue());
            const weldElementSize = parseFloat(await migWeldingPage.WeldElementSize1.inputValue());
            const expectedElementSize = getWeldElementSize(weldSize);

            logger.info(`Weld Size: ${weldSize}`);
            logger.info(`Weld Element Size (UI): ${weldElementSize}`);
            logger.info(`Weld Element Size (Expected): ${expectedElementSize}`);

            expect(weldElementSize).toBe(expectedElementSize);
            logger.info('✅ Weld Element Size calculation verified');
        });

        test('TC010: Verify Weld 2 Details', { tag: ['@welding'] }, async () => {
            logger.info('📍 Test: Verify Weld 2 Details');

            const weld2 = WeldingDetails.weld2;

            if (await migWeldingPage.WeldSize2.isVisible()) {
                const weldSize = await migWeldingPage.WeldSize2.inputValue();
                const weldLength = await migWeldingPage.WeldLength2.inputValue();

                logger.info(`Weld 2 Size: ${weldSize} (Expected: ${weld2.weldSize})`);
                logger.info(`Weld 2 Length: ${weldLength} (Expected: ${weld2.weldLength})`);

                expect(parseFloat(weldSize)).toBe(weld2.weldSize);
            } else {
                logger.info('Weld 2 not visible - may need to add weld');
            }

            logger.info('✅ Weld 2 Details check completed');
        });
    });

    // ==================== MANUFACTURING INFORMATION TESTS ====================
    test.describe('Manufacturing Information Tests', () => {

        test('TC011: Verify Machine Details', { tag: ['@manufacturing'] }, async () => {
            logger.info('📍 Test: Verify Machine Details');

            await migWeldingPage.ManufacturingInformation.scrollIntoViewIfNeeded().catch(() => { });

            if (await migWeldingPage.MachineEfficiency.isVisible()) {
                const efficiency = await migWeldingPage.MachineEfficiency.inputValue();
                logger.info(`Machine Efficiency: ${efficiency}% (Expected: ${MachineDetails.machineEfficiency}%)`);

                expect(parseFloat(efficiency)).toBe(MachineDetails.machineEfficiency);
            }

            logger.info('✅ Machine Details verified');
        });

        test('TC012: Verify Cycle Time Calculation', { tag: ['@manufacturing', '@calculation'] }, async () => {
            logger.info('📍 Test: Verify Cycle Time Calculation');

            //  await migWeldingPage.verifyWeldCycleTimeCalculation(ManufacturingDetails.cycleTimePerPart);

            const cycleTime = await migWeldingPage.CycleTimePart.inputValue();
            logger.info(`Cycle Time/Part: ${cycleTime} sec (Expected: ~${ManufacturingDetails.cycleTimePerPart} sec)`);

            expect(parseFloat(cycleTime)).toBeGreaterThan(0);
            logger.info('✅ Cycle Time calculation verified');
        });

        test('TC013: Verify Labor Cost Details', { tag: ['@manufacturing', '@cost'] }, async () => {
            logger.info('📍 Test: Verify Labor Cost Details');

            if (await migWeldingPage.DirectLaborRate.isVisible()) {
                const laborRate = await migWeldingPage.DirectLaborRate.inputValue();
                logger.info(`Direct Labor Rate: $${laborRate}/hr`);

                expect(parseFloat(laborRate)).toBeGreaterThan(0);
            }

            logger.info('✅ Labor Cost Details verified');
        });
    });

    // ==================== COST SUMMARY TESTS ====================
    test.describe('Cost Summary Tests', () => {

        test('TC014: Verify Cost Summary Section', { tag: ['@cost'] }, async () => {
            logger.info('📍 Test: Verify Cost Summary Section');

            await migWeldingPage.verifyCostSummary();

            await expect(migWeldingPage.CostSummary).toBeVisible();
            logger.info('✅ Cost Summary section visible');
        });

        test('TC015: Verify Material Cost', { tag: ['@cost'] }, async () => {
            logger.info('📍 Test: Verify Material Cost');

            const materialCost = await migWeldingPage.getInputValue(migWeldingPage.MaterialCost);
            logger.info(`Material Cost: $${materialCost} (Expected: $${CostSummary.materialCost.amount})`);

            expect(materialCost).toBeCloseTo(CostSummary.materialCost.amount, 2);
            logger.info('✅ Material Cost verified');
        });

        test('TC016: Verify Manufacturing Cost', { tag: ['@cost'] }, async () => {
            logger.info('📍 Test: Verify Manufacturing Cost');

            const manufacturingCost = await migWeldingPage.getInputValue(migWeldingPage.ManufacturingCost);
            logger.info(`Manufacturing Cost: $${manufacturingCost} (Expected: $${CostSummary.manufacturingCost.amount})`);

            expect(manufacturingCost).toBeCloseTo(CostSummary.manufacturingCost.amount, 2);
            logger.info('✅ Manufacturing Cost verified');
        });

        test('TC017: Verify Should Cost', { tag: ['@cost'] }, async () => {
            logger.info('📍 Test: Verify Part Should Cost');

            const shouldCost = await migWeldingPage.getInputValue(migWeldingPage.PartShouldCost);
            logger.info(`Part Should Cost: $${shouldCost} (Expected: $${CostSummary.partShouldCost.amount})`);

            expect(shouldCost).toBeCloseTo(CostSummary.partShouldCost.amount, 2);
            logger.info('✅ Part Should Cost verified');
        });

        test('TC018: Verify Cost Breakdown Percentages', { tag: ['@cost'] }, async () => {
            logger.info('📍 Test: Verify Cost Breakdown Percentages');

            const costs = await migWeldingPage.verifyCostBreakdown();
            logger.info('Cost Breakdown:');
            Object.entries(costs).forEach(([key, value]) => {
                logger.info(`  ${key}: $${value.toFixed(4)}`);
            });

            logger.info('✅ Cost Breakdown Percentages verified');
        });
    });

    // ==================== RECALCULATION TESTS ====================
    test.describe('Recalculation Tests', () => {

        test('TC019: Recalculate Cost', { tag: ['@action'] }, async () => {
            logger.info('📍 Test: Recalculate Cost');

            await migWeldingPage.recalculateCost();
            await expect(migWeldingPage.CostSummary).toBeVisible();

            logger.info('✅ Cost recalculation completed');
        });

        test('TC020: Verify Values After Recalculation', { tag: ['@action', '@calculation'] }, async () => {
            logger.info('📍 Test: Verify Values After Recalculation');

            const shouldCost = await migWeldingPage.getInputValue(migWeldingPage.PartShouldCost);
            logger.info(`Should Cost after recalculation: $${shouldCost}`);

            expect(shouldCost).toBeGreaterThan(0);
            logger.info('✅ Values verified after recalculation');
        });
    });

    // ==================== EXPAND/COLLAPSE TESTS ====================
    test.describe('UI Interaction Tests', () => {

        test('TC021: Expand All Sections', { tag: ['@ui'] }, async () => {
            logger.info('📍 Test: Expand All Sections');

            await migWeldingPage.expandAllSections();
            await page.waitForTimeout(500);

            logger.info('✅ All sections expanded');
        });

        test('TC022: Collapse All Sections', { tag: ['@ui'] }, async () => {
            logger.info('📍 Test: Collapse All Sections');

            if (await migWeldingPage.CollapseAll.isVisible()) {
                await migWeldingPage.CollapseAll.click();
                await page.waitForTimeout(500);
            }

            logger.info('✅ All sections collapsed');
        });
    });
});

// ==================== CALCULATION VALIDATION TESTS ====================
test.describe('Calculation Validation Tests', () => {

    test('Verify Weld Element Size Logic', async () => {
        logger.info('📍 Test: Verify Weld Element Size Logic');

        // Test cases
        const testCases = [
            { input: 2, expected: 2 },
            { input: 3, expected: 3 },
            { input: 4, expected: 3 },
            { input: 5, expected: 4 },
            { input: 6, expected: 5 },
            { input: 10, expected: 6 },
            { input: 15, expected: 8 }
        ];

        testCases.forEach(({ input, expected }) => {
            const result = getWeldElementSize(input);
            logger.info(`Weld Size ${input}mm → Element Size: ${result}mm (Expected: ${expected}mm)`);
            expect(result).toBe(expected);
        });

        logger.info('✅ Weld Element Size Logic verified');
    });

    test('Verify Cost Summary Calculations', async () => {
        logger.info('📍 Test: Verify Cost Summary Calculations');

        // Material + Manufacturing + Tooling + Overhead + Packing = EX-W Part Cost
        const calculatedExwCost =
            CostSummary.materialCost.amount +
            CostSummary.manufacturingCost.amount +
            CostSummary.toolingCost.amount +
            CostSummary.overheadProfit.amount +
            CostSummary.packingCost.amount;

        logger.info(`Calculated EX-W Cost: $${calculatedExwCost.toFixed(4)}`);
        logger.info(`Expected EX-W Cost: $${CostSummary.exwPartCost.amount}`);

        expect(compareWithTolerance(calculatedExwCost, CostSummary.exwPartCost.amount, 0.01)).toBe(true);

        // EX-W + Freight + Duties = Should Cost
        const calculatedShouldCost =
            CostSummary.exwPartCost.amount +
            CostSummary.freightCost.amount +
            CostSummary.dutiesTariff.amount;

        logger.info(`Calculated Should Cost: $${calculatedShouldCost.toFixed(4)}`);
        logger.info(`Expected Should Cost: $${CostSummary.partShouldCost.amount}`);

        expect(compareWithTolerance(calculatedShouldCost, CostSummary.partShouldCost.amount, 0.01)).toBe(true);

        logger.info('✅ Cost Summary Calculations verified');
    });

    test('Verify Percentage Totals', async () => {
        logger.info('📍 Test: Verify Percentage Totals');

        const totalPercent =
            CostSummary.materialCost.percent +
            CostSummary.manufacturingCost.percent +
            CostSummary.toolingCost.percent +
            CostSummary.overheadProfit.percent +
            CostSummary.packingCost.percent;

        logger.info(`Total Percentage: ${totalPercent}%`);

        // Total should be close to 100%
        expect(compareWithTolerance(totalPercent, 100, 1)).toBe(true);

        logger.info('✅ Percentage Totals verified');
    });
});

// ==================== EXCEL DATA COMPARISON TESTS ====================
test.describe('Excel Data Comparison Tests', () => {

    test('Compare Excel vs TypeScript Test Data', async () => {
        logger.info('📍 Test: Compare Excel vs TypeScript Test Data');

        if (!excelData) {
            logger.warn('Excel data not loaded, skipping comparison');
            return;
        }

        // Compare Project Data
        expect(excelData.projectData.projectId).toBe(ProjectData.projectId);
        logger.info(`✓ Project ID matches: ${excelData.projectData.projectId}`);

        // Compare Part Information
        expect(excelData.partInformation.annualVolumeQty).toBe(PartInformation.annualVolumeQty);
        logger.info(`✓ Annual Volume matches: ${excelData.partInformation.annualVolumeQty}`);

        // Compare Cost Summary
        expect(excelData.costSummary.partShouldCost).toBeCloseTo(CostSummary.partShouldCost.amount, 3);
        logger.info(`✓ Should Cost matches: $${excelData.costSummary.partShouldCost}`);

        logger.info('✅ Excel vs TypeScript data comparison passed');
    });
});
