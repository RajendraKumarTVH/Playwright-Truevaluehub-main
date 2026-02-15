import { Injectable } from '@angular/core';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { ProcessInfoDto } from '../models';
import { Validators } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class ManufacturingInsulationJacketMappingService {
  constructor(public sharedService: SharedService) {}
  getInsulationJacketFormFields() {
    return {
      loadingTime: 0,
      unloadingTime: 0,
      sheetLoadUloadTime: [0, [Validators.required]],
      lubeTime: 30,
      cuttingSpeed: [0, [Validators.required]],
      efficiency: [0.85],
      cuttingTime: [0, [Validators.required]],
      cuttingLength: 0,
      directProcessCost: [0, [Validators.required]],
    };
  }

  manufacturingInsulationJacketFormReset() {
    return {
      loadingTime: 0,
      unloadingTime: 0,
      sheetLoadUloadTime: 0,
      lubeTime: 30,
      cuttingSpeed: 0,
      efficiency: 0.85,
      cuttingTime: 0,
      cuttingLength: 0,
      directProcessCost: 0,
    };
  }

  manufacturingInsulationJacketFormPatch(obj: ProcessInfoDto, conversionValue, isEnableUnitConversion) {
    return {
      loadingTime: this.sharedService.isValidNumber(obj.loadingTime) || 0,
      unloadingTime: this.sharedService.isValidNumber(obj.unloadingTime) || 0,
      sheetLoadUloadTime: this.sharedService.isValidNumber(obj.sheetLoadUloadTime),
      lubeTime: obj.lubeTime || 30,
      cuttingSpeed: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(obj.cuttingSpeed), conversionValue, isEnableUnitConversion),
      efficiency: obj.efficiency || 0.85,
      cuttingTime: this.sharedService.isValidNumber(obj.cuttingTime),
      cuttingLength: obj.cuttingLength || 0,
      directProcessCost: this.sharedService.isValidNumber(obj.directProcessCost),
    };
  }

  manufacturingInsulationJacketFormAssignValue(manufactureInfo: ProcessInfoDto, formCtrl, conversionValue, isEnableUnitConversion) {
    manufactureInfo.loadingTime = formCtrl['loadingTime'].value;
    manufactureInfo.unloadingTime = formCtrl['unloadingTime'].value;
    manufactureInfo.sheetLoadUloadTime = formCtrl['sheetLoadUloadTime'].value;
    manufactureInfo.lubeTime = formCtrl['lubeTime'].value;
    manufactureInfo.cuttingSpeed = this.sharedService.convertUomToSaveAndCalculation(formCtrl['cuttingSpeed'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.efficiency = formCtrl['efficiency'].value;
    manufactureInfo.cuttingLength = Number(formCtrl['cuttingLength'].value);
    manufactureInfo.cuttingTime = formCtrl['cuttingTime'].value;
  }

  manufacturingInsulationJacketDirtyCheck(manufactureInfo: ProcessInfoDto, formCtrl) {
    manufactureInfo.isLoadingTimeDirty = formCtrl['loadingTime'].dirty;
    manufactureInfo.isUnloadingTimeDirty = formCtrl['unloadingTime'].dirty;
    manufactureInfo.isSheetLoadULoadTimeDirty = formCtrl['sheetLoadUloadTime'].dirty;
    manufactureInfo.islubeTimeDirty = formCtrl['lubeTime'].dirty;
    manufactureInfo.iscuttingSpeedDirty = formCtrl['cuttingSpeed'].dirty;
    manufactureInfo.isefficiencyDirty = formCtrl['efficiency'].dirty;
    manufactureInfo.isCuttingLengthDirty = formCtrl['cuttingLength'].dirty;
    manufactureInfo.isCuttingTimeDirty = formCtrl['cuttingTime'].dirty;
  }

  manufacturingInsulationJacketFormPatchResults(result: ProcessInfoDto, conversionValue, isEnableUnitConversion) {
    return {
      loadingTime: this.sharedService.isValidNumber(result.loadingTime),
      unloadingTime: this.sharedService.isValidNumber(result.unloadingTime),
      sheetLoadUloadTime: this.sharedService.isValidNumber(result.sheetLoadUloadTime),
      lubeTime: this.sharedService.isValidNumber(result.lubeTime),
      cuttingSpeed: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.cuttingSpeed), conversionValue, isEnableUnitConversion),
      efficiency: this.sharedService.isValidNumber(result.efficiency),
      cuttingTime: this.sharedService.isValidNumber(result.cuttingTime),
      cuttingLength: this.sharedService.isValidNumber(result?.cuttingLength),
      directProcessCost: this.sharedService.isValidNumber(result.directProcessCost),
    };
  }

  manufacturingInsulationJacketFormSubmitPayLoad(formCtrl, conversionValue, isEnableUnitConversion) {
    return {
      loadingTime: formCtrl['loadingTime'].value,
      unloadingTime: formCtrl['unloadingTime'].value,
      sheetLoadUloadTime: formCtrl['sheetLoadUloadTime'].value,
      lubeTime: formCtrl['lubeTime'].value,
      cuttingSpeed: this.sharedService.convertUomToSaveAndCalculation(formCtrl['cuttingSpeed'].value, conversionValue, isEnableUnitConversion),
      efficiency: formCtrl['efficiency'].value,
      cuttingTime: formCtrl['cuttingTime'].value,
      cuttingLength: formCtrl['cuttingLength'].value,
      directProcessCost: formCtrl['directProcessCost'].value,
    };
  }
}
