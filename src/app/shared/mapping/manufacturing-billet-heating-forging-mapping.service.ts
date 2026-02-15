import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { ProcessInfoDto } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ManufacturingBilletHeatingForgingMappingService {
  constructor(
    private formbuilder: FormBuilder,
    private sharedService: SharedService
  ) {}
  getBilletHeatingForgingFormFields() {
    return {
      recBedSize: '',
      moldTemp: 0,
      requiredCurrent: 0,
      initialTemp: [300],
      finalTemp: [0],
      partArea: 0,
      powerSupply: [700],
      platenSizeWidth: 0,
      moldedPartCost: 0,
    };
  }

  manufacturingBilletHeatingForgingFormReset() {
    return {
      recBedSize: '',
      moldTemp: 0,
      requiredCurrent: 0,
      initialTemp: 300,
      finalTemp: 0,
      partArea: 0,
      powerSupply: 700,
      platenSizeWidth: 0,
      moldedPartCost: 0,
    };
  }

  manufacturingBilletHeatingForgingFormPatch(obj: ProcessInfoDto, conversionValue, isEnableUnitConversion) {
    return {
      recBedSize: obj.recBedSize || obj?.materialInfoList[0]?.materialMasterData?.materialTypeName,
      moldTemp: obj.moldTemp,
      requiredCurrent: obj.requiredCurrent,
      initialTemp: obj.initialTemp || 300,
      finalTemp: obj.finalTemp,
      partArea: this.sharedService.convertUomInUI(obj.partArea, conversionValue, isEnableUnitConversion),
      powerSupply: obj.powerSupply || 700,
      platenSizeWidth: this.sharedService.convertUomInUI(obj.platenSizeWidth, conversionValue, isEnableUnitConversion),
      moldedPartCost: obj.moldedPartCost || 0,
    };
  }

  manufacturingBilletHeatingForgingFormAssignValue(manufactureInfo: ProcessInfoDto, formCtrl, conversionValue, isEnableUnitConversion) {
    manufactureInfo.recBedSize = formCtrl['recBedSize'].value;
    manufactureInfo.moldTemp = formCtrl['moldTemp'].value;
    manufactureInfo.requiredCurrent = formCtrl['requiredCurrent'].value;
    manufactureInfo.initialTemp = Number(formCtrl['initialTemp'].value);
    manufactureInfo.finalTemp = formCtrl['finalTemp'].value;
    manufactureInfo.partArea = this.sharedService.convertUomToSaveAndCalculation(formCtrl['partArea'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.powerSupply = formCtrl['powerSupply'].value;
    manufactureInfo.platenSizeWidth = this.sharedService.convertUomToSaveAndCalculation(formCtrl['platenSizeWidth'].value, conversionValue, isEnableUnitConversion);
    manufactureInfo.moldedPartCost = formCtrl['moldedPartCost'].value;
  }

  manufacturingBilletHeatingForgingDirtyCheck(manufactureInfo: ProcessInfoDto, formCtrl) {
    manufactureInfo.ismoldTempDirty = formCtrl['moldTemp'].dirty;
    manufactureInfo.isrequiredCurrentDirty = formCtrl['requiredCurrent'].dirty;
    manufactureInfo.isInitialTempDirty = formCtrl['initialTemp'].dirty;
    manufactureInfo.isfinalTempDirty = formCtrl['finalTemp'].dirty;
    manufactureInfo.ispartAreaDirty = formCtrl['partArea'].dirty;
    manufactureInfo.isPowerSupplyDirty = formCtrl['powerSupply'].dirty;
    manufactureInfo.isplatenSizeWidthDirty = formCtrl['platenSizeWidth'].dirty;
    manufactureInfo.ismoldedPartCostDirty = formCtrl['moldedPartCost'].dirty;
  }

  manufacturingBilletHeatingForgingFormPatchResults(result: ProcessInfoDto, conversionValue, isEnableUnitConversion) {
    return {
      recBedSize: result.recBedSize,
      moldTemp: this.sharedService.isValidNumber(result.moldTemp),
      requiredCurrent: this.sharedService.isValidNumber(result.requiredCurrent),
      initialTemp: this.sharedService.isValidNumber(result.initialTemp),
      finalTemp: this.sharedService.isValidNumber(result.finalTemp),
      partArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.partArea), conversionValue, isEnableUnitConversion),
      powerSupply: this.sharedService.isValidNumber(result.powerSupply),
      platenSizeWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.platenSizeWidth), conversionValue, isEnableUnitConversion),
      moldedPartCost: this.sharedService.isValidNumber(result.moldedPartCost),
    };
  }

  manufacturingBilletHeatingForgingFormSubmitPayLoad(formCtrl, conversionValue, isEnableUnitConversion) {
    return {
      recBedSize: formCtrl['recBedSize'].value || '',
      moldTemp: formCtrl['moldTemp'].value || 0,
      requiredCurrent: formCtrl['requiredCurrent'].value || 0,
      initialTemp: formCtrl['initialTemp'].value || 0,
      finalTemp: formCtrl['finalTemp'].value || 0,
      partArea: this.sharedService.convertUomToSaveAndCalculation(formCtrl['partArea'].value, conversionValue, isEnableUnitConversion) || 0,
      powerSupply: formCtrl['powerSupply'].value || 0,
      platenSizeWidth: this.sharedService.convertUomToSaveAndCalculation(formCtrl['platenSizeWidth'].value, conversionValue, isEnableUnitConversion) || 0,
      moldedPartCost: formCtrl['moldedPartCost'].value || 0,
    };
  }
}
