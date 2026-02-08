import {
	calculateLotSize,
	calculateLifeTimeQtyRemaining,
	calculatePowerCost,
	calculateManufacturingCO2
} from '../tests/utils/welding-calculator'
import { SustainabilityCalculator } from '../tests/utils/SustainabilityCalculator'

// Re-export modular test data
export * from './mig-welding/sustainability'
export * from './mig-welding/scenarios'
export * from './mig-welding/cost-breakdown'

// ==================== INTERFACES ====================

/** Test configuration interface */
export interface ITestConfig {
	baseUrl: string
	defaultTimeout: number
	retryCount: number
}

/** Project data interface */
export interface IProjectData {
	projectId: string
	projectName: string
	targetMonth: string
	createdBy: string
	status: string
}

/** Part information interface */
export interface IPartInformation {
	internalPartNumber: string
	drawingNumber: string
	revisionNumber: string
	partDescription: string
	manufacturingCategory: string
	bomQty: number
	annualVolumeQty: number
	lotSize: number
	productLifeRemaining: number
	lifeTimeQtyRemaining: number
}

/** Weld details interface for a single weld */
export interface IWeldDetail {
	weldType: string
	weldSize: number
	wireDia: number
	weldElementSize: number
	noOfWeldPasses: number
	weldLength: number
	weldSide: 'Single' | 'Both'
	weldPlaces: number
	grindFlush: 'Yes' | 'No'
	totalWeldLength: number
	weldVolume: number
}

/** Cost item with amount and percentage */
export interface ICostItem {
	amount: number
	percent: number
}

/** Cost summary interface */
export interface ICostSummary {
	materialCost: ICostItem
	manufacturingCost: ICostItem
	toolingCost: ICostItem
	overheadProfit: ICostItem
	packingCost: ICostItem
	exwPartCost: ICostItem
	freightCost: ICostItem
	dutiesTariff: ICostItem
	partShouldCost: ICostItem
}

// ==================== TEST CONFIGURATION ====================
export const TestConfig: ITestConfig = {
	baseUrl: 'https://qa.truevaluehub.com',
	defaultTimeout: 60000,
	retryCount: 2
}

// ==================== PROJECT DATA ====================
export const ProjectData: IProjectData = {
	projectId: '15298',
	projectName: 'TVH_WeldCleaning',
	targetMonth: 'December 2025',
	createdBy: 'Rajendra Kumar',
	status: 'Costing'
}

// ==================== PART INFORMATION ====================
const annualVolumeQty = 950
const productLifeRemaining = 5

export const PartInformation: IPartInformation = {
	internalPartNumber: '1023729-C-1023729-C 3',
	drawingNumber: 'Enter Drawing value',
	revisionNumber: 'Enter Revision value',
	partDescription: 'Enter Part Description',
	manufacturingCategory: 'Assembly',
	bomQty: 1,
	annualVolumeQty,
	lotSize: 79,
	productLifeRemaining,
	lifeTimeQtyRemaining: 4750
}

// ==================== SUPPLY TERMS ====================
export const SupplyTerms = {
	supplierName: 'Target Vendor -  United States',
	manufacturingCity: 'New York',
	manufacturingCountry: 'USA',
	deliverySiteName: 'Trinity - Dallas',
	deliveryCity: 'Dallas',
	deliveryCountry: 'USA'
} as const

// ==================== MATERIAL INFORMATION ====================
export const MaterialInformation = {
	processGroup: 'Mig Welding',
	category: 'Ferrous',
	family: 'Carbon Steel',
	grade: 'AISI 1050 | DIN CF53 | EN43C | SWRH52B/S50C',
	stockForm: 'Plate'
} as const

// ==================== PART DETAILS ====================
export const PartDetails = {
	partEnvelopeLength: 27,
	partEnvelopeWidth: 20,
	partEnvelopeHeight: 5,
	netWeight: 5.6713,
	partSurfaceArea: 1166.6708,
	partVolume: 720.6173
} as const

