import {
  BendingToolTypes,
  CommodityType,
  MachineType,
  MachineTypeName,
  MachineTypePercentage,
  PrimaryProcessType,
  ProcessType,
  StampingType,
  MachiningTypes,
} from 'src/app/modules/costing/costing.config';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { BillOfMaterialDto, LaborRateMasterDto, MaterialInfoDto, MedbMachinesMasterDto, MedbMachineTypeMasterDto, MedbProcessTypeMasterDto, PartInfoDto, ProcessInfoDto } from '../models';
import { AssemblyConfigService } from './manufacturing-assembly-config';
import { ElectronicsConfigService } from './manufacturing-electronics-config';
import { ManufacturingMachiningConfigService } from './manufacturing-machining-config';
import { ManufacturingForgingSubProcessConfigService } from './costing-manufacturing-forging-sub-process-config';
import { BrazingConfigService } from './brazing-config.service';
import { SMTTypes, ThroughHoleLineTypes } from 'src/app/shared/config/manufacturing-electronics-config';
import { ManufacturingCastingConfigService } from './manufacturing-casting-config';
import { SheetMetalConfigService } from 'src/app/shared/config/sheetmetal-config';
import { CompressionMoldingMapperService } from '../mapping/manufacturing-compression-mold-mapper';
import { SheetMetalProcessMapperService } from 'src/app/shared/mapping/sheet-metal-process-mapper';
import { PlatingConfigService } from './plating-config';
import { DigitalFactoryHelper } from 'src/app/modules/costing/services/digital-factory-helper';
import { SubProcessTypeInfoDto } from '../models/subprocess-info.model';
import { WireHarnessConfigService } from './manufacturing-wire-harness-config';
import { PartComplexity } from '../enums';
export const ComplexityConfig = {
  [PartComplexity.Low]: { sideCoreMechanisms: 2, packAndHoldTime: 1, partEjection: 3 },
  [PartComplexity.Medium]: { sideCoreMechanisms: 4, packAndHoldTime: 2, partEjection: 5.5 },
  [PartComplexity.High]: { sideCoreMechanisms: 8, packAndHoldTime: 3, partEjection: 8 },
};
export const ComplexityDefaultConfig = { sideCoreMechanisms: 0, packAndHoldTime: 5, partEjection: 0 };

export class ManufacturingConfigService {
  nobakeProcesses = [
    ProcessType.CastingCorePreparation,
    ProcessType.CastingCoreAssembly,
    ProcessType.CastingMoldMaking,
    ProcessType.MeltingCasting,
    ProcessType.CastingMoldAssembly,
    ProcessType.PouringCasting,
    ProcessType.CastingShakeout,
    ProcessType.CastingDegating,
    ProcessType.ShotBlasting,
    ProcessType.CastingFettling,
    ProcessType.RadiographyTesting,
    ProcessType.MetullurgicalInspection,
    ProcessType.ManualInspection,
  ];
  greenProcesses = [
    ProcessType.CastingCorePreparation,
    ProcessType.CastingCoreAssembly,
    ProcessType.MoldPerparation,
    ProcessType.MeltingCasting,
    ProcessType.PouringCasting,
    ProcessType.CastingShakeout,
    ProcessType.CastingDegating,
    ProcessType.ShotBlasting,
    ProcessType.CastingFettling,
    ProcessType.RadiographyTesting,
    ProcessType.MetullurgicalInspection,
    ProcessType.ManualInspection,
  ];
  hpdcProcesses = [
    ProcessType.HighPressureDieCasting,
    ProcessType.MeltingCasting,
    ProcessType.TrimmingPress, // to ck for automation
    ProcessType.ShotBlasting,
    ProcessType.CastingFettling,
    ProcessType.RadiographyTesting,
    ProcessType.MetullurgicalInspection,
    ProcessType.ManualInspection,
    // ProcessType.LeakTesting,
    ProcessType.IonicWashing,
    ProcessType.IonicTesting,
    // ProcessType.BearingPressing,
    // ProcessType.VaccumeImpregnation,
    ProcessType.CleaningCasting,
  ];
  gdcProcesses = [
    ProcessType.CastingCorePreparation,
    ProcessType.CastingCoreAssembly,
    ProcessType.GravityDieCasting,
    ProcessType.MeltingCasting,
    ProcessType.PouringCasting,
    ProcessType.CastingDegating,
    ProcessType.CastingFettling,
    ProcessType.ShotBlasting,
    ProcessType.RadiographyTesting,
    ProcessType.MetullurgicalInspection,
    ProcessType.ManualInspection,
  ];
  investmentProcesses = [
    ProcessType.WaxInjectionMolding, // to ck for automation
    ProcessType.TreePatternAssembly,
    ProcessType.SlurryCoating, // to ck for automation
    ProcessType.Dry, // to ck for automation (no machines)
    ProcessType.Dewaxing, // to ck for automation
    ProcessType.ShellMoldFiring, // to ck for automation (no machines)
    ProcessType.MeltingCasting,
    ProcessType.PouringCasting,
    ProcessType.MoldKnockout, // to ck for automation (no machines)
    ProcessType.CastingDegating,
    ProcessType.CastingFettling,
    ProcessType.MetullurgicalInspection,
    ProcessType.ManualInspection,
  ];
  hotForgingClosedDieProcesses = [
    ProcessType.SawCutting,
    ProcessType.BilletHeatingContinuousFurnace,
    ProcessType.HotClosedDieForging,
    ProcessType.TrimmingPressForging,
    // ProcessType.Piercing,
    ProcessType.CleaningForging,
    ProcessType.HeatTreatment,
    ProcessType.ShotBlasting,
    ProcessType.Testing,
    ProcessType.Straightening,
  ];
  lpdcProcesses = [
    ProcessType.CastingCorePreparation,
    ProcessType.CastingCoreAssembly,
    ProcessType.LowPressureDieCasting,
    ProcessType.MeltingCasting,
    ProcessType.TrimmingPress, // to ck for automation
    ProcessType.CastingFettling,
    ProcessType.ShotBlasting,
    ProcessType.RadiographyTesting,
    ProcessType.MetullurgicalInspection,
    ProcessType.ManualInspection,
  ];
  stitchingProcesses = [ProcessType.Stitching];
  //ProcessType.WireCuttingTermination,
  wireCuttingTerminationProcesses = [ProcessType.CableWireCutting];
  metalTubeExtrusionProcesses = [
    ProcessType.BandSaw,
    ProcessType.InductionHeatingMachine,
    ProcessType.MetalTubeExtrusion,
    ProcessType.RollingStraightening,
    ProcessType.EddyCurrentTesting,
    ProcessType.BrightAnnealing,
    ProcessType.VisualInspection,
  ];

  metalExtrusionProcesses = [ProcessType.IngotBandSawCutting, ProcessType.StockHeating, ProcessType.MetalExtrusion, ProcessType.CutToLength];
  plasticTubeExtrusionProcesses = [ProcessType.PlasticTubeExtrusion, ProcessType.PlasticConvolutedTubeExtrusion];

  secondaryProcesses = [
    PrimaryProcessType.ZincPlating,
    PrimaryProcessType.ChromePlating,
    PrimaryProcessType.NickelPlating,
    PrimaryProcessType.CopperPlating,
    PrimaryProcessType.R2RPlating,
    PrimaryProcessType.TinPlating,
    PrimaryProcessType.GoldPlating,
    PrimaryProcessType.SilverPlating,
    PrimaryProcessType.PowderCoating,
    PrimaryProcessType.Painting,
    PrimaryProcessType.WetPainting,
    PrimaryProcessType.Galvanization,
    PrimaryProcessType.SiliconCoatingAuto,
    PrimaryProcessType.SiliconCoatingSemi,
  ];
  secondaryProcess = [
    ProcessType.ZincPlating,
    ProcessType.ChromePlating,
    ProcessType.NickelPlating,
    ProcessType.CopperPlating,
    ProcessType.R2RPlating,
    ProcessType.TinPlating,
    ProcessType.GoldPlating,
    ProcessType.SilverPlating,
    ProcessType.PowderCoating,
    ProcessType.Painting,
    ProcessType.WetPainting,
    ProcessType.Galvanization,
    ProcessType.SiliconCoatingAuto,
    ProcessType.SiliconCoatingSemi,
  ];

  weldingProcesses = [PrimaryProcessType.MigWelding, PrimaryProcessType.TigWelding, PrimaryProcessType.SpotWelding, PrimaryProcessType.SeamWelding, PrimaryProcessType.StickWelding];
  welding = [
    ProcessType.MigWelding,
    ProcessType.TigWelding,
    ProcessType.SpotWelding,
    ProcessType.SeamWelding,
    ProcessType.StickWelding,
    ProcessType.LaserWelding,
    ProcessType.FrictionWelding,
    ProcessType.SubMergedArcWelding,
  ];
  testing = [ProcessType.LeakTesting, ProcessType.PressureTesting, ProcessType.SaltSprayTesting, ProcessType.UltrasonicTesting, ProcessType.RadiographyTesting, ProcessType.DiePenetrationTesting];

  castingProcesses = [
    PrimaryProcessType.NoBakeCasting,
    PrimaryProcessType.InvestmentCasting,
    PrimaryProcessType.GreenCastingAuto,
    PrimaryProcessType.GreenCastingSemiAuto,
    PrimaryProcessType.HPDCCasting,
    PrimaryProcessType.GDCCasting,
    PrimaryProcessType.LPDCCasting,
  ];
  insulationJacket = [ProcessType.RubberFeltSheetStacking, ProcessType.RubberFeltSheetCutting, ProcessType.SeamStiching];
  customCableMulti = [
    ProcessType.CustomCableDrawing,
    ProcessType.CustomCableAnnealing,
    ProcessType.CustomCableThinning,
    ProcessType.CustomCableTensionStreach,
    ProcessType.CustomCableExtruder,
    ProcessType.CustomCableDiameterControl,
    ProcessType.CustomCableCoreLayUp,
    ProcessType.CustomCableSheathing,
    ProcessType.CustomCableSparkTest,
    ProcessType.CustomCableCableMarking,
    ProcessType.CustomCableSpooler,
  ];
  customCableSolid = [
    ProcessType.CustomCableDrawing,
    ProcessType.CustomCableAnnealing,
    ProcessType.CustomCableThinning,
    ProcessType.CustomCableTensionStreach,
    ProcessType.CustomCableSheathing,
    ProcessType.CustomCableSparkTest,
    ProcessType.CustomCableCableMarking,
    ProcessType.CustomCableSpooler,
  ];
  conventionalPcbAutomation = [ProcessType.InnerLayer, ProcessType.LaminationBonding, ProcessType.PCBDrilling, ProcessType.PCBPlating, ProcessType.OuterLayer, ProcessType.Soldermask];
  conventionalPcb = [
    ProcessType.InnerLayer,
    ProcessType.LaminationBonding,
    ProcessType.PCBDrilling,
    ProcessType.PCBPlating,
    ProcessType.OuterLayer,
    ProcessType.Soldermask,
    ProcessType.SilkScreen,
    ProcessType.SurfaceFinish,
    ProcessType.RoutingScoring,
    ProcessType.ETestBBT,
    ProcessType.FQCInspection,
  ];

