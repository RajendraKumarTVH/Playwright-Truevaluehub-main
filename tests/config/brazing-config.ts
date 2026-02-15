import { MachineType } from '../enums';

export class BrazingConfigService {


  getPowerData(thickness: number) {
    const vals = [
      { thickness: 0.5, powerRange: 4, brazingTime: 7.5 },
      { thickness: 1, powerRange: 6, brazingTime: 11.5 },
      { thickness: 1.5, powerRange: 8.5, brazingTime: 15 },
      { thickness: 2, powerRange: 12.5, brazingTime: 18.5 },
      { thickness: 2.5, powerRange: 17.5, brazingTime: 22.5 },
      { thickness: 3, powerRange: 25, brazingTime: 27.5 },
      { thickness: 4, powerRange: 35, brazingTime: 32.5 },
      { thickness: 5, powerRange: 45, brazingTime: 37.5 },
      { thickness: 6, powerRange: 55, brazingTime: 42.5 },
    ];
    return vals.find((x) => x.thickness >= thickness)?.brazingTime || 7.5;
  }

  getEfficiency(automationType: MachineType) {
    const vals = {
      1: 90, //auto
      2: 80, // semi-auto
      3: 70, // manual
    };
    return vals[automationType] || 90;
  }

  getNoOfLowSkilledLabours(automationType: MachineType) {
    const vals = {
      1: 0.33, //auto
      2: 0.5, // semi-auto
      3: 1, // manual
    };
    return vals[automationType] || 0.33;
  }

  getMachineHourRate(automationType: MachineType) {
    const vals = {
      1: 1.25, //auto
      2: 1.15, // semi-auto
      3: 1, // manual
    };
    return vals[automationType] || 1.25;
  }

}
