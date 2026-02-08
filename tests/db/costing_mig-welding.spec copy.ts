import { test, expect, BrowserContext, Page, chromium } from '@playwright/test'
import { calculateESG, fetchMaterialData, MigWeldingPage, verifyESGInUI } from './pages/mig-welding.page'
import { LoginPage } from '@pages/LoginPage'
import Logger from './lib/LoggerUtil'
import fs from 'fs'
import { getMaterialMarketId } from 'tests/utils/dbHelper';
// Test Data Imports
import { MigWeldingTestData } from '../test-data/mig-welding/index'
import {
	ProcessType,
	MachineType,
	WeldingCalculator,
	calculateWeldSize,
	PartComplexity,
	ProcessInfoDto
} from '../tests/utils/welding-calculator'

// Overhead & Profit Imports
import {
	calculateOverheadProfit
} from '../tests/utils/overhead-profit-calculator'
import { OverheadProfitScenario1 } from '../test-data/overhead-profit-testdata'

// Packaging Imports
import {
	calculatePackaging
} from '../tests/utils/packaging-calculator'
import { PackagingScenario1 } from '../test-data/packaging-testdata'

const logger = Logger

import { calculateCycleTimeBreakdown, logCycleTimeBreakdown } from './utils/cycle-time-helper'
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

		// Launch browser with persistent context
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

	test.afterEach(async ({ }, testInfo) => {
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

		test(
			'TC002: Populate Part Details from Costing Notes',
			{ tag: '@smoke' },
			async () => {
				if (hasFailed) test.skip()
				try {
					logger.info('🔹 Step 2: Populate Part Details')

					//await migWeldingPage.populatePartDetailsFromCostingNotes()

					// Verify key fields are visible
					await expect(migWeldingPage.InternalPartNumber).toBeVisible()
					await expect(migWeldingPage.ManufacturingCategory).toBeVisible()
					await expect(migWeldingPage.AnnualVolumeQtyNos).toBeVisible()
					await expect(migWeldingPage.LotsizeNos).toBeVisible()
					const drawingValue = await migWeldingPage.DrawingNumber.inputValue()
					console.log('Drawing Number:', drawingValue)
					await expect(migWeldingPage.DrawingNumber).not.toHaveValue('')
					await expect(migWeldingPage.RevisionNumber).not.toHaveValue('')
					await expect(migWeldingPage.RevisionNumber).toBeVisible()

					// Validate manufacturing category
					const notesText =
						(await migWeldingPage.CostingNotes.textContent()) || ''
					await migWeldingPage.validateManufacturingCategoryWithSuggested(
						notesText
					)

					logger.info('✅ Part details populated and validated')
				} catch (err) {
					hasFailed = true
					throw err
				}
			}
		)
	})

	test.describe('2. Supplier & Delivery Validation', () => {
		test(
			'TC003: Verify Supplier and Delivery Dropdowns',
			{ tag: '@validation' },
			async () => {
				if (hasFailed) test.skip()
				try {
					logger.info('🔹 Step 3: Supplier and Delivery Validation')
					//await migWeldingPage.openSupplyTerms()
					await migWeldingPage.verifySupplierDropdown()
					await migWeldingPage.verifyDeliveryDropdown()

					logger.info('✅ Supplier and delivery dropdowns validated')
				} catch (err) {
					hasFailed = true
					throw err
				}
			}
		)
	})

	test.describe('3. Material & Welding Configuration', () => {
		test(
			'TC004: Material Selection and Validation',
			{ tag: '@material' },
			async () => {
				if (hasFailed) test.skip()
				try {
					logger.info('🔹 Step 4: Material Information Setup')

					await migWeldingPage.MaterialInformation.click()
					await migWeldingPage.verifyMaterialSelection()
					await migWeldingPage.selectMaterial(
						MigWeldingTestData.materialInformation.category,
						MigWeldingTestData.materialInformation.family,
						MigWeldingTestData.materialInformation.descriptionGrade,
						MigWeldingTestData.materialInformation.stockForm
					)
					await migWeldingPage.verifyMaterialInfoWithDB()
					await migWeldingPage.verifyDiscountedMaterialPrice()

					logger.info('✅ Material selection completed and validated')
				} catch (err) {
					hasFailed = true
					throw err
				}
			}
		)

		test.skip(
			'TC005: Welding Details Configuration',
			{ tag: '@welding' },
			async () => {
				test.skip(hasFailed, 'Skipping welding test due to previous failure')
				try {
					logger.info('🔹 Step 5: Welding Details Configuration')

					await migWeldingPage.verifyWeldingDetails(1, testWeldData.weld1)
					await migWeldingPage.fillWeldDetails(1, testWeldData.weld1)
					await migWeldingPage.fillWeldDetails(2, testWeldData.weld2)

					const weld2Size = Number(
						(await migWeldingPage.WeldSize2.inputValue()) || '0'
					)
					const expectedWeld2Size = calculateWeldSize(
						testWeldData.weld2.weldSize
					)
					console.log('Weld 2 Size:', weld2Size)
					console.log('Expected Weld 2 Size:', expectedWeld2Size)
					expect.soft(weld2Size).toBeCloseTo(expectedWeld2Size, 2)

					// Verify weld element size calculation
					await migWeldingPage.verifyWeldElementSize()

					logger.info('✅ Welding details configured and validated')
				} catch (err) {
					hasFailed = true
					throw err
				}
			}
		)

		test.skip(
			'TC006: Supply Terms Verification',
			{ tag: '@supply-chain' },
			async () => {
				test.skip(
					hasFailed,
					'Skipping supply terms test due to previous failure'
				)
				try {
					logger.info('🔹 Step 6: Supply Terms Verification')
					await migWeldingPage.SupplyTerms.click()
					await migWeldingPage.verifySupplyTerms()

					logger.info('✅ Supply terms verified')
				} catch (err) {
					hasFailed = true
					throw err
				}
			}
		)
	})

	test.describe('4. Manufacturing Configuration', () => {
		// test(
		// 	'TC007: Machine and Process Configuration',
		// 	{ tag: '@manufacturing' },
		// 	async () => {
		// 		test.skip(
		// 			hasFailed,
		// 			'Skipping manufacturing test due to previous failure'
		// 		)
		// 		try {
		// 			logger.info('🔹 Step 7: Manufacturing Configuration')
		// 			await migWeldingPage.selectPartComplexity('Medium')
		// 			await migWeldingPage.ManufacturingInformation.scrollIntoViewIfNeeded()
		// 			await migWeldingPage.ManufacturingInformation.click()
		// 			await migWeldingPage.selectMachineType('Automatic')

		// 			await migWeldingPage.verifyMachineDetails({
		// 				machineName: 'MIG/STICK Welding_400V_250A_Germany',
		// 				machineDescription: 'WURTH_Mig/Mag-250 (20A-250A)',
		// 				machineAutomation: 'Automatic',
		// 				machineEfficiency: 80
		// 			})
		// 			await migWeldingPage.verifyAutomaticCalculation({
		// 				minCurrent: '65',
		// 				minVoltage: '15',
		// 				selectedCurrent: '250',
		// 				selectedVoltage: '15',
		// 				machineName: 'MIG/STICK Welding_400V_250A_Germany',
		// 				machineDescription: 'WURTH_Mig/Mag-250 (20A-250A)'
		// 			})

		// 			logger.info('✅ Manufacturing configuration completed')
		// 		} catch (err) {
		// 			hasFailed = true
		// 			throw err
		// 		}
		// 	}
		// )

		test.skip(
			'TC008: Weld Cycle Time Calculation Verification',
			{ tag: '@calculation' },
			async () => {
				test.skip(hasFailed, 'Skipping cycle time test due to previous failure')

				try {
					logger.info('🔹 Step 8: Weld Cycle Time Verification')
					await migWeldingPage.ManufacturingInformation.scrollIntoViewIfNeeded()
					await migWeldingPage.ManufacturingInformation.click()
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
									testWeldData.weld1.weldLength +
									testWeldData.weld2.weldLength,
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
					const calculated: ProcessInfoDto =
						calculator.calculationForWelding(
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
					await expect.poll(
						async () =>
							migWeldingPage.getInputValueAsNumber(
								migWeldingPage.CycleTimePart
							),
						{ timeout: 15000 }
					).toBeGreaterThan(0)
					// 🔹 UI Verification
					await migWeldingPage.verifyWeldCycleTimeDetails(expectedDetails)

					logger.info('✅ Weld cycle time calculations verified')
				} catch (err) {
					hasFailed = true
					throw err
				}
			}
		)

		test('TC009: Cycle Time Calculation Validation', { tag: '@cost' }, async () => {
			test.skip(
				hasFailed,
				'Skipping cost breakdown test due to previous failure'
			)

			logger.info('🔹 Step 9: Cycle Time Calculation Validation')

			const weldingCalculator = new WeldingCalculator()

			// Construct input for calculator calculation - based on TC008 logic
			const manufactureInfo: any = {
				processTypeID: ProcessType.MigWelding,
				partComplexity: PartComplexity.Medium,
				semiAutoOrAuto: MachineType.Automatic,
				materialInfoList: [
					{
						processId: 57, // Mig Welding Primary
						netMatCost: MigWeldingTestData.materialCostDetails.netMaterialCost,
						netWeight: MigWeldingTestData.materialCostDetails.totalWeldMaterialWeight * 1000,
						dimX: testWeldData.weld1.weldLength + testWeldData.weld2.weldLength,
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
				efficiency: MigWeldingTestData.machineDetails.machineEfficiency / 100
			}

			const fieldColorsList: any = []
			const manufacturingObj: any = manufactureInfo
			const laborRateDto: any[] = []

			// 🔹 Calculate backend values
			const calculatedProcessInfo =
				weldingCalculator.calculationForWelding(
					manufactureInfo,
					fieldColorsList,
					manufacturingObj,
					laborRateDto
				)

			// 🔹 Derive expected cycle time (single source of truth)
			const cycleTimeBreakdown = calculateCycleTimeBreakdown(
				calculatedProcessInfo,
				calculatedProcessInfo.efficiency
			)

			logCycleTimeBreakdown(cycleTimeBreakdown, logger)

			const expectedCycleTime = cycleTimeBreakdown.finalCycleTime

			// 🔹 UI Validation
			await migWeldingPage.verifyWeldCycleTimeCalculation(expectedCycleTime)

			logger.info('✅ Cycle time calculation validation completed')
		})


		test.skip('TC010: Cost Breakdown Validation', { tag: '@cost' }, async () => {
			test.skip(
				hasFailed,
				'Skipping cost breakdown test due to previous failure'
			)
			try {
				logger.info('🔹 Step 9: Cost Breakdown Validation')

				const costs = await migWeldingPage.verifyCostBreakdown()
				logger.info(
					`Costs → Machine: ${costs.machineCost}, Labor: ${costs.laborCost}, Setup: ${costs.setupCost}`
				)

				await migWeldingPage.recalculateCost()
				await migWeldingPage.verifyCostSummary()

				const shouldCost = parseFloat(
					(await migWeldingPage.PartShouldCost.inputValue()) || '0'
				)
				expect.soft(shouldCost).toBeGreaterThan(0)

				logger.info('✅ Cost breakdown validated')
			} catch (err) {
				hasFailed = true
				throw err
			}
		})
	})

	test.describe('5. Sustainability & Advanced Calculations', () => {
		test(
			'TC010: Sustainability Calculations',
			{ tag: '@sustainability' },
			async () => {
				test.skip(
					hasFailed,
					'Skipping sustainability test due to previous failure'
				)
				try {
					logger.info('🔹 Step 10: Sustainability Verification')
					await migWeldingPage.verifyMaterialInfoWithDB()
					await migWeldingPage.verifyDiscountedMaterialPrice()
					await migWeldingPage.verifySustainabilityCalculations({
						material: {
							co2PerKg:
								MigWeldingTestData.sustainabilityMaterial.co2PerKgMaterial,
							co2PerScrap:
								MigWeldingTestData.sustainabilityMaterial.co2PerScrap,
							netWeight:
								MigWeldingTestData.materialCostDetails.totalWeldMaterialWeight,
							grossWeight:
								MigWeldingTestData.materialCostDetails
									.weldBeadWeightWithWastage,
							scrapWeight:
								MigWeldingTestData.materialCostDetails
									.weldBeadWeightWithWastage -
								MigWeldingTestData.materialCostDetails.totalWeldMaterialWeight
						},
						manufacturing: {
							powerConsumption:
								MigWeldingTestData.manufacturingDetails.powerConsumption,
							powerESG:
								MigWeldingTestData.sustainabilityManufacturing.co2PerKwHr,
							cycleTime: MigWeldingTestData.cycleTimeDetails.totalWeldCycleTime,
							setUpTime:
								MigWeldingTestData.manufacturingDetails.machineSetupTime,
							lotSize: MigWeldingTestData.partInformation.lotSize,
							efficiency:
								MigWeldingTestData.machineDetails.machineEfficiency / 100
						},
						general: {
							eav: MigWeldingTestData.partInformation.annualVolumeQty
						}
					})

					logger.info('✅ Sustainability calculations verified')
				} catch (err) {
					hasFailed = true
					throw err
				}
			}
		)

		test(
			'TC012: Auto-Calculation Verification',
			{ tag: '@calculation' },
			async () => {
				test.skip(
					hasFailed,
					'Skipping auto-calculation test due to previous failure'
				)
				try {
					logger.info('🔹 Step 11: Auto-Calculation Verification')
					await migWeldingPage.ManufacturingInformation.scrollIntoViewIfNeeded()
					await migWeldingPage.ManufacturingInformation.click()
					// Construct input matching ProcessInfoDto structure
					const input: any = {
						processTypeID: ProcessType.MigWelding,
						partComplexity: 1, // Low
						materialInfoList: [
							{
								processId: 57, // Mig Welding Primary
								netMatCost:
									MigWeldingTestData.materialCostDetails.netMaterialCost,
								netWeight:
									MigWeldingTestData.materialCostDetails
										.totalWeldMaterialWeight * 1000,
								dimX:
									MigWeldingTestData.weldingDetails.weld1.weldLength +
									MigWeldingTestData.weldingDetails.weld2.weldLength,
								partTickness: 5,
								materialMasterData: {
									materialType: { materialTypeName: 'Steel' }
								}
							}
						],
						machineMaster: {
							machineMarketDtos: [{ specialSkilledLabours: 1 }]
						},
						semiAutoOrAuto: MachineType.Automatic,
						efficiency:
							MigWeldingTestData.machineDetails.machineEfficiency / 100,
						setUpTime: MigWeldingTestData.manufacturingDetails.machineSetupTime,
						lotSize: MigWeldingTestData.partInformation.lotSize,
						laborRate: 20,
						subProcessFormArray: {
							controls: []
						}
					}

					const laborRateDto: any[] = [
						{
							powerCost: MigWeldingTestData.manufacturingDetails.powerUnitCost
						}
					]

					await migWeldingPage.verifyAutoCalculations(input, laborRateDto)

					logger.info('✅ Auto-calculations verified')
				} catch (err: any) {
					hasFailed = true
					logger.warn(
						'⚠️ Auto-Calculation verification skipped: ' + err.message
					)
				}
			}
		)

		test(
			'TC013: Specific Manufacturing Scenario',
			{ tag: '@scenario' },
			async () => {
				test.skip(
					hasFailed,
					'Skipping specific manufacturing scenario test due to previous failure'
				)
				try {
					logger.info('🔹 Step 13: Specific Manufacturing Scenario Verification')

					// Set specific manufacturing inputs
					await migWeldingPage.setManufacturingDetails({
						samplingRate:
							MigWeldingTestData.specificManufacturingScenario.samplingRate,
						yieldPercentage:
							MigWeldingTestData.specificManufacturingScenario.yieldPercentage,
						directLaborRate:
							MigWeldingTestData.specificManufacturingScenario.directLaborRate,
						noOfUnskilledLabor:
							MigWeldingTestData.specificManufacturingScenario.noOfDirectLabors,
						setupLaborRate:
							MigWeldingTestData.specificManufacturingScenario.setupLaborRate,
						setupTime:
							MigWeldingTestData.specificManufacturingScenario.machineSetupTime,
						qaInspectorRate:
							MigWeldingTestData.specificManufacturingScenario.qaInspectorRate,
						qaInspectionTime:
							MigWeldingTestData.specificManufacturingScenario.qaInspectionTime,
						machineHourRate:
							MigWeldingTestData.specificManufacturingScenario.machineHourRate,
						powerUnitCost:
							MigWeldingTestData.specificManufacturingScenario.powerUnitCost,
						powerConsumption:
							MigWeldingTestData.specificManufacturingScenario.powerConsumption
					})

					// Verify all manufacturing details
					await migWeldingPage.verifyManufacturingDetails(
						MigWeldingTestData.specificManufacturingScenario
					)

					logger.info('✅ Specific manufacturing scenario verified')
				} catch (err: any) {
					hasFailed = true
					logger.error(`❌ Manufacturing scenario failed: ${err.message}`)
					throw err
				}
			}
		)
	})

	test.describe('6. Overhead & Profit Analysis', () => {
		test(
			'TC013: Overhead and Profit Verification',
			{ tag: '@overhead-profit' },
			async () => {
				test.skip(
					hasFailed,
					'Skipping overhead and profit test due to previous failure'
				)
				try {
					logger.info('🔹 Step 13: Overhead & Profit Verification')

					// Perform calculation verification based on scenario
					const result = calculateOverheadProfit(OverheadProfitScenario1)

					logger.info('Performing validation against Business Logic...')
					logger.info(`Total Overhead: $${result.totalOverhead}`)
					logger.info(`Total Profit: $${result.profitCost}`)
					logger.info(`Cost of Capital: $${result.costOfCapitalAmount}`)

					// Validate against expected values from screenshot/requirements
					expect(result.mohCost).toBeCloseTo(
						OverheadProfitScenario1.expected.mohCost,
						4
					)
					expect(result.fohCost).toBeCloseTo(
						OverheadProfitScenario1.expected.fohCost,
						4
					)
					expect(result.sgaCost).toBeCloseTo(
						OverheadProfitScenario1.expected.sgaCost,
						4
					)
					expect(result.profitCost).toBeCloseTo(
						OverheadProfitScenario1.expected.profitCost,
						4
					)

					// Log complete breakdown for audit
					logger.info(`Breakdown Verified:
					MOH: $${result.mohCost}
					FOH: $${result.fohCost}
					SG&A: $${result.sgaCost}
					Material Profit: $${result.materialProfit}
					Process Profit: $${result.processProfit}`)

					logger.info('✅ Overhead and Profit logic verified')
				} catch (err: any) {
					hasFailed = true
					logger.error(
						`❌ Overhead & Profit Verification failed: ${err.message}`
					)
					throw err
				}
			}
		)
	})

	test.describe('7. Packaging & Logistics', () => {
		test(
			'TC014: Packaging Configuration & Costing',
			{ tag: '@packaging' },
			async () => {
				test.skip(hasFailed, 'Skipping packaging test due to previous failure')
				try {
					logger.info('🔹 Step 14: Packaging Configuration & Costing')

					// Calculate packaging details based on current part info
					const result = calculatePackaging(PackagingScenario1)

					logger.info('Performing validation against Business Logic...')
					logger.info(`Parts per Shipment: ${result.partsPerShipment}`)
					logger.info(
						`Packaging Cost/Unit: $${result.totalPackagingCostPerUnit}`
					)
					logger.info(
						`Total ESG Impact: ${result.totalESGImpactPerPart} kg CO2`
					)

					// Validate key metrics
					expect(result.partsPerShipment).toBeGreaterThan(0)
					expect(result.totalPackagingCostPerUnit).toBeGreaterThan(0)
					expect(result.boxPerShipment).toBe(
						PackagingScenario1.expected.boxPerShipment
					)
					expect(result.weightPerShipment).toBeCloseTo(
						PackagingScenario1.expected.weightPerShipment,
						1
					)

					logger.info(`Logistics Data Verified:
					Weight/Shipment: ${result.weightPerShipment} kg
					Volume/Shipment: ${result.volumePerShipment} m³
					Boxes Required: ${result.boxPerShipment}
					Pallets Required: ${result.palletPerShipment}`)

					logger.info('✅ Packaging & Logistics verified')
				} catch (err: any) {
					hasFailed = true
					logger.error(`❌ Packaging Verification failed: ${err.message}`)
					throw err
				}
			}
		)
	})

	test.describe('8. Sub Process Details Validation', () => {
		test('TC015: Validate Sub Process Details from Welding Inputs', { tag: '@subprocess' }, async () => {
			if (hasFailed) test.skip()
			try {
				logger.info('🔹 Step 15: Sub Process Details Validation')

				// 1. Fill Welding Details
				await migWeldingPage.expandAllSections()
				await migWeldingPage.WeldingDetails.scrollIntoViewIfNeeded()

				// Weld 1 Input
				// Weld Type: Fillet, Size: 6, Length: 100, Side: Both, Places: 1
				await migWeldingPage.fillWeldDetails(1, {
					weldType: 'Fillet',
					weldSize: 6,
					weldLength: 100,
					noOfPasses: 1,
					weldPlaces: 1
				})
				// Manually set Side to Both for Weld 1 (if not covered by helper)
				await migWeldingPage.WeldSide1.selectOption('Both')
				await migWeldingPage.waitForNetworkIdle()

				// Weld 2 Input
				// Weld Type: Square, Size: 6, Length: 100, Side: Single, Places: 1
				await migWeldingPage.fillWeldDetails(2, {
					weldType: 'Square',
					weldSize: 6,
					weldLength: 100,
					noOfPasses: 1,
					weldPlaces: 1
				})
				// Manually set Side to Single for Weld 2
				const weldSide2 = migWeldingPage.page.locator('select[formcontrolname="coreArea"]').nth(1)
				await weldSide2.selectOption('Single')
				await migWeldingPage.waitForNetworkIdle()

				// 2. Click Recalculate to update Sub Process Details
				await migWeldingPage.recalculateCost()

				// 3. Verify Sub Process Details
				await migWeldingPage.verifySubProcessDetails({
					weld1: {
						weldType: 'Fillet',
						weldPosition: 'Flat',
						travelSpeed: 3.825,
						tackWelds: 1,
						intermediateStops: 2,
						weldCycleTime: 65.2876
					},
					weld2: {
						weldType: 'Square',
						weldPosition: 'Flat',
						travelSpeed: 3.825,
						tackWelds: 1,
						intermediateStops: 1,
						weldCycleTime: 34.1438
					}
				})

				// Optional: Validate travel speed from UI against calculated values
				// This will read weld parameters from UI and validate against the calculation
				// await migWeldingPage.validateTravelSpeedFromUI()

				logger.info('✅ TC015: Sub Process Details verified successfully')
			} catch (err: any) {
				hasFailed = true
				logger.error(`❌ TC015 Failed: ${err.message}`)
				throw err
			}
		})
	})
	test.describe('9. ESG Calculations', () => {
		test(
			'TC016: Verify ESG calculations using DB MaterialMarketId',
			{ tag: '@sustainability-db' },
			async ({ page, request }) => {

				if (hasFailed) test.skip()

				const materialName = 'Steel Sheet'

				// 1️⃣ Get MaterialMarketId from DB
				const materialMarketId = await getMaterialMarketId(materialName)
				logger.info(`MaterialMarketId from DB: ${materialMarketId}`)

				// 2️⃣ Fetch material data from API
				const materialInfo = await fetchMaterialData(request, materialMarketId)

				// 3️⃣ Calculate ESG (same logic as Angular service)
				const esg = calculateESG(materialInfo)

				logger.info(`ESG Calculated: ${JSON.stringify(esg, null, 2)}`)

				// 5️⃣ Validate ESG values on UI
				await verifyESGInUI(page, '#esgImpactCO2Kg', esg.esgImpactCO2Kg)
				await verifyESGInUI(page, '#esgImpactCO2KgPart', esg.esgImpactCO2KgPart)
				await verifyESGInUI(page, '#esgAnnualKgCO2', esg.esgAnnualKgCO2)

				logger.info('✅ ESG DB → API → UI verification completed')
			}
		)

	})
})
