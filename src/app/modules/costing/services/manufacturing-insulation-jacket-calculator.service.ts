import { Injectable } from '@angular/core';
import { SharedService } from './shared.service';
import { ProcessInfoDto } from 'src/app/shared/models';
import { PrimaryProcessType, ProcessType } from '../costing.config';

@Injectable({
  providedIn: 'root',
})
export class ManufacturingInsulationJacketCalculatorService {
  constructor(private shareService: SharedService) {}
  public doCostCalculationsForInsulationJacket(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    const materialInfo = manufactureInfo.materialInfoList.find((x) => x.processId === PrimaryProcessType.InsulationJacket);
    const processTypeID = Number(manufactureInfo.processTypeID);

    let sheetLoadUnloadTime = 10;
    if (processTypeID === ProcessType.SeamStiching) {
      sheetLoadUnloadTime = 20;
    }

    let cuttingSpeed = 0;
    if (processTypeID === ProcessType.RubberFeltSheetCutting) {
      cuttingSpeed = 25;
    }
    if (processTypeID === ProcessType.SeamStiching) {
      cuttingSpeed = 20;
    }

    if (manufactureInfo.isefficiencyDirty && !!manufactureInfo.efficiency) {
      manufactureInfo.efficiency = Number(manufactureInfo.efficiency);
    } else {
      let efficiency = Number(manufactureInfo.efficiency) || 85;
      if (manufactureInfo.efficiency) {
        efficiency = this.shareService.checkDirtyProperty('efficiency', fieldColorsList) ? manufacturingObj?.efficiency : efficiency;
      }
      manufactureInfo.efficiency = efficiency;
    }
    manufactureInfo.efficiency <= 1 && (manufactureInfo.efficiency = manufactureInfo.efficiency * 100);
    !manufactureInfo.efficiency && (manufactureInfo.efficiency = 85);
    const efficiency = Number(manufactureInfo.efficiency) / 100;

    if (manufactureInfo.isLoadingTimeDirty && !!manufactureInfo.loadingTime) {
      manufactureInfo.loadingTime = Number(manufactureInfo.loadingTime);
    } else {
      let loadingTime = 10;
      if (manufactureInfo.loadingTime) {
        loadingTime = this.shareService.checkDirtyProperty('loadingTime', fieldColorsList) ? manufacturingObj?.loadingTime : loadingTime;
      }
      manufactureInfo.loadingTime = loadingTime;
    }

    if (manufactureInfo.isUnloadingTimeDirty && !!manufactureInfo.unloadingTime) {
      manufactureInfo.unloadingTime = Number(manufactureInfo.unloadingTime);
    } else {
      let unloadingTime = 10;
      if (manufactureInfo.unloadingTime) {
        unloadingTime = this.shareService.checkDirtyProperty('unloadingTime', fieldColorsList) ? manufacturingObj?.unloadingTime : unloadingTime;
      }
      manufactureInfo.unloadingTime = unloadingTime;
    }

    if (manufactureInfo.isSheetLoadULoadTimeDirty && !!manufactureInfo.sheetLoadUloadTime) {
      manufactureInfo.sheetLoadUloadTime = Number(manufactureInfo.sheetLoadUloadTime);
    } else {
      if (manufactureInfo.sheetLoadUloadTime) {
        sheetLoadUnloadTime = this.shareService.checkDirtyProperty('sheetLoadUloadTime', fieldColorsList) ? manufacturingObj?.sheetLoadUloadTime : sheetLoadUnloadTime;
      }
      manufactureInfo.sheetLoadUloadTime = sheetLoadUnloadTime;
    }

    if (manufactureInfo.islubeTimeDirty && !!manufactureInfo.lubeTime) {
      manufactureInfo.lubeTime = Number(manufactureInfo.lubeTime);
    } else {
      let lubeTime = 30;
      if (manufactureInfo.lubeTime) {
        lubeTime = this.shareService.checkDirtyProperty('lubeTime', fieldColorsList) ? manufacturingObj?.lubeTime : lubeTime;
      }
      manufactureInfo.lubeTime = lubeTime;
    }

    //cutting Speed
    if (manufactureInfo.iscuttingSpeedDirty && !!manufactureInfo.cuttingSpeed) {
      manufactureInfo.cuttingSpeed = Number(manufactureInfo.cuttingSpeed);
    } else {
      if (manufactureInfo.cuttingSpeed) {
        cuttingSpeed = this.shareService.checkDirtyProperty('cuttingSpeed', fieldColorsList) ? manufacturingObj?.cuttingSpeed : cuttingSpeed;
      }
      manufactureInfo.cuttingSpeed = cuttingSpeed;
      // manufactureInfo.cuttingSpeed = this.shareService.checkDirtyProperty('cuttingSpeed', fieldColorsList) ? manufacturingObj?.cuttingSpeed : manufactureInfo.cuttingSpeed;
    }

    //cutting length
    if (manufactureInfo.isCuttingLengthDirty && !!manufactureInfo.cuttingLength) {
      manufactureInfo.cuttingLength = Number(manufactureInfo.cuttingLength);
    } else {
      manufactureInfo.cuttingLength = this.shareService.checkDirtyProperty('cuttingLength', fieldColorsList) ? manufacturingObj?.cuttingLength : manufactureInfo.cuttingLength;
    }

    //Cutting Time
    if (manufactureInfo.isCuttingTimeDirty && !!manufactureInfo.cuttingTime) {
      manufactureInfo.cuttingTime = Number(manufactureInfo.cuttingTime);
    } else {
      const cuttingRate = Number(manufactureInfo.cuttingSpeed) * efficiency;
      let cuttingTime = 0;
      if (processTypeID === ProcessType.RubberFeltSheetCutting) {
        cuttingTime = this.shareService.isValidNumber((Number(materialInfo?.perimeter) * 60) / (cuttingRate * 1000));
      } else {
        cuttingTime = this.shareService.isValidNumber(((Number(manufactureInfo.cuttingLength) * 2) / (cuttingRate * 1000)) * 60);
      }

      if (manufactureInfo.cuttingTime) {
        cuttingTime = this.shareService.checkDirtyProperty('cuttingTime', fieldColorsList) ? manufacturingObj?.cuttingTime : cuttingTime;
      }
      manufactureInfo.cuttingTime = cuttingTime;
    }

    if (manufactureInfo.iscycleTimeDirty && !!manufactureInfo.cycleTime) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = 0;
      if (processTypeID === ProcessType.RubberFeltSheetStacking) {
        cycleTime = this.shareService.isValidNumber(Number(manufactureInfo.loadingTime) + Number(manufactureInfo.unloadingTime) + Number(manufactureInfo.lubeTime));
      } else {
        cycleTime = this.shareService.isValidNumber(Number(manufactureInfo.cuttingTime) + Number(manufactureInfo.sheetLoadUloadTime));
      }

      if (manufactureInfo.cycleTime) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    //Direct labors
    if (manufactureInfo.isNoOfLowSkilledLaboursDirty && !!manufactureInfo.noOfLowSkilledLabours) {
      manufactureInfo.noOfLowSkilledLabours = Number(manufactureInfo.noOfLowSkilledLabours);
    } else {
      manufactureInfo.noOfLowSkilledLabours = this.shareService.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList)
        ? manufacturingObj?.noOfLowSkilledLabours
        : manufactureInfo.noOfLowSkilledLabours;
    }

