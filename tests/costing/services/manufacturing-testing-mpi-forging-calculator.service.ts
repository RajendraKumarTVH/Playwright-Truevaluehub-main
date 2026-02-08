import { Injectable } from '@angular/core';
import { ProcessInfoDto } from 'src/app/shared/models';
import { SharedService } from './shared.service';
import { CostingConfig } from '../costing.config';
import { MaterialForgingConfigService } from 'src/app/shared/config/material-forging-config';
import { ManufacturingForgingSubProcessConfigService } from 'src/app/shared/config/costing-manufacturing-forging-sub-process-config';

@Injectable({
  providedIn: 'root',
})
export class ManufacturingTestingMpiForgingCalculatorService {
  constructor(
    private shareService: SharedService,
    private _costingConfig: CostingConfig,
    private materialForgingConfigService: MaterialForgingConfigService,
    private forgingSubProcessConfig: ManufacturingForgingSubProcessConfigService
  ) {}

  public calculateTestingMpiForging(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    // const grossWeight = 0;
    const forgedWeight = manufactureInfo.materialInfoList?.length && this.shareService.isValidNumber(manufactureInfo.materialInfoList[0]?.netWeight);
    const partSurfaceArea = manufactureInfo.materialInfoList?.length && this.shareService.isValidNumber(manufactureInfo.materialInfoList[0]?.partSurfaceArea);

    //Type of Operation
    manufactureInfo.subProcessTypeID = 1;

    //Number of Parts in a CT
    if (manufactureInfo.isDrillDiameterDirty && manufactureInfo.drillDiameter != null) {
      manufactureInfo.drillDiameter = this.shareService.isValidNumber(Number(manufactureInfo.drillDiameter));
    } else {
      let drillDiameter = 1;

      if (manufactureInfo.drillDiameter != null) drillDiameter = this.shareService.checkDirtyProperty('drillDiameter', fieldColorsList) ? manufacturingObj?.drillDiameter : drillDiameter;
      manufactureInfo.drillDiameter = drillDiameter;
    }

    //Part Surface Area
    manufactureInfo.moldTemp = this.shareService.isValidNumber(partSurfaceArea);

    // Machine Automation Level
    if (manufactureInfo.isSemiAutoOrAutoDirty && manufactureInfo.semiAutoOrAuto !== null) {
      manufactureInfo.semiAutoOrAuto = this.shareService.isValidNumber(Number(manufactureInfo.semiAutoOrAuto));
    } else {
      let automationLevel = 2;

      if (manufactureInfo.partArea !== null) automationLevel = this.shareService.checkDirtyProperty('semiAutoOrAuto', fieldColorsList) ? manufacturingObj?.semiAutoOrAuto : automationLevel;
      manufactureInfo.semiAutoOrAuto = automationLevel;
    }

    let effectiveQuantity = this.shareService.isValidNumber(manufactureInfo?.drillDiameter ** 0.85);
    let partWeight = this.shareService.isValidNumber(forgedWeight / 1000);
    let loadingTimePerPart = this.forgingSubProcessConfig.getTestingLoadTimeForPartWeight(partWeight ?? 0);
    let unloadingTimePerPart = this.forgingSubProcessConfig.getTestingUnloadTimeForPartWeight(partWeight ?? 0);

    //Material Loading Time
    if (manufactureInfo.isLoadingTimeDirty && manufactureInfo.loadingTime != null) {
      manufactureInfo.loadingTime = this.shareService.isValidNumber(Number(manufactureInfo.loadingTime));
    } else {
      let loadingTime = this.shareService.isValidNumber(effectiveQuantity * loadingTimePerPart);

      if (manufactureInfo.loadingTime != null) loadingTime = this.shareService.checkDirtyProperty('loadingTime', fieldColorsList) ? manufacturingObj?.loadingTime : loadingTime;
      manufactureInfo.loadingTime = loadingTime;
    }

    //Material Unloading Time
    if (manufactureInfo.isUnloadingTimeDirty && manufactureInfo.unloadingTime != null) {
      manufactureInfo.unloadingTime = this.shareService.isValidNumber(Number(manufactureInfo.unloadingTime));
    } else {
      let unloadingTime = this.shareService.isValidNumber(effectiveQuantity * unloadingTimePerPart);

      if (manufactureInfo.unloadingTime != null) unloadingTime = this.shareService.checkDirtyProperty('unloadingTime', fieldColorsList) ? manufacturingObj?.unloadingTime : unloadingTime;
      manufactureInfo.unloadingTime = unloadingTime;
    }

    let visualInspectionTime = 0;
    if (manufactureInfo.semiAutoOrAuto === 3) {
      visualInspectionTime = this.shareService.isValidNumber(partSurfaceArea * 0.0003 * effectiveQuantity);
    } else {
      visualInspectionTime = this.shareService.isValidNumber(partSurfaceArea * 0.0003);
    }

    let particleApplicationTime = 0;
    if (manufactureInfo.semiAutoOrAuto === 3) {
      particleApplicationTime = this.shareService.isValidNumber(partSurfaceArea * 0.0002 * effectiveQuantity);
    } else {
      particleApplicationTime = this.shareService.isValidNumber(partSurfaceArea * 0.0002);
    }

    let demagnetizationTime = 0;
    if (manufactureInfo.semiAutoOrAuto === 3) {
      demagnetizationTime = this.shareService.isValidNumber(partSurfaceArea * 0.0002 * effectiveQuantity);
    } else {
      demagnetizationTime = this.shareService.isValidNumber(partSurfaceArea * 0.0002);
    }

    let documentationTime = this.shareService.isValidNumber(partSurfaceArea * effectiveQuantity * 0.0001);

    //Particle Application Time
    if (manufactureInfo.isrequiredCurrentDirty && manufactureInfo.requiredCurrent != null) {
      manufactureInfo.requiredCurrent = this.shareService.isValidNumber(Number(manufactureInfo.requiredCurrent));
    } else {
      let requiredCurrent = this.shareService.isValidNumber(particleApplicationTime);

      if (manufactureInfo.requiredCurrent != null) requiredCurrent = this.shareService.checkDirtyProperty('requiredCurrent', fieldColorsList) ? manufacturingObj?.requiredCurrent : requiredCurrent;
      manufactureInfo.requiredCurrent = requiredCurrent;
    }

    //Magnetic Field Application Time
    if (manufactureInfo.isInitialTempDirty && manufactureInfo.initialTemp != null) {
      manufactureInfo.initialTemp = this.shareService.isValidNumber(Number(manufactureInfo.initialTemp));
    } else {
      let initialTemp = 1.5;

      if (manufactureInfo.initialTemp != null) initialTemp = this.shareService.checkDirtyProperty('initialTemp', fieldColorsList) ? manufacturingObj?.initialTemp : initialTemp;
      manufactureInfo.initialTemp = initialTemp;
    }

    //Visual Inspection Time
    if (manufactureInfo.isfinalTempDirty && manufactureInfo.finalTemp != null) {
      manufactureInfo.finalTemp = this.shareService.isValidNumber(Number(manufactureInfo.finalTemp));
    } else {
      let finalTemp = this.shareService.isValidNumber(visualInspectionTime);

      if (manufactureInfo.finalTemp != null) finalTemp = this.shareService.checkDirtyProperty('finalTemp', fieldColorsList) ? manufacturingObj?.finalTemp : finalTemp;
      manufactureInfo.finalTemp = finalTemp;
    }

    //Demagnetization Time
    if (manufactureInfo.ispartAreaDirty && manufactureInfo.partArea != null) {
      manufactureInfo.partArea = this.shareService.isValidNumber(Number(manufactureInfo.partArea));
    } else {
      let partArea = this.shareService.isValidNumber(demagnetizationTime);

      if (manufactureInfo.partArea != null) partArea = this.shareService.checkDirtyProperty('partArea', fieldColorsList) ? manufacturingObj?.partArea : partArea;
      manufactureInfo.partArea = partArea;
    }

    //Documentation Time
    if (manufactureInfo.isPowerSupplyDirty && manufactureInfo.powerSupply != null) {
      manufactureInfo.powerSupply = this.shareService.isValidNumber(Number(manufactureInfo.powerSupply));
    } else {
      let powerSupply = this.shareService.isValidNumber(documentationTime);

      if (manufactureInfo.powerSupply != null) powerSupply = this.shareService.checkDirtyProperty('powerSupply', fieldColorsList) ? manufacturingObj?.powerSupply : powerSupply;
      manufactureInfo.powerSupply = powerSupply;
    }

    //Process Cycle time
    if (manufactureInfo.istimeRequiredCableTieDirty && manufactureInfo.timeRequiredCableTie != null) {
      manufactureInfo.timeRequiredCableTie = this.shareService.isValidNumber(Number(manufactureInfo.timeRequiredCableTie));
    } else {
      // let timeRequiredCableTie = this.shareService.isValidNumber(documentationTime + visualInspectionTime + manufactureInfo?.loadingTime + manufactureInfo.unloadingTime);
      let timeRequiredCableTie = this.shareService.isValidNumber(
        manufactureInfo?.requiredCurrent + manufactureInfo?.initialTemp + manufactureInfo?.finalTemp + manufactureInfo?.partArea + manufactureInfo?.powerSupply
      );

      if (manufactureInfo.timeRequiredCableTie != null)
        timeRequiredCableTie = this.shareService.checkDirtyProperty('timeRequiredCableTie', fieldColorsList) ? manufacturingObj?.timeRequiredCableTie : timeRequiredCableTie;
      manufactureInfo.timeRequiredCableTie = timeRequiredCableTie;
    }

    //Setup time
    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
      manufactureInfo.setUpTime = this.shareService.isValidNumber(Number(manufactureInfo.setUpTime));
    } else {
      let setUpTime = manufactureInfo.setUpTime;

      if (manufactureInfo.setUpTime != null) setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : setUpTime;
      manufactureInfo.setUpTime = setUpTime;
    }

