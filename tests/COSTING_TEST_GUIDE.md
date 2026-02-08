# Playwright Costing Test Suite - Complete Conversion Guide

## 📋 Overview

This document describes the comprehensive Playwright-based costing automation test framework that replaces legacy AngularJS/Karma unit tests with modern E2E testing capabilities.

## ✅ What Was Converted

### From (Legacy AngularJS/Karma):

- `tests/costing/components/**/*.component.spec.ts` - Jasmine component tests
- `tests/costing/services/**/*.service.spec.ts` - Service unit tests
- Manual test scenarios documented in various formats

### To (Playwright E2E):

- **[costing.page.ts](./pages/costing.page.ts)** - Central Page Object Model for all costing UI interactions
- **[costing-logic.ts](./pages/costing-logic.ts)** - Business logic for cost calculations and verifications
- **[costing-test-data.ts](./utils/costing-test-data.ts)** - Test data and scenarios for multiple manufacturing processes
- **[costing-unified.spec.ts](./costing-unified.spec.ts)** - Comprehensive E2E test suite

## 🏗️ Architecture

### 1. CostingPage (Page Object Model)

**File**: `tests/pages/costing.page.ts`

Provides centralized UI element locators and helper methods:

```typescript
// Locators for all costing sections
- Part Information (BOMQty, AnnualVolume, ProductLife, etc.)
- Material Information (Material type, price, density, etc.)
- Manufacturing Information (Machine, efficiency, rates, etc.)
- Cost Calculations (Machine, Labor, Setup, QA, Power, etc.)
- Cycle Time (CycleTime, DryCycleTime, LoadingUnloadingTime, etc.)

// Helper Methods
- getInputValue()          // Read input field values
- getInputAsNum()          // Read numeric values
- fillInput()              // Fill form fields
- selectOption()           // Select dropdown options
- getSelectedOptionText()  // Get selected dropdown text
- verifyUIValue()          // Verify calculated vs UI values
```

**Usage Example**:

```typescript
const costingPage = new CostingPage(page, context)

// Read values
const cycleTime = await costingPage.getInputAsNum(costingPage.CycleTime)
const materialPrice = await costingPage.getInputAsNum(costingPage.MaterialPrice)

// Verify values
await costingPage.verifyUIValue({
	locator: costingPage.NetMaterialCost,
	expectedValue: 150.5,
	label: 'Net Material Cost',
	precision: 2
})
```

### 2. CostingLogic (Business Logic)

**File**: `tests/pages/costing-logic.ts`

Implements all costing calculations and verifications:

```typescript
// Material Calculations
;-verifyNetWeight() - // (partVolume * density) / 1000
	verifyNetMaterialCost() - // (netWeight / 1000) * materialPrice
	// Manufacturing Cost Calculations
	verifyDirectMachineCost() - // (machineHourRate / 3600) * cycleTime
	verifyDirectLaborCost() - // (laborRate / 3600) * cycleTime
	verifyDirectSetupCost() - // ((machRate + laborRate) * setupTime/60) / lotSize
	verifyQAInspectionCost() - // (qaRate/60) * inspTime * (samplingRate/100) / lotSize
	verifyPowerCost() - // (cycleTime/3600) * powerConsumption * electricityUnitCost
	verifyYieldCost() - // (1 - yieldPer/100) * (netMatCost + processCost)
	// Summary Verifications
	verifyNetProcessCost() - // Sum of all process costs
	verifyTotalCost() - // Material + Process + Yield costs
	verifyAllCostCalculations() - // Complete verification suite
	collectCostSummary() // Gather all costs for reporting
```

**Usage Example**:

```typescript
const costingLogic = new CostingLogic(costingPage)

// Single calculation verification
await costingLogic.verifyDirectMachineCost((precision = 2))

// Complete verification with automatic calculations
const result = await costingLogic.verifyAllCostCalculations({
	precision: 2,
	debug: true
})

console.log(result)
// {
//   directMachineCost: 45.23,
//   directLaborCost: 32.15,
//   directSetupCost: 5.60,
//   inspectionCost: 3.45,
//   yieldCost: 12.80,
//   powerCost: 8.90,
//   totalProcessCost: 108.13,
//   totalCost: 523.48
// }
```

### 3. CostingTestData (Test Scenarios)

**File**: `tests/utils/costing-test-data.ts`

Predefined test scenarios for various manufacturing processes:

```typescript
// Available Scenarios
- MIG_WELDING_BASIC       // Basic MIG welding ($50-$500 cost range)
- MIG_WELDING_ADVANCED    // Advanced MIG with stainless steel
- SHEET_METAL_BASIC       // Basic sheet metal (aluminum)
- SHEET_METAL_COMPLEX     // Complex sheet metal (steel coil)
- MACHINING_BASIC         // CNC machining (aluminum billets)
- CASTING_BASIC           // Casting operations

// Helper Methods
- getScenariosByProcess()   // Get all scenarios for a process
- getAllScenarios()         // Get all available scenarios
- getSmokeTestScenarios()   // Get @smoke tagged scenarios
- getRegressionScenarios()  // Get @regression tagged scenarios
- getE2EScenarios()         // Get @e2e tagged scenarios

// Configuration
COSTING_TEST_CONFIG:
  - baseUrl (qa.truevaluehub.com)
  - timeout (60000 ms)
  - browser (msedge)
  - headless (configurable)
  - userProfilePath
  - authStatePath
```

