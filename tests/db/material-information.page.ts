import { Page, Locator, expect } from '@playwright/test';
import LoggerUtil from '../lib/LoggerUtil';

export class MaterialInformationPage {
    readonly page: Page;

    // -- Material Summary Table --
    readonly materialSummaryTable: Locator;
    readonly materialSummaryRows: Locator;

    // -- Material Details Section --
    readonly processGroupDropdown: Locator;

    // Material Selection
    readonly searchMaterialsInput: Locator;
    readonly categoryDropdown: Locator;
    readonly familyDropdown: Locator;
    readonly descriptionGradeDropdown: Locator;
    readonly stockFormDropdown: Locator;

    // Pricing
    readonly scrapPriceInput: Locator;
    readonly materialPriceInput: Locator;
    readonly volumePurchasedInput: Locator;
    readonly volumeDiscountInput: Locator;
    readonly discountedMaterialPriceInput: Locator;

    // -- Part Details Section --
    readonly partEnvelopeLengthInput: Locator;
    readonly partEnvelopeWidthInput: Locator;
    readonly partEnvelopeHeightInput: Locator;
    readonly netWeightInput: Locator;
    readonly partSurfaceAreaInput: Locator;
    readonly partVolumeInput: Locator;

    // -- Welding Details Section --
    readonly weldTypeDropdown: Locator;
    readonly weldSizeInput: Locator;

    // Weld 1 Specifics
    readonly weld1Section: Locator;
    readonly wireDiaInput: Locator;
    readonly weldElementSizeInput: Locator; // Often readonly/calculated
    readonly noOfWeldPassesInput: Locator;
    readonly weldLengthInput: Locator;
    readonly weldSideDropdown: Locator;
    readonly weldPlacesInput: Locator;
    readonly grindFlushDropdown: Locator;

    // Calculated Results
    readonly totalWeldLengthInput: Locator;
    readonly weldVolumeInput: Locator;

    constructor(page: Page) {
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

    async setProcessGroup(value: string) {
        await this.selectOption(this.processGroupDropdown, value);
    }

    async selectMaterial(category: string, family: string, grade: string, stockForm: string) {
        LoggerUtil.info(`Selecting material: ${category} > ${family} > ${grade}`);
        await this.selectOption(this.categoryDropdown, category);
        await this.selectOption(this.familyDropdown, family);
        await this.selectOption(this.descriptionGradeDropdown, grade);
        await this.selectOption(this.stockFormDropdown, stockForm);
    }

    async fillPricing(materialPrice: string, volumePurchased: string = '0', volumeDiscount: string = '0') {
        LoggerUtil.info('Filling pricing information');
        await this.materialPriceInput.fill(materialPrice);
        await this.volumePurchasedInput.fill(volumePurchased);
        await this.volumeDiscountInput.fill(volumeDiscount);
    }

    async fillPartDetails(length: string, width: string, height: string) {
        LoggerUtil.info(`Filling part details: ${length}x${width}x${height}`);
        await this.partEnvelopeLengthInput.fill(length);
        await this.partEnvelopeWidthInput.fill(width);
        await this.partEnvelopeHeightInput.fill(height);
        // Note: Weight/Area/Volume might be auto-calculated. 
        // If they are inputs, add methods to fill them.
    }

    async verifyNetWeight(expectedWeight: string) {
        await expect(this.netWeightInput).toHaveValue(expectedWeight);
    }

    async fillWeldingDetails(details: {
        type: string,
        size: string,
        wireDia?: string,
        length: string,
        side?: string,
        places?: string,
        grindFlush?: string
    }) {
        LoggerUtil.info(`Filling welding details for Weld 1`);
        await this.selectOption(this.weldTypeDropdown, details.type);
        await this.weldSizeInput.fill(details.size);

        if (details.wireDia) await this.wireDiaInput.fill(details.wireDia);
        await this.weldLengthInput.fill(details.length);

        if (details.side) await this.selectOption(this.weldSideDropdown, details.side);
        if (details.places) await this.weldPlacesInput.fill(details.places);
        if (details.grindFlush) await this.selectOption(this.grindFlushDropdown, details.grindFlush);
    }

    async verifyWeldCalculations(expectedElementSize: string, expectedVolume?: string) {
        LoggerUtil.info('Verifying weld calculations');
        // Check input value or text content depending on element type
        const val = await this.weldElementSizeInput.inputValue().catch(() => this.weldElementSizeInput.textContent());
        expect(Number(val)).toBe(Number(expectedElementSize));

        if (expectedVolume) {
            const vol = await this.weldVolumeInput.inputValue().catch(() => this.weldVolumeInput.textContent());
            expect(Number(vol)).toBeCloseTo(Number(expectedVolume), 2);
        }
    }

    async verifyMaterialInTable(description: string, cost: string) {
        LoggerUtil.info(`Verifying material in summary table: ${description}`);
        await expect(this.materialSummaryRows.filter({ hasText: description })).toBeVisible();
        await expect(this.materialSummaryRows.filter({ hasText: description })).toContainText(cost);
    }

    // Helper for Selects (handles standard select or custom divs if needed)
    private async selectOption(locator: Locator, label: string) {
        await locator.waitFor({ state: 'visible' });
        // Try standard select first
        try {
            await locator.selectOption({ label });
        } catch (e) {
            // If it's a custom dropdown (common in Angular/Material)
            await locator.click();
            await this.page.getByRole('option', { name: label, exact: true }).click();
        }
    }
}
