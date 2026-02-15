export interface TariffBreakDownRequest {
  data: TariffRequestData;
}

export interface TariffRequestData {
  exportCountryCode: string;
  importCountryCode: string;
  importStateCode: string;
  inputCurrencyCode: string;
  description: string;
  shippingCost: number;
  insuranceCost: number;
  modeOfTransport: string;
  importType: string;
  lineItems: LineItem[];
}

export interface LineItem {
  originCountryCode: string;
  certificateOfOrigin: boolean;
  unitPrice: number;
  quantity: number;
  productTitle: string;
  productClassificationId: number;
  productClassificationHs: string;
  productClassificationHsCountryCode: string;
  measurements: Measurement[];
}

export interface Measurement {
  unitName: string;
  value: number;
}
