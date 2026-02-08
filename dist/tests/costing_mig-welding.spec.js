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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const node_fs_1 = __importDefault(require("node:fs"));
const LoggerUtil_1 = __importDefault(require("./lib/LoggerUtil"));
const mig_welding_logic_1 = require("./pages/mig-welding-logic");
const mig_welding_page_1 = require("./pages/mig-welding.page");
const LoginPage_1 = require("../pageFactory/pageRepository/LoginPage");
const mig_welding_testdata_1 = require("../test-data/mig-welding-testdata");
const logger = LoggerUtil_1.default;
// ============================================================
// 🔧 CONFIGURATION
// ============================================================
const CONFIG = {
    projectId: ((_a = mig_welding_testdata_1.MigWeldingTestData.config) === null || _a === void 0 ? void 0 : _a.baseUrl)
        ? mig_welding_testdata_1.MigWeldingTestData.project.projectId
        : '14783',
    baseUrl: ((_b = mig_welding_testdata_1.MigWeldingTestData.config) === null || _b === void 0 ? void 0 : _b.baseUrl) || 'https://qa.truevaluehub.com',
    timeout: ((_c = mig_welding_testdata_1.MigWeldingTestData.config) === null || _c === void 0 ? void 0 : _c.defaultTimeout) || 30000,
    userProfilePath: './user-profile-spec',
    authStatePath: 'auth_spec.json'
};
// ============================================================
// 🌐 GLOBAL OBJECTS
// ============================================================
let context;
let page;
let migWeldingPage;
let migWeldingLogic;
let loginPage;
let calculatedCosts = {};
test_1.test.setTimeout(CONFIG.timeout);
// ============================================================
// 🧪 UTILITIES
// ============================================================
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
function handleFailure(name, err) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.error(`❌ ${name}: ${err.message}`);
        yield takeScreenshot(page, name);
    });
}
function takeScreenshot(page, name) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        if (!node_fs_1.default.existsSync('screenshots')) {
            node_fs_1.default.mkdirSync('screenshots', { recursive: true });
        }
        if ((_a = page === null || page === void 0 ? void 0 : page.isClosed) === null || _a === void 0 ? void 0 : _a.call(page))
            return;
        yield page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
    });
}
test_1.test.describe.serial('MIG Welding - Complete E2E Flow', () => {
    test_1.test.beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        logger.info('═══════════════════════════════════════════════════════════');
        logger.info('🚀 Starting MIG Welding E2E Test Suite');
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
        migWeldingPage = new mig_welding_page_1.MigWeldingPage(page, context);
        migWeldingLogic = new mig_welding_logic_1.MigWeldingLogic(migWeldingPage);
        yield page.waitForLoadState('domcontentloaded');
        yield loginPage.loginToApplication();
        yield page
            .waitForLoadState('networkidle', { timeout: 30000 })
            .catch(() => null);
        yield context.storageState({ path: CONFIG.authStatePath });
        yield migWeldingLogic.navigateToProject(CONFIG.projectId);
    }));
    test_1.test.afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        logger.info('🏁 MIG Welding E2E Test Suite Completed');
        if (context) {
            try {
                yield context.close();
                logger.info('✅ Browser context closed');
            }
            catch (err) {
                logger.warn('⚠️ Context already closed or failed to close', err);
            }
        }
        // Windows-safe cleanup (best-effort only)
        const profilePath = CONFIG.userProfilePath;
        if (node_fs_1.default.existsSync(profilePath)) {
            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    yield new Promise(res => setTimeout(res, 2000));
                    node_fs_1.default.rmSync(profilePath, { recursive: true, force: true });
                    logger.info('✅ User profile cleaned successfully');
                    break;
                }
                catch (err) {
                    logger.warn(`⚠️ Cleanup attempt ${attempt} failed`);
                    if (attempt === 3) {
                        logger.warn('⚠️ Skipping profile cleanup (Windows file lock)');
                    }
                }
            }
        }
    }));
    (0, test_1.test)('TC001: Verify Part Information', { tag: '@smoke' }, () => __awaiter(void 0, void 0, void 0, function* () {
        yield runStep('TC001_Verify_Part_Info_Failure', () => __awaiter(void 0, void 0, void 0, function* () {
            logger.info('🔹 TC001: Verifying Part Information');
            yield migWeldingLogic.verifyPartInformation();
        }));
    }));
    (0, test_1.test)('TC002: Verify Material Information Details', { tag: '@smoke' }, () => __awaiter(void 0, void 0, void 0, function* () {
        yield runStep('TC002_Material_Info_Failure', () => __awaiter(void 0, void 0, void 0, function* () {
            logger.info('🔹 TC002: Verifying Material Information Details');
            yield migWeldingLogic.verifyMaterialInformationDetails();
        }));
    }));
    (0, test_1.test)('TC003: Verify Net Weight', { tag: '@smoke' }, () => __awaiter(void 0, void 0, void 0, function* () {
        yield runStep('TC003_Net_Weight_Failure', () => __awaiter(void 0, void 0, void 0, function* () {
            yield migWeldingLogic.verifyNetWeight();
        }));
    }));
    (0, test_1.test)('TC004: Verify Welding Details', { tag: '@smoke', timeout: 120000 }, () => __awaiter(void 0, void 0, void 0, function* () {
        yield runStep('TC004_Welding_Details_Failure', () => __awaiter(void 0, void 0, void 0, function* () {
            yield migWeldingLogic.verifyWeldingDetails(mig_welding_testdata_1.MigWeldingTestData);
        }));
    }));
    (0, test_1.test)('TC005: Verify Total Weld Length', { tag: '@smoke', timeout: 120000 }, () => __awaiter(void 0, void 0, void 0, function* () {
        yield runStep('TC005_Total_Weld_Length_Failure', () => __awaiter(void 0, void 0, void 0, function* () {
            yield migWeldingLogic.verifyWeldingMaterialCalculations();
        }));
    }));
    test_1.test.skip('TC006: Verify Net Material Sustainability Cost', { tag: '@smoke' }, () => __awaiter(void 0, void 0, void 0, function* () {
        yield runStep('TC006_Net_Material_Sustainability_Failure', () => __awaiter(void 0, void 0, void 0, function* () {
            logger.info('🔹 TC006: Verifying Net Material Sustainability Cost');
            yield migWeldingLogic.verifyNetMaterialSustainabilityCost();
        }));
    }));
    test_1.test.skip('TC007: Verify Weld Cycle Time Details', { tag: '@smoke', timeout: 120000 }, () => __awaiter(void 0, void 0, void 0, function* () {
        yield runStep('TC007_Weld_Cycle_Time_Failure', () => __awaiter(void 0, void 0, void 0, function* () {
            yield migWeldingLogic.verifyWeldCycleTimeDetails(mig_welding_testdata_1.MigWeldingTestData);
        }));
    }));
    (0, test_1.test)('TC008: Verify Manufacturing Cost', { tag: '@smoke', timeout: 120000 }, () => __awaiter(void 0, void 0, void 0, function* () {
        yield runStep('TC008_Manufacturing_Cost_Failure', () => __awaiter(void 0, void 0, void 0, function* () {
            logger.info('🔹 TC008: Verifying Manufacturing Cost');
            // await migWeldingLogic.verifyMaterialInformationDetails()
            // await migWeldingLogic.verifyWeldingDetails(MigWeldingTestData)
            // await migWeldingLogic.verifyWeldCycleTimeDetails(MigWeldingTestData)
            // await migWeldingLogic.verifyMigCosts()
            yield migWeldingLogic.verifyWeldCleaningCosts();
        }));
    }));
    (0, test_1.test)('TC009: Verify Manufacturing Sustainability', { tag: '@smoke' }, () => __awaiter(void 0, void 0, void 0, function* () {
        yield runStep('TC009_Manufacturing_Sustainability_Failure', () => __awaiter(void 0, void 0, void 0, function* () {
            logger.info('🔹 TC009: Verifying Manufacturing Sustainability');
            yield migWeldingLogic.verifyManufacturingSustainability();
        }));
    }));
    test_1.test.skip('TC010: Verify Manufacturing CO2', { tag: '@smoke' }, () => __awaiter(void 0, void 0, void 0, function* () {
        yield runStep('TC010_Manufacturing_CO2_Failure', () => __awaiter(void 0, void 0, void 0, function* () {
            logger.info('🔹 TC010: Verifying Manufacturing CO2');
            yield migWeldingLogic.verifyManufacturingCO2();
        }));
    }));
    test_1.test.skip('TC011: Verify Complete Welding Process', { tag: '@smoke', timeout: 120000 }, () => __awaiter(void 0, void 0, void 0, function* () {
        yield runStep('TC011_Complete_Welding_Process_Failure', () => __awaiter(void 0, void 0, void 0, function* () {
            yield migWeldingLogic.verifyCompleteWeldingProcess();
        }));
    }));
    (0, test_1.test)('TC012: Verify Cost Summary', { tag: '@smoke', timeout: 120000 }, () => __awaiter(void 0, void 0, void 0, function* () {
        yield runStep('TC012_Cost_Summary_Failure', () => __awaiter(void 0, void 0, void 0, function* () {
            yield migWeldingLogic.verifyCostSummary();
        }));
    }));
});
