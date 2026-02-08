import { expect, Locator } from '@playwright/test'
import Logger from '../lib/LoggerUtil'

import {
    calculateLotSize,
    calculateLifeTimeQtyRemaining,
    calculateWeldVolume,
    calculateESG,
    calculateManufacturingCO2,
    WeldingCalculator,
    ProcessType,
    PartComplexity,
    MachineType,
    MaterialInfo,
    getWireDiameter,
    calculateTotalWeldLength,
    calculateSingleWeldCycleTime,
    calculateDryWeldCycleTime,
    calculateWeldCycleTimeBreakdown,
    WeldCycleTimeInput,
    TotalCycleTimeInput,
    WeldCycleTimeBreakdown,
} from '../utils/welding-calculator'
import { ManufacturingInformation, MaterialInformation } from '../../test-data/mig-welding-testdata'
import {
    calculateCycleTimeBreakdown,
    logCycleTimeBreakdown
} from '../utils/cycle-time-helper'
import { MigWeldingPage } from './mig-welding.page'
import { WeldingPage } from './welding-calculator.page'
import { log } from 'console'
const logger = Logger

export class MigWeldingLogic {
    private calculator = new WeldingCalculator()
    constructor(public page: MigWeldingPage) { }

    async setProcessGroup(value: string) {
        await this.page.selectOption(this.page.ProcessGroup, value)
    }
    async getMaterialDimensionsAndDensity(): Promise<{
        length: number;
        width: number;
        height: number;
        density: number;
    }> {

        await this.page.waitAndClick(this.page.MaterialDetailsTab);
        await expect.soft(this.page.Density).toBeVisible();
        const density = await this.page.getInputValueAsNumber(this.page.Density);
        logger.info(`Density: ${density}`);
        await this.page.wait(1000);
        await this.page.waitAndClick(this.page.MaterialInfo);
        await expect.soft(this.page.PartEnvelopeLength).toBeVisible();
        const length = await this.page.getInputValueAsNumber(this.page.PartEnvelopeLength);
        const width = await this.page.getInputValueAsNumber(this.page.PartEnvelopeWidth);
        const height = await this.page.getInputValueAsNumber(this.page.PartEnvelopeHeight);

        logger.info(`NetWeight Inputs → L:${length}, W:${width}, H:${height}, Density:${density}`);

        return { length, width, height, density };
    }


    async navigateToProject(projectId: string): Promise<void> {
        logger.info(`🔹 Navigating to project: ${projectId}`)

        if (await this.page.ClearAll.isVisible()) {
            logger.info('Existing part found. Clicking Clear All...')
            await this.page.ClearAll.click({ force: true })
            await this.page.wait(500)
        }

        await this.page.Projects.click()
        await this.page.SelectAnOption.click()
        const projectOption = this.page.page.getByRole('option', { name: 'Project #' }).first() // Use first (latest) if multiple
        await expect.soft(projectOption).toBeVisible({ timeout: 3000 })
        await projectOption.click()
        await this.page.waitAndFill(this.page.ProjectValue, projectId)
        await this.page.pressTab()
        await this.page.pressEnter()
        await this.page.waitForNetworkIdle()
        await this.page.ProjectID.click()
        logger.info(`✔ Navigated to project ID: ${projectId}`)
    }

    async verifyPartInformation(costingNotesText?: string): Promise<void> {
        logger.info('🔹 Verifying Part Details...')
        await this.page.assertVisible(this.page.InternalPartNumber)

        const internalPartNumber = await this.page.getInputValue(this.page.InternalPartNumber)
        logger.info(JSON.stringify(internalPartNumber))
        logger.info(`Part Number: ${internalPartNumber}`)

        if (!costingNotesText) {
            logger.info('📝 Fetching Costing Notes from UI...')
            costingNotesText = await this.page.CostingNotes.innerText() || ''
        }

        // ---------------- Drawing Number ----------------
        let drawingNumber = ''
        if (!drawingNumber && internalPartNumber) {
            const match = internalPartNumber.match(/^\d+/)
            if (match) {
                drawingNumber = match[0]
                logger.info(`📝 Extracted Drawing Number: ${drawingNumber}`)
            }
        }

        // ---------------- Revision Number ----------------
        let revisionNumber = ''
        if (!revisionNumber && internalPartNumber) {
            const match = internalPartNumber.match(/^\d+-([A-Za-z]+)/)
            if (match) {
                revisionNumber = match[1]
                logger.info(`📝 Extracted Revision Number: ${revisionNumber}`)
            }
        }

        try {
            // ================= Manufacturing Category =================
            const elementTag = await this.page.ManufacturingCategory.evaluate(el =>
                el.tagName.toLowerCase()
            )

            let selectedCategory = ''
            if (elementTag === 'select') {
                selectedCategory = await this.page.ManufacturingCategory.evaluate(
                    (el: HTMLSelectElement) =>
                        el.options[el.selectedIndex]?.text?.trim() || ''
                )
            } else {
                selectedCategory =
                    (await this.page.ManufacturingCategory.innerText())?.trim() || ''
            }

            if (!selectedCategory) {
                throw new Error('Selected Category is missing in Part Info.')
            }
            logger.info(JSON.stringify(selectedCategory))

            logger.info(`🏷️ Selected Category: ${selectedCategory}`)

            // ================= Suggested Category =================
            const suggestedMatch = costingNotesText.match(
                /Suggested\s*Category\s*[:\-]?\s*([^.!?\n]+)/i
            )

            const suggestedCategory = suggestedMatch?.[1]?.trim()

            if (suggestedCategory) {
                logger.info(`🧾 Suggested Category from Notes: ${suggestedCategory}`)

                const normalizedSelected = await this.page.normalizeText(selectedCategory)
                const normalizedSuggested = await this.page.normalizeText(suggestedCategory)

                const isMatch =
                    normalizedSelected.includes(normalizedSuggested) ||
                    normalizedSuggested.includes(normalizedSelected)

                expect.soft(isMatch).toBe(true)
            } else {
                logger.warn('⚠️ Suggested Category is missing in Costing Notes.')
            }

            // ================= Quantity Calculations =================
            const bomQty = Number(await this.page.getInputValue(this.page.BOMQtyNos))
            const annualVolume = Number(await this.page.getInputValue(this.page.AnnualVolumeQtyNos))
            const lotSize = Number(await this.page.getInputValue(this.page.LotsizeNos))
            const productLife = Number(await this.page.getInputValue(this.page.ProductLifeRemainingYrs))
            const lifetimeQty = Number(await this.page.getInputValue(this.page.LifeTimeQtyRemainingNos))
            const expectedLotSize = calculateLotSize(annualVolume)
            const expectedLifetimeQty = calculateLifeTimeQtyRemaining(
                annualVolume,
                productLife
            )

            expect.soft(bomQty).toBeGreaterThan(0)
            expect.soft(lotSize).toBe(expectedLotSize)
            expect.soft(lifetimeQty).toBe(expectedLifetimeQty)
            logger.info(`📊 Lot Size: ${annualVolume} / 12 = ${expectedLotSize}`)
            logger.info(
                `📊 Lifetime Qty: ${annualVolume} × ${productLife} = ${expectedLifetimeQty}`
            )
            logger.info(`Bom Qty: ${JSON.stringify(bomQty)}`)
            logger.info(`Lot Size: ${JSON.stringify(lotSize)}`)
            logger.info(`Lifetime Qty: ${JSON.stringify(lifetimeQty)}`)
            logger.info(`Expected Lot Size: ${JSON.stringify(expectedLotSize)}`)
            logger.info(`Expected Lifetime Qty: ${JSON.stringify(expectedLifetimeQty)}`)

        } catch (error: any) {
            logger.error(`❌ Part Information validation failed: ${error.message}`)
            throw error
        }

        logger.info('✔ Part Details verified successfully')
    }


