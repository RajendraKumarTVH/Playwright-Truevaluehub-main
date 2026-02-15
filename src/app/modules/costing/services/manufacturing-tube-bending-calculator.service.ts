import { Injectable } from '@angular/core';
import { SharedService } from './shared.service';
import { ProcessInfoDto } from 'src/app/shared/models';
import { TubeBendingConfigService } from 'src/app/shared/config/tube-bending-config';
import { PrimaryProcessType } from '../costing.config';

@Injectable({
  providedIn: 'root',
})
export class ManufacturingTubeBendingCalculatorService {
  constructor(
    private shareService: SharedService,
    private _tubeBendingConfigService: TubeBendingConfigService
  ) {}

  // public doCostCalculationsForTubeBending(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): Observable<ProcessInfoDto> {
  public doCostCalculationsForTubeBending(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    let materialInfo = manufactureInfo.materialInfoList.find((x) => x.processId === PrimaryProcessType.TubeBending);
    materialInfo?.materialInfoList && (materialInfo = materialInfo.materialInfoList.find((x) => x.processId === PrimaryProcessType.TubeBending)); //fix during recalculation
    manufactureInfo.density = materialInfo?.density || 0;
    manufactureInfo.netMaterialCost = materialInfo?.netMatCost || 0;
    manufactureInfo.netPartWeight = materialInfo?.netWeight || 0;
    const stockType = Number(materialInfo?.stockType) || 1; // round - 1 or rectangle - 2
    const scrapRecCost = Number(materialInfo?.scrapRecCost) || 0;
    let partOuterDiameter = Number(materialInfo?.partOuterDiameter) || 0;
    if (stockType === 2) {
      // retangle
      partOuterDiameter = Number(materialInfo?.partWidth) >= Number(materialInfo?.partHeight) ? Number(materialInfo?.partWidth) : Number(materialInfo?.partHeight);
    }
    const partLength = Number(materialInfo?.partLength) || 0;
    const areaOfCut = Number(materialInfo?.cuttingAllowance) || 0;

    const totalBendCount = Number(manufactureInfo.noOfBendsPerXAxis) + Number(manufactureInfo.noOfBendsPerYAxis) + Number(manufactureInfo.noOfBendsPerZAxis) + Number(manufactureInfo.noOfbends);
    const bendData = this._tubeBendingConfigService.getBendData(partOuterDiameter);

    if (manufactureInfo.isefficiencyDirty && !!manufactureInfo.efficiency) {
      manufactureInfo.efficiency = Number(manufactureInfo.efficiency);
    } else {
      let efficiency = Number(manufactureInfo.efficiency) || 70;
      if (manufactureInfo.efficiency) {
        efficiency = this.shareService.checkDirtyProperty('efficiency', fieldColorsList) ? manufacturingObj?.efficiency : efficiency;
      }
      manufactureInfo.efficiency = efficiency;
    }
    manufactureInfo.efficiency <= 1 && (manufactureInfo.efficiency = manufactureInfo.efficiency * 100);
    !manufactureInfo.efficiency && (manufactureInfo.efficiency = 70);

    if (manufactureInfo.isLoadingTimeDirty && !!manufactureInfo.loadingTime) {
      manufactureInfo.loadingTime = Number(manufactureInfo.loadingTime);
    } else {
      let loadingTime = this._tubeBendingConfigService.getLoadingUnloadingTime(Number(manufactureInfo?.netPartWeight) / 1000);
      if (manufactureInfo.loadingTime) {
        loadingTime = this.shareService.checkDirtyProperty('loadingTime', fieldColorsList) ? manufacturingObj?.loadingTime : loadingTime;
      }
      manufactureInfo.loadingTime = loadingTime;
    }

    if (manufactureInfo.isUnloadingTimeDirty && !!manufactureInfo.unloadingTime) {
      manufactureInfo.unloadingTime = Number(manufactureInfo.unloadingTime);
    } else {
      let unloadingTime = Number(manufactureInfo.loadingTime);
      if (manufactureInfo.unloadingTime) {
        unloadingTime = this.shareService.checkDirtyProperty('unloadingTime', fieldColorsList) ? manufacturingObj?.unloadingTime : unloadingTime;
      }
      manufactureInfo.unloadingTime = unloadingTime;
    }

    if (manufactureInfo.isSheetLoadULoadTimeDirty && !!manufactureInfo.sheetLoadUloadTime) {
      // clamping/Declamping
      manufactureInfo.sheetLoadUloadTime = Number(manufactureInfo.sheetLoadUloadTime);
    } else {
      let sheetLoadUloadTime = this.shareService.isValidNumber(totalBendCount * 2);
      if (manufactureInfo.sheetLoadUloadTime) {
        sheetLoadUloadTime = this.shareService.checkDirtyProperty('sheetLoadUloadTime', fieldColorsList) ? manufacturingObj?.sheetLoadUloadTime : sheetLoadUloadTime;
      }
      manufactureInfo.sheetLoadUloadTime = sheetLoadUloadTime;
    }

    if (manufactureInfo.isWeldingPositionDirty && !!manufactureInfo.weldingPosition) {
      manufactureInfo.weldingPosition = Number(manufactureInfo.weldingPosition);
    } else {
      let weldingPosition = Math.ceil(this.shareService.isValidNumber(partLength / bendData.efficiencyVal.feed));
      if (manufactureInfo.weldingPosition) {
        weldingPosition = this.shareService.checkDirtyProperty('weldingPosition', fieldColorsList) ? manufacturingObj?.weldingPosition : weldingPosition;
      }
      manufactureInfo.weldingPosition = weldingPosition;
    }

    if (manufactureInfo.isRotationTimeDirty && !!manufactureInfo.rotationTime) {
      manufactureInfo.rotationTime = Number(manufactureInfo.rotationTime);
    } else {
      let rotationTime = this.shareService.isValidNumber(totalBendCount - 1);
      if (manufactureInfo.rotationTime) {
        rotationTime = this.shareService.checkDirtyProperty('rotationTime', fieldColorsList) ? manufacturingObj?.rotationTime : rotationTime;
      }
      manufactureInfo.rotationTime = rotationTime;
    }

    if (manufactureInfo.isWireTwistingSpeedDirty && !!manufactureInfo.wireTwistingSpeed) {
      // bending
      manufactureInfo.wireTwistingSpeed = Number(manufactureInfo.wireTwistingSpeed);
    } else {
      let wireTwistingSpeed = Math.ceil(
        this.shareService.isValidNumber(
          (Number(manufactureInfo.noOfBendsPerXAxis) * bendData.degreeVal['45'] +
            Number(manufactureInfo.noOfBendsPerYAxis) * bendData.degreeVal['90'] +
            Number(manufactureInfo.noOfBendsPerZAxis) * bendData.degreeVal['135'] +
            Number(manufactureInfo.noOfbends) * bendData.degreeVal['180']) *
            (stockType === 2 ? 1.2 : 1)
        )
      );
      if (manufactureInfo.wireTwistingSpeed) {
        wireTwistingSpeed = this.shareService.checkDirtyProperty('wireTwistingSpeed', fieldColorsList) ? manufacturingObj?.wireTwistingSpeed : wireTwistingSpeed;
      }
      manufactureInfo.wireTwistingSpeed = wireTwistingSpeed;
    }

    if (manufactureInfo.isCuttingTimeDirty && !!manufactureInfo.cuttingTime) {
      manufactureInfo.cuttingTime = Number(manufactureInfo.cuttingTime);
    } else {
      let cuttingTime = 0;
      if (Number(manufactureInfo.noOfHitsRequired) === 1) {
        // Tube Sawing is Yes
        cuttingTime = Math.ceil(
          this.shareService.isValidNumber((areaOfCut / this._tubeBendingConfigService.getCuttingRate(partOuterDiameter, materialInfo?.materialMarketData?.materialMaster?.materialTypeId)) * 60)
        );
      }
      if (manufactureInfo.cuttingTime) {
        cuttingTime = this.shareService.checkDirtyProperty('cuttingTime', fieldColorsList) ? manufacturingObj?.cuttingTime : cuttingTime;
      }
      manufactureInfo.cuttingTime = cuttingTime;
    }

    if (manufactureInfo.iscycleTimeDirty && !!manufactureInfo.cycleTime) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(
        Number(manufactureInfo.loadingTime) +
          Number(manufactureInfo.unloadingTime) +
          Number(manufactureInfo.sheetLoadUloadTime) +
          Number(manufactureInfo.weldingPosition) +
          Number(manufactureInfo.rotationTime) +
          Number(manufactureInfo.wireTwistingSpeed) +
          Number(manufactureInfo.cuttingTime)
      );
      if (manufactureInfo.cycleTime) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
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

    //no qa inspector
    !manufactureInfo.qaOfInspector && (manufactureInfo.qaOfInspector = 0.5);

    //Skilled Labors
    !manufactureInfo.noOfSkilledLabours && (manufactureInfo.noOfSkilledLabours = 0.5);

    // if (manufactureInfo.isSkilledLaborRatePerHourDirty && manufactureInfo.noOfSkilledLabours != null) {
    //     manufactureInfo.noOfSkilledLabours = Number(manufactureInfo.noOfSkilledLabours);
    // } else {
    //     if (manufactureInfo.noOfSkilledLabours != null) {
    //         manufactureInfo.noOfSkilledLabours = this.shareService.checkDirtyProperty('noOfSkilledLabours', fieldColorsList) ? manufacturingObj?.noOfSkilledLabours : manufactureInfo.noOfSkilledLabours;
    //     }
    // }

    //Setup time
    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      manufactureInfo.setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : this.shareService.isValidNumber(manufactureInfo.setUpTime);
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
      manufactureInfo.samplingRate = this.shareService.checkDirtyProperty('samplingRate', fieldColorsList) ? manufacturingObj?.samplingRate : this.shareService.isValidNumber(samplingrate);
    }

