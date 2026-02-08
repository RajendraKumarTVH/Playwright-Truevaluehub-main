import fs from 'node:fs'
import type { Page } from '@playwright/test'
import { BrowserContext } from '@playwright/test'
import { Workbook } from 'exceljs'

export class WebActions {
	readonly page: Page
	readonly context: BrowserContext

	constructor(page: Page, context: BrowserContext) {
		this.page = page
		this.context = context
	}

	async delay(time: number): Promise<void> {
		return new Promise(function (resolve) {
			setTimeout(resolve, time)
		})
	}

	async clickByText(text: string): Promise<void> {
		await this.page.getByText(text, { exact: true }).click() //Matches locator with exact text and clicks
	}

	async clickElementJS(locator: string): Promise<void> {
		await this.page.$eval(locator, (element: HTMLElement) => element.click())
	}

	async readDataFromExcel(
		fileName: string,
		sheetName: string,
		rowNum: number,
		cellNum: number
	): Promise<string> {
		const workbook = new Workbook()
		return workbook.xlsx.readFile(`./Downloads/${fileName}`).then(function () {
			const sheet = workbook.getWorksheet(sheetName)
			if (!sheet) {
				throw new Error(`Sheet "${sheetName}" not found in file "${fileName}".`)
			}
			return sheet.getRow(rowNum).getCell(cellNum).toString()
		})
	}

	async readValuesFromTextFile(filePath: string): Promise<string> {
		return fs.readFileSync(`${filePath}`, `utf-8`)
	}

	async writeDataIntoTextFile(
		filePath: number | fs.PathLike,
		data: string | NodeJS.ArrayBufferView
	): Promise<void> {
		fs.writeFile(filePath, data, error => {
			if (error) throw error
		})
	}

	async getPdfPageText(pdf: any, pageNo: number) {
		const page = await pdf.getPage(pageNo)
		const tokenizedText = await page.getTextContent()
		const pageText = tokenizedText.items.map((token: any) => token.str).join('')
		return pageText
	}
}
