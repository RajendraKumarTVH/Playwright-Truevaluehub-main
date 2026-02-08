/**
 * Test Data Fixtures for Playwright Tests
 * Pre-defined sample data for common test scenarios
 */

import {
    PartDetails,
    SupplyTerms,
    MaterialInfo,
    LaborRateInfo,
    MachineMaster,
    MfgWeldSubProcess,
    WeldingInfo,
    WeldSubProcess,
    ToolingInfo
} from './interfaces';
import {
    ProcessType,
    PrimaryProcessType,
    PartComplexity,
    MachineType,
    ManufacturingCategory
} from './constants';

// ==================== PART DETAILS FIXTURES ====================
export const samplePartDetails: PartDetails = {
    internalPartNumber: 'TEST-PART-001',
    drawingNumber: 'DRW-001',
    revisionNumber: 'Rev A',
    partDescription: 'Sample Test Part',
    manufacturingCategory: 'Sheet Metal and Fabrication',
    bomQty: 1,
    annualVolume: 1000,
    lotSize: 100,
    productLife: 5,
    lifeTimeQtyRemaining: 5000,
    partComplexity: PartComplexity.Medium
};

export const sheetMetalPartDetails: PartDetails = {
    ...samplePartDetails,
    internalPartNumber: 'SM-BRACKET-001',
    partDescription: 'Sheet Metal Bracket',
    manufacturingCategory: 'Sheet Metal and Fabrication',
    annualVolume: 5000,
    lotSize: 250
};

export const injectionMouldingPartDetails: PartDetails = {
    ...samplePartDetails,
    internalPartNumber: 'IM-HOUSING-001',
    partDescription: 'Plastic Housing',
    manufacturingCategory: 'Plastic Injection Moulding',
    annualVolume: 50000,
    lotSize: 1000
};

// ==================== SUPPLY TERMS FIXTURES ====================
export const sampleSupplyTerms: SupplyTerms = {
    supplierName: 'Target Vendor - United States',
    manufacturingCity: 'New York',
    manufacturingCountry: 'USA',
    deliverySite: 'Main Plant - India',
    deliveryCity: 'Bengaluru',
    deliveryCountry: 'India'
};

export const usaSupplyTerms: SupplyTerms = {
    supplierName: 'US Manufacturing Co.',
    manufacturingCity: 'Detroit',
    manufacturingCountry: 'USA',
    deliverySite: 'US Assembly Plant',
    deliveryCity: 'Chicago',
    deliveryCountry: 'USA'
};

export const chinaSupplyTerms: SupplyTerms = {
    supplierName: 'China Parts Ltd.',
    manufacturingCity: 'Shenzhen',
    manufacturingCountry: 'China',
    deliverySite: 'Distribution Center',
    deliveryCity: 'Shanghai',
    deliveryCountry: 'China'
};

// ==================== MATERIAL INFO FIXTURES ====================
export const steelSheetMaterial: MaterialInfo = {
    materialType: 'Steel',
    materialSubType: 'Carbon Steel',
    materialGrade: 'AISI 1018',
    stockForm: 'Sheet',
    materialPrice: 2.5,
    density: 7.85,
    partThickness: 2.0
};

export const aluminumSheetMaterial: MaterialInfo = {
    materialType: 'Aluminium',
    materialSubType: 'Aluminium Alloy',
    materialGrade: '6061-T6',
    stockForm: 'Sheet',
    materialPrice: 4.5,
    density: 2.7,
    partThickness: 3.0
};

export const stainlessSteelMaterial: MaterialInfo = {
    materialType: 'Stainless Steel',
    materialSubType: 'Austenitic',
    materialGrade: '304',
    stockForm: 'Sheet',
    materialPrice: 5.0,
    density: 8.0,
    partThickness: 1.5
};

export const plasticMaterial: MaterialInfo = {
    materialType: 'Plastic',
    materialSubType: 'ABS',
    materialGrade: 'ABS Standard',
    stockForm: 'Granules',
    materialPrice: 3.0,
    density: 1.04
};

// ==================== WELDING INFO FIXTURES ====================
export const migWeldingInfo: WeldingInfo = {
    processTypeID: ProcessType.MigWelding,
    processName: 'MIG Welding',
    partComplexity: PartComplexity.Medium,
    weldType: 'Fillet Weld',
    weldPosition: 'Flat',
    weldLength: 500,
    weldLegSize: 4,
    noOfWeldPasses: 1,
    noOfTackWeld: 10,
    semiAutoOrAuto: MachineType.Manual,
    efficiency: 85,
    lotSize: 100,
    setUpTime: 30,
    electricityUnitCost: 0.12,
    yieldPer: 95
};