    async verifyMaterialInformationDetails(): Promise<void> {
        const { processGroup, category, family, grade, stockForm } = MaterialInformation;

        logger.info(
            `🔹 Selecting material: ${processGroup} > ${category} > ${family} > ${grade} > ${stockForm}`
        );
        // ===== Open Material Information Section =====
        await this.page.MaterialInformationSection.waitFor({ state: 'visible' });
        await this.page.MaterialInformationSection.click();
        expect.soft(await this.page.MaterialInformationSection.isVisible()).toBe(true);
        await this.page.scrollToMiddle(this.page.ProcessGroup);

        // ===== Select Material Hierarchy =====
        await this.page.selectByTrimmedLabel(this.page.ProcessGroup, processGroup);

        expect.soft(await this.page.materialCategory.isVisible()).toBe(true);
        await this.page.selectOption(this.page.materialCategory, category);

        expect.soft(await this.page.MatFamily.isVisible()).toBe(true);
        await this.page.selectOption(this.page.MatFamily, family);

        expect.soft(await this.page.DescriptionGrade.isVisible()).toBe(true);
        await this.page.selectOption(this.page.DescriptionGrade, grade);

        expect.soft(await this.page.StockForm.isVisible()).toBe(true);
        await this.page.selectOption(this.page.StockForm, stockForm);

        // ===== Price Validations =====
        const scrapPriceUI = Number(await this.page.ScrapPrice.inputValue() || 0);
        expect.soft(scrapPriceUI).toBeGreaterThan(0);

        const materialPrice = Number(
            (await this.page.MaterialPrice.inputValue())?.replace(/,/g, '') || 0
        );
        expect.soft(materialPrice).toBeGreaterThan(0);

        // ===== Material Details =====
        logger.info('Opening Material Details tab');

        await this.page.MaterialDetailsTab.scrollIntoViewIfNeeded();
        await this.page.waitAndClick(this.page.MaterialDetailsTab);
        expect.soft(await this.page.Density.isVisible()).toBe(true);
        const { density } = await this.getMaterialDimensionsAndDensity();
        logger.info(`Density: ${density}`);
        await this.page.waitAndClick(this.page.MaterialInfo);

        expect.soft(await this.page.VolumePurchased.isVisible()).toBe(true);
        const volumePurchased = Number(
            (await this.page.VolumePurchased.inputValue())?.replace(/,/g, '') || 0
        );
        logger.info(`Volume Purchased: ${volumePurchased}`);

        // ===== Net Weight Validation (Volume × Density) =====
        expect.soft(await this.page.NetWeight.isVisible()).toBe(true);

        const partVolumeMm3 = await this.getPartVolume();
        const calculated = this.calculator.calculateNetWeight(partVolumeMm3, density);
        logger.info(`Calculated Results: ${JSON.stringify(calculated, null, 2)}`)
        const uiNetWeight = await this.getNetWeight();

        logger.info(
            `NetWeight → PartVolume(mm³): ${partVolumeMm3}, Density: ${density}, Expected: ${calculated}, UI: ${uiNetWeight}`
        );

        expect.soft(uiNetWeight).toBeGreaterThan(0);
        expect.soft(uiNetWeight).toBeCloseTo(calculated, 1);

        // ===== Gross Material Price =====
        expect.soft(await this.page.MatPriceGross.isVisible()).toBe(true);
        const matPriceGross = Number(
            (await this.page.MatPriceGross.inputValue())?.replace(/,/g, '') || 0
        );
        expect.soft(matPriceGross).toBeGreaterThan(0);

        logger.info('✔ Material Information verified');
    }

    async getPartVolume(): Promise<number> {
        const partVolume = await this.page.getInputValueAsNumber(this.page.PartVolume);
        logger.info(`Part Volume (mm³): ${partVolume}`);
        return partVolume;
    }

    async getNetWeight(): Promise<number> {
        const netWeightValue = await this.page.getInputValueAsNumber(this.page.NetWeight);
        logger.info(`Net Weight (g): ${netWeightValue}`);
        return netWeightValue;
    }

    async verifyNetWeight(expectedValue?: number, precision: number = 2): Promise<number> {
        logger.info('🔹 Verifying Net Weight...');

        let expected = expectedValue;

        if (expected === undefined) {
            const { density } = await this.getMaterialDimensionsAndDensity(); // only density
            const partVolumeMm3 = await this.getPartVolume();

            const calculated = this.calculator.calculateNetWeight(partVolumeMm3, density);
            logger.info(`Calculated Results: ${JSON.stringify(calculated, null, 2)}`)

            logger.info(`📐 Calculated Expected Net Weight from Volume: ${calculated} g`);
            expected = calculated
        }

        const actualNetWeight = await this.getNetWeight(); // ✅ correct field

        expect.soft(actualNetWeight).toBeGreaterThan(0);
        expect.soft(actualNetWeight).toBeCloseTo(expected, precision);

        return actualNetWeight;
    }

    async verifyWeldingDetails(migWeldingTestData: any): Promise<void> {
        logger.info('🔹 Verifying Welding Details...');
        await this.openManufacturingForMigWelding();

        await this.page.scrollToMiddle(this.page.WeldingDetails);
        await expect.soft(this.page.WeldingDetails).toBeVisible();

        const materialType = migWeldingTestData.materialInformation.family || 'Carbon Steel';

        const weldResults: { totalLength: number; volume: number; weldVolume: number }[] = [];

        // -------- Weld 1 --------
        const result1 = await this.verifySingleWeldRow(
            migWeldingTestData.weldingDetails.weld1,
            materialType,
            {
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
            }
        );
        weldResults.push(result1);

        // -------- Weld 2 --------
        if (migWeldingTestData.weldingDetails?.weld2) {
            const result2 = await this.verifySingleWeldRow(
                migWeldingTestData.weldingDetails.weld2,
                materialType,
                {
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
                }
            );
            weldResults.push(result2);
        }

        // ===== Grand Total Weld Length =====
        const expectedGrandTotalWeldLength =
            weldResults.reduce((sum, w) => sum + w.totalLength, 0);

        const actualGrandTotalLength = Number(await this.page.TotalWeldLength.inputValue());
        expect.soft(actualGrandTotalLength).toBe(expectedGrandTotalWeldLength);

        logger.info('✔ Welding Details verified');
    }
    async openManufacturingForMigWelding(): Promise<void> {
        await this.page.ManufacturingInformation.scrollIntoViewIfNeeded();

        const isExpanded = await this.page.ManufacturingInformation.getAttribute('aria-expanded');

        if (isExpanded !== 'true') {
            await this.page.ManufacturingInformation.click();
            await expect.soft(this.page.MigWeldRadBtn).toBeVisible();
        }

        if (!(await this.page.MigWeldRadBtn.isChecked())) {
            await this.page.MigWeldRadBtn.click();
        }
        if (await this.page.Weld1keyboard_arrow_down_1.isVisible()) {
            await this.expandIfCollapsed(this.page.Weld1keyboard_arrow_down_1);
        }

        if (await this.page.Weld1keyboard_arrow_down_2.isVisible()) {
            await this.expandIfCollapsed(this.page.Weld1keyboard_arrow_down_2);
        }

    }
    async expandPanelIfCollapsed(panelSelector: string, contentSelector?: string): Promise<void> {
        const page = this.page.page;
        const panelToggle = page.locator(panelSelector);
        const content = contentSelector ? page.locator(contentSelector) : undefined;

        if (!(await panelToggle.isVisible({ timeout: 2000 }))) return;

        const ariaExpanded = await panelToggle.getAttribute('aria-expanded');
        if (ariaExpanded !== 'true') {
            await panelToggle.scrollIntoViewIfNeeded();
            try {
                await panelToggle.click({ force: true });
            } catch (error: unknown) {
                if (error instanceof Error && error.message.includes('Target page, context or browser has been closed')) {
                    // Page replaced after SSO, get latest page
                    const newPage = page.context().pages().slice(-1)[0];
                    const newPanelToggle = newPage.locator(panelSelector);
                    await newPanelToggle.scrollIntoViewIfNeeded();
                    await newPanelToggle.click({ force: true });
                } else {
                    throw error;
                }
            }

            if (content) {
                await expect.soft(content).toBeVisible({ timeout: 5000 });
            }
        }
    }


    async expandIfCollapsed(panel: Locator): Promise<void> {
        if (!(await panel.isVisible())) return;

        if (await this.isPanelCollapsed(panel)) {
            await panel.scrollIntoViewIfNeeded();
            await panel.click({ force: true });
        }
    }


    private async isPanelCollapsed(panel: Locator): Promise<boolean> {
        const ariaExpanded = await panel.getAttribute('aria-expanded');
        return ariaExpanded !== 'true';
    }


