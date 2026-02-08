// Test file, always using storageState, with imports only from '@playwright/test' and your Page Object

import { test, expect } from '@playwright/test';
import { MainPage } from '../../pages/costing/14783.page';

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

test.describe('Main Page UI and Link Verification', () => {
  let context: import('@playwright/test').BrowserContext;
  let page: import('@playwright/test').Page;
  let mainPage: MainPage;

  test.beforeEach(async ({ browser }) => {
    context = await browser.newContext({ storageState: 'playwright/.auth/storageState.json' });
    page = await context.newPage();
    mainPage = new MainPage(page);
    await mainPage.goto();
  });

  test.afterEach(async () => {
    await context.close();
  });

  test('should display all key elements and verify links', async () => {
    // Main heading
    await expect(mainPage.mainHeading).toBeVisible();

    // Buttons
    await expect(mainPage.signInButton).toBeVisible();
    await expect(mainPage.signInButton).toBeEnabled();

    await expect(mainPage.ssoButton).toBeVisible();
    await expect(mainPage.ssoButton).toBeEnabled();

    // Links
    await expect(mainPage.forgotPasswordLink).toBeVisible();
    await expect(mainPage.forgotPasswordLink).toBeEnabled();

    await expect(mainPage.signUpNowLink).toBeVisible();
    await expect(mainPage.signUpNowLink).toBeEnabled();

    // --- Link: Forgot your password? ---
    const forgotHref = await mainPage.forgotPasswordLink.getAttribute('href');
    await mainPage.forgotPasswordLink.click();
    if (forgotHref) {
      await expect(page).toHaveURL(new RegExp(escapeRegex(forgotHref)), { timeout: 10000 });
    }
    await mainPage.goto();

    // --- Link: Sign up now ---
    const signUpHref = await mainPage.signUpNowLink.getAttribute('href');
    await mainPage.signUpNowLink.click();
    if (signUpHref) {
      await expect(page).toHaveURL(new RegExp(escapeRegex(signUpHref)), { timeout: 10000 });
    }
    await mainPage.goto();

    // Buttons are interactable (click, but expect no navigation)
    await mainPage.signInButton.click();
    // Optionally, check for error message or no navigation
    await expect(mainPage.mainHeading).toBeVisible();

    await mainPage.ssoButton.click();
    // Optionally, check for error message or no navigation
    await expect(mainPage.mainHeading).toBeVisible();
  });
});