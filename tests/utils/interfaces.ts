import { Locator } from '@playwright/test'
import {
	ProcessType,
	PartComplexity,
	ManufacturingCategory,
	MachineType,
	MaterialCategory
} from './constants'

// ==================== PART INFORMATION ====================
export interface PartDetails {
	internalPartNumber?: string
	drawingNumber?: string
	revisionNumber?: string
	partDescription?: string
	manufacturingCategory?: string | ManufacturingCategory
	bomQty?: number
	annualVolume?: number
	lotSize?: number
	productLife?: number
	lifeTimeQtyRemaining?: number
	partComplexity?: PartComplexity
}

export interface SupplyTerms {
	supplierName?: string
	supplierId?: number
	manufacturingCity?: string
	manufacturingCountry?: string
	deliverySite?: string
	deliverySiteId?: number
	deliveryCity?: string
	deliveryCountry?: string
}

// ==================== MATERIAL INFORMATION ====================
export interface MaterialInfo {
	materialMarketData?: {
		esgImpactCO2Kg: number
		esgImpactCO2KgScrap: number
	}
	grossWeight?: number
	scrapWeight?: number
	netWeight?: number
	eav?: number
	// Material Definition Properties (from fixtures)
	materialType?: string
	materialSubType?: string
	materialGrade?: string
	stockForm?: string
	materialPrice?: number
	density?: number
	partThickness?: number
}

export interface MaterialPricing {
	pricePerKg?: string
	moq?: string
	leadTime?: string
}


export type WeldIndex = 1 | 2;

export interface WeldTestData {
	weldType: string;
	weldSize: number;
	weldLength: number;
	weldPlaces: number;
	weldSide: string;
	grindFlush: string;
	noOfWeldPasses?: number;
}

export interface WeldingDetailsDTO {
	weld1?: WeldTestData;
	weld2?: WeldTestData;
}

export interface MfgWeldSubProcess {
	MfgWeldType?: string
	MfgWeldPosition?: string
	MfgTravelSpeed?: number
	MfgTackWeld?: number
	MfgNoOfIntermediateStops?: number
	MfgWeldCycleTime?: number
}

export interface WeldSubProcess {
	weldType?: number
	noOfWelds?: number
	totalWeldLength?: number
	weldLegSize?: number
	weldPosition?: number
	noOfIntermediateStops?: number
}

export interface WeldingInfo {
	processTypeID?: number | ProcessType
	processName?: string
	partComplexity?: PartComplexity
	weldType?: string
	weldPosition?: string
	weldLength?: number
	weldLegSize?: number
	noOfWeldPasses?: number
	noOfTackWeld?: number
	semiAutoOrAuto?: MachineType
	efficiency?: number
	lotSize?: number
	setUpTime?: number
	electricityUnitCost?: number
	yieldPer?: number
}

export interface WeldSubMaterialUI {
	weldElementSize: number
	weldSize: number
	noOfWeldPasses: number
	weldLength: number
	weldPlaces: number
	weldSide: string
	wireDia: number
	weldType: string
}

// ==================== TOOLING INFORMATION ====================
export interface ToolingInfo {
	toolName?: string
	toolingCountry?: string
	toolingCountryId?: number
	toolLife?: string | number
	shotsNeeded?: number
	numberOfCavities?: number
	dieStages?: number
	dieSizeLength?: number
	dieSizeWidth?: number
	dieSetSizeLength?: number
	dieSetSizeWidth?: number
	toolMaterialCost?: number
	toolManufacturingCost?: number
	totalToolCost?: number
	toolAmortizationCost?: number
}

// ==================== LABOR RATE ====================
export interface LaborRateInfo {
	laborRateId?: number
	regionId?: number
	countryId?: number
	powerCost?: number
	laborLowSkilledCost?: number
	laborMediumSkilledCost?: number
	laborHighSkilledCost?: number
	qaInspectorCost?: number
	powerESG?: number
}

// ==================== MACHINE MASTER ====================
export interface MachineMaster {
	machineId?: number
	machineName?: string
	machineDescription?: string
	machineHourRate?: number
	powerConsumption?: number
	efficiency?: number
	totalPowerKW?: number
	powerUtilization?: number
}

