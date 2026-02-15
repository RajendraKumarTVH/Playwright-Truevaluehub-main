/**
 * Constants and Enums for Playwright Tests
 * Extracted from Angular source for use in Playwright Page Object Framework
 */

// ==================== PROCESS TYPES ====================
export enum ProcessType {
    InjectionMoulding = 1,
    BlowMolding = 1,
    Boring = 2,
    GearBroaching = 3,
    CenterlessGrinding = 4,
    ClosedDieForging = 5,
    ColdHeading = 6,
    CompressionMolding = 7,
    CylindricalGrinding = 8,
    Deburring = 9,
    Deflash = 10,
    DieCutTrim = 11,
    DiePenetrationTesting = 12,
    Drilling = 13,
    DrillingCenter = 113,
    FixtureInspection = 14,
    FrictionWelding = 15,
    GravityDieCasting = 17,
    GreenSandCasting = 18,
    HeatStaking = 19,
    HighPressureDieCasting = 20,
    Honning = 21,
    HotClosedDieForging = 22,
    HotOpenDieForging = 23,
    HotRingForging = 24,
    InjectionMouldingDoubleShot = 25,
    InjectionMouldingSingleShot = 26,
    InvestmentCasting = 27,
    Lapping = 28,
    LaserCutting = 29,
    LaserEtching = 30,
    LaserMarking = 31,
    LaserWelding = 32,
    LeakTesting = 33,
    IonicWashing = 159,
    IonicTesting = 160,
    LowPressureDieCasting = 34,
    ManualInspection = 35,
    MaterialComposisition = 36,
    MechanicalJoints = 37,
    MetalTubeExtrusion = 38,
    InductionHeatingMachine = 204,
    RollingStraightening = 205,
    EddyCurrentTesting = 206,
    BrightAnnealing = 207,
    Milling = 40,
    MillingCenter = 114,
    GrindingCenter = 115,
    GearCutting = 16,
    GearSplineRolling = 193,
    GearShaving = 194,
    GearGrinding = 195,
    OxyCutting = 41,
    Painting = 42,
    PlasmaCutting = 43,
    PlasticExtrusion = 44,
    Plating = 45,
    PowderCoating = 46,
    ZincPlating = 130,
    ChromePlating = 131,
    NickelPlating = 143,
    TinPlating = 144,
    GoldPlating = 156,
    SilverPlating = 157,
    R2RPlating = 251,
    PressureTesting = 47,
    Printing = 48,
    Progressive = 49,
    RadiographyTesting = 50,
    RollForming = 51,
    RotorMolding = 52,
    RubberMaterialPreparation = 53,
    RubberVulcanization = 54,
    SaltSprayTesting = 55,
    ShellCasting = 56,
    PouringCasting = 77,
    MeltingCasting = 78,
    ShotBlasting = 79,
    Casting = 80,
    Bending = 99,
    MetalForming = 81,
    BandSaw = 82,
    RunnerRiserDegating = 83,
    PartCoolingShakeOut = 84,
    VaccumeImpregnation = 85,
    CorePreparation = 86,
    Cleaning = 88,
    CleaningCasting = 222,
    SawCutting = 89,
    StockHeating = 90,
    HeatTreatment = 122,
    TrimmingPress = 91,
    Machining = 92,
    CableWireCutting = 93,
    CableWireCrimping = 94,
    CableConnector = 95,
    CableInjectionMolding = 96,
    CableOverMolding = 97,
    CableWireTwisting = 98,
    CableBending = 80,
    CableStampingProcess = 100,
    CableSolderingProcess = 101,
    CablePottingProcess = 102,
    CableRoutingLine = 103,
    CableUltrasonicWelding = 104,
    CableHeatShrinkingTubing = 105,
    CableTieProcess = 106,
    CableLabeling = 107,
    Drawing = 108,
    StockShearing = 111,
    MoldPerparation = 116,
    Others = 120,
    Forming = 121,
    Assembly = 123,
    CablePreparation = 124,
    LineAssembly = 125,
    FinalInspection = 126,
    Dry = 129,
    WetPainting = 127,
    SiliconCoatingAuto = 178,
    SiliconCoatingSemi = 179,
    Galvanization = 180,
    CastingCorePreparation = 141,
    CastingCoreAssembly = 142,
    CastingMoldMaking = 135,
    CastingMoldAssembly = 136,
    CastingShakeout = 138,
    CastingDegating = 139,
    CastingFettling = 133,
    MetullurgicalInspection = 132,
    WaxInjectionMolding = 167,
    TreePatternAssembly = 168,
    SlurryCoating = 169,
    Dewaxing = 170,
    ShellMoldFiring = 171,
    MoldKnockout = 172,
    CustomCableDrawing = 145,
    CustomCableAnnealing = 146,
    CustomCableThinning = 147,
    CustomCableTensionStreach = 148,
    CustomCableExtruder = 149,
    CustomCableDiameterControl = 150,
    CustomCableCoreLayUp = 151,
    CustomCableSheathing = 152,
    CustomCableSparkTest = 153,
    CustomCableCableMarking = 154,
    CustomCableSpooler = 155,
    Stitching = 165,
    RubberExtrusion = 166,
    Passivation = 173,
    WeldingPreparation = 176,
    WeldingCleaning = 177,
    CleaningForging = 198,
    MaterialKitting = 182,
    ThroughHoleLine = 183,
    InCircuitTestProgramming = 184,
    Coating = 185,
    AdhesivePotting = 186,
    RoutingVScoring = 187,
    FunctionalTest = 188,
    LabellingnternalPackaging = 189,
    BarCodeReader = 190,
    SMTLine = 191,
    ElectronicsLaserMarking = 196,
    ElectronicsVisualInspection = 197,
    Testing = 199,
    Straightening = 200,
    Control = 201,
    LubricationPhosphating = 208,
    BilletHeating = 211,
    TrimmingPressForging = 212,
    TubeBending = 213,
    RubberFeltSheetCutting = 215,
    RubberFeltSheetStacking = 216,
    SeamStiching = 217,
    SeamWelding = 218,
    Brazing = 220,
    BearingPressing = 221,
    IngotBandSawCutting = 223,
    MetalExtrusion = 224,
    CutToLength = 225,
    PlasticTubeExtrusion = 226,
    PlasticConvolutedTubeExtrusion = 247,
    PlasticVacuumForming = 72,
    InnerLayer = 227,
    LaminationBonding = 228,
    PCBDrilling = 229,
    PCBPlating = 230,
    OuterLayer = 231,
    Soldermask = 232,
    SilkScreen = 233,
    SurfaceFinish = 234,
    RoutingScoring = 235,
    ETestBBT = 236,
    Shearing = 268,
    Cutting = 237,
    MaterialInspectionElectronics = 238,
    CuttingMachineElectronics = 239,
    CornersShaping = 240,
    AutomaticPCStacker = 241,
    Grind = 242,
    InspectionElectronics = 243,
    Baking = 244,
    WashingElectronics = 245,
    FQCInspection = 246,
    ManualDeflashing = 248,
    RubberInjectionMolding = 249,
    RubberInjectionMoldingDoubleShot = 250,
    Pointing = 252,
    ConnectorAssemblyPlastics = 253,
    CleaningProcess = 254,
    PlasticRotorMolding = 255,
    TwinSheetForming = 256,
    CuttingandTrimming = 257,
    ScreenPrinting = 258,
    SilkPrinting = 259,
    VacuumCleaning = 260,
    RollBending = 261,
    Wirebendingandcutting = 262,
    TubeLaser = 263,
    TubeBendingMetal = 264,
    TransferPress = 265,
    Piercing = 266,
    CuttingShearing = 269,
    ImpedanceCouponTest = 270,
    DyePenetrantTest = 271,
    MagneticParticleTest = 272,
    BodyEndsOnly = 273,
    PMICertificateOfCompliance = 274,
    HardnessTest = 275,
    MicroStructureTest = 276,
    WitnessPouringTestForBodyBonnet = 277,
    FerriteContentTestSSTest = 278,
    ImpactTest = 279,
    PittingCorrosionTest = 280,
    IGCBodyBonnetTest = 281,
    Hydrotest = 282,
    ConduitTubeSleeveHSTPreparation = 283,
    FunctionalTestCableHarness = 284,
    EMPartAssemblyTesting = 285,
    BilletHeatingContinuousFurnace = 290,
    PostCuring = 353,
    CopperPlating = 354,
    EVAFilm = 355,
    Sand3DPrinting = 356,
    PlugConnectorOvermolding = 357,
    CMMInspection = 210,
    Preform = 360,
    Sonicwelding = 46,
    TigWelding = 36,
    SpotWelding = 34,
    MigWelding = 39,
    StickWelding = 209,
    SeamWelding_Legacy = 42,
    TransferMolding = 68,
    ThermoForming = 65,
}

