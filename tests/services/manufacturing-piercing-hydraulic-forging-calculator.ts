
import { ProcessInfoDto } from 'src/app/shared/models';
import { SharedService } from './shared';
import { CostingConfig, ProcessType } from '../costing.config';
import { MaterialForgingConfigService } from 'src/app/shared/config/material-forging-config';
import { ManufacturingForgingSubProcessConfigService } from 'src/app/shared/config/costing-manufacturing-forging-sub-process-config';

export class ManufacturingPiercingHydraulicForgingCalculatorService {
  constructor(
    private shareService: SharedService,
    private _costingConfig: CostingConfig,
    private materialForgingConfigService: MaterialForgingConfigService,
    private forgingSubProcessConfig: ManufacturingForgingSubProcessConfigService
  ) { }

  public calculatePiercingHydraulicForging(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    // const materialNetWeight = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.netWeight;

    // const perimeter = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.perimeter;
    const ultimateTensileStrength = manufactureInfo.materialmasterDatas?.tensileStrength;
    const grossWeight = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.grossWeight;

    //Machine Type
    manufactureInfo.subProcessTypeID = 1;

    //Piercing Hole Diameter
    if (manufactureInfo.ismoldTempDirty && !!manufactureInfo.moldTemp) {
      manufactureInfo.moldTemp = this.shareService.isValidNumber(Number(manufactureInfo.moldTemp));
    } else {
      let moldTemp = 0;
      if (manufactureInfo.moldTemp != null) moldTemp = this.shareService.checkDirtyProperty('moldTemp', fieldColorsList) ? manufacturingObj?.moldTemp : moldTemp;
      manufactureInfo.moldTemp = moldTemp;
    }

    //Piercing Hole Depth
    if (manufactureInfo.isrequiredCurrentDirty && !!manufactureInfo.requiredCurrent) {
      manufactureInfo.requiredCurrent = this.shareService.isValidNumber(Number(manufactureInfo.requiredCurrent));
    } else {
      let requiredCurrent = 0;
      if (manufactureInfo.requiredCurrent != null) requiredCurrent = this.shareService.checkDirtyProperty('requiredCurrent', fieldColorsList) ? manufacturingObj?.requiredCurrent : requiredCurrent;
      manufactureInfo.requiredCurrent = requiredCurrent;
    }

    //Length of Cut
    if (manufactureInfo.isLengthOfCutDirty && !!manufactureInfo.lengthOfCut) {
      manufactureInfo.lengthOfCut = this.shareService.isValidNumber(Number(manufactureInfo.lengthOfCut));
    } else {
      let lengthOfCut = this.shareService.isValidNumber(Math.PI * manufactureInfo?.moldTemp);
      if (manufactureInfo.lengthOfCut != null) lengthOfCut = this.shareService.checkDirtyProperty('lengthOfCut', fieldColorsList) ? manufacturingObj?.lengthOfCut : lengthOfCut;
      manufactureInfo.lengthOfCut = lengthOfCut;
    }

    //Piercing Wall Thickness
    if (manufactureInfo.isflashThicknessDirty && !!manufactureInfo.flashThickness) {
      manufactureInfo.flashThickness = this.shareService.isValidNumber(Number(manufactureInfo.flashThickness));
    } else {
      let flashThickness = this.shareService.isValidNumber(manufactureInfo.requiredCurrent * 0.5);
      if (manufactureInfo.flashThickness != null) flashThickness = this.shareService.checkDirtyProperty('flashThickness', fieldColorsList) ? manufacturingObj?.flashThickness : flashThickness;
      manufactureInfo.flashThickness = flashThickness;
    }

    //Factor of safety
    if (manufactureInfo.ishlFactorDirty && manufactureInfo.hlFactor != null) {
      manufactureInfo.hlFactor = this.shareService.isValidNumber(Number(manufactureInfo.hlFactor));
    } else {
      let hlFactor = 1.2;
      if (manufactureInfo.hlFactor != null) hlFactor = this.shareService.checkDirtyProperty('hlFactor', fieldColorsList) ? manufacturingObj?.hlFactor : hlFactor;
      manufactureInfo.hlFactor = hlFactor;
    }

    //Shear strength of material
    if (manufactureInfo.isclampingPressureDirty && manufactureInfo.clampingPressure != null) {
      manufactureInfo.clampingPressure = this.shareService.isValidNumber(Number(manufactureInfo.clampingPressure));
    } else {
      let clampingPressure = this.shareService.isValidNumber(ultimateTensileStrength * 0.6);
      if (manufactureInfo.clampingPressure != null)
        clampingPressure = this.shareService.checkDirtyProperty('clampingPressure', fieldColorsList) ? manufacturingObj?.clampingPressure : clampingPressure;
      manufactureInfo.clampingPressure = clampingPressure;
    }

    //Theoratical force
    if (manufactureInfo.isTheoreticalForceDirty && manufactureInfo.theoreticalForce != null) {
      manufactureInfo.theoreticalForce = this.shareService.isValidNumber(Number(manufactureInfo.theoreticalForce));
    } else {
      let theoreticalForce = this.shareService.isValidNumber(
        (Number(manufactureInfo.lengthOfCut) * Number(manufactureInfo.flashThickness) * Number(manufactureInfo.clampingPressure) * Number(manufactureInfo.hlFactor)) / 1000
      );
      if (manufactureInfo.theoreticalForce != null)
        theoreticalForce = this.shareService.checkDirtyProperty('theoreticalForce', fieldColorsList) ? manufacturingObj?.theoreticalForce : theoreticalForce;
      manufactureInfo.theoreticalForce = theoreticalForce;
    }

    //Selected Tonnage
    if (manufactureInfo.isselectedTonnageDirty && manufactureInfo.selectedTonnage != null) {
      manufactureInfo.selectedTonnage = this.shareService.isValidNumber(Number(manufactureInfo.selectedTonnage));
    } else {
      let selectedTonnage = this.shareService.isValidNumber(manufactureInfo?.machineMaster?.machineTonnageTons);
      if (manufactureInfo.selectedTonnage != null) selectedTonnage = this.shareService.checkDirtyProperty('selectedTonnage', fieldColorsList) ? manufacturingObj?.selectedTonnage : selectedTonnage;
      manufactureInfo.selectedTonnage = selectedTonnage;
    }

    // Machine Automation Level
    if (manufactureInfo.isSemiAutoOrAutoDirty && manufactureInfo.semiAutoOrAuto !== null) {
      manufactureInfo.semiAutoOrAuto = this.shareService.isValidNumber(Number(manufactureInfo.semiAutoOrAuto));
    } else {
      let automationLevel = 2;

      if (manufactureInfo.partArea !== null) automationLevel = this.shareService.checkDirtyProperty('semiAutoOrAuto', fieldColorsList) ? manufacturingObj?.semiAutoOrAuto : automationLevel;
      manufactureInfo.semiAutoOrAuto = automationLevel;
    }

    // Deformation type:
    if (!(manufactureInfo.noOfbends != null && manufactureInfo.noOfbends !== 0 && manufactureInfo.noOfbends !== undefined)) {
      manufactureInfo.noOfbends = 2;
    }

    //Setup time
    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
      manufactureInfo.setUpTime = this.shareService.isValidNumber(Number(manufactureInfo.setUpTime));
    } else {
      let setUpTime = manufactureInfo.setUpTime;

      if (manufactureInfo.setUpTime != null) setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : setUpTime;
      manufactureInfo.setUpTime = setUpTime;
    }