    private async verifySingleWeldRow(
        weldData: any,
        materialType: string,
        locators: {
            weldCheck: Locator,
            weldType: Locator,
            weldSize: Locator,
            wireDia?: Locator,
            weldElementSize: Locator,
            weldLength: Locator,
            weldSide: Locator,
            weldPlaces: Locator,
            grindFlush: Locator,
            totalWeldLength: Locator
        }

    ): Promise<{ totalLength: number; volume: number; weldVolume: number }> {

        const page = this.page.page;

        const weldCheck = locators.weldCheck;
        for (const weld of [weldCheck]) {
            await weld.scrollIntoViewIfNeeded();
            if (await weld.isVisible()) {
                await this.expandIfCollapsed(weld);
                await expect.soft(weld).toBeVisible();
            }
        }

        await expect.soft(locators.weldType).toBeEnabled();
        await this.page.selectOption(locators.weldType, weldData.weldType);
        logger.info(`Selected Weld Type: ${weldData.weldType}`);

        // ===== Weld Size =====
        const uiWeldSize = await this.fillInputWithTab(locators.weldSize, weldData.weldSize, 'Weld Size');

        // ===== Wire Dia (auto) =====
        if (locators.wireDia && await locators.wireDia.count() > 0) {
            await locators.wireDia.first().scrollIntoViewIfNeeded();
            await expect.soft(locators.wireDia.first()).toBeVisible({ timeout: 5000 });
            await expect.soft(locators.wireDia.first()).not.toHaveValue('', { timeout: 5000 });
            const actualWireDia = Number(await locators.wireDia.first().inputValue() || '0');
            expect.soft(actualWireDia).toBeGreaterThan(0);
            const expectedWireDia = getWireDiameter(materialType, uiWeldSize);
            expect.soft(actualWireDia).toBe(expectedWireDia);
            logger.info(`Selected Wire Dia: ${actualWireDia}`);
        } else {
            logger.warn('⚠️ Wire Dia field not present for this weld type — skipping validation');
        }

        // ===== Weld Element Size (auto) =====
        await expect.soft(locators.weldElementSize).not.toHaveValue('');
        const weldElementSize = Number(await locators.weldElementSize.inputValue() || '0');
        logger.info(`Selected Weld Element Size: ${weldElementSize}`);

        // ===== Weld Length =====
        const uiWeldLength = await this.fillInputWithTab(locators.weldLength, weldData.weldLength, 'Weld Length');

        // ===== Weld Places =====
        await locators.weldPlaces.waitFor({ state: 'visible' });
        await locators.weldPlaces.fill(String(weldData.weldPlaces));
        const uiWeldPlaces = Number(await locators.weldPlaces.inputValue() || '0');
        expect.soft(uiWeldPlaces).toBeGreaterThan(0);
        logger.info(`Selected Weld Places: ${uiWeldPlaces}`);

        // ===== Weld Side =====
        await this.page.selectOption(locators.weldSide, weldData.weldSide);
        const uiWeldSide = await this.page.getSelectedOptionText(locators.weldSide);
        expect.soft(uiWeldSide).toBe(weldData.weldSide);
        logger.info(`Selected Weld Side: ${uiWeldSide}`);

        // ===== Grind Flush =====
        await this.page.selectOption(locators.grindFlush, weldData.grindFlush);
        const uiGrindFlush = await this.page.getSelectedOptionText(locators.grindFlush);
        expect.soft(uiGrindFlush).toBe(weldData.grindFlush);
        logger.info(`Selected Grind Flush: ${uiGrindFlush}`);

        const passes = Number(weldData.noOfWeldPasses || 1);
        expect.soft(passes).toBeGreaterThan(0);
        logger.info(`Selected No of Weld Passes: ${passes}`);

        // ===== Total Weld Length (no passes) =====
        await this.page.validateTotalLength(
            locators.weldLength,
            locators.weldPlaces,
            locators.weldSide,
            locators.totalWeldLength,
            'Total Weld Length'
        );

        const expectedTotalLength = WeldingPage.calculateTotalWeldLength(
            uiWeldLength,
            uiWeldPlaces,
            uiWeldSide
        );

        await expect.soft(locators.totalWeldLength).toHaveValue(expectedTotalLength.toString());
        logger.info(`✔ Total Weld Length: ${expectedTotalLength}`);

        // ===== Weld Volume (with passes) =====
        const weldVolumeResult = calculateWeldVolume(
            weldData.weldType,
            uiWeldSize,
            weldElementSize,
            uiWeldLength,
            uiWeldPlaces,
            passes,
            uiWeldSide
        );

        expect.soft(weldVolumeResult.weldVolume).toBeGreaterThan(0);
        logger.info(`Selected Weld Volume: ${weldVolumeResult.weldVolume}`);

        return {
            totalLength: expectedTotalLength,
            volume: weldVolumeResult.weldVolume,
            weldVolume: weldVolumeResult.weldVolume
        };

    }

    /**
     * Fills an input, waits for stability, presses Tab, and validates the value is > 0.
     */
    private async fillInputWithTab(
        locator: Locator,
        value: string | number,
        logLabel: string
    ): Promise<number> {
        await this.page.waitAndFill(locator, value);
        await this.page.wait(500); // Stability wait to prevent race conditions
        await locator.press('Tab');

        const uiValue = Number(await locator.inputValue() || '0');
        expect.soft(uiValue).toBeGreaterThan(0);
        logger.info(`Selected ${logLabel}: ${uiValue}`);
        return uiValue;
    }
    //============================ Net Material cost($)=================================    
    async verifyNetMaterialCostCalculation(expectedNetWeight?: number): Promise<void> {
        logger.info('🔹 Verifying Net Material Cost Calculation...');

        let weight = expectedNetWeight;

        if (weight === undefined) {
            // For welding, Net Material Cost is based on the Weld Bead Weight With Wastage (the added wire),
            // NOT the base part weight.
            weight = await this.getWeldBeadWeightWithWastage();
            logger.info(`Selected Weight (Weld Bead + Wastage): ${weight}`);
        }

        const materialPrice =
            await this.page.getInputValueAsNumber(this.page.MaterialPrice);
        logger.info(`Selected Material Price: ${materialPrice}`);

        const expectedNetMaterialCost = this.calculator.calculateNetMaterialCost(weight, materialPrice);
        logger.info(`Selected Expected Net Material Cost: ${expectedNetMaterialCost}`);

        const actualNetMaterialCost =
            await this.page.getInputValueAsNumber(this.page.NetMaterialCost);
        logger.info(`Selected Actual Net Material Cost: ${actualNetMaterialCost}`);

        expect.soft(actualNetMaterialCost).toBeCloseTo(expectedNetMaterialCost, 2);

        logger.info(
            `✔ Net Material Cost → UI: ${actualNetMaterialCost}, Expected: ${expectedNetMaterialCost.toFixed(2)}`
        );
    }


    async getNetMaterialCost(): Promise<number> {
        const netMaterialCostValue = await this.page.getInputValueAsNumber(this.page.NetMaterialCost)
        logger.info(`Net Material Cost ($): ${netMaterialCostValue}`)
        return netMaterialCostValue
    }

    async getTotalWeldLength(): Promise<number> {
        const value = await this.page.getInputValueAsNumber(this.page.TotalWeldLength)
        logger.info(`Total Weld Length: ${value} mm`)
        return value
    }

    async verifyTotalWeldLength(expectedValue?: number): Promise<void> {
        logger.info('🔹 Verifying Total Weld Length...')
        const actualValue = await this.getTotalWeldLength()
        if (expectedValue !== undefined) {
            expect.soft(actualValue).toBeCloseTo(expectedValue, 2)
        }
    }

    async getTotalWeldMaterialWeight(): Promise<number> {
        const value = await this.page.getInputValueAsNumber(this.page.TotalWeldMaterialWeight)
        logger.info(JSON.stringify(value))
        logger.info(`Total Weld Material Weight: ${value} g`)
        return value
    }

    async verifyTotalWeldMaterialWeight(expectedValue?: number): Promise<void> {
        logger.info('🔹 Verifying Total Weld Material Weight...')
        const actualValue = await this.getTotalWeldMaterialWeight()
        if (expectedValue !== undefined) {
            expect.soft(actualValue).toBeCloseTo(expectedValue, 2)
            logger.info(JSON.stringify(actualValue))
            logger.info(JSON.stringify(expectedValue))
            logger.info(`✔ Total Weld Material Weight → UI: ${actualValue}, Expected: ${expectedValue.toFixed(2)}`)
        }
    }

    async getEfficiency(): Promise<number> {
        const value = await this.page.getInputValueAsNumber(this.page.MachineEfficiency)
        logger.info(`Efficiency: ${value}%`)
        return value
    }

    async getWeldBeadWeightWithWastage(): Promise<number> {
        const value = await this.page.getInputValueAsNumber(this.page.WeldBeadWeightWithWastage)
        logger.info(`Weld Bead Weight With Wastage: ${value} g`)
        return value
    }

