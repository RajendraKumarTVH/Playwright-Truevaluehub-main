import { ProcessInfoDto } from 'src/app/shared/models';
import { SharedService } from './shared';
import { ProcessType } from '../enums';

export class SemiRigidFlexCalculatorService {
  constructor(
    private shareService: SharedService,
    private configService: any,
    private pcbconfigService: any
  ) { }

  public doCostCalculationForSemiRigidFlex(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): any {
    let totalCycleTime = 0;
    const materialInfo: any = manufactureInfo?.materialInfoList?.length > 0 ? manufactureInfo?.materialInfoList[0] : null;
    const noOfPCB = (materialInfo?.coilWeight || 0) * (materialInfo?.partOuterDiameter || 0) * (materialInfo?.txtWindows || 0);
    const drillList: any[] = materialInfo?.coreCostDetails?.filter((x: any) => x.noOfCore === 4)?.sort((a: any, b: any) => (a.coreLength < b.coreLength ? -1 : 1)) || [];
    const layerConstruction = Number(materialInfo?.mainInsulatorID);
    const foilParameter = this.shareService.isValidNumber((materialInfo?.typeOfWeld || 0) / 2);
    const outerLayerFinish = this.shareService.isValidNumber(this.pcbconfigService.getCopperThicknessList()?.find((x: any) => x.id === materialInfo?.primerMatPrice)?.name);

    for (let i = 0; i < (manufactureInfo.subProcessFormArray as any)?.controls?.length; i++) {
      const info = (manufactureInfo.subProcessFormArray as any)?.controls[i];
      let cycleTime = 0;
      const shortestSide = ((materialInfo?.coilDiameter || 0) * 2.54) / 100;
      const longestSide = ((materialInfo?.partInnerDiameter || 0) * 2.54) / 100;
      const areaOfArray = (materialInfo?.ejectionTime || 0) * (materialInfo?.pickPlaceTime || 0);
      if (Number(manufactureInfo?.processTypeID) === ProcessType.InnerLayer) {
        if (Number(info.value.subProcessTypeID) === 1) { // PreTreatment
          cycleTime =
            layerConstruction === 1 // Foil
              ? this.shareService.isValidNumber((((shortestSide + 0.1) / 3.5) * 60 * materialInfo.stockLength) / noOfPCB)
              : this.shareService.isValidNumber(((((shortestSide + 0.1) / 3.5) * 60 * materialInfo.stockLength) / noOfPCB) * foilParameter);
        } else if (Number(info.value.subProcessTypeID) === 2) { // CoatingDryFilmLamination
          cycleTime =
            layerConstruction === 1 // Foil
              ? this.shareService.isValidNumber(((shortestSide / 2.3) * 60 * materialInfo.stockLength) / noOfPCB)
              : this.shareService.isValidNumber((((shortestSide / 2.3) * 60 * materialInfo.stockLength) / noOfPCB) * foilParameter);
        } else if (Number(info.value.subProcessTypeID) === 3) { // AutomaticExposure
          const factor = Number(materialInfo?.primaryCount) == 1 ? 51 : 27;
          cycleTime =
            layerConstruction === 1 // Foil
              ? this.shareService.isValidNumber((factor * materialInfo.stockLength) / noOfPCB)
              : this.shareService.isValidNumber(((factor * materialInfo.stockLength) / noOfPCB) * foilParameter);
        } else if (Number(info.value.subProcessTypeID) === 4) { // DES
          const factor =
            Number(materialInfo?.primaryCount) == 1
              ? (((shortestSide + 0.1) / 0.25) * 60 * Number(materialInfo.stockLength)) / noOfPCB
              : (((shortestSide + 0.1) / 0.5) * 60 * Number(materialInfo.stockLength)) / noOfPCB;
          cycleTime = layerConstruction === 1 ? this.shareService.isValidNumber(factor * 3) : this.shareService.isValidNumber(factor * 3 * foilParameter);
        } else if (Number(info.value.subProcessTypeID) === 5) { // AOIScanning
          const factor = Number(materialInfo?.primaryCount) == 1 ? areaOfArray / 5200 : areaOfArray / 8200;
          cycleTime =
            layerConstruction === 1 // Foil
              ? this.shareService.isValidNumber(factor * materialInfo.stockLength)
              : this.shareService.isValidNumber(factor * materialInfo.stockLength) * foilParameter;
        } else if (Number(info.value.subProcessTypeID) === 6) { // AOIVerification
          const factor = Number(materialInfo?.primaryCount) == 1 ? 10 : 7;
          cycleTime =
            layerConstruction === 1 // Foil
              ? this.shareService.isValidNumber(factor * materialInfo.stockLength)
              : this.shareService.isValidNumber(factor * materialInfo.stockLength) * foilParameter;
        } else if (Number(info.value.subProcessTypeID) === 7) { // LaserCuttingCoreDepth
          const pcbArea = Number(materialInfo.openingTime) * Number(materialInfo.colorantPer);
          cycleTime = (pcbArea * (20 / 100)) / 60;
        } else if (Number(info.value.subProcessTypeID) === 8) { // LCUTDesmear
          cycleTime = (Number(materialInfo?.primaryCount) == 1 ? 20 : 15) / noOfPCB;
        } else if (Number(info.value.subProcessTypeID) === 9) { // ReleaseLayerPrinting
          cycleTime = this.shareService.isValidNumber((Number(materialInfo?.cavityEnvelopLength) === 1 ? 40 : Number(materialInfo?.cavityEnvelopLength) === 2 ? 65 : 0) / noOfPCB);
        }
      } else if (Number(manufactureInfo?.processTypeID) === ProcessType.LaminationBonding) {
        if (Number(info.value.subProcessTypeID) === 1) { // CCDTargetDrill
          cycleTime = (6 * Number(materialInfo?.stockLength)) / noOfPCB;
        } else if (Number(info.value.subProcessTypeID) === 2) { // BrownOxidizationLine
          cycleTime = (((shortestSide + 0.1) / 3.8) * 60) / noOfPCB;
        } else if (Number(info.value.subProcessTypeID) === 3) { // PPCutting
          const factor = Number(materialInfo?.typeOfWeld) > 3 ? 2 * (Number(materialInfo?.typeOfWeld) / 2) : 0;
          cycleTime = factor / noOfPCB;
        } else if (Number(info.value.subProcessTypeID) === 4) { // Rivet
          const factor = Number(materialInfo?.typeOfWeld) === 4 ? 35 : Number(materialInfo?.typeOfWeld) === 6 ? 130 : Number(materialInfo?.typeOfWeld) === 8 ? 175 : 220;
          cycleTime = factor / noOfPCB;
        } else if (Number(info.value.subProcessTypeID) === 5) { // Press
          const thickness = Number(materialInfo.totalCableLength) / 1000;
          cycleTime = (thickness > 1.6 ? 5400 / 18 : 5400 / 24) / noOfPCB;
        } else if (Number(info.value.subProcessTypeID) === 6) { // EdgeRouting
          const routingARea = (longestSide + shortestSide) * 2;
          cycleTime = routingARea / 0.2 / noOfPCB;
        }
      } else if (Number(manufactureInfo?.processTypeID) === ProcessType.PCBDrilling) {
        if (Number(info.value.subProcessTypeID) === 1) { // XRayDrilling
          cycleTime = (Number(materialInfo?.typeOfWeld) > 2 ? 8 : 0) / noOfPCB;
        } else if (Number(info.value.subProcessTypeID) === 2) { // THDrilling
          const Noofdrillsperboard = Number(materialInfo.stockCrossSectionHeight);
          const NoofboardsperArray = Number(materialInfo.txtWindows);
          const NoofArrayperpanel = Number(materialInfo.coilWeight) * Number(materialInfo.partOuterDiameter);
          const NoofdrillsperArray = Noofdrillsperboard * NoofboardsperArray + 4;
          const Noofdrillsperpanel = NoofdrillsperArray * NoofArrayperpanel + 20;
          const minDia = drillList[0]?.coreLength;
          const thickness = Math.round((Number(materialInfo?.totalCableLength) / 1000) * 10) / 10;
          const Noofpanelsperstack = this.configService.getDrillingLookupList(thickness, minDia) || 0;
          const Noofdrillsperstack = Noofdrillsperpanel * Noofpanelsperstack;
          const Panelsloadingtime = 2 * Noofpanelsperstack;
          const Stackloadingtime = 5;
          const Stackpanelsunloadingtime = Panelsloadingtime;
          const LoadingUnloadingtime = Panelsloadingtime + Stackloadingtime + Stackpanelsunloadingtime;
          const Noofspindlespermachine = 8;
          const Spindlecapacitydrills = 180 / 60;
          const Drillingcycletimeperpanel = this.shareService.isValidNumber(Noofdrillsperstack / Spindlecapacitydrills / Noofpanelsperstack / Noofspindlespermachine);
          const Totalcycletimeperpanel = Drillingcycletimeperpanel + LoadingUnloadingtime;
          cycleTime = Totalcycletimeperpanel / noOfPCB;
        }
      } else if (Number(manufactureInfo?.processTypeID) === ProcessType.PCBPlating) {
        if (Number(info.value.subProcessTypeID) === 1) { // PreTreatmentBeforePTH
          cycleTime = (((shortestSide + 0.1) / 3) * 60) / noOfPCB;
        } else if (Number(info.value.subProcessTypeID) === 2) { // PthDesmear
          cycleTime =
            (outerLayerFinish < 2 ? 45 : outerLayerFinish > 2 && outerLayerFinish < 3 ? 60 : outerLayerFinish === 3 ? 80 : outerLayerFinish === 3.5 ? 100 : outerLayerFinish === 4 ? 120 : 0) / noOfPCB;
        } else if (Number(info.value.subProcessTypeID) === 3) { // DryafterPTH
          cycleTime = (((shortestSide + 0.1) / 5) * 60) / noOfPCB;
        } else if (Number(info.value.subProcessTypeID) === 4) { // PanelPlating
          cycleTime = (Number(materialInfo?.primaryCount) == 1 ? 24 : 18) / noOfPCB;
        }
      } else if (Number(manufactureInfo?.processTypeID) === ProcessType.OuterLayer) {
        if (Number(info.value.subProcessTypeID) === 1) { // IMAGINGPretreatment
          cycleTime = (((shortestSide + 0.1) / 3.5) * 60) / noOfPCB;
        } else if (Number(info.value.subProcessTypeID) === 2) { // FilmLamination
          cycleTime = shortestSide / (2.3 / 60) / noOfPCB;
        } else if (Number(info.value.subProcessTypeID) === 3) { // AutomaticExposure
          cycleTime = (Number(materialInfo?.primaryCount) == 1 ? 51 : 27) / noOfPCB;
        } else if (Number(info.value.subProcessTypeID) === 4) { // DES
          cycleTime = (Number(materialInfo?.primaryCount) == 1 ? ((((shortestSide + 0.1) / 1) * 60) / noOfPCB) * 3 : (((shortestSide + 0.1) / 2) * 60) / noOfPCB) * 3;
        } else if (Number(info.value.subProcessTypeID) === 5) { // AOIScanning
          cycleTime = (Number(materialInfo?.primaryCount) == 1 ? areaOfArray / 5200 : areaOfArray / 8200) * materialInfo.stockLength;
        } else if (Number(info.value.subProcessTypeID) === 6) { // AOIVerification
          cycleTime = Number(materialInfo?.primaryCount) == 1 ? 10 : 7;
        }
      } else if (Number(manufactureInfo?.processTypeID) === ProcessType.Soldermask) {
        if (Number(info.value.subProcessTypeID) === 1) { // PreTreatment
          cycleTime = (((shortestSide + 0.1) / 3.5) * 60 * materialInfo.stockLength) / noOfPCB;
        } else if (Number(info.value.subProcessTypeID) === 2) { // MaskPrinting
          cycleTime = outerLayerFinish >= 2 ? ((((shortestSide + 0.1) / 2.5) * 60) / noOfPCB) * 2 : (((shortestSide + 0.1) / 2.5) * 60) / noOfPCB;
        } else if (Number(info.value.subProcessTypeID) === 3) { // MaskExposure
          cycleTime = (Number(materialInfo?.primaryCount) == 1 ? 51 : 27) / noOfPCB;
        } else if (Number(info.value.subProcessTypeID) === 4) { // MaskDeveloping
          cycleTime = (((shortestSide + 0.1) / 3) * 60) / noOfPCB;
        } else if ([5, 10].includes(Number(info.value.subProcessTypeID))) { // MaskCuring, FlexMaskCuring
          cycleTime = 30 / noOfPCB;
        } else if (Number(info.value.subProcessTypeID) === 11) { // FlexibleInkPrinting
          cycleTime = (((shortestSide + 0.1) / 3.5) * 60) / noOfPCB;
        } else if (Number(info.value.subProcessTypeID) === 12) { // FlexMaskExposure
          cycleTime = (Number(materialInfo?.primaryCount) === 1 ? 51 : 27) / noOfPCB;
        } else if (Number(info.value.subProcessTypeID) === 13) { // FlexMaskDeveloping
          cycleTime = (((shortestSide + 0.1) / 3) * 60) / noOfPCB;
        }
      } else if (Number(manufactureInfo?.processTypeID) === ProcessType.SilkScreen) {
        if (Number(info.value.subProcessTypeID) === 1) { // SlikscreenPrinting
          cycleTime = (Number(materialInfo?.cavityEnvelopLength) < 0 ? 0 : Number(materialInfo?.cavityEnvelopLength) == 1 ? 35 : Number(materialInfo?.cavityEnvelopLength) == 2 ? 55 : 0) / noOfPCB;
        } else if (Number(info.value.subProcessTypeID) === 2) { // SlikscreenCuring
          cycleTime = (Number(materialInfo?.cavityEnvelopLength) < 0 ? 0 : Number(materialInfo?.cavityEnvelopLength) == 1 ? 20 : Number(materialInfo?.cavityEnvelopLength) == 2 ? 30 : 0) / noOfPCB;
        }
      } else if (Number(manufactureInfo?.processTypeID) === ProcessType.SurfaceFinish) {
        cycleTime =
          (Number(info.value.subProcessTypeID) === 1 // ImmersionTin
            ? 50
            : Number(info.value.subProcessTypeID) === 2 // ENIG
              ? 60
              : Number(info.value.subProcessTypeID) === 3 // OSP
                ? 45
                : Number(info.value.subProcessTypeID) === 4 // HASLLF
                  ? 45
                  : 40) / noOfPCB;
      } else if (Number(manufactureInfo?.processTypeID) === ProcessType.RoutingScoring) {
        if (Number(info.value.subProcessTypeID) === 1) { // Routing
          const thickness = Number(materialInfo?.totalCableLength) / 1000;
          const NoofArraysperpanel = noOfPCB;
          const MinRouterbitRequired = Number(materialInfo.beadSize);
          const NoofPanelsperstack = this.configService.getRoutingLookupList(thickness, MinRouterbitRequired);
          const NoofArraysperstack = NoofArraysperpanel * NoofPanelsperstack;
          const CuttinglengthperPanel =
            (materialInfo.closingTime + materialInfo.injectionTime) * 2 * 2 * (materialInfo.coilWeight * materialInfo.partOuterDiameter) * 2 +
            (((materialInfo.openingTime + materialInfo.colorantPer) * 2 * 80) / 100) * noOfPCB;
          const Routerbitsettingtime = 8;
          const Panelsloadingtime = 5 * NoofPanelsperstack;
          const Stackloadingtime = 5;
          const Arraysunloadingtime = (NoofArraysperstack - 1) * 2;
          const LoadingUnloadingtime = Panelsloadingtime + Stackloadingtime + Arraysunloadingtime;
          const CT = CuttinglengthperPanel / 314 / NoofPanelsperstack;
          const Totalcycletimeperpanel = LoadingUnloadingtime + Routerbitsettingtime + CT;
          cycleTime = Totalcycletimeperpanel / noOfPCB;
        } else if (Number(info.value.subProcessTypeID) === 2) { // Scoring
          const NoofArraysperpanel = materialInfo.coilWeight * materialInfo.partOuterDiameter;
          const VCuttinglengthperpanel = (materialInfo.openingTime + materialInfo.colorantPer) * 2 * noOfPCB + (materialInfo.ejectionTime + materialInfo.pickPlaceTime) * 2 * NoofArraysperpanel;
          const LoadingUnloadingtime = 10;
          const Rapidcycletimeperpanel = this.shareService.isValidNumber(5 / 334);
          const Scoringcycletimeperpanel = this.shareService.isValidNumber(VCuttinglengthperpanel / 292);
          const Totalcycletimeperpanel = Scoringcycletimeperpanel + LoadingUnloadingtime + Rapidcycletimeperpanel;
          cycleTime = Totalcycletimeperpanel / noOfPCB;
        }
      } else if (Number(manufactureInfo?.processTypeID) === ProcessType.ETestBBT) {
        if (Number(info.value.subProcessTypeID) === 1) { // BBT
          cycleTime = (materialInfo.stockCrossSectionHeight / 6) * 0.1;
        } else if (Number(info.value.subProcessTypeID) === 2) { // FlyingProbe
          cycleTime = materialInfo.stockCrossSectionHeight * 0.15;
        }
      } else if (Number(manufactureInfo?.processTypeID) === ProcessType.ImpedanceCouponTest) {
        const typeOfImpedance = Number(materialInfo.primerNetWeight);
        cycleTime = Number(materialInfo.typeOfCable) === 1 ? (typeOfImpedance === 1 ? 5 : typeOfImpedance === 2 ? 10 : 0) : 0;
      }
      totalCycleTime += this.shareService.isValidNumber(cycleTime);
    }

    if (Number(manufactureInfo?.processTypeID) === 100) { // FQCInspection
      totalCycleTime = manufactureInfo?.partComplexity === PartComplexity.High ? 15 : manufactureInfo?.partComplexity === PartComplexity.Medium ? 10 : 5;
    }

    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      let cycleTime = totalCycleTime;
      if (manufactureInfo.cycleTime != null) {
        cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : totalCycleTime;
      }
      manufactureInfo.cycleTime = cycleTime;
    }