    // Process Time
    if (manufactureInfo.isProcessTimeDirty && manufactureInfo.processTime != null) {
      manufactureInfo.processTime = this.shareService.isValidNumber(Number(manufactureInfo.processTime));
    } else {
      let processTime = 0;

      // Use selectedTonnage to pick a threshold from forgingColdClosedCapacityToStrokeTime
      const selectedTonnage = this.shareService.isValidNumber(manufactureInfo.selectedTonnage);
      const lookup = this.forgingSubProcessConfig?.forgingColdClosedCapacityToStrokeTime;

      if (selectedTonnage > 0 && lookup && Object.keys(lookup).length > 0) {
        // get numeric sorted keys (ascending)
        const keys = Object.keys(lookup)
          .map((k) => Number(k))
          .filter((k) => !isNaN(k))
          .sort((a, b) => a - b);

        if (keys.length > 0) {
          // choose smallest key >= selectedTonnage, otherwise fallback to largest key
          const matchKey = keys.find((k) => selectedTonnage <= k) ?? keys[keys.length - 1];
          processTime = this.shareService.isValidNumber(lookup[matchKey]) || processTime;
        }
      }

      // Preserve any manufacturingObj override if the property was present
      if (manufactureInfo.processTime != null) {
        processTime = this.shareService.checkDirtyProperty('processTime', fieldColorsList) ? manufacturingObj?.processTime : processTime;
      }

      manufactureInfo.processTime = processTime;
    }

    //Loading
    if (manufactureInfo.isLoadingTimeDirty && manufactureInfo.loadingTime != null) {
      manufactureInfo.loadingTime = Number(manufactureInfo.loadingTime);
    } else {
      let loadingTime = this.shareService.isValidNumber(Number(grossWeight / 1000) * 0.15);
      if (manufactureInfo.loadingTime != null) {
        loadingTime = this.shareService.checkDirtyProperty('loadingTime', fieldColorsList) ? manufacturingObj?.loadingTime : loadingTime;
      }
      manufactureInfo.loadingTime = loadingTime;
    }

    //Unloading
    if (manufactureInfo.isUnloadingTimeDirty && manufactureInfo.unloadingTime != null) {
      manufactureInfo.unloadingTime = Number(manufactureInfo.unloadingTime);
    } else {
      let unloadingTime = this.shareService.isValidNumber(Number(grossWeight / 1000) * 0.15);
      if (manufactureInfo.unloadingTime != null) {
        unloadingTime = this.shareService.checkDirtyProperty('unloadingTime', fieldColorsList) ? manufacturingObj?.unloadingTime : unloadingTime;
      }
      manufactureInfo.unloadingTime = unloadingTime;
    }

    // Cycle time per part (s):
    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(Number(manufactureInfo.loadingTime) + Number(manufactureInfo.unloadingTime) + Number(manufactureInfo.processTime));
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
    return manufactureInfo;
  }

  calculateCostDriver(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto) {
    //Efficiency
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

    //set up cost
    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost != null) {
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
        ((this.shareService.isValidNumber(manufactureInfo.machineHourRate) * this.shareService.isValidNumber(manufactureInfo.setUpTime)) /
          60 /
          this.shareService.isValidNumber(manufactureInfo.lotSize)) *
        this.shareService.isValidNumber(manufactureInfo.efficiency)
      );

      if (manufactureInfo.directSetUpCost != null) {
        directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.directSetUpCost : directSetUpCost;
      }
      manufactureInfo.directSetUpCost = directSetUpCost;
    }

    //Labor cost
    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost != null) {
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

    if (Number(manufactureInfo?.processTypeID) === ProcessType.Testing) {
      manufactureInfo.directProcessCost = this.shareService.isValidNumber(manufactureInfo?.directProcessCost * manufactureInfo?.samplingRate);
    }
  }
}
