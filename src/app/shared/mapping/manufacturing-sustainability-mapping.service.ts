import { Injectable } from '@angular/core';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { ProcessInfoDto } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ManufacturingSustainabilityMappingService {
  constructor(private sharedService: SharedService) {}
  getSustainabilityFormFields() {
    return {
      co2KwHr: 0,
      co2KgPart: 0,
      co2AnnualUsageHrs: 0,
      co2AnnualKgCO2: 0,
      co2AnnualKgCO2Part: 0,
    };
  }

  manufacturingSustainabilityFormReset() {
    return {
      co2KwHr: 0,
      co2KgPart: 0,
      co2AnnualUsageHrs: 0,
      co2AnnualKgCO2: 0,
      co2AnnualKgCO2Part: 0,
    };
  }

  manufacturingSustainabilityFormPatch(obj: ProcessInfoDto) {
    return {
      co2KwHr: this.sharedService.isValidNumber(obj.esgImpactElectricityConsumption) || 0,
      co2KgPart: this.sharedService.isValidNumber(obj.esgImpactFactoryImpact) || 0,
      co2AnnualUsageHrs: this.sharedService.isValidNumber(obj.esgImpactAnnualUsageHrs) || 0,
      co2AnnualKgCO2: this.sharedService.isValidNumber(obj.esgImpactAnnualKgCO2) || 0,
      co2AnnualKgCO2Part: this.sharedService.isValidNumber(obj.esgImpactAnnualKgCO2Part) || 0,
    };
  }

  manufacturingSustainabilityFormAssignValue(manufactureInfo: ProcessInfoDto, formCtrl) {
    manufactureInfo.esgImpactElectricityConsumption = formCtrl['co2KwHr'].value;
    manufactureInfo.esgImpactFactoryImpact = formCtrl['co2KgPart'].value;
    manufactureInfo.esgImpactAnnualUsageHrs = formCtrl['co2AnnualUsageHrs'].value;
    manufactureInfo.esgImpactAnnualKgCO2 = formCtrl['co2AnnualKgCO2'].value;
    manufactureInfo.esgImpactAnnualKgCO2Part = formCtrl['co2AnnualKgCO2Part'].value;
  }

  manufacturingSustainabilityDirtyCheck(manufactureInfo: ProcessInfoDto, formCtrl) {
    manufactureInfo.isesgImpactElectricityConsumptionDirty = formCtrl['co2KwHr'].dirty;
    // manufactureInfo.isesgImpactFactoryImpactDirty = formCtrl['co2KgPart'].dirty;
  }

  manufacturingSustainabilityFormPatchResults(result: ProcessInfoDto) {
    return {
      co2KwHr: this.sharedService.isValidNumber(result.esgImpactElectricityConsumption),
      co2KgPart: this.sharedService.isValidNumber(result.esgImpactFactoryImpact),
      co2AnnualUsageHrs: this.sharedService.isValidNumber(result.esgImpactAnnualUsageHrs),
      co2AnnualKgCO2: this.sharedService.isValidNumber(result.esgImpactAnnualKgCO2),
      co2AnnualKgCO2Part: this.sharedService.isValidNumber(result.esgImpactAnnualKgCO2Part),
    };
  }

  manufacturingSustainabilityFormSubmitPayLoad(formCtrl) {
    return {
      esgImpactElectricityConsumption: formCtrl['co2KwHr'].value,
      esgImpactFactoryImpact: formCtrl['co2KgPart'].value,
      esgImpactAnnualUsageHrs: formCtrl['co2AnnualUsageHrs'].value,
      esgImpactAnnualKgCO2: formCtrl['co2AnnualKgCO2'].value,
      esgImpactAnnualKgCO2Part: formCtrl['co2AnnualKgCO2Part'].value,
    };
  }
}