  semiRigidFlexAutomation = [ProcessType.InnerLayer, ProcessType.LaminationBonding, ProcessType.PCBDrilling, ProcessType.PCBPlating, ProcessType.OuterLayer, ProcessType.Soldermask];
  semiRigidFlex = [
    ProcessType.InnerLayer,
    ProcessType.LaminationBonding,
    ProcessType.PCBDrilling,
    ProcessType.PCBPlating,
    ProcessType.OuterLayer,
    ProcessType.Soldermask,
    ProcessType.SilkScreen,
    ProcessType.SurfaceFinish,
    ProcessType.RoutingScoring,
    ProcessType.ETestBBT,
    ProcessType.FQCInspection,
    ProcessType.ImpedanceCouponTest,
  ];
  compressionMolding = [ProcessType.Preform, ProcessType.CompressionMolding, ProcessType.ManualDeflashing, ProcessType.PostCuring];
  tubeLaserCutting = [ProcessType.TubeLaser, ProcessType.TubeBendingMetal];
  rubberInjectionMolding = [ProcessType.RubberInjectionMolding, ProcessType.ManualDeflashing, ProcessType.PostCuring];
  migTigWelding = [ProcessType.MigWelding, ProcessType.WeldingCleaning];
  transferMolding = [ProcessType.TransferMolding, ProcessType.ManualDeflashing, ProcessType.PostCuring]; // ProcessType.Cutting
  thermoForming = [ProcessType.ThermoForming, ProcessType.Cutting];
  vacuumForming = [ProcessType.PlasticVacuumForming, ProcessType.Cutting];
  rubberExtrusion = [ProcessType.RubberExtrusion, ProcessType.RubberMaterialPreparation];
  wiringHarness = [
    ProcessType.CablePreparation,
    ProcessType.LineAssembly,
    ProcessType.FinalInspection,
    ProcessType.ConduitTubeSleeveHSTPreparation,
    ProcessType.FunctionalTestCableHarness,
    ProcessType.EMPartAssemblyTesting,
  ];
  throughHoleLines = [
    ThroughHoleLineTypes.AxialCompManualPreforming,
    ThroughHoleLineTypes.AxialCompSemiPreforming,
    ThroughHoleLineTypes.RadialComponentManualPreforming,
    ThroughHoleLineTypes.RadialComponentSemiPreforming,
    ThroughHoleLineTypes.AxialCompAutoPlacement,
    ThroughHoleLineTypes.AxialCompManualPlacement,
    ThroughHoleLineTypes.RadialCompAutoPlacement,
    ThroughHoleLineTypes.RadialCompManualPlacement,
    ThroughHoleLineTypes.CustomCompManualPlacement,
    ThroughHoleLineTypes.WaveSoldering,
    ThroughHoleLineTypes.HandSoldering,
    ThroughHoleLineTypes.SelectiveSoldering,
    ThroughHoleLineTypes.Pressfit,
    ThroughHoleLineTypes.Washing,
  ];
  smtTypes = [
    SMTTypes.InLoader,
    SMTTypes.SolderPastePrinting,
    SMTTypes.SolderPasteInspection,
    SMTTypes.PickAndPlaceHighSpeed,
    SMTTypes.PickAndPlaceHighFlexibility,
    SMTTypes.PickAndPlaceMultifunctionalHead,
    SMTTypes.ReflowSoldering,
    SMTTypes.AOI,
    SMTTypes.UnLoader,
    SMTTypes.ConveyorFlipConveyor,
    SMTTypes.HighSpeedPickAandPlace,
    SMTTypes.HighFlexibilityPickAndPlace,
    SMTTypes.MultifunctionalHeadPickAndPlace,
  ];

  stampingStageSortOrder = [StampingType.BlankingPunching, StampingType.Piercing, StampingType.Bending, StampingType.Forming];
  laserTppSortOrder = [ProcessType.LaserCutting, ProcessType.TurretTPP, ProcessType.Bending, ProcessType.Forming];
  tubeLaserSortOrder = [ProcessType.TubeLaser, ProcessType.TubeBendingMetal];
  pcbaSortOrder = [
    ProcessType.MaterialKitting,
    ProcessType.SMTLine,
    ProcessType.ThroughHoleLine,
    ProcessType.InCircuitTestProgramming,
    ProcessType.Coating,
    ProcessType.AdhesivePotting,
    ProcessType.RoutingVScoring,
    ProcessType.FunctionalTest,
    ProcessType.LabellingnternalPackaging,
    ProcessType.ElectronicsVisualInspection,
  ];

  transferPressSortOrder = [ProcessType.Shearing, ProcessType.TransferPress];
  hotForgingClosedDieSortOrder = [
    ProcessType.SawCutting,
    ProcessType.BilletHeatingContinuousFurnace,
    ProcessType.HotClosedDieForging,
    ProcessType.TrimmingPressForging,
    // ProcessType.Piercing,
    ProcessType.CleaningForging,
    ProcessType.HeatTreatment,
    ProcessType.ShotBlasting,
    ProcessType.Testing,
    ProcessType.Straightening,
  ];
  stampingProgressSortOrder = [ProcessType.LaserCutting, ProcessType.TurretTPP, ProcessType.Progressive, ProcessType.Stage, ProcessType.Deburring, ProcessType.TinPlating];
  defaultValues = {
    setUpTime: 0,
    noOfDirectLabors: 0,
    directLaborRate: 0,
    setuplaborRate: 0,
    qaInspectorRate: 0,
    machineHourRate: 0,
    samplingRate: 0,
    dryCycleTime: 0,
    machineEfficiency: 0,
  };

  forgingDefaultValues = {
    hotForgingClosedDieHot: false,
    hotForgingOpenDieHot: false,
    coldForgingClosedDieCold: false,
    cutting: false,
    stockHeating: false,
    heatTreatment: false,
    trimmingPress: false,
    stockShearing: false,
    cleaning: false,
    straightening: false,
    control: false,
    testing: false,
    shotBlasting: false,
    shotBlastingforOpenDie: false,
    lubricationPhosphating: false,
    threadRolling: false,
    threadRollingColdHeadingForging: false,
    coldColdHeadingForging: false,
    billetHeating: false,
    isMaterialStockFormRectangleBar: false,
    billetHeatingContinuousFurnace: false,
    piercing: false,
  };

  electronicsProcessFlags = {
    isMoldDesign: false,
    isProgramming: false,
    isMachineOperations: false,
    isMachinePlishing: false,
    isToolHardening: false,
    isAssembly: false,
    isToolTrialCost: false,
  };

  resetValues = {
    samplingRate: 0,
    yieldPer: 0,
    yieldCost: 0,
    lowSkilledLaborRatePerHour: 0,
    noOfLowSkilledLabours: 0,
    directLaborCost: 0,
    skilledLaborRatePerHour: 0,
    setUpTime: 0,
    directSetUpCost: 0,
    qaOfInspectorRate: 0,
    inspectionTime: 0,
    inspectionCost: 0,
    machineHourRate: 0,
    cycleTime: 0,
    directMachineCost: 0,
  };

  galvanizationCoatingTime = [
    { id: 1, thickness: 50, cleaningPickling: 30, fluxing: 5, dipping: 2, coolingInspection: 10 },
    { id: 2, thickness: 85, cleaningPickling: 40, fluxing: 8, dipping: 4, coolingInspection: 10 },
    { id: 3, thickness: 100, cleaningPickling: 50, fluxing: 10, dipping: 6, coolingInspection: 15 },
    { id: 4, thickness: 150, cleaningPickling: 60, fluxing: 10, dipping: 10, coolingInspection: 20 },
  ];

  setMachineTypeIdByName(machineType: string) {
    let machineTypeId = 0;
    if (machineType === MachineTypeName.Automatic) {
      machineTypeId = MachineType.Automatic;
    } else if (machineType === MachineTypeName.SemiAuto) {
      machineTypeId = MachineType.SemiAuto;
    } else if (machineType === MachineTypeName.Manual) {
      machineTypeId = MachineType.Manual;
    }
    return machineTypeId;
  }

  getMachineTypeNameById(machineTypeId: number) {
    let machineTypeName = '';
    if (machineTypeId === MachineType.Automatic) {
      machineTypeName = MachineTypeName.Automatic;
    } else if (machineTypeId === MachineType.SemiAuto) {
      machineTypeName = MachineTypeName.SemiAuto;
    } else if (machineTypeId === MachineType.Manual) {
      machineTypeName = MachineTypeName.Manual;
    }
    return machineTypeName;
  }

  getMachineHourRateByMachineType(processInfo, machineType) {
    if (processInfo.machineType && processInfo.machineMaster) {
      const originalMachineType = this.setMachineTypeIdByName(processInfo.machineType);
      const originalMachineHourRate = this.sharedService.isValidNumber(processInfo.machineMaster.machineHourRate);
      return (originalMachineHourRate / MachineTypePercentage[originalMachineType][originalMachineType]) * MachineTypePercentage[originalMachineType][machineType];
    }
    return 0;
  }

  public getProcessType(processTypeId: number | undefined, processTypeOrginalList: any[] = []) {
    let filterResult: MedbProcessTypeMasterDto | undefined;
    if (processTypeOrginalList.length > 0 && processTypeId != null && processTypeId > 0) {
      filterResult = processTypeOrginalList.find(function (e: any) {
        return e.processTypeId == processTypeId;
      });
      return filterResult?.primaryProcess;
    }
    return '';
  }

  public processFlag = {
    IsProcessTypeBending: false,
    IsProcessTypeTPP: false,
    IsProcessTypeCutting: false,
    IsProcessTypeInjectionMolding: false,
    IsProcessTypeRubberInjectionMolding: false,
    IsProcessTypeThermoForming: false,
    IsSecondaryProcess: false,
    IsProcessTypePlating: false,
    IsProcessTypePowderCoating: false,
    IsProcessTypeZincPlating: false,
    IsProcessTypeChromePlating: false,
    IsProcessTypeNickelPlating: false,
    IsProcessTypeCopperPlating: false,
    IsProcessTypeR2RPlating: false,
    IsProcessTypeTinPlating: false,
    IsProcessTypeGoldPlating: false,
    IsProcessTypeSilverPlating: false,
    IsProcessTypePowderPainting: false,
    IsProcessTypeWetPainting: false,
    IsProcessTypeGalvanization: false,
    IsProcessTypeSiliconCoatingAuto: false,
    IsProcessTypeSiliconCoatingSemi: false,
    IsMetalTubeExtrusion: false,
    IsProcessBandSaw: false,
    IsProcessInductionHeatingMachine: false,
    IsProcessMetalTubeExtrusion: false,
    IsMetalExtrusion: false,
    IsProcessPlasticTubeExtrusion: false,
    IsProcessPlasticConvolutedTubeExtrusion: false,
    IsProcessPlasticVacuumForming: false,
    IsProcessMetalExtrusion: false,
    IsProcessIngotBandSawCutting: false,
    IsProcessInductionHeating: false,
    IsProcessCutToLength: false,
    IsProcessRollingStraightening: false,
    IsProcessEddyCurrentTesting: false,
    IsProcessBrightAnnealing: false,
    IsVisualInspection: false,
    IsProcessTypeStamping: false,
    IsProcessTypeStampingProgressive: false,
    IsProcessMetalForming: false,
    IsProcessTypeTesting: false,
    IsProcessMigWelding: false,
    IsProcessTigWelding: false,
    IsProcessSpotWelding: false,
    IsProcessSeamWelding: false,
    IsProcessStickWelding: false,
    IsProcessTypeWelding: false,
    IsProcessDrilling: false,
    IsProcessDrawing: false,
    IsProcessForming: false,
    IsProcessMoldPreparation: false,
    IsProcessCorePreparation: false,
    IsProcessMelting: false,
    IsProcessTrimmingPress: false,
    IsProcessHighPressureDieCasting: false,
    IsProcessLowPressureDieCasting: false,
    IsProcessGravityDieCasting: false,
    IsProcessPouring: false,
    IsProcessPartCoolingShakeOut: false,
    IsProcessFetling: false,
    IsProcessCleaning: false,
    IsProcessShotBlasting: false,
    IsProcessVaccumeImpregnation: false,
    IsProcessMachining: false,
    IsProcessTubeBending: false,
    IsInsulationJacket: false,
    IsProcessBrazing: false,
    IsProcessRubberFeltSheetStacking: false,
    IsProcessRubberFeltSheetCutting: false,
    IsProcessSeamStitching: false,
    IsProcessCableWireCutting: false,
    IsProcessCableWireCrimping: false,
    IsProcessCableConnector: false,
    IsProcessCableInjectionMolding: false,
    IsProcessCableOverMolding: false,
    IsProcessCableWireTwisting: false,
    IsProcessCableBending: false,
    IsProcessCableStampingProcess: false,
    IsProcessCableSolderingProcess: false,
    IsProcessCablePottingProcess: false,
    IsProcessCableRoutingLine: false,
    IsProcessCableUltrasonicWelding: false,
    IsProcessCableHeatShrinkingTubing: false,
    IsProcessCableTieProcess: false,
    IsProcessCableLabeling: false,
    IsProcessCoreSandMixingMachine: false,
    IsProcessMoldSandMixingMachine: false,
    IsProcessOthers: false,
    IsProcessCMMInspection: false,
    IsProcessTubeBendingMetal: false,
    IsProcessTubeLaser: false,
    // IsProcessSawCutting: false,
    IsProcessAssembly: false,
    IsProcessWiringHarness: false,
    IsProcessCablePreparation: false,
    IsProcessLineAssembly: false,
    IsProcessFinalInspection: false,
    IsProcessConduitTubeSleeveHSTPreparation: false,
    IsProcessFunctionalTestCableHarness: false,
    IsProcessEMPartAssemblyTesting: false,

    IsCasting: false,
    IsForging: false,
    IsNoBakeCasting: false,
    IsInvestmentCasting: false,
    IsGreenCastingAuto: false,
    IsGreenCastingSemiAuto: false,
    IsGreenCasting: false,
    IsHPDCCasting: false,
    IsGDCCasting: false,
    IsLPDCCasting: false,
    IsShellCasting: false,
    IsCorePreparationForCasting: false,
    IsCoreAssemblyForCasting: false,
    IsWaxInjectionMoldingForCasting: false,
    IsTreePatternAssemblyForCasting: false,
    IsSlurryCoatingForCasting: false,
    IsDryingForCasting: false,
    IsDewaxingForCasting: false,
    IsShellMoldForCasting: false,
    IsMoldKnockoutForCasting: false,
    IsMeltingForCasting: false,
    IsMoldMakingForCasting: false,
    IsMoldAssemblyForCasting: false,
    IsPouringForCasting: false,
    IsShakeoutForCasting: false,
    IsDegatingForCasting: false,
    IsShotblastingForCasting: false,
    IsFettlingForCasting: false,
    IsRadiographyForCasting: false,
    IsMetullurgicalForCasting: false,
    IsManualInspectionForCasting: false,
    IsProcessManualInspection: false,
    IsLeakTestingForCasting: false,
    IsIonicWashingForCasting: false,
    IsIonicTestingForCasting: false,
    IsBearingPressingForCasting: false,
    IsVaccumeImpregnationForCasting: false,
    IsCleaningForCasting: false,
    IsCustomCableDrawing: false,
    IsCustomCableAnnealing: false,
    IsCustomCableThinning: false,
    IsCustomCableTensionStreach: false,
    IsCustomCableExtruder: false,
    IsCustomCableDiameterControl: false,
    IsCustomCableCoreLayUp: false,
    IsCustomCableSheathing: false,
    IsCustomCableSparkTest: false,
    IsCustomCableCableMarking: false,
    IsCustomCableSpooler: false,
    IsLayoutRouting: false,
    IsProcessTypeStitching: false,
    IsPrimaryProcessWireCutting: false,
    IsProcessTypeWireCuttingTermination: false,
    IsProcessTypeRubberExtrusion: false,
    IsProcessTypeRubberMaterialPreparation: false,
    IsProcessTypeCompressionMaterialPreparation: false,
    IsProcessTypeCompressionMolding: false,
    IsProcessTypeTransferMolding: false,
    IsProcessTypePlasticCutting: false,
    IsProcessTypeDeburring: false,
    IsProcessTypeBlowMolding: false,
    IsProcessTypePassivation: false,
    IsProcessDeflashing: false,
    IsProcessWeldingPreparation: false,
    IsProcessWeldingCleaning: false,
    IsProcessCleaningForging: false,
    IsProcessBilletHeatingForging: false,
    IsProcessTrimmingHydraulicForging: false,
    IsProcessStraighteningOptionalForging: false,
    IsProcessPiercingHydraulicForging: false,
    IsProcessTestingMpiForging: false,
    IsProcessElectronics: false,
    IsProcessCustomCable: false,
    IsProcessRadioGraphy: false,
    IsProcessTypeShearing: false,
    IsProcessTypeTransferPress: false,

    MaterialKitting: false,
    ThroughHoleLine: false,
    InCircuitTestProgramming: false,
    Coating: false,
    AdhesivePotting: false,
    RoutingVScoring: false,
    FunctionalTest: false,
    LabellingnternalPackaging: false,
    BarCodeReader: false,
    SMTLine: false,

    InnerLayer: false,
    LaminationBonding: false,
    PCBDrilling: false,
    PCBPlating: false,
    OuterLayer: false,
    Soldermask: false,
    SilkScreen: false,
    SurfaceFinish: false,
    RoutingScoring: false,
    ETestBBT: false,
    FQCInspection: false,
    IsConventionalPCB: false,
    IsManualDefalshing: false,
    IsSemiRigidFlex: false,
    IsRigidFlex: false,
    IsPostCuring: false,
    IsPreform: false,
  };
  public processMappingForSort = {
    IsNoBakeCasting: this.nobakeProcesses,
    IsInvestmentCasting: this.investmentProcesses,
    IsGreenCasting: this.greenProcesses,
    IsHPDCCasting: this.hpdcProcesses,
    IsGDCCasting: this.gdcProcesses,
    IsLPDCCasting: this.lpdcProcesses,
    IsMetalTubeExtrusion: this.metalTubeExtrusionProcesses,
    IsMetalExtrusion: this.metalExtrusionProcesses,
    IsInsulationJacket: this.insulationJacket,
    IsProcessCustomCable: this.customCableMulti,
  };

