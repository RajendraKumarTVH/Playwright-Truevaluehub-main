"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MigWeldingPage = void 0;
const BasePage_1 = require("../lib/BasePage");
// ==================== PAGE OBJECT ====================
class MigWeldingPage extends BasePage_1.BasePage {
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
        this.MaterialInformation = page.locator("//h6[@class='cls-item-head ng-star-inserted']");
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
        this.ScrapPrice = page
            .locator('input[formcontrolname="scrapPrice"]')
            .first();
        this.MaterialPrice = page.locator('input[formcontrolname="matPrice"]');
        this.VolumePurchased = page.locator('input[formcontrolname="volumePurchased"]');
        this.VolumeDiscount = page.locator('input[formcontrolname="volumeDiscountPer"]');
        this.netMaterialCost = page.locator('input[formcontrolname="netMaterialCost"]');
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
        // Welding Details
        this.WeldingDetails = page.locator('//div[normalize-space(text())="Welding Details"]');
        this.MatWeld1 = page.locator("(//div[contains(@class,'col-4 icon-btn')]//mat-icon)[1]");
        this.MatWeldType1 = page.locator("(//select[@formcontrolname='coreShape'])[1]");
        this.MatWeldSize1 = page.locator("(//input[@formcontrolname='coreHeight'])[1]");
        this.MatWireDia1 = page.locator("(//input[@formcontrolname='coreWidth'])[1]");
        this.MatWeldElementSize1 = page.locator("(//input[@formcontrolname='coreWeight'])[1]");
        this.MatNoOfWeldPasses1 = page.locator("(//input[@formcontrolname='noOfCore'])[1]");
        this.MatWeldLengthmm1 = page.locator("(//input[@formcontrolname='coreLength'])[1]");
        this.WeldLength = page.locator("//input[@formcontrolname='coreLength']");
        this.MatWeldSide1 = page.locator("(//select[@formcontrolname='coreArea'])[1]");
        this.MatWeldPlaces1 = page.locator("(//input[@formcontrolname='coreVolume'])[1]");
        this.WeldPlaces = page.locator("//input[@formcontrolname='coreVolume']");
        this.MatGrishFlush1 = page.locator("(//select[@formcontrolname='grindFlush'])[1]");
        this.WeldSide = page.locator("//select[@formcontrolname='coreArea']");
        this.MatGrishFlush2 = page.locator("(//select[@formcontrolname='grindFlush'])[2]");
        this.MatTotalWeldLengthWeld1 = page.locator("(//input[@formcontrolname='weldSide'])[1]");
        this.MatTotalWeldLengthWeld2 = page.locator("(//input[@formcontrolname='weldSide'])[2]");
        this.MatWeldVolume1 = page.locator('(//input[@formcontrolname="coreSandPrice"])[1]');
        this.MatWeldVolume2 = page.locator('(//input[@formcontrolname="coreSandPrice"])[2]');
        this.MatWeld2 = page.locator("(//div[contains(@class,'col-4 icon-btn')]//mat-icon)[3]");
        this.MatWeldType2 = page.locator('(//select[@formcontrolname="coreShape"])[2]');
        this.MatWeldSize2 = page.locator('(//input[@formcontrolname="coreHeight"])[2]');
        this.MatNoOfWeldPasses2 = page.locator('(//input[@formcontrolname="noOfCore"])[2]');
        this.MatWeldLengthmm2 = page.locator('(//input[@formcontrolname="coreLength"])[2]');
        this.MatWireDia2 = page.locator('(//input[@formcontrolname="coreWidth"])[2]');
        this.MatWeldElementSize2 = page.locator('(//input[@formcontrolname="coreWeight"])[2]');
        this.MatWeldSide2 = page.locator('(//select[@formcontrolname="coreArea"])[2]');
        this.MatWeldPlaces2 = page.locator('(//input[@formcontrolname="coreVolume"])[2]');
        this.MatWeldVolume2 = page.locator('(//input[@formcontrolname="coreSandPrice"])[2]');
        this.MatAddWeldButton = page.getByRole('button', { name: /Add Weld/i });
        this.MatEfficiency = page.locator('input[formcontrolname="efficiency"]');
        // Manufacturing Information
        this.ManufacturingInformation = page.locator("//h6[normalize-space(text())='Manufacturing Information']");
        this.MfgDetailsTab = page.getByRole('tab', {
            name: 'Manufacturing Details'
        });
        this.migWeldingRadioBtn = page.locator("(//input[@name='editRow'])[1]");
        this.weldCleaningRadioBtn = page.locator("(//input[@name='editRow'])[2]");
        this.ProcessGroup = page.locator("//select[@formcontrolname='matPrimaryProcessName']");
        this.MigWeldingProcessType = page.locator("//td[normalize-space(text())='Mig Welding']");
        this.WeldCleaningProcessType = page.locator("//td[normalize-space(text())='Weld Cleaning']");
        this.MachineType = page.locator("//select[@placeholder='Select M/c Automation']");
        this.MachineName = page.locator('select[formcontrolname="machineId"]');
        this.MachineDescription = page.locator("(//label[contains(.,'Machine Description')]/following::input)[1]");
        this.MachineEfficiency = page.locator('input[formcontrolname="efficiency"]');
        this.PartComplexity = page.locator("//select[@formcontrolname='partcomplexcity']");
        this.AdditionalDetails = page.locator("//span[normalize-space(text())='Additional Details']");
        this.MigWeldRadBtn = page.locator("//td[contains(text(), 'Mig Welding')]/preceding-sibling::td//input[@type='radio']");
        this.WeldCleanRadBtn = page.locator("//td[contains(text(), 'Weld Cleaning')]/preceding-sibling::td//input[@type='radio']");
        // Cycle Time & Costs
        this.CycleTimeDetails = page.getByText('Cycle Time Details');
        this.curCycleTime = page
            .locator('input[formcontrolname="cycleTime"]')
            .first();
        this.RequiredCurrent = page.locator("//input[@formcontrolname='requiredCurrent']");
        this.RequiredVoltage = page.locator("//input[@formcontrolname='requiredWeldingVoltage']");
        this.selectedCurrent = page.locator("(//label[contains(.,'Selected Current (Amps)')]/following::input)[1]");
        this.selectedVoltage = page.locator("(//label[contains(.,'Selected Welding Voltage (V)')]/following::input)[1]");
        this.UnloadingTime = page.locator('input[formcontrolname="unloadingTime"]');
        this.totalWeldCycleTime = page.locator('input[formcontrolname="cuttingLength"]');
        this.InterWeldClean = page.locator('input[formcontrolname="noOfWeldPasses"]');
        this.PartReorientation = page.locator("//input[@formcontrolname='noOfWeldPasses']");
        // Welding Material Cost
        this.totalWeldLength = page.locator('input[formcontrolname="totalWeldLength"]');
        this.cuttingLength = page.locator('input[formcontrolname="cuttingLength"]');
        this.TotalWeldMaterialWeight = page.locator("//input[@formcontrolname='grossWeight']");
        this.WeldBeadWeightWithWastage = page.locator("//input[@formcontrolname='weldWeightWastage']");
        this.DryCycleTime = page.locator("//input[@formcontrolname='dryCycleTime']");
        // Sub Process Details
        this.SubProcessDetails = page.getByText('Sub Process Details');
        this.MfgWeld1 = page.locator('//*[@id="mat-tab-group-4-content-0"]/div/div[2]/div[2]/div/div[2]/div[1]/div/div/h6/mat-icon');
        this.MfgWeld2 = page.locator('//*[@id="mat-tab-group-4-content-0"]/div/div[2]/div[2]/div/div[2]/div[2]/div/div/h6/mat-icon');
        this.WeldTypeSubProcess1 = page.locator("//select[@formcontrolname='lengthOfCut']");
        this.WeldTypeSubProcess2 = page.locator("//select[@formcontrolname='lengthOfCut']");
        this.WeldPositionSubProcess1 = page.locator("//select[@formcontrolname='formLength']");
        this.WeldPositionSubProcess2 = page.locator("//select[@formcontrolname='formLength']");
        this.TravelSpeedSubProcess1 = page.locator("//input[@formcontrolname='formHeight']");
        this.TravelSpeedSubProcess2 = page.locator("//input[@formcontrolname='formHeight']");
        this.TrackWeldSubProcess1 = page.locator("//input[@formcontrolname='hlFactor']");
        this.TrackWeldSubProcess2 = page.locator("//input[@formcontrolname='hlFactor']");
        this.IntermediateStartStopSubProcess1 = page.locator("//input[@formcontrolname='formPerimeter']");
        this.IntermediateStartStopSubProcess2 = page.locator("//input[@formcontrolname='formPerimeter']");
        this.MfgWeldCycleTime1 = page.locator("//input[@formcontrolname='recommendTonnage']");
        this.MfgWeldCycleTime2 = page.locator("//input[@formcontrolname='recommendTonnage']");
        // Sustainability
        this.MatSustainability = page.locator("//span[normalize-space(text())='Sustainability']");
        this.MaterialInfoTab = this.MaterialInfo;
        this.CO2PerKgMaterial = page.locator('//input[@formcontrolname="co2KgMaterial"]');
        const co2PerScrap = (this.CO2PerScrap = page.locator('//input[@formcontrolname="co2KgScrap"]'));
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
        this.CO2PerKwHr = page.locator("//label[contains(.,'CO2(kg)/kw-Hr')]/following::input");
        this.CO2PerPartMaterial = page.locator("//input[@formcontrolname='co2KgPart']");
        this.CO2PerPartManufacturing = page.locator("//input[@formcontrolname='co2KgPart']");
        this.EsgImpactElectricityConsumption = page.locator('#esgImpactElectricityConsumption');
        this.EsgImpactAnnualUsageHrs = page.locator('#esgImpactAnnualUsageHrs');
        this.EsgImpactAnnualKgCO2 = page.locator('#esgImpactAnnualKgCO2');
        this.EsgImpactAnnualKgCO2Part = page.locator('#esgImpactAnnualKgCO2Part');
        this.SustainabilityTab = page.getByRole('tab', { name: 'Sustainability' });
        // Cost Fields
        this.DirectLaborRate = page.locator('input[formcontrolname="lowSkilledLaborRatePerHour"]');
        this.QAInspectorRate = page.locator('(//label[contains(.,"QA Inspector Rate ($/hr)")]/following::input)[1]');
        this.noOfLowSkilledLabours = page.locator('input[formcontrolname="noOfLowSkilledLabours"]');
        this.lowSkilledLaborRatePerHour = page.locator('input[formcontrolname="lowSkilledLaborRatePerHour"]');
        this.skilledLaborRatePerHour = page.locator('input[formcontrolname="skilledLaborRatePerHour"]');
        this.MachineSetupTime = page.locator('input[formcontrolname="setUpTime"]');
        this.directSetUpCost = page.locator('input[formcontrolname="directSetUpCost"]');
        this.machineHourRate = page.locator('input[formcontrolname="machineHourRate"]');
        this.directMachineCost = page.locator('input[formcontrolname="directMachineCost"]');
        this.directLaborCost = page.locator('input[formcontrolname="directLaborCost"]');
        this.QAInspectionTime = page.locator('input[formcontrolname="inspectionTime"]');
        this.QAInspectionCost = page.locator('input[formcontrolname="inspectionCost"]');
        this.SamplingRate = page.locator('input[formcontrolname="samplingRate"]');
        this.YieldPercentage = page.locator('input[formcontrolname="yieldPer"]');
        this.YieldCostPart = page.locator('input[formcontrolname="yieldCost"]');
        this.powerConsumptionKW = page.locator('input[formcontrolname="powerConsumption"]');
        this.electricityUnitCost = page.locator('input[formcontrolname="electricityUnitCost"]');
        this.totalPowerCost = page.locator('(//label[contains(.,"Total Power Cost ($)")]/following::input)[1]');
        this.netProcessCost = page.locator('input[formcontrolname="directProcessCost"]');
        // Tooling
        this.Tooling = page.getByRole('button', { name: 'Tooling' });
        this.ToolName = page
            .locator('.ng-valid.ng-touched > div > .card-body > div > div > .form-control')
            .first();
        this.SourceCountry = page
            .getByRole('region', { name: 'Tooling' })
            .getByPlaceholder('Select Delivery Country');
        this.ToolLife = page
            .locator('.ng-valid.ng-touched > div > .card-body > div > div:nth-child(3) > .form-control')
            .first();
        this.NoOfShots = page
            .locator('.ng-valid > div > .card-body > div > .col-4.mt-3 > .form-control')
            .first();
        // Cost Summary
        this.numCostSummary = page.locator("//mat-icon[@data-mat-icon-name='number']");
        this.MaterialTotalCost = page.locator('#MaterialCostAmount');
        this.materialSubTotalcost = page.locator('//table[@aria-describedby="Material"]//tfoot//td[contains(@class,"cdk-column-cost") and preceding-sibling::td[normalize-space()="Sub Total"]][1]');
        this.ManufacturingCost = page.locator('#ManufacturingCostAmount');
        this.mfgSubTotalcost = page.locator('//table[@aria-describedby="Manufacturing"]//td[contains(@class,"cdk-column-cost") and preceding-sibling::td[normalize-space()="Sub Total"]][1]');
        this.ToolingCost = page.locator('#ToolingCostAmount');
        this.OverheadProfit = page.locator('//div[@class="col"]//input[@id="OverheadandProfitAmount"]');
        // Overhead and Profit
        this.overHeadCost = page.locator('(//input[contains(@class,"form-control width94p")])[1]');
        this.profitCost = page.locator('//input[@formcontrolname="profitCost"]');
        this.costOfCapital = page.locator('//input[@formcontrolname="CostOfCapitalAmount"]');
        //	packing
        this.PackingCost = page
            .locator('//input[@formcontrolname="PackingCostAmount"]')
            .first();
        this.EXWPartCost = page.locator('#EXWPartCostAmount');
        this.shouldFreightCost = page.locator('#FreightCostAmount');
        this.logiFreightCost = page.locator("//input[@formcontrolname='FreightCost']");
        this.shouldDutiesTariff = page.locator('#DutiesandTariffAmount');
        this.PartShouldCost = page.locator('(//input[@id="ShouldCostAmount"])[1]');
        this.UpdateSave = page.getByRole('button', { name: 'Update & Save' });
        this.RecalculateCost = page.getByRole('button', {
            name: 'Recalculate Cost'
        });
        this.ExpandAll = page.getByRole('button', { name: 'Expand All' });
        this.CollapseAll = page.getByRole('button', { name: 'Collapse All' });
        this.CostingNotes = page.locator("//label[text()='Costing Notes']/following-sibling::div");
        this.primaryPackaging1 = page.locator("(//table[@aria-describedby='packagingTable']//tr[.//td[normalize-space()='Primary']]//td[contains(@class,'cdk-column-cost')] )[1]");
        this.primaryPackaging2 = page.locator("(//table[@aria-describedby='packagingTable']//tr[.//td[normalize-space()='Primary']]//td[contains(@class,'cdk-column-cost')] )[2]");
        this.secondaryPackaging = page.locator("(//table[@aria-describedby='packagingTable']//tr[.//td[normalize-space()='Secondary']]//td[contains(@class,'cdk-column-cost')] )[1]");
        this.tertiaryPackaging = page.locator("(//table[@aria-describedby='packagingTable']//tr[.//td[normalize-space()='Tertiary']]//td[contains(@class,'cdk-column-cost')] )[1]");
        this.logisticsFreightCost = page.locator("//input[@formcontrolname='FreightCost']");
        this.tariffCost = page.locator("//table[@aria-describedby='tariffBreakdown']//tfoot//td[normalize-space(text())='Subtotal']/following-sibling::td[contains(@class,'cdk-column-tariff')][3]");
        this.expandMtlInfo = page.locator("//mat-expansion-panel-header[.//h6[normalize-space()='Material Information']]//mat-panel-description[@class='mat-expansion-panel-header-description']//mat-icon[@role='img']//*[name()='svg']");
        this.expandMfgInfo = page.locator("//mat-expansion-panel-header[.//h6[normalize-space()='Manufacturing Information']]//mat-panel-description[@class='mat-expansion-panel-header-description']//mat-icon[@role='img']//*[name()='svg']");
        this.expandOHProfit = page.locator("//mat-expansion-panel-header[.//h6[normalize-space()='Overhead & Profit']]//mat-panel-description[@class='mat-expansion-panel-header-description']//mat-icon[@role='img']//*[name()='svg']");
        this.expandPack = page.locator("//mat-expansion-panel-header[.//h6[normalize-space()='Packaging']]//mat-panel-description[@class='mat-expansion-panel-header-description']//mat-icon[@role='img']//*[name()='svg']");
        this.expandLogiCost = page.locator("//mat-expansion-panel-header[.//h6[normalize-space()='Logistics Cost']]//mat-panel-description[@class='mat-expansion-panel-header-description']//mat-icon[@role='img']//*[name()='svg']");
        this.expandTariff = page.locator("//mat-expansion-panel-header[.//h6[normalize-space()='Tariff']]//mat-panel-description[@class='mat-expansion-panel-header-description']//mat-icon[@role='img']//*[name()='svg']");
    }
}
exports.MigWeldingPage = MigWeldingPage;
