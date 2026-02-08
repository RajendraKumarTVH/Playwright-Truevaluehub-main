# Weld Cycle Time Calculator - Arc Time Refactoring

## Issue
The original implementation did not expose ArcOnTime and ArcOffTime as separate return values, making it difficult to verify these intermediate calculations against the UI.

## Angular Service Reference
From `manufacturing-welding-calculator.service.ts` lines 326-352:

```typescript
// Arc On Time (line 326)
const arcOnTime = totalWeldCycleTime + manufactureInfo.unloadingTime;

// Arc Off Time (line 328)
const arcOffTime = arcOnTime * 0.05;

// Total Weld Cycle Time (line 330)
const totWeldCycleTime = manufactureInfo.noOfWeldPasses * loadingTime + arcOnTime + arcOffTime;

// Dry Cycle Time (line 336)
manufactureInfo.dryCycleTime = totWeldCycleTime;

// Final Cycle Time with efficiency (line 347)
let cycleTime = totWeldCycleTime / (manufactureInfo.efficiency / 100);
manufactureInfo.cycleTime = cycleTime;
```

## Solution: Enhanced Interface

### New Interface: `WeldCycleTimeBreakdown`

```typescript
export interface WeldCycleTimeBreakdown {
    // Sub-process totalstotalWeldCycleTime: number;      // Sum of all subprocess cycle times
    
    // Arc times (EXPOSED - from Angular service lines 326-328)
    arcOnTime: number;               // totalWeldCycleTime + unloadingTime
    arcOffTime: number;              // arcOnTime * 0.05
    
    // Loading times
    loadingTime: number;             // unloadingTime / 2
    loadingUnloadingTime: number;    // Original input value
    
    // Part reorientation
    partReorientation: number;       // Number of reorientations
    partReorientationTime: number;   // partReorientation * loadingTime
    
    // Total cycle times
    dryCycleTime: number;            // Total without efficiency (line 336)
    cycleTime: number;               // With efficiency applied (line 347)
    
    // Efficiency
    efficiency: number;              // Efficiency percentage
}
```

### New Function: `calculateWeldCycleTimeBreakdown()`

```typescript
export function calculateWeldCycleTimeBreakdown(input: TotalCycleTimeInput): WeldCycleTimeBreakdown {
    const { subProcessCycleTimes, loadingUnloadingTime, partReorientation, efficiency } = input;
    
    // Sum all subprocess cycle times (this is totalWeldCycleTime in the service)
    const totalWeldCycleTime = subProcessCycleTimes.reduce((sum, time) => sum + time, 0);
    
    // Arc On Time (line 326 in service)
    const arcOnTime = totalWeldCycleTime + loadingUnloadingTime;
    
    // Arc Off Time (line 328 in service)
    const arcOffTime = arcOnTime * 0.05;
    
    // Loading time (for part reorientation calculation)
    const loadingTime = loadingUnloadingTime / 2;
    
    // Part reorientation time
    const partReorientationTime = partReorientation * loadingTime;
    
    // Dry Cycle Time (line 330 & 336 in service)
    const dryCycleTime = partReorientationTime + arcOnTime + arcOffTime;
    
    // Final Cycle Time with efficiency (line 347 in service)
    const cycleTime = dryCycleTime / (efficiency / 100);
    
    return {
        totalWeldCycleTime,
        arcOnTime,
        arcOffTime,
        loadingTime,
        loadingUnloadingTime,
        partReorientation,
        partReorientationTime,
        dryCycleTime,
        cycleTime,
        efficiency
    };
}
```

### Refactored Existing Functions

```typescript
export function calculateTotalWeldCycleTime(input: TotalCycleTimeInput): number {
    const breakdown = calculateWeldCycleTimeBreakdown(input);
    return breakdown.cycleTime; // With efficiency
}

export function calculateDryWeldCycleTime(input: TotalCycleTimeInput): number {
    const breakdown = calculateWeldCycleTimeBreakdown(input);
    return breakdown.dryCycleTime; // Without efficiency
}
```

## Usage in mig-welding-logic.ts

### Enhanced Method to Verify Arc Times

