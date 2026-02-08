import { expect, Locator, Page, BrowserContext } from '@playwright/test'
import { BasePage } from '../lib/BasePage'
import Logger from '../lib/LoggerUtil'

import {
	calculateLotSize,
	calculateLifeTimeQtyRemaining,
	calculateNetWeight,
	calculateWeldVolume,
	calculateESG,
	calculateManufacturingCO2,

	WeldingCalculator,
	ProcessType,
	PartComplexity,
	MachineType,
	ProcessInfoDto,
	MaterialInfo
} from '../utils/welding-calculator'

import { getWeldElementSize } from 'test-data/mig-welding-testdata'
const logger = Logger

// ==================== PAGE OBJECT ====================
export class MigWeldingPage extends BasePage {
	// ==================== NAVIGATION LOCATORS ====================
	readonly projectSelectors: Locator
	readonly Projects: Locator
	readonly Active: Locator
	readonly SelectAnOption: Locator
	readonly ProjectValue: Locator
	readonly ApplyButton: Locator
	readonly ProjectID: Locator
	readonly ClearAll: Locator
	readonly projectOption: Locator
	// ==================== PART INFORMATION LOCATORS ====================
	readonly PartInformationTitle: Locator
	readonly PartDetails: Locator
	readonly InternalPartNumber: Locator
	readonly DrawingNumber: Locator
	readonly RevisionNumber: Locator
	readonly PartDescription: Locator
	readonly ManufacturingCategory: Locator
	readonly BOMQtyNos: Locator
	readonly AnnualVolumeQtyNos: Locator
	readonly LotsizeNos: Locator
	readonly ProductLifeRemainingYrs: Locator
	readonly LifeTimeQtyRemainingNos: Locator

	// ==================== SUPPLY TERMS LOCATORS ====================
	readonly SupplierDropdown: Locator
	readonly SupplierOptions: Locator
	readonly ManufacturingCity: Locator
	readonly ManufacturingCountry: Locator
	readonly DeliveryDropdown: Locator
	readonly DeliveryOptions: Locator
	readonly DeliveryCity: Locator
	readonly DeliveryCountry: Locator
	readonly SupplyTerms: Locator
	readonly IncoTerms: Locator
	readonly DeliveryFrequency: Locator
	readonly PackageType: Locator
	readonly PaymentTerms: Locator

	// ==================== MATERIAL INFORMATION LOCATORS ====================
	readonly MaterialInformationSection: Locator
	readonly MaterialDescription: Locator
	readonly MaterialInfo: Locator
	readonly SearchMaterials: Locator
	readonly SearchMtrlInput: Locator
	readonly materialCategory: Locator
	readonly MatFamily: Locator
	readonly DescriptionGrade: Locator
	readonly StockForm: Locator
	readonly ScrapPrice: Locator
	readonly MaterialPrice: Locator
	readonly VolumePurchased: Locator
	readonly VolumeDiscount: Locator
	readonly MatPriceGross: Locator
	readonly NetMaterialCost: Locator
	readonly PartThickness: Locator
	readonly PartEnvelopeLength: Locator
	readonly PartEnvelopeWidth: Locator
	readonly PartEnvelopeHeight: Locator
	readonly NetWeight: Locator
	readonly PartSurfaceArea: Locator
	readonly PartVolume: Locator
	//========================Physical Properties =================
	readonly MaterialDetailsTab: Locator
	readonly MatlDescrProp: Locator
	readonly Region: Locator
	readonly Density: Locator
	readonly YieldStrength: Locator
	readonly TensileStrength: Locator
	readonly ShearingStrength: Locator
	// ==================== WELDING DETAILS LOCATORS ====================
	readonly WeldingDetails: Locator
	readonly MatWeld1: Locator
	readonly MatWeldType1: Locator
	readonly MatWeldSize1: Locator
	readonly MatWireDia1: Locator
	readonly MatWeldElementSize1: Locator
	readonly MatNoOfWeldPasses1: Locator
	readonly MatWeldLengthmm1: Locator
	readonly MatWeldSide1: Locator
	readonly MatWeldPlaces1: Locator
	readonly MatGrishFlush1: Locator
	readonly MatTotalWeldLengthWeld1: Locator
	readonly MatTotalWeldLengthWeld2: Locator
	readonly MatWeldVolume1: Locator
	readonly MatWeld2: Locator
	readonly MatWeldType2: Locator
	readonly MatWeldSize2: Locator
	readonly MatNoOfWeldPasses2: Locator
	readonly MatWeldLengthmm2: Locator
	readonly MatWeldSide2: Locator
	readonly MatWeldPlaces2: Locator
	readonly MatGrishFlush2: Locator
	readonly MatTotalWeldLength2: Locator
	readonly MatWireDia2: Locator
	readonly MatWeldElementSize2: Locator
	readonly MatWeldVolume2: Locator
	readonly MatAddWeldButton: Locator

