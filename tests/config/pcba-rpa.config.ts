
import { PCBAMarketDataDto } from '../models/pcb-master..model';
import { BillOfMaterialDto, PartInfoDto } from '../models';

export class PCBRPAConfigService {
  constructor() { }

  isValidNumber(value: any): number {
    return !value || Number.isNaN(value) || !Number.isFinite(Number(value)) || value < 0 ? 0 : Number(Number(value)?.toFixed(4));
  }

  getDiscountBasedOnSubcategoryForMpn(info: PCBAMarketDataDto, vol: number) {
    const list = [
      { category: SubProcessTypes.Masselectricalcomponents, p1: 40, p2: 40, p3: 40, p4: 40, p5: 40, p6: 50, p7: 60, p8: 65, p9: 70, p10: 72.5, p11: 75, p12: 80, p13: 82.5 },
      { category: SubProcessTypes.PlainSemiconductorComponents, p1: 30, p2: 30, p3: 30, p4: 30, p5: 35, p6: 40, p7: 45, p8: 55, p9: 60, p10: 62.5, p11: 65, p12: 70, p13: 72.5 },
      { category: SubProcessTypes.ComplexSemiconductorComponents, p1: 18, p2: 20, p3: 23, p4: 28, p5: 33, p6: 38, p7: 43, p8: 50, p9: 55, p10: 57.5, p11: 60, p12: 62.5, p13: 65 },
      { category: SubProcessTypes.ElectromechanicalMiscellaneous, p1: 10, p2: 12, p3: 15, p4: 20, p5: 25, p6: 35, p7: 40, p8: 43, p9: 47, p10: 50, p11: 52.5, p12: 55, p13: 57.5 },
    ];
    const key = this.discountLimit(Number(vol));
    const percentage = list?.find((x) => x.category === info?.subCategories?.subCategoryTypeId);
    const pMap = {
      d1: percentage?.p1,
      d2: percentage?.p2,
      d3: percentage?.p3,
      d4: percentage?.p4,
      d5: percentage?.p5,
      d6: percentage?.p6,
      d7: percentage?.p7,
      d8: percentage?.p8,
      d9: percentage?.p9,
      d10: percentage?.p10,
      d11: percentage?.p11,
      d12: percentage?.p12,
      d13: percentage?.p13,
      d14: percentage?.p13,
    };
    const discountPerc = pMap[key] ?? 0;
    const discountValue = this.isValidNumber((info?.price * discountPerc) / 100);
    const valueAfterDisc = this.isValidNumber(info.price - discountValue);
    return valueAfterDisc;
  }

  discountLimit(vol: number) {
    const list = [
      { range: 'd1', from: 0, to: 99 },
      { range: 'd2', from: 99, to: 999 },
      { range: 'd3', from: 999, to: 4999 },
      { range: 'd4', from: 4999, to: 19999 },
      { range: 'd5', from: 19999, to: 99999 },
      { range: 'd6', from: 99999, to: 499999 },
      { range: 'd7', from: 499999, to: 749999 },
      { range: 'd8', from: 749999, to: 1000000 },
      { range: 'd9', from: 1000000, to: 1999999 },
      { range: 'd10', from: 1999999, to: 4999999 },
      { range: 'd11', from: 4999999, to: 9999999 },
      { range: 'd12', from: 9999999, to: 19999999 },
      { range: 'd13', from: 19999999, to: 20000000 },
    ];
    return list.find((item) => vol >= item?.from && vol <= item?.to)?.range;
  }

  getMPNs(billOfMaterialPartInfos: BillOfMaterialDto[]) {
    const mpnValues = [];
    billOfMaterialPartInfos.forEach((part) => {
      if (part.mpn && part.currentCost <= 0) {
        mpnValues.push({ MPN: part?.mpn?.trim()?.toUpperCase(), Quantity: part?.partQty, TotalRequirement: part?.globalAnnualVolume || part?.totalSubPartQty, UnitOfMeasure: part?.unitOfMeasure });
      }
    });
    const distinctMpnValues = [...new Set(mpnValues)];
    return distinctMpnValues;
  }

