import { PartInfoDto } from './part-info.model';

export class FreightCostRequestDto {
  containerType?: number;
  shipmentType?: number;
  modeOfTransportTypeId?: number;
  volumePerShipment: number;
  weightPerShipment: number;
  originCity: string;
  destinationCity: string;
  incoterm?: string;
  annualShipment: number;
  sourceCoordinates: string;
  destinationCoordinates: string;
}

export class ManualFreightCostRequestDto {
  originCity: string;
  destinationCity: string;
  weightPerShipment: number;
  volumePerShipment: number;
  modeOfTransportTypeId: number;
  incoTerm?: string;
  originCountryId?: number;
  destinationCountryId?: number;
  landContainerTypeId?: number;
  oceanContainerTypeId?: number;
  airContainerTypeId?: number;
  landShipmentTypeId?: number;
  oceanShipmentTypeId?: number;
  airShipmentTypeId?: number;
  annualShipment: number;
  sourceCoordinates: string;
  destinationCoordinates: string;
  part?: PartInfoDto;
}
