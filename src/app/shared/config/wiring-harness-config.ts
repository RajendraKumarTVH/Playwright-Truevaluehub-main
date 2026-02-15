import { Injectable } from '@angular/core';
import { MachineType, ProcessType } from 'src/app/modules/costing/costing.config';
import { ProcessInfoDto } from '../models';

@Injectable({
  providedIn: 'root',
})
export class WiringHarnessConfig {
  public processGroupSortOrder = ['Pre Assembly', 'Final Assembly', 'Testing & Inspection'];
  public testingSortOrder = ['Functional Test (Cable Harness)', 'EM Part Assembly & Testing', 'Final Inspection'];
  public harnessTypes = [
    ProcessType.CablePreparation,
    ProcessType.LineAssembly,
    ProcessType.FinalInspection,
    ProcessType.ConduitTubeSleeveHSTPreparation,
    ProcessType.FunctionalTestCableHarness,
    ProcessType.EMPartAssemblyTesting,
  ];

  getCuttingStrippingCrimpingLookup(length: number, subprocessType: number) {
    let lookup = [
      { cableLengthFrom: 1, cableLengthTo: 100, strippingCrimping: 2, strippingSealInsertionCrimping: 3, unsheathing8AWGto4AWG: 4, unsheathing4AWGto40AWG: 6, strippingTinning: 2 },
      { cableLengthFrom: 101, cableLengthTo: 2000, strippingCrimping: 4, strippingSealInsertionCrimping: 5, unsheathing8AWGto4AWG: 8, unsheathing4AWGto40AWG: 10, strippingTinning: 3 },
      { cableLengthFrom: 2001, cableLengthTo: 5000, strippingCrimping: 6, strippingSealInsertionCrimping: 7, unsheathing8AWGto4AWG: 12, unsheathing4AWGto40AWG: 15, strippingTinning: 4 },
      { cableLengthFrom: 5001, cableLengthTo: 8000, strippingCrimping: 8, strippingSealInsertionCrimping: 9, unsheathing8AWGto4AWG: 16, unsheathing4AWGto40AWG: 20, strippingTinning: 5 },
      { cableLengthFrom: 8001, cableLengthTo: 10000, strippingCrimping: 10, strippingSealInsertionCrimping: 11, unsheathing8AWGto4AWG: 20, unsheathing4AWGto40AWG: 25, strippingTinning: 6 },
      { cableLengthFrom: 10001, cableLengthTo: 13000, strippingCrimping: 12, strippingSealInsertionCrimping: 13, unsheathing8AWGto4AWG: 0, unsheathing4AWGto40AWG: 0, strippingTinning: 0 },
      { cableLengthFrom: 13001, cableLengthTo: 16000, strippingCrimping: 13, strippingSealInsertionCrimping: 15, unsheathing8AWGto4AWG: 0, unsheathing4AWGto40AWG: 0, strippingTinning: 0 },
      { cableLengthFrom: 16001, cableLengthTo: 20000, strippingCrimping: 15, strippingSealInsertionCrimping: 18, unsheathing8AWGto4AWG: 0, unsheathing4AWGto40AWG: 0, strippingTinning: 0 },
      { cableLengthFrom: 20001, cableLengthTo: 25000, strippingCrimping: 18, strippingSealInsertionCrimping: 20, unsheathing8AWGto4AWG: 0, unsheathing4AWGto40AWG: 0, strippingTinning: 0 },
    ];
    let targetEntry = lookup?.find((x) => length >= x.cableLengthFrom && length <= x.cableLengthTo);
    const typeToTargetMap = {
      [HarnessSubProcessTypes.CuttingStrippingCrimping]: targetEntry?.strippingCrimping,
      [HarnessSubProcessTypes.CuttingStrippingSealInsertionCrimping]: targetEntry?.strippingSealInsertionCrimping,
      [HarnessSubProcessTypes.Unsheathing8AWGto4AWG]: targetEntry?.unsheathing8AWGto4AWG,
      [HarnessSubProcessTypes.Unsheathing4AWGto40AWG]: targetEntry?.unsheathing4AWGto40AWG,
      [HarnessSubProcessTypes.CuttingStrippingTinning]: targetEntry?.strippingTinning,
    };
    return typeToTargetMap[subprocessType] ?? 0;
  }

  getRibbonCableLookup(length: number, subprocessType: number) {
    let lookup = [
      { cableLengthFrom: 1, cableLengthTo: 100, ribbonCableCutting: 3, ribbonCableCrimping: 12 },
      { cableLengthFrom: 101, cableLengthTo: 250, ribbonCableCutting: 4, ribbonCableCrimping: 15 },
      { cableLengthFrom: 251, cableLengthTo: 600, ribbonCableCutting: 5, ribbonCableCrimping: 18 },
      { cableLengthFrom: 601, cableLengthTo: 1000, ribbonCableCutting: 6, ribbonCableCrimping: 22 },
      { cableLengthFrom: 1001, cableLengthTo: 2000, ribbonCableCutting: 7, ribbonCableCrimping: 25 },
    ];
    let targetEntry = lookup?.find((x) => length >= x.cableLengthFrom && length <= x.cableLengthTo);
    const typeToTargetMap = {
      [HarnessSubProcessTypes.RibbonCableCutting]: targetEntry?.ribbonCableCutting,
      [HarnessSubProcessTypes.RibbonCableCuttingCrimping]: targetEntry?.ribbonCableCrimping,
    };
    return typeToTargetMap[subprocessType] ?? 0;
  }
  getHSTLookup(length: number, subprocessType: number) {
    let lookup = [
      { cableLengthFrom: 1, cableLengthTo: 50, insertionShrinking: 8 },
      { cableLengthFrom: 51, cableLengthTo: 250, insertionShrinking: 10 },
      { cableLengthFrom: 251, cableLengthTo: 500, insertionShrinking: 14 },
      { cableLengthFrom: 501, cableLengthTo: 1000, insertionShrinking: 18 },
      { cableLengthFrom: 1001, cableLengthTo: 2000, insertionShrinking: 25 },
    ];
    let targetEntry = lookup?.find((x) => length >= x.cableLengthFrom && length <= x.cableLengthTo);
    const typeToTargetMap = {
      [HarnessSubProcessTypes.HSTInsertionShrinking]: targetEntry?.insertionShrinking,
    };
    return typeToTargetMap[subprocessType] ?? 0;
  }

