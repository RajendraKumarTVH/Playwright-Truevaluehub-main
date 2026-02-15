import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { ProcessInfoDto } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ManufacturingTestingMpiForgingMappingService {
  constructor(
    private formbuilder: FormBuilder,
    private sharedService: SharedService
  ) {}
  getTestingMpiForgingFormFields() {
    return {
      drillDiameter: [0],
      moldTemp: 0,
      requiredCurrent: 0,
      initialTemp: [1.5],
      finalTemp: [0],
      partArea: 0,
      powerSupply: [0],
    };
  }

  manufacturingTestingMpiForgingFormReset() {
    return {
      drillDiameter: 0,
      moldTemp: 0,
      requiredCurrent: 0,
      initialTemp: 1.5,
      finalTemp: 0,
      partArea: 0,
      powerSupply: 0,
    };
  }

  manufacturingTestingMpiForgingFormPatch(obj: ProcessInfoDto, conversionValue, isEnableUnitConversion) {
    return {
      drillDiameter: this.sharedService.convertUomInUI(obj.drillDiameter || 0, conversionValue, isEnableUnitConversion),
      moldTemp: obj.moldTemp,
      requiredCurrent: obj.requiredCurrent,
      initialTemp: obj.initialTemp || 1.5,
      finalTemp: obj.finalTemp,
      partArea: this.sharedService.convertUomInUI(obj.partArea, conversionValue, isEnableUnitConversion),
      powerSupply: obj.powerSupply || 0,
    };
  }

  manufacturingTestingMpiForgingFormAssignValue(manufactureInfo: ProcessInfoDto, formCtrl, conversionValue, isEnableUnitConversion) {
    manufactureInfo.drillDiameter = this.sharedService.convertUomToSaveAndCalculation(formCtrl['drillDiameter'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.moldTemp = formCtrl['moldTemp'].value;
    manufactureInfo.requiredCurrent = formCtrl['requiredCurrent'].value;
    manufactureInfo.initialTemp = Number(formCtrl['initialTemp'].value);
    manufactureInfo.finalTemp = formCtrl['finalTemp'].value;
    manufactureInfo.partArea = this.sharedService.convertUomToSaveAndCalculation(formCtrl['partArea'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.powerSupply = formCtrl['powerSupply'].value;
  }

  manufacturingTestingMpiForgingDirtyCheck(manufactureInfo: ProcessInfoDto, formCtrl) {
    manufactureInfo.isDrillDiameterDirty = formCtrl['drillDiameter'].dirty;
    manufactureInfo.ismoldTempDirty = formCtrl['moldTemp'].dirty;
    manufactureInfo.isrequiredCurrentDirty = formCtrl['requiredCurrent'].dirty;
    manufactureInfo.isInitialTempDirty = formCtrl['initialTemp'].dirty;
    manufactureInfo.isfinalTempDirty = formCtrl['finalTemp'].dirty;
    manufactureInfo.ispartAreaDirty = formCtrl['partArea'].dirty;
    manufactureInfo.isPowerSupplyDirty = formCtrl['powerSupply'].dirty;
  }

  manufacturingTestingMpiForgingFormPatchResults(result: ProcessInfoDto, conversionValue, isEnableUnitConversion) {
    return {
      drillDiameter: this.sharedService.isValidNumber(result?.drillDiameter),
      moldTemp: this.sharedService.isValidNumber(result.moldTemp),
      requiredCurrent: this.sharedService.isValidNumber(result.requiredCurrent),
      initialTemp: this.sharedService.isValidNumber(result.initialTemp),
      finalTemp: this.sharedService.isValidNumber(result.finalTemp),
      partArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.partArea), conversionValue, isEnableUnitConversion),
      powerSupply: this.sharedService.isValidNumber(result.powerSupply),
    };
  }

  manufacturingTestingMpiForgingFormSubmitPayLoad(formCtrl, conversionValue, isEnableUnitConversion) {
    return {
      drillDiameter: this.sharedService.convertUomToSaveAndCalculation(formCtrl['drillDiameter'].value || 0, conversionValue, isEnableUnitConversion),
      moldTemp: formCtrl['moldTemp'].value || 0,
      requiredCurrent: formCtrl['requiredCurrent'].value || 0,
      initialTemp: formCtrl['initialTemp'].value || 1.5,
      finalTemp: formCtrl['finalTemp'].value || 0,
      partArea: this.sharedService.convertUomToSaveAndCalculation(formCtrl['partArea'].value, conversionValue, isEnableUnitConversion) || 0,
      powerSupply: formCtrl['powerSupply'].value || 0,
    };
  }
}