    //Process Time
    if (manufactureInfo.isProcessTimeDirty && manufactureInfo.processTime != null) {
      manufactureInfo.processTime = this.shareService.isValidNumber(Number(manufactureInfo.processTime));
    } else {
      let processTime = 3600;

      if (manufactureInfo.processTime != null) processTime = this.shareService.checkDirtyProperty('processTime', fieldColorsList) ? manufacturingObj?.processTime : processTime;
      manufactureInfo.processTime = processTime;
    }
    //Material Handling Time
    if (manufactureInfo.istotalCycleTimeDirty && manufactureInfo.totalCycleTime != null) {
      manufactureInfo.totalCycleTime = this.shareService.isValidNumber(Number(manufactureInfo.totalCycleTime));
    } else {
      let totalCycleTime = 3;

      if (manufactureInfo.totalCycleTime != null) totalCycleTime = this.shareService.checkDirtyProperty('totalCycleTime', fieldColorsList) ? manufacturingObj?.totalCycleTime : totalCycleTime;
      manufactureInfo.totalCycleTime = totalCycleTime;
    }

    // Cycle time per part (s):
    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(
        (Number(manufactureInfo?.timeRequiredCableTie) + Number(manufactureInfo.loadingTime) + Number(manufactureInfo.unloadingTime)) / Number(manufactureInfo?.drillDiameter)
      );
      if (manufactureInfo.cycleTime != null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    //Total machine hour rate
    if (manufactureInfo.isTotalTimeDirty && manufactureInfo.totalTime != null) {
      manufactureInfo.totalTime = Number(manufactureInfo.totalTime);
    } else {
      let totalTime = this.shareService.isValidNumber((Number(manufactureInfo.cycleTime) * Number(manufactureInfo.lotSize)) / 3600);
      if (manufactureInfo.totalTime != null) {
        totalTime = this.shareService.checkDirtyProperty('totalTime', fieldColorsList) ? manufacturingObj?.cycleTime : totalTime;
      }
      manufactureInfo.totalTime = totalTime;
    }
    //cost drivers
    this.calculateCostDriver(manufactureInfo, fieldColorsList, manufacturingObj);
    // return new Observable((obs) => {
    //   obs.next(manufactureInfo);
    // });
    return manufactureInfo;
  }