  getCableTwistingWithEndTapingLookup(length: number, wireType: number) {
    let lookup = [
      { from: 1, to: 2000, wire2: 8, wire3: 10, wire4: 12 },
      { from: 2001, to: 6000, wire2: 12, wire3: 14, wire4: 16 },
      { from: 6001, to: 10000, wire2: 15, wire3: 16, wire4: 20 },
    ];
    let targetEntry = lookup?.find((x) => length >= x.from && length <= x.to);
    const typeToTargetMap = {
      [2]: targetEntry?.wire2,
      [3]: targetEntry?.wire3,
      [4]: targetEntry?.wire4,
    };
    return typeToTargetMap[wireType] ?? 0;
  }

  getCopperBraidSteelWireHeavyDutyHSTCuttingLookup(length: number, machineType: number) {
    let lookup = [
      { cableLengthFrom: 1, cableLengthTo: 100, auto: 3, semi: 4 },
      { cableLengthFrom: 101, cableLengthTo: 500, auto: 5, semi: 6 },
      { cableLengthFrom: 501, cableLengthTo: 1000, auto: 7, semi: 8 },
      { cableLengthFrom: 1001, cableLengthTo: 1500, auto: 8, semi: 10 },
      { cableLengthFrom: 1001, cableLengthTo: 2000, auto: 10, semi: 12 },
    ];
    let targetEntry = lookup?.find((x) => length >= x.cableLengthFrom && length <= x.cableLengthTo);
    const machineTypeLookup = {
      [MachineType.Automatic]: targetEntry?.auto ?? 0,
      [MachineType.SemiAuto]: targetEntry?.semi ?? 0,
      [MachineType.Manual]: 0,
    };
    return machineTypeLookup[machineType] ?? 0;
  }

  getHeatShrinkTubeNylonBraidCuttingLookup(length: number, machineType: number) {
    let lookup = [
      { cableLengthFrom: 1, cableLengthTo: 100, auto: 3, semi: 4 },
      { cableLengthFrom: 101, cableLengthTo: 500, auto: 5, semi: 6 },
      { cableLengthFrom: 501, cableLengthTo: 1000, auto: 6, semi: 8 },
      { cableLengthFrom: 1001, cableLengthTo: 1500, auto: 7, semi: 10 },
      { cableLengthFrom: 1001, cableLengthTo: 2000, auto: 8, semi: 12 },
    ];
    let targetEntry = lookup?.find((x) => length >= x.cableLengthFrom && length <= x.cableLengthTo);
    const machineTypeLookup = {
      [MachineType.Automatic]: targetEntry?.auto ?? 0,
      [MachineType.SemiAuto]: targetEntry?.semi ?? 0,
      [MachineType.Manual]: 0,
    };
    return machineTypeLookup[machineType] ?? 0;
  }

  getConduitTubePVCSleeveCuttingLookup(length: number, machineType: number) {
    let lookup = [
      { cableLengthFrom: 1, cableLengthTo: 100, auto: 3, semi: 4 },
      { cableLengthFrom: 101, cableLengthTo: 500, auto: 5, semi: 6 },
      { cableLengthFrom: 501, cableLengthTo: 1000, auto: 7, semi: 8 },
      { cableLengthFrom: 1001, cableLengthTo: 1500, auto: 8, semi: 10 },
      { cableLengthFrom: 1001, cableLengthTo: 2000, auto: 10, semi: 12 },
    ];
    let targetEntry = lookup?.find((x) => length >= x.cableLengthFrom && length <= x.cableLengthTo);
    const machineTypeLookup = {
      [MachineType.Automatic]: targetEntry?.auto ?? 0,
      [MachineType.SemiAuto]: targetEntry?.semi ?? 0,
      [MachineType.Manual]: 0,
    };
    return machineTypeLookup[machineType] ?? 0;
  }

  getHarnessMappingId(processTypeID: number) {
    const processTypeMap = {
      [ProcessType.CablePreparation]: HarnessProcessType.CablePreparation,
      [ProcessType.ConduitTubeSleeveHSTPreparation]: HarnessProcessType.ConduitTubeSleeveHSTPreparation,
      [ProcessType.EMPartAssemblyTesting]: HarnessProcessType.EMPartAssemblyTesting,
      [ProcessType.FinalInspection]: HarnessProcessType.FinalInspection,
      [ProcessType.FunctionalTestCableHarness]: HarnessProcessType.FunctionalTest,
      [ProcessType.LineAssembly]: HarnessProcessType.LineAssembly,
    };
    return processTypeMap[processTypeID] || 0;
  }

  getCuttingUnsheathingMulticoreCableLookup(length: number, machineType: number) {
    let lookup = [
      { cableLengthFrom: 1, cableLengthTo: 100, auto: 5, manual: 8 },
      { cableLengthFrom: 101, cableLengthTo: 2000, auto: 8, manual: 15 },
      { cableLengthFrom: 2001, cableLengthTo: 5000, auto: 12, manual: 20 },
      { cableLengthFrom: 5001, cableLengthTo: 8000, auto: 16, manual: 28 },
      { cableLengthFrom: 8001, cableLengthTo: 10000, auto: 20, manual: 38 },
    ];
    let targetEntry = lookup?.find((x) => length >= x.cableLengthFrom && length <= x.cableLengthTo);
    const machineTypeLookup = {
      [MachineType.Automatic]: targetEntry?.auto ?? 0,
      [MachineType.Manual]: targetEntry?.manual ?? 0,
      [MachineType.SemiAuto]: 0,
    };
    return machineTypeLookup[machineType] ?? 0;
  }

