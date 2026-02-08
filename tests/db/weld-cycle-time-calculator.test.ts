/**
 * Test file for Weld Cycle Time calculations
 * Testing the logic from manufacturing-welding-calculator.service.ts
 */

import { expect, test } from '@playwright/test';
import {
    calculateSingleWeldCycleTime,
    calculateTotalWeldCycleTime,
    calculateDryWeldCycleTime
} from './welding-calculator';
import { migWeldingSubProcess1Fixture, migWeldingSubProcess2Fixture, migWeldingCycleTimeDetailsFixture } from './fixtures';

/**
 * Weld Cycle Time Calculation Tests
 * 
 * These tests verify the weld cycle time calculations based on the Angular service logic
 * in manufacturing-welding-calculator.service.ts
 * 
 * Formula breakdown (for MIG/TIG Welding):
 * 1. Calculate travel speed based on material type, weld size, and machine type
 * 2. Calculate cycle time for intermediate stops = noOfIntermediateStops * 5
 * 3. Calculate cycle time for tack welds = noOfTackWelds * 3
 * 4. Calculate weld cycle time = (totalWeldLength / travelSpeed) + cycleTimeForIntermediateStops + cycleTimeForTackWeld
 * 5. Sum all sub-process cycle times
 * 6. Calculate Arc On Time = totalWeldCycleTime + loadingUnloadingTime
 * 7. Calculate Arc Off Time = arcOnTime * 0.05
 * 8. Total Weld Cycle Time = partReorientation * loadingTime + arcOnTime + arcOffTime
 * 9. Final Cycle Time = totalWeldCycleTime / (efficiency / 100)
 */

