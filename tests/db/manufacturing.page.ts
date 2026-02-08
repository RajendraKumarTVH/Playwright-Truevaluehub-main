/**
 * Manufacturing Page Object for Playwright Tests
 * Provides UI interaction methods for manufacturing/costing sections
 */

import { Page, Locator, expect } from '@playwright/test';
import LoggerUtil from '../lib/LoggerUtil';
import { ManufacturingInfo } from '../utils/interfaces';

const logger = LoggerUtil;

export class ManufacturingPage {
    readonly page: Page;

    // ==================== NAVIGATION TABS ====================
    readonly partInfoTab: Locator;
    readonly materialTab: Locator;
    readonly manufacturingTab: Locator;
    readonly toolingTab: Locator;
    readonly overheadTab: Locator;
    readonly costSummaryTab: Locator;

    // ==================== PROCESS SELECTION ====================
    readonly processGroupDropdown: Locator;
    readonly processTypeDropdown: Locator;
    readonly machineDropdown: Locator;
    readonly addProcessButton: Locator;
    readonly removeProcessButton: Locator;

    // ==================== COMMON MANUFACTURING FIELDS ====================
    readonly cycleTimeInput: Locator;
    readonly efficiencyInput: Locator;
    readonly lotSizeInput: Locator;
    readonly setupTimeInput: Locator;
    readonly machineHourRateInput: Locator;

    // ==================== COST DISPLAYS ====================
    readonly directMachineCostInput: Locator;
    readonly directLaborCostInput: Locator;
    readonly directSetupCostInput: Locator;
    readonly inspectionCostInput: Locator;
    readonly yieldCostInput: Locator;
    readonly directProcessCostInput: Locator;
    readonly totalManufacturingCostDisplay: Locator;

    // ==================== LABOR FIELDS ====================
    readonly noOfLowSkilledLaboursInput: Locator;
    readonly lowSkilledLaborRateInput: Locator;
    readonly noOfSkilledLaboursInput: Locator;
    readonly skilledLaborRateInput: Locator;

    // ==================== YIELD FIELDS ====================
    readonly yieldPercentageInput: Locator;
    readonly samplingRateInput: Locator;
    readonly inspectionTimeInput: Locator;

    constructor(page: Page) {
        this.page = page;

        // Navigation tabs
        this.partInfoTab = page.getByRole('tab', { name: /Part Information/i });
        this.materialTab = page.getByRole('tab', { name: /Material/i });
        this.manufacturingTab = page.getByRole('tab', { name: /Manufacturing/i });
        this.toolingTab = page.getByRole('tab', { name: /Tooling/i });
        this.overheadTab = page.getByRole('tab', { name: /Overhead/i });
        this.costSummaryTab = page.getByRole('tab', { name: /Cost Summary/i });

        // Process selection
        this.processGroupDropdown = page.getByLabel('Process Group');
        this.processTypeDropdown = page.getByLabel('Process Type');
        this.machineDropdown = page.getByLabel('Machine');
        this.addProcessButton = page.getByRole('button', { name: /Add Process/i });
        this.removeProcessButton = page.getByRole('button', { name: /Remove/i });

        // Manufacturing fields
        this.cycleTimeInput = page.getByLabel('Cycle Time');
        this.efficiencyInput = page.getByLabel('Efficiency');
        this.lotSizeInput = page.getByLabel('Lot Size');
        this.setupTimeInput = page.getByLabel('Setup Time');
        this.machineHourRateInput = page.getByLabel('Machine Hour Rate');

        // Cost displays
        this.directMachineCostInput = page.getByLabel('Direct Machine Cost');
        this.directLaborCostInput = page.getByLabel('Direct Labor Cost');
        this.directSetupCostInput = page.getByLabel('Direct Setup Cost');
        this.inspectionCostInput = page.getByLabel('Inspection Cost');
        this.yieldCostInput = page.getByLabel('Yield Cost');
        this.directProcessCostInput = page.getByLabel('Direct Process Cost');
        this.totalManufacturingCostDisplay = page.locator('[data-testid="total-manufacturing-cost"]');

        // Labor fields
        this.noOfLowSkilledLaboursInput = page.getByLabel('No. of Low Skilled Labours');
        this.lowSkilledLaborRateInput = page.getByLabel('Low Skilled Labor Rate');
        this.noOfSkilledLaboursInput = page.getByLabel('No. of Skilled Labours');
        this.skilledLaborRateInput = page.getByLabel('Skilled Labor Rate');

        // Yield fields
        this.yieldPercentageInput = page.getByLabel('Yield Percentage');
        this.samplingRateInput = page.getByLabel('Sampling Rate');
        this.inspectionTimeInput = page.getByLabel('Inspection Time');
    }

    // ==================== NAVIGATION ====================
    async navigateToManufacturing(projectId: number): Promise<void> {
        await this.page.goto(`/costing/${projectId}/manufacturing`);
        await this.page.waitForLoadState('networkidle');
        logger.info(`Navigated to manufacturing for project ${projectId}`);
    }

    async clickManufacturingTab(): Promise<void> {
        await this.manufacturingTab.click();
        await this.page.waitForLoadState('networkidle');
        logger.info('Clicked Manufacturing tab');
    }

