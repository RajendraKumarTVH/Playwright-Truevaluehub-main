"use strict";
/**
 * Overhead & Profit Calculator
 * TypeScript implementation based on Angular service calculations
 * Source: costing-overhead-profit-calculator.service.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentTermsMaster = void 0;
exports.calculateMaterialOverhead = calculateMaterialOverhead;
exports.calculateFactoryOverhead = calculateFactoryOverhead;
exports.calculateSGACost = calculateSGACost;
exports.calculateRawMaterialsICC = calculateRawMaterialsICC;
exports.calculateFinishedGoodsICC = calculateFinishedGoodsICC;
exports.calculatePaymentTermsCost = calculatePaymentTermsCost;
exports.calculateProfit = calculateProfit;
exports.calculateOverheadProfit = calculateOverheadProfit;
/**
 * Payment Terms Master Data
 * Maps payment term ID to number of days
 */
exports.PaymentTermsMaster = new Map([
    [1, 30],
    [2, 45],
    [3, 60],
    [4, 75],
    [5, 90],
    [6, 120],
    [7, 15],
    [8, 150],
    [9, 180]
]);
/**
 * Calculate Material Overhead Cost
 * @param materialCost Total material cost
 * @param mohPer Material overhead percentage
 * @returns Material overhead cost
 */
function calculateMaterialOverhead(materialCost, mohPer) {
    return (mohPer / 100) * materialCost || 0;
}
/**
 * Calculate Factory Overhead Cost
 * @param netProcessCost Net process cost
 * @param fohPer Factory overhead percentage
 * @returns Factory overhead cost
 */
function calculateFactoryOverhead(netProcessCost, fohPer) {
    return (fohPer / 100) * netProcessCost || 0;
}
/**
 * Calculate SG&A Cost
 * @param materialCost Material cost
 * @param netProcessCost Net process cost
 * @param sgaPer SG&A percentage
 * @returns SG&A cost
 */
function calculateSGACost(materialCost, netProcessCost, sgaPer) {
    const exCostAmount = materialCost + netProcessCost;
    return (sgaPer / 100) * exCostAmount || 0;
}
/**
 * Calculate Raw Materials Inventory Carrying Cost
 * @param materialCost Material cost
 * @param iccPer ICC percentage
 * @param annualVolume Annual volume
 * @param lotSize Lot size
 * @returns ICC cost
 */
function calculateRawMaterialsICC(materialCost, iccPer, annualVolume, lotSize) {
    return ((materialCost * (iccPer / 100)) / 365) * (annualVolume / lotSize) || 0;
}
/**
 * Calculate Finished Goods Inventory Carrying Cost
 * @param exwPartCost EX-W part cost (material + process + tooling)
 * @param fgiccPer FGICC percentage
 * @param annualVolume Annual volume
 * @param lotSize Lot size
 * @returns FGICC cost
 */
function calculateFinishedGoodsICC(exwPartCost, fgiccPer, annualVolume, lotSize) {
    return (((fgiccPer / 100) * exwPartCost) / 365) * (annualVolume / lotSize) || 0;
}
/**
 * Calculate Payment Terms Cost
 * @param exwPartCost EX-W part cost
 * @param paymentTermsPer Payment terms percentage
 * @param paymentDays Payment days
 * @returns Payment terms cost
 */
function calculatePaymentTermsCost(exwPartCost, paymentTermsPer, paymentDays) {
    return (((paymentTermsPer / 100) * exwPartCost) / 365) * (paymentDays - 30) || 0;
}
/**
 * Calculate Total Profit
 * @param materialCost Material cost
 * @param netProcessCost Net process cost
 * @param materialProfitPer Material profit percentage
 * @param processProfitPer Process profit percentage
 * @returns Total profit
 */
function calculateProfit(materialCost, netProcessCost, materialProfitPer, processProfitPer) {
    const materialProfit = (materialProfitPer / 100) * materialCost;
    const processProfit = (processProfitPer / 100) * netProcessCost;
    return materialProfit + processProfit;
}
/**
 * Calculate Complete Overhead & Profit
 * @param input Overhead and profit input parameters
 * @returns Complete overhead and profit calculations
 */
function calculateOverheadProfit(input) {
    // Calculate EX-W Part Cost
    const exwPartCost = input.materialCost + input.netProcessCost + input.toolingCost;
    // Calculate overhead components
    const mohCost = calculateMaterialOverhead(input.materialCost, input.mohPer);
    const fohCost = calculateFactoryOverhead(input.netProcessCost, input.fohPer);
    const sgaCost = calculateSGACost(input.materialCost, input.netProcessCost, input.sgaPer);
    // Calculate cost of capital components
    const iccCost = calculateRawMaterialsICC(input.materialCost, input.iccPer, input.annualVolume, input.lotSize);
    const fgiccCost = calculateFinishedGoodsICC(exwPartCost, input.fgiccPer, input.annualVolume, input.lotSize);
    const paymentTermsCost = calculatePaymentTermsCost(exwPartCost, input.paymentTermsPer, input.paymentDays);
    // Calculate profit
    const profitCost = calculateProfit(input.materialCost, input.netProcessCost, input.materialProfitPer, input.processProfitPer);
    return {
        mohCost,
        fohCost,
        sgaCost,
        totalOverhead: mohCost + fohCost + sgaCost,
        profitCost,
        materialProfit: (input.materialProfitPer / 100) * input.materialCost,
        processProfit: (input.processProfitPer / 100) * input.netProcessCost,
        iccCost,
        fgiccCost,
        paymentTermsCost,
        inventoryCarryingAmount: iccCost + fgiccCost,
        costOfCapitalAmount: iccCost + fgiccCost + paymentTermsCost
    };
}
