
import { PrimaryProcessType, PartComplexity } from '../utils/constants';
import { SharedService } from './shared';

export class MaterialCastingConfigService {
    constructor(
        public sharedService: SharedService
    ) { }

    cavityCalculation(castingType: number, dx: number, dy: number, partLength: number, partWidth: number): number {
        let result = 1;
        if (castingType === PrimaryProcessType.GreenCastingSemiAuto) {
            const safetyFrameDistEachSide = 80,
                spaceBtPartsHorizontalX = 35,
                spaceBtPartsHorizontalY = 35;
            const widthVgate = 30,
                distVgatePart = 15;

            const xDirection = Math.floor((dx - 2 * safetyFrameDistEachSide - widthVgate - distVgatePart) / (partLength + spaceBtPartsHorizontalX / 2));
            const yDirection = Math.floor((dy - 2 * safetyFrameDistEachSide - widthVgate - distVgatePart) / (partWidth + spaceBtPartsHorizontalY / 2));

            const totVSplitA = xDirection * yDirection;
            result = totVSplitA;
        } else if (castingType === PrimaryProcessType.GreenCastingAuto) {
            const fxA = 40,
                fyA = 140,
                pxA = 25,
                gxA = 25,
                gyA = 20,
                gPxA = 15,
                gPyA = 10,
                ryA = 75,
                rGyA = 10;
            const fxB = 40,
                fyB = 140,
                pxB = 25,
                gxB = 25,
                gyB = 20,
                gPxB = 15,
                gPyB = 10,
                rxB = 50,
                ryB = 75,
                rGyB = 10;

            const xDirectionA = Math.floor((dx - 2 * fxA - gxA - gPxA) / (partLength + pxA / 2));
            const yDirectionA = Math.floor((dy - fyA) / (partWidth + ryA / 2 + rGyA + gyA + gPyA));

            const xDirectionB = Math.floor((dx - 2 * fxB - gxB - gPxB) / (partWidth + rxB / 3 + pxB / 2));
            const yDirectionB = Math.floor((dy - fyB) / (partLength + ryB / 2 + rGyB + gyB + gPyB));

            const totVSplitA = xDirectionA * yDirectionA;
            const totVSplitB = xDirectionB * yDirectionB;
            result = totVSplitA > totVSplitB ? totVSplitA : totVSplitB;
        }
        return result > 0 ? result : 1;
    }

    sprueGateWeightCalculation(density: number = 2.7) {
        const src = [
            { id: 1, description: 'Runner', lengthmm: 40, widthmm: 30, heightmm: 30, qty: 1, metalWeightkg: 0, waxWeightkg: 0 },
            { id: 2, description: 'Sprue', lengthmm: 50, widthmm: 50, heightmm: 600, qty: 1, metalWeightkg: 0, waxWeightkg: 0 },
            { id: 3, description: 'Gate', lengthmm: 20, widthmm: 20, heightmm: 20, qty: 1, metalWeightkg: 0, waxWeightkg: 0 },
        ];
        const result = { totMetalWeightkg: 0, totWaxWeightkg: 0 };

        src.forEach((item, index) => {
            item.metalWeightkg = (item.lengthmm * item.widthmm * item.heightmm * item.qty * density) / Math.pow(10, 6);
            item.waxWeightkg = (item.lengthmm * item.widthmm * item.heightmm * item.qty * 0.9) / Math.pow(10, 6);
            result.totMetalWeightkg += item.metalWeightkg;
            result.totWaxWeightkg += item.waxWeightkg;
        });
        result.totWaxWeightkg *= 1000;
        return result;
    }

