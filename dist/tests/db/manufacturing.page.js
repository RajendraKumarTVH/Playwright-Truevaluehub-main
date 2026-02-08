"use strict";
/**
 * Manufacturing Page Object for Playwright Tests
 * Provides UI interaction methods for manufacturing/costing sections
 */
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
exports.ManufacturingPage = void 0;
const test_1 = require("@playwright/test");
const LoggerUtil_1 = __importDefault(require("../lib/LoggerUtil"));
const logger = LoggerUtil_1.default;
class ManufacturingPage {
    constructor(page) {
        this.page = page;
        // Navigation tabs
        this.partInfoTab = page.getByRole('tab', { name: /Part Information/i });
        this.materialTab = page.getByRole('tab', { name: /Material/i });
        this.manufacturingTab = page.getByRole('tab', { name: /Manufacturing/i });
        this.toolingTab = page.getByRole('tab', { name: /Tooling/i });
        this.overheadTab = page.getByRole('tab', { name: /Overhead/i });
        this.costSummaryTab = page.getByRole('tab', { name: /Cost Summary/i });
        // Process selection
        this.processGroupDropdown = page.getByLabel('Process Group');
        this.processTypeDropdown = page.getByLabel('Process Type');
        this.machineDropdown = page.getByLabel('Machine');
        this.addProcessButton = page.getByRole('button', { name: /Add Process/i });
        this.removeProcessButton = page.getByRole('button', { name: /Remove/i });
        // Manufacturing fields
        this.cycleTimeInput = page.getByLabel('Cycle Time');
        this.efficiencyInput = page.getByLabel('Efficiency');
        this.lotSizeInput = page.getByLabel('Lot Size');
        this.setupTimeInput = page.getByLabel('Setup Time');
        this.machineHourRateInput = page.getByLabel('Machine Hour Rate');
        // Cost displays
        this.directMachineCostInput = page.getByLabel('Direct Machine Cost');
        this.directLaborCostInput = page.getByLabel('Direct Labor Cost');
        this.directSetupCostInput = page.getByLabel('Direct Setup Cost');
        this.inspectionCostInput = page.getByLabel('Inspection Cost');
        this.yieldCostInput = page.getByLabel('Yield Cost');
        this.directProcessCostInput = page.getByLabel('Direct Process Cost');
        this.totalManufacturingCostDisplay = page.locator('[data-testid="total-manufacturing-cost"]');
        // Labor fields
        this.noOfLowSkilledLaboursInput = page.getByLabel('No. of Low Skilled Labours');
        this.lowSkilledLaborRateInput = page.getByLabel('Low Skilled Labor Rate');
        this.noOfSkilledLaboursInput = page.getByLabel('No. of Skilled Labours');
        this.skilledLaborRateInput = page.getByLabel('Skilled Labor Rate');
        // Yield fields
        this.yieldPercentageInput = page.getByLabel('Yield Percentage');
        this.samplingRateInput = page.getByLabel('Sampling Rate');
        this.inspectionTimeInput = page.getByLabel('Inspection Time');
    }
    // ==================== NAVIGATION ====================
    navigateToManufacturing(projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.goto(`/costing/${projectId}/manufacturing`);
            yield this.page.waitForLoadState('networkidle');
            logger.info(`Navigated to manufacturing for project ${projectId}`);
        });
    }
    clickManufacturingTab() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.manufacturingTab.click();
            yield this.page.waitForLoadState('networkidle');
            logger.info('Clicked Manufacturing tab');
        });
    }
    // ==================== PROCESS SELECTION ====================
    selectProcessGroup(groupName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.selectDropdownValue(this.processGroupDropdown, groupName);
            yield this.page.waitForTimeout(500);
            logger.info(`Selected process group: ${groupName}`);
        });
    }
    selectProcessType(typeName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.selectDropdownValue(this.processTypeDropdown, typeName);
            yield this.page.waitForTimeout(500);
            logger.info(`Selected process type: ${typeName}`);
        });
    }
    selectMachine(machineName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.selectDropdownValue(this.machineDropdown, machineName);
            logger.info(`Selected machine: ${machineName}`);
        });
    }
    addProcess(processGroup, processType) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.addProcessButton.click();
            yield this.page.waitForTimeout(500);
            yield this.selectProcessGroup(processGroup);
            yield this.selectProcessType(processType);
            logger.info(`Added process: ${processGroup} - ${processType}`);
        });
    }
    // ==================== FILL METHODS ====================
    fillManufacturingInputs(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (data.cycleTime !== undefined)
                yield this.fillInput(this.cycleTimeInput, data.cycleTime.toString());
            if (data.efficiency !== undefined)
                yield this.fillInput(this.efficiencyInput, data.efficiency.toString());
            if (data.lotSize !== undefined)
                yield this.fillInput(this.lotSizeInput, data.lotSize.toString());
            if (data.setUpTime !== undefined)
                yield this.fillInput(this.setupTimeInput, data.setUpTime.toString());
            if (data.machineHourRate !== undefined)
                yield this.fillInput(this.machineHourRateInput, data.machineHourRate.toString());
            logger.info('Filled manufacturing inputs');
        });
    }
    fillLaborInputs(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (data.noOfLowSkilled !== undefined)
                yield this.fillInput(this.noOfLowSkilledLaboursInput, data.noOfLowSkilled.toString());
            if (data.lowSkilledRate !== undefined)
                yield this.fillInput(this.lowSkilledLaborRateInput, data.lowSkilledRate.toString());
            if (data.noOfSkilled !== undefined)
                yield this.fillInput(this.noOfSkilledLaboursInput, data.noOfSkilled.toString());
            if (data.skilledRate !== undefined)
                yield this.fillInput(this.skilledLaborRateInput, data.skilledRate.toString());
            logger.info('Filled labor inputs');
        });
    }
    fillYieldInputs(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (data.yieldPercentage !== undefined)
                yield this.fillInput(this.yieldPercentageInput, data.yieldPercentage.toString());
            if (data.samplingRate !== undefined)
                yield this.fillInput(this.samplingRateInput, data.samplingRate.toString());
            if (data.inspectionTime !== undefined)
                yield this.fillInput(this.inspectionTimeInput, data.inspectionTime.toString());
            logger.info('Filled yield inputs');
        });
    }
    // ==================== VERIFICATION ====================
    verifyCycleTimeCalculated() {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this.cycleTimeInput.inputValue();
            (0, test_1.expect)(parseFloat(value || '0')).toBeGreaterThan(0);
            logger.info(`Cycle time verified: ${value}`);
        });
    }
    verifyDirectProcessCostCalculated() {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this.directProcessCostInput.inputValue();
            (0, test_1.expect)(parseFloat(value || '0')).toBeGreaterThan(0);
            logger.info(`Direct process cost verified: ${value}`);
        });
    }
    verifyCostBreakdown() {
        return __awaiter(this, void 0, void 0, function* () {
            const costs = {
                directMachineCost: parseFloat((yield this.directMachineCostInput.inputValue()) || '0'),
                directLaborCost: parseFloat((yield this.directLaborCostInput.inputValue()) || '0'),
                directSetupCost: parseFloat((yield this.directSetupCostInput.inputValue()) || '0'),
                inspectionCost: parseFloat((yield this.inspectionCostInput.inputValue()) || '0'),
                yieldCost: parseFloat((yield this.yieldCostInput.inputValue()) || '0'),
                directProcessCost: parseFloat((yield this.directProcessCostInput.inputValue()) || '0')
            };
            logger.info(`Cost breakdown: ${JSON.stringify(costs)}`);
            return costs;
        });
    }
    // ==================== GETTERS ====================
    getCycleTime() {
        return __awaiter(this, void 0, void 0, function* () {
            return parseFloat((yield this.cycleTimeInput.inputValue()) || '0');
        });
    }
    getDirectProcessCost() {
        return __awaiter(this, void 0, void 0, function* () {
            return parseFloat((yield this.directProcessCostInput.inputValue()) || '0');
        });
    }
    getEfficiency() {
        return __awaiter(this, void 0, void 0, function* () {
            return parseFloat((yield this.efficiencyInput.inputValue()) || '0');
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
                yield locator.click();
                yield this.page.getByRole('option', { name: value }).first().click();
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
}
exports.ManufacturingPage = ManufacturingPage;
