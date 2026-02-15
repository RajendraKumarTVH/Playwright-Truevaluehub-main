export interface AddMachineModel {
  processTypeId: string;
  machineTypeId: string;
  mcAutomationName: string;
  recommandedSelectedTongue: string;
  recommandedSelected: string;
  machineCycleTime: string;
  machineDirectOfLabors: string;
  machineSkillLabors: string;
  machineNetProcessCost: string;
  moldClosing: string;
  insertsPlacement: string;
  materialInjection: string;
  moldRotation: string;
  materialCooling: string;
  sideCoreMachinisam: string;
  moldOpening: string;
  partEjection: string;
  othersIfany: string;
  setUpTime: string;
  inspectionTime: string;
  yield: string;
  machineHourRate: string;
  machineCost: string;
  setUpCost: string;
  labourCost: string;
  InspectionCost: string;
  yieldCost: string;
  partId: string;
  processNumber: number;
}
export interface AddPurchaseCatalogModel {
  partDescription: string;
  reference: string;
  partCost: string;
  qty: string;
  partId: string;
  partNumber: string;
}

export interface MachineDataModel {
  processTypeId: string;
  machineTypeId: string;
  mcAutomationName: string;
  recommandedSelectedTongue: string;
  recommandedSelected: string;
  machineCycleTime: string;
  machineDirectOfLabors: string;
  machineSkillLabors: string;
  machineNetProcessCost: string;
  moldClosing: string;
  insertsPlacement: string;
  materialInjection: string;
  moldRotation: string;
  materialCooling: string;
  sideCoreMachinisam: string;
  moldOpening: string;
  partEjection: string;
  othersIfany: string;
  setUpTime: string;
  inspectionTime: string;
  yield: string;
  machineHourRate: string;
  machineCost: string;
  setUpCost: string;
  labourCost: string;
  InspectionCost: string;
  yieldCost: string;
  partId: string;
  mhr: string;
  setuphr: string;
  processNumber: number;
}

export interface AddCostSummaryModel {
  materialCostAmount: string;
  materialCostPercentage: string;
  manufacturingCostAmount: string;
  manufacturingCostPercentage: string;
  unitPartCostAmount: string;
  unitPartCostPercentage: string;
  iCCAmount: string;
  iCCPercentage: string;
  materialOHAmount: string;
  materialOHPercentage: string;
  factoryOHAmount: string;
  factoryOHPercentage: string;
  sGandAAmount: string;
  sGandAPercentage: string;
  profitAmount: string;
  profitPercentage: string;
  paymentTermsAmount: string;
  paymentTermsPercentage: string;
  finishPartICCAmount: string;
  finishPartICCpercentage: string;
  verheadandProfitAmount: string;
  overheadandProfitPercentage: string;
  eXWPartCostAmount: string;
  eXWPartCostPercentage: string;
  packingCostAmount: string;
  packingCostPercentage: string;
  frieghtCostAmount: string;
  frieghtCosttPercentage: string;
  dutiesandTariffAmount: string;
  currentCost: string;
  shouldCostAmount: string;
  shouldCostPercentage: string;
  currentSpend: string;
  shouldCostSpend: string;
  opportunityAmount: string;
  opportunityPercentage: string;
}

export interface RefreshCostSummaryModel {
  partId: string;
  iccPercentage: string;
  materialOHPercentage: string;
  factoryOHPercentage: string;
  sgAndPercentage: string;
  profitPercentage: string;
  paymentTermsPercentage: string;
}
