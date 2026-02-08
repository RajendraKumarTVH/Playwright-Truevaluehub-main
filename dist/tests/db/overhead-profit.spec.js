"use strict";
/**
 * Overhead & Profit Calculator Test Suite
 * Validates calculations based on Angular service logic
 *
 * @description Tests all overhead and profit calculations including:
 * - Material overhead
 * - Factory overhead
 * - SG&A calculations
 * - Profit calculations (material and process)
 * - Cost of capital (ICC, FGICC, Payment Terms)
 * - Inventory carrying costs
 *
 * @author TrueValueHub QA Team
 * @version 1.0.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const overhead_profit_calculator_1 = require("../tests/utils/overhead-profit-calculator");
const overhead_profit_testdata_1 = require("../test-data/overhead-profit-testdata");
const LoggerUtil_1 = __importDefault(require("../tests/lib/LoggerUtil"));
const logger = LoggerUtil_1.default;
test_1.test.describe('Overhead & Profit Calculator - Unit Tests', () => {
    test_1.test.describe('1. Overhead Calculations', () => {
        (0, test_1.test)('TC001: Calculate Material Overhead', () => {
            logger.info('📍 Test: Calculate Material Overhead');
            const materialCost = overhead_profit_testdata_1.OverheadProfitScenario1.materialCost;
            const mohPer = overhead_profit_testdata_1.OverheadProfitScenario1.mohPer;
            const result = (0, overhead_profit_calculator_1.calculateMaterialOverhead)(materialCost, mohPer);
            logger.info(`Material Cost: $${materialCost}`);
            logger.info(`MOH Percentage: ${mohPer}%`);
            logger.info(`MOH Cost: $${result}`);
            logger.info(`Expected: $${overhead_profit_testdata_1.OverheadProfitScenario1.expected.mohCost}`);
            (0, test_1.expect)(result).toBeCloseTo(overhead_profit_testdata_1.OverheadProfitScenario1.expected.mohCost, 4);
            logger.info('✅ Material overhead calculation verified');
        });
        (0, test_1.test)('TC002: Calculate Factory Overhead', () => {
            logger.info('📍 Test: Calculate Factory Overhead');
            const netProcessCost = overhead_profit_testdata_1.OverheadProfitScenario1.netProcessCost;
            const fohPer = overhead_profit_testdata_1.OverheadProfitScenario1.fohPer;
            const result = (0, overhead_profit_calculator_1.calculateFactoryOverhead)(netProcessCost, fohPer);
            logger.info(`Net Process Cost: $${netProcessCost}`);
            logger.info(`FOH Percentage: ${fohPer}%`);
            logger.info(`FOH Cost: $${result}`);
            logger.info(`Expected: $${overhead_profit_testdata_1.OverheadProfitScenario1.expected.fohCost}`);
            (0, test_1.expect)(result).toBeCloseTo(overhead_profit_testdata_1.OverheadProfitScenario1.expected.fohCost, 4);
            logger.info('✅ Factory overhead calculation verified');
        });
        (0, test_1.test)('TC003: Calculate SG&A Cost', () => {
            logger.info('📍 Test: Calculate SG&A Cost');
            const materialCost = overhead_profit_testdata_1.OverheadProfitScenario1.materialCost;
            const netProcessCost = overhead_profit_testdata_1.OverheadProfitScenario1.netProcessCost;
            const sgaPer = overhead_profit_testdata_1.OverheadProfitScenario1.sgaPer;
            const result = (0, overhead_profit_calculator_1.calculateSGACost)(materialCost, netProcessCost, sgaPer);
            logger.info(`Material Cost: $${materialCost}`);
            logger.info(`Net Process Cost: $${netProcessCost}`);
            logger.info(`SG&A Percentage: ${sgaPer}%`);
            logger.info(`SG&A Cost: $${result}`);
            logger.info(`Expected: $${overhead_profit_testdata_1.OverheadProfitScenario1.expected.sgaCost}`);
            (0, test_1.expect)(result).toBeCloseTo(overhead_profit_testdata_1.OverheadProfitScenario1.expected.sgaCost, 4);
            logger.info('✅ SG&A calculation verified');
        });
    });
    test_1.test.describe('2. Cost of Capital Calculations', () => {
        (0, test_1.test)('TC004: Calculate Raw Materials ICC', () => {
            logger.info('📍 Test: Calculate Raw Materials Inventory Carrying Cost');
            const { materialCost, iccPer, annualVolume, lotSize } = overhead_profit_testdata_1.OverheadProfitScenario1;
            const result = (0, overhead_profit_calculator_1.calculateRawMaterialsICC)(materialCost, iccPer, annualVolume, lotSize);
            logger.info(`Material Cost: $${materialCost}`);
            logger.info(`ICC Percentage: ${iccPer}%`);
            logger.info(`Annual Volume: ${annualVolume}`);
            logger.info(`Lot Size: ${lotSize}`);
            logger.info(`ICC Cost: $${result}`);
            logger.info(`Expected: $${overhead_profit_testdata_1.OverheadProfitScenario1.expected.iccCost}`);
            (0, test_1.expect)(result).toBeCloseTo(overhead_profit_testdata_1.OverheadProfitScenario1.expected.iccCost, 4);
            logger.info('✅ Raw materials ICC calculation verified');
        });
        (0, test_1.test)('TC005: Calculate Finished Goods ICC', () => {
            logger.info('📍 Test: Calculate Finished Goods Inventory Carrying Cost');
            const { materialCost, netProcessCost, toolingCost, fgiccPer, annualVolume, lotSize } = overhead_profit_testdata_1.OverheadProfitScenario1;
            const exwPartCost = materialCost + netProcessCost + toolingCost;
            const result = (0, overhead_profit_calculator_1.calculateFinishedGoodsICC)(exwPartCost, fgiccPer, annualVolume, lotSize);
            logger.info(`EX-W Part Cost: $${exwPartCost}`);
            logger.info(`FGICC Percentage: ${fgiccPer}%`);
            logger.info(`FGICC Cost: $${result}`);
            logger.info(`Expected: $${overhead_profit_testdata_1.OverheadProfitScenario1.expected.fgiccCost}`);
            (0, test_1.expect)(result).toBeCloseTo(overhead_profit_testdata_1.OverheadProfitScenario1.expected.fgiccCost, 4);
            logger.info('✅ Finished goods ICC calculation verified');
        });
        (0, test_1.test)('TC006: Calculate Payment Terms Cost', () => {
            logger.info('📍 Test: Calculate Payment Terms Cost');
            const { materialCost, netProcessCost, toolingCost, paymentTermsPer, paymentDays } = overhead_profit_testdata_1.OverheadProfitScenario1;
            const exwPartCost = materialCost + netProcessCost + toolingCost;
            const result = (0, overhead_profit_calculator_1.calculatePaymentTermsCost)(exwPartCost, paymentTermsPer, paymentDays);
            logger.info(`EX-W Part Cost: $${exwPartCost}`);
            logger.info(`Payment Terms Percentage: ${paymentTermsPer}%`);
            logger.info(`Payment Days: ${paymentDays}`);
            logger.info(`Payment Terms Cost: $${result}`);
            logger.info(`Expected: $${overhead_profit_testdata_1.OverheadProfitScenario1.expected.paymentTermsCost}`);
            (0, test_1.expect)(result).toBeCloseTo(overhead_profit_testdata_1.OverheadProfitScenario1.expected.paymentTermsCost, 4);
            logger.info('✅ Payment terms cost calculation verified');
        });
        (0, test_1.test)('TC007: Verify Payment Terms Master Data', () => {
            logger.info('📍 Test: Verify Payment Terms Master Data');
            logger.info('Payment Terms Mapping:');
            overhead_profit_calculator_1.PaymentTermsMaster.forEach((days, id) => {
                logger.info(`  ID ${id}: ${days} days`);
            });
            (0, test_1.expect)(overhead_profit_calculator_1.PaymentTermsMaster.get(1)).toBe(30);
            (0, test_1.expect)(overhead_profit_calculator_1.PaymentTermsMaster.get(2)).toBe(45);
            (0, test_1.expect)(overhead_profit_calculator_1.PaymentTermsMaster.get(3)).toBe(60);
            (0, test_1.expect)(overhead_profit_calculator_1.PaymentTermsMaster.get(6)).toBe(120);
            logger.info('✅ Payment terms master data verified');
        });
    });
    test_1.test.describe('3. Profit Calculations', () => {
        (0, test_1.test)('TC008: Calculate Total Profit', () => {
            logger.info('📍 Test: Calculate Total Profit');
            const { materialCost, netProcessCost, materialProfitPer, processProfitPer } = overhead_profit_testdata_1.OverheadProfitScenario1;
            const result = (0, overhead_profit_calculator_1.calculateProfit)(materialCost, netProcessCost, materialProfitPer, processProfitPer);
            logger.info(`Material Cost: $${materialCost}`);
            logger.info(`Net Process Cost: $${netProcessCost}`);
            logger.info(`Material Profit %: ${materialProfitPer}%`);
            logger.info(`Process Profit %: ${processProfitPer}%`);
            logger.info(`Total Profit: $${result}`);
            logger.info(`Expected: $${overhead_profit_testdata_1.OverheadProfitScenario1.expected.profitCost}`);
            (0, test_1.expect)(result).toBeCloseTo(overhead_profit_testdata_1.OverheadProfitScenario1.expected.profitCost, 4);
            logger.info('✅ Total profit calculation verified');
        });
    });
    test_1.test.describe('4. Complete Overhead & Profit Calculations', () => {
        (0, test_1.test)('TC009: Scenario 1 - Complete Calculation (Screenshot Data)', () => {
            logger.info('📍 Test: Scenario 1 - Complete Overhead & Profit Calculation');
            const result = (0, overhead_profit_calculator_1.calculateOverheadProfit)(overhead_profit_testdata_1.OverheadProfitScenario1);
            logger.info('=== Overhead Costs ===');
            logger.info(`Material Overhead: $${result.mohCost} (Expected: $${overhead_profit_testdata_1.OverheadProfitScenario1.expected.mohCost})`);
            logger.info(`Factory Overhead: $${result.fohCost} (Expected: $${overhead_profit_testdata_1.OverheadProfitScenario1.expected.fohCost})`);
            logger.info(`SG&A: $${result.sgaCost} (Expected: $${overhead_profit_testdata_1.OverheadProfitScenario1.expected.sgaCost})`);
            logger.info(`Total Overhead: $${result.totalOverhead} (Expected: $${overhead_profit_testdata_1.OverheadProfitScenario1.expected.totalOverhead})`);
            logger.info('\n=== Profit ===');
            logger.info(`Material Profit: $${result.materialProfit}`);
            logger.info(`Process Profit: $${result.processProfit}`);
            logger.info(`Total Profit: $${result.profitCost} (Expected: $${overhead_profit_testdata_1.OverheadProfitScenario1.expected.profitCost})`);
            logger.info('\n=== Cost of Capital ===');
            logger.info(`Raw Materials ICC: $${result.iccCost} (Expected: $${overhead_profit_testdata_1.OverheadProfitScenario1.expected.iccCost})`);
            logger.info(`Finished Goods ICC: $${result.fgiccCost} (Expected: $${overhead_profit_testdata_1.OverheadProfitScenario1.expected.fgiccCost})`);
            logger.info(`Payment Terms: $${result.paymentTermsCost} (Expected: $${overhead_profit_testdata_1.OverheadProfitScenario1.expected.paymentTermsCost})`);
            logger.info(`Inventory Carrying: $${result.inventoryCarryingAmount} (Expected: $${overhead_profit_testdata_1.OverheadProfitScenario1.expected.inventoryCarryingAmount})`);
            logger.info(`Cost of Capital: $${result.costOfCapitalAmount} (Expected: $${overhead_profit_testdata_1.OverheadProfitScenario1.expected.costOfCapitalAmount})`);
            // Verify all costs match expected values
            (0, test_1.expect)(result.mohCost).toBeCloseTo(overhead_profit_testdata_1.OverheadProfitScenario1.expected.mohCost, 4);
            (0, test_1.expect)(result.fohCost).toBeCloseTo(overhead_profit_testdata_1.OverheadProfitScenario1.expected.fohCost, 4);
            (0, test_1.expect)(result.sgaCost).toBeCloseTo(overhead_profit_testdata_1.OverheadProfitScenario1.expected.sgaCost, 4);
            (0, test_1.expect)(result.totalOverhead).toBeCloseTo(overhead_profit_testdata_1.OverheadProfitScenario1.expected.totalOverhead, 4);
            (0, test_1.expect)(result.profitCost).toBeCloseTo(overhead_profit_testdata_1.OverheadProfitScenario1.expected.profitCost, 4);
            (0, test_1.expect)(result.costOfCapitalAmount).toBeCloseTo(overhead_profit_testdata_1.OverheadProfitScenario1.expected.costOfCapitalAmount, 4);
            logger.info('✅ Complete overhead & profit calculation verified');
        });
        (0, test_1.test)('TC010: Scenario 2 - Different Cost Structure', () => {
            logger.info('📍 Test: Scenario 2 - Different Cost Structure');
            const result = (0, overhead_profit_calculator_1.calculateOverheadProfit)(overhead_profit_testdata_1.OverheadProfitScenario2);
            logger.info('=== Input ===');
            logger.info(`Material Cost: $${overhead_profit_testdata_1.OverheadProfitScenario2.materialCost}`);
            logger.info(`Net Process Cost: $${overhead_profit_testdata_1.OverheadProfitScenario2.netProcessCost}`);
            logger.info(`Tooling Cost: $${overhead_profit_testdata_1.OverheadProfitScenario2.toolingCost}`);
            logger.info('\n=== Output ===');
            logger.info(`Total Overhead: $${result.totalOverhead}`);
            logger.info(`Total Profit: $${result.profitCost}`);
            logger.info(`Cost of Capital: $${result.costOfCapitalAmount}`);
            // Sanity checks
            (0, test_1.expect)(result.totalOverhead).toBeGreaterThan(0);
            (0, test_1.expect)(result.profitCost).toBeGreaterThan(0);
            (0, test_1.expect)(result.costOfCapitalAmount).toBeGreaterThan(0);
            logger.info('✅ Scenario 2 calculations completed');
        });
        (0, test_1.test)('TC011: Scenario 3 - High Volume Production', () => {
            logger.info('📍 Test: Scenario 3 - High Volume Production');
            const result = (0, overhead_profit_calculator_1.calculateOverheadProfit)(overhead_profit_testdata_1.OverheadProfitScenario3);
            logger.info('=== Input ===');
            logger.info(`Material Cost: $${overhead_profit_testdata_1.OverheadProfitScenario3.materialCost}`);
            logger.info(`Annual Volume: ${overhead_profit_testdata_1.OverheadProfitScenario3.annualVolume}`);
            logger.info(`Lot Size: ${overhead_profit_testdata_1.OverheadProfitScenario3.lotSize}`);
            logger.info('\n=== Output ===');
            logger.info(`Total Overhead: $${result.totalOverhead}`);
            logger.info(`Total Profit: $${result.profitCost}`);
            logger.info(`Cost of Capital: $${result.costOfCapitalAmount}`);
            // Sanity checks
            (0, test_1.expect)(result.totalOverhead).toBeGreaterThan(0);
            (0, test_1.expect)(result.profitCost).toBeGreaterThan(0);
            logger.info('✅ Scenario 3 calculations completed');
        });
    });
    test_1.test.describe('5. Edge Cases & Validation', () => {
        (0, test_1.test)('TC012: Zero Material Cost', () => {
            logger.info('📍 Test: Zero Material Cost');
            const result = (0, overhead_profit_calculator_1.calculateMaterialOverhead)(0, 2.0);
            (0, test_1.expect)(result).toBe(0);
            logger.info('✅ Zero material cost handled correctly');
        });
        (0, test_1.test)('TC013: Zero Percentage', () => {
            logger.info('📍 Test: Zero Percentage');
            const result = (0, overhead_profit_calculator_1.calculateFactoryOverhead)(100, 0);
            (0, test_1.expect)(result).toBe(0);
            logger.info('✅ Zero percentage handled correctly');
        });
        (0, test_1.test)('TC014: High Profit Margins', () => {
            logger.info('📍 Test: High Profit Margins');
            const materialCost = 10.0;
            const processCost = 20.0;
            const profitPer = 50.0;
            const result = (0, overhead_profit_calculator_1.calculateProfit)(materialCost, processCost, profitPer, profitPer);
            (0, test_1.expect)(result).toBe(15.0); // (10 + 20) * 0.5
            logger.info(`Profit with 50% margin: $${result}`);
            logger.info('✅ High profit margin calculation verified');
        });
    });
});
