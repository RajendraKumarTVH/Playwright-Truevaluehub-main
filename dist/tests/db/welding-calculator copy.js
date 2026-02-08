"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeldingCalculator = exports.CostingConfig = exports.MachineType = exports.PrimaryProcessType = exports.ProcessType = exports.PartComplexity = void 0;
exports.calculateLotSize = calculateLotSize;
exports.calculateLifeTimeQtyRemaining = calculateLifeTimeQtyRemaining;
exports.calculatePowerCost = calculatePowerCost;
exports.calculateManufacturingCO2 = calculateManufacturingCO2;
exports.calculateWeldSize = calculateWeldSize;
exports.calculateESG = calculateESG;
// Enums
var PartComplexity;
(function (PartComplexity) {
    PartComplexity[PartComplexity["Low"] = 1] = "Low";
    PartComplexity[PartComplexity["Medium"] = 2] = "Medium";
    PartComplexity[PartComplexity["High"] = 3] = "High";
})(PartComplexity || (exports.PartComplexity = PartComplexity = {}));
var ProcessType;
(function (ProcessType) {
    ProcessType[ProcessType["SeamWelding"] = 88] = "SeamWelding";
    ProcessType[ProcessType["SpotWelding"] = 59] = "SpotWelding";
    ProcessType[ProcessType["MigWelding"] = 39] = "MigWelding";
    ProcessType[ProcessType["StickWelding"] = 209] = "StickWelding";
    ProcessType[ProcessType["TigWelding"] = 67] = "TigWelding";
    ProcessType[ProcessType["WeldingPreparation"] = 176] = "WeldingPreparation";
    ProcessType[ProcessType["WeldingCleaning"] = 177] = "WeldingCleaning";
})(ProcessType || (exports.ProcessType = ProcessType = {}));
var PrimaryProcessType;
(function (PrimaryProcessType) {
    PrimaryProcessType[PrimaryProcessType["SeamWelding"] = 88] = "SeamWelding";
    PrimaryProcessType[PrimaryProcessType["SpotWelding"] = 77] = "SpotWelding";
    PrimaryProcessType[PrimaryProcessType["MigWelding"] = 57] = "MigWelding";
    PrimaryProcessType[PrimaryProcessType["StickWelding"] = 78] = "StickWelding";
    PrimaryProcessType[PrimaryProcessType["TigWelding"] = 58] = "TigWelding";
})(PrimaryProcessType || (exports.PrimaryProcessType = PrimaryProcessType = {}));
var MachineType;
(function (MachineType) {
    MachineType[MachineType["Automatic"] = 1] = "Automatic";
    MachineType[MachineType["SemiAuto"] = 2] = "SemiAuto";
    MachineType[MachineType["Manual"] = 3] = "Manual";
})(MachineType || (exports.MachineType = MachineType = {}));
// Shared Service Logic
class SharedService {
    checkDirtyProperty(fieldName, fieldList) {
        var _a;
        return (((_a = fieldList === null || fieldList === void 0 ? void 0 : fieldList.find((x) => x.formControlName == fieldName && x.subProcessIndex == undefined)) === null || _a === void 0 ? void 0 : _a.isDirty) || false);
    }
    isValidNumber(n) {
        return !n || Number.isNaN(n) || !Number.isFinite(Number(n)) || n < 0
            ? 0
            : Number(Number(n).toFixed(4));
    }
}
// Costing Config
class CostingConfig {
    weldingValuesForPartHandling(weldType = 'welding') {
        if (weldType === 'spotWelding') {
            return [
                { id: 1, toPartWeight: 1, loading: 2, unloading: 2 },
                { id: 2, toPartWeight: 4, loading: 5, unloading: 5 },
                { id: 3, toPartWeight: 10, loading: 10, unloading: 10 },
                { id: 4, toPartWeight: 25, loading: 20, unloading: 20 },
                { id: 5, toPartWeight: 10000, loading: 60, unloading: 60 }
            ];
        }
        else if (weldType === 'seamWelding') {
            return [
                { id: 1, toPartWeight: 1, loading: 8, unloading: 8 },
                { id: 2, toPartWeight: 5, loading: 16, unloading: 16 },
                { id: 3, toPartWeight: 10, loading: 24, unloading: 24 },
                { id: 4, toPartWeight: 20, loading: 32, unloading: 32 },
                { id: 5, toPartWeight: 10000, loading: 60, unloading: 60 }
            ];
        }
        else if (weldType === 'stickWelding') {
            return [
                { id: 1, toPartWeight: 1, loading: 10, unloading: 10 },
                { id: 2, toPartWeight: 4, loading: 30, unloading: 30 },
                { id: 3, toPartWeight: 10, loading: 60, unloading: 60 },
                { id: 4, toPartWeight: 25, loading: 90, unloading: 90 },
                { id: 5, toPartWeight: 10000, loading: 180, unloading: 180 }
            ];
        }
        else {
            return [];
        }
    }
    weldingMachineValuesForSeamWelding() {
        return [
            { id: 1, machine: 'FN-80-H', weldingEfficiency: 38.3333 },
            { id: 2, machine: 'FN-100-H', weldingEfficiency: 34.5 },
            { id: 3, machine: 'FN-160-H', weldingEfficiency: 31.05 },
            { id: 4, machine: 'FN-100-E', weldingEfficiency: 27.945 },
            { id: 5, machine: 'FN-160-E', weldingEfficiency: 25.1505 }
        ];
    }
    spotWeldingValuesForMachineType() {
        return [
            {
                id: 1,
                toPartThickness: 0.254,
                weldForce: 353,
                weldTime: 4,
                holdTime: 5,
                weldCurrent: { 6: 4000, 12: 3200, 18: 2600 },
                openCircuitVoltage: 1.6
            },
            {
                id: 2,
                toPartThickness: 0.5334,
                weldForce: 538,
                weldTime: 6,
                holdTime: 8,
                weldCurrent: { 6: 6500, 12: 5200, 18: 4225 },
                openCircuitVoltage: 1.6
            },
            {
                id: 3,
                toPartThickness: 0.7874,
                weldForce: 719,
                weldTime: 8,
                holdTime: 10,
                weldCurrent: { 6: 8000, 12: 6400, 18: 5200 },
                openCircuitVoltage: 1.6
            },
            {
                id: 4,
                toPartThickness: 1.016,
                weldForce: 908,
                weldTime: 10,
                holdTime: 12,
                weldCurrent: { 6: 8800, 12: 7040, 18: 5720 },
                openCircuitVoltage: 1.6
            },
            {
                id: 5,
                toPartThickness: 1.27,
                weldForce: 1221,
                weldTime: 14,
                holdTime: 16,
                weldCurrent: { 6: 9600, 12: 7680, 18: 6240 },
                openCircuitVoltage: 1.6
            },
            {
                id: 6,
                toPartThickness: 1.5748,
                weldForce: 1477,
                weldTime: 18,
                holdTime: 20,
                weldCurrent: { 6: 10600, 12: 8480, 18: 6890 },
                openCircuitVoltage: 1.6
            },
            {
                id: 7,
                toPartThickness: 1.9812,
                weldForce: 1991,
                weldTime: 25,
                holdTime: 30,
                weldCurrent: { 6: 11800, 12: 9440, 18: 7670 },
                openCircuitVoltage: 1.6
            },
            {
                id: 8,
                toPartThickness: 2.3876,
                weldForce: 2557,
                weldTime: 34,
                holdTime: 35,
                weldCurrent: { 6: 13000, 12: 10400, 18: 8450 },
                openCircuitVoltage: 1.6
            },
            {
                id: 9,
                toPartThickness: 2.7686,
                weldForce: 3175,
                weldTime: 45,
                holdTime: 40,
                weldCurrent: { 6: 14200, 12: 11360, 18: 9230 },
                openCircuitVoltage: 1.6
            },
            {
                id: 10,
                toPartThickness: 3.175,
                weldForce: 3880,
                weldTime: 60,
                holdTime: 45,
                weldCurrent: { 6: 15600, 12: 12480, 18: 10140 },
                openCircuitVoltage: 1.6
            },
            {
                id: 11,
                toPartThickness: 3.9624,
                weldForce: 5512,
                weldTime: 93,
                holdTime: 50,
                weldCurrent: { 6: 18000, 12: 14400, 18: 11700 },
                openCircuitVoltage: 2.5
            },
            {
                id: 12,
                toPartThickness: 4.7498,
                weldForce: 7363,
                weldTime: 130,
                holdTime: 55,
                weldCurrent: { 6: 20500, 12: 16400, 18: 13325 },
                openCircuitVoltage: 2.5
            },
            {
                id: 13,
                toPartThickness: 6.35,
                weldForce: 12258,
                weldTime: 230,
                holdTime: 60,
                weldCurrent: { 6: 26000, 12: 20800, 18: 16900 },
                openCircuitVoltage: 3.55
            }
        ];
    }
    weldingValuesForStickWelding() {
        return [
            {
                id: 1,
                ToPartThickness: 3.175,
                WireDiameter: 1.6,
                Current: 33,
                Voltage: 22.5,
                TravelSpeed: 1.25
            },
            {
                id: 2,
                ToPartThickness: 4.7625,
                WireDiameter: 2.4,
                Current: 83,
                Voltage: 23.5,
                TravelSpeed: 1.5
            },
            {
                id: 3,
                ToPartThickness: 6.35,
                WireDiameter: 3.2,
                Current: 120,
                Voltage: 23.5,
                TravelSpeed: 1.67
            },
            {
                id: 4,
                ToPartThickness: 8,
                WireDiameter: 4,
                Current: 165,
                Voltage: 24,
                TravelSpeed: 1.88
            },
            {
                id: 5,
                ToPartThickness: 9.525,
                WireDiameter: 4.8,
                Current: 208,
                Voltage: 25.5,
                TravelSpeed: 2
            },
            {
                id: 6,
                ToPartThickness: 12.7,
                WireDiameter: 6.4,
                Current: 313,
                Voltage: 26.5,
                TravelSpeed: 2.17
            },
            {
                id: 7,
                ToPartThickness: 10000,
                WireDiameter: 8,
                Current: 400,
                Voltage: 28,
                TravelSpeed: 2.5
            }
        ];
    }
    tigWeldingValuesForMachineType() {
        return [
            {
                id: 1,
                FromPartThickness: 0,
                ToPartThickness: 1.6,
                WireDiameter: 1.6,
                Voltage: 15,
                Current: 90,
                WireFeed: 4,
                TravelSpeed: 4
            },
            {
                id: 1,
                FromPartThickness: 1.7,
                ToPartThickness: 3.2,
                WireDiameter: 2.4,
                Voltage: 18,
                Current: 130,
                WireFeed: 5.5,
                TravelSpeed: 4
            },
            {
                id: 1,
                FromPartThickness: 3.3,
                ToPartThickness: 4.8,
                WireDiameter: 3.2,
                Voltage: 18,
                Current: 225,
                WireFeed: 3.6,
                TravelSpeed: 4
            },
            {
                id: 1,
                FromPartThickness: 4.9,
                ToPartThickness: 100006.4,
                WireDiameter: 4.8,
                Voltage: 27,
                Current: 313,
                WireFeed: 7,
                TravelSpeed: 3
            },
            {
                id: 3,
                FromPartThickness: 0,
                ToPartThickness: 1.6,
                WireDiameter: 1.6,
                Voltage: 15,
                Current: 90,
                WireFeed: 3,
                TravelSpeed: 3
            },
            {
                id: 3,
                FromPartThickness: 1.7,
                ToPartThickness: 3.2,
                WireDiameter: 2.4,
                Voltage: 18,
                Current: 130,
                WireFeed: 4.125,
                TravelSpeed: 3
            },
            {
                id: 3,
                FromPartThickness: 3.3,
                ToPartThickness: 4.8,
                WireDiameter: 3.2,
                Voltage: 18,
                Current: 225,
                WireFeed: 2.7,
                TravelSpeed: 3
            },
            {
                id: 3,
                FromPartThickness: 4.9,
                ToPartThickness: 100006.4,
                WireDiameter: 4.8,
                Voltage: 27,
                Current: 312.5,
                WireFeed: 5.25,
                TravelSpeed: 3
            }
        ];
    }
    weldingValuesForMachineType() {
        return [
            {
                id: 1,
                FromPartThickness: 0,
                ToPartThickness: 1,
                WireDiameter: 0.8,
                Voltage: 15,
                Current: 65,
                WireFeed: 4,
                TravelSpeed: 8
            },
            {
                id: 1,
                FromPartThickness: 1.1,
                ToPartThickness: 1.6,
                WireDiameter: 1,
                Voltage: 18,
                Current: 145,
                WireFeed: 5.5,
                TravelSpeed: 8.5
            },
            {
                id: 1,
                FromPartThickness: 1.7,
                ToPartThickness: 3,
                WireDiameter: 1.2,
                Voltage: 18,
                Current: 140,
                WireFeed: 3.6,
                TravelSpeed: 6.5
            },
            {
                id: 1,
                FromPartThickness: 3.1,
                ToPartThickness: 6,
                WireDiameter: 1.2,
                Voltage: 27,
                Current: 260,
                WireFeed: 7,
                TravelSpeed: 7.9
            },
            {
                id: 1,
                FromPartThickness: 6.1,
                ToPartThickness: 10,
                WireDiameter: 1.2,
                Voltage: 27,
                Current: 290,
                WireFeed: 3.6,
                TravelSpeed: 7.4
            },
            {
                id: 1,
                FromPartThickness: 10.1,
                ToPartThickness: 15,
                WireDiameter: 1.2,
                Voltage: 29.5,
                Current: 310,
                WireFeed: 11,
                TravelSpeed: 6.5
            },
            {
                id: 1,
                FromPartThickness: 15.1,
                ToPartThickness: 100000,
                WireDiameter: 2,
                Voltage: 35,
                Current: 400,
                WireFeed: 12,
                TravelSpeed: 7.8
            },
            {
                id: 3,
                FromPartThickness: 0,
                ToPartThickness: 1,
                WireDiameter: 0.8,
                Voltage: 15,
                Current: 65,
                WireFeed: 3,
                TravelSpeed: 6
            },
            {
                id: 3,
                FromPartThickness: 1.1,
                ToPartThickness: 1.6,
                WireDiameter: 1,
                Voltage: 18,
                Current: 145,
                WireFeed: 4.125,
                TravelSpeed: 6.38
            },
            {
                id: 3,
                FromPartThickness: 1.7,
                ToPartThickness: 3,
                WireDiameter: 1.2,
                Voltage: 18,
                Current: 140,
                WireFeed: 2.7,
                TravelSpeed: 4.88
            },
            {
                id: 3,
                FromPartThickness: 3.1,
                ToPartThickness: 6,
                WireDiameter: 1.2,
                Voltage: 27,
                Current: 260,
                WireFeed: 5.25,
                TravelSpeed: 5.93
            },
            {
                id: 3,
                FromPartThickness: 6.1,
                ToPartThickness: 10,
                WireDiameter: 1.2,
                Voltage: 27,
                Current: 290,
                WireFeed: 2.7,
                TravelSpeed: 5.55
            },
            {
                id: 3,
                FromPartThickness: 10.1,
                ToPartThickness: 15,
                WireDiameter: 1.2,
                Voltage: 29.5,
                Current: 310,
                WireFeed: 8.25,
                TravelSpeed: 4.88
            },
            {
                id: 3,
                FromPartThickness: 15.1,
                ToPartThickness: 100000,
                WireDiameter: 2,
                Voltage: 35,
                Current: 400,
                WireFeed: 9,
                TravelSpeed: 5.85
            }
        ];
    }
    noOfTrackWeld(len) {
        var _a;
        const weldList = [
            { toLength: 100, noOfWeld: 2 },
            { toLength: 250, noOfWeld: 3 },
            { toLength: 500, noOfWeld: 4 },
            { toLength: 1000, noOfWeld: 8 },
            { toLength: 1500, noOfWeld: 12 },
            { toLength: 2000, noOfWeld: 16 },
            { toLength: 2500, noOfWeld: 20 },
            { toLength: 3000, noOfWeld: 24 },
            { toLength: 3500, noOfWeld: 30 },
            { toLength: 4000, noOfWeld: 34 },
            { toLength: 4500, noOfWeld: 38 },
            { toLength: 5000, noOfWeld: 44 },
            { toLength: 5500, noOfWeld: 50 },
            { toLength: 6000, noOfWeld: 54 },
            { toLength: 6500, noOfWeld: 58 },
            { toLength: 7000, noOfWeld: 62 },
            { toLength: 7500, noOfWeld: 68 },
            { toLength: 8000, noOfWeld: 72 },
            { toLength: 8500, noOfWeld: 76 },
            { toLength: 9000, noOfWeld: 80 },
            { toLength: 1000000, noOfWeld: 85 }
        ];
        return (((_a = weldList.find(x => x.toLength >= len)) === null || _a === void 0 ? void 0 : _a.noOfWeld) ||
            weldList[weldList.length - 1].noOfWeld);
    }
    weldPass(len, weldType = 'welding') {
        var _a;
        let weldList = [];
        if (weldType === 'stickWelding') {
            weldList = [
                { toWeldLegLength: 3, noOfWeldPasses: 1 },
                { toWeldLegLength: 6, noOfWeldPasses: 2 },
                { toWeldLegLength: 10000, noOfWeldPasses: 3 }
            ];
        }
        else {
            weldList = [
                { toWeldLegLength: 8, noOfWeldPasses: 1 },
                { toWeldLegLength: 12, noOfWeldPasses: 2 },
                { toWeldLegLength: 10000, noOfWeldPasses: 0 }
            ];
        }
        return (((_a = weldList.find(x => x.toWeldLegLength >= len)) === null || _a === void 0 ? void 0 : _a.noOfWeldPasses) ||
            weldList[weldList.length - 1].noOfWeldPasses);
    }
    weldingDefaultPercentage(processTypeId, partComplexity = 1, percentageType = 'yieldPercentage') {
        var _a, _b, _c, _d;
        const vals = [
            {
                processTypeId: ProcessType.TigWelding,
                yieldPercentage: { 1: 98, 2: 96, 3: 94 },
                samplingRate: { 1: 4, 2: 6, 3: 8 }
            },
            {
                processTypeId: ProcessType.SpotWelding,
                yieldPercentage: { 1: 97, 2: 95, 3: 93 },
                samplingRate: { 1: 4, 2: 6, 3: 8 }
            },
            {
                processTypeId: ProcessType.SeamWelding,
                yieldPercentage: { 1: 97, 2: 95, 3: 93 },
                samplingRate: { 1: 4, 2: 6, 3: 8 }
            },
            {
                processTypeId: ProcessType.MigWelding,
                yieldPercentage: { 1: 97, 2: 95, 3: 93 },
                samplingRate: { 1: 5, 2: 8, 3: 10 }
            },
            {
                processTypeId: ProcessType.StickWelding,
                yieldPercentage: { 1: 97, 2: 95, 3: 93 },
                samplingRate: { 1: 5, 2: 8, 3: 10 }
            },
            {
                processTypeId: 15,
                yieldPercentage: { 1: 97, 2: 95, 3: 93 },
                samplingRate: { 1: 4, 2: 6, 3: 8 }
            } // FrictionWelding
        ];
        return (((_b = (_a = vals.find(x => x.processTypeId === processTypeId)) === null || _a === void 0 ? void 0 : _a[percentageType]) === null || _b === void 0 ? void 0 : _b[partComplexity]) || ((_d = (_c = vals[3]) === null || _c === void 0 ? void 0 : _c[percentageType]) === null || _d === void 0 ? void 0 : _d[partComplexity]));
    }
    weldingPositionList(weldType = 'welding') {
        if (weldType === 'stickWelding') {
            return [
                {
                    id: 1,
                    name: '1G Manual',
                    EffeciencyAuto: 75,
                    EffeciencyManual: 75,
                    EffeciencySemiAuto: 75
                },
                {
                    id: 2,
                    name: '2G Manual',
                    EffeciencyAuto: 65,
                    EffeciencyManual: 65,
                    EffeciencySemiAuto: 65
                },
                {
                    id: 3,
                    name: '3G Manual',
                    EffeciencyAuto: 60,
                    EffeciencyManual: 60,
                    EffeciencySemiAuto: 60
                },
                {
                    id: 4,
                    name: '4G Manual',
                    EffeciencyAuto: 50,
                    EffeciencyManual: 50,
                    EffeciencySemiAuto: 50
                },
                {
                    id: 5,
                    name: '1G Robotic',
                    EffeciencyAuto: 85,
                    EffeciencyManual: 85,
                    EffeciencySemiAuto: 85
                },
                {
                    id: 6,
                    name: '2G Robotic',
                    EffeciencyAuto: 75,
                    EffeciencyManual: 75,
                    EffeciencySemiAuto: 75
                },
                {
                    id: 7,
                    name: '3G Robotic',
                    EffeciencyAuto: 70,
                    EffeciencyManual: 70,
                    EffeciencySemiAuto: 70
                },
                {
                    id: 8,
                    name: '4G Robotic',
                    EffeciencyAuto: 60,
                    EffeciencyManual: 60,
                    EffeciencySemiAuto: 60
                }
            ];
        }
        else {
            return [
                {
                    id: 1,
                    name: 'Flat',
                    EffeciencyAuto: 80,
                    EffeciencyManual: 70,
                    EffeciencySemiAuto: 80
                },
                {
                    id: 2,
                    name: 'Horizontal',
                    EffeciencyAuto: 80,
                    EffeciencyManual: 70,
                    EffeciencySemiAuto: 80
                },
                {
                    id: 3,
                    name: 'Vertical',
                    EffeciencyAuto: 75,
                    EffeciencyManual: 65,
                    EffeciencySemiAuto: 75
                },
                {
                    id: 4,
                    name: 'OverHead',
                    EffeciencyAuto: 75,
                    EffeciencyManual: 65,
                    EffeciencySemiAuto: 75
                }
            ];
        }
    }
    getDiscBrushDia() {
        return [
            {
                materialType: 'Aluminium',
                partArea: 0,
                discBrush: 6,
                prepRPM: 3500,
                cleaningRPM: 3500
            },
            {
                materialType: 'Steel',
                partArea: 0,
                discBrush: 6,
                prepRPM: 3500,
                cleaningRPM: 3500
            }
        ];
    }
}
exports.CostingConfig = CostingConfig;
// Additional Services
class WeldingConfigService {
    constructor(costingConfig) {
        this.costingConfig = costingConfig;
    }
    getWeldingEfficiency(formLength, isAutomated) {
        return isAutomated ? 0.9 : 0.85;
    }
    getWeldingData(materialType, thickness, weldingProcess, weldingType) {
        return {
            TravelSpeed_mm_per_sec: 5,
            Current_Amps: 150,
            Voltage_Volts: 22,
            WireDiameter_mm: 1.2,
            TravelSpeed: 5,
            Voltage: 22,
            current: 150
        };
    }
    getUnloadingTime(weight) {
        return 10;
    }
    defaultPercentages(processTypeId, partComplexity = 1, percentageType = 'yieldPercentage') {
        return this.costingConfig.weldingDefaultPercentage(processTypeId, partComplexity, percentageType);
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
}
class SheetMetalConfigService {
    mapMaterial(name) {
        return name;
    }
}
// Main Calculator Class
class WeldingCalculator {
    constructor() {
        this.weldingMode = 'welding';
        this.shareService = new SharedService();
        this._costingConfig = new CostingConfig();
        this._weldingConfig = new WeldingConfigService(this._costingConfig);
        this._smConfig = new SheetMetalConfigService();
    }
    /**
     * Calculate Lot Size from Annual Volume Quantity
     * Formula: lotSize = annualVolumeQty / 12 (monthly lot sizing)
     * @param annualVolumeQty - The annual volume quantity (EAV)
     * @returns The calculated lot size, rounded to nearest integer
     */
    calculateLotSize(annualVolumeQty) {
        if (!annualVolumeQty || annualVolumeQty <= 0) {
            return 1; // Minimum lot size
        }
        return Math.round(annualVolumeQty / 12);
    }
    calculationForSeamWelding(manufactureInfo, fieldColorsList, manufacturingObj, laborRateDto) {
        this.weldingMode = 'seamWelding';
        this.weldingPreCalc(manufactureInfo, fieldColorsList, manufacturingObj);
        const materialInfo = manufactureInfo.materialInfoList.find(x => x.processId === PrimaryProcessType.SeamWelding);
        manufactureInfo.netMaterialCost = materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.netMatCost;
        manufactureInfo.netPartWeight = materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.netWeight;
        !manufactureInfo.meltingWeight &&
            (manufactureInfo.meltingWeight = manufactureInfo.netPartWeight);
        const weldingPartHandlingValues = this._costingConfig
            .weldingValuesForPartHandling('seamWelding')
            .find(x => x.toPartWeight >= Number(manufactureInfo.meltingWeight) / 1000);
        const machineValues = this._costingConfig
            .weldingMachineValuesForSeamWelding()
            .find(x => manufactureInfo.machineMaster.machineDescription.indexOf(x.machine) >=
            0);
        if (manufactureInfo.iscuttingSpeedDirty && !!manufactureInfo.cuttingSpeed) {
            manufactureInfo.cuttingSpeed = Number(manufactureInfo.cuttingSpeed);
        }
        else {
            let cuttingSpeed = (machineValues === null || machineValues === void 0 ? void 0 : machineValues.weldingEfficiency) || 0;
            if (manufactureInfo.cuttingSpeed) {
                cuttingSpeed = this.shareService.checkDirtyProperty('cuttingSpeed', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.cuttingSpeed
                    : cuttingSpeed;
            }
            manufactureInfo.cuttingSpeed = cuttingSpeed;
        }
        if (manufactureInfo.isUnloadingTimeDirty &&
            !!manufactureInfo.unloadingTime) {
            manufactureInfo.unloadingTime = Number(manufactureInfo.unloadingTime);
        }
        else {
            let unloadingTime = (weldingPartHandlingValues === null || weldingPartHandlingValues === void 0 ? void 0 : weldingPartHandlingValues.unloading) || 0;
            if (manufactureInfo.unloadingTime) {
                unloadingTime = this.shareService.checkDirtyProperty('unloadingTime', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.unloadingTime
                    : unloadingTime;
            }
            manufactureInfo.unloadingTime = unloadingTime;
        }
        if (manufactureInfo.iscycleTimeDirty && !!manufactureInfo.cycleTime) {
            manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
        }
        else {
            let cycleTime = this.shareService.isValidNumber(Number(manufactureInfo.unloadingTime) +
                Number(manufactureInfo.cuttingLength) /
                    Number(manufactureInfo.cuttingSpeed));
            if (manufactureInfo.cycleTime) {
                cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.cycleTime
                    : cycleTime;
            }
            manufactureInfo.cycleTime = cycleTime;
        }
        this.weldingCommonCalc(manufactureInfo, fieldColorsList, manufacturingObj, laborRateDto);
        return manufactureInfo;
    }
    calculationForSpotWelding(manufactureInfo, fieldColorsList, manufacturingObj, laborRateDto) {
        this.weldingMode = 'spotWelding';
        this.weldingPreCalc(manufactureInfo, fieldColorsList, manufacturingObj);
        const materialInfo = manufactureInfo.materialInfoList.find(x => x.processId === PrimaryProcessType.SpotWelding);
        manufactureInfo.netMaterialCost = materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.netMatCost;
        manufactureInfo.netPartWeight = materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.netWeight;
        const partTickness = Number(materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.partTickness) || 0;
        const weldingValues = this._costingConfig
            .spotWeldingValuesForMachineType()
            .find(x => x.toPartThickness >= partTickness);
        const weldingPartHandlingValues = this._costingConfig
            .weldingValuesForPartHandling('spotWelding')
            .find(x => x.toPartWeight >= Number(manufactureInfo.netPartWeight) / 1000);
        if (weldingValues) {
            manufactureInfo.requiredCurrent =
                weldingValues.weldCurrent[Number(materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.wireDiameter)] || 0;
            manufactureInfo.requiredWeldingVoltage = weldingValues.openCircuitVoltage;
            const holdTime = (weldingValues === null || weldingValues === void 0 ? void 0 : weldingValues.holdTime) / 60 / 0.75;
            const squeezeTime = 3;
            const offTime = 2;
            !manufactureInfo.noOfWeldPasses && (manufactureInfo.noOfWeldPasses = 1);
            if (manufactureInfo.isUnloadingTimeDirty &&
                !!manufactureInfo.unloadingTime) {
                manufactureInfo.unloadingTime = Number(manufactureInfo.unloadingTime);
            }
            else {
                let unloadingTime = Number(manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.noOfWeldPasses) *
                    ((weldingPartHandlingValues === null || weldingPartHandlingValues === void 0 ? void 0 : weldingPartHandlingValues.loading) || 0) +
                    ((weldingPartHandlingValues === null || weldingPartHandlingValues === void 0 ? void 0 : weldingPartHandlingValues.unloading) || 0);
                if (manufactureInfo.unloadingTime) {
                    unloadingTime = this.shareService.checkDirtyProperty('unloadingTime', fieldColorsList)
                        ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.unloadingTime
                        : unloadingTime;
                }
                manufactureInfo.unloadingTime = unloadingTime;
            }
            if (manufactureInfo.isDryCycleTimeDirty &&
                !!manufactureInfo.dryCycleTime) {
                manufactureInfo.dryCycleTime = Number(manufactureInfo.dryCycleTime);
            }
            else {
                let dryCycleTime = (squeezeTime + holdTime + offTime) *
                    (Number(manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.noOfTackWeld) || 0);
                if (manufactureInfo.dryCycleTime) {
                    dryCycleTime = this.shareService.checkDirtyProperty('dryCycleTime', fieldColorsList)
                        ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.dryCycleTime
                        : dryCycleTime;
                }
                manufactureInfo.dryCycleTime = dryCycleTime;
            }
            if (manufactureInfo.iscycleTimeDirty && !!manufactureInfo.cycleTime) {
                manufactureInfo.cycleTime = this.shareService.isValidNumber(Number(manufactureInfo.cycleTime));
            }
            else {
                let cycleTime = Number(manufactureInfo.dryCycleTime) +
                    Number(manufactureInfo.unloadingTime);
                if (manufactureInfo.cycleTime) {
                    cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList)
                        ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.cycleTime
                        : cycleTime;
                }
                manufactureInfo.cycleTime = cycleTime;
            }
        }
        this.weldingCommonCalc(manufactureInfo, fieldColorsList, manufacturingObj, laborRateDto);
        manufactureInfo.totalPowerCost = this.shareService.isValidNumber(((Number(manufactureInfo.dryCycleTime) / 3600) *
            Number(manufactureInfo.powerConsumption) *
            Number(manufactureInfo.electricityUnitCost)) /
            (Number(manufactureInfo.efficiency || 100) / 100));
        return manufactureInfo;
    }
    calculationForWelding(manufactureInfo, fieldColorsList, manufacturingObj, laborRateDto) {
        var _a, _b, _c, _d, _e, _f;
        this.weldingMode = 'welding';
        this.weldingPreCalc(manufactureInfo, fieldColorsList, manufacturingObj);
        let materialInfo = null;
        let noOfTackWeld = 0;
        let weldingValues = null;
        let len = 0;
        if (Number(manufactureInfo.processTypeID) === ProcessType.StickWelding) {
            this.weldingMode = 'stickWelding';
            materialInfo = manufactureInfo.materialInfoList.find(x => x.processId === PrimaryProcessType.StickWelding);
            len = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.dimX) || 0;
            const partTickness = Number(materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.partTickness) || 0;
            weldingValues = this._costingConfig
                .weldingValuesForStickWelding()
                .find(x => x.ToPartThickness >= partTickness);
            noOfTackWeld = this._costingConfig.noOfTrackWeld(len);
        }
        else if (Number(manufactureInfo.processTypeID) === ProcessType.TigWelding) {
            this.weldingMode = 'tigWelding';
            materialInfo = manufactureInfo.materialInfoList.find(x => x.processId === PrimaryProcessType.TigWelding);
            len = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.dimX) || 0;
            const partTickness = Number(materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.partTickness) || 0;
            weldingValues = this._costingConfig
                .tigWeldingValuesForMachineType()
                .find(x => x.id === Number(manufactureInfo.semiAutoOrAuto) &&
                x.ToPartThickness >= partTickness);
            noOfTackWeld = len / 50;
        }
        else if (Number(manufactureInfo.processTypeID) === ProcessType.MigWelding) {
            this.weldingMode = 'migWelding';
            materialInfo = manufactureInfo.materialInfoList.find(x => x.processId === PrimaryProcessType.MigWelding);
            len = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.dimX) || 0;
            const partTickness = Number(materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.partTickness) || 0;
            weldingValues = this._costingConfig
                .weldingValuesForMachineType()
                .find(x => x.id === Number(manufactureInfo.semiAutoOrAuto) &&
                x.ToPartThickness >= Number(partTickness));
            noOfTackWeld = len / 50;
        }
        manufactureInfo.netMaterialCost = materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.netMatCost;
        manufactureInfo.netPartWeight = materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.netWeight;
        const materialType = this._smConfig.mapMaterial(((_b = (_a = materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.materialMasterData) === null || _a === void 0 ? void 0 : _a.materialType) === null || _b === void 0 ? void 0 : _b.materialTypeName) ||
            ((materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.materialDescriptionList) &&
                (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.materialDescriptionList.length) > 0
                ? (_c = materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.materialDescriptionList[0]) === null || _c === void 0 ? void 0 : _c.materialTypeName
                : null) ||
            ((_d = manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.materialmasterDatas) === null || _d === void 0 ? void 0 : _d.materialTypeName));
        if ([ProcessType.MigWelding, ProcessType.TigWelding].includes(Number(manufactureInfo.processTypeID))) {
            let totalWeldCycleTime = 0;
            if (manufactureInfo.subProcessFormArray &&
                manufactureInfo.subProcessFormArray.controls) {
                for (let i = 0; i < manufactureInfo.subProcessFormArray.controls.length; i++) {
                    const element = manufactureInfo.subProcessFormArray.controls[i];
                    const subProcessInfo = element.value;
                    const efficiency = this._weldingConfig.getWeldingEfficiency(subProcessInfo.formLength, manufactureInfo.semiAutoOrAuto === 1);
                    const weldingData = this._weldingConfig.getWeldingData(materialType, subProcessInfo.shoulderWidth, materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.processId, 'Manual');
                    let travelSpeed = manufactureInfo.semiAutoOrAuto === 1
                        ? ((weldingData === null || weldingData === void 0 ? void 0 : weldingData.TravelSpeed_mm_per_sec) / 0.8) * efficiency
                        : (weldingData === null || weldingData === void 0 ? void 0 : weldingData.TravelSpeed_mm_per_sec) * efficiency;
                    if (subProcessInfo.formHeight) {
                        travelSpeed = this.checkFormArrayDirtyField('formHeight', i, fieldColorsList)
                            ? (_f = (_e = manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.subProcessTypeInfos) === null || _e === void 0 ? void 0 : _e[i]) === null || _f === void 0 ? void 0 : _f.formHeight
                            : this.shareService.isValidNumber(travelSpeed);
                    }
                    subProcessInfo.formHeight = travelSpeed;
                    const cycleTimeForIntermediateStops = (subProcessInfo.formPerimeter || 0) * 5;
                    // totalWeldLength
                    const totalWeldLength = this.shareService.isValidNumber(subProcessInfo.formLength);
                    // HL Factor
                    if (!subProcessInfo.hlFactor) {
                        subProcessInfo.hlFactor = subProcessInfo.noOfHoles;
                    }
                    const cycleTimeForTackWeld = subProcessInfo.hlFactor * 3;
                    subProcessInfo.recommendTonnage = this.shareService.isValidNumber(totalWeldLength / subProcessInfo.formHeight +
                        cycleTimeForIntermediateStops +
                        cycleTimeForTackWeld);
                    const lengthOfCut = Number(subProcessInfo.lengthOfCut);
                    if (lengthOfCut === 4) {
                        subProcessInfo.recommendTonnage *= 0.95;
                    }
                    else if (lengthOfCut === 5) {
                        subProcessInfo.recommendTonnage *= 1.5;
                    }
                    totalWeldCycleTime += subProcessInfo.recommendTonnage;
                    manufactureInfo.subProcessTypeInfos =
                        manufactureInfo.subProcessTypeInfos || [];
                    manufactureInfo.subProcessTypeInfos.push(subProcessInfo);
                }
            }
            const weldingData = this._weldingConfig.getWeldingData(materialType, 0, materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.processId, 'Manual');
            manufactureInfo.requiredCurrent = weldingData.Current_Amps;
            manufactureInfo.requiredWeldingVoltage = weldingData.Voltage_Volts;
            const loadingTime = this._weldingConfig.getUnloadingTime(materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.netWeight) || 0;
            manufactureInfo.unloadingTime = loadingTime * 2; // load + unload
            const arcOnTime = totalWeldCycleTime + manufactureInfo.unloadingTime;
            const arcOffTime = arcOnTime * 0.05;
            // approx total
            const totWeldCycleTime = (manufactureInfo.noOfWeldPasses || 1) * loadingTime +
                arcOnTime +
                arcOffTime;
            manufactureInfo.cycleTime =
                totWeldCycleTime / (manufactureInfo.efficiency / 100);
            // Power consumption
            manufactureInfo.powerConsumption =
                (Number(manufactureInfo.requiredCurrent) *
                    Number(manufactureInfo.requiredWeldingVoltage)) /
                    1000;
            manufactureInfo.totalPowerCost = this.shareService.isValidNumber((manufactureInfo.cycleTime / 3600) *
                Number(manufactureInfo.powerConsumption) *
                Number(manufactureInfo.electricityUnitCost));
        }
        else {
            if (manufactureInfo.istravelSpeedDirty && !!manufactureInfo.travelSpeed) {
                manufactureInfo.travelSpeed = Number(manufactureInfo.travelSpeed);
            }
            else {
                let travelSpeed = Number(weldingValues === null || weldingValues === void 0 ? void 0 : weldingValues.TravelSpeed) || 0;
                if (manufactureInfo.travelSpeed) {
                    travelSpeed = this.shareService.checkDirtyProperty('travelSpeed', fieldColorsList)
                        ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.travelSpeed
                        : this.shareService.isValidNumber(travelSpeed);
                }
                manufactureInfo.travelSpeed = travelSpeed;
            }
            if (manufactureInfo.isrequiredCurrentDirty &&
                manufactureInfo.requiredCurrent !== null) {
                manufactureInfo.requiredCurrent = Number(manufactureInfo.requiredCurrent);
            }
            else {
                let requiredCurrent = Number(weldingValues === null || weldingValues === void 0 ? void 0 : weldingValues.Current);
                if (manufactureInfo.requiredCurrent !== null)
                    requiredCurrent = this.shareService.checkDirtyProperty('requiredCurrent', fieldColorsList)
                        ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.requiredCurrent
                        : this.shareService.isValidNumber(requiredCurrent);
                manufactureInfo.requiredCurrent = requiredCurrent;
            }
            if (manufactureInfo.isrequiredWeldingVoltageDirty &&
                manufactureInfo.requiredWeldingVoltage != null) {
                manufactureInfo.requiredWeldingVoltage = Number(manufactureInfo.requiredWeldingVoltage);
            }
            else {
                let requiredWeldingVoltage = Number(weldingValues === null || weldingValues === void 0 ? void 0 : weldingValues.Voltage);
                if (manufactureInfo.requiredWeldingVoltage != null)
                    requiredWeldingVoltage = this.shareService.checkDirtyProperty('requiredWeldingVoltage', fieldColorsList)
                        ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.requiredWeldingVoltage
                        : this.shareService.isValidNumber(requiredWeldingVoltage);
                manufactureInfo.requiredWeldingVoltage = requiredWeldingVoltage;
            }
            if (manufactureInfo.isnoOfIntermediateStartAndStopDirty &&
                !!manufactureInfo.noOfIntermediateStartAndStop) {
                manufactureInfo.noOfIntermediateStartAndStop = Number(manufactureInfo.noOfIntermediateStartAndStop);
            }
            else {
                let noOfIntermediateStartAndStop = Number(manufactureInfo.processTypeID) === ProcessType.StickWelding
                    ? 1
                    : 4;
                if (manufactureInfo.noOfIntermediateStartAndStop) {
                    noOfIntermediateStartAndStop = this.shareService.checkDirtyProperty('noOfIntermediateStartAndStop', fieldColorsList)
                        ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.noOfIntermediateStartAndStop
                        : this.shareService.isValidNumber(noOfIntermediateStartAndStop);
                }
                manufactureInfo.noOfIntermediateStartAndStop = Math.round(noOfIntermediateStartAndStop);
            }
            const cycleTimeIntermediateStartAndStop = manufactureInfo.noOfIntermediateStartAndStop *
                (Number(manufactureInfo.processTypeID) === ProcessType.StickWelding
                    ? 3
                    : 5);
            if (manufactureInfo.isnoOfTackWeldDirty && !!manufactureInfo.noOfTackWeld) {
                manufactureInfo.noOfTackWeld = Number(manufactureInfo.noOfTackWeld);
            }
            else {
                if (manufactureInfo.noOfTackWeld) {
                    noOfTackWeld = this.shareService.checkDirtyProperty('noOfTackWeld', fieldColorsList)
                        ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.noOfTackWeld
                        : this.shareService.isValidNumber(noOfTackWeld);
                }
                manufactureInfo.noOfTackWeld = Math.round(noOfTackWeld);
            }
            const cycleTimeTrackWeld = manufactureInfo.noOfTackWeld * 3;
            if (manufactureInfo.isnoOfWeldPassesDirty &&
                !!manufactureInfo.noOfWeldPasses) {
                manufactureInfo.noOfWeldPasses = Number(manufactureInfo.noOfWeldPasses);
            }
            else {
                const wLength = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.weldLegLength) || 0;
                let noOfWeldPasses = this._costingConfig.weldPass(wLength, this.weldingMode) || 1;
                if (manufactureInfo.noOfWeldPasses) {
                    noOfWeldPasses = this.shareService.checkDirtyProperty('noOfWeldPasses', fieldColorsList)
                        ? (manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.noOfWeldPasses) || 1
                        : this.shareService.isValidNumber(noOfWeldPasses);
                }
                manufactureInfo.noOfWeldPasses = noOfWeldPasses;
            }
            if (Number(manufactureInfo.processTypeID) === ProcessType.StickWelding) {
                const weldingPartHandlingValues = this._costingConfig
                    .weldingValuesForPartHandling('stickWelding')
                    .find(x => x.toPartWeight >= Number(manufactureInfo.netPartWeight) / 1000);
                if (manufactureInfo.isUnloadingTimeDirty &&
                    !!manufactureInfo.unloadingTime) {
                    manufactureInfo.unloadingTime = Number(manufactureInfo.unloadingTime);
                }
                else {
                    let unloadingTime = (weldingPartHandlingValues === null || weldingPartHandlingValues === void 0 ? void 0 : weldingPartHandlingValues.unloading) || 0;
                    if (manufactureInfo.unloadingTime) {
                        unloadingTime = this.shareService.checkDirtyProperty('unloadingTime', fieldColorsList)
                            ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.unloadingTime
                            : unloadingTime;
                    }
                    manufactureInfo.unloadingTime = unloadingTime;
                }
            }
            const weldingCycleTime = this.shareService.isValidNumber((len / Number(manufactureInfo.travelSpeed)) *
                Number(manufactureInfo.noOfWeldPasses));
            const totalWeldCycleTime = Number(weldingCycleTime) +
                Number(cycleTimeTrackWeld) +
                Number(cycleTimeIntermediateStartAndStop) +
                (Number(manufactureInfo.unloadingTime) || 0);
            const arcOnTime = this.shareService.isValidNumber(totalWeldCycleTime * 1.05);
            const arcOfTime = this.shareService.isValidNumber(arcOnTime * 0.05);
            let cycleTime = this.shareService.isValidNumber(arcOnTime + arcOfTime);
            if (manufactureInfo.isDryCycleTimeDirty &&
                !!manufactureInfo.dryCycleTime) {
                manufactureInfo.dryCycleTime = Number(manufactureInfo.dryCycleTime);
            }
            else {
                let dryCycleTime = weldingCycleTime;
                if (manufactureInfo.dryCycleTime) {
                    dryCycleTime = this.shareService.checkDirtyProperty('dryCycleTime', fieldColorsList)
                        ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.dryCycleTime
                        : dryCycleTime;
                }
                manufactureInfo.dryCycleTime = dryCycleTime;
            }
            if (Number(manufactureInfo.processTypeID) === ProcessType.StickWelding) {
                cycleTime = totalWeldCycleTime;
            }
            if (manufactureInfo.iscycleTimeDirty && !!manufactureInfo.cycleTime) {
                manufactureInfo.cycleTime = this.shareService.isValidNumber(Number(manufactureInfo.cycleTime));
            }
            else {
                if (manufactureInfo.cycleTime) {
                    cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList)
                        ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.cycleTime
                        : cycleTime;
                }
                manufactureInfo.cycleTime = cycleTime;
            }
            manufactureInfo.totalCycleTime = manufactureInfo.cycleTime;
        }
        this.weldingCommonCalc(manufactureInfo, fieldColorsList, manufacturingObj, laborRateDto);
        return manufactureInfo;
    }
    weldingCommonCalc(manufactureInfo, fieldColorsList, manufacturingObj, laborRateDto) {
        var _a, _b, _c;
        const curCycleTime = this.weldingMode === 'spotWelding'
            ? Number(manufactureInfo.dryCycleTime)
            : Number(manufactureInfo.cycleTime);
        if (this.weldingMode !== 'seamWelding') {
            if (laborRateDto &&
                laborRateDto.length > 0 &&
                !manufactureInfo.electricityUnitCost) {
                manufactureInfo.electricityUnitCost = laborRateDto[0].powerCost;
            }
            if (!manufactureInfo.powerConsumption) {
                manufactureInfo.powerConsumption =
                    (Number(manufactureInfo.requiredCurrent) *
                        Number(manufactureInfo.requiredWeldingVoltage)) /
                        1000;
            }
            manufactureInfo.totalPowerCost = this.shareService.isValidNumber((curCycleTime / 3600) *
                Number(manufactureInfo.powerConsumption) *
                Number(manufactureInfo.electricityUnitCost));
        }
        else {
            manufactureInfo.totalPowerCost = 0;
        }
        // Yield Percentage
        if (!manufactureInfo.yieldPer) {
            manufactureInfo.yieldPer = this._costingConfig.weldingDefaultPercentage(Number(manufactureInfo.processTypeID), manufactureInfo.partComplexity, 'yieldPercentage');
        }
        // Sampling Rate
        if (!manufactureInfo.samplingRate) {
            manufactureInfo.samplingRate =
                this._costingConfig.weldingDefaultPercentage(Number(manufactureInfo.processTypeID), manufactureInfo.partComplexity, 'samplingRate');
        }
        // Direct Labour
        if (!manufactureInfo.noOfLowSkilledLabours) {
            manufactureInfo.noOfLowSkilledLabours =
                ((_c = (_b = (_a = manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.machineMaster) === null || _a === void 0 ? void 0 : _a.machineMarketDtos) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.specialSkilledLabours) || 1;
        }
        // Inspection Time
        if (!manufactureInfo.inspectionTime) {
            manufactureInfo.inspectionTime =
                manufactureInfo.partComplexity == PartComplexity.Low
                    ? 2
                    : manufactureInfo.partComplexity == PartComplexity.Medium
                        ? 5
                        : manufactureInfo.partComplexity == PartComplexity.High
                            ? 10
                            : 0;
        }
        // Direct Machine Cost
        if (!manufactureInfo.directMachineCost) {
            manufactureInfo.directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) / 3600) * curCycleTime);
        }
        // Direct SetUp Cost
        if (!manufactureInfo.directSetUpCost) {
            manufactureInfo.directSetUpCost = this.shareService.isValidNumber(((Number(manufactureInfo.skilledLaborRatePerHour) +
                Number(manufactureInfo.machineHourRate)) *
                (Number(manufactureInfo.setUpTime) / 60)) /
                Number(manufactureInfo.lotSize));
        }
        // Direct Labor Cost
        if (!manufactureInfo.directLaborCost) {
            manufactureInfo.directLaborCost = this.shareService.isValidNumber((Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) *
                (curCycleTime * Number(manufactureInfo.noOfLowSkilledLabours)));
        }
        // Inspection Cost
        if (!manufactureInfo.inspectionCost) {
            const rate = manufactureInfo.qaOfInspectorRate || 0;
            const sampling = manufactureInfo.samplingRate || 100;
            if (this.weldingMode === 'seamWelding') {
                manufactureInfo.inspectionCost = this.shareService.isValidNumber((Number(manufactureInfo.inspectionTime) * rate) /
                    (Number(manufactureInfo.lotSize) * (sampling / 100)));
            }
            else {
                manufactureInfo.inspectionCost = this.shareService.isValidNumber((sampling / 100) *
                    ((Number(manufactureInfo.inspectionTime) * rate) / 3600));
            }
        }
        const sum = this.shareService.isValidNumber(Number(manufactureInfo.directMachineCost || 0) +
            Number(manufactureInfo.directSetUpCost || 0) +
            Number(manufactureInfo.directLaborCost || 0) +
            Number(manufactureInfo.inspectionCost || 0));
        // Yield Cost
        if (!manufactureInfo.yieldCost) {
            const yieldPer = Number(manufactureInfo.yieldPer) || 100;
            if (this.weldingMode === 'seamWelding') {
                manufactureInfo.yieldCost = this.shareService.isValidNumber((1 - yieldPer / 100) * sum);
            }
            else {
                manufactureInfo.yieldCost = this.shareService.isValidNumber((1 - yieldPer / 100) * (Number(manufactureInfo.netMaterialCost) + sum));
            }
        }
        manufactureInfo.directProcessCost = this.shareService.isValidNumber(sum +
            Number(manufactureInfo.yieldCost || 0) +
            Number(manufactureInfo.totalPowerCost || 0));
    }
    calculationsForWeldingPreparation(manufactureInfo, fieldColorsList, manufacturingObj) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
        const weldingLength = ((_a = manufactureInfo.materialInfoList) === null || _a === void 0 ? void 0 : _a.length) > 0
            ? (_b = manufactureInfo.materialInfoList[0]) === null || _b === void 0 ? void 0 : _b.dimX
            : 0;
        const weldingWidth = ((_c = manufactureInfo.materialInfoList) === null || _c === void 0 ? void 0 : _c.length) > 0
            ? (_d = manufactureInfo.materialInfoList[0]) === null || _d === void 0 ? void 0 : _d.dimY
            : 0;
        const weldingHeight = ((_e = manufactureInfo.materialInfoList) === null || _e === void 0 ? void 0 : _e.length) > 0
            ? (_f = manufactureInfo.materialInfoList[0]) === null || _f === void 0 ? void 0 : _f.dimZ
            : 0;
        const netWeight = ((_g = manufactureInfo.materialInfoList) === null || _g === void 0 ? void 0 : _g.length) > 0
            ? ((_h = manufactureInfo.materialInfoList[0]) === null || _h === void 0 ? void 0 : _h.netWeight) / 1000
            : 0;
        manufactureInfo.netMaterialCost =
            ((_j = manufactureInfo.materialInfoList) === null || _j === void 0 ? void 0 : _j.length) > 0
                ? (_k = manufactureInfo.materialInfoList[0]) === null || _k === void 0 ? void 0 : _k.netMatCost
                : 0;
        const crossSectionArea = 2 * weldingLength * Math.max(weldingWidth, weldingHeight);
        const materialType = (_m = (_l = manufactureInfo.materialmasterDatas) === null || _l === void 0 ? void 0 : _l.materialType) === null || _m === void 0 ? void 0 : _m.materialTypeName;
        let lookupListDia = (_p = (_o = this._costingConfig
            .getDiscBrushDia()) === null || _o === void 0 ? void 0 : _o.filter(x => x.materialType === materialType && x.partArea >= crossSectionArea)) === null || _p === void 0 ? void 0 : _p[0];
        if (crossSectionArea > 100001) {
            lookupListDia = (_s = (_r = (_q = this._costingConfig
                .getDiscBrushDia()) === null || _q === void 0 ? void 0 : _q.filter(x => x.materialType === materialType)) === null || _r === void 0 ? void 0 : _r.reverse()) === null || _s === void 0 ? void 0 : _s[0];
        }
        let discBrushDia = 0, deburringRPM = 0;
        if (lookupListDia) {
            discBrushDia = lookupListDia === null || lookupListDia === void 0 ? void 0 : lookupListDia.discBrush;
            deburringRPM =
                Number(manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.processTypeID) === ProcessType.WeldingPreparation
                    ? lookupListDia === null || lookupListDia === void 0 ? void 0 : lookupListDia.prepRPM
                    : lookupListDia === null || lookupListDia === void 0 ? void 0 : lookupListDia.cleaningRPM;
        }
        const feedPerREvRough = this.shareService.isValidNumber(discBrushDia / 2);
        const feedPerREvFinal = this.shareService.isValidNumber(discBrushDia / 4);
        const noOfPasses = this.shareService.isValidNumber(Math.ceil(weldingWidth / discBrushDia));
        const handlingTime = netWeight < 5
            ? 10
            : netWeight < 10
                ? 16
                : netWeight < 20
                    ? 24
                    : netWeight > 20
                        ? 32
                        : 0;
        if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
            manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
        }
        else {
            let cycleTime = this.shareService.isValidNumber(handlingTime +
                (2 * (weldingLength + 5) * noOfPasses * 60) /
                    feedPerREvRough /
                    deburringRPM);
            if (Number(manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.processTypeID) === ProcessType.WeldingCleaning) {
                cycleTime += this.shareService.isValidNumber((2 * (weldingLength + 5) * noOfPasses * 60) /
                    feedPerREvFinal /
                    deburringRPM);
            }
            if (manufactureInfo.cycleTime != null) {
                cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.cycleTime
                    : cycleTime;
            }
            manufactureInfo.cycleTime = cycleTime;
        }
        // Costs
        // Direct Machine Cost
        if (manufactureInfo.isdirectMachineCostDirty &&
            manufactureInfo.directMachineCost != null) {
            manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
        }
        else {
            let directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) *
                Number(manufactureInfo.cycleTime)) /
                3600 /
                (Number(manufactureInfo.efficiency) / 100));
            if (manufactureInfo.directMachineCost != null) {
                directMachineCost = this.shareService.checkDirtyProperty('directMachineCost', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.directMachineCost
                    : directMachineCost;
            }
            manufactureInfo.directMachineCost = directMachineCost;
        }
        // Direct Setup Cost
        if (manufactureInfo.isdirectSetUpCostDirty &&
            manufactureInfo.directSetUpCost != null) {
            manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
        }
        else {
            let directSetUpCost = (((Number(manufactureInfo.noOfLowSkilledLabours) *
                Number(manufactureInfo.setUpTime)) /
                60) *
                Number(manufactureInfo.lowSkilledLaborRatePerHour)) /
                (Number(manufactureInfo.efficiency) / 100) /
                Number(manufactureInfo.lotSize) +
                (((Number(manufactureInfo.noOfSkilledLabours) *
                    Number(manufactureInfo.skilledLaborRatePerHour)) /
                    60) *
                    Number(manufactureInfo.setUpTime)) /
                    (Number(manufactureInfo.efficiency) / 100) /
                    Number(manufactureInfo.lotSize);
            if (manufactureInfo.directSetUpCost != null) {
                directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.setUpCost
                    : directSetUpCost;
            }
            manufactureInfo.directSetUpCost = directSetUpCost;
        }
        // Direct Labor Cost
        if (manufactureInfo.isdirectLaborCostDirty &&
            manufactureInfo.directLaborCost != null) {
            manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
        }
        else {
            let directLaborCost = this.shareService.isValidNumber((Number(manufactureInfo.noOfLowSkilledLabours) *
                Number(manufactureInfo.lowSkilledLaborRatePerHour) *
                Number(manufactureInfo.cycleTime)) /
                3600 /
                (Number(manufactureInfo.efficiency) / 100) +
                (Number(manufactureInfo.noOfSkilledLabours) *
                    Number(manufactureInfo.skilledLaborRatePerHour) *
                    Number(manufactureInfo.cycleTime)) /
                    3600 /
                    (Number(manufactureInfo.efficiency) / 100));
            if (manufactureInfo.directLaborCost != null) {
                directLaborCost = this.shareService.checkDirtyProperty('directLaborCost', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.directLaborCost
                    : directLaborCost;
            }
            manufactureInfo.directLaborCost = directLaborCost;
        }
        // Inspection Cost
        if (manufactureInfo.isinspectionCostDirty &&
            manufactureInfo.inspectionCost != null) {
            manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
        }
        else {
            let inspectionCost = this.shareService.isValidNumber(((manufactureInfo.inspectionTime / 60) *
                Number(manufactureInfo.qaOfInspector) *
                Number(manufactureInfo.qaOfInspectorRate)) /
                (Number(manufactureInfo.efficiency) / 100) /
                Number(manufactureInfo.lotSize));
            if (manufactureInfo.inspectionCost != null) {
                inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.inspectionCost
                    : inspectionCost;
            }
            manufactureInfo.inspectionCost = inspectionCost;
        }
        if (manufactureInfo.isyieldPercentDirty && manufactureInfo.yieldPer != null) {
            manufactureInfo.yieldPer = Number(manufactureInfo.yieldPer);
        }
        else {
            manufactureInfo.yieldPer = this._costingConfig.weldingDefaultPercentage(Number(manufactureInfo.processTypeID), manufactureInfo.partComplexity, 'yieldPercentage');
        }
        // Total costs summing would happen here similarly if needed for prep
        return manufactureInfo;
    }
    safeDiv(num, denom1, denom2) {
        if (!denom1 || !denom2)
            return 0;
        return this.shareService.isValidNumber(num / denom1 / denom2);
    }
    calculationsForWeldingCleaning(manufactureInfo, fieldColorsList, manufacturingObj) {
        var _a, _b, _c, _d, _e, _f, _g;
        const materialInfoList = Array.isArray(manufactureInfo.materialInfoList)
            ? manufactureInfo.materialInfoList
            : [];
        const materialInfo = materialInfoList.find(rec => rec.processId === PrimaryProcessType.MigWelding ||
            rec.processId === PrimaryProcessType.TigWelding) || null;
        const weldingMaterialDetails = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.coreCostDetails) || [];
        // Finish Type
        if (manufactureInfo.isTypeOfOperationDirty &&
            manufactureInfo.typeOfOperationId !== null) {
            manufactureInfo.typeOfOperationId = Number(manufactureInfo.typeOfOperationId);
        }
        else {
            let partType = 1;
            if (manufactureInfo.typeOfOperationId !== null) {
                partType = this.shareService.checkDirtyProperty('typeOfOperationId', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.typeOfOperationId
                    : partType;
            }
            manufactureInfo.typeOfOperationId = partType;
        }
        // Cutting Length
        if (manufactureInfo.isCuttingLengthDirty &&
            manufactureInfo.cuttingLength !== null) {
            manufactureInfo.cuttingLength = Number(manufactureInfo.cuttingLength);
        }
        else {
            let totalWeldLength = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.totalWeldLength) || 0;
            if (manufactureInfo.cuttingLength !== null) {
                totalWeldLength = this.shareService.checkDirtyProperty('cuttingLength', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.cuttingLength
                    : totalWeldLength;
            }
            manufactureInfo.cuttingLength = totalWeldLength;
        }
        const maxWeldElementSize = weldingMaterialDetails.length > 0
            ? Math.max(...weldingMaterialDetails.map((item) => item.coreWeight))
            : 0;
        const weldCrossSectionalArea = 2 * manufactureInfo.cuttingLength * maxWeldElementSize;
        const materialType = (_b = (_a = manufactureInfo.materialmasterDatas) === null || _a === void 0 ? void 0 : _a.materialType) === null || _b === void 0 ? void 0 : _b.materialTypeName;
        let lookupListDia = (_d = (_c = this._weldingConfig
            .getDiscBrushDia()) === null || _c === void 0 ? void 0 : _c.filter(x => x.materialType === materialType &&
            x.partArea >= weldCrossSectionalArea)) === null || _d === void 0 ? void 0 : _d[0];
        if (weldCrossSectionalArea > 100001) {
            lookupListDia = (_g = (_f = (_e = this._weldingConfig
                .getDiscBrushDia()) === null || _e === void 0 ? void 0 : _e.filter(x => x.materialType === materialType)) === null || _f === void 0 ? void 0 : _f.reverse()) === null || _g === void 0 ? void 0 : _g[0];
        }
        let discBrushDia = 0, deburringRPM = 0;
        if (lookupListDia) {
            discBrushDia = lookupListDia === null || lookupListDia === void 0 ? void 0 : lookupListDia.discBrush;
            deburringRPM =
                Number(manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.processTypeID) ===
                    ProcessType.WeldingPreparation
                    ? lookupListDia === null || lookupListDia === void 0 ? void 0 : lookupListDia.prepRPM
                    : lookupListDia === null || lookupListDia === void 0 ? void 0 : lookupListDia.cleaningRPM;
        }
        manufactureInfo.netMaterialCost = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.netMatCost) || 0;
        const feedPerREvRough = this.shareService.isValidNumber(discBrushDia / 2);
        const feedPerREvFinal = this.shareService.isValidNumber(discBrushDia / 4);
        const noOfPasses = this.shareService.isValidNumber(Math.ceil(maxWeldElementSize / discBrushDia));
        const reorientaionTime = this._weldingConfig.getUnloadingTime(materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.netWeight) || 0;
        if (manufactureInfo.isCuttingLengthDirty &&
            manufactureInfo.noOfWeldPasses !== null) {
            manufactureInfo.noOfWeldPasses = Number(manufactureInfo.noOfWeldPasses);
        }
        else {
            let noOfIntermediateStartStops = 0;
            noOfIntermediateStartStops = weldingMaterialDetails.reduce((sum, weldDetail) => sum +
                (weldDetail.coreArea === 1
                    ? weldDetail.coreVolume
                    : weldDetail.coreVolume * weldDetail.coreArea), 0);
            if (manufactureInfo.noOfWeldPasses !== null) {
                noOfIntermediateStartStops = this.shareService.checkDirtyProperty('noOfWeldPasses', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.noOfWeldPasses
                    : noOfIntermediateStartStops;
            }
            manufactureInfo.noOfWeldPasses = noOfIntermediateStartStops;
        }
        const partHandlingTime = reorientaionTime + manufactureInfo.noOfWeldPasses * 5;
        const term = 2 * (manufactureInfo.cuttingLength + 5) * noOfPasses * 60;
        const processTime = partHandlingTime +
            this.safeDiv(term, feedPerREvRough, deburringRPM) +
            (manufactureInfo.typeOfOperationId === 1
                ? 0
                : this.safeDiv(term, feedPerREvFinal, deburringRPM));
        if (manufactureInfo.isefficiencyDirty && !!manufactureInfo.efficiency) {
            manufactureInfo.efficiency = Number(manufactureInfo.efficiency);
        }
        else {
            manufactureInfo.efficiency = this.shareService.checkDirtyProperty('efficiency', fieldColorsList)
                ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.efficiency
                : this.shareService.isValidNumber(manufactureInfo.efficiency);
            if (Number(manufactureInfo.efficiency) < 1) {
                manufactureInfo.efficiency *= 100;
            }
        }
        if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime !== null) {
            manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
        }
        else {
            let cycleTime = this.shareService.isValidNumber(processTime / (Number(manufactureInfo.efficiency) / 100));
            if (manufactureInfo.cycleTime !== null) {
                cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.cycleTime
                    : cycleTime;
            }
            manufactureInfo.cycleTime = cycleTime;
        }
        if (manufactureInfo.isdirectMachineCostDirty &&
            manufactureInfo.directMachineCost !== null) {
            manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
        }
        else {
            let directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) *
                Number(manufactureInfo.cycleTime)) /
                3600);
            if (manufactureInfo.directMachineCost !== null) {
                directMachineCost = this.shareService.checkDirtyProperty('directMachineCost', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.directMachineCost
                    : directMachineCost;
            }
            manufactureInfo.directMachineCost = directMachineCost;
        }
        if (manufactureInfo.isdirectSetUpCostDirty &&
            manufactureInfo.directSetUpCost !== null) {
            manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
        }
        else {
            let directSetUpCost = this.shareService.isValidNumber(((Number(manufactureInfo.machineHourRate) +
                Number(manufactureInfo.skilledLaborRatePerHour)) *
                (Number(manufactureInfo.setUpTime) / 60)) /
                Number(manufactureInfo.lotSize));
            if (manufactureInfo.directSetUpCost !== null) {
                directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.setUpCost
                    : directSetUpCost;
            }
            manufactureInfo.directSetUpCost = directSetUpCost;
        }
        if (manufactureInfo.isdirectLaborCostDirty &&
            manufactureInfo.directLaborCost != null) {
            manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
        }
        else {
            let directLaborCost = this.shareService.isValidNumber((Number(manufactureInfo.noOfLowSkilledLabours) *
                Number(manufactureInfo.lowSkilledLaborRatePerHour) *
                Number(manufactureInfo.cycleTime)) /
                3600);
            if (manufactureInfo.directLaborCost !== null) {
                directLaborCost = this.shareService.checkDirtyProperty('directLaborCost', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.directLaborCost
                    : directLaborCost;
            }
            manufactureInfo.directLaborCost = directLaborCost;
        }
        if (manufactureInfo.isinspectionTimeDirty &&
            manufactureInfo.inspectionTime !== null) {
            manufactureInfo.inspectionTime = Number(manufactureInfo.inspectionTime);
        }
        else {
            let inspectionTime = manufactureInfo.partComplexity == PartComplexity.Low
                ? 0.25
                : manufactureInfo.partComplexity == PartComplexity.Medium
                    ? 0.5
                    : manufactureInfo.partComplexity == PartComplexity.High
                        ? 1
                        : 0;
            if (manufactureInfo.inspectionTime !== null) {
                inspectionTime = this.shareService.checkDirtyProperty('inspectionTime', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.inspectionTime
                    : inspectionTime;
            }
            manufactureInfo.inspectionTime = inspectionTime;
        }
        return manufactureInfo;
    }
    weldingPreCalc(manufactureInfo, fieldColorsList, manufacturingObj) {
        // Set Up Time default
        manufactureInfo.setUpTime = manufactureInfo.setUpTime || 30;
        // Yield Percentage
        if (manufactureInfo.isyieldPercentDirty && !!manufactureInfo.yieldPer) {
            manufactureInfo.yieldPer = this.shareService.isValidNumber(Number(manufactureInfo.yieldPer));
        }
        else {
            let yieldPer = this._costingConfig.weldingDefaultPercentage(Number(manufactureInfo.processTypeID), manufactureInfo.partComplexity, 'yieldPercentage');
            if (manufactureInfo.yieldPer) {
                yieldPer = this.shareService.checkDirtyProperty('yieldPer', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.yieldPer
                    : this.shareService.isValidNumber(yieldPer);
            }
            manufactureInfo.yieldPer = yieldPer;
        }
        // Sampling Rate
        if (manufactureInfo.isSamplingRateDirty && !!manufactureInfo.samplingRate) {
            manufactureInfo.samplingRate = this.shareService.isValidNumber(Number(manufactureInfo.samplingRate));
        }
        else {
            let samplingRate = this._costingConfig.weldingDefaultPercentage(Number(manufactureInfo.processTypeID), manufactureInfo.partComplexity, 'samplingRate');
            if (manufactureInfo.samplingRate) {
                samplingRate = this.shareService.checkDirtyProperty('samplingRate', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.samplingRate
                    : this.shareService.isValidNumber(samplingRate);
            }
            manufactureInfo.samplingRate = samplingRate;
        }
        // Critical Logic: Efficiency Calculation (mirrors service logic)
        if (manufactureInfo.isefficiencyDirty && !!manufactureInfo.efficiency) {
            manufactureInfo.efficiency = Number(manufactureInfo.efficiency);
        }
        else {
            let efficiency = 75;
            const weldingEffeciencyValues = this._costingConfig
                .weldingPositionList(Number(manufactureInfo.processTypeID) === ProcessType.StickWelding
                ? 'stickWelding'
                : 'welding')
                .find(x => x.id === Number(manufactureInfo.weldingPosition));
            if (manufactureInfo.semiAutoOrAuto == MachineType.Automatic) {
                efficiency = Number((weldingEffeciencyValues === null || weldingEffeciencyValues === void 0 ? void 0 : weldingEffeciencyValues.EffeciencyAuto) || efficiency);
            }
            else if (manufactureInfo.semiAutoOrAuto == MachineType.Manual) {
                efficiency = Number((weldingEffeciencyValues === null || weldingEffeciencyValues === void 0 ? void 0 : weldingEffeciencyValues.EffeciencyManual) || efficiency);
            }
            else {
                efficiency = Number((weldingEffeciencyValues === null || weldingEffeciencyValues === void 0 ? void 0 : weldingEffeciencyValues.EffeciencySemiAuto) || efficiency);
            }
            if (manufactureInfo.efficiency) {
                efficiency = this.shareService.checkDirtyProperty('efficiency', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.efficiency
                    : this.shareService.isValidNumber(efficiency);
            }
            manufactureInfo.efficiency = efficiency;
        }
        // Normalize efficiency to percentage if <= 1 (e.g. 0.75 -> 75)
        if (manufactureInfo.efficiency <= 1) {
            manufactureInfo.efficiency = manufactureInfo.efficiency * 100;
        }
        if (!manufactureInfo.efficiency) {
            manufactureInfo.efficiency = 75;
        }
    }
    checkFormArrayDirtyField(fieldName, index, fieldColorsList) {
        var _a;
        return (((_a = fieldColorsList === null || fieldColorsList === void 0 ? void 0 : fieldColorsList.find((x) => x.formControlName == fieldName && x.subProcessIndex == index)) === null || _a === void 0 ? void 0 : _a.isDirty) || false);
    }
}
exports.WeldingCalculator = WeldingCalculator;
function calculateLotSize(annualVolumeQty) {
    if (!annualVolumeQty || annualVolumeQty <= 0) {
        return 1; // Minimum lot size
    }
    return Math.round(annualVolumeQty / 12);
}
function calculateLifeTimeQtyRemaining(annualVolumeQty, productLifeRemaining) {
    if (!annualVolumeQty || annualVolumeQty <= 0) {
        return 0;
    }
    if (!productLifeRemaining || productLifeRemaining <= 0) {
        return 0;
    }
    const lifeTimeQty = annualVolumeQty * productLifeRemaining;
    // Maximum cap of 100,000,000
    return lifeTimeQty > 100000000 ? 100000000 : lifeTimeQty;
}
/**
 * Calculate total power cost per part
 * @param cycleTimeSeconds - Cycle time in seconds
 * @param powerConsumptionKW - Power consumption in kW
 * @param electricityUnitCost - Cost per kWh
 * @returns Total power cost per part
 */
function calculatePowerCost(cycleTimeSeconds, powerConsumptionKW, electricityUnitCost) {
    return (cycleTimeSeconds / 3600) * powerConsumptionKW * electricityUnitCost;
}
/**
 * Calculate manufacturing CO2 impact per part
 * @param cycleTimeSeconds - Cycle time in seconds
 * @param powerConsumptionKW - Power consumption in kW
 * @param co2PerKwHr - CO2 factor (kg/kWh)
 * @returns CO2 per part (kg)
 */
function calculateManufacturingCO2(cycleTimeSeconds, powerConsumptionKW, co2PerKwHr) {
    return (cycleTimeSeconds / 3600) * powerConsumptionKW * co2PerKwHr;
}
function calculateWeldSize(value) {
    if (value <= 8)
        return Math.round(value);
    if (value < 12)
        return 6;
    return 8;
}
function calculateESG(material) {
    const esgImpactCO2Kg = Number(material.materialMarketData.esgImpactCO2Kg);
    const esgImpactCO2KgScrap = Number(material.materialMarketData.esgImpactCO2KgScrap);
    const esgImpactCO2KgPart = (material.grossWeight / 1000) * esgImpactCO2Kg -
        (material.scrapWeight / 1000) * esgImpactCO2KgScrap;
    const esgAnnualVolumeKg = (material.netWeight / 1000) * material.eav;
    const esgAnnualKgCO2 = esgImpactCO2Kg * esgAnnualVolumeKg;
    return {
        esgImpactCO2Kg,
        esgImpactCO2KgScrap,
        esgImpactCO2KgPart,
        esgAnnualVolumeKg,
        esgAnnualKgCO2
    };
}
