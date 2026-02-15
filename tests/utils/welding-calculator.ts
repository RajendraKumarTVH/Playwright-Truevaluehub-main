import { expect, Locator, Page } from '@playwright/test'
import Logger from '../lib/LoggerUtil'
import { normalizeEfficiency } from './helpers'
import { CostingConfig, costingConfig } from './costing-config'
import { WeldingConfigService } from './weldingConfig'
import {
	TotalCycleTimeInput,
	WeldCycleTimeBreakdown,
	WeldCycleTimeInput,
	ProcessInfoDto,
	SubProcessInfo
} from './interfaces'
import {
	PartComplexity,
	ProcessType,
	PrimaryProcessType,
	MachineType
} from './welding-enums-constants'

const MigWeldingData: any[] = []
const logger = Logger

export function getWireDiameter(
	materialType: string,
	weldSize: number
): number {
	const candidates = MigWeldingData.filter(d => d.MaterialType === materialType)

	const exact = candidates.find(d => d.PlateThickness_mm === weldSize)
	if (exact) return exact.WireDiameter_mm

	const thickness = Number(weldSize)

	const sorted = candidates.sort(
		(a, b) => a.PlateThickness_mm - b.PlateThickness_mm
	)
	const ge = sorted.find(d => d.PlateThickness_mm >= thickness)

	if (ge) return ge.WireDiameter_mm

	if (sorted.length > 0) return sorted[sorted.length - 1].WireDiameter_mm

	return 0
}

export interface LaborRateMasterDto {
	powerCost: number
	[key: string]: any
}

export interface SubProcessTypeInfoDto {
	[key: string]: any
}

class SharedService {
	checkDirtyProperty(fieldName: string, fieldList: any[]): boolean {
		return (
			fieldList?.find(
				(x: any) =>
					x.formControlName == fieldName && x.subProcessIndex == undefined
			)?.isDirty || false
		)
	}

	isValidNumber(n: any): number {
		return !n || Number.isNaN(n) || !Number.isFinite(Number(n)) || n < 0
			? 0
			: Number(Number(n).toFixed(4))
	}
}

class SheetMetalConfigService {
	mapMaterial(name: any) {
		return name
	}
}

// Main Calculator Class
export class WeldingCalculator {
	weldingMode = 'welding'
	readonly shareService: SharedService
	readonly _weldingConfig: WeldingConfigService
	readonly _costingConfig: CostingConfig
	public _smConfig: SheetMetalConfigService

	private getWeldPositionId(
		position: string | number | undefined | null
	): number {
		if (typeof position === 'number') return position
		if (!position) return 1
		const s = String(position).toLowerCase()
		if (s.includes('flat')) return 1
		if (s.includes('horizontal')) return 2
		if (s.includes('vertical')) return 3
		if (s.includes('overhead')) return 4
		if (s.includes('circular')) return 5
		if (s.includes('combination')) return 6
		return 1
	}

	// Constructor updated via refactor
	constructor() {
		this.shareService = new SharedService()
		this._costingConfig = new CostingConfig()
		this._weldingConfig = new WeldingConfigService()
		this._smConfig = new SheetMetalConfigService()
	}
	public calculateNetWeight(
		partVolume: number, // cm3
		density: number // g/cm3
	): number {
		const weightGrams = partVolume * density
		return weightGrams
	}

	public calculateNetMaterialCost(
		weldBeadWeightWithWastage: number,
		materialPricePerKg: number,
		volumeDiscountPercentage: number = 0
	): number {
		let netMatCost = (weldBeadWeightWithWastage / 1000) * materialPricePerKg
		if (volumeDiscountPercentage > 0) {
			netMatCost = netMatCost * (1 - volumeDiscountPercentage / 100)
		}
		return this.shareService.isValidNumber(netMatCost)
	}

	public calculateLotSize(annualVolumeQty: number): number {
		if (!annualVolumeQty || annualVolumeQty <= 0) {
			return 1 // Minimum lot size
		}
		return Math.round(annualVolumeQty / 12)
	}

	public calculationForSeamWelding(
		manufactureInfo: ProcessInfoDto,
		fieldColorsList: any,
		manufacturingObj: ProcessInfoDto,
		laborRateDto: LaborRateMasterDto[]
	): ProcessInfoDto {
		this.weldingMode = 'seamWelding'
		this.weldingPreCalc(manufactureInfo, fieldColorsList, manufacturingObj)

		const materialInfo = manufactureInfo.materialInfoList.find(
			(x: any) => x.processId === PrimaryProcessType.SeamWelding
		)
		manufactureInfo.netMaterialCost = materialInfo?.netMatCost
		manufactureInfo.netPartWeight = materialInfo?.netWeight

		!manufactureInfo.meltingWeight &&
			(manufactureInfo.meltingWeight = manufactureInfo.netPartWeight)

		const weldingPartHandlingValues = this._costingConfig
			.weldingValuesForPartHandling('seamWelding')
			.find((x: any) => x.toPartWeight >= Number(manufactureInfo.meltingWeight) / 1000)
		const machineValues = this._costingConfig
			.weldingMachineValuesForSeamWelding()
			.find(
				(x: any) =>
					manufactureInfo.machineMaster.machineDescription.indexOf(x.machine) >=
					0
			)

		if (manufactureInfo.iscuttingSpeedDirty && !!manufactureInfo.cuttingSpeed) {
			manufactureInfo.cuttingSpeed = Number(manufactureInfo.cuttingSpeed)
		} else {
			let cuttingSpeed = machineValues?.weldingEfficiency || 0
			if (manufactureInfo.cuttingSpeed) {
				cuttingSpeed = this.shareService.checkDirtyProperty(
					'cuttingSpeed',
					fieldColorsList
				)
					? manufacturingObj?.cuttingSpeed
					: cuttingSpeed
			}
			manufactureInfo.cuttingSpeed = cuttingSpeed
		}

		if (
			manufactureInfo.isUnloadingTimeDirty &&
			!!manufactureInfo.unloadingTime
		) {
			manufactureInfo.unloadingTime = Number(manufactureInfo.unloadingTime)
		} else {
			let unloadingTime = weldingPartHandlingValues?.unloading || 0
			if (manufactureInfo.unloadingTime) {
				unloadingTime = this.shareService.checkDirtyProperty(
					'unloadingTime',
					fieldColorsList
				)
					? manufacturingObj?.unloadingTime
					: unloadingTime
			}
			manufactureInfo.unloadingTime = unloadingTime
		}

		if (manufactureInfo.iscycleTimeDirty && !!manufactureInfo.cycleTime) {
			manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime)
		} else {
			let cycleTime = this.shareService.isValidNumber(
				Number(manufactureInfo.unloadingTime) +
				Number(manufactureInfo.cuttingLength) /
				Number(manufactureInfo.cuttingSpeed)
			)
			if (manufactureInfo.cycleTime) {
				cycleTime = this.shareService.checkDirtyProperty(
					'cycleTime',
					fieldColorsList
				)
					? manufacturingObj?.cycleTime
					: cycleTime
			}
			manufactureInfo.cycleTime = cycleTime
		}