  calculateCostDriver(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto) {
    //Efficiency
    // if (manufactureInfo.isefficiencyDirty && manufactureInfo.efficiency != null) {
    //   manufactureInfo.efficiency = Number(manufactureInfo.efficiency);
    // } else {
    //   if (manufactureInfo.efficiency != null)
    //     manufactureInfo.efficiency = this.shareService.checkDirtyProperty('efficiency', fieldColorsList) ? manufacturingObj?.efficiency : this.shareService.isValidNumber(manufactureInfo.efficiency);
    // }
    if (manufactureInfo.isefficiencyDirty && manufactureInfo.efficiency != null) {
      manufactureInfo.efficiency = Number(manufactureInfo.efficiency);
    } else {
      let efficiency = 0.85;
      if (manufactureInfo.efficiency != null) {
        efficiency = this.shareService.checkDirtyProperty('efficiency', fieldColorsList) ? manufacturingObj?.efficiency : efficiency;
      }
      manufactureInfo.efficiency = efficiency;
    }

    //Direct labors
    if (manufactureInfo.isNoOfLowSkilledLaboursDirty && manufactureInfo.noOfLowSkilledLabours != null) {
      manufactureInfo.noOfLowSkilledLabours = Number(manufactureInfo.noOfLowSkilledLabours);
    } else {
      manufactureInfo.noOfLowSkilledLabours = this.shareService.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList)
        ? manufacturingObj?.noOfLowSkilledLabours
        : this.shareService.isValidNumber(manufactureInfo.noOfLowSkilledLabours);
    }

