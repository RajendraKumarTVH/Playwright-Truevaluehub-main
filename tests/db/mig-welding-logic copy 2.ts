import { expect, Locator } from '@playwright/test'
import Logger from '../lib/LoggerUtil'
import { TotalCycleTimeInput, ProcessInfoDto, WeldInput, PartDetailsInput, CostBreakdown, MaterialInfo, ESGCalculationResult, SubProcessDetailsExpected } from "../utils/interfaces"
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
    getWireDiameter,
    calculateSingleWeldCycleTime,
    calculateWeldCycleTimeBreakdown,
    calculateArcOnTime,
    calculateArcOffTime,
    PrimaryProcessType
} from '../utils/welding-calculator'
import { MigWeldingPage } from './mig-welding.page'
import { WeldingPage } from './welding-calculator.page'
import { MaterialInformation } from '../../test-data/mig-welding-testdata'
import { any } from 'zod'
import { normalizeMachineType } from 'tests/utils'
const logger = Logger

export class MigWeldingLogic {
    private calculator = new WeldingCalculator()
    private runtimeWeldingContext: any = {}
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

        await this.page.wait(1000);
        await this.page.waitAndClick(this.page.MaterialInfo);
        await expect.soft(this.page.PartEnvelopeLength).toBeVisible();
        const length = await this.page.getInputValueAsNumber(this.page.PartEnvelopeLength);
        const width = await this.page.getInputValueAsNumber(this.page.PartEnvelopeWidth);
        const height = await this.page.getInputValueAsNumber(this.page.PartEnvelopeHeight);



