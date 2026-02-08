// Enums
export enum PartComplexity {
	Low = 1,
	Medium = 2,
	High = 3
}

export enum ProcessType {
	SeamWelding = 88,
	SpotWelding = 59,
	MigWelding = 39,
	StickWelding = 209,
	TigWelding = 67,
	WeldingPreparation = 176,
	WeldingCleaning = 177
}

export enum PrimaryProcessType {
	SeamWelding = 88,
	SpotWelding = 77,
	MigWelding = 57,
	StickWelding = 78,
	TigWelding = 58
}

export enum MachineType {
	Automatic = 1,
	SemiAuto = 2,
	Manual = 3
}

// Interfaces
export interface LaborRateMasterDto {
	powerCost: number
	// Add others if needed by logic
	[key: string]: any
}

export interface ProcessInfoDto {
	processTypeID: number | string
	partComplexity: number
	materialInfoList: any[]
	machineMaster: any
	// Add other fields as Any for flexibility in this utility
	[key: string]: any
}

/** Weld details input interface */
export interface WeldInput {
	weldType: string
	weldSize: number
	weldLength: number
	noOfPasses?: number
	weldPlaces?: number
}
export interface PartDetailsInput {
	drawingNumber?: string
	revisionNumber?: string
	annualVolume?: number
	lotSize?: number
	productLife?: number
	partDescription?: string
}

export interface CostBreakdown {
	machineCost: number
	laborCost: number
	setupCost: number
	inspectionCost: number
	yieldCost: number
	powerCost: number
}
interface MaterialInfo {
	materialMarketData: {
		esgImpactCO2Kg: number;
		esgImpactCO2KgScrap: number;
	};
	grossWeight: number;
	scrapWeight: number;
	netWeight: number;
	eav: number;
}

interface ESGCalculationResult {
	esgImpactCO2Kg: number;
	esgImpactCO2KgScrap: number;
	esgImpactCO2KgPart: number;
	esgAnnualVolumeKg: number;
	esgAnnualKgCO2: number;
}

export interface SubProcessDetailsExpected {
	weld1: {
		weldType: string
		weldPosition: string
		travelSpeed?: number // Optional - will be calculated if not provided
		weldLength?: number // Optional - used for calculation
		weldSize?: number // Optional - used for calculation
		tackWelds: number
		intermediateStops: number
		weldCycleTime: number
	}
	weld2: {
		weldType: string
		weldPosition: string
		travelSpeed?: number // Optional - will be calculated if not provided
		weldLength?: number // Optional - used for calculation
		weldSize?: number // Optional - used for calculation
		tackWelds: number
		intermediateStops: number
		weldCycleTime: number
	}
	machineType?: 'Automatic' | 'Semi-Auto' | 'Manual' // Optional - used for calculation
}


export interface SubProcessTypeInfoDto {
	// Defined as any or partial
	[key: string]: any
}

// Shared Service Logic
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

// Costing Config
export class CostingConfig {
	weldingValuesForPartHandling(weldType = 'welding') {
		if (weldType === 'spotWelding') {
			return [
				{ id: 1, toPartWeight: 1, loading: 2, unloading: 2 },
				{ id: 2, toPartWeight: 4, loading: 5, unloading: 5 },
				{ id: 3, toPartWeight: 10, loading: 10, unloading: 10 },
				{ id: 4, toPartWeight: 25, loading: 20, unloading: 20 },
				{ id: 5, toPartWeight: 10000, loading: 60, unloading: 60 }
			]
		} else if (weldType === 'seamWelding') {
			return [
				{ id: 1, toPartWeight: 1, loading: 8, unloading: 8 },
				{ id: 2, toPartWeight: 5, loading: 16, unloading: 16 },
				{ id: 3, toPartWeight: 10, loading: 24, unloading: 24 },
				{ id: 4, toPartWeight: 20, loading: 32, unloading: 32 },
				{ id: 5, toPartWeight: 10000, loading: 60, unloading: 60 }
			]
		} else if (weldType === 'stickWelding') {
			return [
				{ id: 1, toPartWeight: 1, loading: 10, unloading: 10 },
				{ id: 2, toPartWeight: 4, loading: 30, unloading: 30 },
				{ id: 3, toPartWeight: 10, loading: 60, unloading: 60 },
				{ id: 4, toPartWeight: 25, loading: 90, unloading: 90 },
				{ id: 5, toPartWeight: 10000, loading: 180, unloading: 180 }
			]
		} else {
			return []
		}
	}

	weldingMachineValuesForSeamWelding() {
		return [
			{ id: 1, machine: 'FN-80-H', weldingEfficiency: 38.3333 },
			{ id: 2, machine: 'FN-100-H', weldingEfficiency: 34.5 },
			{ id: 3, machine: 'FN-160-H', weldingEfficiency: 31.05 },
			{ id: 4, machine: 'FN-100-E', weldingEfficiency: 27.945 },
			{ id: 5, machine: 'FN-160-E', weldingEfficiency: 25.1505 }
		]
	}

	spotWeldingValuesForMachineType() {
		return [
			{
				id: 1,
				toPartThickness: 0.254,
				weldForce: 353,
				weldTime: 4,
				holdTime: 5,
				weldCurrent: { 6: 4000, 12: 3200, 18: 2600 },
				openCircuitVoltage: 1.6
			},
			{
				id: 2,
				toPartThickness: 0.5334,
				weldForce: 538,
				weldTime: 6,
				holdTime: 8,
				weldCurrent: { 6: 6500, 12: 5200, 18: 4225 },
				openCircuitVoltage: 1.6
			},
			{
				id: 3,
				toPartThickness: 0.7874,
				weldForce: 719,
				weldTime: 8,
				holdTime: 10,
				weldCurrent: { 6: 8000, 12: 6400, 18: 5200 },
				openCircuitVoltage: 1.6
			},
			{
				id: 4,
				toPartThickness: 1.016,
				weldForce: 908,
				weldTime: 10,
				holdTime: 12,
				weldCurrent: { 6: 8800, 12: 7040, 18: 5720 },
				openCircuitVoltage: 1.6
			},
			{
				id: 5,
				toPartThickness: 1.27,
				weldForce: 1221,
				weldTime: 14,
				holdTime: 16,
				weldCurrent: { 6: 9600, 12: 7680, 18: 6240 },
				openCircuitVoltage: 1.6
			},
			{
				id: 6,
				toPartThickness: 1.5748,
				weldForce: 1477,
				weldTime: 18,
				holdTime: 20,
				weldCurrent: { 6: 10600, 12: 8480, 18: 6890 },
				openCircuitVoltage: 1.6
			},
			{
				id: 7,
				toPartThickness: 1.9812,
				weldForce: 1991,
				weldTime: 25,
				holdTime: 30,
				weldCurrent: { 6: 11800, 12: 9440, 18: 7670 },
				openCircuitVoltage: 1.6
			},
			{
				id: 8,
				toPartThickness: 2.3876,
				weldForce: 2557,
				weldTime: 34,
				holdTime: 35,
				weldCurrent: { 6: 13000, 12: 10400, 18: 8450 },
				openCircuitVoltage: 1.6
			},
			{
				id: 9,
				toPartThickness: 2.7686,
				weldForce: 3175,
				weldTime: 45,
				holdTime: 40,
				weldCurrent: { 6: 14200, 12: 11360, 18: 9230 },
				openCircuitVoltage: 1.6
			},
			{
				id: 10,
				toPartThickness: 3.175,
				weldForce: 3880,
				weldTime: 60,
				holdTime: 45,
				weldCurrent: { 6: 15600, 12: 12480, 18: 10140 },
				openCircuitVoltage: 1.6
			},
			{
				id: 11,
				toPartThickness: 3.9624,
				weldForce: 5512,
				weldTime: 93,
				holdTime: 50,
				weldCurrent: { 6: 18000, 12: 14400, 18: 11700 },
				openCircuitVoltage: 2.5
			},
			{
				id: 12,
				toPartThickness: 4.7498,
				weldForce: 7363,
				weldTime: 130,
				holdTime: 55,
				weldCurrent: { 6: 20500, 12: 16400, 18: 13325 },
				openCircuitVoltage: 2.5
			},
			{
				id: 13,
				toPartThickness: 6.35,
				weldForce: 12258,
				weldTime: 230,
				holdTime: 60,
				weldCurrent: { 6: 26000, 12: 20800, 18: 16900 },
				openCircuitVoltage: 3.55
			}
		]
	}

