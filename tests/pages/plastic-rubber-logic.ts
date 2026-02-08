import { PlasticRubberPage } from './plastic-rubber.page';
import { PlasticRubberProcessCalculator } from '../utils/plastic-rubber-process-calculator';
import { MaterialDimensionsAndDensity, ProcessInfoDto } from '../utils/interfaces';
import { ProcessType } from '../utils/constants';
import { VerificationHelper } from '../lib/BasePage';
import Logger from '../lib/LoggerUtil';

const logger = Logger;

export class PlasticRubberLogic {
    private calculator = new PlasticRubberProcessCalculator();

    constructor(public page: PlasticRubberPage) { }
    public async getMaterialDimensionsAndDensity(): Promise<MaterialDimensionsAndDensity> {
        const DEFAULT_DENSITY = 7.85
        let density = DEFAULT_DENSITY
        let length = 0
        let width = 0
        let height = 0
        try {
            if (this.page.isPageClosed?.()) {
                logger.warn('⚠️ Page already closed — using defaults')
                return { length, width, height, density }
            }
            await this.page.waitAndClick(this.page.MaterialDetailsTab)
            if (
                await this.page.Density.first()
                    .isVisible({ timeout: 3000 })
                    .catch(() => false)
            ) {
                density =
                    Number(await this.page.Density.first().inputValue()) ||
                    DEFAULT_DENSITY
            } else {
                logger.warn('⚠️ Density field not visible — using default')
            }
            await this.page.waitAndClick(this.page.MaterialInfo)
            if (
                await this.page.PartEnvelopeLength.first()
                    .isVisible({ timeout: 3000 })
                    .catch(() => false)
            ) {
                ;[length, width, height] = (
                    await Promise.all([
                        this.page.PartEnvelopeLength.first().inputValue(),
                        this.page.PartEnvelopeWidth.first().inputValue(),
                        this.page.PartEnvelopeHeight.first().inputValue()
                    ])
                ).map(v => Number(v) || 0)
            } else {
                logger.warn('⚠️ Dimension fields not visible — using defaults')
            }
        } catch (err) {
            logger.warn(`⚠️ Failed to read material data safely: ${err}`)
        }
        logger.info(`📐 L:${length}, W:${width}, H:${height} | Density:${density}`)
        return { length, width, height, density }
    }

    //======================== Part Complexity ========================
    async getPartComplexity(testData?: {
        partComplexity?: 'low' | 'medium' | 'high'
    }): Promise<number> {
        logger.info('🔹 Processing Part Complexity...')
        await this.page.AdditionalDetails.scrollIntoViewIfNeeded()
        await this.page.waitAndClick(this.page.AdditionalDetails)
        const selectValueMap: Record<'low' | 'medium' | 'high', string> = {
            low: '1',
            medium: '2',
            high: '3'
        }

        if (testData?.partComplexity) {
            const key = testData.partComplexity.toLowerCase() as
                | 'low'
                | 'medium'
                | 'high'

            const optionValue = selectValueMap[key]
            if (!optionValue) {
                throw new Error(
                    `❌ Invalid Part Complexity: ${testData.partComplexity}`
                )
            }

            logger.info(`🔧 Selecting Part Complexity: ${key}`)
            await this.page.PartComplexity.selectOption(optionValue)
        }
        const selectedValue = await this.page.PartComplexity.inputValue()
        if (!selectedValue) {
            logger.warn('⚠️ Part Complexity not selected, defaulting to LOW')
            return 1
        }
        const partComplexity = Number(selectedValue)

        if (![1, 2, 3].includes(partComplexity)) {
            throw new Error(
                `❌ Unexpected Part Complexity value in UI: "${selectedValue}"`
            )
        }
        logger.info(`✅ Part Complexity resolved as: ${partComplexity}`)
        await this.page.waitAndClick(this.page.PartDetails)
        return partComplexity
    }

    // ========================== Navigation ==========================

