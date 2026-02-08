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
const plastic_rubber_page_1 = require("./pages/plastic-rubber.page");
const plastic_rubber_logic_1 = require("./pages/plastic-rubber-logic");
const manufacturing_page_1 = require("./db/manufacturing.page");
const logger = LoggerUtil_1.default;
const CONFIG = {
    projectId: '15568', // Example project
    baseUrl: 'https://qa.truevaluehub.com',
    timeout: 60000,
    userProfilePath: './user-profile-sustainability'
};
let context;
let page;
let loginPage;
let plasticRubberPage;
let plasticRubberLogic;
let manufacturingPage;
test_1.test.describe('Plastic & Rubber Sustainability Verification', () => {
    test_1.test.beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        logger.info('🚀 Starting Plastic & Rubber Sustainability Verification Tests');
        context = yield test_1.chromium.launchPersistentContext(CONFIG.userProfilePath, {
            channel: 'msedge',
            headless: false,
            args: ['--start-maximized'],
            viewport: null,
            timeout: CONFIG.timeout
        });
        page = context.pages().length ? context.pages()[0] : yield context.newPage();
        loginPage = new LoginPage_1.LoginPage(page, context);
        plasticRubberPage = new plastic_rubber_page_1.PlasticRubberPage(page, context);
        plasticRubberLogic = new plastic_rubber_logic_1.PlasticRubberLogic(plasticRubberPage);
        manufacturingPage = new manufacturing_page_1.ManufacturingPage(page);
        yield loginPage.loginToApplication();
        yield page.goto(`${CONFIG.baseUrl}/costing/${CONFIG.projectId}/manufacturing`);
        yield page.waitForLoadState('networkidle');
    }));
    test_1.test.afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        logger.info('🏁 Sustainability Verification Tests Completed');
        if (context)
            yield context.close();
    }));
    (0, test_1.test)('TC-PR-001: Verify Power ESG (Electricity Consumption) Calculation', () => __awaiter(void 0, void 0, void 0, function* () {
        logger.info('🔹 TC-PR-001: Verifying Power ESG Calculation');
        // 1. Fill basic manufacturing info for Injection Moulding
        // (Assuming we are on the Manufacturing tab and Injection Moulding is active)
        // 2. Open Machine Details and verify/fetch totalPowerKW and powerUtilization
        // For this test, we verify the calculation logic by reading inputs and checking the result in Sustainability tab.
        yield plasticRubberLogic.verifyInjectionMoulding();
    }));
});
