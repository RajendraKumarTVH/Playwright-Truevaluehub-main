import { Component, OnInit, SimpleChange, ViewChild, inject, ChangeDetectorRef } from '@angular/core';
import { ProcessType, SimulationForm } from 'src/app/shared/models';
import { SimulationCalculationComponent } from '../simulation-sections/simulation-calculation/simulation-calculation.component';
import { PageEnum } from 'src/app/shared/enums';
import { BestProcessTotalCostDto } from '../../models/simulationTotalCostDto.model';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { CostingInformationComponent, CostingManufacturingInformationComponent, CostingMaterialInformationComponent } from 'src/app/modules/costing/components';
import { AppConfigurationService, BlockUiService, BomService, MaterialInfoService, MaterialMasterService, MedbMasterService, ProcessInfoService } from 'src/app/shared/services';
import { MaterialCalculatorService } from 'src/app/modules/costing/services/material-calculator.service';
import { Store } from '@ngxs/store';
import { MessagingService } from 'src/app/messaging/messaging.service';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ManufacturingCalculatorService } from 'src/app/modules/costing/services/manufacturing-calculator.service';
import { ToolingConfigService } from 'src/app/shared/config/cost-tooling-config';
import { CostingCompletionPercentageCalculator } from 'src/app/modules/costing/services';
import { Router } from '@angular/router';
import { LaborService } from 'src/app/shared/services/labor.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CostingConfig } from 'src/app/modules/costing/costing.config';
import { SimulationFormComponent } from '../simulation-sections/simulation-form/simulation-form.component';
import { MaterialPlatingCalculatorService } from 'src/app/modules/costing/services/material-plating-calculator.service';
import { CustomCableService } from 'src/app/modules/costing/services/manufacturing-custom-cable.service';
import { MaterialCastingCalculatorService } from 'src/app/modules/costing/services/material-casting-calculator.service';
import { ManufacturingWireCuttingTerminationCalculatorService } from 'src/app/modules/costing/services/manufacturing-wire-cutting-termination-calculator.service';
import { ManufacturingForgingCalculatorService } from 'src/app/modules/costing/services/manufacturing-forging-calculator.service';
import { MaterialStockMachiningCalculatorService } from 'src/app/modules/costing/services/material-stock-machining-calculator.service';
import { PlasticRubberCalculatorService } from 'src/app/modules/costing/services/plastic-rubber-material.service';
import { PlasticRubberProcessCalculatorService } from 'src/app/modules/costing/services/plastic-rubber-process-calculator.service';
import { MaterialCastingConfigService } from 'src/app/shared/config/material-casting-config';
import { MaterialConfigService } from 'src/app/shared/config/cost-material-config';
import { CommonMaterialCalculationService } from 'src/app/modules/costing/services/common-material-calculation.service';
import { ManufacturingConfigService } from 'src/app/shared/config/cost-manufacturing-config';
import { MaterialPCBConfigService } from 'src/app/shared/config/material-pcb-config';
import { SecondaryProcessCalculatorService } from 'src/app/modules/costing/services/manufacturing-secondary-process.service';
import { MaterialSecondaryProcessCalculatorService } from 'src/app/modules/costing/services/material-secondary-process.service';
import { MaterialCustomCableCalculatorService } from 'src/app/modules/costing/services/material-custom-cable-calculator.service';
import { WeldingCalculatorService } from 'src/app/modules/costing/services/manufacturing-welding-calculator.service';
import { SheetMetalProcessCalculatorService } from 'src/app/modules/costing/services/manufacturing-sheetmetal-calculator.service';
import { PCBCalculatorService } from 'src/app/modules/costing/services/material-pcb-calculator';
import { AiCommonService } from 'src/app/shared/services/ai-common-service';
// import { ManufacturingWiringHarnessCalculatorService } from 'src/app/modules/costing/services/manufacturing-wiringharness-calculator.service';
import { ManufacturingPCBConfigService } from 'src/app/shared/config/manufacturing-pcb-config';
import { ConventionalPCBCalculatorService } from 'src/app/modules/costing/services/conventional-pcb-calculator';
import { CostManufacturingMappingService } from 'src/app/shared/mapping/cost-manufacturing-mapping.service';
import { CostMaterialMappingService } from 'src/app/shared/mapping/cost-material-mapping.service';
import { DigitalFactoryHelper } from 'src/app/modules/costing/services/digital-factory-helper';
// import { CostToolingRecalculationService } from 'src/app/modules/costing/services/automation/cost-tooling-recalculation.service';
import { CostManufacturingAutomationService } from 'src/app/modules/costing/services/automation/cost-manufacturing-automation.service';
import { CommonModule } from '@angular/common';
import { BestProcessGraphicalComponent } from '../simulation-sections/best-process-graphical/best-process-graphical.component';
import { BestProcessTableComponent } from '../simulation-sections/best-process-table/best-process-table.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { CostingManufacturingExtractDataConfigService } from 'src/app/shared/config/costing-manufacturing-extract-data-config';
import { ManufacturingHelperService } from 'src/app/shared/helpers/manufacturing-helper.service';
import { ElectronicsConfigService } from 'src/app/shared/config/manufacturing-electronics-config';
import { AssemblyConfigService } from 'src/app/shared/config/manufacturing-assembly-config';
import { WiringHarnessConfig } from 'src/app/shared/config/wiring-harness-config';
import { MatDialog } from '@angular/material/dialog';
import { ManufacturingSemiRigidConfigService } from 'src/app/shared/config/manufacturing-semi-rigid-config';
// import { SavedAnalysisComponent } from '../saved-analysis/saved-analysis.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { CostManufacturingRecalculationService } from 'src/app/modules/costing/services/recalculation/cost-manufacturing-recalculation.service';
import { MaterialHelperService } from 'src/app/shared/helpers/material-helper.service';
import { DigitalFactoryService } from 'src/app/modules/digital-factory/Service/digital-factory.service';
import { MaterialInfoSignalsService } from 'src/app/shared/signals/material-info-signals.service';
import { MaterialCalculationByCommodityFactory } from 'src/app/modules/costing/services/MaterialCalculationByCommodityFactory';
import { ProcessInfoSignalsService } from 'src/app/shared/signals/process-info-signals.service';
import { PlasticRubberConfigService } from 'src/app/shared/config/plastic-rubber-config.service';
import { WeldingConfigService } from 'src/app/shared/config/welding-config';
import { CoreAutomationSignalsService } from 'src/app/shared/signals/core-automation-signals.service';
import { BomInfoSignalsService } from 'src/app/shared/signals/bom-info-signals.service';
import { RecalculationUpdateSignalsService } from 'src/app/shared/signals/recalculation-update-signals.service';
import { PCBACalculatorService } from 'src/app/modules/costing/services/material-pcba-calculator';
import { CostSummarySignalsService } from 'src/app/shared/signals/cost-summary-signals.service';

