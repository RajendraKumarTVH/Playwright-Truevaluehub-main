"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const tooling_calculator_1 = require("./tooling-calculator");
test_1.test.describe('Tooling Calculator - Injection Moulding', () => {
    const calculator = new tooling_calculator_1.ToolingCalculator();
    const sampleTool = {
        noOfCavity: 4,
        noOfTool: 1,
        noOfNewTool: 1,
        noOfSubsequentTool: 0,
        cavityMaxLength: 100,
        cavityMaxWidth: 80,
        sideGapLength: 30,
        sideGapWidth: 25,
        envelopLength: 50,
        envelopWidth: 40,
        envelopHeight: 30,
        runnerGapLength: 10,
        runnerGapWidth: 10,
        moldBaseLength: 0,
        moldBaseWidth: 0,
        moldBaseHeight: 0,
        toolLifeInParts: 100000,
        mouldTypeId: 1,
        mouldSubTypeId: 1,
        noOfDrop: 1,
        noOfCopperElectrodes: 5,
        noOfGraphiteElectrodes: 2,
        mouldCriticality: 1,
        surfaceFinish: 1
    };
    const materialInfos = [
        {
            moldDescriptionId: tooling_calculator_1.ToolingMaterialIM.CavityInsert,
            moldDescription: 'Cavity Insert',
            length: 0, width: 0, height: 0, quantity: 0,
            density: 7.85, materialPrice: 10, materialCuttingAllowance: 10,
            netWeight: 0, totalPlateWeight: 0, totalRawMaterialCost: 0
        },
        {
            moldDescriptionId: tooling_calculator_1.ToolingMaterialIM.CoreInsert,
            moldDescription: 'Core Insert',
            length: 0, width: 0, height: 0, quantity: 0,
            density: 7.85, materialPrice: 10, materialCuttingAllowance: 10,
            netWeight: 0, totalPlateWeight: 0, totalRawMaterialCost: 0
        }
    ];
    (0, test_1.test)('should calculate Cavity Insert dimensions correctly', () => {
        const matInfo = Object.assign({}, materialInfos[0]);
        const result = calculator.calculateMaterialCost(matInfo, sampleTool, materialInfos);
        // moldBaseLength = envelopLength (50) + runnerGapLength (10) * 2 = 70
        // moldBaseWidth = envelopWidth (40) + runnerGapWidth (10) * 2 = 60
        // moldBaseHeight = envelopHeight (30) + 40 = 70
        (0, test_1.expect)(result.moldBaseLength).toBe(70);
        (0, test_1.expect)(result.moldBaseWidth).toBe(60);
        (0, test_1.expect)(result.moldBaseHeight).toBe(70);
        (0, test_1.expect)(result.quantity).toBe(4);
    });
    (0, test_1.test)('should calculate Core Insert dimensions correctly based on Cavity Insert', () => {
        // First calc Cavity Insert
        const cavMat = calculator.calculateMaterialCost(Object.assign({}, materialInfos[0]), sampleTool, materialInfos);
        const currentMatInfos = [cavMat, materialInfos[1]];
        const coreMat = Object.assign({}, materialInfos[1]);
        const result = calculator.calculateMaterialCost(coreMat, sampleTool, currentMatInfos);
        // Core Insert length/width same as Cavity Insert (70, 60)
        // height = cavHeight (70) + 20 = 90
        (0, test_1.expect)(result.moldBaseLength).toBe(70);
        (0, test_1.expect)(result.moldBaseWidth).toBe(60);
        (0, test_1.expect)(result.moldBaseHeight).toBe(90);
    });
    (0, test_1.test)('should calculate Net Weight and Material Cost correctly', () => {
        const matInfo = {
            moldDescriptionId: tooling_calculator_1.ToolingMaterialIM.CavityInsert,
            moldDescription: 'Cavity Insert',
            moldBaseLength: 100, moldBaseWidth: 100, moldBaseHeight: 10,
            length: 100, width: 100, height: 10,
            quantity: 2, density: 7.85, materialPrice: 5, materialCuttingAllowance: 10,
            netWeight: 0, totalPlateWeight: 0, totalRawMaterialCost: 0
        };
        calculator.calculateMaterialCost(matInfo, sampleTool, []);
        // Net Weight = 100 * 100 * 10 * 7.85 * 2 * 10^-6 = 1.57 kg
        // Total Plate Weight = 1.57 * (1 + 0.1) = 1.727 kg
        // Total Material Cost = 1.727 * 5 = 8.635
        (0, test_1.expect)(matInfo.netWeight).toBeCloseTo(1.57, 2);
        (0, test_1.expect)(matInfo.totalPlateWeight).toBeCloseTo(1.727, 3);
        (0, test_1.expect)(matInfo.totalRawMaterialCost).toBeCloseTo(8.635, 3);
    });
});
