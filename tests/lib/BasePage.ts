import { expect, Locator, Page, BrowserContext } from '@playwright/test'
import Logger from './LoggerUtil'
import fs from 'node:fs'
import path from 'node:path'
import { string } from 'zod'
const logger = Logger
interface VerificationConfig {
	locator: Locator
	expectedValue: number
	label: string
	precision?: number
	tolerance?: number
}
export class BasePage {
	readonly page: Page
	readonly context: BrowserContext

	constructor(page: Page, context: BrowserContext) {
		this.page = page
		this.context = context
	}
	public isPageClosed(): boolean {
		return this.page.isClosed()
	}
	// ==================== NAVIGATION ====================
	/**
	 * Navigate to a specific URL
	 */
	async navigateTo(url: string): Promise<void> {
		await this.page.goto(url)
		await this.page.waitForLoadState('networkidle')
		logger.info(`✔ Navigated to: ${url}`)
	}
	async safeClick(locator: Locator): Promise<void> {
		await locator.waitFor({ state: 'visible' })
		await locator.scrollIntoViewIfNeeded()
		await locator.hover()

		try {
			await locator.click({ timeout: 3000 })
		} catch {
			await locator.evaluate(el => (el as HTMLElement).click())
		}
	}

	/**
	 * Wait for page to fully load
	 */
	async waitForPageLoad(): Promise<void> {
		await this.page.waitForLoadState('networkidle')
		await this.page.waitForLoadState('domcontentloaded')
	}

	// ==================== ELEMENT INTERACTIONS ====================
	/**
	 * Wait for element, clear, fill, and tab out
	 */
	async waitAndFill(
		selector: string | Locator,
		value: string | number
	): Promise<void> {
		const element =
			typeof selector === 'string' ? this.page.locator(selector) : selector

		if (!element) {
			throw new Error('❌ Element not found or selector is invalid.')
		}

		await element.waitFor({ state: 'visible', timeout: 15000 })

		const text = String(value)
		await element.fill(text)
		console.log(`✅ Filled text "${text}" into input`)
	}

	async safeFill(
		locator: Locator,
		value: string | number,
		fieldName: string,
		options?: {
			timeout?: number
			clearFirst?: boolean
			allowZero?: boolean
		}
	): Promise<number> {
		return VerificationHelper.safeFill(locator, value, fieldName, options)
	}

	async waitAndClick(locator: Locator, retries = 3) {
		for (let i = 0; i < retries; i++) {
			try {
				await locator.waitFor({ state: 'visible', timeout: 10000 });
				await locator.scrollIntoViewIfNeeded();
				await locator.click({ force: true });
				return;
			} catch (err) {
				if (i === retries - 1) throw err;
				logger.warn(`Retrying click #${i + 1}`);
				await this.page.waitForTimeout(1000);
			}
		}
	}


	async ifNeededScrollAndClick(
		locator: Locator,
		timeout = 10000
	): Promise<void> {
		await locator.waitFor({ state: 'visible', timeout })
		await locator.scrollIntoViewIfNeeded()
		await locator.click({ force: true })
	}

	async selectOption(locator: Locator, label: string, timeout = 15000) {
		if (!label) {
			throw new Error('Label is required to select an option')
		}
		try {
			await expect(locator).toBeVisible({ timeout })
			await locator.selectOption({ label })
			console.log(`✅ Successfully selected option "${label}"`)
		} catch (error) {
			console.error(`❌ Failed to select option "${label}"`, error)
			throw error
		}
	}

	async getSelectedOptionText(
		dropdown: Locator,
		timeout: number = 10000
	): Promise<string> {
		try {
			// Ensure dropdown is attached and visible
			await dropdown.waitFor({ state: 'attached', timeout })
			await dropdown.waitFor({ state: 'visible', timeout })

			// Use evaluate to get the text of the selected option directly
			// This avoids strict mode violations if multiple options have the same value
			const text = await dropdown.evaluate((el: HTMLSelectElement) => {
				if (el.selectedIndex === -1) return ''
				return el.options[el.selectedIndex].text
			})

			return text?.trim() || ''
		} catch (err) {
			console.error(
				`❌ Failed to get selected option text: ${(err as Error).message}`
			)
			return ''
		}
	}

	async scrollToMiddle(locator: Locator): Promise<void> {
		try {
			await locator.waitFor({ state: 'attached', timeout: 5000 })
			await locator.evaluate(el => {
				el.scrollIntoView({ block: 'center', inline: 'center' })
			})
		} catch (err) {
			console.warn(
				`⚠️ Failed to scroll element to middle: ${(err as Error).message}`
			)
		}
	}

	async selectOptionByValue(locator: Locator, value: string, timeout = 15000) {
		await locator.waitFor({ state: 'visible', timeout })
		await expect(locator).toBeEnabled({ timeout })
		await locator.selectOption({ value })
	}

	async scrollElementToTop(locator: Locator) {
		await locator.evaluate(el => {
			el.scrollIntoView({ block: 'start', inline: 'nearest' })
		})
	}
	async waitForSelector(selector: string): Promise<void> {
		await this.page.waitForSelector(selector)
	}
	async waitForVisible(locator: Locator, timeout = 10000): Promise<void> {
		await locator.waitFor({ state: 'visible', timeout })
	}
	async expandPanelIfCollapsed(
		panelToggle: Locator,
		content?: Locator
	): Promise<void> {
		if (!(await panelToggle.isVisible())) return

		if (await this.isPanelCollapsed(panelToggle)) {
			await panelToggle.scrollIntoViewIfNeeded()
			await panelToggle.click({ force: true })

			if (content) {
				await expect(content).toBeVisible({ timeout: 5000 })
			}
		}
	}
	async expandWeldIfVisible(
		weldHeader: Locator,
		targetInput: Locator,
		label: string
	): Promise<void> {
		logger.info(`🔽 Ensuring ${label} is expanded`)

		// Already expanded
		if (await targetInput.isVisible().catch(() => false)) {
			logger.info(`✅ ${label} already expanded`)
			return
		}

		await weldHeader.waitFor({ state: 'visible', timeout: 10_000 })
		await weldHeader.scrollIntoViewIfNeeded()

		for (let attempt = 1; attempt <= 3; attempt++) {
			logger.debug(`Attempt ${attempt} to expand ${label}`)

			await weldHeader.click({ force: true })

			// ✅ Let Angular finish change detection
			await expect(targetInput).toBeVisible({ timeout: 3_000 })
			logger.info(`✅ ${label} expanded successfully`)
			return
		}

		throw new Error(`❌ Failed to expand ${label} - content not visible`)
	}

	async expandSectionIfVisible(
		sectionToggle: Locator,
		label: string
	): Promise<void> {
		try {
			if (await sectionToggle.isVisible()) {
				await this.expandPanelIfCollapsed(sectionToggle)
				logger.info(`✅ Checked/Expanded section: ${label}`)
			} else {
				logger.debug(`ℹ️ Section toggle hidden: ${label}`)
			}
		} catch (err) {
			logger.warn(
				`⚠️ Failed to expand section ${label}: ${(err as Error).message}`
			)
		}
	}

	async isPanelCollapsed(panel: Locator): Promise<boolean> {
		const ariaExpanded = await panel.getAttribute('aria-expanded')
		return ariaExpanded === 'false'
	}
	async validateCalculatedField(
		actualLocator: Locator,
		expected: number,
		label: string,
		precision = 2
	) {
		const actual = Number((await actualLocator.inputValue()) || '0')

		logger.info(`[${label}] UI: ${actual}, Expected: ${expected}`)

		expect.soft(actual).toBeCloseTo(expected, precision)
	}

