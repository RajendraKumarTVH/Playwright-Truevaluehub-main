import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { ProcessInfoDto } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ManufacturingTrimmingHydraulicForgingMappingService {
  constructor(
    private formbuilder: FormBuilder,
    private sharedService: SharedService
  ) {}

  getTrimmingHydraulicForgingFormFields(conversionValue, isEnableUnitConversion) {
    return {
      selectedTonnage: [0, [Validators.required]],
      lengthOfCut: [0, [Validators.required]],
      flashThickness: this.sharedService.convertUomInUI(2.5, conversionValue, isEnableUnitConversion),
      processTime: 0,
      loadingTime: 0,
      unloadingTime: 0,
      hlFactor: [0],
      cuttingLength: 0,
      clampingPressure: 0,
      theoreticalForce: [0, [Validators.required]],
      noOfBends: [0, [Validators.required]],
    };
  }

  manufacturingTrimmingHydraulicForgingFormReset(conversionValue, isEnableUnitConversion) {
    return {
      selectedTonnage: 0,
      lengthOfCut: 0,
      flashThickness: this.sharedService.convertUomInUI(2.5, conversionValue, isEnableUnitConversion),
      processTime: 0,
      loadingTime: 0,
      unloadingTime: 0,
      hlFactor: 0,
      cuttingLength: 0,
      clampingPressure: 0,
      theoreticalForce: 0,
      noOfBends: 0,
    };
  }

  manufacturingTrimmingHydraulicForgingFormPatch(obj: ProcessInfoDto, conversionValue, isEnableUnitConversion) {
    return {
      selectedTonnage: this.sharedService.isValidNumber(obj.selectedTonnage),
      lengthOfCut: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(obj.lengthOfCut), conversionValue, isEnableUnitConversion),
      flashThickness: this.sharedService.convertUomInUI(obj.flashThickness, conversionValue, isEnableUnitConversion),
      processTime: obj.processTime || 0,
      loadingTime: obj.loadingTime || 0,
      unloadingTime: obj.unloadingTime || 0,
      hlFactor: obj.hlFactor,
      cuttingLength: obj.cuttingLength || 0,
      clampingPressure: obj.clampingPressure,
      theoreticalForce: this.sharedService.isValidNumber(obj.theoreticalForce),
      noOfBends: obj.noOfbends,
    };
  }

  manufacturingTrimmingHydraulicForgingFormAssignValue(manufactureInfo: ProcessInfoDto, formCtrl, conversionValue, isEnableUnitConversion) {
    manufactureInfo.selectedTonnage = formCtrl['selectedTonnage'].value != null ? formCtrl['selectedTonnage'].value : 0;
    manufactureInfo.lengthOfCut = this.sharedService.convertUomToSaveAndCalculation(formCtrl['lengthOfCut'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.flashThickness = this.sharedService.convertUomToSaveAndCalculation(formCtrl['flashThickness'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.processTime = formCtrl['processTime'].value;
    manufactureInfo.loadingTime = formCtrl['loadingTime'].value;
    manufactureInfo.unloadingTime = formCtrl['unloadingTime'].value;
    manufactureInfo.hlFactor = formCtrl['hlFactor'].value;
    manufactureInfo.cuttingLength = Number(formCtrl['cuttingLength'].value);
    manufactureInfo.clampingPressure = formCtrl['clampingPressure'].value;
    manufactureInfo.theoreticalForce = formCtrl['theoreticalForce'].value;
    manufactureInfo.noOfbends = formCtrl['noOfBends'].value;
  }

  manufacturingTrimmingHydraulicForgingDirtyCheck(manufactureInfo: ProcessInfoDto, formCtrl) {
    manufactureInfo.isselectedTonnageDirty = !!formCtrl['selectedTonnage'].value && (formCtrl['selectedTonnage'].dirty || manufactureInfo.isselectedTonnageDirty);
    manufactureInfo.isLengthOfCutDirty = formCtrl['lengthOfCut'].dirty;
    manufactureInfo.isflashThicknessDirty = formCtrl['flashThickness'].dirty;
    manufactureInfo.isProcessTimeDirty = formCtrl['processTime'].dirty;
    manufactureInfo.isLoadingTimeDirty = formCtrl['loadingTime'].dirty;
    manufactureInfo.isUnloadingTimeDirty = formCtrl['unloadingTime'].dirty;
    manufactureInfo.ishlFactorDirty = formCtrl['hlFactor'].dirty;
    manufactureInfo.isCuttingLengthDirty = formCtrl['cuttingLength'].dirty;
    manufactureInfo.isclampingPressureDirty = formCtrl['clampingPressure'].dirty;
    manufactureInfo.isTheoreticalForceDirty = formCtrl['theoreticalForce'].dirty;
    manufactureInfo.isNoOfBends = formCtrl['noOfBends'].dirty;
  }

  manufacturingTrimmingHydraulicForgingFormPatchResults(result: ProcessInfoDto, conversionValue, isEnableUnitConversion) {
    return {
      selectedTonnage: this.sharedService.isValidNumber(result.selectedTonnage),
      lengthOfCut: this.sharedService.isValidNumber(result.lengthOfCut),
      flashThickness: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.flashThickness), conversionValue, isEnableUnitConversion),
      processTime: this.sharedService.isValidNumber(result.processTime),
      loadingTime: this.sharedService.isValidNumber(result.loadingTime),
      unloadingTime: this.sharedService.isValidNumber(result.unloadingTime),
      hlFactor: this.sharedService.isValidNumber(result.hlFactor),
      cuttingLength: this.sharedService.isValidNumber(result?.cuttingLength),
      clampingPressure: this.sharedService.isValidNumber(result.clampingPressure),
      theoreticalForce: this.sharedService.isValidNumber(result.theoreticalForce),
      noOfBends: this.sharedService.isValidNumber(result.noOfbends),
    };
  }

  manufacturingTrimmingHydraulicForgingFormSubmitPayLoad(formCtrl, conversionValue, isEnableUnitConversion) {
    return {
      selectedTonnage: formCtrl['selectedTonnage'].value || 0,
      lengthOfCut: this.sharedService.convertUomToSaveAndCalculation(formCtrl['lengthOfCut'].value || 0, conversionValue, isEnableUnitConversion),
      flashThickness: this.sharedService.convertUomToSaveAndCalculation(formCtrl['flashThickness'].value, conversionValue, isEnableUnitConversion),
      processTime: formCtrl['processTime'].value || 0,
      loadingTime: formCtrl['loadingTime'].value || 0,
      unloadingTime: formCtrl['unloadingTime'].value || 0,
      hlFactor: formCtrl['hlFactor'].value || 0,
      cuttingLength: formCtrl['cuttingLength'].value || 0,
      clampingPressure: formCtrl['clampingPressure'].value || 0,
      theoreticalForce: formCtrl['theoreticalForce'].value || 0,
      noOfbends: formCtrl['noOfBends'].value || 0,
    };
  }
}
