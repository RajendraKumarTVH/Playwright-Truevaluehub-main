// Mock Enums to avoid Angular imports
export enum ProcessType {
	StickWelding = 209,
	TigWelding = 67,
	MigWelding = 39,
	WeldingCleaning = 177,
	WeldingPreparation = 176,
	SpotWelding = 59,
	SeamWelding = 218
	// Add others if needed
}

export enum PrimaryProcessType {
	SeamWelding = 88,
	SpotWelding = 77,
	StickWelding = 78,
	TigWelding = 58,
	MigWelding = 57
}

export enum MachineType {
	Automatic = 1,
	Manual = 3
}

export enum PartComplexity {
	Low = 1,
	Medium = 2,
	High = 3
}

// Mock Classes
export class MockSharedService {
	appConfigurationService: any = { configuration: { numberOfDecimals: 4 } }

	isValidNumber(value: any): number {
		return !value ||
			Number.isNaN(value) ||
			!Number.isFinite(Number(value)) ||
			value < 0
			? 0
			: Number(
					Number(value)?.toFixed(
						this.appConfigurationService?.configuration?.numberOfDecimals || 4
					)
			  )
	}

	checkDirtyProperty(formCotrolName: string, fieldList: any[]) {
		let res = false
		if (fieldList) {
			const info = fieldList.filter(
				x => x.formControlName === formCotrolName && x.isDirty === true
			)
			if (info.length > 0) {
				res = true
			}
		}
		return res
	}
}

export class MockCostingConfig {
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
		] // 1 is automatic & 3 is manual
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
		] // 1 is automatic & 3 is manual
	}
	weldingDefaultPercentage(
		processTypeId: number,
		partComplexity: 1 | 2 | 3 = 1,
		percentageType: 'yieldPercentage' | 'samplingRate' = 'yieldPercentage'
	) {
		type ComplexityMap = Record<1 | 2 | 3, number>

		interface WeldPercentageConfig {
			processTypeId: number
			yieldPercentage: ComplexityMap
			samplingRate: ComplexityMap
		}

		const vals: WeldPercentageConfig[] = [
			{
				processTypeId: 58,
				yieldPercentage: { 1: 98, 2: 97, 3: 96 },
				samplingRate: { 1: 1.95, 2: 4, 3: 6 }
			},
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
			}
		]

		const selected = vals.find(v => v.processTypeId === processTypeId)
		return selected ? selected[percentageType][partComplexity] : null
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
			// all the others
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
}

export class MockWeldingConfigService {
	weldingEfficiencies = [
		{
			weldingPosition: 'Flat',
			weldingPositionId: 1,
			efficiency: {
				automated: 0.9,
				manual: 0.85
			}
		},
		{
			weldingPosition: 'Horizontal',
			weldingPositionId: 2,
			efficiency: {
				automated: 0.9,
				manual: 0.85
			}
		},
		{
			weldingPosition: 'Vertical',
			weldingPositionId: 3,
			efficiency: {
				automated: 0.85,
				manual: 0.8
			}
		},
		{
			weldingPosition: 'Overhead',
			weldingPositionId: 4,
			efficiency: {
				automated: 0.8,
				manual: 0.75
			}
		},
		{
			weldingPosition: 'Circular',
			weldingPositionId: 5,
			efficiency: {
				automated: 0.8,
				manual: 0.75
			}
		},
		{
			weldingPosition: 'Combination',
			weldingPositionId: 6,
			efficiency: {
				automated: 0.86,
				manual: 0.81
			}
		}
	]

	getWeldingEfficiency(position: number, isAutomated: boolean): number {
		const entry = this.weldingEfficiencies.find(
			item => item.weldingPositionId === position
		)

		if (!entry) {
			console.warn(`Welding position "${position}" not found.`)
			return 0
		}

		return isAutomated ? entry.efficiency.automated : entry.efficiency.manual
	}