  public processMappingSortCastingAutomation = {
    NoBakeCasting: this.nobakeProcesses,
    InvestmentCasting: this.investmentProcesses,
    GreenCastingAuto: this.greenProcesses,
    GreenCastingSemiAuto: this.greenProcesses,
    HPDCCasting: this.hpdcProcesses,
    GDCCasting: this.gdcProcesses,
    LPDCCasting: this.lpdcProcesses,
  };

  constructor(
    private formbuilder: FormBuilder,
    private sharedService: SharedService,
    public _assembly: AssemblyConfigService,
    public _sheetMetalConfig: SheetMetalConfigService,
    public _machining: ManufacturingMachiningConfigService,
    public _manufacturingForgingSubProcessConfigService: ManufacturingForgingSubProcessConfigService,
    public _electronics: ElectronicsConfigService,
    private _forgingSubProcess: ManufacturingForgingSubProcessConfigService,
    public _brazingConfig: BrazingConfigService,
    public _castingConfig: ManufacturingCastingConfigService,
    public _compressionConfig: CompressionMoldingMapperService,
    public _platingnConfig: PlatingConfigService,
    private digitalFactoryHelper: DigitalFactoryHelper,
    public _wireHarnessConfig: WireHarnessConfigService,
    public _sheetMetalProcessMapperConfig: SheetMetalProcessMapperService
  ) { }

  public clearProcessTypeFlags(processFlag) {
    processFlag.IsProcessTypeBending = false;
    processFlag.IsProcessTypeTPP = false;
    processFlag.IsProcessTypeCutting = false;
    processFlag.IsProcessTypeInjectionMolding = false;
    processFlag.IsProcessTypeRubberInjectionMolding = false;
    processFlag.IsProcessTypeThermoForming = false;
    processFlag.IsProcessTypePowderCoating = false;
    processFlag.IsSecondaryProcess = false;
    processFlag.IsProcessTypePlating = false;
    processFlag.IsProcessTypeZincPlating = false;
    processFlag.IsProcessTypeChromePlating = false;
    processFlag.IsProcessTypeNickelPlating = false;
    processFlag.IsProcessTypeCopperPlating = false;
    processFlag.IsProcessTypeR2RPlating = false;
    processFlag.IsProcessTypeTinPlating = false;
    processFlag.IsProcessTypeGoldPlating = false;
    processFlag.IsProcessTypeSilverPlating = false;
    processFlag.IsProcessTypePowderPainting = false;
    processFlag.IsProcessTypeWetPainting = false;
    processFlag.IsProcessTypeGalvanization = false;
    processFlag.IsProcessTypeSiliconCoatingAuto = false;
    processFlag.IsProcessTypeSiliconCoatingSemi = false;
    processFlag.IsMetalTubeExtrusion = false;
    processFlag.IsProcessPlasticTubeExtrusion = false;
    processFlag.IsProcessPlasticConvolutedTubeExtrusion = false;
    processFlag.IsProcessPlasticVacuumForming = false;
    processFlag.IsProcessBandSaw = false;
    processFlag.IsProcessInductionHeatingMachine = false;
    processFlag.IsProcessMetalTubeExtrusion = false;
    processFlag.IsMetalExtrusion = false;
    processFlag.IsProcessMetalExtrusion = false;
    processFlag.IsProcessIngotBandSawCutting = false;
    processFlag.IsProcessInductionHeating = false;
    processFlag.IsProcessCutToLength = false;
    processFlag.IsProcessRollingStraightening = false;
    processFlag.IsProcessEddyCurrentTesting = false;
    processFlag.IsProcessBrightAnnealing = false;
    processFlag.IsVisualInspection = false;
    processFlag.IsProcessTypeStamping = false;
    processFlag.IsProcessTypeStampingProgressive = false;
    processFlag.IsProcessMetalForming = false;
    processFlag.IsProcessTypeTesting = false;
    processFlag.IsProcessMigWelding = false;
    processFlag.IsProcessTigWelding = false;
    processFlag.IsProcessSpotWelding = false;
    processFlag.IsProcessSeamWelding = false;
    processFlag.IsProcessStickWelding = false;
    processFlag.IsProcessTypeWelding = false;
    processFlag.IsProcessDrilling = false;
    processFlag.IsProcessDrawing = false;
    processFlag.IsProcessForming = false;
    processFlag.IsProcessMoldPreparation = false;
    processFlag.IsProcessCorePreparation = false;
    processFlag.IsProcessMelting = false;
    processFlag.IsProcessTrimmingPress = false;
    processFlag.IsProcessHighPressureDieCasting = false;
    processFlag.IsProcessLowPressureDieCasting = false;
    processFlag.IsProcessGravityDieCasting = false;
    processFlag.IsProcessPouring = false;
    processFlag.IsProcessPartCoolingShakeOut = false;
    processFlag.IsProcessFetling = false;
    processFlag.IsProcessCleaning = false;
    processFlag.IsProcessShotBlasting = false;
    processFlag.IsProcessVaccumeImpregnation = false;
    processFlag.IsProcessMachining = false;
    processFlag.IsProcessTubeBending = false;
    processFlag.IsInsulationJacket = false;
    processFlag.IsProcessBrazing = false;
    processFlag.IsProcessRubberFeltSheetStacking = false;
    processFlag.IsProcessRubberFeltSheetCutting = false;
    processFlag.IsProcessSeamStitching = false;
    processFlag.IsProcessCableWireCutting = false;
    processFlag.IsProcessCableWireCrimping = false;
    processFlag.IsProcessCableConnector = false;
    processFlag.IsProcessCableInjectionMolding = false;
    processFlag.IsProcessCableOverMolding = false;
    processFlag.IsProcessCableWireTwisting = false;
    processFlag.IsProcessCableBending = false;
    processFlag.IsProcessCableStampingProcess = false;
    processFlag.IsProcessCableSolderingProcess = false;
    processFlag.IsProcessCablePottingProcess = false;
    processFlag.IsProcessCableRoutingLine = false;
    processFlag.IsProcessCableUltrasonicWelding = false;
    processFlag.IsProcessCableHeatShrinkingTubing = false;
    processFlag.IsProcessCableTieProcess = false;
    processFlag.IsProcessCableLabeling = false;
    processFlag.IsProcessOthers = false;
    processFlag.IsProcessCMMInspection = false;
    processFlag.IsProcessTubeBendingMetal = false;
    processFlag.IsProcessTubeLaser = false;
    // processFlag.IsProcessSawCutting = false;
    processFlag.IsProcessAssembly = false;
    processFlag.IsProcessWiringHarness = false;
    processFlag.IsProcessCablePreparation = false;
    processFlag.IsProcessLineAssembly = false;
    processFlag.IsProcessFinalInspection = false;
    processFlag.IsProcessConduitTubeSleeveHSTPreparation = false;
    processFlag.IsProcessFunctionalTestCableHarness = false;
    processFlag.IsProcessEMPartAssemblyTesting = false;
    processFlag.IsCorePreparationForCasting = false;
    processFlag.IsCoreAssemblyForCasting = false;
    processFlag.IsWaxInjectionMoldingForCasting = false;
    processFlag.IsTreePatternAssemblyForCasting = false;
    processFlag.IsSlurryCoatingForCasting = false;
    processFlag.IsDryingForCasting = false;
    processFlag.IsDewaxingForCasting = false;
    processFlag.IsShellMoldForCasting = false;
    processFlag.IsMoldKnockoutForCasting = false;
    processFlag.IsMeltingForCasting = false;
    processFlag.IsMoldMakingForCasting = false;
    processFlag.IsMoldAssemblyForCasting = false;
    processFlag.IsPouringForCasting = false;
    processFlag.IsShakeoutForCasting = false;
    processFlag.IsDegatingForCasting = false;
    processFlag.IsShotblastingForCasting = false;
    processFlag.IsFettlingForCasting = false;
    processFlag.IsRadiographyForCasting = false;
    processFlag.IsMetullurgicalForCasting = false;
    processFlag.IsManualInspectionForCasting = false;
    processFlag.IsProcessManualInspection = false;
    processFlag.IsLeakTestingForCasting = false;
    processFlag.IsIonicWashingForCasting = false;
    processFlag.IsIonicTestingForCasting = false;
    processFlag.IsBearingPressingForCasting = false;
    processFlag.IsVaccumeImpregnationForCasting = false;
    processFlag.IsCleaningForCasting = false;
    processFlag.IsCustomCableDrawing = false;
    processFlag.IsCustomCableAnnealing = false;
    processFlag.IsCustomCableThinning = false;
    processFlag.IsCustomCableTensionStreach = false;
    processFlag.IsCustomCableExtruder = false;
    processFlag.IsCustomCableDiameterControl = false;
    processFlag.IsCustomCableCoreLayUp = false;
    processFlag.IsCustomCableSheathing = false;
    processFlag.IsCustomCableSparkTest = false;
    processFlag.IsCustomCableCableMarking = false;
    processFlag.IsCustomCableSpooler = false;
    processFlag.IsProcessTypeRubberExtrusion = false;
    processFlag.IsProcessTypeRubberMaterialPreparation = false;
    processFlag.IsProcessTypeCompressionMaterialPreparation = false;
    processFlag.IsProcessTypeCompressionMolding = false;
    processFlag.IsProcessTypeTransferMolding = false;
    processFlag.IsProcessTypePlasticCutting = false;
    processFlag.IsProcessTypeDeburring = false;
    processFlag.IsProcessTypeBlowMolding = false;
    processFlag.IsProcessTypePassivation = false;
    processFlag.IsProcessDeflashing = false;
    processFlag.IsProcessWeldingPreparation = false;
    processFlag.IsProcessWeldingCleaning = false;
    processFlag.IsProcessCleaningForging = false;
    processFlag.IsProcessBilletHeatingForging = false;
    processFlag.IsProcessTrimmingHydraulicForging = false;
    processFlag.IsProcessStraighteningOptionalForging = false;
    processFlag.IsProcessPiercingHydraulicForging = false;
    processFlag.IsProcessTestingMpiForging = false;
    processFlag.IsProcessElectronics = false;
    processFlag.IsProcessCustomCable = false;
    processFlag.IsProcessRadioGraphy = false;
    processFlag.IsProcessTypeShearing = false;
    processFlag.IsProcessTypeTransferPress = false;
    processFlag.InnerLayer = false;
    processFlag.LaminationBonding = false;
    processFlag.PCBDrilling = false;
    processFlag.PCBPlating = false;
    processFlag.OuterLayer = false;
    processFlag.Soldermask = false;
    processFlag.SilkScreen = false;
    processFlag.SurfaceFinish = false;
    processFlag.RoutingScoring = false;
    processFlag.ETestBBT = false;
    processFlag.FQCInspection = false;
    processFlag.IsConventionalPCB = false;
    processFlag.IsManualDefalshing = false;
    processFlag.IsSemiRigidFlex = false;
    processFlag.IsRigidFlex = false;
    processFlag.IsPostCuring = false;
    processFlag.IsPreform = false;
    return processFlag;
  }

