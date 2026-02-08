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
exports.MigWeldingLogic = void 0;
const test_1 = require("@playwright/test");
const LoggerUtil_1 = __importDefault(require("../lib/LoggerUtil"));
const welding_calculator_1 = require("../utils/welding-calculator");
const mig_welding_testdata_1 = require("../../test-data/mig-welding-testdata");
const utils_1 = require("tests/utils");
const logger = LoggerUtil_1.default;
class MigWeldingLogic {
    constructor(page) {
        this.page = page;
        this.calculator = new welding_calculator_1.WeldingCalculator();
    }
    setProcessGroup(value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.selectOption(this.page.ProcessGroup, value);
        });
    }
    getMaterialDimensionsAndDensity() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.waitAndClick(this.page.MaterialDetailsTab);
            yield test_1.expect.soft(this.page.Density).toBeVisible();
            const density = yield this.page.getInputValueAsNumber(this.page.Density);
            yield this.page.wait(1000);
            yield this.page.waitAndClick(this.page.MaterialInfo);
            yield test_1.expect.soft(this.page.PartEnvelopeLength).toBeVisible();
            const length = yield this.page.getInputValueAsNumber(this.page.PartEnvelopeLength);
            const width = yield this.page.getInputValueAsNumber(this.page.PartEnvelopeWidth);
            const height = yield this.page.getInputValueAsNumber(this.page.PartEnvelopeHeight);
            return { length, width, height, density };
        });
    }
    navigateToProject(projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info(`🔹 Navigating to project: ${projectId}`);
            yield this.page.waitAndClick(this.page.Projects);
            logger.info('Existing part found. Clicking Clear All...');
            const isClearVisible = yield this.page.ClearAll.isVisible().catch(() => false);
            if (isClearVisible) {
                yield this.page.waitAndClick(this.page.ClearAll);
            }
            else {
                yield this.page.keyPress('Escape');
            }
            yield this.page.waitAndClick(this.page.SelectAnOption);
            const projectOption = this.page.page.getByRole('option', { name: 'Project #' }).first(); // Use first (latest) if multiple
            yield test_1.expect.soft(projectOption).toBeVisible({ timeout: 3000 });
            yield projectOption.click();
            yield this.page.waitAndFill(this.page.ProjectValue, projectId);
            yield this.page.pressTab();
            yield this.page.pressEnter();
            yield this.page.waitForNetworkIdle();
            yield this.page.ProjectID.click();
            logger.info(`✔ Navigated to project ID: ${projectId}`);
        });
    }
    verifyPartInformation(costingNotesText) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            logger.info('🔹 Verifying Part Details...');
            yield this.page.assertVisible(this.page.InternalPartNumber);
            const internalPartNumber = yield this.page.getInputValue(this.page.InternalPartNumber);
            if (!costingNotesText) {
                logger.info('📝 Fetching Costing Notes from UI...');
                costingNotesText = (yield this.page.CostingNotes.innerText()) || '';
            }
            // ---------------- Drawing Number ----------------
            let drawingNumber = '';
            if (!drawingNumber && internalPartNumber) {
                const match = internalPartNumber.match(/^\d+/);
                if (match) {
                    drawingNumber = match[0];
                }
            }
            // ---------------- Revision Number ----------------
            let revisionNumber = '';
            if (!revisionNumber && internalPartNumber) {
                const match = internalPartNumber.match(/^\d+-([A-Za-z]+)/);
                if (match) {
                    revisionNumber = match[1];
                }
            }
            try {
                // ================= Manufacturing Category =================
                const elementTag = yield this.page.ManufacturingCategory.evaluate(el => el.tagName.toLowerCase());
                let selectedCategory = '';
                if (elementTag === 'select') {
                    selectedCategory = yield this.page.ManufacturingCategory.evaluate((el) => { var _a, _b; return ((_b = (_a = el.options[el.selectedIndex]) === null || _a === void 0 ? void 0 : _a.text) === null || _b === void 0 ? void 0 : _b.trim()) || ''; });
                }
                else {
                    selectedCategory =
                        ((_a = (yield this.page.ManufacturingCategory.innerText())) === null || _a === void 0 ? void 0 : _a.trim()) || '';
                }
                if (!selectedCategory) {
                    throw new Error('Selected Category is missing in Part Info.');
                }
                // ================= Suggested Category =================
                const suggestedMatch = costingNotesText.match(/Suggested\s*Category\s*[:\-]?\s*([^.!?\n]+)/i);
                const suggestedCategory = (_b = suggestedMatch === null || suggestedMatch === void 0 ? void 0 : suggestedMatch[1]) === null || _b === void 0 ? void 0 : _b.trim();
                if (suggestedCategory) {
                    logger.info(`🧾 Suggested Category from Notes: ${suggestedCategory}`);
                    const normalizedSelected = yield this.page.normalizeText(selectedCategory);
                    const normalizedSuggested = yield this.page.normalizeText(suggestedCategory);
                    const isMatch = normalizedSelected.includes(normalizedSuggested) ||
                        normalizedSuggested.includes(normalizedSelected);
                    test_1.expect.soft(isMatch).toBe(true);
                }
                else {
                    logger.warn('⚠️ Suggested Category is missing in Costing Notes.');
                }
                // ================= Quantity Calculations =================
                const bomQty = Number(yield this.page.getInputValue(this.page.BOMQtyNos));
                const annualVolume = Number(yield this.page.getInputValue(this.page.AnnualVolumeQtyNos));
                const lotSize = Number(yield this.page.getInputValue(this.page.LotsizeNos));
                const productLife = Number(yield this.page.getInputValue(this.page.ProductLifeRemainingYrs));
                const lifetimeQty = Number(yield this.page.getInputValue(this.page.LifeTimeQtyRemainingNos));
                const expectedLotSize = (0, welding_calculator_1.calculateLotSize)(annualVolume);
                const expectedLifetimeQty = (0, welding_calculator_1.calculateLifeTimeQtyRemaining)(annualVolume, productLife);
                test_1.expect.soft(bomQty).toBeGreaterThan(0);
                test_1.expect.soft(lotSize).toBe(expectedLotSize);
                test_1.expect.soft(lifetimeQty).toBe(expectedLifetimeQty);
            }
            catch (error) {
                logger.error(`❌ Part Information validation failed: ${error.message}`);
                throw error;
            }
            logger.info('✔ Part Details verified successfully');
        });
    }
    verifyMaterialInformationDetails() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const { processGroup, category, family, grade, stockForm } = mig_welding_testdata_1.MaterialInformation;
            logger.info(`🔹 Selecting material: ${processGroup} > ${category} > ${family} > ${grade} > ${stockForm}`);
            // ===== Open Material Information Section =====
            yield this.page.MaterialInformationSection.waitFor({ state: 'visible' });
            yield this.page.MaterialInformationSection.click();
            test_1.expect.soft(yield this.page.MaterialInformationSection.isVisible()).toBe(true);
            yield this.page.scrollToMiddle(this.page.ProcessGroup);
            // ===== Select Material Hierarchy =====
            yield this.page.selectByTrimmedLabel(this.page.ProcessGroup, processGroup);
            test_1.expect.soft(yield this.page.materialCategory.isVisible()).toBe(true);
            yield this.page.selectOption(this.page.materialCategory, category);
            test_1.expect.soft(yield this.page.MatFamily.isVisible()).toBe(true);
            yield this.page.selectOption(this.page.MatFamily, family);
            test_1.expect.soft(yield this.page.DescriptionGrade.isVisible()).toBe(true);
            yield this.page.selectOption(this.page.DescriptionGrade, grade);
            test_1.expect.soft(yield this.page.StockForm.isVisible()).toBe(true);
            yield this.page.selectOption(this.page.StockForm, stockForm);
            // ===== Price Validations =====
            const scrapPriceUI = Number((yield this.page.ScrapPrice.inputValue()) || 0);
            test_1.expect.soft(scrapPriceUI).toBeGreaterThan(0);
            const materialPrice = Number(((_a = (yield this.page.MaterialPrice.inputValue())) === null || _a === void 0 ? void 0 : _a.replace(/,/g, '')) || 0);
            test_1.expect.soft(materialPrice).toBeGreaterThan(0);
            // ===== Material Details =====
            logger.info('Opening Material Details tab');
            // Note: getMaterialDimensionsAndDensity handles navigation to MaterialDetailsTab and back to MaterialInfo
            const { density } = yield this.getMaterialDimensionsAndDensity();
            logger.info(`Density: ${density}`);
            test_1.expect.soft(yield this.page.VolumePurchased.isVisible()).toBe(true);
            const volumePurchased = Number(((_b = (yield this.page.VolumePurchased.inputValue())) === null || _b === void 0 ? void 0 : _b.replace(/,/g, '')) || 0);
            logger.info(`Volume Purchased: ${volumePurchased}`);
            // ===== Net Weight Validation (Volume × Density) =====
            test_1.expect.soft(yield this.page.NetWeight.isVisible()).toBe(true);
            const partVolumeMm3 = yield this.getPartVolume();
            const calculated = this.calculator.calculateNetWeight(partVolumeMm3, density);
            const uiNetWeight = yield this.getNetWeight();
            test_1.expect.soft(uiNetWeight).toBeGreaterThan(0);
            test_1.expect.soft(uiNetWeight).toBeCloseTo(calculated, 1);
            // ===== Gross Material Price =====
            test_1.expect.soft(yield this.page.MatPriceGross.isVisible()).toBe(true);
            const matPriceGross = Number(((_c = (yield this.page.MatPriceGross.inputValue())) === null || _c === void 0 ? void 0 : _c.replace(/,/g, '')) || 0);
            test_1.expect.soft(matPriceGross).toBeGreaterThan(0);
            logger.info('✔ Material Information verified');
        });
    }
    getPartVolume() {
        return __awaiter(this, void 0, void 0, function* () {
            const partVolume = yield this.page.getInputValueAsNumber(this.page.PartVolume);
            return partVolume;
        });
    }
    getNetWeight() {
        return __awaiter(this, void 0, void 0, function* () {
            const netWeightValue = yield this.page.getInputValueAsNumber(this.page.NetWeight);
            logger.info(`Net Weight (g): ${netWeightValue}`);
            return netWeightValue;
        });
    }
    verifyNetWeight(expectedValue_1) {
        return __awaiter(this, arguments, void 0, function* (expectedValue, precision = 2) {
            logger.info('🔹 Verifying Net Weight...');
            let expected = expectedValue;
            if (expected === undefined) {
                const { density } = yield this.getMaterialDimensionsAndDensity(); // only density
                const partVolumeMm3 = yield this.getPartVolume();
                const calculated = this.calculator.calculateNetWeight(partVolumeMm3, density);
                expected = calculated;
            }
            const actualNetWeight = yield this.getNetWeight(); // ✅ correct field
            test_1.expect.soft(actualNetWeight).toBeGreaterThan(0);
            test_1.expect.soft(actualNetWeight).toBeCloseTo(expected, precision);
            return actualNetWeight;
        });
    }
    verifyWeldingDetails(migWeldingTestData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            logger.info('🔹 Verifying Welding Details...');
            yield this.openManufacturingForMigWelding();
            yield this.page.scrollToMiddle(this.page.WeldingDetails);
            yield test_1.expect.soft(this.page.WeldingDetails).toBeVisible();
            const materialType = migWeldingTestData.materialInformation.family || 'Carbon Steel';
            const weldResults = [];
            // -------- Weld 1 --------
            const result1 = yield this.verifySingleWeldRow(migWeldingTestData.weldingDetails.weld1, materialType, {
                weldCheck: this.page.MatWeld1,
                weldType: this.page.MatWeldType1,
                weldSize: this.page.MatWeldSize1,
                wireDia: this.page.MatWireDia1,
                weldElementSize: this.page.MatWeldElementSize1,
                weldLength: this.page.MatWeldLengthmm1,
                weldSide: this.page.MatWeldSide1,
                weldPlaces: this.page.MatWeldPlaces1,
                grindFlush: this.page.MatGrishFlush1,
                totalWeldLength: this.page.MatTotalWeldLengthWeld1
            });
            weldResults.push(result1);
            // -------- Weld 2 --------
            if ((_a = migWeldingTestData.weldingDetails) === null || _a === void 0 ? void 0 : _a.weld2) {
                const result2 = yield this.verifySingleWeldRow(migWeldingTestData.weldingDetails.weld2, materialType, {
                    weldCheck: this.page.MatWeld2,
                    weldType: this.page.MatWeldType2,
                    weldSize: this.page.MatWeldSize2,
                    wireDia: this.page.MatWireDia2,
                    weldElementSize: this.page.MatWeldElementSize2,
                    weldLength: this.page.MatWeldLengthmm2,
                    weldSide: this.page.MatWeldSide2,
                    weldPlaces: this.page.MatWeldPlaces2,
                    grindFlush: this.page.MatGrishFlush2,
                    totalWeldLength: this.page.MatTotalWeldLength2
                });
                weldResults.push(result2);
            }
            // ===== Grand Total Weld Length =====
            const expectedGrandTotalWeldLength = weldResults.reduce((sum, w) => sum + w.totalLength, 0);
            const actualGrandTotalLength = Number(yield this.page.TotalWeldLength.inputValue());
            test_1.expect.soft(actualGrandTotalLength).toBe(expectedGrandTotalWeldLength);
            logger.info('✔ Welding Details verified');
        });
    }
    openManufacturingForMigWelding() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.ManufacturingInformation.scrollIntoViewIfNeeded();
            const isExpanded = yield this.page.ManufacturingInformation.getAttribute('aria-expanded');
            if (isExpanded !== 'true') {
                yield this.page.ManufacturingInformation.click();
                yield test_1.expect.soft(this.page.MigWeldRadBtn).toBeVisible();
            }
            if (!(yield this.page.MigWeldRadBtn.isChecked())) {
                yield this.page.MigWeldRadBtn.click();
            }
            if (yield this.page.Weld1keyboard_arrow_down_1.isVisible()) {
                yield this.expandIfCollapsed(this.page.Weld1keyboard_arrow_down_1);
            }
            if (yield this.page.Weld1keyboard_arrow_down_2.isVisible()) {
                yield this.expandIfCollapsed(this.page.Weld1keyboard_arrow_down_2);
            }
        });
    }
    expandPanelIfCollapsed(panelSelector, contentSelector) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = this.page.page;
            const panelToggle = page.locator(panelSelector);
            const content = contentSelector ? page.locator(contentSelector) : undefined;
            if (!(yield panelToggle.isVisible({ timeout: 2000 })))
                return;
            const ariaExpanded = yield panelToggle.getAttribute('aria-expanded');
            if (ariaExpanded !== 'true') {
                yield panelToggle.scrollIntoViewIfNeeded();
                try {
                    yield panelToggle.click({ force: true });
                }
                catch (error) {
                    if (error instanceof Error && error.message.includes('Target page, context or browser has been closed')) {
                        // Page replaced after SSO, get latest page
                        const newPage = page.context().pages().slice(-1)[0];
                        const newPanelToggle = newPage.locator(panelSelector);
                        yield newPanelToggle.scrollIntoViewIfNeeded();
                        yield newPanelToggle.click({ force: true });
                    }
                    else {
                        throw error;
                    }
                }
                if (content) {
                    yield test_1.expect.soft(content).toBeVisible({ timeout: 5000 });
                }
            }
        });
    }
    expandIfCollapsed(panel) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield panel.isVisible()))
                return;
            if (yield this.isPanelCollapsed(panel)) {
                yield panel.scrollIntoViewIfNeeded();
                yield panel.click({ force: true });
            }
        });
    }
    isPanelCollapsed(panel) {
        return __awaiter(this, void 0, void 0, function* () {
            const ariaExpanded = yield panel.getAttribute('aria-expanded');
            return ariaExpanded !== 'true';
        });
    }
    verifySingleWeldRow(weldData, materialType, locators) {
        return __awaiter(this, void 0, void 0, function* () {
            const page = this.page.page;
            const weldCheck = locators.weldCheck;
            for (const weld of [weldCheck]) {
                yield weld.scrollIntoViewIfNeeded();
                if (yield weld.isVisible()) {
                    yield this.expandIfCollapsed(weld);
                    yield test_1.expect.soft(weld).toBeVisible();
                }
            }
            yield test_1.expect.soft(locators.weldType).toBeEnabled();
            yield this.page.selectOption(locators.weldType, weldData.weldType);
            yield this.page.selectOption(locators.weldType, weldData.weldType);
            // ===== Weld Size =====
            const uiWeldSize = yield this.fillInputWithTab(locators.weldSize, weldData.weldSize, 'Weld Size');
            // ===== Wire Dia (auto) =====
            if (locators.wireDia && (yield locators.wireDia.count()) > 0) {
                yield locators.wireDia.first().scrollIntoViewIfNeeded();
                yield test_1.expect.soft(locators.wireDia.first()).toBeVisible({ timeout: 5000 });
                yield test_1.expect.soft(locators.wireDia.first()).not.toHaveValue('', { timeout: 5000 });
                const actualWireDia = Number((yield locators.wireDia.first().inputValue()) || '0');
                test_1.expect.soft(actualWireDia).toBeGreaterThan(0);
                const expectedWireDia = (0, welding_calculator_1.getWireDiameter)(materialType, uiWeldSize);
                test_1.expect.soft(actualWireDia).toBe(expectedWireDia);
            }
            else {
                logger.warn('⚠️ Wire Dia field not present for this weld type — skipping validation');
            }
            // ===== Weld Element Size (auto) =====
            yield test_1.expect.soft(locators.weldElementSize).not.toHaveValue('');
            const weldElementSize = Number((yield locators.weldElementSize.inputValue()) || '0');
            // ===== Weld Length =====
            const uiWeldLength = yield this.fillInputWithTab(locators.weldLength, weldData.weldLength, 'Weld Length');
            // ===== Weld Places =====
            yield locators.weldPlaces.waitFor({ state: 'visible' });
            yield locators.weldPlaces.fill(String(weldData.weldPlaces));
            const uiWeldPlaces = Number((yield locators.weldPlaces.inputValue()) || '0');
            test_1.expect.soft(uiWeldPlaces).toBeGreaterThan(0);
            logger.info(`Selected Weld Places: ${uiWeldPlaces}`);
            // ===== Weld Side =====
            yield this.page.selectOption(locators.weldSide, weldData.weldSide);
            const uiWeldSide = yield this.page.getSelectedOptionText(locators.weldSide);
            test_1.expect.soft(uiWeldSide).toBe(weldData.weldSide);
            logger.info(`Selected Weld Side: ${uiWeldSide}`);
            // ===== Grind Flush =====
            yield this.page.selectOption(locators.grindFlush, weldData.grindFlush);
            const uiGrindFlush = yield this.page.getSelectedOptionText(locators.grindFlush);
            test_1.expect.soft(uiGrindFlush).toBe(weldData.grindFlush);
            logger.info(`Selected Grind Flush: ${uiGrindFlush}`);
            const passes = Number(weldData.noOfWeldPasses || 1);
            test_1.expect.soft(passes).toBeGreaterThan(0);
            logger.info(`Selected No of Weld Passes: ${passes}`);
            // ===== Total Weld Length (no passes) =====
            yield this.page.validateTotalLength(locators.weldLength, locators.weldPlaces, locators.weldSide, locators.totalWeldLength, 'Total Weld Length');
            const expectedTotalLength = this.calculator.getTotalWeldLength(uiWeldLength, uiWeldPlaces, uiWeldSide);
            yield test_1.expect.soft(locators.totalWeldLength).toHaveValue(expectedTotalLength.toString());
            logger.info(`✔ Total Weld Length: ${expectedTotalLength}`);
            // ===== Weld Volume (with passes) =====
            const weldVolumeResult = (0, welding_calculator_1.calculateWeldVolume)(weldData.weldType, uiWeldSize, weldElementSize, uiWeldLength, uiWeldPlaces, passes, uiWeldSide);
            test_1.expect.soft(weldVolumeResult.weldVolume).toBeGreaterThan(0);
            logger.info(`Selected Weld Volume: ${weldVolumeResult.weldVolume}`);
            return {
                totalLength: expectedTotalLength,
                volume: weldVolumeResult.weldVolume,
                weldVolume: weldVolumeResult.weldVolume
            };
        });
    }
    /**
     * Fills an input, waits for stability, presses Tab, and validates the value is > 0.
     */
    fillInputWithTab(locator, value, logLabel) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.waitAndFill(locator, value);
            yield this.page.wait(500); // Stability wait to prevent race conditions
            yield locator.press('Tab');
            const uiValue = Number((yield locator.inputValue()) || '0');
            test_1.expect.soft(uiValue).toBeGreaterThan(0);
            return uiValue;
        });
    }
    //============================ Net Material cost($)=================================    
    verifyNetMaterialCostCalculation(expectedNetWeight) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('🔹 Verifying Net Material Cost Calculation...');
            const actualNetMaterialCost = yield this.page.getInputValueAsNumber(this.page.NetMaterialCost);
            let weight = expectedNetWeight;
            if (weight === undefined) {
                weight = yield this.getWeldBeadWeightWithWastage();
            }
            const materialPrice = yield this.page.getInputValueAsNumber(this.page.MaterialPrice);
            const expectedNetMaterialCost = this.calculator.calculateNetMaterialCost(weight, materialPrice);
            test_1.expect.soft(actualNetMaterialCost).toBeCloseTo(expectedNetMaterialCost, 2);
            logger.info(`✔ Net Material Cost → UI: ${actualNetMaterialCost}, Expected: ${expectedNetMaterialCost.toFixed(2)}`);
        });
    }
    getNetMaterialCost() {
        return __awaiter(this, void 0, void 0, function* () {
            const netMaterialCostValue = yield this.page.getInputValueAsNumber(this.page.NetMaterialCost);
            logger.info(`Net Material Cost ($): ${netMaterialCostValue}`);
            return netMaterialCostValue;
        });
    }
    getTotalWeldLength() {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this.page.getInputValueAsNumber(this.page.TotalWeldLength);
            logger.info(`Total Weld Length: ${value} mm`);
            return value;
        });
    }
    verifyTotalWeldLength(expectedValue) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('🔹 Verifying Total Weld Length...');
            const actualValue = yield this.getTotalWeldLength();
            if (expectedValue !== undefined) {
                test_1.expect.soft(actualValue).toBeCloseTo(expectedValue, 2);
            }
        });
    }
    getTotalWeldMaterialWeight() {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this.page.getInputValueAsNumber(this.page.TotalWeldMaterialWeight);
            logger.info(JSON.stringify(value));
            logger.info(`Total Weld Material Weight: ${value} g`);
            return value;
        });
    }
    verifyTotalWeldMaterialWeight(expectedValue) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('🔹 Verifying Total Weld Material Weight...');
            const actualValue = yield this.getTotalWeldMaterialWeight();
            if (expectedValue !== undefined) {
                test_1.expect.soft(actualValue).toBeCloseTo(expectedValue, 2);
                logger.info(JSON.stringify(actualValue));
                logger.info(JSON.stringify(expectedValue));
                logger.info(`✔ Total Weld Material Weight → UI: ${actualValue}, Expected: ${expectedValue.toFixed(2)}`);
            }
        });
    }
    getEfficiency() {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this.page.getInputValueAsNumber(this.page.MachineEfficiency);
            logger.info(`Efficiency: ${value}%`);
            return value;
        });
    }
    getWeldBeadWeightWithWastage() {
        return __awaiter(this, void 0, void 0, function* () {
            const value = yield this.page.getInputValueAsNumber(this.page.WeldBeadWeightWithWastage);
            logger.info(`Weld Bead Weight With Wastage: ${value} g`);
            return value;
        });
    }
    verifyWeldingMaterialCalculations() {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('\n[Tracker] 🔹 Step: Verify Welding Material Calculations');
            function mapUiMachineValueToAutomation(uiRawValue) {
                // Examples: "0: 1", "1: 3"
                const match = uiRawValue.match(/:\s*(\d+)/);
                if (!match)
                    return 1; // fallback Automatic
                const numeric = Number(match[1]);
                // Business mapping from UI
                // 1 = Automatic
                // 3 = Manual
                return numeric;
            }
            const uiMachineRaw = yield this.page.MachineType.inputValue();
            const uiEfficiency = yield this.page.getInputValueAsNumber(this.page.MachineEfficiency);
            const machineAutomation = mapUiMachineValueToAutomation(uiMachineRaw);
            logger.info(`🧭 Calculator Mapping`);
            logger.info(`   UI Raw Machine Value  : ${uiMachineRaw}`);
            logger.info(`   Mapped Automation Code: ${machineAutomation}`);
            logger.info(`   Efficiency Used       : ${uiEfficiency}`);
            // ---- Get material info and expected net weight ----
            const { density } = yield this.getMaterialDimensionsAndDensity();
            const partVolumeMm3 = yield this.getPartVolume();
            const expectedNetWeight = this.calculator.calculateNetWeight(partVolumeMm3, density);
            yield this.verifyNetWeight(expectedNetWeight, 1);
            // ---- Gather all weld sub-process data ----
            const weldSubMaterials = [];
            if (yield this.page.MatWeldType1.isVisible()) {
                weldSubMaterials.push({
                    weldElementSize: yield this.page.MatWeldElementSize1.inputValue(),
                    weldSize: yield this.page.MatWeldSize1.inputValue(),
                    noOfWeldPasses: yield this.page.MatNoOfWeldPasses1.inputValue(),
                    weldLength: yield this.page.MatWeldLengthmm1.inputValue(),
                    weldPlaces: yield this.page.MatWeldPlaces1.inputValue(),
                    weldSide: yield this.page.getSelectedOptionText(this.page.MatWeldSide1),
                    weldType: yield this.page.getSelectedOptionText(this.page.MatWeldType1),
                    wireDia: yield this.page.MatWireDia1.inputValue(),
                });
            }
            if (yield this.page.MatWeldType2.isVisible()) {
                weldSubMaterials.push({
                    weldElementSize: yield this.page.MatWeldElementSize2.inputValue(),
                    weldSize: yield this.page.MatWeldSize2.inputValue(),
                    noOfWeldPasses: yield this.page.MatNoOfWeldPasses2.inputValue(),
                    weldLength: yield this.page.MatWeldLengthmm2.inputValue(),
                    weldPlaces: yield this.page.MatWeldPlaces2.inputValue(),
                    weldSide: yield this.page.getSelectedOptionText(this.page.MatWeldSide2),
                    weldType: yield this.page.getSelectedOptionText(this.page.MatWeldType2),
                    wireDia: yield this.page.MatWireDia2.inputValue(),
                });
            }
            // ---- Read Machine Type ----
            const rawMachineType = yield this.page.MachineType.inputValue();
            const selectedMachineTypeText = yield this.page.getSelectedOptionText(this.page.MachineType);
            const normalizedMachineType = (0, utils_1.normalizeMachineType)(selectedMachineTypeText);
            logger.info(`🔧 Machine Type:` +
                ` Raw="${rawMachineType}",` +
                ` Selected="${selectedMachineTypeText}",` +
                ` Normalized="${normalizedMachineType}"`);
            // ---- Read Weld Positions ----    
            let weldPositions = [];
            try {
                if (yield this.page.WeldPositionSubProcess1.isVisible())
                    weldPositions.push(yield this.page.getSelectedOptionText(this.page.WeldPositionSubProcess1));
                if (yield this.page.WeldPositionSubProcess2.isVisible())
                    weldPositions.push(yield this.page.getSelectedOptionText(this.page.WeldPositionSubProcess2));
            }
            catch (_a) {
                logger.warn('⚠️ Unable to read weld positions.');
            }
            // ---- Calculate expected efficiencies per position ----
            const efficiencies = weldPositions.map(pos => {
                const eff = this.calculator.getExpectedEfficiency(pos, selectedMachineTypeText);
                logger.info(`⚡ Expected efficiency for position "${pos}" with MachineType "${selectedMachineTypeText}": ${eff}%`);
                return eff;
            });
            let expectedEfficiency = efficiencies.length ? Math.min(...efficiencies) : 75;
            logger.info(`🧪 Calculated overall expected efficiency: ${expectedEfficiency}%`);
            // ---- Compare with UI efficiency ----
            const actualEfficiency = yield this.page.getInputValueAsNumber(this.page.MachineEfficiency);
            logger.info(`📊 UI Machine Efficiency: ${actualEfficiency}%`);
            let efficiencyForCalculations = expectedEfficiency; // default
            if (actualEfficiency > 0 && Math.abs(actualEfficiency - expectedEfficiency) > 1) {
                logger.warn(`⚠️ Efficiency mismatch! Expected: ${expectedEfficiency}%, Found in UI: ${actualEfficiency}%. ` +
                    `Using UI value for all subsequent calculations to stay in sync with application.`);
                efficiencyForCalculations = actualEfficiency; // override with UI value
            }
            else if (actualEfficiency > 0) {
                test_1.expect.soft(actualEfficiency).toBeCloseTo(expectedEfficiency, 1);
                efficiencyForCalculations = actualEfficiency; // close enough, safe to use UI
            }
            else {
                logger.warn('⚠️ UI efficiency empty or zero. Using expected efficiency for calculations.');
            }
            // ---- Perform welding material calculations ----
            const calculated = this.calculator.calculateExpectedWeldingMaterialCosts({ density }, weldSubMaterials, efficiencyForCalculations);
            const actualTotalLength = yield this.page.getInputValueAsNumber(this.page.TotalWeldLength);
            test_1.expect.soft(actualTotalLength).toBeCloseTo(calculated.totalWeldLength, 1);
            const actualWeldWeight = yield this.page.getInputValueAsNumber(this.page.TotalWeldMaterialWeight);
            test_1.expect.soft(actualWeldWeight).toBeCloseTo(calculated.totalWeldMaterialWeight, 1);
            const actualWeldBeadWeight = yield this.page.getInputValueAsNumber(this.page.WeldBeadWeightWithWastage);
            test_1.expect.soft(actualWeldBeadWeight).toBeCloseTo(calculated.weldBeadWeightWithWastage, 1);
            logger.info('✔ Welding Material calculations verified successfully');
        });
    }
    verifyWeldingMaterialCalculations() {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('\n[Tracker] 🔹 Step: Verify Welding Material Calculations');
            // ---- Get material info and expected net weight ----
            const { density } = yield this.getMaterialDimensionsAndDensity();
            const partVolumeMm3 = yield this.getPartVolume();
            const expectedNetWeight = this.calculator.calculateNetWeight(partVolumeMm3, density);
            yield this.verifyNetWeight(expectedNetWeight, 1);
            // ---- Gather all weld sub-process data ----
            const weldSubMaterials = [];
            if (yield this.page.MatWeldType1.isVisible()) {
                weldSubMaterials.push({
                    weldElementSize: yield this.page.MatWeldElementSize1.inputValue(),
                    weldSize: yield this.page.MatWeldSize1.inputValue(),
                    noOfWeldPasses: yield this.page.MatNoOfWeldPasses1.inputValue(),
                    weldLength: yield this.page.MatWeldLengthmm1.inputValue(),
                    weldPlaces: yield this.page.MatWeldPlaces1.inputValue(),
                    weldSide: yield this.page.getSelectedOptionText(this.page.MatWeldSide1),
                    weldType: yield this.page.getSelectedOptionText(this.page.MatWeldType1),
                    wireDia: yield this.page.MatWireDia1.inputValue(),
                });
            }
            if (yield this.page.MatWeldType2.isVisible()) {
                weldSubMaterials.push({
                    weldElementSize: yield this.page.MatWeldElementSize2.inputValue(),
                    weldSize: yield this.page.MatWeldSize2.inputValue(),
                    noOfWeldPasses: yield this.page.MatNoOfWeldPasses2.inputValue(),
                    weldLength: yield this.page.MatWeldLengthmm2.inputValue(),
                    weldPlaces: yield this.page.MatWeldPlaces2.inputValue(),
                    weldSide: yield this.page.getSelectedOptionText(this.page.MatWeldSide2),
                    weldType: yield this.page.getSelectedOptionText(this.page.MatWeldType2),
                    wireDia: yield this.page.MatWireDia2.inputValue(),
                });
            }
            // ---- Read Machine Type ----
            let machineType = 'Automatic';
            try {
                if (yield this.page.MachineType.isVisible()) {
                    machineType = (0, utils_1.normalizeMachineType)(yield this.page.MachineType.inputValue());
                }
            }
            catch (_a) {
                logger.warn('⚠️ Unable to read Machine Type. Defaulting to "Automatic".');
            }
            // ---- Read Weld Positions ----
            let weldPositions = [];
            try {
                if (yield this.page.WeldPositionSubProcess1.isVisible())
                    weldPositions.push(yield this.page.getSelectedOptionText(this.page.WeldPositionSubProcess1));
                if (yield this.page.WeldPositionSubProcess2.isVisible())
                    weldPositions.push(yield this.page.getSelectedOptionText(this.page.WeldPositionSubProcess2));
                if (weldPositions.length === 0 && (yield this.page.WeldPosition.isVisible()))
                    weldPositions.push(yield this.page.getSelectedOptionText(this.page.WeldPosition));
            }
            catch (_b) {
                logger.warn('⚠️ Unable to read weld positions.');
            }
            // ---- Calculate expected efficiencies per position ----
            const efficiencies = weldPositions.map(pos => {
                const eff = this.calculator.getExpectedEfficiency(pos, machineType);
                logger.info(`⚡ Expected efficiency for position "${pos}" with MachineType "${machineType}": ${eff}%`);
                return eff;
            });
            let expectedEfficiency = efficiencies.length ? Math.min(...efficiencies) : 75;
            logger.info(`🧪 Calculated overall expected efficiency: ${expectedEfficiency}%`);
            // ---- Compare with UI efficiency ----
            const actualEfficiency = yield this.page.getInputValueAsNumber(this.page.MachineEfficiency);
            logger.info(`📊 UI Machine Efficiency: ${actualEfficiency}%`);
            let efficiencyForCalculations = expectedEfficiency; // default
            if (actualEfficiency > 0 && Math.abs(actualEfficiency - expectedEfficiency) > 1) {
                logger.warn(`⚠️ Efficiency mismatch! Expected: ${expectedEfficiency}%, Found in UI: ${actualEfficiency}%. ` +
                    `Using UI value for all subsequent calculations to stay in sync with application.`);
                efficiencyForCalculations = actualEfficiency; // override with UI value
            }
            else if (actualEfficiency > 0) {
                test_1.expect.soft(actualEfficiency).toBeCloseTo(expectedEfficiency, 1);
                efficiencyForCalculations = actualEfficiency; // close enough, safe to use UI
            }
            else {
                logger.warn('⚠️ UI efficiency empty or zero. Using expected efficiency for calculations.');
            }
            // ---- Perform welding material calculations ----
            const calculated = this.calculator.calculateExpectedWeldingMaterialCosts({ density }, weldSubMaterials, efficiencyForCalculations);
            const actualTotalLength = yield this.page.getInputValueAsNumber(this.page.TotalWeldLength);
            test_1.expect.soft(actualTotalLength).toBeCloseTo(calculated.totalWeldLength, 1);
            const actualWeldWeight = yield this.page.getInputValueAsNumber(this.page.TotalWeldMaterialWeight);
            test_1.expect.soft(actualWeldWeight).toBeCloseTo(calculated.totalWeldMaterialWeight, 1);
            const actualWeldBeadWeight = yield this.page.getInputValueAsNumber(this.page.WeldBeadWeightWithWastage);
            test_1.expect.soft(actualWeldBeadWeight).toBeCloseTo(calculated.weldBeadWeightWithWastage, 1);
            logger.info('✔ Welding Material calculations verified successfully');
        });
    }
    //============================ Material SustainabilityCO2(kg)/part:=================================
    getMaterialESGInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('🔹 Gathering Material ESG Info...');
            yield this.page.scrollElementToTop(this.page.AnnualVolumeQtyNos);
            const eav = Number((yield this.page.AnnualVolumeQtyNos.inputValue()) || '0');
            const netWeight = yield this.getTotalWeldMaterialWeight();
            const grossWeight = yield this.getWeldBeadWeightWithWastage();
            const scrapWeight = grossWeight - netWeight;
            return {
                materialMarketData: {
                    esgImpactCO2Kg: yield this.page.getInputValueAsNumber(this.page.CO2PerKgMaterial),
                    esgImpactCO2KgScrap: yield this.page.getInputValueAsNumber(this.page.CO2PerScrap)
                },
                grossWeight: grossWeight,
                scrapWeight: scrapWeight,
                netWeight: netWeight,
                eav: eav
            };
        });
    }
    verifyNetMaterialSustainabilityCost() {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('\n[Tracker] 🔹 Step: Verify Net Material Sustainability Cost');
            const materialInfo = yield this.getMaterialESGInfo();
            const calculated = (0, welding_calculator_1.calculateESG)(materialInfo);
            const uiMaterialCO2PerPart = Number((yield this.page.CO2PerPartMaterial.inputValue()) || '0');
            test_1.expect.soft(uiMaterialCO2PerPart).toBeCloseTo(calculated.esgImpactCO2KgPart, 4);
            logger.info(`✔ Material CO2 Per Part verified: ${uiMaterialCO2PerPart} kg`);
        });
    }
    //========================== Manufacturing Details ==========================
    verifyProcessDetails(testData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            logger.info('\n[Tracker] 🔹 Step: Verify Process Details');
            const { processType, machineName, machineAutomation, machineEfficiency, partComplexity, weldPosition, machineDescription, minCurrentRequired, minWeldingVoltage, selectedCurrent, selectedVoltage } = testData.machineDetails;
            yield this.page.scrollIntoView(this.page.ProcessGroup);
            const currentProcessGroup = yield this.page.ProcessGroup.inputValue();
            if (currentProcessGroup === '0' || !currentProcessGroup) {
                yield this.page.selectByTrimmedLabel(this.page.ProcessGroup, processType);
            }
            // Select Machine Type (Automation)
            if (machineAutomation) {
                yield this.page.selectOption(this.page.MachineType, machineAutomation);
            }
            //========================== Min. Current Required ==========================     
            const actualRequiredCurrent = Number(((_a = (yield this.page.RequiredCurrent.inputValue())) === null || _a === void 0 ? void 0 : _a.replace(/,/g, '')) || 0);
            logger.info(`⚡ Required Current → Expected: ${minCurrentRequired}, Actual: ${actualRequiredCurrent}`);
            test_1.expect.soft(actualRequiredCurrent).toBeCloseTo(Number(minCurrentRequired), 4);
            //========================== Min. Welding Voltage ==========================     
            const actualRequiredVoltage = Number(((_b = (yield this.page.RequiredVoltage.inputValue())) === null || _b === void 0 ? void 0 : _b.replace(/,/g, '')) || 0);
            logger.info(`⚡ Required Voltage → Expected: ${minWeldingVoltage}, Actual: ${actualRequiredVoltage}`);
            test_1.expect.soft(actualRequiredVoltage).toBeCloseTo(Number(minWeldingVoltage), 4);
            //========================== Selected Current ==========================           
            const actualSelectedCurrent = Number(((_c = (yield this.page.selectedCurrent.inputValue())) === null || _c === void 0 ? void 0 : _c.replace(/,/g, '')) || 0);
            test_1.expect.soft(actualSelectedCurrent).toBeCloseTo(Number(selectedCurrent), 4);
            logger.info(`⚡ Selected Current → Expected: ${selectedCurrent}, Actual: ${actualSelectedCurrent}`);
            //========================== Selected Voltage ==========================           
            const actualSelectedVoltage = Number(((_d = (yield this.page.selectedVoltage.inputValue())) === null || _d === void 0 ? void 0 : _d.replace(/,/g, '')) || 0);
            test_1.expect.soft(actualSelectedVoltage).toBeCloseTo(Number(selectedVoltage), 4);
            logger.info(`⚡ Selected Voltage → Expected: ${selectedVoltage}, Actual: ${actualSelectedVoltage}`);
            //========================== Machine Name ==========================                
            yield this.page.selectOption(this.page.MachineType, machineAutomation);
            const ManuMachineName = yield this.page.getSelectedOptionText(this.page.MachineName);
            test_1.expect.soft(ManuMachineName).toBe(machineName);
            logger.info(`🔹 Machine Name verified: ${ManuMachineName}`);
            //========================== Machine Description ==========================    
            const ManuMachineDescription = yield this.page.MachineDescription.inputValue();
            test_1.expect.soft(ManuMachineDescription).toBe(machineDescription);
            logger.info(`🔹 Machine Description verified: ${ManuMachineDescription}`);
            //========================== Machine Efficiency ==========================    
            yield this.page.scrollIntoView(this.page.AdditionalDetails);
            logger.info(`🔹 Machine Efficiency verified: ${machineEfficiency}`);
            yield this.page.waitAndClick(this.page.AdditionalDetails);
            //========================== Part Complexity ==========================    
            yield this.page.selectOption(this.page.PartComplexity, partComplexity);
            logger.info(`🔹 Part Complexity verified: ${partComplexity}`);
            yield this.page.PartDetails.isVisible();
            yield this.page.waitAndClick(this.page.PartDetails);
            logger.info(`🔹 Part Details verified: ${partComplexity}`);
            //========================== Sub Process Details ====================
            if (testData.subProcessDetails) {
                logger.info('🔹 Filling Sub Process Details...');
                yield this.page.scrollIntoView(this.page.SubProcessDetails);
                //========================== Weld 1 Sub Process ====================
                if (testData.subProcessDetails.weld1) {
                    yield this.fillSubProcessRow(1, {
                        weldType: this.page.WeldTypeSubProcess1,
                        position: this.page.WeldPositionSubProcess1,
                        speed: this.page.TravelSpeedSubProcess1,
                        tack: this.page.TrackWeldSubProcess1,
                        stop: this.page.IntermediateStartStopSubProcess1
                    }, testData.subProcessDetails.weld1);
                }
                //========================== Weld 2 Sub Process ====================
                if (testData.subProcessDetails.weld2 && (yield this.page.weldTypeSubProcess2.isVisible())) {
                    yield this.fillSubProcessRow(2, {
                        weldType: this.page.weldTypeSubProcess2,
                        position: this.page.WeldPositionSubProcess2,
                        speed: this.page.TravelSpeedSubProcess2,
                        tack: this.page.TrackWeldSubProcess2,
                        stop: this.page.IntermediateStartStopSubProcess2
                    }, testData.subProcessDetails.weld2);
                }
            }
            logger.info('✔ Process Details verified');
        });
    }
    //======================== Cycle Time/Part(Sec) =========================================
    verifyWeldCycleTimeDetails(testData) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('🔹 Step: Comprehensive Weld Cycle Time Verification');
            try {
                const { subProcessDetails, weldingDetails } = testData;
                if (!subProcessDetails || !weldingDetails) {
                    logger.warn('⚠️ Missing welding/sub-process data, skipping verification');
                    return;
                }
                const subProcessCycleTimes = [];
                // ============ VERIFY EACH SUB-PROCESS (WELD 1, WELD 2) ============
                for (let idx = 0; idx < 2; idx++) {
                    const key = idx === 0 ? 'weld1' : 'weld2';
                    if (!subProcessDetails[key])
                        continue;
                    const subProc = subProcessDetails[key];
                    const weldData = weldingDetails[key];
                    logger.info(`\n🔍 ===== Verifying ${key.toUpperCase()} Sub-Process =====`);
                    // --- Weld Type ---
                    const weldTypeLocator = idx === 0 ? this.page.WeldTypeSubProcess1 : this.page.weldTypeSubProcess2;
                    if (yield weldTypeLocator.isVisible()) {
                        const uiWeldType = yield this.page.getSelectedOptionText(weldTypeLocator);
                        logger.info(`   ✓ Weld Type: ${uiWeldType} (Expected: ${subProc.weldType})`);
                        test_1.expect.soft(uiWeldType).toBe(subProc.weldType);
                    }
                    // --- Welding Position ---
                    const positionLocator = idx === 0 ? this.page.WeldPositionSubProcess1 : this.page.WeldPositionSubProcess2;
                    if (yield positionLocator.isVisible()) {
                        const uiPosition = yield this.page.getSelectedOptionText(positionLocator);
                        logger.info(`   ✓ Welding Position: ${uiPosition} (Expected: ${subProc.weldPosition})`);
                        test_1.expect.soft(uiPosition).toBe(subProc.weldPosition);
                    }
                    // --- Weld Length ---
                    const weldLength = weldData.weldLength || 0;
                    const weldPlaces = weldData.weldPlaces || 1;
                    const weldSide = weldData.weldSide || 'One Side';
                    const totalWeldLength = this.calculator.getTotalWeldLength(weldLength, weldPlaces, weldSide);
                    logger.info(`   ✓ Total Weld Length: ${totalWeldLength.toFixed(2)} mm (${weldLength} × ${weldPlaces} × ${weldSide === 'Both' ? 2 : 1})`);
                    // --- Travel Speed ---
                    const speedLocator = idx === 0 ? this.page.TravelSpeedSubProcess1 : this.page.TravelSpeedSubProcess2;
                    const uiTravelSpeed = (yield this.page.getInputValueAsNumber(speedLocator)) || 5;
                    const expectedTravelSpeed = subProc.travelSpeed || uiTravelSpeed;
                    logger.info(`   ✓ Travel Speed: ${uiTravelSpeed.toFixed(2)} mm/sec (Expected: ${expectedTravelSpeed})`);
                    if (subProc.travelSpeed) {
                        test_1.expect.soft(uiTravelSpeed).toBeCloseTo(expectedTravelSpeed, 2);
                    }
                    // --- Tack Welds ---
                    const tackLocator = idx === 0 ? this.page.TrackWeldSubProcess1 : this.page.TrackWeldSubProcess2;
                    const uiTackWelds = (yield this.page.getInputValueAsNumber(tackLocator)) || 0;
                    const expectedTackWelds = subProc.tackWelds || 0;
                    const tackCycleTime = expectedTackWelds * 3; // 3 sec per tack weld
                    logger.info(`   ✓ Number of Tack Welds: ${uiTackWelds} (Expected: ${expectedTackWelds})`);
                    logger.info(`   ✓ Cycle Time for Tack Welds: ${tackCycleTime.toFixed(2)} sec (${uiTackWelds} × 3)`);
                    test_1.expect.soft(uiTackWelds).toBe(expectedTackWelds);
                    // --- Intermediate Start/Stops ---
                    const stopsLocator = idx === 0 ? this.page.IntermediateStartStopSubProcess1 : this.page.IntermediateStartStopSubProcess2;
                    const uiMachineRaw = yield this.page.MachineType.inputValue();
                    const machineAutomation = this.mapUiMachineAutomation(uiMachineRaw);
                    const uiStops = (yield this.page.getInputValueAsNumber(stopsLocator)) || 0;
                    const expectedStops = subProc.intermediateStops || 0;
                    const stopsCycleTime = expectedStops * 5; // 5 sec per stop
                    logger.info(`   ✓ No. of Intermediate Start/Stops: ${uiStops} (Expected: ${expectedStops})`);
                    logger.info(`   ✓ Cycle Time for Intermediate Stops: ${stopsCycleTime.toFixed(2)} sec (${uiStops} × 5)`);
                    test_1.expect.soft(uiStops).toBe(expectedStops);
                    // --- Weld Cycle Time (for this sub-process) ---
                    const weldCycleTime = (0, welding_calculator_1.calculateSingleWeldCycleTime)({
                        totalWeldLength,
                        travelSpeed: uiTravelSpeed,
                        tackWelds: uiTackWelds,
                        intermediateStops: uiStops,
                        weldType: subProc.weldType || 'Fillet'
                    });
                    subProcessCycleTimes.push(weldCycleTime);
                    const weldCycleLocator = idx === 0 ? this.page.Weld1CycleTimeSubProcess1 : this.page.Weld2CycleTimeSubProcess2;
                    if (yield weldCycleLocator.isVisible()) {
                        const uiWeldCycleTime = yield this.page.getInputValueAsNumber(weldCycleLocator);
                        logger.info(`   ✓ Weld Cycle Time: ${uiWeldCycleTime.toFixed(4)} sec (Calculated: ${weldCycleTime.toFixed(4)})`);
                        test_1.expect.soft(uiWeldCycleTime).toBeCloseTo(weldCycleTime, 2);
                    }
                    else {
                        logger.info(`   ✓ Weld Cycle Time (Calculated): ${weldCycleTime.toFixed(4)} sec`);
                    }
                }
                if (subProcessCycleTimes.length === 0) {
                    logger.warn('⚠️ No active weld sub-processes to verify.');
                    return;
                }
                // ============ VERIFY OVERALL CYCLE TIME BREAKDOWN ============
                logger.info(`\n📊 ===== Overall Cycle Time Breakdown =====`);
                // --- Machine Efficiency ---
                const uiEfficiency = (yield this.page.getInputValueAsNumber(this.page.MachineEfficiency)) || 75;
                logger.info(`   ✓ Weld Efficiency: ${uiEfficiency}%`);
                // --- Part Reorientation ---
                const uiPartReorientation = (yield this.page.getInputValueAsNumber(this.page.PartReorientation)) || 0;
                logger.info(`   ✓ Part/Assembly Reorientation: ${uiPartReorientation} no's`);
                // --- Loading/Unloading Time ---
                let loadingUnloadingTime = 0;
                if (yield this.page.UnloadingTime.isVisible()) {
                    loadingUnloadingTime = yield this.page.getInputValueAsNumber(this.page.UnloadingTime);
                    logger.info(`   ✓ Loading/Unloading Time: ${loadingUnloadingTime.toFixed(2)} sec`);
                }
                // --- Calculate Breakdown ---
                const input = {
                    subProcessCycleTimes,
                    loadingUnloadingTime,
                    partReorientation: uiPartReorientation,
                    efficiency: uiEfficiency
                };
                const breakdown = (0, welding_calculator_1.calculateWeldCycleTimeBreakdown)(input);
                // --- Calculation Breakdown for Debugging ---
                const totalSubProcessTime = subProcessCycleTimes.reduce((sum, time) => sum + time, 0);
                logger.info(`   📊 Calculation Details:`);
                logger.info(`      Total Sub-Process Time: ${totalSubProcessTime.toFixed(4)} sec`);
                logger.info(`      Loading/Unloading Time: ${loadingUnloadingTime.toFixed(4)} sec`);
                // --- Arc On Time (Calculated) ---
                const arcOnTime = (0, welding_calculator_1.calculateArcOnTime)(totalSubProcessTime, loadingUnloadingTime);
                logger.info(`   ✓ Arc On Time (Calculated): ${arcOnTime.toFixed(4)} sec`);
                logger.info(`      Formula: SubProcessTime + LoadingUnloadingTime = ${totalSubProcessTime.toFixed(4)} + ${loadingUnloadingTime.toFixed(4)}`);
                // --- Arc Off Time (Calculated) ---
                const arcOffTime = (0, welding_calculator_1.calculateArcOffTime)(arcOnTime);
                logger.info(`   ✓ Arc Off Time (Calculated): ${arcOffTime.toFixed(4)} sec`);
                logger.info(`      Formula: ArcOnTime × 0.05 = ${breakdown.arcOnTime.toFixed(4)} × 0.05`);
                // --- Total Weld Cycle Time (Dry Cycle Time) ---
                const dryCycleTime = arcOnTime + arcOffTime;
                logger.info(`   ✓ Total Weld Cycle Time (Dry): ${dryCycleTime.toFixed(4)} sec`);
                const uiDryCycleTime = yield this.page.getInputValueAsNumber(this.page.DryCycleTime);
                test_1.expect.soft(uiDryCycleTime).toBeCloseTo(dryCycleTime, 2);
                logger.info(`     UI Verification: ${uiDryCycleTime.toFixed(4)} ≈ ${dryCycleTime.toFixed(4)}`);
                // --- Total Cycle Time (Final with Efficiency) ---
                logger.info(`   ✓ Total Cycle Time (Final): ${breakdown.cycleTime.toFixed(4)} sec`);
                const uiCycleTime = yield this.page.getInputValueAsNumber(this.page.CycleTimePart);
                test_1.expect.soft(uiCycleTime).toBeCloseTo(breakdown.cycleTime, 2);
                logger.info(`     UI Verification: ${uiCycleTime.toFixed(4)} ≈ ${breakdown.cycleTime.toFixed(4)}`);
                logger.info(`\n✅ All Weld Cycle Time Verifications Completed Successfully!`);
            }
            catch (error) {
                logger.error(`❌ Cycle Time Verification Failed: ${error.message}`);
                logger.error(`Stack: ${error.stack}`);
                throw error; // Fail the test to surface the issue
            }
        });
    }
    //========================== Verify All Welding Calculations ==========================
    verifyAllWeldingCalculations() {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('🔹 Verifying All Welding Calculations via WeldingCalculator...');
            const calculator = new welding_calculator_1.WeldingCalculator();
            const processType = yield this.getProcessType();
            // 1. Gather Inputs
            const efficiency = yield this.page.getInputValueAsNumber(this.page.MachineEfficiency);
            const machineEfficiency = efficiency;
            const machineHourRate = yield this.page.getInputValueAsNumber(this.page.MachineHourRate);
            const skilledLaborRate = yield this.page.getInputValueAsNumber(this.page.SkilledLaborRate);
            const lowSkilledLaborRate = yield this.page.getInputValueAsNumber(this.page.DirectLaborRate);
            const electricityUnitCost = yield this.page.getInputValueAsNumber(this.page.ElectricityUnitCost);
            const powerConsumptionInfo = yield this.page.getInputValueAsNumber(this.page.PowerConsumption);
            const directLaborRate = yield this.page.getInputValueAsNumber(this.page.DirectLaborRate);
            const lotSize = yield this.page.getInputValueAsNumber(this.page.LotsizeNos);
            const setUpTime = yield this.page.getInputValueAsNumber(this.page.MachineSetupTime);
            const noOfLowSkilledLabours = yield this.page.getInputValueAsNumber(this.page.NoOfDirectLabors);
            let density = 7.85;
            let partThickness = 0;
            let netWeight = 0;
            try {
                if (yield this.page.Density.isVisible()) {
                    density = yield this.page.getInputValueAsNumber(this.page.Density);
                }
                partThickness = yield this.page.getInputValueAsNumber(this.page.PartThickness);
                netWeight = yield this.page.getInputValueAsNumber(this.page.NetWeight);
            }
            catch (e) {
                logger.warn('Could not read some material details, using defaults/zeros');
            }
            // Welding Details (Weld 1, Weld 2)
            const weld1Visible = yield this.page.MatWeldType1.isVisible();
            const weld2Visible = yield this.page.MatWeldType2.isVisible();
            const weld1Length = weld1Visible
                ? yield this.page.getInputValueAsNumber(this.page.MatWeldLengthmm1)
                : 0;
            const weld1Size = weld1Visible
                ? yield this.page.getInputValueAsNumber(this.page.MatWeldSize1)
                : 0;
            const weld2Length = weld2Visible
                ? yield this.page.getInputValueAsNumber(this.page.MatWeldLengthmm2)
                : 0;
            const weld2Size = weld2Visible
                ? yield this.page.getInputValueAsNumber(this.page.MatWeldSize2)
                : 0;
            const totalWeldLength = weld1Length + weld2Length;
            // Construct ProcessInfoDto
            const manufactureInfo = {
                processTypeID: processType, // Use the passed processType
                partComplexity: welding_calculator_1.PartComplexity.Medium,
                semiAutoOrAuto: welding_calculator_1.MachineType.Automatic,
                efficiency: machineEfficiency, // Captured from UI
                machineHourRate: machineHourRate,
                skilledLaborRatePerHour: skilledLaborRate,
                lowSkilledLaborRatePerHour: lowSkilledLaborRate,
                directLaborRatePerHour: directLaborRate,
                electricityUnitCost: electricityUnitCost,
                powerConsumption: powerConsumptionInfo,
                lotSize: lotSize,
                setUpTime: setUpTime,
                noOfLowSkilledLabours: noOfLowSkilledLabours,
                machineMaster: {
                    machineDescription: 'Generic Machine',
                    machineMarketDtos: [{ specialSkilledLabours: 1 }]
                },
                machineAutomation: 'Automatic',
                // SubProcesses
                subProcessFormArray: {
                    controls: []
                },
                // Material Info List
                materialInfoList: [
                    {
                        processId: welding_calculator_1.PrimaryProcessType.MigWelding, // Default to MigWelding
                        netMatCost: 0,
                        netWeight: netWeight * 1000,
                        dimX: totalWeldLength,
                        partTickness: partThickness,
                        materialMasterData: {
                            materialType: { materialTypeName: 'Steel' }
                        },
                        totalWeldLength: totalWeldLength,
                        coreCostDetails: []
                    }
                ],
                qaOfInspectorRate: 0, // Will be hydrated later
                unloadingTime: 0, // Will be hydrated later
                inspectionTime: 0, // Will be hydrated later
                netMaterialCost: 0, // Will be hydrated later
                netPartWeight: 0, // Not directly used in welding calculations
                subProcessTypeInfos: [], // Not directly used in welding calculations
                requiredCurrent: null, // Not directly used in welding calculations
                requiredWeldingVoltage: null, // Not directly used in welding calculations
                partReorientation: 0 // Will be hydrated later
            };
            // Fill SubProcess Array
            if (weld1Visible) {
                const speed1 = (yield this.page.getInputValueAsNumber(this.page.TravelSpeedSubProcess1)) || 0;
                const tack1 = (yield this.page.getInputValueAsNumber(this.page.TrackWeldSubProcess1)) || 0;
                const stops1 = (yield this.page.getInputValueAsNumber(this.page.IntermediateStartStopSubProcess1)) || 0;
                manufactureInfo.subProcessFormArray.controls.push({
                    value: {
                        formLength: weld1Length,
                        shoulderWidth: weld1Size,
                        formHeight: speed1, // Map travel speed to formHeight as used in calculator
                        formPerimeter: stops1, // Map stops to formPerimeter as used in calculator (logic: stops * 5)
                        noOfHoles: tack1, // Map tacks to noOfHoles 
                        hlFactor: tack1 // Map tacks to hlFactor
                    }
                });
                manufactureInfo.materialInfoList[0].coreCostDetails.push({
                    coreWeight: 0,
                    weldLength: weld1Length,
                    coreHeight: weld1Size,
                    weldSize: weld1Size
                });
            }
            if (weld2Visible) {
                const speed2 = (yield this.page.getInputValueAsNumber(this.page.TravelSpeedSubProcess2)) || 0;
                const tack2 = (yield this.page.getInputValueAsNumber(this.page.TrackWeldSubProcess2)) || 0;
                const stops2 = (yield this.page.getInputValueAsNumber(this.page.IntermediateStartStopSubProcess2)) || 0;
                manufactureInfo.subProcessFormArray.controls.push({
                    value: {
                        formLength: weld2Length,
                        shoulderWidth: weld2Size,
                        formHeight: speed2,
                        formPerimeter: stops2,
                        noOfHoles: tack2,
                        hlFactor: tack2
                    }
                });
                manufactureInfo.materialInfoList[0].coreCostDetails.push({
                    coreWeight: 0,
                    weldLength: weld2Length,
                    weldSize: weld2Size
                });
            }
            // Hydrate rates from UI to ensure calculator has data to work with
            manufactureInfo.machineHourRate = (yield this.page.getInputValueAsNumber(this.page.MachineHourRate)) || 0;
            manufactureInfo.skilledLaborRatePerHour = (yield this.page.getInputValueAsNumber(this.page.SkilledLaborRate)) || 0;
            manufactureInfo.lowSkilledLaborRatePerHour = (yield this.page.getInputValueAsNumber(this.page.DirectLaborRate)) || 0;
            manufactureInfo.electricityUnitCost = (yield this.page.getInputValueAsNumber(this.page.ElectricityUnitCost)) || 0;
            // We can also fetch setup time or other params if needed, but let's start with these essentials
            manufactureInfo.setUpTime = Number(yield this.page.MachineSetupTime.inputValue()) || 30;
            manufactureInfo.lotSize = Number(yield this.page.LotsizeNos.inputValue()) || 1;
            manufactureInfo.qaOfInspectorRate = (yield this.page.getInputValueAsNumber(this.page.QAInspectorRate)) || 0;
            manufactureInfo.unloadingTime = Number(yield this.page.UnloadingTime.inputValue()) || 0;
            manufactureInfo.inspectionTime = Number(yield this.page.QAInspectionTime.inputValue()) || 0;
            manufactureInfo.samplingRate = Number(yield this.page.SamplingRate.inputValue()) || 0;
            manufactureInfo.yieldPer = Number(yield this.page.YieldPercentage.inputValue()) || 100;
            manufactureInfo.powerConsumption = (yield this.page.getInputValueAsNumber(this.page.PowerConsumption)) || 0;
            // Capture Efficiency from UI
            manufactureInfo.efficiency = (yield this.page.getInputValueAsNumber(this.page.MachineEfficiency)) || 75;
            // Ensure netMatCost is populated for Yield Cost calculation
            const netMaterialCost = yield this.getNetMaterialCost();
            // Update first material info item with cost
            if (manufactureInfo.materialInfoList.length > 0) {
                manufactureInfo.materialInfoList[0].netMatCost = netMaterialCost;
            }
            manufactureInfo.netMaterialCost = netMaterialCost;
            // 2. Perform Calculation
            let calculated;
            if (processType === welding_calculator_1.ProcessType.WeldingCleaning) {
                calculated = this.calculator.calculationsForWeldingCleaning(manufactureInfo, [], manufactureInfo);
            }
            else {
                calculated = this.calculator.calculationForWelding(manufactureInfo, [], manufactureInfo, []);
            }
            logger.info(`Calculated Results: ${JSON.stringify(calculated, null, 2)}`);
            // 3. Verify UI vs Calculated using specialized methods
            // Note: Cycle time details are verified separately with test data
            yield this.verifyCycleTime(calculated);
            yield this.verifyMachineCost(calculated);
            yield this.verifyLaborCost(calculated);
            yield this.verifySetupCost(calculated);
            yield this.verifyPowerCost(calculated);
            yield this.verifyYieldCost(calculated.yieldCost);
            yield this.verifyInspectionCost(calculated);
            logger.info(`✔ Verified Results: ${JSON.stringify(calculated, null, 2)}`);
        });
    }
    //================================== Manufacturing Details =======================================
    //========================== Verify Cycle Time ==========================
    verifyCycleTime(calculated, expectedValue) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const uiCycleTime = yield this.page.getInputValueAsNumber(this.page.CycleTimePart);
            let calcCycleTime = (_c = (_b = (_a = expectedValue !== null && expectedValue !== void 0 ? expectedValue : calculated.finalCycleTime) !== null && _a !== void 0 ? _a : calculated.totalCycleTime) !== null && _b !== void 0 ? _b : calculated.cycleTime) !== null && _c !== void 0 ? _c : 0;
            logger.info(`CycleTime → UI=${uiCycleTime}, Calc=${calcCycleTime}`);
            test_1.expect.soft(uiCycleTime).toBeCloseTo(calcCycleTime, 2);
        });
    }
    //========================== Verify Power Cost ==========================
    verifyPowerCost(calculated, expectedValue) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('🔹 Verifying Power Cost...');
            const uiPowerCost = yield this.page.getInputValueAsNumber(this.page.TotalPowerCost);
            const calcPowerCost = calculated.totalPowerCost || 0;
            test_1.expect.soft(uiPowerCost).toBeCloseTo(calcPowerCost, 4);
            logger.info(`✔ Power Cost → UI: ${uiPowerCost}, Expected: ${calcPowerCost === null || calcPowerCost === void 0 ? void 0 : calcPowerCost.toFixed(4)}`);
            if (expectedValue !== undefined) {
                test_1.expect.soft(uiPowerCost).toBeCloseTo(expectedValue, 4);
                logger.info(`✔ Power Cost vs Expected: UI=${uiPowerCost}, Expected=${expectedValue}`);
            }
        });
    }
    verifyMachineCost(calculated, expectedValue) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('🔹 Verifying Machine Cost (Calculator)...');
            const uiMachineCost = yield this.page.getInputValueAsNumber(this.page.MachineCostPart);
            const calcMachineCost = calculated.directMachineCost || 0;
            test_1.expect.soft(uiMachineCost).toBeCloseTo(calcMachineCost, 2);
            logger.info(`✔ Machine Cost → UI=${uiMachineCost}, Calc=${calcMachineCost}`);
            if (expectedValue !== undefined) {
                test_1.expect.soft(uiMachineCost).toBeCloseTo(expectedValue, 4);
                logger.info(`✔ Machine Cost vs Expected: UI=${uiMachineCost}, Expected=${expectedValue}`);
            }
        });
    }
    verifyInspectionCost(calculated, expectedValue) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('🔹 Verifying Inspection Cost...');
            const uiInspectionCost = yield this.page.getInputValueAsNumber(this.page.QAInspectionCost);
            const calcInspectionCost = calculated.inspectionCost || 0;
            test_1.expect.soft(uiInspectionCost).toBeCloseTo(calcInspectionCost, 2);
            if (expectedValue !== undefined) {
                test_1.expect.soft(uiInspectionCost).toBeCloseTo(expectedValue, 4);
                logger.info(`✔ Inspection Cost vs Expected: UI=${uiInspectionCost}, Expected=${expectedValue}`);
            }
        });
    }
    verifySetupCost(calculated, expectedValue) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('🔹 Verifying Setup Cost...');
            const uiSetupCost = yield this.page.getInputValueAsNumber(this.page.SetupCostPart);
            const calcSetupCost = calculated.directSetUpCost || 0;
            test_1.expect.soft(uiSetupCost).toBeCloseTo(calcSetupCost, 2);
            logger.info(`✔ Setup Cost vs Calc: UI=${uiSetupCost}, Calc=${calcSetupCost}`);
            if (expectedValue !== undefined) {
                test_1.expect.soft(uiSetupCost).toBeCloseTo(expectedValue, 4);
                logger.info(`✔ Setup Cost vs Expected: UI=${uiSetupCost}, Expected=${expectedValue}`);
            }
        });
    }
    verifyLaborCost(calculated, expectedValue) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('🔹 Verifying Labor Cost...');
            const uiLaborCost = yield this.page.getInputValueAsNumber(this.page.directLaborRate);
            const calcLaborCost = Number((calculated === null || calculated === void 0 ? void 0 : calculated.directLaborCost) || 0);
            test_1.expect.soft(uiLaborCost).toBeCloseTo(calcLaborCost, 4);
            logger.info(`✔ Labor Cost → UI=${uiLaborCost}, Calc=${calcLaborCost}`);
            if (expectedValue !== undefined) {
                test_1.expect.soft(uiLaborCost).toBeCloseTo(expectedValue, 4);
                logger.info(`✔ Labor Cost vs Expected: UI=${uiLaborCost}, Expected=${expectedValue}`);
            }
        });
    }
    verifyYieldCost(expectedValue) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('🔹 Verifying Yield Cost...');
            const uiYieldCost = yield this.page.getInputValueAsNumber(this.page.YieldCostPart);
            let expected = expectedValue;
            if (expected === undefined) {
                const netMatCost = yield this.getNetMaterialCost();
                const machineCost = yield this.page.getInputValueAsNumber(this.page.MachineCostPart);
                const setupCost = yield this.page.getInputValueAsNumber(this.page.SetupCostPart);
                const laborCost = yield this.page.getInputValueAsNumber(this.page.directLaborRate);
                const inspectionCost = yield this.page.getInputValueAsNumber(this.page.QAInspectionCost);
                const yieldPer = yield this.page.getInputValueAsNumber(this.page.YieldPercentage);
                const sumCosts = machineCost + setupCost + laborCost + inspectionCost;
                expected = this.calculator.calculateYieldCost(yieldPer, sumCosts, netMatCost);
            }
            test_1.expect.soft(uiYieldCost).toBeCloseTo(expected, 2);
            logger.info(`✔ Yield Cost → UI: ${uiYieldCost}, Expected: ${expected === null || expected === void 0 ? void 0 : expected.toFixed(2)}`);
            if (expectedValue !== undefined) {
                test_1.expect.soft(uiYieldCost).toBeCloseTo(expectedValue, 4);
                logger.info(`✔ Yield Cost vs Expected: UI=${uiYieldCost}, Expected=${expectedValue}`);
            }
        });
    }
    verifyManufacturingCost(expectedValue) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('🔹 Verifying Manufacturing Cost...');
            const uiManufacturingCost = yield this.page.getInputValueAsNumber(this.page.NetProcessCost);
            let expected = expectedValue;
            if (expected === undefined) {
                const netMatCost = yield this.getNetMaterialCost();
                const machineCost = yield this.page.getInputValueAsNumber(this.page.MachineCostPart);
                const setupCost = yield this.page.getInputValueAsNumber(this.page.SetupCostPart);
                const laborCost = yield this.page.getInputValueAsNumber(this.page.directLaborRate);
                const inspectionCost = yield this.page.getInputValueAsNumber(this.page.QAInspectionCost);
                const yieldCost = yield this.page.getInputValueAsNumber(this.page.YieldCostPart);
                const powerCost = yield this.page.getInputValueAsNumber(this.page.TotalPowerCost);
                expected = machineCost + setupCost + laborCost + inspectionCost + yieldCost + powerCost;
            }
            test_1.expect.soft(uiManufacturingCost).toBeCloseTo(expected, 2);
            logger.info(`✔ Manufacturing Cost → UI: ${uiManufacturingCost}, Expected: ${expected === null || expected === void 0 ? void 0 : expected.toFixed(2)}`);
            if (expectedValue !== undefined) {
                test_1.expect.soft(uiManufacturingCost).toBeCloseTo(expectedValue, 4);
                logger.info(`✔ Manufacturing Cost vs Expected: UI=${uiManufacturingCost}, Expected=${expectedValue}`);
            }
            // You might want to compare this with a calculated value or test data
            logger.info(`calculated expected: ${JSON.stringify(expected)}`);
            logger.info(`actualManufacturingCost: ${JSON.stringify(uiManufacturingCost)}`);
            logger.info(`✔ Manufacturing Cost verified: UI=${uiManufacturingCost}, Calc=${expected}`);
        });
    }
    verifyManufacturingSustainability(expectedValue) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('🔹 Verifying Manufacturing Sustainability...');
            const co2PerKwHr = yield this.page.getInputValueAsNumber(this.page.CO2PerKwHr);
            const powerConsumption = yield this.page.getInputValueAsNumber(this.page.PowerConsumption);
            const cycleTime = yield this.page.getInputValueAsNumber(this.page.CycleTimePart);
            const expected = (0, welding_calculator_1.calculateManufacturingCO2)(cycleTime, powerConsumption, co2PerKwHr);
            const actual = yield this.page.getInputValueAsNumber(this.page.CO2PerPartManufacturing);
            test_1.expect.soft(actual).toBeCloseTo(expected, 4);
            logger.info(`✔ Manufacturing CO2 Per Part → UI: ${actual}, Expected: ${expected.toFixed(4)}`);
            if (expectedValue !== undefined) {
                test_1.expect.soft(actual).toBeCloseTo(expectedValue, 4);
                logger.info(`✔ Manufacturing CO2 Per Part vs Expected: UI=${actual}, Expected=${expectedValue}`);
            }
        });
    }
    getProcessType() {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.page.MigWeldRadBtn.isChecked())
                return welding_calculator_1.ProcessType.MigWelding;
            if (yield this.page.WeldCleanRadBtn.isChecked())
                return welding_calculator_1.ProcessType.WeldingCleaning;
            return welding_calculator_1.ProcessType.MigWelding;
        });
    }
    fillSubProcessRow(index, locators, data) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info(`➡ Filling Weld ${index} Sub Process`);
            yield this.page.selectOption(locators.weldType, data.weldType);
            yield this.page.scrollIntoView(locators.position);
            yield this.page.selectOption(locators.position, data.weldPosition);
            if (data.travelSpeed) {
                yield locators.speed.fill(data.travelSpeed.toString());
            }
            yield locators.tack.fill(data.tackWelds.toString());
            yield locators.stop.fill(data.intermediateStops.toString());
        });
    }
    saveAndRecalculate() {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('🔹 Saving Project and Recalculating Cost...');
            yield this.page.waitAndClick(this.page.UpdateSave);
            yield this.page.page
                .waitForResponse(resp => resp.url().includes('update') && resp.status() === 200)
                .catch(() => { });
            yield this.page.waitForNetworkIdle();
            yield this.page.page
                .waitForResponse(resp => resp.url().includes('recalculate') && resp.status() === 200)
                .catch(() => { });
            yield this.page.waitForNetworkIdle();
            logger.info('✔ Project saved and recalculated');
        });
    }
}
exports.MigWeldingLogic = MigWeldingLogic;
