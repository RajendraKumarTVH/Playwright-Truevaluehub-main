/**
 * Weld Cycle Time Calculator - Enhanced with Breakdown
 * Refactored to expose ArcOnTime and ArcOffTime as per Angular service
 */

import {
    WeldCycleTimeInput,
    TotalCycleTimeInput,
    WeldCycleTimeBreakdown,
    calculateSingleWeldCycleTime,
    calculateWeldCycleTimeBreakdown
} from './welding-calculator';

/**
 * Example: Calculate detailed breakdown with arc times
 */
export function calculateDetailedCycleTime(input: TotalCycleTimeInput): WeldCycleTimeBreakdown {
    return calculateWeldCycleTimeBreakdown(input);
}

/**
 * Verify arc times match Angular service logic
 */
export function verifyArcTimes(breakdown: WeldCycleTimeBreakdown) {
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
const exampleInput: TotalCycleTimeInput = {
    subProcessCycleTimes: [54.8301, 15.8431],
    loadingUnloadingTime: 20,
    partReorientation: 0,
    efficiency: 70
};

const breakdown = calculateDetailedCycleTime(exampleInput);
verifyArcTimes(breakdown);
