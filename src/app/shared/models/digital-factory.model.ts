export class DigitalFactoryDto {
  supplierId: number;
  supplierName: string;
  vendorName: string;
  country?: number;
  paymentTerms: number;
  incoterms: number;
  vmiType: number;
  anulSpendType: number;
  anulRevType: number;
  lastPriceNegoDt: Date;
  imputeRateOfInterest: number;
  rentRate: number;
  profitMargin: number;
  materialOverhead: number;
  factoryOverhead: number;
  sgAndA: number;
  carryingCostsForRawMaterial: number;
  carryingCostsForFinishedGoods: number;
  carryingCostsForPaymentTerms: number;
  numberOfShifts: number;
  hoursPerShift: number;
  workingDaysPerYear: number;
  totalBreaksPerShift: number;
  typeOfShop: number;
  laborType: number;
  perOfWorkforce: number;
  hourlyRate: number;
  powerSource: number;
  perOfTotalSupply: number;
  hourlyRateOfpS: number;
  esgImpact: number;
  dfLaborAssumptionsMasterDto: DFLaborAssumptionsMasterDto;
  dfPowerAssumptionsMasterDto: DFPowerAssumptionsMasterDto;
  dfMaterialCostMasterDtos: DFMaterialCostMasterDto[] = [];
  dfMachineCostMasterDtos: DFMachineCostMasterDto[] = [];
}
export class DFLaborAssumptionsMasterDto {
  id: number;
  supplierId: number;
  typeOfShop: number;
  laborType: number;
  perOfWorkforce: number;
  hourlyRate: number;
}
export class DFPowerAssumptionsMasterDto {
  id: number;
  supplierId: number;
  powerSource: number;
  perOfTotalSupply: number;
  hourlyRate: number;
  esgImpact: number;
}
export class DFMaterialCostMasterDto {
  id: number;
  supplierId: number;
  category: number;
  family: number;
  descriptionOrGrade: number;
  volumePurchased: number;
  volumeDiscount: number;
  materialPrice: number;
}
export class DFMachineCostMasterDto {
  id: number;
  supplierId: number;
  category: number;
  processGroup: number;
  machineName: number;
  investmentCost: number;
  installationCost: number;
  depreciation: number;
  machineUtilization: number;
  hourlyPowerUsage: number;
  powerUtilization: number;
  supplies: number;
  maintanence: number;
  machineOverheadRate: number;
  dynamiMachineOne: number;
  dynamicMachineTwo: number;
  dynamicMachineThree: number;
}
