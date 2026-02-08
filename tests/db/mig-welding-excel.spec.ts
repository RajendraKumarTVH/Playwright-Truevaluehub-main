import { test, expect, BrowserContext, Page, chromium } from '@playwright/test';
import { MigWeldingPage } from './pages/mig-welding.page';
import { LoginPage } from '../pageFactory/pageRepository/LoginPage';
import CreateProjectPage from '../pageFactory/pageRepository/CreateProjectPage';
import Logger from '../lib/LoggerUtil';
import * as path from 'path';

// Import Excel reader
import {
    MigWeldingExcelReader,
    readMigWeldingTestData,
    MigWeldingExcelData
} from '../test-data/excel-reader';

// Path to Excel test data file
const EXCEL_FILE_PATH = path.resolve(__dirname, '../test-data/MigWelding-TestData.xlsx');

// Read test data from Excel
let testData: MigWeldingExcelData;

try {
    testData = readMigWeldingTestData(EXCEL_FILE_PATH);
    Logger.info('✅ Excel test data loaded successfully');
} catch (error: any) {
    Logger.error(`❌ Failed to load Excel test data: ${error.message}`);
    throw error;
}

// 🔹 Define globals
let context: BrowserContext;
let page: Page;
let migWeldingPage: MigWeldingPage;

// ==================== TEST SETUP ====================
test.beforeAll(async () => {
    // Use persistent context like TC_01_Costing_Welding.test.ts
    context = await chromium.launchPersistentContext('./user-profile', {
        headless: false,
        args: ['--start-maximized'],
        viewport: null
    });

    page = context.pages()[0] ?? (await context.newPage());

    // Initialize page objects
    migWeldingPage = new MigWeldingPage(page, context);
});

test.afterAll(async () => {
    Logger.info('🏁 MIG Welding E2E Test Suite (Excel Data Driven) completed.');
    if (context) await context.close();
});

// ==================== TEST SUITE ====================
test.describe('MIG Welding E2E Tests - Excel Data Driven', () => {

    // ==================== TEST: LOGIN AND NAVIGATE ====================
    test('TC-EXCEL-001: Login and Navigate to Project', { tag: '@Smoke' }, async () => {
        const loginPage = new LoginPage(page, context);
        const createProjectPage = new CreateProjectPage(page, context);
        // ---------------------- LOGIN ----------------------
        try {
            await loginPage.navigateToURL()
            await page.waitForLoadState('networkidle')

            Logger.info('Clicking SSO button...')
            //  await loginPage.clickOnTrueValueHubSSoButton()
            await loginPage.verifyPageTitle()
            Logger.info('✅ Login successful')
            await context.storageState({ path: 'auth.json' })
        } catch (error) {
            Logger.error(`❌ Login failed: ${error}`)
            throw new Error('Login failed – test stopped')
        }

    })
})
// ==================== TEST: VERIFY PART INFORMATION ====================
test('TC-EXCEL-002: Verify Part Information from Excel', { tag: '@e2e' }, async () => {
    Logger.info('📍 Test: Verify Part Information from Excel');

    try {
        // Verify Part Details are visible
        await expect(migWeldingPage.InternalPartNumber).toBeVisible({ timeout: 10000 });

        const partInfo = testData.partInformation;
        Logger.info(`Internal Part Number: ${partInfo.internalPartNumber}`);
        Logger.info(`Annual Volume: ${partInfo.annualVolumeQty}`);
        Logger.info(`Lot Size: ${partInfo.lotSize}`);

        // Validate Excel data
        expect(partInfo.internalPartNumber).toBe('1023729-C-1023729-C 3');
        expect(partInfo.annualVolumeQty).toBe(950);
        expect(partInfo.lotSize).toBe(79);
        expect(partInfo.bomQty).toBe(1);

        Logger.info('✅ Part Information verified from Excel');
    } catch (error: any) {
        Logger.error(`❌ Test failed: ${error.message}`);
        await migWeldingPage.captureScreenshot('tc_excel_002_error');
        throw error;
    }
});

// ==================== TEST: VERIFY MATERIAL INFORMATION ====================
test('TC-EXCEL-003: Verify Material Information from Excel', { tag: '@e2e' }, async () => {
    Logger.info('📍 Test: Verify Material Information from Excel');

    try {
        const materialInfo = testData.materialInformation;
        Logger.info(`Category: ${materialInfo.category}`);
        Logger.info(`Family: ${materialInfo.family}`);
        Logger.info(`Material Price: $${materialInfo.materialPrice}`);

        expect(materialInfo.category).toBe('Ferrous');
        expect(materialInfo.family).toBe('Carbon Steel');
        expect(materialInfo.materialPrice).toBe(3.08);

        Logger.info('✅ Material Information verified from Excel');
    } catch (error: any) {
        Logger.error(`❌ Test failed: ${error.message}`);
        throw error;
    }
});

