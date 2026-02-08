"use strict";
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
const node_fs_1 = __importDefault(require("node:fs"));
const LoggerUtil_1 = __importDefault(require("./lib/LoggerUtil"));
const sheet_metal_logic_1 = require("./pages/sheet-metal-logic");
const sheet_metal_page_1 = require("./pages/sheet-metal.page");
const LoginPage_1 = require("../pageFactory/pageRepository/LoginPage");
const logger = LoggerUtil_1.default;
// ============================================================
// 🔧 CONFIGURATION
// ============================================================
const CONFIG = {
    projectId: '14783', // Update with actual sheet metal project ID
    baseUrl: 'https://qa.truevaluehub.com',
    timeout: 30000,
    userProfilePath: './user-profile-sheetmetal',
    authStatePath: 'auth_sheetmetal.json'
};
// ============================================================
// 🌐 GLOBAL OBJECTS
// ============================================================
let context;
let page;
let sheetMetalPage;
let sheetMetalLogic;
let loginPage;
let hasFailed = false;
let calculatedCosts = {};
test_1.test.setTimeout(CONFIG.timeout);
// ============================================================
// 🚀 SUITE SETUP & TEARDOWN
// ============================================================
test_1.test.beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    logger.info('═══════════════════════════════════════════════════════════');
    logger.info('🚀 Starting Sheet Metal E2E Test Suite');
    logger.info(`📋 Project ID: ${CONFIG.projectId}`);
    context = yield test_1.chromium.launchPersistentContext(CONFIG.userProfilePath, {
        channel: 'msedge',
        headless: false,
        args: ['--start-maximized'],
        viewport: null,
        timeout: CONFIG.timeout
    });
    page = context.pages().length ? context.pages()[0] : yield context.newPage();
    loginPage = new LoginPage_1.LoginPage(page, context);
    sheetMetalPage = new sheet_metal_page_1.SheetMetalPage(page, context);
    sheetMetalLogic = new sheet_metal_logic_1.SheetMetalLogic(sheetMetalPage);
    yield page.waitForLoadState('domcontentloaded');
    yield loginPage.loginToApplication();
    yield context.storageState({ path: CONFIG.authStatePath });
    yield sheetMetalLogic.navigateToProject(CONFIG.projectId);
}));
test_1.test.afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    logger.info('🏁 Sheet Metal E2E Test Suite Completed');
    if (context) {
        yield context.close();
    }
    if (node_fs_1.default.existsSync(CONFIG.userProfilePath)) {
        try {
            // fs.rmSync(CONFIG.userProfilePath, { recursive: true, force: true })
        }
        catch (e) {
            console.error('Failed to cleanup profile: ', e);
        }
    }
}));
function runStep(name, fn) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield fn();
        }
        catch (err) {
            yield handleFailure(name, err);
            throw err;
        }
    });
}
// ============================================================
// 🧪 TESTS
// ============================================================
test_1.test.describe.serial('Sheet Metal - Complete E2E Flow', () => {
    // ------------------------------------------------------------
    // 🛡 Global skip + failure tracking
    // ------------------------------------------------------------
    test_1.test.beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        console.log(`🔹 Before Test: Opening Manufacturing for Sheet Metal`);
        test_1.test.skip(hasFailed, 'Skipping remaining tests because a previous test failed');
    }));
    test_1.test.afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        // Failure tracking through global state
    }));
    // ------------------------------------------------------------
    // 1️⃣ PART INFORMATION
    // ------------------------------------------------------------
    (0, test_1.test)('TC001: Verify Part Information', { tag: '@smoke' }, () => __awaiter(void 0, void 0, void 0, function* () {
        yield runStep('TC001_Part_Info_Failure', () => __awaiter(void 0, void 0, void 0, function* () {
            logger.info('🔹 TC001: Verifying Part Information');
            yield sheetMetalLogic.verifyPartInformation();
        }));
    }));
    // ------------------------------------------------------------
    // 2️⃣ MATERIAL INFORMATION
    // ------------------------------------------------------------
    (0, test_1.test)('TC002: Verify Material Information', { tag: '@smoke' }, () => __awaiter(void 0, void 0, void 0, function* () {
        yield runStep('TC002_Material_Info_Failure', () => __awaiter(void 0, void 0, void 0, function* () {
            logger.info('🔹 TC002: Verifying Material Information');
            yield sheetMetalLogic.verifyMaterialInformation();
        }));
    }));
    // ------------------------------------------------------------
    // 3️⃣ MANUFACTURING & COST
    // ------------------------------------------------------------
    (0, test_1.test)('TC003: Verify Manufacturing Cost', { tag: '@smoke' }, () => __awaiter(void 0, void 0, void 0, function* () {
        yield runStep('TC003_Manufacturing_Cost_Failure', () => __awaiter(void 0, void 0, void 0, function* () {
            logger.info('🔹 TC003: Verifying Manufacturing Cost');
            calculatedCosts = yield sheetMetalLogic.verifyManufacturingCosts();
        }));
    }));
    (0, test_1.test)('TC004: Verify Direct Process Cost Breakdown', { tag: '@smoke' }, () => __awaiter(void 0, void 0, void 0, function* () {
        yield runStep('TC004_Direct_Process_Cost_Failure', () => __awaiter(void 0, void 0, void 0, function* () {
            logger.info('🔹 TC004: Verifying Direct Process Cost Summation');
            yield sheetMetalLogic.verifyDirectProcessCostCalculation();
        }));
    }));
    // ------------------------------------------------------------
    // 4️⃣ BENDING CALCULATIONS
    // ------------------------------------------------------------
    (0, test_1.test)('TC005: Verify Bending Calculations', { tag: '@smoke' }, () => __awaiter(void 0, void 0, void 0, function* () {
        yield runStep('TC005_Bending_Calculations_Failure', () => __awaiter(void 0, void 0, void 0, function* () {
            logger.info('🔹 TC005: Verifying Bending Calculations');
            yield sheetMetalLogic.verifyBendingCalculations({});
        }));
    }));
    // ------------------------------------------------------------
    // 5️⃣ COST SUMMARY
    // ------------------------------------------------------------
    (0, test_1.test)('TC006: Verify Cost Summary', { tag: '@smoke' }, () => __awaiter(void 0, void 0, void 0, function* () {
        yield runStep('TC006_Cost_Summary_Failure', () => __awaiter(void 0, void 0, void 0, function* () {
            logger.info('🔹 TC006: Verifying Cost Summary');
            yield sheetMetalLogic.verifyCostSummary();
        }));
    }));
    // ------------------------------------------------------------
    // 6️⃣ MASTER END-TO-END
    // ------------------------------------------------------------
    (0, test_1.test)('TC007: Verify Complete Sheet Metal Process', { tag: '@smoke' }, () => __awaiter(void 0, void 0, void 0, function* () {
        yield runStep('TC007_Complete_Process_Failure', () => __awaiter(void 0, void 0, void 0, function* () {
            logger.info('🔹 TC007: Verifying Complete Sheet Metal Process');
            yield sheetMetalLogic.verifyCompleteSheetMetalProcess();
        }));
    }));
});
// ============================================================
// 🧰 UTILITIES
// ============================================================
function handleFailure(name, err) {
    return __awaiter(this, void 0, void 0, function* () {
        hasFailed = true;
        logger.error(`❌ ${name}: ${err.message}`);
        yield takeScreenshot(page, name);
        throw err;
    });
}
function takeScreenshot(page, name) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!node_fs_1.default.existsSync('screenshots')) {
            node_fs_1.default.mkdirSync('screenshots', { recursive: true });
        }
        yield page.screenshot({
            path: `screenshots/${name}.png`,
            fullPage: true
        });
    });
}
