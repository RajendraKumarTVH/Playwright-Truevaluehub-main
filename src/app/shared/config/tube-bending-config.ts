import { Injectable } from '@angular/core';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { FormBuilder } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class TubeBendingConfigService {
  constructor(
    private formbuilder: FormBuilder,
    public sharedService: SharedService
  ) {}

  getLoadingUnloadingTime(weight: number) {
    const loadingUnloadingTime = [
      { toWeight: 0.5, duration: 3 },
      { toWeight: 1, duration: 5 },
      { toWeight: 3, duration: 8 },
      { toWeight: 5, duration: 12 },
      { toWeight: 8, duration: 18 },
      { toWeight: 10, duration: 25 },
      { toWeight: 12, duration: 30 },
      { toWeight: 30, duration: 45 },
      { toWeight: 50, duration: 90 },
      { toWeight: 100000, duration: 120 },
    ];
    return loadingUnloadingTime.find((x) => x.toWeight >= weight)?.duration || 120;
  }

  // areaOfCut = 3.14 /(4* partOuterDiameter);

  getBendData(dia: number) {
    const bendTime = [
      { fromDia: 0, toDia: 15, degreeVal: { 45: 1, 90: 1, 135: 1, 180: 1 }, efficiencyVal: { bendingSpeed: 392, feed: 1309, rotation: 252 } },
      { fromDia: 15, toDia: 30, degreeVal: { 45: 1, 90: 1, 135: 1, 180: 1 }, efficiencyVal: { bendingSpeed: 392, feed: 1309, rotation: 252 } },
      { fromDia: 30, toDia: 50, degreeVal: { 45: 1, 90: 1, 135: 1.33, 180: 2 }, efficiencyVal: { bendingSpeed: 126, feed: 840, rotation: 252 } },
      { fromDia: 50, toDia: 100, degreeVal: { 45: 1, 90: 2, 135: 3, 180: 4 }, efficiencyVal: { bendingSpeed: 49, feed: 350, rotation: 252 } },
      { fromDia: 100, toDia: 150, degreeVal: { 45: 2.5, 90: 5, 135: 7, 180: 10 }, efficiencyVal: { bendingSpeed: 18, feed: 350, rotation: 63 } },
    ];
    return bendTime.find((x) => x.toDia >= dia) || bendTime[0];
    // return bendTime.find(x => x.toDia > dia)?.degreeVal[degree] || 10;
  }

  getCuttingRate(dia: number, materialId: number) {
    dia = dia <= 25 ? 25 : dia <= 75 ? 75 : dia <= 150 ? 150 : 1000;
    const cuttingRate = [
      { materialId: 433, 25: 3900, 75: 4500, 150: 6100, 1000: 5500 }, // Mild Steel
      { materialId: 54, 25: 3900, 75: 4500, 150: 6100, 1000: 5500 }, // Alloy Steel
      { materialId: 157, 25: 3900, 75: 4500, 150: 6100, 1000: 5500 }, // Carbon Steel
      { materialId: 281, 25: 3900, 75: 4500, 150: 6100, 1000: 5500 }, // Cold Rolled Steel
      { materialId: 436, 25: 3900, 75: 4500, 150: 6100, 1000: 5500 }, // Hot Rolled Steel
      { materialId: 42, 25: 1000, 75: 1000, 150: 1000, 1000: 900 }, // Stainless Steel
      { materialId: 266, 25: 5800, 75: 9400, 150: 13600, 1000: 13800 }, // Aluminium
      { materialId: 204, 25: 2000, 75: 2300, 150: 2600, 1000: 2300 }, // Bronze
      { materialId: 242, 25: 4100, 75: 7100, 150: 8500, 1000: 11700 }, // Copper
    ];
    return cuttingRate.find((x) => x.materialId === materialId)[dia] || 11700;
  }

  // getFormFields() {
  //     return {
  //         noOfHitsRequired: 1,
  //         loadingTime: 0,
  //         unloadingTime: 0,
  //         sheetLoadUloadTime: [0, [Validators.required]],
  //         weldingPosition: 0,
  //         rotationTime: 0,
  //         wireTwistingSpeed: 0,
  //         cuttingTime: [0, [Validators.required]],
  //         noOfBendsPerXAxis: 0,
  //         noOfBendsPerYAxis: 0,
  //         noOfBendsPerZAxis: 0,
  //         noOfbends: 0,
  //         directProcessCost: [0, [Validators.required]]
  //     };
  // }

  // manufacturingFormReset(conversionValue, isEnableUnitConversion) {
  //     return {
  //         noOfHitsRequired: 1,
  //         loadingTime: 0,
  //         unloadingTime: 0,
  //         sheetLoadUloadTime: 0,
  //         weldingPosition: 0,
  //         rotationTime: 0,
  //         wireTwistingSpeed: 0,
  //         cuttingTime: 0,
  //         noOfBendsPerXAxis: 0,
  //         noOfBendsPerYAxis: 0,
  //         noOfBendsPerZAxis: 0,
  //         noOfbends: 0,
  //         directProcessCost: 0
  //     };
  // }

  // manufacturingFormPatch(obj: ProcessInfoDto) {
  //     return {
  //         noOfHitsRequired: this.sharedService.isValidNumber(obj.noOfHitsRequired) || 1,
  //         loadingTime: this.sharedService.isValidNumber(obj.loadingTime) || 0,
  //         unloadingTime: this.sharedService.isValidNumber(obj.unloadingTime) || 0,
  //         sheetLoadUloadTime: this.sharedService.isValidNumber(obj.sheetLoadUloadTime),
  //         weldingPosition: this.sharedService.isValidNumber(obj.weldingPosition) || 0,
  //         rotationTime: this.sharedService.isValidNumber(obj.rotationTime) || 0,
  //         wireTwistingSpeed: this.sharedService.isValidNumber(obj.wireTwistingSpeed) || 0,
  //         cuttingTime: this.sharedService.isValidNumber(obj.cuttingTime),
  //         noOfBendsPerXAxis: this.sharedService.isValidNumber(obj.noOfBendsPerXAxis),
  //         noOfBendsPerYAxis: this.sharedService.isValidNumber(obj.noOfBendsPerYAxis),
  //         noOfBendsPerZAxis: this.sharedService.isValidNumber(obj.noOfBendsPerZAxis),
  //         noOfbends: this.sharedService.isValidNumber(obj.noOfbends),
  //         directProcessCost: this.sharedService.isValidNumber(obj.directProcessCost)
  //     };
  // }

  // manufacturingFormAssignValue(manufactureInfo: ProcessInfoDto, formCtrl, conversionValue, isEnableUnitConversion) {
  //     manufactureInfo.noOfHitsRequired = formCtrl['noOfHitsRequired'].value || 1;
  //     manufactureInfo.loadingTime = formCtrl['loadingTime'].value;
  //     manufactureInfo.unloadingTime = formCtrl['unloadingTime'].value;
  //     manufactureInfo.sheetLoadUloadTime = formCtrl['sheetLoadUloadTime'].value;
  //     manufactureInfo.weldingPosition = formCtrl['weldingPosition'].value;
  //     manufactureInfo.rotationTime = formCtrl['rotationTime'].value;
  //     manufactureInfo.cuttingTime = formCtrl['cuttingTime'].value;
  //     manufactureInfo.wireTwistingSpeed = formCtrl['wireTwistingSpeed'].value;
  //     manufactureInfo.noOfBendsPerXAxis = formCtrl['noOfBendsPerXAxis'].value;
  //     manufactureInfo.noOfBendsPerYAxis = formCtrl['noOfBendsPerYAxis'].value;
  //     manufactureInfo.noOfBendsPerZAxis = formCtrl['noOfBendsPerZAxis'].value;
  //     manufactureInfo.noOfbends = formCtrl['noOfbends'].value;
  // }

  // manufacturingDirtyCheck(manufactureInfo: ProcessInfoDto, formCtrl) {
  //     manufactureInfo.isNoOfHitsRequiredDirty = formCtrl['noOfHitsRequired'].dirty;
  //     manufactureInfo.isLoadingTimeDirty = formCtrl['loadingTime'].dirty;
  //     manufactureInfo.isUnloadingTimeDirty = formCtrl['unloadingTime'].dirty;
  //     manufactureInfo.isWeldingPositionDirty = formCtrl['weldingPosition'].dirty;
  //     manufactureInfo.isRotationTimeDirty = formCtrl['rotationTime'].dirty;
  //     manufactureInfo.isSheetLoadULoadTimeDirty = formCtrl['sheetLoadUloadTime'].dirty;
  //     manufactureInfo.isCuttingTimeDirty = formCtrl['cuttingTime'].dirty;
  //     manufactureInfo.isWireTwistingSpeedDirty = formCtrl['wireTwistingSpeed'].dirty;
  // }

  // manufacturingFormPatchResults(result: ProcessInfoDto) {
  //     return {
  //         noOfHitsRequired: this.sharedService.isValidNumber(result.noOfHitsRequired),
  //         loadingTime: this.sharedService.isValidNumber(result.loadingTime),
  //         unloadingTime: this.sharedService.isValidNumber(result.unloadingTime),
  //         sheetLoadUloadTime: this.sharedService.isValidNumber(result.sheetLoadUloadTime),
  //         weldingPosition: this.sharedService.isValidNumber(result?.weldingPosition),
  //         rotationTime: this.sharedService.isValidNumber(result.rotationTime),
  //         cuttingTime: this.sharedService.isValidNumber(result.cuttingTime),
  //         wireTwistingSpeed: this.sharedService.isValidNumber(result.wireTwistingSpeed),
  //         noOfBendsPerXAxis: this.sharedService.isValidNumber(result.noOfBendsPerXAxis),
  //         noOfBendsPerYAxis: this.sharedService.isValidNumber(result.noOfBendsPerYAxis),
  //         noOfBendsPerZAxis: this.sharedService.isValidNumber(result.noOfBendsPerZAxis),
  //         noOfbends: this.sharedService.isValidNumber(result.noOfbends),
  //         directProcessCost: this.sharedService.isValidNumber(result.directProcessCost)
  //     };
  // }

  // manufacturingFormSubmitPayLoad(formCtrl, conversionValue, isEnableUnitConversion) {
  //     // const model = new ProcessInfoDto();
  //     // model.noOfHitsRequired = formCtrl['noOfHitsRequired'].value || 1;
  //     // model.loadingTime = formCtrl['loadingTime'].value || 0;
  //     // model.unloadingTime = formCtrl['unloadingTime'].value || 0;
  //     // model.sheetLoadUloadTime = formCtrl['sheetLoadUloadTime'].value || 0;
  //     // model.weldingPosition = formCtrl['weldingPosition'].value || 0;
  //     // model.rotationTime = formCtrl['rotationTime'].value || 0;
  //     // model.wireTwistingSpeed = formCtrl['wireTwistingSpeed'].value;
  //     // model.cuttingTime = formCtrl['cuttingTime'].value || 0;
  //     // model.noOfBendsPerXAxis = formCtrl['noOfBendsPerXAxis'].value || 0;
  //     // model.noOfBendsPerYAxis = formCtrl['noOfBendsPerYAxis'].value || 0;
  //     // model.noOfBendsPerZAxis = formCtrl['noOfBendsPerZAxis'].value || 0;
  //     // model.noOfbends = formCtrl['noOfbends'].value || 0;
  //     // model.directProcessCost = formCtrl['directProcessCost'].value || 0;
  //     // return model;
  //     return {
  //         noOfHitsRequired: formCtrl['noOfHitsRequired'].value,
  //         loadingTime: formCtrl['loadingTime'].value,
  //         unloadingTime: formCtrl['unloadingTime'].value,
  //         sheetLoadUloadTime: formCtrl['sheetLoadUloadTime'].value,
  //         weldingPosition: formCtrl['weldingPosition'].value,
  //         rotationTime: formCtrl['rotationTime'].value,
  //         wireTwistingSpeed: formCtrl['wireTwistingSpeed'].value,
  //         cuttingTime: formCtrl['cuttingTime'].value,
  //         noOfBendsPerXAxis: formCtrl['noOfBendsPerXAxis'].value,
  //         noOfBendsPerYAxis: formCtrl['noOfBendsPerYAxis'].value,
  //         noOfBendsPerZAxis: formCtrl['noOfBendsPerZAxis'].value,
  //         noOfbends: formCtrl['noOfbends'].value,
  //         directProcessCost: formCtrl['directProcessCost'].value
  //     };
  // }
}