  getUltrasonicWireWeldingCycletime() {
    return [
      { id: 1, wireSize: '< 5mm2', time: 6 },
      { id: 2, wireSize: '5 to 10mm2', time: 12 },
      { id: 3, wireSize: '11 to 25mm2', time: 16 },
      { id: 4, wireSize: '26 to 40mm2', time: 22 },
      { id: 5, wireSize: '41 to 70mm2', time: 28 },
    ];
  }

  getLayoutComplexity() {
    return [
      { id: 1, name: 'Simple' },
      { id: 2, name: 'Medium' },
      { id: 3, name: 'Complex' },
      { id: 4, name: 'Super Complex' },
    ];
  }

  getBraidedShieldStrandsTwistingCycletime() {
    return [
      { id: 1, twistingLen: '< 50 mm', time: 8 },
      { id: 2, twistingLen: '< 100 mm', time: 15 },
      { id: 3, twistingLen: '< 150 mm', time: 20 },
      { id: 4, twistingLen: '< 200 mm', time: 25 },
      { id: 5, twistingLen: '< 250 mm', time: 30 },
    ];
  }

  getTerminalCrimpingDCOpenBarrelFerruleLookup(cableGauge: number, semiAutoOrAuto: number) {
    const lookup = [
      { from: 1, to: 24, gauge: 4, manual: 12, semi: 6 },
      { from: 24, to: 26, gauge: 10, manual: 18, semi: 10 },
      { from: 26, to: 31, gauge: 50, manual: 30, semi: 15 },
      { from: 32, to: 34, gauge: 120, manual: 45, semi: 18 },
    ];
    // const awgValue = this.getCableGaugeList()?.find((x) => x.id === cableGauge)?.name;
    //const valueInSqmm = this.getAwgToSqmm(awgValue);
    let res = lookup?.find((x) => cableGauge >= x.from && cableGauge <= x.to);
    return Number(semiAutoOrAuto) === MachineType.Manual ? res?.manual : Number(semiAutoOrAuto) === MachineType.SemiAuto ? res?.semi : 0;
  }
  getCableGaugeList() {
    return [
      { id: 1, name: '42' },
      { id: 2, name: '40' },
      { id: 3, name: '38' },
      { id: 4, name: '37' },
      { id: 5, name: '36' },
      { id: 6, name: '34' },
      { id: 7, name: '33' },
      { id: 8, name: '32' },
      { id: 9, name: '31' },
      { id: 10, name: '30' },
      { id: 11, name: '29' },
      { id: 12, name: '28' },
      { id: 13, name: '27' },
      { id: 14, name: '26' },
      { id: 15, name: '25' },
      { id: 16, name: '24' },
      { id: 17, name: '23' },
      { id: 18, name: '22' },
      { id: 19, name: '21' },
      { id: 20, name: '20' },
      { id: 21, name: '18' },
      { id: 22, name: '16' },
      { id: 23, name: '14' },
      { id: 24, name: '12' },
      { id: 25, name: '10' },
      { id: 26, name: '8' },
      { id: 27, name: '6' },
      { id: 28, name: '4' },
      { id: 29, name: '2' },
      { id: 30, name: '1' },
      { id: 31, name: '1/0' },
      { id: 32, name: '2/0' },
      { id: 33, name: '3/0' },
      { id: 34, name: '4/0' },
    ];
  }

  getTerminalCrimpingSCOpenBarrelFerrulelookup(cableGauge: number, machineType: number) {
    let lookup = [
      { from: 51, to: 120, manual: 20, semi: 10 },
      { from: 11, to: 50, manual: 16, semi: 8 },
      { from: 5, to: 10, manual: 12, semi: 5 },
      { from: 0, to: 4, manual: 8, semi: 4 },
    ];
    const awgValue = this.getCableGaugeList()?.find((x) => x.id === Number(cableGauge))?.name;
    const valueInSqmm = this.getAwgToSqmm(awgValue);
    let targetEntry = lookup?.find((x) => valueInSqmm >= x.from && valueInSqmm <= x.to);
    const machineTypeLookup = {
      [MachineType.SemiAuto]: targetEntry?.semi ?? 0,
      [MachineType.Manual]: targetEntry?.manual ?? 0,
    };
    return machineTypeLookup[machineType] ?? 0;
  }

  getAwgToSqmm(awgVal: string) {
    let list = [
      { awg: '42', sqmm: 0.0032 },
      { awg: '40', sqmm: 0.004 },
      { awg: '38', sqmm: 0.004 },
      { awg: '37', sqmm: 0.004 },
      { awg: '36', sqmm: 0.004 },
      { awg: '34', sqmm: 0.004 },
      { awg: '33', sqmm: 0.004 },
      { awg: '32', sqmm: 0.004 },
      { awg: '31', sqmm: 0.004 },
      { awg: '30', sqmm: 0.004 },
      { awg: '29', sqmm: 0.004 },
      { awg: '28', sqmm: 0.004 },
      { awg: '27', sqmm: 0.004 },
      { awg: '26', sqmm: 0.004 },
      { awg: '25', sqmm: 0.004 },
      { awg: '24', sqmm: 0.004 },
      { awg: '23', sqmm: 0.004 },
      { awg: '22', sqmm: 0.004 },
      { awg: '21', sqmm: 0.004 },
      { awg: '20', sqmm: 0.5 },
      { awg: '18', sqmm: 0.75 },
      { awg: '16', sqmm: 1.5 },
      { awg: '14', sqmm: 2.5 },
      { awg: '12', sqmm: 4 },
      { awg: '10', sqmm: 6 },
      { awg: '8', sqmm: 10 },
      { awg: '6', sqmm: 16 },
      { awg: '4', sqmm: 25 },
      { awg: '2', sqmm: 35 },
      { awg: '1', sqmm: 35 },
      { awg: '1/0', sqmm: 50 },
      { awg: '2/0', sqmm: 70 },
      { awg: '3/0', sqmm: 95 },
      { awg: '4/0', sqmm: 120 },
    ];

    return list.find((x) => x.awg === awgVal)?.sqmm || 0;
  }