@Component({
  selector: 'app-best-process',
  templateUrl: './best-process.component.html',
  styleUrls: ['./best-process.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SimulationCalculationComponent,
    SimulationFormComponent,
    BestProcessGraphicalComponent,
    BestProcessTableComponent,
    MatExpansionModule,
    // SavedAnalysisComponent,
    MatTabsModule,
    MatIconModule,
  ],
})
export class BestProcessComponent implements OnInit {
  public simulationFormData: SimulationForm;
  public partInfo: any;
  public bestProcessList: BestProcessTotalCostDto[] = [];
  public pageEnum = PageEnum;
  public selectedProcesses: ProcessType[] = new Array<ProcessType>();

  @ViewChild(CostingInformationComponent) costinfoChild: CostingInformationComponent;
  @ViewChild(SimulationCalculationComponent) simulationCalculationComponent: SimulationCalculationComponent;
  @ViewChild(SimulationFormComponent) simulationFormComponent: SimulationFormComponent;
  retryCnt = 0;
  manufacturingcomp: CostingManufacturingInformationComponent;
  materialcomp: CostingMaterialInformationComponent;
  private cdr = inject(ChangeDetectorRef);

  constructor(
    public sharedService: SharedService,
    private blockUiService: BlockUiService,
    private _fb: FormBuilder,
    private laborService: LaborService,
    private router: Router,
    private percentageCalculator: CostingCompletionPercentageCalculator,
    private _toolConfig: ToolingConfigService,
    private _processService: ProcessInfoService,
    private _simulationServiceP: ManufacturingCalculatorService,
    private medbMasterService: MedbMasterService,
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    private messaging: MessagingService,
    private _store: Store,
    private _simulationService: MaterialCalculatorService,
    private _materialService: MaterialInfoService,
    private materialMasterService: MaterialMasterService,
    private _materialPlatingCalcService: MaterialPlatingCalculatorService,
    private _materialCastingCalcService: MaterialCastingCalculatorService,
    private _materialMachiningCalcService: MaterialStockMachiningCalculatorService,
    private _costingConfig: CostingConfig,
    private modalService: NgbModal,
    private _manufacturingWireCuttingTerminationCalService: ManufacturingWireCuttingTerminationCalculatorService,
    private _manufacturingForgingCalService: ManufacturingForgingCalculatorService,
    private _plasticService: PlasticRubberCalculatorService,
    private _plasticRubberService: PlasticRubberProcessCalculatorService,
    private materialCastingConfigService: MaterialCastingConfigService,
    private materialConfigService: MaterialConfigService,
    private commonService: CommonMaterialCalculationService,
    private _manufacturingConfig: ManufacturingConfigService,
    private materialPassivationConfigService: MaterialPCBConfigService,
    private _secondaryService: SecondaryProcessCalculatorService,
    private _assemblyService: MaterialSecondaryProcessCalculatorService,
    private _customCableCalculatorService: MaterialCustomCableCalculatorService,
    private _weldingService: WeldingCalculatorService,
    private _electronincs: ElectronicsConfigService,
    private _customCableService: CustomCableService,
    private _sheetMetalService: SheetMetalProcessCalculatorService,
    private _pcbCalcService: PCBCalculatorService,
    // private _wiringHarness: ManufacturingWiringHarnessCalculatorService,
    private _aiCommonService: AiCommonService,
    private _pcbConfig: ManufacturingPCBConfigService,
    private _pcbCalculator: ConventionalPCBCalculatorService,
    private _manufacturingMapper: CostManufacturingMappingService,
    private _materialMapper: CostMaterialMappingService,
    private _materialConfig: MaterialConfigService,
    private digitalFactoryHelper: DigitalFactoryHelper,
    private dialog: MatDialog,
    // private toolingRecalculationService: CostToolingRecalculationService,
    private manufacturingAutomationService: CostManufacturingAutomationService,
    private manufacturingExtractDataService: CostingManufacturingExtractDataConfigService,
    private _manufacturingHelperService: ManufacturingHelperService,
    private _assembly: AssemblyConfigService,
    private _harnessCOnfig: WiringHarnessConfig,
    private _semiRigidConfig: ManufacturingSemiRigidConfigService,
    private costManufacturingRecalculationService: CostManufacturingRecalculationService,
    private _materialHelperService: MaterialHelperService,
    private readonly digitalFactoryService: DigitalFactoryService,
    private materialInfoSignalService: MaterialInfoSignalsService,
    private _materialFactory: MaterialCalculationByCommodityFactory,
    private processInfoSignalService: ProcessInfoSignalsService,
    private _plasticRubberConfig: PlasticRubberConfigService,
    private weldingConfigService: WeldingConfigService,
    private coreAutomationSignalService: CoreAutomationSignalsService,
    private bomInfoSignalsService: BomInfoSignalsService,
    private recalculationUpdateSignalsService: RecalculationUpdateSignalsService,
    private _pcbaCalculatorService: PCBACalculatorService,
    private costSummarySignalsService: CostSummarySignalsService,
    private _bomService: BomService
  ) {}

