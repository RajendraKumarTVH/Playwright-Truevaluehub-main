import { Injectable } from '@angular/core';
import { MaterialInfoDto, PartInfoDto, MedbMachinesMasterDto } from 'src/app/shared/models';
import { PlasticRubberConfigService } from 'src/app/shared/config/plastic-rubber-config.service';

@Injectable({
  providedIn: 'root',
})
export class CavityConfigService {
  constructor(private _plasticRubberConfig: PlasticRubberConfigService) {}

  noOfCavities = [
    {
      batchQuantityMin: 0,
      batchQuantityMax: 9999,
      projectedAreas: [
        { projectedAreaMax: 10000, numberOfCavities: 1 },
        { projectedAreaMax: 25000, numberOfCavities: 1 },
        { projectedAreaMax: 40000, numberOfCavities: 1 },
        { projectedAreaMax: 60000, numberOfCavities: 1 },
        { projectedAreaMax: 80000, numberOfCavities: 1 },
        { projectedAreaMax: 100000, numberOfCavities: 1 },
        { projectedAreaMax: 150000, numberOfCavities: 1 },
        { projectedAreaMax: 200000, numberOfCavities: 1 },
        { projectedAreaMax: 250000, numberOfCavities: 1 },
        { projectedAreaMax: 300000, numberOfCavities: 1 },
        { projectedAreaMax: 350000, numberOfCavities: 1 },
        { projectedAreaMax: 400000, numberOfCavities: 1 },
        { projectedAreaMax: 450000, numberOfCavities: 1 },
        { projectedAreaMax: 500000, numberOfCavities: 1 },
      ],
    },
    {
      batchQuantityMin: 10000,
      batchQuantityMax: 50000,
      projectedAreas: [
        { projectedAreaMax: 10000, numberOfCavities: 2 },
        { projectedAreaMax: 25000, numberOfCavities: 2 },
        { projectedAreaMax: 40000, numberOfCavities: 2 },
        { projectedAreaMax: 60000, numberOfCavities: 2 },
        { projectedAreaMax: 80000, numberOfCavities: 2 },
        { projectedAreaMax: 100000, numberOfCavities: 1 },
        { projectedAreaMax: 150000, numberOfCavities: 1 },
        { projectedAreaMax: 200000, numberOfCavities: 1 },
        { projectedAreaMax: 250000, numberOfCavities: 1 },
        { projectedAreaMax: 300000, numberOfCavities: 1 },
        { projectedAreaMax: 350000, numberOfCavities: 1 },
        { projectedAreaMax: 400000, numberOfCavities: 1 },
        { projectedAreaMax: 450000, numberOfCavities: 1 },
        { projectedAreaMax: 500000, numberOfCavities: 1 },
      ],
    },
    {
      batchQuantityMin: 50001,
      batchQuantityMax: 100000,
      projectedAreas: [
        { projectedAreaMax: 10000, numberOfCavities: 4 },
        { projectedAreaMax: 25000, numberOfCavities: 4 },
        { projectedAreaMax: 40000, numberOfCavities: 4 },
        { projectedAreaMax: 60000, numberOfCavities: 4 },
        { projectedAreaMax: 80000, numberOfCavities: 4 },
        { projectedAreaMax: 100000, numberOfCavities: 2 },
        { projectedAreaMax: 150000, numberOfCavities: 2 },
        { projectedAreaMax: 200000, numberOfCavities: 2 },
        { projectedAreaMax: 250000, numberOfCavities: 2 },
        { projectedAreaMax: 300000, numberOfCavities: 1 },
        { projectedAreaMax: 350000, numberOfCavities: 1 },
        { projectedAreaMax: 400000, numberOfCavities: 1 },
        { projectedAreaMax: 450000, numberOfCavities: 1 },
        { projectedAreaMax: 500000, numberOfCavities: 1 },
      ],
    },
    {
      batchQuantityMin: 100001,
      batchQuantityMax: 500000,
      projectedAreas: [
        { projectedAreaMax: 10000, numberOfCavities: 4 },
        { projectedAreaMax: 25000, numberOfCavities: 4 },
        { projectedAreaMax: 40000, numberOfCavities: 4 },
        { projectedAreaMax: 60000, numberOfCavities: 4 },
        { projectedAreaMax: 80000, numberOfCavities: 4 },
        { projectedAreaMax: 100000, numberOfCavities: 4 },
        { projectedAreaMax: 150000, numberOfCavities: 4 },
        { projectedAreaMax: 200000, numberOfCavities: 4 },
        { projectedAreaMax: 250000, numberOfCavities: 2 },
        { projectedAreaMax: 300000, numberOfCavities: 2 },
        { projectedAreaMax: 350000, numberOfCavities: 2 },
        { projectedAreaMax: 400000, numberOfCavities: 1 },
        { projectedAreaMax: 450000, numberOfCavities: 1 },
        { projectedAreaMax: 500000, numberOfCavities: 1 },
      ],
    },
    {
      batchQuantityMin: 500001,
      batchQuantityMax: 1000000,
      projectedAreas: [
        { projectedAreaMax: 10000, numberOfCavities: 8 },
        { projectedAreaMax: 25000, numberOfCavities: 8 },
        { projectedAreaMax: 40000, numberOfCavities: 8 },
        { projectedAreaMax: 60000, numberOfCavities: 8 },
        { projectedAreaMax: 80000, numberOfCavities: 8 },
        { projectedAreaMax: 100000, numberOfCavities: 8 },
        { projectedAreaMax: 150000, numberOfCavities: 4 },
        { projectedAreaMax: 200000, numberOfCavities: 4 },
        { projectedAreaMax: 250000, numberOfCavities: 4 },
        { projectedAreaMax: 300000, numberOfCavities: 4 },
        { projectedAreaMax: 350000, numberOfCavities: 4 },
        { projectedAreaMax: 400000, numberOfCavities: 2 },
        { projectedAreaMax: 450000, numberOfCavities: 2 },
        { projectedAreaMax: 500000, numberOfCavities: 2 },
      ],
    },
    {
      batchQuantityMin: 1000001,
      batchQuantityMax: null,
      projectedAreas: [
        { projectedAreaMax: 10000, numberOfCavities: 16 },
        { projectedAreaMax: 25000, numberOfCavities: 16 },
        { projectedAreaMax: 40000, numberOfCavities: 16 },
        { projectedAreaMax: 60000, numberOfCavities: 16 },
        { projectedAreaMax: 80000, numberOfCavities: 16 },
        { projectedAreaMax: 100000, numberOfCavities: 16 },
        { projectedAreaMax: 150000, numberOfCavities: 8 },
        { projectedAreaMax: 200000, numberOfCavities: 8 },
        { projectedAreaMax: 250000, numberOfCavities: 8 },
        { projectedAreaMax: 300000, numberOfCavities: 8 },
        { projectedAreaMax: 350000, numberOfCavities: 4 },
        { projectedAreaMax: 400000, numberOfCavities: 4 },
        { projectedAreaMax: 450000, numberOfCavities: 4 },
        { projectedAreaMax: 500000, numberOfCavities: 2 },
      ],
    },
  ];