test.describe('Weld Cycle Time Calculator Tests', () => {

    test('TC001: Calculate Single Weld Cycle Time - Weld 1', () => {
        const weldSubProcess1 = migWeldingSubProcess1Fixture;

        // Expected values from fixture
        const expectedCycleTime = weldSubProcess1.weldCycleTime; // 54.8301

        // Calculate using our function
        // From fixtures: weld1 has weldLength=80, weldSide='Both', weldPlaces=1
        // totalWeldLength = 80 * 2 * 1 = 160 mm
        const totalWeldLength = 160;

        const actualCycleTime = calculateSingleWeldCycleTime({
            totalWeldLength: totalWeldLength,
            travelSpeed: weldSubProcess1.travelSpeed,
            tackWelds: weldSubProcess1.tackWelds,
            intermediateStops: weldSubProcess1.intermediateStops
        });

        console.log(`Weld 1 Cycle Time:`);
        console.log(`  Total Weld Length: ${totalWeldLength} mm`);
        console.log(`  Travel Speed: ${weldSubProcess1.travelSpeed} mm/s`);
        console.log(`  Tack Welds: ${weldSubProcess1.tackWelds}`);
        console.log(`  Intermediate Stops: ${weldSubProcess1.intermediateStops}`);
        console.log(`  Expected: ${expectedCycleTime} sec`);
        console.log(`  Actual: ${actualCycleTime.toFixed(4)} sec`);

        // Allow small tolerance for floating point
        expect(Math.abs(actualCycleTime - expectedCycleTime)).toBeLessThan(0.01);
    });

    test('TC002: Calculate Single Weld Cycle Time - Weld 2', () => {
        const weldSubProcess2 = migWeldingSubProcess2Fixture;

        // Expected values from fixture
        const expectedCycleTime = weldSubProcess2.weldCycleTime; // 15.8431

        // From fixtures: weld2 has weldLength=30, weldSide='Single', weldPlaces=1
        // totalWeldLength = 30 * 1 * 1 = 30 mm
        const totalWeldLength = 30;

        const actualCycleTime = calculateSingleWeldCycleTime({
            totalWeldLength: totalWeldLength,
            travelSpeed: weldSubProcess2.travelSpeed,
            tackWelds: weldSubProcess2.tackWelds,
            intermediateStops: weldSubProcess2.intermediateStops
        });

        console.log(`Weld 2 Cycle Time:`);
        console.log(`  Total Weld Length: ${totalWeldLength} mm`);
        console.log(`  Travel Speed: ${weldSubProcess2.travelSpeed} mm/s`);
        console.log(`  Tack Welds: ${weldSubProcess2.tackWelds}`);
        console.log(`  Intermediate Stops: ${weldSubProcess2.intermediateStops}`);
        console.log(`  Expected: ${expectedCycleTime} sec`);
        console.log(`  Actual: ${actualCycleTime.toFixed(4)} sec`);

        expect(Math.abs(actualCycleTime - expectedCycleTime)).toBeLessThan(0.01);
    });

    test('TC003: Calculate Total Weld Cycle Time', () => {
        const cycleTimeDetails = migWeldingCycleTimeDetailsFixture;
        const weldSubProcess1 = migWeldingSubProcess1Fixture;
        const weldSubProcess2 = migWeldingSubProcess2Fixture;

        // Expected total weld cycle time
        const expectedTotalCycleTime = cycleTimeDetails.totalWeldCycleTime; // 95.2069

        // Sub-process cycle times
        const subProcessCycleTimes = [
            weldSubProcess1.weldCycleTime,
            weldSubProcess2.weldCycleTime
        ];

        // Calculate dry cycle time (without efficiency)
        const dryWeldCycleTime = calculateDryWeldCycleTime({
            subProcessCycleTimes,
            loadingUnloadingTime: cycleTimeDetails.loadingUnloadingTime,
            partReorientation: cycleTimeDetails.partReorientation,
            efficiency: 75 // Not used in dry calculation
        });

        console.log(`Total Weld Cycle Time:`);
        console.log(`  Sub-Process 1: ${weldSubProcess1.weldCycleTime} sec`);
        console.log(`  Sub-Process 2: ${weldSubProcess2.weldCycleTime} sec`);
        console.log(`  Loading/Unloading: ${cycleTimeDetails.loadingUnloadingTime} sec`);
        console.log(`  Part Reorientation: ${cycleTimeDetails.partReorientation}`);
        console.log(`  Expected Total: ${expectedTotalCycleTime} sec`);
        console.log(`  Actual Total: ${dryWeldCycleTime.toFixed(4)} sec`);

        expect(Math.abs(dryWeldCycleTime - expectedTotalCycleTime)).toBeLessThan(0.01);
    });

    test('TC004: Verify Complete Weld Cycle Time Workflow', () => {
        // Test data for weld 1
        const weld1TotalLength = 160; // 80mm * 2 sides
        const weld1 = migWeldingSubProcess1Fixture;

        const weld1CycleTime = calculateSingleWeldCycleTime({
            totalWeldLength: weld1TotalLength,
            travelSpeed: weld1.travelSpeed,
            tackWelds: weld1.tackWelds,
            intermediateStops: weld1.intermediateStops
        });

        // Test data for weld 2
        const weld2TotalLength = 30; // 30mm * 1 side
        const weld2 = migWeldingSubProcess2Fixture;

        const weld2CycleTime = calculateSingleWeldCycleTime({
            totalWeldLength: weld2TotalLength,
            travelSpeed: weld2.travelSpeed,
            tackWelds: weld2.tackWelds,
            intermediateStops: weld2.intermediateStops
        });

        console.log('\n=== Weld Cycle Time Verification ===');
        console.log(`Weld 1 Cycle Time: ${weld1CycleTime.toFixed(4)} sec (Expected: ${weld1.weldCycleTime})`);
        console.log(`Weld 2 Cycle Time: ${weld2CycleTime.toFixed(4)} sec (Expected: ${weld2.weldCycleTime})`);

        // Verify both calculations
        expect(weld1CycleTime).toBeCloseTo(weld1.weldCycleTime, 2);
        expect(weld2CycleTime).toBeCloseTo(weld2.weldCycleTime, 2);
    });
});
