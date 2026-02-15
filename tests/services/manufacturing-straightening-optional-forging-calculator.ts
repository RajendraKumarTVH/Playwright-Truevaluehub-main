import { ProcessInfoDto } from 'src/app/shared/models';
import { SharedService } from './shared';
import { CostingConfig, ProcessType } from '../costing.config';
import { MaterialForgingConfigService } from 'src/app/shared/config/material-forging-config';
import { ManufacturingForgingSubProcessConfigService } from 'src/app/shared/config/costing-manufacturing-forging-sub-process-config';

export class ManufacturingStraighteningOptionalForgingCalculatorService {
  constructor(
    private shareService: SharedService,
    private _costingConfig: CostingConfig,
    private materialForgingConfigService: MaterialForgingConfigService,
    private forgingSubProcessConfig: ManufacturingForgingSubProcessConfigService
  ) { }

  public calculateStraighteningOptionalForging(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    const netWeight = manufactureInfo.materialInfoList?.[0]?.netWeight ?? 0;
    const partLength = manufactureInfo.materialInfoList?.[0]?.dimX ?? 0;
    const partWidth = manufactureInfo.materialInfoList?.[0]?.dimY ?? 0;
    const partHeight = manufactureInfo.materialInfoList?.[0]?.dimZ ?? 0;

    // Sub-process id for straightening/optional forging (choose appropriate id)
    manufactureInfo.subProcessTypeID = 2;

    // Number of Parts in a CT
    if (manufactureInfo.isNoOfStartsPierceDirty === true && manufactureInfo.noOfStartsPierce !== null && manufactureInfo.noOfStartsPierce !== undefined) {
      manufactureInfo.noOfStartsPierce = this.shareService.isValidNumber(Number(manufactureInfo.noOfStartsPierce));
    } else {
      let noOfStartsPierce = 2;
      if (manufactureInfo.noOfStartsPierce !== null && manufactureInfo.noOfStartsPierce !== undefined) {
        noOfStartsPierce = this.shareService.checkDirtyProperty('noOfStartsPierce', fieldColorsList) ? (manufacturingObj?.noOfStartsPierce ?? noOfStartsPierce) : noOfStartsPierce;
      }
      manufactureInfo.noOfStartsPierce = noOfStartsPierce;
    }

    // Part Length
    if (manufactureInfo.isallowanceAlongLengthDirty === true && manufactureInfo.allowanceAlongLength !== null && manufactureInfo.allowanceAlongLength !== undefined) {
      manufactureInfo.allowanceAlongLength = this.shareService.isValidNumber(Number(manufactureInfo.allowanceAlongLength));
    } else {
      let allowanceAlongLength = this.shareService.isValidNumber(partLength);
      if (manufactureInfo.allowanceAlongLength !== null && manufactureInfo.allowanceAlongLength !== undefined) {
        allowanceAlongLength = this.shareService.checkDirtyProperty('allowanceAlongLength', fieldColorsList) ? (manufacturingObj?.allowanceAlongLength ?? allowanceAlongLength) : allowanceAlongLength;
      }
      manufactureInfo.allowanceAlongLength = allowanceAlongLength;
    }

    // Part Width/Dia.
    if (manufactureInfo.isallowanceAlongWidthDirty === true && manufactureInfo.allowanceAlongWidth !== null && manufactureInfo.allowanceAlongWidth !== undefined) {
      manufactureInfo.allowanceAlongWidth = this.shareService.isValidNumber(Number(manufactureInfo.allowanceAlongWidth));
    } else {
      let allowanceAlongWidth = this.shareService.isValidNumber(Math.min(partWidth, partHeight));
      if (manufactureInfo.allowanceAlongWidth !== null && manufactureInfo.allowanceAlongWidth !== undefined) {
        allowanceAlongWidth = this.shareService.checkDirtyProperty('allowanceAlongWidth', fieldColorsList) ? (manufacturingObj?.allowanceAlongWidth ?? allowanceAlongWidth) : allowanceAlongWidth;
      }
      manufactureInfo.allowanceAlongWidth = allowanceAlongWidth;
    }

    // Selected Tonnage
    if (manufactureInfo.isselectedTonnageDirty === true && manufactureInfo.selectedTonnage !== null && manufactureInfo.selectedTonnage !== undefined) {
      manufactureInfo.selectedTonnage = this.shareService.isValidNumber(Number(manufactureInfo.selectedTonnage));
    } else {
      let selectedTonnage = this.shareService.isValidNumber(manufactureInfo?.machineMaster?.machineTonnageTons);
      if (manufactureInfo.selectedTonnage !== null && manufactureInfo.selectedTonnage !== undefined) {
        selectedTonnage = this.shareService.checkDirtyProperty('selectedTonnage', fieldColorsList) ? (manufacturingObj?.selectedTonnage ?? selectedTonnage) : selectedTonnage;
      }
      manufactureInfo.selectedTonnage = selectedTonnage;
    }

    // Machine Automation Level
    if (manufactureInfo.isSemiAutoOrAutoDirty === true && manufactureInfo.semiAutoOrAuto !== null && manufactureInfo.semiAutoOrAuto !== undefined) {
      manufactureInfo.semiAutoOrAuto = this.shareService.isValidNumber(Number(manufactureInfo.semiAutoOrAuto));
    } else {
      let automationLevel = 2;
      if (manufactureInfo.semiAutoOrAuto !== null && manufactureInfo.semiAutoOrAuto !== undefined) {
        automationLevel = this.shareService.checkDirtyProperty('semiAutoOrAuto', fieldColorsList) ? (manufacturingObj?.semiAutoOrAuto ?? automationLevel) : automationLevel;
      }
      manufactureInfo.semiAutoOrAuto = automationLevel;
    }

    // Setup time
    if (manufactureInfo.issetUpTimeDirty === true && manufactureInfo.setUpTime !== null && manufactureInfo.setUpTime !== undefined) {
      manufactureInfo.setUpTime = this.shareService.isValidNumber(Number(manufactureInfo.setUpTime));
    } else {
      let setUpTime = manufactureInfo.setUpTime ?? 0;
      if (manufactureInfo.setUpTime !== null && manufactureInfo.setUpTime !== undefined) {
        setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? (manufacturingObj?.setUpTime ?? setUpTime) : setUpTime;
      }
      manufactureInfo.setUpTime = setUpTime;
    }

    let processTimePerBatch = this.calCulateDiameterPartWeight(manufactureInfo.allowanceAlongWidth, manufactureInfo.allowanceAlongLength);

    // Process Cycle time
    if (manufactureInfo.isProcessTimeDirty === true && manufactureInfo.processTime !== null && manufactureInfo.processTime !== undefined) {
      manufactureInfo.processTime = this.shareService.isValidNumber(Number(manufactureInfo.processTime));
    } else {
      let processTime = 0;
      if (manufactureInfo.semiAutoOrAuto === 1) {
        processTime = this.shareService.isValidNumber(processTimePerBatch * 0.5);
      } else if (manufactureInfo.semiAutoOrAuto === 2) {
        processTime = this.shareService.isValidNumber(processTimePerBatch * 0.65);
      } else if (manufactureInfo.semiAutoOrAuto === 3) {
        processTime = this.shareService.isValidNumber(processTimePerBatch * 0.75);
      }

      if (manufactureInfo.processTime !== null && manufactureInfo.processTime !== undefined) {
        processTime = this.shareService.checkDirtyProperty('processTime', fieldColorsList) ? (manufacturingObj?.processTime ?? processTime) : processTime;
      }

      manufactureInfo.processTime = processTime;
    }

    // Get loading/unloading times based on net weight
    const netWeightInKg = netWeight / 1000;
    const loadingUnloadingTimeRange = this.forgingSubProcessConfig.loadingUnloadingTimeLookup?.find((x) => x.weightFrom < netWeightInKg && x.weightTo >= netWeightInKg);

    // Loading
    if (manufactureInfo.isLoadingTimeDirty === true && manufactureInfo.loadingTime !== null && manufactureInfo.loadingTime !== undefined) {
      manufactureInfo.loadingTime = this.shareService.isValidNumber(Number(manufactureInfo.loadingTime));
    } else {
      let loadingTime = loadingUnloadingTimeRange?.loadingTime ?? 0;
      if (manufactureInfo.loadingTime !== null && manufactureInfo.loadingTime !== undefined) {
        loadingTime = this.shareService.checkDirtyProperty('loadingTime', fieldColorsList) ? (manufacturingObj?.loadingTime ?? loadingTime) : loadingTime;
      }
      manufactureInfo.loadingTime = this.shareService.isValidNumber(loadingTime);
    }

    // Unloading
    if (manufactureInfo.isUnloadingTimeDirty === true && manufactureInfo.unloadingTime !== null && manufactureInfo.unloadingTime !== undefined) {
      manufactureInfo.unloadingTime = this.shareService.isValidNumber(Number(manufactureInfo.unloadingTime));
    } else {
      let unloadingTime = loadingUnloadingTimeRange?.unloadingTime ?? 0;
      if (manufactureInfo.unloadingTime !== null && manufactureInfo.unloadingTime !== undefined) {
        unloadingTime = this.shareService.checkDirtyProperty('unloadingTime', fieldColorsList) ? (manufacturingObj?.unloadingTime ?? unloadingTime) : unloadingTime;
      }
      manufactureInfo.unloadingTime = this.shareService.isValidNumber(unloadingTime);
    }

    // Cycle time per part (s)
    if (manufactureInfo.iscycleTimeDirty === true && manufactureInfo.cycleTime !== null && manufactureInfo.cycleTime !== undefined) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(
        (Number(manufactureInfo.loadingTime) + Number(manufactureInfo.unloadingTime) + Number(manufactureInfo.processTime)) / manufactureInfo.noOfStartsPierce
      );
      if (manufactureInfo.cycleTime !== null && manufactureInfo.cycleTime !== undefined) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? (manufacturingObj?.cycleTime ?? cycleTime) : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    // Total machine hour rate
    if (manufactureInfo.isTotalTimeDirty === true && manufactureInfo.totalTime !== null && manufactureInfo.totalTime !== undefined) {
      manufactureInfo.totalTime = Number(manufactureInfo.totalTime);
    } else {
      let totalTime = this.shareService.isValidNumber((Number(manufactureInfo.cycleTime) * Number(manufactureInfo.lotSize)) / 3600);
      if (manufactureInfo.totalTime !== null && manufactureInfo.totalTime !== undefined) {
        totalTime = this.shareService.checkDirtyProperty('totalTime', fieldColorsList) ? (manufacturingObj?.cycleTime ?? totalTime) : totalTime;
      }
      manufactureInfo.totalTime = totalTime;
    }

    // Cost drivers (shared logic)
    this.calculateCostDriver(manufactureInfo, fieldColorsList, manufacturingObj);

    if (Number(manufactureInfo?.processTypeID) === ProcessType.Testing) {
      manufactureInfo.directProcessCost = this.shareService.isValidNumber(manufactureInfo?.directProcessCost * manufactureInfo?.samplingRate);
    }

    return manufactureInfo;
  }