    ////Direct labors rate
    if (manufactureInfo.isLowSkilledLaborRatePerHourDirty && manufactureInfo.lowSkilledLaborRatePerHour != null) {
      manufactureInfo.lowSkilledLaborRatePerHour = Number(manufactureInfo.lowSkilledLaborRatePerHour);
    } else {
      manufactureInfo.lowSkilledLaborRatePerHour = this.shareService.checkDirtyProperty('lowSkilledLaborRatePerHour', fieldColorsList)
        ? manufacturingObj?.lowSkilledLaborRatePerHour
        : this.shareService.isValidNumber(manufactureInfo.lowSkilledLaborRatePerHour);
    }

    //Skilled Labors
    if (manufactureInfo.isSkilledLaborRatePerHourDirty && manufactureInfo.noOfSkilledLabours != null) {
      manufactureInfo.noOfSkilledLabours = Number(manufactureInfo.noOfSkilledLabours);
    } else {
      if (manufactureInfo.noOfSkilledLabours != null) {
        manufactureInfo.noOfSkilledLabours = this.shareService.checkDirtyProperty('noOfSkilledLabours', fieldColorsList) ? manufacturingObj?.noOfSkilledLabours : manufactureInfo.noOfSkilledLabours;
      }
    }

    //  //Skilled Labors rate
    if (manufactureInfo.isSkilledLaborRatePerHourDirty && manufactureInfo.skilledLaborRatePerHour != null) {
      manufactureInfo.skilledLaborRatePerHour = Number(manufactureInfo.skilledLaborRatePerHour);
    } else {
      manufactureInfo.skilledLaborRatePerHour = this.shareService.checkDirtyProperty('skilledLaborRatePerHour', fieldColorsList)
        ? manufacturingObj?.skilledLaborRatePerHour
        : this.shareService.isValidNumber(manufactureInfo.skilledLaborRatePerHour);
    }

    //Qa Inspector
    if (manufactureInfo.isQaInspectorRateDirty && manufactureInfo.qaOfInspectorRate != null) {
      manufactureInfo.qaOfInspectorRate = Number(manufactureInfo.qaOfInspectorRate);
    } else {
      manufactureInfo.qaOfInspectorRate = this.shareService.checkDirtyProperty('qaOfInspectorRate', fieldColorsList)
        ? manufacturingObj?.qaOfInspectorRate
        : this.shareService.isValidNumber(manufactureInfo.qaOfInspectorRate);
    }

    //sampling rate
    if (manufactureInfo.isSamplingRateDirty && manufactureInfo.samplingRate != null) {
      manufactureInfo.samplingRate = Number(manufactureInfo.samplingRate);
    } else {
      const samplingrate = 100;
      manufactureInfo.samplingRate = this.shareService.checkDirtyProperty('samplingRate', fieldColorsList)
        ? manufacturingObj?.samplingRate
        : manufacturingObj?.samplingRate || this.shareService.isValidNumber(samplingrate);
    }

    //Inspection time
    if (manufactureInfo.isinspectionTimeDirty && manufactureInfo.inspectionTime != null) {
      manufactureInfo.inspectionTime = Number(manufactureInfo.inspectionTime);
    } else {
      manufactureInfo.inspectionTime = this.shareService.checkDirtyProperty('inspectionTime', fieldColorsList) ? manufacturingObj?.inspectionTime : manufactureInfo.inspectionTime;
    }

    //Machine hour rate
    if (manufactureInfo.ismachineHourRateDirty && manufactureInfo.machineHourRate != null) {
      manufactureInfo.machineHourRate = Number(manufactureInfo.machineHourRate);
    } else {
      if (manufactureInfo.machineHourRate != null) {
        manufactureInfo.machineHourRate = this.shareService.checkDirtyProperty('machineHourRate', fieldColorsList) ? manufacturingObj?.machineHourRate : manufactureInfo.machineHourRate;
      }
    }