	migWeldingData = [
		{
			MaterialType: 'Carbon Steel',
			Type: 'Manual',
			PlateThickness_mm: 1,
			WireDiameter_mm: 0.8,
			Voltage_Volts: 15,
			Current_Amps: 65,
			WireFeed_m_per_min: 3,
			TravelSpeed_mm_per_sec: 6.97
		},
		{
			MaterialType: 'Carbon Steel',
			Type: 'Manual',
			PlateThickness_mm: 1.6,
			WireDiameter_mm: 0.8,
			Voltage_Volts: 18,
			Current_Amps: 145,
			WireFeed_m_per_min: 4.125,
			TravelSpeed_mm_per_sec: 6.06
		},
		{
			MaterialType: 'Carbon Steel',
			Type: 'Manual',
			PlateThickness_mm: 3,
			WireDiameter_mm: 0.8,
			Voltage_Volts: 18,
			Current_Amps: 140,
			WireFeed_m_per_min: 2.7,
			TravelSpeed_mm_per_sec: 5.27
		},
		{
			MaterialType: 'Carbon Steel',
			Type: 'Manual',
			PlateThickness_mm: 3,
			WireDiameter_mm: 0.8,
			Voltage_Volts: 27,
			Current_Amps: 260,
			WireFeed_m_per_min: 5.25,
			TravelSpeed_mm_per_sec: 4.58
		},
		{
			MaterialType: 'Carbon Steel',
			Type: 'Manual',
			PlateThickness_mm: 4,
			WireDiameter_mm: 1.2,
			Voltage_Volts: 27,
			Current_Amps: 290,
			WireFeed_m_per_min: 2.7,
			TravelSpeed_mm_per_sec: 4.17
		},
		{
			MaterialType: 'Carbon Steel',
			Type: 'Manual',
			PlateThickness_mm: 5,
			WireDiameter_mm: 1.2,
			Voltage_Volts: 29.5,
			Current_Amps: 310,
			WireFeed_m_per_min: 8.25,
			TravelSpeed_mm_per_sec: 4.75
		},
		{
			MaterialType: 'Carbon Steel',
			Type: 'Manual',
			PlateThickness_mm: 6,
			WireDiameter_mm: 1.2,
			Voltage_Volts: 35,
			Current_Amps: 400,
			WireFeed_m_per_min: 9,
			TravelSpeed_mm_per_sec: 4.5
		},
		{
			MaterialType: 'Carbon Steel',
			Type: 'Manual',
			PlateThickness_mm: 8,
			WireDiameter_mm: 1.2,
			Voltage_Volts: 35,
			Current_Amps: 400,
			WireFeed_m_per_min: 9,
			TravelSpeed_mm_per_sec: 3.58
		}
	]

	tigWeldingData = [
		{
			MaterialType: 'Aluminium',
			Type: 'Manual',
			PlateThickness_mm: 10,
			WireDiameter_mm: 1.2,
			Voltage_Volts: 35,
			Current_Amps: 400,
			WireFeed_m_per_min: 8,
			TravelSpeed_mm_per_sec: 1.47
		}
		// Simplified for brevity, add more if needed
	]

	getWeldingData(
		materialType: string,
		thickness: number,
		weldingProcess: number,
		weldingType: string
	) {
		if (thickness == null || Number.isNaN(Number(thickness))) return null

		// Simplified lookup logic for the test
		const candidates =
			weldingProcess === PrimaryProcessType.MigWelding
				? this.migWeldingData
				: this.tigWeldingData

		// Mock implementation of find
		return candidates[0] // fallback
	}

	getUnloadingTime(weight: number): number {
		return 10 // Simple mock
	}

	getDiscBrushDia() {
		return [
			{
				materialType: 'Carbon Steel',
				discBrush: 20,
				prepRPM: 1600,
				cleaningRPM: 800,
				discSurfaceArea: 314,
				partArea: 2000
			}
		]
	}

	defaultPercentages(
		processTypeId: number,
		partComplexity = PartComplexity.Low,
		percentageType = 'yieldPercentage'
	) {
		return 97 // Mock value
	}
}

export class MockSheetMetalConfigService {
	materialMapping: Record<string, string> = {
		'Alloy Steel': 'Stainless Steel',
		Aluminium: 'Aluminium',
		'Carbon Steel': 'Carbon Steel'
	}

	mapMaterial(raw: string): string | null {
		return this.materialMapping[raw] || 'Carbon Steel' // Fallback
	}
}

export class WeldingCalculator {
	weldingMode = 'welding'

	shareService: MockSharedService
	_weldingConfig: MockWeldingConfigService
	_costingConfig: MockCostingConfig
	_smConfig: MockSheetMetalConfigService

	constructor() {
		this.shareService = new MockSharedService()
		this._weldingConfig = new MockWeldingConfigService()
		this._costingConfig = new MockCostingConfig()
		this._smConfig = new MockSheetMetalConfigService()
	}

