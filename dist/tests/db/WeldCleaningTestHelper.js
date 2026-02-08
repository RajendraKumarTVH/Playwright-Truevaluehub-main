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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeldCleaningTestHelper = void 0;
const costing_config_1 = require("../src/app/modules/costing/costing.config");
class WeldCleaningTestHelper {
    // ------------------------------------
    // Read UI values
    // ------------------------------------
    static readUiValues(page) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                cycleTime: yield page.getInputValueAsNumber(page.CycleTimePart),
                machineCost: yield page.getInputValueAsNumber(page.MachineCostPart),
                setupCost: yield page.getInputValueAsNumber(page.SetupCostPart),
                laborCost: yield page.getInputValueAsNumber(page.LaborCostPart),
                inspectionCost: yield page.getInputValueAsNumber(page.QAInspectionCost),
                yieldCost: yield page.getInputValueAsNumber(page.YieldCostPart),
                machineHourRate: yield page.getInputValueAsNumber(page.MachineHourRate),
                efficiency: yield page.getInputValueAsNumber(page.MachineEfficiency),
                laborRate: yield page.getInputValueAsNumber(page.DirectLaborRate),
                noOfLabors: yield page.getInputValueAsNumber(page.NoOfDirectLabors),
                setupTime: yield page.getInputValueAsNumber(page.MachineSetupTime),
                lotSize: yield page.getInputValueAsNumber(page.LotSize),
                qaRate: yield page.getInputValueAsNumber(page.QAInspectorRate),
                inspectionTime: yield page.getInputValueAsNumber(page.QAInspectionTime),
                samplingRate: yield page.getInputValueAsNumber(page.SamplingRate),
                yieldPercentage: yield page.getInputValueAsNumber(page.YieldPercentage)
            };
        });
    }
    // ------------------------------------
    // Build calculator input safely
    // ------------------------------------
    static buildProcessInfo(ui) {
        return {
            processTypeID: costing_config_1.ProcessType.WeldingCleaning,
            // 🔑 Critical fix
            cycleTime: ui.cycleTime,
            iscycleTimeDirty: true,
            machineHourRate: ui.machineHourRate,
            efficiency: ui.efficiency,
            lowSkilledLaborRatePerHour: ui.laborRate,
            noOfLowSkilledLabours: ui.noOfLabors,
            skilledLaborRatePerHour: 0,
            noOfSkilledLabours: 0,
            setUpTime: ui.setupTime,
            lotSize: ui.lotSize,
            qaOfInspectorRate: ui.qaRate,
            inspectionTime: ui.inspectionTime,
            qaOfInspector: 1,
            samplingRate: ui.samplingRate,
            yieldPer: ui.yieldPercentage,
            yieldCost: ui.yieldCost,
            materialInfoList: [
                {
                    dimX: 60,
                    dimY: 10,
                    dimZ: 5,
                    netWeight: 26.9154,
                    netMatCost: 0
                }
            ],
            materialmasterDatas: {
                materialType: { materialTypeName: 'Carbon Steel' }
            }
        };
    }
}
exports.WeldCleaningTestHelper = WeldCleaningTestHelper;
