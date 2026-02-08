"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolingCalculator = exports.ToolingMaterialIM = void 0;
const helpers_1 = require("./helpers");
var ToolingMaterialIM;
(function (ToolingMaterialIM) {
    ToolingMaterialIM[ToolingMaterialIM["CavityInsert"] = 1] = "CavityInsert";
    ToolingMaterialIM[ToolingMaterialIM["CoreInsert"] = 2] = "CoreInsert";
    ToolingMaterialIM[ToolingMaterialIM["CavityHoldingPlate"] = 3] = "CavityHoldingPlate";
    ToolingMaterialIM[ToolingMaterialIM["CoreHoldingPlate"] = 4] = "CoreHoldingPlate";
    ToolingMaterialIM[ToolingMaterialIM["CoreBackPlate"] = 5] = "CoreBackPlate";
    ToolingMaterialIM[ToolingMaterialIM["EjectorPlate"] = 6] = "EjectorPlate";
    ToolingMaterialIM[ToolingMaterialIM["EjectorReturnerPlate"] = 7] = "EjectorReturnerPlate";
    ToolingMaterialIM[ToolingMaterialIM["CavitySideClampingPlate"] = 8] = "CavitySideClampingPlate";
    ToolingMaterialIM[ToolingMaterialIM["CoreSideClampingPlate"] = 9] = "CoreSideClampingPlate";
    ToolingMaterialIM[ToolingMaterialIM["ParallelBlock"] = 10] = "ParallelBlock";
    ToolingMaterialIM[ToolingMaterialIM["ManifoldPlate"] = 11] = "ManifoldPlate";
    ToolingMaterialIM[ToolingMaterialIM["HotRunnerCost"] = 13] = "HotRunnerCost";
    ToolingMaterialIM[ToolingMaterialIM["SideCoreCost"] = 14] = "SideCoreCost";
    ToolingMaterialIM[ToolingMaterialIM["AngularCoreCost"] = 15] = "AngularCoreCost";
    ToolingMaterialIM[ToolingMaterialIM["UnscrewingCost"] = 16] = "UnscrewingCost";
    ToolingMaterialIM[ToolingMaterialIM["ElectrodeMaterialcost1"] = 17] = "ElectrodeMaterialcost1";
    ToolingMaterialIM[ToolingMaterialIM["ElectrodeMaterialcost2"] = 18] = "ElectrodeMaterialcost2";
})(ToolingMaterialIM || (exports.ToolingMaterialIM = ToolingMaterialIM = {}));
class ToolingCalculator {
    calculateMoldDimensions(tool, materialInfos) {
        const cavityHoldingPlate = materialInfos.find(x => x.moldDescriptionId === ToolingMaterialIM.CavityHoldingPlate);
        const coreHoldingPlate = materialInfos.find(x => x.moldDescriptionId === ToolingMaterialIM.CoreHoldingPlate);
        const coreBackPlate = materialInfos.find(x => x.moldDescriptionId === ToolingMaterialIM.CoreBackPlate);
        const ejectorPlate = materialInfos.find(x => x.moldDescriptionId === ToolingMaterialIM.EjectorPlate);
        const ejectorReturnerPlate = materialInfos.find(x => x.moldDescriptionId === ToolingMaterialIM.EjectorReturnerPlate);
        const cavitySideClampingPlate = materialInfos.find(x => x.moldDescriptionId === ToolingMaterialIM.CavitySideClampingPlate);
        const coreSideClampingPlate = materialInfos.find(x => x.moldDescriptionId === ToolingMaterialIM.CoreSideClampingPlate);
        const parallelBlock = materialInfos.find(x => x.moldDescriptionId === ToolingMaterialIM.ParallelBlock);
        const manifold = materialInfos.find(x => x.moldDescriptionId === ToolingMaterialIM.ManifoldPlate);
        const cavityInsert = materialInfos.find(x => x.moldDescriptionId === ToolingMaterialIM.CavityInsert);
        if (cavityInsert) {
            tool.moldBaseLength = (0, helpers_1.isValidNumber)(Number(cavityInsert.length) * Number(tool.cavityMaxLength) + Number(tool.sideGapLength) * 2);
            tool.moldBaseWidth = (0, helpers_1.isValidNumber)(Number(cavityInsert.width) * Number(tool.cavityMaxWidth) + Number(tool.sideGapWidth) * 2);
        }
        tool.moldBaseHeight = (0, helpers_1.isValidNumber)(((cavityHoldingPlate === null || cavityHoldingPlate === void 0 ? void 0 : cavityHoldingPlate.height) || 0) +
            ((coreHoldingPlate === null || coreHoldingPlate === void 0 ? void 0 : coreHoldingPlate.height) || 0) +
            ((coreBackPlate === null || coreBackPlate === void 0 ? void 0 : coreBackPlate.height) || 0) +
            ((cavitySideClampingPlate === null || cavitySideClampingPlate === void 0 ? void 0 : cavitySideClampingPlate.height) || 0) +
            ((coreSideClampingPlate === null || coreSideClampingPlate === void 0 ? void 0 : coreSideClampingPlate.height) || 0) +
            ((parallelBlock === null || parallelBlock === void 0 ? void 0 : parallelBlock.height) || 0) +
            ((manifold === null || manifold === void 0 ? void 0 : manifold.height) || 0) +
            ((ejectorPlate === null || ejectorPlate === void 0 ? void 0 : ejectorPlate.height) || 0) +
            ((ejectorReturnerPlate === null || ejectorReturnerPlate === void 0 ? void 0 : ejectorReturnerPlate.height) || 0));
        tool.noOfSubsequentTool = (0, helpers_1.isValidNumber)(Number(tool.noOfTool) - Number(tool.noOfNewTool));
        return tool;
    }
    calculateCommonTooling(matInfo, tool) {
        // Set dimensions from moldBase values if not dirty (Playwright treats all as non-dirty usually unless specified)
        matInfo.length = matInfo.moldBaseLength || matInfo.length;
        matInfo.width = matInfo.moldBaseWidth || matInfo.width;
        matInfo.height = matInfo.moldBaseHeight || matInfo.height;
        // Quantity Logic
        if (matInfo.moldDescriptionId === ToolingMaterialIM.CavityInsert || matInfo.moldDescriptionId === ToolingMaterialIM.CoreInsert) {
            matInfo.quantity = Number(tool.noOfCavity);
        }
        else if (matInfo.moldDescriptionId === ToolingMaterialIM.ParallelBlock) {
            matInfo.quantity = 2;
        }
        else if (matInfo.moldDescriptionId === ToolingMaterialIM.ElectrodeMaterialcost1) {
            matInfo.quantity = Number(tool.noOfCopperElectrodes);
        }
        else if (matInfo.moldDescriptionId === ToolingMaterialIM.ElectrodeMaterialcost2) {
            matInfo.quantity = Number(tool.noOfGraphiteElectrodes);
        }
        else {
            matInfo.quantity = 1;
        }
        // Net Weight
        matInfo.netWeight = (0, helpers_1.isValidNumber)(Number(matInfo.length) * Number(matInfo.width) * Number(matInfo.height) * Number(matInfo.density) * Number(matInfo.quantity) * Math.pow(10, -6));
        // Total Plate Weight
        if (matInfo.moldDescriptionId === ToolingMaterialIM.ElectrodeMaterialcost1 || matInfo.moldDescriptionId === ToolingMaterialIM.ElectrodeMaterialcost2) {
            matInfo.totalPlateWeight = (0, helpers_1.isValidNumber)(((Number(matInfo.length) * Number(matInfo.width) * Number(matInfo.height) * Number(matInfo.density)) / 1000000) * Number(matInfo.quantity));
        }
        else {
            matInfo.totalPlateWeight = (0, helpers_1.isValidNumber)(Number(matInfo.netWeight) * (1 + (matInfo.materialCuttingAllowance / 100)));
        }
        // Raw Material Cost
        matInfo.totalRawMaterialCost = (0, helpers_1.isValidNumber)(Number(matInfo.totalPlateWeight) * Number(matInfo.materialPrice));
    }
    calculateMaterialCost(matInfo, tool, materialInfos) {
        switch (matInfo.moldDescriptionId) {
            case ToolingMaterialIM.CavityInsert:
                matInfo.moldBaseLength = Number(tool.envelopLength) + Number(tool.runnerGapLength) * 2;
                matInfo.moldBaseWidth = Number(tool.envelopWidth) + Number(tool.runnerGapWidth) * 2;
                matInfo.moldBaseHeight = Number(tool.envelopHeight) + 40;
                break;
            case ToolingMaterialIM.CoreInsert:
                const cavInsert = materialInfos.find(x => x.moldDescriptionId === ToolingMaterialIM.CavityInsert);
                matInfo.moldBaseLength = (cavInsert === null || cavInsert === void 0 ? void 0 : cavInsert.length) || Number(tool.envelopLength) + Number(tool.runnerGapLength) * 2;
                matInfo.moldBaseWidth = (cavInsert === null || cavInsert === void 0 ? void 0 : cavInsert.width) || Number(tool.envelopWidth) + Number(tool.runnerGapWidth) * 2;
                matInfo.moldBaseHeight = ((cavInsert === null || cavInsert === void 0 ? void 0 : cavInsert.height) || Number(tool.envelopHeight) + 40) + 20;
                break;
            case ToolingMaterialIM.CavityHoldingPlate:
                const cavIns = materialInfos.find(x => x.moldDescriptionId === ToolingMaterialIM.CavityInsert);
                matInfo.moldBaseLength = cavIns ? (0, helpers_1.isValidNumber)(Number(cavIns.length) * Number(tool.cavityMaxLength) + Number(tool.sideGapLength) * 2) : tool.envelopLength;
                matInfo.moldBaseWidth = cavIns ? (0, helpers_1.isValidNumber)(Number(cavIns.width) * Number(tool.cavityMaxWidth) + Number(tool.sideGapWidth) * 2) : (Number(tool.envelopWidth) + Number(tool.runnerGapWidth) * 2) * tool.cavityMaxWidth + Number(tool.sideGapWidth) * 2;
                matInfo.moldBaseHeight = ((cavIns === null || cavIns === void 0 ? void 0 : cavIns.height) || tool.envelopHeight) + 40;
                break;
            case ToolingMaterialIM.CoreHoldingPlate:
                const cavHold = materialInfos.find(x => x.moldDescriptionId === ToolingMaterialIM.CavityHoldingPlate);
                matInfo.moldBaseLength = (cavHold === null || cavHold === void 0 ? void 0 : cavHold.length) || Number(tool.envelopLength);
                matInfo.moldBaseWidth = (cavHold === null || cavHold === void 0 ? void 0 : cavHold.width) || (Number(tool.envelopWidth) + Number(tool.runnerGapWidth) * 2) * tool.cavityMaxWidth + Number(tool.sideGapWidth) * 2;
                matInfo.moldBaseHeight = ((cavHold === null || cavHold === void 0 ? void 0 : cavHold.height) || Number(tool.envelopHeight)) + 20;
                break;
            case ToolingMaterialIM.CoreBackPlate:
                const coreHold = materialInfos.find(x => x.moldDescriptionId === ToolingMaterialIM.CoreHoldingPlate);
                matInfo.moldBaseLength = (coreHold === null || coreHold === void 0 ? void 0 : coreHold.length) || Number(tool.envelopLength);
                matInfo.moldBaseWidth = (coreHold === null || coreHold === void 0 ? void 0 : coreHold.width) || Number(tool.envelopWidth);
                matInfo.moldBaseHeight = 50;
                break;
            case ToolingMaterialIM.CavitySideClampingPlate:
                const cavHolding = materialInfos.find(x => x.moldDescriptionId === ToolingMaterialIM.CavityHoldingPlate);
                matInfo.moldBaseLength = (cavHolding === null || cavHolding === void 0 ? void 0 : cavHolding.length) || Number(tool.envelopLength);
                matInfo.moldBaseWidth = cavHolding ? Number(cavHolding.width) + 30 * 2 : Number(tool.envelopWidth);
                matInfo.moldBaseHeight = 40;
                break;
            case ToolingMaterialIM.CoreSideClampingPlate:
                const cavClamp = materialInfos.find(x => x.moldDescriptionId === ToolingMaterialIM.CavitySideClampingPlate);
                matInfo.moldBaseLength = (cavClamp === null || cavClamp === void 0 ? void 0 : cavClamp.length) || Number(tool.envelopLength);
                matInfo.moldBaseWidth = (cavClamp === null || cavClamp === void 0 ? void 0 : cavClamp.width) || Number(tool.envelopWidth);
                matInfo.moldBaseHeight = (cavClamp === null || cavClamp === void 0 ? void 0 : cavClamp.height) || 40;
                break;
            case ToolingMaterialIM.EjectorPlate:
                const cavIns2 = materialInfos.find(x => x.moldDescriptionId === ToolingMaterialIM.CavityInsert);
                matInfo.moldBaseLength = cavIns2 ? Number(cavIns2.length) * Number(tool.cavityMaxLength) : Number(tool.envelopLength);
                matInfo.moldBaseWidth = cavIns2 ? Number(cavIns2.width) * Number(tool.cavityMaxWidth) : Number(tool.envelopWidth);
                matInfo.moldBaseHeight = 25;
                break;
            case ToolingMaterialIM.ParallelBlock:
                const coreHold2 = materialInfos.find(x => x.moldDescriptionId === ToolingMaterialIM.CoreHoldingPlate);
                const ejPlate = materialInfos.find(x => x.moldDescriptionId === ToolingMaterialIM.EjectorPlate);
                const ejRet = materialInfos.find(x => x.moldDescriptionId === ToolingMaterialIM.EjectorReturnerPlate);
                matInfo.moldBaseLength = (coreHold2 === null || coreHold2 === void 0 ? void 0 : coreHold2.length) || Number(tool.envelopLength);
                matInfo.moldBaseWidth = (coreHold2 && ejPlate) ? (0, helpers_1.isValidNumber)(Number(coreHold2.width) - Number(ejPlate.width)) : Number(tool.envelopWidth);
                matInfo.moldBaseHeight = (ejRet && ejPlate) ? (0, helpers_1.isValidNumber)(1.5 * tool.envelopHeight + Number(ejRet.height) + Number(ejPlate.height)) : tool.envelopHeight;
                break;
            default:
                // For other types or when not using mold base logic
                break;
        }
        this.calculateCommonTooling(matInfo, tool);
        return matInfo;
    }
    calculateTotalToolingCost(materialInfos) {
        const materialCost = materialInfos.reduce((sum, x) => sum + (x.totalRawMaterialCost || 0), 0);
        // This is a simplified total tool cost.
        // In reality, it involves manufacturing costs, standard component costs, etc.
        // For testing, we'll focus on material cost summing.
        return {
            totalMaterialCost: (0, helpers_1.isValidNumber)(materialCost)
        };
    }
}
exports.ToolingCalculator = ToolingCalculator;
