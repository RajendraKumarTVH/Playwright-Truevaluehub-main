import { MaterialCastingConfigService } from './material-casting-config';
import { MaterialPCBConfigService } from './material-pcb-config';
import { MaterialMachiningConfigService } from './material-machining-config';
import { MaterialInsulationJacketMappingService } from '../mapping/material-insulation-jacket-mapping';
import { MaterialForgingConfigService } from './material-forging-config';
import { CommodityType, PrimaryProcessType } from 'src/app/modules/costing/costing.config';

export class MaterialConfigService {
  coatingGrade = [
    { id: 1, grade: 'G360', SheetThickness: { min: 25, max: Infinity }, thickness: 82.3 },
    { id: 2, grade: 'G300', SheetThickness: { min: 25, max: Infinity }, thickness: 68.6 },
    { id: 3, grade: 'G235', SheetThickness: { min: 25, max: Infinity }, thickness: 53.7 },
    { id: 4, grade: 'G210', SheetThickness: { min: 25, max: Infinity }, thickness: 48 },
    { id: 5, grade: 'G185', SheetThickness: { min: 8, max: 25 }, thickness: 42.3 },
    { id: 6, grade: 'G165', SheetThickness: { min: 6, max: 8 }, thickness: 37.7 },
    { id: 7, grade: 'G140', SheetThickness: { min: 3, max: 6 }, thickness: 32 },
    { id: 8, grade: 'G115', SheetThickness: { min: 2, max: 3 }, thickness: 26.3 },
    { id: 9, grade: 'G90', SheetThickness: { min: 1, max: 2 }, thickness: 20.6 },
    { id: 10, grade: 'G60', SheetThickness: { min: 0, max: 1 }, thickness: 13.7 },
    { id: 11, grade: 'G40', SheetThickness: { min: 0, max: 0.5 }, thickness: 9.1 },
    { id: 12, grade: 'G30', SheetThickness: { min: 0, max: 1 }, thickness: 6.9 },
  ];

  getMaxCoatingThicknessRecord(partThickness: number) {
    const matches = this.coatingGrade.filter((item) => partThickness >= item.SheetThickness.min && partThickness <= item.SheetThickness.max);

    if (matches.length === 0) return null;

    return matches.reduce((max, item) => (item.thickness > max.thickness ? item : max));
  }

  criticalityLevels = [
    { id: 1, criticality: 'Normal' },
    { id: 2, criticality: 'Less Critical' },
    { id: 3, criticality: 'Moderate' },
    { id: 4, criticality: 'Critical' },
  ];

  constructor(
    private materialCastingConfigService: MaterialCastingConfigService,
    public _materialForgingConfigService: MaterialForgingConfigService,
    private materialPCBConfigService: MaterialPCBConfigService,
    public materialMachiningConfigService: MaterialMachiningConfigService,
    public materialInsulationJacketConfigService: MaterialInsulationJacketMappingService
  ) { }

  getCableTypeList() {
    return [
      { id: 1, name: 'Cable' },
      { id: 2, name: 'Connector' },
      { id: 3, name: 'Connector Terminal' },
      { id: 4, name: 'Customised Injection Molded Part ' },
      { id: 5, name: 'Over Mold Material' },
      { id: 6, name: 'Customised Stamping' },
      { id: 7, name: 'Heat Shrink Tube' },
      { id: 8, name: 'Electronic/ElectroMechanical/Electric Part' },
      { id: 9, name: 'STD Purchase Part -Grommet/Clips/Cable Ties/Label' },
      { id: 10, name: 'STD Purchase Part -Protective Tape/Insulation Tape' },
      { id: 11, name: 'Potting' },
    ];
  }

  controlsToReset = [
    'length',
    'width',
    'height',
    'maxWallthick',
    'partVolume',
    'partProjectArea',
    'projectedArea',
    'netWeight',
    'partInnerDiameter',
    'partOuterDiameter',
    'partLength',
    'partWidth',
    'partHeight',
    'stockLength',
    'stockDiameter',
    'density',
    'unfoldedLength',
    'unfoldedWidth',
    'thickness',
    'noOfInserts',
  ];

