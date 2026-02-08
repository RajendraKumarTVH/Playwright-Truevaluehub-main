# Overhead & Profit Cost Calculation Logic from AngularJS

## Overview
The **Overhead & Profit** cost is calculated in the AngularJS application and consists of three main components:
1. **Material Overhead (MOH)**
2. **Factory Overhead (FOH)**  
3. **SG&A (Selling, General & Administrative)**

## Source Files
- **Calculator Service**: `c:\TVH Project\truevaluehub-ui\src\app\modules\costing\services\costing-overhead-profit-calculator.service.ts`
- **Model**: `c:\TVH Project\truevaluehub-ui\src\app\shared\models\overhead-Profit.model.ts`
- **Display Component**: `c:\TVH Project\truevaluehub-ui\src\app\modules\costing\components\costing-cost-summary\costing-cost-summary.component.ts`

## Calculation Formula

The overhead cost is calculated in `costing-overhead-profit-calculator.service.ts` at **line 155-167**:

```typescript
// Material Overhead Cost (MOH)
const materialOverHeadCost = (getCostingOverHeadProfit.mohPer / 100) * materialCost || 0;
costingOverHeadProfit.mohCost = materialOverHeadCost;

// Factory Overhead Cost (FOH)
const factoryOverHeadCost = (getCostingOverHeadProfit.fohPer / 100) * Number(costSummaryViewData?.sumNetProcessCost);
costingOverHeadProfit.fohCost = factoryOverHeadCost;

// Calculate EX Cost Amount (Material + Process Cost)
const eXCostAmount = Number(materialCost) + Number(costSummaryViewData?.sumNetProcessCost) || 0;

// SG&A Cost
const SGACost = (getCostingOverHeadProfit.sgaPer / 100) * eXCostAmount || 0;
costingOverHeadProfit.sgaCost = SGACost;

// TOTAL OVERHEAD COST
const overHeadCost = materialOverHeadCost + factoryOverHeadCost + SGACost;
costingOverHeadProfit.OverheadandProfitAmount = overHeadCost;
```

### **Formula Breakdown:**

```
Material Overhead (MOH) = (mohPer / 100) × materialCost

Factory Overhead (FOH) = (fohPer / 100) × sumNetProcessCost

SG&A = (sgaPer / 100) × (materialCost + sumNetProcessCost)

Total Overhead & Profit = MOH + FOH + SG&A
```

## Additional Components (Not in Main Overhead Cost)

The model also tracks these separately (**NOT included in OverheadandProfitAmount**):

### 1. **Inventory Carrying Cost** (Line 149-150)
```typescript
const inventoryCarryingCost = rawMaterialCost + finishGoodCost;
costingOverHeadProfit.InventoryCarryingAmount = inventoryCarryingCost;
```

Where:
- `rawMaterialCost` = Material ICC (Inventory Carrying Cost)
- `finishGoodCost` = Finish Goods ICC

### 2. **Cost of Capital** (Line 152-153)
```typescript
const costOfCapital = inventoryCarryingCost + paymentTerms;
costingOverHeadProfit.CostOfCapitalAmount = costOfCapital;
```

### 3. **Profit** (Line 169-170)
```typescript
const profit = (getCostingOverHeadProfit.materialProfitPer / 100) * Number(materialCost) + 
               (getCostingOverHeadProfit.processProfitPer / 100) * Number(costSummaryViewData?.sumNetProcessCost);
costingOverHeadProfit.profitCost = profit;
```

### 4. **Warranty Cost** (Model property)
```typescript
warrentyCost?: number = 0;
```

## Model Properties (CostOverHeadProfitDto)

```typescript
export class CostOverHeadProfitDto {
  // Percentages (user inputs or from master data)
  mohPer: number = 0;          // Material Overhead %
  fohPer: number = 0;          // Factory Overhead %
  sgaPer: number = 0;          // SG&A %
  
  // Calculated Costs
  mohCost: number = 0;         // Material Overhead Cost
  fohCost: number = 0;         // Factory Overhead Cost
  sgaCost: number = 0;         // SG&A Cost
  
  // TOTAL (sum of above 3)
  OverheadandProfitAmount: number = 0;
  
  // Other costs (tracked separately)
  iccCost: number = 0;         // Inventory Carrying Cost
  fgiccCost: number = 0;       // Finished Goods ICC
  paymentTermsCost: number = 0;
  profitCost: number = 0;
  warrentyCost?: number = 0;   // Warranty Cost
  
  // Summary amounts
  InventoryCarryingAmount: number = 0;
  CostOfCapitalAmount: number = 0;
}
```

## Display in Cost Summary

In the Cost Summary component (`costing-cost-summary.component.ts`), the overhead cost is displayed as:

**Line 486**:
```typescript
OverheadandProfitAmount: this._sharedService.isValidNumber(this.costSummaryViewData.sumOverHeadCost),
```

The `sumOverHeadCost` comes from the backend view `ViewCostSummaryDto` and represents the total of:
- Material OH + Factory OH + SG&A

## Form Mapping for Tooling

For the tooling overhead mapping (`tooling-overhead-mapping.service.ts`), the form is structured as:

**Lines 20-26**:
```typescript
MaterialOHAmount: [0],
FactoryOHAmount: [0],
SGandAAmount: [0],
PaymentTermsAmount: [0],
warrentyAmount: [
0],
OverheadandProfitAmount: [0],
```

**Calculation (Line 48)**:
```typescript
OverheadandProfitAmount: this.sharedService.isValidNumber(
  mohCost + fohCost + sgaCost
),
```

## Playwright Test Implementation

For the Playwright test in `mig-welding-logic.ts`, you should be reading **input fields** (not table cells):

```typescript
// ❌ WRONG - these are input elements, not table cells
const materialOH = await getCellNumber(this.page.materialOH);
const factoryOH = await getCellNumber(this.page.factoryOH);
const sgaOH = await getCellNumber(this.page.sgaOH);

// ✅ CORRECT - use getCurrencyNumber for input fields
const materialOH = await getCurrencyNumber(this.page.materialOH, 'Material OH');
const factoryOH = await getCurrencyNumber(this.page.factoryOH, 'Factory OH');
const sgaOH = await getCurrencyNumber(this.page.sgaOH, 'SGA OH');
const warrantyOH = await getCurrencyNumber(this.page.warrantyOH, 'Warranty OH');
const overHeadOHVal = await getCurrencyNumber(this.page.overHeadCost, 'Overhead Cost');
```

### Validation Formula in Playwright:

```typescript
const calculatedOHSum = calculateOverHeadCost(
  overHeadOHVal,  // Base overhead cost
  materialOH,     // Material OH
  factoryOH,      // Factory OH
  sgaOH,          // SG&A
  warrantyOH      // Warranty
);

// This should match the UI value in OverheadandProfitAmount
expect(shouldOverheadCost).toBeCloseTo(calculatedOHSum, 2);
```

## Summary

**Main Overhead Cost Formula:**
```
Overhead & Profit = Material OH + Factory OH + SG&A [+ Warranty (optional)]
```

Where:
- **Material OH** = `(mohPer/100) × materialCost`
- **Factory OH** = `(fohPer/100) × processCost`  
- **SG&A** = `(sgaPer/100) × (materialCost + processCost)`
- **Warranty** = `(warrentyPer/100) × (some base cost)` (if applicable)

The base overhead cost field might also include profit and other adjustments depending on the form configuration.