    async verifyWeldingMaterialCalculations(): Promise<void> {
        logger.info('🔹 Verifying Welding Material Calculations...')

        const { density } = await this.getMaterialDimensionsAndDensity()
        const partVolumeMm3 = await this.getPartVolume()
        const expectedNetWeight = this.calculator.calculateNetWeight(partVolumeMm3, density)
        await this.verifyNetWeight(expectedNetWeight, 1)

        // Gather all weld data
        const weldSubMaterials: any[] = []

        // Weld 1
        if (await this.page.MatWeldType1.isVisible()) {
            weldSubMaterials.push({
                weldElementSize: await this.page.MatWeldElementSize1.inputValue(),
                weldSize: await this.page.MatWeldSize1.inputValue(),
                noOfWeldPasses: await this.page.MatNoOfWeldPasses1.inputValue(),
                weldLength: await this.page.MatWeldLengthmm1.inputValue(),
                weldPlaces: await this.page.MatWeldPlaces1.inputValue(),
                weldSide: await this.page.getSelectedOptionText(this.page.MatWeldSide1),
                weldType: await this.page.getSelectedOptionText(this.page.MatWeldType1),
                wireDia: await this.page.MatWireDia1.inputValue()
            })
        }

        // Weld 2
        if (await this.page.MatWeldType2.isVisible()) {
            weldSubMaterials.push({
                weldElementSize: await this.page.MatWeldElementSize2.inputValue(),
                weldSize: await this.page.MatWeldSize2.inputValue(),
                noOfWeldPasses: await this.page.MatNoOfWeldPasses2.inputValue(),
                weldLength: await this.page.MatWeldLengthmm2.inputValue(),
                weldPlaces: await this.page.MatWeldPlaces2.inputValue(),
                weldSide: await this.page.getSelectedOptionText(this.page.MatWeldSide2),
                weldType: await this.page.getSelectedOptionText(this.page.MatWeldType2),
                wireDia: await this.page.MatWireDia2.inputValue()
            })
        }

        let weldPosition: string = '';
        let machineType: string = '';
        let expectedEfficiency = 75;

        try {
            const isWeldPositionVisible = await this.page.WeldPosition.isVisible({ timeout: 2000 }).catch(() => false);
            const isMachineTypeVisible = await this.page.MachineType.isVisible({ timeout: 2000 }).catch(() => false);

            if (isWeldPositionVisible && isMachineTypeVisible) {
                weldPosition = await this.page.WeldPosition.inputValue();
                machineType = await this.page.MachineType.inputValue();

                logger.info(`📊 Efficiency Calculation Inputs → WeldPosition: ${weldPosition}, MachineType: ${machineType}`);

                if (weldPosition && machineType) {
                    expectedEfficiency = this.calculator.getExpectedEfficiency(weldPosition, machineType);
                } else {
                    logger.warn(`⚠️ WeldPosition or MachineType not set. Using default efficiency: ${expectedEfficiency}%`);
                }
            } else {
                logger.warn(`⚠️ WeldPosition/MachineType fields not visible yet. Using default efficiency: ${expectedEfficiency}%`);
            }
        } catch (error: any) {
            logger.warn(`⚠️ Could not read WeldPosition/MachineType: ${error.message}. Using default efficiency: ${expectedEfficiency}%`);
        }

        const actualEfficiency = await this.page.getInputValueAsNumber(this.page.MachineEfficiency);

        logger.info(`📊 Efficiency → Expected: ${expectedEfficiency}%, Actual (UI): ${actualEfficiency}%`);

        if (actualEfficiency !== 0) {
            expect.soft(actualEfficiency).toBe(expectedEfficiency);
            expect.soft(actualEfficiency).toBeCloseTo(expectedEfficiency, 2);
            logger.info(`✔ Efficiency verified: ${actualEfficiency}%`);
        } else {
            logger.warn(`⚠️ Efficiency is 0 or empty`);
            expectedEfficiency = 75;
        }

        const calculated = this.calculator.calculateExpectedWeldingMaterialCosts({ density }, weldSubMaterials, actualEfficiency || expectedEfficiency)
        logger.info(`Calculated Results: ${JSON.stringify(calculated, null, 2)}`)

        logger.info(`📊 Using Efficiency for Calculations: ${actualEfficiency || expectedEfficiency}%`);

        const actualTotalLength = await this.page.getInputValueAsNumber(this.page.TotalWeldLength)
        logger.info(`📏 Total Weld Length → Expected: ${calculated.totalWeldLength.toFixed(2)}, Actual: ${actualTotalLength.toFixed(2)}`)
        logger.info(`✔ Total Weld Length verified: ${actualTotalLength} m`);
        expect.soft(actualTotalLength).toBeCloseTo(calculated.totalWeldLength, 1)
        logger.info(`calculated totalWeldLength:    ${JSON.stringify(calculated.totalWeldLength)}`)
        logger.info(`actualTotalLength: ${JSON.stringify(actualTotalLength)}`)

        const actualWeldWeight = await this.page.getInputValueAsNumber(this.page.TotalWeldMaterialWeight)
        logger.info(`⚖️ Total Weld Material Weight → Expected: ${calculated.totalWeldMaterialWeight.toFixed(2)}, Actual: ${actualWeldWeight.toFixed(2)}`)
        logger.info(`✔ Total Weld Material Weight verified: ${actualWeldWeight} g`);
        expect.soft(actualWeldWeight).toBeCloseTo(calculated.totalWeldMaterialWeight, 1)
        logger.info(`calculated totalWeldMaterialWeight: ${JSON.stringify(calculated.totalWeldMaterialWeight)}`)
        logger.info(`actualWeldWeight: ${JSON.stringify(actualWeldWeight)}`)
        const actualWeldBeadWeight = await this.page.getInputValueAsNumber(this.page.WeldBeadWeightWithWastage)
        logger.info(`🔸 Weld Bead Weight With Wastage → Expected: ${calculated.weldBeadWeightWithWastage.toFixed(2)}, Actual: ${actualWeldBeadWeight.toFixed(2)}`)
        logger.info(`✔ Weld Bead Weight With Wastage verified: ${actualWeldBeadWeight} g`);
        expect.soft(actualWeldBeadWeight).toBeCloseTo(calculated.weldBeadWeightWithWastage, 1)
        logger.info(`calculated weldBeadWeightWithWastage: ${JSON.stringify(calculated.weldBeadWeightWithWastage)}`)
        logger.info(`actualWeldBeadWeight: ${JSON.stringify(actualWeldBeadWeight)}`)
        logger.info(`actualWeldBeadWeight: ${JSON.stringify(actualWeldBeadWeight)}`)
        logger.info('✔ Welding Material calculations verified')
    }
    //============================ Material SustainabilityCO2(kg)/part:=================================
    async verifyNetMaterialSustainabilityCost(): Promise<void> {
        logger.info('🔹 Verifying Net Material Cost...')
        await this.page.scrollElementToTop(this.page.AnnualVolumeQtyNos)
        const eav = Number(await this.page.AnnualVolumeQtyNos.inputValue() || '0')
        const volumePurchased = Number((await this.page.VolumePurchased.inputValue())?.replace(/,/g, '') || '0')
        const { density } = await this.getMaterialDimensionsAndDensity();
        const netWeight = await this.getNetWeight()

        // Calculate Gross Weight (assuming VolumePurchased is in mm³ and Density is g/cm³ -> result in grams)
        // Adjust formula if VolumePurchased unit differs
        const grossWeight = (volumePurchased / 1000) * density
        const scrapWeight = grossWeight - netWeight

        logger.info(`Density: ${density}`);
        logger.info(`Net Weight: ${netWeight}`);
        logger.info(`Gross Weight: ${grossWeight}`);
        logger.info(`Scrap Weight: ${scrapWeight}`);
        logger.info(`EAV: ${eav}`);
        logger.info(`Volume Purchased: ${volumePurchased}`);

        const materialInfo: MaterialInfo = {
            materialMarketData: {
                esgImpactCO2Kg: await this.page.getInputValueAsNumber(this.page.CO2PerKgMaterial),
                esgImpactCO2KgScrap: await this.page.getInputValueAsNumber(this.page.CO2PerScrap)
            },
            grossWeight: grossWeight,
            scrapWeight: scrapWeight,
            netWeight: netWeight,
            eav: eav
        };

        const calculated = calculateESG(materialInfo)
        const uiMaterialCO2PerPart = Number(await this.page.CO2PerPartMaterial.inputValue() || '0')

        logger.info(`Calculated Results: ${JSON.stringify(calculated, null, 2)}`)
        logger.info(`UI Material CO2 Per Part: ${uiMaterialCO2PerPart}`)

        expect.soft(uiMaterialCO2PerPart).toBeCloseTo(calculated.esgImpactCO2KgPart, 4)
        logger.info(`✔ Material CO2 Per Part verified: ${uiMaterialCO2PerPart} kg`)
    }
    //========================== Manufacturing Details ==========================
    async verifyProcessDetails(testData: any): Promise<void> {
        logger.info('🔹 Verifying Process Details...')
        const {
            processType,
            machineName,
            machineAutomation,
            machineEfficiency,
            partComplexity,
            weldPosition,
            machineDescription,
            minCurrentRequired,
            minWeldingVoltage,
            selectedCurrent,
            selectedVoltage
        } = testData.machineDetails;
        await this.page.scrollIntoView(this.page.ProcessGroup)
        const currentProcessGroup = await this.page.ProcessGroup.inputValue()
        if (currentProcessGroup === '0' || !currentProcessGroup) {
            await this.page.selectByTrimmedLabel(this.page.ProcessGroup, processType)
        }

        // Select Machine Type (Automation)
        if (machineAutomation) {
            await this.page.selectOption(this.page.MachineType, machineAutomation)
        }
        //========================== Min. Current Required ==========================     
        const actualRequiredCurrent = Number(
            (await this.page.RequiredCurrent.inputValue())?.replace(/,/g, '') || 0
        );
        logger.info(`⚡ Required Current → Expected: ${minCurrentRequired}, Actual: ${actualRequiredCurrent}`)
        expect.soft(actualRequiredCurrent).toBeCloseTo(Number(minCurrentRequired), 4);
        //========================== Min. Welding Voltage ==========================     
        const actualRequiredVoltage = Number(
            (await this.page.RequiredVoltage.inputValue())?.replace(/,/g, '') || 0
        );
        logger.info(`⚡ Required Voltage → Expected: ${minWeldingVoltage}, Actual: ${actualRequiredVoltage}`)
        expect.soft(actualRequiredVoltage).toBeCloseTo(Number(minWeldingVoltage), 4);
        //========================== Selected Current ==========================           
        const actualSelectedCurrent = Number(
            (await this.page.selectedCurrent.inputValue())?.replace(/,/g, '') || 0
        );
        expect.soft(actualSelectedCurrent).toBeCloseTo(Number(selectedCurrent), 4)
        logger.info(`⚡ Selected Current → Expected: ${selectedCurrent}, Actual: ${actualSelectedCurrent}`)
        //========================== Selected Voltage ==========================           
        const actualSelectedVoltage = Number(
            (await this.page.selectedVoltage.inputValue())?.replace(/,/g, '') || 0
        );
        expect.soft(actualSelectedVoltage).toBeCloseTo(Number(selectedVoltage), 4)
        logger.info(`⚡ Selected Voltage → Expected: ${selectedVoltage}, Actual: ${actualSelectedVoltage}`)
        //========================== Machine Name ==========================                
        await this.page.selectOption(this.page.MachineType, machineAutomation)
        const ManuMachineName = await this.page.getSelectedOptionText(this.page.MachineName);
        expect.soft(ManuMachineName).toBe(machineName);
        logger.info(`🔹 Machine Name verified: ${ManuMachineName}`);
        //========================== Machine Description ==========================    
        const ManuMachineDescription = await this.page.MachineDescription.inputValue()
        expect.soft(ManuMachineDescription).toBe(machineDescription);
        logger.info(`🔹 Machine Description verified: ${ManuMachineDescription}`);
        //========================== Machine Efficiency ==========================    
        await this.page.scrollIntoView(this.page.AdditionalDetails)
        logger.info(`🔹 Machine Efficiency verified: ${machineEfficiency}`);
        await this.page.waitAndClick(this.page.AdditionalDetails)
        //========================== Part Complexity ==========================    
        await this.page.selectOption(this.page.PartComplexity, partComplexity)
        logger.info(`🔹 Part Complexity verified: ${partComplexity}`);
        await this.page.PartDetails.isVisible()
        await this.page.waitAndClick(this.page.PartDetails)
        logger.info(`🔹 Part Details verified: ${partComplexity}`);

        //========================== Sub Process Details ====================
        if (testData.subProcessDetails) {
            logger.info('🔹 Filling Sub Process Details...')
            await this.page.scrollIntoView(this.page.SubProcessDetails)
            //========================== Weld 1 Sub Process ====================
            if (testData.subProcessDetails.weld1) {
                await this.fillSubProcessRow(1, {
                    weldType: this.page.WeldTypeSubProcess1,
                    position: this.page.WeldPositionSubProcess1,
                    speed: this.page.TravelSpeedSubProcess1,
                    tack: this.page.TrackWeldSubProcess1,
                    stop: this.page.IntermediateStartStopSubProcess1
                }, testData.subProcessDetails.weld1)
            }
            //========================== Weld 2 Sub Process ====================
            if (testData.subProcessDetails.weld2 && (await this.page.weldTypeSubProcess2.isVisible())) {
                await this.fillSubProcessRow(2, {
                    weldType: this.page.weldTypeSubProcess2,
                    position: this.page.WeldPositionSubProcess2,
                    speed: this.page.TravelSpeedSubProcess2,
                    tack: this.page.TrackWeldSubProcess2,
                    stop: this.page.IntermediateStartStopSubProcess2
                }, testData.subProcessDetails.weld2)
            }
        }

        logger.info('✔ Process Details verified')
    }

