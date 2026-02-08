"use strict";
// Example: Playwright E2E Tests using Welding Calculator
// Shows how to use welding-playwright utilities in real tests
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const welding_playwright_1 = require("../utils/welding-playwright");
const welding_enums_constants_1 = require("../utils/welding-enums-constants");
test_1.test.describe('Welding Calculator E2E Tests', () => {
    let page;
    test_1.test.beforeEach((_a) => __awaiter(void 0, [_a], void 0, function* ({ browser }) {
        page = yield browser.newPage();
        // Navigate to your welding calculator page
        yield page.goto('https://your-app.com/welding-calculator');
    }));
    test_1.test.afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield page.close();
    }));
    (0, test_1.test)('Calculate MIG welding costs', () => __awaiter(void 0, void 0, void 0, function* () {
        // Prepare test data
        const manufactureInfo = {
            processTypeID: welding_enums_constants_1.ProcessType.MigWelding,
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
            subProcessFormArray: undefined
        };
        // Calculate costs
        const result = (0, welding_playwright_1.calculateWeldingCosts)(manufactureInfo);
        // Assertions
        (0, test_1.expect)(result.directProcessCost).toBeGreaterThan(0);
        (0, test_1.expect)(result.totalPowerCost).toBeGreaterThan(0);
        (0, test_1.expect)(result.yieldCost).toBeGreaterThan(0);
    }));
    (0, test_1.test)('Fill welding form and verify calculations', () => __awaiter(void 0, void 0, void 0, function* () {
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
        };
        yield (0, welding_playwright_1.fillWeldingForm)(page, formData);
        // Step 2: Trigger calculation (click Calculate button)
        yield page.click('[data-testid="calculate-button"]');
        // Step 3: Wait for results
        yield page.waitForSelector('[data-testid="results-panel"]', {
            timeout: 5000
        });
        // Step 4: Extract costs from UI
        const uiCosts = yield (0, welding_playwright_1.extractWeldingCostsFromUI)(page, {
            directMachineCost: '[data-testid="direct-machine-cost"]',
            directLaborCost: '[data-testid="direct-labor-cost"]',
            inspectionCost: '[data-testid="inspection-cost"]',
            totalPowerCost: '[data-testid="power-cost"]',
            directProcessCost: '[data-testid="process-cost"]'
        });
        // Verify costs are reasonable
        (0, test_1.expect)(uiCosts['directMachineCost']).toBeGreaterThan(0);
        (0, test_1.expect)(uiCosts['directLaborCost']).toBeGreaterThan(0);
        (0, test_1.expect)(uiCosts['totalPowerCost']).toBeGreaterThan(0);
    }));
    (0, test_1.test)('Verify seam welding calculations', () => __awaiter(void 0, void 0, void 0, function* () {
        const manufactureInfo = {
            processTypeID: welding_enums_constants_1.ProcessType.SeamWelding,
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
            subProcessFormArray: undefined
        };
        const result = (0, welding_playwright_1.calculateSeamWeldingCosts)(manufactureInfo);
        (0, test_1.expect)(result.cycleTime).toBeCloseTo(30, 1);
        (0, test_1.expect)(result.directProcessCost).toBeGreaterThan(0);
    }));
    (0, test_1.test)('Validate cost appears correctly in UI', () => __awaiter(void 0, void 0, void 0, function* () {
        // Fill form and calculate
        yield (0, welding_playwright_1.fillWeldingForm)(page, {
            'cycle-time': '60',
            'power-consumption': '5',
            'electricity-cost': '0.12'
        });
        yield page.click('[data-testid="calculate-button"]');
        yield page.waitForSelector('[data-testid="results-panel"]');
        // Expected power cost: (60 / 3600) * 5 * 0.12 = $0.01
        const isValid = yield (0, welding_playwright_1.validateWeldingCostInUI)(page, '[data-testid="power-cost"]', 0.01, 0.05 // 5% tolerance
        );
        (0, test_1.expect)(isValid).toBe(true);
    }));
    (0, test_1.test)('Compare calculated vs UI values with tolerance', () => __awaiter(void 0, void 0, void 0, function* () {
        // Prepare known test data
        const testData = {
            processTypeID: welding_enums_constants_1.ProcessType.MigWelding,
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
            subProcessFormArray: undefined
        };
        // Calculate expected values
        const expectedResult = (0, welding_playwright_1.calculateWeldingCosts)(testData);
        // Fill and submit form
        yield (0, welding_playwright_1.fillWeldingForm)(page, {
            'cycle-time': String(testData.cycleTime),
            efficiency: String(testData.efficiency),
            'power-consumption': String(testData.powerConsumption),
            'electricity-cost': String(testData.electricityUnitCost),
            'machine-hour-rate': String(testData.machineHourRate),
            'labor-rate': String(testData.lowSkilledLaborRatePerHour),
            'setup-time': String(testData.setUpTime),
            'lot-size': String(testData.lotSize)
        });
        yield page.click('[data-testid="calculate-button"]');
        yield page.waitForSelector('[data-testid="results-panel"]');
        // Extract UI values
        const actualValues = yield (0, welding_playwright_1.extractWeldingCostsFromUI)(page, {
            directMachineCost: '[data-testid="direct-machine-cost"]',
            directLaborCost: '[data-testid="direct-labor-cost"]',
            inspectionCost: '[data-testid="inspection-cost"]',
            totalPowerCost: '[data-testid="power-cost"]'
        });
        // Create expected object
        const expected = {
            directMachineCost: expectedResult.directMachineCost,
            directLaborCost: expectedResult.directLaborCost,
            inspectionCost: expectedResult.inspectionCost,
            totalPowerCost: expectedResult.totalPowerCost
        };
        // Verify with tolerance
        const { isValid, differences } = (0, welding_playwright_1.verifyWeldingCalculations)(expected, actualValues, 0.02 // 2% tolerance
        );
        (0, test_1.expect)(isValid).toBe(true);
        // Log differences for debugging
        if (!isValid) {
            console.log('Cost differences:', differences);
        }
    }));
    (0, test_1.test)('Handle material selection and cost update', () => __awaiter(void 0, void 0, void 0, function* () {
        // Select material
        yield page.selectOption('[data-testid="material-select"]', 'carbon-steel');
        // Fill relevant material info
        const materialData = {
            'material-price': '10',
            density: '7.85',
            volume: '1000',
            efficiency: '80'
        };
        yield (0, welding_playwright_1.fillWeldingForm)(page, materialData);
        // Calculate material costs
        yield page.click('[data-testid="calculate-material-button"]');
        yield page.waitForSelector('[data-testid="material-cost"]');
        // Verify material cost is shown
        const costValue = yield page.inputValue('[data-testid="material-cost"]');
        (0, test_1.expect)(costValue).not.toBe('');
        (0, test_1.expect)(parseFloat(costValue)).toBeGreaterThan(0);
    }));
    (0, test_1.test)('Error handling for invalid inputs', () => __awaiter(void 0, void 0, void 0, function* () {
        // Fill with invalid data
        yield (0, welding_playwright_1.fillWeldingForm)(page, {
            'cycle-time': '-50', // Invalid: negative
            efficiency: '150', // Invalid: > 100
            'power-consumption': 'abc' // Invalid: not a number
        });
        yield page.click('[data-testid="calculate-button"]');
        // Should show error message
        const errorMsg = yield page
            .locator('[data-testid="error-message"]')
            .isVisible();
        (0, test_1.expect)(errorMsg).toBe(true);
    }));
    (0, test_1.test)('Multi-step welding calculation workflow', () => __awaiter(void 0, void 0, void 0, function* () {
        // Step 1: Select process type
        yield page.selectOption('[data-testid="process-type"]', 'mig-welding');
        // Step 2: Enter parameters
        yield (0, welding_playwright_1.fillWeldingForm)(page, {
            'weld-length': '500',
            'weld-places': '2',
            'wire-diameter': '1.2',
            passes: '1'
        });
        // Step 3: Calculate weld volume
        yield page.click('[data-testid="calculate-volume-button"]');
        yield page.waitForSelector('[data-testid="weld-volume-result"]');
        // Step 4: Continue with costs
        yield (0, welding_playwright_1.fillWeldingForm)(page, {
            'material-price': '12',
            'labor-rate': '25',
            'machine-rate': '150'
        });
        yield page.click('[data-testid="calculate-costs-button"]');
        // Step 5: Verify final costs
        const finalCosts = yield (0, welding_playwright_1.extractWeldingCostsFromUI)(page, {
            materialCost: '[data-testid="material-cost-final"]',
            laborCost: '[data-testid="labor-cost-final"]',
            machineCost: '[data-testid="machine-cost-final"]',
            totalCost: '[data-testid="total-cost"]'
        });
        (0, test_1.expect)(finalCosts['totalCost']).toBeGreaterThan(0);
    }));
});