    //no qa inspector
    !manufactureInfo.qaOfInspector && (manufactureInfo.qaOfInspector = 1);

    //Skilled Labors
    !manufactureInfo.noOfSkilledLabours && (manufactureInfo.noOfSkilledLabours = 1);

    //Direct labors rate
    if (manufactureInfo.isLowSkilledLaborRatePerHourDirty && !!manufactureInfo.lowSkilledLaborRatePerHour) {
      manufactureInfo.lowSkilledLaborRatePerHour = Number(manufactureInfo.lowSkilledLaborRatePerHour);
    } else {
      manufactureInfo.lowSkilledLaborRatePerHour = this.shareService.checkDirtyProperty('lowSkilledLaborRatePerHour', fieldColorsList)
        ? manufacturingObj?.lowSkilledLaborRatePerHour
        : manufactureInfo.lowSkilledLaborRatePerHour;
    }

    //Qa Inspector rate
    if (manufactureInfo.isQaInspectorRateDirty && !!manufactureInfo.qaOfInspectorRate) {
      manufactureInfo.qaOfInspectorRate = Number(manufactureInfo.qaOfInspectorRate);
    } else {
      manufactureInfo.qaOfInspectorRate = this.shareService.checkDirtyProperty('qaOfInspectorRate', fieldColorsList) ? manufacturingObj?.qaOfInspectorRate : manufactureInfo.qaOfInspectorRate;
    }

    //Skilled Labors rate
    if (manufactureInfo.isSkilledLaborRatePerHourDirty && !!manufactureInfo.skilledLaborRatePerHour) {
      manufactureInfo.skilledLaborRatePerHour = Number(manufactureInfo.skilledLaborRatePerHour);
    } else {
      manufactureInfo.skilledLaborRatePerHour = this.shareService.checkDirtyProperty('skilledLaborRatePerHour', fieldColorsList)
        ? manufacturingObj?.skilledLaborRatePerHour
        : manufactureInfo.skilledLaborRatePerHour;
    }

    //sampling rate
    if (manufactureInfo.isSamplingRateDirty && !!manufactureInfo.samplingRate) {
      manufactureInfo.samplingRate = Number(manufactureInfo.samplingRate);
    } else {
      // let samplingRate = 80;
      // if (!!manufactureInfo.samplingRate) {
      manufactureInfo.samplingRate = this.shareService.checkDirtyProperty('samplingRate', fieldColorsList) ? manufacturingObj?.samplingRate : manufactureInfo.samplingRate;
      // }
      // manufactureInfo.samplingRate = samplingRate;
    }
    manufactureInfo.samplingRate <= 1 && (manufactureInfo.samplingRate = manufactureInfo.samplingRate * 100);