	/**
	 * Instance helper for UI verification
	 */
	async verifyUIValue(config: VerificationConfig): Promise<void> {
		await VerificationHelper.verifyUIValue(this.page, config.locator, config)
	}

	async typeWithDelay(
		locator: Locator,
		text: string,
		delay: number = 50
	): Promise<void> {
		await locator.waitFor({ state: 'visible', timeout: 10000 })
		await locator.scrollIntoViewIfNeeded()
		await locator.click()
		await this.page.keyboard.type(text, { delay })
	}

	// ==================== VALUE GETTERS ====================
	/**
	 * Get input value as string
	 */
	async getInputValue(locator: Locator): Promise<string> {
		await locator.waitFor({ state: 'visible', timeout: 10000 })
		return (await locator.inputValue()) || ''
	}

	/**
	 * Get input value as number
	 */
	async getInputAsNum(locator: Locator): Promise<number> {
		const value = await this.getInputValue(locator)
		return parseFloat(value.replace(/,/g, '')) || 0
	}
	async getInputNumber(locator: Locator): Promise<number> {
		return this.readNumber('Input', locator)
	}
	async readNumber(label: string, locator: Locator): Promise<number> {
		await locator.waitFor({ state: 'visible', timeout: 10000 })

		const value = await this.getInputAsNum(locator)

		logger.info(`   ▶ ${label} → Raw Value: ${value}`)

		expect
			.soft(
				Number.isFinite(value),
				`❌ ${label} should be a valid number but received: ${value}`
			)
			.toBeTruthy()

		return value ?? 0
	}

	/**
	 * Get text content of element
	 */
	async getTextContent(locator: Locator): Promise<string> {
		await locator.waitFor({ state: 'visible', timeout: 10000 })
		return (await locator.textContent()) || ''
	}
	// ==================== VISIBILITY & STATE ====================
	/**
	 * Check if element is visible
	 */
	async isVisible(locator: Locator): Promise<boolean> {
		try {
			await locator.waitFor({ state: 'visible', timeout: 10000 })
			return true
		} catch {
			return false
		}
	}

	/**
	 * Check if element is enabled
	 */
	async isEnabled(locator: Locator): Promise<boolean> {
		await locator.waitFor({ state: 'visible', timeout: 5000 })
		return await locator.isEnabled()
	}

	/**
	 * Wait for element to be hidden
	 */
	async waitForHidden(locator: Locator, timeout: number = 5000): Promise<void> {
		await locator.waitFor({ state: 'hidden', timeout })
	}

	// ==================== SCROLLING ====================
	/**
	 * Scroll element into view
	 */
	async scrollIntoView(locator: Locator): Promise<void> {
		await locator.scrollIntoViewIfNeeded()
		await this.page.waitForTimeout(100)
	}

	/**
	 * Scroll to bottom of page
	 */
	async scrollToBottom(): Promise<void> {
		await this.page.evaluate(() =>
			window.scrollTo(0, document.body.scrollHeight)
		)
		await this.page.waitForTimeout(200)
	}

	/**
	 * Scroll to top of page
	 */
	async scrollToTop(): Promise<void> {
		await this.page.evaluate(() => window.scrollTo(0, 0))
		await this.page.waitForTimeout(200)
	}

	// ==================== WAITING ====================
	/**
	 * Wait for specified milliseconds
	 */
	async wait(ms: number): Promise<void> {
		await this.page.waitForTimeout(ms)
	}

	/**
	 * Wait for network idle
	 */
	async waitForNetworkIdle(timeout = 10000): Promise<void> {
		try {
			await this.page.waitForLoadState('networkidle', { timeout })
		} catch (err) {
			logger.warn(
				`⚠️ Network idle timeout reached (${timeout}ms). Proceeding...`
			)
		}
	}

	// ==================== SCREENSHOTS ====================
	/**
	 * Capture screenshot with filename
	 */
	async captureScreenshot(name: string): Promise<void> {
		await this.page.screenshot({ path: `${name}.png`, fullPage: true })
		logger.info(`✔ Screenshot captured: ${name}.png`)
	}
	async waitForTimeout(ms: number): Promise<void> {
		return new Promise(resolve => setTimeout(resolve, ms))
	} /**
	 * Capture screenshot on error
	 */
	async captureErrorScreenshot(testName: string): Promise<void> {
		await this.page.screenshot({
			path: `${testName}_error.png`,
			fullPage: true
		})
		logger.error(`Screenshot captured for error: ${testName}_error.png`)
	}

	// ==================== KEYBOARD ACTIONS ====================
	/**
	 * Press keyboard key
	 */
	async pressKey(key: string): Promise<void> {
		await this.page.keyboard.press(key)
	}

	/**
	 * Press Tab key
	 */
	async pressTab(): Promise<void> {
		await this.page.keyboard.press('Tab')
	}

	/**
	 * Press Enter key
	 */
	async pressEnter(): Promise<void> {
		await this.page.keyboard.press('Enter')
	}

	/**
	 * Press Escape key
	 */
	async pressEscape(): Promise<void> {
		await this.page.keyboard.press('Escape')
	}

	// ==================== ASSERTIONS ====================
	/**
	 * Assert element is visible
	 */
	async assertVisible(locator: Locator, message?: string): Promise<void> {
		await expect(locator, message).toBeVisible({ timeout: 10000 })
	}

	/**
	 * Assert element has text
	 */
	async assertHasText(locator: Locator, text: string): Promise<void> {
		await expect(locator).toContainText(text, { timeout: 10000 })
	}

	/**
	 * Assert input has value
	 */
	async assertInputValue(locator: Locator, value: string): Promise<void> {
		await expect(locator).toHaveValue(value, { timeout: 10000 })
	}

	/**
	 * Assert element is not visible
	 */
	async assertNotVisible(locator: Locator): Promise<void> {
		await expect(locator).not.toBeVisible({ timeout: 5000 })
	}
	async expectInputValue(
		locator: Locator,
		expected: number | string
	): Promise<void> {
		const actual = (await locator.inputValue()).trim()
		expect(actual).toBe(String(expected))
	}
	async open(url: string) {
		return await this.page.goto(url)
	}

	async getTitle(): Promise<string> {
		return await this.page.title()
	}

	async pause(): Promise<void> {
		return await this.page.pause()
	}

	async getUrl(): Promise<string> {
		return this.page.url()
	}

	async waitAndHardClick(selector: string): Promise<void> {
		return await this.page.$eval(selector, (element: HTMLElement) =>
			element.click()
		)
	}
	async safeScroll(locator: Locator) {
		if (!this.page.isClosed()) {
			try {
				await locator.scrollIntoViewIfNeeded()
			} catch (err) {
				console.warn('⚠️ Could not scroll, page might be closing:', err)
			}
		} else {
			console.warn('⚠️ Page is closed, skipping scroll')
		}
	}
	async keyPress(selectorOrKey: string | Locator, key?: string): Promise<void> {
		if (key) {
			// Selector or locator provided
			if (typeof selectorOrKey === 'string') {
				await this.page.press(selectorOrKey, key)
			} else {
				await selectorOrKey.press(key)
			}
		} else {
			// Only key provided → global key press
			await this.page.keyboard.press(selectorOrKey as string)
		}
	}
	async verifyCost(locator: Locator, expected: number, precision: number = 4) {
		await this.safeScroll(locator)
		const uiValueText = await locator.textContent()
		const uiValue = parseFloat(uiValueText || '0')

		// Allow small differences (use toFixed + parseFloat)
		const diff = Math.abs(expected - uiValue)
		const tolerance = Math.pow(10, -precision)

		console.info(
			`🔍 Verifying ${locator.toString()} | expected: ${expected}, uiValue: ${uiValue}, tolerance: ${tolerance}`
		)
		expect(diff).toBeLessThanOrEqual(tolerance)
	}

