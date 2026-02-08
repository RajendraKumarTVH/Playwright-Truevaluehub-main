import { Injectable } from '@angular/core';
import { ManufacturingCalculatorService } from './manufacturing-calculator.service';
import { SharedService } from './shared.service';
import { Observable, Subject } from 'rxjs';
import { BendingToolTypes, MachineType, ProcessType, StampingType, ToolType } from '../costing.config';
import { takeUntil } from 'rxjs/operators';
import { PartComplexity } from 'src/app/shared/enums';
import { LaborRateMasterDto, MedbMachinesMasterDto, MedbMachineTypeMasterDto, ProcessInfoDto } from 'src/app/shared/models';
import { FormGroup } from '@angular/forms';
import { SheetMetalConfigService } from 'src/app/shared/config/sheetmetal-config';
import { Store } from '@ngxs/store';
import { ManufacturingConfigService } from 'src/app/shared/config/cost-manufacturing-config';
import { LaserCuttingTime, PlasmaCutting } from 'src/app/shared/models/sheet-metal-lookup.model';
import { FieldColorsDto } from 'src/app/shared/models/field-colors.model';
import { LaserCuttingState } from 'src/app/modules/_state/laser-cutting-lookup.state';
import { PlasmaCuttingState } from 'src/app/modules/_state/plasma-cutting-lookup.state';
import { combineLatest } from 'rxjs';
import { DigitalFactoryHelper } from './digital-factory-helper';

@Injectable({
  providedIn: 'root',
})
export class SheetMetalProcessCalculatorService {
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  _laserCuttting$: Observable<LaserCuttingTime[]>;
  _plasmaCuttting$: Observable<PlasmaCutting[]>;
  laserCutttingTimeList: LaserCuttingTime[] = [];
  plasmaCutttingSpeedList: PlasmaCutting[] = [];

  constructor(
    private store: Store,
    private shareService: SharedService,
    private _commonService: ManufacturingCalculatorService,
    public _smConfig: SheetMetalConfigService,
    public _manufacturingConfig: ManufacturingConfigService,
    private digitalFacotyHelper: DigitalFactoryHelper
  ) {
    this._laserCuttting$ = this.store.select(LaserCuttingState.getLaserCutting);
    this._plasmaCuttting$ = this.store.select(PlasmaCuttingState.getPlasmaCutting);
    this.laserAndPlasmaCuttingList();
  }

