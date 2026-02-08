"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SustainabilityCalculator = void 0;
class SustainabilityCalculator {
    static isValidNumber(value) {
        if (value === undefined || value === null || Number.isNaN(value) || !Number.isFinite(value) || value < 0) {
            return 0;
        }
        return Number(value.toFixed(4));
    }
    static calculateMaterialSustainability(input) {
        var _a, _b;
        const netWeightGrams = input.netWeight; // Total weld material (g)
        const grossWeightGrams = input.grossWeight; // Weld bead weight with wastage (g)
        const eav = input.eav > 0 ? input.eav : 1; // Annual volume
        const efficiencyFactor = ((_a = input.efficiencyPercent) !== null && _a !== void 0 ? _a : 100) / 100; // Efficiency
        const esgImpactCO2KgPerKg = input.esgImpactCO2Kg; // ESG per kg of material
        const esgImpactCO2KgScrap = (_b = input.esgImpactCO2KgScrap) !== null && _b !== void 0 ? _b : esgImpactCO2KgPerKg;
        // --------------------
        // 1️⃣ Dynamic scrap calculation
        // --------------------
        const scrapWeightGrams = input.scrapWeight !== undefined
            ? input.scrapWeight
            : Math.max(grossWeightGrams - netWeightGrams, 0);
        // --------------------
        // 2️⃣ Convert grams → kg for calculation
        // --------------------
        const netWeightKg = netWeightGrams / 1000;
        const grossWeightKg = grossWeightGrams / 1000;
        const scrapWeightKg = scrapWeightGrams / 1000;
        // --------------------
        // 3️⃣ ESG per part calculation (matches UI exactly)
        // Formula: CO2 per part = (grossWeight - scrapWeight) * ESG factor * efficiency
        // --------------------
        const esgImpactCO2KgPartRaw = (grossWeightKg - scrapWeightKg) * esgImpactCO2KgPerKg;
        const esgImpactCO2KgPart = esgImpactCO2KgPartRaw * efficiencyFactor;
        // --------------------
        // 4️⃣ Annual ESG calculations
        // --------------------
        const esgAnnualVolumeKg = netWeightKg * eav; // Total mass processed annually
        const esgAnnualKgCO2 = esgImpactCO2KgPart * eav; // Total CO2 annually
        const esgAnnualKgCO2Part = eav > 0 ? esgAnnualKgCO2 / eav : 0; // Per-part CO2
        return {
            esgImpactCO2KgPart,
            esgAnnualVolumeKg,
            esgAnnualKgCO2,
            esgAnnualKgCO2Part,
            totalWeldMaterialWeight: netWeightGrams,
            weldBeadWeightWithWastage: grossWeightGrams,
            scrapWeight: scrapWeightGrams
        };
    }
    static calculateManufacturingSustainability(input) {
        const { powerUnitCostPerKWh, powerConsumptionKWh, co2PerKWh, eav = 1 } = input;
        // 1️⃣ Total Power Cost ($)
        const totalPowerCostRaw = powerUnitCostPerKWh * powerConsumptionKWh;
        const totalPowerCost = this.isValidNumber(totalPowerCostRaw);
        // 2️⃣ CO2 per kWh
        const esgImpactElectricityConsumption = this.isValidNumber(co2PerKWh);
        // 3️⃣ CO2 per part
        const esgImpactPerPartRaw = co2PerKWh * powerConsumptionKWh / eav;
        const esgImpactPerPart = this.isValidNumber(esgImpactPerPartRaw);
        // Debug logging
        console.info(`[Sustainability] PowerCost=$${totalPowerCost}, CO2/kWh=${esgImpactElectricityConsumption}, CO2/part=${esgImpactPerPart}`);
        return {
            totalPowerCost,
            esgImpactElectricityConsumption,
            esgImpactPerPart,
        };
    }
    static calculateInspectionCost(input) {
        const { inspectionTime, inspectorRate, samplingRate, lotSize, isSeamWelding } = input;
        const safeTime = inspectionTime || 0;
        const safeRate = inspectorRate || 0;
        const safeSampling = samplingRate || 100;
        const safeLotSize = lotSize > 0 ? lotSize : 1;
        const baseCost = (safeTime * safeRate) / 60;
        const samplingFactor = safeSampling / 100;
        const cost = isSeamWelding
            ? (baseCost * samplingFactor) / safeLotSize
            : baseCost * samplingFactor;
        return this.isValidNumber(cost);
    }
    static calculateYieldCost(input) {
        const { yieldPercentage, processCostSum, materialCost } = input;
        const safeYield = yieldPercentage || 100;
        const safeProcess = processCostSum || 0;
        const safeMaterial = materialCost || 0;
        const cost = (1 - safeYield / 100) * (safeMaterial + safeProcess);
        return this.isValidNumber(cost);
    }
}
exports.SustainabilityCalculator = SustainabilityCalculator;