	weldingValuesForStickWelding() {
		return [
			{
				id: 1,
				ToPartThickness: 3.175,
				WireDiameter: 1.6,
				Current: 33,
				Voltage: 22.5,
				TravelSpeed: 1.25
			},
			{
				id: 2,
				ToPartThickness: 4.7625,
				WireDiameter: 2.4,
				Current: 83,
				Voltage: 23.5,
				TravelSpeed: 1.5
			},
			{
				id: 3,
				ToPartThickness: 6.35,
				WireDiameter: 3.2,
				Current: 120,
				Voltage: 23.5,
				TravelSpeed: 1.67
			},
			{
				id: 4,
				ToPartThickness: 8,
				WireDiameter: 4,
				Current: 165,
				Voltage: 24,
				TravelSpeed: 1.88
			},
			{
				id: 5,
				ToPartThickness: 9.525,
				WireDiameter: 4.8,
				Current: 208,
				Voltage: 25.5,
				TravelSpeed: 2
			},
			{
				id: 6,
				ToPartThickness: 12.7,
				WireDiameter: 6.4,
				Current: 313,
				Voltage: 26.5,
				TravelSpeed: 2.17
			},
			{
				id: 7,
				ToPartThickness: 10000,
				WireDiameter: 8,
				Current: 400,
				Voltage: 28,
				TravelSpeed: 2.5
			}
		]
	}

	tigWeldingValuesForMachineType() {
		return [
			{
				id: 1,
				FromPartThickness: 0,
				ToPartThickness: 1.6,
				WireDiameter: 1.6,
				Voltage: 15,
				Current: 90,
				WireFeed: 4,
				TravelSpeed: 4
			},
			{
				id: 1,
				FromPartThickness: 1.7,
				ToPartThickness: 3.2,
				WireDiameter: 2.4,
				Voltage: 18,
				Current: 130,
				WireFeed: 5.5,
				TravelSpeed: 4
			},
			{
				id: 1,
				FromPartThickness: 3.3,
				ToPartThickness: 4.8,
				WireDiameter: 3.2,
				Voltage: 18,
				Current: 225,
				WireFeed: 3.6,
				TravelSpeed: 4
			},
			{
				id: 1,
				FromPartThickness: 4.9,
				ToPartThickness: 100006.4,
				WireDiameter: 4.8,
				Voltage: 27,
				Current: 313,
				WireFeed: 7,
				TravelSpeed: 3
			},
			{
				id: 3,
				FromPartThickness: 0,
				ToPartThickness: 1.6,
				WireDiameter: 1.6,
				Voltage: 15,
				Current: 90,
				WireFeed: 3,
				TravelSpeed: 3
			},
			{
				id: 3,
				FromPartThickness: 1.7,
				ToPartThickness: 3.2,
				WireDiameter: 2.4,
				Voltage: 18,
				Current: 130,
				WireFeed: 4.125,
				TravelSpeed: 3
			},
			{
				id: 3,
				FromPartThickness: 3.3,
				ToPartThickness: 4.8,
				WireDiameter: 3.2,
				Voltage: 18,
				Current: 225,
				WireFeed: 2.7,
				TravelSpeed: 3
			},
			{
				id: 3,
				FromPartThickness: 4.9,
				ToPartThickness: 100006.4,
				WireDiameter: 4.8,
				Voltage: 27,
				Current: 312.5,
				WireFeed: 5.25,
				TravelSpeed: 3
			}
		]
	}

	weldingValuesForMachineType() {
		return [
			{
				id: 1,
				FromPartThickness: 0,
				ToPartThickness: 1,
				WireDiameter: 0.8,
				Voltage: 15,
				Current: 65,
				WireFeed: 4,
				TravelSpeed: 8
			},
			{
				id: 1,
				FromPartThickness: 1.1,
				ToPartThickness: 1.6,
				WireDiameter: 1,
				Voltage: 18,
				Current: 145,
				WireFeed: 5.5,
				TravelSpeed: 8.5
			},
			{
				id: 1,
				FromPartThickness: 1.7,
				ToPartThickness: 3,
				WireDiameter: 1.2,
				Voltage: 18,
				Current: 140,
				WireFeed: 3.6,
				TravelSpeed: 6.5
			},
			{
				id: 1,
				FromPartThickness: 3.1,
				ToPartThickness: 6,
				WireDiameter: 1.2,
				Voltage: 27,
				Current: 260,
				WireFeed: 7,
				TravelSpeed: 7.9
			},
			{
				id: 1,
				FromPartThickness: 6.1,
				ToPartThickness: 10,
				WireDiameter: 1.2,
				Voltage: 27,
				Current: 290,
				WireFeed: 3.6,
				TravelSpeed: 7.4
			},
			{
				id: 1,
				FromPartThickness: 10.1,
				ToPartThickness: 15,
				WireDiameter: 1.2,
				Voltage: 29.5,
				Current: 310,
				WireFeed: 11,
				TravelSpeed: 6.5
			},
			{
				id: 1,
				FromPartThickness: 15.1,
				ToPartThickness: 100000,
				WireDiameter: 2,
				Voltage: 35,
				Current: 400,
				WireFeed: 12,
				TravelSpeed: 7.8
			},
			{
				id: 3,
				FromPartThickness: 0,
				ToPartThickness: 1,
				WireDiameter: 0.8,
				Voltage: 15,
				Current: 65,
				WireFeed: 3,
				TravelSpeed: 6
			},
			{
				id: 3,
				FromPartThickness: 1.1,
				ToPartThickness: 1.6,
				WireDiameter: 1,
				Voltage: 18,
				Current: 145,
				WireFeed: 4.125,
				TravelSpeed: 6.38
			},
			{
				id: 3,
				FromPartThickness: 1.7,
				ToPartThickness: 3,
				WireDiameter: 1.2,
				Voltage: 18,
				Current: 140,
				WireFeed: 2.7,
				TravelSpeed: 4.88
			},
			{
				id: 3,
				FromPartThickness: 3.1,
				ToPartThickness: 6,
				WireDiameter: 1.2,
				Voltage: 27,
				Current: 260,
				WireFeed: 5.25,
				TravelSpeed: 5.93
			},
			{
				id: 3,
				FromPartThickness: 6.1,
				ToPartThickness: 10,
				WireDiameter: 1.2,
				Voltage: 27,
				Current: 290,
				WireFeed: 2.7,
				TravelSpeed: 5.55
			},
			{
				id: 3,
				FromPartThickness: 10.1,
				ToPartThickness: 15,
				WireDiameter: 1.2,
				Voltage: 29.5,
				Current: 310,
				WireFeed: 8.25,
				TravelSpeed: 4.88
			},
			{
				id: 3,
				FromPartThickness: 15.1,
				ToPartThickness: 100000,
				WireDiameter: 2,
				Voltage: 35,
				Current: 400,
				WireFeed: 9,
				TravelSpeed: 5.85
			}
		]
	}