  defaultCavityConfigurations = [
    { numberOfCavities: 1, length: 1, width: 1 },
    { numberOfCavities: 2, length: 2, width: 1 },
    { numberOfCavities: 3, length: 1, width: 3 },
    { numberOfCavities: 4, length: 2, width: 2 },
    { numberOfCavities: 5, length: 1, width: 5 },
    { numberOfCavities: 6, length: 2, width: 3 },
    { numberOfCavities: 7, length: 1, width: 7 },
    { numberOfCavities: 8, length: 2, width: 4 },
    { numberOfCavities: 9, length: 3, width: 3 },
    { numberOfCavities: 10, length: 2, width: 5 },
    { numberOfCavities: 11, length: 1, width: 11 },
    { numberOfCavities: 12, length: 3, width: 4 },
    { numberOfCavities: 13, length: 1, width: 13 },
    { numberOfCavities: 14, length: 2, width: 7 },
    { numberOfCavities: 15, length: 3, width: 5 },
    { numberOfCavities: 16, length: 4, width: 4 },
    { numberOfCavities: 17, length: 1, width: 17 },
    { numberOfCavities: 18, length: 3, width: 6 },
    { numberOfCavities: 20, length: 4, width: 5 },
    { numberOfCavities: 21, length: 3, width: 7 },
    { numberOfCavities: 22, length: 2, width: 11 },
    { numberOfCavities: 24, length: 4, width: 6 },
    { numberOfCavities: 25, length: 5, width: 5 },
    { numberOfCavities: 26, length: 2, width: 13 },
    { numberOfCavities: 27, length: 3, width: 9 },
    { numberOfCavities: 28, length: 4, width: 7 },
    { numberOfCavities: 29, length: 1, width: 29 },
    { numberOfCavities: 30, length: 5, width: 6 },
    { numberOfCavities: 31, length: 1, width: 31 },
    { numberOfCavities: 32, length: 4, width: 8 },
    { numberOfCavities: 33, length: 3, width: 11 },
    { numberOfCavities: 34, length: 2, width: 17 },
    { numberOfCavities: 35, length: 5, width: 7 },
    { numberOfCavities: 36, length: 6, width: 6 },
    { numberOfCavities: 37, length: 1, width: 37 },
    { numberOfCavities: 38, length: 2, width: 19 },
    { numberOfCavities: 39, length: 3, width: 13 },
    { numberOfCavities: 40, length: 5, width: 8 },
    { numberOfCavities: 41, length: 1, width: 41 },
    { numberOfCavities: 42, length: 6, width: 7 },
    { numberOfCavities: 44, length: 4, width: 11 },
    { numberOfCavities: 45, length: 5, width: 9 },
    { numberOfCavities: 46, length: 2, width: 23 },
    { numberOfCavities: 47, length: 1, width: 47 },
    { numberOfCavities: 48, length: 6, width: 8 },
    { numberOfCavities: 49, length: 7, width: 7 },
    { numberOfCavities: 50, length: 5, width: 10 },
    { numberOfCavities: 51, length: 3, width: 17 },
    { numberOfCavities: 52, length: 4, width: 13 },
    { numberOfCavities: 53, length: 1, width: 53 },
    { numberOfCavities: 54, length: 6, width: 9 },
    { numberOfCavities: 55, length: 5, width: 11 },
    { numberOfCavities: 56, length: 7, width: 8 },
    { numberOfCavities: 57, length: 3, width: 19 },
    { numberOfCavities: 58, length: 2, width: 29 },
    { numberOfCavities: 59, length: 1, width: 59 },
    { numberOfCavities: 60, length: 6, width: 10 },
    { numberOfCavities: 61, length: 1, width: 61 },
    { numberOfCavities: 62, length: 2, width: 31 },
    { numberOfCavities: 63, length: 7, width: 9 },
    { numberOfCavities: 64, length: 8, width: 8 },
    { numberOfCavities: 65, length: 5, width: 13 },
    { numberOfCavities: 66, length: 6, width: 11 },
    { numberOfCavities: 67, length: 1, width: 67 },
    { numberOfCavities: 68, length: 4, width: 17 },
    { numberOfCavities: 69, length: 3, width: 23 },
    { numberOfCavities: 70, length: 7, width: 10 },
    { numberOfCavities: 72, length: 8, width: 9 },
    { numberOfCavities: 73, length: 1, width: 73 },
    { numberOfCavities: 74, length: 2, width: 37 },
    { numberOfCavities: 75, length: 3, width: 15 },
    { numberOfCavities: 76, length: 4, width: 19 },
    { numberOfCavities: 77, length: 7, width: 11 },
    { numberOfCavities: 78, length: 6, width: 13 },
    { numberOfCavities: 79, length: 1, width: 79 },
    { numberOfCavities: 80, length: 8, width: 10 },
    { numberOfCavities: 81, length: 9, width: 9 },
    { numberOfCavities: 82, length: 2, width: 41 },
    { numberOfCavities: 83, length: 1, width: 83 },
    { numberOfCavities: 84, length: 7, width: 12 },
    { numberOfCavities: 85, length: 5, width: 17 },
    { numberOfCavities: 86, length: 2, width: 43 },
    { numberOfCavities: 87, length: 3, width: 29 },
    { numberOfCavities: 88, length: 8, width: 11 },
    { numberOfCavities: 89, length: 1, width: 89 },
    { numberOfCavities: 90, length: 6, width: 15 },
    { numberOfCavities: 91, length: 7, width: 13 },
    { numberOfCavities: 92, length: 4, width: 23 },
    { numberOfCavities: 93, length: 3, width: 31 },
    { numberOfCavities: 94, length: 2, width: 47 },
    { numberOfCavities: 95, length: 5, width: 19 },
    { numberOfCavities: 96, length: 8, width: 12 },
    { numberOfCavities: 97, length: 1, width: 97 },
    { numberOfCavities: 98, length: 7, width: 14 },
    { numberOfCavities: 99, length: 9, width: 11 },
    { numberOfCavities: 100, length: 10, width: 10 },
    { numberOfCavities: 101, length: 1, width: 101 },
    { numberOfCavities: 102, length: 6, width: 17 },
    { numberOfCavities: 103, length: 1, width: 103 },
    { numberOfCavities: 104, length: 8, width: 13 },
    { numberOfCavities: 105, length: 7, width: 15 },
    { numberOfCavities: 106, length: 2, width: 53 },
    { numberOfCavities: 107, length: 1, width: 107 },
    { numberOfCavities: 108, length: 9, width: 12 },
    { numberOfCavities: 110, length: 10, width: 11 },
    { numberOfCavities: 111, length: 3, width: 37 },
    { numberOfCavities: 112, length: 8, width: 14 },
    { numberOfCavities: 113, length: 1, width: 113 },
    { numberOfCavities: 114, length: 6, width: 19 },
    { numberOfCavities: 115, length: 5, width: 23 },
    { numberOfCavities: 116, length: 4, width: 29 },
    { numberOfCavities: 117, length: 9, width: 13 },
    { numberOfCavities: 118, length: 2, width: 59 },
    { numberOfCavities: 119, length: 7, width: 17 },
    { numberOfCavities: 120, length: 10, width: 12 },
    { numberOfCavities: 121, length: 11, width: 11 },
    { numberOfCavities: 122, length: 2, width: 61 },
    { numberOfCavities: 123, length: 3, width: 41 },
    { numberOfCavities: 124, length: 4, width: 31 },
    { numberOfCavities: 125, length: 5, width: 25 },
    { numberOfCavities: 126, length: 9, width: 14 },
    { numberOfCavities: 127, length: 1, width: 127 },
    { numberOfCavities: 128, length: 8, width: 16 },
  ];

