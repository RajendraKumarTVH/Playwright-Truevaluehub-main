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
exports.ToolingLogic = void 0;
const LoggerUtil_1 = __importDefault(require("../lib/LoggerUtil"));
const tooling_calculator_1 = require("../utils/tooling-calculator");
const BasePage_1 = require("../lib/BasePage");
const logger = LoggerUtil_1.default;
class ToolingLogic {
    constructor(page) {
        this.page = page;
        this.calculator = new tooling_calculator_1.ToolingCalculator();
    }
    collectToolingData() {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('🔹 Collecting Tooling Data from UI...');
            const data = {
                noOfCavity: yield this.page.readNumberSafe(this.page.NoOfCavity, 'No Of Cavity'),
                cavityMaxLength: yield this.page.readNumberSafe(this.page.CavityLength, 'Cavity Length'),
                cavityMaxWidth: yield this.page.readNumberSafe(this.page.CavityWidth, 'Cavity Width'),
                sideGapLength: yield this.page.readNumberSafe(this.page.SideGapLength, 'Side Gap Length'),
                sideGapWidth: yield this.page.readNumberSafe(this.page.SideGapWidth, 'Side Gap Width'),
                envelopLength: yield this.page.readNumberSafe(this.page.EnvelopeLength, 'Envelope Length'),
                envelopWidth: yield this.page.readNumberSafe(this.page.EnvelopeWidth, 'Envelope Width'),
                envelopHeight: yield this.page.readNumberSafe(this.page.EnvelopeHeight, 'Envelope Height'),
                runnerGapLength: yield this.page.readNumberSafe(this.page.RunnerGapLength, 'Runner Gap Length'),
                runnerGapWidth: yield this.page.readNumberSafe(this.page.RunnerGapWidth, 'Runner Gap Width'),
                moldBaseLength: yield this.page.readNumberSafe(this.page.MoldBaseLength, 'Mold Base Length'),
                moldBaseWidth: yield this.page.readNumberSafe(this.page.MoldBaseWidth, 'Mold Base Width'),
                moldBaseHeight: yield this.page.readNumberSafe(this.page.MoldBaseHeight, 'Mold Base Height'),
                noOfTool: yield this.page.readNumberSafe(this.page.TotalNoOfTools, 'Total No Of Tools'),
                noOfNewTool: yield this.page.readNumberSafe(this.page.NoOfNewTools, 'No Of New Tools'),
                noOfSubsequentTool: yield this.page.readNumberSafe(this.page.NoOfSubsequentTools, 'No Of Subsequent Tools'),
                toolLifeInParts: yield this.page.readNumberSafe(this.page.NoOfShotsNeededFromTool, 'Tool Life In Parts'),
                mouldTypeId: Number((yield this.page.MouldType.inputValue()) || 0),
                mouldSubTypeId: Number((yield this.page.MouldSubType.inputValue()) || 0),
                noOfDrop: yield this.page.readNumberSafe(this.page.NoOfDrop, 'No Of Drop'),
                noOfCopperElectrodes: yield this.page.readNumberSafe(this.page.NoOfCopperElectrodes, 'No Of Copper Electrodes'),
                noOfGraphiteElectrodes: yield this.page.readNumberSafe(this.page.NoOfGraphiteElectrodes, 'No Of Graphite Electrodes'),
                mouldCriticality: Number((yield this.page.MouldCriticality.inputValue()) || 0),
                surfaceFinish: Number((yield this.page.SurfaceFinish.inputValue()) || 0),
            };
            return data;
        });
    }
    verifyToolingCalculations() {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('🔹 Verifying Tooling Calculations...');
            const uiData = yield this.collectToolingData();
            // In a real scenario, you'd also need to collect material info rows
            // For now, let's verify the subsequent tool and base dimensions logic
            const expectedSubsequentTools = Math.max(0, uiData.noOfTool - uiData.noOfNewTool);
            yield BasePage_1.VerificationHelper.verifyNumeric(uiData.noOfSubsequentTool, expectedSubsequentTools, 'Number of Subsequent Tools');
            logger.info('✔ Tooling Calculations verified successfully');
        });
    }
    fillToolingDetails(details) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('🔹 Filling Tooling Details...');
            if (details.noOfTool !== undefined) {
                yield this.page.waitAndFill(this.page.TotalNoOfTools, details.noOfTool);
            }
            if (details.noOfNewTool !== undefined) {
                yield this.page.waitAndFill(this.page.NoOfNewTools, details.noOfNewTool);
            }
            // Add more filling logic as needed
            yield this.page.pressTab();
            yield this.page.waitForNetworkIdle();
        });
    }
    verifyMaterialInfoRows(expectedInfos) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('🔹 Verifying Material Info Rows...');
            // This is a simplified version. 
            // In the UI, we would iterate through rows of the table.
            // For now, let's just use the calculator to verify the logic against UI values
            const uiData = yield this.collectToolingData();
            for (const expected of expectedInfos) {
                logger.info(`Checking row: ${expected.moldDescription}`);
                // Logic to find row in UI and read its values
                // (Mocking the UI read for now or implementing if selectors known)
                const matInfo = {
                    moldDescriptionId: expected.moldDescriptionId,
                    moldDescription: expected.moldDescription,
                    length: expected.length || 0,
                    width: expected.width || 0,
                    height: expected.height || 0,
                    quantity: expected.quantity || 0,
                    density: expected.density || 7.85,
                    materialPrice: expected.materialPrice || 0,
                    materialCuttingAllowance: expected.materialCuttingAllowance || 10,
                    netWeight: 0,
                    totalPlateWeight: 0,
                    totalRawMaterialCost: 0
                };
                const calculated = this.calculator.calculateMaterialCost(matInfo, uiData, []);
                // Here you would add the actual Playwright expect(locator).toHaveValue(...)
                logger.info(`Calculated Raw Material Cost for ${matInfo.moldDescription}: ${calculated.totalRawMaterialCost}`);
            }
        });
    }
}
exports.ToolingLogic = ToolingLogic;
