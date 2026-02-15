import { Injectable } from '@angular/core';
import { ProcessInfoDto } from 'src/app/shared/models';
import { SharedService } from './shared.service';
import { ProcessType } from '../costing.config';
import { ManufacturingConfigService } from 'src/app/shared/config/cost-manufacturing-config';
import { PlatingConfigService } from 'src/app/shared/config/plating-config.service';

@Injectable({
  providedIn: 'root',
})
export class ManufacturingPlatingCalculatorService {
  constructor(
    private shareService: SharedService,
    private platingConfigService: PlatingConfigService,
    private manufacturingConfigService: ManufacturingConfigService
  ) {}

  private generalFieldAssignments(manufactureInfo, fieldColorsList, manufacturingObj) {
    if (manufactureInfo.isLowSkilledLaborRatePerHourDirty && !!manufactureInfo.lowSkilledLaborRatePerHour) {
      manufactureInfo.lowSkilledLaborRatePerHour = Number(manufactureInfo.lowSkilledLaborRatePerHour);
    } else {
      manufactureInfo.lowSkilledLaborRatePerHour = this.shareService.checkDirtyProperty('lowSkilledLaborRatePerHour', fieldColorsList)
        ? manufacturingObj?.lowSkilledLaborRatePerHour
        : this.shareService.isValidNumber(manufactureInfo.lowSkilledLaborRatePerHour);
    }

    if (manufactureInfo.isSkilledLaborRatePerHourDirty && !!manufactureInfo.skilledLaborRatePerHour) {
      manufactureInfo.skilledLaborRatePerHour = Number(manufactureInfo.skilledLaborRatePerHour);
    } else {
      manufactureInfo.skilledLaborRatePerHour = this.shareService.checkDirtyProperty('skilledLaborRatePerHour', fieldColorsList)
        ? manufacturingObj?.skilledLaborRatePerHour
        : this.shareService.isValidNumber(manufactureInfo.skilledLaborRatePerHour);
    }

    if (manufactureInfo.isQaInspectorRateDirty && !!manufactureInfo.qaOfInspectorRate) {
      manufactureInfo.qaOfInspectorRate = Number(manufactureInfo.qaOfInspectorRate);
    } else {
      manufactureInfo.qaOfInspectorRate = this.shareService.checkDirtyProperty('qaOfInspectorRate', fieldColorsList)
        ? manufacturingObj?.qaOfInspectorRate
        : this.shareService.isValidNumber(manufactureInfo.qaOfInspectorRate);
    }
    return manufactureInfo;
  }

