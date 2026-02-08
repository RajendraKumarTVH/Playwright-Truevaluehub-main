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
exports.WeldCleaningTestHelper = void 0;
const test_1 = require("@playwright/test");
const welding_calculator_1 = require("../utils/welding-calculator");
const LoggerUtil_1 = __importDefault(require("../lib/LoggerUtil"));
const logger = LoggerUtil_1.default;
// import { ProcessType } from '../utils/ProcessType'
// import { ProcessInfoDto } from '../utils/ProcessInfoDto'
class WeldCleaningTestHelper {
    constructor(page, calculator = new welding_calculator_1.WeldingCalculator()) {
        this.page = page;
        this.calculator = calculator;
    }
    /* =====================================================
       UI VALUE COLLECTORS
       ===================================================== */
    getUIRates() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                machineHourRate: yield this.page.getInputValueAsNumber(this.page.MachineHourRate),
                cycleTime: yield this.page.getInputValueAsNumber(this.page.CycleTimePart),
                efficiency: yield this.page.getInputValueAsNumber(this.page.MachineEfficiency),
                setupTime: yield this.page.getInputValueAsNumber(this.page.MachineSetupTime),
                directLaborRate: yield this.page.getInputValueAsNumber(this.page.DirectLaborRate),
                noOfDirectLabors: yield this.page.getInputValueAsNumber(this.page.NoOfDirectLabors),
                qaRate: yield this.page.getInputValueAsNumber(this.page.QAInspectorRate),
                inspectionTime: yield this.page.getInputValueAsNumber(this.page.QAInspectionTime),
                samplingRate: yield this.page.getInputValueAsNumber(this.page.SamplingRate),
                yieldPer: yield this.page.getInputValueAsNumber(this.page.YieldPercentage)
            };
        });
    }
    getUICosts() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                machine: yield this.page.getInputValueAsNumber(this.page.MachineCostPart),
                setup: yield this.page.getInputValueAsNumber(this.page.SetupCostPart),
                labor: yield this.page.getInputValueAsNumber(this.page.LaborCostPart),
                inspection: yield this.page.getInputValueAsNumber(this.page.QAInspectionCost),
                yield: yield this.page.getInputValueAsNumber(this.page.YieldCostPart)
            };
        });
    }
    /* =====================================================
       FORMULA-LEVEL VERIFICATION (UI MIRROR)
       ===================================================== */
    verifyMachineCostFormula(machineHourRate, cycleTime, actualMachineCost) {
        const expected = (machineHourRate / 3600) * cycleTime;
        (0, test_1.expect)(actualMachineCost).toBeCloseTo(expected, 4);
    }
    /* =====================================================
       CALCULATOR INPUT — STRIPPED TO MIRROR UI
       ===================================================== */
    // buildCalculatorInputForUI(processOverrides: Partial<ProcessInfoDto>) {
    //     const processInfo = {} as ProcessInfoDto
    //     processInfo.processTypeID = ProcessType.WeldingCleaning
    //     // ⚠️ CRITICAL: mirror UI behavior
    //     processInfo.iscycleTimeDirty = false
    //     processInfo.efficiency = 100
    //     processInfo.yieldPer = 100
    //     processInfo.setUpTime = 0
    //     processInfo.lotSize = 1
    //     processInfo.noOfSkilledLabours = 0
    //     Object.assign(processInfo, processOverrides)
    //     return processInfo
    // }
    /* =====================================================
       ENGINE CALCULATION (CONTROLLED)
       ===================================================== */
    // calculate(processInfo: ProcessInfoDto) {
    //     return this.calculator.calculationsForWeldingPreparation(
    //         processInfo,
    //         [],
    //         processInfo
    //     )
    // }
    /* =====================================================
       ENGINE ASSERTIONS (NOT UI FORMULA)
       ===================================================== */
    clearAllAndWait() {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('🔹 Attempting to Clear All data...');
            // Wait until button is really usable
            yield this.page.ClearAll.waitFor({ state: 'visible', timeout: 7000 });
            yield (0, test_1.expect)(this.page.ClearAll).toBeEnabled();
            // Handle browser confirmation dialog if any
            this.page.page.once('dialog', (dialog) => __awaiter(this, void 0, void 0, function* () {
                logger.info(`Dialog detected: ${dialog.message()}`);
                yield dialog.accept();
            }));
            // Click Clear All (retry-safe)
            for (let i = 0; i < 3; i++) {
                try {
                    yield this.page.ClearAll.click({ timeout: 3000 });
                    break;
                }
                catch (e) {
                    logger.warn(`⚠ Clear click failed, retry ${i + 1}`);
                    yield this.page.wait(500);
                }
            }
            // Handle HTML modal confirmation (if app uses custom popup)
            const confirmBtn = this.page.page.getByRole('button', {
                name: /yes|confirm|ok/i
            });
            if (yield confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
                logger.info('HTML confirm modal detected, clicking confirm...');
                yield confirmBtn.click();
            }
            // Wait for backend + UI refresh
            yield this.page.waitForNetworkIdle();
            // HARD validation: form must actually reset
            yield test_1.expect
                .poll(() => __awaiter(this, void 0, void 0, function* () {
                return yield this.page.getInputValue(this.page.InternalPartNumber);
            }), { timeout: 7000 })
                .toBe('');
            logger.info('✔ Clear All successful and data reset verified');
        });
    }
    verifyEngineVsUI(calculated, actualCosts) {
        (0, test_1.expect)(actualCosts.machine).toBeCloseTo(Number(calculated.directMachineCost), 2);
        (0, test_1.expect)(actualCosts.setup).toBeCloseTo(Number(calculated.directSetUpCost), 2);
        (0, test_1.expect)(actualCosts.labor).toBeCloseTo(Number(calculated.directLaborCost), 2);
        (0, test_1.expect)(actualCosts.inspection).toBeCloseTo(Number(calculated.inspectionCost), 2);
        if (calculated.yieldCost !== undefined) {
            (0, test_1.expect)(actualCosts.yield).toBeCloseTo(Number(calculated.yieldCost), 2);
        }
    }
    getWeldingCalculationResult(processType, manufactureInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = processType === welding_calculator_1.ProcessType.WeldingCleaning
                ? this.calculator.calculationsForWeldingCleaning(manufactureInfo, [], manufactureInfo)
                : this.calculator.calculationForWelding(manufactureInfo, [], manufactureInfo, []);
            logger.info(`Calculated Results:\n${JSON.stringify(result, null, 2)}`);
            return result;
        });
    }
}
exports.WeldCleaningTestHelper = WeldCleaningTestHelper;