// ==================== WELDING DETAILS ====================
export const WeldingDetails = {
	weld1: {
		weldType: 'Fillet',
		weldSize: 6,
		wireDia: 1.2,
		weldElementSize: 6,
		noOfWeldPasses: 1,
		weldLength: 200, // Derived from cycle time 65.2876 with speed 3.825
		weldSide: 'Both' as const, // Assumption kept or generic
		weldPlaces: 1,
		grindFlush: 'No' as const,
		totalWeldLength: 200,
		weldVolume: 7200
	} satisfies IWeldDetail,
	weld2: {
		weldType: 'Fillet',
		weldSize: 8, // Assumption
		wireDia: 1.2,
		weldElementSize: 8,
		noOfWeldPasses: 1,
		weldLength: 60, // Derived from cycle time 34.1438 with speed 3.825
		weldSide: 'Single' as const,
		weldPlaces: 1,
		grindFlush: 'No' as const,
		totalWeldLength: 60,
		weldVolume: 1920
	} satisfies IWeldDetail
}

/** Consolidated weld data for page methods */
export const testWeldData = {
	weld1: {
		weldType: WeldingDetails.weld1.weldType,
		weldSize: WeldingDetails.weld1.weldSize,
		weldLength: WeldingDetails.weld1.weldLength,
		noOfPasses: WeldingDetails.weld1.noOfWeldPasses,
		weldPlaces: WeldingDetails.weld1.weldPlaces
	},
	weld2: {
		weldType: WeldingDetails.weld2.weldType,
		weldSize: WeldingDetails.weld2.weldSize,
		weldLength: WeldingDetails.weld2.weldLength,
		noOfPasses: WeldingDetails.weld2.noOfWeldPasses,
		weldPlaces: WeldingDetails.weld2.weldPlaces
	}
}

// ==================== MATERIAL COST DETAILS ====================
export const MaterialCostDetails = {
	totalWeldLength: 300,
	totalWeldMaterialWeight: 26.9154, // Keep existing or update if material info was provided
	efficiencyPercent: 70, // Matches 70% efficienty
	weldBeadWeightWithWastage: 36.5972,
	netMaterialCost: 0 // User didn't specify material cost, but Cost Summary implies existence?
} as const

// ==================== SUSTAINABILITY - MATERIAL ====================
// Base CO2 factors (input data)
const BaseCO2PerKg = 13.7958
const BaseCO2PerScrap = 13.7958

// Calculate material sustainability using SustainabilityCalculator
const materialSustainabilityCalc =
	SustainabilityCalculator.calculateMaterialSustainability({
		esgImpactCO2Kg: BaseCO2PerKg,
		esgImpactCO2KgScrap: BaseCO2PerScrap,
		grossWeight: MaterialCostDetails.weldBeadWeightWithWastage,
		scrapWeight:
			MaterialCostDetails.weldBeadWeightWithWastage -
			MaterialCostDetails.totalWeldMaterialWeight,
		netWeight: MaterialCostDetails.totalWeldMaterialWeight,
		eav: PartInformation.annualVolumeQty
	})

export const SustainabilityMaterial = {
	co2PerKgMaterial: BaseCO2PerKg,
	co2PerScrap: BaseCO2PerScrap,
	co2PerPart: Number(materialSustainabilityCalc.esgImpactCO2KgPart.toFixed(4))
}

// ==================== MANUFACTURING INFORMATION ====================
export const ManufacturingInformation = {
	processType: 'Mig Welding',
	subProcessType: 'Manual',
	machineDetails: 'MIG Welding_400V_400A_Japan',
	machineDescription: 'PANASONIC_YD-400VP1YHD (30A-400A)',
	co2Kg: 0.0484, // Sub Total CO2
	cost: 2.9695 // Sub Total Cost
} as const

// ==================== MACHINE DETAILS ====================
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
	netProcessCost: 2.6385,
	partComplexity: 'Medium' as const
}

// ==================== CYCLE TIME DETAILS ====================
export const CycleTimeDetails = {
	loadingUnloadingTime: 20,
	partReorientation: 0,
	totalWeldCycleTime: 125.403
} as const

// ==================== SUB PROCESS DETAILS ====================

// ==================== MANUFACTURING DETAILS ====================
export const ManufacturingDetails = {
	samplingRate: 5,
	yieldPercentage: 97,
	directLaborRate: 42.7557,
	noOfDirectLabors: 1,
	setupLaborRate: 34.1925,
	machineSetupTime: 30,
	qaInspectorRate: 29.9182,
	qaInspectionTime: 2,
	machineHourRate: 1.1905,
	powerConsumption: 14, // kW
	powerUnitCost: 0.141, // $ per kWh
	cycleTimePerPart: 179.1471
}

