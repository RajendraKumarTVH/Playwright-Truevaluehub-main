import { test, expect, BrowserContext, Page, chromium } from '@playwright/test'
import {
	calculateESG,
	fetchMaterialData,
	MigWeldingPage,
	verifyESGInUI
} from './pages/mig-welding.page'
import { LoginPage } from '@pages/LoginPage'
import Logger from './lib/LoggerUtil'
import fs from 'fs'
// Test Data Imports
import { MigWeldingTestData } from '../test-data/mig-welding/index'
import {
	ProcessType,
	MachineType,
	WeldingCalculator,
	calculateWeldSize,
	PartComplexity,
	ProcessInfoDto,
	calculateLotSize
} from '../tests/utils/welding-calculator'
import { WeldCleaningScenario1 } from '../test-data/weld-cleaning-testdata'

// Overhead & Profit Imports
import { calculateOverheadProfit } from '../tests/utils/overhead-profit-calculator'
import { OverheadProfitScenario1 } from '../test-data/overhead-profit-testdata'

// Packaging Imports
import { calculatePackaging } from '../tests/utils/packaging-calculator'
import { PackagingScenario1 } from '../test-data/packaging-testdata'
import { getMaterialMarketId, queryDatabase } from 'tests/utils/dbHelper'
const logger = Logger
import {
	calculateCycleTimeBreakdown,
	logCycleTimeBreakdown
} from './utils/cycle-time-helper'
import { testConfig } from 'testConfig'

const RUN_ID = Date.now()

// ==================== TEST CONFIGURATION ====================
const CONFIG = {
	projectId: MigWeldingTestData.project.projectId,
	baseUrl: MigWeldingTestData.config.baseUrl,
	timeout: MigWeldingTestData.config.defaultTimeout,
	userProfilePath: `./user-profile-${RUN_ID}`,
	authStatePath: 'auth.json'
} as const

// ==================== TEST DATA ====================
const testWeldData = {
	weld1: {
		weldType: MigWeldingTestData.weldingDetails.weld1.weldType,
		weldSize: MigWeldingTestData.weldingDetails.weld1.weldSize,
		weldLength: MigWeldingTestData.weldingDetails.weld1.weldLength,
		noOfPasses: MigWeldingTestData.weldingDetails.weld1.noOfWeldPasses,
		weldPlaces: MigWeldingTestData.weldingDetails.weld1.weldPlaces
	},
	weld2: {
		weldType: MigWeldingTestData.weldingDetails.weld2.weldType,
		weldSize: MigWeldingTestData.weldingDetails.weld2.weldSize,
		weldLength: MigWeldingTestData.weldingDetails.weld2.weldLength,
		noOfPasses: MigWeldingTestData.weldingDetails.weld2.noOfWeldPasses,
		weldPlaces: MigWeldingTestData.weldingDetails.weld2.weldPlaces
	}
}