export const tigWeldingInfo: WeldingInfo = {
    processTypeID: ProcessType.TigWelding,
    processName: 'TIG Welding',
    partComplexity: PartComplexity.High,
    weldType: 'Butt Weld (Full Peneteration)',
    weldPosition: 'Horizontal',
    weldLength: 300,
    weldLegSize: 3,
    noOfWeldPasses: 2,
    semiAutoOrAuto: MachineType.Manual,
    efficiency: 80,
    lotSize: 50,
    setUpTime: 45,
    electricityUnitCost: 0.12,
    yieldPer: 96
};

export const spotWeldingInfo: WeldingInfo = {
    processTypeID: ProcessType.SpotWelding,
    processName: 'Spot Welding',
    partComplexity: PartComplexity.Low,
    noOfTackWeld: 20,
    noOfWeldPasses: 1,
    semiAutoOrAuto: MachineType.Automatic,
    efficiency: 90,
    lotSize: 500,
    setUpTime: 15,
    electricityUnitCost: 0.1,
    yieldPer: 97
};

// ==================== WELD SUB-PROCESS FIXTURES ====================
export const filletWeldSubProcess: WeldSubProcess = {
    weldType: 1, // Fillet
    noOfWelds: 4,
    totalWeldLength: 200,
    weldLegSize: 4,
    weldPosition: 1, // Flat
    noOfIntermediateStops: 2
};

export const buttWeldSubProcess: WeldSubProcess = {
    weldType: 3, // Butt Weld
    noOfWelds: 2,
    totalWeldLength: 150,
    weldLegSize: 6,
    weldPosition: 2, // Horizontal
    noOfIntermediateStops: 1
};

// ==================== LABOR RATE FIXTURES ====================
export const usaLaborRates: LaborRateInfo = {
    laborRateId: 1,
    countryId: 5, // USA
    powerCost: 0.12,
    laborLowSkilledCost: 25,
    laborMediumSkilledCost: 35,
    laborHighSkilledCost: 50,
    qaInspectorCost: 40
};

export const indiaLaborRates: LaborRateInfo = {
    laborRateId: 2,
    countryId: 9, // India
    powerCost: 0.08,
    laborLowSkilledCost: 5,
    laborMediumSkilledCost: 8,
    laborHighSkilledCost: 15,
    qaInspectorCost: 10
};

export const chinaLaborRates: LaborRateInfo = {
    laborRateId: 3,
    countryId: 5, // China
    powerCost: 0.09,
    laborLowSkilledCost: 8,
    laborMediumSkilledCost: 12,
    laborHighSkilledCost: 20,
    qaInspectorCost: 15
};

// ==================== MACHINE FIXTURES ====================
export const migWeldingMachine: MachineMaster = {
    machineId: 1,
    machineName: 'MIG Welder 350A',
    machineDescription: 'MIG Welding Machine 350 Amp',
    machineHourRate: 45,
    powerConsumption: 15,
    efficiency: 85
};

export const spotWeldingMachine: MachineMaster = {
    machineId: 2,
    machineName: 'Spot Welder Automatic',
    machineDescription: 'Automatic Spot Welding Machine',
    machineHourRate: 60,
    powerConsumption: 20,
    efficiency: 90
};

export const cncMachine: MachineMaster = {
    machineId: 3,
    machineName: 'CNC Milling Center',
    machineDescription: '3-Axis CNC Milling Machine',
    machineHourRate: 75,
    powerConsumption: 25,
    efficiency: 88
};

export const laserCuttingMachine: MachineMaster = {
    machineId: 4,
    machineName: 'Fiber Laser Cutter',
    machineDescription: '4kW Fiber Laser Cutting Machine',
    machineHourRate: 120,
    powerConsumption: 40,
    efficiency: 92
};

// ==================== TOOLING FIXTURES ====================
export const injectionMouldTool: ToolingInfo = {
    toolName: 'Injection Mould',
    toolingCountry: 'China',
    toolLife: '500000',
    shotsNeeded: 50000,
    numberOfCavities: 4,
    toolMaterialCost: 15000,
    toolManufacturingCost: 35000,
    totalToolCost: 50000
};

export const stampingDieTool: ToolingInfo = {
    toolName: 'Stamping Die',
    toolingCountry: 'India',
    toolLife: '1000000',
    shotsNeeded: 100000,
    dieStages: 3,
    dieSizeLength: 500,
    dieSizeWidth: 400,
    toolMaterialCost: 8000,
    toolManufacturingCost: 22000,
    totalToolCost: 30000
};

export const bendingTool: ToolingInfo = {
    toolName: 'Bending Tool',
    toolingCountry: 'USA',
    toolLife: '500000',
    dieStages: 1,
    dieSizeLength: 300,
    dieSizeWidth: 200,
    toolMaterialCost: 3000,
    toolManufacturingCost: 7000,
    totalToolCost: 10000
};