    //yield percentage
    if (manufactureInfo.isyieldPercentDirty && manufactureInfo.yieldPer != null) {
      manufactureInfo.yieldPer = Number(manufactureInfo.yieldPer);
    } else {
      const yieldPer = 99.5;
      manufactureInfo.yieldPer = this.shareService.checkDirtyProperty('yieldPer', fieldColorsList) ? manufacturingObj?.yieldPer : this.shareService.isValidNumber(yieldPer);
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
      let directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) / 3600) * Number(manufactureInfo.cycleTime) * (Number(manufactureInfo.efficiency) / 100));
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
          ((this.shareService.isValidNumber(manufactureInfo.noOfSkilledLabours) *
            this.shareService.isValidNumber(manufactureInfo.skilledLaborRatePerHour) *
            this.shareService.isValidNumber(manufactureInfo.setUpTime)) /
            60 /
            this.shareService.isValidNumber(manufactureInfo.lotSize)) *
            ((this.shareService.isValidNumber(manufactureInfo.machineHourRate) * this.shareService.isValidNumber(manufactureInfo.setUpTime)) /
              60 /
              this.shareService.isValidNumber(manufactureInfo.lotSize)) *
            this.shareService.isValidNumber(Number(manufactureInfo.efficiency) / 100)
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
      let directLaborCost = this.shareService.isValidNumber(
        (this.shareService.isValidNumber(manufactureInfo.lowSkilledLaborRatePerHour) *
          this.shareService.isValidNumber(manufactureInfo.noOfLowSkilledLabours) *
          this.shareService.isValidNumber(manufactureInfo.cycleTime)) /
          3600 +
          (this.shareService.isValidNumber(manufactureInfo.skilledLaborRatePerHour) *
            this.shareService.isValidNumber(manufactureInfo.noOfSkilledLabours) *
            this.shareService.isValidNumber(manufactureInfo.cycleTime)) /
            3600
      );

      if (manufactureInfo.directLaborCost != null) {
        directLaborCost = this.shareService.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : directLaborCost;
      }
      manufactureInfo.directLaborCost = directLaborCost;
    }

    //inspection cost
    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost != null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      const inspectionCost = this.shareService.isValidNumber(
        ((manufactureInfo.qaOfInspectorRate * manufactureInfo.inspectionTime) / 60 / manufactureInfo.lotSize) * (Number(manufactureInfo.efficiency) / 100)
      );
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
        (1 - this.shareService.isValidNumber(Number(manufactureInfo.yieldPer) / 100)) *
          (this.shareService.isValidNumber(manufactureInfo.directMachineCost) +
            this.shareService.isValidNumber(manufactureInfo.directSetUpCost) +
            this.shareService.isValidNumber(manufactureInfo.directLaborCost) +
            this.shareService.isValidNumber(manufactureInfo.inspectionCost) +
            this.shareService.isValidNumber(scrapRecCost))
        // this.shareService.isValidNumber(manufactureInfo.netMaterialCost)
      );

      if (manufactureInfo.yieldCost != null) {
        yieldCost = this.shareService.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : yieldCost;
      }
      manufactureInfo.yieldCost = yieldCost;
    }

    manufactureInfo.directProcessCost = this.shareService.isValidNumber(
      (this.shareService.isValidNumber(manufactureInfo.directSetUpCost) +
        this.shareService.isValidNumber(manufactureInfo.directLaborCost) +
        this.shareService.isValidNumber(manufactureInfo.inspectionCost) +
        this.shareService.isValidNumber(manufactureInfo.directMachineCost) +
        this.shareService.isValidNumber(manufactureInfo.yieldCost)) *
        Number(manufactureInfo.samplingRate / 100)
    );

    // return new Observable((obs) => { obs.next(manufactureInfo); });
    return manufactureInfo;
  }
}
