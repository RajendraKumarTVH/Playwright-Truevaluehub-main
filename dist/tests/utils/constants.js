"use strict";
/**
 * Constants and Enums for Playwright Tests
 * Extracted from Angular source for use in Playwright Page Object Framework
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UILabels = exports.DefaultValues = exports.WireDiameters = exports.SamplingPlanNames = exports.SamplingPlan = exports.GrindFlushNames = exports.GrindFlush = exports.WeldSideNames = exports.WeldSide = exports.WeldPositionNames = exports.WeldPosition = exports.WeldTypeNames = exports.WeldType = exports.Incoterms = exports.ProjectStatus = exports.WeldPositions = exports.WeldTypes = exports.UnitType = exports.CurrencyType = exports.SheetMetalTool = exports.ToolingCountry = exports.StockForm = exports.MaterialCategory = exports.MachineType = exports.PartComplexityNames = exports.PartComplexity = exports.ManufacturingCategoryNames = exports.ManufacturingCategory = exports.PrimaryProcessType = exports.ProcessType = void 0;
// ==================== PROCESS TYPES ====================
var ProcessType;
(function (ProcessType) {
    ProcessType[ProcessType["InjectionMoulding"] = 1] = "InjectionMoulding";
    ProcessType[ProcessType["SheetMetalBending"] = 22] = "SheetMetalBending";
    ProcessType[ProcessType["SheetMetalStamping"] = 23] = "SheetMetalStamping";
    ProcessType[ProcessType["SheetMetalForming"] = 24] = "SheetMetalForming";
    ProcessType[ProcessType["LaserCutting"] = 25] = "LaserCutting";
    ProcessType[ProcessType["WaterJetCutting"] = 26] = "WaterJetCutting";
    ProcessType[ProcessType["PlasmaCutting"] = 27] = "PlasmaCutting";
    ProcessType[ProcessType["Punching"] = 28] = "Punching";
    ProcessType[ProcessType["Bending"] = 29] = "Bending";
    ProcessType[ProcessType["MigWelding"] = 39] = "MigWelding";
    ProcessType[ProcessType["TigWelding"] = 67] = "TigWelding";
    ProcessType[ProcessType["SpotWelding"] = 59] = "SpotWelding";
    ProcessType[ProcessType["SeamWelding"] = 88] = "SeamWelding";
    ProcessType[ProcessType["StickWelding"] = 209] = "StickWelding";
    ProcessType[ProcessType["FrictionWelding"] = 15] = "FrictionWelding";
    ProcessType[ProcessType["Sonicwelding"] = 126] = "Sonicwelding";
    ProcessType[ProcessType["WeldingPreparation"] = 176] = "WeldingPreparation";
    ProcessType[ProcessType["WeldingCleaning"] = 177] = "WeldingCleaning";
    ProcessType[ProcessType["CNCMachining"] = 30] = "CNCMachining";
    ProcessType[ProcessType["Turning"] = 31] = "Turning";
    ProcessType[ProcessType["Milling"] = 32] = "Milling";
    ProcessType[ProcessType["Drilling"] = 33] = "Drilling";
    ProcessType[ProcessType["Grinding"] = 34] = "Grinding";
    ProcessType[ProcessType["Electroplating"] = 40] = "Electroplating";
    ProcessType[ProcessType["Painting"] = 41] = "Painting";
    ProcessType[ProcessType["PowderCoating"] = 42] = "PowderCoating";
    ProcessType[ProcessType["Anodizing"] = 43] = "Anodizing";
    ProcessType[ProcessType["HeatTreatment"] = 44] = "HeatTreatment";
    ProcessType[ProcessType["Assembly"] = 50] = "Assembly";
    ProcessType[ProcessType["TubeBending"] = 60] = "TubeBending";
    ProcessType[ProcessType["Brazing"] = 70] = "Brazing";
    ProcessType[ProcessType["Casting"] = 80] = "Casting";
    ProcessType[ProcessType["Forging"] = 90] = "Forging";
})(ProcessType || (exports.ProcessType = ProcessType = {}));
var PrimaryProcessType;
(function (PrimaryProcessType) {
    PrimaryProcessType[PrimaryProcessType["SeamWelding"] = 88] = "SeamWelding";
    PrimaryProcessType[PrimaryProcessType["SpotWelding"] = 77] = "SpotWelding";
    PrimaryProcessType[PrimaryProcessType["MigWelding"] = 57] = "MigWelding";
    PrimaryProcessType[PrimaryProcessType["StickWelding"] = 78] = "StickWelding";
    PrimaryProcessType[PrimaryProcessType["TigWelding"] = 58] = "TigWelding";
    PrimaryProcessType[PrimaryProcessType["InjectionMoulding"] = 1] = "InjectionMoulding";
    PrimaryProcessType[PrimaryProcessType["SheetMetal"] = 2] = "SheetMetal";
    PrimaryProcessType[PrimaryProcessType["Machining"] = 3] = "Machining";
    PrimaryProcessType[PrimaryProcessType["Casting"] = 4] = "Casting";
    PrimaryProcessType[PrimaryProcessType["Forging"] = 5] = "Forging";
})(PrimaryProcessType || (exports.PrimaryProcessType = PrimaryProcessType = {}));
// ==================== MANUFACTURING CATEGORIES ====================
var ManufacturingCategory;
(function (ManufacturingCategory) {
    ManufacturingCategory[ManufacturingCategory["SheetMetalAndFabrication"] = 1] = "SheetMetalAndFabrication";
    ManufacturingCategory[ManufacturingCategory["PlasticInjectionMoulding"] = 2] = "PlasticInjectionMoulding";
    ManufacturingCategory[ManufacturingCategory["StockMachining"] = 3] = "StockMachining";
    ManufacturingCategory[ManufacturingCategory["CastingAndMachining"] = 4] = "CastingAndMachining";
    ManufacturingCategory[ManufacturingCategory["ForgingAndMachining"] = 5] = "ForgingAndMachining";
    ManufacturingCategory[ManufacturingCategory["MetalExtrusion"] = 6] = "MetalExtrusion";
    ManufacturingCategory[ManufacturingCategory["Composites"] = 7] = "Composites";
    ManufacturingCategory[ManufacturingCategory["Electronics"] = 8] = "Electronics";
    ManufacturingCategory[ManufacturingCategory["Packaging"] = 9] = "Packaging";
})(ManufacturingCategory || (exports.ManufacturingCategory = ManufacturingCategory = {}));
exports.ManufacturingCategoryNames = {
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
var PartComplexity;
(function (PartComplexity) {
    PartComplexity[PartComplexity["Low"] = 1] = "Low";
    PartComplexity[PartComplexity["Medium"] = 2] = "Medium";
    PartComplexity[PartComplexity["High"] = 3] = "High";
})(PartComplexity || (exports.PartComplexity = PartComplexity = {}));
exports.PartComplexityNames = {
    [PartComplexity.Low]: 'Low',
    [PartComplexity.Medium]: 'Medium',
    [PartComplexity.High]: 'High'
};
// ==================== MACHINE TYPES ====================
var MachineType;
(function (MachineType) {
    MachineType[MachineType["Automatic"] = 1] = "Automatic";
    MachineType[MachineType["SemiAuto"] = 2] = "SemiAuto";
    MachineType[MachineType["Manual"] = 3] = "Manual";
})(MachineType || (exports.MachineType = MachineType = {}));
// ==================== MATERIAL CATEGORIES ====================
var MaterialCategory;
(function (MaterialCategory) {
    MaterialCategory[MaterialCategory["Steel"] = 1] = "Steel";
    MaterialCategory[MaterialCategory["Aluminium"] = 2] = "Aluminium";
    MaterialCategory[MaterialCategory["StainlessSteel"] = 3] = "StainlessSteel";
    MaterialCategory[MaterialCategory["Copper"] = 4] = "Copper";
    MaterialCategory[MaterialCategory["Brass"] = 5] = "Brass";
    MaterialCategory[MaterialCategory["Plastic"] = 6] = "Plastic";
})(MaterialCategory || (exports.MaterialCategory = MaterialCategory = {}));
// ==================== STOCK FORMS ====================
var StockForm;
(function (StockForm) {
    StockForm[StockForm["Film"] = 1] = "Film";
    StockForm[StockForm["Membrane"] = 2] = "Membrane";
    StockForm[StockForm["Ingot"] = 3] = "Ingot";
    StockForm[StockForm["Sheet"] = 4] = "Sheet";
    StockForm[StockForm["CChannel"] = 5] = "CChannel";
    StockForm[StockForm["Wax"] = 6] = "Wax";
    StockForm[StockForm["Flat"] = 7] = "Flat";
    StockForm[StockForm["Ore"] = 8] = "Ore";
    StockForm[StockForm["Liquid"] = 9] = "Liquid";
    StockForm[StockForm["Foam"] = 10] = "Foam";
    StockForm[StockForm["Bar"] = 11] = "Bar";
    StockForm[StockForm["Pulp"] = 12] = "Pulp";
    StockForm[StockForm["Cardboard"] = 13] = "Cardboard";
    StockForm[StockForm["RectangularBar"] = 14] = "RectangularBar";
    StockForm[StockForm["Section"] = 15] = "Section";
    StockForm[StockForm["CustomExtrusion"] = 16] = "CustomExtrusion";
    StockForm[StockForm["Pallet"] = 17] = "Pallet";
    StockForm[StockForm["Fiber"] = 18] = "Fiber";
    StockForm[StockForm["Billet"] = 19] = "Billet";
    StockForm[StockForm["ExtrusionDrawnForms"] = 20] = "ExtrusionDrawnForms";
    StockForm[StockForm["Cord"] = 21] = "Cord";
    StockForm[StockForm["Wire"] = 22] = "Wire";
    StockForm[StockForm["Granules"] = 23] = "Granules";
    StockForm[StockForm["SquareBillet"] = 24] = "SquareBillet";
    StockForm[StockForm["Rod"] = 25] = "Rod";
    StockForm[StockForm["Sand"] = 26] = "Sand";
    StockForm[StockForm["HexBar"] = 27] = "HexBar";
    StockForm[StockForm["Oil"] = 28] = "Oil";
    StockForm[StockForm["Coil"] = 29] = "Coil";
    StockForm[StockForm["Paste"] = 30] = "Paste";
    StockForm[StockForm["Gas"] = 31] = "Gas";
    StockForm[StockForm["Yarn"] = 32] = "Yarn";
    StockForm[StockForm["Foil"] = 33] = "Foil";
    StockForm[StockForm["SquareTube"] = 34] = "SquareTube";
    StockForm[StockForm["Plank"] = 35] = "Plank";
    StockForm[StockForm["Stone"] = 36] = "Stone";
    StockForm[StockForm["Usteel"] = 37] = "Usteel";
    StockForm[StockForm["FoamTape"] = 38] = "FoamTape";
    StockForm[StockForm["Stock"] = 39] = "Stock";
    StockForm[StockForm["Dough"] = 40] = "Dough";
    StockForm[StockForm["Box"] = 41] = "Box";
    StockForm[StockForm["SeamlessTube"] = 42] = "SeamlessTube";
    StockForm[StockForm["RoundBar"] = 43] = "RoundBar";
    StockForm[StockForm["SquareBar"] = 44] = "SquareBar";
    StockForm[StockForm["Tube"] = 45] = "Tube";
    StockForm[StockForm["Thread"] = 46] = "Thread";
    StockForm[StockForm["Plate"] = 47] = "Plate";
    StockForm[StockForm["SquarePlate"] = 48] = "SquarePlate";
    StockForm[StockForm["Strip"] = 49] = "Strip";
    StockForm[StockForm["LAngle"] = 50] = "LAngle";
    StockForm[StockForm["Paper"] = 51] = "Paper";
    StockForm[StockForm["Roll"] = 52] = "Roll";
    StockForm[StockForm["SquarePipe"] = 53] = "SquarePipe";
    StockForm[StockForm["SerpentinePipe"] = 54] = "SerpentinePipe";
    StockForm[StockForm["Powder"] = 55] = "Powder";
    StockForm[StockForm["Pipe"] = 56] = "Pipe";
    StockForm[StockForm["Chips"] = 57] = "Chips";
})(StockForm || (exports.StockForm = StockForm = {}));
// ==================== TOOLING ENUMS ====================
var ToolingCountry;
(function (ToolingCountry) {
    ToolingCountry[ToolingCountry["India"] = 1] = "India";
    ToolingCountry[ToolingCountry["China"] = 2] = "China";
    ToolingCountry[ToolingCountry["Mexico"] = 4] = "Mexico";
    ToolingCountry[ToolingCountry["USA"] = 5] = "USA";
    ToolingCountry[ToolingCountry["Czech"] = 8] = "Czech";
    ToolingCountry[ToolingCountry["Taiwan"] = 23] = "Taiwan";
    ToolingCountry[ToolingCountry["SouthKorea"] = 22] = "SouthKorea";
})(ToolingCountry || (exports.ToolingCountry = ToolingCountry = {}));
var SheetMetalTool;
(function (SheetMetalTool) {
    SheetMetalTool[SheetMetalTool["FormingTool"] = 1] = "FormingTool";
    SheetMetalTool[SheetMetalTool["BendingTool"] = 2] = "BendingTool";
    SheetMetalTool[SheetMetalTool["CuttingTool"] = 3] = "CuttingTool";
    SheetMetalTool[SheetMetalTool["StampingTool"] = 4] = "StampingTool";
    SheetMetalTool[SheetMetalTool["BalnkAndPierce"] = 5] = "BalnkAndPierce";
    SheetMetalTool[SheetMetalTool["CompoundTool"] = 6] = "CompoundTool";
    SheetMetalTool[SheetMetalTool["ShallowDrawTool"] = 7] = "ShallowDrawTool";
    SheetMetalTool[SheetMetalTool["RedrawTool"] = 8] = "RedrawTool";
    SheetMetalTool[SheetMetalTool["TrimmingTool"] = 9] = "TrimmingTool";
})(SheetMetalTool || (exports.SheetMetalTool = SheetMetalTool = {}));
// ==================== CURRENCY & UNITS ====================
var CurrencyType;
(function (CurrencyType) {
    CurrencyType[CurrencyType["AUD"] = 1] = "AUD";
    CurrencyType[CurrencyType["BZR"] = 2] = "BZR";
    CurrencyType[CurrencyType["CAD"] = 3] = "CAD";
    CurrencyType[CurrencyType["CHF"] = 4] = "CHF";
    CurrencyType[CurrencyType["CNY"] = 5] = "CNY";
    CurrencyType[CurrencyType["EUR"] = 6] = "EUR";
    CurrencyType[CurrencyType["GBP"] = 7] = "GBP";
    CurrencyType[CurrencyType["HKD"] = 8] = "HKD";
    CurrencyType[CurrencyType["INR"] = 9] = "INR";
    CurrencyType[CurrencyType["JPY"] = 10] = "JPY";
    CurrencyType[CurrencyType["NZD"] = 11] = "NZD";
    CurrencyType[CurrencyType["SEK"] = 12] = "SEK";
    CurrencyType[CurrencyType["USD"] = 13] = "USD";
    CurrencyType[CurrencyType["ZAR"] = 14] = "ZAR";
})(CurrencyType || (exports.CurrencyType = CurrencyType = {}));
var UnitType;
(function (UnitType) {
    UnitType[UnitType["Imperial"] = 1] = "Imperial";
    UnitType[UnitType["Metric"] = 2] = "Metric";
})(UnitType || (exports.UnitType = UnitType = {}));
// ==================== WELD TYPES ====================
exports.WeldTypes = [
    { id: 1, name: 'Fillet Weld' },
    { id: 2, name: 'Lap Weld' },
    { id: 3, name: 'Butt Weld (Full Peneteration)' },
    { id: 4, name: 'Butt Weld (Partial Peneteration)' }
];
exports.WeldPositions = [
    { id: 1, name: 'Flat' },
    { id: 2, name: 'Horizontal' },
    { id: 3, name: 'Vertical' },
    { id: 4, name: 'OverHead' },
    { id: 6, name: 'Combination' }
];
// ==================== PROJECT STATUS ====================
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["Draft"] = 1] = "Draft";
    ProjectStatus[ProjectStatus["InProgress"] = 2] = "InProgress";
    ProjectStatus[ProjectStatus["PendingApproval"] = 3] = "PendingApproval";
    ProjectStatus[ProjectStatus["Approved"] = 4] = "Approved";
    ProjectStatus[ProjectStatus["Rejected"] = 5] = "Rejected";
    ProjectStatus[ProjectStatus["Completed"] = 6] = "Completed";
})(ProjectStatus || (exports.ProjectStatus = ProjectStatus = {}));
// ==================== INCOTERMS ====================
var Incoterms;
(function (Incoterms) {
    Incoterms[Incoterms["CFR"] = 1] = "CFR";
    Incoterms[Incoterms["CIF"] = 2] = "CIF";
    Incoterms[Incoterms["CIP"] = 3] = "CIP";
    Incoterms[Incoterms["CPT"] = 4] = "CPT";
    Incoterms[Incoterms["DAP"] = 5] = "DAP";
    Incoterms[Incoterms["DDP"] = 6] = "DDP";
    Incoterms[Incoterms["DPU"] = 7] = "DPU";
    Incoterms[Incoterms["EXW"] = 8] = "EXW";
    Incoterms[Incoterms["FAS"] = 9] = "FAS";
    Incoterms[Incoterms["FCA"] = 10] = "FCA";
    Incoterms[Incoterms["FOB"] = 11] = "FOB";
    Incoterms[Incoterms["NA"] = 12] = "NA";
})(Incoterms || (exports.Incoterms = Incoterms = {}));
// ==================== WELD TYPES (MIG Welding) ====================
var WeldType;
(function (WeldType) {
    WeldType[WeldType["Fillet"] = 1] = "Fillet";
    WeldType[WeldType["Square"] = 2] = "Square";
    WeldType[WeldType["Plug"] = 3] = "Plug";
    WeldType[WeldType["BevelFlareVGroove"] = 4] = "BevelFlareVGroove";
    WeldType[WeldType["UJGroove"] = 5] = "UJGroove";
})(WeldType || (exports.WeldType = WeldType = {}));
exports.WeldTypeNames = {
    [WeldType.Fillet]: 'Fillet',
    [WeldType.Square]: 'Square',
    [WeldType.Plug]: 'Plug',
    [WeldType.BevelFlareVGroove]: 'Bevel/Flare/ V Groove',
    [WeldType.UJGroove]: 'U/J Groove'
};
// ==================== WELD POSITIONS ====================
var WeldPosition;
(function (WeldPosition) {
    WeldPosition[WeldPosition["Flat"] = 1] = "Flat";
    WeldPosition[WeldPosition["Horizontal"] = 2] = "Horizontal";
    WeldPosition[WeldPosition["Vertical"] = 3] = "Vertical";
    WeldPosition[WeldPosition["Overhead"] = 4] = "Overhead";
    WeldPosition[WeldPosition["Combination"] = 6] = "Combination";
})(WeldPosition || (exports.WeldPosition = WeldPosition = {}));
exports.WeldPositionNames = {
    [WeldPosition.Flat]: 'Flat',
    [WeldPosition.Horizontal]: 'Horizontal',
    [WeldPosition.Vertical]: 'Vertical',
    [WeldPosition.Overhead]: 'OverHead',
    [WeldPosition.Combination]: 'Combination'
};
// ==================== WELD SIDES ====================
var WeldSide;
(function (WeldSide) {
    WeldSide[WeldSide["Single"] = 1] = "Single";
    WeldSide[WeldSide["Both"] = 2] = "Both";
})(WeldSide || (exports.WeldSide = WeldSide = {}));
exports.WeldSideNames = {
    [WeldSide.Single]: 'Single',
    [WeldSide.Both]: 'Both'
};
// ==================== GRIND FLUSH OPTIONS ====================
var GrindFlush;
(function (GrindFlush) {
    GrindFlush[GrindFlush["No"] = 0] = "No";
    GrindFlush[GrindFlush["Yes"] = 1] = "Yes";
})(GrindFlush || (exports.GrindFlush = GrindFlush = {}));
exports.GrindFlushNames = {
    [GrindFlush.No]: 'No',
    [GrindFlush.Yes]: 'Yes'
};
// ==================== SAMPLING PLAN ====================
var SamplingPlan;
(function (SamplingPlan) {
    SamplingPlan[SamplingPlan["Level1"] = 1] = "Level1";
    SamplingPlan[SamplingPlan["Level2"] = 2] = "Level2";
    SamplingPlan[SamplingPlan["Level3"] = 3] = "Level3";
})(SamplingPlan || (exports.SamplingPlan = SamplingPlan = {}));
exports.SamplingPlanNames = {
    [SamplingPlan.Level1]: 'Level1',
    [SamplingPlan.Level2]: 'Level2',
    [SamplingPlan.Level3]: 'Level3'
};
// ==================== WIRE DIAMETERS (mm) ====================
exports.WireDiameters = [0.8, 1.0, 1.2, 1.6, 2.0, 2.4, 3.2];
// ==================== DEFAULT VALUES ====================
exports.DefaultValues = {
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
exports.UILabels = {
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
