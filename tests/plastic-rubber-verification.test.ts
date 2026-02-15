import {
    test,
    chromium,
    type BrowserContext,
    type Page,
} from '@playwright/test';

import { PlasticRubberPage } from './pages/plastic-rubber.page';
import { PlasticRubberLogic } from './pages/plastic-rubber-logic';
import { LoginPage } from '../pageFactory/pageRepository/LoginPage';
import Logger from './lib/LoggerUtil';

const logger = Logger;

const CONFIG = {
    projectId: '16412',
    baseUrl: 'https://qa.truevaluehub.com',
    timeout: 300_000,
    userProfilePath: './user-profile-spec',
} as const;

let context: BrowserContext;
let page: Page;
let plasticPage: PlasticRubberPage;
let plasticLogic: PlasticRubberLogic;
let loginPage: LoginPage;

test.describe('Plastic & Rubber Verification - TVH_16 (15264)', () => {
    test.describe.configure({ timeout: CONFIG.timeout });

    test.beforeAll(async () => {
        logger.info('══════════════════════════════════════════════════════');
        logger.info('🚀 Starting Plastic & Rubber E2E Test Suite');
        logger.info(`📋 Project ID: ${CONFIG.projectId}`);

        const isCI = !!process.env.CI;

        context = await chromium.launchPersistentContext(CONFIG.userProfilePath, {
            channel: 'msedge',
            headless: isCI,
            args: isCI ? ['--disable-gpu', '--no-sandbox'] : ['--start-maximized'],
        });

        page = context.pages().length ? context.pages()[0] : await context.newPage();
        loginPage = new LoginPage(page, context);
        plasticPage = new PlasticRubberPage(page, context);
        plasticLogic = new PlasticRubberLogic(plasticPage);

        await page.waitForLoadState('domcontentloaded');
        await loginPage.loginToApplication();
        await plasticLogic.navigateToProject(CONFIG.projectId);

        logger.info('✅ Login successful');
    });

    /**
     * Utility to expand Manufacturing sections if not already expanded
     */
    async function expandManufacturingSections(): Promise<void> {
        await plasticPage.ManufacturingInformation.scrollIntoViewIfNeeded();
        if ((await plasticPage.MfgDetailsTab.count()) === 0) {
            logger.info('📥 Expanding Material & Manufacturing sections...');
            await plasticPage.MaterialInformationSection.waitFor({ state: 'visible', timeout: 10_000 });
            await plasticPage.MaterialInformationSection.click({ force: true });
            await plasticPage.ManufacturingInformation.waitFor({ state: 'visible', timeout: 10_000 });
            await plasticPage.ManufacturingInformation.click({ force: true });
                      await page.waitForLoadState('networkidle', { timeout: 90_000 });
            await page.waitForTimeout(500); // small buffer for rendering
        }
    }
    test.describe('Injection Moulding Verification', () => {
        test('Verify Injection Moulding - Project TVH_16', async () => {
            test.setTimeout(300_000); // 5 minutes
            logger.info('🔍 Verifying Injection Moulding for part: 28490054_007_COVER-SDPS');
            await expandManufacturingSections();
            await plasticLogic.verifyInjectionMoulding({ verifyCycleTime: true });
            logger.info('✅ Injection Moulding verification completed');
        });
    });
    test.describe('Sustainability Verification', () => {
        test('Verify Sustainability Calculation Logic (Standalone)', async () => {
            logger.info('🧪 Verifying Sustainability Logic with Mock Data...');
            await plasticLogic.MaterialSustainabilityCalculation();
            logger.info('✅ Sustainability Logic verified');
        });
    });
    test.describe('Packaging Verification', () => {
        test.only('Verify Packaging Calculation Logic (Standalone)', async () => {
            logger.info('📦 Verifying Packaging Logic with Mock Data...');
                        await plasticLogic.PackagingInformationCalculation();
            logger.info('✅ Packaging Logic verified');
        });
    });

    // Skipped tests for future implementation
    const skippedTests = [
        { name: 'Verify Deflashing', fn: () => plasticLogic.verifyDeflashing() },
        { name: 'Verify Manual Deflashing', fn: () => plasticLogic.verifyManualDeflashing() },
        { name: 'Verify Post Curing', fn: () => plasticLogic.verifyPostCuring() },
        { name: 'Verify Deburring', fn: () => plasticLogic.verifyDeburring() },
        { name: 'Verify Cutting', fn: () => plasticLogic.verifyCutting() },
    ];

    for (const testInfo of skippedTests) {
        test.skip(testInfo.name, async () => {
            await expandManufacturingSections();
            await testInfo.fn();
        });
    }

    test.afterAll(async () => {
        await context.close();
        logger.info('🏁 Test suite execution completed');
    });
});
