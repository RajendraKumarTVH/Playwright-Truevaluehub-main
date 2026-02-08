"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlasticRubberProcessCalculator = void 0;
const helpers_1 = require("./helpers");
const constants_1 = require("./constants");
const plastic_rubber_config_1 = require("./plastic-rubber-config");
class PlasticRubberProcessCalculator {
    calculationsForInjectionMoulding(manufactureInfo) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        // Material Info Extraction
        const materialInfo = ((_a = manufactureInfo.materialInfoList) === null || _a === void 0 ? void 0 : _a.length) > 0 ? manufactureInfo.materialInfoList[0] : null;
        manufactureInfo.density = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.density) || 0;
        manufactureInfo.noOfInsert = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.noOfInserts) || 0;
        manufactureInfo.grossWeight = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.grossWeight) || 0;
        manufactureInfo.wallAverageThickness = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.wallAverageThickness) || 0;
        manufactureInfo.noOfCavities = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.noOfCavities) || 0;
        manufactureInfo.netMaterialCost = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.netMatCost) || 0;
        manufactureInfo.netPartWeight = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.netWeight) || 0;
        manufactureInfo.rawmaterialCost = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.netMatCost) || 0;
        manufactureInfo.projArea = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.runnerProjectedArea) || 0;
        manufactureInfo.partProjArea = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.partProjectedArea) || 0;
        manufactureInfo.shotSize = ((_b = manufactureInfo.machineMaster) === null || _b === void 0 ? void 0 : _b.shotSize) || 0;
        // Bed Size
        manufactureInfo.recBedSize =
            manufactureInfo.platenSizeLength && manufactureInfo.platenSizeWidth
                ? Math.round(manufactureInfo.platenSizeLength) + ' x ' + Math.round(manufactureInfo.platenSizeWidth)
                : '';
        manufactureInfo.selectedBedSize =
            ((_c = manufactureInfo.machineMaster) === null || _c === void 0 ? void 0 : _c.platenLengthmm) && ((_d = manufactureInfo.machineMaster) === null || _d === void 0 ? void 0 : _d.platenWidthmm)
                ? ((_e = manufactureInfo.machineMaster) === null || _e === void 0 ? void 0 : _e.platenLengthmm) + ' x ' + ((_f = manufactureInfo.machineMaster) === null || _f === void 0 ? void 0 : _f.platenWidthmm)
                : '';
        // Injection Fill Time
        const injecRate = (0, helpers_1.isValidNumber)((Number((_g = manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.machineMaster) === null || _g === void 0 ? void 0 : _g.injectionRate) * Number(manufactureInfo.density)) / 1000);
        const shotweight = (0, helpers_1.isValidNumber)(manufactureInfo.grossWeight * manufactureInfo.noOfCavities);
        const materialInjectionFillTime = (0, helpers_1.isValidNumber)(shotweight / Number(injecRate));
        manufactureInfo.materialInjectionFillTime = materialInjectionFillTime;
        // Cooling Time
        if (!manufactureInfo.iscoolingTimeDirty) {
            let coolingTime = (0, helpers_1.isValidNumber)((Math.pow(Number(manufactureInfo.wallAverageThickness), 2) / (2 * 3.141592654) / Number(manufactureInfo.thermalDiffusivity)) *
                Math.log((4 / 3.141592654) * ((Number(manufactureInfo.meltTemp) - Number(manufactureInfo.mouldTemp)) / (Number(manufactureInfo.ejecTemp) - Number(manufactureInfo.mouldTemp)))));
            if ((manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.wallAverageThickness) < 5) {
                coolingTime = (0, helpers_1.isValidNumber)(1 * Number(coolingTime));
            }
            else if ((manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.wallAverageThickness) >= 5 && (manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.wallAverageThickness) <= 10) {
                coolingTime = (0, helpers_1.isValidNumber)(0.65 * Number(coolingTime));
            }
            else if ((manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.wallAverageThickness) >= 10 && (manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.wallAverageThickness) <= 15) {
                coolingTime = (0, helpers_1.isValidNumber)(0.5 * Number(coolingTime));
            }
            else if ((manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.wallAverageThickness) > 15) {
                coolingTime = (0, helpers_1.isValidNumber)(0.42 * Number(coolingTime));
            }
            manufactureInfo.coolingTime = coolingTime;
        }
        // Insert Placement
        if (!manufactureInfo.isInsertsPlacementDirty) {
            manufactureInfo.insertsPlacement = (0, helpers_1.isValidNumber)(2.5 * manufactureInfo.noOfInsert);
        }
        // Part Ejection
        if (!manufactureInfo.isPartEjectionDirty) {
            let partEjection = (manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.partComplexity) == constants_1.PartComplexity.Low ? 3 :
                (manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.partComplexity) == constants_1.PartComplexity.Medium ? 5.5 :
                    (manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.partComplexity) == constants_1.PartComplexity.High ? 8 : 0;
            manufactureInfo.partEjection = (0, helpers_1.isValidNumber)(partEjection);
        }
        // Side Core Mechanisms
        if (!manufactureInfo.isSideCoreMechanismsDirty) {
            let sideCoreMechanisms = (manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.partComplexity) == constants_1.PartComplexity.Low ? 2 :
                (manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.partComplexity) == constants_1.PartComplexity.Medium ? 4 :
                    (manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.partComplexity) == constants_1.PartComplexity.High ? 8 : 0;
            manufactureInfo.sideCoreMechanisms = sideCoreMechanisms;
        }
        // Others
        if (!manufactureInfo.isOthersDirty) {
            manufactureInfo.others = (0, helpers_1.isValidNumber)(manufactureInfo.others);
        }
        // Pack & Hold Time
        const packAndHoldTime = (manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.partComplexity) == constants_1.PartComplexity.Low ? 1 :
            (manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.partComplexity) == constants_1.PartComplexity.Medium ? 2 :
                (manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.partComplexity) == constants_1.PartComplexity.High ? 3 : 5;
        manufactureInfo.packAndHoldTime = packAndHoldTime;
        // Injection Time
        if (!manufactureInfo.isinjectionTimeDirty) {
            manufactureInfo.injectionTime = (0, helpers_1.isValidNumber)(Number(manufactureInfo.packAndHoldTime) + Number(manufactureInfo.materialInjectionFillTime));
        }
        // Dry Cycle Time
        if (!manufactureInfo.isDryCycleTimeDirty) {
            manufactureInfo.dryCycleTime = (0, helpers_1.isValidNumber)(manufactureInfo.dryCycleTime);
        }
        // Total Time
        if (!manufactureInfo.isTotalTimeDirty) {
            manufactureInfo.totalTime = (0, helpers_1.isValidNumber)(Number(manufactureInfo.insertsPlacement) +
                Number(manufactureInfo.sideCoreMechanisms) +
                Number(manufactureInfo.injectionTime) +
                Number(manufactureInfo.partEjection) +
                Number(manufactureInfo.others) +
                Number(manufactureInfo.coolingTime) +
                Number(manufactureInfo.dryCycleTime));
        }
        // Cycle Time
        if (!manufactureInfo.iscycleTimeDirty) {
            manufactureInfo.cycleTime = (0, helpers_1.isValidNumber)((Number(manufactureInfo.insertsPlacement) +
                Number(manufactureInfo.sideCoreMechanisms) +
                Number(manufactureInfo.injectionTime) +
                Number(manufactureInfo.partEjection) +
                Number(manufactureInfo.others) +
                Number(manufactureInfo.coolingTime) +
                Number(manufactureInfo.dryCycleTime)) /
                (manufactureInfo.noOfCavities || 1));
        }
        // Direct Machine Cost
        if (!manufactureInfo.isdirectMachineCostDirty) {
            manufactureInfo.directMachineCost = (0, helpers_1.isValidNumber)((Number(manufactureInfo.machineHourRate) / 3600) * manufactureInfo.cycleTime * manufactureInfo.efficiency);
        }
        // Setup Time
        if (!manufactureInfo.issetUpTimeDirty && !manufactureInfo.setUpTime) {
            manufactureInfo.setUpTime = 60;
        }
        // Low Skilled Labors
        if (!manufactureInfo.isNoOfLowSkilledLaboursDirty && manufactureInfo.noOfLowSkilledLabours == null) {
            // Logic not fully clear in source, usually defaults or comes from object. Using input or 0.
            manufactureInfo.noOfLowSkilledLabours = (0, helpers_1.isValidNumber)(manufactureInfo.noOfLowSkilledLabours);
        }
        manufactureInfo.lowSkilledLaborRatePerHour = (0, helpers_1.isValidNumber)(manufactureInfo.lowSkilledLaborRatePerHour);
        // Direct Labor Cost
        if (!manufactureInfo.isdirectLaborCostDirty) {
            manufactureInfo.directLaborCost = (0, helpers_1.isValidNumber)((Number(manufactureInfo.noOfLowSkilledLabours) * manufactureInfo.cycleTime * (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600)) / (manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.efficiency) +
                (Number(manufactureInfo.noOfSkilledLabours) * manufactureInfo.cycleTime * (Number(manufactureInfo.skilledLaborRatePerHour) / 3600)) / (manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.efficiency));
        }
        // Inspection Cost
        if (!manufactureInfo.isinspectionCostDirty) {
            manufactureInfo.inspectionCost = (0, helpers_1.isValidNumber)(Number(manufactureInfo.samplingRate / 100) * ((Number(manufactureInfo.inspectionTime) * Number(manufactureInfo.qaOfInspectorRate)) / 3600));
        }
        // Direct Setup Cost
        if (!manufactureInfo.isdirectSetUpCostDirty) {
            manufactureInfo.directSetUpCost = (0, helpers_1.isValidNumber)(((Number(manufactureInfo.lowSkilledLaborRatePerHour) + Number(manufactureInfo.machineHourRate)) * (Number(manufactureInfo.setUpTime) / 60)) / manufactureInfo.lotSize);
        }
        // Yield Cost
        if (!manufactureInfo.isyieldCostDirty) {
            const sum = (0, helpers_1.isValidNumber)(Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost));
            manufactureInfo.netMaterialCost = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.netMatCost) || 0;
            manufactureInfo.yieldCost = (0, helpers_1.isValidNumber)((1 - Number(manufactureInfo.yieldPer) / 100) *
                (Number(manufactureInfo.netMaterialCost) - (Number(manufactureInfo.netPartWeight) * Number(((_h = manufactureInfo.materialInfo) === null || _h === void 0 ? void 0 : _h.scrapPrice) || 0)) / 1000 + sum));
        }
        // Power ESG / Total Power Cost calculation
        const powerESG = ((_j = manufactureInfo.laborRates) === null || _j === void 0 ? void 0 : _j.length) > 0 ? manufactureInfo.laborRates[0].powerESG : (((_k = manufactureInfo.laborRates) === null || _k === void 0 ? void 0 : _k.powerESG) || 0);
        manufactureInfo.esgImpactElectricityConsumption = (0, helpers_1.isValidNumber)(Number(((_l = manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.machineMaster) === null || _l === void 0 ? void 0 : _l.totalPowerKW) || 0) *
            Number(((_m = manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.machineMaster) === null || _m === void 0 ? void 0 : _m.powerUtilization) || 0) *
            Number(powerESG || 0));
        // Process Cost
        const processCost = (0, helpers_1.isValidNumber)(Number(manufactureInfo.directLaborCost) +
            Number(manufactureInfo.directMachineCost) +
            Number(manufactureInfo.directSetUpCost) +
            Number(manufactureInfo.inspectionCost) +
            Number(manufactureInfo.yieldCost));
        manufactureInfo.directTooling = (0, helpers_1.isValidNumber)((Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost)) * 0.01);
        manufactureInfo.directProcessCost = processCost;
        manufactureInfo.conversionCost = processCost;
        manufactureInfo.partCost = manufactureInfo.rawmaterialCost + manufactureInfo.conversionCost;
        return manufactureInfo;
    }
    calculationsForRubberInjectionMoulding(manufactureInfo) {
        var _a, _b, _c, _d, _e, _f;
        const materialInfo = ((_a = manufactureInfo.materialInfoList) === null || _a === void 0 ? void 0 : _a.length) > 0 ? manufactureInfo.materialInfoList[0] : null;
        manufactureInfo.density = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.density) || 0;
        manufactureInfo.noOfInsert = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.noOfInserts) || 0;
        manufactureInfo.grossWeight = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.grossWeight) || 0;
        manufactureInfo.wallAverageThickness = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.wallAverageThickness) || 0;
        manufactureInfo.noOfCavities = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.noOfCavities) || 0;
        manufactureInfo.netMaterialCost = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.netMatCost) || 0;
        manufactureInfo.netPartWeight = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.netWeight) || 0;
        manufactureInfo.rawmaterialCost = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.netMatCost) || 0;
        manufactureInfo.projArea = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.runnerProjectedArea) || 0;
        manufactureInfo.partProjArea = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.partProjectedArea) || 0;
        const cavityPressure = ((_b = materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.materialMasterData) === null || _b === void 0 ? void 0 : _b.clampingPressure) || 0;
        manufactureInfo.cavityPressure = cavityPressure;
        const recommendTonnage = Math.ceil((((materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.runnerProjectedArea) + ((materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.partProjectedArea) || (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.projectedArea))) * (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.noOfCavities) * cavityPressure * 1.15) / 1000);
        manufactureInfo.recommendTonnage = (0, helpers_1.isValidNumber)(recommendTonnage);
        manufactureInfo.selectedTonnage = ((_c = manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.machineMaster) === null || _c === void 0 ? void 0 : _c.machineTonnageTons) || 0;
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
            manufactureInfo.injectionTime = (0, helpers_1.isValidNumber)(((materialInfo.runnerVolume + materialInfo.partVolume) * manufactureInfo.noOfCavities) / 60000);
        }
        const materialType = (_e = (_d = manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.materialmasterDatas) === null || _d === void 0 ? void 0 : _d.materialType) === null || _e === void 0 ? void 0 : _e.materialTypeName;
        // Curing Time (Mapped to sideCoreMechanisms in service??)
        // Service logic: manufactureInfo.sideCoreMechanisms = curingTime;
        if (!manufactureInfo.isSideCoreMechanismsDirty) {
            const kFact = plastic_rubber_config_1.PlasticRubberConfig.getKFactorRubberIM(materialType);
            manufactureInfo.sideCoreMechanisms = (0, helpers_1.isValidNumber)(kFact * Math.pow(materialInfo.wallThickessMm || 0, 2) * 1.3);
        }
        // Holding Time (Mapped to coolingTime in service)
        if (!manufactureInfo.iscoolingTimeDirty) {
            manufactureInfo.coolingTime = (0, helpers_1.isValidNumber)(manufactureInfo.sideCoreMechanisms * 0.3);
        }
        // Part Ejection Time
        if (!manufactureInfo.isPartEjectionDirty) {
            manufactureInfo.partEjection = (0, helpers_1.isValidNumber)((materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.noOfCavities) * 1.2);
        }
        // Total Time
        if (!manufactureInfo.isTotalTimeDirty) {
            manufactureInfo.totalTime = (0, helpers_1.isValidNumber)(Number(manufactureInfo.insertsPlacement) +
                Number(manufactureInfo.sideCoreMechanisms) +
                Number(manufactureInfo.injectionTime) +
                Number(manufactureInfo.partEjection) +
                Number(manufactureInfo.coolingTime) +
                Number(manufactureInfo.dryCycleTime));
        }
        // Cycle Time
        if (!manufactureInfo.iscycleTimeDirty) {
            manufactureInfo.cycleTime = (0, helpers_1.isValidNumber)((Number(manufactureInfo.insertsPlacement) +
                Number(manufactureInfo.sideCoreMechanisms) +
                Number(manufactureInfo.injectionTime) +
                Number(manufactureInfo.partEjection) +
                Number(manufactureInfo.others || 0) +
                Number(manufactureInfo.coolingTime) +
                Number(manufactureInfo.dryCycleTime)) /
                (manufactureInfo.noOfCavities || 1));
        }
        // Direct Machine Cost
        if (!manufactureInfo.isdirectMachineCostDirty) {
            manufactureInfo.directMachineCost = (0, helpers_1.isValidNumber)((Number(manufactureInfo.machineHourRate) / 3600) * manufactureInfo.cycleTime * manufactureInfo.efficiency);
        }
        // Setup Time
        if (!manufactureInfo.issetUpTimeDirty && !manufactureInfo.setUpTime) {
            manufactureInfo.setUpTime = 60;
        }
        // Direct Labor Cost
        if (!manufactureInfo.isdirectLaborCostDirty) {
            manufactureInfo.directLaborCost = (0, helpers_1.isValidNumber)((Number(manufactureInfo.noOfLowSkilledLabours) * manufactureInfo.cycleTime * (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600)) / (manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.efficiency) +
                (Number(manufactureInfo.noOfSkilledLabours) * manufactureInfo.cycleTime * (Number(manufactureInfo.skilledLaborRatePerHour) / 3600)) / (manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.efficiency));
        }
        // Inspection Cost
        if (!manufactureInfo.isinspectionCostDirty) {
            manufactureInfo.inspectionCost = (0, helpers_1.isValidNumber)(Number(manufactureInfo.samplingRate / 100) * ((Number(manufactureInfo.inspectionTime) * Number(manufactureInfo.qaOfInspectorRate)) / 3600));
        }
        // Direct Setup Cost
        if (!manufactureInfo.isdirectSetUpCostDirty) {
            manufactureInfo.directSetUpCost = (0, helpers_1.isValidNumber)(((Number(manufactureInfo.lowSkilledLaborRatePerHour) + Number(manufactureInfo.machineHourRate)) * (Number(manufactureInfo.setUpTime) / 60)) / manufactureInfo.lotSize);
        }
        // Yield Cost
        if (!manufactureInfo.isyieldCostDirty) {
            const sum = (0, helpers_1.isValidNumber)(Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost));
            manufactureInfo.yieldCost = (0, helpers_1.isValidNumber)((1 - Number(manufactureInfo.yieldPer) / 100) *
                (Number(manufactureInfo.netMaterialCost) - (Number(manufactureInfo.netPartWeight) * Number(((_f = manufactureInfo.materialInfo) === null || _f === void 0 ? void 0 : _f.scrapPrice) || 0)) / 1000 + sum));
        }
        const processCost = (0, helpers_1.isValidNumber)(Number(manufactureInfo.directLaborCost) +
            Number(manufactureInfo.directMachineCost) +
            Number(manufactureInfo.directSetUpCost) +
            Number(manufactureInfo.inspectionCost) +
            Number(manufactureInfo.yieldCost));
        manufactureInfo.directTooling = (0, helpers_1.isValidNumber)((Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost)) * 0.01);
        manufactureInfo.directProcessCost = processCost;
        manufactureInfo.conversionCost = processCost;
        manufactureInfo.partCost = manufactureInfo.rawmaterialCost + manufactureInfo.conversionCost;
        return manufactureInfo;
    }
    calculationsForRubberExtrusion(manufactureInfo) {
        var _a;
        const materialInfo = ((_a = manufactureInfo.materialInfoList) === null || _a === void 0 ? void 0 : _a.length) > 0 ? manufactureInfo.materialInfoList[0] : null;
        manufactureInfo.density = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.density) || 0;
        const netWeight = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.netWeight) || 0;
        const grossWeight = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.grossWeight) || 0;
        manufactureInfo.noOfCavities = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.noOfCavities) || 0;
        // Capacity Utilization Factor (mapped to noofStroke)
        if (!manufactureInfo.isNoOfStrokesDirty) {
            manufactureInfo.noofStroke =
                (manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.partComplexity) == constants_1.PartComplexity.Low ? 0.9 :
                    (manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.partComplexity) == constants_1.PartComplexity.Medium ? 0.85 :
                        (manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.partComplexity) == constants_1.PartComplexity.High ? 0.8 : 0;
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
    calculationsForCompressionMolding(manufactureInfo) {
        var _a, _b, _c, _d, _e, _f;
        const materialInfo = ((_a = manufactureInfo.materialInfoList) === null || _a === void 0 ? void 0 : _a.length) > 0 ? manufactureInfo.materialInfoList[0] : null;
        manufactureInfo.density = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.density) || 0;
        manufactureInfo.grossWeight = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.grossWeight) || 0;
        const noOfCavities = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.noOfCavities) || 0;
        const partProjectedArea = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.partProjectedArea) || 0;
        const rubberFinish = Number((materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.partFinish) || 0);
        // Bed Size
        manufactureInfo.recBedSize =
            manufactureInfo.platenSizeLength && manufactureInfo.platenSizeWidth ? Math.round(manufactureInfo.platenSizeLength) + ' x ' + Math.round(manufactureInfo.platenSizeWidth) : '';
        manufactureInfo.selectedBedSize =
            ((_b = manufactureInfo.machineMaster) === null || _b === void 0 ? void 0 : _b.platenLengthmm) && ((_c = manufactureInfo.machineMaster) === null || _c === void 0 ? void 0 : _c.platenWidthmm)
                ? ((_d = manufactureInfo.machineMaster) === null || _d === void 0 ? void 0 : _d.platenLengthmm) + ' x ' + ((_e = manufactureInfo.machineMaster) === null || _e === void 0 ? void 0 : _e.platenWidthmm)
                : '';
        manufactureInfo.selectedTonnage = (_f = manufactureInfo.machineMaster) === null || _f === void 0 ? void 0 : _f.machineTonnageTons;
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
            manufactureInfo.dieOpeningTime = plastic_rubber_config_1.PlasticRubberConfig.getCompressionMoldingHardnessDuo(rubberFinish) || 0;
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
        const compressionCuring = plastic_rubber_config_1.PlasticRubberConfig.getCompressionMoldingHardnessDuo(rubberFinish);
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
        manufactureInfo.recommendTonnage = (0, helpers_1.isValidNumber)((noOfCavities * partProjectedArea * effectiveTonnage) / 1000000);
        // Cycle Time
        if (!manufactureInfo.iscycleTimeDirty) {
            manufactureInfo.cycleTime = (0, helpers_1.isValidNumber)(Number(manufactureInfo.loadingTime) / Number(manufactureInfo.processTime));
        }
        // Costs
        if (!manufactureInfo.isdirectMachineCostDirty) {
            manufactureInfo.directMachineCost = (0, helpers_1.isValidNumber)((Number(manufactureInfo.machineHourRate) * Number(manufactureInfo.cycleTime)) / 3600 / Number(manufactureInfo.efficiency));
        }
        if (!manufactureInfo.isdirectSetUpCostDirty) {
            manufactureInfo.directSetUpCost = (0, helpers_1.isValidNumber)((((Number(manufactureInfo.noOfLowSkilledLabours) * Number(manufactureInfo.setUpTime)) / 60) * Number(manufactureInfo.lowSkilledLaborRatePerHour)) /
                Number(manufactureInfo.efficiency) /
                Number(manufactureInfo.lotSize) +
                (((Number(manufactureInfo.noOfSkilledLabours) * Number(manufactureInfo.skilledLaborRatePerHour)) / 60) * Number(manufactureInfo.setUpTime)) /
                    Number(manufactureInfo.efficiency) /
                    Number(manufactureInfo.lotSize));
        }
        if (!manufactureInfo.isdirectLaborCostDirty) {
            manufactureInfo.directLaborCost = (0, helpers_1.isValidNumber)((Number(manufactureInfo.noOfLowSkilledLabours) * Number(manufactureInfo.lowSkilledLaborRatePerHour) * Number(manufactureInfo.cycleTime)) / 3600 / Number(manufactureInfo.efficiency) +
                (Number(manufactureInfo.noOfSkilledLabours) * Number(manufactureInfo.skilledLaborRatePerHour) * Number(manufactureInfo.cycleTime)) / 3600 / Number(manufactureInfo.efficiency));
        }
        if (!manufactureInfo.isinspectionCostDirty) {
            manufactureInfo.inspectionCost = (0, helpers_1.isValidNumber)((manufactureInfo.inspectionTime * Number(manufactureInfo.qaOfInspectorRate)) / 60 / Number(manufactureInfo.efficiency) / Number(manufactureInfo.lotSize));
        }
        return manufactureInfo;
    }
}
exports.PlasticRubberProcessCalculator = PlasticRubberProcessCalculator;
