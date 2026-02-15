
import { PartComplexity, ProcessType, SubProcessType, ToolType } from '../utils/constants';
import { ProcessInfoDto } from 'src/app/shared/models';
import { CostingConfig } from '../utils/costing-config';
import { SharedService } from './shared';

import { ManufacturingTubeBendingCalculatorService } from './manufacturing-tube-bending-calculator';
import { ManufacturingInsulationJacketCalculatorService } from './manufacturing-insulation-jacket-calculator';
import { ManufacturingBrazingCalculatorService } from './manufacturing-brazing-calculator';
import { ManufacturingMetalExtrusionCalculatorService } from './manufacturing-metal-extrusion-calculator';
import { ManufacturingCastingCalculatorService } from './manufacturing-casting-calculator';
import { ManufacturingMachiningCalculatorService } from './manufacturing-machining-calculator';
import { ManufacturingPlatingCalculatorService } from './manufacturing-plating-calculatorLogic';
import { ManufacturingElectronicsCalculatorService } from './manufacturing-electronics-calculator';
import { ManufacturingPlasticTubeExtrusionCalculatorService } from './manufacturing-plastic-tube-extrusion-calculator';
import { ManufacturingPlasticVacuumFormingCalculatorService } from './manufacturing-plastic-vacuum-forming-calculator';
import { ManufacturingAssemblyConnectorCalculatorService } from './manufacturing-assembly-connector-calculator';
import { ManufacturingCleaningForgingCalculatorService } from './manufacturing-cleaning-forging-calculator';
import { ManufacturingBilletHeatingForgingCalculatorService } from './manufacturing-billet-heating-forging-calculator';
import { ManufacturingTrimmingHydraulicForgingCalculatorService } from './manufacturing-trimming-hydraulic-forging-calculator';
import { ManufacturingStraighteningOptionalForgingCalculatorService } from './manufacturing-straightening-optional-forging-calculator';
import { ManufacturingPiercingHydraulicForgingCalculatorService } from './manufacturing-piercing-hydraulic-forging-calculator';
import { ManufacturingTestingMpiForgingCalculatorService } from './manufacturing-testing-mpi-forging-calculator';
import { CustomCableService } from './manufacturing-custom-cable';
import { ManufacturingWiringHarnessCalculatorService } from './manufacturing-wiringharness-calculator';
import { ManufacturingSustainabilityCalculatorService } from './manufacturing-sustainability-calculator';
import { SemiRigidFlexCalculatorService } from './semi-rigid-flex-calculator';

export class ManufacturingCalculatorService {

  constructor(
    private shareService: SharedService,
    private _costingConfig: CostingConfig,
    public _manufacturingTubeBendingCalService: ManufacturingTubeBendingCalculatorService,
    public _manufacturingInsulationJacketCalService: ManufacturingInsulationJacketCalculatorService,
    public _manufacturingBrazingCalService: ManufacturingBrazingCalculatorService,
    public _manufacturingMetalExtrusionCalService: ManufacturingMetalExtrusionCalculatorService,
    public _manufacturingCastingCalcService: ManufacturingCastingCalculatorService,
    public _manufacturingMachiningCalcService: ManufacturingMachiningCalculatorService,
    public _manufacturingPlatingCalcService: ManufacturingPlatingCalculatorService,
    public _manuFacturingElectronicsService: ManufacturingElectronicsCalculatorService,
    public _manufacturingPlasticTubeExtrusionCalcService: ManufacturingPlasticTubeExtrusionCalculatorService,
    public _manufacturingPlasticVacuumFormingCalcService: ManufacturingPlasticVacuumFormingCalculatorService,
    public _manufacturingAssemblyConnectorCalService: ManufacturingAssemblyConnectorCalculatorService,
    public _manufacturingCleaningForgingCalService: ManufacturingCleaningForgingCalculatorService,
    public _manufacturingBilletHeatingForgingCalService: ManufacturingBilletHeatingForgingCalculatorService,
    public _manufacturingTrimmingHydraulicForgingCalService: ManufacturingTrimmingHydraulicForgingCalculatorService,
    public _manufacturingStraighteningOptionalForgingCalService: ManufacturingStraighteningOptionalForgingCalculatorService,
    public _manufacturingPiercingHydraulicForgingCalService: ManufacturingPiercingHydraulicForgingCalculatorService,
    public _manufacturingTestingMpiForgingCalService: ManufacturingTestingMpiForgingCalculatorService,
    public _manufacturingCustomCableCalService: CustomCableService,
    public _manufacturingWiringHarnessCalService: ManufacturingWiringHarnessCalculatorService,
    public _manufacturingSustainabilityCalService: ManufacturingSustainabilityCalculatorService,
    public _manufacturingSemiRigidFlexCalService: SemiRigidFlexCalculatorService
  ) { }