  processFlagsForSaveColoring = [
    'IsProcessCasting',
    'IsProcessMetalTubeExtrusion',
    'IsProcessMetalExtrusion',
    'IsProcessMachining',
    'IsProcessConventionalPCB',
    'IsProcessRigidFlexPCB',
    'IsProcessSemiRigidFlexPCB',
    'IsProcessTubeBending',
    'IsProcessInsulationJacket',
    'IsProcessPlasticTubeExtrusion',
    'IsProcessPlasticVacuumForming',
    'IsProcessCustomizeCable',
    'IsProcessTypeInjectionMolding',
    'IsProcessTypeRubberInjectionMolding',
    'IsProcessTypeCompressionMolding',
    'IsProcessTypeTransferMolding',
    'IsProcessTypeBlowMolding',
    'IsProcessThermoForming',
    'IsProcessLaserCutting',
    'IsProcessTubeLaserCutting',
    'IsProcessPlasmaCutting',
    'IsProcessOxyCutting',
    'IsProcessTPP',
    'IsProcessStampingStage',
    'IsProcessStampingProgressive',
    'IsProcessTransferPress',
    'IsProcessMigWelding',
    'IsProcessTigWelding',
    'IsProcessTypePlating',
    'IsProcessTypeZincPlating',
    'IsProcessTypeChromePlating',
    'IsProcessTypeNickelPlating',
    'IsProcessTypeR2RPlating',
    'IsProcessTypeCopperPlating',
    'IsProcessTypeTinPlating',
    'IsProcessTypeGoldPlating',
    'IsProcessTypeSilverPlating',
    'IsProcessTypeGalvanization',
    'IsProcessTypePowderCoating',
    'IsProcessTypePowderPainting',
    'IsProcessT',
    'IsProcessTypeCompressionMolding',
  ];

  defaultValues = {
    scrapPrice: 0,
    materialPrice: 0,
    density: 0,
    sandCost: 0,
    volumePurchased: 0,
    volumeOneMTDiscount: 0,
    volumeTwentyFiveMTDiscount: 0,
    volumeFiftyMTDiscount: 0,
    regrindAllowance: 0,
    utilisation: 0,
    netWeight: 0,
  };

  forgingDefaultValues = {
    hotForgingClosedDieHot: false,
    hotForgingOpenDieHot: false,
    coldForgingClosedDieHot: false,
    coldForgingColdHeadingDie: false,
  };

  public processFlag = {
    IsProcessTypeInjectionMolding: false,
    IsProcessTypeRubberInjectionMolding: false,
    IsProcessColdForgingColdHeading: false,
    IsProcessStockFormRound: false,
    IsProcessStockFormWire: false,
    IsProcessStockFormRectangleBar: false,
    IsProcessStockFormTube: false,
    IsProcessMigWelding: false,
    IsProcessTigWelding: false,
    IsProcessSpotWelding: false,
    IsProcessSeamWelding: false,
    IsProcessStickWelding: false,
    IsProcessTypeWelding: false,
    IsProcessStampingProgressive: false,
    IsProcessTypeAssembly: false,
    IsProcessStampingStage: false,
    IsProcessLaserCutting: false,
    IsProcessTubeLaserCutting: false,
    IsProcessPlasmaCutting: false,
    IsProcessOxyCutting: false,
    IsProcessTPP: false,
    IsProcessTypePouring: false,
    IsProcessTypeSandForMold: false,
    IsProcessTypeSandForCore: false,
    IsProcessTypePatternWax: false,
    IsProcessTypeSlurryCost: false,
    IsProcessTypeZirconSand: false,
    // IsProcessTypeGreenSandCost : false,
    IsProcessTypeGreenAuto: false,
    IsProcessTypeGreenSemiAuto: false,
    IsProcessGreenCasting: false,
    IsProcessHPDCCasting: false,
    IsProcessLPDCCasting: false,
    IsProcessGDCCasting: false,
    IsProcessDieCasting: false,
    IsProcessShellCasting: false,
    IsProcessVProcessSandCasting: false,
    IsProcessSand3DPrinting: false,
    IsProcessNoBakeCasting: false,
    IsProcessInvestmentCasting: false,
    IsProcessCasting: false,
    IsProcessMachining: false,
    IsProcessTubeBending: false,
    IsProcessInsulationJacket: false,
    IsProcessBrazing: false,
    IsProcessMetalExtrusion: false,
    IsProcessPlasticTubeExtrusion: false,
    IsProcessPlasticVacuumForming: false,
    IsProcessCableAssembly: false,
    IsProcessTypePlating: false,
    IsProcessTypeZincPlating: false,
    IsProcessTypeChromePlating: false,
    IsProcessTypeNickelPlating: false,
    IsProcessTypeCopperPlating: false,
    IsProcessTypeR2RPlating: false,
    IsProcessTypeTinPlating: false,
    IsProcessTypeGoldPlating: false,
    IsProcessTypeSilverPlating: false,
    IsProcessTypePowderCoating: false,
    IsProcessTypePowderPainting: false,
    IsProcessTypeWetPainting: false,
    IsProcessTypeGalvanization: false,
    IsProcessTypeSiliconCoatingAuto: false,
    IsProcessTypeSiliconCoatingSemi: false,
    IsProcessTypeWiringHarness: false,
    IsProcessTypeRubberExtrusion: false,
    IsProcessMetalTubeExtrusion: false,
    IsProcessTypeCompressionMolding: false,
    IsProcessTypeBlowMolding: false,
    IsProcessTypeTransferMolding: false,
    IsProcessTypePlasticCutting: false,
    IsProcessThermoForming: false,
    IsProcessCustomizeCable: false,
    IsMaterialTypeNonFerrous: false,
    IsMaterialTypePlastics: false,
    IsProcessTypeConnectorAssembly: false,
    IsProcessTypeWireCuttingTermination: false,
    IsProcessConventionalPCB: false,
    IsProcessRigidFlexPCB: false,
    IsProcessTransferPress: false,
    IsProcessSemiRigidFlexPCB: false,
  };

