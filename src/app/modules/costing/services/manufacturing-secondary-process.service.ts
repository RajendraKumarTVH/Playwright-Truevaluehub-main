import { Injectable } from '@angular/core';
import { SharedService } from './shared.service';
import { ProcessInfoDto } from 'src/app/shared/models';
import { AssemblyConfigService, AssemblyType } from 'src/app/shared/config/manufacturing-assembly-config';
import { FormGroup } from '@angular/forms';
import { SheetMetalConfigService } from 'src/app/shared/config/sheetmetal-config';

@Injectable({
  providedIn: 'root',
})
export class SecondaryProcessCalculatorService {
  constructor(
    private shareService: SharedService,
    private _assemblyConfig: AssemblyConfigService,
    public _smConfig: SheetMetalConfigService
  ) {}

  public calculationForAssembly(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    let totalCycleTime = 0;
    const netPartWeight = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.netWeight / 1000 : 0;
    for (let i = 0; i < manufactureInfo.subProcessFormArray?.controls?.length; i++) {
      const info = manufactureInfo.subProcessFormArray?.controls[i]?.value;
      const subProcessForm = manufactureInfo.subProcessFormArray.at(i) as FormGroup;
      const subProcessId = Number(info?.subProcessTypeID);
      const defaultCycleTime: number = this._assemblyConfig?.getAssemblyCycleTImeList()?.find((x) => x.id === subProcessId)?.cycleTime || 0;
      let cycleTime = 0;
      if (subProcessId === AssemblyType.PickAndPlaceParts) {
        let noOfManf = Number(info?.formLength);
        let loadingTime: number = this._assemblyConfig.getAssemblyLoadingTimeList()?.find((x) => x.from <= netPartWeight && x.to >= netPartWeight)?.loadUnloadTime;
        let compexity = this._assemblyConfig.getAssemblyLoadingTimeList()?.find((x) => x.from <= netPartWeight && x.to >= netPartWeight)?.complexity;
        const pickPlace: number = this._assemblyConfig.getAssemblyLoadingTimeList()?.find((x) => x.from <= netPartWeight && x.to >= netPartWeight)?.pickPlace;

        if (subProcessForm.controls['formLength'].dirty && subProcessForm.controls['formLength'].value !== null) {
          noOfManf = subProcessForm.controls['formLength'].value;
        } else {
          if (subProcessForm.controls['formLength'].value !== null) {
            noOfManf = this.shareService.checkSubProcessDirtyProperty('formLength', fieldColorsList) ? Number(info?.formLength) : this.shareService.isValidNumber(noOfManf);
          }
        }
        let noOfPurchased = Number(info?.formHeight);
        if (subProcessForm.controls['formHeight'].dirty && subProcessForm.controls['formHeight'].value !== null) {
          noOfPurchased = subProcessForm.controls['formHeight'].value;
        } else {
          if (subProcessForm.controls['formHeight'].value !== null) {
            noOfPurchased = this.shareService.checkSubProcessDirtyProperty('formHeight', fieldColorsList) ? Number(info?.formHeight) : this.shareService.isValidNumber(noOfPurchased);
          }
        }
        if (subProcessForm.controls['formPerimeter'].dirty && subProcessForm.controls['formPerimeter'].value !== null) {
          compexity = subProcessForm.controls['formPerimeter'].value;
        } else {
          if (subProcessForm.controls['formPerimeter'].value !== null) {
            compexity = this.shareService.checkSubProcessDirtyProperty('formPerimeter', fieldColorsList) ? Number(info?.formPerimeter) : this.shareService.isValidNumber(compexity);
          }
        }
        let unloadTime = loadingTime;
        if (subProcessForm.controls['hlFactor'].dirty && subProcessForm.controls['hlFactor'].value !== null) {
          loadingTime = subProcessForm.controls['hlFactor'].value;
        } else {
          if (subProcessForm.controls['hlFactor'].value != null) {
            loadingTime = this.shareService.checkSubProcessDirtyProperty('hlFactor', fieldColorsList) ? Number(info?.hlFactor) : this.shareService.isValidNumber(loadingTime);
          }
        }
        if (subProcessForm.controls['lengthOfCut'].dirty && subProcessForm.controls['lengthOfCut'].value !== null) {
          unloadTime = subProcessForm.controls['lengthOfCut'].value;
        } else {
          if (subProcessForm.controls['lengthOfCut'].value !== null) {
            unloadTime = this.shareService.checkSubProcessDirtyProperty('lengthOfCut', fieldColorsList) ? Number(info?.lengthOfCut) : this.shareService.isValidNumber(unloadTime);
          }
        }
        cycleTime = this.shareService.isValidNumber(defaultCycleTime * noOfManf * pickPlace + noOfPurchased * 1.2);
        if (subProcessForm.controls['bendingLineLength'].dirty && subProcessForm.controls['bendingLineLength'].value !== null) {
          cycleTime = subProcessForm.controls['bendingLineLength'].value;
        } else {
          if (subProcessForm.controls['bendingLineLength'].value !== null) {
            cycleTime = this.shareService.checkSubProcessDirtyProperty('bendingLineLength', fieldColorsList) ? Number(info?.bendingLineLength) : this.shareService.isValidNumber(cycleTime);
          }
        }
        subProcessForm.patchValue({ formLength: noOfManf });
        subProcessForm.patchValue({ formHeight: noOfPurchased });
        subProcessForm.patchValue({ formPerimeter: compexity });
        subProcessForm.patchValue({ hlFactor: loadingTime });
        subProcessForm.patchValue({ lengthOfCut: unloadTime });
        subProcessForm.patchValue({ bendingLineLength: cycleTime });
        totalCycleTime += loadingTime + unloadTime + cycleTime;
      } else {
        const repeatCount = Number(info?.formLength);
        const handling: number = this._assemblyConfig.getAssemblyHandlingDifficulties()?.find((x) => x.difficulty === Number(info?.formHeight))?.cycleTime;
        const insertion: number = this._assemblyConfig.getAssemblyInsertionDifficulties()?.find((x) => x.difficulty === Number(info?.formPerimeter))?.cycleTime;
        let cycleTime = 0;
        if (subProcessForm.controls['bendingLineLength'].dirty && subProcessForm.controls['bendingLineLength'].value !== null) {
          cycleTime = subProcessForm.controls['bendingLineLength'].value;
        } else {
          cycleTime = this.shareService.isValidNumber(defaultCycleTime * repeatCount * handling * insertion);
          if (subProcessForm.controls['bendingLineLength'].value !== null) {
            cycleTime = this.shareService.checkSubProcessDirtyProperty('bendingLineLength', fieldColorsList) ? Number(info?.bendingLineLength) : this.shareService.isValidNumber(cycleTime);
          }
        }
        subProcessForm.patchValue({ bendingLineLength: cycleTime });
        totalCycleTime += this.shareService.isValidNumber(cycleTime);
      }
    }
    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      manufactureInfo.cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : totalCycleTime;
    }

