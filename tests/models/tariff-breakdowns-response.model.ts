export interface TariffBreakDownResponse {
  id: number;
  htsCode: string;
  exportCountryCode?: string;
  importCountryCode?: string;
  importState?: string;
  importType?: string;
  modeOfTransport?: string;
  currencyCode?: string;
  exciseTotalPercent?: number;
  handlingFeeTotalPercent?: number;
  salesTaxTotalPercent?: number;
  additionalTaxAndChargesTotalPercent?: number;
  createDate: string;
  isActive: boolean;
  tariffBreakDown: TariffBreakDown;
  calculationNotes: CalculationNote[];
  item: Item;
  dutifyTariffExtractions: DutifyTariffExtractions[];
}

export interface DutifyTariffExtractions {
  id: number;
  dutifyTariffBreakDownId: number;
  description: string;
  percentage: number;
  amount: number;
  category: string;
  noteId: string;
}
export interface TariffBreakDown {
  description: string;
  exportCountryName: string;
  importCountryName: string;
  importState: string;
  importType: string;
  modeOfTransport: string;
  currencyCode: string;
  shippingTotal: string;
  insuranceTotal: string;
  dutyTotal: string;
  exciseTotal: string;
  handlingFeeTotal: string;
  salesTaxTotal: string;
  additionalTaxAndChargesTotal: string;
  combinedDutiesTotal: string;
  landedCostTotal: string;
}

export interface CalculationNote {
  note: string;
  category: string;
}

export interface Item {
  originCountryName: string;
  certificateOfOrigin: boolean;
  productTitle: string;
  productClassificationName: string;
  hsCode: string;
  itemQuantity: number;
  currencyCode: string;
  itemValue: string;
  totalValue: string;
}