// ==================== COMPLETE PROJECT FIXTURES ====================
export const sampleSheetMetalProject = {
    partDetails: sheetMetalPartDetails,
    supplyTerms: sampleSupplyTerms,
    material: steelSheetMaterial,
    welding: migWeldingInfo,
    tooling: stampingDieTool,
    laborRates: usaLaborRates,
    machine: migWeldingMachine
};

export const sampleInjectionMouldingProject = {
    partDetails: injectionMouldingPartDetails,
    supplyTerms: chinaSupplyTerms,
    material: plasticMaterial,
    tooling: injectionMouldTool,
    laborRates: chinaLaborRates
};

// ==================== EXPECTED CALCULATION RESULTS ====================
export const expectedMigWeldingCosts = {
    directMachineCost: 0.15,
    directLaborCost: 0.73,
    directSetUpCost: 0.30,
    inspectionCost: 0.01,
    yieldCost: 3.06,
    directProcessCost: 4.28,
    tolerance: 0.1
};

export const expectedSpotWeldingCosts = {
    directMachineCost: 0.08,
    directLaborCost: 0.35,
    directSetUpCost: 0.15,
    inspectionCost: 0.005,
    yieldCost: 1.5,
    directProcessCost: 2.1,
    tolerance: 0.1
};

// ==================== MIG WELDING SPECIFIC FIXTURES ====================
/**
 * Based on UI Specification:
 * Project: TVH_21 14783
 * Part: 1023729-C-1023729-C 3
 */
export const migWeldingProjectFixture = {
    projectId: '14783',
    internalPartNumber: '1023729-C-1023729-C 3',
    manufacturingCategory: 'Sheet Metal and Fabrication',
    bomQty: 1,
    annualVolume: 950,
    lotSize: 79,
    productLifeRemaining: 5,
    lifeTimeQtyRemaining: 4750.
};

export const migWeldingSupplyTermsFixture = {
    supplierName: 'Target Vendor - United States',
    manufacturingCity: 'New York',
    manufacturingCountry: 'USA',
    deliverySite: 'Santino Steel - India - Bengaluru',
    deliveryCity: 'Bengaluru',
    deliveryCountry: 'India'
};

export const migWeldingMaterialFixture = {
    category: 'Ferrous',
    family: 'Carbon Steel',
    descriptionGrade: 'AISI 1050 | DIN CF53 | EN43C | SWRH52B/S50C',
    stockForm: 'Plate',
    scrapPrice: 0.3732,
    materialPrice: 3.08,
    volumePurchased: 0,
    volumeDiscount: 0,
    discountedMaterialPrice: 3.08
};

export const migWeldingPartDetailsFixture = {
    partEnvelopeLength: 27,
    partEnvelopeWidth: 20,
    partEnvelopeHeight: 5,
    netWeight: 5.6713,
    partSurfaceArea: 1166.6708,
    partVolume: 720.6173
};

export const migWeldingWeld1Fixture = {
    weldType: 'Fillet',
    weldSize: 6,
    wireDia: 1.2,
    weldElementSize: 6,
    noOfWeldPasses: 1,
    weldLength: 80,
    weldSide: 'Both',
    weldPlaces: 1,
    grindFlush: 'No',
    totalWeldLength: 0,
    weldVolume: 0
};

export const migWeldingWeld2Fixture = {
    weldType: 'Fillet',
    weldSize: 6,
    wireDia: 1.2,
    weldElementSize: 6,
    noOfWeldPasses: 1,
    weldLength: 30,
    weldSide: 'Single',
    weldPlaces: 1,
    grindFlush: 'No',
    totalWeldLength: 0,
    weldVolume: 0
};

export const migWeldingMaterialCostDetailsFixture = {
    totalWeldLength: 190,
    totalWeldMaterialWeight: 26.9154,
    efficiencyPercent: 75,
    weldBeadWeightWithWastage: 36.5972,
    netMaterialCost: 0.1127
};

export const migWeldingSustainabilityMaterialFixture = {
    co2PerKgMaterial: 13.7958,
    co2PerScrap: 13.7958,
    co2PerPart: 0.3713
};

export const migWeldingMachineDetailsFixture = {
    processGroup: 'Mig Welding',
    minCurrentRequired: 400,
    minWeldingVoltage: 35,
    selectedCurrent: 240,
    selectedVoltage: 0,
    machineName: 'MIG Welding (Manual) - C240',
    machineDescription: 'C240 (ESAB- 20A to 240A)',
    machineAutomation: 'Manual',
    samplingPlan: 'Level1',
    machineEfficiency: 70,
    netProcessCost: 2.1406
};