    if (manufactureInfo.isSamplingRateDirty && !!manufactureInfo.samplingRate) {
      manufactureInfo.samplingRate = this.shareService.isValidNumber(Number(manufactureInfo.samplingRate));
    } else {
      let samplingRate = this._smConfig.defaultPercentages(Number(manufactureInfo.processTypeID), manufactureInfo.partComplexity, 'samplingRate');
      if (manufactureInfo.samplingRate) {
        samplingRate = this.shareService.checkDirtyProperty('samplingRate', fieldColorsList) ? manufacturingObj?.samplingRate : this.shareService.isValidNumber(samplingRate);
      }
      manufactureInfo.samplingRate = samplingRate;
    }

    if (manufactureInfo.isyieldPercentDirty && !!manufactureInfo.yieldPer) {
      manufactureInfo.yieldPer = this.shareService.isValidNumber(Number(manufactureInfo.yieldPer));
    } else {
      let yieldPer = this._smConfig.defaultPercentages(Number(manufactureInfo.processTypeID), manufactureInfo.partComplexity, 'yieldPercentage');
      if (manufactureInfo.yieldPer) {
        yieldPer = this.shareService.checkDirtyProperty('yieldPer', fieldColorsList) ? manufacturingObj?.yieldPer : this.shareService.isValidNumber(yieldPer);
      }
      manufactureInfo.yieldPer = yieldPer;
    }

    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost != null) {
      manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
    } else {
      let directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) / 3600) * Number(manufactureInfo.cycleTime));
      if (manufactureInfo.directMachineCost != null) {
        directMachineCost = this.shareService.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : directMachineCost;
      }
      manufactureInfo.directMachineCost = directMachineCost;
    }
    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost != null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      let directSetUpCost = this.shareService.isValidNumber(
        (((Number(manufactureInfo.noOfLowSkilledLabours) * Number(manufactureInfo.lowSkilledLaborRatePerHour) +
          Number(manufactureInfo.noOfSkilledLabours) * Number(manufactureInfo.skilledLaborRatePerHour) +
          Number(manufactureInfo.machineHourRate)) /
          60) *
          Number(manufactureInfo.setUpTime)) /
          Number(manufactureInfo.lotSize)
      );
      if (manufactureInfo.directSetUpCost != null) {
        directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.directSetUpCost : directSetUpCost;
      }
      manufactureInfo.directSetUpCost = directSetUpCost;
    }

    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost != null) {
      manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
    } else {
      let directLaborCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) * (Number(manufactureInfo.cycleTime) * Number(manufactureInfo.noOfLowSkilledLabours))
      );
      if (manufactureInfo.directLaborCost != null) {
        directLaborCost = this.shareService.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : directLaborCost;
      }
      manufactureInfo.directLaborCost = directLaborCost;
    }

    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost != null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      let inspectionCost = this.shareService.isValidNumber(Number(manufactureInfo.samplingRate / 100) * ((Number(manufactureInfo.inspectionTime) * Number(manufactureInfo.qaOfInspectorRate)) / 3600));
      if (manufactureInfo.inspectionCost != null) {
        inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : this.shareService.isValidNumber(inspectionCost);
      }
      manufactureInfo.inspectionCost = inspectionCost;
    }

    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost != null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      if (manufactureInfo.yieldCost != null) {
        manufactureInfo.yieldCost = this.shareService.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : 0;
      }
    }
    manufactureInfo.directProcessCost = this.shareService.isValidNumber(
      Number(manufactureInfo.directLaborCost) +
        Number(manufactureInfo.directMachineCost) +
        Number(manufactureInfo.directSetUpCost) +
        Number(manufactureInfo.inspectionCost) +
        Number(manufactureInfo.yieldCost)
    );

    manufactureInfo.subProcessFormArray = manufactureInfo.subProcessFormArray?.value;
    return manufactureInfo;
  }
}
