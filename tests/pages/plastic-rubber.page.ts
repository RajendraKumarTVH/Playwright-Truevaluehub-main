
import { Locator, Page, BrowserContext } from '@playwright/test';
import { BasePage } from '../lib/BasePage';

export class PlasticRubberPage extends BasePage {
    // Inputs
    readonly Density: Locator;
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
