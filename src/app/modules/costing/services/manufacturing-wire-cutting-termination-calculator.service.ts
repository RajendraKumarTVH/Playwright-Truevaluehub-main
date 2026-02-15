import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ProcessInfoDto } from 'src/app/shared/models';
import { SharedService } from './shared.service';
import { ConnectorAssemblyManufacturingLookUpCatEnum } from 'src/app/shared/enums';
import { ConnectorAssemblyManufacturingLookUp } from 'src/app/shared/models/sheet-metal-lookup.model';
import { ConnectorAssemblyManufacturingLookUpState } from '../../_state/connector-assembly-manufacturing-lookup.state';
import { Store } from '@ngxs/store';
import { takeUntil } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ManufacturingWireCuttingTerminationCalculatorService {
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

  // public doCostCalculationFormWireCuttingTermination(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): Observable<ProcessInfoDto> {
  public doCostCalculationFormWireCuttingTermination(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
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
      const wireThikness = manufactureInfo?.materialInfoList && manufactureInfo?.materialInfoList?.length > 0 ? manufactureInfo?.materialInfoList[0].sheetThickness : 0;

      let setupTime = this.getConnectorAssemblyLookUpValue(ConnectorAssemblyManufacturingLookUpCatEnum.WireCuttingTerminationSetUpTime, wireThikness);
      if (manufactureInfo.setUpTime != null) {
        setupTime = this.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : this.shareService.isValidNumber(setupTime);
      }
      manufactureInfo.setUpTime = setupTime;
    }

    //Machine strokes
    if (manufactureInfo.isMachineStrokesDirty && manufactureInfo.machineStrokes != null) {
      manufactureInfo.machineStrokes = Number(manufactureInfo.machineStrokes);
    } else {
      const wireThikness = manufactureInfo?.materialInfoList && manufactureInfo?.materialInfoList?.length > 0 ? manufactureInfo?.materialInfoList[0].sheetThickness : 0;
      let machineStrokes = this.getConnectorAssemblyLookUpValue(ConnectorAssemblyManufacturingLookUpCatEnum.WireCuttingTerminationStrokeRate, wireThikness);
      if (manufactureInfo.machineStrokes != null) {
        machineStrokes = this.checkDirtyProperty('machineStrokes', fieldColorsList) ? manufacturingObj?.machineStrokes : machineStrokes;
      }
      manufactureInfo.machineStrokes = machineStrokes;
    }

    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(Number(60 / manufactureInfo.machineStrokes));
      if (manufactureInfo.cycleTime != null) {
        cycleTime = this.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    if (manufactureInfo.ismachineHourRateDirty && manufactureInfo.machineHourRate != null) {
      manufactureInfo.machineHourRate = Number(manufactureInfo.machineHourRate);
    } else {
      if (manufactureInfo.machineHourRate != null) {
        manufactureInfo.machineHourRate = this.checkDirtyProperty('machineHourRate', fieldColorsList) ? manufacturingObj?.machineHourRate : manufactureInfo.machineHourRate;
      }
    }

    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost != null) {
      manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
    } else {
      let directMachineCost = this.shareService.isValidNumber(
        (this.shareService.isValidNumber(manufactureInfo.machineHourRate) * this.shareService.isValidNumber(manufactureInfo.cycleTime)) /
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
      const partsPerCoil = manufactureInfo?.materialInfoList && manufactureInfo?.materialInfoList?.length > 0 ? manufactureInfo?.materialInfoList[0].partsPerCoil : 0;

      let directSetUpCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.noOfLowSkilledLabours) * Number(manufactureInfo.lowSkilledLaborRatePerHour) * Number(manufactureInfo.setUpTime)) /
          60 /
          Number(manufactureInfo.efficiency) /
          Number(partsPerCoil) +
          (Number(manufactureInfo.noOfSkilledLabours) * Number(manufactureInfo.skilledLaborRatePerHour) * Number(manufactureInfo.setUpTime)) /
            60 /
            Number(manufactureInfo.efficiency) /
            Number(partsPerCoil)
      );

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
      let directLaborCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.lowSkilledLaborRatePerHour) * Number(manufactureInfo.noOfLowSkilledLabours) * Number(manufactureInfo.cycleTime)) / 3600 / Number(manufactureInfo.efficiency) +
          (Number(manufactureInfo.skilledLaborRatePerHour) * Number(manufactureInfo.noOfSkilledLabours) * Number(manufactureInfo.cycleTime)) / 3600 / Number(manufactureInfo.efficiency)
      );

      if (manufactureInfo.directLaborCost != null) {
        directLaborCost = this.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : directLaborCost;
      }
      manufactureInfo.directLaborCost = directLaborCost;
    }

    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost != null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      const partsPerCoil = manufactureInfo?.materialInfoList && manufactureInfo?.materialInfoList?.length > 0 ? manufactureInfo?.materialInfoList[0].partsPerCoil : 0;

      let inspectionCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.qaInspectionCostPerHr) * Number(manufactureInfo.qaOfInspector) * Number(manufactureInfo.inspectionTime)) / 60 / Number(manufactureInfo.efficiency) / partsPerCoil
      );

      if (manufactureInfo.inspectionCost != null) {
        inspectionCost = this.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : inspectionCost;
      }
      manufactureInfo.inspectionCost = inspectionCost;
    }

    // Yeild Cost
    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost != null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      let yieldCost = this.shareService.isValidNumber(
        (1 - Number(manufactureInfo.yieldPer)) *
          (Number(manufactureInfo.directMachineCost) +
            this.shareService.isValidNumber(manufactureInfo.directSetUpCost) +
            Number(manufactureInfo.directLaborCost) +
            Number(manufactureInfo.inspectionCost))
      );

      if (manufactureInfo.yieldCost != null) {
        yieldCost = this.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : yieldCost;
      }
      manufactureInfo.yieldCost = yieldCost;
    }
    const netMatCost = manufactureInfo?.materialInfoList && manufactureInfo?.materialInfoList?.length > 0 ? manufactureInfo?.materialInfoList[0].netMatCost : 0;

    manufactureInfo.directProcessCost = this.shareService.isValidNumber(
      Number(manufactureInfo.directMachineCost) +
        Number(manufactureInfo.setUpCost) +
        Number(manufactureInfo.directLaborCost) +
        Number(manufactureInfo.inspectionCost) +
        Number(manufactureInfo.yieldCost) +
        Number(netMatCost)
    );

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

  private getConnectorAssemblyLookUpValue(categoryId: number, value: number): number {
    const expectedValue = this.connectorAssemblyManufacturingLookUpData.filter(
      (x) => x.categoryId === categoryId && x.min <= this.shareService.isValidNumber(value) && x.max >= this.shareService.isValidNumber(value)
    );
    if (expectedValue && expectedValue?.length > 0) {
      return expectedValue[0]?.expectedValue;
    }
    return null;
  }
}
