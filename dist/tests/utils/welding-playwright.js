"use strict";
// Playwright-specific wrapper functions for welding calculations
// These functions are optimized for use in Playwright tests
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAutocompleteDropdown = verifyAutocompleteDropdown;
exports.calculateWeldingCosts = calculateWeldingCosts;
exports.calculateSeamWeldingCosts = calculateSeamWeldingCosts;
exports.calculateSpotWeldingCosts = calculateSpotWeldingCosts;
exports.calculateWeldingMaterial = calculateWeldingMaterial;
exports.calculateWeldingPreparation = calculateWeldingPreparation;
exports.calculateWeldingCleaning = calculateWeldingCleaning;
exports.validateWeldingCostInUI = validateWeldingCostInUI;
exports.fillWeldingForm = fillWeldingForm;
exports.extractWeldingCostsFromUI = extractWeldingCostsFromUI;
exports.verifyWeldingCalculations = verifyWeldingCalculations;
const test_1 = require("@playwright/test");
const LoggerUtil_1 = __importDefault(require("../lib/LoggerUtil"));
const welding_calculator_1 = require("./welding-calculator");
const logger = LoggerUtil_1.default;
/**
 * Wrapper for autocomplete dropdown verification in Playwright
 * Validates dropdown visibility, opens it, and confirms selection
 */
function verifyAutocompleteDropdown(dropdown, options, defaultSearchText, label, cityField, countryField) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.info(`🔹 Verifying ${label} dropdown...`);
        yield dropdown.scrollIntoViewIfNeeded();
        yield (0, test_1.expect)(dropdown).toBeVisible();
        // Skip if disabled / readonly
        if ((yield dropdown.isDisabled()) ||
            (yield dropdown.getAttribute('readonly'))) {
            logger.warn(`⚠️ ${label} dropdown is disabled. Skipping validation.`);
            return;
        }
        // Open dropdown
        yield dropdown.click();
        // Trigger autocomplete if needed
        if ((yield options.count()) === 0) {
            yield dropdown.fill(defaultSearchText);
        }
        yield (0, test_1.expect)(options.first()).toBeVisible();
        const optionCount = yield options.count();
        (0, test_1.expect)(optionCount).toBeGreaterThan(0);
        const selectedOptionText = (yield options.first().innerText()).trim();
        yield options.first().click();
        // Validate selected value
        const selectedValue = (yield dropdown.inputValue().catch(() => '')) ||
            (yield dropdown.textContent()) ||
            '';
        test_1.expect
            .soft(selectedValue.toLowerCase())
            .toContain(selectedOptionText.toLowerCase());
        // Optional dependent fields
        if (cityField && countryField) {
            const city = (yield cityField.inputValue().catch(() => '')).trim();
            const country = (yield countryField.inputValue().catch(() => '')).trim();
            logger.debug(`City: ${city}, Country: ${country}`);
        }
        logger.info(`✅ ${label} dropdown validation completed`);
    });
}
/**
 * Calculate welding costs for a part
 * Wrapper around WeldingCalculator for test usage
 */
function calculateWeldingCosts(manufactureInfo, fieldColorsList = [], manufacturingObj = {}, laborRateDto = []) {
    const calculator = new welding_calculator_1.WeldingCalculator();
    return calculator.calculationForWelding(manufactureInfo, fieldColorsList, manufacturingObj, laborRateDto);
}
/**
 * Calculate seam welding costs
 */
function calculateSeamWeldingCosts(manufactureInfo, fieldColorsList = [], manufacturingObj = {}, laborRateDto = []) {
    const calculator = new welding_calculator_1.WeldingCalculator();
    return calculator.calculationForSeamWelding(manufactureInfo, fieldColorsList, manufacturingObj, laborRateDto);
}
/**
 * Calculate spot welding costs
 */
function calculateSpotWeldingCosts(manufactureInfo, fieldColorsList = [], manufacturingObj = {}, laborRateDto = []) {
    const calculator = new welding_calculator_1.WeldingCalculator();
    return calculator.calculationForSpotWelding(manufactureInfo, fieldColorsList, manufacturingObj, laborRateDto);
}
/**
 * Calculate welding material properties
 */
function calculateWeldingMaterial(materialInfo, fieldColorsList = [], selectedMaterialInfo = null) {
    const calculator = new welding_calculator_1.WeldingCalculator();
    return calculator.calculationForWeldingMaterial(materialInfo, fieldColorsList, selectedMaterialInfo);
}
/**
 * Calculate welding preparation (grinding, deburring)
 */
