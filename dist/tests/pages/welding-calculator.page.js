"use strict";
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
exports.WeldingCalculatorService = exports.WeldingPage = void 0;
const test_1 = require("@playwright/test");
const LoggerUtil_1 = __importDefault(require("../lib/LoggerUtil"));
const logger = LoggerUtil_1.default;
class WeldingPage {
    constructor(page) {
        this.page = page;
        // Main welding fields
        this.weldingProcessDropdown = page.getByLabel('Welding Process');
        this.machineTypeDropdown = page.getByLabel('Machine Type');
        this.weldPositionDropdown = page.getByLabel('Weld Position');
        this.partComplexityDropdown = page.getByLabel('Part Complexity');
        // Sub-process elements
        this.addWeldButton = page.getByRole('button', { name: /Add Weld/i });
        this.weldTypeDropdown = page.locator('#WeldType1');
        this.noOfWeldsInput = page.locator('#noOfWelds');
        this.totalWeldLengthInput = page.locator('#totalWeldLength');
        this.weldLegSizeInput = page.locator('#WeldSize1');
        this.weldPositionSubDropdown = page.locator('#weldPosition');
        this.noOfIntermediateStopsInput = page.locator('#intermediateStops');
        // Display elements
        this.weldElementSizeDisplay = page.locator('#WeldElementSize1');
        this.cycleTimeDisplay = page.getByLabel('Cycle Time');
        this.travelSpeedDisplay = page.getByLabel('Travel Speed');
        this.requiredCurrentDisplay = page.getByLabel('Required Current');
        this.requiredVoltageDisplay = page.getByLabel('Required Voltage');
        this.arcOnTimeDisplay = page.getByLabel('Arc On Time');
        this.arcOffTimeDisplay = page.getByLabel('Arc Off Time');
        // Cost displays
        this.directMachineCostDisplay = page.getByLabel('Direct Machine Cost');
        this.directLaborCostDisplay = page.getByLabel('Direct Labor Cost');
        this.directSetUpCostDisplay = page.getByLabel('Direct Set Up Cost');
        this.inspectionCostDisplay = page.getByLabel('Inspection Cost');
        this.yieldCostDisplay = page.getByLabel('Yield Cost');
        this.powerCostDisplay = page.getByLabel('Power Cost');
        this.directProcessCostDisplay = page.getByLabel('Direct Process Cost');
        // Sustainability elements
        this.esgImpactElectricityConsumption = page.locator('#esgImpactElectricityConsumption');
        this.esgImpactAnnualUsageHrs = page.locator('#esgImpactAnnualUsageHrs');
        this.esgImpactAnnualKgCO2 = page.locator('#esgImpactAnnualKgCO2');
        this.esgImpactAnnualKgCO2Part = page.locator('#esgImpactAnnualKgCO2Part');
        // Editable inputs
        this.lotSizeInput = page.getByLabel('Lot Size');
        this.setupTimeInput = page.getByLabel('Setup Time');
        this.efficiencyInput = page.getByLabel('Efficiency');
        this.yieldPercentageInput = page.getByLabel('Yield Percentage');
        this.electricityUnitCostInput = page.getByLabel('Electricity Unit Cost');
    }
    // ==================== NAVIGATION ====================
    navigateToWeldingSection(projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.goto(`/costing/${projectId}`);
            yield this.page.waitForLoadState('networkidle');
            logger.info(`Navigated to welding section for project ${projectId}`);
        });
    }
    // ==================== FILL METHODS ====================
    selectWeldingProcess(processName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.selectDropdownValue(this.weldingProcessDropdown, processName);
            logger.info(`Selected welding process: ${processName}`);
        });
    }
    selectMachineType(machineType) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.selectDropdownValue(this.machineTypeDropdown, machineType);
            logger.info(`Selected machine type: ${machineType}`);
        });
    }
    selectPartComplexity(complexity) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.selectDropdownValue(this.partComplexityDropdown, complexity);
            logger.info(`Selected part complexity: ${complexity}`);
        });
    }
    selectWeldPosition(position) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.selectDropdownValue(this.weldPositionDropdown, position);
            logger.info(`Selected weld position: ${position}`);
        });
    }
    fillWeldingInputs(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (data.lotSize)
                yield this.fillInput(this.lotSizeInput, data.lotSize.toString());
            if (data.setUpTime)
                yield this.fillInput(this.setupTimeInput, data.setUpTime.toString());
            if (data.efficiency)
                yield this.fillInput(this.efficiencyInput, data.efficiency.toString());
            if (data.yieldPer)
                yield this.fillInput(this.yieldPercentageInput, data.yieldPer.toString());
            if (data.electricityUnitCost)
                yield this.fillInput(this.electricityUnitCostInput, data.electricityUnitCost.toString());
            logger.info('Filled welding input fields');
        });
    }
    // ==================== WELD SUB-PROCESS ====================
    addWeldSubProcess(weld) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.addWeldButton.click();
            yield this.page.waitForTimeout(500); // Wait for form to appear
            if (weld.weldType) {
                const weldTypes = ['', 'Fillet', 'Square', 'Plug', 'Bevel/Flare/ V Groove', 'U/J Groove'];
                yield this.selectDropdownValue(this.weldTypeDropdown, weldTypes[weld.weldType]);
            }
            if (weld.noOfWelds)
                yield this.fillInput(this.noOfWeldsInput, weld.noOfWelds.toString());
            if (weld.totalWeldLength)
                yield this.fillInput(this.totalWeldLengthInput, weld.totalWeldLength.toString());
            if (weld.weldLegSize)
                yield this.fillInput(this.weldLegSizeInput, weld.weldLegSize.toString());
            if (weld.noOfIntermediateStops)
                yield this.fillInput(this.noOfIntermediateStopsInput, weld.noOfIntermediateStops.toString());
            logger.info('Added weld sub-process');
        });
    }
    // ==================== VERIFICATION METHODS ====================
    verifyWeldingSize() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const getWeldElementSize = (value) => {
                if (value <= 3)
                    return value;
                if (value <= 4.5)
                    return 3;
                if (value <= 5.5)
                    return 4;
                if (value <= 6)
                    return 5;
                if (value <= 12)
                    return 6;
                return 8;
            };
            try {
                logger.info('🔍 verifyWeldingSize started...');
                // Ensure weld elements are visible
                yield (0, test_1.expect)(this.weldElementSizeDisplay).toBeVisible({ timeout: 3000 });
                yield this.weldElementSizeDisplay.scrollIntoViewIfNeeded();
                yield (0, test_1.expect)(this.weldTypeDropdown).toBeVisible({ timeout: 3000 });
                yield (0, test_1.expect)(this.weldLegSizeInput).toBeVisible({ timeout: 3000 });
                // Select type & enter size
                yield this.selectDropdownValue(this.weldTypeDropdown, 'Fillet');
                yield this.fillInput(this.weldLegSizeInput, '6');
                const weldValue = Number(yield this.weldLegSizeInput.inputValue());
                const expectedElementSize = getWeldElementSize(weldValue);
                const uiValue = Number(((_a = (yield this.weldElementSizeDisplay.textContent())) === null || _a === void 0 ? void 0 : _a.trim()) || '0');
                // Validate
                (0, test_1.expect)(uiValue).toBe(expectedElementSize);
                logger.info(`✔ Weld Element Size validated → UI: ${uiValue}, Expected: ${expectedElementSize}`);
            }
            catch (error) {
                logger.error(`❌ verifyWeldingSize FAILED: ${error.message}`);
                throw error;
            }
        });
    }
    verifyCycleTimeCalculation() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger.info('🔍 Verifying cycle time calculation...');
                const cycleTimeText = yield this.cycleTimeDisplay.inputValue();
                const cycleTime = parseFloat(cycleTimeText || '0');
                (0, test_1.expect)(cycleTime).toBeGreaterThan(0);
                logger.info(`✔ Cycle time verified: ${cycleTime} seconds`);
            }
            catch (error) {
                logger.error(`❌ Cycle time verification FAILED: ${error.message}`);
                throw error;
            }
        });
    }
    verifyDirectProcessCost(expectedMin, expectedMax) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const costText = yield this.directProcessCostDisplay.inputValue();
                const cost = parseFloat(costText || '0');
                (0, test_1.expect)(cost).toBeGreaterThanOrEqual(expectedMin);
                (0, test_1.expect)(cost).toBeLessThanOrEqual(expectedMax);
                logger.info(`✔ Direct Process Cost verified: ${cost} (expected range: ${expectedMin} - ${expectedMax})`);
            }
            catch (error) {
                logger.error(`❌ Direct process cost verification FAILED: ${error.message}`);
                throw error;
            }
        });
    }
    // ==================== GETTER METHODS ====================
    getCycleTime() {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this.cycleTimeDisplay.inputValue();
            return parseFloat(value || '0');
        });
    }
    getDirectMachineCost() {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this.directMachineCostDisplay.inputValue();
            return parseFloat(value || '0');
        });
    }
    getDirectLaborCost() {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this.directLaborCostDisplay.inputValue();
            return parseFloat(value || '0');
        });
    }
    getDirectProcessCost() {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this.directProcessCostDisplay.inputValue();
            return parseFloat(value || '0');
        });
    }
    getAllCosts() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                directMachineCost: yield this.getDirectMachineCost(),
                directLaborCost: yield this.getDirectLaborCost(),
                directSetUpCost: parseFloat((yield this.directSetUpCostDisplay.inputValue()) || '0'),
                inspectionCost: parseFloat((yield this.inspectionCostDisplay.inputValue()) || '0'),
                yieldCost: parseFloat((yield this.yieldCostDisplay.inputValue()) || '0'),
                powerCost: parseFloat((yield this.powerCostDisplay.inputValue()) || '0'),
                directProcessCost: yield this.getDirectProcessCost()
            };
        });
    }
    // ==================== PRIVATE HELPERS ====================
    selectDropdownValue(locator, value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield locator.waitFor({ state: 'visible' });
            try {
                yield locator.selectOption({ label: value });
            }
            catch (_a) {
                // Fallback for custom dropdowns
                yield locator.click();
                yield this.page.getByRole('option', { name: value, exact: true }).click();
            }
        });
    }
    fillInput(locator, value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield locator.waitFor({ state: 'visible' });
            yield locator.clear();
            yield locator.fill(value);
            yield locator.blur();
        });
    }
    static calculateTotalWeldLength(length, places, side) {
        const sideFactor = side.toLowerCase().includes('both') ? 2 : 1;
        return length * places * sideFactor;
    }
    static calculateVolume(area, length) {
        return area * length;
    }
    static calculateWeight(volume, density) {
        return volume * density;
    }
    static calculateWeldVolume(weldType, weldSize, weldElementSize, weldLength, weldPlaces, weldPasses, weldSide) {
        let typeId = 1;
        const lowerType = weldType.toLowerCase();
        if (lowerType.includes('fillet'))
            typeId = 1;
        else if (lowerType.includes('square'))
            typeId = 2;
        else if (lowerType.includes('plug'))
            typeId = 3;
        else if (lowerType.includes('bevel') || lowerType.includes('v groove'))
            typeId = 4;
        else if (lowerType.includes('u/j'))
            typeId = 5;
        // Note: weldElementSize corresponds to 'size', weldSize corresponds to 'height'
        const size = weldElementSize;
        const height = weldSize;
        let weldCrossSection = 0;
        if (typeId === 1 || typeId === 2) {
            weldCrossSection = (size * size) / 2;
        }
        else if (typeId === 3) {
            weldCrossSection = (size * size) + height;
        }
        else if (typeId === 4) {
            weldCrossSection = (size * size) + (height / 2);
        }
        else {
            weldCrossSection = (size * height * 3) / 2;
        }
        const sideMultiplier = weldSide.toLowerCase().includes('both') ? 2 : 1;
        const totalWeldLength = weldLength * weldPlaces * weldPasses * sideMultiplier;
        return totalWeldLength * weldCrossSection;
    }
}
exports.WeldingPage = WeldingPage;
exports.WeldingCalculatorService = WeldingPage;