	noOfTrackWeld(len: number): number {
		const weldList = [
			{ toLength: 100, noOfWeld: 2 },
			{ toLength: 250, noOfWeld: 3 },
			{ toLength: 500, noOfWeld: 4 },
			{ toLength: 1000, noOfWeld: 8 },
			{ toLength: 1500, noOfWeld: 12 },
			{ toLength: 2000, noOfWeld: 16 },
			{ toLength: 2500, noOfWeld: 20 },
			{ toLength: 3000, noOfWeld: 24 },
			{ toLength: 3500, noOfWeld: 30 },
			{ toLength: 4000, noOfWeld: 34 },
			{ toLength: 4500, noOfWeld: 38 },
			{ toLength: 5000, noOfWeld: 44 },
			{ toLength: 5500, noOfWeld: 50 },
			{ toLength: 6000, noOfWeld: 54 },
			{ toLength: 6500, noOfWeld: 58 },
			{ toLength: 7000, noOfWeld: 62 },
			{ toLength: 7500, noOfWeld: 68 },
			{ toLength: 8000, noOfWeld: 72 },
			{ toLength: 8500, noOfWeld: 76 },
			{ toLength: 9000, noOfWeld: 80 },
			{ toLength: 1000000, noOfWeld: 85 }
		]
		return (
			weldList.find(x => x.toLength >= len)?.noOfWeld ||
			weldList[weldList.length - 1].noOfWeld
		)
	}

	weldPass(len: number, weldType = 'welding'): number {
		let weldList = []
		if (weldType === 'stickWelding') {
			weldList = [
				{ toWeldLegLength: 3, noOfWeldPasses: 1 },
				{ toWeldLegLength: 6, noOfWeldPasses: 2 },
				{ toWeldLegLength: 10000, noOfWeldPasses: 3 }
			]
		} else {
			weldList = [
				{ toWeldLegLength: 8, noOfWeldPasses: 1 },
				{ toWeldLegLength: 12, noOfWeldPasses: 2 },
				{ toWeldLegLength: 10000, noOfWeldPasses: 0 }
			]
		}
		return (
			weldList.find(x => x.toWeldLegLength >= len)?.noOfWeldPasses ||
			weldList[weldList.length - 1].noOfWeldPasses
		)
	}

	weldingDefaultPercentage(
		processTypeId: number,
		partComplexity = 1,
		percentageType = 'yieldPercentage'
	) {
		const vals: any[] = [
			{
				processTypeId: ProcessType.TigWelding,
				yieldPercentage: { 1: 98, 2: 96, 3: 94 },
				samplingRate: { 1: 4, 2: 6, 3: 8 }
			},
			{
				processTypeId: ProcessType.SpotWelding,
				yieldPercentage: { 1: 97, 2: 95, 3: 93 },
				samplingRate: { 1: 4, 2: 6, 3: 8 }
			},
			{
				processTypeId: ProcessType.SeamWelding,
				yieldPercentage: { 1: 97, 2: 95, 3: 93 },
				samplingRate: { 1: 4, 2: 6, 3: 8 }
			},
			{
				processTypeId: ProcessType.MigWelding,
				yieldPercentage: { 1: 97, 2: 95, 3: 93 },
				samplingRate: { 1: 5, 2: 8, 3: 10 }
			},
			{
				processTypeId: ProcessType.StickWelding,
				yieldPercentage: { 1: 97, 2: 95, 3: 93 },
				samplingRate: { 1: 5, 2: 8, 3: 10 }
			},
			{
				processTypeId: 15,
				yieldPercentage: { 1: 97, 2: 95, 3: 93 },
				samplingRate: { 1: 4, 2: 6, 3: 8 }
			} // FrictionWelding
		]
		return (
			vals.find(x => x.processTypeId === processTypeId)?.[percentageType]?.[
			partComplexity
			] || vals[3]?.[percentageType]?.[partComplexity]
		)
	}

	weldingPositionList(weldType = 'welding') {
		if (weldType === 'stickWelding') {
			return [
				{
					id: 1,
					name: '1G Manual',
					EffeciencyAuto: 75,
					EffeciencyManual: 75,
					EffeciencySemiAuto: 75
				},
				{
					id: 2,
					name: '2G Manual',
					EffeciencyAuto: 65,
					EffeciencyManual: 65,
					EffeciencySemiAuto: 65
				},
				{
					id: 3,
					name: '3G Manual',
					EffeciencyAuto: 60,
					EffeciencyManual: 60,
					EffeciencySemiAuto: 60
				},
				{
					id: 4,
					name: '4G Manual',
					EffeciencyAuto: 50,
					EffeciencyManual: 50,
					EffeciencySemiAuto: 50
				},
				{
					id: 5,
					name: '1G Robotic',
					EffeciencyAuto: 85,
					EffeciencyManual: 85,
					EffeciencySemiAuto: 85
				},
				{
					id: 6,
					name: '2G Robotic',
					EffeciencyAuto: 75,
					EffeciencyManual: 75,
					EffeciencySemiAuto: 75
				},
				{
					id: 7,
					name: '3G Robotic',
					EffeciencyAuto: 70,
					EffeciencyManual: 70,
					EffeciencySemiAuto: 70
				},
				{
					id: 8,
					name: '4G Robotic',
					EffeciencyAuto: 60,
					EffeciencyManual: 60,
					EffeciencySemiAuto: 60
				}
			]
		} else {
			return [
				{
					id: 1,
					name: 'Flat',
					EffeciencyAuto: 80,
					EffeciencyManual: 70,
					EffeciencySemiAuto: 80
				},
				{
					id: 2,
					name: 'Horizontal',
					EffeciencyAuto: 80,
					EffeciencyManual: 70,
					EffeciencySemiAuto: 80
				},
				{
					id: 3,
					name: 'Vertical',
					EffeciencyAuto: 75,
					EffeciencyManual: 65,
					EffeciencySemiAuto: 75
				},
				{
					id: 4,
					name: 'OverHead',
					EffeciencyAuto: 75,
					EffeciencyManual: 65,
					EffeciencySemiAuto: 75
				}
			]
		}
	}

	getDiscBrushDia() {
		return [
			{
				materialType: 'Aluminium',
				partArea: 0,
				discBrush: 6,
				prepRPM: 3500,
				cleaningRPM: 3500
			},
			{
				materialType: 'Steel',
				partArea: 0,
				discBrush: 6,
				prepRPM: 3500,
				cleaningRPM: 3500
			}
		]
	}
}

// Additional Services
class WeldingConfigService {
	constructor(private costingConfig: CostingConfig) { }

	getWeldingEfficiency(formLength: number, isAutomated: boolean) {
		return isAutomated ? 0.9 : 0.85
	}

	getWeldingData(
		materialType: string,
		thickness: number,
		weldingProcess: number,
		weldingType: string
	) {
		return {
			TravelSpeed_mm_per_sec: 5,
			Current_Amps: 150,
			Voltage_Volts: 22,
			WireDiameter_mm: 1.2,
			TravelSpeed: 5,
			Voltage: 22,
			current: 150
		}
	}

	getUnloadingTime(weight: number) {
		return 10
	}

	defaultPercentages(
		processTypeId: number,
		partComplexity = 1,
		percentageType = 'yieldPercentage'
	) {
		return this.costingConfig.weldingDefaultPercentage(
			processTypeId,
			partComplexity,
			percentageType
		)
	}

