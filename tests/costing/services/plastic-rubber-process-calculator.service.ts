import { PrimaryProcessType, ProcessType } from '../costing.config';
import { SharedService } from './shared.service';
import { MaterialInfoDto, MedbMachinesMasterDto, PartInfoDto, ProcessInfoDto } from 'src/app/shared/models';
import { PartComplexity } from 'src/app/shared/enums';
import { Injectable } from '@angular/core';
import { DeburringConfigService } from 'src/app/shared/config/cost-deburring-config';
import { BlowMoldingConfigService } from 'src/app/shared/config/cost-blow-molding-config';
import { ManufacturingCalculatorService } from './manufacturing-calculator.service';
import { PlasticRubberConfigService } from 'src/app/shared/config/plastic-rubber-config.service';

@Injectable({
  providedIn: 'root',
})
export class PlasticRubberProcessCalculatorService {
  constructor(
    private shareService: SharedService,
    private _deburringConfig: DeburringConfigService,
    private _blowMoldingConfig: BlowMoldingConfigService,
    private _commonService: ManufacturingCalculatorService,
    private plasticRubberConfigService: PlasticRubberConfigService
  ) {}

  public selectPostCuringMachine(machine: MedbMachinesMasterDto[], materialInfo: MaterialInfoDto, processInfo: ProcessInfoDto) {
    const machineCapacityMap: { machineId: number; noOfOvenReqd: number }[] = [];

    machine.forEach((mach) => {
      // TODO: till height update in machine table
      const chamberHeight = this.getChamberHeight(mach.bedLength);

      const trayLength = mach.bedLength || 0;
      const trayWidth = mach.bedWidth || 0;
      const trayHeight = 75;
      const usableTrayLength = trayLength - 50;
      const usableTrayWidth = trayWidth - 50;
      const usableTrayHeight = trayHeight;

      const verticalGapMap: { [key: number]: number[] } = this.plasticRubberConfigService.verticalGapMapConfig;

      const curingLookupData = this.plasticRubberConfigService.getPostCureInfo(materialInfo?.materialMarketData?.materialMaster?.materialTypeName);
      const noOfAvlHoursAnually = 5400;
      const cycleTimeHrs = curingLookupData?.cycleTimeHrs ?? 1;
      const noOfCycleReqdAnnual = cycleTimeHrs > 0 ? noOfAvlHoursAnually / cycleTimeHrs : 1;
      const noOfCycleReqdMonthly = Math.floor(noOfCycleReqdAnnual / 12);
      const gapsForMachine: number[] = verticalGapMap[mach.bedLength] || [];

      let minNoOfOvenReqd = Infinity;

      gapsForMachine.forEach((gap: number) => {
        const noOfTrays = Math.floor(chamberHeight / (usableTrayHeight + gap));
        const maxPartHeight = usableTrayHeight + gap - 75;
        let noOfParts = 0;
        let ovenCapacity = 0;
        let capacity = 0;
        let noOfOvenReqd = 0;

        if ((materialInfo?.dimX || 0) > 150 || (materialInfo?.dimY || 0) > 150) {
          const d1 = (materialInfo?.dimY || 0) + 10 || 1;
          const d2 = (materialInfo?.dimZ || 0) + 5 || 1;
          noOfParts = Math.floor(usableTrayLength / d1) * Math.floor(maxPartHeight / d1) * Math.floor((usableTrayWidth - 100) / d2) * noOfTrays;
        } else {
          noOfParts =
            Math.max(
              Math.floor(usableTrayLength / ((materialInfo?.dimX || 0) + 5)) * Math.floor(usableTrayWidth / ((materialInfo?.dimY || 0) + 5)),
              Math.floor(usableTrayWidth / ((materialInfo?.dimX || 0) + 5)) * Math.floor(usableTrayLength / ((materialInfo?.dimY || 0) + 5))
            ) *
            3 *
            noOfTrays;
        }
        ovenCapacity = isNaN(noOfParts * noOfCycleReqdMonthly * 0.75) ? 0 : noOfParts * noOfCycleReqdMonthly * 0.75;
        capacity = ovenCapacity / (processInfo?.lotSize || 1);
        noOfOvenReqd = capacity > 0 ? Math.ceil(1 / capacity) : Infinity;

        minNoOfOvenReqd = Math.min(minNoOfOvenReqd, noOfOvenReqd);
      });

      machineCapacityMap.push({ machineId: mach.machineID, noOfOvenReqd: minNoOfOvenReqd });
    });

    // Select machine with minimum oven requirement
    const selectedMachine = machineCapacityMap.length > 0 ? machineCapacityMap.reduce((prev, curr) => (curr.noOfOvenReqd < prev.noOfOvenReqd ? curr : prev)) : null;

    if (selectedMachine && machine.find((m) => m.machineID === selectedMachine.machineId)) {
      machine = [machine.find((m) => m.machineID === selectedMachine.machineId)!];
    }
    return machine;
  }

  // TODO: This will be removed after some data updates
  private getChamberHeight(bedLength: number): number {
    switch (bedLength) {
      case 3550:
        return 3550;
      case 1200:
        return 1000;
      case 600:
        return 900;
      default:
        return 0;
    }
  }