// ==================== SUSTAINABILITY - MANUFACTURING ====================
export const SustainabilityManufacturing = {
	co2PerKwHr: 2.7708,
	co2PerPart: 0.0195,
	totalPowerCost: 0.0982
}

// ==================== COST SUMMARY ====================
export const CostSummary: ICostSummary = {
	materialCost: { amount: 0, percent: 0 },
	manufacturingCost: { amount: 2.9695, percent: 100 },
	toolingCost: { amount: 0, percent: 0 },
	overheadProfit: { amount: 0, percent: 0 },
	packingCost: { amount: 0, percent: 0 },
	exwPartCost: { amount: 2.9695, percent: 100 },
	freightCost: { amount: 0, percent: 0 },
	dutiesTariff: { amount: 0, percent: 0 },
	partShouldCost: { amount: 2.9695, percent: 100 }
}

// ==================== OPPORTUNITY ====================
export const Opportunity = {
	shouldCost: 2.9695,
	currentCost: 0,
	annualSpend: { shouldCost: 0, currentCost: 0 },
	unitOpportunity: { amount: 0, percent: 0 },
	annualOpportunity: 0,
	lifetimeOpportunity: 0
} as const

// ==================== ESG ====================
export const ESG = {
	totalPartESG: 0,
	annualESG: 0,
	lifetimeESG: 0
} as const

// ==================== EXPECTED VALUES FOR ASSERTIONS ====================
export const ExpectedValues = {
	// Weld Element Size lookup table
	weldElementSizeLookup: [
		{ maxWeldSize: 3, elementSize: 3 },
		{ maxWeldSize: 4.5, elementSize: 3 },
		{ maxWeldSize: 5.5, elementSize: 4 },
		{ maxWeldSize: 6, elementSize: 5 },
		{ maxWeldSize: 12, elementSize: 6 },
		{ maxWeldSize: Infinity, elementSize: 8 }
	] as const,

	// Expected calculated values
	totalWeldLength: 190,
	totalCycleTime: 136.0098,
	totalNetProcessCost: 2.1406,
	totalShouldCost: 2.7958,

	// Tolerance for float comparisons
	tolerance: 0.01
} as const

