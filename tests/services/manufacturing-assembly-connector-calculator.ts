
import { ProcessInfoDto } from 'src/app/shared/models';
import { SharedService } from './shared';
import { ConnectorAssemblyManufacturingLookUpCatEnum } from 'src/app/shared/enums';
import { ConnectorAssemblyManufacturingLookUp } from 'src/app/shared/models/sheet-metal-lookup.model';
import { ConnectorAssemblyManufacturingLookUpState } from '../../_state/connector-assembly-manufacturing-lookup.state';
;


export class ManufacturingAssemblyConnectorCalculatorService {
  connectorAssemblyManufacturingLookUpData: ConnectorAssemblyManufacturingLookUp[] = [];
  private unsubscribeAll$: Subject<undefined> = new Subject<undefined>();
  _connectorAssemblyManufacturingLookUp$: Observable<ConnectorAssemblyManufacturingLookUp[]>;

  constructor(
    private shareService: SharedService,
    private store: Store
  ) {
    this._connectorAssemblyManufacturingLookUp$ = this.store.select(ConnectorAssemblyManufacturingLookUpState.getConnectorAssemblyManufacturingLookUp);
    this._connectorAssemblyManufacturingLookUp$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((response) => {
      if (response && response.length > 0) {
        this.connectorAssemblyManufacturingLookUpData = response;
      }
    });
  }

  public doCostCalculationForAssemblyConnectors(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    //Efficiency
    if (manufactureInfo.isefficiencyDirty && manufactureInfo.efficiency != null) {
      manufactureInfo.efficiency = Number(manufactureInfo.efficiency);
    } else {
      if (manufactureInfo.efficiency != null)
        manufactureInfo.efficiency = this.checkDirtyProperty('efficiency', fieldColorsList) ? manufacturingObj?.efficiency : this.shareService.isValidNumber(manufactureInfo.efficiency);
    }
    //Direct labors
    if (manufactureInfo.isNoOfLowSkilledLaboursDirty && manufactureInfo.noOfLowSkilledLabours != null) {
      manufactureInfo.noOfLowSkilledLabours = Number(manufactureInfo.noOfLowSkilledLabours);
    } else {
      manufactureInfo.noOfLowSkilledLabours = this.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList)
        ? manufacturingObj?.noOfLowSkilledLabours
        : this.shareService.isValidNumber(manufactureInfo.noOfLowSkilledLabours);
    }

    ////Direct labors rate
    if (manufactureInfo.isLowSkilledLaborRatePerHourDirty && manufactureInfo.lowSkilledLaborRatePerHour != null) {
      manufactureInfo.lowSkilledLaborRatePerHour = Number(manufactureInfo.lowSkilledLaborRatePerHour);
    } else {
      manufactureInfo.lowSkilledLaborRatePerHour = this.checkDirtyProperty('lowSkilledLaborRatePerHour', fieldColorsList)
        ? manufacturingObj?.lowSkilledLaborRatePerHour
        : this.shareService.isValidNumber(manufactureInfo.lowSkilledLaborRatePerHour);
    }

    //Skilled Labors
    if (manufactureInfo.isSkilledLaborRatePerHourDirty && manufactureInfo.noOfSkilledLabours != null) {
      manufactureInfo.noOfSkilledLabours = Number(manufactureInfo.noOfSkilledLabours);
    } else {
      if (manufactureInfo.noOfSkilledLabours != null) {
        manufactureInfo.noOfSkilledLabours = this.checkDirtyProperty('noOfSkilledLabours', fieldColorsList) ? manufacturingObj?.noOfSkilledLabours : manufactureInfo.noOfSkilledLabours;
      }
    }

    //  //Skilled Labors rate
    if (manufactureInfo.isSkilledLaborRatePerHourDirty && manufactureInfo.skilledLaborRatePerHour != null) {
      manufactureInfo.skilledLaborRatePerHour = Number(manufactureInfo.skilledLaborRatePerHour);
    } else {
      manufactureInfo.skilledLaborRatePerHour = this.checkDirtyProperty('skilledLaborRatePerHour', fieldColorsList)
        ? manufacturingObj?.skilledLaborRatePerHour
        : this.shareService.isValidNumber(manufactureInfo.skilledLaborRatePerHour);
    }

