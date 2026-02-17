// Playwright-compatible imports - using test models instead of Angular models
import { ContainerSize } from '../models/container-size.model'
import { MaterialInfoDto, PartInfoDto, BuLocationDto } from '../models'
import { FreightCostCalcResponseDto } from '../models/freight-cost-response'
import { ManualFreightCostRequestDto } from '../models/freight-cost-request'
import {
	ContainerTypeEnum,
	LogisticsSummaryDto,
	ModeOfTransportEnum,
	ShipmentTypeEnum
} from '../models/logistics-summary.model'
import { PackagingInfoDto } from '../models/packaging-info.model'
import { FieldColorsDto } from '../models/field-colors.model'
import { min } from 'lodash'
import { SharedService } from './shared'
import { DigitalFactoryDtoNew } from '../../src/app/modules/digital-factory/Models/digital-factory-dto'

// RxJS types (implementations are mocked in plastic-rubber-logic.ts)
import { Observable, of } from 'rxjs'
import { map } from 'rxjs/operators'

// Type definitions for services (actual implementations are mocked)
export interface NumberConversionService {
	transformNumberTwoDecimal(value: number): number
}

export interface LogisticsSummaryService {
	getOfflineFreightCost(dto: ManualFreightCostRequestDto): Observable<any>
}

export class LogisticsSummaryCalculatorService {
	constructor(
		private readonly _numberConversionService: NumberConversionService,
		private readonly logisticsSummaryService: LogisticsSummaryService,
		private readonly sharedService: SharedService
	) {}

	public getPercentageOfContainerRequired(
		modeOfTransportId: number,
		containerTypeId: number,
		shipmentTypeId: number,
		containerSize: ContainerSize[],
		part: PartInfoDto,
		materialList: MaterialInfoDto[],
		packagingInfo: PackagingInfoDto
	): any {
		const currentContainer = this.findBestMatchingContainer(
			modeOfTransportId,
			containerTypeId,
			shipmentTypeId,
			containerSize
		)
		const partsPerShipment = this.calculatePartsPerShipmentValue(
			part,
			packagingInfo
		)
		const totalShipmentWeight = this.calculateTotalShipmentWeight(
			materialList,
			partsPerShipment
		)
		const totalShipmentVolume = this.calculateTotalShipmentVolume(
			packagingInfo,
			materialList
		)
		const percentageOfShipment = this.calculatePercentageOfShipment(
			currentContainer,
			totalShipmentWeight,
			totalShipmentVolume
		)

		return {
			percentageOfShipment: percentageOfShipment,
			partsPerShipment: partsPerShipment
		}
	}

	private calculatePartsPerShipmentValue(
		part: PartInfoDto,
		packagingInfo: PackagingInfoDto
	): number {
		return packagingInfo?.partsPerShipment
			? packagingInfo.partsPerShipment
			: Math.floor((part.eav * part.deliveryFrequency) / 365)
	}

	private calculateTotalShipmentWeight(
		materialList: MaterialInfoDto[],
		partsPerShipment: number
	): number {
		let totalShipmentWeight = 0
		if (materialList) {
			for (const material of materialList) {
				if (material?.netWeight) {
					totalShipmentWeight += partsPerShipment * material?.netWeight
				}
			}
		}
		return totalShipmentWeight
	}

	private calculateTotalShipmentVolume(
		packagingInfo: PackagingInfoDto,
		materialList: MaterialInfoDto[]
	): number {
		let totalShipmentVolume = this.calculateVolumeFromPackaging(packagingInfo)

		if (
			!totalShipmentVolume &&
			Array.isArray(materialList) &&
			materialList.length > 0
		) {
			totalShipmentVolume = this.calculateVolumeFromMaterials(materialList)
		}
		return totalShipmentVolume
	}