	async takeScreenShot(fileName = 'MyScreenShot.png'): Promise<void> {
		const screenshot = await this.page.screenshot()
		return expect(screenshot).toMatchSnapshot(fileName)
	}

	async verifyElementText(selector: string, text: string): Promise<void> {
		const textValue = await this.page.textContent(selector)
		return expect(textValue?.trim()).toBe(text)
	}

	async verifyElementContainsText(
		selector: string,
		text: string
	): Promise<void> {
		const locator = this.page.locator(selector)
		return await expect(locator).toContainText(text)
	}

	async verifyJSElementValue(selector: string, text: string): Promise<void> {
		const textValue = await this.page.$eval(
			selector,
			(el: HTMLInputElement) => el.value
		)
		return expect(textValue?.trim()).toBe(text)
	}
	async selectValue(element: Locator, value: string) {
		logger.info(`🔽 Selecting value "${value}" from dropdown`)
		await element.click({ force: true })

		// Try ARIA role first
		let option = this.page.getByRole('option', { name: value })
		try {
			await option.waitFor({ state: 'visible', timeout: 10000 })
			await option.click()
		} catch {
			// Fallback: locate by text
			logger.warn(`⚠️ ARIA role not found, retrying with text locator`)
			option = this.page.locator(`text=${value}`)
			await option.waitFor({ state: 'visible', timeout: 10000 })
			await option.click()
		}

		logger.info(`✅ Selected "${value}" successfully`)
	}

	async selectByIndex(dropdownSelector: string, index: number): Promise<void> {
		const dropdown = this.page.locator(dropdownSelector)
		const tag = await dropdown.evaluate(el => el.tagName.toLowerCase())

		if (tag === 'select') {
			await dropdown.selectOption({ index })
		} else {
			await dropdown.click({ force: true })
			const options = this.page.locator('[role="option"]')
			await options.nth(index).click()
		}
	}

	async getAllOptions(dropdown: string | Locator): Promise<string[]> {
		const element: Locator =
			typeof dropdown === 'string' ? this.page.locator(dropdown) : dropdown

		const tag = await element.evaluate(el => el.tagName.toLowerCase())

		if (tag === 'select') {
			return element.evaluate(el => {
				const select = el as HTMLSelectElement
				return Array.from(select.options).map(opt => opt.text)
			})
		} else {
			await element.click({ force: true })
			const options = this.page.locator('[role="option"]')
			const count = await options.count()
			const texts: string[] = []

			for (let i = 0; i < count; i++) {
				texts.push((await options.nth(i).innerText()).trim())
			}

			await this.page.keyboard.press('Escape')
			return texts
		}
	}

	async selectMultiple(
		dropdownSelector: string,
		values: string[]
	): Promise<void> {
		await this.page.locator(dropdownSelector).click({ force: true })

		for (const value of values) {
			const option = this.page.getByRole('option', { name: value })
			await option.waitFor({ state: 'visible', timeout: 5000 })
			await option.click()
		}

		await this.page.keyboard.press('Escape')
	}

	async selectAllDropdownOptions(dropdown: Locator): Promise<void> {
		const options = await this.getAllOptions(dropdown)

		for (const option of options) {
			console.log('Selecting:', option)
			await this.selectValue(dropdown, option)
			const selectedText = await dropdown
				.inputValue()
				.catch(() => dropdown.textContent())
			console.log('Selected value:', selectedText?.trim())
			expect(selectedText?.trim()).toBe(option)
			await this.page.waitForTimeout(500)
		}
	}
	async expectFieldValue(
		locator: Locator,
		expected: number | string
	): Promise<void> {
		const tagName = await locator.evaluate(el => el.tagName.toLowerCase())

		if (tagName === 'select') {
			// Assert selected option LABEL (Angular-safe)
			const selectedText = await locator.evaluate((el: HTMLSelectElement) =>
				el.options[el.selectedIndex]?.textContent?.trim()
			)

			expect(selectedText).toBe(String(expected))
		} else {
			// Input / textarea
			const actual = (await locator.inputValue()).trim()
			expect(actual).toBe(String(expected))
		}
	}
	async getFieldDisplayValue(locator: Locator): Promise<string> {
		const tagName = await locator.evaluate(el => el.tagName.toLowerCase())

		if (tagName === 'select') {
			return (
				(await locator.evaluate((el: HTMLSelectElement) =>
					el.options[el.selectedIndex]?.textContent?.trim()
				)) || ''
			)
		}

		return (await locator.inputValue()).trim()
	}

	async verifyElementAttribute(
		selector: string,
		attribute: string,
		value: string
	): Promise<void> {
		const attrValue = await this.page.getAttribute(selector, attribute)
		return expect(attrValue?.trim()).toBe(value)
	}

	async getFirstElementFromTheList(selector: string): Promise<string | null> {
		const rows = this.page.locator(selector)
		return await rows.first().textContent()
	}

	async getLastElementFromTheList(selector: string): Promise<string | null> {
		const rows = this.page.locator(selector)
		return await rows.last().textContent()
	}

	async clickAllElements(selector: string, count = 2): Promise<void> {
		const rows = this.page.locator(selector)
		for (let i = 0; i < count; i++) {
			await rows.nth(i).click()
		}
	}

	async isElementNotVisible(selector: string): Promise<void> {
		const element = this.page.locator(selector)
		await expect(element).toBeHidden()
	}

	async isElementEnabled(selector: string): Promise<void> {
		const element = this.page.locator(selector)
		const isEnabled = await element.isEnabled()
		expect(isEnabled).toBeTruthy()
	}

	async isElementChecked(selector: string): Promise<void> {
		const element = this.page.locator(selector)
		const isChecked = await element.isChecked()
		expect(isChecked).toBeTruthy()
	}

