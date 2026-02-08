"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeldingConfigService = void 0;
const welding_calculator_1 = require("./welding-calculator");
class WeldingConfigService {
    constructor() {
        // MIG Welding Data from source
        this.migWeldingData = [
            { MaterialType: 'Carbon Steel', Type: 'Manual', PlateThickness_mm: 1, WireDiameter_mm: 0.8, Voltage_Volts: 15, Current_Amps: 65, WireFeed_m_per_min: 3, TravelSpeed_mm_per_sec: 6.97 },
            { MaterialType: 'Carbon Steel', Type: 'Manual', PlateThickness_mm: 1.6, WireDiameter_mm: 0.8, Voltage_Volts: 18, Current_Amps: 145, WireFeed_m_per_min: 4.125, TravelSpeed_mm_per_sec: 6.06 },
            { MaterialType: 'Carbon Steel', Type: 'Manual', PlateThickness_mm: 3, WireDiameter_mm: 0.8, Voltage_Volts: 18, Current_Amps: 140, WireFeed_m_per_min: 2.7, TravelSpeed_mm_per_sec: 5.27 },
            { MaterialType: 'Carbon Steel', Type: 'Manual', PlateThickness_mm: 4, WireDiameter_mm: 1.2, Voltage_Volts: 27, Current_Amps: 290, WireFeed_m_per_min: 2.7, TravelSpeed_mm_per_sec: 4.17 },
            { MaterialType: 'Carbon Steel', Type: 'Manual', PlateThickness_mm: 5, WireDiameter_mm: 1.2, Voltage_Volts: 29.5, Current_Amps: 310, WireFeed_m_per_min: 8.25, TravelSpeed_mm_per_sec: 4.75 },
            { MaterialType: 'Carbon Steel', Type: 'Manual', PlateThickness_mm: 6, WireDiameter_mm: 1.2, Voltage_Volts: 35, Current_Amps: 400, WireFeed_m_per_min: 9, TravelSpeed_mm_per_sec: 4.5 },
            { MaterialType: 'Carbon Steel', Type: 'Manual', PlateThickness_mm: 8, WireDiameter_mm: 1.2, Voltage_Volts: 35, Current_Amps: 400, WireFeed_m_per_min: 9, TravelSpeed_mm_per_sec: 3.58 },
            { MaterialType: 'Stainless Steel', Type: 'Manual', PlateThickness_mm: 1, WireDiameter_mm: 0.8, Voltage_Volts: 16, Current_Amps: 70, WireFeed_m_per_min: 3.2, TravelSpeed_mm_per_sec: 5.5 },
            { MaterialType: 'Stainless Steel', Type: 'Manual', PlateThickness_mm: 3, WireDiameter_mm: 1.0, Voltage_Volts: 20, Current_Amps: 160, WireFeed_m_per_min: 4.0, TravelSpeed_mm_per_sec: 4.8 },
            { MaterialType: 'Aluminium', Type: 'Manual', PlateThickness_mm: 2, WireDiameter_mm: 1.2, Voltage_Volts: 22, Current_Amps: 180, WireFeed_m_per_min: 10, TravelSpeed_mm_per_sec: 8.5 },
        ];
        // TIG Welding Data from source
        this.tigWeldingData = [
            { MaterialType: 'Stainless Steel, Copper and Copper Alloy', Type: 'Manual', PlateThickness_mm: '<=1', WireDiameter_mm: 0.8, Voltage_Volts: 15, Current_Amps: 65, WireFeed_m_per_min: 3, TravelSpeed_mm_per_sec: 4.74 },
            { MaterialType: 'Stainless Steel, Copper and Copper Alloy', Type: 'Manual', PlateThickness_mm: '>1 <=1.6', WireDiameter_mm: 0.8, Voltage_Volts: 18, Current_Amps: 145, WireFeed_m_per_min: 4.125, TravelSpeed_mm_per_sec: 4.12 },
            { MaterialType: 'Stainless Steel, Copper and Copper Alloy', Type: 'Manual', PlateThickness_mm: '>1.6 <3', WireDiameter_mm: 0.8, Voltage_Volts: 18, Current_Amps: 140, WireFeed_m_per_min: 2.7, TravelSpeed_mm_per_sec: 3.59 },
            { MaterialType: 'Stainless Steel, Copper and Copper Alloy', Type: 'Manual', PlateThickness_mm: 3, WireDiameter_mm: 0.8, Voltage_Volts: 27, Current_Amps: 260, WireFeed_m_per_min: 5.25, TravelSpeed_mm_per_sec: 3.12 },
            { MaterialType: 'Stainless Steel, Copper and Copper Alloy', Type: 'Manual', PlateThickness_mm: 4, WireDiameter_mm: 1.2, Voltage_Volts: 27, Current_Amps: 290, WireFeed_m_per_min: 2.7, TravelSpeed_mm_per_sec: 2.49 },
            { MaterialType: 'Stainless Steel, Copper and Copper Alloy', Type: 'Manual', PlateThickness_mm: 5, WireDiameter_mm: 1.2, Voltage_Volts: 29.5, Current_Amps: 310, WireFeed_m_per_min: 8.25, TravelSpeed_mm_per_sec: 2.75 },
            { MaterialType: 'Stainless Steel, Copper and Copper Alloy', Type: 'Manual', PlateThickness_mm: 6, WireDiameter_mm: 1.2, Voltage_Volts: 35, Current_Amps: 400, WireFeed_m_per_min: 9, TravelSpeed_mm_per_sec: 2.66 },
            { MaterialType: 'Stainless Steel, Copper and Copper Alloy', Type: 'Manual', PlateThickness_mm: 8, WireDiameter_mm: 1.2, Voltage_Volts: 35, Current_Amps: 400, WireFeed_m_per_min: 9, TravelSpeed_mm_per_sec: 1.6 },
            { MaterialType: 'Stainless Steel, Copper and Copper Alloy', Type: 'Manual', PlateThickness_mm: 10, WireDiameter_mm: 1.2, Voltage_Volts: 35, Current_Amps: 400, WireFeed_m_per_min: 8, TravelSpeed_mm_per_sec: 1.33 },
            { MaterialType: 'Stainless Steel, Copper and Copper Alloy', Type: 'Manual', PlateThickness_mm: 12, WireDiameter_mm: 1.2, Voltage_Volts: 35, Current_Amps: 400, WireFeed_m_per_min: 6, TravelSpeed_mm_per_sec: 0.8 },
            { MaterialType: 'Aluminium', Type: 'Manual', PlateThickness_mm: 1, WireDiameter_mm: 0.8, Voltage_Volts: 15, Current_Amps: 65, WireFeed_m_per_min: 3, TravelSpeed_mm_per_sec: 5.58 },
            { MaterialType: 'Aluminium', Type: 'Manual', PlateThickness_mm: 1.6, WireDiameter_mm: 0.8, Voltage_Volts: 18, Current_Amps: 145, WireFeed_m_per_min: 4.125, TravelSpeed_mm_per_sec: 4.85 },
            { MaterialType: 'Aluminium', Type: 'Manual', PlateThickness_mm: 3, WireDiameter_mm: 0.8, Voltage_Volts: 18, Current_Amps: 140, WireFeed_m_per_min: 2.7, TravelSpeed_mm_per_sec: 4.22 },
            { MaterialType: 'Aluminium', Type: 'Manual', PlateThickness_mm: 3, WireDiameter_mm: 0.8, Voltage_Volts: 27, Current_Amps: 260, WireFeed_m_per_min: 5.25, TravelSpeed_mm_per_sec: 3.67 },
            { MaterialType: 'Aluminium', Type: 'Manual', PlateThickness_mm: 4, WireDiameter_mm: 1.2, Voltage_Volts: 27, Current_Amps: 290, WireFeed_m_per_min: 2.7, TravelSpeed_mm_per_sec: 3.12 },
            { MaterialType: 'Aluminium', Type: 'Manual', PlateThickness_mm: 5, WireDiameter_mm: 1.2, Voltage_Volts: 29.5, Current_Amps: 310, WireFeed_m_per_min: 8.25, TravelSpeed_mm_per_sec: 3.3 },
            { MaterialType: 'Aluminium', Type: 'Manual', PlateThickness_mm: 6, WireDiameter_mm: 1.2, Voltage_Volts: 35, Current_Amps: 400, WireFeed_m_per_min: 9, TravelSpeed_mm_per_sec: 2.94 },
            { MaterialType: 'Aluminium', Type: 'Manual', PlateThickness_mm: 8, WireDiameter_mm: 1.2, Voltage_Volts: 35, Current_Amps: 400, WireFeed_m_per_min: 9, TravelSpeed_mm_per_sec: 1.91 },
            { MaterialType: 'Aluminium', Type: 'Manual', PlateThickness_mm: 10, WireDiameter_mm: 1.2, Voltage_Volts: 35, Current_Amps: 400, WireFeed_m_per_min: 8, TravelSpeed_mm_per_sec: 1.47 },
            { MaterialType: 'Aluminium', Type: 'Manual', PlateThickness_mm: 12, WireDiameter_mm: 1.2, Voltage_Volts: 35, Current_Amps: 400, WireFeed_m_per_min: 6, TravelSpeed_mm_per_sec: 0.95 },
        ];
        // Stick Welding Efficiencies
        this.stickWeldingEfficiencies = [
            { id: 1, position: 'Flat', EffeciencyAuto: 90, EffeciencyManual: 60, EffeciencySemiAuto: 75 },
            { id: 2, position: 'Horizontal', EffeciencyAuto: 90, EffeciencyManual: 55, EffeciencySemiAuto: 72.5 },
            { id: 3, position: 'Vertical', EffeciencyAuto: 85, EffeciencyManual: 50, EffeciencySemiAuto: 67.5 },
            { id: 4, position: 'Overhead', EffeciencyAuto: 80, EffeciencyManual: 45, EffeciencySemiAuto: 62.5 },
            { id: 5, position: 'Circular', EffeciencyAuto: 0, EffeciencyManual: 0, EffeciencySemiAuto: 0 },
            { id: 6, position: 'Combination', EffeciencyAuto: 86, EffeciencyManual: 52.5, EffeciencySemiAuto: 69.4 },
        ];
        // General Welding Efficiencies
        this.weldingEfficienciesList = [
            { id: 1, position: 'Flat', EffeciencyAuto: 90, EffeciencyManual: 85, EffeciencySemiAuto: 87.5 },
            { id: 2, position: 'Horizontal', EffeciencyAuto: 90, EffeciencyManual: 85, EffeciencySemiAuto: 87.5 },
            { id: 3, position: 'Vertical', EffeciencyAuto: 85, EffeciencyManual: 80, EffeciencySemiAuto: 82.5 },
            { id: 4, position: 'Overhead', EffeciencyAuto: 80, EffeciencyManual: 75, EffeciencySemiAuto: 77.5 },
            { id: 5, position: 'Circular', EffeciencyAuto: 80, EffeciencyManual: 75, EffeciencySemiAuto: 77.5 },
            { id: 6, position: 'Combination', EffeciencyAuto: 86, EffeciencyManual: 81, EffeciencySemiAuto: 83.5 },
        ];
    }
    getDiscBrushDia() {
        return [
            { materialType: 'Aluminium', discBrush: 20, prepRPM: 2300, cleaningRPM: 1150, discSurfaceArea: 314, partArea: 2000 },
            { materialType: 'Aluminium', discBrush: 50, prepRPM: 1955, cleaningRPM: 978, discSurfaceArea: 1963, partArea: 10000 },
            { materialType: 'Aluminium', discBrush: 70, prepRPM: 1662, cleaningRPM: 831, discSurfaceArea: 3848, partArea: 20000 },
            { materialType: 'Aluminium', discBrush: 100, prepRPM: 1412, cleaningRPM: 706, discSurfaceArea: 7458, partArea: 50000 },
            { materialType: 'Aluminium', discBrush: 120, prepRPM: 1201, cleaningRPM: 600, discSurfaceArea: 11310, partArea: 100000 },
            { materialType: 'Aluminium', discBrush: 144, prepRPM: 1021, cleaningRPM: 510, discSurfaceArea: 16286, partArea: 100001 },
            { materialType: 'Carbon Steel', discBrush: 20, prepRPM: 1600, cleaningRPM: 800, discSurfaceArea: 314, partArea: 2000 },
            { materialType: 'Carbon Steel', discBrush: 50, prepRPM: 1360, cleaningRPM: 680, discSurfaceArea: 1963, partArea: 10000 },
            { materialType: 'Carbon Steel', discBrush: 70, prepRPM: 1156, cleaningRPM: 578, discSurfaceArea: 3848, partArea: 20000 },
            { materialType: 'Carbon Steel', discBrush: 100, prepRPM: 983, cleaningRPM: 491, discSurfaceArea: 7458, partArea: 50000 },
            { materialType: 'Carbon Steel', discBrush: 120, prepRPM: 835, cleaningRPM: 418, discSurfaceArea: 11310, partArea: 100000 },
            { materialType: 'Carbon Steel', discBrush: 144, prepRPM: 710, cleaningRPM: 355, discSurfaceArea: 16286, partArea: 100001 },
            { materialType: 'Stainless Steel', discBrush: 20, prepRPM: 1200, cleaningRPM: 600, discSurfaceArea: 314, partArea: 2000 },
            { materialType: 'Stainless Steel', discBrush: 50, prepRPM: 1020, cleaningRPM: 510, discSurfaceArea: 1963, partArea: 10000 },
            { materialType: 'Stainless Steel', discBrush: 70, prepRPM: 867, cleaningRPM: 434, discSurfaceArea: 3848, partArea: 20000 },
            { materialType: 'Stainless Steel', discBrush: 100, prepRPM: 737, cleaningRPM: 368, discSurfaceArea: 7458, partArea: 50000 },
            { materialType: 'Stainless Steel', discBrush: 120, prepRPM: 626, cleaningRPM: 313, discSurfaceArea: 11310, partArea: 100000 },
            { materialType: 'Stainless Steel', discBrush: 144, prepRPM: 532, cleaningRPM: 266, discSurfaceArea: 16286, partArea: 100001 },
            { materialType: 'Copper', discBrush: 20, prepRPM: 1020, cleaningRPM: 510, discSurfaceArea: 314, partArea: 2000 },
            { materialType: 'Copper', discBrush: 50, prepRPM: 867, cleaningRPM: 434, discSurfaceArea: 1963, partArea: 10000 },
            { materialType: 'Copper', discBrush: 70, prepRPM: 737, cleaningRPM: 368, discSurfaceArea: 3848, partArea: 20000 },
            { materialType: 'Copper', discBrush: 100, prepRPM: 626, cleaningRPM: 313, discSurfaceArea: 7458, partArea: 50000 },
            { materialType: 'Copper', discBrush: 120, prepRPM: 532, cleaningRPM: 266, discSurfaceArea: 11310, partArea: 100000 },
            { materialType: 'Copper', discBrush: 144, prepRPM: 453, cleaningRPM: 226, discSurfaceArea: 16286, partArea: 100001 },
        ];
    }
    getWeldingEfficiency(position, isAutomated) {
        const entry = this.weldingEfficienciesList.find((item) => item.id === position);
        if (!entry) {
            console.warn(`Welding position "${position}" not found. Using default (Flat).`);
            return isAutomated ? 0.9 : 0.85;
        }
        return isAutomated ? entry.EffeciencyAuto / 100 : entry.EffeciencyManual / 100;
    }
    getWeldingEfficiencyData(type = 'welding') {
        if (type === 'stickWelding') {
            return this.stickWeldingEfficiencies;
        }
        return this.weldingEfficienciesList;
    }
    getWeldingData(materialType, thickness, weldingProcess, weldingType) {
        if (thickness == null || Number.isNaN(Number(thickness)))
            return null;
        const type = weldingType !== null && weldingType !== void 0 ? weldingType : null;
        // helper: match requested material against entries which may contain multiple
        // material names separated by commas and the word 'and'
        const matchesMaterial = (entryMaterial, requested) => {
            if (!entryMaterial || !requested)
                return false;
            const requestedNorm = requested.trim().toLowerCase();
            // split on comma or the word 'and' (with optional surrounding spaces)
            const parts = entryMaterial
                .split(/\s*,\s*|\s+and\s+/i)
                .map((p) => p.trim().toLowerCase())
                .filter((p) => p.length > 0);
            return parts.includes(requestedNorm);
        };
        const candidates = weldingProcess === welding_calculator_1.PrimaryProcessType.MigWelding
            ? this.migWeldingData.filter((r) => matchesMaterial(r.MaterialType, materialType) &&
                (type == null || r.Type === type))
            : this.tigWeldingData.filter((r) => matchesMaterial(r.MaterialType, materialType) &&
                (type == null || r.Type === type));
        if (!candidates || candidates.length === 0)
            return null;
        // helper to parse PlateThickness_mm which may be number or range string
        const parseRange = (val) => {
            var _a, _b;
            if (typeof val === 'number')
                return { min: Number(val), max: Number(val), isRange: false };
            if (typeof val === 'string') {
                // normalize spacing
                const s = val.replace(/\s+/g, '');
                const parts = {};
                // match <=number or <number or >=number or >number
                const re = /([\<\>]=?)([0-9]*\.?[0-9]+)/g;
                let m;
                while ((m = re.exec(s)) !== null) {
                    const op = m[1];
                    const num = Number(m[2]);
                    if (op === '<' || op === '<=') {
                        // upper bound
                        parts.max = num;
                        if (op === '<')
                            parts.max = Number((num - Number.EPSILON).toFixed(6));
                    }
                    else if (op === '>' || op === '>=') {
                        parts.min = num;
                        if (op === '>')
                            parts.min = Number((num + Number.EPSILON).toFixed(6));
                    }
                }
                // If no operators matched but string is numeric, treat as exact
                if (!parts.min && !parts.max) {
                    const n = Number(s);
                    if (!Number.isNaN(n))
                        return { min: n, max: n, isRange: false };
                }
                return { min: (_a = parts.min) !== null && _a !== void 0 ? _a : -Infinity, max: (_b = parts.max) !== null && _b !== void 0 ? _b : Infinity, isRange: true };
            }
            return { min: -Infinity, max: Infinity, isRange: true };
        };
        // 1) check exact numeric matches
        const exact = candidates.find((r) => typeof r.PlateThickness_mm === 'number' &&
            Number(r.PlateThickness_mm) === Number(thickness));
        if (exact)
            return exact;
        // 2) check range string matches
        for (const r of candidates) {
            const range = parseRange(r.PlateThickness_mm);
            if (thickness >= range.min && thickness <= range.max)
                return r;
        }
        // 3) numeric candidates sorted ascending
        const numeric = candidates
            .map((r) => ({ row: r, num: Number(r.PlateThickness_mm) }))
            .filter((x) => !Number.isNaN(x.num))
            .sort((a, b) => a.num - b.num);
        const ge = numeric.find((x) => x.num >= Number(thickness));
        if (ge)
            return ge.row;
        // 4) fallback: largest numeric thickness
        if (numeric.length > 0)
            return numeric[numeric.length - 1].row;
        // nothing matched
        return null;
    }
    /**
     * Get unloading time based on part weight
     */
    getUnloadingTime(weight) {
        var _a;
        const unloadingTimeData = [
            { minWeight: 0, maxWeight: 1000, unloadingTimeSec: 10 },
            { minWeight: 1001, maxWeight: 4000, unloadingTimeSec: 30 },
            { minWeight: 4001, maxWeight: 10000, unloadingTimeSec: 60 },
            { minWeight: 10001, maxWeight: 25000, unloadingTimeSec: 120 },
            { minWeight: 25001, maxWeight: Infinity, unloadingTimeSec: 300 },
        ];
        return (((_a = unloadingTimeData.find((d) => weight >= d.minWeight && weight <= d.maxWeight)) === null || _a === void 0 ? void 0 : _a.unloadingTimeSec) || 10);
    }
    defaultPercentages(processTypeId, partComplexity = welding_calculator_1.PartComplexity.Low, percentageType = 'yieldPercentage') {
        const vals = [
            { processTypeId: welding_calculator_1.ProcessType.MigWelding, yieldPercentage: { 1: 97, 2: 95, 3: 93 }, samplingRate: { 1: 5, 2: 8, 3: 10 } },
            { processTypeId: welding_calculator_1.ProcessType.TigWelding, yieldPercentage: { 1: 98, 2: 96, 3: 94 }, samplingRate: { 1: 4, 2: 6, 3: 8 } },
            { processTypeId: welding_calculator_1.ProcessType.SpotWelding, yieldPercentage: { 1: 97, 2: 95, 3: 93 }, samplingRate: { 1: 4, 2: 6, 3: 8 } },
            { processTypeId: welding_calculator_1.ProcessType.StickWelding, yieldPercentage: { 1: 97, 2: 95, 3: 93 }, samplingRate: { 1: 5, 2: 8, 3: 10 } },
            { processTypeId: welding_calculator_1.ProcessType.SeamWelding, yieldPercentage: { 1: 97, 2: 95, 3: 93 }, samplingRate: { 1: 5, 2: 8, 3: 10 } },
            { processTypeId: 147, /* SubMergedArcWelding */ yieldPercentage: { 1: 97, 2: 95, 3: 93 }, samplingRate: { 1: 5, 2: 8, 3: 10 } },
            { processTypeId: 114, /* Sonicwelding */ yieldPercentage: { 1: 98, 2: 97, 3: 96 }, samplingRate: { 1: 1.95, 2: 4, 3: 6 } },
            { processTypeId: 115, /* FrictionWelding */ yieldPercentage: { 1: 97, 2: 95, 3: 93 }, samplingRate: { 1: 4, 2: 6, 3: 8 } },
        ];
        const match = vals.find((x) => x.processTypeId === processTypeId);
        if (match && match[percentageType]) {
            return match[percentageType][partComplexity];
        }
        // Fallback to vals[3] (StickWelding) if not found
        return vals[3][percentageType][partComplexity];
    }
    /**
     * Get default form values for a process
     */
    getFormDefaults(processType, materialType, thickness, automation) {
        const weldingData = this.getWeldingData(materialType, thickness, processType, 'Manual');
        const efficiency = this.getWeldingEfficiency(1, automation === 1) * 100; // Default to Flat (1)
        return {
            current: (weldingData === null || weldingData === void 0 ? void 0 : weldingData.Current_Amps) || 0,
            voltage: (weldingData === null || weldingData === void 0 ? void 0 : weldingData.Voltage_Volts) || 0,
            efficiency: efficiency,
            travelSpeed: (weldingData === null || weldingData === void 0 ? void 0 : weldingData.TravelSpeed_mm_per_sec) || 12
        };
    }
}
exports.WeldingConfigService = WeldingConfigService;
