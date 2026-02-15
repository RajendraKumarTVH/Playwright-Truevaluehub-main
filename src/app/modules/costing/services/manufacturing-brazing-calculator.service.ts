import { Injectable } from '@angular/core';
import { SharedService } from './shared.service';
import { ProcessInfoDto } from 'src/app/shared/models';
import { BrazingConfigService } from 'src/app/shared/config/brazing-config.service';

@Injectable({
  providedIn: 'root',
})
export class ManufacturingBrazingCalculatorService {
  constructor(
    private shareService: SharedService,
    private _brazingConfigService: BrazingConfigService
  ) {}
  public doCostCalculationsForBrazing(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    const brazingTime = this._brazingConfigService.getPowerData(manufactureInfo.partThickness);
    let soakingTime = 10;

    //No of Joints
    if (manufactureInfo.isnoOfCoreDirty && !!manufactureInfo.noOfCore) {
      manufactureInfo.noOfCore = Number(manufactureInfo.noOfCore);
    } else {
      manufactureInfo.noOfCore = this.shareService.checkDirtyProperty('noOfCore', fieldColorsList) ? manufacturingObj?.noOfCore : manufactureInfo.noOfCore;
    }
    //Pre Joint Cleaning time
    if (manufactureInfo.isCuttingTimeDirty && !!manufactureInfo.cuttingTime) {
      manufactureInfo.cuttingTime = Number(manufactureInfo.cuttingTime);
    } else {
      let cuttingTime = 4;
      if (manufactureInfo.cuttingTime) {
        cuttingTime = this.shareService.checkDirtyProperty('cuttingTime', fieldColorsList) ? manufacturingObj?.cuttingTime : cuttingTime;
      }
      manufactureInfo.cuttingTime = cuttingTime;
    }
    if (manufactureInfo.isinjectionTimeDirty && !!manufactureInfo.injectionTime) {
      manufactureInfo.injectionTime = Number(manufactureInfo.injectionTime);
    } else {
      let injectionTime = 4;
      if (manufactureInfo.injectionTime) {
        injectionTime = this.shareService.checkDirtyProperty('injectionTime', fieldColorsList) ? manufacturingObj?.injectionTime : injectionTime;
      }
      manufactureInfo.injectionTime = injectionTime;
    }
    // Brazing Time
    if (manufactureInfo.issoakingTimeDirty && !!manufactureInfo.soakingTime) {
      manufactureInfo.soakingTime = Number(manufactureInfo.soakingTime);
    } else {
      soakingTime = brazingTime;
      if (manufactureInfo.soakingTime) {
        manufactureInfo.soakingTime = this.shareService.checkDirtyProperty('soakingTime', fieldColorsList) ? manufacturingObj?.soakingTime : soakingTime;
      }
      manufactureInfo.soakingTime = soakingTime;
    }
    if (manufactureInfo.isSheetLoadULoadTimeDirty && !!manufactureInfo.sheetLoadUloadTime) {
      manufactureInfo.sheetLoadUloadTime = Number(manufactureInfo.sheetLoadUloadTime);
    } else {
      let sheetLoadUnloadTime = 6;
      if (manufactureInfo.sheetLoadUloadTime) {
        sheetLoadUnloadTime = this.shareService.checkDirtyProperty('sheetLoadUloadTime', fieldColorsList) ? manufacturingObj?.sheetLoadUloadTime : sheetLoadUnloadTime;
      }
      manufactureInfo.sheetLoadUloadTime = sheetLoadUnloadTime;
    }
    //Post Joint Cleaning time
    if (manufactureInfo.iscoolingTimeDirty && !!manufactureInfo.coolingTime) {
      manufactureInfo.coolingTime = Number(manufactureInfo.coolingTime);
    } else {
      let coolingTime = 4;
      if (manufactureInfo.coolingTime) {
        coolingTime = this.shareService.checkDirtyProperty('coolingTime', fieldColorsList) ? manufacturingObj?.coolingTime : coolingTime;
      }
      manufactureInfo.coolingTime = coolingTime;
    }

    if (manufactureInfo.isefficiencyDirty && !!manufactureInfo.efficiency) {
      manufactureInfo.efficiency = Number(manufactureInfo.efficiency);
    } else {
      let efficiency = this._brazingConfigService.getEfficiency(Number(manufactureInfo.semiAutoOrAuto));
      if (manufactureInfo?.efficiency) {
        efficiency = this.shareService.checkDirtyProperty('efficiency', fieldColorsList) ? manufacturingObj?.efficiency : efficiency;
      }
      manufactureInfo.efficiency = efficiency;
    }
    // (manufactureInfo.efficiency <= 1) && (manufactureInfo.efficiency = manufactureInfo.efficiency * 100);
    !manufactureInfo.efficiency && (manufactureInfo.efficiency = 80);
    const efficiency = Number(manufactureInfo.efficiency) / 100;

    if (manufactureInfo.iscycleTimeDirty && !!manufactureInfo.cycleTime) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(
        (Number(manufactureInfo.coolingTime) * Number(manufactureInfo.noOfCore) +
          Number(manufactureInfo.sheetLoadUloadTime) +
          ((Number(manufactureInfo.cuttingTime) + Number(manufactureInfo.injectionTime)) * Number(manufactureInfo.noOfCore) + Number(soakingTime) + Number(manufactureInfo.sheetLoadUloadTime))) /
          efficiency
      );

      if (manufactureInfo.cycleTime) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    //Setup time
    if (manufactureInfo.issetUpTimeDirty && !!manufactureInfo.setUpTime) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      manufactureInfo.setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : manufactureInfo.setUpTime;
    }