**Usage Example**:

```typescript
import {
	CostingTestData,
	ManufacturingProcess
} from './utils/costing-test-data'

// Get specific scenario
const scenario = CostingTestData.MIG_WELDING_BASIC
console.log(scenario.projectId) // "14783"
console.log(scenario.materialInformation) // { processGroup, category, family... }

// Get all scenarios
const allScenarios = CostingTestData.getAllScenarios()

// Get by process type
const migScenarios = CostingTestData.getScenariosByProcess(
	ManufacturingProcess.MIG_WELDING
)

// Filter by tags
const smokeTests = CostingTestData.getSmokeTestScenarios()
```

### 4. CostingUnifiedSpec (E2E Test Suite)

**File**: `tests/costing-unified.spec.ts`

Comprehensive test suite covering all manufacturing processes:

```typescript
// Test Structure
test.describe.serial('Costing - Unified E2E Suite', () => {
  test.beforeAll()    // Setup browser and login
  test.afterAll()     // Cleanup and generate report

  // MIG Welding Tests
  test('MIG-001: Basic MIG Welding Cost Calculation @smoke @mig')
  test('MIG-002: Advanced MIG Welding Cost Calculation @regression @mig')

  // Sheet Metal Tests
  test('SM-001: Basic Sheet Metal Cost Calculation @smoke @sheetmetal')
  test('SM-002: Complex Sheet Metal Cost Calculation @regression @sheetmetal')

  // Machining Tests
  test('MACH-001: Basic Machining Cost Calculation @smoke @machining')

  // Casting Tests
  test('CAST-001: Basic Casting Cost Calculation @smoke @casting')

  // Smoke Test Suite (Dynamic)
  test.describe('Smoke Tests - Quick Validation')
    // Automatically generates tests for all @smoke tagged scenarios
})

// Test Results
- Results saved to: test-results/costing-report.json
- Screenshots on failure: screenshots/
- Test logs: *.log files
```

## 🚀 Running Tests

### Prerequisites

```bash
# Install dependencies
npm install

# Ensure browser profiles exist or are auto-created
# Ensure environment configured with valid base URL and credentials
```

### Run All Costing Tests

```bash
npx playwright test costing-unified.spec.ts --headed
```

### Run Specific Suite

```bash
# MIG Welding tests only
npx playwright test costing-unified.spec.ts -g "MIG Welding"

# Sheet Metal tests only
npx playwright test costing-unified.spec.ts -g "Sheet Metal"
```

### Run by Tags

```bash
# Smoke tests only
npx playwright test costing-unified.spec.ts --grep "@smoke"

# Regression tests only
npx playwright test costing-unified.spec.ts --grep "@regression"

# E2E tests only
npx playwright test costing-unified.spec.ts --grep "@e2e"
```

### Run with Debug

```bash
# Visual debug mode
npx playwright test costing-unified.spec.ts --headed --debug

# Verbose logging
npx playwright test costing-unified.spec.ts --headed --reporter=verbose
```

### Generate HTML Report

```bash
npx playwright show-report
```

## 📊 Test Scenarios

### MIG Welding

- **MIG-001** (Smoke, E2E): Basic manual MIG welding with carbon steel
  - Expected: $50-$500 total cost range
  - Cycle time verification
  - Material cost calculation

- **MIG-002** (Regression): Advanced semi-automatic MIG with stainless steel
  - Expected: $500-$6000 total cost range
  - Complex cost breakdown
  - Range validation

### Sheet Metal

- **SM-001** (Smoke, E2E): Basic aluminum sheet metal operations
  - Expected: $150-$3000 range
  - Press machine operations
  - Complex material properties

- **SM-002** (Regression): Complex steel coil operations
  - Expected: $600-$12000 range
  - Automatic machine efficiency testing
  - Large volume calculations

### Machining

- **MACH-001** (Smoke, E2E): CNC aluminum machining
  - Expected: $300-$5000 range
  - Setup time calculations
  - Tool wear considerations

### Casting

- **CAST-001** (Smoke): Aluminum foundry casting
  - Expected: $500-$10000 range
  - High setup times
  - Material properties

## 🔧 Integration with Existing Tests

### Compatible with Current Framework

The new Playwright costing tests integrate seamlessly with:

- Existing `costing_mig-welding.spec.ts` ✅
- Existing `costing_sheet-metal.spec.ts` ✅
- `LoginPage` from pageFactory ✅
- Logger utilities ✅
- Screenshot on failure ✅

### Can Run Alongside