		this.weldingCommonCalc(
			manufactureInfo,
			fieldColorsList,
			manufacturingObj,
			laborRateDto
		)
		return manufactureInfo
	}

	public calculationForSpotWelding(
		manufactureInfo: ProcessInfoDto,
		fieldColorsList: any,
		manufacturingObj: ProcessInfoDto,
		laborRateDto: LaborRateMasterDto[]
	): ProcessInfoDto {
		this.weldingMode = 'spotWelding'
		this.weldingPreCalc(manufactureInfo, fieldColorsList, manufacturingObj)

		const materialInfo = manufactureInfo.materialInfoList.find(
			(x: any) => x.processId === PrimaryProcessType.SpotWelding
		)
		manufactureInfo.netMaterialCost = materialInfo?.netMatCost
		manufactureInfo.netPartWeight = materialInfo?.netWeight

		const partTickness = Number(materialInfo?.partTickness) || 0
		const weldingValues = this._costingConfig
			.spotWeldingValuesForMachineType()
			.find((x: any) => x.toPartThickness >= partTickness)
		const weldingPartHandlingValues = this._costingConfig
			.weldingValuesForPartHandling('spotWelding')
			.find(
				(x: any) =>
					x.toPartWeight >= Number(manufactureInfo.netPartWeight) / 1000
			)

		if (weldingValues) {
			manufactureInfo.requiredCurrent =
				(weldingValues.weldCurrent as Record<number, number>)[
				Number(materialInfo?.wireDiameter)
				] || 0
			manufactureInfo.requiredWeldingVoltage = weldingValues.openCircuitVoltage
			const holdTime = weldingValues?.holdTime / 60 / 0.75
			const squeezeTime = 3
			const offTime = 2
			if (!manufactureInfo.noOfWeldPasses) {
				manufactureInfo.noOfWeldPasses = 1
			}

			const calculatedUnloadingTime =
				Number(manufactureInfo?.noOfWeldPasses) *
				(weldingPartHandlingValues?.loading || 0) +
				(weldingPartHandlingValues?.unloading || 0)

			manufactureInfo.unloadingTime = this.resolveField<number>(
				'unloadingTime',
				manufactureInfo.unloadingTime,
				!!manufactureInfo.isUnloadingTimeDirty,
				calculatedUnloadingTime,
				fieldColorsList,
				manufacturingObj
			)

			const calculatedDryCycleTime =
				(squeezeTime + holdTime + offTime) *
				(Number(manufactureInfo?.noOfTackWeld) || 0)

			manufactureInfo.dryCycleTime = this.resolveField<number>(
				'dryCycleTime',
				manufactureInfo.dryCycleTime,
				!!manufactureInfo.isDryCycleTimeDirty,
				calculatedDryCycleTime,
				fieldColorsList,
				manufacturingObj
			)

			const calculatedCycleTime =
				Number(manufactureInfo.dryCycleTime) +
				Number(manufactureInfo.unloadingTime)

			manufactureInfo.cycleTime = this.resolveField<number>(
				'cycleTime',
				manufactureInfo.cycleTime,
				!!manufactureInfo.iscycleTimeDirty,
				calculatedCycleTime,
				fieldColorsList,
				manufacturingObj
			)
		}

		this.weldingCommonCalc(
			manufactureInfo,
			fieldColorsList,
			manufacturingObj,
			laborRateDto
		)

		manufactureInfo.totalPowerCost = this.shareService.isValidNumber(
			((Number(manufactureInfo.dryCycleTime) / 3600) *
				Number(manufactureInfo.powerConsumptionKW) *
				Number(manufactureInfo.electricityUnitCost)) /
			(Number(manufactureInfo.efficiency || 100) / 100)
		)
		logger.info(
			`weldingCommonCalc Total Power Cost: dryCycleTime: ${Number(manufactureInfo.dryCycleTime) / 3600}, powerConsumptionKW: ${Number(manufactureInfo.powerConsumptionKW)}, electricityUnitCost: ${Number(manufactureInfo.electricityUnitCost)}, efficiency: ${Number(manufactureInfo.efficiency) / 100}= totalPowerCost: ${manufactureInfo.totalPowerCost}`
		)
		return manufactureInfo
	}

	public async verifyAutocompleteDropdown(
		dropdown: Locator,
		options: Locator,
		defaultSearchText: string,
		label: string,
		cityField?: Locator,
		countryField?: Locator
	): Promise<void> {
		logger.info(`🔹 Verifying ${label} dropdown...`)

		await dropdown.scrollIntoViewIfNeeded()
		await expect(dropdown).toBeVisible()

		// Skip if disabled / readonly
		if (
			(await dropdown.isDisabled()) ||
			(await dropdown.getAttribute('readonly'))
		) {
			logger.warn(`⚠️ ${label} dropdown is disabled. Skipping validation.`)
			return
		}

		// Open dropdown
		await dropdown.click()

		// Trigger autocomplete if needed
		if ((await options.count()) === 0) {
			await dropdown.fill(defaultSearchText)
		}

		await expect(options.first()).toBeVisible()

		const optionCount = await options.count()
		expect(optionCount).toBeGreaterThan(0)
		const selectedOptionText = (await options.first().innerText()).trim()

		await options.first().click()

		// Validate selected value
		const selectedValue =
			(await dropdown.inputValue().catch(() => '')) ||
			(await dropdown.textContent()) ||
			''

		expect
			.soft(selectedValue.toLowerCase())
			.toContain(selectedOptionText.toLowerCase())

		// Optional dependent fields
		if (cityField && countryField) {
			const city = (await cityField.inputValue().catch(() => '')).trim()
			const country = (await countryField.inputValue().catch(() => '')).trim()
		}

		logger.info(`✅ ${label} dropdown validation completed`)
	}

	public calculationForWelding(
		manufactureInfo: ProcessInfoDto,
		fieldColorsList: any,
		manufacturingObj: ProcessInfoDto,
		laborRateDto: LaborRateMasterDto[]
	): ProcessInfoDto {
		this.weldingMode = 'welding'
		this.weldingPreCalc(manufactureInfo, fieldColorsList, manufacturingObj) // pre Welding Calc

		let materialInfo = null
		let noOfTackWeld = 0
		let weldingValues = null
		let len = 0
		if (Number(manufactureInfo.processTypeID) === ProcessType.StickWelding) {
			// stick/arc welding
			this.weldingMode = 'stickWelding'
			materialInfo = manufactureInfo.materialInfoList.find(
				(x: any) => x.processId === PrimaryProcessType.StickWelding
			)
			len = materialInfo?.dimX || 0
			const partTickness = Number(materialInfo?.partTickness) || 0
			weldingValues = this._costingConfig
				.weldingValuesForStickWelding()
				.find((x: any) => x.ToPartThickness >= partTickness)
			noOfTackWeld = this._costingConfig.noOfTrackWeld(len)
		} else if (
			Number(manufactureInfo.processTypeID) === ProcessType.TigWelding
		) {
			this.weldingMode = 'tigWelding'
			materialInfo = manufactureInfo.materialInfoList.find(
				(x: any) => x.processId === PrimaryProcessType.TigWelding
			)
			len = materialInfo?.dimX || 0
			const partTickness = Number(materialInfo?.partTickness) || 0
			weldingValues = this._costingConfig
				.tigWeldingValuesForMachineType()
				.find(
					(x: any) =>
						x.id === Number(manufactureInfo.semiAutoOrAuto) &&
						x.ToPartThickness >= partTickness
				)
			noOfTackWeld = len / 50
		} else if (
			Number(manufactureInfo.processTypeID) === ProcessType.MigWelding
		) {
			this.weldingMode = 'migWelding'
			materialInfo = manufactureInfo.materialInfoList.find(
				(x: any) => x.processId === PrimaryProcessType.MigWelding
			)
			len = materialInfo?.dimX || 0
			const partTickness = Number(materialInfo?.partTickness) || 0
			weldingValues = this._costingConfig
				.weldingValuesForMachineType()
				.find(
					(x: any) =>
						x.id === Number(manufactureInfo.semiAutoOrAuto) &&
						x.ToPartThickness >= Number(partTickness)
				)
			noOfTackWeld = len / 50
		}

		manufactureInfo.netMaterialCost = materialInfo?.netMatCost
		manufactureInfo.netPartWeight = materialInfo?.netWeight

		const materialType = this._smConfig.mapMaterial(
			materialInfo?.materialMasterData?.materialType?.materialTypeName ||
			(materialInfo?.materialDescriptionList &&
				materialInfo?.materialDescriptionList.length > 0
				? materialInfo?.materialDescriptionList[0]?.materialTypeName
				: null) ||
			manufactureInfo?.materialmasterDatas?.materialTypeName
		)

		if (
			[ProcessType.MigWelding, ProcessType.TigWelding].includes(
				Number(manufactureInfo.processTypeID)
			)
		) {
			let totalWeldCycleTime = 0

			// Check if we have subProcessFormArray (Angular environment) or coreCostDetails (test environment)
			const hasFormArray =
				manufactureInfo.subProcessFormArray &&
				manufactureInfo.subProcessFormArray.length > 0
			const hasCoreCostDetails =
				materialInfo?.coreCostDetails && materialInfo.coreCostDetails.length > 0

			if (hasFormArray) {
				for (let i = 0; i < manufactureInfo.subProcessFormArray.length; i++) {
					const element = manufactureInfo.subProcessFormArray.controls[i]
					const subProcessInfo = element.value as SubProcessTypeInfoDto

					const efficiency = this._weldingConfig.getWeldingEfficiency(
						subProcessInfo.formLength,
						manufactureInfo.semiAutoOrAuto === 1
					)

					// Travel Speed
					const weldingData = this._weldingConfig.getWeldingData(
						materialType,
						subProcessInfo.shoulderWidth,
						materialInfo?.processId,
						'Manual'
					)

					if (element.get('formHeight')?.dirty && !!element.value?.formHeight) {
						subProcessInfo.formHeight = Number(element.value?.formHeight)
					} else {
						let travelSpeed =
							manufactureInfo.semiAutoOrAuto === 1
								? this.shareService.isValidNumber(
									((weldingData?.TravelSpeed_mm_per_sec ?? 0) / 0.8) *
									efficiency || 0
								)
								: this.shareService.isValidNumber(
									(weldingData?.TravelSpeed_mm_per_sec ?? 0) * efficiency || 0
								)
						logger.info(`Travel Speed: ${travelSpeed}`)

						if (!!subProcessInfo.formHeight) {
							travelSpeed = this.checkFormArrayDirtyField(
								'formHeight',
								i,
								fieldColorsList
							)
								? manufacturingObj?.subProcessTypeInfos?.[i]?.formHeight
								: this.shareService.isValidNumber(travelSpeed)
							logger.info(`formHeight: ${subProcessInfo.formHeight}`)
						}

						subProcessInfo.formHeight = travelSpeed
						logger.info(`formHeight: ${subProcessInfo.formHeight}`)
					}

					const lengthOfCut = Number(subProcessInfo.lengthOfCut)
					logger.info(`Length of Cut: ${lengthOfCut}`)

					// No. of Intermediate Start/Stops (nos)
					if (!subProcessInfo.formPerimeter) {
						subProcessInfo.formPerimeter =
							subProcessInfo.formingForce === 1
								? subProcessInfo.noOfHoles
								: subProcessInfo.noOfHoles * subProcessInfo.formingForce
					}
					// Cycle time No. of Intermediate Start/Stops (nos)
					const cycleTimeForIntermediateStops = subProcessInfo.formPerimeter * 5
					logger.info(
						`Cycle Time For Intermediate Stops: ${cycleTimeForIntermediateStops}`
					)

					// totalWeldLength = Length * Places * SideFactor
					const totalWeldLength = this.shareService.isValidNumber(
						(subProcessInfo.blankArea || 0) *
						(subProcessInfo.noOfHoles || 1) *
						(subProcessInfo.formingForce || 1)
					)
					logger.info(
						`Total Weld Length: Length=${subProcessInfo.blankArea}, Places=${subProcessInfo.noOfHoles}, Sides=${subProcessInfo.formingForce} → Total=${totalWeldLength}`
					)

					// HL Factor (No. of tack welds)
					if (!subProcessInfo.hlFactor) {
						if (subProcessInfo.noOfBends > 100) {
							subProcessInfo.hlFactor = this.shareService.isValidNumber(
								Math.round(subProcessInfo.noOfBends / 100) *
								subProcessInfo.noOfHoles
							)
							logger.info(
								`HL Factor: ${subProcessInfo.noOfBends} noOfHoles ${subProcessInfo.noOfHoles} hlFactor ${subProcessInfo.hlFactor}`
							)
						} else {
							subProcessInfo.hlFactor = subProcessInfo.noOfHoles
							logger.info(
								`noOfHoles ${subProcessInfo.noOfHoles} hlFactor ${subProcessInfo.hlFactor}`
							)
						}
					}

					// (Cycle time for tack weld)
					const cycleTimeForTackWeld = subProcessInfo.hlFactor * 3

					// weld cycle time
					subProcessInfo.recommendTonnage = this.shareService.isValidNumber(
						totalWeldLength / subProcessInfo.formHeight +
						cycleTimeForIntermediateStops +
						cycleTimeForTackWeld
					)

					if (lengthOfCut === 4) {
						subProcessInfo.recommendTonnage *= 0.95
					} else if (lengthOfCut === 5) {
						subProcessInfo.recommendTonnage *= 1.5
					}

					totalWeldCycleTime += subProcessInfo.recommendTonnage
						; (manufactureInfo.subProcessFormArray.controls as any[])[
							i
						].patchValue({
							subProcessTypeID: Number(manufactureInfo.processTypeID)
						})
						; (manufactureInfo.subProcessFormArray.controls as any[])[
							i
						].patchValue({ formPerimeter: subProcessInfo.formPerimeter })
						; (manufactureInfo.subProcessFormArray.controls as any[])[
							i
						].patchValue({ formHeight: subProcessInfo.formHeight })
						; (manufactureInfo.subProcessFormArray.controls as any[])[
							i
						].patchValue({ hlFactor: subProcessInfo.hlFactor })
						; (manufactureInfo.subProcessFormArray.controls as any[])[
							i
						].patchValue({ recommendTonnage: subProcessInfo.recommendTonnage })
					subProcessInfo.subProcessTypeID = manufactureInfo.processTypeID
					if (manufactureInfo.subProcessTypeInfos?.[i]) {
						manufactureInfo.subProcessTypeInfos[i] = subProcessInfo
					} else {
						manufactureInfo.subProcessTypeInfos =
							manufactureInfo.subProcessTypeInfos || []
						manufactureInfo.subProcessTypeInfos.push(subProcessInfo)
					}
				}
			} else if (hasCoreCostDetails) {
				// Fallback: Use coreCostDetails from materialInfo (test environment)
				manufactureInfo.subProcessTypeInfos =
					manufactureInfo.subProcessTypeInfos || []

				for (let i = 0; i < materialInfo.coreCostDetails.length; i++) {
					const core = materialInfo.coreCostDetails[i]

					// Map coreCostDetails to SubProcessTypeInfoDto structure
					const subProcessInfo: any = {
						weldPosition: core.weldPosition || 1, // Default to Flat
						shoulderWidth: core.coreHeight || 0,
						formLength: core.weldPosition || 1,
						formHeight: core.formHeight || 0, // Travel speed
						hlFactor: core.hlFactor || 0, // Tack welds
						formPerimeter: core.formPerimeter || 0, // Intermediate stops
						blankArea: core.coreLength || 0,
						noOfBends: core.coreLength || 0,
						noOfHoles: core.coreVolume || 1,
						formingForce: core.coreArea || 1,
						lengthOfCut: 0,
						subProcessTypeID: manufactureInfo.processTypeID
					}

					const posId = this.getWeldPositionId(subProcessInfo.weldPosition)
					const efficiency = this._weldingConfig.getWeldingEfficiency(
						posId,
						manufactureInfo.semiAutoOrAuto === 1
					)

					// Get welding data for travel speed if not provided
					if (!subProcessInfo.formHeight) {
						const weldingData = this._weldingConfig.getWeldingData(
							materialType,
							subProcessInfo.shoulderWidth,
							materialInfo?.processId,
							'Manual'
						)

						let travelSpeed =
							manufactureInfo.semiAutoOrAuto === 1
								? this.shareService.isValidNumber(
									((weldingData?.TravelSpeed_mm_per_sec || 0) / 0.8) *
									efficiency || 0
								)
								: this.shareService.isValidNumber(
									(weldingData?.TravelSpeed_mm_per_sec || 0) * efficiency || 0
								)

						subProcessInfo.formHeight = travelSpeed
					}

					// Calculate cycle time components
					// totalWeldLength = Length * Places * SideFactor
					const totalWeldLength = this.shareService.isValidNumber(
						(subProcessInfo.blankArea || 0) *
						(subProcessInfo.noOfHoles || 1) *
						(subProcessInfo.formingForce || 1)
					)

					const cycleTimeForIntermediateStops = subProcessInfo.formPerimeter * 5
					const cycleTimeForTackWeld = subProcessInfo.hlFactor * 3

					// Calculate subprocess cycle time
					subProcessInfo.recommendTonnage = this.shareService.isValidNumber(
						totalWeldLength / (subProcessInfo.formHeight || 12) +
						cycleTimeForIntermediateStops +
						cycleTimeForTackWeld
					)

					totalWeldCycleTime += subProcessInfo.recommendTonnage

					if (manufactureInfo.subProcessTypeInfos[i]) {
						manufactureInfo.subProcessTypeInfos[i] = subProcessInfo
					} else {
						manufactureInfo.subProcessTypeInfos.push(subProcessInfo)
					}
				}
			}

			const maxFormHeight = Math.max(
				0,
				...(manufactureInfo.subProcessTypeInfos || []).map(
					(info: SubProcessInfo) => info.shoulderWidth || 0
				)
			)
			const weldingData = this._weldingConfig.getWeldingData(
				materialType,
				maxFormHeight,
				materialInfo?.processId,
				'Manual'
			)
			if (
				manufactureInfo.isrequiredCurrentDirty &&
				manufactureInfo.requiredCurrent !== null
			) {
				manufactureInfo.requiredCurrent = Number(
					manufactureInfo.requiredCurrent
				)
			} else {
				let requiredCurrent = Number(weldingData?.Current_Amps || 0)
				if (manufactureInfo.requiredCurrent !== null)
					requiredCurrent = this.shareService.checkDirtyProperty(
						'requiredCurrent',
						fieldColorsList
					)
						? manufacturingObj?.requiredCurrent
						: this.shareService.isValidNumber(requiredCurrent)

				manufactureInfo.requiredCurrent = requiredCurrent
			}

			if (
				manufactureInfo.isrequiredWeldingVoltageDirty &&
				manufactureInfo.requiredWeldingVoltage !== null
			) {
				manufactureInfo.requiredWeldingVoltage = Number(
					manufactureInfo.RequiredVoltage
				)
			} else {
				let requiredWeldingVoltage = Number(weldingData?.Voltage_Volts || 0)
				if (manufactureInfo.RequiredVoltage !== null)
					requiredWeldingVoltage = this.shareService.checkDirtyProperty(
						'requiredWeldingVoltage',
						fieldColorsList
					)
						? manufacturingObj?.RequiredVoltage
						: this.shareService.isValidNumber(manufactureInfo.RequiredVoltage)

				manufactureInfo.requiredWeldingVoltage = manufactureInfo.RequiredVoltage
				logger.info(
					`Required Welding Voltage: ${manufactureInfo.RequiredVoltage}`
				)
			}

			manufactureInfo.selectedVoltage =
				manufactureInfo?.machineMaster?.plasmaPower || 0
			logger.info(`selected Voltage: ${manufactureInfo.selectedVoltage}`)

			// loading and unloading time
			const loadingTime =
				this._weldingConfig.getUnloadingTime(materialInfo?.netWeight * 1000) ||
				0
			const unLoadingTime = loadingTime
			logger.info(`Loading Time: ${loadingTime}`)
			if (
				manufactureInfo.isUnloadingTimeDirty &&
				manufactureInfo.unloadingTime !== null
			) {
				manufactureInfo.unloadingTime = Number(manufactureInfo.unloadingTime)
				logger.info(`Unloading Time: ${manufactureInfo.unloadingTime}`)
			} else {
				let loadUnloadTime = Number(loadingTime + unLoadingTime) || 0
				if (manufactureInfo.unloadingTime !== null) {
					loadUnloadTime = this.shareService.checkDirtyProperty(
						'unloadingTime',
						fieldColorsList
					)
						? manufacturingObj?.unloadingTime
						: this.shareService.isValidNumber(loadUnloadTime)
				}
				manufactureInfo.unloadingTime = loadUnloadTime
				logger.info(`Unloading Time: ${manufactureInfo.unloadingTime}`)
			}

			// Part/Assembly Reorientation (no's)
			if (
				manufactureInfo.isnoOfWeldPassesDirty &&
				manufactureInfo.passesLocator !== null
			) {
				manufactureInfo.noOfWeldPasses = Number(manufactureInfo.passesLocator)
				logger.info(
					`No of Weld Passes (Dirty): ${manufactureInfo.noOfWeldPasses}`
				)
			} else {
				let noOfReorientation = 0
				if (manufactureInfo.noOfWeldPasses !== null) {
					noOfReorientation = this.shareService.checkDirtyProperty(
						'noOfWeldPasses',
						fieldColorsList
					)
						? manufacturingObj?.noOfWeldPasses
						: this.shareService.isValidNumber(noOfReorientation)
				}
				manufactureInfo.noOfWeldPasses = noOfReorientation
				logger.info(`No of Weld Passes: ${manufactureInfo.noOfWeldPasses}`)
			}
			const arcOnTime = totalWeldCycleTime + manufactureInfo.unloadingTime
			logger.info(
				`Arc On Time: ${arcOnTime} = totalWeldCycleTime: ${totalWeldCycleTime} + unLoadingTime: ${manufactureInfo.unloadingTime}`
			)
			const arcOffTime = arcOnTime * 0.05
			logger.info(
				`Arc Off Time: ${arcOffTime} = arcOnTime: ${arcOnTime} * 0.05`
			)
			const totWeldCycleTime =
				arcOnTime +
				arcOffTime +
				(manufactureInfo.noOfWeldPasses || 0) * unLoadingTime
			logger.info(
				`Total Weld Cycle Time: ${totWeldCycleTime} = arcOnTime: ${arcOnTime} + arcOffTime: ${arcOffTime} + noOfWeldPasses(${manufactureInfo.noOfWeldPasses}) * loadingTime(${unLoadingTime})`
			)

			// weld Cycle Time
			if (
				manufactureInfo.isDryCycleTimeDirty &&
				!!manufactureInfo.dryCycleTime
			) {
				manufactureInfo.dryCycleTime = Number(manufactureInfo.dryCycleTime)
			} else {
				let weldCycleTime = this.shareService.isValidNumber(totWeldCycleTime)
				if (manufactureInfo.dryCycleTime) {
					weldCycleTime = this.shareService.checkDirtyProperty(
						'dryCycleTime',
						fieldColorsList
					)
						? manufacturingObj?.dryCycleTime
						: this.shareService.isValidNumber(weldCycleTime)
				}
				manufactureInfo.dryCycleTime = weldCycleTime
				logger.info(`Weld Cycle Time: ${weldCycleTime}`)
			}

			// Total Cycle Time
			if (manufactureInfo.iscycleTimeDirty && !!manufactureInfo.cycleTime) {
				manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime)
				logger.info(`Cycle Time: ${manufactureInfo.cycleTime}`)
			} else {
				let cycleTime = this.shareService.isValidNumber(
					totWeldCycleTime / (manufactureInfo.MachineEfficiency / 100)
				)
				logger.info(
					`Cycle Time: ${cycleTime} = totWeldCycleTime: ${totWeldCycleTime} / MachineEfficiency: ${manufactureInfo.MachineEfficiency / 100}`
				)

				if (manufactureInfo.cycleTime) {
					cycleTime = this.shareService.checkDirtyProperty(
						'cycleTime',
						fieldColorsList
					)
						? manufacturingObj?.cycleTime
						: this.shareService.isValidNumber(cycleTime)
				}
				manufactureInfo.cycleTime = cycleTime
				logger.info(`Cycle Time: ${manufactureInfo.cycleTime}`)
			}
		} else {
			if (manufactureInfo.istravelSpeedDirty && !!manufactureInfo.travelSpeed) {
				manufactureInfo.travelSpeed = Number(manufactureInfo.travelSpeed)
			} else {
				let travelSpeed = Number(weldingValues?.TravelSpeed) || 0
				if (manufactureInfo.travelSpeed) {
					travelSpeed = this.shareService.checkDirtyProperty(
						'travelSpeed',
						fieldColorsList
					)
						? manufacturingObj?.travelSpeed
						: this.shareService.isValidNumber(travelSpeed)
				}
				manufactureInfo.travelSpeed = travelSpeed
			}

			if (
				manufactureInfo.isrequiredCurrentDirty &&
				manufactureInfo.requiredCurrent !== null
			) {
				manufactureInfo.requiredCurrent = Number(
					manufactureInfo.requiredCurrent
				)
			} else {
				let requiredCurrent = Number(weldingValues?.Current) || 0
				if (manufactureInfo.requiredCurrent !== null)
					requiredCurrent = this.shareService.checkDirtyProperty(
						'requiredCurrent',
						fieldColorsList
					)
						? manufacturingObj?.requiredCurrent
						: this.shareService.isValidNumber(requiredCurrent)

				manufactureInfo.requiredCurrent = requiredCurrent
			}

			if (
				manufactureInfo.isrequiredWeldingVoltageDirty &&
				manufactureInfo.requiredWeldingVoltage != null
			) {
				manufactureInfo.requiredWeldingVoltage = Number(
					manufactureInfo.requiredWeldingVoltage
				)
			} else {
				let requiredWeldingVoltage = Number(weldingValues?.Voltage)
				if (manufactureInfo.requiredWeldingVoltage != null)
					requiredWeldingVoltage = this.shareService.checkDirtyProperty(
						'requiredWeldingVoltage',
						fieldColorsList
					)
						? manufacturingObj?.requiredWeldingVoltage
						: this.shareService.isValidNumber(requiredWeldingVoltage)

				manufactureInfo.requiredWeldingVoltage = requiredWeldingVoltage
			}

			if (
				manufactureInfo.isnoOfIntermediateStartAndStopDirty &&
				!!manufactureInfo.noOfIntermediateStartAndStop
			) {
				manufactureInfo.noOfIntermediateStartAndStop = Number(
					manufactureInfo.noOfIntermediateStartAndStop
				)
			} else {
				let noOfIntermediateStartAndStop =
					Number(manufactureInfo.processTypeID) === ProcessType.StickWelding
						? 1
						: 4
				if (manufactureInfo.noOfIntermediateStartAndStop) {
					noOfIntermediateStartAndStop = this.shareService.checkDirtyProperty(
						'noOfIntermediateStartAndStop',
						fieldColorsList
					)
						? manufacturingObj?.noOfIntermediateStartAndStop
						: this.shareService.isValidNumber(noOfIntermediateStartAndStop)
				}
				manufactureInfo.noOfIntermediateStartAndStop = Math.round(
					noOfIntermediateStartAndStop
				)
			}

			// let cycleTimeIntermediateStartAndStop = this.CycleTimeIntermediateStartAndStop(Number(manufactureInfo.noOfIntermediateStartAndStop));
			const cycleTimeIntermediateStartAndStop =
				manufactureInfo.noOfIntermediateStartAndStop *
				(Number(manufactureInfo.processTypeID) === ProcessType.StickWelding
					? 3
					: 5)

			if (
				manufactureInfo.isnoOfTackWeldDirty &&
				!!manufactureInfo.noOfTackWeld
			) {
				manufactureInfo.noOfTackWeld = Number(manufactureInfo.noOfTackWeld)
			} else {
				if (manufactureInfo.noOfTackWeld) {
					noOfTackWeld = this.shareService.checkDirtyProperty(
						'noOfTackWeld',
						fieldColorsList
					)
						? manufacturingObj?.noOfTackWeld
						: this.shareService.isValidNumber(noOfTackWeld)
				}
				manufactureInfo.noOfTackWeld = Math.round(noOfTackWeld)
			}

			const cycleTimeTrackWeld = manufactureInfo.noOfTackWeld * 3

			if (
				manufactureInfo.isnoOfWeldPassesDirty &&
				!!manufactureInfo.noOfWeldPasses
			) {
				manufactureInfo.noOfWeldPasses = Number(manufactureInfo.noOfWeldPasses)
			} else {
				const wLength = materialInfo?.weldLegLength || 0
				let noOfWeldPasses =
					this._costingConfig.weldPass(wLength, this.weldingMode) || 1

				if (manufactureInfo.noOfWeldPasses) {
					noOfWeldPasses = this.shareService.checkDirtyProperty(
						'noOfWeldPasses',
						fieldColorsList
					)
						? manufacturingObj?.noOfWeldPasses || 1
						: this.shareService.isValidNumber(noOfWeldPasses)
				}
				manufactureInfo.noOfWeldPasses = noOfWeldPasses
			}

			if (Number(manufactureInfo.processTypeID) === ProcessType.StickWelding) {
				const weldingPartHandlingValues = this._costingConfig
					.weldingValuesForPartHandling('stickWelding')
					.find(
						(x: any) => x.toPartWeight >= Number(manufactureInfo.netPartWeight) / 1000
					)

				if (
					manufactureInfo.isUnloadingTimeDirty &&
					!!manufactureInfo.unloadingTime
				) {
					// part handling time
					manufactureInfo.unloadingTime = Number(manufactureInfo.unloadingTime)
				} else {
					let unloadingTime =
						this._costingConfig.weldingValuesForPartHandling('stickWelding')
					if (manufactureInfo.unloadingTime) {
						unloadingTime = this.shareService.checkDirtyProperty(
							'unloadingTime',
							fieldColorsList
						)
							? manufacturingObj?.unloadingTime
							: unloadingTime
					}
					manufactureInfo.unloadingTime = unloadingTime
				}
			}

			// const wireDia = Number(materialInfo?.wireDiameter) || 0;

			const weldingCycleTime = this.shareService.isValidNumber(
				(len / Number(manufactureInfo.travelSpeed)) *
				Number(manufactureInfo.noOfWeldPasses)
			)
			const totalWeldCycleTime =
				Number(weldingCycleTime) +
				Number(cycleTimeTrackWeld) +
				Number(cycleTimeIntermediateStartAndStop) +
				(Number(manufactureInfo.unloadingTime) || 0)
			logger.info(
				`Total Weld weldingCycleTime ${weldingCycleTime} cycleTimeTrackWeld ${cycleTimeTrackWeld} cycleTimeIntermediateStartAndStop ${cycleTimeIntermediateStartAndStop} unloadingTime ${manufactureInfo.unloadingTime}`
			)
			const arcOnTime = this.shareService.isValidNumber(
				totalWeldCycleTime * 1.05
			)
			logger.info(`Total Weld arcOnTime ${arcOnTime}`)
			const arcOfTime = this.shareService.isValidNumber(arcOnTime * 0.05)
			logger.info(`Total Weld arcOfTime ${arcOfTime}`)
			let cycleTime = this.shareService.isValidNumber(arcOnTime + arcOfTime)
			logger.info(`Total Weld cycleTime ${cycleTime}`)

			if (
				manufactureInfo.isDryCycleTimeDirty &&
				!!manufactureInfo.dryCycleTime
			) {
				// Welding cycle time
				manufactureInfo.dryCycleTime = Number(manufactureInfo.dryCycleTime)
			} else {
				let dryCycleTime = weldingCycleTime
				if (manufactureInfo.dryCycleTime) {
					dryCycleTime = this.shareService.checkDirtyProperty(
						'dryCycleTime',
						fieldColorsList
					)
						? manufacturingObj?.dryCycleTime
						: dryCycleTime
				}
				manufactureInfo.dryCycleTime = dryCycleTime
			}

			if (Number(manufactureInfo.processTypeID) === ProcessType.StickWelding) {
				cycleTime = totalWeldCycleTime
			}

			if (manufactureInfo.iscycleTimeDirty && !!manufactureInfo.cycleTime) {
				manufactureInfo.cycleTime = this.shareService.isValidNumber(
					Number(manufactureInfo.cycleTime)
				)
			} else {
				if (manufactureInfo.cycleTime) {
					cycleTime = this.shareService.checkDirtyProperty(
						'cycleTime',
						fieldColorsList
					)
						? manufacturingObj?.cycleTime
						: cycleTime
				}
				manufactureInfo.cycleTime = cycleTime
			}
			manufactureInfo.totalCycleTime = manufactureInfo.cycleTime
		}

		this.weldingCommonCalc(
			manufactureInfo,
			fieldColorsList,
			manufacturingObj,
			laborRateDto
		) // Common Welding Calc

		return manufactureInfo
	}

	public calculationForWeldingMaterial(
		materialInfo: any,
		fieldColorsList: any = [],
		selectedMaterialInfo: any = null,
		manufactureInfo: any = null
	): any {
		let netWeight = 0
		if (materialInfo.isNetweightDirty && !!materialInfo.netWeight) {
			netWeight = Number(materialInfo.netWeight)
		} else {
			netWeight = this.shareService.isValidNumber(
				(Number(materialInfo.partVolume) * Number(materialInfo.density)) / 1000
			)
			if (materialInfo?.netWeight) {
				netWeight =
					this.shareService.checkDirtyProperty('netWeight', fieldColorsList) &&
						selectedMaterialInfo
						? selectedMaterialInfo?.netWeight
						: netWeight
			}
		}
		materialInfo.netWeight = netWeight

		const angleInDegrees: number = 45
		if (Number(materialInfo.processId) === ProcessType.StickWelding) {
			materialInfo.weldLegLength =
				Number(materialInfo.dimX) > Number(materialInfo.dimY)
					? materialInfo.dimX
					: materialInfo.dimY
		} else {
			materialInfo.weldLegLength =
				Math.sqrt(2) * (materialInfo.dimY / Math.cos(angleInDegrees))
		}

		if (materialInfo.iswireDiameterDirty && !!materialInfo.wireDiameter) {
			materialInfo.wireDiameter = Number(materialInfo.wireDiameter)
		} else {
			let wireDiameter = 0
			if (Number(materialInfo.processId) === ProcessType.StickWelding) {
				wireDiameter =
					this._costingConfig
						.weldingValuesForStickWelding()
						.find((x: any) => x.ToPartThickness >= Number(materialInfo.partTickness))
						?.WireDiameter || 0
			} else if (Number(materialInfo.processId) === ProcessType.TigWelding) {
				wireDiameter =
					this._costingConfig
						.tigWeldingValuesForMachineType()
						.find(
							(x: any) =>
								x.id == 3 &&
								x.ToPartThickness >= Number(materialInfo.partTickness)
						)?.WireDiameter || 0 // 3 is manual
			} else {
				wireDiameter =
					this._costingConfig
						.weldingValuesForMachineType()
						.find(
							(x: any) =>
								x.id == 3 &&
								x.ToPartThickness >= Number(materialInfo.partTickness)
						)?.WireDiameter || 0
			}

			if (materialInfo.wireDiameter && selectedMaterialInfo) {
				wireDiameter = this.shareService.checkDirtyProperty(
					'wireDiameter',
					fieldColorsList
				)
					? selectedMaterialInfo?.wireDiameter
					: wireDiameter
			}
			materialInfo.wireDiameter = wireDiameter
		}

		if (
			materialInfo.isPartProjectedAreaDirty &&
			materialInfo.partProjectedArea != null
		) {
			materialInfo.partProjectedArea = Number(materialInfo.partProjectedArea)
		} else {
			let projectedArea = 0
			if (materialInfo.typeOfWeld == 1 || materialInfo.typeOfWeld == 2) {
				projectedArea =
					(Number(materialInfo.dimY) * Number(materialInfo.dimZ)) / 2
			} else if (materialInfo.typeOfWeld == 3) {
				projectedArea =
					Number(materialInfo.dimY) * Number(materialInfo.dimZ) +
					Number(materialInfo.partTickness * 1)
			} else if (materialInfo.typeOfWeld == 4) {
				projectedArea =
					(Number(materialInfo.dimY) * Number(materialInfo.dimZ) +
						Number(materialInfo.partTickness * 1)) /
					2
			}

			if (materialInfo.partProjectedArea != null && selectedMaterialInfo) {
				projectedArea = this.shareService.checkDirtyProperty(
					'partProjectArea',
					fieldColorsList
				)
					? selectedMaterialInfo?.partProjectedArea
					: projectedArea
			}
			materialInfo.partProjectedArea = projectedArea
		}

		if (materialInfo.isPartVolumeDirty && !!materialInfo.partVolume) {
			materialInfo.partVolume = Number(materialInfo.partVolume)
		} else {
			let partVolume = materialInfo.dimX * materialInfo.partProjectedArea
			if (materialInfo.partVolume && selectedMaterialInfo) {
				partVolume = this.shareService.checkDirtyProperty(
					'partVolume',
					fieldColorsList
				)
					? selectedMaterialInfo?.partVolume
					: partVolume
			}
			materialInfo.partVolume = partVolume
		}

		let effeciency =
			this._weldingConfig.getWeldingEfficiency(
				1,
				manufactureInfo?.semiAutoOrAuto === 1
			) * 100 || 75
		if (materialInfo.isEffeciencyDirty && !!materialInfo.effeciency) {
			effeciency = materialInfo.effeciency
		} else {
			if (selectedMaterialInfo) {
				effeciency = this.shareService.checkDirtyProperty(
					'effeciency',
					fieldColorsList
				)
					? selectedMaterialInfo?.effeciency
					: effeciency
			}
		}
		materialInfo.effeciency = effeciency

		let grossWeight = 0
		if (materialInfo.isGrossWeightDirty && materialInfo.grossWeight != null) {
			grossWeight = Number(materialInfo.grossWeight)
		} else {
			grossWeight = this.shareService.isValidNumber(
				(Number(materialInfo.partVolume) * Number(materialInfo?.density)) / 1000
			)
			if (materialInfo?.grossWeight != null && selectedMaterialInfo) {
				grossWeight = this.shareService.checkDirtyProperty(
					'grossWeight',
					fieldColorsList
				)
					? selectedMaterialInfo?.grossWeight
					: grossWeight
			}
		}
		materialInfo.grossWeight = grossWeight

		let weldWeightWastage = 0
		if (
			materialInfo.isWeldWeightWastageDirty &&
			!!materialInfo.weldWeightWastage
		) {
			weldWeightWastage = Number(materialInfo.weldWeightWastage)
		} else {
			weldWeightWastage = this.shareService.isValidNumber(
				(materialInfo.grossWeight * 100) / effeciency
			)
			if (materialInfo?.weldWeightWastage && selectedMaterialInfo) {
				weldWeightWastage = this.shareService.checkDirtyProperty(
					'weldWeightWastage',
					fieldColorsList
				)
					? selectedMaterialInfo?.weldWeightWastage
					: weldWeightWastage
			}
		}
		materialInfo.weldWeightWastage = weldWeightWastage
		materialInfo.netMatCost =
			this.shareService.isValidNumber(weldWeightWastage / 1000) *
			Number(materialInfo.materialPricePerKg)

		if (materialInfo.volumeDiscountPer > 0) {
			materialInfo.netMatCost =
				materialInfo.netMatCost * (1 - materialInfo.volumeDiscountPer / 100)
		}
		return materialInfo
	}

	public getTotalWeldLength(
		weldLength: number,
		weldPlaces: number,
		weldSide: string | number,
		noOfPasses: number = 1
	): number {
		let sideMultiplier = 1
		if (typeof weldSide === 'string') {
			sideMultiplier = weldSide.toLowerCase() === 'both' ? 2 : 1
		} else if (typeof weldSide === 'number') {
			sideMultiplier = weldSide === 2 ? 2 : 1
		}
		return weldLength * weldPlaces * noOfPasses * sideMultiplier
	}

	getTotalWeldMaterialWeight(partVolume: number, density: number): number {
		return this.shareService.isValidNumber((partVolume * density) / 1000)
	}
	private checkFormArrayDirtyField(
		fieldName: string,
		index: number,
		fieldColorsList: any
	): boolean {
		if (!fieldColorsList || fieldColorsList.length === 0) return false
		// Looking for { formControlName: 'formHeight', isDirty: true, subProcessIndex: 0 }
		return fieldColorsList.some(
			(x: any) =>
				x.formControlName === fieldName &&
				x.subProcessIndex === index &&
				x.isDirty
		)
	}

	public getEfficiency(efficiency: number): number {
		return efficiency || 75
	}
	public getWeldBeadWeightWithWastage(
		grossWeight: number,
		wastagePercentage: number
	): number {
		const multiplier = 1 + wastagePercentage / 100
		return this.shareService.isValidNumber(grossWeight * multiplier)
	}

	private processSubProcessCycleTime(
		subProcessInfo: SubProcessTypeInfoDto,
		i: number,
		materialType: any,
		materialInfo: any,
		manufactureInfo: any,
		fieldColorsList: any,
		manufacturingObj: any,
		subProcessCycleTimes: number[]
	): number {
		const posId = this.getWeldPositionId(subProcessInfo.weldPosition)
		const efficiency = this._weldingConfig.getWeldingEfficiency(
			posId,
			manufactureInfo.semiAutoOrAuto === 1
		)

		// Travel Speed
		const weldingData = this._weldingConfig.getWeldingData(
			materialType,
			subProcessInfo.shoulderWidth,
			materialInfo?.processId,
			'Manual'
		)

		if (this.checkFormArrayDirtyField('formHeight', i, fieldColorsList)) {
			subProcessInfo.formHeight = Number(subProcessInfo.formHeight)
		} else {
			let travelSpeed =
				manufactureInfo.semiAutoOrAuto === 1
					? this.shareService.isValidNumber(
						((weldingData?.TravelSpeed_mm_per_sec || 0) / 0.8) * efficiency ||
						0
					)
					: this.shareService.isValidNumber(
						(weldingData?.TravelSpeed_mm_per_sec || 0) * efficiency || 0
					)

			if (subProcessInfo.formHeight) {
				travelSpeed = this.checkFormArrayDirtyField(
					'formHeight',
					i,
					fieldColorsList
				)
					? manufacturingObj?.subProcessTypeInfos?.[i]?.formHeight
					: this.shareService.isValidNumber(travelSpeed)
			}
			subProcessInfo.formHeight = travelSpeed
		}

		const lengthOfCut = getWeldTypeId(subProcessInfo.lengthOfCut || '')

		// Cycle time No. of Intermediate Start/Stops (nos)
		if (!subProcessInfo.formPerimeter) {
			subProcessInfo.formPerimeter =
				subProcessInfo.formingForce === 1
					? subProcessInfo.noOfHoles
					: subProcessInfo.noOfHoles * subProcessInfo.formingForce
		}
		const cycleTimeForIntermediateStops =
			(subProcessInfo.formPerimeter || 0) * 5

		// totalWeldLength = Length * Places * SideFactor
		const totalWeldLength = this.shareService.isValidNumber(
			(subProcessInfo.blankArea || 0) *
			(subProcessInfo.noOfHoles || 1) *
			(subProcessInfo.formingForce || 1)
		)

		// HL Factor
		if (!subProcessInfo.hlFactor) {
			if ((subProcessInfo.noOfBends || 0) > 100) {
				subProcessInfo.hlFactor = this.shareService.isValidNumber(
					Math.round((subProcessInfo.noOfBends || 0) / 100) *
					(subProcessInfo.noOfHoles || 0)
				)
			} else {
				subProcessInfo.hlFactor = subProcessInfo.noOfHoles
			}
		}

		// (Cycle time for tack weld)
		const cycleTimeForTackWeld = (subProcessInfo.hlFactor || 0) * 3

		// weld cycle time
		subProcessInfo.recommendTonnage = this.shareService.isValidNumber(
			totalWeldLength / (subProcessInfo.formHeight || 12) +
			cycleTimeForIntermediateStops +
			cycleTimeForTackWeld
		)

		if (lengthOfCut === 4) {
			subProcessInfo.recommendTonnage *= 0.95
		} else if (lengthOfCut === 5) {
			subProcessInfo.recommendTonnage *= 1.5
		}

		subProcessCycleTimes.push(subProcessInfo.recommendTonnage)
		if (manufactureInfo.subProcessTypeInfos?.[i]) {
			manufactureInfo.subProcessTypeInfos[i] = subProcessInfo
		} else {
			manufactureInfo.subProcessTypeInfos =
				manufactureInfo.subProcessTypeInfos || []
			manufactureInfo.subProcessTypeInfos.push(subProcessInfo)
		}
		return subProcessInfo.recommendTonnage
	}

	public weldingCommonCalc(
		manufactureInfo: ProcessInfoDto,
		fieldColorsList: any,
		manufacturingObj: ProcessInfoDto,
		laborRateDto: LaborRateMasterDto[]
	) {
		const curCycleTime =
			this.weldingMode === 'spotWelding'
				? Number(manufactureInfo.dryCycleTime)
				: Number(manufactureInfo.cycleTime)
		manufactureInfo.totalPowerCost = 0

		if (this.weldingMode !== 'seamWelding') {
			if (
				manufactureInfo.iselectricityUnitCostDirty &&
				!!manufactureInfo.electricityUnitCost
			) {
				manufactureInfo.electricityUnitCost = this.shareService.isValidNumber(
					Number(manufactureInfo.electricityUnitCost)
				)
			} else {
				let electricityUnitCost =
					Number(manufactureInfo.electricityUnitCost) || 0
				if (manufactureInfo.countryList && manufactureInfo.mfrCountryId) {
					const country = manufactureInfo.countryList.find(
						(x: any) => x.countryId == manufactureInfo.mfrCountryId
					)
					if (country) {
						electricityUnitCost = Number(
							laborRateDto?.length > 0 ? laborRateDto[0].powerCost : 0
						)
					}
				}
				if (manufactureInfo.electricityUnitCost) {
					electricityUnitCost = this.shareService.checkDirtyProperty(
						'electricityUnitCost',
						fieldColorsList
					)
						? manufacturingObj?.electricityUnitCost
						: electricityUnitCost
				}
				manufactureInfo.electricityUnitCost =
					this.shareService.isValidNumber(electricityUnitCost)
			}

			const calculatedPowerConsumption =
				(Number(manufactureInfo.requiredCurrent) *
					Number(manufactureInfo.requiredWeldingVoltage)) /
				1000

			manufactureInfo.powerConsumption = this.resolveField<number>(
				'powerConsumption',
				manufactureInfo.powerConsumption,
				manufactureInfo.ispowerConsumptionDirty,
				calculatedPowerConsumption,
				fieldColorsList,
				manufacturingObj
			)

			manufactureInfo.totalPowerCost = this.shareService.isValidNumber(
				(curCycleTime / 3600) *
				Number(manufactureInfo.powerConsumptionKW) *
				Number(manufactureInfo.electricityUnitCost)
			)
			manufactureInfo.totalGasCost = 0
			logger.info(
				`Total Power Cost: curCycleTime: ${curCycleTime} powerConsumption: ${manufactureInfo.powerConsumptionKW} electricityUnitCost: ${manufactureInfo.electricityUnitCost}= totalPowerCost: ${manufactureInfo.totalPowerCost}`
			)
		}

		if (manufactureInfo.isyieldPercentDirty && !!manufactureInfo.yieldPer) {
			manufactureInfo.yieldPer = this.shareService.isValidNumber(
				Number(manufactureInfo.yieldPer)
			)
			logger.info(`Yield Percentage: ${manufactureInfo.yieldPer}`)
		} else {
			let yieldPer = this._weldingConfig.defaultPercentages(
				Number(manufactureInfo.processTypeID),
				manufactureInfo.partComplexity,
				'yieldPercentage'
			)
			logger.info(`Yield Percentage: ${yieldPer}`)
			if (manufactureInfo.yieldPer) {
				yieldPer = this.shareService.checkDirtyProperty(
					'yieldPer',
					fieldColorsList
				)
					? manufacturingObj?.yieldPer
					: this.shareService.isValidNumber(yieldPer)
			}
			manufactureInfo.yieldPer = yieldPer
		}

		if (manufactureInfo.isSamplingRateDirty && !!manufactureInfo.samplingRate) {
			manufactureInfo.samplingRate = this.shareService.isValidNumber(
				Number(manufactureInfo.samplingRate)
			)
		} else {
			let samplingRate = this._weldingConfig.defaultPercentages(
				Number(manufactureInfo.processTypeID),
				manufactureInfo.partComplexity,
				'samplingRate'
			)
			logger.info(`Sampling Rate: ${samplingRate}`)
			if (manufactureInfo.samplingRate) {
				samplingRate = this.shareService.checkDirtyProperty(
					'samplingRate',
					fieldColorsList
				)
					? manufacturingObj?.samplingRate
					: this.shareService.isValidNumber(samplingRate)
			}
			manufactureInfo.samplingRate = samplingRate
		}

		// # of Direct Labour
		if (
			manufactureInfo.isNoOfLowSkilledLaboursDirty &&
			manufactureInfo.noOfLowSkilledLabours !== null
		) {
			manufactureInfo.noOfLowSkilledLabours = Number(
				manufactureInfo.noOfLowSkilledLabours
			)
			logger.info(
				`No Of Low Skilled Labours: ${manufactureInfo.noOfLowSkilledLabours}`
			)
		} else {
			let noOfLowSkilledLabours =
				manufactureInfo?.machineMaster?.machineMarketDtos?.[0]
					?.specialSkilledLabours || 1
			if (manufactureInfo.noOfLowSkilledLabours !== null) {
				noOfLowSkilledLabours = this.shareService.checkDirtyProperty(
					'noOfLowSkilledLabours',
					fieldColorsList
				)
					? manufacturingObj?.noOfLowSkilledLabours
					: noOfLowSkilledLabours
			}
			manufactureInfo.noOfLowSkilledLabours = noOfLowSkilledLabours
			logger.info(
				`No Of Low Skilled Labours: ${manufactureInfo.noOfLowSkilledLabours}`
			)
		}

		if (
			manufactureInfo.isinspectionTimeDirty &&
			manufactureInfo.inspectionTime !== null
		) {
			manufactureInfo.inspectionTime = Number(manufactureInfo.inspectionTime)
		} else {
			let inspectionTime =
				manufactureInfo.partComplexity == PartComplexity.Low
					? 2
					: manufactureInfo.partComplexity == PartComplexity.Medium
						? 5
						: manufactureInfo.partComplexity == PartComplexity.High
							? 10
							: 0
			if (manufactureInfo.inspectionTime !== null) {
				inspectionTime = this.shareService.checkDirtyProperty(
					'inspectionTime',
					fieldColorsList
				)
					? manufacturingObj?.inspectionTime
					: inspectionTime
			}
			manufactureInfo.inspectionTime = inspectionTime
		}

		if (
			manufactureInfo.isdirectMachineCostDirty &&
			manufactureInfo.directMachineCost !== null
		) {
			manufactureInfo.directMachineCost = Number(
				manufactureInfo.directMachineCost
			)
		} else {
			let directMachineCost = this.shareService.isValidNumber(
				(Number(manufactureInfo.machineHourRate) / 3600) * curCycleTime
			)
			logger.info(
				`Direct Machine Cost: machineHourRate: ${manufactureInfo.machineHourRate} curCycleTime ${curCycleTime}`
			)
			if (manufactureInfo.directMachineCost !== null) {
				directMachineCost = this.shareService.checkDirtyProperty(
					'directMachineCost',
					fieldColorsList
				)
					? manufacturingObj?.directMachineCost
					: directMachineCost
			}
			manufactureInfo.directMachineCost = directMachineCost
			logger.info(`Direct Machine Cost: ${directMachineCost}`)
		}

		if (
			manufactureInfo.isdirectSetUpCostDirty &&
			manufactureInfo.directSetUpCost !== null
		) {
			manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost)
		} else {
			let directSetUpCost = this.shareService.isValidNumber(
				((Number(manufactureInfo.skilledLaborRatePerHour) +
					Number(manufactureInfo.machineHourRate)) *
					(Number(manufactureInfo.setUpTime) / 60)) /
				manufactureInfo.lotSize
			)
			logger.info(
				`Direct Set Up Cost: skilledLaborRatePerHour: ${manufactureInfo.skilledLaborRatePerHour} machineHourRate: ${manufactureInfo.machineHourRate} setUpTime: ${manufactureInfo.setUpTime} lotSize: ${manufactureInfo.lotSize}`
			)
			if (manufactureInfo.directSetUpCost !== null) {
				directSetUpCost = this.shareService.checkDirtyProperty(
					'directSetUpCost',
					fieldColorsList
				)
					? manufacturingObj?.directSetUpCost
					: directSetUpCost
			}
			manufactureInfo.directSetUpCost = directSetUpCost
			logger.info(`Direct Set Up Cost: ${directSetUpCost}`)
		}

		if (
			manufactureInfo.isdirectLaborCostDirty &&
			manufactureInfo.directLaborCost !== null
		) {
			manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost)
		} else {
			let directLaborCost = this.shareService.isValidNumber(
				(Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) *
				(curCycleTime * Number(manufactureInfo.noOfLowSkilledLabours))
			)
			logger.info(
				`Direct Labor Cost: lowSkilledLaborRatePerHour: ${manufactureInfo.lowSkilledLaborRatePerHour} curCycleTime: ${curCycleTime} noOfLowSkilledLabours: ${manufactureInfo.noOfLowSkilledLabours}`
			)
			if (manufactureInfo.directLaborCost !== null) {
				directLaborCost = this.shareService.checkDirtyProperty(
					'directLaborCost',
					fieldColorsList
				)
					? manufacturingObj?.directLaborCost
					: directLaborCost
			}
			manufactureInfo.directLaborCost = directLaborCost
			logger.info(`Direct Labor Cost: ${directLaborCost}`)
		}

		const calculatedInspectionCost =
			this.weldingMode === 'seamWelding'
				? this.shareService.isValidNumber(
					(Number(manufactureInfo.inspectionTime) *
						Number(manufactureInfo.qaOfInspectorRate)) /
					(Number(manufactureInfo.lotSize) *
						(Number(manufactureInfo.samplingRate) / 100))
				)
				: this.shareService.isValidNumber(
					(((manufactureInfo?.qaOfInspectorRate ?? 0) / 60) *
						Math.ceil(
							((manufactureInfo?.samplingRate ?? 0) / 100) *
							(manufactureInfo?.lotSize ?? 0)
						) *
						(manufactureInfo?.inspectionTime ?? 0)) /
					(manufactureInfo?.lotSize ?? 1)
				)
		logger.info(
			`Inspection Cost: qaOfInspectorRate: ${manufactureInfo.qaOfInspectorRate / 60} ` +
			`samplingRate: ${manufactureInfo.samplingRate / 100} lotSize: ${manufactureInfo.lotSize} ` +
			`inspectionTime: ${manufactureInfo.inspectionTime} -> Calculated: ${calculatedInspectionCost}`
		)

		manufactureInfo.inspectionCost = this.resolveField<number>(
			'inspectionCost',
			manufactureInfo.inspectionCost,
			manufactureInfo.isinspectionCostDirty,
			calculatedInspectionCost,
			fieldColorsList,
			manufacturingObj
		)

		const sum = this.shareService.isValidNumber(
			Number(manufactureInfo.directMachineCost) +
			Number(manufactureInfo.directSetUpCost) +
			Number(manufactureInfo.directLaborCost) +
			Number(manufactureInfo.inspectionCost) +
			Number(manufactureInfo.totalPowerCost)
		)
		logger.info(
			`Sum: directMachineCost: ${manufactureInfo.directMachineCost} directSetUpCost: ${manufactureInfo.directSetUpCost} directLaborCost: ${manufactureInfo.directLaborCost} inspectionCost: ${manufactureInfo.inspectionCost} totalPowerCost: ${manufactureInfo.totalPowerCost}`
		)

		if (
			manufactureInfo.isyieldCostDirty &&
			manufactureInfo.yieldCost !== null
		) {
			manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost)
		} else {
			let yieldCost =
				this.weldingMode === 'seamWelding'
					? this.shareService.isValidNumber(
						(1 - Number(manufactureInfo.yieldPer) / 100) * sum
					)
					: this.shareService.isValidNumber(
						(1 - Number(manufactureInfo.yieldPer) / 100) *
						(Number(manufactureInfo.netMaterialCost) + sum)
					)
			logger.info(
				`Yield Cost: yieldPer: ${manufactureInfo.yieldPer / 100} sum: ${sum} netMaterialCost: ${manufactureInfo.netMaterialCost}`
			)
			if (manufactureInfo.yieldCost !== null) {
				yieldCost = this.shareService.checkDirtyProperty(
					'yieldCost',
					fieldColorsList
				)
					? manufacturingObj?.yieldCost
					: yieldCost
			}
			manufactureInfo.yieldCost = yieldCost
		}

		manufactureInfo.directProcessCost = this.shareService.isValidNumber(
			sum + Number(manufactureInfo.yieldCost)
		)
		logger.info(
			`Direct Process Cost: sum: ${sum} yieldCost: ${manufactureInfo.yieldCost}`
		)
	}

	public calculationsForWeldingPreparation(
		manufactureInfo: ProcessInfoDto,
		fieldColorsList: any,
		manufacturingObj: ProcessInfoDto
	): ProcessInfoDto {
		// ================= ESG Impact Calculation =================
		manufactureInfo.esgImpactElectricityConsumption =
			this.shareService.isValidNumber(
				Number(manufactureInfo?.machineMaster?.totalPowerKW || 0) *
				Number(manufactureInfo?.machineMaster?.powerUtilization || 0) *
				Number(manufactureInfo?.laborRates?.[0]?.powerESG || 0)
			)
		logger.info(
			`ESG Impact Electricity Consumption: machineMaster: ${manufactureInfo?.machineMaster?.totalPowerKW} powerUtilization: ${manufactureInfo?.machineMaster?.powerUtilization} powerESG: ${manufactureInfo?.laborRates?.[0]?.powerESG}`
		)

		const weldingLength =
			manufactureInfo.materialInfoList?.length > 0
				? manufactureInfo.materialInfoList[0]?.dimX
				: 0
		logger.info(`Welding Length: ${weldingLength}`)
		const weldingWidth =
			manufactureInfo.materialInfoList?.length > 0
				? manufactureInfo.materialInfoList[0]?.dimY
				: 0
		logger.info(`Welding Width: ${weldingWidth}`)

		const weldingHeight =
			manufactureInfo.materialInfoList?.length > 0
				? manufactureInfo.materialInfoList[0]?.dimZ
				: 0
		logger.info(`Welding Height: ${weldingHeight}`)
		const crossSectionArea =
			2 * weldingLength * Math.max(weldingWidth, weldingHeight)
		logger.info(`Cross Section Area: ${crossSectionArea}`)
		const netWeight =
			manufactureInfo.materialInfoList?.length > 0
				? (manufactureInfo.materialInfoList[0]?.netWeight || 0) / 1000
				: 0
		logger.info(`Net Weight: ${netWeight}`)
		manufactureInfo.netMaterialCost =
			manufactureInfo.materialInfoList?.length > 0
				? manufactureInfo.materialInfoList[0]?.netMatCost
				: 0
		logger.info(`Net Material Cost: ${manufactureInfo.netMaterialCost}`)

		const materialType = this._smConfig.mapMaterial(
			manufactureInfo.materialmasterDatas?.materialType?.materialTypeName
		)

		let lookupListDia = this._weldingConfig
			.getDiscBrushDia()
			?.filter(
				(x: any) =>
					x.materialType === materialType && x.partArea >= crossSectionArea
			)?.[0]

		if (crossSectionArea > 100001) {
			lookupListDia = this._weldingConfig
				.getDiscBrushDia()
				?.filter((x: any) => x.materialType === materialType)
				?.reverse()?.[0]
		}

		let discBrushDia = 0
		let deburringRPM = 0

		if (lookupListDia) {
			discBrushDia = lookupListDia.discBrush
			deburringRPM =
				Number(manufactureInfo?.processTypeID) ===
					ProcessType.WeldingPreparation
					? lookupListDia.prepRPM
					: lookupListDia.cleaningRPM
		}

		const feedPerREvRough = this.shareService.isValidNumber(discBrushDia / 2)
		const feedPerREvFinal = this.shareService.isValidNumber(discBrushDia / 4)

		const noOfPasses = Math.max(
			1,
			this.shareService.isValidNumber(
				Math.ceil(weldingWidth / (discBrushDia || 1))
			)
		)

		const handlingTime =
			netWeight < 5
				? 10
				: netWeight < 10
					? 16
					: netWeight < 20
						? 24
						: netWeight >= 20
							? 32
							: 0

		let cycleTime = this.shareService.isValidNumber(
			handlingTime +
			(2 * (weldingLength + 5) * noOfPasses * 60) /
			(feedPerREvRough || 1) /
			(deburringRPM || 1)
		)

		if (
			Number(manufactureInfo?.processTypeID) === ProcessType.WeldingCleaning
		) {
			cycleTime += this.shareService.isValidNumber(
				(2 * (weldingLength + 5) * noOfPasses * 60) /
				(feedPerREvFinal || 1) /
				(deburringRPM || 1)
			)
		}

		manufactureInfo.cycleTime = this.resolveField<number>(
			'cycleTime',
			manufactureInfo.cycleTime,
			manufactureInfo.iscycleTimeDirty,
			cycleTime,
			fieldColorsList,
			manufacturingObj
		)

		// costs divide by integer efficiency as per service lines 735, 746-750, 762, 776
		const efficiency = Number(manufactureInfo.efficiency || 100)

		if (
			manufactureInfo.isdirectMachineCostDirty &&
			manufactureInfo.directMachineCost != null
		) {
			manufactureInfo.directMachineCost = Number(
				manufactureInfo.directMachineCost
			)
		} else {
			let directMachineCost = this.shareService.isValidNumber(
				(Number(manufactureInfo.machineHourRate) *
					Number(manufactureInfo.cycleTime)) /
				3600 /
				efficiency
			)
			logger.info(
				`   Direct Machine Cost: ${this.shareService.isValidNumber(
					(Number(manufactureInfo.machineHourRate) *
						Number(manufactureInfo.cycleTime)) /
					3600 /
					efficiency
				)}`
			)
			manufactureInfo.directMachineCost = this.resolveField<number>(
				'directMachineCost',
				manufactureInfo.directMachineCost,
				manufactureInfo.isdirectMachineCostDirty,
				directMachineCost,
				fieldColorsList,
				manufacturingObj
			)
		}

		if (
			manufactureInfo.isdirectSetUpCostDirty &&
			manufactureInfo.directSetUpCost != null
		) {
			manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost)
		} else {
			let directSetUpCost = this.shareService.isValidNumber(
				(((Number(manufactureInfo.noOfLowSkilledLabours) *
					Number(manufactureInfo.setUpTime)) /
					60) *
					Number(manufactureInfo.lowSkilledLaborRatePerHour)) /
				efficiency /
				Number(manufactureInfo.lotSize) +
				(((Number(manufactureInfo.noOfSkilledLabours) *
					Number(manufactureInfo.skilledLaborRatePerHour)) /
					60) *
					Number(manufactureInfo.setUpTime)) /
				efficiency /
				Number(manufactureInfo.lotSize)
			)
			manufactureInfo.directSetUpCost = this.resolveField<number>(
				'directSetUpCost',
				manufactureInfo.directSetUpCost,
				manufactureInfo.isdirectSetUpCostDirty,
				directSetUpCost,
				fieldColorsList,
				manufacturingObj
			)
		}

		if (
			manufactureInfo.isdirectLaborCostDirty &&
			manufactureInfo.directLaborCost != null
		) {
			manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost)
		} else {
			let directLaborCost = this.shareService.isValidNumber(
				(Number(manufactureInfo.noOfLowSkilledLabours) *
					Number(manufactureInfo.lowSkilledLaborRatePerHour) *
					Number(manufactureInfo.cycleTime)) /
				3600 /
				efficiency +
				(Number(manufactureInfo.noOfSkilledLabours) *
					Number(manufactureInfo.skilledLaborRatePerHour) *
					Number(manufactureInfo.cycleTime)) /
				3600 /
				efficiency
			)
			manufactureInfo.directLaborCost = this.resolveField<number>(
				'directLaborCost',
				manufactureInfo.directLaborCost,
				manufactureInfo.isdirectLaborCostDirty,
				directLaborCost,
				fieldColorsList,
				manufacturingObj
			)
		}

		if (
			manufactureInfo.isinspectionCostDirty &&
			manufactureInfo.inspectionCost != null
		) {
			manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost)
		} else {
			let inspectionCost = this.shareService.isValidNumber(
				((manufactureInfo.inspectionTime / 60) *
					(Number(manufactureInfo.qaOfInspector) || 1) *
					Number(manufactureInfo.qaOfInspectorRate)) /
				efficiency /
				Number(manufactureInfo.lotSize)
			)
			logger.info(
				`Inspection Cost: inspectionTime: ${manufactureInfo.inspectionTime} qaOfInspector: ${manufactureInfo.qaOfInspector} qaOfInspectorRate: ${manufactureInfo.qaOfInspectorRate} efficiency: ${efficiency} lotSize: ${manufactureInfo.lotSize}`
			)
			manufactureInfo.inspectionCost = this.resolveField<number>(
				'inspectionCost',
				manufactureInfo.inspectionCost,
				manufactureInfo.isinspectionCostDirty,
				inspectionCost,
				fieldColorsList,
				manufacturingObj
			)
		}

		// ---- cost calculation code remains unchanged ----

		return manufactureInfo
	}

	public calculationsForWeldingCleaning(
		manufactureInfo: ProcessInfoDto,
		fieldColorsList: any,
		manufacturingObj: ProcessInfoDto
	): ProcessInfoDto {
		const materialInfoList = Array.isArray(manufactureInfo.materialInfoList)
			? manufactureInfo.materialInfoList
			: []
		let materialInfo =
			materialInfoList.find(
				rec =>
					rec.processId === PrimaryProcessType.MigWelding ||
					rec.processId === PrimaryProcessType.TigWelding
			) || null

		// Fallbacks: if not found, try to locate any materialInfo with coreCostDetails
		if (!materialInfo && materialInfoList.length > 0) {
			materialInfo =
				materialInfoList.find(
					(rec: any) => (rec.coreCostDetails || []).length > 0
				) ||
				materialInfoList[0] ||
				null
		}

		const weldingMaterialDetails = materialInfo?.coreCostDetails || []

		// Finish Type
		if (
			manufactureInfo.isTypeOfOperationDirty &&
			manufactureInfo.typeOfOperationId !== null
		) {
			manufactureInfo.typeOfOperationId = Number(
				manufactureInfo.typeOfOperationId
			)
		} else {
			let partType = 1
			if (manufactureInfo.typeOfOperationId !== null) {
				partType = this.shareService.checkDirtyProperty(
					'typeOfOperationId',
					fieldColorsList
				)
					? manufacturingObj?.typeOfOperationId
					: partType
			}
			manufactureInfo.typeOfOperationId = partType
		}

		if (
			manufactureInfo.isCuttingLengthDirty &&
			manufactureInfo.cuttingLength !== null
		) {
			manufactureInfo.cuttingLength = Number(manufactureInfo.cuttingLength)
		} else {
			let totalWeldLength = materialInfo?.totalWeldLength || 0

			// Fallback: compute total weld length from coreCostDetails when totalWeldLength is not provided
			if (
				(!totalWeldLength || totalWeldLength === 0) &&
				weldingMaterialDetails.length > 0
			) {
				totalWeldLength = weldingMaterialDetails.reduce(
					(sum: number, core: any) => {
						const weldLen = Number(core.weldLength ?? core.coreLength ?? 0)
						const places = Number(core.weldPlaces ?? core.coreVolume ?? 1)
						const sideMultiplier = Number(
							core.coreArea ?? (core.weldSide === 'Both' ? 2 : 1)
						)
						return sum + weldLen * places * sideMultiplier
					},
					0
				)
			}

			if (manufactureInfo.cuttingLength !== null) {
				totalWeldLength = this.shareService.checkDirtyProperty(
					'cuttingLength',
					fieldColorsList
				)
					? manufacturingObj?.cuttingLength
					: totalWeldLength
			}

			manufactureInfo.cuttingLength = totalWeldLength
			logger.info(`Cutting Length: ${manufactureInfo.cuttingLength}`)
		}

		const maxWeldElementSize =
			weldingMaterialDetails.length > 0
				? Math.max(
					...weldingMaterialDetails.map((item: any) =>
						Number(
							item.coreWeight ??
							item.weldElementSize ??
							item.coreHeight ??
							item.coreWidth ??
							0
						)
					)
				)
				: 0
		logger.info(`Max Weld Element Size: ${maxWeldElementSize}`)
		const weldCrossSectionalArea =
			2 * manufactureInfo.cuttingLength * maxWeldElementSize
		logger.info(
			`Weld Cross Sectional Area:${manufactureInfo.cuttingLength}*${maxWeldElementSize} = ${weldCrossSectionalArea}`
		)
		const materialType = this._smConfig.mapMaterial(
			manufactureInfo.materialmasterDatas?.materialType?.materialTypeName
		)
		logger.info(`Material Type: ${materialType}`)

		let lookupListDia = this._weldingConfig
			.getDiscBrushDia()
			?.filter(
				(x: any) =>
					x.materialType === materialType &&
					x.partArea >= weldCrossSectionalArea
			)?.[0]
		if (weldCrossSectionalArea > 100001) {
			lookupListDia = this._weldingConfig
				.getDiscBrushDia()
				?.filter((x: any) => x.materialType === materialType)
				?.reverse()?.[0]
			logger.info(`Lookup List Dia: ${lookupListDia}`)
		}

		let discBrushDia = 0
		let deburringRPM = 0
		if (lookupListDia) {
			discBrushDia = lookupListDia.discBrush
			deburringRPM =
				manufactureInfo?.processTypeID === ProcessType.WeldingCleaning
					? lookupListDia.prepRPM
					: lookupListDia.cleaningRPM
			logger.info(`Disc Brush Dia: ${discBrushDia}`)
		}
		manufactureInfo.netMaterialCost = materialInfo?.netMatCost || 0
		logger.info(`Net Material Cost: ${manufactureInfo.netMaterialCost}`)

		const feedPerREvRough = this.shareService.isValidNumber(discBrushDia / 2)
		logger.info(`Feed Per Rough: ${feedPerREvRough}`)
		const feedPerREvFinal = this.shareService.isValidNumber(discBrushDia / 4)
		logger.info(`Feed Per Final: ${feedPerREvFinal}`)
		const noOfPasses = this.shareService.isValidNumber(
			Math.ceil(maxWeldElementSize / (discBrushDia || 1))
		)
		logger.info(`No of Passes: ${noOfPasses}`)
		const reorientaionTime =
			this._weldingConfig.getUnloadingTime(materialInfo?.netWeight) || 0
		logger.info(`Reorientation Time: ${reorientaionTime}`)

		if (
			manufactureInfo.isNoOfWeldPassesDirty &&
			manufactureInfo.noOfWeldPasses != null
		) {
			manufactureInfo.noOfIntermediateStartAndStop = Number(
				manufactureInfo.noOfIntermediateStartAndStop
			)
		} else {
			manufactureInfo.noOfWeldPasses =
				this.shareService.isValidNumber(noOfPasses)

			logger.info(
				`No of Weld Passes (computed): ${manufactureInfo.noOfWeldPasses}`
			)
		}

		manufactureInfo.noOfIntermediateStartAndStop =
			manufactureInfo.noOfWeldPasses

		logger.info(
			`No of Intermediate Start/Stops = No of Weld Passes → ${manufactureInfo.noOfIntermediateStartAndStop}`
		)
		const partHandlingTime =
			reorientaionTime + manufactureInfo.noOfIntermediateStartAndStop * 5

		logger.info(
			`Part Handling Time: reorientaionTime: ${reorientaionTime}, noOfIntermediateStartAndStop: ${manufactureInfo.noOfIntermediateStartAndStop}, total: ${partHandlingTime}`
		)
		const term = 2 * (manufactureInfo.cuttingLength + 5) * noOfPasses * 60

		logger.info(`Term: ${term}`)

		const processTime =
			partHandlingTime +
			this.safeDiv(term, feedPerREvRough, deburringRPM) +
			(manufactureInfo.typeOfOperationId === 1
				? 0
				: this.safeDiv(term, feedPerREvFinal, deburringRPM))

		logger.info(
			`Process Time: partHandlingTime=${partHandlingTime}, feedPerREvRough=${feedPerREvRough}, feedPerREvFinal=${feedPerREvFinal}, deburringRPM=${deburringRPM}, term=${term}, processTime=${processTime}`
		)

		if (manufactureInfo.isefficiencyDirty && !!manufactureInfo.efficiency) {
			manufactureInfo.efficiency = Number(manufactureInfo.efficiency)
			logger.info(`Efficiency: ${manufactureInfo.efficiency}`)
		} else {
			manufactureInfo.efficiency = this.shareService.checkDirtyProperty(
				'efficiency',
				fieldColorsList
			)
				? manufacturingObj?.efficiency
				: this.shareService.isValidNumber(manufactureInfo.efficiency)
			if (Number(manufactureInfo.efficiency) < 1) {
				manufactureInfo.efficiency *= 100
				logger.info(`Efficiency: ${manufactureInfo.efficiency}`)
			}
		}
		if (!manufactureInfo.efficiency) manufactureInfo.efficiency = 75

		if (
			manufactureInfo.iscycleTimeDirty &&
			manufactureInfo.cycleTime !== null
		) {
			manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime)
			logger.info(`Cycle Time: ${manufactureInfo.cycleTime}`)
		} else {
			let cycleTime = this.shareService.isValidNumber(
				processTime / (manufactureInfo.efficiency / 100)
			)
			logger.info(
				`Cycle Time: processTime ${processTime}, efficiency ${manufactureInfo.efficiency}, cycleTime ${cycleTime}`
			)
			if (manufactureInfo.cycleTime !== null) {
				cycleTime = this.shareService.checkDirtyProperty(
					'cycleTime',
					fieldColorsList
				)
					? manufacturingObj?.cycleTime
					: cycleTime
			}
			manufactureInfo.cycleTime = cycleTime
		}

		if (
			manufactureInfo.isdirectMachineCostDirty &&
			manufactureInfo.directMachineCost !== null
		) {
			manufactureInfo.directMachineCost = Number(
				manufactureInfo.directMachineCost
			)
			logger.info(`Direct Machine Cost: ${manufactureInfo.directMachineCost}`)
		} else {
			let directMachineCost = this.shareService.isValidNumber(
				(Number(manufactureInfo.machineHourRate) *
					Number(manufactureInfo.cycleTime)) /
				3600
			)
			logger.info(
				`Direct Machine Cost: machineHourRate ${manufactureInfo.machineHourRate}, cycleTime ${manufactureInfo.cycleTime}, directMachineCost ${directMachineCost}`
			)
			if (manufactureInfo.directMachineCost !== null) {
				directMachineCost = this.shareService.checkDirtyProperty(
					'directMachineCost',
					fieldColorsList
				)
					? manufacturingObj?.directMachineCost
					: directMachineCost
			}
			manufactureInfo.directMachineCost = directMachineCost
		}

		if (
			manufactureInfo.isdirectSetUpCostDirty &&
			manufactureInfo.directSetUpCost !== null
		) {
			manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost)
			logger.info(`Direct Set Up Cost: ${manufactureInfo.directSetUpCost}`)
		} else {
			let directSetUpCost = this.shareService.isValidNumber(
				((Number(manufactureInfo.machineHourRate) +
					Number(manufactureInfo.skilledLaborRatePerHour)) *
					(Number(manufactureInfo.setUpTime) / 60)) /
				Number(manufactureInfo.lotSize)
			)
			logger.info(
				`Direct Set Up Cost: machineHourRate ${manufactureInfo.machineHourRate}, skilledLaborRatePerHour ${manufactureInfo.skilledLaborRatePerHour}, setUpTime ${manufactureInfo.setUpTime}, lotSize ${manufactureInfo.lotSize}, directSetUpCost ${directSetUpCost}`
			)
			if (manufactureInfo.directSetUpCost !== null) {
				directSetUpCost = this.shareService.checkDirtyProperty(
					'directSetUpCost',
					fieldColorsList
				)
					? manufacturingObj?.setUpCost
					: directSetUpCost
			}
			manufactureInfo.directSetUpCost = directSetUpCost
			logger.info(`Direct Set Up Cost: ${manufactureInfo.directSetUpCost}`)
		}

		if (
			manufactureInfo.isdirectLaborCostDirty &&
			manufactureInfo.directLaborCost != null
		) {
			manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost)
			logger.info(`Direct Labor Cost: ${manufactureInfo.directLaborCost}`)
		} else {
			let directLaborCost = this.shareService.isValidNumber(
				(Number(manufactureInfo.noOfLowSkilledLabours) *
					Number(manufactureInfo.lowSkilledLaborRatePerHour) *
					Number(manufactureInfo.cycleTime)) /
				3600
			)
			logger.info(
				`Direct Labor Cost: noOfLowSkilledLabours ${manufactureInfo.noOfLowSkilledLabours}, lowSkilledLaborRatePerHour ${manufactureInfo.lowSkilledLaborRatePerHour}, cycleTime ${manufactureInfo.cycleTime}, directLaborCost ${directLaborCost}`
			)
			if (manufactureInfo.directLaborCost !== null) {
				directLaborCost = this.shareService.checkDirtyProperty(
					'directLaborCost',
					fieldColorsList
				)
					? manufacturingObj?.directLaborCost
					: directLaborCost
			}
			manufactureInfo.directLaborCost = directLaborCost
			logger.info(`Direct Labor Cost: ${manufactureInfo.directLaborCost}`)
		}

		if (
			manufactureInfo.isinspectionTimeDirty &&
			manufactureInfo.inspectionTime !== null
		) {
			manufactureInfo.inspectionTime = Number(manufactureInfo.inspectionTime)
			logger.info(`Inspection Time: ${manufactureInfo.inspectionTime}`)
		} else {
			let inspectionTime =
				manufactureInfo.partComplexity == PartComplexity.Low
					? 0.25
					: manufactureInfo.partComplexity == PartComplexity.Medium
						? 0.5
						: manufactureInfo.partComplexity == PartComplexity.High
							? 1
							: 0
			logger.info(
				`Inspection Time: partComplexity ${manufactureInfo.partComplexity}, inspectionTime ${inspectionTime}`
			)
			if (manufactureInfo.inspectionTime !== null) {
				inspectionTime = this.shareService.checkDirtyProperty(
					'inspectionTime',
					fieldColorsList
				)
					? manufacturingObj?.inspectionTime
					: inspectionTime
			}
			manufactureInfo.inspectionTime = inspectionTime
		}

		if (
			manufactureInfo.isinspectionCostDirty &&
			manufactureInfo.inspectionCost !== null
		) {
			manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost)
			logger.info(`Inspection Cost: ${manufactureInfo.inspectionCost}`)
		} else {
			let inspectionCost = this.shareService.isValidNumber(
				(((manufactureInfo?.qaOfInspectorRate ?? 0) / 60) *
					Math.ceil(
						((manufactureInfo?.samplingRate ?? 0) / 100) *
						(manufactureInfo?.lotSize ?? 0)
					) *
					(manufactureInfo?.inspectionTime ?? 0)) /
				(manufactureInfo?.lotSize ?? 1)
			)
			logger.info(
				`Inspection Cost: qaOfInspectorRate ${manufactureInfo.qaOfInspectorRate}, samplingRate ${manufactureInfo.samplingRate}, lotSize ${manufactureInfo.lotSize}, inspectionTime ${manufactureInfo.inspectionTime}, inspectionCost ${inspectionCost}`
			)
			if (manufactureInfo.inspectionCost !== null) {
				inspectionCost = this.shareService.checkDirtyProperty(
					'inspectionCost',
					fieldColorsList
				)
					? manufacturingObj?.inspectionCost
					: inspectionCost
			}
			manufactureInfo.inspectionCost = inspectionCost
		}

		if (
			manufactureInfo.isyieldPercentDirty &&
			manufactureInfo.yieldPer !== null
		) {
			manufactureInfo.yieldPer = Number(manufactureInfo.yieldPer)
			logger.info(`Yield Per: ${manufactureInfo.yieldPer}`)
		} else {
			let yieldPer = 98.5
			logger.info(`Yield Per: ${yieldPer}`)
			if (manufactureInfo.yieldPer !== null) {
				yieldPer = this.shareService.checkDirtyProperty(
					'yieldPer',
					fieldColorsList
				)
					? manufacturingObj?.yieldPer
					: yieldPer
			}
			manufactureInfo.yieldPer = yieldPer
		}

		if (
			manufactureInfo.isyieldCostDirty &&
			manufactureInfo.yieldCost !== null
		) {
			manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost)
			logger.info(`Yield Cost: ${manufactureInfo.yieldCost}`)
		} else {
			let sum = this.shareService.isValidNumber(
				Number(manufactureInfo.directMachineCost) +
				Number(manufactureInfo.directSetUpCost) +
				Number(manufactureInfo.directLaborCost) +
				Number(manufactureInfo.inspectionCost)
			)
			let yieldCost = this.shareService.isValidNumber(
				(1 - Number(manufactureInfo.yieldPer) / 100) *
				(Number(manufactureInfo.netMaterialCost) + sum)
			)
			logger.info(
				`Yield Cost: directMachineCost ${manufactureInfo.directMachineCost}, directSetUpCost ${manufactureInfo.directSetUpCost}, directLaborCost ${manufactureInfo.directLaborCost}, inspectionCost ${manufactureInfo.inspectionCost}, yieldCost ${yieldCost}`
			)
			if (manufactureInfo.yieldCost !== null) {
				yieldCost = this.shareService.checkDirtyProperty(
					'yieldCost',
					fieldColorsList
				)
					? manufacturingObj?.yieldCost
					: yieldCost
			}
			manufactureInfo.yieldCost = yieldCost
		}

		manufactureInfo.directProcessCost = this.shareService.isValidNumber(
			Number(manufactureInfo.directLaborCost) +
			Number(manufactureInfo.directMachineCost) +
			Number(manufactureInfo.directSetUpCost) +
			Number(manufactureInfo.inspectionCost) +
			Number(manufactureInfo.yieldCost)
		)
		logger.info(`Direct Process Cost: ${manufactureInfo.directProcessCost}`)
		return manufactureInfo
	}

	/**
	 * Helper method to safely divide to avoid division by zero
	 */
	private safeDiv(numerator: number, a: number, b: number): number {
		return a && b ? numerator / (a * b) : 0
	}

	private calculateInspectionCost(
		inspectionTime: number,
		rate: number,
		samplingRate: number,
		lotSize: number,
		isSeamWelding: boolean
	): number {
		const safeTime = Number(inspectionTime) || 0
		const safeRate = Number(rate) || 0
		const safeLot = Math.max(Number(lotSize) || 1, 1)

		const normalizedSampling = Math.min(
			Math.max(Number(samplingRate) || 100, 0),
			100
		)
		const samplingFactor = normalizedSampling / 100

		let cost = safeTime * safeRate * samplingFactor

		if (isSeamWelding) {
			cost = cost / safeLot
		} else {
			cost = cost / 60 // minutes → hours
		}

		return Number.isFinite(cost) ? cost : 0
	}
	private resolveField<T>(
		fieldName: keyof ProcessInfoDto,
		currentValue: T | null,
		isDirty: boolean,
		calculatedValue: T,
		fieldColorsList: any,
		manufacturingObj: ProcessInfoDto
	): T {
		if (isDirty && currentValue !== null) {
			return Number(currentValue) as T
		}

		if (currentValue !== null) {
			const isColorDirty = this.shareService.checkDirtyProperty(
				String(fieldName),
				fieldColorsList
			)

			if (isColorDirty) {
				return manufacturingObj?.[fieldName] as T
			}
		}

		return calculatedValue
	}
	public weldingPreCalc(
		manufactureInfo: ProcessInfoDto,
		fieldColorsList: any,
		manufacturingObj: ProcessInfoDto
	): void {
		manufactureInfo.setUpTime = manufactureInfo.setUpTime || 30

		if (manufactureInfo.isyieldPercentDirty && !!manufactureInfo.yieldPer) {
			manufactureInfo.yieldPer = this.shareService.isValidNumber(
				Number(manufactureInfo.yieldPer)
			)
		} else {
			let yieldPer = this._weldingConfig.defaultPercentages(
				Number(manufactureInfo.processTypeID),
				manufactureInfo.partComplexity,
				'yieldPercentage'
			)
			if (manufactureInfo.yieldPer) {
				yieldPer = this.shareService.checkDirtyProperty(
					'yieldPer',
					fieldColorsList
				)
					? manufacturingObj?.yieldPer
					: this.shareService.isValidNumber(yieldPer)
			}
			manufactureInfo.yieldPer = yieldPer
		}

		if (manufactureInfo.isSamplingRateDirty && !!manufactureInfo.samplingRate) {
			manufactureInfo.samplingRate = this.shareService.isValidNumber(
				Number(manufactureInfo.samplingRate)
			)
		} else {
			let samplingRate = this._weldingConfig.defaultPercentages(
				Number(manufactureInfo.processTypeID),
				manufactureInfo.partComplexity,
				'samplingRate'
			)
			if (manufactureInfo.samplingRate) {
				samplingRate = this.shareService.checkDirtyProperty(
					'samplingRate',
					fieldColorsList
				)
					? manufacturingObj?.samplingRate
					: this.shareService.isValidNumber(samplingRate)
			}
			manufactureInfo.samplingRate = samplingRate
		}

		if (manufactureInfo.isefficiencyDirty && !!manufactureInfo.efficiency) {
			manufactureInfo.efficiency = Number(manufactureInfo.efficiency)
		} else {
			let efficiency = 75
			const weldingEffeciencyValues = this._weldingConfig
				.getWeldingEfficiencyData(
					Number(manufactureInfo.processTypeID) === ProcessType.StickWelding
						? 'stickWelding'
						: 'welding'
				)
				.find((x: any) => x.id === Number(manufactureInfo.weldingPosition))

			if (Number(manufactureInfo.semiAutoOrAuto) == MachineType.Automatic) {
				efficiency = Number(
					weldingEffeciencyValues?.EffeciencyAuto || efficiency
				)
			} else if (Number(manufactureInfo.semiAutoOrAuto) == MachineType.Manual) {
				efficiency = Number(
					weldingEffeciencyValues?.EffeciencyManual || efficiency
				)
			} else {
				efficiency = Number(
					weldingEffeciencyValues?.EffeciencySemiAuto || efficiency
				)
			}

			if (manufactureInfo.efficiency) {
				efficiency = this.shareService.checkDirtyProperty(
					'efficiency',
					fieldColorsList
				)
					? manufacturingObj?.efficiency
					: this.shareService.isValidNumber(efficiency)
			}
			manufactureInfo.efficiency = efficiency
		}
		if (manufactureInfo.efficiency <= 1) {
			manufactureInfo.efficiency = manufactureInfo.efficiency * 100
		}
		if (!manufactureInfo.efficiency) {
			manufactureInfo.efficiency = 75
		}
		// Sync MachineEfficiency for consistency
		if (!manufactureInfo.MachineEfficiency) {
			manufactureInfo.MachineEfficiency = manufactureInfo.efficiency
		}
	}

	public calculateExpectedWeldingMaterialCosts(
		materialInfo: any,
		weldSubMaterials: any[],
		efficiency: number = 75,
		MachineEfficiency?: number
	): {
		totalWeldLength: number
		totalWeldMaterialWeight: number
		weldBeadWeightWithWastage: number
	} {
		let totalWeldLength = 0
		let totalVolume = 0
		let totalWeldLoss = 0
		const materialType = materialInfo.materialType || 'Carbon Steel' // Default to Carbon Steel if not provided

		weldSubMaterials.forEach(coreCost => {
			// Map parameters to calculateWeldVolume inputs
			const weldElementSize = Number(
				coreCost.weldElementSize || coreCost.coreWeight || 0
			)
			const weldSize = Number(coreCost.weldSize || coreCost.coreHeight || 0)
			const weldPasses = Number(
				coreCost.noOfWeldPasses || coreCost.noOfCore || 0
			)
			const weldLength = Number(coreCost.weldLength || coreCost.coreLength || 0)
			const weldPlaces = Number(coreCost.weldPlaces || coreCost.coreVolume || 0) // Note: coreVolume mapping from service
			const weldSide =
				coreCost.weldSide === 'Both' || coreCost.weldSide === 2 ? 2 : 1
			const weldTypeInput = String(coreCost.weldType || coreCost.coreShape || 1) // Passed as string or number ID
			const wireDiameter = Number(coreCost.wireDia || coreCost.coreWidth || 0)

			// Calculate using the standalone utility function
			const result = calculateWeldVolume(
				weldTypeInput,
				weldSize,
				weldElementSize,
				weldLength,
				weldPlaces,
				weldPasses,
				weldSide
			)

			totalWeldLength += result.totalWeldLength
			totalVolume += result.weldVolume

			const weldLoss = this._weldingConfig.getMaxNearestWeightLoss(
				materialType,
				wireDiameter
			)
			totalWeldLoss += weldLoss
		})
		const density = Number(materialInfo.density || 7.85) // g/cm3
		const totalWeldMaterialWeight = (totalVolume / 1000) * density
		const efficiencyFactor = (MachineEfficiency || efficiency) / 100
		const weldBeadWeightWithWastage =
			totalWeldMaterialWeight / efficiencyFactor + totalWeldLoss

		return {
			totalWeldLength,
			totalWeldMaterialWeight,
			weldBeadWeightWithWastage
		}
	}

	public calculatePowerConsumption(current: number, voltage: number): number {
		return (current * voltage) / 1000
	}

	public calculateCostPower(
		cycleTime: number, // in seconds
		powerConsumptionKW: number, // kW
		electricityUnitCost: number // per kWh
	): number {
		return this.shareService.isValidNumber(
			(cycleTime / 3600) * powerConsumptionKW * electricityUnitCost
		)
	}

	public calculateMachineCost(
		machineHourRate: number,
		cycleTime: number // in seconds
	): number {
		return this.shareService.isValidNumber((machineHourRate / 3600) * cycleTime)
	}

	public calculateLaborCost(
		laborHourRate: number,
		cycleTime: number, // in seconds
		noOfLabors: number
	): number {
		return this.shareService.isValidNumber(
			(laborHourRate / 3600) * cycleTime * noOfLabors
		)
	}

	public calculateSetupCost(
		setupTime: number, // in minutes
		machineHourRate: number,
		laborHourRate: number, // skilled labor
		lotSize: number
	): number {
		return this.shareService.isValidNumber(
			((laborHourRate + machineHourRate) * (setupTime / 60)) / lotSize
		)
	}

	public calculateYieldCost(
		yieldPercentage: number,
		processCostSum: number, // Machine + Setup + Labor + Inspection
		materialCost: number
	): number {
		return this.shareService.isValidNumber(
			(1 - yieldPercentage / 100) * (materialCost + processCostSum)
		)
	}

	getExpectedEfficiency(
		weldPosition: string,
		rawMachineType: string,
		weldType = 'welding'
	): number {
		const positions = costingConfig.weldingPositionList(weldType)

		// -------------------------------
		// Normalize inputs
		// -------------------------------
		const normalizedPosition = weldPosition.trim().toLowerCase()
		const normalizedMachine = rawMachineType
			.trim()
			.toLowerCase()
			.replace(/[^a-z]/g, '') // removes space, dash etc

		logger.info(
			`🧪 [Efficiency] Raw inputs → Position="${weldPosition}", Machine="${rawMachineType}"`
		)
		logger.info(
			`🧪 [Efficiency] Normalized → Position="${normalizedPosition}", Machine="${normalizedMachine}"`
		)

		// -------------------------------
		// Resolve machine efficiency key
		// -------------------------------
		let efficiencyKey: keyof (typeof positions)[0] | undefined

		if (normalizedMachine.includes('semiauto')) {
			efficiencyKey = 'EffeciencySemiAuto'
		} else if (normalizedMachine.includes('manual')) {
			efficiencyKey = 'EffeciencyManual'
		} else if (normalizedMachine.includes('auto')) {
			efficiencyKey = 'EffeciencyAuto'
		}

		if (!efficiencyKey) {
			logger.warn(
				`⚠️ [Efficiency] Unable to resolve machine type from "${rawMachineType}". ` +
				`Defaulting to EffeciencyManual.`
			)
			efficiencyKey = 'EffeciencyManual'
		}

		logger.info(
			`🧪 [Efficiency] Resolved efficiency key = "${String(efficiencyKey)}"`
		)

		// -------------------------------
		// Find matching weld position row
		// -------------------------------
		const positionRow = positions.find(
			p => p.name.trim().toLowerCase() === normalizedPosition
		)

		if (!positionRow) {
			logger.warn(
				`⚠️ [Efficiency] Weld position "${weldPosition}" not found in config. ` +
				`Defaulting efficiency to 75%.`
			)
			return 75
		}

		logger.info(
			`🧪 [Efficiency] Matched config row → ` +
			`Position="${positionRow.name}", ` +
			`Auto=${positionRow.EffeciencyAuto}, ` +
			`Manual=${positionRow.EffeciencyManual}, ` +
			`SemiAuto=${positionRow.EffeciencySemiAuto}`
		)

		// -------------------------------
		// Extract efficiency value
		// -------------------------------
		const efficiency = positionRow[efficiencyKey]

		if (typeof efficiency !== 'number') {
			logger.warn(
				`⚠️ [Efficiency] Efficiency value missing for key "${String(
					efficiencyKey
				)}". ` + `Row=${JSON.stringify(positionRow)}. Defaulting to 75%.`
			)
			return 75
		}

		logger.info(
			`✅ [Efficiency] Final resolved efficiency = ${efficiency}% ` +
			`(Key="${String(efficiencyKey)}", Position="${positionRow.name}")`
		)

		return efficiency
	}
}