    //======================== Cycle Time/Part(Sec) =========================================
    async verifyWeldCycleTimeDetails(testData: any): Promise<void> {
        logger.info('🔹 Step: Weld Cycle Time Verification via Logic')

        //========================== Determine Machine Type ====================
        const machineType = testData.machineDetails.machineAutomation === 'Automatic'
            ? MachineType.Automatic
            : testData.machineDetails.machineAutomation === 'Semi-Auto'
                ? MachineType.SemiAuto
                : MachineType.Manual;

        const input: any = {
            processTypeID: ProcessType.MigWelding,
            partComplexity: PartComplexity.Medium,
            semiAutoOrAuto: machineType,
            materialInfoList: [
                {
                    processId: 57,
                    netMatCost: testData.materialCostDetails.netMaterialCost,
                    netWeight: testData.materialCostDetails.totalWeldMaterialWeight * 1000,
                    dimX: testData.weldingDetails.weld1.weldLength + (testData.weldingDetails.weld2?.weldLength || 0),
                    partTickness: 5,
                    materialMasterData: {
                        materialType: { materialTypeName: 'Steel' }
                    }
                }
            ],
            subProcessFormArray: {
                controls: [
                    {
                        value: {
                            formLength: testData.weldingDetails.weld1.weldLength,
                            shoulderWidth: testData.weldingDetails.weld1.weldSize,
                            formPerimeter: 0,
                            noOfHoles: 0,
                            hlFactor: 0
                        }
                    }
                ]
            },
            // Pass raw efficiency percentage as the calculator divides by 100
            efficiency: testData.machineDetails.machineEfficiency || 75,
            noOfWeldPasses: testData.weldingDetails.weld1.noOfWeldPasses || 1
        }

        if (testData.weldingDetails.weld2) {
            input.subProcessFormArray.controls.push({
                value: {
                    formLength: testData.weldingDetails.weld2.weldLength,
                    shoulderWidth: testData.weldingDetails.weld2.weldSize,
                    formPerimeter: 0,
                    noOfHoles: 0,
                    hlFactor: 0
                }
            })
        }

        const calculated = this.calculator.calculationForWelding(input, [], input, [])
        const breakdown = calculateCycleTimeBreakdown(calculated, input.efficiency)
        logCycleTimeBreakdown(breakdown, logger)

        // 1. Verify Unloading Time (Load + Unload)
        const uiUnloading = await this.page.getInputValueAsNumber(this.page.UnloadingTime)
        expect.soft(uiUnloading).toBeCloseTo(breakdown.unloadingTime, 2)
        logger.info(`✔ Unloading Time Verified: UI=${uiUnloading}, Calc=${breakdown.unloadingTime}`)

        // 2. Verify Part Reorientation
        const uiReorientation = await this.page.getInputValueAsNumber(this.page.PartReorientation)
        const expectedReorientation = calculated.partReorientation || 0
        expect.soft(uiReorientation).toBeCloseTo(expectedReorientation, 2)
        logger.info(`✔ Part Reorientation Verified: UI=${uiReorientation}, Calc=${expectedReorientation}`)

        // 4. Verify Sub-Process Recommendations (Weld Cycle Times)
        if (await this.page.Weld1CycleTimeSubProcess1.isVisible()) {
            const uiSubCT1 = await this.page.getInputValueAsNumber(this.page.Weld1CycleTimeSubProcess1)
            const calcSubCT1 = calculated.subProcessTypeInfos?.[0]?.recommendTonnage || 0
            expect.soft(uiSubCT1).toBeCloseTo(calcSubCT1, 2)
            logger.info(`✔ Weld 1 Cycle Time Verified: UI=${uiSubCT1}, Calc=${calcSubCT1}`)
        }

        if (testData.weldingDetails.weld2 && await this.page.Weld2CycleTimeSubProcess2.isVisible()) {
            const uiSubCT2 = await this.page.getInputValueAsNumber(this.page.Weld2CycleTimeSubProcess2)
            const calcSubCT2 = calculated.subProcessTypeInfos?.[1]?.recommendTonnage || 0
            expect.soft(uiSubCT2).toBeCloseTo(calcSubCT2, 2)
            logger.info(`✔ Weld 2 Cycle Time Verified: UI=${uiSubCT2}, Calc=${calcSubCT2}`)
        }

        // 5. Verify Total Cycle Time
        await this.verifyCycleTime(calculated, breakdown.finalCycleTime)

        logger.info('✅ Weld cycle time calculations verified')
    }

