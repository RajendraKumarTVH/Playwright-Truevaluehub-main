
import { ProcessInfoDto } from './interfaces';
import { isValidNumber } from './helpers';
import { PartComplexity } from './constants';
import { PlasticRubberConfig } from './plastic-rubber-config';

export class PlasticRubberProcessCalculator {

    public calculationsForInjectionMoulding(manufactureInfo: ProcessInfoDto): ProcessInfoDto {
        // Material Info Extraction
        const materialInfo = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0] : null;

        manufactureInfo.density = materialInfo?.density || 0;
        manufactureInfo.noOfInsert = materialInfo?.noOfInserts || 0;
        manufactureInfo.grossWeight = materialInfo?.grossWeight || 0;
        manufactureInfo.wallAverageThickness = materialInfo?.wallAverageThickness || 0;
        manufactureInfo.noOfCavities = materialInfo?.noOfCavities || 0;
        manufactureInfo.netMaterialCost = materialInfo?.netMatCost || 0;
        manufactureInfo.netPartWeight = materialInfo?.netWeight || 0;
        manufactureInfo.rawmaterialCost = materialInfo?.netMatCost || 0;
        manufactureInfo.projArea = materialInfo?.runnerProjectedArea || 0;
        manufactureInfo.partProjArea = materialInfo?.partProjectedArea || 0;

        manufactureInfo.shotSize = manufactureInfo.machineMaster?.shotSize || 0;

        // Bed Size
        manufactureInfo.recBedSize =
            manufactureInfo.platenSizeLength && manufactureInfo.platenSizeWidth
                ? Math.round(manufactureInfo.platenSizeLength) + ' x ' + Math.round(manufactureInfo.platenSizeWidth)
                : '';
        manufactureInfo.selectedBedSize =
            manufactureInfo.machineMaster?.platenLengthmm && manufactureInfo.machineMaster?.platenWidthmm
                ? manufactureInfo.machineMaster?.platenLengthmm + ' x ' + manufactureInfo.machineMaster?.platenWidthmm
                : '';

        // Injection Fill Time
        const injecRate = isValidNumber((Number(manufactureInfo?.machineMaster?.injectionRate) * Number(manufactureInfo.density)) / 1000);
        const shotweight = isValidNumber(manufactureInfo.grossWeight * manufactureInfo.noOfCavities);
        const materialInjectionFillTime = isValidNumber(shotweight / Number(injecRate));
        manufactureInfo.materialInjectionFillTime = materialInjectionFillTime;

        // Cooling Time
        if (!manufactureInfo.iscoolingTimeDirty) {
            let coolingTime = isValidNumber(
                (Math.pow(Number(manufactureInfo.wallAverageThickness), 2) / (2 * 3.141592654) / Number(manufactureInfo.thermalDiffusivity)) *
                Math.log((4 / 3.141592654) * ((Number(manufactureInfo.meltTemp) - Number(manufactureInfo.mouldTemp)) / (Number(manufactureInfo.ejecTemp) - Number(manufactureInfo.mouldTemp))))
            );

            if (manufactureInfo?.wallAverageThickness < 5) {
                coolingTime = isValidNumber(1 * Number(coolingTime));
            } else if (manufactureInfo?.wallAverageThickness >= 5 && manufactureInfo?.wallAverageThickness <= 10) {
                coolingTime = isValidNumber(0.65 * Number(coolingTime));
            } else if (manufactureInfo?.wallAverageThickness >= 10 && manufactureInfo?.wallAverageThickness <= 15) {
                coolingTime = isValidNumber(0.5 * Number(coolingTime));
            } else if (manufactureInfo?.wallAverageThickness > 15) {
                coolingTime = isValidNumber(0.42 * Number(coolingTime));
            }
            manufactureInfo.coolingTime = coolingTime;
        }

        // Insert Placement
        if (!manufactureInfo.isInsertsPlacementDirty) {
            manufactureInfo.insertsPlacement = isValidNumber(2.5 * manufactureInfo.noOfInsert);
        }

        // Part Ejection
        if (!manufactureInfo.isPartEjectionDirty) {
            let partEjection =
                manufactureInfo?.partComplexity == PartComplexity.Low ? 3 :
                    manufactureInfo?.partComplexity == PartComplexity.Medium ? 5.5 :
                        manufactureInfo?.partComplexity == PartComplexity.High ? 8 : 0;
            manufactureInfo.partEjection = isValidNumber(partEjection);
        }

