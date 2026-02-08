// Playwright-specific wrapper functions for welding calculations
// These functions are optimized for use in Playwright tests

import { expect, Locator, Page } from '@playwright/test'
import Logger from '../lib/LoggerUtil'
import { ProcessInfoDto, LaborRateMasterDto } from './interfaces'
import { WeldingCalculator } from './welding-calculator'

const logger = Logger

/**
 * Wrapper for autocomplete dropdown verification in Playwright
 * Validates dropdown visibility, opens it, and confirms selection
 */
export async function verifyAutocompleteDropdown(
	dropdown: Locator,
	options: Locator,
	defaultSearchText: string,
	label: string,
	cityField?: Locator,
	countryField?: Locator
): Promise<void> {
	logger.info(`🔹 Verifying ${label} dropdown...`)

	await dropdown.scrollIntoViewIfNeeded()
	await expect(dropdown).toBeVisible()

	// Skip if disabled / readonly
	if (
		(await dropdown.isDisabled()) ||
		(await dropdown.getAttribute('readonly'))
	) {
		logger.warn(`⚠️ ${label} dropdown is disabled. Skipping validation.`)
		return
	}

	// Open dropdown
	await dropdown.click()

	// Trigger autocomplete if needed
	if ((await options.count()) === 0) {
		await dropdown.fill(defaultSearchText)
	}

	await expect(options.first()).toBeVisible()

	const optionCount = await options.count()
	expect(optionCount).toBeGreaterThan(0)
	const selectedOptionText = (await options.first().innerText()).trim()

	await options.first().click()

	// Validate selected value
	const selectedValue =
		(await dropdown.inputValue().catch(() => '')) ||
		(await dropdown.textContent()) ||
		''

	expect
		.soft(selectedValue.toLowerCase())
		.toContain(selectedOptionText.toLowerCase())

	// Optional dependent fields
	if (cityField && countryField) {
		const city = (await cityField.inputValue().catch(() => '')).trim()
		const country = (await countryField.inputValue().catch(() => '')).trim()
		logger.debug(`City: ${city}, Country: ${country}`)
	}

	logger.info(`✅ ${label} dropdown validation completed`)
}

/**
 * Calculate welding costs for a part
 * Wrapper around WeldingCalculator for test usage
 */
export function calculateWeldingCosts(
	manufactureInfo: ProcessInfoDto,
	fieldColorsList: any = [],
	manufacturingObj: ProcessInfoDto = {} as ProcessInfoDto,
	laborRateDto: LaborRateMasterDto[] = []
): ProcessInfoDto {
	const calculator = new WeldingCalculator()
	return calculator.calculationForWelding(
		manufactureInfo,
		fieldColorsList,
		manufacturingObj,
		laborRateDto
	)
}

/**
 * Calculate seam welding costs
 */
export function calculateSeamWeldingCosts(
	manufactureInfo: ProcessInfoDto,
	fieldColorsList: any = [],
	manufacturingObj: ProcessInfoDto = {} as ProcessInfoDto,
	laborRateDto: LaborRateMasterDto[] = []
): ProcessInfoDto {
	const calculator = new WeldingCalculator()
	return calculator.calculationForSeamWelding(
		manufactureInfo,
		fieldColorsList,
		manufacturingObj,
		laborRateDto
	)
}

/**
 * Calculate spot welding costs
 */
export function calculateSpotWeldingCosts(
	manufactureInfo: ProcessInfoDto,
	fieldColorsList: any = [],
	manufacturingObj: ProcessInfoDto = {} as ProcessInfoDto,
	laborRateDto: LaborRateMasterDto[] = []
): ProcessInfoDto {
	const calculator = new WeldingCalculator()
	return calculator.calculationForSpotWelding(
		manufactureInfo,
		fieldColorsList,
		manufacturingObj,
		laborRateDto
	)
}

/**
 * Calculate welding material properties
 */
export function calculateWeldingMaterial(
	materialInfo: any,
	fieldColorsList: any = [],
	selectedMaterialInfo: any = null
): any {
	const calculator = new WeldingCalculator()
	return calculator.calculationForWeldingMaterial(
		materialInfo,
		fieldColorsList,
		selectedMaterialInfo
	)
}

/**
 * Calculate welding preparation (grinding, deburring)
 */
export function calculateWeldingPreparation(
	manufactureInfo: ProcessInfoDto,
	fieldColorsList: any = [],
	manufacturingObj: ProcessInfoDto = {} as ProcessInfoDto
): ProcessInfoDto {
	const calculator = new WeldingCalculator()
	return calculator.calculationsForWeldingPreparation(
		manufactureInfo,
		fieldColorsList,
		manufacturingObj
	)
}