    if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
      manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
    } else {
      manufactureInfo.setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : manufactureInfo.setUpTime;
    }

    if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost != null) {
      manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
    } else {
      let directMachineCost = this.shareService.isValidNumber(((Number(manufactureInfo.machineHourRate) / 3600) * Number(manufactureInfo.cycleTime)) / Number(manufactureInfo.efficiency));
      if (manufactureInfo.directMachineCost != null) {
        directMachineCost = this.shareService.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : directMachineCost;
      }
      manufactureInfo.directMachineCost = directMachineCost;
    }

    if (manufactureInfo.isdirectSetUpCostDirty && manufactureInfo.directSetUpCost != null) {
      manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
    } else {
      let directSetUpCost = this.shareService.isValidNumber(
        ((Number(manufactureInfo.skilledLaborRatePerHour) + Number(manufactureInfo.machineHourRate)) * (Number(manufactureInfo.setUpTime) / 60)) / Number(manufactureInfo.lotSize)
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
        ((Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) * (Number(manufactureInfo.cycleTime) * Number(manufactureInfo.noOfLowSkilledLabours))) / Number(manufactureInfo.efficiency)
      );
      if (manufactureInfo.directLaborCost != null) {
        directLaborCost = this.shareService.checkDirtyProperty('directLaborCost', fieldColorsList) ? manufacturingObj?.directLaborCost : directLaborCost;
      }
      manufactureInfo.directLaborCost = directLaborCost;
    }

    (manufactureInfo as any).inspectionCost = 0;
    (manufactureInfo as any).inspectionTime = 0;
    (manufactureInfo as any).qaOfInspectorRate = 0;

    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost != null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      let yieldCost = this.shareService.isValidNumber((1 - Number(manufactureInfo.yieldPer / 100)) * (Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.directMachineCost)));
      if (manufactureInfo.yieldCost != null) {
        yieldCost = this.shareService.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : yieldCost;
      }
      manufactureInfo.yieldCost = yieldCost;
    }
    manufactureInfo.directProcessCost = this.shareService.isValidNumber(
      Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.yieldCost)
    );

    return {
      calculateResults: [manufactureInfo],
      materialInfoList: [materialInfo],
    };
  }
}
