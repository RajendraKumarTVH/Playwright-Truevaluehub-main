"use strict";
/**
 * Quick Reference: Using Weld Cycle Time Calculator Functions
 *
 * This file provides usage examples for the weld cycle time calculation functions
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.example5_MultipleWeldsWithVerification = example5_MultipleWeldsWithVerification;
exports.example6_IntegrationWithPageObject = example6_IntegrationWithPageObject;
exports.completeWorkflowExample = completeWorkflowExample;
const test_1 = require("@playwright/test");
const welding_calculator_1 = require("./welding-calculator");
/* ========================================
 * EXAMPLE 1: Calculate Single Weld Cycle Time
 * ======================================== */
function example1_SingleWeldCycleTime() {
    const weldInput = {
        totalWeldLength: 160, // Total weld length in mm
        travelSpeed: 3.825, // Travel speed in mm/s
        tackWelds: 1, // Number of tack welds
        intermediateStops: 2 // Number of intermediate start/stops
    };
    const cycleTime = (0, welding_calculator_1.calculateSingleWeldCycleTime)(weldInput);
    console.log(`Single Weld Cycle Time: ${cycleTime.toFixed(4)} seconds`);
    // Output: 54.8301 seconds
}
/* ========================================
 * EXAMPLE 2: Calculate Total Weld Cycle Time with Efficiency
 * ======================================== */
function example2_TotalWeldCycleTimeWithEfficiency() {
    const totalInput = {
        subProcessCycleTimes: [54.8301, 15.8431], // Array of individual weld cycle times
        loadingUnloadingTime: 20, // Loading + Unloading time in seconds
        partReorientation: 0, // Number of part reorientations
        efficiency: 70 // Efficiency percentage (e.g., 70%)
    };
    const totalCycleTime = (0, welding_calculator_1.calculateTotalWeldCycleTime)(totalInput);
    console.log(`Total Weld Cycle Time (with efficiency): ${totalCycleTime.toFixed(4)} seconds`);
    // Output: 136.0098 seconds (if efficiency is 70%)
}
/* ========================================
 * EXAMPLE 3: Calculate Dry Weld Cycle Time (without efficiency)
 * ======================================== */
function example3_DryWeldCycleTime() {
    const dryInput = {
        subProcessCycleTimes: [54.8301, 15.8431], // Array of individual weld cycle times
        loadingUnloadingTime: 20, // Loading + Unloading time in seconds
        partReorientation: 0, // Number of part reorientations
        efficiency: 75 // Not used in dry calculation
    };
    const dryCycleTime = (0, welding_calculator_1.calculateDryWeldCycleTime)(dryInput);
    console.log(`Dry Weld Cycle Time: ${dryCycleTime.toFixed(4)} seconds`);
    // Output: 95.2069 seconds
}
/* ========================================
 * EXAMPLE 4: Calculate Arc Times
 * ======================================== */
function example4_ArcTimes() {
    const totalWeldCycleTime = 70.6732; // Sum of subprocess cycle times
    const loadingUnloadingTime = 20;
    const arcOnTime = (0, welding_calculator_1.calculateArcOnTime)(totalWeldCycleTime, loadingUnloadingTime);
    const arcOffTime = (0, welding_calculator_1.calculateArcOffTime)(arcOnTime);
    console.log(`Arc On Time: ${arcOnTime.toFixed(4)} seconds`);
    // Output: 90.6732 seconds
    console.log(`Arc Off Time: ${arcOffTime.toFixed(4)} seconds`);
    // Output: 4.5337 seconds (5% of arc on time)
}
/* ========================================
 * EXAMPLE 5: Calculate Multiple Welds and Verify
 * ======================================== */
function example5_MultipleWeldsWithVerification() {
    // Weld 1
    const weld1 = (0, welding_calculator_1.calculateSingleWeldCycleTime)({
        totalWeldLength: 160,
        travelSpeed: 3.825,
        tackWelds: 1,
        intermediateStops: 2
    });
    // Weld 2
    const weld2 = (0, welding_calculator_1.calculateSingleWeldCycleTime)({
        totalWeldLength: 30,
        travelSpeed: 3.825,
        tackWelds: 1,
        intermediateStops: 1
    });
    // Total
    const total = (0, welding_calculator_1.calculateDryWeldCycleTime)({
        subProcessCycleTimes: [weld1, weld2],
        loadingUnloadingTime: 20,
        partReorientation: 0,
        efficiency: 75
    });
    console.log('\n=== Multiple Welds Calculation ===');
    console.log(`Weld 1 Cycle Time: ${weld1.toFixed(4)} sec`);
    console.log(`Weld 2 Cycle Time: ${weld2.toFixed(4)} sec`);
    console.log(`Total Cycle Time: ${total.toFixed(4)} sec`);
    // Verify against expected values
    (0, test_1.expect)(weld1).toBeCloseTo(54.8301, 2);
    (0, test_1.expect)(weld2).toBeCloseTo(15.8431, 2);
    (0, test_1.expect)(total).toBeCloseTo(95.2069, 2);
}
/* ========================================
 * EXAMPLE 6: Integration with Page Object Data
 * ======================================== */