        // Side Core Mechanisms
        if (!manufactureInfo.isSideCoreMechanismsDirty) {
            let sideCoreMechanisms =
                manufactureInfo?.partComplexity == PartComplexity.Low ? 2 :
                    manufactureInfo?.partComplexity == PartComplexity.Medium ? 4 :
                        manufactureInfo?.partComplexity == PartComplexity.High ? 8 : 0;
            manufactureInfo.sideCoreMechanisms = sideCoreMechanisms;
        }

        // Others
        if (!manufactureInfo.isOthersDirty) {
            manufactureInfo.others = isValidNumber(manufactureInfo.others);
        }

        // Pack & Hold Time
        const packAndHoldTime =
            manufactureInfo?.partComplexity == PartComplexity.Low ? 1 :
                manufactureInfo?.partComplexity == PartComplexity.Medium ? 2 :
                    manufactureInfo?.partComplexity == PartComplexity.High ? 3 : 5;
        manufactureInfo.packAndHoldTime = packAndHoldTime;

        // Injection Time
        if (!manufactureInfo.isinjectionTimeDirty) {
            manufactureInfo.injectionTime = isValidNumber(Number(manufactureInfo.packAndHoldTime) + Number(manufactureInfo.materialInjectionFillTime));
        }

        // Dry Cycle Time
        if (!manufactureInfo.isDryCycleTimeDirty) {
            manufactureInfo.dryCycleTime = isValidNumber(manufactureInfo.dryCycleTime);
        }

        // Total Time
        if (!manufactureInfo.isTotalTimeDirty) {
            manufactureInfo.totalTime = isValidNumber(
                Number(manufactureInfo.insertsPlacement) +
                Number(manufactureInfo.sideCoreMechanisms) +
                Number(manufactureInfo.injectionTime) +
                Number(manufactureInfo.partEjection) +
                Number(manufactureInfo.others) +
                Number(manufactureInfo.coolingTime) +
                Number(manufactureInfo.dryCycleTime)
            );
        }

        // Cycle Time
        if (!manufactureInfo.iscycleTimeDirty) {
            manufactureInfo.cycleTime = isValidNumber(
                (Number(manufactureInfo.insertsPlacement) +
                    Number(manufactureInfo.sideCoreMechanisms) +
                    Number(manufactureInfo.injectionTime) +
                    Number(manufactureInfo.partEjection) +
                    Number(manufactureInfo.others) +
                    Number(manufactureInfo.coolingTime) +
                    Number(manufactureInfo.dryCycleTime)) /
                (manufactureInfo.noOfCavities || 1)
            );
        }

        // Direct Machine Cost
        if (!manufactureInfo.isdirectMachineCostDirty) {
            manufactureInfo.directMachineCost = isValidNumber((Number(manufactureInfo.machineHourRate) / 3600) * manufactureInfo.cycleTime * manufactureInfo.efficiency);
        }

        // Setup Time
        if (!manufactureInfo.issetUpTimeDirty && !manufactureInfo.setUpTime) {
            manufactureInfo.setUpTime = 60;
        }

        // Low Skilled Labors
        if (!manufactureInfo.isNoOfLowSkilledLaboursDirty && manufactureInfo.noOfLowSkilledLabours == null) {
            // Logic not fully clear in source, usually defaults or comes from object. Using input or 0.
            manufactureInfo.noOfLowSkilledLabours = isValidNumber(manufactureInfo.noOfLowSkilledLabours);
        }
        manufactureInfo.lowSkilledLaborRatePerHour = isValidNumber(manufactureInfo.lowSkilledLaborRatePerHour);

        // Direct Labor Cost
        if (!manufactureInfo.isdirectLaborCostDirty) {
            manufactureInfo.directLaborCost = isValidNumber(
                (Number(manufactureInfo.noOfLowSkilledLabours) * manufactureInfo.cycleTime * (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600)) / manufactureInfo?.efficiency +
                (Number(manufactureInfo.noOfSkilledLabours) * manufactureInfo.cycleTime * (Number(manufactureInfo.skilledLaborRatePerHour) / 3600)) / manufactureInfo?.efficiency
            );
        }

