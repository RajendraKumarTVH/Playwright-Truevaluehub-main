import { Injectable } from '@angular/core';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { ProcessInfoDto } from '../models';

@Injectable({
  providedIn: 'root',
})
export class SheetMetalProcessMapperService {
  constructor(public sharedService: SharedService) {}

  getFormFields() {
    return {
      lengthOfCut: 0,
      noOfStartsPierce: 0,
      cuttingSpeed: 0,

      noOfHitsRequired: 0,
      noOfHoles: 0,
      noofStroke: 0,
      noOfCore: 0,
      noOfbends: 0,
      cuttingTime: 0,
      pouringTime: 0,
      rotationTime: 0,
      injectionTime: 0,
      processTime: 0,
      totalTime: 0,
      coolingTime: 0,
      soakingTime: 0,
    };
  }

  formReset() {
    return {
      lengthOfCut: 0,
      noOfStartsPierce: 0,
      cuttingSpeed: 0,
      noOfHitsRequired: 0,
      noOfHoles: 0,
      noofStroke: 0,
      noOfCore: 0,
      noOfbends: 0,
      cuttingTime: 0,
      pouringTime: 0,
      rotationTime: 0,
      injectionTime: 0,
      processTime: 0,
      totalTime: 0,
      coolingTime: 0,
      soakingTime: 0,
    };
  }

  formPatch(manufactureInfo: ProcessInfoDto, conversionValue, isEnableUnitConversion: boolean) {
    return {
      lengthOfCut: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(manufactureInfo.lengthOfCut), conversionValue, isEnableUnitConversion),
      noOfStartsPierce: manufactureInfo.noOfStartsPierce,
      cuttingSpeed: manufactureInfo.cuttingSpeed,
      noOfHitsRequired: manufactureInfo.noOfHitsRequired,
      noOfHoles: manufactureInfo.noOfHoles,
      noofStroke: manufactureInfo.noofStroke,
      noOfCore: manufactureInfo.noOfCore,
      noOfbends: manufactureInfo.noOfbends,
      cuttingTime: manufactureInfo.cuttingTime,
      pouringTime: manufactureInfo.pouringTime,
      rotationTime: manufactureInfo.rotationTime,
      injectionTime: manufactureInfo.injectionTime,
      processTime: manufactureInfo.processTime,
      totalTime: manufactureInfo.totalTime,
      coolingTime: manufactureInfo.coolingTime,
      soakingTime: manufactureInfo.soakingTime,
    };
  }

  setCalculationObject(manufactureInfo: any, formCtrl: any) {
    manufactureInfo.lengthOfCut = formCtrl['lengthOfCut'].value;
    manufactureInfo.noOfStartsPierce = formCtrl['noOfStartsPierce'].value;
    manufactureInfo.cuttingSpeed = formCtrl['cuttingSpeed'].value;

    // ▼ Newly added fields
    manufactureInfo.noOfHitsRequired = formCtrl['noOfHitsRequired'].value;
    manufactureInfo.noOfHoles = formCtrl['noOfHoles'].value;
    manufactureInfo.noofStroke = formCtrl['noofStroke'].value;
    manufactureInfo.noOfCore = formCtrl['noOfCore'].value;
    manufactureInfo.noOfbends = formCtrl['noOfbends'].value;
    manufactureInfo.cuttingTime = formCtrl['cuttingTime'].value;
    manufactureInfo.pouringTime = formCtrl['pouringTime'].value;
    manufactureInfo.rotationTime = formCtrl['rotationTime'].value;
    manufactureInfo.injectionTime = formCtrl['injectionTime'].value;
    manufactureInfo.processTime = formCtrl['processTime'].value;
    manufactureInfo.totalTime = formCtrl['totalTime'].value;

    manufactureInfo.coolingTime = formCtrl['coolingTime'].value;
    manufactureInfo.soakingTime = formCtrl['soakingTime'].value;
  }

  dirtyCheck(manufactureInfo: any, formCtrl: any) {
    manufactureInfo.isLengthOfCutDirty = formCtrl['lengthOfCut']?.dirty;
    manufactureInfo.isNoOfStartsPierceDirty = formCtrl['noOfStartsPierce']?.dirty;
    manufactureInfo.iscuttingSpeedDirty = formCtrl['cuttingSpeed']?.dirty;

    manufactureInfo.isNoOfHitsRequiredDirty = formCtrl['noOfHitsRequired']?.dirty;
    manufactureInfo.isNoOfHolesDirty = formCtrl['noOfHoles']?.dirty;
    manufactureInfo.isNoOfStrokesDirty = formCtrl['noofStroke']?.dirty;
    manufactureInfo.isnoOfCoreDirty = formCtrl['noOfCore']?.dirty;
    manufactureInfo.isNoOfBends = formCtrl['noOfbends']?.dirty;
    manufactureInfo.isCuttingTimeDirty = formCtrl['cuttingTime']?.dirty;
    manufactureInfo.ispouringTimeDirty = formCtrl['pouringTime']?.dirty;
    manufactureInfo.isRotationTimeDirty = formCtrl['rotationTime']?.dirty;
    manufactureInfo.isinjectionTimeDirty = formCtrl['injectionTime']?.dirty;
    manufactureInfo.isProcessTimeDirty = formCtrl['processTime']?.dirty;
    manufactureInfo.isTotalTimeDirty = formCtrl['totalTime']?.dirty;

    manufactureInfo.iscoolingTimeDirty = formCtrl['coolingTime']?.dirty;
    manufactureInfo.issoakingTimeDirty = formCtrl['soakingTime']?.dirty;

    return manufactureInfo;
  }

  processPayload(formCtrl: any) {
    return {
      lengthOfCut: formCtrl['lengthOfCut'].value,
      noOfStartsPierce: formCtrl['noOfStartsPierce'].value,
      cuttingSpeed: formCtrl['cuttingSpeed'].value,

      noOfHitsRequired: formCtrl['noOfHitsRequired'].value,
      noOfHoles: formCtrl['noOfHoles'].value,
      noofStroke: formCtrl['noofStroke'].value,
      noOfCore: formCtrl['noOfCore'].value,
      noOfbends: formCtrl['noOfbends'].value,
      cuttingTime: formCtrl['cuttingTime'].value,
      pouringTime: formCtrl['pouringTime'].value,
      rotationTime: formCtrl['rotationTime'].value,
      injectionTime: formCtrl['injectionTime'].value,
      processTime: formCtrl['processTime'].value,
      totalTime: formCtrl['totalTime'].value,
      coolingTime: formCtrl['coolingTime'].value,
      soakingTime: formCtrl['soakingTime'].value,
    };
  }
}
