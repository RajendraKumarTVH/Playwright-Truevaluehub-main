import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { ProcessInfoDto } from '../models';

@Injectable({
  providedIn: 'root',
})
export class ManufacturingPlasticTubeExtrusionMappingService {
  constructor(private sharedService: SharedService) {}
  getPlasticTubeExtrusionFormFields() {
    return {
      drillDiameter: [50, [Validators.required]],
      cuttingSpeed: [0, [Validators.required]],
      processTime: 0,
      efficiency: [85],
      cycleTime: [0],
      noOfParts: [0],
      directProcessCost: [0, [Validators.required]],
      cuttingTime: [0, [Validators.required]],
      bourdanRate: [0, [Validators.required]],
      injectionRate: [0, [Validators.required]],
    };
  }

  manufacturingPlasticTubeExtrusionFormReset() {
    return {
      drillDiameter: 50,
      cuttingSpeed: 0,
      processTime: 0,
      directProcessCost: 0,
      noOfParts: 0,
      efficiency: 85,
      cycleTime: 0,
      cuttingTime: 0,
      bourdanRate: 0,
      injectionRate: 0,
    };
  }

  manufacturingPlasticTubeExtrusionFormPatch(obj: ProcessInfoDto) {
    return {
      drillDiameter: obj.drillDiameter || 50,
      cuttingSpeed: this.sharedService.isValidNumber(obj.cuttingSpeed),
      processTime: obj.processTime || 0,
      directProcessCost: this.sharedService.isValidNumber(obj.directProcessCost),
      noOfParts: this.sharedService.isValidNumber(obj.noOfParts),
      efficiency: obj.efficiency || 85,
      cycleTime: this.sharedService.isValidNumber(obj.cycleTime),
      cuttingTime: this.sharedService.isValidNumber(obj.cuttingTime),
      bourdanRate: this.sharedService.isValidNumber(obj.bourdanRate),
      injectionRate: this.sharedService.isValidNumber(obj.injectionRate),
    };
  }

  manufacturingPlasticTubeExtrusionFormAssignValue(manufactureInfo: ProcessInfoDto, formCtrl) {
    manufactureInfo.drillDiameter = formCtrl['drillDiameter'].value;
    manufactureInfo.cuttingSpeed = formCtrl['cuttingSpeed'].value;
    manufactureInfo.processTime = formCtrl['processTime'].value;
    manufactureInfo.efficiency = formCtrl['efficiency'].value;
    manufactureInfo.cycleTime = formCtrl['cycleTime'].value;
    manufactureInfo.noOfParts = formCtrl['noOfParts'].value;
    manufactureInfo.cuttingTime = formCtrl['cuttingTime'].value;
    manufactureInfo.bourdanRate = formCtrl['bourdanRate'].value;
    manufactureInfo.injectionRate = formCtrl['injectionRate'].value;
  }

  manufacturingPlasticTubeExtrusionDirtyCheck(manufactureInfo: ProcessInfoDto, formCtrl) {
    manufactureInfo.isDrillDiameterDirty = formCtrl['drillDiameter'].dirty;
    manufactureInfo.iscuttingSpeedDirty = formCtrl['cuttingSpeed'].dirty;
    manufactureInfo.isProcessTimeDirty = formCtrl['processTime'].dirty;
    manufactureInfo.isefficiencyDirty = formCtrl['efficiency'].dirty;
    manufactureInfo.isnoOfPartsDirty = formCtrl['noOfParts'].dirty;
    manufactureInfo.isCuttingTimeDirty = formCtrl['cuttingTime'].dirty;
    manufactureInfo.isbourdanRateDirty = formCtrl['bourdanRate'].dirty;
    manufactureInfo.isinjectionRateDirty = formCtrl['injectionRate'].dirty;
    manufactureInfo.iscycleTimeDirty = !!formCtrl['cycleTime'].value && (formCtrl['cycleTime'].dirty || manufactureInfo.iscycleTimeDirty);
  }

  manufacturingPlasticTubeExtrusionFormPatchResults(result: ProcessInfoDto) {
    return {
      drillDiameter: this.sharedService.isValidNumber(result.drillDiameter),
      cuttingSpeed: this.sharedService.isValidNumber(result.cuttingSpeed),
      processTime: this.sharedService.isValidNumber(result.processTime),
      directProcessCost: this.sharedService.isValidNumber(result.directProcessCost),
      efficiency: this.sharedService.isValidNumber(result.efficiency),
      cycleTime: this.sharedService.isValidNumber(result.cycleTime),
      noOfParts: this.sharedService.isValidNumber(result.noOfParts),
      cuttingTime: this.sharedService.isValidNumber(result.cuttingTime),
      bourdanRate: this.sharedService.isValidNumber(result.bourdanRate),
      injectionRate: this.sharedService.isValidNumber(result.injectionRate),
    };
  }

  manufacturingPlasticTubeExtrusionFormSubmitPayLoad(formCtrl) {
    return {
      drillDiameter: formCtrl['drillDiameter'].value || 50,
      cuttingSpeed: formCtrl['cuttingSpeed'].value || 0,
      processTime: formCtrl['processTime'].value || 0,
      noOfParts: formCtrl['noOfParts'].value || 0,
      directProcessCost: formCtrl['directProcessCost'].value || 0,
      efficiency: formCtrl['efficiency'].value,
      cycleTime: formCtrl['cycleTime'].value || 0,
      cuttingTime: formCtrl['cuttingTime'].value,
      bourdanRate: formCtrl['bourdanRate'].value,
      injectionRate: formCtrl['injectionRate'].value,
    };
  }
}
