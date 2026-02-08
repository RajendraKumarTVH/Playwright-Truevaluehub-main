# Machine Details Integration for Manufacturing Sustainability

## Overview
Successfully integrated comprehensive **Machine Details** data collection into the manufacturing sustainability calculations. This enhancement captures all relevant machine information including power consumption, costs, lifespan, and labor requirements for accurate ESG (Environmental, Social, and Governance) impact assessment.

## Machine Details Fields Captured

### 1. Power & Utilization
- **Rated Power (kW)**: Machine's rated power consumption
- **Power Utilization (%)**: Percentage of rated power actually used during operation
- **Average Machine Utilization (%)**: Overall machine usage efficiency

### 2. Cost & Lifespan
- **Investment Cost (USD)**: Initial machine purchase cost
- **Installation Cost (USD)**: Cost to install and set up the machine
- **Machine Lifespan (Years)**: Expected operational lifetime
- **Years Installed**: How long the machine has been in operation
- **Annual Maintenance Cost (USD)**: Yearly maintenance expenses
- **Annual Supplies Cost (USD)**: Yearly consumables and supplies

### 3. Labor Assumptions
- **Low-Skilled Laborers Needed**: Number of low-skilled workers required
- **Semi-Skilled Laborers Needed**: Number of semi-skilled workers required
- **High-Skilled Laborers Needed**: Number of high-skilled workers required

## Implementation Details

### Page Object Locators (`mig-welding.page.ts`)

```typescript
// Machine Details - Power & Utilization
readonly RatedPower: Locator
readonly PowerUtil: Locator
readonly AvgMachineUtil: Locator

// Machine Details - Cost & Lifespan
readonly InvestmentCost: Locator
readonly InstallationCost: Locator
readonly MachineLifespan: Locator
readonly YearsInstalled: Locator
readonly AnnualMaintenanceCost: Locator
readonly AnnualSuppliesCost: Locator

// Machine Details - Labor Assumptions
readonly LowSkilledLaborersNeeded: Locator
readonly SemiSkilledLaborersNeeded: Locator
readonly HighSkilledLaborersNeeded: Locator
```

### Locator Strategies

**Power & Utilization:**
- Rated Power: `//input[@placeholder="Rated Power (kWh)"]`
- Power Utilization: `//input[@placeholder="Power Utilization (%)"]`
- Avg Machine Utilization: `(//span[normalize-space(text())="Average Machine Utilization (%)"]/following::input)[1]`

**Cost & Lifespan:**
- All use `getByPlaceholder()` with exact placeholder text

**Labor Assumptions:**
- All use `getByPlaceholder()` with exact placeholder text

### Data Collection Flow

1. **Navigate to Machine Details Tab**
   ```typescript
   await this.page.MachineDetailsTab.click()
   await this.page.wait(500) // Buffer for tab switch
   ```

2. **Read All Fields**
   ```typescript
   const totalPowerKW = await this.page.readNumberSafe(this.page.RatedPower, 'Rated Power')
   const powerUtilization = await this.page.readNumberSafe(this.page.PowerUtil, 'Power Utilization')
   // ... (all other fields)
   ```

3. **Log Summary**
   ```typescript
   logger.info(`💡 Machine Details Summary:`)
   logger.info(`   Power: ${totalPowerKW} KW @ ${powerUtilization}% utilization`)
   logger.info(`   Investment: $${investmentCost}, Lifespan: ${machineLifespan} years`)
   logger.info(`   Labor: Low=${lowSkilledLaborers}, Semi=${semiSkilledLaborers}, High=${highSkilledLaborers}`)
   ```

4. **Store in machineMaster Object**
   ```typescript
   machineMaster: {
     // Power & Utilization
     totalPowerKW: totalPowerKW,
     powerUtilization: powerUtilization,
     avgMachineUtilization: avgMachineUtil,
     // Cost & Lifespan
     investmentCost: investmentCost,
     installationCost: installationCost,
     machineLifespan: machineLifespan,
     yearsInstalled: yearsInstalled,
     annualMaintenanceCost: annualMaintenanceCost,
     annualSuppliesCost: annualSuppliesCost,
     // Labor Assumptions
     lowSkilledLaborersNeeded: lowSkilledLaborers,
     semiSkilledLaborersNeeded: semiSkilledLaborers,
     highSkilledLaborersNeeded: highSkilledLaborers
   }
   ```