  public setProcessTypeFlags(processFlag, processTypeId: number, commodityId, materialProcessId) {
    processFlag.IsProcessTypeBending = processTypeId === ProcessType.Bending;
    processFlag.IsProcessTypeCutting = [ProcessType.OxyCutting, ProcessType.LaserCutting, ProcessType.PlasmaCutting, ProcessType.WaterJetCutting].includes(processTypeId);
    processFlag.IsProcessTypeInjectionMolding = [ProcessType.InjectionMouldingDoubleShot, ProcessType.InjectionMouldingSingleShot, ProcessType.PlugConnectorOvermolding].includes(processTypeId);
    processFlag.IsProcessTypeRubberInjectionMolding = processTypeId === ProcessType.RubberInjectionMolding;
    processFlag.IsProcessTypeStamping = processTypeId == ProcessType.Stage;
    processFlag.IsProcessMetalForming = [ProcessType.MetalForming].includes(processTypeId);
    processFlag.IsProcessTypeThermoForming = processTypeId === ProcessType.ThermoForming;
    processFlag.IsProcessTypeTesting = [
      ProcessType.LeakTesting,
      ProcessType.IonicTesting,
      ProcessType.PressureTesting,
      ProcessType.SaltSprayTesting,
      ProcessType.UltrasonicTesting,
      ProcessType.RadiographyTesting,
      ProcessType.DiePenetrationTesting,
    ].includes(processTypeId);

    processFlag.IsProcessMigWelding = processTypeId === ProcessType.MigWelding;
    processFlag.IsProcessTigWelding = processTypeId === ProcessType.TigWelding;
    processFlag.IsProcessSpotWelding = processTypeId === ProcessType.SpotWelding;
    processFlag.IsProcessSeamWelding = processTypeId === ProcessType.SeamWelding;
    processFlag.IsProcessStickWelding = processTypeId === ProcessType.StickWelding;
    processFlag.IsProcessTypeWelding = [
      ProcessType.MigWelding,
      ProcessType.TigWelding,
      ProcessType.SpotWelding,
      ProcessType.SeamWelding,
      ProcessType.StickWelding,
      ProcessType.LaserWelding,
      ProcessType.FrictionWelding,
      ProcessType.SubMergedArcWelding,
    ].includes(processTypeId);

    processFlag.IsProcessDrilling = ProcessType.Drilling === Number(processTypeId);
    processFlag.IsProcessTypeTPP = processTypeId === ProcessType.TurretTPP;
    processFlag.IsProcessTypeStampingProgressive = processTypeId === ProcessType.Progressive;
    processFlag.IsProcessDrawing = [ProcessType.Drawing].includes(processTypeId);
    processFlag.IsProcessForming = [ProcessType.Forming].includes(processTypeId);
    processFlag.IsProcessMoldPreparation = [ProcessType.RotorMolding, ProcessType.MoldPerparation].includes(processTypeId);
    processFlag.IsProcessCorePreparation = processTypeId === ProcessType.CorePreparation;
    processFlag.IsProcessPartCoolingShakeOut = processTypeId === ProcessType.PartCoolingShakeOut;
    processFlag.IsProcessFetling = processTypeId === ProcessType.RunnerRiserDegating;
    processFlag.IsProcessCleaning = processTypeId === ProcessType.Cleaning;
    processFlag.IsProcessVaccumeImpregnation = processTypeId === ProcessType.VaccumeImpregnation;
    processFlag.IsProcessTypePowderCoating = processTypeId === ProcessType.PowderCoating;
    processFlag.IsProcessTypeZincPlating = processTypeId === ProcessType.ZincPlating;
    processFlag.IsProcessTypeChromePlating = processTypeId === ProcessType.ChromePlating;
    processFlag.IsProcessTypeNickelPlating = processTypeId === ProcessType.NickelPlating;
    processFlag.IsProcessTypeCopperPlating = processTypeId === ProcessType.CopperPlating;
    processFlag.IsProcessTypeR2RPlating = processTypeId === ProcessType.R2RPlating;
    processFlag.IsProcessTypeTinPlating = processTypeId === ProcessType.TinPlating;
    processFlag.IsProcessTypeGoldPlating = processTypeId === ProcessType.GoldPlating;
    processFlag.IsProcessTypeSilverPlating = processTypeId === ProcessType.SilverPlating;
    processFlag.IsProcessTypePlating =
      processFlag.IsProcessTypeZincPlating ||
      processFlag.IsProcessTypeChromePlating ||
      processFlag.IsProcessTypeNickelPlating ||
      processFlag.IsProcessTypeCopperPlating ||
      processFlag.IsProcessTypeR2RPlating ||
      processFlag.IsProcessTypeTinPlating ||
      processFlag.IsProcessTypeGoldPlating ||
      processFlag.IsProcessTypeSilverPlating;
    processFlag.IsMetalTubeExtrusion =
      materialProcessId === PrimaryProcessType.MetalTubeExtrusion &&
        [
          ProcessType.BandSaw,
          ProcessType.InductionHeatingMachine,
          ProcessType.MetalTubeExtrusion,
          ProcessType.RollingStraightening,
          ProcessType.EddyCurrentTesting,
          ProcessType.BrightAnnealing,
          ProcessType.VisualInspection,
        ].includes(processTypeId)
        ? true
        : false;
    processFlag.IsProcessBandSaw = processTypeId === ProcessType.BandSaw;
    processFlag.IsProcessInductionHeatingMachine = processTypeId === ProcessType.InductionHeatingMachine;
    processFlag.IsProcessMetalTubeExtrusion = processTypeId === ProcessType.MetalTubeExtrusion;
    processFlag.IsMetalExtrusion =
      materialProcessId === PrimaryProcessType.MetalExtrusion &&
      [ProcessType.IngotBandSawCutting, ProcessType.StockHeating, ProcessType.MetalExtrusion, ProcessType.CutToLength].includes(processTypeId);
    processFlag.IsProcessIngotBandSawCutting = processTypeId === ProcessType.IngotBandSawCutting;
    processFlag.IsProcessInductionHeating = processTypeId === ProcessType.StockHeating;
    processFlag.IsProcessMetalExtrusion = processTypeId === ProcessType.MetalExtrusion;
    processFlag.IsProcessCutToLength = processTypeId === ProcessType.CutToLength;
    processFlag.IsProcessPlasticTubeExtrusion = processTypeId === ProcessType.PlasticTubeExtrusion;
    processFlag.IsProcessPlasticConvolutedTubeExtrusion = processTypeId === ProcessType.PlasticConvolutedTubeExtrusion;
    processFlag.IsProcessPlasticVacuumForming = processTypeId === ProcessType.PlasticVacuumForming;
    processFlag.IsProcessRollingStraightening = processTypeId === ProcessType.RollingStraightening;
    processFlag.IsProcessEddyCurrentTesting = processTypeId === ProcessType.EddyCurrentTesting;
    processFlag.IsProcessBrightAnnealing = processTypeId === ProcessType.BrightAnnealing;
    processFlag.IsVisualInspection = processTypeId === ProcessType.VisualInspection;
    processFlag.IsProcessTypePowderPainting = processTypeId === ProcessType.Painting;
    processFlag.IsProcessMachining = [
      ProcessType.DrillingCenter,
      ProcessType.TurningCenter,
      ProcessType.MillingCenter,
      ProcessType.SurfaceGrinding,
      ProcessType.CylindricalGrinding,
      ProcessType.CenterlessGrinding,
      ProcessType.Boring,
      ProcessType.GearCutting,
      ProcessType.GearBroaching,
      ProcessType.GearSplineRolling,
      ProcessType.GearShaving,
      ProcessType.GearGrinding,
    ].includes(processTypeId)
      ? true
      : false;
    processFlag.IsProcessTubeBending = processTypeId === ProcessType.TubeBending;
    processFlag.IsInsulationJacket = [ProcessType.RubberFeltSheetStacking, ProcessType.SeamStiching, ProcessType.RubberFeltSheetCutting].includes(processTypeId);
    processFlag.IsProcessBrazing = processTypeId === ProcessType.Brazing;
    processFlag.IsProcessRubberFeltSheetStacking = processTypeId === ProcessType.RubberFeltSheetStacking;
    processFlag.IsProcessRubberFeltSheetCutting = processTypeId === ProcessType.RubberFeltSheetCutting;
    processFlag.IsProcessSeamStitching = processTypeId === ProcessType.SeamStiching;
    processFlag.IsProcessOthers = processTypeId === ProcessType.Others;
    processFlag.IsProcessCMMInspection = processTypeId === ProcessType.CMMInspection;
    processFlag.IsProcessTubeBendingMetal = processTypeId === ProcessType.TubeBendingMetal;
    processFlag.IsProcessTubeLaser = processTypeId === ProcessType.TubeLaser;
    // processFlag.IsProcessSawCutting = processTypeId === ProcessType.SawCutting
    processFlag.IsProcessAssembly = processTypeId === ProcessType.Assembly;
    processFlag.IsProcessWiringHarness = this.wiringHarness.includes(processTypeId);
    processFlag.IsProcessCablePreparation = processTypeId === ProcessType.CablePreparation;
    processFlag.IsProcessLineAssembly = processTypeId === ProcessType.LineAssembly;
    processFlag.IsProcessFinalInspection = processTypeId === ProcessType.FinalInspection;
    processFlag.IsProcessConduitTubeSleeveHSTPreparation = processTypeId === ProcessType.ConduitTubeSleeveHSTPreparation;
    processFlag.IsProcessFunctionalTestCableHarness = processTypeId === ProcessType.FunctionalTestCableHarness;
    processFlag.IsProcessEMPartAssemblyTesting = processTypeId === ProcessType.EMPartAssemblyTesting;
    processFlag.IsCorePreparationForCasting = processTypeId === ProcessType.CastingCorePreparation;
    processFlag.IsCoreAssemblyForCasting = processTypeId === ProcessType.CastingCoreAssembly;
    processFlag.IsWaxInjectionMoldingForCasting = processTypeId === ProcessType.WaxInjectionMolding;
    processFlag.IsTreePatternAssemblyForCasting = processTypeId === ProcessType.TreePatternAssembly;
    processFlag.IsSlurryCoatingForCasting = processTypeId === ProcessType.SlurryCoating;
    processFlag.IsDryingForCasting = processFlag.IsCasting && processTypeId === ProcessType.Dry;
    processFlag.IsProcessTypeWetPainting = !processFlag.IsCasting && [ProcessType.WetPainting, ProcessType.Dry].includes(processTypeId);
    processFlag.IsProcessTypeGalvanization = processTypeId === ProcessType.Galvanization;
    processFlag.IsProcessTypeSiliconCoatingAuto = processTypeId === ProcessType.SiliconCoatingAuto;
    processFlag.IsProcessTypeSiliconCoatingSemi = processTypeId === ProcessType.SiliconCoatingSemi;
    processFlag.IsSecondaryProcess =
      processFlag.IsProcessTypePlating ||
      processFlag.IsProcessTypeWetPainting ||
      processFlag.IsProcessTypePowderPainting ||
      processFlag.IsProcessTypePowderCoating ||
      processFlag.IsProcessTypeGalvanization ||
      processFlag.IsProcessTypeSiliconCoatingAuto ||
      processFlag.IsProcessTypeSiliconCoatingSemi;
    processFlag.IsDewaxingForCasting = processTypeId === ProcessType.Dewaxing;
    processFlag.IsShellMoldForCasting = processTypeId === ProcessType.ShellMoldFiring;
    processFlag.IsMoldKnockoutForCasting = processTypeId === ProcessType.MoldKnockout;
    processFlag.IsMoldMakingForCasting =
      (processFlag.IsNoBakeCasting && processTypeId === ProcessType.CastingMoldMaking) || (processFlag.IsGreenCasting && processTypeId == ProcessType.MoldPerparation);
    processFlag.IsMoldAssemblyForCasting = processTypeId === ProcessType.CastingMoldAssembly;

    processFlag.IsMeltingForCasting = processFlag.IsCasting && processTypeId === ProcessType.MeltingCasting;
    processFlag.IsPouringForCasting = processFlag.IsCasting && processTypeId === ProcessType.PouringCasting;
    processFlag.IsShotblastingForCasting = processFlag.IsCasting && processTypeId === ProcessType.ShotBlasting;
    processFlag.IsManualInspectionForCasting = processFlag.IsCasting && processTypeId === ProcessType.ManualInspection;

    processFlag.IsProcessMelting = !processFlag.IsCasting && processTypeId === ProcessType.MeltingCasting;
    processFlag.IsProcessPouring = !processFlag.IsCasting && processTypeId === ProcessType.PouringCasting;
    processFlag.IsProcessShotBlasting = !processFlag.IsCasting && processTypeId === ProcessType.ShotBlasting;
    processFlag.IsProcessManualInspection = !processFlag.IsCasting && processTypeId === ProcessType.ManualInspection;
    processFlag.IsProcessRadioGraphy = !processFlag.IsCasting && processTypeId === ProcessType.RadiographyTesting;
    processFlag.IsShakeoutForCasting = processTypeId === ProcessType.CastingShakeout;
    processFlag.IsDegatingForCasting = processTypeId === ProcessType.CastingDegating;
    processFlag.IsFettlingForCasting = processTypeId === ProcessType.CastingFettling;
    processFlag.IsRadiographyForCasting = processTypeId === ProcessType.RadiographyTesting;
    processFlag.IsMetullurgicalForCasting = processTypeId === ProcessType.MetullurgicalInspection;
    processFlag.IsLeakTestingForCasting = processFlag.IsCasting && processTypeId === ProcessType.LeakTesting;
    processFlag.IsIonicWashingForCasting = processFlag.IsCasting && processTypeId === ProcessType.IonicWashing;
    processFlag.IsIonicTestingForCasting = processFlag.IsCasting && processTypeId === ProcessType.IonicTesting;
    processFlag.IsBearingPressingForCasting = processFlag.IsCasting && processTypeId === ProcessType.BearingPressing;
    processFlag.IsVaccumeImpregnationForCasting = processFlag.IsCasting && processTypeId === ProcessType.VaccumeImpregnation;
    processFlag.IsCleaningForCasting = processTypeId === ProcessType.CleaningCasting;

    processFlag.IsCustomCableDrawing = processTypeId === ProcessType.CustomCableDrawing;
    processFlag.IsCustomCableAnnealing = processTypeId === ProcessType.CustomCableAnnealing;
    processFlag.IsCustomCableThinning = processTypeId === ProcessType.CustomCableThinning;
    processFlag.IsCustomCableTensionStreach = processTypeId === ProcessType.CustomCableTensionStreach;
    processFlag.IsCustomCableExtruder = processTypeId === ProcessType.CustomCableExtruder;
    processFlag.IsCustomCableDiameterControl = processTypeId === ProcessType.CustomCableDiameterControl;
    processFlag.IsCustomCableCoreLayUp = processTypeId === ProcessType.CustomCableCoreLayUp;
    processFlag.IsCustomCableSheathing = processTypeId === ProcessType.CustomCableSheathing;
    processFlag.IsCustomCableSparkTest = processTypeId === ProcessType.CustomCableSparkTest;
    processFlag.IsCustomCableCableMarking = processTypeId === ProcessType.CustomCableCableMarking;
    processFlag.IsCustomCableSpooler = processTypeId === ProcessType.CustomCableSpooler;

    // processFlag.IsProcessMachining && setOperationType(processTypeId);

    // forging.hotForgingClosedDieHot = processTypeId == ProcessType.HotClosedDieForging
    // forging.hotForgingOpenDieHot = processTypeId == ProcessType.HotOpenDieForging
    // forging.coldForgingClosedDieCold = processTypeId == ProcessType.ClosedDieForging
    // forging.cutting = processTypeId == ProcessType.SawCutting ;
    // forging.stockHeating = processTypeId == ProcessType.StockHeating
    // forging.heatTreatment = processTypeId == ProcessType.HeatTreatment
    // forging.stockShearing = processTypeId == ProcessType.StockShearing
    // forging.trimmingPress = processTypeId == ProcessType.TrimmingPress
    // // forging.trimmingPress = processTypeId == ProcessType.TrimmingPress // not available in current process matrix

    processFlag.IsProcessTrimmingPress = processTypeId === ProcessType.TrimmingPress;
    processFlag.IsProcessHighPressureDieCasting = processTypeId === ProcessType.HighPressureDieCasting;
    processFlag.IsProcessLowPressureDieCasting = processTypeId === ProcessType.LowPressureDieCasting;
    processFlag.IsProcessGravityDieCasting = processTypeId === ProcessType.GravityDieCasting;
    processFlag.IsProcessCableWireCutting = processTypeId === ProcessType.CableWireCutting;
    processFlag.IsProcessCableWireCrimping = processTypeId === ProcessType.CableWireCrimping;
    processFlag.IsProcessCableConnector = processTypeId === ProcessType.CableConnector;
    processFlag.IsProcessCableInjectionMolding = processTypeId === ProcessType.CableInjectionMolding;
    processFlag.IsProcessCableOverMolding = processTypeId === ProcessType.CableOverMolding;
    processFlag.IsProcessCableWireTwisting = processTypeId === ProcessType.CableWireTwisting;
    processFlag.IsProcessCableBending = processTypeId === ProcessType.CableBending;
    processFlag.IsProcessCableStampingProcess = processTypeId === ProcessType.CableStampingProcess;
    processFlag.IsProcessCableSolderingProcess = processTypeId === ProcessType.CableSolderingProcess;
    processFlag.IsProcessCablePottingProcess = processTypeId === ProcessType.CablePottingProcess;
    processFlag.IsProcessCableRoutingLine = processTypeId === ProcessType.CableRoutingLine;
    processFlag.IsProcessCableUltrasonicWelding = processTypeId === ProcessType.CableUltrasonicWelding;
    processFlag.IsProcessCableHeatShrinkingTubing = processTypeId === ProcessType.CableHeatShrinkingTubing;
    processFlag.IsProcessCableTieProcess = processTypeId === ProcessType.CableTieProcess;
    processFlag.IsProcessCableLabeling = processTypeId === ProcessType.CableLabeling;
    processFlag.IsProcessTypeStitching = processTypeId === ProcessType.Stitching;
    processFlag.IsProcessTypeRubberExtrusion = processTypeId === ProcessType.RubberExtrusion;
    processFlag.IsProcessTypeRubberMaterialPreparation = processTypeId === ProcessType.RubberMaterialPreparation && materialProcessId === PrimaryProcessType.RubberExtrusion;
    processFlag.IsProcessTypeCompressionMaterialPreparation = processTypeId === ProcessType.RubberMaterialPreparation && materialProcessId === PrimaryProcessType.CompressionMoulding;
    processFlag.IsProcessTypeCompressionMolding = processTypeId === ProcessType.CompressionMolding;
    processFlag.IsProcessTypeTransferMolding = processTypeId === ProcessType.TransferMolding;
    processFlag.IsProcessTypePlasticCutting = processTypeId === ProcessType.Cutting;
    processFlag.IsProcessTypeDeburring = processTypeId === ProcessType.Deburring;
    processFlag.IsProcessTypeBlowMolding = processTypeId === ProcessType.BlowMolding;
    processFlag.IsProcessTypePassivation = processTypeId === ProcessType.Passivation;
    processFlag.IsProcessDeflashing = processTypeId === ProcessType.Deflash;
    processFlag.IsProcessWeldingPreparation = processTypeId === ProcessType.WeldingPreparation;
    processFlag.IsProcessWeldingCleaning = processTypeId === ProcessType.WeldingCleaning;
    processFlag.IsProcessCleaningForging = processTypeId === ProcessType.CleaningForging;
    processFlag.IsProcessBilletHeatingForging = processTypeId === ProcessType.BilletHeatingContinuousFurnace;
    processFlag.IsProcessTrimmingHydraulicForging = processTypeId === ProcessType.TrimmingPressForging;
    processFlag.IsProcessStraighteningOptionalForging = processTypeId === ProcessType.Straightening;
    processFlag.IsProcessPiercingHydraulicForging = processTypeId === ProcessType.Piercing;
    processFlag.IsProcessTestingMpiForging = processTypeId === ProcessType.Testing;
    processFlag.IsProcessTypeWireCuttingTermination = processFlag.IsProcessCableWireCutting;
    processFlag.IsProcessElectronics =
      [
        ProcessType.MaterialKitting,
        ProcessType.ThroughHoleLine,
        ProcessType.InCircuitTestProgramming,
        ProcessType.Coating,
        ProcessType.AdhesivePotting,
        ProcessType.RoutingVScoring,
        ProcessType.FunctionalTest,
        ProcessType.LabellingnternalPackaging,
        ProcessType.BarCodeReader,
        ProcessType.SMTLine,
        ProcessType.ElectronicsLaserMarking,
        ProcessType.ElectronicsVisualInspection,
      ].includes(processTypeId) && commodityId === CommodityType.Electronics;
    processFlag.IsProcessCustomCable = this.customCableMulti.includes(processTypeId);
    processFlag.MaterialKitting = processTypeId === ProcessType.MaterialKitting;
    processFlag.ThroughHoleLine = processTypeId === ProcessType.ThroughHoleLine;
    processFlag.InCircuitTestProgramming = processTypeId === ProcessType.InCircuitTestProgramming;
    processFlag.Coating = processTypeId === ProcessType.Coating;
    processFlag.AdhesivePotting = processTypeId === ProcessType.AdhesivePotting;
    processFlag.RoutingVScoring = processTypeId === ProcessType.RoutingVScoring;
    processFlag.FunctionalTest = processTypeId === ProcessType.FunctionalTest;
    processFlag.LabellingnternalPackaging = processTypeId === ProcessType.LabellingnternalPackaging;
    processFlag.BarCodeReader = processTypeId === ProcessType.BarCodeReader;
    processFlag.SMTLine = processTypeId === ProcessType.SMTLine;

    processFlag.InnerLayer = processTypeId === ProcessType.InnerLayer;
    processFlag.LaminationBonding = processTypeId === ProcessType.LaminationBonding;
    processFlag.PCBDrilling = processTypeId === ProcessType.PCBDrilling;
    processFlag.PCBPlating = processTypeId === ProcessType.PCBPlating;
    processFlag.OuterLayer = processTypeId === ProcessType.OuterLayer;
    processFlag.Soldermask = processTypeId === ProcessType.Soldermask;
    processFlag.SilkScreen = processTypeId === ProcessType.SilkScreen;
    processFlag.SurfaceFinish = processTypeId === ProcessType.SurfaceFinish;
    processFlag.RoutingScoring = processTypeId === ProcessType.RoutingScoring;
    processFlag.ETestBBT = processTypeId === ProcessType.ETestBBT;
    processFlag.FQCInspection = processTypeId === ProcessType.FQCInspection;
    processFlag.IsConventionalPCB =
      materialProcessId === PrimaryProcessType.ConventionalPCB &&
      [
        ProcessType.InnerLayer,
        ProcessType.LaminationBonding,
        ProcessType.PCBDrilling,
        ProcessType.PCBPlating,
        ProcessType.OuterLayer,
        ProcessType.Soldermask,
        ProcessType.SilkScreen,
        ProcessType.SurfaceFinish,
        ProcessType.RoutingScoring,
        ProcessType.ETestBBT,
        ProcessType.FQCInspection,
      ].includes(processTypeId);

    processFlag.IsSemiRigidFlex =
      materialProcessId === PrimaryProcessType.SemiRigidFlex &&
      [
        ProcessType.InnerLayer,
        ProcessType.LaminationBonding,
        ProcessType.PCBDrilling,
        ProcessType.PCBPlating,
        ProcessType.OuterLayer,
        ProcessType.Soldermask,
        ProcessType.SilkScreen,
        ProcessType.SurfaceFinish,
        ProcessType.RoutingScoring,
        ProcessType.ETestBBT,
        ProcessType.FQCInspection,
        ProcessType.ImpedanceCouponTest,
      ].includes(processTypeId);
    processFlag.IsRigidFlex =
      materialProcessId === PrimaryProcessType.RigidFlexPCB &&
      [
        ProcessType.InnerLayer,
        ProcessType.LaminationBonding,
        ProcessType.PCBDrilling,
        ProcessType.PCBPlating,
        ProcessType.OuterLayer,
        ProcessType.Soldermask,
        ProcessType.SilkScreen,
        ProcessType.SurfaceFinish,
        ProcessType.RoutingScoring,
        ProcessType.ETestBBT,
        ProcessType.FQCInspection,
        ProcessType.ImpedanceCouponTest,
      ].includes(processTypeId);
    processFlag.IsManualDefalshing = processTypeId === ProcessType.ManualDeflashing;
    processFlag.IsPostCuring = processTypeId === ProcessType.PostCuring;
    processFlag.IsPreform = processTypeId === ProcessType.Preform;
    processFlag.IsProcessTypePlasticCutting = processTypeId === ProcessType.Cutting;
    //processFlag.OverMoldingProcess = processTypeId === ProcessType.LineAssembly && Number(subProcessFormArray?.controls[0]?.value?.subProcessTypeID) === LineAssemblyTypes.OverMoldingProcess;
    processFlag.IsProcessTypeTransferPress = processTypeId === ProcessType.TransferPress;
    processFlag.IsProcessTypeShearing = processTypeId === ProcessType.Shearing;
    return processFlag;
  }