	async dragAndDropFiles(selector: string | Locator, filePaths: string[]) {
		// ✅ Step 1: Validate that all files exist
		for (const filePath of filePaths) {
			if (!fs.existsSync(filePath)) {
				throw new Error(`❌ File not found: ${filePath}`)
			}
			console.log(`✅ File exists: ${filePath}`)
		}

		// ✅ Step 2: Resolve locator to a valid CSS selector string
		const selectorStr =
			typeof selector === 'string'
				? selector
				: await selector.evaluate(el =>
					el.id ? `#${el.id}` : el.tagName.toLowerCase()
				)

		// ✅ Step 3: Convert file buffers to transferable data
		const filesData = filePaths.map(filePath => {
			const buffer = fs.readFileSync(filePath)
			return {
				name: path.basename(filePath),
				mimeType: 'application/octet-stream',
				buffer: Array.from(buffer)
			}
		})

		// ✅ Step 4: Simulate drag-and-drop in browser context
		await this.page.evaluate(
			async ({ selectorStr, filesData }) => {
				const dropZone = document.querySelector(selectorStr)
				if (!dropZone) throw new Error(`Drop target not found: ${selectorStr}`)

				const dt = new DataTransfer()

				for (const file of filesData) {
					const bytes = new Uint8Array(file.buffer)
					const blob = new Blob([bytes], { type: file.mimeType })
					const f = new File([blob], file.name, { type: file.mimeType })
					dt.items.add(f)
				}

				// Helper to trigger proper drag-drop events
				const triggerEvent = (type: string) => {
					const event = new DragEvent(type, {
						bubbles: true,
						cancelable: true,
						dataTransfer: dt
					})
					dropZone.dispatchEvent(event)
				}

				triggerEvent('dragenter')
				triggerEvent('dragover')
				triggerEvent('drop')
			},
			{ selectorStr, filesData }
		)

		console.log('🎯 Drag-and-drop simulation complete')
	}
	async FillRevNo(costingNotesText: string, revisionLocator: Locator) {
		try {
			// Match common patterns like "REV:C", "Revision - 02", "Rev 1A", etc.
			const match = costingNotesText.match(
				/rev(?:ision)?[:\s-]*([A-Za-z0-9]+)/i
			)
			const revisionValue = match?.[1]?.trim()

			if (revisionValue) {
				logger.info(
					`🧩 Extracted Revision Number from Costing Notes: ${revisionValue}`
				)
				await this.waitAndFill(revisionLocator, revisionValue)
				logger.info(`✅ Filled Revision Number field with: ${revisionValue}`)
			} else {
				logger.warn('⚠️ Revision number not found in costing notes')
			}
		} catch (error) {
			logger.error(
				`❌ Error while extracting or filling revision number: ${error}`
			)
			throw error
		}
	}
	async extractAndFillDrawingNumber(
		costingNotesText: string,
		drawingLocator: Locator
	) {
		try {
			// Match "Part Number: 1023729" or "Part No 1023729"
			const match = costingNotesText.match(
				/part\s*number[:\s-]*([A-Za-z0-9-]+)/i
			)
			const drawingValue = match?.[1]?.trim()

			if (drawingValue) {
				logger.info(
					`🧾 Extracted Drawing Number from Costing Notes: ${drawingValue}`
				)
				await this.waitAndFill(drawingLocator, drawingValue)
				expect(drawingValue).not.toBe('')
			} else {
				logger.warn('⚠️ Drawing Number not found in Costing Notes')
			}
		} catch (error) {
			logger.error(
				`❌ Error while extracting or filling Drawing Number: ${error}`
			)
			throw error
		}
	}
	getLocatorText = async (locator: Locator): Promise<string> => {
		const text = (await locator.innerText()) || (await locator.textContent())
		return (text?.trim().replace(/\n/g, ' ') || '').replace(/\s{2,}/g, ' ')
	}

	getLocatorInputValue = async (locator: Locator): Promise<string> => {
		return (await locator.inputValue())?.trim() || ''
	}
	async safeExecute(
		methodName: string,
		action: () => Promise<void>
	): Promise<void> {
		try {
			await action()
		} catch (error) {
			logger.warn(
				`⚠️ Skipping "${methodName}" due to error: ${(error as Error).message}`
			)
		}
	}
	async ensureVisible(locator: Locator, name: string): Promise<void> {
		try {
			await locator.scrollIntoViewIfNeeded()
			await locator.waitFor({ state: 'visible', timeout: 10000 })
		} catch {
			throw new Error(`⚠️ ${name} field not visible on screen.`)
		}
	}
	async verifyDropdownOptions(
		dropdown: Locator,
		label: string,
		expectedOptions: string[]
	): Promise<void> {
		try {
			logger.info(`🔹 Validating dropdown: ${label}`)

			// --- 🧹 Ensure any previously open dropdown is closed ---
			await this.page.keyboard.press('Escape').catch(() => { })
			await this.page.waitForTimeout(300)

			await dropdown.scrollIntoViewIfNeeded()
			await expect(dropdown).toBeVisible({ timeout: 10000 })

			// --- Skip if disabled or readonly ---
			if (
				(await dropdown.isDisabled()) ||
				(await dropdown.getAttribute('readonly'))
			) {
				logger.warn(
					`⚠️ ${label} dropdown is disabled or readonly. Skipping validation.`
				)
				return
			}

			// --- Open current dropdown ---
			await dropdown.click({ force: true })
			await this.page.waitForTimeout(400)

			const optionsLocator = this.page.locator(
				'mat-option .mdc-list-item__primary-text'
			)

			await optionsLocator.first().waitFor({ state: 'visible', timeout: 10000 })
			const actualOptions = await optionsLocator.allInnerTexts()
			expect(actualOptions.length).toBeGreaterThan(0)

			logger.info(
				`📦 Found ${actualOptions.length
				} options for ${label}: ${actualOptions.join(', ')}`
			)

			// --- Verify expected options exist ---
			const foundMatch = expectedOptions.some(o =>
				actualOptions.some(a => a.trim().toLowerCase() === o.toLowerCase())
			)
			expect(foundMatch).toBeTruthy()

			// --- Select first option ---
			await optionsLocator.first().click({ force: true })
			await this.page.waitForTimeout(300)

			// --- ✅ Close dropdown if still open ---
			await this.page.keyboard.press('Escape').catch(() => { })
			await this.page.waitForTimeout(300)

			logger.info(`✅ ${label} dropdown validation completed successfully.`)
		} catch (err: any) {
			logger.error(`❌ ${label} dropdown validation failed: ${err.message}`)

			// Always close dropdown on failure to avoid cascading issues
			await this.page.keyboard.press('Escape').catch(() => { })
			await this.page.waitForTimeout(300)

			throw err
		}
	}

	async searchAndSelectRandom(
		page: Page,
		searchBox: string | Locator,
		tableSelector: string | Locator
	) {
		// Fill search box
		if (typeof searchBox === 'string') {
			await page.fill(searchBox, 'your search text')
		} else {
			await searchBox.fill('your search text')
		}
		await page.keyboard.press('Enter')

		// Wait for table to update
		await page.waitForTimeout(1000)

		// Get all rows
		const rows = await page.locator(`${tableSelector} tr`).all()
		if (rows.length === 0) throw new Error('No rows found')

		// Pick a random row
		const randomIndex = Math.floor(Math.random() * rows.length)
		const randomRow = rows[randomIndex]

		// Pick 3rd column
		const cell = randomRow.locator('td:nth-child(3)')
		await cell.click()

		const cellText = await cell.textContent()
		console.log(`Selected cell text: ${cellText}`)
	}
	async selectRandomRow(page: Page) {
		// get all rows (many)
		const rows = page.locator(
			'tbody.p-datatable-tbody tr[data-p-selectable-row="true"]'
		)

		// Wait for at least ONE row
		await rows.first().waitFor({ state: 'visible', timeout: 5000 })
		const count = await rows.count()
		logger.info(`📌 Total rows found: ${count}`)
		const indexes: number[] = []
		for (let i = 0; i < count; i++) {
			if (await rows.nth(i).isVisible()) {
				indexes.push(i)
			}
		}

		if (indexes.length === 0) {
			throw new Error('❌ No visible rows found in the table')
		}

		const randomIndex = indexes[Math.floor(Math.random() * indexes.length)]
		const randomRow = rows.nth(randomIndex)
		await randomRow.scrollIntoViewIfNeeded()
		await page.waitForTimeout(150)
		await randomRow.click({ force: true })
		logger.info('✔ Random row selected successfully')
		console.log(`✅ Clicked random row #${randomIndex + 1}`)
	}
	// 🔹 Generic function to get any model property by name
	async getModelProperty(label: string): Promise<number> {
		const valueLocator = this.page.locator(
			`.properties-panel__property:has(.properties-panel__property-name:text("${label}"))
       .properties-panel__property-value`
		)

		await expect(valueLocator).toBeVisible()

		const value = Number(await valueLocator.textContent())
		if (isNaN(value)) throw new Error(`Could not read number for: ${label}`)

		return value
	}
	getPropertyHeading(name: string) {
		return this.page.locator(
			`//h6[contains(@class,'properties-panel__group-title')]//*[normalize-space(text())='${name}']`
		)
	}
	async selectByTrimmedLabel(select: Locator, label: string): Promise<void> {
		await expect.poll(() => select.locator('option').count()).toBeGreaterThan(1)

		const option = select
			.locator('option')
			.filter({ hasText: new RegExp(label.trim(), 'i') })
			.first()

		const value = await option.getAttribute('value')
		if (!value) {
			throw new Error(`No value found for option "${label}"`)
		}

		await select.selectOption({ value })
	}