  public clearProcessTypeFlags(processFlag) {
    processFlag.IsProcessTypeInjectionMolding = false;
    processFlag.IsProcessTypeRubberInjectionMolding = false;
    processFlag.IsProcessColdForgingColdHeading = false;
    processFlag.IsProcessStockFormRound = false;
    processFlag.IsProcessStockFormWire = false;
    processFlag.IsProcessStockFormRectangleBar = false;
    processFlag.IsProcessStockFormTube = false;
    processFlag.IsProcessBrazing = false;
    processFlag.IsProcessMigWelding = false;
    processFlag.IsProcessTigWelding = false;
    processFlag.IsProcessSpotWelding = false;
    processFlag.IsProcessSeamWelding = false;
    processFlag.IsProcessStickWelding = false;
    processFlag.IsProcessTypeWelding = false;
    processFlag.IsProcessStampingProgressive = false;
    processFlag.IsProcessTypeAssembly = false;
    processFlag.IsProcessStampingStage = false;
    processFlag.IsProcessLaserCutting = false;
    processFlag.IsProcessTubeLaserCutting = false;
    processFlag.IsProcessPlasmaCutting = false;
    processFlag.IsProcessOxyCutting = false;
    processFlag.IsProcessTPP = false;
    processFlag.IsProcessTypePouring = false;
    processFlag.IsProcessTypeSandForMold = false;
    processFlag.IsProcessTypeSandForCore = false;
    processFlag.IsProcessTypePatternWax = false;
    processFlag.IsProcessTypeSlurryCost = false;
    processFlag.IsProcessTypeZirconSand = false;
    // IsProcessTypeGreenSandCost =false;
    processFlag.IsProcessTypeGreenAuto = false;
    processFlag.IsProcessTypeGreenSemiAuto = false;
    processFlag.IsProcessGreenCasting = false;
    processFlag.IsProcessHPDCCasting = false;
    processFlag.IsProcessLPDCCasting = false;
    processFlag.IsProcessGDCCasting = false;
    processFlag.IsProcessDieCasting = false;
    processFlag.IsProcessShellCasting = false;
    processFlag.IsProcessVProcessSandCasting = false;
    processFlag.IsProcessSand3DPrinting = false;
    processFlag.IsProcessNoBakeCasting = false;
    processFlag.IsProcessInvestmentCasting = false;
    processFlag.IsProcessCasting = false;
    processFlag.IsProcessMachining = false;
    processFlag.IsProcessTubeBending = false;
    processFlag.IsProcessInsulationJacket = false;
    processFlag.IsProcessMetalExtrusion = false;
    processFlag.IsProcessPlasticTubeExtrusion = false;
    processFlag.IsProcessPlasticVacuumForming = false;
    // processFlag.IsProcessCableAssembly = false;
    processFlag.IsProcessTypePlating = false;
    processFlag.IsProcessTypeZincPlating = false;
    processFlag.IsProcessTypeChromePlating = false;
    processFlag.IsProcessTypeNickelPlating = false;
    processFlag.IsProcessTypeCopperPlating = false;
    processFlag.IsProcessTypeR2RPlating = false;
    processFlag.IsProcessTypeTinPlating = false;
    processFlag.IsProcessTypeGoldPlating = false;
    processFlag.IsProcessTypeSilverPlating = false;
    processFlag.IsProcessTypePowderCoating = false;
    processFlag.IsProcessTypePowderPainting = false;
    processFlag.IsProcessTypeWetPainting = false;
    processFlag.IsProcessTypeGalvanization = false;
    processFlag.IsProcessTypeSiliconCoatingAuto = false;
    processFlag.IsProcessTypeSiliconCoatingSemi = false;
    processFlag.IsProcessTypeWiringHarness = false;
    processFlag.IsProcessTypeRubberExtrusion = false;
    processFlag.IsProcessMetalTubeExtrusion = false;
    processFlag.IsProcessTypeCompressionMolding = false;
    processFlag.IsProcessTypeTransferMolding = false;
    processFlag.IsProcessTypePlasticCutting = false;
    processFlag.IsProcessTypeBlowMolding = false;
    processFlag.IsProcessThermoForming = false;
    processFlag.IsProcessCustomizeCable = false;
    processFlag.IsMaterialTypeNonFerrous = false;
    processFlag.IsMaterialTypePlastics = false;
    processFlag.IsProcessTypeConnectorAssembly = false;
    processFlag.IsProcessTypeWireCuttingTermination = false;
    processFlag.IsProcessConventionalPCB = false;
    processFlag.IsProcessRigidFlexPCB = false;
    processFlag.IsProcessTransferPress = false;
    processFlag.IsProcessSemiRigidFlexPCB = false;
    return processFlag;
  }