  calculateCostDriver(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto) {
    if (manufactureInfo.isefficiencyDirty === true && manufactureInfo.efficiency !== null && manufactureInfo.efficiency !== undefined) {
      manufactureInfo.efficiency = Number(manufactureInfo.efficiency);
    } else {
      let efficiency = 0.85;
      if (manufactureInfo.efficiency !== null && manufactureInfo.efficiency !== undefined) {
        efficiency = this.shareService.checkDirtyProperty('efficiency', fieldColorsList) ? (manufacturingObj?.efficiency ?? efficiency) : efficiency;
      }
      manufactureInfo.efficiency = efficiency;
    }

    if (manufactureInfo.isNoOfLowSkilledLaboursDirty === true && manufactureInfo.noOfLowSkilledLabours !== null && manufactureInfo.noOfLowSkilledLabours !== undefined) {
      manufactureInfo.noOfLowSkilledLabours = Number(manufactureInfo.noOfLowSkilledLabours);
    } else {
      manufactureInfo.noOfLowSkilledLabours = this.shareService.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList)
        ? manufacturingObj?.noOfLowSkilledLabours
        : this.shareService.isValidNumber(manufactureInfo.noOfLowSkilledLabours);
    }

    if (manufactureInfo.isLowSkilledLaborRatePerHourDirty === true && manufactureInfo.lowSkilledLaborRatePerHour !== null && manufactureInfo.lowSkilledLaborRatePerHour !== undefined) {
      manufactureInfo.lowSkilledLaborRatePerHour = Number(manufactureInfo.lowSkilledLaborRatePerHour);
    } else {
      manufactureInfo.lowSkilledLaborRatePerHour = this.shareService.checkDirtyProperty('lowSkilledLaborRatePerHour', fieldColorsList)
        ? manufacturingObj?.lowSkilledLaborRatePerHour
        : this.shareService.isValidNumber(manufactureInfo.lowSkilledLaborRatePerHour);
    }