// ==================== TOOL TYPES ====================
export enum ToolType {
    PressMachine = 'PressMachine',
    PressBrake = 'PressBrake',
}

// ==================== MACHINING TYPES ====================
export enum MachiningTypes {
    Rod = 51,
    Tube = 41,
    SquareBar = 42,
    RectangularBar = 43,
    HexagonalBar = 44,
    Block = 58,
    Wire = 45,
    OtherShapes = 46,
    LAngle = 79,
    IBeam = 80,
    Channel = 81,
    WBeams = 82,
    HSS = 83,
}

// ==================== BENDING TOOL TYPES ====================
export enum BendingToolTypes {
    Soft = 1,
    Dedicated = 2,
}

// ==================== SAMPLING LEVEL ====================
export enum SamplingLevel {
    None = 0,
    Level1 = 1,
    Level2 = 2,
    Level3 = 3,
}

// ==================== SCREEN NAME ====================
export enum ScreeName {
    PartInfo = 1,
    Material = 2,
    Manufacturing = 3,
    Tooling = 4,
    ToolingMaterial = 5,
    ToolingManufacturing = 6,
    ToolingBOP = 7,
    ToolingOverHead = 8,
    SupportDocument = 9,
    SecondaryProcess = 10,
    Purchased = 11,
    OverheadProfit = 12,
    Packaging = 13,
    Logistic = 14,
    DutiesTraffic = 15,
    CostSummary = 16,
    SustainabilityMaterial = 17,
    SustainabilityManufacturing = 18,
    SustainabilityPackaging = 19,
    SustainabilityLogistic = 20,
    CadDrawing = 101,
}


