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
exports.MaterialInformationPage = void 0;
const test_1 = require("@playwright/test");
const LoggerUtil_1 = __importDefault(require("../lib/LoggerUtil"));
class MaterialInformationPage {
    constructor(page) {
        this.page = page;
        // Locators - Using getByLabel where appropriate for robustness or IDs based on typical conventions
        // Adjust selectors based on actual DOM ID/Classes if available.
        // Summary Table
        this.materialSummaryTable = page.getByRole('table', { name: /Material/i }); // Adjust name if needed
        this.materialSummaryRows = this.materialSummaryTable.locator('tbody tr');
        // Material Details
        this.processGroupDropdown = page.getByLabel('Process Group');
        // Material Selection
        this.searchMaterialsInput = page.getByLabel('Search Materials');
        this.categoryDropdown = page.getByLabel('Category');
        this.familyDropdown = page.getByLabel('Family');
        // If Description/Grade is a dropdown
        this.descriptionGradeDropdown = page.getByLabel('Description/Grade');
        this.stockFormDropdown = page.getByLabel('Stock Form');
        // Pricing
        this.scrapPriceInput = page.getByLabel('Scrap Price ($/Kg)');
        this.materialPriceInput = page.getByLabel('Material Price ($/Kg)', { exact: true });
        this.volumePurchasedInput = page.getByLabel('Volume Purchased (Ton/Contract)');
        this.volumeDiscountInput = page.getByLabel('Volume Discount (%)');
        this.discountedMaterialPriceInput = page.getByLabel('Discounted Material Price ($/Kg)');
        // Part Details
        this.partEnvelopeLengthInput = page.getByLabel('Part Envelope Length (mm)');
        this.partEnvelopeWidthInput = page.getByLabel('Part Envelope Width (mm)');
        this.partEnvelopeHeightInput = page.getByLabel('Part Envelope Height (mm)');
        this.netWeightInput = page.getByLabel('Net Weight (g)');
        this.partSurfaceAreaInput = page.getByLabel('Part Surface Area (mm^2)');
        this.partVolumeInput = page.getByLabel('Part Volume (mm^3)');
        // Welding Details
        // Assuming 'Weld Type' matches the first one found or scoped.
        // If there are multiple 'Weld Type' inputs, we might need specific IDs or scoping.
        this.weldTypeDropdown = page.locator('#WeldType1').or(page.getByLabel('Weld Type').first());
        this.weldSizeInput = page.locator('#WeldSize1').or(page.getByLabel('Weld Size (mm)').first());
        this.weld1Section = page.locator('text=Weld 1'); // Header for the section
        this.wireDiaInput = page.getByLabel('Wire Dia (mm)');
        this.weldElementSizeInput = page.locator('#WeldElementSize1').or(page.getByLabel('Weld Element Size (mm)'));
        this.noOfWeldPassesInput = page.getByLabel('No. of Weld Passes (Qty)');
        this.weldLengthInput = page.getByLabel('Weld Length (mm)');
        this.weldSideDropdown = page.getByLabel('Weld Side');
        this.weldPlacesInput = page.getByLabel('Weld Places (Qty)');
        this.grindFlushDropdown = page.getByLabel('Grind Flush');
        this.totalWeldLengthInput = page.getByLabel('Total Weld Length/Weld (mm)');
        this.weldVolumeInput = page.getByLabel('Weld Volume (mm)^3');
    }
    // --- Actions ---
    setProcessGroup(value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.selectOption(this.processGroupDropdown, value);
        });
    }
    selectMaterial(category, family, grade, stockForm) {
        return __awaiter(this, void 0, void 0, function* () {
            LoggerUtil_1.default.info(`Selecting material: ${category} > ${family} > ${grade}`);
            yield this.selectOption(this.categoryDropdown, category);
            yield this.selectOption(this.familyDropdown, family);
            yield this.selectOption(this.descriptionGradeDropdown, grade);
            yield this.selectOption(this.stockFormDropdown, stockForm);
        });
    }
    fillPricing(materialPrice_1) {
        return __awaiter(this, arguments, void 0, function* (materialPrice, volumePurchased = '0', volumeDiscount = '0') {
            LoggerUtil_1.default.info('Filling pricing information');
            yield this.materialPriceInput.fill(materialPrice);
            yield this.volumePurchasedInput.fill(volumePurchased);
            yield this.volumeDiscountInput.fill(volumeDiscount);
        });
    }
    fillPartDetails(length, width, height) {
        return __awaiter(this, void 0, void 0, function* () {
            LoggerUtil_1.default.info(`Filling part details: ${length}x${width}x${height}`);
            yield this.partEnvelopeLengthInput.fill(length);
            yield this.partEnvelopeWidthInput.fill(width);
            yield this.partEnvelopeHeightInput.fill(height);
            // Note: Weight/Area/Volume might be auto-calculated. 
            // If they are inputs, add methods to fill them.
        });
    }
    verifyNetWeight(expectedWeight) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, test_1.expect)(this.netWeightInput).toHaveValue(expectedWeight);
        });
    }
    fillWeldingDetails(details) {
        return __awaiter(this, void 0, void 0, function* () {
            LoggerUtil_1.default.info(`Filling welding details for Weld 1`);
            yield this.selectOption(this.weldTypeDropdown, details.type);
            yield this.weldSizeInput.fill(details.size);
            if (details.wireDia)
                yield this.wireDiaInput.fill(details.wireDia);
            yield this.weldLengthInput.fill(details.length);
            if (details.side)
                yield this.selectOption(this.weldSideDropdown, details.side);
            if (details.places)
                yield this.weldPlacesInput.fill(details.places);
            if (details.grindFlush)
                yield this.selectOption(this.grindFlushDropdown, details.grindFlush);
        });
    }
    verifyWeldCalculations(expectedElementSize, expectedVolume) {
        return __awaiter(this, void 0, void 0, function* () {
            LoggerUtil_1.default.info('Verifying weld calculations');
            // Check input value or text content depending on element type
            const val = yield this.weldElementSizeInput.inputValue().catch(() => this.weldElementSizeInput.textContent());
            (0, test_1.expect)(Number(val)).toBe(Number(expectedElementSize));
            if (expectedVolume) {
                const vol = yield this.weldVolumeInput.inputValue().catch(() => this.weldVolumeInput.textContent());
                (0, test_1.expect)(Number(vol)).toBeCloseTo(Number(expectedVolume), 2);
            }
        });
    }
    verifyMaterialInTable(description, cost) {
        return __awaiter(this, void 0, void 0, function* () {
            LoggerUtil_1.default.info(`Verifying material in summary table: ${description}`);
            yield (0, test_1.expect)(this.materialSummaryRows.filter({ hasText: description })).toBeVisible();
            yield (0, test_1.expect)(this.materialSummaryRows.filter({ hasText: description })).toContainText(cost);
        });
    }
    // Helper for Selects (handles standard select or custom divs if needed)
    selectOption(locator, label) {
        return __awaiter(this, void 0, void 0, function* () {
            yield locator.waitFor({ state: 'visible' });
            // Try standard select first
            try {
                yield locator.selectOption({ label });
            }
            catch (e) {
                // If it's a custom dropdown (common in Angular/Material)
                yield locator.click();
                yield this.page.getByRole('option', { name: label, exact: true }).click();
            }
        });
    }
}
exports.MaterialInformationPage = MaterialInformationPage;
