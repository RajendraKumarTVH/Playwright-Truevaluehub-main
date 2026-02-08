import Logger from '../lib/LoggerUtil'
import { StockMachiningTestingPage } from './stock-machining-testing.page'
import ManufacturingCalculator from '../utils/ManufacturingCalculator'
import { VerificationHelper } from '../lib/BasePage'

const logger = Logger

export class StockMachiningLogic {
	constructor(public page: StockMachiningTestingPage) {}

	async verifyCosts(): Promise<void> {
		logger.info('🔸 Verifying Stock Machining Costs')
		const vals = await this.page.readAll()

		const cycleTime = Number(vals.cycleTime || 0)
		const machineHourRate = Number(
			vals.machineHourRate || vals.machineHourRate || 0
		)
		const skilledLaborRate = Number(vals.skilledLaborRate || 0)
		const setupTime = Number(vals.setUpTime || vals.setupTime || 0)
		const lotSize = Number(vals.lotSize || vals.lotSize || 1)
		const lowSkilled = Number(vals.lowSkilledLaborRatePerHour || 0)
		const noOfLowSkilled = Number(vals.noOfLowSkilledLabours || 1)
		const qaRate = Number(vals.qaOfInspectorRate || 0)
		const inspectionTime = Number(vals.inspectionTime || 0)
		const samplingRate = Number(vals.samplingRate || 0)
		const materialCost = Number(vals.netMaterialCost || 0)
		const materialWeight = Number(vals.netWeight || 0)
		const scrapPrice = Number(vals.scrapPrice || 0)

		const expectedDirectMachine = ManufacturingCalculator.directMachineCost(
			machineHourRate,
			cycleTime
		)
		const expectedDirectSetup = ManufacturingCalculator.directSetupCost(
			skilledLaborRate,
			machineHourRate,
			setupTime,
			lotSize
		)
		const expectedDirectLabor = ManufacturingCalculator.directLaborCost(
			lowSkilled,
			cycleTime,
			noOfLowSkilled
		)
		const expectedQa = ManufacturingCalculator.qaInspectionCost(
			qaRate,
			inspectionTime,
			samplingRate,
			lotSize
		)
		const expectedYield = ManufacturingCalculator.yieldCost(
			Number(vals.yieldPer || 0),
			materialCost,
			expectedDirectMachine +
				expectedDirectSetup +
				expectedDirectLabor +
				expectedQa,
			materialWeight,
			scrapPrice
		)
		const expectedNet = ManufacturingCalculator.netProcessCost(
			expectedDirectMachine,
			expectedDirectSetup,
			expectedDirectLabor,
			expectedQa,
			expectedYield
		)

		// Verify using test helpers
		await VerificationHelper.verifyNumeric(
			Number(vals.directMachineCost || 0),
			Number(expectedDirectMachine),
			'Direct Machine Cost'
		)
		await VerificationHelper.verifyNumeric(
			Number(vals.directSetUpCost || 0),
			Number(expectedDirectSetup),
			'Direct Setup Cost'
		)
		await VerificationHelper.verifyNumeric(
			Number(vals.directLaborCost || 0),
			Number(expectedDirectLabor),
			'Direct Labor Cost'
		)
		await VerificationHelper.verifyNumeric(
			Number(vals.inspectionCost || 0),
			Number(expectedQa),
			'QA Inspection Cost'
		)
		await VerificationHelper.verifyNumeric(
			Number(vals.yieldCost || 0),
			Number(expectedYield),
			'Yield Cost'
		)
		await VerificationHelper.verifyNumeric(
			Number(vals.directProcessCost || 0),
			Number(expectedNet),
			'Net Process Cost'
		)

		logger.info('✅ Stock Machining cost verification complete')
	}
}
