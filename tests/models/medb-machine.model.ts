export class MedbMachineOperatingHoursMasterDto {
  machineOperatingHoursId?: number;
  machineOperatingHours?: number;
  shiftsPerDay?: number;
}

export class MedbMachineTypeMasterDto {
  machineTypeId?: number;
  processTypeId?: number;
  machineType?: string;
  workCenterId?: number;
}

export class MedbProcessTypeMasterDto {
  processTypeId?: number;
  primaryProcess?: string;
  groupName?: string;
}

export class MedbMachinesMasterDto {
  machineID: number;
  machineName: string;
  machineDescription: string;
  machineManufacturer: string;

  totalPowerKW: number;

  maxLength: number;
  maxWidth: number;
  machineTonnageTons: number;
  machineMfgLocation: string;
  strokeRateMin: number;
  moldEfficiency: number;
  bedLength: number;
  bedWidth: number;
  workPieceMinOrMaxDia: number;
  workPieceLength: number;
  workPieceHeight: number;
  stockWidth: number;
  maxOpTemp: number;
  laserPower: number;
  plasmaPower: number;
  jetPressure: number;
  plasmaCurrent: number;
  spindleSpeed: number;
  travelXAxis: number;
  travelYAxis: number;
  travelZAxis: number;
  approachDepthDistance: number;
  maxToolDia: number;
  tieBarDistanceHor: number;
  tieBarDistanceVer: number;
  machineDryCycleTimeInSec: number;
  injectionRate: number;
  shotSize: number;
  flaskLength: number;
  flaskWidth: number;
  flaskHeight: number;
  flaskSize: number;
  sandBorderFlaskBottom: number;
  sandBorderFlaskEdge: number;
  sandBorderBetweenImpressions: number;
  moldRateNoCoreCyclesPerHr: number;
  maxCoreBoxLength: number;
  maxCoreBoxWidth: number;
  maxCoreBoxHeight: number;
  furnaceCapacityTon: number;
  pourCapacity?: number;
  timePerLoad: number;
  machineHourRate: number;
  specificHeat: number;
  machineCapacity: number;
  ratedPower: number;
  sandShootingSpeed: number = 0;
  burdenRate: number = 0;
  maxProcessableWeightKgs: number = 0;
  minJobDiamm = 0;
  maxJobDiamm = 0;
  machineOutputKgPerHr = 0;
  powerUtilization?: number;
  pressBrakeStrokeDistance_mm?: number;
  pressBrakeRamDownSpeed_mm_sec?: number;
  pressBrakeRamUpSpeed_mm_sec?: number;
  machineCategory?: string;
  toolChangingCycleTimeInSec?: number;
  platenLengthmm?: number;
  platenWidthmm?: number;
  shutHeightmm?: number;
  numberOfMachineAxis?: number;
  depreciationCost?: number;
  inputedInterestCost?: number;
  powerCost?: number;
  rentCost?: number;
  maintenanceCost?: number;
  suppliesCost?: number;
  burdenedCost?: number;

  machineMarketDtos: MachineMarketDto[];
}

export class MachineMarketDto {
  machineMarketID: number;
  machineId: number;
  machineType: string;
  processTypeId: number;
  countryId: number;
  noOfLowSkilledLabours: number;
  noOfSemiSkilledLabours: number;
  noOfSkilledLabours: number;
  specialSkilledLabours: number;
  setUpTimeInHour: number;
  suppliesCost: number;
  maintanenceCost: number;
  averageUtilization: number;
  efficiency: number;
  depreciatioNInYears: number;
  installationFactor: number;
  machineOverheadRate?: number;
  mcInvestment: number;
}

export class DfMedbMachineMasterInfoDto {
  machineId?: number;
  machineName?: string;
  processTypeId?: number;
  processTypeName?: string;
  processId?: number;
  processName?: string;
}

export class MachineRequestDto {
  machineMasterId?: number;
  processTypeId?: number;
  processId?: number;
}
