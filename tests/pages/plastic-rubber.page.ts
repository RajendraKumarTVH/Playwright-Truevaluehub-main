import { Locator, Page, BrowserContext } from '@playwright/test'
import { BasePage } from '../lib/BasePage'

export class PlasticRubberPage extends BasePage {
	// ==================== NAVIGATION LOCATORS ====================
	readonly projectSelectors: Locator
	readonly Active: Locator
	readonly SelectAnOption: Locator
	readonly ProjectValue: Locator
	readonly ApplyButton: Locator
	readonly ProjectID: Locator
	readonly ClearAll: Locator
	readonly projectIcon: Locator
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
	readonly LotSize: Locator
	readonly ProductLifeRemainingYrs: Locator
	readonly LifeTimeQtyRemainingNos: Locator
	readonly AdditionalDetails: Locator
	readonly PartComplexity: Locator

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
	readonly DiscountedMaterialPrice: Locator
	readonly MatPriceGross: Locator
	readonly NetMaterialCost: Locator
	readonly PartThickness: Locator
	readonly PartEnvelopeLength: Locator
	readonly PartEnvelopeWidth: Locator
	readonly PartEnvelopeHeight: Locator
	readonly PartSurfaceArea: Locator
	readonly PartVolume: Locator
	readonly PartNetWeight: Locator
	readonly MaxWallThick: Locator
	readonly WallAverageThickness: Locator
	readonly StandardDeviation: Locator
	readonly PartProjectedArea: Locator
	readonly NumberOfInserts: Locator
	readonly MaterialUtilisationPer: Locator
	readonly PartGrossWeight: Locator
	readonly PartScrapWeight: Locator
	readonly ScrapRecoveryPer: Locator
	readonly PartGrossMaterialCost: Locator
	readonly PartScrapRecovery: Locator
	readonly RegrindPer: Locator
	//Cavity and Mold Type
	readonly MouldCavityTab: Locator
	readonly NoOfCavities: Locator
	readonly NumberOfCavityLengthNos: Locator
	readonly NumberOfCavityWidth: Locator
	readonly RunnerType: Locator
	readonly RunnerDia: Locator
	readonly RunnerLength: Locator
	readonly NoOfExternalSideCores: Locator
	readonly NoOfInternalSideCores: Locator
	readonly UnscrewingUndercuts: Locator

	//=========================== Material Sustainability  ==================================
	readonly MaterialSustainability: Locator
	readonly esgImpactCO2Kg: Locator
	readonly esgImpactCO2KgScrap: Locator
	readonly esgImpactCO2KgPart: Locator
	//========================Physical Properties =================
	readonly MaterialDetailsTab: Locator
	readonly MatlDescrProp: Locator
	readonly Region: Locator
	readonly Density: Locator
	readonly ClampingPressure: Locator
	readonly MouldTemp: Locator
	readonly MeltTemp: Locator
	readonly EjecTemp: Locator
	//=========================== Manufacturing Information ==================================
	readonly ManufacturingInformation: Locator
	readonly MfgDetailsTab: Locator
	readonly InjectionMouldingSingleShot: Locator
	readonly ProcessGroup: Locator
	readonly NewToolingCostAllocation: Locator
	readonly RecommendTonnage: Locator
	readonly SelectedTonnage: Locator
	readonly RequiredPlatenSize: Locator
	readonly PlatenSizeOfMachine: Locator
	readonly ShotWeightRequired: Locator
	readonly ShotWeightOfMachine: Locator
	readonly MachineType: Locator
	readonly MachineName: Locator
	readonly MachineDescription: Locator
	readonly MachineEfficiency: Locator
	readonly DirectProcessCost: Locator
	// Process Times & Params
	readonly CoolingTime: Locator
	readonly InsertsPlacement: Locator
	readonly PartEjection: Locator
	readonly SideCoreMechanisms: Locator
	readonly Others: Locator
	readonly PackAndHoldTime: Locator
	readonly InjectionTime: Locator
	readonly DryCycleTime: Locator
	readonly TotalTime: Locator
	readonly CycleTime: Locator

