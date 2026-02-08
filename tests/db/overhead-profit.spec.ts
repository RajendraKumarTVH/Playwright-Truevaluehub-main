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

import { test, expect } from '@playwright/test'
import {
    calculateOverheadProfit,
    calculateMaterialOverhead,
    calculateFactoryOverhead,
    calculateSGACost,
    calculateRawMaterialsICC,
    calculateFinishedGoodsICC,
    calculatePaymentTermsCost,
    calculateProfit,
    PaymentTermsMaster
} from '../tests/utils/overhead-profit-calculator'
import {
    OverheadProfitScenario1,
    OverheadProfitScenario2,
    OverheadProfitScenario3
} from '../test-data/overhead-profit-testdata'
import Logger from '../tests/lib/LoggerUtil'

const logger = Logger

test.describe('Overhead & Profit Calculator - Unit Tests', () => {
    test.describe('1. Overhead Calculations', () => {
        test('TC001: Calculate Material Overhead', () => {
            logger.info('📍 Test: Calculate Material Overhead')

            const materialCost = OverheadProfitScenario1.materialCost
            const mohPer = OverheadProfitScenario1.mohPer

            const result = calculateMaterialOverhead(materialCost, mohPer)

            logger.info(`Material Cost: $${materialCost}`)
            logger.info(`MOH Percentage: ${mohPer}%`)
            logger.info(`MOH Cost: $${result}`)
            logger.info(`Expected: $${OverheadProfitScenario1.expected.mohCost}`)

            expect(result).toBeCloseTo(OverheadProfitScenario1.expected.mohCost, 4)
            logger.info('✅ Material overhead calculation verified')
        })

        test('TC002: Calculate Factory Overhead', () => {
            logger.info('📍 Test: Calculate Factory Overhead')

            const netProcessCost = OverheadProfitScenario1.netProcessCost
            const fohPer = OverheadProfitScenario1.fohPer

            const result = calculateFactoryOverhead(netProcessCost, fohPer)

            logger.info(`Net Process Cost: $${netProcessCost}`)
            logger.info(`FOH Percentage: ${fohPer}%`)
            logger.info(`FOH Cost: $${result}`)
            logger.info(`Expected: $${OverheadProfitScenario1.expected.fohCost}`)

            expect(result).toBeCloseTo(OverheadProfitScenario1.expected.fohCost, 4)
            logger.info('✅ Factory overhead calculation verified')
        })

        test('TC003: Calculate SG&A Cost', () => {
            logger.info('📍 Test: Calculate SG&A Cost')

            const materialCost = OverheadProfitScenario1.materialCost
            const netProcessCost = OverheadProfitScenario1.netProcessCost
            const sgaPer = OverheadProfitScenario1.sgaPer

            const result = calculateSGACost(materialCost, netProcessCost, sgaPer)

            logger.info(`Material Cost: $${materialCost}`)
            logger.info(`Net Process Cost: $${netProcessCost}`)
            logger.info(`SG&A Percentage: ${sgaPer}%`)
            logger.info(`SG&A Cost: $${result}`)
            logger.info(`Expected: $${OverheadProfitScenario1.expected.sgaCost}`)

            expect(result).toBeCloseTo(OverheadProfitScenario1.expected.sgaCost, 4)
            logger.info('✅ SG&A calculation verified')
        })
    })

    test.describe('2. Cost of Capital Calculations', () => {
        test('TC004: Calculate Raw Materials ICC', () => {
            logger.info('📍 Test: Calculate Raw Materials Inventory Carrying Cost')

            const { materialCost, iccPer, annualVolume, lotSize } =
                OverheadProfitScenario1

            const result = calculateRawMaterialsICC(
                materialCost,
                iccPer,
                annualVolume,
                lotSize
            )

            logger.info(`Material Cost: $${materialCost}`)
            logger.info(`ICC Percentage: ${iccPer}%`)
            logger.info(`Annual Volume: ${annualVolume}`)
            logger.info(`Lot Size: ${lotSize}`)
            logger.info(`ICC Cost: $${result}`)
            logger.info(`Expected: $${OverheadProfitScenario1.expected.iccCost}`)

            expect(result).toBeCloseTo(OverheadProfitScenario1.expected.iccCost, 4)
            logger.info('✅ Raw materials ICC calculation verified')
        })

        test('TC005: Calculate Finished Goods ICC', () => {
            logger.info('📍 Test: Calculate Finished Goods Inventory Carrying Cost')

            const { materialCost, netProcessCost, toolingCost, fgiccPer, annualVolume, lotSize } =
                OverheadProfitScenario1
            const exwPartCost = materialCost + netProcessCost + toolingCost

            const result = calculateFinishedGoodsICC(
                exwPartCost,
                fgiccPer,
                annualVolume,
                lotSize
            )

            logger.info(`EX-W Part Cost: $${exwPartCost}`)
            logger.info(`FGICC Percentage: ${fgiccPer}%`)
            logger.info(`FGICC Cost: $${result}`)
            logger.info(`Expected: $${OverheadProfitScenario1.expected.fgiccCost}`)

            expect(result).toBeCloseTo(OverheadProfitScenario1.expected.fgiccCost, 4)
            logger.info('✅ Finished goods ICC calculation verified')
        })

        test('TC006: Calculate Payment Terms Cost', () => {
            logger.info('📍 Test: Calculate Payment Terms Cost')

            const { materialCost, netProcessCost, toolingCost, paymentTermsPer, paymentDays } =
                OverheadProfitScenario1
            const exwPartCost = materialCost + netProcessCost + toolingCost

            const result = calculatePaymentTermsCost(
                exwPartCost,
                paymentTermsPer,
                paymentDays
            )

            logger.info(`EX-W Part Cost: $${exwPartCost}`)
            logger.info(`Payment Terms Percentage: ${paymentTermsPer}%`)
            logger.info(`Payment Days: ${paymentDays}`)
            logger.info(`Payment Terms Cost: $${result}`)
            logger.info(`Expected: $${OverheadProfitScenario1.expected.paymentTermsCost}`)

            expect(result).toBeCloseTo(
                OverheadProfitScenario1.expected.paymentTermsCost,
                4
            )
            logger.info('✅ Payment terms cost calculation verified')
        })

        test('TC007: Verify Payment Terms Master Data', () => {
            logger.info('📍 Test: Verify Payment Terms Master Data')

            logger.info('Payment Terms Mapping:')
            PaymentTermsMaster.forEach((days, id) => {
                logger.info(`  ID ${id}: ${days} days`)
            })

            expect(PaymentTermsMaster.get(1)).toBe(30)
            expect(PaymentTermsMaster.get(2)).toBe(45)
            expect(PaymentTermsMaster.get(3)).toBe(60)
            expect(PaymentTermsMaster.get(6)).toBe(120)

            logger.info('✅ Payment terms master data verified')
        })
    })

    test.describe('3. Profit Calculations', () => {
        test('TC008: Calculate Total Profit', () => {
            logger.info('📍 Test: Calculate Total Profit')

            const {
                materialCost,
                netProcessCost,
                materialProfitPer,
                processProfitPer
            } = OverheadProfitScenario1

            const result = calculateProfit(
                materialCost,
                netProcessCost,
                materialProfitPer,
                processProfitPer
            )

            logger.info(`Material Cost: $${materialCost}`)
            logger.info(`Net Process Cost: $${netProcessCost}`)
            logger.info(`Material Profit %: ${materialProfitPer}%`)
            logger.info(`Process Profit %: ${processProfitPer}%`)
            logger.info(`Total Profit: $${result}`)
            logger.info(`Expected: $${OverheadProfitScenario1.expected.profitCost}`)

            expect(result).toBeCloseTo(OverheadProfitScenario1.expected.profitCost, 4)
            logger.info('✅ Total profit calculation verified')
        })
    })

    test.describe('4. Complete Overhead & Profit Calculations', () => {
        test('TC009: Scenario 1 - Complete Calculation (Screenshot Data)', () => {
            logger.info('📍 Test: Scenario 1 - Complete Overhead & Profit Calculation')

            const result = calculateOverheadProfit(OverheadProfitScenario1)

            logger.info('=== Overhead Costs ===')
            logger.info(`Material Overhead: $${result.mohCost} (Expected: $${OverheadProfitScenario1.expected.mohCost})`)
            logger.info(`Factory Overhead: $${result.fohCost} (Expected: $${OverheadProfitScenario1.expected.fohCost})`)
            logger.info(`SG&A: $${result.sgaCost} (Expected: $${OverheadProfitScenario1.expected.sgaCost})`)
            logger.info(`Total Overhead: $${result.totalOverhead} (Expected: $${OverheadProfitScenario1.expected.totalOverhead})`)

            logger.info('\n=== Profit ===')
            logger.info(`Material Profit: $${result.materialProfit}`)
            logger.info(`Process Profit: $${result.processProfit}`)
            logger.info(`Total Profit: $${result.profitCost} (Expected: $${OverheadProfitScenario1.expected.profitCost})`)

            logger.info('\n=== Cost of Capital ===')
            logger.info(`Raw Materials ICC: $${result.iccCost} (Expected: $${OverheadProfitScenario1.expected.iccCost})`)
            logger.info(`Finished Goods ICC: $${result.fgiccCost} (Expected: $${OverheadProfitScenario1.expected.fgiccCost})`)
            logger.info(`Payment Terms: $${result.paymentTermsCost} (Expected: $${OverheadProfitScenario1.expected.paymentTermsCost})`)
            logger.info(`Inventory Carrying: $${result.inventoryCarryingAmount} (Expected: $${OverheadProfitScenario1.expected.inventoryCarryingAmount})`)
            logger.info(`Cost of Capital: $${result.costOfCapitalAmount} (Expected: $${OverheadProfitScenario1.expected.costOfCapitalAmount})`)

            // Verify all costs match expected values
            expect(result.mohCost).toBeCloseTo(OverheadProfitScenario1.expected.mohCost, 4)
            expect(result.fohCost).toBeCloseTo(OverheadProfitScenario1.expected.fohCost, 4)
            expect(result.sgaCost).toBeCloseTo(OverheadProfitScenario1.expected.sgaCost, 4)
            expect(result.totalOverhead).toBeCloseTo(OverheadProfitScenario1.expected.totalOverhead, 4)
            expect(result.profitCost).toBeCloseTo(OverheadProfitScenario1.expected.profitCost, 4)
            expect(result.costOfCapitalAmount).toBeCloseTo(OverheadProfitScenario1.expected.costOfCapitalAmount, 4)

            logger.info('✅ Complete overhead & profit calculation verified')
        })

        test('TC010: Scenario 2 - Different Cost Structure', () => {
            logger.info('📍 Test: Scenario 2 - Different Cost Structure')

            const result = calculateOverheadProfit(OverheadProfitScenario2)

            logger.info('=== Input ===')
            logger.info(`Material Cost: $${OverheadProfitScenario2.materialCost}`)
            logger.info(`Net Process Cost: $${OverheadProfitScenario2.netProcessCost}`)
            logger.info(`Tooling Cost: $${OverheadProfitScenario2.toolingCost}`)

            logger.info('\n=== Output ===')
            logger.info(`Total Overhead: $${result.totalOverhead}`)
            logger.info(`Total Profit: $${result.profitCost}`)
            logger.info(`Cost of Capital: $${result.costOfCapitalAmount}`)

            // Sanity checks
            expect(result.totalOverhead).toBeGreaterThan(0)
            expect(result.profitCost).toBeGreaterThan(0)
            expect(result.costOfCapitalAmount).toBeGreaterThan(0)

            logger.info('✅ Scenario 2 calculations completed')
        })

        test('TC011: Scenario 3 - High Volume Production', () => {
            logger.info('📍 Test: Scenario 3 - High Volume Production')

            const result = calculateOverheadProfit(OverheadProfitScenario3)

            logger.info('=== Input ===')
            logger.info(`Material Cost: $${OverheadProfitScenario3.materialCost}`)
            logger.info(`Annual Volume: ${OverheadProfitScenario3.annualVolume}`)
            logger.info(`Lot Size: ${OverheadProfitScenario3.lotSize}`)

            logger.info('\n=== Output ===')
            logger.info(`Total Overhead: $${result.totalOverhead}`)
            logger.info(`Total Profit: $${result.profitCost}`)
            logger.info(`Cost of Capital: $${result.costOfCapitalAmount}`)

            // Sanity checks
            expect(result.totalOverhead).toBeGreaterThan(0)
            expect(result.profitCost).toBeGreaterThan(0)

            logger.info('✅ Scenario 3 calculations completed')
        })
    })

    test.describe('5. Edge Cases & Validation', () => {
        test('TC012: Zero Material Cost', () => {
            logger.info('📍 Test: Zero Material Cost')

            const result = calculateMaterialOverhead(0, 2.0)

            expect(result).toBe(0)
            logger.info('✅ Zero material cost handled correctly')
        })

        test('TC013: Zero Percentage', () => {
            logger.info('📍 Test: Zero Percentage')

            const result = calculateFactoryOverhead(100, 0)

            expect(result).toBe(0)
            logger.info('✅ Zero percentage handled correctly')
        })

        test('TC014: High Profit Margins', () => {
            logger.info('📍 Test: High Profit Margins')

            const materialCost = 10.0
            const processCost = 20.0
            const profitPer = 50.0

            const result = calculateProfit(materialCost, processCost, profitPer, profitPer)

            expect(result).toBe(15.0) // (10 + 20) * 0.5
            logger.info(`Profit with 50% margin: $${result}`)
            logger.info('✅ High profit margin calculation verified')
        })
    })
})
