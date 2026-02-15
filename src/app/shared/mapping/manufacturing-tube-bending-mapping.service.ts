import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { ProcessInfoDto } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ManufacturingTubeBendingMappingService {
  constructor(
    private formbuilder: FormBuilder,
    private sharedService: SharedService
  ) {}
  getTubeBendingFormFields() {
    return {
      noOfHitsRequired: 1,
      loadingTime: 0,
      unloadingTime: 0,
      sheetLoadUloadTime: [0, [Validators.required]],
      weldingPosition: 0,
      rotationTime: 0,
      wireTwistingSpeed: 0,
      cuttingTime: [0, [Validators.required]],
      noOfBendsPerXAxis: 0,
      noOfBendsPerYAxis: 0,
      noOfBendsPerZAxis: 0,
      noOfbends: 0,
      directProcessCost: [0, [Validators.required]],
    };
  }

  manufacturingTubeBendingFormReset() {
    return {
      noOfHitsRequired: 1,
      loadingTime: 0,
      unloadingTime: 0,
      sheetLoadUloadTime: 0,
      weldingPosition: 0,
      rotationTime: 0,
      wireTwistingSpeed: 0,
      cuttingTime: 0,
      noOfBendsPerXAxis: 0,
      noOfBendsPerYAxis: 0,
      noOfBendsPerZAxis: 0,
      noOfbends: 0,
      directProcessCost: 0,
    };
  }

  manufacturingTubeBendingFormPatch(obj: ProcessInfoDto) {
    return {
      noOfHitsRequired: this.sharedService.isValidNumber(obj.noOfHitsRequired) || 1,
      loadingTime: this.sharedService.isValidNumber(obj.loadingTime) || 0,
      unloadingTime: this.sharedService.isValidNumber(obj.unloadingTime) || 0,
      sheetLoadUloadTime: this.sharedService.isValidNumber(obj.sheetLoadUloadTime),
      weldingPosition: this.sharedService.isValidNumber(obj.weldingPosition) || 0,
      rotationTime: this.sharedService.isValidNumber(obj.rotationTime) || 0,
      wireTwistingSpeed: this.sharedService.isValidNumber(obj.wireTwistingSpeed) || 0,
      cuttingTime: this.sharedService.isValidNumber(obj.cuttingTime),
      noOfBendsPerXAxis: this.sharedService.isValidNumber(obj.noOfBendsPerXAxis),
      noOfBendsPerYAxis: this.sharedService.isValidNumber(obj.noOfBendsPerYAxis),
      noOfBendsPerZAxis: this.sharedService.isValidNumber(obj.noOfBendsPerZAxis),
      noOfbends: this.sharedService.isValidNumber(obj.noOfbends),
      directProcessCost: this.sharedService.isValidNumber(obj.directProcessCost),
    };
  }

  manufacturingTubeBendingFormAssignValue(manufactureInfo: ProcessInfoDto, formCtrl) {
    manufactureInfo.noOfHitsRequired = formCtrl['noOfHitsRequired'].value || 1;
    manufactureInfo.loadingTime = formCtrl['loadingTime'].value;
    manufactureInfo.unloadingTime = formCtrl['unloadingTime'].value;
    manufactureInfo.sheetLoadUloadTime = formCtrl['sheetLoadUloadTime'].value;
    manufactureInfo.weldingPosition = formCtrl['weldingPosition'].value;
    manufactureInfo.rotationTime = formCtrl['rotationTime'].value;
    manufactureInfo.cuttingTime = formCtrl['cuttingTime'].value;
    manufactureInfo.wireTwistingSpeed = formCtrl['wireTwistingSpeed'].value;
    manufactureInfo.noOfBendsPerXAxis = formCtrl['noOfBendsPerXAxis'].value;
    manufactureInfo.noOfBendsPerYAxis = formCtrl['noOfBendsPerYAxis'].value;
    manufactureInfo.noOfBendsPerZAxis = formCtrl['noOfBendsPerZAxis'].value;
    manufactureInfo.noOfbends = formCtrl['noOfbends'].value;
  }

  manufacturingTubeBendingDirtyCheck(manufactureInfo: ProcessInfoDto, formCtrl) {
    manufactureInfo.isNoOfHitsRequiredDirty = formCtrl['noOfHitsRequired'].dirty;
    manufactureInfo.isLoadingTimeDirty = formCtrl['loadingTime'].dirty;
    manufactureInfo.isUnloadingTimeDirty = formCtrl['unloadingTime'].dirty;
    manufactureInfo.isWeldingPositionDirty = formCtrl['weldingPosition'].dirty;
    manufactureInfo.isRotationTimeDirty = formCtrl['rotationTime'].dirty;
    manufactureInfo.isSheetLoadULoadTimeDirty = formCtrl['sheetLoadUloadTime'].dirty;
    manufactureInfo.isCuttingTimeDirty = formCtrl['cuttingTime'].dirty;
    manufactureInfo.isWireTwistingSpeedDirty = formCtrl['wireTwistingSpeed'].dirty;
  }

  manufacturingTubeBendingFormPatchResults(result: ProcessInfoDto) {
    return {
      noOfHitsRequired: this.sharedService.isValidNumber(result.noOfHitsRequired),
      loadingTime: this.sharedService.isValidNumber(result.loadingTime),
      unloadingTime: this.sharedService.isValidNumber(result.unloadingTime),
      sheetLoadUloadTime: this.sharedService.isValidNumber(result.sheetLoadUloadTime),
      weldingPosition: this.sharedService.isValidNumber(result?.weldingPosition),
      rotationTime: this.sharedService.isValidNumber(result.rotationTime),
      cuttingTime: this.sharedService.isValidNumber(result.cuttingTime),
      wireTwistingSpeed: this.sharedService.isValidNumber(result.wireTwistingSpeed),
      noOfBendsPerXAxis: this.sharedService.isValidNumber(result.noOfBendsPerXAxis),
      noOfBendsPerYAxis: this.sharedService.isValidNumber(result.noOfBendsPerYAxis),
      noOfBendsPerZAxis: this.sharedService.isValidNumber(result.noOfBendsPerZAxis),
      noOfbends: this.sharedService.isValidNumber(result.noOfbends),
      directProcessCost: this.sharedService.isValidNumber(result.directProcessCost),
    };
  }

  manufacturingTubeBendingFormSubmitPayLoad(formCtrl) {
    return {
      noOfHitsRequired: formCtrl['noOfHitsRequired'].value,
      loadingTime: formCtrl['loadingTime'].value,
      unloadingTime: formCtrl['unloadingTime'].value,
      sheetLoadUloadTime: formCtrl['sheetLoadUloadTime'].value,
      weldingPosition: formCtrl['weldingPosition'].value,
      rotationTime: formCtrl['rotationTime'].value,
      wireTwistingSpeed: formCtrl['wireTwistingSpeed'].value,
      cuttingTime: formCtrl['cuttingTime'].value,
      noOfBendsPerXAxis: formCtrl['noOfBendsPerXAxis'].value,
      noOfBendsPerYAxis: formCtrl['noOfBendsPerYAxis'].value,
      noOfBendsPerZAxis: formCtrl['noOfBendsPerZAxis'].value,
      noOfbends: formCtrl['noOfbends'].value,
      directProcessCost: formCtrl['directProcessCost'].value,
    };
  }
}
