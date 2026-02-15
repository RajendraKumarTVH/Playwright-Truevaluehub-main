import { Injectable } from '@angular/core';
import { PartComplexity } from 'src/app/shared/enums';
@Injectable({
  providedIn: 'root',
})
export class BlowMoldingConfigService {
  getCavityNumbers(annualVolume: number, complexity: number) {
    let resultList: any[] = [];
    if (annualVolume < 10000 || (annualVolume >= 10000 && annualVolume <= 50000)) {
      if (complexity === PartComplexity.Low || complexity === PartComplexity.Medium) {
        resultList = [
          { minLength: 0, maxLength: 100, cavities: 2 },
          { minLength: 100, maxLength: 250, cavities: 2 },
          { minLength: 250, maxLength: 350, cavities: 1 },
          { minLength: 350, maxLength: 10000, cavities: 1 },
        ];
      } else if (complexity === PartComplexity.High) {
        resultList = [
          { minLength: 0, maxLength: 100, cavities: 2 },
          { minLength: 100, maxLength: 250, cavities: 1 },
          { minLength: 250, maxLength: 350, cavities: 1 },
          { minLength: 350, maxLength: 10000, cavities: 1 },
        ];
      }
    } else if (annualVolume >= 50000 && annualVolume <= 100000) {
      if (complexity === PartComplexity.Low) {
        resultList = [
          { minLength: 0, maxLength: 100, cavities: 4 },
          { minLength: 100, maxLength: 250, cavities: 2 },
          { minLength: 250, maxLength: 350, cavities: 2 },
          { minLength: 350, maxLength: 10000, cavities: 1 },
        ];
      } else if (complexity === PartComplexity.Medium) {
        resultList = [
          { minLength: 0, maxLength: 100, cavities: 4 },
          { minLength: 100, maxLength: 250, cavities: 2 },
          { minLength: 250, maxLength: 350, cavities: 1 },
          { minLength: 350, maxLength: 10000, cavities: 1 },
        ];
      } else if (complexity === PartComplexity.High) {
        resultList = [
          { minLength: 0, maxLength: 100, cavities: 2 },
          { minLength: 100, maxLength: 250, cavities: 2 },
          { minLength: 250, maxLength: 350, cavities: 1 },
          { minLength: 350, maxLength: 10000, cavities: 1 },
        ];
      }
    } else if (annualVolume >= 100000 && annualVolume <= 500000) {
      if (complexity === PartComplexity.Low) {
        resultList = [
          { minLength: 0, maxLength: 100, cavities: 4 },
          { minLength: 100, maxLength: 250, cavities: 4 },
          { minLength: 250, maxLength: 350, cavities: 2 },
          { minLength: 350, maxLength: 10000, cavities: 1 },
        ];
      } else if (complexity === PartComplexity.Medium) {
        resultList = [
          { minLength: 0, maxLength: 100, cavities: 4 },
          { minLength: 100, maxLength: 250, cavities: 4 },
          { minLength: 250, maxLength: 350, cavities: 1 },
          { minLength: 350, maxLength: 10000, cavities: 1 },
        ];
      } else if (complexity === PartComplexity.High) {
        resultList = [
          { minLength: 0, maxLength: 100, cavities: 2 },
          { minLength: 100, maxLength: 250, cavities: 2 },
          { minLength: 250, maxLength: 350, cavities: 1 },
          { minLength: 350, maxLength: 10000, cavities: 1 },
        ];
      }
    } else if (annualVolume >= 500000 && annualVolume <= 1000000) {
      if (complexity === PartComplexity.Low) {
        resultList = [
          { minLength: 0, maxLength: 100, cavities: 4 },
          { minLength: 100, maxLength: 250, cavities: 4 },
          { minLength: 250, maxLength: 350, cavities: 2 },
          { minLength: 350, maxLength: 10000, cavities: 1 },
        ];
      } else if (complexity === PartComplexity.Medium) {
        resultList = [
          { minLength: 0, maxLength: 100, cavities: 4 },
          { minLength: 100, maxLength: 250, cavities: 4 },
          { minLength: 250, maxLength: 350, cavities: 4 },
          { minLength: 350, maxLength: 10000, cavities: 1 },
        ];
      } else if (complexity === PartComplexity.High) {
        resultList = [
          { minLength: 0, maxLength: 100, cavities: 4 },
          { minLength: 100, maxLength: 250, cavities: 4 },
          { minLength: 250, maxLength: 350, cavities: 4 },
          { minLength: 350, maxLength: 10000, cavities: 2 },
        ];
      }
    } else if (annualVolume > 1000000) {
      resultList = [
        { minLength: 0, maxLength: 100, cavities: 4 },
        { minLength: 100, maxLength: 250, cavities: 4 },
        { minLength: 250, maxLength: 350, cavities: 4 },
        { minLength: 350, maxLength: 10000, cavities: 2 },
      ];
    }
    return resultList;
  }
  getNoOfCavityForCompressionMolding(annualVolume: number, complexity: number) {
    let resultList: any[] = [];
    if (annualVolume < 10000 || (annualVolume >= 10000 && annualVolume <= 50000)) {
      if (complexity === PartComplexity.Low || complexity === PartComplexity.Medium) {
        resultList = [
          { minLength: 0, maxLength: 100, cavities: 2 },
          { minLength: 100, maxLength: 250, cavities: 1 },
          { minLength: 250, maxLength: 350, cavities: 1 },
          { minLength: 350, maxLength: 10000, cavities: 1 },
        ];
      } else if (complexity === PartComplexity.High) {
        resultList = [
          { minLength: 0, maxLength: 100, cavities: 1 },
          { minLength: 100, maxLength: 250, cavities: 1 },
          { minLength: 250, maxLength: 350, cavities: 1 },
          { minLength: 350, maxLength: 10000, cavities: 1 },
        ];
      }
    } else if (annualVolume >= 50000 && annualVolume <= 100000) {
      if (complexity === PartComplexity.Low) {
        resultList = [
          { minLength: 0, maxLength: 100, cavities: 4 },
          { minLength: 100, maxLength: 250, cavities: 2 },
          { minLength: 250, maxLength: 350, cavities: 2 },
          { minLength: 350, maxLength: 10000, cavities: 1 },
        ];
      } else if (complexity === PartComplexity.Medium) {
        resultList = [
          { minLength: 0, maxLength: 100, cavities: 4 },
          { minLength: 100, maxLength: 250, cavities: 2 },
          { minLength: 250, maxLength: 350, cavities: 1 },
          { minLength: 350, maxLength: 10000, cavities: 1 },
        ];
      } else if (complexity === PartComplexity.High) {
        resultList = [
          { minLength: 0, maxLength: 100, cavities: 2 },
          { minLength: 100, maxLength: 250, cavities: 2 },
          { minLength: 250, maxLength: 350, cavities: 1 },
          { minLength: 350, maxLength: 10000, cavities: 1 },
        ];
      }
    } else if (annualVolume >= 100000 && annualVolume <= 500000) {
      if (complexity === PartComplexity.Low || complexity === PartComplexity.Medium) {
        resultList = [
          { minLength: 0, maxLength: 100, cavities: 4 },
          { minLength: 100, maxLength: 250, cavities: 4 },
          { minLength: 250, maxLength: 350, cavities: 2 },
          { minLength: 350, maxLength: 10000, cavities: 1 },
        ];
      } else if (complexity === PartComplexity.High) {
        resultList = [
          { minLength: 0, maxLength: 100, cavities: 2 },
          { minLength: 100, maxLength: 250, cavities: 2 },
          { minLength: 250, maxLength: 350, cavities: 2 },
          { minLength: 350, maxLength: 10000, cavities: 1 },
        ];
      }
    } else if (annualVolume >= 500000 && annualVolume <= 1000000) {
      if (complexity === PartComplexity.Low) {
        resultList = [
          { minLength: 0, maxLength: 100, cavities: 8 },
          { minLength: 100, maxLength: 250, cavities: 4 },
          { minLength: 250, maxLength: 350, cavities: 2 },
          { minLength: 350, maxLength: 10000, cavities: 1 },
        ];
      } else if (complexity === PartComplexity.Medium) {
        resultList = [
          { minLength: 0, maxLength: 100, cavities: 8 },
          { minLength: 100, maxLength: 250, cavities: 4 },
          { minLength: 250, maxLength: 350, cavities: 4 },
          { minLength: 350, maxLength: 10000, cavities: 1 },
        ];
      } else if (complexity === PartComplexity.High) {
        resultList = [
          { minLength: 0, maxLength: 100, cavities: 8 },
          { minLength: 100, maxLength: 250, cavities: 4 },
          { minLength: 250, maxLength: 350, cavities: 4 },
          { minLength: 350, maxLength: 10000, cavities: 2 },
        ];
      }
    } else if (annualVolume > 1000000) {
      if (complexity === PartComplexity.Low) {
        resultList = [
          { minLength: 0, maxLength: 100, cavities: 16 },
          { minLength: 100, maxLength: 250, cavities: 8 },
          { minLength: 250, maxLength: 350, cavities: 4 },
          { minLength: 350, maxLength: 10000, cavities: 2 },
        ];
      } else if ([PartComplexity.Medium, PartComplexity.High].includes(complexity)) {
        resultList = [
          { minLength: 0, maxLength: 100, cavities: 8 },
          { minLength: 100, maxLength: 250, cavities: 4 },
          { minLength: 250, maxLength: 350, cavities: 4 },
          { minLength: 350, maxLength: 10000, cavities: 2 },
        ];
      }
    }
    return resultList;
  }
  getCoolingTime() {
    let resultList: any[] = [];
    resultList = [
      { thickness: 0.5, coolingTime: 1 },
      { thickness: 1, coolingTime: 4 },
      { thickness: 1.5, coolingTime: 9 },
      { thickness: 2, coolingTime: 15 },
      { thickness: 2.5, coolingTime: 24 },
      { thickness: 3, coolingTime: 35 },
      { thickness: 3.5, coolingTime: 47 },
      { thickness: 4, coolingTime: 62 },
      { thickness: 4.5, coolingTime: 78 },
      { thickness: 5, coolingTime: 97 },
      { thickness: 5.5, coolingTime: 117 },
      { thickness: 6, coolingTime: 139 },
      { thickness: 6.5, coolingTime: 164 },
      { thickness: 7, coolingTime: 190 },
      { thickness: 7.5, coolingTime: 218 },
      { thickness: 8, coolingTime: 248 },
      { thickness: 8.5, coolingTime: 280 },
      { thickness: 9, coolingTime: 314 },
      { thickness: 9.5, coolingTime: 350 },
      { thickness: 10, coolingTime: 387 },
    ];
    return resultList;
  }

