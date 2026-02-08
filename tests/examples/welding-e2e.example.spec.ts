// Example: Playwright E2E Tests using Welding Calculator
// Shows how to use welding-playwright utilities in real tests

import { test, expect, Page } from '@playwright/test'
import {
	calculateWeldingCosts,
	calculateSeamWeldingCosts,
	calculateWeldingMaterial,
	fillWeldingForm,
	extractWeldingCostsFromUI,
	verifyWeldingCalculations,
	validateWeldingCostInUI
} from '../utils/welding-playwright'
import { ProcessType } from '../utils/welding-enums-constants'
import { ProcessInfoDto, LaborRateMasterDto } from '../utils/interfaces'

test.describe('Welding Calculator E2E Tests', () => {
	let page: Page

	test.beforeEach(async ({ browser }) => {
		page = await browser.newPage()
		// Navigate to your welding calculator page
		await page.goto('https://your-app.com/welding-calculator')
	})

	test.afterEach(async () => {
		await page.close()
	})

	test('Calculate MIG welding costs', async () => {
		// Prepare test data
		const manufactureInfo: ProcessInfoDto = {
			processTypeID: ProcessType.MigWelding,
			semiAutoOrAuto: 2, // SemiAuto
			cuttingSpeed: 5,
			unloadingTime: 2,
			cycleTime: 60,
			efficiency: 85,
			powerConsumption: 8,
			electricityUnitCost: 0.12,
			requiredCurrent: 200,
			requiredWeldingVoltage: 25,
			partComplexity: 2,
			yieldPer: 95,
			samplingRate: 100,
			machineHourRate: 150,
			skilledLaborRatePerHour: 30,
			lowSkilledLaborRatePerHour: 20,
			setUpTime: 30,
			lotSize: 100,
			noOfLowSkilledLabours: 1,
			inspectionTime: 5,
			qaOfInspectorRate: 25,
			netMaterialCost: 50,
			materialInfoList: [],
			subProcessFormArray: undefined as any
		}

		// Calculate costs
		const result = calculateWeldingCosts(manufactureInfo)

		// Assertions
		expect(result.directProcessCost).toBeGreaterThan(0)
		expect(result.totalPowerCost).toBeGreaterThan(0)
		expect(result.yieldCost).toBeGreaterThan(0)
	})

	test('Fill welding form and verify calculations', async () => {
		// Step 1: Fill form with test data
		const formData = {
			'process-type': 'MIG Welding',
			'machine-type': 'Semi-Automatic',
			'weld-position': 'Flat',
			'cycle-time': '120',
			efficiency: '85',
			'power-consumption': '8',
			'electricity-cost': '0.12',
			'machine-hour-rate': '150',
			'labor-rate': '20',
			'setup-time': '30',
			'lot-size': '100'
		}

		await fillWeldingForm(page, formData)

		// Step 2: Trigger calculation (click Calculate button)
		await page.click('[data-testid="calculate-button"]')

		// Step 3: Wait for results
		await page.waitForSelector('[data-testid="results-panel"]', {
			timeout: 5000
		})

		// Step 4: Extract costs from UI
		const uiCosts = await extractWeldingCostsFromUI(page, {
			directMachineCost: '[data-testid="direct-machine-cost"]',
			directLaborCost: '[data-testid="direct-labor-cost"]',
			inspectionCost: '[data-testid="inspection-cost"]',
			totalPowerCost: '[data-testid="power-cost"]',
			directProcessCost: '[data-testid="process-cost"]'
		})

		// Verify costs are reasonable
		expect(uiCosts['directMachineCost']).toBeGreaterThan(0)
		expect(uiCosts['directLaborCost']).toBeGreaterThan(0)
		expect(uiCosts['totalPowerCost']).toBeGreaterThan(0)
	})

	test('Verify seam welding calculations', async () => {
		const manufactureInfo: ProcessInfoDto = {
			processTypeID: ProcessType.SeamWelding,
			cuttingSpeed: 100,
			cuttingLength: 500,
			unloadingTime: 3,
			cycleTime: 30,
			efficiency: 90,
			powerConsumption: 5,
			electricityUnitCost: 0.12,
			requiredCurrent: 150,
			requiredWeldingVoltage: 20,
			netMaterialCost: 30,
			machineHourRate: 120,
			skilledLaborRatePerHour: 30,
			setUpTime: 30,
			lotSize: 50,
			materialInfoList: [],
			subProcessFormArray: undefined as any
		}

		const result = calculateSeamWeldingCosts(manufactureInfo)

		expect(result.cycleTime).toBeCloseTo(30, 1)
		expect(result.directProcessCost).toBeGreaterThan(0)
	})

	test('Validate cost appears correctly in UI', async () => {
		// Fill form and calculate
		await fillWeldingForm(page, {
			'cycle-time': '60',
			'power-consumption': '5',
			'electricity-cost': '0.12'
		})

		await page.click('[data-testid="calculate-button"]')
		await page.waitForSelector('[data-testid="results-panel"]')

		// Expected power cost: (60 / 3600) * 5 * 0.12 = $0.01
		const isValid = await validateWeldingCostInUI(
			page,
			'[data-testid="power-cost"]',
			0.01,
			0.05 // 5% tolerance
		)

		expect(isValid).toBe(true)
	})

	test('Compare calculated vs UI values with tolerance', async () => {
		// Prepare known test data
		const testData: ProcessInfoDto = {
			processTypeID: ProcessType.MigWelding,
			cycleTime: 120,
			efficiency: 85,
			powerConsumption: 10,
			electricityUnitCost: 0.15,
			machineHourRate: 200,
			skilledLaborRatePerHour: 40,
			lowSkilledLaborRatePerHour: 25,
			setUpTime: 30,
			lotSize: 100,
			noOfLowSkilledLabours: 1,
			inspectionTime: 10,
			qaOfInspectorRate: 30,
			partComplexity: 2,
			yieldPer: 95,
			samplingRate: 100,
			netMaterialCost: 100,
			materialInfoList: [],
			subProcessFormArray: undefined as any
		}

		// Calculate expected values
		const expectedResult = calculateWeldingCosts(testData)

		// Fill and submit form
		await fillWeldingForm(page, {
			'cycle-time': String(testData.cycleTime),
			efficiency: String(testData.efficiency),
			'power-consumption': String(testData.powerConsumption),
			'electricity-cost': String(testData.electricityUnitCost),
			'machine-hour-rate': String(testData.machineHourRate),
			'labor-rate': String(testData.lowSkilledLaborRatePerHour),
			'setup-time': String(testData.setUpTime),
			'lot-size': String(testData.lotSize)
		})

		await page.click('[data-testid="calculate-button"]')
		await page.waitForSelector('[data-testid="results-panel"]')

		// Extract UI values
		const actualValues = await extractWeldingCostsFromUI(page, {
			directMachineCost: '[data-testid="direct-machine-cost"]',
			directLaborCost: '[data-testid="direct-labor-cost"]',
			inspectionCost: '[data-testid="inspection-cost"]',
			totalPowerCost: '[data-testid="power-cost"]'
		})

		// Create expected object
		const expected = {
			directMachineCost: expectedResult.directMachineCost,
			directLaborCost: expectedResult.directLaborCost,
			inspectionCost: expectedResult.inspectionCost,
			totalPowerCost: expectedResult.totalPowerCost
		}

		// Verify with tolerance
		const { isValid, differences } = verifyWeldingCalculations(
			expected,
			actualValues,
			0.02 // 2% tolerance
		)

		expect(isValid).toBe(true)

		// Log differences for debugging
		if (!isValid) {
			console.log('Cost differences:', differences)
		}
	})

	test('Handle material selection and cost update', async () => {
		// Select material
		await page.selectOption('[data-testid="material-select"]', 'carbon-steel')

		// Fill relevant material info
		const materialData = {
			'material-price': '10',
			density: '7.85',
			volume: '1000',
			efficiency: '80'
		}

		await fillWeldingForm(page, materialData)

		// Calculate material costs
		await page.click('[data-testid="calculate-material-button"]')
		await page.waitForSelector('[data-testid="material-cost"]')

		// Verify material cost is shown
		const costValue = await page.inputValue('[data-testid="material-cost"]')
		expect(costValue).not.toBe('')
		expect(parseFloat(costValue)).toBeGreaterThan(0)
	})

	test('Error handling for invalid inputs', async () => {
		// Fill with invalid data
		await fillWeldingForm(page, {
			'cycle-time': '-50', // Invalid: negative
			efficiency: '150', // Invalid: > 100
			'power-consumption': 'abc' // Invalid: not a number
		})

		await page.click('[data-testid="calculate-button"]')

		// Should show error message
		const errorMsg = await page
			.locator('[data-testid="error-message"]')
			.isVisible()
		expect(errorMsg).toBe(true)
	})

	test('Multi-step welding calculation workflow', async () => {
		// Step 1: Select process type
		await page.selectOption('[data-testid="process-type"]', 'mig-welding')

		// Step 2: Enter parameters
		await fillWeldingForm(page, {
			'weld-length': '500',
			'weld-places': '2',
			'wire-diameter': '1.2',
			passes: '1'
		})

		// Step 3: Calculate weld volume
		await page.click('[data-testid="calculate-volume-button"]')
		await page.waitForSelector('[data-testid="weld-volume-result"]')

		// Step 4: Continue with costs
		await fillWeldingForm(page, {
			'material-price': '12',
			'labor-rate': '25',
			'machine-rate': '150'
		})

		await page.click('[data-testid="calculate-costs-button"]')

		// Step 5: Verify final costs
		const finalCosts = await extractWeldingCostsFromUI(page, {
			materialCost: '[data-testid="material-cost-final"]',
			laborCost: '[data-testid="labor-cost-final"]',
			machineCost: '[data-testid="machine-cost-final"]',
			totalCost: '[data-testid="total-cost"]'
		})

		expect(finalCosts['totalCost']).toBeGreaterThan(0)
	})
})