	getDiscBrushDia() {
		return [
			{ materialType: 'Aluminium', discBrush: 20, prepRPM: 2300, cleaningRPM: 1150, discSurfaceArea: 314, partArea: 2000 },
			{ materialType: 'Aluminium', discBrush: 50, prepRPM: 1955, cleaningRPM: 978, discSurfaceArea: 1963, partArea: 10000 },
			{ materialType: 'Aluminium', discBrush: 70, prepRPM: 1662, cleaningRPM: 831, discSurfaceArea: 3848, partArea: 20000 },
			{ materialType: 'Aluminium', discBrush: 100, prepRPM: 1412, cleaningRPM: 706, discSurfaceArea: 7458, partArea: 50000 },
			{ materialType: 'Aluminium', discBrush: 120, prepRPM: 1201, cleaningRPM: 600, discSurfaceArea: 11310, partArea: 100000 },
			{ materialType: 'Aluminium', discBrush: 144, prepRPM: 1021, cleaningRPM: 510, discSurfaceArea: 16286, partArea: 100001 },

			{ materialType: 'Carbon Steel', discBrush: 20, prepRPM: 1600, cleaningRPM: 800, discSurfaceArea: 314, partArea: 2000 },
			{ materialType: 'Carbon Steel', discBrush: 50, prepRPM: 1360, cleaningRPM: 680, discSurfaceArea: 1963, partArea: 10000 },
			{ materialType: 'Carbon Steel', discBrush: 70, prepRPM: 1156, cleaningRPM: 578, discSurfaceArea: 3848, partArea: 20000 },
			{ materialType: 'Carbon Steel', discBrush: 100, prepRPM: 983, cleaningRPM: 491, discSurfaceArea: 7458, partArea: 50000 },
			{ materialType: 'Carbon Steel', discBrush: 120, prepRPM: 835, cleaningRPM: 418, discSurfaceArea: 11310, partArea: 100000 },
			{ materialType: 'Carbon Steel', discBrush: 144, prepRPM: 710, cleaningRPM: 355, discSurfaceArea: 16286, partArea: 100001 },

			{ materialType: 'Stainless Steel', discBrush: 20, prepRPM: 1200, cleaningRPM: 600, discSurfaceArea: 314, partArea: 2000 },
			{ materialType: 'Stainless Steel', discBrush: 50, prepRPM: 1020, cleaningRPM: 510, discSurfaceArea: 1963, partArea: 10000 },
			{ materialType: 'Stainless Steel', discBrush: 70, prepRPM: 867, cleaningRPM: 434, discSurfaceArea: 3848, partArea: 20000 },
			{ materialType: 'Stainless Steel', discBrush: 100, prepRPM: 737, cleaningRPM: 368, discSurfaceArea: 7458, partArea: 50000 },
			{ materialType: 'Stainless Steel', discBrush: 120, prepRPM: 626, cleaningRPM: 313, discSurfaceArea: 11310, partArea: 100000 },
			{ materialType: 'Stainless Steel', discBrush: 144, prepRPM: 532, cleaningRPM: 266, discSurfaceArea: 16286, partArea: 100001 },

			{ materialType: 'Copper', discBrush: 20, prepRPM: 1020, cleaningRPM: 510, discSurfaceArea: 314, partArea: 2000 },
			{ materialType: 'Copper', discBrush: 50, prepRPM: 867, cleaningRPM: 434, discSurfaceArea: 1963, partArea: 10000 },
			{ materialType: 'Copper', discBrush: 70, prepRPM: 737, cleaningRPM: 368, discSurfaceArea: 3848, partArea: 20000 },
			{ materialType: 'Copper', discBrush: 100, prepRPM: 626, cleaningRPM: 313, discSurfaceArea: 7458, partArea: 50000 },
			{ materialType: 'Copper', discBrush: 120, prepRPM: 532, cleaningRPM: 266, discSurfaceArea: 11310, partArea: 100000 },
			{ materialType: 'Copper', discBrush: 144, prepRPM: 453, cleaningRPM: 226, discSurfaceArea: 16286, partArea: 100001 },
		]
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
	private shareService: SharedService
	private _weldingConfig: WeldingConfigService
	private _costingConfig: CostingConfig
	public _smConfig: SheetMetalConfigService

	constructor() {
		this.shareService = new SharedService()
		this._costingConfig = new CostingConfig()
		this._weldingConfig = new WeldingConfigService(this._costingConfig)
		this._smConfig = new SheetMetalConfigService()
	}

	/**
	 * Calculate Lot Size from Annual Volume Quantity
	 * Formula: lotSize = annualVolumeQty / 12 (monthly lot sizing)
	 * @param annualVolumeQty - The annual volume quantity (EAV)
	 * @returns The calculated lot size, rounded to nearest integer
	 */
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
			x => x.processId === PrimaryProcessType.SeamWelding
		)
		manufactureInfo.netMaterialCost = materialInfo?.netMatCost
		manufactureInfo.netPartWeight = materialInfo?.netWeight

		!manufactureInfo.meltingWeight &&
			(manufactureInfo.meltingWeight = manufactureInfo.netPartWeight)

		const weldingPartHandlingValues = this._costingConfig
			.weldingValuesForPartHandling('seamWelding')
			.find(x => x.toPartWeight >= Number(manufactureInfo.meltingWeight) / 1000)
		const machineValues = this._costingConfig
			.weldingMachineValuesForSeamWelding()
			.find(
				x =>
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
			x => x.processId === PrimaryProcessType.SpotWelding
		)
		manufactureInfo.netMaterialCost = materialInfo?.netMatCost
		manufactureInfo.netPartWeight = materialInfo?.netWeight

		const partTickness = Number(materialInfo?.partTickness) || 0
		const weldingValues = this._costingConfig
			.spotWeldingValuesForMachineType()
			.find(x => x.toPartThickness >= partTickness)
		const weldingPartHandlingValues = this._costingConfig
			.weldingValuesForPartHandling('spotWelding')
			.find(x => x.toPartWeight >= Number(manufactureInfo.netPartWeight) / 1000)