  getMaterialScrap(complexity: number) {
    let resultList: any[] = [];
    if (complexity === PartComplexity.Low) {
      resultList = [
        { minLength: 0, maxLength: 25, scrap: 6 },
        { minLength: 25, maxLength: 50, scrap: 5 },
        { minLength: 50, maxLength: 100, scrap: 5 },
        { minLength: 100, maxLength: 500, scrap: 4 },
        { minLength: 500, maxLength: 1000, scrap: 4 },
        { minLength: 1000, maxLength: 10000000, scrap: 3 },
      ];
    } else if (complexity === PartComplexity.Medium) {
      resultList = [
        { minLength: 0, maxLength: 25, scrap: 8 },
        { minLength: 25, maxLength: 50, scrap: 7 },
        { minLength: 50, maxLength: 100, scrap: 7 },
        { minLength: 100, maxLength: 500, scrap: 5 },
        { minLength: 500, maxLength: 1000, scrap: 5 },
        { minLength: 1000, maxLength: 10000000, scrap: 4 },
      ];
    } else if (complexity === PartComplexity.High) {
      resultList = [
        { minLength: 0, maxLength: 25, scrap: 10 },
        { minLength: 25, maxLength: 50, scrap: 8 },
        { minLength: 50, maxLength: 100, scrap: 8 },
        { minLength: 100, maxLength: 500, scrap: 8 },
        { minLength: 500, maxLength: 1000, scrap: 6 },
        { minLength: 1000, maxLength: 10000000, scrap: 4 },
      ];
    }
    return resultList;
  }

  getCompressionMoldingHardnessDuo(duro: number) {
    let list: any[] = [];
    list = [
      { duro: 10, cycleTime: 74 },
      { duro: 20, cycleTime: 87 },
      { duro: 30, cycleTime: 100 },
      { duro: 40, cycleTime: 114 },
      { duro: 50, cycleTime: 127 },
      { duro: 60, cycleTime: 140 },
      { duro: 70, cycleTime: 154 },
      { duro: 80, cycleTime: 167 },
      { duro: 90, cycleTime: 180 },
      { duro: 100, cycleTime: 194 },
    ];
    return list?.find((x) => x.duro == duro)?.cycleTime;
  }
}
