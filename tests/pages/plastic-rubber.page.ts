
import { Locator, Page, BrowserContext } from '@playwright/test';
import { BasePage } from '../lib/BasePage';

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
    readonly MinWallThick: Locator
    readonly StandardDeviation: Locator
    readonly PartProjectedArea: Locator
    readonly NumberOfInserts: Locator
    readonly MaterialUtilisationPer: Locator
    readonly PartGrossWeight: Locator
    readonly PartScrapWeight: Locator
    readonly NetPartWeight: Locator
    readonly ScrapRecoveryPer: Locator
    readonly PartGrossMaterialCost: Locator
    readonly PartScrapRecovery: Locator
    readonly RegrindPer: Locator
    //Cavity and Mold Type
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
    readonly MaterialCO2: Locator
    readonly ScrapCO2: Locator
    readonly PartCO2: Locator
    //========================Physical Properties =================
    readonly MaterialDetailsTab: Locator
    readonly MatlDescrProp: Locator
    readonly Region: Locator
    readonly Density: Locator
    readonly YieldStrength: Locator
    readonly TensileStrength: Locator
    readonly ShearingStrength: Locator
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
    readonly CoolingTime: Locator;
    readonly InsertsPlacement: Locator;
    readonly PartEjection: Locator;
    readonly SideCoreMechanisms: Locator;
    readonly Others: Locator;
    readonly PackAndHoldTime: Locator;
    readonly InjectionTime: Locator;
    readonly DryCycleTime: Locator;
    readonly TotalTime: Locator;
    readonly CycleTime: Locator;

    // Costs & Rates
    readonly DirectMachineCost: Locator;
    readonly MachineHourRate: Locator;
    readonly SetUpTime: Locator;
    readonly NoOfLowSkilledLabours: Locator;
    readonly SkilledLaborHours: Locator;
    readonly LowSkilledLaborRate: Locator;
    readonly DirectLaborCost: Locator;
    readonly InspectionCost: Locator;
    readonly SamplingRate: Locator;
    readonly InspectionTime: Locator;
    readonly QAInspectorRate: Locator;
    readonly DirectSetUpCost: Locator;
    readonly YieldCost: Locator;
    readonly YieldPercentage: Locator;
    readonly directLaborCost: Locator;
    readonly directMachineCost: Locator;
    // Sustainability
    readonly TotalEsgImpactAnnualKgCO2Part: Locator;
    readonly EsgImpactElectricityConsumption: Locator;
    readonly EsgImpactAnnualUsageHrs: Locator;
    readonly EsgImpactAnnualKgCO2: Locator;
    readonly EsgImpactAnnualKgCO2Part: Locator;
    constructor(page: Page, context: BrowserContext) {
        super(page, context);
        // Navigation
        this.projectSelectors = page.locator('.mat-select-trigger')
        this.projectIcon = page.locator("mat-icon[data-mat-icon-name='project_icon']")
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
        this.LotSize = page.locator('input[formcontrolname="lotsize"]');
        this.ProductLifeRemainingYrs = page.locator(
            "//input[@formcontrolname='prodLifeRemaining']"
        )
        this.LifeTimeQtyRemainingNos = page.locator(
            "//input[@formcontrolname='lifeTimeQtyRemaining']"
        )
        this.AdditionalDetails = page.locator("//span[normalize-space(text())='Additional Details']")
        this.PartComplexity = page.locator("select[formcontrolname='partComplexity']")
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
        this.ScrapPrice = page.locator('input[formcontrolname="scrapPrice"]').first()
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
        this.MaxWallThick = page.locator('input[formcontrolname="maxWallthick"]')
        this.WallAverageThickness = page.locator('input[formcontrolname="wallAverageThickness"]');
        this.StandardDeviation = page.locator('input[formcontrolname="standardDeviation"]');
        this.MinWallThick = page.locator('input[formcontrolname="minWallthick"]');
        this.PartProjectedArea = page.locator('input[formcontrolname="partProjectArea"]');
        this.PartSurfaceArea = page.locator('input[formcontrolname="partSurfaceArea"]')
        this.PartVolume = page.locator('input[formcontrolname="partVolume"]')
        this.PartNetWeight = page.locator('(//label[contains(.,"Part Net Weight(g)")])/following::input)[1]')
        this.NumberOfInserts = page.locator('input[formcontrolname="noOfInserts"]');
        this.MaterialUtilisationPer = page.locator('input[formcontrolname="utilisationPer"]');
        this.PartGrossWeight = page.locator('input[formcontrolname="grossWeight"]');
        this.PartScrapWeight = page.locator('input[formcontrolname="scrapWeight"]');
        this.ScrapRecoveryPer = page.locator('input[formcontrolname="grossMaterialCost"]');
        this.PartGrossMaterialCost = page.locator('input[formcontrolname="shotSize"]');
        this.PartScrapRecovery = page.locator('input[formcontrolname="scrapRecCost"]');
        this.RegrindPer = page.locator('input[formcontrolname="regrindAllowance"]');
        this.NetPartWeight = page.locator('input[formcontrolname="netWeight"]');
        //Cavity and Mold Type
        this.NoOfCavities = page.locator('input[formcontrolname="noOfCavities"]');
        this.NumberOfCavityLengthNos = page.locator('input[formcontrolname="cavityArrangementLength"]');
        this.NumberOfCavityWidth = page.locator('input[formcontrolname="cavityArrangementWidth"]');
        this.RunnerType = page.locator('select[formcontrolname="runnerType"]');
        this.RunnerDia = page.locator('input[formcontrolname="runnerDia"]');
        this.RunnerLength = page.locator('input[formcontrolname="runnerLength"]');
        this.NoOfExternalSideCores = page.locator('input[formcontrolname="totalWeldLength"]');
        this.NoOfInternalSideCores = page.locator('input[formcontrolname="totalWeldBeadArea"]');
        this.UnscrewingUndercuts = page.locator('input[formcontrolname="beadSize"]');

        // Material Details
        this.MaterialDetailsTab = page.getByRole('tab', {
            name: 'Material Details',
            exact: true
        })

        //Material Sustainability
        this.MaterialSustainability = page.locator("(//div[contains(@class,'card-header card-header-colour')]//span)[1]")
        this.MaterialCO2 = page.locator('input[formcontrolname="co2KgMaterial"]')
        this.ScrapCO2 = page.locator('input[formcontrolname="co2KgScrap"]')
        this.PartCO2 = page.locator('input[formcontrolname="co2KgPart"]')
        // ======================== Material Details ==================================
        this.MatlDescrProp = page.locator('input[formcontrolname="materialDesc"]')
        this.Region = page.locator('input[formcontrolname="countryName"]')
        this.Density = page.locator('input[formcontrolname="density"]')
        this.YieldStrength = page.locator('input[formcontrolname="moldTemp"]')
        this.TensileStrength = page.locator(
            'input[formcontrolname="ultimateTensileStrength"]'
        )
        this.ShearingStrength = page.locator('input[formcontrolname="meltTemp"]')
        //============== Manufacturing Information ================================
        this.ManufacturingInformation = page.locator(
            "//h6[normalize-space(text())='Manufacturing Information']"
        )
        this.MfgDetailsTab = page.getByRole('tab', { name: 'Manufacturing Details' })
        this.InjectionMouldingSingleShot = page.locator("//tr[.//td[normalize-space()='Injection Moulding-Single Shot']]//input[@name='editRow']")
        this.ProcessGroup = page.locator(
            "//select[@formcontrolname='matPrimaryProcessName']"
        )
        this.NewToolingCostAllocation = page.locator('input[formcontrolname="liquidTemp"]')
        this.RecommendTonnage = page.locator('input[formcontrolname="recommendTonnage"]')
        this.SelectedTonnage = page.locator('input[formcontrolname="selectedTonnage"]')
        this.RequiredPlatenSize = page.locator('input[formcontrolname="requiredPlatenSize"]')
        this.PlatenSizeOfMachine = page.locator('input[formcontrolname="selectedBedSize"]')
        this.ShotWeightRequired = page.locator('input[formcontrolname="requiredCurrent"]')
        this.ShotWeightOfMachine = page.locator('input[formcontrolname="shotSize"]')
        this.MachineType = page.locator("//select[@placeholder='Select M/c Automation']")
        this.MachineName = page.locator('select[formcontrolname="machineId"]')
        this.MachineDescription = page.locator(
            "(//label[contains(.,'Machine Description')]/following::input)[1]"
        )
        this.MachineEfficiency = page.locator('input[formcontrolname="efficiency"]')
        this.DirectProcessCost = page.locator(
            'input[formcontrolname="directProcessCost"]'
        )
        //================= Cycle Time Details   ================

        this.InsertsPlacement = page.locator('input[formcontrolname="insertsPlacement"]');
        this.DryCycleTime = page.locator('input[formcontrolname="dryCycleTime"]');
        this.InjectionTime = page.locator('input[formcontrolname="injectionTime"]');
        this.SideCoreMechanisms = page.locator('input[formcontrolname="sideCoreMechanisms"]');
        this.CoolingTime = page.locator('input[formcontrolname="coolingTime"]');
        this.PartEjection = page.locator('input[formcontrolname="partEjection"]');
        this.Others = page.locator('input[formcontrolname="others"]');
        this.PackAndHoldTime = page.locator('input[formcontrolname="packAndHoldTime"]');
        this.TotalTime = page.locator('input[formcontrolname="totalTime"]');


        //==================== Manufacturing Details costs ===================
        this.SamplingRate = page.locator('input[formcontrolname="samplingRate"]');
        this.LowSkilledLaborRate = page.locator('input[formcontrolname="lowSkilledLaborRatePerHour"]');
        this.SkilledLaborHours = page.locator('input[formcontrolname="skilledLaborRatePerHour"]');
        this.NoOfLowSkilledLabours = page.locator('input[formcontrolname="noOfLowSkilledLabours"]');
        this.QAInspectorRate = page.locator('input[formcontrolname="qaOfInspectorRate"]');
        this.MachineHourRate = page.locator('input[formcontrolname="machineHourRate"]');
        this.DirectMachineCost = page.locator('input[formcontrolname="directMachineCost"]');
        this.YieldPercentage = page.locator('input[formcontrolname="yieldPer"]');
        this.SetUpTime = page.locator('input[formcontrolname="setUpTime"]');
        this.InspectionTime = page.locator('input[formcontrolname="inspectionTime"]');
        this.CycleTime = page.locator('input[formcontrolname="cycleTime"]');
        this.DirectLaborCost = page.locator('input[formcontrolname="directLaborCost"]');

        this.YieldCost = page.locator('input[formcontrolname="yieldCost"]');
        this.directLaborCost = page.locator('input[formcontrolname="directLaborCost"]')
        this.DirectSetUpCost = page.locator('input[formcontrolname="directSetUpCost"]');
        this.InspectionCost = page.locator('input[formcontrolname="inspectionCost"]');
        this.directMachineCost = page.locator('input[formcontrolname="directMachineCost"]')

        // Sustainability
        this.TotalEsgImpactAnnualKgCO2Part = page.locator('.co2-total strong');
        this.EsgImpactElectricityConsumption = page.locator('td.mat-column-esgImpactElectricityConsumption .input-box');
        this.EsgImpactAnnualUsageHrs = page.locator('td.mat-column-esgImpactAnnualUsageHrs .input-box');
        this.EsgImpactAnnualKgCO2 = page.locator('td.mat-column-esgImpactAnnualKgCO2 .input-box');
        this.EsgImpactAnnualKgCO2Part = page.locator('td.mat-column-esgImpactAnnualKgCO2Part .input-box');
    }
}
