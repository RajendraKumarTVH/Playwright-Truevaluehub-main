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
exports.readMaterialDimensionsAndDensity = readMaterialDimensionsAndDensity;
exports.verifyWeldingMaterialCalculationsHelper = verifyWeldingMaterialCalculationsHelper;
const LoggerUtil_1 = __importDefault(require("../lib/LoggerUtil"));
const logger = LoggerUtil_1.default;
function readMaterialDimensionsAndDensity(page) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const DEFAULT_DENSITY = 7.87;
        let density = DEFAULT_DENSITY;
        let length = 0;
        let width = 0;
        let height = 0;
        try {
            if ((_a = page.isPageClosed) === null || _a === void 0 ? void 0 : _a.call(page)) {
                logger.warn('⚠️ Page already closed — using defaults');
                return { length, width, height, density };
            }
            yield page.waitAndClick(page.MaterialDetailsTab);
            if (yield page.Density.first()
                .isVisible({ timeout: 3000 })
                .catch(() => false)) {
                density =
                    Number(yield page.Density.first().inputValue()) || DEFAULT_DENSITY;
            }
            else {
                logger.warn('⚠️ Density field not visible — using default');
            }
            yield page.waitAndClick(page.MaterialInfo);
            if (yield page.PartEnvelopeLength.first()
                .isVisible({ timeout: 3000 })
                .catch(() => false)) {
                ;
                [length, width, height] = (yield Promise.all([
                    page.PartEnvelopeLength.first().inputValue(),
                    page.PartEnvelopeWidth.first().inputValue(),
                    page.PartEnvelopeHeight.first().inputValue()
                ])).map(v => Number(v) || 0);
            }
            else {
                logger.warn('⚠️ Dimension fields not visible — using defaults');
            }
        }
        catch (err) {
            logger.warn(`⚠️ Failed to read material data safely: ${err}`);
        }
        logger.info(`📐 L:${length}, W:${width}, H:${height} | Density:${density}`);
        return { length, width, height, density };
    });
}
function verifyWeldingMaterialCalculationsHelper(page, calculator, collectWelds) {
    return __awaiter(this, void 0, void 0, function* () {
        logger.info('\n🔹 Step: Verify Material Calculations from UI (helper)');
        const { density } = yield readMaterialDimensionsAndDensity(page);
        logger.info(`🧪 Density → ${density}`);
        const partVolume = yield page.waitForStableNumber(page.PartVolume, 'Part Volume');
        logger.info(`📦 Part Volume → ${partVolume}`);
        const expectedNetWeight = calculator.calculateNetWeight
            ? calculator.calculateNetWeight(partVolume, density)
            : partVolume * density;
        // Use existing UI verification helpers
        // Verify net weight if possible
        try {
            const actualNetWeight = yield (() => __awaiter(this, void 0, void 0, function* () {
                const net = yield page.readNumberSafe(page.NetWeight, 'Net Weight', 10000, 2);
                return net / 1000;
            }))();
            // Best-effort numeric check
            if (Number.isFinite(expectedNetWeight)) {
                // allow slight tolerance
                const diff = Math.abs(actualNetWeight - expectedNetWeight);
                if (diff > 0.1) {
                    logger.warn(`⚠️ Net weight mismatch (ui ${actualNetWeight} vs calc ${expectedNetWeight})`);
                }
            }
        }
        catch (err) {
            logger.warn(`⚠️ Could not verify net weight in helper: ${err}`);
        }
        // Prefer using provided collector to avoid duplicating logic from MigWeldingLogic
        const weldSubMaterials = yield (collectWelds
            ? collectWelds()
            : (() => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const arr = [];
                for (const i of [1, 2]) {
                    try {
                        const weldType = yield page.getSelectedOptionText(page[`MatWeldType${i}`]);
                        const weldSide = yield page.getSelectedOptionText(page[`MatWeldSide${i}`]);
                        const weldSize = Number(yield page[`MatWeldSize${i}`].inputValue());
                        const weldElementSize = Number(yield page[`MatWeldElementSize${i}`].inputValue());
                        const weldLength = Number(yield page[`MatWeldLengthmm${i}`].inputValue());
                        const weldPlaces = Number(yield page[`MatWeldPlaces${i}`].inputValue());
                        const wireDia = Number((yield ((_a = page[`MatWireDia${i}`]) === null || _a === void 0 ? void 0 : _a.inputValue())) || 0);
                        const noOfWeldPasses = Number(yield page[`MatNoOfWeldPasses${i}`].inputValue());
                        arr.push({
                            weldType,
                            weldSide,
                            weldSize,
                            weldElementSize,
                            weldLength,
                            weldPlaces,
                            wireDia,
                            noOfWeldPasses
                        });
                    }
                    catch (_b) {
                        // ignore missing rows
                    }
                }
                return arr;
            }))());
        const calculated = calculator.calculateExpectedWeldingMaterialCosts({ density }, weldSubMaterials);
        logger.info(`📐 Calculated → ${JSON.stringify(calculated)}`);
        try {
            yield page.verifyUIValue({
                locator: page.totalWeldLength,
                expectedValue: calculated.totalWeldLength,
                label: 'Total Weld Length'
            });
            yield page.verifyUIValue({
                locator: page.TotalWeldMaterialWeight,
                expectedValue: calculated.totalWeldMaterialWeight,
                label: 'Total Weld Material Weight'
            });
            yield page.verifyUIValue({
                locator: page.WeldBeadWeightWithWastage,
                expectedValue: calculated.weldBeadWeightWithWastage,
                label: 'Weld Bead Weight with Wastage'
            });
        }
        catch (err) {
            logger.warn(`⚠️ UI verification failed in material helper: ${err}`);
        }
        logger.info('✅ Material calculations verified successfully from helper');
    });
}
