# Welding ESG Implementation Summary

## Overview
Successfully implemented ESG (Environmental, Social, and Governance) power consumption calculations for welding processes in both the application logic and Playwright test framework.

## Formula Implemented
```
esgImpactElectricityConsumption = totalPowerKW × powerUtilization × powerESG
```

Where:
- **totalPowerKW**: Machine's rated power in kilowatts (from `machineMaster.totalPowerKW`)
- **powerUtilization**: Percentage of power actually used (from `machineMaster.powerUtilization`)
- **powerESG**: CO2 emissions factor in kg/kWh (from `laborRate[0].powerESG`)

## Files Modified

### 1. Application Logic (`welding-calculator.ts`)
**Location**: `c:\Playwright Projects\Playwright-Truevaluehub-main\tests\utils\welding-calculator.ts`

**Changes**:
- Added ESG calculation to `weldingCommonCalc` method (lines 1121-1126)
- Added ESG calculation to `weldingPreCalc` method (lines 1746-1754)
- Added ESG calculation to `calculationsForWeldingPreparation` method (lines 1338-1346)
- Added ESG calculation to `calculationsForWeldingCleaning` method (lines 1409-1413)

**Impact**: All welding process types (MIG, TIG, Stick, Spot, Seam, Preparation, Cleaning) now calculate power-based ESG impact.

### 2. Page Object Model (`mig-welding.page.ts`)
**Location**: `c:\Playwright Projects\Playwright-Truevaluehub-main\tests\pages\mig-welding.page.ts`

**Changes**:
- Added `RatedPower` locator: `page.locator('input[formcontrolname="powerSupply"]')`
- Added `PowerUtilization` locator: `page.locator('input[formcontrolname="utilisation"]')`
- Added `EsgImpactElectricityConsumption` locator: `page.locator('#esgImpactElectricityConsumption')`
- Added `EsgImpactAnnualUsageHrs` locator: `page.locator('#esgImpactAnnualUsageHrs')`
- Added `EsgImpactAnnualKgCO2` locator: `page.locator('#esgImpactAnnualKgCO2')`
- Added `EsgImpactAnnualKgCO2Part` locator: `page.locator('#esgImpactAnnualKgCO2Part')`
- Added `SustainabilityTab` locator: `page.getByRole('tab', { name: 'Sustainability' })`

### 3. Test Logic (`mig-welding-logic.ts`)
**Location**: `c:\Playwright Projects\Playwright-Truevaluehub-main\tests\pages\mig-welding-logic.ts`

**Changes**:
- Updated `gatherManufacturingInfo` to read power data from Machine Details tab
- Modified `machineMaster` object to include `totalPowerKW` and `powerUtilization`
- Added `verifySustainabilityCalculations` method to validate ESG metrics
- Updated `verifyManufacturingSustainability` to navigate to Machine Details and verify power ESG

### 4. Interfaces (`welding-calculator.page.ts`)
**Location**: `c:\Playwright Projects\Playwright-Truevaluehub-main\tests\pages\welding-calculator.page.ts`

**Changes**:
- Added sustainability-related locators to `WeldingPage` class

## Data Flow

### Application Side
1. User enters **Rated Power (KW)** in Machine Details tab → stored as `powerSupply` form control
2. User enters **Power Utilization (%)** in Machine Details tab → stored as `utilisation` form control
3. System retrieves **powerESG** from labor rate data based on country/region
4. Calculation runs: `esgImpactElectricityConsumption = totalPowerKW × powerUtilization × powerESG`
5. Result displayed in Sustainability tab

### Test Side
1. Test navigates to Machine Details tab
2. Reads `totalPowerKW` from `input[formcontrolname="powerSupply"]`
3. Reads `powerUtilization` from `input[formcontrolname="utilisation"]`
4. Uses default `powerESG = 0.5` (typical grid electricity CO2 factor)
5. Calculates expected value: `expectedESG = totalPowerKW × (powerUtilization / 100) × powerESG`
6. Navigates to Sustainability tab
7. Reads actual value from `#esgImpactElectricityConsumption`
8. Verifies actual vs expected with 4 decimal precision

## Form Control Names (Angular)
Based on the application HTML:
- **Rated Power**: `formControlName="powerSupply"` (found in casting and forging processes)
- **Power Utilization**: `formControlName="utilisation"` (found in casting melting process)

## Test Execution
The ESG verification is integrated into the existing test suite:
- **Test Case**: TC012 - Verify Manufacturing Sustainability
- **Method**: `verifyManufacturingSustainability()`
- **Spec File**: `costing_mig-welding.spec.ts`

## Notes
1. **powerESG Default**: Currently using 0.5 kg CO2/kWh as a default value in tests. In production, this comes from `laborRate[0].powerESG` based on the country's energy grid composition.

2. **Power Utilization**: The formula divides by 100 because the UI stores it as a percentage (e.g., 75%), but the calculation needs it as a decimal (0.75).

3. **Conditional Verification**: The test only verifies ESG if power data is available (both totalPowerKW and powerUtilization > 0), preventing false failures.

4. **Tab Navigation**: The test must navigate to Machine Details tab to read power data, then to Sustainability tab to verify results.

## Future Enhancements
1. **Dynamic powerESG**: Retrieve actual powerESG from labor rate API/database instead of using hardcoded default
2. **Additional ESG Metrics**: Implement verification for:
   - `esgImpactAnnualUsageHrs`
   - `esgImpactAnnualKgCO2`
   - `esgImpactAnnualKgCO2Part`
3. **Cross-Process Validation**: Ensure ESG calculations are consistent across all manufacturing processes (Plastic & Rubber, Casting, Forging, etc.)

## Related Files
- Application ESG Service: `c:\TVH Project\truevaluehub-ui\src\app\modules\costing\services\manufacturing-sustainability-calculator.service.ts`
- Labor Rate Model: `c:\TVH Project\truevaluehub-ui\src\app\shared\models\labor-rate-master.model.ts`
- Machine Details Component: `c:\TVH Project\truevaluehub-ui\src\app\modules\costing\components\costing-manufacturing-information\machine-details\machine-details.component.html`