// ==================== COST SUMMARY ====================
export interface CostSummary {
	materialCost?: number
	manufacturingCost?: number
	toolingCost?: number
	overheadCost?: number
	profitMargin?: number
	totalPartCost?: number
	packagingCost?: number
	logisticsCost?: number
	dutiesTariffs?: number
}

// ==================== PROJECT / COSTING ====================
export interface ProjectInfo {
	projectId?: number
	projectName?: string
	projectStatus?: number
	createdDate?: string
	modifiedDate?: string
	partInfo?: PartDetails
	supplyTerms?: SupplyTerms
	materialInfo?: MaterialInfo[]
	manufacturingInfo?: ManufacturingInfo[]
	toolingInfo?: ToolingInfo[]
	costSummary?: CostSummary
}

// ==================== FORM FIELD COLOR / DIRTY TRACKING ====================
export interface FieldColor {
	formControlName: string
	isDirty: boolean
	subProcessIndex?: number
}

// ==================== TEST ASSERTIONS ====================
export interface ExpectedCosts {
	directMachineCost?: number
	directLaborCost?: number
	directSetUpCost?: number
	inspectionCost?: number
	yieldCost?: number
	totalPowerCost?: number
	directProcessCost?: number
	netMaterialCost?: number
	tolerance?: number // For float comparisons
}

// ==================== CALCULATION INPUT ====================
export interface CalculationInput {
	processType: ProcessType
	partComplexity: PartComplexity
	machineType: MachineType
	materialType: string
	partThickness: number
	weldLength?: number
	weldLegSize?: number
	lotSize: number
	annualVolume: number
	laborRates: LaborRateInfo
	machineInfo: MachineMaster
}
export interface CycleTimeBreakdown {
	loadingTime: number
	unloadingTime: number
	subProcessCycleTime: number
	arcOnTime: number
	arcOffTime: number
	totalWeldCycleTime: number
	finalCycleTime: number
	partReorientation: number
	efficiency: number
}
export interface WeldCycleTimeInput {
	totalWeldLength: number // in mm
	travelSpeed: number // in mm/s
	tackWelds: number // number of tack welds
	intermediateStops: number // number of intermediate start/stops
	weldPosition?: number // weld position ID (optional - affects efficiency)
	weldType?: string // Weld Type (e.g., Fillet, V Groove) - affects cycle time multiplier
}
export interface TotalCycleTimeInput {
	subProcessCycleTimes: number[] // sum of all weld cycle times
	loadingUnloadingTime: number // sec (total)
	partReorientation: number // count
	noWeldPasses?: number // count of weld passes
	intermediateWeldClean?: number // intermediate weld clean time
	efficiency: number // % or fraction
	MachineEfficiency?: number // % or fraction
}
export interface WeldCycleTimeBreakdown extends TotalCycleTimeInput {
	subProcessCycleTime: number
	loadingTime: number
	unloadingTime: number
	arcOnTime: number
	arcOffTime: number
	partReorientation: number
	partReorientationTime: number
	totalWeldCycleTime: number // dry cycle time
	finalCycleTime: number // with efficiency
	cycleTime: number // alias for finalCycleTime
	efficiency: number
}
export interface ProcessInfoDto {
	processTypeID: number | string
	partComplexity: number
	materialInfoList: any[]
	machineMaster: any
	[key: string]: any
}

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

export interface ESGCalculationResult {
	esgImpactCO2Kg: number
	esgImpactCO2KgScrap: number
	esgImpactCO2KgPart: number
	esgAnnualVolumeKg: number
	esgAnnualKgCO2: number
	esgAnnualKgCO2Part: number
}

export interface SubProcessDetailsExpected {
	weld1: {
		weldType: string
		weldPosition: string
		travelSpeed?: number
		weldLength?: number
		weldSize?: number
		tackWelds: number
		intermediateStops: number
		weldCycleTime: number
	}
	weld2: {
		weldType: string
		weldPosition: string
		travelSpeed?: number
		weldLength?: number
		weldSize?: number
		tackWelds: number
		intermediateStops: number
		weldCycleTime: number
	}
	machineType?: 'Automatic' | 'Semi-Auto' | 'Manual'
}