function calculateWeldingPreparation(manufactureInfo, fieldColorsList = [], manufacturingObj = {}) {
    const calculator = new welding_calculator_1.WeldingCalculator();
    return calculator.calculationsForWeldingPreparation(manufactureInfo, fieldColorsList, manufacturingObj);
}
/**
 * Calculate welding cleaning costs
 */
function calculateWeldingCleaning(manufactureInfo, fieldColorsList = [], manufacturingObj = {}) {
    const calculator = new welding_calculator_1.WeldingCalculator();
    return calculator.calculationsForWeldingCleaning(manufactureInfo, fieldColorsList, manufacturingObj);
}
/**
 * Validate welding cost result in UI
 * Checks if the calculated cost appears correctly in the page
 */
function validateWeldingCostInUI(page_1, costFieldSelector_1, expectedCost_1) {
    return __awaiter(this, arguments, void 0, function* (page, costFieldSelector, expectedCost, tolerance = 0.01 // 1% tolerance
    ) {
        try {
            const costElement = page.locator(costFieldSelector);
            yield (0, test_1.expect)(costElement).toBeVisible();
            const costText = yield costElement.inputValue();
            const actualCost = parseFloat(costText);
            const difference = Math.abs(actualCost - expectedCost);
            const percentageDifference = difference / expectedCost;
            logger.info(`💰 Cost Validation: Expected=${expectedCost}, Actual=${actualCost}, Diff%=${(percentageDifference * 100).toFixed(2)}%`);
            return percentageDifference <= tolerance;
        }
        catch (error) {
            logger.error(`❌ Error validating cost: ${error}`);
            return false;
        }
    });
}
/**
 * Fill welding form with calculated values
 * Utility for populating a welding form in tests
 */
function fillWeldingForm(page_1, formData_1) {
    return __awaiter(this, arguments, void 0, function* (page, formData, baseSelector = 'input, select, textarea') {
        logger.info(`📝 Filling welding form with ${Object.keys(formData).length} fields`);
        for (const [fieldName, value] of Object.entries(formData)) {
            try {
                const fieldSelector = `[name="${fieldName}"], [id="${fieldName}"], [data-testid="${fieldName}"]`;
                const field = page.locator(fieldSelector);
                if ((yield field.count()) > 0) {
                    yield field.fill(String(value));
                    logger.debug(`✓ Filled ${fieldName} = ${value}`);
                }
                else {
                    logger.warn(`⚠️ Field not found: ${fieldName}`);
                }
            }
            catch (error) {
                logger.warn(`⚠️ Error filling ${fieldName}: ${error}`);
            }
        }
        logger.info(`✅ Form fill completed`);
    });
}
/**
 * Extract welding cost data from UI
 * Extracts all welding-related costs from the page
 */
function extractWeldingCostsFromUI(page, costFieldSelectors) {
    return __awaiter(this, void 0, void 0, function* () {
        const costs = {};
        logger.info(`📊 Extracting welding costs from UI`);
        for (const [costName, selector] of Object.entries(costFieldSelectors)) {
            try {
                const element = page.locator(selector);
                if ((yield element.count()) > 0) {
                    const value = yield element
                        .inputValue()
                        .catch(() => __awaiter(this, void 0, void 0, function* () { return yield element.textContent(); }));
                    costs[costName] = parseFloat(String(value) || '0');
                    logger.debug(`✓ ${costName} = ${costs[costName]}`);
                }
            }
            catch (error) {
                logger.warn(`⚠️ Error extracting ${costName}: ${error}`);
                costs[costName] = 0;
            }
        }
        logger.info(`✅ Extraction completed: ${Object.keys(costs).length} costs found`);
        return costs;
    });
}
/**
 * Verify expected welding calculation values
 * Compares expected vs actual with tolerance
 */
function verifyWeldingCalculations(expected, actual, tolerance = 0.01 // 1% tolerance
) {
    const differences = {};
    let isValid = true;
    for (const [key, expectedValue] of Object.entries(expected)) {
        const actualValue = actual[key] || 0;
        const difference = Math.abs(actualValue - expectedValue);
        const percentageDifference = expectedValue > 0 ? difference / expectedValue : 0;
        differences[key] = percentageDifference;
        if (percentageDifference > tolerance) {
            isValid = false;
            logger.error(`❌ ${key}: Expected ${expectedValue}, Got ${actualValue} (Diff: ${(percentageDifference * 100).toFixed(2)}%)`);
        }
        else {
            logger.info(`✅ ${key}: Match (Expected: ${expectedValue}, Actual: ${actualValue})`);
        }
    }
    return { isValid, differences };
}
