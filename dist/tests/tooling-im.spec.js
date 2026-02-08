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
const LoggerUtil_1 = __importDefault(require("./lib/LoggerUtil"));
const LoginPage_1 = require("../pageFactory/pageRepository/LoginPage");
const tooling_page_1 = require("./pages/tooling.page");
const tooling_logic_1 = require("./pages/tooling-logic");
const manufacturing_page_1 = require("./db/manufacturing.page");
const tooling_calculator_1 = require("./utils/tooling-calculator");
const logger = LoggerUtil_1.default;
const CONFIG = {
    projectId: '15568',
    baseUrl: 'https://qa.truevaluehub.com',
    timeout: 60000,
    userProfilePath: './user-profile-tooling'
};
let context;
let page;
let loginPage;
let toolingPage;
let toolingLogic;
let manufacturingPage;
test_1.test.describe('Plastic & Rubber Tooling Logic Verification', () => {
    test_1.test.beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        logger.info('🚀 Starting Plastic & Rubber Tooling E2E Tests');
        context = yield test_1.chromium.launchPersistentContext(CONFIG.userProfilePath, {
            channel: 'msedge',
            headless: false,
            args: ['--start-maximized'],
            viewport: null,
            timeout: CONFIG.timeout
        });
        page = context.pages().length ? context.pages()[0] : yield context.newPage();
        loginPage = new LoginPage_1.LoginPage(page, context);
        toolingPage = new tooling_page_1.ToolingPage(page, context);
        toolingLogic = new tooling_logic_1.ToolingLogic(toolingPage);
        manufacturingPage = new manufacturing_page_1.ManufacturingPage(page);
        yield loginPage.loginToApplication();
        yield page.goto(`${CONFIG.baseUrl}/costing/${CONFIG.projectId}/manufacturing`);
        yield page.waitForLoadState('networkidle');
    }));
    test_1.test.afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        logger.info('🏁 Plastic & Rubber Tooling E2E Tests Completed');
        if (context)
            yield context.close();
    }));
    (0, test_1.test)('TC-TO-001: Verify Tooling Base Dimensions Calculation', () => __awaiter(void 0, void 0, void 0, function* () {
        logger.info('🔹 TC-TO-001: Verifying Tooling Base Dimensions');
        // 1. Navigate to Tooling Tab
        yield manufacturingPage.toolingTab.click();
        yield page.waitForLoadState('networkidle');
        // 2. Select Injection Moulding if not already selected
        // Note: This assumes we are in a project where IM can be selected or is already active
        // 3. Fill Tooling Inputs
        yield toolingLogic.fillToolingDetails({
            noOfCavity: 4,
            envelopLength: 100,
            envelopWidth: 80,
            envelopHeight: 50
        });
        // 4. Verify Subconscious Calculations (Base dimensions)
        yield toolingLogic.verifyToolingCalculations();
    }));
    (0, test_1.test)('TC-TO-002: Verify Material Plate Calculations', () => __awaiter(void 0, void 0, void 0, function* () {
        logger.info('🔹 TC-TO-002: Verifying Material Plate Calculations');
        const materialScenarios = [
            {
                moldDescriptionId: tooling_calculator_1.ToolingMaterialIM.CavityInsert,
                moldDescription: 'Cavity Insert',
                density: 7.85,
                materialPrice: 15,
                materialCuttingAllowance: 10
            },
            {
                moldDescriptionId: tooling_calculator_1.ToolingMaterialIM.CoreInsert,
                moldDescription: 'Core Insert',
                density: 7.85,
                materialPrice: 15,
                materialCuttingAllowance: 10
            }
        ];
        // This verifies if the calculator logic matches expected business rules
        yield toolingLogic.verifyMaterialInfoRows(materialScenarios);
    }));
});
