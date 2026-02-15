import { ProcessInfoDto } from 'src/app/shared/models';
import { SharedService } from './shared';
import { PrimaryProcessType, ProcessType } from '../costing.config';

export class ManufacturingPlasticTubeExtrusionCalculatorService {
  constructor(private shareService: SharedService) { }
  public doCostCalculationsForPlasticTubeExtrusion(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    const materialInfo = manufactureInfo.materialInfoList.find((x) => x.processId === PrimaryProcessType.PlasticTubeExtrusion);

    if (manufactureInfo.iscuttingSpeedDirty && !!manufactureInfo.cuttingSpeed) {
      // Maximum Output Rate of Machine
      manufactureInfo.cuttingSpeed = Number(manufactureInfo.cuttingSpeed);
    } else {
      let cuttingSpeed = manufactureInfo?.machineMaster?.machineOutputKgPerHr || 0; // manufactureInfo.processTypeID === ProcessType.PlasticTubeExtrusion ? 250 : manufactureInfo.drillDiameter;
      if (manufactureInfo?.cuttingSpeed) {
        cuttingSpeed = this.shareService.checkDirtyProperty('cuttingSpeed', fieldColorsList) ? manufacturingObj?.cuttingSpeed : cuttingSpeed;
      }
      manufactureInfo.cuttingSpeed = cuttingSpeed;
    }

    if (manufactureInfo.isefficiencyDirty && !!manufactureInfo.efficiency) {
      manufactureInfo.efficiency = Number(manufactureInfo.efficiency);
    } else {
      let efficiency = Number(manufactureInfo.efficiency);
      if (manufactureInfo?.efficiency) {
        efficiency = this.shareService.checkDirtyProperty('efficiency', fieldColorsList) ? manufacturingObj?.efficiency : efficiency;
      }
      manufactureInfo.efficiency = efficiency;
    }
    manufactureInfo.efficiency <= 1 && (manufactureInfo.efficiency = manufactureInfo.efficiency * 100);
    const efficiency = Number(manufactureInfo.efficiency) / 100;

    if (manufactureInfo.isbourdanRateDirty && manufactureInfo.bourdanRate != null) {
      // Machine Output Rate
      manufactureInfo.bourdanRate = Number(manufactureInfo.bourdanRate);
    } else {
      let bourdanRate = Number(manufactureInfo.cuttingSpeed) * efficiency;
      if (manufactureInfo.bourdanRate) {
        bourdanRate = this.shareService.checkDirtyProperty('bourdanRate', fieldColorsList) ? manufacturingObj?.bourdanRate : bourdanRate;
      }
      manufactureInfo.bourdanRate = bourdanRate;
    }

    if (Number(manufactureInfo.processTypeID) === ProcessType.PlasticTubeExtrusion) {
      if (manufactureInfo.isnoOfPartsDirty && manufactureInfo.noOfParts != null) {
        // No. of Parts processed
        manufactureInfo.noOfParts = Number(manufactureInfo.noOfParts);
      } else {
        let noOfParts = Math.floor((Number(manufactureInfo.bourdanRate) * 1000) / Number(materialInfo.grossWeight));
        if (manufactureInfo.noOfParts) {
          noOfParts = this.shareService.checkDirtyProperty('noOfParts', fieldColorsList) ? manufacturingObj?.noOfParts : noOfParts;
        }
        manufactureInfo.noOfParts = noOfParts;
      }
    }

    if (manufactureInfo.isProcessTimeDirty && !!manufactureInfo.processTime) {
      // Time for Extrusion
      manufactureInfo.processTime = Number(manufactureInfo.processTime);
    } else {
      let processTime =
        Number(manufactureInfo.processTypeID) === ProcessType.PlasticTubeExtrusion
          ? 3600 / Number(manufactureInfo.noOfParts)
          : Number(materialInfo.grossWeight) / ((Number(manufactureInfo.bourdanRate) * 1000) / 3600);
      // Number(materialInfo.dimX) / 1000 * (60 / Number(manufactureInfo.bourdanRate));
      if (manufactureInfo?.processTime) {
        processTime = this.shareService.checkDirtyProperty('processTime', fieldColorsList) ? manufacturingObj?.processTime : processTime;
      }
      manufactureInfo.processTime = this.shareService.isValidNumber(processTime);
    }

    if (Number(manufactureInfo.processTypeID) === ProcessType.PlasticConvolutedTubeExtrusion) {
      if (manufactureInfo.isinjectionRateDirty && !!manufactureInfo.injectionRate) {
        // Operation Rate
        manufactureInfo.injectionRate = Number(manufactureInfo.injectionRate);
      } else {
        let injectionRate = Number(materialInfo.dimX) / Number(manufactureInfo.processTime) / 16.67;
        if (manufactureInfo?.injectionRate) {
          injectionRate = this.shareService.checkDirtyProperty('injectionRate', fieldColorsList) ? manufacturingObj?.injectionRate : injectionRate;
        }
        manufactureInfo.injectionRate = this.shareService.isValidNumber(injectionRate);
      }
    }

    if (Number(manufactureInfo.processTypeID) === ProcessType.PlasticTubeExtrusion) {
      if (manufactureInfo.isCuttingTimeDirty && !!manufactureInfo.cuttingTime) {
        // Part Cut off Time
        manufactureInfo.cuttingTime = Number(manufactureInfo.cuttingTime);
      } else {
        let cuttingTime = 2;
        if (manufactureInfo.cuttingTime) {
          cuttingTime = this.shareService.checkDirtyProperty('cuttingTime', fieldColorsList) ? manufacturingObj?.cuttingTime : cuttingTime;
        }
        manufactureInfo.cuttingTime = cuttingTime;
      }
    }

    if (manufactureInfo.iscycleTimeDirty && !!manufactureInfo.cycleTime) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime =
        Number(manufactureInfo.processTypeID) === ProcessType.PlasticTubeExtrusion ? Number(manufactureInfo.processTime) + Number(manufactureInfo.cuttingTime) : Number(manufactureInfo.processTime);
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

    //Direct labors
    if (manufactureInfo.isNoOfLowSkilledLaboursDirty && !!manufactureInfo.noOfLowSkilledLabours) {
      manufactureInfo.noOfLowSkilledLabours = Number(manufactureInfo.noOfLowSkilledLabours);
    } else {
      let noOfLowSkilledLabours =
        Number(manufactureInfo.processTypeID) === ProcessType.PlasticConvolutedTubeExtrusion
          ? Number(manufactureInfo.semiAutoOrAuto) === 1
            ? 0.33
            : Number(manufactureInfo.semiAutoOrAuto) === 2
              ? 0.5
              : 1
          : manufactureInfo.noOfLowSkilledLabours;
      if (manufactureInfo.noOfLowSkilledLabours) {
        noOfLowSkilledLabours = this.shareService.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList) ? manufacturingObj?.noOfLowSkilledLabours : noOfLowSkilledLabours;
      }
      manufactureInfo.noOfLowSkilledLabours = noOfLowSkilledLabours;
    }

