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
exports.PlasticRubberLogic = void 0;
const plastic_rubber_process_calculator_1 = require("../utils/plastic-rubber-process-calculator");
const constants_1 = require("../utils/constants");
const BasePage_1 = require("../lib/BasePage");
const LoggerUtil_1 = __importDefault(require("../lib/LoggerUtil"));
const logger = LoggerUtil_1.default;
class PlasticRubberLogic {
    constructor(page) {
        this.page = page;
        this.calculator = new plastic_rubber_process_calculator_1.PlasticRubberProcessCalculator();
    }
    /**
     * Verifies Injection Moulding Calculations
     */
    verifyInjectionMoulding() {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('🔹 Verifying Injection Moulding Calculations...');
            // 1. Collect inputs from UI
            const density = yield this.page.readNumberSafe(this.page.Density, 'Density');
            const grossWeight = yield this.page.readNumberSafe(this.page.GrossWeight, 'Gross Weight');
            const wallAvgThickness = yield this.page.readNumberSafe(this.page.WallAverageThickness, 'Wall Avg Thickness');
            const noOfCavities = yield this.page.readNumberSafe(this.page.NoOfCavities, 'No Of Cavities');
            const netMatCost = yield this.page.readNumberSafe(this.page.NetMaterialCost, 'Net Material Cost');
            const netWeight = yield this.page.readNumberSafe(this.page.NetPartWeight, 'Net Weight');
            const machineHourRate = yield this.page.readNumberSafe(this.page.MachineHourRate, 'Machine Hour Rate');
            const efficiency = yield this.page.readNumberSafe(this.page.Efficiency, 'Efficiency');
            const lowSkilledLaborRate = yield this.page.readNumberSafe(this.page.LowSkilledLaborRate, 'Low Skilled Labor Rate');
            const noOfLowSkilledLabours = yield this.page.readNumberSafe(this.page.NoOfLowSkilledLabours, 'No Of Low Skilled Labours');
            const lotSize = yield this.page.readNumberSafe(this.page.LotSize, 'Lot Size');
            const samplingRate = yield this.page.readNumberSafe(this.page.SamplingRate, 'Sampling Rate');
            const inspectionTime = yield this.page.readNumberSafe(this.page.InspectionTime, 'Inspection Time');
            const qaRate = yield this.page.readNumberSafe(this.page.QAInspectorRate, 'QA Rate');
            const yieldPer = yield this.page.readNumberSafe(this.page.YieldPercentage, 'Yield %');
            // 2. Build DTO
            const processInfo = {
                processTypeID: constants_1.ProcessType.InjectionMoulding,
                partComplexity: 1, // Default or scrape if needed
                materialInfoList: [{
                        density: density,
                        grossWeight: grossWeight,
                        wallAverageThickness: wallAvgThickness,
                        noOfCavities: noOfCavities,
                        netMatCost: netMatCost,
                        netWeight: netWeight,
                        materialInfo: { scrapPrice: 0 } // Default 0 or scrape
                    }],
                machineHourRate: machineHourRate,
                efficiency: efficiency,
                noOfLowSkilledLabours: noOfLowSkilledLabours,
                lowSkilledLaborRatePerHour: lowSkilledLaborRate,
                noOfSkilledLabours: 0,
                skilledLaborRatePerHour: 0,
                lotSize: lotSize,
                samplingRate: samplingRate,
                inspectionTime: inspectionTime,
                qaOfInspectorRate: qaRate,
                yieldPer: yieldPer,
                // ESG Inputs - These might need scraping from Machine/Labor details
                machineMaster: {
                    totalPowerKW: 45, // Default or scraped
                    powerUtilization: 0.8 // Default or scraped
                },
                laborRates: [{
                        powerESG: 0.12 // Example: 0.12 kg CO2 / kWh
                    }],
                // Flags to treat UI values as clean by default, will be overridden by logic if not dirty
                // In a fresh calculation test, we assume clean slate.
                iscoolingTimeDirty: false,
                isInsertsPlacementDirty: false,
                isPartEjectionDirty: false,
                isSideCoreMechanismsDirty: false,
                isOthersDirty: false,
                isinjectionTimeDirty: false,
                isDryCycleTimeDirty: false,
                isTotalTimeDirty: false,
                iscycleTimeDirty: false,
                isdirectMachineCostDirty: false,
                isdirectLaborCostDirty: false,
                isinspectionCostDirty: false,
                isdirectSetUpCostDirty: false,
                isyieldCostDirty: false
            };
            // 3. Calculate
            const result = this.calculator.calculationsForInjectionMoulding(processInfo);
            // 4. Verify Outputs
            yield BasePage_1.VerificationHelper.verifyNumeric(yield this.page.readNumberSafe(this.page.CycleTime, 'Cycle Time'), Number(result.cycleTime), 'Cycle Time');
            yield BasePage_1.VerificationHelper.verifyNumeric(yield this.page.readNumberSafe(this.page.DirectMachineCost, 'Direct Machine Cost'), Number(result.directMachineCost), 'Direct Machine Cost');
            yield BasePage_1.VerificationHelper.verifyNumeric(yield this.page.readNumberSafe(this.page.DirectLaborCost, 'Direct Labor Cost'), Number(result.directLaborCost), 'Direct Labor Cost');
            yield BasePage_1.VerificationHelper.verifyNumeric(yield this.page.readNumberSafe(this.page.InspectionCost, 'Inspection Cost'), Number(result.inspectionCost), 'Inspection Cost');
            yield BasePage_1.VerificationHelper.verifyNumeric(yield this.page.readNumberSafe(this.page.DirectSetUpCost, 'Direct Setup Cost'), Number(result.directSetUpCost), 'Direct Setup Cost');
            yield BasePage_1.VerificationHelper.verifyNumeric(yield this.page.readNumberSafe(this.page.YieldCost, 'Yield Cost'), Number(result.yieldCost), 'Yield Cost');
            yield BasePage_1.VerificationHelper.verifyNumeric(yield this.page.readNumberSafe(this.page.DirectProcessCost, 'Direct Process Cost'), Number(result.directProcessCost), 'Direct Process Cost');
            // 5. Navigate to Sustainability Tab
            logger.info('📂 Navigating to Sustainability Tab...');
            yield this.page.page.getByRole('tab', { name: 'Sustainability' }).click();
            yield this.page.page.waitForLoadState('networkidle');
            // Power ESG Verification
            yield BasePage_1.VerificationHelper.verifyNumeric(yield this.page.readNumberSafe(this.page.EsgImpactElectricityConsumption, 'Power ESG (Electricity Consumption)'), Number(result.esgImpactElectricityConsumption), 'Power ESG (Electricity Consumption)');
            logger.info('✔ Injection Moulding verification complete.');
        });
    }
}
exports.PlasticRubberLogic = PlasticRubberLogic;