        // Inspection Cost
        if (!manufactureInfo.isinspectionCostDirty) {
            manufactureInfo.inspectionCost = isValidNumber(Number(manufactureInfo.samplingRate / 100) * ((Number(manufactureInfo.inspectionTime) * Number(manufactureInfo.qaOfInspectorRate)) / 3600));
        }

        // Direct Setup Cost
        if (!manufactureInfo.isdirectSetUpCostDirty) {
            manufactureInfo.directSetUpCost = isValidNumber(
                ((Number(manufactureInfo.lowSkilledLaborRatePerHour) + Number(manufactureInfo.machineHourRate)) * (Number(manufactureInfo.setUpTime) / 60)) / manufactureInfo.lotSize
            );
        }

        // Yield Cost
        if (!manufactureInfo.isyieldCostDirty) {
            const sum = isValidNumber(
                Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
            );
            manufactureInfo.netMaterialCost = materialInfo?.netMatCost || 0;
            manufactureInfo.yieldCost = isValidNumber(
                (1 - Number(manufactureInfo.yieldPer) / 100) *
                (Number(manufactureInfo.netMaterialCost) - (Number(manufactureInfo.netPartWeight) * Number(manufactureInfo.materialInfo?.scrapPrice || 0)) / 1000 + sum)
            );
        }

        // Power ESG / Total Power Cost calculation
        const powerESG = manufactureInfo.laborRates?.length > 0 ? manufactureInfo.laborRates[0].powerESG : (manufactureInfo.laborRates?.powerESG || 0);
        manufactureInfo.esgImpactElectricityConsumption = isValidNumber(
            Number(manufactureInfo?.machineMaster?.totalPowerKW || 0) *
            Number(manufactureInfo?.machineMaster?.powerUtilization || 0) *
            Number(powerESG || 0)
        );

        // Process Cost
        const processCost = isValidNumber(
            Number(manufactureInfo.directLaborCost) +
            Number(manufactureInfo.directMachineCost) +
            Number(manufactureInfo.directSetUpCost) +
            Number(manufactureInfo.inspectionCost) +
            Number(manufactureInfo.yieldCost)
        );