  ngOnInit(): void {
    this.materialcomp = new CostingMaterialInformationComponent(
      this._fb,
      this.materialMasterService,
      this.messaging,
      this.modalService,
      this.router,
      this.percentageCalculator,
      this.sharedService,
      this.blockUiService,
      this._store,
      this.materialInfoSignalService,
      this._simulationService,
      this._materialService,
      this._materialPlatingCalcService,
      this._materialCastingCalcService,
      this._costingConfig,
      this._materialMachiningCalcService,
      //  this._plasticService,
      this.materialCastingConfigService,
      this.materialConfigService,
      this.commonService,
      this.materialPassivationConfigService,
      this._assemblyService,
      this._customCableCalculatorService,
      this._pcbCalcService,
      this._aiCommonService,
      this._materialMapper,
      this.digitalFactoryHelper,
      this.dialog,
      this._materialHelperService,
      this.digitalFactoryService,
      this._materialFactory,
      this.processInfoSignalService,
      this.coreAutomationSignalService,
      this._plasticRubberConfig,
      this.medbMasterService,
      this.recalculationUpdateSignalsService,
      this._pcbaCalculatorService,
      this.costSummarySignalsService,
      this.bomInfoSignalsService,
      this._bomService
    );
    this.materialcomp.page = this.pageEnum.BestProcess;
    this.manufacturingcomp = new CostingManufacturingInformationComponent(
      this._fb,
      this.medbMasterService,
      this.materialMasterService,
      this.laborService,
      this.messaging,
      this.router,
      this.percentageCalculator,
      this.sharedService,
      this._toolConfig,
      this._store,
      this.blockUiService,
      this._simulationServiceP,
      this._processService,
      this._costingConfig,
      this._manufacturingWireCuttingTerminationCalService,
      this._manufacturingForgingCalService,
      this._plasticRubberService,
      this._manufacturingConfig,
      this._secondaryService,
      this._weldingService,
      this._electronincs,
      this._customCableService,
      this.modalService,
      this._sheetMetalService,
      // this._wiringHarness,
      this._pcbConfig,
      this._pcbCalculator,
      this._manufacturingMapper,
      this._materialConfig,
      this.digitalFactoryHelper,
      // this.toolingRecalculationService,
      this.manufacturingAutomationService,
      this.manufacturingExtractDataService,
      this._manufacturingHelperService,
      this._assembly,
      this._harnessCOnfig,
      this._semiRigidConfig,
      this.costManufacturingRecalculationService,
      this.digitalFactoryService,
      this.materialInfoSignalService,
      this.processInfoSignalService,
      this.bomInfoSignalsService,
      this._plasticRubberConfig,
      this.weldingConfigService,
      this.coreAutomationSignalService
    );
    this.manufacturingcomp.page = this.pageEnum.BestProcess;
  }