    if (manufactureInfo.isSkilledLaborRatePerHourDirty === true && manufactureInfo.noOfSkilledLabours !== null && manufactureInfo.noOfSkilledLabours !== undefined) {
      manufactureInfo.noOfSkilledLabours = Number(manufactureInfo.noOfSkilledLabours);
    } else {
      if (manufactureInfo.noOfSkilledLabours !== null && manufactureInfo.noOfSkilledLabours !== undefined) {
        manufactureInfo.noOfSkilledLabours = this.shareService.checkDirtyProperty('noOfSkilledLabours', fieldColorsList)
          ? (manufacturingObj?.noOfSkilledLabours ?? manufactureInfo.noOfSkilledLabours)
          : manufactureInfo.noOfSkilledLabours;
      }
    }

    if (manufactureInfo.isSkilledLaborRatePerHourDirty === true && manufactureInfo.skilledLaborRatePerHour !== null && manufactureInfo.skilledLaborRatePerHour !== undefined) {
      manufactureInfo.skilledLaborRatePerHour = Number(manufactureInfo.skilledLaborRatePerHour);
    } else {
      manufactureInfo.skilledLaborRatePerHour = this.shareService.checkDirtyProperty('skilledLaborRatePerHour', fieldColorsList)
        ? manufacturingObj?.skilledLaborRatePerHour
        : this.shareService.isValidNumber(manufactureInfo.skilledLaborRatePerHour);
    }

