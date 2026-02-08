import { faker } from '@faker-js/faker'
import * as fs from 'node:fs'
import * as createCsvWriter from 'csv-writer'
import path from 'node:path'

export const address = faker.location.city()

// Export interface so it can be used outside if needed
export interface UserData {
	projectName: string
	description: string
	tag: string
}

// Exported function to generate a single user/project
export const generateSingleUserData = (): UserData => {
	return {
		projectName: faker.company.name(),
		description: faker.lorem.sentence(),
		tag: faker.internet.username()
	}
}

// Exported function to generate multiple records
export const generateMultipleUserData = (numRecords: number): UserData[] => {
	const testData: UserData[] = faker.helpers.multiple(generateSingleUserData, {
		count: numRecords
	})
	return testData
}

// Setup testdata folder
const currentDir = __dirname
const srcDir = path.resolve(currentDir, '..')
const testdataDir = path.resolve(srcDir, 'testdata')

// Exported function to save JSON
export const exportToJson = (data: UserData[], fileName: string) => {
	if (!fs.existsSync(testdataDir)) {
		fs.mkdirSync(testdataDir, { recursive: true })
	}
	fs.writeFileSync(`${testdataDir}/${fileName}`, JSON.stringify(data, null, 2))
	console.log(`Data exported to JSON file: ${testdataDir}/${fileName}`)
}

// Exported function to save CSV
export const exportToCsv = (data: UserData[], fileName: string) => {
	if (!fs.existsSync(testdataDir)) {
		fs.mkdirSync(testdataDir, { recursive: true })
	}

	const csvWriter = createCsvWriter.createObjectCsvWriter({
		path: `${testdataDir}/${fileName}`,
		header: [
			{ id: 'projectName', title: 'Project Name' },
			{ id: 'description', title: 'Description' },
			{ id: 'tag', title: 'Tag' }
		]
	})

	csvWriter.writeRecords(data).then(() => {
		console.log(`Data exported to CSV file: ${testdataDir}/${fileName}`)
	})
}
