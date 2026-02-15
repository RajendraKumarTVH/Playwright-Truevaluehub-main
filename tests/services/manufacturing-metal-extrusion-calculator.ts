
import { SharedService } from './shared';
import { ProcessInfoDto } from 'src/app/shared/models';
import { ProcessType } from '../costing.config';


export class ManufacturingMetalExtrusionCalculatorService {
  constructor(private shareService: SharedService) { }

  public doCostCalculationsForMetalTubeExtrusion(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    const grossWeight = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.grossWeight : 0;
    const inputBilletDiameter = manufactureInfo.materialInfoList?.length > 0 ? Number(manufactureInfo.materialInfoList[0]?.inputBilletDiameter) : 0;
    const ultimateTensileStrength = manufactureInfo.materialInfoList?.length > 0 ? Number(manufactureInfo.materialInfoList[0]?.ultimateTensileStrength) : 0;
    const envelopeLength = manufactureInfo.materialInfoList?.length > 0 ? Number(manufactureInfo.materialInfoList[0]?.dimX) : 0;
    const envelopeWidth = manufactureInfo.materialInfoList?.length > 0 ? Number(manufactureInfo.materialInfoList[0]?.dimY) : 0;

    let cuttingSpeed = 0;
    let unloadingTime = 10;
    let processTime = 0;
    const processTypeID = Number(manufactureInfo.processTypeID);
    if (processTypeID === ProcessType.BandSaw) {
      cuttingSpeed = 125;
      unloadingTime = 4;
    } else if (processTypeID === ProcessType.InductionHeatingMachine) {
      cuttingSpeed = 1500;
      unloadingTime = 4;
    } else if (processTypeID === ProcessType.MetalTubeExtrusion) {
      cuttingSpeed = 1500;
      unloadingTime = 4;
    } else if (processTypeID === ProcessType.RollingStraightening) {
      cuttingSpeed = 120;
      unloadingTime = 4;
    } else if (processTypeID === ProcessType.EddyCurrentTesting) {
      cuttingSpeed = 250;
      unloadingTime = 4;
    } else if (processTypeID === ProcessType.BrightAnnealing) {
      cuttingSpeed = 30;
      unloadingTime = 4;
    } else if (processTypeID === ProcessType.VisualInspection) {
      cuttingSpeed = 0.05;
      processTime = 120;
      manufactureInfo.noOfSkilledLabours = 1;
    }

    this.preCalculation(manufactureInfo, fieldColorsList, manufacturingObj, {
      unloadingTime,
      processTypeID,
      cuttingSpeed,
      inputBilletDiameter,
      ultimateTensileStrength,
      envelopeWidth,
      efficiency: 85,
    });

    const efficiency = Number(manufactureInfo.efficiency) / 100;

    if (manufactureInfo.isProcessTimeDirty && !!manufactureInfo.processTime) {
      manufactureInfo.processTime = Number(manufactureInfo.processTime);
    } else {
      if (processTypeID === ProcessType.BandSaw) {
        processTime = this.shareService.isValidNumber((3.14 * (Math.pow(inputBilletDiameter, 2) / 4 / 100)) / (Number(manufactureInfo.cuttingSpeed) / 60));
      } else if (processTypeID === ProcessType.InductionHeatingMachine || processTypeID === ProcessType.MetalTubeExtrusion) {
        processTime = this.shareService.isValidNumber(grossWeight / 1000 / ((Number(manufactureInfo.cuttingSpeed) * efficiency) / 3600));
      } else if ([ProcessType.RollingStraightening, ProcessType.EddyCurrentTesting, ProcessType.BrightAnnealing].includes(processTypeID)) {
        processTime = this.shareService.isValidNumber(envelopeLength / 1000 / ((Number(manufactureInfo.cuttingSpeed) * efficiency) / 60));
      }
      if (manufactureInfo?.processTime) {
        processTime = this.shareService.checkDirtyProperty('processTime', fieldColorsList) ? manufacturingObj?.processTime : processTime;
      }
      manufactureInfo.processTime = processTime;
    }

    if (manufactureInfo.iscycleTimeDirty && !!manufactureInfo.cycleTime) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime =
        processTypeID === ProcessType.VisualInspection
          ? this.shareService.isValidNumber(Number(manufactureInfo.processTime) * Number(manufactureInfo.cuttingSpeed))
          : this.shareService.isValidNumber(Number(manufactureInfo.processTime) + Number(manufactureInfo.unloadingTime));
      if (manufactureInfo.cycleTime) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    this.commonCalculation(manufactureInfo, fieldColorsList, manufacturingObj, { efficiency, caller: 'MetalTubeExtrusion' });
    return manufactureInfo;
  }