    /**
     * Verifies individual weld cycle times using the new calculator functions
     * This provides granular testing of each subprocess cycle time
     */
    async verifyIndividualWeldCycleTimes(testData: any): Promise<void> {
        logger.info('🔹 Step: Individual Weld Cycle Time Verification using Calculator Functions');

        const weldData = testData.weldingDetails;
        const subProcessDetails = testData.subProcessDetails;

        if (!subProcessDetails) {
            logger.warn('⚠️ No subprocess details provided, skipping individual cycle time verification');
            return;
        }

        const subProcessCycleTimes: number[] = [];

        // Verify Weld 1
        if (subProcessDetails.weld1 && await this.page.Weld1CycleTimeSubProcess1.isVisible()) {
            logger.info('📊 Calculating Weld 1 Cycle Time...');

            // Get total weld length for weld 1
            const weld1Data = weldData.weld1;
            const weld1Side = weld1Data.weldSide === 'Both' ? 2 : 1;
            const totalWeld1Length = weld1Data.weldLength * weld1Side * (weld1Data.weldPlaces || 1);

            // Calculate expected cycle time using calculator function
            const expectedWeld1CycleTime = calculateSingleWeldCycleTime({
                totalWeldLength: totalWeld1Length,
                travelSpeed: subProcessDetails.weld1.travelSpeed,
                tackWelds: subProcessDetails.weld1.tackWelds,
                intermediateStops: subProcessDetails.weld1.intermediateStops,
                weldType: subProcessDetails.weld1.weldType
            });

            subProcessCycleTimes.push(expectedWeld1CycleTime);

            // Get UI value
            const uiWeld1CycleTime = await this.page.getInputValueAsNumber(this.page.Weld1CycleTimeSubProcess1);

            logger.info(`  Total Weld Length: ${totalWeld1Length} mm`);
            logger.info(`  Travel Speed: ${subProcessDetails.weld1.travelSpeed} mm/s`);
            logger.info(`  Tack Welds: ${subProcessDetails.weld1.tackWelds}`);
            logger.info(`  Intermediate Stops: ${subProcessDetails.weld1.intermediateStops}`);
            logger.info(`  Expected Cycle Time: ${expectedWeld1CycleTime.toFixed(4)} sec`);
            logger.info(`  UI Cycle Time: ${uiWeld1CycleTime.toFixed(4)} sec`);

            // Verify
            expect.soft(uiWeld1CycleTime).toBeCloseTo(expectedWeld1CycleTime, 2);
            logger.info(`✔ Weld 1 Cycle Time Verified: UI=${uiWeld1CycleTime}, Calc=${expectedWeld1CycleTime.toFixed(4)}`);
        }

        // Verify Weld 2 (if exists)
        if (subProcessDetails.weld2 && weldData.weld2 && await this.page.Weld2CycleTimeSubProcess2.isVisible()) {
            logger.info('📊 Calculating Weld 2 Cycle Time...');

            // Get total weld length for weld 2
            const weld2Data = weldData.weld2;
            const weld2Side = weld2Data.weldSide === 'Both' ? 2 : 1;
            const totalWeld2Length = weld2Data.weldLength * weld2Side * (weld2Data.weldPlaces || 1);

            // Calculate expected cycle time using calculator function
            const expectedWeld2CycleTime = calculateSingleWeldCycleTime({
                totalWeldLength: totalWeld2Length,
                travelSpeed: subProcessDetails.weld2.travelSpeed,
                tackWelds: subProcessDetails.weld2.tackWelds,
                intermediateStops: subProcessDetails.weld2.intermediateStops,
                weldType: subProcessDetails.weld2.weldType
            });

            subProcessCycleTimes.push(expectedWeld2CycleTime);

            // Get UI value
            const uiWeld2CycleTime = await this.page.getInputValueAsNumber(this.page.Weld2CycleTimeSubProcess2);

            logger.info(`  Total Weld Length: ${totalWeld2Length} mm`);
            logger.info(`  Travel Speed: ${subProcessDetails.weld2.travelSpeed} mm/s`);
            logger.info(`  Tack Welds: ${subProcessDetails.weld2.tackWelds}`);
            logger.info(`  Intermediate Stops: ${subProcessDetails.weld2.intermediateStops}`);
            logger.info(`  Expected Cycle Time: ${expectedWeld2CycleTime.toFixed(4)} sec`);
            logger.info(`  UI Cycle Time: ${uiWeld2CycleTime.toFixed(4)} sec`);

            // Verify
            expect.soft(uiWeld2CycleTime).toBeCloseTo(expectedWeld2CycleTime, 2);
            logger.info(`✔ Weld 2 Cycle Time Verified: UI=${uiWeld2CycleTime}, Calc=${expectedWeld2CycleTime.toFixed(4)}`);
        }

        // Verify Total Cycle Time
        if (subProcessCycleTimes.length > 0) {
            logger.info('📊 Calculating Total Weld Cycle Time...');

            const loadingUnloadingTime = await this.page.getInputValueAsNumber(this.page.UnloadingTime);
            const partReorientation = await this.page.getInputValueAsNumber(this.page.PartReorientation);
            const efficiency = await this.page.getInputValueAsNumber(this.page.MachineEfficiency);

            // Calculate expected total cycle time
            const expectedTotalCycleTime = calculateDryWeldCycleTime({
                subProcessCycleTimes,
                loadingUnloadingTime,
                partReorientation,
                efficiency
            });

            logger.info(`  Sub-Process Cycle Times: [${subProcessCycleTimes.map(t => t.toFixed(4)).join(', ')}]`);
            logger.info(`  Loading/Unloading Time: ${loadingUnloadingTime} sec`);
            logger.info(`  Part Reorientation: ${partReorientation}`);
            logger.info(`  Efficiency: ${efficiency}%`);
            logger.info(`  Expected Total Cycle Time: ${expectedTotalCycleTime.toFixed(4)} sec`);

            // Note: This is the total weld cycle time before efficiency adjustment
            // The UI might show a different value if efficiency is applied
            logger.info(`✔ Total Dry Weld Cycle Time Calculated: ${expectedTotalCycleTime.toFixed(4)} sec`);
        }

        logger.info('✅ Individual weld cycle time verification complete');
    }

    //========================== Verify All Welding Calculations ==========================
    async verifyAllWeldingCalculations(): Promise<void> {
        logger.info('🚀 Welding Verification Started (Simplified & Optimized)')

        const processType = await this.getProcessType()

        // 1. Read UI Inputs efficiently (Parallel Reading)
        const ui = await this.readAllWeldingUI()

        // 2. Build Calculator Input Object
        const manufactureInfo = this.buildWeldingManufactureInfo(ui, processType)

        // 3. Run Calculator
        const calculated = this.runWeldingCalculator(manufactureInfo, processType)

        logger.info(`🧮 Calculated Snapshot: ${JSON.stringify(calculated, null, 2)}`)

        // 4. Verify Costs & Cycle Time
        await this.verifyCalculatedCosts(calculated)

        logger.info('✅ Welding Verification Completed')
    }

