export class ThermoForming {
  thermoFormingId: number;
  rawMaterial: string;
  thermalConductivity: number;
  specificHeatLb: number;
  specificHeatKg: number;
  densityLb: number;
  densityKg: number;
  desiredFormingTempF: number;
  desiredFormingTemKelvin: number;
  startingTempF: number;
  startingTempKelvin: number;
  ambientTemp: number;
  ambientTempF: number;
  heatTransferCoefficient: number;
  price: number;
  stdSheetLength: number;
  stdSheetWidth: number;
  stdSheetThikness: number;
  clampFactor: number;
}

export class FormingTime {
  thermoFormingTimeId: number;
  rawMaterial: string;
  thickness: number;
  formingTime: number;
}
