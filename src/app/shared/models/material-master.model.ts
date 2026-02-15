import { MaterialMarketDataDto } from './material-market-data.model';
import { MaterialTypeDto } from './material-type.model';

export class StockFormDto {
  stockFormId: number;
  formName: string;
}
export class CountryFormMatrixDto {
  countryFormMatrixId: number;
  stockFormId: number;
  countryId: number;
  multiplier: number;
}
export class UserGroupDto {
  userGroupId: number;
  userId: number;
  commodityId: number;
  isDeleted: number;
}
export class StockFormCategoriesDto {
  materialGroup: string;
  materialType: string;
  materialTypeId: number;
  materialGroupId: number;
}

export class MaterialCompositionDto {
  materialCompositionId: number;
  materialMasterId: number;
  compositionDescription: string;
  min: number;
  max: number;
}
export class MaterialMasterDto {
  materialMasterId: number;
  originCountryId: number;
  materialTypeId: number;
  stockForm?: string;
  materialGroup?: string;
  materialDescription?: string;
  colorantOrPreCoated: boolean;
  moqkgs?: string;
  manufacturers?: string;
  density: number;
  iampdm2: number;
  egAmph: number;
  yield: number;
  thermalDiffusivity: number;
  ejectDeflectionTemp: number;
  meltingTemp: number;
  moldTemp: number;
  uom?: string;
  materialPriceReference?: string;
  tensileStrength: number;
  shearingStrength: number;
  generalizedHscode?: string;
  materialMarketData: MaterialMarketDataDto[];
  materialType: MaterialTypeDto;
  materialTypeName?: string;
  argonGasCost: number;
  co2GasCost: number;
  finalTemperature?: number;
  soakingTime?: number;
  strengthCoEfficient?: number;
  strainHardeningExponent?: number;
  yieldStrength?: number;
  fetchPower?: number;
  materialMeltPower?: number;
  clampingPressure?: number;
  injectionTemp?: number;
  liquidTemp?: number;
  coolingFactor?: number;
  injectionRate?: number;

  oneMTDiscount?: number;
  twentyFiveMTDiscount?: number;
  fiftyMTDiscount?: number;
  avgLotSize?: number;
  sandCost?: number = 0;
  stockForms?: StockFormDto[];
  forgingTemp?: number;
}