    if (manufactureInfo.isQaInspectorRateDirty === true && manufactureInfo.qaOfInspectorRate !== null && manufactureInfo.qaOfInspectorRate !== undefined) {
      manufactureInfo.qaOfInspectorRate = Number(manufactureInfo.qaOfInspectorRate);
    } else {
      manufactureInfo.qaOfInspectorRate = this.shareService.checkDirtyProperty('qaOfInspectorRate', fieldColorsList)
        ? manufacturingObj?.qaOfInspectorRate
        : this.shareService.isValidNumber(manufactureInfo.qaOfInspectorRate);
    }

    if (manufactureInfo.isSamplingRateDirty === true && manufactureInfo.samplingRate !== null && manufactureInfo.samplingRate !== undefined) {
      manufactureInfo.samplingRate = Number(manufactureInfo.samplingRate);
    } else {
      const samplingrate = 100;
      manufactureInfo.samplingRate = this.shareService.checkDirtyProperty('samplingRate', fieldColorsList)
        ? manufacturingObj?.samplingRate
        : (manufacturingObj?.samplingRate ?? this.shareService.isValidNumber(samplingrate));
    }

    if (manufactureInfo.isinspectionTimeDirty === true && manufactureInfo.inspectionTime !== null && manufactureInfo.inspectionTime !== undefined) {
      manufactureInfo.inspectionTime = Number(manufactureInfo.inspectionTime);
    } else {
      manufactureInfo.inspectionTime = this.shareService.checkDirtyProperty('inspectionTime', fieldColorsList) ? manufacturingObj?.inspectionTime : manufactureInfo.inspectionTime;
    }