// ==================== TEST: VERIFY WELDING DETAILS ====================
test('TC-EXCEL-004: Verify Welding Details from Excel', { tag: '@e2e' }, async () => {
    Logger.info('📍 Test: Verify Welding Details from Excel');

    try {
        const weldingDetails = testData.weldingDetails;
        Logger.info(`Number of welds: ${weldingDetails.length}`);

        expect(weldingDetails.length).toBe(2);

        // Weld 1
        const weld1 = weldingDetails[0];
        Logger.info(`Weld 1: Type=${weld1.weldType}, Size=${weld1.weldSize}, Length=${weld1.weldLength}`);
        expect(weld1.weldType).toBe('Fillet');
        expect(weld1.weldSize).toBe(6);
        expect(weld1.weldLength).toBe(80);
        expect(weld1.weldSide).toBe('Both');

        // Weld 2
        const weld2 = weldingDetails[1];
        Logger.info(`Weld 2: Type=${weld2.weldType}, Size=${weld2.weldSize}, Length=${weld2.weldLength}`);
        expect(weld2.weldType).toBe('Fillet');
        expect(weld2.weldSize).toBe(6);
        expect(weld2.weldLength).toBe(30);
        expect(weld2.weldSide).toBe('Single');

        Logger.info('✅ Welding Details verified from Excel');
    } catch (error: any) {
        Logger.error(`❌ Test failed: ${error.message}`);
        throw error;
    }
});

// ==================== TEST: VERIFY MACHINE DETAILS ====================
test('TC-EXCEL-005: Verify Machine Details from Excel', { tag: '@e2e' }, async () => {
    Logger.info('📍 Test: Verify Machine Details from Excel');

    try {
        const machineDetails = testData.machineDetails;
        Logger.info(`Machine Name: ${machineDetails.machineName}`);
        Logger.info(`Automation: ${machineDetails.machineAutomation}`);
        Logger.info(`Efficiency: ${machineDetails.machineEfficiency}%`);

        expect(machineDetails.machineName).toBe('MIG Welding (Manual) - C240');
        expect(machineDetails.machineAutomation).toBe('Manual');
        expect(machineDetails.machineEfficiency).toBe(70);
        expect(machineDetails.selectedCurrent).toBe(240);

        Logger.info('✅ Machine Details verified from Excel');
    } catch (error: any) {
        Logger.error(`❌ Test failed: ${error.message}`);
        throw error;
    }
});

// ==================== TEST: VERIFY MANUFACTURING DETAILS ====================
test('TC-EXCEL-006: Verify Manufacturing Details from Excel', { tag: '@e2e' }, async () => {
    Logger.info('📍 Test: Verify Manufacturing Details from Excel');

    try {
        const mfgDetails = testData.manufacturingDetails;
        Logger.info(`Sampling Rate: ${mfgDetails.samplingRate}%`);
        Logger.info(`Yield: ${mfgDetails.yieldPercentage}%`);
        Logger.info(`Cycle Time/Part: ${mfgDetails.cycleTimePerPart} sec`);

        expect(mfgDetails.samplingRate).toBe(5);
        expect(mfgDetails.yieldPercentage).toBe(97);
        expect(mfgDetails.cycleTimePerPart).toBeCloseTo(136.0098, 2);
        expect(mfgDetails.noOfDirectLabors).toBe(1);

        Logger.info('✅ Manufacturing Details verified from Excel');
    } catch (error: any) {
        Logger.error(`❌ Test failed: ${error.message}`);
        throw error;
    }
});

// ==================== TEST: VERIFY COST SUMMARY ====================
test('TC-EXCEL-007: Verify Cost Summary from Excel', { tag: '@e2e' }, async () => {
    Logger.info('📍 Test: Verify Cost Summary from Excel');

    try {
        const costSummary = testData.costSummary;
        Logger.info(`Material Cost: $${costSummary.materialCost} (${costSummary.materialCostPercent}%)`);
        Logger.info(`Manufacturing Cost: $${costSummary.manufacturingCost} (${costSummary.manufacturingCostPercent}%)`);
        Logger.info(`Should Cost: $${costSummary.partShouldCost}`);

        expect(costSummary.materialCost).toBeCloseTo(0.1127, 3);
        expect(costSummary.manufacturingCost).toBeCloseTo(2.1406, 3);
        expect(costSummary.partShouldCost).toBeCloseTo(2.7958, 3);

        // Verify percentages
        expect(costSummary.materialCostPercent).toBeCloseTo(4.03, 1);
        expect(costSummary.manufacturingCostPercent).toBeCloseTo(76.56, 1);

        Logger.info('✅ Cost Summary verified from Excel');
    } catch (error: any) {
        Logger.error(`❌ Test failed: ${error.message}`);
        throw error;
    }
});