export function getWeldTypeId(weldType: string | number): number {
	if (typeof weldType === 'number') return weldType
	if (!weldType) return 1

	const lowerType = weldType.toString().toLowerCase()
	if (lowerType.includes('fillet')) return 1
	if (lowerType.includes('square')) return 2
	if (lowerType.includes('plug')) return 3
	if (lowerType.includes('bevel') || lowerType.includes('v groove')) return 4
	if (lowerType.includes('u/j')) return 5

	return 1
}

export function calculateSingleWeldCycleTime(
	input: WeldCycleTimeInput
): number {
	const {
		totalWeldLength,
		travelSpeed,
		tackWelds,
		intermediateStops,
		weldType
	} = input
	const cycleTimeForIntermediateStops = intermediateStops * 5
	const cycleTimeForTackWelds = tackWelds * 3
	const weldProcessTime = totalWeldLength / travelSpeed

	let totalSubProcessTime =
		weldProcessTime + cycleTimeForIntermediateStops + cycleTimeForTackWelds

	const typeId = getWeldTypeId(weldType || '')
	if (typeId === 4) {
		totalSubProcessTime *= 0.95
	} else if (typeId === 5) {
		totalSubProcessTime *= 1.5
	}

	return totalSubProcessTime
}

export function calculateArcOnTime(
	subProcessCycleTime: number,
	loadingUnloadingTime: number
): number {
	return subProcessCycleTime + loadingUnloadingTime
}