  // public calculationsForInjectionMoulding(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): Observable<ProcessInfoDto> {
  public calculationsForInjectionMoulding(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
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
    // manufactureInfo.insertPlacement = this.shareService.isValidNumber(2.5 * manufactureInfo.noOfInsert);

    manufactureInfo.shotSize = manufactureInfo.machineMaster?.shotSize || 0;
    manufactureInfo.recBedSize =
      manufactureInfo.platenSizeLength && manufactureInfo.platenSizeWidth ? Math.round(manufactureInfo.platenSizeLength) + ' x ' + Math.round(manufactureInfo.platenSizeWidth) : '';
    manufactureInfo.selectedBedSize =
      manufactureInfo.machineMaster?.platenLengthmm && manufactureInfo.machineMaster?.platenWidthmm
        ? manufactureInfo.machineMaster?.platenLengthmm + ' x ' + manufactureInfo.machineMaster?.platenWidthmm
        : '';

    const injecRate = this.shareService.isValidNumber((Number(manufactureInfo?.machineMaster?.injectionRate) * Number(manufactureInfo.density)) / 1000);
    const shotweight = this.shareService.isValidNumber(manufactureInfo.grossWeight * manufactureInfo.noOfCavities);
    const materialInjectionFillTime = this.shareService.isValidNumber(shotweight / Number(injecRate));
    manufactureInfo.materialInjectionFillTime = materialInjectionFillTime;

    if (manufactureInfo.iscoolingTimeDirty && manufactureInfo.coolingTime !== null) {
      manufactureInfo.coolingTime = Number(manufactureInfo.coolingTime);
    } else {
      let coolingTime = this.shareService.isValidNumber(
        (Math.pow(Number(manufactureInfo.wallAverageThickness), 2) / (2 * 3.141592654) / Number(manufactureInfo.thermalDiffusivity)) *
          Math.log((4 / 3.141592654) * ((Number(manufactureInfo.meltTemp) - Number(manufactureInfo.mouldTemp)) / (Number(manufactureInfo.ejecTemp) - Number(manufactureInfo.mouldTemp))))
      );

      if (manufactureInfo?.wallAverageThickness < 5) {
        coolingTime = this.shareService.isValidNumber(1 * Number(coolingTime));
      } else if (manufactureInfo?.wallAverageThickness >= 5 && manufactureInfo?.wallAverageThickness <= 10) {
        coolingTime = this.shareService.isValidNumber(0.65 * Number(coolingTime));
      } else if (manufactureInfo?.wallAverageThickness >= 10 && manufactureInfo?.wallAverageThickness <= 15) {
        coolingTime = this.shareService.isValidNumber(0.5 * Number(coolingTime));
      } else if (manufactureInfo?.wallAverageThickness > 15) {
        coolingTime = this.shareService.isValidNumber(0.42 * Number(coolingTime));
      }
      if (manufactureInfo.coolingTime !== null) {
        coolingTime = this.shareService.checkDirtyProperty('coolingTime', fieldColorsList) ? manufacturingObj?.coolingTime : coolingTime;
      }
      manufactureInfo.coolingTime = coolingTime;
    }

    if (manufactureInfo.isInsertsPlacementDirty && manufactureInfo.insertsPlacement !== null) {
      manufactureInfo.insertsPlacement = Number(manufactureInfo.insertsPlacement);
    } else {
      let insertsPlacement = this.shareService.isValidNumber(2.5 * manufactureInfo.noOfInsert);
      // if ([1, 2, 3].includes(manufactureInfo.noOfInsert)) {
      //   insertsPlacement = manufactureInfo.noOfInsert;
      // } else if (manufactureInfo.noOfInsert >= 4) {
      //   insertsPlacement = 5;
      // }
      if (manufactureInfo.insertsPlacement !== null) {
        insertsPlacement = this.shareService.checkDirtyProperty('insertsPlacement', fieldColorsList) ? manufacturingObj?.insertsPlacement : insertsPlacement;
      }
      manufactureInfo.insertsPlacement = insertsPlacement;
    }

    if (manufactureInfo.isPartEjectionDirty && manufactureInfo.partEjection !== null) {
      manufactureInfo.partEjection = Number(manufactureInfo.partEjection);
    } else {
      let partEjection =
        manufactureInfo?.partComplexity == PartComplexity.Low ? 3 : manufactureInfo?.partComplexity == PartComplexity.Medium ? 5.5 : manufactureInfo?.partComplexity == PartComplexity.High ? 8 : 0;
      if (manufactureInfo.partEjection !== null) {
        partEjection = this.shareService.checkDirtyProperty('partEjection', fieldColorsList) ? manufacturingObj?.partEjection : this.shareService.isValidNumber(partEjection);
      }
      manufactureInfo.partEjection = partEjection;
    }
    if (manufactureInfo.isSideCoreMechanismsDirty && manufactureInfo.sideCoreMechanisms !== null) {
      manufactureInfo.sideCoreMechanisms = Number(manufactureInfo.sideCoreMechanisms);
    } else {
      let sideCoreMechanisms =
        manufactureInfo?.partComplexity == PartComplexity.Low ? 2 : manufactureInfo?.partComplexity == PartComplexity.Medium ? 4 : manufactureInfo?.partComplexity == PartComplexity.High ? 8 : 0;
      if (manufactureInfo.sideCoreMechanisms !== null) {
        sideCoreMechanisms = this.shareService.checkDirtyProperty('sideCoreMechanisms', fieldColorsList) ? manufacturingObj?.sideCoreMechanisms : sideCoreMechanisms;
      }
      manufactureInfo.sideCoreMechanisms = sideCoreMechanisms;
    }

    if (manufactureInfo.isOthersDirty && manufactureInfo.others !== null) {
      manufactureInfo.others = Number(manufactureInfo.others);
    } else {
      manufactureInfo.others = this.shareService.checkDirtyProperty('others', fieldColorsList) ? manufacturingObj?.others : this.shareService.isValidNumber(manufactureInfo.others);
    }

    const packAndHoldTime =
      manufactureInfo?.partComplexity == PartComplexity.Low ? 1 : manufactureInfo?.partComplexity == PartComplexity.Medium ? 2 : manufactureInfo?.partComplexity == PartComplexity.High ? 3 : 5;
    manufactureInfo.packAndHoldTime = packAndHoldTime;

    if (manufactureInfo.isinjectionTimeDirty && manufactureInfo.injectionTime !== null) {
      manufactureInfo.injectionTime = Number(manufactureInfo.injectionTime);
    } else {
      let injectionTime = Number(manufactureInfo.packAndHoldTime) + Number(manufactureInfo.materialInjectionFillTime);
      if (manufactureInfo.injectionTime !== null) {
        injectionTime = this.shareService.checkDirtyProperty('injectionTime', fieldColorsList) ? manufacturingObj?.injectionTime : this.shareService.isValidNumber(injectionTime);
      }
      manufactureInfo.injectionTime = injectionTime;
    }

    if (manufactureInfo.isDryCycleTimeDirty && manufactureInfo.dryCycleTime !== null) {
      manufactureInfo.dryCycleTime = Number(manufactureInfo.dryCycleTime);
    } else {
      manufactureInfo.dryCycleTime = this.shareService.checkDirtyProperty('dryCycleTime', fieldColorsList)
        ? manufacturingObj?.dryCycleTime
        : this.shareService.isValidNumber(manufactureInfo.dryCycleTime);
    }

    if (manufactureInfo.isTotalTimeDirty && manufactureInfo.totalTime !== null) {
      manufactureInfo.totalTime = Number(manufactureInfo.totalTime);
    } else {
      let totalTime = this.shareService.isValidNumber(
        Number(manufactureInfo.insertsPlacement) +
          Number(manufactureInfo.sideCoreMechanisms) +
          Number(manufactureInfo.injectionTime) +
          Number(manufactureInfo.partEjection) +
          Number(manufactureInfo.others) +
          Number(manufactureInfo.coolingTime) +
          Number(manufactureInfo.dryCycleTime)
      );
      if (manufactureInfo.totalTime !== null) {
        totalTime = this.shareService.checkDirtyProperty('totalTime', fieldColorsList) ? manufacturingObj?.totalTime : totalTime;
      }
      manufactureInfo.totalTime = totalTime;
    }

    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime !== null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(
        (Number(manufactureInfo.insertsPlacement) +
          Number(manufactureInfo.sideCoreMechanisms) +
          Number(manufactureInfo.injectionTime) +
          Number(manufactureInfo.partEjection) +
          Number(manufactureInfo.others) +
          Number(manufactureInfo.coolingTime) +
          Number(manufactureInfo.dryCycleTime)) /
          (manufactureInfo?.materialInfoList?.length > 0 ? manufactureInfo?.materialInfoList[0]?.noOfCavities : 1)
      );
      if (manufactureInfo.cycleTime !== null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost !== null) {
      manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
    } else {
      let directMachineCost = this.shareService.isValidNumber(((Number(manufactureInfo.machineHourRate) / 3600) * manufactureInfo.cycleTime) / manufactureInfo.efficiency);
      if (manufactureInfo.directMachineCost !== null) {
        directMachineCost = this.shareService.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : directMachineCost;
      }
      manufactureInfo.directMachineCost = directMachineCost;
    }
    //Setup time
    if (manufactureInfo.issetUpTimeDirty && !!manufactureInfo.setUpTime) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      let setUpTime = 60;
      if (manufactureInfo.setUpTime !== null) {
        setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : setUpTime;
      }
      manufactureInfo.setUpTime = setUpTime;
    }
    //Direct labors
    if (manufactureInfo.isNoOfLowSkilledLaboursDirty && manufactureInfo.noOfLowSkilledLabours !== null) {
      manufactureInfo.noOfLowSkilledLabours = Number(manufactureInfo.noOfLowSkilledLabours);
    } else {
      manufactureInfo.noOfLowSkilledLabours = this.shareService.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList)
        ? manufacturingObj?.noOfLowSkilledLabours
        : this.shareService.isValidNumber(manufactureInfo.noOfLowSkilledLabours);
    }

    manufactureInfo.lowSkilledLaborRatePerHour = this.shareService.isValidNumber(manufactureInfo.lowSkilledLaborRatePerHour);

    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost !== null) {
      manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
    } else {
      let directLaborCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.noOfLowSkilledLabours) * manufactureInfo.cycleTime * (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600)) / manufactureInfo?.efficiency +
          (Number(manufactureInfo.noOfSkilledLabours) * manufactureInfo.cycleTime * (Number(manufactureInfo.skilledLaborRatePerHour) / 3600)) / manufactureInfo?.efficiency
      );

      // let directLaborCost = this.shareService.isValidNumber(
      //   ((Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) * (manufactureInfo.cycleTime * Number(manufactureInfo.noOfLowSkilledLabours))) / Number(manufactureInfo.noOfCavities)
      // );
      if (manufactureInfo.directLaborCost !== null) {
        directLaborCost = this.shareService.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : directLaborCost;
      }
      manufactureInfo.directLaborCost = directLaborCost;
    }

    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost !== null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      let inspectionCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.qaOfInspectorRate) * 1 * Number(manufactureInfo.inspectionTime) * Number(manufactureInfo.samplingRate / 100)) / 100 / 60 / Number(manufactureInfo.efficiency)
        // Number(manufactureInfo.samplingRate / 100) * ((Number(manufactureInfo.inspectionTime) * Number(manufactureInfo.qaOfInspectorRate)) / 3600)
      );
      if (manufactureInfo.inspectionCost !== null) {
        inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : inspectionCost;
      }
      manufactureInfo.inspectionCost = inspectionCost;
    }
    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost !== null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      let directSetUpCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.setUpTime) / 60 / Number(manufactureInfo.efficiency) / Number(manufactureInfo.lotSize)) *
          (Number(manufactureInfo.lowSkilledLaborRatePerHour) * Number(manufactureInfo.noOfLowSkilledLabours) +
            Number(manufactureInfo.skilledLaborRatePerHour) * Number(manufactureInfo.noOfSkilledLabours))
        // ((Number(manufactureInfo.lowSkilledLaborRatePerHour) + Number(manufactureInfo.machineHourRate)) * (Number(manufactureInfo.setUpTime) / 60)) / manufactureInfo.lotSize
      );
      if (manufactureInfo.directSetUpCost !== null) {
        directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.setUpCost : directSetUpCost;
      }
      manufactureInfo.directSetUpCost = directSetUpCost;
    }
    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost !== null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      const sum = this.shareService.isValidNumber(
        Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
      );
      manufactureInfo.netMaterialCost = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.netMatCost : 0;
      let yieldCost = this.shareService.isValidNumber(
        (1 - Number(manufactureInfo.yieldPer) / 100) *
          (Number(manufactureInfo.netMaterialCost) - (Number(manufactureInfo.netPartWeight) * Number(manufactureInfo.materialInfo.scrapPrice)) / 1000 + sum)
      );
      if (manufactureInfo.yieldCost != null) {
        yieldCost = this.shareService.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : yieldCost;
      }
      manufactureInfo.yieldCost = yieldCost;
    }

    const processCost = this.shareService.isValidNumber(
      Number(manufactureInfo.directLaborCost) +
        Number(manufactureInfo.directMachineCost) +
        Number(manufactureInfo.directSetUpCost) +
        Number(manufactureInfo.inspectionCost) +
        Number(manufactureInfo.yieldCost)
    );

    manufactureInfo.directTooling = this.shareService.isValidNumber(
      (Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost)) * 0.01
    );
    manufactureInfo.directProcessCost = processCost;
    manufactureInfo.conversionCost = processCost;
    manufactureInfo.partCost = manufactureInfo.rawmaterialCost + manufactureInfo.conversionCost;
    //manufactureInfo = this._commonService.calculateESGCosts(manufactureInfo, fieldColorsList, manufacturingObj);
    // return new Observable((obs) => { obs.next(manufactureInfo); });
    return manufactureInfo;
  }

  public calculationsForRubberInjectionMoulding(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
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
    const materialInfo = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0] : null;

    // const cavityPressure = materialInfo?.materialMasterData?.clampingPressure || 0;
    // manufactureInfo.cavityPressure = cavityPressure;
    // const recommendTonnage = Math.ceil(
    //   ((materialInfo?.runnerProjectedArea + (materialInfo?.partProjectedArea || materialInfo?.projectedArea)) * materialInfo?.noOfCavities * cavityPressure * 1.15) / 1000
    // );
    // const recMachine = [this.plasticRubberConfigService.getBestMachineForRubberMolding(machine, materialInfo, this.currentPart)?.machine];

    // manufactureInfo.recommendTonnage = manufactureInfo?.machineMaster?.machineTonnageTons || 0; // this.shareService.isValidNumber(recommendTonnage);

    manufactureInfo.selectedTonnage = manufactureInfo?.machineMaster?.machineTonnageTons || 0;
    const injectionVolume = manufactureInfo?.machineMaster?.injectionRate || 0;
    manufactureInfo.shotSize = injectionVolume * materialInfo?.density || 0;
    manufactureInfo.requiredCurrent = this.shareService.isValidNumber(materialInfo?.grossWeight * materialInfo?.noOfCavities);

    manufactureInfo.recBedSize =
      manufactureInfo.platenSizeLength && manufactureInfo.platenSizeWidth ? Math.round(manufactureInfo.platenSizeLength) + ' x ' + Math.round(manufactureInfo.platenSizeWidth) : '';
    manufactureInfo.selectedBedSize =
      manufactureInfo.machineMaster?.platenLengthmm && manufactureInfo.machineMaster?.platenWidthmm
        ? manufactureInfo.machineMaster?.platenLengthmm + ' x ' + manufactureInfo.machineMaster?.platenWidthmm
        : '';

    // Insert Placement Time
    if (manufactureInfo.isInsertsPlacementDirty && manufactureInfo.insertsPlacement !== null) {
      manufactureInfo.insertsPlacement = Number(manufactureInfo.insertsPlacement);
    } else {
      let insertsPlacement = 0;
      if (materialInfo?.noOfInserts && materialInfo.noOfInserts <= 10) {
        insertsPlacement = 5 * materialInfo.noOfInserts;
      } else if (materialInfo?.noOfInserts && materialInfo.noOfInserts > 10) {
        insertsPlacement = 60;
      }

      if (manufactureInfo.insertsPlacement !== null) {
        insertsPlacement = this.shareService.checkDirtyProperty('insertsPlacement', fieldColorsList) ? manufacturingObj?.insertsPlacement : insertsPlacement;
      }
      manufactureInfo.insertsPlacement = insertsPlacement;
    }

    // const materialType = manufactureInfo?.materialmasterDatas?.materialType?.materialTypeName;
    const materialType = materialInfo?.materialMarketData?.materialMaster?.materialTypeName || '';
    // Curing Time
    if (manufactureInfo.isSideCoreMechanismsDirty && manufactureInfo.sideCoreMechanisms != null) {
      manufactureInfo.sideCoreMechanisms = Number(manufactureInfo.sideCoreMechanisms);
    } else {
      // let kFact = 1.5;
      // kFact = this.plasticRubberConfigService.kFactorRubberIM.find((item) => item.materialType === materialType)?.kFactor ?? 1.5;

      // let curingTime = this.shareService.isValidNumber(kFact * Math.pow(materialInfo?.wallThickessMm, 2) * 1.3);
      const curingInfo = this.plasticRubberConfigService.getRubberMoldingCuringInfo(materialType, materialInfo?.wallAverageThickness || 0);

      // Weight factor
      let weightFactor: number;
      if (manufactureInfo.grossWeight <= 10) {
        weightFactor = 0.95;
      } else if (manufactureInfo.grossWeight > 10 && manufactureInfo.grossWeight <= 20) {
        weightFactor = 1.0;
      } else {
        weightFactor = 1.1;
      }

      const cureSystemFactor = 0.95;

      // If curingInfo values are in minutes, convert to seconds here
      let curingTime = 0;
      if (curingInfo) {
        // const baseTimeSec = (curingInfo.baseCuringTimeMin || 0) * 60; // convert minutes to seconds
        curingTime = (curingInfo.cri || 1) * curingInfo.baseCuringTimeMin * (curingInfo.shearFactor || 1) * weightFactor * cureSystemFactor;
      }

      if (manufactureInfo.sideCoreMechanisms !== null) {
        curingTime = this.shareService.checkDirtyProperty('sideCoreMechanisms', fieldColorsList) ? manufacturingObj?.sideCoreMechanisms : curingTime;
      }
      manufactureInfo.sideCoreMechanisms = this.shareService.isValidNumber(curingTime);
    }

    // Handling Time
    if (manufactureInfo.iscoolingTimeDirty && manufactureInfo.coolingTime !== null) {
      manufactureInfo.coolingTime = Number(manufactureInfo.coolingTime);
    } else {
      // let holdingTime = this.shareService.isValidNumber(manufactureInfo.sideCoreMechanisms * 0.3);
      let handlingTime = 0;

      if (materialInfo?.noOfCavities >= 1 && materialInfo?.noOfCavities <= 10) handlingTime = 20;
      if (materialInfo?.noOfCavities >= 11 && materialInfo?.noOfCavities <= 40) handlingTime = 35;
      if (materialInfo?.noOfCavities >= 41 && materialInfo?.noOfCavities <= 70) handlingTime = 50;
      if (materialInfo?.noOfCavities >= 71 && materialInfo?.noOfCavities <= 100) handlingTime = 65;
      if (materialInfo?.noOfCavities >= 101 && materialInfo?.noOfCavities <= 150) handlingTime = 75;
      if (materialInfo?.noOfCavities >= 151 && materialInfo?.noOfCavities <= 999) handlingTime = 90;

      handlingTime += 20; // Mold open and close time

      if (manufactureInfo.coolingTime !== null) {
        handlingTime = this.shareService.checkDirtyProperty('coolingTime', fieldColorsList) ? manufacturingObj?.coolingTime : handlingTime;
      }
      manufactureInfo.coolingTime = handlingTime;
    }

    if (manufactureInfo.isTotalTimeDirty && manufactureInfo.totalTime !== null) {
      manufactureInfo.totalTime = Number(manufactureInfo.totalTime);
    } else {
      let totalTime = this.shareService.isValidNumber(Number(manufactureInfo.insertsPlacement) + Number(manufactureInfo.sideCoreMechanisms) + Number(manufactureInfo.coolingTime));
      if (manufactureInfo.totalTime !== null) {
        totalTime = this.shareService.checkDirtyProperty('totalTime', fieldColorsList) ? manufacturingObj?.totalTime : totalTime;
      }
      manufactureInfo.totalTime = totalTime;
    }

    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime !== null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(manufactureInfo.totalTime / (manufactureInfo?.materialInfoList?.length > 0 ? manufactureInfo?.materialInfoList[0]?.noOfCavities : 1));
      if (manufactureInfo.cycleTime !== null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost !== null) {
      manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
    } else {
      let directMachineCost = this.shareService.isValidNumber(((Number(manufactureInfo.machineHourRate) / 3600) * manufactureInfo.cycleTime) / manufactureInfo.efficiency);
      if (manufactureInfo.directMachineCost !== null) {
        directMachineCost = this.shareService.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : directMachineCost;
      }
      manufactureInfo.directMachineCost = directMachineCost;
    }
    //Setup time
    if (manufactureInfo.issetUpTimeDirty && !!manufactureInfo.setUpTime) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      let setUpTime = 60;
      if (manufactureInfo.setUpTime !== null) {
        setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : setUpTime;
      }
      manufactureInfo.setUpTime = setUpTime;
    }
    //Direct labors
    if (manufactureInfo.isNoOfLowSkilledLaboursDirty && manufactureInfo.noOfLowSkilledLabours !== null) {
      manufactureInfo.noOfLowSkilledLabours = Number(manufactureInfo.noOfLowSkilledLabours);
    } else {
      manufactureInfo.noOfLowSkilledLabours = this.shareService.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList)
        ? manufacturingObj?.noOfLowSkilledLabours
        : this.shareService.isValidNumber(manufactureInfo.noOfLowSkilledLabours);
    }

    // manufactureInfo.lowSkilledLaborRatePerHour = this.shareService.isValidNumber(manufactureInfo.lowSkilledLaborRatePerHour);

    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost !== null) {
      manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
    } else {
      let directLaborCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.noOfLowSkilledLabours) * manufactureInfo.cycleTime * (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600)) / manufactureInfo?.efficiency +
          (Number(manufactureInfo.noOfSkilledLabours) * manufactureInfo.cycleTime * (Number(manufactureInfo.skilledLaborRatePerHour) / 3600)) / manufactureInfo?.efficiency
      );

      // let directLaborCost = this.shareService.isValidNumber(
      //   ((Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) * (manufactureInfo.cycleTime * Number(manufactureInfo.noOfLowSkilledLabours))) / Number(manufactureInfo.noOfCavities)
      // );
      if (manufactureInfo.directLaborCost !== null) {
        directLaborCost = this.shareService.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : directLaborCost;
      }
      manufactureInfo.directLaborCost = directLaborCost;
    }

    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost !== null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      let inspectionCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.qaOfInspectorRate) * Number(manufactureInfo.inspectionTime)) / 60 / Number(manufactureInfo.efficiency) / Number(manufactureInfo.lotSize)
        // Number(manufactureInfo.samplingRate / 100) * ((Number(manufactureInfo.inspectionTime) * Number(manufactureInfo.qaOfInspectorRate)) / 3600)
      );
      if (manufactureInfo.inspectionCost !== null) {
        inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : inspectionCost;
      }
      manufactureInfo.inspectionCost = inspectionCost;
    }

    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost !== null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      let directSetUpCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.setUpTime) / 60 / Number(manufactureInfo.efficiency) / Number(manufactureInfo.lotSize)) *
          (Number(manufactureInfo.lowSkilledLaborRatePerHour) * Number(manufactureInfo.noOfLowSkilledLabours) +
            Number(manufactureInfo.skilledLaborRatePerHour) * Number(manufactureInfo.noOfSkilledLabours))
        // ((Number(manufactureInfo.lowSkilledLaborRatePerHour) + Number(manufactureInfo.machineHourRate)) * (Number(manufactureInfo.setUpTime) / 60)) / manufactureInfo.lotSize
      );
      if (manufactureInfo.directSetUpCost !== null) {
        directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.setUpCost : directSetUpCost;
      }
      manufactureInfo.directSetUpCost = directSetUpCost;
    }

    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost !== null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      const sum = this.shareService.isValidNumber(
        Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
      );
      manufactureInfo.netMaterialCost = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.netMatCost : 0;
      let yieldCost = this.shareService.isValidNumber(
        (1 - Number(manufactureInfo.yieldPer) / 100) *
          // Number(manufactureInfo.netMaterialCost) - (Number(manufactureInfo.netPartWeight) * Number(manufactureInfo.materialInfo?.scrapPrice)) / 1000 +
          sum
      );
      if (manufactureInfo.yieldCost !== null) {
        yieldCost = this.shareService.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : yieldCost;
      }
      manufactureInfo.yieldCost = yieldCost;
    }

    const processCost = this.shareService.isValidNumber(
      Number(manufactureInfo.directLaborCost) +
        Number(manufactureInfo.directMachineCost) +
        Number(manufactureInfo.directSetUpCost) +
        Number(manufactureInfo.inspectionCost) +
        Number(manufactureInfo.yieldCost)
    );

    manufactureInfo.directTooling = this.shareService.isValidNumber(
      (Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost)) * 0.01
    );
    manufactureInfo.directProcessCost = processCost;
    manufactureInfo.conversionCost = processCost;
    manufactureInfo.partCost = manufactureInfo.rawmaterialCost + manufactureInfo.conversionCost;
    //manufactureInfo = this._commonService.calculateESGCosts(manufactureInfo, fieldColorsList, manufacturingObj);
    // return new Observable((obs) => { obs.next(manufactureInfo); });
    return manufactureInfo;
  }

  public calculationsForRubberExtrusion(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    manufactureInfo.density = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.density : 0;
    const netWeight = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.netWeight : 0;
    const grossWeight = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.grossWeight : 0;
    manufactureInfo.noOfCavities = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.noOfCavities : 0;

    //Capacity Utilization Factor
    if (manufactureInfo.isNoOfStrokesDirty && manufactureInfo.noofStroke != null) {
      manufactureInfo.noofStroke = Number(manufactureInfo.noofStroke);
    } else {
      let noOfStrokes =
        manufactureInfo?.partComplexity == PartComplexity.Low
          ? 0.9
          : manufactureInfo?.partComplexity == PartComplexity.Medium
            ? 0.85
            : manufactureInfo?.partComplexity == PartComplexity.High
              ? 0.8
              : 0;
      if (manufactureInfo.noofStroke != null) {
        noOfStrokes = this.shareService.checkDirtyProperty('noOfStrokes', fieldColorsList) ? manufacturingObj?.noofStroke : this.shareService.isValidNumber(noOfStrokes);
      }
      manufactureInfo.noofStroke = noOfStrokes;
    }
    //Rubber weight processed by machine per batch (g):
    if (manufactureInfo.isLoadingTimeDirty && manufactureInfo.loadingTime != null) {
      manufactureInfo.loadingTime = Number(manufactureInfo.loadingTime);
    } else {
      if (manufactureInfo?.loadingTime != null) {
        manufactureInfo.loadingTime = this.shareService.checkDirtyProperty('loadingTime', fieldColorsList) ? manufacturingObj?.loadingTime : 17000;
      }
    }
    //Cycle Time per batch (s):
    if (manufactureInfo.isProcessTimeDirty && manufactureInfo.processTime != null) {
      manufactureInfo.processTime = Number(manufactureInfo.processTime);
    } else {
      let cycleTimePerBatch = manufactureInfo?.processTypeID == ProcessType.RubberMaterialPreparation ? 1260 : manufactureInfo?.processTypeID == ProcessType.RubberExtrusion ? 3600 : 0;
      if (manufactureInfo.processTime != null) {
        cycleTimePerBatch = this.shareService.checkDirtyProperty('processTime', fieldColorsList) ? manufacturingObj?.processTime : cycleTimePerBatch;
      }
      manufactureInfo.processTime = cycleTimePerBatch;
    }
    //No. of parts processed per batch:
    if (manufactureInfo.iscoolingTimeDirty && manufactureInfo.coolingTime != null) {
      manufactureInfo.coolingTime = Number(manufactureInfo.coolingTime);
    } else {
      let noofPartsProcessed = 0;
      if (manufactureInfo?.processTypeID == ProcessType.RubberExtrusion) {
        noofPartsProcessed = this.shareService.isValidNumber(Math.floor(manufactureInfo.loadingTime / netWeight));
      } else if (manufactureInfo?.processTypeID == ProcessType.RubberMaterialPreparation) {
        noofPartsProcessed = this.shareService.isValidNumber(Math.floor(manufactureInfo.loadingTime / grossWeight));
      }
      if (manufactureInfo.coolingTime != null) {
        noofPartsProcessed = this.shareService.checkDirtyProperty('coolingTime', fieldColorsList) ? manufacturingObj?.coolingTime : noofPartsProcessed;
      }
      manufactureInfo.coolingTime = noofPartsProcessed;
    }

    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(Number(manufactureInfo.processTime) / Number(manufactureInfo.coolingTime));
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
        (manufactureInfo.inspectionTime * Number(manufactureInfo.qaOfInspectorRate)) / 60 / Number(manufactureInfo.efficiency) / Number(manufactureInfo.lotSize)
      );
      if (manufactureInfo.inspectionCost != null) {
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
      manufactureInfo.netMaterialCost = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.netMatCost : 0;
      let yieldCost = this.shareService.isValidNumber((1 - Number(manufactureInfo.yieldPer) / 100) * (Number(manufactureInfo.netMaterialCost) + sum));
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
    //manufactureInfo = this._commonService.calculateESGCosts(manufactureInfo, fieldColorsList, manufacturingObj);
    return manufactureInfo;
  }

  public calculationsForCompressionMolding(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    manufactureInfo.density = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.density : 0;
    manufactureInfo.grossWeight = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.grossWeight : 0;
    //const noOfCavities = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.noOfCavities : 0;
    // const partProjectedArea = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.partProjectedArea : 0;
    // const rubberFinish = Number(manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.partFinish : 0);

    const materialInfo = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0] : null;
    // const cavityPressure = materialInfo?.materialMasterData?.clampingPressure || 0;
    // manufactureInfo.cavityPressure = cavityPressure;

    manufactureInfo.selectedTonnage = manufactureInfo?.machineMaster?.machineTonnageTons || 0;
    const injectionVolume = manufactureInfo?.machineMaster?.injectionRate || 0;
    manufactureInfo.shotSize = injectionVolume * materialInfo?.density || 0;
    manufactureInfo.requiredCurrent = this.shareService.isValidNumber(materialInfo?.grossWeight * materialInfo?.noOfCavities);

    manufactureInfo.recBedSize =
      manufactureInfo.platenSizeLength && manufactureInfo.platenSizeWidth ? Math.round(manufactureInfo.platenSizeLength) + ' x ' + Math.round(manufactureInfo.platenSizeWidth) : '';
    manufactureInfo.selectedBedSize =
      manufactureInfo.machineMaster?.platenLengthmm && manufactureInfo.machineMaster?.platenWidthmm
        ? manufactureInfo.machineMaster?.platenLengthmm + ' x ' + manufactureInfo.machineMaster?.platenWidthmm
        : '';

    // const recommendTonnage = Math.ceil(
    //   ((materialInfo?.runnerProjectedArea + (materialInfo?.partProjectedArea || materialInfo?.projectedArea)) * materialInfo?.noOfCavities * cavityPressure * 1.15) / 1000
    // );
    // manufactureInfo.recommendTonnage = this.shareService.isValidNumber(recommendTonnage);
    manufactureInfo.selectedTonnage = manufactureInfo.machineMaster?.machineTonnageTons;

    // Insert Placement Time
    if (manufactureInfo.isDryCycleTimeDirty && manufactureInfo.dryCycleTime !== null) {
      manufactureInfo.dryCycleTime = Number(manufactureInfo.dryCycleTime);
    } else {
      let insertsPlacement = 0;
      if (materialInfo?.noOfInserts && materialInfo.noOfInserts <= 10) {
        insertsPlacement = 5 * materialInfo.noOfInserts;
      } else if (materialInfo?.noOfInserts && materialInfo.noOfInserts > 10) {
        insertsPlacement = 60;
      }

      if (manufactureInfo.dryCycleTime !== null) {
        insertsPlacement = this.shareService.checkDirtyProperty('dryCycleTime', fieldColorsList) ? manufacturingObj?.dryCycleTime : insertsPlacement;
      }
      manufactureInfo.dryCycleTime = insertsPlacement;
    }

    // const materialType = manufactureInfo?.materialmasterDatas?.materialType?.materialTypeName;
    const materialType = materialInfo?.materialMarketData?.materialMaster?.materialTypeName || materialInfo?.materialMasterData?.materialTypeName || '';
    // Curing Time
    if (manufactureInfo.isdieOpeningTimeDirty && manufactureInfo.dieOpeningTime != null) {
      manufactureInfo.dieOpeningTime = Number(manufactureInfo.dieOpeningTime);
    } else {
      const curingInfo = this.plasticRubberConfigService.getRubberMoldingCuringInfo(materialType, materialInfo?.wallAverageThickness || 0);

      // Weight factor
      let weightFactor: number;
      if (manufactureInfo.grossWeight <= 10) {
        weightFactor = 0.95;
      } else if (manufactureInfo.grossWeight > 10 && manufactureInfo.grossWeight <= 20) {
        weightFactor = 1.0;
      } else {
        weightFactor = 1.1;
      }

      const cureSystemFactor = 0.95;

      let curingTime = 0;
      if (curingInfo) {
        // const baseTimeSec = (curingInfo.baseCuringTimeMin || 0) * 60; // convert minutes to seconds
        curingTime = (curingInfo.cri || 1) * curingInfo.baseCuringTimeMin * 1.05 * weightFactor * cureSystemFactor;
      }

      if (manufactureInfo.dieOpeningTime !== null) {
        curingTime = this.shareService.checkDirtyProperty('dieOpeningTime', fieldColorsList) ? manufacturingObj?.dieOpeningTime : curingTime;
      }
      manufactureInfo.dieOpeningTime = this.shareService.isValidNumber(curingTime);
    }

    // Handling Time
    if (manufactureInfo.iscoolingTimeDirty && manufactureInfo.coolingTime !== null) {
      manufactureInfo.coolingTime = Number(manufactureInfo.coolingTime);
    } else {
      // let holdingTime = this.shareService.isValidNumber(manufactureInfo.sideCoreMechanisms * 0.3);
      let handlingTime = 0;

      if (materialInfo?.noOfCavities >= 1 && materialInfo?.noOfCavities <= 10) handlingTime = 20;
      if (materialInfo?.noOfCavities >= 11 && materialInfo?.noOfCavities <= 40) handlingTime = 35;
      if (materialInfo?.noOfCavities >= 41 && materialInfo?.noOfCavities <= 70) handlingTime = 50;
      if (materialInfo?.noOfCavities >= 71 && materialInfo?.noOfCavities <= 100) handlingTime = 65;
      if (materialInfo?.noOfCavities >= 101 && materialInfo?.noOfCavities <= 150) handlingTime = 75;
      if (materialInfo?.noOfCavities >= 151 && materialInfo?.noOfCavities <= 999) handlingTime = 90;

      handlingTime += 20; // Mold open and close time

      if (manufactureInfo.coolingTime !== null) {
        handlingTime = this.shareService.checkDirtyProperty('coolingTime', fieldColorsList) ? manufacturingObj?.coolingTime : handlingTime;
      }
      manufactureInfo.coolingTime = handlingTime;
    }

    //Total time  per shot
    if (manufactureInfo.isProcessTimeDirty && manufactureInfo.processTime !== null) {
      manufactureInfo.processTime = Number(manufactureInfo.processTime);
    } else {
      let totalTime = this.shareService.isValidNumber(Number(manufactureInfo.dryCycleTime) + Number(manufactureInfo.dieOpeningTime) + Number(manufactureInfo.coolingTime));
      if (manufactureInfo.processTime !== null) {
        totalTime = this.shareService.checkDirtyProperty('processTime', fieldColorsList) ? manufacturingObj?.processTime : totalTime;
      }
      manufactureInfo.processTime = totalTime;
    }

    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(Number(manufactureInfo.processTime) / (manufactureInfo?.materialInfoList?.length > 0 ? manufactureInfo?.materialInfoList[0]?.noOfCavities : 1));
      if (manufactureInfo.cycleTime != null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost !== null) {
      manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
    } else {
      let directMachineCost = this.shareService.isValidNumber(((Number(manufactureInfo.machineHourRate) / 3600) * manufactureInfo.cycleTime) / manufactureInfo.efficiency);
      if (manufactureInfo.directMachineCost !== null) {
        directMachineCost = this.shareService.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : directMachineCost;
      }
      manufactureInfo.directMachineCost = directMachineCost;
    }

    //Setup time
    if (manufactureInfo.issetUpTimeDirty && !!manufactureInfo.setUpTime) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      let setUpTime = 60;
      if (manufactureInfo.setUpTime !== null) {
        setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : setUpTime;
      }
      manufactureInfo.setUpTime = setUpTime;
    }
    //Direct labors
    if (manufactureInfo.isNoOfLowSkilledLaboursDirty && manufactureInfo.noOfLowSkilledLabours !== null) {
      manufactureInfo.noOfLowSkilledLabours = Number(manufactureInfo.noOfLowSkilledLabours);
    } else {
      manufactureInfo.noOfLowSkilledLabours = this.shareService.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList)
        ? manufacturingObj?.noOfLowSkilledLabours
        : this.shareService.isValidNumber(manufactureInfo.noOfLowSkilledLabours);
    }

    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost !== null) {
      manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
    } else {
      let directLaborCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.noOfLowSkilledLabours) * manufactureInfo.cycleTime * (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600)) / manufactureInfo?.efficiency +
          (Number(manufactureInfo.noOfSkilledLabours) * manufactureInfo.cycleTime * (Number(manufactureInfo.skilledLaborRatePerHour) / 3600)) / manufactureInfo?.efficiency
      );

      // let directLaborCost = this.shareService.isValidNumber(
      //   ((Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) * (manufactureInfo.cycleTime * Number(manufactureInfo.noOfLowSkilledLabours))) / Number(manufactureInfo.noOfCavities)
      // );
      if (manufactureInfo.directLaborCost !== null) {
        directLaborCost = this.shareService.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : directLaborCost;
      }
      manufactureInfo.directLaborCost = directLaborCost;
    }

    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost !== null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      let directSetUpCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.setUpTime) / 60 / Number(manufactureInfo.efficiency) / Number(manufactureInfo.lotSize)) *
          (Number(manufactureInfo.lowSkilledLaborRatePerHour) * Number(manufactureInfo.noOfLowSkilledLabours) +
            Number(manufactureInfo.skilledLaborRatePerHour) * Number(manufactureInfo.noOfSkilledLabours))

        // ((Number(manufactureInfo.lowSkilledLaborRatePerHour) + Number(manufactureInfo.machineHourRate)) * (Number(manufactureInfo.setUpTime) / 60)) / manufactureInfo.lotSize
      );
      if (manufactureInfo.directSetUpCost !== null) {
        directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.setUpCost : directSetUpCost;
      }
      manufactureInfo.directSetUpCost = directSetUpCost;
    }

    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost !== null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      let inspectionCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.qaOfInspectorRate) * Number(manufactureInfo.inspectionTime)) / 60 / Number(manufactureInfo.efficiency) / Number(manufactureInfo.lotSize)
      );
      if (manufactureInfo.inspectionCost !== null) {
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
      manufactureInfo.netMaterialCost = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.netMatCost : 0;
      let yieldCost = this.shareService.isValidNumber(
        (1 - Number(manufactureInfo.yieldPer) / 100) *
          // Number(manufactureInfo.netMaterialCost) +
          sum
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

  // public calculationsForDeflashing(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): Observable<ProcessInfoDto> {
  public calculationsForDeflashing(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    manufactureInfo.recBedSize =
      manufactureInfo.platenSizeLength && manufactureInfo.platenSizeWidth ? Math.round(manufactureInfo.platenSizeLength) + ' x ' + Math.round(manufactureInfo.platenSizeWidth) : '';
    manufactureInfo.selectedBedSize =
      manufactureInfo.machineMaster?.platenLengthmm && manufactureInfo.machineMaster?.platenWidthmm
        ? manufactureInfo.machineMaster?.platenLengthmm + ' x ' + manufactureInfo.machineMaster?.platenWidthmm
        : '';

    manufactureInfo.selectedTonnage = manufactureInfo.machineMaster?.machineTonnageTons;

    const volume = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.partVolume : 0;
    //Volume of deflashing chamber(mm^3)
    if (manufactureInfo.isLoadingTimeDirty && manufactureInfo.loadingTime != null) {
      manufactureInfo.loadingTime = Number(manufactureInfo.loadingTime);
    } else {
      if (manufactureInfo?.loadingTime != null) {
        manufactureInfo.loadingTime = this.shareService.checkDirtyProperty('loadingTime', fieldColorsList)
          ? manufacturingObj?.loadingTime
          : this.shareService.isValidNumber(manufactureInfo.loadingTime);
      }
    }
    //No.of parts handled/batch
    if (manufactureInfo.isProcessTimeDirty && manufactureInfo.processTime != null) {
      manufactureInfo.processTime = Number(manufactureInfo.processTime);
    } else {
      let noOfParts = Math.floor(this.shareService.isValidNumber((manufactureInfo.loadingTime / volume) * 0.75));
      if (manufactureInfo.processTime != null) {
        noOfParts = this.shareService.checkDirtyProperty('processTime', fieldColorsList) ? manufacturingObj?.processTime : noOfParts;
      }
      manufactureInfo.processTime = noOfParts;
    }
    const processingTime: number = 600;
    const noOfParts: number = this.shareService.isValidNumber(manufactureInfo.loadingTime / volume);
    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(processingTime / noOfParts);
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
      let directSetUpCost = this.shareService.isValidNumber(
        ((Number(manufactureInfo.noOfLowSkilledLabours) * Number(manufactureInfo.lowSkilledLaborRatePerHour) * Number(manufactureInfo.setUpTime)) / 60 / Number(manufactureInfo.efficiency) +
          (Number(manufactureInfo.noOfLowSkilledLabours) * Number(manufactureInfo.skilledLaborRatePerHour) * Number(manufactureInfo.setUpTime)) / 60 / Number(manufactureInfo.efficiency)) /
          Number(manufactureInfo.lotSize)
      );

      if (manufactureInfo.directSetUpCost != null) {
        directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.setUpCost : directSetUpCost;
      }
      manufactureInfo.directSetUpCost = directSetUpCost;
    }

    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost != null) {
      manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
    } else {
      let directLaborCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.noOfLowSkilledLabours) * Number(manufactureInfo.lowSkilledLaborRatePerHour) +
          Number(manufactureInfo.noOfLowSkilledLabours) * Number(manufactureInfo.skilledLaborRatePerHour)) *
          (Number(manufactureInfo.cycleTime) / 3600 / Number(manufactureInfo.efficiency))
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
        (manufactureInfo.inspectionTime * Number(manufactureInfo.qaOfInspectorRate)) / 60 / Number(manufactureInfo.efficiency) / Number(manufactureInfo.lotSize)
      );
      if (manufactureInfo.inspectionCost != null) {
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
      let yieldCost = this.shareService.isValidNumber((1 - Number(manufactureInfo.yieldPer) / 100) * sum);
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

    //manufactureInfo = this._commonService.calculateESGCosts(manufactureInfo, fieldColorsList, manufacturingObj);
    // return new Observable((obs) => { obs.next(manufactureInfo); });
    return manufactureInfo;
  }

  public calculationsForManualDeflashing(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    // manufactureInfo.recBedSize =
    //   manufactureInfo.platenSizeLength && manufactureInfo.platenSizeWidth ? Math.round(manufactureInfo.platenSizeLength) + ' x ' + Math.round(manufactureInfo.platenSizeWidth) : '';
    // manufactureInfo.selectedBedSize =
    //   manufactureInfo.machineMaster?.platenLengthmm && manufactureInfo.machineMaster?.platenWidthmm
    //     ? manufactureInfo.machineMaster?.platenLengthmm + ' x ' + manufactureInfo.machineMaster?.platenWidthmm
    //     : '';

    // manufactureInfo.selectedTonnage = manufactureInfo.machineMaster?.machineTonnageTons;

    const materialInfo = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0] : null;

    // const noOfCavities = materialInfo?.noOfCavities || 0;
    manufactureInfo.setUpTime = manufactureInfo.setUpTime || 60;

    const partType = Number(materialInfo?.partFinish) || 0;

    let opPerHr = 0,
      ct = 0;
    if ([1, 3].includes(partType)) {
      opPerHr = 50;
      ct = 12;
    } else if ([7, 8].includes(partType)) {
      opPerHr = 0;
      ct = 0.5;
    } else {
      opPerHr = 18;
      ct = 3;
    }

    // No of Parts:
    if (manufactureInfo.isnoOfPartsDirty && manufactureInfo.noOfParts !== null) {
      manufactureInfo.noOfParts = Number(manufactureInfo.noOfParts);
    } else {
      let noOfParts = 0;
      if ([1, 3].includes(partType)) {
        noOfParts = Math.ceil((opPerHr * 1000) / materialInfo?.grossWeight);
      } else if ([7, 8].includes(partType)) {
        noOfParts = 1;
      } else {
        noOfParts = Math.ceil((opPerHr * 1000) / (materialInfo?.partVolume || 1));
      }

      if (manufactureInfo.noOfParts !== null) {
        noOfParts = this.shareService.checkDirtyProperty('noOfParts', fieldColorsList) ? manufacturingObj?.noOfParts : noOfParts;
      }
      manufactureInfo.noOfParts = noOfParts;
    }

    // Cycle Time (s):
    if (manufactureInfo.isLoadingTimeDirty && manufactureInfo.loadingTime !== null) {
      manufactureInfo.loadingTime = Number(manufactureInfo.loadingTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(ct * 60);
      if (manufactureInfo.loadingTime !== null) {
        cycleTime = this.shareService.checkDirtyProperty('loadingTime', fieldColorsList) ? manufacturingObj?.loadingTime : cycleTime;
      }
      manufactureInfo.loadingTime = cycleTime;
    }

    // cycle Time per part (s):
    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime !== null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(manufactureInfo.loadingTime / manufactureInfo.noOfParts);
      if (manufactureInfo.cycleTime !== null) {
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
      let directSetUpCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.setUpTime) / 60 / Number(manufactureInfo.efficiency) / Number(manufactureInfo.lotSize)) *
          (Number(manufactureInfo.lowSkilledLaborRatePerHour) * Number(manufactureInfo.noOfLowSkilledLabours) +
            Number(manufactureInfo.skilledLaborRatePerHour) * Number(manufactureInfo.noOfSkilledLabours || 1))
      );

      if (manufactureInfo.directSetUpCost != null) {
        directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.setUpCost : directSetUpCost;
      }
      manufactureInfo.directSetUpCost = directSetUpCost;
    }

    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost != null) {
      manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
    } else {
      let directLaborCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.noOfLowSkilledLabours) * Number(manufactureInfo.cycleTime) * Number(manufactureInfo.lowSkilledLaborRatePerHour)) / 3600 / Number(manufactureInfo.efficiency) +
          (Number(manufactureInfo.noOfSkilledLabours || 1) * Number(manufactureInfo.skilledLaborRatePerHour) * Number(manufactureInfo.cycleTime)) / 3600 / Number(manufactureInfo.efficiency)
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
        (Number(manufactureInfo.qaOfInspectorRate) * 1 * manufactureInfo.inspectionTime * manufactureInfo.samplingRate) / 100 / 60 / Number(manufactureInfo.efficiency)
      );
      if (manufactureInfo.inspectionCost != null) {
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
      let yieldCost = this.shareService.isValidNumber((1 - Number(manufactureInfo.yieldPer) / 100) * sum);
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

  public calculationsForPostCuring(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    const materialInfo = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0] : null;
    manufactureInfo.typeOfOperationId = materialInfo?.partFinish || 0;
    manufactureInfo.setUpTime = manufactureInfo.setUpTime || 30;
    const curingLookupData = this.plasticRubberConfigService.getPostCureInfo(
      manufactureInfo?.materialmasterDatas?.materialTypeName ||
        manufactureInfo?.materialmasterDatas?.materialType?.materialTypeName ||
        manufactureInfo?.materialInfoList[0]?.materialMasterData.materialTypeName ||
        manufactureInfo?.materialInfoList[0]?.materialMasterData?.materialType?.materialTypeName
    );

    // Chamber Length
    if (manufactureInfo.isplatenSizeLengthDirty && !!manufactureInfo.platenSizeLength) {
      manufactureInfo.platenSizeLength = Number(manufactureInfo.platenSizeLength);
    } else {
      let chamberLength = this.shareService.isValidNumber(manufactureInfo.machineMaster?.bedLength);
      if (manufactureInfo.platenSizeLength !== null) {
        chamberLength = this.shareService.checkDirtyProperty('platenSizeLength', fieldColorsList) ? manufacturingObj?.platenSizeLength : chamberLength;
      }
      manufactureInfo.platenSizeLength = chamberLength;
    }

    // Chamber Width
    if (manufactureInfo.isplatenSizeWidthDirty && !!manufactureInfo.platenSizeWidth) {
      manufactureInfo.platenSizeWidth = Number(manufactureInfo.platenSizeWidth);
    } else {
      let chamberWidth = this.shareService.isValidNumber(manufactureInfo.machineMaster?.bedWidth);
      if (manufactureInfo.platenSizeWidth !== null) {
        chamberWidth = this.shareService.checkDirtyProperty('platenSizeWidth', fieldColorsList) ? manufacturingObj?.platenSizeWidth : chamberWidth;
      }
      manufactureInfo.platenSizeWidth = chamberWidth;
    }

    // Chamber Height
    if (manufactureInfo.isshotSizeDirty && !!manufactureInfo.shotSize) {
      manufactureInfo.shotSize = Number(manufactureInfo.shotSize);
    } else {
      // TODO: till height update in machine table
      let chamberHeight = 0;
      if (manufactureInfo.machineMaster?.bedLength === 3550) {
        chamberHeight = 3550;
      } else if (manufactureInfo.machineMaster?.bedLength === 1200) {
        chamberHeight = 1000;
      } else if (manufactureInfo.machineMaster?.bedLength === 600) {
        chamberHeight = 900;
      }
      if (manufactureInfo.shotSize !== null) {
        chamberHeight = this.shareService.checkDirtyProperty('shotSize', fieldColorsList) ? manufacturingObj?.shotSize : chamberHeight;
      }
      manufactureInfo.shotSize = chamberHeight;
    }

    manufactureInfo.recBedSize =
      manufactureInfo.platenSizeLength && manufactureInfo.platenSizeWidth ? manufactureInfo.platenSizeLength + ' x ' + manufactureInfo.platenSizeWidth + ' x ' + manufactureInfo.shotSize : '';

    // Tray Length
    if (manufactureInfo.isMuffleLengthDirty && !!manufactureInfo.muffleLength) {
      manufactureInfo.muffleLength = Number(manufactureInfo.muffleLength);
    } else {
      let trayLength = manufactureInfo.platenSizeLength - 50;
      if (manufactureInfo.muffleLength !== null) {
        trayLength = this.shareService.checkDirtyProperty('muffleLength', fieldColorsList) ? manufacturingObj?.muffleLength : trayLength;
      }
      manufactureInfo.muffleLength = trayLength;
    }

    // Tray Width
    if (manufactureInfo.isMuffleWidthDirty && !!manufactureInfo.muffleWidth) {
      manufactureInfo.muffleWidth = Number(manufactureInfo.muffleWidth);
    } else {
      let trayWidth = manufactureInfo.platenSizeWidth - 50;
      if (manufactureInfo.muffleWidth !== null) {
        trayWidth = this.shareService.checkDirtyProperty('muffleWidth', fieldColorsList) ? manufacturingObj?.muffleWidth : trayWidth;
      }
      manufactureInfo.muffleWidth = trayWidth;
    }

    // Tray Height
    if (manufactureInfo.isformHeightDirty && !!manufactureInfo.formHeight) {
      manufactureInfo.formHeight = Number(manufactureInfo.formHeight);
    } else {
      let trayHeight = 75; // this.shareService.isValidNumber((manufactureInfo.muffleWidth * manufactureInfo.muffleLength) / 1000000);
      if (manufactureInfo.formHeight !== null) {
        trayHeight = this.shareService.checkDirtyProperty('formHeight', fieldColorsList) ? manufacturingObj?.formHeight : trayHeight;
      }
      manufactureInfo.formHeight = trayHeight;
    }

    // Part Length
    if (manufactureInfo.isallowanceAlongLengthDirty && !!manufactureInfo.allowanceAlongLength) {
      manufactureInfo.allowanceAlongLength = Number(manufactureInfo.allowanceAlongLength);
    } else {
      let partLength = this.shareService.isValidNumber(manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.dimX : 0);
      if (manufactureInfo.allowanceAlongLength !== null) {
        partLength = this.shareService.checkDirtyProperty('allowanceAlongLength', fieldColorsList) ? manufacturingObj?.allowanceAlongLength : partLength;
      }
      manufactureInfo.allowanceAlongLength = partLength;
    }

    // Part Width
    if (manufactureInfo.isallowanceAlongWidthDirty && !!manufactureInfo.allowanceAlongWidth) {
      manufactureInfo.allowanceAlongWidth = Number(manufactureInfo.allowanceAlongWidth);
    } else {
      let partWidth = this.shareService.isValidNumber(manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.dimY : 0);
      if (manufactureInfo.allowanceAlongWidth !== null) {
        partWidth = this.shareService.checkDirtyProperty('allowanceAlongWidth', fieldColorsList) ? manufacturingObj?.allowanceAlongWidth : partWidth;
      }
      manufactureInfo.allowanceAlongWidth = partWidth;
    }

    // Part Height
    if (manufactureInfo.ispartEnvelopHeightDirty && !!manufactureInfo.partEnvelopHeight) {
      manufactureInfo.partEnvelopHeight = Number(manufactureInfo.partEnvelopHeight);
    } else {
      let partHeight = this.shareService.isValidNumber(manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.dimZ : 0);
      if (manufactureInfo.partEnvelopHeight !== null) {
        partHeight = this.shareService.checkDirtyProperty('partEnvelopHeight', fieldColorsList) ? manufacturingObj?.partEnvelopHeight : partHeight;
      }
      manufactureInfo.partEnvelopHeight = partHeight;
    }

    // // Part Type
    // if (manufactureInfo.isTypeOfOperationDirty && manufactureInfo.typeOfOperationId !== null) {
    //   manufactureInfo.typeOfOperationId = Number(manufactureInfo.typeOfOperationId);
    // } else {
    //   let partType = 1;
    //   if (manufactureInfo.typeOfOperationId !== null) {
    //     partType = this.shareService.checkDirtyProperty('typeOfOperationId', fieldColorsList) ? manufacturingObj?.typeOfOperationId : partType;
    //   }
    //   manufactureInfo.typeOfOperationId = partType;
    // }

    // Gap between trays
    if (manufactureInfo.isflashAreaDirty && manufactureInfo.flashArea !== null) {
      manufactureInfo.flashArea = Number(manufactureInfo.flashArea);
    } else {
      let gapBwTrays = 150;
      if (manufactureInfo.flashArea !== null) {
        gapBwTrays = this.shareService.checkDirtyProperty('flashArea', fieldColorsList) ? manufacturingObj?.flashArea : gapBwTrays;
      }
      manufactureInfo.flashArea = gapBwTrays;
    }

    // Gap
    if (manufactureInfo.isallowanceBetweenPartsDirty && manufactureInfo.allowanceBetweenParts !== null) {
      manufactureInfo.allowanceBetweenParts = Number(manufactureInfo.allowanceBetweenParts);
    } else {
      let gap = 5;
      if (manufactureInfo.allowanceAlongLength > 150 || manufactureInfo.allowanceAlongWidth > 150) {
        gap = 10;
      }
      if (manufactureInfo.allowanceBetweenParts !== null) {
        gap = this.shareService.checkDirtyProperty('allowanceBetweenParts', fieldColorsList) ? manufacturingObj?.allowanceBetweenParts : gap;
      }
      manufactureInfo.allowanceBetweenParts = gap;
    }

    // No of Trays
    if (manufactureInfo.isspindleRpmDirty && manufactureInfo.spindleRpm !== null) {
      manufactureInfo.spindleRpm = Number(manufactureInfo.spindleRpm);
    } else {
      let noOfTrays = Math.floor(manufactureInfo.shotSize / (manufactureInfo.formHeight + manufactureInfo.flashArea));
      if (manufactureInfo.spindleRpm !== null) {
        noOfTrays = this.shareService.checkDirtyProperty('spindleRpm', fieldColorsList) ? manufacturingObj?.spindleRpm : noOfTrays;
      }
      manufactureInfo.spindleRpm = noOfTrays;
    }

    // No of Parts (Nos)
    if (manufactureInfo.isnoOfPartsDirty && manufactureInfo.noOfParts !== null) {
      manufactureInfo.noOfParts = Number(manufactureInfo.noOfParts);
    } else {
      // let noOfParts = this.shareService.isValidNumber(
      //   Number(
      //     Math.floor(
      //       (manufactureInfo.flashArea /
      //         ((manufactureInfo.allowanceAlongLength + manufactureInfo.allowanceBetweenParts) * (manufactureInfo.allowanceAlongWidth + manufactureInfo.allowanceBetweenParts))) *
      //         1000000
      //     )
      //   )
      // );
      const maxPartHeight = manufactureInfo.formHeight + manufactureInfo.allowanceBetweenParts - 75;
      let noOfParts = 0;

      if (manufactureInfo.allowanceAlongLength > 150 || manufactureInfo.allowanceAlongWidth > 150) {
        const d1 = manufactureInfo.allowanceAlongWidth + manufactureInfo.allowanceBetweenParts || 1;
        const d2 = manufactureInfo.partEnvelopHeight + 5 || 1;
        noOfParts = Math.floor(manufactureInfo.muffleLength / d1) * Math.floor(maxPartHeight / d1) * Math.floor((manufactureInfo.muffleWidth - 100) / d2) * manufactureInfo.spindleRpm;
      } else {
        noOfParts =
          Math.max(
            Math.floor(manufactureInfo.muffleLength / (manufactureInfo.allowanceAlongLength + manufactureInfo.allowanceBetweenParts)) *
              Math.floor(manufactureInfo.muffleWidth / (manufactureInfo.allowanceAlongWidth + manufactureInfo.allowanceBetweenParts)),
            Math.floor(manufactureInfo.muffleWidth / (manufactureInfo.allowanceAlongLength + manufactureInfo.allowanceBetweenParts)) *
              Math.floor(manufactureInfo.muffleLength / (manufactureInfo.allowanceAlongWidth + manufactureInfo.allowanceBetweenParts))
          ) *
          3 *
          manufactureInfo.spindleRpm;
      }
      if (manufactureInfo.noOfParts !== null) {
        noOfParts = this.shareService.checkDirtyProperty('noOfParts', fieldColorsList) ? manufacturingObj?.noOfParts : noOfParts;
      }
      manufactureInfo.noOfParts = noOfParts;
    }

    // No of stakes
    if (manufactureInfo.isNoOfStrokesDirty && manufactureInfo.noofStroke !== null) {
      manufactureInfo.noofStroke = Number(manufactureInfo.noofStroke);
    } else {
      let noOfStakes = manufactureInfo.typeOfOperationId === 1 ? 3 : 1;
      if (manufactureInfo.noofStroke !== null) {
        noOfStakes = this.shareService.checkDirtyProperty('noofStroke', fieldColorsList) ? manufacturingObj?.noofStroke : noOfStakes;
      }
      manufactureInfo.noofStroke = noOfStakes;
    }

    // No of parts can be accomodated in oven (Nos)
    if (manufactureInfo.isNoOfHolesDirty && manufactureInfo.noOfHoles !== null) {
      manufactureInfo.noOfHoles = Number(manufactureInfo.noOfHoles);
    } else {
      let noOfPartsInOven = 0;

      const d1 = manufactureInfo.allowanceAlongLength + manufactureInfo.allowanceBetweenParts || 1;
      const d2 = manufactureInfo.allowanceAlongWidth + manufactureInfo.allowanceBetweenParts || 1;

      noOfPartsInOven =
        Math.max(
          Math.floor(manufactureInfo.muffleLength / d1) * Math.floor(manufactureInfo.muffleWidth / d2),
          Math.floor(manufactureInfo.muffleWidth / d1) * Math.floor(manufactureInfo.muffleLength / d2)
        ) *
        manufactureInfo.noofStroke *
        manufactureInfo.spindleRpm;

      // this.shareService.isValidNumber(Number(manufactureInfo.noOfParts * manufactureInfo.spindleRpm));
      if (manufactureInfo.noOfHoles !== null) {
        noOfPartsInOven = this.shareService.checkDirtyProperty('noOfHoles', fieldColorsList) ? manufacturingObj?.noOfHoles : noOfPartsInOven;
      }
      manufactureInfo.noOfHoles = noOfPartsInOven;
    }

    // cycle Time (s):
    if (manufactureInfo.isDryCycleTimeDirty && manufactureInfo.dryCycleTime !== null) {
      manufactureInfo.dryCycleTime = Number(manufactureInfo.dryCycleTime);
    } else {
      let cycleTime = curingLookupData?.cycleTimeHrs * 60 * 60;
      if (manufactureInfo?.dryCycleTime !== null) {
        cycleTime = this.shareService.checkDirtyProperty('dryCycleTime', fieldColorsList) ? manufacturingObj?.dryCycleTime : cycleTime;
      }
      manufactureInfo.dryCycleTime = cycleTime;
    }

    // Cycle Time/Part(Sec):
    if (manufactureInfo.istotalCycleTimeDirty && manufactureInfo.totalCycleTime !== null) {
      manufactureInfo.totalCycleTime = Number(manufactureInfo.totalCycleTime);
    } else {
      let cycleTimePart = this.shareService.isValidNumber(Number(manufactureInfo.dryCycleTime / manufactureInfo.noOfHoles));
      if (manufactureInfo?.totalCycleTime !== null) {
        cycleTimePart = this.shareService.checkDirtyProperty('totalCycleTime', fieldColorsList) ? manufacturingObj?.totalCycleTime : cycleTimePart;
      }
      manufactureInfo.totalCycleTime = cycleTimePart;
    }

    // Total Cycle Time/Shot (Sec) :
    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime !== null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(manufactureInfo.totalCycleTime);
      if (manufactureInfo.cycleTime !== null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    if (manufactureInfo.isNoOfLowSkilledLaboursDirty && manufactureInfo.noOfLowSkilledLabours !== null) {
      manufactureInfo.noOfLowSkilledLabours = Number(manufactureInfo.noOfLowSkilledLabours);
    } else {
      let noOfLowSkilledLabours = manufactureInfo?.machineMaster?.machineMarketDtos[0]?.noOfSemiSkilledLabours || 1;
      if (manufactureInfo.noOfLowSkilledLabours !== null) {
        noOfLowSkilledLabours = this.shareService.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList) ? manufacturingObj?.noOfLowSkilledLabours : noOfLowSkilledLabours;
      }
      manufactureInfo.noOfLowSkilledLabours = noOfLowSkilledLabours;
    }

    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost !== null) {
      manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
    } else {
      let directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) * Number(manufactureInfo.cycleTime)) / 3600 / Number(manufactureInfo.efficiency));
      if (manufactureInfo.directMachineCost !== null) {
        directMachineCost = this.shareService.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : directMachineCost;
      }
      manufactureInfo.directMachineCost = directMachineCost;
    }

    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost !== null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      // let directSetUpCost = this.shareService.isValidNumber(
      //   ((Number(manufactureInfo.noOfLowSkilledLabours) * Number(manufactureInfo.lowSkilledLaborRatePerHour) * Number(manufactureInfo.setUpTime)) / 60 / Number(manufactureInfo.efficiency) +
      //     (Number(manufactureInfo.noOfLowSkilledLabours) * Number(manufactureInfo.skilledLaborRatePerHour) * Number(manufactureInfo.setUpTime)) / 60 / Number(manufactureInfo.efficiency)) /
      //     Number(manufactureInfo.lotSize)
      // );
      let directSetUpCost = this.shareService.isValidNumber(
        (manufactureInfo.setUpTime / 60 / manufactureInfo.efficiency / manufactureInfo.lotSize) *
          (manufactureInfo.lowSkilledLaborRatePerHour * manufactureInfo.noOfLowSkilledLabours + manufactureInfo.skilledLaborRatePerHour * (manufactureInfo.noOfSkilledLabours || 1))
      );

      if (manufactureInfo.directSetUpCost !== null) {
        directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.setUpCost : directSetUpCost;
      }
      manufactureInfo.directSetUpCost = directSetUpCost;
    }

    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost !== null) {
      manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
    } else {
      // let directLaborCost = this.shareService.isValidNumber(
      //   (Number(manufactureInfo.noOfLowSkilledLabours) * Number(manufactureInfo.lowSkilledLaborRatePerHour) +
      //     Number(manufactureInfo.noOfLowSkilledLabours) * Number(manufactureInfo.skilledLaborRatePerHour)) *
      //     (Number(manufactureInfo.cycleTime) / 3600 / Number(manufactureInfo.efficiency))
      // );

      let directLaborCost = this.shareService.isValidNumber(
        (manufactureInfo.noOfLowSkilledLabours * manufactureInfo.cycleTime * manufactureInfo.lowSkilledLaborRatePerHour) / 3600 / manufactureInfo.efficiency +
          ((manufactureInfo.noOfSkilledLabours || 1) * manufactureInfo.skilledLaborRatePerHour * manufactureInfo.cycleTime) / 3600 / manufactureInfo.efficiency
      );
      if (manufactureInfo.directLaborCost != null) {
        directLaborCost = this.shareService.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : directLaborCost;
      }
      manufactureInfo.directLaborCost = directLaborCost;
    }

    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost !== null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      // let inspectionCost = this.shareService.isValidNumber(
      //   (manufactureInfo.inspectionTime * Number(manufactureInfo.qaOfInspectorRate)) / 60 / Number(manufactureInfo.efficiency) / Number(manufactureInfo.lotSize)
      // );
      let inspectionCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.qaOfInspectorRate) * 1 * manufactureInfo.inspectionTime * (manufactureInfo.samplingRate / 100)) / 100 / 60 / manufactureInfo.efficiency
      );
      if (manufactureInfo.inspectionCost !== null) {
        inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : inspectionCost;
      }
      manufactureInfo.inspectionCost = inspectionCost;
    }

    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost !== null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      const sum = this.shareService.isValidNumber(
        Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
      );
      let yieldCost = this.shareService.isValidNumber((1 - Number(manufactureInfo.yieldPer) / 100) * sum);
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

  public calculationsForPreform(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    const materialInfo = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0] : null;
    const noOfCavities = materialInfo?.noOfCavities || 0;
    manufactureInfo.setUpTime = manufactureInfo.setUpTime || 60;

    // Output kg/hr:
    if (manufactureInfo.ismeltingWeightDirty && manufactureInfo.meltingWeight !== null) {
      manufactureInfo.meltingWeight = Number(manufactureInfo.meltingWeight);
    } else {
      let outputKgHr = 450 * 0.7; // TODO: 450 should come from machine selection..  Machine data missing
      if (manufactureInfo?.meltingWeight !== null) {
        outputKgHr = this.shareService.checkDirtyProperty('meltingWeight', fieldColorsList) ? manufacturingObj?.meltingWeight : outputKgHr;
      }
      manufactureInfo.meltingWeight = outputKgHr;
    }

    // Preform placement Time (s):
    if (manufactureInfo.isDryCycleTimeDirty && manufactureInfo.dryCycleTime !== null) {
      manufactureInfo.dryCycleTime = Number(manufactureInfo.dryCycleTime);
    } else {
      let prformPlacementTime = 0;
      if (materialInfo?.noOfCavities >= 1 && materialInfo?.noOfCavities <= 70) prformPlacementTime = 10;
      if (materialInfo?.noOfCavities >= 71 && materialInfo?.noOfCavities <= 999) prformPlacementTime = 20;

      if (manufactureInfo?.dryCycleTime !== null) {
        prformPlacementTime = this.shareService.checkDirtyProperty('dryCycleTime', fieldColorsList) ? manufacturingObj?.dryCycleTime : prformPlacementTime;
      }
      manufactureInfo.dryCycleTime = prformPlacementTime;
    }

    //  Cycle Time/Part (Sec) :
    if (manufactureInfo.istotalCycleTimeDirty && manufactureInfo.totalCycleTime !== null) {
      manufactureInfo.totalCycleTime = Number(manufactureInfo.totalCycleTime);
    } else {
      let cycleTimePart = this.shareService.isValidNumber(Number(manufactureInfo.dryCycleTime / noOfCavities));
      if (manufactureInfo?.totalCycleTime !== null) {
        cycleTimePart = this.shareService.checkDirtyProperty('totalCycleTime', fieldColorsList) ? manufacturingObj?.totalCycleTime : cycleTimePart;
      }
      manufactureInfo.totalCycleTime = cycleTimePart;
    }

    // Total Cycle Time/Shot (Sec) :
    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime !== null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(manufactureInfo.totalCycleTime);
      if (manufactureInfo.cycleTime !== null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    if (manufactureInfo.isNoOfLowSkilledLaboursDirty && manufactureInfo.noOfLowSkilledLabours !== null) {
      manufactureInfo.noOfLowSkilledLabours = Number(manufactureInfo.noOfLowSkilledLabours);
    } else {
      let noOfLowSkilledLabours = manufactureInfo?.machineMaster?.machineMarketDtos[0]?.noOfSemiSkilledLabours || 1;
      if (manufactureInfo.noOfLowSkilledLabours !== null) {
        noOfLowSkilledLabours = this.shareService.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList) ? manufacturingObj?.noOfLowSkilledLabours : noOfLowSkilledLabours;
      }
      manufactureInfo.noOfLowSkilledLabours = noOfLowSkilledLabours;
    }

    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost !== null) {
      manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
    } else {
      let directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) * Number(manufactureInfo.cycleTime)) / 3600 / Number(manufactureInfo.efficiency));
      if (manufactureInfo.directMachineCost !== null) {
        directMachineCost = this.shareService.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : directMachineCost;
      }
      manufactureInfo.directMachineCost = directMachineCost;
    }

    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost !== null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      let directSetUpCost = this.shareService.isValidNumber(
        (manufactureInfo.setUpTime / 60 / manufactureInfo.efficiency / manufactureInfo.lotSize) *
          (manufactureInfo.lowSkilledLaborRatePerHour * manufactureInfo.noOfLowSkilledLabours + manufactureInfo.skilledLaborRatePerHour * manufactureInfo.noOfSkilledLabours)
      );

      if (manufactureInfo.directSetUpCost !== null) {
        directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.setUpCost : directSetUpCost;
      }
      manufactureInfo.directSetUpCost = directSetUpCost;
    }

    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost !== null) {
      manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
    } else {
      let directLaborCost = this.shareService.isValidNumber(
        (manufactureInfo.noOfLowSkilledLabours * manufactureInfo.cycleTime * manufactureInfo.lowSkilledLaborRatePerHour) / 3600 / manufactureInfo.efficiency +
          (manufactureInfo.noOfSkilledLabours * manufactureInfo.skilledLaborRatePerHour * manufactureInfo.cycleTime) / 3600 / manufactureInfo.efficiency
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
        (Number(manufactureInfo.qaOfInspectorRate) * 1 * manufactureInfo.inspectionTime) / 60 / manufactureInfo.efficiency / manufactureInfo.lotSize
      );
      if (manufactureInfo.inspectionCost !== null) {
        inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : inspectionCost;
      }
      manufactureInfo.inspectionCost = inspectionCost;
    }

    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost !== null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      const sum = this.shareService.isValidNumber(
        Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
      );
      let yieldCost = this.shareService.isValidNumber((1 - Number(manufactureInfo.yieldPer) / 100) * sum);
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

  public calculationsForCompressionMaterialPreparation(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    manufactureInfo.density = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.density : 0;
    manufactureInfo.grossWeight = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.grossWeight : 0;
    // const volume = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.partVolume : 0;

    manufactureInfo.recBedSize =
      manufactureInfo.platenSizeLength && manufactureInfo.platenSizeWidth ? Math.round(manufactureInfo.platenSizeLength) + ' x ' + Math.round(manufactureInfo.platenSizeWidth) : '';
    manufactureInfo.selectedBedSize =
      manufactureInfo.machineMaster?.platenLengthmm && manufactureInfo.machineMaster?.platenWidthmm
        ? manufactureInfo.machineMaster?.platenLengthmm + ' x ' + manufactureInfo.machineMaster?.platenWidthmm
        : '';

    manufactureInfo.selectedTonnage = manufactureInfo.machineMaster?.machineTonnageTons;

    //Rubber weight processed by machine per batch(g)
    if (manufactureInfo.iscoolingTimeDirty && manufactureInfo.coolingTime != null) {
      manufactureInfo.coolingTime = Number(manufactureInfo.coolingTime);
    } else {
      manufactureInfo.coolingTime = this.shareService.checkDirtyProperty('coolingTime', fieldColorsList) ? manufacturingObj?.coolingTime : manufactureInfo.coolingTime;
    }
    //Cycle Time/batch(s)
    if (manufactureInfo.isProcessTimeDirty && manufactureInfo.processTime != null) {
      manufactureInfo.processTime = Number(manufactureInfo.processTime);
    } else {
      manufactureInfo.processTime = this.shareService.checkDirtyProperty('processTime', fieldColorsList) ? manufacturingObj?.processTime : manufactureInfo.processTime;
    }

    // const rubberWeightProcessed = this.shareService.isValidNumber((Number(manufactureInfo.grossWeight) * Number(manufactureInfo.lotSize)) / 1000);
    // const totalmachinehours = this.shareService.isValidNumber((rubberWeightProcessed * 1000) / manufactureInfo.coolingTime);

    //No. of parts processed per batch:
    if (manufactureInfo.isLoadingTimeDirty && manufactureInfo.loadingTime != null) {
      manufactureInfo.loadingTime = Number(manufactureInfo.loadingTime);
    } else {
      let noOfParts = Math.round(this.shareService.isValidNumber(manufactureInfo.coolingTime / manufactureInfo.grossWeight));
      if (manufactureInfo.loadingTime != null) {
        noOfParts = this.shareService.checkDirtyProperty('loadingTime', fieldColorsList) ? manufacturingObj?.loadingTime : noOfParts;
      }
      manufactureInfo.loadingTime = noOfParts;
    }
    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(Number(manufactureInfo.processTime) / Number(manufactureInfo.loadingTime));
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
        (manufactureInfo.inspectionTime * Number(manufactureInfo.qaOfInspectorRate)) / 60 / Number(manufactureInfo.efficiency) / Number(manufactureInfo.lotSize)
      );
      if (manufactureInfo.inspectionCost != null) {
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
      manufactureInfo.netMaterialCost = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.netMatCost : 0;
      let yieldCost = this.shareService.isValidNumber((1 - Number(manufactureInfo.yieldPer) / 100) * (Number(manufactureInfo.netMaterialCost) + sum));
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

  // public calculationsForDeburring(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): Observable<ProcessInfoDto> {
  public calculationsForDeburring(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    manufactureInfo.recBedSize =
      manufactureInfo.platenSizeLength && manufactureInfo.platenSizeWidth ? Math.round(manufactureInfo.platenSizeLength) + ' x ' + Math.round(manufactureInfo.platenSizeWidth) : '';
    manufactureInfo.selectedBedSize =
      manufactureInfo.machineMaster?.platenLengthmm && manufactureInfo.machineMaster?.platenWidthmm
        ? manufactureInfo.machineMaster?.platenLengthmm + ' x ' + manufactureInfo.machineMaster?.platenWidthmm
        : '';

    manufactureInfo.selectedTonnage = manufactureInfo.machineMaster?.machineTonnageTons;

    const netWeight = manufactureInfo?.materialInfoList?.length > 0 ? manufactureInfo?.materialInfoList[0]?.netWeight : 0;

    // Deburring Length (mm)
    if (manufactureInfo.isLoadingTimeDirty && manufactureInfo.loadingTime != null) {
      manufactureInfo.loadingTime = Number(manufactureInfo.loadingTime);
    } else {
      let totalLength = this.shareService.isValidNumber(this.shareService.extractedProcessData?.LengthOfCut + this.shareService.extractedProcessData?.LengthOfCutInternal);
      if (manufactureInfo.loadingTime != null) {
        totalLength = this.shareService.checkDirtyProperty('loadingTime', fieldColorsList) ? manufacturingObj?.loadingTime : totalLength;
      }
      manufactureInfo.loadingTime = totalLength;
    }
    //Deburring Speed m/sec
    const materialType = manufactureInfo.materialmasterDatas?.materialType?.materialTypeName;
    const list = this._deburringConfig.getDeburringLookupData();
    const speed: number = list?.find((x) => x.Material?.includes(materialType))?.Speed || 0;
    const handlingTime: number = netWeight / 1000 <= 1 ? 8 : netWeight / 1000 < 5 ? 16 : netWeight / 1000 < 10 ? 24 : netWeight / 1000 < 20 ? 32 : netWeight / 1000 > 20 ? 60 : 0;
    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(handlingTime + Number(manufactureInfo.loadingTime) / speed / 1000);
      if (manufactureInfo.cycleTime != null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost != null) {
      manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
    } else {
      let directMachineCost = this.shareService.isValidNumber(((Number(manufactureInfo.machineHourRate) / 3600) * Number(manufactureInfo.cycleTime)) / manufactureInfo.efficiency);
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
        ((Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) * (Number(manufactureInfo.cycleTime) * Number(manufactureInfo.noOfLowSkilledLabours))) / manufactureInfo.efficiency
      );
      if (manufactureInfo.directLaborCost != null) {
        directLaborCost = this.shareService.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : directLaborCost;
      }
      manufactureInfo.directLaborCost = directLaborCost;
    }

    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost !== null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      if (manufactureInfo.inspectionCost !== null) {
        manufactureInfo.inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost || 0 : 0;
      }
      if (manufactureInfo.inspectionCost === undefined || manufactureInfo.inspectionCost === null) {
        manufactureInfo.inspectionCost = 0;
      }
    }
    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost != null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      if (manufactureInfo.yieldCost != null) {
        manufactureInfo.yieldCost = this.shareService.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : 0;
      }
    }

    manufactureInfo.directProcessCost = this.shareService.isValidNumber(
      Number(manufactureInfo.directLaborCost) +
        Number(manufactureInfo.directMachineCost) +
        Number(manufactureInfo.directSetUpCost) +
        Number(manufactureInfo.inspectionCost) +
        Number(manufactureInfo.yieldCost)
    );
    // manufactureInfo = this._commonService.calculateESGCosts(manufactureInfo, fieldColorsList, manufacturingObj);
    // return new Observable((obs) => { obs.next(manufactureInfo); });
    return manufactureInfo;
  }

  // public calculationsForBlowMolding(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto, part: PartInfoDto): Observable<ProcessInfoDto> {
  public calculationsForBlowMolding(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto, part: PartInfoDto): ProcessInfoDto {
    const noOfCavities = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.noOfCavities : 0;
    const partProjectedArea = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.partProjectedArea : 0;

    manufactureInfo.recBedSize =
      manufactureInfo.platenSizeLength && manufactureInfo.platenSizeWidth ? Math.round(manufactureInfo.platenSizeLength) + ' x ' + Math.round(manufactureInfo.platenSizeWidth) : '';
    manufactureInfo.selectedBedSize =
      manufactureInfo.machineMaster?.platenLengthmm && manufactureInfo.machineMaster?.platenWidthmm
        ? manufactureInfo.machineMaster?.platenLengthmm + ' x ' + manufactureInfo.machineMaster?.platenWidthmm
        : '';

    manufactureInfo.selectedTonnage = manufactureInfo.machineMaster?.machineTonnageTons;

    // No. of parts per die
    if (manufactureInfo.isUnloadingTimeDirty && manufactureInfo.unloadingTime != null) {
      manufactureInfo.unloadingTime = Number(manufactureInfo.unloadingTime);
    } else {
      const blowMoldingLookup = this._blowMoldingConfig.getCavityNumbers(part?.eav, manufactureInfo?.partComplexity);
      const length = manufactureInfo?.materialInfoList?.length > 0 ? manufactureInfo?.materialInfoList[0].dimX : 0;
      const width = manufactureInfo?.materialInfoList?.length > 0 ? manufactureInfo?.materialInfoList[0].dimY : 0;
      let noOfCavity = 0;
      const noOfCavitiesEntity = blowMoldingLookup?.find((x) => (length >= x.minLength && length <= x.maxLength) || (width >= x.minLength && width <= x.maxLength));
      noOfCavity = noOfCavitiesEntity?.cavities;
      if (manufactureInfo.unloadingTime != null) {
        noOfCavity = this.shareService.checkDirtyProperty('unloadingTime', fieldColorsList) ? manufacturingObj?.unloadingTime : noOfCavity;
      }
      manufactureInfo.unloadingTime = noOfCavity;
    }

    //TODO:tonnage calculation
    const effectiveTonnage = 1600;
    manufactureInfo.recommendTonnage = this.shareService.isValidNumber((noOfCavities * partProjectedArea * effectiveTonnage) / 1000000);

    const thickness = this.shareService.isValidNumber(Number(manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.wallThickessMm));
    let coolingTime = 0;
    if (thickness > 10) {
      coolingTime = 450;
    } else {
      const lookup = this._blowMoldingConfig.getCoolingTime()?.filter((x) => x.thickness >= thickness);
      coolingTime = lookup[0]?.coolingTime;
    }

    const grossWeight: number = manufactureInfo?.materialInfoList?.length > 0 ? manufactureInfo?.materialInfoList[0].grossWeight : 0;
    const cycletimeBlow = this.shareService.isValidNumber(grossWeight / 106 + 32 + coolingTime);
    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(cycletimeBlow / manufactureInfo.unloadingTime);
      if (manufactureInfo.cycleTime != null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
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

    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost != null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      let inspectionCost = this.shareService.isValidNumber(
        ((Number(manufactureInfo.qaOfInspectorRate) / 60) *
          (Number(manufactureInfo.inspectionTime) * Number(manufactureInfo.noOfSemiSkilledLabours)) *
          (Number(manufactureInfo.samplingRate / 100) * Number(manufactureInfo.lotSize))) /
          Number(manufactureInfo.lotSize)
      );
      if (manufactureInfo.inspectionCost != null) {
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

    //manufactureInfo = this._commonService.calculateESGCosts(manufactureInfo, fieldColorsList, manufacturingObj);
    // return new Observable((obs) => { obs.next(manufactureInfo); });
    return manufactureInfo;
  }

  // public calculationsForPassivation(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto, part: PartInfoDto): Observable<ProcessInfoDto> {
  public calculationsForPassivation(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    if (manufactureInfo.isfinalTempDirty && manufactureInfo.finalTemp != null) {
      manufactureInfo.finalTemp = Number(manufactureInfo.finalTemp);
    } else {
      manufactureInfo.finalTemp = this.shareService.checkDirtyProperty('finalTemp', fieldColorsList) ? manufacturingObj?.finalTemp : manufactureInfo.finalTemp;
    }

    // const maskingArea = manufactureInfo?.materialInfoList?.length > 0 ? manufactureInfo?.materialInfoList[0].stockWidth : 0;
    const partVolume = manufactureInfo?.materialInfoList?.length > 0 ? manufactureInfo?.materialInfoList[0].partProjectedArea : 0;
    const netWeight = manufactureInfo?.materialInfoList?.length > 0 ? manufactureInfo?.materialInfoList[0].netWeight : 0;
    const thickness = manufactureInfo?.materialInfoList?.length > 0 ? manufactureInfo?.materialInfoList[0].dimUnfoldedZ : 0;
    const passivationTime = manufactureInfo.finalTemp > 30 ? 32 : 30;
    const bathCOntent = 21653;
    const totPassivationArea = partVolume * (1 - manufactureInfo.finalTemp / 100);
    const volumeOfPassivation = totPassivationArea * thickness;
    const totVolume = volumeOfPassivation * 1.5;
    const maxNoOfComponents = this.shareService.isValidNumber(Math.floor(bathCOntent / (totVolume / 1000)));
    const handlingTime = netWeight / 1000 < 5 ? 5 : netWeight / 1000 < 10 ? 10 : netWeight / 1000 < 20 ? 15 : netWeight / 1000 > 20 ? 20 : 0;

    if (manufactureInfo.isnoOfPartsDirty && manufactureInfo.noOfParts != null) {
      manufactureInfo.noOfParts = Number(manufactureInfo.noOfParts);
    } else {
      let passivationPartArea = manufactureInfo?.materialInfoList?.length > 0 ? manufactureInfo?.materialInfoList[0].partSurfaceArea / 100 : 0;
      if (manufactureInfo.noOfParts != null) {
        passivationPartArea = this.shareService.checkDirtyProperty('noOfParts', fieldColorsList) ? manufacturingObj?.noOfParts : passivationPartArea;
      }
      manufactureInfo.noOfParts = passivationPartArea;
    }

    if (manufactureInfo.issoakingTimeDirty && manufactureInfo.soakingTime != null) {
      manufactureInfo.soakingTime = Number(manufactureInfo.soakingTime);
    } else {
      const passivatedArea = manufactureInfo.finalTemp > 0 ? (1 - manufactureInfo.finalTemp / 100) * Number(manufactureInfo.noOfParts) : manufactureInfo.noOfParts;
      manufactureInfo.soakingTime = this.shareService.checkDirtyProperty('soakingTime', fieldColorsList) ? manufacturingObj?.soakingTime : passivatedArea;
    }

    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(handlingTime + (passivationTime * 60) / maxNoOfComponents);
      if (manufactureInfo.cycleTime != null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
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

    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost != null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
      if (manufactureInfo.inspectionCost != null) {
        manufactureInfo.inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : 0;
      }
    }
    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost != null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      if (manufactureInfo.yieldCost != null) {
        manufactureInfo.yieldCost = this.shareService.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : 0;
      }
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

  // public doCostCalculationForThermoForming(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): Observable<ProcessInfoDto> {
  public doCostCalculationForThermoForming(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    manufactureInfo.density = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.density : 0;
    manufactureInfo.noOfInsert = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.noOfInserts : 0;
    manufactureInfo.grossWeight = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.grossWeight : 0;
    manufactureInfo.noOfCavities = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.noOfCavities : 0;
    manufactureInfo.netMaterialCost = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.netMatCost : 0;
    manufactureInfo.netPartWeight = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.netWeight : 0;
    manufactureInfo.rawmaterialCost = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.netMatCost : 0;
    manufactureInfo.partProjArea = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.partProjectedArea : 0;
    const avgWallThickness = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.wallAverageThickness : 0;

    const materialType = manufactureInfo?.materialmasterDatas?.materialTypeName;
    const thermoForminglookUpData = manufactureInfo.thermoFormingList?.find((x) => x.rawMaterial === materialType);
    const thermoFormingMaterialTempLookup = this.plasticRubberConfigService.getMaterialTemps(materialType || '');
    //manufactureInfo?.materialInfoList && manufactureInfo?.materialInfoList?.length > 0 ? manufactureInfo?.materialInfoList[0].materialMarketData?.materialMaster?.materialTypeName : '';
    const clampFactor = thermoForminglookUpData?.clampFactor || 0;
    manufactureInfo.insertPlacement = this.shareService.isValidNumber(2 * manufactureInfo.noOfInsert);
    const injecRate = this.shareService.isValidNumber((Number(manufactureInfo.machineMaster?.injectionRate) * Number(manufactureInfo.density)) / 1000);
    const shotweight = this.shareService.isValidNumber(manufactureInfo.grossWeight * manufactureInfo.noOfCavities);
    const materialInjectionFillTime = this.shareService.isValidNumber(shotweight / Number(injecRate));
    manufactureInfo.materialInjectionFillTime = materialInjectionFillTime;

    manufactureInfo.recBedSize =
      manufactureInfo.platenSizeLength && manufactureInfo.platenSizeWidth ? Math.round(manufactureInfo.platenSizeLength) + ' x ' + Math.round(manufactureInfo.platenSizeWidth) : '';
    manufactureInfo.selectedBedSize =
      manufactureInfo.machineMaster?.platenLengthmm && manufactureInfo.machineMaster?.platenWidthmm
        ? manufactureInfo.machineMaster?.platenLengthmm + ' x ' + manufactureInfo.machineMaster?.platenWidthmm
        : '';

    manufactureInfo.selectedTonnage = manufactureInfo.machineMaster?.machineTonnageTons;

    if (manufactureInfo.isInsertsPlacementDirty && manufactureInfo.insertsPlacement !== null) {
      manufactureInfo.insertsPlacement = Number(manufactureInfo.insertsPlacement);
    } else {
      let insertsPlacement = 10;
      if (manufactureInfo.partProjArea <= 250000) {
        insertsPlacement = 5;
      } else if (manufactureInfo.partProjArea > 250000 && manufactureInfo.partProjArea <= 1000000) {
        insertsPlacement = 7;
      }

      if (manufactureInfo.insertsPlacement !== null) {
        insertsPlacement = this.shareService.checkDirtyProperty('insertsPlacement', fieldColorsList) ? manufacturingObj?.insertsPlacement : insertsPlacement;
      }
      manufactureInfo.insertsPlacement = insertsPlacement;
    }
    if (manufactureInfo.isPartEjectionDirty && manufactureInfo.partEjection !== null) {
      manufactureInfo.partEjection = Number(manufactureInfo.partEjection);
    } else {
      let partEjection = 10;
      if (manufactureInfo.partProjArea <= 250000) {
        partEjection = 4;
      } else if (manufactureInfo.partProjArea > 250000 && manufactureInfo.partProjArea <= 1000000) {
        partEjection = 7;
      }

      if (manufactureInfo.partEjection !== null) {
        partEjection = this.shareService.checkDirtyProperty('partEjection', fieldColorsList) ? manufacturingObj?.partEjection : this.shareService.isValidNumber(partEjection);
      }
      manufactureInfo.partEjection = partEjection;
    }

    const desiredFormingTemp = thermoForminglookUpData?.desiredFormingTempF || 0;
    // const startingFormingTemp = thermoForminglookUpData?.startingTempF || 0;
    // const tempDifference = desiredFormingTemp - startingFormingTemp;
    // const heatRequired = ((avgWallThickness / 25.4) * (thermoForminglookUpData?.thermalConductivity ?? 0) * tempDifference) / (thermoForminglookUpData?.specificHeatLb ?? 1);

    // Heating Time
    if (manufactureInfo.isSideCoreMechanismsDirty && manufactureInfo.sideCoreMechanisms !== null) {
      manufactureInfo.sideCoreMechanisms = Number(manufactureInfo.sideCoreMechanisms);
    } else {
      let heatingTime = this.shareService.isValidNumber(
        (thermoForminglookUpData.densityKg * (((thermoForminglookUpData.specificHeatLb * 4186.8) / 1000) * 1000) * (avgWallThickness / 1000) * (desiredFormingTemp - 25)) / 10000
      );
      if (manufactureInfo.sideCoreMechanisms !== null) {
        heatingTime = this.shareService.checkDirtyProperty('sideCoreMechanisms', fieldColorsList) ? manufacturingObj?.sideCoreMechanisms : heatingTime;
      }
      manufactureInfo.sideCoreMechanisms = heatingTime;
    }

    // Forming Time
    if (manufactureInfo.isOthersDirty && manufactureInfo.others !== null) {
      manufactureInfo.others = Number(manufactureInfo.others);
    } else {
      const thickness = manufactureInfo?.materialInfoList && manufactureInfo?.materialInfoList?.length > 0 ? manufactureInfo?.materialInfoList[0].sheetThickness : 0;
      let formingTime = manufactureInfo?.formingTimeList?.find((x) => x.rawMaterial === materialType && x.thickness === thickness)?.formingTime;
      if (manufactureInfo.others !== null) {
        formingTime = this.shareService.checkDirtyProperty('others', fieldColorsList) ? manufacturingObj?.others : this.shareService.isValidNumber(formingTime);
      }
      manufactureInfo.others = formingTime;
    }

    if (manufactureInfo.iscoolingTimeDirty && manufactureInfo.coolingTime !== null) {
      manufactureInfo.coolingTime = Number(manufactureInfo.coolingTime);
    } else {
      // const coolingTime1 =
      //   (thermoForminglookUpData.specificHeatKg / 1000) * thermoForminglookUpData.densityKg * (thermoForminglookUpData.desiredFormingTemKelvin - thermoForminglookUpData.startingTempKelvin);
      // const coolingTime2 =
      //   thermoForminglookUpData.heatTransferCoefficient * (manufactureInfo.partProjArea / 1_000_000) * (thermoForminglookUpData.desiredFormingTemKelvin - thermoForminglookUpData.ambientTempF);

      // let coolingTime = Math.floor(coolingTime1 / coolingTime2);

      let coolingTime = this.shareService.isValidNumber(
        (((Math.pow(avgWallThickness, 2) / thermoForminglookUpData.thermalConductivity) * Math.pow(3.14, 2) * 8) / Math.pow(3.14, 2)) *
          (Math.log(thermoForminglookUpData.desiredFormingTempF - thermoFormingMaterialTempLookup.moldTemp) / (thermoFormingMaterialTempLookup.ejectionTemp - thermoFormingMaterialTempLookup.moldTemp))
      );

      if (manufactureInfo.coolingTime !== null) {
        coolingTime = this.shareService.checkDirtyProperty('coolingTime', fieldColorsList) ? manufacturingObj?.coolingTime : coolingTime;
      }
      manufactureInfo.coolingTime = coolingTime;
    }

    const packAndHoldTime =
      manufactureInfo?.partComplexity == PartComplexity.Low ? 1 : manufactureInfo?.partComplexity == PartComplexity.Medium ? 2 : manufactureInfo?.partComplexity == PartComplexity.High ? 3 : 5;
    manufactureInfo.packAndHoldTime = packAndHoldTime;

    // mold open time
    if (manufactureInfo.isinjectionTimeDirty && manufactureInfo.injectionTime !== null) {
      manufactureInfo.injectionTime = Number(manufactureInfo.injectionTime);
    } else {
      let moldOpenTime = 8;
      if (manufactureInfo.partProjArea <= 250000) {
        moldOpenTime = 3;
      } else if (manufactureInfo.partProjArea > 250000 && manufactureInfo.partProjArea <= 1000000) {
        moldOpenTime = 5;
      }
      if (manufactureInfo.injectionTime !== null) {
        moldOpenTime = this.shareService.checkDirtyProperty('injectionTime', fieldColorsList) ? manufacturingObj?.injectionTime : this.shareService.isValidNumber(moldOpenTime);
      }
      manufactureInfo.injectionTime = moldOpenTime;
    }

    // Mold close time
    if (manufactureInfo.isDryCycleTimeDirty && manufactureInfo.dryCycleTime !== null) {
      manufactureInfo.dryCycleTime = Number(manufactureInfo.dryCycleTime);
    } else {
      let moldCloseTime = 8;
      if (manufactureInfo.partProjArea <= 250000) {
        moldCloseTime = 3;
      } else if (manufactureInfo.partProjArea > 250000 && manufactureInfo.partProjArea <= 1000000) {
        moldCloseTime = 5;
      }
      if (manufactureInfo.dryCycleTime !== null) {
        moldCloseTime = this.shareService.checkDirtyProperty('dryCycleTime', fieldColorsList) ? manufacturingObj?.dryCycleTime : moldCloseTime;
      }
      manufactureInfo.dryCycleTime = moldCloseTime;
    }

    if (manufactureInfo.isTotalTimeDirty && manufactureInfo.totalTime !== null) {
      manufactureInfo.totalTime = Number(manufactureInfo.totalTime);
    } else {
      let totalTime = this.shareService.isValidNumber(
        Number(manufactureInfo.insertsPlacement) +
          Number(manufactureInfo.sideCoreMechanisms) +
          Number(manufactureInfo.injectionTime) +
          Number(manufactureInfo.partEjection) +
          Number(manufactureInfo.others) +
          Number(manufactureInfo.coolingTime) +
          Number(manufactureInfo.dryCycleTime)
      );
      if (manufactureInfo.totalTime !== null) {
        totalTime = this.shareService.checkDirtyProperty('totalTime', fieldColorsList) ? manufacturingObj?.totalTime : totalTime;
      }
      manufactureInfo.totalTime = totalTime;
    }

    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime !== null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(manufactureInfo.totalTime / manufactureInfo.noOfCavities);
      if (manufactureInfo.cycleTime !== null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    // # of Direct Labour
    if (manufactureInfo.isNoOfLowSkilledLaboursDirty && manufactureInfo.noOfLowSkilledLabours !== null) {
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
      if (manufactureInfo.noOfLowSkilledLabours !== null) {
        noOfLowSkilledLabours = this.shareService.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList) ? manufacturingObj?.noOfLowSkilledLabours : noOfLowSkilledLabours;
      }
      manufactureInfo.noOfLowSkilledLabours = noOfLowSkilledLabours;
    }

    //Setup time
    if (manufactureInfo.issetUpTimeDirty && !!manufactureInfo.setUpTime) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      let setUpTime = 60;
      if (manufactureInfo.setUpTime !== null) {
        setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : setUpTime;
      }
      manufactureInfo.setUpTime = setUpTime;
    }

    // let noOfCyclesPerHour = this.shareService.isValidNumber((3600 / manufactureInfo.cycleTime) * manufactureInfo.efficiency);
    // noOfCyclesPerHour = Math.round(noOfCyclesPerHour);
    // const noOfPartsPerHour = this.shareService.isValidNumber(noOfCyclesPerHour * manufactureInfo.noOfCavities);
    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost !== null) {
      manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
    } else {
      let directMachineCost = this.shareService.isValidNumber(
        ((Number(manufactureInfo.cycleTime) / 3600) * Number(manufactureInfo.machineHourRate)) / Number(manufactureInfo.efficiency) / Number(manufactureInfo.noOfCavities)
      );
      if (manufactureInfo.directMachineCost !== null) {
        directMachineCost = this.shareService.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : directMachineCost;
      }
      manufactureInfo.directMachineCost = directMachineCost;
    }

    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost !== null) {
      manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
    } else {
      // let directLaborCost = this.shareService.isValidNumber(
      //   (Number(manufactureInfo.cycleTime / 3600) * Number(manufactureInfo.lowSkilledLaborRatePerHour)) / Number(manufactureInfo.efficiency) / Number(manufactureInfo.noOfCavities)
      // );
      let directLaborCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.noOfLowSkilledLabours) * Number(manufactureInfo.lowSkilledLaborRatePerHour) * Number(manufactureInfo.cycleTime)) / 3600 / Number(manufactureInfo.efficiency) +
          (Number(manufactureInfo.noOfSkilledLabours) * Number(manufactureInfo.skilledLaborRatePerHour) * Number(manufactureInfo.cycleTime)) / 3600 / Number(manufactureInfo.efficiency)
      );
      if (manufactureInfo.directLaborCost !== null) {
        directLaborCost = this.shareService.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : directLaborCost;
      }
      manufactureInfo.directLaborCost = directLaborCost;
    }

    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost !== null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      // let inspectionCost = this.shareService.isValidNumber((Number(manufactureInfo.qaOfInspectorRate) / (60 / Number(manufactureInfo.inspectionTime))) * Number(manufactureInfo.samplingRate / 100));
      let inspectionCost = this.shareService.isValidNumber(
        ((Number(manufactureInfo.inspectionTime) / 60) * 1 * Number(manufactureInfo.qaOfInspectorRate)) / Number(manufactureInfo.efficiency) / Number(manufactureInfo.lotSize)
      );
      if (manufactureInfo.inspectionCost !== null) {
        inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : inspectionCost;
      }
      manufactureInfo.inspectionCost = inspectionCost;
    }

    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost !== null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      // let directSetUpCost = this.shareService.isValidNumber(
      //   ((Number(manufactureInfo.skilledLaborRatePerHour) + Number(manufactureInfo.machineHourRate)) * (Number(manufactureInfo.setUpTime) / 60)) / manufactureInfo.lotSize
      // );

      let directSetUpCost =
        (((Number(manufactureInfo.noOfLowSkilledLabours) * Number(manufactureInfo.setUpTime)) / 60) * Number(manufactureInfo.lowSkilledLaborRatePerHour)) /
          Number(manufactureInfo.efficiency) /
          Number(manufactureInfo.lotSize) +
        (((Number(manufactureInfo.noOfSkilledLabours) * Number(manufactureInfo.skilledLaborRatePerHour)) / 60) * Number(manufactureInfo.setUpTime)) /
          Number(manufactureInfo.efficiency) /
          Number(manufactureInfo.lotSize);

      if (manufactureInfo.directSetUpCost !== null) {
        directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.setUpCost : directSetUpCost;
      }
      manufactureInfo.directSetUpCost = directSetUpCost;
    }
    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost !== null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      const sum = this.shareService.isValidNumber(
        Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
      );
      let yieldCost = this.shareService.isValidNumber((1 - Number(manufactureInfo.yieldPer) / 100) * sum);
      if (manufactureInfo.yieldCost !== null) {
        yieldCost = this.shareService.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : yieldCost;
      }
      manufactureInfo.yieldCost = yieldCost;
    }

    const processCost = this.shareService.isValidNumber(
      Number(manufactureInfo.directLaborCost) +
        Number(manufactureInfo.directMachineCost) +
        Number(manufactureInfo.directSetUpCost) +
        Number(manufactureInfo.inspectionCost) +
        Number(manufactureInfo.yieldCost)
    );

    manufactureInfo.directTooling = this.shareService.isValidNumber(
      (Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost)) * 0.01
    );
    manufactureInfo.directProcessCost = processCost;
    manufactureInfo.conversionCost = processCost;
    manufactureInfo.partCost = manufactureInfo.rawmaterialCost + manufactureInfo.conversionCost;

    const recommendTonnage = this.shareService.isValidNumber((Number(manufactureInfo?.partProjArea) * Number(clampFactor) * (1 + 0.15)) / 1000);
    manufactureInfo.recommendTonnage = recommendTonnage;

    //manufactureInfo = this.calculateESGCosts(manufactureInfo, fieldColorsList, manufacturingObj);
    // return new Observable((obs) => { obs.next(manufactureInfo); });
    return manufactureInfo;
  }

  public doCostCalculationForVacuumForming(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    manufactureInfo.density = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.density : 0;
    manufactureInfo.noOfInsert = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.noOfInserts : 0;
    manufactureInfo.grossWeight = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.grossWeight : 0;
    manufactureInfo.noOfCavities = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.noOfCavities : 0;
    manufactureInfo.netMaterialCost = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.netMatCost : 0;
    manufactureInfo.netPartWeight = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.netWeight : 0;
    manufactureInfo.rawmaterialCost = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.netMatCost : 0;
    manufactureInfo.partProjArea = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.partProjectedArea : 0;
    const avgWallThickness = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.wallAverageThickness : 0;

    const materialType = manufactureInfo?.materialmasterDatas?.materialTypeName;
    const thermoForminglookUpData = manufactureInfo.thermoFormingList?.find((x) => x.rawMaterial === materialType);
    const clampFactor = thermoForminglookUpData?.clampFactor || 0;
    manufactureInfo.insertPlacement = this.shareService.isValidNumber(2 * manufactureInfo.noOfInsert);
    const injecRate = this.shareService.isValidNumber((Number(manufactureInfo.machineMaster?.injectionRate) * Number(manufactureInfo.density)) / 1000);
    const shotweight = this.shareService.isValidNumber(manufactureInfo.grossWeight * manufactureInfo.noOfCavities);
    const materialInjectionFillTime = this.shareService.isValidNumber(shotweight / Number(injecRate));
    manufactureInfo.materialInjectionFillTime = materialInjectionFillTime;

    manufactureInfo.recBedSize =
      manufactureInfo.platenSizeLength && manufactureInfo.platenSizeWidth ? Math.round(manufactureInfo.platenSizeLength) + ' x ' + Math.round(manufactureInfo.platenSizeWidth) : '';
    manufactureInfo.selectedBedSize =
      manufactureInfo.machineMaster?.platenLengthmm && manufactureInfo.machineMaster?.platenWidthmm
        ? manufactureInfo.machineMaster?.platenLengthmm + ' x ' + manufactureInfo.machineMaster?.platenWidthmm
        : '';

    manufactureInfo.selectedTonnage = manufactureInfo.machineMaster?.machineTonnageTons;

    if (manufactureInfo.isInsertsPlacementDirty && manufactureInfo.insertsPlacement !== null) {
      manufactureInfo.insertsPlacement = Number(manufactureInfo.insertsPlacement);
    } else {
      let insertsPlacement = 10;
      if (manufactureInfo.partProjArea <= 250000) {
        insertsPlacement = 5;
      } else if (manufactureInfo.partProjArea > 250000 && manufactureInfo.partProjArea <= 1000000) {
        insertsPlacement = 7;
      }

      if (manufactureInfo.insertsPlacement !== null) {
        insertsPlacement = this.shareService.checkDirtyProperty('insertsPlacement', fieldColorsList) ? manufacturingObj?.insertsPlacement : insertsPlacement;
      }
      manufactureInfo.insertsPlacement = insertsPlacement;
    }
    if (manufactureInfo.isPartEjectionDirty && manufactureInfo.partEjection !== null) {
      manufactureInfo.partEjection = Number(manufactureInfo.partEjection);
    } else {
      let partEjection = 10;
      if (manufactureInfo.partProjArea <= 250000) {
        partEjection = 4;
      } else if (manufactureInfo.partProjArea > 250000 && manufactureInfo.partProjArea <= 1000000) {
        partEjection = 7;
      }

      if (manufactureInfo.partEjection !== null) {
        partEjection = this.shareService.checkDirtyProperty('partEjection', fieldColorsList) ? manufacturingObj?.partEjection : this.shareService.isValidNumber(partEjection);
      }
      manufactureInfo.partEjection = partEjection;
    }

    // Heating Time
    if (manufactureInfo.isSideCoreMechanismsDirty && manufactureInfo.sideCoreMechanisms !== null) {
      manufactureInfo.sideCoreMechanisms = Number(manufactureInfo.sideCoreMechanisms);
    } else {
      let heatingTime = this.plasticRubberConfigService.getHeatTime(manufactureInfo?.materialmasterDatas?.materialTypeId, manufactureInfo.materialInfoList[0].wallAverageThickness);

      if (manufactureInfo.sideCoreMechanisms !== null) {
        heatingTime = this.shareService.checkDirtyProperty('sideCoreMechanisms', fieldColorsList) ? manufacturingObj?.sideCoreMechanisms : heatingTime;
      }
      manufactureInfo.sideCoreMechanisms = heatingTime;
    }

    // Forming Time
    if (manufactureInfo.isOthersDirty && manufactureInfo.others !== null) {
      manufactureInfo.others = Number(manufactureInfo.others);
    } else {
      let formingTime = avgWallThickness / Math.sqrt(this.plasticRubberConfigService.getVacuumPressure(materialType) / (manufactureInfo.density * 1000));
      if (manufactureInfo.others !== null) {
        formingTime = this.shareService.checkDirtyProperty('others', fieldColorsList) ? manufacturingObj?.others : this.shareService.isValidNumber(formingTime);
      }
      manufactureInfo.others = formingTime;
    }

    const vacuumLookup = this.plasticRubberConfigService.getVacuumMaterialData(materialType);
    // cooling Time
    if (manufactureInfo.iscoolingTimeDirty && manufactureInfo.coolingTime !== null) {
      manufactureInfo.coolingTime = Number(manufactureInfo.coolingTime);
    } else {
      let LN = Math.log(vacuumLookup.mouldTemperature - vacuumLookup.initialTemperature) / (vacuumLookup.formingTemperature - vacuumLookup.mouldTemperature);
      let coolingTime = this.shareService.isValidNumber(((manufactureInfo.density * vacuumLookup.specificHeat * Math.pow(avgWallThickness, 2)) / Math.pow(3.14, 2)) * LN);

      if (manufactureInfo.coolingTime !== null) {
        coolingTime = this.shareService.checkDirtyProperty('coolingTime', fieldColorsList) ? manufacturingObj?.coolingTime : coolingTime;
      }
      manufactureInfo.coolingTime = coolingTime;
    }

    // mold open time
    if (manufactureInfo.isinjectionTimeDirty && manufactureInfo.injectionTime !== null) {
      manufactureInfo.injectionTime = Number(manufactureInfo.injectionTime);
    } else {
      let moldOpenTime = 8;
      if (manufactureInfo.partProjArea <= 250000) {
        moldOpenTime = 3;
      } else if (manufactureInfo.partProjArea > 250000 && manufactureInfo.partProjArea <= 1000000) {
        moldOpenTime = 5;
      }
      if (manufactureInfo.injectionTime !== null) {
        moldOpenTime = this.shareService.checkDirtyProperty('injectionTime', fieldColorsList) ? manufacturingObj?.injectionTime : this.shareService.isValidNumber(moldOpenTime);
      }
      manufactureInfo.injectionTime = moldOpenTime;
    }

    // noOfParts
    if (manufactureInfo.isnoOfPartsDirty && manufactureInfo.noOfParts !== null) {
      manufactureInfo.noOfParts = Number(manufactureInfo.noOfParts);
    } else {
      let noOfParts = manufactureInfo.noOfCavities;
      if (manufactureInfo.noOfParts !== null) {
        noOfParts = this.shareService.checkDirtyProperty('noOfParts', fieldColorsList) ? manufacturingObj?.noOfParts : noOfParts;
      }
      manufactureInfo.noOfParts = noOfParts;
    }

    // Mold close time
    if (manufactureInfo.isDryCycleTimeDirty && manufactureInfo.dryCycleTime !== null) {
      manufactureInfo.dryCycleTime = Number(manufactureInfo.dryCycleTime);
    } else {
      let moldCloseTime = 8;
      if (manufactureInfo.partProjArea <= 250000) {
        moldCloseTime = 3;
      } else if (manufactureInfo.partProjArea > 250000 && manufactureInfo.partProjArea <= 1000000) {
        moldCloseTime = 5;
      }
      if (manufactureInfo.dryCycleTime !== null) {
        moldCloseTime = this.shareService.checkDirtyProperty('dryCycleTime', fieldColorsList) ? manufacturingObj?.dryCycleTime : moldCloseTime;
      }
      manufactureInfo.dryCycleTime = moldCloseTime;
    }

    if (manufactureInfo.isTotalTimeDirty && manufactureInfo.totalTime !== null) {
      manufactureInfo.totalTime = Number(manufactureInfo.totalTime);
    } else {
      let totalTime = this.shareService.isValidNumber(
        Number(manufactureInfo.insertsPlacement) +
          Number(manufactureInfo.sideCoreMechanisms) +
          Number(manufactureInfo.injectionTime) +
          Number(manufactureInfo.partEjection) +
          Number(manufactureInfo.others) +
          Number(manufactureInfo.coolingTime) +
          Number(manufactureInfo.dryCycleTime)
      );
      if (manufactureInfo.totalTime !== null) {
        totalTime = this.shareService.checkDirtyProperty('totalTime', fieldColorsList) ? manufacturingObj?.totalTime : totalTime;
      }
      manufactureInfo.totalTime = totalTime;
    }

    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime !== null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(manufactureInfo.totalTime / manufactureInfo.noOfParts);
      if (manufactureInfo.cycleTime !== null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    // # of Direct Labour
    if (manufactureInfo.isNoOfLowSkilledLaboursDirty && manufactureInfo.noOfLowSkilledLabours !== null) {
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
      if (manufactureInfo.noOfLowSkilledLabours !== null) {
        noOfLowSkilledLabours = this.shareService.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList) ? manufacturingObj?.noOfLowSkilledLabours : noOfLowSkilledLabours;
      }
      manufactureInfo.noOfLowSkilledLabours = noOfLowSkilledLabours;
    }

    //Setup time
    if (manufactureInfo.issetUpTimeDirty && !!manufactureInfo.setUpTime) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      let setUpTime = 90;
      if (manufactureInfo.setUpTime != null) {
        setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : setUpTime;
      }
      manufactureInfo.setUpTime = setUpTime;
    }

    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost !== null) {
      manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
    } else {
      let directMachineCost = this.shareService.isValidNumber(
        ((Number(manufactureInfo.cycleTime) / 3600) * Number(manufactureInfo.machineHourRate)) / Number(manufactureInfo.efficiency) / Number(manufactureInfo.noOfCavities)
      );
      if (manufactureInfo.directMachineCost !== null) {
        directMachineCost = this.shareService.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : directMachineCost;
      }
      manufactureInfo.directMachineCost = directMachineCost;
    }

    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost !== null) {
      manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
    } else {
      let directLaborCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.noOfLowSkilledLabours) * Number(manufactureInfo.lowSkilledLaborRatePerHour) * Number(manufactureInfo.cycleTime)) / 3600 / Number(manufactureInfo.efficiency) +
          (Number(manufactureInfo.noOfSkilledLabours) * Number(manufactureInfo.skilledLaborRatePerHour) * Number(manufactureInfo.cycleTime)) / 3600 / Number(manufactureInfo.efficiency)
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
        ((Number(manufactureInfo.inspectionTime) / 60) * 1 * Number(manufactureInfo.qaOfInspectorRate)) / Number(manufactureInfo.efficiency) / Number(manufactureInfo.lotSize)
      );
      if (manufactureInfo.inspectionCost !== null) {
        inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : inspectionCost;
      }
      manufactureInfo.inspectionCost = inspectionCost;
    }
    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost !== null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      // let directSetUpCost = this.shareService.isValidNumber(
      //   ((Number(manufactureInfo.skilledLaborRatePerHour) + Number(manufactureInfo.machineHourRate)) * (Number(manufactureInfo.setUpTime) / 60)) / manufactureInfo.lotSize
      // );

      let directSetUpCost =
        (((Number(manufactureInfo.noOfLowSkilledLabours) * Number(manufactureInfo.setUpTime)) / 60) * Number(manufactureInfo.lowSkilledLaborRatePerHour)) /
          Number(manufactureInfo.efficiency) /
          Number(manufactureInfo.lotSize) +
        (((Number(manufactureInfo.noOfSkilledLabours) * Number(manufactureInfo.skilledLaborRatePerHour)) / 60) * Number(manufactureInfo.setUpTime)) /
          Number(manufactureInfo.efficiency) /
          Number(manufactureInfo.lotSize);

      if (manufactureInfo.directSetUpCost !== null) {
        directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.setUpCost : directSetUpCost;
      }
      manufactureInfo.directSetUpCost = directSetUpCost;
    }
    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost !== null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      const sum = this.shareService.isValidNumber(
        Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
      );
      let yieldCost = this.shareService.isValidNumber((1 - Number(manufactureInfo.yieldPer) / 100) * sum);
      if (manufactureInfo.yieldCost !== null) {
        yieldCost = this.shareService.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : yieldCost;
      }
      manufactureInfo.yieldCost = yieldCost;
    }

    const processCost = this.shareService.isValidNumber(
      Number(manufactureInfo.directLaborCost) +
        Number(manufactureInfo.directMachineCost) +
        Number(manufactureInfo.directSetUpCost) +
        Number(manufactureInfo.inspectionCost) +
        Number(manufactureInfo.yieldCost)
    );

    manufactureInfo.directTooling = this.shareService.isValidNumber(
      (Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost)) * 0.01
    );
    manufactureInfo.directProcessCost = processCost;
    manufactureInfo.conversionCost = processCost;
    manufactureInfo.partCost = manufactureInfo.rawmaterialCost + manufactureInfo.conversionCost;

    const recommendTonnage = this.shareService.isValidNumber((Number(manufactureInfo?.partProjArea) * Number(clampFactor) * (1 + 0.15)) / 1000);
    manufactureInfo.recommendTonnage = recommendTonnage;

    //manufactureInfo = this.calculateESGCosts(manufactureInfo, fieldColorsList, manufacturingObj);
    // return new Observable((obs) => { obs.next(manufactureInfo); });
    return manufactureInfo;
  }

  public calculationsForTransferMolding(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    manufactureInfo.density = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.density : 0;
    manufactureInfo.grossWeight = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.grossWeight : 0;
    //const noOfCavities = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.noOfCavities : 0;
    // const partProjectedArea = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.partProjectedArea : 0;
    // const rubberFinish = Number(manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.partFinish : 0);

    const materialInfo = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0] : null;
    // const cavityPressure = materialInfo?.materialMasterData?.clampingPressure || 0;
    // manufactureInfo.cavityPressure = cavityPressure;

    manufactureInfo.selectedTonnage = manufactureInfo?.machineMaster?.machineTonnageTons || 0;
    const injectionVolume = manufactureInfo?.machineMaster?.injectionRate || 0;
    manufactureInfo.shotSize = injectionVolume * materialInfo?.density || 0;
    manufactureInfo.requiredCurrent = this.shareService.isValidNumber(materialInfo?.grossWeight * materialInfo?.noOfCavities);

    manufactureInfo.recBedSize =
      manufactureInfo.platenSizeLength && manufactureInfo.platenSizeWidth ? Math.round(manufactureInfo.platenSizeLength) + ' x ' + Math.round(manufactureInfo.platenSizeWidth) : '';
    manufactureInfo.selectedBedSize =
      manufactureInfo.machineMaster?.platenLengthmm && manufactureInfo.machineMaster?.platenWidthmm
        ? manufactureInfo.machineMaster?.platenLengthmm + ' x ' + manufactureInfo.machineMaster?.platenWidthmm
        : '';

    // const recommendTonnage = Math.ceil(
    //   ((materialInfo?.runnerProjectedArea + (materialInfo?.partProjectedArea || materialInfo?.projectedArea)) * materialInfo?.noOfCavities * cavityPressure * 1.15) / 1000
    // );
    // manufactureInfo.recommendTonnage = this.shareService.isValidNumber(recommendTonnage);
    manufactureInfo.selectedTonnage = manufactureInfo.machineMaster?.machineTonnageTons;

    // Insert Placement Time
    if (manufactureInfo.isDryCycleTimeDirty && manufactureInfo.dryCycleTime !== null) {
      manufactureInfo.dryCycleTime = Number(manufactureInfo.dryCycleTime);
    } else {
      let insertsPlacement = 0;
      if (materialInfo?.noOfInserts && materialInfo.noOfInserts <= 10) {
        insertsPlacement = 5 * materialInfo.noOfInserts;
      } else if (materialInfo?.noOfInserts && materialInfo.noOfInserts > 10) {
        insertsPlacement = 60;
      }

      if (manufactureInfo.dryCycleTime !== null) {
        insertsPlacement = this.shareService.checkDirtyProperty('dryCycleTime', fieldColorsList) ? manufacturingObj?.dryCycleTime : insertsPlacement;
      }
      manufactureInfo.dryCycleTime = insertsPlacement;
    }

    // const materialType = manufactureInfo?.materialmasterDatas?.materialType?.materialTypeName;
    const materialType = materialInfo?.materialMarketData?.materialMaster?.materialTypeName || materialInfo?.materialMasterData?.materialTypeName || '';
    // Curing Time
    if (manufactureInfo.isdieOpeningTimeDirty && manufactureInfo.dieOpeningTime != null) {
      manufactureInfo.dieOpeningTime = Number(manufactureInfo.dieOpeningTime);
    } else {
      const curingInfo = this.plasticRubberConfigService.getRubberMoldingCuringInfo(materialType, materialInfo?.wallAverageThickness || 0);

      // Weight factor
      let weightFactor: number;
      if (manufactureInfo.grossWeight <= 10) {
        weightFactor = 0.95;
      } else if (manufactureInfo.grossWeight > 10 && manufactureInfo.grossWeight <= 20) {
        weightFactor = 1.0;
      } else {
        weightFactor = 1.1;
      }

      const cureSystemFactor = 0.95;

      let curingTime = 0;
      if (curingInfo) {
        // const baseTimeSec = (curingInfo.baseCuringTimeMin || 0) * 60; // convert minutes to seconds
        curingTime = (curingInfo.cri || 1) * curingInfo.baseCuringTimeMin * 0.95 * weightFactor * cureSystemFactor;
      }

      if (manufactureInfo.dieOpeningTime !== null) {
        curingTime = this.shareService.checkDirtyProperty('dieOpeningTime', fieldColorsList) ? manufacturingObj?.dieOpeningTime : curingTime;
      }
      manufactureInfo.dieOpeningTime = this.shareService.isValidNumber(curingTime);
    }

    // Handling Time
    if (manufactureInfo.iscoolingTimeDirty && manufactureInfo.coolingTime !== null) {
      manufactureInfo.coolingTime = Number(manufactureInfo.coolingTime);
    } else {
      // let holdingTime = this.shareService.isValidNumber(manufactureInfo.sideCoreMechanisms * 0.3);
      let handlingTime = 0;

      if (materialInfo?.noOfCavities >= 1 && materialInfo?.noOfCavities <= 10) handlingTime = 20;
      if (materialInfo?.noOfCavities >= 11 && materialInfo?.noOfCavities <= 40) handlingTime = 35;
      if (materialInfo?.noOfCavities >= 41 && materialInfo?.noOfCavities <= 70) handlingTime = 50;
      if (materialInfo?.noOfCavities >= 71 && materialInfo?.noOfCavities <= 100) handlingTime = 65;
      if (materialInfo?.noOfCavities >= 101 && materialInfo?.noOfCavities <= 150) handlingTime = 75;
      if (materialInfo?.noOfCavities >= 151 && materialInfo?.noOfCavities <= 999) handlingTime = 90;

      handlingTime += 20; // Mold open and close time

      if (manufactureInfo.coolingTime !== null) {
        handlingTime = this.shareService.checkDirtyProperty('coolingTime', fieldColorsList) ? manufacturingObj?.coolingTime : handlingTime;
      }
      manufactureInfo.coolingTime = handlingTime;
    }

    //Total time  per shot
    if (manufactureInfo.isProcessTimeDirty && manufactureInfo.processTime !== null) {
      manufactureInfo.processTime = Number(manufactureInfo.processTime);
    } else {
      let totalTime = this.shareService.isValidNumber(Number(manufactureInfo.dryCycleTime) + Number(manufactureInfo.dieOpeningTime) + Number(manufactureInfo.coolingTime));
      if (manufactureInfo.processTime !== null) {
        totalTime = this.shareService.checkDirtyProperty('processTime', fieldColorsList) ? manufacturingObj?.processTime : totalTime;
      }
      manufactureInfo.processTime = totalTime;
    }

    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(Number(manufactureInfo.processTime) / (manufactureInfo?.materialInfoList?.length > 0 ? manufactureInfo?.materialInfoList[0]?.noOfCavities : 1));
      if (manufactureInfo.cycleTime != null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost !== null) {
      manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
    } else {
      let directMachineCost = this.shareService.isValidNumber(((Number(manufactureInfo.machineHourRate) / 3600) * manufactureInfo.cycleTime) / manufactureInfo.efficiency);
      if (manufactureInfo.directMachineCost !== null) {
        directMachineCost = this.shareService.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : directMachineCost;
      }
      manufactureInfo.directMachineCost = directMachineCost;
    }

    //Setup time
    if (manufactureInfo.issetUpTimeDirty && !!manufactureInfo.setUpTime) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      let setUpTime = 60;
      if (manufactureInfo.setUpTime !== null) {
        setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : setUpTime;
      }
      manufactureInfo.setUpTime = setUpTime;
    }
    //Direct labors
    if (manufactureInfo.isNoOfLowSkilledLaboursDirty && manufactureInfo.noOfLowSkilledLabours !== null) {
      manufactureInfo.noOfLowSkilledLabours = Number(manufactureInfo.noOfLowSkilledLabours);
    } else {
      manufactureInfo.noOfLowSkilledLabours = this.shareService.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList)
        ? manufacturingObj?.noOfLowSkilledLabours
        : this.shareService.isValidNumber(manufactureInfo.noOfLowSkilledLabours);
    }

    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost !== null) {
      manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
    } else {
      let directLaborCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.noOfLowSkilledLabours) * manufactureInfo.cycleTime * (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600)) / manufactureInfo?.efficiency +
          (Number(manufactureInfo.noOfSkilledLabours) * manufactureInfo.cycleTime * (Number(manufactureInfo.skilledLaborRatePerHour) / 3600)) / manufactureInfo?.efficiency
      );

      // let directLaborCost = this.shareService.isValidNumber(
      //   ((Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) * (manufactureInfo.cycleTime * Number(manufactureInfo.noOfLowSkilledLabours))) / Number(manufactureInfo.noOfCavities)
      // );
      if (manufactureInfo.directLaborCost !== null) {
        directLaborCost = this.shareService.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : directLaborCost;
      }
      manufactureInfo.directLaborCost = directLaborCost;
    }

    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost !== null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      let directSetUpCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.setUpTime) / 60 / Number(manufactureInfo.efficiency) / Number(manufactureInfo.lotSize)) *
          (Number(manufactureInfo.lowSkilledLaborRatePerHour) * Number(manufactureInfo.noOfLowSkilledLabours) +
            Number(manufactureInfo.skilledLaborRatePerHour) * Number(manufactureInfo.noOfSkilledLabours))

        // ((Number(manufactureInfo.lowSkilledLaborRatePerHour) + Number(manufactureInfo.machineHourRate)) * (Number(manufactureInfo.setUpTime) / 60)) / manufactureInfo.lotSize
      );
      if (manufactureInfo.directSetUpCost !== null) {
        directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.setUpCost : directSetUpCost;
      }
      manufactureInfo.directSetUpCost = directSetUpCost;
    }

    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost !== null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      let inspectionCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.qaOfInspectorRate) * Number(manufactureInfo.inspectionTime)) / 60 / Number(manufactureInfo.efficiency) / Number(manufactureInfo.lotSize)
      );
      if (manufactureInfo.inspectionCost !== null) {
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
      manufactureInfo.netMaterialCost = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.netMatCost : 0;
      let yieldCost = this.shareService.isValidNumber(
        (1 - Number(manufactureInfo.yieldPer) / 100) *
          // Number(manufactureInfo.netMaterialCost) +
          sum
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

  public calculationsForCutting(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    manufactureInfo.density = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.density : 0;
    manufactureInfo.grossWeight = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.grossWeight : 0;
    const perimeter = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.perimeter : 0;

    const matProcessId = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.processId : 0;
    const thickness = manufactureInfo?.materialInfoList && manufactureInfo?.materialInfoList?.length > 0 ? manufactureInfo?.materialInfoList[0].sheetThickness : 0;
    const partLength = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.dimX : 0;
    const partWidth = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.dimY : 0;
    // const noOfCavities = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.noOfCavities : 1;

    manufactureInfo.recBedSize =
      manufactureInfo.platenSizeLength && manufactureInfo.platenSizeWidth ? Math.round(manufactureInfo.platenSizeLength) + ' x ' + Math.round(manufactureInfo.platenSizeWidth) : '';
    manufactureInfo.selectedBedSize =
      manufactureInfo.machineMaster?.platenLengthmm && manufactureInfo.machineMaster?.platenWidthmm
        ? manufactureInfo.machineMaster?.platenLengthmm + ' x ' + manufactureInfo.machineMaster?.platenWidthmm
        : '';

    // TODO : recommendTonnage calc requirment needed
    const recommendTonnage = 0;
    manufactureInfo.recommendTonnage = this.shareService.isValidNumber(recommendTonnage);
    manufactureInfo.selectedTonnage = manufactureInfo.machineMaster?.machineTonnageTons;

    // Macine Cutting Speed
    if (manufactureInfo.isMoldOpeningDirty && manufactureInfo.moldOpening !== null) {
      manufactureInfo.moldOpening = Number(manufactureInfo.moldOpening);
    } else {
      let moldOpenCloseTime = 1500; // Dafault // need to take from manufactureInfo.machineMaster?.cuttingSpeed
      if (matProcessId === PrimaryProcessType.ThermoForming) {
        moldOpenCloseTime = this.plasticRubberConfigService.cuttingSpeeds.find((item) => item.thickness === thickness)?.speed ?? 0;
      }
      if (manufactureInfo.moldOpening !== null) {
        moldOpenCloseTime = this.shareService.checkDirtyProperty('moldOpening', fieldColorsList) ? manufacturingObj?.moldOpening : moldOpenCloseTime;
      }
      manufactureInfo.moldOpening = moldOpenCloseTime;
    }

    // Cutting Time
    if (manufactureInfo.iscoolingTimeDirty && manufactureInfo.coolingTime !== null) {
      manufactureInfo.coolingTime = Number(manufactureInfo.coolingTime);
    } else {
      let coolingTime = this.shareService.isValidNumber(((perimeter * 1.15) / manufactureInfo.moldOpening) * 60);
      if (matProcessId === PrimaryProcessType.ThermoForming || matProcessId === PrimaryProcessType.PlasticVacuumForming) {
        coolingTime = this.shareService.isValidNumber(((2 * (partLength + partWidth) * 1.1) / manufactureInfo.moldOpening) * 60);
      }
      if (manufactureInfo.coolingTime !== null) {
        coolingTime = this.shareService.checkDirtyProperty('coolingTime', fieldColorsList) ? manufacturingObj?.coolingTime : coolingTime;
      }
      manufactureInfo.coolingTime = coolingTime;
    }

    // Unloading Time
    if (manufactureInfo.ispartExtractionTimeDirty && manufactureInfo.partExtractionTime !== null) {
      manufactureInfo.partExtractionTime = Number(manufactureInfo.partExtractionTime);
    } else {
      let unloadingTime = 8; // default
      if (matProcessId === PrimaryProcessType.ThermoForming || matProcessId === PrimaryProcessType.PlasticVacuumForming) {
        unloadingTime = 10;
      }
      if (manufactureInfo.partExtractionTime !== null) {
        unloadingTime = this.shareService.checkDirtyProperty('partExtractionTime', fieldColorsList) ? manufacturingObj?.partExtractionTime : unloadingTime;
      }
      manufactureInfo.partExtractionTime = unloadingTime;
    }

    //Total Processing time for machine:
    if (manufactureInfo.isLoadingTimeDirty && manufactureInfo.loadingTime !== null) {
      manufactureInfo.loadingTime = Number(manufactureInfo.loadingTime);
    } else {
      let totalProcessingTime = this.shareService.isValidNumber(manufactureInfo.coolingTime + manufactureInfo.partExtractionTime);
      if (manufactureInfo?.loadingTime !== null) {
        totalProcessingTime = this.shareService.checkDirtyProperty('loadingTime', fieldColorsList) ? manufacturingObj?.loadingTime : totalProcessingTime;
      }
      manufactureInfo.loadingTime = totalProcessingTime;
    }

    // Cycle Time
    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime !== null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(Number(manufactureInfo.loadingTime));
      // if (matProcessId === PrimaryProcessType.ThermoForming) {
      //   cycleTime = this.shareService.isValidNumber(Number(Math.floor((3600 / manufactureInfo.loadingTime) * manufactureInfo.efficiency)) * noOfCavities);
      // }
      if (manufactureInfo.cycleTime !== null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost !== null) {
      manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
    } else {
      let directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) * Number(manufactureInfo.cycleTime)) / 3600 / Number(manufactureInfo.efficiency));
      if (manufactureInfo.directMachineCost !== null) {
        directMachineCost = this.shareService.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : directMachineCost;
      }
      manufactureInfo.directMachineCost = directMachineCost;
    }

    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost !== null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      let directSetUpCost = this.shareService.isValidNumber(
        (((Number(manufactureInfo.noOfLowSkilledLabours) * Number(manufactureInfo.setUpTime)) / 60) * Number(manufactureInfo.lowSkilledLaborRatePerHour)) /
          Number(manufactureInfo.efficiency) /
          Number(manufactureInfo.lotSize) +
          (((Number(manufactureInfo.noOfSkilledLabours) * Number(manufactureInfo.skilledLaborRatePerHour)) / 60) * Number(manufactureInfo.setUpTime)) /
            Number(manufactureInfo.efficiency) /
            Number(manufactureInfo.lotSize)
      );
      if (manufactureInfo.directSetUpCost !== null) {
        directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.setUpCost : directSetUpCost;
      }
      manufactureInfo.directSetUpCost = directSetUpCost;
    }

    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost !== null) {
      manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
    } else {
      let directLaborCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.noOfLowSkilledLabours) * Number(manufactureInfo.lowSkilledLaborRatePerHour) * Number(manufactureInfo.cycleTime)) / 3600 / Number(manufactureInfo.efficiency) +
          (Number(manufactureInfo.noOfSkilledLabours) * Number(manufactureInfo.skilledLaborRatePerHour) * Number(manufactureInfo.cycleTime)) / 3600 / Number(manufactureInfo.efficiency)
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
        (manufactureInfo.inspectionTime * Number(manufactureInfo.qaOfInspectorRate)) / 60 / Number(manufactureInfo.efficiency) / Number(manufactureInfo.lotSize)
      );
      if (manufactureInfo.inspectionCost !== null) {
        inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : inspectionCost;
      }
      manufactureInfo.inspectionCost = inspectionCost;
    }

    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost !== null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      const sum = this.shareService.isValidNumber(
        Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
      );
      manufactureInfo.netMaterialCost = manufactureInfo.materialInfoList?.length > 0 ? manufactureInfo.materialInfoList[0]?.netMatCost : 0;
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
    return manufactureInfo;
  }
}
