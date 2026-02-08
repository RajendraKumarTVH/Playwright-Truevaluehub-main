import { expect, Page } from '@playwright/test'

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

	async waitAndFill(selector: string, text: string): Promise<void> {
		return await this.page.fill(selector, text)
	}

	async keyPress(selector: string, key: string): Promise<void> {
		return await this.page.press(selector, key)
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

	async selectValueFromDropdown(
		selector: string,
		value: string
	): Promise<void> {
		const dropdown = this.page.locator(selector)
		await dropdown.selectOption({ value })
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
}