export interface SubProcessInfo {
	formLength: number
	shoulderWidth?: number
	noOfHoles?: number
	hlFactor?: number
	formPerimeter?: number
	formHeight?: number
	lengthOfCut?: number
}
export interface SingleWeldInput {
	totalWeldLength: number // mm
	travelSpeed: number // mm/sec
	tackWeldTimeSec?: number // sec per tack
	tackWeldCount?: number
	intermediateStopTimeSec?: number
	intermediateStops?: number
}

// ========================== Interfaces ==========================

// ========================== Interfaces ==========================

/** Weld row locators configuration */
export interface WeldRowLocators {
	weldCheck: Locator
	weldType: Locator
	weldSize: Locator
	wireDia?: Locator
	weldElementSize: Locator
	weldLength: Locator
	weldSide: Locator
	weldPlaces: Locator
	grindFlush: Locator
	totalWeldLength: Locator
	section?: Locator
	DryCycleTime: Locator


}
export interface MfgWeldRowLocators {
	MfgWeldCheck: Locator
	WeldTypeSubProcess: Locator
	WeldPositionSubProcess: Locator
	TravelSpeedSubProcess: Locator
	TackWeldSubProcess: Locator
	IntermediateStartStopSubProcess: Locator
	MfgWeldCycleTime: Locator
}
/** Weld row result */
export interface WeldRowResult {
	totalLength: number
	volume: number
	weldVolume: number
}

/** Sub-process data from UI */
export interface SubProcess {
	weldType: string
	weldPosition: string
	travelSpeed: number
	tackWelds: number
	intermediateStops: number
}
export interface VerificationConfig {
	locator: Locator
	expectedValue: number
	label: string
	precision?: number
	tolerancePercent?: number
}

/** Runtime welding context */
export interface RuntimeWeldingContext {
	processType?: string
	machineAutomation?: string
	machineName?: string
	machineDescription?: string
	efficiency?: number
	partComplexity?: number | string
	minCurrentRequired?: number
	minWeldingVoltage?: number
	selectedCurrent?: number
	selectedVoltage?: number
	subProcesses?: SubProcess[]
	cycleTime?: number
	subProcessCycleTimes?: number[]
	totalWeldLength?: number
	requiredCurrent?: number
	requiredVoltage?: number

}
export interface MaterialESGInput {
	grossWeight: number // grams
	scrapWeight: number // grams
	netWeight: number // grams
	eav: number
	esgImpactCO2Kg: number // CO2 per kg material
	esgImpactCO2KgScrap?: number // optional, for scrap
}

export interface ManufacturingInput {
	machineHourRate: number
	machineEfficiency: number
	lowSkilledLaborRatePerHour: number
	skilledLaborRatePerHour: number
	noOfLowSkilledLabours: number
	electricityUnitCost: number
	powerConsumptionKW: number
	yieldPercentage: number
	annualVolume: number
	setUpTime: number
	qaInspectorRate: number
	inspectionTime: number
	samplingRate: number
	netMaterialCost: number
	CycleTime: number
	totalWeldLength: number
	cuttingLength: number
	matWeldSize1: number
	matWeldSize2: number
	matWeldElementSize1: number
	matWeldElementSize2: number
	noOfWeldPasses: number
	partProjectedArea: number
	totalWeldCycleTime: number
	travelSpeed: number
	unloadingTime: number
	machineType: number
	netWeight: number
	density: number
	dryCycleTime: number
	RequiredVoltage: number
	RequiredCurrent: number
	SelectedVoltage: number
	SelectedCurrent: number
	netProcessCost: number
}

export interface MaterialESGResult {
	esgImpactCO2KgPart: number
	esgAnnualVolumeKg: number
	esgAnnualKgCO2: number
	esgAnnualKgCO2Part: number
	totalWeldMaterialWeight: number
	weldBeadWeightWithWastage: number
}

/** Manufacturing info gathered from UI */
export interface ManufacturingInfo {
	processType: ProcessType
	machineEfficiency: number
	density: number
	netWeight: number
	partVolume: number
	eav: number
	lotSize: number
	cycleTime: number
	loadingUnloadingTime: number
	partReorientation: number
	machineRatePerHour: number
	laborRatePerHour: number
	setupTime: number
	powerConsumption: number
	powerCostPerKwh: number
	totalWeldLength: number
	totalWeldMaterialWeight: number
	weldBeadWeightWithWastage: number
	inspectionRate: number
	yieldRate: number
	subProcesses: SubProcess[]
	subProcessCycleTimes: number[]
	processTypeID?: number | string
	partComplexity?: number | string
	machineMaster?: any
	materialInfoList?: any[]

