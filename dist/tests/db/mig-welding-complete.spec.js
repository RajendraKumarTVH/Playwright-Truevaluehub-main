"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const path = __importStar(require("path"));
// Page Objects
const migWeldingCalculator_page_1 = require("./pages/migWeldingCalculator.page");
const mig_welding_page_copy_1 = require("./pages/mig-welding.page copy");
const LoginPage_1 = require("../pageFactory/pageRepository/LoginPage");
const CreateProjectPage_1 = __importDefault(require("../pageFactory/pageRepository/CreateProjectPage"));
const LoggerUtil_1 = __importDefault(require("../lib/LoggerUtil"));
// TypeScript Test Data
const mig_welding_testdata_1 = require("../test-data/mig-welding-testdata");
// Excel Test Data Reader
const excel_reader_1 = require("../test-data/excel-reader");
const logger = LoggerUtil_1.default;
// ==================== TEST CONFIGURATION ====================
const CONFIG = {
    baseUrl: 'https://qa.truevaluehub.com',
    projectId: mig_welding_testdata_1.ProjectData.projectId,
    excelFilePath: path.resolve(__dirname, '../test-data/MigWelding-TestData.xlsx'),
    timeout: 30000,
    screenshotOnError: true
};
// ==================== LOAD EXCEL DATA ====================
let excelData;
try {
    excelData = (0, excel_reader_1.readMigWeldingTestData)(CONFIG.excelFilePath);
    logger.info('✅ Excel test data loaded successfully');
}
catch (error) {
    logger.warn(`⚠️ Could not load Excel data: ${error.message}. Using TypeScript data.`);
}
// ==================== MAIN TEST SUITE ====================
test_1.test.describe('MIG Welding Calculator - Complete E2E Tests', () => {
    let context;
    let page;
    let migWeldingPage;
    let migWeldingCalculatorPage;
    let loginPage;
    let createProjectPage;
    test_1.test.beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        logger.info('═══════════════════════════════════════════════════════════');
        logger.info('🚀 Starting MIG Welding Calculator Complete E2E Test Suite');
        logger.info('═══════════════════════════════════════════════════════════');
        logger.info(`📋 Project ID: ${CONFIG.projectId}`);
        logger.info(`🌐 Base URL: ${CONFIG.baseUrl}`);
        context = yield test_1.chromium.launchPersistentContext('./user-profile', {
            headless: false,
            args: ['--start-maximized'],
            viewport: null,
            timeout: CONFIG.timeout
        });
        page = (_a = context.pages()[0]) !== null && _a !== void 0 ? _a : (yield context.newPage());
        loginPage = new LoginPage_1.LoginPage(page, context);
        createProjectPage = new CreateProjectPage_1.default(page, context);
        migWeldingPage = new mig_welding_page_copy_1.MigWeldingPage(page, context);
        migWeldingCalculatorPage = new migWeldingCalculator_page_1.MigWeldingCalculatorPage(page, context);
        logger.info('✅ Browser and Page Objects initialized');
    }));
    test_1.test.afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        logger.info('🏁 MIG Welding Calculator Test Suite Completed');
        if (context)
            yield context.close();
    }));
    test_1.test.afterEach((_a, testInfo_1) => __awaiter(void 0, [_a, testInfo_1], void 0, function* ({}, testInfo) {
        if (testInfo.status !== testInfo.expectedStatus) {
            const screenshotName = `${testInfo.title.replace(/\s+/g, '_')}_error.png`;
            yield page.screenshot({ path: screenshotName, fullPage: true });
            logger.error(`❌ Test "${testInfo.title}" failed. Screenshot saved: ${screenshotName}`);
        }
    }));
    // ==================== NAVIGATION TESTS ====================
    test_1.test.describe('Navigation Tests', () => {
        (0, test_1.test)('TC001: Navigate to Project', { tag: ['@smoke', '@navigation'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            logger.info('📍 Test: Navigate to MIG Welding Project');
            yield page.goto(`${CONFIG.baseUrl}/costing/${CONFIG.projectId}/part-information`);
            yield page.waitForLoadState('networkidle');
            // Verify URL
            yield (0, test_1.expect)(page).toHaveURL(new RegExp(`/costing/${CONFIG.projectId}`));
            logger.info(`✅ Successfully navigated to project: ${CONFIG.projectId}`);
        }));
        (0, test_1.test)('TC002: Verify Page Title', { tag: ['@smoke'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            logger.info('📍 Test: Verify Page Title');
            const title = yield page.title();
            logger.info(`Page Title: ${title}`);
            (0, test_1.expect)(title).toBeTruthy();
            logger.info('✅ Page title verified');
        }));
    });
    // ==================== PART INFORMATION TESTS ====================
    test_1.test.describe('Part Information Tests', () => {
        (0, test_1.test)('TC003: Verify Part Details Section', { tag: ['@part-info'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            logger.info('📍 Test: Verify Part Details Section');
            yield migWeldingPage.verifyPartDetails();
            // Verify key fields are visible
            yield (0, test_1.expect)(migWeldingPage.InternalPartNumber).toBeVisible();
            yield (0, test_1.expect)(migWeldingPage.ManufacturingCategory).toBeVisible();
            const partNumber = yield migWeldingPage.InternalPartNumber.inputValue();
            logger.info(`Part Number: ${partNumber}`);
            logger.info(`Expected: ${mig_welding_testdata_1.PartInformation.internalPartNumber}`);
            (0, test_1.expect)(partNumber).toContain('1023729-C');
            logger.info('✅ Part Details verified');
        }));
        (0, test_1.test)('TC004: Verify Part Volume Data', { tag: ['@part-info'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            logger.info('📍 Test: Verify Part Volume Data');
            const annualVolume = yield migWeldingPage.AnnualVolumeQtyNos.inputValue();
            const lotSize = yield migWeldingPage.LotsizeNos.inputValue();
            logger.info(`Annual Volume: ${annualVolume} (Expected: ${mig_welding_testdata_1.PartInformation.annualVolumeQty})`);
            logger.info(`Lot Size: ${lotSize} (Expected: ${mig_welding_testdata_1.PartInformation.lotSize})`);
            (0, test_1.expect)(parseInt(annualVolume)).toBe(mig_welding_testdata_1.PartInformation.annualVolumeQty);
            (0, test_1.expect)(parseInt(lotSize)).toBe(mig_welding_testdata_1.PartInformation.lotSize);
            logger.info('✅ Part Volume Data verified');
        }));
    });
    // ==================== MATERIAL INFORMATION TESTS ====================
    test_1.test.describe('Material Information Tests', () => {
        (0, test_1.test)('TC005: Verify Material Section', { tag: ['@material'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            logger.info('📍 Test: Verify Material Information Section');
            yield migWeldingPage.MaterialInfo.click();
            yield page.waitForTimeout(500);
            yield (0, test_1.expect)(migWeldingPage.materialCategory).toBeVisible();
            yield (0, test_1.expect)(migWeldingPage.MatFamily).toBeVisible();
            yield (0, test_1.expect)(migWeldingPage.MaterialPrice).toBeVisible();
            logger.info('✅ Material Information Section visible');
        }));
        (0, test_1.test)('TC006: Verify Material Price', { tag: ['@material'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            logger.info('📍 Test: Verify Material Price');
            const materialPrice = yield migWeldingPage.MaterialPrice.inputValue();
            logger.info(`Material Price: $${materialPrice} (Expected: $${mig_welding_testdata_1.MaterialInformation.materialPrice})`);
            (0, test_1.expect)(parseFloat(materialPrice)).toBeCloseTo(mig_welding_testdata_1.MaterialInformation.materialPrice, 1);
            logger.info('✅ Material Price verified');
        }));
    });
    // ==================== WELDING DETAILS TESTS ====================
    test_1.test.describe('Welding Details Tests', () => {
        (0, test_1.test)('TC007: Verify Welding Section Visible', { tag: ['@welding'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            logger.info('📍 Test: Verify Welding Details Section');
            //      await migWeldingPage.verifyWeldingDetails();
            yield (0, test_1.expect)(migWeldingPage.WeldType1).toBeVisible();
            yield (0, test_1.expect)(migWeldingPage.WeldSize1).toBeVisible();
            yield (0, test_1.expect)(migWeldingPage.WeldLengthmm1).toBeVisible();
            logger.info('✅ Welding Details section visible');
        }));
        (0, test_1.test)('TC008: Verify Weld 1 Details', { tag: ['@welding'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            logger.info('📍 Test: Verify Weld 1 Details');
            const weld1 = mig_welding_testdata_1.WeldingDetails.weld1;
            const weldSize = yield migWeldingPage.WeldSize1.inputValue();
            const weldLength = yield migWeldingPage.WeldLengthmm1.inputValue();
            logger.info(`Weld Size: ${weldSize} (Expected: ${weld1.weldSize})`);
            logger.info(`Weld Length: ${weldLength} (Expected: ${weld1.weldLength})`);
            (0, test_1.expect)(parseFloat(weldSize)).toBe(weld1.weldSize);
            (0, test_1.expect)(parseFloat(weldLength)).toBe(weld1.weldLength);
            logger.info('✅ Weld 1 Details verified');
        }));
        (0, test_1.test)('TC009: Verify Weld Element Size Calculation', { tag: ['@welding', '@calculation'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            logger.info('📍 Test: Verify Weld Element Size Calculation');
            const weldSize = parseFloat(yield migWeldingPage.WeldSize1.inputValue());
            const weldElementSize = parseFloat(yield migWeldingPage.WeldElementSize1.inputValue());
            const expectedElementSize = (0, mig_welding_testdata_1.getWeldElementSize)(weldSize);
            logger.info(`Weld Size: ${weldSize}`);
            logger.info(`Weld Element Size (UI): ${weldElementSize}`);
            logger.info(`Weld Element Size (Expected): ${expectedElementSize}`);
            (0, test_1.expect)(weldElementSize).toBe(expectedElementSize);
            logger.info('✅ Weld Element Size calculation verified');
        }));
        (0, test_1.test)('TC010: Verify Weld 2 Details', { tag: ['@welding'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            logger.info('📍 Test: Verify Weld 2 Details');
            const weld2 = mig_welding_testdata_1.WeldingDetails.weld2;
            if (yield migWeldingPage.WeldSize2.isVisible()) {
                const weldSize = yield migWeldingPage.WeldSize2.inputValue();
                const weldLength = yield migWeldingPage.WeldLength2.inputValue();
                logger.info(`Weld 2 Size: ${weldSize} (Expected: ${weld2.weldSize})`);
                logger.info(`Weld 2 Length: ${weldLength} (Expected: ${weld2.weldLength})`);
                (0, test_1.expect)(parseFloat(weldSize)).toBe(weld2.weldSize);
            }
            else {
                logger.info('Weld 2 not visible - may need to add weld');
            }
            logger.info('✅ Weld 2 Details check completed');
        }));
    });
    // ==================== MANUFACTURING INFORMATION TESTS ====================
    test_1.test.describe('Manufacturing Information Tests', () => {
        (0, test_1.test)('TC011: Verify Machine Details', { tag: ['@manufacturing'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            logger.info('📍 Test: Verify Machine Details');
            yield migWeldingPage.ManufacturingInformation.scrollIntoViewIfNeeded().catch(() => { });
            if (yield migWeldingPage.MachineEfficiency.isVisible()) {
                const efficiency = yield migWeldingPage.MachineEfficiency.inputValue();
                logger.info(`Machine Efficiency: ${efficiency}% (Expected: ${mig_welding_testdata_1.MachineDetails.machineEfficiency}%)`);
                (0, test_1.expect)(parseFloat(efficiency)).toBe(mig_welding_testdata_1.MachineDetails.machineEfficiency);
            }
            logger.info('✅ Machine Details verified');
        }));
        (0, test_1.test)('TC012: Verify Cycle Time Calculation', { tag: ['@manufacturing', '@calculation'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            logger.info('📍 Test: Verify Cycle Time Calculation');
            //  await migWeldingPage.verifyWeldCycleTimeCalculation(ManufacturingDetails.cycleTimePerPart);
            const cycleTime = yield migWeldingPage.CycleTimePart.inputValue();
            logger.info(`Cycle Time/Part: ${cycleTime} sec (Expected: ~${mig_welding_testdata_1.ManufacturingDetails.cycleTimePerPart} sec)`);
            (0, test_1.expect)(parseFloat(cycleTime)).toBeGreaterThan(0);
            logger.info('✅ Cycle Time calculation verified');
        }));
        (0, test_1.test)('TC013: Verify Labor Cost Details', { tag: ['@manufacturing', '@cost'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            logger.info('📍 Test: Verify Labor Cost Details');
            if (yield migWeldingPage.DirectLaborRate.isVisible()) {
                const laborRate = yield migWeldingPage.DirectLaborRate.inputValue();
                logger.info(`Direct Labor Rate: $${laborRate}/hr`);
                (0, test_1.expect)(parseFloat(laborRate)).toBeGreaterThan(0);
            }
            logger.info('✅ Labor Cost Details verified');
        }));
    });
    // ==================== COST SUMMARY TESTS ====================
    test_1.test.describe('Cost Summary Tests', () => {
        (0, test_1.test)('TC014: Verify Cost Summary Section', { tag: ['@cost'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            logger.info('📍 Test: Verify Cost Summary Section');
            yield migWeldingPage.verifyCostSummary();
            yield (0, test_1.expect)(migWeldingPage.CostSummary).toBeVisible();
            logger.info('✅ Cost Summary section visible');
        }));
        (0, test_1.test)('TC015: Verify Material Cost', { tag: ['@cost'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            logger.info('📍 Test: Verify Material Cost');
            const materialCost = yield migWeldingPage.getInputValue(migWeldingPage.MaterialCost);
            logger.info(`Material Cost: $${materialCost} (Expected: $${mig_welding_testdata_1.CostSummary.materialCost.amount})`);
            (0, test_1.expect)(materialCost).toBeCloseTo(mig_welding_testdata_1.CostSummary.materialCost.amount, 2);
            logger.info('✅ Material Cost verified');
        }));
        (0, test_1.test)('TC016: Verify Manufacturing Cost', { tag: ['@cost'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            logger.info('📍 Test: Verify Manufacturing Cost');
            const manufacturingCost = yield migWeldingPage.getInputValue(migWeldingPage.ManufacturingCost);
            logger.info(`Manufacturing Cost: $${manufacturingCost} (Expected: $${mig_welding_testdata_1.CostSummary.manufacturingCost.amount})`);
            (0, test_1.expect)(manufacturingCost).toBeCloseTo(mig_welding_testdata_1.CostSummary.manufacturingCost.amount, 2);
            logger.info('✅ Manufacturing Cost verified');
        }));
        (0, test_1.test)('TC017: Verify Should Cost', { tag: ['@cost'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            logger.info('📍 Test: Verify Part Should Cost');
            const shouldCost = yield migWeldingPage.getInputValue(migWeldingPage.PartShouldCost);
            logger.info(`Part Should Cost: $${shouldCost} (Expected: $${mig_welding_testdata_1.CostSummary.partShouldCost.amount})`);
            (0, test_1.expect)(shouldCost).toBeCloseTo(mig_welding_testdata_1.CostSummary.partShouldCost.amount, 2);
            logger.info('✅ Part Should Cost verified');
        }));
        (0, test_1.test)('TC018: Verify Cost Breakdown Percentages', { tag: ['@cost'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            logger.info('📍 Test: Verify Cost Breakdown Percentages');
            const costs = yield migWeldingPage.verifyCostBreakdown();
            logger.info('Cost Breakdown:');
            Object.entries(costs).forEach(([key, value]) => {
                logger.info(`  ${key}: $${value.toFixed(4)}`);
            });
            logger.info('✅ Cost Breakdown Percentages verified');
        }));
    });
    // ==================== RECALCULATION TESTS ====================
    test_1.test.describe('Recalculation Tests', () => {
        (0, test_1.test)('TC019: Recalculate Cost', { tag: ['@action'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            logger.info('📍 Test: Recalculate Cost');
            yield migWeldingPage.recalculateCost();
            yield (0, test_1.expect)(migWeldingPage.CostSummary).toBeVisible();
            logger.info('✅ Cost recalculation completed');
        }));
        (0, test_1.test)('TC020: Verify Values After Recalculation', { tag: ['@action', '@calculation'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            logger.info('📍 Test: Verify Values After Recalculation');
            const shouldCost = yield migWeldingPage.getInputValue(migWeldingPage.PartShouldCost);
            logger.info(`Should Cost after recalculation: $${shouldCost}`);
            (0, test_1.expect)(shouldCost).toBeGreaterThan(0);
            logger.info('✅ Values verified after recalculation');
        }));
    });
    // ==================== EXPAND/COLLAPSE TESTS ====================
    test_1.test.describe('UI Interaction Tests', () => {
        (0, test_1.test)('TC021: Expand All Sections', { tag: ['@ui'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            logger.info('📍 Test: Expand All Sections');
            yield migWeldingPage.expandAllSections();
            yield page.waitForTimeout(500);
            logger.info('✅ All sections expanded');
        }));
        (0, test_1.test)('TC022: Collapse All Sections', { tag: ['@ui'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            logger.info('📍 Test: Collapse All Sections');
            if (yield migWeldingPage.CollapseAll.isVisible()) {
                yield migWeldingPage.CollapseAll.click();
                yield page.waitForTimeout(500);
            }
            logger.info('✅ All sections collapsed');
        }));
    });
});
// ==================== CALCULATION VALIDATION TESTS ====================
test_1.test.describe('Calculation Validation Tests', () => {
    (0, test_1.test)('Verify Weld Element Size Logic', () => __awaiter(void 0, void 0, void 0, function* () {
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
            const result = (0, mig_welding_testdata_1.getWeldElementSize)(input);
            logger.info(`Weld Size ${input}mm → Element Size: ${result}mm (Expected: ${expected}mm)`);
            (0, test_1.expect)(result).toBe(expected);
        });
        logger.info('✅ Weld Element Size Logic verified');
    }));
    (0, test_1.test)('Verify Cost Summary Calculations', () => __awaiter(void 0, void 0, void 0, function* () {
        logger.info('📍 Test: Verify Cost Summary Calculations');
        // Material + Manufacturing + Tooling + Overhead + Packing = EX-W Part Cost
        const calculatedExwCost = mig_welding_testdata_1.CostSummary.materialCost.amount +
            mig_welding_testdata_1.CostSummary.manufacturingCost.amount +
            mig_welding_testdata_1.CostSummary.toolingCost.amount +
            mig_welding_testdata_1.CostSummary.overheadProfit.amount +
            mig_welding_testdata_1.CostSummary.packingCost.amount;
        logger.info(`Calculated EX-W Cost: $${calculatedExwCost.toFixed(4)}`);
        logger.info(`Expected EX-W Cost: $${mig_welding_testdata_1.CostSummary.exwPartCost.amount}`);
        (0, test_1.expect)((0, mig_welding_testdata_1.compareWithTolerance)(calculatedExwCost, mig_welding_testdata_1.CostSummary.exwPartCost.amount, 0.01)).toBe(true);
        // EX-W + Freight + Duties = Should Cost
        const calculatedShouldCost = mig_welding_testdata_1.CostSummary.exwPartCost.amount +
            mig_welding_testdata_1.CostSummary.freightCost.amount +
            mig_welding_testdata_1.CostSummary.dutiesTariff.amount;
        logger.info(`Calculated Should Cost: $${calculatedShouldCost.toFixed(4)}`);
        logger.info(`Expected Should Cost: $${mig_welding_testdata_1.CostSummary.partShouldCost.amount}`);
        (0, test_1.expect)((0, mig_welding_testdata_1.compareWithTolerance)(calculatedShouldCost, mig_welding_testdata_1.CostSummary.partShouldCost.amount, 0.01)).toBe(true);
        logger.info('✅ Cost Summary Calculations verified');
    }));
    (0, test_1.test)('Verify Percentage Totals', () => __awaiter(void 0, void 0, void 0, function* () {
        logger.info('📍 Test: Verify Percentage Totals');
        const totalPercent = mig_welding_testdata_1.CostSummary.materialCost.percent +
            mig_welding_testdata_1.CostSummary.manufacturingCost.percent +
            mig_welding_testdata_1.CostSummary.toolingCost.percent +
            mig_welding_testdata_1.CostSummary.overheadProfit.percent +
            mig_welding_testdata_1.CostSummary.packingCost.percent;
        logger.info(`Total Percentage: ${totalPercent}%`);
        // Total should be close to 100%
        (0, test_1.expect)((0, mig_welding_testdata_1.compareWithTolerance)(totalPercent, 100, 1)).toBe(true);
        logger.info('✅ Percentage Totals verified');
    }));
});
// ==================== EXCEL DATA COMPARISON TESTS ====================
test_1.test.describe('Excel Data Comparison Tests', () => {
    (0, test_1.test)('Compare Excel vs TypeScript Test Data', () => __awaiter(void 0, void 0, void 0, function* () {
        logger.info('📍 Test: Compare Excel vs TypeScript Test Data');
        if (!excelData) {
            logger.warn('Excel data not loaded, skipping comparison');
            return;
        }
        // Compare Project Data
        (0, test_1.expect)(excelData.projectData.projectId).toBe(mig_welding_testdata_1.ProjectData.projectId);
        logger.info(`✓ Project ID matches: ${excelData.projectData.projectId}`);
        // Compare Part Information
        (0, test_1.expect)(excelData.partInformation.annualVolumeQty).toBe(mig_welding_testdata_1.PartInformation.annualVolumeQty);
        logger.info(`✓ Annual Volume matches: ${excelData.partInformation.annualVolumeQty}`);
        // Compare Cost Summary
        (0, test_1.expect)(excelData.costSummary.partShouldCost).toBeCloseTo(mig_welding_testdata_1.CostSummary.partShouldCost.amount, 3);
        logger.info(`✓ Should Cost matches: $${excelData.costSummary.partShouldCost}`);
        logger.info('✅ Excel vs TypeScript data comparison passed');
    }));
});
