"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_INSPECTION_TIME_BY_COMPLEXITY = exports.ProcessType = exports.PartComplexity = void 0;
exports.isValidCycleTime = isValidCycleTime;
exports.normalizeCycleTime = normalizeCycleTime;
exports.calculateMachineCost = calculateMachineCost;
exports.calculateLaborCost = calculateLaborCost;
exports.calculateSetupCost = calculateSetupCost;
exports.calculatePowerCost = calculatePowerCost;
exports.calculateInspectionCost = calculateInspectionCost;
exports.calculateYieldCost = calculateYieldCost;
exports.calculateAllCosts = calculateAllCosts;
exports.calculateArcOnTime = calculateArcOnTime;
exports.safeCycleTime = safeCycleTime;
exports.calculateArcOffTime = calculateArcOffTime;
exports.calculateSingleWeldCycleTime = calculateSingleWeldCycleTime;
exports.calculateDryCycleTime = calculateDryCycleTime;
exports.calculateOverallCycleTime = calculateOverallCycleTime;
exports.calculateCycleTimeBreakdown = calculateCycleTimeBreakdown;
exports.calculateTotalWeldLength = calculateTotalWeldLength;
exports.calculateWeldVolume = calculateWeldVolume;
exports.getWireDiameter = getWireDiameter;
exports.calculateManufacturingCO2 = calculateManufacturingCO2;
exports.calculateLotSize = calculateLotSize;
exports.calculateLifeTimeQtyRemaining = calculateLifeTimeQtyRemaining;
exports.calculateNetWeight = calculateNetWeight;
exports.getProcessType = getProcessType;
exports.getDefaultInspectionTime = getDefaultInspectionTime;
exports.round = round;
exports.generateCostReport = generateCostReport;
exports.generateCycleTimeReport = generateCycleTimeReport;
const LoggerUtil_1 = __importDefault(require("../lib/LoggerUtil"));
// Logger instantiation removed
// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================
var PartComplexity;
(function (PartComplexity) {
    PartComplexity[PartComplexity["Low"] = 1] = "Low";
    PartComplexity[PartComplexity["Medium"] = 2] = "Medium";
    PartComplexity[PartComplexity["High"] = 3] = "High";
})(PartComplexity || (exports.PartComplexity = PartComplexity = {}));
var ProcessType;
(function (ProcessType) {
    ProcessType[ProcessType["WeldingPreparation"] = 176] = "WeldingPreparation";
    ProcessType[ProcessType["MigWelding"] = 39] = "MigWelding";
    ProcessType[ProcessType["TigWelding"] = 67] = "TigWelding";
    ProcessType[ProcessType["StickWelding"] = 209] = "StickWelding";
    ProcessType[ProcessType["WeldingCleaning"] = 177] = "WeldingCleaning";
    ProcessType[ProcessType["SpotWelding"] = 59] = "SpotWelding";
    ProcessType[ProcessType["SeamWelding"] = 88] = "SeamWelding"; // Updated from 44 to 88
})(ProcessType || (exports.ProcessType = ProcessType = {}));
exports.DEFAULT_INSPECTION_TIME_BY_COMPLEXITY = {
    [PartComplexity.Low]: 2,
    [PartComplexity.Medium]: 5,
    [PartComplexity.High]: 10
};
// ============================================================================
// CYCLE TIME UTILITIES
// ============================================================================
function isValidCycleTime(cycleTime) {
    return cycleTime > 0 && cycleTime < 10000;
}
/**
 * Converts cycle time from tenths of seconds to seconds if needed
 */
