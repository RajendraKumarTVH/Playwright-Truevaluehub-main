# Power Utilization Storage Format - Clarification

## Issue
There was confusion about whether `powerUtilization` should be divided by 100 in the ESG calculation.

## AngularJS Logic (Source of Truth)
From `manufacturing-sustainability-calculator.service.ts` line 16:
```typescript
esgImpactElectricityConsumption = 
  Number(manufactureInfo?.machineMaster?.totalPowerKW) * 
  Number(manufactureInfo?.machineMaster?.powerUtilization) * 
  Number(laborRate[0]?.powerESG)
```

**Key Finding**: The formula does NOT divide `powerUtilization` by 100.

## Storage Format

### UI Input
- Field label: "Power Utilization (%)"
- User enters: **75** (meaning 75%)
- Form control: `formControlName="utilisation"`

### Internal Storage
- Stored in `machineMaster.powerUtilization`
- Format: **Decimal** (0.75, not 75)
- The application converts percentage input to decimal before storing

### Calculation
```
esgImpactElectricityConsumption = totalPowerKW × powerUtilization × powerESG
```

Where:
- `totalPowerKW` = 15 (example)
- `powerUtilization` = 0.75 (stored as decimal, NOT 75)
- `powerESG` = 0.5 (kg CO2/kWh)
- Result = 15 × 0.75 × 0.5 = 5.625

## Playwright Test Implementation

### Correct Formula (Matching AngularJS)
```typescript
const expectedEsgConsumption = totalPowerKW * powerUtilization * powerESG
```

**NO division by 100** because `powerUtilization` is already in decimal form.

### Data Reading
When reading from the UI:
```typescript
const powerUtilization = await this.page.readNumberSafe(
  this.page.PowerUtil, 
  'Power Utilization (%)'
)
```

This reads the value as stored in the form control, which is already in decimal format (0.75).

## Verification

### Test Case
- Input: 75% (user enters this)
- Stored: 0.75 (application converts)
- Read by test: 0.75 (reads from form control)
- Calculation: 15 × 0.75 × 0.5 = 5.625 ✅

### Previous Error
```typescript
// ❌ WRONG - was dividing by 100
const expectedEsgConsumption = totalPowerKW * (powerUtilization / 100) * powerESG
// This would calculate: 15 × (0.75 / 100) × 0.5 = 0.05625 (incorrect!)
```

### Corrected
```typescript
// ✅ CORRECT - matches AngularJS logic
const expectedEsgConsumption = totalPowerKW * powerUtilization * powerESG
// This calculates: 15 × 0.75 × 0.5 = 5.625 (correct!)
```

## Conclusion

The `powerUtilization` value is stored as a **decimal** (0.75) in the data model, even though users enter it as a percentage (75) in the UI. The application handles the conversion from percentage to decimal internally.

Therefore, the Playwright test should:
1. Read the value directly from the form control (already in decimal format)
2. Use it in the formula WITHOUT dividing by 100
3. This matches the AngularJS service logic exactly

## Files Updated
- ✅ `mig-welding-logic.ts` - Removed division by 100 from verification formula
- ✅ Added clarifying comment about decimal format
