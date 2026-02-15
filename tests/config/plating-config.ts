import { PrimaryProcessType, ProcessType } from '../enums';

export class PlatingConfigService {

  getR2RPlatingFields(isEnableUnitConversion: boolean, conversionValue: string): { id: string; label: string; name: string }[] {
    return [
      { id: 'lengthOfTeminalReel', label: 'Length of Terminal Reel (' + (isEnableUnitConversion ? conversionValue : 'mm') + ')', name: 'cuttingLength' },
      { id: 'terminalPitchLength', label: 'Terminal Pitch Length (' + (isEnableUnitConversion ? conversionValue : 'mm') + ')', name: 'bendingLineLength' },
      { id: 'feedRateOfReel', label: 'Feed Rate of Reel (m/min)', name: 'rotationTime' },
      { id: 'timeRequiredForElectroplating', label: 'Time required for Electroplating (min)', name: 'injectionTime' },
      { id: 'lengthOfTankRequired', label: 'Length of Tank Required (m)', name: 'lengthOfCut' },
      { id: 'noOfPartsInTankLength', label: 'No. of Parts in Tank Length', name: 'noOfParts' },
    ];
  }

  getPlatingFields() {
    return [
      { id: 'barrelVolumeUtilisation', label: 'Barrel Volume Utilization %', name: 'utilisation' },
      { id: 'noOfPartsHandled', label: 'No. of Parts Handled/Cycle', name: 'noOfParts' },
      { id: 'platingTime', label: 'Plating Time/Batch(min)', name: 'injectionTime' },
      { id: 'rackMovementTime', label: 'Rack Movement Time(min)', name: 'rotationTime' },
      { id: 'totalPlatingTime', label: 'Total Plating Time/Batch(min)', name: 'totalInjectionTime' },
    ];
  }

  getGalvanizationFields() {
    return [
      { id: 'bathVolumeUtilisation', label: 'Bath Volume Utilization %', name: 'utilisation' },
      { id: 'noOfPartsHandled', label: 'No. of Parts Handled/Cycle', name: 'noOfParts' },
      { id: 'coatingTime', label: 'Coating Time/Batch(min)', name: 'injectionTime' },
    ];
  }

  siverOrGoldPlatingTankSizes = [
    { id: 1, name: 'Small', length: 890, width: 645, height: 600 },
    { id: 2, name: 'Medium', length: 1090, width: 710, height: 645 },
    { id: 3, name: 'Large', length: 1332, width: 1180, height: 770 },
  ];

  getSilverOrGoldTankSize = (partVolume: number): { id: number; name: string; length: number; width: number; height: number } | null =>
    this.siverOrGoldPlatingTankSizes.find((tank) => tank.length * tank.width * tank.height * 0.2 >= partVolume) || this.siverOrGoldPlatingTankSizes[this.siverOrGoldPlatingTankSizes.length - 1];

  platingTankSizes = [
    { id: 1, name: 'Small', length: 1065, width: 585, height: 1000 },
    { id: 2, name: 'Medium', length: 1657, width: 1210, height: 1200 },
    { id: 3, name: 'Large', length: 2500, width: 1800, height: 2100 },
  ];

  getPlatingTankSize = (partVolume: number): { id: number; name: string; length: number; width: number; height: number } | null =>
    this.platingTankSizes.find((tank) => tank.length * tank.width * tank.height * 0.2 >= partVolume) || this.platingTankSizes[this.platingTankSizes.length - 1];

  feedRatelookupTable: any[] = [
    { family: 'Chromium', typicalFeedRateRange: '6 to 12', typicalFeedRate: 7 },
    { family: 'Gold Electroplating', typicalFeedRateRange: '2 to 5', typicalFeedRate: 3 },
    { family: 'Nickel & Nickel Alloy', typicalFeedRateRange: '4 to 8', typicalFeedRate: 5 },
    { family: 'Silver & Sliver Alloy', typicalFeedRateRange: '3 to 7', typicalFeedRate: 4 },
    { family: 'Tin', typicalFeedRateRange: '5 to 10', typicalFeedRate: 5.5 },
    { family: 'Zinc', typicalFeedRateRange: '5 to 10', typicalFeedRate: 5.5 },
    { family: 'Copper & Copper Alloy', typicalFeedRateRange: '4 to 8', typicalFeedRate: 5 },
  ];

  getFeedRate(matFamily: string): number {
    const row = this.feedRatelookupTable.find((item) => item.family.toLowerCase() === matFamily.toLowerCase());
    return row ? row.typicalFeedRate : 0;
  }

