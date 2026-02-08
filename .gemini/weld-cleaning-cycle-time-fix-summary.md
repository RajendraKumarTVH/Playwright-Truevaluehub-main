# Weld Cleaning Cycle Time Calculation Fix

## Problem
Test `TC017: Verify Weld Cleaning Cost Summary` is failing with:
- **Actual Cycle Time**: 31.2437 seconds
- **Expected Cycle Time**: 14.2857 seconds 
- **Ratio**: ~2.18x (more than double)

## Root Cause Analysis

Based on the AngularJS source (`manufacturing-welding-calculator.service.ts` lines 846-954), the cycle time calculation is:

```typescript
// Line 874: Get max weld element size from coreCostDetails (weld rows)
const maxWeldElementSize = weldingMaterialDetails.length > 0 
  ? Math.max(...weldingMaterialDetails.map((item) => item.coreWeight)) 
  : 0;

// Line 875: Calculate weld cross-sectional area  
const weldCrossSectionalArea = 2 * cuttingLength * maxWeldElementSize;

// Lines 880-892: Get disc brush diameter based on material type and area
let lookupListDia = getDiscBrushDia()
  ?.filter(x => x.materialType === materialType && x.partArea >= weldCrossSectionalArea)?.[0];

const discBrushDia = lookupListDia?.discBrush || 0;
const deburringRPM = lookupListDia?.cleaningRPM || 0;  // or prepRPM for WeldingPreparation

// Line 902-904: Calculate feed rates and passes
const feedPerREvRough = isValidNumber(discBrushDia / 2);
const feedPerREvFinal = isValidNumber(discBrushDia / 4);
const noOfPasses = isValidNumber(Math.ceil(maxWeldElementSize / discBrushDia));  // ⚠️ CRITICAL

// Line 910: Get reorientation time from lookup
const reorientaionTime = getUnloadingTime(materialInfonetWeight) || 0;

// Lines 912-923: Calculate noOfWeldPasses from weld details
noOfWeldPasses = weldingMaterialDetails.reduce(
  (sum, weldDetail) => sum + (
    weldDetail.coreArea === 1 
      ? weldDetail.coreVolume 
      : weldDetail.coreVolume * weldDetail.coreArea
  ), 
  0
);

// Line 925: Part handling time
const partHandlingTime = reorientaionTime + noOfWeldPasses * 5;

// Line 929-931: Calculate process time  
const term = 2 * (cuttingLength + 5) * noOfPasses * 60;
const roughTime = term / (feedPerREvRough * deburringRPM);
const finalTime = typeOfOperationId === 1 ? 0 : term / (feedPerREvFinal * deburringRPM);
const processTime = partHandlingTime + roughTime + finalTime;

// Line 945: Calculate cycle time with efficiency
const cycleTime = processTime / (efficiency / 100);
```

## Key Issues Identified

1. **`maxWeldElementSize` Source**: Must come from `weldingMaterialDetails[].coreWeight` (weld element size from material rows), NOT from `weldLegLength`

2. **`discBrushDia` Lookup**: If `discBrushDia` is 0 or invalid, the `noOfPasses` calculation will fail or return wrong values

3. **`noOfPasses` Calculation**: The formula `Math.ceil(maxWeldElementSize / discBrushDia)` is critical - if `discBrushDia` is 0, this will be Infinity or NaN

4. **Data Collection**: The `gatherManufacturingInfo` method needs to ensure it's collecting the correct `weldElement Size`, `cuttingLength`, and  `typeOfOperationId` from the UI

## Current Implementation Issues

In `welding-calculator.ts` (lines 1735-1740):
```typescript
const maxWeldElementSize =
  weldingMaterialDetails.length > 0
    ? Math.max(...weldingMaterialDetails.map((x: any) => Number(x.coreWeight) || 0))
    : Number(materialInfo?.weldElementSize) ||Number(materialInfo?.weldLegLength) ||
      0;
```

