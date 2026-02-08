import { test, expect, chromium } from '@playwright/test'
import { LoginPage } from '../pageFactory/pageRepository/LoginPage'

test.describe('Login Page Tests', () => {
	test.skip('Login via Azure AD SSO (email-only)', async () => {
		// Launch persistent context with default Chromium (no channel)
		const context = await chromium.launchPersistentContext('', {
			headless: false // Keep browser visible for debugging
		})

		const page = await context.newPage()

		// Initialize Page Object
		const loginPage = new LoginPage(page, context)

		// Navigate to TrueValueHub
		await page.goto('https://qa.truevaluehub.com')

		// Click SSO Login button
		await loginPage.clickLoginButtonSSO()

		// Wait for redirect back to app after SSO
		await page.waitForURL(/truevaluehub\.com\/(dashboard|home)/, {
			timeout: 30000
		})

		// Verify landing page
		await expect(page).toHaveTitle(/Dashboard|Home|True ValueHub/)
		await expect(page.getByRole('link', { name: 'Overview' })).toBeVisible()

		await context.close()
	})
})