  getConduitTubeCuttingSlittingLookup(length: number, subprocessType: number) {
    let lookup = [
      { cableLengthFrom: 1, cableLengthTo: 100, conduitTubeCuttingSlitting: 4 },
      { cableLengthFrom: 101, cableLengthTo: 500, conduitTubeCuttingSlitting: 6 },
      { cableLengthFrom: 501, cableLengthTo: 1000, conduitTubeCuttingSlitting: 8 },
      { cableLengthFrom: 1001, cableLengthTo: 1500, conduitTubeCuttingSlitting: 10 },
      { cableLengthFrom: 1001, cableLengthTo: 2000, conduitTubeCuttingSlitting: 12 },
    ];
    let targetEntry = lookup?.find((x) => length >= x.cableLengthFrom && length <= x.cableLengthTo);
    const typeToTargetMap = {
      [HarnessSubProcessTypes.ConduitTubeCuttingSlitting]: targetEntry?.conduitTubeCuttingSlitting,
    };
    return typeToTargetMap[subprocessType] ?? 0;
  }

  getTubeSleeveBraidInsertionFixingLookup(length: number) {
    let lookup = [
      { cableLengthFrom: 1, cableLengthTo: 100, tubeSleeveBraidInsertionFixing: 8 },
      { cableLengthFrom: 101, cableLengthTo: 250, tubeSleeveBraidInsertionFixing: 10 },
      { cableLengthFrom: 251, cableLengthTo: 600, tubeSleeveBraidInsertionFixing: 12 },
      { cableLengthFrom: 601, cableLengthTo: 1000, tubeSleeveBraidInsertionFixing: 15 },
      { cableLengthFrom: 1001, cableLengthTo: 1500, tubeSleeveBraidInsertionFixing: 20 },
      { cableLengthFrom: 1501, cableLengthTo: 2000, tubeSleeveBraidInsertionFixing: 25 },
    ];
    let targetEntry = lookup?.find((x) => length >= x.cableLengthFrom && length <= x.cableLengthTo);
    return targetEntry?.tubeSleeveBraidInsertionFixing ?? 0;
  }

  getRASTConnectorCrimpingLookup(length: number) {
    let lookup = [
      { from: 1, to: 6, time: 18 },
      { from: 7, to: 12, time: 22 },
      { from: 13, to: 24, time: 36 },
      { from: 25, to: 36, time: 48 },
      { from: 37, to: 48, time: 65 },
    ];
    let targetEntry = lookup?.find((x) => length >= x.from && length <= x.to);
    return targetEntry?.time ?? 0;
  }

  getContinuityTestShortCircuitIRTestLookup(length: number, subprocessType: number) {
    let lookup = [
      { from: 1, to: 20, connectorCrimping: 15, continuityTestHVTest: 25 },
      { from: 21, to: 50, connectorCrimping: 25, continuityTestHVTest: 40 },
      { from: 26, to: 100, connectorCrimping: 40, continuityTestHVTest: 60 },
      { from: 101, to: 150, connectorCrimping: 60, continuityTestHVTest: 75 },
      { from: 151, to: 200, connectorCrimping: 75, continuityTestHVTest: 90 },
      { from: 201, to: 250, connectorCrimping: 90, continuityTestHVTest: 110 },
      { from: 251, to: 300, connectorCrimping: 120, continuityTestHVTest: 135 },
    ];
    let targetEntry = lookup?.find((x) => length >= x.from && length <= x.to);
    const typeToTargetMap = {
      [HarnessSubProcessTypes.ContinuityTestShortCircuitIRTest]: targetEntry?.connectorCrimping,
      [HarnessSubProcessTypes.ContinuityTestHVTest]: targetEntry?.continuityTestHVTest,
    };
    return typeToTargetMap[subprocessType] ?? 0;
  }

