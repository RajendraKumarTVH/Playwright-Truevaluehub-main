"use strict";
// Welding Enums and Constants
// Extracted for cleaner separation of concerns
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeldingWeightLossData = exports.MigWeldingData = exports.MachineType = exports.PrimaryProcessType = exports.ProcessType = exports.PartComplexity = void 0;
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
// MIG Welding Data
exports.MigWeldingData = [
    {
        MaterialType: 'Carbon Steel',
        Type: 'Manual',
        PlateThickness_mm: 1,
        WireDiameter_mm: 0.8,
        Voltage_Volts: 15,
        Current_Amps: 65,
        WireFeed_m_per_min: 3,
        TravelSpeed_mm_per_sec: 6.97
    },
    {
        MaterialType: 'Carbon Steel',
        Type: 'Manual',
        PlateThickness_mm: 1.6,
        WireDiameter_mm: 0.8,
        Voltage_Volts: 18,
        Current_Amps: 145,
        WireFeed_m_per_min: 4.125,
        TravelSpeed_mm_per_sec: 6.06
    },
    {
        MaterialType: 'Carbon Steel',
        Type: 'Manual',
        PlateThickness_mm: 3,
        WireDiameter_mm: 0.8,
        Voltage_Volts: 18,
        Current_Amps: 140,
        WireFeed_m_per_min: 2.7,
        TravelSpeed_mm_per_sec: 5.27
    },
    {
        MaterialType: 'Carbon Steel',
        Type: 'Manual',
        PlateThickness_mm: 3,
        WireDiameter_mm: 0.8,
        Voltage_Volts: 27,
        Current_Amps: 260,
        WireFeed_m_per_min: 5.25,
        TravelSpeed_mm_per_sec: 4.58
    },
    {
        MaterialType: 'Carbon Steel',
        Type: 'Manual',
        PlateThickness_mm: 4,
        WireDiameter_mm: 1.2,
        Voltage_Volts: 27,
        Current_Amps: 290,
        WireFeed_m_per_min: 2.7,
        TravelSpeed_mm_per_sec: 4.17
    },
    {
        MaterialType: 'Carbon Steel',
        Type: 'Manual',
        PlateThickness_mm: 5,
        WireDiameter_mm: 1.2,
        Voltage_Volts: 29.5,
        Current_Amps: 310,
        WireFeed_m_per_min: 8.25,
        TravelSpeed_mm_per_sec: 4.75
    },
    {
        MaterialType: 'Carbon Steel',
        Type: 'Manual',
        PlateThickness_mm: 6,
        WireDiameter_mm: 1.2,
        Voltage_Volts: 35,
        Current_Amps: 400,
        WireFeed_m_per_min: 9,
        TravelSpeed_mm_per_sec: 4.5
    },
    {
        MaterialType: 'Carbon Steel',
        Type: 'Manual',
        PlateThickness_mm: 8,
        WireDiameter_mm: 1.2,
        Voltage_Volts: 35,
        Current_Amps: 400,
        WireFeed_m_per_min: 9,
        TravelSpeed_mm_per_sec: 3.58
    }
];
// Welding Weight Loss Data
exports.WeldingWeightLossData = [
    { MaterialType: 'Carbon Steel', WireDiameter_mm: 0.8, loss_g: 0.158 },
    { MaterialType: 'Carbon Steel', WireDiameter_mm: 1.0, loss_g: 0.246 },
    { MaterialType: 'Carbon Steel', WireDiameter_mm: 1.2, loss_g: 0.355 },
    { MaterialType: 'Carbon Steel', WireDiameter_mm: 1.6, loss_g: 0.631 },
    { MaterialType: 'Carbon Steel', WireDiameter_mm: 2.0, loss_g: 1.005 },
    { MaterialType: 'Stainless Steel', WireDiameter_mm: 0.8, loss_g: 0.16 },
    { MaterialType: 'Stainless Steel', WireDiameter_mm: 1.0, loss_g: 0.252 },
    { MaterialType: 'Stainless Steel', WireDiameter_mm: 1.2, loss_g: 0.369 },
    { MaterialType: 'Stainless Steel', WireDiameter_mm: 1.6, loss_g: 0.665 },
    { MaterialType: 'Stainless Steel', WireDiameter_mm: 2.0, loss_g: 1.061 },
    { MaterialType: 'Aluminium', WireDiameter_mm: 0.8, loss_g: 0.054 },
    { MaterialType: 'Aluminium', WireDiameter_mm: 1.0, loss_g: 0.085 },
    { MaterialType: 'Aluminium', WireDiameter_mm: 1.2, loss_g: 0.122 },
    { MaterialType: 'Aluminium', WireDiameter_mm: 1.6, loss_g: 0.217 },
    { MaterialType: 'Aluminium', WireDiameter_mm: 2.0, loss_g: 0.326 },
    { MaterialType: 'Copper Alloy', WireDiameter_mm: 0.8, loss_g: 0.18 },
    { MaterialType: 'Copper Alloy', WireDiameter_mm: 1.0, loss_g: 0.281 },
    { MaterialType: 'Copper Alloy', WireDiameter_mm: 1.2, loss_g: 0.405 },
    { MaterialType: 'Copper Alloy', WireDiameter_mm: 1.6, loss_g: 0.719 },
    { MaterialType: 'Copper Alloy', WireDiameter_mm: 2.0, loss_g: 1.12 }
];