  selectProcesses(val: ProcessType[]) {
    this.selectedProcesses = val;
  }

  prepareForSimulation($event) {
    this.bestProcessList = [];
    console.log(this.simulationFormData, $event);
    sessionStorage.setItem('processlist', JSON.stringify([]));
    this.retryCnt = 0;
    this.materialcomp.bestProcessIds = $event.selectedProcesses.map((p) => p.processTypeId);
    this.materialcomp.selectedProject = $event.selectedProject;
    this.materialcomp.ngOnInit();
    this.materialcomp.totmaterialList = null;
    this.materialcomp.dispatchMaterialInfo($event.selectedPart.partInfoId);
    this.materialcomp.recalculateMaterialCost($event.selectedPart);

    /** Get the Materials */
    this.manufacturingcomp.selectedProject = $event.selectedProject;
    this.manufacturingcomp.ngOnChanges({ part: <SimpleChange>{ previousValue: null, currentValue: $event.selectedPart, firstChange: true } });
    this.manufacturingcomp.ngOnInit();
    this.retryCnt = 0;
    this.materialResult($event);
  }

  materialResult($event) {
    setTimeout(() => {
      if (this.materialcomp.totmaterialList && this.materialcomp.totmaterialList.length > 0) {
        /** Get the Manufacturing/Process Data */
        console.log('materialResult', this.materialcomp.totmaterialList);
        this.materialcomp.totmaterialList.forEach((material) => {
          // console.log('materialResult-loop', { totmaterialList: [material], currentPart: $event.selectedPart });
          this.manufacturingcomp.recalculateProcessCost({ totmaterialList: [material], currentPart: $event.selectedPart });
        });
        this.retryCnt = 0;
        this.getPayloadData($event);
      } else {
        this.retryCnt++;
        console.log('Waiting for the Material List', this.retryCnt);
        if (this.retryCnt < 15) {
          this.materialResult($event);
        }
      }
    }, 2000);
  }