  getProcessDefaults = (pType: number, subProcessTypeID: number) => {
    switch (pType) {
      case ProcessType.ChromePlating:
        return { processId: PrimaryProcessType.ChromePlating, yield: 35, electroStatic: 0.064, intensity: 60, qa: 0.5, machineSpeed: 0, skilledLabours: 0 };
      case ProcessType.NickelPlating:
        return { processId: PrimaryProcessType.NickelPlating, yield: 95, electroStatic: 1.04, intensity: 4, qa: 0.25, machineSpeed: 0, skilledLabours: 0 };
      case ProcessType.CopperPlating:
        return { processId: PrimaryProcessType.CopperPlating, yield: 60, electroStatic: 0.71, intensity: 3, qa: 0.25, machineSpeed: 0, skilledLabours: 0 };
      case ProcessType.R2RPlating:
        return { processId: PrimaryProcessType.R2RPlating, yield: 95, electroStatic: 1.04, intensity: 4, qa: 0.25, machineSpeed: 0, skilledLabours: 0 };
      case ProcessType.TinPlating:
        return { processId: PrimaryProcessType.TinPlating, yield: 98, electroStatic: 1.107, intensity: 1, qa: 0.25, machineSpeed: 0, skilledLabours: 0 };
      case ProcessType.GoldPlating:
        return { processId: PrimaryProcessType.GoldPlating, yield: 75, electroStatic: 3.68, intensity: 2, qa: 0.25, machineSpeed: 0, skilledLabours: 0 };
      case ProcessType.SilverPlating:
        return { processId: PrimaryProcessType.SilverPlating, yield: 75, electroStatic: 4.025, intensity: 2, qa: 0.25, machineSpeed: 0, skilledLabours: 0 };
      case ProcessType.PowderCoating:
        return { processId: PrimaryProcessType.PowderCoating, yield: 0, electroStatic: 0, intensity: 0, qa: 0.5, machineSpeed: 0, skilledLabours: 0 };
      case ProcessType.Painting:
        return { processId: PrimaryProcessType.Painting, yield: 85, electroStatic: 1.04, intensity: 2, qa: 0.5, machineSpeed: 1.52, skilledLabours: 0 };
      case ProcessType.Galvanization:
        return {
          processId: PrimaryProcessType.Galvanization,
          yield: 85,
          electroStatic: 1.04,
          intensity: 2,
          qa: 0.25,
          machineSpeed: 0,
          skilledLabours: 1,
          utilisation: 15,
          volumeOfBarrel: 6000 * 2400 * 1100,
        };
      case ProcessType.SiliconCoatingAuto:
        return { processId: PrimaryProcessType.SiliconCoatingAuto, yield: 85, electroStatic: 1.04, intensity: 2, qa: 0.5, machineSpeed: 2.5, skilledLabours: 0 };
      case ProcessType.SiliconCoatingSemi:
      case ProcessType.WetPainting:
        return { processId: PrimaryProcessType.WetPainting, yield: 85, electroStatic: 1.04, intensity: 2, qa: subProcessTypeID === 2 ? 0.25 : 0.5, machineSpeed: 2.5, skilledLabours: 0 };
      default:
        return { processId: PrimaryProcessType.ZincPlating, yield: 85, electroStatic: 1.04, intensity: 2, qa: 0.25, machineSpeed: 0, skilledLabours: 0 };
    }
  };

  public getPowderCoatingMachineSpeed(eav: number, dimX: number): number {
    if (eav <= 20000) {
      return dimX <= 500 ? 0.9 : dimX <= 1250 ? 0.7 : 0.5;
    } else if (eav <= 50000) {
      return dimX <= 500 ? 1.5 : dimX <= 1250 ? 1 : 0.9;
    } else if (eav <= 100000) {
      return dimX <= 500 ? 2.5 : dimX <= 1250 ? 1.5 : 1;
    } else {
      return dimX <= 500 ? 3 : dimX <= 1250 ? 2 : 1.5;
    }
  }

  public getPowderCoatingLoadingTime(partWeight: number): number {
    const loadingTimeMap = [
      { threshold: 250, time: 8 },
      { threshold: 500, time: 10 },
      { threshold: 1000, time: 14 },
      { threshold: 3000, time: 20 },
      { threshold: 5000, time: 32 },
      { threshold: 7000, time: 48 },
      { threshold: 10000, time: 70 },
      { threshold: 15000, time: 80 },
      { threshold: 20000, time: 96 },
      { threshold: 30000, time: 150 },
      { threshold: 50000, time: 190 },
      { threshold: 100000, time: 500 },
      { threshold: 500000, time: 900 },
      { threshold: Infinity, time: 1400 },
    ];
    let loadingTime = loadingTimeMap.find((item) => partWeight < item.threshold)?.time ?? 0;
    return loadingTime > 0 ? loadingTime : 0;
  }
}
