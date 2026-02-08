"use strict";
/**
 * Weld Cycle Time Calculator - Enhanced with Breakdown
 * Refactored to expose ArcOnTime and ArcOffTime as per Angular service
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDetailedCycleTime = calculateDetailedCycleTime;
exports.verifyArcTimes = verifyArcTimes;
const welding_calculator_1 = require("./welding-calculator");
/**
 * Example: Calculate detailed breakdown with arc times
 */
function calculateDetailedCycleTime(input) {
    return (0, welding_calculator_1.calculateWeldCycleTimeBreakdown)(input);
}
/**
 * Verify arc times match Angular service logic
 */
function verifyArcTimes(breakdown) {
    console.log('=== Weld Cycle Time Breakdown ===');
    console.log(`Total Weld Cycle Time (sum of subprocesses): ${breakdown.totalWeldCycleTime.toFixed(4)} sec`);
    console.log(`Arc On Time (line 326): ${breakdown.arcOnTime.toFixed(4)} sec`);
    console.log(`Arc Off Time (line 328): ${breakdown.arcOffTime.toFixed(4)} sec`);
    console.log(`Loading Time: ${breakdown.loadingTime.toFixed(4)} sec`);
    console.log(`Part Reorientation Time: ${breakdown.partReorientationTime.toFixed(4)} sec`);
    console.log(`Dry Cycle Time (line 336): ${breakdown.dryCycleTime.toFixed(4)} sec`);
    console.log(`Final Cycle Time with ${breakdown.efficiency}% efficiency (line 347): ${breakdown.cycleTime.toFixed(4)} sec`);
}
// Example usage
const exampleInput = {
    subProcessCycleTimes: [54.8301, 15.8431],
    loadingUnloadingTime: 20,
    partReorientation: 0,
    efficiency: 70
};
const breakdown = calculateDetailedCycleTime(exampleInput);
verifyArcTimes(breakdown);
