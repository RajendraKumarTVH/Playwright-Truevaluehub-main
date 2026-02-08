
import { isValidNumber } from './helpers';

export enum ToolingMaterialIM {
    CavityInsert = 1,
    CoreInsert = 2,
    CavityHoldingPlate = 3,
    CoreHoldingPlate = 4,
    CoreBackPlate = 5,
    EjectorPlate = 6,
    EjectorReturnerPlate = 7,
    CavitySideClampingPlate = 8,
    CoreSideClampingPlate = 9,
    ParallelBlock = 10,
    ManifoldPlate = 11,
    HotRunnerCost = 13,
    SideCoreCost = 14,
    AngularCoreCost = 15,
    UnscrewingCost = 16,
    ElectrodeMaterialcost1 = 17,
    ElectrodeMaterialcost2 = 18
}

export interface CostToolingDto {
    noOfCavity: number;
    cavityMaxLength: number;
    cavityMaxWidth: number;
    sideGapLength: number;
    sideGapWidth: number;
    envelopLength: number;
    envelopWidth: number;
    envelopHeight: number;
    runnerGapLength: number;
    runnerGapWidth: number;
    moldBaseLength: number;
    moldBaseWidth: number;
    moldBaseHeight: number;
    noOfTool: number;
    noOfNewTool: number;
    noOfSubsequentTool: number;
    toolLifeInParts: number;
    mouldTypeId: number;
    mouldSubTypeId: number;
    noOfDrop: number;
    noOfCopperElectrodes: number;
    noOfGraphiteElectrodes: number;
    mouldCriticality: number;
    surfaceFinish: number;
    toolingMaterialInfos?: ToolingMaterialInfoDto[];
}

export interface ToolingMaterialInfoDto {
    moldDescriptionId: number;
    moldDescription: string;
    length: number;
    width: number;
    height: number;
    quantity: number;
    density: number;
    materialPrice: number;
    materialCuttingAllowance: number;
    netWeight: number;
    totalPlateWeight: number;
    totalRawMaterialCost: number;
    moldBaseLength?: number;
    moldBaseWidth?: number;
    moldBaseHeight?: number;
}

export class ToolingCalculator {

    public calculateMoldDimensions(tool: CostToolingDto, materialInfos: ToolingMaterialInfoDto[]) {
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
            tool.moldBaseLength = isValidNumber(Number(cavityInsert.length) * Number(tool.cavityMaxLength) + Number(tool.sideGapLength) * 2);
            tool.moldBaseWidth = isValidNumber(Number(cavityInsert.width) * Number(tool.cavityMaxWidth) + Number(tool.sideGapWidth) * 2);
        }

        tool.moldBaseHeight = isValidNumber(
            (cavityHoldingPlate?.height || 0) +
            (coreHoldingPlate?.height || 0) +
            (coreBackPlate?.height || 0) +
            (cavitySideClampingPlate?.height || 0) +
            (coreSideClampingPlate?.height || 0) +
            (parallelBlock?.height || 0) +
            (manifold?.height || 0) +
            (ejectorPlate?.height || 0) +
            (ejectorReturnerPlate?.height || 0)
        );

        tool.noOfSubsequentTool = isValidNumber(Number(tool.noOfTool) - Number(tool.noOfNewTool));

