export enum CurrencyTypeEnum {
  AUD = 1,
  BZR,
  CAD,
  CHF,
  CNY,
  EUR,
  GBP,
  HKD,
  INR,
  JPY,
  NZD,
  SEK,
  USD,
  ZAR,
}

export enum AnnualRevenueTypeEnum {
  LT5M = 1,
  FIVEMTO25M,
  TWENTYFIVEMTO100M,
  MT100M,
}

export enum UnitTypesEnum {
  Imperial = 1,
  Metric,
}

export enum VmiTypesEnum {
  VMI = 1,
  Consignment,
  MinMax,
  Kanban,
  None,
}

export enum IncotermsEnum {
  CFR = 1,
  CIF,
  CIP,
  CPT,
  DAP,
  DDP,
  DPU,
  EXW,
  FAS,
  FCA,
  FOB,
  NA,
}

export const CurrencyTypeNameMap = new Map<number, string>([
  [CurrencyTypeEnum.AUD, 'Australian Dollar'],
  [CurrencyTypeEnum.BZR, 'Brazilian Real'],
  [CurrencyTypeEnum.CAD, 'Canadian Dollar'],
  [CurrencyTypeEnum.CHF, 'Swiss Franc'],
  [CurrencyTypeEnum.CNY, 'China Yuan Renminbi'],
  [CurrencyTypeEnum.EUR, 'Euro'],
  [CurrencyTypeEnum.GBP, 'Great British Pound'],
  [CurrencyTypeEnum.HKD, 'Hong Kong Dollar'],
  [CurrencyTypeEnum.INR, 'Indian Rupee'],
  [CurrencyTypeEnum.JPY, 'Japanese Yen'],
  [CurrencyTypeEnum.NZD, 'New Zealand Dollar'],
  [CurrencyTypeEnum.SEK, 'Swedish Krona'],
  [CurrencyTypeEnum.USD, 'U.S. Dollar'],
  [CurrencyTypeEnum.ZAR, 'South African Rand'],
]);

export const AnnualRevenueTypeNameMap = new Map<number, string>([
  [AnnualRevenueTypeEnum.LT5M, 'Less than $5m USD'],
  [AnnualRevenueTypeEnum.FIVEMTO25M, '$5m USD - $25m USD'],
  [AnnualRevenueTypeEnum.TWENTYFIVEMTO100M, '$25m USD - $100m USD'],
  [AnnualRevenueTypeEnum.MT100M, 'More than $100m USD'],
]);

export const UnitTypesEnumNameMap = new Map<number, string>([
  [UnitTypesEnum.Imperial, 'Imperial'],
  [UnitTypesEnum.Metric, 'Metric'],
]);

export const VmiTypesEnumNameMap = new Map<number, string>([
  [VmiTypesEnum.VMI, 'Vendor-Managed Inventory'],
  [VmiTypesEnum.Consignment, 'Consignment'],
  [VmiTypesEnum.Kanban, 'Kanban'],
  [VmiTypesEnum.MinMax, 'Min-Max'],
  [VmiTypesEnum.None, 'None'],
]);
