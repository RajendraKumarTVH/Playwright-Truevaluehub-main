import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges, ViewChild, OnChanges, signal, effect } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, Subject, Subscription, combineLatest } from 'rxjs';
import {
  BillOfMaterialDto,
  CountryDataMasterDto,
  LaborRateMasterDto,
  MachineMarketDto,
  MaterialInfoDto,
  MaterialMarketDataDto,
  MaterialMasterDto,
  MedbMachinesMasterDto,
  MedbMachineTypeMasterDto,
  MedbProcessTypeMasterDto,
  PartInfoDto,
  ProcessInfoDto,
  ProjectInfoDto,
  ReCalculateContext,
  StockFormCategoriesDto,
} from 'src/app/shared/models';
import { MaterialMasterService, MedbMasterService, ProcessInfoService, BlockUiService } from 'src/app/shared/services';
import { takeUntil, first, take, delay, filter } from 'rxjs/operators';
import { ConfirmationDialogConfig, MessagingService } from 'src/app/messaging/messaging.service';
import { Router } from '@angular/router';
import { CostingCompletionPercentageCalculator } from '../../services/costing-completion-percentage-calculator';
import { PageEnum } from 'src/app/shared/enums';
import {
  ProcessType,
  StampingType,
  CommodityType,
  ForgingCutting,
  BendingToolTypes,
  PrimaryProcessType,
  ScreeName,
  CostingConfig,
  TypeOfCable,
  MachineType,
  MachiningTypes,
  MachineDetails,
} from 'src/app/modules/costing/costing.config';
import { SamplingRate } from '../../models/sampling-rate.model';
import { FieldColorsDto } from 'src/app/shared/models/field-colors.model';
import { SharedService } from '../../services/shared.service';
import { SubProcessTypeInfoDto } from 'src/app/shared/models/subprocess-info.model';
import { LaserCuttingTime, PlasmaCutting } from 'src/app/shared/models/sheet-metal-lookup.model';
import { Store } from '@ngxs/store';
// import * as ProcessInfoActions from 'src/app/modules/_actions/process-info.action';
// import * as BomsActions from 'src/app/modules/_actions/bom.action';
// import { BomTreeState } from 'src/app/modules/_state/bom.state';
// import { ProcessInfoState } from 'src/app/modules/_state/process-info.state';
import { SamplingRateState } from 'src/app/modules/_state/sampling-rate.state';
import { LaborService } from 'src/app/shared/services/labor.service';
import { ProcessTypeState } from 'src/app/modules/_state/process-type.state';
import { DrillingCutting } from 'src/app/shared/models/drilling-cutting.model';
import { PartingCuttingSpeedState } from 'src/app/modules/_state/machining-parting-cuttingspeed.state';
import { PartingCuttingDto } from 'src/app/shared/models/parting-cutting.modal';
import { LaserCuttingState } from 'src/app/modules/_state/laser-cutting-lookup.state';
import { TurningInfoDto } from 'src/app/shared/models/turning-info.model';
import { FacingDto } from 'src/app/shared/models/facing-info.model';
import { FacingState } from 'src/app/modules/_state/machining-facing-info.state';
import { Milling } from 'src/app/shared/models/machining-milling.model';
import { EndMillingState } from 'src/app/modules/_state/machining-end-milling.state';
import { SlotState } from 'src/app/modules/_state/machining-slot-milling.state';
import { EndMilling } from 'src/app/shared/models/machining-end-milling.model';
import { SlotMilling } from 'src/app/shared/models/machining-slotmilling.model';
import * as DescriptionJson from 'src/assets/descriptions.json';
import { CostToolingDto } from 'src/app/shared/models/tooling.model';
import { Grinding } from 'src/app/shared/models/machining-grinding.model';
import { ToolingConfigService } from 'src/app/shared/config/cost-tooling-config';
import { GetMigDataState } from 'src/app/modules/_state/machining-getmig-lookup.state';
import { MigWeldingLookupDto } from 'src/app/shared/models/migLookup.model';
import { CountryDataState } from 'src/app/modules/_state/country.state';
import { ForgingLookupDto } from 'src/app/shared/models/forging.model';
import { GetForgingState } from 'src/app/modules/_state/forging-lookup-state';
import { TappingLookupDto } from 'src/app/shared/models/machining-tapping.model';
import { ManufacturingCalculatorService } from '../../services/manufacturing-calculator.service';
import { DataExtraction } from 'src/app/shared/models/data-extraction.model';
import { DataExtractionState } from 'src/app/modules/_state/dataextraction.state';
import { CommentFieldFormIdentifierModel } from 'src/app/shared/models/comment-field-model';
import { ThermoFormingState } from 'src/app/modules/_state/thermal-forming-lookup.state';
import { WiringHarness } from 'src/app/shared/models/wiring-harness.model';
import { ThermoFormingTimeState } from 'src/app/modules/_state/thermal-forming-time.state';
import { CustomCableService } from '../../services/manufacturing-custom-cable.service';
import { ToolingCountryMasterState } from 'src/app/modules/_state/ToolingMaster.state';
import { ToolingCountryData } from 'src/app/shared/models/tooling-master-data';
import { ManufacturingWireCuttingTerminationCalculatorService } from '../../services/manufacturing-wire-cutting-termination-calculator.service';
import { ManufacturingForgingCalculatorService } from '../../services/manufacturing-forging-calculator.service';
import { PlasticRubberProcessCalculatorService } from '../../services/plastic-rubber-process-calculator.service';
import { PlasmaCuttingState } from 'src/app/modules/_state/plasma-cutting-lookup.state';
import { Boring } from 'src/app/shared/models/machining-boring.model';
import { ManufacturingConfigService } from 'src/app/shared/config/cost-manufacturing-config';
import { PlasticRubberConfigService } from 'src/app/shared/config/plastic-rubber-config.service';
import { SecondaryProcessCalculatorService } from '../../services/manufacturing-secondary-process.service';
import { WeldingCalculatorService } from '../../services/manufacturing-welding-calculator.service';
import { ElectronicsConfigService } from 'src/app/shared/config/manufacturing-electronics-config';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { CadViewerPopupComponent } from '../cad-viewer-popup/cad-viewer-popup.component';
import { ForgingShotBlasting } from 'src/app/shared/config/material-forging-config';
import { ForgingThreadDesignationDetails } from 'src/app/shared/models/forging-configs-model';
import { SheetMetalProcessCalculatorService } from '../../services/manufacturing-sheetmetal-calculator.service';
import { ManufacturingPCBConfigService, RoutingScoring, SurfaceFinish } from 'src/app/shared/config/manufacturing-pcb-config';
import { ConventionalPCBCalculatorService } from '../../services/conventional-pcb-calculator';
import { CostManufacturingMappingService } from 'src/app/shared/mapping/cost-manufacturing-mapping.service';
import { MaterialConfigService } from 'src/app/shared/config/cost-material-config';
import { DigitalFactoryHelper } from '../../services/digital-factory-helper';
import { StagingToolingType } from 'src/app/shared/config/sheetmetal-config';
import { SilkScreenColor } from 'src/app/shared/config/material-pcb-config';
import { TurningTypes } from 'src/app/shared/enums/machining-types.enum';
import { CostManufacturingAutomationService } from '../../services/automation/cost-manufacturing-automation.service';
import { CommonModule } from '@angular/common';
import { OnlyIntegerNumber, OnlyNumber } from 'src/app/shared/directives';
import { ManufacturingTableComponent } from './manufacturing-table/manufacturing-table.component';
import { FieldCommentComponent } from 'src/app/modules/comments/components/field-comment-button/field-comment.component';
import { MatIconModule } from '@angular/material/icon';
import { CleaningForgingProcessComponent } from './cleaning-forging-process/cleaning-forging-process.component';
import { BilletHeatingForgingProcessComponent } from './billet-heating-forging-process/billet-heating-forging-process.component';
import { TrimmingHydraulicForgingProcessComponent } from './trimming-hydraulic-forging-process/trimming-hydraulic-forging-process.component';
import { StraighteningOptionalForgingProcessComponent } from './straightening-optional-forging-process/straightening-optional-forging-process.component';
import { PiercingHydraulicForgingProcessComponent } from './piercing-hydraulic-forging-process/piercing-hydraulic-forging-process.component';
import { TestingMpiForgingProcessComponent } from './testing-mpi-forging-process/testing-mpi-forging-process.component';
import { MachiningProcessComponent } from './machining-process/machining-process.component';
import { TubeBendingProcessComponent } from './tube-bending-process/tube-bending-process.component';
import { InsulationJacketProcessComponent } from './insulation-jacket-process/insulation-jacket-process.component';
import { BrazingProcessComponent } from './brazing-process/brazing-process.component';
import { CastingProcessComponent } from './casting-process/casting-process.component';
import { MetalExtrusionProcessComponent } from './metal-extrusion-process/metal-extrusion-process.component';
import { PlasticTubeExtrusionProcessComponent } from './plastic-tube-extrusion-process/plastic-tube-extrusion-process.component';
import { CustomCableProcessComponent } from './custom-cable-process/custom-cable-process.component';
import { ForgingSubProcessComponent } from './forging-sub-process/forging-sub-process.component';
import { AssemblyProcessComponent } from './assembly-process/assembly-process.component';
import { NumberFieldComponent } from 'src/app/shared/components/number-field/number-field.component';
import { CompressionMoldingComponent } from './compression-molding/compression-molding.component';
import { SheetMetalProcessComponent } from './sheet-metal-process/sheet-metal-process.component';
import { WiringHarnessProcessComponent } from './wiring-harness-process/wiring-harness-process.component';
import { CostingManufacturingExtractDataConfigService } from 'src/app/shared/config/costing-manufacturing-extract-data-config';
import { ManufacturingHelperService } from 'src/app/shared/helpers/manufacturing-helper.service';
import { FormGroupKeys } from 'src/app/shared/enums/manufacturing-formgroups.enum';
import { ManufacturingSustainabilityComponent } from './manufacturing-sustainability/manufacturing-sustainability.component';
import { PcbaProcessComponent } from './pcba-process/pcba-process.component';
import { AssemblyConfigService, AssemblyType } from 'src/app/shared/config/manufacturing-assembly-config';
import { MarketMonthState } from 'src/app/modules/_state/market-month.state';
import { HarnessSubProcessTypes, WiringHarnessConfig } from 'src/app/shared/config/wiring-harness-config';
import { MatTabsModule } from '@angular/material/tabs';
import { AutoTooltipDirective } from 'src/app/shared/directives/auto-tooltip.directive';
import { ManufacturingSemiRigidConfigService } from 'src/app/shared/config/manufacturing-semi-rigid-config';
import { UserCanUpdateCostingState } from 'src/app/modules/_state/userCanUpdate-costing.state';
import { CostManufacturingRecalculationService } from '../../services/recalculation/cost-manufacturing-recalculation.service';
import { InfoTooltipComponent } from 'src/app/shared/components/info-tooltip/info-tooltip.component';
import { FormingTime, ThermoForming } from 'src/app/shared/models/thermo-forming.models';
import { DigitalFactoryService } from 'src/app/modules/digital-factory/Service/digital-factory.service';
import { MaterialInfoSignalsService } from 'src/app/shared/signals/material-info-signals.service';
import { ProcessInfoSignalsService } from 'src/app/shared/signals/process-info-signals.service';
import { WeldingConfigService } from 'src/app/shared/config/welding-config';
import { CoreAutomationSignalsService } from 'src/app/shared/signals/core-automation-signals.service';
import { BomInfoSignalsService } from 'src/app/shared/signals/bom-info-signals.service';
import { MachineDetailsComponent } from './machine-details/machine-details.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { StockFormsCategoriesState } from 'src/app/modules/_state/stock-forms-categories.state';