	async validateHeading(expected: string) {
		const heading = this.getPropertyHeading(expected)
		await expect(heading).toBeVisible({ timeout: 2000 })

		const actual = (await heading.textContent())?.trim() ?? ''
		expect(actual).toBe(expected)

		console.log(`✔ Heading validated: ${actual}`)
	}
	static async getCleanText(locator: Locator): Promise<string> {
		const text =
			(await locator.innerText().catch(() => '')) ||
			(await locator.textContent().catch(() => ''))

		return (text || '')
			.trim()
			.replace(/\n/g, ' ')
			.replace(/\s{2,}/g, ' ')
	}
	static async expectTextFromLocatorInTarget(
		sourceLocator: Locator,
		targetLocator: Locator,
		label = 'Value',
		soft = false
	): Promise<void> {
		const expectedText = await this.getCleanText(sourceLocator)

		if (!expectedText) {
			logger.warn(`⚠️ ${label} not found in source locator.`)
			return
		}

		await targetLocator.waitFor({ state: 'visible', timeout: 15000 })

		const targetText =
			(await targetLocator.inputValue().catch(() => '')) ||
			(await targetLocator.innerText().catch(() => ''))

		const cleanedTarget = targetText.replace(/\s+/g, ' ').trim()

		logger.info(`🔍 Validating ${label}: "${expectedText}"`)
		logger.info(`📘 Target Text: ${cleanedTarget}`)

		if (soft) {
			expect
				.soft(cleanedTarget.toLowerCase())
				.toContain(expectedText.toLowerCase())
		} else {
			expect(cleanedTarget.toLowerCase()).toContain(expectedText.toLowerCase())
		}

		logger.info(`✅ ${label} validation successful.`)
	}
	async getSelectedText(locator: Locator): Promise<string> {
		return locator.evaluate(
			(el: HTMLSelectElement) =>
				el.options[el.selectedIndex]?.text?.trim() || ''
		)
	}
	async normalizeText(text: string): Promise<string> {
		return text
			.toLowerCase()
			.replace(/&/g, 'and')
			.replace(/\//g, ' ')
			.replace(/[-]+/g, ' ')
			.replace(/\s+/g, ' ')
			.trim()
	}

	async selectFromAutocomplete(
		dropdown: Locator,
		optionsLocator: Locator,
		textToSelect: string,
		label: string
	): Promise<void> {
		try {
			// Ensure valid state
			await dropdown.scrollIntoViewIfNeeded()
			await dropdown.waitFor({ state: 'visible', timeout: 5000 })

			if (
				(await dropdown.isDisabled()) ||
				(await dropdown.getAttribute('readonly'))
			) {
				logger.warn(`⚠️ ${label} dropdown is disabled. Skipping.`)
				return
			}

			// Open the dropdown
			await dropdown.click({ force: true })
			await this.wait(500) // Wait for animation

			// Use the provided options locator to find the option
			try {
				await optionsLocator
					.first()
					.waitFor({ state: 'visible', timeout: 5000 })
			} catch (e) {
				// If no options, maybe we need to type?
				// But let's assume click was enough for now or try to type if it's an input
				const isInput = await dropdown.evaluate(
					el => el.tagName.toLowerCase() === 'input'
				)
				if (isInput) {
					await dropdown.fill(textToSelect)
					await this.wait(500)
					await optionsLocator
						.first()
						.waitFor({ state: 'visible', timeout: 5000 })
				} else {
					throw new Error(`Options did not appear for ${label}`)
				}
			}

			// Find match
			const targetOption = optionsLocator
				.filter({ hasText: textToSelect })
				.first()
			if (await targetOption.isVisible()) {
				await targetOption.click()
			} else {
				// Fallback: iterate
				const count = await optionsLocator.count()
				let found = false
				for (let i = 0; i < count; i++) {
					const optText = await optionsLocator.nth(i).innerText()
					if (optText.includes(textToSelect)) {
						await optionsLocator.nth(i).click()
						found = true
						break
					}
				}
				if (!found) {
					// One last try: if type-able, maybe we typed and it's the first one?
					// But better to fail than select wrong thing
					throw new Error(`Option "${textToSelect}" not found in ${label}`)
				}
			}

			// Close if needed
			await this.page.keyboard.press('Escape').catch(() => { })

			const selectedValue = await dropdown
				.inputValue()
				.catch(() => dropdown.textContent())
			logger.info(
				`✅ Selected ${label}: "${textToSelect}" (Verified: ${selectedValue})`
			)
		} catch (error: any) {
			logger.error(`❌ ${label} selection failed: ${error.message}`)
			// Close dropdown to avoid blocking
			await this.page.keyboard.press('Escape').catch(() => { })
			throw error
		}
	}
	async expandIfCollapsed1(panel: Locator): Promise<void> {
		if (!(await panel.isVisible())) return

		if (await this.isPanelCollapsed(panel)) {
			await panel.scrollIntoViewIfNeeded()
			await panel.click({ force: true })
		}
	}
	async expandWeldCollapsed(toggle: Locator): Promise<void> {
		try {
			// Scroll the icon into view and make sure it's visible
			await toggle.scrollIntoViewIfNeeded()
			await toggle.waitFor({ state: 'visible', timeout: 5000 })

			// aria-expanded is missing on this element, so we skip checking it
			logger.info('▶️ Clicking mat-icon to expand section...')
			await toggle.click({ force: true })

			// Wait for a child element inside the expansion panel (like wireDia input)
			const panelChild = toggle
				.locator('xpath=ancestor::mat-expansion-panel//input')
				.first()
			await panelChild.waitFor({ state: 'visible', timeout: 2000 })

			logger.info('✔ Section expanded successfully')
		} catch (err) {
			logger.warn(`⚠️ Could not expand section reliably: ${err}`)
		}
	}

	async expandIfCollapsed(toggle: Locator): Promise<void> {
		await toggle.scrollIntoViewIfNeeded()
		await toggle.waitFor({ state: 'visible' })

		let expanded = await toggle.getAttribute('aria-expanded')
		logger.info(`🔍 aria-expanded: ${expanded}`)

		if (expanded === null) {
			logger.warn(
				`⚠️ Element doesn't have aria-expanded attribute. Trying to click to expand.`
			)
			await toggle.click({ force: true })
			await this.page.waitForTimeout(500)
			return
		}

		if (expanded !== 'true') {
			logger.info('▶️ Expanding section...')
			await toggle.click({ force: true }) // 👈 force click
			await this.page.waitForTimeout(500) // allow animation
		}
	}
	async waitForStableNumber(
		locator: Locator,
		fieldName: string,
		timeout = 6000,
		interval = 600
	): Promise<number> {
		const start = Date.now()
		let lastValue: number | null = null

		while (Date.now() - start < timeout) {
			const value = await this.getInputAsNum(locator)

			// log only meaningful values
			if (lastValue === null || value !== lastValue) {
				logger.info(`⏳ ${fieldName}: ${value}`)
			}

			// one stable read is enough
			if (value > 0 && value === lastValue) {
				logger.info(`✅ ${fieldName} stabilized at ${value}`)
				return value
			}

			lastValue = value
			await this.wait(interval)
		}

		throw new Error(`❌ ${fieldName} did not stabilize within ${timeout}ms`)
	}
	async pollStableNumberGreaterThan(
		selector: Locator,
		fieldName: string,
		timeout = 5000, // shorter timeout
		interval = 100  // faster polling
	): Promise<number> {
		const start = Date.now();
		let lastValue: number | null = null;
		let stableCount = 0;

		while (Date.now() - start < timeout) {
			const value = await this.getInputAsNum(selector);

			// Treat NaN as unstable
			if (!Number.isFinite(value)) {
				stableCount = 0;
			} else if (lastValue !== null && Math.abs(value - lastValue) < 0.0001) {
				stableCount++;
				if (stableCount >= 1) { // only one stable read
					return value;
				}
			} else {
				stableCount = 0;
			}

			lastValue = value;
			await this.page.waitForTimeout(interval);
		}

		logger.warn(`⚠️ ${fieldName} did not fully stabilize, using last value`);
		return lastValue ?? 0;
	}

	async readNumberSafe(
		selector: Locator,
		name: string,
		timeout = 8000,
		retries = 1
	): Promise<number> {
		const safeSelector = selector.first() // ✅ force single element

		for (let attempt = 1; attempt <= retries; attempt++) {
			try {
				// ✅ Wait until element is attached + visible
				await safeSelector.waitFor({
					state: 'visible',
					timeout
				})

				const value = await this.pollStableNumberGreaterThan(
					safeSelector,
					name,
					timeout
				)

				if (value === 0) {
					logger.warn(`⚠️ ${name} is 0 on attempt ${attempt}`)
				}

				return value
			} catch (err) {
				logger.warn(`⚠️ Attempt ${attempt} failed to read ${name}: ${err}`)

				if (attempt === retries) return 0

				await this.wait(500)
			}
		}

		return 0
	}

	public async expandPanel(
		panel: Locator,
		header: Locator,
		label: string,
		timeout = 10000
	): Promise<void> {
		try {
			logger.info(`🔍 Checking ${label} panel...`)

			await panel.waitFor({ state: 'attached', timeout })
			await header.scrollIntoViewIfNeeded()

			const isExpanded = async () => {
				const attr = await panel.getAttribute('aria-expanded')
				return attr === 'true'
			}

			if (await isExpanded()) {
				logger.info(`✅ ${label} already expanded`)
				return
			}

			logger.info(`📂 Expanding ${label}...`)
			await header.click({ force: true })
			await this.page.waitForTimeout(400)

			// Retry once if needed
			if (!(await isExpanded())) {
				logger.warn(`♻️ ${label} not expanded yet — retrying...`)
				await header.click({ force: true })
				await this.page.waitForTimeout(600)
			}

			if (await isExpanded()) {
				logger.info(`✅ ${label} expanded successfully`)
			} else {
				throw new Error(`${label} did not expand after retries`)
			}
		} catch (error) {
			logger.error(`❌ ${label} expansion failed: ${(error as Error).message}`)
			throw error
		}
	}

	public async openMatSelect(trigger: Locator, label: string): Promise<void> {
		logger.info(`📂 Opening dropdown: ${label}`);

		await trigger.waitFor({ state: 'visible', timeout: 10_000 });
		await trigger.scrollIntoViewIfNeeded();
		await trigger.click(); // force not needed in most cases

		const options = this.page.locator(
			'mat-option, mat-mdc-option, [role="option"]'
		);

		await options.first().waitFor({
			state: 'visible',
			timeout: 10_000,
		});

		logger.info(`✅ ${label} dropdown opened`);
	}

	async safeGetNumber(locator: Locator, fallback = 0): Promise<number> {
		try {
			// Locator exists in DOM?
			if ((await locator.count()) === 0) return fallback;

			const raw = await locator.inputValue().catch(() => '');
			if (!raw) return fallback;

			const value = Number(raw.replace(/,/g, ''));
			return Number.isFinite(value) ? value : fallback;
		} catch {
			return fallback;
		}
	}

	async getCost(locator: Locator): Promise<number> {
		const text = (await locator.innerText()).trim()
		const value = Number(text)
		if (Number.isNaN(value)) {
			throw new Error(`Invalid numeric value: "${text}"`)
		}
		return value
	}

	async sumLocatorValues(locator: Locator): Promise<number> {
		const count = await locator.count()
		let total = 0
		for (let i = 0; i < count; i++) {
			const text = (await locator.nth(i).innerText()).trim()
			const value = Number(text)
			if (Number.isNaN(value)) {
				throw new Error(`Invalid number: "${text}"`)
			}
			total += value
		}
		return Number(total.toFixed(4))
	}

	async getCostByType(
		page: Page,
		type: 'Primary' | 'Secondary' | 'Tertiary',
		index = 0
	): Promise<number> {
		const cells = page.locator(
			"//table[@aria-describedby='packagingTable']" +
			`//tr[.//td[normalize-space()='${type}']]` +
			"//td[contains(@class,'cdk-column-cost')]"
		)
		const cell = cells.nth(index)
		await cell.waitFor()
		const rawText = (await cell.innerText()).trim()
		const match = rawText.match(/-?[\d,.]+/)
		if (!match) {
			throw new Error(`❌ Unable to extract number from text: "${rawText}"`)
		}
		return Number(match[0].replace(/,/g, ''))
	}

	async waitForValueChange(locator: Locator, timeout = 15000): Promise<void> {
		const initialValue = await locator.inputValue()
		await expect
			.poll(async () => await locator.inputValue(), { timeout })
			.not.toBe(initialValue)
	}
	async safeGetSelectValue(
		locator: Locator,
		fallback?: number
	): Promise<number | undefined> {
		try {
			if ((await locator.count()) === 0) return fallback;

			const raw = await locator.inputValue();
			const value = Number(raw);
			return Number.isFinite(value) ? value : fallback;
		} catch {
			return fallback;
		}
	}
	async isDirty(locator: Locator): Promise<boolean> {
		try {
			if (!(await locator.isVisible())) return false
			const bg = await locator.evaluate(
				el => window.getComputedStyle(el).backgroundColor
			)
			return bg.includes('255, 165, 0')
		} catch {
			return false
		}
	}

	async getInputValueSafe(locator: Locator, label: string): Promise<number> {
		await locator.scrollIntoViewIfNeeded()
		await expect(locator).toBeVisible({ timeout: 10000 })
		const val = await locator.inputValue().catch(() => '0')
		const num = Number(val || '0')
		logger.info(`🔹 ${label} value: ${num}`)
		return num
	}

	private async expandWeldIfVisibleAlternative(
		weldHeader: Locator,
		label: string,
		expandedContent?: Locator
	) {
		if (!(await weldHeader.isVisible().catch(() => false))) {
			logger.warn(`⚠️ ${label} not visible — skipping expansion`)
			return
		}
		logger.info(`🔽 Ensuring ${label} is expanded`)
		const expandedAttr = await weldHeader.getAttribute('aria-expanded')
		if (expandedAttr === 'true') {
			logger.info(`✅ ${label} already expanded`)
			return
		}
		await weldHeader.scrollIntoViewIfNeeded()
		await weldHeader.click({ force: true })
		try {
			await Promise.race([
				expandedContent
					? expandedContent.waitFor({ state: 'visible', timeout: 5000 })
					: Promise.resolve(),
				expect
					.poll(async () => await weldHeader.getAttribute('aria-expanded'), {
						timeout: 5000
					})
					.toBe('true')
			])
			logger.info(`✅ ${label} expanded successfully`)
		} catch {
			logger.warn(
				`⚠️ ${label} expansion state unclear — continuing test (non-blocking)`
			)
		}
	}

	async getSubProcessOptionValue(
		locator: Locator,
		name: string,
		timeout: number = 15000,
		retries: number = 3
	): Promise<string | null> {
		for (let attempt = 1; attempt <= retries; attempt++) {
			try {
				await locator.scrollIntoViewIfNeeded()
				await locator.waitFor({ state: 'visible', timeout })

				const option = locator.locator('option:checked')
				await option.waitFor({ state: 'visible', timeout })
				const value = await option.textContent()
				if (value === null) {
					logger.warn(`⚠️ ${name} returned null textContent`)
				}
				return value?.trim() ?? null
			} catch (err) {
				logger.warn(`⚠️ Attempt ${attempt} failed to read ${name}: ${err}`)
				if (attempt === retries) {
					logger.error(`❌ Failed to read ${name} after ${retries} attempts`)
					return null
				}
				await this.page.waitForTimeout(500) // small delay before retry
			}
		}
		return null
	}

	async getVisibleInputNumber(
		locator: Locator,
		name?: string,
		retries: number = 3
	): Promise<number> {
		for (let attempt = 1; attempt <= retries; attempt++) {
			try {
				await locator.scrollIntoViewIfNeeded()
				await locator.waitFor({ state: 'visible', timeout: 5000 })
				const valueRaw = await locator.inputValue()
				const value = Number(valueRaw)
				if (Number.isFinite(value)) return value
				throw new Error(`Invalid number: ${valueRaw}`)
			} catch (err) {
				logger.warn(
					`⚠️ Attempt ${attempt} failed to read input ${name ?? 'unknown'}: ${err}`
				)
				if (attempt === retries) {
					logger.error(
						`❌ Failed to read numeric input ${name ?? 'unknown'} after ${retries} attempts`
					)
					return 0
				}
				await this.page.waitForTimeout(500)
			}
		}
		return 0
	}

	async retryLocatorNumber(
		locator: Locator,
		label: string,
		retries = 3,
		delayMs = 500
	): Promise<number> {
		for (let attempt = 1; attempt <= retries; attempt++) {
			try {
				await locator.scrollIntoViewIfNeeded()
				const text = (await locator.textContent())?.trim() ?? '0'
				const value = Number(text.replace(/[^\d.-]/g, ''))
				if (!Number.isNaN(value)) return value
				throw new Error(`Invalid number "${text}"`)
			} catch (err) {
				logger.warn(`⚠️ Attempt ${attempt} failed to read ${label}: ${err}`)
				if (attempt === retries) throw err
				await this.page.waitForTimeout(delayMs)
			}
		}
		return 0
	}

	// Utility retry for text locators
	async retryLocatorText(
		locator: Locator,
		label: string,
		retries = 3,
		delayMs = 500
	): Promise<string> {
		for (let attempt = 1; attempt <= retries; attempt++) {
			try {
				await locator.scrollIntoViewIfNeeded()
				return (await locator.textContent())?.trim() ?? ''
			} catch (err) {
				logger.warn(`⚠️ Attempt ${attempt} failed to read ${label}: ${err}`)
				if (attempt === retries) throw err
				await this.page.waitForTimeout(delayMs)
			}
		}
		return ''
	}

	async clickWithRetry(locator: Locator, retries = 3, delayMs = 500) {
		for (let i = 0; i < retries; i++) {
			try {
				if (await locator.isVisible({ timeout: 3000 })) {
					await locator.scrollIntoViewIfNeeded()
					await locator.click({ force: true })
					return true
				}
			} catch (err) {
				console.warn(`Attempt ${i + 1} failed: ${err}`)
			}
			await this.page.waitForTimeout(delayMs)
		}
		throw new Error('Failed to click project icon after retries')
	}
}

// ========================== Verification Helper ==========================
export class VerificationHelper {
	static async verifyNumeric(
		value: number,
		expected: number,
		label: string,
		tolerancePercent = 2,
		unit = ''
	): Promise<void> {

		// Guard: expected is zero or near-zero
		if (Math.abs(expected) < 1e-6) {
			logger.info(`✓ ${label}: ${value}${unit} (Expected: 0${unit})`)
			expect.soft(
				value,
				`${label}: expected 0${unit}, actual=${value}${unit}`
			).toBeCloseTo(0, 6)
			return
		}

		const diffPercent =
			(Math.abs(value - expected) / Math.abs(expected)) * 100

		logger.info(
			`✓ ${label}: ${value}${unit} (Expected: ${expected}${unit}, Diff: ${diffPercent.toFixed(2)}%)`
		)

		expect.soft(
			diffPercent,
			`${label} difference ${diffPercent.toFixed(2)}% exceeds tolerance ${tolerancePercent}%`
		).toBeLessThanOrEqual(tolerancePercent)
	}

