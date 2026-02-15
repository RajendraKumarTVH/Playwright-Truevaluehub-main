import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { SubProcessTypeInfoDto } from '../models/subprocess-info.model';
import { ProcessInfoDto } from '../models';
@Injectable({
  providedIn: 'root',
})
export class AssemblyConfigService {
  constructor(
    private formbuilder: FormBuilder,
    public sharedService: SharedService
  ) {}

  getAssemblySubProcessList() {
    return [
      { id: AssemblyType.PickAndPlaceParts, name: 'Pick and Place Parts' },
      { id: AssemblyType.ThreadedFastening, name: 'Threaded Fastening' },
      { id: AssemblyType.ThreadedTightening, name: 'Threaded Tightening' },
      { id: AssemblyType.SnapPushFitting, name: 'Snap/push Fitting' },
      { id: AssemblyType.PopRivetting, name: 'Rivetting' },
      { id: AssemblyType.SelfStickSecuring, name: 'Self Stick Securing (Adhessive)' },
      { id: AssemblyType.Staking, name: 'staking' },
      { id: AssemblyType.TabTwisting, name: 'Tab Twisting' },
      { id: AssemblyType.TabBending, name: 'Tab Bending' },
      { id: AssemblyType.PressFitting, name: 'Press Fitting' },
      { id: AssemblyType.ReorientationOfAssembly, name: 'Reorientation of Assembly' },
      { id: AssemblyType.Clamping, name: 'Clamping' },
    ];
  }

  getHandingDifficultiesList() {
    return [
      { id: HandlingDifficulties.Easy, name: 'Easy' },
      { id: HandlingDifficulties.NestOrTangle, name: 'Nest or tangle' },
      { id: HandlingDifficulties.StickTogether, name: 'Stick together' },
      { id: HandlingDifficulties.SlipFromFingers, name: 'Slip from fingers' },
      { id: HandlingDifficulties.RequireCarefulHandling, name: 'Require careful handling' },
      { id: HandlingDifficulties.SeverNestOrTangle, name: 'Sever nest or tangle' },
    ];
  }
  getInsertionDifficultiesList() {
    return [
      { id: InsertionDifficulties.SelfLocating, name: 'self locating/Easy' },
      { id: InsertionDifficulties.NotSelfLocating, name: 'Not self locating' },
      { id: InsertionDifficulties.AccessSightObstructed, name: 'access/sight to mating location obstructed' },
      { id: InsertionDifficulties.AccessSightRestricted, name: 'Acess & sight of mating location restricted' },
    ];
  }

  getAssemblyCycleTImeList() {
    return [
      { id: AssemblyType.PickAndPlaceParts, cycleTime: 5 },
      { id: AssemblyType.ThreadedFastening, cycleTime: 6 },
      { id: AssemblyType.ThreadedTightening, cycleTime: 7 },
      { id: AssemblyType.SnapPushFitting, cycleTime: 6 },
      { id: AssemblyType.PopRivetting, cycleTime: 8 },
      { id: AssemblyType.SelfStickSecuring, cycleTime: 8 },
      { id: AssemblyType.Staking, cycleTime: 5 },
      { id: AssemblyType.TabTwisting, cycleTime: 8 },
      { id: AssemblyType.TabBending, cycleTime: 8 },
      { id: AssemblyType.PressFitting, cycleTime: 8 },
      { id: AssemblyType.ReorientationOfAssembly, cycleTime: 20 },
      { id: AssemblyType.Clamping, cycleTime: 7 },
    ];
  }

  getAssemblyComplexity() {
    return [
      { id: Complexity.VerySimple, name: 'Very Simple' },
      { id: Complexity.Simple, name: 'Simple' },
      { id: Complexity.Medium, name: 'Medium' },
      { id: Complexity.High, name: 'High' },
      { id: Complexity.VeryHigh, name: 'Heavy Fab' },
    ];
  }

  getAssemblyLoadingTimeList() {
    return [
      { from: 0, to: 1, loadUnloadTime: 10, pickPlace: 1, complexity: Complexity.VerySimple },
      { from: 1.001, to: 4, loadUnloadTime: 30, pickPlace: 1, complexity: Complexity.Simple },
      { from: 4.0001, to: 10, loadUnloadTime: 60, pickPlace: 1.5, complexity: Complexity.Medium },
      { from: 10.0001, to: 25, loadUnloadTime: 120, pickPlace: 2, complexity: Complexity.High },
      { from: 25.0001, to: 100000, loadUnloadTime: 300, pickPlace: 3, complexity: Complexity.VeryHigh },
    ];
  }

  getAssemblyHandlingDifficulties() {
    return [
      { difficulty: HandlingDifficulties.Easy, cycleTime: 1 },
      { difficulty: HandlingDifficulties.NestOrTangle, cycleTime: 1.1 },
      { difficulty: HandlingDifficulties.StickTogether, cycleTime: 1.2 },
      { difficulty: HandlingDifficulties.SlipFromFingers, cycleTime: 1.3 },
      { difficulty: HandlingDifficulties.RequireCarefulHandling, cycleTime: 1.4 },
      { difficulty: HandlingDifficulties.SeverNestOrTangle, cycleTime: 1.5 },
    ];
  }
  getAssemblyInsertionDifficulties() {
    return [
      { difficulty: InsertionDifficulties.SelfLocating, cycleTime: 1 },
      { difficulty: InsertionDifficulties.NotSelfLocating, cycleTime: 1.1 },
      { difficulty: InsertionDifficulties.AccessSightObstructed, cycleTime: 1.25 },
      { difficulty: InsertionDifficulties.AccessSightRestricted, cycleTime: 1.5 },
    ];
  }