  public calculationsForPlating(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    // --- Main logic ---
    const pType = Number(manufactureInfo.processTypeID);
    if (pType === ProcessType.Galvanization) manufactureInfo.subProcessTypeID = 11;
    const subProcessTypeID = Number(manufactureInfo.subProcessTypeID);
    const defaults = this.platingConfigService.getProcessDefaults(pType, subProcessTypeID);

    manufactureInfo.qaOfInspector = defaults.qa;
    manufactureInfo.noOfSkilledLabours = defaults.skilledLabours || 1;

    const materialInfoList = Array.isArray(manufactureInfo.materialInfoList) ? manufactureInfo.materialInfoList : [];
    const matPlating = materialInfoList.find((rec) => rec.processId === defaults.processId) || null;

    manufactureInfo.density = matPlating?.density || 0;
    manufactureInfo.noOfInsert = matPlating?.noOfInserts || 0;
    manufactureInfo.grossWeight = matPlating?.grossWeight || 0;
    manufactureInfo.wallAverageThickness = matPlating?.wallAverageThickness || 0;
    manufactureInfo.noOfCavities = matPlating?.noOfCavities || 0;
    manufactureInfo.netMaterialCost = matPlating?.netMatCost || 0;
    manufactureInfo.netPartWeight = matPlating?.netWeight || 0;
    manufactureInfo.rawmaterialCost = matPlating?.netMatCost || 0;
    manufactureInfo.projArea = matPlating?.runnerProjectedArea || 0;
    manufactureInfo.partProjArea = matPlating?.partProjectedArea || 0;
    const partVolume = matPlating?.dimVolume || 0;
    manufactureInfo.yieldPer = manufactureInfo.yieldPer || 98.5;

    // --- Tank size selection ---
    const product = partVolume * manufactureInfo.lotSize;
    let tankSizes = this.platingConfigService.getPlatingTankSize(product);
    if (pType === ProcessType.SilverPlating || pType === ProcessType.GoldPlating) tankSizes = this.platingConfigService.getSilverOrGoldTankSize(product);

    if (pType === ProcessType.R2RPlating) {
      // --- Length of Terminal Reel ---
      if (manufactureInfo.isCuttingLengthDirty && manufactureInfo.cuttingLength !== null) {
        manufactureInfo.cuttingLength = Number(manufactureInfo.cuttingLength);
      } else {
        let terminalReelLength = 8000; // Default
        if (manufactureInfo.cuttingLength !== null) {
          terminalReelLength = this.shareService.checkDirtyProperty('cuttingLength', fieldColorsList) ? manufacturingObj?.cuttingLength : terminalReelLength;
        }
        manufactureInfo.cuttingLength = terminalReelLength;
      }

      // --- Length of Terminal Pitch ---
      if (manufactureInfo.isBendingLineLengthDirty && manufactureInfo.bendingLineLength !== null) {
        manufactureInfo.bendingLineLength = Number(manufactureInfo.bendingLineLength);
      } else {
        let terminalPitchLength = 25; // Default\
        if (matPlating?.dimUnfoldedY <= 1) terminalPitchLength = 5;
        if (matPlating?.dimUnfoldedY <= 2) terminalPitchLength = 5.5;
        if (matPlating?.dimUnfoldedY <= 3) terminalPitchLength = 6;
        if (matPlating?.dimUnfoldedY <= 4) terminalPitchLength = 6;
        if (matPlating?.dimUnfoldedY <= 5) terminalPitchLength = 6.5;
        if (matPlating?.dimUnfoldedY <= 6) terminalPitchLength = 7;
        if (matPlating?.dimUnfoldedY <= 8) terminalPitchLength = 10;
        if (matPlating?.dimUnfoldedY <= 10) terminalPitchLength = 12;
        if (matPlating?.dimUnfoldedY <= 15) terminalPitchLength = 17;
        if (matPlating?.dimUnfoldedY <= 20) terminalPitchLength = 20;
        if (manufactureInfo.bendingLineLength !== null) {
          terminalPitchLength = this.shareService.checkDirtyProperty('bendingLineLength', fieldColorsList) ? manufacturingObj?.bendingLineLength : terminalPitchLength;
        }
        manufactureInfo.bendingLineLength = terminalPitchLength;
      }

      // no of Terminal in reel
      // const noOfTerminalsInReel = Math.floor(Number(manufactureInfo.lengthOfCable) / Number(manufactureInfo.bendingLineLength));
    }

    // --- Shot size ---
    if (manufactureInfo.isshotSizeDirty && manufactureInfo.shotSize !== null) {
      manufactureInfo.shotSize = Number(manufactureInfo.shotSize);
    } else {
      let tankSize = tankSizes?.id || 0;
      if (manufactureInfo.shotSize !== null) {
        tankSize = this.shareService.checkDirtyProperty('shotSize', fieldColorsList) ? manufacturingObj?.shotSize : tankSize;
      }
      manufactureInfo.shotSize = tankSize;
    }

    // --- Loading type ---
    if (manufactureInfo.isTypeOfOperationDirty && manufactureInfo.typeOfOperationId !== null) {
      manufactureInfo.typeOfOperationId = Number(manufactureInfo.typeOfOperationId);
    } else {
      let loadingType = partVolume > 1000000 ? 2 : 1;
      if (pType === ProcessType.SilverPlating || pType === ProcessType.GoldPlating) loadingType = 2;
      if (manufactureInfo.typeOfOperationId !== null) {
        loadingType = this.shareService.checkDirtyProperty('typeOfOperationId', fieldColorsList) ? manufacturingObj?.typeOfOperationId : loadingType;
      }
      manufactureInfo.typeOfOperationId = loadingType;
    }

    // --- Tank volume calculations ---
    const tankVolume = (tankSizes?.length || 0) * (tankSizes?.width || 0) * (tankSizes?.height || 0);
    const availableTankVolume = tankVolume * 0.7;
    const barrelHangerVolume = availableTankVolume * 0.7;

    // --- Utilisation ---
    if (manufactureInfo.isutilisationDirty && !!manufactureInfo.utilisation) {
      manufactureInfo.utilisation = Number(manufactureInfo.utilisation);
    } else {
      // 1: SIMPLE 2: MEDIUM 3:COMPLEX
      // 1: BARREL 2: HANGER
      const volumeUtilizationMap: Record<number, Record<number, Partial<Record<ProcessType, number>>>> = {
        1: {
          1: {
            [ProcessType.NickelPlating]: 25,
            [ProcessType.ChromePlating]: 32,
            [ProcessType.TinPlating]: 25,
            [ProcessType.ZincPlating]: 25,
            [ProcessType.CopperPlating]: 25,
          },
          2: {
            [ProcessType.NickelPlating]: 23,
            [ProcessType.ChromePlating]: 35,
            [ProcessType.TinPlating]: 23,
            [ProcessType.ZincPlating]: 23,
            [ProcessType.SilverPlating]: 25,
            [ProcessType.GoldPlating]: 35,
            [ProcessType.CopperPlating]: 23,
          },
        },
        2: {
          1: {
            [ProcessType.NickelPlating]: 23,
            [ProcessType.ChromePlating]: 30,
            [ProcessType.TinPlating]: 23,
            [ProcessType.ZincPlating]: 23,
            [ProcessType.CopperPlating]: 23,
          },
          2: {
            [ProcessType.NickelPlating]: 22,
            [ProcessType.ChromePlating]: 32,
            [ProcessType.TinPlating]: 22,
            [ProcessType.ZincPlating]: 22,
            [ProcessType.SilverPlating]: 23,
            [ProcessType.GoldPlating]: 30,
            [ProcessType.CopperPlating]: 22,
          },
        },
        3: {
          1: {
            [ProcessType.NickelPlating]: 21,
            [ProcessType.ChromePlating]: 28,
            [ProcessType.TinPlating]: 21,
            [ProcessType.ZincPlating]: 21,
            [ProcessType.CopperPlating]: 21,
          },
          2: {
            [ProcessType.NickelPlating]: 20,
            [ProcessType.ChromePlating]: 30,
            [ProcessType.TinPlating]: 20,
            [ProcessType.ZincPlating]: 20,
            [ProcessType.SilverPlating]: 20,
            [ProcessType.GoldPlating]: 25,
            [ProcessType.CopperPlating]: 20,
          },
        },
      };
      const complexityKey = Number(manufactureInfo.partComplexity) || 0;
      const operationKey = Number(manufactureInfo.typeOfOperationId) || 0;
      const processKey = Number(pType);
      let volumeUtilizationRatio = volumeUtilizationMap[complexityKey]?.[operationKey]?.[processKey] ?? 0;
      if (pType === ProcessType.Galvanization) {
        volumeUtilizationRatio = defaults.utilisation; // Default manufactureInfo.machineMaster?.platenLengthmm
      }
      manufactureInfo.utilisation = this.shareService.checkDirtyProperty('utilisation', fieldColorsList) ? manufacturingObj?.utilisation : manufactureInfo.utilisation;
      !manufactureInfo.utilisation && (manufactureInfo.utilisation = volumeUtilizationRatio);
    }
    const availableVolume = Math.floor(barrelHangerVolume * (manufactureInfo.utilisation / 100));

    // --- Efficiency ---
    if (manufactureInfo.isefficiencyDirty && !!manufactureInfo.efficiency) {
      manufactureInfo.efficiency = Number(manufactureInfo.efficiency);
    } else {
      manufactureInfo.efficiency = this.shareService.checkDirtyProperty('efficiency', fieldColorsList) ? manufacturingObj?.efficiency : manufactureInfo.efficiency;
      Number(manufactureInfo.efficiency) < 1 && (manufactureInfo.efficiency *= 100);
      !manufactureInfo.efficiency && (manufactureInfo.efficiency = 85);
    }

    // --- machine speed ---
    if (manufactureInfo.isspeedOfConveyerDirty && manufactureInfo.speedOfConveyer !== null) {
      manufactureInfo.speedOfConveyer = Number(manufactureInfo.speedOfConveyer);
    } else {
      let machineSpeed = defaults.machineSpeed;
      if (pType === ProcessType.PowderCoating) {
        machineSpeed = this.platingConfigService.getPowderCoatingMachineSpeed(manufactureInfo.eav, matPlating?.dimX);
      }
      if (manufactureInfo.speedOfConveyer !== null) {
        machineSpeed = this.shareService.checkDirtyProperty('speedOfConveyer', fieldColorsList) ? manufacturingObj?.speedOfConveyer : machineSpeed;
      }
      manufactureInfo.speedOfConveyer = machineSpeed;
    }

    // --- Pre & post treatment time ---
    const prePostTreatmentTime = manufactureInfo.shotSize === 1 ? 13 : manufactureInfo.shotSize === 2 ? 22.25 : 30;

    // --- Rack movement time ---
    if (manufactureInfo.isRotationTimeDirty && !!manufactureInfo.rotationTime) {
      manufactureInfo.rotationTime = Number(manufactureInfo.rotationTime);
    } else {
      let rackMovementTime = manufactureInfo.shotSize === 1 ? 5 : manufactureInfo.shotSize === 2 ? 7 : 10;
      if (pType === ProcessType.R2RPlating) {
        rackMovementTime = this.platingConfigService.getFeedRate(matPlating?.materialMasterData?.materialTypeName || matPlating?.materialDescriptionList[0]?.materialTypeName) || 0;
      }

      if (manufactureInfo.rotationTime !== null) {
        rackMovementTime = this.shareService.checkDirtyProperty('rotationTime', fieldColorsList) ? manufacturingObj?.rotationTime : rackMovementTime;
      }
      manufactureInfo.rotationTime = rackMovementTime;
    }

    // --- Injection time ---
    if (manufactureInfo.isinjectionTimeDirty && !!manufactureInfo.injectionTime) {
      manufactureInfo.injectionTime = Number(manufactureInfo.injectionTime);
    } else {
      const electroPlatingTime = this.shareService.isValidNumber((matPlating?.density * matPlating?.paintCoatingTickness * 60) / (defaults.intensity * defaults.electroStatic * defaults.yield));
      let injectionTime = Number(electroPlatingTime);
      if (pType === ProcessType.Galvanization && !!matPlating) {
        const coatingTime = this.manufacturingConfigService.galvanizationCoatingTime.find((rec) => rec.thickness >= Number(matPlating?.paintCoatingTickness));
        injectionTime = coatingTime ? coatingTime.cleaningPickling + coatingTime.fluxing + coatingTime.dipping + coatingTime.coolingInspection : 0;
      }
      if (manufactureInfo.injectionTime) injectionTime = this.shareService.checkDirtyProperty('injectionTime', fieldColorsList) ? manufacturingObj?.injectionTime : injectionTime;
      manufactureInfo.injectionTime = injectionTime;
      !manufactureInfo.injectionTime && (manufactureInfo.injectionTime = electroPlatingTime);
    }

    // --- Length of cut / total injection time ---
    if (pType === ProcessType.R2RPlating) {
      if (manufactureInfo.isLengthOfCutDirty && !!manufactureInfo.lengthOfCut) {
        manufactureInfo.lengthOfCut = Number(manufactureInfo.lengthOfCut);
      } else {
        let lengthOfCut = Number(manufactureInfo.injectionTime) * Number(manufactureInfo.rotationTime);
        if (manufactureInfo.lengthOfCut) lengthOfCut = this.shareService.checkDirtyProperty('lengthOfCut', fieldColorsList) ? manufacturingObj?.lengthOfCut : lengthOfCut;
        manufactureInfo.lengthOfCut = lengthOfCut;
      }
    } else {
      if (manufactureInfo.istotalInjectionTimeDirty && !!manufactureInfo.totalInjectionTime) {
        manufactureInfo.totalInjectionTime = Number(manufactureInfo.totalInjectionTime);
      } else {
        let totalInjectionTime = this.shareService.isValidNumber(Number(manufactureInfo.injectionTime) + Number(manufactureInfo.rotationTime) + Number(prePostTreatmentTime));
        if (manufactureInfo.totalInjectionTime)
          totalInjectionTime = this.shareService.checkDirtyProperty('totalInjectionTime', fieldColorsList) ? manufacturingObj?.totalInjectionTime : totalInjectionTime;
        manufactureInfo.totalInjectionTime = totalInjectionTime;
      }
    }

    // --- No of parts ---
    if (manufactureInfo.isnoOfPartsDirty && !!manufactureInfo.noOfParts) {
      manufactureInfo.noOfParts = Number(manufactureInfo.noOfParts);
    } else {
      let noOfParts = 0;
      if (pType === ProcessType.Galvanization && !!matPlating) {
        const galvanizationAvailableVolume = Math.floor(defaults.volumeOfBarrel * (manufactureInfo.utilisation / 100));
        noOfParts = Math.floor(galvanizationAvailableVolume / (matPlating?.dimVolume * 1.5));
      } else if ((pType === ProcessType.SiliconCoatingAuto || pType === ProcessType.SiliconCoatingSemi) && !!matPlating) {
        noOfParts = Math.floor(Math.floor(3500 / Number(matPlating?.dimX)) * Math.floor(3500 / Number(matPlating?.dimY)));
      } else if (pType === ProcessType.R2RPlating) {
        noOfParts = Math.floor((Number(manufactureInfo.lengthOfCut) / Number(manufactureInfo.bendingLineLength)) * 1000); // Math.floor(Math.floor((Number(manufactureInfo.lengthOfCut) / Number(manufactureInfo.bendingLineLength)) * 1000));
      } else if (pType === ProcessType.PowderCoating) {
        let availableHangerHeigth = manufactureInfo.eav <= 15000 ? 1600 : manufactureInfo.eav <= 100000 ? 1800 : 2000;

        const part1 = (manufactureInfo.speedOfConveyer * 1000) / (matPlating?.dimX + (matPlating?.dimX > 500 ? 100 : 80));
        const minVal = Math.min(matPlating?.dimY, matPlating?.dimZ);
        const part2 = availableHangerHeigth / (minVal + (minVal > 500 ? 100 : 80));
        const xPartAcc = part1 * part2;

        const part3 = (manufactureInfo.speedOfConveyer * 1000) / (minVal + (minVal > 500 ? 100 : 80));
        const part4 = availableHangerHeigth / (matPlating?.dimX + (matPlating?.dimX > 500 ? 100 : 80));
        const yPartAcc = part3 * part4;

        noOfParts = Math.floor(Math.max(xPartAcc, yPartAcc));
      } else {
        let partVol = partVolume * 1.3;
        if (pType === ProcessType.SilverPlating) partVol = partVolume * 1.2;
        if (pType === ProcessType.GoldPlating) partVol = partVolume * 1.5;
        noOfParts = Math.floor(availableVolume / partVol);
      }
      if (manufactureInfo.noOfParts) noOfParts = this.shareService.checkDirtyProperty('noOfParts', fieldColorsList) ? manufacturingObj?.noOfParts : noOfParts;
      manufactureInfo.noOfParts = noOfParts;
    }

    // --- No of low skilled labours ---
    if (manufactureInfo.isNoOfLowSkilledLaboursDirty && !!manufactureInfo.noOfLowSkilledLabours) {
      manufactureInfo.noOfLowSkilledLabours = Number(manufactureInfo.noOfLowSkilledLabours);
    } else {
      let noOfLowSkilledLabours = this.shareService.isValidNumber(Number(manufactureInfo?.machineMaster?.machineMarketDtos[0]?.noOfLowSkilledLabours || 0) || 4);
      if (manufactureInfo.noOfLowSkilledLabours)
        noOfLowSkilledLabours = this.shareService.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList) ? manufacturingObj?.noOfLowSkilledLabours : noOfLowSkilledLabours;
      manufactureInfo.noOfLowSkilledLabours = noOfLowSkilledLabours;
    }

