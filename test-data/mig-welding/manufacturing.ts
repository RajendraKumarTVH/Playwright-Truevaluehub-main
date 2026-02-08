export const ManufacturingInformation = {
	processType: 'Mig Welding',
	subProcessType: 'Manual',
	machineDetails: 'MIG Welding_400V_400A_Japan',
	machineDescription: 'PANASONIC_YD-400VP1YHD (30A-400A)',
	co2Kg: 0.0484,
	cost: 2.9695
} as const

export const MachineDetails = {
	processGroup: 'Mig Welding',
	minCurrentRequired: 400,
	minWeldingVoltage: 35,
	selectedCurrent: 400,
	selectedVoltage: 400,
	machineName: 'MIG Welding_400V_400A_Japan',
	machineDescription: 'PANASONIC_YD-400VP1YHD (30A-400A)',
	machineAutomation: 'Manual' as const,
	samplingPlan: 'Level1' as const,
	machineEfficiency: 70,
	machineHourRate: 1.1905,
	netProcessCost: 2.6385
}

export const CycleTimeDetails = {
	loadingUnloadingTime: 20,
	partReorientation: 0,
	totalWeldCycleTime: 125.403
} as const

export const ManufacturingDetails = {
	samplingRate: 5,
	yieldPercentage: 97,
	yieldCostPerPart: 0.079,
	directLaborRate: 42.7557,
	noOfDirectLabors: 1,
	laborCostPerPart: 2.1277,
	setupLaborRate: 34.1925,
	machineSetupTime: 30,
	setupCostPerPart: 0.2239,
	qaInspectorRate: 29.9182,
	qaInspectionTime: 2,
	qaInspectionCostPerPart: 0.0505,
	machineHourRate: 1.1905,
	cycleTimePerPart: 179.1471,
	machineCostPerPart: 0.0592,
	powerUnitCost: 0.141,
	powerConsumption: 14,
	totalPowerCost: 0.0982
} as const

export const SustainabilityManufacturing = {
	co2PerKwHr: 1.7317,
	co2PerPart: 0.0119
} as const

export const SpecificManufacturingScenario = {
	samplingRate: 5,
	yieldPercentage: 97,
	yieldCostPerPart: 0.079,
	directLaborRate: 42.7557,
	noOfDirectLabors: 1,
	laborCostPerPart: 2.1277,
	setupLaborRate: 34.1925,
	machineSetupTime: 30,
	setupCostPerPart: 0.2239,
	qaInspectorRate: 29.9182,
	qaInspectionTime: 2,
	qaInspectionCostPerPart: 0.0505,
	machineHourRate: 1.1905,
	cycleTimePerPart: 179.1471,
	machineCostPerPart: 0.0592,
	powerUnitCost: 0.141,
	powerConsumption: 14,
	totalPowerCost: 0.0982,
	co2PerKwHr: 2.7708,
	co2PerPart: 0.0195
} as const

