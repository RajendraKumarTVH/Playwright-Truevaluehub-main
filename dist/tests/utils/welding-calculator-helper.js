"use strict";
/**
 * Welding Calculator Helper Functions
 * Utility functions for welding calculations used in Playwright tests
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateMigWelding = calculateMigWelding;
exports.getWeldingEfficiency = getWeldingEfficiency;
exports.getDefaultYieldPercentage = getDefaultYieldPercentage;
exports.getDefaultSamplingRate = getDefaultSamplingRate;
exports.getDefaultInspectionTime = getDefaultInspectionTime;
exports.safeDiv = safeDiv;
exports.isValidNumber = isValidNumber;
/**
 * Calculate MIG welding parameters
 */
function calculateMigWelding(input) {
    const efficiency = input.efficiency || 80;
    const cycleTime = input.cycleTime || 0;
    // Direct Machine Cost: (Machine Hour Rate / 3600) * Cycle Time
    const directMachineCost = (input.machineHourRate / 3600) * cycleTime;
    // Direct Labor Cost: (Labor Rate / 3600) * Cycle Time * No of Labours
    const directLaborCost = (input.lowSkilledLaborRatePerHour / 3600) *
        cycleTime *
        input.noOfLowSkilledLabours;
    // Direct Setup Cost: ((Labor Rate + Machine Rate) * Setup Time / 60) / Lot Size
    const directSetUpCost = ((input.skilledLaborRatePerHour + input.machineHourRate) *
        (input.setUpTime / 60)) /
        input.lotSize;
    // Inspection Cost: (Sampling Rate / 100) * ((Inspection Time * QA Rate) / 3600)
    const inspectionTime = input.inspectionTime || 2;
    const samplingRate = input.samplingRate || 5;
    const inspectionCost = (samplingRate / 100) *
        ((inspectionTime * input.qaOfInspectorRate) / 3600);
    // Power Cost: (Cycle Time / 3600) * Power Consumption * Unit Cost
    const powerConsumption = input.powerConsumption ||
        ((input.requiredCurrent || 0) * (input.requiredWeldingVoltage || 0)) / 1000;
    const totalPowerCost = (cycleTime / 3600) *
        powerConsumption *
        (input.electricityUnitCost || 0);
    // Sum of direct costs
    const sum = directMachineCost + directSetUpCost + directLaborCost + inspectionCost;
    // Yield Cost: (1 - Yield% / 100) * (Material Cost + Sum)
    const yieldPer = input.yieldPer || 97;
    const yieldCost = (1 - yieldPer / 100) *
        ((input.netMaterialCost || 0) + sum);
    // Direct Process Cost: Sum + Yield Cost + Power Cost
    const directProcessCost = sum + yieldCost + totalPowerCost;
    return {
        cycleTime,
        efficiency,
        directLaborCost,
        directSetUpCost,
        inspectionCost,
        directMachineCost,
        totalPowerCost,
        yieldCost,
        directProcessCost,
        powerConsumption
    };
}
/**
 * Calculate welding efficiency based on position and machine type
 */
function getWeldingEfficiency(weldingPosition, semiAutoOrAuto, processType) {
    const positions = [
        { id: 1, name: 'Flat', auto: 80, manual: 70, semiAuto: 80 },
        { id: 2, name: 'Horizontal', auto: 80, manual: 70, semiAuto: 80 },
        { id: 3, name: 'Vertical', auto: 75, manual: 65, semiAuto: 75 },
        { id: 4, name: 'OverHead', auto: 75, manual: 65, semiAuto: 75 }
    ];
    const position = positions.find(p => p.id === weldingPosition);
    if (!position)
        return 75;
    if (semiAutoOrAuto === 1)
        return position.auto;
    if (semiAutoOrAuto === 3)
        return position.manual;
    return position.semiAuto;
}
/**
 * Calculate default yield percentage based on process and complexity
 */
function getDefaultYieldPercentage(processTypeID, partComplexity) {
    var _a;
    const defaults = {
        39: { 1: 97, 2: 95, 3: 93 }, // MIG Welding
        67: { 1: 98, 2: 96, 3: 94 }, // TIG Welding
        209: { 1: 97, 2: 95, 3: 93 }, // Stick Welding
        59: { 1: 97, 2: 95, 3: 93 }, // Spot Welding
        218: { 1: 97, 2: 95, 3: 93 } // Seam Welding
    };
    return ((_a = defaults[processTypeID]) === null || _a === void 0 ? void 0 : _a[partComplexity]) || 95;
}
/**
 * Calculate default sampling rate based on process and complexity
 */
function getDefaultSamplingRate(processTypeID, partComplexity) {
    var _a;
    const defaults = {
        39: { 1: 5, 2: 8, 3: 10 }, // MIG Welding
        67: { 1: 4, 2: 6, 3: 8 }, // TIG Welding
        209: { 1: 5, 2: 8, 3: 10 }, // Stick Welding
        59: { 1: 4, 2: 6, 3: 8 }, // Spot Welding
        218: { 1: 4, 2: 6, 3: 8 } // Seam Welding
    };
    return ((_a = defaults[processTypeID]) === null || _a === void 0 ? void 0 : _a[partComplexity]) || 5;
}
/**
 * Calculate inspection time based on part complexity
 */
function getDefaultInspectionTime(partComplexity) {
    if (partComplexity === 1)
        return 2; // Low
    if (partComplexity === 2)
        return 5; // Medium
    if (partComplexity === 3)
        return 10; // High
    return 2;
}
/**
 * Safe division utility
 */
function safeDiv(numerator, denominator) {
    if (!denominator || denominator === 0)
        return 0;
    return numerator / denominator;
}
/**
 * Validate and format number
 */
function isValidNumber(n) {
    if (n === null || n === undefined)
        return 0;
    const num = Number(n);
    if (Number.isNaN(num) || !Number.isFinite(num) || num < 0)
        return 0;
    return Number(num.toFixed(4));
}