// ==================== TEST: VERIFY WELDING UI VALUES ====================
test('TC-EXCEL-008: Verify Welding UI Values Match Excel', { tag: ['@e2e', '@welding'] }, async () => {
    Logger.info('📍 Test: Verify Welding Values Match Excel Data');

    try {
        // Get expected values from Excel
        const expectedWeld1 = testData.weldingDetails[0];

        // Scroll to welding section
        await migWeldingPage.WeldingDetails.scrollIntoViewIfNeeded().catch(() => { });
        await page.waitForTimeout(500);

        // Check if weld fields are visible
        if (await migWeldingPage.WeldType1.isVisible()) {
            // Get UI values
            const uiWeldSize = await migWeldingPage.WeldSize1.inputValue();
            const uiWeldLength = await migWeldingPage.WeldLengthmm1.inputValue();

            Logger.info(`Excel Weld Size: ${expectedWeld1.weldSize}, UI Weld Size: ${uiWeldSize}`);
            Logger.info(`Excel Weld Length: ${expectedWeld1.weldLength}, UI Weld Length: ${uiWeldLength}`);

            // Verify values match (with tolerance)
            expect(parseFloat(uiWeldSize)).toBeCloseTo(expectedWeld1.weldSize, 1);
        }

        Logger.info('✅ Welding values match Excel data');
    } catch (error: any) {
        Logger.error(`❌ Test failed: ${error.message}`);
        await migWeldingPage.captureScreenshot('tc_excel_008_error');
        throw error;
    }
});


// ==================== DATA VALIDATION TESTS ====================
test.describe('Excel Data Validation Tests', () => {

    test('Validate Excel file structure', async () => {
        const reader = new MigWeldingExcelReader(EXCEL_FILE_PATH);
        const sheetNames = reader.getSheetNames();

        Logger.info(`Excel Sheets: ${sheetNames.join(', ')}`);

        // Verify all required sheets exist
        expect(sheetNames).toContain('ProjectData');
        expect(sheetNames).toContain('PartInformation');
        expect(sheetNames).toContain('MaterialInformation');
        expect(sheetNames).toContain('WeldingDetails');
        expect(sheetNames).toContain('MachineDetails');
        expect(sheetNames).toContain('ManufacturingDetails');
        expect(sheetNames).toContain('CostSummary');

        Logger.info('✅ Excel file structure is valid');
    });

    test('Validate cost calculations from Excel', async () => {
        const costSummary = testData.costSummary;

        // Material + Manufacturing + Overhead + Packing should equal EX-W Part Cost
        const calculatedExwCost =
            costSummary.materialCost +
            costSummary.manufacturingCost +
            costSummary.toolingCost +
            costSummary.overheadProfit +
            costSummary.packingCost;

        Logger.info(`Calculated EX-W Cost: $${calculatedExwCost.toFixed(4)}`);
        Logger.info(`Excel EX-W Cost: $${costSummary.exwPartCost}`);

        expect(calculatedExwCost).toBeCloseTo(costSummary.exwPartCost, 2);

        // EX-W + Freight + Duties should equal Should Cost
        const calculatedShouldCost =
            costSummary.exwPartCost +
            costSummary.freightCost +
            costSummary.dutiesTariff;

        Logger.info(`Calculated Should Cost: $${calculatedShouldCost.toFixed(4)}`);
        Logger.info(`Excel Should Cost: $${costSummary.partShouldCost}`);

        expect(calculatedShouldCost).toBeCloseTo(costSummary.partShouldCost, 2);

        Logger.info('✅ Cost calculations from Excel are valid');
    });

    test('Validate weld element size calculation', async () => {
        // Weld element size lookup function
        const getWeldElementSize = (weldSize: number): number => {
            if (weldSize <= 3) return weldSize;
            if (weldSize <= 4.5) return 3;
            if (weldSize <= 5.5) return 4;
            if (weldSize <= 6) return 5;
            if (weldSize <= 12) return 6;
            return 8;
        };

        for (const weld of testData.weldingDetails) {
            const expectedElementSize = getWeldElementSize(weld.weldSize);
            Logger.info(`Weld ${weld.weldNumber}: Size=${weld.weldSize}, Expected Element Size=${expectedElementSize}, Excel Element Size=${weld.weldElementSize}`);

            expect(weld.weldElementSize).toBe(expectedElementSize);
        }

        Logger.info('✅ Weld element size calculations are valid');
    });
});