@Component({
  selector: 'app-costing-manufacturing-information',
  templateUrl: './costing-manufacturing-information.component.html',
  styleUrls: ['./costing-manufacturing-information.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    OnlyNumber,
    ManufacturingTableComponent,
    FieldCommentComponent,
    MatIconModule,
    CleaningForgingProcessComponent,
    BilletHeatingForgingProcessComponent,
    TrimmingHydraulicForgingProcessComponent,
    StraighteningOptionalForgingProcessComponent,
    PiercingHydraulicForgingProcessComponent,
    TestingMpiForgingProcessComponent,
    MachiningProcessComponent,
    TubeBendingProcessComponent,
    InsulationJacketProcessComponent,
    BrazingProcessComponent,
    CastingProcessComponent,
    MetalExtrusionProcessComponent,
    PlasticTubeExtrusionProcessComponent,
    CustomCableProcessComponent,
    ForgingSubProcessComponent,
    AssemblyProcessComponent,
    NumberFieldComponent,
    NgbPopover,
    CompressionMoldingComponent,
    SheetMetalProcessComponent,
    OnlyIntegerNumber,
    ManufacturingSustainabilityComponent,
    WiringHarnessProcessComponent,
    PcbaProcessComponent,
    MatTabsModule,
    AutoTooltipDirective,
    InfoTooltipComponent,
    MachineDetailsComponent,
  ],
})
export class CostingManufacturingInformationComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  @Input() part: PartInfoDto;
  @Input() selectedProject: ProjectInfoDto;
  @Input() canUpdate: boolean = false;
  //need to check
  @Input() formprocessInfoDto: ProcessInfoDto;
  @Input() partComplexityChangeSubject: Subject<PartInfoDto>;
  @Output() completionPercentageChange = new EventEmitter<number>();
  @Output() dirtyCheckEvent = new EventEmitter<boolean>();
  @Output() processInfoDtoOut = new EventEmitter<ProcessInfoDto>();
  @Output() listProcessInfoDtoOut = new EventEmitter<ProcessInfoDto[]>();
  @Output() laborRateInfoDtoOut = new EventEmitter<LaborRateMasterDto[]>();
  _canUserUpdateCosting$: Observable<boolean> = this._store.select(UserCanUpdateCostingState.getCanUserUpdateCosting);
  dataCompletionPercentage: any;
  public currentPart: PartInfoDto;
  public machineInfoList: ProcessInfoDto[];
  public materialInfoList: MaterialInfoDto[];
  lstdescriptions: any = (DescriptionJson as any).default;
  url = '';
  name = 'World';
  show = false;
  samplingRates: SamplingRate[];
  public drillingCuttingSpeedList: DrillingCutting[];
  public partingCuttingSpeedList: PartingCuttingDto[];
  public costingManufacturingInfoform: FormGroup;
  public processTypesList: any[] = [];
  public curingPartTypes = this._plasticRubberConfig.rubberCuringPartTypes;
  public gapBetweenTrays = this._plasticRubberConfig.gapBetweenTrays;
  public weldFinishTypes = this.weldingConfigService.weldFinishTypes;
  public processTypeOrginalList: any[] = [];
  weldingPositionList: any[] = [];
  threadDesignationList: ForgingThreadDesignationDetails[] = [];
  public machineTypeDescription = signal<MedbMachinesMasterDto[]>([]);
  public fullMachineTypeDescription: MedbMachinesMasterDto[] = [];
  // public isCT1detailsDisplay = false;
  // public isCT2detailsDisplay = false;
  public machinePriceData: any;
  public machinePriceDataTemp: any;
  public filterResult: MedbProcessTypeMasterDto | undefined;
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  public tmpprocessInfoId = 0;
  public isNewProcessinfo = false;
  public isPageLoad = false;
  public ToolingMasterData: ToolingCountryData[] = [];
  public IsCountryChanged = false;
  public subProcessNamesList: any = [];
  public forgingSubProcessList: any = [];
  costLoaders: boolean = false;
  public toolNamesList: any = [];
  public BOPDescriptionList: any = [];
  public moldItemDescsriptionsList: any = [];
  public processGroupList: any = [];
  public machineMaster: MedbMachinesMasterDto;
  public commodity = { isInjMoulding: false, isSheetMetal: false, isCasting: false };
  IsManufactureData = false;
  public defaultValues = this._manufacturingConfig.defaultValues;
  dialogSub: Subscription;
  hasUnsavedEventSub$: Subscription = Subscription.EMPTY;
  nexturltonavigate: any;
  manufacturingObj: ProcessInfoDto;
  samplingData: SamplingRate;
  laborRateInfo: LaborRateMasterDto[] = [];
  materialType: number = 0;
  materialTypeName: string = '';
  totToolingMaterialWeight: number = 0;
  electonicsSubject: Subject<void> = new Subject<void>();
  forgingSubject: Subject<void> = new Subject<void>();
  public processFlag = this._manufacturingConfig.processFlag;
  laborCountByMachineType: any;
  private materialInfo = { weight: 0, scrapPrice: 0, totalCost: 0 };
  public isNewProcessAdded: boolean = false;
  // private stagetoolingCompletion = { bending: false, forming: false, bendCount: 0, completedBendCount: 0 };
  selectedProcessInfoId: number = 0;
  fieldColorsList: FieldColorsDto[] = [];
  materialmasterDatas: MaterialMasterDto;
  afterChange: boolean = false;
  processTypeId = ProcessType;
  MachiningFlags = this._manufacturingConfig._machining.getMachiningFlags();
  public forging = this._manufacturingConfig.forgingDefaultValues;
  public forgingCutting = { bandSawCutting: false, stockShearing: false };
  public bendingType = { soft: false, dedicated: false };
  public electronicsProcessFlags = this._manufacturingConfig.electronicsProcessFlags;
  public page: PageEnum;
  public pageEnum = PageEnum;
  public defaultMarketDataList: MaterialMarketDataDto[] = [];
  showAddProcessBtn = false;
  // handlingTimeList: HandlingTime[] = [];
  // toolLoadingTimeList: ToolLoadingTime[] = [];
  // strokeRateList: StrokeRate[] = [];
  // strokeRateManualList: StrokeRateManual[] = [];
  laserCutttingTimeList: LaserCuttingTime[] = [];
  plasmaCutttingSpeedList: PlasmaCutting[] = [];
  turningLookupList: TurningInfoDto[] = [];
  facingLookupList: FacingDto[] = [];
  // groovingLookupList: GroovingLookupDto[] = [];
  millingLookupList: Milling[] = [];
  SlotMillingLookupList: any[] = [];
  endMillingLookupList: any[] = [];
  boringLookupList: Boring[] = [];
  grindingLookupList: Grinding[] = [];
  MigLookupList: MigWeldingLookupDto[] = [];
  forgingLookupList: ForgingLookupDto[] = [];
  operationNameList: any[] = [];
  countryList: CountryDataMasterDto[] = [];
  thermoFormingList: ThermoForming[] = [];
  formingTimeList: FormingTime[] = [];
  wiringHarnessLookupList: WiringHarness[] = [];
  TappingLookup: TappingLookupDto[] = [];
  BillOfMaterialList: BillOfMaterialDto[];
  hideToolingRequired: boolean = false;
  extractedDfmData: any;
  isEnableUnitConversion = false;
  conversionValue: any;
  selectedMachineDescription = '';
  selectedWeldingCapacity = 0;
  selectedTypeOfOperationId = 0;
  isConveyourTypeOfOperation = false;
  totSubProcessCount = 0;
  weldPositionList = this._costingConfig.weldPositionList();
  typeOfWeldList = this._costingConfig.typeOfWelds();
  lblChambertext: string = '';
  newCoreAdded: boolean = false;
  public FormGroupKeys = FormGroupKeys;
  @Output() manufactureDataEmit = new EventEmitter<ProcessInfoDto[]>();
  @Output() manufactureDataDeleteEmit = new EventEmitter<any>();
  @Input() recalculateSubject: Subject<MaterialInfoDto[]>;
  @Output() recalculationCompletedEvent = new EventEmitter<any>();
  @Input() countryChangeSubject: Subject<boolean>;
  @Input() commodityChangeSubject: Subject<boolean>;
  @ViewChild(WiringHarnessProcessComponent) wiringHarnessComponent!: WiringHarnessProcessComponent;

  _countryToolingData$: Observable<ToolingCountryData[]>;
  _dataExtraction$: Observable<DataExtraction>;
  _countryData$: Observable<CountryDataMasterDto[]>;
  // _materialInfo$: Observable<MaterialInfoDto[]>;
  // _processInfo$: Observable<ProcessInfoDto[]>;
  _processType$: Observable<MedbProcessTypeMasterDto[]>;
  _samplingRate$: Observable<SamplingRate[]>;
  // _drillingCuttingSpeed$: Observable<DrillingCutting[]>;
  _partingCuttingSpeed$: Observable<PartingCuttingDto[]>;
  //_handlingTime$: Observable<HandlingTime[]>;
  // _toolLoadTime$: Observable<ToolLoadingTime[]>;
  // _strokeRates$: Observable<StrokeRate[]>;
  // _strokeRatesManual$: Observable<StrokeRateManual[]>;
  _laserCuttting$: Observable<LaserCuttingTime[]>;
  _turningLookup$: Observable<TurningInfoDto[]>;
  _facingLookup$: Observable<FacingDto[]>;
  // _groovingLookup$: Observable<GroovingLookupDto[]>;
  // _milling$: Observable<Milling[]>;
  _slotMilling$: Observable<SlotMilling[]>;
  _endMilling$: Observable<EndMilling[]>;
  // _boringLookup$: Observable<Boring[]>;
  // _grindingLookup$: Observable<Grinding[]>;
  _getMigLookup$: Observable<MigWeldingLookupDto[]>;
  _getForgingLookup$: Observable<ForgingLookupDto[]>;
  _thermoForming$: Observable<ThermoForming[]>;
  _formingTime$: Observable<FormingTime[]>;
  // _wiringHarness$: Observable<WiringHarness[]>;
  // _bomsInfo$: Observable<BillOfMaterialDto[]>;
  _plasmaCuttting$: Observable<PlasmaCutting[]>;
  formIdentifier: CommentFieldFormIdentifierModel = {
    partInfoId: 0,
    screenId: ScreeName.Manufacturing,
    primaryId: 0,
    secondaryID: 0,
  };
  machineDetails: MachineDetails;
  colorInfoLoadingProgress = false;
  meddbMachineMasterLoadingProgress = false;
  isLaborCountLoadingProgress = false;
  laborRateLoadingProgress = false;
  materialInfosLoadingProgress = false;
  automationProcessCount = 0;
  totProcessList: ProcessInfoDto[] = [];
  r2rPlatingFields: { id: string; label: string; name: string }[] = [];
  platingFields: { id: string; label: string; name: string }[] = [];
  galvanizationFields: { id: string; label: string; name: string }[] = [];
  _currentMarketMonth$: Observable<string> = this._store.select(MarketMonthState.getSelectedMarketMonth);
  currentMarketMonth: string = null;
  public tabs: string[] = ['Manufacturing Details', 'Machine Details'];
  automationLevelList: any[] = [];
  materialInfoEffect = effect(() => this.getMaterialInfos(this.materialInfoSignalService.materialInfos()));
  processInfoEffect = effect(() => this.getProcessInfos(this.processInfoSignalService.processInfos()));
  coreAutomationEffect = effect(() => {
    const newCoreProcessAutomation = this.coreAutomationSignalService.recalculateSignal();
    if (!newCoreProcessAutomation) return;
    this.recalculateProcessCost(newCoreProcessAutomation);
  });
  bomInfoEffect = effect(() => {
    const bomInfo = this.bomInfoSignalsService.bomInfo();
    if (bomInfo?.length > 0) {
      this.BillOfMaterialList = bomInfo;
    }
  });
  collapsedSections: boolean[] = [];
  selectedProcessTypeIdSignal: any;

  processTypeIdEffect = effect(() => {
    const processId = this.selectedProcessTypeIdSignal();
    if (processId) {
      const process = this.processTypesList?.flatMap((x) => x.data).find((y) => y.processTypeId === processId);
      this.machineDetails.selectedProcessTypeName = process?.primaryProcess ?? '';
    }
  });
  stockFormCategoriesDto: StockFormCategoriesDto[] = [];
  _stockFormCategoriesData$: Observable<StockFormCategoriesDto[]> = this._store.select(StockFormsCategoriesState.getStockFormsCategories);

  constructor(
    private _fb: FormBuilder,
    private medbMasterService: MedbMasterService,
    private materialMasterService: MaterialMasterService,
    private laborService: LaborService,
    private messaging: MessagingService,
    private router: Router,
    private percentageCalculator: CostingCompletionPercentageCalculator,
    public sharedService: SharedService,
    private _toolConfig: ToolingConfigService,
    private _store: Store,
    private blockUiService: BlockUiService,
    private _simulationService: ManufacturingCalculatorService,
    private _processService: ProcessInfoService,
    private _costingConfig: CostingConfig,
    private _manufacturingWireCuttingTerminationCalService: ManufacturingWireCuttingTerminationCalculatorService,
    private _manufacturingForgingCalService: ManufacturingForgingCalculatorService,
    private _plasticRubberService: PlasticRubberProcessCalculatorService,
    public _manufacturingConfig: ManufacturingConfigService,
    private _secondaryService: SecondaryProcessCalculatorService,
    private _weldingService: WeldingCalculatorService,
    private _electronincs: ElectronicsConfigService,
    private _customCableService: CustomCableService,
    private modalService: NgbModal,
    private _sheetMetalService: SheetMetalProcessCalculatorService,
    // private _wiringHarness: ManufacturingWiringHarnessCalculatorService,
    private _pcbConfig: ManufacturingPCBConfigService,
    private _pcbCalculator: ConventionalPCBCalculatorService,
    private _manufacturingMapper: CostManufacturingMappingService,
    private _materialConfig: MaterialConfigService,
    private digitalFacotyHelper: DigitalFactoryHelper,
    private costManufacturingAutomationService: CostManufacturingAutomationService,
    private manufacturingExtractDataService: CostingManufacturingExtractDataConfigService,
    private _manufacturingHelperService: ManufacturingHelperService,
    private _assembly: AssemblyConfigService,
    private _harnessConfig: WiringHarnessConfig,
    private _semiRigidConfig: ManufacturingSemiRigidConfigService,
    private costManufacturingRecalculationService: CostManufacturingRecalculationService,
    private readonly digitalFactoryService: DigitalFactoryService,
    private materialInfoSignalService: MaterialInfoSignalsService,
    private processInfoSignalService: ProcessInfoSignalsService,
    private bomInfoSignalsService: BomInfoSignalsService,
    private _plasticRubberConfig: PlasticRubberConfigService,
    private weldingConfigService: WeldingConfigService,
    private coreAutomationSignalService: CoreAutomationSignalsService
  ) {
    this._currentMarketMonth$.pipe(takeUntil(this.unsubscribe$)).subscribe((result: string) => {
      if (result) {
        this.currentMarketMonth = result;
      }
    });
    this._canUserUpdateCosting$.pipe(takeUntil(this.unsubscribe$)).subscribe((result: boolean) => {
      this.canUpdate = result;
    });
    this._stockFormCategoriesData$.pipe(takeUntil(this.unsubscribe$)).subscribe((result: StockFormCategoriesDto[]) => {
      if (result && result.length > 0) {
        this.stockFormCategoriesDto = result;
      }
    });
    this.costingManufacturingInfoform = this._fb.group(this._manufacturingMapper.getManufacturingFormFields(this.conversionValue, this.isEnableUnitConversion));
    this._countryToolingData$ = this._store.select(ToolingCountryMasterState.getToolingCountryMasterData);
    this._dataExtraction$ = this._store.select(DataExtractionState.getDataExtraction);
    this._countryData$ = this._store.select(CountryDataState.getCountryData);
    // this._materialInfo$ = this._store.select(MaterialInfoState.getMaterialInfos);
    // this._processInfo$ = this._store.select(ProcessInfoState.getProcessInfos);
    this._processType$ = this._store.select(ProcessTypeState.getProcessTypeList);
    this._samplingRate$ = this._store.select(SamplingRateState.getSamplingRates);
    // this._drillingCuttingSpeed$ = this._store.select(DrillingCuttingSpeedState.getDrillingCuttingSpeed);
    this._partingCuttingSpeed$ = this._store.select(PartingCuttingSpeedState.getPartingCuttingSpeed);
    // this._handlingTime$ = this._store.select(HandlingTimeState.getHandlingTime);
    // this._toolLoadTime$ = this._store.select(ToolLoadingTimeState.getToolLoadingTime);
    // this._strokeRates$ = this._store.select(StrokeRateState.getStrokeRate);
    // this._strokeRatesManual$ = this._store.select(StrokeRateManualState.getStrokeRateManual);
    this._laserCuttting$ = this._store.select(LaserCuttingState.getLaserCutting);
    // this._turningLookup$ = this._store.select(TurningState.getTurningLookup);
    this._facingLookup$ = this._store.select(FacingState.getFacingLookup);
    // this._groovingLookup$ = this._store.select(GroovingState.getGroovingLookup);
    // this._milling$ = this._store.select(FaceMillingState.getFaceMillingLookup);
    this._slotMilling$ = this._store.select(SlotState.getSlotLookup);
    this._endMilling$ = this._store.select(EndMillingState.getEndMillingLookup);
    // this._boringLookup$ = this._store.select(BoringState.getBoringLookup);
    // this._grindingLookup$ = this._store.select(GrindingState.getGrindingLookup);
    this._getMigLookup$ = this._store.select(GetMigDataState.getMigLookup);
    this._getForgingLookup$ = this._store.select(GetForgingState.getForgingLookup);
    this._thermoForming$ = this._store.select(ThermoFormingState.getThermoFormingLookup);
    this._formingTime$ = this._store.select(ThermoFormingTimeState.getThermoFormingTime);
    // this._wiringHarness$ = this._store.select(WiringHarnessState.getWiringHarnessLookup);
    // this._bomsInfo$ = this._store.select(BomTreeState.getBomsByProjectId);
    this._plasmaCuttting$ = this._store.select(PlasmaCuttingState.getPlasmaCutting);
    this.selectedProcessTypeIdSignal = toSignal(this.costingManufacturingInfoform!.get('processTypeID')!.valueChanges, {
      initialValue: this.costingManufacturingInfoform!.get('processTypeID')!.value,
    });

    effect(() => {
      if (this.sharedService.sharedSignal.openCadViewer()?.caller === 'manufacturing') {
        this.openCadViewer();
        this.sharedService.sharedSignal.openCadViewer.set({ caller: 'bom-details' });
      }
    });
  }

  ngOnInit(): void {
    this.collapsedSections = this.subProcessFormArray?.controls.map(() => true);
    this.IsCountryChanged = false;
    [this.isEnableUnitConversion, this.conversionValue] = this.sharedService.setUnitMeasurement();
    this.platingFields = this._manufacturingConfig._platingnConfig.getPlatingFields();
    this.r2rPlatingFields = this._manufacturingConfig._platingnConfig.getR2RPlatingFields(this.isEnableUnitConversion, this.conversionValue);
    this.galvanizationFields = this._manufacturingConfig._platingnConfig.getGalvanizationFields();
    this.loadDataBasedonCommodity();
    this.subscribeAssign(this._countryToolingData$, 'ToolingMasterData', 1);
    this.subscribeAssign(this._countryData$, 'countryList', 1);
    this.subscribeAssign(this._samplingRate$, 'samplingRates', 1, () => this.calculateSamplingRate);
    // this.getProcessInfos();
    this.listProcessInfoDtoOut.emit(this.machineInfoList);
    // this.getMaterialInfos();
    this.subscribeAssign(this._thermoForming$, 'thermoFormingList', 1);
    // this.subscribeAssign(this._drillingCuttingSpeed$, 'drillingCuttingSpeedList', 1);
    this.subscribeAssign(this._partingCuttingSpeed$, 'partingCuttingSpeedList', 1);
    // this.subscribeAssign(this._handlingTime$, 'handlingTimeList', 1);
    // this.subscribeAssign(this._toolLoadTime$, 'toolLoadingTimeList', 1);
    // this.subscribeAssign(this._strokeRates$, 'strokeRateList', 1);
    // this.subscribeAssign(this._strokeRatesManual$, 'strokeRateManualList', 1);
    this.subscribeAssign(this._laserCuttting$, 'laserCutttingTimeList', 1);
    this.subscribeAssign(this._plasmaCuttting$, 'plasmaCutttingSpeedList', 1);
    // this.subscribeAssign(this._turningLookup$, 'turningLookupList', 1);
    this.subscribeAssign(this._facingLookup$, 'facingLookupList', 1);
    // this.subscribeAssign(this._groovingLookup$, 'groovingLookupList', 1);
    // this.subscribeAssign(this._milling$, 'millingLookupList', 1);
    this.subscribeAssign(this._slotMilling$, 'SlotMillingLookupList', 1);
    this.subscribeAssign(this._endMilling$, 'endMillingLookupList', 1);
    // this.subscribeAssign(this._boringLookup$, 'boringLookupList', 1);
    // this.subscribeAssign(this._grindingLookup$, 'grindingLookupList', 1);
    this.subscribeAssign(this._getMigLookup$, 'MigLookupList', 1);
    this.subscribeAssign(this._getForgingLookup$, 'forgingLookupList', 1);
    this.subscribeAssign(this._formingTime$, 'formingTimeList', 1);
    // this.subscribeAssign(this._wiringHarness$, 'wiringHarnessLookupList', 1);
    // this.subscribeAssign(this._bomsInfo$, 'BillOfMaterialList', 1);
    this.forgingSubProcessList = this._materialConfig._materialForgingConfigService.getForgingSubProcesses();
    // this.isCT2detailsDisplay = false;
    // this.isCT1detailsDisplay = false;
    this.automationLevelList = this._harnessConfig.getAutomationLevelList();
    if (this.machineInfoList != null && this.machineInfoList.length == 0) {
      this.selectedProcessInfoId = 0;
      this.formIdentifier = { ...this.formIdentifier, primaryId: this.selectedProcessInfoId };
      this.manufacturingObj = new ProcessInfoDto();
    }
    this.setLaborRateBasedOnCountry();
    if (!this.processFlag.IsProcessTypeTesting) {
      this.calculateSamplingRate();
    }
    this.recalculateSubject?.pipe(takeUntil(this.unsubscribe$)).subscribe((e) => {
      this.recalculateProcessCost(e);
    });
    this.countryChangeSubject?.pipe(takeUntil(this.unsubscribe$)).subscribe((e) => {
      this.IsCountryChanged = e;
    });
    this.completionPercentageChange.emit(0);
    this.partComplexityChangeSubject?.pipe(takeUntil(this.unsubscribe$)).subscribe((e) => {
      this.currentPart = { ...e };
      if (this.currentPart?.partComplexity !== e.partComplexity) {
        this.calculateCost();
      }
    });
    this.costManufacturingAutomationService.recalculationCompleted$
      .pipe(
        takeUntil(this.unsubscribe$),
        filter((result) => !!result)
      )
      .subscribe((result) => {
        this.recalculationCompletedEvent.emit(result);
      });
    this.costManufacturingAutomationService.automationResult$.pipe(takeUntil(this.unsubscribe$)).subscribe((result) => {
      this.updateOnAutomation(result);
    });
  }
  ngAfterViewInit() {
    this.costingManufacturingInfoform.valueChanges.subscribe((change) => {
      const value = this.percentageCalculator.manufacturingInformation(change, this.processFlag);
      this.completionPercentageChange.emit(value);
      this.dataCompletionPercentage = value;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['part'] && changes['part'].currentValue != changes['part'].previousValue && changes['part'].currentValue?.partInfoId) {
      if (
        changes['part'].currentValue?.partInfoId != changes['part'].previousValue?.partInfoId ||
        changes['part'].currentValue?.commodityId != changes['part'].previousValue?.commodityId ||
        changes['part'].currentValue?.mfrCountryId != changes['part'].previousValue?.mfrCountryId
      ) {
        this.loadDataBasedonCommodity();
        this.reset();
        this.clearOnPartChange();
        this.currentPart = changes['part'].currentValue;
        if (!this.costingManufacturingInfoform) {
          this.costingManufacturingInfoform = this._fb.group(this._manufacturingMapper.getManufacturingFormFields(this.conversionValue, this.isEnableUnitConversion));
        }
        // this.getMaterialInfos();
        this.formIdentifier = { ...this.formIdentifier, partInfoId: this.currentPart.partInfoId };
        this.dispatchProcessInfo(this.currentPart.partInfoId);
        this.dispatchToGetBom(this.currentPart.projectInfoId);
        this.getFromMaterial();
        this.calculateSamplingRate();
        if (this.currentPart?.mfrCountryId) {
          this.getLaborRateBasedOnCountry(this.currentPart?.mfrCountryId, this.currentPart?.supplierRegionId);
          this.getLaborCountBasedOnCountry(this.currentPart?.mfrCountryId);
        }
      }
    }
  }

  toggleCollapse(index: number) {
    this.collapsedSections[index] = !this.collapsedSections[index];
  }

  public checkIfFormDirty() {
    return this.afterChange;
  }

  public resetform() {
    return this.costingManufacturingInfoform.reset();
  }

  private subscribeAssign(observer, assignee, minLength, callbackFn?: () => void) {
    // const observerArr = observer.split('.');
    // const observerObj = (observerArr.length === 2) ? this[observerArr[0]][observerArr[1]]() : this[observerArr[0]];
    observer.pipe(takeUntil(this.unsubscribe$)).subscribe((result: any[]) => {
      if (result?.length >= minLength) {
        this[assignee] = result;
        callbackFn?.();
      }
    });
  }

  getFormGroup(groupName: string): FormGroup {
    return this.costingManufacturingInfoform.get(groupName) as FormGroup;
  }

  getFormArray(groupKey: FormGroupKeys): FormArray {
    return this.getFormGroup(groupKey)?.get('subProcessList') as FormArray;
  }

  get visibleTabs(): string[] {
    return this.tabs.filter((t) => !(t === 'Machine Details' && this._manufacturingConfig._castingConfig.castingFlags.some((flag) => this.processFlag[flag])));
  }

  get f() {
    return this.costingManufacturingInfoform.controls;
  }
  get coreCycleTimeArray(): FormArray {
    return this.costingManufacturingInfoform.get('coreCycleTimes') as FormArray;
  }
  get machiningOperationTypeFormArray() {
    return this.getFormGroup(FormGroupKeys.Machining)?.controls?.machiningOperationType as FormArray;
  }
  get machiningOperationTypeLen() {
    return this.machiningOperationTypeFormArray?.controls?.length;
  }
  get formAryLen() {
    return this.subProcessFormArray?.controls?.length;
  }

  get subProcessFormArray() {
    let formGroup = this.costingManufacturingInfoform;
    if (this.processFlag.IsProcessWiringHarness) {
      formGroup = this.getFormGroup(FormGroupKeys.WiringHarness);
    } else if (this.processFlag.IsProcessAssembly) {
      formGroup = this.getFormGroup(FormGroupKeys.Assembly);
    }
    return formGroup?.controls?.subProcessList as FormArray;
  }

  triggerMachiningOperation($event) {
    const { functionName, params } = $event;
    if (params?.length > 0) {
      this[functionName](...params);
    } else {
      this[functionName]();
    }
  }

  doCalculateCost($event) {
    const { fieldName } = $event;
    this.calculateCost(fieldName);
  }

  subProcessChange(subarray: FormArray<any>) {
    this.subProcessFormArray.clear();
    subarray.controls.forEach((element) => {
      this.subProcessFormArray.push(element);
    });
  }

  dispatchProcessInfo(partInfoId: number) {
    this.machineInfoList = [];
    // this._store.dispatch(new ProcessInfoActions.GetProcessInfosByPartInfoId(partInfoId));
    this.processInfoSignalService.getProcessInfosByPartInfoId(partInfoId);
  }

  dispatchToGetBom(projectInfoId: number) {
    // projectInfoId > 0 && this._store.dispatch(new BomsActions.GetBomsByProjectId(projectInfoId));
    projectInfoId > 0 && this.bomInfoSignalsService.getBomsByProjectId(projectInfoId);
  }

  loadDataBasedonCommodity() {
    this.threadDesignationList = this._materialConfig._materialForgingConfigService.getThreadDesignationDetails();
    if (this.currentPart?.commodityId) {
      this.commodity.isInjMoulding = this.currentPart?.commodityId === CommodityType.PlasticAndRubber;
      this.commodity.isSheetMetal = this.currentPart?.commodityId === CommodityType.SheetMetal;
      this.commodity.isCasting = this.currentPart?.commodityId === CommodityType.Casting;
      this.toolNamesList = this._toolConfig.getToolNames(this.currentPart?.commodityId);
      this.getProcessTypes();
    }
  }

  getProcessInfos(result: ProcessInfoDto[]) {
    // this._processInfo$.pipe(takeUntil(this.unsubscribe$)).subscribe((result: ProcessInfoDto[]) => {
    if (result?.length > 0 && this.currentPart?.partInfoId == result[0]?.partInfoId) {
      this.machineInfoList = [...result];
      this.sortMachineInfoList();
      if (this.isNewProcessinfo && this.machineInfoList.length > 0) {
        this.selectedProcessInfoId = this.machineInfoList[this.machineInfoList.length - 1].processInfoId;
        this.formIdentifier = { ...this.formIdentifier, primaryId: this.selectedProcessInfoId };
        this.updateSaveProcessLoad(this.selectedProcessInfoId);
        this.isNewProcessinfo = false;
      }
      this.manufactureDataEmit.emit(this.machineInfoList);
      this.loadLatestProcessInfo(this.selectedProcessInfoId === 0 ? this.machineInfoList[0].processInfoId : this.selectedProcessInfoId, true);
      // const materialProcessId = this.materialInfoList?.length > 0 ? this.materialInfoList[0]?.processId : 0;
    } else {
      this.machineInfoList = [];
      this.reset();
      this.calculateSamplingRate();
      if (this.currentPart?.mfrCountryId) {
        this.getLaborRateBasedOnCountry(this.currentPart?.mfrCountryId, this.currentPart?.supplierRegionId);
        this.getLaborCountBasedOnCountry(this.currentPart?.mfrCountryId);
      }
    }
    // });
    // this.listProcessInfoDtoOut.emit(this.machineInfoList);
  }

  getMaterialInfos(result: MaterialInfoDto[]) {
    if ([CommodityType.WiringHarness].includes(this.currentPart?.commodityId)) {
      this.getProcessTypes(); //no material section so directly setting process group by commodity.
    } else {
      // this._materialInfo$.pipe(takeUntil(this.unsubscribe$)).subscribe((result: MaterialInfoDto[]) => {
      if (result?.length && this.currentPart?.partInfoId && this.currentPart.partInfoId == result[0]?.partInfoId) {
        this.materialInfoList = result;
        this._manufacturingConfig.setPrimaryProcessFlag(this.processFlag, this.materialInfoList[0]?.processId);
        this.coreCycleTimeArray.clear();
        const coreCycleArray = this.materialInfoList.filter((x) => x?.coreCostDetails?.length > 0);
        if (coreCycleArray?.length > 0) {
          Array.from({ length: coreCycleArray[0].coreCostDetails?.length }).forEach((_) => {
            this.coreCycleTimeArray.push(this._fb.control(0));
          });
        }
        this.getFromMaterial();
        this.getProcessTypes();
      }
      // });
    }
  }

  private getProcessTypes() {
    const commodityProcessMap = {
      [CommodityType.WiringHarness]: PrimaryProcessType.WiringHarness.toString(),
      [CommodityType.Electronics]: PrimaryProcessType.Electronics.toString(),
    };
    let processIds =
      commodityProcessMap[this.currentPart?.commodityId] ??
      this.materialInfoList
        ?.filter((x) => x.processId != null)
        .map((x) => x.processId)
        .join(',');
    if (processIds) {
      this.medbMasterService.getProcessTypeList(processIds).subscribe((result) => {
        if (result) {
          this.processTypeOrginalList = result;
          const groupToValues = this.processTypeOrginalList.reduce(function (obj, item) {
            obj[item.groupName] = obj[item.groupName] || [];
            obj[item.groupName].push(item);
            return obj;
          }, {});
          this.processTypesList = this._manufacturingHelperService.processTypesListSort(groupToValues);
          if (this.currentPart?.commodityId === CommodityType.WiringHarness) {
            this.processTypesList.sort((a, b) => this._harnessConfig.processGroupSortOrder.indexOf(a.group) - this._harnessConfig.processGroupSortOrder.indexOf(b.group));
            this.processTypesList = this.processTypesList.map((item) => {
              if (item.group === 'Testing & Inspection') {
                item.data = item.data.sort((a, b) => this._harnessConfig.testingSortOrder.indexOf(a.primaryProcess) - this._harnessConfig.testingSortOrder.indexOf(b.primaryProcess));
              }
              return item;
            });
          }
          this.loadLatestProcessInfo(this.selectedProcessInfoId, true);
        }
      });
    }
  }

  clearOnPartChange() {
    this.currentPart = new PartInfoDto();
    this.machineInfoList = [];
    this.materialInfoList = [];
    this.manufacturingObj = new ProcessInfoDto();
    this.laborRateInfo = [];
    this.selectedProcessInfoId = 0;
    this.samplingData = new SamplingRate();
    this.fieldColorsList = [];
    this.materialmasterDatas = new MaterialMasterDto();
    this.defaultValues = this._manufacturingConfig.defaultValues;
    this.meddbMachineMasterLoadingProgress = false;
  }

  onManufacturingFormValueChange(event?: Event) {
    if (event && (event.target as HTMLInputElement)?.type === 'radio') {
      return; // ignoring radio button selection changes
    }
    this.afterChange = true;
    this.dirtyCheckEvent.emit(this.afterChange);
  }

  private getFromMaterial() {
    this.materialInfo = this._manufacturingHelperService.getMaterialObjectTotals(this.materialInfoList);
    this.getMaterialStrength();
  }

  private getMaterialStrength() {
    const materialMarketId = this.materialInfoList?.length && this.materialInfoList[0]?.materialMarketId;
    if (materialMarketId && materialMarketId > 0 && !this.materialInfosLoadingProgress) {
      this.materialInfosLoadingProgress = true;
      // let materialid = this.materialInfoList?.length && this.materialInfoList[0]?.materialDescription;
      this.materialMasterService
        .getMaterialMasterByMaterialMarketDataId(materialMarketId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((response) => {
          this.materialInfosLoadingProgress = false;
          if (response) {
            const meterialmasterData = response?.materialMarketData?.materialMaster;
            if (meterialmasterData) {
              this.materialmasterDatas = meterialmasterData;
              this.materialType = meterialmasterData?.materialTypeId;
              this.costingManufacturingInfoform.patchValue(
                this._manufacturingMapper.getMaterialStrengthPatchValues(meterialmasterData, this.materialInfoList)
                // co2GasCost: meterialmasterData?.co2GasCost || 0.0006,)
                // meltTemp: meterialmasterData?.meltingTemp || 0,
                // ejecTemp: meterialmasterData?.ejectDeflectionTemp || 0,
                // mouldTemp: meterialmasterData?.moldTemp || 0,
                // maxWallThickess: this.sharedService.isValidNumber(this.materialInfoList?.length && this.materialInfoList[0]?.wallThickessMm),
                // co2GasCost: meterialmasterData?.co2GasCost || 0.0006,
                // argonGasCost: meterialmasterData?.argonGasCost || 0.0010,
              );
            } else {
              this.materialmasterDatas = new MaterialMasterDto();
            }
          }
        });
    }
    this.mapAllMaterialMaster();
  }

  private mapAllMaterialMaster() {
    if (this.materialInfoList?.length) {
      const updatedList = [...this.materialInfoList]; // clone the array

      for (let i = 0; i < updatedList.length; i++) {
        const materialMarketId = updatedList[i]?.materialMarketId;

        if (materialMarketId && materialMarketId > 0) {
          this.materialMasterService
            .getMaterialMasterByMaterialMarketDataId(materialMarketId)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((response) => {
              if (response) {
                const meterialmasterData = response?.materialMarketData?.materialMaster;
                if (meterialmasterData) {
                  updatedList[i] = {
                    ...updatedList[i],
                    materialMasterData: meterialmasterData,
                  };

                  // Replace the whole array after update
                  this.materialInfoList = [...updatedList];
                }
              }
            });
        }
      }
    }
  }

  public addMachineInfo() {
    this.costingManufacturingInfoform.reset();
    this.reset();
    this.clearProcessTypeFlags();
    this.selectedProcessInfoId = 0;
    this.formIdentifier = { ...this.formIdentifier, primaryId: this.selectedProcessInfoId };
    this.fieldColorsList = [];
    if (this.subProcessFormArray.length > 0) {
      this.subProcessFormArray.clear();
    }
    this.getFormArray(FormGroupKeys.Assembly)?.clear();
    if (this.machiningOperationTypeFormArray.length > 0) {
      this.machiningOperationTypeFormArray.clear();
    }
    if (this.getFormArray(FormGroupKeys.ForgingSubProcess).length > 0) {
      this.getFormArray(FormGroupKeys.ForgingSubProcess).clear();
    }
    this.setLaborRateBasedOnCountry();
    if (!this.processFlag.IsProcessTypeTesting) {
      this.calculateSamplingRate();
    }
    this.costingManufacturingInfoform.controls['sortOrder'].setValue(this.machineInfoList.length);
    this.onFormSubmit(true);
  }

  clearProcessTypeFlags() {
    this.processFlag = { ...this.processFlag, ...this._manufacturingConfig.clearProcessTypeFlags(this.processFlag) };
    const { forging, forgingCutting } = this._manufacturingConfig._manufacturingForgingSubProcessConfigService.clearForgingFlags();
    this.forging = { ...this.forging, ...forging };
    this.forgingCutting = forgingCutting;
    this.fieldColorsList = [];
  }

  private reset() {
    if (this.costingManufacturingInfoform) {
      this.costingManufacturingInfoform.reset();
      this.costingManufacturingInfoform.patchValue(this._manufacturingMapper.manufacturingFormReset(this.conversionValue, this.isEnableUnitConversion));
      // this.isCT2detailsDisplay = false;
      // this.isCT1detailsDisplay = false;
    }
    this.selectedMachineDescription = '';
    this.selectedWeldingCapacity = 0;
  }

  private loadLatestProcessInfo(selectedId: number, loader = false) {
    if (this.processTypesList?.length > 0) {
      if (this.machineInfoList != null && this.machineInfoList.length > 0) {
        if (selectedId && selectedId > 0) {
          const machinelist = this.machineInfoList.find((x) => x.processInfoId == selectedId);
          if (machinelist) {
            this.onEditClick(machinelist, loader);
          } else {
            this.selectedProcessInfoId = 0;
            this.onEditClick(this.machineInfoList[0], loader);
            this.formIdentifier = { ...this.formIdentifier, primaryId: this.selectedProcessInfoId };
          }
        } else {
          this.selectedProcessInfoId = this.machineInfoList[0]?.processInfoId || 0;
          this.onEditClick(this.machineInfoList[0], loader);
        }
      }
    }
  }

  public onProcessTypeChange(e: any) {
    const processTypeId = Number(e.currentTarget.value);
    const primaryProcessId = Number(this.materialInfoList[0]?.processId);
    if (processTypeId) {
      // this.costingManufacturingInfoform.controls['machineId'].setValue('');
      // this.costingManufacturingInfoform.controls['subProcessTypeID'].setValue('');
      this.selectedMachineDescription = '';
      this.selectedWeldingCapacity = 0;
      // this.costingManufacturingInfoform.controls['selectedTonnage'].setValue(0);
      this.costingManufacturingInfoform.patchValue({ machineId: '', subProcessTypeID: '', selectedTonnage: 0 });
      this.machineMaster = undefined;
      let corePrepSubProcessIds: number[] = [];
      if (this.processFlag.IsCasting && processTypeId === ProcessType.CastingCorePreparation) {
        corePrepSubProcessIds = this.machineInfoList?.filter((x) => x.processTypeID === ProcessType.CastingCorePreparation).map((x) => x.subProcessTypeID) || [];
      }
      this._manufacturingHelperService.setSubProcessList(processTypeId, primaryProcessId, this.materialInfoList, corePrepSubProcessIds).subscribe((subProcessList) => {
        this.subProcessNamesList = subProcessList;
      });
      this.processFlag.IsCasting && this.costingManufacturingInfoform.patchValue(this._manufacturingConfig.resetValues);
      // (this.processFlag.IsGreenCasting && processTypeId == ProcessType.MoldPerparation) && this.setMoldPreparationData();
      if (this.processFlag.IsGreenCasting && processTypeId === ProcessType.MoldPerparation) {
        this._manufacturingMapper._castingMapper.setMoldPreparationData(this.materialInfoList, this.costingManufacturingInfoform.get(FormGroupKeys.Casting));
        // this.getFormGroup(FormGroupKeys.Casting).patchValue({
        //   tableSizeRequired: `${moldData.moldBoxLength} x ${moldData.moldBoxWidth}`,
        // });
        // } else if ([ProcessType.TurningCenter, ProcessType.MillingCenter].includes(processTypeId) && this.materialInfoList?.length > 0) {
        //   this.costingManufacturingInfoform.controls['tableSizeRequired'].setValue(
        //     this.sharedService.isValidNumber(this.materialInfoList[0]?.stockDiameter) + ', ' + this.sharedService.isValidNumber(this.materialInfoList[0]?.stockLength)
        //   );
      }
    }
    this.defaultValues.machineHourRate = 0;
    this.defaultValues.machineEfficiency = 0;
    this.getMachines(processTypeId, false);
    this.mapOnProcessTypeChange(processTypeId);
    if (this.processFlag.IsForging && this.forging.cutting) {
      this.costingManufacturingInfoform.controls['noOfParts'].setValue(1);
      // const stockForm = this.materialInfoList[0]?.stockForm === 'Rectangular Bar' ? 1 : 2;
      // this.costingManufacturingInfoform.controls['noOfBends'].setValue(stockForm); // Cross Section 1
      const processType = this.materialInfoList[0]?.stockOuterDiameter > 30 ? 1 : 2;
      this.costingManufacturingInfoform.controls['subProcessTypeID'].setValue(processType);
      this.setTypeForForging(processType);
    }

    if (this.forging.coldForgingClosedDieCold) {
      this.getFormArray(FormGroupKeys.ForgingSubProcess)?.clear();
      this.subProcessFormArray?.clear();
    }
    if (this.forging.hotForgingClosedDieHot || this.forging.trimmingPress || this.forging.piercing) {
      this.costingManufacturingInfoform.controls['noOfBends'].setValue(2); //Lateral
      this.costingManufacturingInfoform.controls['hlFactor'].setValue(1.2);
    }
    if (this.forging.billetHeatingContinuousFurnace) {
      this.costingManufacturingInfoform.controls['subProcessTypeID'].setValue(1); //Continuous Induction Furnace
      this.costingManufacturingInfoform.controls['semiAutoOrAuto'].setValue(2); //Semi-Automatic
      this.costingManufacturingInfoform.controls['initialTemp'].setValue(20);
    }
    if (this.processFlag.IsProcessTypeStamping || this.processFlag.IsConventionalPCB) {
      this.subProcessFormArray?.clear();
      this.subProcessFormArray.push(this._manufacturingConfig.manufactureFormGroup(this.selectedProcessInfoId, this.conversionValue, this.isEnableUnitConversion));
    }
    if (this.processFlag.IsProcessWiringHarness) {
      this.subProcessFormArray?.clear();
      this.subProcessFormArray.push(this._manufacturingConfig.manufactureFormGroup(this.selectedProcessInfoId, this.conversionValue, this.isEnableUnitConversion));
    }
  }

  // private setMoldPreparationData() {
  //   const matMold = this.materialInfoList.filter((rec) => rec.secondaryProcessId === 3)[0] || null;
  //   const moldBoxLength = matMold?.moldBoxLength || 0;
  //   const moldBoxWidth = matMold?.moldBoxWidth || 0;
  //   const moldBoxSize = moldBoxLength * moldBoxWidth;
  //   this.getFormGroup(FormGroupKeys.Casting).patchValue({
  //     tableSizeRequired: `${moldBoxLength} x ${moldBoxWidth}`,
  //   });
  //   return { moldBoxLength, moldBoxWidth, moldBoxSize };
  // }

  private mapOnProcessTypeChange(processTypeId: number): void {
    this.setProcessTypeFlags(processTypeId);
    if (this.processFlag.IsProcessTypeTesting && !this.processFlag.IsCasting) {
      this.costingManufacturingInfoform?.controls['samplingRate']?.setValue(0);
      this.defaultValues.samplingRate = 0;
    }
    if (this.manufacturingObj.processTypeID != processTypeId) {
      // this.resetDataExtracted();
      this.manufacturingExtractDataService.resetDataExtracted(this.costingManufacturingInfoform);
    }
    this.calculateCost();
  }

  private mapOnProcessTypeChangeEditCall(processTypeId: number): void {
    this.setProcessTypeFlags(processTypeId);
    if (this.processFlag.IsProcessTypeTesting && !this.processFlag.IsCasting) {
      this.costingManufacturingInfoform?.controls['samplingRate']?.setValue(0);
      this.defaultValues.samplingRate = 0;
    }
  }

  private sortMachineInfoList() {
    const processMapping = this._manufacturingConfig.processMappingForSort;
    for (const process in processMapping) {
      if (this.processFlag[process]) {
        this.machineInfoList = [...this.sharedService.sortObjectbyInteger(this.machineInfoList, 'processTypeID', processMapping[process])];
        this.processTypeOrginalList = this.sharedService.sortObjectbyInteger(this.processTypeOrginalList, 'processTypeId', processMapping[process]);
        break;
      }
    }
    if (this.processFlag.IsCasting && !this.processFlag.IsInvestmentCasting && !this.processFlag.IsHPDCCasting && !this.processFlag.IsShellCasting) {
      this._manufacturingConfig._castingConfig.sortCastingCoreProcesses(this.machineInfoList);
    }
    if (this.selectedProcessInfoId === 0 && this.machineInfoList.length > 0) {
      this.selectedProcessInfoId = this.machineInfoList[0].processInfoId;
    }
  }

  private setProcessTypeFlags(processTypeId: number) {
    processTypeId = Number(processTypeId);
    const materialProcessId = this.materialInfoList?.length > 0 ? this.materialInfoList[0]?.processId : 0;
    this.processFlag = { ...this._manufacturingConfig.setProcessTypeFlags(this.processFlag, processTypeId, this.currentPart?.commodityId, materialProcessId) };
    this.sortMachineInfoList();
    if (this.processFlag.IsProcessTypeWelding && this.weldingPositionList?.length === 0) {
      this.weldingPositionList = this._costingConfig.weldingPositionList(this.processFlag.IsProcessStickWelding ? 'stickWelding' : 'welding');
    }
    if (this.processFlag.IsProcessMachining) {
      this.setOperationType(processTypeId);
    } else {
      this.MachiningFlags = this._manufacturingConfig._machining.getMachiningFlags();
    }
    this.forging = { ...this.forging, ...this._manufacturingConfig._manufacturingForgingSubProcessConfigService.setForgingFlags(processTypeId, this.currentPart.commodityId, materialProcessId) };
    this.forging.isMaterialStockFormRectangleBar = this.materialInfoList?.length > 0 && this.materialInfoList[0]?.stockForm === 'Rectangular bar';
    this.processFlag.IsProcessShotBlasting = !this.processFlag.IsCasting && processTypeId === ProcessType.ShotBlasting && !this.forging.shotBlasting && !this.forging.shotBlastingforOpenDie;
    // this.forging.trimmingPress = processTypeId == ProcessType.TrimmingPress ? true : false;// not available in current process matrix
    if (this.processFlag.IsProcessShotBlasting) {
      this.costingManufacturingInfoform.controls['utilisation'].setValue(18);
    } else if (this.processFlag.IsProcessCorePreparation) {
      this.costingManufacturingInfoform.controls['dryCycleTime'].setValue(35);
    } else if (this.processFlag.IsCustomCableDrawing) {
      // this.costingManufacturingInfoform.controls['dryCycleTime'].setValue(4);
      // this.costingManufacturingInfoform.controls['partEjection'].setValue(13);
      this.costingManufacturingInfoform.patchValue({ dryCycleTime: 4, partEjection: 13 });
    } else if (this.processFlag.IsProcessWiringHarness && this.subProcessFormArray?.length === 0) {
      // if (this.subProcessFormArray?.length === 0) {
      this.subProcessFormArray.push(this._manufacturingConfig.manufactureFormGroup(this.selectedProcessInfoId, this.conversionValue, this.isEnableUnitConversion));
      // }
    }
    this.electonicsSubject.next();
    this.forgingSubject.next();
  }

  // public viewCTDetails() {
  //   // this.isCT1detailsDisplay = !this.isCT1detailsDisplay;
  //   this.isCT2detailsDisplay = !this.isCT2detailsDisplay;
  // }

  public async openCadViewer() {
    let featureEntries: any[] = JSON.parse(this.costingManufacturingInfoform.controls['featureDetails']?.value || '[]');
    const existingIds = (this.machiningOperationTypeFormArray?.controls as FormGroup[]).map((x) => x.value.featureId); // get the ids from the form array
    // featureEntries = featureEntries.filter(x => existingIds.includes(x.id)); // filter out the existing ids only
    featureEntries = featureEntries.map((x) => (existingIds.includes(x.id) ? { ...x, existing: true } : { ...x, existing: false })); // filter out the existing ids only
    // const considerableOperationIds = this._manufacturingConfig._machining.getOperationTypes(this.f.processTypeID.value).filter((x) => !x.name.includes('Finishing')).map((y) => y.id);
    // for (let i = 0; i < this.machiningOperationTypeFormArray?.controls?.length; i++) {
    // const val = (this.machiningOperationTypeFormArray?.controls as FormGroup[])[i].value;
    //   const featureName = this._manufacturingConfig._machining.getMachiningFeatureList(Number(this.f.processTypeID.value)).find((x) =>
    //     x.operationTypes.map(x => Number(x)).includes(Number(val.operationTypeId)))?.featureName; // get the feature already imported
    //   considerableOperationIds.includes(val.operationTypeId) && featureNames.push(featureName + '-' + val.subProcessTypeId);
    // }
    const modalRef = this.modalService.open(CadViewerPopupComponent, {
      windowClass: 'fullscreen',
      // beforeDismiss: () => {
      //   console.log('beforeDismiss');
      //   return true; // use false to keep showing the modal
      // }
    });
    modalRef.componentInstance.fileName = `${this.currentPart?.azureFileSharedId}`;
    modalRef.componentInstance.partData = {
      caller: 'manufacturing',
      partId: this.formIdentifier.partInfoId,
      volume: this.sharedService.extractedMaterialData?.DimVolume,
      surfaceArea: this.sharedService.extractedMaterialData?.DimArea,
      projectedArea: this.sharedService.extractedMaterialData?.ProjectedArea,
      dimentions: { dimX: this.sharedService.extractedMaterialData?.DimX, dimY: this.sharedService.extractedMaterialData?.DimY, dimZ: this.sharedService.extractedMaterialData?.DimZ },
      centerMass: {
        centroidX: this.sharedService.extractedProcessData?.CentroidX,
        centroidY: this.sharedService.extractedProcessData?.CentroidY,
        centroidZ: this.sharedService.extractedProcessData?.CentroidZ,
      },
      filledVolume: this.sharedService.extractedMaterialData?.ForgedFilledVolume,
      filledSurfaceArea: this.sharedService.extractedMaterialData?.ForgedFilledSurfaceArea,
      featureEntries,
      commodityId: this.currentPart.commodityId,
      datumCentroid: this.sharedService.datumCentroid,
    };

    const result = await modalRef.result;
    if (result?.reopen) {
      this.sharedService.datumCentroid = result.selectedCentroid || this.sharedService.datumCentroid;
      this.blockUiService.pushBlockUI('Cad Viewer');
      this.messaging.openSnackBar(`The Datum has been changed`, '', { duration: 3000 });
      setTimeout(() => {
        this.openCadViewer();
        this.blockUiService.popBlockUI('Cad Viewer');
      }, 1000);
    } else if (result?.featureData && result?.featureData.length > 0) {
      console.log('Features selected from CAD Viewer:', result?.featureData);
      this.autoPullFeatures(result?.featureData);
    }
  }

  autoPullFeaturesAutomation(featureData, materialInfo, laborRate, processInfo, automationParams) {
    const { operationEntries, featureEntries } = this._simulationService._manufacturingMachiningCalcService.autoPullFeaturesProcessing(
      featureData,
      this.part?.documentCollectionDto?.documentRecords,
      Number(processInfo.processTypeID),
      []
    );
    processInfo.featureDetails = JSON.stringify(featureEntries);
    // processInfo.subProcessTypeInfos = [];
    if (operationEntries.length > 0) {
      const addAutomatedOperation = (operationType, fd = null) => {
        this.addMachiningOperation();
        const index = this.machiningOperationTypeFormArray.length - 1;
        const operationRow = (this.machiningOperationTypeFormArray?.controls as FormGroup[])[index];
        operationRow.patchValue({ featureId: fd?.id });
        this.showAddProcessButton(ProcessType.TurningCenter, Number(operationType), index, false);
      };
      for (const operationEntry of operationEntries) {
        addAutomatedOperation(operationEntry.operationType, operationEntry.fd);
        // processInfo.subProcessTypeInfos.push(...);
      }
    }
    this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, processInfo, automationParams);
  }

  autoPullFeatures(featureData) {
    this.costLoaders = true;
    console.log(this.part?.documentCollectionDto);
    let featureEntries: any[] = JSON.parse(this.costingManufacturingInfoform.controls['featureDetails']?.value || '[]');
    this._simulationService._manufacturingMachiningCalcService
      .autoPullFeaturesProcessing(featureData, this.part?.documentCollectionDto?.documentRecords, Number(this.f.processTypeID.value), featureEntries)
      .pipe(delay(0), take(1))
      .subscribe(({ operationEntries, featureEntries }) => {
        this.costingManufacturingInfoform.controls['featureDetails'].setValue(JSON.stringify(featureEntries));
        if (operationEntries.length > 0) {
          const addAutomatedOperation = (operationType, fd = null) => {
            this.addMachiningOperation();
            const index = this.machiningOperationTypeFormArray.length - 1;
            const operationRow = (this.machiningOperationTypeFormArray?.controls as FormGroup[])[index];
            operationRow.patchValue({ featureId: fd?.id });
            this.showAddProcessButton(Number(this.costingManufacturingInfoform.controls['processTypeID'].value), Number(operationType), index, false);
          };
          if (featureData === 'all' || (this.machiningOperationTypeFormArray.length === 1 && Number(this.machiningOperationTypeFormArray?.controls[0].value.operationTypeId) === 0)) {
            this.machiningOperationTypeFormArray.clear(); // clear out the default entry if required
          }
          if (this.machiningOperationTypeFormArray.length <= 0) {
            // first time run
            this.machineTypeDescription()
              .find((x) => x.machineID === Number(this.costingManufacturingInfoform.controls['machineId'].value))
              ?.machineName.includes('Feeder') && addAutomatedOperation(TurningTypes.Parting);
          }
          for (const operationEntry of operationEntries) {
            addAutomatedOperation(operationEntry.operationType, operationEntry.fd);
          }
          this.calculateCost('automation');
          this.onManufacturingFormValueChange();
          this.calculateCost();
        }
        this.costLoaders = false;
      });
  }

  onDeleteClick(processInfoId: number) {
    const dialogRef = this.messaging.openConfirmationDialog(<ConfirmationDialogConfig>{
      data: {
        title: 'Confirm Delete',
        message:
          processInfoId === 0
            ? 'All items will be deleted. Confirm delete by selecting CONFIRM, or cancel this action by selecting CANCEL.'
            : 'This item will be deleted. Confirm delete by selecting CONFIRM, or cancel this action by selecting CANCEL.',
        action: 'CONFIRM',
        cancelText: 'CANCEL',
      },
    });
    this.dialogSub = dialogRef
      .afterClosed()
      .pipe(first())
      .subscribe((confirmed: boolean) => {
        if (!!processInfoId && confirmed) {
          // this._store.dispatch(new ProcessInfoActions.DeleteProcessInfo(processInfoId, this.currentPart?.partInfoId));
          this.processInfoSignalService.deleteProcessInfo(processInfoId, this.currentPart?.partInfoId);
          this.machineInfoList = [...this.machineInfoList.filter((x) => x.processInfoId != processInfoId)];
          this.commonDeleteProcessInfo();
        } else if (processInfoId === 0 && this.machineInfoList && confirmed) {
          // delete all
          // this._store.dispatch(new ProcessInfoActions.DeleteAllProcessInfo(this.machineInfoList, this.currentPart?.partInfoId));
          this.processInfoSignalService.deleteAllProcessInfo(this.currentPart?.partInfoId);
          this.machineInfoList = [];
          this.defaultValues = this._manufacturingConfig.defaultValues;
          this.commonDeleteProcessInfo();
        }
      });
  }

  commonDeleteProcessInfo() {
    this.messaging.openSnackBar(`Data has been Deleted.`, '', { duration: 5000 });
    this.reset();
    this.clearProcessTypeFlags();
    if (this.subProcessFormArray.length > 0) {
      this.subProcessFormArray.clear();
    }
    if (this.machiningOperationTypeFormArray.length > 0) {
      this.machiningOperationTypeFormArray.clear();
    }
    this.calculateSamplingRate();
    this.setLaborRateBasedOnCountry();
    let selectedId = 0;
    if (this.machineInfoList != null && this.machineInfoList.length > 0) {
      selectedId = this.machineInfoList[this.machineInfoList.length - 1].processInfoId;
    } else {
      // selectedId = 0;
      this.selectedProcessInfoId = 0;
      this.formIdentifier = { ...this.formIdentifier, primaryId: this.selectedProcessInfoId };
    }
    this.manufacturingObj = new ProcessInfoDto();
    this.listProcessInfoDtoOut.emit(this.machineInfoList);
    this.manufactureDataEmit.emit(this.machineInfoList);
    this.manufactureDataDeleteEmit.emit(true);
    this.loadLatestProcessInfo(selectedId, false);
  }

  onCrossSectionChange(_event: any) {
    // if (this.currentPart.commodityId === CommodityType.MetalForming) {
    //   if (this.machineInfoList != null && this.machineInfoList.length > 0) {
    //     let crossSection = this.costingManufacturingInfoform.controls['noOfBends'].value;
    //   }
    // }
    this.calculateCost();
  }

  onSubProcessChange(event: any) {
    this.selectedTypeOfOperationId = event.currentTarget.value;
    this.lblChambertext = this.selectedTypeOfOperationId === 2 ? 'Passage length' : 'Chamber length';
    this.isConveyourTypeOfOperation = event.currentTarget.value === '2' ? true : false;
  }

  public calculateMachineType(_event: any = null) {
    const machineType = Number(this.costingManufacturingInfoform.controls['semiAutoOrAuto'].value);
    const processType = this.costingManufacturingInfoform.controls['processTypeID'].value;
    let bourdanRate = 0;
    if (this.currentPart.commodityId === CommodityType.MetalForming) {
      bourdanRate = this._costingConfig.machineTypeManufacturingData().find((x) => x.id == machineType)?.BourdanRate || 0;
      this.costingManufacturingInfoform.controls['bourdanRate'].setValue(bourdanRate);
    } else if ([ProcessType.InjectionMouldingSingleShot, ProcessType.InjectionMouldingDoubleShot, ProcessType.RubberInjectionMolding, ProcessType.PlugConnectorOvermolding].includes(processType)) {
      this.costingManufacturingInfoform.controls['noOfLowSkilledLabours'].setValue(this.onMcAutomationChange());
      // for welding this is done in calculateCost() function
    }
    this.calculateCost();
  }

  onMcAutomationChange(): number {
    const machineType = Number(this.costingManufacturingInfoform.controls['semiAutoOrAuto'].value);
    return this.laborCountByMachineType?.find((x) => x.machineTypeId === machineType)?.lowSkilledLaborRate;
  }

  public onMachineDescChange(event: any) {
    this.machineDescChange(event.currentTarget.value);
  }

  public machineDescChange(machineDescId: number, isEdit = false) {
    const processTypeId = Number(this.costingManufacturingInfoform.controls['processTypeID'].value);
    const subProcessTypeId = Number(this.subProcessFormArray.value[0]?.subProcessTypeID);
    const primaryProcessId = this.processFlag.IsProcessWiringHarness ? subProcessTypeId : processTypeId;
    if (machineDescId && this.currentPart.mfrCountryId && primaryProcessId > 0) {
      this.digitalFactoryService
        .getMachineMaster({
          machineId: machineDescId,
          processTypeId: primaryProcessId,
          supplierId: this.currentPart.supplierInfoId,
          countryData: this.countryList.find((c) => c.countryId === this.currentPart.mfrCountryId),
          laborRate: this.laborRateInfo[0],
          regionId: this.currentPart.supplierRegionId,
          marketMonth: this.currentMarketMonth ?? this.selectedProject?.marketMonth ?? this.sharedService.getMarketMonth(this.selectedProject.marketQuarter),
        })
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: (result: MedbMachinesMasterDto) => {
            this.processMachineMasterData(result, isEdit);
            this.costingManufacturingInfoform.controls['machineHourRate'].setValue(this.sharedService.isValidNumber(result.machineHourRate));
            this.machineDetails = new MachineDetails();
            this.machineDetails.depreciationCost = Math.round(result?.depreciationCost || 0);
            this.machineDetails.inputedInterestCost = Math.round(result?.inputedInterestCost || 0);
            this.machineDetails.powerCost = Math.round(result?.powerCost || 0);
            this.machineDetails.rentCost = Math.round(result?.rentCost || 0);
            this.machineDetails.maintenanceCost = Math.round(result?.maintenanceCost || 0);
            this.machineDetails.suppliesCost = Math.round(result?.suppliesCost || 0);
            this.machineDetails.burdenedCost = Math.round(result?.burdenedCost || 0);
            this.selectedMachineDescription = result?.machineDescription;
            this.defaultValues.machineHourRate = this.sharedService.isValidNumber(result.machineHourRate);
            this.selectedMachineDescription = result?.machineDescription || '';
            this.setLaborRateBasedOnCountry(this.part?.mfrCountryId, this.part?.supplierRegionId, machineDescId);
          },
          error: (error) => {
            console.error(error);
          },
        });
    } else {
      this.costingManufacturingInfoform.patchValue({ machineHourRate: 0, selectedTonnage: 0 });
      // this.costingManufacturingInfoform.controls['machineHourRate'].setValue(0);
      // this.costingManufacturingInfoform.controls['selectedTonnage'].setValue(0);
      this.selectedMachineDescription = '';
      this.selectedWeldingCapacity = 0;
    }
  }

  private processMachineMasterData(result: MedbMachinesMasterDto, isEdit: boolean) {
    if (result) {
      this.machineMaster = result;
      this.defaultValues.dryCycleTime = result?.machineDryCycleTimeInSec;
      if (!isEdit) {
        this._manufacturingHelperService.machineDescChangeOnNotEdit(
          result,
          this.processFlag,
          this.currentPart?.eav,
          this.costingManufacturingInfoform,
          this.MachiningFlags,
          this.conversionValue,
          this.isEnableUnitConversion
        );
        this.defaultValues.machineEfficiency = Number(result?.machineMarketDtos.length > 0 ? result?.machineMarketDtos[0].efficiency : 0);
        this.defaultValues.dryCycleTime = Number(result?.machineDryCycleTimeInSec);
        // this.defaultValues.machineHourRate = this.machineMaster.machineHourRate;
        // if (result.machineMarketDtos?.length > 0 && result?.machineMarketDtos[0].machineType) {
        //   if (this.forgingCutting.bandSawCutting || this.forgingCutting.stockShearing) {
        //     // forging cutting saw
        //     this.costingManufacturingInfoform.controls['semiAutoOrAuto'].setValue(2); // Semi-Automatic
        //   } else {
        //     this.costingManufacturingInfoform.controls['semiAutoOrAuto'].setValue(this._manufacturingConfig.setMachineTypeIdByName(result?.machineMarketDtos[0].machineType));
        //   }
        // }
        this._manufacturingHelperService.setSemiAutoOrAutoValue(result, this.forgingCutting, this.costingManufacturingInfoform);
      }
    }
  }

  private getMachines(processTypeId: number | undefined, isEditCall: boolean = false, processInfo = null, subprocessTypeId: number = 0) {
    if (!(processTypeId && this.currentPart.mfrCountryId && !this.meddbMachineMasterLoadingProgress && this.laborRateInfo)) {
      this.costLoaders = false;
      return;
    }
    this.meddbMachineMasterLoadingProgress = true;
    const primaryID = this._harnessConfig.harnessTypes.includes(processTypeId) ? subprocessTypeId : processTypeId;
    this.digitalFactoryService
      .getMachineMasterByProcessTypeId({
        supplierId: this.currentPart.supplierInfoId,
        processTypeId: primaryID,
        countryData: this.countryList.find((c) => c.countryId === this.currentPart.mfrCountryId),
        laborRate: this.laborRateInfo[0],
        regionId: this.currentPart.supplierRegionId,
        marketMonth: this.currentMarketMonth ?? this.selectedProject?.marketMonth ?? this.sharedService.getMarketMonth(this.selectedProject.marketQuarter),
      })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (result: MedbMachinesMasterDto[]) => {
          if (isEditCall) {
            processInfo = { ...processInfo, processTypeID: processTypeId };
            this.mapOnProcessTypeChangeEditCall(processTypeId);
            processInfo = this.setEditCallMethod(processInfo);
            this.costingManufacturingInfoform.controls['furnaceCapacityTon'].setValue(this.machineMaster?.furnaceCapacityTon || 0);
          }
          if (result && result.length > 0) {
            this.fullMachineTypeDescription = result;
            this.filterAndSortMachineMasters(result, isEditCall, processTypeId, subprocessTypeId);
            this.handleMachineSelection(isEditCall, processInfo);
          } else {
            this.machineTypeDescription.set([]);
            this.defaultValues.machineHourRate = 0;
            this.defaultValues.machineEfficiency = 0;
          }
          this.costLoaders = false;
          this.meddbMachineMasterLoadingProgress = false;
        },
        error: (error) => {
          console.error(error);
          this.costLoaders = false;
          this.meddbMachineMasterLoadingProgress = false;
        },
      });
    // } else {
    //   this.costLoaders = false;
    // }
  }
  private handleMachineSelection(isEditCall: boolean, processInfo: any): void {
    if (this.IsCountryChanged && isEditCall) {
      this.setNewSelectedMachineDescription();
      return;
    }
    if (isEditCall && processInfo?.machineMarketId) {
      // const machine = this.machineTypeDescription()?.find((x) => x?.machineMarketDtos?.find((y) => y?.machineMarketID === Number(processInfo?.machineMarketId))) || this.machineTypeDescription()[0];
      const foundMachine = this.machineTypeDescription()?.find((x) => x?.machineMarketDtos?.some((y) => y?.machineMarketID === Number(processInfo?.machineMarketId)));
      const machine = processInfo?.machineMarketId ? foundMachine || this.machineTypeDescription()?.[0] : foundMachine;
      this.setSelectedMachineDescription(machine);
      if (machine && machine?.machineMarketDtos?.length > 0) {
        const machineMarket = machine?.machineMarketDtos?.[0];
        if (machineMarket) {
          this.machineDetails = new MachineDetails();
          this.machineDetails.machineName = machine?.machineName || '';
          this.machineDetails.investCost = machineMarket?.mcInvestment || 0;
          this.machineDetails.installation = machineMarket?.installationFactor || 0;
          this.machineDetails.age = machineMarket?.depreciatioNInYears || 0;
          this.machineDetails.amc = machineMarket?.maintanenceCost || 0;
          this.machineDetails.asc = machineMarket?.suppliesCost || 0;
          this.machineDetails.noOfLowSkilledLabours = machineMarket?.noOfLowSkilledLabours || 0;
          this.machineDetails.noOfSemiSkilledLabours = machineMarket?.noOfSemiSkilledLabours || 0;
          this.machineDetails.noOfSkilledLabours = machineMarket?.noOfSkilledLabours || 0;
          this.machineDetails.specialSkilledLabours = machineMarket?.specialSkilledLabours || 0;
          this.machineDetails.avgUtilization = machineMarket?.averageUtilization || 0;
          this.machineDetails.depreciationCost = Math.round(machine?.depreciationCost || 0);
          this.machineDetails.inputedInterestCost = Math.round(machine?.inputedInterestCost || 0);
          this.machineDetails.powerCost = Math.round(machine?.powerCost || 0);
          this.machineDetails.rentCost = Math.round(machine?.rentCost || 0);
          this.machineDetails.maintenanceCost = Math.round(machine?.maintenanceCost || 0);
          this.machineDetails.suppliesCost = Math.round(machine?.suppliesCost || 0);
          this.machineDetails.burdenedCost = Math.round(machine?.burdenedCost || 0);
          this.selectedMachineDescription = machine?.machineDescription;
        }
      }

      this.defaultValues.qaInspectorRate = processInfo?.qaOfInspectorRate ?? this.defaultValues?.qaInspectorRate;
    } else {
      this.costingManufacturingInfoform.controls['machineHourRate'].setValue(this.sharedService.isValidNumber(this.machineMaster?.machineHourRate));
      this.defaultValues.machineHourRate = this.sharedService.isValidNumber(this.machineMaster?.machineHourRate);
      this.setSelectedMachineDescription(this.machineMaster);
    }
  }

  private filterAndSortMachineMasters(result: MedbMachinesMasterDto[], isEditCall: boolean, processTypeId: number, subprocessTypeId: number = 0) {
    result = this.costManufacturingAutomationService.filterbyMachineType(result, processTypeId, this.materialInfoList?.find((x) => x?.secondaryProcessId === 1)?.processId);
    if (processTypeId === ProcessType.TurningCenter || processTypeId === ProcessType.MillingCenter) {
      result.sort((a, b) => a.workPieceMinOrMaxDia - b.workPieceMinOrMaxDia);
      this.machineTypeDescription.set(result);
    } else if (processTypeId === ProcessType.CastingCorePreparation) {
      result.sort((a, b) => a.maxCoreBoxLength * a.maxCoreBoxWidth - b.maxCoreBoxLength * b.maxCoreBoxWidth);
      this.machineTypeDescription.set(result);
    } else if ([ProcessType.MoldPerparation, ProcessType.CastingMoldMaking].includes(processTypeId)) {
      result.sort((a, b) => a.flaskLength * a.flaskWidth - b.flaskLength * b.flaskWidth);
      // const moldData = this.costManufacturingAutomationService.setMoldPreparationData(this.materialInfoList);
      // this.getFormGroup(FormGroupKeys.Casting).patchValue({
      //   tableSizeRequired: `${moldData.moldBoxLength} x ${moldData.moldBoxWidth}`,
      // });
      this._manufacturingMapper._castingMapper.setMoldPreparationData(this.materialInfoList, this.costingManufacturingInfoform.get(FormGroupKeys.Casting));
      // result = result.filter(x => (x.flaskLength * x.flaskWidth) > (this.setMoldPreparationData()?.moldBoxSize || 0))
      // result = result.filter((x) => x.flaskLength * x.flaskWidth > (moldData?.moldBoxSize || 0)).map((x) => ({ ...x, flaskSize: Math.round(x.flaskLength * x.flaskWidth) }));
      result = result.map((x) => ({ ...x, flaskSize: Math.round(x.flaskLength * x.flaskWidth) }));
      this.machineTypeDescription.set([...result.filter((x) => x.machineManufacturer === 'DISA Group'), ...result.filter((x) => x.machineManufacturer !== 'DISA Group')]);
    } else if (processTypeId === ProcessType.MeltingCasting) {
      result.sort((a, b) => a.machineTonnageTons - b.machineTonnageTons);
      if (this.materialmasterDatas.materialGroup === 'Ferrous') {
        result = result.filter((x) => !x.machineName.toLowerCase().includes('crucible'));
      }
      this.machineTypeDescription.set([
        ...result.filter((x) => x.machineName.toLowerCase().includes('induction furnace')),
        ...result.filter((x) => !x.machineName.toLowerCase().includes('induction furnace')),
      ]);
    } else if (processTypeId === ProcessType.PouringCasting) {
      result.sort((a, b) => a.pourCapacity - b.pourCapacity);
      this.machineTypeDescription.set(result);
    } else if (processTypeId === ProcessType.HighPressureDieCasting) {
      this.machineTypeDescription.set([...result].sort((a, b) => a.machineTonnageTons - b.machineTonnageTons));
      // } else if (processTypeId === ProcessType.CastingCoreAssembly) {
      //   result.sort((a, b) => a.flaskLength * a.flaskWidth - b.flaskLength * b.flaskWidth);
      // this.machineTypeDescription.set(result);
    } else if ([ProcessType.GravityDieCasting, ProcessType.LowPressureDieCasting, ProcessType.TrimmingPress].includes(processTypeId)) {
      result.sort((a, b) => a.platenLengthmm * a.platenWidthmm - b.platenLengthmm * b.platenWidthmm);
      this.machineTypeDescription.set(result);
    } else if (processTypeId === ProcessType.CastingShakeout) {
      result.sort((a, b) => a.machineCapacity - b.machineCapacity);
      this.machineTypeDescription.set(result);
    } else if ([ProcessType.CastingFettling, ProcessType.ShotBlasting].includes(processTypeId)) {
      result.sort((a, b) => a.maxProcessableWeightKgs - b.maxProcessableWeightKgs);
      this.machineTypeDescription.set(result);
    } else if (processTypeId === ProcessType.SawCutting) {
      const subProcessTypeID = Number(this.costingManufacturingInfoform.controls['subProcessTypeID'].value);
      if (subProcessTypeID === 2) {
        const stockShearingMachines = this._manufacturingConfig._manufacturingForgingSubProcessConfigService.stockShearingMachines;
        result.filter((m) => stockShearingMachines.includes(m.machineName)).sort((a, b) => a.machineTonnageTons - b.machineTonnageTons);
        this.machineTypeDescription.set(result);
      }
      if (subProcessTypeID === 1) {
        const bandSawCuttingMachines = this._manufacturingConfig._manufacturingForgingSubProcessConfigService.bandSawCuttingMachines;
        const noOfbends = Number(this.costingManufacturingInfoform.controls['noOfBends'].value);
        if (noOfbends === 2) {
          result.filter((m) => bandSawCuttingMachines.includes(m.machineName)).sort((a, b) => a.workPieceMinOrMaxDia - b.workPieceMinOrMaxDia);
          this.machineTypeDescription.set(result);
        }
        if (noOfbends === 1) {
          result.filter((m) => bandSawCuttingMachines.includes(m.machineName)).sort((a, b) => a.workPieceHeight - b.workPieceHeight && a.stockWidth - b.stockWidth);
          this.machineTypeDescription.set(result);
        }
      }

      // result.sort((a, b) => a.workPieceMinOrMaxDia - b.workPieceMinOrMaxDia);
      // this.machineTypeDescription.set(result);
    } else if (processTypeId === ProcessType.Bending || processTypeId === ProcessType.Stage || processTypeId === ProcessType.Progressive) {
      result?.sort((a, b) => {
        const aMachineName = a.machineName?.split('_').slice(0, 2)?.join('_') || '';
        const bMachineName = b.machineName?.split('_').slice(0, 2)?.join('_') || '';
        return aMachineName.localeCompare(bMachineName) || a.machineTonnageTons - b.machineTonnageTons;
      });
      this.machineTypeDescription.set(result);
    } else if (this._harnessConfig.harnessTypes.includes(processTypeId)) {
      this.automationLevelList = this._harnessConfig.getAutomationLevelList(Number(subprocessTypeId));
      let defaultAutomationLevel = this._harnessConfig.getDefaultAutomationLevel(Number(subprocessTypeId));
      const machineTypeMap = {
        [MachineType.Manual]: 'Manual',
        [MachineType.Automatic]: 'Automatic',
        [MachineType.SemiAuto]: 'Semi-Automatic',
      };
      const machineTypeToMap = machineTypeMap[defaultAutomationLevel] || 0;
      let selectedMachine = result?.find((machine) => machine.machineMarketDtos?.some((market) => market.machineType === machineTypeToMap));
      if (
        [
          HarnessSubProcessTypes.PartAssembly,
          HarnessSubProcessTypes.CableTieFixing,
          HarnessSubProcessTypes.TubeSleeveBraidInsertionFixing,
          HarnessSubProcessTypes.LayoutRouting,
          HarnessSubProcessTypes.Taping,
          HarnessSubProcessTypes.PartIDLabelFixing,
          HarnessSubProcessTypes.BracketProtectorFitment,
          HarnessSubProcessTypes.ClipClampFixing,
        ].includes(Number(subprocessTypeId))
      ) {
        selectedMachine = result?.find((machine) => machine.machineDescription === 'MT - 3');
      } else if ([HarnessSubProcessTypes.Unsheathing8AWGto4AWG].includes(Number(subprocessTypeId))) {
        selectedMachine = result?.find((machine) => machine.machineDescription === 'Lota 330');
      }
      this.machineTypeDescription.set(result);
      this.processMachineMasterData(selectedMachine, false);
    } else if (processTypeId === ProcessType.PlugConnectorOvermolding) {
      result = result.sort((a, b) => {
        const aIsOver = a.machineName.startsWith('OverMolding');
        const bIsOver = b.machineName.startsWith('OverMolding');
        if (aIsOver && !bIsOver) return -1;
        if (!aIsOver && bIsOver) return 1;
        return a.machineTonnageTons - b.machineTonnageTons;
      });
      this.machineTypeDescription.set(result);
    } else {
      this.machineTypeDescription.set([...result].sort((a, b) => a.machineTonnageTons - b.machineTonnageTons));
    }
  }

  setOperationType(workCenterId: number, isEdit = false) {
    if (this.machiningOperationTypeFormArray.length > 0) {
      this.machiningOperationTypeFormArray.clear();
      this.showAddProcessBtn = false;
    }
    this.MachiningFlags = { ...this.MachiningFlags, ...this._manufacturingConfig._machining.setMachineFlags(workCenterId) };
    this.operationNameList = this._manufacturingConfig._machining.getOperationTypes(workCenterId);
    if (!isEdit) {
      this.addMachiningOperation();
    }
  }

  setToolingRequireForBending(event: any) {
    const bendingType = event?.currentTarget.value;
    if (bendingType == BendingToolTypes.Soft) {
      this.costingManufacturingInfoform.controls['newToolingRequired'].setValue(false);
      this.hideToolingRequired = true;
      this.bendingType.soft = true;
      this.bendingType.dedicated = false;
    } else {
      this.hideToolingRequired = false;
      this.bendingType.soft = false;
      this.bendingType.dedicated = true;
    }
    this.calculateCost();
  }

  setTypeForForging(event: any) {
    const subProcessTypeID = event?.currentTarget?.value ? Number(event?.currentTarget?.value) : Number(event);
    this.forgingCutting.bandSawCutting = subProcessTypeID === ForgingCutting.BandSawCutting;
    this.forgingCutting.stockShearing = subProcessTypeID === ForgingCutting.StockShearing;
    this.calculateCost();

    const onMachineChangeWhenAvailable = () => {
      setTimeout(() => {
        if (this.machineTypeDescription().length > 0) {
          let machine: MedbMachinesMasterDto[] = [];
          let selectedMachineId: number = 0;
          if (subProcessTypeID === 2) {
            const stockShearingMachines = this._manufacturingConfig._manufacturingForgingSubProcessConfigService.stockShearingMachines;
            machine = this.fullMachineTypeDescription.filter((m) => stockShearingMachines.includes(m.machineName)).sort((a, b) => a.machineTonnageTons - b.machineTonnageTons);
            selectedMachineId = machine.find((x) => x.machineTonnageTons >= this.costingManufacturingInfoform.controls['recommendTonnage']?.value)?.machineID || machine[0]?.machineID;
          }
          if (subProcessTypeID === 1) {
            const bandSawCuttingMachines = this._manufacturingConfig._manufacturingForgingSubProcessConfigService.bandSawCuttingMachines;
            if (this.costingManufacturingInfoform.controls['noOfBends']?.value === 2) {
              machine = this.fullMachineTypeDescription.filter((m) => bandSawCuttingMachines.includes(m.machineName)).sort((a, b) => a.workPieceMinOrMaxDia - b.workPieceMinOrMaxDia);
              selectedMachineId = machine.find((x) => x.workPieceMinOrMaxDia >= this.costingManufacturingInfoform.controls['drillDiameter']?.value)?.machineID || machine[0]?.machineID;
            }
            if (this.costingManufacturingInfoform.controls['noOfBends']?.value === 1) {
              machine = this.fullMachineTypeDescription
                .filter((m) => bandSawCuttingMachines.includes(m.machineName))
                .sort((a, b) => a.workPieceHeight - b.workPieceHeight && a.stockWidth - b.stockWidth);
              selectedMachineId =
                machine.find(
                  (x) =>
                    x.workPieceHeight >= this.costingManufacturingInfoform.controls['drillDiameter']?.value &&
                    x.stockWidth >= this.costingManufacturingInfoform.controls['workpieceStockDiameter']?.value
                )?.machineID || machine[0]?.machineID;
            }
          }
          this.machineTypeDescription.set(machine);
          this.costingManufacturingInfoform.controls['machineId'].setValue(selectedMachineId);
          // this.costingManufacturingInfoform.controls['machineId'].setValue(
          //   this.machineTypeDescription().find((x) => x.workPieceMinOrMaxDia >= this.costingManufacturingInfoform.controls['recommendTonnage'].value)?.machineID ||
          //     this.machineTypeDescription()[0]?.machineID
          // );
          this.machineDescChange(this.costingManufacturingInfoform.controls['machineId'].value);
        } else {
          onMachineChangeWhenAvailable();
        }
      }, 1000);
    };
    onMachineChangeWhenAvailable();
  }

  operationTypeChange(event: any, index: number) {
    this.clearmachiningFormControlValues(event.currentTarget.value, index);
    this.showAddProcessButton(Number(this.costingManufacturingInfoform.controls['processTypeID'].value), event.currentTarget.value, index);
  }

  clearmachiningFormControlValues(operationTypeId: number, index: number) {
    (this.machiningOperationTypeFormArray?.controls as FormGroup[])[index].patchValue({
      ...this._manufacturingConfig._machining.getMachiningOperationFormFields(this.selectedProcessInfoId),
      operationTypeId: operationTypeId,
    });
    this.showAddProcessBtn = false;
  }

  showAddProcessButton(workCenter, operationType: number, index: number, isEdit = false) {
    if (operationType > 0) {
      this.showAddProcessBtn = true;
      if (!isEdit) {
        this._manufacturingHelperService.showAddProcessButtonPatches(this.machiningOperationTypeFormArray?.controls as FormGroup[], index, operationType, this.operationNameList);
      }
      (this.machiningOperationTypeFormArray?.controls as FormGroup[])[index].patchValue(this._manufacturingConfig._machining.getOperationFlags(workCenter, operationType));
      !isEdit && this.calculateCost();
    }
  }

  addAllOperationTypes() {
    const operationType = this._manufacturingConfig.operationTypeMapping[Number(this.costingManufacturingInfoform.controls['processTypeID'].value)];
    if (operationType.length > 0) {
      let index = this.machiningOperationTypeFormArray?.controls.length;
      operationType.forEach((operationTypeId) => {
        if (this.machiningOperationTypeFormArray?.controls.filter((rec) => rec.value.operationTypeId === operationTypeId).length <= 0) {
          this.addMachiningOperation();
          this.showAddProcessButton(Number(this.costingManufacturingInfoform.controls['processTypeID'].value), operationTypeId, index++);
        }
      });
      this.calculateCost();
      this.onManufacturingFormValueChange();
    }
  }

  checkAndInsertAdditionalProcessEntries(materialInfo: MaterialInfoDto, processInfo: ProcessInfoDto, laborRate: LaborRateMasterDto[]) {
    const result = this._manufacturingConfig.setAdditionalProcessEntries(processInfo, materialInfo, this.currentPart);
    if (this.sharedService.extractedProcessData?.ProcessBendingInfo || this.sharedService.extractedProcessData?.ProcessFormInfo) {
      // this.automateProcessEntries(materialInfo, laborRate, result);
      const automationParams = this.parametersForAutomation();
      this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, result, automationParams);
      // this.updateOnAutomation(changeOnAutomation);
    }
  }

  parametersForAutomation() {
    const automationParams = {
      thisCurrentPart: this.currentPart,
      machineInfoList: this.machineInfoList,
      defaultValues: this.defaultValues,
      processTypeOrginalList: this.processTypeOrginalList,
      fieldColorsList: this.fieldColorsList,
      manufacturingObj: this.manufacturingObj,
      laborCountByMachineType: this.laborCountByMachineType,
      subProcessFormArray: this.subProcessFormArray,
      inputSelectedProcessInfoId: this.selectedProcessInfoId,
      inputFormIdentifier: this.formIdentifier,
      // inputAutomationProcessCount: this.automationProcessCount,
      totSubProcessCount: this.totSubProcessCount,
      toolingMasterData: this.ToolingMasterData,
      commodity: this.commodity,
      countryList: this.countryList,
      newCoreAdded: this.newCoreAdded,
      // inputMachineTypeDescription: this.machineTypeDescription(),
    };
    return automationParams;
  }

  private formPristineUntouchMarking() {
    for (const el in this.costingManufacturingInfoform.controls) {
      if (Object.values(FormGroupKeys).includes(el as FormGroupKeys)) {
        const frm = this._manufacturingHelperService.getMatchingFormGroupByElement(el, this.processFlag, this.getFormGroup.bind(this));
        if (frm) {
          for (const passEl in frm.controls) {
            if (frm.controls[passEl] && [null, '', undefined].includes(frm.controls[passEl]?.value)) {
              frm.controls[passEl].markAsPristine();
              frm.controls[passEl].markAsUntouched();
              this.fieldColorsList = this.fieldColorsList.filter((x) => x.formControlName !== passEl);
            }
          }
        }
      } else {
        const control = this.costingManufacturingInfoform.controls[el];
        if (control && [null, '', undefined].includes(control.value)) {
          if (el === 'coreCycleTimes') {
            this.coreCycleTimeArray.controls.forEach((control, i) => {
              this.coreCycleTimeArray.controls[i].markAsPristine();
              this.coreCycleTimeArray.controls[i].markAsUntouched();
            });
          } else {
            this.costingManufacturingInfoform.controls[el].markAsPristine();
            this.costingManufacturingInfoform.controls[el].markAsUntouched();
          }
          this.fieldColorsList = this.fieldColorsList.filter((x) => x.formControlName !== el);
        }
      }
    }
  }

  private subArraysForFormGroups(manufactureInfo: ProcessInfoDto) {
    let subArray: FormArray<any>;
    if (this.processFlag.IsProcessAssembly) {
      subArray = this.getFormGroup(FormGroupKeys.Assembly).controls['subProcessList'] as FormArray;
    } else if (this.processFlag.IsProcessElectronics) {
      subArray = this.getFormGroup(FormGroupKeys.Electronics).controls['subProcessList'] as FormArray;
    } else if (this.forging.coldForgingClosedDieCold) {
      subArray = this.getFormGroup(FormGroupKeys.ForgingSubProcess).controls['subProcessList']?.value as FormArray;
    } else {
      subArray = this.subProcessFormArray;
    }
    manufactureInfo.subProcessFormArray = subArray;
  }

  calculateCost(fieldName = '', _index = 0) {
    let yieldPer = 98.5;
    if (this.processFlag.IsProcessMachining && !this.processFlag.IsSecondaryProcess) {
      yieldPer = 98;
    } else if (this.processFlag.IsCasting && !this.processFlag.IsSecondaryProcess) {
      yieldPer = this.processFlag.IsProcessHighPressureDieCasting || this.processFlag.IsProcessLowPressureDieCasting ? 95 : 0;
    } else if (
      this.processFlag.IsProcessShotBlasting ||
      this.processFlag.IsProcessMoldPreparation ||
      this.processFlag.IsProcessCorePreparation ||
      this.processFlag.IsProcessMelting ||
      this.processFlag.IsProcessPouring ||
      this.processFlag.IsProcessPartCoolingShakeOut ||
      this.processFlag.IsProcessFetling ||
      this.processFlag.IsProcessCleaning ||
      this.processFlag.IsProcessVaccumeImpregnation
    ) {
      yieldPer = 98;
    }

    this.formPristineUntouchMarking();
    if (
      !this.processFlag.IsProcessTypeWelding &&
      !this.processFlag.IsProcessTypeTPP &&
      !this.processFlag.IsProcessTypeCutting &&
      !this.processFlag.IsProcessTypeStamping &&
      !this.processFlag.IsProcessTypeStampingProgressive &&
      !this.processFlag.IsProcessTypeTransferPress &&
      !this.processFlag.IsProcessTypeShearing
    ) {
      this._manufacturingHelperService.calculateCostSetValue(this.costingManufacturingInfoform.controls, yieldPer, this.fieldColorsList, this.processFlag, this.defaultValues, this.manufacturingObj);
    }
    // if (this.processFlag.IsProcessTypeWelding) {
    //   this._manufacturingHelperService.calculateCostWeldingSetValue(
    //     this.costingManufacturingInfoform.controls,
    //     this.laborCountByMachineType,
    //     this.fieldColorsList,
    //     this.manufacturingObj,
    //     this.laborRateInfo
    //   );
    // }
    if (this.materialmasterDatas && !this.processFlag.IsProcessElectronics && !this.forging.threadRolling) {
      this.costingManufacturingInfoform.patchValue({
        meltTemp: this.materialmasterDatas?.meltingTemp || 0,
        ejecTemp: this.materialmasterDatas?.ejectDeflectionTemp || 0,
        mouldTemp: this.materialmasterDatas?.moldTemp || 0,
        maxWallThickess: this.sharedService.isValidNumber(this.materialInfoList?.length && this.materialInfoList[0]?.wallThickessMm),
        thermalDiffusivity: this.materialmasterDatas?.thermalDiffusivity || 0,
      });
      // if (this.materialmasterDatas && !this.processFlag.IsProcessElectronics && !this.forging.threadRolling && !this.forging.coldColdHeadingForging) {
      if (!this.forging.coldColdHeadingForging) {
        this.costingManufacturingInfoform.patchValue({
          clampingPressure:
            this.costingManufacturingInfoform.controls['clampingPressure'].value > 0
              ? this.costingManufacturingInfoform.controls['clampingPressure'].value
              : this.materialmasterDatas?.clampingPressure || 0,
        });
      }
    }
    //Calculation Input for all the process Types
    if (this.sharedService.extractedProcessData && this.costingManufacturingInfoform.controls['processTypeID'].value > 0) {
      // this.setExtractData();
      this.manufacturingExtractDataService.setExtractData(
        this.processFlag,
        this.costingManufacturingInfoform,
        this.getFormGroup(FormGroupKeys.Casting),
        this.conversionValue,
        this.isEnableUnitConversion,
        this.currentPart,
        this.BillOfMaterialList,
        this.forging,
        this.fieldColorsList
      );
    }
    let manufactureInfo = new ProcessInfoDto();
    manufactureInfo.processInfoId = this.selectedProcessInfoId;
    this._manufacturingConfig.manufacturingCalculateCostProps.forEach((prop) => (manufactureInfo[prop] = this[prop]));
    this._manufacturingConfig.manufacturingMachiningProps.forEach((prop) => (manufactureInfo[prop] = this.costManufacturingRecalculationService[prop]));
    manufactureInfo.materialTypeName = this.stockFormCategoriesDto.find((x) => x.materialTypeId === manufactureInfo.materialType)?.materialType;
    // manufactureInfo.materialInfoList = this.materialInfoList;
    manufactureInfo.mfrCountryId = this.currentPart?.mfrCountryId;
    manufactureInfo.partComplexity = this.currentPart?.partComplexity;
    manufactureInfo.eav = this.currentPart?.eav;
    manufactureInfo.processInfoList = this.machineInfoList;
    manufactureInfo.machineList = this.machineTypeDescription();
    this.subArraysForFormGroups(manufactureInfo);
    manufactureInfo.qaOfInspectorRate = this.defaultValues.qaInspectorRate;
    manufactureInfo.noOfLowSkilledLabours = this.defaultValues.noOfDirectLabors;
    manufactureInfo.machineHourRateFromDB = this.defaultValues.machineHourRate;
    manufactureInfo.lotSize = this.currentPart?.lotSize ? this.currentPart?.lotSize : 1;
    this.defaultValues.qaInspectorRate = !this.processFlag.IsCasting || this.processFlag.IsSecondaryProcess || this.processFlag.IsProcessMachining ? this.defaultValues.qaInspectorRate : 0;
    manufactureInfo.cavityPressure = this.materialmasterDatas?.clampingPressure || 0;
    manufactureInfo.coreCycleTimes = this.coreCycleTimeArray.value;
    // this._manufacturingConfig.manufacturingFormAssignValue(manufactureInfo, this.costingManufacturingInfoform.controls, this.conversionValue, this.isEnableUnitConversion, this.defaultValues);
    this._manufacturingMapper.manufacturingFormAssignValue(
      manufactureInfo,
      this.costingManufacturingInfoform.controls,
      this.conversionValue,
      this.isEnableUnitConversion,
      this.defaultValues,
      this.processFlag
    );
    // this._manufacturingConfig.manufacturingDirtyCheck(manufactureInfo, this.costingManufacturingInfoform.controls);
    this._manufacturingMapper.manufacturingDirtyCheck(manufactureInfo, this.costingManufacturingInfoform.controls, this.coreCycleTimeArray.controls);
    // manufactureInfo.isselectedTonnageDirty = !this.costingManufacturingInfoform.controls['selectedTonnage'].value ? false :
    //   (this.costingManufacturingInfoform.controls['selectedTonnage'].dirty ? true : manufactureInfo.isselectedTonnageDirty);
    // manufactureInfo.iscycleTimeDirty = !this.costingManufacturingInfoform.controls['cycleTime'].value ? false :
    //   (this.costingManufacturingInfoform.controls['cycleTime'].dirty ? true : manufactureInfo.iscycleTimeDirty);
    // this.coreCycleTimeArray.controls.forEach((control, i) => {
    //   manufactureInfo.isCoreCycleTimesDirty[i] = !control.value ? false : (control.dirty ? true : manufactureInfo.isCoreCycleTimesDirty[i]);
    // });
    // manufactureInfo.speedOfConveyer = this.costingManufacturingInfoform.controls['speedOfConveyer'].dirty ? this.costingManufacturingInfoform.controls['speedOfConveyer'].value :
    //   ((this.processFlag.IsProcessTypeWetPainting || this.processFlag.IsProcessTypeSiliconCoatingAuto || this.processFlag.IsProcessTypeSiliconCoatingSemi) ? 2.5 : 1.52);
    manufactureInfo = this._simulationService.setCommonObjectValues(manufactureInfo, this.fieldColorsList, this.manufacturingObj);
    // if (this.forging.hotForgingClosedDieHot || this.forging.hotForgingOpenDieHot ||
    //   this.forging.hotForgingClosedDieHot || this.forging.stockShearing || this.forging.trimmingPress || this.forging.cleaning || this.forging.control || this.forging.testing || this.forging.staigtening || this.forging.heatTreatment || this.forging.cutting || this.forging.hotForgingOpenDieHot || this.forging.shotBlasting ||
    //   this.forging.coldForgingClosedDieCold || this.forging.coldColdHeadingForging || this.forging.lubricationPhosphating || this.forging.threadRolling || this.forging.threadRollingColdHeadingForging || this.forging.billetHeating
    // ) {
    //   // this._manufacturingForgingSubProcessConfigService.setCalculationObject(manufactureInfo, this.forgingSubProcessFormGroup.controls, this.conversionValue, this.isEnableUnitConversion);
    //   //this._manufacturingForgingSubProcessConfigService.forgingDirtyCheck(manufactureInfo, this.forgingSubProcessFormGroup.controls);
    // }
    const machineId = this.costingManufacturingInfoform.controls['machineId'].value;
    if (machineId && this.machineTypeDescription().length > 0) {
      manufactureInfo.machineTypeId = this._manufacturingConfig.setMachineTypeIdByName(this.machineTypeDescription().find((x) => x.machineID === machineId)?.machineMarketDtos[0].machineType);
    } else {
      manufactureInfo.machineTypeId = this.costingManufacturingInfoform.controls['semiAutoOrAuto'].value || 0;
    }
    // this.costingManufacturingInfoform.controls['semiAutoOrAuto'].setValue(this._manufacturingConfig.setMachineTypeIdByName(result?.machineType));
    if (this.processFlag.IsProcessElectronics) {
      this._manufacturingConfig._electronics.setCalculationObject(manufactureInfo, this.getFormGroup(FormGroupKeys.Electronics).controls);
      this._manufacturingConfig._electronics.electronicsDirtyCheck(manufactureInfo, this.getFormGroup(FormGroupKeys.Electronics).controls);
      this.patchCalculationResult(this._simulationService._manuFacturingElectronicsService.calculationForElectronics(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessTubeLaser) {
      this._manufacturingConfig._sheetMetalProcessMapperConfig.setCalculationObject(manufactureInfo, this.getFormGroup(FormGroupKeys.SheetMetalProcess).controls);
      this._manufacturingConfig._sheetMetalProcessMapperConfig.dirtyCheck(manufactureInfo, this.getFormGroup(FormGroupKeys.SheetMetalProcess).controls);
      this.patchCalculationResult(this._sheetMetalService.calculationForTubeLaser(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessTubeBendingMetal) {
      this._manufacturingConfig._sheetMetalProcessMapperConfig.setCalculationObject(manufactureInfo, this.getFormGroup(FormGroupKeys.SheetMetalProcess).controls);
      this._manufacturingConfig._sheetMetalProcessMapperConfig.dirtyCheck(manufactureInfo, this.getFormGroup(FormGroupKeys.SheetMetalProcess).controls);
      this.patchCalculationResult(this._sheetMetalService.calculationForTubeBendingMetal(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessTypeCompressionMolding) {
      this._manufacturingConfig._compressionConfig.setCalculationObject(manufactureInfo, this.getFormGroup(FormGroupKeys.CompressionMolding).controls);
      this._manufacturingConfig._compressionConfig.dirtyCheck(manufactureInfo, this.getFormGroup(FormGroupKeys.CompressionMolding).controls);
      this.patchCalculationResult(this._plasticRubberService.calculationsForCompressionMolding(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessTypeTransferMolding) {
      this._manufacturingConfig._compressionConfig.setCalculationObject(manufactureInfo, this.getFormGroup(FormGroupKeys.CompressionMolding).controls);
      this._manufacturingConfig._compressionConfig.dirtyCheck(manufactureInfo, this.getFormGroup(FormGroupKeys.CompressionMolding).controls);
      this.patchCalculationResult(this._plasticRubberService.calculationsForTransferMolding(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessTypePlasticCutting) {
      this._manufacturingConfig._compressionConfig.setCalculationObject(manufactureInfo, this.getFormGroup(FormGroupKeys.CompressionMolding).controls);
      this._manufacturingConfig._compressionConfig.dirtyCheck(manufactureInfo, this.getFormGroup(FormGroupKeys.CompressionMolding).controls);
      this.patchCalculationResult(this._plasticRubberService.calculationsForCutting(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessMachining && !this.processFlag.IsSecondaryProcess) {
      // this.machiningConfig.manufacturingMachiningFormAssignValue(manufactureInfo, this.machiningFormGroup.controls, this.conversionValue, this.isEnableUnitConversion);
      this._manufacturingMapper._machiningMapper.manufacturingMachiningFormAssignValue(manufactureInfo, this.getFormGroup(FormGroupKeys.Machining).controls);
      this._manufacturingMapper._machiningMapper.manufacturingMachiningDirtyCheck(manufactureInfo, this.getFormGroup(FormGroupKeys.Machining).controls);
      this.doCostCalculationForMachiningTypes(manufactureInfo, fieldName);
    } else if (this.processFlag.IsProcessCleaningForging) {
      this._manufacturingMapper._cleaningForgingMapper.manufacturingCleaningForgingFormAssignValue(
        manufactureInfo,
        this.getFormGroup(FormGroupKeys.CleaningForging).controls,
        this.conversionValue,
        this.isEnableUnitConversion
      );
      this._manufacturingMapper._cleaningForgingMapper.manufacturingCleaningForgingDirtyCheck(manufactureInfo, this.getFormGroup(FormGroupKeys.CleaningForging).controls);
      this.patchCalculationResult(this._simulationService._manufacturingCleaningForgingCalService.calculateCleaningForging(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessBilletHeatingForging) {
      this._manufacturingMapper._billetHeatingForgingMapper.manufacturingBilletHeatingForgingFormAssignValue(
        manufactureInfo,
        this.getFormGroup(FormGroupKeys.BilletHeatingForging).controls,
        this.conversionValue,
        this.isEnableUnitConversion
      );
      this._manufacturingMapper._billetHeatingForgingMapper.manufacturingBilletHeatingForgingDirtyCheck(manufactureInfo, this.getFormGroup(FormGroupKeys.BilletHeatingForging).controls);
      this.patchCalculationResult(this._simulationService._manufacturingBilletHeatingForgingCalService.calculateBilletHeatingForging(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessTrimmingHydraulicForging) {
      this._manufacturingMapper._trimmingHydraulicForgingMapper.manufacturingTrimmingHydraulicForgingFormAssignValue(
        manufactureInfo,
        this.getFormGroup(FormGroupKeys.TrimmingHydraulicForging).controls,
        this.conversionValue,
        this.isEnableUnitConversion
      );
      this._manufacturingMapper._trimmingHydraulicForgingMapper.manufacturingTrimmingHydraulicForgingDirtyCheck(manufactureInfo, this.getFormGroup(FormGroupKeys.TrimmingHydraulicForging).controls);
      this.patchCalculationResult(
        this._simulationService._manufacturingTrimmingHydraulicForgingCalService.calculateTrimmingHydraulicForging(manufactureInfo, this.fieldColorsList, this.manufacturingObj)
      );
    } else if (this.processFlag.IsProcessStraighteningOptionalForging) {
      this._manufacturingMapper._straighteningOptionalForgingMapper.manufacturingStraighteningOptionalForgingFormAssignValue(
        manufactureInfo,
        this.getFormGroup(FormGroupKeys.StraighteningOptionalForging).controls,
        this.conversionValue,
        this.isEnableUnitConversion
      );
      this._manufacturingMapper._straighteningOptionalForgingMapper.manufacturingStraighteningOptionalForgingDirtyCheck(
        manufactureInfo,
        this.getFormGroup(FormGroupKeys.StraighteningOptionalForging).controls
      );
      this.patchCalculationResult(
        this._simulationService._manufacturingStraighteningOptionalForgingCalService.calculateStraighteningOptionalForging(manufactureInfo, this.fieldColorsList, this.manufacturingObj)
      );
    } else if (this.processFlag.IsProcessPiercingHydraulicForging) {
      this._manufacturingMapper._piercingHydraulicForgingMapper.manufacturingPiercingHydraulicForgingFormAssignValue(
        manufactureInfo,
        this.getFormGroup(FormGroupKeys.PiercingHydraulicForging).controls,
        this.conversionValue,
        this.isEnableUnitConversion
      );
      this._manufacturingMapper._piercingHydraulicForgingMapper.manufacturingPiercingHydraulicForgingDirtyCheck(manufactureInfo, this.getFormGroup(FormGroupKeys.PiercingHydraulicForging).controls);
      this.patchCalculationResult(
        this._simulationService._manufacturingPiercingHydraulicForgingCalService.calculatePiercingHydraulicForging(manufactureInfo, this.fieldColorsList, this.manufacturingObj)
      );
    } else if (this.processFlag.IsProcessTestingMpiForging) {
      this._manufacturingMapper._testingMpiForgingMapper.manufacturingTestingMpiForgingFormAssignValue(
        manufactureInfo,
        this.getFormGroup(FormGroupKeys.TestingMpiForging).controls,
        this.conversionValue,
        this.isEnableUnitConversion
      );
      this._manufacturingMapper._testingMpiForgingMapper.manufacturingTestingMpiForgingDirtyCheck(manufactureInfo, this.getFormGroup(FormGroupKeys.TestingMpiForging).controls);
      this.patchCalculationResult(this._simulationService._manufacturingTestingMpiForgingCalService.calculateTestingMpiForging(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessTubeBending) {
      this._manufacturingMapper._tubeBendingMapper.manufacturingTubeBendingFormAssignValue(manufactureInfo, this.getFormGroup(FormGroupKeys.TubeBending).controls);
      this._manufacturingMapper._tubeBendingMapper.manufacturingTubeBendingDirtyCheck(manufactureInfo, this.getFormGroup(FormGroupKeys.TubeBending).controls);
      this.patchCalculationResult(this._simulationService._manufacturingTubeBendingCalService.doCostCalculationsForTubeBending(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsInsulationJacket) {
      this._manufacturingMapper.insulationJacketMapper.manufacturingInsulationJacketFormAssignValue(
        manufactureInfo,
        this.getFormGroup(FormGroupKeys.InsulationJacket).controls,
        this.conversionValue,
        this.isEnableUnitConversion
      );
      this._manufacturingMapper.insulationJacketMapper.manufacturingInsulationJacketDirtyCheck(manufactureInfo, this.getFormGroup(FormGroupKeys.InsulationJacket).controls);
      this.patchCalculationResult(this._simulationService._manufacturingInsulationJacketCalService.doCostCalculationsForInsulationJacket(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessBrazing) {
      this._manufacturingMapper._brazingMapper.manufacturingBrazingFormAssignValue(manufactureInfo, this.getFormGroup(FormGroupKeys.Brazing).controls);
      this._manufacturingMapper._brazingMapper.manufacturingBrazingDirtyCheck(manufactureInfo, this.getFormGroup(FormGroupKeys.Brazing).controls);
      this.patchCalculationResult(this._simulationService._manufacturingBrazingCalService.doCostCalculationsForBrazing(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessTypeWelding) {
      if (this.processFlag.IsProcessSpotWelding) {
        this.patchCalculationResult(this._weldingService.calculationForSpotWelding(manufactureInfo, this.fieldColorsList, this.manufacturingObj, this.laborRateInfo));
      } else if (this.processFlag.IsProcessSeamWelding) {
        this.patchCalculationResult(this._weldingService.calculationForSeamWelding(manufactureInfo, this.fieldColorsList, this.manufacturingObj, this.laborRateInfo));
      } else {
        if (this.materialmasterDatas) {
          this.costingManufacturingInfoform.patchValue({
            argonGasCost: this.materialmasterDatas?.argonGasCost || 0.001,
            co2GasCost: this.materialmasterDatas?.co2GasCost || 0.0006,
          });
        }
        if (this.processFlag.IsProcessMigWelding || this.processFlag.IsProcessTigWelding) {
          this._manufacturingConfig._sheetMetalConfig.stampingSubProcessFormAssignValue(manufactureInfo, this.conversionValue, this.isEnableUnitConversion);
        }
        this.patchCalculationResult(this._weldingService.calculationForWelding(manufactureInfo, this.fieldColorsList, this.manufacturingObj, this.laborRateInfo));
      }
    } else if (this.processFlag.IsProcessTypeInjectionMolding) {
      if (!this.costingManufacturingInfoform.controls['noOfLowSkilledLabours'].value) {
        manufactureInfo.noOfLowSkilledLabours = this.onMcAutomationChange();
      } else {
        manufactureInfo.noOfLowSkilledLabours = this.costingManufacturingInfoform.controls['noOfLowSkilledLabours'].value;
      }
      this.patchCalculationResult(this._plasticRubberService.calculationsForInjectionMoulding(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessTypeRubberInjectionMolding) {
      if (!this.costingManufacturingInfoform.controls['noOfLowSkilledLabours'].value) {
        manufactureInfo.noOfLowSkilledLabours = this.onMcAutomationChange();
      } else {
        manufactureInfo.noOfLowSkilledLabours = this.costingManufacturingInfoform.controls['noOfLowSkilledLabours'].value;
      }
      this.patchCalculationResult(this._plasticRubberService.calculationsForRubberInjectionMoulding(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessPlasticTubeExtrusion || this.processFlag.IsProcessPlasticConvolutedTubeExtrusion) {
      this._manufacturingMapper._plasticTubeExtrusionMapper.manufacturingPlasticTubeExtrusionFormAssignValue(manufactureInfo, this.getFormGroup(FormGroupKeys.PlasticTubeExtrusion).controls);
      this._manufacturingMapper._plasticTubeExtrusionMapper.manufacturingPlasticTubeExtrusionDirtyCheck(manufactureInfo, this.getFormGroup(FormGroupKeys.PlasticTubeExtrusion).controls);
      this.patchCalculationResult(
        this._simulationService._manufacturingPlasticTubeExtrusionCalcService.doCostCalculationsForPlasticTubeExtrusion(manufactureInfo, this.fieldColorsList, this.manufacturingObj)
      );
    }
    // else if (this.processFlag.IsProcessPlasticVacuumForming) {
    //   this._manufacturingMapper._plasticVacuumFormingMapper.manufacturingPlasticVacuumFormingFormAssignValue(manufactureInfo);
    //   this._manufacturingMapper._plasticVacuumFormingMapper.manufacturingPlasticVacuumFormingDirtyCheck(manufactureInfo, this.getFormGroup(FormGroupKeys.PlasticVacuumForming).controls);
    //   this.patchCalculationResult(this._plasticRubberService.doCostCalculationForVacuumForming(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    // }
    else if (this.processFlag.IsProcessMetalForming) {
      manufactureInfo.totalToolLoadingTime = 30;
      this.patchCalculationResult(this._simulationService.calculationsForMetalForming(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessDrilling) {
      manufactureInfo.setupPercentage = 0.05; //add to backend table during future dev - harcode to 5 percent for now
      this.patchCalculationResult(this._simulationService.calculationsForDrilling(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessTypeTPP) {
      this.patchCalculationResult(this._sheetMetalService.calculationsForTPP(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.forging.coldForgingClosedDieCold) {
      // this.doCostCalculateForgingClosedDieCold(manufactureInfo);
      //this.doCostCalculation(manufactureInfo, '_manufacturingForgingCalService', 'calculateColdCloseDieForging');
      manufactureInfo.setUpTimeBatch = 60;
      // this.calculateColdDieForgingSubProcess(manufactureInfo);
      this.patchCalculationResult(
        this._manufacturingForgingCalService.calculateColdDieForgingSubProcess(
          manufactureInfo,
          this.getFormArray(FormGroupKeys.ForgingSubProcess),
          this.getFormGroup(FormGroupKeys.ForgingSubProcess),
          this.selectedProcessInfoId,
          this.conversionValue,
          this.isEnableUnitConversion,
          this.fieldColorsList,
          this.manufacturingObj
        )
      );
    } else if (this.forging.coldColdHeadingForging) {
      manufactureInfo.setUpTimeBatch = 60;
      this.patchCalculationResult(this._manufacturingForgingCalService.calculateColdHeadingForging(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessDrawing) {
      this.patchCalculationResult(this._sheetMetalService.calculationForDrawing(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessForming) {
      this.patchCalculationResult(this._sheetMetalService.calculationForForming(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessMoldPreparation && !this.processFlag.IsCasting) {
      this.patchCalculationResult(this._simulationService.calculationForForMoldPreparation(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessMelting) {
      manufactureInfo.setUpTimeBatch = 2;
      this.patchCalculationResult(
        this._simulationService._manufacturingCastingCalcService.calculationForMeltingCasting(manufactureInfo, this.fieldColorsList, this.manufacturingObj, this.laborRateInfo)
      );
    } else if (this.processFlag.IsProcessPouring) {
      this.patchCalculationResult(
        this._simulationService._manufacturingCastingCalcService.calculationForPouringCasting(manufactureInfo, this.fieldColorsList, this.manufacturingObj, this.laborRateInfo)
      );
    } else if (this.processFlag.IsProcessCorePreparation) {
      this.patchCalculationResult(this._simulationService.calculationForForCorePreparation(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessPartCoolingShakeOut) {
      this.patchCalculationResult(this._simulationService.calculationForPartCooling(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessFetling) {
      this.patchCalculationResult(this._simulationService.calculationForFetling(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessCleaning || this.processFlag.IsProcessVaccumeImpregnation) {
      manufactureInfo.setUpTimeBatch = 0.25;
      this.patchCalculationResult(this._simulationService.calculationForCleaningOrVaccumeImpregnation(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessShotBlasting) {
      this.patchCalculationResult(this._manufacturingForgingCalService.calculationForShotBlasting(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
      // } else if (this.forging.cutting && this.forgingCutting.bandSawCutting) {
      // } else if (this.forging.cutting && (this.forgingCutting.bandSawCutting || this.forgingCutting.stockShearing)) {
    } else if (this.forging.cutting) {
      manufactureInfo.setUpTimeBatch = 30;
      manufactureInfo.noOfParts ||= 1;
      manufactureInfo.lotSize ||= this.currentPart?.lotSize || 1;
      this.patchCalculationResult(this._manufacturingForgingCalService.calculateForgingSawCuttingAndShearing(manufactureInfo, this.fieldColorsList, this.manufacturingObj, this.currentPart));
    } else if (this.forging.stockHeating && !this.processFlag.IsProcessInductionHeating) {
      this.patchCalculationResult(this._simulationService.calculateForgingStockHeating(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.forging.heatTreatment) {
      this.patchCalculationResult(this._manufacturingForgingCalService.calculateForgingHeatTreatment(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.forging.hotForgingOpenDieHot) {
      manufactureInfo.setUpTimeBatch = 60;
      this.patchCalculationResult(this._manufacturingForgingCalService.calculateHotForgingOpenDieHot(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.forging.hotForgingClosedDieHot) {
      manufactureInfo.setUpTimeBatch = 60;
      this.patchCalculationResult(this._manufacturingForgingCalService.calculateHotForgingOpenClosedDieHot(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.forging.billetHeatingContinuousFurnace) {
      manufactureInfo.setUpTimeBatch = 60;
      this.patchCalculationResult(this._simulationService._manufacturingBilletHeatingForgingCalService.calculateBilletHeatingForging(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.forging.stockShearing) {
      manufactureInfo.setUpTimeBatch = 60;
      this.patchCalculationResult(this._manufacturingForgingCalService.calculateHotForgingClosedDieStockShearing(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.forging.trimmingPress) {
      manufactureInfo.setUpTimeBatch = 3600;
      this.patchCalculationResult(
        this._simulationService._manufacturingTrimmingHydraulicForgingCalService.calculateTrimmingHydraulicForging(manufactureInfo, this.fieldColorsList, this.manufacturingObj)
      );
    } else if (this.forging.straightening) {
      manufactureInfo.setUpTimeBatch = 3600;
      this.patchCalculationResult(
        this._simulationService._manufacturingStraighteningOptionalForgingCalService.calculateStraighteningOptionalForging(manufactureInfo, this.fieldColorsList, this.manufacturingObj)
      );
    } else if (this.forging.piercing) {
      manufactureInfo.setUpTimeBatch = 3600;
      this.patchCalculationResult(
        this._simulationService._manufacturingPiercingHydraulicForgingCalService.calculatePiercingHydraulicForging(manufactureInfo, this.fieldColorsList, this.manufacturingObj)
      );
    } else if (this.forging.shotBlasting) {
      manufactureInfo.setUpTimeBatch = 10;
      this.patchCalculationResult(this._manufacturingForgingCalService.calculateForgingShotBlasting(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.forging.shotBlastingforOpenDie) {
      manufactureInfo.setUpTimeBatch = 10;
      this.patchCalculationResult(this._manufacturingForgingCalService.calculationForShotBlasting(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.forging.control) {
      manufactureInfo.setUpTimeBatch = 10;
      this.patchCalculationResult(this._manufacturingForgingCalService.calculateForgingControl(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.forging.testing) {
      manufactureInfo.setUpTimeBatch = 10;
      // this.patchCalculationResult(this._manufacturingForgingCalService.calculateForgingTesting(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
      this.patchCalculationResult(this._simulationService._manufacturingTestingMpiForgingCalService.calculateTestingMpiForging(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.forging.lubricationPhosphating) {
      manufactureInfo.setUpTimeBatch = 30;
      this.patchCalculationResult(this._manufacturingForgingCalService.calculateForgingLubricationPhosphate(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.forging.threadRolling) {
      manufactureInfo.setUpTimeBatch = 30;
      this.patchCalculationResult(this._manufacturingForgingCalService.calculateForgingThreadRolling(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.forging.threadRollingColdHeadingForging) {
      manufactureInfo.setUpTimeBatch = 30;
      this.patchCalculationResult(this._manufacturingForgingCalService.calculateColdHeadingThreadRolling(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.forging.billetHeating) {
      manufactureInfo.setUpTimeBatch = 60;
      this.patchCalculationResult(this._manufacturingForgingCalService.calculateForgingBilletHeating(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessTypeStampingProgressive || this.processFlag.IsProcessTypeStamping) {
      this._manufacturingConfig._sheetMetalConfig.stampingSubProcessFormAssignValue(manufactureInfo, this.conversionValue, this.isEnableUnitConversion);
      // manufactureInfo.noofStroke = 1;
      const calculatedRes = this.processFlag.IsProcessTypeStamping
        ? this._sheetMetalService.calculationForstampingStage(manufactureInfo, this.fieldColorsList, this.manufacturingObj, this.currentPart)
        : this._sheetMetalService.calculationForstampingProgressive(manufactureInfo, this.fieldColorsList, this.manufacturingObj);
      if (calculatedRes) {
        this._manufacturingConfig._sheetMetalConfig.stampingSubProcessFormPatchResults(calculatedRes, this.conversionValue, this.isEnableUnitConversion, this.subProcessFormArray);
        this.patchCalculationResult(calculatedRes);
      }
      // this.calculateTotalTon(manufactureInfo);
    } else if (this.processFlag.IsProcessTypeTransferPress) {
      this._manufacturingConfig._sheetMetalConfig.stampingSubProcessFormAssignValue(manufactureInfo, this.conversionValue, this.isEnableUnitConversion);
      // manufactureInfo.noofStroke = 1;
      const calculatedRes = this._sheetMetalService.calculationForTransferPress(manufactureInfo, this.fieldColorsList, this.manufacturingObj);
      if (calculatedRes) {
        this._manufacturingConfig._sheetMetalConfig.stampingSubProcessFormPatchResults(calculatedRes, this.conversionValue, this.isEnableUnitConversion, this.subProcessFormArray);
        this.patchCalculationResult(calculatedRes);
      }
      // this.calculateTotalTon(manufactureInfo);
    } else if (this.processFlag.IsProcessTypeShearing) {
      this._manufacturingConfig._sheetMetalConfig.stampingSubProcessFormAssignValue(manufactureInfo, this.conversionValue, this.isEnableUnitConversion);
      // manufactureInfo.noofStroke = 1;
      const calculatedRes = this._sheetMetalService.calculationForShearing(manufactureInfo, this.fieldColorsList, this.manufacturingObj);
      if (calculatedRes) {
        this._manufacturingConfig._sheetMetalConfig.stampingSubProcessFormPatchResults(calculatedRes, this.conversionValue, this.isEnableUnitConversion, this.subProcessFormArray);
        this.patchCalculationResult(calculatedRes);
      }
      // this.calculateTotalTon(manufactureInfo);
      // } else if (this.processFlag.IsProcessTypeBending && this.bendingType.dedicated) {
      //   manufactureInfo.setUpTimeBatch = 60;
      //   this.patchCalculationResult(this._sheetMetalService.calculationForBending(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessTypeBending && (this.bendingType.soft || this.bendingType.dedicated)) {
      this.patchCalculationResult(this._sheetMetalService.calculationForSoftBending(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessTypeCutting) {
      this.patchCalculationResult(this._sheetMetalService.calculationForCutting(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessMoldSandMixingMachine) {
      this.patchCalculationResult(this._simulationService.doCostCalculationForMoldSandMixingMachine(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessCoreSandMixingMachine) {
      this.patchCalculationResult(this._simulationService.doCostCalculationForCoreSandMixingMachine(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (
      this.processFlag.IsProcessTypePlating ||
      this.processFlag.IsProcessTypePowderCoating ||
      this.processFlag.IsProcessTypePowderPainting ||
      this.processFlag.IsProcessTypeWetPainting ||
      this.processFlag.IsProcessTypeGalvanization ||
      this.processFlag.IsProcessTypeSiliconCoatingAuto ||
      this.processFlag.IsProcessTypeSiliconCoatingSemi
    ) {
      this.patchCalculationResult(this._simulationService._manufacturingPlatingCalcService.calculationsForPlating(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsMetalTubeExtrusion || this.processFlag.IsMetalExtrusion) {
      this._manufacturingMapper._metalExtrusionMapper.manufacturingMetalExtrusionFormAssignValue(
        manufactureInfo,
        this.getFormGroup(FormGroupKeys.MetalExtrusion).controls,
        this.conversionValue,
        this.isEnableUnitConversion
      );
      this._manufacturingMapper._metalExtrusionMapper.manufacturingMetalExtrusionDirtyCheck(manufactureInfo, this.getFormGroup(FormGroupKeys.MetalExtrusion).controls);
      this.processFlag.IsMetalTubeExtrusion &&
        this.patchCalculationResult(
          this._simulationService._manufacturingMetalExtrusionCalService.doCostCalculationsForMetalTubeExtrusion(manufactureInfo, this.fieldColorsList, this.manufacturingObj)
        );
      this.processFlag.IsMetalExtrusion &&
        this.patchCalculationResult(this._simulationService._manufacturingMetalExtrusionCalService.doCostCalculationsForMetalExtrusion(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessTypeThermoForming) {
      this.patchCalculationResult(this._plasticRubberService.doCostCalculationForThermoForming(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessPlasticVacuumForming) {
      this.patchCalculationResult(this._plasticRubberService.doCostCalculationForVacuumForming(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessWiringHarness) {
      this._manufacturingMapper._wiringHarnessMapper.manufacturingFormSubmitPayLoad(this.getFormGroup(FormGroupKeys.WiringHarness).controls);
      // this._manufacturingMapper._wiringHarnessMapper.manufacturingDirtyCheck(manufactureInfo, this.getFormGroup(FormGroupKeys.WiringHarness).controls);
      this.patchCalculationResult(this._simulationService._manufacturingWiringHarnessCalService.doCostCalculationForWiringHarness(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessTypeStitching) {
      this._manufacturingConfig._assembly.assemblyofConnectorMapper(manufactureInfo, this.costingManufacturingInfoform);
      this.patchCalculationResult(
        this._simulationService._manufacturingAssemblyConnectorCalService.doCostCalculationForAssemblyConnectors(manufactureInfo, this.fieldColorsList, this.manufacturingObj)
      );
      // this.doCostCalculationForAssemblyOfConnector(manufactureInfo);
    } else if (this.processFlag.IsProcessTypeWireCuttingTermination) {
      this.doCostCalculationForWireCuttingTermination(manufactureInfo);
    } else if (
      this.processFlag.IsCustomCableDrawing ||
      this.processFlag.IsCustomCableAnnealing ||
      this.processFlag.IsCustomCableThinning ||
      this.processFlag.IsCustomCableTensionStreach ||
      this.processFlag.IsCustomCableExtruder ||
      this.processFlag.IsCustomCableDiameterControl ||
      this.processFlag.IsCustomCableCoreLayUp ||
      this.processFlag.IsCustomCableSheathing ||
      this.processFlag.IsCustomCableSparkTest ||
      this.processFlag.IsCustomCableCableMarking ||
      this.processFlag.IsCustomCableSpooler
    ) {
      this._manufacturingMapper._customCableMapper.manufacturingFormAssignValue(
        manufactureInfo,
        this.getFormGroup(FormGroupKeys.CustomCable).controls,
        this.defaultValues,
        this.conversionValue,
        this.isEnableUnitConversion
      );
      this._manufacturingMapper._customCableMapper.manufacturingDirtyCheck(manufactureInfo, this.getFormGroup(FormGroupKeys.CustomCable).controls);
      this.patchCalculationResult(this._customCableService.customCable(manufactureInfo, this.fieldColorsList, this.manufacturingObj, this.laborRateInfo));
    } else if (this.processFlag.IsProcessTypeRubberExtrusion || this.processFlag.IsProcessTypeRubberMaterialPreparation) {
      this.patchCalculationResult(this._plasticRubberService.calculationsForRubberExtrusion(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessTypeCompressionMaterialPreparation) {
      this.patchCalculationResult(this._plasticRubberService.calculationsForCompressionMaterialPreparation(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessTypeDeburring) {
      this.patchCalculationResult(this._plasticRubberService.calculationsForDeburring(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessTypeBlowMolding) {
      this.patchCalculationResult(this._plasticRubberService.calculationsForBlowMolding(manufactureInfo, this.fieldColorsList, this.manufacturingObj, this.currentPart));
    } else if (this.processFlag.IsProcessTypePassivation) {
      this.patchCalculationResult(this._plasticRubberService.calculationsForPassivation(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessDeflashing) {
      this.patchCalculationResult(this._plasticRubberService.calculationsForDeflashing(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessWeldingPreparation) {
      this.patchCalculationResult(this._weldingService.calculationsForWeldingPreparation(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessWeldingCleaning) {
      this.patchCalculationResult(this._weldingService.calculationsForWeldingCleaning(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    }
    //  else if (this.processFlag.IsProcessCleaningForging) {
    //   this.patchCalculationResult(this._simulationService._manufacturingCleaningForgingCalService.calculateCleaningForging(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    // }
    else if (this.processFlag.IsProcessAssembly) {
      this.calculateAssembly(manufactureInfo);
    } else if (this.processFlag.IsConventionalPCB) {
      this.patchCalculationResult(this._pcbCalculator.doCostCalculationForConventionalPCB(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsSemiRigidFlex) {
      this.patchCalculationResult(this._simulationService._manufacturingSemiRigidFlexCalService.doCostCalculationForSemiRigidFlex(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsManualDefalshing) {
      this.patchCalculationResult(this._plasticRubberService.calculationsForManualDeflashing(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsPostCuring) {
      this.patchCalculationResult(this._plasticRubberService.calculationsForPostCuring(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsPreform) {
      this.patchCalculationResult(this._plasticRubberService.calculationsForPreform(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsCasting) {
      this._manufacturingMapper._castingMapper.manufacturingFormAssignValue(
        manufactureInfo,
        this.getFormGroup(FormGroupKeys.Casting).controls,
        this.defaultValues,
        this.conversionValue,
        this.isEnableUnitConversion
      );
      this._manufacturingMapper._castingMapper.manufacturingDirtyCheck(manufactureInfo, this.getFormGroup(FormGroupKeys.Casting).controls);
      this.patchCalculationResult(this._simulationService._manufacturingCastingCalcService.doCostCalculationForCasting(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (this.processFlag.IsProcessTypeTesting) {
      this.patchCalculationResult(this._simulationService.calculationsForTesting(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    } else if (
      this.processFlag.IsProcessOthers ||
      this.processFlag.IsProcessManualInspection ||
      this.processFlag.IsRadiographyForCasting ||
      this.processFlag.IsProcessCMMInspection
      // || this.processFlag.IsProcessSawCutting
    ) {
      this.patchCalculationResult(this._simulationService.doCostCalculationForOthers(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
    }
  }

  doCostCalculationForWireCuttingTermination(manufactureInfo: ProcessInfoDto) {
    manufactureInfo.machineStrokes = this.costingManufacturingInfoform.controls['machineStrokes'].value;
    manufactureInfo.isMachineStrokesDirty = this.costingManufacturingInfoform.controls['machineStrokes'].dirty;
    this.patchCalculationResult(this._manufacturingWireCuttingTerminationCalService.doCostCalculationFormWireCuttingTermination(manufactureInfo, this.fieldColorsList, this.manufacturingObj));
  }

  doCostCalculationForMachiningTypes(manufactureInfo: ProcessInfoDto, fieldName: string) {
    manufactureInfo.machiningOperationTypeFormArray = this.machiningOperationTypeFormArray;
    // manufactureInfo.setUpTimeBatch = 60;

    for (let i = 0; i < manufactureInfo.machiningOperationTypeFormArray?.controls?.length; i++) {
      const info = manufactureInfo.machiningOperationTypeFormArray?.controls[i];
      (this.machiningOperationTypeFormArray.controls as FormGroup[])[i].patchValue({
        ...this._manufacturingConfig._machining.setMachiningSubProcess(this.selectedProcessInfoId, info?.value, this.conversionValue, this.isEnableUnitConversion, 'convertUomToSaveAndCalculation'),
      });
    }

    this.manufacturingObj.subProcessTypeInfos = manufactureInfo.machiningOperationTypeFormArray?.controls?.map((x) => x?.value);
    const result = this._simulationService._manufacturingMachiningCalcService.calculationForMachiningTypes(
      manufactureInfo,
      this.fieldColorsList,
      this.manufacturingObj,
      this.laborRateInfo,
      this.currentPart,
      fieldName
    );
    for (let i = 0; i < result?.machiningOperationTypeFormArray?.controls?.length; i++) {
      const info = result.subProcessTypeInfos[i];
      (this.machiningOperationTypeFormArray.controls as FormGroup[])[i].patchValue({
        totalElectricityConsumption: this.sharedService.isValidNumber(Number(result.totalElectricityConsumption)),
        //esgImpactElectricityConsumption: this.sharedService.isValidNumber(Number(result.esgImpactElectricityConsumption)),
        totalFactorySpaceRequired: this.sharedService.isValidNumber(Number(result.totalFactorySpaceRequired)),
        esgImpactFactoryImpact: this.sharedService.isValidNumber(Number(result.esgImpactFactoryImpact)),
        ...this._manufacturingConfig._machining.setMachiningSubProcess(this.selectedProcessInfoId, info, this.conversionValue, this.isEnableUnitConversion, 'convertUomInUI'),
      });
    }
    this.patchCalculationResult(result);
  }

  calculateAssembly(manufactureInfo: ProcessInfoDto) {
    const result = this._secondaryService.calculationForAssembly(manufactureInfo, this.fieldColorsList, this.manufacturingObj);
    // .pipe(takeUntil(this.unsubscribe$)).subscribe((result: any) => {
    if (result) {
      this.getFormGroup(FormGroupKeys.Assembly).patchValue({ subProcessList: result.subProcessFormArray });
      this.patchCalculationResult(result);
    }
    // });
  }
  // calculateColdDieForgingSubProcess(manufactureInfo: ProcessInfoDto) {
  //   manufactureInfo.subProcessFormArray = this.forgingSubProcessFormArray;
  //   manufactureInfo.setUpTimeBatch = 60;
  //   for (let i = 0; i < manufactureInfo.subProcessFormArray?.controls?.length; i++) {
  //     let info = manufactureInfo.subProcessFormArray?.controls[i];

  //     (this.forgingSubProcessFormArray.controls as FormGroup[])[i].patchValue({
  //       ...this._manufacturingConfig._manufacturingForgingSubProcessConfigService.setForgingSubProcess(this.selectedProcessInfoId, info?.value, this.conversionValue, this.isEnableUnitConversion, 'convertUomToSaveAndCalculation'),
  //     });
  //   }
  //   this._manufacturingForgingCalService.calculateColdCloseDieForging(manufactureInfo, this.fieldColorsList, this.manufacturingObj)
  //     .pipe(takeUntil(this.unsubscribe$)).subscribe((result: any) => {
  //       if (result) {
  //         for (let i = 0; i < result?.subProcessFormArray?.controls?.length; i++) {
  //           const info = result.subProcessFormArray?.controls[i];
  //           (this.forgingSubProcessFormArray.controls as FormGroup[])[i].patchValue({
  //             ...this._manufacturingConfig._manufacturingForgingSubProcessConfigService.setForgingSubProcess(this.selectedProcessInfoId, info?.value, this.conversionValue, this.isEnableUnitConversion, 'convertUomInUI'),
  //           });
  //         }
  //         //this.forgingSubProcessFormGroup.patchValue({ subProcessList: result.subProcessFormArray });
  //         this.forgingSubProcessFormGroup.setControl('subProcessList', result.subProcessFormArray);

  //         this.patchCalculationResult(result);

  //       }
  //     });
  // }

  // calculateTotalTon(manufactureInfo: ProcessInfoDto) {
  //   this._manufacturingConfig._sheetMetalConfig.stampingSubProcessFormAssignValue(manufactureInfo, this.conversionValue, this.isEnableUnitConversion);
  //   if (this.processFlag.IsProcessTypeStamping) {
  //     // manufactureInfo.noofStroke = 1;
  //     this._sheetMetalService.
  //       calculationForstampingStage(manufactureInfo, this.fieldColorsList, this.manufacturingObj)
  //       .pipe(takeUntil(this.unsubscribe$))
  //       .subscribe((result: any) => {
  //         if (result) {
  //           this._manufacturingConfig._sheetMetalConfig.stampingSubProcessFormPatchResults(result, this.conversionValue, this.isEnableUnitConversion, this.subProcessFormArray);
  //           this.patchCalculationResult(result);
  //         }
  //       });
  //   } else {
  //     this._sheetMetalService.calculationForstampingProgressive(manufactureInfo, this.fieldColorsList, this.manufacturingObj)
  //       .pipe(takeUntil(this.unsubscribe$)).subscribe((result: any) => {
  //         if (result) {
  //           this._manufacturingConfig._sheetMetalConfig.stampingSubProcessFormPatchResults(result, this.conversionValue, this.isEnableUnitConversion, this.subProcessFormArray);
  //           this.patchCalculationResult(result);
  //         }
  //       });
  //   }
  // }

  patchCalculationResult(result: ProcessInfoDto) {
    this._manufacturingMapper._sustainabilityMapper.manufacturingSustainabilityFormAssignValue(result, this.getFormGroup(FormGroupKeys.Sustainability).controls);
    this._manufacturingMapper._sustainabilityMapper.manufacturingSustainabilityDirtyCheck(result, this.getFormGroup(FormGroupKeys.Sustainability).controls);
    this._simulationService._manufacturingSustainabilityCalService.doCostCalculationsForSustainability(result, this.fieldColorsList, this.manufacturingObj, this.laborRateInfo);
    this.costingManufacturingInfoform.patchValue(this._manufacturingMapper.manufacturingFormPatchResults(result, this.conversionValue, this.isEnableUnitConversion));
    this.coreCycleTimeArray.controls.length = result?.coreCycleTimes.length;
    this.coreCycleTimeArray.controls.forEach((control, i) => control.setValue(result?.coreCycleTimes[i]));
  }

  getLaborRateBasedOnCountry(countryId: number, regionId?: number) {
    this.setLaborRateBasedOnCountry(countryId, regionId);
  }

  getLaborCountBasedOnCountry(countryId: number) {
    if (!this.isLaborCountLoadingProgress) {
      this.isLaborCountLoadingProgress = true;
      this.laborService
        .getLaborCountByCountry(countryId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((result: any) => {
          this.isLaborCountLoadingProgress = false;
          if (result) {
            this.laborCountByMachineType = result;
            this.calculateCost();
          }
        });
    }
  }

  setLaborRateBasedOnCountry(countryId?: number, regionId?: number, machineDescId?: number) {
    if (!this.part?.supplierInfoId) return;
    if (!this.laborRateLoadingProgress) {
      this.laborRateLoadingProgress = true;
      const month = this.currentMarketMonth ?? this.selectedProject?.marketMonth ?? this.sharedService.getMarketMonth(this.selectedProject.marketQuarter);
      this.digitalFactoryService
        .getLaborRateMasterByCountry({
          supplierId: this.part?.supplierInfoId,
          countryId: countryId || this.part?.mfrCountryId,
          regionId: regionId || this.part?.supplierRegionId,
          marketMonth: month,
          machineMasterId: this.machineMaster?.machineID || machineDescId,
        })
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((result: any) => {
          this.laborRateLoadingProgress = false;
          this.laborRateInfo = result;
          if (this.costingManufacturingInfoform && result?.length > 0) {
            const laborRateInfo = result[0];
            this.defaultValues.qaInspectorRate = Number(laborRateInfo.laborQualityCost);
            this.defaultValues.setuplaborRate = Number(laborRateInfo.laborSkilledCost);
            this.defaultValues.directLaborRate = Number(laborRateInfo.laborLowSkilledCost);
            const directlaborCount = this.machineMaster?.machineMarketDtos[0]?.noOfLowSkilledLabours || this.onMcAutomationChange();
            this.defaultValues.noOfDirectLabors = directlaborCount;
            if (!this.sharedService.checkDirtyProperty('noOfLowSkilledLabours', this.fieldColorsList)) {
              this.costingManufacturingInfoform.patchValue({
                noOfLowSkilledLabours: this.sharedService.isValidNumber(directlaborCount),
              });
            }
            if (!this.sharedService.checkDirtyProperty('lowSkilledLaborRatePerHour', this.fieldColorsList)) {
              this.costingManufacturingInfoform.patchValue({
                lowSkilledLaborRatePerHour: this.sharedService.isValidNumber(laborRateInfo.laborLowSkilledCost),
              });
            }
            if (!this.sharedService.checkDirtyProperty('qaOfInspectorRate', this.fieldColorsList)) {
              this.costingManufacturingInfoform.patchValue({
                qaOfInspectorRate: this.sharedService.isValidNumber(laborRateInfo.laborQualityCost),
              });
            }
            if (!this.sharedService.checkDirtyProperty('skilledLaborRatePerHour', this.fieldColorsList)) {
              this.costingManufacturingInfoform.patchValue({
                skilledLaborRatePerHour: this.sharedService.isValidNumber(laborRateInfo.laborSkilledCost),
              });
            }

            !this.processFlag.IsCasting && (this.defaultValues.noOfDirectLabors = directlaborCount);
            if (
              !(
                this.processFlag.IsProcessTypeCutting ||
                this.processFlag.IsProcessTypeBending ||
                this.processFlag.IsProcessTypeStampingProgressive ||
                this.processFlag.IsProcessTypeStamping ||
                this.processFlag.IsProcessTypeInjectionMolding ||
                this.processFlag.IsProcessTypeRubberInjectionMolding ||
                this.processFlag.IsProcessPlasticVacuumForming ||
                this.processFlag.IsProcessTypeThermoForming ||
                this.processFlag.IsProcessTypeWelding ||
                this.processFlag.IsProcessWiringHarness
              )
            ) {
              // this.costingManufacturingInfoform.patchValue({
              //   lowSkilledLaborRatePerHour: this.sharedService.isValidNumber(laborRateInfo.laborLowSkilledCost),
              //   skilledLaborRatePerHour: this.sharedService.isValidNumber(laborRateInfo.laborSkilledCost),
              //   qaOfInspectorRate: this.sharedService.isValidNumber(laborRateInfo.laborQualityCost),
              //   noOfLowSkilledLabours: this.sharedService.isValidNumber(this.machineMaster?.machineMarketDtos[0]?.noOfLowSkilledLabours),
              // });
              if (this.processFlag.IsProcessTypeWelding) {
                this.costingManufacturingInfoform.patchValue({
                  lowSkilledLaborRatePerHour: this.sharedService.isValidNumber(laborRateInfo.laborSpecialSkilledCost),
                });
              }
            } else if (this.processFlag.IsProcessFinalInspection) {
              this.costingManufacturingInfoform.patchValue({
                qaOfInspectorRate: this.sharedService.isValidNumber(laborRateInfo.laborQualityCost),
              });
            }
            if (this.processFlag.IsProcessWiringHarness && !this.processFlag.IsProcessFinalInspection) {
              this.costingManufacturingInfoform.patchValue({
                qaOfInspectorRate: 0,
              });
            }

            if (this.processFlag.IsProcessMigWelding || this.processFlag.IsProcessMigWelding) {
              this.defaultValues.directLaborRate = Number(this.laborRateInfo[0].laborSpecialSkilledCost);
            }
            this._manufacturingHelperService.setLaborRateBasedOnCountrySetValue(
              this.costingManufacturingInfoform.controls,
              this.fieldColorsList,
              laborRateInfo,
              this.currentPart.commodityId,
              this.processFlag,
              this.machineMaster
            );
            // }
          } else if (this.currentPart?.mfrCountryId) {
            // if (this.currentPart?.mfrCountryId) {
            this.getLaborRateBasedOnCountry(this.currentPart?.mfrCountryId, this.currentPart?.supplierRegionId);
            this.getLaborCountBasedOnCountry(this.currentPart?.mfrCountryId);
            // }
          }
          if (this.costingManufacturingInfoform) {
            if (this.processFlag.IsVisualInspection && !this.processFlag.IsMetalTubeExtrusion && !this.processFlag.IsMetalExtrusion) {
              this.costingManufacturingInfoform.patchValue({ lowSkilledLaborRatePerHour: 0, skilledLaborRatePerHour: 0, directLaborCost: 0, directSetUpCost: 0, cycleTime: 0 });
            } else if (this.processFlag.IsProcessElectronics || this.processFlag.IsConventionalPCB) {
              this.costingManufacturingInfoform.patchValue({ qaOfInspectorRate: 0, samplingRate: 0 });
            } else if (this.processFlag.IsProcessCustomCable) {
              this.costingManufacturingInfoform.controls['qaOfInspectorRate'].setValue(0);
            } else if (this.processFlag.IsProcessWiringHarness) {
              if (this.processFlag.IsProcessFinalInspection) {
                this.costingManufacturingInfoform.patchValue({
                  samplingRate: 0,
                  lowSkilledLaborRatePerHour: 0,
                  skilledLaborRatePerHour: 0,
                });
                this.defaultValues.samplingRate = 0;
              } else {
                this.costingManufacturingInfoform.patchValue({ qaOfInspectorRate: 0, samplingRate: 0 });
                this.defaultValues.samplingRate = 0;
                this.defaultValues.qaInspectorRate = 0;
              }
            }
            //this.calculateCost();
            this.sharedService
              .getColorInfos(this.currentPart?.partInfoId, ScreeName.Manufacturing, this.selectedProcessInfoId)
              .pipe(
                takeUntil(this.unsubscribe$),
                filter((result) => !!result)
              )
              .subscribe((result: FieldColorsDto[]) => {
                this.fieldColorsList = result;
                this.calculateCost();
              });
          }
        });
    }
  }

  calculateSamplingRate() {
    const lotSize = this.currentPart?.lotSize ? this.currentPart?.lotSize : 0;
    if (this.samplingData?.samplingProcedureId > 0) {
      this.setSamplingData(this.samplingData);
    } else {
      if (this.currentPart?.lotSize > 0 && this.samplingRates?.length > 0) {
        this.samplingData = this.samplingRates.find((x) => x.batchSizeFrom <= lotSize && x.batchSizeTo >= lotSize);
        this.setSamplingData(this.samplingData);
      }
    }
  }

  setSamplingData(data: SamplingRate) {
    if (
      (!this.processFlag.IsCasting || this.processFlag.IsSecondaryProcess || this.processFlag.IsProcessMachining) &&
      !this.processFlag.IsProcessTypeStitching &&
      !this.processFlag.IsProcessElectronics &&
      !this.processFlag.IsProcessTypeWelding &&
      !this.processFlag.IsProcessTypeCutting &&
      !this.processFlag.IsProcessTypeStamping &&
      !this.processFlag.IsProcessCleaningForging &&
      !this.processFlag.IsProcessBilletHeatingForging &&
      !this.processFlag.IsProcessTypeStampingProgressive &&
      !this.processFlag.IsProcessTypeTPP &&
      !this.processFlag.IsProcessTypeBending &&
      !this.processFlag.IsProcessForming &&
      !this.processFlag.IsProcessDrawing &&
      !this.processFlag.IsProcessAssembly &&
      !this.processFlag.IsProcessTypeTransferPress &&
      !this.processFlag.IsProcessTypeShearing
    ) {
      this._manufacturingHelperService.setSamplingDataValues(this.costingManufacturingInfoform, this.currentPart?.lotSize, this.defaultValues, data, this.fieldColorsList, this.manufacturingObj);
    } else if (this.processFlag.IsProcessTypeStitching) {
      this._manufacturingHelperService.setSamplingDataValuesForStitching(this.costingManufacturingInfoform, this.defaultValues, this.currentPart?.lotSize, data);
    } else if (this.processFlag.IsProcessElectronics || this.processFlag.IsProcessWiringHarness) {
      this.costingManufacturingInfoform.controls['samplingRate'].setValue(0);
    }
  }

  onEditRowClick(machineInfo: ProcessInfoDto) {
    this.reset();
    this.clearProcessTypeFlags();
    this.machineMaster = undefined;
    this.machineTypeDescription.set([]);
    this.onEditClick(machineInfo, true);
  }

  onEditClick(machineInfo: ProcessInfoDto, loaderEnable = false) {
    this.collapsedSections = this.subProcessFormArray?.controls?.map(() => true);
    this.processInfoDtoOut.emit(machineInfo);
    this.listProcessInfoDtoOut.emit(this.machineInfoList);
    this.laborRateInfoDtoOut.emit(this.laborRateInfo);
    this.costLoaders = loaderEnable;
    const obj = Object.assign({}, machineInfo);
    this.selectedProcessInfoId = obj.processInfoId;
    this.formIdentifier = { ...this.formIdentifier, primaryId: this.selectedProcessInfoId };
    this.manufacturingObj = { ...machineInfo };
    this.tmpprocessInfoId = machineInfo.processInfoId;
    // this.defaultValues.machineHourRate = machineInfo.machineHourRate;
    const primaryProcessId = Number(this.materialInfoList[0]?.processId);
    let corePrepSubProcessIds: number[] = [];
    if (machineInfo?.processTypeID) {
      if (this.processFlag.IsCasting && machineInfo?.processTypeID === ProcessType.CastingCorePreparation && this.isNewProcessAdded) {
        corePrepSubProcessIds = this.machineInfoList?.filter((x) => x.processTypeID === ProcessType.CastingCorePreparation).map((x) => x.subProcessTypeID) || [];
      }
      this._manufacturingHelperService.setSubProcessList(machineInfo?.processTypeID, primaryProcessId, this.materialInfoList, corePrepSubProcessIds).subscribe((subProcessList) => {
        this.subProcessNamesList = subProcessList;
      });
      if (machineInfo.processTypeID === ProcessType.SawCutting) {
        this.costingManufacturingInfoform.controls['processTypeID'].setValue(machineInfo?.processTypeID);
        this.costingManufacturingInfoform.controls['subProcessTypeID'].setValue(machineInfo?.subProcessTypeID);
        this.costingManufacturingInfoform.controls['noOfBends'].setValue(machineInfo?.noOfbends);
      }
      // if (this.processFlag.IsCasting && this.materialInfoList.length > 0) {
      //   machineInfo = { ...machineInfo, machineCapacity: this.sharedService.isValidNumber(Number(machineInfo.machcineCapacity) / Number(this.materialInfoList[0]?.density)) };
      // }
      if (this._harnessConfig.harnessTypes.includes(machineInfo?.processTypeID)) {
        const subprocessId = Number(machineInfo?.subProcessTypeInfos?.length > 0 ? machineInfo?.subProcessTypeInfos[0]?.subProcessTypeId : 0);
        this.getMachines(machineInfo?.processTypeID, true, machineInfo, subprocessId);
      } else {
        this.getMachines(machineInfo?.processTypeID, true, machineInfo);
      }
    } else {
      this.costLoaders = false;
      this.setEditCallMethod(machineInfo);
    }
  }

  public setEditCallMethod(machineInfo: ProcessInfoDto): ProcessInfoDto {
    let obj = Object.assign({}, machineInfo);
    obj.processInfoList = this.machineInfoList;
    obj.materialInfoList = this.materialInfoList;
    if (this.forging.cutting) {
      this.forgingCutting.bandSawCutting = machineInfo?.subProcessTypeID === ForgingCutting.BandSawCutting;
      this.forgingCutting.stockShearing = machineInfo?.subProcessTypeID === ForgingCutting.StockShearing;
    }
    if (this.forging.shotBlasting) {
      this.isConveyourTypeOfOperation = machineInfo?.subProcessTypeID === ForgingShotBlasting.ConveyourTypeLoading;
    }
    // if (this.forging.cutting && this.forgingCutting.bandSawCutting) {
    // if (this.forging.cutting && (this.forgingCutting.bandSawCutting || this.forgingCutting.stockShearing)) {
    //   obj.setUpTimeBatch = 30;
    //   obj.noOfParts ||= 1;
    //   obj.lotSize ||= this.currentPart?.lotSize || 1;
    //   obj = this._manufacturingForgingCalService.calculateForgingSawCuttingAndShearing(obj, this.fieldColorsList, this.manufacturingObj);
    // }
    // if ([ProcessType.FinalInspection].includes(machineInfo?.processTypeID) && machineInfo?.subProcessTypeInfos?.length > 0) {
    //   this.processFlag.IsVisualInspection = machineInfo?.subProcessTypeInfos[0]?.subProcessTypeId === FinalInspectionTypes.VisualInspection;
    // }
    const flags = {
      IsProcessTypeTesting: this.processFlag.IsProcessTypeTesting,
      IsCasting: this.processFlag.IsCasting,
      IsVisualInspection: !this.processFlag.IsMetalTubeExtrusion && this.processFlag.IsVisualInspection,
    };
    // this.costingManufacturingInfoform.patchValue(this._manufacturingConfig.manufacturingFormPatch(obj, this.conversionValue, this.isEnableUnitConversion, machineInfo, flags));
    this.costingManufacturingInfoform.patchValue(
      this._manufacturingMapper.manufacturingFormPatch(obj, this.conversionValue, this.isEnableUnitConversion, machineInfo, flags, this.currentPart, this.processFlag)
    );
    if (this.processFlag.IsCasting && machineInfo?.processTypeID === ProcessType.CastingCorePreparation) {
      this.isNewProcessAdded = this.costingManufacturingInfoform.controls['subProcessTypeID'].value > 0 ? false : true;
    }
    if (this.processFlag.IsProcessAssembly) {
      this.getFormArray(FormGroupKeys.Assembly).clear();
      this._manufacturingConfig._assembly.setAssemblySubProcess(machineInfo, this.getFormArray(FormGroupKeys.Assembly));
    } else if (this.processFlag.IsProcessElectronics) {
      this.getFormArray(FormGroupKeys.Electronics).clear();
      if (machineInfo?.subProcessTypeInfos?.length > 0) {
        this.getFormArray(FormGroupKeys.Electronics).push(this._manufacturingConfig._electronics.setElectronicsSubprocess(machineInfo)?.controls[0]);
      }
    }
    // this.forgingSetEditCallMethod(machineInfo);
    this._manufacturingConfig._manufacturingForgingSubProcessConfigService.forgingSetEditCallMethod(
      machineInfo,
      this.forging.coldForgingClosedDieCold,
      this.getFormArray(FormGroupKeys.ForgingSubProcess),
      this.selectedProcessInfoId,
      this.conversionValue,
      this.isEnableUnitConversion
    );
    if (this.processFlag.IsNoBakeCasting && obj.processTypeID == ProcessType.CastingCoreAssembly) {
      const matCore = this.materialInfoList.filter((rec) => rec.secondaryProcessId === 2)[0] || null;
      const noOfCores = !!matCore && matCore?.coreCostDetails.length > 0 ? matCore?.coreCostDetails.reduce((currentVal, currentRec) => currentVal + currentRec.noOfCore, 0) : 0;
      this.costingManufacturingInfoform.patchValue({
        noOfCore: noOfCores,
      });
    }
    // (this.processFlag.IsGreenCasting && obj.processTypeID == ProcessType.MoldPerparation) && this.setMoldPreparationData();
    if (this.processFlag.IsGreenCasting && obj.processTypeID == ProcessType.MoldPerparation) {
      // const moldData = this.costManufacturingAutomationService.setMoldPreparationData(this.materialInfoList);
      // this.getFormGroup(FormGroupKeys.Casting).patchValue({
      //   tableSizeRequired: `${moldData.moldBoxLength} x ${moldData.moldBoxWidth}`,
      // });
      this._manufacturingMapper._castingMapper.setMoldPreparationData(this.materialInfoList, this.costingManufacturingInfoform.get(FormGroupKeys.Casting));
      // } else if ([ProcessType.TurningCenter, ProcessType.MillingCenter].includes(obj.processTypeID) && this.materialInfoList?.length > 0) {
      //   this.costingManufacturingInfoform.controls['tableSizeRequired'].setValue(
      //     this.sharedService.isValidNumber(this.materialInfoList[0]?.stockDiameter) + ', ' + this.sharedService.isValidNumber(this.materialInfoList[0]?.stockLength)
      //   );
    }
    const processHpdc = Array.isArray(obj.processInfoList) ? obj.processInfoList.find((rec) => rec.processTypeID === ProcessType.HighPressureDieCasting) : { newToolingRequired: true };
    if (this.processFlag.IsHPDCCasting && obj.processTypeID == ProcessType.TrimmingPress && !processHpdc.newToolingRequired) {
      this.costingManufacturingInfoform.get('newToolingRequired')?.disable();
      this.costingManufacturingInfoform.patchValue({ newToolingRequired: false });
    } else {
      this.costingManufacturingInfoform.get('newToolingRequired')?.enable();
    }
    if (obj.processTypeID == ProcessType.CastingCorePreparation && !!obj?.coreCycleTimes) {
      this.coreCycleTimeArray.clear();
      obj.coreCycleTimes?.split(',').forEach((coreCycleTime) => {
        this.coreCycleTimeArray.push(this._fb.control(coreCycleTime));
      });
    }
    if (obj.processTypeID == ProcessType.Bending) {
      this.bendingType.soft = obj.moldTemp === BendingToolTypes.Soft;
      this.bendingType.dedicated = obj.moldTemp === BendingToolTypes.Dedicated;
      if ([0, undefined].includes(obj.moldTemp)) {
        this.bendingType.soft = true;
        this.costingManufacturingInfoform.patchValue({ moldTemp: BendingToolTypes.Soft });
      }
    }
    // this.isCT1detailsDisplay = true;
    // this.isCT2detailsDisplay = true;
    this.machiningOperationTypeFormArray.length > 0 && this.machiningOperationTypeFormArray.clear();
    if (
      machineInfo?.processTypeID &&
      (this.processFlag.IsProcessTypeStampingProgressive ||
        this.processFlag.IsProcessTypeStamping ||
        this.processFlag.IsProcessWiringHarness ||
        this.processFlag.IsConventionalPCB ||
        this.processFlag.IsProcessTypeTransferPress ||
        this.processFlag.IsProcessTypeShearing ||
        this.processFlag.IsProcessMigWelding ||
        this.processFlag.IsProcessTigWelding)
    ) {
      this.subProcessFormArray.length > 0 && this.subProcessFormArray.clear();
      if (machineInfo?.subProcessTypeInfos) {
        for (let i = 0; i < machineInfo?.subProcessTypeInfos?.length; i++) {
          const info = machineInfo?.subProcessTypeInfos[i];
          const formGroup = this._manufacturingConfig.onSubProcessEditCall(info, this.selectedProcessInfoId, this.conversionValue, this.isEnableUnitConversion);
          this.subProcessFormArray.push(formGroup);
          if (info?.additionalLengthArray) {
            const additionalLengthInfo = info?.additionalLengthArray?.split(',');
            if (additionalLengthInfo && additionalLengthInfo?.length > 0) {
              this.getCableLengthArray(i).clear();
              for (let index = 0; index < additionalLengthInfo?.length; index++) {
                this.getCableLengthArray(i).push(this._fb.control(+additionalLengthInfo[index]));
              }
            }
          }
        }
        this.collapsedSections = this.subProcessFormArray?.controls.map(() => true);
        if (this.processFlag.IsProcessWiringHarness) {
          this.onChangeHarnessSubProcess(machineInfo?.subProcessTypeInfos[0]?.subProcessTypeId);
        }
      } else {
        this.subProcessFormArray.length == 0 &&
          this.subProcessFormArray.push(this._manufacturingConfig.manufactureFormGroup(this.selectedProcessInfoId, this.conversionValue, this.isEnableUnitConversion));
      }
    }
    // TODO: Move patch mapping service
    if (this.subProcessFormArray.length > 0 && this.subProcessNamesList?.length > 0 && this.processFlag.IsProcessTypeStamping) {
      let subProcessGrp = this.subProcessNamesList?.find((p) => p.id === this.manufacturingObj.subProcessTypeInfos[0].subProcessTypeId)?.name;
      subProcessGrp = subProcessGrp === 'Compound' ? 'Blanking & Piercing' : subProcessGrp;
      this.costingManufacturingInfoform.patchValue({ featureDetails: subProcessGrp || '' });
    }
    if (machineInfo?.processTypeID && machineInfo?.subProcessTypeInfos && this.processFlag.IsProcessMachining) {
      this.setOperationType(this.costingManufacturingInfoform.controls['processTypeID'].value, true);
      for (let i = 0; i < machineInfo?.subProcessTypeInfos?.length; i++) {
        const info = machineInfo?.subProcessTypeInfos[i];
        const formGroup = this._fb.group({
          ...this._manufacturingConfig._machining.getMachiningOperationFormFields(this.selectedProcessInfoId),
          subProcessInfoId: info.subProcessInfoId,
          ...this._manufacturingConfig._machining.setMachiningSubProcess(this.selectedProcessInfoId, info, this.conversionValue, this.isEnableUnitConversion, 'convertUomInUI'),
          ...this._manufacturingConfig._machining.getOperationFlags(obj.processTypeID, info?.operationTypeId),
        });
        this.machiningOperationTypeFormArray.push(formGroup);
        this.showAddProcessButton(Number(this.costingManufacturingInfoform.controls['processTypeID'].value), info?.operationTypeId, i, true);
      }
    }
    const newMachineInfo = {
      ...machineInfo,
      machineMarket: this.machineMaster?.machineMarketDtos[0],
      machineMaster: this.machineMaster,
      mfrCountryId: this.currentPart.mfrCountryId,
      countryList: this.countryList,
    };
    //machineInfo.machineMarket = this.machineMaster?.machineMarketDtos[0];
    // machineInfo.machineMaster = this.machineMaster;
    // machineInfo.mfrCountryId = this.currentPart.mfrCountryId;
    //machineInfo.countryList = this.countryList;
    this.processInfoDtoOut.emit(machineInfo);
    this.listProcessInfoDtoOut.emit(this.machineInfoList);
    this.laborRateInfoDtoOut.emit(this.laborRateInfo);
    // setTimeout(() => {
    this.costingManufacturingInfoform.controls['processTypeID'].setValue(machineInfo?.processTypeID);
    this.getColorInfo();
    // }, 1000);
    // this.setEditCall$(newMachineInfo).subscribe();
    return newMachineInfo;
  }

  public onFormSubmit(isPartial = false, isPageLoad = false): Observable<ProcessInfoDto> {
    this.tmpprocessInfoId = 0;
    this.isPageLoad = isPageLoad;
    let model = new ProcessInfoDto();
    const flags = { isPartial, IsProcessMilling: this.MachiningFlags.isMilling, IsProcessDrilling: this.processFlag.IsProcessDrilling };
    const materialInfo = this.materialInfoList && this.materialInfoList?.length > 0 ? this.materialInfoList[0] : null;
    const machineId = this.costingManufacturingInfoform.controls['machineId'].value || 0;
    const machineMaster = this.machineTypeDescription().find((x) => x.machineID == machineId);
    const machineMarketId = machineMaster?.machineMarketDtos[0].machineMarketID;
    model = this._manufacturingMapper.manufacturingFormSubmit(
      this.costingManufacturingInfoform.controls,
      this.conversionValue,
      this.isEnableUnitConversion,
      flags,
      this.currentPart.partInfoId,
      materialInfo,
      machineMarketId
    );
    if (this.processFlag.IsProcessElectronics) {
      model = {
        ...model,
        ...this._manufacturingConfig._electronics.electronicsProcessPayload(this.getFormGroup(FormGroupKeys.Electronics).controls),
      };
    }
    // if (this.forging.coldForgingClosedDieCold) {
    //   model = { ...model, ...this._manufacturingForgingSubProcessConfigService.forgingProcessPayload(this.forgingSubProcessFormGroup.controls, this.conversionValue, this.isEnableUnitConversion) };
    // }
    if (this.processFlag.IsCorePreparationForCasting) {
      model.coreCycleTimes = this.coreCycleTimeArray.value.join(',');
    }
    if (
      this.processFlag.IsProcessTypeStampingProgressive ||
      this.processFlag.IsProcessTypeStamping ||
      this.processFlag.IsProcessWiringHarness ||
      this.processFlag.IsConventionalPCB ||
      this.processFlag.IsProcessTypeTransferPress ||
      this.processFlag.IsProcessTypeShearing ||
      this.processFlag.IsProcessMigWelding ||
      this.processFlag.IsProcessTigWelding
    ) {
      this._manufacturingConfig.addSubProcess(model, this.subProcessFormArray, this.conversionValue, this.isEnableUnitConversion);
    } else if (this.processFlag.IsProcessAssembly || this.processFlag.IsProcessElectronics) {
      const subProcessFormArray = this.processFlag.IsProcessAssembly
        ? (this.getFormGroup(FormGroupKeys.Assembly).controls['subProcessList'] as FormArray)
        : (this.getFormGroup(FormGroupKeys.Electronics).controls['subProcessList'] as FormArray);
      this._manufacturingConfig.addSubProcess(model, subProcessFormArray, this.conversionValue, this.isEnableUnitConversion, true);
    }
    // if (this.processFlag.IsProcessWiringHarness && (model.subProcessTypeInfos === undefined)) {
    //   this.messaging.openSnackBar(`Please Add Atleast One SubProcess.`, '', { verticalPosition: "top" }, [''], true);
    // }
    if (this.processFlag.IsProcessMachining) {
      model.processTypeID = this.costingManufacturingInfoform.controls['processTypeID'].value;
      // model = { ...model, ...this._manufacturingConfig._machining.manufacturingMachiningFormSubmitPayLoad(this.machiningFormGroup.controls, this.conversionValue, this.isEnableUnitConversion) }
      model = { ...model, ...this._manufacturingMapper._machiningMapper.manufacturingMachiningFormSubmitPayLoad(this.getFormGroup(FormGroupKeys.Machining).controls) };
      for (let i = 0; i < this.machiningOperationTypeFormArray?.controls?.length; i++) {
        const info = this.machiningOperationTypeFormArray?.controls[i];
        let subProcessInfo = new SubProcessTypeInfoDto();
        subProcessInfo.subProcessInfoId = 0;
        subProcessInfo = {
          ...subProcessInfo,
          ...this._manufacturingConfig._machining.setMachiningSubProcess(model.processInfoId, info?.value, this.conversionValue, this.isEnableUnitConversion, 'convertUomToSaveAndCalculation'),
        };
        if (model.subProcessTypeInfos == null) {
          model.subProcessTypeInfos = [];
        }
        model.subProcessTypeInfos.push(subProcessInfo);
      }
    } else if (this.processFlag.IsProcessCleaningForging) {
      model = {
        ...model,
        ...this._manufacturingMapper._cleaningForgingMapper.manufacturingCleaningForgingFormSubmitPayLoad(
          this.getFormGroup(FormGroupKeys.CleaningForging).controls,
          this.conversionValue,
          this.isEnableUnitConversion
        ),
      };
    } else if (this.processFlag.IsProcessBilletHeatingForging) {
      model = {
        ...model,
        ...this._manufacturingMapper._billetHeatingForgingMapper.manufacturingBilletHeatingForgingFormSubmitPayLoad(
          this.getFormGroup(FormGroupKeys.BilletHeatingForging).controls,
          this.conversionValue,
          this.isEnableUnitConversion
        ),
      };
    } else if (this.processFlag.IsProcessTrimmingHydraulicForging) {
      model = {
        ...model,
        ...this._manufacturingMapper._trimmingHydraulicForgingMapper.manufacturingTrimmingHydraulicForgingFormSubmitPayLoad(
          this.getFormGroup(FormGroupKeys.TrimmingHydraulicForging).controls,
          this.conversionValue,
          this.isEnableUnitConversion
        ),
      };
    } else if (this.processFlag.IsProcessStraighteningOptionalForging) {
      model = {
        ...model,
        ...this._manufacturingMapper._straighteningOptionalForgingMapper.manufacturingStraighteningOptionalForgingFormSubmitPayLoad(
          this.getFormGroup(FormGroupKeys.StraighteningOptionalForging).controls,
          this.conversionValue,
          this.isEnableUnitConversion
        ),
      };
    } else if (this.processFlag.IsProcessPiercingHydraulicForging) {
      model = {
        ...model,
        ...this._manufacturingMapper._piercingHydraulicForgingMapper.manufacturingPiercingHydraulicForgingFormSubmitPayLoad(
          this.getFormGroup(FormGroupKeys.PiercingHydraulicForging).controls,
          this.conversionValue,
          this.isEnableUnitConversion
        ),
      };
    } else if (this.processFlag.IsProcessTestingMpiForging) {
      model = {
        ...model,
        ...this._manufacturingMapper._testingMpiForgingMapper.manufacturingTestingMpiForgingFormSubmitPayLoad(
          this.getFormGroup(FormGroupKeys.TestingMpiForging).controls,
          this.conversionValue,
          this.isEnableUnitConversion
        ),
      };
    } else if (this.processFlag.IsProcessTubeBending) {
      // model.processTypeID = this.costingManufacturingInfoform.controls['processTypeID'].value;
      // model = { ...model, ...this._manufacturingConfig.tubeBendingConfig.manufacturingFormSubmitPayLoad(this.tubeBendingFormGroup.controls, this.conversionValue, this.isEnableUnitConversion) };
      model = {
        ...model,
        ...this._manufacturingMapper._tubeBendingMapper.manufacturingTubeBendingFormSubmitPayLoad(this.getFormGroup(FormGroupKeys.TubeBending).controls),
      };
    } else if (this.processFlag.IsInsulationJacket) {
      model = {
        ...model,
        ...this._manufacturingMapper.insulationJacketMapper.manufacturingInsulationJacketFormSubmitPayLoad(
          this.getFormGroup(FormGroupKeys.InsulationJacket).controls,
          this.conversionValue,
          this.isEnableUnitConversion
        ),
      };
    } else if (this.processFlag.IsProcessBrazing) {
      model = { ...model, ...this._manufacturingMapper._brazingMapper.manufacturingBrazingFormSubmitPayLoad(this.getFormGroup(FormGroupKeys.Brazing).controls) };
    } else if (this.processFlag.IsProcessCustomCable) {
      model = {
        ...model,
        ...this._manufacturingMapper._customCableMapper.manufacturingFormSubmitPayLoad(this.getFormGroup(FormGroupKeys.CustomCable).controls, this.conversionValue, this.isEnableUnitConversion),
      };
    } else if (this.processFlag.IsProcessWiringHarness) {
      model.subProcessTypeInfos = model?.subProcessTypeInfos?.filter((item) => item.subProcessTypeId > 0);
      model = {
        ...model,
        ...this._manufacturingMapper._wiringHarnessMapper.manufacturingFormSubmitPayLoad(this.getFormGroup(FormGroupKeys.WiringHarness).controls),
      };
    } else if (this.processFlag.IsCasting) {
      model = {
        ...model,
        ...this._manufacturingMapper._castingMapper.manufacturingFormSubmitPayLoad(this.getFormGroup(FormGroupKeys.Casting).controls, this.conversionValue, this.isEnableUnitConversion),
      };
      model.newToolingRequired = [ProcessType.HighPressureDieCasting, ProcessType.TrimmingPress, ProcessType.LowPressureDieCasting].includes(model.processTypeID) ? model.newToolingRequired : false;
    } else if (this.processFlag.IsMetalTubeExtrusion || this.processFlag.IsMetalExtrusion) {
      model = {
        ...model,
        ...this._manufacturingMapper._metalExtrusionMapper.manufacturingMetalExtrusionFormSubmitPayLoad(
          this.getFormGroup(FormGroupKeys.MetalExtrusion).controls,
          this.conversionValue,
          this.isEnableUnitConversion
        ),
      };
    } else if (this.processFlag.IsProcessPlasticTubeExtrusion || this.processFlag.IsProcessPlasticConvolutedTubeExtrusion) {
      model = {
        ...model,
        ...this._manufacturingMapper._plasticTubeExtrusionMapper.manufacturingPlasticTubeExtrusionFormSubmitPayLoad(this.getFormGroup(FormGroupKeys.PlasticTubeExtrusion).controls),
      };
    } else if (this.forging.coldForgingClosedDieCold) {
      // this.forgingSubProcessOnFormSubmit(model);
      this._manufacturingConfig._manufacturingForgingSubProcessConfigService.forgingSubProcessOnFormSubmit(
        model,
        this.forging,
        this.getFormGroup(FormGroupKeys.ForgingSubProcess),
        this.conversionValue,
        this.isEnableUnitConversion
      );
    } else {
      if (!(this.processFlag.IsProcessMigWelding || this.processFlag.IsProcessTigWelding)) {
        model.subProcessTypeInfos = model?.subProcessTypeInfos?.filter((item) => item.subProcessTypeId > 0); // for electronics
      }
    }

    model = {
      ...model,
      ...this._manufacturingMapper._sustainabilityMapper.manufacturingSustainabilityFormSubmitPayLoad(this.getFormGroup(FormGroupKeys.Sustainability).controls),
    };

    const machineType = new MedbMachineTypeMasterDto();
    const objmachineId = this.costingManufacturingInfoform.controls['machineId'].value || 0;
    const machineTypeObj = this.machineTypeDescription().find((x) => x.machineID == objmachineId);
    if (machineTypeObj) {
      machineType.machineType = machineTypeObj.machineMarketDtos?.length > 0 ? machineTypeObj?.machineMarketDtos[0].machineType : undefined;
      machineType.processTypeId = machineTypeObj?.machineMarketDtos.length > 0 ? machineTypeObj?.machineMarketDtos[0].processTypeId : undefined;
      model.machineType = machineType.machineType;
    } else {
      machineType.processTypeId = this.costingManufacturingInfoform.controls['processTypeID'].value || 0;
    }
    const machine = new MedbMachinesMasterDto();
    machine.machineMarketDtos = [new MachineMarketDto()];
    machine.machineMarketDtos[0].machineType = machineType.machineType;
    if (this.machineTypeDescription != null && model.machineMarketId != null && model.machineMarketId > 0) {
      const machineDesObj = this.machineTypeDescription().find((x) => x.machineMarketDtos[0].machineMarketID == model.machineMarketId);
      if (machineTypeObj) {
        machine.machineDescription = machineDesObj?.machineDescription;
        model.machineDescription = machineDesObj?.machineDescription;
      }
    }
    model.processType = this._manufacturingConfig.getProcessType(this.costingManufacturingInfoform.controls['processTypeID'].value || 0, this.processTypeOrginalList);
    model.dataCompletionPercentage = this.dataCompletionPercentage;
    const subprocessInfo = this.subProcessFormArray.value[0];
    if (subprocessInfo && this.machineInfoList?.length > 0) {
      this.machineInfoList.forEach((process) => {
        process?.subProcessTypeInfos &&
          process.subProcessTypeInfos.forEach((subprocess) => {
            if (subprocess?.subProcessInfoId === subprocessInfo?.subProcessInfoId && subprocess?.subProcessTypeId !== subprocessInfo?.subProcessTypeId && process?.costTooling?.toolingNameId) {
              const costTooling = new CostToolingDto();
              costTooling.toolingNameId = 0;
              model.costTooling = costTooling;
            }
          });
      });
    }
    this.doUpdateProcessInfoDispatch(model);

    return new Observable((obs) => {
      obs.next(model);
    });
  }

  doUpdateProcessInfoDispatch(model: ProcessInfoDto) {
    if (model.processInfoId > 0) {
      // this._store.dispatch(new ProcessInfoActions.UpdateProcessInfo(model));
      this.processInfoSignalService.updateProcessInfo(model);
      this.isNewProcessinfo = false;
      this.updateSaveProcessLoad(model.processInfoId);
      if (this.processFlag.IsCasting && this.processFlag.IsCorePreparationForCasting) {
        this.isNewProcessAdded = model.subProcessTypeID > 0 ? false : true;
      }
    } else {
      // this._store.dispatch(new ProcessInfoActions.CreateProcessInfo(model));
      this.processInfoSignalService.createProcessInfo(model);
      this.isNewProcessinfo = true;
      this.isNewProcessAdded = true;
    }
  }

  updateSaveProcessLoad(processInfoId: number) {
    if (!this.isPageLoad) {
      this.selectedProcessInfoId = processInfoId;
    } else {
      this.selectedProcessInfoId = 0;
    }
    this.formIdentifier = { ...this.formIdentifier, primaryId: this.selectedProcessInfoId };
    this.afterChange = false;
    this.dirtyCheckEvent.emit(this.afterChange);
    this.saveColoringInfo();
    if (!this.isNewProcessinfo) {
      this.messaging.openSnackBar(`Process Information has been updated successfully.`, '', { duration: 5000 });
    }
    this.navigatetoNextUrl();
  }

  private navigatetoNextUrl() {
    if (this.nexturltonavigate != '' && this.nexturltonavigate != undefined) {
      const tempUrl = this.nexturltonavigate + '?ignoreactivate=1';
      this.nexturltonavigate = '';
      this.router.navigateByUrl(tempUrl);
    }
  }

  setMachineForHarness(event: any) {
    const automationLevel = Number(event.currentTarget.value);
    const machineTypeMap = {
      [MachineType.Manual]: 'Manual',
      [MachineType.Automatic]: 'Automatic',
      [MachineType.SemiAuto]: 'Semi-Automatic',
    };
    const machineTypeToMap = machineTypeMap[automationLevel] || 0;
    const selectedMachine = this.machineTypeDescription()?.find((machine) => machine.machineMarketDtos?.some((market) => market.machineType === machineTypeToMap));
    this.processMachineMasterData(selectedMachine, false);
    this.costingManufacturingInfoform.controls['machineHourRate'].setValue(this.sharedService.isValidNumber(selectedMachine.machineHourRate));
    this.defaultValues.machineHourRate = this.sharedService.isValidNumber(selectedMachine.machineHourRate);
    this.setSelectedMachineDescription(selectedMachine);
    this.setLaborRateBasedOnCountry();
  }

  private saveColoringInfo() {
    const dirtyItems = [];
    this.fieldColorsList = [];
    if (this._manufacturingConfig.processFlagsForSaveColoring.some((flag) => this.processFlag[flag])) {
      const frm = this._manufacturingHelperService.getSubFormGroup(this.processFlag, this.getFormGroup.bind(this));
      if (frm) {
        for (const el in frm.controls) {
          if (frm.controls[el].dirty || frm.controls[el].touched) {
            const fieldColorsDto = this._manufacturingHelperService.saveColoringModel(frm, el, this.selectedProcessInfoId, this.currentPart.partInfoId);
            dirtyItems.push(fieldColorsDto);
          } else {
            // to update the main form group controls
            this.costingManufacturingInfoform.controls[el]?.markAsPristine();
            this.costingManufacturingInfoform.controls[el]?.markAsUntouched();
          }
        }
      }
    }

    const frmSustainability = this._manufacturingHelperService.getSubFormGroupSustainability(this.getFormGroup.bind(this));
    if (frmSustainability) {
      for (const el in frmSustainability.controls) {
        if (frmSustainability.controls[el].dirty || frmSustainability.controls[el].touched) {
          const fieldColorsDto = this._manufacturingHelperService.saveColoringModel(frmSustainability, el, this.selectedProcessInfoId, this.currentPart.partInfoId);
          dirtyItems.push(fieldColorsDto);
        }
        // else { // to update the main form group controls
        //   this.costingManufacturingInfoform.controls[el]?.markAsPristine();
        //   this.costingManufacturingInfoform.controls[el]?.markAsUntouched();
        // }
      }
    }

    // this.saveForgingSubProcessColorInfo(dirtyItems);
    this._manufacturingConfig._manufacturingForgingSubProcessConfigService.saveForgingSubProcessColorInfo(
      dirtyItems,
      this.forging.coldForgingClosedDieCold,
      this.getFormGroup(FormGroupKeys.ForgingSubProcess),
      this.currentPart,
      this.selectedProcessInfoId
    );
    for (const el in this.costingManufacturingInfoform.controls) {
      const control = this.costingManufacturingInfoform.controls[el];
      // push only if it was not pushed through sub forms
      if (!dirtyItems.find((x) => x.formControlName === el) && (control.dirty || control.touched) && ![null, '', undefined].includes(control?.value)) {
        const fieldColorsDto = this._manufacturingHelperService.saveColoringModel(this.costingManufacturingInfoform, el, this.selectedProcessInfoId, this.currentPart.partInfoId);
        dirtyItems.push(fieldColorsDto);
      }
    }

    if (this.subProcessFormArray?.length > 0) {
      this.subProcessFormArray.controls.forEach((element, index) => {
        const item = this.subProcessFormArray.at(index);
        if (item instanceof FormGroup) {
          for (const key in item.controls) {
            if (item.controls.hasOwnProperty(key)) {
              const control = item.get(key);
              if (control?.dirty || control?.touched) {
                const fieldColorsDto = new FieldColorsDto();
                fieldColorsDto.isDirty = control.dirty;
                fieldColorsDto.formControlName = key;
                fieldColorsDto.isTouched = control.touched;
                fieldColorsDto.partInfoId = this.currentPart?.partInfoId;
                fieldColorsDto.screenId = ScreeName.Manufacturing;
                fieldColorsDto.primaryId = this.selectedProcessInfoId;
                fieldColorsDto.subProcessIndex = index;
                dirtyItems.push(fieldColorsDto);
              }
            }
          }
        }
      });
    }

    if (dirtyItems.length > 0) {
      this.sharedService
        .updateColorInfo(dirtyItems)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((result) => {
          if (result) {
            this.fieldColorsList = result;
            result.forEach((element) => {
              // this._manufacturingHelperService.markFormGroupControls(element, this.processFlag, this.getFormGroup.bind(this));
              this._manufacturingHelperService.markFormGroupControls(element, this.processFlag, this.costingManufacturingInfoform);
            });
            // this.getForgingSubProcessColorInfo(result);
            this._manufacturingConfig._manufacturingForgingSubProcessConfigService.getForgingSubProcessColorInfo(
              result,
              this.forging.coldForgingClosedDieCold,
              this.getFormGroup(FormGroupKeys.ForgingSubProcess)
            );
          }
          this.afterChange = false;
          this.dirtyCheckEvent.emit(this.afterChange);
        });
    }
  }

  private getColorInfo() {
    this.fieldColorsList = [];
    if (this.selectedProcessInfoId > 0 && !this.colorInfoLoadingProgress) {
      this.colorInfoLoadingProgress = true;
      this.sharedService
        .getColorInfos(this.currentPart?.partInfoId, ScreeName.Manufacturing, this.selectedProcessInfoId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((result: FieldColorsDto[]) => {
          this.colorInfoLoadingProgress = false;
          if (result) {
            this.fieldColorsList = result;
            this.setLaborRateBasedOnCountry();
          }
          if (this.samplingData?.samplingProcedureId > 0) {
            this.setSamplingData(this.samplingData);
          }
          result?.forEach((element) => {
            if (element?.formControlName === 'coreCycleTimes') {
              this.coreCycleTimeArray.controls.forEach((control, i) => {
                if (element?.isTouched) {
                  this.coreCycleTimeArray.controls[i].markAsTouched();
                }
                if (element?.isDirty) {
                  this.coreCycleTimeArray.controls[i].markAsDirty();
                }
              });
            } else {
              // this._manufacturingHelperService.markFormGroupControls(element, this.processFlag, this.getFormGroup.bind(this));
              this._manufacturingHelperService.markFormGroupControls(element, this.processFlag, this.costingManufacturingInfoform);
            }
          });
          // this.getForgingSubProcessColorInfo(result);
          this._manufacturingConfig._manufacturingForgingSubProcessConfigService.getForgingSubProcessColorInfo(
            result,
            this.forging.coldForgingClosedDieCold,
            this.getFormGroup(FormGroupKeys.ForgingSubProcess)
          );
          this.processFlag.IsCasting && this.calculateCost(); // for casting only
          this.afterChange = false;
          this.dirtyCheckEvent.emit(this.afterChange);
        });
    }
  }

  setFormBasedOnSubProcessType(event: any, index: number) {
    const processType = Number(event.currentTarget.value);
    const bendWithLargerLength = this.sharedService.extractedProcessData?.ProcessBendingInfo?.sort((a, b) => b.Length - a.Length);
    const formingLargerLength = this.sharedService.extractedProcessData?.ProcessFormInfo?.sort((a, b) => b.FormArea - a.FormArea);
    const axisWiseLength = this._manufacturingConfig._sheetMetalConfig.getBendingEntriesSumByAxis().sort((a, b) => b.lengthSum - a.lengthSum);

    (this.subProcessFormArray.controls as FormGroup[])[index].patchValue(
      // {
      // isBlankingPunching: processType === StampingType.BlankingPunching,
      // isForming: processType === StampingType.Forming,
      // isDrawing: processType === StampingType.Drawing,
      // isBending: processType === StampingType.Bending,
      // isPiercing: processType === StampingType.Piercing,
      // isCoining: processType === StampingType.Coining,
      // isCompound: processType === StampingType.Compound,
      // isShallowDrawRect: processType === StampingType.ShallowDrawRect,
      // isRedrawRect: processType === StampingType.RedrawRect,
      // isShallowDrawCir: processType === StampingType.ShallowDrawCir,
      // isRedrawCir: processType === StampingType.RedrawCir,
      // isTrimming: processType === StampingType.Trimming,
      // recommendTonnage: 0,
      // formLength: formingLargerLength && formingLargerLength?.length > 0 ? formingLargerLength[0].FormLength : 0,
      // formHeight: formingLargerLength && formingLargerLength?.length > 0 ? formingLargerLength[0].FormHeight : 0,
      // hlFactor: this.sharedService.extractedProcessData?.LengthOfCut ? this.sharedService.extractedProcessData?.HlFactor : 0,
      // lengthOfCut:
      //   processType === StampingType.Piercing
      //     ? this.sharedService.convertUomInUI(this.sharedService.extractedProcessData?.InternalPerimeter ?? 0, this.conversionValue, this.isEnableUnitConversion)
      //     : processType === StampingType.BlankingPunching
      //       ? this.sharedService.convertUomInUI(this.sharedService.extractedProcessData?.ExternalPerimeter ?? 0, this.conversionValue, this.isEnableUnitConversion)
      //       : this.sharedService.convertUomInUI(this.sharedService.extractedProcessData?.LengthOfCut ?? 0, this.conversionValue, this.isEnableUnitConversion),
      // bendingLineLength:
      //   processType === StampingType.Bending
      //     ? axisWiseLength[0]?.lengthSum || 0
      //     : this.sharedService.convertUomInUI(bendWithLargerLength && bendWithLargerLength?.length > 0 ? bendWithLargerLength[0].Length : 0, this.conversionValue, this.isEnableUnitConversion),
      // shoulderWidth: this.sharedService.convertUomInUI(
      //   bendWithLargerLength && bendWithLargerLength?.length > 0 ? bendWithLargerLength[0].Width : 0,
      //   this.conversionValue,
      //   this.isEnableUnitConversion
      // ),
      // noOfBends: bendWithLargerLength && bendWithLargerLength?.length > 0 ? bendWithLargerLength[0].BendCount : 0,
      // formPerimeter: formingLargerLength && formingLargerLength?.length > 0 ? formingLargerLength[0].FormPerimeter : 0,
      // formingForce: 0,
      // blankArea: formingLargerLength && formingLargerLength?.length > 0 ? formingLargerLength[0].FormArea : 0,
      this._manufacturingHelperService.setFormSubProcessType(processType, formingLargerLength, bendWithLargerLength, axisWiseLength, this.conversionValue, this.isEnableUnitConversion)
      // }
    );

    this.calculateCost();
  }

  addMore() {
    const formGrp = (this.subProcessFormArray.controls as FormGroup[])[this.formAryLen - 1];
    if ((formGrp?.value && !!formGrp.value?.subProcessTypeID) || this.formAryLen === 0) {
      // this.subProcessFormArray.push(this.manufactureFormGroup());
      this.subProcessFormArray.push(this._manufacturingConfig.manufactureFormGroup(this.selectedProcessInfoId, this.conversionValue, this.isEnableUnitConversion));
    }
  }

  onDeleteSubProcess(index: number) {
    if (this.subProcessFormArray?.controls) {
      !this.processFlag.IsProcessWiringHarness && this.subProcessFormArray.controls.splice(index, 1);
      this.calculateCost();
      this.afterChange = true;
      this.dirtyCheckEvent.emit(this.afterChange);
    }
  }
  onChangeHarnessSubProcess(subrpocessId: number) {
    const primaryId = Number(this.costingManufacturingInfoform.controls['processTypeID'].value);
    this.getMachines(primaryId, false, null, Number(subrpocessId));
  }

  onWiringHarnessEmitterReceived(event: any) {
    const { type, data } = event;
    type === 'onMachineDescChange' && this.machineDescChange(data);
    type === 'onDeleteSubProcess' && this.onDeleteSubProcess(data);
    type === 'onChangeSubProcess' && this.onChangeHarnessSubProcess(data);
  }

  addMachiningOperation() {
    this.showAddProcessBtn = false;
    this.machiningOperationTypeFormArray.push(this._fb.group(this._manufacturingConfig._machining.getMachiningOperationFormFields(this.selectedProcessInfoId)));
  }

  deleteMachiningOperation(index: number = -1) {
    if (index === -1) {
      // clear all
      this.machiningOperationTypeFormArray.clear();
      this.costingManufacturingInfoform.controls['featureDetails'].setValue(JSON.stringify([]));
      this.addMachiningOperation();
    } else if (this.machiningOperationTypeFormArray?.controls) {
      let featureEntries: any[] = JSON.parse(this.costingManufacturingInfoform.controls['featureDetails']?.value || '[]');
      const delIndex = featureEntries.findIndex((x) => x.id === Number(this.machiningOperationTypeFormArray.controls[index].value.featureId));
      featureEntries = featureEntries.filter((item) => item.id !== delIndex);
      this.costingManufacturingInfoform.controls['featureDetails'].setValue(JSON.stringify(featureEntries));
      this.machiningOperationTypeFormArray.controls.splice(index, 1);
    }
    this.calculateCost();
    this.afterChange = true;
    this.dirtyCheckEvent.emit(this.afterChange);
  }
  setNumberOfTerminalCrimping(event: any, index: number) {
    const noOfCableColor = Number(event.currentTarget.value);
    (this.subProcessFormArray.controls as FormGroup[])[index].patchValue({ noOfBends: noOfCableColor / 2 });
  }

  getCableLengthArray(index: number) {
    return (this.subProcessFormArray?.controls[index] as FormGroup<any>).get('cableLengthArray') as FormArray;
  }

  showinfo(filterValue: string) {
    let objdesc;
    if (this.lstdescriptions && this.lstdescriptions?.length > 0) {
      objdesc = this.lstdescriptions?.find((item: { id: string }) => item.id.toLowerCase() === filterValue.toLowerCase());
    }

    if (objdesc != null) {
      this.url = objdesc.imageUrl;
      // if (this.url != '') {
      //   this.show = true;
      // } else {
      //   this.show = false;
      // }
      this.show = this.url !== '';
      this.name = objdesc.descriptions?.replace(/\n/g, '<br>') || '';
    }
    //  this.popoverHook?.open();
  }

  setSelectedMachineDescription(medbMachine: MedbMachinesMasterDto) {
    if (!this.costingManufacturingInfoform) return;
    let machineId: number = medbMachine?.machineID || Number(this.costingManufacturingInfoform.controls['machineId'].value || 0);
    if (Number(this.costingManufacturingInfoform.controls['processTypeID'].value) === ProcessType.SawCutting && Number(this.costingManufacturingInfoform.controls['subProcessTypeID'].value) !== 0) {
      const subProcessTypeID = Number(this.costingManufacturingInfoform.controls['subProcessTypeID'].value);
      this.forgingCutting.bandSawCutting = subProcessTypeID === ForgingCutting.BandSawCutting;
      this.forgingCutting.stockShearing = subProcessTypeID === ForgingCutting.StockShearing;

      let machineData: MedbMachinesMasterDto[] = [];
      if (subProcessTypeID === 2) {
        const stockShearingMachines = this._manufacturingConfig._manufacturingForgingSubProcessConfigService.stockShearingMachines;
        machineData = this.fullMachineTypeDescription.filter((m) => stockShearingMachines.includes(m.machineName));
      }
      if (subProcessTypeID === 1) {
        const bandSawCuttingMachines = this._manufacturingConfig._manufacturingForgingSubProcessConfigService.bandSawCuttingMachines;
        machineData = this.fullMachineTypeDescription.filter((m) => bandSawCuttingMachines.includes(m.machineName));
      }
      this.machineTypeDescription.set(machineData);
      // machineId =
      //   this.machineTypeDescription().find((x) => x.workPieceMinOrMaxDia >= this.costingManufacturingInfoform.controls['recommendTonnage'].value)?.machineID ||
      //   this.machineTypeDescription()[0]?.machineID;
      // this.costingManufacturingInfoform.controls['semiAutoOrAuto'].setValue(2);
      // const machineMeDb = this.machineTypeDescription().find((x) => x.machineID == machineId);
      // const mhrValue = this.digitalFacotyHelper.calculateAndGetMhrValue(null, machineMeDb, this.laborRateInfo[0], this.countryList);
      // this.costingManufacturingInfoform.controls['machineHourRate'].setValue(mhrValue);
      // this.defaultValues.machineHourRate = mhrValue;
      // this.setLaborRateBasedOnCountry();
    }
    if (!machineId) {
      this.selectedMachineDescription = '';
      this.selectedWeldingCapacity = 0;
      return;
    }
    const machine = this.machineTypeDescription().find((x) => x.machineID == machineId);
    if (machine) {
      this.selectedMachineDescription = machine?.machineDescription;
      const weldingCapacity = machine?.machineDescription?.match(/\d+/g);
      this.selectedWeldingCapacity = weldingCapacity ? +weldingCapacity[weldingCapacity.length - 1] : 0;
      this.machineMaster = machine;
      this.defaultValues.machineEfficiency = machine?.machineMarketDtos.length > 0 ? machine?.machineMarketDtos[0].efficiency : 0;
      this.defaultValues.dryCycleTime = machine?.machineDryCycleTimeInSec;
      this.defaultValues.machineHourRate = machine?.machineHourRate;
      setTimeout(() => {
        this.costingManufacturingInfoform.controls['machineId'].setValue(machine?.machineID);
        if (!this.costingManufacturingInfoform.controls['semiAutoOrAuto'].dirty && !this.sharedService.checkDirtyProperty('semiAutoOrAuto', this.fieldColorsList)) {
          this.costingManufacturingInfoform.controls['semiAutoOrAuto'].setValue(this._manufacturingConfig.setMachineTypeIdByName(machine?.machineMarketDtos?.[0]?.machineType));
        }
      }, 1000);
    }
    // } else {
    //   this.selectedMachineDescription = '';
    //   this.selectedWeldingCapacity = 0;
    // }
    // }
  }

  setNewSelectedMachineDescription() {
    if (this.manufacturingObj) {
      const machineMarketId: number = Number(this.manufacturingObj.machineMarketId || 0);
      if (machineMarketId) {
        const machine = this.machineTypeDescription().find((x) => x.machineMarketDtos.find((y) => y.machineMarketID == machineMarketId));
        if (machine) {
          this.selectedMachineDescription = machine?.machineDescription;
          const weldingCapacity = machine?.machineDescription?.match(/\d+/g);
          this.selectedWeldingCapacity = weldingCapacity ? +weldingCapacity[weldingCapacity.length - 1] : 0;
          setTimeout(() => {
            this.costingManufacturingInfoform.controls['machineId'].setValue(machine?.machineID);
          }, 1000);
          this.machineMaster = machine;
          this.defaultValues.machineHourRate = this.machineMaster.machineHourRate;
          this.defaultValues.machineEfficiency = machine?.machineMarketDtos.length > 0 ? machine?.machineMarketDtos[0].efficiency : 0;
          this.defaultValues.dryCycleTime = machine?.machineDryCycleTimeInSec;
        } else if (this.manufacturingObj?.machineDescription) {
          const machineObj = this.machineTypeDescription().find((x) => x.machineDescription === this.manufacturingObj.machineDescription) || null;
          if (machineObj) {
            this.selectedMachineDescription = machineObj?.machineDescription;
            const weldingCapacity = machineObj?.machineDescription?.match(/\d+/g);
            this.selectedWeldingCapacity = weldingCapacity ? +weldingCapacity[weldingCapacity.length - 1] : 0;
            setTimeout(() => {
              this.costingManufacturingInfoform.controls['machineId'].setValue(machineObj?.machineID);
            }, 1000);
            this.machineMaster = machineObj;
            // this.manufacturingObj.machineMarketId = this.machineMaster?.machineMarketDtos[0].machineMarketID;
            this.manufacturingObj = {
              ...this.manufacturingObj,
              machineMarketId: this.machineMaster?.machineMarketDtos[0].machineMarketID,
              machineMarket: this.machineMaster?.machineMarketDtos[0],
            };
            this.defaultValues.machineEfficiency = machineObj?.machineMarketDtos.length > 0 ? machineObj?.machineMarketDtos[0].efficiency : 0;
            this.defaultValues.dryCycleTime = machineObj?.machineDryCycleTimeInSec;
          }
        }
      } else {
        this.selectedMachineDescription = '';
        this.selectedWeldingCapacity = 0;
      }
    }
  }

  recalculateProcessCost(info: any) {
    let materialInfoList: MaterialInfoDto[] = info?.totmaterialList;
    this.newCoreAdded = info?.newCoreAdded || false;
    const currentPart: PartInfoDto = info?.currentPart;
    this.currentPart = Object.assign({}, info?.currentPart);
    //this.blockUiService.pushBlockUI('recalculate ProcessCost - recalculateProcessCost');
    let totMatCost = 0,
      netWeight = 0,
      scrapPrice = 0;
    materialInfoList?.forEach((element) => {
      totMatCost += Number(element.netMatCost);
      netWeight += Number(element.netWeight);
      scrapPrice += Number(element.scrapPricePerKg);
    });

    this.materialInfo.totalCost = totMatCost;
    this.materialInfo.scrapPrice = scrapPrice;
    this.materialInfo.weight = netWeight;

    if (currentPart?.mfrCountryId) {
      const month = this.currentMarketMonth ?? this.selectedProject?.marketMonth ?? this.sharedService.getMarketMonth(this.selectedProject.marketQuarter);
      combineLatest([
        this.digitalFactoryService.getLaborRateMasterByCountry({
          supplierId: this.part?.supplierInfoId,
          countryId: currentPart?.mfrCountryId,
          regionId: currentPart?.supplierRegionId,
          marketMonth: month,
        }),
        this._processService.getProcessInfoByPartInfoId(currentPart?.partInfoId),
      ])
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(([laborRate, processList]: [LaborRateMasterDto[], ProcessInfoDto[]]) => {
          if (laborRate) {
            if (materialInfoList?.length > 0) {
              materialInfoList = [
                ...materialInfoList.filter((x) => !(this._manufacturingConfig.secondaryProcesses.includes(x.processId) || this._manufacturingConfig.weldingProcesses.includes(x.processId))),
                ...materialInfoList.filter((x) => this._manufacturingConfig.secondaryProcesses.includes(x.processId) || this._manufacturingConfig.weldingProcesses.includes(x.processId)),
              ]; // sorting the primary process to the top
            }
            if (processList && processList?.length > 0 && this.page !== this.pageEnum.BestProcess && !this.newCoreAdded) {
              this.costManufacturingRecalculationService.setLookupLists({
                fieldColorsList: this.fieldColorsList,
                processTypeOrginalList: this.processTypeOrginalList,
              });
              // subsequent recalculations
              processList.forEach((x) => (x.samplingRate = this.defaultValues.samplingRate));
              this.costManufacturingRecalculationService
                .recalculateExistingProcessCosts(
                  currentPart,
                  materialInfoList,
                  laborRate,
                  processList,
                  this.materialmasterDatas,
                  this.laborCountByMachineType,
                  this.manufacturingObj,
                  this.subProcessFormArray,
                  this.machiningOperationTypeFormArray,
                  this.costingManufacturingInfoform,
                  this.selectedProcessInfoId,
                  this.formIdentifier,
                  this.defaultValues,
                  this.MachiningFlags
                )
                .subscribe((result: ReCalculateContext[]) => {
                  if (result && result.length > 0) {
                    const recalContext = { ...result[0] };
                    const calcResults = result.map((x) => x.calculateResults).flat();
                    recalContext.calculateResults = calcResults;
                    if (this.materialInfoList.length > 0 && this.materialInfoList?.some((x) => x?.secondaryProcessId === 2)) {
                      this._manufacturingConfig._castingConfig.sortCastingCoreProcesses(recalContext.calculateResults);
                    }
                    this.costManufacturingAutomationService.saveRecalculatedProcessResult(recalContext);
                  }
                });
            } else {
              // first time recalculation/automation
              this.totProcessList = [];
              this.automationProcessCount = 0;
              const materialsToAutomate = [];
              if (materialInfoList?.length > 1 && !this.newCoreAdded) {
                const matPrimaryInfo = materialInfoList?.filter(
                  (x) => !this._manufacturingConfig.secondaryProcesses.includes(x?.processId) && !this._manufacturingConfig.weldingProcesses.includes(x?.processId)
                );
                const matWeldingInfo = materialInfoList?.filter((x) => this._manufacturingConfig.weldingProcesses.includes(x?.processId));
                const matSecondaryInfo = materialInfoList?.filter((x) => this._manufacturingConfig.secondaryProcesses.includes(x?.processId));
                matPrimaryInfo.length > 0 && materialsToAutomate.push(matPrimaryInfo[0]);
                matWeldingInfo.length > 0 && materialsToAutomate.push(...matWeldingInfo);
                matSecondaryInfo.length > 0 && materialsToAutomate.push(...matSecondaryInfo);
              } else if (materialInfoList?.length === 1 && !this.newCoreAdded) {
                materialsToAutomate.push(materialInfoList[0]);
              } else if (this.newCoreAdded) {
                materialsToAutomate.push(this.materialInfoList?.find((x) => x?.secondaryProcessId === 2));
              }
              materialsToAutomate.forEach((materialInfo) => {
                const isCasting = this._manufacturingConfig.castingProcesses.includes(materialInfo?.processId);
                const isSecondaryProcess = this._manufacturingConfig.secondaryProcesses.includes(materialInfo?.processId);
                const processInfo = new ProcessInfoDto();
                if (materialInfo?.processId in this._manufacturingConfig.automationProcessTypeMapping) {
                  processInfo.processTypeID = this._manufacturingConfig.automationProcessTypeMapping[materialInfo?.processId];
                  if (processInfo.processTypeID === ProcessType.Stitching) {
                    this.processFlag.IsProcessTypeStitching = true;
                  } else if (processInfo.processTypeID === ProcessType.CableWireCutting) {
                    this.processFlag.IsProcessTypeWireCuttingTermination = true;
                  }
                } else if (
                  [PrimaryProcessType.PlasticTubeExtrusion, PrimaryProcessType.MetalTubeExtrusion, PrimaryProcessType.InsulationJacket, PrimaryProcessType.HotForgingClosedDieHot].includes(
                    Number(materialInfo?.processId)
                  )
                ) {
                  // ProcessTypeID is not considered here
                } else if (isCasting && !this.newCoreAdded) {
                  materialInfo?.processId != PrimaryProcessType.HPDCCasting && (materialInfo = materialInfoList?.filter((x) => Number(x.secondaryProcessId) === 1)[0] || materialInfo);
                } else if (![CommodityType.StockMachining, CommodityType.Electronics].includes(Number(this.currentPart.commodityId)) && !this.newCoreAdded) {
                  this.blockUiService.popBlockUI('recalculate ProcessCost');
                  this.messaging.openSnackBar(`No Automation implemented for selected process.`, '', { duration: 5000 });
                  return;
                }
                this._manufacturingHelperService.recalculateProcessCostModel(
                  processInfo,
                  this.costingManufacturingInfoform.controls,
                  this.currentPart,
                  this.materialmasterDatas,
                  materialInfo,
                  this.sharedService.extractedProcessData,
                  this.materialInfo
                );
                processInfo.samplingRate = isCasting && !isSecondaryProcess ? 0 : Number(this.costingManufacturingInfoform?.controls['samplingRate'].value);
                processInfo.yieldPer = isCasting && !isSecondaryProcess ? 0 : Number(this.costingManufacturingInfoform.controls['yieldPer'].value);
                // processInfo.yieldCost = Number(this.costingManufacturingInfoform.controls['yieldCost'].value);
                // processInfo.cavityPressure = this.materialmasterDatas?.clampingPressure || 0;
                // processInfo.efficiency = Number(this.costingManufacturingInfoform.controls['efficiency'].value);
                this.MachiningFlags = { ...this.MachiningFlags, ...this._manufacturingConfig._machining.setMachineFlags(Number(processInfo.processTypeID)) };
                processInfo.setUpTimeBatch = 60;
                this._manufacturingConfig.manufacturingRecalculateCostProps.forEach((prop) => (processInfo[prop] = this[prop]));
                let totalBendCount = 0;
                this.sharedService.extractedProcessData?.ProcessBendingInfo?.forEach((element) => {
                  if (element.Type === 'Rolled Hem Bend(s)') {
                    totalBendCount += Number(element.BendCount * 2);
                  } else {
                    totalBendCount += Number(element.BendCount);
                  }
                });
                processInfo.noOfbends = totalBendCount;
                processInfo.materialTypeName = this.stockFormCategoriesDto.find((x) => x.materialTypeId === processInfo.materialType)?.materialType;
                const automationParams = this.parametersForAutomation();
                if (materialInfo?.processId == PrimaryProcessType.LaserCutting) {
                  processInfo.lengthOfCut = Number(this.sharedService.extractedProcessData?.ExternalPerimeter) + Number(this.sharedService.extractedProcessData?.InternalPerimeter);
                  if (this.currentPart?.eav > 10000 || (materialInfo?.dimUnfoldedZ <= 1 && materialInfo?.dimUnfoldedZ >= 20)) {
                    //this.blockUiService.popBlockUI('recalculate ProcessCost - recalculateProcessCost');
                    const dialogRef = this.messaging.openConfirmationDialog(<ConfirmationDialogConfig>{
                      data: {
                        title: 'Process Restriction',
                        message: 'Current Annual volume/thickness not suggested to use Laser Process. Do you still want to proceed?',
                        action: 'CONFIRM',
                        cancelText: 'CANCEL',
                      },
                    });
                    dialogRef.afterClosed().subscribe((data) => {
                      if (data) {
                        setTimeout(() => {
                          //this.blockUiService.pushBlockUI('recalculate ProcessCost - recalculateProcessCost');
                          // const automationParams = this.parametersForAutomation();
                          this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, processInfo, automationParams);
                          this.checkAndInsertAdditionalProcessEntries(materialInfo, processInfo, laborRate);
                        }, 1000);
                      } else {
                        return;
                      }
                    });
                  } else {
                    // const automationParams = this.parametersForAutomation();
                    this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, processInfo, automationParams);
                    this.checkAndInsertAdditionalProcessEntries(materialInfo, processInfo, laborRate);
                  }
                } else if (materialInfo?.processId == PrimaryProcessType.TurretPunch) {
                  if (this.currentPart?.eav > 10000 || materialInfo?.dimUnfoldedZ > 4) {
                    //this.blockUiService.popBlockUI('recalculate ProcessCost - recalculateProcessCost');
                    const dialogRef = this.messaging.openConfirmationDialog(<ConfirmationDialogConfig>{
                      data: {
                        title: 'Process Restriction',
                        message: 'Current Annual volume/thickness not suggested to use TPP. Do you still want to proceed?',
                        action: 'CONFIRM',
                        cancelText: 'CANCEL',
                      },
                    });

                    dialogRef.afterClosed().subscribe((data) => {
                      if (data) {
                        setTimeout(() => {
                          //this.blockUiService.pushBlockUI('recalculate ProcessCost - recalculateProcessCost');
                          // const automationParams = this.parametersForAutomation();
                          this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, processInfo, automationParams);
                          this.checkAndInsertAdditionalProcessEntries(materialInfo, processInfo, laborRate);
                        }, 1000);
                      } else {
                        return;
                      }
                    });
                  } else {
                    // const automationParams = this.parametersForAutomation();
                    this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, processInfo, automationParams);
                    this.checkAndInsertAdditionalProcessEntries(materialInfo, processInfo, laborRate);
                  }
                } else if (materialInfo?.processId == PrimaryProcessType.PlasmaCutting || materialInfo?.processId == PrimaryProcessType.OxyCutting) {
                  processInfo.lengthOfCut = Number(this.sharedService.extractedProcessData?.ExternalPerimeter) + Number(this.sharedService.extractedProcessData?.InternalPerimeter);
                  // const automationParams = this.parametersForAutomation();
                  this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, processInfo, automationParams);
                  this.checkAndInsertAdditionalProcessEntries(materialInfo, processInfo, laborRate);
                  // } else if (Number(this.currentPart.commodityId) === CommodityType.StockMachining) {
                } else if ([MachiningTypes.Rod, MachiningTypes.Tube].includes(materialInfo?.processId)) {
                  // machining turning processes
                  // [0, 1].forEach((_i) => this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, processInfo, automationParams));
                  this.autoPullFeaturesAutomation('lesser', materialInfo, laborRate, processInfo, automationParams);
                  this.autoPullFeaturesAutomation('greater', materialInfo, laborRate, processInfo, automationParams);
                } else if (materialInfo?.processId == PrimaryProcessType.NoBakeCasting) {
                  if (processInfo.materialInfoList?.filter((x) => [1, 3].includes(x?.secondaryProcessId)).length >= 2) {
                    if (this.newCoreAdded) {
                      this.newCoreProcessAutomationForCasting(materialInfo, laborRate, processInfo, automationParams);
                    } else {
                      this._manufacturingConfig.nobakeProcesses.forEach((processTypeId) => {
                        if (ProcessType.CastingCorePreparation === processTypeId && processInfo.materialInfoList?.some((x) => x?.secondaryProcessId === 2)) {
                          this.corePreparationAutomationForCasting(processTypeId, materialInfo, laborRate, processInfo, automationParams);
                          return;
                        }
                        // if (
                        //   ProcessType.CastingCorePreparation !== processTypeId ||
                        //   (ProcessType.CastingCorePreparation === processTypeId && processInfo.materialInfoList?.filter((x) => x?.secondaryProcessId === 2).length >= 1)
                        // ) {
                        // ignore core preparation if sand core is not present in the material list
                        // this.blockUiService.pushBlockUI('recalculate ProcessCost - Nobake Casting');
                        // this.automateProcessEntries(materialInfo, laborRate, { ...processInfo, processTypeID: processTypeId }, defaultMarketData);
                        // this.automateProcessEntries(materialInfo, laborRate, { ...processInfo, processTypeID: processTypeId });
                        // const automationParams = this.parametersForAutomation();
                        this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, { ...processInfo, processTypeID: processTypeId }, automationParams);
                      });
                    }
                    // this.machiningAutomation();
                  } else {
                    this.messaging.openSnackBar(`Sufficient Material Details are Not Available`, '', { duration: 5000 });
                  }
                } else if (materialInfo?.processId == PrimaryProcessType.InvestmentCasting) {
                  // this.blockUiService.popBlockUI('recalculate ProcessCost');
                  if (processInfo.materialInfoList?.filter((x) => [1, 3, 4, 5].includes(x?.secondaryProcessId)).length >= 2) {
                    this._manufacturingConfig.investmentProcesses.forEach((processTypeId) => {
                      // this.blockUiService.pushBlockUI('recalculate ProcessCost - Investment Casting');
                      // const automationParams = this.parametersForAutomation();
                      this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, { ...processInfo, processTypeID: processTypeId }, automationParams);
                    });
                    // this.machiningAutomation();
                  } else {
                    this.messaging.openSnackBar(`Sufficient Material Details are Not Available`, '', { duration: 5000 });
                  }
                } else if (materialInfo?.processId == PrimaryProcessType.HotForgingClosedDieHot) {
                  this._manufacturingConfig.hotForgingClosedDieProcesses.forEach((processTypeId) => {
                    this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, { ...processInfo, processTypeID: processTypeId }, automationParams);
                  });
                } else if ([PrimaryProcessType.GreenCastingAuto, PrimaryProcessType.GreenCastingSemiAuto].includes(materialInfo?.processId)) {
                  // this.blockUiService.popBlockUI('recalculate ProcessCost');
                  if (processInfo.materialInfoList?.filter((x) => [1, 3].includes(x?.secondaryProcessId)).length >= 2) {
                    if (this.newCoreAdded) {
                      // materialInfo.coreCostDetails?.forEach((core) => {
                      //   if (!corePrepSubProcessIds.includes(core.coreCostDetailsId)) {
                      //     processInfo.processTypeID = ProcessType.CastingCorePreparation;
                      //     processInfo.subProcessTypeID = core.coreCostDetailsId;
                      //     this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, { ...processInfo, processTypeID: processInfo.processTypeID }, automationParams);
                      //   }
                      // });
                      // if (coreSandMaterial?.coreCostDetails?.length >= 2 && !this.machineInfoList.some((x) => x.processTypeID === ProcessType.CastingCoreAssembly)) {
                      //   processInfo.processTypeID = ProcessType.CastingCoreAssembly;
                      //   this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, { ...processInfo, processTypeID: processInfo.processTypeID }, automationParams);
                      // }
                      this.newCoreProcessAutomationForCasting(materialInfo, laborRate, processInfo, automationParams);
                    } else {
                      this._manufacturingConfig.greenProcesses.forEach((processTypeId) => {
                        if (ProcessType.CastingCorePreparation === processTypeId && processInfo.materialInfoList?.some((x) => x?.secondaryProcessId === 2)) {
                          //   const materialWithCore = processInfo.materialInfoList?.find((x) => x?.secondaryProcessId === 2);
                          //   materialWithCore?.coreCostDetails?.forEach((core) => {
                          //     processInfo.subProcessTypeID = core.coreCostDetailsId;
                          //     this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, { ...processInfo, processTypeID: processTypeId }, automationParams);
                          //   });
                          //   processInfo.subProcessTypeID = 0;
                          this.corePreparationAutomationForCasting(processTypeId, materialInfo, laborRate, processInfo, automationParams);
                          return;
                        }
                        // if (
                        //   ProcessType.CastingCorePreparation !== processTypeId ||
                        //   (ProcessType.CastingCorePreparation === processTypeId && processInfo.materialInfoList?.filter((x) => x?.secondaryProcessId === 2).length >= 1)
                        // ) {
                        // ignore core preparation if sand core is not present in the material list
                        // const automationParams = this.parametersForAutomation();

                        this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, { ...processInfo, processTypeID: processTypeId }, automationParams);
                      });
                    }
                    // this.machiningAutomation();
                  } else {
                    this.messaging.openSnackBar(`Sufficient Material Details are Not Available`, '', { duration: 5000 });
                  }
                } else if (materialInfo?.processId == PrimaryProcessType.HPDCCasting) {
                  this._manufacturingConfig.hpdcProcesses.forEach((processTypeId) => {
                    processInfo.samplingRate = Number(this.costingManufacturingInfoform.controls['samplingRate'].value);
                    processInfo.yieldPer = ProcessType.HighPressureDieCasting === processTypeId ? Number(this.costingManufacturingInfoform.controls['yieldPer'].value) : 0;
                    this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, { ...processInfo, processTypeID: processTypeId }, automationParams);
                  });
                  // this.machiningAutomation();
                } else if (materialInfo?.processId == PrimaryProcessType.GDCCasting) {
                  if (processInfo.materialInfoList?.filter((x) => [1].includes(x?.secondaryProcessId)).length >= 1) {
                    if (this.newCoreAdded) {
                      this.newCoreProcessAutomationForCasting(materialInfo, laborRate, processInfo, automationParams);
                    } else {
                      this._manufacturingConfig.gdcProcesses.forEach((processTypeId) => {
                        if (ProcessType.GravityDieCasting === processTypeId) {
                          processInfo.partArea = this.sharedService.extractedMaterialData?.ProjectedArea || 0;
                          processInfo.flashArea = this.sharedService.extractedMaterialData?.PartSurfaceArea || 0;
                        }
                        if (ProcessType.CastingCorePreparation === processTypeId && processInfo.materialInfoList?.some((x) => x?.secondaryProcessId === 2)) {
                          this.corePreparationAutomationForCasting(processTypeId, materialInfo, laborRate, processInfo, automationParams);
                          return;
                        }
                        // if (
                        //   ProcessType.CastingCorePreparation !== processTypeId ||
                        //   (ProcessType.CastingCorePreparation === processTypeId && processInfo.materialInfoList?.filter((x) => x?.secondaryProcessId === 2).length >= 1)
                        // ) {
                        // ignore core preparation if sand core is not present in the material list
                        // const automationParams = this.parametersForAutomation();
                        this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, { ...processInfo, processTypeID: processTypeId }, automationParams);
                      });
                    }
                    // this.machiningAutomation();
                  } else {
                    this.messaging.openSnackBar(`Sufficient Material Details are Not Available`, '', { duration: 5000 });
                  }
                } else if (materialInfo?.processId == PrimaryProcessType.LPDCCasting) {
                  if (processInfo.materialInfoList?.filter((x) => [1].includes(x?.secondaryProcessId)).length >= 1) {
                    if (this.newCoreAdded) {
                      this.newCoreProcessAutomationForCasting(materialInfo, laborRate, processInfo, automationParams);
                    } else {
                      this._manufacturingConfig.lpdcProcesses.forEach((processTypeId) => {
                        if (ProcessType.LowPressureDieCasting === processTypeId) {
                          // to confirm
                          processInfo.partArea = this.sharedService.extractedMaterialData?.ProjectedArea || 0;
                          processInfo.flashArea = this.sharedService.extractedMaterialData?.PartSurfaceArea || 0;
                        }
                        if (ProcessType.CastingCorePreparation === processTypeId && processInfo.materialInfoList?.some((x) => x?.secondaryProcessId === 2)) {
                          this.corePreparationAutomationForCasting(processTypeId, materialInfo, laborRate, processInfo, automationParams);
                          return;
                        }
                        // const automationParams = this.parametersForAutomation();
                        this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, { ...processInfo, processTypeID: processTypeId }, automationParams);
                      });
                    }
                    // this.machiningAutomation();
                  } else {
                    this.messaging.openSnackBar(`Sufficient Material Details are Not Available`, '', { duration: 5000 });
                  }
                } else if (this.processFlag.IsProcessTypeStitching) {
                  processInfo.totalPinPopulation = this._manufacturingConfig.calculateTotalPinPopulation(this.BillOfMaterialList);
                  processInfo.noOfTypesOfPins = this._manufacturingConfig.calculateNoOfTypesOfPins(this.BillOfMaterialList);
                  processInfo.maxBomQuantityOfIndividualPinTypes = this._manufacturingConfig.calculateBomMaxQtyOfIndividualPinTypes(this.BillOfMaterialList);

                  processInfo.lengthOfCutInternal = Number(this.sharedService.extractedProcessData?.TotalPinPopulation);
                  processInfo.lengthOfCutInternal = Number(this.sharedService.extractedProcessData?.NoOfTypesOfPins);
                  processInfo.lengthOfCutInternal = Number(this.sharedService.extractedProcessData?.maxBomQuantityOfIndividualPinTypes);
                  processInfo.inspectionType = this.costingManufacturingInfoform.controls['inspectionType'].value || 0;

                  this._manufacturingConfig.stitchingProcesses.forEach((processTypeId) => {
                    // const automationParams = this.parametersForAutomation();
                    this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, { ...processInfo, processTypeID: processTypeId }, automationParams);
                  });
                } else if (this.processFlag.IsProcessTypeWireCuttingTermination) {
                  this._manufacturingConfig.wireCuttingTerminationProcesses.forEach((processTypeId) => {
                    // const automationParams = this.parametersForAutomation();
                    this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, { ...processInfo, processTypeID: processTypeId }, automationParams);
                  });
                } else if (materialInfo?.processId == PrimaryProcessType.PlasticTubeExtrusion) {
                  this._manufacturingConfig.plasticTubeExtrusionProcesses.forEach((processTypeId) => {
                    // const automationParams = this.parametersForAutomation();
                    this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, { ...processInfo, processTypeID: processTypeId }, automationParams);
                  });
                } else if (materialInfo?.processId == PrimaryProcessType.MetalTubeExtrusion) {
                  this._manufacturingConfig.metalTubeExtrusionProcesses.forEach((processTypeId) => {
                    // const automationParams = this.parametersForAutomation();
                    this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, { ...processInfo, processTypeID: processTypeId }, automationParams);
                  });
                } else if (materialInfo?.processId == PrimaryProcessType.MetalExtrusion) {
                  this._manufacturingConfig.metalExtrusionProcesses.forEach((processTypeId) => {
                    // const automationParams = this.parametersForAutomation();
                    this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, { ...processInfo, processTypeID: processTypeId }, automationParams);
                  });
                } else if (materialInfo?.processId == PrimaryProcessType.InsulationJacket) {
                  this._manufacturingConfig.insulationJacket.forEach((processTypeId) => {
                    // const automationParams = this.parametersForAutomation();
                    this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, { ...processInfo, processTypeID: processTypeId }, automationParams);
                  });
                } else if (materialInfo?.processId == PrimaryProcessType.CustomizeCable) {
                  const processList: ProcessType[] =
                    Number(materialInfo.typeOfCable) === TypeOfCable.SolidCore ? this._manufacturingConfig.customCableSolid : this._manufacturingConfig.customCableMulti;
                  processList?.forEach((processTypeId) => {
                    // const automationParams = this.parametersForAutomation();
                    this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, { ...processInfo, processTypeID: processTypeId }, automationParams);
                  });
                } else if (materialInfo?.processId === PrimaryProcessType.ConventionalPCB) {
                  processInfo.subProcessFormArray = this.subProcessFormArray;
                  let processList: ProcessType[] = [];
                  processList = Number(materialInfo.typeOfWeld) <= 2 ? this._manufacturingConfig.conventionalPcbAutomation.splice(2) : this._manufacturingConfig.conventionalPcbAutomation;
                  if ([SilkScreenColor.White, SilkScreenColor.Black].includes(materialInfo.secondaryPrice)) {
                    processList.push(ProcessType.SilkScreen);
                  }
                  if (
                    [SurfaceFinish.HASL, SurfaceFinish.HASLLF, SurfaceFinish.ENIG, SurfaceFinish.OSP, SurfaceFinish.ImmersionTin, SurfaceFinish.ImmersionSilver].includes(materialInfo.secondaryCount)
                  ) {
                    processList.push(ProcessType.SurfaceFinish);
                  }
                  processList = processList.filter((item, i, ar) => ar.indexOf(item) === i);
                  if ([RoutingScoring.Routing, RoutingScoring.Scoring].includes(materialInfo.cavityEnvelopWidth)) {
                    processList.push(ProcessType.RoutingScoring);
                  }
                  processList.push(ProcessType.ETestBBT);
                  processList.push(ProcessType.FQCInspection);
                  this.totSubProcessCount = 0;
                  processList?.forEach((element) => {
                    this.totSubProcessCount += this._pcbConfig.getSubProcessList(element, materialInfo.secondaryCount, materialInfo.cavityEnvelopWidth)?.filter((x) => x.automate === true)?.length;
                  });
                  this.totSubProcessCount++;
                  for (const processTypeID of processList) {
                    const automationParams = this.parametersForAutomation();
                    this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, { ...processInfo, processTypeID }, automationParams, processList);
                  }
                } else if ([PrimaryProcessType.SemiRigidFlex, PrimaryProcessType.RigidFlexPCB].includes(materialInfo.processId)) {
                  processInfo.subProcessFormArray = this.subProcessFormArray;
                  let processList: ProcessType[] = [];
                  processList = Number(materialInfo.typeOfWeld) <= 2 ? this._manufacturingConfig.semiRigidFlexAutomation.splice(2) : this._manufacturingConfig.semiRigidFlexAutomation;
                  if ([SilkScreenColor.White, SilkScreenColor.Black].includes(materialInfo.secondaryPrice)) {
                    processList.push(ProcessType.SilkScreen);
                  }
                  if (
                    [SurfaceFinish.HASL, SurfaceFinish.HASLLF, SurfaceFinish.ENIG, SurfaceFinish.OSP, SurfaceFinish.ImmersionTin, SurfaceFinish.ImmersionSilver].includes(materialInfo.secondaryCount)
                  ) {
                    processList.push(ProcessType.SurfaceFinish);
                  }
                  processList = processList.filter((item, i, ar) => ar.indexOf(item) === i);
                  if ([RoutingScoring.Routing, RoutingScoring.Scoring].includes(materialInfo.cavityEnvelopWidth)) {
                    processList.push(ProcessType.RoutingScoring);
                  }
                  processList.push(ProcessType.ETestBBT);
                  processList.push(ProcessType.FQCInspection);

                  if (Number(materialInfo.typeOfCable) === 1) {
                    processList.push(ProcessType.ImpedanceCouponTest);
                  }
                  this.totSubProcessCount = 0;
                  processList?.forEach((element) => {
                    this.totSubProcessCount += this._semiRigidConfig
                      .getSubProcessList(element, materialInfo.secondaryCount, materialInfo.cavityEnvelopWidth)
                      ?.filter((x) => x.automate === true)?.length;
                  });
                  this.totSubProcessCount++;

                  for (const processTypeID of processList) {
                    const automationParams = this.parametersForAutomation();
                    this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, { ...processInfo, processTypeID }, automationParams, processList);
                  }
                } else if (materialInfo.processId == PrimaryProcessType.RubberInjectionMolding) {
                  for (const processTypeID of this._manufacturingConfig.rubberInjectionMolding) {
                    if (processTypeID === ProcessType.PostCuring) {
                      if (this._plasticRubberConfig.getPostCureInfo(materialInfo?.materialMarketData?.materialMaster?.materialTypeName)?.cycleTimeHrs) {
                        this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, { ...processInfo, processTypeID }, automationParams);
                      }
                    } else {
                      this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, { ...processInfo, processTypeID }, automationParams);
                    }
                  }
                } else if (materialInfo.processId == PrimaryProcessType.CompressionMoulding) {
                  for (const processTypeID of this._manufacturingConfig.compressionMolding) {
                    if (processTypeID === ProcessType.PostCuring) {
                      if (this._plasticRubberConfig.getPostCureInfo(materialInfo?.materialMarketData?.materialMaster?.materialTypeName)?.cycleTimeHrs) {
                        this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, { ...processInfo, processTypeID }, automationParams);
                      }
                    } else {
                      this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, { ...processInfo, processTypeID }, automationParams);
                    }
                  }
                } else if (materialInfo.processId == PrimaryProcessType.TubeLaserCutting) {
                  this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, processInfo, automationParams);
                  if (this.sharedService.extractedProcessData?.ProcessBendingInfo) {
                    const processTypeID = ProcessType.TubeBendingMetal;
                    this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, { ...processInfo, processTypeID }, automationParams);
                  }
                  //  this.checkAndInsertAdditionalProcessEntries(materialInfo, processInfo, laborRate);
                } else if (materialInfo.processId === PrimaryProcessType.TransferMolding) {
                  for (const processTypeID of this._manufacturingConfig.transferMolding) {
                    // const automationParams = this.parametersForAutomation();
                    this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, { ...processInfo, processTypeID }, automationParams);
                  }
                } else if (materialInfo.processId === PrimaryProcessType.ThermoForming) {
                  for (const processTypeID of this._manufacturingConfig.thermoForming) {
                    // const automationParams = this.parametersForAutomation();
                    this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, { ...processInfo, processTypeID }, automationParams);
                  }
                } else if (materialInfo.processId === PrimaryProcessType.PlasticVacuumForming) {
                  for (const processTypeID of this._manufacturingConfig.vacuumForming) {
                    // const automationParams = this.parametersForAutomation();
                    this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, { ...processInfo, processTypeID }, automationParams);
                  }
                } else if (materialInfo.processId == PrimaryProcessType.RubberExtrusion) {
                  // for (let item = 0; item < this._manufacturingConfig.rubberExtrusion.length; item++) {
                  for (const processTypeID of this._manufacturingConfig.rubberExtrusion) {
                    // const automationParams = this.parametersForAutomation();
                    this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, { ...processInfo, processTypeID }, automationParams);
                  }
                } else if (materialInfo.processId == PrimaryProcessType.StampingStage) {
                  processInfo.newToolingRequired = true;
                  if (this.sharedService.extractedProcessData?.ExternalPerimeter || this.sharedService.extractedProcessData?.InternalPerimeter) {
                    const blankEntryType: number = this._manufacturingConfig._sheetMetalConfig.simpleCountries.includes(currentPart?.mfrCountryId)
                      ? StampingType.BlankingPunching
                      : StampingType.Compound;
                    processInfo.noOfHitsRequired =
                      blankEntryType === StampingType.Compound ? StagingToolingType.Compound : this._manufacturingConfig._sheetMetalConfig.getToolingRequiredOrNotForStage(currentPart?.mfrCountryId);
                    processInfo.subProcessTypeID = blankEntryType;
                    this._manufacturingConfig._sheetMetalConfig.getstagingsubprocess(processInfo, blankEntryType);
                    // const lengthOfCut = blankEntryType === StampingType.BlankingPunching ? this.sharedService.extractedProcessData?.ExternalPerimeter : this.sharedService.extractedProcessData?.ExternalPerimeter + this.sharedService.extractedProcessData?.InternalPerimeter;
                    // processInfo.noOfHitsRequired = blankEntryType === StampingType.Compound ? StagingToolingType.Compound : this._manufacturingConfig._sheetMetalConfig.getToolingRequiredOrNotForStage(currentPart?.mfrCountryId);
                    // const blankingSubProcessList = this._fb.array([]) as FormArray;
                    // let subProcessInfo = new SubProcessTypeInfoDto;
                    // subProcessInfo.processInfoId = processInfo.processInfoId;
                    // subProcessInfo.subProcessTypeId = blankEntryType;
                    // subProcessInfo.lengthOfCut = lengthOfCut;
                    // let blanking = this._manufacturingConfig._sheetMetalConfig.getStageSubprocessEntry(subProcessInfo);
                    // blankingSubProcessList.push(blanking);
                    // processInfo.subProcessFormArray = blankingSubProcessList;
                    // processInfo.inspectionCost = 0;
                    // processInfo.qaOfInspectorRate = 0;
                    // processInfo.inspectionTime = 0;
                    // processInfo.isQaInspectorRateDirty = true;
                    // processInfo.isinspectionCostDirty = true;
                    // processInfo.isinspectionTimeDirty = true;
                    // this.automateProcessEntries(materialInfo, laborRate, processInfo);
                    // const automationParams = this.parametersForAutomation();
                    this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, processInfo, automationParams);
                    if (blankEntryType === StampingType.BlankingPunching && this.sharedService.extractedProcessData?.InternalPerimeter > 0) {
                      const piercingInfo: ProcessInfoDto = Object.assign({}, processInfo);
                      piercingInfo.noOfHitsRequired = StagingToolingType.Simple;
                      piercingInfo.subProcessTypeID = StampingType.Piercing;
                      this._manufacturingConfig._sheetMetalConfig.getstagingsubprocess(piercingInfo, StampingType.Piercing);
                      // const PiercingSubProcessList = this._fb.array([]) as FormArray;
                      // let subProcessInfo = new SubProcessTypeInfoDto;
                      // subProcessInfo.processInfoId = piercingInfo.processInfoId;
                      // subProcessInfo.subProcessTypeId = StampingType.Piercing;
                      // subProcessInfo.lengthOfCut = this.sharedService.extractedProcessData?.InternalPerimeter;
                      // let piercing = this._manufacturingConfig._sheetMetalConfig.getStageSubprocessEntry(subProcessInfo);
                      // PiercingSubProcessList.push(piercing);
                      // piercingInfo.subProcessFormArray = PiercingSubProcessList;
                      // piercingInfo.inspectionCost = 0;
                      // piercingInfo.qaOfInspectorRate = 0;
                      // piercingInfo.inspectionTime = 0;
                      // piercingInfo.isQaInspectorRateDirty = true;
                      // piercingInfo.isinspectionCostDirty = true;
                      // piercingInfo.isinspectionTimeDirty = true;
                      // const automationParams = this.parametersForAutomation();
                      this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, piercingInfo, automationParams);
                    }
                  }
                  if (this.sharedService.extractedProcessData?.ProcessBendingInfo) {
                    const axisWiseLength = this._manufacturingConfig._sheetMetalConfig.getBendingEntriesSumByAxis().sort((a, b) => b.lengthSum - a.lengthSum);
                    axisWiseLength.forEach((bend) => {
                      const bendingInfo: ProcessInfoDto = Object.assign({}, processInfo);
                      bendingInfo.noOfHitsRequired = StagingToolingType.Simple;
                      bendingInfo.subProcessTypeID = StampingType.Bending;
                      this._manufacturingConfig._sheetMetalConfig.getstagingsubprocess(bendingInfo, StampingType.Bending, bend, materialInfoList);
                      // const bendingSubProcessList = this._fb.array([]) as FormArray;
                      // let bendingSubProcess = new SubProcessTypeInfoDto();
                      // bendingSubProcess.subProcessTypeId = StampingType.Bending;
                      // bendingSubProcess.processInfoId = bendingInfo.processInfoId;
                      // bendingSubProcess.bendingLineLength = bend?.lengthSum;
                      // bendingSubProcess.shoulderWidth = this._manufacturingConfig._sheetMetalConfig.getDieOpeningTime(materialInfoList, bendingInfo);
                      // const bending = this._manufacturingConfig._sheetMetalConfig.getStageSubprocessEntry(bendingSubProcess);
                      // bendingSubProcessList.push(bending);
                      // bendingInfo.subProcessFormArray = bendingSubProcessList;
                      // const automationParams = this.parametersForAutomation();
                      this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, bendingInfo, automationParams);
                    });
                  }
                  if (this.sharedService.extractedProcessData?.ProcessFormInfo) {
                    const axisDimensions = this._manufacturingConfig._sheetMetalConfig.getFormingEntriesSumByAxis();
                    axisDimensions.forEach((form) => {
                      const formingInfo: ProcessInfoDto = Object.assign({}, processInfo);
                      formingInfo.noOfHitsRequired = StagingToolingType.Simple;
                      formingInfo.subProcessTypeID = StampingType.Forming;
                      this._manufacturingConfig._sheetMetalConfig.getstagingsubprocess(formingInfo, StampingType.Forming, form);
                      // const formingSubProcessList = this._fb.array([]) as FormArray;
                      // let formingSubProcess = new SubProcessTypeInfoDto();
                      // formingSubProcess.subProcessTypeId = StampingType.Forming;
                      // formingSubProcess.processInfoId = fromingInfo.processTypeID;
                      // formingSubProcess.formLength = form.formLength;
                      // formingSubProcess.formHeight = form.formHeight;
                      // formingSubProcess.formPerimeter = form.formPerimeter;
                      // formingSubProcess.blankArea = form.formArea;
                      // const forming = this._manufacturingConfig._sheetMetalConfig.getStageSubprocessEntry(formingSubProcess);
                      // formingSubProcessList.push(forming);
                      // fromingInfo.subProcessFormArray = formingSubProcessList;
                      // const automationParams = this.parametersForAutomation();
                      this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, formingInfo, automationParams);
                    });
                  }
                } else if (materialInfo.processId == PrimaryProcessType.StampingProgressive) {
                  processInfo.newToolingRequired = true;
                  const subProcessList = this._fb.array([]) as FormArray;
                  if (this.sharedService.extractedProcessData?.ExternalPerimeter) {
                    this._manufacturingConfig._sheetMetalConfig.getProgressiveSubProcess(subProcessList, processInfo, StampingType.BlankingPunching);
                    // let subProcessInfo = new SubProcessTypeInfoDto;
                    // subProcessInfo.processInfoId = processInfo.processInfoId;
                    // subProcessInfo.subProcessTypeId = StampingType.BlankingPunching;
                    // subProcessInfo.lengthOfCut = this.sharedService.extractedProcessData?.ExternalPerimeter;
                    // let blanking = this._manufacturingConfig._sheetMetalConfig.getStageSubprocessEntry(subProcessInfo);
                    // subProcessList.push(blanking);
                  }
                  if (this.sharedService.extractedProcessData?.InternalPerimeter) {
                    this._manufacturingConfig._sheetMetalConfig.getProgressiveSubProcess(subProcessList, processInfo, StampingType.Piercing);
                    // let subProcessInfo = new SubProcessTypeInfoDto;
                    // subProcessInfo.processInfoId = processInfo.processInfoId;
                    // subProcessInfo.subProcessTypeId = StampingType.Piercing;
                    // subProcessInfo.lengthOfCut = this.sharedService.extractedProcessData?.InternalPerimeter;
                    // let blanking = this._manufacturingConfig._sheetMetalConfig.getStageSubprocessEntry(subProcessInfo);
                    // subProcessList.push(blanking);
                  }
                  if (this.sharedService.extractedProcessData?.ProcessBendingInfo) {
                    const axisWiseLength = this._manufacturingConfig._sheetMetalConfig.getBendingEntriesSumByAxis().sort((a, b) => b.lengthSum - a.lengthSum);
                    axisWiseLength.forEach((bend) => {
                      const bendingInfo: ProcessInfoDto = Object.assign({}, processInfo);
                      this._manufacturingConfig._sheetMetalConfig.getProgressiveSubProcess(subProcessList, bendingInfo, StampingType.Bending, bend, materialInfoList);
                      // let bendingSubProcess = new SubProcessTypeInfoDto();
                      // bendingSubProcess.subProcessTypeId = StampingType.Bending;
                      // bendingSubProcess.processInfoId = bendingInfo.processInfoId;
                      // bendingSubProcess.bendingLineLength = bend?.lengthSum;
                      // bendingSubProcess.shoulderWidth = this._manufacturingConfig._sheetMetalConfig.getDieOpeningTime(materialInfoList, bendingInfo);
                      // const bending = this._manufacturingConfig._sheetMetalConfig.getStageSubprocessEntry(bendingSubProcess);
                      // subProcessList.push(bending);
                    });
                  }
                  if (this.sharedService.extractedProcessData?.ProcessFormInfo) {
                    const axisDimensions = this._manufacturingConfig._sheetMetalConfig.getFormingEntriesSumByAxis();
                    axisDimensions.forEach((form) => {
                      const formingInfo: ProcessInfoDto = Object.assign({}, processInfo);
                      this._manufacturingConfig._sheetMetalConfig.getProgressiveSubProcess(subProcessList, formingInfo, StampingType.Forming, form);
                    });
                  }
                  processInfo.subProcessFormArray = subProcessList;
                  // const automationParams = this.parametersForAutomation();
                  this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, processInfo, automationParams);
                } else if (materialInfo.processId === PrimaryProcessType.TransferPress) {
                  this._manufacturingConfig.transferPressSortOrder.forEach((processTypeId) => {
                    if (processTypeId == ProcessType.Shearing) {
                      // const automationParams = this.parametersForAutomation();
                      this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, { ...processInfo, processTypeID: processTypeId }, automationParams);
                    } else {
                      const subProcessList = this._fb.array([]) as FormArray;

                      if (this.sharedService.extractedProcessData?.ProcessFormInfo) {
                        const areaOfMouth = materialInfo?.dimX * materialInfo?.dimY;
                        const deMouth = Math.sqrt((4 * areaOfMouth) / 3.14);
                        const sideArea = 2 * (materialInfo?.dimX + materialInfo?.dimY) * materialInfo?.dimZ;
                        const sheetArea = areaOfMouth + sideArea;
                        const domm2 = Math.sqrt((4 * sheetArea) / 3.14);
                        // const dDRatioRect = deMouth / domm2;

                        const cupDia = Math.max(materialInfo?.dimX, materialInfo?.dimY);
                        const blankDia = Math.sqrt(Math.pow(cupDia, 2) + 4 * cupDia * materialInfo?.dimZ);
                        // const dDRatioCir = blankDia / cupDia;

                        // const materialType = this._smConfig.mapMaterial(processInfo?.materialmasterDatas?.materialType?.materialTypeName);
                        const firstDrawRatio = 0.6;
                        const reDrawRatio = 0.85;

                        const axisDimensions =
                          this._manufacturingConfig._sheetMetalConfig.getFormingEntriesSumByAxis().length > 0 ? [this._manufacturingConfig._sheetMetalConfig.getFormingEntriesSumByAxis()[0]] : [];
                        axisDimensions.forEach((form) => {
                          const formingInfo: ProcessInfoDto = Object.assign({}, processInfo);

                          // Rectangle
                          let noOfDrawStageRect = Math.ceil(1 + Math.log(deMouth / (domm2 * firstDrawRatio)) / Math.log(reDrawRatio));
                          if (noOfDrawStageRect > 0) {
                            for (let i = 0; i < noOfDrawStageRect; i++) {
                              if (i == 0) {
                                this._manufacturingConfig._sheetMetalConfig.getProgressiveSubProcess(subProcessList, formingInfo, StampingType.ShallowDrawRect, form);
                              } else {
                                this._manufacturingConfig._sheetMetalConfig.getProgressiveSubProcess(subProcessList, formingInfo, StampingType.RedrawRect, form);
                              }
                            }
                          }

                          // Circle
                          let noOfDrawStageCir = Math.ceil(1 + Math.log(cupDia / (blankDia * firstDrawRatio)) / Math.log(reDrawRatio));
                          if (noOfDrawStageCir > 0) {
                            for (let i = 0; i < noOfDrawStageCir; i++) {
                              if (i == 0) {
                                this._manufacturingConfig._sheetMetalConfig.getProgressiveSubProcess(subProcessList, formingInfo, StampingType.ShallowDrawCir, form);
                              } else {
                                this._manufacturingConfig._sheetMetalConfig.getProgressiveSubProcess(subProcessList, formingInfo, StampingType.RedrawCir, form);
                              }
                            }
                          }

                          this._manufacturingConfig._sheetMetalConfig.getProgressiveSubProcess(subProcessList, processInfo, StampingType.Trimming, form);
                        });
                      }

                      if (this.sharedService.extractedProcessData?.InternalPerimeter) {
                        this._manufacturingConfig._sheetMetalConfig.getProgressiveSubProcess(subProcessList, processInfo, StampingType.Piercing);
                      }

                      if (this.sharedService.extractedProcessData?.ProcessBendingInfo) {
                        const axisWiseLength = this._manufacturingConfig._sheetMetalConfig.getBendingEntriesSumByAxis().sort((a, b) => b.lengthSum - a.lengthSum);
                        axisWiseLength.forEach((bend) => {
                          const bendingInfo: ProcessInfoDto = Object.assign({}, processInfo);
                          this._manufacturingConfig._sheetMetalConfig.getProgressiveSubProcess(subProcessList, bendingInfo, StampingType.Bending, bend, materialInfoList);
                        });
                      }
                      if (this.sharedService.extractedProcessData?.ProcessFormInfo) {
                        const axisDimensions = this._manufacturingConfig._sheetMetalConfig.getFormingEntriesSumByAxis();
                        axisDimensions.forEach((form) => {
                          const formingInfo: ProcessInfoDto = Object.assign({}, processInfo);
                          this._manufacturingConfig._sheetMetalConfig.getProgressiveSubProcess(subProcessList, formingInfo, StampingType.Forming, form);
                        });
                      }
                      processInfo.subProcessFormArray = subProcessList;
                      // const automationParams = this.parametersForAutomation();
                      this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, { ...processInfo, processTypeID: processTypeId }, automationParams);
                    }
                  });
                } else if (currentPart.commodityId === CommodityType.Electronics) {
                  processInfo.subProcessFormArray = this.subProcessFormArray;
                  const processList: ProcessType[] = this._electronincs.getProcessListByMountingTech(materialInfo);
                  this.totSubProcessCount = 0;
                  processList.forEach((element) => {
                    let subprocessList = this._electronincs.getFullSubprocessBasedOnProcessId(element, materialInfo);
                    this.totSubProcessCount += subprocessList?.length || 1;
                  });
                  for (const processTypeID of processList) {
                    const automationParams = this.parametersForAutomation();
                    this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, { ...processInfo, processTypeID }, automationParams, processList);
                  }
                } else if ([PrimaryProcessType.MigWelding, PrimaryProcessType.TigWelding].includes(materialInfo.processId)) {
                  for (const processTypeID of this._manufacturingConfig.migTigWelding) {
                    if (processTypeID === ProcessType.WeldingCleaning) {
                      this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, { ...processInfo, processTypeID }, automationParams);
                    } else {
                      processInfo.subProcessFormArray = this._manufacturingConfig.manufactureWeldingSubFormGroup(processInfo, materialInfo, materialInfo.processId); // this.conversionValue, this.isEnableUnitConversion
                      this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, processInfo, automationParams);
                      //this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, { ...processInfo, processTypeID }, automationParams);
                    }
                  }
                } else if (currentPart.commodityId === CommodityType.Assembly) {
                  const subProcessList = this._fb.array([]) as FormArray;
                  const subProcess = new SubProcessTypeInfoDto();
                  subProcess.subProcessTypeId = AssemblyType.PickAndPlaceParts;
                  subProcessList.push(this._assembly.getDynamicFormGroup(subProcess));
                  processInfo.subProcessFormArray = subProcessList;
                  // const automationParams = this.parametersForAutomation();
                  this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, processInfo, automationParams);
                } else {
                  // const automationParams = this.parametersForAutomation();
                  this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, processInfo, automationParams);
                }
              });
              // this.blockUiService.popBlockUI('recalculate ProcessCost');
            }
          } else {
            this.blockUiService.popBlockUI('recalculate ProcessCost');
          }
        });
    } else {
      this.blockUiService.popBlockUI('recalculate ProcessCost');
    }
  }

  updateOnAutomation({
    selectedProcessInfoId,
    formIdentifier,
    inputMachineTypeDescription,
  }: {
    selectedProcessInfoId: number;
    formIdentifier: CommentFieldFormIdentifierModel;
    inputMachineTypeDescription: MedbMachinesMasterDto[];
  }) {
    this.selectedProcessInfoId = selectedProcessInfoId;
    this.formIdentifier = formIdentifier;
    // this.automationProcessCount = automationProcessCount;
    if (this.automationProcessCount === 0) {
      this.loadLatestProcessInfo(this.selectedProcessInfoId);
    }
    if (inputMachineTypeDescription) {
      this.machineTypeDescription.set(inputMachineTypeDescription);
    }
  }

  newCoreProcessAutomationForCasting(materialInfo: MaterialInfoDto, laborRate: LaborRateMasterDto[], processInfo: ProcessInfoDto, automationParams: any) {
    const coreSandMaterial = processInfo.materialInfoList?.find((x) => x?.secondaryProcessId === 2);
    const corePrepSubProcessIds = this.machineInfoList?.filter((x) => x.processTypeID === ProcessType.CastingCorePreparation).map((x) => x.subProcessTypeID) || [];
    materialInfo.coreCostDetails?.forEach((core) => {
      if (!corePrepSubProcessIds.includes(core.coreCostDetailsId)) {
        processInfo.processTypeID = ProcessType.CastingCorePreparation;
        processInfo.subProcessTypeID = core.coreCostDetailsId;
        this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, { ...processInfo, processTypeID: processInfo.processTypeID }, automationParams);
      }
    });
    if (coreSandMaterial?.coreCostDetails?.length >= 2 && !this.machineInfoList.some((x) => x.processTypeID === ProcessType.CastingCoreAssembly)) {
      processInfo.processTypeID = ProcessType.CastingCoreAssembly;
      this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, { ...processInfo, processTypeID: processInfo.processTypeID }, automationParams);
    }
  }

  corePreparationAutomationForCasting(processTypeId: number, materialInfo: MaterialInfoDto, laborRate: LaborRateMasterDto[], processInfo: ProcessInfoDto, automationParams: any) {
    if (ProcessType.CastingCorePreparation === processTypeId && processInfo.materialInfoList?.some((x) => x?.secondaryProcessId === 2)) {
      const materialWithCore = processInfo.materialInfoList?.find((x) => x?.secondaryProcessId === 2);
      materialWithCore?.coreCostDetails?.forEach((core) => {
        processInfo.subProcessTypeID = core.coreCostDetailsId;
        this.costManufacturingAutomationService.automateProcessEntries(materialInfo, laborRate, { ...processInfo, processTypeID: processTypeId }, automationParams);
      });
      processInfo.subProcessTypeID = 0;
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
    if (this.dialogSub) {
      this.dialogSub.unsubscribe();
    }
    this.materialInfoEffect.destroy();
    this.bomInfoEffect.destroy();
  }
}