	private calculateVolumeFromPackaging(
		packagingInfo: PackagingInfoDto
	): number {
		let volume = 0
		if (Array.isArray(packagingInfo?.adnlProtectPkgs)) {
			packagingInfo.adnlProtectPkgs.forEach(pkg => {
				if (pkg.packagingTypeId === 3) {
					const { lengthInMm, widthInMm, heightInMm, qtyNeededPerShipment } =
						pkg
					if (lengthInMm && widthInMm && heightInMm && qtyNeededPerShipment) {
						volume +=
							(lengthInMm * widthInMm * heightInMm * qtyNeededPerShipment) /
							1000
					}
				}
			})
		}
		return volume
	}

	private calculateVolumeFromMaterials(
		materialList: MaterialInfoDto[]
	): number {
		let volume = 0
		for (const material of materialList) {
			const dimX = Number(material?.dimX) || 0
			const dimY = Number(material?.dimY) || 0
			const dimZ = Number(material?.dimZ) || 0
			if (dimX && dimY && dimZ) {
				const perPartVolume = dimX * dimY * dimZ * 0.000000001
				volume += perPartVolume
			}
		}
		return volume
	}

	private calculatePercentageOfShipment(
		currentContainer: ContainerSize | undefined,
		totalShipmentWeight: number,
		totalShipmentVolume: number
	): number {
		if (!currentContainer) {
			return 0
		}

		let maxShipmentVolumePerContainer = 0
		let maxShipmentWeightPerContainer = 0

		if (currentContainer.maxVolume > 0 && totalShipmentVolume) {
			maxShipmentVolumePerContainer =
				(currentContainer.maxVolume * 0.8) / totalShipmentVolume
		}
		if (currentContainer.maxWeight > 0 && totalShipmentWeight) {
			maxShipmentWeightPerContainer =
				currentContainer.maxWeight / totalShipmentWeight
		}

		const shipmentPerContainer = min([
			maxShipmentWeightPerContainer,
			maxShipmentVolumePerContainer
		])

		return shipmentPerContainer > 0
			? Number((1 / shipmentPerContainer) * 100)
			: 0
	}

	public partPerShipment(part: PartInfoDto, packagingInfo: PackagingInfoDto) {
		if (packagingInfo?.partsPerShipment) {
			const partsPerShipment = packagingInfo.partsPerShipment
			return partsPerShipment
		} else {
			const partsPerShipment = Math.floor(
				(part.eav / part.deliveryFrequency) * 365
			)
			return partsPerShipment
		}
	}

	public perUnitCost(shipmentCost: number, partsPerShipment: number) {
		const perUnitCost = this._numberConversionService.transformNumberTwoDecimal(
			shipmentCost / partsPerShipment
		)
		return perUnitCost
	}

	public carbonFootPrint(
		totalCarbonFootPrint: number,
		containerPercent: number
	) {
		const carbonFootPrint = Math.round(
			totalCarbonFootPrint * (containerPercent / 100)
		)
		return carbonFootPrint
	}

	public perUnitesg(shipmentEsg: number, partsPerShipment: number) {
		const perUnitesg = this._numberConversionService.transformNumberTwoDecimal(
			shipmentEsg / partsPerShipment
		)
		return perUnitesg
	}

	public getWeightAndVolume(
		materialList: MaterialInfoDto[],
		part: PartInfoDto,
		packagingInfo: PackagingInfoDto
	) {
		let weightPerShipment = 0
		let volumePerShipment = 0
		if (materialList?.length > 0) {
			for (const material of materialList) {
				const partsPerShipment = this.partPerShipment(part, packagingInfo)
				if (material?.netWeight && partsPerShipment) {
					weightPerShipment +=
						partsPerShipment *
						//Convert gms to kg
						(Number(material?.netWeight) / 1000)
				}
				const volume =
					Number(material?.dimX) *
					Number(material?.dimY) *
					Number(material?.dimZ) *
					0.000000001 //convert cubic mm to cubic m

				volumePerShipment += volume
			}
		}
		return {
			weight: weightPerShipment,
			volume: volumePerShipment
		}
	}

