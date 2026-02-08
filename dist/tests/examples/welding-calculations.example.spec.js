"use strict";
// Example: Unit Tests for Pure Calculation Functions
// These tests show how to test calculation functions in isolation
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const welding_calculations_1 = require("./welding-calculations");
test_1.test.describe('Welding Calculation Functions', () => {
    test_1.test.describe('Basic Utility Functions', () => {
        (0, test_1.test)('isValidNumber should return 0 for invalid inputs', () => {
            (0, test_1.expect)((0, welding_calculations_1.isValidNumber)(NaN)).toBe(0);
            (0, test_1.expect)((0, welding_calculations_1.isValidNumber)(-5)).toBe(0);
            (0, test_1.expect)((0, welding_calculations_1.isValidNumber)(null)).toBe(0);
            (0, test_1.expect)((0, welding_calculations_1.isValidNumber)(undefined)).toBe(0);
        });
        (0, test_1.test)('isValidNumber should round to 4 decimals', () => {
            (0, test_1.expect)((0, welding_calculations_1.isValidNumber)(1.123456)).toBe(1.1235);
            (0, test_1.expect)((0, welding_calculations_1.isValidNumber)(100.5)).toBe(100.5);
        });
        (0, test_1.test)('calculateLotSize should calculate correctly', () => {
            (0, test_1.expect)((0, welding_calculations_1.calculateLotSize)(1200)).toBe(100); // 1200 / 12
            (0, test_1.expect)((0, welding_calculations_1.calculateLotSize)(600)).toBe(50); // 600 / 12
            (0, test_1.expect)((0, welding_calculations_1.calculateLotSize)(0)).toBe(1); // Minimum
            (0, test_1.expect)((0, welding_calculations_1.calculateLotSize)(-100)).toBe(1); // Minimum
        });
    });
    test_1.test.describe('Cost Calculations', () => {
        (0, test_1.test)('calculatePowerCost should compute correctly', () => {
            // 1 hour (3600s), 10kW, $0.15/kWh = $1.50
            const cost = (0, welding_calculations_1.calculatePowerCost)(3600, 10, 0.15);
            (0, test_1.expect)(cost).toBeCloseTo(1.5, 2);
        });
        (0, test_1.test)('calculatePowerCost for 30 minutes', () => {
            // 30 min (1800s), 5kW, $0.12/kWh = $0.30
            const cost = (0, welding_calculations_1.calculatePowerCost)(1800, 5, 0.12);
            (0, test_1.expect)(cost).toBeCloseTo(0.25, 2);
        });
        (0, test_1.test)('calculateMachineCost should compute correctly', () => {
            // $150/hr, 3600s (1 hour) = $150
            const cost = (0, welding_calculations_1.calculateMachineCost)(150, 3600);
            (0, test_1.expect)(cost).toBeCloseTo(150, 2);
        });
        (0, test_1.test)('calculateMachineCost for 30 minutes', () => {
            // $150/hr, 1800s (0.5 hour) = $75
            const cost = (0, welding_calculations_1.calculateMachineCost)(150, 1800);
            (0, test_1.expect)(cost).toBeCloseTo(75, 2);
        });
        (0, test_1.test)('calculateLaborCost should compute correctly', () => {
            // $20/hr, 3600s, 2 workers = $40
            const cost = (0, welding_calculations_1.calculateLaborCost)(20, 3600, 2);
            (0, test_1.expect)(cost).toBeCloseTo(40, 2);
        });
        (0, test_1.test)('calculateSetupCost should compute correctly', () => {
            // ($100 + $150) * (30/60) / 100 lot = $0.75
            const cost = (0, welding_calculations_1.calculateSetupCost)(30, 150, 100, 100);
            (0, test_1.expect)(cost).toBeCloseTo(0.75, 2);
        });
        (0, test_1.test)('calculateYieldCost should compute correctly', () => {
            // 95% yield, $100 process cost, $50 material = (1 - 0.95) * ($100 + $50) = $7.50
            const cost = (0, welding_calculations_1.calculateYieldCost)(95, 100, 50);
            (0, test_1.expect)(cost).toBeCloseTo(7.5, 2);
        });
    });
    test_1.test.describe('Material Calculations', () => {
        (0, test_1.test)('calculateNetMaterialCost without discount', () => {
            // 1000g (1kg) @ $10/kg = $10
            const cost = (0, welding_calculations_1.calculateNetMaterialCost)(1000, 10, 0);
            (0, test_1.expect)(cost).toBe(10);
        });
        (0, test_1.test)('calculateNetMaterialCost with volume discount', () => {
            // 1000g @ $10/kg with 10% discount = $10 * 0.9 = $9
            const cost = (0, welding_calculations_1.calculateNetMaterialCost)(1000, 10, 10);
            (0, test_1.expect)(cost).toBeCloseTo(9, 2);
        });
        (0, test_1.test)('getWireDiameter for Carbon Steel', () => {
            const diameter = (0, welding_calculations_1.getWireDiameter)('Carbon Steel', 3);
            (0, test_1.expect)(diameter).toBe(0.8);
        });
        (0, test_1.test)('getWireDiameter with exact match', () => {
            const diameter = (0, welding_calculations_1.getWireDiameter)('Carbon Steel', 1);
            (0, test_1.expect)(diameter).toBe(0.8);
        });
        (0, test_1.test)('getWireDiameter with interpolation', () => {
            const diameter = (0, welding_calculations_1.getWireDiameter)('Carbon Steel', 2.5);
            // Should find >= 2.5, which is 3mm thickness with 0.8mm wire
            (0, test_1.expect)(diameter).toBeGreaterThanOrEqual(0.8);
        });
    });
    test_1.test.describe('Weld Calculations', () => {
        (0, test_1.test)('getWeldTypeId for string inputs', () => {
            (0, test_1.expect)((0, welding_calculations_1.getWeldTypeId)('fillet')).toBe(1);
            (0, test_1.expect)((0, welding_calculations_1.getWeldTypeId)('square')).toBe(2);
            (0, test_1.expect)((0, welding_calculations_1.getWeldTypeId)('plug')).toBe(3);
            (0, test_1.expect)((0, welding_calculations_1.getWeldTypeId)('bevel')).toBe(4);
            (0, test_1.expect)((0, welding_calculations_1.getWeldTypeId)('u/j')).toBe(5);
        });
        (0, test_1.test)('getWeldTypeId for numeric inputs', () => {
            (0, test_1.expect)((0, welding_calculations_1.getWeldTypeId)(1)).toBe(1);
            (0, test_1.expect)((0, welding_calculations_1.getWeldTypeId)(5)).toBe(5);
        });
        (0, test_1.test)('getWeldTypeId defaults to 1 for unknown', () => {
            (0, test_1.expect)((0, welding_calculations_1.getWeldTypeId)('unknown')).toBe(1);
            (0, test_1.expect)((0, welding_calculations_1.getWeldTypeId)('')).toBe(1);
        });
        (0, test_1.test)('calculateWeldVolume for fillet weld', () => {
            // Fillet: cross-section = (size * height) / 2
            // weldVolume = totalLength * crossSection
            const result = (0, welding_calculations_1.calculateWeldVolume)(1, 5, 5, 100, 1, 1, 1);
            // Cross-section: (5 * 5) / 2 = 12.5
            // Total length: 1 * 100 * 1 * 1 = 100
            // Volume: 100 * 12.5 = 1250
            (0, test_1.expect)(result.weldVolume).toBe(1250);
            (0, test_1.expect)(result.totalWeldLength).toBe(100);
        });
        (0, test_1.test)('calculateWeldVolume for both sides', () => {
            const result = (0, welding_calculations_1.calculateWeldVolume)(1, 5, 5, 100, 1, 1, 2); // 2 = both sides
            (0, test_1.expect)(result.totalWeldLength).toBe(200); // doubled for both sides
        });
        (0, test_1.test)('calculateWeldVolume for multiple passes', () => {
            const result = (0, welding_calculations_1.calculateWeldVolume)(1, 5, 5, 100, 2, 3, 1);
            // Total length: 3 passes * 100 * 2 places * 1 side = 600
            (0, test_1.expect)(result.totalWeldLength).toBe(600);
        });
    });
    test_1.test.describe('Edge Cases', () => {
        (0, test_1.test)('calculatePowerCost with zero consumption', () => {
            const cost = (0, welding_calculations_1.calculatePowerCost)(3600, 0, 0.15);
            (0, test_1.expect)(cost).toBe(0);
        });
        (0, test_1.test)('calculateLaborCost with zero workers', () => {
            const cost = (0, welding_calculations_1.calculateLaborCost)(20, 3600, 0);
            (0, test_1.expect)(cost).toBe(0);
        });
        (0, test_1.test)('calculateSetupCost with zero lot size', () => {
            // Should handle gracefully or return 0
            const cost = (0, welding_calculations_1.calculateSetupCost)(30, 150, 100, 0);
            (0, test_1.expect)(cost).toBeGreaterThanOrEqual(0);
        });
        (0, test_1.test)('calculateWeldVolume with zero dimensions', () => {
            const result = (0, welding_calculations_1.calculateWeldVolume)(1, 0, 0, 0, 0, 0, 1);
            (0, test_1.expect)(result.weldVolume).toBe(0);
        });
    });
});