	// ==================== MANUFACTURING INFORMATION LOCATORS ====================
	readonly ManufacturingInformation: Locator
	readonly migWeldingRadioBtn: Locator
	readonly weldCleaningRadioBtn: Locator
	readonly ProcessGroup: Locator
	readonly MigWeldingProcessType: Locator
	readonly WeldCleaningProcessType: Locator
	readonly MachineType: Locator
	readonly MachineName: Locator
	readonly MachineDescription: Locator
	readonly MachineEfficiency: Locator
	readonly AdditionalDetails: Locator
	readonly PartComplexity: Locator
	readonly WeldPosition: Locator
	readonly MigWeldRadBtn: Locator
	readonly WeldCleanRadBtn: Locator
	//======== Sub Process Details Locators ========
	readonly SubProcessDetails: Locator
	readonly Weld1keyboard_arrow_down_1: Locator
	readonly Weld1keyboard_arrow_down_2: Locator
	readonly WeldTypeSubProcess1: Locator
	readonly weldTypeSubProcess2: Locator
	readonly WeldPositionSubProcess1: Locator
	readonly TravelSpeedSubProcess1: Locator
	readonly TrackWeldSubProcess1: Locator
	readonly IntermediateStartStopSubProcess1: Locator
	readonly Weld1CycleTimeSubProcess1: Locator
	readonly Weld2CycleTimeSubProcess2: Locator
	readonly WeldPositionSubProcess2: Locator
	readonly TravelSpeedSubProcess2: Locator
	readonly TrackWeldSubProcess2: Locator
	readonly IntermediateStartStopSubProcess2: Locator
	// ==================== WELDING MATERIAL COST LOCATORS ====================
	readonly TotalWeldLength: Locator
	readonly TotalWeldMaterialWeight: Locator
	readonly WeldBeadWeightWithWastage: Locator

	// ==================== CYCLE TIME & COSTS LOCATORS ====================
	readonly CycleTimeDetails: Locator
	readonly CycleTimePart: Locator
	readonly TravelSpeed: Locator
	readonly RequiredCurrent: Locator
	readonly RequiredVoltage: Locator
	readonly RequiredWeldingCurrent: Locator
	readonly selectedCurrent: Locator
	readonly selectedVoltage: Locator
	readonly ArcOnTime: Locator
	readonly ArcOffTime: Locator
	readonly UnloadingTime: Locator
	readonly PartReorientation: Locator

	// ==================== SUSTAINABILITY LOCATORS ====================
	readonly MatSustainability: Locator
	readonly MaterialInfoTab: Locator
	readonly CO2PerKgMaterial: Locator
	readonly CO2PerScrap: Locator
	readonly CO2PerPart: Locator
	readonly ManufacturingInformationSection: Locator
	readonly MachineDetailsTab: Locator
	readonly CO2PerKwHr: Locator
	readonly CO2PerPartManufacturing: Locator

	// ==================== COST FIELDS LOCATORS ====================
	readonly DirectLaborRate: Locator
	readonly NoOfDirectLabors: Locator
	readonly LaborCostPart: Locator
	readonly SkilledLaborRate: Locator
	readonly MachineSetupTime: Locator
	readonly SetupCostPart: Locator
	readonly MachineHourRate: Locator
	readonly MachineCostPart: Locator
	readonly QAInspectorRate: Locator
	readonly QAInspectionTime: Locator
	readonly QAInspectionCost: Locator
	readonly SamplingRate: Locator
	readonly YieldPercentage: Locator
	readonly YieldCostPart: Locator
	readonly PowerConsumption: Locator
	readonly ElectricityUnitCost: Locator
	readonly TotalPowerCost: Locator
	readonly NetProcessCost: Locator