    if (manufactureInfo.isinspectionTimeDirty && manufactureInfo.inspectionTime != null) {
      manufactureInfo.inspectionTime = Number(manufactureInfo.inspectionTime);
    } else {
      manufactureInfo.inspectionTime = this.checkDirtyProperty('inspectionTime', fieldColorsList) ? manufacturingObj?.inspectionTime : manufactureInfo.inspectionTime;
    }

    //Qa Inspector
    if (manufactureInfo.isQaInspectorRateDirty && manufactureInfo.qaOfInspectorRate != null) {
      manufactureInfo.qaOfInspectorRate = Number(manufactureInfo.qaOfInspectorRate);
    } else {
      manufactureInfo.qaOfInspectorRate = this.checkDirtyProperty('qaOfInspectorRate', fieldColorsList)
        ? manufacturingObj?.qaOfInspectorRate
        : this.shareService.isValidNumber(manufactureInfo.qaOfInspectorRate);
    }

    if (manufactureInfo.ismachineHourRateDirty && manufactureInfo.machineHourRate != null) {
      manufactureInfo.machineHourRate = Number(manufactureInfo.machineHourRate);
    } else {
      manufactureInfo.machineHourRate = this.checkDirtyProperty('machineHourRate', fieldColorsList)
        ? manufacturingObj?.machineHourRate
        : this.shareService.isValidNumber(manufactureInfo.machineHourRate);
    }