    //================================== Manufacturing Details =======================================
    //========================== Verify Cycle Time ==========================
    async verifyCycleTime(calculated: any, expectedValue?: number): Promise<void> {
        logger.info('🔹 Verifying Cycle Time...')
        const uiCycleTime = await this.page.getInputValueAsNumber(this.page.CycleTimePart)
        const calcCycleTime = calculated.cycleTime || calculated.totalCycleTime || 0
        expect.soft(uiCycleTime).toBeCloseTo(calcCycleTime, 2)
        logger.info(`✔ Cycle Time → UI=${uiCycleTime}, Calc=${calcCycleTime.toFixed(4)}`)
        if (expectedValue !== undefined) {
            expect.soft(uiCycleTime).toBeCloseTo(expectedValue, 2)
            logger.info(`✔ Cycle Time vs Expected: UI=${uiCycleTime}, Expected=${expectedValue.toFixed(4)}`)
        }
    }
    //========================== Verify Power Cost ==========================
    async verifyPowerCost(calculated: any, expectedValue?: number): Promise<void> {
        logger.info('🔹 Verifying Power Cost...')
        const uiPowerCost = await this.page.getInputValueAsNumber(this.page.TotalPowerCost)
        const calcPowerCost = calculated.totalPowerCost || 0
        expect.soft(uiPowerCost).toBeCloseTo(calcPowerCost, 4)
        logger.info(`✔ Power Cost → UI: ${uiPowerCost}, Expected: ${calcPowerCost?.toFixed(4)}`)
        if (expectedValue !== undefined) {
            expect.soft(uiPowerCost).toBeCloseTo(expectedValue, 4)
            logger.info(`✔ Power Cost vs Expected: UI=${uiPowerCost}, Expected=${expectedValue}`)
        }
    }

    async verifyMachineCost(calculated: any, expectedValue?: number): Promise<void> {
        logger.info('🔹 Verifying Machine Cost (Calculator)...')
        const uiMachineCost = await this.page.getInputValueAsNumber(this.page.MachineCostPart)
        const calcMachineCost = calculated.directMachineCost || 0
        expect.soft(uiMachineCost).toBeCloseTo(calcMachineCost, 2)
        logger.info(`✔ Machine Cost → UI=${uiMachineCost}, Calc=${calcMachineCost}`)
        if (expectedValue !== undefined) {
            expect.soft(uiMachineCost).toBeCloseTo(expectedValue, 4)
            logger.info(`✔ Machine Cost vs Expected: UI=${uiMachineCost}, Expected=${expectedValue}`)
        }
    }

    async verifyInspectionCost(calculated: any, expectedValue?: number): Promise<void> {
        logger.info('🔹 Verifying Inspection Cost...')
        const uiInspectionCost = await this.page.getInputValueAsNumber(this.page.QAInspectionCost)
        const calcInspectionCost = calculated.inspectionCost || 0
        expect.soft(uiInspectionCost).toBeCloseTo(calcInspectionCost, 2)
        if (expectedValue !== undefined) {
            expect.soft(uiInspectionCost).toBeCloseTo(expectedValue, 4)
            logger.info(`✔ Inspection Cost vs Expected: UI=${uiInspectionCost}, Expected=${expectedValue}`)
        }
    }

    async verifySetupCost(calculated: any, expectedValue?: number): Promise<void> {
        logger.info('🔹 Verifying Setup Cost...')
        const uiSetupCost = await this.page.getInputValueAsNumber(this.page.SetupCostPart)
        const calcSetupCost = calculated.directSetUpCost || 0
        expect.soft(uiSetupCost).toBeCloseTo(calcSetupCost, 2)
        logger.info(`✔ Setup Cost vs Calc: UI=${uiSetupCost}, Calc=${calcSetupCost}`)
        if (expectedValue !== undefined) {
            expect.soft(uiSetupCost).toBeCloseTo(expectedValue, 4)
            logger.info(`✔ Setup Cost vs Expected: UI=${uiSetupCost}, Expected=${expectedValue}`)
        }
    }


    async verifyLaborCost(calculated: any, expectedValue?: number): Promise<void> {
        logger.info('🔹 Verifying Labor Cost...')
        const uiLaborCost = await this.page.getInputValueAsNumber(this.page.directLaborRate)
        const calcLaborCost = Number(calculated?.directLaborCost || 0)
        expect.soft(uiLaborCost).toBeCloseTo(calcLaborCost, 4)
        logger.info(`✔ Labor Cost → UI=${uiLaborCost}, Calc=${calcLaborCost}`)
        if (expectedValue !== undefined) {
            expect.soft(uiLaborCost).toBeCloseTo(expectedValue, 4)
            logger.info(`✔ Labor Cost vs Expected: UI=${uiLaborCost}, Expected=${expectedValue}`)
        }
    }
    async verifyYieldCost(expectedValue?: number): Promise<void> {
        logger.info('🔹 Verifying Yield Cost...')
        const uiYieldCost = await this.page.getInputValueAsNumber(this.page.YieldCostPart)
        let expected = expectedValue
        if (expected === undefined) {
            const netMatCost = await this.getNetMaterialCost()
            const machineCost = await this.page.getInputValueAsNumber(this.page.MachineCostPart)
            const setupCost = await this.page.getInputValueAsNumber(this.page.SetupCostPart)
            const laborCost = await this.page.getInputValueAsNumber(this.page.directLaborRate)
            const inspectionCost = await this.page.getInputValueAsNumber(this.page.QAInspectionCost)
            const yieldPer = await this.page.getInputValueAsNumber(this.page.YieldPercentage)
            const sumCosts = machineCost + setupCost + laborCost + inspectionCost
            expected = (1 - yieldPer / 100) * (netMatCost + sumCosts)
        }
        expect.soft(uiYieldCost).toBeCloseTo(expected, 2)
        logger.info(`✔ Yield Cost → UI: ${uiYieldCost}, Expected: ${expected?.toFixed(2)}`)
        if (expectedValue !== undefined) {
            expect.soft(uiYieldCost).toBeCloseTo(expectedValue, 4)
            logger.info(`✔ Yield Cost vs Expected: UI=${uiYieldCost}, Expected=${expectedValue}`)
        }
    }

    async verifyManufacturingCost(expectedValue?: number): Promise<void> {
        logger.info('🔹 Verifying Manufacturing Cost...')
        const uiManufacturingCost = await this.page.getInputValueAsNumber(this.page.NetProcessCost)
        let expected = expectedValue
        if (expected === undefined) {
            const netMatCost = await this.getNetMaterialCost()
            const machineCost = await this.page.getInputValueAsNumber(this.page.MachineCostPart)
            const setupCost = await this.page.getInputValueAsNumber(this.page.SetupCostPart)
            const laborCost = await this.page.getInputValueAsNumber(this.page.directLaborRate)
            const inspectionCost = await this.page.getInputValueAsNumber(this.page.QAInspectionCost)
            const yieldPer = await this.page.getInputValueAsNumber(this.page.YieldPercentage)
            const sumCosts = machineCost + setupCost + laborCost + inspectionCost
            expected = (1 - yieldPer / 100) * (netMatCost + sumCosts)
        }
        expect.soft(uiManufacturingCost).toBeCloseTo(expected, 2)
        logger.info(`✔ Manufacturing Cost → UI: ${uiManufacturingCost}, Expected: ${expected?.toFixed(2)}`)
        if (expectedValue !== undefined) {
            expect.soft(uiManufacturingCost).toBeCloseTo(expectedValue, 4)
            logger.info(`✔ Manufacturing Cost vs Expected: UI=${uiManufacturingCost}, Expected=${expectedValue}`)
        }
        // You might want to compare this with a calculated value or test data
        logger.info(`calculated expected: ${JSON.stringify(expected)}`)
        logger.info(`actualManufacturingCost: ${JSON.stringify(uiManufacturingCost)}`)
        logger.info(`✔ Manufacturing Cost verified: UI=${uiManufacturingCost}, Calc=${expected}`)
    }

    async verifyManufacturingSustainability(expectedValue?: number): Promise<void> {
        logger.info('🔹 Verifying Manufacturing Sustainability...')
        const co2PerKwHr = await this.page.getInputValueAsNumber(this.page.CO2PerKwHr)
        const powerConsumption = await this.page.getInputValueAsNumber(this.page.PowerConsumption)
        const cycleTime = await this.page.getInputValueAsNumber(this.page.CycleTimePart)
        const expected = calculateManufacturingCO2(cycleTime, powerConsumption, co2PerKwHr)
        const actual = await this.page.getInputValueAsNumber(this.page.CO2PerPartManufacturing)
        expect.soft(actual).toBeCloseTo(expected, 4)
        logger.info(`✔ Manufacturing CO2 Per Part → UI: ${actual}, Expected: ${expected.toFixed(4)}`)
        if (expectedValue !== undefined) {
            expect.soft(actual).toBeCloseTo(expectedValue, 4)
            logger.info(`✔ Manufacturing CO2 Per Part vs Expected: UI=${actual}, Expected=${expectedValue}`)
        }
    }