    getRunnerRaiserPercentageByWeight(materialId: number, partWeight: number, complexity: PartComplexity): number {
        const runnerRiser = [
            {
                materialId: 23, // cast iron
                data: [
                    { partWeight: 10, percentage: { [PartComplexity.Low]: 40, [PartComplexity.Medium]: 50, [PartComplexity.High]: 60 } },
                    { partWeight: 50, percentage: { [PartComplexity.Low]: 35, [PartComplexity.Medium]: 45, [PartComplexity.High]: 60 } },
                    { partWeight: 100000, percentage: { [PartComplexity.Low]: 30, [PartComplexity.Medium]: 40, [PartComplexity.High]: 60 } },
                ],
            },
            {
                materialId: 42, // stainless steel
                data: [
                    { partWeight: 10, percentage: { [PartComplexity.Low]: 50, [PartComplexity.Medium]: 60, [PartComplexity.High]: 70 } },
                    { partWeight: 50, percentage: { [PartComplexity.Low]: 45, [PartComplexity.Medium]: 55, [PartComplexity.High]: 65 } },
                    { partWeight: 100000, percentage: { [PartComplexity.Low]: 40, [PartComplexity.Medium]: 50, [PartComplexity.High]: 60 } },
                ],
            },
            {
                materialId: 266, // aluminum
                data: [
                    { partWeight: 10, percentage: { [PartComplexity.Low]: 45, [PartComplexity.Medium]: 55, [PartComplexity.High]: 65 } },
                    { partWeight: 50, percentage: { [PartComplexity.Low]: 40, [PartComplexity.Medium]: 50, [PartComplexity.High]: 60 } },
                    { partWeight: 100000, percentage: { [PartComplexity.Low]: 35, [PartComplexity.Medium]: 45, [PartComplexity.High]: 60 } },
                ],
            },
        ];
        const matRow = runnerRiser.find((item) => item.materialId === materialId);
        if (!matRow) return 0;

        const pRow = matRow.data.find((p) => p.partWeight >= partWeight);
        return (pRow || matRow.data[0]).percentage[complexity] || 0;
    }

    getRunnerRaiserPercentageByThickness(thickness: number, complexity: PartComplexity, castingType: PrimaryProcessType): number {
        const runnerRiser = [
            {
                castingType: [PrimaryProcessType.HPDCCasting, PrimaryProcessType.LPDCCasting],
                data: [
                    { thickness: 1.5, percentage: { [PartComplexity.Low]: 45, [PartComplexity.Medium]: 45, [PartComplexity.High]: 55 } },
                    { thickness: 3, percentage: { [PartComplexity.Low]: 40, [PartComplexity.Medium]: 40, [PartComplexity.High]: 50 } },
                    { thickness: 100, percentage: { [PartComplexity.Low]: 35, [PartComplexity.Medium]: 35, [PartComplexity.High]: 45 } },
                ],
            },
            {
                castingType: [PrimaryProcessType.GDCCasting],
                data: [
                    { thickness: 5, percentage: { [PartComplexity.Low]: 45, [PartComplexity.Medium]: 45, [PartComplexity.High]: 55 } },
                    { thickness: 8, percentage: { [PartComplexity.Low]: 40, [PartComplexity.Medium]: 40, [PartComplexity.High]: 50 } },
                    { thickness: 100, percentage: { [PartComplexity.Low]: 35, [PartComplexity.Medium]: 35, [PartComplexity.High]: 45 } },
                ],
            },
        ];
        const castRow = runnerRiser.find((item) => item.castingType.includes(castingType));
        if (!castRow) return 60;

        const pRow = castRow.data.find((p) => p.thickness >= thickness);
        return (pRow || castRow.data[0]).percentage[complexity] || 60;
    }

    getIrretrivalLossPercentage(materialId: number): number {
        const irretrivalLoss = [
            { materialId: 266, percentage: 4 }, // aluminum
            { materialId: 2, percentage: 6 }, // zinc
            { materialId: 242, percentage: 3 }, // copper
            { materialId: 57, percentage: 3 }, // brass
        ];
        return irretrivalLoss.find((item) => item.materialId === materialId)?.percentage || 6;
    }
}