    //no qa inspector
    // !manufactureInfo.qaOfInspector && (manufactureInfo.qaOfInspector = 1);

    // //Skilled Labors
    // !manufactureInfo.noOfSkilledLabours && (manufactureInfo.noOfSkilledLabours = 1);
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
      manufactureInfo.machineHourRate = this.shareService.checkDirtyProperty('machineHourRate', fieldColorsList) ? manufacturingObj?.machineHourRate : manufactureInfo.machineHourRate;
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
    if (manufactureInfo.isdirectSetUpCostDirty && !!manufactureInfo.directSetUpCost) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      let directSetUpCost =
        (((Number(manufactureInfo.noOfLowSkilledLabours) * Number(manufactureInfo.setUpTime)) / 60) * Number(manufactureInfo.lowSkilledLaborRatePerHour)) /
        efficiency /
        Number(manufactureInfo.lotSize) +
        (((Number(manufactureInfo.noOfSkilledLabours) * Number(manufactureInfo.skilledLaborRatePerHour)) / 60) * Number(manufactureInfo.setUpTime)) / efficiency / Number(manufactureInfo.lotSize);
      if (manufactureInfo.directSetUpCost) {
        directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.setUpCost : directSetUpCost;
      }
      manufactureInfo.directSetUpCost = directSetUpCost;
    }
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
    if (manufactureInfo.isinspectionCostDirty && !!manufactureInfo.inspectionCost) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      let inspectionCost = this.shareService.isValidNumber(
        ((manufactureInfo.inspectionTime / 60) * Number(manufactureInfo.qaOfInspector) * Number(manufactureInfo.qaOfInspectorRate)) / efficiency / Number(manufactureInfo.lotSize)
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