    if (pType === ProcessType.PowderCoating) {
      if (manufactureInfo.isLoadingTimeDirty && !!manufactureInfo.loadingTime) {
        manufactureInfo.loadingTime = Number(manufactureInfo.loadingTime);
      } else {
        const partWeight = (matPlating?.partVolume * 7.68) / 1000;

        let loadingTime = this.platingConfigService.getPowderCoatingLoadingTime(partWeight);
        if (manufactureInfo.loadingTime) loadingTime = this.shareService.checkDirtyProperty('loadingTime', fieldColorsList) ? manufacturingObj?.loadingTime : loadingTime;
        manufactureInfo.loadingTime = loadingTime;
      }
    }

    // --- Cycle time ---
    if (manufactureInfo.iscycleTimeDirty && !!manufactureInfo.cycleTime) {
      manufactureInfo.cycleTime = this.shareService.isValidNumber(Number(manufactureInfo.cycleTime));
    } else {
      let cycleTime = 0;
      if (pType === ProcessType.Galvanization) {
        cycleTime = this.shareService.isValidNumber((Number(manufactureInfo.injectionTime) * 60) / Number(manufactureInfo.noOfParts));
      } else if (pType === ProcessType.SiliconCoatingAuto || pType === ProcessType.SiliconCoatingSemi) {
        cycleTime =
          Number(manufactureInfo.subProcessTypeID) === 2
            ? this.shareService.isValidNumber(Math.ceil((Number(manufactureInfo.dryCycleTime) * 60) / Number(manufactureInfo.noOfParts)))
            : this.shareService.isValidNumber(Math.ceil(Number(matPlating?.paintArea) / (Number(manufactureInfo.speedOfConveyer) / 60) / 1000000));
      } else if (pType === ProcessType.PowderCoating) {
        cycleTime = this.shareService.isValidNumber((60 / manufactureInfo.noOfParts + manufactureInfo.loadingTime) / 0.8);
      } else if (pType === ProcessType.Painting || pType === ProcessType.WetPainting) {
        cycleTime = this.shareService.isValidNumber(Math.ceil(Number(matPlating?.partSurfaceArea) / (Number(manufactureInfo.speedOfConveyer) / 60) / 1000000));
      } else if (pType === ProcessType.R2RPlating) {
        cycleTime = this.shareService.isValidNumber((Number(manufactureInfo.injectionTime) * 60) / Number(manufactureInfo.noOfParts));
      } else {
        cycleTime = this.shareService.isValidNumber((Number(manufactureInfo.totalInjectionTime) * 60) / Number(manufactureInfo.noOfParts));
      }
      if (manufactureInfo.cycleTime) cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      manufactureInfo.cycleTime = this.shareService.isValidNumber(cycleTime);
    }

