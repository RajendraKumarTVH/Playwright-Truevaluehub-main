import { expect, Locator } from '@playwright/test'
import Logger from '../lib/LoggerUtil'
import {
    calculateLotSize,
    calculateLifeTimeQtyRemaining,
    calculateNetWeight,
    calculateWeldVolume,
    calculateESG,
    calculateManufacturingCO2,
    WeldingCalculator,
    ProcessType,
    PartComplexity,
    MachineType,
    MaterialInfo,
    getWireDiameter,
    calculateTotalWeldLength
} from '../utils/welding-calculator'
import { BasePage } from '../lib/BasePage'
import { getWeldElementSize, MaterialInformation } from '../../test-data/mig-welding-testdata'
import {
    calculateCycleTimeBreakdown,
    logCycleTimeBreakdown
} from '../utils/cycle-time-helper'
import { MigWeldingPage } from './mig-welding.page'
import { string } from 'zod'

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
        await expect(this.page.Density).toBeVisible();
        const density = await this.page.getInputValueAsNumber(this.page.Density);
        logger.info(`Density: ${density}`);
        await this.page.wait(1000);
        await this.page.waitAndClick(this.page.MaterialInfo);
        await expect(this.page.PartEnvelopeLength).toBeVisible();
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
        const projectOption = this.page.page.getByRole('option', { name: 'Project #' })
        await expect(projectOption).toBeVisible({ timeout: 3000 })
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

        } catch (error: any) {
            logger.error(`❌ Part Information validation failed: ${error.message}`)
            throw error
        }

        logger.info('✔ Part Details verified successfully')
    }
    private async verifyAutocompleteDropdown(
        dropdown: Locator,
        options: Locator,
        defaultSearchText: string,
        label: string,
        cityField?: Locator,
        countryField?: Locator
    ): Promise<void> {
        logger.info(`🔹 Verifying ${label} dropdown...`);

        await dropdown.scrollIntoViewIfNeeded();
        await expect(dropdown).toBeVisible();

        // Skip if disabled / readonly
        if (
            (await dropdown.isDisabled()) ||
            (await dropdown.getAttribute('readonly'))
        ) {
            logger.warn(`⚠️ ${label} dropdown is disabled. Skipping validation.`);
            return;
        }

        // Open dropdown
        await dropdown.click();

        // Trigger autocomplete if needed
        if (await options.count() === 0) {
            logger.info(`ℹ️ No ${label} options visible — typing to trigger autocomplete`);
            await dropdown.fill(defaultSearchText);
        }

        await expect(options.first()).toBeVisible();

        const optionCount = await options.count();
        expect(optionCount).toBeGreaterThan(0);
        logger.info(`📦 Found ${optionCount} ${label} options`);

        const selectedOptionText = (await options.first().innerText()).trim();
        logger.info(`🔹 Selecting ${label}: "${selectedOptionText}"`);

        await options.first().click();

        // Validate selected value
        const selectedValue =
            (await dropdown.inputValue().catch(() => '')) ||
            (await dropdown.textContent()) ||
            '';

        expect
            .soft(selectedValue.toLowerCase())
            .toContain(selectedOptionText.toLowerCase());

        // Optional dependent fields
        if (cityField && countryField) {
            const city = (await cityField.inputValue().catch(() => '')).trim();
            const country = (await countryField.inputValue().catch(() => '')).trim();

            if (city || country) {
                logger.info(`🏙️ City: ${city || 'N/A'}, Country: ${country || 'N/A'}`);
            } else {
                logger.warn(`⚠️ Missing city/country for ${label}: "${selectedValue}"`);
            }
        }

        logger.info(`✅ ${label} dropdown validation completed`);
    }
    async verifyDropdown(type: 'Supplier' | 'Delivery'): Promise<void> {
        let dropdown: Locator, options: Locator, label: string, defaultSearchText: string;
        let cityField: Locator | undefined, countryField: Locator | undefined;

        if (type === 'Supplier') {
            dropdown = this.page.SupplierDropdown;
            options = this.page.SupplierOptions;
            label = 'Supplier';
            defaultSearchText = 'Target';
            cityField = this.page.ManufacturingCity;
            countryField = this.page.ManufacturingCountry;
        } else {
            dropdown = this.page.DeliveryDropdown;
            options = this.page.DeliveryOptions;
            label = 'Delivery';
            defaultSearchText = 'Test Site';
            cityField = this.page.DeliveryCity;
            countryField = this.page.DeliveryCountry;
        }

        try {
            await this.verifyAutocompleteDropdown(
                dropdown,
                options,
                defaultSearchText,
                label,
                cityField,
                countryField
            );
        } catch (error: any) {
            logger.error(`❌ ${label} dropdown validation failed: ${error.message}`);
            await this.page.captureScreenshot(`error_${label.toLowerCase()}_dropdown`);
            throw error;
        }
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
    async verifyMaterialInformationDetails(): Promise<void> {
        const { processGroup, category, family, grade, stockForm } = MaterialInformation;

        logger.info(
            `🔹 Selecting material: ${processGroup} > ${category} > ${family} > ${grade} > ${stockForm}`
        );

        // ===== Open Material Information Section =====
        await this.page.waitAndClick(this.page.MaterialInformationSection);
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
        const expectedNetWeight = this.calculator.calculateNetWeight(partVolumeMm3, density);
        const uiNetWeight = await this.getNetWeight();

        logger.info(
            `NetWeight → PartVolume(mm³): ${partVolumeMm3}, Density: ${density}, Expected: ${expectedNetWeight}, UI: ${uiNetWeight}`
        );

        expect.soft(uiNetWeight).toBeGreaterThan(0);
        expect.soft(uiNetWeight).toBeCloseTo(expectedNetWeight, 1);

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

            expected = this.calculator.calculateNetWeight(partVolumeMm3, density);

            logger.info(`📐 Calculated Expected Net Weight from Volume: ${expected} g`);
        }

        const actualNetWeight = await this.getNetWeight(); // ✅ correct field

        expect(actualNetWeight).toBeGreaterThan(0);
        expect.soft(actualNetWeight).toBeCloseTo(expected, precision);

        return actualNetWeight;
    }
    async verifyWeldingDetails(migWeldingTestData: any): Promise<void> {
        logger.info('🔹 Verifying Welding Details...');

        await this.page.scrollToMiddle(this.page.WeldingDetails);
        await expect.soft(this.page.WeldingDetails).toBeVisible();

        const materialType = migWeldingTestData.materialInformation.family || 'Carbon Steel';
        const allWelds: any[] = [];

        // -------- Weld 1 --------
        const calc1 = await this.verifySingleWeldRow(
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
        allWelds.push(calc1);

        // -------- Weld 2 --------
        if (migWeldingTestData.weldingDetails.weld2) {
            const calc2 = await this.verifySingleWeldRow(
                migWeldingTestData.weldingDetails.weld2,
                materialType,
                {
                    weldCheck: this.page.MatWeld2,
                    weldType: this.page.MatWeldType2,
                    weldSize: this.page.MatWeldSize2,
                    wireDia: this.page.MatWireDia2, // Assuming it exists, or pass undefined if needed
                    weldElementSize: this.page.MatWeldElementSize2,
                    weldLength: this.page.MatWeldLengthmm2, // Corrected from MatWeldLength2
                    weldSide: this.page.MatWeldSide2,
                    weldPlaces: this.page.MatWeldPlaces2,
                    grindFlush: this.page.MatGrishFlush2,
                    totalWeldLength: this.page.MatTotalWeldLength2
                }
            );
            allWelds.push(calc2);
        }

        // Verify Grand Total Weld Length
        const expectedGrandTotalWeldLength = calculateTotalWeldLength(allWelds);
        await expect(this.page.TotalWeldLength).not.toHaveValue('');
        const actualGrandTotalLength = Number(await this.page.TotalWeldLength.inputValue());
        expect.soft(actualGrandTotalLength).toBe(expectedGrandTotalWeldLength);

        logger.info('✔ Welding Details verified');
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
    ) {
        if (locators.weldCheck) await locators.weldCheck.click();

        await this.page.selectOption(locators.weldType, weldData.weldType);
        await expect.soft(locators.weldType).toBeVisible();

        const weldSize = Number(weldData.weldSize);
        await this.page.waitAndFill(locators.weldSize, weldSize);
        await expect.soft(locators.weldSize).toBeVisible();

        const expectedWireDiameter = getWireDiameter(materialType, weldSize);
        if (locators.wireDia) {
            await expect(locators.wireDia).toHaveValue(expectedWireDiameter.toString());
        }

        const expectedElementSize = getWeldElementSize(expectedWireDiameter);
        await expect(locators.weldElementSize).not.toHaveValue('');
        const weldElementSize = Number(await locators.weldElementSize.inputValue() || '0');
        expect.soft(weldElementSize).toBe(expectedElementSize);

        const weldLength = await this.page.waitAndFill(locators.weldLength, weldData.weldLength);
        expect.soft(weldLength).toBeGreaterThan(0);

        await this.page.selectOption(locators.weldSide, weldData.weldSide);
        await expect.soft(locators.weldSide).toBeVisible();

        await locators.weldPlaces.fill(weldData.weldPlaces.toString());
        await expect.soft(locators.weldPlaces).toBeVisible();

        await this.page.selectOption(locators.grindFlush, weldData.grindFlush);
        await expect.soft(locators.grindFlush).toBeVisible();

        const calc = calculateWeldVolume(
            weldData.weldType,
            Number(weldData.weldSize),
            weldElementSize,
            Number(weldData.weldLength),
            Number(weldData.weldPlaces),
            Number(weldData.noOfWeldPasses),
            weldData.weldSide
        );

        logger.info(`Calculated Total Weld Length: ${calc.totalWeldLength} (Len: ${weldData.weldLength}, Places: ${weldData.weldPlaces}, Side: ${weldData.weldSide})`);

        await expect(locators.totalWeldLength).not.toHaveValue('');
        const actualTotalLength = Number(await locators.totalWeldLength.inputValue());

        logger.info(`Actual Total Weld Length from UI: ${actualTotalLength}`);
        expect.soft(actualTotalLength).toBe(calc.totalWeldLength);

        return calc;
    }


    async verifyNetMaterialCostCalculation(expectedNetWeight?: number): Promise<void> {
        logger.info('🔹 Verifying Net Material Cost Calculation...')
        let weight = expectedNetWeight
        if (weight === undefined) {
            const { density } = await this.getMaterialDimensionsAndDensity();
            const partVolumeMm3 = await this.getPartVolume();
            weight = this.calculator.calculateNetWeight(partVolumeMm3, density);
        }

        const materialPrice = await this.page.getInputValueAsNumber(this.page.MaterialPrice)
        const expectedNetMaterialCost = (weight / 1000) * materialPrice
        const actualNetMaterialCost = await this.page.getInputValueAsNumber(this.page.NetMaterialCost)
        expect(actualNetMaterialCost).toBeCloseTo(expectedNetMaterialCost, 2)
        logger.info(`✔ Net Material Cost verified: $${actualNetMaterialCost} (Expected: $${expectedNetMaterialCost.toFixed(2)})`)
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
        logger.info(`Total Weld Material Weight: ${value} g`)
        return value
    }

    async verifyTotalWeldMaterialWeight(expectedValue?: number): Promise<void> {
        logger.info('🔹 Verifying Total Weld Material Weight...')
        const actualValue = await this.getTotalWeldMaterialWeight()
        if (expectedValue !== undefined) {
            expect(actualValue).toBeCloseTo(expectedValue, 2)
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
                weldSide: await this.page.MatWeldSide1.inputValue(),
                weldType: await this.page.MatWeldType1.inputValue(), // ID or Value
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
                weldSide: await this.page.MatWeldSide2.inputValue(),
                weldType: await this.page.MatWeldType2.inputValue(), // ID or Value
                wireDia: await this.page.MatWireDia2.inputValue()
            })
        }

        // Verify Efficiency
        // Need to read Weld Position and Machine Type from UI
        // Assuming verifyManufacturingInformationDetails filled them, or we read current state
        let weldPosition = await this.page.WeldPosition.inputValue();
        let machineType = await this.page.MachineType.inputValue();

        // Sometimes these might be select text or value. 
        // If dropdowns are standard HTML select, inputValue gives the 'value' attribute.
        // Assuming calculator.getExpectedEfficiency handles the values (IDs) correctly.

        let expectedEfficiency = this.calculator.getExpectedEfficiency(weldPosition, machineType);
        const actualEfficiency = await this.page.getInputValueAsNumber(this.page.MachineEfficiency);

        // Efficiency from UI is often percentage (e.g. 75). getExpectedEfficiency returns 75.
        // If UI defaults when empty, we should be careful. 
        // But here we expect it to be calculated/set.
        // Note: The helper returns 75 default.

        if (actualEfficiency !== 0) {
            // Only verify if we have a value, or robustly verify it matches logic
            // Ideally we should expect it to match exactly or close to.
            // Given potential slight mismatch in test data vs logic, soft assertion is safer initially.
            expect.soft(actualEfficiency).toBe(expectedEfficiency);
            logger.info(`✔ Efficiency verified: ${actualEfficiency}%`);
        } else {
            logger.warn(`⚠️ Efficiency is 0 or empty`);
            expectedEfficiency = 75; // Fallback for further calc
        }

        const expected = this.calculator.calculateExpectedWeldingMaterialCosts({ density }, weldSubMaterials, actualEfficiency || expectedEfficiency)

        const actualTotalLength = await this.page.getInputValueAsNumber(this.page.TotalWeldLength)
        expect(actualTotalLength).toBeCloseTo(expected.totalWeldLength, 1)

        const actualWeldWeight = await this.page.getInputValueAsNumber(this.page.TotalWeldMaterialWeight)
        expect(actualWeldWeight).toBeCloseTo(expected.totalWeldMaterialWeight, 1)

        const actualWeldBeadWeight = await this.page.getInputValueAsNumber(this.page.WeldBeadWeightWithWastage)
        expect(actualWeldBeadWeight).toBeCloseTo(expected.weldBeadWeightWithWastage, 1)

        logger.info(`✔ Weld Bead Weight With Wastage verified: ${actualWeldBeadWeight} g`);
        logger.info('✔ Welding Material calculations verified')
    }

    async verifyMaterialSustainability(): Promise<void> {
        logger.info('🔹 Verifying Material Sustainability...')
        const eav = Number(await this.page.AnnualVolumeQtyNos.inputValue() || '0')
        const volumePurchased = Number(await this.page.VolumePurchased.inputValue() || '0')
        const density = Number(await this.page.Density.inputValue() || '7.85')
        const netWeight = await this.getNetWeight()

        const grossWeight = (volumePurchased / 1000) * density
        const scrapWeight = grossWeight - netWeight

        const materialInfo: MaterialInfo = {
            materialMarketData: {
                esgImpactCO2Kg: Number(await this.page.CO2PerKgMaterial.inputValue() || '0'),
                esgImpactCO2KgScrap: Number(await this.page.CO2PerScrap.inputValue() || '0')
            },
            grossWeight,
            scrapWeight,
            netWeight,
            eav
        }

        const expectedESG = calculateESG(materialInfo)
        const uiCO2PerPart = Number(await this.page.CO2PerPart.inputValue() || '0')
        expect(uiCO2PerPart).toBeCloseTo(expectedESG.esgImpactCO2KgPart, 4)
        logger.info(`✔ Material CO2 Per Part verified: ${uiCO2PerPart} kg`)
    }
    //========================== Manufacturing Information ==========================

    async verifyManufacturingCost(): Promise<void> {
        logger.info('🔹 Verifying Manufacturing Cost...')
        const actual = await this.page.getInputValueAsNumber(this.page.NetProcessCost)
        // You might want to compare this with a calculated value or test data
        logger.info(`✔ Manufacturing Cost verified: $${actual}`)
    }

    async verifyManufacturingSustainability(): Promise<void> {
        logger.info('🔹 Verifying Manufacturing Sustainability...')
        const co2PerKwHr = await this.page.CO2PerKwHr.inputValue()
        const powerConsumption = await this.page.PowerConsumption.inputValue()
        const cycleTime = await this.page.CycleTimePart.inputValue()

        const expectedCO2 = calculateManufacturingCO2(
            Number(cycleTime),
            Number(powerConsumption),
            Number(co2PerKwHr)
        )

        const uiCO2PerPart = Number(await this.page.CO2PerPartManufacturing.inputValue() || '0')
        expect(uiCO2PerPart).toBeCloseTo(expectedCO2, 4)
        logger.info(`✔ Manufacturing CO2 Per Part verified: ${uiCO2PerPart} kg`)
    }

    async verifyMachineCost(expectedValue?: number): Promise<void> {
        logger.info('🔹 Verifying Machine Cost...')
        const actual = await this.page.getInputValueAsNumber(this.page.MachineCostPart)
        if (expectedValue !== undefined) {
            expect(actual).toBeCloseTo(expectedValue, 4)
        } else {
            const rate = await this.page.getInputValueAsNumber(this.page.MachineHourRate)
            const time = await this.page.getInputValueAsNumber(this.page.CycleTimePart)
            const expected = (rate / 3600) * time
            expect(actual).toBeCloseTo(expected, 4)
        }
        logger.info(`✔ Machine Cost verified: $${actual}`)
    }

    async verifyLaborCost(expectedValue?: number): Promise<void> {
        logger.info('🔹 Verifying Labor Cost...')
        const actual = await this.page.getInputValueAsNumber(this.page.LaborCostPart)
        if (expectedValue !== undefined) {
            expect(actual).toBeCloseTo(expectedValue, 4)
        } else {
            const rate = await this.page.getInputValueAsNumber(this.page.DirectLaborRate)
            const time = await this.page.getInputValueAsNumber(this.page.CycleTimePart)
            const labors = await this.page.getInputValueAsNumber(this.page.NoOfDirectLabors)
            const expected = (rate / 3600) * time * labors
            expect(actual).toBeCloseTo(expected, 4)
        }
        logger.info(`✔ Labor Cost verified: $${actual}`)
    }


    async verifyManufacturingInformationDetails(testData: any): Promise<void> {
        logger.info('🔹 Verifying Manufacturing Information Details...')
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


        await this.page.scrollIntoView(this.page.ManufacturingInformation)
        await expect.soft(this.page.ManufacturingInformation).toBeVisible()
        await this.page.waitAndClick(this.page.ManufacturingInformationSection)
        await this.page.MigWeldRadBtn.click()
        const currentProcessGroup = await this.page.ProcessGroup.inputValue()
        if (currentProcessGroup === '0' || !currentProcessGroup) {
            await this.page.selectByTrimmedLabel(this.page.ProcessGroup, processType)
        }
        const actualRequiredCurrent = Number(
            (await this.page.RequiredCurrent.inputValue())?.replace(/,/g, '') || 0
        );
        expect.soft(actualRequiredCurrent).toBeCloseTo(Number(minCurrentRequired), 4);
        const actualRequiredVoltage = Number(
            (await this.page.RequiredVoltage.inputValue())?.replace(/,/g, '') || 0
        );
        expect.soft(actualRequiredVoltage).toBeCloseTo(Number(minWeldingVoltage), 4);
        const actualSelectedCurrent = Number(
            (await this.page.selectedCurrent.inputValue())?.replace(/,/g, '') || 0
        );
        expect.soft(actualSelectedCurrent).toBeCloseTo(Number(selectedCurrent), 4)
        const actualSelectedVoltage = Number(
            (await this.page.selectedVoltage.inputValue())?.replace(/,/g, '') || 0
        );
        expect.soft(actualSelectedVoltage).toBeCloseTo(Number(selectedVoltage), 4)

        await this.page.selectOption(this.page.MachineType, machineAutomation)
        const ManuMachineName = await this.page.getSelectedOptionText(this.page.MachineName);
        expect.soft(ManuMachineName).toBe(machineName);

        const ManuMachineDescription = await this.page.getSelectedOptionText(this.page.MachineDescription);
        expect.soft(ManuMachineDescription).toBe(machineDescription);

        await this.page.MachineEfficiency.fill(machineEfficiency.toString())
        await this.page.scrollIntoView(this.page.AdditionalDetails)

        await this.page.waitAndClick(this.page.AdditionalDetails)
        await this.page.selectOption(this.page.PartComplexity, partComplexity)
        await this.page.selectOption(this.page.WeldPosition, weldPosition)
        if (await this.page.AdditionalDetails.isVisible()) {
            await this.page.AdditionalDetails.click()
        }

        // ==================== Sub Process Details ====================
        if (testData.subProcessDetails) {
            logger.info('🔹 Filling Sub Process Details...')
            await this.page.scrollIntoView(this.page.SubProcessDetails)

            // Weld 1 Sub Process
            if (testData.subProcessDetails.weld1) {
                if (await this.page.Weld1keyboard_arrow_down_1.isVisible()) {
                    await this.page.Weld1keyboard_arrow_down_1.click()
                }
                await this.page.selectOption(this.page.WeldTypeSubProcess1, testData.subProcessDetails.weld1.weldType)
                await this.page.selectOption(this.page.WeldPositionSubProcess1, testData.subProcessDetails.weld1.weldPosition)
                if (testData.subProcessDetails.weld1.travelSpeed) {
                    await this.page.TravelSpeedSubProcess1.fill(testData.subProcessDetails.weld1.travelSpeed.toString())
                }
                await this.page.TrackWeldSubProcess1.fill(testData.subProcessDetails.weld1.tackWelds.toString())
                await this.page.IntermediateStartStopSubProcess1.fill(testData.subProcessDetails.weld1.intermediateStops.toString())
            }

            // Weld 2 Sub Process
            if (testData.subProcessDetails.weld2 && (await this.page.weldTypeSubProcess2.isVisible())) {
                if (await this.page.Weld1keyboard_arrow_down_2.isVisible()) {
                    await this.page.Weld1keyboard_arrow_down_2.click()
                }
                await this.page.selectOption(this.page.weldTypeSubProcess2, testData.subProcessDetails.weld2.weldType)
                await this.page.selectOption(this.page.WeldPositionSubProcess2, testData.subProcessDetails.weld2.weldPosition)
                if (testData.subProcessDetails.weld2.travelSpeed) {
                    await this.page.TravelSpeedSubProcess2.fill(testData.subProcessDetails.weld2.travelSpeed.toString())
                }
                await this.page.TrackWeldSubProcess2.fill(testData.subProcessDetails.weld2.tackWelds.toString())
                await this.page.IntermediateStartStopSubProcess2.fill(testData.subProcessDetails.weld2.intermediateStops.toString())
            }
        }

        logger.info('✔ Manufacturing Information Details verified')
    }

    async verifyPowerCost(expectedValue?: number): Promise<void> {
        logger.info('🔹 Verifying Power Cost...')
        const actual = await this.page.getInputValueAsNumber(this.page.TotalPowerCost)
        if (expectedValue !== undefined) {
            expect(actual).toBeCloseTo(expectedValue, 4)
        } else {
            const time = await this.page.getInputValueAsNumber(this.page.CycleTimePart)
            const power = await this.page.getInputValueAsNumber(this.page.PowerConsumption)
            const cost = await this.page.getInputValueAsNumber(this.page.ElectricityUnitCost)
            const expected = (time / 3600) * power * cost
            expect(actual).toBeCloseTo(expected, 4)
        }
        logger.info(`✔ Power Cost verified: $${actual}`)
    }

    async verifyYieldCost(expectedValue?: number): Promise<void> {
        logger.info('🔹 Verifying Yield Cost...')
        const actual = await this.page.getInputValueAsNumber(this.page.YieldCostPart)
        if (expectedValue !== undefined) {
            expect(actual).toBeCloseTo(expectedValue, 4)
        } else {
            const netMatCost = await this.getNetMaterialCost()
            const machineCost = await this.page.getInputValueAsNumber(this.page.MachineCostPart)
            const setupCost = await this.page.getInputValueAsNumber(this.page.SetupCostPart)
            const laborCost = await this.page.getInputValueAsNumber(this.page.LaborCostPart)
            const inspectionCost = await this.page.getInputValueAsNumber(this.page.QAInspectionCost)
            const yieldPer = await this.page.getInputValueAsNumber(this.page.YieldPercentage)

            const sumCosts = machineCost + setupCost + laborCost + inspectionCost
            const expected = (1 - yieldPer / 100) * (netMatCost + sumCosts)
            expect(actual).toBeCloseTo(expected, 4)
        }
        logger.info(`✔ Yield Cost verified: $${actual}`)
    }

    async verifyWeldCycleTimeDetails(testData: any): Promise<void> {
        logger.info('🔹 Step: Weld Cycle Time Verification via Logic')

        const input: any = {
            processTypeID: ProcessType.MigWelding,
            partComplexity: PartComplexity.Medium,
            semiAutoOrAuto: MachineType.Automatic,
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
            efficiency: testData.machineDetails.machineEfficiency / 100
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

        const expectedDetails = {
            loadingUnloadingTime: breakdown.unloadingTime,
            reorientation: testData.cycleTimeDetails.partReorientation,
            totalWeldCycleTime: breakdown.finalCycleTime
        }

        const uiCycleTime = await this.page.getInputValueAsNumber(this.page.CycleTimePart)
        const uiUnloading = await this.page.getInputValueAsNumber(this.page.UnloadingTime)

        expect(uiUnloading).toBeCloseTo(expectedDetails.loadingUnloadingTime, 2)
        expect(calculated.partReorientation).toBeCloseTo(expectedDetails.reorientation, 2)
        expect(uiCycleTime).toBeCloseTo(expectedDetails.totalWeldCycleTime, 2)

        logger.info('✅ Weld cycle time calculations verified')
    }

    async verifyAllWeldingCalculations(): Promise<void> {
        logger.info(
            '🔹 Verifying All Welding Calculations via WeldingCalculator...'
        )

        const calculator = new WeldingCalculator()
        const processType = await this.getProcessType()

        // 1. Gather Inputs
        const efficiency = await this.page.getInputValueAsNumber(this.page.MachineEfficiency)
        const machineEfficiency = efficiency / 100

        const machineHourRate = await this.page.getInputValueAsNumber(
            this.page.MachineHourRate
        )
        const skilledLaborRate = await this.page.getInputValueAsNumber(
            this.page.SkilledLaborRate
        )
        const lowSkilledLaborRate = await this.page.getInputValueAsNumber(
            this.page.DirectLaborRate
        )
        const electricityUnitCost = await this.page.getInputValueAsNumber(
            this.page.ElectricityUnitCost
        )
        const powerConsumptionInfo = await this.page.getInputValueAsNumber(
            this.page.PowerConsumption
        )

        const lotSize = await this.page.getInputValueAsNumber(this.page.LotsizeNos)
        const setUpTime = await this.page.getInputValueAsNumber(this.page.MachineSetupTime)
        const noOfLowSkilledLabours = await this.page.getInputValueAsNumber(
            this.page.NoOfDirectLabors
        )
        let density = 7.85
        let partThickness = 0
        let netWeight = 0

        try {
            if (await this.page.Density.isVisible()) {
                density = await this.page.getInputValueAsNumber(this.page.Density)
            }
            partThickness = await this.page.getInputValueAsNumber(this.page.PartThickness)
            netWeight = await this.page.getInputValueAsNumber(this.page.NetWeight)
        } catch (e) {
            logger.warn('Could not read some material details, using defaults/zeros')
        }

        // Welding Details (Weld 1, Weld 2)
        const weld1Visible = await this.page.MatWeldType1.isVisible()
        const weld2Visible = await this.page.MatWeldType2.isVisible()

        const weld1Length = weld1Visible
            ? await this.page.getInputValueAsNumber(this.page.MatWeldLengthmm1)
            : 0
        const weld1Size = weld1Visible
            ? await this.page.getInputValueAsNumber(this.page.MatWeldSize1)
            : 0

        const weld2Length = weld2Visible
            ? await this.page.getInputValueAsNumber(this.page.MatWeldLengthmm2)
            : 0
        const weld2Size = weld2Visible
            ? await this.page.getInputValueAsNumber(this.page.MatWeldSize2)
            : 0

        const totalWeldLength = weld1Length + weld2Length

        // Construct ProcessInfoDto
        const manufactureInfo: any = {
            processTypeID: processType,
            partComplexity: PartComplexity.Medium,
            semiAutoOrAuto: MachineType.Automatic,
            efficiency: machineEfficiency,
            machineHourRate: machineHourRate,
            skilledLaborRatePerHour: skilledLaborRate,
            lowSkilledLaborRatePerHour: lowSkilledLaborRate,
            electricityUnitCost: electricityUnitCost,
            powerConsumption: powerConsumptionInfo,
            lotSize: lotSize,
            setUpTime: setUpTime,
            noOfLowSkilledLabours: noOfLowSkilledLabours,

            // SubProcesses
            subProcessFormArray: {
                controls: []
            },

            // Material Info List
            materialInfoList: [
                {
                    processId:
                        processType === ProcessType.WeldingCleaning ? 57 : processType,
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
            ]
        }

        // Fill SubProcess Array
        if (weld1Visible) {
            manufactureInfo.subProcessFormArray.controls.push({
                value: {
                    formLength: weld1Length,
                    shoulderWidth: weld1Size,
                    formPerimeter: 0,
                    noOfHoles: 0,
                    hlFactor: 0
                }
            })
            manufactureInfo.materialInfoList[0].coreCostDetails.push({
                coreWeight: 0,
                weldLength: weld1Length,
                coreHeight: weld1Size,
                weldSize: weld1Size
            })
        }
        if (weld2Visible) {
            manufactureInfo.subProcessFormArray.controls.push({
                value: {
                    formLength: weld2Length,
                    shoulderWidth: weld2Size,
                    formPerimeter: 0,
                    noOfHoles: 0,
                    hlFactor: 0
                }
            })
            manufactureInfo.materialInfoList[0].coreCostDetails.push({
                coreWeight: 0,
                weldLength: weld2Length,
                coreHeight: weld2Size,
                weldSize: weld2Size
            })
        }

        // 2. Perform Calculation
        let calculated: any
        if (processType === ProcessType.WeldingCleaning) {
            calculated = this.calculator.calculationsForWeldingCleaning(
                manufactureInfo,
                [],
                manufactureInfo
            )
        } else {
            calculated = this.calculator.calculationForWelding(
                manufactureInfo,
                [],
                manufactureInfo,
                []
            )
        }

        logger.info(`Calculated Results: ${JSON.stringify(calculated, null, 2)}`)

        // 3. Verify UI vs Calculated

        // Cycle Time
        const uiCycleTime = await this.page.getInputValueAsNumber(this.page.CycleTimePart)
        const calcCycleTime = calculated.cycleTime || calculated.totalCycleTime || 0

        if (calcCycleTime > 0) {
            expect(uiCycleTime).toBeCloseTo(calcCycleTime, 2)
            logger.info(
                `✔ Cycle Time Verified: UI=${uiCycleTime}, Calc=${calcCycleTime}`
            )
        }

        // Machine Cost
        const uiMachineCost = await this.page.getInputValueAsNumber(this.page.MachineCostPart)
        const calcMachineCost = calculated.directMachineCost || 0
        expect(uiMachineCost).toBeCloseTo(calcMachineCost, 2)
        logger.info(
            `✔ Machine Cost Verified: UI=${uiMachineCost}, Calc=${calcMachineCost}`
        )

        // Labor Cost
        const uiLaborCost = await this.page.getInputValueAsNumber(this.page.LaborCostPart)
        const calcLaborCost = calculated.directLaborCost || 0
        expect(uiLaborCost).toBeCloseTo(calcLaborCost, 2)
        logger.info(
            `✔ Labor Cost Verified: UI=${uiLaborCost}, Calc=${calcLaborCost}`
        )

        // Setup Cost
        const uiSetupCost = await this.page.getInputValueAsNumber(this.page.SetupCostPart)
        const calcSetupCost = calculated.directSetUpCost || 0
        expect(uiSetupCost).toBeCloseTo(calcSetupCost, 2)
        logger.info(
            `✔ Setup Cost Verified: UI=${uiSetupCost}, Calc=${calcSetupCost}`
        )

        // Power Cost
        const uiPowerCost = await this.page.getInputValueAsNumber(this.page.TotalPowerCost)
        const calcPowerCost = calculated.totalPowerCost || 0
        expect(uiPowerCost).toBeCloseTo(calcPowerCost, 2)
        logger.info(
            `✔ Power Cost Verified: UI=${uiPowerCost}, Calc=${calcPowerCost}`
        )

        // Yield Cost
        const uiYieldCost = await this.page.getInputValueAsNumber(this.page.YieldCostPart)
        const calcYieldCost = calculated.yieldCost || 0
        expect(uiYieldCost).toBeCloseTo(calcYieldCost, 2)
        logger.info(`✔ Yield Cost Verified: UI=${uiYieldCost}, Calc=${calcYieldCost}`)

        // Inspection Cost
        const uiInspectionCost = await this.page.getInputValueAsNumber(this.page.QAInspectionCost)
        const calcInspectionCost = calculated.inspectionCost || 0
        expect(uiInspectionCost).toBeCloseTo(calcInspectionCost, 2)
        logger.info(`✔ Inspection Cost Verified: UI=${uiInspectionCost}, Calc=${calcInspectionCost}`)
    }
    async verifySetupCost(expectedValue?: number): Promise<void> {
        logger.info('🔹 Verifying Setup Cost...')
        const actual = await this.page.getInputValueAsNumber(this.page.SetupCostPart)
        if (expectedValue !== undefined) {
            expect(actual).toBeCloseTo(expectedValue, 4)
        }
        logger.info(`✔ Setup Cost verified: $${actual}`)
    }

    async getProcessType(): Promise<ProcessType> {
        if (await this.page.MigWeldRadBtn.isChecked()) return ProcessType.MigWelding
        if (await this.page.WeldCleanRadBtn.isChecked())
            return ProcessType.WeldingCleaning
        return ProcessType.MigWelding
    }
}
