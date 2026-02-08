import { PlaywrightTestConfig } from '@playwright/test'
import { testConfig } from './testConfig'
import { OrtoniReportConfig } from 'ortoni-report'

/* --------------------
 * ENV SETUP
 * -------------------- */
const ENV = process.env.ENV || process.env.npm_config_ENV || 'qa'
const isCI = Boolean(process.env.CI)

const baseURL: string = (() => {
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
			return testConfig.qa
	}
})()

/* --------------------
 * ORTONI REPORT (LOCAL)
 * -------------------- */
const ortoniConfig: OrtoniReportConfig = {
	title: 'Playwright Framework with TypeScript',
	projectName: 'Playwright Framework with TypeScript',
	authorName: 'Rajendra Kumar',
	folderPath: 'html-report',
	filename: 'OrtoniHtmlReport',
	showProject: true,
	base64Image: true
}

/* --------------------
 * SHARED USE OPTIONS
 * -------------------- */
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

/* --------------------
 * PLAYWRIGHT CONFIG
 * -------------------- */
const config: PlaywrightTestConfig = {
	testDir: './tests',
	testIgnore: ['**/*.jest.spec.ts'],

	timeout: 120_000,
	expect: { timeout: 10_000 },

	fullyParallel: true,
	workers: isCI ? 1 : 4,
	retries: isCI ? 2 : 0,

	globalSetup: './global-setup',

	/* --------------------
	 * REPORTERS
	 * -------------------- */
	reporter: isCI
		? [['list'], ['html', { outputFolder: 'html-report', open: 'never' }]]
		: [
				['list'],
				['./CustomReporterConfig.ts'],
				['allure-playwright'],
				['html', { outputFolder: 'html-report', open: 'on-failure' }],
				['ortoni-report', ortoniConfig]
			],

	/* --------------------
	 * PROJECTS
	 * -------------------- */
	projects: [
		{
			name: 'Edge',
			use: {
				...sharedUse,
				browserName: 'chromium',
				channel: 'msedge',
				headless: isCI,

				viewport: isCI ? { width: 1280, height: 720 } : null,

				launchOptions: {
					slowMo: isCI ? 0 : 3000,
					args: isCI
						? ['--no-sandbox', '--disable-dev-shm-usage']
						: [
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
