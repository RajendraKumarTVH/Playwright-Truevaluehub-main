/**
 * Quick Reference: Using Weld Cycle Time Calculator Functions
 * 
 * This file provides usage examples for the weld cycle time calculation functions
 */

import { expect } from '@playwright/test';
import {
    calculateSingleWeldCycleTime,
    calculateTotalWeldCycleTime,
    calculateDryWeldCycleTime,
    calculateArcOnTime,
    calculateArcOffTime,
    WeldCycleTimeInput,
    TotalCycleTimeInput
} from './welding-calculator';

/* ========================================
 * EXAMPLE 1: Calculate Single Weld Cycle Time
 * ======================================== */

function example1_SingleWeldCycleTime() {
    const weldInput: WeldCycleTimeInput = {
        totalWeldLength: 160,        // Total weld length in mm
        travelSpeed: 3.825,          // Travel speed in mm/s
        tackWelds: 1,                // Number of tack welds
        intermediateStops: 2         // Number of intermediate start/stops
    };

    const cycleTime = calculateSingleWeldCycleTime(weldInput);
    console.log(`Single Weld Cycle Time: ${cycleTime.toFixed(4)} seconds`);
    // Output: 54.8301 seconds
}

/* ========================================
 * EXAMPLE 2: Calculate Total Weld Cycle Time with Efficiency
 * ======================================== */

function example2_TotalWeldCycleTimeWithEfficiency() {
    const totalInput: TotalCycleTimeInput = {
        subProcessCycleTimes: [54.8301, 15.8431],  // Array of individual weld cycle times
        loadingUnloadingTime: 20,                   // Loading + Unloading time in seconds
        partReorientation: 0,                       // Number of part reorientations
        efficiency: 70                              // Efficiency percentage (e.g., 70%)
    };

    const totalCycleTime = calculateTotalWeldCycleTime(totalInput);
    console.log(`Total Weld Cycle Time (with efficiency): ${totalCycleTime.toFixed(4)} seconds`);
    // Output: 136.0098 seconds (if efficiency is 70%)
}

/* ========================================
 * EXAMPLE 3: Calculate Dry Weld Cycle Time (without efficiency)
 * ======================================== */

function example3_DryWeldCycleTime() {
    const dryInput: TotalCycleTimeInput = {
        subProcessCycleTimes: [54.8301, 15.8431],  // Array of individual weld cycle times
        loadingUnloadingTime: 20,                   // Loading + Unloading time in seconds
        partReorientation: 0,                       // Number of part reorientations
        efficiency: 75                              // Not used in dry calculation
    };

    const dryCycleTime = calculateDryWeldCycleTime(dryInput);
    console.log(`Dry Weld Cycle Time: ${dryCycleTime.toFixed(4)} seconds`);
    // Output: 95.2069 seconds
}

/* ========================================
 * EXAMPLE 4: Calculate Arc Times
 * ======================================== */

function example4_ArcTimes() {
    const totalWeldCycleTime = 70.6732;  // Sum of subprocess cycle times
    const loadingUnloadingTime = 20;

    const arcOnTime = calculateArcOnTime(totalWeldCycleTime, loadingUnloadingTime);
    const arcOffTime = calculateArcOffTime(arcOnTime);

    console.log(`Arc On Time: ${arcOnTime.toFixed(4)} seconds`);
    // Output: 90.6732 seconds

    console.log(`Arc Off Time: ${arcOffTime.toFixed(4)} seconds`);
    // Output: 4.5337 seconds (5% of arc on time)
}

/* ========================================
 * EXAMPLE 5: Calculate Multiple Welds and Verify
 * ======================================== */

