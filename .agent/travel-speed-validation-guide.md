# Travel Speed Validation Guide

## Overview

This guide explains how to validate travel speed values from the UI against calculated values using the welding calculator logic integrated into the `MigWeldingPage` class.

## Implementation Details

### 1. **Calculation Logic** (`calculateExpectedTravelSpeed`)

The travel speed calculation is based on the welding calculator logic from `welding-calculator.ts`:

```typescript
private calculateExpectedTravelSpeed(
    weldLength: number,
    weldSize: number,
    isAutomated: boolean
): number
```

**Formula:**
- **Base Travel Speed**: 5 mm/sec (from `getWeldingData`)
- **Efficiency**: 
  - Automated: 0.9 (90%)
  - Manual/Semi-Auto: 0.85 (85%)

**Calculation:**
- **Automated**: `(baseTravelSpeed / 0.8) * efficiency = (5 / 0.8) * 0.9 = 5.625 mm/sec`
- **Manual/Semi-Auto**: `baseTravelSpeed * efficiency = 5 * 0.85 = 4.25 mm/sec`

### 2. **UI Validation Method** (`validateTravelSpeedFromUI`)

This method automatically:
1. Reads weld parameters from the UI (length, size, machine type)
2. Calculates expected travel speed using the formula
3. Compares UI value with calculated value
4. Logs detailed comparison including percentage difference
5. Validates both Weld 1 and Weld 2 (if exists)

## Usage Examples

### Example 1: Standalone Validation

```typescript
// After filling weld details and recalculating
await migWeldingPage.fillWeldDetails(1, {
    weldType: 'Fillet',
    weldSize: 6,
    weldLength: 100,
    noOfPasses: 1,
    weldPlaces: 1
})

await migWeldingPage.recalculateCost()

// Validate travel speed from UI
await migWeldingPage.validateTravelSpeedFromUI()
```

### Example 2: With Explicit Expected Values

```typescript
// Option 1: Provide explicit travel speed
await migWeldingPage.verifySubProcessDetails({
    weld1: {
        weldType: 'Fillet',
        weldPosition: 'Flat',
        travelSpeed: 3.825,  // Explicitly provided
        tackWelds: 1,
        intermediateStops: 2,
        weldCycleTime: 65.2876
    },
    weld2: {
        weldType: 'Square',
        weldPosition: 'Flat',
        travelSpeed: 3.825,
        tackWelds: 1,
        intermediateStops: 1,
        weldCycleTime: 34.1438
    }
})
```

### Example 3: With Dynamic Calculation

```typescript
// Option 2: Let it calculate travel speed automatically
await migWeldingPage.verifySubProcessDetails({
    weld1: {
        weldType: 'Fillet',
        weldPosition: 'Flat',
        weldLength: 100,      // Used for calculation
        weldSize: 6,          // Used for calculation
        tackWelds: 1,
        intermediateStops: 2,
        weldCycleTime: 65.2876
    },
    weld2: {
        weldType: 'Square',
        weldPosition: 'Flat',
        weldLength: 100,
        weldSize: 6,
        tackWelds: 1,
        intermediateStops: 1,
        weldCycleTime: 34.1438
    },
    machineType: 'Semi-Auto'  // Required for calculation
})
```

## Expected Output

When running `validateTravelSpeedFromUI()`, you'll see detailed logs:

```
🔹 Validating Travel Speed from UI against calculated values...
   Machine Type: Semi-Auto (Automated: false)
   📊 Validating Weld 1 Travel Speed...
   Weld 1 - Length: 100mm, Size: 6mm
   Weld 1 - UI Travel Speed: 4.25 mm/sec
   Weld 1 - Calculated Travel Speed: 4.25 mm/sec
   ✅ Weld 1 Travel Speed validated (Difference: 0.00%)
   📊 Validating Weld 2 Travel Speed...
   Weld 2 - Length: 100mm, Size: 6mm
   Weld 2 - UI Travel Speed: 4.25 mm/sec
   Weld 2 - Calculated Travel Speed: 4.25 mm/sec
   ✅ Weld 2 Travel Speed validated (Difference: 0.00%)
✅ Travel Speed validation from UI completed
```

## Validation Criteria

- **Precision**: Values are compared with 2 decimal places tolerance
- **Acceptable Difference**: ≤ 5% difference is considered valid
- **Warning Threshold**: > 5% difference triggers a warning log

## Integration Points

### UI Locators Used

```typescript
// Machine Type
this.MachineType = page.locator("//select[@formcontrolname='machineType']")

// Weld Parameters (from welding details)
page.locator('input[formcontrolname="coreLength"]').nth(0)  // Weld 1 Length
page.locator('input[formcontrolname="coreHeight"]').nth(0)  // Weld 1 Size

// Travel Speed (from sub-process details)
this.TravelSpeedSubProcess1 = page.locator("(//input[@formcontrolname='formHeight'])[1]")
this.TravelSpeedSubProcess2 = page.locator("(//input[@formcontrolname='formHeight'])[2]")
```

### Calculation Source

The calculation logic mirrors the implementation in:
- **File**: `tests/utils/welding-calculator.ts`
- **Method**: `calculationForWelding` (lines 1118-1121)
- **Config**: `WeldingConfigService.getWeldingEfficiency` and `getWeldingData`

## Benefits

✅ **Automated Validation**: No need to manually calculate expected values  
✅ **Comprehensive Logging**: Detailed output for debugging  
✅ **Flexible**: Supports both explicit and calculated values  
✅ **Reusable**: Same logic as production calculator  
✅ **Type-Safe**: Full TypeScript support with proper interfaces  

## Troubleshooting

### Issue: Travel speed validation fails

**Possible Causes:**
1. Machine type not correctly set in UI
2. Weld parameters (length/size) not filled
3. Sub Process Details section not expanded
4. Calculation uses different base values

**Solution:**
- Check machine type selection
- Ensure weld details are filled before recalculating
- Verify Sub Process Details section is visible
- Compare with actual calculator implementation

### Issue: Method not found

**Error**: `Property 'validateTravelSpeedFromUI' does not exist`

**Solution:**
- Ensure you're using the latest version of `mig-welding.page.ts`
- Import the page object correctly
- Check TypeScript compilation

## Related Files

- **Page Object**: `tests/pages/mig-welding.page.ts`
- **Calculator**: `tests/utils/welding-calculator.ts`
- **Test Spec**: `tests/costing_mig-welding.spec.ts`
- **Interface**: `SubProcessDetailsExpected` (lines 50-70)

## Version History

- **v1.0** (2025-12-25): Initial implementation with UI validation
  - Added `calculateExpectedTravelSpeed` method
  - Added `validateTravelSpeedFromUI` method
  - Enhanced `SubProcessDetailsExpected` interface
  - Updated `verifySubProcessDetails` with dynamic calculation

---

**Last Updated**: December 25, 2025  
**Author**: Automated Test Framework Team