// ==================== MAIN TEST SUITE ====================
test.describe('MIG Welding - Complete E2E Test Suite', () => {
	let context: BrowserContext
	let page: Page
	let migWeldingPage: MigWeldingPage
	let loginPage: LoginPage
	let hasFailed = false

	// ==================== SETUP & TEARDOWN ====================
	test.beforeAll(async () => {
		logger.info('═══════════════════════════════════════════════════════════')
		logger.info('🚀 Starting MIG Welding E2E Test Suite')
		logger.info('═══════════════════════════════════════════════════════════')
		logger.info(`📋 Project ID: ${CONFIG.projectId}`)
		logger.info(`🌐 Base URL: ${CONFIG.baseUrl}`)
		logger.info(
			`🧹 Using isolated user profile folder: ${CONFIG.userProfilePath}`
		)

		context = await chromium.launchPersistentContext(CONFIG.userProfilePath, {
			channel: 'msedge',
			headless: false,
			args: ['--start-maximized'],
			viewport: null,
			timeout: CONFIG.timeout
		})

		page =
			context.pages().length > 0 ? context.pages()[0] : await context.newPage()
		loginPage = new LoginPage(page, context)
		migWeldingPage = new MigWeldingPage(page, context)
		logger.info('✅ Browser context and page objects initialized')

		await loginPage.loginToApplication()
		await context.storageState({ path: CONFIG.authStatePath })
		await migWeldingPage.navigateToProject(CONFIG.projectId)
	})

	test.afterAll(async () => {
		try {
			logger.info('═══════════════════════════════════════════════════════════')
			logger.info('🏁 MIG Welding E2E Test Suite Completed')
			logger.info('═══════════════════════════════════════════════════════════')
		} finally {
			if (context) await context.close()
			if (fs.existsSync(CONFIG.userProfilePath)) {
				try {
					fs.rmSync(CONFIG.userProfilePath, { recursive: true, force: true })
				} catch {
					// best-effort cleanup; ignore Windows file locks
				}
			}
		}
	})

	test.afterEach(async ({}, testInfo) => {
		if (testInfo.status !== testInfo.expectedStatus) {
			const screenshotName = `screenshots/${testInfo.title.replace(
				/\s+/g,
				'_'
			)}_error.png`
			if (!page || page.isClosed()) {
				logger.error(
					`❌ Test "${testInfo.title}" failed, but page is already closed. Skipping screenshot.`
				)
				return
			}
			if (!fs.existsSync('screenshots')) {
				fs.mkdirSync('screenshots', { recursive: true })
			}
			await page.screenshot({ path: screenshotName, fullPage: true })
			logger.error(
				`❌ Test "${testInfo.title}" failed. Screenshot: ${screenshotName}`
			)
		}
	})

	// ==================== TEST CASES ====================

	test.describe('1. Project Setup & Navigation', () => {
		test(
			'TC001: Login and Navigate to Project',
			{ tag: '@smoke' },
			async () => {
				if (hasFailed) test.skip()
				try {
					logger.info('🔹 Step 1: Login and Project Navigation')
					await context.storageState({ path: CONFIG.authStatePath })
					await migWeldingPage.verifyPartDetails()
					logger.info('✅ Login and navigation completed')
				} catch (err) {
					hasFailed = true
					throw err
				}
			}
		)
	})
	test.describe('1. Verifing PartInformation', () => {
		test.skip('TC001: Verify Part Information', { tag: '@smoke' }, async () => {
			if (hasFailed) test.skip()
			try {
				logger.info('🔹 Step 1: Verify Part Information')

				logger.info('✅ Part Information verified successfully')
			} catch (err) {
				hasFailed = true
				throw err
			}
		})
	})
	test.describe('2. Manufacturing Information', () => {
		test(
			'TC002: Verify Machine Cost/Part',
			{ tag: ['@manufacturing', '@cost'] },
			async () => {
				if (hasFailed) test.skip()
				try {
					logger.info('🔹 Step 2: Verify Machine Cost/Part Calculation')
					await migWeldingPage.ManufacturingInformation.scrollIntoViewIfNeeded()
					await migWeldingPage.ManufacturingInformation.click()
					await migWeldingPage.MigWeldRadBtn.click()
					const machineHourRate = await migWeldingPage.getInputValueAsNumber(
						migWeldingPage.MachineHourRate
					)
					const cycleTime = await migWeldingPage.getInputValueAsNumber(
						migWeldingPage.CycleTimePart
					)
					const actualMachineCost = await migWeldingPage.getInputValueAsNumber(
						migWeldingPage.MachineCostPart
					)

					logger.info(`Machine Hour Rate: $${machineHourRate}`)
					logger.info(`Cycle Time: ${cycleTime} sec`)
					logger.info(`Actual Machine Cost: $${actualMachineCost}`)
					const expectedMachineCost = (machineHourRate / 3600) * cycleTime
					logger.info(`Expected Machine Cost: $${expectedMachineCost}`) // Verify
					expect(actualMachineCost).toBeCloseTo(expectedMachineCost, 4)
					logger.info('✅ Machine Cost/Part verified successfully')
				} catch (err) {
					hasFailed = true
					throw err
				}
			}
		)

		test.skip(
			'TC003: Verify QA Inspection Cost/Part',
			{ tag: ['@manufacturing', '@cost'] },
			async () => {
				if (hasFailed) test.skip()
				try {
					logger.info('🔹 Step 3: Verify QA Inspection Cost/Part Calculation')

					// Get values from UI
					const inspectionTime = await migWeldingPage.getInputValueAsNumber(
						migWeldingPage.QAInspectionTime
					)
					const inspectorRate = await migWeldingPage.getInputValueAsNumber(
						migWeldingPage.QAInspectorRate
					)
					const samplingRate = await migWeldingPage.getInputValueAsNumber(
						migWeldingPage.SamplingRate
					)
					const actualInspectionCost =
						await migWeldingPage.getInputValueAsNumber(
							migWeldingPage.QAInspectionCost
						)

					logger.info(`Inspection Time: ${inspectionTime} sec`)
					logger.info(`Inspector Rate: $${inspectorRate}/hr`)
					logger.info(`Sampling Rate: ${samplingRate}%`)
					logger.info(`Actual Inspection Cost: $${actualInspectionCost}`)

					// Calculate Expected Inspection Cost
					// Formula from AngulerJS Project: (Sampling Rate / 100) * ((Inspection Time * Inspector Rate) / 3600)
					const expectedInspectionCost =
						(samplingRate / 100) * ((inspectionTime * inspectorRate) / 3600)
					logger.info(`Expected Inspection Cost: $${expectedInspectionCost}`)

					// Verify
					expect(actualInspectionCost).toBeCloseTo(expectedInspectionCost, 4)
					logger.info('✅ QA Inspection Cost/Part verified successfully')
				} catch (err) {
					hasFailed = true
					throw err
				}
			}
		)

		test.skip(
			'TC004: Verify Setup Cost/Part',
			{ tag: ['@manufacturing', '@cost'] },
			async () => {
				if (hasFailed) test.skip()
				try {
					logger.info('🔹 Step 4: Verify Setup Cost/Part Calculation')

					// Get values from UI
					// Note: Lot Size is in Part Information, might need scrolling/expanding if not visible
					if (!(await migWeldingPage.LotsizeNos.isVisible())) {
						await migWeldingPage.PartInformationTitle.click()
					}
					const lotSize = await migWeldingPage.getInputValueAsNumber(
						migWeldingPage.LotsizeNos
					)

					// Ensure Manufacturing Info is visible again for other fields
					await migWeldingPage.ManufacturingInformation.scrollIntoViewIfNeeded()

					const skilledLaborRate = await migWeldingPage.getInputValueAsNumber(
						migWeldingPage.SkilledLaborRate
					)
					const machineHourRate = await migWeldingPage.getInputValueAsNumber(
						migWeldingPage.MachineHourRate
					)
					const setupTime = await migWeldingPage.getInputValueAsNumber(
						migWeldingPage.MachineSetupTime
					)
					const actualSetupCost = await migWeldingPage.getInputValueAsNumber(
						migWeldingPage.SetupCostPart
					)

					logger.info(`Skilled Labor Rate: $${skilledLaborRate}/hr`)
					logger.info(`Machine Hour Rate: $${machineHourRate}/hr`)
					logger.info(`Setup Time: ${setupTime} min`)
					logger.info(`Lot Size: ${lotSize}`)
					logger.info(`Actual Setup Cost: $${actualSetupCost}`)

					// Calculate Expected Setup Cost
					// Formula from AngulerJS Project: ((Skilled Labor Rate + Machine Hour Rate) * (Setup Time / 60)) / Lot Size
					const expectedSetupCost =
						((skilledLaborRate + machineHourRate) * (setupTime / 60)) / lotSize
					logger.info(`Expected Setup Cost: $${expectedSetupCost}`)

					// Verify
					expect(actualSetupCost).toBeCloseTo(expectedSetupCost, 4)
					logger.info('✅ Setup Cost/Part verified successfully')
				} catch (err) {
					hasFailed = true
					throw err
				}
			}
		)

		test(
			'TC005: Verify Labor Cost/Part',
			{ tag: ['@manufacturing', '@cost'] },
			async () => {
				if (hasFailed) test.skip()
				try {
					logger.info('🔹 Step 5: Verify Labor Cost/Part Calculation')

					// Ensure Manufacturing Info is visible
					await migWeldingPage.ManufacturingInformation.scrollIntoViewIfNeeded()

					// Get values from UI
					const directLaborRate = await migWeldingPage.getInputValueAsNumber(
						migWeldingPage.DirectLaborRate
					)
					const noOfDirectLabors = await migWeldingPage.getInputValueAsNumber(
						migWeldingPage.NoOfDirectLabors
					)
					const cycleTime = await migWeldingPage.getInputValueAsNumber(
						migWeldingPage.CycleTimePart
					)
					const actualLaborCost = await migWeldingPage.getInputValueAsNumber(
						migWeldingPage.LaborCostPart
					)

					logger.info(`Direct Labor Rate: $${directLaborRate}/hr`)
					logger.info(`No of Direct Labors: ${noOfDirectLabors}`)
					logger.info(`Cycle Time: ${cycleTime} sec`)
					logger.info(`Actual Labor Cost: $${actualLaborCost}`)

					// Calculate Expected Labor Cost
					// Formula from AngulerJS Project: (Direct Labor Rate / 3600) * Cycle Time * No of Direct Labors
					const expectedLaborCost =
						(directLaborRate / 3600) * cycleTime * noOfDirectLabors
					logger.info(`Expected Labor Cost: $${expectedLaborCost}`)

					// Verify
					expect(actualLaborCost).toBeCloseTo(expectedLaborCost, 4)
					logger.info('✅ Labor Cost/Part verified successfully')
				} catch (err) {
					hasFailed = true
					throw err
				}
			}
		)

		test(
			'TC006: Verify Yield Cost/Part',
			{ tag: ['@manufacturing', '@cost'] },
			async () => {
				if (hasFailed) test.skip()
				try {
					logger.info('🔹 Step 6: Verify Yield Cost/Part Calculation')

					// Ensure Manufacturing Info is visible
					await migWeldingPage.ManufacturingInformation.scrollIntoViewIfNeeded()

					// Need Net Material Cost which is in Material Info
					// Assuming it's already populated/calculated.
					// We might need to go to Material Info tab to read it if it's not available in Mfg tab?
					// NetMaterialCost locator is globally available in page object.
					// Let's assume it's readable (it's an input).
					// If it's in a different tab that is hidden, we might need to click.
					// But usually these forms are in an accordion.
					// Let's ensure Material Info is expanded if needed.
					if (!(await migWeldingPage.NetMaterialCost.isVisible())) {
						await migWeldingPage.MaterialDescription.click()
						await migWeldingPage.MaterialInfo.click()
					}
					const netMaterialCost = await migWeldingPage.getInputValueAsNumber(
						migWeldingPage.NetMaterialCost
					)

					// Go back to Manufacturing Info
					if (!(await migWeldingPage.YieldCostPart.isVisible())) {
						await migWeldingPage.ManufacturingInformation.click()
					}

					// Get sum components
					const machineCost = await migWeldingPage.getInputValueAsNumber(
						migWeldingPage.MachineCostPart
					)
					const setupCost = await migWeldingPage.getInputValueAsNumber(
						migWeldingPage.SetupCostPart
					)
					const laborCost = await migWeldingPage.getInputValueAsNumber(
						migWeldingPage.LaborCostPart
					)
					const inspectionCost = await migWeldingPage.getInputValueAsNumber(
						migWeldingPage.QAInspectionCost
					)

					// Get Yield params
					const yieldPercentage = await migWeldingPage.getInputValueAsNumber(
						migWeldingPage.YieldPercentage
					)
					const actualYieldCost = await migWeldingPage.getInputValueAsNumber(
						migWeldingPage.YieldCostPart
					)

					logger.info(`Net Material Cost: $${netMaterialCost}`)
					logger.info(
						`Sum Calculation: Machine($${machineCost}) + Setup($${setupCost}) + Labor($${laborCost}) + Inspection($${inspectionCost})`
					)
					logger.info(`Yield Percentage: ${yieldPercentage}%`)
					logger.info(`Actual Yield Cost: $${actualYieldCost}`)

					// Calculate Expected Yield Cost
					// Formula from AngulerJS Project for MIG Welding:
					// (1 - Yield% / 100) * (NetMaterialCost + MachineCost + SetupCost + LaborCost + InspectionCost)
					// Note: Power Cost is NOT included in the sum for Yield Cost calculation based on service code.
					const sumCosts = machineCost + setupCost + laborCost + inspectionCost
					const expectedYieldCost =
						(1 - yieldPercentage / 100) * (netMaterialCost + sumCosts)
					logger.info(`Expected Yield Cost: $${expectedYieldCost}`)

					// Verify
					expect(actualYieldCost).toBeCloseTo(expectedYieldCost, 4)
					logger.info('✅ Yield Cost/Part verified successfully')
				} catch (err) {
					hasFailed = true
					throw err
				}
			}
		)

		test(
			'TC007: Verify Total Power Cost',
			{ tag: ['@manufacturing', '@cost'] },
			async () => {
				if (hasFailed) test.skip()
				try {
					logger.info('🔹 Step 7: Verify Total Power Cost Calculation')

					// Ensure Manufacturing Info is visible
					await migWeldingPage.ManufacturingInformation.scrollIntoViewIfNeeded()

					// Get values from UI
					const cycleTime = await migWeldingPage.getInputValueAsNumber(
						migWeldingPage.CycleTimePart
					)
					const powerConsumption = await migWeldingPage.getInputValueAsNumber(
						migWeldingPage.PowerConsumption
					)
					const electricityUnitCost =
						await migWeldingPage.getInputValueAsNumber(
							migWeldingPage.ElectricityUnitCost
						)
					const actualPowerCost = await migWeldingPage.getInputValueAsNumber(
						migWeldingPage.TotalPowerCost
					)

					logger.info(`Cycle Time: ${cycleTime} sec`)
					logger.info(`Power Consumption: ${powerConsumption} kW`)
					logger.info(`Electricity Unit Cost: $${electricityUnitCost}/kWh`)
					logger.info(`Actual Power Cost: $${actualPowerCost}`)

					// Calculate Expected Power Cost
					// Formula from AngulerJS Project: (Cycle Time / 3600) * Power Consumption * Electricity Unit Cost
					const expectedPowerCost =
						(cycleTime / 3600) * powerConsumption * electricityUnitCost
					logger.info(`Expected Power Cost: $${expectedPowerCost}`)

					// Verify (using slightly looser tolerance as floating point math can vary)
					expect(actualPowerCost).toBeCloseTo(expectedPowerCost, 4)
					logger.info('✅ Total Power Cost verified successfully')
				} catch (err) {
					hasFailed = true
					throw err
				}
			}
		)

		test.only(
			'TC008: Verify Cycle Time/Part (Sec)',
			{ tag: ['@manufacturing', '@calculation'] },
			async () => {
				if (hasFailed) test.skip()
				try {
					logger.info('🔹 Step 8: Weld Cycle Time Verification')
					await migWeldingPage.ManufacturingInformation.scrollIntoViewIfNeeded()

					const calculator = new WeldingCalculator()

					// 🔹 Construct input for calculator
					const input: any = {
						processTypeID: ProcessType.MigWelding,
						partComplexity: PartComplexity.Medium,
						semiAutoOrAuto: MachineType.Automatic,
						materialInfoList: [
							{
								processId: 57, // MIG Welding Primary
								netMatCost:
									MigWeldingTestData.materialCostDetails.netMaterialCost,
								netWeight:
									MigWeldingTestData.materialCostDetails
										.totalWeldMaterialWeight * 1000,
								dimX:
									testWeldData.weld1.weldLength + testWeldData.weld2.weldLength,
								partTickness: 5,
								materialMasterData: {
									materialType: { materialTypeName: 'Steel' }
								}
							}
						],
						subProcessFormArray: {
							controls: [
								{
									value: {
										formLength: testWeldData.weld1.weldLength,
										shoulderWidth: testWeldData.weld1.weldSize,
										formPerimeter: 0,
										noOfHoles: 0,
										hlFactor: 0
									}
								},
								{
									value: {
										formLength: testWeldData.weld2.weldLength,
										shoulderWidth: testWeldData.weld2.weldSize,
										formPerimeter: 0,
										noOfHoles: 0,
										hlFactor: 0
									}
								}
							]
						},
						efficiency:
							MigWeldingTestData.machineDetails.machineEfficiency / 100
					}

					// 🔹 Perform backend calculation
					const calculated: ProcessInfoDto = calculator.calculationForWelding(
						input,
						[],
						input,
						[]
					)

					// 🔹 Calculate expected weld cycle time details
					const cycleTimeBreakdown = calculateCycleTimeBreakdown(
						calculated,
						input.efficiency
					)

					logCycleTimeBreakdown(cycleTimeBreakdown, logger)

					const expectedDetails = {
						loadingUnloadingTime: cycleTimeBreakdown.unloadingTime,
						reorientation:
							MigWeldingTestData.cycleTimeDetails.partReorientation,
						totalWeldCycleTime: cycleTimeBreakdown.finalCycleTime
					}

					logger.info(
						`Expected Cycle Time Details:\n${JSON.stringify(
							expectedDetails,
							null,
							2
						)}`
					)

					// 🔹 UI Verification
					const actualCycleTime = await migWeldingPage.getInputValueAsNumber(
						migWeldingPage.CycleTimePart
					)

					// Verify components
					const uiUnloading = await migWeldingPage.getInputValueAsNumber(
						migWeldingPage.UnloadingTime
					)
					expect(uiUnloading).toBeCloseTo(
						expectedDetails.loadingUnloadingTime,
						2
					)

					// Verify calculator output for reorientation (UI hidden)
					expect(calculated.partReorientation).toBeCloseTo(
						expectedDetails.reorientation,
						2
					)

					// Verify total cycle time
					expect(actualCycleTime).toBeCloseTo(
						expectedDetails.totalWeldCycleTime,
						2
					)

					logger.info('✅ Weld cycle time calculations verified')
				} catch (err) {
					hasFailed = true
					throw err
				}
			}
		)
	})

	test('TC009: Verify Weld Cleaning Costing', async () => {
		let hasFailed = false
		try {
			await test.step('Navigate to Weld Cleaning Process', async () => {
				logger.info('🔹 Switching to Weld Cleaning process')
				await migWeldingPage.WeldCleanRadBtn.click()
				await page.waitForTimeout(2000) // Allow UI calculations to complete
				logger.info('✅ Weld Cleaning process selected')
			})
			const machineHourRate = await migWeldingPage.getInputValueAsNumber(
				migWeldingPage.MachineHourRate
			)
			const cycleTime = await migWeldingPage.getInputValueAsNumber(
				migWeldingPage.CycleTimePart
			)
			const actualMachineCost = await migWeldingPage.getInputValueAsNumber(
				migWeldingPage.MachineCostPart
			)

			logger.info(`Machine Hour Rate: $${machineHourRate}`)
			logger.info(`Cycle Time: ${cycleTime} sec`)
			logger.info(`Actual Machine Cost: $${actualMachineCost}`)
			const expectedMachineCost = (machineHourRate / 3600) * cycleTime
			logger.info(`Expected Machine Cost: $${expectedMachineCost}`) // Verify
			expect(actualMachineCost).toBeCloseTo(expectedMachineCost, 4)
			logger.info('✅ Machine Cost verified successfully')
		} catch (err) {
			hasFailed = true
			throw err
		}
	})
})
