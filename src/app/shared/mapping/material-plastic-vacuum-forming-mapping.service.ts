import { Injectable } from '@angular/core';
import { MaterialInfoDto } from '../models';

@Injectable({
  providedIn: 'root',
})
export class MaterialPlasticVacuumFormingMappingService {
  getPlasticVacuumFormingFormFields(_materialInfoList) {
    return {};
  }

  plasticVacuumFormingFormFieldsReset() {
    return {};
  }

  plasticVacuumFormingFormPatch(_materialInfo: MaterialInfoDto) {
    return {};
  }

  plasticVacuumFormingSetCalculationObject(_materialInfo, _material) {
    return {};
  }

  plasticVacuumFormingFormPatchResults(_result: MaterialInfoDto) {
    return {};
  }

  plasticVacuumFormingSetPayload(_material) {
    return {};
  }
}
