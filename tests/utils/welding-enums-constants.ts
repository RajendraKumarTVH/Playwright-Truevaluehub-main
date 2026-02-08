// Welding Enums and Constants
// Extracted for cleaner separation of concerns

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
	TigWelding = 58,
	WeldingPreparation = 176,
	WeldingCleaning = 177
}

export enum MachineType {
	Automatic = 1,
	SemiAuto = 2,
	Manual = 3
}

// MIG Welding Data
export const MigWeldingData = [
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

// Welding Weight Loss Data
export const WeldingWeightLossData = [
	{ MaterialType: 'Carbon Steel', WireDiameter_mm: 0.8, loss_g: 0.158 },
	{ MaterialType: 'Carbon Steel', WireDiameter_mm: 1.0, loss_g: 0.246 },
	{ MaterialType: 'Carbon Steel', WireDiameter_mm: 1.2, loss_g: 0.355 },
	{ MaterialType: 'Carbon Steel', WireDiameter_mm: 1.6, loss_g: 0.631 },
	{ MaterialType: 'Carbon Steel', WireDiameter_mm: 2.0, loss_g: 1.005 },
	{ MaterialType: 'Stainless Steel', WireDiameter_mm: 0.8, loss_g: 0.16 },
	{ MaterialType: 'Stainless Steel', WireDiameter_mm: 1.0, loss_g: 0.252 },
	{ MaterialType: 'Stainless Steel', WireDiameter_mm: 1.2, loss_g: 0.369 },
	{ MaterialType: 'Stainless Steel', WireDiameter_mm: 1.6, loss_g: 0.665 },
	{ MaterialType: 'Stainless Steel', WireDiameter_mm: 2.0, loss_g: 1.061 },
	{ MaterialType: 'Aluminium', WireDiameter_mm: 0.8, loss_g: 0.054 },
	{ MaterialType: 'Aluminium', WireDiameter_mm: 1.0, loss_g: 0.085 },
	{ MaterialType: 'Aluminium', WireDiameter_mm: 1.2, loss_g: 0.122 },
	{ MaterialType: 'Aluminium', WireDiameter_mm: 1.6, loss_g: 0.217 },
	{ MaterialType: 'Aluminium', WireDiameter_mm: 2.0, loss_g: 0.326 },
	{ MaterialType: 'Copper Alloy', WireDiameter_mm: 0.8, loss_g: 0.18 },
	{ MaterialType: 'Copper Alloy', WireDiameter_mm: 1.0, loss_g: 0.281 },
	{ MaterialType: 'Copper Alloy', WireDiameter_mm: 1.2, loss_g: 0.405 },
	{ MaterialType: 'Copper Alloy', WireDiameter_mm: 1.6, loss_g: 0.719 },
	{ MaterialType: 'Copper Alloy', WireDiameter_mm: 2.0, loss_g: 1.12 }
]
