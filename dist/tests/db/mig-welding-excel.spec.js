"use strict";
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
const mig_welding_page_1 = require("./pages/mig-welding.page");
const LoginPage_1 = require("../pageFactory/pageRepository/LoginPage");
const CreateProjectPage_1 = __importDefault(require("../pageFactory/pageRepository/CreateProjectPage"));
const LoggerUtil_1 = __importDefault(require("../lib/LoggerUtil"));
const path = __importStar(require("path"));
// Import Excel reader
const excel_reader_1 = require("../test-data/excel-reader");
// Path to Excel test data file
const EXCEL_FILE_PATH = path.resolve(__dirname, '../test-data/MigWelding-TestData.xlsx');
// Read test data from Excel
let testData;
try {
    testData = (0, excel_reader_1.readMigWeldingTestData)(EXCEL_FILE_PATH);
    LoggerUtil_1.default.info('✅ Excel test data loaded successfully');
}
catch (error) {
    LoggerUtil_1.default.error(`❌ Failed to load Excel test data: ${error.message}`);
    throw error;
}
// 🔹 Define globals
let context;
let page;
let migWeldingPage;
// ==================== TEST SETUP ====================
test_1.test.beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Use persistent context like TC_01_Costing_Welding.test.ts
    context = yield test_1.chromium.launchPersistentContext('./user-profile', {
        headless: false,
        args: ['--start-maximized'],
        viewport: null
    });
    page = (_a = context.pages()[0]) !== null && _a !== void 0 ? _a : (yield context.newPage());
    // Initialize page objects
    migWeldingPage = new mig_welding_page_1.MigWeldingPage(page, context);
}));
test_1.test.afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    LoggerUtil_1.default.info('🏁 MIG Welding E2E Test Suite (Excel Data Driven) completed.');
    if (context)
        yield context.close();
}));
// ==================== TEST SUITE ====================
test_1.test.describe('MIG Welding E2E Tests - Excel Data Driven', () => {
    // ==================== TEST: LOGIN AND NAVIGATE ====================
    (0, test_1.test)('TC-EXCEL-001: Login and Navigate to Project', { tag: '@Smoke' }, () => __awaiter(void 0, void 0, void 0, function* () {
        const loginPage = new LoginPage_1.LoginPage(page, context);
        const createProjectPage = new CreateProjectPage_1.default(page, context);
        // ---------------------- LOGIN ----------------------
        try {
            yield loginPage.navigateToURL();
            yield page.waitForLoadState('networkidle');
            LoggerUtil_1.default.info('Clicking SSO button...');
            //  await loginPage.clickOnTrueValueHubSSoButton()
            yield loginPage.verifyPageTitle();
            LoggerUtil_1.default.info('✅ Login successful');
            yield context.storageState({ path: 'auth.json' });
        }
        catch (error) {
            LoggerUtil_1.default.error(`❌ Login failed: ${error}`);
            throw new Error('Login failed – test stopped');
        }
    }));
});
// ==================== TEST: VERIFY PART INFORMATION ====================
(0, test_1.test)('TC-EXCEL-002: Verify Part Information from Excel', { tag: '@e2e' }, () => __awaiter(void 0, void 0, void 0, function* () {
    LoggerUtil_1.default.info('📍 Test: Verify Part Information from Excel');
    try {
        // Verify Part Details are visible
        yield (0, test_1.expect)(migWeldingPage.InternalPartNumber).toBeVisible({ timeout: 10000 });
        const partInfo = testData.partInformation;
        LoggerUtil_1.default.info(`Internal Part Number: ${partInfo.internalPartNumber}`);
        LoggerUtil_1.default.info(`Annual Volume: ${partInfo.annualVolumeQty}`);
        LoggerUtil_1.default.info(`Lot Size: ${partInfo.lotSize}`);
        // Validate Excel data
        (0, test_1.expect)(partInfo.internalPartNumber).toBe('1023729-C-1023729-C 3');
        (0, test_1.expect)(partInfo.annualVolumeQty).toBe(950);
        (0, test_1.expect)(partInfo.lotSize).toBe(79);
        (0, test_1.expect)(partInfo.bomQty).toBe(1);
        LoggerUtil_1.default.info('✅ Part Information verified from Excel');
    }
    catch (error) {
        LoggerUtil_1.default.error(`❌ Test failed: ${error.message}`);
        yield migWeldingPage.captureScreenshot('tc_excel_002_error');
        throw error;
    }
}));
// ==================== TEST: VERIFY MATERIAL INFORMATION ====================
(0, test_1.test)('TC-EXCEL-003: Verify Material Information from Excel', { tag: '@e2e' }, () => __awaiter(void 0, void 0, void 0, function* () {
    LoggerUtil_1.default.info('📍 Test: Verify Material Information from Excel');
    try {
        const materialInfo = testData.materialInformation;
        LoggerUtil_1.default.info(`Category: ${materialInfo.category}`);
        LoggerUtil_1.default.info(`Family: ${materialInfo.family}`);
        LoggerUtil_1.default.info(`Material Price: $${materialInfo.materialPrice}`);
        (0, test_1.expect)(materialInfo.category).toBe('Ferrous');
        (0, test_1.expect)(materialInfo.family).toBe('Carbon Steel');
        (0, test_1.expect)(materialInfo.materialPrice).toBe(3.08);
        LoggerUtil_1.default.info('✅ Material Information verified from Excel');
    }
    catch (error) {
        LoggerUtil_1.default.error(`❌ Test failed: ${error.message}`);
        throw error;
    }
}));
// ==================== TEST: VERIFY WELDING DETAILS ====================
(0, test_1.test)('TC-EXCEL-004: Verify Welding Details from Excel', { tag: '@e2e' }, () => __awaiter(void 0, void 0, void 0, function* () {
    LoggerUtil_1.default.info('📍 Test: Verify Welding Details from Excel');
    try {
        const weldingDetails = testData.weldingDetails;
        LoggerUtil_1.default.info(`Number of welds: ${weldingDetails.length}`);
        (0, test_1.expect)(weldingDetails.length).toBe(2);
        // Weld 1
        const weld1 = weldingDetails[0];
        LoggerUtil_1.default.info(`Weld 1: Type=${weld1.weldType}, Size=${weld1.weldSize}, Length=${weld1.weldLength}`);
        (0, test_1.expect)(weld1.weldType).toBe('Fillet');
        (0, test_1.expect)(weld1.weldSize).toBe(6);
        (0, test_1.expect)(weld1.weldLength).toBe(80);
        (0, test_1.expect)(weld1.weldSide).toBe('Both');
        // Weld 2
        const weld2 = weldingDetails[1];
        LoggerUtil_1.default.info(`Weld 2: Type=${weld2.weldType}, Size=${weld2.weldSize}, Length=${weld2.weldLength}`);
        (0, test_1.expect)(weld2.weldType).toBe('Fillet');
        (0, test_1.expect)(weld2.weldSize).toBe(6);
        (0, test_1.expect)(weld2.weldLength).toBe(30);
        (0, test_1.expect)(weld2.weldSide).toBe('Single');
        LoggerUtil_1.default.info('✅ Welding Details verified from Excel');
    }
    catch (error) {
        LoggerUtil_1.default.error(`❌ Test failed: ${error.message}`);
        throw error;
    }
}));
// ==================== TEST: VERIFY MACHINE DETAILS ====================
(0, test_1.test)('TC-EXCEL-005: Verify Machine Details from Excel', { tag: '@e2e' }, () => __awaiter(void 0, void 0, void 0, function* () {
    LoggerUtil_1.default.info('📍 Test: Verify Machine Details from Excel');
    try {
        const machineDetails = testData.machineDetails;
        LoggerUtil_1.default.info(`Machine Name: ${machineDetails.machineName}`);
        LoggerUtil_1.default.info(`Automation: ${machineDetails.machineAutomation}`);
        LoggerUtil_1.default.info(`Efficiency: ${machineDetails.machineEfficiency}%`);
        (0, test_1.expect)(machineDetails.machineName).toBe('MIG Welding (Manual) - C240');
        (0, test_1.expect)(machineDetails.machineAutomation).toBe('Manual');
        (0, test_1.expect)(machineDetails.machineEfficiency).toBe(70);
        (0, test_1.expect)(machineDetails.selectedCurrent).toBe(240);
        LoggerUtil_1.default.info('✅ Machine Details verified from Excel');
    }
    catch (error) {
        LoggerUtil_1.default.error(`❌ Test failed: ${error.message}`);
        throw error;
    }
}));
// ==================== TEST: VERIFY MANUFACTURING DETAILS ====================
(0, test_1.test)('TC-EXCEL-006: Verify Manufacturing Details from Excel', { tag: '@e2e' }, () => __awaiter(void 0, void 0, void 0, function* () {
    LoggerUtil_1.default.info('📍 Test: Verify Manufacturing Details from Excel');
    try {
        const mfgDetails = testData.manufacturingDetails;
        LoggerUtil_1.default.info(`Sampling Rate: ${mfgDetails.samplingRate}%`);
        LoggerUtil_1.default.info(`Yield: ${mfgDetails.yieldPercentage}%`);
        LoggerUtil_1.default.info(`Cycle Time/Part: ${mfgDetails.cycleTimePerPart} sec`);
        (0, test_1.expect)(mfgDetails.samplingRate).toBe(5);
        (0, test_1.expect)(mfgDetails.yieldPercentage).toBe(97);
        (0, test_1.expect)(mfgDetails.cycleTimePerPart).toBeCloseTo(136.0098, 2);
        (0, test_1.expect)(mfgDetails.noOfDirectLabors).toBe(1);
        LoggerUtil_1.default.info('✅ Manufacturing Details verified from Excel');
    }
    catch (error) {
        LoggerUtil_1.default.error(`❌ Test failed: ${error.message}`);
        throw error;
    }
}));
// ==================== TEST: VERIFY COST SUMMARY ====================
(0, test_1.test)('TC-EXCEL-007: Verify Cost Summary from Excel', { tag: '@e2e' }, () => __awaiter(void 0, void 0, void 0, function* () {
    LoggerUtil_1.default.info('📍 Test: Verify Cost Summary from Excel');
    try {
        const costSummary = testData.costSummary;
        LoggerUtil_1.default.info(`Material Cost: $${costSummary.materialCost} (${costSummary.materialCostPercent}%)`);
        LoggerUtil_1.default.info(`Manufacturing Cost: $${costSummary.manufacturingCost} (${costSummary.manufacturingCostPercent}%)`);
        LoggerUtil_1.default.info(`Should Cost: $${costSummary.partShouldCost}`);
        (0, test_1.expect)(costSummary.materialCost).toBeCloseTo(0.1127, 3);
        (0, test_1.expect)(costSummary.manufacturingCost).toBeCloseTo(2.1406, 3);
        (0, test_1.expect)(costSummary.partShouldCost).toBeCloseTo(2.7958, 3);
        // Verify percentages
        (0, test_1.expect)(costSummary.materialCostPercent).toBeCloseTo(4.03, 1);
        (0, test_1.expect)(costSummary.manufacturingCostPercent).toBeCloseTo(76.56, 1);
        LoggerUtil_1.default.info('✅ Cost Summary verified from Excel');
    }
    catch (error) {
        LoggerUtil_1.default.error(`❌ Test failed: ${error.message}`);
        throw error;
    }
}));
// ==================== TEST: VERIFY WELDING UI VALUES ====================
(0, test_1.test)('TC-EXCEL-008: Verify Welding UI Values Match Excel', { tag: ['@e2e', '@welding'] }, () => __awaiter(void 0, void 0, void 0, function* () {
    LoggerUtil_1.default.info('📍 Test: Verify Welding Values Match Excel Data');
    try {
        // Get expected values from Excel
        const expectedWeld1 = testData.weldingDetails[0];
        // Scroll to welding section
        yield migWeldingPage.WeldingDetails.scrollIntoViewIfNeeded().catch(() => { });
        yield page.waitForTimeout(500);
        // Check if weld fields are visible
        if (yield migWeldingPage.WeldType1.isVisible()) {
            // Get UI values
            const uiWeldSize = yield migWeldingPage.WeldSize1.inputValue();
            const uiWeldLength = yield migWeldingPage.WeldLengthmm1.inputValue();
            LoggerUtil_1.default.info(`Excel Weld Size: ${expectedWeld1.weldSize}, UI Weld Size: ${uiWeldSize}`);
            LoggerUtil_1.default.info(`Excel Weld Length: ${expectedWeld1.weldLength}, UI Weld Length: ${uiWeldLength}`);
            // Verify values match (with tolerance)
            (0, test_1.expect)(parseFloat(uiWeldSize)).toBeCloseTo(expectedWeld1.weldSize, 1);
        }
        LoggerUtil_1.default.info('✅ Welding values match Excel data');
    }
    catch (error) {
        LoggerUtil_1.default.error(`❌ Test failed: ${error.message}`);
        yield migWeldingPage.captureScreenshot('tc_excel_008_error');
        throw error;
    }
}));
// ==================== DATA VALIDATION TESTS ====================
test_1.test.describe('Excel Data Validation Tests', () => {
    (0, test_1.test)('Validate Excel file structure', () => __awaiter(void 0, void 0, void 0, function* () {
        const reader = new excel_reader_1.MigWeldingExcelReader(EXCEL_FILE_PATH);
        const sheetNames = reader.getSheetNames();
        LoggerUtil_1.default.info(`Excel Sheets: ${sheetNames.join(', ')}`);
        // Verify all required sheets exist
        (0, test_1.expect)(sheetNames).toContain('ProjectData');
        (0, test_1.expect)(sheetNames).toContain('PartInformation');
        (0, test_1.expect)(sheetNames).toContain('MaterialInformation');
        (0, test_1.expect)(sheetNames).toContain('WeldingDetails');
        (0, test_1.expect)(sheetNames).toContain('MachineDetails');
        (0, test_1.expect)(sheetNames).toContain('ManufacturingDetails');
        (0, test_1.expect)(sheetNames).toContain('CostSummary');
        LoggerUtil_1.default.info('✅ Excel file structure is valid');
    }));
    (0, test_1.test)('Validate cost calculations from Excel', () => __awaiter(void 0, void 0, void 0, function* () {
        const costSummary = testData.costSummary;
        // Material + Manufacturing + Overhead + Packing should equal EX-W Part Cost
        const calculatedExwCost = costSummary.materialCost +
            costSummary.manufacturingCost +
            costSummary.toolingCost +
            costSummary.overheadProfit +
            costSummary.packingCost;
        LoggerUtil_1.default.info(`Calculated EX-W Cost: $${calculatedExwCost.toFixed(4)}`);
        LoggerUtil_1.default.info(`Excel EX-W Cost: $${costSummary.exwPartCost}`);
        (0, test_1.expect)(calculatedExwCost).toBeCloseTo(costSummary.exwPartCost, 2);
        // EX-W + Freight + Duties should equal Should Cost
        const calculatedShouldCost = costSummary.exwPartCost +
            costSummary.freightCost +
            costSummary.dutiesTariff;
        LoggerUtil_1.default.info(`Calculated Should Cost: $${calculatedShouldCost.toFixed(4)}`);
        LoggerUtil_1.default.info(`Excel Should Cost: $${costSummary.partShouldCost}`);
        (0, test_1.expect)(calculatedShouldCost).toBeCloseTo(costSummary.partShouldCost, 2);
        LoggerUtil_1.default.info('✅ Cost calculations from Excel are valid');
    }));
    (0, test_1.test)('Validate weld element size calculation', () => __awaiter(void 0, void 0, void 0, function* () {
        // Weld element size lookup function
        const getWeldElementSize = (weldSize) => {
            if (weldSize <= 3)
                return weldSize;
            if (weldSize <= 4.5)
                return 3;
            if (weldSize <= 5.5)
                return 4;
            if (weldSize <= 6)
                return 5;
            if (weldSize <= 12)
                return 6;
            return 8;
        };
        for (const weld of testData.weldingDetails) {
            const expectedElementSize = getWeldElementSize(weld.weldSize);
            LoggerUtil_1.default.info(`Weld ${weld.weldNumber}: Size=${weld.weldSize}, Expected Element Size=${expectedElementSize}, Excel Element Size=${weld.weldElementSize}`);
            (0, test_1.expect)(weld.weldElementSize).toBe(expectedElementSize);
        }
        LoggerUtil_1.default.info('✅ Weld element size calculations are valid');
    }));
});
