import { Injectable } from '@angular/core';
import { SharedService } from './shared.service';
import { Observable } from 'rxjs';
import { LaborRateMasterDto, ProcessInfoDto } from 'src/app/shared/models';
import { ProcessType, TypeOfCable } from '../costing.config';
import { MedbMasterService } from 'src/app/shared/services';

@Injectable({
  providedIn: 'root',
})
export class CustomCableService {
  unsubscribe$: Observable<any>;
  constructor(
    private shareService: SharedService,
    private medbMasterService: MedbMasterService
  ) {}

  // public customCable(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto, laborRateDto: LaborRateMasterDto[]): Observable<ProcessInfoDto> {
  public customCable(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto, laborRateDto: LaborRateMasterDto[]): ProcessInfoDto {
    if (manufactureInfo.isefficiencyDirty && manufactureInfo.efficiency != null) {
      manufactureInfo.efficiency = Number(manufactureInfo.efficiency);
    } else {
      manufactureInfo.efficiency = this.checkDirtyProperty('efficiency', fieldColorsList) ? manufacturingObj?.efficiency : this.shareService.isValidNumber(manufactureInfo.efficiency);
    }
    if (manufactureInfo.ismachineHourRateDirty && manufactureInfo.machineHourRate != null) {
      manufactureInfo.machineHourRate = Number(manufactureInfo.machineHourRate);
    } else {
      manufactureInfo.machineHourRate = this.checkDirtyProperty('machineHourRate', fieldColorsList)
        ? manufacturingObj?.machineHourRate
        : this.shareService.isValidNumber(manufactureInfo.machineHourRate);
    }
    if (manufactureInfo.isNoOfLowSkilledLaboursDirty && manufactureInfo.noOfLowSkilledLabours != null) {
      manufactureInfo.noOfLowSkilledLabours = Number(manufactureInfo.noOfLowSkilledLabours);
    } else {
      manufactureInfo.noOfLowSkilledLabours = this.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList)
        ? manufacturingObj?.noOfLowSkilledLabours
        : this.shareService.isValidNumber(manufactureInfo.noOfLowSkilledLabours);
    }
    if (manufactureInfo.isLowSkilledLaborRatePerHourDirty && manufactureInfo.lowSkilledLaborRatePerHour != null) {
      manufactureInfo.lowSkilledLaborRatePerHour = Number(manufactureInfo.lowSkilledLaborRatePerHour);
    } else {
      manufactureInfo.lowSkilledLaborRatePerHour = this.checkDirtyProperty('lowSkilledLaborRatePerHour', fieldColorsList)
        ? manufacturingObj?.lowSkilledLaborRatePerHour
        : this.shareService.isValidNumber(manufactureInfo.lowSkilledLaborRatePerHour);
    }
    if (manufactureInfo.isSkilledLaborRatePerHourDirty && manufactureInfo.skilledLaborRatePerHour != null) {
      manufactureInfo.skilledLaborRatePerHour = Number(manufactureInfo.skilledLaborRatePerHour);
    } else {
      manufactureInfo.skilledLaborRatePerHour = this.checkDirtyProperty('skilledLaborRatePerHour', fieldColorsList)
        ? manufacturingObj?.skilledLaborRatePerHour
        : this.shareService.isValidNumber(manufactureInfo.skilledLaborRatePerHour);
    }
    if (manufactureInfo.isQaInspectorRateDirty && manufactureInfo.qaOfInspectorRate != null) {
      manufactureInfo.qaOfInspectorRate = Number(manufactureInfo.qaOfInspectorRate);
    } else {
      manufactureInfo.qaOfInspectorRate = this.checkDirtyProperty('qaOfInspectorRate', fieldColorsList)
        ? manufacturingObj?.qaOfInspectorRate
        : this.shareService.isValidNumber(manufactureInfo.qaOfInspectorRate);
    }
    if (manufactureInfo.isSamplingRateDirty && manufactureInfo.samplingRate != null) {
      manufactureInfo.samplingRate = Number(manufactureInfo.samplingRate);
    } else {
      manufactureInfo.samplingRate = this.checkDirtyProperty('samplingRate', fieldColorsList) ? manufacturingObj?.samplingRate : this.shareService.isValidNumber(manufactureInfo.samplingRate);
    }
    //percentageOfReduction
    if (manufactureInfo.isPartEjectionDirty && manufactureInfo.partEjection != null) {
      manufactureInfo.partEjection = Number(manufactureInfo.partEjection);
    } else {
      manufactureInfo.partEjection = this.checkDirtyProperty('partEjection', fieldColorsList) ? manufacturingObj?.partEjection : 13;
    }

