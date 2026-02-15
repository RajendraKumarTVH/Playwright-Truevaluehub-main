import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ProcessInfoDto } from '../models';
import { SharedService } from 'src/app/modules/costing/services/shared.service';

@Injectable({
  providedIn: 'root',
})
export class ManufacturingMachiningMappingService {
  constructor(
    private formbuilder: FormBuilder,
    private sharedService: SharedService
  ) {}

  getMachiningFormFields() {
    return {
      directTooling: [0],
      unloadingTime: 0,
      directProcessCost: [0, [Validators.required]],
      machiningOperationType: this.formbuilder.array([]),
    };
  }
  manufacturingMachiningFormReset() {
    return {
      directTooling: 0,
      unloadingTime: 0,
      directProcessCost: 0,
    };
  }

  manufacturingMachiningFormPatch(obj: ProcessInfoDto) {
    return {
      directTooling: this.sharedService.isValidNumber(obj.directTooling),
      unloadingTime: obj.unloadingTime || 0,
      directProcessCost: this.sharedService.isValidNumber(obj.directProcessCost),
    };
  }

  manufacturingMachiningFormAssignValue(manufactureInfo: ProcessInfoDto, formCtrl) {
    manufactureInfo.directTooling = formCtrl['directTooling'].value;
    manufactureInfo.unloadingTime = formCtrl['unloadingTime'].value;
  }

  manufacturingMachiningDirtyCheck(manufactureInfo: ProcessInfoDto, formCtrl) {
    manufactureInfo.isDirectToolingDirty = formCtrl['directTooling'].dirty;
    manufactureInfo.isUnloadingTimeDirty = formCtrl['unloadingTime'].dirty;
  }

  manufacturingMachiningFormPatchResults(result: ProcessInfoDto) {
    return {
      directTooling: this.sharedService.isValidNumber(result.directTooling),
      unloadingTime: this.sharedService.isValidNumber(result.unloadingTime),
      directProcessCost: this.sharedService.isValidNumber(result.directProcessCost),
    };
  }

  manufacturingMachiningFormSubmitPayLoad(formCtrl) {
    return {
      directTooling: formCtrl['directTooling'].value,
      unloadingTime: formCtrl['unloadingTime'].value,
      directProcessCost: formCtrl['directProcessCost'].value,
    };
  }
}