export function calculateArcOffTime(
	arcOnTime: number,
	factor: number = 0.05
): number {
	return arcOnTime * factor
}
export function calculateWeldCycleTimeBreakdown(
	input: TotalCycleTimeInput
): WeldCycleTimeBreakdown {
	const efficiency = normalizeEfficiency(
		input.MachineEfficiency || input.efficiency
	)

	const subProcessCycleTime = (input.subProcessCycleTimes ?? []).reduce(
		(sum, t) => sum + t,
		0
	)
	const totalLoadingUnloading = input.loadingUnloadingTime || 0
	const loadingTime = totalLoadingUnloading / 2
	const unloadingTime = totalLoadingUnloading / 2

	// ✅ In Mig/Tig calculation, Arc On Time includes SubProcess + Part Handling
	const arcOnTime = subProcessCycleTime + totalLoadingUnloading
	logger.info(
		`Arc On Time : ${subProcessCycleTime} + ${totalLoadingUnloading} = ${arcOnTime.toFixed(4)} sec`
	)
	const arcOffTime = arcOnTime * 0.05
	logger.info(
		`Arc Off Time : ${arcOnTime} * 0.05 = ${arcOffTime.toFixed(4)} sec`
	)
	const partReorientationCount = input.partReorientation || 0
	const partReorientationTime = partReorientationCount * loadingTime
	logger.info(
		`Part Reorientation Time : ${partReorientationCount} * ${loadingTime} = ${partReorientationTime.toFixed(4)} sec`
	)

	// Dry Cycle Time = (SubProcess + Handling) + ArcOffFactor + Reorientations
	const totalWeldCycleTime = arcOnTime + arcOffTime + partReorientationTime
	logger.info(
		`Total Weld Cycle Time : ${arcOnTime} + ${arcOffTime} + ${partReorientationTime} = ${totalWeldCycleTime.toFixed(4)} sec`
	)
	const finalCycleTime =
		efficiency > 0 ? totalWeldCycleTime / efficiency : totalWeldCycleTime
	logger.info(
		`Final Cycle Time : ${totalWeldCycleTime} / ${efficiency} = ${finalCycleTime.toFixed(4)} sec`
	)
	return {
		subProcessCycleTimes: input.subProcessCycleTimes ?? [],
		loadingUnloadingTime: totalLoadingUnloading,
		partReorientation: partReorientationCount,
		efficiency,
		subProcessCycleTime,
		loadingTime,
		unloadingTime,
		arcOnTime,
		arcOffTime,
		partReorientationTime,
		totalWeldCycleTime,
		finalCycleTime,
		cycleTime: finalCycleTime
	}
}