	// Cost fields
	directMachineCost?: number
	directLaborCost?: number
	directSetUpCost?: number
	inspectionCost?: number
	yieldCost?: number
	totalPowerCost?: number
	directProcessCost?: number
	netMaterialCost?: number
}

/** Material dimensions and density */
export interface MaterialDimensionsAndDensity {
	length: number
	width: number
	height: number
	density: number
}

export interface MaterialProcessProperties extends MaterialDimensionsAndDensity {
	thermalDiffusivity: number
	thermalConductivity: number
	specificHeatCapacity: number
	meltTemp: number
	mouldTemp: number
	ejectionTemp: number
	clampingPressure: number
	tensileStrength?: number
	injectionRate: number
	materialTypeId?: number
	esgImpactCO2Kg?: number
	esgImpactCO2KgScrap?: number
}

/** Verification configuration for UI value checking */
export interface VerificationConfig {
	locator: Locator
	expectedValue: number
	label: string
	precision?: number
}

/** Cost verification item */
export interface CostVerificationItem {
	ui: Locator
	calc: number
	label: string
}

export interface CycleUIInputs {
	subProcessCycleTimes: number[]
	partReorientation: number
	loadingUnloadingTime: number
	efficiency: number[]
}

export interface SubProcessUIData {
	weldLength: number
	weldSide: string
}
export interface ManufacturingInfo {
	processType: ProcessType
	machineEfficiency: number
	density: number
	netWeight: number
	partVolume: number
	eav: number
	lotSize: number
	cycleTime: number
	loadingUnloadingTime: number
	partReorientation: number
	machineRatePerHour: number
	laborRatePerHour: number
	setupTime: number
	powerConsumption: number
	powerCostPerKwh: number
	totalWeldLength: number
	totalWeldMaterialWeight: number
	weldBeadWeightWithWastage: number
	inspectionRate: number
	yieldRate: number
	subProcesses: SubProcess[]
	subProcessCycleTimes: number[]
	processTypeID?: number | string
	partComplexity?: number | string
	machineMaster?: any
	materialInfoList?: any[]

	// Cost fields
	directMachineCost?: number
	directLaborCost?: number
	directSetUpCost?: number
	inspectionCost?: number
	yieldCost?: number
	totalPowerCost?: number
	directProcessCost?: number
	netMaterialCost?: number
}

export interface IMouldingInputs {
	paymentTermId: number
	commodityId: number
	machineName?: string;
	machineDescription?: string;
	machineId?: number;
	bomQty?: number;
	annualVolumeQty?: number;
	lotSize?: number;
	productLifeRemainingYrs?: number;
	lifeTimeQtyRemainingNos?: number;
	scrapPrice?: number;
	materialPrice?: number;
	volumePurchasingQtyNos?: number;
	volDiscountPer?: number;
	discountedMaterialPrice?: number;
	partEnvelopeLength?: number;
	partEnvelopeWidth?: number;
	partEnvelopeHeight?: number;
	maxWallThk?: number;
	WallAvgThk?: number;
	standardDeviation?: number;
	partProjectedArea?: number;
	partSurfaceArea?: number;
	partVolume?: number;
	PartNetWeight?: number;
	noOfInserts?: number;
	matUtilizationPer?: number;
	ScrapRecPer?: number;
	grossWeight?: number;
	scrapWeight?: number;
	ScrapRecoPer?: number;
	GrossMaterialCost?: number;
	scraprec?: number;
	regrindPer?: number;
	netMatCost?: number;
	sheetThickness?: number;
	//Cavity and Mold Type
	NoOfCavities?: number;
	NumberOfCavityLengthNos?: number;
	NumberOfCavityWidth?: number;
	RunnerDia?: number;
	RunnerLength?: number;
	NoOfExternalSideCores?: number;
	NoOfInternalSideCores?: number;
	UnscrewingUndercuts?: number;

