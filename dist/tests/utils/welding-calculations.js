"use strict";
// Pure calculation functions for welding operations
// Refactored for testability and Playwright integration
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidNumber = isValidNumber;
exports.getWireDiameter = getWireDiameter;
exports.calculateNetWeight = calculateNetWeight;
exports.calculateNetMaterialCost = calculateNetMaterialCost;
exports.calculateLotSize = calculateLotSize;
exports.calculatePowerConsumption = calculatePowerConsumption;
exports.calculatePowerCost = calculatePowerCost;
exports.calculateMachineCost = calculateMachineCost;
exports.calculateLaborCost = calculateLaborCost;
exports.calculateSetupCost = calculateSetupCost;
exports.calculateYieldCost = calculateYieldCost;
exports.getMaxNearestWeightLoss = getMaxNearestWeightLoss;
exports.getWeldTypeId = getWeldTypeId;
exports.getTotalWeldLength = getTotalWeldLength;
exports.getTotalWeldMaterialWeight = getTotalWeldMaterialWeight;
exports.getWeldBeadWeightWithWastage = getWeldBeadWeightWithWastage;
exports.normalizeEfficiency = normalizeEfficiency;
exports.calculateManufacturingCO2 = calculateManufacturingCO2;
exports.calculateLifeTimeQtyRemaining = calculateLifeTimeQtyRemaining;
exports.calculateInspectionCost = calculateInspectionCost;
exports.safeDiv = safeDiv;
exports.calculateWeldVolume = calculateWeldVolume;
exports.calculateTotalWeldLength = calculateTotalWeldLength;
const welding_enums_constants_1 = require("./welding-enums-constants");
/**
 * Validates and normalizes a number value
 * Returns 0 for invalid numbers
 */
function isValidNumber(n) {
    return !n || Number.isNaN(n) || !Number.isFinite(Number(n)) || n < 0
        ? 0
        : Number(Number(n).toFixed(4));
}
/**
 * Get wire diameter for a given material and weld size
 */
function getWireDiameter(materialType, weldSize) {
    const candidates = welding_enums_constants_1.MigWeldingData.filter(d => d.MaterialType === materialType);
    const exact = candidates.find(d => d.PlateThickness_mm === weldSize);
    if (exact)
        return exact.WireDiameter_mm;
    const thickness = Number(weldSize);
    const sorted = candidates.sort((a, b) => a.PlateThickness_mm - b.PlateThickness_mm);
    const ge = sorted.find(d => d.PlateThickness_mm >= thickness);
    if (ge)
        return ge.WireDiameter_mm;
    if (sorted.length > 0)
        return sorted[sorted.length - 1].WireDiameter_mm;
    return 0;
}
/**
 * Calculate net weight from volume and density
 */
function calculateNetWeight(partVolumeMm3, density // g/cm3
) {
    const volumeCm3 = partVolumeMm3 / 1000;
    return volumeCm3 * density;
}
/**
 * Calculate net material cost
 */
function calculateNetMaterialCost(weldBeadWeightWithWastage, materialPricePerKg, volumeDiscountPercentage = 0) {
    let netMatCost = (weldBeadWeightWithWastage / 1000) * materialPricePerKg;
    if (volumeDiscountPercentage > 0) {
        netMatCost = netMatCost * (1 - volumeDiscountPercentage / 100);
    }
    return isValidNumber(netMatCost);
}
/**
 * Calculate lot size from annual volume
 */
function calculateLotSize(annualVolumeQty) {
    if (!annualVolumeQty || annualVolumeQty <= 0) {
        return 1;
    }
    return Math.round(annualVolumeQty / 12);
}
/**
 * Calculate power consumption from current and voltage
 */
function calculatePowerConsumption(current, voltage) {
    return (current * voltage) / 1000;
}
/**
 * Calculate power cost
 */
function calculatePowerCost(cycleTimeSeconds, powerConsumptionKW, electricityUnitCost) {
    return isValidNumber((cycleTimeSeconds / 3600) * powerConsumptionKW * electricityUnitCost);
}
/**
 * Calculate machine cost
 */
function calculateMachineCost(machineHourRate, cycleTime // in seconds
) {
    return isValidNumber((machineHourRate / 3600) * cycleTime);
}
/**
 * Calculate labor cost
 */
function calculateLaborCost(laborHourRate, cycleTime, // in seconds
noOfLabors) {
    return isValidNumber((laborHourRate / 3600) * cycleTime * noOfLabors);
}
/**
 * Calculate setup cost
 */
