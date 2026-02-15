import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { ProcessInfoDto } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ManufacturingBrazingMappingService {
  constructor(public sharedService: SharedService) {}
  getBrazingFormFields() {
    return {
      noOfCore: 0,
      cuttingTime: [0, [Validators.required]],
      injectionTime: 0,
      soakingTime: [0],
      sheetLoadUloadTime: [0, [Validators.required]],
      coolingTime: [0],
      partThickness: 0,
      directProcessCost: [0, [Validators.required]],
    };
  }

  manufacturingBrazingFormReset() {
    return {
      noOfCore: 0,
      cuttingTime: 0,
      injectionTime: 0,
      soakingTime: 0,
      sheetLoadUloadTime: 0,
      coolingTime: 0,
      partThickness: 0,
      directProcessCost: 0,
    };
  }

  manufacturingBrazingFormPatch(obj: ProcessInfoDto, conversionValue, isEnableUnitConversion) {
    return {
      noOfCore: obj.noOfCore || 0,
      cuttingTime: this.sharedService.isValidNumber(obj.cuttingTime),
      injectionTime: this.sharedService.isValidNumber(obj.injectionTime) || 0,
      soakingTime: obj.soakingTime,
      sheetLoadUloadTime: this.sharedService.isValidNumber(obj.sheetLoadUloadTime),
      coolingTime: obj.coolingTime,
      partThickness: this.sharedService.convertUomInUI(obj.partThickness || 0, conversionValue, isEnableUnitConversion),
      directProcessCost: this.sharedService.isValidNumber(obj.directProcessCost),
    };
  }

  manufacturingBrazingFormAssignValue(manufactureInfo: ProcessInfoDto, formCtrl) {
    manufactureInfo.noOfCore = formCtrl['noOfCore'].value;
    manufactureInfo.cuttingTime = formCtrl['cuttingTime'].value;
    manufactureInfo.injectionTime = formCtrl['injectionTime'].value;
    manufactureInfo.soakingTime = formCtrl['soakingTime'].value;
    manufactureInfo.sheetLoadUloadTime = formCtrl['sheetLoadUloadTime'].value;
    manufactureInfo.partThickness = formCtrl['partThickness'].value;
    manufactureInfo.coolingTime = formCtrl['coolingTime'].value;
  }

  manufacturingBrazingDirtyCheck(manufactureInfo: ProcessInfoDto, formCtrl) {
    manufactureInfo.isCuttingTimeDirty = formCtrl['cuttingTime'].dirty;
    manufactureInfo.isinjectionTimeDirty = formCtrl['injectionTime'].dirty;
    manufactureInfo.issoakingTimeDirty = formCtrl['soakingTime'].dirty;
    manufactureInfo.isSheetLoadULoadTimeDirty = formCtrl['sheetLoadUloadTime'].dirty;
    manufactureInfo.iscoolingTimeDirty = formCtrl['coolingTime'].dirty;
    manufactureInfo.isnoOfCoreDirty = formCtrl['noOfCore'].dirty;
  }

  manufacturingBrazingFormPatchResults(result: ProcessInfoDto, conversionValue, isEnableUnitConversion) {
    return {
      noOfCore: this.sharedService.isValidNumber(result.noOfCore),
      cuttingTime: this.sharedService.isValidNumber(result.cuttingTime),
      injectionTime: this.sharedService.isValidNumber(result.injectionTime),
      soakingTime: this.sharedService.isValidNumber(result.soakingTime),
      sheetLoadUloadTime: this.sharedService.isValidNumber(result.sheetLoadUloadTime),
      coolingTime: this.sharedService.isValidNumber(result.coolingTime),
      partThickness: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.partThickness), conversionValue, isEnableUnitConversion),
      directProcessCost: this.sharedService.isValidNumber(result.directProcessCost),
    };
  }

  manufacturingBrazingFormSubmitPayLoad(formCtrl) {
    return {
      noOfCore: formCtrl['noOfCore'].value,
      cuttingTime: formCtrl['cuttingTime'].value,
      injectionTime: formCtrl['injectionTime'].value || 0,
      soakingTime: formCtrl['soakingTime'].value,
      sheetLoadUloadTime: formCtrl['sheetLoadUloadTime'].value || 0,
      coolingTime: formCtrl['coolingTime'].value || 0,
      partTickness: formCtrl['partTickness'] || 0,
      partThickness: formCtrl['partThickness'].value || 0,
      directProcessCost: formCtrl['directProcessCost'].value,
    };
  }
}
