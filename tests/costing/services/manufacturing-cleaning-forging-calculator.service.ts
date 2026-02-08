import { Injectable } from '@angular/core';
import { ProcessInfoDto } from 'src/app/shared/models';
import { SharedService } from './shared.service';
import { CostingConfig } from '../costing.config';
import { MaterialForgingConfigService } from 'src/app/shared/config/material-forging-config';
import { ManufacturingForgingSubProcessConfigService } from 'src/app/shared/config/costing-manufacturing-forging-sub-process-config';

@Injectable({
  providedIn: 'root',
})
export class ManufacturingCleaningForgingCalculatorService {
  constructor(
    private shareService: SharedService,
    private _costingConfig: CostingConfig,
    private materialForgingConfigService: MaterialForgingConfigService,
    private forgingSubProcessConfig: ManufacturingForgingSubProcessConfigService
  ) {}

  public calculateCleaningForging(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    const materialInfo = manufactureInfo?.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0] : null;
    // Stacking efficeincy  (%):
    if (manufactureInfo.isEfficiencyFactorDirty && !!manufactureInfo.efficiencyFactor) {
      manufactureInfo.efficiencyFactor = Number(manufactureInfo.efficiencyFactor);
    } else {
      let efficiencyFactor = 70;
      if (manufactureInfo.efficiencyFactor) {
        efficiencyFactor = this.shareService.checkDirtyProperty('efficiencyFactor', fieldColorsList) ? manufacturingObj?.efficiencyFactor : efficiencyFactor;
      }
      manufactureInfo.efficiencyFactor = efficiencyFactor;
    }

    // Min Chamber Length
    if (manufactureInfo.isallowanceAlongLengthDirty && !!manufactureInfo.allowanceAlongLength) {
      manufactureInfo.allowanceAlongLength = Number(manufactureInfo.allowanceAlongLength);
    } else {
      let allowanceAlongLength = materialInfo?.dimX / (Number(manufactureInfo.efficiencyFactor) / 100);
      if (manufactureInfo.allowanceAlongLength) {
        allowanceAlongLength = this.shareService.checkDirtyProperty('allowanceAlongLength', fieldColorsList) ? manufacturingObj?.allowanceAlongLength : allowanceAlongLength;
      }
      manufactureInfo.allowanceAlongLength = allowanceAlongLength;
    }

    // Min Chamber/Passage width
    if (manufactureInfo.isallowanceAlongWidthDirty && !!manufactureInfo.allowanceAlongWidth) {
      manufactureInfo.allowanceAlongWidth = Number(manufactureInfo.allowanceAlongWidth);
    } else {
      let allowanceAlongWidth = materialInfo?.dimY / (Number(manufactureInfo.efficiencyFactor) / 100);
      if (manufactureInfo.allowanceAlongWidth) {
        allowanceAlongWidth = this.shareService.checkDirtyProperty('allowanceAlongWidth', fieldColorsList) ? manufacturingObj?.allowanceAlongWidth : allowanceAlongWidth;
      }
      manufactureInfo.allowanceAlongWidth = allowanceAlongWidth;
    }

    // Min Chamber/Passage height
    if (manufactureInfo.isallowanceBetweenPartsDirty && !!manufactureInfo.allowanceBetweenParts) {
      manufactureInfo.allowanceBetweenParts = Number(manufactureInfo.allowanceBetweenParts);
    } else {
      let allowanceBetweenParts = materialInfo?.dimZ / (Number(manufactureInfo.efficiencyFactor) / 100);
      if (manufactureInfo.allowanceBetweenParts) {
        allowanceBetweenParts = this.shareService.checkDirtyProperty('allowanceBetweenParts', fieldColorsList) ? manufacturingObj?.allowanceBetweenParts : allowanceBetweenParts;
      }
      manufactureInfo.allowanceBetweenParts = allowanceBetweenParts;
    }

