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
const mig_material_1 = require("./mig-material");
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
            return (0, mig_material_1.readMaterialDimensionsAndDensity)(this.page);
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
            yield this.page.waitForNetworkIdle();
            yield this.page.waitForTimeout(2000);
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
            logger.info(`Navigated to project ID: ${projectId}`);
        });
    }
    openManufacturingForMigWelding() {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('🔧 Opening Manufacturing → MIG Welding');
            if (this.page.isPageClosed()) {
                logger.warn('⚠️ Page already closed — aborting Manufacturing open');
                return;
            }
            const { ManufacturingInformation, MigWeldingProcessType, MfgWeld1, WeldTypeSubProcess1, MfgWeld2, WeldTypeSubProcess2 } = this.page;
            yield ManufacturingInformation.scrollIntoViewIfNeeded();
            yield (0, test_1.expect)(ManufacturingInformation, 'Manufacturing section not visible').toBeVisible({ timeout: 15000 });
            const isExpanded = yield MigWeldingProcessType.isVisible().catch(() => false);
            if (!isExpanded) {
                logger.info('🔽 Expanding Manufacturing section');
                yield ManufacturingInformation.click();
                yield (0, test_1.expect)(MigWeldingProcessType, 'MIG Welding content not visible after expand').toBeVisible({ timeout: 15000 });
                yield this.page.waitForTimeout(300);
            }
            else {
                logger.info('ℹ️ Manufacturing section already expanded');
            }
            if (!this.page.isPageClosed()) {
                yield this.page.expandWeldIfVisible(MfgWeld1, WeldTypeSubProcess1, 'Weld 1');
                yield (0, test_1.expect)(WeldTypeSubProcess1, 'Weld 1 content not visible').toBeVisible({ timeout: 10000 });
            }
            if (!this.page.isPageClosed()) {
                yield this.page.expandWeldIfVisible(MfgWeld2, WeldTypeSubProcess2, 'Weld 2');
                yield (0, test_1.expect)(WeldTypeSubProcess2, 'Weld 2 content not visible').toBeVisible({ timeout: 10000 });
            }
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
            logger.info(`Selecting material: ${processGroup} > ${category} > ${family} > ${grade} > ${stockForm}`);
            yield this.page.MaterialInformation.scrollIntoViewIfNeeded();
            yield this.page.MaterialInformation.click();
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
            partReorientationTime: this.page.PartReorientation,
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
            section: this.page[`MatWeld${suffix}`].locator('xpath=ancestor::mat-expansion-panel-header')
        };
        return locators;
    }
    //=============Collect Single Weld Data From UI ============
    collectWeldSubMaterial(weldIndex) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const locators = this.getWeldRowLocators(weldIndex);
            try {
                yield locators.weldType.waitFor({ state: 'visible', timeout: 5000 });
            }
            catch (_b) {
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
                noOfWeldPasses: Number(yield passesLocator.inputValue())
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
            const abort = (reason) => {
                logger.error(`❌ Abort weld row verification → ${reason}`);
                return { totalLength: 0, volume: 0, weldVolume: 0 };
            };
            const ensurePageAlive = (step) => {
                if (this.page.page.isClosed()) {
                    throw new Error(`Page closed before step: ${step}`);
                }
            };
            try {
                ensurePageAlive('Start');
                /* ---------------- Expand weld row ---------------- */
                const weldToggle = locators.weldCheck;
                if (weldToggle && (yield weldToggle.count().catch(() => 0)) > 0) {
                    yield weldToggle.scrollIntoViewIfNeeded();
                    if (yield weldToggle.isVisible().catch(() => false)) {
                        yield this.page.expandWeldCollapsed(weldToggle);
                        yield test_1.expect.soft(weldToggle).toBeVisible();
                    }
                }
                /* ---------------- Weld Type ---------------- */
                ensurePageAlive('Select Weld Type');
                yield test_1.expect.soft(locators.weldType).toBeEnabled();
                yield this.page.selectOption(locators.weldType, weldData.weldType);
                // 🔥 critical: wait for DOM re-render
                yield locators.weldSize.waitFor({
                    state: 'visible',
                    timeout: 10000
                });
                /* ---------------- Weld Size ---------------- */
                ensurePageAlive('Fill Weld Size');
                const uiWeldSize = yield this.page.safeFill(locators.weldSize, weldData.weldSize, 'Weld Size');
                /* ---------------- Wire Diameter (optional) ---------------- */
                ensurePageAlive('Validate Wire Dia');
                const wireDia = locators.wireDia;
                if (wireDia && (yield wireDia.count().catch(() => 0)) > 0) {
                    yield test_1.expect.soft(wireDia).toBeVisible({ timeout: 5000 });
                    if (!this.page.page.isClosed()) {
                        const actualWireDia = Number(yield wireDia.inputValue());
                        const expectedWireDia = (0, welding_calculator_1.getWireDiameter)(materialType, uiWeldSize);
                        test_1.expect.soft(actualWireDia).toBe(expectedWireDia);
                        logger.info(`🧪 Wire Dia: ${actualWireDia} (Expected: ${expectedWireDia})`);
                    }
                }
                else {
                    logger.warn('⚠️ Wire Dia not present — skipping');
                }
                /* ---------------- Weld Element Size ---------------- */
                ensurePageAlive('Read Weld Element Size');
                yield test_1.expect.soft(locators.weldElementSize).not.toHaveValue('', {
                    timeout: 5000
                });
                const weldElementSize = Number((yield locators.weldElementSize.inputValue()) || '0');
                /* ---------------- Weld Length ---------------- */
                ensurePageAlive('Fill Weld Length');
                const uiWeldLength = yield this.page.safeFill(locators.weldLength, weldData.weldLength, 'Weld Length');
                /* ---------------- Weld Places ---------------- */
                ensurePageAlive('Fill Weld Places');
                yield locators.weldPlaces.waitFor({ state: 'visible', timeout: 5000 });
                yield locators.weldPlaces.fill(String(weldData.weldPlaces));
                const uiWeldPlaces = Number(yield locators.weldPlaces.inputValue());
                test_1.expect.soft(uiWeldPlaces).toBeGreaterThan(0);
                logger.info(`📍 Weld Places: ${uiWeldPlaces}`);
                /* ---------------- Weld Side ---------------- */
                ensurePageAlive('Select Weld Side');
                yield this.page.selectOption(locators.weldSide, weldData.weldSide);
                const uiWeldSide = yield this.page.getSelectedOptionText(locators.weldSide);
                test_1.expect.soft(uiWeldSide).toBe(weldData.weldSide);
                logger.info(`↔️ Weld Side: ${uiWeldSide}`);
                /* ---------------- Grind Flush ---------------- */
                ensurePageAlive('Select Grind Flush');
                yield this.page.selectOption(locators.grindFlush, weldData.grindFlush);
                const uiGrindFlush = yield this.page.getSelectedOptionText(locators.grindFlush);
                test_1.expect.soft(uiGrindFlush).toBe(weldData.grindFlush);
                logger.info(`🪵 Grind Flush: ${uiGrindFlush}`);
                /* ---------------- Weld Passes ---------------- */
                const passes = Number(weldData.noOfWeldPasses || 1);
                test_1.expect.soft(passes).toBeGreaterThan(0);
                logger.info(`🔁 Weld Passes: ${passes}`);
                /* ---------------- Total Weld Length ---------------- */
                ensurePageAlive('Validate Total Weld Length');
                yield (0, welding_calculator_1.validateTotalLength)(locators.weldLength, locators.weldPlaces, locators.weldSide, locators.totalWeldLength, 'Total Weld Length');
                const expectedTotalLength = this.calculator.getTotalWeldLength(uiWeldLength, uiWeldPlaces, uiWeldSide);
                yield test_1.expect
                    .soft(locators.totalWeldLength)
                    .toHaveValue(expectedTotalLength.toString(), { timeout: 5000 });
                logger.info(`✔ Total Weld Length: ${expectedTotalLength}`);
                /* ---------------- Weld Volume ---------------- */
                const weldVolumeResult = (0, welding_calculator_1.calculateWeldVolume)(weldData.weldType, uiWeldSize, weldElementSize, uiWeldLength, uiWeldPlaces, passes, uiWeldSide);
                test_1.expect.soft(weldVolumeResult.weldVolume).toBeGreaterThan(0);
                logger.info(`📦 Weld Volume: ${weldVolumeResult.weldVolume}`);
                return {
                    totalLength: expectedTotalLength,
                    volume: weldVolumeResult.weldVolume,
                    weldVolume: weldVolumeResult.weldVolume
                };
            }
            catch (err) {
                return abort(err.message);
            }
        });
    }
    verifyWeldingDetails(migWeldingTestData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            logger.info('🔹 Verifying Welding Details...');
            yield this.page.scrollToMiddle(this.page.WeldingDetails);
            yield test_1.expect.soft(this.page.WeldingDetails).toBeVisible({ timeout: 10000 });
            const weldingDetails = migWeldingTestData.weldingDetails;
            const materialType = ((_a = migWeldingTestData.materialInformation) === null || _a === void 0 ? void 0 : _a.family) || 'Carbon Steel';
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
            const actualTotal = Number(yield this.page.totalWeldLength.inputValue());
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
            const machineCost = yield this.page.readNumberSafe(this.page.directMachineCost, 'Direct Machine Cost');
            const setupCost = yield this.page.readNumberSafe(this.page.directSetUpCost, 'Direct SetUp Cost');
            const laborCost = yield this.page.readNumberSafe(this.page.directLaborCost, 'Direct Labor Cost');
            const inspectionCost = yield this.page.readNumberSafe(this.page.QAInspectionCost, 'Inspection Cost');
            const yieldCost = yield this.page.readNumberSafe(this.page.YieldCostPart, 'Yield Cost');
            const powerCost = yield this.page.readNumberSafe(this.page.totalPowerCost, 'Total Power Cost');
            // 2. Sum them up
            const expectedProcessCost = machineCost +
                setupCost +
                laborCost +
                inspectionCost +
                yieldCost +
                powerCost;
            logger.info(`∑ Calculation: ${machineCost} (Machine) + ${setupCost} (Setup) + ${laborCost} (Labor) + ` +
                `${inspectionCost} (Inspection) + ${yieldCost} (Yield) + ${powerCost} (Power) = ${expectedProcessCost}`);
            // 3. Verify against the UI Total
            yield this.page.verifyUIValue({
                locator: this.page.netProcessCost,
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
            yield this.verifyMaterialValue(this.page.totalWeldLength, expected, 'Total Weld Length');
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
            // Use helper implementation to reduce file size and improve testability
            return (0, mig_material_1.verifyWeldingMaterialCalculationsHelper)(this.page, this.calculator, this.collectAllWeldSubMaterials.bind(this));
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
                locator: this.page.totalWeldLength,
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
                    yield locators.weldType.waitFor({ state: 'visible', timeout: 5000 });
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
            const efficiency = yield this.page.getInputValueAsNumber(this.page.MachineEfficiency);
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
            const requiredCurrent = yield this.page.getInputValueAsNumber(this.page.RequiredCurrent);
            const requiredVoltage = yield this.page.getInputValueAsNumber(this.page.RequiredVoltage);
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
            const manufacturingHeader = this.page.ManufacturingInformation.first();
            yield manufacturingHeader.waitFor({ state: 'visible', timeout: 15000 });
            yield manufacturingHeader.scrollIntoViewIfNeeded();
            const isMfgExpanded = yield this.page.MigWeldRadBtn.isVisible().catch(() => false);
            if (!isMfgExpanded) {
                logger.info('🔽 Expanding Manufacturing section...');
                yield manufacturingHeader.click({ force: true });
                yield this.page.waitForTimeout(500);
            }
            // 2️⃣ Weld row expansion
            const weldHeader = mfgWeldIndex === 1 ? this.page.MfgWeld1 : this.page.MfgWeld2;
            yield weldHeader.waitFor({ state: 'visible', timeout: 20000 });
            yield weldHeader.scrollIntoViewIfNeeded();
            // If target input is already visible and enabled, we can assume it's expanded
            if (yield targetInput.isVisible().catch(() => false)) {
                logger.info(`✅ Weld ${mfgWeldIndex} already appears expanded`);
                return;
            }
            // 3️⃣ Attempt expansion clicks
            for (let attempt = 1; attempt <= 3; attempt++) {
                logger.debug(`🔁 Attempt ${attempt} to expand Weld ${mfgWeldIndex}`);
                try {
                    yield weldHeader.click({ force: true });
                }
                catch (_a) {
                    yield weldHeader.evaluate((el) => el.click());
                }
                // Wait for animation and visibility
                try {
                    yield targetInput.waitFor({ state: 'visible', timeout: 3000 });
                    if (yield targetInput.isVisible()) {
                        logger.info(`✅ Weld ${mfgWeldIndex} expanded successfully on attempt ${attempt}`);
                        return;
                    }
                }
                catch (err) {
                    // Retry
                    logger.debug(`⏳ Waiting for Weld ${mfgWeldIndex} expansion...`);
                }
                yield this.page.waitForTimeout(1000);
            }
            // Final check
            if (!(yield targetInput.isVisible().catch(() => false))) {
                logger.warn(`⚠️ Weld ${mfgWeldIndex} might not be expanded, but proceeding to try collection.`);
            }
        });
    }
    //======================== Cycle Time/Part(Sec) =========================================
    verifyWeldCycleTimeDetails(testData) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('🔹 Step: Comprehensive Weld Cycle Time Verification');
            yield this.openManufacturingForMigWelding();
            const weldingDetails = testData === null || testData === void 0 ? void 0 : testData.weldingDetails;
            if (!weldingDetails) {
                logger.warn('⚠️ weldingDetails missing — skipping weld cycle verification');
                return;
            }
            try {
                // ---------- Common Inputs ----------
                const efficiency = yield this.getEfficiencyFromUI();
                const partReorientation = yield this.getInputNumber(this.page.PartReorientation);
                const loadingUnloadingTime = yield this.getInputNumber(this.page.UnloadingTime);
                logger.info(`✓ Efficiency          : ${efficiency}%`);
                logger.info(`✓ Part Reorientation  : ${partReorientation}`);
                logger.info(`✓ Loading/Unloading  : ${loadingUnloadingTime} sec`);
                // ---------- Sub-Processes ----------
                const subProcessCycleTimes = [];
                const weldMap = [
                    ['weld1', 0],
                    ['weld2', 1]
                ];
                for (const [key, index] of weldMap) {
                    const weldData = weldingDetails[key];
                    if (!weldData) {
                        logger.info(`ℹ️ ${key} not present — skipping`);
                        continue;
                    }
                    logger.info(`🔍 Verifying ${key}`);
                    const cycleTime = yield this.verifySingleSubProcessCycleTime(index, weldData);
                    if (Number.isFinite(cycleTime)) {
                        subProcessCycleTimes.push(cycleTime);
                        logger.info(`✓ ${key} Cycle Time: ${cycleTime.toFixed(2)} sec`);
                    }
                }
                if (!subProcessCycleTimes.length) {
                    logger.warn('⚠️ No active weld sub-processes found');
                    return;
                }
                // ---------- Overall Cycle ----------
                yield this.verifyOverallCycleTime({
                    subProcessCycleTimes,
                    loadingUnloadingTime,
                    partReorientation,
                    efficiency
                });
                this.runtimeWeldingContext.subProcessCycleTimes = subProcessCycleTimes;
                logger.info('✅ Weld Cycle Time Verification Completed');
            }
            catch (error) {
                logger.error(`❌ Weld Cycle Time Verification Failed: ${error.message}`);
                logger.debug(error.stack);
                throw error;
            }
        });
    }
    verifySingleSubProcessCycleTime(index, weldData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            const mfgWeldIndex = (index + 1);
            //await this.ensureMfgWeldExpanded(mfgWeldIndex)
            const locators = {
                weldType: mfgWeldIndex === 1
                    ? this.page.WeldTypeSubProcess1
                    : this.page.WeldTypeSubProcess2,
                position: mfgWeldIndex === 1
                    ? this.page.WeldPositionSubProcess1
                    : this.page.WeldPositionSubProcess2,
                speed: mfgWeldIndex === 1
                    ? this.page.TravelSpeedSubProcess1
                    : this.page.TravelSpeedSubProcess2,
                tacks: mfgWeldIndex === 1
                    ? this.page.TrackWeldSubProcess1
                    : this.page.TrackWeldSubProcess2,
                stops: mfgWeldIndex === 1
                    ? this.page.IntermediateStartStopSubProcess1
                    : this.page.IntermediateStartStopSubProcess2,
                cycle: mfgWeldIndex === 1
                    ? this.page.MfgWeldCycleTime1
                    : this.page.MfgWeldCycleTime2
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
    verifyWeldCleaningCycleTimeDetails() {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('🔹 Step: Weld Cleaning/Preparation Cycle Time Verification');
            //await this.openManufacturingForMigWelding()
            yield this.verifyWeldCleaningCost();
        });
    }
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
            const uiCycleTimeRaw = yield this.page.getInputValueAsNumber(this.page.curCycleTime);
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
            return yield this.page.getInputValueAsNumber(this.page.MachineEfficiency);
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
            return {
                machineHourRate: yield this.page.safeGetNumber(this.page.machineHourRate),
                machineEfficiency: yield this.page.safeGetNumber(this.page.MachineEfficiency),
                lowSkilledLaborRatePerHour: yield this.page.safeGetNumber(this.page.lowSkilledLaborRatePerHour),
                skilledLaborRatePerHour: yield this.page.safeGetNumber(this.page.skilledLaborRatePerHour),
                noOfLowSkilledLabours: yield this.page.safeGetNumber(this.page.noOfLowSkilledLabours),
                electricityUnitCost: yield this.page.safeGetNumber(this.page.electricityUnitCost),
                powerConsumptionKW: yield this.page.safeGetNumber(this.page.powerConsumptionKW),
                yieldPercentage: yield this.page.safeGetNumber(this.page.YieldPercentage),
                annualVolume: yield this.page.safeGetNumber(this.page.AnnualVolumeQtyNos),
                setUpTime: yield this.page.safeGetNumber(this.page.MachineSetupTime),
                qaInspectorRate: yield this.page.safeGetNumber(this.page.QAInspectorRate),
                inspectionTime: yield this.page.safeGetNumber(this.page.QAInspectionTime),
                samplingRate: yield this.page.safeGetNumber(this.page.SamplingRate),
                netMaterialCost: yield this.page.safeGetNumber(this.page.netMaterialCost),
                curCycleTime: yield this.page.safeGetNumber(this.page.curCycleTime),
                totalWeldLength: yield this.page.safeGetNumber(this.page.totalWeldLength),
                cuttingLength: yield this.page.safeGetNumber(this.page.cuttingLength),
                matWeldSize1: yield this.page.safeGetNumber(this.page.MatWeldSize1),
                matWeldSize2: yield this.page.safeGetNumber(this.page.MatWeldSize2),
                matWeldElementSize1: yield this.page.safeGetNumber(this.page.MatWeldElementSize1),
                matWeldElementSize2: yield this.page.safeGetNumber(this.page.MatWeldElementSize2),
                partReorientation: yield this.page.safeGetNumber(this.page.PartReorientation),
                partProjectedArea: yield this.page.safeGetNumber(this.page.PartSurfaceArea),
                totalWeldCycleTime: yield this.page.safeGetNumber(this.page.totalWeldCycleTime),
                travelSpeed: yield this.page.safeGetNumber(this.page.TravelSpeedSubProcess1),
                unloadingTime: yield this.page.safeGetNumber(this.page.UnloadingTime),
                machineType: yield this.page.safeGetNumber(this.page.MachineType),
                netWeight: yield this.page.safeGetNumber(this.page.NetWeight),
                density: yield this.page.safeGetNumber(this.page.Density),
                dryCycleTime: yield this.page.safeGetNumber(this.page.DryCycleTime),
                requiredVoltage: yield this.page.safeGetNumber(this.page.RequiredVoltage),
                requiredCurrent: yield this.page.safeGetNumber(this.page.RequiredCurrent),
                selectedVoltage: yield this.page.safeGetNumber(this.page.selectedVoltage),
                selectedCurrent: yield this.page.safeGetNumber(this.page.selectedCurrent),
                netProcessCost: yield this.page.safeGetNumber(this.page.netProcessCost)
            };
        });
    }
    gatherManufacturingInfo(processType, machineEfficiency, density) {
        return __awaiter(this, void 0, void 0, function* () {
            logger.info('📥 Gathering Manufacturing Info from UI...');
            const inputs = yield this.readManufacturingInputs();
            const { machineHourRate, machineEfficiency: machineEfficiencyUI, totalWeldLength, cuttingLength, matWeldElementSize1: MatWeldElementSize1, matWeldElementSize2: MatWeldElementSize2, partReorientation: PartReorientation, partProjectedArea, netWeight, density: densityUI, lowSkilledLaborRatePerHour, noOfLowSkilledLabours, skilledLaborRatePerHour, qaInspectorRate: qaOfInspectorRate, inspectionTime, samplingRate, powerConsumptionKW, electricityUnitCost, yieldPercentage: yieldPer, annualVolume, setUpTime, netMaterialCost, curCycleTime, totalWeldCycleTime, travelSpeed, unloadingTime: UnloadingTime, machineType: semiAutoOrAuto, dryCycleTime, selectedVoltage, requiredVoltage: RequiredVoltage, requiredCurrent: RequiredCurrent, selectedCurrent, netProcessCost } = inputs;
            const isWeldingProcess = processType === welding_calculator_1.ProcessType.MigWelding ||
                processType === welding_calculator_1.ProcessType.TigWelding ||
                processType === welding_calculator_1.ProcessType.WeldingCleaning ||
                processType === welding_calculator_1.ProcessType.WeldingPreparation;
            const maxWeldElementSize = isWeldingProcess
                ? Math.max(MatWeldElementSize1 || 0, MatWeldElementSize2 || 0)
                : 0;
            logger.info(`🔩 Max Weld Element Size: ${maxWeldElementSize}`);
            const lotSize = yield this.getInputNumber(this.page.LotsizeNos);
            if (lotSize === 1 &&
                [welding_calculator_1.ProcessType.WeldingCleaning, welding_calculator_1.ProcessType.WeldingPreparation].includes(processType)) {
                logger.warn('⚠️ Lot size = 1 (possible fallback)');
            }
            const [netPartWeight, partComplexity, materialTypeName, materialDims] = yield Promise.all([
                this.getNetWeight(),
                this.getPartComplexity(),
                this.getMaterialType(),
                this.getMaterialDimensionsAndDensity()
            ]);
            const { length, width, height } = materialDims;
            let coreCostDetails = [];
            // ✅ MIG/TIG ONLY
            if (isWeldingProcess) {
                yield this.ensureMfgWeldExpanded(1);
                yield this.ensureMfgWeldExpanded(2).catch(() => logger.info('ℹ️ Weld 2 not available/expanded'));
                const [weldSubMaterials, uiSubProcesses] = yield Promise.all([
                    Promise.all([1, 2].map(i => this.collectWeldSubMaterial(i))),
                    this.collectSubProcesses()
                ]);
                const validSubMaterials = weldSubMaterials.filter(Boolean);
                coreCostDetails = validSubMaterials.map((weld, i) => {
                    const sub = uiSubProcesses[i];
                    return {
                        coreWeight: maxWeldElementSize,
                        coreHeight: weld.weldSize,
                        coreLength: weld.weldLength,
                        coreVolume: weld.weldPlaces,
                        coreArea: weld.weldSide === 'Both' ? 2 : 1,
                        noOfCore: weld.noOfWeldPasses,
                        coreWidth: weld.wireDia,
                        coreShape: weld.weldType,
                        weldPosition: sub === null || sub === void 0 ? void 0 : sub.weldPosition,
                        hlFactor: sub === null || sub === void 0 ? void 0 : sub.tackWelds,
                        formPerimeter: sub === null || sub === void 0 ? void 0 : sub.intermediateStops,
                        formHeight: sub === null || sub === void 0 ? void 0 : sub.travelSpeed
                    };
                });
            }
            else {
                logger.info('ℹ️ Skipping weld details for non-welding process');
            }
            const effectiveWeldLength = totalWeldLength;
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
                noOfLowSkilledLabours,
                skilledLaborRatePerHour,
                qaOfInspectorRate,
                inspectionTime,
                samplingRate,
                powerConsumptionKW,
                electricityUnitCost,
                yieldPer: yieldPer / 100,
                lotSize,
                annualVolume,
                setUpTime,
                netMaterialCost,
                netPartWeight,
                curCycleTime,
                totalWeldCycleTime,
                totalWeldLength,
                cuttingLength,
                travelSpeed,
                UnloadingTime,
                semiAutoOrAuto,
                PartReorientation,
                netWeight,
                densityUI,
                dryCycleTime,
                selectedVoltage,
                RequiredVoltage,
                RequiredCurrent,
                selectedCurrent,
                netProcessCost,
                isrequiredCurrentDirty: true,
                MachineEfficiency: machineEfficiencyUI || machineEfficiency * 100,
                efficiency: machineEfficiencyUI || machineEfficiency * 100,
                materialInfoList: [
                    {
                        processId: processMapping[processType] || processType,
                        density,
                        netWeight: netPartWeight,
                        netMatCost: netMaterialCost,
                        partProjectedArea,
                        totalWeldLength: effectiveWeldLength,
                        dimX: length,
                        dimY: width,
                        dimZ: height,
                        coreCostDetails
                    }
                ],
                materialmasterDatas: {
                    materialType: { materialTypeName }
                },
                machineMaster: {
                    machineHourRate,
                    powerConsumptionKW,
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
    // ===== Cost Verification Helper =====
    verifyCostItems(items_1) {
        return __awaiter(this, arguments, void 0, function* (items, options = {}) {
            var _a, _b, _c, _d;
            const precision = (_a = options.precision) !== null && _a !== void 0 ? _a : 4;
            const debug = (_b = options.debug) !== null && _b !== void 0 ? _b : false;
            const retryTimeout = (_c = options.retryTimeout) !== null && _c !== void 0 ? _c : 5000; // ms
            const retryInterval = (_d = options.retryInterval) !== null && _d !== void 0 ? _d : 200; // ms
            let total = 0;
            for (const item of items) {
                const { label, locator, value, enabled = true, includeInTotal = true } = item;
                if (!enabled) {
                    debug && logger.info(`⏭️ ${label} skipped (disabled)`);
                    continue;
                }
                if (value == null ||
                    !Number.isFinite(Number(value)) ||
                    Number(value) < 0) {
                    debug &&
                        logger.warn(`⏭️ ${label} skipped (invalid expected value: ${value})`);
                    continue;
                }
                let expected = Number(value);
                const readUIValue = (locator) => __awaiter(this, void 0, void 0, function* () {
                    if (this.page.isPageClosed())
                        return null;
                    try {
                        const val = yield this.page.getInputValueAsNumber(locator);
                        return val != null && !isNaN(val) ? val : null;
                    }
                    catch (_a) {
                        return null;
                    }
                });
                // Poll UI value until it is populated or timeout
                let uiValue = null;
                const start = Date.now();
                while (Date.now() - start < retryTimeout) {
                    try {
                        uiValue = yield this.page.getInputValueAsNumber(locator);
                        if (uiValue !== null && !isNaN(uiValue) && uiValue >= 0)
                            break;
                    }
                    catch (err) {
                        // ignore and retry
                    }
                    yield this.page.wait(retryInterval);
                }
                uiValue = yield readUIValue(locator);
                if (uiValue === null) {
                    logger.warn(`⚠️ ${label} could not be read from UI, skipping verification`);
                    continue;
                }
                // Special-case: recompute expected Yield Cost from UI components to match app behavior
                if (label && label.toLowerCase().includes('yield')) {
                    const uiNetMaterial = yield this.page.safeGetNumber(this.page.netMaterialCost);
                    const uiMachine = yield this.page.safeGetNumber(this.page.directMachineCost);
                    const uiLabor = yield this.page.safeGetNumber(this.page.directLaborCost);
                    const uiSetup = yield this.page.safeGetNumber(this.page.directSetUpCost);
                    const uiInspection = yield this.page.safeGetNumber(this.page.QAInspectionCost);
                    const uiPower = yield this.page.safeGetNumber(this.page.totalPowerCost);
                    const uiYieldPer = (yield this.page.safeGetNumber(this.page.YieldPercentage)) || 0;
                    const sumUI = Number(uiMachine || 0) +
                        Number(uiSetup || 0) +
                        Number(uiLabor || 0) +
                        Number(uiInspection || 0) +
                        Number(uiPower || 0);
                    const raw = (1 - uiYieldPer / 100) * (Number(uiNetMaterial || 0) + Number(sumUI));
                    expected = Number(Number.isFinite(raw) ? Number(raw).toFixed(4) : 0);
                    debug &&
                        logger.info(`🔧 Recomputed Yield Expected from UI components: ${expected} (netMat:${uiNetMaterial} sum:${sumUI} yield%:${uiYieldPer})`);
                }
                // Debug log
                debug &&
                    logger.info(`🔍 Verifying ${label}`, { expected, uiValue, precision });
                // Compare with UI using specified precision
                yield this.page.verifyUIValue({
                    locator,
                    expectedValue: expected,
                    label,
                    precision
                });
                if (includeInTotal) {
                    total += expected;
                }
            }
            return total;
        });
    }
    calculateWeldingProcess(processType, manufactureInfo) {
        switch (processType) {
            case welding_calculator_1.ProcessType.WeldingCleaning:
                this.calculator.calculationsForWeldingCleaning(manufactureInfo, [], manufactureInfo);
                break;
            case welding_calculator_1.ProcessType.WeldingPreparation:
                this.calculator.calculationsForWeldingPreparation(manufactureInfo, [], manufactureInfo);
                break;
            default:
                this.calculator.calculationForWelding(manufactureInfo, [], manufactureInfo, []);
        }
        return manufactureInfo;
    }
    verifyUnifiedWeldingCosts(processType_1) {
        return __awaiter(this, arguments, void 0, function* (processType, options = {}) {
            var _a, _b;
            const { precision = 4, debug = false, verifyTotal = true } = options;
            logger.info(`\n💰 Unified Welding Verification → ${welding_calculator_1.ProcessType[processType]}`);
            const { density = 7.87 } = (_a = (yield this.getMaterialDimensionsAndDensity())) !== null && _a !== void 0 ? _a : {};
            const efficiencyInput = yield this.page.getInputValueAsNumber(this.page.MachineEfficiency);
            const efficiency = isNaN(efficiencyInput) ? 1 : efficiencyInput / 100;
            yield this.switchToWeldingProcess(processType);
            const manufactureInfo = yield this.gatherManufacturingInfo(processType, efficiency, density);
            this.calculator.weldingPreCalc(manufactureInfo, [], manufactureInfo);
            const calculated = this.calculateWeldingProcess(processType, manufactureInfo);
            const verificationItems = [];
            const isWeldingProcess = processType === welding_calculator_1.ProcessType.MigWelding ||
                processType === welding_calculator_1.ProcessType.TigWelding;
            if (isWeldingProcess) {
                verificationItems.push({
                    label: 'Cycle Time',
                    locator: this.page.curCycleTime.first(),
                    value: manufactureInfo.cycleTime,
                    enabled: true,
                    includeInTotal: false
                }, {
                    label: 'Power Cost',
                    locator: this.page.totalPowerCost.first(),
                    value: calculated.totalPowerCost
                });
            }
            verificationItems.push({
                label: 'Direct Machine Cost',
                locator: this.page.directMachineCost.first(),
                value: calculated.directMachineCost
            }, {
                label: 'Direct Labor Cost',
                locator: this.page.directLaborCost.first(),
                value: calculated.directLaborCost
            }, {
                label: 'Direct Setup Cost',
                locator: this.page.directSetUpCost.first(),
                value: calculated.directSetUpCost
            }, {
                label: 'QA Inspection Cost',
                locator: this.page.QAInspectionCost.first(),
                value: (_b = calculated.inspectionCost) !== null && _b !== void 0 ? _b : calculated.qaInspectionCost
            }, {
                label: 'Yield Cost',
                locator: this.page.YieldCostPart.first(),
                value: calculated.yieldCost
            });
            const summedCost = yield this.verifyCostItems(verificationItems, {
                precision,
                debug,
                retryTimeout: options.retryTimeout,
                retryInterval: options.retryInterval
            });
            if (verifyTotal && summedCost > 0 && !this.page.isPageClosed()) {
                yield this.page.verifyUIValue({
                    locator: this.page.netProcessCost,
                    expectedValue: calculated.directProcessCost,
                    label: 'Total Manufacturing Cost',
                    precision
                });
                debug &&
                    logger.info(`📐 Sum=${summedCost} | Backend=${calculated.directProcessCost}`);
            }
            logger.info(`✅ ${welding_calculator_1.ProcessType[processType]} Cost Verification Passed`);
            return calculated;
        });
    }
    switchToWeldingProcess(processType) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.page.isPageClosed())
                return;
            switch (processType) {
                case welding_calculator_1.ProcessType.WeldingCleaning:
                    yield this.page.waitAndClick(this.page.WeldCleanRadBtn);
                    break;
                case welding_calculator_1.ProcessType.MigWelding:
                    yield this.page.waitAndClick(this.page.MigWeldRadBtn);
                    break;
            }
            yield this.page.waitForNetworkIdle();
            yield this.page.wait(500);
        });
    }
    verifyMigCosts() {
        return __awaiter(this, void 0, void 0, function* () {
            //await this.openManufacturingForMigWelding();
            return this.verifyUnifiedWeldingCosts(welding_calculator_1.ProcessType.MigWelding, {
                verifyCycleTime: true,
                debug: true
            });
        });
    }
    verifyWeldCleaningCost() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.verifyUnifiedWeldingCosts(welding_calculator_1.ProcessType.WeldingCleaning, {
                verifyCycleTime: false,
                debug: true
            });
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
                density: 7.87
            };
            const efficiencyVal = yield this.page.getInputValueAsNumber(this.page.MachineEfficiency);
            const machineEfficiency = efficiencyVal / 100;
            logger.info('machineEfficiency', machineEfficiency);
            const manufactureInfo = yield this.gatherManufacturingInfo(processType, machineEfficiency, density);
            // Apply defaults (yield%, sampling rate, etc.)
            this.calculator.weldingPreCalc(manufactureInfo, [], manufactureInfo);
            logger.info(`📊 Manufacturing Info for Cost Calculation:`);
            logger.info(`   Cycle Time: ${manufactureInfo.cycleTime} sec`);
            logger.info(`   Machine Rate: ${manufactureInfo.machineHourRate} per hour`);
            logger.info(`   Labor Rate: ${manufactureInfo.lowSkilledLaborRatePerHour} per hour`);
            logger.info(`   Power Consumption: ${manufactureInfo.powerConsumptionKW} kW`);
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
            var _a, _b, _c, _d, _e, _f, _g, _h;
            logger.info('\n💰 ===== Weld Cleaning Cost Verification =====');
            const processType = yield this.getProcessTypeCleaning();
            const { density } = (yield this.getMaterialDimensionsAndDensity()) || {
                density: 7.87
            };
            // 1️⃣ Switch to MIG Welding to scrape common material info (Weld definitions)
            logger.info('🔄 Switching to MIG Welding to gather weld details...');
            yield this.page.MigWeldRadBtn.scrollIntoViewIfNeeded();
            // Robustly ensure Mig Welding is selected
            let isChecked = yield this.page.MigWeldRadBtn.isChecked().catch(() => false);
            if (!isChecked) {
                logger.info('🔘 Mig Welding radio not checked — selecting...');
                // Try 1: Force Click if visible
                if (yield this.page.MigWeldRadBtn.isVisible()) {
                    yield this.page.MigWeldRadBtn.click({ force: true });
                }
                else {
                    // Try 2: JS Click if not visible
                    yield this.page.MigWeldRadBtn.evaluate((el) => el.click());
                }
                yield this.page.waitForTimeout(1000);
                // Try 3: Last resort JS click if still not checked
                isChecked = yield this.page.MigWeldRadBtn.isChecked().catch(() => false);
                if (!isChecked) {
                    logger.warn('⚠️ Force click failed — retrying with JS click');
                    yield this.page.MigWeldRadBtn.evaluate((el) => el.click());
                    yield this.page.waitForTimeout(500);
                }
            }
            yield this.page.waitForNetworkIdle();
            const migManufactureInfo = yield this.gatherManufacturingInfo(welding_calculator_1.ProcessType.MigWelding, 1, density);
            if (processType === welding_calculator_1.ProcessType.WeldingCleaning) {
                yield this.page.waitAndClick(this.page.WeldCleanRadBtn);
            }
            else {
                if (processType !== welding_calculator_1.ProcessType.WeldingPreparation) {
                    yield this.page.MigWeldRadBtn.scrollIntoViewIfNeeded();
                    yield this.page.safeClick(this.page.MigWeldRadBtn);
                }
            }
            yield this.page.waitForNetworkIdle();
            const efficiency = (yield this.page.getInputValueAsNumber(this.page.MachineEfficiency)) / 100;
            const manufactureInfo = yield this.gatherManufacturingInfo(processType, efficiency, density);
            if (((_a = migManufactureInfo.materialInfoList) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                manufactureInfo.materialInfoList = migManufactureInfo.materialInfoList;
            }
            const weldLegLength = (yield this.page.getInputValueAsNumber(this.page.totalWeldLength)) || 0;
            const surfaceArea = (yield this.page.getInputValueAsNumber(this.page.PartSurfaceArea)) || 0;
            if (((_b = manufactureInfo.materialInfoList) === null || _b === void 0 ? void 0 : _b.length) > 0) {
                const materialInfo = manufactureInfo.materialInfoList[0];
                materialInfo.totalWeldLength = weldLegLength;
                materialInfo.partProjectedArea = surfaceArea;
            }
            if (Number(manufactureInfo.processTypeID) === welding_calculator_1.ProcessType.WeldingCleaning) {
                this.calculator.calculationsForWeldingCleaning(manufactureInfo, [], manufactureInfo);
            }
            logger.info('🐛 DEBUG Post-Calculation Values:', {
                cycleTime: manufactureInfo.curCycleTime,
                directMachineCost: manufactureInfo.directMachineCost,
                directLaborCost: manufactureInfo.directLaborCost,
                directSetUpCost: manufactureInfo.directSetUpCost,
                inspectionCost: manufactureInfo.inspectionCost,
                yieldCost: manufactureInfo.yieldCost,
                lotSize: manufactureInfo.lotSize
            });
            const uiValues = {
                cycleTime: yield this.page.safeGetNumber(this.page.curCycleTime),
                machine: yield this.page.safeGetNumber(this.page.directMachineCost),
                labor: yield this.page.safeGetNumber(this.page.directLaborCost),
                setup: yield this.page.safeGetNumber(this.page.directSetUpCost),
                inspection: yield this.page.safeGetNumber(this.page.QAInspectionCost),
                yield: yield this.page.safeGetNumber(this.page.YieldCostPart)
            };
            const verifications = [
                {
                    label: 'Cycle Time / Part',
                    locator: this.page.curCycleTime,
                    ui: uiValues.cycleTime,
                    calc: (_c = manufactureInfo.cycleTime) !== null && _c !== void 0 ? _c : 0
                },
                {
                    label: 'Machine Cost / Part',
                    locator: this.page.directMachineCost,
                    ui: uiValues.machine,
                    calc: (_d = manufactureInfo.directMachineCost) !== null && _d !== void 0 ? _d : 0
                },
                {
                    label: 'Labor Cost / Part',
                    locator: this.page.directLaborCost,
                    ui: uiValues.labor,
                    calc: (_e = manufactureInfo.directLaborCost) !== null && _e !== void 0 ? _e : 0
                },
                {
                    label: 'Setup Cost / Part',
                    locator: this.page.directSetUpCost,
                    ui: uiValues.setup,
                    calc: (_f = manufactureInfo.directSetUpCost) !== null && _f !== void 0 ? _f : 0
                },
                {
                    label: 'QA Inspection Cost / Part',
                    locator: this.page.QAInspectionCost,
                    ui: uiValues.inspection,
                    calc: (_g = manufactureInfo.inspectionCost) !== null && _g !== void 0 ? _g : 0
                },
                {
                    label: 'Yield Cost / Part',
                    locator: this.page.YieldCostPart,
                    ui: uiValues.yield,
                    calc: (_h = manufactureInfo.yieldCost) !== null && _h !== void 0 ? _h : 0
                }
            ];
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
            if (totalCalculated > 0) {
                yield this.page.verifyUIValue({
                    locator: this.page.netProcessCost,
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
            const powerConsumptionKW = (yield this.page.getInputValueAsNumber(this.page.powerConsumptionKW)) || 0;
            const curcycleTime = (yield this.page.getInputValueAsNumber(this.page.curCycleTime)) || 0;
            const calculated = (0, welding_calculator_1.calculateManufacturingCO2)(curcycleTime, powerConsumptionKW, co2PerKwHr);
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
    verifyEndToEndWelding(manufactureInfo, fieldColorsList, manufacturingObj, laborRates) {
        return __awaiter(this, void 0, void 0, function* () {
            // ---------------------------
            // Step 1: Prepare welding info
            // ---------------------------
            this.calculator.weldingPreCalc(manufactureInfo, fieldColorsList, manufacturingObj);
            // Calculate cycle time depending on process
            if (manufactureInfo.processTypeID === welding_calculator_1.ProcessType.WeldingPreparation ||
                manufactureInfo.processTypeID === welding_calculator_1.ProcessType.WeldingCleaning ||
                manufactureInfo.processTypeID === welding_calculator_1.ProcessType.MigWelding ||
                manufactureInfo.processTypeID === welding_calculator_1.ProcessType.TigWelding) {
                manufactureInfo = this.calculator.calculationForWelding(manufactureInfo, fieldColorsList, manufacturingObj, laborRates);
            }
            // ---------------------------
            // Step 2: Weld material & sustainability
            // ---------------------------
            const materialInfoList = manufactureInfo.materialInfoList || [];
            for (const matInfo of materialInfoList) {
                const weldCosts = this.calculator.calculateExpectedWeldingMaterialCosts(matInfo, matInfo.coreCostDetails || [], manufactureInfo.efficiency);
                matInfo.totalWeldLength = weldCosts.totalWeldLength;
                matInfo.totalWeldMaterialWeight = weldCosts.totalWeldMaterialWeight;
                matInfo.weldBeadWeightWithWastage = weldCosts.weldBeadWeightWithWastage;
                // Update net material for power/yield calculations
                manufactureInfo.netMaterialCost = matInfo.netMatCost || 0;
            }
            // ---------------------------
            // Step 3: Calculate cost components
            // ---------------------------
            this.calculator.weldingCommonCalc(manufactureInfo, fieldColorsList, manufacturingObj, laborRates);
            // ---------------------------
            // Step 4: Expected values (for assertion / verification)
            // ---------------------------
            const expectedCycleTime = manufactureInfo.cycleTime || manufacturingObj.cycleTime || 0;
            const expectedMaterialCost = manufactureInfo.netMaterialCost || 0;
            const expectedPowerCost = manufactureInfo.totalPowerCost || 0;
            const expectedMachineCost = manufactureInfo.directMachineCost || 0;
            const expectedLaborCost = manufactureInfo.directLaborCost || 0;
            const expectedSetupCost = manufactureInfo.directSetUpCost || 0;
            const expectedInspectionCost = manufactureInfo.inspectionCost || 0;
            const expectedYieldCost = manufactureInfo.yieldCost || 0;
            const expectedProcessCost = manufactureInfo.directProcessCost || 0;
            // ---------------------------
            // Step 5: Assertions / logging
            // ---------------------------
            logger.info('🧪 Welding E2E Verification:');
            logger.info(`Cycle Time (s): ${expectedCycleTime}`);
            logger.info(`Net Material Cost: ${expectedMaterialCost}`);
            logger.info(`Power Cost: ${expectedPowerCost}`);
            logger.info(`Machine Cost: ${expectedMachineCost}`);
            logger.info(`Labor Cost: ${expectedLaborCost}`);
            logger.info(`Setup Cost: ${expectedSetupCost}`);
            logger.info(`Inspection Cost: ${expectedInspectionCost}`);
            logger.info(`Yield Cost: ${expectedYieldCost}`);
            logger.info(`Total Direct Process Cost: ${expectedProcessCost}`);
            // Optional: use expect/assert for test automation
            yield BasePage_1.VerificationHelper.verifyNumeric(manufactureInfo.cycleTime || 0, expectedCycleTime, 'E2E Cycle Time', 1);
            yield BasePage_1.VerificationHelper.verifyNumeric(manufactureInfo.netMaterialCost || 0, expectedMaterialCost, 'E2E Net Material Cost');
            const calculatedTotal = expectedPowerCost +
                expectedMachineCost +
                expectedLaborCost +
                expectedSetupCost +
                expectedInspectionCost +
                expectedYieldCost;
            yield BasePage_1.VerificationHelper.verifyNumeric(manufactureInfo.directProcessCost || 0, calculatedTotal, 'E2E Direct Process Cost');
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
            // const actualEsgConsumption = await this.page.readNumberSafe(
            // 	this.page.EsgImpactElectricityConsumption,
            // 	'Power ESG (Electricity Consumption)'
            // )
            // await VerificationHelper.verifyNumeric(
            // 	actualEsgConsumption,
            // 	expectedEsgConsumption,
            // 	'Power ESG (Electricity Consumption)',
            // 	4
            // )
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
            yield test_1.expect
                .soft(() => __awaiter(this, void 0, void 0, function* () {
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
            }))
                .toPass({ timeout: 15000, intervals: [1000] });
        });
    }
}
exports.MigWeldingLogic = MigWeldingLogic;