function normalizeCycleTime(cycleTime) {
    // If the value is very large, it might be in tenths of seconds (common in some UI/backend outputs)
    if (cycleTime > 1000) {
        return cycleTime / 10;
    }
    return cycleTime;
}
function calculateMachineCost(machineHourRate, cycleTime) {
    const safeTime = safeCycleTime(cycleTime);
    const cost = (machineHourRate / 3600) * safeTime;
    LoggerUtil_1.default.debug(`[calculateMachineCost] Rate: $${machineHourRate}/hr, CycleTime: ${safeTime}s = $${cost.toFixed(4)}`);
    return cost;
}
function calculateLaborCost(laborRate, cycleTime, noOfLabors = 1) {
    const safeTime = safeCycleTime(cycleTime);
    const cost = (laborRate / 3600) * (safeTime * noOfLabors);
    LoggerUtil_1.default.debug(`[calculateLaborCost] Rate: $${laborRate}/hr, CycleTime: ${safeTime}s, Workers: ${noOfLabors} = $${cost.toFixed(4)}`);
    return cost;
}
function calculateSetupCost(setupLaborRate, machineHourRate, setupTimeMinutes, lotSize) {
    if (lotSize <= 0) {
        LoggerUtil_1.default.warn(`[calculateSetupCost] Invalid lot size: ${lotSize}, returning 0`);
        return 0;
    }
    const totalRate = setupLaborRate + machineHourRate;
    const setupCostTotal = totalRate * (setupTimeMinutes / 60);
    const costPerPart = setupCostTotal / lotSize;
    LoggerUtil_1.default.debug(`[calculateSetupCost] Setup Rate: $${totalRate}/hr, Time: ${setupTimeMinutes}min, Lot: ${lotSize} = $${costPerPart.toFixed(4)}`);
    return costPerPart;
}
function calculatePowerCost(cycleTime, powerConsumptionKW, electricityUnitCost) {
    const safeTime = safeCycleTime(cycleTime);
    const cost = (safeTime / 3600) * powerConsumptionKW * electricityUnitCost;
    LoggerUtil_1.default.debug(`[calculatePowerCost] CycleTime: ${safeTime}s, Power: ${powerConsumptionKW}kW, Rate: $${electricityUnitCost}/kWh = $${cost.toFixed(4)}`);
    return cost;
}
function calculateInspectionCost(params) {
    const safeTimeMin = Math.max(0, Number(params.inspectionTimeMinutes) || 0);
    const safeInspectors = Math.max(0, Number(params.numberOfInspectors) || 0);
    const safeRate = Math.max(0, Number(params.inspectorRate) || 0);
    const safeEfficiency = Math.max(1, Number(params.efficiency) || 100); // avoid divide by 0
    const safeLotSize = Math.max(1, Number(params.lotSize) || 1);
    const hours = safeTimeMin / 60;
    const cost = (hours * safeInspectors * safeRate) /
        safeEfficiency /
        safeLotSize;
    LoggerUtil_1.default.debug(`[calculateInspectionCost] Time=${safeTimeMin}min (${hours.toFixed(2)}h), Inspectors=${safeInspectors}, Rate=${safeRate}/hr, Efficiency=${safeEfficiency}, Lot=${safeLotSize} => Cost=${cost.toFixed(4)}`);
    return cost;
}
function calculateYieldCost(yieldPercentage, totalDirectCost) {
    const safeYield = Math.max(0, Math.min(Number(yieldPercentage) || 100, 100));
    const safeCost = Math.max(0, Number(totalDirectCost) || 0);
    const yieldFactor = safeYield / 100;
    const scrapFactor = 1 - yieldFactor;
    const cost = scrapFactor * safeCost;
    LoggerUtil_1.default.debug(`[calculateYieldCost] Yield: ${safeYield}%, Total Cost: $${safeCost.toFixed(4)} = $${cost.toFixed(4)}`);
    return cost;
}
function calculateAllCosts(input) {
    const noOfLabors = input.noOfLabors || 1;
    const machineCost = calculateMachineCost(input.machineHourRate, input.cycleTime);
    const laborCost = calculateLaborCost(input.laborRate, input.cycleTime, noOfLabors);
    const setupCost = calculateSetupCost(input.setupLaborRate, input.machineHourRate, input.setupTimeMinutes, input.lotSize);
    const powerCost = calculatePowerCost(input.cycleTime, input.powerConsumptionKW, input.electricityUnitCost);
    const inspectionCost = calculateInspectionCost({
        inspectionTimeMinutes: input.inspectionTimeMinutes,
        numberOfInspectors: input.numberOfInspectors || 1,
        inspectorRate: input.inspectorRate,
        efficiency: input.efficiency || 100,
        lotSize: input.lotSize,
        samplingPercentage: input.samplingPercentage
    });
    // Sum of variable costs (before yield adjustment)
    const variableCosts = machineCost + laborCost + setupCost + powerCost + inspectionCost;
    const yieldCost = calculateYieldCost(input.yieldPercentage, variableCosts);
    const totalCost = variableCosts + yieldCost;
    LoggerUtil_1.default.info(`\n💰 ===== Cost Summary =====`);
    LoggerUtil_1.default.info(`   Machine:     $${machineCost.toFixed(4)}`);
    LoggerUtil_1.default.info(`   Labor:       $${laborCost.toFixed(4)}`);
    LoggerUtil_1.default.info(`   Setup:       $${setupCost.toFixed(4)}`);
    LoggerUtil_1.default.info(`   Power:       $${powerCost.toFixed(4)}`);
    LoggerUtil_1.default.info(`   Inspection:  $${inspectionCost.toFixed(4)}`);
    LoggerUtil_1.default.info(`   Yield Loss:  $${yieldCost.toFixed(4)}`);
    LoggerUtil_1.default.info(`   ───────────────────────`);
    LoggerUtil_1.default.info(`   TOTAL:       $${totalCost.toFixed(4)}`);
    return {
        directMachineCost: machineCost,
        directLaborCost: laborCost,
        directSetUpCost: setupCost,
        totalPowerCost: powerCost,
        inspectionCost: inspectionCost,
        yieldCost: yieldCost,
        directProcessCost: totalCost
    };
}
// ============================================================================
// CYCLE TIME CALCULATION FUNCTIONS
// ============================================================================
function calculateArcOnTime(totalWeldLength, travelSpeed = 5) {
    if (travelSpeed <= 0) {
        LoggerUtil_1.default.warn(`[calculateArcOnTime] Invalid travel speed: ${travelSpeed}`);
        return 0;
    }
    const arcOnTime = totalWeldLength / travelSpeed;
    LoggerUtil_1.default.debug(`[calculateArcOnTime] Length: ${totalWeldLength}mm, Speed: ${travelSpeed}mm/sec = ${arcOnTime.toFixed(2)}s`);
    return arcOnTime;
}
function safeCycleTime(cycleTime, fallback = 0) {
    LoggerUtil_1.default.debug(`[safeCycleTime] Input: ${cycleTime}`);
    if (!Number.isFinite(cycleTime) || cycleTime <= 0) {
        LoggerUtil_1.default.warn(`[safeCycleTime] Invalid cycleTime: ${cycleTime}, using fallback`);
        return fallback;
    }
    return cycleTime;
}
function calculateArcOffTime(tackWelds = 0, intermediateStops = 0) {
    const tackTime = Math.max(0, tackWelds) * 3; // 3 sec per tack
    const stopTime = Math.max(0, intermediateStops) * 2; // 2 sec per stop
    const arcOffTime = tackTime + stopTime;
    LoggerUtil_1.default.debug(`[calculateArcOffTime] Tacks: ${tackWelds}×3s, Stops: ${intermediateStops}×2s = ${arcOffTime.toFixed(2)}s`);
    return arcOffTime;
}
function calculateSingleWeldCycleTime(input) {
    const arcOnTime = calculateArcOnTime(input.totalWeldLength, input.travelSpeed || 5);
    const arcOffTime = calculateArcOffTime(input.tackWelds || 0, input.intermediateStops || 0);
    // Base Process Overhead (Arc Start, etc.) - UI adds ~3s per weld start
    const processOverheadPerWeld = 3;
    const totalProcessOverhead = processOverheadPerWeld * (input.numberOfWelds || 1);
    let cycleTime = arcOnTime + arcOffTime + totalProcessOverhead;
    const typeId = getWeldTypeId(input.weldType || '');
    if (typeId === 4) {
        cycleTime *= 0.95;
    }
    else if (typeId === 5) {
        cycleTime *= 1.5;
    }
    LoggerUtil_1.default.debug(`[calculateSingleWeldCycleTime] Arc-On: ${arcOnTime.toFixed(2)}s + Arc-Off: ${arcOffTime.toFixed(2)}s + Overhead: ${totalProcessOverhead.toFixed(2)}s (Welds: ${input.numberOfWelds || 1}, TypeAdj: ${typeId}) = ${cycleTime.toFixed(2)}s`);
    return cycleTime;
}
function calculateDryCycleTime(subProcessCycleTimes, loadingUnloadingTime = 0, partReorientation = 0, noOfWeldPasses = 0) {
    const subProcessTotal = subProcessCycleTimes.reduce((s, t) => s + t, 0);
    const loadingTime = loadingUnloadingTime;
    const unloadingTime = loadingUnloadingTime;
    const arcOnTime = subProcessTotal + unloadingTime;
    const arcOffTime = arcOnTime * 0.05;
    return (noOfWeldPasses * loadingTime +
        arcOnTime +
        arcOffTime +
        partReorientation);
}
function calculateOverallCycleTime(dryCycleTime, efficiencyPercentage = 100) {
    const efficiencyFactor = Math.max(0.1, Math.min(efficiencyPercentage / 100, 1)); // Clamp to 10-100%
    const cycleTime = dryCycleTime / efficiencyFactor;
    LoggerUtil_1.default.debug(`[calculateOverallCycleTime] Dry: ${dryCycleTime.toFixed(2)}s, Efficiency: ${efficiencyPercentage}% = ${cycleTime.toFixed(2)}s`);
    return cycleTime;
}
function calculateCycleTimeBreakdown(input) {
    var _a, _b, _c, _d;
    const subProcessTotal = input.subProcessCycleTimes.reduce((a, b) => a + b, 0);
    const loadingUnloading = (_a = input.loadingUnloadingTime) !== null && _a !== void 0 ? _a : 0;
    const partReorientation = (_b = input.partReorientation) !== null && _b !== void 0 ? _b : 0;
    const noOfWeldPasses = (_c = input.noWeldPasses) !== null && _c !== void 0 ? _c : 0;
    // UI logic: loading and unloading are equal halves
    const loadingTime = loadingUnloading;
    const unloadingTime = loadingTime;
    // Arc-On includes unloading
    const arcOnTime = subProcessTotal + unloadingTime;
    // UI rule: Arc-Off = 5% of Arc-On
    const arcOffTime = arcOnTime * 0.05;
    const intermediateWeldClean = (_d = input.intermediateWeldClean) !== null && _d !== void 0 ? _d : 0;
    // Dry cycle
    const dryCycleTime = noOfWeldPasses * loadingTime +
        arcOnTime +
        arcOffTime +
        partReorientation +
        intermediateWeldClean;
    // Final cycle with efficiency
    const efficiencyFactor = Math.max(0.1, (input.efficiency || 100) / 100);
    const cycleTime = dryCycleTime / efficiencyFactor;
    LoggerUtil_1.default.debug(`[calculateCycleTimeBreakdown] Sub:${subProcessTotal.toFixed(2)} | ArcOn:${arcOnTime.toFixed(2)} | ArcOff:${arcOffTime.toFixed(2)} | Dry:${dryCycleTime.toFixed(2)} | Final:${cycleTime.toFixed(2)}`);
    return {
        subProcessTotal,
        arcOnTime,
        arcOffTime,
        dryCycleTime,
        cycleTime
    };
}
// ============================================================================
// WELD GEOMETRY CALCULATION FUNCTIONS
// ============================================================================
function calculateTotalWeldLength(weldLength, weldPlaces, weldSide = 'One Side') {
    const sideMultiplier = weldSide && weldSide.toLowerCase().includes('both') ? 2 : 1;
    const totalLength = weldLength * weldPlaces * sideMultiplier;
    LoggerUtil_1.default.debug(`[calculateTotalWeldLength] Length: ${weldLength}mm × Places: ${weldPlaces} × Sides: ${sideMultiplier} = ${totalLength.toFixed(2)}mm`);
    return totalLength;
}
function getWeldTypeId(weldType) {
    if (typeof weldType === 'number')
        return weldType;
    if (!weldType)
        return 1;
    const lowerType = weldType.toString().toLowerCase();
    if (lowerType.includes('fillet'))
        return 1;
    if (lowerType.includes('square'))
        return 2;
    if (lowerType.includes('plug'))
        return 3;
    if (lowerType.includes('bevel') || lowerType.includes('v groove'))
        return 4;
    if (lowerType.includes('u/j'))
        return 5;
    return 1;
}
function calculateWeldVolume(weldType, weldSize, weldElementSize, weldLength, weldPlaces, weldPasses = 1, weldSide = 'One Side') {
    const typeId = getWeldTypeId(weldType);
    let weldCrossSection = 0;
    const size = weldElementSize;
    const height = weldSize;
    if (typeId === 1 || typeId === 2) {
        weldCrossSection = (size * height) / 2;
    }
    else if (typeId === 3) {
        weldCrossSection = size * size + height;
    }
    else if (typeId === 4) {
        weldCrossSection = size * size + height / 2;
    }
    else {
        weldCrossSection = (size * height * 3) / 2;
    }
    let sideMultiplier = 1;
    if (weldSide === 2 ||
        (typeof weldSide === 'string' &&
            (weldSide.toLowerCase() === 'both' ||
                weldSide.toLowerCase().includes('both')))) {
        sideMultiplier = 2;
    }
    const totalWeldLength = weldPasses * weldLength * weldPlaces * sideMultiplier;
    const weldVolume = totalWeldLength * weldCrossSection;
    LoggerUtil_1.default.debug(`[calculateWeldVolume] Type: ${weldType}, Size: ${weldSize}, Length: ${weldLength}, Places: ${weldPlaces}, Passes: ${weldPasses}, Volume: ${weldVolume.toFixed(2)}`);
    return {
        totalWeldLength,
        weldVolume,
        weldMass: 0
    };
}
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
        Aluminum: { 1: 1.2, 1.6: 1.2, 3: 1.2, 4: 1.6, 5: 1.6, 6: 1.6, 8: 2.0 }
    };
    const material = materialType || 'Carbon Steel';
    const sizeMap = wireDiameterMap[material] || wireDiameterMap['Carbon Steel'];
    const diameter = sizeMap[weldSize] || 0.8;
    LoggerUtil_1.default.debug(`[getWireDiameter] Material: ${material}, Size: ${weldSize}mm = ${diameter}mm`);
    return diameter;
}
// ============================================================================
// MANUFACTURING CO2 CALCULATION
// ============================================================================
function calculateManufacturingCO2(cycleTimeSec, powerConsumptionKW, co2PerKwHr) {
    const safeTime = safeCycleTime(cycleTimeSec);
    const co2 = (safeTime / 3600) * powerConsumptionKW * co2PerKwHr;
    LoggerUtil_1.default.debug(`[calculateManufacturingCO2] Time: ${safeTime}s, Power: ${powerConsumptionKW}kW, CO2: ${co2PerKwHr}kg/kWh = ${co2.toFixed(4)}kg`);
    return co2;
}
// ============================================================================
// QUANTITY & WEIGHT CALCULATION FUNCTIONS
// ============================================================================
function calculateLotSize(annualVolumeQty) {
    if (annualVolumeQty <= 0)
        return 1;
    return Math.round(annualVolumeQty / 12);
}
function calculateLifeTimeQtyRemaining(annualVolumeQty, productLifeYears) {
    const lifetimeQty = annualVolumeQty * productLifeYears;
    return Math.min(lifetimeQty, 100000000);
}
function calculateNetWeight(volumeMm3, densityGCm3) {
    // Convert mm³ → cm³ → kg
    const volumeCm3 = volumeMm3 / 1000;
    const weightGrams = volumeCm3 * densityGCm3;
    //const weightKg = weightGrams / 1000
    LoggerUtil_1.default.debug(`[calculateNetWeight] Volume: ${volumeMm3}mm³, Density: ${densityGCm3}g/cm³ = ${weightGrams.toFixed(4)}g`);
    return weightGrams;
}
// ============================================================================
// HELPER & VALIDATION FUNCTIONS
// ============================================================================
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
    const processType = processTypeMap[processTypeText] || ProcessType.MigWelding;
    LoggerUtil_1.default.debug(`[getProcessType] Text: '${processTypeText}' = ProcessType ${processType}`);
    return processType;
}
function getDefaultInspectionTime(complexity) {
    const time = exports.DEFAULT_INSPECTION_TIME_BY_COMPLEXITY[complexity] || 5;
    LoggerUtil_1.default.debug(`[getDefaultInspectionTime] Complexity: ${complexity} = ${time} min`);
    return time;
}
function round(value, decimals = 2) {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}
// ============================================================================
// BATCH OPERATIONS & REPORTING
// ============================================================================
/**
 * Generates cost report for logging/debugging
 */