	// ==================== TOOLING LOCATORS ====================
	readonly Tooling: Locator
	readonly ToolName: Locator
	readonly SourceCountry: Locator
	readonly ToolLife: Locator
	readonly NoOfShots: Locator

	// ==================== COST SUMMARY LOCATORS ====================
	readonly CostSummary: Locator
	readonly MaterialCost: Locator
	readonly ManufacturingCost: Locator
	readonly ToolingCost: Locator
	readonly OverheadProfit: Locator
	readonly PackingCost: Locator
	readonly EXWPartCost: Locator
	readonly FreightCost: Locator
	readonly DutiesTariff: Locator
	readonly PartShouldCost: Locator

	// ==================== ACTION LOCATORS ====================
	readonly UpdateSave: Locator
	readonly RecalculateCost: Locator
	readonly ExpandAll: Locator
	readonly CollapseAll: Locator
	readonly CostingNotes: Locator

	// ==================== CONSTRUCTOR ====================
	constructor(page: Page, context: BrowserContext) {
		super(page, context)

		// Navigation
		this.projectSelectors = page.locator('.mat-select-trigger')
		this.Projects = page.getByRole('link', { name: 'Projects' })
		this.projectOption = this.page.getByRole('option', { name: 'Project #' })
		this.Active = page.getByRole('tab', { name: 'ACTIVE' })
		this.SelectAnOption = page.locator('#mat-select-value-0')
		this.ProjectValue = page.locator("input[name='searchValue']")
		this.ApplyButton = page.getByRole('button', { name: 'Apply' })
		this.ProjectID = page.locator('div.container.ng-star-inserted')
		this.ClearAll = page.getByText('Clear All')

		// Part Information
		this.PartInformationTitle = page
			.locator('.mat-expansion-panel-header-title')
			.nth(0)
		this.PartDetails = page.getByRole('tab', { name: 'Part Details' })
		this.InternalPartNumber = page.locator("//input[@name='IntPartNumber']")
		this.DrawingNumber = page.locator('input[formcontrolname="drawingNumber"]')
		this.RevisionNumber = page.getByPlaceholder('Enter Revision value')
		this.PartDescription = page.getByRole('textbox', {
			name: 'Enter Part Description'
		})
		this.ManufacturingCategory = page.locator(
			"select[formcontrolname='commdityvalue']"
		)
		this.BOMQtyNos = page.getByPlaceholder('Enter Qty')
		this.AnnualVolumeQtyNos = page.getByPlaceholder(
			'Estimated Annual Volume (EAV)'
		)
		this.LotsizeNos = page.getByPlaceholder('Lot size')
		this.ProductLifeRemainingYrs = page.getByPlaceholder('Product life')
		this.LifeTimeQtyRemainingNos = page.getByPlaceholder('Life time quantity')

		// Supply Terms
		this.SupplierDropdown = page.locator('[formcontrolname="supplierName"]')
		this.SupplierOptions = page.locator(
			'mat-option span.mdc-list-item__primary-text, mat-option span'
		)
		this.ManufacturingCity = page.locator('[formcontrolname="mfrCity"]')
		this.ManufacturingCountry = page.locator(
			'[formcontrolname="ManufacturingCountry"]'
		)
		this.DeliveryDropdown = page.locator(
			'input[formcontrolname="DeliverySite"]'
		)
		this.DeliveryOptions = page.locator(
			'mat-option span.mdc-list-item__primary-text, mat-option span'
		)
		this.DeliveryCity = page.locator('[formcontrolname="DeliveryCity"]')
		this.DeliveryCountry = page.locator('[formcontrolname="DeliveryCountry"]')
		this.SupplyTerms = page.getByRole('tab', { name: 'Supply Terms' })
		this.IncoTerms = page.locator('[formcontrolname="IncoTerms"]')
		this.DeliveryFrequency = page.locator(
			'input[formcontrolname="DeliveryFrequency"]'
		)
		this.PackageType = page.locator('select[formcontrolname="packingtype"]')
		this.PaymentTerms = page.locator('select[formcontrolname="PaymentTerms"]')

		// Material Information
		this.MaterialInformationSection = page.locator(
			"//h6[@class='cls-item-head ng-star-inserted']"
		)
		this.MaterialDescription = page
			.locator('.mat-expansion-panel-header-title')
			.nth(1)
		this.MaterialInfo = page.getByRole('tab', { name: 'Material Info' })
		this.SearchMaterials = page.getByText('Search Materials')
		this.SearchMtrlInput = page.locator(
			'input[placeholder="Search by keywords"]'
		)
		this.materialCategory = page.locator(
			"select[formcontrolname='materialCategory']"
		)
		this.MatFamily = page.locator('select[formcontrolname="materialFamily"]')
		this.DescriptionGrade = page.locator(
			'select[formcontrolname="materialDescription"]'
		)
		this.StockForm = page.locator('select[formcontrolname="stockForm"]').first()
		this.ScrapPrice = page.locator('input[formcontrolname="scrapPrice"]')
		this.MaterialPrice = page.locator('input[formcontrolname="matPrice"]')
		this.VolumePurchased = page.locator(
			'input[formcontrolname="volumePurchased"]'
		)
		this.VolumeDiscount = page.locator(
			'input[formcontrolname="volumeDiscountPer"]'
		)
		this.NetMaterialCost = page.locator(
			'input[formcontrolname="netMaterialCost"]'
		)
		this.MatPriceGross = page.locator('input[formcontrolname="matPriceGross"]')
		this.PartThickness = page
			.locator(
				'.card.ng-star-inserted > .card-body > .row > div:nth-child(4) > .form-control'
			)
			.first()
		this.PartEnvelopeLength = page.getByPlaceholder('Length')
		this.PartEnvelopeWidth = page.getByPlaceholder('Width')
		this.PartEnvelopeHeight = page.getByPlaceholder('Height')
		this.NetWeight = page.locator('input[formcontrolname="netWeight"]')
		this.PartVolume = page.locator('input[formcontrolname="partVolume"]')
		this.PartSurfaceArea = page.locator(
			'input[formcontrolname="partSurfaceArea"]'
		)
		// Material Details
		this.MaterialDetailsTab = page.getByText('Material Details', {
			exact: true
		})
		this.MatlDescrProp = page.locator('input[formcontrolname="materialDesc"]')
		this.Region = page.locator('input[formcontrolname="countryName"]')
		this.Density = page.locator('input[formcontrolname="density"]')
		this.YieldStrength = page.locator('input[formcontrolname="moldTemp"]')
		this.TensileStrength = page.locator(
			'input[formcontrolname="ultimateTensileStrength"]'
		)
		this.ShearingStrength = page.locator('input[formcontrolname="meltTemp"]')

		// Welding Details
		this.WeldingDetails = page.locator(
			'//div[normalize-space(text())="Welding Details"]'
		)
		this.MatWeld1 = page.locator(
			"(//mat-icon[@role='img'][normalize-space()='keyboard_arrow_down'])[3]"
		)
		this.MatWeldType1 = page.locator(
			"(//select[@formcontrolname='coreShape'])[1]"
		)
		this.MatWeldSize1 = page.locator(
			"(//input[@formcontrolname='coreHeight'])[1]"
		)
		this.MatWireDia1 = page.locator(
			"(//input[@formcontrolname='coreWidth'])[1]"
		)
		this.MatWeldElementSize1 = page.locator(
			"(//input[@formcontrolname='coreWeight'])[1]"
		)
		this.MatNoOfWeldPasses1 = page.locator(
			"(//input[@formcontrolname='noOfCore'])[1]"
		)
		this.MatWeldLengthmm1 = page.locator(
			"(//input[@formcontrolname='coreLength'])[1]"
		)
		this.MatWeldSide1 = page.locator(
			"(//select[@formcontrolname='coreArea'])[1]"
		)
		this.MatWeldPlaces1 = page.locator(
			"(//input[@formcontrolname='coreVolume'])[1]"
		)
		this.MatGrishFlush1 = page.locator(
			"(//select[@formcontrolname='grindFlush'])[1]"
		)
		this.MatGrishFlush2 = page.locator(
			"(//select[@formcontrolname='grindFlush'])[2]"
		)
		this.MatTotalWeldLengthWeld1 = page.locator(
			"(//input[@formcontrolname='weldSide'])[1]"
		)
		this.MatTotalWeldLengthWeld2 = page.locator(
			"(//input[@formcontrolname='weldSide'])[2]"
		)
		this.MatWeldVolume1 = page.locator(
			'(//input[@formcontrolname="coreSandPrice"])[1]'
		)
		this.MatWeldVolume2 = page.locator(
			'(//input[@formcontrolname="coreSandPrice"])[2]'
		)
		this.MatWeld2 = page.locator(
			"(//mat-icon[@role='img'][normalize-space()='keyboard_arrow_down'])[4]"
		)
		this.MatWeldType2 = page.locator(
			'(//select[@formcontrolname="coreShape"])[2]'
		)
		this.MatWeldSize2 = page.locator(
			'(//input[@formcontrolname="coreHeight"])[2])'
		)
		this.MatNoOfWeldPasses2 = page.locator(
			'(//input[@formcontrolname="noOfCore"][2])'
		)
		this.MatWeldLengthmm2 = page.locator(
			'(//input[@formcontrolname="coreLength"][2])'
		)
		this.MatTotalWeldLength2 = page.locator(
			'(//input[@formcontrolname="weldSide"][2])'
		)
		this.MatWireDia2 = page.locator(
			'(//input[@formcontrolname="coreWidth"][2])'
		)
		this.MatWeldElementSize2 = page.locator(
			'(//input[@formcontrolname="coreWeight"][2])'
		)
		this.MatWeldSide2 = page.locator(
			'(//select[@formcontrolname="coreArea"][2])'
		)
		this.MatWeldPlaces2 = page.locator(
			'(//input[@formcontrolname="coreVolume"][2])'
		)
		this.MatWeldVolume2 = page.locator(
			'(//input[@formcontrolname="coreSandPrice"][2])'
		)
		this.MatAddWeldButton = page.getByRole('button', { name: /Add Weld/i })

		// Manufacturing Information
		this.ManufacturingInformation = page.locator(
			"//h6[normalize-space(text())='Manufacturing Information']"
		)
		this.migWeldingRadioBtn = page.locator("(//input[@name='editRow'])[1]")
		this.weldCleaningRadioBtn = page.locator("(//input[@name='editRow'])[2]")
		this.ProcessGroup = page.locator(
			"//select[@formcontrolname='matPrimaryProcessName']"
		)
		this.MigWeldingProcessType = page.locator(
			"//td[normalize-space(text())='Mig Welding']"
		)
		this.WeldCleaningProcessType = page.locator(
			"//td[normalize-space(text())='Weld Cleaning']"
		)
		this.MachineType = page.locator("select[formcontrolname='semiAutoOrAuto']")
		this.MachineName = page.locator('select[formcontrolname="machineId"]')
		this.MachineDescription = page.locator(
			"(//label[contains(.,'Machine Description')]/following::input)[1]"
		)
		this.MachineEfficiency = page.locator('input[formcontrolname="efficiency"]')
		this.PartComplexity = page.locator(
			"//select[@formcontrolname='partcomplexcity']"
		)
		this.WeldPosition = page.locator("select[formcontrolname='weldPosition']")
		this.AdditionalDetails = page.locator(
			"//span[normalize-space(text())='Additional Details']"
		)
		this.MigWeldRadBtn = page.locator(
			"//td[contains(text(), 'Mig Welding')]/preceding-sibling::td//input[@type='radio']"
		)
		this.WeldCleanRadBtn = page.locator(
			"//td[contains(text(), 'Weld Cleaning')]/preceding-sibling::td//input[@type='radio']"
		)
		// Cycle Time & Costs
		this.CycleTimeDetails = page.getByText('Cycle Time Details')
		this.CycleTimePart = page.locator('input[name="cycleTime"]')
		this.TravelSpeed = page.locator('input[formcontrolname="travelSpeed"]')
		this.RequiredCurrent = page.locator(
			"//input[@formcontrolname='requiredCurrent']"
		)
		this.RequiredVoltage = page.locator(
			"//input[@formcontrolname='requiredWeldingVoltage']"
		)
		this.RequiredWeldingCurrent = page.locator(
			'input[formcontrolname="requiredCurrent"]'
		)
		this.selectedCurrent = page.locator(
			"(//label[contains(.,'Selected Current (Amps)')]/following::input)[1]"
		)
		this.selectedVoltage = page.locator(
			"//input[@formcontrolname='platenSizeLength']"
		)
		this.ArcOnTime = page.locator('input[formcontrolname="arcOnTime"]')
		this.ArcOffTime = page.locator('input[formcontrolname="arcOffTime"]')
		this.UnloadingTime = page.locator('input[formcontrolname="unloadingTime"]')
		this.PartReorientation = page.locator(
			"//input[@formcontrolname='partReorientation']"
		)
		// Welding Material Cost
		this.TotalWeldLength = page.locator(
			'input[formcontrolname="totalWeldLength"]'
		)
		this.TotalWeldMaterialWeight = page.locator(
			"//input[@formcontrolname='grossWeight']"
		)
		this.WeldBeadWeightWithWastage = page.locator(
			"//input[@formcontrolname='weldWeightWastage']"
		)

		// Sub Process Details
		this.SubProcessDetails = page.getByText('Sub Process Details')
		this.Weld1keyboard_arrow_down_1 = page.locator(
			"(//div[@class='col-4']//h6)[1]"
		)
		this.Weld1keyboard_arrow_down_2 = page.locator(
			"(//div[@class='col-4']//h6)[2]"
		)
		this.WeldTypeSubProcess1 = page.locator(
			"(//select[@formcontrolname='lengthOfCut'])[1]"
		)
		this.weldTypeSubProcess2 = page.locator(
			"(//select[@formcontrolname='lengthOfCut'])[2]"
		)
		this.WeldPositionSubProcess1 = page.locator(
			"(//select[@formcontrolname='formLength'])[1]"
		)
		this.WeldPositionSubProcess2 = page.locator(
			"(//select[@formcontrolname='formLength'])[2]"
		)
		this.TravelSpeedSubProcess1 = page.locator(
			"(//input[@formcontrolname='formHeight'])[1]"
		)
		this.TravelSpeedSubProcess2 = page.locator(
			"(//input[@formcontrolname='formHeight'])[2]"
		)
		this.TrackWeldSubProcess1 = page.locator(
			"(//input[@formcontrolname='hlFactor'])[1]"
		)
		this.TrackWeldSubProcess2 = page.locator(
			"(//input[@formcontrolname='hlFactor'])[2]"
		)
		this.IntermediateStartStopSubProcess1 = page.locator(
			"(//input[@formcontrolname='formPerimeter'])[1]"
		)
		this.IntermediateStartStopSubProcess2 = page.locator(
			"(//input[@formcontrolname='formPerimeter'])[2]"
		)
		this.Weld1CycleTimeSubProcess1 = page.locator(
			"(//input[@formcontrolname='recommendTonnage'])[1]"
		)
		this.Weld2CycleTimeSubProcess2 = page.locator(
			"(//input[@formcontrolname='recommendTonnage'])[2]"
		)

		// Sustainability
		this.MatSustainability = page
			.locator('span')
			.filter({ hasText: 'Sustainability' })
			.first()
		this.MaterialInfoTab = this.MaterialInfo
		this.CO2PerKgMaterial = page.locator('input[formcontrolname="co2PerKg"]')
		const co2PerScrap = (this.CO2PerScrap = page.locator(
			'input[formcontrolname="co2PerScrap"]'
		))
		const co2PerPart = (this.CO2PerPart = page
			.locator('input[formcontrolname="co2PerPart"]')
			.first())
		this.ManufacturingInformationSection = this.ManufacturingInformation
		this.MachineDetailsTab = page.getByRole('tab', { name: 'Machine Details' })
		this.CO2PerKwHr = page.locator('input[formcontrolname="co2PerKwHr"]')
		this.CO2PerPartManufacturing = page
			.locator('input[formcontrolname="co2PerPart"]')
			.nth(1)

		// Cost Fields
		this.DirectLaborRate = page.locator(
			'input[formcontrolname="lowSkilledLaborRatePerHour"]'
		)
		this.NoOfDirectLabors = page.locator(
			'input[formcontrolname="noOfLowSkilledLabours"]'
		)
		this.LaborCostPart = page.locator(
			'input[formcontrolname="directLaborCost"]'
		)
		this.SkilledLaborRate = page.locator(
			'input[formcontrolname="skilledLaborRatePerHour"]'
		)
		this.MachineSetupTime = page.locator('input[formcontrolname="setUpTime"]')
		this.SetupCostPart = page.locator(
			'input[formcontrolname="directSetUpCost"]'
		)
		this.MachineHourRate = page.locator('input[name="machineHourRate"]')
		this.MachineCostPart = page.locator('input[name="directMachineCost"]')
		this.QAInspectorRate = page.locator(
			'input[formcontrolname="qaOfInspectorRate"]'
		)
		this.QAInspectionTime = page.locator('input[name="inspectionTime"]')
		this.QAInspectionCost = page.locator('input[name="inspectionCost"]')
		this.SamplingRate = page.locator('input[formcontrolname="samplingRate"]')
		this.YieldPercentage = page.locator('input[name="yieldPer"]')
		this.YieldCostPart = page.locator('input[name="yieldCost"]')
		this.PowerConsumption = page.locator(
			'input[formcontrolname="powerConsumption"]'
		)
		this.ElectricityUnitCost = page.locator(
			'input[formcontrolname="electricityUnitCost"]'
		)
		this.TotalPowerCost = page.locator(
			'input[formcontrolname="totalPowerCost"]'
		)
		this.NetProcessCost = page.locator(
			'.mat-mdc-tab-body-content > div:nth-child(2) > .row > .col-4 > .form-control'
		)

		// Tooling
		this.Tooling = page.getByRole('button', { name: 'Tooling' })
		this.ToolName = page
			.locator(
				'.ng-valid.ng-touched > div > .card-body > div > div > .form-control'
			)
			.first()
		this.SourceCountry = page
			.getByRole('region', { name: 'Tooling' })
			.getByPlaceholder('Select Delivery Country')
		this.ToolLife = page
			.locator(
				'.ng-valid.ng-touched > div > .card-body > div > div:nth-child(3) > .form-control'
			)
			.first()
		this.NoOfShots = page
			.locator(
				'.ng-valid > div > .card-body > div > .col-4.mt-3 > .form-control'
			)
			.first()

		// Cost Summary
		this.CostSummary = page.getByRole('heading', { name: 'Cost Summary' })
		this.MaterialCost = page.locator('#MaterialCostAmount')
		this.ManufacturingCost = page.locator('#ManufacturingCostAmount')
		this.ToolingCost = page.locator('#ToolingCostAmount')
		this.OverheadProfit = page
			.getByRole('tabpanel', { name: 'Cost' })
			.locator('#OverheadandProfitAmount')
		this.PackingCost = page
			.locator('div:nth-child(6) > div:nth-child(2) > .input-icon')
			.first()
		this.EXWPartCost = page.locator('#EXWPartCostAmount')
		this.FreightCost = page.locator('#FreightCostAmount')
		this.DutiesTariff = page.locator('#DutiesandTariffAmount')
		this.PartShouldCost = page
			.getByRole('tabpanel', { name: 'Cost' })
			.locator('#ShouldCostAmount')
		this.UpdateSave = page.getByRole('button', { name: 'Update & Save' })
		this.RecalculateCost = page.getByRole('button', {
			name: 'Recalculate Cost'
		})
		this.ExpandAll = page.getByRole('button', { name: 'Expand All' })
		this.CollapseAll = page.getByRole('button', { name: 'Collapse All' })
		this.CostingNotes = page.locator(
			"//label[text()='Costing Notes']/following-sibling::div"
		)
	}
}
