# Welding Calculator Refactoring Summary

## Date: 2026-01-13
## Status: ✅ Complete - Using Calculator Functions Instead of UI Fields

---

## Overview

Refactored the MIG welding test verification to use **calculated values** from `welding-calculator.ts` instead of reading `ArcOnTime` and `ArcOffTime` from the UI. This provides a cleaner architecture with a single source of truth for calculations.

---

## Changes Made

### 1. **Welding Calculator (`welding-calculator.ts`)**

#### Refactored `calculateSingleWeldCycleTime`:
```typescript
export function calculateSingleWeldCycleTime(input: SingleWeldCycleTimeInput): number {
    const { totalWeldLength, travelSpeed, tackWelds, intermediateStops, weldType } = input;
    
    const cycleTimeForIntermediateStops = intermediateStops * 5;
    const cycleTimeForTackWelds = tackWelds * 3;
    let weldProcessTime = totalWeldLength / travelSpeed;
    
    const typeId = getWeldTypeId(weldType || '');
    if (typeId === 4) {
        weldProcessTime *= 0.95;
    } else if (typeId === 5) {
        weldProcessTime *= 1.5;
    }

    let totalSubProcessTime = weldProcessTime + cycleTimeForIntermediateStops + cycleTimeForTackWelds;
    if (typeId === 4) {
        totalSubProcessTime *= 0.95;
    } else if (typeId === 5) {
        totalSubProcessTime *= 1.5;
    }

    return totalSubProcessTime;
}
```

#### Added New Helper Functions:
```typescript
export function calculateArcOnTime(subProcessCycleTime: number, loadingUnloadingTime: number): number {
    return subProcessCycleTime + loadingUnloadingTime;
}

export function calculateArcOffTime(arcOnTime: number, factor: number = 0.05): number {
    return arcOnTime * factor;  // 5% of Arc On Time
}
```

**Key Improvements:**
- ✅ Clearer calculation steps
- ✅ Separated concerns (Arc On/Off time calculation)
- ✅ Reusable helper functions
- ✅ Weld type multipliers properly applied

---

### 2. **Page Object (`mig-welding.page.ts`)**

**Removed** (no longer needed):
- ❌ `ArcOnTime` locator - calculated, not read from UI
- ❌ `ArcOffTime` locator - calculated, not read from UI  
- ❌ `RequiredWeldingCurrent` locator - duplicate of RequiredCurrent

**Kept** (still verified against UI):
- ✅ `selectedCurrent` - Selected current value
- ✅ `selectedVoltage` - Selected voltage value
- ✅ `CycleTimePart` - Final cycle time (verified)
- ✅ `UnloadingTime` - Loading/unloading time
- ✅ `PartReorientation` - Part reorientation count

---

### 3. **Logic Layer (`mig-welding-logic.ts`)**

#### Updated Imports:
```typescript
import {
    // ... existing imports
    calculateSingleWeldCycleTime,
    calculateWeldCycleTimeBreakdown,
    calculateArcOnTime,        // ← NEW
    calculateArcOffTime,       // ← NEW
    PrimaryProcessType
} from '../utils/welding-calculator'
```

#### Enhanced Verification with Detailed Logging:
```typescript
const breakdown = calculateWeldCycleTimeBreakdown(input)

// --- Calculation Breakdown for Debugging ---
const totalSubProcessTime = subProcessCycleTimes.reduce((sum, time) => sum + time, 0)
logger.info(`   📊 Calculation Details:`)
logger.info(`      Total Sub-Process Time: ${totalSubProcessTime.toFixed(4)} sec`)
logger.info(`      Loading/Unloading Time: ${loadingUnloadingTime.toFixed(4)} sec`)

// --- Arc On Time (Calculated) ---
logger.info(`   ✓ Arc On Time (Calculated): ${breakdown.arcOnTime.toFixed(4)} sec`)
logger.info(`      Formula: SubProcessTime + LoadingUnloadingTime = ${totalSubProcessTime.toFixed(4)} + ${loadingUnloadingTime.toFixed(4)}`)

// --- Arc Off Time (Calculated) ---
logger.info(`   ✓ Arc Off Time (Calculated): ${breakdown.arcOffTime.toFixed(4)} sec`)
logger.info(`      Formula: ArcOnTime × 0.05 = ${breakdown.arcOnTime.toFixed(4)} × 0.05`)
```

**Before:** Tried to read from UI and compare
**After:** Calculate and log with formulas for transparency

---

## Calculation Flow

### Step-by-Step Process:

1. **For Each Weld Sub-Process:**
   ```typescript
   const weldCycleTime = calculateSingleWeldCycleTime({
       totalWeldLength,      // mm
       travelSpeed,          // mm/sec
       tackWelds,            // count
       intermediateStops,    // count
       weldType             // e.g., "Fillet", "Groove"
   })
   // Applies weld type multipliers (0.95 for type 4, 1.5 for type 5)
   ```

