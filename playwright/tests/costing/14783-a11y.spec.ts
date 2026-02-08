// A11y spec using ../fixtures/a11y, mirroring the POM test flow and reusing the same Page Object

import { a11yTest as test, assertA11y } from '../../fixtures/a11y';
import { MainPage } from '../../pages/costing/14783.page';
import { expect } from '@playwright/test';

test.describe('Main Page Accessibility', () => {
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

  test('base state should have no a11y violations', async () => {
    await assertA11y(page, {
      scope: 'main, [role="main"], [data-test="main"]',
      includeTags: ['wcag2a', 'wcag2aa'],
    });
  });

  test('forgot password page should have no a11y violations', async () => {
    const forgotHref = await mainPage.forgotPasswordLink.getAttribute('href');
    await mainPage.forgotPasswordLink.click();
    if (forgotHref) {
      await expect(page).toHaveURL(new RegExp(forgotHref));
    }
    await assertA11y(page, {
      scope: 'main, [role="main"], [data-test="main"]',
      includeTags: ['wcag2a', 'wcag2aa'],
    });
    await mainPage.goto();
  });

  test('sign up now page should have no a11y violations', async () => {
    const signUpHref = await mainPage.signUpNowLink.getAttribute('href');
    await mainPage.signUpNowLink.click();
    if (signUpHref) {
      await expect(page).toHaveURL(new RegExp(signUpHref));
    }
    await assertA11y(page, {
      scope: 'main, [role="main"], [data-test="main"]',
      includeTags: ['wcag2a', 'wcag2aa'],
    });
    await mainPage.goto();
  });
});