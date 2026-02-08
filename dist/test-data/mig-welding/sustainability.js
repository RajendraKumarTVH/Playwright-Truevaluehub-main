"use strict";
/**
 * Sustainability Test Data for MIG Welding
 * This file contains sustainability-related constants and calculated values
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SustainabilityManufacturing = exports.SustainabilityMaterial = void 0;
exports.calculateMaterialSustainability = calculateMaterialSustainability;
exports.calculateManufacturingSustainability = calculateManufacturingSustainability;
const SustainabilityCalculator_1 = require("../../tests/utils/SustainabilityCalculator");
const welding_calculator_1 = require("../../tests/utils/welding-calculator");
// ==================== MATERIAL SUSTAINABILITY ====================
// Base input data (CO2 emission factors)
const MATERIAL_CO2_PER_KG = 13.7958;
const SCRAP_CO2_PER_KG = 13.7958;
// These will be calculated based on actual material weights when used in tests
// For now, providing base constants that can be used with SustainabilityCalculator
exports.SustainabilityMaterial = {
    co2PerKgMaterial: MATERIAL_CO2_PER_KG,
    co2PerScrap: SCRAP_CO2_PER_KG,
    co2PerPart: 0.3713 // This should be calculated in tests using actual weights
};
// ==================== MANUFACTURING SUSTAINABILITY ====================
// Base input data (CO2 emission factors for electricity)
const ELECTRICITY_CO2_PER_KWH = 1.7317;
// Sample calculation for manufacturing CO2 (77.5295s cycle time, 14kW power)
// This serves as a reference - actual values calculated dynamically in tests
const sampleCycleTime = 77.5295;
const samplePowerConsumption = 14;
const calculatedCO2 = Number((0, welding_calculator_1.calculateManufacturingCO2)(sampleCycleTime, samplePowerConsumption, ELECTRICITY_CO2_PER_KWH).toFixed(4));
exports.SustainabilityManufacturing = {
    co2PerKwHr: 2.7708,
    co2PerPart: 0.0195,
    totalPowerCost: 0.0982
};
/**
 * Helper function to calculate material sustainability dynamically
 * @param weights - Material weight data
 * @param eav - Annual volume
 * @returns Calculated sustainability metrics
 */
function calculateMaterialSustainability(weights) {
    return SustainabilityCalculator_1.SustainabilityCalculator.calculateMaterialSustainability(Object.assign({ esgImpactCO2Kg: MATERIAL_CO2_PER_KG, esgImpactCO2KgScrap: SCRAP_CO2_PER_KG }, weights));
}
/**
 * Helper function to calculate manufacturing sustainability dynamically
 * @param manufacturing - Manufacturing parameters
 * @param eav - Annual volume
 * @returns Calculated sustainability metrics
 */
function calculateManufacturingSustainability(manufacturing) {
    return SustainabilityCalculator_1.SustainabilityCalculator.calculateManufacturingSustainability({
        powerUnitCostPerKWh: 0.132, // Default electricity cost
        powerConsumptionKWh: (manufacturing.totalPowerKW * (manufacturing.cycleTime / 3600)),
        co2PerKWh: ELECTRICITY_CO2_PER_KWH,
        eav: manufacturing.eav
    });
}
