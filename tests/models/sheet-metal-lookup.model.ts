export class StrokeRate {
  tonnage: number;
  simplePercentage: number;
  interPercentage: number;
  complexPercentage: number;
}

export class StrokeRateManual {
  thickness: number;
  tonnage: number;
  complexityType: string;
  value: number;
}

export class HandlingTime {
  weight: number;
  handlingTime: number;
  isStageTooling: boolean;
}

export class LaserCuttingTime {
  material: string;
  thickness: number;
  kerf: number;
  laserPower: number;
  cuttingSpeedActual: number;
  piercingTime: number;
}

export class PlasmaCutting {
  materialType: string;
  amps: number;
  thickness: number;
  speed: number;
}

export class ToolLoadingTime {
  toolType: string;
  tonnage: number;
  toolLength: number;
  toolLoadingTime: number;
}

export class StampingMetrialLookUp {
  lookUpId: number;
  description: string;
  min: number;
  max: number;
  category: string;
  categoryId: number;
  expectedValue: number;
}

export class ConnectorAssemblyManufacturingLookUp {
  lookUpId: number;
  machineType: number;
  //description: string;
  min: number;
  max: number;
  //category: string;
  categoryId: number;
  expectedValue: number;
}