export enum PrimaryProcessType {
    // material
    InjectionMouldingDoubleShot = 1,
    InjectionMouldingSingleShot = 2,
    BlowMoulding = 3,
    CompressionMoulding = 4,
    TransferMolding = 6,
    ThermoForming = 7,
    LaserCutting = 10,
    OxyCutting = 11,
    PlasmaCutting = 12,
    WaterjetCutting = 13,
    StampingProgressive = 14,
    StampingStage = 15,
    TurretPunch = 16,
    HPDCCasting = 17,
    LPDCCasting = 18,
    GDCCasting = 19,
    GreenCastingAuto = 20,
    GreenCastingSemiAuto = 68,
    ColdForgingClosedDieHot = 23,
    ColdForgingColdHeading = 24,
    WeldingGMAW = 61000,
    HotForgingClosedDieHot = 25,
    HotForgingOpenDieHot = 26,
    WiringHarness = 37,
    CableAssembly = 46,
    Assembly = 69,
    Painting = 53,
    Plating = 54,
    PowderCoating = 55,
    Printing = 56,
    MigWelding = 57,
    TigWelding = 58,
    SpotWelding = 77,
    StickWelding = 78,
    WeldingPreparation = 176,
    WeldingCleaning = 177,
    WetPainting = 59,
    ZincPlating = 60,
    ChromePlating = 61,
    NoBakeCasting = 62,
    InvestmentCasting = 21,
    ShellCasting = 22,
    VProcessSandCasting = 113,
    Sand3DPrinting = 114,
    NickelPlating = 63,
    CopperPlating = 112,
    TinPlating = 64,
    GoldPlating = 66,
    SilverPlating = 67,
    R2RPlating = 96,
    CustomizeCable = 65,
    ConnectorAssembly = 70,
    WireCuttingTermination = 71,
    RubberExtrusion = 48,
    SiliconCoatingAuto = 73,
    SiliconCoatingSemi = 74,
    Galvanization = 75,
    MetalTubeExtrusion = 49,
    ConventionalPCB = 84,
    HDIPCB = 85,
    TubeBending = 86,
    InsulationJacket = 87,
    SeamWelding = 88,
    Brazing = 90,
    MetalExtrusion = 91,
    PlasticTubeExtrusion = 92,
    PlasticVacuumForming = 8,
    RigidFlexPCB = 100,
    TransferPress = 102,
    SemiRigidFlex = 104,
    Electronics = 105,
    RubberInjectionMolding = 94,
    RoundBar = 51,
    RectangularBar = 43,
    RoundTube = 41,
    TubeLaserCutting = 116,
}


