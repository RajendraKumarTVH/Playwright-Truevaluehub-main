import type { OverheadProfitInput, OverheadProfitOutput } from '../tests/utils/overhead-profit-calculator'

export const OverheadProfitScenario1: OverheadProfitInput & { expected: OverheadProfitOutput } = {
    // Input data
    materialCost: 0.1127,
    netProcessCost: 2.1406,
    toolingCost: 0,

    // Overhead percentages (from screenshot)
    mohPer: 2.00, // Material overhead
    fohPer: 2.47, // Factory overhead
    sgaPer: 2.47, // SG&A

    // Profit percentages
    materialProfitPer: 8.00,
    processProfitPer: 8.00,

    // Cost of capital percentages
    iccPer: 4.36, // Raw materials inventory
    fgiccPer: 4.36, // Finished goods inventory
    paymentTermsPer: 0.60, // Payment terms

    // Volume data (from MIG welding test data)
    annualVolume: 950,
    lotSize: 79,
    paymentDays: 30, // Net 30 terms

    // Expected outputs (from screenshot)
    expected: {
        mohCost: 0.0001, // Material overhead
        fohCost: 0.0037, // Factory overhead
        sgaCost: 0.0039, // SG&A
        totalOverhead: 0.0078, // 0.0001 + 0.0037 + 0.0039 (rounded)

        profitCost: 0.0127, // Total profit
        materialProfit: 0.0009, // 8% of material cost
        processProfit: 0.0113, // 8% of process cost

        iccCost: 0, // Raw materials inventory carrying cost
        fgiccCost: 0.0002, // Finished goods inventory carrying cost
        paymentTermsCost: 0, // Payment terms cost
        inventoryCarryingAmount: 0.0002, // ICC + FGICC
        costOfCapitalAmount: 0.0002 // Total cost of capital
    }
}

// Additional test scenario with different values
export const OverheadProfitScenario2: OverheadProfitInput = {
    materialCost: 5.25,
    netProcessCost: 12.40,
    toolingCost: 0.50,

    mohPer: 3.00,
    fohPer: 3.50,
    sgaPer: 3.00,

    materialProfitPer: 10.00,
    processProfitPer: 10.00,

    iccPer: 5.00,
    fgiccPer: 5.00,
    paymentTermsPer: 1.00,

    annualVolume: 10000,
    lotSize: 500,
    paymentDays: 60
}

// High volume scenario
export const OverheadProfitScenario3: OverheadProfitInput = {
    materialCost: 15.75,
    netProcessCost: 8.25,
    toolingCost: 2.00,

    mohPer: 2.50,
    fohPer: 2.75,
    sgaPer: 2.50,

    materialProfitPer: 12.00,
    processProfitPer: 12.00,

    iccPer: 6.00,
    fgiccPer: 6.00,
    paymentTermsPer: 0.75,

    annualVolume: 50000,
    lotSize: 1000,
    paymentDays: 45
}

export default OverheadProfitScenario1
