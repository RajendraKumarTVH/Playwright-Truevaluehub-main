
import { test, chromium, type BrowserContext, type Page } from '@playwright/test';
import fs from 'node:fs';
import Logger from './lib/LoggerUtil';
import { LoginPage } from '../pageFactory/pageRepository/LoginPage';
import { ToolingPage } from './pages/tooling.page';
import { ToolingLogic } from './pages/tooling-logic';
import { ManufacturingPage } from './db/manufacturing.page';
import { MigWeldingTestData } from '../test-data/mig-welding-testdata';
import { ToolingMaterialIM } from './utils/tooling-calculator';

const logger = Logger;

const CONFIG = {
    projectId: '15568',
    baseUrl: 'https://qa.truevaluehub.com',
    timeout: 60000,
    userProfilePath: './user-profile-tooling'
};

let context: BrowserContext;
let page: Page;
let loginPage: LoginPage;
let toolingPage: ToolingPage;
let toolingLogic: ToolingLogic;
let manufacturingPage: ManufacturingPage;

test.describe('Plastic & Rubber Tooling Logic Verification', () => {

    test.beforeAll(async () => {
        logger.info('🚀 Starting Plastic & Rubber Tooling E2E Tests');

        context = await chromium.launchPersistentContext(CONFIG.userProfilePath, {
            channel: 'msedge',
            headless: false,
            args: ['--start-maximized'],
            viewport: null,
            timeout: CONFIG.timeout
        });

        page = context.pages().length ? context.pages()[0] : await context.newPage();
        loginPage = new LoginPage(page, context);
        toolingPage = new ToolingPage(page, context);
        toolingLogic = new ToolingLogic(toolingPage);
        manufacturingPage = new ManufacturingPage(page);

        await loginPage.loginToApplication();
        await page.goto(`${CONFIG.baseUrl}/costing/${CONFIG.projectId}/manufacturing`);
        await page.waitForLoadState('networkidle');
    });

    test.afterAll(async () => {
        logger.info('🏁 Plastic & Rubber Tooling E2E Tests Completed');
        if (context) await context.close();
    });

    test('TC-TO-001: Verify Tooling Base Dimensions Calculation', async () => {
        logger.info('🔹 TC-TO-001: Verifying Tooling Base Dimensions');

        // 1. Navigate to Tooling Tab
        await manufacturingPage.toolingTab.click();
        await page.waitForLoadState('networkidle');

        // 2. Select Injection Moulding if not already selected
        // Note: This assumes we are in a project where IM can be selected or is already active

        // 3. Fill Tooling Inputs
        await toolingLogic.fillToolingDetails({
            noOfCavity: 4,
            envelopLength: 100,
            envelopWidth: 80,
            envelopHeight: 50
        });

        // 4. Verify Subconscious Calculations (Base dimensions)
        await toolingLogic.verifyToolingCalculations();
    });

    test('TC-TO-002: Verify Material Plate Calculations', async () => {
        logger.info('🔹 TC-TO-002: Verifying Material Plate Calculations');

        const materialScenarios = [
            {
                moldDescriptionId: ToolingMaterialIM.CavityInsert,
                moldDescription: 'Cavity Insert',
                density: 7.85,
                materialPrice: 15,
                materialCuttingAllowance: 10
            },
            {
                moldDescriptionId: ToolingMaterialIM.CoreInsert,
                moldDescription: 'Core Insert',
                density: 7.85,
                materialPrice: 15,
                materialCuttingAllowance: 10
            }
        ];

        // This verifies if the calculator logic matches expected business rules
        await toolingLogic.verifyMaterialInfoRows(materialScenarios);
    });
});