		if (weldingValues) {
			manufactureInfo.requiredCurrent =
				(weldingValues.weldCurrent as Record<number, number>)[
				Number(materialInfo?.wireDiameter)
				] || 0
			manufactureInfo.requiredWeldingVoltage = weldingValues.openCircuitVoltage
			const holdTime = weldingValues?.holdTime / 60 / 0.75
			const squeezeTime = 3
			const offTime = 2
			!manufactureInfo.noOfWeldPasses && (manufactureInfo.noOfWeldPasses = 1)

			if (
				manufactureInfo.isUnloadingTimeDirty &&
				!!manufactureInfo.unloadingTime
			) {
				manufactureInfo.unloadingTime = Number(manufactureInfo.unloadingTime)
			} else {
				let unloadingTime =
					Number(manufactureInfo?.noOfWeldPasses) *
					(weldingPartHandlingValues?.loading || 0) +
					(weldingPartHandlingValues?.unloading || 0)
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

			if (
				manufactureInfo.isDryCycleTimeDirty &&
				!!manufactureInfo.dryCycleTime
			) {
				manufactureInfo.dryCycleTime = Number(manufactureInfo.dryCycleTime)
			} else {
				let dryCycleTime =
					(squeezeTime + holdTime + offTime) *
					(Number(manufactureInfo?.noOfTackWeld) || 0)
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

			if (manufactureInfo.iscycleTimeDirty && !!manufactureInfo.cycleTime) {
				manufactureInfo.cycleTime = this.shareService.isValidNumber(
					Number(manufactureInfo.cycleTime)
				)
			} else {
				let cycleTime =
					Number(manufactureInfo.dryCycleTime) +
					Number(manufactureInfo.unloadingTime)
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
		}

		this.weldingCommonCalc(
			manufactureInfo,
			fieldColorsList,
			manufacturingObj,
			laborRateDto
		)

		manufactureInfo.totalPowerCost = this.shareService.isValidNumber(
			((Number(manufactureInfo.dryCycleTime) / 3600) *
				Number(manufactureInfo.powerConsumption) *
				Number(manufactureInfo.electricityUnitCost)) /
			(Number(manufactureInfo.efficiency || 100) / 100)
		)

		return manufactureInfo
	}

	public calculationForWelding(
		manufactureInfo: ProcessInfoDto,
		fieldColorsList: any,
		manufacturingObj: ProcessInfoDto,
		laborRateDto: LaborRateMasterDto[]
	): ProcessInfoDto {
		this.weldingMode = 'welding'
		this.weldingPreCalc(manufactureInfo, fieldColorsList, manufacturingObj)

		let materialInfo = null
		let noOfTackWeld = 0
		let weldingValues = null
		let len = 0

		if (Number(manufactureInfo.processTypeID) === ProcessType.StickWelding) {
			this.weldingMode = 'stickWelding'
			materialInfo = manufactureInfo.materialInfoList.find(
				x => x.processId === PrimaryProcessType.StickWelding
			)
			len = materialInfo?.dimX || 0
			const partTickness = Number(materialInfo?.partTickness) || 0
			weldingValues = this._costingConfig
				.weldingValuesForStickWelding()
				.find(x => x.ToPartThickness >= partTickness)
			noOfTackWeld = this._costingConfig.noOfTrackWeld(len)
		} else if (
			Number(manufactureInfo.processTypeID) === ProcessType.TigWelding
		) {
			this.weldingMode = 'tigWelding'
			materialInfo = manufactureInfo.materialInfoList.find(
				x => x.processId === PrimaryProcessType.TigWelding
			)
			len = materialInfo?.dimX || 0
			const partTickness = Number(materialInfo?.partTickness) || 0
			weldingValues = this._costingConfig
				.tigWeldingValuesForMachineType()
				.find(
					x =>
						x.id === Number(manufactureInfo.semiAutoOrAuto) &&
						x.ToPartThickness >= partTickness
				)
			noOfTackWeld = len / 50
		} else if (
			Number(manufactureInfo.processTypeID) === ProcessType.MigWelding
		) {
			this.weldingMode = 'migWelding'
			materialInfo = manufactureInfo.materialInfoList.find(
				x => x.processId === PrimaryProcessType.MigWelding
			)
			len = materialInfo?.dimX || 0
			const partTickness = Number(materialInfo?.partTickness) || 0
			weldingValues = this._costingConfig
				.weldingValuesForMachineType()
				.find(
					x =>
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
			if (
				manufactureInfo.subProcessFormArray &&
				manufactureInfo.subProcessFormArray.controls
			) {
				for (
					let i = 0;
					i < manufactureInfo.subProcessFormArray.controls.length;
					i++
				) {
					const element = manufactureInfo.subProcessFormArray.controls[i]
					const subProcessInfo = element.value
					const efficiency = this._weldingConfig.getWeldingEfficiency(
						subProcessInfo.formLength,
						manufactureInfo.semiAutoOrAuto === 1
					)
					const weldingData = this._weldingConfig.getWeldingData(
						materialType,
						subProcessInfo.shoulderWidth,
						materialInfo?.processId,
						'Manual'
					)

					let travelSpeed =
						manufactureInfo.semiAutoOrAuto === 1
							? (weldingData?.TravelSpeed_mm_per_sec / 0.8) * efficiency
							: weldingData?.TravelSpeed_mm_per_sec * efficiency

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

					const cycleTimeForIntermediateStops =
						(subProcessInfo.formPerimeter || 0) * 5

					// totalWeldLength
					const totalWeldLength = this.shareService.isValidNumber(
						subProcessInfo.formLength
					)

					// HL Factor
					if (!subProcessInfo.hlFactor) {
						subProcessInfo.hlFactor = subProcessInfo.noOfHoles
					}
					const cycleTimeForTackWeld = subProcessInfo.hlFactor * 3

					subProcessInfo.recommendTonnage = this.shareService.isValidNumber(
						totalWeldLength / subProcessInfo.formHeight +
						cycleTimeForIntermediateStops +
						cycleTimeForTackWeld
					)

					const lengthOfCut = Number(subProcessInfo.lengthOfCut)
					if (lengthOfCut === 4) {
						subProcessInfo.recommendTonnage *= 0.95
					} else if (lengthOfCut === 5) {
						subProcessInfo.recommendTonnage *= 1.5
					}

					totalWeldCycleTime += subProcessInfo.recommendTonnage

					manufactureInfo.subProcessTypeInfos =
						manufactureInfo.subProcessTypeInfos || []
					manufactureInfo.subProcessTypeInfos.push(subProcessInfo)
				}
			}

			const weldingData = this._weldingConfig.getWeldingData(
				materialType,
				0,
				materialInfo?.processId,
				'Manual'
			)
			manufactureInfo.requiredCurrent = weldingData.Current_Amps
			manufactureInfo.requiredWeldingVoltage = weldingData.Voltage_Volts

			const loadingTime =
				this._weldingConfig.getUnloadingTime(materialInfo?.netWeight) || 0
			manufactureInfo.unloadingTime = loadingTime * 2 // load + unload

			const arcOnTime = totalWeldCycleTime + manufactureInfo.unloadingTime
			const arcOffTime = arcOnTime * 0.05
			// approx total
			const totWeldCycleTime =
				(manufactureInfo.noOfWeldPasses || 1) * loadingTime +
				arcOnTime +
				arcOffTime

			manufactureInfo.cycleTime =
				totWeldCycleTime / (manufactureInfo.efficiency / 100)

			// Power consumption
			manufactureInfo.powerConsumption =
				(Number(manufactureInfo.requiredCurrent) *
					Number(manufactureInfo.requiredWeldingVoltage)) /
				1000
			manufactureInfo.totalPowerCost = this.shareService.isValidNumber(
				(manufactureInfo.cycleTime / 3600) *
				Number(manufactureInfo.powerConsumption) *
				Number(manufactureInfo.electricityUnitCost)
			)
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
				let requiredCurrent = Number(weldingValues?.Current)
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

			const cycleTimeIntermediateStartAndStop =
				manufactureInfo.noOfIntermediateStartAndStop *
				(Number(manufactureInfo.processTypeID) === ProcessType.StickWelding
					? 3
					: 5)

			if (manufactureInfo.isnoOfTackWeldDirty && !!manufactureInfo.noOfTackWeld) {
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
						x => x.toPartWeight >= Number(manufactureInfo.netPartWeight) / 1000
					)

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
			}

			const weldingCycleTime = this.shareService.isValidNumber(
				(len / Number(manufactureInfo.travelSpeed)) *
				Number(manufactureInfo.noOfWeldPasses)
			)
			const totalWeldCycleTime =
				Number(weldingCycleTime) +
				Number(cycleTimeTrackWeld) +
				Number(cycleTimeIntermediateStartAndStop) +
				(Number(manufactureInfo.unloadingTime) || 0)

			const arcOnTime = this.shareService.isValidNumber(
				totalWeldCycleTime * 1.05
			)
			const arcOfTime = this.shareService.isValidNumber(arcOnTime * 0.05)
			let cycleTime = this.shareService.isValidNumber(arcOnTime + arcOfTime)

			if (
				manufactureInfo.isDryCycleTimeDirty &&
				!!manufactureInfo.dryCycleTime
			) {
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
		)
		return manufactureInfo
	}

	private weldingCommonCalc(
		manufactureInfo: ProcessInfoDto,
		fieldColorsList: any,
		manufacturingObj: ProcessInfoDto,
		laborRateDto: LaborRateMasterDto[]
	) {
		const curCycleTime =
			this.weldingMode === 'spotWelding'
				? Number(manufactureInfo.dryCycleTime)
				: Number(manufactureInfo.cycleTime)

		if (this.weldingMode !== 'seamWelding') {
			if (
				laborRateDto &&
				laborRateDto.length > 0 &&
				!manufactureInfo.electricityUnitCost
			) {
				manufactureInfo.electricityUnitCost = laborRateDto[0].powerCost
			}

			if (!manufactureInfo.powerConsumption) {
				manufactureInfo.powerConsumption =
					(Number(manufactureInfo.requiredCurrent) *
						Number(manufactureInfo.requiredWeldingVoltage)) /
					1000
			}

			manufactureInfo.totalPowerCost = this.shareService.isValidNumber(
				(curCycleTime / 3600) *
				Number(manufactureInfo.powerConsumption) *
				Number(manufactureInfo.electricityUnitCost)
			)
		} else {
			manufactureInfo.totalPowerCost = 0
		}

		// Yield Percentage
		if (!manufactureInfo.yieldPer) {
			manufactureInfo.yieldPer = this._costingConfig.weldingDefaultPercentage(
				Number(manufactureInfo.processTypeID),
				manufactureInfo.partComplexity,
				'yieldPercentage'
			)
		}

		// Sampling Rate
		if (!manufactureInfo.samplingRate) {
			manufactureInfo.samplingRate =
				this._costingConfig.weldingDefaultPercentage(
					Number(manufactureInfo.processTypeID),
					manufactureInfo.partComplexity,
					'samplingRate'
				)
		}

		// Direct Labour
		if (!manufactureInfo.noOfLowSkilledLabours) {
			manufactureInfo.noOfLowSkilledLabours =
				manufactureInfo?.machineMaster?.machineMarketDtos?.[0]
					?.specialSkilledLabours || 1
		}

		// Inspection Time
		if (!manufactureInfo.inspectionTime) {
			manufactureInfo.inspectionTime =
				manufactureInfo.partComplexity == PartComplexity.Low
					? 2
					: manufactureInfo.partComplexity == PartComplexity.Medium
						? 5
						: manufactureInfo.partComplexity == PartComplexity.High
							? 10
							: 0
		}

		// Direct Machine Cost
		if (!manufactureInfo.directMachineCost) {
			manufactureInfo.directMachineCost = this.shareService.isValidNumber(
				(Number(manufactureInfo.machineHourRate) / 3600) * curCycleTime
			)
		}

		// Direct SetUp Cost
		if (!manufactureInfo.directSetUpCost) {
			manufactureInfo.directSetUpCost = this.shareService.isValidNumber(
				((Number(manufactureInfo.skilledLaborRatePerHour) +
					Number(manufactureInfo.machineHourRate)) *
					(Number(manufactureInfo.setUpTime) / 60)) /
				Number(manufactureInfo.lotSize)
			)
		}

		// Direct Labor Cost
		if (!manufactureInfo.directLaborCost) {
			manufactureInfo.directLaborCost = this.shareService.isValidNumber(
				(Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) *
				(curCycleTime * Number(manufactureInfo.noOfLowSkilledLabours))
			)
		}

		// Inspection Cost
		if (!manufactureInfo.inspectionCost) {
			const rate = manufactureInfo.qaOfInspectorRate || 0
			const sampling = manufactureInfo.samplingRate || 100

			if (this.weldingMode === 'seamWelding') {
				manufactureInfo.inspectionCost = this.shareService.isValidNumber(
					(Number(manufactureInfo.inspectionTime) * rate) /
					(Number(manufactureInfo.lotSize) * (sampling / 100))
				)
			} else {
				manufactureInfo.inspectionCost = this.shareService.isValidNumber(
					(sampling / 100) *
					((Number(manufactureInfo.inspectionTime) * rate) / 3600)
				)
			}
		}

		const sum = this.shareService.isValidNumber(
			Number(manufactureInfo.directMachineCost || 0) +
			Number(manufactureInfo.directSetUpCost || 0) +
			Number(manufactureInfo.directLaborCost || 0) +
			Number(manufactureInfo.inspectionCost || 0)
		)

		// Yield Cost
		if (!manufactureInfo.yieldCost) {
			const yieldPer = Number(manufactureInfo.yieldPer) || 100
			if (this.weldingMode === 'seamWelding') {
				manufactureInfo.yieldCost = this.shareService.isValidNumber(
					(1 - yieldPer / 100) * sum
				)
			} else {
				manufactureInfo.yieldCost = this.shareService.isValidNumber(
					(1 - yieldPer / 100) * (Number(manufactureInfo.netMaterialCost) + sum)
				)
			}
		}

		manufactureInfo.directProcessCost = this.shareService.isValidNumber(
			sum +
			Number(manufactureInfo.yieldCost || 0) +
			Number(manufactureInfo.totalPowerCost || 0)
		)
	}

	public calculationsForWeldingPreparation(
		manufactureInfo: ProcessInfoDto,
		fieldColorsList: any,
		manufacturingObj: ProcessInfoDto
	): ProcessInfoDto {
		const weldingLength =
			manufactureInfo.materialInfoList?.length > 0
				? manufactureInfo.materialInfoList[0]?.dimX
				: 0
		const weldingWidth =
			manufactureInfo.materialInfoList?.length > 0
				? manufactureInfo.materialInfoList[0]?.dimY
				: 0
		const weldingHeight =
			manufactureInfo.materialInfoList?.length > 0
				? manufactureInfo.materialInfoList[0]?.dimZ
				: 0
		const netWeight =
			manufactureInfo.materialInfoList?.length > 0
				? manufactureInfo.materialInfoList[0]?.netWeight / 1000
				: 0
		manufactureInfo.netMaterialCost =
			manufactureInfo.materialInfoList?.length > 0
				? manufactureInfo.materialInfoList[0]?.netMatCost
				: 0
		const crossSectionArea =
			2 * weldingLength * Math.max(weldingWidth, weldingHeight)
		const materialType =
			manufactureInfo.materialmasterDatas?.materialType?.materialTypeName
		let lookupListDia = this._costingConfig
			.getDiscBrushDia()
			?.filter(
				x => x.materialType === materialType && x.partArea >= crossSectionArea
			)?.[0]

		if (crossSectionArea > 100001) {
			lookupListDia = this._costingConfig
				.getDiscBrushDia()
				?.filter(x => x.materialType === materialType)
				?.reverse()?.[0]
		}
		let discBrushDia: number = 0,
			deburringRPM: number = 0
		if (lookupListDia) {
			discBrushDia = lookupListDia?.discBrush
			deburringRPM =
				Number(manufactureInfo?.processTypeID) === ProcessType.WeldingPreparation
					? lookupListDia?.prepRPM
					: lookupListDia?.cleaningRPM
		}
		const feedPerREvRough = this.shareService.isValidNumber(discBrushDia / 2)
		const feedPerREvFinal = this.shareService.isValidNumber(discBrushDia / 4)
		const noOfPasses = this.shareService.isValidNumber(
			Math.ceil(weldingWidth / discBrushDia)
		)
		const handlingTime =
			netWeight < 5
				? 10
				: netWeight < 10
					? 16
					: netWeight < 20
						? 24
						: netWeight > 20
							? 32
							: 0

		if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime != null) {
			manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime)
		} else {
			let cycleTime = this.shareService.isValidNumber(
				handlingTime +
				(2 * (weldingLength + 5) * noOfPasses * 60) /
				feedPerREvRough /
				deburringRPM
			)
			if (
				Number(manufactureInfo?.processTypeID) === ProcessType.WeldingCleaning
			) {
				cycleTime += this.shareService.isValidNumber(
					(2 * (weldingLength + 5) * noOfPasses * 60) /
					feedPerREvFinal /
					deburringRPM
				)
			}
			if (manufactureInfo.cycleTime != null) {
				cycleTime = this.shareService.checkDirtyProperty(
					'cycleTime',
					fieldColorsList
				)
					? manufacturingObj?.cycleTime
					: cycleTime
			}
			manufactureInfo.cycleTime = cycleTime
		}

		// Costs
		// Direct Machine Cost
		if (
			manufactureInfo.isdirectMachineCostDirty &&
			manufactureInfo.directMachineCost != null
		) {
			manufactureInfo.directMachineCost = Number(manufactureInfo.directMachineCost)
		} else {
			let directMachineCost = this.shareService.isValidNumber(
				(Number(manufactureInfo.machineHourRate) *
					Number(manufactureInfo.cycleTime)) /
				3600 /
				(Number(manufactureInfo.efficiency) / 100)
			)
			if (manufactureInfo.directMachineCost != null) {
				directMachineCost = this.shareService.checkDirtyProperty(
					'directMachineCost',
					fieldColorsList
				)
					? manufacturingObj?.directMachineCost
					: directMachineCost
			}
			manufactureInfo.directMachineCost = directMachineCost
		}

		// Direct Setup Cost
		if (
			manufactureInfo.isdirectSetUpCostDirty &&
			manufactureInfo.directSetUpCost != null
		) {
			manufactureInfo.directSetUpCost = Number(manufactureInfo.directSetUpCost)
		} else {
			let directSetUpCost =
				(((Number(manufactureInfo.noOfLowSkilledLabours) *
					Number(manufactureInfo.setUpTime)) /
					60) *
					Number(manufactureInfo.lowSkilledLaborRatePerHour)) /
				(Number(manufactureInfo.efficiency) / 100) /
				Number(manufactureInfo.lotSize) +
				(((Number(manufactureInfo.noOfSkilledLabours) *
					Number(manufactureInfo.skilledLaborRatePerHour)) /
					60) *
					Number(manufactureInfo.setUpTime)) /
				(Number(manufactureInfo.efficiency) / 100) /
				Number(manufactureInfo.lotSize)
			if (manufactureInfo.directSetUpCost != null) {
				directSetUpCost = this.shareService.checkDirtyProperty(
					'directSetUpCost',
					fieldColorsList
				)
					? manufacturingObj?.setUpCost
					: directSetUpCost
			}
			manufactureInfo.directSetUpCost = directSetUpCost
		}

		// Direct Labor Cost
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
				(Number(manufactureInfo.efficiency) / 100) +
				(Number(manufactureInfo.noOfSkilledLabours) *
					Number(manufactureInfo.skilledLaborRatePerHour) *
					Number(manufactureInfo.cycleTime)) /
				3600 /
				(Number(manufactureInfo.efficiency) / 100)
			)
			if (manufactureInfo.directLaborCost != null) {
				directLaborCost = this.shareService.checkDirtyProperty(
					'directLaborCost',
					fieldColorsList
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
			let inspectionCost = this.shareService.isValidNumber(
				((manufactureInfo.inspectionTime / 60) *
					Number(manufactureInfo.qaOfInspector) *
					Number(manufactureInfo.qaOfInspectorRate)) /
				(Number(manufactureInfo.efficiency) / 100) /
				Number(manufactureInfo.lotSize)
			)
			if (manufactureInfo.inspectionCost != null) {
				inspectionCost = this.shareService.checkDirtyProperty(
					'inspectionCost',
					fieldColorsList
				)
					? manufacturingObj?.inspectionCost
					: inspectionCost
			}
			manufactureInfo.inspectionCost = inspectionCost
		}

		if (manufactureInfo.isyieldPercentDirty && manufactureInfo.yieldPer != null) {
			manufactureInfo.yieldPer = Number(manufactureInfo.yieldPer)
		} else {
			manufactureInfo.yieldPer = this._costingConfig.weldingDefaultPercentage(
				Number(manufactureInfo.processTypeID),
				manufactureInfo.partComplexity,
				'yieldPercentage'
			)
		}

		// Total costs summing would happen here similarly if needed for prep
		return manufactureInfo
	}

	private safeDiv(num: number, denom1: number, denom2: number): number {
		if (!denom1 || !denom2) return 0
		return this.shareService.isValidNumber(num / denom1 / denom2)
	}

	public calculationsForWeldingCleaning(
		manufactureInfo: ProcessInfoDto,
		fieldColorsList: any,
		manufacturingObj: ProcessInfoDto
	): ProcessInfoDto {
		const materialInfoList = Array.isArray(manufactureInfo.materialInfoList)
			? manufactureInfo.materialInfoList
			: []
		const materialInfo =
			materialInfoList.find(
				rec =>
					rec.processId === PrimaryProcessType.MigWelding ||
					rec.processId === PrimaryProcessType.TigWelding
			) || null

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

		// Cutting Length
		if (
			manufactureInfo.isCuttingLengthDirty &&
			manufactureInfo.cuttingLength !== null
		) {
			manufactureInfo.cuttingLength = Number(manufactureInfo.cuttingLength)
		} else {
			let totalWeldLength = materialInfo?.totalWeldLength || 0
			if (manufactureInfo.cuttingLength !== null) {
				totalWeldLength = this.shareService.checkDirtyProperty(
					'cuttingLength',
					fieldColorsList
				)
					? manufacturingObj?.cuttingLength
					: totalWeldLength
			}
			manufactureInfo.cuttingLength = totalWeldLength
		}

		const maxWeldElementSize =
			weldingMaterialDetails.length > 0
				? Math.max(...weldingMaterialDetails.map((item: any) => item.coreWeight))
				: 0
		const weldCrossSectionalArea =
			2 * manufactureInfo.cuttingLength * maxWeldElementSize
		const materialType =
			manufactureInfo.materialmasterDatas?.materialType?.materialTypeName

		let lookupListDia = this._weldingConfig
			.getDiscBrushDia()
			?.filter(
				x =>
					x.materialType === materialType &&
					x.partArea >= weldCrossSectionalArea
			)?.[0]
		if (weldCrossSectionalArea > 100001) {
			lookupListDia = this._weldingConfig
				.getDiscBrushDia()
				?.filter(x => x.materialType === materialType)
				?.reverse()?.[0]
		}

		let discBrushDia = 0,
			deburringRPM = 0
		if (lookupListDia) {
			discBrushDia = lookupListDia?.discBrush
			deburringRPM =
				Number(manufactureInfo?.processTypeID) ===
					ProcessType.WeldingPreparation
					? lookupListDia?.prepRPM
					: lookupListDia?.cleaningRPM
		}

		manufactureInfo.netMaterialCost = materialInfo?.netMatCost || 0

		const feedPerREvRough = this.shareService.isValidNumber(discBrushDia / 2)
		const feedPerREvFinal = this.shareService.isValidNumber(discBrushDia / 4)
		const noOfPasses = this.shareService.isValidNumber(
			Math.ceil(maxWeldElementSize / discBrushDia)
		)

		const reorientaionTime =
			this._weldingConfig.getUnloadingTime(materialInfo?.netWeight) || 0

		if (
			manufactureInfo.isCuttingLengthDirty &&
			manufactureInfo.noOfWeldPasses !== null
		) {
			manufactureInfo.noOfWeldPasses = Number(manufactureInfo.noOfWeldPasses)
		} else {
			let noOfIntermediateStartStops = 0
			noOfIntermediateStartStops = weldingMaterialDetails.reduce(
				(sum: number, weldDetail: any) =>
					sum +
					(weldDetail.coreArea === 1
						? weldDetail.coreVolume
						: weldDetail.coreVolume * weldDetail.coreArea),
				0
			)

			if (manufactureInfo.noOfWeldPasses !== null) {
				noOfIntermediateStartStops = this.shareService.checkDirtyProperty(
					'noOfWeldPasses',
					fieldColorsList
				)
					? manufacturingObj?.noOfWeldPasses
					: noOfIntermediateStartStops
			}
			manufactureInfo.noOfWeldPasses = noOfIntermediateStartStops
		}

		const partHandlingTime =
			reorientaionTime + manufactureInfo.noOfWeldPasses * 5
		const term = 2 * (manufactureInfo.cuttingLength + 5) * noOfPasses * 60

		const processTime =
			partHandlingTime +
			this.safeDiv(term, feedPerREvRough, deburringRPM) +
			(manufactureInfo.typeOfOperationId === 1
				? 0
				: this.safeDiv(term, feedPerREvFinal, deburringRPM))

		if (manufactureInfo.isefficiencyDirty && !!manufactureInfo.efficiency) {
			manufactureInfo.efficiency = Number(manufactureInfo.efficiency)
		} else {
			manufactureInfo.efficiency = this.shareService.checkDirtyProperty(
				'efficiency',
				fieldColorsList
			)
				? manufacturingObj?.efficiency
				: this.shareService.isValidNumber(manufactureInfo.efficiency)
			if (Number(manufactureInfo.efficiency) < 1) {
				manufactureInfo.efficiency *= 100
			}
		}

		if (manufactureInfo.iscycleTimeDirty && manufactureInfo.cycleTime !== null) {
			manufactureInfo.cycleTime = Number(manufactureInfo.cycleTime)
		} else {
			let cycleTime = this.shareService.isValidNumber(
				processTime / (Number(manufactureInfo.efficiency) / 100)
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
		} else {
			let directMachineCost = this.shareService.isValidNumber(
				(Number(manufactureInfo.machineHourRate) *
					Number(manufactureInfo.cycleTime)) /
				3600
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
		} else {
			let directSetUpCost = this.shareService.isValidNumber(
				((Number(manufactureInfo.machineHourRate) +
					Number(manufactureInfo.skilledLaborRatePerHour)) *
					(Number(manufactureInfo.setUpTime) / 60)) /
				Number(manufactureInfo.lotSize)
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
				3600
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
		}

		if (
			manufactureInfo.isinspectionTimeDirty &&
			manufactureInfo.inspectionTime !== null
		) {
			manufactureInfo.inspectionTime = Number(manufactureInfo.inspectionTime)
		} else {
			let inspectionTime =
				manufactureInfo.partComplexity == PartComplexity.Low
					? 0.25
					: manufactureInfo.partComplexity == PartComplexity.Medium
						? 0.5
						: manufactureInfo.partComplexity == PartComplexity.High
							? 1
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

		return manufactureInfo
	}

	private weldingPreCalc(
		manufactureInfo: ProcessInfoDto,
		fieldColorsList: any,
		manufacturingObj: ProcessInfoDto
	) {
		// Set Up Time default
		manufactureInfo.setUpTime = manufactureInfo.setUpTime || 30

		// Yield Percentage
		if (manufactureInfo.isyieldPercentDirty && !!manufactureInfo.yieldPer) {
			manufactureInfo.yieldPer = this.shareService.isValidNumber(
				Number(manufactureInfo.yieldPer)
			)
		} else {
			let yieldPer = this._costingConfig.weldingDefaultPercentage(
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

		// Sampling Rate
		if (manufactureInfo.isSamplingRateDirty && !!manufactureInfo.samplingRate) {
			manufactureInfo.samplingRate = this.shareService.isValidNumber(
				Number(manufactureInfo.samplingRate)
			)
		} else {
			let samplingRate = this._costingConfig.weldingDefaultPercentage(
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

		// Critical Logic: Efficiency Calculation (mirrors service logic)
		if (manufactureInfo.isefficiencyDirty && !!manufactureInfo.efficiency) {
			manufactureInfo.efficiency = Number(manufactureInfo.efficiency)
		} else {
			let efficiency = 75
			const weldingEffeciencyValues = this._costingConfig
				.weldingPositionList(
					Number(manufactureInfo.processTypeID) === ProcessType.StickWelding
						? 'stickWelding'
						: 'welding'
				)
				.find(x => x.id === Number(manufactureInfo.weldingPosition))

			if (manufactureInfo.semiAutoOrAuto == MachineType.Automatic) {
				efficiency = Number(
					weldingEffeciencyValues?.EffeciencyAuto || efficiency
				)
			} else if (manufactureInfo.semiAutoOrAuto == MachineType.Manual) {
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

		// Normalize efficiency to percentage if <= 1 (e.g. 0.75 -> 75)
		if (manufactureInfo.efficiency <= 1) {
			manufactureInfo.efficiency = manufactureInfo.efficiency * 100
		}
		if (!manufactureInfo.efficiency) {
			manufactureInfo.efficiency = 75
		}
	}

	checkFormArrayDirtyField(
		fieldName: string,
		index: number,
		fieldColorsList: any
	): boolean {
		return (
			fieldColorsList?.find(
				(x: any) =>
					x.formControlName == fieldName && x.subProcessIndex == index
			)?.isDirty || false
		)
	}
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

/**
 * Calculate total power cost per part
 * @param cycleTimeSeconds - Cycle time in seconds
 * @param powerConsumptionKW - Power consumption in kW
 * @param electricityUnitCost - Cost per kWh
 * @returns Total power cost per part
 */
export function calculatePowerCost(
	cycleTimeSeconds: number,
	powerConsumptionKW: number,
	electricityUnitCost: number
): number {
	return (cycleTimeSeconds / 3600) * powerConsumptionKW * electricityUnitCost
}

/**
 * Calculate manufacturing CO2 impact per part
 * @param cycleTimeSeconds - Cycle time in seconds
 * @param powerConsumptionKW - Power consumption in kW
 * @param co2PerKwHr - CO2 factor (kg/kWh)
 * @returns CO2 per part (kg)
 */
export function calculateManufacturingCO2(
	cycleTimeSeconds: number,
	powerConsumptionKW: number,
	co2PerKwHr: number
): number {
	return (cycleTimeSeconds / 3600) * powerConsumptionKW * co2PerKwHr
}

export function calculateWeldSize(value: number): number {
	if (value <= 8) return Math.round(value)
	if (value < 12) return 6
	return 8
}
export function calculateESG(material: MaterialInfo): ESGCalculationResult {
	const esgImpactCO2Kg = Number(material.materialMarketData.esgImpactCO2Kg);
	const esgImpactCO2KgScrap = Number(material.materialMarketData.esgImpactCO2KgScrap);

	const esgImpactCO2KgPart = (material.grossWeight / 1000) * esgImpactCO2Kg -
		(material.scrapWeight / 1000) * esgImpactCO2KgScrap;

	const esgAnnualVolumeKg = (material.netWeight / 1000) * material.eav;
	const esgAnnualKgCO2 = esgImpactCO2Kg * esgAnnualVolumeKg;

	return {
		esgImpactCO2Kg,
		esgImpactCO2KgScrap,
		esgImpactCO2KgPart,
		esgAnnualVolumeKg,
		esgAnnualKgCO2
	};
}
