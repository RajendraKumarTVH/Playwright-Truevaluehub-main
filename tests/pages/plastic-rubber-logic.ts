import { PlasticRubberPage } from './plastic-rubber.page';
import { PlasticRubberProcessCalculator } from '../utils/plastic-rubber-process-calculator';
import { ProcessInfoDto } from '../utils/interfaces';
import { ProcessType } from '../utils/constants';
import { VerificationHelper } from '../lib/BasePage';
import Logger from '../lib/LoggerUtil';

const logger = Logger;

export class PlasticRubberLogic {
    private calculator = new PlasticRubberProcessCalculator();

    constructor(public page: PlasticRubberPage) { }

    /**
     * Verifies Injection Moulding Calculations
     */
    async verifyInjectionMoulding(): Promise<void> {
        logger.info('🔹 Verifying Injection Moulding Calculations...');

        // 1. Collect inputs from UI
        const density = await this.page.readNumberSafe(this.page.Density, 'Density');
        const grossWeight = await this.page.readNumberSafe(this.page.GrossWeight, 'Gross Weight');
        const wallAvgThickness = await this.page.readNumberSafe(this.page.WallAverageThickness, 'Wall Avg Thickness');
        const noOfCavities = await this.page.readNumberSafe(this.page.NoOfCavities, 'No Of Cavities');
        const netMatCost = await this.page.readNumberSafe(this.page.NetMaterialCost, 'Net Material Cost');
        const netWeight = await this.page.readNumberSafe(this.page.NetPartWeight, 'Net Weight');

        const machineHourRate = await this.page.readNumberSafe(this.page.MachineHourRate, 'Machine Hour Rate');
        const efficiency = await this.page.readNumberSafe(this.page.Efficiency, 'Efficiency');
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
