// A11y spec using ../fixtures/a11y, mirroring the POM test flow and reusing the same Page Object

import { a11yTest as test, assertA11y } from '../../../fixtures/a11y';
import { MainPage } from '../../../pages/home/projects/active.page';

test.describe('MainPage accessibility', () => {
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

  test('forgot password flow should have no a11y violations', async () => {
    await mainPage.forgotPasswordLink.click();
    await assertA11y(page, {
      scope: 'main, [role="main"], [data-test="main"]',
      includeTags: ['wcag2a', 'wcag2aa'],
    });
  });

  test('sign up now flow should have no a11y violations', async () => {
    await mainPage.signUpNowLink.click();
    await assertA11y(page, {
      scope: 'main, [role="main"], [data-test="main"]',
      includeTags: ['wcag2a', 'wcag2aa'],
    });
  });
});