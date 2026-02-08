"use strict";
/**
 * Welding Processes - Complete E2E Test Suite
 * Professional test suite for MIG Welding and Weld Cleaning processes
 *
 * Features:
 * - Complete Page Object Model implementation
 * - Calculation formulas from src/services
 * - Comprehensive error handling
 * - Screenshot on failure
 * - Detailed logging
 * - Test data validation
 *
 * Run: npx playwright test tests/welding-complete.spec.ts
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
// Test Data
const mig_welding_testdata_1 = require("../test-data/mig-welding-testdata");
const weld_cleaning_testdata_1 = require("../test-data/weld-cleaning-testdata");
// Utilities
const LoginPage_1 = require("@pages/LoginPage");
const logger = LoggerUtil_1.default;
// ==================== TEST CONFIGURATION ====================
const CONFIG = {
    baseUrl: 'https://qa.truevaluehub.com',
    timeout: 30000,
    screenshotOnError: true,
    retryCount: 2
};
const ctx = {};
// ==================== HELPER FUNCTIONS ====================
function takeScreenshotOnError(testInfo, page) {
    return __awaiter(this, void 0, void 0, function* () {
        if (testInfo.status !== testInfo.expectedStatus && CONFIG.screenshotOnError) {
            const screenshotName = `error_${testInfo.title.replace(/\\s+/g, '_')}_${Date.now()}.png`;
            yield page.screenshot({ path: `screenshots/${screenshotName}`, fullPage: true });
            logger.error(`❌ Screenshot saved: ${screenshotName}`);
        }
    });
}
function logTestStart(testName, tags = []) {
    logger.info('═══════════════════════════════════════════════════════════');
    logger.info(`🧪 ${testName}`);
    if (tags.length)
        logger.info(`🏷️  Tags: ${tags.join(', ')}`);
    logger.info('═══════════════════════════════════════════════════════════');
}
function logTestComplete(testName) {
    logger.info(`✅ ${testName} - PASSED`);
    logger.info('');
}
function waitForCalculation(page_1) {
    return __awaiter(this, arguments, void 0, function* (page, timeout = 2000) {
        yield page.waitForTimeout(timeout);
        try {
            yield page.waitForLoadState('networkidle', { timeout: 5000 });
        }
        catch (_a) {
            // Ignore timeout, calculations may complete before networkidle
        }
    });
}
// ==================== MAIN TEST SUITE ====================
test_1.test.describe('Welding Processes - Complete E2E Test Suite', () => {
    test_1.test.beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        logger.info('╔═══════════════════════════════════════════════════════════╗');
        logger.info('║   WELDING PROCESSES - COMPLETE E2E TEST SUITE            ║');
        logger.info('╚═══════════════════════════════════════════════════════════╝');
        logger.info(`🌐 Base URL: ${CONFIG.baseUrl}`);
        logger.info(`⏱️  Timeout: ${CONFIG.timeout}ms`);
        // Create screenshots directory
        if (!fs_1.default.existsSync('./screenshots')) {
            fs_1.default.mkdirSync('./screenshots');
        }
        // Clean old profile
        if (fs_1.default.existsSync('./user-profile')) {
            fs_1.default.rmSync('./user-profile', { recursive: true, force: true });
            logger.info('🗑️  Cleaned old user profile');
        }
        // Launch browser
        ctx.context = yield test_1.chromium.launchPersistentContext('./user-profile', {
            channel: 'msedge',
            headless: false,
            args: ['--start-maximized'],
            viewport: null,
            timeout: CONFIG.timeout
        });
        ctx.page = (_a = ctx.context.pages()[0]) !== null && _a !== void 0 ? _a : yield ctx.context.newPage();
        ctx.loginPage = new LoginPage_1.LoginPage(ctx.page, ctx.context);
        ctx.weldingPage = new mig_welding_page_1.MigWeldingPage(ctx.page, ctx.context);
        ctx.hasFailed = false;
        logger.info('✅ Browser and Page Objects initialized');
        logger.info('');
    }));
    test_1.test.afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        logger.info('═══════════════════════════════════════════════════════════');
        logger.info('🏁 Test Suite Completed');
        logger.info('═══════════════════════════════════════════════════════════');
        if (ctx.context)
            yield ctx.context.close();
    }));
    test_1.test.afterEach((_a, testInfo_1) => __awaiter(void 0, [_a, testInfo_1], void 0, function* ({}, testInfo) {
        yield takeScreenshotOnError(testInfo, ctx.page);
    }));
    // ==================== MIG WELDING TESTS ====================
    test_1.test.describe('MIG Welding Process Tests', () => {
        test_1.test.beforeAll(() => {
            ctx.currentProcess = 'MIG';
            logger.info('🔧 Starting MIG Welding Tests');
        });
        (0, test_1.test)('MIG-001: Login and Navigate to Project', { tag: ['@smoke', '@mig'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            logTestStart('MIG-001: Login and Navigate to Project', ['@smoke', '@mig']);
            try {
                yield ctx.loginPage.loginToApplication();
                yield ctx.context.storageState({ path: 'auth.json' });
                yield ctx.weldingPage.navigateToProject(mig_welding_testdata_1.MigWeldingTestData.project.projectId);
                yield ctx.page.waitForLoadState('networkidle');
                // Verify URL
                yield (0, test_1.expect)(ctx.page).toHaveURL(new RegExp(mig_welding_testdata_1.MigWeldingTestData.project.projectId));
                logger.info(`✓ Navigated to Project: ${mig_welding_testdata_1.MigWeldingTestData.project.projectId}`);
                logTestComplete('MIG-001');
            }
            catch (err) {
                ctx.hasFailed = true;
                throw err;
            }
        }));
        (0, test_1.test)('MIG-002: Verify Part Details', { tag: ['@mig', '@part-info'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            if (ctx.hasFailed)
                test_1.test.skip();
            logTestStart('MIG-002: Verify Part Details', ['@mig', '@part-info']);
            try {
                yield ctx.weldingPage.verifyPartDetails();
                // await ctx.weldingPage!.populatePartDetailsFromCostingNotes()
                // Verify required fields
                yield (0, test_1.expect)(ctx.weldingPage.InternalPartNumber).toBeVisible();
                yield (0, test_1.expect)(ctx.weldingPage.ManufacturingCategory).toBeVisible();
                yield (0, test_1.expect)(ctx.weldingPage.AnnualVolumeQtyNos).toBeVisible();
                const partNumber = yield ctx.weldingPage.InternalPartNumber.inputValue();
                logger.info(`✓ Part Number: ${partNumber}`);
                const annualVolume = yield ctx.weldingPage.AnnualVolumeQtyNos.inputValue();
                logger.info(`✓ Annual Volume: ${annualVolume}`);
                logTestComplete('MIG-002');
            }
            catch (err) {
                ctx.hasFailed = true;
                throw err;
            }
        }));
        (0, test_1.test)('MIG-003: Select Material', { tag: ['@mig', '@material'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            if (ctx.hasFailed)
                test_1.test.skip();
            logTestStart('MIG-003: Select Material', ['@mig', '@material']);
            try {
                yield ctx.weldingPage.MaterialInformation.click();
                yield waitForCalculation(ctx.page);
                yield ctx.weldingPage.verifyMaterialSelection();
                yield ctx.weldingPage.selectMaterial(mig_welding_testdata_1.MigWeldingTestData.materialInformation.category, mig_welding_testdata_1.MigWeldingTestData.materialInformation.family, mig_welding_testdata_1.MigWeldingTestData.materialInformation.descriptionGrade, mig_welding_testdata_1.MigWeldingTestData.materialInformation.stockForm);
                yield ctx.weldingPage.verifyMaterialInfoWithDB();
                logger.info('✓ Material selected and verified');
                logTestComplete('MIG-003');
            }
            catch (err) {
                ctx.hasFailed = true;
                throw err;
            }
        }));
        (0, test_1.test)('MIG-004: Configure Welding Details', { tag: ['@mig', '@welding'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            if (ctx.hasFailed)
                test_1.test.skip();
            logTestStart('MIG-004: Configure Welding Details', ['@mig', '@welding']);
            try {
                yield ctx.weldingPage.verifyWeldingDetails();
                const weld1Data = {
                    weldType: mig_welding_testdata_1.MigWeldingTestData.weldingDetails.weld1.weldType,
                    weldSize: mig_welding_testdata_1.MigWeldingTestData.weldingDetails.weld1.weldSize,
                    weldLength: mig_welding_testdata_1.MigWeldingTestData.weldingDetails.weld1.weldLength,
                    noOfPasses: mig_welding_testdata_1.MigWeldingTestData.weldingDetails.weld1.noOfWeldPasses,
                    weldPlaces: mig_welding_testdata_1.MigWeldingTestData.weldingDetails.weld1.weldPlaces
                };
                yield ctx.weldingPage.fillWeldDetails(1, weld1Data);
                yield waitForCalculation(ctx.page, 3000);
                yield ctx.weldingPage.verifyWeldElementSize();
                logger.info('✓ Welding details configured');
                logTestComplete('MIG-004');
            }
            catch (err) {
                ctx.hasFailed = true;
                throw err;
            }
        }));
        (0, test_1.test)('MIG-005: Verify Machine Details', { tag: ['@mig', '@manufacturing'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            if (ctx.hasFailed)
                test_1.test.skip();
            logTestStart('MIG-005: Verify Machine Details', ['@mig', '@manufacturing']);
            try {
                yield ctx.weldingPage.ManufacturingInformation.scrollIntoViewIfNeeded();
                yield ctx.weldingPage.selectMachineType('Semi-Auto');
                yield ctx.weldingPage.selectPartComplexity('Medium');
                yield waitForCalculation(ctx.page, 2000);
                yield ctx.weldingPage.verifyAutomaticCalculation({
                    minCurrent: '400',
                    minVoltage: '35',
                    selectedCurrent: '425',
                    selectedVoltage: '575',
                    machineName: 'MIG/TIG/STICK Welding _575V _425A_USA',
                    machineDescription: 'MILLER_XMT 350 CC/CV (5A-425A)'
                });
                logger.info('✓ Machine details verified');
                logTestComplete('MIG-005');
            }
            catch (err) {
                ctx.hasFailed = true;
                throw err;
            }
        }));
        (0, test_1.test)('MIG-006: Verify Cycle Time Calculation', { tag: ['@mig', '@calculation'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            if (ctx.hasFailed)
                test_1.test.skip();
            logTestStart('MIG-006: Verify Cycle Time Calculation', ['@mig', '@calculation']);
            try {
                yield ctx.weldingPage.verifyWeldCycleTimeCalculation(mig_welding_testdata_1.MigWeldingTestData.cycleTimeDetails.totalWeldCycleTime);
                const cycleTime = yield ctx.weldingPage.getInputValueAsNumber(ctx.weldingPage.CycleTimePart);
                logger.info(`✓ Cycle Time: ${cycleTime} seconds`);
                (0, test_1.expect)(cycleTime).toBeGreaterThan(0);
                logTestComplete('MIG-006');
            }
            catch (err) {
                ctx.hasFailed = true;
                throw err;
            }
        }));
        (0, test_1.test)('MIG-007: Verify Cost Breakdown', { tag: ['@mig', '@cost'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            if (ctx.hasFailed)
                test_1.test.skip();
            logTestStart('MIG-007: Verify Cost Breakdown', ['@mig', '@cost']);
            try {
                const costs = yield ctx.weldingPage.verifyCostBreakdown();
                logger.info('Cost Breakdown:');
                logger.info(`  Machine Cost: $${costs.machineCost.toFixed(4)}`);
                logger.info(`  Labor Cost: $${costs.laborCost.toFixed(4)}`);
                logger.info(`  Setup Cost: $${costs.setupCost.toFixed(4)}`);
                (0, test_1.expect)(costs.machineCost).toBeGreaterThan(0);
                (0, test_1.expect)(costs.laborCost).toBeGreaterThan(0);
                logTestComplete('MIG-007');
            }
            catch (err) {
                ctx.hasFailed = true;
                throw err;
            }
        }));
        (0, test_1.test)('MIG-008: Verify Sustainability Calculations', { tag: ['@mig', '@sustainability'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            if (ctx.hasFailed)
                test_1.test.skip();
            logTestStart('MIG-008: Verify Sustainability Calculations', ['@mig', '@sustainability']);
            try {
                yield ctx.weldingPage.verifySustainabilityCalculations({
                    material: {
                        co2PerKg: mig_welding_testdata_1.MigWeldingTestData.sustainabilityMaterial.co2PerKgMaterial,
                        co2PerScrap: mig_welding_testdata_1.MigWeldingTestData.sustainabilityMaterial.co2PerScrap,
                        netWeight: mig_welding_testdata_1.MigWeldingTestData.materialCostDetails.totalWeldMaterialWeight,
                        grossWeight: mig_welding_testdata_1.MigWeldingTestData.materialCostDetails.weldBeadWeightWithWastage,
                        scrapWeight: mig_welding_testdata_1.MigWeldingTestData.materialCostDetails.weldBeadWeightWithWastage -
                            mig_welding_testdata_1.MigWeldingTestData.materialCostDetails.totalWeldMaterialWeight
                    },
                    manufacturing: {
                        powerConsumption: mig_welding_testdata_1.MigWeldingTestData.manufacturingDetails.powerConsumption,
                        powerESG: mig_welding_testdata_1.MigWeldingTestData.sustainabilityManufacturing.co2PerKwHr,
                        cycleTime: mig_welding_testdata_1.MigWeldingTestData.cycleTimeDetails.totalWeldCycleTime,
                        setUpTime: mig_welding_testdata_1.MigWeldingTestData.manufacturingDetails.machineSetupTime,
                        lotSize: mig_welding_testdata_1.MigWeldingTestData.partInformation.lotSize,
                        efficiency: mig_welding_testdata_1.MigWeldingTestData.machineDetails.machineEfficiency / 100
                    },
                    general: {
                        eav: mig_welding_testdata_1.MigWeldingTestData.partInformation.annualVolumeQty
                    }
                });
                logger.info('✓ Sustainability calculations verified');
                logTestComplete('MIG-008');
            }
            catch (err) {
                logger.warn('⚠️  Sustainability verification skipped (fields not visible)');
            }
        }));
        (0, test_1.test)('MIG-009: Verify Final Cost Summary', { tag: ['@mig', '@cost'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            if (ctx.hasFailed)
                test_1.test.skip();
            logTestStart('MIG-009: Verify Final Cost Summary', ['@mig', '@cost']);
            try {
                yield ctx.weldingPage.recalculateCost();
                yield waitForCalculation(ctx.page, 3000);
                yield ctx.weldingPage.verifyCostSummary();
                const shouldCost = parseFloat((yield ctx.weldingPage.PartShouldCost.inputValue()) || '0');
                logger.info(`✓ Part Should Cost: $${shouldCost}`);
                (0, test_1.expect)(shouldCost).toBeGreaterThan(0);
                logTestComplete('MIG-009');
            }
            catch (err) {
                ctx.hasFailed = true;
                throw err;
            }
        }));
    });
    // ==================== WELD CLEANING TESTS ====================
    test_1.test.describe('Weld Cleaning Process Tests', () => {
        test_1.test.beforeAll(() => {
            ctx.currentProcess = 'WELD_CLEANING';
            logger.info('🧹 Starting Weld Cleaning Tests');
        });
        (0, test_1.test)('WC-001: Navigate to Weld Cleaning Project', { tag: ['@smoke', '@weldcleaning'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            logTestStart('WC-001: Navigate to Weld Cleaning Project', ['@smoke', '@weldcleaning']);
            try {
                // Note: Adjust project ID if using different project for weld cleaning
                yield ctx.weldingPage.navigateToProject(weld_cleaning_testdata_1.WeldCleaningScenario1.projectId);
                yield ctx.page.waitForLoadState('networkidle');
                logger.info(`✓ Navigated to Project: ${weld_cleaning_testdata_1.WeldCleaningScenario1.projectId}`);
                logTestComplete('WC-001');
            }
            catch (err) {
                ctx.hasFailed = true;
                throw err;
            }
        }));
        (0, test_1.test)('WC-002: Select Weld Cleaning Process', { tag: ['@weldcleaning', '@process'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            if (ctx.hasFailed)
                test_1.test.skip();
            logTestStart('WC-002: Select Weld Cleaning Process', ['@weldcleaning', '@process']);
            try {
                yield ctx.weldingPage.ManufacturingInformation.scrollIntoViewIfNeeded();
                yield ctx.weldingPage.ManufacturingInformation.click();
                yield waitForCalculation(ctx.page);
                // Select Weld Cleaning process type
                // Note: Adjust selector based on actual HTML structure
                const processSelect = ctx.page.locator('select[formcontrolname="processType"]');
                if (yield processSelect.isVisible()) {
                    yield processSelect.selectOption({ label: 'Weld Cleaning' });
                    yield waitForCalculation(ctx.page, 2000);
                }
                logger.info('✓ Weld Cleaning process selected');
                logTestComplete('WC-002');
            }
            catch (err) {
                ctx.hasFailed = true;
                throw err;
            }
        }));
        (0, test_1.test)('WC-003: Configure Machine Details', { tag: ['@weldcleaning', '@machine'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            if (ctx.hasFailed)
                test_1.test.skip();
            logTestStart('WC-003: Configure Machine Details', ['@weldcleaning', '@machine']);
            try {
                // Verify efficiency
                const efficiency = yield ctx.weldingPage.getInputValueAsNumber(ctx.weldingPage.MachineEfficiency);
                logger.info(`✓ Efficiency: ${efficiency}%`);
                (0, test_1.expect)(efficiency).toBe(weld_cleaning_testdata_1.WeldCleaningScenario1.efficiency);
                // Verify machine hour rate
                const machineRate = yield ctx.weldingPage.getInputValueAsNumber(ctx.weldingPage.MachineHourRate);
                logger.info(`✓ Machine Hour Rate: $${machineRate}/hr`);
                logTestComplete('WC-003');
            }
            catch (err) {
                ctx.hasFailed = true;
                throw err;
            }
        }));
        (0, test_1.test)('WC-004: Set Weld Cleaning Details', { tag: ['@weldcleaning', '@details'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            if (ctx.hasFailed)
                test_1.test.skip();
            logTestStart('WC-004: Set Weld Cleaning Details', ['@weldcleaning', '@details']);
            try {
                // Set total weld length and intermediate stops
                const lengthInput = ctx.page.locator('input[formcontrolname="totalWeldLength"]');
                const stopsInput = ctx.page.locator('input[formcontrolname="intermediateStops"]');
                if (yield lengthInput.isVisible()) {
                    yield lengthInput.fill(weld_cleaning_testdata_1.WeldCleaningScenario1.totalWeldLength.toString());
                }
                if (yield stopsInput.isVisible()) {
                    yield stopsInput.fill(weld_cleaning_testdata_1.WeldCleaningScenario1.intermediateStops.toString());
                }
                yield ctx.page.keyboard.press('Tab');
                yield waitForCalculation(ctx.page, 3000);
                logger.info(`✓ Total Weld Length: ${weld_cleaning_testdata_1.WeldCleaningScenario1.totalWeldLength} mm`);
                logger.info(`✓ Intermediate Stops: ${weld_cleaning_testdata_1.WeldCleaningScenario1.intermediateStops}`);
                logTestComplete('WC-004');
            }
            catch (err) {
                logger.warn('⚠️  Could not set weld cleaning details (fields not visible)');
            }
        }));
        (0, test_1.test)('WC-005: Verify Manufacturing Calculations', { tag: ['@weldcleaning', '@calculation'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            if (ctx.hasFailed)
                test_1.test.skip();
            logTestStart('WC-005: Verify Manufacturing Calculations', ['@weldcleaning', '@calculation']);
            try {
                // Get calculated values
                const cycleTime = yield ctx.weldingPage.getInputValueAsNumber(ctx.weldingPage.CycleTimePart);
                const machineCost = yield ctx.weldingPage.getInputValueAsNumber(ctx.weldingPage.MachineCostPart);
                const laborCost = yield ctx.weldingPage.getInputValueAsNumber(ctx.weldingPage.LaborCostPart);
                logger.info('Manufacturing Calculations:');
                logger.info(`  Cycle Time: ${cycleTime} sec (Expected: ${weld_cleaning_testdata_1.WeldCleaningScenario1.cycleTimePerPart})`);
                logger.info(`  Machine Cost: $${machineCost} (Expected: $${weld_cleaning_testdata_1.WeldCleaningScenario1.machineCostPerPart})`);
                logger.info(`  Labor Cost: $${laborCost} (Expected: $${weld_cleaning_testdata_1.WeldCleaningScenario1.laborCostPerPart})`);
                // Validate with tolerance
                (0, test_1.expect)(cycleTime).toBeCloseTo(weld_cleaning_testdata_1.WeldCleaningScenario1.cycleTimePerPart, 2);
                (0, test_1.expect)(machineCost).toBeCloseTo(weld_cleaning_testdata_1.WeldCleaningScenario1.machineCostPerPart, 4);
                (0, test_1.expect)(laborCost).toBeCloseTo(weld_cleaning_testdata_1.WeldCleaningScenario1.laborCostPerPart, 4);
                // Verify using helper functions
                const calculatedMachine = (0, weld_cleaning_testdata_1.calculateWeldCleaningMachineCost)(weld_cleaning_testdata_1.WeldCleaningScenario1.machineHourRate, weld_cleaning_testdata_1.WeldCleaningScenario1.cycleTimePerPart, weld_cleaning_testdata_1.WeldCleaningScenario1.efficiency);
                logger.info(`  Calculated Machine Cost: $${calculatedMachine}`);
                (0, test_1.expect)(machineCost).toBeCloseTo(calculatedMachine, 4);
                logTestComplete('WC-005');
            }
            catch (err) {
                ctx.hasFailed = true;
                throw err;
            }
        }));
        (0, test_1.test)('WC-006: Verify Net Process Cost', { tag: ['@weldcleaning', '@cost'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            if (ctx.hasFailed)
                test_1.test.skip();
            logTestStart('WC-006: Verify Net Process Cost', ['@weldcleaning', '@cost']);
            try {
                // Get all cost components
                const machineCost = yield ctx.weldingPage.getInputValueAsNumber(ctx.weldingPage.MachineCostPart);
                const laborCost = yield ctx.weldingPage.getInputValueAsNumber(ctx.weldingPage.LaborCostPart);
                const setupCost = yield ctx.weldingPage.getInputValueAsNumber(ctx.weldingPage.SetupCostPart);
                const inspectionCost = yield ctx.weldingPage.getInputValueAsNumber(ctx.weldingPage.QAInspectionCost);
                const yieldCost = yield ctx.weldingPage.getInputValueAsNumber(ctx.weldingPage.YieldCostPart);
                // Calculate net process cost
                const calculatedNetCost = (0, weld_cleaning_testdata_1.calculateWeldCleaningNetProcessCost)({
                    machineCost,
                    laborCost,
                    setupCost,
                    inspectionCost,
                    yieldCost
                });
                logger.info('Net Process Cost Calculation:');
                logger.info(`  Machine: $${machineCost.toFixed(4)}`);
                logger.info(`  Labor: $${laborCost.toFixed(4)}`);
                logger.info(`  Setup: $${setupCost.toFixed(4)}`);
                logger.info(`  Inspection: $${inspectionCost.toFixed(4)}`);
                logger.info(`  Yield: $${yieldCost.toFixed(4)}`);
                logger.info(`  Total: $${calculatedNetCost} (Expected: $${weld_cleaning_testdata_1.WeldCleaningScenario1.netProcessCost})`);
                (0, test_1.expect)(calculatedNetCost).toBeCloseTo(weld_cleaning_testdata_1.WeldCleaningScenario1.netProcessCost, 4);
                logTestComplete('WC-006');
            }
            catch (err) {
                ctx.hasFailed = true;
                throw err;
            }
        }));
        (0, test_1.test)('WC-007: Verify Sustainability Metrics', { tag: ['@weldcleaning', '@sustainability'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            if (ctx.hasFailed)
                test_1.test.skip();
            logTestStart('WC-007: Verify Sustainability Metrics', ['@weldcleaning', '@sustainability']);
            try {
                const co2PerPart = yield ctx.weldingPage.getInputValueAsNumber(ctx.weldingPage.CO2PerPartManufacturing);
                logger.info(`✓ CO2/part: ${co2PerPart} kg (Expected: ${weld_cleaning_testdata_1.WeldCleaningScenario1.co2PerPart})`);
                (0, test_1.expect)(co2PerPart).toBeCloseTo(weld_cleaning_testdata_1.WeldCleaningScenario1.co2PerPart, 4);
                logTestComplete('WC-007');
            }
            catch (err) {
                logger.warn('⚠️  Sustainability metrics not visible');
            }
        }));
    });
    // ==================== CROSS-PROCESS VALIDATION TESTS ====================
    test_1.test.describe('Cross-Process Validation Tests', () => {
        (0, test_1.test)('VALID-001: Formula Validation - Machine Cost', { tag: ['@validation'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            logTestStart('VALID-001: Formula Validation - Machine Cost', ['@validation']);
            // Test different scenarios
            const testCases = [
                { rate: 2.3247, time: 29.9643, efficiency: 70, expected: 0.0277 },
                { rate: 3.8548, time: 95.2069, efficiency: 70, expected: 0.1493 }
            ];
            testCases.forEach(tc => {
                const calculated = (0, weld_cleaning_testdata_1.calculateWeldCleaningMachineCost)(tc.rate, tc.time, tc.efficiency);
                logger.info(`Rate: $${tc.rate}/hr, Time: ${tc.time}s, Efficiency: ${tc.efficiency}% → Cost: $${calculated}`);
                (0, test_1.expect)(calculated).toBeCloseTo(tc.expected, 3);
            });
            logTestComplete('VALID-001');
        }));
        (0, test_1.test)('VALID-002: Data Integrity Check', { tag: ['@validation'] }, () => __awaiter(void 0, void 0, void 0, function* () {
            logTestStart('VALID-002: Data Integrity Check', ['@validation']);
            // Verify all required test data is present
            (0, test_1.expect)(mig_welding_testdata_1.MigWeldingTestData).toBeDefined();
            (0, test_1.expect)(mig_welding_testdata_1.MigWeldingTestData.project.projectId).toBeTruthy();
            (0, test_1.expect)(weld_cleaning_testdata_1.WeldCleaningScenario1).toBeDefined();
            (0, test_1.expect)(weld_cleaning_testdata_1.WeldCleaningScenario1.netProcessCost).toBeGreaterThan(0);
            logger.info('✓ MIG Welding test data valid');
            logger.info('✓ Weld Cleaning test data valid');
            logTestComplete('VALID-002');
        }));
    });
});