    // Chamber Length
    if (manufactureInfo.isMuffleLengthDirty && !!manufactureInfo.muffleLength) {
      manufactureInfo.muffleLength = Number(manufactureInfo.muffleLength);
    } else {
      // let flaskLength = this.shareService.isValidNumber(manufactureInfo?.machineMaster.flaskLength);
      let flaskLength = manufactureInfo?.machineMaster ? this.shareService.isValidNumber(manufactureInfo.machineMaster.flaskLength) : 0;
      if (manufactureInfo.muffleLength) {
        flaskLength = this.shareService.checkDirtyProperty('muffleLength', fieldColorsList) ? manufacturingObj?.muffleLength : flaskLength;
      }
      manufactureInfo.muffleLength = flaskLength;
    }

    // Chamber width / Passage width
    if (manufactureInfo.isMuffleWidthDirty && !!manufactureInfo.muffleWidth) {
      manufactureInfo.muffleWidth = Number(manufactureInfo.muffleWidth);
    } else {
      let flaskWidth = 0;
      if (Number(manufactureInfo.subProcessTypeID) === 2) {
        flaskWidth = this.shareService.isValidNumber(manufactureInfo?.machineMaster?.maxWidth);
      } else {
        flaskWidth = this.shareService.isValidNumber(manufactureInfo?.machineMaster?.flaskWidth);
      }
      if (manufactureInfo.muffleWidth) {
        flaskWidth = this.shareService.checkDirtyProperty('muffleWidth', fieldColorsList) ? manufacturingObj?.muffleWidth : flaskWidth;
      }
      manufactureInfo.muffleWidth = flaskWidth;
    }

    // Chamber height
    if (manufactureInfo.isinitialStockHeightDirty && !!manufactureInfo.initialStockHeight) {
      manufactureInfo.initialStockHeight = Number(manufactureInfo.initialStockHeight);
    } else {
      let flaskHeight = 0;
      if (Number(manufactureInfo.subProcessTypeID) === 2) {
        flaskHeight = this.shareService.isValidNumber(manufactureInfo?.machineMaster?.maxLength);
      } else {
        flaskHeight = this.shareService.isValidNumber(manufactureInfo?.machineMaster?.flaskHeight);
      }

      if (manufactureInfo.initialStockHeight) {
        flaskHeight = this.shareService.checkDirtyProperty('initialStockHeight', fieldColorsList) ? manufacturingObj?.initialStockHeight : flaskHeight;
      }
      manufactureInfo.initialStockHeight = flaskHeight;
    }

    // Max Weight machine chamber/conveyor can hold (kg):
    if (manufactureInfo.isNoOfStrokesDirty && !!manufactureInfo.noofStroke) {
      manufactureInfo.noofStroke = Number(manufactureInfo.noofStroke);
    } else {
      let maxWeight = this.shareService.isValidNumber(manufactureInfo?.machineMaster?.maxProcessableWeightKgs);
      if (manufactureInfo.noofStroke) {
        maxWeight = this.shareService.checkDirtyProperty('noofStroke', fieldColorsList) ? manufacturingObj?.noofStroke : maxWeight;
      }
      manufactureInfo.noofStroke = maxWeight;
    }

    // //No of  parts in Chamber Based on Volume(No.):
    // if (manufactureInfo.isnoOfPartsDirty && !!manufactureInfo.noOfParts) {
    //   manufactureInfo.noOfParts = this.shareService.isValidNumber(Number(manufactureInfo.noOfParts));
    // } else {
    //   let noOfParts = this.shareService.isValidNumber(Math.round(
    //     Number(manufactureInfo.muffleLength / manufactureInfo.allowanceAlongLength) *
    //     Number(manufactureInfo.muffleWidth / manufactureInfo.allowanceAlongWidth) *
    //     Number(manufactureInfo.initialStockHeight / manufactureInfo.partEnvelopHeight) *
    //     Number((manufactureInfo.efficiencyFactor / 100) / 100)));
    //   if (!!manufactureInfo.noOfParts)
    //     noOfParts = this.shareService.checkDirtyProperty('noOfParts', fieldColorsList) ? manufacturingObj?.noOfParts : noOfParts;
    //   manufactureInfo.noOfParts = noOfParts;
    // }

