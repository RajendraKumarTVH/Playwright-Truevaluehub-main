// export class FreightCostResponseDto {
//   totalCost: number;
//   totalAnnualCost: number;
//   sourceToPortCost: number;
//   portToDestinationCost: number;
//   portCost: number;
//   pickUpCo2?: number;
//   originPortCo2?: number;
//   co2?: number;
//   dischargePortCo2?: number;
//   deliveryCo2?: number;
//   totalCo2?: number;
//   pickUpCost?: number;
//   deliveryCost?: number;
//   // LandRate: ViewLandRate;
//   // PortRate: ViewPortRate;
//   route?: ViewFreightRoute[];
// }
export class FreightCostResponseDto {
  totalCost: number;
  totalAnnualCost: number;
  sourceToPortCost?: number;
  portToDestinationCost?: number;
  portCost?: number;

  pickUpCo2?: number;
  originPortCo2?: number;
  co2?: number;
  dischargePortCo2?: number;
  deliveryCo2?: number;
  totalCo2?: number;

  weightPerShipment?: number;
  volumePerShipment?: number;
  containerCost?: number;
  percentageOfShipment?: number;
  freightCostPerShipment?: number;
  freightCostPerPart?: number;
  partsPerShipment?: number;

  route?: ViewFreightRoute[];

  pickUpCost?: number;
  deliveryCost?: number;
}

export class FreightCostCalcResponseDto extends FreightCostResponseDto {
  // containerCost: number;
  // freightCostPerShipment: number;
  // freightCostPerPart: number;
  // percentageOfShipment: number;
  // partsPerShipment: number;

  containerTypeId: number;
  shipmentTypeId: number;
  modeOfTransportId: number;
}

export class ViewFreightRoute {
  locationName: string;
  modeOfTransport: string;
  distance: string;
}