  public doCostCalculationsForMetalExtrusion(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    const partProjectArea = manufactureInfo.materialInfoList?.length > 0 ? Number(manufactureInfo.materialInfoList[0]?.partProjectedArea) : 0;
    const grossWeight = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.grossWeight : 0;
    const inputBilletDiameter = manufactureInfo.materialInfoList?.length > 0 ? Number(manufactureInfo.materialInfoList[0]?.inputBilletDiameter) : 0;
    const ultimateTensileStrength = manufactureInfo.materialInfoList?.length > 0 ? Number(manufactureInfo.materialInfoList[0]?.ultimateTensileStrength) : 0;
    // const envelopeLength = manufactureInfo.materialInfoList?.length > 0 ? Number(manufactureInfo.materialInfoList[0]?.dimX) : 0;
    const envelopeWidth = manufactureInfo.materialInfoList?.length > 0 ? Number(manufactureInfo.materialInfoList[0]?.dimY) : 0;

    let cuttingSpeed = 0;
    let processTime = 0;
    const unloadingTime = 4;
    const processTypeID = Number(manufactureInfo.processTypeID);
    if (processTypeID === ProcessType.IngotBandSawCutting || processTypeID === ProcessType.CutToLength) {
      cuttingSpeed = 85;
    } else if (processTypeID === ProcessType.StockHeating || processTypeID === ProcessType.MetalExtrusion) {
      cuttingSpeed = 1500;
    }

    this.preCalculation(manufactureInfo, fieldColorsList, manufacturingObj, {
      unloadingTime,
      processTypeID,
      cuttingSpeed,
      inputBilletDiameter,
      ultimateTensileStrength,
      envelopeWidth,
      efficiency: 85,
    });

    const efficiency = Number(manufactureInfo.efficiency) / 100;

    if (manufactureInfo.isProcessTimeDirty && !!manufactureInfo.processTime) {
      manufactureInfo.processTime = Number(manufactureInfo.processTime);
    } else {
      if (processTypeID === ProcessType.IngotBandSawCutting) {
        processTime = this.shareService.isValidNumber((3.14 * (Math.pow(inputBilletDiameter, 2) / 4 / 100)) / (Number(manufactureInfo.cuttingSpeed) / 60));
      } else if (processTypeID === ProcessType.StockHeating || processTypeID === ProcessType.MetalExtrusion) {
        processTime = this.shareService.isValidNumber(grossWeight / 1000 / ((Number(manufactureInfo.cuttingSpeed) * efficiency) / 3600));
      } else if (processTypeID === ProcessType.CutToLength) {
        processTime = this.shareService.isValidNumber((partProjectArea / 100 / Number(manufactureInfo.cuttingSpeed)) * 60);
      }
      if (manufactureInfo?.processTime) {
        processTime = this.shareService.checkDirtyProperty('processTime', fieldColorsList) ? manufacturingObj?.processTime : processTime;
      }
      manufactureInfo.processTime = processTime;
    }

    if (manufactureInfo.iscycleTimeDirty && !!manufactureInfo.cycleTime) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(Number(manufactureInfo.processTime) + Number(manufactureInfo.unloadingTime));
      if (manufactureInfo.cycleTime) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    this.commonCalculation(manufactureInfo, fieldColorsList, manufacturingObj, { efficiency, caller: 'MetalExtrusion' });
    return manufactureInfo;
  }