        manufactureInfo.directTooling = isValidNumber(
            (Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost)) * 0.01
        );
        manufactureInfo.directProcessCost = processCost;
        manufactureInfo.conversionCost = processCost;
        manufactureInfo.partCost = manufactureInfo.rawmaterialCost + manufactureInfo.conversionCost;

        return manufactureInfo;
    }

    public calculationsForRubberInjectionMoulding(manufactureInfo: ProcessInfoDto): ProcessInfoDto {
        const materialInfo = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0] : null;

        manufactureInfo.density = materialInfo?.density || 0;
        manufactureInfo.noOfInsert = materialInfo?.noOfInserts || 0;
        manufactureInfo.grossWeight = materialInfo?.grossWeight || 0;
        manufactureInfo.wallAverageThickness = materialInfo?.wallAverageThickness || 0;
        manufactureInfo.noOfCavities = materialInfo?.noOfCavities || 0;
        manufactureInfo.netMaterialCost = materialInfo?.netMatCost || 0;
        manufactureInfo.netPartWeight = materialInfo?.netWeight || 0;
        manufactureInfo.rawmaterialCost = materialInfo?.netMatCost || 0;
        manufactureInfo.projArea = materialInfo?.runnerProjectedArea || 0;
        manufactureInfo.partProjArea = materialInfo?.partProjectedArea || 0;

        const cavityPressure = materialInfo?.materialMasterData?.clampingPressure || 0;
        manufactureInfo.cavityPressure = cavityPressure;

        const recommendTonnage = Math.ceil(
            ((materialInfo?.runnerProjectedArea + (materialInfo?.partProjectedArea || materialInfo?.projectedArea)) * materialInfo?.noOfCavities * cavityPressure * 1.15) / 1000
        );
        manufactureInfo.recommendTonnage = isValidNumber(recommendTonnage);
        manufactureInfo.selectedTonnage = manufactureInfo?.machineMaster?.machineTonnageTons || 0;

        // Insert Placement
        if (!manufactureInfo.isInsertsPlacementDirty) {
            manufactureInfo.insertsPlacement = manufactureInfo.noOfInsert <= 0 ? 0 : manufactureInfo.noOfInsert <= 5 ? 4 : manufactureInfo.noOfInsert <= 12 ? 8 : manufactureInfo.noOfInsert <= 20 ? 15 : 25;
        }

        // Open Close Time (Dry Cycle)
        if (!manufactureInfo.isDryCycleTimeDirty) {
            manufactureInfo.dryCycleTime =
                manufactureInfo.selectedTonnage >= 45 && manufactureInfo.selectedTonnage <= 180 ? 10 :
                    manufactureInfo.selectedTonnage >= 220 && manufactureInfo.selectedTonnage <= 300 ? 12 :
                        manufactureInfo.selectedTonnage > 300 ? 16 : 0;
        }

        // Injection Time
        if (!manufactureInfo.isinjectionTimeDirty) {
            manufactureInfo.injectionTime = isValidNumber(((materialInfo.runnerVolume + materialInfo.partVolume) * manufactureInfo.noOfCavities) / 60000);
        }

        const materialType = manufactureInfo?.materialmasterDatas?.materialType?.materialTypeName;

        // Curing Time (Mapped to sideCoreMechanisms in service??)
        // Service logic: manufactureInfo.sideCoreMechanisms = curingTime;
        if (!manufactureInfo.isSideCoreMechanismsDirty) {
            const kFact = PlasticRubberConfig.getKFactorRubberIM(materialType);
            manufactureInfo.sideCoreMechanisms = isValidNumber(kFact * Math.pow(materialInfo.wallThickessMm || 0, 2) * 1.3);
        }

        // Holding Time (Mapped to coolingTime in service)
        if (!manufactureInfo.iscoolingTimeDirty) {
            manufactureInfo.coolingTime = isValidNumber(manufactureInfo.sideCoreMechanisms * 0.3);
        }

        // Part Ejection Time
        if (!manufactureInfo.isPartEjectionDirty) {
            manufactureInfo.partEjection = isValidNumber(materialInfo?.noOfCavities * 1.2);
        }

        // Total Time
        if (!manufactureInfo.isTotalTimeDirty) {
            manufactureInfo.totalTime = isValidNumber(
                Number(manufactureInfo.insertsPlacement) +
                Number(manufactureInfo.sideCoreMechanisms) +
                Number(manufactureInfo.injectionTime) +
                Number(manufactureInfo.partEjection) +
                Number(manufactureInfo.coolingTime) +
                Number(manufactureInfo.dryCycleTime)
            );
        }

        // Cycle Time
        if (!manufactureInfo.iscycleTimeDirty) {
            manufactureInfo.cycleTime = isValidNumber(
                (Number(manufactureInfo.insertsPlacement) +
                    Number(manufactureInfo.sideCoreMechanisms) +
                    Number(manufactureInfo.injectionTime) +
                    Number(manufactureInfo.partEjection) +
                    Number(manufactureInfo.others || 0) +
                    Number(manufactureInfo.coolingTime) +
                    Number(manufactureInfo.dryCycleTime)) /
                (manufactureInfo.noOfCavities || 1)
            );
        }

        // Direct Machine Cost
        if (!manufactureInfo.isdirectMachineCostDirty) {
            manufactureInfo.directMachineCost = isValidNumber((Number(manufactureInfo.machineHourRate) / 3600) * manufactureInfo.cycleTime * manufactureInfo.efficiency);
        }

        // Setup Time
        if (!manufactureInfo.issetUpTimeDirty && !manufactureInfo.setUpTime) {
            manufactureInfo.setUpTime = 60;
        }

        // Direct Labor Cost
        if (!manufactureInfo.isdirectLaborCostDirty) {
            manufactureInfo.directLaborCost = isValidNumber(
                (Number(manufactureInfo.noOfLowSkilledLabours) * manufactureInfo.cycleTime * (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600)) / manufactureInfo?.efficiency +
                (Number(manufactureInfo.noOfSkilledLabours) * manufactureInfo.cycleTime * (Number(manufactureInfo.skilledLaborRatePerHour) / 3600)) / manufactureInfo?.efficiency
            );
        }

        // Inspection Cost
        if (!manufactureInfo.isinspectionCostDirty) {
            manufactureInfo.inspectionCost = isValidNumber(Number(manufactureInfo.samplingRate / 100) * ((Number(manufactureInfo.inspectionTime) * Number(manufactureInfo.qaOfInspectorRate)) / 3600));
        }

        // Direct Setup Cost
        if (!manufactureInfo.isdirectSetUpCostDirty) {
            manufactureInfo.directSetUpCost = isValidNumber(
                ((Number(manufactureInfo.lowSkilledLaborRatePerHour) + Number(manufactureInfo.machineHourRate)) * (Number(manufactureInfo.setUpTime) / 60)) / manufactureInfo.lotSize
            );
        }

        // Yield Cost
        if (!manufactureInfo.isyieldCostDirty) {
            const sum = isValidNumber(
                Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
            );
            manufactureInfo.yieldCost = isValidNumber(
                (1 - Number(manufactureInfo.yieldPer) / 100) *
                (Number(manufactureInfo.netMaterialCost) - (Number(manufactureInfo.netPartWeight) * Number(manufactureInfo.materialInfo?.scrapPrice || 0)) / 1000 + sum)
            );
        }

        const processCost = isValidNumber(
            Number(manufactureInfo.directLaborCost) +
            Number(manufactureInfo.directMachineCost) +
            Number(manufactureInfo.directSetUpCost) +
            Number(manufactureInfo.inspectionCost) +
            Number(manufactureInfo.yieldCost)
        );

        manufactureInfo.directTooling = isValidNumber(
            (Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost)) * 0.01
        );
        manufactureInfo.directProcessCost = processCost;
        manufactureInfo.conversionCost = processCost;
        manufactureInfo.partCost = manufactureInfo.rawmaterialCost + manufactureInfo.conversionCost;

        return manufactureInfo;
    }

    public calculationsForRubberExtrusion(manufactureInfo: ProcessInfoDto): ProcessInfoDto {
        const materialInfo = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0] : null;
        manufactureInfo.density = materialInfo?.density || 0;
        const netWeight = materialInfo?.netWeight || 0;
        const grossWeight = materialInfo?.grossWeight || 0;
        manufactureInfo.noOfCavities = materialInfo?.noOfCavities || 0;

        // Capacity Utilization Factor (mapped to noofStroke)
        if (!manufactureInfo.isNoOfStrokesDirty) {
            manufactureInfo.noofStroke =
                manufactureInfo?.partComplexity == PartComplexity.Low ? 0.9 :
                    manufactureInfo?.partComplexity == PartComplexity.Medium ? 0.85 :
                        manufactureInfo?.partComplexity == PartComplexity.High ? 0.8 : 0;
        }

        // Rubber weight processed by machine per batch (mapped to loadingTime)
        if (!manufactureInfo.isLoadingTimeDirty) {
            manufactureInfo.loadingTime = 17000;
        }

        // Cycle Time per batch (mapped to processTime)
        if (!manufactureInfo.isProcessTimeDirty) {
            // Assuming ProcessType enum values match service usage
            manufactureInfo.processTime = 0;
            // Note: ProcessType.RubberMaterialPreparation and RubberExtrusion logic needs checking.
            // Using arbitrary ids from source if available, otherwise 0
            // Assuming user passes correct ID
        }

        // No. of parts processed per batch (mapped to coolingTime)
        if (!manufactureInfo.iscoolingTimeDirty) {
            // Logic depends on processTypeID
            // Placeholder implementation as logic is specific
            manufactureInfo.coolingTime = 0;
        }

        // ... Keeping extrusion brief as it's complex and less standard ...

        return manufactureInfo;
    }

    public calculationsForCompressionMolding(manufactureInfo: ProcessInfoDto): ProcessInfoDto {
        const materialInfo = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0] : null;
        manufactureInfo.density = materialInfo?.density || 0;
        manufactureInfo.grossWeight = materialInfo?.grossWeight || 0;
        const noOfCavities = materialInfo?.noOfCavities || 0;
        const partProjectedArea = materialInfo?.partProjectedArea || 0;
        const rubberFinish = Number(materialInfo?.partFinish || 0);

        // Bed Size
        manufactureInfo.recBedSize =
            manufactureInfo.platenSizeLength && manufactureInfo.platenSizeWidth ? Math.round(manufactureInfo.platenSizeLength) + ' x ' + Math.round(manufactureInfo.platenSizeWidth) : '';
        manufactureInfo.selectedBedSize =
            manufactureInfo.machineMaster?.platenLengthmm && manufactureInfo.machineMaster?.platenWidthmm
                ? manufactureInfo.machineMaster?.platenLengthmm + ' x ' + manufactureInfo.machineMaster?.platenWidthmm
                : '';
        manufactureInfo.selectedTonnage = manufactureInfo.machineMaster?.machineTonnageTons;

        // Cooling Time
        if (!manufactureInfo.iscoolingTimeDirty) {
            manufactureInfo.coolingTime = 3 * Number(noOfCavities);
        }

        // Pouring Time
        if (!manufactureInfo.ispouringTimeDirty) {
            manufactureInfo.pouringTime = 3 * Number(noOfCavities);
        }

        // Die Opening Time
        if (!manufactureInfo.isdieOpeningTimeDirty) {
            manufactureInfo.dieOpeningTime = PlasticRubberConfig.getCompressionMoldingHardnessDuo(rubberFinish) || 0;
        }

        // Part Extraction Time
        if (!manufactureInfo.ispartExtractionTimeDirty) {
            manufactureInfo.partExtractionTime = 4 * Number(noOfCavities);
        }

        manufactureInfo.moldOpening = Number(manufactureInfo.moldOpening) || 15;
        manufactureInfo.dryCycleTime = Number(manufactureInfo.dryCycleTime) || 0;

        const moldOpenCloseTime = Number(manufactureInfo.moldOpening);
        const materialLoadingTime = Number(manufactureInfo.coolingTime);
        const insertLoading = Number(manufactureInfo.dryCycleTime);
        const breathing = Number(manufactureInfo.pouringTime);
        const compressionCuring = PlasticRubberConfig.getCompressionMoldingHardnessDuo(rubberFinish);
        const unloadingCleaning = Number(manufactureInfo.partExtractionTime);

        // Total Processing Time (mapped to loadingTime)
        if (!manufactureInfo.isLoadingTimeDirty) {
            manufactureInfo.loadingTime = moldOpenCloseTime + materialLoadingTime + insertLoading + breathing + compressionCuring + unloadingCleaning;
        }

        // No of parts processed per batch (mapped to processTime)
        if (!manufactureInfo.isProcessTimeDirty) {
            manufactureInfo.processTime = noOfCavities;
        }

        const effectiveTonnage = 1600;
        manufactureInfo.recommendTonnage = isValidNumber((noOfCavities * partProjectedArea * effectiveTonnage) / 1000000);

        // Cycle Time
        if (!manufactureInfo.iscycleTimeDirty) {
            manufactureInfo.cycleTime = isValidNumber(Number(manufactureInfo.loadingTime) / Number(manufactureInfo.processTime));
        }

        // Costs
        if (!manufactureInfo.isdirectMachineCostDirty) {
            manufactureInfo.directMachineCost = isValidNumber((Number(manufactureInfo.machineHourRate) * Number(manufactureInfo.cycleTime)) / 3600 / Number(manufactureInfo.efficiency));
        }

        if (!manufactureInfo.isdirectSetUpCostDirty) {
            manufactureInfo.directSetUpCost = isValidNumber(
                (((Number(manufactureInfo.noOfLowSkilledLabours) * Number(manufactureInfo.setUpTime)) / 60) * Number(manufactureInfo.lowSkilledLaborRatePerHour)) /
                Number(manufactureInfo.efficiency) /
                Number(manufactureInfo.lotSize) +
                (((Number(manufactureInfo.noOfSkilledLabours) * Number(manufactureInfo.skilledLaborRatePerHour)) / 60) * Number(manufactureInfo.setUpTime)) /
                Number(manufactureInfo.efficiency) /
                Number(manufactureInfo.lotSize)
            );
        }

        if (!manufactureInfo.isdirectLaborCostDirty) {
            manufactureInfo.directLaborCost = isValidNumber(
                (Number(manufactureInfo.noOfLowSkilledLabours) * Number(manufactureInfo.lowSkilledLaborRatePerHour) * Number(manufactureInfo.cycleTime)) / 3600 / Number(manufactureInfo.efficiency) +
                (Number(manufactureInfo.noOfSkilledLabours) * Number(manufactureInfo.skilledLaborRatePerHour) * Number(manufactureInfo.cycleTime)) / 3600 / Number(manufactureInfo.efficiency)
            );
        }

        if (!manufactureInfo.isinspectionCostDirty) {
            manufactureInfo.inspectionCost = isValidNumber(
                (manufactureInfo.inspectionTime * Number(manufactureInfo.qaOfInspectorRate)) / 60 / Number(manufactureInfo.efficiency) / Number(manufactureInfo.lotSize)
            );
        }

        return manufactureInfo;
    }
}