export const migWeldingCycleTimeDetailsFixture = {
    loadingUnloadingTime: 20,
    partReorientation: 0,
    totalWeldCycleTime: 95.2069
};

export const migWeldingSubProcess1Fixture = {
    weldType: 'Fillet',
    weldPosition: 'Flat',
    travelSpeed: 3.825,
    tackWelds: 1,
    intermediateStops: 2,
    weldCycleTime: 54.8301
};

export const migWeldingSubProcess2Fixture = {
    weldType: 'Fillet',
    weldPosition: 'Flat',
    travelSpeed: 3.825,
    tackWelds: 1,
    intermediateStops: 1,
    weldCycleTime: 15.8431
};

export const migWeldingManufacturingDetailsFixture = {
    samplingRate: 5,
    yieldPercentage: 97,
    yieldCostPerPart: 0.0635,
    directLaborRate: 42.7557,
    noOfDirectLabors: 1,
    laborCostPerPart: 1.6153,
    setupLaborRate: 34.1925,
    machineSetupTime: 30,
    setupCostPerPart: 0.2408,
    qaInspectorRate: 29.9182,
    qaInspectionTime: 2,
    qaInspectionCostPerPart: 0.0008,
    machineHourRate: 3.8548,
    cycleTimePerPart: 136.0098,
    machineCostPerPart: 0.1456,
    powerUnitCost: 0.141,
    powerConsumption: 14,
    totalPowerCost: 0.0746
};

export const migWeldingSustainabilityManufacturingFixture = {
    co2PerKwHr: 1.7317,
    co2PerPart: 0.0119
};

export const migWeldingCostSummaryFixture = {
    materialCost: 0.1127,
    materialCostPercent: 4.03,
    manufacturingCost: 2.1406,
    manufacturingCostPercent: 76.56,
    toolingCost: 0,
    toolingCostPercent: 0,
    overheadProfit: 0.5406,
    overheadProfitPercent: 19.34,
    packingCost: 0.0019,
    packingCostPercent: 0.07,
    exwPartCost: 2.7958,
    exwPartCostPercent: 100.00,
    freightCost: 0,
    freightCostPercent: 0,
    dutiesTariff: 0,
    dutiesTariffPercent: 0,
    partShouldCost: 2.7958,
    partShouldCostPercent: 100.00
};

export const migWeldingOpportunityFixture = {
    shouldCost: 2.7958,
    currentCost: 0,
    annualSpendShouldCost: 0,
    annualSpendCurrentCost: 0,
    unitOpportunity: 0,
    unitOpportunityPercent: 0,
    annualOpportunity: 0,
    lifetimeOpportunity: 0
};

export const migWeldingESGFixture = {
    totalPartESG: 0,
    annualESG: 0,
    lifetimeESG: 0
};

// ==================== COMPLETE MIG WELDING TEST DATA ====================
export const completeMigWeldingTestData = {
    project: migWeldingProjectFixture,
    supplyTerms: migWeldingSupplyTermsFixture,
    material: migWeldingMaterialFixture,
    partDetails: migWeldingPartDetailsFixture,
    weld1: migWeldingWeld1Fixture,
    weld2: migWeldingWeld2Fixture,
    materialCostDetails: migWeldingMaterialCostDetailsFixture,
    sustainabilityMaterial: migWeldingSustainabilityMaterialFixture,
    machineDetails: migWeldingMachineDetailsFixture,
    cycleTimeDetails: migWeldingCycleTimeDetailsFixture,
    subProcess1: migWeldingSubProcess1Fixture,
    subProcess2: migWeldingSubProcess2Fixture,
    manufacturingDetails: migWeldingManufacturingDetailsFixture,
    sustainabilityManufacturing: migWeldingSustainabilityManufacturingFixture,
    costSummary: migWeldingCostSummaryFixture,
    opportunity: migWeldingOpportunityFixture,
    esg: migWeldingESGFixture
};

// ==================== EXPECTED CALCULATION RESULTS ====================
export const expectedMigWeldingCalculations = {
    // Weld Element Size lookup based on Weld Size
    weldElementSizeLookup: (weldSize: number): number => {
        if (weldSize <= 3) return weldSize;
        if (weldSize <= 4.5) return 3;
        if (weldSize <= 5.5) return 4;
        if (weldSize <= 6) return 5;
        if (weldSize <= 12) return 6;
        return 8;
    },

    // Total Weld Length calculation
    totalWeldLength: (weldLength: number, weldSide: 'Single' | 'Both', weldPlaces: number): number => {
        const sideMultiplier = weldSide === 'Both' ? 2 : 1;
        return weldLength * sideMultiplier * weldPlaces;
    },

    // Tolerance for comparisons
    tolerance: 0.01
};