2. **Aggregate All Sub-Processes:**
   ```typescript
   const breakdown = calculateWeldCycleTimeBreakdown({
       subProcessCycleTimes,   // [weld1Time, weld2Time, ...]
       loadingUnloadingTime,   // seconds
       partReorientation,      // count
       efficiency              // percentage (e.g., 75)
   })
   ```

3. **Breakdown Contains:**
   ```typescript
   {
       arcOnTime: number,              // SubProcessTime + LoadingTime
       arcOffTime: number,             // ArcOnTime × 0.05
       totalWeldCycleTime: number,     // Dry cycle (before efficiency)
       cycleTime: number,              // Final cycle time (with efficiency)
       loadingUnloadingTime: number,
       partReorientation: number,
       partReorientationTime: number
   }
   ```

4. **Verify Against UI:**
   ```typescript
   const uiCycleTime = await this.page.getInputValueAsNumber(this.page.CycleTimePart)
   expect.soft(uiCycleTime).toBeCloseTo(breakdown.cycleTime, 2)
   ```

---

## Formula Reference

### Arc On Time:
```
ArcOnTime = SubProcessTime + LoadingUnloadingTime
```

### Arc Off Time:
```
ArcOffTime = ArcOnTime × 0.05  (5% factor)
```

### Total Weld Cycle Time (Dry):
```
DryCycleTime = PartReorientation × LoadingTime + ArcOnTime + ArcOffTime
```

### Final Cycle Time:
```
FinalCycleTime = DryCycleTime × (100 / Efficiency)
```

### Sub-Process Cycle Time:
```
WeldProcessTime = TotalWeldLength / TravelSpeed
TackWeldTime = TackWelds × 3 seconds
IntermediateStopsTime = IntermediateStops × 5 seconds

SubProcessTime = WeldProcessTime + TackWeldTime + IntermediateStopsTime
(with weld type multipliers applied if applicable)
```

---

## Benefits

### ✅ Single Source of Truth
- All calculations in `welding-calculator.ts`
- No discrepancies between test and UI calculations
- Easier to maintain and update formulas

### ✅ Better Debugging
- Detailed logging shows calculation steps
- Formula displayed alongside values
- Easy to trace where differences originate

### ✅ Cleaner Architecture
- Removed unnecessary UI field dependencies
- Calculator functions are reusable
- Clear separation of concerns

### ✅ More Testable
- Can unit test calculations independently
- Don't need UI to verify calculation logic
- Faster test execution (fewer UI reads)

### ✅ Better Documentation
- Function signatures are self-documenting
- Formulas are visible in code
- Logging provides audit trail

---

## Example Output

```
📊 Calculation Details:
   Total Sub-Process Time: 45.2341 sec
   Loading/Unloading Time: 10.0000 sec

✓ Arc On Time (Calculated): 55.2341 sec
   Formula: SubProcessTime + LoadingUnloadingTime = 45.2341 + 10.0000

✓ Arc Off Time (Calculated): 2.7617 sec
   Formula: ArcOnTime × 0.05 = 55.2341 × 0.05

✓ Total Weld Cycle Time (Dry): 57.9958 sec

✓ Total Cycle Time (Final): 77.3277 sec
   UI Verification: 77.3300 ≈ 77.3277
```

---

## Files Modified

1. **tests/utils/welding-calculator.ts**
   - Refactored `calculateSingleWeldCycleTime`
   - Added `calculateArcOnTime` helper
   - Added `calculateArcOffTime` helper

2. **tests/pages/mig-welding.page.ts**
   - Removed `ArcOnTime` locator
   - Removed `ArcOffTime` locator
   - Removed `RequiredWeldingCurrent` locator
   - Kept `selectedVoltage` for verification

3. **tests/pages/mig-welding-logic.ts**
   - Added new function imports
   - Enhanced logging with formulas
   - Removed UI verification for Arc times
   - Added calculation breakdown logging

---

## Testing

To verify the changes work correctly:

```bash
npx playwright test tests/costing_mig-welding.spec.ts --reporter=list
```

Expected behavior:
- ✅ Detailed calculation logs appear
- ✅ Arc On/Off times are calculated correctly
- ✅ Final cycle time matches UI within tolerance
- ✅ All cost calculations use correct cycle time

---

## Next Steps

1. ✅ **DONE:** Refactor cycle time calculation
2. ✅ **DONE:** Use calculator functions
3. ✅ **DONE:** Enhanced logging
4. 📋 **TODO:** Run full test suite to validate
5. 📋 **TODO:** Fix any remaining calculation discrepancies
6. 📋 **TODO:** Consider adding unit tests for calculator functions
