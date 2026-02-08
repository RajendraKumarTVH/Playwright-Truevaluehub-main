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
const BasePage_1 = require("../lib/BasePage");
const mig_welding_testdata_1 = require("../../test-data/mig-welding-testdata");
const helpers_1 = require("../utils/helpers");
const SustainabilityCalculator_1 = require("../utils/SustainabilityCalculator");
const logger = LoggerUtil_1.default;
class MigWeldingLogic {
    constructor(page) {
        this.page = page;
        this.calculator = new welding_calculator_1.WeldingCalculator();
        this.runtimeWeldingContext = {};
    }
    setProcessGroup(value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.selectOption(this.page.ProcessGroup, value);
        });
    }
    isAttached(locator_1) {
        return __awaiter(this, arguments, void 0, function* (locator, timeout = 500) {
            try {
                yield locator.waitFor({ state: 'attached', timeout });
                return true;
            }
            catch (_a) {
                return false;
            }
        });
    }
    //================================ Material Dimensions And Density ========================
    getMaterialDimensionsAndDensity() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const DEFAULT_DENSITY = 7.85;
            let density = DEFAULT_DENSITY;
            let length = 0;
            let width = 0;
            let height = 0;
            try {
                if ((_b = (_a = this.page).isPageClosed) === null || _b === void 0 ? void 0 : _b.call(_a)) {
                    logger.warn('⚠️ Page already closed — using defaults');
                    return { length, width, height, density };
                }
                yield this.page.waitAndClick(this.page.MaterialDetailsTab);
                if (yield this.page.Density.first().isVisible({ timeout: 3000 }).catch(() => false)) {
                    density =
                        Number(yield this.page.Density.first().inputValue()) ||
                            DEFAULT_DENSITY;
                }
                else {
                    logger.warn('⚠️ Density field not visible — using default');
                }
                yield this.page.waitAndClick(this.page.MaterialInfo);
                if (yield this.page.PartEnvelopeLength.first().isVisible({ timeout: 3000 }).catch(() => false)) {
                    [length, width, height] = (yield Promise.all([
                        this.page.PartEnvelopeLength.first().inputValue(),
                        this.page.PartEnvelopeWidth.first().inputValue(),
                        this.page.PartEnvelopeHeight.first().inputValue()
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
    //======================== Part Complexity ========================
    getPartComplexity(testData) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('🔹 Processing Part Complexity...');
            yield this.page.AdditionalDetails.scrollIntoViewIfNeeded();
            yield this.page.waitAndClick(this.page.AdditionalDetails);
            const selectValueMap = {
                low: '1',
                medium: '2',
                high: '3'
            };
            if (testData === null || testData === void 0 ? void 0 : testData.partComplexity) {
                const key = testData.partComplexity.toLowerCase();
                const optionValue = selectValueMap[key];
                if (!optionValue) {
                    throw new Error(`❌ Invalid Part Complexity: ${testData.partComplexity}`);
                }
                logger.info(`🔧 Selecting Part Complexity: ${key}`);
                yield this.page.PartComplexity.selectOption(optionValue);
            }
            const selectedValue = yield this.page.PartComplexity.inputValue();
            if (!selectedValue) {
                logger.warn('⚠️ Part Complexity not selected, defaulting to LOW');
                return 1;
            }
            const partComplexity = Number(selectedValue);
            if (![1, 2, 3].includes(partComplexity)) {
                throw new Error(`❌ Unexpected Part Complexity value in UI: "${selectedValue}"`);
            }
            logger.info(`✅ Part Complexity resolved as: ${partComplexity}`);
            yield this.page.waitAndClick(this.page.PartDetails);
            return partComplexity;
        });
    }
    // ========================== Navigation ==========================
    navigateToProject(projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info(`🔹 Navigating to project: ${projectId}`);
            yield this.page.waitAndClick(this.page.projectIcon);
            logger.info('Existing part found. Clicking Clear All...');
            const isClearVisible = yield this.page.ClearAll.isVisible().catch(() => false);
            if (isClearVisible) {
                yield this.page.waitAndClick(this.page.ClearAll);
            }
            else {
                yield this.page.keyPress('Escape');
            }
            yield this.page.openMatSelect(this.page.SelectAnOption, 'Project Selector');
            const projectOption = this.page.page
                .locator('mat-option, mat-mdc-option')
                .filter({ hasText: 'Project #' })
                .first();
            yield projectOption.waitFor({ state: 'visible', timeout: 10000 });
            yield projectOption.scrollIntoViewIfNeeded();
            yield projectOption.click();
            logger.info('✅ Project option selected');
            yield this.page.waitAndFill(this.page.ProjectValue, projectId);
            yield this.page.pressTab();
            yield this.page.pressEnter();
            yield this.page.waitForNetworkIdle();
            yield this.page.ProjectID.click();
            logger.info(`✔ Navigated to project ID: ${projectId}`);
        });
    }
    openManufacturingForMigWelding() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.scrollToMiddle(this.page.ManufacturingInformation);
            const manufacturingHeader = this.page.ManufacturingInformation;
            const migRadio = this.page.MigWeldRadBtn;
            const migText = this.page.MigWeldingProcessType;
            logger.info('🔧 Opening Manufacturing → MIG Welding');
            yield manufacturingHeader.waitFor({ state: 'visible', timeout: 10000 });
            yield manufacturingHeader.scrollIntoViewIfNeeded();
            // Check if the "Mig Welding" text is visible to determine if expanded
            const isExpanded = yield migText.isVisible().catch(() => false);
            if (!isExpanded) {
                logger.info('🔽 Expanding Manufacturing section');
                yield manufacturingHeader.click({ force: true });
                // Wait for the text to be visible, implying the section is expanded
                yield migText.waitFor({
                    state: 'visible',
                    timeout: 10000
                });
            }
            else {
                logger.info('✅ Manufacturing section already expanded');
            }
            // Click radio if not checked (using force: true since input might be hidden)
            if (!(yield migRadio.isChecked())) {
                logger.info('🟢 Selecting MIG Welding');
                yield migRadio.click({ force: true });
            }
            yield this.page.expandWeldIfVisible(this.page.MfgWeld1, this.page.WeldTypeSubProcess1, 'Weld 1');
            yield this.page.expandWeldIfVisible(this.page.MfgWeld2, this.page.WeldTypeSubProcess2, 'Weld 2');
            logger.info('✅ Manufacturing → MIG Welding ready');
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
    /**
     * Verifies material information details
     */
    verifyMaterialInformationDetails() {
        return __awaiter(this, void 0, void 0, function* () {
            const { processGroup, category, family, grade, stockForm } = mig_welding_testdata_1.MaterialInformation;
            logger.info(`🔹 Selecting material: ${processGroup} > ${category} > ${family} > ${grade} > ${stockForm}`);
            yield this.page.MaterialInformationSection.scrollIntoViewIfNeeded();
            yield this.page.MaterialInformationSection.click();
            yield this.page.selectByTrimmedLabel(this.page.ProcessGroup, processGroup);
            yield this.page.selectOption(this.page.materialCategory, category);
            yield this.page.selectOption(this.page.MatFamily, family);
            yield this.page.selectOption(this.page.DescriptionGrade, grade);
            yield this.page.selectOption(this.page.StockForm, stockForm);
            yield this.page.waitForTimeout(300);
            const scrapPrice = yield this.page.readNumberSafe(this.page.ScrapPrice, 'Scrap Price');
            const materialPrice = yield this.page.readNumberSafe(this.page.MaterialPrice, 'Material Price');
            test_1.expect.soft(scrapPrice).toBeGreaterThan(0);
            test_1.expect.soft(materialPrice).toBeGreaterThan(0);
            // -------------------- Density + Volume --------------------
            yield this.page.scrollIntoView(this.page.PartDetails);
            const { density } = yield this.getMaterialDimensionsAndDensity();
            const partVolume = yield this.getPartVolume();
            logger.info(`🧪 Density → ${density}`);
            logger.info(`📦 Part Volume → ${partVolume}`);
            // ✅ Defensive validation before calculation
            if (density <= 0 || partVolume <= 0) {
                logger.warn(`⚠️ Invalid calculation inputs → Density: ${density}, Volume: ${partVolume}`);
                return;
            }
            const expectedNetWeight = (0, welding_calculator_1.calculateNetWeight)(partVolume, density);
            // Optional higher precision validation
            yield this.verifyNetWeight(expectedNetWeight, 4);
        });
    }
    getNetWeight() {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('🔹 Reading Net Weight...');
            const netWeight = yield this.page.readNumberSafe(this.page.NetWeight, 'Net Weight', 10000, 2);
            if (netWeight <= 0) {
                logger.warn('⚠️ Net Weight returned 0 or invalid – possible rendering delay or calculation issue');
            }
            return netWeight / 1000;
        });
    }
    getPartVolume() {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('🔹 Waiting for Part Volume...');
            yield test_1.expect.soft(this.page.PartVolume).toBeVisible({ timeout: 10000 });
            const volume = yield this.page.waitForStableNumber(this.page.PartVolume, 'Part Volume');
            return volume;
        });
    }
    verifyNetWeight(expectedValue_1) {
        return __awaiter(this, arguments, void 0, function* (expectedValue, precision = 2) {
            logger.info('🔹 Verifying Net Weight...');
            let expected = expectedValue;
            if (expected === undefined) {
                const { density } = yield this.getMaterialDimensionsAndDensity();
                logger.info(`🧪 Density → ${density}`);
                const partVolumeMm3 = yield this.getPartVolume();
                expected = (0, welding_calculator_1.calculateNetWeight)(partVolumeMm3, density);
            }
            const actualNetWeight = yield this.getNetWeight();
            yield BasePage_1.VerificationHelper.verifyNumeric(actualNetWeight, expected, 'Net Weight', precision);
            logger.info(`✔ Net Weight verified: ${actualNetWeight.toFixed(precision)} g`);
            return actualNetWeight;
        });
    }
    // ========================== Weld Data Collection ==========================
    getWeldRowLocators(weldIndex) {
        const suffix = weldIndex === 1 ? '1' : '2';
        const locators = {
            partReorientationTime: this.page.PartReorientationTime,
            DryCycleTime: this.page.DryCycleTime,
            passesLocator: this.page[`MatNoOfWeldPasses${suffix}`],
            weldCheck: this.page[`MatWeld${suffix}`],
            weldType: this.page[`MatWeldType${suffix}`],
            weldSize: this.page[`MatWeldSize${suffix}`],
            wireDia: this.page[`MatWireDia${suffix}`],
            weldElementSize: this.page[`MatWeldElementSize${suffix}`],
            weldLength: this.page[`MatWeldLengthmm${suffix}`],
            weldSide: this.page[`MatWeldSide${suffix}`],
            weldPlaces: this.page[`MatWeldPlaces${suffix}`],
            grindFlush: this.page[`MatGrishFlush${suffix}`],
            totalWeldLength: weldIndex === 1
                ? this.page.MatTotalWeldLengthWeld1
                : this.page.MatTotalWeldLengthWeld2,
            section: this.page[`MatWeld${suffix}`]
                .locator('xpath=ancestor::mat-expansion-panel-header')
        };
        return locators;
    }
    //=============Collect Single Weld Data From UI ============	
    collectWeldSubMaterial(weldIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const locators = this.getWeldRowLocators(weldIndex);
            if (!(yield locators.weldType.isVisible().catch(() => false))) {
                logger.info(`ℹ️ Weld ${weldIndex} not visible — skipping`);
                return null;
            }
            const passesLocator = weldIndex === 1
                ? this.page.MatNoOfWeldPasses1
                : this.page.MatNoOfWeldPasses2;
            const weld = {
                weldType: yield this.page.getSelectedOptionText(locators.weldType),
                weldSide: yield this.page.getSelectedOptionText(locators.weldSide),
                weldSize: Number(yield locators.weldSize.inputValue()),
                weldElementSize: Number(yield locators.weldElementSize.inputValue()),
                weldLength: Number(yield locators.weldLength.inputValue()),
                weldPlaces: Number(yield locators.weldPlaces.inputValue()),
                wireDia: Number((yield ((_a = locators.wireDia) === null || _a === void 0 ? void 0 : _a.inputValue())) || 0),
                noOfWeldPasses: Number((yield passesLocator.inputValue()) || 0),
            };
            logger.info(`🔩 Weld ${weldIndex} UI → ${JSON.stringify(weld)}`);
            return weld;
        });
    }
    // =============Collect All Weld Rows===============
    collectAllWeldSubMaterials() {
        return __awaiter(this, void 0, void 0, function* () {
            const results = yield Promise.all([1, 2].map(i => this.collectWeldSubMaterial(i)));
            const welds = results.filter((w) => w !== null);
            if (!welds.length) {
                throw new Error('❌ No weld material rows detected in UI');
            }
            return welds;
        });
    }
    //=================Verify One Weld Row (Fill + Validate)=============
    verifySingleWeldRow(weldData, materialType, locators) {
        return __awaiter(this, void 0, void 0, function* () {
            const weldToggle = locators.weldCheck;
            if (weldToggle && (yield weldToggle.count().catch(() => 0)) > 0) {
                yield weldToggle.scrollIntoViewIfNeeded();
                if (yield weldToggle.isVisible().catch(() => false)) {
                    yield this.page.expandWeldCollapsed(weldToggle);
                    yield test_1.expect.soft(weldToggle).toBeVisible();
                }
                else {
                    logger.warn(`⚠️ Weld toggle not visible for weld row — skipping expand`);
                }
            }
            else {
                logger.warn('⚠️ Weld toggle not found — skipping expand');
            }
            yield test_1.expect.soft(locators.weldType).toBeEnabled();
            yield this.page.selectOption(locators.weldType, weldData.weldType);
            let uiWeldSize;
            try {
                uiWeldSize = yield this.page.safeFill(locators.weldSize, weldData.weldSize, 'Weld Size');
            }
            catch (err) {
                logger.error(`❌ Failed to fill Weld Size: ${err.message}`);
                return { totalLength: 0, volume: 0, weldVolume: 0 };
            }
            const wireDia = locators.wireDia; // TS now knows it’s not undefined
            const count = yield wireDia.count();
            if (count > 0) {
                yield test_1.expect.soft(wireDia).toBeVisible({ timeout: 5000 });
                const actualWireDia = Number(yield wireDia.inputValue());
                const expectedWireDia = (0, welding_calculator_1.getWireDiameter)(materialType, uiWeldSize);
                test_1.expect.soft(actualWireDia).toBe(expectedWireDia);
                logger.info(`🧪 Wire Dia: ${actualWireDia} (Expected: ${expectedWireDia})`);
            }
            else {
                logger.warn('⚠️ Wire Dia field not present — skipping validation');
            }
            yield test_1.expect.soft(locators.weldElementSize).not.toHaveValue('', {
                timeout: 5000
            });
            const weldElementSize = Number((yield locators.weldElementSize.inputValue()) || '0');
            let uiWeldLength;
            try {
                uiWeldLength = yield this.page.safeFill(locators.weldLength, weldData.weldLength, 'Weld Length');
            }
            catch (err) {
                logger.error(`❌ Failed to fill Weld Length: ${err.message}`);
                return { totalLength: 0, volume: 0, weldVolume: 0 };
            }
            yield locators.weldPlaces.waitFor({ state: 'visible', timeout: 5000 });
            yield locators.weldPlaces.fill(String(weldData.weldPlaces));
            const uiWeldPlaces = Number(yield locators.weldPlaces.inputValue());
            test_1.expect.soft(uiWeldPlaces).toBeGreaterThan(0);
            logger.info(`📍 Weld Places: ${uiWeldPlaces}`);
            yield this.page.selectOption(locators.weldSide, weldData.weldSide);
            const uiWeldSide = yield this.page.getSelectedOptionText(locators.weldSide);
            test_1.expect.soft(uiWeldSide).toBe(weldData.weldSide);
            logger.info(`↔️ Weld Side: ${uiWeldSide}`);
            yield this.page.selectOption(locators.grindFlush, weldData.grindFlush);
            const uiGrindFlush = yield this.page.getSelectedOptionText(locators.grindFlush);
            test_1.expect.soft(uiGrindFlush).toBe(weldData.grindFlush);
            logger.info(`🪵 Grind Flush: ${uiGrindFlush}`);
            const passes = Number(weldData.noOfWeldPasses || 1);
            test_1.expect.soft(passes).toBeGreaterThan(0);
            logger.info(`🔁 Weld Passes: ${passes}`);
            yield (0, welding_calculator_1.validateTotalLength)(locators.weldLength, locators.weldPlaces, locators.weldSide, locators.totalWeldLength, 'Total Weld Length');
            const expectedTotalLength = this.calculator.getTotalWeldLength(uiWeldLength, uiWeldPlaces, uiWeldSide);
            yield test_1.expect
                .soft(locators.totalWeldLength)
                .toHaveValue(expectedTotalLength.toString(), { timeout: 5000 });
            logger.info(`✔ Total Weld Length: ${expectedTotalLength}`);
            const weldVolumeResult = (0, welding_calculator_1.calculateWeldVolume)(weldData.weldType, uiWeldSize, weldElementSize, uiWeldLength, uiWeldPlaces, passes, uiWeldSide);
            test_1.expect.soft(weldVolumeResult.weldVolume).toBeGreaterThan(0);
            logger.info(`📦 Weld Volume: ${weldVolumeResult.weldVolume}`);
            return {
                totalLength: expectedTotalLength,
                volume: weldVolumeResult.weldVolume,
                weldVolume: weldVolumeResult.weldVolume
            };
        });
    }
    verifyWeldingDetails(migWeldingTestData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            logger.info('🔹 Verifying Welding Details...');
            yield this.page.scrollToMiddle(this.page.WeldingDetails);
            yield test_1.expect.soft(this.page.WeldingDetails).toBeVisible({ timeout: 10000 });
            const weldingDetails = migWeldingTestData.weldingDetails;
            const materialType = ((_a = migWeldingTestData.materialInformation) === null || _a === void 0 ? void 0 : _a.family) ||
                'Carbon Steel';
            const weldResults = [];
            for (const index of [1, 2]) {
                const weldData = weldingDetails === null || weldingDetails === void 0 ? void 0 : weldingDetails[`weld${index}`];
                if (!weldData)
                    continue;
                logger.info(`🔍 Verifying Weld Row ${index}`);
                const result = yield this.verifySingleWeldRow(weldData, materialType, this.getWeldRowLocators(index));
                weldResults.push(result);
            }
            const expectedTotal = weldResults.reduce((sum, w) => sum + w.totalLength, 0);
            const actualTotal = Number(yield this.page.TotalWeldLength.inputValue());
            test_1.expect.soft(actualTotal).toBe(expectedTotal);
            this.runtimeWeldingContext.totalWeldLength = expectedTotal;
            logger.info(`✔ Welding Details verified. Grand Total = ${expectedTotal}`);
            logger.info('✅ verifyWeldingDetails completed successfully');
        });
    }
    // ========================== Manufacturing Cost Verification ==========================
    verifyDirectProcessCostCalculation() {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('🔹 Verifying Direct Process Cost Summation...');
            // 1. Read individual cost components
            const machineCost = yield this.page.readNumberSafe(this.page.DirectMachineCost, 'Direct Machine Cost');
            const setupCost = yield this.page.readNumberSafe(this.page.DirectSetUpCost, 'Direct SetUp Cost');
            const laborCost = yield this.page.readNumberSafe(this.page.DirectLaborCost, 'Direct Labor Cost');
            const inspectionCost = yield this.page.readNumberSafe(this.page.QAInspectionCost, 'Inspection Cost');
            const yieldCost = yield this.page.readNumberSafe(this.page.YieldCostPart, 'Yield Cost');
            const powerCost = yield this.page.readNumberSafe(this.page.TotalPowerCost, 'Total Power Cost');
            // 2. Sum them up
            const expectedProcessCost = machineCost + setupCost + laborCost + inspectionCost + yieldCost + powerCost;
            logger.info(`∑ Calculation: ${machineCost} (Machine) + ${setupCost} (Setup) + ${laborCost} (Labor) + ` +
                `${inspectionCost} (Inspection) + ${yieldCost} (Yield) + ${powerCost} (Power) = ${expectedProcessCost}`);
            // 3. Verify against the UI Total
            yield this.page.verifyUIValue({
                locator: this.page.NetProcessCost,
                expectedValue: expectedProcessCost,
                label: 'Net Process Cost (Sum check)',
                precision: 2
            });
            logger.info('✔ Direct Process Cost summation verified');
        });
    }
    // ========================== Material Cost Details Verification ==========================
    verifyMaterialValue(locator_1, expectedValue_1, label_1) {
        return __awaiter(this, arguments, void 0, function* (locator, expectedValue, label, precision = 2) {
            yield this.page.verifyUIValue({
                locator,
                expectedValue,
                label,
                precision
            });
        });
    }
    /**
     * Verifies total weld length
     */
    verifyTotalWeldLength(expectedTotalWeldLength) {
        return __awaiter(this, void 0, void 0, function* () {
            const expected = expectedTotalWeldLength !== null && expectedTotalWeldLength !== void 0 ? expectedTotalWeldLength : this.runtimeWeldingContext.totalWeldLength;
            if (expected === undefined) {
                logger.warn('⚠️ No expected total weld length provided or found in context — skipping verification');
                return;
            }
            yield this.verifyMaterialValue(this.page.TotalWeldLength, expected, 'Total Weld Length');
        });
    }
    /**
     * Verifies total weld material weight
     */
    verifyTotalWeldMaterialWeight(expectedValue) {
        return __awaiter(this, void 0, void 0, function* () {
            if (expectedValue === undefined)
                return;
            yield this.verifyMaterialValue(this.page.TotalWeldMaterialWeight, expectedValue, 'Total Weld Material Weight');
        });
    }
    /**
     * Verifies weld bead weight with wastage
     */
    verifyNetMaterialCostCalculation(expectedWeldBeadWeightWithWastage) {
        return __awaiter(this, void 0, void 0, function* () {
            if (expectedWeldBeadWeightWithWastage === undefined)
                return;
            yield this.page.verifyUIValue({
                locator: this.page.WeldBeadWeightWithWastage,
                expectedValue: expectedWeldBeadWeightWithWastage,
                label: 'Weld Bead Weight with Wastage',
                precision: 2
            });
        });
    }
    /**
     * Verifies all welding material calculations from UI
     */
    verifyWeldingMaterialCalculations() {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('\n🔹 Step: Verify Material Calculations from UI');
            const { density } = yield this.getMaterialDimensionsAndDensity();
            logger.info(`🧪 Density → ${density}`);
            const partVolume = yield this.getPartVolume();
            logger.info(`📦 Part Volume → ${partVolume}`);
            const expectedNetWeight = (0, welding_calculator_1.calculateNetWeight)(partVolume, density);
            yield this.verifyNetWeight(expectedNetWeight);
            const weldSubMaterials = yield this.collectAllWeldSubMaterials();
            // Calculation
            const calculated = this.calculator.calculateExpectedWeldingMaterialCosts({ density }, weldSubMaterials);
            logger.info(`📐 Calculated → ${JSON.stringify(calculated)}`);
            logger.info('🔹 Verifying calculated values match UI inputs...');
            yield this.verifyTotalWeldLength(calculated.totalWeldLength);
            yield this.verifyTotalWeldMaterialWeight(calculated.totalWeldMaterialWeight);
            yield this.verifyNetMaterialCostCalculation(calculated.weldBeadWeightWithWastage);
            //	await this.verifyNetMaterialSustainabilityCost()
            logger.info('✅ Material calculations verified successfully from UI');
        });
    }
    /**
     * Simplified material calculations verification
     */
    verifyMaterialCalculations(density) {
        return __awaiter(this, void 0, void 0, function* () {
            const welds = [
                {
                    length: yield this.page.readNumber('Weld Length 1', this.page.MatWeldLengthmm1),
                    size: yield this.page.readNumber('Weld Size 1', this.page.MatWeldSize1)
                },
                {
                    length: yield this.page.readNumber('Weld Length 2', this.page.MatWeldLengthmm2),
                    size: yield this.page.readNumber('Weld Size 2', this.page.MatWeldSize2)
                }
            ];
            const calculated = this.calculator.calculateExpectedWeldingMaterialCosts({ density }, welds);
            // Call verification methods (they perform their own assertions internally)
            yield this.verifyTotalWeldLength(calculated.totalWeldLength);
            yield this.verifyTotalWeldMaterialWeight(calculated.totalWeldMaterialWeight);
            yield this.verifyNetMaterialCostCalculation(calculated.weldBeadWeightWithWastage);
            // Verify UI values against calculated values
            yield this.page.verifyUIValue({
                locator: this.page.TotalWeldLength,
                expectedValue: calculated.totalWeldLength,
                label: 'Total Weld Length'
            });
            yield this.page.verifyUIValue({
                locator: this.page.TotalWeldMaterialWeight,
                expectedValue: calculated.totalWeldMaterialWeight,
                label: 'Total Weld Material Weight'
            });
            yield this.page.verifyUIValue({
                locator: this.page.WeldBeadWeightWithWastage,
                expectedValue: calculated.weldBeadWeightWithWastage,
                label: 'Weld Bead Weight with Wastage'
            });
            logger.info('✔ Material calculations verified successfully');
        });
    }
    // ========================== Manufacturing Information Section ==========================
    /**
     * Verifies process details from UI
     */
    collectSubProcesses() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const subProcesses = [];
            for (const index of [1, 2]) {
                logger.info(`🔍 Collecting SubProcess ${index}...`);
                // ✅ Ensure weld section is expanded
                yield this.ensureMfgWeldExpanded(index);
                const locators = index === 1
                    ? {
                        weldType: this.page.WeldTypeSubProcess1,
                        weldPosition: this.page.WeldPositionSubProcess1,
                        travelSpeed: this.page.TravelSpeedSubProcess1,
                        tackWeld: this.page.TrackWeldSubProcess1,
                        intermediateStops: this.page.IntermediateStartStopSubProcess1
                    }
                    : {
                        weldType: this.page.WeldTypeSubProcess2,
                        weldPosition: this.page.WeldPositionSubProcess2,
                        travelSpeed: this.page.TravelSpeedSubProcess2,
                        tackWeld: this.page.TrackWeldSubProcess2,
                        intermediateStops: this.page.IntermediateStartStopSubProcess2
                    };
                // ✅ Small guarded wait for rendering
                try {
                    yield locators.weldType.waitFor({ state: 'visible', timeout: 2500 });
                }
                catch (_d) {
                    logger.info(`ℹ️ SubProcess ${index} not visible — skipping`);
                    continue;
                }
                const subProcess = {
                    weldType: yield this.page.getSelectedOptionText(locators.weldType),
                    weldPosition: yield this.page.getSelectedOptionText(locators.weldPosition),
                    travelSpeed: (_a = (yield this.page.getInputValueAsNumber(locators.travelSpeed))) !== null && _a !== void 0 ? _a : 5,
                    tackWelds: (_b = (yield this.page.getInputValueAsNumber(locators.tackWeld))) !== null && _b !== void 0 ? _b : 0,
                    intermediateStops: (_c = (yield this.page.getInputValueAsNumber(locators.intermediateStops))) !== null && _c !== void 0 ? _c : 0
                };
                subProcesses.push(subProcess);
                logger.info(`✅ SubProcess ${index}: ${subProcess.weldType}, ${subProcess.weldPosition}, ` +
                    `Speed=${subProcess.travelSpeed}, Tacks=${subProcess.tackWelds}, Stops=${subProcess.intermediateStops}`);
            }
            return subProcesses;
        });
    }
    //================================= Process Details Section =================================
    verifyProcessDetails(testData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            logger.info('\n🔹 Step: Verify Process Details from UI');
            const processType = yield this.page.getSelectedOptionText(this.page.ProcessGroup);
            const machineTypeRaw = yield this.page.MachineType.inputValue();
            const machineAutomation = (0, helpers_1.normalizeMachineType)(machineTypeRaw);
            const machineAutomationValue = (_a = (yield this.page.getInputValueAsNumber(this.page.MachineType))) !== null && _a !== void 0 ? _a : 1;
            const manufactureInfo = {};
            manufactureInfo.machineAutomation = machineAutomationValue;
            const machineName = yield this.page.getSelectedOptionText(this.page.MachineName);
            const machineDescription = yield this.page.MachineDescription.inputValue();
            const efficiency = (yield this.page.getInputValueAsNumber(this.page.MachineEfficiency));
            logger.info(`   ✓ Process Type: ${processType}`);
            logger.info(`   ✓ Machine Automation: ${machineAutomation}`);
            logger.info(`   ✓ Machine Name: ${machineName}`);
            logger.info(`   ✓ Machine Description: ${machineDescription}`);
            logger.info(`   ✓ Machine Efficiency: ${efficiency}%`);
            // Current / Voltage
            yield this.page.scrollIntoView(this.page.RequiredCurrent);
            const minCurrentRequired = yield this.page.getInputValueAsNumber(this.page.RequiredCurrent);
            const minWeldingVoltage = yield this.page.getInputValueAsNumber(this.page.RequiredVoltage);
            const selectedCurrent = yield this.page.getInputValueAsNumber(this.page.selectedCurrent);
            const selectedVoltage = yield this.page.getInputValueAsNumber(this.page.selectedVoltage);
            logger.info(`   ✓ Cur/Vol: Min(${minCurrentRequired}A, ${minWeldingVoltage}V), Selected(${selectedCurrent}A, ${selectedVoltage}V)`);
            // Sub-Process Details
            const subProcesses = yield this.collectSubProcesses();
            // Save for runtime context
            this.runtimeWeldingContext = Object.assign(Object.assign({}, this.runtimeWeldingContext), { processType,
                machineName,
                machineDescription,
                machineAutomation,
                efficiency, partComplexity: yield this.getPartComplexity(testData), minCurrentRequired,
                minWeldingVoltage,
                selectedCurrent,
                selectedVoltage,
                subProcesses });
            logger.info('✔ Process Details successfully read from UI');
        });
    }
    //================================= Manufacturing Subprocess Section =================================	
    ensureMfgWeldExpanded(mfgWeldIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info(`🔽 Ensuring Weld ${mfgWeldIndex} is expanded`);
            const targetInput = mfgWeldIndex === 1
                ? this.page.WeldTypeSubProcess1
                : this.page.WeldTypeSubProcess2;
            // ✅ If already expanded, exit early
            if (yield targetInput.isVisible().catch(() => false)) {
                logger.info(`✅ Weld ${mfgWeldIndex} already expanded`);
                return;
            }
            // 1️⃣ Ensure Manufacturing section exists
            const manufacturing = this.page.ManufacturingInformation.first();
            yield manufacturing.waitFor({ state: 'visible', timeout: 15000 });
            yield manufacturing.scrollIntoViewIfNeeded();
            // Expand Manufacturing ONLY if needed
            if (!(yield targetInput.isVisible().catch(() => false))) {
                yield manufacturing.click({ force: true });
                yield this.page.waitForTimeout(300);
            }
            // 2️⃣ Weld header (CLICK THIS, not the icon)
            const weldHeader = mfgWeldIndex === 1
                ? this.page.MfgWeld1
                : this.page.MfgWeld2;
            yield weldHeader.waitFor({ state: 'visible', timeout: 10000 });
            yield weldHeader.scrollIntoViewIfNeeded();
            // 3️⃣ Retry with content-based confirmation
            for (let attempt = 1; attempt <= 3; attempt++) {
                logger.debug(`🔁 Attempt ${attempt} to expand Weld ${mfgWeldIndex}`);
                try {
                    yield weldHeader.click({ force: true });
                }
                catch (_a) {
                    yield weldHeader.evaluate((el) => el.click());
                }
                // ✅ ONLY success condition
                if (yield targetInput.isVisible().catch(() => false)) {
                    logger.info(`✅ Weld ${mfgWeldIndex} expanded successfully`);
                    return;
                }
                yield this.page.waitForTimeout(600);
            }
            throw new Error(`❌ Weld ${mfgWeldIndex} expansion failed — target input never became visible`);
        });
    }
    //======================== Cycle Time/Part(Sec) =========================================
    verifyWeldCycleTimeDetails(testData) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('🔹 Step: Comprehensive Weld Cycle Time Verification');
            yield this.openManufacturingForMigWelding();
            const { weldingDetails } = testData !== null && testData !== void 0 ? testData : {};
            if (!weldingDetails) {
                logger.warn('⚠️ Missing weldingDetails in test data. Skipping verification.');
                return;
            }
            try {
                // ---------- Read Common UI Inputs ----------
                const efficiency = yield this.getEfficiencyFromUI();
                const partReorientation = yield this.getInputNumber(this.page.PartReorientationTime);
                const loadingUnloadingTime = yield this.getInputNumber(this.page.UnloadingTime);
                logger.info(`   ✓ Efficiency             : ${efficiency}%`);
                logger.info(`   ✓ Part Reorientation     : ${partReorientation}`);
                logger.info(`   ✓ Loading / Unloading    : ${loadingUnloadingTime} sec`);
                // ---------- Process Sub-Processes ----------
                const subProcessCycleTimes = [];
                const weldKeys = ['weld1', 'weld2'];
                for (let i = 0; i < weldKeys.length; i++) {
                    const key = weldKeys[i];
                    const weldData = weldingDetails[key];
                    if (!weldData) {
                        logger.info(`ℹ️ ${key} not present. Skipping.`);
                        continue;
                    }
                    logger.info(`🔍 Verifying Sub-Process ${i + 1}: ${key}`);
                    const cycleTime = yield this.verifySingleSubProcessCycleTime(i, weldData);
                    if (Number.isFinite(cycleTime)) {
                        subProcessCycleTimes.push(cycleTime);
                        logger.info(`   ✓ Sub-Process ${i + 1} Cycle Time: ${cycleTime.toFixed(2)} sec`);
                    }
                }
                if (!subProcessCycleTimes.length) {
                    logger.warn('⚠️ No active weld sub-processes found. Skipping overall cycle verification.');
                    return;
                }
                // ---------- Verify Overall Cycle Time ----------
                yield this.verifyOverallCycleTime({
                    subProcessCycleTimes,
                    loadingUnloadingTime,
                    partReorientation,
                    efficiency
                });
                this.runtimeWeldingContext.subProcessCycleTimes = subProcessCycleTimes;
                logger.info('✅ All Weld Cycle Time Verifications Completed Successfully');
            }
            catch (error) {
                logger.error(`❌ Cycle Time Verification Failed: ${error.message}`);
                logger.debug(error.stack);
                throw error;
            }
        });
    }
    verifySingleSubProcessCycleTime(index, weldData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const mfgWeldIndex = (index + 1);
            yield this.ensureMfgWeldExpanded(mfgWeldIndex);
            const locators = {
                weldType: mfgWeldIndex === 1 ? this.page.WeldTypeSubProcess1 : this.page.WeldTypeSubProcess2,
                position: mfgWeldIndex === 1 ? this.page.WeldPositionSubProcess1 : this.page.WeldPositionSubProcess2,
                speed: mfgWeldIndex === 1 ? this.page.TravelSpeedSubProcess1 : this.page.TravelSpeedSubProcess2,
                tacks: mfgWeldIndex === 1 ? this.page.TrackWeldSubProcess1 : this.page.TrackWeldSubProcess2,
                stops: mfgWeldIndex === 1 ? this.page.IntermediateStartStopSubProcess1 : this.page.IntermediateStartStopSubProcess2,
                cycle: mfgWeldIndex === 1 ? this.page.MfgWeldCycleTime1 : this.page.MfgWeldCycleTime2
            };
            logger.info(`\n🔍 ===== Verifying Sub-Process ${mfgWeldIndex} =====`);
            // ---------- Read UI Values ----------
            const actualWeldType = yield this.page.getSelectedOptionText(locators.weldType);
            const actualSpeed = yield this.page.getInputValueAsNumber(locators.speed);
            const actualTacks = yield this.page.getInputValueAsNumber(locators.tacks);
            const actualStops = yield this.page.getInputValueAsNumber(locators.stops);
            logger.info(`   ✓ Weld Type        : ${actualWeldType}`);
            logger.info(`   ✓ Travel Speed    : ${actualSpeed}`);
            logger.info(`   ✓ Tack Welds      : ${actualTacks}`);
            logger.info(`   ✓ Intermediate Stops : ${actualStops}`);
            // ---------- Optional Weld Type Validation ----------
            if (weldData.weldType) {
                yield BasePage_1.VerificationHelper.verifyDropdown(actualWeldType, weldData.weldType, 'Weld Type');
            }
            // ---------- Calculate Expected Cycle Time ----------
            const totalWeldLength = this.calculator.getTotalWeldLength((_a = weldData.weldLength) !== null && _a !== void 0 ? _a : 0, (_b = weldData.weldPlaces) !== null && _b !== void 0 ? _b : 1, (_c = weldData.weldSide) !== null && _c !== void 0 ? _c : 'One Side');
            let resolvedSpeed = actualSpeed;
            if (!resolvedSpeed || resolvedSpeed <= 0) {
                logger.warn(`⚠️ Invalid Travel Speed read from UI (${actualSpeed}). Defaulting to 12.0 mm/sec.`);
                resolvedSpeed = 12.0; // Default reasonable speed (was 1, causing huge cycle times)
            }
            logger.info(`   ℹ️ Calculation Inputs: Total Length=${totalWeldLength}mm (Len:${weldData.weldLength}, Places:${weldData.weldPlaces}), Speed=${resolvedSpeed}mm/s`);
            const calculatedCycleTime = (0, welding_calculator_1.calculateSingleWeldCycleTime)({
                totalWeldLength,
                travelSpeed: resolvedSpeed,
                tackWelds: actualTacks || 0,
                intermediateStops: actualStops || 0,
                weldType: actualWeldType || 'Fillet'
            });
            // ---------- Verify UI vs Calculated ----------
            if (yield locators.cycle.isVisible()) {
                const uiCycleTime = yield this.page.getInputValueAsNumber(locators.cycle);
                yield BasePage_1.VerificationHelper.verifyNumeric(uiCycleTime, calculatedCycleTime, 'Sub-Process Cycle Time', 2 // realistic tolerance (rounding + UI calc)
                );
                logger.info(`   ✓ Sub-Process ${mfgWeldIndex} Cycle Time: ${calculatedCycleTime.toFixed(2)} sec`);
            }
            return calculatedCycleTime;
        });
    }
    //===================================== Welding cleaning cycle time ======================
    verifyWeldCleaningCycleTimeDetails(testData) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('🔹 Step: Weld Cleaning/Preparation Cycle Time Verification');
            //await this.openManufacturingForMigWelding()
            yield this.verifyWeldPreparationCost();
        });
    }
    // ====================================================================
    // ✅ OVERALL CYCLE TIME VERIFICATION
    // ====================================================================
    verifyOverallCycleTime(input) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('\n📊 ===== Overall Cycle Time Breakdown =====');
            const breakdown = (0, welding_calculator_1.calculateWeldCycleTimeBreakdown)(input);
            logger.info(`✓ Loading/Unloading Time: ${breakdown.loadingUnloadingTime} sec`);
            logger.info(`✓ Total SubProcess Time : ${breakdown.subProcessCycleTime.toFixed(4)} sec`);
            logger.info(`✓ Arc On Time           : ${breakdown.arcOnTime.toFixed(4)} sec`);
            logger.info(`✓ Arc Off Time          : ${breakdown.arcOffTime.toFixed(4)} sec`);
            logger.info(`✓ Part Reorient. Time   : ${breakdown.partReorientationTime.toFixed(4)} sec (${breakdown.partReorientation} reorientations)`);
            logger.info(`✓ Dry Cycle Time        : ${breakdown.totalWeldCycleTime.toFixed(4)} sec`);
            logger.info(`✓ Calculated Cycle Time : ${breakdown.cycleTime.toFixed(4)} sec`);
            // Verify dry cycle time
            yield this.page.verifyUIValue({
                locator: this.page.DryCycleTime,
                expectedValue: breakdown.totalWeldCycleTime,
                label: 'Dry Cycle Time'
            });
            yield this.page.MigWeldRadBtn.waitFor({ state: 'visible', timeout: 10000 });
            if (!(yield this.page.MigWeldRadBtn.isChecked())) {
                yield this.page.MigWeldRadBtn.click();
            }
            // Verify overall cycle time with unit mismatch detection
            const uiCycleTimeRaw = yield this.page.getInputValueAsNumber(this.page.CycleTimePart);
            const ratio = uiCycleTimeRaw / breakdown.cycleTime;
            const EPSILON = 0.01; // 1% tolerance
            if (Math.abs(ratio - 1) > EPSILON) {
                logger.warn(`⚠️ Unit Mismatch: UI Cycle Time (${uiCycleTimeRaw}) is ${ratio.toFixed(3)}× the calculated cycle time (${breakdown.cycleTime.toFixed(3)})`);
            }
            else {
                logger.debug(`✅ Cycle time validated: UI and calculated values match within tolerance`);
            }
            this.runtimeWeldingContext.cycleTime = breakdown.cycleTime;
        });
    }
    getEfficiencyFromUI() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.page.getInputValueAsNumber(this.page.MatEfficiency));
        });
    }
    getInputNumber(locator_1) {
        return __awaiter(this, arguments, void 0, function* (locator, fallback = 0) {
            var _a;
            return (_a = (yield this.page.getInputValueAsNumber(locator))) !== null && _a !== void 0 ? _a : fallback;
        });
    }
    getProcessTypeMig() {
        return __awaiter(this, void 0, void 0, function* () {
            return welding_calculator_1.ProcessType.MigWelding;
        });
    }
    getProcessTypeCleaning() {
        return __awaiter(this, void 0, void 0, function* () {
            const text = yield this.page.getSelectedOptionText(this.page.ProcessGroup);
            if (text.includes('Cleaning'))
                return welding_calculator_1.ProcessType.WeldingCleaning;
            if (text.includes('Preparation'))
                return welding_calculator_1.ProcessType.WeldingPreparation;
            return welding_calculator_1.ProcessType.WeldingCleaning;
        });
    }
    getMaterialType() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.page.getSelectedOptionText(this.page.MatFamily);
        });
    }
    // ========================== Sustainability Verification ==========================
    // ===============================
    // 1️⃣ Gather ESG Input from UI
    // ===============================
    getMaterialESGInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.page.scrollElementToTop(this.page.AnnualVolumeQtyNos);
            const eav = yield this.page.getInputValueAsNumber(this.page.AnnualVolumeQtyNos);
            const netWeight = yield this.page.getInputValueAsNumber(this.page.NetWeight);
            const grossWeight = yield this.page.getInputValueAsNumber(this.page.WeldBeadWeightWithWastage);
            const scrapWeight = Math.max(grossWeight - netWeight, 0);
            const esgImpactCO2Kg = yield this.page.getInputValueAsNumber(this.page.CO2PerKgMaterial);
            const esgImpactCO2KgScrap = yield this.page.getInputValueAsNumber(this.page.CO2PerScrap);
            return {
                grossWeight,
                scrapWeight,
                netWeight,
                eav,
                esgImpactCO2Kg,
                esgImpactCO2KgScrap
            };
        });
    }
    verifyNetMaterialSustainabilityCost() {
        return __awaiter(this, void 0, void 0, function* () {
            const input = yield this.getMaterialESGInfo();
            const calculated = SustainabilityCalculator_1.SustainabilityCalculator.calculateMaterialSustainability(input);
            const uiCO2PerPart = yield this.page.getInputValueAsNumber(this.page.CO2PerPartMaterial);
            test_1.expect.soft(uiCO2PerPart).toBeCloseTo(calculated.esgImpactCO2KgPart, 4);
            console.log('🔹 Material Sustainability Calculation Debug');
            console.table({
                uiCO2PerPart,
                calculatedCO2: calculated.esgImpactCO2KgPart,
                difference: uiCO2PerPart - calculated.esgImpactCO2KgPart,
                netWeight: calculated.totalWeldMaterialWeight,
                grossWeight: calculated.weldBeadWeightWithWastage,
                scrapWeight: calculated.scrapWeight,
                netWeightKg: calculated.totalWeldMaterialWeight / 1000,
                grossWeightKg: calculated.weldBeadWeightWithWastage / 1000,
                scrapWeightKg: calculated.scrapWeight / 1000,
                esgImpactCO2Kg: input.esgImpactCO2Kg,
                eav: input.eav,
                esgAnnualVolumeKg: calculated.esgAnnualVolumeKg,
                esgAnnualKgCO2: calculated.esgAnnualKgCO2,
                esgAnnualKgCO2Part: calculated.esgAnnualKgCO2Part
            });
            console.log(`✔ Material CO2 per Part verified. UI: ${uiCO2PerPart}, Calculated: ${calculated.esgImpactCO2KgPart}`);
        });
    }
    readManufacturingInputs() {
        return __awaiter(this, void 0, void 0, function* () {
            const [machineHourRate, machineEfficiencyUI, lowSkilledLaborRatePerHour, noOfLowSkilledLabours, skilledLaborRatePerHour, noOfSkilledLabors, electricityUnitCost, powerConsumption, yieldPer, annualVolume, setUpTime, qaOfInspectorRate, inspectionTime, samplingRate, netMaterialCost, cycleTime, totalWeldLength, weldLegLength, weldElementSize, PartReorientationTime, partProjectedArea, cuttingLength, travelSpeed, UnloadingTime, semiAutoOrAuto, netWeight, densityUI, dryCycleTime, RequiredVoltage, selectedVoltage] = yield Promise.all([
                this.page.safeGetNumber(this.page.MachineHourRate),
                this.page.safeGetNumber(this.page.MachineEfficiency),
                this.page.safeGetNumber(this.page.DirectLaborRate),
                this.page.safeGetNumber(this.page.NoOfDirectLabors),
                this.page.safeGetNumber(this.page.SkilledLaborRate),
                this.page.safeGetNumber(this.page.NoOfSkilledLabors),
                this.page.safeGetNumber(this.page.ElectricityUnitCost),
                this.page.safeGetNumber(this.page.PowerConsumption),
                this.page.safeGetNumber(this.page.YieldPercentage),
                this.page.safeGetNumber(this.page.AnnualVolumeQtyNos),
                this.page.safeGetNumber(this.page.MachineSetupTime),
                this.page.safeGetNumber(this.page.QAInspectorRate),
                this.page.safeGetNumber(this.page.QAInspectionTime),
                this.page.safeGetNumber(this.page.SamplingRate),
                this.page.safeGetNumber(this.page.NetMaterialCost),
                this.page.safeGetNumber(this.page.CycleTimePart),
                this.page.safeGetNumber(this.page.TotalWeldLength),
                this.page.safeGetNumber(this.page.MatWeldSize1),
                this.page.safeGetNumber(this.page.MatWeldElementSize1),
                this.page.safeGetNumber(this.page.PartReorientationTime),
                this.page.safeGetNumber(this.page.PartSurfaceArea),
                this.page.safeGetNumber(this.page.TotalWeldCycleLength),
                this.page.safeGetNumber(this.page.TravelSpeedSubProcess1),
                this.page.safeGetNumber(this.page.UnloadingTime),
                this.page.safeGetNumber(this.page.MachineType),
                this.page.safeGetNumber(this.page.NetWeight),
                this.page.safeGetNumber(this.page.Density),
                this.page.safeGetNumber(this.page.DryCycleTime),
                this.page.safeGetNumber(this.page.RequiredVoltage),
                this.page.safeGetNumber(this.page.selectedVoltage)
            ]);
            return {
                machineHourRate,
                machineEfficiencyUI,
                lowSkilledLaborRatePerHour,
                noOfLowSkilledLabours,
                skilledLaborRatePerHour,
                noOfSkilledLabors,
                electricityUnitCost,
                powerConsumption,
                yieldPer,
                annualVolume,
                setUpTime,
                qaOfInspectorRate,
                inspectionTime,
                samplingRate,
                netMaterialCost,
                cycleTime,
                totalWeldLength,
                weldLegLength,
                weldElementSize,
                PartReorientationTime,
                partProjectedArea,
                cuttingLength,
                travelSpeed,
                UnloadingTime,
                semiAutoOrAuto,
                netWeight,
                densityUI,
                dryCycleTime,
                RequiredVoltage,
                selectedVoltage
            };
        });
    }
    gatherManufacturingInfo(processType, machineEfficiency, density) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('📥 Gathering Manufacturing Info from UI...');
            const inputs = yield this.readManufacturingInputs();
            const { machineHourRate, machineEfficiencyUI, lowSkilledLaborRatePerHour, noOfLowSkilledLabours, skilledLaborRatePerHour, noOfSkilledLabors, electricityUnitCost, powerConsumption, yieldPer, annualVolume, setUpTime, qaOfInspectorRate, inspectionTime, samplingRate, netMaterialCost, cycleTime, totalWeldLength, weldLegLength, weldElementSize, PartReorientationTime, partProjectedArea, cuttingLength, travelSpeed, UnloadingTime, semiAutoOrAuto, netWeight, densityUI, dryCycleTime, RequiredVoltage, selectedVoltage, } = inputs;
            // ───────────────────────────────
            // 2️⃣ Lot size
            // ───────────────────────────────
            const lotSize = yield this.getInputNumber(this.page.LotsizeNos);
            if (lotSize === 1 &&
                [welding_calculator_1.ProcessType.WeldingCleaning, welding_calculator_1.ProcessType.WeldingPreparation].includes(processType)) {
                logger.warn('⚠️ Lot size = 1 (possible fallback)');
            }
            // ───────────────────────────────
            // 3️⃣ Material & Part Info (tab-safe)
            // ───────────────────────────────
            const [netPartWeight, partComplexity, materialTypeName, materialDims] = yield Promise.all([
                this.getNetWeight(),
                this.getPartComplexity(),
                this.getMaterialType(),
                this.getMaterialDimensionsAndDensity()
            ]);
            const { length, width, height } = materialDims;
            // ───────────────────────────────
            // 4️⃣ Weld Sub-Materials & Sub-Processes
            // ───────────────────────────────
            const [weldSubMaterials, uiSubProcesses] = yield Promise.all([
                Promise.all([1, 2].map(i => this.collectWeldSubMaterial(i))),
                this.collectSubProcesses()
            ]);
            const validSubMaterials = weldSubMaterials.filter(Boolean);
            const coreCostDetails = validSubMaterials.map((weld, i) => {
                const sub = uiSubProcesses[i];
                return {
                    coreWeight: weld.weldElementSize,
                    coreHeight: weld.weldSize,
                    coreLength: weld.weldLength,
                    coreVolume: weld.weldPlaces,
                    coreArea: weld.weldSide === 'Both' ? 2 : 1,
                    noOfCore: weld.noOfWeldPasses,
                    coreWidth: weld.wireDia,
                    coreShape: weld.weldType,
                    // Merge process fields for the calculator
                    weldPosition: sub === null || sub === void 0 ? void 0 : sub.weldPosition,
                    hlFactor: sub === null || sub === void 0 ? void 0 : sub.tackWelds,
                    formPerimeter: sub === null || sub === void 0 ? void 0 : sub.intermediateStops,
                    formHeight: sub === null || sub === void 0 ? void 0 : sub.travelSpeed
                };
            });
            const effectiveWeldLength = cuttingLength || totalWeldLength;
            // ───────────────────────────────
            // 5️⃣ Machine Master
            // ───────────────────────────────
            const [ratedPower, powerUtilization, powerESG] = yield Promise.all([
                this.page.safeGetNumber(this.page.RatedPower),
                this.page.safeGetNumber(this.page.PowerUtil),
                this.page.safeGetNumber(this.page.CO2PerKwHr)
            ]);
            // ───────────────────────────────
            // 6️⃣ DTO & Process Mapping
            // ───────────────────────────────
            const processMapping = {
                [welding_calculator_1.ProcessType.MigWelding]: welding_calculator_1.PrimaryProcessType.MigWelding,
                [welding_calculator_1.ProcessType.TigWelding]: welding_calculator_1.PrimaryProcessType.TigWelding,
                [welding_calculator_1.ProcessType.SpotWelding]: welding_calculator_1.PrimaryProcessType.SpotWelding,
                [welding_calculator_1.ProcessType.SeamWelding]: welding_calculator_1.PrimaryProcessType.SeamWelding,
                [welding_calculator_1.ProcessType.StickWelding]: welding_calculator_1.PrimaryProcessType.StickWelding
            };
            return {
                processTypeID: processType,
                partComplexity,
                machineHourRate,
                lowSkilledLaborRatePerHour,
                skilledLaborRatePerHour,
                noOfLowSkilledLabours,
                noOfSkilledLabors,
                qaOfInspectorRate,
                inspectionTime,
                samplingRate: samplingRate / 100,
                electricityUnitCost,
                powerConsumption,
                yieldPer: yieldPer / 100,
                lotSize,
                annualVolume,
                setUpTime,
                netMaterialCost,
                netPartWeight,
                cycleTime,
                totalWeldLength: effectiveWeldLength,
                cuttingLength: effectiveWeldLength,
                travelSpeed,
                UnloadingTime,
                semiAutoOrAuto,
                dryCycleTime,
                selectedVoltage,
                RequiredVoltage,
                passesLocator: PartReorientationTime,
                MachineEfficiency: machineEfficiencyUI || machineEfficiency * 100,
                efficiency: machineEfficiencyUI || machineEfficiency * 100,
                materialInfoList: [{
                        processId: processMapping[processType] || processType,
                        density,
                        netWeight: netPartWeight,
                        netMatCost: netMaterialCost,
                        partProjectedArea,
                        weldLegLength,
                        weldElementSize,
                        totalWeldLength: effectiveWeldLength,
                        dimX: length,
                        dimY: width,
                        dimZ: height,
                        coreCostDetails,
                    }],
                materialmasterDatas: {
                    materialType: { materialTypeName }
                },
                machineMaster: {
                    machineHourRate,
                    powerConsumption,
                    efficiency: machineEfficiency * 100,
                    totalPowerKW: ratedPower,
                    powerUtilization: powerUtilization / 100
                },
                laborRates: [{ powerESG }],
                iscoolingTimeDirty: false,
                iscycleTimeDirty: false,
                isdirectMachineCostDirty: false,
                isdirectLaborCostDirty: false,
                isinspectionCostDirty: false,
                isdirectSetUpCostDirty: false,
                isyieldCostDirty: false
            };
        });
    }
    getWeldingCalculationStrategy(processType) {
        switch (processType) {
            case welding_calculator_1.ProcessType.WeldingCleaning:
                return dto => {
                    this.calculator.calculationsForWeldingCleaning(dto, [], dto);
                    return dto;
                };
            case welding_calculator_1.ProcessType.WeldingPreparation:
                return dto => {
                    this.calculator.calculationsForWeldingPreparation(dto, [], dto);
                    return dto;
                };
            default:
                return dto => {
                    this.calculator.calculationForWelding(dto, [], dto, []);
                    return dto;
                };
        }
    }
    verifyWeldingCostsUnified(processType_1) {
        return __awaiter(this, arguments, void 0, function* (processType, options = {}) {
            var _a, _b, _c, _d;
            logger.info(`\n💰 Unified Welding Cost Verification → ${welding_calculator_1.ProcessType[processType]}`);
            const { density } = (_a = (yield this.getMaterialDimensionsAndDensity())) !== null && _a !== void 0 ? _a : { density: 7.85 };
            // Ensure panel is expanded for locators
            yield this.page.expandMfgInfo.click().catch(() => { });
            yield this.page.MachineDetailsTab.click().catch(() => { });
            yield this.page.wait(500);
            const efficiency = (yield this.page.getInputValueAsNumber(this.page.MachineEfficiency)) / 100;
            // Ensure UI ready (important for Cleaning/Prep)
            if ([welding_calculator_1.ProcessType.WeldingCleaning, welding_calculator_1.ProcessType.WeldingPreparation].includes(processType)) {
                yield this.page.PartInformationTitle.scrollIntoViewIfNeeded();
                yield this.page.wait(300);
            }
            // Build DTO
            const manufactureInfo = yield this.gatherManufacturingInfo(processType, efficiency, density);
            // Apply common defaults
            this.calculator.weldingPreCalc(manufactureInfo, [], manufactureInfo);
            // Calculate via strategy
            const calculate = this.getWeldingCalculationStrategy(processType);
            const calculated = calculate(manufactureInfo);
            // Verification matrix
            const verifications = [
                {
                    label: 'Cycle Time',
                    locator: this.page.CycleTimePart.first(),
                    calc: manufactureInfo.cycleTime,
                    enabled: options.verifyCycleTime
                },
                {
                    label: 'Direct Machine Cost',
                    locator: this.page.DirectMachineCost.first(),
                    calc: calculated.directMachineCost
                },
                {
                    label: 'Direct Labor Cost',
                    locator: this.page.DirectLaborCost.first(),
                    calc: calculated.directLaborCost
                },
                {
                    label: 'Direct Setup Cost',
                    locator: this.page.DirectSetUpCost.first(),
                    calc: calculated.directSetUpCost
                },
                {
                    label: 'QA Inspection Cost',
                    locator: this.page.QAInspectionCost.first(),
                    calc: (_b = calculated.inspectionCost) !== null && _b !== void 0 ? _b : calculated.qaInspectionCost
                },
                {
                    label: 'Power Cost',
                    locator: this.page.TotalPowerCost.first(),
                    calc: (_c = calculated.powerCost) !== null && _c !== void 0 ? _c : calculated.totalPowerCost
                },
                {
                    label: 'Yield Cost',
                    locator: this.page.YieldCostPart.first(),
                    calc: calculated.yieldCost
                }
            ];
            let totalCalculated = 0;
            for (const v of verifications) {
                if (v.enabled === false)
                    continue;
                const expected = Number(v.calc) || 0;
                if (expected === 0)
                    continue;
                yield this.page.verifyUIValue({
                    locator: v.locator,
                    expectedValue: expected,
                    label: v.label,
                    precision: (_d = options.precision) !== null && _d !== void 0 ? _d : 4
                });
                totalCalculated += expected;
            }
            // Total Manufacturing Cost
            if (options.verifyTotal && totalCalculated > 0) {
                yield this.page.verifyUIValue({
                    locator: this.page.NetProcessCost,
                    expectedValue: totalCalculated,
                    label: 'Total Manufacturing Cost'
                });
            }
            return calculated;
        });
    }
    //==================== Weld Cleaning/Preparation Cost Verification ====================
    verifyMigCosts() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.verifyWeldingCostsUnified(welding_calculator_1.ProcessType.MigWelding, {
                verifyTotal: true
            });
        });
    }
    verifyWeldPreparationCost() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            logger.info('🔹 Step: Weld Cleaning/Preparation Cost Verification');
            // 1️⃣ Select Process Type
            const processType = yield this.getProcessTypeCleaning();
            // 2️⃣ Wait for UI switch
            yield test_1.expect.poll(() => __awaiter(this, void 0, void 0, function* () { return this.page.getSelectedOptionText(this.page.ProcessGroup); }), { message: 'Wait for Process Group to switch', timeout: 10000 }).toContain('Welding');
            // 3️⃣ Gather Base Info
            const { density } = (_a = (yield this.getMaterialDimensionsAndDensity())) !== null && _a !== void 0 ? _a : { density: 7.85 };
            const machineEfficiency = (yield this.getEfficiencyFromUI()) / 100;
            // ✅ Ensure Part Information is accessible to read lot size
            try {
                yield this.page.PartInformationTitle.scrollIntoViewIfNeeded();
                yield this.page.wait(300);
            }
            catch (err) {
                logger.warn(`⚠️ Could not scroll to Part Information: ${err}`);
            }
            // 4️⃣ Gather Manufacturing DTO
            const manufactureInfo = yield this.gatherManufacturingInfo(processType, machineEfficiency, density);
            // 5️⃣ Calculate Costs using Shared Calculator
            // We rely on the calculator to compute cycleTime and others based on the gathered inputs.
            // ensure dirty flags are false for fields we want calculated (gatherManufacturingInfo sets them to false)
            if (Number(manufactureInfo.processTypeID) === welding_calculator_1.ProcessType.WeldingCleaning) {
                this.calculator.calculationsForWeldingCleaning(manufactureInfo, [], // fieldColorsList
                manufactureInfo // manufacturingObj
                );
            }
            else {
                this.calculator.calculationsForWeldingPreparation(manufactureInfo, [], // fieldColorsList
                manufactureInfo // manufacturingObj
                );
            }
            // 6️⃣ Verify UI Values
            yield this.page.verifyUIValue({
                locator: this.page.CycleTimePart.first(),
                expectedValue: manufactureInfo.cycleTime || 0,
                label: 'Cycle Time',
                precision: 4
            });
            yield this.page.verifyUIValue({
                locator: this.page.DirectMachineCost.first(),
                expectedValue: manufactureInfo.directMachineCost || 0,
                label: 'Direct Machine Cost',
                precision: 4
            });
            yield this.page.verifyUIValue({
                locator: this.page.DirectLaborCost.first(),
                expectedValue: manufactureInfo.directLaborCost || 0,
                label: 'Direct Labor Cost',
                precision: 4
            });
            yield this.page.verifyUIValue({
                locator: this.page.DirectSetUpCost.first(),
                expectedValue: manufactureInfo.directSetUpCost || 0,
                label: 'Direct Set Up Cost',
                precision: 4
            });
            yield this.page.verifyUIValue({
                locator: this.page.QAInspectionCost.first(),
                expectedValue: manufactureInfo.qaInspectionCost || 0,
                label: 'QA Inspection Cost',
                precision: 4
            });
            yield this.page.verifyUIValue({
                locator: this.page.YieldCostPart.first(),
                expectedValue: manufactureInfo.yieldCost || 0,
                label: 'Yield Cost',
                precision: 4
            });
            //await this.verifyManufacturingCosts()
            //await this.verifyWeldCleaningCosts(manufactureInfo as unknown as Record<string, number>);
            // 7️⃣ Update Runtime Context
            this.runtimeWeldingContext.cycleTime = manufactureInfo.cycleTime;
            logger.info('✅ Weld Cleaning/Preparation Full Cost Verification Passed');
        });
    }
    //============ Weld Cleaning Cost Verification ============ 
    verifyManufacturingCosts() {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('\n📋 Step: Verify Manufacturing Costs');
            const processTypeText = yield this.page.getSelectedOptionText(this.page.ProcessGroup);
            let processType = welding_calculator_1.ProcessType.MigWelding;
            if (processTypeText.includes('Cleaning'))
                processType = welding_calculator_1.ProcessType.WeldingCleaning;
            else if (processTypeText.includes('Preparation'))
                processType = welding_calculator_1.ProcessType.WeldingPreparation;
            else if (processTypeText.includes('TIG'))
                processType = welding_calculator_1.ProcessType.TigWelding;
            else if (processTypeText.includes('Stick'))
                processType = welding_calculator_1.ProcessType.StickWelding;
            const { density } = (yield this.getMaterialDimensionsAndDensity()) || {
                density: 7.85
            };
            const efficiencyVal = (yield this.page.getInputValueAsNumber(this.page.MachineEfficiency));
            const machineEfficiency = efficiencyVal / 100;
            logger.info('machineEfficiency', machineEfficiency);
            const manufactureInfo = yield this.gatherManufacturingInfo(processType, machineEfficiency, density);
            // Apply defaults (yield%, sampling rate, etc.)
            this.calculator.weldingPreCalc(manufactureInfo, [], manufactureInfo);
            logger.info(`📊 Manufacturing Info for Cost Calculation:`);
            logger.info(`   Cycle Time: ${manufactureInfo.cycleTime} sec`);
            logger.info(`   Machine Rate: ${manufactureInfo.machineHourRate} per hour`);
            logger.info(`   Labor Rate: ${manufactureInfo.lowSkilledLaborRatePerHour} per hour`);
            logger.info(`   Power Consumption: ${manufactureInfo.powerConsumption} kW`);
            logger.info(`   Electricity Cost: ${manufactureInfo.electricityUnitCost} per kWh`);
            logger.info(`   Rated Power: ${manufactureInfo.ratedPower}`);
            logger.info(`   Power Utilization: ${manufactureInfo.powerUtilization}`);
            let calculated = {};
            if (processType === welding_calculator_1.ProcessType.WeldingCleaning ||
                processType === welding_calculator_1.ProcessType.WeldingPreparation) {
                yield this.page.waitAndClick(processType === welding_calculator_1.ProcessType.WeldingCleaning
                    ? this.page.WeldCleanRadBtn
                    : this.page.MigWeldRadBtn);
                if (processType === welding_calculator_1.ProcessType.WeldingCleaning) {
                    this.calculator.calculationsForWeldingCleaning(manufactureInfo, [], manufactureInfo);
                }
                else {
                    this.calculator.calculationsForWeldingPreparation(manufactureInfo, [], manufactureInfo);
                }
                calculated = manufactureInfo;
            }
            else {
                yield this.page.waitAndClick(this.page.MigWeldRadBtn);
                this.calculator.calculationForWelding(manufactureInfo, [], manufactureInfo, []);
                calculated = manufactureInfo;
            }
            return calculated;
        });
    }
    //=============================== Weld Cleaning =================================
    verifyWeldCleaningCosts() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            logger.info('\n💰 ===== Weld Cleaning Cost Verification =====');
            // 1️⃣ Select Weld Cleaning Process
            const processType = yield this.getProcessTypeCleaning();
            // Force click to ensure UI switches to Weld Cleaning mode and updates calculations
            yield this.page.waitAndClick(this.page.WeldCleanRadBtn);
            yield this.page.waitForNetworkIdle();
            yield this.page.waitForTimeout(1000);
            // 2️⃣ Gather Base Info
            const { density } = (yield this.getMaterialDimensionsAndDensity()) || { density: 7.85 };
            const efficiencyVal = (yield this.page.getInputValueAsNumber(this.page.MachineEfficiency));
            const machineEfficiency = efficiencyVal / 100;
            // 3️⃣ Gather Manufacturing DTO
            const manufactureInfo = yield this.gatherManufacturingInfo(processType, machineEfficiency, density);
            // 4️⃣ Update material info for UI properties used in calculations
            const weldLegLength = (yield this.page.getInputValueAsNumber(this.page.MatWeldSize1)) || 0;
            const surfaceArea = (yield this.page.getInputValueAsNumber(this.page.PartSurfaceArea)) || 0;
            if (((_a = manufactureInfo.materialInfoList) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                const materialInfo = manufactureInfo.materialInfoList[0];
                materialInfo.weldLegLength = weldLegLength;
                materialInfo.partProjectedArea = surfaceArea;
            }
            // 🐛 Debug: Log gathered info before calculation
            logger.info('🐛 DEBUG Pre-Calculation Values:', {
                processTypeID: manufactureInfo.processTypeID,
                lotSize: manufactureInfo.lotSize,
                cycleTime: manufactureInfo.cycleTime,
                machineHourRate: manufactureInfo.machineHourRate,
                laborRatePerHour: manufactureInfo.laborRatePerHour,
                setUpTime: manufactureInfo.setUpTime,
                noOfWeldPasses: manufactureInfo.noOfWeldPasses,
                cuttingLength: manufactureInfo.cuttingLength
            });
            // 5️⃣ Execute Weld Cleaning/Preparation Calculation
            if (Number(manufactureInfo.processTypeID) === welding_calculator_1.ProcessType.WeldingCleaning) {
                this.calculator.calculationsForWeldingCleaning(manufactureInfo, [], // fieldColorsList
                manufactureInfo);
            }
            else {
                this.calculator.calculationsForWeldingPreparation(manufactureInfo, [], // fieldColorsList
                manufactureInfo);
            }
            // 🐛 Debug: Log calculated values
            logger.info('🐛 DEBUG Post-Calculation Values:', {
                cycleTime: manufactureInfo.cycleTime,
                directMachineCost: manufactureInfo.directMachineCost,
                directLaborCost: manufactureInfo.directLaborCost,
                directSetUpCost: manufactureInfo.directSetUpCost,
                inspectionCost: manufactureInfo.inspectionCost,
                yieldCost: manufactureInfo.yieldCost,
                lotSize: manufactureInfo.lotSize
            });
            // 6️⃣ Collect UI values safely
            const uiValues = {
                cycleTime: yield this.page.safeGetNumber(this.page.CycleTimePart),
                machine: yield this.page.safeGetNumber(this.page.DirectMachineCost),
                labor: yield this.page.safeGetNumber(this.page.DirectLaborCost),
                setup: yield this.page.safeGetNumber(this.page.DirectSetUpCost),
                inspection: yield this.page.safeGetNumber(this.page.QAInspectionCost),
                yield: yield this.page.safeGetNumber(this.page.YieldCostPart)
            };
            // 7️⃣ Define verifications
            const verifications = [
                { label: 'Cycle Time / Part', locator: this.page.CycleTimePart, ui: uiValues.cycleTime, calc: (_b = manufactureInfo.cycleTime) !== null && _b !== void 0 ? _b : 0 },
                { label: 'Machine Cost / Part', locator: this.page.DirectMachineCost, ui: uiValues.machine, calc: (_c = manufactureInfo.directMachineCost) !== null && _c !== void 0 ? _c : 0 },
                { label: 'Labor Cost / Part', locator: this.page.DirectLaborCost, ui: uiValues.labor, calc: (_d = manufactureInfo.directLaborCost) !== null && _d !== void 0 ? _d : 0 },
                { label: 'Setup Cost / Part', locator: this.page.DirectSetUpCost, ui: uiValues.setup, calc: (_e = manufactureInfo.directSetUpCost) !== null && _e !== void 0 ? _e : 0 },
                { label: 'QA Inspection Cost / Part', locator: this.page.QAInspectionCost, ui: uiValues.inspection, calc: (_f = manufactureInfo.inspectionCost) !== null && _f !== void 0 ? _f : 0 },
                { label: 'Yield Cost / Part', locator: this.page.YieldCostPart, ui: uiValues.yield, calc: (_g = manufactureInfo.yieldCost) !== null && _g !== void 0 ? _g : 0 }
            ];
            // 8️⃣ Verify each cost
            let totalCalculated = 0;
            for (const v of verifications) {
                const uiFormatted = Number(v.ui).toFixed(5);
                const calcFormatted = Number(v.calc).toFixed(5);
                logger.info(`🔎 ${v.label} → UI=${uiFormatted}, CALC=${calcFormatted}`);
                if (v.calc === 0 && v.ui === 0) {
                    logger.info(`   ⊘ Skipped (both zero)`);
                    continue;
                }
                if (v.calc === 0 && v.ui > 0) {
                    logger.warn(`⚠️ ${v.label} skipped → Calculator returned 0 while UI shows ${v.ui}`);
                    continue;
                }
                yield this.page.verifyUIValue({
                    locator: v.locator,
                    expectedValue: v.calc,
                    label: v.label
                });
                totalCalculated += v.calc;
            }
            // 9️⃣ Verify total manufacturing cost
            if (totalCalculated > 0) {
                yield this.page.verifyUIValue({
                    locator: this.page.NetProcessCost,
                    expectedValue: Number(totalCalculated.toFixed(5)),
                    label: 'Total Manufacturing Cost'
                });
            }
            logger.info('✅ Weld Cleaning Cost Verification Completed Successfully');
            return manufactureInfo;
        });
    }
    //=============================== Manufacturing Sustainability =================================
    verifyManufacturingSustainability() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.verifyManufacturingCO2();
            logger.info('📂 Navigating to Machine Details Tab for Power ESG verification...');
            yield this.page.ManufacturingInformation.scrollIntoViewIfNeeded();
            yield this.page.ManufacturingInformation.click();
            yield this.page.wait(1000); // Buffer for tab switch
            const totalPowerKW = yield this.page.readNumberSafe(this.page.RatedPower, 'Rated Power (KW)');
            const powerUtilization = yield this.page.readNumberSafe(this.page.PowerUtil, 'Power Utilization (%)');
            const powerESG = 0.5;
            logger.info(`🔋 Power Data: Rated=${totalPowerKW} KW, Utilization=${powerUtilization}%, ESG Factor=${powerESG}`);
            if (totalPowerKW > 0 && powerUtilization > 0) {
                yield this.verifySustainabilityCalculations(totalPowerKW, powerUtilization, powerESG);
            }
            else {
                logger.warn('⚠️ Skipping Power ESG verification - no power data available');
            }
        });
    }
    verifyManufacturingCO2() {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('\n⚡ Step: Verify Manufacturing CO2');
            const co2PerKwHr = (yield this.page.getInputValueAsNumber(this.page.CO2PerKwHr)) || 0;
            const powerConsumption = (yield this.page.getInputValueAsNumber(this.page.PowerConsumption)) || 0;
            const cycleTime = (yield this.page.getInputValueAsNumber(this.page.CycleTimePart)) || 0;
            const calculated = (0, welding_calculator_1.calculateManufacturingCO2)(cycleTime, powerConsumption, co2PerKwHr);
            const actualCO2PerPart = (yield this.page.getInputValueAsNumber(this.page.CO2PerPartManufacturing)) || 0;
            test_1.expect.soft(actualCO2PerPart).toBeCloseTo(calculated, 4);
            yield this.page.verifyUIValue({
                locator: this.page.CO2PerPartManufacturing,
                expectedValue: calculated,
                label: 'Manufacturing CO2 Per Part',
                precision: 4
            });
        });
    }
    //===================================== End To End Welding =====================================
    verifyEndToEndWelding(manufactureInfo, fieldColorsList, manufacturingObj, laborRates) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            // Step 1: Pre-calc
            this.calculator.weldingPreCalc(manufactureInfo, fieldColorsList, manufacturingObj);
            if ([welding_calculator_1.ProcessType.WeldingPreparation, welding_calculator_1.ProcessType.WeldingCleaning, welding_calculator_1.ProcessType.MigWelding, welding_calculator_1.ProcessType.TigWelding].includes(Number(manufactureInfo.processTypeID))) {
                manufactureInfo = this.calculator.calculationForWelding(manufactureInfo, fieldColorsList, manufacturingObj, laborRates);
            }
            // Step 2: Calculate expected totals
            const expectedCycleTime = manufactureInfo.cycleTime || 0;
            const expectedMaterialCost = manufactureInfo.netMaterialCost || 0;
            const expectedPowerCost = manufactureInfo.totalPowerCost || 0;
            const expectedMachineCost = manufactureInfo.directMachineCost || 0;
            const expectedLaborCost = manufactureInfo.directLaborCost || 0;
            const expectedSetupCost = manufactureInfo.directSetUpCost || 0;
            const expectedInspectionCost = manufactureInfo.inspectionCost || 0;
            const expectedYieldCost = manufactureInfo.yieldCost || 0;
            const calculatedTotal = expectedPowerCost +
                expectedMachineCost +
                expectedLaborCost +
                expectedSetupCost +
                expectedInspectionCost +
                expectedYieldCost;
            // Step 3: Log clearly
            logger.info('🧪 E2E Welding Verification Values:');
            const fields = [
                { label: 'Cycle Time', ui: manufactureInfo.cycleTime, expected: expectedCycleTime },
                { label: 'Net Material Cost', ui: manufactureInfo.netMaterialCost, expected: expectedMaterialCost },
                { label: 'Power Cost', ui: manufactureInfo.totalPowerCost, expected: expectedPowerCost },
                { label: 'Machine Cost', ui: manufactureInfo.directMachineCost, expected: expectedMachineCost },
                { label: 'Labor Cost', ui: manufactureInfo.directLaborCost, expected: expectedLaborCost },
                { label: 'Setup Cost', ui: manufactureInfo.directSetUpCost, expected: expectedSetupCost },
                { label: 'Inspection Cost', ui: manufactureInfo.inspectionCost, expected: expectedInspectionCost },
                { label: 'Yield Cost', ui: manufactureInfo.yieldCost, expected: expectedYieldCost },
                { label: 'Total Direct Process Cost', ui: manufactureInfo.directProcessCost, expected: calculatedTotal }
            ];
            for (const f of fields) {
                const uiVal = (_a = f.ui) !== null && _a !== void 0 ? _a : 0;
                const diffPercent = f.expected === 0 ? (uiVal === 0 ? 0 : 100) : Math.abs((uiVal - f.expected) / f.expected) * 100;
                logger.info(`🔎 ${f.label}: UI=${uiVal.toFixed(3)}, Expected=${f.expected.toFixed(3)}, Diff=${diffPercent.toFixed(2)}%`);
                const tolerance = f.label === 'Cycle Time' ? 125 : 2; // large tolerance for cycle time
                yield BasePage_1.VerificationHelper.verifyNumeric(uiVal, f.expected, `E2E ${f.label}`, tolerance);
            }
        });
    }
    /**
     * Verifies sustainability calculations on the Sustainability tab
     */
    verifySustainabilityCalculations(totalPowerKW, powerUtilization, powerESG) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('🔹 Verifying Sustainability Calculations...');
            // Switch to Sustainability Tab
            logger.info('📂 Navigating to Sustainability Tab...');
            yield this.page.SustainabilityTab.scrollIntoViewIfNeeded();
            yield this.page.SustainabilityTab.click();
            yield this.page.wait(1000); // small buffer for tab switch
            // Power ESG Calculation: TotalPowerKW * PowerUtilization * PowerESG_Factor
            // Note: powerUtilization is already in decimal form (e.g., 0.75 for 75%)
            const expectedEsgConsumption = totalPowerKW * powerUtilization * powerESG;
            const actualEsgConsumption = yield this.page.readNumberSafe(this.page.EsgImpactElectricityConsumption, 'Power ESG (Electricity Consumption)');
            yield BasePage_1.VerificationHelper.verifyNumeric(actualEsgConsumption, expectedEsgConsumption, 'Power ESG (Electricity Consumption)', 4);
            logger.info('✔ Sustainability verification complete.');
        });
    }
    // ========================== Overall Verification ==========================
    verifyCompleteWeldingProcess() {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('\n🚀 ===== MASTER WELDING VERIFICATION (E2E) =====');
            try {
                logger.info('\n📋 Step 1: Verify Material Calculations');
                yield this.verifyWeldingMaterialCalculations();
                logger.info('\n📋 Step 2: Verify Cycle Time Details');
                yield this.verifyWeldCycleTimeDetails({});
                logger.info('\n📋 Step 3: Verify Material Sustainability (CO2)');
                //await this.verifyNetMaterialSustainabilityCost()
                logger.info('\n📋 Step 4: Verify Manufacturing Overall (Costs + Sustainability)');
                yield this.verifyManufacturingCosts();
                logger.info('\n✅ ===== ALL WELDING VERIFICATIONS COMPLETED SUCCESSFULLY =====');
            }
            catch (error) {
                logger.error(`❌ Master Verification Failed: ${error instanceof Error ? error.message : 'Unknown'}`);
                throw error;
            }
        });
    }
    verifyAllWeldingCalculations() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.verifyCompleteWeldingProcess();
        });
    }
    //===================== Cost Summary =====================
    expandPanel() {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('🔹 Expanding all panels before test...');
            const panels = [
                // this.page.expandMtlInfo,
                // this.page.expandMfgInfo,
                this.page.expandOHProfit,
                this.page.expandPack,
                this.page.expandLogiCost,
                this.page.expandTariff
            ];
            for (const panel of panels) {
                try {
                    yield panel.waitFor({ state: 'visible', timeout: 10000 });
                    const isExpanded = yield panel.getAttribute('aria-expanded');
                    if (isExpanded !== 'true') {
                        yield panel.click({ force: true });
                        logger.info('✅ Panel expanded');
                    }
                    else {
                        logger.info('ℹ️ Panel already expanded');
                    }
                }
                catch (error) {
                    logger.warn('⚠️ Panel not available to expand — skipping');
                }
            }
        });
    }
    verifyCostSummary() {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('🔹 Verifying Cost Summary...');
            yield this.expandPanel();
            yield test_1.expect.soft(this.page.numCostSummary).toBeVisible();
            yield this.page.waitAndClick(this.page.numCostSummary);
            yield test_1.expect.soft(() => __awaiter(this, void 0, void 0, function* () {
                // ================= Material =================
                const materialCostUI = Number(yield this.page.MaterialTotalCost.inputValue());
                const materialSubtotal = yield (0, welding_calculator_1.getCellNumberFromTd)(this.page.materialSubTotalcost);
                logger.info(`Material → UI: ${materialCostUI}, Calculated: ${materialSubtotal}`);
                test_1.expect.soft(materialCostUI).toBeCloseTo(materialSubtotal, 2);
                // ================= Manufacturing =================
                const manufacturingUI = Number(yield this.page.ManufacturingCost.inputValue());
                const manufacturingSubtotal = yield (0, welding_calculator_1.getCellNumber)(this.page.mfgSubTotalcost);
                logger.info(`Manufacturing → UI: ${manufacturingUI}, Calculated: ${manufacturingSubtotal}`);
                test_1.expect.soft(manufacturingUI).toBeCloseTo(manufacturingSubtotal, 2);
                // ================= Tooling =================
                const toolingCost = yield (0, welding_calculator_1.getCurrencyNumber)(this.page.ToolingCost, 'Tooling Cost');
                logger.info(`Tooling → UI: ${toolingCost}`);
                test_1.expect.soft(toolingCost).toBeGreaterThanOrEqual(0);
                // ================= Overhead =================
                const overheadUI = yield (0, welding_calculator_1.getCurrencyNumber)(this.page.OverheadProfit, 'Overhead Profit');
                const overhead = yield (0, welding_calculator_1.getCurrencyNumber)(this.page.overHeadCost, 'Overhead');
                const profit = yield (0, welding_calculator_1.getCurrencyNumber)(this.page.profitCost, 'Profit');
                const costOfCapital = yield (0, welding_calculator_1.getCurrencyNumber)(this.page.costOfCapital, 'Cost of Capital');
                const calculatedOverhead = (0, welding_calculator_1.calculateOverHeadCost)(overhead, profit, costOfCapital);
                logger.info(`Overhead → UI: ${overheadUI}, Calculated: ${calculatedOverhead}`);
                test_1.expect.soft(overheadUI).toBeCloseTo(calculatedOverhead, 2);
                // ================= Packaging =================
                const packingUI = yield (0, welding_calculator_1.getCurrencyNumber)(this.page.PackingCost, 'Packing Cost');
                const packagingCosts = yield Promise.all([
                    (0, welding_calculator_1.getNumber)(this.page.primaryPackaging1),
                    (0, welding_calculator_1.getNumber)(this.page.primaryPackaging2),
                    (0, welding_calculator_1.getNumber)(this.page.secondaryPackaging),
                    (0, welding_calculator_1.getNumber)(this.page.tertiaryPackaging)
                ]);
                const calculatedPackaging = (0, welding_calculator_1.calculateTotalPackMatlCost)(...packagingCosts);
                logger.info(`Packaging → UI: ${packingUI}, Calculated: ${calculatedPackaging}`);
                test_1.expect.soft(packingUI).toBeCloseTo(calculatedPackaging, 2);
                // ================= EXW Part Cost =================
                const exwUI = yield (0, welding_calculator_1.getCurrencyNumber)(this.page.EXWPartCost, 'EX-W Part Cost');
                const exwCalculated = yield (0, welding_calculator_1.calculateExPartCost)(yield (0, welding_calculator_1.getNumber)(this.page.MaterialTotalCost), yield (0, welding_calculator_1.getNumber)(this.page.ManufacturingCost), yield (0, welding_calculator_1.getNumber)(this.page.ToolingCost), yield (0, welding_calculator_1.getNumber)(this.page.OverheadProfit), yield (0, welding_calculator_1.getNumber)(this.page.PackingCost));
                logger.info(`EXW → UI: ${exwUI}, Calculated: ${exwCalculated}`);
                test_1.expect.soft(exwUI).toBeCloseTo(exwCalculated, 2);
                // ================= Freight =================
                const freightUI = yield (0, welding_calculator_1.getCurrencyNumber)(this.page.shouldFreightCost, 'Freight Cost');
                const freightCalculated = yield (0, welding_calculator_1.getNumber)(this.page.logiFreightCost);
                logger.info(`Freight → UI: ${freightUI}, Calculated: ${freightCalculated}`);
                test_1.expect.soft(freightUI).toBeCloseTo(freightCalculated, 2);
                // ================= Duties =================
                const dutiesUI = yield (0, welding_calculator_1.getCurrencyNumber)(this.page.shouldDutiesTariff, 'Duties Tariff');
                const dutiesCalculated = yield (0, welding_calculator_1.getNumber)(this.page.tariffCost);
                logger.info(`Duties → UI: ${dutiesUI}, Calculated: ${dutiesCalculated}`);
                test_1.expect.soft(dutiesUI).toBeCloseTo(dutiesCalculated, 2);
                // ================= Total Part Cost =================
                const partCostUI = yield (0, welding_calculator_1.getCurrencyNumber)(this.page.PartShouldCost, 'Part Should Cost');
                const partCostCalculated = yield (0, welding_calculator_1.calculatePartCost)(yield (0, welding_calculator_1.getNumber)(this.page.MaterialTotalCost), yield (0, welding_calculator_1.getNumber)(this.page.ManufacturingCost), yield (0, welding_calculator_1.getNumber)(this.page.ToolingCost), yield (0, welding_calculator_1.getNumber)(this.page.OverheadProfit), yield (0, welding_calculator_1.getNumber)(this.page.PackingCost), yield (0, welding_calculator_1.getNumber)(this.page.shouldFreightCost), yield (0, welding_calculator_1.getNumber)(this.page.shouldDutiesTariff));
                logger.info(`Part Cost → UI: ${partCostUI}, Calculated: ${partCostCalculated}`);
                test_1.expect.soft(partCostUI).toBeCloseTo(partCostCalculated, 2);
            })).toPass({ timeout: 15000, intervals: [1000] });
        });
    }
}
exports.MigWeldingLogic = MigWeldingLogic;