export function calculateSubProcessCycleTime(
	subProcesses: SubProcessInfo[],
	semiAutoOrAuto: boolean,
	getWeldingEfficiency: (length: number, isSemiAuto: boolean) => number,
	getWeldingData: (
		materialType: string,
		shoulderWidth?: number
	) => { TravelSpeed_mm_per_sec?: number }
): number {
	return subProcesses.reduce((total, sp) => {
		const efficiency = getWeldingEfficiency(sp.formLength, semiAutoOrAuto)
		logger.info(`Efficiency : ${efficiency.toFixed(4)}`)
		const travelSpeed = sp.formHeight
			? Number(sp.formHeight)
			: (getWeldingData('Default', sp.shoulderWidth)?.TravelSpeed_mm_per_sec ??
				1) *
			efficiency *
			(semiAutoOrAuto ? 1 / 0.8 : 1)
		logger.info(`Travel Speed : ${travelSpeed.toFixed(4)} mm/sec`)
		const stops = (sp.formPerimeter || 0) * 5
		logger.info(`Stops : ${stops.toFixed(4)} sec`)
		const tackWelds = (sp.hlFactor ?? sp.noOfHoles ?? 0) * 3
		logger.info(`Tack Welds : ${tackWelds.toFixed(4)} sec`)
		let cycleTime = sp.formLength / travelSpeed + stops + tackWelds
		logger.info(`Cycle Time : ${cycleTime.toFixed(4)} sec`)
		if (sp.lengthOfCut === 4) cycleTime *= 0.95
		logger.info(`Cycle Time after lengthOfCut 4 : ${cycleTime.toFixed(4)} sec`)
		if (sp.lengthOfCut === 5) cycleTime *= 1.5
		logger.info(`Cycle Time after lengthOfCut 5 : ${cycleTime.toFixed(4)} sec`)
		return total + cycleTime
	}, 0)
}
export function calculateTotalWeldCycleTime(
	input: TotalCycleTimeInput
): number {
	return calculateWeldCycleTimeBreakdown(input).cycleTime
}