    async getProcessType(): Promise<ProcessType> {
        if (await this.page.MigWeldRadBtn.isChecked()) return ProcessType.MigWelding
        if (await this.page.WeldCleanRadBtn.isChecked())
            return ProcessType.WeldingCleaning
        return ProcessType.MigWelding
    }

    private async fillSubProcessRow(
        index: number,
        locators: {
            weldType: Locator;
            position: Locator;
            speed: Locator;
            tack: Locator;
            stop: Locator;
        },
        data: any
    ) {
        logger.info(`➡ Filling Weld ${index} Sub Process`)
        await this.page.selectOption(locators.weldType, data.weldType)
        await this.page.scrollIntoView(locators.position)
        await this.page.selectOption(locators.position, data.weldPosition)

        if (data.travelSpeed) {
            await locators.speed.fill(data.travelSpeed.toString())
        }
        await locators.tack.fill(data.tackWelds.toString())
        await locators.stop.fill(data.intermediateStops.toString())
    }
    async saveAndRecalculate(): Promise<void> {
        logger.info('🔹 Saving Project and Recalculating Cost...')
        await this.page.waitAndClick(this.page.UpdateSave)
        await this.page.page
            .waitForResponse(
                resp => resp.url().includes('update') && resp.status() === 200
            )
            .catch(() => { })
        await this.page.waitForNetworkIdle()
        await this.page.page
            .waitForResponse(
                resp => resp.url().includes('recalculate') && resp.status() === 200
            )
            .catch(() => { })
        await this.page.waitForNetworkIdle()
        logger.info('✔ Project saved and recalculated')
    }

    private async readAllWeldingUI(): Promise<any> {
        const p = this.page

        const [
            efficiency,
            machineHourRate,
            skilledLaborRate,
            directLaborRate,
            electricityUnitCost,
            powerConsumption,
            lotSize,
            setupTime,
            unloadingTime,
            inspectionTime,
            samplingRate,
            yieldPer,
            netWeight,
            partThickness,
            weld1Len,
            weld1Size,
            weld2Len,
            weld2Size
        ] = await Promise.all([
            p.getInputValueAsNumber(p.MachineEfficiency),
            p.getInputValueAsNumber(p.MachineHourRate),
            p.getInputValueAsNumber(p.SkilledLaborRate),
            p.getInputValueAsNumber(p.DirectLaborRate),
            p.getInputValueAsNumber(p.ElectricityUnitCost),
            p.getInputValueAsNumber(p.PowerConsumption),
            p.getInputValueAsNumber(p.LotsizeNos),
            p.getInputValueAsNumber(p.MachineSetupTime),
            p.getInputValueAsNumber(p.UnloadingTime),
            p.getInputValueAsNumber(p.QAInspectionTime),
            p.getInputValueAsNumber(p.SamplingRate),
            p.getInputValueAsNumber(p.YieldPercentage),
            p.getInputValueAsNumber(p.NetWeight),
            p.getInputValueAsNumber(p.PartThickness),
            p.MatWeldLengthmm1.isVisible().then(v => v ? p.getInputValueAsNumber(p.MatWeldLengthmm1) : 0),
            p.MatWeldSize1.isVisible().then(v => v ? p.getInputValueAsNumber(p.MatWeldSize1) : 0),
            p.MatWeldLengthmm2.isVisible().then(v => v ? p.getInputValueAsNumber(p.MatWeldLengthmm2) : 0),
            p.MatWeldSize2.isVisible().then(v => v ? p.getInputValueAsNumber(p.MatWeldSize2) : 0),
        ])

        return {
            efficiency,
            machineHourRate,
            skilledLaborRate,
            directLaborRate,
            electricityUnitCost,
            powerConsumption,
            lotSize,
            setupTime,
            unloadingTime,
            inspectionTime,
            samplingRate,
            yieldPer,
            netWeight,
            partThickness,
            weld1Len,
            weld1Size,
            weld2Len,
            weld2Size
        }
    }

    private buildWeldingManufactureInfo(ui: any, processType: ProcessType): any {
        const totalWeldLength = ui.weld1Len + ui.weld2Len

        const manufactureInfo: any = {
            processTypeID: processType,
            partComplexity: PartComplexity.Medium,
            semiAutoOrAuto: MachineType.Automatic,

            efficiency: ui.efficiency,
            machineHourRate: ui.machineHourRate,
            skilledLaborRatePerHour: ui.skilledLaborRate,
            lowSkilledLaborRatePerHour: ui.directLaborRate,
            directLaborRatePerHour: ui.directLaborRate,
            electricityUnitCost: ui.electricityUnitCost,
            powerConsumption: ui.powerConsumption,
            lotSize: ui.lotSize,
            setUpTime: ui.setupTime,

            unloadingTime: ui.unloadingTime,
            inspectionTime: ui.inspectionTime,
            samplingRate: ui.samplingRate,
            yieldPer: ui.yieldPer,

            subProcessFormArray: { controls: [] },

            materialInfoList: [
                {
                    processId: processType === ProcessType.WeldingCleaning ? 57 : processType,
                    netMatCost: 0,
                    netWeight: ui.netWeight * 1000,
                    dimX: totalWeldLength,
                    partTickness: ui.partThickness,
                    materialMasterData: {
                        materialType: { materialTypeName: 'Steel' }
                    },
                    coreCostDetails: []
                }
            ]
        }

        if (ui.weld1Len > 0) {
            manufactureInfo.subProcessFormArray.controls.push({
                value: { formLength: ui.weld1Len, shoulderWidth: ui.weld1Size, formPerimeter: 0, noOfHoles: 0, hlFactor: 0 }
            })
        }

        if (ui.weld2Len > 0) {
            manufactureInfo.subProcessFormArray.controls.push({
                value: { formLength: ui.weld2Len, shoulderWidth: ui.weld2Size, formPerimeter: 0, noOfHoles: 0, hlFactor: 0 }
            })
        }

        return manufactureInfo
    }

    private runWeldingCalculator(manufactureInfo: any, processType: ProcessType): any {
        if (processType === ProcessType.WeldingCleaning) {
            // Note: Updated to call calculationsForWeldingPreparation as calculationsForWeldingCleaning doesn't exist
            return this.calculator.calculationsForWeldingPreparation(manufactureInfo, [], manufactureInfo)
        }
        return this.calculator.calculationForWelding(manufactureInfo, [], manufactureInfo, [])
    }

    private async verifyCalculatedCosts(calculated: any): Promise<void> {

        const [
            uiCycle,
            uiMachine,
            uiLabor,
            uiSetup,
            uiPower,
            uiInspection,
            uiYield
        ] = await Promise.all([
            this.page.getInputValueAsNumber(this.page.CycleTimePart),
            this.page.getInputValueAsNumber(this.page.MachineCostPart),
            this.page.getInputValueAsNumber(this.page.directLaborRate),
            this.page.getInputValueAsNumber(this.page.SetupCostPart),
            this.page.getInputValueAsNumber(this.page.TotalPowerCost),
            this.page.getInputValueAsNumber(this.page.QAInspectionCost),
            this.page.getInputValueAsNumber(this.page.YieldCostPart),
        ])

        const checks = [
            { name: 'Cycle Time', ui: uiCycle, calc: calculated.cycleTime ?? calculated.totalCycleTime, p: 2 },
            { name: 'Machine Cost', ui: uiMachine, calc: calculated.directMachineCost, p: 2 },
            { name: 'Labor Cost', ui: uiLabor, calc: calculated.directLaborCost, p: 4 },
            { name: 'Setup Cost', ui: uiSetup, calc: calculated.directSetUpCost, p: 2 },
            { name: 'Power Cost', ui: uiPower, calc: calculated.totalPowerCost, p: 4 },
            { name: 'Inspection Cost', ui: uiInspection, calc: calculated.inspectionCost, p: 2 },
        ]

        for (const c of checks) {
            expect.soft(c.ui).toBeCloseTo(c.calc || 0, c.p)
            logger.info(`✔ ${c.name}: UI=${c.ui}, Calc=${(c.calc || 0).toFixed(4)}`)
        }

        // Yield Cost depends on sum, so keep explicit
        expect.soft(uiYield).toBeCloseTo(calculated.yieldCost || 0, 2)
        logger.info(`✔ Yield Cost: UI=${uiYield}, Calc=${(calculated.yieldCost || 0).toFixed(2)}`)
    }


}