    //noofdrawsteps
    if (manufactureInfo.isDryCycleTimeDirty && manufactureInfo.dryCycleTime != null) {
      manufactureInfo.dryCycleTime = Number(manufactureInfo.dryCycleTime);
    } else {
      manufactureInfo.dryCycleTime = this.checkDirtyProperty('dryCycleTime', fieldColorsList) ? manufacturingObj?.dryCycleTime : 4;
    }
    if (manufactureInfo.iscuttingSpeedDirty && manufactureInfo.cuttingSpeed != null) {
      manufactureInfo.cuttingSpeed = Number(manufactureInfo.cuttingSpeed);
    } else {
      let drawSpeed = 0;
      if (Number(manufactureInfo.processTypeID) === ProcessType.CustomCableDrawing) {
        drawSpeed = 12;
      } else if (Number(manufactureInfo.processTypeID) === ProcessType.CustomCableAnnealing || manufactureInfo.processTypeID === ProcessType.CustomCableCableMarking) {
        drawSpeed = 10;
      } else if (Number(manufactureInfo.processTypeID) === ProcessType.CustomCableThinning) {
        drawSpeed = 32;
      } else if (Number(manufactureInfo.processTypeID) === ProcessType.CustomCableTensionStreach) {
        drawSpeed = 56;
      } else if (Number(manufactureInfo.processTypeID) === ProcessType.CustomCableExtruder) {
        drawSpeed = 20;
      } else if (Number(manufactureInfo.processTypeID) === ProcessType.CustomCableDiameterControl) {
        drawSpeed = 56;
      } else if (Number(manufactureInfo.processTypeID) === ProcessType.CustomCableCoreLayUp || manufactureInfo.processTypeID === ProcessType.CustomCableSparkTest) {
        drawSpeed = 60;
      } else if (Number(manufactureInfo.processTypeID) === ProcessType.CustomCableSheathing || manufactureInfo.processTypeID === ProcessType.CustomCableSpooler) {
        drawSpeed = 36;
      }
      if (manufactureInfo.drawSpeed != null) {
        drawSpeed = this.checkDirtyProperty('cuttingSpeed', fieldColorsList) ? manufacturingObj?.cuttingSpeed : drawSpeed;
      }
      manufactureInfo.cuttingSpeed = drawSpeed;
    }
    let noOfCables = manufactureInfo?.materialInfoList?.length > 0 ? manufactureInfo?.materialInfoList[0].noOfCables : 0;
    const typeOfCable = manufactureInfo?.materialInfoList?.length > 0 ? manufactureInfo?.materialInfoList[0].typeOfCable : 0;
    if (
      Number(typeOfCable) === TypeOfCable.SolidCore &&
      [ProcessType.CustomCableSheathing, ProcessType.CustomCableSparkTest, ProcessType.CustomCableCableMarking, ProcessType.CustomCableSpooler].includes(manufactureInfo.processTypeID)
    ) {
      noOfCables = 1;
    }
    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = this.shareService.isValidNumber(Number(manufactureInfo.cycleTime));
    } else {
      let cycleTime = this.shareService.isValidNumber(manufactureInfo.cuttingSpeed / 60) * noOfCables;
      if ([ProcessType.CustomCableSheathing, ProcessType.CustomCableSparkTest, ProcessType.CustomCableCableMarking, ProcessType.CustomCableSpooler].includes(manufactureInfo.processTypeID)) {
        cycleTime = this.shareService.isValidNumber(manufactureInfo.cuttingSpeed / 60);
      }
      if (manufactureInfo.cycleTime != null) {
        cycleTime = this.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      manufactureInfo.setUpTime = this.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : 30;
    }
    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost != null) {
      manufactureInfo.directMachineCost = this.shareService.isValidNumber(Number(manufactureInfo.directMachineCost));
    } else {
      let directMachineCost = this.shareService.isValidNumber(((Number(manufactureInfo.machineHourRate) / 3600) * Number(manufactureInfo.cycleTime)) / manufactureInfo.efficiency);
      if (manufactureInfo.directMachineCost != null) {
        directMachineCost = this.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : directMachineCost;
      }
      manufactureInfo.directMachineCost = directMachineCost;
    }

    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost != null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      let directSetUpCost = this.shareService.isValidNumber(((manufactureInfo.skilledLaborRatePerHour + manufactureInfo.machineHourRate) * (manufactureInfo.setUpTime / 60)) / manufactureInfo.lotSize);
      if (manufactureInfo.directSetUpCost != null) {
        directSetUpCost = this.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.directSetUpCost : directSetUpCost;
      }
      manufactureInfo.directSetUpCost = directSetUpCost;
    }

    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost != null) {
      manufactureInfo.directLaborCost = this.shareService.isValidNumber(Number(manufactureInfo.directLaborCost));
    } else {
      let directLaborCost = this.shareService.isValidNumber(
        ((Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) * (Number(manufactureInfo.cycleTime) * Number(manufactureInfo.noOfLowSkilledLabours))) / manufactureInfo.efficiency
      );
      if (manufactureInfo.directLaborCost != null) {
        directLaborCost = this.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : directLaborCost;
      }
      manufactureInfo.directLaborCost = directLaborCost;
    }

    manufactureInfo.qaOfInspectorRate = 0;
    manufactureInfo.inspectionTime = 0;
    manufactureInfo.inspectionCost = 0;

    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost != null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      let yieldCost = this.shareService.isValidNumber((1 - Number(manufactureInfo.yieldPer) / 100) * Number(manufactureInfo.directLaborCost));
      if (manufactureInfo.yieldCost != null) {
        yieldCost = this.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : yieldCost;
      }
      manufactureInfo.yieldCost = yieldCost;
    }

    manufactureInfo.directProcessCost = this.shareService.isValidNumber(
      Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.yieldCost)
    );

    manufactureInfo.totalElectricityConsumption = this.shareService.isValidNumber((manufactureInfo.cycleTime * manufactureInfo?.machineMaster?.ratedPower) / 3600);
    if (manufactureInfo.isesgImpactElectricityConsumptionDirty && manufactureInfo.esgImpactElectricityConsumption != null) {
      manufactureInfo.esgImpactElectricityConsumption = Number(manufactureInfo.esgImpactElectricityConsumption);
    } else {
      let esgImpactElectricityConsumption = 0;
      if (manufactureInfo.countryList && manufactureInfo.mfrCountryId) {
        const country = manufactureInfo.countryList.find((x) => x.countryId == manufactureInfo.mfrCountryId);
        if (country) {
          esgImpactElectricityConsumption = this.shareService.isValidNumber(manufactureInfo.totalElectricityConsumption * Number(laborRateDto?.length > 0 ? laborRateDto[0].powerESG : 0));
          if (manufactureInfo.esgImpactElectricityConsumption != null) {
            esgImpactElectricityConsumption = this.checkDirtyProperty('esgImpactElectricityConsumption', fieldColorsList)
              ? manufacturingObj?.esgImpactElectricityConsumption
              : esgImpactElectricityConsumption;
          }
        }
      }
      manufactureInfo.esgImpactElectricityConsumption = esgImpactElectricityConsumption;
    }
    manufactureInfo.totalFactorySpaceRequired = this.shareService.isValidNumber((manufactureInfo?.machineMaster?.maxLength * manufactureInfo?.machineMaster?.maxWidth) / 1000000);
    if (manufactureInfo.countryList && manufactureInfo.mfrCountryId) {
      const country = manufactureInfo.countryList.find((x) => x.countryId == manufactureInfo.mfrCountryId);
      if (country) {
        manufactureInfo.esgImpactFactoryImpact = this.shareService.isValidNumber(
          (manufactureInfo.totalFactorySpaceRequired * Number(laborRateDto?.length > 0 ? laborRateDto[0].factorESG : 0) * manufactureInfo.cycleTime) / 3600
        );
      }
    }
    // return new Observable((obs) => {
    //     obs.next(manufactureInfo);
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
}
