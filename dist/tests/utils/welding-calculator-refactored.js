"use strict";
/**
 * Welding Calculator - Refactored for Playwright Testing
 *
 * Purpose: Provide streamlined, test-friendly welding cost and cycle time calculations
 * Structure: Organized by calculation domains with clear separation of concerns
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManufacturingCalculator = exports.ProcessType = exports.PartComplexity = void 0;
exports.normalizeCycleTime = normalizeCycleTime;
exports.round = round;
exports.isValidNumber = isValidNumber;
exports.calculateMachineCost = calculateMachineCost;
exports.calculateLaborCost = calculateLaborCost;
exports.calculateSetupCost = calculateSetupCost;
exports.calculatePowerCost = calculatePowerCost;
exports.calculateInspectionCost = calculateInspectionCost;
exports.calculateYieldCost = calculateYieldCost;
exports.calculateTotalManufacturingCost = calculateTotalManufacturingCost;
exports.calculateArcOnTime = calculateArcOnTime;
exports.calculateArcOffTime = calculateArcOffTime;
exports.calculateSingleWeldCycleTime = calculateSingleWeldCycleTime;
exports.calculateWeldCycleTimeBreakdown = calculateWeldCycleTimeBreakdown;
exports.calculateTotalWeldCycleTime = calculateTotalWeldCycleTime;
exports.calculateManufacturingCO2 = calculateManufacturingCO2;
exports.getWireDiameter = getWireDiameter;
exports.calculateTotalWeldLength = calculateTotalWeldLength;
exports.calculateWeldVolume = calculateWeldVolume;
exports.calculateLotSize = calculateLotSize;
exports.calculateLifeTimeQtyRemaining = calculateLifeTimeQtyRemaining;
exports.calculateNetWeight = calculateNetWeight;
exports.getWeldTypeId = getWeldTypeId;
exports.getProcessType = getProcessType;
exports.logCostBreakdown = logCostBreakdown;
exports.logCycleTimeBreakdown = logCycleTimeBreakdown;
const LoggerUtil_1 = __importDefault(require("../lib/LoggerUtil"));
const logger = LoggerUtil_1.default;
// ============================================================================
// CONSTANTS & ENUMS
// ============================================================================
var PartComplexity;
(function (PartComplexity) {
    PartComplexity[PartComplexity["Low"] = 1] = "Low";
    PartComplexity[PartComplexity["Medium"] = 2] = "Medium";
    PartComplexity[PartComplexity["High"] = 3] = "High";
})(PartComplexity || (exports.PartComplexity = PartComplexity = {}));
var ProcessType;
(function (ProcessType) {
    ProcessType[ProcessType["WeldingPreparation"] = 36] = "WeldingPreparation";
    ProcessType[ProcessType["MigWelding"] = 39] = "MigWelding";
    ProcessType[ProcessType["TigWelding"] = 40] = "TigWelding";
    ProcessType[ProcessType["StickWelding"] = 41] = "StickWelding";
    ProcessType[ProcessType["WeldingCleaning"] = 42] = "WeldingCleaning";
    ProcessType[ProcessType["SpotWelding"] = 43] = "SpotWelding";
    ProcessType[ProcessType["SeamWelding"] = 44] = "SeamWelding";
})(ProcessType || (exports.ProcessType = ProcessType = {}));
// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
/**
 * Converts cycle time from tenths of seconds to seconds if needed
 */
function normalizeCycleTime(cycleTime) {
    if (cycleTime > 100) {
        return cycleTime / 10;
    }
    return cycleTime;
}
/**
 * Rounds a number to specified decimal places
 */
function round(value, decimals = 2) {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}
/**
 * Validates that a number is positive
 */
function isValidNumber(value) {
    return typeof value === 'number' && value > 0;
}
// ============================================================================
// COST CALCULATION FUNCTIONS
// ============================================================================
/**
 * Calculates direct machine cost per part
 * Formula: (Machine Hour Rate / 3600) * Cycle Time
 */
function calculateMachineCost(machineHourRate, cycleTime) {
    const normalizedCycleTime = normalizeCycleTime(cycleTime);
    return round((machineHourRate / 3600) * normalizedCycleTime, 4);
}
/**
 * Calculates direct labor cost per part
 * Formula: (Labor Rate / 3600) * Cycle Time * Number of Labors
 */
function calculateLaborCost(laborRate, cycleTime, noOfLabors = 1) {
    const normalizedCycleTime = normalizeCycleTime(cycleTime);
    return round((laborRate / 3600) * (normalizedCycleTime * noOfLabors), 4);
}
/**
 * Calculates setup cost per part
 * Formula: ((Setup Labor Rate + Machine Hour Rate) * Setup Time) / Lot Size
 */