function generateCostReport(costs) {
    const lines = [
        '',
        '💰 ===== Manufacturing Cost Report =====',
        `Machine Cost:        $${costs.directMachineCost.toFixed(4)}`,
        `Labor Cost:          $${costs.directLaborCost.toFixed(4)}`,
        `Setup Cost:          $${costs.directSetUpCost.toFixed(4)}`,
        `Power Cost:          $${costs.totalPowerCost.toFixed(4)}`,
        `Inspection Cost:     $${costs.inspectionCost.toFixed(4)}`,
        `Yield/Scrap Loss:    $${costs.yieldCost.toFixed(4)}`,
        '─────────────────────────────',
        `TOTAL COST:          $${costs.directProcessCost.toFixed(4)}`,
        ''
    ];
    return lines.join('\n');
}
/**
 * Generates cycle time report for logging/debugging
 */
function generateCycleTimeReport(breakdown) {
    const lines = [
        '',
        '⏱️  ===== Cycle Time Breakdown =====',
        `Dry Cycle Time:      ${breakdown.dryCycleTime.toFixed(2)} sec`,
        `Overall Cycle Time:  ${breakdown.cycleTime.toFixed(2)} sec`,
        ''
    ];
    return lines.join('\n');
}
exports.default = {
    // Enums
    PartComplexity,
    ProcessType,
    isValidCycleTime,
    calculateMachineCost,
    calculateLaborCost,
    calculateSetupCost,
    calculatePowerCost,
    calculateInspectionCost,
    calculateYieldCost,
    calculateAllCosts,
    calculateArcOnTime,
    calculateArcOffTime,
    calculateSingleWeldCycleTime,
    calculateDryCycleTime,
    calculateOverallCycleTime,
    calculateCycleTimeBreakdown,
    // Manufacturing CO2
    calculateManufacturingCO2,
    // Weld geometry
    calculateTotalWeldLength,
    calculateWeldVolume,
    getWireDiameter,
    // Quantity & weight
    calculateLotSize,
    calculateLifeTimeQtyRemaining,
    calculateNetWeight,
    // Helpers
    getProcessType,
    getDefaultInspectionTime,
    round,
    // Reporting
    generateCostReport,
    generateCycleTimeReport
};
