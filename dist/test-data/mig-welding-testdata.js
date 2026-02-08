"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scenario6_SpecificManufacturing = exports.Scenario5_MultiPass = exports.Scenario4_HighVolume = exports.Scenario3_AutomaticMachine = exports.Scenario2_DifferentWeldConfig = exports.MigWeldingTestData = exports.DropdownOptions = exports.ExpectedValues = exports.ESG = exports.Opportunity = exports.CostSummary = exports.SustainabilityManufacturing = exports.ManufacturingDetails = exports.CycleTimeDetails = exports.MachineDetails = exports.ManufacturingInformation = exports.SustainabilityMaterial = exports.MaterialCostDetails = exports.testWeldData = exports.WeldingDetails = exports.PartDetails = exports.MaterialInformation = exports.SupplyTerms = exports.PartInformation = exports.ProjectData = exports.TestConfig = void 0;
exports.getWeldElementSize = getWeldElementSize;
exports.calculateTotalWeldLength = calculateTotalWeldLength;
exports.compareWithTolerance = compareWithTolerance;
exports.formatCurrency = formatCurrency;
exports.calculateMachineCost = calculateMachineCost;
exports.calculateLaborCost = calculateLaborCost;
exports.calculateSetupCost = calculateSetupCost;
const welding_calculator_1 = require("../tests/utils/welding-calculator");
const SustainabilityCalculator_1 = require("../tests/utils/SustainabilityCalculator");
// Re-export modular test data
__exportStar(require("./mig-welding/sustainability"), exports);
__exportStar(require("./mig-welding/scenarios"), exports);
__exportStar(require("./mig-welding/cost-breakdown"), exports);
// ==================== TEST CONFIGURATION ====================
exports.TestConfig = {
    baseUrl: 'https://qa.truevaluehub.com',
    defaultTimeout: 60000,
    retryCount: 2
};
// ==================== PROJECT DATA ====================
exports.ProjectData = {
    projectId: '15298',
    projectName: 'TVH_WeldCleaning',
    targetMonth: 'December 2025',
    createdBy: 'Rajendra Kumar',
    status: 'Costing'
};
// ==================== PART INFORMATION ====================
const annualVolumeQty = 950;
const productLifeRemaining = 5;
exports.PartInformation = {
    internalPartNumber: '1023729-C-1023729-C 3',
    drawingNumber: 'Enter Drawing value',
    revisionNumber: 'Enter Revision value',
    partDescription: 'Enter Part Description',
    manufacturingCategory: 'Assembly',
    bomQty: 1,
    annualVolumeQty,
    lotSize: 79,
    productLifeRemaining,
    lifeTimeQtyRemaining: 4750
};
// ==================== SUPPLY TERMS ====================
exports.SupplyTerms = {
    supplierName: 'Target Vendor -  United States',
    manufacturingCity: 'New York',
    manufacturingCountry: 'USA',
    deliverySiteName: 'Trinity - Dallas',
    deliveryCity: 'Dallas',
    deliveryCountry: 'USA'
};
// ==================== MATERIAL INFORMATION ====================
exports.MaterialInformation = {
    processGroup: 'Mig Welding',
    category: 'Ferrous',
    family: 'Carbon Steel',
    grade: 'AISI 1050 | DIN CF53 | EN43C | SWRH52B/S50C',
    stockForm: 'Plate',
};
// ==================== PART DETAILS ====================
exports.PartDetails = {
    partEnvelopeLength: 27,
    partEnvelopeWidth: 20,
    partEnvelopeHeight: 5,
    netWeight: 5.6713,
    partSurfaceArea: 1166.6708,
    partVolume: 720.6173
};
// ==================== WELDING DETAILS ====================
exports.WeldingDetails = {
    weld1: {
        weldType: 'Fillet',
        weldSize: 6,
        wireDia: 1.2,
        weldElementSize: 6,
        noOfWeldPasses: 1,
        weldLength: 200, // Derived from cycle time 65.2876 with speed 3.825
        weldSide: 'Both', // Assumption kept or generic
        weldPlaces: 1,
        grindFlush: 'No',
        totalWeldLength: 200,
        weldVolume: 7200
    },
    weld2: {
        weldType: 'Fillet',
        weldSize: 8, // Assumption
        wireDia: 1.2,
        weldElementSize: 8,
        noOfWeldPasses: 1,
        weldLength: 60, // Derived from cycle time 34.1438 with speed 3.825
        weldSide: 'Single',
        weldPlaces: 1,
        grindFlush: 'No',
        totalWeldLength: 60,
        weldVolume: 1920
    }
};
/** Consolidated weld data for page methods */
exports.testWeldData = {
    weld1: {
        weldType: exports.WeldingDetails.weld1.weldType,
        weldSize: exports.WeldingDetails.weld1.weldSize,
        weldLength: exports.WeldingDetails.weld1.weldLength,
        noOfPasses: exports.WeldingDetails.weld1.noOfWeldPasses,
        weldPlaces: exports.WeldingDetails.weld1.weldPlaces
    },
    weld2: {
        weldType: exports.WeldingDetails.weld2.weldType,
        weldSize: exports.WeldingDetails.weld2.weldSize,
        weldLength: exports.WeldingDetails.weld2.weldLength,
        noOfPasses: exports.WeldingDetails.weld2.noOfWeldPasses,
        weldPlaces: exports.WeldingDetails.weld2.weldPlaces
    }
};
// ==================== MATERIAL COST DETAILS ====================
exports.MaterialCostDetails = {
    totalWeldLength: 300,
    totalWeldMaterialWeight: 26.9154, // Keep existing or update if material info was provided
    efficiencyPercent: 70, // Matches 70% efficienty
    weldBeadWeightWithWastage: 36.5972,
    netMaterialCost: 0 // User didn't specify material cost, but Cost Summary implies existence?
};
// ==================== SUSTAINABILITY - MATERIAL ====================
// Base CO2 factors (input data)
const BaseCO2PerKg = 13.7958;
const BaseCO2PerScrap = 13.7958;
// Calculate material sustainability using SustainabilityCalculator
const materialSustainabilityCalc = SustainabilityCalculator_1.SustainabilityCalculator.calculateMaterialSustainability({
    esgImpactCO2Kg: BaseCO2PerKg,
    esgImpactCO2KgScrap: BaseCO2PerScrap,
    grossWeight: exports.MaterialCostDetails.weldBeadWeightWithWastage,
    scrapWeight: exports.MaterialCostDetails.weldBeadWeightWithWastage -
        exports.MaterialCostDetails.totalWeldMaterialWeight,
    netWeight: exports.MaterialCostDetails.totalWeldMaterialWeight,
    eav: exports.PartInformation.annualVolumeQty
});
exports.SustainabilityMaterial = {
    co2PerKgMaterial: BaseCO2PerKg,
    co2PerScrap: BaseCO2PerScrap,
    co2PerPart: Number(materialSustainabilityCalc.esgImpactCO2KgPart.toFixed(4))
};
// ==================== MANUFACTURING INFORMATION ====================
exports.ManufacturingInformation = {
    processType: 'Mig Welding',
    subProcessType: 'Manual',
    machineDetails: 'MIG Welding_400V_400A_Japan',
    machineDescription: 'PANASONIC_YD-400VP1YHD (30A-400A)',
    co2Kg: 0.0484, // Sub Total CO2
    cost: 2.9695 // Sub Total Cost
};
// ==================== MACHINE DETAILS ====================
exports.MachineDetails = {
    processGroup: 'Mig Welding',
    minCurrentRequired: 400,
    minWeldingVoltage: 35,
    selectedCurrent: 400,
    selectedVoltage: 400,
    machineName: 'MIG Welding_400V_400A_Japan',
    machineDescription: 'PANASONIC_YD-400VP1YHD (30A-400A)',
    machineAutomation: 'Manual',
    samplingPlan: 'Level1',
    machineEfficiency: 70,
    machineHourRate: 1.1905,
    netProcessCost: 2.6385,
    partComplexity: 'Medium'
};
// ==================== CYCLE TIME DETAILS ====================
exports.CycleTimeDetails = {
    loadingUnloadingTime: 20,
    partReorientation: 0,
    totalWeldCycleTime: 125.403
};
// ==================== SUB PROCESS DETAILS ====================
// ==================== MANUFACTURING DETAILS ====================
exports.ManufacturingDetails = {
    samplingRate: 5,
    yieldPercentage: 97,
    directLaborRate: 42.7557,
    noOfDirectLabors: 1,
    setupLaborRate: 34.1925,
    machineSetupTime: 30,
    qaInspectorRate: 29.9182,
    qaInspectionTime: 2,
    machineHourRate: 1.1905,
    powerConsumption: 14, // kW
    powerUnitCost: 0.141, // $ per kWh
    cycleTimePerPart: 179.1471
};
// ==================== SUSTAINABILITY - MANUFACTURING ====================
exports.SustainabilityManufacturing = {
    co2PerKwHr: 2.7708,
    co2PerPart: 0.0195,
    totalPowerCost: 0.0982
};
// ==================== COST SUMMARY ====================
exports.CostSummary = {
    materialCost: { amount: 0, percent: 0 },
    manufacturingCost: { amount: 2.9695, percent: 100 },
    toolingCost: { amount: 0, percent: 0 },
    overheadProfit: { amount: 0, percent: 0 },
    packingCost: { amount: 0, percent: 0 },
    exwPartCost: { amount: 2.9695, percent: 100 },
    freightCost: { amount: 0, percent: 0 },
    dutiesTariff: { amount: 0, percent: 0 },
    partShouldCost: { amount: 2.9695, percent: 100 }
};
// ==================== OPPORTUNITY ====================
exports.Opportunity = {
    shouldCost: 2.9695,
    currentCost: 0,
    annualSpend: { shouldCost: 0, currentCost: 0 },
    unitOpportunity: { amount: 0, percent: 0 },
    annualOpportunity: 0,
    lifetimeOpportunity: 0
};
// ==================== ESG ====================
exports.ESG = {
    totalPartESG: 0,
    annualESG: 0,
    lifetimeESG: 0
};
// ==================== EXPECTED VALUES FOR ASSERTIONS ====================
exports.ExpectedValues = {
    // Weld Element Size lookup table
    weldElementSizeLookup: [
        { maxWeldSize: 3, elementSize: 3 },
        { maxWeldSize: 4.5, elementSize: 3 },
        { maxWeldSize: 5.5, elementSize: 4 },
        { maxWeldSize: 6, elementSize: 5 },
        { maxWeldSize: 12, elementSize: 6 },
        { maxWeldSize: Infinity, elementSize: 8 }
    ],
    // Expected calculated values
    totalWeldLength: 190,
    totalCycleTime: 136.0098,
    totalNetProcessCost: 2.1406,
    totalShouldCost: 2.7958,
    // Tolerance for float comparisons
    tolerance: 0.01
};
// ==================== DROPDOWN OPTIONS ====================
exports.DropdownOptions = {
    weldTypes: [
        'Fillet',
        'Square',
        'Plug',
        'Bevel/Flare/ V Groove',
        'U/J Groove'
    ],
    weldSides: ['Single', 'Both'],
    weldPositions: [
        'Flat',
        'Horizontal',
        'Vertical',
        'OverHead',
        'Combination'
    ],
    grindFlush: ['No', 'Yes'],
    machineAutomation: ['Automatic', 'Semi-Auto', 'Manual'],
    samplingPlan: ['Level1', 'Level2', 'Level3'],
    manufacturingCategories: [
        'Sheet Metal and Fabrication',
        'Plastic Injection Moulding',
        'Stock Machining',
        'Casting and Machining',
        'Forging and Machining'
    ],
    partComplexity: ['Low', 'Medium', 'High']
};
// ==================== HELPER FUNCTIONS ====================
/**
 * Get weld element size based on weld size using lookup table
 * @param weldSize - The weld size in mm
 * @returns The corresponding weld element size
 */
