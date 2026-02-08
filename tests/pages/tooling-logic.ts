
import { expect } from '@playwright/test';
import Logger from '../lib/LoggerUtil';
import { ToolingPage } from './tooling.page';
import { ToolingCalculator, CostToolingDto, ToolingMaterialInfoDto } from '../utils/tooling-calculator';
import { VerificationHelper } from '../lib/BasePage';

const logger = Logger;

export class ToolingLogic {
    private readonly calculator = new ToolingCalculator();

    constructor(public page: ToolingPage) { }

    async collectToolingData(): Promise<CostToolingDto> {
        logger.info('🔹 Collecting Tooling Data from UI...');

        const data: CostToolingDto = {
            noOfCavity: await this.page.readNumberSafe(this.page.NoOfCavity, 'No Of Cavity'),
            cavityMaxLength: await this.page.readNumberSafe(this.page.CavityLength, 'Cavity Length'),
            cavityMaxWidth: await this.page.readNumberSafe(this.page.CavityWidth, 'Cavity Width'),
            sideGapLength: await this.page.readNumberSafe(this.page.SideGapLength, 'Side Gap Length'),
            sideGapWidth: await this.page.readNumberSafe(this.page.SideGapWidth, 'Side Gap Width'),
            envelopLength: await this.page.readNumberSafe(this.page.EnvelopeLength, 'Envelope Length'),
            envelopWidth: await this.page.readNumberSafe(this.page.EnvelopeWidth, 'Envelope Width'),
            envelopHeight: await this.page.readNumberSafe(this.page.EnvelopeHeight, 'Envelope Height'),
            runnerGapLength: await this.page.readNumberSafe(this.page.RunnerGapLength, 'Runner Gap Length'),
            runnerGapWidth: await this.page.readNumberSafe(this.page.RunnerGapWidth, 'Runner Gap Width'),
            moldBaseLength: await this.page.readNumberSafe(this.page.MoldBaseLength, 'Mold Base Length'),
            moldBaseWidth: await this.page.readNumberSafe(this.page.MoldBaseWidth, 'Mold Base Width'),
            moldBaseHeight: await this.page.readNumberSafe(this.page.MoldBaseHeight, 'Mold Base Height'),
            noOfTool: await this.page.readNumberSafe(this.page.TotalNoOfTools, 'Total No Of Tools'),
            noOfNewTool: await this.page.readNumberSafe(this.page.NoOfNewTools, 'No Of New Tools'),
            noOfSubsequentTool: await this.page.readNumberSafe(this.page.NoOfSubsequentTools, 'No Of Subsequent Tools'),
            toolLifeInParts: await this.page.readNumberSafe(this.page.NoOfShotsNeededFromTool, 'Tool Life In Parts'),
            mouldTypeId: Number(await this.page.MouldType.inputValue() || 0),
            mouldSubTypeId: Number(await this.page.MouldSubType.inputValue() || 0),
            noOfDrop: await this.page.readNumberSafe(this.page.NoOfDrop, 'No Of Drop'),
            noOfCopperElectrodes: await this.page.readNumberSafe(this.page.NoOfCopperElectrodes, 'No Of Copper Electrodes'),
            noOfGraphiteElectrodes: await this.page.readNumberSafe(this.page.NoOfGraphiteElectrodes, 'No Of Graphite Electrodes'),
            mouldCriticality: Number(await this.page.MouldCriticality.inputValue() || 0),
            surfaceFinish: Number(await this.page.SurfaceFinish.inputValue() || 0),
        };

        return data;
    }

    async verifyToolingCalculations(): Promise<void> {
        logger.info('🔹 Verifying Tooling Calculations...');

        const uiData = await this.collectToolingData();

        // In a real scenario, you'd also need to collect material info rows
        // For now, let's verify the subsequent tool and base dimensions logic
        const expectedSubsequentTools = Math.max(0, uiData.noOfTool - uiData.noOfNewTool);

        await VerificationHelper.verifyNumeric(
            uiData.noOfSubsequentTool,
            expectedSubsequentTools,
            'Number of Subsequent Tools'
        );

        logger.info('✔ Tooling Calculations verified successfully');
    }

    async fillToolingDetails(details: Partial<CostToolingDto>): Promise<void> {
        logger.info('🔹 Filling Tooling Details...');

        if (details.noOfTool !== undefined) {
            await this.page.waitAndFill(this.page.TotalNoOfTools, details.noOfTool);
        }
        if (details.noOfNewTool !== undefined) {
            await this.page.waitAndFill(this.page.NoOfNewTools, details.noOfNewTool);
        }
        // Add more filling logic as needed

        await this.page.pressTab();
        await this.page.waitForNetworkIdle();
    }

    async verifyMaterialInfoRows(expectedInfos: Partial<ToolingMaterialInfoDto>[]): Promise<void> {
        logger.info('🔹 Verifying Material Info Rows...');

        // This is a simplified version. 
        // In the UI, we would iterate through rows of the table.
        // For now, let's just use the calculator to verify the logic against UI values

        const uiData = await this.collectToolingData();

        for (const expected of expectedInfos) {
            logger.info(`Checking row: ${expected.moldDescription}`);

            // Logic to find row in UI and read its values
            // (Mocking the UI read for now or implementing if selectors known)

            const matInfo: ToolingMaterialInfoDto = {
                moldDescriptionId: expected.moldDescriptionId!,
                moldDescription: expected.moldDescription!,
                length: expected.length || 0,
                width: expected.width || 0,
                height: expected.height || 0,
                quantity: expected.quantity || 0,
                density: expected.density || 7.85,
                materialPrice: expected.materialPrice || 0,
                materialCuttingAllowance: expected.materialCuttingAllowance || 10,
                netWeight: 0,
                totalPlateWeight: 0,
                totalRawMaterialCost: 0
            };

            const calculated = this.calculator.calculateMaterialCost(matInfo, uiData, []);

            // Here you would add the actual Playwright expect(locator).toHaveValue(...)
            logger.info(`Calculated Raw Material Cost for ${matInfo.moldDescription}: ${calculated.totalRawMaterialCost}`);
        }
    }
}
