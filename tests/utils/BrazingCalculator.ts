
import { ProcessInfoDto } from './interfaces';
import { isValidNumber } from './helpers';
import { BrazingConfig } from './brazing-config';

export class BrazingCalculator {

    public static calculateBrazingCosts(manufactureInfo: ProcessInfoDto): ProcessInfoDto {
        const brazingTime = BrazingConfig.getPowerData(Number(manufactureInfo.partThickness || 0));
        let soakingTime = 10;

        // No of Joints
        if (!manufactureInfo.isnoOfCoreDirty) {
            manufactureInfo.noOfCore = manufactureInfo.noOfCore || 1;
        }

        // Pre Joint Cleaning time
        if (!manufactureInfo.isCuttingTimeDirty) {
            manufactureInfo.cuttingTime = manufactureInfo.cuttingTime || 4;
        }

        // Induction/Heating time
        if (!manufactureInfo.isinjectionTimeDirty) {
            manufactureInfo.injectionTime = manufactureInfo.injectionTime || 4;
        }

        // Brazing Time (Soaking time)
        if (!manufactureInfo.issoakingTimeDirty) {
            soakingTime = brazingTime;
            manufactureInfo.soakingTime = soakingTime;
        } else {
            soakingTime = Number(manufactureInfo.soakingTime || 0);
        }

        // Sheet Load/Unload time
        if (!manufactureInfo.isSheetLoadULoadTimeDirty) {
            manufactureInfo.sheetLoadUloadTime = manufactureInfo.sheetLoadUloadTime || 6;
        }

        // Post Joint Cleaning time
        if (!manufactureInfo.iscoolingTimeDirty) {
            manufactureInfo.coolingTime = manufactureInfo.coolingTime || 4;
        }

        // Efficiency
        if (!manufactureInfo.isefficiencyDirty) {
            manufactureInfo.efficiency = BrazingConfig.getEfficiency(Number(manufactureInfo.semiAutoOrAuto || 1));
        }
        const efficiency = (Number(manufactureInfo.efficiency) || 80) / 100;

        // Cycle time
        if (!manufactureInfo.iscycleTimeDirty) {
            const cycleTime = isValidNumber(
                (Number(manufactureInfo.coolingTime) * Number(manufactureInfo.noOfCore) +
                    Number(manufactureInfo.sheetLoadUloadTime) +
                    ((Number(manufactureInfo.cuttingTime) + Number(manufactureInfo.injectionTime)) * Number(manufactureInfo.noOfCore) + Number(soakingTime) + Number(manufactureInfo.sheetLoadUloadTime))) /
                efficiency
            );
            manufactureInfo.cycleTime = cycleTime;
        }

        // No of Low Skilled Labors
        if (!manufactureInfo.isNoOfLowSkilledLaboursDirty) {
            manufactureInfo.noOfLowSkilledLabours = BrazingConfig.getNoOfLowSkilledLabours(Number(manufactureInfo.semiAutoOrAuto || 3));
        }

        // Default Skilled Labors
        manufactureInfo.noOfSkilledLabours = manufactureInfo.noOfSkilledLabours || 1;
        manufactureInfo.qaOfInspector = manufactureInfo.qaOfInspector || 1;

        // Machine Hour Rate
        if (!manufactureInfo.ismachineHourRateDirty) {
            const multiplier = BrazingConfig.getMachineHourRateMultiplier(Number(manufactureInfo.semiAutoOrAuto || 1));
            manufactureInfo.machineHourRate = isValidNumber(multiplier * Number(manufactureInfo.machineHourRateFromDB || 0));
        }

        // Direct Machine Cost
        if (!manufactureInfo.isdirectMachineCostDirty) {
            manufactureInfo.directMachineCost = isValidNumber((Number(manufactureInfo.machineHourRate) * Number(manufactureInfo.cycleTime)) / 3600 / efficiency);
        }

        // Direct Setup Cost
        if (!manufactureInfo.isdirectSetUpCostDirty) {
            manufactureInfo.directSetUpCost = isValidNumber(
                (((Number(manufactureInfo.noOfLowSkilledLabours) * Number(manufactureInfo.setUpTime || 0)) / 60) * Number(manufactureInfo.lowSkilledLaborRatePerHour || 0)) / efficiency / Number(manufactureInfo.lotSize || 1) +
                (((Number(manufactureInfo.noOfSkilledLabours) * Number(manufactureInfo.skilledLaborRatePerHour || 0)) / 60) * Number(manufactureInfo.setUpTime || 0)) / efficiency / Number(manufactureInfo.lotSize || 1)
            );
        }

        // Direct Labor Cost
        if (!manufactureInfo.isdirectLaborCostDirty) {
            manufactureInfo.directLaborCost = isValidNumber(
                ((Number(manufactureInfo.lowSkilledLaborRatePerHour || 0) / 3600) * Number(manufactureInfo.cycleTime) * Number(manufactureInfo.noOfLowSkilledLabours)) / efficiency
            );
        }

        // Inspection Cost
        if (!manufactureInfo.isinspectionCostDirty) {
            const samplingRate = (Number(manufactureInfo.samplingRate) || 5) / 100;
            const lotSize = Number(manufactureInfo.lotSize || 1);
            manufactureInfo.inspectionCost = isValidNumber(
                ((Number(manufactureInfo.inspectionTime || 0) / 60) * Number(manufactureInfo.qaOfInspectorRate || 0) * Number(manufactureInfo.qaOfInspector)) / Math.ceil(samplingRate * lotSize)
            );
        }

        const sum = Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost);

        // Yield Cost
        if (!manufactureInfo.isyieldCostDirty) {
            manufactureInfo.yieldCost = isValidNumber((1 - Number(manufactureInfo.yieldPer || 97) / 100) * sum);
        }

        manufactureInfo.directProcessCost = isValidNumber(sum + Number(manufactureInfo.yieldCost));

        return manufactureInfo;
    }
}