  getNumberOfCavities(batchQuantity: number, projectedArea: number): number {
    // Find the correct batch quantity range
    const batchMatch = this.noOfCavities.find((rule) => batchQuantity >= rule.batchQuantityMin && (rule.batchQuantityMax === null || batchQuantity <= rule.batchQuantityMax));

    if (!batchMatch) {
      console.info('No matching batch quantity range found');
      return 0;
    }

    // Find the closest projected area match
    const areaMatch = batchMatch.projectedAreas.find((areaRule) => projectedArea <= areaRule.projectedAreaMax);

    if (!areaMatch) {
      console.info('No matching projected area found');
      return 0;
    }

    return areaMatch.numberOfCavities;
  }

  getCavityLayout(numberOfCavities: number) {
    const match = this.defaultCavityConfigurations.find((item) => item.numberOfCavities === numberOfCavities);

    if (!match) {
      console.info('No layout found for given number of cavities.');
      return {
        cavitiesAlongLength: 0,
        cavitiesAlongWidth: 0,
      };
    }

    return {
      cavitiesAlongLength: match.length,
      cavitiesAlongWidth: match.width,
    };
  }

  getCavityWidth(numberOfCavities: number, cavitiesAlongLength: number): number {
    const match = this.defaultCavityConfigurations.find((item) => item.numberOfCavities === numberOfCavities && item.length === cavitiesAlongLength);

    if (!match) {
      console.info('No layout found for given number of cavities and length.');
      return 0;
    }

    return match.width;
  }

