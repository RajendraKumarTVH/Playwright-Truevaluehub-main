
import { test, chromium, type BrowserContext, type Page } from '@playwright/test';
import Logger from './lib/LoggerUtil';
import { LoginPage } from '../pageFactory/pageRepository/LoginPage';
import { PlasticRubberPage } from './pages/plastic-rubber.page';
import { PlasticRubberLogic } from './pages/plastic-rubber-logic';


const logger = Logger;

const CONFIG = {
    projectId: '15568', // Example project
    baseUrl: 'https://qa.truevaluehub.com',
    timeout: 60000,
    userProfilePath: './user-profile-sustainability'
};

let context: BrowserContext;
let page: Page;
let loginPage: LoginPage;
let plasticRubberPage: PlasticRubberPage;
let plasticRubberLogic: PlasticRubberLogic;

test.describe('Plastic & Rubber Sustainability Verification', () => {

    test.beforeAll(async () => {
        logger.info('🚀 Starting Plastic & Rubber Sustainability Verification Tests');

        context = await chromium.launchPersistentContext(CONFIG.userProfilePath, {
            channel: 'msedge',
            headless: false,
            args: ['--start-maximized'],
            viewport: null,
            timeout: CONFIG.timeout
        });

        page = context.pages().length ? context.pages()[0] : await context.newPage();
        loginPage = new LoginPage(page, context);
        plasticRubberPage = new PlasticRubberPage(page, context);
        plasticRubberLogic = new PlasticRubberLogic(plasticRubberPage);

        await loginPage.loginToApplication();
        await page.goto(`${CONFIG.baseUrl}/costing/${CONFIG.projectId}/manufacturing`);
        await page.waitForLoadState('networkidle');
    });

    test.afterAll(async () => {
        logger.info('🏁 Sustainability Verification Tests Completed');
        if (context) await context.close();
    });

    test('TC-PR-001: Verify Power ESG (Electricity Consumption) Calculation', async () => {
        logger.info('🔹 TC-PR-001: Verifying Power ESG Calculation');

        // 1. Fill basic manufacturing info for Injection Moulding
        // (Assuming we are on the Manufacturing tab and Injection Moulding is active)

        // 2. Open Machine Details and verify/fetch totalPowerKW and powerUtilization
        // For this test, we verify the calculation logic by reading inputs and checking the result in Sustainability tab.

        await plasticRubberLogic.verifyInjectionMoulding();
    });
});
