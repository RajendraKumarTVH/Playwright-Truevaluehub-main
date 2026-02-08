import { Page, Locator, expect } from '@playwright/test';
import LoggerUtil from '../lib/LoggerUtil';
import { WeldingInfo, WeldSubProcess } from '../utils/interfaces';
import { ProcessType, PartComplexity, MachineType } from '../utils/constants';

const logger = LoggerUtil;

export class WeldingPage {
    readonly page: Page;

    // ==================== MAIN WELDING FIELDS ====================
    readonly weldingProcessDropdown: Locator;
    readonly machineTypeDropdown: Locator;
    readonly weldPositionDropdown: Locator;
    readonly partComplexityDropdown: Locator;

    // ==================== WELD SUB-PROCESS ELEMENTS ====================
    readonly addWeldButton: Locator;
    readonly weldTypeDropdown: Locator;
    readonly noOfWeldsInput: Locator;
    readonly totalWeldLengthInput: Locator;
    readonly weldLegSizeInput: Locator;
    readonly weldPositionSubDropdown: Locator;
    readonly noOfIntermediateStopsInput: Locator;

    // ==================== CALCULATED FIELDS ====================
    readonly weldElementSizeDisplay: Locator;
    readonly cycleTimeDisplay: Locator;
    readonly travelSpeedDisplay: Locator;
    readonly requiredCurrentDisplay: Locator;
    readonly requiredVoltageDisplay: Locator;
    readonly arcOnTimeDisplay: Locator;
    readonly arcOffTimeDisplay: Locator;

    // ==================== COST FIELDS ====================
    readonly directMachineCostDisplay: Locator;
    readonly directLaborCostDisplay: Locator;
    readonly directSetUpCostDisplay: Locator;
    readonly inspectionCostDisplay: Locator;
    readonly yieldCostDisplay: Locator;
    readonly powerCostDisplay: Locator;
    readonly directProcessCostDisplay: Locator;

    // ==================== SUSTAINABILITY FIELDS ====================
    readonly esgImpactElectricityConsumption: Locator;
    readonly esgImpactAnnualUsageHrs: Locator;
    readonly esgImpactAnnualKgCO2: Locator;
    readonly esgImpactAnnualKgCO2Part: Locator;

    // ==================== INPUT FIELDS ====================
    readonly lotSizeInput: Locator;
    readonly setupTimeInput: Locator;
    readonly efficiencyInput: Locator;
    readonly yieldPercentageInput: Locator;
    readonly electricityUnitCostInput: Locator;

    constructor(page: Page) {
        this.page = page;

        // Main welding fields
        this.weldingProcessDropdown = page.getByLabel('Welding Process');
        this.machineTypeDropdown = page.getByLabel('Machine Type');
        this.weldPositionDropdown = page.getByLabel('Weld Position');
        this.partComplexityDropdown = page.getByLabel('Part Complexity');

        // Sub-process elements
        this.addWeldButton = page.getByRole('button', { name: /Add Weld/i });
        this.weldTypeDropdown = page.locator('#WeldType1');
        this.noOfWeldsInput = page.locator('#noOfWelds');
        this.totalWeldLengthInput = page.locator('#totalWeldLength');
        this.weldLegSizeInput = page.locator('#WeldSize1');
        this.weldPositionSubDropdown = page.locator('#weldPosition');
        this.noOfIntermediateStopsInput = page.locator('#intermediateStops');

        // Display elements
        this.weldElementSizeDisplay = page.locator('#WeldElementSize1');
        this.cycleTimeDisplay = page.getByLabel('Cycle Time');
        this.travelSpeedDisplay = page.getByLabel('Travel Speed');
        this.requiredCurrentDisplay = page.getByLabel('Required Current');
        this.requiredVoltageDisplay = page.getByLabel('Required Voltage');
        this.arcOnTimeDisplay = page.getByLabel('Arc On Time');
        this.arcOffTimeDisplay = page.getByLabel('Arc Off Time');

        // Cost displays
        this.directMachineCostDisplay = page.getByLabel('Direct Machine Cost');
        this.directLaborCostDisplay = page.getByLabel('Direct Labor Cost');
        this.directSetUpCostDisplay = page.getByLabel('Direct Set Up Cost');
        this.inspectionCostDisplay = page.getByLabel('Inspection Cost');
        this.yieldCostDisplay = page.getByLabel('Yield Cost');
        this.powerCostDisplay = page.getByLabel('Power Cost');
        this.directProcessCostDisplay = page.getByLabel('Direct Process Cost');

        // Sustainability elements
        this.esgImpactElectricityConsumption = page.locator('#esgImpactElectricityConsumption');
        this.esgImpactAnnualUsageHrs = page.locator('#esgImpactAnnualUsageHrs');
        this.esgImpactAnnualKgCO2 = page.locator('#esgImpactAnnualKgCO2');
        this.esgImpactAnnualKgCO2Part = page.locator('#esgImpactAnnualKgCO2Part');

        // Editable inputs
        this.lotSizeInput = page.getByLabel('Lot Size');
        this.setupTimeInput = page.getByLabel('Setup Time');
        this.efficiencyInput = page.getByLabel('Efficiency');
        this.yieldPercentageInput = page.getByLabel('Yield Percentage');
        this.electricityUnitCostInput = page.getByLabel('Electricity Unit Cost');
    }