/**
 * Calculate welding cleaning costs
 */
export function calculateWeldingCleaning(
	manufactureInfo: ProcessInfoDto,
	fieldColorsList: any = [],
	manufacturingObj: ProcessInfoDto = {} as ProcessInfoDto
): ProcessInfoDto {
	const calculator = new WeldingCalculator()
	return calculator.calculationsForWeldingCleaning(
		manufactureInfo,
		fieldColorsList,
		manufacturingObj
	)
}

/**
 * Validate welding cost result in UI
 * Checks if the calculated cost appears correctly in the page
 */
export async function validateWeldingCostInUI(
	page: Page,
	costFieldSelector: string,
	expectedCost: number,
	tolerance: number = 0.01 // 1% tolerance
): Promise<boolean> {
	try {
		const costElement = page.locator(costFieldSelector)
		await expect(costElement).toBeVisible()

		const costText = await costElement.inputValue()
		const actualCost = parseFloat(costText)

		const difference = Math.abs(actualCost - expectedCost)
		const percentageDifference = difference / expectedCost

		logger.info(
			`💰 Cost Validation: Expected=${expectedCost}, Actual=${actualCost}, Diff%=${(
				percentageDifference * 100
			).toFixed(2)}%`
		)

		return percentageDifference <= tolerance
	} catch (error) {
		logger.error(`❌ Error validating cost: ${error}`)
		return false
	}
}

/**
 * Fill welding form with calculated values
 * Utility for populating a welding form in tests
 */
export async function fillWeldingForm(
	page: Page,
	formData: Record<string, string | number>,
	baseSelector: string = 'input, select, textarea'
): Promise<void> {
	logger.info(
		`📝 Filling welding form with ${Object.keys(formData).length} fields`
	)

	for (const [fieldName, value] of Object.entries(formData)) {
		try {
			const fieldSelector = `[name="${fieldName}"], [id="${fieldName}"], [data-testid="${fieldName}"]`
			const field = page.locator(fieldSelector)

			if ((await field.count()) > 0) {
				await field.fill(String(value))
				logger.debug(`✓ Filled ${fieldName} = ${value}`)
			} else {
				logger.warn(`⚠️ Field not found: ${fieldName}`)
			}
		} catch (error) {
			logger.warn(`⚠️ Error filling ${fieldName}: ${error}`)
		}
	}

	logger.info(`✅ Form fill completed`)
}

/**
 * Extract welding cost data from UI
 * Extracts all welding-related costs from the page
 */
export async function extractWeldingCostsFromUI(
	page: Page,
	costFieldSelectors: Record<string, string>
): Promise<Record<string, number>> {
	const costs: Record<string, number> = {}

	logger.info(`📊 Extracting welding costs from UI`)

	for (const [costName, selector] of Object.entries(costFieldSelectors)) {
		try {
			const element = page.locator(selector)
			if ((await element.count()) > 0) {
				const value = await element
					.inputValue()
					.catch(async () => await element.textContent())
				costs[costName] = parseFloat(String(value) || '0')
				logger.debug(`✓ ${costName} = ${costs[costName]}`)
			}
		} catch (error) {
			logger.warn(`⚠️ Error extracting ${costName}: ${error}`)
			costs[costName] = 0
		}
	}

	logger.info(
		`✅ Extraction completed: ${Object.keys(costs).length} costs found`
	)
	return costs
}

/**
 * Verify expected welding calculation values
 * Compares expected vs actual with tolerance
 */
export function verifyWeldingCalculations(
	expected: Record<string, number>,
	actual: Record<string, number>,
	tolerance: number = 0.01 // 1% tolerance
): { isValid: boolean; differences: Record<string, number> } {
	const differences: Record<string, number> = {}
	let isValid = true

	for (const [key, expectedValue] of Object.entries(expected)) {
		const actualValue = actual[key] || 0
		const difference = Math.abs(actualValue - expectedValue)
		const percentageDifference =
			expectedValue > 0 ? difference / expectedValue : 0

		differences[key] = percentageDifference

		if (percentageDifference > tolerance) {
			isValid = false
			logger.error(
				`❌ ${key}: Expected ${expectedValue}, Got ${actualValue} (Diff: ${(
					percentageDifference * 100
				).toFixed(2)}%)`
			)
		} else {
			logger.info(
				`✅ ${key}: Match (Expected: ${expectedValue}, Actual: ${actualValue})`
			)
		}
	}

	return { isValid, differences }
}
