import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { ProcessInfoDto } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ManufacturingCustomCableMappingService {
  constructor(public sharedService: SharedService) {}
  getFormFields() {
    return {
      cuttingSpeed: [0, [Validators.required]],
      dryCycleTime: [0],
      partEjection: [0, [Validators.required]],

      directProcessCost: [0, [Validators.required]],
    };
  }

  manufacturingFormReset() {
    return {
      cuttingSpeed: 0,
      dryCycleTime: 0,
      partEjection: 0,

      directProcessCost: 0,
    };
  }

  manufacturingFormPatch(obj: ProcessInfoDto, conversionValue, isEnableUnitConversion) {
    return {
      cuttingSpeed: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(obj.cuttingSpeed), conversionValue, isEnableUnitConversion),
      dryCycleTime: obj.dryCycleTime || 0,
      partEjection: this.sharedService.isValidNumber(obj.partEjection),

      directProcessCost: this.sharedService.isValidNumber(obj.directProcessCost),
    };
  }

  manufacturingFormAssignValue(manufactureInfo: ProcessInfoDto, formCtrl, defaultValues, conversionValue, isEnableUnitConversion) {
    manufactureInfo.cuttingSpeed = this.sharedService.convertUomToSaveAndCalculation(formCtrl['cuttingSpeed'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.dryCycleTime = formCtrl['dryCycleTime'].value != null ? formCtrl['dryCycleTime'].value : defaultValues.dryCycleTime;
    manufactureInfo.partEjection = formCtrl['partEjection'].value;
  }

  manufacturingDirtyCheck(manufactureInfo: ProcessInfoDto, formCtrl) {
    manufactureInfo.iscuttingSpeedDirty = formCtrl['cuttingSpeed'].dirty;
    manufactureInfo.isDryCycleTimeDirty = formCtrl['dryCycleTime'].dirty;
    manufactureInfo.isPartEjectionDirty = formCtrl['partEjection'].dirty;
  }

  manufacturingFormPatchResults(result: ProcessInfoDto, conversionValue, isEnableUnitConversion) {
    return {
      cuttingSpeed: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.cuttingSpeed), conversionValue, isEnableUnitConversion),
      dryCycleTime: this.sharedService.isValidNumber(result.dryCycleTime),
      partEjection: this.sharedService.isValidNumber(result.partEjection),

      directProcessCost: this.sharedService.isValidNumber(result.directProcessCost),
    };
  }

  manufacturingFormSubmitPayLoad(formCtrl, conversionValue, isEnableUnitConversion) {
    return {
      cuttingSpeed: this.sharedService.convertUomToSaveAndCalculation(formCtrl['cuttingSpeed'].value || 0, conversionValue, isEnableUnitConversion),
      dryCycleTime: formCtrl['dryCycleTime'].value || 0,
      partEjection: formCtrl['partEjection'].value || 0,

      directProcessCost: formCtrl['directProcessCost'].value,
    };
  }
}