export function calculationForWeldingWrapper(
	manufactureInfo: ProcessInfoDto,
	fieldColorsList: any,
	manufacturingObj: ProcessInfoDto,
	laborRateDto: LaborRateMasterDto[]
): ProcessInfoDto {
	const calc = new WeldingCalculator()
	return calc.calculationForWelding(
		manufactureInfo,
		fieldColorsList,
		manufacturingObj,
		laborRateDto
	)
}

export function calculationForSeamWeldingWrapper(
	manufactureInfo: ProcessInfoDto,
	fieldColorsList: any,
	manufacturingObj: ProcessInfoDto,
	laborRateDto: LaborRateMasterDto[]
): ProcessInfoDto {
	const calc = new WeldingCalculator()
	return calc.calculationForSeamWelding(
		manufactureInfo,
		fieldColorsList,
		manufacturingObj,
		laborRateDto
	)
}

export function calculationForSpotWeldingWrapper(
	manufactureInfo: ProcessInfoDto,
	fieldColorsList: any,
	manufacturingObj: ProcessInfoDto,
	laborRateDto: LaborRateMasterDto[]
): ProcessInfoDto {
	const calc = new WeldingCalculator()
	return calc.calculationForSpotWelding(
		manufactureInfo,
		fieldColorsList,
		manufacturingObj,
		laborRateDto
	)
}