function example6_IntegrationWithPageObject(page) {
    return __awaiter(this, void 0, void 0, function* () {
        // Assume we've scraped weld data from the UI
        const weldData = {
            weldLength: yield page.weldLengthInput.inputValue(),
            weldSide: yield page.weldSideDropdown.textContent(),
            weldPlaces: yield page.weldPlacesInput.inputValue(),
            travelSpeed: yield page.travelSpeedInput.inputValue(),
            tackWelds: yield page.tackWeldsInput.inputValue(),
            intermediateStops: yield page.intermediateStopsInput.inputValue()
        };
        // Calculate total weld length
        const sideMultiplier = weldData.weldSide === 'Both' ? 2 : 1;
        const totalWeldLength = Number(weldData.weldLength) * sideMultiplier * Number(weldData.weldPlaces);
        // Calculate expected cycle time
        const expectedCycleTime = (0, welding_calculator_1.calculateSingleWeldCycleTime)({
            totalWeldLength,
            travelSpeed: Number(weldData.travelSpeed),
            tackWelds: Number(weldData.tackWelds),
            intermediateStops: Number(weldData.intermediateStops)
        });
        // Get actual cycle time from UI
        const actualCycleTime = Number(yield page.weldCycleTimeDisplay.textContent());
        // Verify
        (0, test_1.expect)(actualCycleTime).toBeCloseTo(expectedCycleTime, 2);
        console.log(`✅ Weld Cycle Time verified: ${actualCycleTime.toFixed(4)} sec`);
    });
}
/* ========================================
 * COMMON PATTERNS & TIPS
 * ======================================== */
/**
 * TIP 1: Converting Weld Side to Multiplier
 */
function convertWeldSideToMultiplier(weldSide) {
    if (typeof weldSide === 'string') {
        return weldSide.toLowerCase() === 'both' ? 2 : 1;
    }
    return weldSide === 2 ? 2 : 1;
}
/**
 * TIP 2: Calculating Total Weld Length
 */
function calculateTotalWeldLength(weldLength, weldPlaces, weldSide, noOfPasses = 1) {
    const sideMultiplier = convertWeldSideToMultiplier(weldSide);
    return weldLength * weldPlaces * noOfPasses * sideMultiplier;
}
/**
 * TIP 3: Extracting Subprocess Cycle Times from UI
 */
function extractSubProcessCycleTimes(page) {
    return __awaiter(this, void 0, void 0, function* () {
        const cycleTimes = [];
        // Get all subprocess cycle time elements
        const cycleTimeElements = yield page.locator('[data-testid="subprocess-cycle-time"]').all();
        for (const element of cycleTimeElements) {
            const value = yield element.textContent();
            cycleTimes.push(Number(value));
        }
        return cycleTimes;
    });
}
/**
 * TIP 4: Complete Workflow Example
 */
function completeWorkflowExample(page) {
    return __awaiter(this, void 0, void 0, function* () {
        // 1. Extract weld data
        const welds = [
            {
                length: 80,
                side: 'Both',
                places: 1,
                travelSpeed: 3.825,
                tackWelds: 1,
                intermediateStops: 2
            },
            {
                length: 30,
                side: 'Single',
                places: 1,
                travelSpeed: 3.825,
                tackWelds: 1,
                intermediateStops: 1
            }
        ];
        // 2. Calculate individual cycle times
        const subProcessCycleTimes = welds.map(weld => {
            const totalLength = calculateTotalWeldLength(weld.length, weld.places, weld.side);
            return (0, welding_calculator_1.calculateSingleWeldCycleTime)({
                totalWeldLength: totalLength,
                travelSpeed: weld.travelSpeed,
                tackWelds: weld.tackWelds,
                intermediateStops: weld.intermediateStops
            });
        });
        // 3. Calculate total cycle time
        const totalCycleTime = (0, welding_calculator_1.calculateDryWeldCycleTime)({
            subProcessCycleTimes,
            loadingUnloadingTime: 20,
            partReorientation: 0,
            efficiency: 75
        });
        // 4. Verify against UI
        const uiTotalCycleTime = Number(yield page.totalCycleTimeDisplay.textContent());
        (0, test_1.expect)(uiTotalCycleTime).toBeCloseTo(totalCycleTime, 2);
        console.log('✅ Complete workflow verified successfully!');
        console.log(`Total Cycle Time: ${totalCycleTime.toFixed(4)} sec`);
    });
}