```bash
# Run all costing tests including unified suite
npx playwright test "**/costing*.spec.ts"

# Run MIG welding tests (both legacy and unified)
npx playwright test "costing_mig-welding.spec.ts" "costing-unified.spec.ts"
```

## 📈 Test Result Reporting

### JSON Report

Generated at: `test-results/costing-report.json`

```json
{
  "timestamp": "2025-02-08T10:30:45.123Z",
  "summary": {
    "total": 7,
    "passed": 7,
    "failed": 0,
    "skipped": 0,
    "successRate": "100%"
  },
  "details": [
    {
      "scenario": "MIG-001",
      "process": "MIG Welding",
      "result": "PASSED",
      "costs": {
        "directMachineCost": 45.23,
        "directLaborCost": 32.15,
        ...
      }
    }
  ]
}
```

### HTML Reports

```bash
# View Playwright HTML report
npx playwright show-report

# View in test results folder
open test-results/costing-report.json
```

## 🎯 Key Improvements Over Legacy Tests

| Aspect                | Legacy (Karma/Jasmine)    | Playwright (New)         |
| --------------------- | ------------------------- | ------------------------ |
| **Testing Type**      | Unit tests (isolated)     | E2E tests (real browser) |
| **UI Interaction**    | Limited component testing | Full UI automation       |
| **Cost Calculations** | Mock data only            | Actual UI verification   |
| **Cross-browser**     | Single browser            | Multi-browser support    |
| **Screenshots**       | Not built-in              | Automatic on failure     |
| **Reporting**         | Console output            | HTML + JSON reports      |
| **Maintenance**       | Hard to maintain          | Centralized locators     |
| **Execution Time**    | Fast (mocks)              | Real-world timing        |
| **Reliability**       | Flaky (isolated)          | Stable (integrated)      |

## 🛠️ Customization Guide

### Adding New Scenario

```typescript
// In costing-test-data.ts
static readonly NEW_PROCESS_BASIC: CostingTestScenario = {
  processName: ManufacturingProcess.NEW_PROCESS,
  projectId: '14790',
  partInformation: {
    internalPartNumber: 'NEW-TEST-001',
    // ... other properties
  },
  // ... complete scenario definition
  tags: ['@smoke', '@e2e']
};
```

### Adding New Test Case

```typescript
// In costing-unified.spec.ts
test('NEW-001: New Process Cost Calculation @smoke @new', async () => {
	const scenario = CostingTestData.NEW_PROCESS_BASIC

	await runStep('Navigate to Project', async () => {
		await navigateToScenarioProject(scenario.projectId)
	})

	await runStep('Verify New Process Costs', async () => {
		const costs = await costingLogic.verifyAllCostCalculations()
		// Add specific assertions
	})
})
```

### Extending CostingLogic

```typescript
// In costing-logic.ts
async verifyCustomCalculation(): Promise<number> {
  logger.info('🔹 Verifying Custom Calculation');

  // Your custom logic
  const result = await this.page.getInputAsNum(this.page.SomeLocator);

  // Verification
  await this.page.verifyUIValue({
    locator: this.page.ResultLocator,
    expectedValue: result,
    label: 'Custom Calculation'
  });

  return result;
}
```

## 📝 Best Practices

1. **Use Tags**: Always tag tests appropriately (@smoke, @regression, @e2e)
2. **Isolate Scenarios**: Each test should be independent and runnable standalone
3. **Precision Handling**: Use appropriate precision (2-4 decimal places) for cost comparisons
4. **Error Handling**: Always wrap steps with `runStep()` for consistent error handling
5. **Logging**: Use Logger for all status updates and debugging
6. **Screenshots**: Enable on failure for troubleshooting
7. **Test Data**: Use centralized test data from `CostingTestData` class
8. **Timeout Handling**: Respect global timeout but override where needed

## 🐛 Troubleshooting

### Issue: Tests timeout

**Solution**: Increase timeout in `COSTING_TEST_CONFIG` or specific test

```typescript
test('Long test', { timeout: 120000 }, async () => {
	// Test code
})
```

### Issue: Login fails

**Solution**: Ensure auth profile is present or regenerate

```bash
# Clear profile and let test recreate it
rm -rf ./user-profile-costing
npx playwright test costing-unified.spec.ts --headed
```

### Issue: Cost verification fails

**Solution**: Check precision parameter or enable debug mode

```typescript
const costs = await costingLogic.verifyAllCostCalculations({
	precision: 4, // Increase precision
	debug: true // Enable detailed logging
})
```

### Issue: Screenshots not saved

**Solution**: Ensure screenshots directory exists

```bash
mkdir -p screenshots test-results
```

## 📞 Support & Documentation

- **Costing Calculations Logic**: See comments in `costing-logic.ts`
- **UI Locators Reference**: See locators in `costing.page.ts`
- **Test Scenarios**: See definitions in `costing-test-data.ts`
- **Example Usage**: See tests in `costing-unified.spec.ts`

---

**Last Updated**: February 8, 2026
**Version**: 1.0
**Status**: Production Ready ✅