  getDefaultAutomationLevel(subprocessType: number) {
    const subrocessToAutomationLevel = {
      [HarnessSubProcessTypes.CuttingStrippingCrimping]: MachineType.Automatic,
      [HarnessSubProcessTypes.CuttingStrippingSealInsertionCrimping]: MachineType.Automatic,
      [HarnessSubProcessTypes.Unsheathing8AWGto4AWG]: MachineType.Automatic,
      [HarnessSubProcessTypes.Unsheathing4AWGto40AWG]: MachineType.Automatic,
      [HarnessSubProcessTypes.CuttingStrippingTinning]: MachineType.Automatic,
      [HarnessSubProcessTypes.StrippingStrandsTwisting]: MachineType.SemiAuto,
      [HarnessSubProcessTypes.CoaxialStrippingMultiLayer]: MachineType.SemiAuto,
      [HarnessSubProcessTypes.TerminalCrimpingSCOpenBarrelFerrule]: MachineType.SemiAuto,
      [HarnessSubProcessTypes.TerminalCrimpingDCOpenBarrelFerrule]: MachineType.SemiAuto,
      [HarnessSubProcessTypes.RibbonCableCutting]: MachineType.Automatic,
      [HarnessSubProcessTypes.RibbonCableCuttingCrimping]: MachineType.Automatic,
      [HarnessSubProcessTypes.TerminalCrimpingClosedBarrel]: MachineType.SemiAuto,
      [HarnessSubProcessTypes.StrandsTwistingTinning]: MachineType.SemiAuto,
      [HarnessSubProcessTypes.SolderingWiretoWire]: MachineType.SemiAuto,
      [HarnessSubProcessTypes.IPEXConnectorCrimping]: MachineType.SemiAuto,
      [HarnessSubProcessTypes.HSTInsertionShrinking]: MachineType.SemiAuto,
      [HarnessSubProcessTypes.HSTMarkingCutting]: MachineType.Automatic,
      [HarnessSubProcessTypes.AluminiumFoilCutting]: MachineType.SemiAuto,
      [HarnessSubProcessTypes.UltrasonicWireWelding]: MachineType.SemiAuto,
      [HarnessSubProcessTypes.UltrasonicWiretoTerminalWelding]: MachineType.SemiAuto,
      [HarnessSubProcessTypes.UltrasonicWiretoLugWelding]: MachineType.SemiAuto,
      [HarnessSubProcessTypes.BraidBrushingTwisting]: MachineType.SemiAuto,
      [HarnessSubProcessTypes.BraidCuttingFolding]: MachineType.SemiAuto,
      [HarnessSubProcessTypes.RubberSealInsertionManual]: MachineType.Manual,
      [HarnessSubProcessTypes.StrippingandCrimping]: MachineType.SemiAuto,
      [HarnessSubProcessTypes.SpliceCrimping]: MachineType.SemiAuto,
      [HarnessSubProcessTypes.WireSplicing]: MachineType.Manual,
      [HarnessSubProcessTypes.CableTwistingWithEndTaping]: MachineType.SemiAuto,
      [HarnessSubProcessTypes.ConduitTubeCuttingSlitting]: MachineType.Automatic,
      [HarnessSubProcessTypes.CopperBraidSteelWireHeavyDutyHSTCutting]: MachineType.Automatic,
      [HarnessSubProcessTypes.HeatShrinkTubeNylonBraidCutting]: MachineType.Automatic,
      [HarnessSubProcessTypes.ConduitTubePVCSleeveCutting]: MachineType.Automatic,
      [HarnessSubProcessTypes.PartAssembly]: MachineType.Manual,
      [HarnessSubProcessTypes.CableTieFixing]: MachineType.Manual,
      [HarnessSubProcessTypes.TapeWrapping]: MachineType.SemiAuto,
      [HarnessSubProcessTypes.LabelFixingOffline]: MachineType.SemiAuto,
      [HarnessSubProcessTypes.ProtectorFitmentBoltTightening]: MachineType.SemiAuto,
      [HarnessSubProcessTypes.TubeSleeveBraidInsertionFixing]: MachineType.Manual,
      [HarnessSubProcessTypes.LayoutRouting]: MachineType.Manual,
      [HarnessSubProcessTypes.Taping]: MachineType.Manual,
      [HarnessSubProcessTypes.SecLockCoverStrainReliefBootInsertion]: MachineType.Manual,
      [HarnessSubProcessTypes.PartIDLabelFixing]: MachineType.Manual,
      [HarnessSubProcessTypes.GrommetFerriteInsertionFixing]: MachineType.Manual,
      [HarnessSubProcessTypes.ComponentPotting]: MachineType.Automatic,
      [HarnessSubProcessTypes.BracketProtectorFitment]: MachineType.Manual,
      [HarnessSubProcessTypes.FakraStraightConnectorAssembly]: MachineType.Manual,
      [HarnessSubProcessTypes.Fakra90DegreeConnectorAssembly]: MachineType.Manual,
      [HarnessSubProcessTypes.DummyPlugInsertion]: MachineType.Manual,
      [HarnessSubProcessTypes.TerminalInsertionConnectorization]: MachineType.Manual,
      [HarnessSubProcessTypes.EMPartInsertionFuseRelaySwitch]: MachineType.Manual,
      [HarnessSubProcessTypes.ClipClampFixing]: MachineType.Manual,
      [HarnessSubProcessTypes.IDCConnectorCrimpingFRC]: MachineType.SemiAuto,
      [HarnessSubProcessTypes.RASTConnectorCrimping]: MachineType.SemiAuto,
      [HarnessSubProcessTypes.ContinuityTestShortCircuitIRTest]: MachineType.SemiAuto,
      [HarnessSubProcessTypes.ContinuityTestHVTest]: MachineType.SemiAuto,
      [HarnessSubProcessTypes.ClipClampFitmentTest]: MachineType.SemiAuto,
      [HarnessSubProcessTypes.EOLLabelFixing]: MachineType.SemiAuto,
      [HarnessSubProcessTypes.FuseRelaySwitchInsertionTesting]: MachineType.SemiAuto,
      [HarnessSubProcessTypes.VisualInspection]: MachineType.Manual,
      [HarnessSubProcessTypes.CableGlandAssembly]: MachineType.Manual,
      [HarnessSubProcessTypes.BackshellAssemblyStraight]: MachineType.Manual,
      [HarnessSubProcessTypes.BackshellAssemblyRightAngle]: MachineType.Manual,
      [HarnessSubProcessTypes.WireCableTinning]: MachineType.SemiAuto,
      [HarnessSubProcessTypes.CuttingUnsheathingMulticoreCable]: MachineType.Automatic,
      [HarnessSubProcessTypes.InsulationStripping]: MachineType.SemiAuto,
      [HarnessSubProcessTypes.SleeveShrinking]: MachineType.SemiAuto,
      [HarnessSubProcessTypes.ShieldBraidPreparation]: MachineType.Manual,
      [HarnessSubProcessTypes.JackConnectorCrimpingRJ45RJ11]: MachineType.SemiAuto,
      [HarnessSubProcessTypes.ConnectorKitAssembly]: MachineType.Manual,
    };
    return subrocessToAutomationLevel[subprocessType] ?? 0;
  }

  getClipClampFitmentTestLookup(length: number) {
    let lookup = [
      { from: 1, to: 20, time: 35 },
      { from: 21, to: 50, time: 60 },
      { from: 51, to: 100, time: 120 },
    ];
    let targetEntry = lookup?.find((x) => length >= x.from && length <= x.to);
    return targetEntry?.time ?? 0;
  }