// ==================== DROPDOWN OPTIONS ====================
export const DropdownOptions = {
	weldTypes: [
		'Fillet',
		'Square',
		'Plug',
		'Bevel/Flare/ V Groove',
		'U/J Groove'
	] as const,
	weldSides: ['Single', 'Both'] as const,
	weldPositions: [
		'Flat',
		'Horizontal',
		'Vertical',
		'OverHead',
		'Combination'
	] as const,
	grindFlush: ['No', 'Yes'] as const,
	machineAutomation: ['Automatic', 'Semi-Auto', 'Manual'] as const,
	samplingPlan: ['Level1', 'Level2', 'Level3'] as const,
	manufacturingCategories: [
		'Sheet Metal and Fabrication',
		'Plastic Injection Moulding',
		'Stock Machining',
		'Casting and Machining',
		'Forging and Machining'
	] as const,
	partComplexity: ['Low', 'Medium', 'High'] as const
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Get weld element size based on weld size using lookup table
 * @param weldSize - The weld size in mm
 * @returns The corresponding weld element size
 */
export function getWeldElementSize(weldSize: number): number {
	// Handle weld sizes <= 3 (return the input value)
	if (weldSize <= 3) return weldSize

	// Use lookup table for larger sizes
	for (const lookup of ExpectedValues.weldElementSizeLookup) {
		if (weldSize <= lookup.maxWeldSize) {
			return lookup.elementSize
		}
	}
	return 8
}

export function calculateTotalWeldLength(
	weldLength: number,
	weldSide: 'Single' | 'Both',
	weldPlaces: number
): number {
	const sideMultiplier = weldSide === 'Both' ? 2 : 1
	return weldLength * sideMultiplier * weldPlaces
}

export function compareWithTolerance(
	actual: number,
	expected: number,
	tolerance: number = ExpectedValues.tolerance
): boolean {
	return Math.abs(actual - expected) <= tolerance
}

export function formatCurrency(amount: number, decimals: number = 4): string {
	return `$${amount.toFixed(decimals)}`
}

export function calculateMachineCost(
	machineHourRate: number,
	cycleTimeSeconds: number
): number {
	return (machineHourRate / 3600) * cycleTimeSeconds
}

export function calculateLaborCost(
	laborRate: number,
	cycleTimeSeconds: number,
	numberOfLabors: number = 1
): number {
	return (laborRate / 3600) * cycleTimeSeconds * numberOfLabors
}

export function calculateSetupCost(
	laborRate: number,
	machineRate: number,
	setupTimeMinutes: number,
	lotSize: number
): number {
	return ((laborRate + machineRate) * (setupTimeMinutes / 60)) / lotSize
}

// ==================== COMPLETE TEST DATA OBJECT ====================

export const MigWeldingTestData = {
	config: TestConfig,
	project: ProjectData,
	partInformation: PartInformation,
	supplyTerms: SupplyTerms,
	materialInformation: MaterialInformation,
	partDetails: PartDetails,
	weldingDetails: WeldingDetails,
	materialCostDetails: MaterialCostDetails,
	sustainabilityMaterial: SustainabilityMaterial,
	manufacturingInformation: ManufacturingInformation,
	machineDetails: MachineDetails,
	cycleTimeDetails: CycleTimeDetails,
	manufacturingDetails: ManufacturingDetails,
	sustainabilityManufacturing: SustainabilityManufacturing,
	costSummary: CostSummary,
	opportunity: Opportunity,
	esg: ESG,
	expectedValues: ExpectedValues,
	dropdownOptions: DropdownOptions
}

// ==================== ALTERNATE TEST SCENARIOS ====================

export const Scenario2_DifferentWeldConfig = {
	...MigWeldingTestData,
	weldingDetails: {
		weld1: {
			...WeldingDetails.weld1,
			weldSize: 8,
			weldLength: 100,
			weldSide: 'Single' as const
		},
		weld2: {
			...WeldingDetails.weld2,
			weldSize: 4,
			weldLength: 50,
			weldSide: 'Both' as const
		}
	}
}

export const Scenario3_AutomaticMachine = {
	...MigWeldingTestData,
	machineDetails: {
		...MachineDetails,
		machineAutomation: 'Automatic' as const,
		machineEfficiency: 85
	}
}
export const Scenario4_HighVolume = {
	...MigWeldingTestData,
	partInformation: {
		...PartInformation,
		annualVolumeQty: 10000,
		lotSize: 500,
		lifeTimeQtyRemaining: 50000
	}
}

export const Scenario5_MultiPass = {
	...MigWeldingTestData,
	weldingDetails: {
		weld1: {
			...WeldingDetails.weld1,
			weldSize: 10,
			noOfWeldPasses: 3,
			weldLength: 150
		},
		weld2: {
			...WeldingDetails.weld2,
			weldSize: 8,
			noOfWeldPasses: 2,
			weldLength: 75
		}
	}
}
// Test data
export interface TEST_DATA {
	material: {
		co2PerKg: '13.7958'
		co2PerScrap: '13.7958'
		co2PerPart: '0.1173'
	}
	manufacturing: {
		co2PerKwHr: '1.7317'
		co2PerPart: '0.0119'
	}
}
// ==================== NEW TEST SCENARIO ====================
export const Scenario6_SpecificManufacturing = {
	samplingRate: 5,
	yieldPercentage: 97,
	yieldCostPerPart: 0.0028,
	directLaborRate: 2.5582,
	noOfDirectLabors: 1,
	laborCostPerPart: 0.0551,
	setupLaborRate: 1.8627,
	machineSetupTime: 30,
	setupCostPerPart: 0.0001,
	qaInspectorRate: 1.5845,
	qaInspectionTime: 2,
	qaInspectionCostPerPart: 0,
	machineHourRate: 1.5226,
	cycleTimePerPart: 77.5295,
	machineCostPerPart: 0.0328,
	powerUnitCost: 0.132,
	powerConsumption: 14,
	totalPowerCost: Number(calculatePowerCost(77.5295, 14, 0.132).toFixed(4)),
	co2PerKwHr: 14.9461,
	co2PerPart: Number(calculateManufacturingCO2(77.5295, 14, 14.9461).toFixed(4))
}

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

// Default export for easy importing
export default MigWeldingTestData
