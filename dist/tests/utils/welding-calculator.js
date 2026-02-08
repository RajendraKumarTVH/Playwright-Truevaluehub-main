"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationHelper = exports.WeldingCalculator = exports.WeldingWeightLossData = exports.MachineType = exports.PrimaryProcessType = exports.ProcessType = exports.MigWeldingData = exports.PartComplexity = void 0;
exports.getWireDiameter = getWireDiameter;
exports.getWeldTypeId = getWeldTypeId;
exports.calculateSingleWeldCycleTime = calculateSingleWeldCycleTime;
exports.calculateArcOnTime = calculateArcOnTime;
exports.calculateArcOffTime = calculateArcOffTime;
exports.calculateWeldCycleTimeBreakdown = calculateWeldCycleTimeBreakdown;
exports.calculateSubProcessCycleTime = calculateSubProcessCycleTime;
exports.calculateTotalWeldCycleTime = calculateTotalWeldCycleTime;
exports.calculationForWeldingWrapper = calculationForWeldingWrapper;
exports.calculationForSeamWeldingWrapper = calculationForSeamWeldingWrapper;
exports.calculationForSpotWeldingWrapper = calculationForSpotWeldingWrapper;
exports.calculateLotSize = calculateLotSize;
exports.calculateLifeTimeQtyRemaining = calculateLifeTimeQtyRemaining;
exports.calculatePowerCost = calculatePowerCost;
exports.calculateManufacturingCO2 = calculateManufacturingCO2;
exports.calculateNetWeight = calculateNetWeight;
exports.calculateWeldVolume = calculateWeldVolume;
exports.validateTotalLength = validateTotalLength;
exports.calculateTotalWeldLength = calculateTotalWeldLength;
exports.calculateRowTotalLength = calculateRowTotalLength;
exports.calculateOverHeadCost = calculateOverHeadCost;
exports.calculateTotalPackMatlCost = calculateTotalPackMatlCost;
exports.calculateExPartCost = calculateExPartCost;
exports.calculatePartCost = calculatePartCost;
exports.getCurrencyNumber = getCurrencyNumber;
exports.getCellNumber = getCellNumber;
exports.getCellNumberFromTd = getCellNumberFromTd;
exports.getNumber = getNumber;
exports.getTotalCostByType = getTotalCostByType;
const test_1 = require("@playwright/test");
const LoggerUtil_1 = __importDefault(require("../lib/LoggerUtil"));
const helpers_1 = require("./helpers");
const costingConfig_1 = require("./costingConfig");
const weldingConfig_1 = require("./weldingConfig");
const costing_config_1 = require("./costing-config");
const logger = LoggerUtil_1.default;
// Enums
var PartComplexity;
(function (PartComplexity) {
    PartComplexity[PartComplexity["Low"] = 1] = "Low";
    PartComplexity[PartComplexity["Medium"] = 2] = "Medium";
    PartComplexity[PartComplexity["High"] = 3] = "High";
})(PartComplexity || (exports.PartComplexity = PartComplexity = {}));
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
function getWireDiameter(materialType, weldSize) {
    const candidates = exports.MigWeldingData.filter(d => d.MaterialType === materialType);
    const exact = candidates.find(d => d.PlateThickness_mm === weldSize);
    if (exact)
        return exact.WireDiameter_mm;
    const thickness = Number(weldSize);
    const sorted = candidates.sort((a, b) => a.PlateThickness_mm - b.PlateThickness_mm);
    const ge = sorted.find(d => d.PlateThickness_mm >= thickness);
    if (ge)
        return ge.WireDiameter_mm;
    if (sorted.length > 0)
        return sorted[sorted.length - 1].WireDiameter_mm;
    return 0;
}
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
class SheetMetalConfigService {
    mapMaterial(name) {
        return name;
    }
}
// Main Calculator Class
class WeldingCalculator {
    getWeldPositionId(position) {
        if (typeof position === 'number')
            return position;
        if (!position)
            return 1;
        const s = String(position).toLowerCase();
        if (s.includes('flat'))
            return 1;
        if (s.includes('horizontal'))
            return 2;
        if (s.includes('vertical'))
            return 3;
        if (s.includes('overhead'))
            return 4;
        if (s.includes('circular'))
            return 5;
        if (s.includes('combination'))
            return 6;
        return 1;
    }
    // Constructor updated via refactor
    constructor() {
        this.weldingMode = 'welding';
        this.shareService = new SharedService();
        this._costingConfig = new costingConfig_1.CostingConfig();
        this._weldingConfig = new weldingConfig_1.WeldingConfigService();
        this._smConfig = new SheetMetalConfigService();
    }
    calculateNetWeight(partVolume, // cm3
    density // g/cm3
    ) {
        const weightGrams = partVolume * density;
        return weightGrams;
    }
    calculateNetMaterialCost(weldBeadWeightWithWastage, materialPricePerKg, volumeDiscountPercentage = 0) {
        let netMatCost = (weldBeadWeightWithWastage / 1000) * materialPricePerKg;
        if (volumeDiscountPercentage > 0) {
            netMatCost = netMatCost * (1 - volumeDiscountPercentage / 100);
        }
        return this.shareService.isValidNumber(netMatCost);
    }
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
        const materialInfo = manufactureInfo.materialInfoList.find((x) => x.processId === PrimaryProcessType.SpotWelding);
        manufactureInfo.netMaterialCost = materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.netMatCost;
        manufactureInfo.netPartWeight = materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.netWeight;
        const partTickness = Number(materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.partTickness) || 0;
        const weldingValues = this._costingConfig
            .spotWeldingValuesForMachineType()
            .find((x) => x.toPartThickness >= partTickness);
        const weldingPartHandlingValues = this._costingConfig
            .weldingValuesForPartHandling('spotWelding')
            .find((x) => x.toPartWeight >= Number(manufactureInfo.netPartWeight) / 1000);
        if (weldingValues) {
            manufactureInfo.requiredCurrent =
                weldingValues.weldCurrent[Number(materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.wireDiameter)] || 0;
            manufactureInfo.requiredWeldingVoltage = weldingValues.openCircuitVoltage;
            const holdTime = (weldingValues === null || weldingValues === void 0 ? void 0 : weldingValues.holdTime) / 60 / 0.75;
            const squeezeTime = 3;
            const offTime = 2;
            if (!manufactureInfo.noOfWeldPasses) {
                manufactureInfo.noOfWeldPasses = 1;
            }
            const calculatedUnloadingTime = Number(manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.noOfWeldPasses) *
                ((weldingPartHandlingValues === null || weldingPartHandlingValues === void 0 ? void 0 : weldingPartHandlingValues.loading) || 0) +
                ((weldingPartHandlingValues === null || weldingPartHandlingValues === void 0 ? void 0 : weldingPartHandlingValues.unloading) || 0);
            manufactureInfo.unloadingTime = this.resolveField('unloadingTime', manufactureInfo.unloadingTime, !!manufactureInfo.isUnloadingTimeDirty, calculatedUnloadingTime, fieldColorsList, manufacturingObj);
            const calculatedDryCycleTime = (squeezeTime + holdTime + offTime) *
                (Number(manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.noOfTackWeld) || 0);
            manufactureInfo.dryCycleTime = this.resolveField('dryCycleTime', manufactureInfo.dryCycleTime, !!manufactureInfo.isDryCycleTimeDirty, calculatedDryCycleTime, fieldColorsList, manufacturingObj);
            const calculatedCycleTime = Number(manufactureInfo.dryCycleTime) +
                Number(manufactureInfo.unloadingTime);
            manufactureInfo.cycleTime = this.resolveField('cycleTime', manufactureInfo.cycleTime, !!manufactureInfo.iscycleTimeDirty, calculatedCycleTime, fieldColorsList, manufacturingObj);
        }
        this.weldingCommonCalc(manufactureInfo, fieldColorsList, manufacturingObj, laborRateDto);
        manufactureInfo.totalPowerCost = this.shareService.isValidNumber(((Number(manufactureInfo.dryCycleTime) / 3600) *
            Number(manufactureInfo.powerConsumptionKW) *
            Number(manufactureInfo.electricityUnitCost)) /
            (Number(manufactureInfo.efficiency || 100) / 100));
        logger.info(`weldingCommonCalc Total Power Cost: dryCycleTime: ${Number(manufactureInfo.dryCycleTime) / 3600}, powerConsumptionKW: ${Number(manufactureInfo.powerConsumptionKW)}, electricityUnitCost: ${Number(manufactureInfo.electricityUnitCost)}, efficiency: ${Number(manufactureInfo.efficiency) / 100}= totalPowerCost: ${manufactureInfo.totalPowerCost}`);
        return manufactureInfo;
    }
    verifyAutocompleteDropdown(dropdown, options, defaultSearchText, label, cityField, countryField) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info(`🔹 Verifying ${label} dropdown...`);
            yield dropdown.scrollIntoViewIfNeeded();
            yield (0, test_1.expect)(dropdown).toBeVisible();
            // Skip if disabled / readonly
            if ((yield dropdown.isDisabled()) ||
                (yield dropdown.getAttribute('readonly'))) {
                logger.warn(`⚠️ ${label} dropdown is disabled. Skipping validation.`);
                return;
            }
            // Open dropdown
            yield dropdown.click();
            // Trigger autocomplete if needed
            if ((yield options.count()) === 0) {
                yield dropdown.fill(defaultSearchText);
            }
            yield (0, test_1.expect)(options.first()).toBeVisible();
            const optionCount = yield options.count();
            (0, test_1.expect)(optionCount).toBeGreaterThan(0);
            const selectedOptionText = (yield options.first().innerText()).trim();
            yield options.first().click();
            // Validate selected value
            const selectedValue = (yield dropdown.inputValue().catch(() => '')) ||
                (yield dropdown.textContent()) ||
                '';
            test_1.expect
                .soft(selectedValue.toLowerCase())
                .toContain(selectedOptionText.toLowerCase());
            // Optional dependent fields
            if (cityField && countryField) {
                const city = (yield cityField.inputValue().catch(() => '')).trim();
                const country = (yield countryField.inputValue().catch(() => '')).trim();
            }
            logger.info(`✅ ${label} dropdown validation completed`);
        });
    }
    calculationForWelding(manufactureInfo, fieldColorsList, manufacturingObj, laborRateDto) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        this.weldingMode = 'welding';
        this.weldingPreCalc(manufactureInfo, fieldColorsList, manufacturingObj); // pre Welding Calc
        let materialInfo = null;
        let noOfTackWeld = 0;
        let weldingValues = null;
        let len = 0;
        if (Number(manufactureInfo.processTypeID) === ProcessType.StickWelding) {
            // stick/arc welding
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
            // Check if we have subProcessFormArray (Angular environment) or coreCostDetails (test environment)
            const hasFormArray = manufactureInfo.subProcessFormArray &&
                manufactureInfo.subProcessFormArray.length > 0;
            const hasCoreCostDetails = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.coreCostDetails) && materialInfo.coreCostDetails.length > 0;
            if (hasFormArray) {
                for (let i = 0; i < manufactureInfo.subProcessFormArray.length; i++) {
                    const element = manufactureInfo.subProcessFormArray.controls[i];
                    const subProcessInfo = element.value;
                    const efficiency = this._weldingConfig.getWeldingEfficiency(subProcessInfo.formLength, manufactureInfo.semiAutoOrAuto === 1);
                    // Travel Speed
                    const weldingData = this._weldingConfig.getWeldingData(materialType, subProcessInfo.shoulderWidth, materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.processId, 'Manual');
                    if (((_e = element.get('formHeight')) === null || _e === void 0 ? void 0 : _e.dirty) && !!((_f = element.value) === null || _f === void 0 ? void 0 : _f.formHeight)) {
                        subProcessInfo.formHeight = Number((_g = element.value) === null || _g === void 0 ? void 0 : _g.formHeight);
                    }
                    else {
                        let travelSpeed = manufactureInfo.semiAutoOrAuto === 1
                            ? this.shareService.isValidNumber((((_h = weldingData === null || weldingData === void 0 ? void 0 : weldingData.TravelSpeed_mm_per_sec) !== null && _h !== void 0 ? _h : 0) / 0.8) *
                                efficiency || 0)
                            : this.shareService.isValidNumber(((_j = weldingData === null || weldingData === void 0 ? void 0 : weldingData.TravelSpeed_mm_per_sec) !== null && _j !== void 0 ? _j : 0) * efficiency || 0);
                        logger.info(`Travel Speed: ${travelSpeed}`);
                        if (!!subProcessInfo.formHeight) {
                            travelSpeed = this.checkFormArrayDirtyField('formHeight', i, fieldColorsList)
                                ? (_l = (_k = manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.subProcessTypeInfos) === null || _k === void 0 ? void 0 : _k[i]) === null || _l === void 0 ? void 0 : _l.formHeight
                                : this.shareService.isValidNumber(travelSpeed);
                            logger.info(`formHeight: ${subProcessInfo.formHeight}`);
                        }
                        subProcessInfo.formHeight = travelSpeed;
                        logger.info(`formHeight: ${subProcessInfo.formHeight}`);
                    }
                    const lengthOfCut = Number(subProcessInfo.lengthOfCut);
                    logger.info(`Length of Cut: ${lengthOfCut}`);
                    // No. of Intermediate Start/Stops (nos)
                    if (!subProcessInfo.formPerimeter) {
                        subProcessInfo.formPerimeter =
                            subProcessInfo.formingForce === 1
                                ? subProcessInfo.noOfHoles
                                : subProcessInfo.noOfHoles * subProcessInfo.formingForce;
                    }
                    // Cycle time No. of Intermediate Start/Stops (nos)
                    const cycleTimeForIntermediateStops = subProcessInfo.formPerimeter * 5;
                    logger.info(`Cycle Time For Intermediate Stops: ${cycleTimeForIntermediateStops}`);
                    // totalWeldLength = Length * Places * SideFactor
                    const totalWeldLength = this.shareService.isValidNumber((subProcessInfo.blankArea || 0) *
                        (subProcessInfo.noOfHoles || 1) *
                        (subProcessInfo.formingForce || 1));
                    logger.info(`Total Weld Length: Length=${subProcessInfo.blankArea}, Places=${subProcessInfo.noOfHoles}, Sides=${subProcessInfo.formingForce} → Total=${totalWeldLength}`);
                    // HL Factor (No. of tack welds)
                    if (!subProcessInfo.hlFactor) {
                        if (subProcessInfo.noOfBends > 100) {
                            subProcessInfo.hlFactor = this.shareService.isValidNumber(Math.round(subProcessInfo.noOfBends / 100) *
                                subProcessInfo.noOfHoles);
                            logger.info(`HL Factor: ${subProcessInfo.noOfBends} noOfHoles ${subProcessInfo.noOfHoles} hlFactor ${subProcessInfo.hlFactor}`);
                        }
                        else {
                            subProcessInfo.hlFactor = subProcessInfo.noOfHoles;
                            logger.info(`noOfHoles ${subProcessInfo.noOfHoles} hlFactor ${subProcessInfo.hlFactor}`);
                        }
                    }
                    // (Cycle time for tack weld)
                    const cycleTimeForTackWeld = subProcessInfo.hlFactor * 3;
                    // weld cycle time
                    subProcessInfo.recommendTonnage = this.shareService.isValidNumber(totalWeldLength / subProcessInfo.formHeight +
                        cycleTimeForIntermediateStops +
                        cycleTimeForTackWeld);
                    if (lengthOfCut === 4) {
                        subProcessInfo.recommendTonnage *= 0.95;
                    }
                    else if (lengthOfCut === 5) {
                        subProcessInfo.recommendTonnage *= 1.5;
                    }
                    totalWeldCycleTime += subProcessInfo.recommendTonnage;
                    manufactureInfo.subProcessFormArray.controls[i].patchValue({
                        subProcessTypeID: Number(manufactureInfo.processTypeID)
                    });
                    manufactureInfo.subProcessFormArray.controls[i].patchValue({ formPerimeter: subProcessInfo.formPerimeter });
                    manufactureInfo.subProcessFormArray.controls[i].patchValue({ formHeight: subProcessInfo.formHeight });
                    manufactureInfo.subProcessFormArray.controls[i].patchValue({ hlFactor: subProcessInfo.hlFactor });
                    manufactureInfo.subProcessFormArray.controls[i].patchValue({ recommendTonnage: subProcessInfo.recommendTonnage });
                    subProcessInfo.subProcessTypeID = manufactureInfo.processTypeID;
                    if ((_m = manufactureInfo.subProcessTypeInfos) === null || _m === void 0 ? void 0 : _m[i]) {
                        manufactureInfo.subProcessTypeInfos[i] = subProcessInfo;
                    }
                    else {
                        manufactureInfo.subProcessTypeInfos =
                            manufactureInfo.subProcessTypeInfos || [];
                        manufactureInfo.subProcessTypeInfos.push(subProcessInfo);
                    }
                }
            }
            else if (hasCoreCostDetails) {
                // Fallback: Use coreCostDetails from materialInfo (test environment)
                manufactureInfo.subProcessTypeInfos =
                    manufactureInfo.subProcessTypeInfos || [];
                for (let i = 0; i < materialInfo.coreCostDetails.length; i++) {
                    const core = materialInfo.coreCostDetails[i];
                    // Map coreCostDetails to SubProcessTypeInfoDto structure
                    const subProcessInfo = {
                        weldPosition: core.weldPosition || 1, // Default to Flat
                        shoulderWidth: core.coreHeight || 0,
                        formLength: core.weldPosition || 1,
                        formHeight: core.formHeight || 0, // Travel speed
                        hlFactor: core.hlFactor || 0, // Tack welds
                        formPerimeter: core.formPerimeter || 0, // Intermediate stops
                        blankArea: core.coreLength || 0,
                        noOfBends: core.coreLength || 0,
                        noOfHoles: core.coreVolume || 1,
                        formingForce: core.coreArea || 1,
                        lengthOfCut: 0,
                        subProcessTypeID: manufactureInfo.processTypeID
                    };
                    const posId = this.getWeldPositionId(subProcessInfo.weldPosition);
                    const efficiency = this._weldingConfig.getWeldingEfficiency(posId, manufactureInfo.semiAutoOrAuto === 1);
                    // Get welding data for travel speed if not provided
                    if (!subProcessInfo.formHeight) {
                        const weldingData = this._weldingConfig.getWeldingData(materialType, subProcessInfo.shoulderWidth, materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.processId, 'Manual');
                        let travelSpeed = manufactureInfo.semiAutoOrAuto === 1
                            ? this.shareService.isValidNumber((((weldingData === null || weldingData === void 0 ? void 0 : weldingData.TravelSpeed_mm_per_sec) || 0) / 0.8) *
                                efficiency || 0)
                            : this.shareService.isValidNumber(((weldingData === null || weldingData === void 0 ? void 0 : weldingData.TravelSpeed_mm_per_sec) || 0) * efficiency || 0);
                        subProcessInfo.formHeight = travelSpeed;
                    }
                    // Calculate cycle time components
                    // totalWeldLength = Length * Places * SideFactor
                    const totalWeldLength = this.shareService.isValidNumber((subProcessInfo.blankArea || 0) *
                        (subProcessInfo.noOfHoles || 1) *
                        (subProcessInfo.formingForce || 1));
                    const cycleTimeForIntermediateStops = subProcessInfo.formPerimeter * 5;
                    const cycleTimeForTackWeld = subProcessInfo.hlFactor * 3;
                    // Calculate subprocess cycle time
                    subProcessInfo.recommendTonnage = this.shareService.isValidNumber(totalWeldLength / (subProcessInfo.formHeight || 12) +
                        cycleTimeForIntermediateStops +
                        cycleTimeForTackWeld);
                    totalWeldCycleTime += subProcessInfo.recommendTonnage;
                    if (manufactureInfo.subProcessTypeInfos[i]) {
                        manufactureInfo.subProcessTypeInfos[i] = subProcessInfo;
                    }
                    else {
                        manufactureInfo.subProcessTypeInfos.push(subProcessInfo);
                    }
                }
            }
            const maxFormHeight = Math.max(0, ...(manufactureInfo.subProcessTypeInfos || []).map((info) => info.shoulderWidth || 0));
            const weldingData = this._weldingConfig.getWeldingData(materialType, maxFormHeight, materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.processId, 'Manual');
            if (manufactureInfo.isrequiredCurrentDirty &&
                manufactureInfo.requiredCurrent !== null) {
                manufactureInfo.requiredCurrent = Number(manufactureInfo.requiredCurrent);
            }
            else {
                let requiredCurrent = Number((weldingData === null || weldingData === void 0 ? void 0 : weldingData.Current_Amps) || 0);
                if (manufactureInfo.requiredCurrent !== null)
                    requiredCurrent = this.shareService.checkDirtyProperty('requiredCurrent', fieldColorsList)
                        ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.requiredCurrent
                        : this.shareService.isValidNumber(requiredCurrent);
                manufactureInfo.requiredCurrent = requiredCurrent;
            }
            if (manufactureInfo.isrequiredWeldingVoltageDirty &&
                manufactureInfo.requiredWeldingVoltage !== null) {
                manufactureInfo.requiredWeldingVoltage = Number(manufactureInfo.RequiredVoltage);
            }
            else {
                let requiredWeldingVoltage = Number((weldingData === null || weldingData === void 0 ? void 0 : weldingData.Voltage_Volts) || 0);
                if (manufactureInfo.RequiredVoltage !== null)
                    requiredWeldingVoltage = this.shareService.checkDirtyProperty('requiredWeldingVoltage', fieldColorsList)
                        ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.RequiredVoltage
                        : this.shareService.isValidNumber(manufactureInfo.RequiredVoltage);
                manufactureInfo.requiredWeldingVoltage = manufactureInfo.RequiredVoltage;
                logger.info(`Required Welding Voltage: ${manufactureInfo.RequiredVoltage}`);
            }
            manufactureInfo.selectedVoltage =
                ((_o = manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.machineMaster) === null || _o === void 0 ? void 0 : _o.plasmaPower) || 0;
            logger.info(`selected Voltage: ${manufactureInfo.selectedVoltage}`);
            // loading and unloading time
            const loadingTime = this._weldingConfig.getUnloadingTime(materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.netWeight) || 0;
            const unLoadingTime = loadingTime;
            logger.info(`Loading Time: ${loadingTime}`);
            if (manufactureInfo.isUnloadingTimeDirty &&
                manufactureInfo.unloadingTime !== null) {
                manufactureInfo.unloadingTime = Number(manufactureInfo.unloadingTime);
                logger.info(`Unloading Time: ${manufactureInfo.unloadingTime}`);
            }
            else {
                let loadUnloadTime = Number(loadingTime + unLoadingTime) || 0;
                if (manufactureInfo.unloadingTime !== null) {
                    loadUnloadTime = this.shareService.checkDirtyProperty('unloadingTime', fieldColorsList)
                        ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.unloadingTime
                        : this.shareService.isValidNumber(loadUnloadTime);
                }
                manufactureInfo.unloadingTime = loadUnloadTime;
                logger.info(`Unloading Time: ${manufactureInfo.unloadingTime}`);
            }
            // Part/Assembly Reorientation (no's)
            if (manufactureInfo.isnoOfWeldPassesDirty &&
                manufactureInfo.passesLocator !== null) {
                manufactureInfo.noOfWeldPasses = Number(manufactureInfo.passesLocator);
                logger.info(`No of Weld Passes (Dirty): ${manufactureInfo.noOfWeldPasses}`);
            }
            else {
                let noOfReorientation = 0;
                if (manufactureInfo.noOfWeldPasses !== null) {
                    noOfReorientation = this.shareService.checkDirtyProperty('noOfWeldPasses', fieldColorsList)
                        ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.noOfWeldPasses
                        : this.shareService.isValidNumber(noOfReorientation);
                }
                manufactureInfo.noOfWeldPasses = noOfReorientation;
                logger.info(`No of Weld Passes: ${manufactureInfo.noOfWeldPasses}`);
            }
            const arcOnTime = totalWeldCycleTime + manufactureInfo.unloadingTime;
            logger.info(`Arc On Time: ${arcOnTime} = totalWeldCycleTime: ${totalWeldCycleTime} + unLoadingTime: ${manufactureInfo.unloadingTime}`);
            const arcOffTime = arcOnTime * 0.05;
            logger.info(`Arc Off Time: ${arcOffTime} = arcOnTime: ${arcOnTime} * 0.05`);
            const totWeldCycleTime = arcOnTime +
                arcOffTime +
                (manufactureInfo.noOfWeldPasses || 0) * unLoadingTime;
            logger.info(`Total Weld Cycle Time: ${totWeldCycleTime} = arcOnTime: ${arcOnTime} + arcOffTime: ${arcOffTime} + noOfWeldPasses(${manufactureInfo.noOfWeldPasses}) * loadingTime(${unLoadingTime})`);
            // weld Cycle Time
            if (manufactureInfo.isDryCycleTimeDirty &&
                !!manufactureInfo.dryCycleTime) {
                manufactureInfo.dryCycleTime = Number(manufactureInfo.dryCycleTime);
            }
            else {
                let weldCycleTime = this.shareService.isValidNumber(totWeldCycleTime);
                if (manufactureInfo.dryCycleTime) {
                    weldCycleTime = this.shareService.checkDirtyProperty('dryCycleTime', fieldColorsList)
                        ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.dryCycleTime
                        : this.shareService.isValidNumber(weldCycleTime);
                }
                manufactureInfo.dryCycleTime = weldCycleTime;
                logger.info(`Weld Cycle Time: ${weldCycleTime}`);
            }
            // Total Cycle Time
            if (manufactureInfo.iscycleTimeDirty && !!manufactureInfo.cycleTime) {
                manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
                logger.info(`Cycle Time: ${manufactureInfo.cycleTime}`);
            }
            else {
                let cycleTime = this.shareService.isValidNumber(totWeldCycleTime / (manufactureInfo.MachineEfficiency / 100));
                logger.info(`Cycle Time: ${cycleTime} = totWeldCycleTime: ${totWeldCycleTime} / MachineEfficiency: ${manufactureInfo.MachineEfficiency / 100}`);
                if (manufactureInfo.cycleTime) {
                    cycleTime = this.shareService.checkDirtyProperty('cycleTime', fieldColorsList)
                        ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.cycleTime
                        : this.shareService.isValidNumber(cycleTime);
                }
                manufactureInfo.cycleTime = cycleTime;
                logger.info(`Cycle Time: ${manufactureInfo.cycleTime}`);
            }
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
                let requiredCurrent = Number(weldingValues === null || weldingValues === void 0 ? void 0 : weldingValues.Current) || 0;
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
            // let cycleTimeIntermediateStartAndStop = this.CycleTimeIntermediateStartAndStop(Number(manufactureInfo.noOfIntermediateStartAndStop));
            const cycleTimeIntermediateStartAndStop = manufactureInfo.noOfIntermediateStartAndStop *
                (Number(manufactureInfo.processTypeID) === ProcessType.StickWelding
                    ? 3
                    : 5);
            if (manufactureInfo.isnoOfTackWeldDirty &&
                !!manufactureInfo.noOfTackWeld) {
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
                    // part handling time
                    manufactureInfo.unloadingTime = Number(manufactureInfo.unloadingTime);
                }
                else {
                    let unloadingTime = this._costingConfig.weldingValuesForPartHandling('stickWelding');
                    if (manufactureInfo.unloadingTime) {
                        unloadingTime = this.shareService.checkDirtyProperty('unloadingTime', fieldColorsList)
                            ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.unloadingTime
                            : unloadingTime;
                    }
                    manufactureInfo.unloadingTime = unloadingTime;
                }
            }
            // const wireDia = Number(materialInfo?.wireDiameter) || 0;
            const weldingCycleTime = this.shareService.isValidNumber((len / Number(manufactureInfo.travelSpeed)) *
                Number(manufactureInfo.noOfWeldPasses));
            const totalWeldCycleTime = Number(weldingCycleTime) +
                Number(cycleTimeTrackWeld) +
                Number(cycleTimeIntermediateStartAndStop) +
                (Number(manufactureInfo.unloadingTime) || 0);
            logger.info(`Total Weld weldingCycleTime ${weldingCycleTime} cycleTimeTrackWeld ${cycleTimeTrackWeld} cycleTimeIntermediateStartAndStop ${cycleTimeIntermediateStartAndStop} unloadingTime ${manufactureInfo.unloadingTime}`);
            const arcOnTime = this.shareService.isValidNumber(totalWeldCycleTime * 1.05);
            logger.info(`Total Weld arcOnTime ${arcOnTime}`);
            const arcOfTime = this.shareService.isValidNumber(arcOnTime * 0.05);
            logger.info(`Total Weld arcOfTime ${arcOfTime}`);
            let cycleTime = this.shareService.isValidNumber(arcOnTime + arcOfTime);
            logger.info(`Total Weld cycleTime ${cycleTime}`);
            if (manufactureInfo.isDryCycleTimeDirty &&
                !!manufactureInfo.dryCycleTime) {
                // Welding cycle time
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
        this.weldingCommonCalc(manufactureInfo, fieldColorsList, manufacturingObj, laborRateDto); // Common Welding Calc
        return manufactureInfo;
    }
    calculationForWeldingMaterial(materialInfo, fieldColorsList = [], selectedMaterialInfo = null, manufactureInfo = null) {
        var _a, _b, _c;
        let netWeight = 0;
        if (materialInfo.isNetweightDirty && !!materialInfo.netWeight) {
            netWeight = Number(materialInfo.netWeight);
        }
        else {
            netWeight = this.shareService.isValidNumber((Number(materialInfo.partVolume) * Number(materialInfo.density)) / 1000);
            if (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.netWeight) {
                netWeight =
                    this.shareService.checkDirtyProperty('netWeight', fieldColorsList) &&
                        selectedMaterialInfo
                        ? selectedMaterialInfo === null || selectedMaterialInfo === void 0 ? void 0 : selectedMaterialInfo.netWeight
                        : netWeight;
            }
        }
        materialInfo.netWeight = netWeight;
        const angleInDegrees = 45;
        if (Number(materialInfo.processId) === ProcessType.StickWelding) {
            materialInfo.weldLegLength =
                Number(materialInfo.dimX) > Number(materialInfo.dimY)
                    ? materialInfo.dimX
                    : materialInfo.dimY;
        }
        else {
            materialInfo.weldLegLength =
                Math.sqrt(2) * (materialInfo.dimY / Math.cos(angleInDegrees));
        }
        if (materialInfo.iswireDiameterDirty && !!materialInfo.wireDiameter) {
            materialInfo.wireDiameter = Number(materialInfo.wireDiameter);
        }
        else {
            let wireDiameter = 0;
            if (Number(materialInfo.processId) === ProcessType.StickWelding) {
                wireDiameter =
                    ((_a = this._costingConfig
                        .weldingValuesForStickWelding()
                        .find(x => x.ToPartThickness >= Number(materialInfo.partTickness))) === null || _a === void 0 ? void 0 : _a.WireDiameter) || 0;
            }
            else if (Number(materialInfo.processId) === ProcessType.TigWelding) {
                wireDiameter =
                    ((_b = this._costingConfig
                        .tigWeldingValuesForMachineType()
                        .find(x => x.id == 3 &&
                        x.ToPartThickness >= Number(materialInfo.partTickness))) === null || _b === void 0 ? void 0 : _b.WireDiameter) || 0; // 3 is manual
            }
            else {
                wireDiameter =
                    ((_c = this._costingConfig
                        .weldingValuesForMachineType()
                        .find(x => x.id == 3 &&
                        x.ToPartThickness >= Number(materialInfo.partTickness))) === null || _c === void 0 ? void 0 : _c.WireDiameter) || 0;
            }
            if (materialInfo.wireDiameter && selectedMaterialInfo) {
                wireDiameter = this.shareService.checkDirtyProperty('wireDiameter', fieldColorsList)
                    ? selectedMaterialInfo === null || selectedMaterialInfo === void 0 ? void 0 : selectedMaterialInfo.wireDiameter
                    : wireDiameter;
            }
            materialInfo.wireDiameter = wireDiameter;
        }
        if (materialInfo.isPartProjectedAreaDirty &&
            materialInfo.partProjectedArea != null) {
            materialInfo.partProjectedArea = Number(materialInfo.partProjectedArea);
        }
        else {
            let projectedArea = 0;
            if (materialInfo.typeOfWeld == 1 || materialInfo.typeOfWeld == 2) {
                projectedArea =
                    (Number(materialInfo.dimY) * Number(materialInfo.dimZ)) / 2;
            }
            else if (materialInfo.typeOfWeld == 3) {
                projectedArea =
                    Number(materialInfo.dimY) * Number(materialInfo.dimZ) +
                        Number(materialInfo.partTickness * 1);
            }
            else if (materialInfo.typeOfWeld == 4) {
                projectedArea =
                    (Number(materialInfo.dimY) * Number(materialInfo.dimZ) +
                        Number(materialInfo.partTickness * 1)) /
                        2;
            }
            if (materialInfo.partProjectedArea != null && selectedMaterialInfo) {
                projectedArea = this.shareService.checkDirtyProperty('partProjectArea', fieldColorsList)
                    ? selectedMaterialInfo === null || selectedMaterialInfo === void 0 ? void 0 : selectedMaterialInfo.partProjectedArea
                    : projectedArea;
            }
            materialInfo.partProjectedArea = projectedArea;
        }
        if (materialInfo.isPartVolumeDirty && !!materialInfo.partVolume) {
            materialInfo.partVolume = Number(materialInfo.partVolume);
        }
        else {
            let partVolume = materialInfo.dimX * materialInfo.partProjectedArea;
            if (materialInfo.partVolume && selectedMaterialInfo) {
                partVolume = this.shareService.checkDirtyProperty('partVolume', fieldColorsList)
                    ? selectedMaterialInfo === null || selectedMaterialInfo === void 0 ? void 0 : selectedMaterialInfo.partVolume
                    : partVolume;
            }
            materialInfo.partVolume = partVolume;
        }
        let effeciency = this._weldingConfig.getWeldingEfficiency(1, (manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.semiAutoOrAuto) === 1) * 100 || 75;
        if (materialInfo.isEffeciencyDirty && !!materialInfo.effeciency) {
            effeciency = materialInfo.effeciency;
        }
        else {
            if (selectedMaterialInfo) {
                effeciency = this.shareService.checkDirtyProperty('effeciency', fieldColorsList)
                    ? selectedMaterialInfo === null || selectedMaterialInfo === void 0 ? void 0 : selectedMaterialInfo.effeciency
                    : effeciency;
            }
        }
        materialInfo.effeciency = effeciency;
        let grossWeight = 0;
        if (materialInfo.isGrossWeightDirty && materialInfo.grossWeight != null) {
            grossWeight = Number(materialInfo.grossWeight);
        }
        else {
            grossWeight = this.shareService.isValidNumber((Number(materialInfo.partVolume) * Number(materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.density)) / 1000);
            if ((materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.grossWeight) != null && selectedMaterialInfo) {
                grossWeight = this.shareService.checkDirtyProperty('grossWeight', fieldColorsList)
                    ? selectedMaterialInfo === null || selectedMaterialInfo === void 0 ? void 0 : selectedMaterialInfo.grossWeight
                    : grossWeight;
            }
        }
        materialInfo.grossWeight = grossWeight;
        let weldWeightWastage = 0;
        if (materialInfo.isWeldWeightWastageDirty &&
            !!materialInfo.weldWeightWastage) {
            weldWeightWastage = Number(materialInfo.weldWeightWastage);
        }
        else {
            weldWeightWastage = this.shareService.isValidNumber((materialInfo.grossWeight * 100) / effeciency);
            if ((materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.weldWeightWastage) && selectedMaterialInfo) {
                weldWeightWastage = this.shareService.checkDirtyProperty('weldWeightWastage', fieldColorsList)
                    ? selectedMaterialInfo === null || selectedMaterialInfo === void 0 ? void 0 : selectedMaterialInfo.weldWeightWastage
                    : weldWeightWastage;
            }
        }
        materialInfo.weldWeightWastage = weldWeightWastage;
        materialInfo.netMatCost =
            this.shareService.isValidNumber(weldWeightWastage / 1000) *
                Number(materialInfo.materialPricePerKg);
        if (materialInfo.volumeDiscountPer > 0) {
            materialInfo.netMatCost =
                materialInfo.netMatCost * (1 - materialInfo.volumeDiscountPer / 100);
        }
        return materialInfo;
    }
    getTotalWeldLength(weldLength, weldPlaces, weldSide, noOfPasses = 1) {
        let sideMultiplier = 1;
        if (typeof weldSide === 'string') {
            sideMultiplier = weldSide.toLowerCase() === 'both' ? 2 : 1;
        }
        else if (typeof weldSide === 'number') {
            sideMultiplier = weldSide === 2 ? 2 : 1;
        }
        return weldLength * weldPlaces * noOfPasses * sideMultiplier;
    }
    getTotalWeldMaterialWeight(partVolume, density) {
        return this.shareService.isValidNumber((partVolume * density) / 1000);
    }
    checkFormArrayDirtyField(fieldName, index, fieldColorsList) {
        if (!fieldColorsList || fieldColorsList.length === 0)
            return false;
        // Looking for { formControlName: 'formHeight', isDirty: true, subProcessIndex: 0 }
        return fieldColorsList.some((x) => x.formControlName === fieldName &&
            x.subProcessIndex === index &&
            x.isDirty);
    }
    getEfficiency(efficiency) {
        return efficiency || 75;
    }
    getWeldBeadWeightWithWastage(grossWeight, wastagePercentage) {
        const multiplier = 1 + wastagePercentage / 100;
        return this.shareService.isValidNumber(grossWeight * multiplier);
    }
    processSubProcessCycleTime(subProcessInfo, i, materialType, materialInfo, manufactureInfo, fieldColorsList, manufacturingObj, subProcessCycleTimes) {
        var _a, _b, _c;
        const posId = this.getWeldPositionId(subProcessInfo.weldPosition);
        const efficiency = this._weldingConfig.getWeldingEfficiency(posId, manufactureInfo.semiAutoOrAuto === 1);
        // Travel Speed
        const weldingData = this._weldingConfig.getWeldingData(materialType, subProcessInfo.shoulderWidth, materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.processId, 'Manual');
        if (this.checkFormArrayDirtyField('formHeight', i, fieldColorsList)) {
            subProcessInfo.formHeight = Number(subProcessInfo.formHeight);
        }
        else {
            let travelSpeed = manufactureInfo.semiAutoOrAuto === 1
                ? this.shareService.isValidNumber((((weldingData === null || weldingData === void 0 ? void 0 : weldingData.TravelSpeed_mm_per_sec) || 0) / 0.8) * efficiency ||
                    0)
                : this.shareService.isValidNumber(((weldingData === null || weldingData === void 0 ? void 0 : weldingData.TravelSpeed_mm_per_sec) || 0) * efficiency || 0);
            if (subProcessInfo.formHeight) {
                travelSpeed = this.checkFormArrayDirtyField('formHeight', i, fieldColorsList)
                    ? (_b = (_a = manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.subProcessTypeInfos) === null || _a === void 0 ? void 0 : _a[i]) === null || _b === void 0 ? void 0 : _b.formHeight
                    : this.shareService.isValidNumber(travelSpeed);
            }
            subProcessInfo.formHeight = travelSpeed;
        }
        const lengthOfCut = getWeldTypeId(subProcessInfo.lengthOfCut || '');
        // Cycle time No. of Intermediate Start/Stops (nos)
        if (!subProcessInfo.formPerimeter) {
            subProcessInfo.formPerimeter =
                subProcessInfo.formingForce === 1
                    ? subProcessInfo.noOfHoles
                    : subProcessInfo.noOfHoles * subProcessInfo.formingForce;
        }
        const cycleTimeForIntermediateStops = (subProcessInfo.formPerimeter || 0) * 5;
        // totalWeldLength = Length * Places * SideFactor
        const totalWeldLength = this.shareService.isValidNumber((subProcessInfo.blankArea || 0) *
            (subProcessInfo.noOfHoles || 1) *
            (subProcessInfo.formingForce || 1));
        // HL Factor
        if (!subProcessInfo.hlFactor) {
            if ((subProcessInfo.noOfBends || 0) > 100) {
                subProcessInfo.hlFactor = this.shareService.isValidNumber(Math.round((subProcessInfo.noOfBends || 0) / 100) *
                    (subProcessInfo.noOfHoles || 0));
            }
            else {
                subProcessInfo.hlFactor = subProcessInfo.noOfHoles;
            }
        }
        // (Cycle time for tack weld)
        const cycleTimeForTackWeld = (subProcessInfo.hlFactor || 0) * 3;
        // weld cycle time
        subProcessInfo.recommendTonnage = this.shareService.isValidNumber(totalWeldLength / (subProcessInfo.formHeight || 12) +
            cycleTimeForIntermediateStops +
            cycleTimeForTackWeld);
        if (lengthOfCut === 4) {
            subProcessInfo.recommendTonnage *= 0.95;
        }
        else if (lengthOfCut === 5) {
            subProcessInfo.recommendTonnage *= 1.5;
        }
        subProcessCycleTimes.push(subProcessInfo.recommendTonnage);
        if ((_c = manufactureInfo.subProcessTypeInfos) === null || _c === void 0 ? void 0 : _c[i]) {
            manufactureInfo.subProcessTypeInfos[i] = subProcessInfo;
        }
        else {
            manufactureInfo.subProcessTypeInfos =
                manufactureInfo.subProcessTypeInfos || [];
            manufactureInfo.subProcessTypeInfos.push(subProcessInfo);
        }
        return subProcessInfo.recommendTonnage;
    }
    weldingCommonCalc(manufactureInfo, fieldColorsList, manufacturingObj, laborRateDto) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const curCycleTime = this.weldingMode === 'spotWelding'
            ? Number(manufactureInfo.dryCycleTime)
            : Number(manufactureInfo.cycleTime);
        manufactureInfo.totalPowerCost = 0;
        if (this.weldingMode !== 'seamWelding') {
            if (manufactureInfo.iselectricityUnitCostDirty &&
                !!manufactureInfo.electricityUnitCost) {
                manufactureInfo.electricityUnitCost = this.shareService.isValidNumber(Number(manufactureInfo.electricityUnitCost));
            }
            else {
                let electricityUnitCost = Number(manufactureInfo.electricityUnitCost) || 0;
                if (manufactureInfo.countryList && manufactureInfo.mfrCountryId) {
                    const country = manufactureInfo.countryList.find((x) => x.countryId == manufactureInfo.mfrCountryId);
                    if (country) {
                        electricityUnitCost = Number((laborRateDto === null || laborRateDto === void 0 ? void 0 : laborRateDto.length) > 0 ? laborRateDto[0].powerCost : 0);
                    }
                }
                if (manufactureInfo.electricityUnitCost) {
                    electricityUnitCost = this.shareService.checkDirtyProperty('electricityUnitCost', fieldColorsList)
                        ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.electricityUnitCost
                        : electricityUnitCost;
                }
                manufactureInfo.electricityUnitCost =
                    this.shareService.isValidNumber(electricityUnitCost);
            }
            const calculatedPowerConsumption = (Number(manufactureInfo.requiredCurrent) *
                Number(manufactureInfo.requiredWeldingVoltage)) /
                1000;
            manufactureInfo.powerConsumption = this.resolveField('powerConsumption', manufactureInfo.powerConsumptionKW, manufactureInfo.ispowerConsumptionDirty, calculatedPowerConsumption, fieldColorsList, manufacturingObj);
            manufactureInfo.totalPowerCost = this.shareService.isValidNumber((curCycleTime / 3600) *
                Number(manufactureInfo.powerConsumptionKW) *
                Number(manufactureInfo.electricityUnitCost));
            manufactureInfo.totalGasCost = 0;
            logger.info(`Total Manufacturing Power Cost: curCycleTime: ${curCycleTime} powerConsumption: ${manufactureInfo.powerConsumptionKW} electricityUnitCost: ${manufactureInfo.electricityUnitCost}= totalPowerCost: ${manufactureInfo.totalPowerCost}`);
        }
        if (manufactureInfo.isyieldPercentDirty && !!manufactureInfo.yieldPer) {
            manufactureInfo.yieldPer = this.shareService.isValidNumber(Number(manufactureInfo.yieldPer));
            logger.info(`Yield Percentage: ${manufactureInfo.yieldPer}`);
        }
        else {
            let yieldPer = this._weldingConfig.defaultPercentages(Number(manufactureInfo.processTypeID), manufactureInfo.partComplexity, 'yieldPercentage');
            logger.info(`Yield Percentage: ${yieldPer}`);
            if (manufactureInfo.yieldPer) {
                yieldPer = this.shareService.checkDirtyProperty('yieldPer', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.yieldPer
                    : this.shareService.isValidNumber(yieldPer);
            }
            manufactureInfo.yieldPer = yieldPer;
        }
        if (manufactureInfo.isSamplingRateDirty && !!manufactureInfo.samplingRate) {
            manufactureInfo.samplingRate = this.shareService.isValidNumber(Number(manufactureInfo.samplingRate));
        }
        else {
            let samplingRate = this._weldingConfig.defaultPercentages(Number(manufactureInfo.processTypeID), manufactureInfo.partComplexity, 'samplingRate');
            logger.info(`Sampling Rate: ${samplingRate}`);
            if (manufactureInfo.samplingRate) {
                samplingRate = this.shareService.checkDirtyProperty('samplingRate', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.samplingRate
                    : this.shareService.isValidNumber(samplingRate);
            }
            manufactureInfo.samplingRate = samplingRate;
        }
        // # of Direct Labour
        if (manufactureInfo.isNoOfLowSkilledLaboursDirty &&
            manufactureInfo.noOfLowSkilledLabours !== null) {
            manufactureInfo.noOfLowSkilledLabours = Number(manufactureInfo.noOfLowSkilledLabours);
            logger.info(`No Of Low Skilled Labours: ${manufactureInfo.noOfLowSkilledLabours}`);
        }
        else {
            let noOfLowSkilledLabours = ((_c = (_b = (_a = manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.machineMaster) === null || _a === void 0 ? void 0 : _a.machineMarketDtos) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.specialSkilledLabours) || 1;
            if (manufactureInfo.noOfLowSkilledLabours !== null) {
                noOfLowSkilledLabours = this.shareService.checkDirtyProperty('noOfLowSkilledLabours', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.noOfLowSkilledLabours
                    : noOfLowSkilledLabours;
            }
            manufactureInfo.noOfLowSkilledLabours = noOfLowSkilledLabours;
            logger.info(`No Of Low Skilled Labours: ${manufactureInfo.noOfLowSkilledLabours}`);
        }
        if (manufactureInfo.isinspectionTimeDirty &&
            manufactureInfo.inspectionTime !== null) {
            manufactureInfo.inspectionTime = Number(manufactureInfo.inspectionTime);
        }
        else {
            let inspectionTime = manufactureInfo.partComplexity == PartComplexity.Low
                ? 2
                : manufactureInfo.partComplexity == PartComplexity.Medium
                    ? 5
                    : manufactureInfo.partComplexity == PartComplexity.High
                        ? 10
                        : 0;
            if (manufactureInfo.inspectionTime !== null) {
                inspectionTime = this.shareService.checkDirtyProperty('inspectionTime', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.inspectionTime
                    : inspectionTime;
            }
            manufactureInfo.inspectionTime = inspectionTime;
        }
        if (manufactureInfo.isdirectMachineCostDirty &&
            manufactureInfo.directMachineCost !== null) {
            manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
        }
        else {
            let directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) / 3600) * curCycleTime);
            logger.info(`Direct Machine Cost: machineHourRate: ${manufactureInfo.machineHourRate} curCycleTime ${curCycleTime}`);
            if (manufactureInfo.directMachineCost !== null) {
                directMachineCost = this.shareService.checkDirtyProperty('directMachineCost', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.directMachineCost
                    : directMachineCost;
            }
            manufactureInfo.directMachineCost = directMachineCost;
            logger.info(`Direct Machine Cost: ${directMachineCost}`);
        }
        if (manufactureInfo.isdirectSetUpCostDirty &&
            manufactureInfo.directSetUpCost !== null) {
            manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
        }
        else {
            let directSetUpCost = this.shareService.isValidNumber(((Number(manufactureInfo.skilledLaborRatePerHour) +
                Number(manufactureInfo.machineHourRate)) *
                (Number(manufactureInfo.setUpTime) / 60)) /
                manufactureInfo.lotSize);
            logger.info(`Direct Set Up Cost: skilledLaborRatePerHour: ${manufactureInfo.skilledLaborRatePerHour} machineHourRate: ${manufactureInfo.machineHourRate} setUpTime: ${manufactureInfo.setUpTime} lotSize: ${manufactureInfo.lotSize}`);
            if (manufactureInfo.directSetUpCost !== null) {
                directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.directSetUpCost
                    : directSetUpCost;
            }
            manufactureInfo.directSetUpCost = directSetUpCost;
            logger.info(`Direct Set Up Cost: ${directSetUpCost}`);
        }
        if (manufactureInfo.isdirectLaborCostDirty &&
            manufactureInfo.directLaborCost !== null) {
            manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
        }
        else {
            let directLaborCost = this.shareService.isValidNumber((Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) *
                (curCycleTime * Number(manufactureInfo.noOfLowSkilledLabours)));
            logger.info(`Direct Labor Cost: lowSkilledLaborRatePerHour: ${manufactureInfo.lowSkilledLaborRatePerHour} curCycleTime: ${curCycleTime} noOfLowSkilledLabours: ${manufactureInfo.noOfLowSkilledLabours}`);
            if (manufactureInfo.directLaborCost !== null) {
                directLaborCost = this.shareService.checkDirtyProperty('directLaborCost', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.directLaborCost
                    : directLaborCost;
            }
            manufactureInfo.directLaborCost = directLaborCost;
            logger.info(`Direct Labor Cost: ${directLaborCost}`);
        }
        const calculatedInspectionCost = this.weldingMode === 'seamWelding'
            ? this.shareService.isValidNumber((Number(manufactureInfo.inspectionTime) *
                Number(manufactureInfo.qaOfInspectorRate)) /
                (Number(manufactureInfo.lotSize) *
                    (Number(manufactureInfo.samplingRate) / 100)))
            : this.shareService.isValidNumber(((((_d = manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.qaOfInspectorRate) !== null && _d !== void 0 ? _d : 0) / 60) *
                Math.ceil((((_e = manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.samplingRate) !== null && _e !== void 0 ? _e : 0) / 100) *
                    ((_f = manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.lotSize) !== null && _f !== void 0 ? _f : 0)) *
                ((_g = manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.inspectionTime) !== null && _g !== void 0 ? _g : 0)) /
                ((_h = manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.lotSize) !== null && _h !== void 0 ? _h : 1));
        logger.info(`Inspection Cost: qaOfInspectorRate: ${manufactureInfo.qaOfInspectorRate / 60} ` +
            `samplingRate: ${manufactureInfo.samplingRate / 100} lotSize: ${manufactureInfo.lotSize} ` +
            `inspectionTime: ${manufactureInfo.inspectionTime} -> Calculated: ${calculatedInspectionCost}`);
        manufactureInfo.inspectionCost = this.resolveField('inspectionCost', manufactureInfo.inspectionCost, manufactureInfo.isinspectionCostDirty, calculatedInspectionCost, fieldColorsList, manufacturingObj);
        const sum = this.shareService.isValidNumber(Number(manufactureInfo.directMachineCost) +
            Number(manufactureInfo.directSetUpCost) +
            Number(manufactureInfo.directLaborCost) +
            Number(manufactureInfo.inspectionCost) +
            Number(manufactureInfo.totalPowerCost));
        logger.info(`Sum: directMachineCost: ${manufactureInfo.directMachineCost} directSetUpCost: ${manufactureInfo.directSetUpCost} directLaborCost: ${manufactureInfo.directLaborCost} inspectionCost: ${manufactureInfo.inspectionCost} totalPowerCost: ${manufactureInfo.totalPowerCost}`);
        if (manufactureInfo.isyieldCostDirty &&
            manufactureInfo.yieldCost !== null) {
            manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
        }
        else {
            let yieldCost = this.weldingMode === 'seamWelding'
                ? this.shareService.isValidNumber((1 - Number(manufactureInfo.yieldPer) / 100) * sum)
                : this.shareService.isValidNumber((1 - Number(manufactureInfo.yieldPer) / 100) *
                    (Number(manufactureInfo.netMaterialCost) + sum));
            logger.info(`Yield Cost: yieldPer: ${manufactureInfo.yieldPer / 100} sum: ${sum} netMaterialCost: ${manufactureInfo.netMaterialCost}`);
            if (manufactureInfo.yieldCost !== null) {
                yieldCost = this.shareService.checkDirtyProperty('yieldCost', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.yieldCost
                    : yieldCost;
            }
            manufactureInfo.yieldCost = yieldCost;
        }
        manufactureInfo.directProcessCost = this.shareService.isValidNumber(sum + Number(manufactureInfo.yieldCost));
        logger.info(`Direct Process Cost: sum: ${sum} yieldCost: ${manufactureInfo.yieldCost}`);
        logger.info(`Direct Process Cost: ${manufactureInfo.directProcessCost}`);
        return Number(manufactureInfo.directProcessCost);
    }
    calculationsForWeldingPreparation(manufactureInfo, fieldColorsList, manufacturingObj) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
        // ================= ESG Impact Calculation =================
        manufactureInfo.esgImpactElectricityConsumption =
            this.shareService.isValidNumber(Number(((_a = manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.machineMaster) === null || _a === void 0 ? void 0 : _a.totalPowerKW) || 0) *
                Number(((_b = manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.machineMaster) === null || _b === void 0 ? void 0 : _b.powerUtilization) || 0) *
                Number(((_d = (_c = manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.laborRates) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.powerESG) || 0));
        logger.info(`ESG Impact Electricity Consumption: machineMaster: ${(_e = manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.machineMaster) === null || _e === void 0 ? void 0 : _e.totalPowerKW} powerUtilization: ${(_f = manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.machineMaster) === null || _f === void 0 ? void 0 : _f.powerUtilization} powerESG: ${(_h = (_g = manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.laborRates) === null || _g === void 0 ? void 0 : _g[0]) === null || _h === void 0 ? void 0 : _h.powerESG}`);
        const weldingLength = ((_j = manufactureInfo.materialInfoList) === null || _j === void 0 ? void 0 : _j.length) > 0
            ? (_k = manufactureInfo.materialInfoList[0]) === null || _k === void 0 ? void 0 : _k.dimX
            : 0;
        logger.info(`Welding Length: ${weldingLength}`);
        const weldingWidth = ((_l = manufactureInfo.materialInfoList) === null || _l === void 0 ? void 0 : _l.length) > 0
            ? (_m = manufactureInfo.materialInfoList[0]) === null || _m === void 0 ? void 0 : _m.dimY
            : 0;
        logger.info(`Welding Width: ${weldingWidth}`);
        const weldingHeight = ((_o = manufactureInfo.materialInfoList) === null || _o === void 0 ? void 0 : _o.length) > 0
            ? (_p = manufactureInfo.materialInfoList[0]) === null || _p === void 0 ? void 0 : _p.dimZ
            : 0;
        logger.info(`Welding Height: ${weldingHeight}`);
        const netWeight = ((_q = manufactureInfo.materialInfoList) === null || _q === void 0 ? void 0 : _q.length) > 0
            ? (((_r = manufactureInfo.materialInfoList[0]) === null || _r === void 0 ? void 0 : _r.netWeight) || 0) / 1000
            : 0;
        logger.info(`Net Weight: ${netWeight}`);
        manufactureInfo.netMaterialCost =
            ((_s = manufactureInfo.materialInfoList) === null || _s === void 0 ? void 0 : _s.length) > 0
                ? (_t = manufactureInfo.materialInfoList[0]) === null || _t === void 0 ? void 0 : _t.netMatCost
                : 0;
        logger.info(`Net Material Cost: ${manufactureInfo.netMaterialCost}`);
        const crossSectionArea = 2 * weldingLength * Math.max(weldingWidth, weldingHeight);
        logger.info(`Cross Section Area: ${crossSectionArea}`);
        const materialType = this._smConfig.mapMaterial((_v = (_u = manufactureInfo.materialmasterDatas) === null || _u === void 0 ? void 0 : _u.materialType) === null || _v === void 0 ? void 0 : _v.materialTypeName);
        logger.info(`Material Type: ${materialType}`);
        let lookupListDia = (_x = (_w = this._weldingConfig
            .getDiscBrushDia()) === null || _w === void 0 ? void 0 : _w.filter((x) => x.materialType === materialType && x.partArea >= crossSectionArea)) === null || _x === void 0 ? void 0 : _x[0];
        if (crossSectionArea > 100001) {
            lookupListDia = (_0 = (_z = (_y = this._weldingConfig
                .getDiscBrushDia()) === null || _y === void 0 ? void 0 : _y.filter((x) => x.materialType === materialType)) === null || _z === void 0 ? void 0 : _z.reverse()) === null || _0 === void 0 ? void 0 : _0[0];
        }
        let discBrushDia = 0;
        let deburringRPM = 0;
        if (lookupListDia) {
            discBrushDia = lookupListDia.discBrush;
            deburringRPM =
                Number(manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.processTypeID) ===
                    ProcessType.WeldingPreparation
                    ? lookupListDia.prepRPM
                    : lookupListDia.cleaningRPM;
        }
        const feedPerREvRough = this.shareService.isValidNumber(discBrushDia / 2);
        logger.info(`Disc Brush Diameter: ${discBrushDia}`);
        logger.info(`Deburring RPM: ${deburringRPM}`);
        logger.info(`Feed Per Rev Rough: ${feedPerREvRough}`);
        const feedPerREvFinal = this.shareService.isValidNumber(discBrushDia / 4);
        const noOfPasses = Math.max(1, this.shareService.isValidNumber(Math.ceil(weldingWidth / (discBrushDia || 1))));
        const handlingTime = netWeight < 5
            ? 10
            : netWeight < 10
                ? 16
                : netWeight < 20
                    ? 24
                    : netWeight >= 20
                        ? 32
                        : 0;
        if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
            manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
        }
        else {
            let cycleTime = this.shareService.isValidNumber(handlingTime +
                (2 * (weldingLength + 5) * noOfPasses * 60) /
                    (feedPerREvRough || 1) /
                    (deburringRPM || 1));
            logger.info(`Cycle Time: handlingTime: ${handlingTime} weldingLength: ${weldingLength} noOfPasses: ${noOfPasses} feedPerREvRough: ${feedPerREvRough} deburringRPM: ${deburringRPM} -> CycleTime: ${cycleTime}`);
            if (Number(manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.processTypeID) ===
                ProcessType.WeldingPreparation) {
                cycleTime += this.shareService.isValidNumber((2 * (weldingLength + 5) * noOfPasses * 60) /
                    (feedPerREvFinal || 1) /
                    (deburringRPM || 1));
            }
            logger.info(`Cycle Time after Final Pass: feedPerREvFinal: ${feedPerREvFinal} -> CycleTime: ${cycleTime}`);
            manufactureInfo.cycleTime = this.resolveField('cycleTime', manufactureInfo.cycleTime, manufactureInfo.iscycleTimeDirty, cycleTime, fieldColorsList, manufacturingObj);
        }
        const efficiency = Number(manufactureInfo.efficiency || 100);
        if (manufactureInfo.isdirectMachineCostDirty &&
            manufactureInfo.directMachineCost != null) {
            manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost);
        }
        else {
            let directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) *
                Number(manufactureInfo.cycleTime)) /
                3600 /
                efficiency);
            logger.info(`Direct Machine Cost: machineHourRate: ${manufactureInfo.machineHourRate} cycleTime: ${manufactureInfo.cycleTime} efficiency: ${efficiency} -> DirectMachineCost: ${directMachineCost}`);
            manufactureInfo.directMachineCost = this.resolveField('directMachineCost', manufactureInfo.directMachineCost, manufactureInfo.isdirectMachineCostDirty, directMachineCost, fieldColorsList, manufacturingObj);
        }
        if (manufactureInfo.isdirectSetUpCostDirty &&
            manufactureInfo.directSetUpCost != null) {
            manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost);
        }
        else {
            let directSetUpCost = (((Number(manufactureInfo.noOfLowSkilledLabours) *
                Number(manufactureInfo.setUpTime)) /
                60) *
                Number(manufactureInfo.lowSkilledLaborRatePerHour)) /
                efficiency /
                Number(manufactureInfo.lotSize) +
                (((Number(manufactureInfo.noOfSkilledLabours) *
                    Number(manufactureInfo.skilledLaborRatePerHour)) /
                    60) *
                    Number(manufactureInfo.setUpTime)) /
                    efficiency /
                    Number(manufactureInfo.lotSize);
            manufactureInfo.directSetUpCost = this.resolveField('directSetUpCost', manufactureInfo.directSetUpCost, manufactureInfo.isdirectSetUpCostDirty, directSetUpCost, fieldColorsList, manufacturingObj);
            logger.info(`Direct Set Up Cost: noOfLowSkilledLabours: ${manufactureInfo.noOfLowSkilledLabours} setUpTime: ${manufactureInfo.setUpTime} lowSkilledLaborRatePerHour: ${manufactureInfo.lowSkilledLaborRatePerHour} noOfSkilledLabours: ${manufactureInfo.noOfSkilledLabours} skilledLaborRatePerHour: ${manufactureInfo.skilledLaborRatePerHour} efficiency: ${efficiency} lotSize: ${manufactureInfo.lotSize} -> DirectSetUpCost: ${directSetUpCost}`);
        }
        if (manufactureInfo.isdirectLaborCostDirty &&
            manufactureInfo.directLaborCost != null) {
            manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
        }
        else {
            let directLaborCost = this.shareService.isValidNumber((Number(manufactureInfo.noOfLowSkilledLabours) *
                Number(manufactureInfo.lowSkilledLaborRatePerHour) *
                Number(manufactureInfo.cycleTime)) /
                3600 /
                efficiency +
                (Number(manufactureInfo.noOfSkilledLabours) *
                    Number(manufactureInfo.skilledLaborRatePerHour) *
                    Number(manufactureInfo.cycleTime)) /
                    3600 /
                    efficiency);
            logger.info(`Direct Labor Cost: noOfLowSkilledLabours: ${manufactureInfo.noOfLowSkilledLabours} lowSkilledLaborRatePerHour: ${manufactureInfo.lowSkilledLaborRatePerHour} cycleTime: ${manufactureInfo.cycleTime} efficiency: ${efficiency} -> DirectLaborCost: ${directLaborCost}`);
            manufactureInfo.directLaborCost = this.resolveField('directLaborCost', manufactureInfo.directLaborCost, manufactureInfo.isdirectLaborCostDirty, directLaborCost, fieldColorsList, manufacturingObj);
        }
        if (manufactureInfo.isinspectionCostDirty &&
            manufactureInfo.inspectionCost != null) {
            manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
        }
        else {
            let inspectionCost = this.shareService.isValidNumber(((manufactureInfo.inspectionTime / 60) *
                (Number(manufactureInfo.qaOfInspector) || 1) *
                Number(manufactureInfo.qaOfInspectorRate)) /
                efficiency /
                Number(manufactureInfo.lotSize));
            logger.info(`Inspection Cost: inspectionTime: ${manufactureInfo.inspectionTime} qaOfInspector: ${manufactureInfo.qaOfInspector} qaOfInspectorRate: ${manufactureInfo.qaOfInspectorRate} efficiency: ${efficiency} lotSize: ${manufactureInfo.lotSize} -> InspectionCost: ${inspectionCost}`);
            manufactureInfo.inspectionCost = this.resolveField('inspectionCost', manufactureInfo.inspectionCost, manufactureInfo.isinspectionCostDirty, inspectionCost, fieldColorsList, manufacturingObj);
        }
        if (manufactureInfo.isyieldPercentDirty &&
            manufactureInfo.yieldPer != null) {
            manufactureInfo.yieldPer = Number(manufactureInfo.yieldPer);
        }
        else {
            let yieldPer = 0;
            if (manufactureInfo.yieldPer != null) {
                yieldPer = this.shareService.checkDirtyProperty('yieldPer', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.yieldPer
                    : yieldPer;
            }
            manufactureInfo.yieldPer = yieldPer;
        }
        if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost != null) {
            manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
        }
        else {
            let yieldCost = 0;
            if (manufactureInfo.yieldCost != null) {
                yieldCost = this.shareService.checkDirtyProperty('yieldCost', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.yieldCost
                    : yieldCost;
            }
            manufactureInfo.yieldCost = yieldCost;
        }
        manufactureInfo.directProcessCost = this.shareService.isValidNumber(Number(manufactureInfo.directLaborCost) +
            Number(manufactureInfo.directMachineCost) +
            Number(manufactureInfo.directSetUpCost) +
            Number(manufactureInfo.inspectionCost) +
            Number(manufactureInfo.yieldCost));
        logger.info(`Direct Process Cost: directLaborCost: ${manufactureInfo.directLaborCost} directMachineCost: ${manufactureInfo.directMachineCost} directSetUpCost: ${manufactureInfo.directSetUpCost} inspectionCost: ${manufactureInfo.inspectionCost} yieldCost: ${manufactureInfo.yieldCost} -> DirectProcessCost: ${manufactureInfo.directProcessCost}`);
        return manufactureInfo;
    }
    /**
     * Calculations for Welding Cleaning Process
     * Ported from AngularJS: calculationsForWeldingCleaning
     */
    calculationsForWeldingCleaning(manufactureInfo, fieldColorsList, manufacturingObj) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        const materialInfoList = Array.isArray(manufactureInfo.materialInfoList)
            ? manufactureInfo.materialInfoList
            : [];
        let materialInfo = materialInfoList.find(rec => rec.processId === PrimaryProcessType.MigWelding ||
            rec.processId === PrimaryProcessType.TigWelding) || null;
        // Fallbacks: if not found, try to locate any materialInfo with coreCostDetails
        if (!materialInfo && materialInfoList.length > 0) {
            materialInfo =
                materialInfoList.find((rec) => (rec.coreCostDetails || []).length > 0) ||
                    materialInfoList[0] ||
                    null;
        }
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
        if (manufactureInfo.isCuttingLengthDirty &&
            manufactureInfo.cuttingLength !== null) {
            manufactureInfo.cuttingLength = Number(manufactureInfo.cuttingLength);
        }
        else {
            let totalWeldLength = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.totalWeldLength) || 0;
            // Fallback: compute total weld length from coreCostDetails when totalWeldLength is not provided
            if ((!totalWeldLength || totalWeldLength === 0) &&
                weldingMaterialDetails.length > 0) {
                totalWeldLength = weldingMaterialDetails.reduce((sum, core) => {
                    var _a, _b, _c, _d, _e;
                    const weldLen = Number((_b = (_a = core.weldLength) !== null && _a !== void 0 ? _a : core.coreLength) !== null && _b !== void 0 ? _b : 0);
                    const places = Number((_d = (_c = core.weldPlaces) !== null && _c !== void 0 ? _c : core.coreVolume) !== null && _d !== void 0 ? _d : 1);
                    const sideMultiplier = Number((_e = core.coreArea) !== null && _e !== void 0 ? _e : (core.weldSide === 'Both' ? 2 : 1));
                    return sum + weldLen * places * sideMultiplier;
                }, 0);
            }
            if (manufactureInfo.cuttingLength !== null) {
                totalWeldLength = this.shareService.checkDirtyProperty('cuttingLength', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.cuttingLength
                    : totalWeldLength;
            }
            manufactureInfo.cuttingLength = totalWeldLength;
            logger.info(`Cutting Length: ${manufactureInfo.cuttingLength}`);
        }
        const maxWeldElementSize = weldingMaterialDetails.length > 0
            ? Math.max(...weldingMaterialDetails.map((item) => {
                var _a, _b, _c, _d;
                return Number((_d = (_c = (_b = (_a = item.coreWeight) !== null && _a !== void 0 ? _a : item.weldElementSize) !== null && _b !== void 0 ? _b : item.coreHeight) !== null && _c !== void 0 ? _c : item.coreWidth) !== null && _d !== void 0 ? _d : 0);
            }))
            : 0;
        logger.info(`Max Weld Element Size: ${maxWeldElementSize}`);
        const weldCrossSectionalArea = 2 * manufactureInfo.cuttingLength * maxWeldElementSize;
        logger.info(`Weld Cross Sectional Area:${manufactureInfo.cuttingLength}*${maxWeldElementSize} = ${weldCrossSectionalArea}`);
        const materialType = this._smConfig.mapMaterial((_b = (_a = manufactureInfo.materialmasterDatas) === null || _a === void 0 ? void 0 : _a.materialType) === null || _b === void 0 ? void 0 : _b.materialTypeName);
        logger.info(`Material Type: ${materialType}`);
        let lookupListDia = (_d = (_c = this._weldingConfig
            .getDiscBrushDia()) === null || _c === void 0 ? void 0 : _c.filter(x => x.materialType === materialType &&
            x.partArea >= weldCrossSectionalArea)) === null || _d === void 0 ? void 0 : _d[0];
        if (weldCrossSectionalArea > 100001) {
            lookupListDia = (_g = (_f = (_e = this._weldingConfig
                .getDiscBrushDia()) === null || _e === void 0 ? void 0 : _e.filter(x => x.materialType === materialType)) === null || _f === void 0 ? void 0 : _f.reverse()) === null || _g === void 0 ? void 0 : _g[0];
            logger.info(`Lookup List Dia: ${lookupListDia}`);
        }
        let discBrushDia = 0;
        let deburringRPM = 0;
        if (lookupListDia) {
            discBrushDia = lookupListDia.discBrush;
            deburringRPM =
                (manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.processTypeID) === ProcessType.WeldingPreparation
                    ? lookupListDia.prepRPM
                    : lookupListDia.cleaningRPM;
            logger.info(`Disc Brush Dia: ${discBrushDia}`);
        }
        manufactureInfo.netMaterialCost = (materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.netMatCost) || 0;
        logger.info(`Net Material Cost: ${manufactureInfo.netMaterialCost}`);
        const feedPerREvRough = this.shareService.isValidNumber(discBrushDia / 2);
        logger.info(`Feed Per Rough: ${feedPerREvRough}`);
        const feedPerREvFinal = this.shareService.isValidNumber(discBrushDia / 4);
        logger.info(`Feed Per Final: ${feedPerREvFinal}`);
        const noOfPasses = this.shareService.isValidNumber(Math.ceil(maxWeldElementSize / (discBrushDia || 1)));
        logger.info(`No of Passes: ${noOfPasses}`);
        const reorientaionTime = this._weldingConfig.getUnloadingTime(materialInfo === null || materialInfo === void 0 ? void 0 : materialInfo.netWeight) || 0;
        logger.info(`Reorientation Time: ${reorientaionTime}`);
        if (manufactureInfo.isNoOfWeldPassesDirty &&
            manufactureInfo.noOfWeldPasses !== null) {
            manufactureInfo.noOfWeldPasses = Number(manufactureInfo.noOfWeldPasses);
            logger.info(`No of Weld Passes: ${manufactureInfo.noOfWeldPasses}`);
        }
        else {
            let noOfIntermediateStartStops = 0;
            noOfIntermediateStartStops = weldingMaterialDetails.reduce((sum, weldDetail) => sum +
                (weldDetail.coreArea === 1
                    ? weldDetail.coreVolume
                    : weldDetail.coreVolume * weldDetail.coreArea), 0);
            logger.info(`No of Intermediate Start Stops: ${noOfIntermediateStartStops}`);
            if (manufactureInfo.noOfWeldPasses !== null) {
                noOfIntermediateStartStops = this.shareService.checkDirtyProperty('noOfWeldPasses', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.noOfWeldPasses
                    : noOfIntermediateStartStops;
            }
            manufactureInfo.noOfWeldPasses = noOfIntermediateStartStops;
            logger.info(`No of Weld Passes: ${manufactureInfo.noOfWeldPasses}`);
        }
        const partHandlingTime = reorientaionTime + manufactureInfo.noOfWeldPasses * 5;
        logger.info(`Part Handling Time: ${partHandlingTime}`);
        const term = 2 * (manufactureInfo.cuttingLength + 5) * noOfPasses * 60;
        logger.info(`Term: ${term}`);
        const processTime = partHandlingTime +
            this.safeDiv(term, feedPerREvRough, deburringRPM) +
            (manufactureInfo.typeOfOperationId === 1
                ? 0
                : this.safeDiv(term, feedPerREvFinal, deburringRPM));
        logger.info(`Process Time: ${processTime}`);
        if (manufactureInfo.isefficiencyDirty && !!manufactureInfo.efficiency) {
            manufactureInfo.efficiency = Number(manufactureInfo.efficiency);
            logger.info(`Efficiency: ${manufactureInfo.efficiency}`);
        }
        else {
            manufactureInfo.efficiency = this.shareService.checkDirtyProperty('efficiency', fieldColorsList)
                ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.efficiency
                : this.shareService.isValidNumber(manufactureInfo.efficiency);
            if (Number(manufactureInfo.efficiency) < 1) {
                manufactureInfo.efficiency *= 100;
                logger.info(`Efficiency: ${manufactureInfo.efficiency}`);
            }
        }
        if (!manufactureInfo.efficiency)
            manufactureInfo.efficiency = 75;
        if (manufactureInfo.iscycleTimeDirty &&
            manufactureInfo.cycleTime !== null) {
            manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime);
            logger.info(`Cycle Time: ${manufactureInfo.cycleTime}`);
        }
        else {
            let cycleTime = this.shareService.isValidNumber(processTime / (manufactureInfo.efficiency / 100));
            logger.info(`Cycle Time: processTime ${processTime}, efficiency ${manufactureInfo.efficiency}, cycleTime ${cycleTime}`);
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
            logger.info(`Direct Machine Cost: ${manufactureInfo.directMachineCost}`);
        }
        else {
            let directMachineCost = this.shareService.isValidNumber((Number(manufactureInfo.machineHourRate) *
                Number(manufactureInfo.cycleTime)) /
                3600);
            logger.info(`Direct Machine Cost: machineHourRate ${manufactureInfo.machineHourRate}, cycleTime ${manufactureInfo.cycleTime}, directMachineCost ${directMachineCost}`);
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
            logger.info(`Direct Set Up Cost: ${manufactureInfo.directSetUpCost}`);
        }
        else {
            let directSetUpCost = this.shareService.isValidNumber(((Number(manufactureInfo.machineHourRate) +
                Number(manufactureInfo.skilledLaborRatePerHour)) *
                (Number(manufactureInfo.setUpTime) / 60)) /
                Number(manufactureInfo.lotSize));
            logger.info(`Direct Set Up Cost: machineHourRate ${manufactureInfo.machineHourRate}, skilledLaborRatePerHour ${manufactureInfo.skilledLaborRatePerHour}, setUpTime ${manufactureInfo.setUpTime}, lotSize ${manufactureInfo.lotSize}, directSetUpCost ${directSetUpCost}`);
            if (manufactureInfo.directSetUpCost !== null) {
                directSetUpCost = this.shareService.checkDirtyProperty('directSetUpCost', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.setUpCost
                    : directSetUpCost;
            }
            manufactureInfo.directSetUpCost = directSetUpCost;
            logger.info(`Direct Set Up Cost: ${manufactureInfo.directSetUpCost}`);
        }
        if (manufactureInfo.isdirectLaborCostDirty &&
            manufactureInfo.directLaborCost != null) {
            manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost);
            logger.info(`Direct Labor Cost: ${manufactureInfo.directLaborCost}`);
        }
        else {
            let directLaborCost = this.shareService.isValidNumber((Number(manufactureInfo.noOfLowSkilledLabours) *
                Number(manufactureInfo.lowSkilledLaborRatePerHour) *
                Number(manufactureInfo.cycleTime)) /
                3600);
            logger.info(`Direct Labor Cost: noOfLowSkilledLabours ${manufactureInfo.noOfLowSkilledLabours}, lowSkilledLaborRatePerHour ${manufactureInfo.lowSkilledLaborRatePerHour}, cycleTime ${manufactureInfo.cycleTime}, directLaborCost ${directLaborCost}`);
            if (manufactureInfo.directLaborCost !== null) {
                directLaborCost = this.shareService.checkDirtyProperty('directLaborCost', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.directLaborCost
                    : directLaborCost;
            }
            manufactureInfo.directLaborCost = directLaborCost;
            logger.info(`Direct Labor Cost: ${manufactureInfo.directLaborCost}`);
        }
        if (manufactureInfo.isinspectionTimeDirty &&
            manufactureInfo.inspectionTime !== null) {
            manufactureInfo.inspectionTime = Number(manufactureInfo.inspectionTime);
            logger.info(`Inspection Time: ${manufactureInfo.inspectionTime}`);
        }
        else {
            let inspectionTime = manufactureInfo.partComplexity == PartComplexity.Low
                ? 0.25
                : manufactureInfo.partComplexity == PartComplexity.Medium
                    ? 0.5
                    : manufactureInfo.partComplexity == PartComplexity.High
                        ? 1
                        : 0;
            logger.info(`Inspection Time: partComplexity ${manufactureInfo.partComplexity}, inspectionTime ${inspectionTime}`);
            if (manufactureInfo.inspectionTime !== null) {
                inspectionTime = this.shareService.checkDirtyProperty('inspectionTime', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.inspectionTime
                    : inspectionTime;
            }
            manufactureInfo.inspectionTime = inspectionTime;
        }
        if (manufactureInfo.isinspectionCostDirty &&
            manufactureInfo.inspectionCost !== null) {
            manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost);
            logger.info(`Inspection Cost: ${manufactureInfo.inspectionCost}`);
        }
        else {
            let inspectionCost = this.shareService.isValidNumber(((((_h = manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.qaOfInspectorRate) !== null && _h !== void 0 ? _h : 0) / 60) *
                Math.ceil((((_j = manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.samplingRate) !== null && _j !== void 0 ? _j : 0) / 100) *
                    ((_k = manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.lotSize) !== null && _k !== void 0 ? _k : 0)) *
                ((_l = manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.inspectionTime) !== null && _l !== void 0 ? _l : 0)) /
                ((_m = manufactureInfo === null || manufactureInfo === void 0 ? void 0 : manufactureInfo.lotSize) !== null && _m !== void 0 ? _m : 1));
            logger.info(`Inspection Cost: qaOfInspectorRate ${manufactureInfo.qaOfInspectorRate}, samplingRate ${manufactureInfo.samplingRate}, lotSize ${manufactureInfo.lotSize}, inspectionTime ${manufactureInfo.inspectionTime}, inspectionCost ${inspectionCost}`);
            if (manufactureInfo.inspectionCost !== null) {
                inspectionCost = this.shareService.checkDirtyProperty('inspectionCost', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.inspectionCost
                    : inspectionCost;
            }
            manufactureInfo.inspectionCost = inspectionCost;
        }
        if (manufactureInfo.isyieldPercentDirty &&
            manufactureInfo.yieldPer !== null) {
            manufactureInfo.yieldPer = Number(manufactureInfo.yieldPer);
            logger.info(`Yield Per: ${manufactureInfo.yieldPer}`);
        }
        else {
            let yieldPer = 98.5;
            logger.info(`Yield Per: ${yieldPer}`);
            if (manufactureInfo.yieldPer !== null) {
                yieldPer = this.shareService.checkDirtyProperty('yieldPer', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.yieldPer
                    : yieldPer;
            }
            manufactureInfo.yieldPer = yieldPer;
        }
        if (manufactureInfo.isyieldCostDirty &&
            manufactureInfo.yieldCost !== null) {
            manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost);
            logger.info(`Yield Cost: ${manufactureInfo.yieldCost}`);
        }
        else {
            let sum = this.shareService.isValidNumber(Number(manufactureInfo.directMachineCost) +
                Number(manufactureInfo.directSetUpCost) +
                Number(manufactureInfo.directLaborCost) +
                Number(manufactureInfo.inspectionCost));
            let yieldCost = this.shareService.isValidNumber((1 - Number(manufactureInfo.yieldPer) / 100) *
                (Number(manufactureInfo.netMaterialCost) + sum));
            logger.info(`Yield Cost: directMachineCost ${manufactureInfo.directMachineCost}, directSetUpCost ${manufactureInfo.directSetUpCost}, directLaborCost ${manufactureInfo.directLaborCost}, inspectionCost ${manufactureInfo.inspectionCost}, yieldCost ${yieldCost}`);
            if (manufactureInfo.yieldCost !== null) {
                yieldCost = this.shareService.checkDirtyProperty('yieldCost', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.yieldCost
                    : yieldCost;
            }
            manufactureInfo.yieldCost = yieldCost;
        }
        manufactureInfo.directProcessCost = this.shareService.isValidNumber(Number(manufactureInfo.directLaborCost) +
            Number(manufactureInfo.directMachineCost) +
            Number(manufactureInfo.directSetUpCost) +
            Number(manufactureInfo.inspectionCost) +
            Number(manufactureInfo.yieldCost));
        logger.info(`Direct Process Cost: ${manufactureInfo.directProcessCost}`);
        return manufactureInfo;
    }
    /**
     * Helper method to safely divide to avoid division by zero
     */
    safeDiv(numerator, a, b) {
        return a && b ? numerator / (a * b) : 0;
    }
    calculateInspectionCost(inspectionTime, rate, samplingRate, lotSize, isSeamWelding) {
        const safeTime = Number(inspectionTime) || 0;
        const safeRate = Number(rate) || 0;
        const safeLot = Math.max(Number(lotSize) || 1, 1);
        const normalizedSampling = Math.min(Math.max(Number(samplingRate) || 100, 0), 100);
        const samplingFactor = normalizedSampling / 100;
        let cost = safeTime * safeRate * samplingFactor;
        if (isSeamWelding) {
            cost = cost / safeLot;
        }
        else {
            cost = cost / 60; // minutes → hours
        }
        return Number.isFinite(cost) ? cost : 0;
    }
    resolveField(fieldName, currentValue, isDirty, calculatedValue, fieldColorsList, manufacturingObj) {
        if (isDirty && currentValue !== null) {
            return Number(currentValue);
        }
        if (currentValue !== null) {
            const isColorDirty = this.shareService.checkDirtyProperty(String(fieldName), fieldColorsList);
            if (isColorDirty) {
                return manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj[fieldName];
            }
        }
        return calculatedValue;
    }
    weldingPreCalc(manufactureInfo, fieldColorsList, manufacturingObj) {
        manufactureInfo.setUpTime = manufactureInfo.setUpTime || 30;
        if (manufactureInfo.isyieldPercentDirty && !!manufactureInfo.yieldPer) {
            manufactureInfo.yieldPer = this.shareService.isValidNumber(Number(manufactureInfo.yieldPer));
        }
        else {
            let yieldPer = this._weldingConfig.defaultPercentages(Number(manufactureInfo.processTypeID), manufactureInfo.partComplexity, 'yieldPercentage');
            if (manufactureInfo.yieldPer) {
                yieldPer = this.shareService.checkDirtyProperty('yieldPer', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.yieldPer
                    : this.shareService.isValidNumber(yieldPer);
            }
            manufactureInfo.yieldPer = yieldPer;
        }
        if (manufactureInfo.isSamplingRateDirty && !!manufactureInfo.samplingRate) {
            manufactureInfo.samplingRate = this.shareService.isValidNumber(Number(manufactureInfo.samplingRate));
        }
        else {
            let samplingRate = this._weldingConfig.defaultPercentages(Number(manufactureInfo.processTypeID), manufactureInfo.partComplexity, 'samplingRate');
            if (manufactureInfo.samplingRate) {
                samplingRate = this.shareService.checkDirtyProperty('samplingRate', fieldColorsList)
                    ? manufacturingObj === null || manufacturingObj === void 0 ? void 0 : manufacturingObj.samplingRate
                    : this.shareService.isValidNumber(samplingRate);
            }
            manufactureInfo.samplingRate = samplingRate;
        }
        if (manufactureInfo.isefficiencyDirty && !!manufactureInfo.efficiency) {
            manufactureInfo.efficiency = Number(manufactureInfo.efficiency);
        }
        else {
            let efficiency = 75;
            const weldingEffeciencyValues = this._weldingConfig
                .getWeldingEfficiencyData(Number(manufactureInfo.processTypeID) === ProcessType.StickWelding
                ? 'stickWelding'
                : 'welding')
                .find((x) => x.id === Number(manufactureInfo.weldingPosition));
            if (Number(manufactureInfo.semiAutoOrAuto) == MachineType.Automatic) {
                efficiency = Number((weldingEffeciencyValues === null || weldingEffeciencyValues === void 0 ? void 0 : weldingEffeciencyValues.EffeciencyAuto) || efficiency);
            }
            else if (Number(manufactureInfo.semiAutoOrAuto) == MachineType.Manual) {
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
        if (manufactureInfo.efficiency <= 1) {
            manufactureInfo.efficiency = manufactureInfo.efficiency * 100;
        }
        if (!manufactureInfo.efficiency) {
            manufactureInfo.efficiency = 75;
        }
        // Sync MachineEfficiency for consistency
        if (!manufactureInfo.MachineEfficiency) {
            manufactureInfo.MachineEfficiency = manufactureInfo.efficiency;
        }
    }
    calculateExpectedWeldingMaterialCosts(materialInfo, weldSubMaterials, efficiency = 75, MachineEfficiency) {
        let totalWeldLength = 0;
        let totalVolume = 0;
        let totalWeldLoss = 0;
        const materialType = materialInfo.materialType || 'Carbon Steel'; // Default to Carbon Steel if not provided
        weldSubMaterials.forEach(coreCost => {
            // Map parameters to calculateWeldVolume inputs
            const weldElementSize = Number(coreCost.weldElementSize || coreCost.coreWeight || 0);
            const weldSize = Number(coreCost.weldSize || coreCost.coreHeight || 0);
            const weldPasses = Number(coreCost.noOfWeldPasses || coreCost.noOfCore || 0);
            const weldLength = Number(coreCost.weldLength || coreCost.coreLength || 0);
            const weldPlaces = Number(coreCost.weldPlaces || coreCost.coreVolume || 0); // Note: coreVolume mapping from service
            const weldSide = coreCost.weldSide === 'Both' || coreCost.weldSide === 2 ? 2 : 1;
            const weldTypeInput = String(coreCost.weldType || coreCost.coreShape || 1); // Passed as string or number ID
            const wireDiameter = Number(coreCost.wireDia || coreCost.coreWidth || 0);
            // Calculate using the standalone utility function
            const result = calculateWeldVolume(weldTypeInput, weldSize, weldElementSize, weldLength, weldPlaces, weldPasses, weldSide);
            totalWeldLength += result.totalWeldLength;
            totalVolume += result.weldVolume;
            const weldLoss = this.getMaxNearestWeightLoss(materialType, wireDiameter);
            totalWeldLoss += weldLoss;
        });
        const density = Number(materialInfo.density || 7.85); // g/cm3
        const totalWeldMaterialWeight = (totalVolume / 1000) * density;
        const efficiencyFactor = (MachineEfficiency || efficiency) / 100;
        const weldBeadWeightWithWastage = totalWeldMaterialWeight / efficiencyFactor + totalWeldLoss;
        return {
            totalWeldLength,
            totalWeldMaterialWeight,
            weldBeadWeightWithWastage
        };
    }
    calculatePowerConsumption(current, voltage) {
        return (current * voltage) / 1000;
    }
    calculateCostPower(cycleTime, // in seconds
    powerConsumptionKW, // kW
    electricityUnitCost // per kWh
    ) {
        return this.shareService.isValidNumber((cycleTime / 3600) * powerConsumptionKW * electricityUnitCost);
    }
    calculateMachineCost(machineHourRate, cycleTime // in seconds
    ) {
        return this.shareService.isValidNumber((machineHourRate / 3600) * cycleTime);
    }
    calculateLaborCost(laborHourRate, cycleTime, // in seconds
    noOfLabors) {
        return this.shareService.isValidNumber((laborHourRate / 3600) * cycleTime * noOfLabors);
    }
    calculateSetupCost(setupTime, // in minutes
    machineHourRate, laborHourRate, // skilled labor
    lotSize) {
        return this.shareService.isValidNumber(((laborHourRate + machineHourRate) * (setupTime / 60)) / lotSize);
    }
    calculateYieldCost(yieldPercentage, processCostSum, // Machine + Setup + Labor + Inspection
    materialCost) {
        return this.shareService.isValidNumber((1 - yieldPercentage / 100) * (materialCost + processCostSum));
    }
    getMaxNearestWeightLoss(materialType, wireDiameter) {
        const filtered = exports.WeldingWeightLossData.filter((item) => item.MaterialType === materialType &&
            item.WireDiameter_mm >= wireDiameter).sort((a, b) => a.WireDiameter_mm - b.WireDiameter_mm);
        return filtered.length > 0 ? filtered[0].loss_g : 0;
    }
    getExpectedEfficiency(weldPosition, rawMachineType, weldType = 'welding') {
        const positions = costing_config_1.costingConfig.weldingPositionList(weldType);
        // -------------------------------
        // Normalize inputs
        // -------------------------------
        const normalizedPosition = weldPosition.trim().toLowerCase();
        const normalizedMachine = rawMachineType
            .trim()
            .toLowerCase()
            .replace(/[^a-z]/g, ''); // removes space, dash etc
        logger.info(`🧪 [Efficiency] Raw inputs → Position="${weldPosition}", Machine="${rawMachineType}"`);
        logger.info(`🧪 [Efficiency] Normalized → Position="${normalizedPosition}", Machine="${normalizedMachine}"`);
        // -------------------------------
        // Resolve machine efficiency key
        // -------------------------------
        let efficiencyKey;
        if (normalizedMachine.includes('semiauto')) {
            efficiencyKey = 'EffeciencySemiAuto';
        }
        else if (normalizedMachine.includes('manual')) {
            efficiencyKey = 'EffeciencyManual';
        }
        else if (normalizedMachine.includes('auto')) {
            efficiencyKey = 'EffeciencyAuto';
        }
        if (!efficiencyKey) {
            logger.warn(`⚠️ [Efficiency] Unable to resolve machine type from "${rawMachineType}". ` +
                `Defaulting to EffeciencyManual.`);
            efficiencyKey = 'EffeciencyManual';
        }
        logger.info(`🧪 [Efficiency] Resolved efficiency key = "${String(efficiencyKey)}"`);
        // -------------------------------
        // Find matching weld position row
        // -------------------------------
        const positionRow = positions.find(p => p.name.trim().toLowerCase() === normalizedPosition);
        if (!positionRow) {
            logger.warn(`⚠️ [Efficiency] Weld position "${weldPosition}" not found in config. ` +
                `Defaulting efficiency to 75%.`);
            return 75;
        }
        logger.info(`🧪 [Efficiency] Matched config row → ` +
            `Position="${positionRow.name}", ` +
            `Auto=${positionRow.EffeciencyAuto}, ` +
            `Manual=${positionRow.EffeciencyManual}, ` +
            `SemiAuto=${positionRow.EffeciencySemiAuto}`);
        // -------------------------------
        // Extract efficiency value
        // -------------------------------
        const efficiency = positionRow[efficiencyKey];
        if (typeof efficiency !== 'number') {
            logger.warn(`⚠️ [Efficiency] Efficiency value missing for key "${String(efficiencyKey)}". ` + `Row=${JSON.stringify(positionRow)}. Defaulting to 75%.`);
            return 75;
        }
        logger.info(`✅ [Efficiency] Final resolved efficiency = ${efficiency}% ` +
            `(Key="${String(efficiencyKey)}", Position="${positionRow.name}")`);
        return efficiency;
    }
}
exports.WeldingCalculator = WeldingCalculator;
function getWeldTypeId(weldType) {
    if (typeof weldType === 'number')
        return weldType;
    if (!weldType)
        return 1;
    const lowerType = weldType.toString().toLowerCase();
    if (lowerType.includes('fillet'))
        return 1;
    if (lowerType.includes('square'))
        return 2;
    if (lowerType.includes('plug'))
        return 3;
    if (lowerType.includes('bevel') || lowerType.includes('v groove'))
        return 4;
    if (lowerType.includes('u/j'))
        return 5;
    return 1;
}
function calculateSingleWeldCycleTime(input) {
    const { totalWeldLength, travelSpeed, tackWelds, intermediateStops, weldType } = input;
    const cycleTimeForIntermediateStops = intermediateStops * 5;
    const cycleTimeForTackWelds = tackWelds * 3;
    const weldProcessTime = totalWeldLength / travelSpeed;
    let totalSubProcessTime = weldProcessTime + cycleTimeForIntermediateStops + cycleTimeForTackWelds;
    const typeId = getWeldTypeId(weldType || '');
    if (typeId === 4) {
        totalSubProcessTime *= 0.95;
    }
    else if (typeId === 5) {
        totalSubProcessTime *= 1.5;
    }
    return totalSubProcessTime;
}
function calculateArcOnTime(subProcessCycleTime, loadingUnloadingTime) {
    return subProcessCycleTime + loadingUnloadingTime;
}
function calculateArcOffTime(arcOnTime, factor = 0.05) {
    return arcOnTime * factor;
}
function calculateWeldCycleTimeBreakdown(input) {
    var _a, _b;
    const efficiency = (0, helpers_1.normalizeEfficiency)(input.MachineEfficiency || input.efficiency);
    const subProcessCycleTime = ((_a = input.subProcessCycleTimes) !== null && _a !== void 0 ? _a : []).reduce((sum, t) => sum + t, 0);
    const totalLoadingUnloading = input.loadingUnloadingTime || 0;
    const loadingTime = totalLoadingUnloading / 2;
    const unloadingTime = totalLoadingUnloading / 2;
    // ✅ In Mig/Tig calculation, Arc On Time includes SubProcess + Part Handling
    const arcOnTime = subProcessCycleTime + totalLoadingUnloading;
    logger.info(`Arc On Time : ${subProcessCycleTime} + ${totalLoadingUnloading} = ${arcOnTime.toFixed(4)} sec`);
    const arcOffTime = arcOnTime * 0.05;
    logger.info(`Arc Off Time : ${arcOnTime} * 0.05 = ${arcOffTime.toFixed(4)} sec`);
    const partReorientationCount = input.partReorientation || 0;
    const partReorientationTime = partReorientationCount * loadingTime;
    logger.info(`Part Reorientation Time : ${partReorientationCount} * ${loadingTime} = ${partReorientationTime.toFixed(4)} sec`);
    // Dry Cycle Time = (SubProcess + Handling) + ArcOffFactor + Reorientations
    const totalWeldCycleTime = arcOnTime + arcOffTime + partReorientationTime;
    logger.info(`Total Weld Cycle Time : ${arcOnTime} + ${arcOffTime} + ${partReorientationTime} = ${totalWeldCycleTime.toFixed(4)} sec`);
    const finalCycleTime = efficiency > 0 ? totalWeldCycleTime / efficiency : totalWeldCycleTime;
    logger.info(`Final Cycle Time : ${totalWeldCycleTime} / ${efficiency} = ${finalCycleTime.toFixed(4)} sec`);
    return {
        subProcessCycleTimes: (_b = input.subProcessCycleTimes) !== null && _b !== void 0 ? _b : [],
        loadingUnloadingTime: totalLoadingUnloading,
        partReorientation: partReorientationCount,
        efficiency,
        subProcessCycleTime,
        loadingTime,
        unloadingTime,
        arcOnTime,
        arcOffTime,
        partReorientationTime,
        totalWeldCycleTime,
        finalCycleTime,
        cycleTime: finalCycleTime
    };
}
function calculateSubProcessCycleTime(subProcesses, semiAutoOrAuto, getWeldingEfficiency, getWeldingData) {
    return subProcesses.reduce((total, sp) => {
        var _a, _b, _c, _d;
        const efficiency = getWeldingEfficiency(sp.formLength, semiAutoOrAuto);
        logger.info(`Efficiency : ${efficiency.toFixed(4)}`);
        const travelSpeed = sp.formHeight
            ? Number(sp.formHeight)
            : ((_b = (_a = getWeldingData('Default', sp.shoulderWidth)) === null || _a === void 0 ? void 0 : _a.TravelSpeed_mm_per_sec) !== null && _b !== void 0 ? _b : 1) *
                efficiency *
                (semiAutoOrAuto ? 1 / 0.8 : 1);
        logger.info(`Travel Speed : ${travelSpeed.toFixed(4)} mm/sec`);
        const stops = (sp.formPerimeter || 0) * 5;
        logger.info(`Stops : ${stops.toFixed(4)} sec`);
        const tackWelds = ((_d = (_c = sp.hlFactor) !== null && _c !== void 0 ? _c : sp.noOfHoles) !== null && _d !== void 0 ? _d : 0) * 3;
        logger.info(`Tack Welds : ${tackWelds.toFixed(4)} sec`);
        let cycleTime = sp.formLength / travelSpeed + stops + tackWelds;
        logger.info(`Cycle Time : ${cycleTime.toFixed(4)} sec`);
        if (sp.lengthOfCut === 4)
            cycleTime *= 0.95;
        logger.info(`Cycle Time after lengthOfCut 4 : ${cycleTime.toFixed(4)} sec`);
        if (sp.lengthOfCut === 5)
            cycleTime *= 1.5;
        logger.info(`Cycle Time after lengthOfCut 5 : ${cycleTime.toFixed(4)} sec`);
        return total + cycleTime;
    }, 0);
}
function calculateTotalWeldCycleTime(input) {
    return calculateWeldCycleTimeBreakdown(input).cycleTime;
}
function calculationForWeldingWrapper(manufactureInfo, fieldColorsList, manufacturingObj, laborRateDto) {
    const calc = new WeldingCalculator();
    return calc.calculationForWelding(manufactureInfo, fieldColorsList, manufacturingObj, laborRateDto);
}
function calculationForSeamWeldingWrapper(manufactureInfo, fieldColorsList, manufacturingObj, laborRateDto) {
    const calc = new WeldingCalculator();
    return calc.calculationForSeamWelding(manufactureInfo, fieldColorsList, manufacturingObj, laborRateDto);
}
function calculationForSpotWeldingWrapper(manufactureInfo, fieldColorsList, manufacturingObj, laborRateDto) {
    const calc = new WeldingCalculator();
    return calc.calculationForSpotWelding(manufactureInfo, fieldColorsList, manufacturingObj, laborRateDto);
}
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
function calculatePowerCost(cycleTimeSeconds, powerConsumptionKW, electricityUnitCost) {
    return (cycleTimeSeconds / 3600) * powerConsumptionKW * electricityUnitCost;
}
function calculateManufacturingCO2(cycleTimeSeconds, powerConsumptionKW, co2PerKwHr) {
    const cycleTimeHours = cycleTimeSeconds / 3600;
    const co2PerPart = cycleTimeHours * powerConsumptionKW * co2PerKwHr;
    return Number(co2PerPart.toFixed(4));
}
function round4(value) {
    return Math.round(value * 10000) / 10000;
}
function calculateNetWeight(volumeMm3, densityGCm3) {
    // Convert mm³ → cm³ → kg
    const volumeCm3 = volumeMm3 / 1000;
    const weightGrams = volumeCm3 * densityGCm3;
    //const weightKg = weightGrams / 1000
    LoggerUtil_1.default.debug(`[calculateNetWeight] Volume: ${volumeMm3}mm³, Density: ${densityGCm3}g/cm³ = ${weightGrams.toFixed(4)}g`);
    return weightGrams;
}
function calculateWeldVolume(weldType, weldSize, weldElementSize, weldLength, weldPlaces, weldPasses, weldSide) {
    const typeId = getWeldTypeId(weldType);
    let weldCrossSection = 0;
    const size = weldElementSize;
    const height = weldSize;
    if (typeId === 1 || typeId === 2) {
        weldCrossSection = (size * height) / 2;
    }
    else if (typeId === 3) {
        weldCrossSection = size * size + height;
    }
    else if (typeId === 4) {
        weldCrossSection = size * size + height / 2;
    }
    else {
        weldCrossSection = (size * height * 3) / 2;
    }
    let sideMultiplier = 1;
    if (weldSide === 'Both' || weldSide === 2) {
        sideMultiplier = 2;
    }
    else {
        sideMultiplier = 1;
    }
    const totalWeldLength = weldPasses * weldLength * weldPlaces * sideMultiplier;
    const weldVolume = totalWeldLength * weldCrossSection;
    return {
        totalWeldLength,
        weldVolume,
        weldMass: 0
    };
}
function validateTotalLength(weldLength_1, weldPlaces_1, weldSide_1, totalWeldLength_1) {
    return __awaiter(this, arguments, void 0, function* (weldLength, weldPlaces, weldSide, totalWeldLength, fieldName = 'Total Length') {
        yield (0, test_1.expect)(weldLength).toBeVisible();
        const length = Number((yield weldLength.inputValue()) || '0');
        const places = Number((yield weldPlaces.inputValue()) || '0');
        const sideText = (yield weldSide.locator('option:checked').textContent()) || '';
        const sideFactor = sideText.toLowerCase().includes('both') ? 2 : 1;
        const expected = length * places * sideFactor;
        yield (0, test_1.expect)(totalWeldLength).not.toHaveValue('');
        const actual = Number((yield totalWeldLength.inputValue()) || '0');
        test_1.expect.soft(actual).toBeCloseTo(expected, 1);
        LoggerUtil_1.default.info(`${fieldName} → UI: ${actual}, Expected: ${expected}`);
    });
}
function calculateTotalWeldLength(weldLength, weldPlaces, weldSide = 'One Side') {
    const sideMultiplier = weldSide && weldSide.toLowerCase().includes('both') ? 2 : 1;
    const totalLength = weldLength * weldPlaces * sideMultiplier;
    LoggerUtil_1.default.debug(`[calculateTotalWeldLength] Length: ${weldLength}mm × Places: ${weldPlaces} × Sides: ${sideMultiplier} = ${totalLength.toFixed(2)}mm`);
    return totalLength;
}
function calculateRowTotalLength(length, places, side) {
    const sideFactor = side.toLowerCase().includes('both') || side.toLowerCase().includes('double')
        ? 2
        : 1;
    return length * places * sideFactor;
}
function calculateOverHeadCost(overHeadCost, profitCost, costOfCapital) {
    const total = overHeadCost + costOfCapital + profitCost;
    return Number(total.toFixed(4));
}
function calculateTotalPackMatlCost(primaryCosts1, primaryCosts2, secondaryCost, tertiaryCost) {
    const grandTotal = Number(primaryCosts1) +
        Number(primaryCosts2) +
        Number(secondaryCost) +
        Number(tertiaryCost);
    const roundedTotal = Number(grandTotal.toFixed(4));
    console.log('Rounded Total:', roundedTotal);
    return roundedTotal;
}
function calculateExPartCost(materialCost, manufacturingCost, toolingCost, overheadCost, packingCost) {
    return __awaiter(this, void 0, void 0, function* () {
        const total = materialCost + manufacturingCost + toolingCost + overheadCost + packingCost;
        return Number(total.toFixed(4));
    });
}
function calculatePartCost(materialCost, manufacturingCost, toolingCost, overheadCost, packingCost, tariffCost, freightCost) {
    return __awaiter(this, void 0, void 0, function* () {
        const total = materialCost +
            manufacturingCost +
            toolingCost +
            overheadCost +
            packingCost +
            tariffCost +
            freightCost;
        // Match UI precision
        return Number(total.toFixed(4));
    });
}
function getCurrencyNumber(locator, label) {
    return __awaiter(this, void 0, void 0, function* () {
        let raw = '';
        try {
            raw = yield locator.inputValue(); // works if input
        }
        catch (_a) {
            raw = yield locator.innerText(); // works if td/div/span
        }
        raw = raw.replace(/\s+/g, ' ').trim();
        const match = raw.match(/(\d+(\.\d+)?)/);
        if (!match) {
            // If element contains only currency symbol or is empty, return 0
            logger.info(`⚠️ No number found in ${label !== null && label !== void 0 ? label : 'element'}: "${raw}" - defaulting to 0`);
            return 0;
        }
        const value = Number(match[1]);
        logger.info(`✅ ${label !== null && label !== void 0 ? label : 'Value'} parsed = ${value}`);
        return value;
    });
}
function getCellNumber(locator) {
    return __awaiter(this, void 0, void 0, function* () {
        const raw = yield locator.innerText();
        // Extract first number in the string (handles "$0.1595", "0.1595 $", etc.)
        const match = raw.match(/[\d,.]+/);
        if (!match) {
            // If cell contains only currency symbol or is empty, return 0
            logger.info(`⚠️ No number found in cell text: "${raw}" - defaulting to 0`);
            return 0;
        }
        return Number(match[0].replace(/,/g, '')); // remove commas if any
    });
}
function getCellNumberFromTd(locator) {
    return __awaiter(this, void 0, void 0, function* () {
        const raw = yield locator.innerText();
        const match = raw.match(/[\d,.]+/); // extract first number
        if (!match) {
            // If cell contains only currency symbol or is empty, return 0
            logger.info(`⚠️ No number found in td text: "${raw}" - defaulting to 0`);
            return 0;
        }
        return Number(match[0].replace(/,/g, ''));
    });
}
function getNumber(locator) {
    return __awaiter(this, void 0, void 0, function* () {
        const element = yield locator.elementHandle();
        if (!element)
            throw new Error('Element not found');
        const tagName = yield element.evaluate(el => el.tagName.toLowerCase());
        let raw = '';
        if (tagName === 'input' || tagName === 'textarea') {
            raw = yield locator.inputValue();
        }
        else {
            raw = yield locator.innerText();
        }
        const match = raw.match(/-?[\d,.]+/);
        if (!match) {
            throw new Error(`❌ Failed to extract number from text: "${raw}"`);
        }
        return Number(match[0].replace(/,/g, ''));
    });
}
function getTotalCostByType(page, type) {
    return __awaiter(this, void 0, void 0, function* () {
        const cells = page.locator("//table[@aria-describedby='packagingTable']" +
            `//tr[.//td[normalize-space()='${type}']]` +
            "//td[contains(@class,'cdk-column-cost')]");
        const count = yield cells.count();
        if (count === 0) {
            throw new Error(`❌ No cost cells found for type: ${type}`);
        }
        let total = 0;
        for (let i = 0; i < count; i++) {
            const rawText = (yield cells.nth(i).innerText()).trim();
            const match = rawText.match(/-?[\d,.]+/);
            if (!match) {
                throw new Error(`❌ Unable to extract number from text: "${rawText}"`);
            }
            total += Number(match[0].replace(/,/g, ''));
        }
        return Number(total.toFixed(4));
    });
}
class VerificationHelper {
    static getPrecisionFromUI(uiText) {
        const normalized = uiText.replace(/,/g, '').trim();
        return normalized.includes('.') ? normalized.split('.')[1].length : 0;
    }
}
exports.VerificationHelper = VerificationHelper;