## Sustainability Calculations

### Power-Based ESG Impact
```
esgImpactElectricityConsumption = totalPowerKW × (powerUtilization / 100) × powerESG
```

Where:
- `totalPowerKW`: From Machine Details → Rated Power
- `powerUtilization`: From Machine Details → Power Utilization (%)
- `powerESG`: CO2 emissions factor (kg CO2/kWh) from labor rate data

### Potential Future Calculations

With the comprehensive Machine Details data, additional sustainability metrics can be calculated:

1. **Machine Depreciation Impact**
   ```
   annualDepreciation = (investmentCost + installationCost) / machineLifespan
   depreciationPerPart = annualDepreciation / annualProduction
   ```

2. **Total Cost of Ownership (TCO)**
   ```
   annualTCO = annualDepreciation + annualMaintenanceCost + annualSuppliesCost
   ```

3. **Labor Efficiency**
   ```
   totalLaborCost = (lowSkilled × lowRate) + (semiSkilled × semiRate) + (highSkilled × highRate)
   laborCostPerPart = totalLaborCost × cycleTime / 3600
   ```

4. **Machine Utilization Efficiency**
   ```
   utilizationEfficiency = avgMachineUtilization / 100
   effectivePowerConsumption = totalPowerKW × powerUtilization × utilizationEfficiency
   ```

## Files Modified

### 1. `mig-welding.page.ts`
**Changes:**
- Added 13 new locators for Machine Details fields
- Organized into logical groups (Power, Cost, Labor)
- All locators initialized in constructor

### 2. `mig-welding-logic.ts`
**Changes:**
- Enhanced `gatherManufacturingInfo()` method
- Reads all Machine Details fields
- Logs comprehensive summary
- Populates `machineMaster` object with complete data

## Usage in Tests

The Machine Details data is automatically collected during the `gatherManufacturingInfo()` call and is available in the `manufactureInfo` object for all subsequent calculations and verifications.

```typescript
// Example: Access in sustainability verification
const machineData = manufactureInfo.machineMaster
const powerESG = machineData.totalPowerKW * (machineData.powerUtilization / 100) * 0.5
```

## Benefits

1. **Comprehensive Data**: All machine-related information captured in one place
2. **Sustainability Insights**: Enables detailed ESG impact analysis
3. **Cost Analysis**: Supports TCO and depreciation calculations
4. **Labor Planning**: Tracks labor requirements for capacity planning
5. **Reusability**: Data structure can be used across all manufacturing processes
6. **Traceability**: Complete audit trail of machine parameters

## Next Steps

1. **Implement Advanced Calculations**: Use the collected data for:
   - Machine depreciation per part
   - Total Cost of Ownership (TCO)
   - Labor efficiency metrics
   - Utilization-adjusted power consumption

2. **Cross-Process Validation**: Ensure consistency across:
   - Welding processes (MIG, TIG, Stick, etc.)
   - Plastic & Rubber processes
   - Casting processes
   - Machining processes

3. **Data Validation**: Add validation rules for:
   - Reasonable power consumption ranges
   - Lifespan vs years installed
   - Labor count reasonableness

4. **Reporting**: Create comprehensive sustainability reports using:
   - Power consumption trends
   - Cost efficiency metrics
   - Labor utilization analysis

## Related Files

- **Page Object**: `c:\Playwright Projects\Playwright-Truevaluehub-main\tests\pages\mig-welding.page.ts`
- **Test Logic**: `c:\Playwright Projects\Playwright-Truevaluehub-main\tests\pages\mig-welding-logic.ts`
- **Calculator**: `c:\Playwright Projects\Playwright-Truevaluehub-main\tests\utils\welding-calculator.ts`
- **Application HTML**: `c:\TVH Project\truevaluehub-ui\src\app\modules\costing\components\costing-manufacturing-information\machine-details\machine-details.component.html`

## Test Execution

The Machine Details data collection is integrated into:
- **Method**: `gatherManufacturingInfo()`
- **Called by**: All manufacturing cost verification tests
- **Spec File**: `costing_mig-welding.spec.ts`

The data is automatically logged during test execution for easy debugging and verification.