	getCostCalculation(params: {
		modeOfTransportTypeId: number
		containerTypeId: number
		shipmentTypeId: number
		currentVendor: DigitalFactoryDtoNew
		currentBuLocation: BuLocationDto
		containerSize: ContainerSize[]
		part: PartInfoDto
		materialList: MaterialInfoDto[]
		originCountryId: number
		packagingInfo: PackagingInfoDto
	}): Observable<FreightCostCalcResponseDto> {
		const dto = this.buildFreightCostDto(params)

		const containerInfo = this.getPercentageOfContainerRequired(
			params.modeOfTransportTypeId,
			params.containerTypeId,
			params.shipmentTypeId,
			params.containerSize,
			params.part,
			params.materialList,
			params.packagingInfo
		)
		containerInfo.percentageOfShipment = this.sharedService.isValidNumber(
			containerInfo.percentageOfShipment
		)

		if (
			!this.isValidFreightRequest(
				dto,
				params.currentVendor,
				params.currentBuLocation
			)
		) {
			return of(
				this.buildErrorFreightCost(
					params.modeOfTransportTypeId,
					params.containerTypeId,
					params.shipmentTypeId,
					containerInfo
				)
			)
		}

		return this.logisticsSummaryService
			.getOfflineFreightCost(dto)
			.pipe(
				map((result: any) =>
					this.mapFreightCostResult(
						result,
						containerInfo,
						params.modeOfTransportTypeId,
						params.containerTypeId,
						params.shipmentTypeId
					)
				)
			)
	}

	private buildFreightCostDto(params: {
		modeOfTransportTypeId: number
		containerTypeId: number
		shipmentTypeId: number
		currentVendor: DigitalFactoryDtoNew
		currentBuLocation: BuLocationDto
		part: PartInfoDto
		materialList: MaterialInfoDto[]
		originCountryId: number
		packagingInfo: PackagingInfoDto
	}): ManualFreightCostRequestDto {
		const dto = new ManualFreightCostRequestDto()
		dto.modeOfTransportTypeId = params.modeOfTransportTypeId
		this.setShipmentAndContainerTypes(
			dto,
			params.modeOfTransportTypeId,
			params.containerTypeId,
			params.shipmentTypeId
		)

		dto.originCountryId = params.originCountryId
		dto.destinationCountryId = params.part.deliveryCountryId
		dto.originCity =
			params.currentVendor?.supplierDirectoryMasterDto?.city ?? ''
		dto.destinationCity = params.currentBuLocation?.city ?? ''
		dto.annualShipment = 1
		dto.part = params.part
		dto.incoTerm = 'EXW'
		dto.sourceCoordinates = this.buildCoordinates(
			params.currentVendor?.supplierDirectoryMasterDto?.latitude,
			params.currentVendor?.supplierDirectoryMasterDto?.longitude
		)
		dto.destinationCoordinates = this.buildCoordinates(
			params.currentBuLocation?.latitude,
			params.currentBuLocation?.longitude
		)

		const weightVolume = this.getWeightAndVolume(
			params.materialList,
			params.part,
			params.packagingInfo
		)
		const rawWeight = weightVolume.weight
		dto.weightPerShipment =
			!Number.isFinite(rawWeight) || rawWeight == null ? 0 : rawWeight
		dto.volumePerShipment = weightVolume.volume

		return dto
	}

	private setShipmentAndContainerTypes(
		dto: ManualFreightCostRequestDto,
		modeOfTransportTypeId: number,
		containerTypeId: number,
		shipmentTypeId: number
	): void {
		if (modeOfTransportTypeId == ModeOfTransportEnum.Surface) {
			dto.landShipmentTypeId = shipmentTypeId
			dto.landContainerTypeId = containerTypeId
		} else if (modeOfTransportTypeId == ModeOfTransportEnum.Air) {
			dto.landShipmentTypeId = ShipmentTypeEnum.FTL
			dto.landContainerTypeId = ContainerTypeEnum.Container20Ft
			dto.airShipmentTypeId = shipmentTypeId
			dto.airContainerTypeId = containerTypeId
		} else if (modeOfTransportTypeId == ModeOfTransportEnum.Ocean) {
			dto.oceanShipmentTypeId = shipmentTypeId
			dto.oceanContainerTypeId = containerTypeId
			dto.landShipmentTypeId =
				dto.oceanShipmentTypeId == ShipmentTypeEnum.FCL
					? ShipmentTypeEnum.FTL
					: ShipmentTypeEnum.LTL
			dto.landContainerTypeId = this.getLandContainerType(containerTypeId)
		}
	}