  calculateTotalPinPopulation(boms: BillOfMaterialDto[]): number {
    let count = 0;
    if (boms && boms.length > 0) {
      boms.forEach((x) => {
        if (x.parentPartInfoId) {
          count += x.partQty;
        }
      });
      count = count - 1;
    }
    return count;
  }
  calculateNoOfTypesOfPins(boms: BillOfMaterialDto[]): number {
    let count = 0;
    if (boms && boms.length > 0) {
      boms.forEach((x) => {
        if (x.parentPartInfoId) {
          count++;
        }
      });
      count = count - 1;
    }
    return count;
  }

  calculateBomMaxQtyOfIndividualPinTypes(boms: BillOfMaterialDto[]): number {
    let max = 0;
    if (boms && boms.length > 0) {
      max = boms[0].partQty;
      for (let i = 1; i < boms.length; i++) {
        if (boms[i].partQty > max && boms[i].parentPartInfoId) {
          max = boms[i].partQty;
        }
      }
    }
    return max;
  }

  clearLookupTables(processList: ProcessInfoDto[]) {
    processList?.forEach((element) => {
      element.GearCuttingLookupList = [];
      element.boringLookupList = [];
      element.countryList = [];
      element.drillingCuttingSpeedList = [];
      element.formingTimeList = [];
      element.grindingLookupList = [];
      // element.groovingLookupList = [];
      element.handlingTimeList = [];
      element.millingLookupList = [];
      element.plasmaCutttingSpeedList = [];
      element.laserCutttingTimeList = [];
      element.strokeRateList = [];
      element.strokeRateManualList = [];
      element.thermoFormingList = [];
      element.toolLoadingTimeList = [];
      element.turningLookupList = [];
      // to avoid circular json
      element.subProcessFormArray = null;
    });
    return processList;
  }