  getAutomationLevelList(subprocessTypeId: number = 0) {
    if (
      subprocessTypeId > 0 &&
      [
        HarnessSubProcessTypes.AluminiumFoilCutting,
        HarnessSubProcessTypes.BraidCuttingFolding,
        HarnessSubProcessTypes.CableTieFixing,
        HarnessSubProcessTypes.StrippingStrandsTwisting,
        HarnessSubProcessTypes.TerminalCrimpingSCOpenBarrelFerrule,
        HarnessSubProcessTypes.TerminalCrimpingDCOpenBarrelFerrule,
        HarnessSubProcessTypes.TerminalCrimpingClosedBarrel,
        HarnessSubProcessTypes.JackConnectorCrimpingRJ45RJ11,
        HarnessSubProcessTypes.InsulationStripping,
      ].includes(subprocessTypeId)
    ) {
      return [
        { id: 2, name: 'Semi-Automatic' },
        { id: 3, name: 'Manual' },
      ];
    } else if (
      subprocessTypeId > 0 &&
      [
        HarnessSubProcessTypes.BackshellAssemblyRightAngle,
        HarnessSubProcessTypes.BackshellAssemblyStraight,
        HarnessSubProcessTypes.BracketProtectorFitment,
        HarnessSubProcessTypes.CableGlandAssembly,
        HarnessSubProcessTypes.ClipClampFixing,
        HarnessSubProcessTypes.DummyPlugInsertion,
        HarnessSubProcessTypes.EMPartInsertionFuseRelaySwitch,
        HarnessSubProcessTypes.Fakra90DegreeConnectorAssembly,
        HarnessSubProcessTypes.FakraStraightConnectorAssembly,
        HarnessSubProcessTypes.GrommetFerriteInsertionFixing,
        HarnessSubProcessTypes.LayoutRouting,
        HarnessSubProcessTypes.PartAssembly,
        HarnessSubProcessTypes.PartIDLabelFixing,
        HarnessSubProcessTypes.RubberSealInsertionManual,
        HarnessSubProcessTypes.SecLockCoverStrainReliefBootInsertion,
        HarnessSubProcessTypes.Taping,
        HarnessSubProcessTypes.TerminalInsertionConnectorization,
        HarnessSubProcessTypes.TubeSleeveBraidInsertionFixing,
        HarnessSubProcessTypes.VisualInspection,
        HarnessSubProcessTypes.WireSplicing,
        HarnessSubProcessTypes.ConnectorKitAssembly,
        HarnessSubProcessTypes.ShieldBraidPreparation,
      ].includes(subprocessTypeId)
    ) {
      return [{ id: 3, name: 'Manual' }];
    } else if (
      subprocessTypeId > 0 &&
      [
        HarnessSubProcessTypes.BraidBrushingTwisting,
        HarnessSubProcessTypes.CableTwistingWithEndTaping,
        HarnessSubProcessTypes.ClipClampFitmentTest,
        HarnessSubProcessTypes.CoaxialStrippingMultiLayer,
        HarnessSubProcessTypes.ContinuityTestHVTest,
        HarnessSubProcessTypes.ContinuityTestShortCircuitIRTest,
        HarnessSubProcessTypes.EOLLabelFixing,
        HarnessSubProcessTypes.HSTInsertionShrinking,
        HarnessSubProcessTypes.IDCConnectorCrimpingFRC,
        HarnessSubProcessTypes.IPEXConnectorCrimping,
        HarnessSubProcessTypes.LabelFixingOffline,
        HarnessSubProcessTypes.ProtectorFitmentBoltTightening,
        HarnessSubProcessTypes.RASTConnectorCrimping,
        HarnessSubProcessTypes.SolderingWiretoWire,
        HarnessSubProcessTypes.SpliceCrimping,
        HarnessSubProcessTypes.StrandsTwistingTinning,
        HarnessSubProcessTypes.StrippingandCrimping,
        HarnessSubProcessTypes.TapeWrapping,
        HarnessSubProcessTypes.UltrasonicWiretoLugWelding,
        HarnessSubProcessTypes.UltrasonicWiretoTerminalWelding,
        HarnessSubProcessTypes.UltrasonicWireWelding,
        HarnessSubProcessTypes.FuseRelaySwitchInsertionTesting,
        HarnessSubProcessTypes.SleeveShrinking,
        HarnessSubProcessTypes.WireCableTinning,
      ].includes(subprocessTypeId)
    ) {
      return [{ id: 2, name: 'Semi-Automatic' }];
    } else if (
      subprocessTypeId > 0 &&
      [
        HarnessSubProcessTypes.ComponentPotting,
        HarnessSubProcessTypes.ConduitTubeCuttingSlitting,
        HarnessSubProcessTypes.Unsheathing4AWGto40AWG,
        HarnessSubProcessTypes.Unsheathing8AWGto4AWG,
        HarnessSubProcessTypes.CuttingStrippingCrimping,
        HarnessSubProcessTypes.CuttingStrippingTinning,
        HarnessSubProcessTypes.CuttingStrippingSealInsertionCrimping,
        HarnessSubProcessTypes.HSTMarkingCutting,
        HarnessSubProcessTypes.RibbonCableCutting,
        HarnessSubProcessTypes.RibbonCableCuttingCrimping,
      ].includes(subprocessTypeId)
    ) {
      return [{ id: 1, name: 'Automatic' }];
    } else if (
      subprocessTypeId > 0 &&
      [HarnessSubProcessTypes.ConduitTubePVCSleeveCutting, HarnessSubProcessTypes.CopperBraidSteelWireHeavyDutyHSTCutting, HarnessSubProcessTypes.HeatShrinkTubeNylonBraidCutting].includes(
        subprocessTypeId
      )
    ) {
      return [
        { id: 1, name: 'Automatic' },
        { id: 2, name: 'Semi-Automatic' },
      ];
    }
    if (subprocessTypeId > 0 && [HarnessSubProcessTypes.CuttingUnsheathingMulticoreCable].includes(subprocessTypeId)) {
      return [
        { id: 1, name: 'Automatic' },
        { id: 3, name: 'Manual' },
      ];
    } else {
      return [
        { id: 1, name: 'Automatic' },
        { id: 2, name: 'Semi-Automatic' },
        { id: 3, name: 'Manual' },
      ];
    }
  }

