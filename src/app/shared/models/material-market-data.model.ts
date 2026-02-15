import { MaterialMasterDto } from './material-master.model';

export class MaterialMarketDataDto {
  materialMarketId?: number;
  materialMasterId: number;
  countryId: number;
  price: number;
  marketQuarter?: string;
  marketMonth?: string;
  generalScrapPrice: number;
  machineScrapPrice: number;
  esgImpactCO2Kg: number;
  materialMaster: MaterialMasterDto;
  materialDescription: string;
}

export class MaterialPriceHistoryDto {
  timeStamp: number;
  price: number;
}
