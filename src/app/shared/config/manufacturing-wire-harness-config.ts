import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SubProcessTypeInfoDto } from 'src/app/shared/models/subprocess-info.model';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class WireHarnessConfigService {
  constructor(private _fb: FormBuilder) {}

  setWireHarnessSubProcess(info: SubProcessTypeInfoDto, selectedProcessInfoId: number): FormGroup {
    const formGroup = this._fb.group({
      subProcessInfoId: [info.subProcessInfoId],
      processInfoId: selectedProcessInfoId || 0,
      subProcessTypeID: info.subProcessTypeId,
      recommendTonnage: [info.recommendTonnage],
      formLength: info.formLength,
      formHeight: info.formHeight,
      hlFactor: info.hlFactor,
      lengthOfCut: info.lengthOfCut,
      bendingLineLength: info.bendingLineLength,
      shoulderWidth: info.shoulderWidth,
      noOfBends: info.noOfBends,
      formPerimeter: info.formPerimeter,
      blankArea: info.blankArea,
      formingForce: info.formingForce,
      noOfNodePoints: info.noOfNodePoints,
      harnessRequirement: info.harnessRequirement,
      typeOfSplice: info.typeOfSplice,
      maxLength: info.maxLength,
      minLength: info.minLength,
      cableLengthArray: this._fb.array([]),
    });
    return formGroup;
  }
}