    // //No of  parts in Chamber Based onweight(No.):
    // if (manufactureInfo.isNoOfHolesDirty && !!manufactureInfo.noOfHoles) {
    //   manufactureInfo.noOfHoles = this.shareService.isValidNumber(Number(manufactureInfo.noOfHoles));
    // } else {
    //   let noOfHoles = this.shareService.isValidNumber(
    //     Math.round(Number(manufactureInfo.furnaceOutput / manufactureInfo.meltingWeight))
    //   )
    //   noOfHoles = this.shareService.checkDirtyProperty('noOfHoles', fieldColorsList) ? manufacturingObj?.noOfHoles : noOfHoles;
    //   manufactureInfo.noOfHoles = noOfHoles;
    // }
    if (Number(manufactureInfo.subProcessTypeID) === 1) {
      // Total parts in Chamber (Minimum of weight and volume) (No.)/batch:
      if (manufactureInfo.isnoOfCoreDirty && !!manufactureInfo.noOfCore) {
        manufactureInfo.noOfCore = Number(manufactureInfo.noOfCore);
      } else {
        const noOfPartsVolume = Math.floor(
          (Number(manufactureInfo.muffleLength) / Number(manufactureInfo.allowanceAlongLength)) *
            (Number(manufactureInfo.muffleWidth) / Number(manufactureInfo.allowanceAlongWidth)) *
            (Number(manufactureInfo.initialStockHeight) / Number(manufactureInfo.allowanceBetweenParts)) *
            (Number(manufactureInfo.efficiencyFactor) / 100 / 100)
        );
        const noOfPartsWeight = Math.floor(Number(manufactureInfo.noofStroke) / (materialInfo?.netWeight / 1000));
        let noOfCore = noOfPartsVolume > noOfPartsWeight ? noOfPartsWeight : noOfPartsVolume;
        if (manufactureInfo.noOfCore) {
          noOfCore = this.shareService.checkDirtyProperty('noOfCore', fieldColorsList) ? manufacturingObj?.noOfCore : noOfCore;
        }
        manufactureInfo.noOfCore = noOfCore;
      }
    }

    //Setup time
    if (manufactureInfo.issetUpTimeDirty && !!manufactureInfo.setUpTime) {
      manufactureInfo.setUpTime = this.shareService.isValidNumber(Number(manufactureInfo.setUpTime));
    } else {
      let setUpTime = manufactureInfo.setUpTime;
      if (manufactureInfo.setUpTime) {
        setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : setUpTime;
      }
      manufactureInfo.setUpTime = setUpTime;
    }

    //Unloading
    if (manufactureInfo.isUnloadingTimeDirty && !!manufactureInfo.unloadingTime) {
      manufactureInfo.unloadingTime = Number(manufactureInfo.unloadingTime);
    } else {
      let unloadingTime = 0;
      if (Number(manufactureInfo.subProcessTypeID) === 2) {
        unloadingTime = (materialInfo?.netWeight / 1000) * 2.5;
      } else {
        unloadingTime = (materialInfo?.netWeight / 1000) * 0.5 * Number(manufactureInfo.noOfCore);
      }
      if (manufactureInfo.unloadingTime) {
        unloadingTime = this.shareService.checkDirtyProperty('unloadingTime', fieldColorsList) ? manufacturingObj?.unloadingTime : unloadingTime;
      }
      manufactureInfo.unloadingTime = unloadingTime;
    }