**This fallback is WRONG** - it should NOT fall back to `weldLegLength` as that's a different measurement.

In `welding-calculator.ts` (lines 1779-1784):
```typescript
const noOfPasses = Math.max(
  1,
  this.shareService.isValidNumber(
    Math.ceil(maxWeldElementSize / (discBrushDia || 1))
  )
);
```

**Problem**: Using `|| 1` as fallback for `discBrushDia` is masking the real issue - if `discBrushDia` is 0, the calculation will use 1 instead, which doubles the `noOfPasses`.

## Required Fixes

### 1. In `mig-welding-logic.ts` - Fix Data Collection

Ensure `weldElementSize` is collected correctly from the UI (already done in line 1345):
```typescript
const weldElementSize = await this.safeGetNumber(this.page.MatWeldElementSize1)
```

But we also need to ensure `coreCostDetails` array is populated correctly if using the DTO structure.

### 2. In `welding-calculator.ts` - Fix `maxWeldElementSize` Calculation  

**Lines 1735-1740** should be:
```typescript
const maxWeldElementSize =
  weldingMaterialDetails.length > 0
    ? Math.max(...weldingMaterialDetails.map((x: any) => Number(x.coreWeight) || 0))
    : Number(materialInfo?.weldElementSize) || 0;  // Remove weldLegLength fallback
```

### 3. In `welding-calculator.ts` - Add Validation Logging

**Before line 1779**, add:
```typescript
if (discBrushDia === 0) {
  logger.warn(`⚠️ discBrushDia is 0! weldCrossSectionalArea=${weldCrossSectionalArea}, materialType=${materialType}`);
  logger.warn(`⚠️ This will cause incorrect noOfPasses calculation`);
}
```

**Lines 1779-1784** should handle the zero case properly:
```typescript
const noOfPasses = discBrushDia > 0
  ? Math.max(1, this.shareService.isValidNumber(Math.ceil(maxWeldElementSize / discBrushDia)))
  : 1;  // Fallback to 1 pass if disc brush lookup failed
```

### 4. In `welding-calculator.ts` - Add Debug Logging

**After line 1832**, add comprehensive logging:
```typescript
logger.info(
  `   🔍 CYCLE TIME BREAKDOWN:\n` +
  `      • cuttingLength: ${manufactureInfo.cuttingLength}\n` +
  `      • maxWeldElementSize: ${maxWeldElementSize}\n` +
  `      • discBrushDia: ${discBrushDia}\n` +
  `      • noOfPasses: ${noOfPasses}\n` +
  `      • term: ${term}\n` +
  `      • partHandlingTime: ${partHandlingTime}\n` +
  `      • roughTime: ${roughTime}\n` +
  `      • finalTime: ${finalTime}\n` +
  `      • processTime: ${processTime}\n` +
  `      • efficiency: ${manufactureInfo.efficiency}\n` +
  `      • cycleTime: ${processTime / (Number(manufactureInfo.efficiency) / 100)}`
);
```

## Verification Steps

After implementing fixes:

1. Run the test with detailed logging to see actual values:
   ```powershell
   npx playwright test TC017 --headed --project=chromium
   ```

2. Check the console output for:
   - `maxWeldElementSize` value
   - `discBrushDia` value (should NOT be 0)
   - `noOfPasses` value
   - All intermediate calculations

3. Expected results:
   - Cycle Time should be close to 14.2857 seconds
   - All cost calculations should match

## Next Actions

1. ✅ Add logging to see current values
2. ✅ Fix `maxWeldElementSize` fallback
3. ✅ Fix `noOfPasses` calculation
4. ✅ Verify `discBrushDia` lookup is working
5. ✅ Re-run TC017

## Related Files
- `tests/utils/welding-calculator.ts` (main calculation logic)
- `tests/pages/mig-welding-logic.ts` (data collection)
- `tests/pages/mig-welding.page.ts` (UI locators)
- `src/app/modules/costing/services/manufacturing-welding-calculator.service.ts` (AngularJS source)