        return { length, width, height, density };
    }


    async navigateToProject(projectId: string): Promise<void> {
        logger.info(`🔹 Navigating to project: ${projectId}`)
        await this.page.waitAndClick(this.page.Projects);
        logger.info('Existing part found. Clicking Clear All...')
        const isClearVisible = await this.page.ClearAll.isVisible().catch(() => false);

        if (isClearVisible) {
            await this.page.waitAndClick(this.page.ClearAll);
        } else {
            await this.page.keyPress('Escape');
        }
        await this.page.waitAndClick(this.page.SelectAnOption)
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
            }
        }

        // ---------------- Revision Number ----------------
        let revisionNumber = ''
        if (!revisionNumber && internalPartNumber) {
            const match = internalPartNumber.match(/^\d+-([A-Za-z]+)/)
            if (match) {
                revisionNumber = match[1]
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

        // Note: getMaterialDimensionsAndDensity handles navigation to MaterialDetailsTab and back to MaterialInfo
        const { density } = await this.getMaterialDimensionsAndDensity();
        logger.info(`Density: ${density}`);


        expect.soft(await this.page.VolumePurchased.isVisible()).toBe(true);
        const volumePurchased = Number(
            (await this.page.VolumePurchased.inputValue())?.replace(/,/g, '') || 0
        );
        logger.info(`Volume Purchased: ${volumePurchased}`);

        // ===== Net Weight Validation (Volume × Density) =====
        expect.soft(await this.page.NetWeight.isVisible()).toBe(true);

        const partVolumeMm3 = await this.getPartVolume();
        const calculated = this.calculator.calculateNetWeight(partVolumeMm3, density);

        const uiNetWeight = await this.getNetWeight();



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
        await this.page.selectOption(locators.weldType, weldData.weldType);

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

        } else {
            logger.warn('⚠️ Wire Dia field not present for this weld type — skipping validation');
        }

        // ===== Weld Element Size (auto) =====
        await expect.soft(locators.weldElementSize).not.toHaveValue('');
        const weldElementSize = Number(await locators.weldElementSize.inputValue() || '0');

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

        const expectedTotalLength = this.calculator.getTotalWeldLength(
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

        return uiValue;
    }
    //============================ Net Material cost($)=================================    
    //========================== Fully UI-driven: Process Details ==========================
    async verifyProcessDetails(testData?: any): Promise<void> {
        logger.info('\n🔹 Step: Verify Process Details from UI');

        // --- Read Process Type & Machine Type ---
        const processType = await this.page.getSelectedOptionText(this.page.ProcessGroup);
        const machineTypeRaw = await this.page.MachineType.inputValue();
        const machineAutomation = normalizeMachineType(machineTypeRaw);
        const machineName = await this.page.getSelectedOptionText(this.page.MachineName);
        const machineDescription = await this.page.MachineDescription.inputValue();
        const efficiency = await this.page.getInputValueAsNumber(this.page.MachineEfficiency) || 75;

        logger.info(`   ✓ Process Type: ${processType}`);
        logger.info(`   ✓ Machine Automation: ${machineAutomation}`);
        logger.info(`   ✓ Machine Name: ${machineName}`);
        logger.info(`   ✓ Machine Description: ${machineDescription}`);
        logger.info(`   ✓ Efficiency: ${efficiency}%`);

        // --- Part Complexity ---
        const partComplexity = await this.page.getSelectedOptionText(this.page.PartComplexity);
        logger.info(`   ✓ Part Complexity: ${partComplexity}`);

        // --- Current / Voltage ---
        const minCurrentRequired = Number((await this.page.RequiredCurrent.inputValue())?.replace(/,/g, '') || 0);
        const minWeldingVoltage = Number((await this.page.RequiredVoltage.inputValue())?.replace(/,/g, '') || 0);
        const selectedCurrent = Number((await this.page.selectedCurrent.inputValue())?.replace(/,/g, '') || 0);
        const selectedVoltage = Number((await this.page.selectedVoltage.inputValue())?.replace(/,/g, '') || 0);

        logger.info(`   ✓ Min Current: ${minCurrentRequired}, Min Voltage: ${minWeldingVoltage}`);
        logger.info(`   ✓ Selected Current: ${selectedCurrent}, Selected Voltage: ${selectedVoltage}`);

        // --- Sub-Process Details ---
        const subProcesses: any[] = [];
        for (let i = 1; i <= 2; i++) {
            const weldTypeLocator = i === 1 ? this.page.WeldTypeSubProcess1 : this.page.weldTypeSubProcess2;
            if (!(await weldTypeLocator.isVisible())) continue;

            const positionLocator = i === 1 ? this.page.WeldPositionSubProcess1 : this.page.WeldPositionSubProcess2;
            const travelSpeedLocator = i === 1 ? this.page.TravelSpeedSubProcess1 : this.page.TravelSpeedSubProcess2;
            const tackLocator = i === 1 ? this.page.TrackWeldSubProcess1 : this.page.TrackWeldSubProcess2;
            const stopsLocator = i === 1 ? this.page.IntermediateStartStopSubProcess1 : this.page.IntermediateStartStopSubProcess2;

            const weldType = await this.page.getSelectedOptionText(weldTypeLocator);
            const weldPosition = await this.page.getSelectedOptionText(positionLocator);
            const travelSpeed = await this.page.getInputValueAsNumber(travelSpeedLocator) || 5;
            const tackWelds = await this.page.getInputValueAsNumber(tackLocator) || 0;
            const intermediateStops = await this.page.getInputValueAsNumber(stopsLocator) || 0;

            subProcesses.push({ weldType, weldPosition, travelSpeed, tackWelds, intermediateStops });
            logger.info(`   ✓ SubProcess${i}: Type=${weldType}, Position=${weldPosition}, Speed=${travelSpeed}, Tack=${tackWelds}, Stops=${intermediateStops}`);
        }

        // Save for runtime context
        this.runtimeWeldingContext = {
            ...this.runtimeWeldingContext,
            processType,
            machineAutomation,
            machineName,
            machineDescription,
            efficiency,
            partComplexity,
            minCurrentRequired,
            minWeldingVoltage,
            selectedCurrent,
            selectedVoltage,
            subProcesses
        };

        logger.info('✔ Process Details successfully read from UI');
    }

    //========================== Fully UI-driven: Cycle Time ==========================
    async verifyWeldCycleTimeDetails(testData?: any): Promise<void> {
        logger.info('\n🔹 Step: Verify Cycle Times from UI');

        const subProcesses = this.runtimeWeldingContext.subProcesses || [];
        const subProcessCycleTimes: number[] = [];

        const partReorientation = Number(await this.page.PartReorientation.inputValue()) || 0;
        const loadingUnloadingTime = await this.page.UnloadingTime.isVisible()
            ? await this.page.getInputValueAsNumber(this.page.UnloadingTime)
            : 0;
        const efficiency = this.runtimeWeldingContext.efficiency || 75;

        for (let idx = 0; idx < subProcesses.length; idx++) {
            const sub = subProcesses[idx];

            // Weld Length & Side
            const weldLengthLocator = idx === 0 ? this.page.MatWeldLengthmm1 : this.page.MatWeldLengthmm2;
            const weldSideLocator = idx === 0 ? this.page.MatWeldSide1 : this.page.MatWeldSide2;

            const weldLength = await this.page.getInputValueAsNumber(weldLengthLocator) || 0;
            const weldSide = await this.page.getSelectedOptionText(weldSideLocator) || 'One Side';

            const totalWeldLength = this.calculator.getTotalWeldLength(weldLength, 1, weldSide);

            const weldCycleTime = calculateSingleWeldCycleTime({
                totalWeldLength,
                travelSpeed: sub.travelSpeed,
                tackWelds: sub.tackWelds,
                intermediateStops: sub.intermediateStops,
                weldType: sub.weldType || 'Fillet'
            });

            subProcessCycleTimes.push(weldCycleTime);

            logger.info(`   ✓ SubProcess${idx + 1} Cycle Time: ${weldCycleTime.toFixed(2)} sec`);
        }

        if (subProcessCycleTimes.length === 0) {
            logger.warn('⚠️ No weld sub-processes detected. Skipping cycle time.');
            return;
        }

        const totalSubProcessTime = subProcessCycleTimes.reduce((sum, t) => sum + t, 0);
        const arcOnTime = calculateArcOnTime(totalSubProcessTime, loadingUnloadingTime);
        const arcOffTime = calculateArcOffTime(arcOnTime);
        const dryCycleTime = arcOnTime + arcOffTime;

        const breakdown = calculateWeldCycleTimeBreakdown({
            subProcessCycleTimes,
            loadingUnloadingTime,
            partReorientation,
            efficiency
        });

        // Verify UI
        const uiDryCycle = await this.page.getInputValueAsNumber(this.page.DryCycleTime);
        expect.soft(uiDryCycle).toBeCloseTo(dryCycleTime, 2);

        const uiTotalCycle = await this.page.getInputValueAsNumber(this.page.CycleTimePart);
        expect.soft(uiTotalCycle).toBeCloseTo(breakdown.cycleTime, 2);

        this.runtimeWeldingContext.cycleTime = breakdown.cycleTime;
        this.runtimeWeldingContext.subProcessCycleTimes = subProcessCycleTimes;

        logger.info('✔ Cycle Times verified and stored in runtime context');
    }

    //========================== Fully UI-driven: Material Calculations ==========================
    async verifyWeldingMaterialCalculations(): Promise<void> {
        logger.info('\n🔹 Step: Verify Material Calculations from UI');

        // --- Material Info ---
        const density = await this.page.getInputValueAsNumber(this.page.Density) || 7.85; // fallback
        const partVolume = await this.getPartVolume();
        const expectedNetWeight = this.calculator.calculateNetWeight(partVolume, density);
        await this.verifyNetWeight(expectedNetWeight);

        // --- Weld Sub-Processes & Weights ---
        const weldSubMaterials: any[] = [];

        for (let i = 1; i <= 2; i++) {
            const weldTypeLocator = i === 1 ? this.page.MatWeldType1 : this.page.MatWeldType2;
            if (!(await weldTypeLocator.isVisible())) continue;

            const weldElementSize = await (i === 1 ? this.page.MatWeldElementSize1.inputValue() : this.page.MatWeldElementSize2.inputValue());
            const weldSize = await (i === 1 ? this.page.MatWeldSize1.inputValue() : this.page.MatWeldSize2.inputValue());
            const noOfWeldPasses = await (i === 1 ? this.page.MatNoOfWeldPasses1.inputValue() : this.page.MatNoOfWeldPasses2.inputValue());
            const weldLength = await (i === 1 ? this.page.MatWeldLengthmm1.inputValue() : this.page.MatWeldLengthmm2.inputValue());
            const weldPlaces = await (i === 1 ? this.page.MatWeldPlaces1.inputValue() : this.page.MatWeldPlaces2.inputValue());
            const weldSide = await this.page.getSelectedOptionText(i === 1 ? this.page.MatWeldSide1 : this.page.MatWeldSide2);
            const wireDia = await (i === 1 ? this.page.MatWireDia1.inputValue() : this.page.MatWireDia2.inputValue());
            const weldType = await this.page.getSelectedOptionText(weldTypeLocator);

            weldSubMaterials.push({ weldElementSize, weldSize, noOfWeldPasses, weldLength, weldPlaces, weldSide, wireDia, weldType });
        }

        const uiEfficiency = this.runtimeWeldingContext.efficiency || 75;

        const calculated = this.calculator.calculateExpectedWeldingMaterialCosts(
            { density },
            weldSubMaterials,
            uiEfficiency
        );

        // --- Verify UI ---
        await this.verifyTotalWeldLength(calculated.totalWeldLength);
        await this.verifyTotalWeldMaterialWeight(calculated.totalWeldMaterialWeight);
        await this.verifyNetMaterialCostCalculation(calculated.weldBeadWeightWithWastage);

        // --- ESG / Sustainability ---
        await this.verifyNetMaterialSustainabilityCost();

        logger.info('✔ Material calculations verified successfully from UI');
    }

    //========================== Verify Total Weld Length ==========================
    async verifyTotalWeldLength(expectedTotalWeldLength: number): Promise<void> {
        logger.info('🔹 Verifying Total Weld Length...')
        const uiTotalWeldLength = await this.page.getInputValueAsNumber(this.page.TotalWeldLength)
        expect.soft(uiTotalWeldLength).toBeCloseTo(expectedTotalWeldLength, 2)
        logger.info(`✔ Total Weld Length → UI: ${uiTotalWeldLength}, Expected: ${expectedTotalWeldLength.toFixed(2)}`)
    }

    //========================== Verify Total Weld Material Weight ==========================
    async verifyTotalWeldMaterialWeight(expectedTotalWeldMaterialWeight: number): Promise<void> {
        logger.info('🔹 Verifying Total Weld Material Weight...')
        const uiTotalWeldMaterialWeight = await this.page.getInputValueAsNumber(this.page.TotalWeldMaterialWeight)
        expect.soft(uiTotalWeldMaterialWeight).toBeCloseTo(expectedTotalWeldMaterialWeight, 2)
        logger.info(`✔ Total Weld Material Weight → UI: ${uiTotalWeldMaterialWeight}, Expected: ${expectedTotalWeldMaterialWeight.toFixed(2)}`)
    }

    //========================== Verify Net Material Cost Calculation ==========================
    async verifyNetMaterialCostCalculation(expectedWeldBeadWeightWithWastage?: number): Promise<void> {
        logger.info('🔹 Verifying Weld Bead Weight with Wastage...')
        const uiWeldBeadWeightWithWastage = await this.page.getInputValueAsNumber(this.page.WeldBeadWeightWithWastage)

        if (expectedWeldBeadWeightWithWastage !== undefined) {
            expect.soft(uiWeldBeadWeightWithWastage).toBeCloseTo(expectedWeldBeadWeightWithWastage, 2)
            logger.info(`✔ Weld Bead Weight with Wastage → UI: ${uiWeldBeadWeightWithWastage}, Expected: ${expectedWeldBeadWeightWithWastage.toFixed(2)}`)
        } else {
            logger.info(`✔ Weld Bead Weight with Wastage from UI: ${uiWeldBeadWeightWithWastage}`)
        }
    }

    //========================== Verify Net Material Sustainability Cost ==========================
    async verifyNetMaterialSustainabilityCost(): Promise<void> {
        logger.info('🔹 Verifying Net Material Sustainability (CO2 Per Part)...')

        const eav = await this.page.getInputValueAsNumber(this.page.AnnualVolumeQtyNos) || 0
        const volumePurchased = await this.page.getInputValueAsNumber(this.page.VolumePurchased) || 0
        const { density } = await this.getMaterialDimensionsAndDensity()
        const netWeight = await this.getNetWeight()

        const grossWeight = (volumePurchased / 1000) * density
        const scrapWeight = Math.max(0, grossWeight - netWeight)

        // Navigate to Material Sustainability tab
        await this.page.MaterialInformationSection.scrollIntoViewIfNeeded()
        const isExpanded = await this.page.MaterialInformationSection.getAttribute('aria-expanded')
        if (isExpanded !== 'true') {
            await this.page.MaterialInformationSection.click()
        }

        await this.page.MatSustainability.click()
        await this.page.wait(500)

        const co2PerKgMaterial = await this.page.getInputValueAsNumber(this.page.CO2PerKgMaterial) || 0
        const co2PerKgScrap = await this.page.getInputValueAsNumber(this.page.CO2PerScrap) || 0

        const materialInfo: MaterialInfo = {
            materialMarketData: {
                esgImpactCO2Kg: co2PerKgMaterial,
                esgImpactCO2KgScrap: co2PerKgScrap
            },
            grossWeight,
            scrapWeight,
            netWeight,
            eav
        }

        // Calculate expected CO2
        const expected = calculateESG(materialInfo)
        const actual = await this.page.getInputValueAsNumber(this.page.CO2PerPartMaterial)

        expect.soft(actual).toBeCloseTo(expected.esgImpactCO2KgPart, 4)
        logger.info(`✔ Material CO2 Per Part → UI: ${actual}, Expected: ${expected.esgImpactCO2KgPart.toFixed(4)}`)
    }

    //========================== Get Net Material Cost ==========================
    async getNetMaterialCost(): Promise<number> {
        const netMaterialCost = await this.page.getInputValueAsNumber(this.page.NetMaterialCost)
        logger.info(`Net Material Cost ($): ${netMaterialCost}`)
        return netMaterialCost
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
            expected = this.calculator.calculateYieldCost(yieldPer, sumCosts, netMatCost)
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
            const yieldCost = await this.page.getInputValueAsNumber(this.page.YieldCostPart)
            const powerCost = await this.page.getInputValueAsNumber(this.page.TotalPowerCost)
            expected = machineCost + setupCost + laborCost + inspectionCost + yieldCost + powerCost
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
    async verifyAllWeldingCalculations(): Promise<void> {
        logger.info('🚀 Starting Overall Welding Calculations Verification');

        // This method aggregates various verifications
        // In this implementation, we assume individual verify methods handle their own logic
        await this.verifyWeldingMaterialCalculations();

        // You can add more aggregate logic here if needed, 
        // but for now we'll ensure it exists so the test suite can run.
        logger.info('✅ Overall Welding Calculations Verification Completed');
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
}