    // set Up Time
    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      manufactureInfo.setUpTime = this.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : this.shareService.isValidNumber(manufactureInfo.setUpTime);
    }
    //total pin population
    if (manufactureInfo.isTotalPinPopulation && manufactureInfo.totalPinPopulation != null) {
      manufactureInfo.totalPinPopulation = Number(manufactureInfo.totalPinPopulation);
    } else {
      manufactureInfo.totalPinPopulation = this.checkDirtyProperty('totalPinPopulation', fieldColorsList) ? manufacturingObj?.totalPinPopulation : manufactureInfo.totalPinPopulation;
    }

    // No of types of pin
    if (manufactureInfo.isNoOfTypesOfPins && manufactureInfo.noOfTypesOfPins != null) {
      manufactureInfo.noOfTypesOfPins = Number(manufactureInfo.noOfTypesOfPins);
    } else {
      manufactureInfo.noOfTypesOfPins = this.checkDirtyProperty('noOfTypesOfPins', fieldColorsList) ? manufacturingObj?.noOfTypesOfPins : manufactureInfo.noOfTypesOfPins;
    }

    //Max bom quantity of individual pins
    if (manufactureInfo.isMaxBomQuantityOfIndividualPinTypes && manufactureInfo.maxBomQuantityOfIndividualPinTypes != null) {
      manufactureInfo.maxBomQuantityOfIndividualPinTypes = Number(manufactureInfo.maxBomQuantityOfIndividualPinTypes);
    } else {
      manufactureInfo.maxBomQuantityOfIndividualPinTypes = this.checkDirtyProperty('maxBomQuantityOfIndividualPinTypes', fieldColorsList)
        ? manufacturingObj?.maxBomQuantityOfIndividualPinTypes
        : manufactureInfo.maxBomQuantityOfIndividualPinTypes;
    }

    //Stetup Time per Batch (mins):
    // if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
    //   manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    // } else {
    //   let setUpTime = this.getConnectorAssemblyLookUpValue(ConnectorAssemblyManufacturingLookUpCatEnum.SetupTime, manufactureInfo.semiAutoOrAuto, manufactureInfo.noOfTypesOfPins)
    //   if (manufactureInfo.setUpTime != null) {
    //     setUpTime = this.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : setUpTime;
    //   }
    //   manufactureInfo.setUpTime = setUpTime;
    // }

    //Yield % (Good parts / total parts):
    // if (manufactureInfo.yieldPer != null) {
    //   manufactureInfo.yieldPer = Number(manufactureInfo.yieldPer);
    // } else {
    //   let yieldPer = this.getConnectorAssemblyLookUpValue(ConnectorAssemblyManufacturingLookUpCatEnum.YieldRate, manufactureInfo.semiAutoOrAuto, manufactureInfo.noOfTypesOfPins)
    //   if (manufactureInfo.yieldPer != null) {
    //     yieldPer = this.checkDirtyProperty('yieldPer', fieldColorsList) ? manufacturingObj?.yieldPer : yieldPer;
    //   }
    //   manufactureInfo.yieldPer = yieldPer;
    // }
    //No. of stitching stations required:
    if (manufactureInfo.isNoOfStitchingStationsRequired && manufactureInfo.noOfStitchingStationsRequired != null) {
      manufactureInfo.noOfStitchingStationsRequired = Number(manufactureInfo.noOfStitchingStationsRequired);
    } else {
      let noOfStitchingStationsRequired = manufactureInfo.noOfTypesOfPins;
      if (manufactureInfo.noOfStitchingStationsRequired != null) {
        noOfStitchingStationsRequired = this.checkDirtyProperty('noOfStitchingStationsRequired', fieldColorsList) ? manufacturingObj?.noOfStitchingStationsRequired : noOfStitchingStationsRequired;
      }
      manufactureInfo.noOfStitchingStationsRequired = noOfStitchingStationsRequired;
    }

    //Machine strokes
    if (manufactureInfo.isMachineStrokesDirty && manufactureInfo.machineStrokes != null) {
      manufactureInfo.machineStrokes = Number(manufactureInfo.machineStrokes);
    } else {
      let machineStrokes = this.getConnectorAssemblyLookUpValue(ConnectorAssemblyManufacturingLookUpCatEnum.StrokeRate, manufactureInfo.semiAutoOrAuto, manufactureInfo.noOfTypesOfPins);
      if (manufactureInfo.yieldPer != null) {
        machineStrokes = this.checkDirtyProperty('machineStrokes', fieldColorsList) ? manufacturingObj?.machineStrokes : machineStrokes;
      }
      manufactureInfo.machineStrokes = machineStrokes;
    }

    if (manufactureInfo.isStitchingCycleTime && manufactureInfo.stitchingCycleTime != null) {
      manufactureInfo.stitchingCycleTime = this.shareService.isValidNumber(manufactureInfo.stitchingCycleTime);
    } else {
      let stitchingCycletime = this.shareService.isValidNumber(
        (this.shareService.isValidNumber(manufactureInfo.maxBomQuantityOfIndividualPinTypes) / this.shareService.isValidNumber(manufactureInfo.machineStrokes)) * 60 * 1.25
      );
      if (manufactureInfo.stitchingCycleTime != null) {
        stitchingCycletime = this.checkDirtyProperty('stitchingCycleTime', fieldColorsList) ? manufacturingObj?.stitchingCycleTime : stitchingCycletime;
      }
      manufactureInfo.stitchingCycleTime = stitchingCycletime;
    }

    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = this.shareService.isValidNumber(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(manufactureInfo.stitchingCycleTime);
      if (manufactureInfo.cycleTime != null) {
        cycleTime = this.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    if (manufactureInfo.isEOLInspectionSamplingRate && manufactureInfo.eolInspectionSamplingRate != null) {
      manufactureInfo.eolInspectionSamplingRate = Number(manufactureInfo.eolInspectionSamplingRate);
    } else {
      let eolInspectionSamplingRate = 100;
      if (manufactureInfo.eolInspectionSamplingRate != null) {
        eolInspectionSamplingRate = this.checkDirtyProperty('eolInspectionSamplingRate', fieldColorsList) ? manufacturingObj?.eolInspectionSamplingRate : eolInspectionSamplingRate;
      }
      manufactureInfo.eolInspectionSamplingRate = eolInspectionSamplingRate;
    }

    if (manufactureInfo.ismachineHourRateDirty && manufactureInfo.machineHourRate != null) {
      manufactureInfo.machineHourRate = Number(manufactureInfo.machineHourRate);
    } else {
      if (manufactureInfo.machineHourRate != null) {
        manufactureInfo.machineHourRate = this.checkDirtyProperty('machineHourRate', fieldColorsList) ? manufacturingObj?.machineHourRate : manufactureInfo.machineHourRate;
      }
    }

    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost != null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      if (manufactureInfo.inspectionCost != null) {
        manufactureInfo.inspectionCost = this.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : manufactureInfo.inspectionCost;
      }
    }

    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost != null) {
      manufactureInfo.directMachineCost =
        (this.shareService.isValidNumber(this.shareService.isValidNumber(manufactureInfo.machineHourRate)) * this.shareService.isValidNumber(manufactureInfo.totalCycleTime)) /
        3600 /
        this.shareService.isValidNumber(manufactureInfo.efficiency);
    } else {
      let directMachineCost = this.shareService.isValidNumber(
        (this.shareService.isValidNumber(manufactureInfo.machineHourRate) * this.shareService.isValidNumber(manufactureInfo.stitchingCycleTime)) /
        3600 /
        this.shareService.isValidNumber(manufactureInfo.efficiency)
      );
      if (manufactureInfo.directMachineCost != null) {
        directMachineCost = this.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : directMachineCost;
      }
      manufactureInfo.directMachineCost = directMachineCost;
    }

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
        this.shareService.isValidNumber(manufactureInfo.efficiency) /
        this.shareService.isValidNumber(manufactureInfo.lotSize) +
        (this.shareService.isValidNumber(manufactureInfo.noOfSkilledLabours) *
          this.shareService.isValidNumber(manufactureInfo.skilledLaborRatePerHour) *
          this.shareService.isValidNumber(manufactureInfo.setUpTime)) /
        60 /
        this.shareService.isValidNumber(manufactureInfo.efficiency) /
        this.shareService.isValidNumber(manufactureInfo.lotSize)
      ); //divided lot of size

      if (manufactureInfo.directSetUpCost != null) {
        directSetUpCost = this.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.directSetUpCost : directSetUpCost;
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
          this.shareService.isValidNumber(manufactureInfo.stitchingCycleTime)) /
        3600 /
        this.shareService.isValidNumber(manufactureInfo.efficiency) +
        (this.shareService.isValidNumber(manufactureInfo.skilledLaborRatePerHour) *
          this.shareService.isValidNumber(manufactureInfo.noOfSkilledLabours) *
          this.shareService.isValidNumber(manufactureInfo.stitchingCycleTime)) /
        3600 /
        this.shareService.isValidNumber(manufactureInfo.efficiency);

      if (manufactureInfo.directLaborCost != null) {
        directLaborCost = this.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : directLaborCost;
      }
      manufactureInfo.directLaborCost = directLaborCost;
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
          this.shareService.isValidNumber(manufactureInfo.inspectionCost))
      );

      if (manufactureInfo.yieldCost != null) {
        yieldCost = this.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : yieldCost;
      }
      manufactureInfo.yieldCost = yieldCost;
    }

    manufactureInfo.directProcessCost =
      this.shareService.isValidNumber(manufactureInfo.directMachineCost) +
      this.shareService.isValidNumber(manufactureInfo.directSetUpCost) +
      this.shareService.isValidNumber(manufactureInfo.directLaborCost) +
      this.shareService.isValidNumber(manufactureInfo.inspectionCost) +
      this.shareService.isValidNumber(manufactureInfo.yieldCost);

    // return new Observable((obs) => {
    //   obs.next(manufactureInfo);
    // });
    return manufactureInfo;
  }

  public checkDirtyProperty(formCotrolName: string, fieldList: any[]) {
    let res = false;
    if (fieldList) {
      const info = fieldList.filter((x) => x.formControlName == formCotrolName && x.isDirty == true);
      if (info.length > 0) {
        res = true;
      }
    }
    return res;
  }

  private getConnectorAssemblyLookUpValue(categoryId: number, machineType: number, value: number): number {
    const expectedValue = this.connectorAssemblyManufacturingLookUpData.filter(
      (x) => x.categoryId === categoryId && x.machineType === machineType && x.min <= this.shareService.isValidNumber(value) && x.max >= this.shareService.isValidNumber(value)
    );
    if (expectedValue && expectedValue?.length > 0) {
      return expectedValue[0]?.expectedValue;
    }
    return null;
  }
}