  getAssemblyFormFields() {
    return {
      subProcessList: this.formbuilder.array([]),
      subProcessTypeID: '',
    };
  }

  getDynamicFormGroup(subprocessInfo: SubProcessTypeInfoDto, isAdditional: boolean = false, index: number = 0): FormGroup {
    const formGroup = this.formbuilder.group({
      subProcessInfoId: subprocessInfo.subProcessInfoId || null,
      processInfoId: subprocessInfo.processInfoId,
      subProcessTypeID: subprocessInfo.subProcessTypeId || AssemblyType.PickAndPlaceParts,
      formLength: subprocessInfo.formLength || 1,
      formHeight: subprocessInfo.formHeight || 0,
      formPerimeter: subprocessInfo.formPerimeter || 1,
      hlFactor: subprocessInfo.hlFactor || 0,
      lengthOfCut: subprocessInfo.lengthOfCut || 0,
      bendingLineLength: subprocessInfo.bendingLineLength || 0,
      isPickAndPlaceParts: subprocessInfo?.subProcessTypeId === AssemblyType.PickAndPlaceParts || isAdditional,
      subProcessIndex: index,
      recommendTonnage: 0,
    });
    return formGroup;
  }

  subFormPatch(manufactureInfo: ProcessInfoDto) {
    const resultArray = this.formbuilder.array([]) as FormArray;
    manufactureInfo?.subProcessTypeInfos?.forEach((subProcess) => {
      const formGroup = this.formbuilder.group({
        subProcessInfoId: null,
        subProcessTypeID: subProcess.subProcessTypeId,
        formLength: subProcess.formLength,
        formHeight: subProcess.formHeight,
        formPerimeter: subProcess.formPerimeter,
        hlFactor: subProcess.hlFactor,
        lengthOfCut: subProcess.lengthOfCut,
        bendingLineLength: subProcess.bendingLineLength,
        isPickAndPlaceParts: subProcess?.subProcessTypeId === AssemblyType.PickAndPlaceParts,
        recommendTonnage: 0,
      });
      resultArray.push(formGroup);
    });
    return resultArray;
  }

  setAssemblySubProcess(machineInfo: ProcessInfoDto, formArray) {
    if (machineInfo?.subProcessTypeInfos?.length > 0) {
      for (let i = 0; i < machineInfo?.subProcessTypeInfos?.length; i++) {
        const info = machineInfo?.subProcessTypeInfos[i];
        formArray?.push(this.getDynamicFormGroup(info));
      }
    } else {
      const subprocess = new SubProcessTypeInfoDto();
      subprocess.subProcessTypeId = AssemblyType.PickAndPlaceParts;
      formArray?.push(this.getDynamicFormGroup(subprocess, true));
    }
  }

  assemblyofConnectorMapper(manufactureInfo: ProcessInfoDto, manufacturingForm: FormGroup) {
    manufactureInfo.machineStrokes = manufacturingForm.controls['machineStrokes'].value;
    manufactureInfo.stitchingCycleTime = manufacturingForm.controls['stitchingCycleTime'].value;
    manufactureInfo.eolInspectionSamplingRate = manufacturingForm.controls['eolInspectionSamplingRate'].value;
    manufactureInfo.noOfStitchingStationsRequired = manufacturingForm.controls['noOfStitchingStationsRequired'].value;
    manufactureInfo.totalPinPopulation = manufacturingForm.controls['totalPinPopulation'].value;
    manufactureInfo.noOfTypesOfPins = manufacturingForm.controls['noOfTypesOfPins'].value;
    manufactureInfo.maxBomQuantityOfIndividualPinTypes = manufacturingForm.controls['maxBomQuantityOfIndividualPinTypes'].value;
    //manufactureInfo.noOfSkilledLabours = this.laborCountByMachineType?.find(x => x.machineTypeId === manufactureInfo.machineTypeId)?.lowSkilledLaborRate;

    manufactureInfo.isMachineStrokesDirty = manufacturingForm.controls['machineStrokes'].dirty;
    manufactureInfo.isStitchingCycleTime = manufacturingForm.controls['stitchingCycleTime'].dirty;
    manufactureInfo.isEOLInspectionSamplingRate = manufacturingForm.controls['eolInspectionSamplingRate'].dirty;
    manufactureInfo.isTotalPinPopulation = manufacturingForm.controls['totalPinPopulation'].dirty;
    manufactureInfo.isNoOfTypesOfPins = manufacturingForm.controls['noOfTypesOfPins'].dirty;
    manufactureInfo.isMaxBomQuantityOfIndividualPinTypes = manufacturingForm.controls['maxBomQuantityOfIndividualPinTypes'].dirty;
    manufactureInfo.isNoOfStitchingStationsRequired = manufacturingForm.controls['noOfStitchingStationsRequired'].dirty;
  }
}

export enum AssemblyType {
  PickAndPlaceParts = 1,
  ThreadedFastening = 2,
  ThreadedTightening = 3,
  SnapPushFitting = 4,
  PopRivetting = 5,
  SelfStickSecuring = 6,
  Staking = 7,
  TabTwisting = 8,
  TabBending = 9,
  PressFitting = 10,
  ReorientationOfAssembly = 11,
  Clamping = 12,
}

export enum HandlingDifficulties {
  Easy = 1,
  NestOrTangle = 2,
  StickTogether = 3,
  SlipFromFingers = 4,
  RequireCarefulHandling = 5,
  SeverNestOrTangle = 6,
}

export enum InsertionDifficulties {
  SelfLocating = 1,
  NotSelfLocating = 2,
  AccessSightObstructed = 3,
  AccessSightRestricted = 4,
}

export enum Complexity {
  VerySimple = 1,
  Simple = 2,
  Medium = 3,
  High = 4,
  VeryHigh = 5,
}
