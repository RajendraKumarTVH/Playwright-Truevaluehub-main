import { Injectable } from '@angular/core';
import { PrimaryProcessType } from 'src/app/modules/costing/costing.config';
import { forEach } from 'lodash';
import { FormBuilder } from '@angular/forms';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
// import { MaterialInfoDto } from '../models';
import { PartComplexity } from '../enums';

@Injectable({
  providedIn: 'root',
})
export class MaterialCastingConfigService {
  constructor(
    private formbuilder: FormBuilder,
    public sharedService: SharedService
  ) {}

  sandForCoreFormGroup(selectedMaterialInfoId = 0, coreData: any = null, index = 0) {
    if (coreData) {
      return this.formbuilder.group(coreData);
    }
    return this.formbuilder.group({
      coreCostDetailsId: 0,
      materialInfoId: selectedMaterialInfoId || 0,
      coreLength: 0,
      coreWidth: 0,
      coreHeight: 0,
      coreShape: 1,
      coreArea: 0,
      coreVolume: 0,
      noOfCore: 1,
      coreWeight: 0,
      coreSandPrice: 0,
      grindFlush: 0,
      coreName: `Core ${index ?? 0}`,
    });
  }

  cavityCalculation(castingType, dx, dy, partLength, partWidth): number {
    let result = 1;
    if (castingType === PrimaryProcessType.GreenCastingSemiAuto) {
      const safetyFrameDistEachSide = 80,
        // safetyFrameDistTopBottom = 120,
        spaceBtPartsHorizontalX = 35,
        spaceBtPartsHorizontalY = 35;
      const widthVgate = 30,
        // heightHgate = 20,
        distVgatePart = 15;
      // distHgatePart = 20,
      // widthRinser = 42.5,
      // heightRinser = 85,
      // distRinserPart = 20;

      const xDirection = Math.floor((dx - 2 * safetyFrameDistEachSide - widthVgate - distVgatePart) / (partLength + spaceBtPartsHorizontalX / 2));
      const yDirection = Math.floor((dy - 2 * safetyFrameDistEachSide - widthVgate - distVgatePart) / (partWidth + spaceBtPartsHorizontalY / 2));

      const totVSplitA = xDirection * yDirection;
      result = totVSplitA;
    } else if (castingType === PrimaryProcessType.GreenCastingAuto) {
      const fxA = 40,
        fyA = 140,
        pxA = 25,
        // pyA = 0,
        gxA = 25,
        gyA = 20,
        gPxA = 15,
        gPyA = 10,
        // rxA = 50,
        ryA = 75,
        // rPxA = 0,
        // rPyA = 15,
        // rGxA = 10,
        rGyA = 10;
      const fxB = 40,
        fyB = 140,
        pxB = 25,
        // pyB = 0,
        gxB = 25,
        gyB = 20,
        gPxB = 15,
        gPyB = 10,
        rxB = 50,
        ryB = 75,
        // rPxB = 0,
        // rPyB = 15,
        // rGxB = 10,
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

  sprueGateWeightCalculation(density?: number) {
    const src = [
      { id: 1, description: 'Runner', lengthmm: 40, widthmm: 30, heightmm: 30, qty: 1, metalWeightkg: 0, waxWeightkg: 0 },
      { id: 2, description: 'Sprue', lengthmm: 50, widthmm: 50, heightmm: 600, qty: 1, metalWeightkg: 0, waxWeightkg: 0 },
      { id: 3, description: 'Gate', lengthmm: 20, widthmm: 20, heightmm: 20, qty: 1, metalWeightkg: 0, waxWeightkg: 0 },
    ];
    const result = { totMetalWeightkg: 0, totWaxWeightkg: 0 };

    forEach(src, (item, index) => {
      item.metalWeightkg = (item.lengthmm * item.widthmm * item.heightmm * item.qty * density) / Math.pow(10, 6);
      item.waxWeightkg = (item.lengthmm * item.widthmm * item.heightmm * item.qty * 0.9) / Math.pow(10, 6);
      src[index] = item;
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
    return (
      runnerRiser.find((item) => item.materialId === materialId)?.data.find((p) => p.partWeight >= partWeight)?.percentage[complexity] ||
      runnerRiser.find((item) => item.materialId === materialId)?.data[0].percentage[complexity] ||
      0
    );
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
    return (
      runnerRiser.find((item) => item.castingType.includes(castingType))?.data.find((p) => p.thickness >= thickness)?.percentage[complexity] ||
      runnerRiser.find((item) => item.castingType.includes(castingType))?.data[0].percentage[complexity] ||
      60
    );
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