  public setPrimaryProcessTypeFlags(processFlag, processValueId, currentCommodityId) {
    processFlag.IsProcessTypeAssembly = processValueId == PrimaryProcessType.Assembly ? true : false;
    processFlag.IsProcessStampingProgressive = processValueId == PrimaryProcessType.StampingProgressive ? true : false;
    processFlag.IsProcessStampingStage = processValueId == PrimaryProcessType.StampingStage ? true : false;
    processFlag.IsProcessLaserCutting = processValueId == PrimaryProcessType.LaserCutting ? true : false;
    processFlag.IsProcessTubeLaserCutting = processValueId == PrimaryProcessType.TubeLaserCutting ? true : false;
    processFlag.IsProcessPlasmaCutting = processValueId == PrimaryProcessType.PlasmaCutting ? true : false;
    processFlag.IsProcessOxyCutting = processValueId == PrimaryProcessType.OxyCutting ? true : false;
    processFlag.IsProcessTPP = processValueId == PrimaryProcessType.TurretPunch ? true : false;
    processFlag.IsProcessColdForgingColdHeading = [PrimaryProcessType.ColdForgingColdHeading].includes(processValueId) ? true : false;
    processFlag.IsProcessTypeInjectionMolding = [PrimaryProcessType.InjectionMouldingSingleShot, PrimaryProcessType.InjectionMouldingDoubleShot].includes(processValueId) ? true : false;
    processFlag.IsProcessTypeRubberInjectionMolding = processValueId == PrimaryProcessType.RubberInjectionMolding ? true : false;
    processFlag.IsProcessThermoForming = processValueId == PrimaryProcessType.ThermoForming ? true : false;
    processFlag.IsProcessTypeGreenAuto = processValueId == PrimaryProcessType.GreenCastingAuto ? true : false;
    processFlag.IsProcessTypeGreenSemiAuto = processValueId == PrimaryProcessType.GreenCastingSemiAuto ? true : false;
    processFlag.IsProcessGreenCasting = processFlag.IsProcessTypeGreenAuto || processFlag.IsProcessTypeGreenSemiAuto;
    processFlag.IsProcessHPDCCasting = processValueId == PrimaryProcessType.HPDCCasting ? true : false;
    processFlag.IsProcessLPDCCasting = processValueId == PrimaryProcessType.LPDCCasting ? true : false;
    processFlag.IsProcessGDCCasting = processValueId == PrimaryProcessType.GDCCasting ? true : false;
    processFlag.IsProcessDieCasting = processFlag.IsProcessHPDCCasting || processFlag.IsProcessLPDCCasting || processFlag.IsProcessGDCCasting;
    processFlag.IsProcessShellCasting = processValueId == PrimaryProcessType.ShellCasting ? true : false;
    processFlag.IsProcessVProcessSandCasting = processValueId == PrimaryProcessType.VProcessSandCasting ? true : false;
    processFlag.IsProcessSand3DPrinting = processValueId == PrimaryProcessType.Sand3DPrinting ? true : false;
    processFlag.IsProcessNoBakeCasting = processValueId == PrimaryProcessType.NoBakeCasting ? true : false;
    processFlag.IsProcessInvestmentCasting = processValueId == PrimaryProcessType.InvestmentCasting ? true : false;
    processFlag.IsProcessCasting =
      processFlag.IsProcessNoBakeCasting ||
      processFlag.IsProcessInvestmentCasting ||
      processFlag.IsProcessGreenCasting ||
      processFlag.IsProcessHPDCCasting ||
      processFlag.IsProcessGDCCasting ||
      processFlag.IsProcessLPDCCasting ||
      processFlag.IsProcessShellCasting ||
      processFlag.IsProcessVProcessSandCasting ||
      processFlag.IsProcessSand3DPrinting;
    processFlag.IsProcessTubeBending = processValueId == PrimaryProcessType.TubeBending ? true : false;
    processFlag.IsProcessInsulationJacket = processValueId == PrimaryProcessType.InsulationJacket ? true : false;
    processFlag.IsProcessBrazing = processValueId == PrimaryProcessType.Brazing ? true : false;
    processFlag.IsProcessMigWelding = processValueId == PrimaryProcessType.MigWelding ? true : false;
    processFlag.IsProcessTigWelding = processValueId == PrimaryProcessType.TigWelding ? true : false;
    processFlag.IsProcessSpotWelding = processValueId == PrimaryProcessType.SpotWelding ? true : false;
    processFlag.IsProcessSeamWelding = processValueId == PrimaryProcessType.SeamWelding ? true : false;
    processFlag.IsProcessStickWelding = processValueId == PrimaryProcessType.StickWelding ? true : false;
    processFlag.IsProcessTypeWelding = [
      PrimaryProcessType.MigWelding,
      PrimaryProcessType.TigWelding,
      PrimaryProcessType.SpotWelding,
      PrimaryProcessType.SeamWelding,
      PrimaryProcessType.StickWelding,
    ].includes(processValueId)
      ? true
      : false;
    // processFlag.IsProcessCableAssembly = processValueId == PrimaryProcessType.CableAssembly ? true : false;
    processFlag.IsProcessTypeZincPlating = processValueId == PrimaryProcessType.ZincPlating ? true : false;
    processFlag.IsProcessTypeChromePlating = processValueId == PrimaryProcessType.ChromePlating ? true : false;
    processFlag.IsProcessTypeNickelPlating = processValueId == PrimaryProcessType.NickelPlating ? true : false;
    processFlag.IsProcessTypeCopperPlating = processValueId == PrimaryProcessType.CopperPlating ? true : false;
    processFlag.IsProcessTypeR2RPlating = processValueId == PrimaryProcessType.R2RPlating ? true : false;
    processFlag.IsProcessTypeTinPlating = processValueId == PrimaryProcessType.TinPlating ? true : false;
    processFlag.IsProcessTypeGoldPlating = processValueId == PrimaryProcessType.GoldPlating ? true : false;
    processFlag.IsProcessTypeSilverPlating = processValueId == PrimaryProcessType.SilverPlating ? true : false;
    processFlag.IsProcessTypePlating =
      processFlag.IsProcessTypeZincPlating ||
      processFlag.IsProcessTypeChromePlating ||
      processFlag.IsProcessTypeNickelPlating ||
      processFlag.IsProcessTypeCopperPlating ||
      processFlag.IsProcessTypeR2RPlating ||
      processFlag.IsProcessTypeTinPlating ||
      processFlag.IsProcessTypeGoldPlating ||
      processFlag.IsProcessTypeSilverPlating;

    processFlag.IsProcessTypePowderCoating = processValueId == PrimaryProcessType.PowderCoating ? true : false;
    processFlag.IsProcessTypePowderPainting = processValueId == PrimaryProcessType.Painting ? true : false;
    processFlag.IsProcessTypeWetPainting = processValueId == PrimaryProcessType.WetPainting ? true : false;
    processFlag.IsProcessTypeGalvanization = processValueId == PrimaryProcessType.Galvanization ? true : false;
    processFlag.IsProcessTypeSiliconCoatingAuto = processValueId == PrimaryProcessType.SiliconCoatingAuto ? true : false;
    processFlag.IsProcessTypeSiliconCoatingSemi = processValueId == PrimaryProcessType.SiliconCoatingSemi ? true : false;
    processFlag.IsProcessMachining =
      currentCommodityId == CommodityType.StockMachining &&
        !(
          processFlag.IsProcessTypePlating ||
          processFlag.IsProcessTypePowderCoating ||
          processFlag.IsProcessTypePowderPainting ||
          processFlag.IsProcessTypeWetPainting ||
          processFlag.IsProcessTypeGalvanization ||
          processFlag.IsProcessTypeSiliconCoatingAuto ||
          processFlag.IsProcessTypeSiliconCoatingSemi
        )
        ? true
        : false;
    processFlag.IsProcessCustomizeCable = processValueId == PrimaryProcessType.CustomizeCable ? true : false;
    // processFlag.IsProcessCustomizeCable && (showAddNewOption = false);
    processFlag.IsProcessTypeWiringHarness = processValueId == PrimaryProcessType.WiringHarness ? true : false;
    processFlag.IsProcessTypeConnectorAssembly = processValueId == PrimaryProcessType.ConnectorAssembly ? true : false;
    processFlag.IsProcessTypeWireCuttingTermination = processValueId == PrimaryProcessType.WireCuttingTermination ? true : false;
    processFlag.IsProcessTypeRubberExtrusion = processValueId == PrimaryProcessType.RubberExtrusion ? true : false;
    processFlag.IsProcessPlasticTubeExtrusion = processValueId == PrimaryProcessType.PlasticTubeExtrusion ? true : false;
    processFlag.IsProcessPlasticVacuumForming = processValueId == PrimaryProcessType.PlasticVacuumForming ? true : false;
    processFlag.IsProcessMetalTubeExtrusion = processValueId == PrimaryProcessType.MetalTubeExtrusion ? true : false;
    processFlag.IsProcessMetalExtrusion = processValueId == PrimaryProcessType.MetalExtrusion ? true : false;
    processFlag.IsProcessTypeCompressionMolding = processValueId == PrimaryProcessType.CompressionMoulding ? true : false;
    processFlag.IsProcessTypeTransferMolding = processValueId == PrimaryProcessType.TransferMolding ? true : false;
    processFlag.IsProcessTypeBlowMolding = processValueId == PrimaryProcessType.BlowMoulding ? true : false;
    processFlag.IsProcessTypeAssembly = processValueId == PrimaryProcessType.Assembly ? true : false;
    processFlag.IsProcessConventionalPCB = processValueId == PrimaryProcessType.ConventionalPCB ? true : false;
    processFlag.IsProcessRigidFlexPCB = processValueId == PrimaryProcessType.RigidFlexPCB ? true : false;
    processFlag.IsProcessTransferPress = processValueId == PrimaryProcessType.TransferPress ? true : false;
    processFlag.IsProcessSemiRigidFlexPCB = processValueId == PrimaryProcessType.SemiRigidFlex ? true : false;
    return processFlag;
  }

  public StockForm = {
    GranulesWithMasterbatch: 36,
  };
}