  getMPNForRecalculate(billOfMaterials: BillOfMaterialDto[], annualVolume: number) {
    const mpnValues = [];
    billOfMaterials.forEach((item) => {
      mpnValues.push({ MPN: item?.mpn?.trim()?.toUpperCase(), Quantity: item?.partQty, TotalRequirement: annualVolume * item?.partQty, UnitOfMeasure: item?.unitOfMeasure });
    });
    const distinctMpnValues = [...new Set(mpnValues)];
    return distinctMpnValues;
  }

  getList(partInfoList: PartInfoDto[]) {
    const listWithShouldCost: any[] = [];
    const listWithOutShouldCost: any[] = [];
    partInfoList
      .flatMap((item) => item.billOfMaterialPartInfos)
      .forEach((part) => {
        part.rpaCallRequired = part.currentCost > 0 ? false : true;
        if (part.currentCost > 0) {
          listWithShouldCost.push(part);
        } else {
          listWithOutShouldCost.push(part);
        }
      });
    return { listWithShouldCost, listWithOutShouldCost };
  }

  getBOMDetailsByMPN(billOfMaterialPartInfos: BillOfMaterialDto[], mpn: string) {
    const mpnValues = [];
    billOfMaterialPartInfos.forEach((part) => {
      if (part.mpn === mpn) {
        mpnValues.push(part);
      }
    });
    return mpnValues[0];
  }

  getCostForManualCostEntries(partInfoList: PartInfoDto[]) {
    Object.keys(partInfoList).forEach((key) => {
      const partInfos: BillOfMaterialDto[] = partInfoList[key].billOfMaterialPartInfos;
      partInfos.forEach((item) => {
        item.extendedCost = Number(item.currentCost) * Number(item.partQty);
        item.savingOpp = Number(item.targetCost) - Number(item.currentCost);
        item.annualVolume = Number(partInfoList[0].eav) * Number(item.partQty);
        item.annualSavingOpp = Number(item.savingOpp) * Number(item.annualVolume);
        item.shouldCost = item.currentCost;
      });
    });
    return partInfoList;
  }

  setUpdatedValueForManualCostEntries(partInfoList: PartInfoDto[]) {
    const partsWithCost = this.getCostForManualCostEntries(partInfoList);
    if (partInfoList?.length > 0) {
      partInfoList[1]?.billOfMaterialPartInfos?.forEach((item) => {
        partsWithCost[1]?.billOfMaterialPartInfos?.forEach((costed) => {
          if (!item.rpaCallRequired && item.mpn === costed.mpn) {
            item = costed;
          }
        });
      });
    }
    return partInfoList;
  }