function calculateSetupCost(setupTime, // in minutes
machineHourRate, laborHourRate, // skilled labor
lotSize) {
    return isValidNumber(((laborHourRate + machineHourRate) * (setupTime / 60)) / lotSize);
}
/**
 * Calculate yield cost
 */
function calculateYieldCost(yieldPercentage, processCostSum, // Machine + Setup + Labor + Inspection
materialCost) {
    return isValidNumber((1 - yieldPercentage / 100) * (materialCost + processCostSum));
}
/**
 * Get weight loss for material and wire diameter
 */
function getMaxNearestWeightLoss(materialType, wireDiameter) {
    const filtered = welding_enums_constants_1.WeldingWeightLossData.filter((item) => item.MaterialType === materialType && item.WireDiameter_mm >= wireDiameter).sort((a, b) => a.WireDiameter_mm - b.WireDiameter_mm);
    return filtered.length > 0 ? filtered[0].loss_g : 0;
}
/**
 * Get weld type ID from string or number
 */
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
/**
 * Calculate total weld length
 */
function getTotalWeldLength(weldLength, weldPlaces, weldSide, noOfPasses = 1) {
    let sideMultiplier = 1;
    if (typeof weldSide === 'string') {
        sideMultiplier = weldSide.toLowerCase() === 'both' ? 2 : 1;
    }
    else if (typeof weldSide === 'number') {
        sideMultiplier = weldSide === 2 ? 2 : 1;
    }
    return weldLength * weldPlaces * noOfPasses * sideMultiplier;
}
/**
 * Calculate total weld material weight
 */
function getTotalWeldMaterialWeight(partVolume, density) {
    return isValidNumber((partVolume * density) / 1000);
}
/**
 * Calculate weld bead weight with wastage
 */
function getWeldBeadWeightWithWastage(grossWeight, wastagePercentage) {
    const multiplier = 1 + wastagePercentage / 100;
    return isValidNumber(grossWeight * multiplier);
}
/**
 * Normalize efficiency to percentage (0-100)
 */
function normalizeEfficiency(efficiency) {
    if (!efficiency || efficiency < 0)
        return 75;
    return efficiency <= 1 ? efficiency * 100 : efficiency;
}
/**
 * Calculate manufacturing CO2
 */
function calculateManufacturingCO2(cycleTimeSeconds, powerConsumptionKW, co2PerKwHr) {
    return (cycleTimeSeconds / 3600) * powerConsumptionKW * co2PerKwHr;
}
/**
 * Calculate lifetime quantity remaining
 */
function calculateLifeTimeQtyRemaining(annualVolumeQty, productLifeRemaining) {
    if (!annualVolumeQty || annualVolumeQty <= 0)
        return 0;
    if (!productLifeRemaining || productLifeRemaining <= 0)
        return 0;
    const lifeTimeQty = annualVolumeQty * productLifeRemaining;
    return lifeTimeQty > 100000000 ? 100000000 : lifeTimeQty;
}
/**
 * Calculate inspection cost
 */
function calculateInspectionCost(inspectionTime, inspectorRate, samplingRate, lotSize, isSeamWelding) {
    if (isSeamWelding) {
        return isValidNumber((inspectionTime * inspectorRate) / (lotSize * (samplingRate / 100)));
    }
    else {
        return isValidNumber((samplingRate / 100) * ((inspectionTime * inspectorRate) / 3600));
    }
}
/**
 * Safe division helper
 */
function safeDiv(num, denom1, denom2) {
    if (!denom1 || !denom2)
        return 0;
    return isValidNumber(num / denom1 / denom2);
}
/**
 * Calculate weld volume based on parameters
 */
function calculateWeldVolume(weldType, weldSize, weldElementSize, weldLength, weldPlaces, weldPasses, weldSide) {
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
    if (weldSide === 'Both' || weldSide === 2) {
        sideMultiplier = 2;
    }
    else {
        sideMultiplier = 1;
    }
    const totalWeldLength = weldPasses * weldLength * weldPlaces * sideMultiplier;
    const weldVolume = totalWeldLength * weldCrossSection;
    return {
        totalWeldLength,
        weldVolume,
        weldMass: 0
    };
}
/**
 * Calculate total weld length from multiple welds
 */
function calculateTotalWeldLength(welds) {
    return welds.reduce((sum, weld) => sum + weld.totalWeldLength, 0);
}