  /**
   * Get the default layout for a given cavity count
   * Always ensures length >= width
   */
  getDefaultLayout(n: number): CavityLayout {
    if (n <= 0) throw new Error('Invalid cavity count');

    let bestLength = n;
    let bestWidth = 1;
    let minDiff = n - 1;

    // find the most balanced factor pair (L * W = n)
    for (let i = 1; i <= Math.sqrt(n); i++) {
      if (n % i === 0) {
        const j = n / i;
        const diff = Math.abs(j - i);
        if (diff < minDiff) {
          minDiff = diff;
          // ensure length is always the larger value
          bestLength = Math.max(i, j);
          bestWidth = Math.min(i, j);
        }
      }
    }

    return { numberOfCavities: n, length: bestLength, width: bestWidth, isDefault: true };
  }

  /**
   * Get a layout when cavity count and a specific length are known
   * Returns null if invalid combination
   */
  getLayoutByLength(n: number, length: number): CavityLayout | null {
    if (n % length !== 0) return { numberOfCavities: n, length: 0, width: 0, isDefault: false }; // invalid factor pair
    const width = n / length;

    const defaultLayout = this.getDefaultLayout(n);
    const isDefault = defaultLayout.length === length && defaultLayout.width === width;

    return { numberOfCavities: n, length, width, isDefault };
  }

  generateCavityPairs(n: number): [number, number, number][] {
    const pairs: [number, number, number][] = [];

    for (let i = 1; i <= Math.sqrt(n); i++) {
      if (n % i === 0) {
        const j = n / i;
        pairs.push([n, i, j]);
        if (i !== j) {
          pairs.push([n, j, i]);
        }
      }
    }

    return pairs;
  }

  getNumberOfCavitiesForRubberMolding(machineTypeDescription: MedbMachinesMasterDto[], currentPart: PartInfoDto, materialInfo: MaterialInfoDto): number {
    let noc = this._plasticRubberConfig.getBestMachineForRubberMolding(machineTypeDescription, materialInfo, currentPart, false)?.finalNOC;
    return noc || 1;
  }
}
interface CavityLayout {
  numberOfCavities: number;
  length: number;
  width: number;
  isDefault: boolean;
}