  preCalculation(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto, vals?: any) {
    if (manufactureInfo.isUnloadingTimeDirty && !!manufactureInfo.unloadingTime) {
      manufactureInfo.unloadingTime = Number(manufactureInfo.unloadingTime);
    } else {
      let unloadingTime = vals.unloadingTime;
      if (manufactureInfo?.unloadingTime) {
        unloadingTime = this.shareService.checkDirtyProperty('unloadingTime', fieldColorsList) ? manufacturingObj?.unloadingTime : unloadingTime;
      }
      manufactureInfo.unloadingTime = unloadingTime;
    }

    if (manufactureInfo.isefficiencyDirty && !!manufactureInfo.efficiency) {
      manufactureInfo.efficiency = Number(manufactureInfo.efficiency);
    } else {
      let efficiency = Number(manufactureInfo.efficiency) || vals.efficiency;
      if (manufactureInfo?.efficiency) {
        efficiency = this.shareService.checkDirtyProperty('efficiency', fieldColorsList) ? manufacturingObj?.efficiency : efficiency;
      }
      manufactureInfo.efficiency = efficiency;
    }
    manufactureInfo.efficiency <= 1 && (manufactureInfo.efficiency = manufactureInfo.efficiency * 100);
    !manufactureInfo.efficiency && (manufactureInfo.efficiency = vals.efficiency);

    if (manufactureInfo.isTheoreticalForceDirty && !!manufactureInfo.theoreticalForce) {
      manufactureInfo.theoreticalForce = Number(manufactureInfo.theoreticalForce);
    } else {
      let theoreticalForce = 0;
      if ([ProcessType.MetalTubeExtrusion, ProcessType.MetalExtrusion].includes(vals.processTypeID)) {
        theoreticalForce = this.shareService.isValidNumber(
          ((((3.14 * Math.pow(vals.inputBilletDiameter, 2)) / 4) * vals.ultimateTensileStrength * Math.log(Math.pow(vals.inputBilletDiameter, 2) / Math.pow(vals.envelopeWidth, 2))) /
            Math.pow(10, 6)) *
          100
        );
      }
      if (manufactureInfo?.theoreticalForce) {
        theoreticalForce = this.shareService.checkDirtyProperty('theoreticalForce', fieldColorsList) ? manufacturingObj?.theoreticalForce : theoreticalForce;
      }
      manufactureInfo.theoreticalForce = theoreticalForce;
    }

    if (manufactureInfo.iscuttingSpeedDirty && !!manufactureInfo.cuttingSpeed) {
      manufactureInfo.cuttingSpeed = Number(manufactureInfo.cuttingSpeed);
    } else {
      let cuttingSpeed = vals.cuttingSpeed;
      if (manufactureInfo?.cuttingSpeed) {
        cuttingSpeed = this.shareService.checkDirtyProperty('cuttingSpeed', fieldColorsList) ? manufacturingObj?.cuttingSpeed : cuttingSpeed;
      }
      manufactureInfo.cuttingSpeed = cuttingSpeed;
    }
  }

  commonCalculation(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto, vals?: any) {
    //Direct labors
    if (manufactureInfo.isNoOfLowSkilledLaboursDirty && !!manufactureInfo.noOfLowSkilledLabours) {
      manufactureInfo.noOfLowSkilledLabours = Number(manufactureInfo.noOfLowSkilledLabours);
    } else {
      manufactureInfo.noOfLowSkilledLabours = this.shareService.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList)
        ? manufacturingObj?.noOfLowSkilledLabours
        : manufactureInfo.noOfLowSkilledLabours;
    }

    if (vals.caller === 'MetalExtrusion') {
      // BLOCK TO BE REMOVED AFTER GETTING THE MACHINE db
      //no qa inspector
      !manufactureInfo.qaOfInspector && (manufactureInfo.qaOfInspector = 1);

      //Skilled Labors
      !manufactureInfo.noOfSkilledLabours && (manufactureInfo.noOfSkilledLabours = 1);
    }

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
      let directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) * Number(manufactureInfo.cycleTime)) / 3600 / vals.efficiency);
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
        vals.efficiency /
        Number(manufactureInfo.lotSize) +
        (((Number(manufactureInfo.noOfSkilledLabours) * Number(manufactureInfo.skilledLaborRatePerHour)) / 60) * Number(manufactureInfo.setUpTime)) / vals.efficiency / Number(manufactureInfo.lotSize);
      if (manufactureInfo.directSetUpCost) {
        directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.setUpCost : directSetUpCost;
      }
      manufactureInfo.directSetUpCost = directSetUpCost;
    }

    if (manufactureInfo.isdirectLaborCostDirty && !!manufactureInfo.directLaborCost) {
      manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
    } else {
      let directLaborCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.noOfLowSkilledLabours) * Number(manufactureInfo.lowSkilledLaborRatePerHour) * Number(manufactureInfo.cycleTime)) / 3600 / vals.efficiency +
        (Number(manufactureInfo.noOfSkilledLabours) * Number(manufactureInfo.skilledLaborRatePerHour) * Number(manufactureInfo.cycleTime)) / 3600 / vals.efficiency
      );
      if (manufactureInfo.directLaborCost) {
        directLaborCost = this.shareService.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : directLaborCost;
      }
      manufactureInfo.directLaborCost = directLaborCost;
    }

    if (manufactureInfo.isinspectionCostDirty && !!manufactureInfo.inspectionCost) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      let inspectionCost = this.shareService.isValidNumber((manufactureInfo.inspectionTime * Number(manufactureInfo.qaOfInspectorRate)) / 60 / vals.efficiency / Number(manufactureInfo.lotSize));
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
    //manufactureInfo = this._commonService.calculateESGCosts(manufactureInfo, fieldColorsList, manufacturingObj);
  }
}
