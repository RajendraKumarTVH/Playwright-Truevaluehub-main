import { Injectable } from '@angular/core';
import { MaterialInfoDto } from '../models';
import { SharedService } from 'src/app/modules/costing/services/shared.service';

@Injectable({
  providedIn: 'root',
})
export class RigidFlexMaterialMappingService {
  constructor(public sharedService: SharedService) {}
  getFormFields() {
    return {
      typeOfCable: 0,
      typeOfConductor: 0,
    };
  }

  formFieldsReset() {
    return {
      typeOfCable: 0,
      typeOfConductor: 0,
    };
  }

  formPatch(materialInfo: MaterialInfoDto) {
    return {
      typeOfCable: materialInfo?.typeOfCable,
      typeOfConductor: materialInfo?.typeOfConductor,
    };
  }

  materialDirtyCheck(materialInfo: MaterialInfoDto, formCtrl) {
    materialInfo.isTypeOfCableDirty = formCtrl['typeOfCable'].dirty;
  }

  materialFormAssignValue(materialInfo: MaterialInfoDto, formCtrl) {
    materialInfo.typeOfCable = formCtrl['typeOfCable'].value;
    materialInfo.typeOfConductor = formCtrl['typeOfConductor'].value;
  }

  formPatchResults(result: MaterialInfoDto) {
    return {
      typeOfCable: this.sharedService.isValidNumber(result.typeOfCable),
      totalCableLength: this.sharedService.isValidNumber(result.totalCableLength),
    };
  }

  setPayload(materialInfo, formCtrl) {
    materialInfo.typeOfCable = Number(formCtrl['typeOfCable'].value);
    materialInfo.typeOfConducto = Number(formCtrl['typeOfConductor'].value);
  }
}