    // ==================== PROCESS SELECTION ====================
    async selectProcessGroup(groupName: string): Promise<void> {
        await this.selectDropdownValue(this.processGroupDropdown, groupName);
        await this.page.waitForTimeout(500);
        logger.info(`Selected process group: ${groupName}`);
    }

    async selectProcessType(typeName: string): Promise<void> {
        await this.selectDropdownValue(this.processTypeDropdown, typeName);
        await this.page.waitForTimeout(500);
        logger.info(`Selected process type: ${typeName}`);
    }

    async selectMachine(machineName: string): Promise<void> {
        await this.selectDropdownValue(this.machineDropdown, machineName);
        logger.info(`Selected machine: ${machineName}`);
    }

    async addProcess(processGroup: string, processType: string): Promise<void> {
        await this.addProcessButton.click();
        await this.page.waitForTimeout(500);
        await this.selectProcessGroup(processGroup);
        await this.selectProcessType(processType);
        logger.info(`Added process: ${processGroup} - ${processType}`);
    }

    // ==================== FILL METHODS ====================
    async fillManufacturingInputs(data: Partial<ManufacturingInfo>): Promise<void> {
        if (data.cycleTime !== undefined) await this.fillInput(this.cycleTimeInput, data.cycleTime.toString());
        if (data.efficiency !== undefined) await this.fillInput(this.efficiencyInput, data.efficiency.toString());
        if (data.lotSize !== undefined) await this.fillInput(this.lotSizeInput, data.lotSize.toString());
        if (data.setUpTime !== undefined) await this.fillInput(this.setupTimeInput, data.setUpTime.toString());
        if (data.machineHourRate !== undefined) await this.fillInput(this.machineHourRateInput, data.machineHourRate.toString());
        logger.info('Filled manufacturing inputs');
    }

    async fillLaborInputs(data: {
        noOfLowSkilled?: number;
        lowSkilledRate?: number;
        noOfSkilled?: number;
        skilledRate?: number;
    }): Promise<void> {
        if (data.noOfLowSkilled !== undefined) await this.fillInput(this.noOfLowSkilledLaboursInput, data.noOfLowSkilled.toString());
        if (data.lowSkilledRate !== undefined) await this.fillInput(this.lowSkilledLaborRateInput, data.lowSkilledRate.toString());
        if (data.noOfSkilled !== undefined) await this.fillInput(this.noOfSkilledLaboursInput, data.noOfSkilled.toString());
        if (data.skilledRate !== undefined) await this.fillInput(this.skilledLaborRateInput, data.skilledRate.toString());
        logger.info('Filled labor inputs');
    }

    async fillYieldInputs(data: {
        yieldPercentage?: number;
        samplingRate?: number;
        inspectionTime?: number;
    }): Promise<void> {
        if (data.yieldPercentage !== undefined) await this.fillInput(this.yieldPercentageInput, data.yieldPercentage.toString());
        if (data.samplingRate !== undefined) await this.fillInput(this.samplingRateInput, data.samplingRate.toString());
        if (data.inspectionTime !== undefined) await this.fillInput(this.inspectionTimeInput, data.inspectionTime.toString());
        logger.info('Filled yield inputs');
    }

    // ==================== VERIFICATION ====================
    async verifyCycleTimeCalculated(): Promise<void> {
        const value = await this.cycleTimeInput.inputValue();
        expect(parseFloat(value || '0')).toBeGreaterThan(0);
        logger.info(`Cycle time verified: ${value}`);
    }

    async verifyDirectProcessCostCalculated(): Promise<void> {
        const value = await this.directProcessCostInput.inputValue();
        expect(parseFloat(value || '0')).toBeGreaterThan(0);
        logger.info(`Direct process cost verified: ${value}`);
    }

    async verifyCostBreakdown(): Promise<{ [key: string]: number }> {
        const costs = {
            directMachineCost: parseFloat(await this.directMachineCostInput.inputValue() || '0'),
            directLaborCost: parseFloat(await this.directLaborCostInput.inputValue() || '0'),
            directSetupCost: parseFloat(await this.directSetupCostInput.inputValue() || '0'),
            inspectionCost: parseFloat(await this.inspectionCostInput.inputValue() || '0'),
            yieldCost: parseFloat(await this.yieldCostInput.inputValue() || '0'),
            directProcessCost: parseFloat(await this.directProcessCostInput.inputValue() || '0')
        };
        logger.info(`Cost breakdown: ${JSON.stringify(costs)}`);
        return costs;
    }

    // ==================== GETTERS ====================
    async getCycleTime(): Promise<number> {
        return parseFloat(await this.cycleTimeInput.inputValue() || '0');
    }

    async getDirectProcessCost(): Promise<number> {
        return parseFloat(await this.directProcessCostInput.inputValue() || '0');
    }

    async getEfficiency(): Promise<number> {
        return parseFloat(await this.efficiencyInput.inputValue() || '0');
    }

    // ==================== PRIVATE HELPERS ====================
    private async selectDropdownValue(locator: Locator, value: string): Promise<void> {
        await locator.waitFor({ state: 'visible' });
        try {
            await locator.selectOption({ label: value });
        } catch {
            await locator.click();
            await this.page.getByRole('option', { name: value }).first().click();
        }
    }

    private async fillInput(locator: Locator, value: string): Promise<void> {
        await locator.waitFor({ state: 'visible' });
        await locator.clear();
        await locator.fill(value);
        await locator.blur();
    }
}
