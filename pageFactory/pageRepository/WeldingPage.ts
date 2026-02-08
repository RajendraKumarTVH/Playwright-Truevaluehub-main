import { PartComplexity } from 'shared/enums' // Assuming you have your enums file
import { ProcessInfoDto, MaterialInfo } from 'shared/models' // Assuming you have your models

export class PlasticRubberProcessCalculator {
	// Mocking the Config Service Data (Since we don't have the external file)
	private kFactorRubberIM = [
		{ materialType: 'TypeA', kFactor: 1.5 }, // Add actual types here
		{ materialType: 'TypeB', kFactor: 1.8 }
	]

	/**
	 * REPLICATED LOGIC: Injection Moulding
	 */
	public calculationsForInjectionMoulding(
		manufactureInfo: ProcessInfoDto,
		fieldColorsList: any, // In automation, this might be a list of fields we explicitly want to treat as 'overridden'
		manufacturingObj: ProcessInfoDto // The previous state or snapshot
	): ProcessInfoDto {
		// Safety checks for material info
		const matInfo = manufactureInfo.materialInfoList?.[0]

		manufactureInfo.density = matInfo?.density ?? 0
		manufactureInfo.noOfInsert = matInfo?.noOfInserts ?? 0
		manufactureInfo.grossWeight = matInfo?.grossWeight ?? 0
		manufactureInfo.wallAverageThickness = matInfo?.wallAverageThickness ?? 0
		manufactureInfo.noOfCavities = matInfo?.noOfCavities ?? 0
		manufactureInfo.netMaterialCost = matInfo?.netMatCost ?? 0
		manufactureInfo.netPartWeight = matInfo?.netWeight ?? 0
		manufactureInfo.rawmaterialCost = matInfo?.netMatCost ?? 0
		manufactureInfo.projArea = matInfo?.runnerProjectedArea ?? 0
		manufactureInfo.partProjArea = matInfo?.partProjectedArea ?? 0

		manufactureInfo.shotSize = manufactureInfo.machineMaster?.shotSize || 0

		manufactureInfo.recBedSize =
			manufactureInfo.platenSizeLength && manufactureInfo.platenSizeWidth
				? Math.round(manufactureInfo.platenSizeLength) +
				  ' x ' +
				  Math.round(manufactureInfo.platenSizeWidth)
				: ''

		manufactureInfo.selectedBedSize =
			manufactureInfo.machineMaster?.platenLengthmm &&
			manufactureInfo.machineMaster?.platenWidthmm
				? manufactureInfo.machineMaster?.platenLengthmm +
				  ' x ' +
				  manufactureInfo.machineMaster?.platenWidthmm
				: ''

		const injecRate = this.isValidNumber(
			(Number(manufactureInfo?.machineMaster?.injectionRate) *
				Number(manufactureInfo.density)) /
				1000
		)
		const shotweight = this.isValidNumber(
			manufactureInfo.grossWeight * manufactureInfo.noOfCavities
		)
		const materialInjectionFillTime = this.isValidNumber(
			shotweight / Number(injecRate)
		)
		manufactureInfo.materialInjectionFillTime = materialInjectionFillTime

		// Cooling Time
		if (
			manufactureInfo.iscoolingTimeDirty &&
			manufactureInfo.coolingTime != null
		) {
			manufactureInfo.coolingTime = Number(manufactureInfo.coolingTime)
		} else {
			let coolingTime = this.isValidNumber(
				(Math.pow(Number(manufactureInfo.wallAverageThickness), 2) /
					(2 * 3.141592654) /
					Number(manufactureInfo.thermalDiffusivity)) *
					Math.log(
						(4 / 3.141592654) *
							((Number(manufactureInfo.meltTemp) -
								Number(manufactureInfo.mouldTemp)) /
								(Number(manufactureInfo.ejecTemp) -
									Number(manufactureInfo.mouldTemp)))
					)
			)

			if (manufactureInfo?.wallAverageThickness < 5) {
				coolingTime = this.isValidNumber(1 * Number(coolingTime))
			} else if (
				manufactureInfo?.wallAverageThickness >= 5 &&
				manufactureInfo?.wallAverageThickness <= 10
			) {
				coolingTime = this.isValidNumber(0.65 * Number(coolingTime))
			} else if (
				manufactureInfo?.wallAverageThickness >= 10 &&
				manufactureInfo?.wallAverageThickness <= 15
			) {
				coolingTime = this.isValidNumber(0.5 * Number(coolingTime))
			} else if (manufactureInfo?.wallAverageThickness > 15) {
				coolingTime = this.isValidNumber(0.42 * Number(coolingTime))
			}

			// Check Dirty Logic
			if (manufactureInfo.coolingTime != null) {
				coolingTime = this.checkDirtyProperty(
					'coolingTime',
					fieldColorsList,
					manufacturingObj
				)
					? manufacturingObj?.coolingTime
					: coolingTime
			}
			manufactureInfo.coolingTime = coolingTime
		}

		// Inserts Placement
		if (
			manufactureInfo.isInsertsPlacementDirty &&
			manufactureInfo.insertsPlacement !== null
		) {
			manufactureInfo.insertsPlacement = Number(
				manufactureInfo.insertsPlacement
			)
		} else {
			let insertsPlacement = this.isValidNumber(
				2.5 * manufactureInfo.noOfInsert
			)
			if (manufactureInfo.insertsPlacement !== null) {
				insertsPlacement = this.checkDirtyProperty(
					'insertsPlacement',
					fieldColorsList,
					manufacturingObj
				)
					? manufacturingObj?.insertsPlacement
					: insertsPlacement
			}
			manufactureInfo.insertsPlacement = insertsPlacement
		}

		// Part Ejection
		if (
			manufactureInfo.isPartEjectionDirty &&
			manufactureInfo.partEjection != null
		) {
			manufactureInfo.partEjection = Number(manufactureInfo.partEjection)
		} else {
			let partEjection =
				manufactureInfo?.partComplexity == PartComplexity.Low
					? 3
					: manufactureInfo?.partComplexity == PartComplexity.Medium
					? 5.5
					: manufactureInfo?.partComplexity == PartComplexity.High
					? 8
					: 0
			if (manufactureInfo.partEjection != null) {
				partEjection = this.checkDirtyProperty(
					'partEjection',
					fieldColorsList,
					manufacturingObj
				)
					? manufacturingObj?.partEjection
					: this.isValidNumber(partEjection)
			}
			manufactureInfo.partEjection = partEjection
		}

		// Side Core Mechanisms
		if (
			manufactureInfo.isSideCoreMechanismsDirty &&
			manufactureInfo.sideCoreMechanisms != null
		) {
			manufactureInfo.sideCoreMechanisms = Number(
				manufactureInfo.sideCoreMechanisms
			)
		} else {
			let sideCoreMechanisms =
				manufactureInfo?.partComplexity == PartComplexity.Low
					? 2
					: manufactureInfo?.partComplexity == PartComplexity.Medium
					? 4
					: manufactureInfo?.partComplexity == PartComplexity.High
					? 8
					: 0
			if (manufactureInfo.sideCoreMechanisms != null) {
				sideCoreMechanisms = this.checkDirtyProperty(
					'sideCoreMechanisms',
					fieldColorsList,
					manufacturingObj
				)
					? manufacturingObj?.sideCoreMechanisms
					: sideCoreMechanisms
			}
			manufactureInfo.sideCoreMechanisms = sideCoreMechanisms
		}

		// Others
		if (manufactureInfo.isOthersDirty && manufactureInfo.others != null) {
			manufactureInfo.others = Number(manufactureInfo.others)
		} else {
			manufactureInfo.others = this.checkDirtyProperty(
				'others',
				fieldColorsList,
				manufacturingObj
			)
				? manufacturingObj?.others
				: this.isValidNumber(manufactureInfo.others)
		}

		const packAndHoldTime =
			manufactureInfo?.partComplexity == PartComplexity.Low
				? 1
				: manufactureInfo?.partComplexity == PartComplexity.Medium
				? 2
				: manufactureInfo?.partComplexity == PartComplexity.High
				? 3
				: 5
		manufactureInfo.packAndHoldTime = packAndHoldTime

		// Injection Time
		if (
			manufactureInfo.isinjectionTimeDirty &&
			manufactureInfo.injectionTime != null
		) {
			manufactureInfo.injectionTime = Number(manufactureInfo.injectionTime)
		} else {
			let injectionTime =
				Number(manufactureInfo.packAndHoldTime) +
				Number(manufactureInfo.materialInjectionFillTime)
			if (manufactureInfo.injectionTime != null) {
				injectionTime = this.checkDirtyProperty(
					'injectionTime',
					fieldColorsList,
					manufacturingObj
				)
					? manufacturingObj?.injectionTime
					: this.isValidNumber(injectionTime)
			}
			manufactureInfo.injectionTime = injectionTime
		}

		// Dry Cycle Time
		if (
			manufactureInfo.isDryCycleTimeDirty &&
			manufactureInfo.dryCycleTime != null
		) {
			manufactureInfo.dryCycleTime = Number(manufactureInfo.dryCycleTime)
		} else {
			manufactureInfo.dryCycleTime = this.checkDirtyProperty(
				'dryCycleTime',
				fieldColorsList,
				manufacturingObj
			)
				? manufacturingObj?.dryCycleTime
				: this.isValidNumber(manufactureInfo.dryCycleTime)
		}

		// Total Time
		if (
			manufactureInfo.isTotalTimeDirty &&
			manufactureInfo.totalTime !== null
		) {
			manufactureInfo.totalTime = Number(manufactureInfo.totalTime)
		} else {
			let totalTime = this.isValidNumber(
				Number(manufactureInfo.insertsPlacement) +
					Number(manufactureInfo.sideCoreMechanisms) +
					Number(manufactureInfo.injectionTime) +
					Number(manufactureInfo.partEjection) +
					Number(manufactureInfo.others) +
					Number(manufactureInfo.coolingTime) +
					Number(manufactureInfo.dryCycleTime)
			)
			if (manufactureInfo.totalTime !== null) {
				totalTime = this.checkDirtyProperty(
					'totalTime',
					fieldColorsList,
					manufacturingObj
				)
					? manufacturingObj?.totalTime
					: totalTime
			}
			manufactureInfo.totalTime = totalTime
		}

		// Cycle Time
		if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
			manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime)
		} else {
			let cycleTime = this.isValidNumber(
				(Number(manufactureInfo.insertsPlacement) +
					Number(manufactureInfo.sideCoreMechanisms) +
					Number(manufactureInfo.injectionTime) +
					Number(manufactureInfo.partEjection) +
					Number(manufactureInfo.others) +
					Number(manufactureInfo.coolingTime) +
					Number(manufactureInfo.dryCycleTime)) /
					(manufactureInfo?.materialInfoList?.length > 0
						? manufactureInfo?.materialInfoList[0]?.noOfCavities
						: 1)
			)
			if (manufactureInfo.cycleTime != null) {
				cycleTime = this.checkDirtyProperty(
					'cycleTime',
					fieldColorsList,
					manufacturingObj
				)
					? manufacturingObj?.cycleTime
					: cycleTime
			}
			manufactureInfo.cycleTime = cycleTime
		}

		// Direct Machine Cost
		if (
			manufactureInfo.isdirectMachineCostDirty &&
			manufactureInfo.directMachineCost != null
		) {
			manufactureInfo.directMachineCost = Number(
				manufactureInfo.directMachineCost
			)
		} else {
			let directMachineCost = this.isValidNumber(
				(Number(manufactureInfo.machineHourRate) / 3600) *
					manufactureInfo.cycleTime *
					manufactureInfo.efficiency
			)
			if (manufactureInfo.directMachineCost != null) {
				directMachineCost = this.checkDirtyProperty(
					'directMachineCost',
					fieldColorsList,
					manufacturingObj
				)
					? manufacturingObj?.directMachineCost
					: directMachineCost
			}
			manufactureInfo.directMachineCost = directMachineCost
		}

		// Setup time
		if (manufactureInfo.issetUpTimeDirty && !!manufactureInfo.setUpTime) {
			manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime)
		} else {
			let setUpTime = 60
			if (manufactureInfo.setUpTime != null) {
				setUpTime = this.checkDirtyProperty(
					'setUpTime',
					fieldColorsList,
					manufacturingObj
				)
					? manufacturingObj?.setUpTime
					: setUpTime
			}
			manufactureInfo.setUpTime = setUpTime
		}

		// Low Skilled Labors
		if (
			manufactureInfo.isNoOfLowSkilledLaboursDirty &&
			manufactureInfo.noOfLowSkilledLabours != null
		) {
			manufactureInfo.noOfLowSkilledLabours = Number(
				manufactureInfo.noOfLowSkilledLabours
			)
		} else {
			manufactureInfo.noOfLowSkilledLabours = this.checkDirtyProperty(
				'noOfLowSkilledLabours',
				fieldColorsList,
				manufacturingObj
			)
				? manufacturingObj?.noOfLowSkilledLabours
				: this.isValidNumber(manufactureInfo.noOfLowSkilledLabours)
		}

		manufactureInfo.lowSkilledLaborRatePerHour = this.isValidNumber(
			manufactureInfo.lowSkilledLaborRatePerHour
		)

		// Direct Labor Cost
		if (
			manufactureInfo.isdirectLaborCostDirty &&
			manufactureInfo.directLaborCost !== null
		) {
			manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost)
		} else {
			let directLaborCost = this.isValidNumber(
				(Number(manufactureInfo.noOfLowSkilledLabours) *
					manufactureInfo.cycleTime *
					(Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600)) /
					manufactureInfo?.efficiency +
					(Number(manufactureInfo.noOfSkilledLabours) *
						manufactureInfo.cycleTime *
						(Number(manufactureInfo.skilledLaborRatePerHour) / 3600)) /
						manufactureInfo?.efficiency
			)

			if (manufactureInfo.directLaborCost !== null) {
				directLaborCost = this.checkDirtyProperty(
					'directLaborCost',
					fieldColorsList,
					manufacturingObj
				)
					? manufacturingObj?.directLaborCost
					: directLaborCost
			}
			manufactureInfo.directLaborCost = directLaborCost
		}

		// Inspection Cost
		if (
			manufactureInfo.isinspectionCostDirty &&
			manufactureInfo.inspectionCost != null
		) {
			manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost)
		} else {
			let inspectionCost = this.isValidNumber(
				Number(manufactureInfo.samplingRate / 100) *
					((Number(manufactureInfo.inspectionTime) *
						Number(manufactureInfo.qaOfInspectorRate)) /
						3600)
			)
			if (manufactureInfo.inspectionCost != null) {
				inspectionCost = this.checkDirtyProperty(
					'inspectionCost',
					fieldColorsList,
					manufacturingObj
				)
					? manufacturingObj?.inspectionCost
					: inspectionCost
			}
			manufactureInfo.inspectionCost = inspectionCost
		}

		// Direct Setup Cost
		if (
			manufactureInfo.isdirectSetUpCostDirty &&
			manufactureInfo.directSetUpCost != null
		) {
			manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost)
		} else {
			let directSetUpCost = this.isValidNumber(
				((Number(manufactureInfo.lowSkilledLaborRatePerHour) +
					Number(manufactureInfo.machineHourRate)) *
					(Number(manufactureInfo.setUpTime) / 60)) /
					manufactureInfo.lotSize
			)
			if (manufactureInfo.directSetUpCost != null) {
				directSetUpCost = this.checkDirtyProperty(
					'directSetUpCost',
					fieldColorsList,
					manufacturingObj
				)
					? manufacturingObj?.setUpCost
					: directSetUpCost
			}
			manufactureInfo.directSetUpCost = directSetUpCost
		}

		// Yield Cost
		if (manufactureInfo.isyieldCostDirty && manufactureInfo.yieldCost != null) {
			manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost)
		} else {
			const sum = this.isValidNumber(
				Number(manufactureInfo.directMachineCost) +
					Number(manufactureInfo.directSetUpCost) +
					Number(manufactureInfo.directLaborCost) +
					Number(manufactureInfo.inspectionCost)
			)
			manufactureInfo.netMaterialCost =
				manufactureInfo.materialInfoList?.length > 0
					? manufactureInfo.materialInfoList[0]?.netMatCost
					: 0
			let yieldCost = this.isValidNumber(
				(1 - Number(manufactureInfo.yieldPer) / 100) *
					(Number(manufactureInfo.netMaterialCost) -
						(Number(manufactureInfo.netPartWeight) *
							Number(manufactureInfo.materialInfo.scrapPrice)) /
							1000 +
						sum)
			)
			if (manufactureInfo.yieldCost != null) {
				yieldCost = this.checkDirtyProperty(
					'yieldCost',
					fieldColorsList,
					manufacturingObj
				)
					? manufacturingObj?.yieldCost
					: yieldCost
			}
			manufactureInfo.yieldCost = yieldCost
		}

		const processCost = this.isValidNumber(
			Number(manufactureInfo.directLaborCost) +
				Number(manufactureInfo.directMachineCost) +
				Number(manufactureInfo.directSetUpCost) +
				Number(manufactureInfo.inspectionCost) +
				Number(manufactureInfo.yieldCost)
		)

		manufactureInfo.directTooling = this.isValidNumber(
			(Number(manufactureInfo.directLaborCost) +
				Number(manufactureInfo.directMachineCost) +
				Number(manufactureInfo.directSetUpCost)) *
				0.01
		)
		manufactureInfo.directProcessCost = processCost
		manufactureInfo.conversionCost = processCost
		manufactureInfo.partCost =
			manufactureInfo.rawmaterialCost + manufactureInfo.conversionCost

		return manufactureInfo
	}

	/**
	 * REPLICATED LOGIC: Rubber Injection Moulding
	 */
	public calculationsForRubberInjectionMoulding(
		manufactureInfo: ProcessInfoDto,
		fieldColorsList: any,
		manufacturingObj: ProcessInfoDto
	): ProcessInfoDto {
		const matInfo = manufactureInfo.materialInfoList?.[0]

		manufactureInfo.density = matInfo?.density ?? 0
		manufactureInfo.noOfInsert = matInfo?.noOfInserts ?? 0
		manufactureInfo.grossWeight = matInfo?.grossWeight ?? 0
		manufactureInfo.wallAverageThickness = matInfo?.wallAverageThickness ?? 0
		manufactureInfo.noOfCavities = matInfo?.noOfCavities ?? 0
		manufactureInfo.netMaterialCost = matInfo?.netMatCost ?? 0
		manufactureInfo.netPartWeight = matInfo?.netWeight ?? 0
		manufactureInfo.rawmaterialCost = matInfo?.netMatCost ?? 0
		manufactureInfo.projArea = matInfo?.runnerProjectedArea ?? 0
		manufactureInfo.partProjArea = matInfo?.partProjectedArea ?? 0

		const materialInfo = matInfo // Alias for code below

		const cavityPressure =
			materialInfo?.materialMasterData?.clampingPressure || 0
		manufactureInfo.cavityPressure = cavityPressure
		const recommendTonnage = Math.ceil(
			((materialInfo?.runnerProjectedArea +
				(materialInfo?.partProjectedArea || materialInfo?.projectedArea)) *
				materialInfo?.noOfCavities *
				cavityPressure *
				1.15) /
				1000
		)
		manufactureInfo.recommendTonnage = this.isValidNumber(recommendTonnage)
		manufactureInfo.selectedTonnage =
			manufactureInfo?.machineMaster?.machineTonnageTons || 0

		// Insert Placement Time
		if (
			manufactureInfo.isInsertsPlacementDirty &&
			manufactureInfo.insertsPlacement !== null
		) {
			manufactureInfo.insertsPlacement = Number(
				manufactureInfo.insertsPlacement
			)
		} else {
			let insertsPlacement =
				manufactureInfo.noOfInsert <= 0
					? 0
					: manufactureInfo.noOfInsert <= 5
					? 4
					: manufactureInfo.noOfInsert <= 12
					? 8
					: manufactureInfo.noOfInsert <= 20
					? 15
					: 25
			if (manufactureInfo.insertsPlacement !== null) {
				insertsPlacement = this.checkDirtyProperty(
					'insertsPlacement',
					fieldColorsList,
					manufacturingObj
				)
					? manufacturingObj?.insertsPlacement
					: insertsPlacement
			}
			manufactureInfo.insertsPlacement = insertsPlacement
		}

		// Open Close Time / Dry Cycle
		if (
			manufactureInfo.isDryCycleTimeDirty &&
			manufactureInfo.dryCycleTime != null
		) {
			manufactureInfo.dryCycleTime = Number(manufactureInfo.dryCycleTime)
		} else {
			let moldClosingOpenTime =
				manufactureInfo.selectedTonnage >= 45 &&
				manufactureInfo.selectedTonnage <= 180
					? 10
					: manufactureInfo.selectedTonnage >= 220 &&
					  manufactureInfo.selectedTonnage <= 300
					? 12
					: manufactureInfo.selectedTonnage > 300
					? 16
					: 0

			if (manufactureInfo.insertsPlacement !== null) {
				moldClosingOpenTime = this.checkDirtyProperty(
					'dryCycleTime',
					fieldColorsList,
					manufacturingObj
				)
					? manufacturingObj?.dryCycleTime
					: moldClosingOpenTime
			}
			manufactureInfo.dryCycleTime = moldClosingOpenTime
		}

		// Injection Time
		if (
			manufactureInfo.isinjectionTimeDirty &&
			manufactureInfo.injectionTime !== null
		) {
			manufactureInfo.injectionTime = Number(manufactureInfo.injectionTime)
		} else {
			let injectionTime = this.isValidNumber(
				((materialInfo.runnerVolume + materialInfo.partVolume) *
					manufactureInfo.noOfCavities) /
					60000
			)
			if (manufactureInfo.injectionTime !== null) {
				injectionTime = this.checkDirtyProperty(
					'injectionTime',
					fieldColorsList,
					manufacturingObj
				)
					? manufacturingObj?.injectionTime
					: this.isValidNumber(injectionTime)
			}
			manufactureInfo.injectionTime = injectionTime
		}

		const materialType =
			manufactureInfo?.materialmasterDatas?.materialType?.materialTypeName

		// Curing Time / Side Core
		if (
			manufactureInfo.isSideCoreMechanismsDirty &&
			manufactureInfo.sideCoreMechanisms != null
		) {
			manufactureInfo.sideCoreMechanisms = Number(
				manufactureInfo.sideCoreMechanisms
			)
		} else {
			// Replaced Config Service lookup with local array lookup
			let kFact =
				this.kFactorRubberIM.find(item => item.materialType === materialType)
					?.kFactor ?? 1.5

			let curingTime = this.isValidNumber(
				kFact * Math.pow(materialInfo.wallThickessMm, 2) * 1.3
			)

			if (manufactureInfo.sideCoreMechanisms !== null) {
				curingTime = this.checkDirtyProperty(
					'sideCoreMechanisms',
					fieldColorsList,
					manufacturingObj
				)
					? manufacturingObj?.sideCoreMechanisms
					: curingTime
			}
			manufactureInfo.sideCoreMechanisms = curingTime
		}

		// Holding Time / Cooling Time
		if (
			manufactureInfo.iscoolingTimeDirty &&
			manufactureInfo.coolingTime !== null
		) {
			manufactureInfo.coolingTime = Number(manufactureInfo.coolingTime)
		} else {
			let holdingTime = this.isValidNumber(
				manufactureInfo.sideCoreMechanisms * 0.3
			)
			if (manufactureInfo.coolingTime !== null) {
				holdingTime = this.checkDirtyProperty(
					'coolingTime',
					fieldColorsList,
					manufacturingObj
				)
					? manufacturingObj?.coolingTime
					: holdingTime
			}
			manufactureInfo.coolingTime = holdingTime
		}

		// Part Ejection Time
		if (
			manufactureInfo.isPartEjectionDirty &&
			manufactureInfo.partEjection !== null
		) {
			manufactureInfo.partEjection = Number(manufactureInfo.partEjection)
		} else {
			let partEjection = this.isValidNumber(materialInfo?.noOfCavities * 1.2)
			if (manufactureInfo.partEjection !== null) {
				partEjection = this.checkDirtyProperty(
					'partEjection',
					fieldColorsList,
					manufacturingObj
				)
					? manufacturingObj?.partEjection
					: this.isValidNumber(partEjection)
			}
			manufactureInfo.partEjection = partEjection
		}

		// Total Time
		if (
			manufactureInfo.isTotalTimeDirty &&
			manufactureInfo.totalTime !== null
		) {
			manufactureInfo.totalTime = Number(manufactureInfo.totalTime)
		} else {
			let totalTime = this.isValidNumber(
				Number(manufactureInfo.insertsPlacement) +
					Number(manufactureInfo.sideCoreMechanisms) +
					Number(manufactureInfo.injectionTime) +
					Number(manufactureInfo.partEjection) +
					Number(manufactureInfo.coolingTime) +
					Number(manufactureInfo.dryCycleTime)
			)
			if (manufactureInfo.totalTime !== null) {
				totalTime = this.checkDirtyProperty(
					'totalTime',
					fieldColorsList,
					manufacturingObj
				)
					? manufacturingObj?.totalTime
					: totalTime
			}
			manufactureInfo.totalTime = totalTime
		}

		// Cycle Time
		if (
			manufactureInfo.iscycleTimeDirty &&
			manufactureInfo.cycleTime !== null
		) {
			manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime)
		} else {
			// Note: 'others' might be undefined in rubber flow based on code provided, default to 0 in calculation
			let cycleTime = this.isValidNumber(
				(Number(manufactureInfo.insertsPlacement) +
					Number(manufactureInfo.sideCoreMechanisms) +
					Number(manufactureInfo.injectionTime) +
					Number(manufactureInfo.partEjection) +
					Number(manufactureInfo.others || 0) +
					Number(manufactureInfo.coolingTime) +
					Number(manufactureInfo.dryCycleTime)) /
					(manufactureInfo?.materialInfoList?.length > 0
						? manufactureInfo?.materialInfoList[0]?.noOfCavities
						: 1)
			)
			if (manufactureInfo.cycleTime !== null) {
				cycleTime = this.checkDirtyProperty(
					'cycleTime',
					fieldColorsList,
					manufacturingObj
				)
					? manufacturingObj?.cycleTime
					: cycleTime
			}
			manufactureInfo.cycleTime = cycleTime
		}

		// Direct Machine Cost
		if (
			manufactureInfo.isdirectMachineCostDirty &&
			manufactureInfo.directMachineCost !== null
		) {
			manufactureInfo.directMachineCost = Number(
				manufactureInfo.directMachineCost
			)
		} else {
			let directMachineCost = this.isValidNumber(
				(Number(manufactureInfo.machineHourRate) / 3600) *
					manufactureInfo.cycleTime *
					manufactureInfo.efficiency
			)
			if (manufactureInfo.directMachineCost !== null) {
				directMachineCost = this.checkDirtyProperty(
					'directMachineCost',
					fieldColorsList,
					manufacturingObj
				)
					? manufacturingObj?.directMachineCost
					: directMachineCost
			}
			manufactureInfo.directMachineCost = directMachineCost
		}

		// Setup time
		if (manufactureInfo.issetUpTimeDirty && !!manufactureInfo.setUpTime) {
			manufactureInfo.setUpTime = Number(manufactureInfo.setUpTime)
		} else {
			let setUpTime = 60
			if (manufactureInfo.setUpTime !== null) {
				setUpTime = this.checkDirtyProperty(
					'setUpTime',
					fieldColorsList,
					manufacturingObj
				)
					? manufacturingObj?.setUpTime
					: setUpTime
			}
			manufactureInfo.setUpTime = setUpTime
		}

		// Direct Labors
		if (
			manufactureInfo.isNoOfLowSkilledLaboursDirty &&
			manufactureInfo.noOfLowSkilledLabours !== null
		) {
			manufactureInfo.noOfLowSkilledLabours = Number(
				manufactureInfo.noOfLowSkilledLabours
			)
		} else {
			manufactureInfo.noOfLowSkilledLabours = this.checkDirtyProperty(
				'noOfLowSkilledLabours',
				fieldColorsList,
				manufacturingObj
			)
				? manufacturingObj?.noOfLowSkilledLabours
				: this.isValidNumber(manufactureInfo.noOfLowSkilledLabours)
		}

		manufactureInfo.lowSkilledLaborRatePerHour = this.isValidNumber(
			manufactureInfo.lowSkilledLaborRatePerHour
		)

		// Direct Labor Cost
		if (
			manufactureInfo.isdirectLaborCostDirty &&
			manufactureInfo.directLaborCost !== null
		) {
			manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost)
		} else {
			let directLaborCost = this.isValidNumber(
				(Number(manufactureInfo.noOfLowSkilledLabours) *
					manufactureInfo.cycleTime *
					(Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600)) /
					manufactureInfo?.efficiency +
					(Number(manufactureInfo.noOfSkilledLabours) *
						manufactureInfo.cycleTime *
						(Number(manufactureInfo.skilledLaborRatePerHour) / 3600)) /
						manufactureInfo?.efficiency
			)
			if (manufactureInfo.directLaborCost !== null) {
				directLaborCost = this.checkDirtyProperty(
					'directLaborCost',
					fieldColorsList,
					manufacturingObj
				)
					? manufacturingObj?.directLaborCost
					: directLaborCost
			}
			manufactureInfo.directLaborCost = directLaborCost
		}

		// Inspection Cost
		if (
			manufactureInfo.isinspectionCostDirty &&
			manufactureInfo.inspectionCost !== null
		) {
			manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost)
		} else {
			let inspectionCost = this.isValidNumber(
				Number(manufactureInfo.samplingRate / 100) *
					((Number(manufactureInfo.inspectionTime) *
						Number(manufactureInfo.qaOfInspectorRate)) /
						3600)
			)
			if (manufactureInfo.inspectionCost !== null) {
				inspectionCost = this.checkDirtyProperty(
					'inspectionCost',
					fieldColorsList,
					manufacturingObj
				)
					? manufacturingObj?.inspectionCost
					: inspectionCost
			}
			manufactureInfo.inspectionCost = inspectionCost
		}

		// Direct Setup Cost
		if (
			manufactureInfo.isdirectSetUpCostDirty &&
			manufactureInfo.directSetUpCost !== null
		) {
			manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost)
		} else {
			let directSetUpCost = this.isValidNumber(
				((Number(manufactureInfo.lowSkilledLaborRatePerHour) +
					Number(manufactureInfo.machineHourRate)) *
					(Number(manufactureInfo.setUpTime) / 60)) /
					manufactureInfo.lotSize
			)
			if (manufactureInfo.directSetUpCost !== null) {
				directSetUpCost = this.checkDirtyProperty(
					'directSetUpCost',
					fieldColorsList,
					manufacturingObj
				)
					? manufacturingObj?.setUpCost
					: directSetUpCost
			}
			manufactureInfo.directSetUpCost = directSetUpCost
		}

		// Yield Cost
		if (
			manufactureInfo.isyieldCostDirty &&
			manufactureInfo.yieldCost !== null
		) {
			manufactureInfo.yieldCost = Number(manufactureInfo.yieldCost)
		} else {
			const sum = this.isValidNumber(
				Number(manufactureInfo.directMachineCost) +
					Number(manufactureInfo.directSetUpCost) +
					Number(manufactureInfo.directLaborCost) +
					Number(manufactureInfo.inspectionCost)
			)
			manufactureInfo.netMaterialCost =
				manufactureInfo.materialInfoList?.length > 0
					? manufactureInfo.materialInfoList[0]?.netMatCost
					: 0
			let yieldCost = this.isValidNumber(
				(1 - Number(manufactureInfo.yieldPer) / 100) *
					(Number(manufactureInfo.netMaterialCost) -
						(Number(manufactureInfo.netPartWeight) *
							Number(manufactureInfo.materialInfo.scrapPrice)) /
							1000 +
						sum)
			)
			if (manufactureInfo.yieldCost !== null) {
				yieldCost = this.checkDirtyProperty(
					'yieldCost',
					fieldColorsList,
					manufacturingObj
				)
					? manufacturingObj?.yieldCost
					: yieldCost
			}
			manufactureInfo.yieldCost = yieldCost
		}

		const processCost = this.isValidNumber(
			Number(manufactureInfo.directLaborCost) +
				Number(manufactureInfo.directMachineCost) +
				Number(manufactureInfo.directSetUpCost) +
				Number(manufactureInfo.inspectionCost) +
				Number(manufactureInfo.yieldCost)
		)

		manufactureInfo.directTooling = this.isValidNumber(
			(Number(manufactureInfo.directLaborCost) +
				Number(manufactureInfo.directMachineCost) +
				Number(manufactureInfo.directSetUpCost)) *
				0.01
		)
		manufactureInfo.directProcessCost = processCost
		manufactureInfo.conversionCost = processCost
		manufactureInfo.partCost =
			manufactureInfo.rawmaterialCost + manufactureInfo.conversionCost

		return manufactureInfo
	}

	// --- HELPER METHODS (Replaces SharedService) ---

	/**
	 * Replaces SharedService.isValidNumber
	 * Checks if a number is valid (not NaN, not Infinity). Returns 0 if invalid.
	 */
	private isValidNumber(val: any): number {
		if (val === null || val === undefined) return 0
		const num = Number(val)
		if (isNaN(num) || !isFinite(num)) return 0
		return num
	}

	/**
	 * Replaces SharedService.checkDirtyProperty
	 * In automation, we usually pass `fieldColorsList` as an array of strings representing fields
	 * that the user has manually overridden.
	 */
	private checkDirtyProperty(
		propertyName: string,
		fieldColorsList: any,
		manufacturingObj: any
	): boolean {
		// Logic: If the property is in the "dirty list", we should prefer the value from manufacturingObj (the previous state)
		// rather than the newly calculated value.
		if (!fieldColorsList || !manufacturingObj) return false

		// Assuming fieldColorsList is an array of strings (e.g. ['coolingTime', 'cycleTime'])
		if (Array.isArray(fieldColorsList)) {
			return fieldColorsList.includes(propertyName)
		}

		// If it's an object/map
		return !!fieldColorsList[propertyName]
	}
}
