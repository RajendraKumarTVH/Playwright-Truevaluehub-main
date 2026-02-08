"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SheetMetalPage = void 0;
const BasePage_1 = require("../lib/BasePage");
/**
 * SheetMetalPage - Page Object Model for Sheet Metal processes
 * Contains all locators for Sheet Metal manufacturing UI elements
 */
class SheetMetalPage extends BasePage_1.BasePage {
    // ==================== CONSTRUCTOR ====================
    constructor(page, context) {
        super(page, context);
        // Navigation
        this.projectSelectors = page.locator('.mat-select-trigger');
        this.projectIcon = page.locator("mat-icon[data-mat-icon-name='project_icon']");
        this.Active = page.getByRole('tab', { name: 'ACTIVE' });
        this.SelectAnOption = page.locator("(//mat-select[contains(@class,'mat-mdc-select search-bar-overlay')]//div)[1]");
        this.ProjectValue = page.locator("input[name='searchValue']");
        this.ApplyButton = page.getByRole('button', { name: 'Apply' });
        this.ProjectID = page.locator('div.container.ng-star-inserted');
        this.ClearAll = page.getByText('Clear All');
        // Part Information
        this.PartInformationTitle = page
            .locator('.mat-expansion-panel-header-title')
            .nth(0);
        this.PartDetails = page.locator("//span[normalize-space(text())='Part Details']");
        this.InternalPartNumber = page.locator("//input[@name='IntPartNumber']");
        this.DrawingNumber = page.locator('input[formcontrolname="drawingNumber"]');
        this.RevisionNumber = page.getByPlaceholder('Enter Revision value');
        this.PartDescription = page.getByRole('textbox', {
            name: 'Enter Part Description'
        });
        this.ManufacturingCategory = page.locator("select[formcontrolname='commdityvalue']");
        this.BOMQtyNos = page.getByPlaceholder('Enter Qty');
        this.AnnualVolumeQtyNos = page.locator("//input[@formcontrolname='AnnualVolume']");
        this.LotsizeNos = page.locator("(//label[contains(.,'Lot size (Nos.)')]/following::input)[1]");
        this.ProductLifeRemainingYrs = page.locator("//input[@formcontrolname='prodLifeRemaining']");
        this.LifeTimeQtyRemainingNos = page.locator("//input[@formcontrolname='lifeTimeQtyRemaining']");
        // Supply Terms
        this.SupplierDropdown = page.locator('[formcontrolname="supplierName"]');
        this.SupplierOptions = page.locator('mat-option span.mdc-list-item__primary-text, mat-option span');
        this.ManufacturingCity = page.locator('[formcontrolname="mfrCity"]');
        this.ManufacturingCountry = page.locator('[formcontrolname="ManufacturingCountry"]');
        this.DeliveryDropdown = page.locator('input[formcontrolname="DeliverySite"]');
        this.DeliveryOptions = page.locator('mat-option span.mdc-list-item__primary-text, mat-option span');
        this.DeliveryCity = page.locator('[formcontrolname="DeliveryCity"]');
        this.DeliveryCountry = page.locator('[formcontrolname="DeliveryCountry"]');
        this.SupplyTerms = page.getByRole('tab', { name: 'Supply Terms' });
        this.IncoTerms = page.locator('[formcontrolname="IncoTerms"]');
        this.DeliveryFrequency = page.locator('input[formcontrolname="DeliveryFrequency"]');
        this.PackageType = page.locator('select[formcontrolname="packingtype"]');
        this.PaymentTerms = page.locator('select[formcontrolname="PaymentTerms"]');
        // Material Information
        this.MaterialInformationSection = page.locator("//h6[@class='cls-item-head ng-star-inserted']");
        this.MaterialDescription = page
            .locator('.mat-expansion-panel-header-title')
            .nth(1);
        this.MaterialInfo = page.getByRole('tab', { name: 'Material Info' });
        this.SearchMaterials = page.getByText('Search Materials');
        this.SearchMtrlInput = page.locator('input[placeholder="Search by keywords"]');
        this.materialCategory = page.locator("select[formcontrolname='materialCategory']");
        this.MatFamily = page.locator('select[formcontrolname="materialFamily"]');
        this.DescriptionGrade = page.locator('select[formcontrolname="materialDescription"]');
        this.StockForm = page.locator('select[formcontrolname="stockForm"]').first();
        this.ScrapPrice = page.locator('input[formcontrolname="scrapPrice"]');
        this.MaterialPrice = page.locator('input[formcontrolname="matPrice"]');
        this.VolumePurchased = page.locator('input[formcontrolname="volumePurchased"]');
        this.VolumeDiscount = page.locator('input[formcontrolname="volumeDiscountPer"]');
        this.NetMaterialCost = page.locator('input[formcontrolname="netMaterialCost"]');
        this.MatPriceGross = page.locator('input[formcontrolname="matPriceGross"]');
        this.PartThickness = page
            .locator('.card.ng-star-inserted > .card-body > .row > div:nth-child(4) > .form-control')
            .first();
        this.PartEnvelopeLength = page.getByPlaceholder('Length');
        this.PartEnvelopeWidth = page.getByPlaceholder('Width');
        this.PartEnvelopeHeight = page.getByPlaceholder('Height');
        this.NetWeight = page.locator('input[formcontrolname="netWeight"]');
        this.PartVolume = page.locator('input[formcontrolname="partVolume"]');
        this.PartSurfaceArea = page.locator('input[formcontrolname="partSurfaceArea"]');
        // Material Details
        this.MaterialDetailsTab = page.getByRole('tab', {
            name: 'Material Details',
            exact: true
        });
        this.MatlDescrProp = page.locator('input[formcontrolname="materialDesc"]');
        this.Region = page.locator('input[formcontrolname="countryName"]');
        this.Density = page.locator('input[formcontrolname="density"]');
        this.YieldStrength = page.locator('input[formcontrolname="moldTemp"]');
        this.TensileStrength = page.locator('input[formcontrolname="ultimateTensileStrength"]');
        this.ShearingStrength = page.locator('input[formcontrolname="meltTemp"]');
        // Manufacturing Information
        this.ManufacturingInformation = page.locator("//h6[normalize-space(text())='Manufacturing Information']");
        this.MfgDetailsTab = page.getByRole('tab', { name: 'Manufacturing Details' });
        this.ProcessGroup = page.locator("//select[@formcontrolname='matPrimaryProcessName']");
        this.MachineType = page.locator("//select[@placeholder='Select M/c Automation']");
        this.MachineName = page.locator('select[formcontrolname="machineId"]');
        this.MachineDescription = page.locator("(//label[contains(.,'Machine Description')]/following::input)[1]");
        this.MachineEfficiency = page.locator('input[formcontrolname="efficiency"]');
        this.PartComplexity = page.locator("//select[@formcontrolname='partcomplexcity']");
        this.AdditionalDetails = page.locator("//span[normalize-space(text())='Additional Details']");
        // Bending Specific
        this.BendingLineLength = page.locator('input[formcontrolname="bendingLineLength"]');
        this.NoOfBends = page.locator('input[formcontrolname="noOfbends"]');
        this.InnerRadius = page.locator('input[formcontrolname="innerRadius"]');
        this.TheoreticalForce = page.locator('input[formcontrolname="theoreticalForce"]');
        this.RecommendedTonnage = page.locator('input[formcontrolname="recommendTonnage"]');
        // Cycle Time & Costs
        this.CycleTimeDetails = page.getByText('Cycle Time Details');
        this.CycleTimePart = page.locator('input[formcontrolname="cycleTime"]').first();
        this.UnloadingTime = page.locator('input[formcontrolname="unloadingTime"]');
        this.ProcessTime = page.locator('input[formcontrolname="processTime"]');
        this.SetupTime = page.locator('input[formcontrolname="setUpTime"]');
        // Cost Fields
        this.DirectLaborRate = page.locator('input[formcontrolname="lowSkilledLaborRatePerHour"]');
        this.QAInspectorRate = page.locator('(//label[contains(.,"QA Inspector Rate ($/hr)")]/following::input)[1]');
        this.NoOfDirectLabors = page.locator('input[formcontrolname="noOfLowSkilledLabours"]');
        this.SkilledLaborRate = page.locator('input[formcontrolname="skilledLaborRatePerHour"]');
        this.MachineSetupTime = page.locator('input[formcontrolname="setUpTime"]');
        this.DirectSetUpCost = page.locator('input[formcontrolname="directSetUpCost"]');
        this.MachineHourRate = page.locator('input[name="machineHourRate"]');
        this.DirectMachineCost = page.locator('input[name="directMachineCost"]');
        this.DirectLaborCost = page.locator('input[name="directLaborCost"]');
        this.QAInspectionTime = page.locator('input[name="inspectionTime"]');
        this.QAInspectionCost = page.locator('input[name="inspectionCost"]');
        this.SamplingRate = page.locator('input[formcontrolname="samplingRate"]');
        this.YieldPercentage = page.locator('input[name="yieldPer"]');
        this.YieldCostPart = page.locator('input[name="yieldCost"]');
        this.PowerConsumption = page.locator('input[formcontrolname="powerConsumption"]');
        this.ElectricityUnitCost = page.locator('input[formcontrolname="electricityUnitCost"]');
        this.TotalPowerCost = page.locator('input[formcontrolname="totalPowerCost"]');
        this.NetProcessCost = page.locator('input[formcontrolname="directProcessCost"]');
        // Sustainability
        this.MatSustainability = page.locator("//span[normalize-space(text())='Sustainability']");
        this.MaterialInfoTab = this.MaterialInfo;
        this.CO2PerKgMaterial = page.locator('//input[@formcontrolname="co2KgMaterial"]');
        this.CO2PerScrap = page.locator('//input[@formcontrolname="co2KgScrap"]');
        // Machine Details - Power & Utilization
        this.MachineDetailsTab = page.getByRole('tab', { name: 'Machine Details' });
        this.RatedPower = page.locator('//input[@placeholder="Rated Power (kWh)"]');
        this.PowerUtil = page.locator('//input[@placeholder="Power Utilization (%)"]');
        this.AvgMachineUtil = page.locator('(//span[normalize-space(text())="Average Machine Utilization (%)"]/following::input)[1]');
        // Machine Details - Cost & Lifespan
        this.InvestmentCost = page.locator('input[placeholder="Investment Cost"]');
        this.InstallationCost = page.locator('input[placeholder="Installation Cost"]');
        this.MachineLifespan = page.locator('input[placeholder="Machine Lifespan"]');
        this.YearsInstalled = page.locator('input[placeholder="Years Installed"]');
        this.AnnualMaintenanceCost = page.locator('input[placeholder="Annual Maintenance Cost (USD)"]');
        this.AnnualSuppliesCost = page.locator('input[placeholder="Annual Supplies Cost (USD)"]');
        // Machine Details - Labor Assumptions
        this.LowSkilledLaborersNeeded = page.locator('input[placeholder="Low-Skilled Laborers Needed"]');
        this.SemiSkilledLaborersNeeded = page.locator('input[placeholder="Semi-Skilled Laborers Needed"]');
        this.HighSkilledLaborersNeeded = page.locator('input[placeholder="High-Skilled Laborers Needed"]');
        this.CO2PerKwHr = page.locator("(//label[contains(.,'CO2(kg)/kw-Hr')]/following::input)[1]");
        this.CO2PerPartMaterial = page.locator("(//input[@formcontrolname='co2KgPart'])[1]");
        this.CO2PerPartManufacturing = page.locator("(//input[@formcontrolname='co2KgPart'])[2]");
        this.SustainabilityTab = page.getByRole('tab', { name: 'Sustainability' });
        // Cost Summary
        this.numCostSummary = page.locator("//mat-icon[@data-mat-icon-name='number']");
        this.MaterialTotalCost = page.locator('#MaterialCostAmount');
        this.materialSubTotalcost = page.locator('//table[@aria-describedby="Material"]//tfoot//td[contains(@class,"cdk-column-cost") and preceding-sibling::td[normalize-space()="Sub Total"]][1]');
        this.ManufacturingCost = page.locator('#ManufacturingCostAmount');
        this.mfgSubTotalcost = page.locator('//table[@aria-describedby="Manufacturing"]//td[contains(@class,"cdk-column-cost") and preceding-sibling::td[normalize-space()="Sub Total"]][1]');
        this.ToolingCost = page.locator('#ToolingCostAmount');
        this.OverheadProfit = page.locator('//div[@class="col"]//input[@id="OverheadandProfitAmount"]');
        this.PackingCost = page.locator('//input[@formcontrolname="PackingCostAmount"]').first();
        this.EXWPartCost = page.locator('#EXWPartCostAmount');
        this.logiFreightCost = page.locator("//input[@formcontrolname='FreightCost']");
        this.shouldDutiesTariff = page.locator('#DutiesandTariffAmount');
        this.PartShouldCost = page.locator('(//input[@id="ShouldCostAmount"])[1]');
        // Actions
        this.UpdateSave = page.getByRole('button', { name: 'Update & Save' });
        this.RecalculateCost = page.getByRole('button', {
            name: 'Recalculate Cost'
        });
        this.ExpandAll = page.getByRole('button', { name: 'Expand All' });
        this.CollapseAll = page.getByRole('button', { name: 'Collapse All' });
        this.CostingNotes = page.locator("//label[text()='Costing Notes']/following-sibling::div");
    }
}
exports.SheetMetalPage = SheetMetalPage;
