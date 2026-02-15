import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { ProcessInfoDto } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ManufacturingPlasticVacuumFormingMappingService {
  constructor(
    private formbuilder: FormBuilder,
    private sharedService: SharedService
  ) {}
  getPlasticVacuumFormingFormFields() {
    return {};
  }

  manufacturingPlasticVacuumFormingFormReset() {
    return {};
  }

  manufacturingPlasticVacuumFormingFormPatch(_obj: ProcessInfoDto) {
    return {};
  }

  manufacturingPlasticVacuumFormingFormAssignValue(_manufactureInfo: ProcessInfoDto) {
    return {};
  }

  manufacturingPlasticVacuumFormingDirtyCheck(_manufactureInfo: ProcessInfoDto, _formCtrl) {
    return {};
  }

  manufacturingPlasticVacuumFormingFormPatchResults(_result: ProcessInfoDto) {
    return {};
  }

  manufacturingPlasticVacuumFormingFormSubmitPayLoad(_formCtrl) {
    return {};
  }
}