    // --- Inspection time ---
    if (manufactureInfo.isinspectionTimeDirty && !!manufactureInfo.inspectionTime) {
      manufactureInfo.inspectionTime = Number(manufactureInfo.inspectionTime);
    } else {
      let inspectionTime = 20;
      if (manufactureInfo.inspectionTime != null) inspectionTime = this.shareService.checkDirtyProperty('inspectionTime', fieldColorsList) ? manufacturingObj?.inspectionTime : inspectionTime;
      manufactureInfo.inspectionTime = inspectionTime;
    }

    // --- Setup time ---
    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime !== null) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      let setUpTime = Number(manufactureInfo.shotSize) === 1 ? 60 : Number(manufactureInfo.shotSize) === 2 ? 90 : pType === ProcessType.SilverPlating || pType === ProcessType.GoldPlating ? 100 : 120;
      if (pType === ProcessType.PowderCoating) {
        setUpTime = manufactureInfo.semiAutoOrAuto === 3 ? 90 : 120;
      }
      if (manufactureInfo.setUpTime !== null) {
        setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : setUpTime;
      }
      manufactureInfo.setUpTime = setUpTime;
    }

    // --- Machine hour rate ---
    if (manufactureInfo.ismachineHourRateDirty && !!manufactureInfo.machineHourRate) {
      manufactureInfo.machineHourRate = Number(manufactureInfo.machineHourRate);
    } else {
      let machineHourRate = this.shareService.isValidNumber(Number(manufactureInfo?.machineMaster?.machineHourRate) || 0);
      if (manufactureInfo.machineHourRate) machineHourRate = this.shareService.checkDirtyProperty('machineHourRate', fieldColorsList) ? manufacturingObj?.machineHourRate : machineHourRate;
      manufactureInfo.machineHourRate = machineHourRate;
    }

    // --- General field assignments ---
    manufactureInfo = this.generalFieldAssignments(manufactureInfo, fieldColorsList, manufacturingObj);

    // --- Direct machine cost ---
    if (manufactureInfo.isdirectMachineCostDirty && !!manufactureInfo.directMachineCost) {
      manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
    } else {
      let directMachineCost = this.shareService.isValidNumber(((Number(manufactureInfo.cycleTime) / 3600) * Number(manufactureInfo.machineHourRate)) / (manufactureInfo.efficiency / 100));
      if (manufactureInfo.directMachineCost) directMachineCost = this.shareService.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : directMachineCost;
      manufactureInfo.directMachineCost = directMachineCost;
    }

    // --- Direct labor cost ---
    if (manufactureInfo.isdirectLaborCostDirty && !!manufactureInfo.directLaborCost) {
      manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
    } else {
      let directLaborCost = this.shareService.isValidNumber(
        (manufactureInfo.cycleTime * Number(manufactureInfo.lowSkilledLaborRatePerHour) * Number(manufactureInfo.noOfLowSkilledLabours)) / 3600 / (manufactureInfo.efficiency / 100) +
          (Number(manufactureInfo.skilledLaborRatePerHour) * Number(manufactureInfo.noOfSkilledLabours) * Number(manufactureInfo.cycleTime)) / 3600 / (manufactureInfo.efficiency / 100)
      );
      if (manufactureInfo.directLaborCost) directLaborCost = this.shareService.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : directLaborCost;
      manufactureInfo.directLaborCost = directLaborCost;
    }

    // --- Direct setup cost ---
    if (manufactureInfo.isdirectSetUpCostDirty && !!manufactureInfo.directSetUpCost) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      let directSetUpCost = 0;
      if (pType === ProcessType.Galvanization) {
        directSetUpCost = this.shareService.isValidNumber(
          (Number(manufactureInfo.setUpTime) / 60 / (manufactureInfo.efficiency / 100) / manufactureInfo.lotSize) * Number(manufactureInfo.lowSkilledLaborRatePerHour)
        );
      }
      if (pType === ProcessType.PowderCoating) {
        directSetUpCost = this.shareService.isValidNumber(
          ((manufactureInfo.lowSkilledLaborRatePerHour / 60) * (manufactureInfo.noOfLowSkilledLabours * manufactureInfo.setUpTime) +
            (manufactureInfo.skilledLaborRatePerHour / 60) * (manufactureInfo.noOfSkilledLabours * manufactureInfo.setUpTime) +
            (manufactureInfo.machineHourRate / 60) * manufactureInfo.setUpTime) /
            manufactureInfo.lotSize
        );
      } else {
        directSetUpCost = this.shareService.isValidNumber(
          ((Number(manufactureInfo.skilledLaborRatePerHour) / 60 + Number(manufactureInfo.lowSkilledLaborRatePerHour) / 60) *
            (Number(manufactureInfo.setUpTime) * Number(manufactureInfo.noOfSkilledLabours)) +
            (Number(manufactureInfo.machineHourRate) / 60) * Number(manufactureInfo.setUpTime)) /
            Math.max(Number(manufactureInfo.lotSize), Number(manufactureInfo?.noOfParts || 0))
        );
      }
      //   (Number(manufactureInfo.lowSkilledLaborRatePerHour) * Number(manufactureInfo.noOfLowSkilledLabours) +
      //     Number(manufactureInfo.skilledLaborRatePerHour) * Number(manufactureInfo.noOfSkilledLabours)) *
      //     (Number(manufactureInfo.setUpTime) / 60 / (manufactureInfo.efficiency / 100) / manufactureInfo.lotSize)
      // );
      if (manufactureInfo.directSetUpCost) directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.setUpCost : directSetUpCost;
      manufactureInfo.directSetUpCost = directSetUpCost;
    }

    // --- Inspection cost ---
    if (manufactureInfo.isinspectionCostDirty && !!manufactureInfo.inspectionCost) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      let inspectionCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.qaOfInspectorRate) * Number(manufactureInfo.qaOfInspector) * Number(manufactureInfo.inspectionTime)) /
          60 /
          (Number(manufactureInfo.efficiency) / 100) /
          Number(manufactureInfo.lotSize)
      );
      if (manufactureInfo.inspectionCost) inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : inspectionCost;
      manufactureInfo.inspectionCost = inspectionCost;
    }

    // --- Yield cost ---
    if ((manufactureInfo.isyieldCostDirty && !!manufactureInfo.yieldCost) || pType === ProcessType.Galvanization) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      const sum = Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost);
      let yieldCost = this.shareService.isValidNumber((1 - Number(manufactureInfo.yieldPer) / 100) * sum);
      if (manufactureInfo.inspectionCost) yieldCost = this.shareService.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : yieldCost;
      manufactureInfo.yieldCost = yieldCost;
    }

    // --- Final cost assignments ---
    const processCost = this.shareService.isValidNumber(
      Number(manufactureInfo.directLaborCost) +
        Number(manufactureInfo.directMachineCost) +
        Number(manufactureInfo.directSetUpCost) +
        Number(manufactureInfo.inspectionCost) +
        Number(manufactureInfo.yieldCost)
    );
    manufactureInfo.directProcessCost = processCost;
    manufactureInfo.conversionCost = processCost;
    manufactureInfo.partCost = manufactureInfo.rawmaterialCost + manufactureInfo.conversionCost;
    return manufactureInfo;
  }
}