function calculateSetupCost(setupLaborRate, machineHourRate, setupTimeMinutes, lotSize) {
    if (lotSize <= 0)
        return 0;
    const totalSetupRate = setupLaborRate + machineHourRate;
    return round((totalSetupRate * (setupTimeMinutes / 60)) / lotSize, 4);
}
/**
 * Calculates total power cost per part
 * Formula: (Cycle Time / 3600) * Power Consumption * Electricity Cost
 */
function calculatePowerCost(cycleTime, powerConsumptionKW, electricityUnitCost) {
    const normalizedCycleTime = normalizeCycleTime(cycleTime);
    return round((normalizedCycleTime / 3600) * powerConsumptionKW * electricityUnitCost, 4);
}
/**
 * Calculates QA inspection cost per part
 * Formula: (Sampling % / 100) * (Inspection Time / 60 minutes) * Inspector Rate
 */
function calculateInspectionCost(inspectionTimeMinutes, inspectorRate, samplingPercentage = 100) {
    return round((samplingPercentage / 100) * (inspectionTimeMinutes / 60) * inspectorRate, 4);
}
/**
 * Calculates yield cost per part
 * Formula: (1 - Yield % / 100) * Total Direct Cost
 */
function calculateYieldCost(yieldPercentage, totalDirectCost) {
    const yieldLoss = 1 - yieldPercentage / 100;
    return round(yieldLoss * totalDirectCost, 4);
}
/**
 * Calculates total manufacturing cost (all cost components)
 */
function calculateTotalManufacturingCost(machineHourRate, laborRate, setupLaborRate, setupTimeMinutes, cycleTime, powerConsumption, electricityUnitCost, inspectionTimeMinutes, inspectorRate, samplingPercentage, yieldPercentage, lotSize, noOfLabors = 1) {
    const machineCost = calculateMachineCost(machineHourRate, cycleTime);
    const laborCost = calculateLaborCost(laborRate, cycleTime, noOfLabors);
    const setupCost = calculateSetupCost(setupLaborRate, machineHourRate, setupTimeMinutes, lotSize);
    const powerCost = calculatePowerCost(cycleTime, powerConsumption, electricityUnitCost);
    const inspectionCost = calculateInspectionCost(inspectionTimeMinutes, inspectorRate, samplingPercentage);
    const directCosts = machineCost + laborCost + setupCost + powerCost + inspectionCost;
    const yieldCost = calculateYieldCost(yieldPercentage, directCosts);
    return {
        directMachineCost: machineCost,
        directLaborCost: laborCost,
        directSetUpCost: setupCost,
        totalPowerCost: powerCost,
        inspectionCost: inspectionCost,
        yieldCost: yieldCost,
        directProcessCost: directCosts + yieldCost
    };
}
// ============================================================================
// CYCLE TIME CALCULATION FUNCTIONS
// ============================================================================
/**
 * Calculates arc-on time (actual welding time)
 * Based on weld length and travel speed
 */
function calculateArcOnTime(totalWeldLength, travelSpeed = 5 // mm/sec
) {
    if (travelSpeed <= 0)
        return 0;
    return round(totalWeldLength / travelSpeed, 2);
}
/**
 * Calculates arc-off time (setup and cleanup between welds)
 */
function calculateArcOffTime(tackWelds = 0, intermediateStops = 0) {
    const tackWeldTime = tackWelds * 3; // 3 sec per tack weld
    const intermediateTime = intermediateStops * 2; // 2 sec per intermediate stop
    return round(tackWeldTime + intermediateTime, 2);
}
/**
 * Calculates single weld cycle time
 */
function calculateSingleWeldCycleTime(input) {
    const arcOnTime = calculateArcOnTime(input.totalWeldLength, input.travelSpeed || 5);
    const arcOffTime = calculateArcOffTime(input.tackWelds || 0, input.intermediateStops || 0);
    return round(arcOnTime + arcOffTime, 2);
}
/**
 * Calculates weld cycle time breakdown
 */
function calculateWeldCycleTimeBreakdown(input) {
    const totalSubProcessTime = input.subProcessCycleTimes.reduce((sum, t) => sum + t, 0);
    // Calculate total cycle time with efficiency factor
    const efficiencyFactor = 1 / (input.efficiency / 100);
    const cycleTime = round((totalSubProcessTime +
        input.loadingUnloadingTime +
        input.partReorientation) *
        efficiencyFactor, 2);
    return {
        arcOnTime: round(totalSubProcessTime * 0.8, 2), // Approximate arc-on portion
        arcOffTime: round(input.loadingUnloadingTime + input.partReorientation, 2),
        dryCycleTime: round(totalSubProcessTime +
            input.loadingUnloadingTime +
            input.partReorientation, 2),
        cycleTime: cycleTime
    };
}
/**
 * Calculates total weld cycle time from sub-processes
 */