  getSubTypeNamebyId(processInfo: ProcessInfoDto) {
    const subProcessTypeID = processInfo?.subProcessTypeInfos && processInfo?.subProcessTypeInfos[0]?.subProcessTypeId;
    const processTypes = [
      { processTypeId: 291, primaryProcess: 'Cutting, Stripping & Crimping' },
      { processTypeId: 292, primaryProcess: 'Cutting, Stripping, Seal Insertion & Crimping' },
      { processTypeId: 293, primaryProcess: 'Cutting & Unsheathing (8 AWG to 4 AWG)' },
      { processTypeId: 294, primaryProcess: 'Cutting & Unsheathing (4 AWG to 4/0 AWG)' },
      { processTypeId: 295, primaryProcess: 'Cutting, Stripping & Tinning' },
      { processTypeId: 296, primaryProcess: 'Stripping & Strands Twisting' },
      { processTypeId: 297, primaryProcess: 'Coaxial Stripping (Multi-Layer)' },
      { processTypeId: 298, primaryProcess: 'Terminal Crimping - SC (Open Barrel, Ferrule)' },
      { processTypeId: 299, primaryProcess: 'Terminal Crimping - DC (Open Barrel, Ferrule)' },
      { processTypeId: 300, primaryProcess: 'Ribbon Cable Cutting' },
      { processTypeId: 301, primaryProcess: 'Ribbon Cable Cutting & Crimping' },
      { processTypeId: 302, primaryProcess: 'Terminal Crimping (Closed Barrel)' },
      { processTypeId: 303, primaryProcess: 'Strands Twisting & Tinning' },
      { processTypeId: 304, primaryProcess: 'Soldering - Wire to Wire' },
      { processTypeId: 305, primaryProcess: 'IPEX Connector Crimping' },
      { processTypeId: 306, primaryProcess: 'HST Insertion & Shrinking' },
      { processTypeId: 307, primaryProcess: 'HST Marking & Cutting' },
      { processTypeId: 308, primaryProcess: 'Aluminium Foil Cutting' },
      { processTypeId: 309, primaryProcess: 'Ultrasonic Wire Welding' },
      { processTypeId: 310, primaryProcess: 'Ultrasonic Wire to Terminal Welding' },
      { processTypeId: 311, primaryProcess: 'Ultrasonic Wire to Lug Welding' },
      { processTypeId: 312, primaryProcess: 'Braid Brushing & Twisting' },
      { processTypeId: 313, primaryProcess: 'Braid Cutting & Folding' },
      { processTypeId: 314, primaryProcess: 'Rubber Seal Insertion (Manual)' },
      { processTypeId: 315, primaryProcess: 'Stripping and Crimping' },
      { processTypeId: 316, primaryProcess: 'Splice Crimping' },
      { processTypeId: 317, primaryProcess: 'Wire Splicing' },
      { processTypeId: 318, primaryProcess: 'Cable Twisting (with end taping)' },
      { processTypeId: 319, primaryProcess: 'Conduit Tube Cutting & Slitting' },
      { processTypeId: 320, primaryProcess: 'Copper Braid/ Steel Wire/Heavy Duty HST Cutting' },
      { processTypeId: 321, primaryProcess: 'Heat Shrink Tube/Nylon Braid Cutting' },
      { processTypeId: 322, primaryProcess: 'Conduit Tube/PVC Sleeve Cutting' },
      { processTypeId: 323, primaryProcess: 'Part Assembly' },
      { processTypeId: 324, primaryProcess: 'Cable Tie Fixing' },
      { processTypeId: 325, primaryProcess: 'Tape Wrapping' },
      { processTypeId: 326, primaryProcess: 'Label Fixing (Offline)' },
      { processTypeId: 327, primaryProcess: 'Protector Fitment & Bolt Tightening' },
      { processTypeId: 328, primaryProcess: 'Tube/Sleeve/Braid Insertion & Fixing' },
      { processTypeId: 329, primaryProcess: 'Layout / Routing' },
      { processTypeId: 330, primaryProcess: 'Taping' },
      { processTypeId: 331, primaryProcess: 'Sec. Lock, Cover, Strain Relief & Boot Insertion' },
      { processTypeId: 332, primaryProcess: 'Part ID Label Fixing' },
      { processTypeId: 333, primaryProcess: 'Grommet / Ferrite Insertion & Fixing' },
      { processTypeId: 334, primaryProcess: 'Component Potting' },
      { processTypeId: 335, primaryProcess: 'Bracket / Protector Fitment' },
      { processTypeId: 336, primaryProcess: 'Fakra - Straight Connector Assembly' },
      { processTypeId: 337, primaryProcess: 'Fakra - 90 Degree Connector Assembly' },
      { processTypeId: 338, primaryProcess: 'Dummy Plug Insertion' },
      { processTypeId: 339, primaryProcess: 'Terminal Insertion / Connectorization' },
      { processTypeId: 340, primaryProcess: 'EM Part Insertion (Fuse / Relay / Switch)' },
      { processTypeId: 341, primaryProcess: 'Clip / Clamp Fixing' },
      { processTypeId: 342, primaryProcess: 'IDC Connector Crimping (FRC)' },
      { processTypeId: 343, primaryProcess: 'RAST Connector Crimping' },
      { processTypeId: 344, primaryProcess: 'Continuity Test, Short Circuit & IR Test' },
      { processTypeId: 345, primaryProcess: 'Continuity Test & HV Test' },
      { processTypeId: 346, primaryProcess: 'Clip / Clamp Fitment Test' },
      { processTypeId: 347, primaryProcess: 'EOL Label Fixing' },
      { processTypeId: 348, primaryProcess: 'Fuse / Relay / Switch Insertion & Testing' },
      { processTypeId: 349, primaryProcess: 'Visual Inspection' },
      { processTypeId: 350, primaryProcess: 'Cable Gland Assembly' },
      { processTypeId: 351, primaryProcess: 'Backshell Assembly' },
      { processTypeId: 352, primaryProcess: 'Backshell Assembly (Right Angle)' },
      { processTypeId: 362, primaryProcess: 'Wire/Cable -Tinning' },
      { processTypeId: 363, primaryProcess: 'Cutting & Unsheathing (Multicore Cable)' },
      { processTypeId: 364, primaryProcess: 'Insulation Stripping' },
      { processTypeId: 365, primaryProcess: 'Sleeve Shrinking' },
      { processTypeId: 366, primaryProcess: 'Shield/Braid Preparation' },
      { processTypeId: 367, primaryProcess: 'Jack Connector Crimping  (RJ45/RJ11)' },
      { processTypeId: 368, primaryProcess: 'Connector/Kit Assembly' },
    ];
    return processTypes?.find((x) => x.processTypeId === subProcessTypeID)?.primaryProcess || 'N/A';
  }
}

