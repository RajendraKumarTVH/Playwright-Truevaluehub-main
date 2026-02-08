import { Injectable } from '@angular/core';
import { SharedService } from './shared.service';
import { ProcessInfoDto } from 'src/app/shared/models';
import { HarnessSubProcessTypes, RoutingComplexity, WiringHarnessConfig } from 'src/app/shared/config/wiring-harness-config';
import { MachineType, ProcessType } from '../costing.config';
import { PartComplexity } from 'src/app/shared/enums';

@Injectable({
  providedIn: 'root',
})
export class ManufacturingWiringHarnessCalculatorService {
  constructor(
    private shareService: SharedService,
    private _harnessConfig: WiringHarnessConfig
  ) {}

  public doCostCalculationForWiringHarness(manufactureInfo: ProcessInfoDto, fieldColorsList: any, manufacturingObj: ProcessInfoDto): ProcessInfoDto {
    let totalCycleTime = 0;
    manufactureInfo.setUpTimeBatch = 60;
    for (let i = 0; i < manufactureInfo.subProcessFormArray?.controls?.length; i++) {
      const info = manufactureInfo.subProcessFormArray?.controls[i];
      const subprocessType = Number(info?.value?.subProcessTypeID);
      const machineType = Number(manufactureInfo?.semiAutoOrAuto);
      let cycleTime = 0;
      if (
        [
          HarnessSubProcessTypes.CuttingStrippingCrimping,
          HarnessSubProcessTypes.CuttingStrippingSealInsertionCrimping,
          HarnessSubProcessTypes.Unsheathing8AWGto4AWG,
          HarnessSubProcessTypes.Unsheathing4AWGto40AWG,
          HarnessSubProcessTypes.CuttingStrippingTinning,
        ].includes(subprocessType)
      ) {
        let crossResult = 0;
        if (info?.value?.cableLengthArray && info?.value?.cableLengthArray?.length > 0) {
          const cableLength = info?.value?.cableLengthArray?.filter((_, index) => index % 2 === 0);
          const quantity = info?.value?.cableLengthArray?.filter((_, index) => index % 2 === 1);
          for (let index = 0; index < cableLength?.length; index++) {
            crossResult += this._harnessConfig.getCuttingStrippingCrimpingLookup(info?.value?.cableLengthArray[index], subprocessType) * quantity[index];
          }
        }
        cycleTime = this.shareService.isValidNumber(crossResult);
      } else if ([HarnessSubProcessTypes.RibbonCableCutting, HarnessSubProcessTypes.RibbonCableCuttingCrimping].includes(subprocessType)) {
        let crossResult = 0;
        if (info?.value?.cableLengthArray && info?.value?.cableLengthArray?.length > 0) {
          const cableLength = info?.value?.cableLengthArray?.filter((_, index) => index % 2 === 0);
          const quantity = info?.value?.cableLengthArray?.filter((_, index) => index % 2 === 1);
          for (let index = 0; index < cableLength?.length; index++) {
            crossResult += this._harnessConfig.getRibbonCableLookup(info?.value?.cableLengthArray[index], subprocessType) * quantity[index];
          }
        }
        cycleTime = this.shareService.isValidNumber(crossResult);
      } else if (subprocessType === HarnessSubProcessTypes.StrippingStrandsTwisting) {
        let lookup = machineType === MachineType.Automatic ? 0 : machineType === MachineType.SemiAuto ? 6 : machineType === MachineType.Manual ? 8 : 0;
        cycleTime = this.shareService.isValidNumber(lookup * Number(info?.value?.noOfBends));
      } else if (subprocessType === HarnessSubProcessTypes.CoaxialStrippingMultiLayer) {
        const machineTypeLookup = {
          [MachineType.Automatic]: 0,
          [MachineType.SemiAuto]: 12,
          [MachineType.Manual]: 45,
        };
        const lookup = machineTypeLookup[machineType] ?? 0;
        cycleTime = this.shareService.isValidNumber(lookup * Number(info?.value?.lengthOfCut));
      } else if (subprocessType === HarnessSubProcessTypes.TerminalCrimpingSCOpenBarrelFerrule) {
        let crossResult = 0;
        if (info?.value?.cableLengthArray && info?.value?.cableLengthArray?.length > 0) {
          const cableGuageValues = info?.value?.cableLengthArray?.filter((_, index) => index % 2 === 0);
          const noOfCableValues = info?.value?.cableLengthArray?.filter((_, index) => index % 2 === 1);
          for (let index = 0; index < cableGuageValues?.length; index++) {
            crossResult += this._harnessConfig.getTerminalCrimpingSCOpenBarrelFerrulelookup(cableGuageValues[index], machineType) * noOfCableValues[index];
          }
        }
        cycleTime = this.shareService.isValidNumber(crossResult);
      } else if (subprocessType === HarnessSubProcessTypes.TerminalCrimpingDCOpenBarrelFerrule) {
        const cableGauge = Number(info?.value?.noOfBends);
        const lookupValue = this._harnessConfig.getTerminalCrimpingDCOpenBarrelFerruleLookup(cableGauge, machineType);
        cycleTime = this.shareService.isValidNumber(lookupValue * Number(info?.value?.lengthOfCut));
      } else if (subprocessType === HarnessSubProcessTypes.TerminalCrimpingClosedBarrel) {
        const machineTypeLookup = {
          [MachineType.Automatic]: 0,
          [MachineType.SemiAuto]: 5,
          [MachineType.Manual]: 8,
        };
        const lookup = machineTypeLookup[machineType] ?? 0;
        cycleTime = this.shareService.isValidNumber(lookup * Number(info?.value?.noOfBends));
      } else if ([HarnessSubProcessTypes.StrandsTwistingTinning, HarnessSubProcessTypes.SolderingWiretoWire].includes(subprocessType)) {
        const machineTypeLookup = {
          [MachineType.Automatic]: 0,
          [MachineType.SemiAuto]: 8,
          [MachineType.Manual]: 0,
        };
        const lookup = machineTypeLookup[machineType] ?? 0;
        cycleTime = this.shareService.isValidNumber(lookup * Number(info?.value?.noOfBends));
      } else if ([HarnessSubProcessTypes.IPEXConnectorCrimping].includes(subprocessType)) {
        const machineTypeLookup = {
          [MachineType.Automatic]: 0,
          [MachineType.SemiAuto]: 4,
          [MachineType.Manual]: 0,
        };
        const lookup = machineTypeLookup[machineType] ?? 0;
        cycleTime = this.shareService.isValidNumber(lookup * Number(info?.value?.noOfBends));
      } else if ([HarnessSubProcessTypes.HSTInsertionShrinking].includes(subprocessType)) {
        let crossResult = 0;
        if (info?.value?.cableLengthArray && info?.value?.cableLengthArray?.length > 0) {
          const cableLength = info?.value?.cableLengthArray?.filter((_, index) => index % 2 === 0);
          const quantity = info?.value?.cableLengthArray?.filter((_, index) => index % 2 === 1);
          for (let index = 0; index < cableLength?.length; index++) {
            crossResult += this._harnessConfig.getHSTLookup(info?.value?.cableLengthArray[index], subprocessType) * quantity[index];
          }
        }
        cycleTime = this.shareService.isValidNumber(crossResult);
      } else if ([HarnessSubProcessTypes.CableTwistingWithEndTaping].includes(subprocessType)) {
        let crossResult = 0;
        let wireTwistedPair2 = Number(info?.value?.formLength);
        let wireTwistedPair3 = Number(info?.value?.formHeight);
        let wireTwistedPair4 = Number(info?.value?.formPerimeter);
        const sourceArray = info.value!.cableLengthArray.map((n) => Number(n));
        let index = 0;
        let array1: number[] = sourceArray.slice(index, index + wireTwistedPair2);
        index += wireTwistedPair2;
        let array2: number[] = sourceArray.slice(index, index + wireTwistedPair3);
        index += wireTwistedPair3;
        let array3: number[] = sourceArray.slice(index, index + wireTwistedPair4);
        index += wireTwistedPair4;
        if (array1 && array1?.length > 0) {
          for (let index = 0; index < array1?.length; index++) {
            crossResult += this._harnessConfig.getCableTwistingWithEndTapingLookup(array1[index], 2);
          }
        }
        if (array2 && array2?.length > 0) {
          for (let index = 0; index < array2?.length; index++) {
            crossResult += this._harnessConfig.getCableTwistingWithEndTapingLookup(array2[index], 3);
          }
        }
        if (array3 && array3?.length > 0) {
          for (let index = 0; index < array3?.length; index++) {
            crossResult += this._harnessConfig.getCableTwistingWithEndTapingLookup(array3[index], 4);
          }
        }
        cycleTime = this.shareService.isValidNumber(crossResult);
      } else if ([HarnessSubProcessTypes.HSTMarkingCutting].includes(subprocessType)) {
        const lookup = machineType === MachineType.Automatic ? 2 : 0;
        cycleTime = this.shareService.isValidNumber(lookup * Number(info?.value?.noOfBends));
      } else if ([HarnessSubProcessTypes.AluminiumFoilCutting].includes(subprocessType)) {
        const machineTypeLookup = {
          [MachineType.Automatic]: 0,
          [MachineType.SemiAuto]: 8,
          [MachineType.Manual]: 12,
        };
        const lookup = machineTypeLookup[machineType] ?? 0;
        cycleTime = this.shareService.isValidNumber(lookup * Number(info?.value?.noOfBends));
      } else if ([HarnessSubProcessTypes.BraidCuttingFolding].includes(subprocessType)) {
        const machineTypeLookup = {
          [MachineType.SemiAuto]: 10,
          [MachineType.Manual]: 12,
        };
        const lookup = machineTypeLookup[machineType] ?? 0;
        cycleTime = this.shareService.isValidNumber(lookup * Number(info?.value?.noOfBends));
      } else if (
        [
          HarnessSubProcessTypes.UltrasonicWireWelding,
          HarnessSubProcessTypes.UltrasonicWiretoTerminalWelding,
          HarnessSubProcessTypes.UltrasonicWiretoLugWelding,
          HarnessSubProcessTypes.BraidBrushingTwisting,
          HarnessSubProcessTypes.StrippingandCrimping,
          HarnessSubProcessTypes.SpliceCrimping,
          HarnessSubProcessTypes.TapeWrapping,
          HarnessSubProcessTypes.LabelFixingOffline,
          HarnessSubProcessTypes.ProtectorFitmentBoltTightening,
          HarnessSubProcessTypes.IDCConnectorCrimpingFRC,
          HarnessSubProcessTypes.EOLLabelFixing,
          HarnessSubProcessTypes.FuseRelaySwitchInsertionTesting,
          HarnessSubProcessTypes.WireCableTinning,
          HarnessSubProcessTypes.SleeveShrinking,
        ].includes(subprocessType)
      ) {
        const lookupMap = {
          [HarnessSubProcessTypes.UltrasonicWireWelding]: 9,
          [HarnessSubProcessTypes.UltrasonicWiretoTerminalWelding]: 16,
          [HarnessSubProcessTypes.UltrasonicWiretoLugWelding]: 20,
          [HarnessSubProcessTypes.BraidBrushingTwisting]: 12,
          [HarnessSubProcessTypes.BraidCuttingFolding]: 10,
          [HarnessSubProcessTypes.StrippingandCrimping]: 4,
          [HarnessSubProcessTypes.SpliceCrimping]: 8,
          [HarnessSubProcessTypes.TapeWrapping]: 12,
          [HarnessSubProcessTypes.LabelFixingOffline]: 4,
          [HarnessSubProcessTypes.ProtectorFitmentBoltTightening]: 12,
          [HarnessSubProcessTypes.IDCConnectorCrimpingFRC]: 12,
          [HarnessSubProcessTypes.EOLLabelFixing]: 8,
          [HarnessSubProcessTypes.FuseRelaySwitchInsertionTesting]: 5,
          [HarnessSubProcessTypes.WireCableTinning]: 4,
          [HarnessSubProcessTypes.SleeveShrinking]: 6,
        };
        const lookupValue = lookupMap[subprocessType] ?? 0;
        const lookup = machineType === MachineType.SemiAuto ? lookupValue : 0;
        cycleTime = this.shareService.isValidNumber(lookup * Number(info?.value?.noOfBends));
      } else if (
        [
          HarnessSubProcessTypes.RubberSealInsertionManual,
          HarnessSubProcessTypes.SecLockCoverStrainReliefBootInsertion,
          HarnessSubProcessTypes.PartIDLabelFixing,
          HarnessSubProcessTypes.TerminalInsertionConnectorization,
        ].includes(subprocessType)
      ) {
        const lookup = machineType === MachineType.Manual ? 5 : 0;
        cycleTime = this.shareService.isValidNumber(lookup * Number(info?.value?.noOfBends));
      } else if ([HarnessSubProcessTypes.WireSplicing, HarnessSubProcessTypes.PartAssembly].includes(subprocessType)) {
        const lookup = machineType === MachineType.Manual ? 8 : 0;
        cycleTime = this.shareService.isValidNumber(lookup * Number(info?.value?.noOfBends));
      } else if ([HarnessSubProcessTypes.ConduitTubeCuttingSlitting].includes(subprocessType)) {
        let crossResult = 0;
        if (info?.value?.cableLengthArray && info?.value?.cableLengthArray?.length > 0) {
          const cableLength = info?.value?.cableLengthArray?.filter((_, index) => index % 2 === 0);
          const quantity = info?.value?.cableLengthArray?.filter((_, index) => index % 2 === 1);
          for (let index = 0; index < cableLength?.length; index++) {
            crossResult += this._harnessConfig.getConduitTubeCuttingSlittingLookup(info?.value?.cableLengthArray[index], subprocessType) * quantity[index];
          }
        }
        cycleTime = this.shareService.isValidNumber(crossResult);
      } else if ([HarnessSubProcessTypes.CopperBraidSteelWireHeavyDutyHSTCutting].includes(subprocessType)) {
        let crossResult = 0;
        if (info?.value?.cableLengthArray && info?.value?.cableLengthArray?.length > 0) {
          const cableLength = info?.value?.cableLengthArray?.filter((_, index) => index % 2 === 0);
          const quantity = info?.value?.cableLengthArray?.filter((_, index) => index % 2 === 1);
          for (let index = 0; index < cableLength?.length; index++) {
            crossResult += this._harnessConfig.getCopperBraidSteelWireHeavyDutyHSTCuttingLookup(info?.value?.cableLengthArray[index], machineType) * quantity[index];
          }
        }
        cycleTime = this.shareService.isValidNumber(crossResult);
      } else if ([HarnessSubProcessTypes.HeatShrinkTubeNylonBraidCutting].includes(subprocessType)) {
        let crossResult = 0;
        if (info?.value?.cableLengthArray && info?.value?.cableLengthArray?.length > 0) {
          const cableLength = info?.value?.cableLengthArray?.filter((_, index) => index % 2 === 0);
          const quantity = info?.value?.cableLengthArray?.filter((_, index) => index % 2 === 1);
          for (let index = 0; index < cableLength?.length; index++) {
            crossResult += this._harnessConfig.getHeatShrinkTubeNylonBraidCuttingLookup(info?.value?.cableLengthArray[index], machineType) * quantity[index];
          }
        }
        cycleTime = this.shareService.isValidNumber(crossResult);
      } else if ([HarnessSubProcessTypes.ConduitTubePVCSleeveCutting].includes(subprocessType)) {
        let crossResult = 0;
        if (info?.value?.cableLengthArray && info?.value?.cableLengthArray?.length > 0) {
          const cableLength = info?.value?.cableLengthArray?.filter((_, index) => index % 2 === 0);
          const quantity = info?.value?.cableLengthArray?.filter((_, index) => index % 2 === 1);
          for (let index = 0; index < cableLength?.length; index++) {
            crossResult += this._harnessConfig.getConduitTubePVCSleeveCuttingLookup(info?.value?.cableLengthArray[index], machineType) * quantity[index];
          }
        }
        cycleTime = this.shareService.isValidNumber(crossResult);
      } else if ([HarnessSubProcessTypes.CableTieFixing].includes(subprocessType)) {
        const machineTypeLookup = {
          [MachineType.Automatic]: 0,
          [MachineType.SemiAuto]: 4,
          [MachineType.Manual]: 6,
        };
        const lookup = machineTypeLookup[machineType] ?? 0;
        cycleTime = this.shareService.isValidNumber(lookup * Number(info?.value?.noOfBends));
      } else if ([HarnessSubProcessTypes.TubeSleeveBraidInsertionFixing].includes(subprocessType)) {
        let crossResult = 0;
        if (info?.value?.cableLengthArray && info?.value?.cableLengthArray?.length > 0) {
          const cableLength = info?.value?.cableLengthArray?.filter((_, index) => index % 2 === 0);
          const quantity = info?.value?.cableLengthArray?.filter((_, index) => index % 2 === 1);
          for (let index = 0; index < cableLength?.length; index++) {
            crossResult += this._harnessConfig.getTubeSleeveBraidInsertionFixingLookup(info?.value?.cableLengthArray[index]) * quantity[index];
          }
        }
        cycleTime = this.shareService.isValidNumber(crossResult);
      } else if ([HarnessSubProcessTypes.LayoutRouting].includes(subprocessType)) {
        const complexityLookup = {
          [RoutingComplexity.Simple]: 20,
          [RoutingComplexity.Moderate]: 35,
          [RoutingComplexity.Complex]: 75,
          [RoutingComplexity.SuperComplex]: 120,
        };
        cycleTime = this.shareService.isValidNumber(complexityLookup[Number(info?.value?.noOfBends)] ?? 0);
      } else if ([HarnessSubProcessTypes.Taping].includes(subprocessType)) {
        const lookup = machineType === MachineType.Manual ? 18 : 0;
        cycleTime = this.shareService.isValidNumber(lookup * Number(info?.value?.noOfBends));
      } else if ([HarnessSubProcessTypes.GrommetFerriteInsertionFixing, HarnessSubProcessTypes.BracketProtectorFitment].includes(subprocessType)) {
        const lookup = machineType === MachineType.Manual ? 12 : 0;
        cycleTime = this.shareService.isValidNumber(lookup * Number(info?.value?.noOfBends));
      } else if ([HarnessSubProcessTypes.ComponentPotting].includes(subprocessType)) {
        const lookup = machineType === MachineType.Automatic ? 15 : 0;
        cycleTime = this.shareService.isValidNumber(lookup * Number(info?.value?.noOfBends));
      } else if ([HarnessSubProcessTypes.FakraStraightConnectorAssembly].includes(subprocessType)) {
        const lookup = machineType === MachineType.Manual ? 45 : 0;
        cycleTime = this.shareService.isValidNumber(lookup * Number(info?.value?.noOfBends));
      } else if ([HarnessSubProcessTypes.Fakra90DegreeConnectorAssembly, HarnessSubProcessTypes.BackshellAssemblyRightAngle].includes(subprocessType)) {
        const lookup = machineType === MachineType.Manual ? 60 : 0;
        cycleTime = this.shareService.isValidNumber(lookup * Number(info?.value?.noOfBends));
      } else if ([HarnessSubProcessTypes.DummyPlugInsertion].includes(subprocessType)) {
        const lookup = machineType === MachineType.Manual ? 4 : 0;
        cycleTime = this.shareService.isValidNumber(lookup * Number(info?.value?.noOfBends));
      } else if ([HarnessSubProcessTypes.EMPartInsertionFuseRelaySwitch, HarnessSubProcessTypes.ClipClampFixing].includes(subprocessType)) {
        const lookup = machineType === MachineType.Manual ? 6 : 0;
        cycleTime = this.shareService.isValidNumber(lookup * Number(info?.value?.noOfBends));
      } else if ([HarnessSubProcessTypes.RASTConnectorCrimping].includes(subprocessType)) {
        let crossResult = 0;
        if (info?.value?.cableLengthArray && info?.value?.cableLengthArray?.length > 0) {
          for (let index = 0; index < info?.value?.cableLengthArray?.length; index++) {
            crossResult += this._harnessConfig.getRASTConnectorCrimpingLookup(info?.value?.cableLengthArray[index]);
          }
        }
        cycleTime = this.shareService.isValidNumber(crossResult);
      } else if ([HarnessSubProcessTypes.CableGlandAssembly].includes(subprocessType)) {
        const lookup = machineType === MachineType.Manual ? 25 : 0;
        cycleTime = this.shareService.isValidNumber(lookup * Number(info?.value?.noOfBends));
      } else if ([HarnessSubProcessTypes.ContinuityTestShortCircuitIRTest].includes(subprocessType)) {
        cycleTime = this.shareService.isValidNumber(this._harnessConfig.getContinuityTestShortCircuitIRTestLookup(Number(info?.value?.noOfBends), subprocessType));
      } else if ([HarnessSubProcessTypes.ContinuityTestHVTest].includes(subprocessType)) {
        cycleTime = this.shareService.isValidNumber(this._harnessConfig.getContinuityTestShortCircuitIRTestLookup(Number(info?.value?.noOfBends), subprocessType));
      } else if ([HarnessSubProcessTypes.ClipClampFitmentTest].includes(subprocessType)) {
        cycleTime = this.shareService.isValidNumber(this._harnessConfig.getClipClampFitmentTestLookup(Number(info?.value?.noOfBends)));
      } else if ([HarnessSubProcessTypes.VisualInspection].includes(subprocessType)) {
        cycleTime = 0;
      } else if ([HarnessSubProcessTypes.BackshellAssemblyStraight].includes(subprocessType)) {
        const type = [2].includes(Number(info?.value?.lengthOfCut)) ? 25 : 0;
        const adhesiveSealing = Number(info?.value?.formHeight) === 1 ? 45 : 0;
        const connectorPotting = Number(info?.value?.formPerimeter) === 1 ? 25 : 0;
        const ConnectorCapAssembly = Number(info?.value?.hlFactor) === 1 ? 30 : 0;
        const noOfTerminals = Number(info?.value?.formLength);
        cycleTime = (70 + type + adhesiveSealing + connectorPotting + ConnectorCapAssembly + noOfTerminals * 18) * Number(info?.value?.noOfBends);
      } else if ([HarnessSubProcessTypes.CuttingUnsheathingMulticoreCable].includes(subprocessType)) {
        let crossResult = 0;
        if (info?.value?.cableLengthArray && info?.value?.cableLengthArray?.length > 0) {
          const cableLength = info?.value?.cableLengthArray?.filter((_, index) => index % 2 === 0);
          const quantity = info?.value?.cableLengthArray?.filter((_, index) => index % 2 === 1);
          for (let index = 0; index < cableLength?.length; index++) {
            crossResult += this._harnessConfig.getCuttingUnsheathingMulticoreCableLookup(info?.value?.cableLengthArray[index], machineType) * quantity[index];
          }
        }
        cycleTime = this.shareService.isValidNumber(crossResult);
      } else if ([HarnessSubProcessTypes.InsulationStripping].includes(subprocessType)) {
        const machineTypeLookup = {
          [MachineType.SemiAuto]: 4,
          [MachineType.Manual]: 6,
        };
        const lookup = machineTypeLookup[machineType] ?? 0;
        cycleTime = this.shareService.isValidNumber(lookup * Number(info?.value?.noOfBends));
      } else if ([HarnessSubProcessTypes.ShieldBraidPreparation].includes(subprocessType)) {
        const lookup = machineType === MachineType.Manual ? 15 : 0;
        cycleTime = this.shareService.isValidNumber(lookup * Number(info?.value?.noOfBends));
      } else if ([HarnessSubProcessTypes.JackConnectorCrimpingRJ45RJ11].includes(subprocessType)) {
        const machineTypeLookup = {
          [MachineType.SemiAuto]: 5,
          [MachineType.Manual]: 12,
        };
        const lookup = machineTypeLookup[machineType] ?? 0;
        cycleTime = this.shareService.isValidNumber(lookup * Number(info?.value?.noOfBends));
      } else if ([HarnessSubProcessTypes.ConnectorKitAssembly].includes(subprocessType)) {
        const lookup = machineType === MachineType.Manual ? 3 : 0;
        cycleTime = this.shareService.isValidNumber(lookup * Number(info?.value?.noOfBends));
      }
      totalCycleTime += this.shareService.isValidNumber(cycleTime);
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

    if (manufactureInfo.isyieldPercentDirty && manufactureInfo.yieldPer != null) {
      manufactureInfo.yieldPer = Number(manufactureInfo.yieldPer);
    } else {
      const yieldComplexityMap = {
        [PartComplexity.Low]: 99.5,
        [PartComplexity.Medium]: 99,
        [PartComplexity.High]: 98.5,
      };
      let yieldPer = yieldComplexityMap[manufactureInfo.partComplexity] ?? 0;
      if (manufactureInfo.yieldPer != null) {
        yieldPer = this.shareService.checkDirtyProperty('yieldPer', fieldColorsList) ? manufacturingObj?.yieldPer : yieldPer;
      }
      manufactureInfo.yieldPer = yieldPer;
    }

    if (Number(manufactureInfo.processTypeID) === ProcessType.FinalInspection) {
      manufactureInfo.setUpTime = 0;
      manufactureInfo.directMachineCost = 0;
      manufactureInfo.directSetUpCost = 0;
      manufactureInfo.directLaborCost = 0;
      manufactureInfo.skilledLaborRatePerHour = 0;
      manufactureInfo.lowSkilledLaborRatePerHour = 0;
      manufactureInfo.cycleTime = 0;
      manufactureInfo.samplingRate = 0;
      manufactureInfo.yieldPer = 0;

      if (manufactureInfo.isinspectionTimeDirty && manufactureInfo.inspectionTime != null) {
        manufactureInfo.inspectionTime = Number(manufactureInfo.inspectionTime);
      } else {
        const complexityLookup = {
          [RoutingComplexity.Simple]: 25,
          [RoutingComplexity.Moderate]: 60,
          [RoutingComplexity.Complex]: 120,
          [RoutingComplexity.SuperComplex]: 180,
        };
        const info = manufactureInfo.subProcessFormArray?.controls[0];
        let inspectionTime = this.shareService.isValidNumber(complexityLookup[Number(info?.value?.noOfBends)] ?? 0);
        if (manufactureInfo.inspectionTime != null) {
          inspectionTime = this.shareService.checkDirtyProperty('inspectionTime', fieldColorsList) ? manufacturingObj?.inspectionTime : inspectionTime;
        }
        manufactureInfo.inspectionTime = inspectionTime;
      }

      if (manufactureInfo.isinspectionCostDirty && manufactureInfo.inspectionCost != null) {
        manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
      } else {
        let inspectionCost = this.shareService.isValidNumber(((Number(manufactureInfo.qaOfInspectorRate) / 3600) * Number(manufactureInfo.inspectionTime)) / Number(manufactureInfo.efficiency));
        if (manufactureInfo.inspectionCost != null) {
          inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList) ? manufacturingObj?.inspectionCost : this.shareService.isValidNumber(inspectionCost);
        }
        manufactureInfo.inspectionCost = inspectionCost;
      }

      if (manufactureInfo.isdirectMachineCostDirty && manufactureInfo.directMachineCost != null) {
        manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
      } else {
        let directMachineCost = this.shareService.isValidNumber(((Number(manufactureInfo.machineHourRate) / 3600) * Number(manufactureInfo.inspectionTime)) / Number(manufactureInfo.efficiency));
        if (manufactureInfo.directMachineCost != null) {
          directMachineCost = this.shareService.checkDirtyProperty('directMachineCost', fieldColorsList) ? manufacturingObj?.directMachineCost : directMachineCost;
        }
        manufactureInfo.directMachineCost = directMachineCost;
      }
    } else {
      manufactureInfo.inspectionCost = 0;
      manufactureInfo.inspectionTime = 0;
      if (manufactureInfo.issetUpTimeDirty && manufactureInfo.setUpTime != null) {
        manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime);
      } else {
        manufactureInfo.setUpTime = this.shareService.checkDirtyProperty('setUpTime', fieldColorsList) ? manufacturingObj?.setUpTime : 30;
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
        let directSetUpCost =
          ((Number(manufactureInfo.skilledLaborRatePerHour) + Number(manufactureInfo.machineHourRate)) * (Number(manufactureInfo.setUpTime) / 60)) / Number(manufactureInfo.lotSize);
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
    }

    if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost != null) {
      manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
    } else {
      let yieldCost = this.shareService.isValidNumber((1 - Number(manufactureInfo.yieldPer / 100)) * Number(manufactureInfo.directLaborCost));
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
}
