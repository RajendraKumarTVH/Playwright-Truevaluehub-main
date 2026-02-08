// tests/utils/costingConfig.ts
export enum MachineType {
	Manual = 0,
	SemiAutomatic = 1,
	Automatic = 2
}
export enum PrimaryProcessType {
	SeamWelding = 1,
	StickWelding = 2,
	SpotWelding = 3,
	TigWelding = 4,
	MigWelding = 5,
	WeldingPreparation = 6,
	WeldingCleaning = 7
}
export enum ProcessType {
	StickWelding = 1,
	TigWelding = 2,
	MigWelding = 3,
	SpotWelding = 4,
	SeamWelding = 5,
	WeldingPreparation = 6,
	WeldingCleaning = 7
}
export enum PartComplexity {
	Low = 1,
	Medium = 2,
	High = 3
}

export type WeldingMachineValue = any
export type SpotWeldingValue = any
export type PartHandlingValue = any
export type WeldingPosition = any

export class CostingConfig {
	weldingValuesForPartHandling(
		mode: 'seamWelding' | 'spotWelding' | 'stickWelding' | string = 'welding'
	) {
		if (mode === 'seamWelding') {
			return [
				{ toPartWeight: 0.5, loading: 6, unloading: 6 },
				{ toPartWeight: 2, loading: 8, unloading: 8 },
				{ toPartWeight: 20, loading: 20, unloading: 20 }
			]
		}
		if (mode === 'spotWelding') {
			return [
				{ toPartWeight: 0.5, loading: 2, unloading: 2 },
				{ toPartWeight: 2, loading: 4, unloading: 4 },
				{ toPartWeight: 10, loading: 8, unloading: 8 }
			]
		}
		// default / stick
		return [
			{ toPartWeight: 0.5, loading: 10, unloading: 10 },
			{ toPartWeight: 5, loading: 20, unloading: 20 },
			{ toPartWeight: 50, loading: 32, unloading: 32 }
		]
	}

	weldingMachineValuesForSeamWelding() {
		return [
			{ machine: 'Seam-1000', ToPartThickness: 3, weldingEfficiency: 40 },
			{ machine: 'Seam-2000', ToPartThickness: 8, weldingEfficiency: 28 }
		]
	}

	spotWeldingValuesForMachineType() {
		return [
			{
				toPartThickness: 0.5,
				weldCurrent: { 0: 200 },
				openCircuitVoltage: 4.5,
				holdTime: 150,
				weldTime: 30
			},
			{
				toPartThickness: 1.0,
				weldCurrent: { 0: 350 },
				openCircuitVoltage: 5.0,
				holdTime: 180,
				weldTime: 40
			},
			{
				toPartThickness: 2.0,
				weldCurrent: { 0: 600 },
				openCircuitVoltage: 5.5,
				holdTime: 240,
				weldTime: 60
			}
		]
	}

	weldingValuesForStickWelding() {
		return [
			{
				ToPartThickness: 10,
				TravelSpeed: 6,
				current: 200,
				Voltage: 25,
				weldPass: 2,
				weldingEfficiency: 15
			}
		]
	}

	weldingValuesForMachineType() {
		return [
			{
				id: 1,
				ToPartThickness: 1,
				TravelSpeed: 20,
				current: 80,
				Voltage: 18,
				weldPass: 1,
				weldingEfficiency: 18
			},
			{
				id: 2,
				ToPartThickness: 5,
				TravelSpeed: 15,
				current: 160,
				Voltage: 22,
				weldPass: 1,
				weldingEfficiency: 20
			},
			{
				id: 3,
				ToPartThickness: 20,
				TravelSpeed: 8,
				current: 260,
				Voltage: 28,
				weldPass: 2,
				weldingEfficiency: 22
			}
		]
	}

	tigWeldingValuesForMachineType() {
		return [
			{
				id: 1,
				ToPartThickness: 1,
				TravelSpeed: 22,
				current: 80,
				Voltage: 16,
				weldingEfficiency: 24
			},
			{
				id: 2,
				ToPartThickness: 6,
				TravelSpeed: 12,
				current: 140,
				Voltage: 20,
				weldingEfficiency: 18
			}
		]
	}

	weldingDefaultPercentage(
		processTypeId: number,
		complexity: number,
		key: 'yieldPercentage' | 'samplingRate'
	) {
		if (key === 'yieldPercentage') {
			return complexity === PartComplexity.High
				? 95
				: complexity === PartComplexity.Medium
				? 97
				: 98.5
		}
		return complexity === PartComplexity.High
			? 10
			: complexity === PartComplexity.Medium
			? 5
			: 2
	}

	weldingPositionList(type: 'welding' | 'stickWelding' = 'welding') {
		return [
			{
				id: 1,
				name: 'Flat',
				EffeciencyAuto: 90,
				EffeciencyManual: 80,
				EffeciencySemiAuto: 85
			},
			{
				id: 2,
				name: 'Horizontal',
				EffeciencyAuto: 88,
				EffeciencyManual: 75,
				EffeciencySemiAuto: 82
			},
			{
				id: 3,
				name: 'Vertical',
				EffeciencyAuto: 85,
				EffeciencyManual: 68,
				EffeciencySemiAuto: 76
			},
			{
				id: 4,
				name: 'Overhead',
				EffeciencyAuto: 80,
				EffeciencyManual: 60,
				EffeciencySemiAuto: 70
			}
		]
	}

	weldPass(weldLegLength: number, weldingMode: string) {
		if (!weldLegLength || weldLegLength <= 1) return 1
		if (weldLegLength <= 3) return 1
		if (weldLegLength <= 6) return 2
		if (weldLegLength <= 12) return 3
		return Math.ceil(weldLegLength / 6)
	}

	noOfTrackWeld(length: number) {
		if (!length) return 0
		return Math.round(length / 50) || 1
	}

	getDiscBrushDia() {
		return [
			{
				materialType: 'Steel',
				partArea: 0.1,
				discBrush: 50,
				prepRPM: 1000,
				cleaningRPM: 1200
			},
			{
				materialType: 'Aluminium',
				partArea: 0.1,
				discBrush: 75,
				prepRPM: 1200,
				cleaningRPM: 1400
			}
		]
	}
}
