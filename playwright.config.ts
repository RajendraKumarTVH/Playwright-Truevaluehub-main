import { PlaywrightTestConfig } from '@playwright/test'
import { testConfig } from './testConfig'
import { OrtoniReportConfig } from 'ortoni-report'

// -----------------------------------------------------
// Environment
// -----------------------------------------------------
const ENV = process.env.ENV || process.env.npm_config_ENV || 'qa'

const resolveBaseURL = (): string => {
	switch (ENV) {
		case 'qa':
			return testConfig.qa
		case 'demo':
			return testConfig.demo
		case 'qaApi':
			return testConfig.qaApi
		case 'devApi':
			return testConfig.devApi
		default:
			console.warn(`⚠️ Unknown ENV "${ENV}", defaulting to QA`)
			return testConfig.qa
	}
}

const baseURL = resolveBaseURL()

// -----------------------------------------------------
// Ortoni Report
// -----------------------------------------------------
const ortoniConfig: OrtoniReportConfig = {
	title: 'Playwright Framework with TypeScript',
	projectName: 'Playwright Framework with TypeScript',
	authorName: 'Rajendra Kumar',
	folderPath: 'html-report',
	filename: 'OrtoniHtmlReport',
	showProject: true,
	base64Image: true
}

// -----------------------------------------------------
// Shared browser settings
// -----------------------------------------------------
const sharedUse = {
	baseURL,
	ignoreHTTPSErrors: true,
	acceptDownloads: true,
	screenshot: 'only-on-failure' as const,
	video: 'retain-on-failure' as const,
	trace: 'retain-on-failure' as const,
	actionTimeout: 15_000,
	navigationTimeout: 30_000
}

// -----------------------------------------------------
// Config
// -----------------------------------------------------
const config: PlaywrightTestConfig = {
	testDir: './tests',
	testIgnore: ['**/*.jest.spec.ts'],

	timeout: 120_000,
	expect: { timeout: 10_000 },

	fullyParallel: true,
	workers: process.env.CI ? 2 : 4,
	retries: process.env.CI ? 2 : 0,

	globalSetup: './global-setup',

	reporter: [
		['list'],
		['./CustomReporterConfig.ts'],
		['allure-playwright'],
		['html', { outputFolder: 'html-report', open: 'never' }],
		['ortoni-report', ortoniConfig]
	],

	projects: [
		{
			name: 'Edge',
			use: {
				...sharedUse,
				browserName: 'chromium',
				channel: 'msedge',
				headless: false,
				viewport: null,
				launchOptions: {
					slowMo: 3000,
					args: [
						'--start-maximized',
						'--no-first-run',
						'--no-default-browser-check',
						'--disable-infobars',
						'--disable-blink-features=AutomationControlled'
					]
				}
			}
		}
	]
}

export default config