export enum WiringHarnessTypes {
  CableCutting = 1,
  Spliceing = 2,
  HeatShrink = 3,
  TubeConduit = 4,
  SleeveTubeInsertion = 5,
  TerminalCrimping = 6,
  Soldering = 7,
  LayoutRouting = 8,
  ConduitInsertion = 9,
  Taping = 10,
  TagFixing = 11,
  ConnectorAdaptorInsertion = 12,
  Hanking = 13,
  WHRouting = 14,
  ContinuityTest = 15,
  EOLLabelFixing = 16,
  VisualInspection = 17,

  ElectroMech = 18,
  Grommet = 19,
  Potting = 20,
  BracketChannel = 21,
  BraidedShieldCutting = 22,
  BraidedShieldStrandsTwisting = 23,
  BraidedShieldTerminalCrimping = 24,
  AluminiumFoilCutting = 25,
  BraidedShieldFolding = 26,
  InnerCoreStripping = 27,
  UltrasonicWireWelding = 28,
  FakraStraightConnectorAssembly = 29,
  Fakra90DegreeConnectorAssembly = 30,
}

export enum RoutingComplexity {
  Simple = 1,
  Moderate = 2,
  Complex = 3,
  SuperComplex = 4,
}

export enum HarnessSubProcessTypes {
  CuttingStrippingCrimping = 291,
  CuttingStrippingSealInsertionCrimping = 292,
  Unsheathing8AWGto4AWG = 293,
  Unsheathing4AWGto40AWG = 294,
  CuttingStrippingTinning = 295,
  StrippingStrandsTwisting = 296,
  CoaxialStrippingMultiLayer = 297,
  TerminalCrimpingSCOpenBarrelFerrule = 298,
  TerminalCrimpingDCOpenBarrelFerrule = 299,
  RibbonCableCutting = 300,
  RibbonCableCuttingCrimping = 301,
  TerminalCrimpingClosedBarrel = 302,
  StrandsTwistingTinning = 303,
  SolderingWiretoWire = 304,
  IPEXConnectorCrimping = 305,
  HSTInsertionShrinking = 306,
  HSTMarkingCutting = 307,
  AluminiumFoilCutting = 308,
  UltrasonicWireWelding = 309,
  UltrasonicWiretoTerminalWelding = 310,
  UltrasonicWiretoLugWelding = 311,
  BraidBrushingTwisting = 312,
  BraidCuttingFolding = 313,
  RubberSealInsertionManual = 314,
  StrippingandCrimping = 315,
  SpliceCrimping = 316,
  WireSplicing = 317,
  CableTwistingWithEndTaping = 318,
  ConduitTubeCuttingSlitting = 319,
  CopperBraidSteelWireHeavyDutyHSTCutting = 320,
  HeatShrinkTubeNylonBraidCutting = 321,
  ConduitTubePVCSleeveCutting = 322,
  PartAssembly = 323,
  CableTieFixing = 324,
  TapeWrapping = 325,
  LabelFixingOffline = 326,
  ProtectorFitmentBoltTightening = 327,
  TubeSleeveBraidInsertionFixing = 328,
  LayoutRouting = 329,
  Taping = 330,
  SecLockCoverStrainReliefBootInsertion = 331,
  PartIDLabelFixing = 332,
  GrommetFerriteInsertionFixing = 333,
  ComponentPotting = 334,
  BracketProtectorFitment = 335,
  FakraStraightConnectorAssembly = 336,
  Fakra90DegreeConnectorAssembly = 337,
  DummyPlugInsertion = 338,
  TerminalInsertionConnectorization = 339,
  EMPartInsertionFuseRelaySwitch = 340,
  ClipClampFixing = 341,
  IDCConnectorCrimpingFRC = 342,
  RASTConnectorCrimping = 343,
  ContinuityTestShortCircuitIRTest = 344,
  ContinuityTestHVTest = 345,
  ClipClampFitmentTest = 346,
  EOLLabelFixing = 347,
  FuseRelaySwitchInsertionTesting = 348,
  VisualInspection = 349,
  CableGlandAssembly = 350,
  BackshellAssemblyStraight = 351,
  BackshellAssemblyRightAngle = 352,

  WireCableTinning = 362,
  CuttingUnsheathingMulticoreCable = 363,
  InsulationStripping = 364,
  SleeveShrinking = 365,
  ShieldBraidPreparation = 366,
  JackConnectorCrimpingRJ45RJ11 = 367,
  ConnectorKitAssembly = 368,
}

export enum HarnessProcessType {
  CablePreparation = 106,
  ConduitTubeSleeveHSTPreparation = 107,
  EMPartAssemblyTesting = 108,
  FinalInspection = 109,
  FunctionalTest = 110,
  LineAssembly = 111,
}