function getWeldElementSize(weldSize) {
    // Handle weld sizes <= 3 (return the input value)
    if (weldSize <= 3)
        return weldSize;
    // Use lookup table for larger sizes
    for (const lookup of exports.ExpectedValues.weldElementSizeLookup) {
        if (weldSize <= lookup.maxWeldSize) {
            return lookup.elementSize;
        }
    }
    return 8;
}
function calculateTotalWeldLength(weldLength, weldSide, weldPlaces) {
    const sideMultiplier = weldSide === 'Both' ? 2 : 1;
    return weldLength * sideMultiplier * weldPlaces;
}
function compareWithTolerance(actual, expected, tolerance = exports.ExpectedValues.tolerance) {
    return Math.abs(actual - expected) <= tolerance;
}
function formatCurrency(amount, decimals = 4) {
    return `$${amount.toFixed(decimals)}`;
}
function calculateMachineCost(machineHourRate, cycleTimeSeconds) {
    return (machineHourRate / 3600) * cycleTimeSeconds;
}
function calculateLaborCost(laborRate, cycleTimeSeconds, numberOfLabors = 1) {
    return (laborRate / 3600) * cycleTimeSeconds * numberOfLabors;
}
function calculateSetupCost(laborRate, machineRate, setupTimeMinutes, lotSize) {
    return ((laborRate + machineRate) * (setupTimeMinutes / 60)) / lotSize;
}
// ==================== COMPLETE TEST DATA OBJECT ====================
exports.MigWeldingTestData = {
    config: exports.TestConfig,
    project: exports.ProjectData,
    partInformation: exports.PartInformation,
    supplyTerms: exports.SupplyTerms,
    materialInformation: exports.MaterialInformation,
    partDetails: exports.PartDetails,
    weldingDetails: exports.WeldingDetails,
    materialCostDetails: exports.MaterialCostDetails,
    sustainabilityMaterial: exports.SustainabilityMaterial,
    manufacturingInformation: exports.ManufacturingInformation,
    machineDetails: exports.MachineDetails,
    cycleTimeDetails: exports.CycleTimeDetails,
    manufacturingDetails: exports.ManufacturingDetails,
    sustainabilityManufacturing: exports.SustainabilityManufacturing,
    costSummary: exports.CostSummary,
    opportunity: exports.Opportunity,
    esg: exports.ESG,
    expectedValues: exports.ExpectedValues,
    dropdownOptions: exports.DropdownOptions
};
// ==================== ALTERNATE TEST SCENARIOS ====================
exports.Scenario2_DifferentWeldConfig = Object.assign(Object.assign({}, exports.MigWeldingTestData), { weldingDetails: {
        weld1: Object.assign(Object.assign({}, exports.WeldingDetails.weld1), { weldSize: 8, weldLength: 100, weldSide: 'Single' }),
        weld2: Object.assign(Object.assign({}, exports.WeldingDetails.weld2), { weldSize: 4, weldLength: 50, weldSide: 'Both' })
    } });