export function calculateLotSize(annualVolumeQty: number): number {
	if (!annualVolumeQty || annualVolumeQty <= 0) {
		return 1 // Minimum lot size
	}
	return Math.round(annualVolumeQty / 12)
}

export function calculateLifeTimeQtyRemaining(
	annualVolumeQty: number,
	productLifeRemaining: number
): number {
	if (!annualVolumeQty || annualVolumeQty <= 0) {
		return 0
	}
	if (!productLifeRemaining || productLifeRemaining <= 0) {
		return 0
	}
	const lifeTimeQty = annualVolumeQty * productLifeRemaining
	// Maximum cap of 100,000,000
	return lifeTimeQty > 100000000 ? 100000000 : lifeTimeQty
}

export function calculatePowerCost(
	cycleTimeSeconds: number,
	powerConsumptionKW: number,
	electricityUnitCost: number
): number {
	return (cycleTimeSeconds / 3600) * powerConsumptionKW * electricityUnitCost
}

export function calculateManufacturingCO2(
	cycleTimeSeconds: number,
	powerConsumptionKW: number,
	co2PerKwHr: number
): number {
	const cycleTimeHours = cycleTimeSeconds / 3600
	const co2PerPart = cycleTimeHours * powerConsumptionKW * co2PerKwHr
	return Number(co2PerPart.toFixed(4))
}

