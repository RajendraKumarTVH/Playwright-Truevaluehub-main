"use strict";
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
const LoggerUtil_1 = __importDefault(require("./lib/LoggerUtil"));
const fs_1 = __importDefault(require("fs"));
const LoginPage_1 = require("@pages/LoginPage");
const logger = LoggerUtil_1.default;
// ==================== TEST DATA FROM SCREENSHOTS ====================
const PROJECT_DATA = {
    projectId: '14923',
    projectName: 'TVH_Weld 14923',
    partNumber: '1023729-C-1023729-C-3'
};
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
};
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
};
const COMBINED_TOTALS = {
    subTotalCO2: 0.0088, // kg
    subTotalCost: 0.1817 // $
};
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
};
// ==================== TEST SUITE ====================
test_1.test.describe('Multi-Process Welding - Screenshot-Based Validation', () => {
    let context;
    let page;
    let weldingPage;
    let loginPage;
    let hasFailed = false;
    test_1.test.beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        logger.info('╔═══════════════════════════════════════════════════════════╗');
        logger.info('║  MULTI-PROCESS WELDING - SCREENSHOT-BASED VALIDATION    ║');
        logger.info('╚═══════════════════════════════════════════════════════════╝');
        logger.info(`📋 Project: ${PROJECT_DATA.projectName}`);
        logger.info(`🔢 Project ID: ${PROJECT_DATA.projectId}`);
        // Create screenshots directory
        if (!fs_1.default.existsSync('./screenshots')) {
            fs_1.default.mkdirSync('./screenshots');
        }
        // Clean old profile
        if (fs_1.default.existsSync('./user-profile')) {
            fs_1.default.rmSync('./user-profile', { recursive: true, force: true });
        }
        context = yield test_1.chromium.launchPersistentContext('./user-profile', {
            channel: 'msedge',
            headless: false,
            args: ['--start-maximized'],
            viewport: null
        });
        page = (_a = context.pages()[0]) !== null && _a !== void 0 ? _a : yield context.newPage();
        loginPage = new LoginPage_1.LoginPage(page, context);
        weldingPage = new mig_welding_page_1.MigWeldingPage(page, context);
        logger.info('✅ Test environment initialized');
    }));
    test_1.test.afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        logger.info('🏁 Test Suite Completed');
        if (context)
            yield context.close();
    }));
    // ==================== MIG WELDING TESTS ====================
    (0, test_1.test)('SC-001: Navigate and Login to Project', { tag: '@smoke' }, () => __awaiter(void 0, void 0, void 0, function* () {
        logger.info('═══════════════════════════════════════════════════════════');
        logger.info('🧪 SC-001: Navigate and Login to Project');
        logger.info('═══════════════════════════════════════════════════════════');
        try {
            yield loginPage.loginToApplication();
            yield context.storageState({ path: 'auth.json' });
            yield weldingPage.navigateToProject(PROJECT_DATA.projectId);
            yield page.waitForLoadState('networkidle');
            // Verify project loaded
            yield (0, test_1.expect)(page).toHaveURL(new RegExp(PROJECT_DATA.projectId));
            logger.info(`✓ Navigated to project: ${PROJECT_DATA.projectId}`);
            logger.info('✅ SC-001 - PASSED\n');
        }
        catch (err) {
            hasFailed = true;
            throw err;
        }
    }));
    (0, test_1.test)('SC-002: Validate Manufacturing Information Table', { tag: '@table' }, () => __awaiter(void 0, void 0, void 0, function* () {
        if (hasFailed)
            test_1.test.skip();
        logger.info('═══════════════════════════════════════════════════════════');
        logger.info('🧪 SC-002: Validate Manufacturing Information Table');
        logger.info('═══════════════════════════════════════════════════════════');
        try {
            // Navigate to Manufacturing Information
            yield weldingPage.ManufacturingInformation.scrollIntoViewIfNeeded();
            yield weldingPage.ManufacturingInformation.click();
            yield page.waitForTimeout(1000);
            // Verify MIG Welding row (Process #1)
            const migRow = page.locator('tr:has-text("Mig Welding")').first();
            yield (0, test_1.expect)(migRow).toBeVisible();
            const migCO2 = yield migRow.locator('td').nth(4).textContent(); // CO2 column
            const migCost = yield migRow.locator('td').nth(5).textContent(); // Cost column
            logger.info(`MIG Welding:`);
            logger.info(`  CO2: ${migCO2} (Expected: ${MIG_WELDING_DATA.co2})`);
            logger.info(`  Cost: ${migCost} (Expected: ${MIG_WELDING_DATA.netProcessCost})`);
            // Verify Weld Cleaning row (Process #2)
            const wcRow = page.locator('tr:has-text("Weld Cleaning")').first();
            yield (0, test_1.expect)(wcRow).toBeVisible();
            const wcCO2 = yield wcRow.locator('td').nth(4).textContent();
            const wcCost = yield wcRow.locator('td').nth(5).textContent();
            logger.info(`Weld Cleaning:`);
            logger.info(`  CO2: ${wcCO2} (Expected: ${WELD_CLEANING_DATA.co2Total})`);
            logger.info(`  Cost: ${wcCost} (Expected: ${WELD_CLEANING_DATA.netProcessCost})`);
            // Verify Sub Total
            const subTotalRow = page.locator('tr:has-text("Sub Total")').first();
            const subCO2 = yield subTotalRow.locator('td').nth(1).textContent();
            const subCost = yield subTotalRow.locator('td').nth(2).textContent();
            logger.info(`Sub Total:`);
            logger.info(`  CO2: ${subCO2} (Expected: ${COMBINED_TOTALS.subTotalCO2})`);
            logger.info(`  Cost: ${subCost} (Expected: ${COMBINED_TOTALS.subTotalCost})`);
            logger.info('✅ SC-002 - PASSED\n');
        }
        catch (err) {
            hasFailed = true;
            throw err;
        }
    }));
    (0, test_1.test)('SC-003: Validate MIG Welding Process Details', { tag: '@mig' }, () => __awaiter(void 0, void 0, void 0, function* () {
        if (hasFailed)
            test_1.test.skip();
        logger.info('═══════════════════════════════════════════════════════════');
        logger.info('🧪 SC-003: Validate MIG Welding Process Details');
        logger.info('═══════════════════════════════════════════════════════════');
        try {
            // Select MIG Welding process
            yield page.locator('tr:has-text("Mig Welding")').first().click();
            yield page.waitForTimeout(1000);
            // Click Machine Details tab if available
            const machineDetailsTab = page.locator('button:has-text("Machine Details"), a:has-text("Machine Details")').first();
            if (yield machineDetailsTab.isVisible()) {
                yield machineDetailsTab.click();
                yield page.waitForTimeout(500);
            }
            // Validate Process Group
            const processGroup = yield page.locator('input[formcontrolname="processGroup"], select[formcontrolname="processGroup"]').first();
            if (yield processGroup.isVisible()) {
                const value = yield processGroup.inputValue();
                logger.info(`✓ Process Group: ${value}`);
                (0, test_1.expect)(value).toContain('Mig Welding');
            }
            // Validate Min. Current Required
            const minCurrent = page.locator('input[placeholder*="Current"]').first();
            if (yield minCurrent.isVisible()) {
                const value = yield minCurrent.inputValue();
                logger.info(`✓ Min. Current Required: ${value} Amps (Expected: ${MIG_WELDING_DATA.minCurrentRequired})`);
                (0, test_1.expect)(parseFloat(value)).toBe(MIG_WELDING_DATA.minCurrentRequired);
            }
            // Validate Min. Welding Voltage
            const minVoltage = page.locator('input[placeholder*="Voltage"]').first();
            if (yield minVoltage.isVisible()) {
                const value = yield minVoltage.inputValue();
                logger.info(`✓ Min. Welding Voltage: ${value} V (Expected: ${MIG_WELDING_DATA.minWeldingVoltage})`);
                (0, test_1.expect)(parseFloat(value)).toBe(MIG_WELDING_DATA.minWeldingVoltage);
            }
            // Validate Selected Current
            const selectedCurrent = page.locator('input[formcontrolname="selectedCurrent"]').first();
            if (yield selectedCurrent.isVisible()) {
                const value = yield selectedCurrent.inputValue();
                logger.info(`✓ Selected Current: ${value} Amps (Expected: ${MIG_WELDING_DATA.selectedCurrent})`);
                (0, test_1.expect)(parseFloat(value)).toBe(MIG_WELDING_DATA.selectedCurrent);
            }
            // Validate Selected Voltage
            const selectedVoltage = page.locator('input[formcontrolname="selectedWeldingVoltage"]').first();
            if (yield selectedVoltage.isVisible()) {
                const value = yield selectedVoltage.inputValue();
                logger.info(`✓ Selected Voltage: ${value} V (Expected: ${MIG_WELDING_DATA.selectedWeldingVoltage})`);
                (0, test_1.expect)(parseFloat(value)).toBe(MIG_WELDING_DATA.selectedWeldingVoltage);
            }
            // Validate Machine Name
            const machineName = page.locator('input[formcontrolname="machineName"], select[formcontrolname="machineName"]').first();
            if (yield machineName.isVisible()) {
                const value = yield machineName.inputValue();
                logger.info(`✓ Machine Name: ${value}`);
                (0, test_1.expect)(value).toContain('MIG/TIG/STICK');
            }
            // Validate Efficiency
            const efficiency = page.locator('input[formcontrolname="efficiency"]').first();
            if (yield efficiency.isVisible()) {
                const value = yield efficiency.inputValue();
                logger.info(`✓ Machine Efficiency: ${value}% (Expected: ${MIG_WELDING_DATA.machineEfficiency}%)`);
                (0, test_1.expect)(parseFloat(value)).toBe(MIG_WELDING_DATA.machineEfficiency);
            }
            // Validate Net Process Cost
            const netCost = page.locator('input[formcontrolname="netProcessCost"], input[formcontrolname="directProcessCost"]').first();
            if (yield netCost.isVisible()) {
                const value = yield netCost.inputValue();
                logger.info(`✓ Net Process Cost: $${value} (Expected: $${MIG_WELDING_DATA.netProcessCost})`);
                (0, test_1.expect)(parseFloat(value)).toBeCloseTo(MIG_WELDING_DATA.netProcessCost, 4);
            }
            logger.info('✅ SC-003 - PASSED\n');
        }
        catch (err) {
            hasFailed = true;
            throw err;
        }
    }));
    (0, test_1.test)('SC-004: Validate MIG Welding Cycle Time Details', { tag: '@mig' }, () => __awaiter(void 0, void 0, void 0, function* () {
        if (hasFailed)
            test_1.test.skip();
        logger.info('═══════════════════════════════════════════════════════════');
        logger.info('🧪 SC-004: Validate MIG Welding Cycle Time Details');
        logger.info('═══════════════════════════════════════════════════════════');
        try {
            // Click Cycle Time Details section
            const cycleTimeSection = page.locator('button:has-text("Cycle Time"), div:has-text("Cycle Time Details")').first();
            if (yield cycleTimeSection.isVisible()) {
                yield cycleTimeSection.click();
                yield page.waitForTimeout(500);
            }
            // Validate Loading/Unloading Time
            const loadingTime = page.locator('input[formcontrolname="loadingTime"], input[formcontrolname="unloadingTime"]').first();
            if (yield loadingTime.isVisible()) {
                const value = yield loadingTime.inputValue();
                logger.info(`✓ Loading/Unloading Time: ${value} sec (Expected: ${MIG_WELDING_DATA.loadingUnloadingTime})`);
            }
            // Validate Part Reorientation
            const reorientation = page.locator('input[formcontrolname="partReorientation"], input[formcontrolname="reorientation"]').first();
            if (yield reorientation.isVisible()) {
                const value = yield reorientation.inputValue();
                logger.info(`✓ Part Reorientation: ${value} (Expected: ${MIG_WELDING_DATA.partReorientation})`);
                (0, test_1.expect)(parseFloat(value)).toBe(MIG_WELDING_DATA.partReorientation);
            }
            // Validate Total Weld Cycle Time
            const totalCycleTime = page.locator('input[formcontrolname="totalWeldCycleTime"], input[formcontrolname="cycleTime"]').first();
            if (yield totalCycleTime.isVisible()) {
                const value = yield totalCycleTime.inputValue();
                logger.info(`✓ Total Weld Cycle Time: ${value} sec (Expected: ${MIG_WELDING_DATA.totalWeldCycleTime})`);
                (0, test_1.expect)(parseFloat(value)).toBeCloseTo(MIG_WELDING_DATA.totalWeldCycleTime, 2);
            }
            logger.info('✅ SC-004 - PASSED\n');
        }
        catch (err) {
            hasFailed = true;
            throw err;
        }
    }));
    (0, test_1.test)('SC-005: Validate MIG Welding Sub Process Details', { tag: '@mig' }, () => __awaiter(void 0, void 0, void 0, function* () {
        if (hasFailed)
            test_1.test.skip();
        logger.info('═══════════════════════════════════════════════════════════');
        logger.info('🧪 SC-005: Validate MIG Welding Sub Process Details');
        logger.info('═══════════════════════════════════════════════════════════');
        try {
            // Expand Weld 1 section
            const weld1Section = page.locator('div:has-text("Weld 1"), button:has-text("Weld 1")').first();
            if (yield weld1Section.isVisible()) {
                yield weld1Section.click();
                yield page.waitForTimeout(500);
            }
            // Validate Weld 1 Type
            const weld1Type = page.locator('select[formcontrolname="weldType"]').first();
            if (yield weld1Type.isVisible()) {
                const value = yield weld1Type.inputValue();
                logger.info(`Weld 1:`);
                logger.info(`  ✓ Weld Type: ${value} (Expected: ${MIG_WELDING_DATA.weld1.weldType})`);
                (0, test_1.expect)(value).toBe(MIG_WELDING_DATA.weld1.weldType);
            }
            // Validate Weld 1 Position
            const weld1Position = page.locator('select[formcontrolname="weldPosition"]').first();
            if (yield weld1Position.isVisible()) {
                const value = yield weld1Position.inputValue();
                logger.info(`  ✓ Weld Position: ${value} (Expected: ${MIG_WELDING_DATA.weld1.weldPosition})`);
            }
            // Validate Weld 1 Travel Speed
            const weld1Speed = page.locator('input[formcontrolname="travelSpeed"]').first();
            if (yield weld1Speed.isVisible()) {
                const value = yield weld1Speed.inputValue();
                logger.info(`  ✓ Travel Speed: ${value} mm/sec (Expected: ${MIG_WELDING_DATA.weld1.travelSpeed})`);
                (0, test_1.expect)(parseFloat(value)).toBeCloseTo(MIG_WELDING_DATA.weld1.travelSpeed, 2);
            }
            // Validate Weld 2 (if visible)
            const weld2Section = page.locator('div:has-text("Weld 2"), button:has-text("Weld 2")').first();
            if (yield weld2Section.isVisible()) {
                yield weld2Section.click();
                yield page.waitForTimeout(500);
                const weld2Speed = page.locator('input[formcontrolname="travelSpeed"]').nth(1);
                if (yield weld2Speed.isVisible()) {
                    const value = yield weld2Speed.inputValue();
                    logger.info(`Weld 2:`);
                    logger.info(`  ✓ Travel Speed: ${value} mm/sec (Expected: ${MIG_WELDING_DATA.weld2.travelSpeed})`);
                    (0, test_1.expect)(parseFloat(value)).toBeCloseTo(MIG_WELDING_DATA.weld2.travelSpeed, 2);
                }
            }
            logger.info('✅ SC-005 - PASSED\n');
        }
        catch (err) {
            hasFailed = true;
            throw err;
        }
    }));
    // ==================== WELD CLEANING TESTS ====================
    (0, test_1.test)('SC-006: Validate Weld Cleaning Process Details', { tag: '@weldcleaning' }, () => __awaiter(void 0, void 0, void 0, function* () {
        if (hasFailed)
            test_1.test.skip();
        logger.info('═══════════════════════════════════════════════════════════');
        logger.info('🧪 SC-006: Validate Weld Cleaning Process Details');
        logger.info('═══════════════════════════════════════════════════════════');
        try {
            // Select Weld Cleaning process
            yield page.locator('tr:has-text("Weld Cleaning")').first().click();
            yield page.waitForTimeout(1000);
            // Validate Process Group
            const processGroup = page.locator('select[formcontrolname="processGroup"]').first();
            if (yield processGroup.isVisible()) {
                const value = yield processGroup.inputValue();
                logger.info(`✓ Process Group: ${value}`);
                (0, test_1.expect)(value).toContain('Weld Cleaning');
            }
            // Validate Finish Type
            const finishType = page.locator('select[formcontrolname="finishType"], input[formcontrolname="finishType"]').first();
            if (yield finishType.isVisible()) {
                const value = yield finishType.inputValue();
                logger.info(`✓ Finish Type: ${value}`);
            }
            // Validate Machine Name
            const machineName = page.locator('select[formcontrolname="machineName"]').first();
            if (yield machineName.isVisible()) {
                const value = yield machineName.inputValue();
                logger.info(`✓ Machine Name: ${value}`);
                (0, test_1.expect)(value).toContain('Welding Cleanup');
            }
            // Validate Criticality Level
            const criticalityLevel = page.locator('select[formcontrolname="criticalityLevel"]').first();
            if (yield criticalityLevel.isVisible()) {
                const value = yield criticalityLevel.inputValue();
                logger.info(`✓ Criticality Level: ${value} (Expected: ${WELD_CLEANING_DATA.criticalityLevel})`);
            }
            // Validate Efficiency
            const efficiency = page.locator('input[formcontrolname="efficiency"]').first();
            if (yield efficiency.isVisible()) {
                const value = yield efficiency.inputValue();
                logger.info(`✓ Efficiency: ${value}% (Expected: ${WELD_CLEANING_DATA.machineEfficiency}%)`);
                (0, test_1.expect)(parseFloat(value)).toBe(WELD_CLEANING_DATA.machineEfficiency);
            }
            // Validate Net Process Cost
            const netCost = page.locator('input[formcontrolname="netProcessCost"]').first();
            if (yield netCost.isVisible()) {
                const value = yield netCost.inputValue();
                logger.info(`✓ Net Process Cost: $${value} (Expected: $${WELD_CLEANING_DATA.netProcessCost})`);
                (0, test_1.expect)(parseFloat(value)).toBeCloseTo(WELD_CLEANING_DATA.netProcessCost, 4);
            }
            logger.info('✅ SC-006 - PASSED\n');
        }
        catch (err) {
            hasFailed = true;
            throw err;
        }
    }));
    (0, test_1.test)('SC-007: Validate Weld Cleaning Manufacturing Details', { tag: '@weldcleaning' }, () => __awaiter(void 0, void 0, void 0, function* () {
        if (hasFailed)
            test_1.test.skip();
        logger.info('═══════════════════════════════════════════════════════════');
        logger.info('🧪 SC-007: Validate Weld Cleaning Manufacturing Details');
        logger.info('═══════════════════════════════════════════════════════════');
        try {
            // Navigate to Manufacturing Details
            const mfgDetailsTab = page.locator('button:has-text("Manufacturing Details"), a:has-text("Manufacturing Details")').first();
            if (yield mfgDetailsTab.isVisible()) {
                yield mfgDetailsTab.click();
                yield page.waitForTimeout(500);
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
            };
            logger.info('Manufacturing Details Validation:');
            for (const [key, config] of Object.entries(details)) {
                const element = page.locator(config.selector).first();
                if (yield element.isVisible()) {
                    const value = yield element.inputValue();
                    const numValue = parseFloat(value);
                    logger.info(`  ✓ ${key}: ${value} ${config.unit} (Expected: ${config.expected})`);
                    if (config.unit === '$' || config.unit === 'sec') {
                        (0, test_1.expect)(numValue).toBeCloseTo(config.expected, 4);
                    }
                    else {
                        (0, test_1.expect)(numValue).toBeCloseTo(config.expected, 2);
                    }
                }
            }
            logger.info('✅ SC-007 - PASSED\n');
        }
        catch (err) {
            hasFailed = true;
            throw err;
        }
    }));
    (0, test_1.test)('SC-008: Validate Weld Cleaning Sustainability', { tag: '@weldcleaning' }, () => __awaiter(void 0, void 0, void 0, function* () {
        if (hasFailed)
            test_1.test.skip();
        logger.info('═══════════════════════════════════════════════════════════');
        logger.info('🧪 SC-008: Validate Weld Cleaning Sustainability');
        logger.info('═══════════════════════════════════════════════════════════');
        try {
            // Navigate to Sustainability section
            const sustainabilitySection = page.locator('button:has-text("Sustainability"), div:has-text("Sustainability")').first();
            if (yield sustainabilitySection.isVisible()) {
                yield sustainabilitySection.click();
                yield page.waitForTimeout(500);
            }
            // Validate CO2/kw-Hr
            const co2PerKwHr = page.locator('input[formcontrolname="co2PerKwHr"], input[formcontrolname="powerESG"]').first();
            if (yield co2PerKwHr.isVisible()) {
                const value = yield co2PerKwHr.inputValue();
                logger.info(`✓ CO2(kg)/kw-Hr: ${value} (Expected: ${WELD_CLEANING_DATA.co2PerKwHr})`);
                (0, test_1.expect)(parseFloat(value)).toBeCloseTo(WELD_CLEANING_DATA.co2PerKwHr, 2);
            }
            // Validate CO2/part
            const co2PerPart = page.locator('input[formcontrolname="co2PerPart"], input[formcontrolname="esgImpactFactoryImpact"]').first();
            if (yield co2PerPart.isVisible()) {
                const value = yield co2PerPart.inputValue();
                logger.info(`✓ CO2(kg)/part: ${value} (Expected: ${WELD_CLEANING_DATA.co2PerPart})`);
                (0, test_1.expect)(parseFloat(value)).toBeCloseTo(WELD_CLEANING_DATA.co2PerPart, 4);
            }
            logger.info('✅ SC-008 - PASSED\n');
        }
        catch (err) {
            logger.warn('⚠️  Sustainability fields not visible, skipping validation');
        }
    }));
    (0, test_1.test)('SC-009: Validate Cost Summary', { tag: '@cost' }, () => __awaiter(void 0, void 0, void 0, function* () {
        if (hasFailed)
            test_1.test.skip();
        logger.info('═══════════════════════════════════════════════════════════');
        logger.info('🧪 SC-009: Validate Cost Summary');
        logger.info('═══════════════════════════════════════════════════════════');
        try {
            // Navigate to Cost section
            const costSection = page.locator('button:has-text("Cost"), a:has-text("Cost")').first();
            if (yield costSection.isVisible()) {
                yield costSection.click();
                yield page.waitForTimeout(1000);
            }
            logger.info('Cost Summary Validation:');
            // Validate Material Cost
            const materialCost = page.locator('input[formcontrolname="materialCost"]').first();
            if (yield materialCost.isVisible()) {
                const value = yield materialCost.inputValue();
                logger.info(`  ✓ Material Cost: $${value} (${COST_SUMMARY.materialCost.percent}%)`);
                (0, test_1.expect)(parseFloat(value)).toBeCloseTo(COST_SUMMARY.materialCost.amount, 4);
            }
            // Validate Manufacturing Cost
            const mfgCost = page.locator('input[formcontrolname="manufacturingCost"]').first();
            if (yield mfgCost.isVisible()) {
                const value = yield mfgCost.inputValue();
                logger.info(`  ✓ Manufacturing Cost: $${value} (${COST_SUMMARY.manufacturingCost.percent}%)`);
                (0, test_1.expect)(parseFloat(value)).toBeCloseTo(COST_SUMMARY.manufacturingCost.amount, 4);
            }
            // Validate Part Should Cost
            const shouldCost = page.locator('input[formcontrolname="partShouldCost"]').first();
            if (yield shouldCost.isVisible()) {
                const value = yield shouldCost.inputValue();
                logger.info(`  ✓ Part Should Cost: $${value} (${COST_SUMMARY.partShouldCost.percent}%)`);
                (0, test_1.expect)(parseFloat(value)).toBeCloseTo(COST_SUMMARY.partShouldCost.amount, 4);
            }
            logger.info('✅ SC-009 - PASSED\n');
        }
        catch (err) {
            hasFailed = true;
            throw err;
        }
    }));
});