exports.Scenario3_AutomaticMachine = Object.assign(Object.assign({}, exports.MigWeldingTestData), { machineDetails: Object.assign(Object.assign({}, exports.MachineDetails), { machineAutomation: 'Automatic', machineEfficiency: 85 }) });
exports.Scenario4_HighVolume = Object.assign(Object.assign({}, exports.MigWeldingTestData), { partInformation: Object.assign(Object.assign({}, exports.PartInformation), { annualVolumeQty: 10000, lotSize: 500, lifeTimeQtyRemaining: 50000 }) });
exports.Scenario5_MultiPass = Object.assign(Object.assign({}, exports.MigWeldingTestData), { weldingDetails: {
        weld1: Object.assign(Object.assign({}, exports.WeldingDetails.weld1), { weldSize: 10, noOfWeldPasses: 3, weldLength: 150 }),
        weld2: Object.assign(Object.assign({}, exports.WeldingDetails.weld2), { weldSize: 8, noOfWeldPasses: 2, weldLength: 75 })
    } });
// ==================== NEW TEST SCENARIO ====================
exports.Scenario6_SpecificManufacturing = {
    samplingRate: 5,
    yieldPercentage: 97,
    yieldCostPerPart: 0.0028,
    directLaborRate: 2.5582,
    noOfDirectLabors: 1,
    laborCostPerPart: 0.0551,
    setupLaborRate: 1.8627,
    machineSetupTime: 30,
    setupCostPerPart: 0.0001,
    qaInspectorRate: 1.5845,
    qaInspectionTime: 2,
    qaInspectionCostPerPart: 0,
    machineHourRate: 1.5226,
    cycleTimePerPart: 77.5295,
    machineCostPerPart: 0.0328,
    powerUnitCost: 0.132,
    powerConsumption: 14,
    totalPowerCost: Number((0, welding_calculator_1.calculatePowerCost)(77.5295, 14, 0.132).toFixed(4)),
    co2PerKwHr: 14.9461,
    co2PerPart: Number((0, welding_calculator_1.calculateManufacturingCO2)(77.5295, 14, 14.9461).toFixed(4))
};
// Default export for easy importing
exports.default = exports.MigWeldingTestData;