    // ==================== NAVIGATION ====================
    async navigateToWeldingSection(projectId: number): Promise<void> {
        await this.page.goto(`/costing/${projectId}`);
        await this.page.waitForLoadState('networkidle');
        logger.info(`Navigated to welding section for project ${projectId}`);
    }

    // ==================== FILL METHODS ====================
    async selectWeldingProcess(processName: string): Promise<void> {
        await this.selectDropdownValue(this.weldingProcessDropdown, processName);
        logger.info(`Selected welding process: ${processName}`);
    }

    async selectMachineType(machineType: 'Automatic' | 'Semi-Auto' | 'Manual'): Promise<void> {
        await this.selectDropdownValue(this.machineTypeDropdown, machineType);
        logger.info(`Selected machine type: ${machineType}`);
    }

    async selectPartComplexity(complexity: 'Low' | 'Medium' | 'High'): Promise<void> {
        await this.selectDropdownValue(this.partComplexityDropdown, complexity);
        logger.info(`Selected part complexity: ${complexity}`);
    }

    async selectWeldPosition(position: string): Promise<void> {
        await this.selectDropdownValue(this.weldPositionDropdown, position);
        logger.info(`Selected weld position: ${position}`);
    }

    async fillWeldingInputs(data: Partial<WeldingInfo>): Promise<void> {
        if (data.lotSize) await this.fillInput(this.lotSizeInput, data.lotSize.toString());
        if (data.setUpTime) await this.fillInput(this.setupTimeInput, data.setUpTime.toString());
        if (data.efficiency) await this.fillInput(this.efficiencyInput, data.efficiency.toString());
        if (data.yieldPer) await this.fillInput(this.yieldPercentageInput, data.yieldPer.toString());
        if (data.electricityUnitCost) await this.fillInput(this.electricityUnitCostInput, data.electricityUnitCost.toString());
        logger.info('Filled welding input fields');
    }

    // ==================== WELD SUB-PROCESS ====================
    async addWeldSubProcess(weld: WeldSubProcess): Promise<void> {
        await this.addWeldButton.click();
        await this.page.waitForTimeout(500); // Wait for form to appear

        if (weld.weldType) {
            const weldTypes = ['', 'Fillet', 'Square', 'Plug', 'Bevel/Flare/ V Groove', 'U/J Groove'];
            await this.selectDropdownValue(this.weldTypeDropdown, weldTypes[weld.weldType]);
        }
        if (weld.noOfWelds) await this.fillInput(this.noOfWeldsInput, weld.noOfWelds.toString());
        if (weld.totalWeldLength) await this.fillInput(this.totalWeldLengthInput, weld.totalWeldLength.toString());
        if (weld.weldLegSize) await this.fillInput(this.weldLegSizeInput, weld.weldLegSize.toString());
        if (weld.noOfIntermediateStops) await this.fillInput(this.noOfIntermediateStopsInput, weld.noOfIntermediateStops.toString());

        logger.info('Added weld sub-process');
    }

    // ==================== VERIFICATION METHODS ====================
    async verifyWeldingSize(): Promise<void> {
        const getWeldElementSize = (value: number): number => {
            if (value <= 3) return value;
            if (value <= 4.5) return 3;
            if (value <= 5.5) return 4;
            if (value <= 6) return 5;
            if (value <= 12) return 6;
            return 8;
        };

        try {
            logger.info('🔍 verifyWeldingSize started...');

            // Ensure weld elements are visible
            await expect(this.weldElementSizeDisplay).toBeVisible({ timeout: 3000 });
            await this.weldElementSizeDisplay.scrollIntoViewIfNeeded();
            await expect(this.weldTypeDropdown).toBeVisible({ timeout: 3000 });
            await expect(this.weldLegSizeInput).toBeVisible({ timeout: 3000 });

            // Select type & enter size
            await this.selectDropdownValue(this.weldTypeDropdown, 'Fillet');
            await this.fillInput(this.weldLegSizeInput, '6');

            const weldValue = Number(await this.weldLegSizeInput.inputValue());
            const expectedElementSize = getWeldElementSize(weldValue);

            const uiValue = Number((await this.weldElementSizeDisplay.textContent())?.trim() || '0');

            // Validate
            expect(uiValue).toBe(expectedElementSize);
            logger.info(`✔ Weld Element Size validated → UI: ${uiValue}, Expected: ${expectedElementSize}`);
        } catch (error: any) {
            logger.error(`❌ verifyWeldingSize FAILED: ${error.message}`);
            throw error;
        }
    }