export function example5_MultipleWeldsWithVerification() {
    // Weld 1
    const weld1 = calculateSingleWeldCycleTime({
        totalWeldLength: 160,
        travelSpeed: 3.825,
        tackWelds: 1,
        intermediateStops: 2
    });

    // Weld 2
    const weld2 = calculateSingleWeldCycleTime({
        totalWeldLength: 30,
        travelSpeed: 3.825,
        tackWelds: 1,
        intermediateStops: 1
    });

    // Total
    const total = calculateDryWeldCycleTime({
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
    expect(weld1).toBeCloseTo(54.8301, 2);
    expect(weld2).toBeCloseTo(15.8431, 2);
    expect(total).toBeCloseTo(95.2069, 2);
}

/* ========================================
 * EXAMPLE 6: Integration with Page Object Data
 * ======================================== */

export async function example6_IntegrationWithPageObject(page: any) {
    // Assume we've scraped weld data from the UI
    const weldData = {
        weldLength: await page.weldLengthInput.inputValue(),
        weldSide: await page.weldSideDropdown.textContent(),
        weldPlaces: await page.weldPlacesInput.inputValue(),
        travelSpeed: await page.travelSpeedInput.inputValue(),
        tackWelds: await page.tackWeldsInput.inputValue(),
        intermediateStops: await page.intermediateStopsInput.inputValue()
    };

    // Calculate total weld length
    const sideMultiplier = weldData.weldSide === 'Both' ? 2 : 1;
    const totalWeldLength = Number(weldData.weldLength) * sideMultiplier * Number(weldData.weldPlaces);

    // Calculate expected cycle time
    const expectedCycleTime = calculateSingleWeldCycleTime({
        totalWeldLength,
        travelSpeed: Number(weldData.travelSpeed),
        tackWelds: Number(weldData.tackWelds),
        intermediateStops: Number(weldData.intermediateStops)
    });

    // Get actual cycle time from UI
    const actualCycleTime = Number(await page.weldCycleTimeDisplay.textContent());

    // Verify
    expect(actualCycleTime).toBeCloseTo(expectedCycleTime, 2);
    console.log(`✅ Weld Cycle Time verified: ${actualCycleTime.toFixed(4)} sec`);
}

/* ========================================
 * COMMON PATTERNS & TIPS
 * ======================================== */

/**
 * TIP 1: Converting Weld Side to Multiplier
 */
function convertWeldSideToMultiplier(weldSide: string | number): number {
    if (typeof weldSide === 'string') {
        return weldSide.toLowerCase() === 'both' ? 2 : 1;
    }
    return weldSide === 2 ? 2 : 1;
}

/**
 * TIP 2: Calculating Total Weld Length
 */
function calculateTotalWeldLength(
    weldLength: number,
    weldPlaces: number,
    weldSide: string | number,
    noOfPasses: number = 1
): number {
    const sideMultiplier = convertWeldSideToMultiplier(weldSide);
    return weldLength * weldPlaces * noOfPasses * sideMultiplier;
}

/**
 * TIP 3: Extracting Subprocess Cycle Times from UI
 */
async function extractSubProcessCycleTimes(page: any): Promise<number[]> {
    const cycleTimes: number[] = [];

    // Get all subprocess cycle time elements
    const cycleTimeElements = await page.locator('[data-testid="subprocess-cycle-time"]').all();

    for (const element of cycleTimeElements) {
        const value = await element.textContent();
        cycleTimes.push(Number(value));
    }

    return cycleTimes;
}

/**
 * TIP 4: Complete Workflow Example
 */
export async function completeWorkflowExample(page: any) {
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
        const totalLength = calculateTotalWeldLength(
            weld.length,
            weld.places,
            weld.side
        );

        return calculateSingleWeldCycleTime({
            totalWeldLength: totalLength,
            travelSpeed: weld.travelSpeed,
            tackWelds: weld.tackWelds,
            intermediateStops: weld.intermediateStops
        });
    });

    // 3. Calculate total cycle time
    const totalCycleTime = calculateDryWeldCycleTime({
        subProcessCycleTimes,
        loadingUnloadingTime: 20,
        partReorientation: 0,
        efficiency: 75
    });

    // 4. Verify against UI
    const uiTotalCycleTime = Number(await page.totalCycleTimeDisplay.textContent());
    expect(uiTotalCycleTime).toBeCloseTo(totalCycleTime, 2);

    console.log('✅ Complete workflow verified successfully!');
    console.log(`Total Cycle Time: ${totalCycleTime.toFixed(4)} sec`);
}
