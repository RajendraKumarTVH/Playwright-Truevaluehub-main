// utils/readExcel.ts
import * as XLSX from 'xlsx'

export function readExcelRows(filePath: string): string[] {
	const workbook = XLSX.readFile(filePath)
	const sheetName = workbook.SheetNames[0]
	const worksheet = workbook.Sheets[sheetName]
	const jsonData = XLSX.utils.sheet_to_json(worksheet, {
		header: 1
	}) as string[][]

	const filePaths: string[] = []
	for (let i = 1; i < jsonData.length; i++) {
		const row = jsonData[i]
		if (row && row[0]) filePaths.push(row[0])
	}
	return filePaths
}