// ==================== MANUFACTURING CATEGORIES ====================
export enum ManufacturingCategory {
    SheetMetalAndFabrication = 1,
    PlasticInjectionMoulding = 2,
    StockMachining = 3,
    CastingAndMachining = 4,
    ForgingAndMachining = 5,
    MetalExtrusion = 6,
    Composites = 7,
    Electronics = 8,
    Packaging = 9
}

export const ManufacturingCategoryNames: Record<ManufacturingCategory, string> = {
    [ManufacturingCategory.SheetMetalAndFabrication]: 'Sheet Metal and Fabrication',
    [ManufacturingCategory.PlasticInjectionMoulding]: 'Plastic Injection Moulding',
    [ManufacturingCategory.StockMachining]: 'Stock Machining',
    [ManufacturingCategory.CastingAndMachining]: 'Casting and Machining',
    [ManufacturingCategory.ForgingAndMachining]: 'Forging and Machining',
    [ManufacturingCategory.MetalExtrusion]: 'Metal Extrusion',
    [ManufacturingCategory.Composites]: 'Composites',
    [ManufacturingCategory.Electronics]: 'Electronics',
    [ManufacturingCategory.Packaging]: 'Packaging'
};

// ==================== PART COMPLEXITY ====================
export enum PartComplexity {
    Low = 1,
    Medium = 2,
    High = 3
}

export const PartComplexityNames: Record<PartComplexity, string> = {
    [PartComplexity.Low]: 'Low',
    [PartComplexity.Medium]: 'Medium',
    [PartComplexity.High]: 'High'
};

// ==================== MACHINE TYPES ====================
export enum MachineType {
    Automatic = 1,
    SemiAuto = 2,
    Manual = 3
}

// ==================== MATERIAL CATEGORIES ====================
export enum MaterialCategory {
    Steel = 1,
    Aluminium = 2,
    StainlessSteel = 3,
    Copper = 4,
    Brass = 5,
    Plastic = 6
}