    //Inspection time
    if (manufactureInfo.isinspectionTimeDirty && !!manufactureInfo.inspectionTime) {
      manufactureInfo.inspectionTime = Number(manufactureInfo.inspectionTime);
    } else {
      manufactureInfo.inspectionTime = this.shareService.checkDirtyProperty('inspectionTime', fieldColorsList) ? manufacturingObj?.inspectionTime : manufactureInfo.inspectionTime;
    }

    //Setup time
    if (manufactureInfo.issetUpTimeDirty && !!manufactureInfo.setUpTime) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      manufactureInfo.setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : manufactureInfo.setUpTime;
    }

    //yield percentage
    if (manufactureInfo.isyieldPercentDirty && !!manufactureInfo.yieldPer) {
      manufactureInfo.yieldPer = Number(manufactureInfo.yieldPer);
    } else {
      let yieldPer = 99.0;
      if (manufactureInfo.yieldPer) {
        yieldPer = this.shareService.checkDirtyProperty('yieldPer', fieldColorsList) ? manufacturingObj?.yieldPer : yieldPer;
      }
      manufactureInfo.yieldPer = yieldPer;
    }

    //Machine hour rate
    if (manufactureInfo.ismachineHourRateDirty && !!manufactureInfo.machineHourRate) {
      manufactureInfo.machineHourRate = Number(manufactureInfo.machineHourRate);
    } else {
      manufactureInfo.machineHourRate = this.shareService.checkDirtyProperty('machineHourRate', fieldColorsList) ? manufacturingObj?.machineHourRate : manufactureInfo.machineHourRate;
    }

    //Machine cost
    if (manufactureInfo.isdirectMachineCostDirty && !!manufactureInfo.directMachineCost) {
      manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
    } else {
      let directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) * Number(manufactureInfo.cycleTime)) / 3600 / efficiency);
      if (manufactureInfo.directMachineCost) {
        directMachineCost = this.shareService.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : directMachineCost;
      }
      manufactureInfo.directMachineCost = directMachineCost;
    }

    //Set up cost
    if (manufactureInfo.isdirectSetUpCostDirty && !!manufactureInfo.directSetUpCost) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      let directSetUpCost = this.shareService.isValidNumber(
        (((Number(manufactureInfo.noOfLowSkilledLabours) * Number(manufactureInfo.setUpTime)) / 60) * Number(manufactureInfo.lowSkilledLaborRatePerHour)) /
          efficiency /
          Number(manufactureInfo.lotSize) +
          (((Number(manufactureInfo.noOfSkilledLabours) * Number(manufactureInfo.skilledLaborRatePerHour)) / 60) * Number(manufactureInfo.setUpTime)) / efficiency / Number(manufactureInfo.lotSize)
      );
      if (manufactureInfo.directSetUpCost) {
        directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.directSetUpCost : directSetUpCost;
      }
      manufactureInfo.directSetUpCost = directSetUpCost;
    }

    //Labor cost
    if (manufactureInfo.isdirectLaborCostDirty && !!manufactureInfo.directLaborCost) {
      manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
    } else {
      let directLaborCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.noOfLowSkilledLabours) * Number(manufactureInfo.lowSkilledLaborRatePerHour) * Number(manufactureInfo.cycleTime)) / 3600 / efficiency +
          (Number(manufactureInfo.noOfSkilledLabours) * Number(manufactureInfo.skilledLaborRatePerHour) * Number(manufactureInfo.cycleTime)) / 3600 / efficiency
      );
      if (manufactureInfo.directLaborCost) {
        directLaborCost = this.shareService.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : directLaborCost;
      }
      manufactureInfo.directLaborCost = directLaborCost;
    }

    //inspection cost
    if (manufactureInfo.isinspectionCostDirty && !!manufactureInfo.inspectionCost) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      let inspectionCost = this.shareService.isValidNumber(
        ((Number(manufactureInfo.inspectionTime) / 60) * Number(manufactureInfo.qaOfInspector) * Number(manufactureInfo.qaOfInspectorRate)) / efficiency / Number(manufactureInfo.lotSize)
      );
      if (manufactureInfo.inspectionCost) {
        inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : inspectionCost;
      }
      manufactureInfo.inspectionCost = inspectionCost;
    }

    const subCost = Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost);

    // Yield Cost
    if (manufactureInfo.isyieldCostDirty && !!manufactureInfo.yieldCost) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      let yieldCost = this.shareService.isValidNumber((1 - Number(manufactureInfo.yieldPer) / 100) * subCost);
      if (manufactureInfo.yieldCost) {
        yieldCost = this.shareService.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : yieldCost;
      }
      manufactureInfo.yieldCost = yieldCost;
    }

    manufactureInfo.directProcessCost = this.shareService.isValidNumber(subCost + Number(manufactureInfo.yieldCost));
    return manufactureInfo;
    // return new Observable((obs) => { obs.next(manufactureInfo); });
  }
}