    async navigateToProject(projectId: string): Promise<void> {
        logger.info(`🔹 Navigating to project: ${projectId}`)
        await this.page.waitAndClick(this.page.projectIcon)
        logger.info('Existing part found. Clicking Clear All...')
        const isClearVisible = await this.page.ClearAll.isVisible().catch(
            () => false
        )

        if (isClearVisible) {
            await this.page.waitAndClick(this.page.ClearAll)
        } else {
            await this.page.keyPress('Escape')
        }
        await this.page.openMatSelect(this.page.SelectAnOption, 'Project Selector')

        const projectOption = this.page.page
            .locator('mat-option, mat-mdc-option')
            .filter({ hasText: 'Project #' })
            .first()

        await projectOption.waitFor({ state: 'visible', timeout: 10000 })
        await projectOption.scrollIntoViewIfNeeded()
        await projectOption.click()

        logger.info('✅ Project option selected')

        await this.page.waitAndFill(this.page.ProjectValue, projectId)
        await this.page.pressTab()
        await this.page.pressEnter()
        await this.page.waitForNetworkIdle()
        await this.page.ProjectID.click()
        logger.info(`✔ Navigated to project ID: ${projectId}`)
    }
    /**
     * Verifies Injection Moulding Calculations
     */
    async verifyInjectionMoulding(): Promise<void> {
        logger.info('🔹 Verifying Injection Moulding Calculations...');

        // 1. Collect inputs from UI
        const density = await this.page.readNumberSafe(this.page.Density, 'Density');
        const grossWeight = await this.page.readNumberSafe(this.page.PartGrossWeight, 'Gross Weight');
        const wallAvgThickness = await this.page.readNumberSafe(this.page.WallAverageThickness, 'Wall Avg Thickness');
        const noOfCavities = await this.page.readNumberSafe(this.page.NoOfCavities, 'No Of Cavities');
        const netMatCost = await this.page.readNumberSafe(this.page.NetMaterialCost, 'Net Material Cost');
        const netWeight = await this.page.readNumberSafe(this.page.NetPartWeight, 'Net Weight');

        const machineHourRate = await this.page.readNumberSafe(this.page.MachineHourRate, 'Machine Hour Rate');
        const efficiency = await this.page.readNumberSafe(this.page.MachineEfficiency, 'Efficiency');
        const lowSkilledLaborRate = await this.page.readNumberSafe(this.page.LowSkilledLaborRate, 'Low Skilled Labor Rate');
        const noOfLowSkilledLabours = await this.page.readNumberSafe(this.page.NoOfLowSkilledLabours, 'No Of Low Skilled Labours');

        const lotSize = await this.page.readNumberSafe(this.page.LotSize, 'Lot Size');
        const samplingRate = await this.page.readNumberSafe(this.page.SamplingRate, 'Sampling Rate');
        const inspectionTime = await this.page.readNumberSafe(this.page.InspectionTime, 'Inspection Time');
        const qaRate = await this.page.readNumberSafe(this.page.QAInspectorRate, 'QA Rate');
        const yieldPer = await this.page.readNumberSafe(this.page.YieldPercentage, 'Yield %');

        // 2. Build DTO
        const processInfo: ProcessInfoDto = {
            processTypeID: ProcessType.InjectionMoulding,
            partComplexity: 1, // Default or scrape if needed
            materialInfoList: [{
                density: density,
                grossWeight: grossWeight,
                wallAverageThickness: wallAvgThickness,
                noOfCavities: noOfCavities,
                netMatCost: netMatCost,
                netWeight: netWeight,
                materialInfo: { scrapPrice: 0 } // Default 0 or scrape
            }],
            machineHourRate: machineHourRate,
            efficiency: efficiency,
            noOfLowSkilledLabours: noOfLowSkilledLabours,
            lowSkilledLaborRatePerHour: lowSkilledLaborRate,
            noOfSkilledLabours: 0,
            skilledLaborRatePerHour: 0,
            lotSize: lotSize,
            samplingRate: samplingRate,
            inspectionTime: inspectionTime,
            qaOfInspectorRate: qaRate,
            yieldPer: yieldPer,

            // ESG Inputs - These might need scraping from Machine/Labor details
            machineMaster: {
                totalPowerKW: 45, // Default or scraped
                powerUtilization: 0.8 // Default or scraped
            },
            laborRates: [{
                powerESG: 0.12 // Example: 0.12 kg CO2 / kWh
            }],

            // Flags to treat UI values as clean by default, will be overridden by logic if not dirty
            // In a fresh calculation test, we assume clean slate.
            iscoolingTimeDirty: false,
            isInsertsPlacementDirty: false,
            isPartEjectionDirty: false,
            isSideCoreMechanismsDirty: false,
            isOthersDirty: false,
            isinjectionTimeDirty: false,
            isDryCycleTimeDirty: false,
            isTotalTimeDirty: false,
            iscycleTimeDirty: false,
            isdirectMachineCostDirty: false,
            isdirectLaborCostDirty: false,
            isinspectionCostDirty: false,
            isdirectSetUpCostDirty: false,
            isyieldCostDirty: false
        };

        // 3. Calculate
        const result = this.calculator.calculationsForInjectionMoulding(processInfo);

        // 4. Verify Outputs
        await VerificationHelper.verifyNumeric(
            await this.page.readNumberSafe(this.page.CycleTime, 'Cycle Time'),
            Number(result.cycleTime),
            'Cycle Time'
        );

        await VerificationHelper.verifyNumeric(
            await this.page.readNumberSafe(this.page.DirectMachineCost, 'Direct Machine Cost'),
            Number(result.directMachineCost),
            'Direct Machine Cost'
        );

        await VerificationHelper.verifyNumeric(
            await this.page.readNumberSafe(this.page.DirectLaborCost, 'Direct Labor Cost'),
            Number(result.directLaborCost),
            'Direct Labor Cost'
        );

        await VerificationHelper.verifyNumeric(
            await this.page.readNumberSafe(this.page.InspectionCost, 'Inspection Cost'),
            Number(result.inspectionCost),
            'Inspection Cost'
        );

        await VerificationHelper.verifyNumeric(
            await this.page.readNumberSafe(this.page.DirectSetUpCost, 'Direct Setup Cost'),
            Number(result.directSetUpCost),
            'Direct Setup Cost'
        );

        await VerificationHelper.verifyNumeric(
            await this.page.readNumberSafe(this.page.YieldCost, 'Yield Cost'),
            Number(result.yieldCost),
            'Yield Cost'
        );

        await VerificationHelper.verifyNumeric(
            await this.page.readNumberSafe(this.page.DirectProcessCost, 'Direct Process Cost'),
            Number(result.directProcessCost),
            'Direct Process Cost'
        );

        // 5. Navigate to Sustainability Tab
        logger.info('📂 Navigating to Sustainability Tab...');
        await this.page.page.getByRole('tab', { name: 'Sustainability' }).click();
        await this.page.page.waitForLoadState('networkidle');

        // Power ESG Verification
        await VerificationHelper.verifyNumeric(
            await this.page.readNumberSafe(this.page.EsgImpactElectricityConsumption, 'Power ESG (Electricity Consumption)'),
            Number(result.esgImpactElectricityConsumption),
            'Power ESG (Electricity Consumption)'
        );

        logger.info('✔ Injection Moulding verification complete.');
    }
}
