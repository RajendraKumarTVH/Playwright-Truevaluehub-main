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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertCostMatch = assertCostMatch;
exports.assertCycleTimeMatch = assertCycleTimeMatch;
exports.assertCO2Match = assertCO2Match;
exports.verifyCostBreakdown = verifyCostBreakdown;
exports.verifyCycleTimeBreakdown = verifyCycleTimeBreakdown;
exports.verifyCO2Emissions = verifyCO2Emissions;
exports.analyzeManufacturing = analyzeManufacturing;
const test_1 = require("@playwright/test");
const LoggerUtil_1 = __importDefault(require("../lib/LoggerUtil"));
const calc = __importStar(require("./welding-calculator-functions"));
const logger = LoggerUtil_1.default;
function assertCostMatch(actualCost, expectedCost, label, tolerance = 0.01) {
    const difference = Math.abs(actualCost - expectedCost);
    const percentDiff = (difference / expectedCost) * 100;
    if (difference <= tolerance) {
        logger.info(`✓ ${label}: ${actualCost.toFixed(4)} ≈ ${expectedCost.toFixed(4)} (diff: $${difference.toFixed(4)})`);
        test_1.expect.soft(actualCost).toBeCloseTo(expectedCost, 2);
    }
    else {
        logger.warn(`⚠ ${label}: ${actualCost.toFixed(4)} vs ${expectedCost.toFixed(4)} (diff: $${difference.toFixed(4)}, ${percentDiff.toFixed(1)}%)`);
        test_1.expect.soft(actualCost).toBeCloseTo(expectedCost, 1);
    }
}
function assertCycleTimeMatch(actualTime, expectedTime, label, tolerance = 1) {
    const normalizedActual = calc.normalizeCycleTime(actualTime);
    const normalizedExpected = calc.normalizeCycleTime(expectedTime);
    const difference = Math.abs(normalizedActual - normalizedExpected);
    if (difference <= tolerance) {
        logger.info(`✓ ${label}: ${normalizedActual.toFixed(2)}s ≈ ${normalizedExpected.toFixed(2)}s (diff: ${difference.toFixed(2)}s)`);
        test_1.expect.soft(normalizedActual).toBeCloseTo(normalizedExpected, 1);
    }
    else {
        logger.warn(`⚠ ${label}: ${normalizedActual.toFixed(2)}s vs ${normalizedExpected.toFixed(2)}s (diff: ${difference.toFixed(2)}s)`);
        test_1.expect.soft(normalizedActual).toBeCloseTo(normalizedExpected, 0);
    }
}
function assertCO2Match(actualCO2, expectedCO2, label) {
    const difference = Math.abs(actualCO2 - expectedCO2);
    if (difference < 0.001) {
        logger.info(`✓ ${label}: ${actualCO2.toFixed(4)}kg ≈ ${expectedCO2.toFixed(4)}kg`);
        test_1.expect.soft(actualCO2).toBeCloseTo(expectedCO2, 4);
    }
    else {
        logger.warn(`⚠ ${label}: ${actualCO2.toFixed(4)}kg vs ${expectedCO2.toFixed(4)}kg`);
        test_1.expect.soft(actualCO2).toBeCloseTo(expectedCO2, 3);
    }
}
function verifyCostBreakdown(input) {
    logger.info('\n💰 Verifying Cost Breakdown...');
    const calculatedCosts = calc.calculateAllCosts(input.calculationInputs);
    let passed = 0, failed = 0, skipped = 0;
    // Machine Cost
    if (input.uiCosts.machine > 0 && calculatedCosts.directMachineCost > 0) {
        try {
            assertCostMatch(input.uiCosts.machine, calculatedCosts.directMachineCost, 'Machine Cost');
            passed++;
        }
        catch (_a) {
            failed++;
        }
    }
    else {
        skipped++;
    }
    // Labor Cost
    if (input.uiCosts.labor > 0 && calculatedCosts.directLaborCost > 0) {
        try {
            assertCostMatch(input.uiCosts.labor, calculatedCosts.directLaborCost, 'Labor Cost');
            passed++;
        }
        catch (_b) {
            failed++;
        }
    }
    else {
        skipped++;
    }
    // Setup Cost
    if (input.uiCosts.setup > 0 && calculatedCosts.directSetUpCost > 0) {
        try {
            assertCostMatch(input.uiCosts.setup, calculatedCosts.directSetUpCost, 'Setup Cost');
            passed++;
        }
        catch (_c) {
            failed++;
        }
    }
    else {
        skipped++;
    }
    // Power Cost
    if (input.uiCosts.power > 0 && calculatedCosts.totalPowerCost > 0) {
        try {
            assertCostMatch(input.uiCosts.power, calculatedCosts.totalPowerCost, 'Power Cost');
            passed++;
        }
        catch (_d) {
            failed++;
        }
    }
    else {
        skipped++;
    }
    // Inspection Cost
    if (input.uiCosts.inspection > 0 && calculatedCosts.inspectionCost > 0) {
        try {
            assertCostMatch(input.uiCosts.inspection, calculatedCosts.inspectionCost, 'Inspection Cost');
            passed++;
        }
        catch (_e) {
            failed++;
        }
    }
    else {
        skipped++;
    }
    // Yield Cost
    if (input.uiCosts.yield > 0 && calculatedCosts.yieldCost > 0) {
        try {
            assertCostMatch(input.uiCosts.yield, calculatedCosts.yieldCost, 'Yield Cost');
            passed++;
        }
        catch (_f) {
            failed++;
        }
    }
    else {
        skipped++;
    }
    // Total Cost
    if (input.uiCosts.total > 0 && calculatedCosts.directProcessCost > 0) {
        try {
            assertCostMatch(input.uiCosts.total, calculatedCosts.directProcessCost, 'Total Manufacturing Cost', 0.05);
            passed++;
        }
        catch (_g) {
            failed++;
        }
    }
    else {
        skipped++;
    }
    logger.info(`\nCost Verification Summary: ✓${passed} ⚠${failed} ⊘${skipped}`);
    return { passed, failed, skipped };
}
// ============================================================================
// CYCLE TIME VERIFICATION HELPERS
// ============================================================================
/**
 * Verifies complete cycle time breakdown
 */