    //Process Time
    if (manufactureInfo.isProcessTimeDirty && !!manufactureInfo.processTime) {
      manufactureInfo.processTime = this.shareService.isValidNumber(Number(manufactureInfo.processTime));
    } else {
      let processTime = 9;
      if (Number(manufactureInfo.subProcessTypeID) === 2) {
        processTime = (materialInfo?.partSurfaceArea / 1000) * 0.5;
      } else {
        processTime = 100; // need to revisit
      }
      if (manufactureInfo.processTime) processTime = this.shareService.checkDirtyProperty('processTime', fieldColorsList) ? manufacturingObj?.processTime : processTime;
      manufactureInfo.processTime = processTime;
    }

    // Cycle time per part (s):
    if (manufactureInfo.iscycleTimeDirty && !!manufactureInfo.cycleTime) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = 0;
      if (Number(manufactureInfo.subProcessTypeID) === 2) {
        cycleTime = Number(manufactureInfo.unloadingTime) + Number(manufactureInfo.unloadingTime) + Number(manufactureInfo.processTime);
      } else {
        cycleTime = (Number(manufactureInfo.unloadingTime) + Number(manufactureInfo.unloadingTime) + Number(manufactureInfo.processTime)) / Number(manufactureInfo.noOfCore);
      }
      if (manufactureInfo.cycleTime) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = this.shareService.isValidNumber(cycleTime);
    }

    // //Total machine hour rate
    // if (manufactureInfo.isTotalTimeDirty && !!manufactureInfo.totalTime) {
    //   manufactureInfo.totalTime = Number(manufactureInfo.totalTime);
    // } else {
    //   let totalTime = (this.shareService.isValidNumber((Number(manufactureInfo.cycleTime) *
    //     Number(manufactureInfo.lotSize)) /
    //     3600));
    //   if (!!manufactureInfo.totalTime) {
    //     totalTime = this.shareService.checkDirtyProperty('totalTime', fieldColorsList) ? manufacturingObj?.cycleTime : totalTime;
    //   }
    //   manufactureInfo.totalTime = totalTime;
    // }
    //cost drivers
    this.calculateCostDriver(manufactureInfo, fieldColorsList, manufacturingObj);
    return manufactureInfo;
  }

  calculateCostDriver(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto) {
    //Efficiency
    if (manufactureInfo.isefficiencyDirty && !!manufactureInfo.efficiency) {
      manufactureInfo.efficiency = Number(manufactureInfo.efficiency);
    } else {
      let efficiency =
        manufactureInfo?.machineMaster?.machineMarketDtos?.[0]?.efficiency < 1
          ? manufactureInfo?.machineMaster?.machineMarketDtos?.[0]?.efficiency * 100
          : manufactureInfo?.machineMaster?.machineMarketDtos?.[0]?.efficiency;
      if (manufactureInfo.efficiency) {
        efficiency = this.shareService.checkDirtyProperty('efficiency', fieldColorsList) ? manufacturingObj?.efficiency : efficiency;
      }
      manufactureInfo.efficiency = efficiency;
    }

    //Direct labors
    if (manufactureInfo.isNoOfLowSkilledLaboursDirty && !!manufactureInfo.noOfLowSkilledLabours) {
      manufactureInfo.noOfLowSkilledLabours = Number(manufactureInfo.noOfLowSkilledLabours);
    } else {
      manufactureInfo.noOfLowSkilledLabours = this.shareService.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList)
        ? manufacturingObj?.noOfLowSkilledLabours
        : this.shareService.isValidNumber(manufactureInfo.noOfLowSkilledLabours);
    }

    ////Direct labors rate
    if (manufactureInfo.isLowSkilledLaborRatePerHourDirty && !!manufactureInfo.lowSkilledLaborRatePerHour) {
      manufactureInfo.lowSkilledLaborRatePerHour = Number(manufactureInfo.lowSkilledLaborRatePerHour);
    } else {
      manufactureInfo.lowSkilledLaborRatePerHour = this.shareService.checkDirtyProperty('lowSkilledLaborRatePerHour', fieldColorsList)
        ? manufacturingObj?.lowSkilledLaborRatePerHour
        : this.shareService.isValidNumber(manufactureInfo.lowSkilledLaborRatePerHour);
    }

    // Skilled Labors
    if (manufactureInfo.isSkilledLaborRatePerHourDirty && !!manufactureInfo.noOfSkilledLabours) {
      manufactureInfo.noOfSkilledLabours = Number(manufactureInfo.noOfSkilledLabours);
    } else {
      if (manufactureInfo.noOfSkilledLabours) {
        manufactureInfo.noOfSkilledLabours = this.shareService.checkDirtyProperty('noOfSkilledLabours', fieldColorsList) ? manufacturingObj?.noOfSkilledLabours : manufactureInfo.noOfSkilledLabours;
      }
    }

    //  Skilled Labors rate
    if (manufactureInfo.isSkilledLaborRatePerHourDirty && !!manufactureInfo.skilledLaborRatePerHour) {
      manufactureInfo.skilledLaborRatePerHour = Number(manufactureInfo.skilledLaborRatePerHour);
    } else {
      manufactureInfo.skilledLaborRatePerHour = this.shareService.checkDirtyProperty('skilledLaborRatePerHour', fieldColorsList)
        ? manufacturingObj?.skilledLaborRatePerHour
        : this.shareService.isValidNumber(manufactureInfo.skilledLaborRatePerHour);
    }

    // Qa Inspector
    if (manufactureInfo.isQaInspectorRateDirty && !!manufactureInfo.qaOfInspectorRate) {
      manufactureInfo.qaOfInspectorRate = Number(manufactureInfo.qaOfInspectorRate);
    } else {
      manufactureInfo.qaOfInspectorRate = this.shareService.checkDirtyProperty('qaOfInspectorRate', fieldColorsList)
        ? manufacturingObj?.qaOfInspectorRate
        : this.shareService.isValidNumber(manufactureInfo.qaOfInspectorRate);
    }

    // Sampling rate
    if (manufactureInfo.isSamplingRateDirty && !!manufactureInfo.samplingRate) {
      manufactureInfo.samplingRate = Number(manufactureInfo.samplingRate);
    } else {
      const samplingrate = 100;
      manufactureInfo.samplingRate = this.shareService.checkDirtyProperty('samplingRate', fieldColorsList) ? manufacturingObj?.samplingRate : this.shareService.isValidNumber(samplingrate);
    }

    // Inspection time
    if (manufactureInfo.isinspectionTimeDirty && !!manufactureInfo.inspectionTime) {
      manufactureInfo.inspectionTime = Number(manufactureInfo.inspectionTime);
    } else {
      manufactureInfo.inspectionTime = this.shareService.checkDirtyProperty('inspectionTime', fieldColorsList) ? manufacturingObj?.inspectionTime : manufactureInfo.inspectionTime;
    }

    // Machine hour rate
    if (manufactureInfo.ismachineHourRateDirty && !!manufactureInfo.machineHourRate) {
      manufactureInfo.machineHourRate = Number(manufactureInfo.machineHourRate);
    } else {
      if (manufactureInfo.machineHourRate) {
        manufactureInfo.machineHourRate = this.shareService.checkDirtyProperty('machineHourRate', fieldColorsList) ? manufacturingObj?.machineHourRate : manufactureInfo.machineHourRate;
      }
    }

    // Machine cost
    if (manufactureInfo.isdirectMachineCostDirty && !!manufactureInfo.directMachineCost) {
      manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
    } else {
      let directMachineCost = this.shareService.isValidNumber(((Number(manufactureInfo.cycleTime) * Number(manufactureInfo.machineHourRate)) / 3600) * (Number(manufactureInfo.efficiency) / 100));
      if (manufactureInfo.directMachineCost) {
        directMachineCost = this.shareService.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : directMachineCost;
      }
      manufactureInfo.directMachineCost = directMachineCost;
    }

    //Set up technician = no. of direct (low skilled) labors
    //Skilled Labor in set up = no. of skilled labors

    // Setup cost
    if (manufactureInfo.isdirectSetUpCostDirty && !!manufactureInfo.directSetUpCost) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      let directSetUpCost = this.shareService.isValidNumber(
        (this.shareService.isValidNumber(manufactureInfo.noOfLowSkilledLabours) *
          this.shareService.isValidNumber(manufactureInfo.lowSkilledLaborRatePerHour) *
          this.shareService.isValidNumber(manufactureInfo.setUpTime)) /
          60 /
          this.shareService.isValidNumber(manufactureInfo.lotSize) +
          (this.shareService.isValidNumber(manufactureInfo.noOfSkilledLabours) *
            this.shareService.isValidNumber(manufactureInfo.skilledLaborRatePerHour) *
            this.shareService.isValidNumber(manufactureInfo.setUpTime)) /
            60 /
            this.shareService.isValidNumber(manufactureInfo.lotSize) +
          // this.shareService.isValidNumber(manufactureInfo.machineHourRate) *
          ((this.shareService.isValidNumber(manufactureInfo.directMachineCost) * this.shareService.isValidNumber(manufactureInfo.setUpTime)) /
            60 /
            this.shareService.isValidNumber(manufactureInfo.lotSize)) *
            this.shareService.isValidNumber(Number(manufactureInfo.efficiency) / 100)
      ); // divided lot of size

      if (manufactureInfo.directSetUpCost) {
        directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.directSetUpCost : directSetUpCost;
      }
      manufactureInfo.directSetUpCost = directSetUpCost;
    }

    // Labor cost
    if (manufactureInfo.isdirectLaborCostDirty && !!manufactureInfo.directLaborCost) {
      manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
    } else {
      let directLaborCost =
        (this.shareService.isValidNumber(manufactureInfo.lowSkilledLaborRatePerHour) *
          this.shareService.isValidNumber(manufactureInfo.noOfLowSkilledLabours) *
          this.shareService.isValidNumber(manufactureInfo.cycleTime)) /
          3600 +
        (this.shareService.isValidNumber(manufactureInfo.skilledLaborRatePerHour) *
          this.shareService.isValidNumber(manufactureInfo.noOfSkilledLabours) *
          this.shareService.isValidNumber(manufactureInfo.cycleTime)) /
          3600;

      if (manufactureInfo.directLaborCost) {
        directLaborCost = this.shareService.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : directLaborCost;
      }
      manufactureInfo.directLaborCost = directLaborCost;
    }

    // Inspection cost
    if (manufactureInfo.isinspectionCostDirty && !!manufactureInfo.inspectionCost) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      const inspectionCost = ((manufactureInfo.qaOfInspectorRate * manufactureInfo.inspectionTime) / 60 / manufactureInfo.lotSize) * (Number(manufactureInfo.efficiency) / 100);
      if (manufactureInfo.inspectionCost) {
        manufactureInfo.inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : manufactureInfo.inspectionCost;
      }
      manufactureInfo.inspectionCost = inspectionCost;
    }

    const subTot = Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost);

    // Yeild Cost
    if (manufactureInfo.isyieldCostDirty && !!manufactureInfo.yieldCost) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      let yieldCost = this.shareService.isValidNumber((1 - Number(manufactureInfo.yieldPer) / 100) * (subTot + 0));
      // let yieldCost = this.shareService.isValidNumber((1 - (Number(manufactureInfo.yieldPer) / 100)) * (subTot + Number(manufactureInfo.subProcessTypeID)));
      if (manufactureInfo.yieldCost) {
        yieldCost = this.shareService.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : yieldCost;
      }
      manufactureInfo.yieldCost = yieldCost;
    }

    manufactureInfo.directProcessCost = this.shareService.isValidNumber((subTot + Number(manufactureInfo.yieldCost)) * Number(manufactureInfo.samplingRate / 100));
  }
}