	private getLandContainerType(
		oceanContainerTypeId: number
	): ContainerTypeEnum {
		if (oceanContainerTypeId == ContainerTypeEnum.Container20Ft) {
			return ContainerTypeEnum.Container20Ft
		} else if (oceanContainerTypeId == ContainerTypeEnum.Container40Ft) {
			return ContainerTypeEnum.Container40Ft
		} else {
			return ContainerTypeEnum.LTL
		}
	}

	private buildCoordinates(latitude: any, longitude: any): string {
		if (latitude && longitude) {
			return latitude.toString() + ',' + longitude.toString()
		}
		return ''
	}

	private isValidFreightRequest(
		dto: ManualFreightCostRequestDto,
		currentVendor: DigitalFactoryDtoNew,
		currentBuLocation: BuLocationDto
	): boolean {
		return !(
			currentVendor == undefined ||
			currentBuLocation == undefined ||
			!dto.destinationCoordinates ||
			!dto.originCity ||
			!dto.destinationCity ||
			!dto.modeOfTransportTypeId
		)
	}

	private buildErrorFreightCost(
		modeOfTransportTypeId: number,
		containerTypeId: number,
		shipmentTypeId: number,
		containerInfo: any
	): FreightCostCalcResponseDto {
		const freightCost = new FreightCostCalcResponseDto()
		freightCost.containerTypeId = containerTypeId
		freightCost.shipmentTypeId = shipmentTypeId
		freightCost.modeOfTransportId = modeOfTransportTypeId
		freightCost.freightCostPerShipment = this.sharedService.isValidNumber(0)
		freightCost.freightCostPerPart = this.sharedService.isValidNumber(
			0 / containerInfo.partsPerShipment
		)
		freightCost.percentageOfShipment = this.sharedService.isValidNumber(
			containerInfo.percentageOfShipment
		)
		freightCost.partsPerShipment = this.sharedService.isValidNumber(
			containerInfo.partsPerShipment
		)
		freightCost.containerCost = this.sharedService.isValidNumber(
			containerInfo.totalAnnualCost
		)
		return freightCost
	}

	private mapFreightCostResult(
		result: any,
		containerInfo: any,
		modeOfTransportTypeId: number,
		containerTypeId: number,
		shipmentTypeId: number
	): FreightCostCalcResponseDto {
		const freightCost = { ...result }
		if (freightCost?.sourceToPortCost) {
			freightCost.sourceToPortCost = this.sharedService.isValidNumber(
				result.sourceToPortCost
			)
		}
		if (!freightCost?.deliveryCost) {
			freightCost.deliveryCost = this.sharedService.isValidNumber(
				result.portToDestinationCost
			)
		}
		freightCost.containerCost = this.sharedService.isValidNumber(
			result.containerCost
		)
		const pershipmentCost =
			result.totalAnnualCost * (containerInfo.percentageOfShipment / 100)
		freightCost.freightCostPerShipment =
			this.sharedService.isValidNumber(pershipmentCost)
		freightCost.freightCostPerPart = this.sharedService.isValidNumber(
			pershipmentCost / containerInfo.partsPerShipment
		)
		freightCost.percentageOfShipment = this.sharedService.isValidNumber(
			containerInfo.percentageOfShipment
		)
		freightCost.partsPerShipment = this.sharedService.isValidNumber(
			containerInfo.partsPerShipment
		)
		freightCost.containerTypeId = containerTypeId
		freightCost.shipmentTypeId = shipmentTypeId
		freightCost.modeOfTransportId = modeOfTransportTypeId
		return freightCost
	}

