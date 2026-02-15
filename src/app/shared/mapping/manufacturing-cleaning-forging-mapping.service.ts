import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { ProcessInfoDto } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ManufacturingCleaningForgingMappingService {
  constructor(
    private formbuilder: FormBuilder,
    private sharedService: SharedService
  ) {}
  getCleaningForgingFormFields() {
    return {
      subProcessTypeID: 1,
      efficiency: 0, // utilization
      allowanceAlongLength: 0, // min
      allowanceAlongWidth: 0, // min
      allowanceBetweenParts: 0, // min // height
      muffleLength: 0,
      muffleWidth: 0,
      initialStockHeight: 0,
      noofStroke: 0,
      noOfCore: 0,
      unloadingTime: 0,
      efficiencyFactor: 0, // Part stacking efficiency
      processTime: 0,
      directProcessCost: [0, [Validators.required]],
      inspectionType: 0,
    };
  }

  manufacturingCleaningForgingFormReset() {
    return {
      subProcessTypeID: 1,
      efficiency: 0,
      allowanceAlongLength: 0,
      allowanceAlongWidth: 0,
      allowanceBetweenParts: 0, // height
      muffleLength: 0,
      muffleWidth: 0,
      initialStockHeight: 0,
      noofStroke: 0,
      noOfCore: 0,
      unloadingTime: 0,
      efficiencyFactor: 0,
      processTime: 0,
      directProcessCost: 0,
      inspectionType: 0,
    };
  }

  manufacturingCleaningForgingFormPatch(obj: ProcessInfoDto, conversionValue, isEnableUnitConversion) {
    return {
      subProcessTypeID: this.sharedService.isValidNumber(obj.subProcessTypeID) || 1,
      efficiency: this.sharedService.isValidNumber(obj.efficiency) || 0,
      allowanceAlongLength: this.sharedService.convertUomInUI(obj.allowanceAlongLength || 0, conversionValue, isEnableUnitConversion),
      allowanceAlongWidth: this.sharedService.convertUomInUI(obj.allowanceAlongWidth || 0, conversionValue, isEnableUnitConversion),
      allowanceBetweenParts: this.sharedService.convertUomInUI(obj.allowanceBetweenParts || 0, conversionValue, isEnableUnitConversion), // height
      muffleLength: this.sharedService.convertUomInUI(obj.muffleLength, conversionValue || 0, isEnableUnitConversion),
      muffleWidth: this.sharedService.convertUomInUI(obj.muffleWidth, conversionValue || 0, isEnableUnitConversion),
      initialStockHeight: this.sharedService.convertUomInUI(obj.initialStockHeight || 0, conversionValue, isEnableUnitConversion),
      noofStroke: this.sharedService.isValidNumber(obj.noofStroke) || 0,
      noOfCore: this.sharedService.isValidNumber(obj.noOfCore) || 0,
      unloadingTime: this.sharedService.isValidNumber(obj.unloadingTime) || 0,
      efficiencyFactor: this.sharedService.isValidNumber(obj.efficiencyFactor) || 0,
      processTime: this.sharedService.isValidNumber(obj.processTime) || 0,
      directProcessCost: this.sharedService.isValidNumber(obj.directProcessCost) || 0,
      inspectionType: this.sharedService.isValidNumber(obj.inspectionType) || 0,
    };
  }

  manufacturingCleaningForgingFormAssignValue(manufactureInfo: ProcessInfoDto, formCtrl, conversionValue, isEnableUnitConversion) {
    manufactureInfo.subProcessTypeID = formCtrl['subProcessTypeID'].value || 1;
    manufactureInfo.efficiency = formCtrl['efficiency'].value || 0;
    manufactureInfo.allowanceAlongLength = this.sharedService.convertUomToSaveAndCalculation(formCtrl['allowanceAlongLength'].value || 0, conversionValue, isEnableUnitConversion);
    manufactureInfo.allowanceAlongWidth = this.sharedService.convertUomToSaveAndCalculation(formCtrl['allowanceAlongWidth'].value || 0, conversionValue, isEnableUnitConversion);
    manufactureInfo.allowanceBetweenParts = this.sharedService.convertUomToSaveAndCalculation(formCtrl['allowanceBetweenParts'].value || 0, conversionValue, isEnableUnitConversion);
    manufactureInfo.muffleLength = this.sharedService.convertUomToSaveAndCalculation(formCtrl['muffleLength'].value || 0, conversionValue, isEnableUnitConversion);
    manufactureInfo.muffleWidth = this.sharedService.convertUomToSaveAndCalculation(formCtrl['muffleWidth'].value || 0, conversionValue, isEnableUnitConversion);
    manufactureInfo.initialStockHeight = this.sharedService.convertUomToSaveAndCalculation(formCtrl['initialStockHeight'].value || 0, conversionValue, isEnableUnitConversion);
    manufactureInfo.noofStroke = formCtrl['noofStroke'].value || 0;
    manufactureInfo.noOfCore = formCtrl['noOfCore'].value || 0;
    manufactureInfo.unloadingTime = formCtrl['unloadingTime'].value || 0;
    manufactureInfo.efficiencyFactor = formCtrl['efficiencyFactor'].value || 0;
    manufactureInfo.processTime = formCtrl['processTime'].value || 0;
    manufactureInfo.directProcessCost = formCtrl['directProcessCost'].value || 0;
    manufactureInfo.inspectionType = formCtrl['inspectionType'].value || 0;
  }

  manufacturingCleaningForgingDirtyCheck(manufactureInfo: ProcessInfoDto, formCtrl) {
    manufactureInfo.isefficiencyDirty = formCtrl['efficiency'].dirty;
    manufactureInfo.isallowanceAlongLengthDirty = formCtrl['allowanceAlongLength'].dirty;
    manufactureInfo.isallowanceAlongWidthDirty = formCtrl['allowanceAlongWidth'].dirty;
    manufactureInfo.isallowanceBetweenPartsDirty = formCtrl['allowanceBetweenParts'].dirty;
    manufactureInfo.isMuffleLengthDirty = formCtrl['muffleLength'].dirty;
    manufactureInfo.isMuffleWidthDirty = formCtrl['muffleWidth'].dirty;
    manufactureInfo.isinitialStockHeightDirty = formCtrl['initialStockHeight'].dirty;
    manufactureInfo.isNoOfStrokesDirty = formCtrl['noofStroke'].dirty;
    manufactureInfo.isnoOfCoreDirty = formCtrl['noOfCore'].dirty;
    manufactureInfo.isLoadingTimeDirty = formCtrl['unloadingTime'].dirty;
    manufactureInfo.isEfficiencyFactorDirty = formCtrl['efficiencyFactor'].dirty;
    manufactureInfo.isProcessTimeDirty = formCtrl['processTime'].dirty;
  }

  manufacturingCleaningForgingFormPatchResults(result: ProcessInfoDto, conversionValue, isEnableUnitConversion) {
    return {
      efficiency: this.sharedService.isValidNumber(result.efficiency) || 0,
      allowanceAlongLength: this.sharedService.convertUomInUI(result.allowanceAlongLength || 0, conversionValue, isEnableUnitConversion),
      allowanceAlongWidth: this.sharedService.convertUomInUI(result.allowanceAlongWidth || 0, conversionValue, isEnableUnitConversion),
      allowanceBetweenParts: this.sharedService.convertUomInUI(result.allowanceBetweenParts || 0, conversionValue, isEnableUnitConversion), // height
      muffleLength: this.sharedService.convertUomInUI(result.muffleLength, conversionValue || 0, isEnableUnitConversion),
      muffleWidth: this.sharedService.convertUomInUI(result.muffleWidth, conversionValue || 0, isEnableUnitConversion),
      initialStockHeight: this.sharedService.convertUomInUI(result.initialStockHeight || 0, conversionValue, isEnableUnitConversion),
      noofStroke: this.sharedService.isValidNumber(result.noofStroke) || 0,
      noOfCore: this.sharedService.isValidNumber(result.noOfCore) || 0,
      unloadingTime: this.sharedService.isValidNumber(result.unloadingTime) || 0,
      efficiencyFactor: this.sharedService.isValidNumber(result.efficiencyFactor) || 0,
      processTime: this.sharedService.isValidNumber(result.processTime) || 0,
      directProcessCost: this.sharedService.isValidNumber(result.directProcessCost) || 0,
    };
  }

  manufacturingCleaningForgingFormSubmitPayLoad(formCtrl, conversionValue, isEnableUnitConversion) {
    return {
      subProcessTypeID: formCtrl['subProcessTypeID'].value || 1,
      efficiency: formCtrl['efficiency'].value || 0,
      allowanceAlongLength: this.sharedService.convertUomToSaveAndCalculation(formCtrl['allowanceAlongLength'].value || 0, conversionValue, isEnableUnitConversion),
      allowanceAlongWidth: this.sharedService.convertUomToSaveAndCalculation(formCtrl['allowanceAlongWidth'].value || 0, conversionValue, isEnableUnitConversion),
      allowanceBetweenParts: this.sharedService.convertUomToSaveAndCalculation(formCtrl['allowanceBetweenParts'].value || 0, conversionValue, isEnableUnitConversion),
      muffleLength: this.sharedService.convertUomToSaveAndCalculation(formCtrl['muffleLength'].value || 0, conversionValue, isEnableUnitConversion),
      muffleWidth: this.sharedService.convertUomToSaveAndCalculation(formCtrl['muffleWidth'].value || 0, conversionValue, isEnableUnitConversion),
      initialStockHeight: this.sharedService.convertUomToSaveAndCalculation(formCtrl['initialStockHeight'].value || 0, conversionValue, isEnableUnitConversion),
      noofStroke: formCtrl['noofStroke'].value || 0,
      noOfCore: formCtrl['noOfCore'].value || 0,
      unloadingTime: formCtrl['unloadingTime'].value || 0,
      efficiencyFactor: formCtrl['efficiencyFactor'].value || 0,
      processTime: formCtrl['processTime'].value || 0,
      directProcessCost: formCtrl['directProcessCost'].value || 0,
      inspectionType: formCtrl['inspectionType'].value || 0,
    };
  }
}