// ==================== STOCK FORMS ====================
export enum StockForm {
    Film = 1,
    Membrane = 2,
    Ingot = 3,
    Sheet = 4,
    CChannel = 5,
    Wax = 6,
    Flat = 7,
    Ore = 8,
    Liquid = 9,
    Foam = 10,
    Bar = 11,
    Pulp = 12,
    Cardboard = 13,
    RectangularBar = 14,
    Section = 15,
    CustomExtrusion = 16,
    Pallet = 17,
    Fiber = 18,
    Billet = 19,
    ExtrusionDrawnForms = 20,
    Cord = 21,
    Wire = 22,
    Granules = 23,
    SquareBillet = 24,
    Rod = 25,
    Sand = 26,
    HexBar = 27,
    Oil = 28,
    Coil = 29,
    Paste = 30,
    Gas = 31,
    Yarn = 32,
    Foil = 33,
    SquareTube = 34,
    Plank = 35,
    Stone = 36,
    Usteel = 37,
    FoamTape = 38,
    Stock = 39,
    Dough = 40,
    Box = 41,
    SeamlessTube = 42,
    RoundBar = 43,
    SquareBar = 44,
    Tube = 45,
    Thread = 46,
    Plate = 47,
    SquarePlate = 48,
    Strip = 49,
    LAngle = 50,
    Paper = 51,
    Roll = 52,
    SquarePipe = 53,
    SerpentinePipe = 54,
    Powder = 55,
    Pipe = 56,
    Chips = 57
}

// ==================== TOOLING ENUMS ====================
export enum ToolingCountry {
    India = 1,
    China = 2,
    Mexico = 4,
    USA = 5,
    Czech = 8,
    Taiwan = 23,
    SouthKorea = 22
}

export enum SheetMetalTool {
    FormingTool = 1,
    BendingTool = 2,
    CuttingTool = 3,
    StampingTool = 4,
    BalnkAndPierce = 5,
    CompoundTool = 6,
    ShallowDrawTool = 7,
    RedrawTool = 8,
    TrimmingTool = 9
}

// ==================== CURRENCY & UNITS ====================
export enum CurrencyType {
    AUD = 1,
    BZR = 2,
    CAD = 3,
    CHF = 4,
    CNY = 5,
    EUR = 6,
    GBP = 7,
    HKD = 8,
    INR = 9,
    JPY = 10,
    NZD = 11,
    SEK = 12,
    USD = 13,
    ZAR = 14
}

export enum UnitType {
    Imperial = 1,
    Metric = 2
}

// ==================== WELD TYPES ====================
export const WeldTypes = [
    { id: 1, name: 'Fillet Weld' },
    { id: 2, name: 'Lap Weld' },
    { id: 3, name: 'Butt Weld (Full Peneteration)' },
    { id: 4, name: 'Butt Weld (Partial Peneteration)' }
];

export const WeldPositions = [
    { id: 1, name: 'Flat' },
    { id: 2, name: 'Horizontal' },
    { id: 3, name: 'Vertical' },
    { id: 4, name: 'OverHead' },
    { id: 6, name: 'Combination' }
];

// ==================== PROJECT STATUS ====================
export enum ProjectStatus {
    Draft = 1,
    InProgress = 2,
    PendingApproval = 3,
    Approved = 4,
    Rejected = 5,
    Completed = 6
}

// ==================== INCOTERMS ====================
export enum Incoterms {
    CFR = 1,
    CIF = 2,
    CIP = 3,
    CPT = 4,
    DAP = 5,
    DDP = 6,
    DPU = 7,
    EXW = 8,
    FAS = 9,
    FCA = 10,
    FOB = 11,
    NA = 12
}

// ==================== WELD TYPES (MIG Welding) ====================
export enum WeldType {
    Fillet = 1,
    Square = 2,
    Plug = 3,
    BevelFlareVGroove = 4,
    UJGroove = 5
}

export const WeldTypeNames: Record<WeldType, string> = {
    [WeldType.Fillet]: 'Fillet',
    [WeldType.Square]: 'Square',
    [WeldType.Plug]: 'Plug',
    [WeldType.BevelFlareVGroove]: 'Bevel/Flare/ V Groove',
    [WeldType.UJGroove]: 'U/J Groove'
};

// ==================== WELD POSITIONS ====================
export enum WeldPosition {
    Flat = 1,
    Horizontal = 2,
    Vertical = 3,
    Overhead = 4,
    Combination = 6
}

