"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateCycleTimeBreakdown = calculateCycleTimeBreakdown;
exports.logCycleTimeBreakdown = logCycleTimeBreakdown;
function calculateCycleTimeBreakdown(calculated, efficiency) {
    var _a;
    const efficiencyDecimal = efficiency > 1 ? efficiency / 100 : efficiency;
    const subProcessCycleTime = ((_a = calculated.subProcessTypeInfos) === null || _a === void 0 ? void 0 : _a.reduce((sum, info) => sum + (info.recommendTonnage || 0), 0)) || 0;
    const unloadingTime = calculated.unloadingTime || 0;
    const arcOnTime = subProcessCycleTime + unloadingTime;
    const arcOffTime = arcOnTime * 0.05;
    const loadingTime = unloadingTime / 2;
    const partReorientation = calculated.partReorientation || 0;
    const totalWeldCycleTime = partReorientation * loadingTime + arcOnTime + arcOffTime;
    const finalCycleTime = totalWeldCycleTime / efficiencyDecimal;
    return {
        loadingTime,
        unloadingTime,
        subProcessCycleTime,
        arcOnTime,
        arcOffTime,
        totalWeldCycleTime,
        finalCycleTime,
        partReorientation,
        efficiency: efficiencyDecimal
    };
}
function logCycleTimeBreakdown(breakdown, logger) {
    logger.info('📊 Cycle Time Calculation Breakdown:');
    logger.info(`   Loading Time: ${breakdown.loadingTime.toFixed(4)} seconds`);
    logger.info(`   Unloading Time: ${breakdown.unloadingTime.toFixed(4)} seconds`);
    logger.info(`   Sub Process Cycle Time (all welds): ${breakdown.subProcessCycleTime.toFixed(4)} seconds`);
    logger.info(`   Arc On Time: ${breakdown.arcOnTime.toFixed(4)} seconds`);
    logger.info(`   Arc Off Time: ${breakdown.arcOffTime.toFixed(4)} seconds`);
    logger.info(`   Part Reorientation: ${breakdown.partReorientation}`);
    logger.info(`   Total Weld Cycle Time (Dry): ${breakdown.totalWeldCycleTime.toFixed(4)} seconds`);
    logger.info(`   Machine Efficiency: ${(breakdown.efficiency * 100).toFixed(2)}%`);
    logger.info(`   Final Cycle Time (with efficiency): ${breakdown.finalCycleTime.toFixed(4)} seconds`);
}