	// Costs & Rates

	readonly MachineHourRate: Locator
	readonly SetUpTime: Locator
	readonly NoOfLowSkilledLabours: Locator
	readonly NoOfSkilledLabours: Locator
	readonly SkilledLaborHours: Locator
	readonly LowSkilledLaborRate: Locator
	readonly DirectLaborCost: Locator
	readonly InspectionCost: Locator
	readonly DirectMachineCost: Locator
	readonly SamplingRate: Locator
	readonly InspectionTime: Locator
	readonly QAInspectorRate: Locator
	readonly DirectSetUpCost: Locator
	readonly YieldCost: Locator
	readonly YieldPercentage: Locator

	//Machine sustainability
	readonly PowerESG: Locator
	readonly Co2Part: Locator

	//Packaging Information
	readonly PackagingExpPanel: Locator
	readonly PartsPerShipment: Locator
	readonly WeightPerShipment: Locator
	readonly VolumePerShipment: Locator
	readonly MaterialFinish: Locator
	readonly FragileOrSpeciality: Locator
	readonly Freight: Locator

	// Packaging Materials Table
	readonly PackagingTableRows: Locator
	readonly AddPackagingBtn: Locator

	// Packaging Material Details (form below table)
	readonly PrimaryEditBtn: Locator
	readonly SecondaryEditBtn: Locator
	readonly TertiaryEditBtn: Locator
	readonly PackagingType: Locator
	readonly PackagingMaterial: Locator
	readonly PackageDescription: Locator
	readonly PackagingWeight: Locator
	readonly PackageMaxCapacity: Locator
	readonly PackageMaxVolume: Locator
	readonly LaborRequiredPerPackage: Locator
	readonly DirectLaborRate: Locator
	readonly LaborCostPerPart: Locator
	readonly PartsPerContainer: Locator
	readonly QuantityNeededPerShipment: Locator
	readonly CostPerContainer: Locator
	readonly CostPerUnit: Locator
	readonly CO2PerUnit: Locator

	//================== Overhead & Profit ================================
	readonly OverheadProfitExpPanel: Locator

	// Overhead Section
	readonly OverheadTotal: Locator
	readonly MaterialOverheadPer: Locator
	readonly MaterialOverheadCost: Locator
	readonly FactoryOverheadPer: Locator
	readonly FactoryOverheadCost: Locator
	readonly SGAndAPer: Locator
	readonly SGAndACost: Locator

	// Profit Section
	readonly MaterialProfitPer: Locator
	readonly ManufacturingProfitPer: Locator
	readonly ProfitCost: Locator

	// Cost of Capital Section
	readonly CostOfCapitalTotal: Locator
	readonly InventoryCarryingTotal: Locator
	readonly RawMaterialsPer: Locator
	readonly RawMaterialsCost: Locator
	readonly FinishGoodsPer: Locator
	readonly FinishGoodsCost: Locator
	readonly PaymentTermsPer: Locator
	readonly PaymentTermsCost: Locator

	//================== Logistics Cost ================================
	readonly LogisticsCostExpPanel: Locator
	readonly LogisticsCostTab: Locator
	readonly LogisticsMapTab: Locator

	// Logistics Fields
	readonly ModeOfTransport: Locator
	readonly ShipmentType: Locator
	readonly ContainerType: Locator
	readonly FullContainerCost: Locator
	readonly PercentOfContainerNeeded: Locator
	readonly FreightCostPerShipment: Locator
	readonly FreightCostPerUnit: Locator

	// Cost Summary
	readonly MaterialCost: Locator
	readonly ManufacturingCost: Locator
	readonly ToolingCost: Locator
	readonly OverheadAndProfit: Locator
	readonly PackingCost: Locator
	readonly ExWPartCost: Locator
	readonly FreightCost: Locator
	readonly DutiesAndTariff: Locator
	readonly PartShouldCost: Locator