  setMachineMasterObject(processInfo: ProcessInfoDto, machine: MedbMachinesMasterDto) {
    processInfo.machineMarketId = machine?.machineMarketDtos[0].machineMarketID;
    processInfo.selectedTonnage = machine?.machineTonnageTons;
    processInfo.machineMarket = machine?.machineMarketDtos[0];
    processInfo.machineMaster = machine;
    const injecRate = this.sharedService.isValidNumber((Number(processInfo?.machineMaster?.injectionRate) * Number(processInfo.density)) / 1000);
    const shotweight = this.sharedService.isValidNumber(processInfo.grossWeight * processInfo.noOfCavities);
    const materialInjectionFillTime = this.sharedService.isValidNumber(shotweight / Number(injecRate));
    processInfo.materialInjectionFillTime = materialInjectionFillTime;
    processInfo.semiAutoOrAuto = processInfo?.semiAutoOrAuto
      ? processInfo.semiAutoOrAuto
      : this.setMachineTypeIdByName(machine.machineMarketDtos?.length > 0 ? machine?.machineMarketDtos[0].machineType : undefined);
    return processInfo;
  }

  setMachineTypeObject(processInfo: ProcessInfoDto, machineTypeObj: MedbMachinesMasterDto) {
    const machineType = new MedbMachineTypeMasterDto();
    machineType.machineType = machineTypeObj?.machineMarketDtos?.length > 0 ? machineTypeObj?.machineMarketDtos[0].machineType : undefined;
    machineType.processTypeId = machineTypeObj?.machineMarketDtos?.length > 0 ? machineTypeObj?.machineMarketDtos[0].processTypeId : undefined;
    processInfo.machineType = machineType?.machineType;
    processInfo.machineDescription = machineTypeObj?.machineDescription;
    processInfo.machineHourRate = machineTypeObj?.machineHourRate;
    processInfo.machineHourRateFromDB = processInfo.machineHourRate;
    processInfo.dryCycleTime = processInfo.dryCycleTime || machineTypeObj?.machineDryCycleTimeInSec;
    processInfo.machineCapacity = machineTypeObj?.machineCapacity;
    processInfo.efficiency = machineTypeObj?.machineMarketDtos.length > 0 ? machineTypeObj?.machineMarketDtos[0].efficiency : 0;
    this.defaultValues.machineHourRate = machineTypeObj?.machineHourRate;
    this.defaultValues.dryCycleTime = machineTypeObj?.machineDryCycleTimeInSec;
    processInfo.furnaceCapacityTon = machineTypeObj?.furnaceCapacityTon || 1;
    processInfo.machineMaster = machineTypeObj;
    processInfo.bourdanRate = machineTypeObj?.burdenRate;
    return processInfo;
  }

  setMachineLaborInfo(processInfo: ProcessInfoDto, laborRateInfo: LaborRateMasterDto[], machineTypeObj: MedbMachinesMasterDto, processTypeOrginalList: any[]) {
    processInfo = this.setMachineMasterObject(processInfo, machineTypeObj);
    processInfo = this.setMachineTypeObject(processInfo, machineTypeObj);
    processInfo = this.setLaborCount(laborRateInfo, processInfo, machineTypeObj);
    processInfo.processType = this.getProcessType(machineTypeObj?.machineMarketDtos[0]?.processTypeId, processTypeOrginalList);
  }

  setLaborCount(laborRateData: LaborRateMasterDto[], processInfo: ProcessInfoDto, machineTypeObj: MedbMachinesMasterDto) {
    const laborRateInfo = laborRateData[0];
    // let lowSkilledRate = 0, qaRate = 0, skilledRate = 0, semiSkilledRate = 0, specialSkilledRate = 0;
    // if (laborRateData?.length > 0) {
    // let lowSkilledRate = laborRateInfo.lowSkilledRate;
    // let qaRate = laborRateInfo.qaRate;
    // let skilledRate = laborRateInfo.skilledRate;
    // let semiSkilledRate = laborRateInfo.semiSkilledRate;
    // let specialSkilledRate = laborRateInfo.specialSkilledRate;
    // }
    // let noOfDirectLabors = this.sharedService.isValidNumber(Number(machineTypeObj?.noOfLowSkilledLabours) +
    //     Number(machineTypeObj?.noOfSemiSkilledLabours) +
    //     Number(machineTypeObj?.noOfSkilledLabours) +
    //     Number(machineTypeObj?.specialSkilledLabours));
    // let directLaborCost = this.sharedService.isValidNumber(((Number(machineTypeObj?.noOfLowSkilledLabours) * lowSkilledRate) +
    //     (Number(machineTypeObj?.noOfSemiSkilledLabours) * semiSkilledRate) +
    //     (Number(machineTypeObj?.noOfSkilledLabours) * skilledRate) + (Number(machineTypeObj?.specialSkilledLabours) * specialSkilledRate)) / noOfDirectLabors);

    processInfo.skilledLaborRatePerHour = laborRateInfo.laborSkilledCost;
    processInfo.qaOfInspectorRate = laborRateInfo.laborQualityCost;
    processInfo.lowSkilledLaborRatePerHour =
      processInfo.processTypeID === ProcessType.MigWelding || processInfo.processTypeID === ProcessType.TigWelding ? laborRateInfo.laborSpecialSkilledCost : laborRateInfo.laborLowSkilledCost;
    processInfo.noOfLowSkilledLabours = machineTypeObj?.machineMarketDtos[0]?.noOfLowSkilledLabours;
    processInfo.noOfSemiSkilledLabours = laborRateInfo?.laborSemiSkilledCost;
    processInfo.noOfSkilledLabours = machineTypeObj?.machineMarketDtos[0]?.noOfLowSkilledLabours; // laborRateInfo?.noOfSkilledLabours;
    processInfo.qaOfInspector = laborRateInfo?.laborSpecialSkilledCost;
    return processInfo;
  }

  public automationProcessTypeMapping = {
    [PrimaryProcessType.InjectionMouldingSingleShot]: ProcessType.InjectionMouldingSingleShot,
    [PrimaryProcessType.InjectionMouldingDoubleShot]: ProcessType.InjectionMouldingDoubleShot,
    [PrimaryProcessType.RubberInjectionMolding]: ProcessType.RubberInjectionMolding,
    [PrimaryProcessType.RubberExtrusion]: ProcessType.RubberExtrusion,
    [PrimaryProcessType.BlowMoulding]: ProcessType.BlowMolding,
    [PrimaryProcessType.CompressionMoulding]: ProcessType.CompressionMolding,
    [PrimaryProcessType.TransferMolding]: ProcessType.TransferMolding,
    [PrimaryProcessType.StampingStage]: ProcessType.Stage,
    [PrimaryProcessType.StampingProgressive]: ProcessType.Progressive,
    [PrimaryProcessType.ColdForgingClosedDieHot]: ProcessType.ClosedDieForging,
    [PrimaryProcessType.ColdForgingColdHeading]: ProcessType.ColdHeading,
    // [PrimaryProcessType.HotForgingClosedDieHot]: ProcessType.HotClosedDieForging,
    [PrimaryProcessType.HotForgingOpenDieHot]: ProcessType.HotOpenDieForging,
    [PrimaryProcessType.ThermoForming]: ProcessType.ThermoForming,
    [PrimaryProcessType.PlasticVacuumForming]: ProcessType.PlasticVacuumForming,
    [PrimaryProcessType.ZincPlating]: ProcessType.ZincPlating,
    [PrimaryProcessType.ChromePlating]: ProcessType.ChromePlating,
    [PrimaryProcessType.NickelPlating]: ProcessType.NickelPlating,
    [PrimaryProcessType.CopperPlating]: ProcessType.CopperPlating,
    [PrimaryProcessType.R2RPlating]: ProcessType.R2RPlating,
    [PrimaryProcessType.TinPlating]: ProcessType.TinPlating,
    [PrimaryProcessType.GoldPlating]: ProcessType.GoldPlating,
    [PrimaryProcessType.SilverPlating]: ProcessType.SilverPlating,
    [PrimaryProcessType.PowderCoating]: ProcessType.PowderCoating,
    [PrimaryProcessType.Painting]: ProcessType.Painting,
    [PrimaryProcessType.WetPainting]: ProcessType.WetPainting,
    [PrimaryProcessType.SiliconCoatingAuto]: ProcessType.SiliconCoatingAuto,
    [PrimaryProcessType.SiliconCoatingSemi]: ProcessType.SiliconCoatingSemi,
    [PrimaryProcessType.Galvanization]: ProcessType.Galvanization,
    [PrimaryProcessType.MigWelding]: ProcessType.MigWelding,
    [PrimaryProcessType.TigWelding]: ProcessType.TigWelding,
    [PrimaryProcessType.SpotWelding]: ProcessType.SpotWelding,
    [PrimaryProcessType.SeamWelding]: ProcessType.SeamWelding,
    [PrimaryProcessType.StickWelding]: ProcessType.StickWelding,
    [PrimaryProcessType.ConnectorAssembly]: ProcessType.Stitching,
    [PrimaryProcessType.WireCuttingTermination]: ProcessType.CableWireCutting,
    [PrimaryProcessType.LaserCutting]: ProcessType.LaserCutting,
    [PrimaryProcessType.PlasmaCutting]: ProcessType.PlasmaCutting,
    [PrimaryProcessType.OxyCutting]: ProcessType.OxyCutting,
    [PrimaryProcessType.TurretPunch]: ProcessType.TurretTPP,
    [PrimaryProcessType.TubeLaserCutting]: ProcessType.TubeLaser,
    [PrimaryProcessType.TubeBending]: ProcessType.TubeBending,
    [PrimaryProcessType.Brazing]: ProcessType.Brazing,
    [PrimaryProcessType.Assembly]: ProcessType.Assembly,
    [PrimaryProcessType.CustomizeCable]: ProcessType.CustomCableThinning,
    [PrimaryProcessType.ConventionalPCB]: ProcessType.InnerLayer,
    [PrimaryProcessType.RigidFlexPCB]: ProcessType.InnerLayer,
    [PrimaryProcessType.SemiRigidFlex]: ProcessType.InnerLayer,
    [PrimaryProcessType.TransferPress]: ProcessType.Shearing,
    [MachiningTypes.Rod]: ProcessType.TurningCenter,
    [MachiningTypes.Tube]: ProcessType.TurningCenter,
  };