	calculateLogisticsCost(
		logistic: LogisticsSummaryDto,
		dirtyList: FieldColorsDto[],
		summaryObj: LogisticsSummaryDto
	): Observable<LogisticsSummaryDto> {
		this.calculateContainerPercent(logistic, summaryObj, dirtyList)
		this.calculateContainerCost(logistic, summaryObj, dirtyList)
		this.calculateFreightCostPerShipment(logistic, summaryObj, dirtyList)
		const partsPerShipment = this.calculatePartsPerShipment(logistic)
		this.calculateFreightCost(logistic, summaryObj, dirtyList, partsPerShipment)
		return new Observable(obs => {
			obs.next(logistic)
		})
	}

	private calculateContainerPercent(
		logistic: LogisticsSummaryDto,
		summaryObj: LogisticsSummaryDto,
		dirtyList: FieldColorsDto[]
	): void {
		if (
			logistic?.isContainerPercentDirty &&
			logistic?.containerPercent != null
		) {
			logistic.containerPercent = Number(logistic.containerPercent)
		} else {
			let containerPercent =
				logistic.containerPercent ?? summaryObj?.containerPercent
			if (logistic?.containerPercent != null) {
				containerPercent = this.checkDirtyProperty(
					'ContainerPercent',
					dirtyList
				)
					? summaryObj?.containerPercent
					: containerPercent
			}
			logistic.containerPercent = containerPercent
		}
	}

	private calculateContainerCost(
		logistic: LogisticsSummaryDto,
		summaryObj: LogisticsSummaryDto,
		dirtyList: FieldColorsDto[]
	): void {
		if (logistic?.isContainerCostDirty && logistic?.containerCost != null) {
			logistic.containerCost = Number(logistic.containerCost)
		} else {
			let containerCost = logistic?.containerCost ?? summaryObj?.containerCost
			if (logistic?.containerCost != null) {
				containerCost = this.checkDirtyProperty('ContainerCost', dirtyList)
					? summaryObj?.containerCost
					: containerCost
			}
			logistic.containerCost = containerCost
		}
	}

	private calculateFreightCostPerShipment(
		logistic: LogisticsSummaryDto,
		summaryObj: LogisticsSummaryDto,
		dirtyList: FieldColorsDto[]
	): void {
		if (
			logistic?.isFreightCostPerShipmentDirty &&
			logistic?.freightCostPerShipment != null
		) {
			logistic.freightCostPerShipment = Number(logistic.freightCostPerShipment)
		} else {
			let freightCostPerShipment =
				logistic?.containerCost == null || logistic?.containerPercent == null
					? this.sharedService.isValidNumber(
							Number(summaryObj?.containerCost) *
								(Number(summaryObj?.containerPercent) / 100)
						)
					: this.sharedService.isValidNumber(
							Number(logistic.containerCost) *
								(Number(logistic.containerPercent) / 100)
						)

			if (logistic?.freightCostPerShipment != null) {
				freightCostPerShipment = this.checkDirtyProperty(
					'FreightCostPerShipment',
					dirtyList
				)
					? summaryObj?.freightCostPerShipment
					: freightCostPerShipment
			}
			logistic.freightCostPerShipment = freightCostPerShipment
		}
	}

	private calculatePartsPerShipment(logistic: LogisticsSummaryDto): number {
		if (logistic?.packagingInfo?.partsPerShipment) {
			return Number(logistic?.packagingInfo.partsPerShipment)
		}
		return this.sharedService.isValidNumber(
			Math.ceil(
				(Number(logistic?.currentPart?.deliveryFrequency) / 365) *
					logistic?.currentPart?.eav
			)
		)
	}

