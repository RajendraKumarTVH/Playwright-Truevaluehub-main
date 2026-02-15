import { Injectable } from '@angular/core';
import { SharedService } from '../../modules/costing/services/shared.service';
import { ProcessInfoDto } from '../models';
import { Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class ManufacturingMetalExtrusionMappingService {
  constructor(public sharedService: SharedService) {}
  getMetalExtrusionFormFields() {
    return {
      theoreticalForce: [0],
      cuttingSpeed: [0, [Validators.required]],
      processTime: 0,
      unloadingTime: 0,
      directProcessCost: [0, [Validators.required]],
      efficiency: [85],
    };
  }

  manufacturingMetalExtrusionFormReset() {
    return {
      theoreticalForce: 0,
      cuttingSpeed: 0,
      processTime: 0,
      unloadingTime: 0,
      directProcessCost: 0,
      efficiency: 85,
    };
  }

  manufacturingMetalExtrusionFormPatch(obj: ProcessInfoDto, conversionValue, isEnableUnitConversion) {
    return {
      theoreticalForce: this.sharedService.isValidNumber(obj.theoreticalForce),
      cuttingSpeed: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(obj.cuttingSpeed), conversionValue, isEnableUnitConversion),
      processTime: obj.processTime || 0,
      unloadingTime: obj.unloadingTime || 0,
      directProcessCost: this.sharedService.isValidNumber(obj.directProcessCost),
      efficiency: obj.efficiency || 85,
    };
  }

  manufacturingMetalExtrusionFormAssignValue(manufactureInfo: ProcessInfoDto, formCtrl, conversionValue, isEnableUnitConversion) {
    manufactureInfo.theoreticalForce = formCtrl['theoreticalForce'].value;
    manufactureInfo.cuttingSpeed = this.sharedService.convertUomToSaveAndCalculation(formCtrl['cuttingSpeed'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.processTime = formCtrl['processTime'].value;
    manufactureInfo.unloadingTime = formCtrl['unloadingTime'].value;
    manufactureInfo.efficiency = formCtrl['efficiency'].value;
  }

  manufacturingMetalExtrusionDirtyCheck(manufactureInfo: ProcessInfoDto, formCtrl) {
    manufactureInfo.isTheoreticalForceDirty = formCtrl['theoreticalForce'].dirty;
    manufactureInfo.iscuttingSpeedDirty = formCtrl['cuttingSpeed'].dirty;
    manufactureInfo.isProcessTimeDirty = formCtrl['processTime'].dirty;
    manufactureInfo.isUnloadingTimeDirty = formCtrl['unloadingTime'].dirty;
    manufactureInfo.isefficiencyDirty = formCtrl['efficiency'].dirty;
  }

  manufacturingMetalExtrusionFormPatchResults(result: ProcessInfoDto, conversionValue, isEnableUnitConversion) {
    return {
      theoreticalForce: this.sharedService.isValidNumber(result.theoreticalForce),
      cuttingSpeed: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.cuttingSpeed), conversionValue, isEnableUnitConversion),
      processTime: this.sharedService.isValidNumber(result.processTime),
      unloadingTime: this.sharedService.isValidNumber(result.unloadingTime),
      directProcessCost: this.sharedService.isValidNumber(result.directProcessCost),
      efficiency: this.sharedService.isValidNumber(result.efficiency),
    };
  }

  manufacturingMetalExtrusionFormSubmitPayLoad(formCtrl, conversionValue, isEnableUnitConversion) {
    return {
      theoreticalForce: formCtrl['theoreticalForce'].value || 0,
      cuttingSpeed: this.sharedService.convertUomToSaveAndCalculation(formCtrl['cuttingSpeed'].value || 0, conversionValue, isEnableUnitConversion),
      processTime: formCtrl['processTime'].value || 0,
      unloadingTime: formCtrl['unloadingTime'].value || 0,
      directProcessCost: formCtrl['directProcessCost'].value || 0,
      efficiency: formCtrl['efficiency'].value,
    };
  }
}