  public operationTypeMapping = {
    [ProcessType.TurningCenter]: this._machining.turningProcesses,
    [ProcessType.MillingCenter]: this._machining.millingOperations,
    [ProcessType.DrillingCenter]: this._machining.drillingOperations,
    [ProcessType.Boring]: this._machining.boringOperations,
    [ProcessType.SurfaceGrinding]: this._machining.surfaceGrindingOperations,
    [ProcessType.CylindricalGrinding]: this._machining.cylindericalGrindingOperations,
    [ProcessType.CenterlessGrinding]: this._machining.centerlessGrindingOperations,
    [ProcessType.GearCutting]: this._machining.gearCuttingOperations,
    [ProcessType.GearBroaching]: this._machining.gearBroachingOperations,
    [ProcessType.GearSplineRolling]: this._machining.gearSplineRollingOperations,
    [ProcessType.GearShaving]: this._machining.gearShavingOperations,
    [ProcessType.GearGrinding]: this._machining.gearGrindingOperations,
  };

  public getWireHarnessPatchValue() {
    return {
      noOfNodePoints: 0,
      harnessRequirement: 0,
      typeOfSplice: 0,
      maxLength: 0,
      minLength: 0,
      noOfBends: 0,
    };
  }

  public subProcessTypeInfoMapper(processResult: ProcessInfoDto, processInfoId: number = 0, processInfo?: ProcessInfoDto) {
    for (let i = 0; i < processResult.subProcessFormArray?.controls?.length; i++) {
      const info = processResult.subProcessFormArray?.controls[i];
      const subProcessInfo = new SubProcessTypeInfoDto();
      subProcessInfo.subProcessInfoId = 0;
      subProcessInfo.processInfoId = processInfoId;
      subProcessInfo.subProcessTypeId = info.value.subProcessTypeID;
      subProcessInfo.lengthOfCut = info.value.lengthOfCut || 0;
      subProcessInfo.formLength = info.value.formLength || 0;
      subProcessInfo.formHeight = info.value.formHeight || 0;
      subProcessInfo.hlFactor = info.value.hlFactor || 0;
      subProcessInfo.bendingLineLength = info.value.bendingLineLength || 0;
      subProcessInfo.shoulderWidth = info.value.shoulderWidth || 0;
      subProcessInfo.noOfBends = info.value.noOfBends || 0;
      subProcessInfo.formPerimeter = info.value.formPerimeter || 0;
      subProcessInfo.recommendTonnage = this.sharedService.isValidNumber(info.value.recommendTonnage);
      subProcessInfo.blankArea = info?.value?.blankArea;
      subProcessInfo.formingForce = info?.value?.formingForce;
      subProcessInfo.noOfHoles = info?.value?.noOfHoles;
      if ([ProcessType.CablePreparation, ProcessType.LineAssembly, ProcessType.FinalInspection].includes(processInfo?.processTypeID)) {
        subProcessInfo.noOfNodePoints = info?.value?.noOfNodePoints;
        subProcessInfo.harnessRequirement = info?.value?.harnessRequirement;
        subProcessInfo.typeOfSplice = info?.value?.typeOfSplice;
        subProcessInfo.maxLength = info?.value?.maxLength;
        subProcessInfo.minLength = info?.value?.minLength;
      }
      const process = processInfo || processResult;
      if (!process.subProcessTypeInfos) {
        process.subProcessTypeInfos = [];
      }
      subProcessInfo.additionalLengthArray = info?.value?.cableLengthArray?.toString();
      process.subProcessTypeInfos.push(subProcessInfo);
    }
  }

  public subprocessFormArrayMapper(subProcessFormArray: FormArray, selecteProcess: ProcessInfoDto) {
    if (subProcessFormArray.length > 0) {
      subProcessFormArray.clear();
    }
    for (let i = 0; i < selecteProcess?.subProcessTypeInfos?.length; i++) {
      const info = selecteProcess?.subProcessTypeInfos[i];
      const formGroup = this.formbuilder.group({
        subProcessInfoId: [info.subProcessInfoId],
        processInfoId: selecteProcess.processInfoId || 0,
        subProcessTypeID: info.subProcessTypeId,
        recommendTonnage: [info.recommendTonnage],
        formLength: info.formLength,
        formHeight: info.formHeight,
        hlFactor: info.hlFactor,
        lengthOfCut: info.lengthOfCut,
        bendingLineLength: info.bendingLineLength,
        shoulderWidth: info.shoulderWidth,
        noOfBends: info.noOfBends,
        formPerimeter: info.formPerimeter,
        blankArea: info.blankArea,
        formingForce: info.formingForce,
        noOfHoles: info.noOfHoles,
        workpieceInitialDia: info.workpieceInitialDia ?? 0,
        workpieceFinalDia: info.workpieceFinalDia ?? 0,
        workpieceOuterDia: info.workpieceOuterDia ?? 0,
        workpieceInnerDia: info.workpieceInnerDia ?? 0,
        partInitialDia: info.partInitialDia ?? 0,
        finalGrooveDia: info.finalGrooveDia ?? 0,
        widthOfCut: info.widthOfCut ?? 0,
        totalDepOfCut: info.totalDepOfCut ?? 0,
        wheelDiameter: info.wheelDiameter ?? 0,
        wheelWidth: info.wheelWidth ?? 0,
        pitchDiameter: info.pitchDiameter ?? 0,
        pressureAngle: info.pressureAngle ?? 0,
        helixAngle: info.helixAngle ?? 0,
        spiralAngle: info.spiralAngle ?? 0,
        typeOfSplice: info.typeOfSplice ?? 0,
        isBlankingPunching: [info.subProcessTypeId == StampingType.BlankingPunching],
        isForming: [info.subProcessTypeId == StampingType.Forming],
        isDrawing: [info.subProcessTypeId == StampingType.Drawing],
        isBending: [info.subProcessTypeId == StampingType.Bending],
        isPiercing: [info.subProcessTypeId == StampingType.Piercing],
        isCoining: [info.subProcessTypeId == StampingType.Coining],
        isCompound: [info.subProcessTypeId == StampingType.Compound],
        isShallowDrawRect: [info.subProcessTypeId == StampingType.ShallowDrawRect],
        isRedrawRect: [info.subProcessTypeId == StampingType.RedrawRect],
        isShallowDrawCir: [info.subProcessTypeId == StampingType.ShallowDrawCir],
        isRedrawCir: [info.subProcessTypeId == StampingType.RedrawCir],
        isTrimming: [info.subProcessTypeId == StampingType.Trimming],
      });
      subProcessFormArray.push(formGroup);
    }
  }

  public manufactureFormGroup(selectedProcessInfoId: number, conversionValue, isEnableUnitConversion, subProcessTypeID: number = 0): FormGroup {
    const bendWithLargerLength = this.sharedService.extractedProcessData?.ProcessBendingInfo?.sort((a, b) => b.Length - a.Length);
    const formingLargerLength = this.sharedService.extractedProcessData?.ProcessFormInfo?.sort((a, b) => b.FormArea - a.FormArea);
    const formGroup = this.formbuilder.group({
      subProcessInfoId: 0,
      processInfoId: selectedProcessInfoId || 0,
      subProcessTypeID: subProcessTypeID,
      recommendTonnage: 0,
      formLength: formingLargerLength && formingLargerLength?.length > 0 ? formingLargerLength[0].FormLength : 0,
      formHeight: formingLargerLength && formingLargerLength?.length > 0 ? formingLargerLength[0].FormHeight : 0,
      formPerimeter: formingLargerLength && formingLargerLength?.length > 0 ? formingLargerLength[0].FormPerimeter : 0,
      hlFactor: this.sharedService.extractedProcessData?.HlFactor || 0,
      lengthOfCut: this.sharedService.extractedProcessData?.LengthOfCut || 0,
      bendingLineLength: this.sharedService.convertUomInUI(bendWithLargerLength && bendWithLargerLength?.length > 0 ? bendWithLargerLength[0].Length : 0, conversionValue, isEnableUnitConversion),
      shoulderWidth: this.sharedService.convertUomInUI(bendWithLargerLength && bendWithLargerLength?.length > 0 ? bendWithLargerLength[0].Width : 0, conversionValue, isEnableUnitConversion),
      noOfBends: bendWithLargerLength && bendWithLargerLength?.length > 0 ? bendWithLargerLength[0].BendCount : 0,
      blankArea: formingLargerLength && formingLargerLength?.length > 0 ? formingLargerLength[0].FormArea : 0,
      formingForce: 0,
      noOfHoles: 0,
      isBlankingPunching: false,
      isForming: false,
      isDrawing: false,
      isBending: false,
      isPiercing: false,
      isCoining: false,
      isCompound: false,
      isShallowDrawRect: false,
      isRedrawRect: false,
      isShallowDrawCir: false,
      isRedrawCir: false,
      isTrimming: false,
      //for wiring harness
      noOfNodePoints: 0,
      harnessRequirement: 0,
      typeOfSplice: 0,
      maxLength: 0,
      minLength: 0,
      cableLengthArray: this.formbuilder.array([]),
    });
    return formGroup;
  }

  public manufactureWeldingSubFormGroup(processInfo: ProcessInfoDto, materialInfo: MaterialInfoDto, subProcessTypeID: number = 0): FormArray {
    const subProcessFormArray = new FormArray([]);
    if (materialInfo && materialInfo?.coreCostDetails && materialInfo.coreCostDetails.length > 0) {
      for (let i = 0; i < materialInfo.coreCostDetails.length; i++) {
        const subProcess = new SubProcessTypeInfoDto();
        const core = materialInfo.coreCostDetails[i];
        subProcess.subProcessInfoId = 0;
        subProcess.processInfoId = processInfo.processInfoId || 0;
        subProcess.subProcessTypeId = subProcessTypeID;
        subProcess.lengthOfCut = core.coreShape;
        subProcess.formLength = 1;
        subProcess.formHeight = 0; // calc
        subProcess.hlFactor = 0;
        subProcess.formPerimeter = 0;
        subProcess.recommendTonnage = 0;
        subProcess.shoulderWidth = core.coreHeight; // weld size
        subProcess.bendingLineLength = core.coreWeight; // weld element size
        subProcess.formingForce = core.coreArea; // weld sides
        subProcess.noOfBends = core.coreLength; // weld length
        subProcess.blankArea = core.noOfCore; // weld passes
        subProcess.noOfHoles = core.coreVolume; // weld places
        subProcess.feed = core.grindFlush;

        processInfo.subProcessTypeInfos = processInfo.subProcessTypeInfos || [];
        processInfo.subProcessTypeInfos.push(subProcess);

        const formGroup = this.formbuilder.group({
          subProcessInfoId: 0,
          processInfoId: processInfo.processInfoId || 0,
          subProcessTypeID: 0,
          lengthOfCut: core.coreShape,
          formLength: 1,
          formHeight: 0, // calc
          hlFactor: 0,
          formPerimeter: 0,
          recommendTonnage: 0,
          shoulderWidth: core.coreHeight,
          bendingLineLength: core.coreWeight,
          formingForce: core.coreArea,
          noOfBends: core.coreLength,
          blankArea: core.noOfCore,
          noOfHoles: core.coreVolume,
          feed: core.grindFlush,
        });
        subProcessFormArray.push(formGroup);
      }
    }

    return subProcessFormArray;
  }