function round4(value: number): number {
	return Math.round(value * 10000) / 10000
}

export function calculateNetWeight(
	volumeMm3: number,
	densityGCm3: number
): number {
	// Convert mm³ → cm³ → kg
	const volumeCm3 = volumeMm3 / 1000
	const weightGrams = volumeCm3 * densityGCm3
	//const weightKg = weightGrams / 1000

	Logger.debug(
		`[calculateNetWeight] Volume: ${volumeMm3}mm³, Density: ${densityGCm3}g/cm³ = ${weightGrams.toFixed(
			4
		)}g`
	)
	return weightGrams
}
export interface WeldCalculationResult {
	totalWeldLength: number
	weldVolume: number
	weldMass: number
}

export function calculateWeldVolume(
	weldType: string | number,
	weldSize: number,
	weldElementSize: number,
	weldLength: number,
	weldPlaces: number,
	weldPasses: number,
	weldSide: string | number
): WeldCalculationResult {
	const typeId = getWeldTypeId(weldType)

	let weldCrossSection = 0
	const size = weldElementSize
	const height = weldSize

	if (typeId === 1 || typeId === 2) {
		weldCrossSection = (size * height) / 2
	} else if (typeId === 3) {
		weldCrossSection = size * size + height
	} else if (typeId === 4) {
		weldCrossSection = size * size + height / 2
	} else {
		weldCrossSection = (size * height * 3) / 2
	}

	let sideMultiplier = 1
	if (weldSide === 'Both' || weldSide === 2) {
		sideMultiplier = 2
	} else {
		sideMultiplier = 1
	}

	const totalWeldLength = weldPasses * weldLength * weldPlaces * sideMultiplier
	const weldVolume = totalWeldLength * weldCrossSection

	return {
		totalWeldLength,
		weldVolume,
		weldMass: 0
	}
}

export async function validateTotalLength(
	weldLength: Locator,
	weldPlaces: Locator,
	weldSide: Locator,
	totalWeldLength: Locator,
	fieldName = 'Total Length'
): Promise<void> {
	await expect(weldLength).toBeVisible()

	const length = Number((await weldLength.inputValue()) || '0')
	const places = Number((await weldPlaces.inputValue()) || '0')

	const sideText =
		(await weldSide.locator('option:checked').textContent()) || ''

	const sideFactor = sideText.toLowerCase().includes('both') ? 2 : 1

	const expected = length * places * sideFactor

	await expect(totalWeldLength).not.toHaveValue('')
	const actual = Number((await totalWeldLength.inputValue()) || '0')

	expect.soft(actual).toBeCloseTo(expected, 1)

	Logger.info(`${fieldName} → UI: ${actual}, Expected: ${expected}`)
}

export function calculateTotalWeldLength(
	weldLength: number,
	weldPlaces: number,
	weldSide: string = 'One Side'
): number {
	const sideMultiplier =
		weldSide && weldSide.toLowerCase().includes('both') ? 2 : 1
	const totalLength = weldLength * weldPlaces * sideMultiplier

	Logger.debug(
		`[calculateTotalWeldLength] Length: ${weldLength}mm × Places: ${weldPlaces} × Sides: ${sideMultiplier} = ${totalLength.toFixed(
			2
		)}mm`
	)
	return totalLength
}

export function calculateRowTotalLength(
	length: number,
	places: number,
	side: string
): number {
	const sideFactor =
		side.toLowerCase().includes('both') || side.toLowerCase().includes('double')
			? 2
			: 1
	return length * places * sideFactor
}
export function calculateOverHeadCost(
	overHeadCost: number,
	profitCost: number,
	costOfCapital: number
): number {
	const total = overHeadCost + costOfCapital + profitCost
	return Number(total.toFixed(4))
}
export function calculateTotalPackMatlCost(
	primaryCosts1: number,
	primaryCosts2: number,
	secondaryCost: number,
	tertiaryCost: number
): number {
	const grandTotal =
		Number(primaryCosts1) +
		Number(primaryCosts2) +
		Number(secondaryCost) +
		Number(tertiaryCost)
	const roundedTotal = Number(grandTotal.toFixed(4))
	console.log('Rounded Total:', roundedTotal)
	return roundedTotal
}

export async function calculateExPartCost(
	materialCost: number,
	manufacturingCost: number,
	toolingCost: number,
	overheadCost: number,
	packingCost: number
): Promise<number> {
	const total =
		materialCost + manufacturingCost + toolingCost + overheadCost + packingCost
	return Number(total.toFixed(4))
}
export async function calculatePartCost(
	materialCost: number,
	manufacturingCost: number,
	toolingCost: number,
	overheadCost: number,
	packingCost: number,
	tariffCost: number,
	freightCost: number
): Promise<number> {
	const total =
		materialCost +
		manufacturingCost +
		toolingCost +
		overheadCost +
		packingCost +
		tariffCost +
		freightCost

	// Match UI precision
	return Number(total.toFixed(4))
}
export async function getCurrencyNumber(
	locator: Locator,
	label?: string
): Promise<number> {
	let raw = ''

	try {
		raw = await locator.inputValue() // works if input
	} catch {
		raw = await locator.innerText() // works if td/div/span
	}

	raw = raw.replace(/\s+/g, ' ').trim()

	const match = raw.match(/(\d+(\.\d+)?)/)

	if (!match) {
		// If element contains only currency symbol or is empty, return 0
		logger.info(
			`⚠️ No number found in ${label ?? 'element'}: "${raw}" - defaulting to 0`
		)
		return 0
	}

	const value = Number(match[1])
	logger.info(`✅ ${label ?? 'Value'} parsed = ${value}`)
	return value
}

export async function getCellNumber(locator: Locator): Promise<number> {
	const raw = await locator.innerText()
	// Extract first number in the string (handles "$0.1595", "0.1595 $", etc.)
	const match = raw.match(/[\d,.]+/)

	if (!match) {
		// If cell contains only currency symbol or is empty, return 0
		logger.info(`⚠️ No number found in cell text: "${raw}" - defaulting to 0`)
		return 0
	}

	return Number(match[0].replace(/,/g, '')) // remove commas if any
}
export async function getCellNumberFromTd(locator: Locator): Promise<number> {
	const raw = await locator.innerText()
	const match = raw.match(/[\d,.]+/) // extract first number

	if (!match) {
		// If cell contains only currency symbol or is empty, return 0
		logger.info(`⚠️ No number found in td text: "${raw}" - defaulting to 0`)
		return 0
	}

	return Number(match[0].replace(/,/g, ''))
}

export async function getNumber(locator: Locator): Promise<number> {
	const element = await locator.elementHandle()
	if (!element) throw new Error('Element not found')

	const tagName = await element.evaluate(el => el.tagName.toLowerCase())

	let raw = ''

	if (tagName === 'input' || tagName === 'textarea') {
		raw = await locator.inputValue()
	} else {
		raw = await locator.innerText()
	}

	const match = raw.match(/-?[\d,.]+/)

	if (!match) {
		throw new Error(`❌ Failed to extract number from text: "${raw}"`)
	}

	return Number(match[0].replace(/,/g, ''))
}

export async function getTotalCostByType(
	page: Page,
	type: 'Primary' | 'Secondary' | 'Tertiary'
): Promise<number> {
	const cells = page.locator(
		"//table[@aria-describedby='packagingTable']" +
		`//tr[.//td[normalize-space()='${type}']]` +
		"//td[contains(@class,'cdk-column-cost')]"
	)

	const count = await cells.count()
	if (count === 0) {
		throw new Error(`❌ No cost cells found for type: ${type}`)
	}

	let total = 0

	for (let i = 0; i < count; i++) {
		const rawText = (await cells.nth(i).innerText()).trim()
		const match = rawText.match(/-?[\d,.]+/)

		if (!match) {
			throw new Error(`❌ Unable to extract number from text: "${rawText}"`)
		}

		total += Number(match[0].replace(/,/g, ''))
	}

	return Number(total.toFixed(4))
}
export class VerificationHelper {
	static getPrecisionFromUI(uiText: string): number {
		const normalized = uiText.replace(/,/g, '').trim()
		return normalized.includes('.') ? normalized.split('.')[1].length : 0
	}
}