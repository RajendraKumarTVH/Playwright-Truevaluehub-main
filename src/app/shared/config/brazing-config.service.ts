import { Injectable } from '@angular/core';
import { SharedService } from '../../modules/costing/services/shared.service';
import { MachineType } from '../../modules/costing/costing.config';

@Injectable({
  providedIn: 'root',
})
export class BrazingConfigService {
  constructor(public sharedService: SharedService) {}

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

  // getFormFields() {
  //   return {
  //     noOfCore: 0,
  //     cuttingTime: [0, [Validators.required]],
  //     injectionTime: 0,
  //     soakingTime: [0],
  //     sheetLoadUloadTime: [0, [Validators.required]],
  //     coolingTime: [0],
  //     partThickness: 0,
  //     directProcessCost: [0, [Validators.required]],
  //   };
  // }

  // manufacturingFormReset(conversionValue, isEnableUnitConversion) {
  //   return {
  //     noOfCore: 0,
  //     cuttingTime: 0,
  //     injectionTime: 0,
  //     soakingTime: 0,
  //     sheetLoadUloadTime: 0,
  //     coolingTime: 0,
  //     partThickness: 0,
  //     directProcessCost: 0,
  //   };
  // }

  // manufacturingFormPatch(obj: ProcessInfoDto, conversionValue, isEnableUnitConversion) {
  //   return {
  //     noOfCore: obj.noOfCore || 0,
  //     cuttingTime: this.sharedService.isValidNumber(obj.cuttingTime),
  //     injectionTime: this.sharedService.isValidNumber(obj.injectionTime) || 0,
  //     soakingTime: obj.soakingTime,
  //     sheetLoadUloadTime: this.sharedService.isValidNumber(obj.sheetLoadUloadTime),
  //     coolingTime: obj.coolingTime,
  //     partThickness: this.sharedService.convertUomInUI((obj.partThickness || 0), conversionValue, isEnableUnitConversion),
  //     directProcessCost: this.sharedService.isValidNumber(obj.directProcessCost)
  //   };
  // }

  // manufacturingFormAssignValue(manufactureInfo: ProcessInfoDto, formCtrl, conversionValue, isEnableUnitConversion) {
  //   manufactureInfo.noOfCore = formCtrl['noOfCore'].value;
  //   manufactureInfo.cuttingTime = formCtrl['cuttingTime'].value;
  //   manufactureInfo.injectionTime = formCtrl['injectionTime'].value;
  //   manufactureInfo.soakingTime = formCtrl['soakingTime'].value;
  //   manufactureInfo.sheetLoadUloadTime = formCtrl['sheetLoadUloadTime'].value;
  //   manufactureInfo.partThickness = formCtrl['partThickness'].value;
  //   manufactureInfo.coolingTime = formCtrl['coolingTime'].value;
  // }

  // manufacturingDirtyCheck(manufactureInfo: ProcessInfoDto, formCtrl) {
  //   manufactureInfo.isCuttingTimeDirty = formCtrl['cuttingTime'].dirty;
  //   manufactureInfo.isinjectionTimeDirty = formCtrl['injectionTime'].dirty;
  //   manufactureInfo.issoakingTimeDirty = formCtrl['soakingTime'].dirty;
  //   manufactureInfo.isSheetLoadULoadTimeDirty = formCtrl['sheetLoadUloadTime'].dirty;
  //   manufactureInfo.iscoolingTimeDirty = formCtrl['coolingTime'].dirty;
  //   manufactureInfo.isnoOfCoreDirty = formCtrl['noOfCore'].dirty;
  // }

  // manufacturingFormPatchResults(result: ProcessInfoDto, conversionValue, isEnableUnitConversion) {
  //   return {
  //     noOfCore: this.sharedService.isValidNumber(result.noOfCore),
  //     cuttingTime: this.sharedService.isValidNumber(result.cuttingTime),
  //     injectionTime: this.sharedService.isValidNumber(result.injectionTime),
  //     soakingTime: this.sharedService.isValidNumber(result.soakingTime),
  //     sheetLoadUloadTime: this.sharedService.isValidNumber(result.sheetLoadUloadTime),
  //     coolingTime: this.sharedService.isValidNumber(result.coolingTime),
  //     partThickness: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.partThickness), conversionValue, isEnableUnitConversion),
  //     directProcessCost: this.sharedService.isValidNumber(result.directProcessCost)
  //   };
  // }

  // manufacturingFormSubmitPayLoad(formCtrl, conversionValue, isEnableUnitConversion) {
  //   return {
  //     noOfCore: formCtrl['noOfCore'].value,
  //     cuttingTime: formCtrl['cuttingTime'].value,
  //     injectionTime: formCtrl['injectionTime'].value || 0,
  //     soakingTime: formCtrl['soakingTime'].value,
  //     sheetLoadUloadTime: formCtrl['sheetLoadUloadTime'].value || 0,
  //     coolingTime: formCtrl['coolingTime'].value || 0,
  //     partTickness : formCtrl['partTickness'] || 0,
  //     partThickness : formCtrl['partThickness'].value || 0,
  //     directProcessCost: formCtrl['directProcessCost'].value
  //   };
  // }
}
