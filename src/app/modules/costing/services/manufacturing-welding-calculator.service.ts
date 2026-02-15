import { Injectable } from '@angular/core';
import { SharedService } from './shared.service';
import { PartComplexity } from 'src/app/shared/enums';
import { LaborRateMasterDto, ProcessInfoDto } from 'src/app/shared/models';
import { CostingConfig, MachineType, PrimaryProcessType, ProcessType } from '../costing.config';
import { WeldingConfigService } from 'src/app/shared/config/welding-config';
import { SheetMetalConfigService } from 'src/app/shared/config/sheetmetal-config';
import { SubProcessTypeInfoDto } from 'src/app/shared/models/subprocess-info.model';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class WeldingCalculatorService {
  weldingMode = 'welding';

  constructor(
    private shareService: SharedService,
    private _weldingConfig: WeldingConfigService,
    private _costingConfig: CostingConfig,
    public _smConfig: SheetMetalConfigService
  ) { }

  public calculationForSeamWelding(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto, laborRateDto: LaborRateMasterDto[]): ProcessInfoDto {
    this.weldingMode = 'seamWelding';
    this.weldingPreCalc(manufactureInfo, fieldColorsList, manufacturingObj); // pre Welding Calc

    const materialInfo = manufactureInfo.materialInfoList.find((x) => x.processId === PrimaryProcessType.SeamWelding);
    manufactureInfo.netMaterialCost = materialInfo?.netMatCost;
    manufactureInfo.netPartWeight = materialInfo?.netWeight;

    !manufactureInfo.meltingWeight && (manufactureInfo.meltingWeight = manufactureInfo.netPartWeight);

    const weldingPartHandlingValues = this._costingConfig.weldingValuesForPartHandling('seamWelding').find((x) => x.toPartWeight >= Number(manufactureInfo.meltingWeight) / 1000);
    const machineValues = this._costingConfig.weldingMachineValuesForSeamWelding().find((x) => manufactureInfo.machineMaster.machineDescription.indexOf(x.machine) >= 0);

    if (manufactureInfo.iscuttingSpeedDirty && !!manufactureInfo.cuttingSpeed) {
      // Welding speed
      manufactureInfo.cuttingSpeed = Number(manufactureInfo.cuttingSpeed);
    } else {
      let cuttingSpeed = machineValues.weldingEfficiency;
      if (manufactureInfo.cuttingSpeed) {
        cuttingSpeed = this.shareService.checkDirtyProperty('cuttingSpeed', fieldColorsList) ? manufacturingObj?.cuttingSpeed : cuttingSpeed;
      }
      manufactureInfo.cuttingSpeed = cuttingSpeed;
    }

    if (manufactureInfo.isUnloadingTimeDirty && !!manufactureInfo.unloadingTime) {
      // part handling time
      manufactureInfo.unloadingTime = Number(manufactureInfo.unloadingTime);
    } else {
      let unloadingTime = weldingPartHandlingValues.unloading;
      if (manufactureInfo.unloadingTime) {
        unloadingTime = this.shareService.checkDirtyProperty('unloadingTime', fieldColorsList) ? manufacturingObj?.unloadingTime : unloadingTime;
      }
      manufactureInfo.unloadingTime = unloadingTime;
    }

    if (manufactureInfo.iscycleTimeDirty && !!manufactureInfo.cycleTime) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(Number(manufactureInfo.unloadingTime) + Number(manufactureInfo.cuttingLength) / Number(manufactureInfo.cuttingSpeed));
      if (manufactureInfo.cycleTime) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    this.weldingCommonCalc(manufactureInfo, fieldColorsList, manufacturingObj, laborRateDto); // Common Welding Calc

    return manufactureInfo;
  }

  public calculationForSpotWelding(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto, laborRateDto: LaborRateMasterDto[]): ProcessInfoDto {
    this.weldingMode = 'spotWelding';
    this.weldingPreCalc(manufactureInfo, fieldColorsList, manufacturingObj); // pre Welding Calc

    const materialInfo = manufactureInfo.materialInfoList.find((x) => x.processId === PrimaryProcessType.SpotWelding);
    manufactureInfo.netMaterialCost = materialInfo?.netMatCost;
    manufactureInfo.netPartWeight = materialInfo?.netWeight;

    const partTickness = Number(materialInfo?.partTickness) || 0;
    const weldingValues = this._costingConfig.spotWeldingValuesForMachineType().find((x) => x.toPartThickness >= partTickness);
    const weldingPartHandlingValues = this._costingConfig.weldingValuesForPartHandling('spotWelding').find((x) => x.toPartWeight >= Number(manufactureInfo.netPartWeight) / 1000);

    manufactureInfo.requiredCurrent = weldingValues.weldCurrent[Number(materialInfo?.wireDiameter)];
    manufactureInfo.requiredWeldingVoltage = weldingValues.openCircuitVoltage;
    const squeezeTime = 3;
    // const weldTime = weldingValues?.weldTime / 60;
    const holdTime = weldingValues?.holdTime / 60 / 0.75;
    const offTime = 2;
    !manufactureInfo.noOfWeldPasses && (manufactureInfo.noOfWeldPasses = 1); // part reorientation

    if (manufactureInfo.isUnloadingTimeDirty && !!manufactureInfo.unloadingTime) {
      // part handling time
      manufactureInfo.unloadingTime = Number(manufactureInfo.unloadingTime);
    } else {
      let unloadingTime = Number(manufactureInfo?.noOfWeldPasses) * weldingPartHandlingValues.loading + weldingPartHandlingValues.unloading;
      if (manufactureInfo.unloadingTime) {
        unloadingTime = this.shareService.checkDirtyProperty('unloadingTime', fieldColorsList) ? manufacturingObj?.unloadingTime : unloadingTime;
      }
      manufactureInfo.unloadingTime = unloadingTime;
    }

    if (manufactureInfo.isDryCycleTimeDirty && !!manufactureInfo.dryCycleTime) {
      // Welding cycle time
      manufactureInfo.dryCycleTime = Number(manufactureInfo.dryCycleTime);
    } else {
      let dryCycleTime = (squeezeTime + holdTime + offTime) * (Number(manufactureInfo?.noOfTackWeld) || 0);
      if (manufactureInfo.dryCycleTime) {
        dryCycleTime = this.shareService.checkDirtyProperty('dryCycleTime', fieldColorsList) ? manufacturingObj?.dryCycleTime : dryCycleTime;
      }
      manufactureInfo.dryCycleTime = dryCycleTime;
    }

    if (manufactureInfo.iscycleTimeDirty && !!manufactureInfo.cycleTime) {
      manufactureInfo.cycleTime = this.shareService.isValidNumber(Number(manufactureInfo.cycleTime));
    } else {
      let cycleTime = Number(manufactureInfo.dryCycleTime) + Number(manufactureInfo.unloadingTime);
      if (manufactureInfo.cycleTime) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }
    // manufactureInfo.totalCycleTime = manufactureInfo.cycleTime;

    this.weldingCommonCalc(manufactureInfo, fieldColorsList, manufacturingObj, laborRateDto); // Common Welding Calc

    manufactureInfo.totalPowerCost = this.shareService.isValidNumber(
      ((Number(manufactureInfo.dryCycleTime) / 3600) * Number(manufactureInfo.powerConsumption) * Number(manufactureInfo.electricityUnitCost)) / (manufactureInfo.efficiency / 100)
    );

    return manufactureInfo;
  }

  public calculationForWelding(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto, laborRateDto: LaborRateMasterDto[]): ProcessInfoDto {
    this.weldingMode = 'welding';
    this.weldingPreCalc(manufactureInfo, fieldColorsList, manufacturingObj); // pre Welding Calc

    let materialInfo = null;
    let noOfTackWeld = 0;
    let weldingValues = null;
    let len = 0;
    if (Number(manufactureInfo.processTypeID) === ProcessType.StickWelding) {
      // stick/arc welding
      this.weldingMode = 'stickWelding';
      materialInfo = manufactureInfo.materialInfoList.find((x) => x.processId === PrimaryProcessType.StickWelding);
      len = materialInfo?.dimX || 0;
      const partTickness = Number(materialInfo?.partTickness) || 0;
      weldingValues = this._costingConfig.weldingValuesForStickWelding().find((x) => x.ToPartThickness >= partTickness);
      noOfTackWeld = this._costingConfig.noOfTrackWeld(len);
    } else if (Number(manufactureInfo.processTypeID) === ProcessType.TigWelding) {
      this.weldingMode = 'tigWelding';
      materialInfo = manufactureInfo.materialInfoList.find((x) => x.processId === PrimaryProcessType.TigWelding);
      len = materialInfo?.dimX || 0;
      const partTickness = Number(materialInfo?.partTickness) || 0;
      weldingValues = this._costingConfig.tigWeldingValuesForMachineType().find((x) => x.id === Number(manufactureInfo.semiAutoOrAuto) && x.ToPartThickness >= partTickness);
      noOfTackWeld = len / 50;
    } else if (Number(manufactureInfo.processTypeID) === ProcessType.MigWelding) {
      this.weldingMode = 'migWelding';
      materialInfo = manufactureInfo.materialInfoList.find((x) => x.processId === PrimaryProcessType.MigWelding);
      len = materialInfo?.dimX || 0;
      const partTickness = Number(materialInfo?.partTickness) || 0;
      weldingValues = this._costingConfig.weldingValuesForMachineType().find((x) => x.id === Number(manufactureInfo.semiAutoOrAuto) && x.ToPartThickness >= Number(partTickness));
      noOfTackWeld = len / 50;
      // } else { // for other welding if any
      //     this.weldingMode = 'welding';
      //     weldingValues = this._costingConfig.weldingValuesForMachineType().find(x => x.id === Number(manufactureInfo.semiAutoOrAuto) && x.ToPartThickness >= Number(partTickness));
      //     noOfTackWeld = len / 50;
    }

    manufactureInfo.netMaterialCost = materialInfo?.netMatCost;
    manufactureInfo.netPartWeight = materialInfo?.netWeight;

    const materialType = this._smConfig.mapMaterial(
      materialInfo?.materialMasterData?.materialType?.materialTypeName ||
      (materialInfo?.materialDescriptionList && materialInfo?.materialDescriptionList.length > 0 ? materialInfo?.materialDescriptionList[0]?.materialTypeName : null) ||
      manufactureInfo?.materialmasterDatas?.materialTypeName
    );

    if ([ProcessType.MigWelding, ProcessType.TigWelding].includes(Number(manufactureInfo.processTypeID))) {
      let totalWeldCycleTime = 0;
      if (manufactureInfo.subProcessFormArray && manufactureInfo.subProcessFormArray.length > 0) {
        for (let i = 0; i < manufactureInfo.subProcessFormArray.length; i++) {
          const element = manufactureInfo.subProcessFormArray.controls[i];
          const subProcessInfo = element.value as SubProcessTypeInfoDto;

          const efficiency = this._weldingConfig.getWeldingEfficiency(subProcessInfo.formLength, manufactureInfo.semiAutoOrAuto === 1);

          // Travel Speed
          const weldingData = this._weldingConfig.getWeldingData(materialType, subProcessInfo.shoulderWidth, materialInfo?.processId, 'Manual');

          if (element.get('formHeight')?.dirty && !!element.value?.formHeight) {
            subProcessInfo.formHeight = Number(element.value?.formHeight);
          } else {
            let travelSpeed =
              manufactureInfo.semiAutoOrAuto === 1
                ? this.shareService.isValidNumber((weldingData?.TravelSpeed_mm_per_sec / 0.8) * efficiency || 0)
                : this.shareService.isValidNumber(weldingData?.TravelSpeed_mm_per_sec * efficiency || 0);

            if (!!subProcessInfo.formHeight) {
              travelSpeed = this.checkFormArrayDirtyField('formHeight', i, fieldColorsList) ? manufacturingObj?.subProcessTypeInfos?.[i]?.formHeight : this.shareService.isValidNumber(travelSpeed);
            }

            subProcessInfo.formHeight = travelSpeed;
          }

          const lengthOfCut = Number(subProcessInfo.lengthOfCut);

          // No. of Intermediate Start/Stops (nos)
          if (!subProcessInfo.formPerimeter) {
            subProcessInfo.formPerimeter = subProcessInfo.formingForce === 1 ? subProcessInfo.noOfHoles : subProcessInfo.noOfHoles * subProcessInfo.formingForce;
          }
          // Cycle time No. of Intermediate Start/Stops (nos)
          const cycleTimeForIntermediateStops = subProcessInfo.formPerimeter * 5;

          // totalWeldLength
          const totalWeldLength = this.shareService.isValidNumber(subProcessInfo.blankArea * subProcessInfo.noOfBends * subProcessInfo.noOfHoles * subProcessInfo.formingForce);

          // HL Factor (No. of tack welds)
          if (!subProcessInfo.hlFactor) {
            if (subProcessInfo.noOfBends > 100) {
              subProcessInfo.hlFactor = this.shareService.isValidNumber(Math.round(subProcessInfo.noOfBends / 100) * subProcessInfo.noOfHoles);
            } else {
              subProcessInfo.hlFactor = subProcessInfo.noOfHoles;
            }
          }

          // (Cycle time for tack weld)
          const cycleTimeForTackWeld = subProcessInfo.hlFactor * 3;

          // weld cycle time
          subProcessInfo.recommendTonnage = this.shareService.isValidNumber(totalWeldLength / subProcessInfo.formHeight + cycleTimeForIntermediateStops + cycleTimeForTackWeld);

          if (lengthOfCut === 4) {
            subProcessInfo.recommendTonnage *= 0.95;
          } else if (lengthOfCut === 5) {
            subProcessInfo.recommendTonnage *= 1.5;
          }

          totalWeldCycleTime += subProcessInfo.recommendTonnage;
          (manufactureInfo.subProcessFormArray.controls as FormGroup[])[i].patchValue({ subProcessTypeID: Number(manufactureInfo.processTypeID) });
          (manufactureInfo.subProcessFormArray.controls as FormGroup[])[i].patchValue({ formPerimeter: subProcessInfo.formPerimeter });
          (manufactureInfo.subProcessFormArray.controls as FormGroup[])[i].patchValue({ formHeight: subProcessInfo.formHeight });

          (manufactureInfo.subProcessFormArray.controls as FormGroup[])[i].patchValue({ hlFactor: subProcessInfo.hlFactor });
          (manufactureInfo.subProcessFormArray.controls as FormGroup[])[i].patchValue({ recommendTonnage: subProcessInfo.recommendTonnage });
          subProcessInfo.subProcessTypeID = manufactureInfo.processTypeID;
          if (manufactureInfo.subProcessTypeInfos?.[i]) {
            manufactureInfo.subProcessTypeInfos[i] = subProcessInfo;
          } else {
            manufactureInfo.subProcessTypeInfos = manufactureInfo.subProcessTypeInfos || [];
            manufactureInfo.subProcessTypeInfos.push(subProcessInfo);
          }
        }
      }

      const maxFormHeight = Math.max(...manufactureInfo.subProcessTypeInfos.map((info) => info.shoulderWidth || 0));
      const weldingData = this._weldingConfig.getWeldingData(materialType, maxFormHeight, materialInfo?.processId, 'Manual');
      if (manufactureInfo.isrequiredCurrentDirty && manufactureInfo.requiredCurrent !== null) {
        manufactureInfo.requiredCurrent = Number(manufactureInfo.requiredCurrent);
      } else {
        let requiredCurrent = Number(weldingData?.Current_Amps || 0);
        if (manufactureInfo.requiredCurrent !== null)
          requiredCurrent = this.shareService.checkDirtyProperty('requiredCurrent', fieldColorsList) ? manufacturingObj?.requiredCurrent : this.shareService.isValidNumber(requiredCurrent);

        manufactureInfo.requiredCurrent = requiredCurrent;
      }

      if (manufactureInfo.isrequiredWeldingVoltageDirty && manufactureInfo.requiredWeldingVoltage !== null) {
        manufactureInfo.requiredWeldingVoltage = Number(manufactureInfo.requiredWeldingVoltage);
      } else {
        let requiredWeldingVoltage = Number(weldingData?.Voltage_Volts || 0);
        if (manufactureInfo.requiredWeldingVoltage !== null)
          requiredWeldingVoltage = this.shareService.checkDirtyProperty('requiredWeldingVoltage', fieldColorsList)
            ? manufacturingObj?.requiredWeldingVoltage
            : this.shareService.isValidNumber(requiredWeldingVoltage);

        manufactureInfo.requiredWeldingVoltage = requiredWeldingVoltage;
      }

      manufactureInfo.platenSizeLength = manufactureInfo?.machineMaster?.plasmaPower || 0;

      // loading and unloading time
      const loadingTime = this._weldingConfig.getUnloadingTime(materialInfo?.netWeight) || 0;
      const unLoadingTime = loadingTime;
      if (manufactureInfo.isUnloadingTimeDirty && manufactureInfo.unloadingTime !== null) {
        manufactureInfo.unloadingTime = Number(manufactureInfo.unloadingTime);
      } else {
        let loadUnloadTime = Number(loadingTime + unLoadingTime) || 0;
        if (manufactureInfo.unloadingTime !== null) {
          loadUnloadTime = this.shareService.checkDirtyProperty('unloadingTime', fieldColorsList) ? manufacturingObj?.unloadingTime : this.shareService.isValidNumber(loadUnloadTime);
        }
        manufactureInfo.unloadingTime = loadUnloadTime;
      }

      // Part/Assembly Reorientation (no's)
      if (manufactureInfo.isnoOfWeldPassesDirty && manufactureInfo.noOfWeldPasses !== null) {
        manufactureInfo.noOfWeldPasses = Number(manufactureInfo.noOfWeldPasses);
      } else {
        let noOfReorientation = 0;
        if (manufactureInfo.noOfWeldPasses !== null) {
          noOfReorientation = this.shareService.checkDirtyProperty('noOfWeldPasses', fieldColorsList) ? manufacturingObj?.noOfWeldPasses : this.shareService.isValidNumber(noOfReorientation);
        }
        manufactureInfo.noOfWeldPasses = noOfReorientation;
      }

      // Arc On Time
      const arcOnTime = totalWeldCycleTime + manufactureInfo.unloadingTime;
      // Arc Off Time
      const arcOffTime = arcOnTime * 0.05;
      // Total Weld Cycle Time
      const totWeldCycleTime = manufactureInfo.noOfWeldPasses * loadingTime + arcOnTime + arcOffTime;

      // weld Cycle Time
      if (manufactureInfo.isDryCycleTimeDirty && !!manufactureInfo.dryCycleTime) {
        manufactureInfo.dryCycleTime = Number(manufactureInfo.dryCycleTime);
      } else {
        let weldCycleTime = this.shareService.isValidNumber(totWeldCycleTime);
        if (manufactureInfo.dryCycleTime) {
          weldCycleTime = this.shareService.checkDirtyProperty('dryCycleTime', fieldColorsList) ? manufacturingObj?.dryCycleTime : this.shareService.isValidNumber(weldCycleTime);
        }
        manufactureInfo.dryCycleTime = weldCycleTime;
      }

      // Total Cycle Time
      if (manufactureInfo.iscycleTimeDirty && !!manufactureInfo.cycleTime) {
        manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
      } else {
        let cycleTime = this.shareService.isValidNumber(totWeldCycleTime / (manufactureInfo.efficiency / 100));
        if (manufactureInfo.cycleTime) {
          cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : this.shareService.isValidNumber(cycleTime);
        }
        manufactureInfo.cycleTime = cycleTime;
      }
    } else {
      if (manufactureInfo.istravelSpeedDirty && !!manufactureInfo.travelSpeed) {
        manufactureInfo.travelSpeed = Number(manufactureInfo.travelSpeed);
      } else {
        let travelSpeed = Number(weldingValues?.TravelSpeed) || 0;
        if (manufactureInfo.travelSpeed) {
          travelSpeed = this.shareService.checkDirtyProperty('travelSpeed', fieldColorsList) ? manufacturingObj?.travelSpeed : this.shareService.isValidNumber(travelSpeed);
        }
        manufactureInfo.travelSpeed = travelSpeed;
      }

      if (manufactureInfo.isrequiredCurrentDirty && manufactureInfo.requiredCurrent !== null) {
        manufactureInfo.requiredCurrent = Number(manufactureInfo.requiredCurrent);
      } else {
        let requiredCurrent = Number(weldingValues?.current);
        if (manufactureInfo.requiredCurrent !== null)
          requiredCurrent = this.shareService.checkDirtyProperty('requiredCurrent', fieldColorsList) ? manufacturingObj?.requiredCurrent : this.shareService.isValidNumber(requiredCurrent);

        manufactureInfo.requiredCurrent = requiredCurrent;
      }

      if (manufactureInfo.isrequiredWeldingVoltageDirty && manufactureInfo.requiredWeldingVoltage != null) {
        manufactureInfo.requiredWeldingVoltage = Number(manufactureInfo.requiredWeldingVoltage);
      } else {
        let requiredWeldingVoltage = Number(weldingValues?.Voltage);
        if (manufactureInfo.requiredWeldingVoltage != null)
          requiredWeldingVoltage = this.shareService.checkDirtyProperty('requiredWeldingVoltage', fieldColorsList)
            ? manufacturingObj?.requiredWeldingVoltage
            : this.shareService.isValidNumber(requiredWeldingVoltage);

        manufactureInfo.requiredWeldingVoltage = requiredWeldingVoltage;
      }

      if (manufactureInfo.isnoOfIntermediateStartAndStopDirty && !!manufactureInfo.noOfIntermediateStartAndStop) {
        manufactureInfo.noOfIntermediateStartAndStop = Number(manufactureInfo.noOfIntermediateStartAndStop);
      } else {
        let noOfIntermediateStartAndStop = Number(manufactureInfo.processTypeID) === ProcessType.StickWelding ? 1 : 4;
        if (manufactureInfo.noOfIntermediateStartAndStop) {
          noOfIntermediateStartAndStop = this.shareService.checkDirtyProperty('noOfIntermediateStartAndStop', fieldColorsList)
            ? manufacturingObj?.noOfIntermediateStartAndStop
            : this.shareService.isValidNumber(noOfIntermediateStartAndStop);
        }
        manufactureInfo.noOfIntermediateStartAndStop = Math.round(noOfIntermediateStartAndStop);
      }

      const cycleTimeIntermediateStartAndStop = manufactureInfo.noOfIntermediateStartAndStop * (Number(manufactureInfo.processTypeID) === ProcessType.StickWelding ? 3 : 5);

      if (manufactureInfo.isnoOfTackWeldDirty && !!manufactureInfo.noOfTackWeld) {
        manufactureInfo.noOfTackWeld = Number(manufactureInfo.noOfTackWeld);
      } else {
        if (manufactureInfo.noOfTackWeld) {
          noOfTackWeld = this.shareService.checkDirtyProperty('noOfTackWeld', fieldColorsList) ? manufacturingObj?.noOfTackWeld : this.shareService.isValidNumber(noOfTackWeld);
        }
        manufactureInfo.noOfTackWeld = Math.round(noOfTackWeld);
      }

      const cycleTimeTrackWeld = manufactureInfo.noOfTackWeld * 3;

      if (manufactureInfo.isnoOfWeldPassesDirty && !!manufactureInfo.noOfWeldPasses) {
        manufactureInfo.noOfWeldPasses = Number(manufactureInfo.noOfWeldPasses);
      } else {
        const wLength = materialInfo?.weldLegLength || 0;
        let noOfWeldPasses = this._costingConfig.weldPass(wLength, this.weldingMode) || 1;

        if (manufactureInfo.noOfWeldPasses) {
          noOfWeldPasses = this.shareService.checkDirtyProperty('noOfWeldPasses', fieldColorsList) ? manufacturingObj?.noOfWeldPasses || 1 : this.shareService.isValidNumber(noOfWeldPasses);
        }
        manufactureInfo.noOfWeldPasses = noOfWeldPasses;
      }

      if (Number(manufactureInfo.processTypeID) === ProcessType.StickWelding) {
        const weldingPartHandlingValues = this._costingConfig.weldingValuesForPartHandling('stickWelding').find((x) => x.toPartWeight >= Number(manufactureInfo.netPartWeight) / 1000);

        if (manufactureInfo.isUnloadingTimeDirty && !!manufactureInfo.unloadingTime) {
          // part handling time
          manufactureInfo.unloadingTime = Number(manufactureInfo.unloadingTime);
        } else {
          let unloadingTime = weldingPartHandlingValues.unloading;
          if (manufactureInfo.unloadingTime) {
            unloadingTime = this.shareService.checkDirtyProperty('unloadingTime', fieldColorsList) ? manufacturingObj?.unloadingTime : unloadingTime;
          }
          manufactureInfo.unloadingTime = unloadingTime;
        }
      }


      const weldingCycleTime = this.shareService.isValidNumber((len / Number(manufactureInfo.travelSpeed)) * Number(manufactureInfo.noOfWeldPasses));
      const totalWeldCycleTime = Number(weldingCycleTime) + Number(cycleTimeTrackWeld) + Number(cycleTimeIntermediateStartAndStop) + (Number(manufactureInfo.unloadingTime) || 0);

      const arcOnTime = this.shareService.isValidNumber(totalWeldCycleTime * 1.05);
      const arcOfTime = this.shareService.isValidNumber(arcOnTime * 0.05);
      let cycleTime = this.shareService.isValidNumber(arcOnTime + arcOfTime);

      if (manufactureInfo.isDryCycleTimeDirty && !!manufactureInfo.dryCycleTime) {
        // Welding cycle time
        manufactureInfo.dryCycleTime = Number(manufactureInfo.dryCycleTime);
      } else {
        let dryCycleTime = weldingCycleTime;
        if (manufactureInfo.dryCycleTime) {
          dryCycleTime = this.shareService.checkDirtyProperty('dryCycleTime', fieldColorsList) ? manufacturingObj?.dryCycleTime : dryCycleTime;
        }
        manufactureInfo.dryCycleTime = dryCycleTime;
      }

      if (Number(manufactureInfo.processTypeID) === ProcessType.StickWelding) {
        cycleTime = totalWeldCycleTime;
      }

      if (manufactureInfo.iscycleTimeDirty && !!manufactureInfo.cycleTime) {
        manufactureInfo.cycleTime = this.shareService.isValidNumber(Number(manufactureInfo.cycleTime));
      } else {
        if (manufactureInfo.cycleTime) {
          cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
        }
        manufactureInfo.cycleTime = cycleTime;
      }
      manufactureInfo.totalCycleTime = manufactureInfo.cycleTime;
    }

    this.weldingCommonCalc(manufactureInfo, fieldColorsList, manufacturingObj, laborRateDto); // Common Welding Calc

    return manufactureInfo;
  }

  checkFormArrayDirtyField(fieldName: string, index: number, fieldColorsList: any): boolean {
    return fieldColorsList?.find((x) => x.formControlName == fieldName && x.subProcessIndex == index)?.isDirty || false;
  }

  private weldingPreCalc(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto) {
    manufactureInfo.setUpTime = manufactureInfo.setUpTime || 30;

    if (manufactureInfo.isyieldPercentDirty && !!manufactureInfo.yieldPer) {
      manufactureInfo.yieldPer = this.shareService.isValidNumber(Number(manufactureInfo.yieldPer));
    } else {
      let yieldPer = this._costingConfig.weldingDefaultPercentage(Number(manufactureInfo.processTypeID), manufactureInfo.partComplexity, 'yieldPercentage');
      if (manufactureInfo.yieldPer) {
        yieldPer = this.shareService.checkDirtyProperty('yieldPer', fieldColorsList) ? manufacturingObj?.yieldPer : this.shareService.isValidNumber(yieldPer);
      }
      manufactureInfo.yieldPer = yieldPer;
    }

    if (manufactureInfo.isSamplingRateDirty && !!manufactureInfo.samplingRate) {
      manufactureInfo.samplingRate = this.shareService.isValidNumber(Number(manufactureInfo.samplingRate));
    } else {
      let samplingRate = this._costingConfig.weldingDefaultPercentage(Number(manufactureInfo.processTypeID), manufactureInfo.partComplexity, 'samplingRate');
      if (manufactureInfo.samplingRate) {
        samplingRate = this.shareService.checkDirtyProperty('samplingRate', fieldColorsList) ? manufacturingObj?.samplingRate : this.shareService.isValidNumber(samplingRate);
      }
      manufactureInfo.samplingRate = samplingRate;
    }

    if (manufactureInfo.isefficiencyDirty && !!manufactureInfo.efficiency) {
      manufactureInfo.efficiency = Number(manufactureInfo.efficiency);
    } else {
      let efficiency = 75;
      const weldingEffeciencyValues = this._costingConfig
        .weldingPositionList(manufactureInfo.processTypeID === ProcessType.StickWelding ? 'stickWelding' : 'welding')
        .find((x) => x.id === Number(manufactureInfo.weldingPosition));

      if (manufactureInfo.semiAutoOrAuto == MachineType.Automatic) {
        efficiency = Number(weldingEffeciencyValues?.EffeciencyAuto);
      } else if (manufactureInfo.semiAutoOrAuto == MachineType.Manual) {
        efficiency = Number(weldingEffeciencyValues?.EffeciencyManual);
      } else {
        efficiency = Number(weldingEffeciencyValues?.EffeciencySemiAuto);
      }

      if (manufactureInfo.efficiency) {
        efficiency = this.shareService.checkDirtyProperty('efficiency', fieldColorsList) ? manufacturingObj?.efficiency : this.shareService.isValidNumber(efficiency);
      }
      manufactureInfo.efficiency = efficiency;
    }
    manufactureInfo.efficiency <= 1 && (manufactureInfo.efficiency = manufactureInfo.efficiency * 100);
    !manufactureInfo.efficiency && (manufactureInfo.efficiency = 75);
  }

  private weldingCommonCalc(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto, laborRateDto: LaborRateMasterDto[]) {
    const curCycleTime = this.weldingMode === 'spotWelding' ? Number(manufactureInfo.dryCycleTime) : Number(manufactureInfo.cycleTime);
    manufactureInfo.totalPowerCost = 0;

    if (this.weldingMode !== 'seamWelding') {
      if (manufactureInfo.iselectricityUnitCostDirty && !!manufactureInfo.electricityUnitCost) {
        manufactureInfo.electricityUnitCost = this.shareService.isValidNumber(Number(manufactureInfo.electricityUnitCost));
      } else {
        let electricityUnitCost = 0;
        if (manufactureInfo.countryList && manufactureInfo.mfrCountryId) {
          const country = manufactureInfo.countryList.find((x) => x.countryId == manufactureInfo.mfrCountryId);
          if (country) {
            electricityUnitCost = Number(laborRateDto?.length > 0 ? laborRateDto[0].powerCost : 0);
          }
        }
        if (manufactureInfo.electricityUnitCost) {
          electricityUnitCost = this.shareService.checkDirtyProperty('electricityUnitCost', fieldColorsList) ? manufacturingObj?.electricityUnitCost : electricityUnitCost;
        }
        manufactureInfo.electricityUnitCost = this.shareService.isValidNumber(electricityUnitCost);
      }

      if (manufactureInfo.ispowerConsumptionDirty && !!manufactureInfo.powerConsumption) {
        manufactureInfo.powerConsumption = this.shareService.isValidNumber(Number(manufactureInfo.powerConsumption));
      } else {
        let powerConsumption = (Number(manufactureInfo.requiredCurrent) * Number(manufactureInfo.requiredWeldingVoltage)) / 1000;
        if (manufactureInfo.powerConsumption) {
          powerConsumption = this.shareService.checkDirtyProperty('powerConsumption', fieldColorsList) ? manufacturingObj?.powerConsumption : powerConsumption;
        }
        manufactureInfo.powerConsumption = powerConsumption;
      }


      manufactureInfo.totalPowerCost = this.shareService.isValidNumber((curCycleTime / 3600) * Number(manufactureInfo.powerConsumption) * Number(manufactureInfo.electricityUnitCost)); // / (manufactureInfo.efficiency / 100)
      manufactureInfo.totalGasCost = 0;
    }

    if (manufactureInfo.isyieldPercentDirty && !!manufactureInfo.yieldPer) {
      manufactureInfo.yieldPer = this.shareService.isValidNumber(Number(manufactureInfo.yieldPer));
    } else {
      let yieldPer = this._weldingConfig.defaultPercentages(Number(manufactureInfo.processTypeID), manufactureInfo.partComplexity, 'yieldPercentage');
      if (manufactureInfo.yieldPer) {
        yieldPer = this.shareService.checkDirtyProperty('yieldPer', fieldColorsList) ? manufacturingObj?.yieldPer : this.shareService.isValidNumber(yieldPer);
      }
      manufactureInfo.yieldPer = yieldPer;
    }
    if (manufactureInfo.isSamplingRateDirty && !!manufactureInfo.samplingRate) {
      manufactureInfo.samplingRate = this.shareService.isValidNumber(Number(manufactureInfo.samplingRate));
    } else {
      let samplingRate = this._weldingConfig.defaultPercentages(Number(manufactureInfo.processTypeID), manufactureInfo.partComplexity, 'samplingRate');
      if (manufactureInfo.samplingRate) {
        samplingRate = this.shareService.checkDirtyProperty('samplingRate', fieldColorsList) ? manufacturingObj?.samplingRate : this.shareService.isValidNumber(samplingRate);
      }
      manufactureInfo.samplingRate = samplingRate;
    }

    // # of Direct Labour
    if (manufactureInfo.isNoOfLowSkilledLaboursDirty && manufactureInfo.noOfLowSkilledLabours !== null) {
      manufactureInfo.noOfLowSkilledLabours = Number(manufactureInfo.noOfLowSkilledLabours);
    } else {
      let noOfLowSkilledLabours = manufactureInfo?.machineMaster?.machineMarketDtos[0]?.specialSkilledLabours || 1;
      if (manufactureInfo.noOfLowSkilledLabours !== null) {
        noOfLowSkilledLabours = this.shareService.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList) ? manufacturingObj?.noOfLowSkilledLabours : noOfLowSkilledLabours;
      }
      manufactureInfo.noOfLowSkilledLabours = noOfLowSkilledLabours;
    }

    if (manufactureInfo.isinspectionTimeDirty && manufactureInfo.inspectionTime !== null) {
      manufactureInfo.inspectionTime = Number(manufactureInfo.inspectionTime);
    } else {
      manufactureInfo.inspectionTime =
        manufactureInfo.partComplexity == PartComplexity.Low ? 2 : manufactureInfo.partComplexity == PartComplexity.Medium ? 5 : manufactureInfo.partComplexity == PartComplexity.High ? 10 : 0;
      manufactureInfo.inspectionTime = this.shareService.checkDirtyProperty('inspectionTime', fieldColorsList) ? manufacturingObj?.inspectionTime : manufactureInfo.inspectionTime;
    }

    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost !== null) {
      manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
    } else {
      let directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) / 3600) * curCycleTime); // / (manufactureInfo.efficiency / 100)
      if (manufactureInfo.directMachineCost !== null) {
        directMachineCost = this.shareService.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : directMachineCost;
      }
      manufactureInfo.directMachineCost = directMachineCost;
    }

    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost !== null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      let directSetUpCost = this.shareService.isValidNumber(
        ((Number(manufactureInfo.skilledLaborRatePerHour) + Number(manufactureInfo.machineHourRate)) * (Number(manufactureInfo.setUpTime) / 60)) / manufactureInfo.lotSize
      );
      if (manufactureInfo.directSetUpCost !== null) {
        directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.setUpCost : directSetUpCost;
      }
      manufactureInfo.directSetUpCost = directSetUpCost;
    }

    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost !== null) {
      manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
    } else {
      let directLaborCost = this.shareService.isValidNumber((Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) * (curCycleTime * Number(manufactureInfo.noOfLowSkilledLabours))); // / (manufactureInfo.efficiency / 100)
      if (manufactureInfo.directLaborCost !== null) {
        directLaborCost = this.shareService.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : directLaborCost;
      }
      manufactureInfo.directLaborCost = directLaborCost;
    }

    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost !== null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      let inspectionCost =
        this.weldingMode === 'seamWelding'
          ? this.shareService.isValidNumber(
            (Number(manufactureInfo.inspectionTime) * Number(manufactureInfo.qaOfInspectorRate)) / (Number(manufactureInfo.lotSize) * (Number(manufactureInfo.samplingRate) / 100))
          )
          : this.shareService.isValidNumber(
            // Number(manufactureInfo.samplingRate / 100) * ((Number(manufactureInfo.inspectionTime) * Number(manufactureInfo.qaOfInspectorRate)) / 3600)
            (((manufactureInfo?.qaOfInspectorRate ?? 0) / 60) * Math.ceil(((manufactureInfo?.samplingRate ?? 0) / 100) * (manufactureInfo?.lotSize ?? 0)) * (manufactureInfo?.inspectionTime ?? 0)) /
            (manufactureInfo?.lotSize ?? 1)
          );
      if (manufactureInfo.inspectionCost !== null) {
        inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : inspectionCost;
      }
      manufactureInfo.inspectionCost = inspectionCost;
    }

    const sum = this.shareService.isValidNumber(
      Number(manufactureInfo.directMachineCost) +
      Number(manufactureInfo.directSetUpCost) +
      Number(manufactureInfo.directLaborCost) +
      Number(manufactureInfo.inspectionCost) +
      Number(manufactureInfo.totalPowerCost)
    );
    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost !== null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      let yieldCost =
        this.weldingMode === 'seamWelding'
          ? this.shareService.isValidNumber((1 - Number(manufactureInfo.yieldPer) / 100) * sum)
          : this.shareService.isValidNumber((1 - Number(manufactureInfo.yieldPer) / 100) * (Number(manufactureInfo.netMaterialCost) + sum));
      if (manufactureInfo.yieldCost !== null) {
        yieldCost = this.shareService.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : yieldCost;
      }
      manufactureInfo.yieldCost = yieldCost;
    }

    manufactureInfo.directProcessCost = this.shareService.isValidNumber(sum + Number(manufactureInfo.yieldCost));
  }

  // public calculationsForWeldingPreparation(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): Observable<ProcessInfoDto> {
  public calculationsForWeldingPreparation(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    const weldingLength = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.dimX : 0;
    const weldingWidth = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.dimY : 0;
    const weldingHeight = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.dimZ : 0;
    const netWeight = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.netWeight / 1000 : 0;
    manufactureInfo.netMaterialCost = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.netMatCost : 0;
    const crossSectionArea = 2 * weldingLength * Math.max(weldingWidth, weldingHeight);
    const materialType = manufactureInfo.materialmasterDatas?.materialType?.materialTypeName;
    let lookupListDia = this._weldingConfig.getDiscBrushDia()?.filter((x) => x.materialType === materialType && x.partArea >= crossSectionArea)?.[0];
    if (crossSectionArea > 100001) {
      lookupListDia = this._weldingConfig
        .getDiscBrushDia()
        ?.filter((x) => x.materialType === materialType)
        ?.reverse()?.[0];
    }
    let discBrushDia: number = 0,
      deburringRPM: number = 0;
    if (lookupListDia) {
      discBrushDia = lookupListDia?.discBrush;
      deburringRPM = manufactureInfo?.processTypeID === ProcessType.WeldingPreparation ? lookupListDia?.prepRPM : lookupListDia?.cleaningRPM;
    }
    const feedPerREvRough = this.shareService.isValidNumber(discBrushDia / 2);
    const feedPerREvFinal = this.shareService.isValidNumber(discBrushDia / 4);
    const noOfPasses = this.shareService.isValidNumber(Math.ceil(weldingWidth / discBrushDia));
    const handlingTime = netWeight < 5 ? 10 : netWeight < 10 ? 16 : netWeight < 20 ? 24 : netWeight > 20 ? 32 : 0;

    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(handlingTime + (2 * (weldingLength + 5) * noOfPasses * 60) / feedPerREvRough / deburringRPM);
      if (manufactureInfo?.processTypeID === ProcessType.WeldingCleaning) {
        cycleTime += this.shareService.isValidNumber((2 * (weldingLength + 5) * noOfPasses * 60) / feedPerREvFinal / deburringRPM);
      }
      if (manufactureInfo.cycleTime != null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost != null) {
      manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
    } else {
      let directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) * Number(manufactureInfo.cycleTime)) / 3600 / Number(manufactureInfo.efficiency));
      if (manufactureInfo.directMachineCost != null) {
        directMachineCost = this.shareService.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : directMachineCost;
      }
      manufactureInfo.directMachineCost = directMachineCost;
    }

    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost != null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      let directSetUpCost =
        (((Number(manufactureInfo.noOfLowSkilledLabours) * Number(manufactureInfo.setUpTime)) / 60) * Number(manufactureInfo.lowSkilledLaborRatePerHour)) /
        Number(manufactureInfo.efficiency) /
        Number(manufactureInfo.lotSize) +
        (((Number(manufactureInfo.noOfSkilledLabours) * Number(manufactureInfo.skilledLaborRatePerHour)) / 60) * Number(manufactureInfo.setUpTime)) /
        Number(manufactureInfo.efficiency) /
        Number(manufactureInfo.lotSize);
      if (manufactureInfo.directSetUpCost != null) {
        directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.setUpCost : directSetUpCost;
      }
      manufactureInfo.directSetUpCost = directSetUpCost;
    }

    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost != null) {
      manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
    } else {
      let directLaborCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.noOfLowSkilledLabours) * Number(manufactureInfo.lowSkilledLaborRatePerHour) * Number(manufactureInfo.cycleTime)) / 3600 / Number(manufactureInfo.efficiency) +
        (Number(manufactureInfo.noOfSkilledLabours) * Number(manufactureInfo.skilledLaborRatePerHour) * Number(manufactureInfo.cycleTime)) / 3600 / Number(manufactureInfo.efficiency)
      );
      if (manufactureInfo.directLaborCost != null) {
        directLaborCost = this.shareService.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : directLaborCost;
      }
      manufactureInfo.directLaborCost = directLaborCost;
    }

    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost != null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      let inspectionCost = this.shareService.isValidNumber(
        ((manufactureInfo.inspectionTime / 60) * Number(manufactureInfo.qaOfInspector) * Number(manufactureInfo.qaOfInspectorRate)) /
        Number(manufactureInfo.efficiency) /
        Number(manufactureInfo.lotSize)
      );
      if (manufactureInfo.inspectionCost != null) {
        inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : inspectionCost;
      }
      manufactureInfo.inspectionCost = inspectionCost;
    }
    if (manufactureInfo.isyieldPercentDirty && manufactureInfo.yieldPer != null) {
      manufactureInfo.yieldPer = Number(manufactureInfo.yieldPer);
    } else {
      let yieldPer = 0;
      if (manufactureInfo.yieldPer != null) {
        yieldPer = this.shareService.checkDirtyProperty('yieldPer', fieldColorsList) ? manufacturingObj?.yieldPer : yieldPer;
      }
      manufactureInfo.yieldPer = yieldPer;
    }

    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost != null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {

      let yieldCost = 0;
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

  public calculationsForWeldingCleaning(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {

    const materialInfoList = Array.isArray(manufactureInfo.materialInfoList) ? manufactureInfo.materialInfoList : [];
    const materialInfo = materialInfoList.find((rec) => rec.processId === PrimaryProcessType.MigWelding || rec.processId === PrimaryProcessType.TigWelding) || null;

    const weldingMaterialDetails = materialInfo?.coreCostDetails || [];

    // Finish Type
    if (manufactureInfo.isTypeOfOperationDirty && manufactureInfo.typeOfOperationId !== null) {
      manufactureInfo.typeOfOperationId = Number(manufactureInfo.typeOfOperationId);
    } else {
      let partType = 1;
      if (manufactureInfo.typeOfOperationId !== null) {
        partType = this.shareService.checkDirtyProperty('typeOfOperationId', fieldColorsList) ? manufacturingObj?.typeOfOperationId : partType;
      }
      manufactureInfo.typeOfOperationId = partType;
    }

    if (manufactureInfo.isCuttingLengthDirty && manufactureInfo.cuttingLength !== null) {
      manufactureInfo.cuttingLength = Number(manufactureInfo.cuttingLength);
    } else {
      let totalWeldLength = materialInfo?.totalWeldLength || 0;
      if (manufactureInfo.cuttingLength !== null) {
        totalWeldLength = this.shareService.checkDirtyProperty('cuttingLength', fieldColorsList) ? manufacturingObj?.cuttingLength : totalWeldLength;
      }
      manufactureInfo.cuttingLength = totalWeldLength;
    }

    const maxWeldElementSize = weldingMaterialDetails.length > 0 ? Math.max(...weldingMaterialDetails.map((item) => item.coreWeight)) : 0;
    const weldCrossSectionalArea = 2 * manufactureInfo.cuttingLength * maxWeldElementSize;
    // const netWeight = materialInfo?.netWeight || 0;
    const materialType = manufactureInfo.materialmasterDatas?.materialType?.materialTypeName;
    // if(weldingMaterialDetails[0]?.grindFlush){}

    let lookupListDia = this._weldingConfig.getDiscBrushDia()?.filter((x) => x.materialType === materialType && x.partArea >= weldCrossSectionalArea)?.[0];
    if (weldCrossSectionalArea > 100001) {
      lookupListDia = this._weldingConfig
        .getDiscBrushDia()
        ?.filter((x) => x.materialType === materialType)
        ?.reverse()?.[0];
    }

    let discBrushDia: number = 0,
      deburringRPM: number = 0;
    if (lookupListDia) {
      discBrushDia = lookupListDia?.discBrush;
      deburringRPM = manufactureInfo?.processTypeID === ProcessType.WeldingPreparation ? lookupListDia?.prepRPM : lookupListDia?.cleaningRPM;
    }
    manufactureInfo.netMaterialCost = materialInfo?.netMatCost || 0;


    const feedPerREvRough = this.shareService.isValidNumber(discBrushDia / 2);
    const feedPerREvFinal = this.shareService.isValidNumber(discBrushDia / 4);
    const noOfPasses = this.shareService.isValidNumber(Math.ceil(maxWeldElementSize / discBrushDia));
    const reorientaionTime = this._weldingConfig.getUnloadingTime(materialInfo?.netWeight) || 0;

    if (manufactureInfo.isCuttingLengthDirty && manufactureInfo.noOfWeldPasses !== null) {
      manufactureInfo.noOfWeldPasses = Number(manufactureInfo.noOfWeldPasses);
    } else {
      let noOfIntermediateStartStops = 0;

      noOfIntermediateStartStops = weldingMaterialDetails.reduce((sum, weldDetail) => sum + (weldDetail.coreArea === 1 ? weldDetail.coreVolume : weldDetail.coreVolume * weldDetail.coreArea), 0);

      if (manufactureInfo.noOfWeldPasses !== null) {
        noOfIntermediateStartStops = this.shareService.checkDirtyProperty('noOfWeldPasses', fieldColorsList) ? manufacturingObj?.noOfWeldPasses : noOfIntermediateStartStops;
      }
      manufactureInfo.noOfWeldPasses = noOfIntermediateStartStops;
    }

    const partHandlingTime = reorientaionTime + manufactureInfo.noOfWeldPasses * 5;

    // process time

    const term = 2 * (manufactureInfo.cuttingLength + 5) * noOfPasses * 60;

    const processTime = partHandlingTime + this.safeDiv(term, feedPerREvRough, deburringRPM) + (manufactureInfo.typeOfOperationId === 1 ? 0 : this.safeDiv(term, feedPerREvFinal, deburringRPM));

    if (manufactureInfo.isefficiencyDirty && !!manufactureInfo.efficiency) {
      manufactureInfo.efficiency = Number(manufactureInfo.efficiency);
    } else {
      manufactureInfo.efficiency = this.shareService.checkDirtyProperty('efficiency', fieldColorsList) ? manufacturingObj?.efficiency : this.shareService.isValidNumber(manufactureInfo.efficiency);
      if (Number(manufactureInfo.efficiency) < 1) {
        manufactureInfo.efficiency *= 100;
      }
    }

    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime !== null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(processTime / (manufactureInfo.efficiency / 100));

      if (manufactureInfo.cycleTime !== null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost !== null) {
      manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
    } else {
      let directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) * Number(manufactureInfo.cycleTime)) / 3600);
      if (manufactureInfo.directMachineCost !== null) {
        directMachineCost = this.shareService.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : directMachineCost;
      }
      manufactureInfo.directMachineCost = directMachineCost;
    }

    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost !== null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      let directSetUpCost = this.shareService.isValidNumber(
        ((Number(manufactureInfo.machineHourRate) + Number(manufactureInfo.skilledLaborRatePerHour)) * (Number(manufactureInfo.setUpTime) / 60)) / Number(manufactureInfo.lotSize)
      );

      if (manufactureInfo.directSetUpCost !== null) {
        directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.setUpCost : directSetUpCost;
      }
      manufactureInfo.directSetUpCost = directSetUpCost;
    }

    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost != null) {
      manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
    } else {
      let directLaborCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.noOfLowSkilledLabours) * Number(manufactureInfo.lowSkilledLaborRatePerHour) * Number(manufactureInfo.cycleTime)) / 3600
      );
      if (manufactureInfo.directLaborCost !== null) {
        directLaborCost = this.shareService.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : directLaborCost;
      }
      manufactureInfo.directLaborCost = directLaborCost;
    }

    if (manufactureInfo.isinspectionTimeDirty && manufactureInfo.inspectionTime !== null) {
      manufactureInfo.inspectionTime = Number(manufactureInfo.inspectionTime);
    } else {
      let inspectionTime =
        manufactureInfo.partComplexity == PartComplexity.Low ? 0.25 : manufactureInfo.partComplexity == PartComplexity.Medium ? 0.5 : manufactureInfo.partComplexity == PartComplexity.High ? 1 : 0;
      if (manufactureInfo.inspectionTime !== null) {
        inspectionTime = this.shareService.checkDirtyProperty('inspectionTime', fieldColorsList) ? manufacturingObj?.inspectionTime : inspectionTime;
      }
      manufactureInfo.inspectionTime = inspectionTime;
    }

    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost !== null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      let inspectionCost = this.shareService.isValidNumber(
        (((manufactureInfo?.qaOfInspectorRate ?? 0) / 60) * Math.ceil(((manufactureInfo?.samplingRate ?? 0) / 100) * (manufactureInfo?.lotSize ?? 0)) * (manufactureInfo?.inspectionTime ?? 0)) /
        (manufactureInfo?.lotSize ?? 1)
      );
      if (manufactureInfo.inspectionCost !== null) {
        inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : inspectionCost;
      }
      manufactureInfo.inspectionCost = inspectionCost;
    }
    if (manufactureInfo.isyieldPercentDirty && manufactureInfo.yieldPer !== null) {
      manufactureInfo.yieldPer = Number(manufactureInfo.yieldPer);
    } else {
      let yieldPer = 98.5;
      if (manufactureInfo.yieldPer !== null) {
        yieldPer = this.shareService.checkDirtyProperty('yieldPer', fieldColorsList) ? manufacturingObj?.yieldPer : yieldPer;
      }
      manufactureInfo.yieldPer = yieldPer;
    }

    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost !== null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      let sum = this.shareService.isValidNumber(
        Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
      );
      let yieldCost = this.shareService.isValidNumber((1 - Number(manufactureInfo.yieldPer) / 100) * (Number(manufactureInfo.netMaterialCost) + sum));
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
    // return new Observable((obs) => { obs.next(manufactureInfo); });
    return manufactureInfo;
  }

  // Helper to avoid division by zero
  safeDiv = (numerator: number, a: number, b: number) => (a && b ? numerator / (a * b) : 0);
}