	public calculationForSeamWelding(
		manufactureInfo: any,
		fieldColorsList: any,
		manufacturingObj: any,
		laborRateDto: any[]
	): any {
		this.weldingMode = 'seamWelding'
		this.weldingPreCalc(manufactureInfo, fieldColorsList, manufacturingObj)

		const materialInfo = manufactureInfo.materialInfoList.find(
			(x: { processId: number; netMatCost?: number; netWeight?: number }) =>
				x.processId === PrimaryProcessType.SeamWelding
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

		// For test safety if machineValues null
		if (!machineValues && !manufactureInfo.cuttingSpeed) {
			// fallback or throws
		}

		if (manufactureInfo.iscuttingSpeedDirty && !!manufactureInfo.cuttingSpeed) {
			manufactureInfo.cuttingSpeed = Number(manufactureInfo.cuttingSpeed)
		} else {
			let cuttingSpeed = machineValues ? machineValues.weldingEfficiency : 30 // default
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
			let unloadingTime = weldingPartHandlingValues
				? weldingPartHandlingValues.unloading
				: 10
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

	private weldingPreCalc(
		manufactureInfo: any,
		fieldColorsList: any,
		manufacturingObj: any
	) {
		manufactureInfo.setUpTime = manufactureInfo.setUpTime || 30

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

		if (manufactureInfo.isefficiencyDirty && !!manufactureInfo.efficiency) {
			manufactureInfo.efficiency = Number(manufactureInfo.efficiency)
		} else {
			let efficiency = 75
			// Simplified
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
		manufactureInfo.efficiency <= 1 &&
			(manufactureInfo.efficiency = manufactureInfo.efficiency * 100)
		!manufactureInfo.efficiency && (manufactureInfo.efficiency = 75)
	}

	private weldingCommonCalc(
		manufactureInfo: any,
		fieldColorsList: any,
		manufacturingObj: any,
		laborRateDto: any[]
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
				let electricityUnitCost = 0
				if (manufactureInfo.countryList && manufactureInfo.mfrCountryId) {
					const country = manufactureInfo.countryList.find(
						(x: { countryId: number }) =>
							x.countryId == manufactureInfo.mfrCountryId
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

			if (
				manufactureInfo.ispowerConsumptionDirty &&
				!!manufactureInfo.powerConsumption
			) {
				manufactureInfo.powerConsumption = this.shareService.isValidNumber(
					Number(manufactureInfo.powerConsumption)
				)
			} else {
				let powerConsumption =
					(Number(manufactureInfo.requiredCurrent) *
						Number(manufactureInfo.requiredWeldingVoltage)) /
					1000
				if (manufactureInfo.powerConsumption) {
					powerConsumption = this.shareService.checkDirtyProperty(
						'powerConsumption',
						fieldColorsList
					)
						? manufacturingObj?.powerConsumption
						: powerConsumption
				}
				manufactureInfo.powerConsumption = powerConsumption
			}

			manufactureInfo.totalPowerCost = this.shareService.isValidNumber(
				(curCycleTime / 3600) *
					Number(manufactureInfo.powerConsumption) *
					Number(manufactureInfo.electricityUnitCost)
			) // / (manufactureInfo.efficiency / 100)
			manufactureInfo.totalGasCost = 0
		}

		// # of Direct Labour
		if (
			manufactureInfo.isNoOfLowSkilledLaboursDirty &&
			manufactureInfo.noOfLowSkilledLabours !== null
		) {
			manufactureInfo.noOfLowSkilledLabours = Number(
				manufactureInfo.noOfLowSkilledLabours
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
		}

		if (
			manufactureInfo.isinspectionTimeDirty &&
			manufactureInfo.inspectionTime !== null
		) {
			manufactureInfo.inspectionTime = Number(manufactureInfo.inspectionTime)
		} else {
			manufactureInfo.inspectionTime =
				manufactureInfo.partComplexity == PartComplexity.Low
					? 2
					: manufactureInfo.partComplexity == PartComplexity.Medium
					? 5
					: manufactureInfo.partComplexity == PartComplexity.High
					? 10
					: 0
			manufactureInfo.inspectionTime = this.shareService.checkDirtyProperty(
				'inspectionTime',
				fieldColorsList
			)
				? manufacturingObj?.inspectionTime
				: manufactureInfo.inspectionTime
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
			) // / (manufactureInfo.efficiency / 100)
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
				((Number(manufactureInfo.skilledLaborRatePerHour) +
					Number(manufactureInfo.machineHourRate)) *
					(Number(manufactureInfo.setUpTime) / 60)) /
					manufactureInfo.lotSize
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
			manufactureInfo.directLaborCost !== null
		) {
			manufactureInfo.directLaborCost = Number(manufactureInfo.directLaborCost)
		} else {
			let directLaborCost = this.shareService.isValidNumber(
				(Number(manufactureInfo.lowSkilledLaborRatePerHour) / 3600) *
					(curCycleTime * Number(manufactureInfo.noOfLowSkilledLabours))
			) // / (manufactureInfo.efficiency / 100)
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
			manufactureInfo.isinspectionCostDirty &&
			manufactureInfo.inspectionCost !== null
		) {
			manufactureInfo.inspectionCost = Number(manufactureInfo.inspectionCost)
		} else {
			let inspectionCost =
				this.weldingMode === 'seamWelding'
					? this.shareService.isValidNumber(
							(Number(manufactureInfo.inspectionTime) *
								Number(manufactureInfo.qaOfInspectorRate)) /
								(Number(manufactureInfo.lotSize) *
									(Number(manufactureInfo.samplingRate) / 100))
					  )
					: this.shareService.isValidNumber(
							Number(manufactureInfo.samplingRate / 100) *
								((Number(manufactureInfo.inspectionTime) *
									Number(manufactureInfo.qaOfInspectorRate)) /
									3600)
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

		const sum = this.shareService.isValidNumber(
			Number(manufactureInfo.directMachineCost) +
				Number(manufactureInfo.directSetUpCost) +
				Number(manufactureInfo.directLaborCost) +
				Number(manufactureInfo.inspectionCost)
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
			sum +
				Number(manufactureInfo.yieldCost) +
				Number(manufactureInfo.totalPowerCost)
		)
	}
}
