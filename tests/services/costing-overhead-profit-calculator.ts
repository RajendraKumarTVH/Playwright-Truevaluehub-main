import { ViewCostSummaryDto } from '../models/cost-summary.model';
import { CostOverHeadProfitDto, MedbFgiccMasterDto, MedbIccMasterDto, MedbOverHeadProfitDto, MedbPaymentMasterDto } from '../models/overhead-Profit.model';
import { FormDataModel } from '../models/simulation/costingOverHeadProfit-Simulation.model';
import { FieldColorsDto } from '../models/field-colors.model';
import { SharedService } from './shared';
import { CommodityType } from '../utils/constants';

export class CostingOverheadProfitCalculatorService {
  paymentTermsMaster() {
    const data = new Map<number, number>();
    data.set(1, 30);
    data.set(2, 45);
    data.set(3, 60);
    data.set(4, 75);
    data.set(5, 90);
    data.set(6, 120);
    data.set(7, 15);
    data.set(8, 150);
    data.set(9, 180);
    return data;
  }
  constructor(private sharedService: SharedService) { }
  calculateOverheadCost(
    costSummaryViewData: ViewCostSummaryDto,
    medbFgiccMasterList: MedbFgiccMasterDto,
    medbIccMasterList: MedbIccMasterDto,
    medbPaymentList: MedbPaymentMasterDto,
    medbMohList: MedbOverHeadProfitDto,
    medbFohList: MedbOverHeadProfitDto,
    medbSgaList: MedbOverHeadProfitDto,
    medbProfitList: MedbOverHeadProfitDto,
    dirtyList: FieldColorsDto[],
    costingOverHeadProfit: CostOverHeadProfitDto,
    ovhObj: CostOverHeadProfitDto
  ) {
    if (costSummaryViewData) {
      if (costingOverHeadProfit?.isFgiccPerDirty && costingOverHeadProfit?.fgiccPer != null) {
        costingOverHeadProfit.fgiccPer = Number(costingOverHeadProfit.fgiccPer);
      } else {
        let calPerc = this.sharedService.isValidNumber(medbFgiccMasterList?.export * 100);
        if (costingOverHeadProfit?.fgiccPer != null) {
          calPerc = this.checkDirtyProperty('fgiccPer', dirtyList) ? ovhObj.fgiccPer : calPerc;
        }
        costingOverHeadProfit.fgiccPer = calPerc;
      }

      if (costingOverHeadProfit?.isIccPerDirty && costingOverHeadProfit?.iccPer != null) {
        costingOverHeadProfit.iccPer = Number(costingOverHeadProfit.iccPer);
      } else {
        let calPerc = this.sharedService.isValidNumber(medbIccMasterList?.iccPercentage * 100);
        if (costingOverHeadProfit?.iccPer != null) {
          calPerc = this.checkDirtyProperty('iccPer', dirtyList) ? ovhObj.iccPer : calPerc;
        }
        costingOverHeadProfit.iccPer = calPerc;
      }

      if (costingOverHeadProfit?.isPaymentTermsPerDirty && costingOverHeadProfit?.paymentTermsPer != null) {
        costingOverHeadProfit.paymentTermsPer = Number(costingOverHeadProfit.paymentTermsPer);
      } else {
        let calPerc = this.sharedService.isValidNumber(medbPaymentList?.value * 100);
        if (costingOverHeadProfit?.paymentTermsPer != null) {
          calPerc = this.checkDirtyProperty('paymentTermsPer', dirtyList) ? ovhObj.paymentTermsPer : calPerc;
        }
        costingOverHeadProfit.paymentTermsPer = calPerc;
      }

      if (costingOverHeadProfit?.isMohPerDirty && costingOverHeadProfit?.mohPer != null) {
        costingOverHeadProfit.mohPer = Number(costingOverHeadProfit.mohPer);
      } else {
        let calPerc = this.sharedService.isValidNumber(medbMohList?.categoryA * 100);
        if (costingOverHeadProfit?.mohPer != null) {
          calPerc = this.checkDirtyProperty('mohPer', dirtyList) ? ovhObj.mohPer : calPerc;
        }
        costingOverHeadProfit.mohPer = calPerc;
      }

      if (costingOverHeadProfit?.isFohPerDirty && costingOverHeadProfit?.fohPer != null) {
        costingOverHeadProfit.fohPer = Number(costingOverHeadProfit.fohPer);
      } else {
        let calPerc = this.sharedService.isValidNumber(medbFohList?.categoryA * 100);
        if (costingOverHeadProfit?.fohPer != null) {
          calPerc = this.checkDirtyProperty('fohPer', dirtyList) ? ovhObj.fohPer : calPerc;
        }
        costingOverHeadProfit.fohPer = calPerc;
      }

      if (costingOverHeadProfit?.isSgaPerDirty && costingOverHeadProfit?.sgaPer != null) {
        costingOverHeadProfit.sgaPer = Number(costingOverHeadProfit.sgaPer);
      } else {
        let calPerc = this.sharedService.isValidNumber(medbSgaList?.categoryA * 100);
        if (costingOverHeadProfit?.sgaPer != null) {
          calPerc = this.checkDirtyProperty('sgaPer', dirtyList) ? ovhObj.sgaPer : calPerc;
        }
        costingOverHeadProfit.sgaPer = calPerc;
      }

      if (costingOverHeadProfit?.isMaterialProfitPerDirty && costingOverHeadProfit?.materialProfitPer != null) {
        costingOverHeadProfit.materialProfitPer = Number(costingOverHeadProfit.materialProfitPer);
      } else {
        let calPerc = this.sharedService.isValidNumber(medbProfitList?.categoryA * 100);
        if (costingOverHeadProfit?.materialProfitPer != null) {
          calPerc = this.checkDirtyProperty('materialProfitPer', dirtyList) ? ovhObj.materialProfitPer : calPerc;
        }
        costingOverHeadProfit.materialProfitPer = calPerc;
      }
      if (costingOverHeadProfit?.isProcessProfitPerDirty && costingOverHeadProfit?.processProfitPer != null) {
        costingOverHeadProfit.processProfitPer = Number(costingOverHeadProfit.processProfitPer);
      } else {
        let calPerc = this.sharedService.isValidNumber(medbProfitList?.categoryA * 100);
        if (costingOverHeadProfit?.processProfitPer != null) {
          calPerc = this.checkDirtyProperty('processProfitPer', dirtyList) ? ovhObj.processProfitPer : calPerc;
        }
        costingOverHeadProfit.processProfitPer = calPerc;
      }
    }
    return costingOverHeadProfit;
  }

