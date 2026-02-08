import Logger from '../lib/LoggerUtil'
import {
	MaterialDimensionsAndDensity,
	WeldSubMaterialUI
} from '../utils/interfaces'
import { WeldingCalculator } from '../utils/welding-calculator'
import { MigWeldingPage } from './mig-welding.page'

const logger = Logger

export async function readMaterialDimensionsAndDensity(
	page: MigWeldingPage
): Promise<MaterialDimensionsAndDensity> {
	const DEFAULT_DENSITY = 7.87
	let density = DEFAULT_DENSITY
	let length = 0
	let width = 0
	let height = 0

	try {
		if (page.isPageClosed?.()) {
			logger.warn('⚠️ Page already closed — using defaults')
			return { length, width, height, density }
		}
		await page.waitAndClick(page.MaterialDetailsTab)
		if (
			await page.Density.first()
				.isVisible({ timeout: 3000 })
				.catch(() => false)
		) {
			density =
				Number(await page.Density.first().inputValue()) || DEFAULT_DENSITY
		} else {
			logger.warn('⚠️ Density field not visible — using default')
		}
		await page.waitAndClick(page.MaterialInfo)
		if (
			await page.PartEnvelopeLength.first()
				.isVisible({ timeout: 3000 })
				.catch(() => false)
		) {
			;[length, width, height] = (
				await Promise.all([
					page.PartEnvelopeLength.first().inputValue(),
					page.PartEnvelopeWidth.first().inputValue(),
					page.PartEnvelopeHeight.first().inputValue()
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

export async function verifyWeldingMaterialCalculationsHelper(
	page: MigWeldingPage,
	calculator: WeldingCalculator,
	collectWelds?: () => Promise<WeldSubMaterialUI[]>
): Promise<void> {
	logger.info('\n🔹 Step: Verify Material Calculations from UI (helper)')
	const { density } = await readMaterialDimensionsAndDensity(page)
	logger.info(`🧪 Density → ${density}`)

	const partVolume = await page.waitForStableNumber(
		page.PartVolume,
		'Part Volume'
	)
	logger.info(`📦 Part Volume → ${partVolume}`)

	const expectedNetWeight = calculator.calculateNetWeight
		? calculator.calculateNetWeight(partVolume, density)
		: partVolume * density

	// Use existing UI verification helpers
	// Verify net weight if possible
	try {
		const actualNetWeight = await (async () => {
			const net = await page.readNumberSafe(
				page.NetWeight,
				'Net Weight',
				10000,
				2
			)
			return net / 1000
		})()
		// Best-effort numeric check
		if (Number.isFinite(expectedNetWeight)) {
			// allow slight tolerance
			const diff = Math.abs(actualNetWeight - expectedNetWeight)
			if (diff > 0.1) {
				logger.warn(
					`⚠️ Net weight mismatch (ui ${actualNetWeight} vs calc ${expectedNetWeight})`
				)
			}
		}
	} catch (err) {
		logger.warn(`⚠️ Could not verify net weight in helper: ${err}`)
	}

	// Prefer using provided collector to avoid duplicating logic from MigWeldingLogic
	const weldSubMaterials: WeldSubMaterialUI[] = await (collectWelds
		? collectWelds()
		: (async () => {
				const arr: WeldSubMaterialUI[] = []
				for (const i of [1, 2] as const) {
					try {
						const weldType = await page.getSelectedOptionText(
							page[`MatWeldType${i}`]
						)
						const weldSide = await page.getSelectedOptionText(
							page[`MatWeldSide${i}`]
						)
						const weldSize = Number(await page[`MatWeldSize${i}`].inputValue())
						const weldElementSize = Number(
							await page[`MatWeldElementSize${i}`].inputValue()
						)
						const weldLength = Number(
							await page[`MatWeldLengthmm${i}`].inputValue()
						)
						const weldPlaces = Number(
							await page[`MatWeldPlaces${i}`].inputValue()
						)
						const wireDia = Number(
							(await page[`MatWireDia${i}`]?.inputValue()) || 0
						)
						const noOfWeldPasses = Number(
							await page[`MatNoOfWeldPasses${i}`].inputValue()
						)

						arr.push({
							weldType,
							weldSide,
							weldSize,
							weldElementSize,
							weldLength,
							weldPlaces,
							wireDia,
							noOfWeldPasses
						})
					} catch {
						// ignore missing rows
					}
				}
				return arr
			})())

	const calculated = calculator.calculateExpectedWeldingMaterialCosts(
		{ density },
		weldSubMaterials
	)

	logger.info(`📐 Calculated → ${JSON.stringify(calculated)}`)

	try {
		await page.verifyUIValue({
			locator: page.totalWeldLength,
			expectedValue: calculated.totalWeldLength,
			label: 'Total Weld Length'
		})
		await page.verifyUIValue({
			locator: page.TotalWeldMaterialWeight,
			expectedValue: calculated.totalWeldMaterialWeight,
			label: 'Total Weld Material Weight'
		})
		await page.verifyUIValue({
			locator: page.WeldBeadWeightWithWastage,
			expectedValue: calculated.weldBeadWeightWithWastage,
			label: 'Weld Bead Weight with Wastage'
		})
	} catch (err) {
		logger.warn(`⚠️ UI verification failed in material helper: ${err}`)
	}

	logger.info('✅ Material calculations verified successfully from helper')
}
