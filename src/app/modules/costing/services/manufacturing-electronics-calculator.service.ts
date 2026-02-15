import { Injectable } from '@angular/core';
import { SharedService } from './shared.service';
import {
  ApplicationTypes,
  CoatingTypes,
  ElectronicsConfigService,
  PottingTypes,
  RoutingProcessType,
  RoutingVScoring,
  SMTTypes,
  ThroughHoleLineTypes,
} from 'src/app/shared/config/manufacturing-electronics-config';
import { ProcessInfoDto } from 'src/app/shared/models';
import { ProcessType } from '../costing.config';
import { PartComplexity } from 'src/app/shared/enums';

@Injectable({
  providedIn: 'root',
})
export class ManufacturingElectronicsCalculatorService {
  constructor(
    private shareService: SharedService,
    private electronicsConfig: ElectronicsConfigService
  ) {}

  public calculationForElectronics(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    const processId: number = Number(manufactureInfo.processTypeID);
    const pcbLength: number = Number(manufactureInfo?.materialInfoList[0]?.sheetLength);
    const pcbWidth: number = Number(manufactureInfo?.materialInfoList[0]?.sheetWidth);
    // const panelLength: number = Number(manufactureInfo?.materialInfoList[0]?.sheetThickness);
    const panelWidth: number = Number(manufactureInfo?.materialInfoList[0]?.inputBilletWidth);
    const noOfPCBs: number = Number(manufactureInfo?.materialInfoList[0]?.totalCableLength) || 1;
    const noOfComponents: number = Number(manufactureInfo?.materialInfoList[0]?.flashVolume);
    const application: number = Number(manufactureInfo?.materialInfoList[0]?.noOfCables);
    const mountingSides: number = Number(manufactureInfo?.materialInfoList[0]?.typeOfConductor);
    const pcbArea = Math.round(pcbLength * pcbWidth);

    if (manufactureInfo.isyieldPercentDirty && manufactureInfo.yieldPer != null) {
      manufactureInfo.yieldPer = Number(manufactureInfo.yieldPer);
    } else {
      let yieldPer = manufactureInfo.partComplexity === PartComplexity.High ? 99 : manufactureInfo.partComplexity === PartComplexity.Medium ? 99.25 : 99.5;
      if (manufactureInfo.yieldPer != null) {
        yieldPer = this.shareService.checkDirtyProperty('yieldPer', fieldColorsList) ? manufacturingObj?.yieldPer : yieldPer;
      }
      manufactureInfo.yieldPer = yieldPer;
    }

    let totalCycleTime = 0;
    if (processId === ProcessType.MaterialKitting) {
      totalCycleTime = noOfComponents * 0.025;
    } else if (processId === ProcessType.ThroughHoleLine) {
      for (let i = 0; i < manufactureInfo.subProcessFormArray?.controls?.length; i++) {
        const info = manufactureInfo.subProcessFormArray?.controls[i];
        const subProcessId = Number(info?.value?.subProcessTypeID);
        // const noOfTHComponentsPanel = Number(manufactureInfo?.materialInfoList[0]?.noOfCablesWithSameDia);
        // const noOfTHComponentsPCB = Number(manufactureInfo?.materialInfoList[0]?.mainInsulatorID);
        const noOfRadialTHComponentsPCB = Number(manufactureInfo?.materialInfoList[0]?.mainInsulatorOD);
        const noOfAxialTHComponentsPCB = Number(manufactureInfo?.materialInfoList[0]?.mainCableSheathingMaterial);
        const noOfSpecialTHComponentsPCB = Number(manufactureInfo?.materialInfoList[0]?.pickPlaceTime);
        const noOfSpecialTHComponentsPinCount = Number(manufactureInfo?.materialInfoList[0]?.openingTime);
        const noOfPressfitComponents = Number(manufactureInfo?.materialInfoList[0]?.coilWidth);

        if ([ThroughHoleLineTypes.AxialCompManualPreforming].includes(subProcessId)) {
          totalCycleTime = noOfAxialTHComponentsPCB * 5;
        } else if ([ThroughHoleLineTypes.AxialCompSemiPreforming].includes(subProcessId)) {
          totalCycleTime = noOfAxialTHComponentsPCB * 3.8;
        } else if ([ThroughHoleLineTypes.RadialComponentManualPreforming].includes(subProcessId)) {
          totalCycleTime = noOfRadialTHComponentsPCB * 5;
        } else if ([ThroughHoleLineTypes.RadialComponentSemiPreforming].includes(subProcessId)) {
          totalCycleTime = noOfRadialTHComponentsPCB * 3.8;
        } else if ([ThroughHoleLineTypes.AxialCompAutoPlacement].includes(subProcessId)) {
          totalCycleTime = noOfAxialTHComponentsPCB * 0.25 + 2;
        } else if ([ThroughHoleLineTypes.AxialCompManualPlacement].includes(subProcessId)) {
          totalCycleTime = noOfAxialTHComponentsPCB * 4 + 10;
        } else if ([ThroughHoleLineTypes.RadialCompAutoPlacement].includes(subProcessId)) {
          totalCycleTime = noOfRadialTHComponentsPCB * 0.25 + 4 + 4;
        } else if ([ThroughHoleLineTypes.RadialCompManualPlacement].includes(subProcessId)) {
          totalCycleTime = noOfRadialTHComponentsPCB * 4 + 10;
        } else if ([ThroughHoleLineTypes.CustomCompManualPlacement].includes(subProcessId)) {
          totalCycleTime = noOfSpecialTHComponentsPCB * 6 + 10;
        } else if ([ThroughHoleLineTypes.WaveSoldering].includes(subProcessId)) {
          totalCycleTime = this.shareService.isValidNumber(((2.98 / 2.5) * 60) / (2.98 / (panelWidth / 1000 + 0.075)) / noOfPCBs);
        } else if ([ThroughHoleLineTypes.HandSoldering].includes(subProcessId)) {
          totalCycleTime = noOfSpecialTHComponentsPinCount * 2 + 6;
        } else if ([ThroughHoleLineTypes.SelectiveSoldering].includes(subProcessId)) {
          totalCycleTime = this.shareService.isValidNumber(((noOfSpecialTHComponentsPinCount * 3) / 2) * 1.1);
        } else if ([ThroughHoleLineTypes.Pressfit].includes(subProcessId)) {
          totalCycleTime = this.shareService.isValidNumber(noOfPressfitComponents * 0.6);
        } else if ([ThroughHoleLineTypes.Washing].includes(subProcessId)) {
          totalCycleTime = this.shareService.isValidNumber(3600 / (2 * 5.84) / ((3600 / (panelWidth + 50)) * 2) / noOfPCBs);
        }
      }
    } else if (processId === ProcessType.InCircuitTestProgramming) {
      const ProgrammaleIcsPerPCB = manufactureInfo?.materialInfoList[0]?.moldBoxLength || 0;
      totalCycleTime = noOfComponents * 0.015 + ProgrammaleIcsPerPCB * 6;
    } else if (processId === ProcessType.Coating) {
      for (let i = 0; i < manufactureInfo.subProcessFormArray?.controls?.length; i++) {
        const info = manufactureInfo.subProcessFormArray?.controls[i];
        const subProcessId: number = Number(info?.value?.subProcessTypeID);
        const percentOfConformalCoating: number = Number(manufactureInfo?.materialInfoList[0]?.partsPerCoil);
        const coatingSides: number = Number(manufactureInfo?.materialInfoList[0]?.coilLength);
        const conformalCoatingArea: number = this.shareService.isValidNumber(pcbLength * pcbWidth * (coatingSides * (percentOfConformalCoating / 100)));
        if ([CoatingTypes.ConformalCoating].includes(subProcessId)) {
          totalCycleTime = percentOfConformalCoating < 100 ? conformalCoatingArea / 700 + 4 + 4 + 9 + 9 : percentOfConformalCoating === 100 ? conformalCoatingArea / 700 : 0;
        } else if ([CoatingTypes.ConformalCoatInspection].includes(subProcessId)) {
          totalCycleTime = conformalCoatingArea / 1000;
        } else if ([CoatingTypes.UVLightCuringSystem].includes(subProcessId)) {
          totalCycleTime = 2100 / 50 / (2100 / (pcbWidth + 100));
        }
      }
    } else if (processId === ProcessType.AdhesivePotting) {
      for (let i = 0; i < manufactureInfo.subProcessFormArray?.controls?.length; i++) {
        const info = manufactureInfo.subProcessFormArray?.controls[i];
        const subProcessId: number = Number(info?.value?.subProcessTypeID);
        const coatingSides: number = Number(manufactureInfo?.materialInfoList[0]?.coilWeight);
        const percentOfCoatingArea: number = Number(manufactureInfo?.materialInfoList[0]?.partOuterDiameter);
        const areaOfConformalCoating = pcbArea * (coatingSides * (percentOfCoatingArea / 100));
        if ([PottingTypes.PottingMaterial].includes(subProcessId)) {
          totalCycleTime = areaOfConformalCoating / 700 + 2 || 2;
        } else if ([PottingTypes.UVLightCuringSystem].includes(subProcessId)) {
          totalCycleTime = 2100 / 30 / (2100 / (pcbWidth + 100)) || 0;
        }
      }
    } else if (processId === ProcessType.RoutingVScoring) {
      for (let i = 0; i < manufactureInfo.subProcessFormArray?.controls?.length; i++) {
        const info = manufactureInfo.subProcessFormArray?.controls[i];
        const subProcessId: number = Number(info?.value?.subProcessTypeID);
        const processType: number = Number(manufactureInfo?.materialInfoList[0]?.ejectionTime);
        const scoringLength: number = (pcbLength + pcbWidth) * 2;
        const routingLength = pcbLength > 40 ? (pcbLength / 40) * 2 * 15 : 15;
        const routingWidth = pcbWidth > 40 ? (pcbWidth / 40) * 2 * 15 : 15;
        const totalRoutingSection = Math.round(routingLength + routingWidth + 50);
        if ([RoutingVScoring.DepanelTabRouting].includes(subProcessId)) {
          totalCycleTime = processType === RoutingProcessType.Routing ? totalRoutingSection / 52.5 : 0;
        } else if ([RoutingVScoring.DepanelVscoring].includes(subProcessId)) {
          totalCycleTime = processType === RoutingProcessType.VScore ? scoringLength / 300 : 0;
        }
      }
    } else if (processId === ProcessType.FunctionalTest) {
      const configData = this.electronicsConfig.getFunctionalTestLookup()?.find((x) => x.complexity === manufactureInfo?.partComplexity);
      totalCycleTime =
        application === ApplicationTypes?.ConsumerElectronics
          ? configData?.consumerElectronics
          : ApplicationTypes?.Medical
            ? configData?.medical
            : ApplicationTypes?.Automotive
              ? configData?.automotive
              : 0;
    } else if (processId === ProcessType.ElectronicsVisualInspection) {
      totalCycleTime = mountingSides == 1 ? 4 : mountingSides === 2 ? 8 : 0;
    } else if ([ProcessType.LabellingnternalPackaging, ProcessType.ElectronicsLaserMarking, ProcessType.BarCodeReader].includes(processId)) {
      totalCycleTime = 0; //manual entry
    } else if (processId === ProcessType.SMTLine) {
      for (let i = 0; i < manufactureInfo.subProcessFormArray?.controls?.length; i++) {
        const info = manufactureInfo?.subProcessFormArray?.controls[i];
        const subProcessId: number = Number(info?.value?.subProcessTypeID);
        const lessThan6Pins: number = Number(manufactureInfo?.materialInfoList[0]?.partInnerDiameter);
        const moreThan6AndLessThan14Pins: number = Number(manufactureInfo?.materialInfoList[0]?.runnerRiser);
        const moreThan14Pins: number = Number(manufactureInfo?.materialInfoList[0]?.oxidationLossWeight);
        const lessThan6PinsOnBotSide: number = Number(manufactureInfo?.materialInfoList[0]?.pouringWeight);
        const moreThan6AndLessThan14PinsOnBotSide: number = Number(manufactureInfo?.materialInfoList[0]?.cavityArrangementLength);
        const moreThan14PinsOnBotSide: number = Number(manufactureInfo?.materialInfoList[0]?.cavityArrangementWidth);
        // const ProgrammaleIcsPerPCB: number = Number(manufactureInfo?.materialInfoList[0]?.moldBoxLength);
        const NoofComplexComponents: number = Number(manufactureInfo?.materialInfoList[0]?.moldBoxHeight);

        if ([SMTTypes.InLoader, SMTTypes.UnLoader].includes(subProcessId)) {
          totalCycleTime = 8;
        } else if ([SMTTypes.SolderPastePrinting].includes(subProcessId)) {
          const panelBoradWidth = panelWidth + 20;
          totalCycleTime = panelBoradWidth / 150 / noOfPCBs + 2 + 1 + 1.5 + 1.25;
        } else if ([SMTTypes.SolderPasteInspection].includes(subProcessId)) {
          totalCycleTime = pcbArea / 7290 + 5;
        } else if ([SMTTypes.PickAndPlaceHighSpeed].includes(subProcessId)) {
          totalCycleTime = (3600 / 100000) * lessThan6Pins;
        } else if ([SMTTypes.PickAndPlaceHighFlexibility].includes(subProcessId)) {
          totalCycleTime = (3600 / 75000) * moreThan6AndLessThan14Pins;
        } else if ([SMTTypes.PickAndPlaceMultifunctionalHead].includes(subProcessId)) {
          totalCycleTime = (3600 / 20000) * moreThan14Pins;
        } else if ([SMTTypes.ReflowSoldering].includes(subProcessId)) {
          totalCycleTime = ((5.9 / 1.1) * 60) / (5.9 / (panelWidth / 1000 + 0.075)) / noOfPCBs;
        } else if ([SMTTypes.AOI].includes(subProcessId)) {
          totalCycleTime = (pcbLength * pcbWidth) / 3200 + NoofComplexComponents * 0.05 + 2;
        } else if ([SMTTypes.ConveyorFlipConveyor].includes(subProcessId)) {
          totalCycleTime = (1060 + panelWidth) / 233.33;
        } else if ([SMTTypes.HighSpeedPickAandPlace].includes(subProcessId)) {
          totalCycleTime = (3600 / 100000) * lessThan6PinsOnBotSide;
        } else if ([SMTTypes.HighFlexibilityPickAndPlace].includes(subProcessId)) {
          totalCycleTime = (3600 / 75000) * moreThan6AndLessThan14PinsOnBotSide;
        } else if ([SMTTypes.MultifunctionalHeadPickAndPlace].includes(subProcessId)) {
          totalCycleTime = (3600 / 20000) * moreThan14PinsOnBotSide;
        }
      }
    }

    if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
      manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
    } else {
      if (manufactureInfo.cycleTime != null) {
        totalCycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList) ? manufacturingObj?.cycleTime : totalCycleTime;
      }
      manufactureInfo.cycleTime = totalCycleTime;
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
    manufactureInfo.inspectionCost = 0;
    manufactureInfo.inspectionTime = 0;
    manufactureInfo.qaOfInspectorRate = 0;
    manufactureInfo.samplingRate = 0;

    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost != null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      const yieldCost = (1 - Number(manufactureInfo.yieldPer / 100)) * (Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.directMachineCost));
      if (manufactureInfo.yieldCost != null) {
        manufactureInfo.yieldCost = this.shareService.checkDirtyProperty('yieldCost', fieldColorsList) ? manufacturingObj?.yieldCost : yieldCost;
      }
    }
    manufactureInfo.directProcessCost = this.shareService.isValidNumber(
      Number(manufactureInfo.directLaborCost) + Number(manufactureInfo.directMachineCost) + Number(manufactureInfo.directSetUpCost) + Number(manufactureInfo.yieldCost)
    );
    // return new Observable((obs) => { obs.next(manufactureInfo); });
    return manufactureInfo;
  }
}
