"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlasticRubberConfig = void 0;
class PlasticRubberConfig {
    static getCompressionMoldingHardnessDuo(duro) {
        var _a;
        const list = [
            { duro: 10, cycleTime: 74 },
            { duro: 20, cycleTime: 87 },
            { duro: 30, cycleTime: 100 },
            { duro: 40, cycleTime: 114 },
            { duro: 50, cycleTime: 127 },
            { duro: 60, cycleTime: 140 },
            { duro: 70, cycleTime: 154 },
            { duro: 80, cycleTime: 167 },
            { duro: 90, cycleTime: 180 },
            { duro: 100, cycleTime: 194 },
        ];
        return ((_a = list.find((x) => x.duro == duro)) === null || _a === void 0 ? void 0 : _a.cycleTime) || 0;
    }
    static getKFactorRubberIM(materialType) {
        var _a, _b;
        const list = [
            { materialType: 'Nitrile Rubber', kFactor: 1 },
            { materialType: 'EPDM-Ethylene-Propylene Terpolymer Rubber', kFactor: 1.2 },
            { materialType: 'NBR', kFactor: 1 },
            { materialType: 'SBR-Styrene Butadiene Rubber', kFactor: 1.1 },
            { materialType: 'LSR', kFactor: 0.6 },
            { materialType: 'Other material', kFactor: 1.5 },
        ];
        return (_b = (_a = list.find((item) => item.materialType === materialType)) === null || _a === void 0 ? void 0 : _a.kFactor) !== null && _b !== void 0 ? _b : 1.5;
    }
}
exports.PlasticRubberConfig = PlasticRubberConfig;
