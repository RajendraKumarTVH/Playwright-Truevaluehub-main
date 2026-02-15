export class SimulationTotalCostDto {
  simulationTotalCostId: number;
  partInfoId: number;
  projectInfoId: number;
  countryId: number;
  mfrCountryId: number;
  countryName: string;
  materialTotalCost: number;
  processTotalCost: number;
  toolingTotalCost: number;
  toolingAmortizationCost: number;
  secProcessTotalCost: number;
  purchaseTotalCost: number;
  packagingTotalCost: number;
  logisticsTotalCost?: number;
  OHPTotalCost?: number;
  totalCost?: number;
  totalESGManufacturing?: number;
  totalESGMaterial?: number;
  totalESGPackaging?: number;
  totalESGLogistics?: number;
  totalCostESG?: number;
  selectedCountriesCount: number;
}

export class BestProcessTotalCostDto {
  projectInfoId: number;
  partInfoId: number;
  countryId: number;
  countryName: string;
  processId: number;
  processName?: string;
  processTypeId: number;
  processType: string;
  processEsg: number;
  processCost: number;
  materialCost: number;
  materialEsg: number;
  packagingCost: number;
  packagingEsg: number;
  toolingCost: number;
  amortizationCost: number;
  logisticsCost: number;
  logisticsEsg: number;
  ohpCost: number;
  totalCost?: number;
  totalCostEsg?: number;
}

export class ListSimulationTotalCostDto {
  SimulationTotalCostDtos?: SimulationTotalCostDto[] = [];
  bestProcessCostDtos?: BestProcessTotalCostDto[] = [];
}