function calculateTotalWeldCycleTime(subProcessCycleTimes, loadingUnloadingTime, partReorientation, efficiency) {
    const breakdown = calculateWeldCycleTimeBreakdown({
        subProcessCycleTimes,
        loadingUnloadingTime,
        partReorientation,
        efficiency
    });
    return breakdown.cycleTime;
}
// ============================================================================
// MANUFACTURING CO2 CALCULATION
// ============================================================================
/**
 * Calculates manufacturing CO2 emissions per part
 * Formula: (Cycle Time / 3600) * Power Consumption * CO2 per kWhr
 */
function calculateManufacturingCO2(cycleTimeSec, powerConsumptionKW, co2PerKwHr) {
    const normalizedCycleTime = normalizeCycleTime(cycleTimeSec);
    return round((normalizedCycleTime / 3600) * powerConsumptionKW * co2PerKwHr, 4);
}
// ============================================================================
// WELD CALCULATION FUNCTIONS
// ============================================================================
/**
 * Gets wire diameter based on material type and weld size
 */
function getWireDiameter(materialType, weldSize) {
    const wireDiameterMap = {
        'Carbon Steel': {
            1: 0.8,
            1.6: 0.8,
            3: 0.8,
            4: 1.2,
            5: 1.2,
            6: 1.2,
            8: 1.2
        },
        'Stainless Steel': {
            1: 0.8,
            1.6: 0.8,
            3: 1.0,
            4: 1.2,
            5: 1.2,
            6: 1.2,
            8: 1.2
        },
        Aluminum: {
            1: 1.2,
            1.6: 1.2,
            3: 1.2,
            4: 1.6,
            5: 1.6,
            6: 1.6,
            8: 2.0
        }
    };
    const materialKey = materialType || 'Carbon Steel';
    const sizeMap = wireDiameterMap[materialKey] || wireDiameterMap['Carbon Steel'];
    return sizeMap[weldSize] || 0.8;
}
/**
 * Calculates total weld length with multiplier for weld sides
 */
function calculateTotalWeldLength(weldLength, weldPlaces, weldSide) {
    const sideMultiplier = weldSide && weldSide.toLowerCase() === 'both sides' ? 2 : 1;
    return round(weldLength * weldPlaces * sideMultiplier, 2);
}
/**
 * Calculates weld volume for material weight estimation
 */
function calculateWeldVolume(weldType, weldSize, weldElementSize, weldLength, weldPlaces, noOfPasses, weldSide) {
    const totalLength = calculateTotalWeldLength(weldLength, weldPlaces, weldSide);
    // Volume = Cross-sectional area * Total length * Number of passes
    const crossSectionalArea = (weldElementSize * weldElementSize) / 2; // Approximate triangular area
    const volume = crossSectionalArea * totalLength * noOfPasses;
    return round(volume, 2);
}
// ============================================================================
// LOT SIZE & QUANTITY CALCULATIONS
// ============================================================================
/**
 * Calculates lot size based on annual volume
 */
function calculateLotSize(annualVolumeQty) {
    if (annualVolumeQty <= 0)
        return 1;
    if (annualVolumeQty <= 100)
        return 50;
    if (annualVolumeQty <= 500)
        return 100;
    if (annualVolumeQty <= 1000)
        return 250;
    if (annualVolumeQty <= 5000)
        return 500;
    return Math.min(Math.ceil(annualVolumeQty / 10), 5000);
}
/**
 * Calculates lifetime quantity remaining
 */
function calculateLifeTimeQtyRemaining(annualVolumeQty, productLifeYears) {
    const lifetimeQty = annualVolumeQty * productLifeYears;
    return Math.min(lifetimeQty, 100000000);
}
/**
 * Calculates net weight
 */
function calculateNetWeight(volumeMm3, density) {
    // Convert mm³ to cm³ and then to kg
    const volumeCm3 = volumeMm3 / 1000;
    const weightKg = (volumeCm3 * density) / 1000;
    return round(weightKg, 2);
}
// ============================================================================
// WELD TYPE & PROCESS HELPERS
// ============================================================================
/**
 * Gets weld type ID from string
 */
function getWeldTypeId(weldType) {
    if (typeof weldType === 'number')
        return weldType;
    const weldTypeMap = {
        Fillet: 1,
        Butt: 2,
        Slot: 3,
        Plug: 4,
        Spot: 5,
        Seam: 6,
        Back: 7,
        Surfacing: 8
    };
    return weldTypeMap[weldType] || 1; // Default to Fillet
}
/**
 * Gets process type from string
 */