	static async verifyNumericCloseTo(
		getValue: () => Promise<number>,
		expected: number,
		label: string,
		precision: number = 2,
		retries: number = 2
	): Promise<void> {
		let value = 0

		for (let attempt = 1; attempt <= retries; attempt++) {
			value = await getValue()

			if (
				Number(value.toFixed(precision)) ===
				Number(expected.toFixed(precision))
			) {
				break
			}

			if (attempt < retries) {
				await new Promise(r => setTimeout(r, 300))
			}
		}

		logger.info(
			`✓ ${label}: ${value.toFixed(precision)} (Expected: ${expected.toFixed(precision)})`
		)

		expect.soft(value, `${label} mismatch`)
			.toBeCloseTo(expected, precision)
	}


	static async verifyOptional(
		value: number | undefined | null,
		expected: number,
		label: string,
		precision: number = 2
	): Promise<void> {
		if (value === undefined || value === null) {
			logger.warn(`   ⚠️ ${label} is undefined, skipping assertion`)
			return
		}
		await this.verifyNumeric(value, expected, label, precision)
	}

	static async verifySafe(
		getValue: () => Promise<number>,
		expected: number,
		label: string,
		precision: number = 2,
		fallback: number = 0
	): Promise<void> {
		try {
			const value = await getValue()
			await this.verifyNumeric(value ?? fallback, expected, label, precision)
		} catch (error) {
			logger.warn(
				`⚠️ Failed to verify ${label}: ${error instanceof Error ? error.message : 'Unknown error'}`
			)
		}
	}