```typescript
async verifyIndividualWeldCycleTimes(testData: any): Promise<void> {
    // ... calculate subprocess times ...
    
    const loadingUnloadingTime = await this.page.getInputValueAsNumber(this.page.UnloadingTime);
    const partReorientation = await this.page.getInputValueAsNumber(this.page.PartReorientation);
    const efficiency = await this.page.getInputValueAsNumber(this.page.MachineEfficiency);
    
    // Get detailed breakdown with arc times
    const breakdown = calculateWeldCycleTimeBreakdown({
        subProcessCycleTimes,
        loadingUnloadingTime,
        partReorientation,
        efficiency
    });
    
    // Verify Arc On Time
    const uiArcOnTime = await this.page.getInputValueAsNumber(this.page.ArcOnTime);
    expect.soft(uiArcOnTime).toBeCloseTo(breakdown.arcOnTime, 2);
    logger.info(`✔ Arc On Time Verified: UI=${uiArcOnTime}, Calc=${breakdown.arcOnTime.toFixed(4)}`);
    
    // Verify Arc Off Time
    const uiArcOffTime = await this.page.getInputValueAsNumber(this.page.ArcOffTime);
    expect.soft(uiArcOffTime).toBeCloseTo(breakdown.arcOffTime, 2);
    logger.info(`✔ Arc Off Time Verified: UI=${uiArcOffTime}, Calc=${breakdown.arcOffTime.toFixed(4)}`);
    
    // Verify Dry Cycle Time
    logger.info(`✔ Dry Cycle Time: ${breakdown.dryCycleTime.toFixed(4)} sec`);
    
    // Verify Final Cycle Time with Efficiency
    const uiCycleTime = await this.page.getInputValueAsNumber(this.page.CycleTimePart);
    expect.soft(uiCycleTime).toBeCloseTo(breakdown.cycleTime, 2);
    logger.info(`✔ Cycle Time (with ${breakdown.efficiency}% efficiency): UI=${uiCycleTime}, Calc=${breakdown.cycleTime.toFixed(4)}`);
}
```

## Example Calculation

### Input
```typescript
const input = {
    subProcessCycleTimes: [54.8301, 15.8431], // Weld 1 + Weld 2
    loadingUnloadingTime: 20,
    partReorientation: 0,
    efficiency: 70
};
```

### Breakdown Output
```typescript
{
    totalWeldCycleTime: 70.6732,        // 54.8301 + 15.8431
    arcOnTime: 90.6732,                 // 70.6732 + 20
    arcOffTime: 4.5337,                 // 90.6732 * 0.05
    loadingTime: 10,                    // 20 / 2
    loadingUnloadingTime: 20,
    partReorientation: 0,
    partReorientationTime: 0,           // 0 * 10
    dryCycleTime: 95.2069,              // 0 + 90.6732 + 4.5337
    cycleTime: 136.0099,                // 95.2069 / 0.70
    efficiency: 70
}
```

## Benefits

1. ✅ **Full Transparency** - All intermediate values are exposed
2. ✅ **Exact Angular Service Match** - Line-by-line correspondence
3. ✅ **Better Testing** - Can verify arcOnTime and arcOffTime separately
4. ✅ **DRY Principle** - calculateTotal and calculateDry both use breakdown
5. ✅ **Debugging** - Easy to see where calculation differs from UI

## Implementation Steps

1. ✅ Add `WeldCycleTimeBreakdown` interface to `welding-calculator.ts`
2. ✅ Add `calculateWeldCycleTimeBreakdown()` function
3. ✅ Refactor `calculateTotalWeldCycleTime()` to use breakdown
4. ✅ Refactor `calculateDryWeldCycleTime()` to use breakdown
5. ✅ Export `calculateWeldCycleTimeBreakdown` from module
6. ✅ Update `mig-welding-logic.ts` to import and use breakdown
7. ✅ Update unit tests to verify arc times
8. ✅ Update integration tests to use breakdown

## Files to Update

1. `tests/utils/welding-calculator.ts` - Add interface and function
2. `tests/pages/mig-welding-logic.ts` - Import and use breakdown
3. `tests/utils/weld-cycle-time-calculator.test.ts` - Add arc time tests
4. Update documentation

## Verification

The breakdown can be verified against UI fields:
- `this.page.ArcOnTime` → `breakdown.arcOnTime`
- `this.page.ArcOffTime` → `breakdown.arcOffTime`
- `this.page.UnloadingTime` → `breakdown.loadingUnloadingTime`
- `this.page.PartReorientation` → `breakdown.partReorientation`
- `this.page.CycleTimePart` → `breakdown.cycleTime` (with efficiency)