function getProcessType(processTypeText) {
    const processTypeMap = {
        'Welding MIG': ProcessType.MigWelding,
        Welding: ProcessType.MigWelding,
        MIG: ProcessType.MigWelding,
        'MIG Welding': ProcessType.MigWelding,
        'Welding Cleaning': ProcessType.WeldingCleaning,
        Cleaning: ProcessType.WeldingCleaning,
        TIG: ProcessType.TigWelding,
        'TIG Welding': ProcessType.TigWelding,
        'Welding TIG': ProcessType.TigWelding,
        Stick: ProcessType.StickWelding,
        'Stick Welding': ProcessType.StickWelding
    };
    return processTypeMap[processTypeText] || ProcessType.MigWelding;
}
// ============================================================================
// LOGGING HELPERS (Test-friendly)
// ============================================================================
/**
 * Logs cost breakdown in a structured format
 */
function logCostBreakdown(costs, title = 'Cost Breakdown') {
    logger.info(`\n💰 ===== ${title} =====`);
    logger.info(`   Machine Cost:     $${costs.directMachineCost.toFixed(4)}`);
    logger.info(`   Labor Cost:       $${costs.directLaborCost.toFixed(4)}`);
    logger.info(`   Setup Cost:       $${costs.directSetUpCost.toFixed(4)}`);
    logger.info(`   Power Cost:       $${costs.totalPowerCost.toFixed(4)}`);
    logger.info(`   Inspection Cost:  $${costs.inspectionCost.toFixed(4)}`);
    logger.info(`   Yield Cost:       $${costs.yieldCost.toFixed(4)}`);
    logger.info(`   ─────────────────────────────`);
    logger.info(`   Total Cost:       $${costs.directProcessCost.toFixed(4)}`);
}
/**
 * Logs cycle time breakdown in a structured format
 */
function logCycleTimeBreakdown(breakdown, title = 'Cycle Time') {
    logger.info(`\n⏱️  ===== ${title} =====`);
    logger.info(`   Arc On Time:      ${breakdown.arcOnTime.toFixed(2)} sec`);
    logger.info(`   Arc Off Time:     ${breakdown.arcOffTime.toFixed(2)} sec`);
    logger.info(`   Dry Cycle Time:   ${breakdown.dryCycleTime.toFixed(2)} sec`);
    logger.info(`   Total Cycle Time: ${breakdown.cycleTime.toFixed(2)} sec`);
}
// ============================================================================
// BATCH CALCULATION CLASS (For complex scenarios)
// ============================================================================
/**
 * Advanced calculator for batch operations
 */
class ManufacturingCalculator {
    constructor(manufacturingInfo) {
        this.info = manufacturingInfo;
    }
    /**
     * Calculates all costs at once
     */
    calculateAllCosts() {
        return calculateTotalManufacturingCost(this.info.machineHourRate, this.info.directLaborRate, this.info.skilledLaborRatePerHour, this.info.setUpTime, this.info.cycleTime, this.info.powerConsumption, this.info.electricityUnitCost, this.info.inspectionTime, this.info.qaOfInspectorRate, this.info.samplingRate, this.info.yieldPer, 1, // Default lot size
        this.info.noOfDirectLabors || 1);
    }
    /**
     * Calculates manufacturing CO2
     */
    calculateCO2(co2PerKwHr) {
        return calculateManufacturingCO2(this.info.cycleTime, this.info.powerConsumption, co2PerKwHr);
    }
    /**
     * Logs all calculations
     */
    logAllCalculations() {
        const costs = this.calculateAllCosts();
        logCostBreakdown(costs, 'Manufacturing Costs');
    }
}
exports.ManufacturingCalculator = ManufacturingCalculator;
// ============================================================================
// EXPORT SUMMARY
// ============================================================================
exports.default = {
    // Enums
    PartComplexity,
    ProcessType,
    // Cost calculations
    calculateMachineCost,
    calculateLaborCost,
    calculateSetupCost,
    calculatePowerCost,
    calculateInspectionCost,
    calculateYieldCost,
    calculateTotalManufacturingCost,
    // Cycle time calculations
    calculateArcOnTime,
    calculateArcOffTime,
    calculateSingleWeldCycleTime,
    calculateWeldCycleTimeBreakdown,
    calculateTotalWeldCycleTime,
    // Manufacturing CO2
    calculateManufacturingCO2,
    // Weld calculations
    getWireDiameter,
    calculateTotalWeldLength,
    calculateWeldVolume,
    // Quantity calculations
    calculateLotSize,
    calculateLifeTimeQtyRemaining,
    calculateNetWeight,
    // Helpers
    getWeldTypeId,
    getProcessType,
    normalizeCycleTime,
    round,
    // Logging
    logCostBreakdown,
    logCycleTimeBreakdown,
    // Advanced
    ManufacturingCalculator
};