    // NoDirect labors
    if (manufactureInfo.isNoOfLowSkilledLaboursDirty && !!manufactureInfo.noOfLowSkilledLabours) {
      manufactureInfo.noOfLowSkilledLabours = Number(manufactureInfo.noOfLowSkilledLabours);
    } else {
      const noOfLowSkilledLabours = this._brazingConfigService.getNoOfLowSkilledLabours(Number(manufactureInfo.semiAutoOrAuto));
      manufactureInfo.noOfLowSkilledLabours = this.shareService.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList) ? manufacturingObj?.noOfLowSkilledLabours : noOfLowSkilledLabours;
    }

    //no qa inspector
    !manufactureInfo.qaOfInspector && (manufactureInfo.qaOfInspector = 1);

    // NoSkilled Labors
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
      manufactureInfo.samplingRate = this.shareService.checkDirtyProperty('samplingRate', fieldColorsList) ? manufacturingObj?.samplingRate : manufactureInfo.samplingRate;
    }
    manufactureInfo.samplingRate <= 1 && (manufactureInfo.samplingRate = manufactureInfo.samplingRate * 100);
    const samplingRate = Number(manufactureInfo.samplingRate) / 100;

    //Inspection time
    if (manufactureInfo.isinspectionTimeDirty && !!manufactureInfo.inspectionTime) {
      manufactureInfo.inspectionTime = Number(manufactureInfo.inspectionTime);
    } else {
      manufactureInfo.inspectionTime = this.shareService.checkDirtyProperty('inspectionTime', fieldColorsList) ? manufacturingObj?.inspectionTime : manufactureInfo.inspectionTime;
    }
    //yield percentage
    if (manufactureInfo.isyieldPercentDirty && !!manufactureInfo.yieldPer) {
      manufactureInfo.yieldPer = Number(manufactureInfo.yieldPer);
    } else {
      manufactureInfo.yieldPer = this.shareService.checkDirtyProperty('yieldPer', fieldColorsList) ? manufacturingObj?.yieldPer : manufactureInfo.yieldPer;
    }
    //Machine hour rate
    if (manufactureInfo.ismachineHourRateDirty && !!manufactureInfo.machineHourRate) {
      manufactureInfo.machineHourRate = Number(manufactureInfo.machineHourRate);
    } else {
      const machineHourRate = this.shareService.isValidNumber(this._brazingConfigService.getMachineHourRate(Number(manufactureInfo.semiAutoOrAuto)) * Number(manufactureInfo.machineHourRateFromDB));
      manufactureInfo.machineHourRate = this.shareService.checkDirtyProperty('machineHourRate', fieldColorsList) ? manufacturingObj?.machineHourRate : machineHourRate;
    }
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
        ((Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) * Number(manufactureInfo.cycleTime) * Number(manufactureInfo.noOfLowSkilledLabours)) / efficiency
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
        ((Number(manufactureInfo.inspectionTime) / 60) * Number(manufactureInfo.qaOfInspectorRate) * Number(manufactureInfo.qaOfInspector)) / Math.ceil(samplingRate * Number(manufactureInfo.lotSize))
      );
      if (manufactureInfo.inspectionCost) {
        inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : inspectionCost;
      }
      manufactureInfo.inspectionCost = inspectionCost;
    }
    const sum = this.shareService.isValidNumber(
      Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
    );

    if (manufactureInfo.isyieldCostDirty && !!manufactureInfo.yieldCost) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      let yieldCost = this.shareService.isValidNumber((1 - Number(manufactureInfo.yieldPer) / 100) * sum);
      if (manufactureInfo.yieldCost) {
        yieldCost = this.shareService.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : yieldCost;
      }
      manufactureInfo.yieldCost = yieldCost;
    }
    manufactureInfo.directProcessCost = this.shareService.isValidNumber(sum + Number(manufactureInfo.yieldCost));
    return manufactureInfo;
  }
}