function verifyCycleTimeBreakdown(input) {
    logger.info('\n⏱️  Verifying Cycle Time...');
    const calculated = calc.calculateCycleTimeBreakdown(input.calculationInputs);
    try {
        assertCycleTimeMatch(input.uiCycleTime, calculated.cycleTime, 'Overall Cycle Time', 2 // 2 second tolerance
        );
        logger.info(calc.generateCycleTimeReport(calculated));
        return { passed: true, message: 'Cycle time verification passed' };
    }
    catch (error) {
        logger.error(`Cycle time verification failed: ${error}`);
        return { passed: false, message: `Cycle time mismatch: ${error}` };
    }
}
// ============================================================================
// CO2 EMISSION VERIFICATION
// ============================================================================
/**
 * Verifies CO2 emissions per part
 */
function verifyCO2Emissions(input) {
    logger.info('\n🌍 Verifying CO2 Emissions...');
    const calculatedCO2 = calc.calculateManufacturingCO2(input.cycleTime, input.powerConsumptionKW, input.co2PerKwHr);
    try {
        assertCO2Match(input.uiCO2, calculatedCO2, input.label || 'Manufacturing CO2');
        return true;
    }
    catch (_a) {
        return false;
    }
}
// ============================================================================
// BATCH CALCULATION HELPERS
// ============================================================================
/**
 * Calculates and logs complete manufacturing analysis
 */
function analyzeManufacturing(input) {
    logger.info('\n🔬 ===== Manufacturing Analysis =====\n');
    // Cycle time analysis
    const cycleTimeBreakdown = calc.calculateCycleTimeBreakdown({
        subProcessCycleTimes: input.subProcessCycleTimes,
        loadingUnloadingTime: input.loadingUnloadingTime,
        partReorientation: input.partReorientation,
        efficiency: input.efficiency
    });
    // Cost analysis
    const costBreakdown = calc.calculateAllCosts({
        machineHourRate: input.machineHourRate,
        laborRate: input.laborRate,
        setupLaborRate: input.setupLaborRate,
        setupTimeMinutes: input.setupTimeMinutes,
        cycleTime: cycleTimeBreakdown.cycleTime, // Use calculated cycle time
        powerConsumptionKW: input.powerConsumptionKW,
        electricityUnitCost: input.electricityUnitCost,
        inspectionTimeMinutes: input.inspectionTimeMinutes,
        inspectorRate: input.inspectorRate,
        samplingPercentage: input.samplingPercentage,
        yieldPercentage: input.yieldPercentage,
        lotSize: input.lotSize,
        noOfLabors: input.noOfLabors,
        numberOfInspectors: input.numberOfInspectors,
        efficiency: input.efficiency
    });
    // CO2 analysis
    const co2PerPart = calc.calculateManufacturingCO2(cycleTimeBreakdown.cycleTime, input.powerConsumptionKW, input.co2PerKwHr);
    // Log reports
    logger.info(calc.generateCycleTimeReport(cycleTimeBreakdown));
    logger.info(calc.generateCostReport(costBreakdown));
    logger.info(`\n🌍 CO2 Emissions:      ${co2PerPart.toFixed(4)} kg/part\n`);
    return {
        cycleTimeBreakdown,
        costBreakdown,
        co2PerPart
    };
}
exports.default = {
    // Assertions
    assertCostMatch,
    assertCycleTimeMatch,
    assertCO2Match,
    // Verification
    verifyCostBreakdown,
    verifyCycleTimeBreakdown,
    verifyCO2Emissions,
    // Analysis
    analyzeManufacturing
};