	private calculateFreightCost(
		logistic: LogisticsSummaryDto,
		summaryObj: LogisticsSummaryDto,
		dirtyList: FieldColorsDto[],
		partsPerShipment: number
	): void {
		if (logistic?.isFreightCostDirty && logistic?.freightCost != null) {
			logistic.freightCost = Number(logistic.freightCost)
		} else {
			let freightCost =
				logistic?.freightCostPerShipment == null
					? this.sharedService.isValidNumber(
							summaryObj?.freightCostPerShipment / partsPerShipment
						)
					: this.sharedService.isValidNumber(
							logistic.freightCostPerShipment / partsPerShipment
						)

			if (logistic?.freightCost != null) {
				freightCost = this.checkDirtyProperty('FreightCost', dirtyList)
					? summaryObj?.freightCost
					: freightCost
			}
			logistic.freightCost = freightCost
		}
	}

	calculateLogisticsCostDirtyCheckOnly(
		logistic: LogisticsSummaryDto,
		dirtyList: FieldColorsDto[],
		summaryObj: LogisticsSummaryDto
	): Observable<LogisticsSummaryDto> {
		this.applyDirtyCheckProperty(
			logistic,
			summaryObj,
			dirtyList,
			'ContainerPercent',
			'containerPercent',
			'isContainerPercentDirty'
		)
		this.applyDirtyCheckProperty(
			logistic,
			summaryObj,
			dirtyList,
			'ContainerCost',
			'containerCost',
			'isContainerCostDirty'
		)
		this.applyDirtyCheckProperty(
			logistic,
			summaryObj,
			dirtyList,
			'FreightCostPerShipment',
			'freightCostPerShipment',
			'isFreightCostPerShipmentDirty'
		)
		this.applyDirtyCheckProperty(
			logistic,
			summaryObj,
			dirtyList,
			'FreightCost',
			'freightCost',
			'isFreightCostDirty'
		)

		return new Observable(obs => {
			obs.next(logistic)
		})
	}

	private applyDirtyCheckProperty(
		logistic: LogisticsSummaryDto,
		summaryObj: LogisticsSummaryDto,
		dirtyList: FieldColorsDto[],
		dirtyPropertyName: string,
		propertyName: string,
		isDirtyFlagName: string
	): void {
		const isDirtyFlag = (logistic as any)[isDirtyFlagName]
		const currentValue = (logistic as any)[propertyName]
		const summaryValue = (summaryObj as any)[propertyName]

		if (isDirtyFlag && currentValue != null) {
			;(logistic as any)[propertyName] = Number(currentValue)
		} else {
			if (
				currentValue != null &&
				this.checkDirtyProperty(dirtyPropertyName, dirtyList)
			) {
				;(logistic as any)[propertyName] = summaryValue
			}
		}
	}

	private checkDirtyProperty(formCotrolName: string, fieldList: any[]) {
		let res = false
		if (fieldList) {
			const info = fieldList.filter(
				x => x.formControlName == formCotrolName && x.isDirty
			)
			if (info.length > 0) {
				res = true
			}
		}
		return res
	}

	private findBestMatchingContainer(
		modeOfTransportId: number,
		containerTypeId: number,
		shipmentTypeId: number,
		containerSize: ContainerSize[]
	): ContainerSize | undefined {
		const numModeId = Number(modeOfTransportId)
		const numContainerId = Number(containerTypeId)
		const numShipmentId = Number(shipmentTypeId)

		// Exact match: mode + containerType + shipmentType
		let match = containerSize.find(
			x =>
				x.modeOfTransportId === numModeId &&
				x.containerTypeId === numContainerId &&
				x.shipmentTypeId === numShipmentId
		)
		if (match) return match

		// Match by mode + shipmentType
		match = containerSize.find(
			x =>
				x.modeOfTransportId === numModeId && x.shipmentTypeId === numShipmentId
		)
		if (match) return match

		// Match by mode + containerType
		match = containerSize.find(
			x =>
				x.modeOfTransportId === numModeId &&
				x.containerTypeId === numContainerId
		)
		if (match) return match

		// Fallback to any container for the mode
		match = containerSize.find(x => x.modeOfTransportId === numModeId)
		if (match) return match

		// Final fallback: use the first available container
		return containerSize.length > 0 ? containerSize[0] : undefined
	}
}
