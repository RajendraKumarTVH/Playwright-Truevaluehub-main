import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EECoversionCostCalculatorService {
  getComponentPlacementConfiguration() {
    return [
      {
        id: 1,
        name: 'Single side SMD + No TH',
        smdConfig: {
          top: 1,
          bottom: null,
        },
        thConfig: {
          soldering: {
            manual: null,
            selective: null,
            wave: null,
          },
        },
      },
      {
        id: 2,
        name: 'Double side SMD + No TH',
        smdConfig: {
          top: 0.7,
          bottom: 0.3,
        },
        thConfig: {
          soldering: {
            manual: null,
            selective: null,
            wave: null,
          },
        },
      },
      {
        id: 3,
        name: 'Top side SMD + Top side TH',
        smdConfig: {
          top: 1,
          bottom: null,
        },
        thConfig: {
          soldering: {
            manual: 0.1,
            selective: 0.2,
            wave: 0.7,
          },
        },
      },
      {
        id: 4,
        name: 'Top side SMD + Bottom sideTH',
        smdConfig: {
          top: 1,
          bottom: null,
        },
        thConfig: {
          soldering: {
            manual: 0.1,
            selective: 0.2,
            wave: 0.7,
          },
        },
      },
      {
        id: 5,
        name: 'Both side SMD + Both side TH',
        smdConfig: {
          top: 0.7,
          bottom: 0.3,
        },
        thConfig: {
          soldering: {
            manual: 0.1,
            selective: 0.2,
            wave: 0.7,
          },
        },
      },
      {
        id: 6,
        name: 'Both side SMD + one side TH',
        smdConfig: {
          top: 0.7,
          bottom: 0.3,
        },
        thConfig: {
          soldering: {
            manual: 0.1,
            selective: 0.2,
            wave: 0.7,
          },
        },
      },
      {
        id: 7,
        name: 'No SMD + Single Side TH',
        smdConfig: {
          top: null,
          bottom: null,
        },
        thConfig: {
          soldering: {
            manual: 0.1,
            selective: 0.2,
            wave: 0.7,
          },
        },
      },
      {
        id: 8,
        name: 'No SMD + Both Side TH',
        smdConfig: {
          top: null,
          bottom: null,
        },
        thConfig: {
          soldering: {
            manual: 0.1,
            selective: 0.2,
            wave: 0.7,
          },
        },
      },
    ];
  }

  getLotSizeConfiguration(volumeQuantity: number) {
    if (volumeQuantity <= 500) {
      return 1;
    } else if (volumeQuantity > 500 && volumeQuantity <= 1000) {
      return 2;
    } else if (volumeQuantity > 1000 && volumeQuantity <= 5000) {
      return 4;
    } else if (volumeQuantity > 5000 && volumeQuantity <= 20000) {
      return 6;
    } else if (volumeQuantity > 20000 && volumeQuantity < 100000) {
      return 8;
    } else if (volumeQuantity >= 100000) {
      return 12;
    } else {
      return 12;
    }
  }

  calculateSmdCounts(boardComponents: any) {
    const countCalculation = {
      pin2or3SmdComponentsTypes: 0,
      pin2or3SmdComponentsPlacements: 0,
      pin3MoreSmdComponentsTypes: 0,
      pin3MoreSmdComponentsPlacements: 0,
      pinComplexSmdComponentsTypes: 0,
      pinComplexSmdComponentsPlacements: 0,
    };

    const smdComponents = boardComponents.filter((x: any) => x.technology == 'SMD');

    const pin2or3SmdComponents = smdComponents.filter((x: any) => Number(x.pins) == 2 || Number(x.pins) == 3);
    countCalculation.pin2or3SmdComponentsTypes = pin2or3SmdComponents.length;
    countCalculation.pin2or3SmdComponentsPlacements = 0;
    pin2or3SmdComponents.forEach((element: any) => {
      countCalculation.pin2or3SmdComponentsPlacements += Number(element.partQty);
    });

    const pin3MoreSmdComponents = smdComponents.filter((x: any) => Number(x.pins) > 3 && Number(x.pins) <= 100);
    countCalculation.pin3MoreSmdComponentsTypes = pin3MoreSmdComponents.length;
    countCalculation.pin3MoreSmdComponentsPlacements = 0;
    pin3MoreSmdComponents.forEach((element: any) => {
      countCalculation.pin3MoreSmdComponentsPlacements += Number(element.partQty);
    });

    const pinComplexSmdComponents = smdComponents.filter((x: any) => Number(x.pins) > 100);
    countCalculation.pinComplexSmdComponentsTypes = pinComplexSmdComponents.length;
    countCalculation.pinComplexSmdComponentsPlacements = 0;
    pinComplexSmdComponents.forEach((element: any) => {
      countCalculation.pinComplexSmdComponentsPlacements += Number(element.partQty);
    });

    return countCalculation;
  }

  runSmdCountCalculationAlgo(placementId: any, countValue: any) {
    const countCalculation = {
      topPin2or3SmdComponentsTypes: 0,
      topPin2or3SmdComponentsPlacements: 0,
      topPin3MoreSmdComponentsTypes: 0,
      topPin3MoreSmdComponentsPlacements: 0,
      topPinComplexSmdComponentsTypes: 0,
      topPinComplexSmdComponentsPlacements: 0,

      bottomPin2or3SmdComponentsTypes: 0,
      bottomPin2or3SmdComponentsPlacements: 0,
      bottomPin3MoreSmdComponentsTypes: 0,
      bottomPin3MoreSmdComponentsPlacements: 0,
      bottomPinComplexSmdComponentsTypes: 0,
      bottomPinComplexSmdComponentsPlacements: 0,
    };

    const config = this.getComponentPlacementConfiguration();
    const c = config.filter((x: any) => x.id == placementId);
    const configValue = c != null && c.length == 1 ? c[0] : null;

    // Top Smd Calculation
    countCalculation.topPin2or3SmdComponentsPlacements = configValue?.smdConfig.top != null ? Math.floor(Number(countValue.pin2or3SmdComponentsPlacements) * Number(configValue?.smdConfig.top)) : 0;
    countCalculation.topPin2or3SmdComponentsTypes = configValue?.smdConfig.top != null ? Math.floor(Number(countValue.pin2or3SmdComponentsTypes) * Number(configValue?.smdConfig.top)) : 0;

    countCalculation.topPin3MoreSmdComponentsPlacements = configValue?.smdConfig.top != null ? Math.floor(Number(countValue.pin3MoreSmdComponentsPlacements) * Number(configValue?.smdConfig.top)) : 0;
    countCalculation.topPin3MoreSmdComponentsTypes = configValue?.smdConfig.top != null ? Math.floor(Number(countValue.pin3MoreSmdComponentsTypes) * Number(configValue?.smdConfig.top)) : 0;

    countCalculation.topPinComplexSmdComponentsPlacements =
      configValue?.smdConfig.top != null ? Math.floor(Number(countValue.pinComplexSmdComponentsPlacements) * Number(configValue?.smdConfig.top)) : 0;
    countCalculation.topPinComplexSmdComponentsTypes = configValue?.smdConfig.top != null ? Math.floor(Number(countValue.pinComplexSmdComponentsTypes) * Number(configValue?.smdConfig.top)) : 0;

    // Botton SMD Calculations
    countCalculation.bottomPin2or3SmdComponentsPlacements =
      configValue?.smdConfig.bottom != null ? Number(countValue.pin2or3SmdComponentsPlacements) - Number(countCalculation.topPin2or3SmdComponentsPlacements) : 0;
    countCalculation.bottomPin2or3SmdComponentsTypes = configValue?.smdConfig.bottom != null ? Number(countValue.pin2or3SmdComponentsTypes) - Number(countCalculation.topPin2or3SmdComponentsTypes) : 0;

    countCalculation.bottomPin3MoreSmdComponentsPlacements =
      configValue?.smdConfig.bottom != null ? Number(countValue.pin3MoreSmdComponentsPlacements) - Number(countCalculation.topPin3MoreSmdComponentsPlacements) : 0;
    countCalculation.bottomPin3MoreSmdComponentsTypes =
      configValue?.smdConfig.bottom != null ? Number(countValue.pin3MoreSmdComponentsTypes) - Number(countCalculation.topPin3MoreSmdComponentsTypes) : 0;

    countCalculation.bottomPinComplexSmdComponentsPlacements =
      configValue?.smdConfig.bottom != null ? Number(countValue.pinComplexSmdComponentsPlacements) - Number(countCalculation.topPinComplexSmdComponentsPlacements) : 0;
    countCalculation.bottomPinComplexSmdComponentsTypes =
      configValue?.smdConfig.bottom != null ? Number(countValue.pinComplexSmdComponentsTypes) - Number(countCalculation.topPinComplexSmdComponentsTypes) : 0;

    return countCalculation;
  }

  calculateThCounts(boardComponents: any) {
    const countCalculation = {
      thComponentsTypes: 0,
      thComponentsPlacements: 0,
    };

    const thComponents = boardComponents.filter((x: any) => x.technology == 'TH');

    countCalculation.thComponentsTypes = thComponents.length;
    countCalculation.thComponentsPlacements = 0;
    thComponents.forEach((element: any) => {
      countCalculation.thComponentsPlacements += Number(element.partQty) * Number(element.pins);
    });

    return countCalculation;
  }

  runThCountCalculationAlgo(placementId: any, countValue: any) {
    const countCalculation = {
      manualThComponentsTypes: 0,
      selectiveThComponentsTypes: 0,
      waveThComponentsTypes: 0,

      manualThComponentsPlacements: 0,
      selectiveThComponentsPlacements: 0,
      waveThComponentsPlacements: 0,
    };

    const config = this.getComponentPlacementConfiguration();
    const c: any = config.filter((x: any) => x.id == Number(placementId));
    const configValue = c != null && c.length == 1 ? c[0] : null;

    if (configValue?.name?.toLowerCase().includes('no th')) {
      return countCalculation;
    }

    const topTypes = Number(countValue.thComponentsTypes);
    const topPlacements = Number(countValue.thComponentsPlacements);

    // TH Manual Calculation
    if (countValue.thComponentsTypes >= 8) {
      countCalculation.manualThComponentsTypes = configValue?.thConfig?.soldering?.manual != null ? Math.floor(Number(topTypes) * Number(configValue?.thConfig.soldering.manual)) : 0;

      countCalculation.manualThComponentsPlacements = configValue?.thConfig?.soldering?.manual != null ? Math.floor(Number(topPlacements) * Number(configValue?.thConfig.soldering.manual)) : 0;
    } else {
      countCalculation.manualThComponentsTypes = 0;
      countCalculation.manualThComponentsPlacements = 0;
    }

    // TH Selective
    countCalculation.selectiveThComponentsTypes = configValue?.thConfig?.soldering?.selective != null ? Math.floor(Number(topTypes) * Number(configValue?.thConfig.soldering.selective)) : 0;

    countCalculation.selectiveThComponentsPlacements = configValue?.thConfig?.soldering?.selective != null ? Math.floor(Number(topPlacements) * Number(configValue?.thConfig.soldering.selective)) : 0;

    // TH Wave Calculations
    countCalculation.waveThComponentsTypes = topTypes - countCalculation.manualThComponentsTypes - countCalculation.selectiveThComponentsTypes;
    countCalculation.waveThComponentsPlacements = topPlacements - countCalculation.manualThComponentsPlacements - countCalculation.selectiveThComponentsPlacements;

    return countCalculation;
  }

  // Joints Calculation
  calculateJoints(boardComponents: any, thCalculationCount: any) {
    const countCalculation = {
      manualJoints: 0,
      selectiveJoints: 0,
      waveJoints: 0,
    };

    const thComponents = boardComponents.filter((x: any) => x.technology == 'TH');

    let totalPins = 0;
    thComponents.forEach((element: any) => {
      totalPins += Number(totalPins) * Number(element.pins);
    });

    countCalculation.selectiveJoints =
      (Number(thCalculationCount.selectiveThComponentsPlacements) /
        (Number(thCalculationCount.manualThComponentsPlacements) + Number(thCalculationCount.selectiveThComponentsPlacements) + Number(thCalculationCount.waveThComponentsPlacements))) *
        totalPins || 0;

    countCalculation.manualJoints =
      (Number(thCalculationCount.manualThComponentsPlacements) /
        (Number(thCalculationCount.manualThComponentsPlacements) + Number(thCalculationCount.selectiveThComponentsPlacements) + Number(thCalculationCount.waveThComponentsPlacements))) *
        totalPins || 0;

    countCalculation.waveJoints =
      (Number(thCalculationCount.waveThComponentsPlacements) /
        (Number(thCalculationCount.manualThComponentsPlacements) + Number(thCalculationCount.selectiveThComponentsPlacements) + Number(thCalculationCount.waveThComponentsPlacements))) *
        totalPins || 0;

    return countCalculation;
  }
}