    //Machine cost
    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost != null) {
      manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
    } else {
      let directMachineCost = this.shareService.isValidNumber(((Number(manufactureInfo.cycleTime) * Number(manufactureInfo.machineHourRate)) / 3600) * manufactureInfo.efficiency);
      if (manufactureInfo.directMachineCost != null) {
        directMachineCost = this.shareService.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : directMachineCost;
      }
      manufactureInfo.directMachineCost = directMachineCost;
    }

    //Set up technician
    //Skilled Labor in set up

    //set up cost
    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost != null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      //(E52*E55*E43/60/E51/E20)+(E53*E56*E43/60/E51/E20)
      let directSetUpCost = this.shareService.isValidNumber(
        (this.shareService.isValidNumber(manufactureInfo.noOfLowSkilledLabours) *
          this.shareService.isValidNumber(manufactureInfo.lowSkilledLaborRatePerHour) *
          this.shareService.isValidNumber(manufactureInfo.setUpTime)) /
          60 /
          //this.shareService.isValidNumber(manufactureInfo.efficiency) /
          this.shareService.isValidNumber(manufactureInfo.lotSize) +
          (this.shareService.isValidNumber(manufactureInfo.noOfSkilledLabours) *
            this.shareService.isValidNumber(manufactureInfo.skilledLaborRatePerHour) *
            this.shareService.isValidNumber(manufactureInfo.setUpTime)) /
            60 /
            // this.shareService.isValidNumber(manufactureInfo.efficiency) /
            this.shareService.isValidNumber(manufactureInfo.lotSize) +
          ((this.shareService.isValidNumber(manufactureInfo.machineHourRate) * this.shareService.isValidNumber(manufactureInfo.setUpTime)) /
            60 /
            // this.shareService.isValidNumber(manufactureInfo.efficiency) /
            this.shareService.isValidNumber(manufactureInfo.lotSize)) *
            this.shareService.isValidNumber(manufactureInfo.efficiency)
      ); //divided lot of size

      if (manufactureInfo.directSetUpCost != null) {
        directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.directSetUpCost : directSetUpCost;
      }
      manufactureInfo.directSetUpCost = directSetUpCost;
    }

    //Labor cost
    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost != null) {
      manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
    } else {
      //=(E55*E52*E47/3600/E51)+(E56*E53*E47/3600/E51)
      let directLaborCost =
        (this.shareService.isValidNumber(manufactureInfo.lowSkilledLaborRatePerHour) *
          this.shareService.isValidNumber(manufactureInfo.noOfLowSkilledLabours) *
          this.shareService.isValidNumber(manufactureInfo.cycleTime)) /
          3600 +
        (this.shareService.isValidNumber(manufactureInfo.skilledLaborRatePerHour) *
          this.shareService.isValidNumber(manufactureInfo.noOfSkilledLabours) *
          this.shareService.isValidNumber(manufactureInfo.cycleTime)) /
          3600;

      if (manufactureInfo.directLaborCost != null) {
        directLaborCost = this.shareService.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : directLaborCost;
      }
      manufactureInfo.directLaborCost = directLaborCost;
    }

    //inspection cost
    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost != null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      const inspectionCost = ((manufactureInfo.qaOfInspectorRate * manufactureInfo.inspectionTime) / 60 / manufactureInfo.lotSize) * manufactureInfo.efficiency;
      if (manufactureInfo.inspectionCost != null) {
        manufactureInfo.inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : manufactureInfo.inspectionCost;
      }
      manufactureInfo.inspectionCost = inspectionCost;
    }

    // Yeild Cost
    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost != null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      let yieldCost = this.shareService.isValidNumber(
        (1 - this.shareService.isValidNumber(manufactureInfo.yieldPer / 100)) *
          (this.shareService.isValidNumber(manufactureInfo.directMachineCost) +
            this.shareService.isValidNumber(manufactureInfo.directSetUpCost) +
            this.shareService.isValidNumber(manufactureInfo.directLaborCost) +
            this.shareService.isValidNumber(manufactureInfo.inspectionCost) +
            this.shareService.isValidNumber(manufactureInfo.netMaterialCost))
      );

      if (manufactureInfo.yieldCost != null) {
        yieldCost = this.shareService.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : yieldCost;
      }
      manufactureInfo.yieldCost = yieldCost;
    }

    manufactureInfo.directProcessCost = this.shareService.isValidNumber(
      this.shareService.isValidNumber(manufactureInfo.directMachineCost) +
        this.shareService.isValidNumber(manufactureInfo.directSetUpCost) +
        this.shareService.isValidNumber(manufactureInfo.directLaborCost) +
        this.shareService.isValidNumber(manufactureInfo.yieldCost) +
        this.shareService.isValidNumber(manufactureInfo.inspectionCost)
    );

    // if (Number(manufactureInfo?.processTypeID) === ProcessType.Testing) {
    //   manufactureInfo.directProcessCost = this.shareService.isValidNumber(manufactureInfo?.directProcessCost * manufactureInfo?.samplingRate);
    // }
  }
}