	// Buttons
	readonly UpdateSaveBtn: Locator
	readonly RecalculateCostBtn: Locator

	constructor(page: Page, context: BrowserContext) {
		super(page, context)
		// Navigation
		this.projectSelectors = page.locator('.mat-select-trigger')
		this.projectIcon = page.locator(
			"mat-icon[data-mat-icon-name='project_icon']"
		)
		this.Active = page.getByRole('tab', { name: 'ACTIVE' })
		this.SelectAnOption = page.locator(
			"(//mat-select[contains(@class,'mat-mdc-select search-bar-overlay')]//div)[1]"
		)
		this.ProjectValue = page.locator("input[name='searchValue']")
		this.ApplyButton = page.getByRole('button', { name: 'Apply' })
		this.ProjectID = page.locator('div.container.ng-star-inserted')
		this.ClearAll = page.getByText('Clear All')
		// Part Information
		this.PartInformationTitle = page
			.locator('.mat-expansion-panel-header-title')
			.nth(0)
		this.PartDetails = page.locator(
			"//span[normalize-space(text())='Part Details']"
		)
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
		this.AnnualVolumeQtyNos = page.locator(
			"//input[@formcontrolname='AnnualVolume']"
		)
		this.LotSize = page.locator('input[formcontrolname="lotsize"]')
		this.ProductLifeRemainingYrs = page.locator(
			"//input[@formcontrolname='prodLifeRemaining']"
		)
		this.LifeTimeQtyRemainingNos = page.locator(
			"//input[@formcontrolname='lifeTimeQtyRemaining']"
		)
		this.AdditionalDetails = page.locator(
			"//span[normalize-space(text())='Additional Details']"
		)
		this.PartComplexity = page.locator(
			"(//div[@class='dropdown-wrap']//select)[1]"
		)
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

		//Additional Details
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
		this.ScrapPrice = page
			.locator('input[formcontrolname="scrapPrice"]')
			.first()
		this.MaterialPrice = page.locator('input[formcontrolname="matPrice"]')
		this.VolumePurchased = page.locator(
			'(//label[contains(.,"Volume Purchased (Ton/Contract)")]/following::input)[1]'
		)
		this.VolumeDiscount = page.locator(
			'input[formcontrolname="volumeDiscountPer"]'
		)
		this.DiscountedMaterialPrice = page.locator(
			'input[formcontrolname="matPriceGross"]'
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
		this.MaxWallThick = page.locator('input[formcontrolname="maxWallthick"]')
		this.WallAverageThickness = page.locator(
			'input[formcontrolname="wallAverageThickness"]'
		)
		this.StandardDeviation = page.locator(
			'input[formcontrolname="standardDeviation"]'
		)
		this.PartProjectedArea = page.locator(
			'input[formcontrolname="partProjectArea"]'
		)
		this.PartSurfaceArea = page.locator(
			'input[formcontrolname="partSurfaceArea"]'
		)
		this.PartVolume = page.locator('input[formcontrolname="partVolume"]')
		this.PartNetWeight = page.locator(
			'//*[@id="mat-tab-group-3-content-0"]/div/div[2]/app-injection-molding-material/div/div/div[2]/div/div[10]/input'
		)
		this.NumberOfInserts = page.locator('input[formcontrolname="noOfInserts"]')
		this.MaterialUtilisationPer = page.locator(
			'input[formcontrolname="utilisationPer"]'
		)
		this.PartGrossWeight = page.locator('input[formcontrolname="grossWeight"]')
		this.PartScrapWeight = page.locator('input[formcontrolname="scrapWeight"]')
		this.ScrapRecoveryPer = page.locator(
			'input[formcontrolname="scrapRecovery"]'
		)
		this.PartGrossMaterialCost = page.locator(
			'input[formcontrolname="shotSize"]'
		)
		this.PartScrapRecovery = page.locator(
			'input[formcontrolname="scrapRecCost"]'
		)
		this.RegrindPer = page.locator('input[formcontrolname="regrindAllowance"]')
		this.NetMaterialCost = page.locator(
			'input[formcontrolname="netMaterialCost"]'
		)

		//Cavity and Mold Type
		this.MouldCavityTab = page.locator(
			'div[aria-controls="mat-tab-group-3-content-1"]'
		)
		this.NoOfCavities = page.locator('input[formcontrolname="noOfCavities"]')
		this.NumberOfCavityLengthNos = page.locator(
			'input[formcontrolname="cavityArrangementLength"]'
		)
		this.NumberOfCavityWidth = page.locator(
			'input[formcontrolname="cavityArrangementWidth"]'
		)
		this.RunnerType = page.locator('select[formcontrolname="runnerType"]')
		this.RunnerDia = page.locator('input[formcontrolname="runnerDia"]')
		this.RunnerLength = page.locator('input[formcontrolname="runnerLength"]')
		this.NoOfExternalSideCores = page.locator(
			'input[formcontrolname="totalWeldLength"]'
		)
		this.NoOfInternalSideCores = page.locator(
			'input[formcontrolname="totalWeldBeadArea"]'
		)
		this.UnscrewingUndercuts = page.locator('input[formcontrolname="beadSize"]')
		// ======================== Material Details ==================================
		this.MaterialDetailsTab = page.getByRole('tab', {
			name: 'Material Details',
			exact: true
		})
		this.MatlDescrProp = page.locator('input[formcontrolname="materialDesc"]')
		this.Region = page.locator('input[formcontrolname="countryName"]')
		this.Density = page.locator('(//input[@formcontrolname="density"])').first()
		this.ClampingPressure = page.locator(
			'input[formcontrolname="clampingPressure"]'
		)
		this.MouldTemp = page.locator('input[formcontrolname="moldTemp"]')
		this.MeltTemp = page.locator('input[formcontrolname="meltTemp"]')
		this.EjecTemp = page.locator('input[formcontrolname="ejectTemp"]')

		//================== Material Sustainability ================================
		this.MaterialSustainability = page.locator(
			"//div[contains(@class,'card-header')]//span[contains(text(),'Material Sustainability')]"
		)
		this.esgImpactCO2Kg = page.locator('input[formcontrolname="co2KgMaterial"]')
		this.esgImpactCO2KgScrap = page.locator(
			'input[formcontrolname="co2KgScrap"]'
		)
		this.esgImpactCO2KgPart = page.locator(
			'(//label[contains(.,"CO2(kg)/part:")]/following::input)[1]'
		)
		//============== Manufacturing Information ================================
		this.ManufacturingInformation = page.locator(
			"//h6[normalize-space(text())='Manufacturing Information']"
		)
		this.MfgDetailsTab = page.getByRole('tab', {
			name: 'Manufacturing Details'
		})
		this.InjectionMouldingSingleShot = page.locator(
			"//tr[.//td[normalize-space()='Injection Moulding-Single Shot']]//input[@name='editRow']"
		)
		this.ProcessGroup = page.locator(
			"//select[@formcontrolname='matPrimaryProcessName']"
		)
		this.NewToolingCostAllocation = page.locator(
			'input[formcontrolname="liquidTemp"]'
		)
		this.RecommendTonnage = page.locator(
			'input[formcontrolname="recommendTonnage"]'
		)
		this.SelectedTonnage = page.locator(
			'input[formcontrolname="selectedTonnage"]'
		)
		this.RequiredPlatenSize = page.locator(
			'input[formcontrolname="requiredPlatenSize"]'
		)
		this.PlatenSizeOfMachine = page.locator(
			'input[formcontrolname="selectedBedSize"]'
		)
		this.ShotWeightRequired = page.locator(
			'input[formcontrolname="requiredCurrent"]'
		)
		this.ShotWeightOfMachine = page.locator('input[formcontrolname="shotSize"]')
		this.MachineType = page.locator(
			"//select[@placeholder='Select M/c Automation']"
		)
		this.MachineName = page.locator('select[formcontrolname="machineId"]')
		this.MachineDescription = page.locator(
			"(//label[contains(.,'Machine Description')]/following::input)[1]"
		)
		this.MachineEfficiency = page.locator('input[formcontrolname="efficiency"]')
		this.DirectProcessCost = page.locator(
			'input[formcontrolname="directProcessCost"]'
		)
		//================= Cycle Time Details   ================

		this.InsertsPlacement = page.locator(
			'input[formcontrolname="insertsPlacement"]'
		)
		this.DryCycleTime = page.locator('input[formcontrolname="dryCycleTime"]')
		this.InjectionTime = page.locator('input[formcontrolname="injectionTime"]')
		this.SideCoreMechanisms = page.locator(
			'input[formcontrolname="sideCoreMechanisms"]'
		)
		this.CoolingTime = page.locator('input[formcontrolname="coolingTime"]')
		this.PartEjection = page.locator('input[formcontrolname="partEjection"]')
		this.Others = page.locator('input[formcontrolname="others"]')
		this.PackAndHoldTime = page.locator(
			'input[formcontrolname="packAndHoldTime"]'
		)
		this.TotalTime = page.locator('input[formcontrolname="totalTime"]')

		//==================== Manufacturing Details costs ===================
		this.SamplingRate = page.locator('input[formcontrolname="samplingRate"]')
		this.LowSkilledLaborRate = page.locator(
			'input[formcontrolname="lowSkilledLaborRatePerHour"]'
		)
		this.SkilledLaborHours = page.locator(
			'input[formcontrolname="skilledLaborRatePerHour"]'
		)
		this.NoOfLowSkilledLabours = page.locator(
			'input[formcontrolname="noOfLowSkilledLabours"]'
		)
		this.NoOfSkilledLabours = page.locator(
			'input[formcontrolname="noOfSkilledLabours"]'
		)
		this.QAInspectorRate = page.locator(
			'input[formcontrolname="qaOfInspectorRate"]'
		)
		this.MachineHourRate = page.locator(
			'input[formcontrolname="machineHourRate"]'
		)
		this.SetUpTime = page.locator('input[formcontrolname="setUpTime"]')
		this.InspectionTime = page.locator(
			'input[formcontrolname="inspectionTime"]'
		)
		this.CycleTime = page.locator(
			'(//label[contains(.,"Cycle Time per Part (s)")]/following::input)[1]'
		)
		this.YieldCost = page.locator('input[formcontrolname="yieldCost"]')
		this.YieldPercentage = page.locator('input[formcontrolname="yieldPer"]')
		this.DirectLaborCost = page.locator(
			'input[formcontrolname="directLaborCost"]'
		)
		this.DirectSetUpCost = page.locator(
			'input[formcontrolname="directSetUpCost"]'
		)
		this.InspectionCost = page.locator(
			'input[formcontrolname="inspectionCost"]'
		)
		this.DirectMachineCost = page.locator(
			'input[formcontrolname="directMachineCost"]'
		)
		//Manufacturing sustainability
		this.PowerESG = page.locator('input[formcontrolname="co2KwHr"]')
		this.Co2Part = page.locator(
			'(//label[contains(.,"CO2(kg)/kw-Hr")]/following::input)[2]'
		)

		//================== Packaging Information ================================
		this.PackagingExpPanel = this.page.locator(
			'//h6[normalize-space(text())="Packaging"]'
		)
		this.PartsPerShipment = this.page.locator(
			'input[placeholder="Parts per Shipment"]'
		)
		this.WeightPerShipment = this.page.locator(
			'input[formcontrolname="weightPerShipment"]'
		)
		this.VolumePerShipment = this.page.locator(
			'input[formcontrolname="volumePerShipment"]'
		)
		this.MaterialFinish = this.page.locator(
			'select[formcontrolname="materialFinishId"]'
		)
		this.FragileOrSpeciality = this.page.locator(
			'select[formcontrolname="fragileId"]'
		)
		this.Freight = this.page.locator('select[formcontrolname="freightId"]')

		// Packaging Materials Table
		this.PackagingTableRows = this.page.locator(
			'(//tr[@role="row"]/following-sibling::tr)'
		)
		this.AddPackagingBtn = this.page.locator(
			'//a[normalize-space(text())="Add Packaging"]'
		)

		// Packaging Material Details (form below table)
		this.PackagingType = this.page.locator(
			'select[formcontrolname="packagingTypeId"]'
		)
		this.PackagingMaterial = this.page.locator(
			'select[formcontrolname="packagingFormId"]'
		)
		this.PackageDescription = this.page.locator(
			'input[placeholder="Package Description"]'
		)
		this.PackagingWeight = this.page.locator(
			'input[formcontrolname="packagingWeight"]'
		)
		this.PackageMaxCapacity = this.page.locator(
			'input[formcontrolname="packageMaxCapacity"]'
		)
		this.PackageMaxVolume = this.page.locator(
			'input[formcontrolname="packageMaxVolume"]'
		)
		this.LaborRequiredPerPackage = this.page.locator(
			'input[formcontrolname="totalPackagingTime"]'
		)
		this.DirectLaborRate = this.page.locator(
			'input[formcontrolname="directLaborRate"]'
		)
		this.LaborCostPerPart = this.page.locator(
			'input[formcontrolname="laborCostPerPart"]'
		)
		this.PartsPerContainer = this.page.locator(
			'input[formcontrolname="partsPerContainer"]'
		)
		this.QuantityNeededPerShipment = this.page.locator(
			'input[formcontrolname="qtyNeededPerShipment"]'
		)
		this.CostPerContainer = this.page.locator(
			'input[formcontrolname="costPerContainer"]'
		)
		this.CostPerUnit = this.page.locator('input[formcontrolname="costPerUnit"]')
		this.CO2PerUnit = this.page.locator('input[formcontrolname="cO2PerUnit"]')
		this.PrimaryEditBtn = this.page.locator(
			'//*[@id="cdk-accordion-child-3"]/div/section/app-costing-packaging-information/form/div[3]/div/div/div/div[2]/div/table/tbody/tr[1]/td[7]/a[1]/mat-icon'
		)
		this.SecondaryEditBtn = this.page.locator(
			'//*[@id="cdk-accordion-child-3"]/div/section/app-costing-packaging-information/form/div[3]/div/div/div/div[2]/div/table/tbody/tr[2]/td[7]/a[1]/mat-icon'
		)
		this.TertiaryEditBtn = this.page.locator(
			'//*[@id="cdk-accordion-child-3"]/div/section/app-costing-packaging-information/form/div[3]/div/div/div/div[2]/div/table/tbody/tr[3]/td[7]/a[1]/mat-icon'
		)
		//================== Overhead & Profit ================================
		this.OverheadProfitExpPanel = this.page.locator(
			'//h6[normalize-space(text())="Overhead & Profit"]'
		)

		// Overhead Section
		this.OverheadTotal = this.page.locator(
			'(//input[@formcontrolname="OverheadandProfitAmount"])[1]'
		)
		this.MaterialOverheadPer = this.page.locator(
			'input[formcontrolname="mohPer"]'
		)
		this.MaterialOverheadCost = this.page.locator(
			'input[formcontrolname="mohCost"]'
		)
		this.FactoryOverheadPer = this.page.locator(
			'input[formcontrolname="fohPer"]'
		)
		this.FactoryOverheadCost = this.page.locator(
			'input[formcontrolname="fohCost"]'
		)
		this.SGAndAPer = this.page.locator('input[formcontrolname="sgaPer"]')
		this.SGAndACost = this.page.locator('input[formcontrolname="sgaCost"]')

		// Profit Section
		this.MaterialProfitPer = this.page.locator(
			'input[formcontrolname="materialProfitPer"]'
		)
		this.ManufacturingProfitPer = this.page.locator(
			'input[formcontrolname="processProfitPer"]'
		)
		this.ProfitCost = this.page.locator('input[formcontrolname="profitCost"]')

		// Cost of Capital Section
		this.CostOfCapitalTotal = this.page.locator(
			'input[formcontrolname="CostOfCapitalAmount"]'
		)
		this.InventoryCarryingTotal = this.page.locator(
			'input[formcontrolname="InventoryCarryingAmount"]'
		)
		this.RawMaterialsPer = this.page.locator('input[formcontrolname="iccPer"]')
		this.RawMaterialsCost = this.page.locator(
			'input[formcontrolname="iccCost"]'
		)
		this.FinishGoodsPer = this.page.locator('input[formcontrolname="fgiccPer"]')
		this.FinishGoodsCost = this.page.locator(
			'input[formcontrolname="fgiccCost"]'
		)
		this.PaymentTermsPer = this.page.locator(
			'input[formcontrolname="paymentTermsPer"]'
		)
		this.PaymentTermsCost = this.page.locator(
			'input[formcontrolname="paymentTermsCost"]'
		)

		//================== Logistics Cost ================================
		this.LogisticsCostExpPanel = this.page.locator(
			'//h6[normalize-space(text())="Logistics Cost"]'
		)
		this.LogisticsCostTab = this.page.getByRole('tab', { name: 'Cost' })
		this.LogisticsMapTab = this.page.getByRole('tab', { name: 'Map' })

		// Logistics Fields
		this.ModeOfTransport = this.page.locator(
			'select[formcontrolname="ModeOfTransport"]'
		)
		this.ShipmentType = this.page.locator(
			'select[formcontrolname="ShipmentType"]'
		)
		this.ContainerType = this.page.locator(
			'select[formcontrolname="ContainerType"]'
		)
		this.FullContainerCost = this.page.locator(
			'input[formcontrolname="ContainerCost"]'
		)
		this.PercentOfContainerNeeded = this.page.locator(
			'input[formcontrolname="ContainerPercent"]'
		)
		this.FreightCostPerShipment = this.page.locator(
			'input[formcontrolname="FreightCostPerShipment"]'
		)
		this.FreightCostPerUnit = this.page.locator(
			'input[formcontrolname="FreightCost"]'
		)

		// Cost Summary
		this.MaterialCost = this.page.locator(
			'text=Material Cost >> xpath=.. >> input'
		)
		this.ManufacturingCost = this.page.locator(
			'text=Manufacturing Cost >> xpath=.. >> input'
		)
		this.ToolingCost = this.page.locator(
			'text=Tooling Cost >> xpath=.. >> input'
		)
		this.OverheadAndProfit = this.page.locator(
			'text=Overhead & Profit >> xpath=.. >> input'
		)
		this.PackingCost = this.page.locator(
			'text=Packing Cost >> xpath=.. >> input'
		)
		this.ExWPartCost = this.page.locator(
			'text=EX-W Part Cost >> xpath=.. >> input'
		)
		this.FreightCost = this.page.locator(
			'text=Freight Cost >> xpath=.. >> input'
		)
		this.DutiesAndTariff = this.page.locator(
			'text=Duties and Tariff >> xpath=.. >> input'
		)
		this.PartShouldCost = this.page.locator(
			'text=Part Should Cost >> xpath=.. >> input'
		)

		// Buttons
		this.UpdateSaveBtn = this.page.locator('text=Update & Save')
		this.RecalculateCostBtn = this.page.locator('text=Recalculate Cost')
	}
}