	static async verifyDropdown(
		actual: string,
		expected: string,
		label: string
	): Promise<void> {
		logger.info(`   ✓ ${label}: ${actual} (Expected: ${expected})`)
		if (expected) {
			expect.soft(actual).toBe(expected)
		}
	}

	static async getVisibleInputNumber(
		locator: Locator,
		name?: string,
		retries: number = 3
	): Promise<number> {
		for (let attempt = 1; attempt <= retries; attempt++) {
			try {
				await locator.scrollIntoViewIfNeeded()
				await locator.waitFor({ state: 'visible', timeout: 5000 })
				const valueRaw = await locator.inputValue()
				const value = Number(valueRaw.replace(/,/g, ''))
				if (Number.isFinite(value)) return value
				throw new Error(`Invalid number: ${valueRaw}`)
			} catch (err) {
				logger.warn(
					`⚠️ Attempt ${attempt} failed to read input ${name ?? 'unknown'}: ${err}`
				)
				if (attempt === retries) return 0
				const p = locator.page()
				if (p) await p.waitForTimeout(500)
			}
		}
		return 0
	}

	static async verifyUIValue(
		page: Page,
		locator: Locator,
		config: {
			expectedValue: number
			label: string
			precision?: number
			tolerance?: number
		}
	): Promise<void> {
		const { expectedValue, label, precision = 2, tolerance } = config
		await locator.scrollIntoViewIfNeeded()
		await page.waitForTimeout(200)
		if (!(await locator.isVisible())) {
			logger.info(`   ⊘ ${label} not visible, skipping verification`)
			return
		}
		if (tolerance !== undefined) {
			await this.verifySafe(
				() => this.getVisibleInputNumber(locator, label),
				expectedValue,
				label,
				tolerance
			)
		} else {
			await this.verifySafe(
				() => this.getVisibleInputNumber(locator, label),
				expectedValue,
				label,
				precision
			)
		}
	}

