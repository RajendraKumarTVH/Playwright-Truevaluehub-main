export class LogisticsMapDto {
  originAddress: string;
  destinationAddress: string;
  distance?: string;
  duration?: string;
  apiExecutionStatus: string;
  originLatitude: string;
  originLongitude: string;
  destinationLatitude: string;
  destinationLongitude: string;
  routeLocations?: Array<RouteLocation>;
}

export class RouteLocation {
  lat: number;
  lng: number;
}
