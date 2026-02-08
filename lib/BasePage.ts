import { expect, Locator, Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'
import * as XLSX from 'xlsx'
import logger from '../lib/LoggerUtil'
import { O } from '@faker-js/faker/dist/airline-DF6RqYmq'

export default class BasePage {
	page: Page

	constructor(page: Page) {
		this.page = page
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

	async wait(timeout = 10000): Promise<void> {
		return this.page.waitForTimeout(timeout)
	}

	async waitForPageLoad(): Promise<void> {
		return await this.page.waitForLoadState('domcontentloaded')
	}

	async waitAndClick(selector: string): Promise<void> {
		return await this.page.click(selector)
	}

	async waitAndHardClick(selector: string): Promise<void> {
		return await this.page.$eval(selector, (element: HTMLElement) =>
			element.click()
		)
	}

	async waitAndFill(selector: string | Locator, text: string): Promise<void> {
		const element =
			typeof selector === 'string' ? this.page.locator(selector) : selector

		if (!element) {
			throw new Error('❌ Element not found or selector is invalid.')
		}

		await element.waitFor({ state: 'visible', timeout: 10000 })
		await element.fill(text)
		console.log(`✅ Filled text "${text}" into ${selector}`)
	}

	async keyPress(selector: string | Locator, key: string): Promise<void> {
		if (typeof selector === 'string') {
			await this.page.press(selector, key)
		} else {
			await selector.press(key)
		}
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
			await option.waitFor({ state: 'visible', timeout: 3000 })
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
			await this.page.keyboard.press('Escape').catch(() => {})
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
				`📦 Found ${
					actualOptions.length
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
			await this.page.keyboard.press('Escape').catch(() => {})
			await this.page.waitForTimeout(300)

			logger.info(`✅ ${label} dropdown validation completed successfully.`)
		} catch (err: any) {
			logger.error(`❌ ${label} dropdown validation failed: ${err.message}`)

			// Always close dropdown on failure to avoid cascading issues
			await this.page.keyboard.press('Escape').catch(() => {})
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
	async validateHeading(expected: string) {
		const heading = this.getPropertyHeading(expected)
		await expect(heading).toBeVisible({ timeout: 2000 })

		const actual = (await heading.textContent())?.trim() ?? ''
		expect(actual).toBe(expected)

		console.log(`✔ Heading validated: ${actual}`)
	}

}
