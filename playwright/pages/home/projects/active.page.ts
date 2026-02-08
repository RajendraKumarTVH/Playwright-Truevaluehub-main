// Page Object for the main page

import { expect, Page } from '@playwright/test';

export class MainPage {
  readonly page: import('@playwright/test').Page;

  constructor(page: import('@playwright/test').Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('https://qa.truevaluehub.com/home/projects/active');
    await this.page.waitForLoadState('networkidle');
    await this.dismissPopupsIfAny();
  }

  // Main heading
  get mainHeading() {
    return this.page.getByRole('heading', { name: "We can't sign you in" });
  }

  // Buttons
  get signInButton() {
    return this.page.locator('#next');
  }

  get trueValueHubSSOButton() {
    return this.page.locator('#TrueValueHubSSO');
  }

  // Links
  get forgotPasswordLink() {
    return this.page.locator('#forgotPassword');
  }

  get signUpNowLink() {
    return this.page.locator('#createAccount');
  }

  // Private stub for popup handling
private async dismissPopupsIfAny() {
    const popupSelectors = [
      'button:has-text("Close")',
      'button:has-text("Dismiss")',
      'button:has-text("Skip")',
      'button:has-text("Continue")',
      'button:has-text("Accept")',
      '[aria-label="Close"]',
      '[aria-label="Dismiss"]',
      '[aria-label="Skip"]',
      '[data-test="modal-close"]',
      '[data-testid="modal-close"]',
    ];

    for (const selector of popupSelectors) {
      const popup = this.page.locator(selector).first();
      try {
        if (await popup.isVisible({ timeout: 500 })) {
          await popup.click({ timeout: 1000 });
          await this.page.waitForTimeout(200);
        }
      } catch {
        // Safe to ignore if not found or not visible
      }
    }

    const overlaySelectors = [
      '.modal-backdrop',
      '.overlay',
      '[role="dialog"]',
    ];

    for (const selector of overlaySelectors) {
      const overlay = this.page.locator(selector).first();
      try {
        if (await overlay.isVisible({ timeout: 500 })) {
          await overlay.evaluate((el) => {
            (el as HTMLElement).style.display = 'none';
          });
        }
      } catch {
        // Safe to ignore
      }
    }
  }
}