	// Material Details
	density?: number;
	clampPr?: number;
	mouldTemp?: number;
	TensileStrength?: number;
	meltTemp?: number;
	ejectionTemp?: number;
	thermalDiffusivity?: number;
	//============== Manufacturing Information ================================
	recomTonnage?: number;
	selectedTonnage?: number;
	shotWeightRequired?: number;

	//================== Cycle Time Details ============================
	InsertsPlacement?: number;
	DryCycleTime?: number;
	InjectionTime?: number;
	SideCoreMechanisms?: number;
	CoolingTime?: number;
	PartEjection?: number;
	Others?: number;
	PackAndHoldTime?: number;
	TotalTime?: number;
	//==================== Manufacturing Details costs ===================
	samplingRate?: number;
	lowSkilledLaborRate?: number;
	SkilledLaborHours?: number;
	noOfLowSkilledLabours?: number;
	noOfSkilledLabours?: number;
	qaInspectorRate?: number;
	machineHourRate?: number;
	directMachineCost?: number;
	yieldPercentage?: number;
	setUpTime?: number;
	inspectionTime?: number;
	cycleTime?: number;

	yieldCost?: number;
	yieldPer?: number;
	directLaborCost?: number;
	inspectionCost?: number;
	directSetUpCost?: number;
	directProcessCost?: number;
	co2KwH?: number;
	co2Part?: number;
	insertsPlacement?: number;
	newToolingCostAllocation?: number;
	machineEfficiency?: number;
	powerConsumptionKW?: number;
	injectionRate?: number;
	shotSize?: number;
	platenSizeOfMachine?: string;
	dryCycleTime?: number;
	injectionTime?: number;
	sideCoreMechanisms?: number;
	coolingTime?: number;
	partEjection?: number;
	others?: number;
	packAndHoldTime?: number;
	totalTime?: number;
	// sustainability
	esgImpactCO2Kg?: number;
	esgImpactCO2KgScrap?: number;
	esgImpactCO2KgPart?: number;
	powerESG?: number;
	esgImpactAnnualKgCO2Part?: number;

	// Packaging details
	deliveryFrequency?: number;
	partsPerContainer?: number;
	qtyNeededPerShipment?: number;
	costPerContainer?: number;
	costPerUnit?: number;
	packagingWeight?: number;
	totalPackagingCost?: number;
	totalPackagCostPerShipment?: number;
	totalPackagCostPerUnit?: number;





}
export interface PlasticRubberVerificationOptions {
	/** Enable cycle time validation */
	verifyCycleTime?: boolean;

	/** Expected process time inputs (seconds) */
	expectedInputs?: {
		insertsPlacement?: number;
		dryCycleTime?: number;
		injectionTime?: number;
		coolingTime?: number;
		sideCoreMechanisms?: number;
		partEjection?: number;
		others?: number;
		packAndHoldTime?: number;
		totalTime?: number;
		cycleTime?: number;
	};

	/** Expected manufacturing & costing outputs */
	expectedCosts?: {
		/** Material-related */
		materialCost?: number;
		netMaterialCost?: number;
		scrapRecovery?: number;

		/** Manufacturing */
		manufacturingCost?: number;
		directMachineCost?: number;
		directLaborCost?: number;
		inspectionCost?: number;
		directSetUpCost?: number;
		yieldCost?: number;
		directProcessCost?: number;

		/** Commercial adders */
		overheadAndProfit?: number;
		packingCost?: number;
		freightCost?: number;

		/** Final */
		partShouldCost?: number;
		cycleTime?: number;
		totalTime?: number;
	};

	/** Sustainability validation (optional) */
	sustainability?: {
		IMouldingInputs?: {
			esgImpactCO2Kg?: number;
			esgImpactCO2KgScrap?: number;
			esgImpactCO2KgPart?: number;
			totalAnnualCO2?: number;
		};
	};

	/** Machine & labor validation */
	manufacturingParams?: {
		machineHourRate?: number;
		machineEfficiency?: number;
		noOfLowSkilledLabours?: number;
		noOfSkilledLabours?: number;
		lowSkilledLaborRate?: number;
		skilledLaborRate?: number;
	};

	/** Volume & yield checks */
	yieldAndVolume?: {
		yieldPercentage?: number;
		annualVolume?: number;
		lotSize?: number;


	};
}
