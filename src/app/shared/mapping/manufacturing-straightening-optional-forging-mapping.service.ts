import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { ProcessInfoDto } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ManufacturingStraighteningOptionalForgingMappingService {
  constructor(
    private formbuilder: FormBuilder,
    private sharedService: SharedService
  ) {}

  getStraighteningOptionalForgingFormFields(conversionValue: any, isEnableUnitConversion: boolean) {
    return {
      noOfStartsPierce: [0, [Validators.required]],
      allowanceAlongLength: this.sharedService.convertUomInUI(0, conversionValue, isEnableUnitConversion),
      allowanceAlongWidth: this.sharedService.convertUomInUI(0, conversionValue, isEnableUnitConversion),
    };
  }

  manufacturingStraighteningOptionalForgingFormReset(conversionValue: any, isEnableUnitConversion: boolean) {
    return {
      noOfStartsPierce: 0,
      allowanceAlongLength: this.sharedService.convertUomInUI(0, conversionValue, isEnableUnitConversion),
      allowanceAlongWidth: this.sharedService.convertUomInUI(0, conversionValue, isEnableUnitConversion),
    };
  }

  manufacturingStraighteningOptionalForgingFormPatch(obj: ProcessInfoDto, conversionValue: any, isEnableUnitConversion: boolean) {
    return {
      noOfStartsPierce: this.sharedService.isValidNumber(obj.noOfStartsPierce) ?? 0,
      allowanceAlongLength: this.sharedService.convertUomInUI(obj.allowanceAlongLength ?? 0, conversionValue, isEnableUnitConversion),
      allowanceAlongWidth: this.sharedService.convertUomInUI(obj.allowanceAlongWidth ?? 0, conversionValue, isEnableUnitConversion),
    };
  }

  manufacturingStraighteningOptionalForgingFormAssignValue(manufactureInfo: ProcessInfoDto, formCtrl: any, conversionValue: any, isEnableUnitConversion: boolean) {
    manufactureInfo.noOfStartsPierce = Number(formCtrl['noOfStartsPierce'].value) ?? 0;
    manufactureInfo.allowanceAlongLength = this.sharedService.convertUomToSaveAndCalculation(formCtrl['allowanceAlongLength'].value ?? 0, conversionValue, isEnableUnitConversion);
    manufactureInfo.allowanceAlongWidth = this.sharedService.convertUomToSaveAndCalculation(formCtrl['allowanceAlongWidth'].value ?? 0, conversionValue, isEnableUnitConversion);
  }

  manufacturingStraighteningOptionalForgingDirtyCheck(manufactureInfo: ProcessInfoDto, formCtrl: any) {
    manufactureInfo.isNoOfStartsPierceDirty = formCtrl['noOfStartsPierce'].dirty ?? false;
    manufactureInfo.isallowanceAlongLengthDirty = formCtrl['allowanceAlongLength'].dirty ?? false;
    manufactureInfo.isallowanceAlongWidthDirty = formCtrl['allowanceAlongWidth'].dirty ?? false;
  }

  manufacturingStraighteningOptionalForgingFormPatchResults(result: ProcessInfoDto, conversionValue: any, isEnableUnitConversion: boolean) {
    return {
      noOfStartsPierce: this.sharedService.isValidNumber(result?.noOfStartsPierce) ?? 0,
      allowanceAlongLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.allowanceAlongLength) ?? 0, conversionValue, isEnableUnitConversion),
      allowanceAlongWidth: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(result.allowanceAlongWidth) ?? 0, conversionValue, isEnableUnitConversion),
    };
  }

  manufacturingStraighteningOptionalForgingFormSubmitPayLoad(formCtrl: any, conversionValue: any, isEnableUnitConversion: boolean) {
    return {
      noOfStartsPierce: formCtrl['noOfStartsPierce'].value ?? 0,
      allowanceAlongLength: this.sharedService.convertUomToSaveAndCalculation(formCtrl['allowanceAlongLength'].value ?? 0, conversionValue, isEnableUnitConversion),
      allowanceAlongWidth: this.sharedService.convertUomToSaveAndCalculation(formCtrl['allowanceAlongWidth'].value ?? 0, conversionValue, isEnableUnitConversion),
    };
  }
}