export const WeldPositionNames: Record<WeldPosition, string> = {
    [WeldPosition.Flat]: 'Flat',
    [WeldPosition.Horizontal]: 'Horizontal',
    [WeldPosition.Vertical]: 'Vertical',
    [WeldPosition.Overhead]: 'OverHead',
    [WeldPosition.Combination]: 'Combination'
};

// ==================== WELD SIDES ====================
export enum WeldSide {
    Single = 1,
    Both = 2
}

export const WeldSideNames: Record<WeldSide, string> = {
    [WeldSide.Single]: 'Single',
    [WeldSide.Both]: 'Both'
};

// ==================== GRIND FLUSH OPTIONS ====================
export enum GrindFlush {
    No = 0,
    Yes = 1
}

export const GrindFlushNames: Record<GrindFlush, string> = {
    [GrindFlush.No]: 'No',
    [GrindFlush.Yes]: 'Yes'
};

// ==================== SAMPLING PLAN ====================
export enum SamplingPlan {
    Level1 = 1,
    Level2 = 2,
    Level3 = 3
}

export const SamplingPlanNames: Record<SamplingPlan, string> = {
    [SamplingPlan.Level1]: 'Level1',
    [SamplingPlan.Level2]: 'Level2',
    [SamplingPlan.Level3]: 'Level3'
};

// ==================== WIRE DIAMETERS (mm) ====================
export const WireDiameters = [0.8, 1.0, 1.2, 1.6, 2.0, 2.4, 3.2];

// ==================== DEFAULT VALUES ====================
export const DefaultValues = {
    MIG_WELDING: {
        efficiency: 70,
        loadingUnloadingTime: 20,
        samplingRate: 5,
        yieldPercentage: 97,
        machineSetupTime: 30,
        qaInspectionTime: 2,
        noOfDirectLabors: 1
    },
    WELD_ELEMENT_SIZE_TABLE: [
        { maxWeldSize: 3, elementSize: 3 },
        { maxWeldSize: 4.5, elementSize: 3 },
        { maxWeldSize: 5.5, elementSize: 4 },
        { maxWeldSize: 6, elementSize: 5 },
        { maxWeldSize: 12, elementSize: 6 },
        { maxWeldSize: Infinity, elementSize: 8 }
    ]
};

// ==================== UI LABELS ====================
export const UILabels = {
    PART_INFORMATION: 'Part Information',
    MATERIAL_INFORMATION: 'Material Information',
    MANUFACTURING_INFORMATION: 'Manufacturing Information',
    TOOLING: 'Tooling',
    COST_SUMMARY: 'Cost Summary',
    WELDING_DETAILS: 'Welding Details',
    MACHINE_DETAILS: 'Machine Details',
    PROCESS_DETAILS: 'Process Details',
    CYCLE_TIME_DETAILS: 'Cycle Time Details',
    SUB_PROCESS_DETAILS: 'Sub Process Details',
    MANUFACTURING_DETAILS: 'Manufacturing Details',
    SUSTAINABILITY: 'Sustainability',
    PART_DETAILS: 'Part Details',
    SUPPLY_TERMS: 'Supply Terms',
    MATERIAL_INFO: 'Material Info',
    MATERIAL_DETAILS: 'Material Details'
};

// ==================== SUB PROCESS TYPES ====================
export enum SubProcessType {
    MetalForPouring = 1,
    SandForCore = 2,
    SandForMold = 3,
    PatternWax = 4,
    SlurryCost = 5,
    GreenSandCost = 6,
    ZirconSand = 7,
}

// ==================== COMMODITY TYPES ====================
export enum CommodityType {
    PlasticAndRubber = 1,
    SheetMetal = 2,
    Casting = 3,
    StockMachining = 4,
    MetalForming = 5,
    Extrusion = 6,
    AdditiveManufacturing = 7,
    PCBAQuickCosting = 8,
    Electricals = 9,
    Others = 10,
    Testing = 11,
    Assembly = 12,
    WiringHarness = 14,
    Electronics = 15,
    PrintedCircuitBoard = 16,
}