    if (manufactureInfo.ismachineHourRateDirty === true && manufactureInfo.machineHourRate !== null && manufactureInfo.machineHourRate !== undefined) {
      manufactureInfo.machineHourRate = Number(manufactureInfo.machineHourRate);
    } else {
      if (manufactureInfo.machineHourRate !== null && manufactureInfo.machineHourRate !== undefined) {
        manufactureInfo.machineHourRate = this.shareService.checkDirtyProperty('machineHourRate', fieldColorsList) ? manufacturingObj?.machineHourRate : manufactureInfo.machineHourRate;
      }
    }

    if (manufactureInfo.isdirectMachineCostDirty === true && manufactureInfo.directMachineCost !== null && manufactureInfo.directMachineCost !== undefined) {
      manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
    } else {
      let directMachineCost = this.shareService.isValidNumber(((Number(manufactureInfo.cycleTime) * Number(manufactureInfo.machineHourRate)) / 3600) * manufactureInfo.efficiency);
      if (manufactureInfo.directMachineCost !== null && manufactureInfo.directMachineCost !== undefined) {
        directMachineCost = this.shareService.checkDirtyProperty('directMachineCost', fieldColorsList) ? (manufacturingObj?.directMachineCost ?? directMachineCost) : directMachineCost;
      }
      manufactureInfo.directMachineCost = directMachineCost;
    }

    if (manufactureInfo.isdirectSetUpCostDirty === true && manufactureInfo.directSetUpCost !== null && manufactureInfo.directSetUpCost !== undefined) {
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

      if (manufactureInfo.directSetUpCost !== null && manufactureInfo.directSetUpCost !== undefined) {
        directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList) ? (manufacturingObj?.directSetUpCost ?? directSetUpCost) : directSetUpCost;
      }
      manufactureInfo.directSetUpCost = directSetUpCost;
    }

    if (manufactureInfo.isdirectLaborCostDirty === true && manufactureInfo.directLaborCost !== null && manufactureInfo.directLaborCost !== undefined) {
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

      if (manufactureInfo.directLaborCost !== null && manufactureInfo.directLaborCost !== undefined) {
        directLaborCost = this.shareService.checkDirtyProperty('directLaborCost', fieldColorsList) ? (manufacturingObj?.directLaborCost ?? directLaborCost) : directLaborCost;
      }
      manufactureInfo.directLaborCost = directLaborCost;
    }

    if (manufactureInfo.isinspectionCostDirty === true && manufactureInfo.inspectionCost !== null && manufactureInfo.inspectionCost !== undefined) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      const inspectionCost = ((manufactureInfo.qaOfInspectorRate * manufactureInfo.inspectionTime) / 60 / manufactureInfo.lotSize) * manufactureInfo.efficiency;
      if (manufactureInfo.inspectionCost !== null && manufactureInfo.inspectionCost !== undefined) {
        manufactureInfo.inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList)
          ? (manufacturingObj?.inspectionCost ?? manufactureInfo.inspectionCost)
          : manufactureInfo.inspectionCost;
      }
      manufactureInfo.inspectionCost = inspectionCost;
    }

    if (manufactureInfo.isyieldCostDirty === true && manufactureInfo.yieldCost !== null && manufactureInfo.yieldCost !== undefined) {
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

      if (manufactureInfo.yieldCost !== null && manufactureInfo.yieldCost !== undefined) {
        yieldCost = this.shareService.checkDirtyProperty('yieldCost', fieldColorsList) ? (manufacturingObj?.yieldCost ?? yieldCost) : yieldCost;
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
  }

  calCulateDiameterPartWeight(diameter: number, height: number): number {
    if (!diameter || !height) {
      return 0;
    }
    const twoDimentions = this.materialForgingConfigService.getForgingDiameterPart();
    let heightIndex = 0;
    let diameterIndex = 0;
    for (let i = 0; i < 13; i++) {
      if (twoDimentions[i][0] >= diameter && diameterIndex == 0) {
        diameterIndex = i;
      }

      for (let j = 0; j < 12; j++) {
        if (twoDimentions[i][j] >= height && heightIndex == 0) {
          heightIndex = j;
          break;
        }
      }
    }
    return twoDimentions[diameterIndex][heightIndex];
  }
}