  getPayloadData($event) {
    setTimeout(() => {
      const processList = sessionStorage.getItem('processlist');
      if (JSON.parse(processList) && JSON.parse(processList).length >= $event.selectedProcesses.length) {
        /** Run Simulation */
        this.simulationCalculationComponent.runSimulation($event);
        this.simulationFormComponent.showLoader = true;
      } else {
        this.retryCnt++;
        console.log('Waiting for the Payload for Simulation', this.retryCnt);
        if (this.retryCnt < 15) {
          this.getPayloadData($event);
        } else {
          this.blockUiService.popBlockUI('BestProcess Simulation');
          this.messaging.openSnackBar(`Some issue happened in payload generation. Please try again.`, '', { duration: 5000 });
        }
      }
    }, 3000);
  }

  compileFinalResult(result: BestProcessTotalCostDto[]) {
    if (this.selectedProcesses.length === 0) {
      setTimeout(() => this.compileFinalResult(result), 1000);
      return;
    }
    console.log('Best Process pre Result:', result);
    const processMap = new Map<string, BestProcessTotalCostDto>();
    result.forEach((r) => {
      const uniqueId = `${r.countryId}-${r.processId}`;
      if (!processMap.has(uniqueId)) {
        const processCost = result.filter((bp) => `${bp.countryId}-${bp.processId}` === uniqueId).reduce((a, b) => a + (b.processCost || 0), 0);
        const processTypes = result.filter((bp) => `${bp.countryId}-${bp.processId}` === uniqueId).reduce((a, b) => a + `${b.processType}(${b.processTypeId}), `, '');
        const processEsg = result.filter((bp) => `${bp.countryId}-${bp.processId}` === uniqueId).reduce((a, b) => a + (b.processEsg || 0), 0);
        processMap.set(uniqueId, {
          ...r,
          processTypeId: null,
          processType: processTypes.slice(0, -2), // merging the manufacturing processes
          processName: this.selectedProcesses.find((x) => x.processTypeId === r?.processId)?.processType,
          processCost: this.sharedService.isValidNumber(processCost),
          materialCost: this.sharedService.isValidNumber(r.materialCost),
          toolingCost: this.sharedService.isValidNumber(r.toolingCost),
          amortizationCost: this.sharedService.isValidNumber(r.amortizationCost),
          ohpCost: this.sharedService.isValidNumber(r.ohpCost),
          packagingCost: this.sharedService.isValidNumber(r.packagingCost),
          logisticsCost: this.sharedService.isValidNumber(r.logisticsCost),
          processEsg: this.sharedService.isValidNumber(processEsg),
          totalCost: this.sharedService.isValidNumber((processCost || 0) + (r.materialCost || 0) + (r.amortizationCost || 0) + (r.ohpCost || 0) + (r.packagingCost || 0) + (r.logisticsCost || 0)),
          totalCostEsg: this.sharedService.isValidNumber(
            this.sharedService.isValidNumber(processEsg) +
              this.sharedService.isValidNumber(r.materialEsg) +
              this.sharedService.isValidNumber(r.packagingEsg) +
              this.sharedService.isValidNumber(r.logisticsEsg)
          ),
        });
      }
    });
    this.bestProcessList = [...processMap.values()].sort((a, b) => a.countryId - b.countryId);
    console.log('Best Process Result:', this.bestProcessList);
    setTimeout(() => {
      this.simulationFormComponent.showLoader = false;
    }, 3000);
  }

  getPreviousSimulationResult($event, i = 0) {
    if (this.simulationCalculationComponent || i > 2) {
      this.bestProcessList = [];
      this.simulationCalculationComponent.getPrevioussimulationResult($event);
    } else {
      setTimeout(() => {
        console.log('Retry GetPrevioussimulationResult');
        this.getPreviousSimulationResult($event, ++i);
      }, 2000);
    }
  }
}