  public doCostCalculationForOthers(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    manufactureInfo.netMaterialCost = (manufactureInfo.materialInfoList?.length ?? 0) > 0 ? manufactureInfo.materialInfoList![0]?.netMatCost : 0;
    manufactureInfo.netPartWeight = (manufactureInfo.materialInfoList?.length ?? 0) > 0 ? manufactureInfo.materialInfoList![0]?.netWeight : 0;
    manufactureInfo.rawmaterialCost = (manufactureInfo.materialInfoList?.length ?? 0) > 0 ? manufactureInfo.materialInfoList![0]?.netMatCost : 0;

    const isManualInspection = Number(manufactureInfo.processTypeID) === ProcessType.ManualInspection;

    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost != null) {
      manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
    } else {
      let directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) / 3600) * manufactureInfo.cycleTime);
      if (manufactureInfo.directMachineCost != null) {
        directMachineCost = this.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : directMachineCost;
      }
      manufactureInfo.directMachineCost = directMachineCost;
    }

    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost != null) {
      manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
    } else {
      let directLaborCost = this.shareService.isValidNumber((Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) * (manufactureInfo.cycleTime * Number(manufactureInfo.noOfLowSkilledLabours)));
      if (manufactureInfo.directLaborCost != null) {
        directLaborCost = this.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : directLaborCost;
      }
      manufactureInfo.directLaborCost = directLaborCost;
    }

    if ((manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost != null) || isManualInspection) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost) || 0;
    } else {
      let inspectionCost = this.shareService.isValidNumber(Number(manufactureInfo.samplingRate ?? 0 / 100) * ((Number(manufactureInfo.inspectionTime) * Number(manufactureInfo.qaOfInspectorRate)) / 3600));
      if (manufactureInfo.inspectionCost != null) {
        inspectionCost = this.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : inspectionCost;
      }
      manufactureInfo.inspectionCost = inspectionCost;
    }

    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost != null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      let directSetUpCost = this.shareService.isValidNumber(
        ((Number(manufactureInfo.lowSkilledLaborRatePerHour) + Number(manufactureInfo.machineHourRate)) * (Number(manufactureInfo.setUpTime) / 60)) / (manufactureInfo.lotSize || 1)
      );
      if (manufactureInfo.directSetUpCost != null) {
        directSetUpCost = this.checkDirtyProperty('directSetUpCost', fieldColorsList) ? (manufacturingObj?.directSetUpCost || 0) : directSetUpCost;
      }
      manufactureInfo.directSetUpCost = directSetUpCost;
    }

    if ((manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost != null) || isManualInspection) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      const sum = this.shareService.isValidNumber(
        Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
      );
      let yieldCost = this.shareService.isValidNumber(
        (1 - Number(manufactureInfo.yieldPer) / 100) *
        (Number(manufactureInfo.netMaterialCost) - (Number(manufactureInfo.netPartWeight) * Number(manufactureInfo.materialInfo?.scrapPrice)) / 1000 + sum)
      );
      if (manufactureInfo.yieldCost != null) {
        yieldCost = this.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : yieldCost;
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

    if ([ProcessType.CMMInspection].includes(Number(manufactureInfo?.processTypeID))) {
      manufactureInfo.directProcessCost *= Number(manufactureInfo.samplingRate ?? 0);
    }

    manufactureInfo.directTooling = this.shareService.isValidNumber(
      (Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost)) * 0.01
    );
    manufactureInfo.directProcessCost = processCost;
    manufactureInfo.conversionCost = processCost;
    manufactureInfo.partCost = manufactureInfo.rawmaterialCost + manufactureInfo.conversionCost;
    //manufactureInfo = this.calculateESGCosts(manufactureInfo, fieldColorsList, manufacturingObj);
    return manufactureInfo;
  }

  // public calculationsForMetalForming(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): Observable<ProcessInfoDto> {
  public calculationsForMetalForming(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    manufactureInfo.noOfCavities = manufactureInfo.materialInfoList?.length ?? 0 > 0 ? manufactureInfo.materialInfoList?.[0]?.noOfCavities : 0;

    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      manufactureInfo.setUpTime = this.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : 60;
    }

    if ((manufactureInfo.materialInfoList?.length ?? 0) > 0) {
      const totalparvalue = manufactureInfo.materialInfoList?.map((item) => {
        return item.totalPartStockLength || 0;
      }) ?? [];
      if (totalparvalue) {
        manufactureInfo.workpieceStockLength = totalparvalue.reduce((a, b) => Math.max(a, b));
      }
    }
    manufactureInfo.coilALoadingUnloadingTime = 0;
    manufactureInfo.coilBLoadingUnloadingTime = 0;
    if ((manufactureInfo.materialInfoList?.length ?? 0) > 0) {
      for (let i = 0; i < (manufactureInfo.materialInfoList?.length ?? 0); i++) {
        if (i == 0) {
          manufactureInfo.coilALoadingUnloadingTime = this.shareService.isValidNumber(Math.round((manufactureInfo.lotSize || 0) / (manufactureInfo.materialInfoList?.[i]?.partsPerCoil || 1)) * 5);
        }
        if (i == 1) {
          manufactureInfo.coilBLoadingUnloadingTime = this.shareService.isValidNumber(Math.round((manufactureInfo.lotSize || 0) / (manufactureInfo.materialInfoList?.[i]?.partsPerCoil || 1)) * 5);
        }
      }
    }

    manufactureInfo.setUpTime = this.shareService.isValidNumber(
      ((manufactureInfo.totalToolLoadingTime ?? 0) + (manufactureInfo.coilALoadingUnloadingTime ?? 0) + (manufactureInfo.coilBLoadingUnloadingTime ?? 0)) / (manufactureInfo.lotSize || 1)
    );

    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = this.shareService.isValidNumber(Number(manufactureInfo.cycleTime));
    } else {
      let cycleTime = this.shareService.isValidNumber(1 / manufactureInfo?.machineMaster?.strokeRateMin);
      if (manufactureInfo.cycleTime != null) {
        cycleTime = this.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost != null) {
      manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
    } else {
      let directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) / 60) * manufactureInfo.cycleTime);
      if (manufactureInfo.directMachineCost != null) {
        directMachineCost = this.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : directMachineCost;
      }
      manufactureInfo.directMachineCost = directMachineCost;
    }

    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost != null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      let directSetUpCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 60) * (Number(manufactureInfo.setUpTime) * Number(manufactureInfo.noOfLowSkilledLabours)) +
        (Number(manufactureInfo.skilledLaborRatePerHour) / 60) * (Number(manufactureInfo.setUpTime) * Number(manufactureInfo.noOfSkilledLabours)) +
        (Number(manufactureInfo.machineHourRate) / 60) * Number(manufactureInfo.setUpTime)
      );
      if (manufactureInfo.directSetUpCost != null) {
        directSetUpCost = this.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.directSetUpCost : directSetUpCost;
      }
      manufactureInfo.directSetUpCost = directSetUpCost;
    }

    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost != null) {
      manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
    } else {
      let directLaborCost = this.shareService.isValidNumber(
        ((Number(manufactureInfo.lowSkilledLaborRatePerHour) / 60) * (manufactureInfo.cycleTime * Number(manufactureInfo.noOfLowSkilledLabours))) / Number(manufactureInfo.noOfCavities)
      );
      if (manufactureInfo.directLaborCost != null) {
        directLaborCost = this.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : directLaborCost;
      }
      manufactureInfo.directLaborCost = directLaborCost;
    }

    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost != null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      let inspectionCost = this.shareService.isValidNumber(Number(manufactureInfo.samplingRate ?? 0 / 100) * ((Number(manufactureInfo.inspectionTime ?? 0) * Number(manufactureInfo.qaOfInspectorRate ?? 0)) / 3600));
      if (manufactureInfo.inspectionCost != null) {
        inspectionCost = this.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : inspectionCost;
      }
      manufactureInfo.inspectionCost = inspectionCost;
    }

    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost != null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      const netMaterialCost = (manufactureInfo.materialInfoList?.length) ?? 0 > 0 ? manufactureInfo.materialInfoList?.[0]?.netMatCost : 0;
      const netPartWeight = (manufactureInfo.materialInfoList?.length) ?? 0 > 0 ? manufactureInfo.materialInfoList?.[0]?.netWeight : 0;
      const scrapPrice = (manufactureInfo.materialInfoList?.length) ?? 0 > 0 ? manufactureInfo.materialInfoList?.[0]?.scrapPricePerKg : 0;

      const sum = this.shareService.isValidNumber(
        Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
      );
      let yieldCost = this.shareService.isValidNumber((1 - Number(manufactureInfo.yieldPer) / 100) * (Number(netMaterialCost) - (Number(netPartWeight) * Number(scrapPrice)) / 1000 + sum));
      if (manufactureInfo.yieldCost != null) {
        yieldCost = this.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : yieldCost;
      }
      manufactureInfo.yieldCost = yieldCost;
    }

    manufactureInfo.directTooling = this.shareService.isValidNumber(
      (Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost)) * 0.01
    );

    const processCost = this.shareService.isValidNumber(
      Number(manufactureInfo.directLaborCost) +
      Number(manufactureInfo.directMachineCost) +
      Number(manufactureInfo.directSetUpCost) +
      Number(manufactureInfo.inspectionCost) +
      Number(manufactureInfo.yieldCost)
    );

    manufactureInfo.directProcessCost = processCost;
    manufactureInfo.conversionCost = processCost;
    //manufactureInfo = this.calculateESGCosts(manufactureInfo, fieldColorsList, manufacturingObj);
    // return new Observable((obs) => { obs.next(manufactureInfo); });
    return manufactureInfo;
  }

  // public calculationsForDrilling(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): Observable<ProcessInfoDto> {
  public calculationsForDrilling(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    let roundedDrillDiameter = Math.round(manufactureInfo.drillDiameter ?? 0);
    if (roundedDrillDiameter >= 25) {
      roundedDrillDiameter = 19.1;
    }

    const drillingSpeedEntity = manufactureInfo.drillingCuttingSpeedList?.find(
      (x) => x.materialTypeId == manufactureInfo.materialType && x.fromFRPDrillDia <= roundedDrillDiameter && x.toFRPDrillDia >= roundedDrillDiameter
    );

    if (manufactureInfo.iscuttingSpeedDirty && manufactureInfo.cuttingSpeed != null) {
      manufactureInfo.cuttingSpeed = Number(manufactureInfo.cuttingSpeed);
    } else {
      let cuttingSpeed = 0;
      if (drillingSpeedEntity) {
        cuttingSpeed = drillingSpeedEntity?.cuttingSpeed80Percent ?? 0;
      }
      if (manufactureInfo.cuttingSpeed != null) {
        cuttingSpeed = this.checkDirtyProperty('cuttingSpeed', fieldColorsList) ? manufacturingObj?.cuttingSpeed ?? 0 : cuttingSpeed;
      }
      manufactureInfo.cuttingSpeed = cuttingSpeed;
    }

    if (manufactureInfo.isfeedPerRevDirty && manufactureInfo.feedPerRev != null) {
      manufactureInfo.feedPerRev = Number(manufactureInfo.feedPerRev);
    } else {
      let feedPerRev = 0;
      if (drillingSpeedEntity) {
        feedPerRev = drillingSpeedEntity?.frpValue ?? 0;
      }
      if (manufactureInfo.feedPerRev != null) {
        feedPerRev = this.checkDirtyProperty('feedPerRev', fieldColorsList) ? manufacturingObj?.feedPerRev ?? 0 : feedPerRev;
      }
      manufactureInfo.feedPerRev = feedPerRev;
    }
    if (manufactureInfo.isspindleRpmDirty && manufactureInfo.spindleRpm != null) {
      manufactureInfo.spindleRpm = Number(manufactureInfo.spindleRpm);
    } else {
      let spindleRpm = this.shareService.isValidNumber((1000 * Number(manufactureInfo.cuttingSpeed)) / (3.1428 * Number(manufactureInfo.drillDiameter)));
      if (manufactureInfo.spindleRpm != null) {
        spindleRpm = this.checkDirtyProperty('spindleRpm', fieldColorsList) ? manufacturingObj?.spindleRpm ?? 0 : spindleRpm;
      }
      manufactureInfo.spindleRpm = spindleRpm;
    }

    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(
        Number((Number(manufactureInfo.drillDepth) + Number(manufactureInfo.drillDepth) / 10) / (Number(manufactureInfo.feedPerRev) * Number(manufactureInfo.spindleRpm)))
      );
      if (manufactureInfo.cycleTime != null) {
        cycleTime = this.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime ?? 0 : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }
    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      let setUpTime = this.shareService.isValidNumber(Number(manufactureInfo.cycleTime) * Number(manufactureInfo.setupPercentage));
      if (manufactureInfo.setUpTime != null) {
        setUpTime = this.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime ?? 0 : this.shareService.isValidNumber(setUpTime);
      }
      manufactureInfo.setUpTime = setUpTime;
    }
    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost != null) {
      manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
    } else {
      let directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) / 60) * Number(manufactureInfo.cycleTime));
      if (manufactureInfo.directMachineCost != null) {
        directMachineCost = this.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : directMachineCost;
      }
      manufactureInfo.directMachineCost = directMachineCost;
    }

    manufactureInfo.yieldPer =
      manufactureInfo?.partComplexity == PartComplexity.Low ? 99 : manufactureInfo?.partComplexity == PartComplexity.Medium ? 98 : manufactureInfo?.partComplexity == PartComplexity.High ? 97 : 0;

    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost != null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      let directSetUpCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 60) * (Number(manufactureInfo.noOfLowSkilledLabours) * Number(manufactureInfo.setUpTime)) +
        (Number(manufactureInfo.machineHourRate) / 60) * Number(manufactureInfo.setUpTime)
      );
      if (manufactureInfo.directSetUpCost != null) {
        directSetUpCost = this.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.directSetUpCost : directSetUpCost;
      }
      manufactureInfo.directSetUpCost = directSetUpCost;
    }

    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost != null) {
      manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
    } else {
      let directLaborCost = this.shareService.isValidNumber((Number(manufactureInfo.lowSkilledLaborRatePerHour) / 60) * (manufactureInfo.cycleTime * Number(manufactureInfo.noOfLowSkilledLabours)));
      if (manufactureInfo.directLaborCost != null) {
        directLaborCost = this.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : directLaborCost;
      }
      manufactureInfo.directLaborCost = directLaborCost;
    }

    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost != null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      const lotSize = manufactureInfo.lotSize || 0;
      let inspectionCost = this.shareService.isValidNumber(
        ((Number(manufactureInfo.qaOfInspectorRate) / 60) * Number(manufactureInfo.inspectionTime) * (Number(manufactureInfo.samplingRate ?? 0 / 100) * Number(lotSize))) / Number(lotSize)
      );
      if (manufactureInfo.inspectionCost != null) {
        inspectionCost = this.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost ?? 0 : inspectionCost;
      }
      manufactureInfo.inspectionCost = inspectionCost;
    }

    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost != null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      const netMaterialCost = (manufactureInfo.materialInfoList?.length ?? 0) > 0 ? manufactureInfo.materialInfoList?.[0]?.netMatCost : 0;
      const netPartWeight = (manufactureInfo.materialInfoList?.length ?? 0) > 0 ? manufactureInfo.materialInfoList?.[0]?.netWeight : 0;
      const scrapPrice = (manufactureInfo.materialInfoList?.length ?? 0) > 0 ? manufactureInfo.materialInfoList?.[0]?.scrapPricePerKg : 0;

      const sum = this.shareService.isValidNumber(
        Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
      );

      let yieldCost = this.shareService.isValidNumber((1 - Number(manufactureInfo.yieldPer) / 100) * (Number(netMaterialCost) - (Number(netPartWeight) * Number(scrapPrice)) / 1000 + sum));
      if (manufactureInfo.yieldCost != null) {
        yieldCost = this.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : yieldCost;
      }
      manufactureInfo.yieldCost = yieldCost;
    }

    manufactureInfo.directTooling = this.shareService.isValidNumber(
      (Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost)) * 0.01
    );

    const processCost = this.shareService.isValidNumber(
      Number(manufactureInfo.directLaborCost) +
      Number(manufactureInfo.directMachineCost) +
      Number(manufactureInfo.directSetUpCost) +
      Number(manufactureInfo.inspectionCost) +
      Number(manufactureInfo.yieldCost)
    );
    manufactureInfo.directProcessCost = processCost;
    manufactureInfo.conversionCost = processCost;
    //manufactureInfo = this.calculateESGCosts(manufactureInfo, fieldColorsList, manufacturingObj);

    // return new Observable((obs) => { obs.next(manufactureInfo); });
    return manufactureInfo;
  }

  public calculationsForTesting(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    manufactureInfo.setUpTime = this.shareService.isValidNumber(Number(manufactureInfo.totalToolLendingTime) / (manufactureInfo.lotSize ?? 0));

    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = this.shareService.isValidNumber(1 / (manufactureInfo?.machineMaster?.strokeRateMin ?? 0));
      if (manufactureInfo.cycleTime != null) {
        cycleTime = this.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : manufactureInfo.cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }
    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost != null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      let inspectionCost = this.shareService.isValidNumber(
        ((Number(manufactureInfo.lineOfInspectorRate) / 60) * (Number(manufactureInfo.lineOfInspector) * Number(manufactureInfo.inspectionTime)) +
          (Number(manufactureInfo.qaOfInspectorRate) / 60) *
          (Number(manufactureInfo.qaOfInspector) * Number(manufactureInfo.inspectionTime)) *
          (Number(manufactureInfo.samplingRate ?? 0 / 100) * Number(manufactureInfo.lotSize))) /
        Number(manufactureInfo.lotSize)
      );
      if (manufactureInfo.inspectionCost != null) {
        inspectionCost = this.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : manufactureInfo.inspectionCost;
      }
      manufactureInfo.inspectionCost = inspectionCost;
    }
    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost != null) {
      manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
    } else {
      let directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) / 60) * Number(manufactureInfo.cycleTime));
      if (manufactureInfo.directMachineCost != null) {
        directMachineCost = this.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : manufactureInfo.directMachineCost;
      }
      manufactureInfo.directMachineCost = directMachineCost;
    }

    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost != null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      let directSetUpCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 60) * (Number(manufactureInfo.setUpTime) * Number(manufactureInfo.noOfLowSkilledLabours)) +
        (Number(manufactureInfo.skilledLaborRatePerHour) / 60) * (Number(manufactureInfo.setUpTime) * Number(manufactureInfo.noOfSkilledLabours)) +
        (Number(manufactureInfo.machineHourRate) / 60) * Number(manufactureInfo.setUpTime)
      );
      if (manufactureInfo.directSetUpCost != null) {
        directSetUpCost = this.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.directSetUpCost : manufactureInfo.directSetUpCost;
      }
      manufactureInfo.directSetUpCost = directSetUpCost;
    }

    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost != null) {
      manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
    } else {
      let directLaborCost = this.shareService.isValidNumber((Number(manufactureInfo.lowSkilledLaborRatePerHour) / 60) * (manufactureInfo.cycleTime * Number(manufactureInfo.noOfLowSkilledLabours)));
      if (manufactureInfo.directLaborCost != null) {
        directLaborCost = this.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : manufactureInfo.directLaborCost;
      }
      manufactureInfo.directLaborCost = directLaborCost;
    }

    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost != null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      let inspectionCost = this.shareService.isValidNumber(Number(manufactureInfo.samplingRate ?? 0 / 100) * ((Number(manufactureInfo.inspectionTime ?? 0) * Number(manufactureInfo.qaOfInspectorRate ?? 0)) / 3600));
      if (manufactureInfo.inspectionCost != null) {
        inspectionCost = this.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : manufactureInfo.inspectionCost;
      }
      manufactureInfo.inspectionCost = inspectionCost;
    }
    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost != null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      const netMaterialCost = (manufactureInfo.materialInfoList?.length ?? 0) > 0 ? manufactureInfo.materialInfoList?.[0]?.netMatCost : 0;
      const netPartWeight = (manufactureInfo.materialInfoList?.length ?? 0) > 0 ? manufactureInfo.materialInfoList?.[0]?.netWeight : 0;
      const scrapPrice = (manufactureInfo.materialInfoList?.length ?? 0) > 0 ? manufactureInfo.materialInfoList?.[0]?.scrapPricePerKg : 0;

      const sum = this.shareService.isValidNumber(
        Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
      );
      let yieldCost = this.shareService.isValidNumber((1 - Number(manufactureInfo.yieldPer) / 100) * (Number(netMaterialCost) - (Number(netPartWeight) * Number(scrapPrice)) / 1000 + sum));
      if (manufactureInfo.yieldCost != null) {
        yieldCost = this.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : manufactureInfo.yieldCost;
      }
      manufactureInfo.yieldCost = yieldCost;
    }
    manufactureInfo.directTooling = this.shareService.isValidNumber(
      (Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost)) * 0.01
    );

    const processCost = this.shareService.isValidNumber(
      Number(manufactureInfo.directLaborCost) +
      Number(manufactureInfo.directMachineCost) +
      Number(manufactureInfo.directSetUpCost) +
      Number(manufactureInfo.inspectionCost) +
      Number(manufactureInfo.yieldCost)
    );
    manufactureInfo.directProcessCost = processCost;
    manufactureInfo.conversionCost = processCost;
    //manufactureInfo = this.calculateESGCosts(manufactureInfo, fieldColorsList, manufacturingObj);
    return manufactureInfo;
  }

  // public calculationForForMoldPreparation(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): Observable<ProcessInfoDto> {
  public calculationForForMoldPreparation(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    manufactureInfo.setUpTimeBatch = 60;
    if (manufactureInfo.iscorePlacementDirty && manufactureInfo.corePlacement != null) {
      manufactureInfo.corePlacement = Number(manufactureInfo.corePlacement);
    } else {
      manufactureInfo.corePlacement = this.checkDirtyProperty('corePlacement', fieldColorsList) ? manufacturingObj?.corePlacement : 30;
    }
    if (manufactureInfo.ismoldMakingDirty && manufactureInfo.moldMaking != null) {
      manufactureInfo.moldMaking = Number(manufactureInfo.moldMaking);
    } else {
      manufactureInfo.moldMaking = this.checkDirtyProperty('moldMaking', fieldColorsList) ? manufacturingObj?.moldMaking : 45;
    }
    if (manufactureInfo.isshakeoutDirty && manufactureInfo.shakeout != null) {
      manufactureInfo.shakeout = Number(manufactureInfo.shakeout);
    } else {
      manufactureInfo.shakeout = this.checkDirtyProperty('shakeout', fieldColorsList) ? manufacturingObj?.shakeout : 10;
    }
    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = this.shareService.isValidNumber(Number(manufactureInfo.cycleTime));
    } else {
      manufactureInfo.cycleTime = Number(manufactureInfo.moldMaking) + Number(manufactureInfo.shakeout) + (manufactureInfo.corePlacement ?? 0);
      manufactureInfo.cycleTime = this.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime ?? 0 : manufactureInfo.cycleTime;
    }
    const totalCycleTimeWitEfficiency = this.shareService.isValidNumber(Number(manufactureInfo.cycleTime) / (Number(manufactureInfo.efficiency) / 100));

    manufactureInfo.totalCycleTime = this.shareService.isValidNumber(Number(totalCycleTimeWitEfficiency));

    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      manufactureInfo.setUpTime = this.shareService.isValidNumber(Number(manufactureInfo.setUpTimeBatch) / Number(manufactureInfo.lotSize));
      manufactureInfo.setUpTime = this.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : this.shareService.isValidNumber(manufactureInfo.setUpTime);
    }

    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost != null) {
      manufactureInfo.directMachineCost = this.shareService.isValidNumber(Number(manufactureInfo.directMachineCost));
    } else {
      manufactureInfo.directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) / 3600) * Number(manufactureInfo.totalCycleTime));
      manufactureInfo.directMachineCost = this.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : manufactureInfo.directMachineCost;
    }

    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost != null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      manufactureInfo.directSetUpCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 60) * (Number(manufactureInfo.setUpTime) * Number(manufactureInfo.noOfLowSkilledLabours)) +
        (Number(manufactureInfo.skilledLaborRatePerHour) / 60) * (Number(manufactureInfo.setUpTime) * Number(manufactureInfo.noOfSkilledLabours)) +
        (Number(manufactureInfo.machineHourRate) / 60) * Number(manufactureInfo.setUpTime)
      );
      manufactureInfo.directSetUpCost = this.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.directSetUpCost : manufactureInfo.directSetUpCost;
    }
    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost != null) {
      manufactureInfo.directLaborCost = this.shareService.isValidNumber(Number(manufactureInfo.directLaborCost));
    } else {
      manufactureInfo.directLaborCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) * (Number(manufactureInfo.totalCycleTime) * Number(manufactureInfo.noOfLowSkilledLabours))
      );
      manufactureInfo.directLaborCost = this.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : manufactureInfo.directLaborCost;
    }

    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost != null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      manufactureInfo.inspectionCost = this.shareService.isValidNumber(
        ((Number(manufactureInfo.qaOfInspectorRate) / 60) * Number(manufactureInfo.inspectionTime) * (Number(manufactureInfo.samplingRate ?? 0 / 100) * Number(manufactureInfo.lotSize))) /
        Number(manufactureInfo.lotSize)
      );
      manufactureInfo.inspectionCost = this.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : this.shareService.isValidNumber(manufactureInfo.inspectionCost);
    }

    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost != null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      const sum = this.shareService.isValidNumber(
        Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
      );
      manufactureInfo.yieldCost = this.shareService.isValidNumber(
        (1 - Number(manufactureInfo.yieldPer) / 100) *
        (Number(manufactureInfo.materialInfo?.totalCost ?? 0) - (Number(manufactureInfo.materialInfo?.weight ?? 0) / 1000) * Number(manufactureInfo.materialInfo?.scrapPrice ?? 0) + sum)
      );
      manufactureInfo.yieldCost = this.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : manufactureInfo.yieldCost;
    }

    manufactureInfo.directProcessCost = this.shareService.isValidNumber(
      Number(manufactureInfo.directLaborCost) +
      Number(manufactureInfo.directMachineCost) +
      Number(manufactureInfo.directSetUpCost) +
      Number(manufactureInfo.inspectionCost) +
      Number(manufactureInfo.yieldCost)
    );
    //manufactureInfo = this.calculateESGCosts(manufactureInfo, fieldColorsList, manufacturingObj);
    // return new Observable((obs) => {
    //   obs.next(manufactureInfo);
    // });
    return manufactureInfo;
  }

  // public calculationForForCorePreparation(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): Observable<ProcessInfoDto> {
  public calculationForForCorePreparation(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    manufactureInfo.setUpTimeBatch = 30;
    const totalCycleTime = Number(manufactureInfo.dryCycleTime) + Number(manufactureInfo.sandShooting) + Number(manufactureInfo.gasingVenting);
    manufactureInfo.cycleTime = this.shareService.isValidNumber(Number(totalCycleTime));
    manufactureInfo.totalCycleTime = this.shareService.isValidNumber(Number(totalCycleTime));

    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      manufactureInfo.setUpTime = this.shareService.isValidNumber(Number(manufactureInfo.setUpTimeBatch) / Number(manufactureInfo.lotSize));
      manufactureInfo.setUpTime = this.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : this.shareService.isValidNumber(manufactureInfo.setUpTime);
    }

    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost != null) {
      manufactureInfo.directMachineCost = this.shareService.isValidNumber(Number(manufactureInfo.directMachineCost));
    } else {
      manufactureInfo.directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) / 3600) * Number(manufactureInfo.totalCycleTime));
      manufactureInfo.directMachineCost = this.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : manufactureInfo.directMachineCost;
    }
    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost != null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      manufactureInfo.directSetUpCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 60) * (Number(manufactureInfo.setUpTime) * Number(manufactureInfo.noOfLowSkilledLabours)) +
        (Number(manufactureInfo.skilledLaborRatePerHour) / 60) * (Number(manufactureInfo.setUpTime) * Number(manufactureInfo.noOfSkilledLabours)) +
        (Number(manufactureInfo.machineHourRate) / 60) * Number(manufactureInfo.setUpTime)
      );
      manufactureInfo.directSetUpCost = this.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.directSetUpCost : manufactureInfo.directSetUpCost;
    }
    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost != null) {
      manufactureInfo.directLaborCost = this.shareService.isValidNumber(Number(manufactureInfo.directLaborCost));
    } else {
      manufactureInfo.directLaborCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) * (Number(manufactureInfo.totalCycleTime) * Number(manufactureInfo.noOfLowSkilledLabours))
      );
      manufactureInfo.directLaborCost = this.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : manufactureInfo.directLaborCost;
    }
    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost != null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      manufactureInfo.inspectionCost = this.shareService.isValidNumber(
        ((Number(manufactureInfo.qaOfInspectorRate) / 60) * Number(manufactureInfo.inspectionTime) * (Number(manufactureInfo.samplingRate ?? 0 / 100) * Number(manufactureInfo.lotSize))) /
        Number(manufactureInfo.lotSize)
      );
      manufactureInfo.inspectionCost = this.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : this.shareService.isValidNumber(manufactureInfo.inspectionCost);
    }

    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost != null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      const sum = this.shareService.isValidNumber(
        Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
      );
      manufactureInfo.yieldCost = this.shareService.isValidNumber(
        (1 - Number(manufactureInfo.yieldPer) / 100) *
        (Number(manufactureInfo.materialInfo?.totalCost ?? 0) - (Number(manufactureInfo.materialInfo?.weight ?? 0) / 1000) * Number(manufactureInfo.materialInfo?.scrapPrice ?? 0) + sum)
      );
      manufactureInfo.yieldCost = this.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : manufactureInfo.yieldCost;
    }

    manufactureInfo.directProcessCost = this.shareService.isValidNumber(
      Number(manufactureInfo.directLaborCost) +
      Number(manufactureInfo.directMachineCost) +
      Number(manufactureInfo.directSetUpCost) +
      Number(manufactureInfo.inspectionCost) +
      Number(manufactureInfo.yieldCost)
    );
    //manufactureInfo = this.calculateESGCosts(manufactureInfo, fieldColorsList, manufacturingObj);
    // return new Observable((obs) => {
    //   obs.next(manufactureInfo);
    // });
    return manufactureInfo;
  }

  // public doCostCalculationForMoldSandMixingMachine(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): Observable<ProcessInfoDto> {
  public doCostCalculationForMoldSandMixingMachine(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    const moldSandMixMin = this.shareService.isValidNumber(Number(manufactureInfo?.machineCapacity) / 60);
    const finishedCoreWeight = this.shareService.isValidNumber(Number(manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.totalCoreWeight));

    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      manufactureInfo.setUpTime = 20;
      manufactureInfo.setUpTime = this.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : this.shareService.isValidNumber(manufactureInfo.setUpTime);
    }

    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      manufactureInfo.cycleTime = this.shareService.isValidNumber((finishedCoreWeight / moldSandMixMin) * 60);
      manufactureInfo.cycleTime = this.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : this.shareService.isValidNumber(manufactureInfo.cycleTime);
    }

    const cycleTimeWithEfficiency = this.shareService.isValidNumber(manufactureInfo.cycleTime * (85 / 100));
    // const noOfPartsPerHour = this.shareService.isValidNumber(3600 / Number(manufactureInfo.cycleTime));

    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost != null) {
      manufactureInfo.directMachineCost = this.shareService.isValidNumber(Number(manufactureInfo.directMachineCost));
    } else {
      manufactureInfo.directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) / 3600) * Number(manufactureInfo.totalCycleTime));
      manufactureInfo.directMachineCost = this.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : manufactureInfo.directMachineCost;
    }
    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost != null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      manufactureInfo.directSetUpCost = this.shareService.isValidNumber((Number(manufactureInfo.setUpTime / 60) / (manufactureInfo.lotSize ?? 0)) * Number(manufactureInfo.machineHourRate));
      manufactureInfo.directSetUpCost = this.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.directSetUpCost : manufactureInfo.directSetUpCost;
    }
    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost != null) {
      manufactureInfo.directLaborCost = this.shareService.isValidNumber(Number(manufactureInfo.directLaborCost));
    } else {
      manufactureInfo.directLaborCost = this.shareService.isValidNumber((Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) * Number(cycleTimeWithEfficiency));
      manufactureInfo.directLaborCost = this.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : manufactureInfo.directLaborCost;
    }

    manufactureInfo.directProcessCost = this.shareService.isValidNumber(Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost));
    //manufactureInfo = this.calculateESGCosts(manufactureInfo, fieldColorsList, manufacturingObj);
    // return new Observable((obs) => {
    //   obs.next(manufactureInfo);
    // });
    return manufactureInfo;
  }

  // public doCostCalculationForCoreSandMixingMachine(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): Observable<ProcessInfoDto> {
  public doCostCalculationForCoreSandMixingMachine(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    const moldSandMixMin = this.shareService.isValidNumber(Number(manufactureInfo?.machineCapacity) / 60);
    const finishedCoreWeight = this.shareService.isValidNumber(Number(manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.totalCoreWeight));

    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      manufactureInfo.setUpTime = 20;
      manufactureInfo.setUpTime = this.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : this.shareService.isValidNumber(manufactureInfo.setUpTime);
    }

    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      manufactureInfo.cycleTime = this.shareService.isValidNumber((finishedCoreWeight / moldSandMixMin) * 60);
      manufactureInfo.cycleTime = this.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : this.shareService.isValidNumber(manufactureInfo.cycleTime);
    }
    const cycleTimeWithEfficiency = this.shareService.isValidNumber(manufactureInfo.cycleTime * (85 / 100));

    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost != null) {
      manufactureInfo.directMachineCost = this.shareService.isValidNumber(Number(manufactureInfo.directMachineCost));
    } else {
      manufactureInfo.directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) / 3600) * Number(manufactureInfo.totalCycleTime));
      manufactureInfo.directMachineCost = this.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : manufactureInfo.directMachineCost;
    }
    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost != null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      manufactureInfo.directSetUpCost = this.shareService.isValidNumber((Number(manufactureInfo.setUpTime / 60) / (manufactureInfo.lotSize ?? 0)) * Number(manufactureInfo.machineHourRate));
      manufactureInfo.directSetUpCost = this.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.directSetUpCost : manufactureInfo.directSetUpCost;
    }
    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost != null) {
      manufactureInfo.directLaborCost = this.shareService.isValidNumber(Number(manufactureInfo.directLaborCost));
    } else {
      manufactureInfo.directLaborCost = this.shareService.isValidNumber((Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) * Number(cycleTimeWithEfficiency));
      manufactureInfo.directLaborCost = this.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : manufactureInfo.directLaborCost;
    }

    manufactureInfo.directProcessCost = this.shareService.isValidNumber(Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost));

    return manufactureInfo;
  }

  // public calculationForPartCooling(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): Observable<ProcessInfoDto> {
  public calculationForPartCooling(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    manufactureInfo.setUpTimeBatch = 20;
    const partArea = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.partProjectedArea;
    const volume = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.partVolume;
    const noOfCavities = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.noOfCavities;
    const kFactor = 0.97 * Math.pow(10, 6);
    const area = this.shareService.isValidNumber(Math.pow(Number(volume) / Number(partArea), 2) / Math.pow(10, 6));
    let noOfParts = 0;
    if (manufactureInfo.processInfoList?.length) {
      const info = manufactureInfo.processInfoList?.filter((x) => x.processTypeID == ProcessType.MeltingCasting);
      noOfParts = info[0]?.noOfParts ?? 0;
    }
    const coolingTime = this.shareService.isValidNumber((Number(area) * Number(kFactor)) / (Number(noOfParts) / Number(noOfCavities)));
    if (manufactureInfo.istotalCycleTimeDirty && manufactureInfo.totalCycleTime != null) {
      manufactureInfo.totalCycleTime = Number(manufactureInfo.totalCycleTime);
    } else {
      manufactureInfo.totalCycleTime = this.shareService.isValidNumber(Number(coolingTime));
      manufactureInfo.totalCycleTime = this.checkDirtyProperty('totalCycleTime', fieldColorsList) ? manufacturingObj?.totalCycleTime : this.shareService.isValidNumber(manufactureInfo.totalCycleTime);
    }
    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      manufactureInfo.cycleTime = this.shareService.isValidNumber(Number(manufactureInfo.totalCycleTime));
      manufactureInfo.cycleTime = this.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : this.shareService.isValidNumber(manufactureInfo.cycleTime);
    }
    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      manufactureInfo.setUpTime = this.shareService.isValidNumber(Number(manufactureInfo.setUpTimeBatch) / Number(manufactureInfo.lotSize));
      manufactureInfo.setUpTime = this.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : this.shareService.isValidNumber(manufactureInfo.setUpTime);
    }
    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost != null) {
      manufactureInfo.directMachineCost = this.shareService.isValidNumber(Number(manufactureInfo.directMachineCost));
    } else {
      manufactureInfo.directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) / 3600) * Number(manufactureInfo.totalCycleTime));
      manufactureInfo.directMachineCost = this.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : manufactureInfo.directMachineCost;
    }
    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost != null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      manufactureInfo.directSetUpCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 60) * (Number(manufactureInfo.setUpTime) * Number(manufactureInfo.noOfLowSkilledLabours)) +
        (Number(manufactureInfo.skilledLaborRatePerHour) / 60) * (Number(manufactureInfo.setUpTime) * Number(manufactureInfo.noOfSkilledLabours)) +
        (Number(manufactureInfo.machineHourRate) / 60) * Number(manufactureInfo.setUpTime)
      );
      manufactureInfo.directSetUpCost = this.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.directSetUpCost : manufactureInfo.directSetUpCost;
    }

    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost != null) {
      manufactureInfo.directLaborCost = this.shareService.isValidNumber(Number(manufactureInfo.directLaborCost));
    } else {
      manufactureInfo.directLaborCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) * (Number(manufactureInfo.totalCycleTime) * Number(manufactureInfo.noOfLowSkilledLabours))
      );
      manufactureInfo.directLaborCost = this.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : manufactureInfo.directLaborCost;
    }

    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost != null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      manufactureInfo.inspectionCost = this.shareService.isValidNumber(
        ((Number(manufactureInfo.qaOfInspectorRate) / 60) * Number(manufactureInfo.inspectionTime) * (Number(manufactureInfo.samplingRate ?? 0 / 100) * Number(manufactureInfo.lotSize))) /
        Number(manufactureInfo.lotSize)
      );
      manufactureInfo.inspectionCost = this.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : this.shareService.isValidNumber(manufactureInfo.inspectionCost);
    }

    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost != null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      const sum = this.shareService.isValidNumber(
        Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
      );
      manufactureInfo.yieldCost = this.shareService.isValidNumber(
        (1 - Number(manufactureInfo.yieldPer) / 100) *
        (Number(manufactureInfo.materialInfo?.totalCost ?? 0) - (Number(manufactureInfo.materialInfo?.weight ?? 0) / 1000) * Number(manufactureInfo.materialInfo?.scrapPrice ?? 0) + sum)
      );
      manufactureInfo.yieldCost = this.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : manufactureInfo.yieldCost;
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
  public calculationForCleaningOrVaccumeImpregnation(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      manufactureInfo.setUpTime = (Number(manufactureInfo.setUpTimeBatch) / Number(manufactureInfo.lotSize)) * 60;
      manufactureInfo.setUpTime = this.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : this.shareService.isValidNumber(manufactureInfo.setUpTime);
    }
    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost != null) {
      manufactureInfo.directMachineCost = this.shareService.isValidNumber(Number(manufactureInfo.directMachineCost));
    } else {
      manufactureInfo.directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) / 3600) * Number(manufactureInfo.cycleTime));
      manufactureInfo.directMachineCost = this.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : manufactureInfo.directMachineCost;
    }
    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost != null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      manufactureInfo.directSetUpCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 60) * (Number(manufactureInfo.setUpTime) * Number(manufactureInfo.noOfLowSkilledLabours)) +
        (Number(manufactureInfo.skilledLaborRatePerHour) / 60) * (Number(manufactureInfo.setUpTime) * Number(manufactureInfo.noOfSkilledLabours)) +
        (Number(manufactureInfo.machineHourRate) / 60) * Number(manufactureInfo.setUpTime)
      );
      manufactureInfo.directSetUpCost = this.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.directSetUpCost : manufactureInfo.directSetUpCost;
    }
    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost != null) {
      manufactureInfo.directLaborCost = this.shareService.isValidNumber(Number(manufactureInfo.directLaborCost));
    } else {
      manufactureInfo.directLaborCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) * (Number(manufactureInfo.cycleTime) * Number(manufactureInfo.noOfLowSkilledLabours))
      );
      manufactureInfo.directLaborCost = this.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : manufactureInfo.directLaborCost;
    }

    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost != null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      manufactureInfo.inspectionCost =
        ((Number(manufactureInfo.qaOfInspectorRate) / 60) * Number(manufactureInfo.inspectionTime) * (Number(manufactureInfo.samplingRate ?? 0 / 100) * Number(manufactureInfo.lotSize))) /
        Number(manufactureInfo.lotSize);
      manufactureInfo.inspectionCost = this.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : this.shareService.isValidNumber(manufactureInfo.inspectionCost);
    }

    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost != null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      const sum = this.shareService.isValidNumber(
        Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
      );
      manufactureInfo.yieldCost = this.shareService.isValidNumber(
        (1 - Number(manufactureInfo.yieldPer) / 100) *
        (Number(manufactureInfo.materialInfo?.totalCost ?? 0) - (Number(manufactureInfo.materialInfo?.weight ?? 0) / 1000) * Number(manufactureInfo.materialInfo?.scrapPrice ?? 0) + sum)
      );
      manufactureInfo.yieldCost = this.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : manufactureInfo.yieldCost;
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

  // public calculationForFetling(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): Observable<ProcessInfoDto> {
  public calculationForFetling(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    manufactureInfo.setUpTimeBatch = 20;
    let envLength = 0;
    let envHeight = 0;
    const pouringMaterial = manufactureInfo.materialInfoList?.find((x) => x.secondaryProcessId == SubProcessType.MetalForPouring);
    if (pouringMaterial) {
      envLength = pouringMaterial?.dimX ?? 0;
      envHeight = pouringMaterial?.dimY ?? 0;
    }
    const partLinePerimeter = (Number(envLength) + Number(envHeight)) * 2;
    const inGateDia = 10;
    const raiserDia = 20;
    const noOfIngate = 1;
    const noOfRaiser = 2;
    const gatingSurfaceArea = this.shareService.isValidNumber(0.785 * Math.pow(Number(inGateDia), 2) * Number(noOfIngate) + 0.785 * Math.pow(Number(raiserDia), 2) * Number(noOfRaiser));
    const gateCuttingSpeed = 10;
    const loadingTime = 30;
    const gateCuttingTime = Number(gatingSurfaceArea) / Number(gateCuttingSpeed);
    const gateGridingTime = 10;
    const partingLineGridingTime = Number(partLinePerimeter) / Number(gateCuttingSpeed);
    const unloadingTime = 30;
    const totalCycleTime = Number(loadingTime) + Number(gateCuttingTime) + Number(gateGridingTime) + Number(partingLineGridingTime) + Number(unloadingTime);

    manufactureInfo.totalCycleTime = this.shareService.isValidNumber(Number(totalCycleTime));
    manufactureInfo.cycleTime = this.shareService.isValidNumber(Number(totalCycleTime));

    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      manufactureInfo.setUpTime = this.shareService.isValidNumber(Number(manufactureInfo.setUpTimeBatch) / Number(manufactureInfo?.lotSize));
      manufactureInfo.setUpTime = this.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : this.shareService.isValidNumber(manufactureInfo.setUpTime);
    }
    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost != null) {
      manufactureInfo.directMachineCost = this.shareService.isValidNumber(Number(manufactureInfo.directMachineCost));
    } else {
      manufactureInfo.directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) / 3600) * Number(manufactureInfo.totalCycleTime));
      manufactureInfo.directMachineCost = this.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : manufactureInfo.directMachineCost;
    }

    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost != null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      manufactureInfo.directSetUpCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 60) * (Number(manufactureInfo.setUpTime) * Number(manufactureInfo.noOfLowSkilledLabours)) +
        (Number(manufactureInfo.skilledLaborRatePerHour) / 60) * (Number(manufactureInfo.setUpTime) * Number(manufactureInfo.noOfSkilledLabours)) +
        (Number(manufactureInfo.machineHourRate) / 60) * Number(manufactureInfo.setUpTime)
      );
      manufactureInfo.directSetUpCost = this.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.directSetUpCost : manufactureInfo.directSetUpCost;
    }

    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost != null) {
      manufactureInfo.directLaborCost = this.shareService.isValidNumber(Number(manufactureInfo.directLaborCost));
    } else {
      manufactureInfo.directLaborCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) * (Number(manufactureInfo.cycleTime) * Number(manufactureInfo.noOfLowSkilledLabours))
      );
      manufactureInfo.directLaborCost = this.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : manufactureInfo.directLaborCost;
    }

    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost != null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      manufactureInfo.inspectionCost = this.shareService.isValidNumber(
        ((Number(manufactureInfo.qaOfInspectorRate) / 60) * Number(manufactureInfo.inspectionTime) * (Number(manufactureInfo.samplingRate ?? 0 / 100) * Number(manufactureInfo.lotSize))) /
        Number(manufactureInfo.lotSize)
      );
      manufactureInfo.inspectionCost = this.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : this.shareService.isValidNumber(manufactureInfo.inspectionCost);
    }

    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost != null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      const sum = this.shareService.isValidNumber(
        Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
      );
      manufactureInfo.yieldCost = this.shareService.isValidNumber(
        (1 - Number(manufactureInfo.yieldPer) / 100) *
        (Number(manufactureInfo.materialInfo?.totalCost ?? 0) - (Number(manufactureInfo.materialInfo?.weight ?? 0) / 1000) * Number(manufactureInfo.materialInfo?.scrapPrice ?? 0) + sum)
      );
      manufactureInfo.yieldCost = this.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : manufactureInfo.yieldCost;
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
    //   obs.next(manufactureInfo);
    // });
    return manufactureInfo;
  }

  public calculationForShotBlasting(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    manufactureInfo.setUpTimeBatch = 30;
    const volume = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.partVolume;
    if (manufactureInfo.isnoOfPartsDirty && manufactureInfo.noOfParts != null) {
      manufactureInfo.noOfParts = Number(manufactureInfo.noOfParts);
    } else {
      let noOfPartsStacked = Math.round((Number(manufactureInfo.machineCapacity) / Number(volume)) * Number(manufactureInfo.utilisation ?? 0 / 100));
      if (manufactureInfo.noOfParts != null) {
        noOfPartsStacked = this.checkDirtyProperty('noOfParts', fieldColorsList) ? manufacturingObj?.noOfParts ?? 0 : noOfPartsStacked;
      }
      manufactureInfo.noOfParts = noOfPartsStacked;
    }
    const loadingTimePerBatch = 75;
    const shortBlastingTime = 1800;
    const unLoadingTimePerBatch = 75;
    manufactureInfo.cycleTime = this.shareService.isValidNumber((Number(loadingTimePerBatch) + Number(shortBlastingTime) + Number(unLoadingTimePerBatch)) / Number(manufactureInfo.noOfParts));
    manufactureInfo.totalCycleTime = this.shareService.isValidNumber(Number(manufactureInfo.cycleTime));

    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      manufactureInfo.setUpTime = this.shareService.isValidNumber(Number(manufactureInfo.setUpTimeBatch) / Number(manufactureInfo?.lotSize));
      manufactureInfo.setUpTime = this.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : this.shareService.isValidNumber(manufactureInfo.setUpTime);
    }

    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost != null) {
      manufactureInfo.directMachineCost = this.shareService.isValidNumber(Number(manufactureInfo.directMachineCost));
    } else {
      manufactureInfo.directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) / 3600) * Number(manufactureInfo.cycleTime));
      manufactureInfo.directMachineCost = this.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : manufactureInfo.directMachineCost;
    }

    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost != null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      manufactureInfo.directSetUpCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 60) * (Number(manufactureInfo.setUpTime) * Number(manufactureInfo.noOfLowSkilledLabours)) +
        (Number(manufactureInfo.skilledLaborRatePerHour) / 60) * (Number(manufactureInfo.setUpTime) * Number(manufactureInfo.noOfSkilledLabours)) +
        (Number(manufactureInfo.machineHourRate) / 60) * Number(manufactureInfo.setUpTime)
      );
      manufactureInfo.directSetUpCost = this.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.directSetUpCost : manufactureInfo.directSetUpCost;
    }

    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost != null) {
      manufactureInfo.directLaborCost = this.shareService.isValidNumber(Number(manufactureInfo.directLaborCost));
    } else {
      manufactureInfo.directLaborCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) * (Number(manufactureInfo.cycleTime) * Number(manufactureInfo.noOfLowSkilledLabours))
      );
      manufactureInfo.directLaborCost = this.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : manufactureInfo.directLaborCost;
    }
    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost != null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      manufactureInfo.inspectionCost = this.shareService.isValidNumber(
        ((Number(manufactureInfo.qaOfInspectorRate) / 60) * Number(manufactureInfo.inspectionTime) * (Number(manufactureInfo.samplingRate ?? 0 / 100) * Number(manufactureInfo?.lotSize))) /
        Number(manufactureInfo?.lotSize)
      );
      manufactureInfo.inspectionCost = this.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : this.shareService.isValidNumber(manufactureInfo.inspectionCost);
    }

    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost != null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      const sum = this.shareService.isValidNumber(
        Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
      );
      manufactureInfo.yieldCost = this.shareService.isValidNumber(
        (1 - Number(manufactureInfo.yieldPer) / 100) *
        (Number(manufactureInfo.materialInfo?.totalCost ?? 0) - (Number(manufactureInfo.materialInfo?.weight ?? 0) / 1000) * Number(manufactureInfo.materialInfo?.scrapPrice ?? 0) + sum)
      );
      manufactureInfo.yieldCost = this.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : manufactureInfo.yieldCost;
    }
    manufactureInfo.directProcessCost = this.shareService.isValidNumber(
      Number(manufactureInfo.directLaborCost) +
      Number(manufactureInfo.directMachineCost) +
      Number(manufactureInfo.directSetUpCost) +
      Number(manufactureInfo.inspectionCost) +
      Number(manufactureInfo.yieldCost)
    );

    ////manufactureInfo = this.calculateESGCosts(manufactureInfo, fieldColorsList, manufacturingObj);
    return manufactureInfo;
  }

  public calculateForgingStockShearing(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    const stockLength = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.blockLength;
    if (manufactureInfo.iscuttingAreaDirty && manufactureInfo.cuttingArea != null) {
      manufactureInfo.cuttingArea = Number(manufactureInfo.cuttingArea);
    } else {
      manufactureInfo.cuttingArea = this.shareService.isValidNumber((3.14 / 4) * Math.pow(Number(stockLength), 2));
      manufactureInfo.cuttingArea = this.checkDirtyProperty('cuttingArea', fieldColorsList) ? manufacturingObj?.cuttingArea : manufactureInfo.cuttingArea;
    }
    const theoreticalForce = this.shareService.isValidNumber((Number(manufactureInfo.cuttingArea) * Number(manufactureInfo.materialmasterDatas.shearingStrength)) / 9810);
    manufactureInfo.recommendTonnage = this.shareService.isValidNumber(Number(theoreticalForce) * 1.25);

    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = this.shareService.isValidNumber(Number(manufactureInfo.cycleTime));
    } else {
      let cycleTime = this.shareService.isValidNumber(60 / (Number(manufactureInfo?.machineMaster?.strokeRateMin) * Number(80 / 100)));
      if (manufactureInfo.cycleTime != null) cycleTime = this.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      manufactureInfo.cycleTime = cycleTime;
    }

    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      let setUpTime = this.shareService.isValidNumber((60 / Number(manufactureInfo?.lotSize)) * 60);
      if (manufactureInfo.setUpTime != null) setUpTime = this.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : this.shareService.isValidNumber(setUpTime);
      manufactureInfo.setUpTime = setUpTime;
    }
    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost != null) {
      manufactureInfo.directMachineCost = this.shareService.isValidNumber(Number(manufactureInfo.directMachineCost));
    } else {
      let directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) / 3600) * Number(manufactureInfo.cycleTime));
      if (manufactureInfo.directMachineCost != null) directMachineCost = this.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : directMachineCost;
      manufactureInfo.directMachineCost = directMachineCost;
    }

    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost != null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      let directSetUpCost =
        (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 60) * (Number(manufactureInfo.setUpTime) * Number(manufactureInfo.noOfLowSkilledLabours)) +
        (Number(manufactureInfo.skilledLaborRatePerHour) / 60) * (Number(manufactureInfo.setUpTime) * Number(manufactureInfo.noOfSkilledLabours)) +
        (Number(manufactureInfo.machineHourRate) / 60) * Number(manufactureInfo.setUpTime);
      if (manufactureInfo.directSetUpCost != null) directSetUpCost = this.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.directSetUpCost : directSetUpCost;
      manufactureInfo.directSetUpCost = directSetUpCost;
    }

    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost != null) {
      manufactureInfo.directLaborCost = this.shareService.isValidNumber(Number(manufactureInfo.directLaborCost));
    } else {
      let directLaborCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) * (Number(manufactureInfo.cycleTime) * Number(manufactureInfo.noOfLowSkilledLabours))
      );
      if (manufactureInfo.directLaborCost != null) directLaborCost = this.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : directLaborCost;
      manufactureInfo.directLaborCost = directLaborCost;
    }
    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost != null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      let inspectionCost = this.shareService.isValidNumber(
        ((Number(manufactureInfo.qaOfInspectorRate) / 60) * Number(manufactureInfo.inspectionTime) * (Number(manufactureInfo.samplingRate ?? 0 / 100) * Number(manufactureInfo?.lotSize))) /
        Number(manufactureInfo?.lotSize)
      );
      if (manufactureInfo.inspectionCost != null)
        inspectionCost = this.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : this.shareService.isValidNumber(inspectionCost);
      manufactureInfo.inspectionCost = inspectionCost;
    }

    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost != null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      const sum = this.shareService.isValidNumber(
        Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
      );
      let yieldCost = this.shareService.isValidNumber(
        (1 - Number(manufactureInfo.yieldPer) / 100) *
        (Number(manufactureInfo.materialInfo?.totalCost ?? 0) - (Number(manufactureInfo.materialInfo?.weight ?? 0) / 1000) * Number(manufactureInfo.materialInfo?.scrapPrice ?? 0) + sum)
      );
      if (manufactureInfo.yieldCost != null) yieldCost = this.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : yieldCost;
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
    return manufactureInfo;
  }

  // public calculateForgingStockHeating(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): Observable<ProcessInfoDto> {
  public calculateForgingStockHeating(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    const stockLength = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.blockLength;
    const stockWidth = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.blockWidth;
    const grossWeight = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.grossWeight;
    if (manufactureInfo.isnoOfPartsDirty && manufactureInfo.noOfParts != null) {
      manufactureInfo.noOfParts = Number(manufactureInfo.noOfParts);
    } else {
      manufactureInfo.noOfParts = this.shareService.isValidNumber(Math.round((manufactureInfo.muffleLength ?? 0 * (manufactureInfo.muffleWidth ?? 0)) / ((stockLength ?? 0) * (stockWidth ?? 0))));
      manufactureInfo.noOfParts = this.checkDirtyProperty('noOfParts', fieldColorsList) ? manufacturingObj?.noOfParts : manufactureInfo.noOfParts;
    }
    const muffleQty = Number(manufactureInfo.noOfParts) * Number(grossWeight);
    if (manufactureInfo.isfinalTempDirty && manufactureInfo.finalTemp != null) {
      manufactureInfo.finalTemp = Number(manufactureInfo.finalTemp);
    } else {
      manufactureInfo.finalTemp = manufactureInfo.materialmasterDatas.finalTemperature;
      manufactureInfo.finalTemp = this.checkDirtyProperty('finalTemp', fieldColorsList) ? manufacturingObj?.finalTemp : manufactureInfo.finalTemp;
    }

    if (manufactureInfo.issoakingTimeDirty && manufactureInfo.soakingTime != null) {
      manufactureInfo.soakingTime = Number(manufactureInfo.soakingTime);
    } else {
      manufactureInfo.soakingTime = Number(manufactureInfo.materialmasterDatas.soakingTime);
      manufactureInfo.soakingTime = this.checkDirtyProperty('soakingTime', fieldColorsList) ? manufacturingObj?.soakingTime : manufactureInfo.soakingTime;
    }
    const batchHeatingTime = this.shareService.isValidNumber(
      ((Number(muffleQty) / 1000) * Number(manufactureInfo?.machineMaster?.specificHeat) * (Number(manufactureInfo.finalTemp) - Number(manufactureInfo.initialTemp))) /
      (Number(manufactureInfo?.machineMaster?.ratedPower) * 1000 * Number(manufactureInfo.furanceEfficiency)) +
      Number(manufactureInfo.soakingTime)
    );

    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = this.shareService.isValidNumber(Number(manufactureInfo.cycleTime));
    } else {
      let cycleTime = this.shareService.isValidNumber(Number(batchHeatingTime) / Number(manufactureInfo.noOfParts));
      if (manufactureInfo.cycleTime != null) cycleTime = this.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : cycleTime;
      manufactureInfo.cycleTime = cycleTime;
    }

    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      let setUpTime = this.shareService.isValidNumber((Number(manufactureInfo.setUpTimeBatch) / Number(manufactureInfo?.lotSize)) * 60);
      if (manufactureInfo.setUpTime != null) setUpTime = this.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : this.shareService.isValidNumber(setUpTime);
      manufactureInfo.setUpTime = setUpTime;
    }

    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost != null) {
      manufactureInfo.directMachineCost = this.shareService.isValidNumber(Number(manufactureInfo.directMachineCost));
    } else {
      let directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) / 3600) * Number(manufactureInfo.cycleTime));
      if (manufactureInfo.directMachineCost != null) directMachineCost = this.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : directMachineCost;
      manufactureInfo.directMachineCost = directMachineCost;
    }

    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost != null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      let directSetUpCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 60) * (Number(manufactureInfo.setUpTime) * Number(manufactureInfo.noOfLowSkilledLabours)) +
        (Number(manufactureInfo.skilledLaborRatePerHour) / 60) * (Number(manufactureInfo.setUpTime) * Number(manufactureInfo.noOfSkilledLabours)) +
        (Number(manufactureInfo.machineHourRate) / 60) * Number(manufactureInfo.setUpTime)
      );
      if (manufactureInfo.directSetUpCost != null) directSetUpCost = this.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.directSetUpCost : directSetUpCost;
      manufactureInfo.directSetUpCost = directSetUpCost;
    }

    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost != null) {
      manufactureInfo.directLaborCost = this.shareService.isValidNumber(Number(manufactureInfo.directLaborCost));
    } else {
      let directLaborCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) * (Number(manufactureInfo.cycleTime) * Number(manufactureInfo.noOfLowSkilledLabours))
      );
      if (manufactureInfo.directLaborCost != null) directLaborCost = this.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : directLaborCost;
      manufactureInfo.directLaborCost = directLaborCost;
    }

    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost != null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      let inspectionCost =
        ((Number(manufactureInfo.qaOfInspectorRate) / 60) * Number(manufactureInfo.inspectionTime) * (Number(manufactureInfo.samplingRate ?? 0 / 100) * Number(manufactureInfo?.lotSize))) /
        Number(manufactureInfo?.lotSize);
      if (manufactureInfo.inspectionCost != null)
        inspectionCost = this.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : this.shareService.isValidNumber(inspectionCost);
      manufactureInfo.inspectionCost = inspectionCost;
    }

    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost != null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      const sum = this.shareService.isValidNumber(
        Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
      );
      let yieldCost = this.shareService.isValidNumber(
        (1 - Number(manufactureInfo.yieldPer) / 100) *
        (Number(manufactureInfo.materialInfo?.totalCost ?? 0) - ((Number(manufactureInfo.materialInfo?.weight ?? 0) / 1000) * Number(manufactureInfo.materialInfo?.scrapPrice ?? 0)) + sum)
      );
      if (manufactureInfo.yieldCost != null) yieldCost = this.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : yieldCost;
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
    //   obs.next(manufactureInfo);
    // });
    return manufactureInfo;
  }


  public calculateHotForgingOpenClosedDieHot(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    const length = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.dimX;
    const width = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.dimY;
    const dataManu = this._costingConfig.machineTypeManufacturingData().find((x) => x.id === Number(manufactureInfo.semiAutoOrAuto));
    let bourdanRate = 0;

    if (manufactureInfo.isbourdanRateDirty && manufactureInfo.bourdanRate != null) {
      manufactureInfo.bourdanRate = Number(manufactureInfo.bourdanRate);
    } else {
      bourdanRate = dataManu?.BourdanRate ?? 0;
      if (manufactureInfo.bourdanRate != null) bourdanRate = this.checkDirtyProperty('bourdanRate', fieldColorsList) ? manufacturingObj?.bourdanRate ?? 0 : this.shareService.isValidNumber(bourdanRate);
    }
    manufactureInfo.bourdanRate = bourdanRate;

    if (manufactureInfo.ismachineHourRateDirty && manufactureInfo.machineHourRate != null) {
      manufactureInfo.machineHourRate = Number(manufactureInfo.machineHourRate);
    } else {
      const bourdanRate = manufactureInfo?.bourdanRate || 100;
      let machineHourRate = this.shareService.isValidNumber(manufactureInfo?.machineMaster.machineHourRate * Number(bourdanRate / 100));

      if (manufactureInfo.machineHourRate != null) {
        machineHourRate = this.checkDirtyProperty('machineHourRate', fieldColorsList) ? manufacturingObj?.machineHourRate ?? 0 : machineHourRate;
      }
      manufactureInfo.machineHourRate = machineHourRate;
    }

    if (manufactureInfo.isNoOfLowSkilledLaboursDirty && manufactureInfo.noOfLowSkilledLabours != null) {
      manufactureInfo.noOfLowSkilledLabours = this.shareService.isValidNumber(Number(manufactureInfo.noOfLowSkilledLabours));
    } else {
      let noOfLowSkilledLabours = Number(dataManu?.DirectLabour);
      if (manufactureInfo.noOfLowSkilledLabours != null) {
        noOfLowSkilledLabours = this.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList) ? manufacturingObj?.noOfLowSkilledLabours : this.shareService.isValidNumber(noOfLowSkilledLabours);
      }
      manufactureInfo.noOfLowSkilledLabours = noOfLowSkilledLabours;
    }

    if (manufactureInfo.ispartEnvelopHeightDirty && manufactureInfo.partEnvelopHeight != null) {
      manufactureInfo.partEnvelopHeight = Number(manufactureInfo.partEnvelopHeight);
    } else {
      manufactureInfo.partEnvelopHeight = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.dimZ;
      manufactureInfo.partEnvelopHeight = this.checkDirtyProperty('partEnvelopHeight', fieldColorsList) ? manufacturingObj?.partEnvelopHeight : manufactureInfo.partEnvelopHeight;
    }

    if (manufactureInfo.isinitialStockHeightDirty && manufactureInfo.initialStockHeight != null) {
      manufactureInfo.initialStockHeight = Number(manufactureInfo.initialStockHeight);
    } else {
      manufactureInfo.initialStockHeight = manufactureInfo.materialInfoList?.length && manufactureInfo.materialInfoList[0]?.blockHeight;
      manufactureInfo.initialStockHeight = this.checkDirtyProperty('initialStockHeight', fieldColorsList) ? manufacturingObj?.initialStockHeight : manufactureInfo.initialStockHeight;
    }
    if (manufactureInfo.isforgingShapeFactorDirty && manufactureInfo.forgingShapeFactor != null) {
      manufactureInfo.forgingShapeFactor = Number(manufactureInfo.forgingShapeFactor);
    } else {
      let forgingShapeFactor = this._costingConfig.partComplexityValues()?.find((x) => x.id == manufactureInfo?.inspectionType)?.ShapeFactor || 0;

      if (manufactureInfo.forgingShapeFactor != null) {
        forgingShapeFactor = this.checkDirtyProperty('forgingShapeFactor', fieldColorsList) ? manufacturingObj?.forgingShapeFactor ?? 0 : forgingShapeFactor;
      }
      manufactureInfo.forgingShapeFactor = forgingShapeFactor;
    }
    if (manufactureInfo.ispartAreaDirty && manufactureInfo.partArea != null) {
      manufactureInfo.partArea = Number(manufactureInfo.partArea);
    } else {
      let partArea = Number(length) * Number(width);
      if (manufactureInfo.partArea != null) {
        partArea = this.checkDirtyProperty('partArea', fieldColorsList) ? manufacturingObj?.partArea ?? 0 : partArea;
      }
      manufactureInfo.partArea = partArea;
    }

    if (manufactureInfo.isflashAreaDirty && manufactureInfo.flashArea != null) {
      manufactureInfo.flashArea = Number(manufactureInfo.flashArea);
    } else {
      let flashArea = this.shareService.isValidNumber(Number(manufactureInfo.partArea) * Number(10 / 100));
      if (manufactureInfo.flashArea != null) {
        flashArea = this.checkDirtyProperty('flashArea', fieldColorsList) ? manufacturingObj?.flashArea ?? 0 : flashArea;
      }
      manufactureInfo.flashArea = flashArea;
    }

    const strain = this.shareService.isValidNumber((Number(manufactureInfo.initialStockHeight) - Number(manufactureInfo.partEnvelopHeight)) / Number(manufactureInfo.initialStockHeight));
    const flowStress = this.shareService.isValidNumber(
      Number(manufactureInfo.materialmasterDatas.strengthCoEfficient) * Math.pow(Math.log(1 + Number(strain)), Number(manufactureInfo.materialmasterDatas.strainHardeningExponent))
    );
    const forceRequired = this.shareService.isValidNumber(
      (Number(flowStress) * (Number(manufactureInfo.partArea) + Number(manufactureInfo.flashArea)) * Number(manufactureInfo.forgingShapeFactor)) / 1000
    );
    const theoriticalForcce = this.shareService.isValidNumber(Number(forceRequired) / 9810);
    manufactureInfo.recommendTonnage = this.shareService.isValidNumber(Number(theoriticalForcce) * 1.25);

    const handlingInfo = dataManu?.Handlingtime || 0;
    let stockLoadUloadTime = 0;
    if (handlingInfo) {
      stockLoadUloadTime = Number(handlingInfo);
    }

    const toolLoadingInfo = manufactureInfo.toolLoadingTimeList?.filter((x) => x.tonnage > Number(manufactureInfo.recommendTonnage) && x.toolType == ToolType.PressMachine).sort((s) => s.tonnage);
    const toolLoadingTIme = toolLoadingInfo[0]?.toolLoadingTime;

    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = this.shareService.isValidNumber(Number(manufactureInfo.cycleTime));
    } else {
      let cycleTime = this.shareService.isValidNumber(Number(manufactureInfo.forgingShapeFactor) * Number(manufactureInfo.noOfHitsRequired) + Number(stockLoadUloadTime));
      if (manufactureInfo.cycleTime != null) {
        cycleTime = this.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime ?? 0 : cycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }
    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      let setUpTime = this.shareService.isValidNumber(Number(toolLoadingTIme) / (manufactureInfo?.lotSize ?? 0));
      if (manufactureInfo.setUpTime != null) setUpTime = this.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime ?? 0 : this.shareService.isValidNumber(setUpTime);
      manufactureInfo.setUpTime = setUpTime;
    }

    if (manufactureInfo.isinspectionTimeDirty && manufactureInfo.inspectionTime != null) {
      manufactureInfo.inspectionTime = Number(manufactureInfo.inspectionTime);
    } else {
      let inspectionTime =
        manufactureInfo?.partComplexity == PartComplexity.Low ? 5 : manufactureInfo?.partComplexity == PartComplexity.Medium ? 10 : manufactureInfo?.partComplexity == PartComplexity.High ? 20 : 0;
      if (manufactureInfo.inspectionTime != null) inspectionTime = this.checkDirtyProperty('inspectionTime', fieldColorsList) ? manufacturingObj?.inspectionTime : inspectionTime;
      manufactureInfo.inspectionTime = inspectionTime;
    }

    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost != null) {
      manufactureInfo.directMachineCost = this.shareService.isValidNumber(Number(manufactureInfo.directMachineCost));
    } else {
      let directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) / 3600) * Number(manufactureInfo.cycleTime));
      if (manufactureInfo.directMachineCost != null) directMachineCost = this.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : directMachineCost;
      manufactureInfo.directMachineCost = directMachineCost;
    }

    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost != null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      let directSetUpCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 60) * (Number(manufactureInfo.setUpTime) * Number(manufactureInfo.noOfLowSkilledLabours)) +
        (Number(manufactureInfo.skilledLaborRatePerHour) / 60) * (Number(manufactureInfo.setUpTime) * Number(manufactureInfo.noOfSkilledLabours)) +
        (Number(manufactureInfo.machineHourRate) / 60) * Number(manufactureInfo.setUpTime)
      );
      if (manufactureInfo.directSetUpCost != null) directSetUpCost = this.checkDirtyProperty('directSetUpCost', fieldColorsList) ? manufacturingObj?.directSetUpCost : directSetUpCost;
      manufactureInfo.directSetUpCost = directSetUpCost;
    }

    if (manufactureInfo.isdirectLaborCostDirty && manufactureInfo.directLaborCost != null) {
      manufactureInfo.directLaborCost = this.shareService.isValidNumber(Number(manufactureInfo.directLaborCost));
    } else {
      let directLaborCost = this.shareService.isValidNumber(
        (Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) * (Number(manufactureInfo.cycleTime) * Number(manufactureInfo.noOfLowSkilledLabours)) * Number(dataManu?.DirectLabour)
      );
      if (manufactureInfo.directLaborCost != null) directLaborCost = this.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : directLaborCost;
      manufactureInfo.directLaborCost = directLaborCost;
    }
    if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost != null) {
      manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
    } else {
      let inspectionCost =
        ((Number(manufactureInfo.qaOfInspectorRate) / 60) * Number(manufactureInfo.inspectionTime) * (Number(manufactureInfo.samplingRate ?? 0 / 100) * Number(manufactureInfo?.lotSize))) /
        Number(manufactureInfo?.lotSize);
      if (manufactureInfo.inspectionCost != null)
        inspectionCost = this.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : this.shareService.isValidNumber(inspectionCost);
      manufactureInfo.inspectionCost = inspectionCost;
    }

    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost != null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      const sum = this.shareService.isValidNumber(
        Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.inspectionCost)
      );
      let yieldCost = this.shareService.isValidNumber(
        (1 - Number(manufactureInfo.yieldPer) / 100) *
        (Number(manufactureInfo.materialInfo?.totalCost ?? 0) - ((Number(manufactureInfo.materialInfo?.weight ?? 0) / 1000) * Number(manufactureInfo.materialInfo?.scrapPrice ?? 0)) + sum)
      );
      if (manufactureInfo.yieldCost != null) {
        yieldCost = this.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : yieldCost;
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
    return manufactureInfo;
  }

  public setCommonObjectValues(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto) {
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
    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      let setUpTime = manufactureInfo.setUpTime;
      if (
        [
          ProcessType.LaserCutting,
          ProcessType.PlasmaCutting,
          ProcessType.OxyCutting,
          ProcessType.Deburring,
          ProcessType.MechanicalJoints,
          ProcessType.WeldingCleaning,
          ProcessType.WeldingPreparation,
        ].includes(manufactureInfo.processTypeID ?? 0)
      ) {
        setUpTime =
          Math.round(manufactureInfo.setUpTime) ||
          Math.round(Number(manufactureInfo?.machineMaster?.machineMarketDtos.length > 0 ? manufactureInfo?.machineMaster?.machineMarketDtos[0].setUpTimeInHour : 0) * 60);
      }
      manufactureInfo.setUpTime = this.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : this.shareService.isValidNumber(setUpTime);
    }
    if (manufactureInfo.isefficiencyDirty && manufactureInfo.efficiency != null) {
      manufactureInfo.efficiency = Number(manufactureInfo.efficiency);
    } else {
      if (manufactureInfo.efficiency != null)
        manufactureInfo.efficiency = this.checkDirtyProperty('efficiency', fieldColorsList) ? manufacturingObj?.efficiency : this.shareService.isValidNumber(manufactureInfo.efficiency);
    }

    if (manufactureInfo.isinspectionTimeDirty && manufactureInfo.inspectionTime != null) {
      manufactureInfo.inspectionTime = Number(manufactureInfo.inspectionTime);
    } else {
      let inspectionTime =
        manufactureInfo?.partComplexity == PartComplexity.Low ? 5 : manufactureInfo?.partComplexity == PartComplexity.Medium ? 10 : manufactureInfo?.partComplexity == PartComplexity.High ? 20 : 0;
      if (manufactureInfo.inspectionTime != null) {
        inspectionTime = this.checkDirtyProperty('inspectionTime', fieldColorsList) ? manufacturingObj?.inspectionTime : inspectionTime;
      }
      manufactureInfo.inspectionTime = inspectionTime;
    }

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
