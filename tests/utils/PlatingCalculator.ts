
import { ProcessInfoDto } from './interfaces';
import { isValidNumber } from './helpers';
import { ProcessType } from './constants';
import { PlatingConfig } from './plating-config';

export class PlatingCalculator {

    public static calculatePlatingCosts(manufactureInfo: ProcessInfoDto): ProcessInfoDto {
        const pType = Number(manufactureInfo.processTypeID);
        // Map Galvanization to subProcessTypeID 11 if not set
        if (pType === ProcessType.Electroplating && manufactureInfo.subProcessName === 'Galvanization') {
            manufactureInfo.subProcessTypeID = 11;
        }

        const subProcessTypeID = Number(manufactureInfo.subProcessTypeID);
        const defaults = PlatingConfig.getProcessDefaults(pType, subProcessTypeID);

        manufactureInfo.qaOfInspector = defaults.qa;
        manufactureInfo.noOfSkilledLabours = defaults.skilledLabours || 1;

        const materialInfoList = Array.isArray(manufactureInfo.materialInfoList) ? manufactureInfo.materialInfoList : [];
        const matPlating = materialInfoList[0] || null; // Assume first material is primary

        manufactureInfo.density = matPlating?.density || 0;
        manufactureInfo.noOfInsert = matPlating?.noOfInserts || 0;
        manufactureInfo.grossWeight = matPlating?.grossWeight || 0;
        manufactureInfo.wallAverageThickness = matPlating?.wallAverageThickness || 0;
        manufactureInfo.noOfCavities = matPlating?.noOfCavities || 0;
        manufactureInfo.netMaterialCost = matPlating?.netMatCost || 0;
        manufactureInfo.netPartWeight = matPlating?.netWeight || 0;
        manufactureInfo.rawmaterialCost = matPlating?.netMatCost || 0;
        manufactureInfo.projArea = matPlating?.runnerProjectedArea || 0;
        manufactureInfo.partProjArea = matPlating?.partProjectedArea || 0;
        const partVolume = matPlating?.dimVolume || 0;
        manufactureInfo.yieldPer = manufactureInfo.yieldPer || 98.5;

        // Tank size selection
        const product = partVolume * (manufactureInfo.lotSize || 1);
        let tankSizes = PlatingConfig.getPlatingTankSize(product);
        if (pType === 157 || pType === 156) { // Silver or Gold
            tankSizes = PlatingConfig.getSilverOrGoldTankSize(product);
        }

        // Shot size (Tank size id)
        if (!manufactureInfo.isshotSizeDirty) {
            manufactureInfo.shotSize = tankSizes?.id || 0;
        }

        // Type of operation (Loading type)
        if (!manufactureInfo.isTypeOfOperationDirty) {
            let loadingType = partVolume > 1000000 ? 2 : 1;
            if (pType === 157 || pType === 156) loadingType = 2; // Silver/Gold default to Hanger
            manufactureInfo.typeOfOperationId = loadingType;
        }

        // Tank volume calculations
        const tankVolume = (tankSizes?.length || 0) * (tankSizes?.width || 0) * (tankSizes?.height || 0);
        const availableTankVolume = tankVolume * 0.7;
        const barrelHangerVolume = availableTankVolume * 0.7;

        // Utilisation
        if (!manufactureInfo.isutilisationDirty) {
            const volumeUtilizationMap: Record<number, Record<number, Partial<Record<number, number>>>> = {
                1: { // Low complexity
                    1: { 143: 25, 131: 32, 144: 25, 130: 25, 354: 25 }, // Barrel
                    2: { 143: 23, 131: 35, 144: 23, 130: 23, 157: 25, 156: 35, 354: 23 }, // Hanger
                },
                2: { // Medium
                    1: { 143: 23, 131: 30, 144: 23, 130: 23, 354: 23 },
                    2: { 143: 22, 131: 32, 144: 22, 130: 22, 157: 23, 156: 30, 354: 22 },
                },
                3: { // High
                    1: { 143: 21, 131: 28, 144: 21, 130: 21, 354: 21 },
                    2: { 143: 20, 131: 30, 144: 20, 130: 20, 157: 20, 156: 25, 354: 20 },
                },
            };
            const complexityKey = Number(manufactureInfo.partComplexity) || 1;
            const operationKey = Number(manufactureInfo.typeOfOperationId) || 1;
            let volumeUtilizationRatio: number = volumeUtilizationMap[complexityKey]?.[operationKey]?.[pType] ?? 25;
            if (pType === ProcessType.Galvanization) { // Galvanization
                volumeUtilizationRatio = defaults.utilisation || 15;
            }
            manufactureInfo.utilisation = volumeUtilizationRatio;
        }
        const availableVolume = Math.floor(barrelHangerVolume * ((manufactureInfo.utilisation || 0) / 100));

        // Efficiency
        if (!manufactureInfo.isefficiencyDirty) {
            manufactureInfo.efficiency = manufactureInfo.efficiency || 85;
            if (manufactureInfo.efficiency < 1) manufactureInfo.efficiency *= 100;
        }

        // Machine speed / Conveyor speed
        if (!manufactureInfo.isspeedOfConveyerDirty) {
            let machineSpeed = defaults.machineSpeed;
            if (pType === ProcessType.PowderCoating) { // Powder Coating
                machineSpeed = PlatingConfig.getPowderCoatingMachineSpeed(manufactureInfo.eav || 0, matPlating?.dimX || 0);
            }
            manufactureInfo.speedOfConveyer = machineSpeed;
        }

        // Pre & post treatment time
        const prePostTreatmentTime = manufactureInfo.shotSize === 1 ? 13 : manufactureInfo.shotSize === 2 ? 22.25 : 30;

        // Rack movement time (Rotation time)
        if (!manufactureInfo.isRotationTimeDirty) {
            let rackMovementTime = manufactureInfo.shotSize === 1 ? 5 : manufactureInfo.shotSize === 2 ? 7 : 10;
            if (pType === ProcessType.R2RPlating) { // R2R Plating
                const matFamily = matPlating?.materialMasterData?.materialTypeName || matPlating?.materialDescriptionList?.[0]?.materialTypeName || '';
                rackMovementTime = PlatingConfig.getFeedRate(matFamily);
            }
            manufactureInfo.rotationTime = rackMovementTime;
        }

        // Injection time (Coating time)
        if (!manufactureInfo.isinjectionTimeDirty) {
            const electroPlatingTime = isValidNumber((matPlating?.density * (matPlating?.paintCoatingTickness || 0) * 60) / ((defaults.intensity || 1) * (defaults.electroStatic || 1) * (defaults.yield / 100 || 1)));
            let injectionTime = electroPlatingTime;
            if (pType === ProcessType.Galvanization && !!matPlating) { // Galvanization
                const coatingTimeRows = PlatingConfig.galvanizationCoatingTime.find((rec) => rec.thickness >= Number(matPlating?.paintCoatingTickness));
                injectionTime = coatingTimeRows ? coatingTimeRows.cleaningPickling + coatingTimeRows.fluxing + coatingTimeRows.dipping + coatingTimeRows.coolingInspection : 0;
            }
            manufactureInfo.injectionTime = injectionTime;
        }

        // Total injection time
        if (!manufactureInfo.istotalInjectionTimeDirty) {
            manufactureInfo.totalInjectionTime = isValidNumber(Number(manufactureInfo.injectionTime || 0) + Number(manufactureInfo.rotationTime || 0) + Number(prePostTreatmentTime));
        }

        // No of parts handled
        if (!manufactureInfo.isnoOfPartsDirty) {
            let noOfParts = 0;
            if (pType === ProcessType.Galvanization && !!matPlating) { // Galvanization
                const galvanizationAvailableVolume = Math.floor((defaults.volumeOfBarrel || 0) * ((manufactureInfo.utilisation || 0) / 100));
                noOfParts = Math.floor(galvanizationAvailableVolume / (matPlating?.dimVolume * 1.5));
            } else if (pType === 46) { // Powder Coating
                let availableHangerHeigth = (manufactureInfo.eav || 0) <= 15000 ? 1600 : (manufactureInfo.eav || 0) <= 100000 ? 1800 : 2000;
                const part1 = (manufactureInfo.speedOfConveyer * 1000) / (matPlating?.dimX + (matPlating?.dimX > 500 ? 100 : 80));
                const minVal = Math.min(matPlating?.dimY || 0, matPlating?.dimZ || 0);
                const part2 = availableHangerHeigth / (minVal + (minVal > 500 ? 100 : 80));
                const xPartAcc = part1 * part2;
                const part3 = (manufactureInfo.speedOfConveyer * 1000) / (minVal + (minVal > 500 ? 100 : 80));
                const part4 = availableHangerHeigth / (matPlating?.dimX + (matPlating?.dimX > 500 ? 100 : 80));
                const yPartAcc = part3 * part4;
                noOfParts = Math.floor(Math.max(xPartAcc, yPartAcc));
            } else {
                let partVol = (matPlating?.dimVolume || 0) * 1.3;
                if (pType === 157) partVol = (matPlating?.dimVolume || 0) * 1.2;
                if (pType === 156) partVol = (matPlating?.dimVolume || 0) * 1.5;
                noOfParts = Math.floor(availableVolume / partVol);
            }
            manufactureInfo.noOfParts = noOfParts || 1;
        }

        // Cycle time
        if (!manufactureInfo.iscycleTimeDirty) {
            let cycleTime = 0;
            if (pType === 180) { // Galvanization
                cycleTime = isValidNumber((Number(manufactureInfo.injectionTime) * 60) / Number(manufactureInfo.noOfParts));
            } else if (pType === 46) { // Powder Coating
                cycleTime = isValidNumber((60 / manufactureInfo.noOfParts + (Number(manufactureInfo.loadingTime) || 10)) / 0.8);
            } else {
                cycleTime = isValidNumber((Number(manufactureInfo.totalInjectionTime) * 60) / Number(manufactureInfo.noOfParts));
            }
            manufactureInfo.cycleTime = cycleTime;
        }

        // Setup time
        if (!manufactureInfo.issetUpTimeDirty && !manufactureInfo.setUpTime) {
            let setUpTime = Number(manufactureInfo.shotSize) === 1 ? 60 : Number(manufactureInfo.shotSize) === 2 ? 90 : (pType === 157 || pType === 156) ? 100 : 120;
            if (pType === 46) setUpTime = 120;
            manufactureInfo.setUpTime = setUpTime;
        }

        // Costs
        const efficiencyFactor = (manufactureInfo.efficiency || 85) / 100;

        // Machine hour rate
        manufactureInfo.machineHourRate = manufactureInfo.machineMaster?.machineHourRate || manufactureInfo.machineHourRate || 0;

        // Direct machine cost
        if (!manufactureInfo.isdirectMachineCostDirty) {
            manufactureInfo.directMachineCost = isValidNumber((Number(manufactureInfo.cycleTime) / 3600) * Number(manufactureInfo.machineHourRate) / efficiencyFactor);
        }

        // Direct labor cost
        if (!manufactureInfo.isdirectLaborCostDirty) {
            manufactureInfo.directLaborCost = isValidNumber(
                ((Number(manufactureInfo.cycleTime) * Number(manufactureInfo.lowSkilledLaborRatePerHour || 0) * Number(manufactureInfo.noOfLowSkilledLabours || 0)) / 3600 / efficiencyFactor) +
                ((Number(manufactureInfo.cycleTime) * Number(manufactureInfo.skilledLaborRatePerHour || 0) * Number(manufactureInfo.noOfSkilledLabours || 0)) / 3600 / efficiencyFactor)
            );
        }

        // Direct setup cost
        if (!manufactureInfo.isdirectSetUpCostDirty) {
            let directSetUpCost = isValidNumber(
                ((Number(manufactureInfo.skilledLaborRatePerHour || 0) / 60 + Number(manufactureInfo.lowSkilledLaborRatePerHour || 0) / 60) *
                    (Number(manufactureInfo.setUpTime) * Number(manufactureInfo.noOfSkilledLabours || 1)) +
                    (Number(manufactureInfo.machineHourRate) / 60) * Number(manufactureInfo.setUpTime)) /
                Math.max(Number(manufactureInfo.lotSize || 1), Number(manufactureInfo.noOfParts || 1))
            );
            manufactureInfo.directSetUpCost = directSetUpCost;
        }

        // Inspection cost
        if (!manufactureInfo.isinspectionCostDirty) {
            manufactureInfo.inspectionCost = isValidNumber(
                (Number(manufactureInfo.qaOfInspectorRate || 0) * (manufactureInfo.qaOfInspector || 1) * (Number(manufactureInfo.inspectionTime) || 20)) /
                60 / efficiencyFactor / Number(manufactureInfo.lotSize || 1)
            );
        }

        // Yield cost
        if (!manufactureInfo.isyieldCostDirty) {
            const sum = Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost);
            manufactureInfo.yieldCost = isValidNumber((1 - Number(manufactureInfo.yieldPer) / 100) * sum);
        }

        const processCost = isValidNumber(
            Number(manufactureInfo.directLaborCost) +
            Number(manufactureInfo.directMachineCost) +
            Number(manufactureInfo.directSetUpCost) +
            Number(manufactureInfo.inspectionCost) +
            Number(manufactureInfo.yieldCost)
        );

        manufactureInfo.directProcessCost = processCost;
        manufactureInfo.conversionCost = processCost;
        manufactureInfo.partCost = (manufactureInfo.rawmaterialCost || 0) + manufactureInfo.conversionCost;

        return manufactureInfo;
    }
}