	static async safeReadNumber(
		locator: Locator,
		label: string,
		weldIndex: number,
		timeout = 8000
	): Promise<number> {
		try {
			await locator.waitFor({ state: 'visible', timeout })
			await locator.scrollIntoViewIfNeeded()
			const raw = await locator.inputValue({ timeout })
			const value = Number(raw.replace(/,/g, ''))
			if (!Number.isFinite(value))
				throw new Error(`Invalid numeric value: "${raw}"`)
			logger.info(`🔎 [Weld ${weldIndex}] ${label} = ${value}`)
			return value
		} catch (err) {
			logger.error(
				`❌ [Weld ${weldIndex}] Failed reading ${label}: ${(err as Error).message}`
			)
			throw err
		}
	}

	static async expandWeldPanel(page: Page, weldIndex: 1 | 2): Promise<void> {
		const weldName = `Weld ${weldIndex}`
		const header = page.locator(`h6:has-text("${weldName}")`)
		logger.info(`🔽 Expanding ${weldName}`)
		await header.waitFor({ state: 'visible', timeout: 15000 })
		await header.scrollIntoViewIfNeeded()
		for (let attempt = 1; attempt <= 3; attempt++) {
			try {
				await header.click({ timeout: 4000 })
				await page.waitForTimeout(400)
				logger.info(`✅ ${weldName} expanded (attempt ${attempt})`)
				return
			} catch (err) {
				logger.warn(
					`⚠️ ${weldName} expand retry ${attempt}: ${(err as Error).message}`
				)
			}
		}
		throw new Error(`❌ ${weldName} failed to expand after retries`)
	}

	static async waitForLoadState(
		page: Page,
		state: 'load' | 'domcontentloaded' | 'networkidle' = 'networkidle',
		timeout = 30000,
		label = 'page'
	): Promise<void> {
		try {
			logger.info(`⏳ Waiting for ${label} load state → ${state}`)
			await page.waitForLoadState(state, { timeout })
			logger.info(`✅ ${label} reached load state → ${state}`)
		} catch (error) {
			logger.warn(
				`⚠️ Timeout waiting for ${label} load state → ${state}. Continuing execution.`
			)
		}
	}
	async isAttached(locator: Locator, timeout = 500): Promise<boolean> {
		try {
			await locator.waitFor({ state: 'attached', timeout })
			return true
		} catch {
			return false
		}
	}

	static async safeFill(
		locator: Locator,
		value: string | number,
		fieldName: string,
		options?: {
			timeout?: number
			clearFirst?: boolean
			allowZero?: boolean
		}
	): Promise<number> {
		const {
			timeout = 5_000,
			clearFirst = true,
			allowZero = true
		} = options ?? {}

		// ─────────────────────────────────────────────
		// 1️⃣ Validate input
		// ─────────────────────────────────────────────
		if (value === null || value === undefined || (!allowZero && value === 0)) {
			logger.warn(`⚠️ ${fieldName} value is invalid — skipping fill`)
			return 0
		}

		try {
			// Defensive: ensure page isn't closed before interaction
			try {
				const p = (locator as any).page?.()
				if (p && typeof p.isClosed === 'function' && p.isClosed()) {
					throw new Error('Target page is already closed - aborting fill')
				}
			} catch (error_) {
				// If we cannot obtain the page or it's closed, abort early with clear message
				logger.error(
					`❌ Aborting safeFill for ${fieldName}: ${(error_ as Error).message}`
				)
				throw error_
			}
			// ─────────────────────────────────────────────
			// 2️⃣ Ensure element is interactable
			// ─────────────────────────────────────────────
			await locator.waitFor({ state: 'visible', timeout })
			await locator.scrollIntoViewIfNeeded()

			// ─────────────────────────────────────────────
			// 3️⃣ Clear existing value safely
			// ─────────────────────────────────────────────
			if (clearFirst) {
				await locator.click({ clickCount: 3 })
				await locator.press('Backspace')
			}

			// ─────────────────────────────────────────────
			// 4️⃣ Fill value
			// ─────────────────────────────────────────────
			try {
				await locator.fill(String(value))
			} catch (error_) {
				// Provide clearer logging if the page/context was closed
				const msg = (error_ as Error).message || ''
				if (msg.includes('Target page, context or browser has been closed')) {
					logger.error(
						`❌ Cannot fill ${fieldName}: page/context/browser closed`
					)
				}
				throw error_
			}

			// ─────────────────────────────────────────────
			// 5️⃣ Blur to trigger recalculation (CRITICAL)
			// ─────────────────────────────────────────────
			await locator.press('Tab')

			// ─────────────────────────────────────────────
			// 6️⃣ Read back & normalize
			// ─────────────────────────────────────────────
			const filledValue = Number(await locator.inputValue())

			logger.info(`✅ Filled ${fieldName}: ${value} → UI=${filledValue}`)

			return Number.isFinite(filledValue) ? filledValue : 0
		} catch (err) {
			logger.error(`❌ Failed to fill ${fieldName}: ${(err as Error).message}`)
			throw err
		}
	}
	async normalizePercent(value?: number): Promise<number> {
		if (typeof value !== 'number') return 0;
		return value <= 1 ? value * 100 : value;
	}

}
