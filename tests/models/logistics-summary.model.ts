import { DigitalFactoryDtoNew } from 'src/app/modules/digital-factory/Models/digital-factory-dto';
import { BuLocationDto } from './bu-location.model';
import { ContainerSize } from './container-size.model';
import { FreightCostResponseDto, ViewFreightRoute } from './freight-cost-response';
import { MaterialInfoDto } from './material-info.model';
import { PackagingInfoDto } from './packaging-info.model';
import { PartInfoDto } from './part-info.model';

export class LogisticsSummaryDto {
  costingLogisticsId: number;
  partInfoId: number;
  originCountryId: number;
  destinationCountryId: number;
  modeOfTransport: number;
  shipmentType: number;
  containerType: number;
  originSurfaceKm: number = 0;
  destinationSurfaceKm: number = 0;
  partsPerPallet: number = 0;
  palletsPerContainer: number = 0;
  partsPerContainer: number = 0;
  containerCost: number = 0;
  freightCost: number = 0;
  carbonFootPrint: number = 0;
  freightCostPerShipment: number = 0;
  containerPercent: number = 0;
  totalCarbonFootPrint: number = 0;
  carbonFootPrintPerUnit: number = 0;
  pickUpCost: number = 0;
  portCost: number = 0;
  deliveryCost: number = 0;
  pickUpCo2: number = 0;
  portCo2: number = 0;
  deliveryCo2: number = 0;
  dataCompletionPercentage: number;
  route?: ViewFreightRoute[];

  isContainerCostDirty: boolean = false;
  isContainerPercentDirty: boolean = false;
  isFreightCostPerShipmentDirty: boolean = false;
  isFreightCostDirty: boolean = false;
  isTotalCarbonFootPrintDirty: boolean = false;
  isCarbonFootPrintDirty: boolean = false;
  isCarbonFootPrintPerUnitDirty: boolean = false;
  currentPart: PartInfoDto;
  packagingInfo: PackagingInfoDto;
}

export enum ModeOfTransportEnum {
  Air = 1,
  Surface = 2,
  Ocean = 3,
}

export enum ShipmentTypeEnum {
  AIR = 1,
  FCL = 2,
  LCL = 3,
  FTL = 4,
  LTL = 5,
}

export enum ContainerTypeEnum {
  Container20Ft = 1,
  Container40Ft = 2,
  AIR = 3,
  LCL = 4,
  FTL = 5,
  LTL = 6,
}

export class LogisticsRateCard {
  originCountryId: number;
  destinationCountryId: number;
  cost: number;
  costType: string;
  modeOfTransportTypeId: number;
  shipmentTypeId: number;
  containerTypeId: number;
  esg: number;
}

export interface LogisticsCostRequest {
  originCountryId: number;
  destinationCountryId: number;
  vendor?: DigitalFactoryDtoNew;
  buLocation?: BuLocationDto;
  containerSizes: ContainerSize[];
  part: PartInfoDto;
  materials: MaterialInfoDto[];
  packaging: PackagingInfoDto;
  defaultMode?: number;
}

export interface LogisticsCostResponse {
  rateCard: RateCardDto;
  freightCost: FreightCostResponseDto;
}

export interface RateCardDto {
  containerTypeId: number;
  originCountryId: number;
  destinationCountryId: number;
  costType?: string;
  modeOfTransportTypeId: number;
  shipmentTypeId: number;
  esg?: number;
  originPortId?: number;
  destinationPortId?: number;
  dockCost?: number;
  travelCost?: number;
  undockCost?: number;
}