        return tool;
    }

    private calculateCommonTooling(matInfo: ToolingMaterialInfoDto, tool: CostToolingDto) {
        // Set dimensions from moldBase values if not dirty (Playwright treats all as non-dirty usually unless specified)
        matInfo.length = matInfo.moldBaseLength || matInfo.length;
        matInfo.width = matInfo.moldBaseWidth || matInfo.width;
        matInfo.height = matInfo.moldBaseHeight || matInfo.height;

        // Quantity Logic
        if (matInfo.moldDescriptionId === ToolingMaterialIM.CavityInsert || matInfo.moldDescriptionId === ToolingMaterialIM.CoreInsert) {
            matInfo.quantity = Number(tool.noOfCavity);
        } else if (matInfo.moldDescriptionId === ToolingMaterialIM.ParallelBlock) {
            matInfo.quantity = 2;
        } else if (matInfo.moldDescriptionId === ToolingMaterialIM.ElectrodeMaterialcost1) {
            matInfo.quantity = Number(tool.noOfCopperElectrodes);
        } else if (matInfo.moldDescriptionId === ToolingMaterialIM.ElectrodeMaterialcost2) {
            matInfo.quantity = Number(tool.noOfGraphiteElectrodes);
        } else {
            matInfo.quantity = 1;
        }

        // Net Weight
        matInfo.netWeight = isValidNumber(Number(matInfo.length) * Number(matInfo.width) * Number(matInfo.height) * Number(matInfo.density) * Number(matInfo.quantity) * Math.pow(10, -6));

        // Total Plate Weight
        if (matInfo.moldDescriptionId === ToolingMaterialIM.ElectrodeMaterialcost1 || matInfo.moldDescriptionId === ToolingMaterialIM.ElectrodeMaterialcost2) {
            matInfo.totalPlateWeight = isValidNumber(((Number(matInfo.length) * Number(matInfo.width) * Number(matInfo.height) * Number(matInfo.density)) / 1000000) * Number(matInfo.quantity));
        } else {
            matInfo.totalPlateWeight = isValidNumber(Number(matInfo.netWeight) * (1 + (matInfo.materialCuttingAllowance / 100)));
        }

        // Raw Material Cost
        matInfo.totalRawMaterialCost = isValidNumber(Number(matInfo.totalPlateWeight) * Number(matInfo.materialPrice));
    }

    public calculateMaterialCost(matInfo: ToolingMaterialInfoDto, tool: CostToolingDto, materialInfos: ToolingMaterialInfoDto[]) {
        switch (matInfo.moldDescriptionId) {
            case ToolingMaterialIM.CavityInsert:
                matInfo.moldBaseLength = Number(tool.envelopLength) + Number(tool.runnerGapLength) * 2;
                matInfo.moldBaseWidth = Number(tool.envelopWidth) + Number(tool.runnerGapWidth) * 2;
                matInfo.moldBaseHeight = Number(tool.envelopHeight) + 40;
                break;

            case ToolingMaterialIM.CoreInsert:
                const cavInsert = materialInfos.find(x => x.moldDescriptionId === ToolingMaterialIM.CavityInsert);
                matInfo.moldBaseLength = cavInsert?.length || Number(tool.envelopLength) + Number(tool.runnerGapLength) * 2;
                matInfo.moldBaseWidth = cavInsert?.width || Number(tool.envelopWidth) + Number(tool.runnerGapWidth) * 2;
                matInfo.moldBaseHeight = (cavInsert?.height || Number(tool.envelopHeight) + 40) + 20;
                break;

            case ToolingMaterialIM.CavityHoldingPlate:
                const cavIns = materialInfos.find(x => x.moldDescriptionId === ToolingMaterialIM.CavityInsert);
                matInfo.moldBaseLength = cavIns ? isValidNumber(Number(cavIns.length) * Number(tool.cavityMaxLength) + Number(tool.sideGapLength) * 2) : tool.envelopLength;
                matInfo.moldBaseWidth = cavIns ? isValidNumber(Number(cavIns.width) * Number(tool.cavityMaxWidth) + Number(tool.sideGapWidth) * 2) : (Number(tool.envelopWidth) + Number(tool.runnerGapWidth) * 2) * tool.cavityMaxWidth + Number(tool.sideGapWidth) * 2;
                matInfo.moldBaseHeight = (cavIns?.height || tool.envelopHeight) + 40;
                break;

            case ToolingMaterialIM.CoreHoldingPlate:
                const cavHold = materialInfos.find(x => x.moldDescriptionId === ToolingMaterialIM.CavityHoldingPlate);
                matInfo.moldBaseLength = cavHold?.length || Number(tool.envelopLength);
                matInfo.moldBaseWidth = cavHold?.width || (Number(tool.envelopWidth) + Number(tool.runnerGapWidth) * 2) * tool.cavityMaxWidth + Number(tool.sideGapWidth) * 2;
                matInfo.moldBaseHeight = (cavHold?.height || Number(tool.envelopHeight)) + 20;
                break;

            case ToolingMaterialIM.CoreBackPlate:
                const coreHold = materialInfos.find(x => x.moldDescriptionId === ToolingMaterialIM.CoreHoldingPlate);
                matInfo.moldBaseLength = coreHold?.length || Number(tool.envelopLength);
                matInfo.moldBaseWidth = coreHold?.width || Number(tool.envelopWidth);
                matInfo.moldBaseHeight = 50;
                break;

            case ToolingMaterialIM.CavitySideClampingPlate:
                const cavHolding = materialInfos.find(x => x.moldDescriptionId === ToolingMaterialIM.CavityHoldingPlate);
                matInfo.moldBaseLength = cavHolding?.length || Number(tool.envelopLength);
                matInfo.moldBaseWidth = cavHolding ? Number(cavHolding.width) + 30 * 2 : Number(tool.envelopWidth);
                matInfo.moldBaseHeight = 40;
                break;

            case ToolingMaterialIM.CoreSideClampingPlate:
                const cavClamp = materialInfos.find(x => x.moldDescriptionId === ToolingMaterialIM.CavitySideClampingPlate);
                matInfo.moldBaseLength = cavClamp?.length || Number(tool.envelopLength);
                matInfo.moldBaseWidth = cavClamp?.width || Number(tool.envelopWidth);
                matInfo.moldBaseHeight = cavClamp?.height || 40;
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
                matInfo.moldBaseLength = coreHold2?.length || Number(tool.envelopLength);
                matInfo.moldBaseWidth = (coreHold2 && ejPlate) ? isValidNumber(Number(coreHold2.width) - Number(ejPlate.width)) : Number(tool.envelopWidth);
                matInfo.moldBaseHeight = (ejRet && ejPlate) ? isValidNumber(1.5 * tool.envelopHeight + Number(ejRet.height) + Number(ejPlate.height)) : tool.envelopHeight;
                break;

            default:
                // For other types or when not using mold base logic
                break;
        }

        this.calculateCommonTooling(matInfo, tool);
        return matInfo;
    }

    public calculateTotalToolingCost(materialInfos: ToolingMaterialInfoDto[]) {
        const materialCost = materialInfos.reduce((sum, x) => sum + (x.totalRawMaterialCost || 0), 0);

        // This is a simplified total tool cost.
        // In reality, it involves manufacturing costs, standard component costs, etc.
        // For testing, we'll focus on material cost summing.
        return {
            totalMaterialCost: isValidNumber(materialCost)
        };
    }
}
