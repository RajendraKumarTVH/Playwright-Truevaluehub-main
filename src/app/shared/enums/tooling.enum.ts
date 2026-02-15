export enum ToolingCountry {
  India = 1,
  China = 2,
  Mexico = 4,
  USA = 5,
  Czech = 8,
  Taiwan = 23,
  SouthKorea = 22,
}

export enum ToolingMaterialIM {
  CavityInsert = 1,
  CoreInsert = 2,
  CavityHoldingPlate = 3,
  CoreHoldingPlate = 4,
  CoreBackPlate = 5,
  CavitySideClampingPlate = 6,
  CoreSideClampingPlate = 7,
  EjectorPlate = 8,
  EjectorReturnerPlate = 9,
  ParallelBlock = 10,
  ManifoldPlate = 11,
  ElectrodeMaterialcost1 = 12, // copper
  ElectrodeMaterialcost2 = 13, // graphite
  SideCoreCost = 14,
  AngularCoreCost = 15,
  UnscrewingCost = 16,
  HotRunnerCost = 17,
  // MainGuidePinBush = 11,
  // EjectorGuidePinBush = 12,
  // MovingInsert = 13,
  // SprueBushLocatingRing = 14
}

export enum ToolingMaterialSheetMetal {
  DieBlock = 1,
  PunchBlock = 2,
  Die = 3, //Die insert
  Punch = 4, //Punches
  TopPlate = 5, //Top Clamping Plate
  TopPunchBackPlate = 6, //Punch back plate
  TopPunchHolderPlate = 7, //Punch Holder plate
  BottomPlate = 8, //Bottom Clamping plate
  BottomDieBackPlate = 9, //Die Back plate
  BottomDieHolderPlate = 10, //Die Holder plate
  StripperPlate = 11,
  KnockOutPlate = 12,
  GuidePillar = 13,
  GuideBush = 14,
}

export enum IMProcessGroup {
  MoldDesign = 1,
  MachineOperations = 2,
  Validation = 3,
  TextureCost = 4,
}

export enum SheetMetalProcessGroup {
  MoldDesign = 1,
  Programming = 2,
  MachineOperations = 3,
  MachinePlishing = 4,
  ToolHardening = 5,
  Assembly = 6,
  ToolTrialCost = 7,
  Validation = 8,
}

export enum InjectionMouldingTool {
  InjectionMoulding = 1,
}

export enum HPDCCastingTool {
  HPDC = 1,
  TrimmingDie = 2,
}

export enum SheetMetalTools {
  SheetMetalForming = 1,
  SheetMetalBending = 2,
  SheetMetalCutting = 3,
  SheetMetalStamping = 4,
  SheetMetalBalnkAndPierce = 5,
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
  TrimmingTool = 9,
}

export enum ToolingRefName {
  ToolDesignTime = 'ToolDesignTime',
  ProgrammingTime = 'ProgrammingTime',
  MachiningCost = 'MachiningCost',
  SkilledManualTime = 'SkilledManualTime',
  SemiSkilledManualTime = 'SemiSkilledManualTime',
  ToolPolishingTime = 'ToolPolishingTime',
}

export enum DefaultMaterialDesc {
  // S12311 = 'P20 | DIN 1.2311 | 40Cr2MnMoS8 | JIS SCM4  /  Billet',
  S12311 = 'P20 | DIN 1.2311 | 40Cr2MnMoS8 | JIS SCM4',
  // HDS = 'H13 | DIN 1.2344 | X40CrMoV5-1  /  Billet',
  HDS = 'H13 | DIN 1.2344 | X40CrMoV5-1',
  // MS = 'Cr12 | DIN 1.208 | X210C12 | SKD1  /  Billet',
  MS = 'Cr12 | DIN 1.208 | X210C12 | SKD1',
  // EN31 = 'AISI P20-Ni | DIN 1.2738 | JIS HPM1  /  Billet',
  EN31 = 'AISI P20-Ni | DIN 1.2738 | JIS HPM1',
  // MouldC45 = 'AISI 1045 | DIN C45 | EN43B | SWRH47B  /  Plate',
  MouldC45 = 'AISI 1045 | DIN C45 | EN43B | SWRH47B',
  C45 = 'AISI 1045 | DIN 1.1191 | CK44 | S45C  /  Billet',
  // P20 = 'AISI P20-Ni | DIN 1.2738 | JIS HPM1  /  Billet',
  SS = 'AISI 422 | DIN 1.2316 | X38CrMo16 | SUS 4201J2  /  Billet',
  ERS = 'ASTM A176 | DIN 1.2083 | SUS 420J2  /  Billet',
  // Copper = 'C11000 Electrolytic Tough Pitch (ETP) Copper',
  // Copper = 'C11000 Electrolytic Tough Pitch (ETP) Copper | ASTM B152 UNS C11000 / ',
  Copper = 'C11000 Electrolytic Tough Pitch (ETP) Copper | ASTM B152 UNS C11000',
  // Graphite = 'HK2 Graphite Electrode',
  // Graphite = 'HK2 Graphite Electrode | ISO 9001 / Bar',
  Graphite = 'HK2 Graphite Electrode | ISO 9001',
  // HCHCR = 'HCHCR D2 | AISI D2 | DIN 1.2379 / Round Bar',
  HCHCR = 'HCHCR D2 | AISI D2 | DIN 1.2379',
}

export enum StampingMaterialLookUpCatEnum {
  'DieInsertWidth' = 1,
  'DieInsertHeight' = 2,
  'PunchHeight' = 3,
  'DieBackPlate' = 4,
  'PunchBackPlate' = 5,
  'StripperPlate' = 6,
  'WireCuttingTerminationCoilLength' = 7,
}

export enum ConnectorAssemblyManufacturingLookUpCatEnum {
  MachineEfficiency = 1,
  YieldRate = 2,
  SetupTime = 3,
  StrokeRate = 4,
  WireCuttingTerminationSetUpTime = 5,
  WireCuttingTerminationStrokeRate = 6,
}