  onSubProcessEditCall(info: SubProcessTypeInfoDto, selectedProcessInfoId: number, conversionValue, isEnableUnitConversion): FormGroup {
    const formGroup = this.formbuilder.group({
      subProcessInfoId: [info.subProcessInfoId],
      processInfoId: selectedProcessInfoId || 0,
      subProcessTypeID: Number(info.subProcessTypeId),
      recommendTonnage: [info.recommendTonnage],
      formLength: this.sharedService.convertUomInUI(info.formLength, conversionValue, isEnableUnitConversion),
      formHeight: this.sharedService.convertUomInUI(info.formHeight, conversionValue, isEnableUnitConversion),
      hlFactor: info.hlFactor,
      lengthOfCut: this.sharedService.convertUomInUI(info.lengthOfCut, conversionValue, isEnableUnitConversion),
      bendingLineLength: this.sharedService.convertUomInUI(info.bendingLineLength, conversionValue, isEnableUnitConversion),
      shoulderWidth: this.sharedService.convertUomInUI(info.shoulderWidth, conversionValue, isEnableUnitConversion),
      noOfBends: info.noOfBends,
      formPerimeter: this.sharedService.convertUomInUI(info.formPerimeter, conversionValue, isEnableUnitConversion),
      blankArea: this.sharedService.convertUomInUI(info.blankArea, conversionValue, isEnableUnitConversion),
      formingForce: info.formingForce,
      noOfHoles: info.noOfHoles,
      noOfNodePoints: info.noOfNodePoints,
      harnessRequirement: info.harnessRequirement,
      typeOfSplice: info.typeOfSplice,
      maxLength: info.maxLength,
      minLength: info.minLength,
      isBlankingPunching: [info.subProcessTypeId == StampingType.BlankingPunching],
      isForming: [info.subProcessTypeId == StampingType.Forming],
      isDrawing: [info.subProcessTypeId == StampingType.Drawing],
      isBending: [info.subProcessTypeId == StampingType.Bending],
      isPiercing: [info.subProcessTypeId == StampingType.Piercing],
      isCoining: [info.subProcessTypeId == StampingType.Coining],
      isCompound: [info.subProcessTypeId == StampingType.Compound],
      isShallowDrawRect: [info.subProcessTypeId == StampingType.ShallowDrawRect],
      isRedrawRect: [info.subProcessTypeId == StampingType.RedrawRect],
      isShallowDrawCir: [info.subProcessTypeId == StampingType.ShallowDrawCir],
      isRedrawCir: [info.subProcessTypeId == StampingType.RedrawCir],
      isTrimming: [info.subProcessTypeId == StampingType.Trimming],
      cableLengthArray: this.formbuilder.array([]),
    });
    return formGroup;
  }

  addSubProcess(model: ProcessInfoDto, subProcessFormArray: FormArray, conversionValue, isEnableUnitConversion, isAssemblyOrElectronics: boolean = false) {
    for (let i = 0; i < subProcessFormArray?.controls?.length; i++) {
      const info = subProcessFormArray?.controls[i];
      const subProcessInfo = new SubProcessTypeInfoDto();
      subProcessInfo.subProcessInfoId = 0;
      subProcessInfo.processInfoId = model.processInfoId || 0;
      subProcessInfo.subProcessTypeId =
        model.processTypeID === ProcessType.Stage ? Number(model.subProcessTypeID || info.value.subProcessTypeID) : Number(info.value.subProcessTypeID || model.subProcessTypeID);
      subProcessInfo.lengthOfCut = this.sharedService.convertUomToSaveAndCalculation(info.value.lengthOfCut || 0, conversionValue, isEnableUnitConversion);
      subProcessInfo.formLength = this.sharedService.convertUomToSaveAndCalculation(info.value.formLength || 0, conversionValue, isEnableUnitConversion);
      subProcessInfo.formHeight = this.sharedService.convertUomToSaveAndCalculation(info.value.formHeight || 0, conversionValue, isEnableUnitConversion);
      subProcessInfo.hlFactor = info.value.hlFactor || 0;
      subProcessInfo.bendingLineLength = this.sharedService.convertUomToSaveAndCalculation(info.value.bendingLineLength || 0, conversionValue, isEnableUnitConversion);
      subProcessInfo.shoulderWidth = this.sharedService.convertUomToSaveAndCalculation(info.value.shoulderWidth || 0, conversionValue, isEnableUnitConversion);
      subProcessInfo.noOfBends = info.value.noOfBends || 0;
      subProcessInfo.formPerimeter = this.sharedService.convertUomToSaveAndCalculation(info.value.formPerimeter || 0, conversionValue, isEnableUnitConversion);
      subProcessInfo.formingForce = this.sharedService.convertUomToSaveAndCalculation(info.value.formingForce || 0, conversionValue, isEnableUnitConversion);
      subProcessInfo.noOfHoles = info.value.noOfHoles;
      if (isAssemblyOrElectronics) {
        subProcessInfo.workpieceInitialDia = this.sharedService.convertUomToSaveAndCalculation(Number(info.value.workpieceInitialDia) || 0, conversionValue, isEnableUnitConversion);
        subProcessInfo.workpieceFinalDia = this.sharedService.convertUomToSaveAndCalculation(Number(info.value.workpieceFinalDia) || 0, conversionValue, isEnableUnitConversion);
        subProcessInfo.partInitialDia = this.sharedService.convertUomToSaveAndCalculation(Number(info.value.partInitialDia) || 0, conversionValue, isEnableUnitConversion);
      } else {
        subProcessInfo.recommendTonnage = this.sharedService.convertUomToSaveAndCalculation(info.value.recommendTonnage, conversionValue, isEnableUnitConversion);
        subProcessInfo.blankArea = this.sharedService.convertUomToSaveAndCalculation(info.value.blankArea, conversionValue, isEnableUnitConversion);
        subProcessInfo.formingForce = info.value.formingForce;
        subProcessInfo.noOfNodePoints = info.value.noOfNodePoints;
        subProcessInfo.harnessRequirement = info.value.harnessRequirement;
        subProcessInfo.typeOfSplice = info.value.typeOfSplice;
        subProcessInfo.maxLength = info.value.maxLength;
        subProcessInfo.minLength = info.value.minLength;
        if (info?.value?.cableLengthArray) {
          subProcessInfo.additionalLengthArray = info?.value?.cableLengthArray?.join();
        }
      }
      if (model.subProcessTypeInfos == null) {
        model.subProcessTypeInfos = [];
      }
      model.subProcessTypeInfos.push(subProcessInfo);
    }
  }

  setPrimaryProcessFlag(processFlag: any, materialProcessId: number) {
    processFlag.IsNoBakeCasting = materialProcessId === PrimaryProcessType.NoBakeCasting;
    processFlag.IsInvestmentCasting = materialProcessId === PrimaryProcessType.InvestmentCasting;
    processFlag.IsGreenCastingAuto = materialProcessId === PrimaryProcessType.GreenCastingAuto;
    processFlag.IsGreenCastingSemiAuto = materialProcessId === PrimaryProcessType.GreenCastingSemiAuto;
    processFlag.IsGreenCasting = processFlag.IsGreenCastingAuto || processFlag.IsGreenCastingSemiAuto;
    processFlag.IsHPDCCasting = materialProcessId === PrimaryProcessType.HPDCCasting;
    processFlag.IsGDCCasting = materialProcessId === PrimaryProcessType.GDCCasting;
    processFlag.IsLPDCCasting = materialProcessId === PrimaryProcessType.LPDCCasting;
    processFlag.IsShellCasting = materialProcessId === PrimaryProcessType.ShellCasting;
    processFlag.IsPrimaryProcessWireCutting = materialProcessId === PrimaryProcessType.WireCuttingTermination;
    processFlag.IsCasting =
      processFlag.IsNoBakeCasting ||
      processFlag.IsInvestmentCasting ||
      processFlag.IsGreenCasting ||
      processFlag.IsHPDCCasting ||
      processFlag.IsGDCCasting ||
      processFlag.IsLPDCCasting ||
      processFlag.IsShellCasting;
    processFlag.IsForging = [
      PrimaryProcessType.HotForgingOpenDieHot,
      PrimaryProcessType.HotForgingClosedDieHot,
      PrimaryProcessType.ColdForgingClosedDieHot,
      PrimaryProcessType.ColdForgingColdHeading,
    ].includes(materialProcessId);
  }

  setAdditionalProcessEntries(processInfo: ProcessInfoDto, materialInfo: MaterialInfoDto, currentPart: PartInfoDto): ProcessInfoDto {
    processInfo.isQaInspectorRateDirty = false;
    processInfo.isinspectionCostDirty = false;
    processInfo.isinspectionTimeDirty = false;
    const materialList: MaterialInfoDto[] = [];
    materialList.push(materialInfo);
    const process = Object.assign({}, processInfo);
    if (this.sharedService.extractedProcessData?.ProcessBendingInfo) {
      const bendWithLargerLength = this.sharedService.extractedProcessData?.ProcessBendingInfo?.sort((a, b) => b.Length - a.Length);
      let totalBendCount = 0;
      this.sharedService.extractedProcessData?.ProcessBendingInfo?.forEach((element) => {
        if (element.Type === 'Rolled Hem Bend(s)') {
          totalBendCount += Number(element.BendCount * 2);
        } else {
          totalBendCount += Number(element.BendCount);
        }
      });
      process.processTypeID = ProcessType.Bending;
      const dimz = this.sharedService.isValidNumber(materialList?.length && materialList[0]?.dimUnfoldedZ);
      if (dimz < 3) process.dieOpeningThickness = 6;
      else if (dimz < 10) process.dieOpeningThickness = 8;
      else if (dimz < 12) process.dieOpeningThickness = 10;
      else if (dimz > 12) process.dieOpeningThickness = 12;

      if (currentPart?.eav > 100000 && bendWithLargerLength[0]?.Length < 400) {
        process.moldTemp = BendingToolTypes.Dedicated;
      } else {
        process.moldTemp = BendingToolTypes.Soft;
        process.newToolingRequired = false;
      }
      process.noOfbends = totalBendCount;
      process.bendingLineLength = Number(bendWithLargerLength && bendWithLargerLength?.length > 0 ? bendWithLargerLength[0]?.Length : 0);
      process.shoulderWidth = Number(bendWithLargerLength && bendWithLargerLength?.length > 0 ? bendWithLargerLength[0]?.Width : 0);
      processInfo.recommendTonnage = this._sheetMetalConfig.getBendingTonnage(materialList, processInfo, currentPart);
    }
    if (this.sharedService.extractedProcessData?.ProcessFormInfo) {
      const formingLargerLength = this.sharedService.extractedProcessData?.ProcessFormInfo?.sort((a, b) => b.FormArea - a.FormArea);
      process.processTypeID = ProcessType.Forming;
      process.formHeight = formingLargerLength && formingLargerLength?.length > 0 ? formingLargerLength[0]?.FormHeight : 0;
      process.formLength = formingLargerLength && formingLargerLength?.length > 0 ? formingLargerLength[0]?.FormLength : 0;
      process.formPerimeter = formingLargerLength && formingLargerLength?.length > 0 ? formingLargerLength[0]?.FormPerimeter : 0;
      process.blankArea = formingLargerLength && formingLargerLength?.length > 0 ? formingLargerLength[0]?.FormArea : 0;
    }
    return process;
  }

  manufacturingCalculateCostProps = [
    'materialInfoList',
    'materialmasterDatas',
    'materialInfo',
    'machineMaster',
    'countryList',
    'materialType',
    'strokeRateList',
    'handlingTimeList',
    'strokeRateManualList',
    'toolLoadingTimeList',
    'MigLookupList',
    'laserCutttingTimeList',
    'forgingLookupList',
    'plasmaCutttingSpeedList',
    'MachiningFlags',
    'partingCuttingSpeedList',
    'facingLookupList',
    'groovingLookupList',
    'endMillingLookupList',
    'SlotMillingLookupList',
    'thermoFormingList',
    'formingTimeList',
  ];

  manufacturingMachiningProps = ['wiringHarnessLookupList', 'drillingCuttingSpeedList', 'turningLookupList', 'millingLookupList', 'boringLookupList', 'grindingLookupList'];

  manufacturingRecalculateCostProps = [
    'materialInfoList',
    'laserCutttingTimeList',
    'plasmaCutttingSpeedList',
    'handlingTimeList',
    'strokeRateList',
    'countryList',
    'toolLoadingTimeList',
    'materialType',
    'strokeRateManualList',
    'thermoFormingList',
    'formingTimeList',
    'MachiningFlags',
    'turningLookupList',
    'millingLookupList',
    'drillingCuttingSpeedList',
    'boringLookupList',
    'grindingLookupList',
  ];

  manufacturingRecalculateExistingCostProps = [
    'plasmaCutttingSpeedList',
    'laserCutttingTimeList',
    'handlingTimeList',
    'strokeRateList',
    'countryList',
    'toolLoadingTimeList',
    'materialType',
    'strokeRateManualList',
    'thermoFormingList',
    'formingTimeList',
  ];

  processFlagsForSaveColoring = [
    'IsProcessMachining',
    'IsProcessElectronics',
    'IsProcessCleaningForging',
    'IsProcessBilletHeatingForging',
    'IsProcessTrimmingHydraulicForging',
    'IsProcessStraighteningOptionalForging',
    'IsProcessPiercingHydraulicForging',
    'IsProcessTestingMpiForging',
    'IsProcessTubeBending',
    'IsInsulationJacket',
    'IsProcessBrazing',
    'IsCasting',
    'IsMetalTubeExtrusion',
    'IsMetalExtrusion',
    'IsProcessPlasticTubeExtrusion',
    'IsProcessPlasticConvolutedTubeExtrusion',
    'IsProcessPlasticVacuumForming',
    'IsProcessTypeCompressionMolding',
    'IsProcessTypeTransferMolding',
    'IsProcessTypePlasticCutting',
    'IsProcessCustomCable',
    'IsProcessWiringHarness',
    'IsProcessTubeLaser',
    'IsProcessTubeBendingMetal',
  ];
}