  getAndSetData(costSummaryViewData: ViewCostSummaryDto, annualVolume: number, lotSize: number, paymentTermId: number, getCostingOverHeadProfit: CostOverHeadProfitDto, commodityId: number) {
    const costingOverHeadProfit = new CostOverHeadProfitDto();
    const materialCostMap: { [key: number]: number } = {
      [CommodityType.WiringHarness]: this.sharedService.isValidNumber(costSummaryViewData?.sumNetMatCost) + this.sharedService.isValidNumber(costSummaryViewData?.sumBillOfMaterial),
      [CommodityType.Electronics]: this.sharedService.isValidNumber(costSummaryViewData?.sumBillOfMaterial),
    };
    const materialCost = materialCostMap[commodityId] ?? this.sharedService.isValidNumber(costSummaryViewData?.sumNetMatCost);

    const rawMaterialCost = ((materialCost * (getCostingOverHeadProfit.iccPer / 100)) / 365) * (annualVolume / lotSize) || 0;
    costingOverHeadProfit.iccCost = rawMaterialCost;

    const eXWPartCostAmount =
      Number(materialCost) +
      Number(costSummaryViewData?.sumNetProcessCost) +

      this.sharedService.isValidNumber(costSummaryViewData?.toolingCost);
    const finishGoodCost = (((getCostingOverHeadProfit.fgiccPer / 100) * eXWPartCostAmount) / 365) * (annualVolume / lotSize);

    costingOverHeadProfit.fgiccCost = finishGoodCost;
    const paymentDays = this.paymentTermsMaster();

    const paymentTerms = (((getCostingOverHeadProfit.paymentTermsPer / 100) * eXWPartCostAmount) / 365) * ((paymentDays.get(paymentTermId) ?? 30) - 30) || 0;
    costingOverHeadProfit.paymentTermsCost = paymentTerms || 0;

    const inventoryCarryingCost = rawMaterialCost + finishGoodCost;
    costingOverHeadProfit.InventoryCarryingAmount = inventoryCarryingCost;

    const costOfCapital = inventoryCarryingCost + paymentTerms;
    costingOverHeadProfit.CostOfCapitalAmount = costOfCapital;

    const materialOverHeadCost = (getCostingOverHeadProfit.mohPer / 100) * materialCost || 0;
    costingOverHeadProfit.mohCost = materialOverHeadCost;

    const factoryOverHeadCost = (getCostingOverHeadProfit.fohPer / 100) * Number(costSummaryViewData?.sumNetProcessCost);
    costingOverHeadProfit.fohCost = factoryOverHeadCost;

    const eXCostAmount = Number(materialCost) + Number(costSummaryViewData?.sumNetProcessCost) || 0;

    const SGACost = (getCostingOverHeadProfit.sgaPer / 100) * eXCostAmount || 0;
    costingOverHeadProfit.sgaCost = SGACost;

    const overHeadCost = materialOverHeadCost + factoryOverHeadCost + SGACost;
    costingOverHeadProfit.OverheadandProfitAmount = overHeadCost;

    const profit = (getCostingOverHeadProfit.materialProfitPer / 100) * Number(materialCost) + (getCostingOverHeadProfit.processProfitPer / 100) * Number(costSummaryViewData?.sumNetProcessCost);
    costingOverHeadProfit.profitCost = profit;

    return costingOverHeadProfit;
  }

  setFormData(costOverHeadProfitobj: CostOverHeadProfitDto) {
    const formDataModel = new FormDataModel();
    formDataModel.total =
      this.sharedService.isValidNumber(costOverHeadProfitobj?.mohCost || 0) +
      this.sharedService.isValidNumber(costOverHeadProfitobj?.fohCost || 0) +
      this.sharedService.isValidNumber(costOverHeadProfitobj?.sgaCost || 0);
    formDataModel.costOfCapitalAmount = (costOverHeadProfitobj?.iccCost || 0) + (costOverHeadProfitobj?.fgiccCost || 0) + (costOverHeadProfitobj?.paymentTermsCost || 0);
    formDataModel.inventoryCarryingAmount = (costOverHeadProfitobj?.iccCost || 0) + (costOverHeadProfitobj?.fgiccCost || 0);

    return formDataModel;
  }

  private checkDirtyProperty(formCotrolName: string, fieldList: any[]) {
    let res = false;
    if (fieldList) {
      const info = fieldList.filter((x) => x.formControlName == formCotrolName && x.isDirty == true);
      if (info.length > 0) {
        res = true;
      }
    }
    return res;
  }
}
