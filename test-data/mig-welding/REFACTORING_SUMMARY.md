# MIG Welding Test Data Refactoring Summary

## Overview
Refactored MIG welding test data to separate concerns and use calculated values for sustainability metrics instead of hardcoded data.

## Changes Made

### 1. **New Modular Data Files Created**

#### `test-data/mig-welding/sustainability.ts`
- **Purpose**: Contains sustainability-related constants and calculation helpers
- **Features**:
  - Base CO2 emission factors (material and electricity)
  - Helper functions for dynamic sustainability calculations
  - Uses `SustainabilityCalculator` for accurate calculations
  - Provides both static reference values and dynamic calculation methods

#### `test-data/mig-welding/scenarios.ts`
- **Purpose**: Specific manufacturing test scenarios
- **Features**:
  - `SpecificManufacturingScenario` with all manufacturing parameters
  - Uses `calculatePowerCost()` and `calculateManufacturingCO2()` for dynamic values
  - Sample data for testing specific manufacturing conditions

### 2. **Updated `mig-welding-testdata.ts`**

#### Imports Added:
- `SustainabilityCalculator` from test utils
- Re-exports for modular data files (sustainability.ts, scenarios.ts)

#### Sustainability Material Section:
**Before**: Hardcoded values
```typescript
export const SustainabilityMaterial = {
  co2PerKgMaterial: 13.7958,
  co2PerScrap: 13.7958,
  co2PerPart: 0.3713  // ❌ Hardcoded
} as const
```

**After**: Calculated values
```typescript
const materialSustainabilityCalc = SustainabilityCalculator.calculateMaterialSustainability({
  esgImpactCO2Kg: BaseCO2PerKg,
  esgImpactCO2KgScrap: BaseCO2PerScrap,
  grossWeight: MaterialCostDetails.weldBeadWeightWithWastage,
  scrapWeight: MaterialCostDetails.weldBeadWeightWithWastage - MaterialCostDetails.totalWeldMaterialWeight,
  netWeight: MaterialCostDetails.totalWeldMaterialWeight,
  eav: PartInformation.annualVolumeQty
})

export const SustainabilityMaterial = {
  co2PerKgMaterial: BaseCO2PerKg,
  co2PerScrap: BaseCO2PerScrap,
  co2PerPart: Number(materialSustainabilityCalc.esgImpactCO2KgPart.toFixed(4))  // ✅ Calculated
}
```

#### Manufacturing Details Section:
**Added**:
- `powerConsumption: 14` (kW)
- `powerUnitCost: 0.132` ($ per kWh)

#### Sustainability Manufacturing Section:
**Before**: Hardcoded values
```typescript
export const SustainabilityManufacturing = {
  co2PerKwHr: 1.7317,
  co2PerPart: 0.0119  // ❌ Hardcoded
} as const
```

**After**: Calculated values
```typescript
const totalPowerCostCalculated = Number(
  calculatePowerCost(
    CycleTimeDetails.totalWeldCycleTime,
    ManufacturingDetails.powerConsumption,
    ManufacturingDetails.powerUnitCost
  ).toFixed(4)
)

const manufacturingCO2Calculated = Number(
  calculateManufacturingCO2(
    CycleTimeDetails.totalWeldCycleTime,
    ManufacturingDetails.powerConsumption,
    BaseCO2PerKwHr
  ).toFixed(4)
)

export const SustainabilityManufacturing = {
  co2PerKwHr: BaseCO2PerKwHr,
  co2PerPart: manufacturingCO2Calculated,  // ✅ Calculated
  totalPowerCost: totalPowerCostCalculated  // ✅ Calculated
}
```

### 3. **Updated `test-data/mig-welding/index.ts`**
- Added imports for `SustainabilityMaterial` and `SustainabilityManufacturing` from sustainability.ts
- Added import for `SpecificManufacturingScenario` from scenarios.ts
- Removed `SustainabilityManufacturing` from manufacturing.ts imports
- Added `specificManufacturingScenario` to exported test data object

### 4. **Updated Test Spec File**
- Updated imports to use `MigWeldingTestData` centralized object
- All test data now accessed via `MigWeldingTestData.{category}.{field}`
- Example: `MigWeldingTestData.sustainabilityMaterial.co2PerPart`

## Calculation Functions Used

### From `welding-calculator.ts`:
1. **`calculatePowerCost(cycleTime, powerKW, costPerKWh)`**
   - Calculates total power cost per part
   - Formula: `(cycleTime / 3600) * powerKW * costPerKWh`

2. **`calculateManufacturingCO2(cycleTime, powerKW, co2PerKWh)`**
   - Calculates CO2 emissions per part from manufacturing
   - Formula: `(cycleTime / 3600) * powerKW * co2PerKWh`

### From `SustainabilityCalculator.ts`:
1. **`calculateMaterialSustainability()`**
   - Calculates material-related CO2 metrics
   - Includes: CO2 per part, annual CO2, etc.

2. **`calculateManufacturingSustainability()`**
   - Calculates manufacturing-related CO2 metrics
   - Includes: electricity consumption impact, factory impact, etc.

## Benefits

### ✅ **Accuracy**
- Values are now calculated using the same formulas as the application
- Eliminates manual calculation errors

### ✅ **Maintainability**
- Single source of truth for calculation logic
- Easy to update when formulas change

### ✅ **Testability**
- Test data reflects actual application behavior
- Easier to verify calculations

### ✅ **Modularity**
- Separated concerns (sustainability, scenarios, base data)
- Easier to find and update specific test data

### ✅ **Traceability**
- Clear link between input data and calculated results
- Comments explain the calculations

## Migration Guide

### For Existing Tests:
```typescript
// Old way
import { SustainabilityMaterial } from '../test-data/mig-welding-testdata'

// New way
import { MigWeldingTestData } from '../test-data/mig-welding'
const co2PerPart = MigWeldingTestData.sustainabilityMaterial.co2PerPart
```

### For New Tests:
```typescript
import { MigWeldingTestData } from '../test-data/mig-welding'
import { calculateMaterialSustainability } from '../test-data/mig-welding/sustainability'

// Use pre-calculated values
const co2 = MigWeldingTestData.sustainabilityManufacturing.co2PerPart

// Or calculate dynamically with custom values
const customCalc = calculateMaterialSustainability({
  grossWeight: 50,
  scrapWeight: 10,
  netWeight: 40,
  eav: 12000
})
```

## Files Modified

1. ✅ `test-data/mig-welding-testdata.ts` - Updated with calculations
2. ✅ `test-data/mig-welding/sustainability.ts` - New file with sustainability helpers
3. ✅ `test-data/mig-welding/scenarios.ts` - New file with specific scenarios
4. ✅ `test-data/mig-welding/index.ts` - Updated to export new modules
5. ✅ `tests/costing_mig-welding.spec.ts` - Updated to use centralized data

## Next Steps

1. ✅ Verify all tests pass with new calculated values
2. ✅ Update other test scenarios to use calculation functions
3. ✅ Consider creating similar modular structure for other welding types
4. ✅ Document any formula discrepancies found during testing
