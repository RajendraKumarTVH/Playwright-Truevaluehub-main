export class MedbFgiccMasterDto {
  fgiccId: number = 0;
  countryId: number = 0;
  volumeCategory: string = '';
  supplyDescription: string = '';
  domestic: number = 0;
  export: number = 0;
}

export class MedbIccMasterDto {
  iccId: number = 0;
  countryId: number = 0;
  volumeCategory: string = '';
  iccPercentage: number = 0;
}

export class MedbOverHeadProfitDto {
  overHeadProfitId: number = 0;
  countryId: number = 0;
  overHeadProfitType: string = '';
  categoryA: number = 0;
  categoryB: number = 0;
  volumeCategory: string = '';
}

export class MedbPaymentMasterDto {
  paymentMasterId: number = 0;
  countryId: number = 0;
  paymentTermId: number = 0;
  value: number = 0;
}

export class CostOverHeadProfitDto {
  costOverHeadProfitId: number = 0;
  partInfoId: number = 0;
  toolingId: number | null = null;
  iccPer: number = 0;
  iccCost: number = 0;
  mohPer: number = 0;
  mohCost: number = 0;
  fohPer: number = 0;
  fohCost: number = 0;
  sgaPer: number = 0;
  sgaCost: number = 0;
  materialProfitPer: number = 0;
  processProfitPer: number = 0;
  profitCost: number = 0;
  paymentTermsPer: number = 0;
  paymentTermsCost: number = 0;
  fgiccPer: number = 0;
  fgiccCost: number = 0;
  warrentyPer: number = 0;
  warrentyCost: number = 0;
  dataCompletionPercentage: number = 0;

  InventoryCarryingAmount: number = 0;
  CostOfCapitalAmount: number = 0;
  OverheadandProfitAmount: number = 0;

  isIccPerDirty: boolean = false;
  isMohPerDirty: boolean = false;
  isPaymentTermsPerDirty: boolean = false;
  isFohPerDirty: boolean = false;
  isSgaPerDirty: boolean = false;
  isFgiccPerDirty: boolean = false;
  isMaterialProfitPerDirty: boolean = false;
  isProcessProfitPerDirty: boolean = false;
  isWarrentyPercentageDirty: boolean = false;
}

export interface ISupplierInfoOverHeadValues {
  iccPer: string | number;
  mohPer: string | number;
  fohPer: string | number;
  sgaPer: string | number;
  paymentTermsPer: string | number;
  fgiccPer: string | number;
  materialProfitPer: string | number;
  processProfitPer: string | number;
  profitCost: string | number;
}

export interface SupplierOverHeadResult {
  supplierInfoOverHeadValues: ISupplierInfoOverHeadValues;
  costOverHeadProfit: CostOverHeadProfitDto;
}
