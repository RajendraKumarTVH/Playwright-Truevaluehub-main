import { ProcessInfoDto } from '../src/app/shared/models';
import { ProcessType } from '../src/app/modules/costing/costing.config';

export class WeldCleaningTestHelper {

    // ------------------------------------
    // Read UI values
    // ------------------------------------
    static async readUiValues(page: any) {
        return {
            cycleTime: await page.getInputValueAsNumber(page.CycleTimePart),
            machineCost: await page.getInputValueAsNumber(page.MachineCostPart),
            setupCost: await page.getInputValueAsNumber(page.SetupCostPart),
            laborCost: await page.getInputValueAsNumber(page.LaborCostPart),
            inspectionCost: await page.getInputValueAsNumber(page.QAInspectionCost),
            yieldCost: await page.getInputValueAsNumber(page.YieldCostPart),

            machineHourRate: await page.getInputValueAsNumber(page.MachineHourRate),
            efficiency: await page.getInputValueAsNumber(page.MachineEfficiency),
            laborRate: await page.getInputValueAsNumber(page.DirectLaborRate),
            noOfLabors: await page.getInputValueAsNumber(page.NoOfDirectLabors),
            setupTime: await page.getInputValueAsNumber(page.MachineSetupTime),
            lotSize: await page.getInputValueAsNumber(page.LotSize),
            qaRate: await page.getInputValueAsNumber(page.QAInspectorRate),
            inspectionTime: await page.getInputValueAsNumber(page.QAInspectionTime),
            samplingRate: await page.getInputValueAsNumber(page.SamplingRate),
            yieldPercentage: await page.getInputValueAsNumber(page.YieldPercentage)
        };
    }

    // ------------------------------------
    // Build calculator input safely
    // ------------------------------------
    static buildProcessInfo(ui: any): ProcessInfoDto {
        return {
            processTypeID: ProcessType.WeldingCleaning,

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

        } as ProcessInfoDto;
    }
}
