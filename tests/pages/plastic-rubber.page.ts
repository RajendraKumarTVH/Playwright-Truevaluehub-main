
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
    readonly LotsizeNos: Locator
    readonly ProductLifeRemainingYrs: Locator
    readonly LifeTimeQtyRemainingNos: Locator
    // ==================== PROCESS INFORMATION LOCATORS ====================
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
    readonly netMaterialCost: Locator
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
    // Inputs
    readonly NoOfInserts: Locator;
    readonly GrossWeight: Locator;
    readonly WallAverageThickness: Locator;
    readonly NoOfCavities: Locator;
    readonly NetMaterialCost: Locator;
    readonly NetPartWeight: Locator;
    readonly RunnerProjectedArea: Locator;
    readonly PartProjectedArea: Locator;
    readonly ShotSize: Locator;
    readonly PlatenSizeLength: Locator;
    readonly PlatenSizeWidth: Locator;
    readonly MachineTonnage: Locator;

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
    readonly Efficiency: Locator;
    readonly SetUpTime: Locator;
    readonly NoOfLowSkilledLabours: Locator;
    readonly LowSkilledLaborRate: Locator;
    readonly DirectLaborCost: Locator;
    readonly InspectionCost: Locator;
    readonly SamplingRate: Locator;
    readonly InspectionTime: Locator;
    readonly QAInspectorRate: Locator;
    readonly DirectSetUpCost: Locator;
    readonly LotSize: Locator;
    readonly YieldCost: Locator;
    readonly YieldPercentage: Locator;
    readonly DirectProcessCost: Locator;

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
        this.LotsizeNos = page.locator("(//label[contains(.,'Lot size (Nos.)')]/following::input)[1]")
        this.ProductLifeRemainingYrs = page.locator(
            "//input[@formcontrolname='prodLifeRemaining']"
        )
        this.LifeTimeQtyRemainingNos = page.locator(
            "//input[@formcontrolname='lifeTimeQtyRemaining']"
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
            'input[formcontrolname="volumePurchased"]'
        )
        this.VolumeDiscount = page.locator(
            'input[formcontrolname="volumeDiscountPer"]'
        )
        this.netMaterialCost = page.locator(
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
        this.MaterialDetailsTab = page.getByRole('tab', {
            name: 'Material Details',
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

        // Map locators based on formcontrolname or likely selectors
        this.Density = page.locator('input[formcontrolname="density"]');
        this.NoOfInserts = page.locator('input[formcontrolname="noOfInserts"]');
        this.GrossWeight = page.locator('input[formcontrolname="grossWeight"]');
        this.WallAverageThickness = page.locator('input[formcontrolname="wallAverageThickness"]');
        this.NoOfCavities = page.locator('input[formcontrolname="noOfCavities"]');
        this.NetMaterialCost = page.locator('input[formcontrolname="netMatCost"]');
        this.NetPartWeight = page.locator('input[formcontrolname="netWeight"]');
        this.RunnerProjectedArea = page.locator('input[formcontrolname="runnerProjectedArea"]');
        this.PartProjectedArea = page.locator('input[formcontrolname="partProjectedArea"]');

        this.ShotSize = page.locator('input[formcontrolname="shotSize"]');
        this.PlatenSizeLength = page.locator('input[formcontrolname="platenLengthmm"]');
        this.PlatenSizeWidth = page.locator('input[formcontrolname="platenWidthmm"]');
        this.MachineTonnage = page.locator('input[formcontrolname="machineTonnageTons"]');

        this.CoolingTime = page.locator('input[formcontrolname="coolingTime"]');
        this.InsertsPlacement = page.locator('input[formcontrolname="insertsPlacement"]');
        this.PartEjection = page.locator('input[formcontrolname="partEjection"]');
        this.SideCoreMechanisms = page.locator('input[formcontrolname="sideCoreMechanisms"]');
        this.Others = page.locator('input[formcontrolname="others"]');
        this.PackAndHoldTime = page.locator('input[formcontrolname="packAndHoldTime"]');
        this.InjectionTime = page.locator('input[formcontrolname="injectionTime"]');
        this.DryCycleTime = page.locator('input[formcontrolname="dryCycleTime"]');
        this.TotalTime = page.locator('input[formcontrolname="totalTime"]');
        this.CycleTime = page.locator('input[formcontrolname="cycleTime"]');

        this.DirectMachineCost = page.locator('input[formcontrolname="directMachineCost"]');
        this.MachineHourRate = page.locator('input[formcontrolname="machineHourRate"]');
        this.Efficiency = page.locator('input[formcontrolname="efficiency"]');
        this.SetUpTime = page.locator('input[formcontrolname="setUpTime"]');
        this.NoOfLowSkilledLabours = page.locator('input[formcontrolname="noOfLowSkilledLabours"]');
        this.LowSkilledLaborRate = page.locator('input[formcontrolname="lowSkilledLaborRatePerHour"]');
        this.DirectLaborCost = page.locator('input[formcontrolname="directLaborCost"]');
        this.InspectionCost = page.locator('input[formcontrolname="inspectionCost"]');
        this.SamplingRate = page.locator('input[formcontrolname="samplingRate"]');
        this.InspectionTime = page.locator('input[formcontrolname="inspectionTime"]');
        this.QAInspectorRate = page.locator('input[formcontrolname="qaOfInspectorRate"]');
        this.DirectSetUpCost = page.locator('input[formcontrolname="directSetUpCost"]');
        this.LotSize = page.locator('input[formcontrolname="lotsize"]'); // varying name? used 'lotsize' in mig
        this.YieldCost = page.locator('input[formcontrolname="yieldCost"]');
        this.YieldPercentage = page.locator('input[formcontrolname="yieldPer"]');
        this.DirectProcessCost = page.locator('input[formcontrolname="directProcessCost"]');

        // Sustainability
        this.TotalEsgImpactAnnualKgCO2Part = page.locator('.co2-total strong');
        this.EsgImpactElectricityConsumption = page.locator('td.mat-column-esgImpactElectricityConsumption .input-box');
        this.EsgImpactAnnualUsageHrs = page.locator('td.mat-column-esgImpactAnnualUsageHrs .input-box');
        this.EsgImpactAnnualKgCO2 = page.locator('td.mat-column-esgImpactAnnualKgCO2 .input-box');
        this.EsgImpactAnnualKgCO2Part = page.locator('td.mat-column-esgImpactAnnualKgCO2Part .input-box');
    }
}