  getCountryWiseDiscount(mfrCountryId: number) {
    const countries = [
      { countryid: 1, countryname: 'India', discount: 1.09 },
      { countryid: 2, countryname: 'China', discount: 1 },
      { countryid: 3, countryname: 'Malaysia', discount: 1.06 },
      { countryid: 4, countryname: 'Mexico', discount: 1.12 },
      { countryid: 5, countryname: 'USA', discount: 1.24 },
      { countryid: 6, countryname: 'Canada', discount: 1.24 },
      { countryid: 7, countryname: 'Germany', discount: 1.24 },
      { countryid: 8, countryname: 'Czech Republic', discount: 1.18 },
      { countryid: 9, countryname: 'Romania', discount: 1.18 },
      { countryid: 10, countryname: 'France', discount: 1.24 },
      { countryid: 11, countryname: 'Japan', discount: 1.24 },
      { countryid: 12, countryname: 'Italy', discount: 1.24 },
      { countryid: 13, countryname: 'Poland', discount: 1.18 },
      { countryid: 14, countryname: 'Belgium', discount: 1.24 },
      { countryid: 15, countryname: 'Bulgaria', discount: 1.18 },
      { countryid: 16, countryname: 'Hungary', discount: 1.18 },
      { countryid: 17, countryname: 'Ireland', discount: 1.24 },
      { countryid: 18, countryname: 'Australia', discount: 1.3 },
      { countryid: 19, countryname: 'New Zealand', discount: 1.36 },
      { countryid: 20, countryname: 'Netherlands', discount: 1.24 },
      { countryid: 21, countryname: 'Hong Kong', discount: 1.09 },
      { countryid: 22, countryname: 'South Korea', discount: 1.12 },
      { countryid: 23, countryname: 'Taiwan', discount: 1.03 },
      { countryid: 24, countryname: 'Thailand', discount: 1.06 },
      { countryid: 25, countryname: 'Russia', discount: 1.18 },
      { countryid: 26, countryname: 'Slovakia', discount: 1.18 },
      { countryid: 27, countryname: 'Slovenia', discount: 1.18 },
      { countryid: 28, countryname: 'Spain', discount: 1.21 },
      { countryid: 29, countryname: 'Turkey', discount: 1.15 },
      { countryid: 30, countryname: 'United Kingdom', discount: 1.24 },
      { countryid: 31, countryname: 'Brazil', discount: 1.18 },
      { countryid: 32, countryname: 'Argentina', discount: 1.21 },
      { countryid: 33, countryname: 'Albania', discount: 1.18 },
      { countryid: 34, countryname: 'Greece', discount: 1.24 },
      { countryid: 35, countryname: 'Singapore', discount: 1.12 },
      { countryid: 36, countryname: 'Switzerland', discount: 1.3 },
      { countryid: 37, countryname: 'Indonesia', discount: 1.12 },
      { countryid: 38, countryname: 'Portugal', discount: 1.21 },
      { countryid: 39, countryname: 'Philippines', discount: 1.12 },
      { countryid: 40, countryname: 'Tunisia', discount: 1.18 },
      { countryid: 41, countryname: 'Serbia', discount: 1.18 },
      { countryid: 42, countryname: 'Vietnam', discount: 1.03 },
      { countryid: 43, countryname: 'UAE', discount: 1.18 },
      { countryid: 44, countryname: 'Austria', discount: 1.24 },
      { countryid: 45, countryname: 'Egypt', discount: 1.18 },
      { countryid: 46, countryname: 'Denmark', discount: 1.3 },
      { countryid: 47, countryname: 'Morocco', discount: 1.18 },
      { countryid: 48, countryname: 'Bosnia', discount: 1.18 },
      { countryid: 49, countryname: 'Sri Lanka', discount: 1.12 },
      { countryid: 50, countryname: 'Sweden', discount: 1.3 },
      { countryid: 51, countryname: 'Saudi Arabia', discount: 1.18 },
      { countryid: 52, countryname: 'South Africa', discount: 1.21 },
      { countryid: 53, countryname: 'Norway', discount: 1.3 },
      { countryid: 54, countryname: 'Bangladesh', discount: 1.12 },
      { countryid: 55, countryname: 'Pakistan', discount: 1.12 },
      { countryid: 56, countryname: 'Finland', discount: 1.3 },
      { countryid: 57, countryname: 'Colombia', discount: 1.18 },
      { countryid: 58, countryname: 'Uzbekistan', discount: 1.18 },
      { countryid: 59, countryname: 'Ukraine', discount: 1.18 },
      { countryid: 60, countryname: 'Chile', discount: 1.18 },
      { countryid: 61, countryname: 'Israel', discount: 1.24 },
      { countryid: 62, countryname: 'Nigeria', discount: 1.24 },
      { countryid: 63, countryname: 'Ecuador', discount: 1.18 },
      { countryid: 64, countryname: 'Ethiopia', discount: 1.24 },
      { countryid: 65, countryname: 'Peru', discount: 1.18 },
      { countryid: 66, countryname: 'Belarus', discount: 1.18 },
      { countryid: 67, countryname: 'Georgia', discount: 1.18 },
      { countryid: 68, countryname: 'Algeria', discount: 1.18 },
      { countryid: 69, countryname: 'Lithuania', discount: 1.12 },
      { countryid: 70, countryname: 'Estonia', discount: 1.18 },
    ];
    return countries?.find((x) => x.countryid === mfrCountryId)?.discount;
  }
}

export enum SubProcessTypes {
  Masselectricalcomponents = 1,
  PlainSemiconductorComponents = 2,
  ComplexSemiconductorComponents = 3,
  ElectromechanicalMiscellaneous = 4,
}

export interface StackupRow {
  label: string;
  color: 'red' | 'green' | 'grey';
  value: number | string;
}