    async verifyCycleTimeCalculation(): Promise<void> {
        try {
            logger.info('🔍 Verifying cycle time calculation...');

            const cycleTimeText = await this.cycleTimeDisplay.inputValue();
            const cycleTime = parseFloat(cycleTimeText || '0');

            expect(cycleTime).toBeGreaterThan(0);
            logger.info(`✔ Cycle time verified: ${cycleTime} seconds`);
        } catch (error: any) {
            logger.error(`❌ Cycle time verification FAILED: ${error.message}`);
            throw error;
        }
    }

    async verifyDirectProcessCost(expectedMin: number, expectedMax: number): Promise<void> {
        try {
            const costText = await this.directProcessCostDisplay.inputValue();
            const cost = parseFloat(costText || '0');

            expect(cost).toBeGreaterThanOrEqual(expectedMin);
            expect(cost).toBeLessThanOrEqual(expectedMax);
            logger.info(`✔ Direct Process Cost verified: ${cost} (expected range: ${expectedMin} - ${expectedMax})`);
        } catch (error: any) {
            logger.error(`❌ Direct process cost verification FAILED: ${error.message}`);
            throw error;
        }
    }

    // ==================== GETTER METHODS ====================
    async getCycleTime(): Promise<number> {
        const value = await this.cycleTimeDisplay.inputValue();
        return parseFloat(value || '0');
    }

    async getDirectMachineCost(): Promise<number> {
        const value = await this.directMachineCostDisplay.inputValue();
        return parseFloat(value || '0');
    }

    async getDirectLaborCost(): Promise<number> {
        const value = await this.directLaborCostDisplay.inputValue();
        return parseFloat(value || '0');
    }

    async getDirectProcessCost(): Promise<number> {
        const value = await this.directProcessCostDisplay.inputValue();
        return parseFloat(value || '0');
    }


    async getAllCosts(): Promise<{ [key: string]: number }> {
        return {
            directMachineCost: await this.getDirectMachineCost(),
            directLaborCost: await this.getDirectLaborCost(),
            directSetUpCost: parseFloat(await this.directSetUpCostDisplay.inputValue() || '0'),
            inspectionCost: parseFloat(await this.inspectionCostDisplay.inputValue() || '0'),
            yieldCost: parseFloat(await this.yieldCostDisplay.inputValue() || '0'),
            powerCost: parseFloat(await this.powerCostDisplay.inputValue() || '0'),
            directProcessCost: await this.getDirectProcessCost()
        };
    }

    // ==================== PRIVATE HELPERS ====================
    private async selectDropdownValue(locator: Locator, value: string): Promise<void> {
        await locator.waitFor({ state: 'visible' });
        try {
            await locator.selectOption({ label: value });
        } catch {
            // Fallback for custom dropdowns
            await locator.click();
            await this.page.getByRole('option', { name: value, exact: true }).click();
        }
    }

    private async fillInput(locator: Locator, value: string): Promise<void> {
        await locator.waitFor({ state: 'visible' });
        await locator.clear();
        await locator.fill(value);
        await locator.blur();
    }

    static calculateTotalWeldLength(
        length: number,
        places: number,
        side: string
    ): number {
        const sideFactor = side.toLowerCase().includes('both') ? 2 : 1;
        return length * places * sideFactor;
    }

    static calculateVolume(area: number, length: number): number {
        return area * length;
    }

    static calculateWeight(volume: number, density: number): number {
        return volume * density;
    }

    static calculateWeldVolume(
        weldType: string,
        weldSize: number,
        weldElementSize: number,
        weldLength: number,
        weldPlaces: number,
        weldPasses: number,
        weldSide: string
    ): number {
        let typeId = 1;
        const lowerType = weldType.toLowerCase();

        if (lowerType.includes('fillet')) typeId = 1;
        else if (lowerType.includes('square')) typeId = 2;
        else if (lowerType.includes('plug')) typeId = 3;
        else if (lowerType.includes('bevel') || lowerType.includes('v groove')) typeId = 4;
        else if (lowerType.includes('u/j')) typeId = 5;

        // Note: weldElementSize corresponds to 'size', weldSize corresponds to 'height'
        const size = weldElementSize;
        const height = weldSize;
        let weldCrossSection = 0;

        if (typeId === 1 || typeId === 2) {
            weldCrossSection = (size * size) / 2;
        } else if (typeId === 3) {
            weldCrossSection = (size * size) + height;
        } else if (typeId === 4) {
            weldCrossSection = (size * size) + (height / 2);
        } else {
            weldCrossSection = (size * height * 3) / 2;
        }

        const sideMultiplier = weldSide.toLowerCase().includes('both') ? 2 : 1;
        const totalWeldLength = weldLength * weldPlaces * weldPasses * sideMultiplier;

        return totalWeldLength * weldCrossSection;
    }
}
// Re-export old class name for backwards compatibility
export { WeldingPage as WeldingCalculatorService };
