/**
 * Constants and Enums for Playwright Tests
 * Extracted from Angular source for use in Playwright Page Object Framework
 */

// ==================== PROCESS TYPES ====================
export enum ProcessType {
    InjectionMoulding = 1,
    SheetMetalBending = 22,
    SheetMetalStamping = 23,
    SheetMetalForming = 24,
    LaserCutting = 25,
    WaterJetCutting = 26,
    PlasmaCutting = 27,
    Punching = 28,
    Bending = 29,
    MigWelding = 39,
    TigWelding = 67,
    SpotWelding = 59,
    SeamWelding = 88,
    StickWelding = 209,
    FrictionWelding = 15,
    Sonicwelding = 126,
    WeldingPreparation = 176,
    WeldingCleaning = 177,
    CNCMachining = 30,
    Turning = 31,
    Milling = 32,
    Drilling = 33,
    Grinding = 34,
    Electroplating = 40,
    Painting = 41,
    PowderCoating = 42,
    Anodizing = 43,
    HeatTreatment = 44,
    Assembly = 50,
    TubeBending = 60,
    Brazing = 70,
    Casting = 80,
    Forging = 90
}

export enum PrimaryProcessType {
    SeamWelding = 88,
    SpotWelding = 77,
    MigWelding = 57,
    StickWelding = 78,
    TigWelding = 58,
    WeldingPreparation = 176,
    WeldingCleaning = 177,
    InjectionMoulding = 1,
    SheetMetal = 2,
    Machining = 3,
    Casting = 4,
    Forging = 5
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
