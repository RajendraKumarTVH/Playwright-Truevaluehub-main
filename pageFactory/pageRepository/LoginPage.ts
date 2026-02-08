import { Page, BrowserContext, Locator, expect } from '@playwright/test'
import { WebActions } from '@lib/WebActions'
import logger from '@lib/LoggerUtil'
import { testConfig } from '../../testConfig'

export class LoginPage {
	readonly page: Page
	readonly context: BrowserContext
	readonly webActions: WebActions

	// ---------- Locators ----------
	readonly LoginHeading: Locator
	readonly TrueValueHubSSo: Locator
	readonly PageTitle: Locator
	readonly UsernameInput: Locator
	readonly PasswordInput: Locator
	readonly SubmitButton: Locator

	constructor(page: Page, context: BrowserContext) {
		this.page = page
		this.context = context
		this.webActions = new WebActions(this.page, this.context)

		this.LoginHeading = page.locator('//h1[normalize-space(text())="Sign in"]')
		this.TrueValueHubSSo = page.locator('#TrueValueHubSSO')
		this.PageTitle = page.locator('.logo-title')
		this.UsernameInput = page.locator('input[name="Username"]')
		this.PasswordInput = page.locator('input[type="password"]')
		this.SubmitButton = page.locator('button[type="submit"]')
	}

	// ============================================================
	// Navigation
	// ============================================================

	async navigateToURL(): Promise<void> {
		logger.info(`🌐 Navigating to: ${testConfig.qa}`)
		await this.page.goto(testConfig.qa, { waitUntil: 'load' })
		await this.page.waitForLoadState('domcontentloaded')
	}

	// ============================================================
	// Main Login Flow
	// ============================================================

	async loginToApplication(): Promise<void> {
		logger.info('🔑 Starting Login Flow...')

		await this.navigateToURL()

		// Give SPA time to stabilize (no hard sleep dependency)
		await this.LoginHeading.first().waitFor({ state: 'visible', timeout: 8000 }).catch(() => null)

		if (!(await this.isLoginPage())) {
			logger.info('✅ Already logged in, skipping SSO flow.')
			await this.verifyPageTitle()
			return
		}

		await this.openSSOIfVisible()
		await this.performSSOLoginIfRequired()
		await this.verifyPageTitle()
	}

	// ============================================================
	// SSO Actions
	// ============================================================

	private async openSSOIfVisible(): Promise<void> {
		if (await this.TrueValueHubSSo.isVisible({ timeout: 5000 }).catch(() => false)) {
			logger.info('🖱️ Clicking SSO button...')
			await this.TrueValueHubSSo.scrollIntoViewIfNeeded()
			await this.TrueValueHubSSo.click({ force: true })
		} else {
			logger.info('ℹ️ SSO button not visible — possibly already redirected.')
		}
	}

	private async performSSOLoginIfRequired(): Promise<void> {
		try {
			if (!(await this.UsernameInput.isVisible({ timeout: 6000 }).catch(() => false))) {
				logger.info('ℹ️ Username field not visible — login probably already completed.')
				return
			}

			logger.info('📧 Entering SSO credentials...')

			await this.safeType(
				this.UsernameInput,
				testConfig.username,
				'Username'
			)

			await this.safeType(
				this.PasswordInput,
				testConfig.password,
				'Password'
			)

			await this.SubmitButton.waitFor({ state: 'visible', timeout: 5000 })
			await this.SubmitButton.click()

			logger.info('🚀 Login form submitted')

		} catch (error) {
			logger.error(`❌ Failed during SSO login: ${(error as Error).message}`)
			throw error
		}
	}

	private async safeType(
		locator: Locator,
		value: string,
		label: string
	): Promise<void> {
		await locator.waitFor({ state: 'visible', timeout: 8000 })
		await locator.scrollIntoViewIfNeeded()
		await locator.click({ force: true })

		await locator.fill('')
		await this.page.waitForTimeout(150)
		await locator.type(value, { delay: 60 })
		await expect(locator).toHaveValue(value, { timeout: 3000 })
		logger.info(`✅ ${label} entered successfully`)
	}

	async verifyPageTitle(): Promise<void> {
		try {
			await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 })
			await expect(this.page).toHaveTitle(/True\s*ValueHub/i, {
				timeout: 30000
			})

			if (await this.PageTitle.isVisible().catch(() => false)) {
				logger.info('🖼️ Logo title is visible')
			}

			logger.info('✅ Login verified successfully')
		} catch (error) {
			logger.error('❌ Login verification failed')
			logger.error(`🌐 Current URL: ${this.page.url()}`)
			throw error
		}
	}
	async isLoginPage(): Promise<boolean> {
		try {
			logger.info('🔍 Checking if login page is visible...')

			const isSsoVisible = await this.TrueValueHubSSo
				.isVisible({ timeout: 2000 })
				.catch(() => false)

			const isUsernameVisible = await this.UsernameInput
				.isVisible({ timeout: 2000 })
				.catch(() => false)

			logger.info(`   • SSO Button Visible     : ${isSsoVisible}`)
			logger.info(`   • Username Input Visible: ${isUsernameVisible}`)

			return isSsoVisible || isUsernameVisible
		} catch {
			return false
		}
	}
}