  public calculationForBending(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    manufactureInfo = this.setSheetMetalObjectValues(manufactureInfo, fieldColorsList, manufacturingObj);
    const ultimateTensileMaterial = this.shareService.isValidNumber(manufactureInfo.materialmasterDatas?.tensileStrength);
    const dimz = this.shareService.isValidNumber(manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.dimUnfoldedZ);
    manufactureInfo.bendingCoeffecient = 1.33; //Constant value
    const filteredInsProcesses = manufactureInfo.processInfoList?.filter((p) => ![ProcessType.Deburring, ProcessType.VisualInspection, ProcessType.Cleaning].includes(p.processTypeID)) || [];

    if (manufactureInfo.isQaInspectorRateDirty && manufactureInfo.qaOfInspectorRate != null) {
      manufactureInfo.qaOfInspectorRate = Number(manufactureInfo.qaOfInspectorRate);
    } else {
      let qaOfInspectorRate = 0;
      if (manufactureInfo.qaOfInspectorRate != null) {
        qaOfInspectorRate = this.shareService.checkDirtyProperty('qaOfInspectorRate', fieldColorsList)
          ? manufacturingObj?.qaOfInspectorRate
          : this.shareService.isValidNumber(manufactureInfo.qaOfInspectorRate);
        if (manufactureInfo.processInfoList && manufactureInfo.processInfoList?.length > 0) {
          if (manufactureInfo.processTypeID === ProcessType.Stage) {
            const sorted = manufactureInfo?.processInfoList?.sort((a, b) => b.processInfoId - a.processInfoId);
            const processIndex = sorted?.findIndex((x) => x.processInfoId === manufactureInfo.processInfoId);
            // let processIndex = manufactureInfo.processInfoList?.findIndex(x => x.processTypeID === ProcessType.Stage && x.subProcessTypeInfos.find(y => y.subProcessTypeId === StampingType.Bending));
            if (!(processIndex >= 0 && processIndex !== filteredInsProcesses?.length - 1)) {
              qaOfInspectorRate = 0;
            }
          } else {
            const processIndex = manufactureInfo.processInfoList?.findIndex((x) => x.processTypeID === ProcessType.Bending);
            if (processIndex >= 0 && processIndex !== filteredInsProcesses?.length - 1) {
              qaOfInspectorRate = 0;
            }
          }
        }
      }
      manufactureInfo.qaOfInspectorRate = qaOfInspectorRate;
    }
    const theoreticalForceForce = (Math.pow(dimz, 1) * manufactureInfo.bendingLineLength * ultimateTensileMaterial * manufactureInfo.bendingCoeffecient) / 9810;
    manufactureInfo.theoreticalForce = this.shareService.isValidNumber(theoreticalForceForce);
    manufactureInfo.recommendTonnage = this.shareService.isValidNumber(manufactureInfo.theoreticalForce) * 1.25;

    //TODO:cycletime formula need to be changed
    manufactureInfo.sheetLoadUloadTime = (5 / 60) * 2;
    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber((2 / 60 + Number(manufactureInfo.sheetLoadUloadTime)) * 60);
      if (manufactureInfo.cycleTime != null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    if (manufactureInfo.isinspectionTimeDirty && manufactureInfo.inspectionTime != null) {
      manufactureInfo.inspectionTime = Number(manufactureInfo.inspectionTime);
    } else {
      let inspectionTime =
        manufactureInfo?.partComplexity === PartComplexity.Low ? 2 : manufactureInfo?.partComplexity === PartComplexity.Medium ? 5 : manufactureInfo?.partComplexity === PartComplexity.High ? 10 : 0;
      if (manufactureInfo.inspectionTime != null) {
        inspectionTime = this.shareService.checkDirtyProperty('inspectionTime', fieldColorsList) ? manufacturingObj?.inspectionTime : inspectionTime;
        if (manufactureInfo.processTypeID === ProcessType.Stage) {
          const sorted = manufactureInfo?.processInfoList?.sort((a, b) => b.processInfoId - a.processInfoId);
          const processIndex = sorted?.findIndex((x) => x.processInfoId === manufactureInfo.processInfoId);
          // let processIndex = manufactureInfo.processInfoList?.findIndex(x => x.processTypeID === ProcessType.Stage && x.subProcessTypeInfos.find(y => y.subProcessTypeId === StampingType.Bending));
          if (!(processIndex >= 0 && processIndex !== manufactureInfo.processInfoList?.length - 1)) {
            inspectionTime = 0;
          }
        } else {
          const processIndex = manufactureInfo.processInfoList?.findIndex((x) => x.processTypeID === ProcessType.Bending);
          if (processIndex >= 0 && processIndex !== manufactureInfo.processInfoList?.length - 1) {
            inspectionTime = 0;
          }
        }
      }
      manufactureInfo.inspectionTime = inspectionTime;
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
        (((Number(manufactureInfo.skilledLaborRatePerHour) + Number(manufactureInfo.machineHourRate)) / 60) * Number(manufactureInfo.setUpTime)) / Number(manufactureInfo.lotSize)
      );
      if (manufactureInfo.directSetUpCost != null) {
        directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.directSetUpCost : directSetUpCost;
      }
      manufactureInfo.directSetUpCost = directSetUpCost;
    }

    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost != null) {
      manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
    } else {
      let directLaborCost = this.shareService.isValidNumber((Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) * (manufactureInfo.cycleTime * Number(manufactureInfo.noOfLowSkilledLabours)));
      if (manufactureInfo.directLaborCost != null) {
        directLaborCost = this.shareService.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : directLaborCost;
        if (manufactureInfo.processTypeID === ProcessType.Stage) {
          const sorted = manufactureInfo?.processInfoList?.sort((a, b) => b.processInfoId - a.processInfoId);
          const processIndex = sorted?.findIndex((x) => x.processInfoId === manufactureInfo.processInfoId);
          // let processIndex = manufactureInfo.processInfoList?.findIndex(x => x.processTypeID === ProcessType.Stage && x.subProcessTypeInfos.find(y => y.subProcessTypeId === StampingType.Bending));
          if (!(processIndex >= 0 && processIndex != manufactureInfo.processInfoList?.length - 1)) {
            directLaborCost = 0;
          }
        } else {
          const processIndex = manufactureInfo.processInfoList?.findIndex((x) => x.processTypeID === ProcessType.Bending);
          if (processIndex >= 0 && processIndex != manufactureInfo.processInfoList?.length - 1) {
            directLaborCost = 0;
          }
        }
      }
      manufactureInfo.directLaborCost = directLaborCost;
    }
    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost !== null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      let inspectionCost = this.shareService.isValidNumber(
        ((Number(manufactureInfo.qaOfInspectorRate) / 60) * Number(manufactureInfo.inspectionTime) * Math.ceil(Number(manufactureInfo.samplingRate / 100) * Number(manufactureInfo.lotSize))) /
          Number(manufactureInfo.lotSize)
      );
      if (manufactureInfo.inspectionCost !== null) {
        if (manufactureInfo.processInfoList && manufactureInfo.processInfoList?.length > 0) {
          if (manufactureInfo.processTypeID !== ProcessType.Stage && manufactureInfo.processTypeID !== ProcessType.Progressive) {
            const processIndex = manufactureInfo.processInfoList?.findIndex((x) => x.processTypeID === ProcessType.Bending);
            if (processIndex >= 0 && processIndex !== manufactureInfo.processInfoList?.length - 1) {
              inspectionCost = 0;
            }
          }
        }
        inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : inspectionCost;
      }
      manufactureInfo.inspectionCost = inspectionCost;
    }

    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost != null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      const sum = this.shareService.isValidNumber(
        Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
      );
      let yieldCost = this.shareService.isValidNumber(
        (1 - Number(manufactureInfo.yieldPer / 100)) * (Number(manufactureInfo.materialInfo.totalCost) + sum) -
          (1 - Number(manufactureInfo.yieldPer / 100)) * ((Number(manufactureInfo.materialInfo.weight) * Number(manufactureInfo.materialInfo.scrapPrice)) / 1000)
      );
      if (manufactureInfo.yieldCost != null) {
        yieldCost = this.shareService.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : yieldCost;
      }
      manufactureInfo.yieldCost = yieldCost;
    }
    manufactureInfo.directProcessCost = this.shareService.isValidNumber(
      Number(manufactureInfo.directLaborCost) +
        Number(manufactureInfo.directMachineCost) +
        Number(manufactureInfo.directSetUpCost) +
        Number(manufactureInfo.inspectionCost) +
        Number(manufactureInfo.yieldCost)
    );
    // //manufactureInfo = this.calculateESGCosts(manufactureInfo, fieldColorsList, manufacturingObj);
    // return new Observable((obs) => {
    //     obs.next(manufactureInfo);
    // });
    return manufactureInfo;
  }

  public calculationForSoftBending(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    manufactureInfo = this.setSheetMetalObjectValues(manufactureInfo, fieldColorsList, manufacturingObj);
    const filteredInsProcesses = manufactureInfo.processInfoList?.filter((p) => ![ProcessType.Deburring, ProcessType.VisualInspection, ProcessType.Cleaning].includes(p.processTypeID)) || [];

    const ultimateTensileMaterial = this.shareService.isValidNumber(manufactureInfo.materialmasterDatas?.tensileStrength);
    manufactureInfo.bendingCoeffecient = 1.33; //Constant value
    const dimz = this.shareService.isValidNumber(manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.dimUnfoldedZ);

    // Req. Bed Size
    const machineList = manufactureInfo?.machineList ?? [];
    const sortedMachines = [...machineList].sort((a, b) => a.bedLength - b.bedLength);
    let selected = sortedMachines.find((m) => m.bedLength === manufactureInfo.bendingLineLength);
    if (!selected) {
      selected = sortedMachines.find((m) => m.bedLength > manufactureInfo.bendingLineLength);
    }

    if (!selected && sortedMachines.length > 0) {
      selected = sortedMachines[sortedMachines.length - 1];
    }

    manufactureInfo.requiredCurrent = this.shareService.isValidNumber(manufactureInfo.bendingLineLength * 1.2);
    manufactureInfo.requiredWeldingVoltage = 0;
    manufactureInfo.recBedSize = Math.round(manufactureInfo.requiredCurrent) + '';

    // selected bed sizes
    manufactureInfo.lengthOfCoated = manufactureInfo?.machineMaster?.bedLength;
    manufactureInfo.widthOfCoated = 0; //manufactureInfo?.machineMaster?.bedWidth;
    manufactureInfo.selectedBedSize = manufactureInfo?.machineMaster?.bedLength + '';

    // BendType
    if (manufactureInfo.isNoOfTypesOfPins && manufactureInfo.noOfTypesOfPins !== null) {
      manufactureInfo.noOfTypesOfPins = Number(manufactureInfo.noOfTypesOfPins);
    } else {
      let bendType =
        manufactureInfo?.innerRadius <= dimz / 2
          ? 3 // Coining
          : manufactureInfo?.innerRadius <= dimz
            ? 2 // Bottom Bending
            : manufactureInfo?.innerRadius > dimz
              ? 1 // Air Bending
              : 0;

      if (manufactureInfo.noOfTypesOfPins !== null) {
        bendType = this.shareService.checkDirtyProperty('noOfTypesOfPins', fieldColorsList) ? manufacturingObj?.noOfTypesOfPins : bendType;
      }
      manufactureInfo.noOfTypesOfPins = bendType;
    }

    // Die Opening/Thickness
    const dieOpeningThickness = dimz < 3 ? 6 : dimz < 10 ? 8 : dimz < 12 ? 10 : 12;
    manufactureInfo.dieOpeningThickness = dieOpeningThickness;

    // Die Opening/V
    let dieOpeningV = Number(dimz) * Number(manufactureInfo.dieOpeningThickness);

    // if (manufactureInfo.isDieOpeningThicknessDirty && manufactureInfo.dieOpeningThickness != null) {
    //   manufactureInfo.dieOpeningThickness = Number(manufactureInfo.dieOpeningThickness);
    // } else {
    //   let dieOpeningThickness = 0;
    //   if (manufactureInfo.dieOpeningThickness != null) {
    //     if (dimz < 3) dieOpeningThickness = 6;
    //     else if (dimz < 10) dieOpeningThickness = 8;
    //     else if (dimz < 12) dieOpeningThickness = 10;
    //     else if (dimz > 12) dieOpeningThickness = 10;

    //     dieOpeningThickness = this.shareService.checkDirtyProperty('dieOpeningThickness', fieldColorsList)
    //       ? manufacturingObj?.dieOpeningThickness
    //       : this.shareService.isValidNumber(dieOpeningThickness);
    //   }
    //   manufactureInfo.dieOpeningThickness = dieOpeningThickness;
    // }

    // if (manufactureInfo.isdieOpeningTimeDirty && manufactureInfo.dieOpeningTime != null) {
    //   manufactureInfo.dieOpeningTime = Number(manufactureInfo.dieOpeningTime);
    // } else {
    //   let dieOpening = Number(manufactureInfo.partThickness) * Number(manufactureInfo.dieOpeningThickness);
    //   if (manufactureInfo.dieOpeningTime != null) {
    //     dieOpening = this.shareService.checkDirtyProperty('dieOpeningTime', fieldColorsList) ? manufacturingObj?.dieOpeningTime : dieOpening;
    //   }
    //   manufactureInfo.dieOpeningTime = dieOpening;
    // }

    // Inner radius to Die opening ratio
    // const innerRadiusToDieOpeningRatio = this.shareService.isValidNumber(manufactureInfo.innerRadius / dieOpeningV);

    // Bending Force/P KN
    const bendingForceKn =
      manufactureInfo.noOfTypesOfPins === 1
        ? (1.33 * dimz ** 2 * (manufactureInfo.bendingLineLength / 1000) * ultimateTensileMaterial) / dieOpeningV // ** equalant to Math.pow(dimz, 2)
        : manufactureInfo.noOfTypesOfPins === 2
          ? (2.67 * dimz ** 2 * (manufactureInfo.bendingLineLength / 1000) * ultimateTensileMaterial) / dieOpeningV
          : manufactureInfo.noOfTypesOfPins === 3
            ? 1.1 * dimz * (manufactureInfo.bendingLineLength / 1000) * ultimateTensileMaterial
            : 0;

    // const bendingForceKn = this.shareService.isValidNumber(
    //   (1.42 * Math.pow(Number(manufactureInfo.partThickness), 2) * Number(manufactureInfo.bendingLineLength / 1000) * Number(ultimateTensileMaterial)) / manufactureInfo.dieOpeningTime
    // );

    // Bending Force/P (Ton)
    const bendingForcePerTon2 = this.shareService.isValidNumber(bendingForceKn / 9.81);

    // Recommended Force : (Ton)
    manufactureInfo.recommendTonnage = Math.ceil(bendingForcePerTon2 * 1.25);

    if (manufactureInfo.moldTemp === BendingToolTypes.Dedicated) {
      const bendingCoeffecient = 1.33;
      const theoreticalForceForce = (Math.pow(dimz, 2) * Number(manufactureInfo.bendingLineLength) * ultimateTensileMaterial * bendingCoeffecient) / Number(manufactureInfo.shoulderWidth) / 9810;
      manufactureInfo.theoreticalForce = this.shareService.isValidNumber(theoreticalForceForce);
      manufactureInfo.totalTonnageRequired = this.shareService.isValidNumber(theoreticalForceForce);
      manufactureInfo.recommendTonnage = this.shareService.isValidNumber(manufactureInfo.totalTonnageRequired) * 1.25;
    }

    // Stroke length (mm)
    const strokeLength = manufactureInfo?.machineMaster.pressBrakeStrokeDistance_mm || 0;
    // Ram Down Speed (mm/sec)
    const ramDownSpeed = manufactureInfo?.machineMaster?.pressBrakeRamDownSpeed_mm_sec || 0;
    // Ram Up Speed (mm/sec)
    const ramUpSpeed = manufactureInfo?.machineMaster?.pressBrakeRamUpSpeed_mm_sec || 0;

    // Ram Down Time (sec)
    const ramDownTime = this.shareService.isValidNumber(strokeLength / ramDownSpeed);
    // Ram Up Time (sec)
    const ramUpTime = this.shareService.isValidNumber(strokeLength / ramUpSpeed);

    // Dwell Time (sec)
    const dwellTime = this._smConfig.getDwellTime(manufactureInfo.materialmasterDatas?.materialType?.materialTypeName, dimz, manufactureInfo.noOfTypesOfPins);

    const partWeight = this.shareService.isValidNumber(manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.netWeight);

    // Process Time (sec)
    if (manufactureInfo.isProcessTimeDirty && manufactureInfo.processTime !== null) {
      manufactureInfo.processTime = Number(manufactureInfo.processTime);
    } else {
      let processTime = this.shareService.isValidNumber(ramDownTime + ramUpTime + dwellTime);
      manufactureInfo.processTime = this.shareService.checkDirtyProperty('processTime', fieldColorsList) ? manufacturingObj?.processTime : processTime;
    }

    // Rotation Time (sec)
    let rotationTime = 0;
    if (Number(manufactureInfo.noOfbends) > 1) {
      if (partWeight < 2500) {
        rotationTime = 4;
      } else if (partWeight < 5000) {
        rotationTime = 8;
      } else if (partWeight < 27000) {
        rotationTime = 15;
      } else {
        rotationTime = 30;
      }
      rotationTime = rotationTime * (Number(manufactureInfo.noOfbends) - 1);
    }

    // operation Handling time (s)
    if (manufactureInfo.isRotationTimeDirty && manufactureInfo.rotationTime !== null) {
      manufactureInfo.rotationTime = Number(manufactureInfo.rotationTime);
    } else {
      // let loadingTime = 0;
      // if (partWeight < 2500) {
      //   loadingTime = 4;
      // } else if (partWeight < 5000) {
      //   loadingTime = 8;
      // } else if (partWeight < 27000) {
      //   loadingTime = 15;
      // } else {
      //   loadingTime = 30;
      // }
      // manufactureInfo.loadingTime = loadingTime;

      // let unloadingTime = 0;
      // if (partWeight < 2500) {
      //   unloadingTime = 4;
      // } else if (partWeight < 5000) {
      //   unloadingTime = 8;
      // } else if (partWeight < 27000) {
      //   unloadingTime = 15;
      // } else {
      //   unloadingTime = 30;
      // }
      // manufactureInfo.unloadingTime = unloadingTime;

      let operationHandlingTime = 0;

      const factor = partWeight < 5000 ? 4 : partWeight < 10000 ? 8 : partWeight < 27000 ? 15 : 30;

      operationHandlingTime = factor * 2 + rotationTime;
      // operationHandlingTime = operationHandlingTime ; // + loadingTime + unloadingTime;
      if (manufactureInfo?.rotationTime !== null) {
        operationHandlingTime = this.shareService.checkDirtyProperty('rotationTime', fieldColorsList) ? manufacturingObj?.rotationTime : this.shareService.isValidNumber(operationHandlingTime);
      }
      manufactureInfo.rotationTime = operationHandlingTime;
    }

    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime !== null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber((Number(manufactureInfo.processTime) * Number(manufactureInfo.noOfbends) + Number(manufactureInfo.rotationTime)) / manufactureInfo.efficiency);
      if (manufactureInfo.cycleTime !== null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    if (manufactureInfo.isLowSkilledLaborRatePerHourDirty && manufactureInfo.lowSkilledLaborRatePerHour !== null) {
      manufactureInfo.lowSkilledLaborRatePerHour = Number(manufactureInfo.lowSkilledLaborRatePerHour);
    } else {
      manufactureInfo.lowSkilledLaborRatePerHour = this.shareService.checkDirtyProperty('lowSkilledLaborRatePerHour', fieldColorsList)
        ? manufacturingObj?.lowSkilledLaborRatePerHour
        : this.shareService.isValidNumber(manufactureInfo.lowSkilledLaborRatePerHour);
    }

    if (manufactureInfo.isNoOfLowSkilledLaboursDirty && manufactureInfo.noOfLowSkilledLabours !== null) {
      manufactureInfo.noOfLowSkilledLabours = Number(manufactureInfo.noOfLowSkilledLabours);
    } else {
      manufactureInfo.noOfLowSkilledLabours = this.shareService.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList)
        ? manufacturingObj?.noOfLowSkilledLabours
        : this.shareService.isValidNumber(manufactureInfo.noOfLowSkilledLabours);
    }

    if (manufactureInfo.isQaInspectorRateDirty && manufactureInfo.qaOfInspectorRate !== null) {
      manufactureInfo.qaOfInspectorRate = Number(manufactureInfo.qaOfInspectorRate);
    } else {
      if (manufactureInfo.processTypeID !== Number(ProcessType.Stage) && manufactureInfo.processTypeID !== Number(ProcessType.Progressive)) {
        const processIndex = manufactureInfo.processInfoList?.findIndex((x) => x.processTypeID === ProcessType.Bending);
        if (processIndex >= 0 && processIndex !== filteredInsProcesses?.length - 1) {
          manufactureInfo.qaOfInspectorRate = 0;
        }
      }
      manufactureInfo.qaOfInspectorRate = this.shareService.checkDirtyProperty('qaOfInspectorRate', fieldColorsList)
        ? manufacturingObj?.qaOfInspectorRate
        : this.shareService.isValidNumber(manufactureInfo.qaOfInspectorRate);
    }

    if (manufactureInfo.isinspectionTimeDirty && manufactureInfo.inspectionTime != null) {
      manufactureInfo.inspectionTime = Number(manufactureInfo.inspectionTime);
    } else {
      let inspectionTime =
        manufactureInfo?.partComplexity == PartComplexity.Low ? 2 : manufactureInfo?.partComplexity == PartComplexity.Medium ? 5 : manufactureInfo?.partComplexity == PartComplexity.High ? 10 : 0;
      if (manufactureInfo.inspectionTime != null) {
        if (manufactureInfo.processTypeID != ProcessType.Stage && manufactureInfo.processTypeID != ProcessType.Progressive) {
          const processIndex = manufactureInfo.processInfoList?.findIndex((x) => x.processTypeID === ProcessType.Bending);
          if (processIndex >= 0 && processIndex !== filteredInsProcesses?.length - 1) {
            inspectionTime = 0;
          }
        }
        inspectionTime = this.shareService.checkDirtyProperty('inspectionTime', fieldColorsList) ? manufacturingObj?.inspectionTime : inspectionTime;
      }
      manufactureInfo.inspectionTime = inspectionTime;
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

    // setup time
    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime !== null) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      let setUpTime = this._smConfig.calculateSetupTimesForBendBrake(manufactureInfo.bendingLineLength) + 5;

      if (manufactureInfo.setUpTime !== null) {
        setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : setUpTime;
      }
      manufactureInfo.setUpTime = setUpTime;
    }

    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost != null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      let directSetUpCost = this.shareService.isValidNumber(
        (((Number(manufactureInfo.skilledLaborRatePerHour) + Number(manufactureInfo.machineHourRate)) / 60) * Number(manufactureInfo.setUpTime)) / Number(manufactureInfo.lotSize)
      );
      if (manufactureInfo.directSetUpCost != null) {
        directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.directSetUpCost : directSetUpCost;
      }
      manufactureInfo.directSetUpCost = directSetUpCost;
    }

    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost != null) {
      manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
    } else {
      let directLaborCost = this.shareService.isValidNumber((Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) * (manufactureInfo.cycleTime * Number(manufactureInfo.noOfLowSkilledLabours)));
      if (manufactureInfo.directLaborCost != null) {
        directLaborCost = this.shareService.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : directLaborCost;
      }
      manufactureInfo.directLaborCost = directLaborCost;
    }
    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost !== null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      let inspectionCost = this.shareService.isValidNumber(
        ((Number(manufactureInfo.qaOfInspectorRate) / 60) * Number(manufactureInfo.inspectionTime) * Math.ceil(Number(manufactureInfo.samplingRate / 100) * Number(manufactureInfo.lotSize))) /
          Number(manufactureInfo.lotSize)
      );
      inspectionCost = this.shareService.isValidNumber(inspectionCost);
      if (manufactureInfo.inspectionCost !== null) {
        if (manufactureInfo.processTypeID !== ProcessType.Stage && manufactureInfo.processTypeID != ProcessType.Progressive) {
          const processIndex = manufactureInfo.processInfoList?.findIndex((x) => x.processTypeID === ProcessType.Bending);
          if (processIndex >= 0 && processIndex !== filteredInsProcesses?.length - 1) {
            inspectionCost = 0;
          }
        }
        inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : inspectionCost;
      }
      manufactureInfo.inspectionCost = inspectionCost;
    }

    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost != null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      const sum = this.shareService.isValidNumber(
        Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
      );
      let yieldCost = this.shareService.isValidNumber(
        (1 - Number(manufactureInfo.yieldPer / 100)) * (Number(manufactureInfo.materialInfo.totalCost) + sum) -
          (1 - Number(manufactureInfo.yieldPer / 100)) * ((Number(manufactureInfo.materialInfo.weight) * Number(manufactureInfo.materialInfo.scrapPrice)) / 1000)
      );
      if (manufactureInfo.yieldCost != null) {
        yieldCost = this.shareService.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : yieldCost;
      }
      manufactureInfo.yieldCost = yieldCost;
    }
    manufactureInfo.directProcessCost = this.shareService.isValidNumber(
      Number(manufactureInfo.directLaborCost) +
        Number(manufactureInfo.directMachineCost) +
        Number(manufactureInfo.directSetUpCost) +
        Number(manufactureInfo.inspectionCost) +
        Number(manufactureInfo.yieldCost)
    );

    ////manufactureInfo = this.calculateESGCosts(manufactureInfo, fieldColorsList, manufacturingObj);
    // return new Observable((obs) => {
    //     obs.next(manufactureInfo);
    // });
    return manufactureInfo;
  }

  public calculationForstampingProgressive(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    manufactureInfo = this.setSheetMetalObjectValues(manufactureInfo, fieldColorsList, manufacturingObj);
    const filteredInsProcesses = manufactureInfo.processInfoList?.filter((p) => ![ProcessType.Deburring, ProcessType.VisualInspection, ProcessType.Cleaning].includes(p.processTypeID)) || [];

    if (manufactureInfo.isliquidTempDirty && manufactureInfo.liquidTemp !== null) {
      manufactureInfo.liquidTemp = Number(manufactureInfo.liquidTemp);
    } else {
      let liquidTemp = manufacturingObj?.liquidTemp || 1;
      if (manufactureInfo.liquidTemp !== null) {
        liquidTemp = this.shareService.checkDirtyProperty('liquidTemp', fieldColorsList) ? manufacturingObj?.liquidTemp : liquidTemp;
      }
      manufactureInfo.liquidTemp = liquidTemp;
    }

    if (manufactureInfo.isNoOfStrokesDirty && manufactureInfo.noofStroke != null) {
      manufactureInfo.noofStroke = Number(manufactureInfo.noofStroke);
    } else {
      const stripLayout = manufactureInfo?.materialInfoList && manufactureInfo?.materialInfoList?.length > 0 ? manufactureInfo?.materialInfoList[0].typeOfCable : 1;
      if (manufactureInfo.noofStroke != null) {
        manufactureInfo.noofStroke = this.shareService.checkDirtyProperty('noofStroke', fieldColorsList) ? manufacturingObj?.noofStroke : stripLayout;
      }
    }

    const thickness = (manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.dimUnfoldedZ) || 0;
    const unfoldedLength = (manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.dimUnfoldedX) || 0;
    const unfoldedWidth = (manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.dimUnfoldedY) || 0;
    const height = (manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.partHeight) || 0;
    const stripLayout = (manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.typeOfCable) || 0; // no of impressions

    // // recommended shut height
    // if (thickness <= 2) {
    //   manufactureInfo.platenSizeLength = 427;
    // } else if (thickness <= 4) {
    //   manufactureInfo.platenSizeLength = 447;
    // } else if (thickness <= 5) {
    //   manufactureInfo.platenSizeLength = 487;
    // }

    // selected shut height
    manufactureInfo.platenSizeWidth = manufactureInfo?.machineMaster?.shutHeightmm;

    // MC/ Strokes per min
    if (manufactureInfo.isspindleRpmDirty && manufactureInfo.spindleRpm !== null) {
      manufactureInfo.spindleRpm = Number(manufactureInfo.spindleRpm);
    } else {
      let selectedSpm = manufactureInfo?.machineMaster?.strokeRateMin || 0;
      if (manufactureInfo.spindleRpm !== null) {
        selectedSpm = this.shareService.checkDirtyProperty('spindleRpm', fieldColorsList) ? manufacturingObj?.spindleRpm : selectedSpm;
      }
      manufactureInfo.spindleRpm = selectedSpm;
    }

    let totalTon = 0;
    if (manufactureInfo.isQaInspectorRateDirty && manufactureInfo.qaOfInspectorRate != null) {
      manufactureInfo.qaOfInspectorRate = Number(manufactureInfo.qaOfInspectorRate);
    } else {
      const processIndex = manufactureInfo?.processInfoList?.findIndex((x) => x.processTypeID === ProcessType.Progressive);
      if (processIndex >= 0 && processIndex != manufactureInfo?.processInfoList?.length - 1) {
        manufactureInfo.qaOfInspectorRate = 0;
      }
      manufactureInfo.qaOfInspectorRate = this.shareService.checkDirtyProperty('qaOfInspectorRate', fieldColorsList)
        ? manufacturingObj?.qaOfInspectorRate
        : this.shareService.isValidNumber(manufactureInfo.qaOfInspectorRate);
    }

    if (manufactureInfo.isinspectionTimeDirty && manufactureInfo.inspectionTime !== null) {
      manufactureInfo.inspectionTime = Number(manufactureInfo.inspectionTime);
    } else {
      let inspectionTime =
        manufactureInfo?.partComplexity === PartComplexity.Low ? 2 : manufactureInfo?.partComplexity === PartComplexity.Medium ? 5 : manufactureInfo?.partComplexity === PartComplexity.High ? 10 : 0;
      if (manufactureInfo.inspectionTime !== null) {
        const processIndex = manufactureInfo?.processInfoList?.findIndex((x) => x.processTypeID === ProcessType.Progressive);
        if (processIndex >= 0 && processIndex !== filteredInsProcesses?.length - 1) {
          inspectionTime = 0;
        }
        inspectionTime = this.shareService.checkDirtyProperty('inspectionTime', fieldColorsList) ? manufacturingObj?.inspectionTime : inspectionTime;
      }
      manufactureInfo.inspectionTime = inspectionTime;
    }

    let noOfStages = 0;
    let bendingIndex = 0;
    for (let i = 0; i < manufactureInfo.subProcessFormArray?.controls?.length; i++) {
      const info = manufactureInfo.subProcessFormArray?.controls[i];
      if (
        [
          StampingType.Forming,
          StampingType.Bending,
          StampingType.Drawing,
          StampingType.Coining,
          StampingType.Compound,
          StampingType.ShallowDrawRect,
          StampingType.ShallowDrawCir,
          StampingType.RedrawRect,
          StampingType.RedrawCir,
          StampingType.Trimming,
        ].includes(Number(info?.value?.subProcessTypeID))
      ) {
        noOfStages++;
      }
      manufactureInfo.bendingLineLength = info?.value?.bendingLineLength;
      manufactureInfo.bendingCoeffecient = 1.33;
      manufactureInfo.shoulderWidth = info?.value?.shoulderWidth;
      manufactureInfo.noOfbends = info?.value?.noOfBends;
      manufactureInfo.formPerimeter = info?.value?.formPerimeter;
      manufactureInfo.formLength = Number(info?.value?.formLength);
      manufactureInfo.formHeight = Number(info?.value?.formHeight);

      if ([StampingType.BlankingPunching, StampingType.Piercing, StampingType.Compound].includes(Number(info.value.subProcessTypeID))) {
        const blankingInfo = Object.assign({}, manufactureInfo);
        const thickness = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.dimUnfoldedZ;
        let lengthOfCut = Number(info?.value?.lengthOfCut);

        if (lengthOfCut === 0 || lengthOfCut === null) {
          if (Number(info.value.subProcessTypeID) === StampingType.BlankingPunching) {
            lengthOfCut = this.shareService.extractedProcessData?.ExternalPerimeter;
          }
          if (Number(info.value.subProcessTypeID) === StampingType.Piercing) {
            lengthOfCut = this.shareService.extractedProcessData?.InternalPerimeter;
          }
        }
        const theoriticalForcce = this.shareService.isValidNumber((lengthOfCut * Number(thickness) * Number(manufactureInfo.materialmasterDatas.shearingStrength)) / 9810);
        const recommendedTon = this.shareService.isValidNumber(Number(theoriticalForcce) * 1.25);
        (manufactureInfo.subProcessFormArray.controls as FormGroup[])[i].patchValue({ recommendTonnage: recommendedTon, lengthOfCut: this.shareService.isValidNumber(lengthOfCut) });

        totalTon += recommendedTon;

        const strokeRateInfo = manufactureInfo.strokeRateList?.find((x) => x.tonnage > recommendedTon);
        const factorPercent =
          manufactureInfo?.partComplexity == PartComplexity.Low
            ? strokeRateInfo?.simplePercentage
            : manufactureInfo?.partComplexity == PartComplexity.Medium
              ? strokeRateInfo?.interPercentage
              : manufactureInfo?.partComplexity == PartComplexity.High
                ? strokeRateInfo?.complexPercentage
                : 0;

        blankingInfo.cycleTime = this.shareService.isValidNumber((1 / (Number(manufactureInfo?.machineMaster?.strokeRateMin) * Number(factorPercent))) * 60);

        const handlingInfo = manufactureInfo.handlingTimeList?.filter((x) => x.weight > manufactureInfo.materialInfo.weight).sort((s) => s.weight);
        let sheetLoadUloadTime = 0;
        if (handlingInfo) {
          sheetLoadUloadTime = Number(handlingInfo[0]?.handlingTime);
        }
        manufactureInfo.sheetLoadUloadTime = sheetLoadUloadTime;

        const partsPerSheet = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.partsPerCoil;
        const totalSheetLoadingTime = this.shareService.isValidNumber(Math.round((Number(manufactureInfo?.lotSize) / Number(partsPerSheet)) * Number(sheetLoadUloadTime)));

        const toolLoadingInfo = manufactureInfo.toolLoadingTimeList?.filter((x) => x.tonnage > Number(recommendedTon) && x.toolType == ToolType.PressMachine).sort((s) => s.tonnage);
        const toolLoadingTIme = (toolLoadingInfo && toolLoadingInfo.length > 0 && toolLoadingInfo[0]?.toolLoadingTime) || 0;

        blankingInfo.setUpTime = this.shareService.isValidNumber(Number(toolLoadingTIme) + Number(totalSheetLoadingTime));
        blankingInfo.directMachineCost = this.shareService.isValidNumber((Number(blankingInfo.machineHourRate) / 3600) * Number(blankingInfo.cycleTime));
        blankingInfo.directSetUpCost = this.shareService.isValidNumber(
          (((Number(blankingInfo.skilledLaborRatePerHour) + Number(blankingInfo.machineHourRate)) / 60) * Number(blankingInfo.setUpTime)) / Number(blankingInfo.lotSize)
        );
        blankingInfo.directLaborCost = this.shareService.isValidNumber(
          (Number(blankingInfo.lowSkilledLaborRatePerHour) / 3600) * (blankingInfo.cycleTime * Number(blankingInfo.noOfLowSkilledLabours))
        );

        blankingInfo.inspectionCost = this.shareService.isValidNumber(
          ((Number(blankingInfo.qaOfInspectorRate) / 60) *
            (Number(blankingInfo.inspectionTime) * Number(blankingInfo.noOfSemiSkilledLabours)) *
            (Number(blankingInfo.samplingRate / 100) * Number(blankingInfo?.lotSize))) /
            Number(blankingInfo?.lotSize)
        );

        const sum = this.shareService.isValidNumber(
          Number(blankingInfo.directMachineCost) + Number(blankingInfo.directSetUpCost) + Number(blankingInfo.directLaborCost) + Number(blankingInfo.inspectionCost)
        );
        blankingInfo.yieldCost = this.shareService.isValidNumber(
          (1 - Number(blankingInfo.yieldPer / 100)) * (Number(blankingInfo.materialInfo.totalCost) + sum) -
            (1 - Number(blankingInfo.yieldPer / 100)) * ((Number(blankingInfo.materialInfo.weight) * Number(blankingInfo.materialInfo.scrapPrice)) / 1000)
        );
        blankingInfo.directProcessCost = this.shareService.isValidNumber(sum + Number(blankingInfo.yieldCost));
      } else if ([StampingType.Bending].includes(Number(info.value.subProcessTypeID))) {
        const bendingInfo = Object.assign({}, manufactureInfo);
        // this.calculationForBending(bendingInfo, fieldColorsList, manufacturingObj)
        //     .pipe(takeUntil(this.unsubscribe$))
        //     .subscribe((calculationRes: any) => {
        //         if (calculationRes) {
        //             totalTon += calculationRes?.recommendTonnage;
        //             (manufactureInfo.subProcessFormArray.controls as FormGroup[])[i].patchValue({ recommendTonnage: calculationRes?.recommendTonnage });
        //         }
        //     });
        const axisWiseLength = this._manufacturingConfig._sheetMetalConfig.getBendingEntriesSumByAxis();
        if (!info?.value?.bendingLineLength) {
          const lengthSum = axisWiseLength[bendingIndex]?.lengthSum || axisWiseLength[0]?.lengthSum || 0;

          (manufactureInfo.subProcessFormArray.controls as FormGroup[])[i].patchValue({ bendingLineLength: this.shareService.isValidNumber(lengthSum) });

          bendingInfo.bendingLineLength = lengthSum;
        }

        const calculationRes = this.calculationForBending(bendingInfo, fieldColorsList, manufacturingObj);
        if (calculationRes) {
          totalTon += calculationRes?.recommendTonnage;
          (manufactureInfo.subProcessFormArray.controls as FormGroup[])[i].patchValue({ recommendTonnage: calculationRes?.recommendTonnage });
        }
        bendingIndex++;
      } else if ([StampingType.Forming, StampingType.Coining].includes(Number(info.value.subProcessTypeID))) {
        const formingInfo = Object.assign({}, manufactureInfo);
        const calculationRes = this.calculationForForming(formingInfo, fieldColorsList, manufacturingObj);
        if (calculationRes) {
          totalTon += calculationRes?.recommendTonnage;
          (manufactureInfo.subProcessFormArray.controls as FormGroup[])[i].patchValue({
            recommendTonnage: calculationRes?.recommendTonnage,
            blankArea: calculationRes?.blankArea,
            formingForce: calculationRes?.formingForce,
          });
        }
      } else if ([StampingType.Drawing].includes(Number(info.value.subProcessTypeID))) {
        const drawingInfo = Object.assign({}, manufactureInfo);
        const calculationRes = this.calculationForDrawing(drawingInfo, fieldColorsList, manufacturingObj);
        if (calculationRes) {
          totalTon += calculationRes?.recommendTonnage;
          (manufactureInfo.subProcessFormArray.controls as FormGroup[])[i].patchValue({ hlFactor: calculationRes?.hlFactor });
          (manufactureInfo.subProcessFormArray.controls as FormGroup[])[i].patchValue({ recommendTonnage: calculationRes?.recommendTonnage });
        }
      } else if ([StampingType.ShallowDrawRect, StampingType.ShallowDrawCir].includes(Number(info.value.subProcessTypeID))) {
        let perimeter = Number(info?.value?.lengthOfCut);
        let tensileStrength = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.ultimateTensileStrength : 0; // Number(info?.value?.shoulderWidth);
        let drawKFactor = 1.15; // Number(info?.value?.hlFactor);

        const theoriticalForcce = this.shareService.isValidNumber((3.14 * perimeter * Number(thickness) * Number(tensileStrength) * Number(drawKFactor)) / 9806.65);
        const recommendedTon = this.shareService.isValidNumber(Number(theoriticalForcce) * 1.2);
        (manufactureInfo.subProcessFormArray.controls as FormGroup[])[i].patchValue({
          recommendTonnage: recommendedTon,
          formPerimeter: this.shareService.isValidNumber(perimeter),
          hlFactor: this.shareService.isValidNumber(drawKFactor),
          shoulderWidth: this.shareService.isValidNumber(tensileStrength),
        });
        totalTon += recommendedTon;
      } else if ([StampingType.RedrawRect, StampingType.RedrawCir].includes(Number(info.value.subProcessTypeID))) {
        let perimeter = Number(info?.value?.lengthOfCut);
        let tensileStrength = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.ultimateTensileStrength : 0; // Number(info?.value?.shoulderWidth)
        let drawKFactor = 1.15; // Number(info?.value?.hlFactor);

        const theoriticalForcce = this.shareService.isValidNumber((3.14 * perimeter * Number(tensileStrength) * Number(drawKFactor)) / 9806.65);
        const recommendedTon = this.shareService.isValidNumber(Number(theoriticalForcce) * 1.2);
        (manufactureInfo.subProcessFormArray.controls as FormGroup[])[i].patchValue({
          recommendTonnage: recommendedTon,
          formPerimeter: this.shareService.isValidNumber(perimeter),
          hlFactor: this.shareService.isValidNumber(drawKFactor),
          shoulderWidth: this.shareService.isValidNumber(tensileStrength),
        });
        totalTon += recommendedTon;
      } else if (StampingType.Trimming === Number(info.value.subProcessTypeID)) {
        let perimeter = Number(info?.value?.lengthOfCut);
        let shearStrength = manufactureInfo?.materialmasterDatas?.shearingStrength || 0; // Number(info?.value?.shoulderWidth);
        let drawKFactor = 1.15; // Number(info?.value?.hlFactor);
        const theoriticalForcce = this.shareService.isValidNumber((perimeter * Number(shearStrength) * Number(thickness)) / 9806.65);
        const recommendedTon = this.shareService.isValidNumber(Number(theoriticalForcce) * 1.2);
        (manufactureInfo.subProcessFormArray.controls as FormGroup[])[i].patchValue({
          recommendTonnage: recommendedTon,
          formPerimeter: this.shareService.isValidNumber(perimeter),
          hlFactor: this.shareService.isValidNumber(drawKFactor),
          shoulderWidth: this.shareService.isValidNumber(shearStrength),
        });
        totalTon += recommendedTon;
      }
    }

    if (manufactureInfo.isNoOfStartsPierceDirty && manufactureInfo.noOfStartsPierce != null) {
      manufactureInfo.noOfStartsPierce = Number(manufactureInfo.noOfStartsPierce);
    } else {
      let noOfStartsPierce = this._smConfig.getNumberOfStages(noOfStages);
      if (manufactureInfo.noOfStartsPierce != null)
        noOfStartsPierce = this.shareService.checkDirtyProperty('noOfStartsPierce', fieldColorsList) ? manufacturingObj?.noOfStartsPierce : noOfStartsPierce;
      manufactureInfo.noOfStartsPierce = noOfStartsPierce;
    }

    // Req. Bed Size
    // const noOfStage = this._manufacturingConfig._sheetMetalConfig.getNumberOfStage(manufactureInfo);
    // const dieSetLength = Number(manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0].dimUnfoldedY : 0) * 1.5 * manufactureInfo.noOfStartsPierce + 100;
    // let dieSetWidth = 0;
    // if (manufactureInfo.materialInfoList?.length > 0 && manufactureInfo?.materialInfoList[0].typeOfCable == 1) {
    //   dieSetWidth = Number(manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo?.materialInfoList[0].dimUnfoldedX : 0) + 260;
    // } else {
    //   dieSetWidth = Number(manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo?.materialInfoList[0].dimUnfoldedX : 0) * Number(manufactureInfo.noofStroke) + 260;
    // }

    const { recBedLength, recBedWidth, maxDieSetHeight } = this._manufacturingConfig._sheetMetalConfig.getRecommendedBedSizeProgressive(
      unfoldedLength,
      unfoldedWidth,
      thickness,
      height,
      manufactureInfo.noOfStartsPierce,
      stripLayout,
      manufactureInfo.noofStroke
    );

    manufactureInfo.requiredCurrent = recBedLength;
    manufactureInfo.requiredWeldingVoltage = recBedWidth;
    manufactureInfo.recBedSize = Math.round(manufactureInfo.requiredCurrent) + ' x ' + Math.round(manufactureInfo.requiredWeldingVoltage);
    manufactureInfo.platenSizeLength = maxDieSetHeight;

    // selected bed sizes
    manufactureInfo.lengthOfCoated = manufactureInfo?.machineMaster?.bedLength;
    manufactureInfo.widthOfCoated = manufactureInfo?.machineMaster?.bedWidth;
    manufactureInfo.selectedBedSize = manufactureInfo?.machineMaster?.bedLength + ' x ' + manufactureInfo?.machineMaster?.bedWidth;

    if (manufactureInfo.isProcessTimeDirty && manufactureInfo.processTime !== null) {
      manufactureInfo.processTime = Number(manufactureInfo.processTime);
    } else {
      let processTime = 60 / manufactureInfo?.spindleRpm / manufactureInfo.efficiency / manufactureInfo.noofStroke;
      if (manufactureInfo.processTime !== null) {
        processTime = this.shareService.checkDirtyProperty('processTime', fieldColorsList) ? manufacturingObj?.setUpTime : processTime;
      }
      manufactureInfo.processTime = this.shareService.isValidNumber(processTime);
    }

    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(manufactureInfo.processTime / manufactureInfo.efficiency);
      if (manufactureInfo.cycleTime != null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    manufactureInfo.totalTonnageRequired = totalTon;

    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      let setUpTime = 60;
      if (manufactureInfo.setUpTime != null) {
        setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : setUpTime;
      }
      manufactureInfo.setUpTime = setUpTime;
    }

    if (manufactureInfo.isNoOfLowSkilledLaboursDirty && manufactureInfo.noOfLowSkilledLabours !== null) {
      manufactureInfo.noOfLowSkilledLabours = Number(manufactureInfo.noOfLowSkilledLabours);
    } else {
      manufactureInfo.noOfLowSkilledLabours = this.shareService.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList)
        ? manufacturingObj?.noOfLowSkilledLabours
        : this.shareService.isValidNumber(manufactureInfo.noOfLowSkilledLabours);
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
        ((Number(manufactureInfo.skilledLaborRatePerHour) / 60) * (Number(manufactureInfo.setUpTime) * Number(manufactureInfo.noOfSkilledLabours || 1)) +
          (Number(manufactureInfo.machineHourRate) / 60) * Number(manufactureInfo.setUpTime) +
          (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 60) * (Number(manufactureInfo.noOfLowSkilledLabours) * Number(manufactureInfo.setUpTime))) /
          Number(manufactureInfo.lotSize)

        // (((Number(manufactureInfo.noOfLowSkilledLabours) * Number(manufactureInfo.lowSkilledLaborRatePerHour) +
        //   Number(manufactureInfo.noOfSkilledLabours) * Number(manufactureInfo.skilledLaborRatePerHour) +
        //   Number(manufactureInfo.machineHourRate)) /
        //   60) *
        //   Number(manufactureInfo.setUpTime)) /
        //   Number(manufactureInfo.lotSize)
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

    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost !== null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      let inspectionCost = this.shareService.isValidNumber(
        ((Number(manufactureInfo.qaOfInspectorRate) / 60) * Number(manufactureInfo.inspectionTime)) / Math.ceil(Number(manufactureInfo.samplingRate / 100) * Number(manufactureInfo.lotSize))

        // ((Number(manufactureInfo.qaOfInspectorRate) / 60) * Number(manufactureInfo.inspectionTime) * Math.ceil(Number(manufactureInfo.samplingRate / 100) * Number(manufactureInfo.lotSize))) /
        //   Number(manufactureInfo.lotSize)
      );
      if (manufactureInfo.inspectionCost !== null) {
        inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : this.shareService.isValidNumber(inspectionCost);
      }
      manufactureInfo.inspectionCost = inspectionCost;
    }
    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost != null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      const sum = this.shareService.isValidNumber(
        Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
      );

      let yieldCost = this.shareService.isValidNumber(
        (1 - Number(manufactureInfo.yieldPer / 100)) * (Number(manufactureInfo.materialInfo.totalCost) + sum) -
          (1 - Number(manufactureInfo.yieldPer / 100)) * ((Number(manufactureInfo.materialInfo.weight) * Number(manufactureInfo.materialInfo.scrapPrice)) / 1000)
      );
      if (manufactureInfo.yieldCost != null) {
        yieldCost = this.shareService.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : yieldCost;
      }
      manufactureInfo.yieldCost = yieldCost;
    }

    manufactureInfo.directProcessCost = this.shareService.isValidNumber(
      Number(manufactureInfo.directLaborCost) +
        Number(manufactureInfo.directMachineCost) +
        Number(manufactureInfo.directSetUpCost) +
        Number(manufactureInfo.inspectionCost) +
        Number(manufactureInfo.yieldCost)
    );
    return manufactureInfo;
  }

  public calculationForTransferPress(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    manufactureInfo = this.setSheetMetalObjectValues(manufactureInfo, fieldColorsList, manufacturingObj);
    // const materialType = this._smConfig.mapMaterial(manufactureInfo.materialmasterDatas?.materialType?.materialTypeName);

    // Shear strength of material (Mpa)
    // const shearingStrength = this.shareService.isValidNumber(manufactureInfo?.materialmasterDatas?.shearingStrength) || 0;

    // selected tonnage
    manufactureInfo.selectedTonnage = manufactureInfo?.machineMaster?.machineTonnageTons;

    // selected bed sizes
    manufactureInfo.lengthOfCoated = manufactureInfo?.machineMaster?.bedLength;
    manufactureInfo.widthOfCoated = manufactureInfo?.machineMaster?.bedWidth;
    manufactureInfo.selectedBedSize = manufactureInfo?.machineMaster?.bedLength + ' x ' + manufactureInfo?.machineMaster?.bedWidth;

    // selected Shut height
    manufactureInfo.platenSizeWidth = manufactureInfo?.machineMaster?.shutHeightmm;

    // MC/ Strokes per min
    if (manufactureInfo.isspindleRpmDirty && manufactureInfo.spindleRpm !== null) {
      manufactureInfo.spindleRpm = Number(manufactureInfo.spindleRpm);
    } else {
      let selectedSpm = manufactureInfo?.machineMaster?.strokeRateMin || 0;
      if (manufactureInfo.spindleRpm !== null) {
        selectedSpm = this.shareService.checkDirtyProperty('spindleRpm', fieldColorsList) ? manufacturingObj?.spindleRpm : selectedSpm;
      }
      manufactureInfo.spindleRpm = selectedSpm;
    }

    // no of impressions
    if (manufactureInfo.isNoOfStrokesDirty && manufactureInfo.noofStroke != null) {
      manufactureInfo.noofStroke = Number(manufactureInfo.noofStroke);
    } else {
      const stripLayout = manufactureInfo?.materialInfoList && manufactureInfo?.materialInfoList?.length > 0 ? manufactureInfo?.materialInfoList[0].typeOfCable : 1;
      if (manufactureInfo.noofStroke != null) {
        manufactureInfo.noofStroke = this.shareService.checkDirtyProperty('noofStroke', fieldColorsList) ? manufacturingObj?.noofStroke : stripLayout;
      }
    }

    let maxTon = 0;
    if (manufactureInfo.isQaInspectorRateDirty && manufactureInfo.qaOfInspectorRate != null) {
      manufactureInfo.qaOfInspectorRate = Number(manufactureInfo.qaOfInspectorRate);
    } else {
      const processIndex = manufactureInfo?.processInfoList?.findIndex((x) => x.processTypeID === ProcessType.Progressive);
      if (processIndex >= 0 && processIndex != manufactureInfo?.processInfoList?.length - 1) {
        manufactureInfo.qaOfInspectorRate = 0;
      }
      manufactureInfo.qaOfInspectorRate = this.shareService.checkDirtyProperty('qaOfInspectorRate', fieldColorsList)
        ? manufacturingObj?.qaOfInspectorRate
        : this.shareService.isValidNumber(manufactureInfo.qaOfInspectorRate);
    }

    if (manufactureInfo.isinspectionTimeDirty && manufactureInfo.inspectionTime != null) {
      manufactureInfo.inspectionTime = Number(manufactureInfo.inspectionTime);
    } else {
      let inspectionTime =
        manufactureInfo?.partComplexity == PartComplexity.Low ? 2 : manufactureInfo?.partComplexity == PartComplexity.Medium ? 5 : manufactureInfo?.partComplexity == PartComplexity.High ? 10 : 0;
      if (manufactureInfo.inspectionTime != null) {
        const processIndex = manufactureInfo?.processInfoList?.findIndex((x) => x.processTypeID === ProcessType.Progressive);
        if (processIndex >= 0 && processIndex != manufactureInfo?.processInfoList?.length - 1) {
          inspectionTime = 0;
        }
        inspectionTime = this.shareService.checkDirtyProperty('inspectionTime', fieldColorsList) ? manufacturingObj?.inspectionTime : inspectionTime;
      }
      manufactureInfo.inspectionTime = inspectionTime;
    }

    let noOfFeatures = 0;
    let drawKFactor = 0;
    const thickness = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.dimUnfoldedZ;
    for (let i = 0; i < manufactureInfo.subProcessFormArray?.controls?.length; i++) {
      const info = manufactureInfo.subProcessFormArray?.controls[i];
      if (
        [StampingType.ShallowDrawRect, StampingType.RedrawRect, StampingType.ShallowDrawCir, StampingType.RedrawCir, StampingType.Piercing, StampingType.Trimming, StampingType.Forming].includes(
          Number(info?.value?.subProcessTypeID)
        )
      ) {
        noOfFeatures++;
      }

      manufactureInfo.bendingLineLength = info?.value?.bendingLineLength;
      manufactureInfo.bendingCoeffecient = 1.33;
      manufactureInfo.shoulderWidth = info?.value?.shoulderWidth; // manufactureInfo.materialmasterDatas.shearingStrength
      manufactureInfo.noOfbends = info?.value?.noOfBends;
      manufactureInfo.formPerimeter = info?.value?.formPerimeter;
      manufactureInfo.formLength = Number(info?.value?.formLength);
      manufactureInfo.formHeight = Number(info?.value?.formHeight);

      if ([StampingType.ShallowDrawRect, StampingType.ShallowDrawCir].includes(Number(info.value.subProcessTypeID))) {
        let perimeter = Number(info?.value?.lengthOfCut);
        let tensileStrength = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.ultimateTensileStrength : 0; // Number(info?.value?.shoulderWidth);
        drawKFactor = 1.15; // Number(info?.value?.hlFactor);

        // if (perimeter === 0 || perimeter === null) {
        //   perimeter = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0].dimUnfoldedX : 0;
        // }
        // if (!info?.value?.hlFactor || info?.value?.hlFactor === 0) {
        //   drawKFactor = 0; // this.materialInfoList?.length > 0 ? this.materialInfoList[0].avgkfactor : 0,
        // }
        // if (!info?.value?.shoulderWidth || info?.value?.shoulderWidth === 0) {
        //   tensileStrength = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0].ultimateTensileStrength : 0;
        // }
        const theoriticalForcce = this.shareService.isValidNumber((3.14 * perimeter * Number(thickness) * Number(tensileStrength) * Number(drawKFactor)) / 9806.65);
        const recommendedTon = this.shareService.isValidNumber(Number(theoriticalForcce) * 1.2);
        (manufactureInfo.subProcessFormArray.controls as FormGroup[])[i].patchValue({
          recommendTonnage: recommendedTon,
          formPerimeter: this.shareService.isValidNumber(perimeter),
          hlFactor: this.shareService.isValidNumber(drawKFactor),
          shoulderWidth: this.shareService.isValidNumber(tensileStrength),
        });
        maxTon = maxTon < recommendedTon ? recommendedTon : maxTon;
      } else if ([StampingType.RedrawRect, StampingType.RedrawCir].includes(Number(info.value.subProcessTypeID))) {
        let perimeter = Number(info?.value?.lengthOfCut);
        drawKFactor = drawKFactor || 1.15;
        let tensileStrength = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.ultimateTensileStrength : 0; // Number(info?.value?.shoulderWidth)
        const theoriticalForcce = this.shareService.isValidNumber((3.14 * perimeter * Number(tensileStrength) * Number(drawKFactor)) / 9806.65);
        const recommendedTon = this.shareService.isValidNumber(Number(theoriticalForcce) * 1.2);
        (manufactureInfo.subProcessFormArray.controls as FormGroup[])[i].patchValue({
          recommendTonnage: recommendedTon,
          formPerimeter: this.shareService.isValidNumber(perimeter),
          hlFactor: this.shareService.isValidNumber(drawKFactor),
          shoulderWidth: this.shareService.isValidNumber(tensileStrength),
        });
        maxTon = maxTon < recommendedTon ? recommendedTon : maxTon;
      } else if ([StampingType.Piercing, StampingType.BlankingPunching, StampingType.Compound].includes(Number(info.value.subProcessTypeID))) {
        let perimeter = Number(info?.value?.lengthOfCut);
        let shearStrength = manufactureInfo?.materialmasterDatas?.shearingStrength;
        const theoriticalForcce = this.shareService.isValidNumber((perimeter * Number(shearStrength) * Number(thickness)) / 9806.65);
        const recommendedTon = this.shareService.isValidNumber(Number(theoriticalForcce) * 1.2);
        (manufactureInfo.subProcessFormArray.controls as FormGroup[])[i].patchValue({
          recommendTonnage: recommendedTon,
          lengthOfCut: this.shareService.isValidNumber(perimeter),
          hlFactor: this.shareService.isValidNumber(drawKFactor),
          shoulderWidth: this.shareService.isValidNumber(shearStrength),
        });
        maxTon = maxTon < recommendedTon ? recommendedTon : maxTon;
      } else if (StampingType.Trimming === Number(info.value.subProcessTypeID)) {
        let perimeter = Number(info?.value?.lengthOfCut);
        drawKFactor = drawKFactor || 1.15;
        let shearStrength = manufactureInfo?.materialmasterDatas?.shearingStrength || 0; // Number(info?.value?.shoulderWidth);
        const theoriticalForcce = this.shareService.isValidNumber((perimeter * Number(shearStrength) * Number(thickness)) / 9806.65);
        const recommendedTon = this.shareService.isValidNumber(Number(theoriticalForcce) * 1.2);
        (manufactureInfo.subProcessFormArray.controls as FormGroup[])[i].patchValue({
          recommendTonnage: recommendedTon,
          formPerimeter: this.shareService.isValidNumber(perimeter),
          hlFactor: this.shareService.isValidNumber(drawKFactor),
          shoulderWidth: this.shareService.isValidNumber(shearStrength),
        });
        maxTon = maxTon < recommendedTon ? recommendedTon : maxTon;
      } else if (StampingType.Bending === Number(info.value.subProcessTypeID)) {
        const axisWiseLength = this._manufacturingConfig._sheetMetalConfig.getBendingEntriesSumByAxis();

        let bendLength = Number(info?.value?.bendingLineLength);
        let yieldStrength = manufactureInfo?.materialmasterDatas?.yieldStrength;
        let bendAngle = 90; // Number(info?.value?.blankArea);
        let bendKFactor = 0; //Number(info?.value?.hlFactor);

        if (bendLength === 0 || bendLength === null) {
          bendLength = axisWiseLength[0]?.lengthSum || 0;
        }

        if (bendKFactor === 0 || bendKFactor === null) {
          bendKFactor = 1.0; // default
          if (bendAngle === 90) {
            bendKFactor = 1.33;
          } else if (bendAngle === 60) {
            bendKFactor = 1.2;
          } else if (bendAngle === 45) {
            bendKFactor = 1.1;
          } else if (bendAngle === 30) {
            bendKFactor = 0.9;
          }
        }
        const theoriticalForcce = this.shareService.isValidNumber((bendLength * Number(yieldStrength) * Number(bendKFactor) * Number(thickness)) / 9806.65);
        const recommendedTon = this.shareService.isValidNumber(Number(theoriticalForcce) * 1.2);
        (manufactureInfo.subProcessFormArray.controls as FormGroup[])[i].patchValue({
          recommendTonnage: recommendedTon,
          bendingLineLength: this.shareService.isValidNumber(bendLength),
          hlFactor: this.shareService.isValidNumber(bendKFactor),
          shoulderWidth: this.shareService.isValidNumber(yieldStrength),
          blankArea: this.shareService.isValidNumber(bendAngle),
        });
        // const calculationRes = this.calculationForBending(bendingInfo, fieldColorsList, manufacturingObj);
        maxTon = maxTon < recommendedTon ? recommendedTon : maxTon;
      } else if ([StampingType.Forming, StampingType.Coining].includes(Number(info.value.subProcessTypeID))) {
        const formingInfo = Object.assign({}, manufactureInfo);
        const calculationRes = this.calculationForForming(formingInfo, fieldColorsList, manufacturingObj);
        if (calculationRes) {
          maxTon = calculationRes?.recommendTonnage > maxTon ? calculationRes?.recommendTonnage : maxTon;
          (manufactureInfo.subProcessFormArray.controls as FormGroup[])[i].patchValue({
            recommendTonnage: calculationRes?.recommendTonnage,
            blankArea: calculationRes?.blankArea,
            formingForce: calculationRes?.formingForce,
          });
        }
      } else if ([StampingType.Drawing].includes(Number(info.value.subProcessTypeID))) {
        const drawingInfo = Object.assign({}, manufactureInfo);
        const calculationRes = this.calculationForDrawing(drawingInfo, fieldColorsList, manufacturingObj);
        if (calculationRes) {
          maxTon = calculationRes?.recommendTonnage > maxTon ? calculationRes?.recommendTonnage : maxTon;
          (manufactureInfo.subProcessFormArray.controls as FormGroup[])[i].patchValue({ hlFactor: calculationRes?.hlFactor });
          (manufactureInfo.subProcessFormArray.controls as FormGroup[])[i].patchValue({ recommendTonnage: calculationRes?.recommendTonnage });
        }
      }
    }

    manufactureInfo.recommendTonnage = maxTon;
    manufactureInfo.totalTonnageRequired = maxTon;

    let maxDieLength,
      maxDieWidth,
      maxDieHeight = 0;
    let noOfStages = manufactureInfo.subProcessFormArray?.controls?.length || 0;
    maxDieLength = manufactureInfo.materialInfoList[0]?.dimUnfoldedX * noOfStages + 120 * (noOfStages + 1);
    maxDieWidth = manufactureInfo.materialInfoList[0]?.dimUnfoldedY + 200;
    maxDieHeight = manufactureInfo.materialInfoList[0]?.dimUnfoldedZ * 2 + 100;
    manufactureInfo.requiredCurrent = maxDieLength;
    manufactureInfo.requiredWeldingVoltage = maxDieWidth;
    manufactureInfo.platenSizeLength = maxDieHeight;

    // Req Bed Size
    manufactureInfo.recBedSize = Math.round(manufactureInfo.requiredCurrent) + ' x ' + Math.round(manufactureInfo.requiredWeldingVoltage);

    // Projected part length Lp (mm)
    let projectedPartLength = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.dimX ? manufactureInfo.materialInfoList[0]?.dimX : 0;

    // Number of stages
    if (manufactureInfo.isNoOfStartsPierceDirty && manufactureInfo.noOfStartsPierce !== null) {
      manufactureInfo.noOfStartsPierce = Number(manufactureInfo.noOfStartsPierce);
    } else {
      let noOfStages = this._smConfig.getNumberOfStagesForTransferPress(manufactureInfo);
      if (manufactureInfo.noOfStartsPierce !== null) {
        noOfStages = this.shareService.checkDirtyProperty('noOfStartsPierce', fieldColorsList) ? manufacturingObj?.noOfStartsPierce : noOfStages;
      }
      manufactureInfo.noOfStartsPierce = noOfStages;
    }

    // Number of Features
    if (manufactureInfo.isNoOfHitsRequiredDirty && manufactureInfo.noOfHitsRequired !== null) {
      manufactureInfo.noOfHitsRequired = Number(manufactureInfo.noOfHitsRequired);
    } else {
      if (manufactureInfo.noOfHitsRequired !== null) {
        noOfFeatures = this.shareService.checkDirtyProperty('noOfHitsRequired', fieldColorsList) ? manufacturingObj?.noOfHitsRequired : noOfFeatures;
      }
      manufactureInfo.noOfHitsRequired = noOfFeatures;
    }

    // Clearences allowance C (mm)
    let clearanceAllowance = 150;
    if (manufactureInfo.recommendTonnage <= 100) {
      clearanceAllowance = 75;
    } else if (manufactureInfo.recommendTonnage <= 150) {
      clearanceAllowance = 100;
    }

    // Blank Range
    let blankRange = '';
    if (clearanceAllowance <= 500) {
      blankRange = '<=500';
    } else if (clearanceAllowance <= 1000) {
      blankRange = '500-1000';
    } else if (clearanceAllowance <= 1500) {
      blankRange = '1000-1500';
    } else {
      blankRange = 'Out of range';
    }

    const transferParams = this._smConfig.getTransferPressParameters(blankRange);

    // Transfer distance D_travel (mm)
    let transferDistance = projectedPartLength + clearanceAllowance;

    // Avg robot speed V_avg (mm/s) (mm)
    let avgRobotSpeed = transferParams ? transferParams.vRobot : 0;

    // Pick-up time T_Pick (Sec)
    const pickUpTime = 0.3; // Default value
    const placeTime = 0.3; // Default value

    // Load distance D_load (Sec)
    let loadDistance = projectedPartLength + 200;

    // Load speed V_load (mm/s)
    let loadSpeed = transferParams ? transferParams.vLoading : 0;

    const gripTime = 0.2; // Default value

    // Unload distance D_Unload (mm)
    let unLoadDistance = projectedPartLength + 200;

    // Unload speed V_unload (mm/sec)
    let unLoadSpeed = transferParams ? transferParams.vUnloading : 0;

    // Release time T_release (sec)
    const releaseTime = 0.2; // Default value

    // Draw depth h (mm)
    let drawDepth = 1; // // TODO: need to CAD input

    // Cushion constant K_c
    // const cushionConstant = 0.15; // Default value

    const lubeTime = 0.2; // Default value
    const saftyDelay = 0.05; // Default value
    const sensorDelay = 0.05; // TODO: Default value

    // Stroke time T_stroke (Sec)
    const strokeTime = 60 / manufactureInfo.spindleRpm;

    // Robot transfer time T_robot (Sec)
    const robotTransferTime = transferDistance / avgRobotSpeed + pickUpTime + placeTime;

    // Load time T_load (Sec)
    const loadingTime = loadDistance / loadSpeed + gripTime;
    // Unload time T_Unloading (Sec)
    const unLoadingTime = unLoadDistance / unLoadSpeed + releaseTime;

    // Cushion time T_Cushion (Sec)
    const cushionTime = this.shareService.isValidNumber(Math.min(0.15 * Math.sqrt(drawDepth / thickness), 0.5));

    // Delay time (Sec)
    const delayTime = this.shareService.isValidNumber(lubeTime + saftyDelay + sensorDelay);

    // Cycle Time (sec) :
    const cycleTime = this.shareService.isValidNumber(strokeTime + robotTransferTime + loadingTime + unLoadingTime + cushionTime + delayTime);

    // process time
    if (manufactureInfo.isProcessTimeDirty && manufactureInfo.processTime !== null) {
      manufactureInfo.processTime = Number(manufactureInfo.processTime);
    } else {
      let processTime = this.shareService.isValidNumber(manufactureInfo.noOfStartsPierce + cycleTime / manufactureInfo.noofStroke);
      if (manufactureInfo.cycleTime !== null) {
        processTime = this.shareService.checkDirtyProperty('processTime', fieldColorsList) ? manufacturingObj?.processTime : processTime;
      }
      manufactureInfo.processTime = processTime;
    }

    // total cycle time
    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(manufactureInfo.processTime / manufactureInfo.efficiency);
      if (manufactureInfo.cycleTime != null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime !== null) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      let setUpTime = 220;
      if (manufactureInfo.totalTonnageRequired <= 200) setUpTime = 90;
      else if (manufactureInfo.totalTonnageRequired <= 400) setUpTime = 120;
      else if (manufactureInfo.totalTonnageRequired <= 630) setUpTime = 150;
      else if (manufactureInfo.totalTonnageRequired <= 800) setUpTime = 180;

      // manufactureInfo.machineMaster.setupTime ? manufactureInfo.machineMaster.setupTime : 0;
      if (manufactureInfo.setUpTime !== null) {
        setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : setUpTime;
      }
      manufactureInfo.setUpTime = setUpTime;
    }

    // # of Direct Labour
    if (manufactureInfo.isNoOfLowSkilledLaboursDirty && manufactureInfo.noOfLowSkilledLabours != null) {
      manufactureInfo.noOfLowSkilledLabours = Number(manufactureInfo.noOfLowSkilledLabours);
    } else {
      let noOfLowSkilledLabours = 0;
      if (manufactureInfo.semiAutoOrAuto === 3) {
        noOfLowSkilledLabours = 1;
      } else if (manufactureInfo.semiAutoOrAuto === 2) {
        noOfLowSkilledLabours = 0.5;
      } else if (manufactureInfo.semiAutoOrAuto === 1) {
        noOfLowSkilledLabours = 0.33333;
      }
      if (manufactureInfo.noOfLowSkilledLabours != null) {
        noOfLowSkilledLabours = this.shareService.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList) ? manufacturingObj?.noOfLowSkilledLabours : noOfLowSkilledLabours;
      }
      manufactureInfo.noOfLowSkilledLabours = noOfLowSkilledLabours;
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
      let directSetUpCost =
        ((manufactureInfo.skilledLaborRatePerHour / 60) * (manufactureInfo.setUpTime * (manufactureInfo.noOfSkilledLabours || 1)) +
          (manufactureInfo.machineHourRate / 60) * manufactureInfo.setUpTime) /
          manufactureInfo.lotSize || 0;
      directSetUpCost = this.shareService.isValidNumber(directSetUpCost);
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

    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost !== null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      let inspectionCost = this.shareService.isValidNumber(
        ((Number(manufactureInfo.qaOfInspectorRate) / 60) * Number(manufactureInfo.inspectionTime) * Math.ceil(Number(manufactureInfo.samplingRate / 100) * Number(manufactureInfo.lotSize))) /
          Number(manufactureInfo.lotSize)
      );
      if (manufactureInfo.inspectionCost !== null) {
        inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : this.shareService.isValidNumber(inspectionCost);
      }
      manufactureInfo.inspectionCost = inspectionCost;
    }
    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost != null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      const sum = this.shareService.isValidNumber(
        Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
      );

      let yieldCost = this.shareService.isValidNumber(
        (1 - Number(manufactureInfo.yieldPer / 100)) * (Number(manufactureInfo.materialInfo.totalCost) + sum) -
          (1 - Number(manufactureInfo.yieldPer / 100)) * ((Number(manufactureInfo.materialInfo.weight) * Number(manufactureInfo.materialInfo.scrapPrice)) / 1000)
      );
      if (manufactureInfo.yieldCost != null) {
        yieldCost = this.shareService.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : yieldCost;
      }
      manufactureInfo.yieldCost = yieldCost;
    }

    manufactureInfo.directProcessCost = this.shareService.isValidNumber(
      Number(manufactureInfo.directLaborCost) +
        Number(manufactureInfo.directMachineCost) +
        Number(manufactureInfo.directSetUpCost) +
        Number(manufactureInfo.inspectionCost) +
        Number(manufactureInfo.yieldCost)
    );
    return manufactureInfo;
  }

  // public calculationForstampingStage(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): Observable<ProcessInfoDto> {
  public calculationForstampingStage(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto, currentPart?: any): ProcessInfoDto {
    manufactureInfo = this.setSheetMetalObjectValues(manufactureInfo, fieldColorsList, manufacturingObj);
    const filteredInsProcesses = manufactureInfo.processInfoList?.filter((p) => ![ProcessType.Deburring, ProcessType.VisualInspection, ProcessType.Cleaning].includes(p.processTypeID)) || [];

    let totalTon = 0;
    // const totalCycleTime = 0;
    manufactureInfo.density = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.density : 0;
    manufactureInfo.noOfInsert = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.noOfInserts : 0;
    manufactureInfo.grossWeight = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.grossWeight : 0;
    manufactureInfo.wallAverageThickness = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.wallAverageThickness : 0;
    manufactureInfo.noOfCavities = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.noOfCavities : 0;
    manufactureInfo.netMaterialCost = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.netMatCost : 0;
    manufactureInfo.netPartWeight = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.netWeight : 0;
    manufactureInfo.rawmaterialCost = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.netMatCost : 0;
    manufactureInfo.projArea = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.runnerProjectedArea : 0;
    manufactureInfo.partProjArea = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.partProjectedArea : 0;

    const thickness = (manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.dimUnfoldedZ) || 0;
    const unfoldedLength = (manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.dimUnfoldedX) || 0;
    const unfoldedWidth = (manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.dimUnfoldedY) || 0;
    const height = (manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.partHeight) || 0;

    const { recBedLength, recBedWidth, maxDieSetHeight } = this._manufacturingConfig._sheetMetalConfig.getRecommendedBedSizeStaging(unfoldedLength, unfoldedWidth, thickness, height);

    // Req. Bed Size
    // const dieSetLength = Number(manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.dimUnfoldedX : 0) * 1.5 + 100;
    // const dieSetWidth = Number(manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.dimUnfoldedY : 0) + 260;
    manufactureInfo.requiredCurrent = recBedLength;
    manufactureInfo.requiredWeldingVoltage = recBedWidth;
    manufactureInfo.recBedSize = Math.round(manufactureInfo.requiredCurrent) + ' x ' + Math.round(manufactureInfo.requiredWeldingVoltage);

    // selected bed sizes
    manufactureInfo.lengthOfCoated = manufactureInfo?.machineMaster?.bedLength;
    manufactureInfo.widthOfCoated = manufactureInfo?.machineMaster?.bedWidth;
    manufactureInfo.selectedBedSize = manufactureInfo?.machineMaster?.bedLength + ' x ' + manufactureInfo?.machineMaster?.bedWidth;

    // selected shut height
    manufactureInfo.platenSizeWidth = manufactureInfo?.machineMaster?.shutHeightmm;

    if (manufactureInfo.isliquidTempDirty && manufactureInfo.liquidTemp !== null) {
      manufactureInfo.liquidTemp = Number(manufactureInfo.liquidTemp);
    } else {
      let liquidTemp = manufacturingObj?.liquidTemp || 1;
      if (manufactureInfo.liquidTemp !== null) {
        liquidTemp = this.shareService.checkDirtyProperty('liquidTemp', fieldColorsList) ? manufacturingObj?.liquidTemp : liquidTemp;
      }
      manufactureInfo.liquidTemp = liquidTemp;
    }

    // Selected SPM
    if (manufactureInfo.isspindleRpmDirty && manufactureInfo.spindleRpm !== null) {
      manufactureInfo.spindleRpm = Number(manufactureInfo.spindleRpm);
    } else {
      let selectedSpm = manufactureInfo?.machineMaster?.strokeRateMin || manufacturingObj?.spindleRpm || 0;

      if (manufactureInfo.spindleRpm !== null) {
        selectedSpm = this.shareService.checkDirtyProperty('spindleRpm', fieldColorsList) ? manufacturingObj?.spindleRpm : this.shareService.isValidNumber(selectedSpm);
      }
      manufactureInfo.spindleRpm = this.shareService.isValidNumber(selectedSpm);
    }

    // recommended shut height
    // if (thickness <= 2) {
    //   manufactureInfo.platenSizeLength = 427;
    // } else if (thickness <= 4) {
    //   manufactureInfo.platenSizeLength = 447;
    // } else if (thickness <= 5) {
    //   manufactureInfo.platenSizeLength = 487;
    // }
    manufactureInfo.platenSizeLength = maxDieSetHeight;

    if (manufactureInfo.isNoOfStrokesDirty && manufactureInfo.noofStroke != null) {
      manufactureInfo.noofStroke = Number(manufactureInfo.noofStroke);
    } else {
      // if (manufactureInfo.noofStroke != null) {
      manufactureInfo.noofStroke = this.shareService.checkDirtyProperty('noofStroke', fieldColorsList) ? manufacturingObj?.noofStroke : manufactureInfo.noofStroke || manufacturingObj?.noofStroke;
      // }
    }

    if (manufactureInfo.isQaInspectorRateDirty && manufactureInfo.qaOfInspectorRate != null) {
      manufactureInfo.qaOfInspectorRate = Number(manufactureInfo.qaOfInspectorRate);
    } else {
      const sorted = manufactureInfo?.processInfoList?.sort((a, b) => a.processInfoId - b.processInfoId);
      const processIndex = sorted?.findIndex((x) => x.processInfoId === manufactureInfo.processInfoId);
      // let processIndex = manufactureInfo?.processInfoList?.findIndex(x => x.processTypeID === ProcessType.Stage);
      if (processIndex >= 0 && processIndex !== filteredInsProcesses.length - 1) {
        manufactureInfo.qaOfInspectorRate = 0;
      }
      manufactureInfo.qaOfInspectorRate = this.shareService.checkDirtyProperty('qaOfInspectorRate', fieldColorsList)
        ? manufacturingObj?.qaOfInspectorRate
        : this.shareService.isValidNumber(manufactureInfo.qaOfInspectorRate);
    }

    if (manufactureInfo.isinspectionTimeDirty && manufactureInfo.inspectionTime != null) {
      manufactureInfo.inspectionTime = Number(manufactureInfo.inspectionTime);
    } else {
      let inspectionTime =
        manufactureInfo?.partComplexity == PartComplexity.Low ? 2 : manufactureInfo?.partComplexity == PartComplexity.Medium ? 5 : manufactureInfo?.partComplexity == PartComplexity.High ? 10 : 0;
      // if (manufactureInfo.inspectionTime != null) {
      //     let processIndex = manufactureInfo?.processInfoList?.findIndex(x => x.processTypeID === ProcessType.Stage);
      //     if (processIndex >= 0 && processIndex != manufactureInfo?.processInfoList?.length - 1) {
      //         inspectionTime = 0;
      //     }
      //     inspectionTime = this.shareService.checkDirtyProperty('inspectionTime', fieldColorsList) ? manufacturingObj?.inspectionTime : inspectionTime;
      // }
      if (manufactureInfo.inspectionTime !== null) {
        const sorted = manufactureInfo?.processInfoList?.sort((a, b) => a.processInfoId - b.processInfoId);
        const processIndex = sorted?.findIndex((x) => x.processInfoId === manufactureInfo.processInfoId);
        if (processIndex >= 0 && processIndex !== filteredInsProcesses.length - 1) {
          inspectionTime = 0;
        }
        inspectionTime = this.shareService.checkDirtyProperty('inspectionTime', fieldColorsList) ? manufacturingObj?.inspectionTime : inspectionTime;
      }
      manufactureInfo.inspectionTime = inspectionTime;
    }

    if (manufactureInfo.isLoadingTimeDirty && manufactureInfo.loadingTime != null) {
      manufactureInfo.loadingTime = Number(manufactureInfo.loadingTime);
    } else {
      let loadingTime = 30;
      if (manufactureInfo.netPartWeight < 2500) {
        loadingTime = 4;
      } else if (manufactureInfo.netPartWeight > 2500 && manufactureInfo.netPartWeight < 5000) {
        loadingTime = 8;
      } else if (manufactureInfo.netPartWeight > 5000 && manufactureInfo.netPartWeight < 27000) {
        loadingTime = 15;
      }

      if (manufactureInfo.loadingTime != null) {
        loadingTime = this.shareService.checkDirtyProperty('loadingTime', fieldColorsList) ? manufacturingObj?.loadingTime : loadingTime;
      }
      manufactureInfo.loadingTime = loadingTime;
    }

    if (manufactureInfo.isProcessTimeDirty && manufactureInfo.processTime != null) {
      manufactureInfo.processTime = Number(manufactureInfo.processTime);
    } else {
      let processTime = this.shareService.isValidNumber(60 / manufactureInfo.spindleRpm / manufactureInfo.noofStroke);
      if (manufactureInfo.processTime != null) {
        processTime = this.shareService.checkDirtyProperty('processTime', fieldColorsList) ? manufacturingObj?.processTime : processTime;
      }
      manufactureInfo.processTime = processTime;
    }

    if (manufactureInfo.isUnloadingTimeDirty && manufactureInfo.unloadingTime != null) {
      manufactureInfo.unloadingTime = Number(manufactureInfo.unloadingTime);
    } else {
      let unloadingTime = 30;
      if (manufactureInfo.netPartWeight < 2500) {
        unloadingTime = 4;
      } else if (manufactureInfo.netPartWeight > 2500 && manufactureInfo.netPartWeight < 5000) {
        unloadingTime = 8;
      } else if (manufactureInfo.netPartWeight > 5000 && manufactureInfo.netPartWeight < 27000) {
        unloadingTime = 15;
      }

      if (manufactureInfo.unloadingTime != null) {
        unloadingTime = this.shareService.checkDirtyProperty('unloadingTime', fieldColorsList) ? manufacturingObj?.unloadingTime : unloadingTime;
      }
      manufactureInfo.unloadingTime = unloadingTime;
    }

    // Handling Time
    if (manufactureInfo.isRotationTimeDirty && manufactureInfo.rotationTime != null) {
      manufactureInfo.rotationTime = Number(manufactureInfo.rotationTime);
    } else {
      let handlingTime = manufactureInfo.loadingTime + manufactureInfo.unloadingTime;
      if (manufactureInfo.rotationTime != null) {
        handlingTime = this.shareService.checkDirtyProperty('rotationTime', fieldColorsList) ? manufacturingObj?.rotationTime : handlingTime;
      }
      manufactureInfo.rotationTime = this.shareService.isValidNumber(handlingTime);
    }

    for (let i = 0; i < manufactureInfo.subProcessFormArray?.controls?.length; i++) {
      const info = manufactureInfo.subProcessFormArray?.controls[i];
      const subProcessTypeID = Number(info.value.subProcessTypeID || manufactureInfo.subProcessTypeID);
      // manufactureInfo.bendingLineLength = info?.value?.bendingLineLength;
      manufactureInfo.bendingCoeffecient = 1.33;
      manufactureInfo.shoulderWidth = info?.value?.shoulderWidth;
      manufactureInfo.noOfbends = info?.value?.noOfBends;
      // manufactureInfo.formPerimeter = info?.value?.formPerimeter || manufactureInfo.formPerimeter;
      manufactureInfo.formLength = Number(info?.value?.formLength);
      manufactureInfo.formHeight = Number(info?.value?.formHeight);
      manufactureInfo.blankArea = Number(info?.value?.blankArea);

      if (manufactureInfo.isLengthOfCutDirty && manufactureInfo.lengthOfCut !== null) {
        manufactureInfo.lengthOfCut = Number(manufactureInfo.lengthOfCut);
      } else {
        let lengthOfCut = Number(info?.value?.lengthOfCut || manufactureInfo?.lengthOfCut);
        if (manufactureInfo.lengthOfCut !== null) {
          lengthOfCut = this.shareService.checkDirtyProperty('lengthOfCut', fieldColorsList) ? manufacturingObj?.lengthOfCut : lengthOfCut;
        }
        manufactureInfo.lengthOfCut = lengthOfCut;
      }
      info.value.lengthOfCut = manufactureInfo.lengthOfCut;

      if (manufactureInfo.isBendingLineLengthDirty && manufactureInfo.bendingLineLength !== null) {
        manufactureInfo.bendingLineLength = Number(manufactureInfo.bendingLineLength);
      } else {
        let bendingLineLength = Number(info?.value?.bendingLineLength || manufactureInfo?.bendingLineLength);
        if (manufactureInfo.bendingLineLength !== null) {
          bendingLineLength = this.shareService.checkDirtyProperty('bendingLineLength', fieldColorsList) ? manufacturingObj?.bendingLineLength : bendingLineLength;
        }
        manufactureInfo.bendingLineLength = bendingLineLength;
      }
      info.value.bendingLineLength = manufactureInfo.bendingLineLength;

      if (manufactureInfo.isFormPerimeterDirty && manufactureInfo.formPerimeter !== null) {
        manufactureInfo.formPerimeter = Number(manufactureInfo.formPerimeter);
      } else {
        let formPerimeter = Number(info?.value?.formPerimeter || manufactureInfo?.formPerimeter);
        if (manufactureInfo.formPerimeter !== null) {
          formPerimeter = this.shareService.checkDirtyProperty('formPerimeter', fieldColorsList) ? manufacturingObj?.formPerimeter : formPerimeter;
        }
        manufactureInfo.formPerimeter = formPerimeter;
      }
      info.value.formPerimeter = manufactureInfo.formPerimeter;

      if ([StampingType.BlankingPunching, StampingType.Piercing, StampingType.Compound].includes(subProcessTypeID)) {
        const thickness = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.dimUnfoldedZ;
        const lengthOfCut = Number(info?.value?.lengthOfCut || manufactureInfo?.lengthOfCut);
        const theoriticalForcce = this.shareService.isValidNumber((lengthOfCut * Number(thickness) * Number(manufactureInfo.materialmasterDatas.shearingStrength)) / 9810);
        const recommendedTon = this.shareService.isValidNumber(Number(theoriticalForcce) * 1.25);
        (manufactureInfo.subProcessFormArray.controls as FormGroup[])[i].patchValue({ recommendTonnage: recommendedTon, lengthOfCut: lengthOfCut });
        totalTon += recommendedTon;
      } else if ([StampingType.Bending].includes(subProcessTypeID)) {
        // this.calculationForBending(manufactureInfo, fieldColorsList, manufacturingObj)
        //     .pipe(takeUntil(this.unsubscribe$))
        //     .subscribe((calculationRes: any) => {
        //         if (calculationRes) {
        //             totalTon += calculationRes?.recommendTonnage;
        //             totalCycleTime += calculationRes?.cycleTime;
        //             (manufactureInfo.subProcessFormArray.controls as FormGroup[])[i].patchValue({ recommendTonnage: calculationRes?.recommendTonnage });
        //         }
        //     });
        const recommendTonnage = this._manufacturingConfig._sheetMetalConfig.getBendingTonnage(manufactureInfo?.materialInfoList, manufactureInfo, currentPart); // this.calculationForBending(manufactureInfo, fieldColorsList, manufacturingObj);
        if (recommendTonnage) {
          totalTon += recommendTonnage;
          // totalCycleTime += calculationRes?.cycleTime;
          (manufactureInfo.subProcessFormArray.controls as FormGroup[])[i].patchValue({ recommendTonnage: recommendTonnage });
        }
      } else if ([StampingType.Forming, StampingType.Coining, StampingType.Restrike].includes(subProcessTypeID)) {
        const thickness = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.dimUnfoldedZ;
        const blankArea = this.shareService.isValidNumber(Number(thickness) * Number(manufactureInfo.formPerimeter));
        const formingForce = this.shareService.isValidNumber(
          0.5 * Number(blankArea) * ((manufactureInfo.materialmasterDatas.yieldStrength + manufactureInfo.materialmasterDatas.tensileStrength) / 10000)
        );
        const blankHoldingForce = this.shareService.isValidNumber(formingForce / 3);
        const theoriticalForcce = Number(formingForce) + Number(blankHoldingForce);
        manufactureInfo.recommendTonnage = Number(theoriticalForcce) * 1.25;

        totalTon += manufactureInfo.recommendTonnage;

        // // form perimeter
        // if (manufactureInfo.isFormPerimeterDirty && manufactureInfo.formPerimeter !== null) {
        //   manufactureInfo.formPerimeter = Number(manufactureInfo.formPerimeter);
        // } else {
        //   let formPerimeter = this.shareService.isValidNumber(manufactureInfo.formPerimeter);
        //   if (manufactureInfo.formPerimeter !== null) {
        //     formPerimeter = this.shareService.checkDirtyProperty('formPerimeter', fieldColorsList) ? manufacturingObj?.formPerimeter : formPerimeter;
        //   }
        //   manufactureInfo.formPerimeter = this.shareService.isValidNumber(formPerimeter);
        // }

        // blank Area
        if (manufactureInfo.isBlankAreaDirty && manufactureInfo.blankArea !== null) {
          manufactureInfo.blankArea = Number(manufactureInfo.blankArea);
        } else {
          let blankAr = this.shareService.isValidNumber(blankArea);
          if (manufactureInfo.blankArea !== null) {
            blankAr = this.shareService.checkDirtyProperty('blankArea', fieldColorsList) ? manufacturingObj?.blankArea : blankAr;
          }
          manufactureInfo.blankArea = this.shareService.isValidNumber(blankAr);
        }

        (manufactureInfo.subProcessFormArray.controls as FormGroup[])[i].patchValue({ recommendTonnage: manufactureInfo.recommendTonnage });
        (manufactureInfo.subProcessFormArray.controls as FormGroup[])[i].patchValue({ formingForce: theoriticalForcce });
        (manufactureInfo.subProcessFormArray.controls as FormGroup[])[i].patchValue({ formPerimeter: manufactureInfo.formPerimeter });
        (manufactureInfo.subProcessFormArray.controls as FormGroup[])[i].patchValue({ blankArea: blankArea });
      } else if ([StampingType.Drawing].includes(subProcessTypeID)) {
        // this.calculationForDrawing(manufactureInfo, fieldColorsList, manufacturingObj)
        //     .pipe(takeUntil(this.unsubscribe$))
        //     .subscribe((calculationRes: any) => {
        //         if (calculationRes) {
        //             totalTon += calculationRes?.recommendTonnage;
        //             totalCycleTime += calculationRes?.cycleTime;
        //             (manufactureInfo.subProcessFormArray.controls as FormGroup[])[i].patchValue({ hlFactor: calculationRes?.hlFactor });
        //             (manufactureInfo.subProcessFormArray.controls as FormGroup[])[i].patchValue({ recommendTonnage: calculationRes?.recommendTonnage });
        //         }
        //     });
        const calculationRes = this.calculationForDrawing(manufactureInfo, fieldColorsList, manufacturingObj);
        if (calculationRes) {
          totalTon += calculationRes?.recommendTonnage;
          // totalCycleTime += calculationRes?.cycleTime;
          (manufactureInfo.subProcessFormArray.controls as FormGroup[])[i].patchValue({ hlFactor: calculationRes?.hlFactor });
          (manufactureInfo.subProcessFormArray.controls as FormGroup[])[i].patchValue({ recommendTonnage: calculationRes?.recommendTonnage });
        }
      }
    }

    // manufactureInfo.featureDetails = manufactureInfo.subProcessFormArray.controls[0].get('isBending').value
    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber((manufactureInfo.rotationTime + manufactureInfo.processTime) / manufactureInfo.efficiency);
      if (manufactureInfo.cycleTime != null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }
    manufactureInfo.totalTonnageRequired = totalTon;

    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      manufactureInfo.setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : this.shareService.isValidNumber(30);
    }

    if (manufactureInfo.isNoOfLowSkilledLaboursDirty && manufactureInfo.noOfLowSkilledLabours !== null) {
      manufactureInfo.noOfLowSkilledLabours = Number(manufactureInfo.noOfLowSkilledLabours);
    } else {
      manufactureInfo.noOfLowSkilledLabours = this.shareService.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList)
        ? manufacturingObj?.noOfLowSkilledLabours
        : this.shareService.isValidNumber(manufactureInfo.noOfLowSkilledLabours);
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
          Number(manufactureInfo.noOfSkilledLabours || 1) * Number(manufactureInfo.skilledLaborRatePerHour) +
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

    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost !== null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      let inspectionCost = this.shareService.isValidNumber(
        ((Number(manufactureInfo.qaOfInspectorRate) / 60) * Number(manufactureInfo.inspectionTime) * Math.ceil(Number(manufactureInfo.samplingRate / 100) * Number(manufactureInfo.lotSize))) /
          Number(manufactureInfo.lotSize)
      );
      if (manufactureInfo.inspectionCost !== null) {
        const sorted = manufactureInfo?.processInfoList?.sort((a, b) => a.processInfoId - b.processInfoId);
        const processIndex = sorted?.findIndex((x) => x.processInfoId === manufactureInfo.processInfoId);
        // let processIndex = manufactureInfo?.processInfoList?.findIndex(x => x.processTypeID === ProcessType.Stage);
        if (processIndex >= 0 && processIndex !== filteredInsProcesses.length - 1) {
          inspectionCost = 0;
        }
        inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : this.shareService.isValidNumber(inspectionCost);
      }
      manufactureInfo.inspectionCost = inspectionCost;
    }
    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost != null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      const sum = this.shareService.isValidNumber(
        Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
      );

      let yieldCost = this.shareService.isValidNumber(
        (1 - Number(manufactureInfo.yieldPer / 100)) * (Number(manufactureInfo.materialInfo.totalCost) + sum) -
          (1 - Number(manufactureInfo.yieldPer / 100)) * ((Number(manufactureInfo.materialInfo.weight) * Number(manufactureInfo.materialInfo.scrapPrice)) / 1000)
      );
      if (manufactureInfo.yieldCost != null) {
        yieldCost = this.shareService.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : yieldCost;
      }
      manufactureInfo.yieldCost = yieldCost;
    }

    manufactureInfo.directProcessCost = this.shareService.isValidNumber(
      Number(manufactureInfo.directLaborCost) +
        Number(manufactureInfo.directMachineCost) +
        Number(manufactureInfo.directSetUpCost) +
        Number(manufactureInfo.inspectionCost) +
        Number(manufactureInfo.yieldCost)
    );
    // return new Observable((obs) => { obs.next(manufactureInfo); });
    return manufactureInfo;
  }

  // public calculationForForming(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): Observable<ProcessInfoDto> {
  public calculationForForming(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    manufactureInfo = this.setSheetMetalObjectValues(manufactureInfo, fieldColorsList, manufacturingObj);
    if (manufactureInfo.isefficiencyDirty && manufactureInfo.efficiency != null) {
      manufactureInfo.efficiency = Number(manufactureInfo.efficiency);
    } else {
      if (manufactureInfo.efficiency != null)
        manufactureInfo.efficiency = this.shareService.checkDirtyProperty('efficiency', fieldColorsList) ? manufacturingObj?.efficiency : this.shareService.isValidNumber(manufactureInfo.efficiency);
    }
    if (manufactureInfo.ismachineHourRateDirty && manufactureInfo.machineHourRate != null) {
      manufactureInfo.machineHourRate = Number(manufactureInfo.machineHourRate);
    } else {
      manufactureInfo.machineHourRate = this.shareService.checkDirtyProperty('machineHourRate', fieldColorsList)
        ? manufacturingObj?.machineHourRate
        : this.shareService.isValidNumber(manufactureInfo.machineHourRate);
    }
    if (manufactureInfo.isNoOfLowSkilledLaboursDirty && manufactureInfo.noOfLowSkilledLabours != null) {
      manufactureInfo.noOfLowSkilledLabours = Number(manufactureInfo.noOfLowSkilledLabours);
    } else {
      manufactureInfo.noOfLowSkilledLabours = this.shareService.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList)
        ? manufacturingObj?.noOfLowSkilledLabours
        : this.shareService.isValidNumber(manufactureInfo.noOfLowSkilledLabours);
    }
    if (manufactureInfo.isLowSkilledLaborRatePerHourDirty && manufactureInfo.lowSkilledLaborRatePerHour != null) {
      manufactureInfo.lowSkilledLaborRatePerHour = Number(manufactureInfo.lowSkilledLaborRatePerHour);
    } else {
      manufactureInfo.lowSkilledLaborRatePerHour = this.shareService.checkDirtyProperty('lowSkilledLaborRatePerHour', fieldColorsList)
        ? manufacturingObj?.lowSkilledLaborRatePerHour
        : this.shareService.isValidNumber(manufactureInfo.lowSkilledLaborRatePerHour);
    }
    if (manufactureInfo.isSkilledLaborRatePerHourDirty && manufactureInfo.skilledLaborRatePerHour != null) {
      manufactureInfo.skilledLaborRatePerHour = Number(manufactureInfo.skilledLaborRatePerHour);
    } else {
      manufactureInfo.skilledLaborRatePerHour = this.shareService.checkDirtyProperty('skilledLaborRatePerHour', fieldColorsList)
        ? manufacturingObj?.skilledLaborRatePerHour
        : this.shareService.isValidNumber(manufactureInfo.skilledLaborRatePerHour);
    }
    if (manufactureInfo.isQaInspectorRateDirty && manufactureInfo.qaOfInspectorRate != null) {
      manufactureInfo.qaOfInspectorRate = Number(manufactureInfo.qaOfInspectorRate);
    } else {
      if (manufactureInfo.processTypeID != ProcessType.Stage && manufactureInfo.processTypeID != ProcessType.Progressive) {
        const processIndex = manufactureInfo?.processInfoList?.findIndex((x) => x.processTypeID === ProcessType.Forming);
        if (processIndex >= 0 && processIndex != manufactureInfo?.processInfoList?.length - 1) {
          manufactureInfo.qaOfInspectorRate = 0;
        }
      }
      manufactureInfo.qaOfInspectorRate = this.shareService.checkDirtyProperty('qaOfInspectorRate', fieldColorsList)
        ? manufacturingObj?.qaOfInspectorRate
        : this.shareService.isValidNumber(manufactureInfo.qaOfInspectorRate);
    }

    const thickness = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.dimUnfoldedZ;
    for (let i = 0; i < manufactureInfo.subProcessFormArray?.controls?.length; i++) {
      const info = manufactureInfo.subProcessFormArray?.controls[i];
      if (info?.value?.subProcessTypeID === StampingType.Forming) {
        manufactureInfo.blankArea = info?.value?.blankArea;
      }
    }

    const blankArea = this.shareService.isValidNumber(Number(thickness) * Number(manufactureInfo.formPerimeter));
    manufactureInfo.blankArea = blankArea;
    const yieldStrength = 0.5 * (Number(manufactureInfo.materialmasterDatas.yieldStrength) + Number(manufactureInfo.materialmasterDatas.tensileStrength));
    manufactureInfo.formingForce = this.shareService.isValidNumber((Number(manufactureInfo.blankArea) * yieldStrength) / 10000);
    const blankHoldingForce = Number(manufactureInfo.formingForce) * (1 / 3);
    const noOFImpression = (manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.noOfCavities) || 1;
    const theoriticalForcce = (Number(manufactureInfo.formingForce) + Number(blankHoldingForce)) * Number(noOFImpression);
    manufactureInfo.formingForce = theoriticalForcce;
    manufactureInfo.recommendTonnage = Number(theoriticalForcce) * 1.25;

    const complexity =
      manufactureInfo.partComplexity == PartComplexity.Low
        ? PartComplexity[PartComplexity.Low]
        : manufactureInfo.partComplexity == PartComplexity.Medium
          ? PartComplexity[PartComplexity.Medium]
          : manufactureInfo.partComplexity == PartComplexity.High
            ? PartComplexity[PartComplexity.High]
            : '';

    const manualStrokeRate = manufactureInfo.strokeRateManualList?.find(
      (x) => x.thickness == Math.round(thickness) && x.complexityType == complexity && x.tonnage >= Math.round(manufactureInfo.recommendTonnage)
    )?.value;

    // const totalSheetLoadTime = this.shareService.isValidNumber(Number(manufactureInfo.sheetLoadUloadTime) / 60) * 2;
    const handlingInfo = manufactureInfo.handlingTimeList?.filter((x) => x.weight > manufactureInfo.materialInfo.weight && x.isStageTooling == false).sort((s) => s.weight);
    manufactureInfo.sheetLoadUloadTime = 0;
    if (handlingInfo) {
      manufactureInfo.sheetLoadUloadTime = Number(handlingInfo[0]?.handlingTime);
    }

    const toolLoadingInfo = manufactureInfo.toolLoadingTimeList?.filter((x) => x.tonnage > Number(manufactureInfo.recommendTonnage) && x.toolType == ToolType.PressMachine).sort((s) => s.tonnage);
    const toolLoadingTIme = (toolLoadingInfo && toolLoadingInfo.length > 0 && toolLoadingInfo[0]?.toolLoadingTime) || 0;
    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime !== null) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      manufactureInfo.setUpTime = this.shareService.isValidNumber(Number(toolLoadingTIme));
      manufactureInfo.setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : this.shareService.isValidNumber(manufactureInfo.setUpTime);
    }

    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(Number(manualStrokeRate) / 60 + Number(toolLoadingTIme));
      if (manufactureInfo.cycleTime != null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    if (manufactureInfo.isinspectionTimeDirty && manufactureInfo.inspectionTime != null) {
      manufactureInfo.inspectionTime = this.shareService.isValidNumber(Number(manufactureInfo.inspectionTime));
    } else {
      let inspectionTime =
        manufactureInfo.partComplexity == PartComplexity.Low ? 2 : manufactureInfo.partComplexity == PartComplexity.Medium ? 5 : manufactureInfo.partComplexity == PartComplexity.High ? 10 : 0;
      if (manufactureInfo.inspectionTime != null) {
        if (manufactureInfo.processTypeID != ProcessType.Stage && manufactureInfo.processTypeID != ProcessType.Progressive) {
          const processIndex = manufactureInfo?.processInfoList?.findIndex((x) => x.processTypeID === ProcessType.Forming);
          if (processIndex >= 0 && processIndex != manufactureInfo?.processInfoList?.length - 1) {
            inspectionTime = 0;
          }
        }
        inspectionTime = this.shareService.checkDirtyProperty('inspectionTime', fieldColorsList) ? manufacturingObj?.inspectionTime : inspectionTime;
      }
      manufactureInfo.inspectionTime = inspectionTime;
    }
    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost != null) {
      manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
    } else {
      manufactureInfo.directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) / 3600) * Number(manufactureInfo.cycleTime));
      manufactureInfo.directMachineCost = this.shareService.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : manufactureInfo.directMachineCost;
    }
    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost != null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      manufactureInfo.directSetUpCost = this.shareService.isValidNumber(
        (((Number(manufactureInfo.skilledLaborRatePerHour) + Number(manufactureInfo.machineHourRate)) / 60) * Number(manufactureInfo.setUpTime)) / Number(manufactureInfo.lotSize)
      );
      manufactureInfo.directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.directSetUpCost : manufactureInfo.directSetUpCost;
    }
    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost != null) {
      manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
    } else {
      manufactureInfo.directLaborCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) * (manufactureInfo.cycleTime * Number(manufactureInfo.noOfLowSkilledLabours))
      );
      manufactureInfo.directLaborCost = this.shareService.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : manufactureInfo.directLaborCost;
    }
    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost !== null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      let inspectionCost = this.shareService.isValidNumber(
        ((Number(manufactureInfo.qaOfInspectorRate) / 60) * Number(manufactureInfo.inspectionTime) * Math.ceil(Number(manufactureInfo.samplingRate / 100) * Number(manufactureInfo.lotSize))) /
          Number(manufactureInfo.lotSize)
      );
      if (manufactureInfo.inspectionCost !== null) {
        if (manufactureInfo.processTypeID != ProcessType.Stage && manufactureInfo.processTypeID != ProcessType.Progressive) {
          const processIndex = manufactureInfo?.processInfoList?.findIndex((x) => x.processTypeID === ProcessType.Forming);
          if (processIndex >= 0 && processIndex != manufactureInfo?.processInfoList?.length - 1) {
            manufactureInfo.qaOfInspectorRate = 0;
          }
        }
        inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : this.shareService.isValidNumber(inspectionCost);
      }
      manufactureInfo.inspectionCost = inspectionCost;
    }
    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost != null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      const sum = this.shareService.isValidNumber(
        Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
      );
      const yieldCost = this.shareService.isValidNumber(
        (1 - Number(manufactureInfo.yieldPer / 100)) * (Number(manufactureInfo.materialInfo.totalCost) + sum) -
          (1 - Number(manufactureInfo.yieldPer / 100)) * ((Number(manufactureInfo.materialInfo.weight) * Number(manufactureInfo.materialInfo.scrapPrice)) / 1000)
      );
      manufactureInfo.yieldCost = this.shareService.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : yieldCost;
    }
    manufactureInfo.directProcessCost = this.shareService.isValidNumber(
      Number(manufactureInfo.directLaborCost) +
        Number(manufactureInfo.directMachineCost) +
        Number(manufactureInfo.directSetUpCost) +
        Number(manufactureInfo.inspectionCost) +
        Number(manufactureInfo.yieldCost)
    );
    // return new Observable((obs) => {
    //     obs.next(manufactureInfo);
    // });
    return manufactureInfo;
  }

  // public calculationForDrawing(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): Observable<ProcessInfoDto> {
  public calculationForDrawing(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    manufactureInfo = this.setSheetMetalObjectValues(manufactureInfo, fieldColorsList, manufacturingObj);
    if (manufactureInfo.isQaInspectorRateDirty && manufactureInfo.qaOfInspectorRate != null) {
      manufactureInfo.qaOfInspectorRate = Number(manufactureInfo.qaOfInspectorRate);
    } else {
      const processIndex = manufactureInfo?.processInfoList?.findIndex((x) => x.processTypeID === ProcessType.Drawing);
      if (processIndex >= 0 && processIndex != manufactureInfo?.processInfoList?.length - 1) {
        manufactureInfo.qaOfInspectorRate = 0;
      }
      manufactureInfo.qaOfInspectorRate = this.shareService.checkDirtyProperty('qaOfInspectorRate', fieldColorsList)
        ? manufacturingObj?.qaOfInspectorRate
        : this.shareService.isValidNumber(manufactureInfo.qaOfInspectorRate);
    }

    if (manufactureInfo.ishlFactorDirty && manufactureInfo.hlFactor != null) {
      manufactureInfo.hlFactor = Number(manufactureInfo.hlFactor);
    } else {
      let hlFactor = this.shareService.isValidNumber(Number(manufactureInfo.formHeight) / Number(manufactureInfo.formLength));
      if (manufactureInfo.hlFactor != null) {
        hlFactor = this.shareService.checkDirtyProperty('hlFactor', fieldColorsList) ? manufacturingObj?.hlFactor : hlFactor;
      }
      manufactureInfo.hlFactor = hlFactor;
    }
    const blankDiameter = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.blankDiameter;
    manufactureInfo.punchPerimeter = this.shareService.isValidNumber(Number(blankDiameter) * 0.5);
    const thickness = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.dimUnfoldedZ;
    const drawingForce = this.shareService.isValidNumber(
      (3.14 * (Number(manufactureInfo.punchPerimeter) + Number(thickness)) * Number(thickness) * Number(manufactureInfo.materialmasterDatas.yieldStrength)) / 10000
    );
    const blankHoldingForce = Number(drawingForce) * (1 / 3);
    const noOFImpression = (manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.noOfCavities) || 1;
    const theoriticalForcce = (Number(drawingForce) + Number(blankHoldingForce)) * Number(noOFImpression);
    manufactureInfo.recommendTonnage = Number(theoriticalForcce) * 1.25;

    // const complexity =
    //   manufactureInfo.partComplexity == PartComplexity.Low
    //     ? PartComplexity[PartComplexity.Low]
    //     : manufactureInfo.partComplexity == PartComplexity.Medium
    //       ? PartComplexity[PartComplexity.Medium]
    //       : manufactureInfo.partComplexity == PartComplexity.High
    //         ? PartComplexity[PartComplexity.High]
    //         : '';

    const handlingInfo = manufactureInfo.handlingTimeList?.filter((x) => x.weight > manufactureInfo.materialInfo.weight && x.isStageTooling == false).sort((s) => s.weight);
    manufactureInfo.sheetLoadUloadTime = 0;
    if (handlingInfo) {
      manufactureInfo.sheetLoadUloadTime = Number(handlingInfo[0]?.handlingTime);
    }

    const toolLoadingInfo = manufactureInfo.toolLoadingTimeList?.filter((x) => x.tonnage > Number(manufactureInfo.recommendTonnage) && x.toolType == ToolType.PressMachine).sort((s) => s.tonnage);
    const toolLoadingTIme = (toolLoadingInfo && toolLoadingInfo.length > 0 && toolLoadingInfo[0]?.toolLoadingTime) || 0;
    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime !== null) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      let setUpTime = this.shareService.isValidNumber(Number(toolLoadingTIme));
      if (manufactureInfo.setUpTime != null) {
        setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : this.shareService.isValidNumber(setUpTime);
      }
      manufactureInfo.setUpTime = setUpTime;
    }
    const netWeight = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.netWeight / 1000;

    let loading = 0;
    if (netWeight < 5) {
      loading = 4;
    } else if (netWeight < 10) {
      loading = 8;
    } else if (netWeight < 27) {
      loading = 15;
    } else {
      loading = 30;
    }

    const process = 3.5;
    let roation = 0;
    if (netWeight < 5) {
      roation = 4;
    } else if (netWeight < 10) {
      roation = 8;
    } else if (netWeight < 27) {
      roation = 15;
    } else {
      roation = 30;
    }

    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(Number(loading) + Number(roation) + Number(process));
      if (manufactureInfo.cycleTime != null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    if (manufactureInfo.isNoOfLowSkilledLaboursDirty && manufactureInfo.noOfLowSkilledLabours !== null) {
      manufactureInfo.noOfLowSkilledLabours = Number(manufactureInfo.noOfLowSkilledLabours);
    } else {
      manufactureInfo.noOfLowSkilledLabours = this.shareService.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList)
        ? manufacturingObj?.noOfLowSkilledLabours
        : this.shareService.isValidNumber(manufactureInfo.noOfLowSkilledLabours);
    }

    if (manufactureInfo.isinspectionTimeDirty && manufactureInfo.inspectionTime != null) {
      manufactureInfo.inspectionTime = Number(manufactureInfo.inspectionTime);
    } else {
      let inspectionTime =
        manufactureInfo?.partComplexity === PartComplexity.Low ? 2 : manufactureInfo?.partComplexity === PartComplexity.Medium ? 5 : manufactureInfo?.partComplexity === PartComplexity.High ? 10 : 0;
      if (manufactureInfo.inspectionTime != null) {
        const processIndex = manufactureInfo?.processInfoList?.findIndex((x) => x.processTypeID === ProcessType.Drawing);
        if (processIndex >= 0 && processIndex !== manufactureInfo?.processInfoList?.length - 1) {
          inspectionTime = 0;
        }
        inspectionTime = this.shareService.checkDirtyProperty('inspectionTime', fieldColorsList) ? manufacturingObj?.inspectionTime : inspectionTime;
      }
      manufactureInfo.inspectionTime = inspectionTime;
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
        (((Number(manufactureInfo.skilledLaborRatePerHour) + Number(manufactureInfo.machineHourRate)) / 60) * Number(manufactureInfo.setUpTime)) / Number(manufactureInfo.lotSize)
      );
      if (manufactureInfo.directSetUpCost != null) {
        directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.directSetUpCost : directSetUpCost;
      }
      manufactureInfo.directSetUpCost = directSetUpCost;
    }
    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost != null) {
      manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
    } else {
      let directLaborCost = this.shareService.isValidNumber((Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) * (manufactureInfo.cycleTime * Number(manufactureInfo.noOfLowSkilledLabours)));
      if (manufactureInfo.directLaborCost != null) {
        directLaborCost = this.shareService.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : directLaborCost;
      }
      manufactureInfo.directLaborCost = directLaborCost;
    }
    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost !== null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      let inspectionCost = this.shareService.isValidNumber(
        ((Number(manufactureInfo.qaOfInspectorRate) / 60) * Number(manufactureInfo.inspectionTime) * Math.ceil(Number(manufactureInfo.samplingRate / 100) * Number(manufactureInfo.lotSize))) /
          Number(manufactureInfo.lotSize)
      );
      if (manufactureInfo.inspectionCost !== null) {
        const processIndex = manufactureInfo?.processInfoList?.findIndex((x) => x.processTypeID === ProcessType.Drawing);
        if (processIndex >= 0 && processIndex != manufactureInfo?.processInfoList?.length - 1) {
          inspectionCost = 0;
        }
        inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : this.shareService.isValidNumber(inspectionCost);
      }
      manufactureInfo.inspectionCost = inspectionCost;
    }
    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost != null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      const sum = this.shareService.isValidNumber(
        Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
      );
      let yieldCost = this.shareService.isValidNumber(
        (1 - Number(manufactureInfo.yieldPer / 100)) * (Number(manufactureInfo.materialInfo.totalCost) + sum) -
          (1 - Number(manufactureInfo.yieldPer / 100)) * ((Number(manufactureInfo.materialInfo.weight) * Number(manufactureInfo.materialInfo.scrapPrice)) / 1000)
      );
      if (manufactureInfo.yieldCost != null) {
        yieldCost = this.shareService.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : yieldCost;
      }
      manufactureInfo.yieldCost = yieldCost;
    }
    manufactureInfo.directProcessCost = this.shareService.isValidNumber(
      Number(manufactureInfo.directLaborCost) +
        Number(manufactureInfo.directMachineCost) +
        Number(manufactureInfo.directSetUpCost) +
        Number(manufactureInfo.inspectionCost) +
        Number(manufactureInfo.yieldCost)
    );
    return manufactureInfo;
  }

  public calculationsForTPP(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    manufactureInfo = this.setSheetMetalObjectValues(manufactureInfo, fieldColorsList, manufacturingObj);
    manufactureInfo.thickness = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.dimUnfoldedZ;
    const sheetWeight = this.shareService.isValidNumber(Number(manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.coilWeight));
    const netWeight = this.shareService.isValidNumber(Number(manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.netWeight));
    const partsPerCoil = this.shareService.isValidNumber(Number(manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.partsPerCoil));
    const filteredInsProcesses = manufactureInfo.processInfoList?.filter((p) => ![ProcessType.Deburring, ProcessType.VisualInspection, ProcessType.Cleaning].includes(p.processTypeID)) || [];

    // let materialType = manufactureInfo.materialmasterDatas?.materialType?.materialTypeName;

    // Req. Bed Size
    manufactureInfo.requiredCurrent = manufactureInfo.materialInfoList[0]?.coilLength;
    manufactureInfo.requiredWeldingVoltage = manufactureInfo.materialInfoList[0]?.coilWidth;
    manufactureInfo.recBedSize = Math.round(manufactureInfo.materialInfoList[0]?.coilLength) + ' x ' + Math.round(manufactureInfo.materialInfoList[0]?.coilWidth);

    // selected bed sizes
    manufactureInfo.lengthOfCoated = manufactureInfo?.machineMaster?.bedLength;
    manufactureInfo.widthOfCoated = manufactureInfo?.machineMaster?.bedWidth;
    manufactureInfo.selectedBedSize = manufactureInfo?.machineMaster?.bedLength + ' x ' + manufactureInfo?.machineMaster?.bedWidth;

    if (manufactureInfo.isQaInspectorRateDirty && manufactureInfo.qaOfInspectorRate !== null) {
      manufactureInfo.qaOfInspectorRate = Number(manufactureInfo.qaOfInspectorRate);
    } else {
      const processIndex = manufactureInfo?.processInfoList?.findIndex((x) => x.processTypeID === ProcessType.TurretTPP);
      if (manufactureInfo.inspectionCost !== null) {
        manufactureInfo.qaOfInspectorRate = this.shareService.checkDirtyProperty('qaOfInspectorRate', fieldColorsList)
          ? manufacturingObj?.qaOfInspectorRate
          : this.shareService.isValidNumber(manufactureInfo.qaOfInspectorRate);
      }
      if (processIndex >= 0 && processIndex !== filteredInsProcesses.length - 1) {
        manufactureInfo.qaOfInspectorRate = 0;
      }
    }

    if (manufactureInfo.isLengthOfCutInternalDirty && manufactureInfo.lengthOfCutInternal != null) {
      manufactureInfo.lengthOfCutInternal = Number(manufactureInfo.lengthOfCutInternal);
    } else {
      manufactureInfo.lengthOfCutInternal = this.shareService.checkDirtyProperty('lengthOfCutInternal', fieldColorsList)
        ? manufacturingObj?.lengthOfCutInternal
        : this.shareService.isValidNumber(manufactureInfo.lengthOfCutInternal);
    }

    if (manufactureInfo.isNoOfHolesDirty && manufactureInfo.noOfHoles != null) {
      manufactureInfo.noOfHoles = Number(manufactureInfo.noOfHoles);
    } else {
      manufactureInfo.noOfHoles = this.shareService.checkDirtyProperty('noOfHoles', fieldColorsList) ? manufacturingObj?.noOfHoles : this.shareService.isValidNumber(manufactureInfo.noOfHoles);
    }

    if (manufactureInfo.isNoOfStrokesDirty && manufactureInfo.noofStroke !== null) {
      manufactureInfo.noofStroke = Number(manufactureInfo.noofStroke);
    } else {
      let noOfStrokes = this.shareService.isValidNumber(Math.ceil(manufactureInfo.lengthOfCut / 25) + Math.ceil(manufactureInfo.lengthOfCutInternal / 25) + manufactureInfo.noOfHoles); // Math.ceil(manufactureInfo.lengthOfCut / 40) + Math.ceil(Number(manufactureInfo.lengthOfCutInternal) / 40) + Number(manufactureInfo.noOfHoles);
      if (manufactureInfo.noofStroke !== null) {
        noOfStrokes = this.shareService.checkDirtyProperty('noofStroke', fieldColorsList) ? manufacturingObj?.noofStroke : this.shareService.isValidNumber(noOfStrokes);
      }
      manufactureInfo.noofStroke = noOfStrokes;
    }

    // Selected SPM
    if (manufactureInfo.isspindleRpmDirty && manufactureInfo.spindleRpm !== null) {
      manufactureInfo.spindleRpm = Number(manufactureInfo.spindleRpm);
    } else {
      let selectedSpm = 0;
      const materialType = this._smConfig.mapMaterial(manufactureInfo?.materialmasterDatas?.materialType?.materialTypeName);
      const spmRow = this._smConfig.findSpm(materialType, manufactureInfo.thickness);
      if (spmRow) {
        const spmTimes = this._smConfig.calculateTPPMachineTimes(spmRow, manufactureInfo.noofStroke);
        const costResults = this._smConfig.calculateLowestMachineCosts(spmTimes, [manufactureInfo?.machineMaster]);
        const machine = this._smConfig.selectLowestCost(costResults);
        selectedSpm = manufactureInfo?.machineMaster ? spmRow[machine[0]['usedSpmKey']] : 0;
      }
      if (manufactureInfo.spindleRpm !== null) {
        selectedSpm = this.shareService.checkDirtyProperty('spindleRpm', fieldColorsList) ? manufacturingObj?.spindleRpm : this.shareService.isValidNumber(selectedSpm);
      }
      manufactureInfo.spindleRpm = this.shareService.isValidNumber(selectedSpm);
    }

    if (manufactureInfo.isefficiencyDirty && manufactureInfo.efficiency != null) {
      manufactureInfo.efficiency = Number(manufactureInfo.efficiency);
    } else {
      if (manufactureInfo.efficiency != null)
        manufactureInfo.efficiency = this.shareService.checkDirtyProperty('efficiency', fieldColorsList) ? manufacturingObj?.efficiency : this.shareService.isValidNumber(manufactureInfo.efficiency);
    }

    // Loading/Unloading Time
    let loadUnloadTime = 15;
    if (sheetWeight <= 10000) loadUnloadTime = 3;
    else if (sheetWeight <= 25000) loadUnloadTime = 7;
    else if (sheetWeight <= 50000) loadUnloadTime = 10;

    // un loading part time
    let unloadingPartTime = 60;
    if (netWeight < 1000) unloadingPartTime = 4;
    else if (netWeight < 5000) unloadingPartTime = 8;
    else if (netWeight < 10000) unloadingPartTime = 15;
    else if (netWeight < 25000) unloadingPartTime = 30;

    // Handling Time
    if (manufactureInfo.isRotationTimeDirty && manufactureInfo.rotationTime != null) {
      manufactureInfo.rotationTime = Number(manufactureInfo.rotationTime);
    } else {
      let handlingTime = (loadUnloadTime * 60) / partsPerCoil + unloadingPartTime;
      if (manufactureInfo.rotationTime != null) {
        handlingTime = this.shareService.checkDirtyProperty('rotationTime', fieldColorsList) ? manufacturingObj?.rotationTime : handlingTime;
      }
      manufactureInfo.rotationTime = this.shareService.isValidNumber(handlingTime);
    }

    // Total Time
    if (manufactureInfo.isProcessTimeDirty && manufactureInfo.processTime !== null) {
      manufactureInfo.processTime = Number(manufactureInfo.processTime);
    } else {
      let processTime = this.shareService.isValidNumber((manufactureInfo.noofStroke / manufactureInfo.spindleRpm) * 60); // + manufactureInfo.rotationTime // this.shareService.isValidNumber(((Number(manufactureInfo.noofStroke) / selectedStrokePerMin) * 60) / manufactureInfo.efficiency);
      if (manufactureInfo.processTime !== null) {
        processTime = this.shareService.checkDirtyProperty('processTime', fieldColorsList) ? manufacturingObj?.processTime : processTime;
      }
      manufactureInfo.processTime = processTime;
    }

    // let selectedStrokePerMin = 0;
    // if (manufactureInfo.thickness < 1) {
    //   selectedStrokePerMin = 180;
    // } else if (manufactureInfo.thickness < 2) {
    //   selectedStrokePerMin = 150;
    // } else if (manufactureInfo.thickness < 3) {
    //   selectedStrokePerMin = 130;
    // } else if (manufactureInfo.thickness < 4) {
    //   selectedStrokePerMin = 100;
    // }

    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime !== null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber((manufactureInfo.processTime + manufactureInfo.rotationTime) / manufactureInfo.efficiency); // this.shareService.isValidNumber(((Number(manufactureInfo.noofStroke) / selectedStrokePerMin) * 60) / manufactureInfo.efficiency);
      if (manufactureInfo.cycleTime !== null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    if (manufactureInfo.isinspectionTimeDirty && manufactureInfo.inspectionTime != null) {
      manufactureInfo.inspectionTime = Number(manufactureInfo.inspectionTime);
    } else {
      let inspectionTime =
        manufactureInfo.partComplexity === PartComplexity.Low ? 2 : manufactureInfo.partComplexity === PartComplexity.Medium ? 5 : manufactureInfo.partComplexity === PartComplexity.High ? 10 : 0;
      const processIndex = manufactureInfo?.processInfoList?.findIndex((x) => x.processTypeID === ProcessType.TurretTPP);
      if (manufactureInfo.inspectionTime !== null) {
        inspectionTime = this.shareService.checkDirtyProperty('inspectionTime', fieldColorsList) ? manufacturingObj?.inspectionTime : inspectionTime;
      }
      if (processIndex >= 0 && processIndex !== filteredInsProcesses.length - 1) {
        inspectionTime = 0;
      }
      manufactureInfo.inspectionTime = inspectionTime;
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
        (((Number(manufactureInfo.skilledLaborRatePerHour) + Number(manufactureInfo.machineHourRate)) / 60) * Number(manufactureInfo.setUpTime)) / Number(manufactureInfo.lotSize)
      );
      if (manufactureInfo.directSetUpCost != null) {
        directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.directSetUpCost : directSetUpCost;
      }
      manufactureInfo.directSetUpCost = directSetUpCost;
    }

    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost != null) {
      manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
    } else {
      let directLaborCost = this.shareService.isValidNumber((Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) * (manufactureInfo.cycleTime * Number(manufactureInfo.noOfLowSkilledLabours)));
      if (manufactureInfo.directLaborCost != null) {
        directLaborCost = this.shareService.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : directLaborCost;
      }
      manufactureInfo.directLaborCost = directLaborCost;
    }

    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost !== null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      let inspectionCost = this.shareService.isValidNumber(
        ((Number(manufactureInfo.qaOfInspectorRate) / 60) * Number(manufactureInfo.inspectionTime) * Math.ceil(Number(manufactureInfo.samplingRate / 100) * Number(manufactureInfo.lotSize))) /
          Number(manufactureInfo.lotSize)
      );
      const processIndex = manufactureInfo?.processInfoList?.findIndex((x) => x.processTypeID === ProcessType.TurretTPP);
      if (manufactureInfo.inspectionCost !== null) {
        inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : this.shareService.isValidNumber(inspectionCost);
      }
      if (processIndex >= 0 && processIndex !== filteredInsProcesses.length - 1) {
        inspectionCost = 0;
      }
      manufactureInfo.inspectionCost = inspectionCost;
    }

    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost != null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      const sum = this.shareService.isValidNumber(
        Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
      );
      let yieldCost = this.shareService.isValidNumber(
        (1 - Number(manufactureInfo.yieldPer / 100)) * (Number(manufactureInfo.materialInfo.totalCost) + sum) -
          (1 - Number(manufactureInfo.yieldPer / 100)) * ((Number(manufactureInfo.materialInfo.weight) * Number(manufactureInfo.materialInfo.scrapPrice)) / 1000)
      );
      if (manufactureInfo.yieldCost != null) {
        yieldCost = this.shareService.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : yieldCost;
      }
      manufactureInfo.yieldCost = yieldCost;
    }

    manufactureInfo.directProcessCost = this.shareService.isValidNumber(
      Number(manufactureInfo.directLaborCost) +
        Number(manufactureInfo.directMachineCost) +
        Number(manufactureInfo.directSetUpCost) +
        Number(manufactureInfo.inspectionCost) +
        Number(manufactureInfo.yieldCost)
    );
    //manufactureInfo = this.calculateESGCosts(manufactureInfo, fieldColorsList, manufacturingObj);
    // return new Observable((obs) => { obs.next(manufactureInfo); });
    return manufactureInfo;
  }

  public calculationForCutting(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    // oxy cutting
    if (manufactureInfo.processTypeID === ProcessType.OxyCutting) {
      manufactureInfo = this.calculationForOxyCutting(manufactureInfo, fieldColorsList, manufacturingObj);
      return manufactureInfo;
    }
    // for laser and plasma cutting
    manufactureInfo = this.setSheetMetalObjectValues(manufactureInfo, fieldColorsList, manufacturingObj);
    const processIndex = manufactureInfo.processInfoList?.findIndex((x) => x.processTypeID === ProcessType.LaserCutting || x.processTypeID === ProcessType.PlasmaCutting);
    const thickness = this.shareService.isValidNumber(Number(manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.dimUnfoldedZ));
    const sheetWeight = this.shareService.isValidNumber(Number(manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.coilWeight));
    const netWeight = this.shareService.isValidNumber(Number(manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.netWeight));
    const partsPerCoil = this.shareService.isValidNumber(Number(manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.partsPerCoil));
    let materialType = this._smConfig.mapMaterial(manufactureInfo.materialmasterDatas?.materialType?.materialTypeName);
    const filteredInsProcesses = manufactureInfo.processInfoList?.filter((p) => ![ProcessType.Deburring, ProcessType.VisualInspection, ProcessType.Cleaning].includes(p.processTypeID)) || [];

    // Req. Bed Size
    manufactureInfo.requiredCurrent = manufactureInfo.materialInfoList[0]?.coilLength;
    manufactureInfo.requiredWeldingVoltage = manufactureInfo.materialInfoList[0]?.coilWidth;
    manufactureInfo.recBedSize = Math.round(manufactureInfo.materialInfoList[0]?.coilLength) + ' x ' + Math.round(manufactureInfo.materialInfoList[0]?.coilWidth);

    // selected bed sizes
    manufactureInfo.lengthOfCoated = manufactureInfo?.machineMaster?.bedLength;
    manufactureInfo.widthOfCoated = manufactureInfo?.machineMaster?.bedWidth;
    manufactureInfo.selectedBedSize = manufactureInfo?.machineMaster?.bedLength + ' x ' + manufactureInfo?.machineMaster?.bedWidth;

    if (manufactureInfo.isNoOfStartsPierceDirty && manufactureInfo.noOfStartsPierce !== null) {
      manufactureInfo.noOfStartsPierce = Number(manufactureInfo.noOfStartsPierce);
    } else {
      if (manufactureInfo.noOfStartsPierce !== null) {
        manufactureInfo.noOfStartsPierce = this.shareService.checkDirtyProperty('noOfStartsPierce', fieldColorsList)
          ? manufacturingObj?.noOfStartsPierce
          : this.shareService.isValidNumber(manufactureInfo.noOfStartsPierce);
      }
    }

    if (manufactureInfo.isQaInspectorRateDirty && manufactureInfo.qaOfInspectorRate != null) {
      manufactureInfo.qaOfInspectorRate = Number(manufactureInfo.qaOfInspectorRate);
    } else {
      if (manufactureInfo.qaOfInspectorRate !== null) {
        manufactureInfo.qaOfInspectorRate = this.shareService.checkDirtyProperty('qaOfInspectorRate', fieldColorsList)
          ? manufacturingObj?.qaOfInspectorRate
          : this.shareService.isValidNumber(manufactureInfo.qaOfInspectorRate);
      }
      if (processIndex >= 0 && processIndex !== filteredInsProcesses.length - 1) {
        manufactureInfo.qaOfInspectorRate = 0;
      }
    }

    if (manufactureInfo.iscuttingSpeedDirty && manufactureInfo.cuttingSpeed !== null) {
      manufactureInfo.cuttingSpeed = Number(manufactureInfo.cuttingSpeed);
    } else {
      let cuttingSpeed = 0;
      if (manufactureInfo.processTypeID === ProcessType.LaserCutting) {
        const cuttingInfo = manufactureInfo.laserCutttingTimeList
          ?.filter((y) => y.cuttingSpeedActual > 0)
          ?.find((x) => x.thickness >= Math.ceil(thickness) && x.material == materialType && x.laserPower >= manufactureInfo?.machineMaster?.laserPower);
        cuttingSpeed = cuttingInfo?.cuttingSpeedActual || 0;
      } else if (manufactureInfo.processTypeID === ProcessType.PlasmaCutting) {
        const cuttingInfo = manufactureInfo.plasmaCutttingSpeedList?.find(
          (x) => x.thickness >= Math.ceil(thickness) && x.materialType == materialType && x.amps >= manufactureInfo?.machineMaster?.plasmaCurrent
        );
        cuttingSpeed = cuttingInfo?.speed || 0; // m to mm
      }
      if (manufactureInfo.cuttingSpeed !== null) {
        cuttingSpeed = this.shareService.checkDirtyProperty('cuttingSpeed', fieldColorsList) ? manufacturingObj?.cuttingSpeed : this.shareService.isValidNumber(cuttingSpeed);
      }
      manufactureInfo.cuttingSpeed = this.shareService.isValidNumber(cuttingSpeed);
    }

    // Min. Wattage Required
    if (manufactureInfo.processTypeID === ProcessType.LaserCutting) {
      const cuttingInfo = manufactureInfo.laserCutttingTimeList?.filter((y) => y.cuttingSpeedActual > 0)?.find((x) => x.thickness >= Math.ceil(thickness) && x.material == materialType);
      manufactureInfo.totalFactorySpaceRequired = cuttingInfo?.laserPower || 0;
      manufactureInfo.totalToolLendingTime = cuttingInfo?.laserPower || 0;
    } else if (manufactureInfo.processTypeID === ProcessType.PlasmaCutting) {
      // materialType = this._smConfig.mapMaterial(materialType);
      const cuttingInfo = manufactureInfo.plasmaCutttingSpeedList?.find((x) => x.thickness >= Math.ceil(thickness) && x.materialType == materialType);
      manufactureInfo.totalFactorySpaceRequired = cuttingInfo?.amps || 0;
      manufactureInfo.totalToolLendingTime = cuttingInfo?.amps || 0;
    }
    // if (manufactureInfo.isTotalFactorySpaceRequiredDirty && manufactureInfo.totalFactorySpaceRequired != null) {
    //   manufactureInfo.totalFactorySpaceRequired = Number(manufactureInfo.totalFactorySpaceRequired);
    // } else {
    //   let minWattAmpReq = 0;
    //   if (manufactureInfo.processTypeID === ProcessType.LaserCutting) {
    //     const cuttingInfo = manufactureInfo.laserCutttingTimeList
    //       ?.filter((y) => y.cuttingSpeedActual > 0)
    //       ?.find((x) => x.thickness >= Math.ceil(thickness) && x.material == materialType && x.laserPower >= manufactureInfo?.machineMaster?.laserPower);
    //     minWattAmpReq = cuttingInfo?.laserPower || 0;
    //   } else if (manufactureInfo.processTypeID === ProcessType.PlasmaCutting) {
    //     materialType = ['Alloy Steel', 'Carbon Steel', 'Cold Rolled Steel', 'Hot Rolled Steel', 'Galvanized Steel', 'Spring Steel'].includes(materialType) ? 'Carbon Steel' : materialType;
    //     const cuttingInfo = manufactureInfo.plasmaCutttingSpeedList?.find((x) => x.thickness >= Math.ceil(thickness) && x.materialType == materialType);
    //     minWattAmpReq = cuttingInfo?.amps || 0;
    //   }
    //   if (manufactureInfo.totalFactorySpaceRequired != null) {
    //     manufactureInfo.totalFactorySpaceRequired = this.shareService.checkDirtyProperty('totalFactorySpaceRequired', fieldColorsList) ? manufacturingObj?.totalFactorySpaceRequired : this.shareService.isValidNumber(minWattAmpReq);
    //   }
    // }

    // selected Wattage
    if (manufactureInfo.processTypeID === ProcessType.LaserCutting) {
      manufactureInfo.platenSizeLength = manufactureInfo?.machineMaster?.laserPower || 0;
    } else if (manufactureInfo.processTypeID === ProcessType.PlasmaCutting) {
      manufactureInfo.platenSizeLength = manufactureInfo?.machineMaster?.plasmaCurrent || 0;
    }

    // if (manufactureInfo.isplatenSizeLengthDirty && manufactureInfo.platenSizeLength != null) {
    //   manufactureInfo.platenSizeLength = Number(manufactureInfo.platenSizeLength);
    // } else {
    //   let selectedWattAmpReq = 0;
    //   if (manufactureInfo.processTypeID === ProcessType.LaserCutting) {
    //     selectedWattAmpReq = manufactureInfo?.machineMaster?.laserPower || 0;
    //   } else if (manufactureInfo.processTypeID === ProcessType.PlasmaCutting) {
    //     selectedWattAmpReq = manufactureInfo?.machineMaster?.plasmaCurrent || 0;
    //   }
    //   if (manufactureInfo.platenSizeLength != null) {
    //     manufactureInfo.platenSizeLength = this.shareService.checkDirtyProperty('platenSizeLength', fieldColorsList) ? manufacturingObj?.platenSizeLength : this.shareService.isValidNumber(selectedWattAmpReq);
    //   }
    // }

    // Loading/Unloading Time
    let loadUnloadTime = 15;
    if (sheetWeight <= 10000) loadUnloadTime = 3;
    else if (sheetWeight <= 25000) loadUnloadTime = 7;
    else if (sheetWeight <= 50000) loadUnloadTime = 10;

    // un loading part time
    let unloadingPartTime = 60;
    if (netWeight < 1000) unloadingPartTime = 4;
    else if (netWeight < 5000) unloadingPartTime = 8;
    else if (netWeight < 10000) unloadingPartTime = 15;
    else if (netWeight < 25000) unloadingPartTime = 30;

    // Handling Time
    if (manufactureInfo.isRotationTimeDirty && manufactureInfo.rotationTime != null) {
      manufactureInfo.rotationTime = Number(manufactureInfo.rotationTime);
    } else {
      let handlingTime = (loadUnloadTime * 60) / partsPerCoil + unloadingPartTime;
      if (manufactureInfo.rotationTime != null) {
        handlingTime = this.shareService.checkDirtyProperty('rotationTime', fieldColorsList) ? manufacturingObj?.rotationTime : handlingTime;
      }
      manufactureInfo.rotationTime = this.shareService.isValidNumber(handlingTime);
    }

    // Total Non cutting distance TODO
    // Rapid Traverse Speed TODO

    //Cutting Time
    const noOfHeads = 1;
    if (manufactureInfo.processTypeID === ProcessType.PlasmaCutting) {
      manufactureInfo.cuttingTime = this.shareService.isValidNumber(manufactureInfo.lengthOfCut / (manufactureInfo.cuttingSpeed * 1000) / noOfHeads);
    } else {
      manufactureInfo.cuttingTime = this.shareService.isValidNumber((manufactureInfo.lengthOfCut / 1000 / manufactureInfo.cuttingSpeed) * 60); // this.shareService.isValidNumber(Number(manufactureInfo.lengthOfCut) / 1000 / Number(manufactureInfo.cuttingSpeed));
    }

    const rapidTraverseTime = this.shareService.isValidNumber(manufactureInfo.cuttingTime * 0.05);

    const piercingTimeConstant =
      manufactureInfo.processTypeID === ProcessType.LaserCutting
        ? this._smConfig.getLaserPiercingTime(materialType, thickness, manufactureInfo.platenSizeLength)
        : this._smConfig.getPlasmaPiercingTime(materialType, thickness, manufactureInfo.platenSizeLength);

    manufactureInfo.piercingTime = this.shareService.isValidNumber(piercingTimeConstant * Number(manufactureInfo.noOfStartsPierce)); // 0.02

    if (manufactureInfo.processTypeID === ProcessType.PlasmaCutting) {
      manufactureInfo.piercingTime = this.shareService.isValidNumber((piercingTimeConstant * Number(manufactureInfo.noOfStartsPierce)) / 60);
    }

    const dwellTimeTimeConstant = manufactureInfo.processTypeID === ProcessType.LaserCutting ? this._smConfig.getLaserDwellTime(materialType, thickness) : 0;

    const dwellTime = this.shareService.isValidNumber(dwellTimeTimeConstant * Number(manufactureInfo.noOfStartsPierce));

    // Process Time
    if (manufactureInfo.isProcessTimeDirty && manufactureInfo.processTime !== null) {
      manufactureInfo.processTime = Number(manufactureInfo.processTime);
    } else {
      let processTime = this.shareService.isValidNumber(manufactureInfo.piercingTime + manufactureInfo.cuttingTime + rapidTraverseTime + dwellTime);
      processTime = manufactureInfo.processTypeID === (ProcessType.PlasmaCutting || ProcessType.OxyCutting) ? processTime * 60 : processTime;
      if (manufactureInfo.processTime !== null) {
        processTime = this.shareService.checkDirtyProperty('processTime', fieldColorsList) ? manufacturingObj?.processTime : processTime;
      }
      manufactureInfo.processTime = this.shareService.isValidNumber(processTime);
    }

    const totalTime = this.shareService.isValidNumber(manufactureInfo.processTime + manufactureInfo.rotationTime);
    // manufactureInfo.processTypeID === ProcessType.PlasmaCutting
    //   ? this.shareService.isValidNumber((manufactureInfo.processTime + manufactureInfo.rotationTime) / 60) // this.shareService.isValidNumber(Number(manufactureInfo.piercingTime) + Number(manufactureInfo.cuttingTime) + Number(rapidTraverseTime) + Number(manufactureInfo.rotationTime / 60))
    //   : this.shareService.isValidNumber(manufactureInfo.processTime + manufactureInfo.rotationTime); // this.shareService.isValidNumber( Number(manufactureInfo.piercingTime) + Number(manufactureInfo.cuttingTime) + Number(rapidTraverseTime) + Number(dwellTime) + Number(manufactureInfo.rotationTime)); // / manufactureInfo.efficiency);

    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime !== null) {
      //reused cycle time field as total time
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(totalTime / manufactureInfo.efficiency);
      // manufactureInfo.processTypeID === ProcessType.PlasmaCutting
      //   ? this.shareService.isValidNumber((totalTime * 60) / manufactureInfo.efficiency)
      //   : this.shareService.isValidNumber(totalTime / manufactureInfo.efficiency); // * 60
      if (manufactureInfo.cycleTime !== null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }
    if (manufactureInfo.isLowSkilledLaborRatePerHourDirty && manufactureInfo.lowSkilledLaborRatePerHour !== null) {
      manufactureInfo.lowSkilledLaborRatePerHour = Number(manufactureInfo.lowSkilledLaborRatePerHour);
    } else {
      manufactureInfo.lowSkilledLaborRatePerHour = this.shareService.checkDirtyProperty('lowSkilledLaborRatePerHour', fieldColorsList)
        ? manufacturingObj?.lowSkilledLaborRatePerHour
        : this.shareService.isValidNumber(manufactureInfo.lowSkilledLaborRatePerHour);
    }

    if (manufactureInfo.isNoOfLowSkilledLaboursDirty && manufactureInfo.noOfLowSkilledLabours !== null) {
      manufactureInfo.noOfLowSkilledLabours = Number(manufactureInfo.noOfLowSkilledLabours);
    } else {
      manufactureInfo.noOfLowSkilledLabours = this.shareService.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList)
        ? manufacturingObj?.noOfLowSkilledLabours
        : this.shareService.isValidNumber(manufactureInfo.noOfLowSkilledLabours);
    }

    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime !== null) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      let setUpTime = manufactureInfo.platenSizeLength <= 100 ? 10 : manufactureInfo.platenSizeLength <= 300 ? 20 : 30;
      if (manufactureInfo.setUpTime !== null) {
        setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : setUpTime;
      }

      manufactureInfo.setUpTime = setUpTime;
    }

    if (manufactureInfo.isinspectionTimeDirty && manufactureInfo.inspectionTime != null) {
      manufactureInfo.inspectionTime = Number(manufactureInfo.inspectionTime);
    } else {
      let inspectionTime =
        manufactureInfo.partComplexity === PartComplexity.Low ? 2 : manufactureInfo.partComplexity === PartComplexity.Medium ? 5 : manufactureInfo.partComplexity == PartComplexity.High ? 10 : 0;
      if (manufactureInfo.inspectionTime != null) {
        inspectionTime = this.shareService.checkDirtyProperty('inspectionTime', fieldColorsList) ? manufacturingObj?.inspectionTime : inspectionTime;
      }

      if (processIndex >= 0 && processIndex !== filteredInsProcesses.length - 1) {
        inspectionTime = 0;
      }

      manufactureInfo.inspectionTime = inspectionTime;
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
        (((Number(manufactureInfo.skilledLaborRatePerHour) + Number(manufactureInfo.machineHourRate)) / 60) * Number(manufactureInfo.setUpTime)) / Number(manufactureInfo.lotSize)
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

    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost !== null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      let inspectionCost = this.shareService.isValidNumber(
        ((Number(manufactureInfo.qaOfInspectorRate) / 60) * Number(manufactureInfo.inspectionTime) * Math.ceil(Number(manufactureInfo.samplingRate / 100) * Number(manufactureInfo.lotSize))) /
          Number(manufactureInfo.lotSize)
      );
      if (manufactureInfo.inspectionCost !== null) {
        inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : this.shareService.isValidNumber(inspectionCost);
      }

      if (processIndex >= 0 && processIndex !== filteredInsProcesses.length - 1) {
        inspectionCost = 0;
      }

      manufactureInfo.inspectionCost = inspectionCost;
    }
    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost != null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      const sum = this.shareService.isValidNumber(
        Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
      );

      let yieldCost = this.shareService.isValidNumber(
        (1 - Number(manufactureInfo.yieldPer / 100)) * (Number(manufactureInfo.materialInfo.totalCost) + sum) -
          (1 - Number(manufactureInfo.yieldPer / 100)) * ((Number(manufactureInfo.materialInfo.weight) * Number(manufactureInfo.materialInfo.scrapPrice)) / 1000)
      );
      if (manufactureInfo.yieldCost != null) {
        yieldCost = this.shareService.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : yieldCost;
      }
      manufactureInfo.yieldCost = yieldCost;
    }

    manufactureInfo.directProcessCost = this.shareService.isValidNumber(
      Number(manufactureInfo.directLaborCost) +
        Number(manufactureInfo.directMachineCost) +
        Number(manufactureInfo.directSetUpCost) +
        Number(manufactureInfo.inspectionCost) +
        Number(manufactureInfo.yieldCost)
    );
    return manufactureInfo;
  }

  public calculationForOxyCutting(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    manufactureInfo = this.setSheetMetalObjectValues(manufactureInfo, fieldColorsList, manufacturingObj);
    const processIndex = manufactureInfo.processInfoList?.findIndex((x) => x.processTypeID === ProcessType.OxyCutting);
    const thickness = this.shareService.isValidNumber(Number(manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.dimUnfoldedZ));
    const sheetWeight = this.shareService.isValidNumber(Number(manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.coilWeight));
    const netWeight = this.shareService.isValidNumber(Number(manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.netWeight));
    const partsPerCoil = this.shareService.isValidNumber(Number(manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.partsPerCoil));
    const filteredInsProcesses = manufactureInfo.processInfoList?.filter((p) => ![ProcessType.Deburring, ProcessType.VisualInspection, ProcessType.Cleaning].includes(p.processTypeID)) || [];

    manufactureInfo.platenSizeLength = thickness;
    // Req. Bed Size
    manufactureInfo.requiredCurrent = manufactureInfo.materialInfoList[0]?.coilLength;
    manufactureInfo.requiredWeldingVoltage = manufactureInfo.materialInfoList[0]?.coilWidth;
    manufactureInfo.recBedSize = Math.round(manufactureInfo.materialInfoList[0]?.coilLength) + ' x ' + Math.round(manufactureInfo.materialInfoList[0]?.coilWidth);

    // selected bed sizes
    manufactureInfo.lengthOfCoated = manufactureInfo?.machineMaster?.bedLength;
    manufactureInfo.widthOfCoated = manufactureInfo?.machineMaster?.bedWidth;
    manufactureInfo.selectedBedSize = manufactureInfo?.machineMaster?.bedLength + ' x ' + manufactureInfo?.machineMaster?.bedWidth;

    if (manufactureInfo.isNoOfStartsPierceDirty && manufactureInfo.noOfStartsPierce !== null) {
      manufactureInfo.noOfStartsPierce = Number(manufactureInfo.noOfStartsPierce);
    } else {
      if (manufactureInfo.noOfStartsPierce !== null) {
        manufactureInfo.noOfStartsPierce = this.shareService.checkDirtyProperty('noOfStartsPierce', fieldColorsList)
          ? manufacturingObj?.noOfStartsPierce
          : this.shareService.isValidNumber(manufactureInfo.noOfStartsPierce);
      }
    }

    if (manufactureInfo.isQaInspectorRateDirty && manufactureInfo.qaOfInspectorRate !== null) {
      manufactureInfo.qaOfInspectorRate = Number(manufactureInfo.qaOfInspectorRate);
    } else {
      if (manufactureInfo.qaOfInspectorRate !== null) {
        manufactureInfo.qaOfInspectorRate = this.shareService.checkDirtyProperty('qaOfInspectorRate', fieldColorsList)
          ? manufacturingObj?.qaOfInspectorRate
          : this.shareService.isValidNumber(manufactureInfo.qaOfInspectorRate);
      }
      if (processIndex >= 0 && processIndex !== filteredInsProcesses.length - 1) {
        manufactureInfo.qaOfInspectorRate = 0;
      }
    }

    if (manufactureInfo.iscuttingSpeedDirty && manufactureInfo.cuttingSpeed !== null) {
      manufactureInfo.cuttingSpeed = Number(manufactureInfo.cuttingSpeed);
    } else {
      let cuttingSpeed = this._smConfig.getOxyCutSpeeds(thickness)?.oxySpeedMmPerMin / 1000 || 0;

      if (manufactureInfo.cuttingSpeed !== null) {
        manufactureInfo.cuttingSpeed = this.shareService.checkDirtyProperty('cuttingSpeed', fieldColorsList) ? manufacturingObj?.cuttingSpeed : this.shareService.isValidNumber(cuttingSpeed);
      }
      manufactureInfo.cuttingSpeed = this.shareService.isValidNumber(cuttingSpeed);
    }

    manufactureInfo.totalFactorySpaceRequired = manufactureInfo?.machineMaster?.workPieceHeight || 0;

    // Loading/Unloading Time
    let loadUnloadTime = 15;
    if (sheetWeight <= 10000) loadUnloadTime = 3;
    else if (sheetWeight <= 25000) loadUnloadTime = 7;
    else if (sheetWeight <= 50000) loadUnloadTime = 10;

    // unloading part time
    let unloadingPartTime = 60;
    if (netWeight < 1000) unloadingPartTime = 4;
    else if (netWeight < 5000) unloadingPartTime = 8;
    else if (netWeight < 10000) unloadingPartTime = 15;
    else if (netWeight < 25000) unloadingPartTime = 30;

    // Handling Time
    if (manufactureInfo.isRotationTimeDirty && manufactureInfo.rotationTime !== null) {
      manufactureInfo.rotationTime = Number(manufactureInfo.rotationTime);
    } else {
      let handlingTime = (loadUnloadTime * 60) / partsPerCoil + unloadingPartTime;
      if (manufactureInfo.rotationTime !== null) {
        handlingTime = this.shareService.checkDirtyProperty('rotationTime', fieldColorsList) ? manufacturingObj?.rotationTime : handlingTime;
      }
      manufactureInfo.rotationTime = this.shareService.isValidNumber(handlingTime);
    }

    // no Of Torches
    if (manufactureInfo.isNoOfHolesDirty && manufactureInfo.noOfHoles !== null) {
      manufactureInfo.noOfHoles = Number(manufactureInfo.noOfHoles);
    } else {
      let noOfTorches = 1;
      if (manufactureInfo.noOfHoles !== null) {
        noOfTorches = this.shareService.checkDirtyProperty('noOfHoles', fieldColorsList) ? manufacturingObj?.noOfHoles : noOfTorches;
      }
      manufactureInfo.noOfHoles = this.shareService.isValidNumber(noOfTorches);
    }

    //Cutting Time
    const cuttingSpeedInMm = Number(manufactureInfo.cuttingSpeed * 1000) || 0;
    const noOfTorches = Number(manufactureInfo.noOfHoles) || 1;
    if (cuttingSpeedInMm > 0) {
      let time = 0;
      if (noOfTorches === 2) {
        time = manufactureInfo.lengthOfCut / cuttingSpeedInMm / 1.85;
      } else if (noOfTorches === 3) {
        time = manufactureInfo.lengthOfCut / cuttingSpeedInMm / 2.7;
      } else {
        time = manufactureInfo.lengthOfCut / cuttingSpeedInMm / noOfTorches;
      }
      manufactureInfo.cuttingTime = this.shareService.isValidNumber(time * 60);
    } else {
      manufactureInfo.cuttingTime = this.shareService.isValidNumber(0);
    }

    const rapidTraverseTime =
      manufactureInfo.partComplexity === 1
        ? manufactureInfo.cuttingTime * 0.1
        : manufactureInfo.partComplexity === 2
          ? manufactureInfo.cuttingTime * 0.2
          : manufactureInfo.partComplexity === 3
            ? manufactureInfo.cuttingTime * 0.3
            : 0;

    const piercingSpeedConstant = this._smConfig.getOxyCutSpeeds(thickness)?.pierceSpeedMmPerSec || 0;
    manufactureInfo.piercingTime = this.shareService.isValidNumber(piercingSpeedConstant * Number(manufactureInfo.noOfStartsPierce));

    // Process Time
    if (manufactureInfo.isProcessTimeDirty && manufactureInfo.processTime !== null) {
      manufactureInfo.processTime = Number(manufactureInfo.processTime);
    } else {
      let processTime = this.shareService.isValidNumber(manufactureInfo.piercingTime + manufactureInfo.cuttingTime + rapidTraverseTime);

      if (manufactureInfo.processTime !== null) {
        processTime = this.shareService.checkDirtyProperty('processTime', fieldColorsList) ? manufacturingObj?.processTime : processTime;
      }
      manufactureInfo.processTime = this.shareService.isValidNumber(processTime);
    }

    const totalTime = this.shareService.isValidNumber(manufactureInfo.processTime + manufactureInfo.rotationTime);

    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime !== null) {
      //reused cycle time field as total time
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(totalTime / manufactureInfo.efficiency);
      if (manufactureInfo.cycleTime !== null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }
    if (manufactureInfo.isLowSkilledLaborRatePerHourDirty && manufactureInfo.lowSkilledLaborRatePerHour !== null) {
      manufactureInfo.lowSkilledLaborRatePerHour = Number(manufactureInfo.lowSkilledLaborRatePerHour);
    } else {
      manufactureInfo.lowSkilledLaborRatePerHour = this.shareService.checkDirtyProperty('lowSkilledLaborRatePerHour', fieldColorsList)
        ? manufacturingObj?.lowSkilledLaborRatePerHour
        : this.shareService.isValidNumber(manufactureInfo.lowSkilledLaborRatePerHour);
    }

    if (manufactureInfo.isinspectionTimeDirty && manufactureInfo.inspectionTime !== null) {
      manufactureInfo.inspectionTime = Number(manufactureInfo.inspectionTime);
    } else {
      let inspectionTime =
        manufactureInfo.partComplexity === PartComplexity.Low ? 2 : manufactureInfo.partComplexity === PartComplexity.Medium ? 5 : manufactureInfo.partComplexity == PartComplexity.High ? 10 : 0;
      if (manufactureInfo.inspectionTime !== null) {
        inspectionTime = this.shareService.checkDirtyProperty('inspectionTime', fieldColorsList) ? manufacturingObj?.inspectionTime : inspectionTime;
      }

      if (processIndex >= 0 && processIndex !== filteredInsProcesses.length - 1) {
        inspectionTime = 0;
      }

      manufactureInfo.inspectionTime = inspectionTime;
    }

    // Sampling Percentage
    if (manufactureInfo.isSamplingRateDirty && manufactureInfo.samplingRate !== null) {
      manufactureInfo.samplingRate = Number(manufactureInfo.samplingRate);
    } else {
      let samplingRate = manufactureInfo.partComplexity === 1 ? 5 : manufactureInfo.partComplexity === 2 ? 8 : 10;

      if (manufactureInfo.samplingRate !== null) {
        samplingRate = this.shareService.checkDirtyProperty('samplingRate', fieldColorsList) ? manufacturingObj?.samplingRate : samplingRate;
      }
      manufactureInfo.samplingRate = samplingRate;
    }

    // Yield Percentage
    if (manufactureInfo.isyieldPercentDirty && manufactureInfo.yieldPer !== null) {
      manufactureInfo.yieldPer = Number(manufactureInfo.yieldPer);
    } else {
      let yieldPer = manufactureInfo.partComplexity === 1 ? 98 : manufactureInfo.partComplexity === 2 ? 96 : 92;
      if (manufactureInfo.yieldPer !== null) {
        yieldPer = this.shareService.checkDirtyProperty('yieldPer', fieldColorsList) ? manufacturingObj?.yieldPer : yieldPer;
      }
      manufactureInfo.yieldPer = yieldPer;
    }

    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost !== null) {
      manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
    } else {
      let directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) / 3600) * Number(manufactureInfo.cycleTime));
      if (manufactureInfo.directMachineCost !== null) {
        directMachineCost = this.shareService.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : directMachineCost;
      }
      manufactureInfo.directMachineCost = directMachineCost;
    }

    manufactureInfo.noOfSkilledLabours = 1;
    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost !== null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      let directSetUpCost = this.shareService.isValidNumber(
        // (((Number(manufactureInfo.skilledLaborRatePerHour) + Number(manufactureInfo.machineHourRate)) / 60) * Number(manufactureInfo.setUpTime)) / Number(manufactureInfo.lotSize)

        ((manufactureInfo.lowSkilledLaborRatePerHour / 60) * (manufactureInfo.setUpTime * manufactureInfo.noOfLowSkilledLabours) +
          (manufactureInfo.skilledLaborRatePerHour / 60) * (manufactureInfo.setUpTime * manufactureInfo.noOfSkilledLabours) +
          (manufactureInfo.machineHourRate / 60) * manufactureInfo.setUpTime) /
          manufactureInfo.lotSize
      );
      if (manufactureInfo.directSetUpCost !== null) {
        directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.directSetUpCost : directSetUpCost;
      }
      manufactureInfo.directSetUpCost = directSetUpCost;
    }

    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost !== null) {
      manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
    } else {
      let directLaborCost = this.shareService.isValidNumber((Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) * (Number(totalTime) * Number(manufactureInfo.noOfLowSkilledLabours)));
      if (manufactureInfo.directLaborCost !== null) {
        directLaborCost = this.shareService.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : directLaborCost;
      }
      manufactureInfo.directLaborCost = directLaborCost;
    }

    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost !== null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      let inspectionCost = this.shareService.isValidNumber(
        ((Number(manufactureInfo.qaOfInspectorRate) / 60) * Number(manufactureInfo.inspectionTime) * Math.ceil(Number(manufactureInfo.samplingRate / 100) * Number(manufactureInfo.lotSize))) /
          Number(manufactureInfo.lotSize)
      );
      if (manufactureInfo.inspectionCost !== null) {
        inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : this.shareService.isValidNumber(inspectionCost);
      }

      if (processIndex >= 0 && processIndex !== filteredInsProcesses.length - 1) {
        inspectionCost = 0;
      }

      manufactureInfo.inspectionCost = inspectionCost;
    }
    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost !== null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      const sum = this.shareService.isValidNumber(
        Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
      );

      let yieldCost = this.shareService.isValidNumber(
        (1 - Number(manufactureInfo.yieldPer / 100)) * (Number(manufactureInfo.materialInfo.totalCost) + sum) -
          (1 - Number(manufactureInfo.yieldPer / 100)) * ((Number(manufactureInfo.materialInfo.weight) * Number(manufactureInfo.materialInfo.scrapPrice)) / 1000)
      );
      if (manufactureInfo.yieldCost !== null) {
        yieldCost = this.shareService.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : yieldCost;
      }
      manufactureInfo.yieldCost = yieldCost;
    }

    manufactureInfo.directProcessCost = this.shareService.isValidNumber(
      Number(manufactureInfo.directLaborCost) +
        Number(manufactureInfo.directMachineCost) +
        Number(manufactureInfo.directSetUpCost) +
        Number(manufactureInfo.inspectionCost) +
        Number(manufactureInfo.yieldCost)
    );
    return manufactureInfo;
  }

  public calculationForTubeLaser(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    manufactureInfo = this.setSheetMetalObjectValues(manufactureInfo, fieldColorsList, manufacturingObj);
    // const processIndex = manufactureInfo.processInfoList?.findIndex((x) => x.processTypeID === ProcessType.TubeLaser);
    const thickness = this.shareService.isValidNumber(Number(manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.dimUnfoldedZ));
    // const filteredInsProcesses = manufactureInfo.processInfoList?.filter((p) => ![ProcessType.Deburring, ProcessType.VisualInspection, ProcessType.Cleaning].includes(p.processTypeID)) || [];
    const materialType = this._smConfig.mapMaterial(manufactureInfo.materialmasterDatas?.materialType?.materialTypeName);

    manufactureInfo.platenSizeLength = thickness;
    // Req. Bed Size
    manufactureInfo.requiredCurrent = manufactureInfo.materialInfoList[0]?.coilLength;
    manufactureInfo.requiredWeldingVoltage = manufactureInfo.materialInfoList[0]?.coilWidth;
    manufactureInfo.recBedSize = Math.round(manufactureInfo.materialInfoList[0]?.coilLength) + ' x ' + Math.round(manufactureInfo.materialInfoList[0]?.coilWidth);

    // selected bed sizes
    manufactureInfo.lengthOfCoated = manufactureInfo?.machineMaster?.bedLength;
    manufactureInfo.widthOfCoated = manufactureInfo?.machineMaster?.bedWidth;
    manufactureInfo.selectedBedSize = manufactureInfo?.machineMaster?.bedLength + ' x ' + manufactureInfo?.machineMaster?.bedWidth;

    if (manufactureInfo.isLengthOfCutDirty && manufactureInfo.lengthOfCut !== null) {
      manufactureInfo.lengthOfCut = Number(manufactureInfo.lengthOfCut);
    } else {
      let lengthOfCut = this.shareService.isValidNumber(this.shareService.extractedProcessData?.LengthOfCut || 0);

      if (manufactureInfo.lengthOfCut !== null) {
        lengthOfCut = this.shareService.checkDirtyProperty('lengthOfCut', fieldColorsList) ? manufacturingObj?.lengthOfCut : this.shareService.isValidNumber(lengthOfCut);
      }
      manufactureInfo.lengthOfCut = this.shareService.isValidNumber(lengthOfCut);
    }

    if (manufactureInfo.isNoOfStartsPierceDirty && manufactureInfo.noOfStartsPierce !== null) {
      manufactureInfo.noOfStartsPierce = Number(manufactureInfo.noOfStartsPierce);
    } else {
      let noOfStartsPierce = this.shareService.isValidNumber(this.shareService.extractedProcessData?.NoOfStartsPierce || 0);

      if (manufactureInfo.noOfStartsPierce !== null) {
        noOfStartsPierce = this.shareService.checkDirtyProperty('noOfStartsPierce', fieldColorsList) ? manufacturingObj?.noOfStartsPierce : this.shareService.isValidNumber(noOfStartsPierce);
      }
      manufactureInfo.noOfStartsPierce = this.shareService.isValidNumber(noOfStartsPierce);
    }

    if (manufactureInfo.isQaInspectorRateDirty && manufactureInfo.qaOfInspectorRate !== null) {
      manufactureInfo.qaOfInspectorRate = Number(manufactureInfo.qaOfInspectorRate);
    } else {
      if (manufactureInfo.qaOfInspectorRate !== null) {
        manufactureInfo.qaOfInspectorRate = this.shareService.checkDirtyProperty('qaOfInspectorRate', fieldColorsList)
          ? manufacturingObj?.qaOfInspectorRate
          : this.shareService.isValidNumber(manufactureInfo.qaOfInspectorRate);
      }
      // if (processIndex >= 0 && processIndex !== filteredInsProcesses.length - 1) {
      //   manufactureInfo.qaOfInspectorRate = 0;
      // }
    }
    const watts = this._smConfig.extractWatts(manufactureInfo?.machineMaster?.machineName || '');

    if (manufactureInfo.iscuttingSpeedDirty && manufactureInfo.cuttingSpeed !== null) {
      manufactureInfo.cuttingSpeed = Number(manufactureInfo.cuttingSpeed);
    } else {
      let cuttingSpeed = this._smConfig.getTubeLaserCuttingSpeed(materialType, thickness, watts)?.speed || 0;

      if (manufactureInfo.cuttingSpeed !== null) {
        cuttingSpeed = this.shareService.checkDirtyProperty('cuttingSpeed', fieldColorsList) ? manufacturingObj?.cuttingSpeed : this.shareService.isValidNumber(cuttingSpeed);
      }
      manufactureInfo.cuttingSpeed = this.shareService.isValidNumber(cuttingSpeed);
    }

    if (manufactureInfo.isCuttingTimeDirty && manufactureInfo.cuttingTime !== null) {
      manufactureInfo.cuttingTime = Number(manufactureInfo.cuttingTime);
    } else {
      let cuttingTime = (manufactureInfo.lengthOfCut / 1000 / manufactureInfo.cuttingSpeed) * 60;

      if (manufactureInfo.cuttingTime !== null) {
        cuttingTime = this.shareService.checkDirtyProperty('cuttingTime', fieldColorsList) ? manufacturingObj?.cuttingTime : this.shareService.isValidNumber(cuttingTime);
      }
      manufactureInfo.cuttingTime = this.shareService.isValidNumber(cuttingTime);
    }

    if (manufactureInfo.iscoolingTimeDirty && manufactureInfo.coolingTime !== null) {
      manufactureInfo.coolingTime = Number(manufactureInfo.coolingTime);
    } else {
      let rapidReverseTime =
        (manufactureInfo.partComplexity === 1
          ? manufactureInfo.cuttingTime * 0.05
          : manufactureInfo.partComplexity === 2
            ? manufactureInfo.cuttingTime * 0.1
            : manufactureInfo.partComplexity === 3
              ? manufactureInfo.cuttingTime * 0.15
              : 0) / 60;
      if (manufactureInfo.coolingTime !== null) {
        rapidReverseTime = this.shareService.checkDirtyProperty('coolingTime', fieldColorsList) ? manufacturingObj?.coolingTime : this.shareService.isValidNumber(rapidReverseTime);
      }
      manufactureInfo.coolingTime = this.shareService.isValidNumber(rapidReverseTime);
    }

    if (manufactureInfo.issoakingTimeDirty && manufactureInfo.soakingTime !== null) {
      manufactureInfo.soakingTime = Number(manufactureInfo.soakingTime);
    } else {
      const pierceTimeConstant = this._smConfig.getTubeLaserPiercingTime(materialType, thickness, watts) || 0;
      let piercingTime = this.shareService.isValidNumber(((pierceTimeConstant * Number(manufactureInfo.noOfStartsPierce)) / 60) * 60);

      if (manufactureInfo.soakingTime !== null) {
        piercingTime = this.shareService.checkDirtyProperty('soakingTime', fieldColorsList) ? manufacturingObj?.soakingTime : this.shareService.isValidNumber(piercingTime);
      }
      manufactureInfo.soakingTime = this.shareService.isValidNumber(piercingTime);
    }

    const totalTime = this.shareService.isValidNumber(manufactureInfo.piercingTime + manufactureInfo.cuttingTime + manufactureInfo.coolingTime);

    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime !== null) {
      //reused cycle time field as total time
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(totalTime / manufactureInfo.efficiency); //
      if (manufactureInfo.cycleTime !== null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }
    if (manufactureInfo.isLowSkilledLaborRatePerHourDirty && !!manufactureInfo.lowSkilledLaborRatePerHour) {
      manufactureInfo.lowSkilledLaborRatePerHour = Number(manufactureInfo.lowSkilledLaborRatePerHour);
    } else {
      manufactureInfo.lowSkilledLaborRatePerHour = this.shareService.checkDirtyProperty('lowSkilledLaborRatePerHour', fieldColorsList)
        ? manufacturingObj?.lowSkilledLaborRatePerHour
        : this.shareService.isValidNumber(manufactureInfo.lowSkilledLaborRatePerHour);
    }

    if (manufactureInfo.isNoOfLowSkilledLaboursDirty && manufactureInfo.noOfLowSkilledLabours !== null) {
      manufactureInfo.noOfLowSkilledLabours = Number(manufactureInfo.noOfLowSkilledLabours);
    } else {
      manufactureInfo.noOfLowSkilledLabours = this.shareService.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList)
        ? manufacturingObj?.noOfLowSkilledLabours
        : this.shareService.isValidNumber(manufactureInfo.noOfLowSkilledLabours);
    }

    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime !== null) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      let setUpTime = 0;
      if (watts <= 2000) setUpTime = 15;
      else if (watts >= 2001 && watts < 6000) setUpTime = 20;
      else if (watts >= 6000) setUpTime = 30;
      if (manufactureInfo.setUpTime !== null) {
        setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : setUpTime;
      }
      manufactureInfo.setUpTime = setUpTime;
    }

    if (manufactureInfo.isinspectionTimeDirty && manufactureInfo.inspectionTime !== null) {
      manufactureInfo.inspectionTime = Number(manufactureInfo.inspectionTime);
    } else {
      let inspectionTime =
        manufactureInfo.partComplexity === PartComplexity.Low ? 2 : manufactureInfo.partComplexity === PartComplexity.Medium ? 5 : manufactureInfo.partComplexity == PartComplexity.High ? 10 : 0;
      if (manufactureInfo.inspectionTime !== null) {
        inspectionTime = this.shareService.checkDirtyProperty('inspectionTime', fieldColorsList) ? manufacturingObj?.inspectionTime : inspectionTime;
      }

      // if (processIndex >= 0 && processIndex !== filteredInsProcesses.length - 1) {
      //   inspectionTime = 0;
      // }

      manufactureInfo.inspectionTime = inspectionTime;
    }

    // Sampling Percentage
    if (manufactureInfo.isSamplingRateDirty && manufactureInfo.samplingRate !== null) {
      manufactureInfo.samplingRate = Number(manufactureInfo.samplingRate);
    } else {
      let samplingRate = manufactureInfo.partComplexity === 1 ? 5 : manufactureInfo.partComplexity === 2 ? 8 : 10;

      if (manufactureInfo.samplingRate !== null) {
        samplingRate = this.shareService.checkDirtyProperty('samplingRate', fieldColorsList) ? manufacturingObj?.samplingRate : samplingRate;
      }
      manufactureInfo.samplingRate = samplingRate;
    }

    // Yield Percentage
    if (manufactureInfo.isyieldPercentDirty && manufactureInfo.yieldPer !== null) {
      manufactureInfo.yieldPer = Number(manufactureInfo.yieldPer);
    } else {
      let yieldPer = manufactureInfo.partComplexity === 1 ? 98 : manufactureInfo.partComplexity === 2 ? 96 : 92;
      if (manufactureInfo.yieldPer !== null) {
        yieldPer = this.shareService.checkDirtyProperty('yieldPer', fieldColorsList) ? manufacturingObj?.yieldPer : yieldPer;
      }
      manufactureInfo.yieldPer = yieldPer;
    }

    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost !== null) {
      manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
    } else {
      let directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) / 3600) * Number(manufactureInfo.cycleTime));
      if (manufactureInfo.directMachineCost !== null) {
        directMachineCost = this.shareService.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : directMachineCost;
      }
      manufactureInfo.directMachineCost = directMachineCost;
    }

    manufactureInfo.noOfSkilledLabours = manufactureInfo.noOfSkilledLabours || 1;
    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost !== null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      let directSetUpCost = this.shareService.isValidNumber(
        // (((Number(manufactureInfo.skilledLaborRatePerHour) + Number(manufactureInfo.machineHourRate)) / 60) * Number(manufactureInfo.setUpTime)) / Number(manufactureInfo.lotSize)

        ((manufactureInfo.lowSkilledLaborRatePerHour / 60) * (manufactureInfo.setUpTime * manufactureInfo.noOfLowSkilledLabours) +
          (manufactureInfo.skilledLaborRatePerHour / 60) * (manufactureInfo.setUpTime * manufactureInfo.noOfSkilledLabours) +
          (manufactureInfo.machineHourRate / 60) * manufactureInfo.setUpTime) /
          manufactureInfo.lotSize
      );
      if (manufactureInfo.directSetUpCost !== null) {
        directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.directSetUpCost : directSetUpCost;
      }
      manufactureInfo.directSetUpCost = directSetUpCost;
    }

    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost !== null) {
      manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
    } else {
      let directLaborCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) * (Number(manufactureInfo.cycleTime) * Number(manufactureInfo.noOfLowSkilledLabours))
      );
      if (manufactureInfo.directLaborCost !== null) {
        directLaborCost = this.shareService.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : directLaborCost;
      }
      manufactureInfo.directLaborCost = directLaborCost;
    }

    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost !== null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      let inspectionCost = this.shareService.isValidNumber(
        ((Number(manufactureInfo.qaOfInspectorRate) / 60) * Number(manufactureInfo.inspectionTime) * Number(manufactureInfo.samplingRate / 100) * Number(manufactureInfo.lotSize)) /
          Number(manufactureInfo.lotSize)
      );
      if (manufactureInfo.inspectionCost !== null) {
        inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : this.shareService.isValidNumber(inspectionCost);
      }

      // if (processIndex >= 0 && processIndex !== filteredInsProcesses.length - 1) {
      //   inspectionCost = 0;
      // }

      manufactureInfo.inspectionCost = inspectionCost;
    }
    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost !== null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      const sum = this.shareService.isValidNumber(
        Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
      );

      let yieldCost = this.shareService.isValidNumber(
        (1 - Number(manufactureInfo.yieldPer / 100)) * (Number(manufactureInfo.materialInfo.totalCost) + sum) -
          (1 - Number(manufactureInfo.yieldPer / 100)) * ((Number(manufactureInfo.materialInfo.weight) * Number(manufactureInfo.materialInfo.scrapPrice)) / 1000)
      );
      if (manufactureInfo.yieldCost !== null) {
        yieldCost = this.shareService.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : yieldCost;
      }
      manufactureInfo.yieldCost = yieldCost;
    }

    manufactureInfo.directProcessCost = this.shareService.isValidNumber(
      Number(manufactureInfo.directLaborCost) +
        Number(manufactureInfo.directMachineCost) +
        Number(manufactureInfo.directSetUpCost) +
        Number(manufactureInfo.inspectionCost) +
        Number(manufactureInfo.yieldCost)
    );
    return manufactureInfo;
  }

  public calculationForTubeBendingMetal(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    manufactureInfo = this.setSheetMetalObjectValues(manufactureInfo, fieldColorsList, manufacturingObj);
    // const processIndex = manufactureInfo.processInfoList?.findIndex((x) => x.processTypeID === ProcessType.TubeLaser);
    const thickness = this.shareService.isValidNumber(Number(manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.dimUnfoldedZ));
    // const filteredInsProcesses = manufactureInfo.processInfoList?.filter((p) => ![ProcessType.Deburring, ProcessType.VisualInspection, ProcessType.Cleaning].includes(p.processTypeID)) || [];
    // const materialType = this._smConfig.mapMaterial(manufactureInfo.materialmasterDatas?.materialType?.materialTypeName);

    const materialInfo = manufactureInfo?.materialInfoList.length > 0 ? manufactureInfo?.materialInfoList[0] : null;

    manufactureInfo.platenSizeLength = thickness;
    // Req. Bed Size
    manufactureInfo.requiredCurrent = manufactureInfo.materialInfoList[0]?.coilLength;
    manufactureInfo.requiredWeldingVoltage = manufactureInfo.materialInfoList[0]?.coilWidth;
    manufactureInfo.recBedSize = Math.round(manufactureInfo.materialInfoList[0]?.coilLength) + ' x ' + Math.round(manufactureInfo.materialInfoList[0]?.coilWidth);

    // selected bed sizes
    manufactureInfo.lengthOfCoated = manufactureInfo?.machineMaster?.bedLength;
    manufactureInfo.widthOfCoated = manufactureInfo?.machineMaster?.bedWidth;
    manufactureInfo.selectedBedSize = manufactureInfo?.machineMaster?.bedLength + ' x ' + manufactureInfo?.machineMaster?.bedWidth;

    const bendingInfo = this.shareService.extractedProcessData?.ProcessBendingInfo;
    const bendCounts = bendingInfo ? this._smConfig.countBendsInAngleBucketsForTubeBending(bendingInfo) : null;

    // No's of Bend Angle <45°
    if (manufactureInfo.isNoOfStartsPierceDirty && manufactureInfo.noOfStartsPierce !== null) {
      manufactureInfo.noOfStartsPierce = Number(manufactureInfo.noOfStartsPierce);
    } else {
      let noOfBends45 = bendCounts?.lessThan45 || 0;

      if (manufactureInfo.noOfStartsPierce !== null) {
        noOfBends45 = this.shareService.checkDirtyProperty('noOfStartsPierce', fieldColorsList) ? manufacturingObj?.noOfStartsPierce : this.shareService.isValidNumber(noOfBends45);
      }
      manufactureInfo.noOfStartsPierce = this.shareService.isValidNumber(noOfBends45);
    }

    // between45And90
    if (manufactureInfo.isNoOfHitsRequiredDirty && manufactureInfo.noOfHitsRequired !== null) {
      manufactureInfo.noOfHitsRequired = Number(manufactureInfo.noOfHitsRequired);
    } else {
      let between45And90 = bendCounts?.between45And90 || 0;

      if (manufactureInfo.noOfHitsRequired !== null) {
        between45And90 = this.shareService.checkDirtyProperty('noOfHitsRequired', fieldColorsList) ? manufacturingObj?.noOfHitsRequired : this.shareService.isValidNumber(between45And90);
      }
      manufactureInfo.noOfHitsRequired = this.shareService.isValidNumber(between45And90);
    }

    // No's of Bend Angle 135
    if (manufactureInfo.isNoOfHolesDirty && manufactureInfo.noOfHoles !== null) {
      manufactureInfo.noOfHoles = Number(manufactureInfo.noOfHoles);
    } else {
      let noOfBends135 = bendCounts?.between90And135 || 0;

      if (manufactureInfo.noOfHoles !== null) {
        noOfBends135 = this.shareService.checkDirtyProperty('noOfHoles', fieldColorsList) ? manufacturingObj?.noOfHoles : this.shareService.isValidNumber(noOfBends135);
      }
      manufactureInfo.noOfHoles = this.shareService.isValidNumber(noOfBends135);
    }

    // No's of Bend Angle 180°
    if (manufactureInfo.isNoOfStrokesDirty && manufactureInfo.noofStroke !== null) {
      manufactureInfo.noofStroke = Number(manufactureInfo.noofStroke);
    } else {
      let noOfBends180 = bendCounts?.between135And180 || 0;

      if (manufactureInfo.noofStroke !== null) {
        noOfBends180 = this.shareService.checkDirtyProperty('noofStroke', fieldColorsList) ? manufacturingObj?.noofStroke : this.shareService.isValidNumber(noOfBends180);
      }
      manufactureInfo.noofStroke = this.shareService.isValidNumber(noOfBends180);
    }

    // no of profile bends
    if (manufactureInfo.isnoOfCoreDirty && manufactureInfo.noOfCore !== null) {
      manufactureInfo.noOfCore = Number(manufactureInfo.noOfCore);
    } else {
      let noOfProfileBends = this.shareService.isValidNumber(1); // Default 1 profile bend

      if (manufactureInfo.noOfCore !== null) {
        noOfProfileBends = this.shareService.checkDirtyProperty('noOfCore', fieldColorsList) ? manufacturingObj?.noOfCore : this.shareService.isValidNumber(noOfProfileBends);
      }
      manufactureInfo.noOfCore = this.shareService.isValidNumber(noOfProfileBends);
    }

    // total no of bends
    if (manufactureInfo.isNoOfBends && manufactureInfo.noOfbends !== null) {
      manufactureInfo.noOfbends = Number(manufactureInfo.noOfbends);
    } else {
      let noOfbends = manufactureInfo.noOfStartsPierce + manufactureInfo.noOfHitsRequired + manufactureInfo.noOfHoles + manufactureInfo.noofStroke + manufactureInfo.noOfCore;
      if (manufactureInfo.noOfbends !== null) {
        noOfbends = this.shareService.checkDirtyProperty('noOfbends', fieldColorsList) ? manufacturingObj?.noOfbends : this.shareService.isValidNumber(noOfbends);
      }
      manufactureInfo.noOfbends = this.shareService.isValidNumber(noOfbends);
    }

    // clamp stroke
    if (manufactureInfo.isLengthOfCutDirty && manufactureInfo.lengthOfCut !== null) {
      manufactureInfo.lengthOfCut = Number(manufactureInfo.lengthOfCut);
    } else {
      let clampStroke = 40;

      if (manufactureInfo.lengthOfCut !== null) {
        clampStroke = this.shareService.checkDirtyProperty('lengthOfCut', fieldColorsList) ? manufacturingObj?.lengthOfCut : this.shareService.isValidNumber(clampStroke);
      }
      manufactureInfo.lengthOfCut = this.shareService.isValidNumber(clampStroke);
    }

    // clamp spped
    if (manufactureInfo.iscuttingSpeedDirty && manufactureInfo.cuttingSpeed !== null) {
      manufactureInfo.cuttingSpeed = Number(manufactureInfo.cuttingSpeed);
    } else {
      let clampSpeed = 20;

      if (manufactureInfo.cuttingSpeed !== null) {
        clampSpeed = this.shareService.checkDirtyProperty('cuttingSpeed', fieldColorsList) ? manufacturingObj?.cuttingSpeed : this.shareService.isValidNumber(clampSpeed);
      }
      manufactureInfo.cuttingSpeed = this.shareService.isValidNumber(clampSpeed);
    }

    // Clamping & Declamping Time (Sec)
    if (manufactureInfo.isCuttingTimeDirty && manufactureInfo.cuttingTime !== null) {
      manufactureInfo.cuttingTime = Number(manufactureInfo.cuttingTime);
    } else {
      let clampingDeclampingTime = manufactureInfo.noOfbends * (manufactureInfo.lengthOfCut / manufactureInfo.cuttingSpeed);

      if (manufactureInfo.cuttingTime !== null) {
        clampingDeclampingTime = this.shareService.checkDirtyProperty('cuttingTime', fieldColorsList) ? manufacturingObj?.cuttingTime : this.shareService.isValidNumber(clampingDeclampingTime);
      }
      manufactureInfo.cuttingTime = this.shareService.isValidNumber(clampingDeclampingTime);
    }

    // Tube Positioning Time (Sec)
    if (manufactureInfo.ispouringTimeDirty && manufactureInfo.pouringTime !== null) {
      manufactureInfo.pouringTime = Number(manufactureInfo.pouringTime);
    } else {
      let tubePositioningTime = manufactureInfo.noOfbends - 1;

      if (manufactureInfo.pouringTime !== null) {
        tubePositioningTime = this.shareService.checkDirtyProperty('pouringTime', fieldColorsList) ? manufacturingObj?.pouringTime : this.shareService.isValidNumber(tubePositioningTime);
      }
      manufactureInfo.pouringTime = this.shareService.isValidNumber(tubePositioningTime);
    }

    // Tube Rotation Time (Sec)
    if (manufactureInfo.isRotationTimeDirty && manufactureInfo.rotationTime !== null) {
      manufactureInfo.rotationTime = Number(manufactureInfo.rotationTime);
    } else {
      let rotationTime = manufactureInfo.noOfbends - 1;

      if (manufactureInfo.rotationTime !== null) {
        rotationTime = this.shareService.checkDirtyProperty('rotationTime', fieldColorsList) ? manufacturingObj?.rotationTime : this.shareService.isValidNumber(rotationTime);
      }
      manufactureInfo.rotationTime = this.shareService.isValidNumber(rotationTime);
    }

    // unloading time

    const ut = materialInfo?.netWeight / 1000;
    const unloadingTime = ut <= 0.5 ? 6 : ut <= 1 ? 10 : ut <= 3 ? 15 : ut <= 5 ? 20 : ut <= 8 ? 30 : ut <= 10 ? 90 : ut <= 12 ? 120 : ut <= 30 ? 240 : ut <= 50 ? 360 : 500; // or a default value if needed
    const loadingTime = unloadingTime * 1.25;

    const bendLength = this.shareService.extractedProcessData?.BendingLineLength || 0;

    // Profile Bend Time (Sec)
    if (manufactureInfo.isinjectionTimeDirty && manufactureInfo.injectionTime !== null) {
      manufactureInfo.injectionTime = Number(manufactureInfo.injectionTime);
    } else {
      const bendingSpeedDegSec = this._smConfig.getMachineSpecs(manufactureInfo?.machineMaster?.machineName)?.bendingSpeedDegPerSec; // TODO: Need Machine Data
      let profileBendTime =
        (materialInfo.moldBoxLength <= 15
          ? bendLength / bendingSpeedDegSec / 2
          : materialInfo.moldBoxLength <= 30
            ? bendLength / bendingSpeedDegSec / 2
            : materialInfo.moldBoxLength <= 50
              ? bendLength / bendingSpeedDegSec / 2
              : materialInfo.moldBoxLength <= 100
                ? bendLength / bendingSpeedDegSec / 2
                : materialInfo.moldBoxLength <= 150
                  ? bendLength / bendingSpeedDegSec / 2
                  : 0) / 0.2;

      if (manufactureInfo.injectionTime !== null) {
        profileBendTime = this.shareService.checkDirtyProperty('injectionTime', fieldColorsList) ? manufacturingObj?.injectionTime : this.shareService.isValidNumber(profileBendTime);
      }
      manufactureInfo.injectionTime = this.shareService.isValidNumber(profileBendTime);
    }

    // Tube Bend Time (Sec)
    if (manufactureInfo.isProcessTimeDirty && manufactureInfo.processTime !== null) {
      manufactureInfo.processTime = Number(manufactureInfo.processTime);
    } else {
      const angles = this._smConfig.computeAnglesForTubeBending(manufactureInfo, materialInfo);

      let tubeBendingTime =
        manufactureInfo.noOfStartsPierce * angles?.angle45 +
        manufactureInfo.noOfHitsRequired * angles?.angle90 +
        manufactureInfo.noOfHoles * angles?.angle135 +
        manufactureInfo.noofStroke * angles?.angle180;

      if (manufactureInfo.processTime !== null) {
        tubeBendingTime = this.shareService.checkDirtyProperty('processTime', fieldColorsList) ? manufacturingObj?.processTime : this.shareService.isValidNumber(tubeBendingTime);
      }
      manufactureInfo.processTime = this.shareService.isValidNumber(tubeBendingTime);
    }

    // Total time
    if (manufactureInfo.isTotalTimeDirty && manufactureInfo.totalTime !== null) {
      manufactureInfo.totalTime = Number(manufactureInfo.totalTime);
    } else {
      let totalTime =
        loadingTime + unloadingTime + manufactureInfo.cuttingTime + manufactureInfo.pouringTime + manufactureInfo.rotationTime + manufactureInfo.injectionTime + manufactureInfo.processTime;

      if (manufactureInfo.totalTime !== null) {
        totalTime = this.shareService.checkDirtyProperty('totalTime', fieldColorsList) ? manufacturingObj?.totalTime : this.shareService.isValidNumber(totalTime);
      }
      manufactureInfo.totalTime = this.shareService.isValidNumber(totalTime);
    }

    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime !== null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(manufactureInfo.totalTime); // / manufactureInfo.efficiency
      if (manufactureInfo.cycleTime !== null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    if (manufactureInfo.isQaInspectorRateDirty && manufactureInfo.qaOfInspectorRate !== null) {
      manufactureInfo.qaOfInspectorRate = Number(manufactureInfo.qaOfInspectorRate);
    } else {
      if (manufactureInfo.qaOfInspectorRate !== null) {
        manufactureInfo.qaOfInspectorRate = this.shareService.checkDirtyProperty('qaOfInspectorRate', fieldColorsList)
          ? manufacturingObj?.qaOfInspectorRate
          : this.shareService.isValidNumber(manufactureInfo.qaOfInspectorRate);
      }
    }

    if (manufactureInfo.isLowSkilledLaborRatePerHourDirty && !!manufactureInfo.lowSkilledLaborRatePerHour) {
      manufactureInfo.lowSkilledLaborRatePerHour = Number(manufactureInfo.lowSkilledLaborRatePerHour);
    } else {
      manufactureInfo.lowSkilledLaborRatePerHour = this.shareService.checkDirtyProperty('lowSkilledLaborRatePerHour', fieldColorsList)
        ? manufacturingObj?.lowSkilledLaborRatePerHour
        : this.shareService.isValidNumber(manufactureInfo.lowSkilledLaborRatePerHour);
    }

    if (manufactureInfo.isNoOfLowSkilledLaboursDirty && manufactureInfo.noOfLowSkilledLabours !== null) {
      manufactureInfo.noOfLowSkilledLabours = Number(manufactureInfo.noOfLowSkilledLabours);
    } else {
      manufactureInfo.noOfLowSkilledLabours = this.shareService.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList)
        ? manufacturingObj?.noOfLowSkilledLabours
        : this.shareService.isValidNumber(manufactureInfo.noOfLowSkilledLabours);
    }

    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime !== null) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      let setUpTime = 20;

      if (manufactureInfo.setUpTime !== null) {
        setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : setUpTime;
      }
      manufactureInfo.setUpTime = setUpTime;
    }

    if (manufactureInfo.isinspectionTimeDirty && manufactureInfo.inspectionTime !== null) {
      manufactureInfo.inspectionTime = Number(manufactureInfo.inspectionTime);
    } else {
      let inspectionTime =
        manufactureInfo.partComplexity === PartComplexity.Low ? 2 : manufactureInfo.partComplexity === PartComplexity.Medium ? 5 : manufactureInfo.partComplexity == PartComplexity.High ? 10 : 0;
      if (manufactureInfo.inspectionTime !== null) {
        inspectionTime = this.shareService.checkDirtyProperty('inspectionTime', fieldColorsList) ? manufacturingObj?.inspectionTime : inspectionTime;
      }

      manufactureInfo.inspectionTime = inspectionTime;
    }

    // Sampling Percentage
    if (manufactureInfo.isSamplingRateDirty && manufactureInfo.samplingRate !== null) {
      manufactureInfo.samplingRate = Number(manufactureInfo.samplingRate);
    } else {
      let samplingRate = manufactureInfo.partComplexity === 1 ? 5 : manufactureInfo.partComplexity === 2 ? 8 : 10;

      if (manufactureInfo.samplingRate !== null) {
        samplingRate = this.shareService.checkDirtyProperty('samplingRate', fieldColorsList) ? manufacturingObj?.samplingRate : samplingRate;
      }
      manufactureInfo.samplingRate = samplingRate;
    }

    // Yield Percentage
    if (manufactureInfo.isyieldPercentDirty && manufactureInfo.yieldPer !== null) {
      manufactureInfo.yieldPer = Number(manufactureInfo.yieldPer);
    } else {
      let yieldPer = manufactureInfo.partComplexity === 1 ? 98 : manufactureInfo.partComplexity === 2 ? 96 : 92;
      if (manufactureInfo.yieldPer !== null) {
        yieldPer = this.shareService.checkDirtyProperty('yieldPer', fieldColorsList) ? manufacturingObj?.yieldPer : yieldPer;
      }
      manufactureInfo.yieldPer = yieldPer;
    }

    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost !== null) {
      manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
    } else {
      let directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) / 3600) * Number(manufactureInfo.cycleTime));
      if (manufactureInfo.directMachineCost !== null) {
        directMachineCost = this.shareService.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : directMachineCost;
      }
      manufactureInfo.directMachineCost = directMachineCost;
    }

    manufactureInfo.noOfSkilledLabours = 1;
    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost !== null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      let directSetUpCost = this.shareService.isValidNumber(
        // (((Number(manufactureInfo.skilledLaborRatePerHour) + Number(manufactureInfo.machineHourRate)) / 60) * Number(manufactureInfo.setUpTime)) / Number(manufactureInfo.lotSize)

        ((manufactureInfo.lowSkilledLaborRatePerHour / 60) * (manufactureInfo.setUpTime * manufactureInfo.noOfLowSkilledLabours) +
          (manufactureInfo.skilledLaborRatePerHour / 60) * (manufactureInfo.setUpTime * manufactureInfo.noOfSkilledLabours) +
          (manufactureInfo.machineHourRate / 60) * manufactureInfo.setUpTime) /
          manufactureInfo.lotSize
      );
      if (manufactureInfo.directSetUpCost !== null) {
        directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.directSetUpCost : directSetUpCost;
      }
      manufactureInfo.directSetUpCost = directSetUpCost;
    }

    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost !== null) {
      manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
    } else {
      let directLaborCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) * (Number(manufactureInfo.cycleTime) * Number(manufactureInfo.noOfLowSkilledLabours))
      );
      if (manufactureInfo.directLaborCost !== null) {
        directLaborCost = this.shareService.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : directLaborCost;
      }
      manufactureInfo.directLaborCost = directLaborCost;
    }

    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost !== null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      let inspectionCost = this.shareService.isValidNumber(
        ((Number(manufactureInfo.qaOfInspectorRate) / 60) * Number(manufactureInfo.inspectionTime) * Number(manufactureInfo.samplingRate / 100) * Number(manufactureInfo.lotSize)) /
          Number(manufactureInfo.lotSize)
      );
      if (manufactureInfo.inspectionCost !== null) {
        inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : this.shareService.isValidNumber(inspectionCost);
      }

      // if (processIndex >= 0 && processIndex !== filteredInsProcesses.length - 1) {
      //   inspectionCost = 0;
      // }

      manufactureInfo.inspectionCost = inspectionCost;
    }
    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost !== null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      const sum = this.shareService.isValidNumber(
        Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
      );

      let yieldCost = this.shareService.isValidNumber(
        (1 - Number(manufactureInfo.yieldPer / 100)) * (Number(manufactureInfo.materialInfo.totalCost) + sum) -
          (1 - Number(manufactureInfo.yieldPer / 100)) * ((Number(manufactureInfo.materialInfo.weight) * Number(manufactureInfo.materialInfo.scrapPrice)) / 1000)
      );
      if (manufactureInfo.yieldCost !== null) {
        yieldCost = this.shareService.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : yieldCost;
      }
      manufactureInfo.yieldCost = yieldCost;
    }

    manufactureInfo.directProcessCost = this.shareService.isValidNumber(
      Number(manufactureInfo.directLaborCost) +
        Number(manufactureInfo.directMachineCost) +
        Number(manufactureInfo.directSetUpCost) +
        Number(manufactureInfo.inspectionCost) +
        Number(manufactureInfo.yieldCost)
    );
    return manufactureInfo;
  }

  public calculationForShearing(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    manufactureInfo = this.setSheetMetalObjectValues(manufactureInfo, fieldColorsList, manufacturingObj);
    const materialType = this._smConfig.mapMaterial(manufactureInfo.materialmasterDatas?.materialType?.materialTypeName);
    const hasValue = (val) => val != null && val !== '';

    // Shear strength of material (Mpa)
    const shearingStrength = this.shareService.isValidNumber(manufactureInfo?.materialmasterDatas?.shearingStrength) || 0;

    // Req Tonnage
    const calculatedShearingTonnage = (manufactureInfo?.materialInfoList?.[0]?.dimUnfoldedZ * shearingStrength * manufactureInfo?.materialInfoList?.[0]?.dimUnfoldedX) / 9806 || 0;
    manufactureInfo.recommendTonnage = Math.ceil(calculatedShearingTonnage * 10) / 10;
    manufactureInfo.totalTonnageRequired = this.shareService.isValidNumber(manufactureInfo.recommendTonnage);

    // selected tonnage
    manufactureInfo.selectedTonnage = manufactureInfo?.machineMaster?.machineTonnageTons;

    // Req Bed Size
    manufactureInfo.requiredCurrent = manufactureInfo?.materialInfoList?.[0]?.dimUnfoldedX * 1.15;
    manufactureInfo.requiredWeldingVoltage = 0;
    manufactureInfo.recBedSize = Math.round(manufactureInfo.requiredCurrent) + '';

    // selected bed sizes
    manufactureInfo.lengthOfCoated = manufactureInfo?.machineMaster?.bedLength;
    manufactureInfo.widthOfCoated = 0;
    manufactureInfo.selectedBedSize = manufactureInfo?.machineMaster?.bedLength + '';

    //Machine strokes
    if (manufactureInfo.isspindleRpmDirty && hasValue(manufactureInfo.spindleRpm)) {
      manufactureInfo.spindleRpm = Number(manufactureInfo.spindleRpm);
    } else if (!manufactureInfo.isspindleRpmDirty) {
      const machineStroke = manufactureInfo?.machineMaster?.strokeRateMin || 0;
      const useDirtyCheck = this.shareService.checkDirtyProperty('spindleRpm', fieldColorsList);
      const useManufacturingObj = !useDirtyCheck && hasValue(manufacturingObj?.spindleRpm) && (!machineStroke || machineStroke === 0);
      manufactureInfo.spindleRpm = Number(useManufacturingObj ? manufacturingObj.spindleRpm : useDirtyCheck ? manufacturingObj?.spindleRpm || 0 : machineStroke);
    }

    // No. of Impression
    if (manufactureInfo.isNoOfStrokesDirty && hasValue(manufactureInfo.noofStroke)) {
      manufactureInfo.noofStroke = Number(manufactureInfo.noofStroke);
    } else if (!manufactureInfo.isNoOfStrokesDirty) {
      const noOfImp = 1;
      const useDirtyCheck = this.shareService.checkDirtyProperty('noofStroke', fieldColorsList);
      const useManufacturingObj = !useDirtyCheck && hasValue(manufacturingObj?.noofStroke) && !noOfImp;
      manufactureInfo.noofStroke = Number(useManufacturingObj ? manufacturingObj.noofStroke : useDirtyCheck ? manufacturingObj?.noofStroke || 0 : noOfImp);
    }

    // Feed distance Lfeed (mm)
    const lFeed = manufactureInfo?.materialInfoList?.[0]?.dimUnfoldedY || 0;

    const shearingSpeedData = this._smConfig.getShearigProcessSpeedDataByMaterialType(materialType, manufactureInfo?.materialInfoList?.[0]?.dimUnfoldedZ);
    // Feed speed Vfeed (mm/sec)
    const vFeed = shearingSpeedData.length > 0 ? shearingSpeedData[0].Vfeed : 1;

    // Feed Time
    const feedTime = Number(lFeed / vFeed);

    // Cutting Stroke length (mm)
    const cuttingStrokeLength = manufactureInfo?.materialInfoList?.[0]?.dimUnfoldedX || 0;

    // Cut speed (mm/Sec)
    if (manufactureInfo.iscuttingSpeedDirty && hasValue(manufactureInfo.cuttingSpeed)) {
      manufactureInfo.cuttingSpeed = Number(manufactureInfo.cuttingSpeed);
    } else if (!manufactureInfo.iscuttingSpeedDirty) {
      const cutSpeed = shearingSpeedData.length > 0 ? shearingSpeedData[0].Vcut : 1;
      const useDirtyCheck = this.shareService.checkDirtyProperty('cuttingSpeed', fieldColorsList);
      const useManufacturingObj = !useDirtyCheck && hasValue(manufacturingObj?.cuttingSpeed) && (!cutSpeed || cutSpeed === 0);
      manufactureInfo.cuttingSpeed = Number(useManufacturingObj ? manufacturingObj.cuttingSpeed : useDirtyCheck ? manufacturingObj?.cuttingSpeed || 0 : cutSpeed);
    }

    // Cutting Time (mm/Sec)
    const cutTime = cuttingStrokeLength / manufactureInfo.cuttingSpeed;

    // Return Stroke length (mm)
    const retStrokeLen = manufactureInfo?.materialInfoList?.[0]?.dimUnfoldedX || 0;

    // Cut speed (mm/Sec)
    if (manufactureInfo.isspeedOfConveyerDirty && hasValue(manufactureInfo.speedOfConveyer)) {
      manufactureInfo.speedOfConveyer = Number(manufactureInfo.speedOfConveyer);
    } else if (!manufactureInfo.isspeedOfConveyerDirty) {
      const returnSpeed = shearingSpeedData.length > 0 ? shearingSpeedData[0].Vreturn : 1;
      const useDirtyCheck = this.shareService.checkDirtyProperty('speedOfConveyer', fieldColorsList);
      const useManufacturingObj = !useDirtyCheck && hasValue(manufacturingObj?.speedOfConveyer) && (!returnSpeed || returnSpeed === 0);
      manufactureInfo.speedOfConveyer = Number(useManufacturingObj ? manufacturingObj.speedOfConveyer : useDirtyCheck ? manufacturingObj?.speedOfConveyer || 0 : returnSpeed);
    }

    // Return Time
    const returnTime = retStrokeLen / manufactureInfo.speedOfConveyer;

    // Shearing Process Time (sec)
    if (manufactureInfo.isProcessTimeDirty && hasValue(manufactureInfo.processTime)) {
      manufactureInfo.processTime = Number(manufactureInfo.processTime);
    } else if (!manufactureInfo.isProcessTimeDirty) {
      const shearingProcessTime = this.shareService.isValidNumber(feedTime + cutTime + returnTime);
      const useDirtyCheck = this.shareService.checkDirtyProperty('processTime', fieldColorsList);
      const useManufacturingObj = !useDirtyCheck && hasValue(manufacturingObj?.processTime) && (!shearingProcessTime || shearingProcessTime === 0);
      manufactureInfo.processTime = Number(useManufacturingObj ? manufacturingObj.processTime : useDirtyCheck ? manufacturingObj?.processTime || 0 : shearingProcessTime);
    }

    // Cycle Time
    if (manufactureInfo.iscycleTimeDirty && hasValue(manufactureInfo.cycleTime)) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else if (!manufactureInfo.iscycleTimeDirty) {
      const cycleTime = this.shareService.isValidNumber(manufactureInfo.processTime / manufactureInfo.efficiency);
      const useDirtyCheck = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList);
      const useManufacturingObj = !useDirtyCheck && hasValue(manufacturingObj?.cycleTime) && (!cycleTime || cycleTime === 0);
      manufactureInfo.cycleTime = Number(useManufacturingObj ? manufacturingObj.cycleTime : useDirtyCheck ? manufacturingObj?.cycleTime || 0 : cycleTime);
    }

    // Machine Cost ($) :
    if (manufactureInfo.isdirectMachineCostDirty && hasValue(manufactureInfo.directMachineCost)) {
      manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
    } else if (!manufactureInfo.isdirectMachineCostDirty) {
      manufactureInfo.machineHourRate =
        manufactureInfo.machineHourRate === null || (typeof manufactureInfo.machineHourRate === 'number' && Number.isNaN(manufactureInfo.machineHourRate)) ? 0 : manufactureInfo.machineHourRate;
      let directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) / 3600) * Number(manufactureInfo.cycleTime));
      const useDirtyCheck = this.shareService.checkDirtyProperty('directMachineCost', fieldColorsList);
      const useManufacturingObj = !useDirtyCheck && hasValue(manufacturingObj?.directMachineCost) && (!directMachineCost || directMachineCost === 0);
      manufactureInfo.directMachineCost = Number(useManufacturingObj ? manufacturingObj.directMachineCost : useDirtyCheck ? manufacturingObj?.directMachineCost || 0 : directMachineCost);
    }

    // setup time
    const defaultSetupTime = 20;
    if (manufactureInfo.issetUpTimeDirty && !!manufactureInfo.setUpTime) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      manufactureInfo.setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList)
        ? manufacturingObj?.setUpTime
        : this.shareService.isValidNumber(manufactureInfo.setUpTime) || defaultSetupTime;
    }

    // Setup Cost ($) :
    if (manufactureInfo.isdirectSetUpCostDirty && hasValue(manufactureInfo.directSetUpCost)) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else if (!manufactureInfo.isdirectSetUpCostDirty) {
      let directSetUpCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.skilledLaborRatePerHour / 60) * Number(manufactureInfo.setUpTime * (manufactureInfo.noOfSkilledLabours || 1)) +
          Number(manufactureInfo.machineHourRate / 60) * Number(manufactureInfo.setUpTime)) /
          Number(manufactureInfo.lotSize)
      );
      const useDirtyCheck = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList);
      const useManufacturingObj = !useDirtyCheck && hasValue(manufacturingObj?.directSetUpCost) && (!directSetUpCost || directSetUpCost === 0);
      manufactureInfo.directSetUpCost = Number(useManufacturingObj ? manufacturingObj.directSetUpCost : useDirtyCheck ? manufacturingObj?.directSetUpCost || 0 : directSetUpCost);
    }

    // Labor Cost :
    if (manufactureInfo.isdirectLaborCostDirty && hasValue(manufactureInfo.directLaborCost)) {
      manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
    } else if (!manufactureInfo.isdirectLaborCostDirty) {
      let directLaborCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) * (Number(manufactureInfo.cycleTime) * Number(manufactureInfo.noOfLowSkilledLabours))
      );
      const useDirtyCheck = this.shareService.checkDirtyProperty('directLaborCost', fieldColorsList);
      const useManufacturingObj = !useDirtyCheck && hasValue(manufacturingObj?.directLaborCost) && (!directLaborCost || directLaborCost === 0);
      manufactureInfo.directLaborCost = Number(useManufacturingObj ? manufacturingObj.directLaborCost : useDirtyCheck ? manufacturingObj?.directLaborCost || 0 : directLaborCost);
    }

    // Inspection Cost ($) :
    if (manufactureInfo.isinspectionCostDirty && hasValue(manufactureInfo.inspectionCost)) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else if (!manufactureInfo.isinspectionCostDirty) {
      let inspectionCost = this.shareService.isValidNumber(
        ((Number(manufactureInfo.qaOfInspectorRate) / 60) * Number(manufactureInfo.inspectionTime) * Math.round(Number(manufactureInfo.samplingRate / 100) * Number(manufactureInfo.lotSize))) /
          Number(manufactureInfo.lotSize)
      );
      const useDirtyCheck = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList);
      const useManufacturingObj = !useDirtyCheck && hasValue(manufacturingObj?.inspectionCost) && (!inspectionCost || inspectionCost === 0);
      manufactureInfo.inspectionCost = Number(useManufacturingObj ? manufacturingObj.inspectionCost : useDirtyCheck ? manufacturingObj?.inspectionCost || 0 : inspectionCost);
    }

    // Yield Cost (Rejected Parts Scrap Rate) ($)
    if (manufactureInfo.isyieldCostDirty && hasValue(manufactureInfo.yieldCost)) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else if (!manufactureInfo.isyieldCostDirty) {
      const sum = this.shareService.isValidNumber(
        Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
      );

      let yieldCost = this.shareService.isValidNumber(
        (1 - Number(manufactureInfo.yieldPer / 100)) * (Number(manufactureInfo.materialInfo.totalCost) + sum) -
          (1 - Number(manufactureInfo.yieldPer / 100)) * ((Number(manufactureInfo.materialInfo.weight) * Number(manufactureInfo.materialInfo.scrapPrice)) / 1000)
      );
      const useDirtyCheck = this.shareService.checkDirtyProperty('yieldCost', fieldColorsList);
      const useManufacturingObj = !useDirtyCheck && hasValue(manufacturingObj?.yieldCost) && (!yieldCost || yieldCost === 0);
      manufactureInfo.yieldCost = Number(useManufacturingObj ? manufacturingObj.yieldCost : useDirtyCheck ? manufacturingObj?.yieldCost || 0 : yieldCost);
    }

    // Net Process cost ($) :
    manufactureInfo.directProcessCost = this.shareService.isValidNumber(
      Number(manufactureInfo.directLaborCost) +
        Number(manufactureInfo.directMachineCost) +
        Number(manufactureInfo.directSetUpCost) +
        Number(manufactureInfo.inspectionCost) +
        Number(manufactureInfo.yieldCost)
    );

    return manufactureInfo;
  }

  public setSheetMetalObjectValues(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto) {
    manufactureInfo.semiAutoOrAuto = Number(manufactureInfo.semiAutoOrAuto);
    manufactureInfo.noOfStartsPierce = manufactureInfo.processId !== ProcessType.TubeBendingMetal ? Number(manufactureInfo.noOfStartsPierce) || 1 : manufactureInfo.noOfStartsPierce;
    if (manufactureInfo.isyieldPercentDirty && !!manufactureInfo.yieldPer) {
      manufactureInfo.yieldPer = this.shareService.isValidNumber(Number(manufactureInfo.yieldPer));
    } else {
      let yieldPer = this._smConfig.defaultPercentages(Number(manufactureInfo.processTypeID), manufactureInfo.partComplexity, 'yieldPercentage');
      if (manufactureInfo.yieldPer) {
        yieldPer = this.shareService.checkDirtyProperty('yieldPer', fieldColorsList) ? manufacturingObj?.yieldPer : this.shareService.isValidNumber(yieldPer);
      }
      manufactureInfo.yieldPer = yieldPer;
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

    let machineHourRate = 0;
    let multiplicationFactor = 1;
    if (manufactureInfo.isSemiAutoOrAutoDirty && manufactureInfo.semiAutoOrAuto != null) {
      const multiplicationFactorMap: { [key: string]: number } = {
        [`${MachineType.Manual}-${MachineType.SemiAuto}`]: 1.15,
        [`${MachineType.Manual}-${MachineType.Automatic}`]: 1.25,
        [`${MachineType.Automatic}-${MachineType.Manual}`]: 0.8,
        [`${MachineType.Automatic}-${MachineType.SemiAuto}`]: 0.92,
      };
      const key = `${manufactureInfo.machineTypeId || (manufactureInfo.machineType === 'Manual' ? '3' : manufactureInfo.machineType === 'Semi-Automatic' ? '2' : manufactureInfo.machineType === 'Automatic' ? '1' : '0')}-${manufactureInfo.semiAutoOrAuto}`;
      multiplicationFactor = multiplicationFactorMap[key] ?? 1;
      machineHourRate = manufactureInfo.machineMaster?.machineHourRate * multiplicationFactor;
    }

    if (manufactureInfo.ismachineHourRateDirty && manufactureInfo.machineHourRate != null) {
      manufactureInfo.machineHourRate = Number(manufactureInfo.machineHourRate);
    } else {
      const factorMap: { [key: string]: number } = {
        [`${MachineType.Manual}-${MachineType.SemiAuto}`]: 1.15,
        [`${MachineType.Manual}-${MachineType.Automatic}`]: 1.25,
        [`${MachineType.Automatic}-${MachineType.Manual}`]: 0.8,
        [`${MachineType.Automatic}-${MachineType.SemiAuto}`]: 0.92,
      };
      const key = `${manufactureInfo.machineTypeId || (manufactureInfo.machineType === 'Manual' ? '3' : manufactureInfo.machineType === 'Semi-Automatic' ? '2' : manufactureInfo.machineType === 'Automatic' ? '1' : '0')}-${manufactureInfo.semiAutoOrAuto}`;
      multiplicationFactor = factorMap[key] ?? 1;
      machineHourRate = manufactureInfo.machineMaster?.machineHourRate * multiplicationFactor;
      if (manufactureInfo.machineHourRate != null) {
        machineHourRate = this.shareService.checkDirtyProperty('machineHourRate', fieldColorsList) ? manufacturingObj?.machineHourRate : machineHourRate;
      }
      manufactureInfo.machineHourRate = machineHourRate;
    }

    if (manufactureInfo.isNoOfLowSkilledLaboursDirty && manufactureInfo.noOfLowSkilledLabours != null) {
      manufactureInfo.noOfLowSkilledLabours = Number(manufactureInfo.noOfLowSkilledLabours);
    } else {
      let noOfLowSkilledLabours = this._smConfig.getNoOfLowSkilledLabours(Number(manufactureInfo.semiAutoOrAuto));
      if (manufactureInfo.noOfLowSkilledLabours != null) {
        noOfLowSkilledLabours = this.shareService.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList) ? manufacturingObj?.noOfLowSkilledLabours : noOfLowSkilledLabours;
      }
      manufactureInfo.noOfLowSkilledLabours = noOfLowSkilledLabours;
    }

    return manufactureInfo;
  }

  public laserAndPlasmaCuttingList() {
    combineLatest([this._laserCuttting$, this._plasmaCuttting$])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(([laserCutting, plasmaCutting]) => {
        this.laserCutttingTimeList = laserCutting;
        this.plasmaCutttingSpeedList = plasmaCutting;
      });
  }

  public laserAndPlasmaCuttingListForProcess(process: ProcessInfoDto) {
    combineLatest([this._laserCuttting$, this._plasmaCuttting$])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(([laserCutting, plasmaCutting]) => {
        process.laserCutttingTimeList = laserCutting;
        process.plasmaCutttingSpeedList = plasmaCutting;
      });
  }

  public getBestMachineForLaserCutting(
    machineTypeDescription: MedbMachinesMasterDto[],
    process: ProcessInfoDto,
    laborRateInfo: LaborRateMasterDto[],
    processTypeOrginalList: any[],
    fieldColorsList: FieldColorsDto[],
    manufacturingObj: ProcessInfoDto
  ): ProcessInfoDto[] {
    let resultList: ProcessInfoDto[] = [];
    machineTypeDescription.forEach((machine) => {
      const processInfo = Object.assign({}, process);
      processInfo.machineMarketId = machine?.machineMarketDtos[0].machineMarketID;
      processInfo.selectedTonnage = machine?.machineTonnageTons;
      processInfo.machineMaster = machine;
      const injecRate = this.shareService.isValidNumber((Number(processInfo?.machineMaster?.injectionRate) * Number(processInfo.density)) / 1000);
      const shotweight = this.shareService.isValidNumber(processInfo.grossWeight * processInfo.noOfCavities);
      const materialInjectionFillTime = this.shareService.isValidNumber(shotweight / Number(injecRate));
      processInfo.materialInjectionFillTime = materialInjectionFillTime;
      processInfo.semiAutoOrAuto = this._manufacturingConfig.setMachineTypeIdByName(machine.machineMarketDtos?.length > 0 ? machine?.machineMarketDtos[0].machineType : undefined);
      const machineType = new MedbMachineTypeMasterDto();
      const machineTypeObj: MedbMachinesMasterDto = machineTypeDescription.find((x) => x.machineID == machine?.machineID);
      machineType.machineType = machineTypeObj.machineMarketDtos?.length > 0 ? machineTypeObj?.machineMarketDtos[0].machineType : undefined;
      machineType.processTypeId = machineTypeObj.machineMarketDtos?.length > 0 ? machineTypeObj?.machineMarketDtos[0].processTypeId : undefined;
      processInfo.machineType = machineType.machineType;
      processInfo.machineDescription = machineTypeObj?.machineDescription;
      processInfo.machineHourRate = machineTypeObj.machineHourRate;
      processInfo.machineHourRateFromDB = processInfo.machineHourRate ?? (machineTypeObj?.machineHourRate || 0);
      processInfo.dryCycleTime = machineTypeObj?.machineDryCycleTimeInSec;
      processInfo.machineCapacity = machineTypeObj?.machineCapacity;
      processInfo.efficiency = machineTypeObj?.machineMarketDtos.length > 0 ? machineTypeObj?.machineMarketDtos[0].efficiency : 0;
      processInfo.furnaceCapacityTon = machineTypeObj?.furnaceCapacityTon || 1;
      processInfo.machineMaster = machineTypeObj;
      processInfo.bourdanRate = machineTypeObj?.burdenRate;
      processInfo.laserCutttingTimeList = this.laserCutttingTimeList;
      processInfo.plasmaCutttingSpeedList = this.plasmaCutttingSpeedList;
      if (machineTypeObj?.machineMarketDtos.length > 0 && machineTypeObj?.machineMarketDtos[0].setUpTimeInHour) {
        processInfo.setUpTime = Math.round(Number(machineTypeObj?.machineMarketDtos.length > 0 ? machineTypeObj?.machineMarketDtos[0].setUpTimeInHour : 0) * 60);
      }
      processInfo.processType = this._manufacturingConfig.getProcessType(machineType.processTypeId, processTypeOrginalList);
      processInfo.samplingRate = this._smConfig.defaultPercentages(Number(processInfo.processTypeID), processInfo.partComplexity, 'samplingRate');
      if (this.shareService.extractedProcessData?.ProcessBendingInfo || this.shareService.extractedProcessData?.ProcessFormInfo) {
        processInfo.inspectionCost = 0;
        processInfo.qaOfInspectorRate = 0;
        processInfo.inspectionTime = 0;
        processInfo.isQaInspectorRateDirty = true;
        processInfo.isinspectionCostDirty = true;
        processInfo.isinspectionTimeDirty = true;
      }
      const calculationRes = this.calculationForCutting(processInfo, fieldColorsList, manufacturingObj);
      if (calculationRes) {
        resultList.push(calculationRes);
        if (machineTypeDescription?.length === resultList?.length) {
          resultList = resultList?.filter((x) => x.cuttingSpeed > 0)?.sort((a, b) => (a.directProcessCost < b.directProcessCost ? -1 : 1));
        }
      }
    });
    return resultList;
  }

  public getSubprocesInfoProgressive(process: ProcessInfoDto, fieldColorsList: FieldColorsDto[], manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    const processInfo = Object.assign({}, process);
    const calculationRes = this.calculationForstampingProgressive(processInfo, fieldColorsList, manufacturingObj);
    return calculationRes;
  }
}
