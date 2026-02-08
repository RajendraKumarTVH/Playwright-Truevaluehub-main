import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges, ViewChild, OnChanges, AfterViewInit, TemplateRef, effect } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { first, take, takeUntil } from 'rxjs/operators';
import { ConfirmationDialogConfig, MessagingService } from 'src/app/messaging/messaging.service';
import { MaterialCategory, PageEnum } from 'src/app/shared/enums';
import {
  CountryFormMatrixDto,
  MaterialInfoDto,
  MaterialMarketDataDto,
  MaterialMasterDto,
  MaterialTypeDto,
  PartInfoDto,
  ProcessInfoDto,
  ProcessMasterDto,
  ProjectInfoDto,
  StockFormCategoriesDto,
  StockFormDto,
  CountryDataMasterDto,
  MedbMachinesMasterDto,
  BillOfMaterialDto,
} from 'src/app/shared/models';
import { MaterialInfoService, BlockUiService, MedbMasterService, BomService } from 'src/app/shared/services';
import { FieldColorsDto } from 'src/app/shared/models/field-colors.model';
import { MaterialMasterService } from 'src/app/shared/services/material-master.service';
import { CableType, CommodityType, CostingConfig, PrimaryProcessType, ProcessType, ScreeName, SubProcessType, CabType } from '../../costing.config';
import { CostingCompletionPercentageCalculator } from '../../services/costing-completion-percentage-calculator';
import { SharedService } from '../../services/shared.service';
import { CadViewerPopupComponent } from '../cad-viewer-popup/cad-viewer-popup.component';
import * as DescriptionJson from 'src/assets/descriptions.json';
import { NgbPopover, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngxs/store';
// import * as MaterialInfoActions from 'src/app/modules/_actions/material-info.action';
// import { MaterialInfoState } from 'src/app/modules/_state/material-info.state';
import { ProcessMasterState } from 'src/app/modules/_state/process-master.state';
import { LaserCuttingState } from 'src/app/modules/_state/laser-cutting-lookup.state';
import { StampingMetrialLookUpState } from 'src/app/modules/_state/stamping-material-lookup.state';
import { LaserCuttingTime, StampingMetrialLookUp } from 'src/app/shared/models/sheet-metal-lookup.model';
import { MaterialCalculatorService } from '../../services/material-calculator.service';
import { MaterialPlatingCalculatorService } from '../../services/material-plating-calculator.service';
import { MaterialCastingCalculatorService } from '../../services/material-casting-calculator.service';
import { DataExtraction } from 'src/app/shared/models/data-extraction.model';
import { DataExtractionState } from 'src/app/modules/_state/dataextraction.state';
import { CommentFieldFormIdentifierModel } from 'src/app/shared/models/comment-field-model';
import { ThermoFormingState } from 'src/app/modules/_state/thermal-forming-lookup.state';
import { ThermoForming } from 'src/app/shared/models/thermo-forming.models';
import { MaterialStockMachiningCalculatorService } from '../../services/material-stock-machining-calculator.service';
import { MaterialCastingConfigService } from 'src/app/shared/config/material-casting-config';
import { MaterialConfigService } from 'src/app/shared/config/cost-material-config';
import { CommonMaterialCalculationService } from '../../services/common-material-calculation.service';
import { NestingAlgoComponent } from '../nesting-algo/nesting-algo.component';
import { MaterialSecondaryProcessCalculatorService } from '../../services/material-secondary-process.service';
import { PCBCalculatorService } from '../../services/material-pcb-calculator';
import { MaterialPCBConfigService } from 'src/app/shared/config/material-pcb-config';
import { AiCommonService } from 'src/app/shared/services/ai-common-service';
// import { MaterialSearchResultDto } from 'src/app/shared/models/material-search-result-dto';
// import { AiSuggestedData } from 'src/app/shared/models/ai-suggested-data';
import { CostMaterialMappingService } from 'src/app/shared/mapping/cost-material-mapping.service';
import { DigitalFactoryHelper } from '../../services/digital-factory-helper';
import { MaterialCustomCableCalculatorService } from '../../services/material-custom-cable-calculator.service';
import { CommonModule } from '@angular/common';
import { OnlyNumber } from 'src/app/shared/directives';
import { FieldCommentComponent } from 'src/app/modules/comments/components/field-comment-button/field-comment.component';
import { CastingMaterialComponent } from './casting-material/casting-material.component';
import { MachiningMaterialComponent } from './machining-material/machining-material.component';
import { TubeBendingComponent } from './tube-bending/tube-bending.component';
import { InsulationJacketComponent } from './insulation-jacket/insulation-jacket.component';
import { PlasticTubeExtrusionComponent } from './plastic-tube-extrusion/plastic-tube-extrusion.component';
import { HotForgingClosedDieHotComponent } from './hot-forging-closed-die-hot/hot-forging-closed-die-hot.component';
import { MatIconModule } from '@angular/material/icon';
import { MetalExtrusionMaterialComponent } from './metal-extrusion-material/metal-extrusion-material.component';
import { MaterialTableComponent } from './material-table/material-table.component';
import { PCBMaterialComponent } from './pcb-material/pcb-material.component';
import { CustomCableMaterialComponent } from './custom-cable-material/custom-cable-material.component';
import { ElectronicsPCBAMaterialComponent } from './pcba-material/electronics-pcba-material.component';
import { MaterialSustainabilityComponent } from './material-sustainability/material-sustainability.component';
import { StockFormsCategoriesState } from 'src/app/modules/_state/stock-forms-categories.state';
import { MarketMonthState } from 'src/app/modules/_state/market-month.state';
import { UserCanUpdateCostingState } from 'src/app/modules/_state/userCanUpdate-costing.state';
import { NestingAlgoNewComponent } from '../nesting-algo/nesting-algo-new/nesting-algo-new.component';
import { CountryFormMatrixState } from 'src/app/modules/_state/country-form-matrix-state';
import { StockFormsState } from 'src/app/modules/_state/stock-forms.state';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GenericDataTableComponent } from 'src/app/shared/components/generic-data-table/generic-data-table.component';
import { MatTooltip } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { AutoTooltipDirective } from 'src/app/shared/directives/auto-tooltip.directive';
import { InjectionMoldingMaterialComponent } from './injection-molding-material/injection-molding-material.component';
import { ChartComponent } from 'src/app/shared/components/chart/chart.component';
import { ChartTypeEnum } from 'src/app/shared/components/chart/chart.models';
import { CountryDataState } from 'src/app/modules/_state/country.state';
import { CompressionMoldingMaterialComponent } from './compression-molding-material/compression-molding-material.component';
import { SheetMetalMaterialComponent } from './sheet-metal-material/sheet-metal-material.component';
import { PercentagePipe } from 'src/app/shared/pipes/percentage-pipe';
import { FormGroupKeysMaterial } from 'src/app/shared/enums/material-formgroups.enum';
import { MaterialHelperService } from 'src/app/shared/helpers/material-helper.service';
import { InfoTooltipComponent } from 'src/app/shared/components/info-tooltip/info-tooltip.component';
import { DigitalFactoryService } from 'src/app/modules/digital-factory/Service/digital-factory.service';
import { MaterialInfoSignalsService } from 'src/app/shared/signals/material-info-signals.service';
import { IMaterialCalculationByCommodity } from '../../services/IMaterialCalculationByCommodity';
import { MaterialCalculationByCommodityFactory } from '../../services/MaterialCalculationByCommodityFactory';
import { ProcessInfoSignalsService } from 'src/app/shared/signals/process-info-signals.service';
import { CoreAutomationSignalsService } from 'src/app/shared/signals/core-automation-signals.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ChartConstructorType } from 'highcharts-angular';
import { PlasticRubberConfigService } from 'src/app/shared/config/plastic-rubber-config.service';
import { RecalculationUpdateSignalsService } from 'src/app/shared/signals/recalculation-update-signals.service';
import { PCBACalculatorService } from '../../services/material-pcba-calculator';
import { CostSummarySignalsService } from 'src/app/shared/signals/cost-summary-signals.service';
import { BomInfoSignalsService } from 'src/app/shared/signals/bom-info-signals.service';

@Component({
  selector: 'app-costing-material-information',
  templateUrl: './costing-material-information.component.html',
  styleUrls: ['./costing-material-information.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    OnlyNumber,
    FieldCommentComponent,
    CastingMaterialComponent,
    MachiningMaterialComponent,
    TubeBendingComponent,
    InsulationJacketComponent,
    PlasticTubeExtrusionComponent,
    HotForgingClosedDieHotComponent,
    MatIconModule,
    MatTooltip,
    MetalExtrusionMaterialComponent,
    NgbPopover,
    MaterialTableComponent,
    PCBMaterialComponent,
    CustomCableMaterialComponent,
    ElectronicsPCBAMaterialComponent,
    MaterialSustainabilityComponent,
    GenericDataTableComponent,
    MatTabsModule,
    AutoTooltipDirective,
    InjectionMoldingMaterialComponent,
    CompressionMoldingMaterialComponent,
    SheetMetalMaterialComponent,
    ChartComponent,
    InfoTooltipComponent,
    PercentagePipe,
  ],
})
export class CostingMaterialInformationComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() selectedProject: ProjectInfoDto;
  @Input() part: PartInfoDto;
  @Input() commodityId: number;
  @Output() completionPercentageChange = new EventEmitter<number>();
  @Input() countryChangeSubject: Subject<boolean>;
  @ViewChild('materialCategorySelect') materialCategorySelect: any;
  @ViewChild('materialFamilySelect') materialFamilySelect: any;
  @ViewChild('materialDescriptionSelect') materialDescriptionSelect: any;
  @Input() projectInfoList: ProjectInfoDto[];
  canUpdate: boolean;
  private _materialCommodityService: IMaterialCalculationByCommodity = null;
  public filterResult: ProcessMasterDto | undefined;
  selectedMaterialDetails: string = '';
  dataCompletionPercentage: any;
  public currentPart: PartInfoDto;
  public currentCommodityId: number;
  public materialInfoList: MaterialInfoDto[] = [];
  public _materialInfoList: MaterialInfoDto[];
  public costingMaterialInfoform: FormGroup;
  public processMasterDataList: any[] = [];
  public processList: any[] = [];
  public materialTypeMasterList: MaterialTypeDto[] = [];
  public materialTypeList: MaterialTypeDto[] = [];
  public baseMaterialTypeList: MaterialTypeDto[] = [];
  private currentMonthDateTimestamp: number;
  private threeMonthsEndDate: number;
  private threeMonthsStartDate: number;
  private next6MonthsStartDate: number;
  private next6MonthsEndDate: number;
  public past3MonthChange: number = 0;
  public next6MonthChange: number = 0;
  materialCategoryList: string[] = [];
  public materialDescriptionList: MaterialMasterDto[] = [];
  public baseMaterialDescriptionList: MaterialMasterDto[] = [];
  operationNameList: any[] = [];
  weldingValuesForMachineType: any[] = [];
  public isMaterialDetailsDisplay = false;
  // public isMoldCostDisplay = false;
  public isCoreCostDisplay = false;
  public isEdit = false;
  private currentSelectedMatGroupId: number = 0;
  private selectedProcessId: number = 0;
  public materialMarketData: MaterialMarketDataDto = new MaterialMarketDataDto();
  public selectedMaterialInfoId = 0;
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  hasUnsavedEventSub$: Subscription = Subscription.EMPTY;
  nexturltonavigate: any;
  dialogSub: Subscription;
  public commodityType = CommodityType;
  public processFlag = this.materialConfigService.processFlag;
  materialCompositionDtos: any[] = [];
  stockData: any[] = [];
  chartConstructor: ChartConstructorType = 'chart';
  stockConstructor: ChartConstructorType = 'stockChart';
  chartHeight: number = 400;
  barChartType: ChartTypeEnum = ChartTypeEnum.Bar;
  stockChartType: ChartTypeEnum = ChartTypeEnum.Stock;
  stockUpdateFlag = false;
  IsCountryChanged = false;
  manufactureData = [];
  disabledstock = true;
  IsMaterialTypeNonFerrous = false;
  IsMaterialTypePlastics = false;
  public forging = this.materialConfigService.forgingDefaultValues;
  public custom = {
    noOfCableValid: false,
    noOfCableSimilarDia: false,
  };
  showAddNewOption: boolean = false;
  public stockFormList: any = [];
  stockFormCategoriesDto: StockFormCategoriesDto[] = [];
  countryFormMatixDtos: CountryFormMatrixDto[] = [];
  stockFormDtos: StockFormDto[] = [];
  public defaultValues = this.materialConfigService.defaultValues;
  totalSandVolume = 0;
  selectedMaterialInfo: MaterialInfoDto;
  fieldColorsList: FieldColorsDto[] = [];
  afterChange: boolean = false;
  lstdescriptions: any = (DescriptionJson as any).default;
  public popoverHook: NgbPopover;
  url = '';
  name = 'loading...';
  show = false;
  isNewmaterialinfo = false;
  isPageLoad = false;
  public machining = this.materialConfigService.materialMachiningConfigService.machiningFlags;
  public cableTypes = {
    isSolidCore: false,
    isMulticonductor: false,
    isShieldedTwistedPair: false,
    isUnsheldedTwistedPair: false,
    isCoAxial: false,
    isThermalBraidedShelded: false,
  };
  isTypeOfConductorsEnabled = false;
  public FormGroupKeysMaterial = FormGroupKeysMaterial;
  formGroups: Record<string, FormGroup> = {};
  public page: PageEnum;
  public pageEnum = PageEnum;
  public totmaterialList: MaterialInfoDto[];
  public bestProcessIds = [];
  isEnableUnitConversion = false;
  conversionValue: any;
  materialSearchList: any[] = [];
  plasticMaterialList: any[] = [];
  nonFerrousMaterialList: any[] = [];
  typeOfWeldList: any[] = [];
  typeOfMaterialBase: any[] = [];
  laserCutttingTimeList: LaserCuttingTime[] = [];
  thermoFormingList: ThermoForming[] = [];
  currentCountryName: string = '';
  rubberMoldingPartTypeList: any[] = this._plasticRubberConfigService.rubberCuringPartTypes;
  currentSelectedMaterialInfo?: MaterialInfoDto;
  materialSustainabilityData?: MaterialInfoDto;
  _dataExtraction$: Observable<DataExtraction>;
  // _materialInfo$: Observable<MaterialInfoDto[]> = this._store.select(MaterialInfoState.getMaterialInfos);
  _processMasterData$: Observable<ProcessMasterDto[]>;
  _laserCuttting$: Observable<LaserCuttingTime[]>;
  _stampingMetrialLookUp$: Observable<StampingMetrialLookUp[]>;
  _thermoForming$: Observable<ThermoForming[]>;
  _countryData$: Observable<CountryDataMasterDto[]> = this._store.select(CountryDataState.getCountryData);
  private countryList: CountryDataMasterDto[] = [];
  // _bulkMaterialUpdateLoading$ = this._store.select(MaterialInfoState.getBulkMaterialUpdateStatus);
  // bulkUpdateMaterialSubscription$: Subscription = Subscription.EMPTY;
  private unsubscribeAll$: Subject<undefined> = new Subject<undefined>();
  @Input() manufactureDataCheckSubject: Subject<ProcessInfoDto[]>;
  @Output() dirtyCheckEvent = new EventEmitter<boolean>();
  @Output() selectedMaterialInfoOut = new EventEmitter<MaterialInfoDto>();
  @Output() listMaterialInfoOut = new EventEmitter<MaterialInfoDto[]>();
  @Input() recalculateSubject: Subject<PartInfoDto>;
  @Output() recalculationMaterialCompletedEvent = new EventEmitter<any>();
  @Output() mandatoryFieldMissingEvent = new EventEmitter<boolean>();
  _currentMarketMonth$: Observable<string> = this._store.select(MarketMonthState.getSelectedMarketMonth);
  _canUserUpdateCosting$: Observable<boolean> = this._store.select(UserCanUpdateCostingState.getCanUserUpdateCosting);
  currentMarketMonth: string = null;
  _stockFormCategoriesData$: Observable<StockFormCategoriesDto[]> = this._store.select(StockFormsCategoriesState.getStockFormsCategories);
  _countryFormMatrixData$: Observable<CountryFormMatrixDto[]> = this._store.select(CountryFormMatrixState.getCountryFormMatrixs);
  _stockFormData$: Observable<StockFormDto[]> = this._store.select(StockFormsState.getStockForms);
  formIdentifier: CommentFieldFormIdentifierModel = {
    partInfoId: 0,
    screenId: ScreeName.Material,
    primaryId: 0,
    secondaryID: 0,
  };
  coatingGrade = this.materialConfigService.coatingGrade;
  netWeightForAssembly = 0;
  materialCount = 0;
  showMasterBatchSection = false;
  processMachinesList: MedbMachinesMasterDto[] = [];
  billofMaterialList: BillOfMaterialDto[] = [];
  @ViewChild(CastingMaterialComponent) castingMaterialComponent: CastingMaterialComponent;

  // Transfer Press
  transfertPressCriticalityList = this.materialConfigService.criticalityLevels;
  dialogRef!: MatDialogRef<any>;

  masterMaterialColumns = [
    { field: 'materialGroupName', header: 'Category' },
    { field: 'materialTypeName', header: 'Family' },
    { field: 'materialDescription', header: 'Description/Grade' },
  ];

  public tabs: string[] = ['Material Info', 'Cavity and Mold Type', 'Material Details'];
  private materialInfoEffect = effect(() => this.getMaterialInfo(this._materialInfoSignalsService.materialInfos()));

  private bulkMaterialUpdateLoadingEffect = effect(() => {
    if (!this.recalculationUpdateSignalsService.bulkMaterialUpdateLoading()) {
      this.onMaterialRecalculation();
    }
  });

  selectedProcessTypeIdSignal: any;
  selectedMatProcessTypeId: number = 0;
  processTypeIdEffect = effect(() => {
    const processId = this.selectedProcessTypeIdSignal();
    if (processId && this.processList?.length > 0) {
      const processName = this.processList[0]?.data?.find((x) => x.processId === processId)?.primaryProcess;
      this._materialInfoSignalsService.setMaterialProcessTypeName(processName);
    }
  });

  constructor(
    private formbuilder: FormBuilder,
    private materialMasterService: MaterialMasterService,
    private messaging: MessagingService,
    private modalService: NgbModal,
    private router: Router,
    private percentageCalculator: CostingCompletionPercentageCalculator,
    public sharedService: SharedService,
    private blockUiService: BlockUiService,
    private _store: Store,
    private _materialInfoSignalsService: MaterialInfoSignalsService,
    private _simulationService: MaterialCalculatorService,
    private _materialService: MaterialInfoService,
    private _materialPlatingCalcService: MaterialPlatingCalculatorService,
    private _materialCastingCalcService: MaterialCastingCalculatorService,
    private _costingConfig: CostingConfig,
    private _materialMachiningCalcService: MaterialStockMachiningCalculatorService,
    // private _plasticService: PlasticRubberCalculatorService,
    private materialCastingConfigService: MaterialCastingConfigService,
    private materialConfigService: MaterialConfigService,
    private commonService: CommonMaterialCalculationService,
    private materialPCBConfigService: MaterialPCBConfigService,
    private _assemblyService: MaterialSecondaryProcessCalculatorService,
    private _customCableCalculatorService: MaterialCustomCableCalculatorService,
    private _pcbCalcService: PCBCalculatorService,
    private aiCommonService: AiCommonService,
    private materialMapper: CostMaterialMappingService,
    private digitalFactoryHelper: DigitalFactoryHelper,
    private dialog: MatDialog,
    private _materialHelperService: MaterialHelperService,
    private readonly digitalFactoryService: DigitalFactoryService,
    private _materialFactory: MaterialCalculationByCommodityFactory,
    private _processInfoSignalsService: ProcessInfoSignalsService,
    private coreAutomationSignalService: CoreAutomationSignalsService,
    private _plasticRubberConfigService: PlasticRubberConfigService,
    private medbMasterService: MedbMasterService,
    private recalculationUpdateSignalsService: RecalculationUpdateSignalsService,
    private _pcbaCalculatorService: PCBACalculatorService,
    private costSummarySignalsService: CostSummarySignalsService,
    private bomInfoSignalsService: BomInfoSignalsService,
    private _bomService: BomService
  ) {
    this._stockFormCategoriesData$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((result: StockFormCategoriesDto[]) => {
      if (result && result.length > 0) {
        this.stockFormCategoriesDto = result;
        this.setMaterialGroup();
      }
    });
    this._countryFormMatrixData$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((result: CountryFormMatrixDto[]) => {
      if (result && result.length > 0) {
        this.countryFormMatixDtos = result;
      }
    });
    this._countryData$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((result: CountryDataMasterDto[]) => {
      if (result && result.length > 0) {
        this.countryList = result;
      }
    });
    this._currentMarketMonth$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((result: string) => {
      if (result) {
        this.currentMarketMonth = result;
      }
    });
    this._canUserUpdateCosting$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((result: boolean) => {
      this.canUpdate = result;
    });
    this._stockFormData$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((result: StockFormDto[]) => {
      if (result) {
        this.stockFormDtos = result;
      }
    });
    this.aiCommonService.aiSuggestionRetrivedSubject.pipe(takeUntil(this.unsubscribeAll$)).subscribe((result) => {
      this.applyAiSuggestedMaterialInfo(result);
    });
    this.createForm();
    // this.getMaterialInfo();
    this._dataExtraction$ = this._store.select(DataExtractionState.getDataExtraction);
    this._processMasterData$ = this._store.select(ProcessMasterState.getAllProcessMasterData);
    this._laserCuttting$ = this._store.select(LaserCuttingState.getLaserCutting);
    this._stampingMetrialLookUp$ = this._store.select(StampingMetrialLookUpState.getStampingMetrialLookUp);
    this._thermoForming$ = this._store.select(ThermoFormingState.getThermoFormingLookup);
    this.selectedProcessTypeIdSignal = toSignal(this.costingMaterialInfoform!.get('matPrimaryProcessName')!.valueChanges, {
      initialValue: this.costingMaterialInfoform!.get('matPrimaryProcessName')!.value,
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['part'] && changes['part'].currentValue?.partInfoId && changes['part'].currentValue != changes['part'].previousValue) {
      if (
        changes['part'].currentValue?.partInfoId != changes['part'].previousValue?.partInfoId ||
        changes['part'].currentValue?.commodityId != changes['part'].previousValue?.commodityId ||
        changes['part'].currentValue?.mfrCountryId != changes['part'].previousValue?.mfrCountryId
      ) {
        this.clearOnPartChange();
        this.currentPart = changes['part'].currentValue;
        this._materialCommodityService = this._materialFactory.getCalculatorServiveByCommodity(this.currentPart);
        this.materialInfoList = [];
        this.currentCountryName = this.countryList?.find((x) => x.countryId === this.currentPart?.mfrCountryId)?.countryName;
        this.formIdentifier = {
          ...this.formIdentifier,
          partInfoId: this.currentPart?.partInfoId,
        };
        if (this._materialInfoList && this._materialInfoList?.length > 0 && this.currentPart?.partInfoId == this._materialInfoList[0].partInfoId) {
          this.handleExistingMaterialInfo([...this._materialInfoList]);
          this._materialInfoList = [];
        } else {
          this.dispatchMaterialInfo(this.currentPart?.partInfoId);
        }
        this.currentCommodityId = this.currentPart?.commodityId || 0;
        this.getProcessListByCommodityId();
        // this.reset();
        this.getNetWeightForAssembly();
      }
    }
  }

  dispatchMaterialInfo(partInfoId: number) {
    if (partInfoId) {
      // this._store.dispatch(new MaterialInfoActions.GetMaterialInfosByPartInfoId(partInfoId));
      this._materialInfoSignalsService.getMaterialInfosByPartInfoId(partInfoId);
    }
  }

  private subscribeAssign(observer, assignee, minLength, callbackFn = '', oberverParams = null) {
    const observerArr = observer?.split('.');
    // const observerObj = (observerArr.length === 2 && !!oberverParams) ? this[observerArr[0]][observerArr[1]](...oberverParams) :
    //   (observerArr.length === 2) ? this[observerArr[0]][observerArr[1]]() : this[observerArr[0]];
    let observerObj = this[observerArr[0]];
    if (observerArr.length === 2 && !!oberverParams) {
      observerObj = this[observerArr[0]][observerArr[1]](...oberverParams);
    } else if (observerArr.length === 2) {
      observerObj = this[observerArr[0]][observerArr[1]]();
    }
    observerObj.pipe(takeUntil(this.unsubscribe$)).subscribe((result: any[]) => {
      if (result?.length >= minLength) {
        this[assignee] = result;
        !!callbackFn && this[callbackFn]();
      }
    });
  }

  ngOnInit(): void {
    this.materialConfigService.clearProcessTypeFlags(this.processFlag);
    this.subscribeAssign('_thermoForming$', 'thermoFormingList', 1);
    this.subscribeAssign('_laserCuttting$', 'laserCutttingTimeList', 1);
    this.IsCountryChanged = false;
    this.selectedMaterialInfoId = 0;
    [this.isEnableUnitConversion, this.conversionValue] = this.sharedService.setUnitMeasurement();
    this.subscribeAssign('_processMasterData$', 'processMasterDataList', 1, 'getProcessListByCommodityId');
    this.subscribeAssign('materialMasterService.getMaterialByMaterialGroupId', 'plasticMaterialList', 1, '', [MaterialCategory.Plastics]);
    this.subscribeAssign('materialMasterService.getMaterialByMaterialGroupId', 'nonFerrousMaterialList', 1, '', [MaterialCategory.NonFerrous]);
    this.onpageload();
    this.typeOfWeldList = this._costingConfig.typeOfWeld();
    this.typeOfMaterialBase = this._costingConfig.typeOfMaterialBase();
    this.recalculateSubject?.pipe(takeUntil(this.unsubscribe$)).subscribe((e) => {
      this.recalculateMaterialCost(e);
    });
    this.countryChangeSubject?.pipe(takeUntil(this.unsubscribe$)).subscribe((e) => {
      this.IsCountryChanged = e;
    });
    this.manufactureDataCheckSubject?.pipe(takeUntil(this.unsubscribe$)).subscribe((data) => {
      this.manufactureData = data;
    });
    for (const key in FormGroupKeysMaterial) {
      const name = FormGroupKeysMaterial[key as keyof typeof FormGroupKeysMaterial];
      this.formGroups[name] = this.costingMaterialInfoform.get(name) as FormGroup;
    }
    this.completionPercentageChange.emit(0);
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const pastThreeMonth = this.subtractMonths(currentMonth, 3);
    const pastThreeMonthStartIndx = currentMonth - 1;
    const pastThreeMonthEndIndx = pastThreeMonth - 1 === 0 ? 12 : pastThreeMonth - 1;
    const next6Month = currentMonth + 7 > 12 ? currentMonth + 6 - 12 : currentMonth + 6;

    const next6MonthStartIndx = currentMonth - 1;
    const next6MonthEndIndx = next6Month === 12 ? 0 : next6Month - 1;

    const pastYearStart = today.getFullYear();
    const pastYearEnd = today.getFullYear() - (currentMonth === 1 || currentMonth === 2 || currentMonth === 3 ? 1 : 0);
    const nextYearStart = today.getFullYear();
    const nextYearEnd = today.getFullYear() + ([7, 8, 9, 10, 11, 12].includes(currentMonth) ? 1 : 0);

    this.threeMonthsStartDate = Date.UTC(pastYearStart, pastThreeMonthStartIndx, 1);
    this.threeMonthsEndDate = Date.UTC(pastYearEnd, pastThreeMonthEndIndx, 1);

    this.next6MonthsStartDate = Date.UTC(nextYearStart, next6MonthStartIndx, 1);
    this.next6MonthsEndDate = Date.UTC(nextYearEnd, next6MonthEndIndx, 1);
    this.getBillOfMaterial();
  }

  subtractMonths(currentMonth: number, subtractBy: number): number {
    return ((currentMonth - subtractBy - 1 + 12) % 12) + 1;
  }

  ngAfterViewInit() {
    this.costingMaterialInfoform.valueChanges.subscribe((change) => {
      const hasMaterial = this.materialInfoList && this.materialInfoList.length > 0;
      const value = this.percentageCalculator.materialInformation(change, this.processFlag, this.currentPart, hasMaterial);
      this.completionPercentageChange.emit(value);
      this.dataCompletionPercentage = value;
    });
    if (this.currentPart?.partInfoId && this.currentPart?.mfrCountryId && this.materialInfoList?.length === 0) {
      this.aiCommonService.getAiSuggestedMaterialInfo(this.currentPart);
    }
  }

  get sandForCoreFormArray() {
    let formGroup = this.costingMaterialInfoform;
    if (this.processFlag.IsProcessCasting) {
      // formGroup = this.castingMaterialFormGroup;
      formGroup = this.getFormGroup(FormGroupKeysMaterial.Casting);
    } else if (this.processFlag.IsProcessConventionalPCB || this.processFlag.IsProcessRigidFlexPCB || this.processFlag.IsProcessSemiRigidFlexPCB) {
      formGroup = this.getFormGroup(FormGroupKeysMaterial.Pcb);
    } else if (this.processFlag.IsProcessCustomizeCable) {
      formGroup = this.getFormGroup(FormGroupKeysMaterial.CustomCable);
    } else if (this.processFlag.IsProcessMigWelding || this.processFlag.IsProcessTigWelding) {
      formGroup = this.getFormGroup(FormGroupKeysMaterial.SheetMetal);
    }
    return formGroup?.controls?.materialPkgs as FormArray;
  }

  private getMaterialInfo(result: MaterialInfoDto[]) {
    // this.showAddNewOption = false;
    // this._materialInfo$.pipe(takeUntil(this.unsubscribe$), filter(Boolean)).subscribe((result: MaterialInfoDto[]) => {
    if (result && result.length > 0 && this.currentPart?.partInfoId == result[0].partInfoId) {
      this.listMaterialInfoOut.emit(this.materialInfoList);
      this.handleExistingMaterialInfo(result);
    } else {
      // this._materialInfoList = result && result.length > 0 ? result : []; // commented because of selection issue
      this._materialInfoList = [];
      this.selectedMaterialInfo = new MaterialInfoDto();
      this.reset();
      this.showAddNewOption = true;
    }
    // });
  }

  private handleExistingMaterialInfo(result: MaterialInfoDto[]) {
    this.materialInfoList = [...result];
    this.calculateTotalMaterialCost(result);
    if (this.materialInfoList.length > 0) {
      if (!this.costingMaterialInfoform) {
        this.createForm();
      }
    } else {
      this.materialInfoList = [];
      this.selectedMaterialInfoId = 0;
      this.selectedMaterialInfo = new MaterialInfoDto();
      this.selectedMaterialInfoOut.emit(this.selectedMaterialInfo);
      this.listMaterialInfoOut.emit(this.materialInfoList);
      this.reset();
      this.showAddNewOption = true;
    }
    this.handleNewMaterialInfo();
    this.handleSelectedMaterialInfo();
    this.formIdentifier = {
      ...this.formIdentifier,
      primaryId: this.selectedMaterialInfoId,
    };
  }

  private handleNewMaterialInfo() {
    if (this.isNewmaterialinfo && this.materialInfoList.length > 0) {
      this.selectedMaterialInfoId = this.materialInfoList[this.materialInfoList.length - 1].materialInfoId;
      this.selectedMaterialInfoOut.emit(this.materialInfoList[this.materialInfoList.length - 1]);
      this.listMaterialInfoOut.emit(this.materialInfoList);
      this.updateSaveMaterialLoad(this.selectedMaterialInfoId);
      this.isNewmaterialinfo = false;
    }
  }

  private handleSelectedMaterialInfo() {
    if (this.materialInfoList != null && this.materialInfoList.length > 0 && this.selectedMaterialInfoId == 0) {
      this.onEdit(this.materialInfoList[0]);
    } else if (this.materialInfoList != null && this.materialInfoList.length > 0 && this.selectedMaterialInfoId > 0) {
      const materiallatest = this.materialInfoList.find((x) => x.materialInfoId == this.selectedMaterialInfoId);
      if (materiallatest) {
        this.onEdit(materiallatest);
      } else {
        this.selectedMaterialInfoId = 0;
        this.selectedMaterialInfo = new MaterialInfoDto();
      }
    } else {
      this.selectedMaterialInfoId = 0;
      this.selectedMaterialInfo = new MaterialInfoDto();
    }
  }

  private getProcessListByCommodityId() {
    if (this.currentCommodityId > 0) {
      const result = [...(this.processMasterDataList?.filter((x) => x.commodityId == this.currentCommodityId) || [])];
      const groupToValues = result.reduce((obj, item) => {
        obj[item.groupName] = obj[item.groupName] || [];
        obj[item.groupName].push(item);
        return obj;
      }, {});
      this.processList = Object.keys(groupToValues)
        .map((key) => {
          return {
            group: key == 'null' ? '' : key,
            data: groupToValues[key].sort((a: { processId: number }, b: { processId: number }) => {
              // Custom sort for primaryProcess
              const aProcess = a.processId || 0;
              const bProcess = b.processId || 0;

              // Rubber Injection Molding comes after Injection Molding - Single Shot
              const rubberInjectionOrder: number[] = [PrimaryProcessType.InjectionMouldingSingleShot, PrimaryProcessType.InjectionMouldingDoubleShot, PrimaryProcessType.RubberInjectionMolding];
              const aIndex = rubberInjectionOrder.indexOf(aProcess);
              const bIndex = rubberInjectionOrder.indexOf(bProcess);

              if (aIndex !== -1 && bIndex !== -1) {
                return aIndex - bIndex;
              }
              if (aIndex !== -1) return -1;
              if (bIndex !== -1) return 1;

              return aProcess.toString().localeCompare(bProcess.toString());
            }),
          };
        })
        .sort((a, b) => {
          if (a.group < b.group) return -1;
          if (a.group > b.group) return 1;
          return 0;
        });
      this._materialInfoSignalsService.setMaterialProcessList(this.processList);
    }
  }

  private clearOnPartChange() {
    this.currentPart = new PartInfoDto();
    this.materialInfoList = [];
    this.manufactureData = [];
    this.selectedMaterialInfo = new MaterialInfoDto();
    this.selectedMaterialInfoId = 0;
  }

  // clearOnCommodityChange() {
  //   this.materialInfoList = [];
  //   this.selectedMaterialInfo = new MaterialInfoDto();
  //   this.selectedMaterialInfoId = 0;
  // }

  private onpageload() {
    if (this.costingMaterialInfoform) {
      this.costingMaterialInfoform.reset();
    }
    if (!this.costingMaterialInfoform) {
      this.createForm();
    }
    this.handleSelectedMaterialInfo();
    // if (this.materialInfoList != null && this.materialInfoList.length > 0 && this.selectedMaterialInfoId == 0) {
    //   this.onEdit(this.materialInfoList[0]);
    // } else if (this.materialInfoList != null && this.materialInfoList.length > 0 && this.selectedMaterialInfoId > 0) {
    //   const materiallatest = this.materialInfoList.find((x) => x.materialInfoId == this.selectedMaterialInfoId);
    //   if (materiallatest) {
    //     this.onEdit(materiallatest);
    //   } else {
    //     this.selectedMaterialInfoId = 0;
    //   }
    // } else {
    //   this.selectedMaterialInfoId = 0;
    // }
    this.formIdentifier = {
      ...this.formIdentifier,
      primaryId: this.selectedMaterialInfoId,
    };
    if (this.sandForCoreFormArray.length === 0) {
      this.sandForCoreFormArray.push(this.materialCastingConfigService.sandForCoreFormGroup());
    }
    if (this.cableHarnessTypeFormArray.length == 0) {
      this.cableHarnessTypeFormArray.push(this.cableHarnessFormGroup());
    }
    this.afterChange = false;
    this.dirtyCheckEvent.emit(this.afterChange);
  }

  setMaterialGroup() {
    let categoryList = this.stockFormCategoriesDto.map((x) => x.materialGroup);
    let catList = [...new Set(categoryList)];
    const othCat = catList.find((x) => x === 'Other');
    const tempArray = catList.filter((x) => x !== 'Other');
    tempArray.sort((a, b) => {
      return a.localeCompare(b);
    });
    tempArray.push(othCat);
    this.materialCategoryList = tempArray;
  }

  onMaterialFormValueChange(event?: Event) {
    if (event && (event.target as HTMLInputElement)?.type === 'radio') {
      return; // ignoring radio button selection changes
    }
    this.afterChange = true;
    this.dirtyCheckEvent.emit(this.afterChange);
  }

  private createForm() {
    this.costingMaterialInfoform = this.formbuilder.group(this.materialMapper.getMaterialFormFields(this.materialInfoList, this.conversionValue, this.isEnableUnitConversion));
    this.costingMaterialInfoform
      .get('volumePurchased')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((volumePurchased) => {
        if (volumePurchased !== null && volumePurchased !== undefined) {
          const volumeDiscount = volumePurchased > 0 ? this.getVolumeDiscount(volumePurchased) : 0;
          this.costingMaterialInfoform.controls['volumeDiscountPer'].setValue(volumeDiscount, { emitEvent: false });
          const materialPricePerKg = this.costingMaterialInfoform.controls['matPrice']?.value || 0;
          const matPriceGross = volumeDiscount > 0 ? this.sharedService.isValidNumber(materialPricePerKg * (1 - volumeDiscount / 100)) : materialPricePerKg;
          this.costingMaterialInfoform.controls['matPriceGross'].setValue(matPriceGross, { emitEvent: false });
        }
      });
  }

  getFormGroup(groupName: string): FormGroup {
    return this.costingMaterialInfoform?.get(groupName) as FormGroup;
  }

  get f() {
    return this.costingMaterialInfoform.controls;
  }

  get visibleTabs(): string[] {
    return this.tabs.filter(
      (t) =>
        !(
          t === 'Cavity and Mold Type' &&
          ([this.commodityType.StockMachining, this.commodityType.Assembly].includes(this.currentPart?.commodityId) ||
            this.processFlag.IsProcessTypeSandForCore ||
            this.processFlag.IsProcessTypeSandForMold)
        )
    );
  }

  private reset() {
    if (this.costingMaterialInfoform) {
      this.costingMaterialInfoform.reset();
      this.costingMaterialInfoform.patchValue(this.materialMapper.materialFormReset(this.conversionValue, this.isEnableUnitConversion));
      this.isMaterialDetailsDisplay = false;
      this.isCoreCostDisplay = false;
      // this.isMoldCostDisplay = false;
      this.materialTypeList = [];
      this.materialDescriptionList = [];
      this.materialMarketData = {} as MaterialMarketDataDto;
    }
  }

  public onPrimaryProcessChange(event: any) {
    const processValueId = event.currentTarget.value;
    this.selectedProcessId = Number(processValueId);
    if ([PrimaryProcessType.ConventionalPCB].includes(this.selectedProcessId)) {
      this.tabs = ['Material Info'];
    } else if (
      [
        PrimaryProcessType.LaserCutting,
        PrimaryProcessType.PlasmaCutting,
        PrimaryProcessType.OxyCutting,
        PrimaryProcessType.TurretPunch,
        PrimaryProcessType.StampingProgressive,
        PrimaryProcessType.StampingStage,
        PrimaryProcessType.TransferPress,
      ].includes(this.selectedProcessId)
    ) {
      this.tabs = ['Material Info', 'Nesting Layout', 'Material Details'];
    } else if (
      [
        PrimaryProcessType.MigWelding,
        PrimaryProcessType.TigWelding,
        PrimaryProcessType.NickelPlating,
        PrimaryProcessType.CopperPlating,
        PrimaryProcessType.ChromePlating,
        PrimaryProcessType.TinPlating,
        PrimaryProcessType.ZincPlating,
        PrimaryProcessType.SilverPlating,
        PrimaryProcessType.GoldPlating,
        PrimaryProcessType.R2RPlating,
        PrimaryProcessType.Galvanization,
        PrimaryProcessType.PowderCoating,
        PrimaryProcessType.Painting,
        PrimaryProcessType.TubeLaserCutting,
      ].includes(this.selectedProcessId)
    ) {
      this.tabs = ['Material Info', 'Material Details'];
    } else {
      this.tabs = ['Material Info', 'Cavity and Mold Type', 'Material Details'];
    }

    this.mapOnPrimaryProcessChange(Number(processValueId));
    if (this.processFlag.IsProcessTypePlating || this.processFlag.IsProcessTypeWetPainting || this.processFlag.IsProcessTypeSiliconCoatingAuto || this.processFlag.IsProcessTypeSiliconCoatingSemi) {
      this.setBaseMaterialData(null);
    }
    if (this.processFlag.IsProcessHPDCCasting) {
      this.costingMaterialInfoform.controls['secondaryProcessId'].setValue('');
      this.onCastingSubProcessChange({ currentTarget: { value: '' } });
    }
    if (this.processFlag.IsProcessTypeAssembly) {
      this.costingMaterialInfoform.controls['materialCategory'].setValue('Other');

      if (this.materialCategorySelect) {
        const event = new Event('change');
        this.materialCategorySelect.nativeElement.dispatchEvent(event);
      }
    }

    if ([PrimaryProcessType.MigWelding, PrimaryProcessType.TigWelding].includes(this.selectedProcessId)) {
      if (!this.costingMaterialInfoform.controls['materialDescription'].value) {
        (this.costingMaterialInfoform.get('materialPkgs') as FormArray).clear(); // Removes all controls
        this.sandForCoreFormArray.length > 0 && this.sandForCoreFormArray.clear();
      }
    }

    this.setStockFormIfMaterialAlreadySelected();
  }

  private setStockFormIfMaterialAlreadySelected() {
    const selectedMatDesc = this.costingMaterialInfoform?.controls['materialDescription']?.value;
    const currentMaterialPrice = this.costingMaterialInfoform?.controls['matPrice']?.value;
    if (selectedMatDesc && currentMaterialPrice) {
      const process =
        this.processList.length > 0 && this.processList[0].data.find((x) => x.processId === (this.selectedProcessId === 0 ? this.selectedMaterialInfo?.processId : this.selectedProcessId));
      const stockForm = this.getStockForm(process, this.selectedMaterialInfo?.dimZ ?? this.sharedService.extractedMaterialData?.DimZ);
      if (stockForm) {
        const stockFormId = this.stockFormList.find((x) => x.formName === stockForm)?.stockFormId || 0;
        const stockFormMultiplier = this.countryFormMatixDtos.find((x) => x.countryId === this.materialMarketData.countryId && x.stockFormId === stockFormId)?.multiplier || 1;
        const updatedMatPrice = this.roundNumber(currentMaterialPrice * stockFormMultiplier);
        this.costingMaterialInfoform.controls['stockForm']?.setValue(stockForm);
        if (this.forging.hotForgingClosedDieHot || this.forging.hotForgingOpenDieHot || this.forging.coldForgingClosedDieHot || this.processFlag.IsProcessColdForgingColdHeading) {
          this.updateStockFormFlags();
        }
        this.costingMaterialInfoform.controls['matPrice'].setValue(updatedMatPrice);
      }
    }
    if (this.processFlag.IsProcessTypeRubberInjectionMolding) {
      this.getProcessMachinesList(ProcessType.RubberInjectionMolding);
    }
    if (this.processFlag.IsProcessTypeCompressionMolding) {
      this.getProcessMachinesList(ProcessType.CompressionMolding);
    }
    if (this.processFlag.IsProcessTypeTransferMolding) {
      this.getProcessMachinesList(ProcessType.TransferMolding);
    }
  }

  private getProcessMachinesList(processTypeId?: number): void {
    if (processTypeId && this.currentPart?.mfrCountryId) {
      this.medbMasterService
        .getMedbMachineMasterByProcessTypeId(this.currentPart.mfrCountryId, processTypeId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: (result: MedbMachinesMasterDto[]) => {
            this.processMachinesList = result;
          },
        });
    }
  }

  private mapOnPrimaryProcessChange(processValueId: number): void {
    this.processFlag.IsProcessCustomizeCable && (this.showAddNewOption = false);
    this.processFlag = {
      ...this.materialConfigService.setPrimaryProcessTypeFlags(this.processFlag, processValueId, this.currentCommodityId),
    };
    this.forging = {
      ...this.materialConfigService._materialForgingConfigService.setForgingFlags(this.forging, processValueId),
    };
    this.machining = {
      ...this.materialConfigService.materialMachiningConfigService.getMachiningFlags(Number(processValueId)),
    };
    this.materialSearchList = [];
    this.selectedMaterialInfo?.processId != processValueId && this.resetDataExtracted();
    this.setAllowanceAndRecovery();
    if (this.forging.hotForgingClosedDieHot || this.forging.hotForgingOpenDieHot || this.forging.coldForgingClosedDieHot || this.processFlag.IsProcessColdForgingColdHeading) {
      this.updateStockFormFlags();
    }
    this.updateFormControlValues();
    processValueId && this.calculateCost();
  }

  private setAllowanceAndRecovery(): void {
    if (this.forging.hotForgingClosedDieHot || this.forging.hotForgingOpenDieHot) {
      this.setForgingAllowanceValues(10, 5, 5, 5, 95);
    } else if (this.forging.coldForgingClosedDieHot) {
      this.setForgingAllowanceValues(7, 1, 1, 1, 95);
    }
  }

  private setForgingAllowanceValues(height: number, width: number, length: number, diameter: number, scrapRecovery: number): void {
    this.costingMaterialInfoform.controls['heightAllowance'].setValue(height);
    this.costingMaterialInfoform.controls['widthAllowance'].setValue(width);
    this.costingMaterialInfoform.controls['lengthAllowance'].setValue(length);
    this.costingMaterialInfoform.controls['diameterAllowance'].setValue(diameter);
    this.costingMaterialInfoform.controls['scrapRecovery'].setValue(scrapRecovery);
  }

  private updateStockFormFlags(): void {
    const stockForm = this.costingMaterialInfoform.controls['stockForm'].value;
    if (stockForm) {
      const stockFormId = this.stockFormDtos.find((x) => x.formName === stockForm)?.stockFormId;
      this.showMasterBatchSection = this.processFlag.IsProcessTypeInjectionMolding && stockFormId === this.materialConfigService.StockForm.GranulesWithMasterbatch;
      this.processFlag.IsProcessStockFormRound = stockForm === 'Round Bar';
      this.processFlag.IsProcessStockFormWire = stockForm === 'Wire';
      if (this.forging.hotForgingClosedDieHot || this.forging.hotForgingOpenDieHot) {
        this.processFlag.IsProcessStockFormRectangleBar = stockForm === 'Rectangular Bar';
      }
    } else {
      this.showMasterBatchSection = false;
      this.processFlag.IsProcessStockFormRound = false;
      this.processFlag.IsProcessStockFormWire = false;
      if (this.forging.hotForgingClosedDieHot || this.forging.hotForgingOpenDieHot) {
        this.processFlag.IsProcessStockFormRectangleBar = false;
      }
    }
  }

  private updateFormControlValues() {
    if (this.processFlag.IsProcessMachining) {
      this.costingMaterialInfoform.controls['coilDiameter'].setValue(0);
      this.costingMaterialInfoform.controls['cuttingAllowance'].setValue(this.sharedService.convertUomInUI(1, this.conversionValue, this.isEnableUnitConversion));
      this.costingMaterialInfoform.controls['enterStartEndScrapLength'].setValue(this.sharedService.convertUomInUI(10, this.conversionValue, this.isEnableUnitConversion));
    }
    if (this.forging.hotForgingClosedDieHot || this.forging.hotForgingOpenDieHot || this.forging.coldForgingClosedDieHot || this.processFlag.IsProcessColdForgingColdHeading) {
      this.costingMaterialInfoform.controls['cuttingAllowance'].setValue(this.sharedService.convertUomInUI(3, this.conversionValue, this.isEnableUnitConversion));
    }
    // if (this.processFlag.IsProcessCableAssembly) {
    //   this.operationNameList = this.materialConfigService.getCableTypeList();
    // }
    if (this.processFlag.IsProcessStampingStage) {
      this.costingMaterialInfoform.controls['enterStartEndScrapLength'].setValue(this.sharedService.convertUomInUI(20, this.conversionValue, this.isEnableUnitConversion));
    } else if (this.processFlag.IsProcessColdForgingColdHeading) {
      this.costingMaterialInfoform.controls['enterStartEndScrapLength'].setValue(this.sharedService.convertUomInUI(10, this.conversionValue, this.isEnableUnitConversion));
    }
    this.costingMaterialInfoform.controls['partAllowance'].setValue(0);
    if (this.processFlag.IsProcessLaserCutting || this.processFlag.IsProcessTPP || this.processFlag.IsProcessPlasmaCutting || this.processFlag.IsProcessOxyCutting) {
      this.costingMaterialInfoform.controls['coilWidth'].setValue(this.sharedService.convertUomInUI(1250, this.conversionValue, this.isEnableUnitConversion));
      this.costingMaterialInfoform.controls['coilLength'].setValue(this.sharedService.convertUomInUI(2500, this.conversionValue, this.isEnableUnitConversion));
    } else if (this.processFlag.IsProcessStampingStage || this.processFlag.IsProcessStampingProgressive) {
      this.costingMaterialInfoform.controls['coilWidth'].setValue(this.sharedService.convertUomInUI(500, this.conversionValue, this.isEnableUnitConversion));
      this.costingMaterialInfoform.controls['coilLength'].setValue(this.sharedService.convertUomInUI(12000, this.conversionValue, this.isEnableUnitConversion));
    } else if (this.processFlag.IsProcessThermoForming) {
      //this.costingMaterialInfoform.controls['stockForm'].setValue('Sheet');
      //this.setMaterialGroup('Sheet');
    }
  }

  private mapOnPrimaryProcessEditCall(processValueId: number): void {
    this.processFlag.IsProcessCustomizeCable && (this.showAddNewOption = false);
    if ([PrimaryProcessType.ConventionalPCB].includes(Number(processValueId))) {
      this.tabs = ['Material Info'];
    } else if (
      [
        PrimaryProcessType.LaserCutting,
        PrimaryProcessType.PlasmaCutting,
        PrimaryProcessType.OxyCutting,
        PrimaryProcessType.TurretPunch,
        PrimaryProcessType.StampingProgressive,
        PrimaryProcessType.StampingStage,
        PrimaryProcessType.TransferPress,
      ].includes(processValueId)
    ) {
      this.tabs = ['Material Info', 'Nesting Layout', 'Material Details'];
    } else if (
      [
        PrimaryProcessType.MigWelding,
        PrimaryProcessType.TigWelding,
        PrimaryProcessType.NickelPlating,
        PrimaryProcessType.CopperPlating,
        PrimaryProcessType.ChromePlating,
        PrimaryProcessType.TinPlating,
        PrimaryProcessType.ZincPlating,
        PrimaryProcessType.SilverPlating,
        PrimaryProcessType.GoldPlating,
        PrimaryProcessType.R2RPlating,
        PrimaryProcessType.Galvanization,
        PrimaryProcessType.PowderCoating,
        PrimaryProcessType.Painting,
        PrimaryProcessType.TubeLaserCutting,
      ].includes(processValueId)
    ) {
      this.tabs = ['Material Info', 'Material Details'];
    } else {
      this.tabs = ['Material Info', 'Cavity and Mold Type', 'Material Details'];
    }

    this.processFlag = {
      ...this.materialConfigService.setPrimaryProcessTypeFlags(this.processFlag, processValueId, this.currentCommodityId),
    };
    this.forging = {
      ...this.materialConfigService._materialForgingConfigService.setForgingFlags(this.forging, processValueId),
    };
    this.machining = {
      ...this.materialConfigService.materialMachiningConfigService.getMachiningFlags(Number(processValueId)),
    };
    if (this.processFlag.IsProcessStampingStage || this.processFlag.IsProcessStampingProgressive) {
      this.costingMaterialInfoform.controls['enterStartEndScrapLength'].setValue(this.sharedService.convertUomInUI(20, this.conversionValue, this.isEnableUnitConversion));
    } else if (this.processFlag.IsProcessColdForgingColdHeading) {
      this.costingMaterialInfoform.controls['enterStartEndScrapLength'].setValue(this.sharedService.convertUomInUI(10, this.conversionValue, this.isEnableUnitConversion));
    }

    if (this.processFlag.IsProcessTypeRubberInjectionMolding) {
      this.getProcessMachinesList(ProcessType.RubberInjectionMolding);
    }
    if (this.processFlag.IsProcessTypeCompressionMolding) {
      this.getProcessMachinesList(ProcessType.CompressionMolding);
    }
    if (this.processFlag.IsProcessTypeTransferMolding) {
      this.getProcessMachinesList(ProcessType.TransferMolding);
    }
  }

  public onCastingSubProcessChange(event: any) {
    const processValueId = Number(event.currentTarget.value) || 0;
    this.processFlag.IsProcessTypePouring = processValueId === SubProcessType.MetalForPouring;
    this.processFlag.IsProcessTypeSandForCore = processValueId === SubProcessType.SandForCore;
    this.processFlag.IsProcessTypeSandForMold = processValueId === SubProcessType.SandForMold;
    this.processFlag.IsProcessTypePatternWax = processValueId === SubProcessType.PatternWax;
    this.processFlag.IsProcessTypeSlurryCost = processValueId === SubProcessType.SlurryCost;
    this.processFlag.IsProcessTypeZirconSand = processValueId === SubProcessType.ZirconSand;

    if (this.processFlag.IsProcessSand3DPrinting) {
      this.autoPullSandData('no bake sand');
    } else if (this.processFlag.IsProcessShellCasting) {
      this.autoPullSandData('shell sand');
    } else if (this.processFlag.IsProcessTypeSandForCore) {
      this.autoPullSandData('core sand');
    } else if (this.processFlag.IsProcessTypePatternWax) {
      this.autoPullSandData('pattern wax');
    } else if (this.processFlag.IsProcessTypeSandForMold) {
      (this.processFlag.IsProcessTypeGreenAuto || this.processFlag.IsProcessTypeGreenSemiAuto) && this.autoPullSandData('green sand');
      this.processFlag.IsProcessNoBakeCasting && this.autoPullSandData('no bake sand');
      this.processFlag.IsProcessVProcessSandCasting && this.autoPullSandData('silica sand');
    }

    processValueId && this.calculateCost();
  }

  public onGroupChange(evt: any) {
    const category = evt.currentTarget.value;
    this.mapOnGroupChange(category);
  }

  onStockFormChange(evt: any) {
    const stockForm = evt.currentTarget.value;
    if (stockForm) {
      const stockFormId = this.stockFormDtos.find((x) => x.formName === stockForm)?.stockFormId;
      if (this.materialMarketData) {
        this.setSupplierValues(this.materialMarketData.materialMasterId, stockForm, this.currentSelectedMaterialInfo, this.fieldColorsList);
      }
      this.processFlag.IsProcessStockFormRound = stockForm === 'Round Bar';
      this.processFlag.IsProcessStockFormWire = stockForm === 'Wire';
      this.processFlag.IsProcessStockFormRectangleBar = stockForm === 'Rectangular Bar';
      this.showMasterBatchSection = this.processFlag.IsProcessTypeInjectionMolding && stockFormId === this.materialConfigService.StockForm.GranulesWithMasterbatch;
    } else {
      this.processFlag.IsProcessStockFormRound = false;
      this.processFlag.IsProcessStockFormWire = false;
      this.processFlag.IsProcessStockFormRectangleBar = false;
    }
    this.calculateCost();
  }

  public onAddMaterial() {
    this.reset();
    this.fieldColorsList = [];
    this.sandForCoreFormArray.length > 0 && this.sandForCoreFormArray.clear();
    this.cableHarnessTypeFormArray.length > 0 && this.cableHarnessTypeFormArray.clear();
    this.clearProcessTypeFlags();
    this.onFormSubmit(true);
  }

  addCableHarnessMaterial() {
    this.cableHarnessTypeFormArray.push(this.cableHarnessFormGroup());
  }

  private cableHarnessFormGroup(): FormGroup {
    const formGroup = this.formbuilder.group({
      submaterialId: 0,
      materialInfoId: this.selectedMaterialInfoId || 0,
      materialTypeId: 0,
      type: 0,
      ulType: 0,
      wireGuage: 0,
      spoolLength: 0,
      cost: 0,
      ulStyle: 0,
      manufacturer: 0,
      mpnOrPart: 0,
      noofConnectorOrCables: 0,
      moq: 0,
      makeOrBuy: 0,
      materialOverHead: 0,
      resinHardener: 0,
      resinRatio: 0,
      resinCostPerKg: 0,
      resinHardenerCostPerKg: 0,
      requiredweight: 0,
      requiredLength: 0,
      isCable: false,
      isConnector: false,
      isTerminal: false,
      isCustomisedInjectionMolded: false,
      isOverMoldMaterial: false,
      isCustomisedStamping: false,
      isHeatShrinkTube: false,
      isElectronic: false,
      isSTDPurchasePartCable: false,
      isSTDPurchasePartTape: false,
      isPotting: false,
    });
    return formGroup;
  }

  setFormBasedOnCableTypeChange(event: any, index: number) {
    const processType = event;
    (this.cableHarnessTypeFormArray.controls as FormGroup[])[index].patchValue({
      isCable: processType == CableType.Cable ? true : false,
      isConnector: processType == CableType.Connector ? true : false,
      isTerminal: processType == CableType.Terminal ? true : false,
      isCustomisedInjectionMolded: processType == CableType.CustomisedInjectionMolded ? true : false,
      isOverMoldMaterial: processType == CableType.OverMoldMaterial ? true : false,
      isCustomisedStamping: processType == CableType.CustomisedStamping ? true : false,
      isHeatShrinkTube: processType == CableType.HeatShrinkTube ? true : false,
      isElectronic: processType == CableType.Electronic ? true : false,
      isSTDPurchasePartCable: processType == CableType.STDPurchasePartCable ? true : false,
      isSTDPurchasePartTape: processType == CableType.STDPurchasePartTape ? true : false,
      isPotting: processType == CableType.Potting ? true : false,
      materialTypeId: processType,
      type: 0,
      ulType: 0,
      wireGuage: 0,
      spoolLength: 0,
      cost: 0,
      ulStyle: 0,
      manufacturer: 0,
      mpnOrPart: 0,
      noofConnectorOrCables: 0,
      moq: 0,
      makeOrBuy: 0,
      materialOverHead: 0,
      resinHardener: 0,
      resinRatio: 0,
      resinCostPerKg: 0,
      resinHardenerCostPerKg: 0,
      requiredweight: 0,
      requiredLength: 0,
    });
  }

  cableTypeChange(event: any, index: number) {
    this.setFormBasedOnCableTypeChange(event.currentTarget.value, index);
  }

  get cableHarnessTypeFormArray() {
    return this.costingMaterialInfoform?.controls?.cableHarnessType as FormArray;
  }

  get formAryLens() {
    return this.cableHarnessTypeFormArray?.controls?.length;
  }

  onDeletecableHarness(index: number) {
    if (this.cableHarnessTypeFormArray?.controls) {
      this.cableHarnessTypeFormArray.controls.splice(index, 1);
      this.calculateCost();
      if (!this.afterChange) {
        this.afterChange = true;
        this.dirtyCheckEvent.emit(this.afterChange);
      }
    }
  }

  clearProcessTypeFlags() {
    this.processFlag = {
      ...this.processFlag,
      ...this.materialConfigService.clearProcessTypeFlags(this.processFlag),
    };
    this.machining = {
      ...this.materialConfigService.materialMachiningConfigService.machiningFlags,
    };
    this.forging.hotForgingClosedDieHot = false;
    this.forging.hotForgingOpenDieHot = false;
    this.forging.coldForgingClosedDieHot = false;
    this.forging.coldForgingColdHeadingDie = false;
    this.fieldColorsList = [];
    this.materialSearchList = [];
    this.costingMaterialInfoform.controls['searchText'].setValue('');
    this.custom.noOfCableValid = false;
    this.custom.noOfCableSimilarDia = false;
  }

  private mapOnGroupChange(category: string, materialGroupId?: number): void {
    this.materialTypeList = [];
    this.materialDescriptionList = [];
    this.costingMaterialInfoform.controls.materialDescription.setValue(0);
    let groupId = materialGroupId ?? this.stockFormCategoriesDto.find((x) => x.materialGroup == category)?.materialGroupId;
    let matTypeList = this.stockFormCategoriesDto
      .filter((x) => x.materialGroupId === groupId)
      .map((x) => ({ materialTypeId: x.materialTypeId, materialTypeName: x.materialType, materialGroupId: x.materialGroupId }) as MaterialTypeDto);
    this.materialTypeList = [...new Set(matTypeList)].sort((a, b) => a.materialTypeName.localeCompare(b.materialTypeName));
    if (this.costingMaterialInfoform) {
      this.costingMaterialInfoform.controls['materialFamily'].setValue('');
      this.costingMaterialInfoform.controls['materialDescription'].setValue('');
      this.costingMaterialInfoform.controls['matPrice'].setValue('');
      this.costingMaterialInfoform.controls['scrapPrice'].setValue('');
      this.costingMaterialInfoform.controls['density'].setValue('');
      this.costingMaterialInfoform.controls['clampingPressure'].setValue('');
      this.costingMaterialInfoform.controls['meltTemp'].setValue('');
      this.costingMaterialInfoform.controls['moldTemp'].setValue('');
      this.costingMaterialInfoform.controls['ejectTemp'].setValue('');
      this.costingMaterialInfoform.controls['materialDesc'].setValue('');
      this.costingMaterialInfoform.controls.countryName.setValue('');
      this.defaultValues.scrapPrice = 0;
      this.defaultValues.materialPrice = 0;
      this.defaultValues.density = 0;
      this.defaultValues.sandCost = 0;
      if (Number(groupId) === Number(13)) {
        const cat = this.stockFormCategoriesDto.find((x) => x.materialGroup === category);
        if (cat) {
          this.costingMaterialInfoform.controls['materialFamily'].setValue(cat.materialTypeId);
          if (this.materialFamilySelect) {
            const customEvent = new CustomEvent('change', {
              detail: { value: cat.materialTypeId },
            });
            this.materialFamilySelect.nativeElement.dispatchEvent(customEvent);
          }
        }
      }
    }
  }

  doCalculateCost($event) {
    const { fieldName, fieldValue, index, customCableMarketDataDto, materialCategory, isAutomationEntry, dataItems } = $event;
    if (customCableMarketDataDto && materialCategory && isAutomationEntry !== undefined) {
      this.calculateCost(fieldName, fieldValue, index, customCableMarketDataDto, materialCategory, isAutomationEntry);
    } else if (dataItems !== undefined) {
      this.laminatesList = dataItems?.laminatesList;
      this.prepregList = dataItems?.prepregList;
      this.calculateCost(fieldName, fieldValue, index);
    } else {
      this.calculateCost(fieldName, fieldValue, index);
    }
  }

  onBlurEvent(event: any): void {
    const targetElement = event.target as HTMLInputElement;
    if (targetElement) {
      const formControlName = targetElement.getAttribute('formControlName');
      if (formControlName) {
        const control = this.costingMaterialInfoform.get(formControlName);
        if (control && control.dirty && control.touched) {
          this.calculateCost();
        }
      }
    }
  }

  private formPristineUntouchMarking() {
    for (const el in this.costingMaterialInfoform.controls) {
      if (Object.values(FormGroupKeysMaterial).includes(el as FormGroupKeysMaterial)) {
        const frm = this._materialHelperService.getMatchingFormGroupByElement(el, this.processFlag, this.forging, this.currentPart, this.getFormGroup.bind(this));
        if (frm) {
          for (const passEl in frm.controls) {
            if (frm.controls[passEl] && !frm.controls[passEl].value && frm.controls[passEl].value === null) {
              frm.controls[passEl].markAsPristine();
              frm.controls[passEl].markAsUntouched();
              this.fieldColorsList = this.fieldColorsList.filter((x) => x.formControlName !== passEl);
            }
          }
        }
      } else {
        if (this.costingMaterialInfoform.controls[el] && !this.costingMaterialInfoform.controls[el].value && this.costingMaterialInfoform.controls[el].value === null) {
          this.costingMaterialInfoform.controls[el].markAsPristine();
          this.costingMaterialInfoform.controls[el].markAsUntouched();
          this.fieldColorsList = this.fieldColorsList.filter((x) => x.formControlName !== el);
        }
      }
      const sustainabilityForm = this.getFormGroup(FormGroupKeysMaterial.MaterialSustainability);
      for (const passElSustainability in sustainabilityForm.controls) {
        if (sustainabilityForm.controls[passElSustainability] && !sustainabilityForm.controls[passElSustainability].value && sustainabilityForm.controls[passElSustainability].value === null) {
          sustainabilityForm.controls[passElSustainability].markAsPristine();
          sustainabilityForm.controls[passElSustainability].markAsUntouched();
          this.fieldColorsList = this.fieldColorsList.filter((x) => x.formControlName !== passElSustainability);
        }
      }
    }
  }

  calculateCost(fieldName = '', fieldValue = 0, index = 0, customCableMarketDataDto = null, materialType: number = 0, isAutomationEntry: boolean = false) {
    fieldName === 'partTickness' && !this.processFlag.IsProcessSpotWelding && this.costingMaterialInfoform.controls['wireDiameter'].setValue(0);
    fieldName === 'typeOfMaterialBase' && this.processFlag.IsProcessTypeGalvanization && this.costingMaterialInfoform.controls['paintCoatingTickness'].setValue(0);
    if (fieldName === 'wireDiameter' && this.processFlag.IsProcessSpotWelding) {
      let tong = this.costingMaterialInfoform.controls['wireDiameter'].value || 6;
      if (tong <= 6) {
        tong = 6;
      } else if (tong <= 12) {
        tong = 12;
      } else {
        tong = 18;
      }
      this.costingMaterialInfoform.controls['wireDiameter'].setValue(tong);
    } else if (fieldName !== '' && fieldValue !== 0) {
      this.costingMaterialInfoform.controls[fieldName].setValue(fieldValue);
    }
    switch (true) {
      case this.processFlag.IsProcessCasting &&
        (this.processFlag.IsProcessNoBakeCasting ||
          this.processFlag.IsProcessShellCasting ||
          this.processFlag.IsProcessGreenCasting ||
          this.processFlag.IsProcessGDCCasting ||
          this.processFlag.IsProcessLPDCCasting ||
          this.processFlag.IsProcessVProcessSandCasting ||
          this.processFlag.IsProcessSand3DPrinting) &&
        this.processFlag.IsProcessTypeSandForCore &&
        ['coreShape', 'coreLength', 'coreWidth', 'coreHeight', 'coreVolume'].includes(fieldName):
        if (fieldName === 'coreVolume') {
          (this.sandForCoreFormArray.controls as FormGroup[])[index]?.patchValue({
            coreArea: 0,
            coreWeight: 0,
          });
        } else {
          (this.sandForCoreFormArray.controls as FormGroup[])[index]?.patchValue({
            coreArea: 0,
            coreVolume: 0,
            coreWeight: 0,
          });
        }
        break;
      // Add more cases here if needed for other processFlag/fieldName combinations
      default:
        // No action needed
        break;
    }
    const subprocessDirtyList = this.fieldColorsList.filter((x) => x.subProcessIndex !== null);
    this.formPristineUntouchMarking();
    // this.fieldColorsList = this.fieldColorsList.concat(subprocessDirtyList);
    this.fieldColorsList = [
      ...this.fieldColorsList,
      ...subprocessDirtyList.filter((item) => !this.fieldColorsList.some((existing) => existing.id === item.id && existing.subProcessIndex === item.subProcessIndex)),
    ];
    if (this.sharedService.extractedMaterialData && Number(this.costingMaterialInfoform.controls['matPrimaryProcessName'].value) > 0) {
      this.setExtractData();
    }
    let materialInfo = new MaterialInfoDto();
    materialInfo.laminatesList = this.laminatesList;
    materialInfo.prepregList = this.prepregList;
    if (customCableMarketDataDto) {
      this.materialMapper.materialCustomCableMapper.defaultValuesForCalculation(materialInfo, customCableMarketDataDto);
    } else {
      materialInfo.materialMarketData = this.materialMarketData;
      materialInfo.materialPricePerKg = this.costingMaterialInfoform.controls['matPrice'].value != null ? this.costingMaterialInfoform.controls['matPrice'].value : this.defaultValues.materialPrice;
      // materialInfo.regrindAllowance =
      //   this.costingMaterialInfoform.controls['regrindAllowance'].value != null ? this.costingMaterialInfoform.controls['regrindAllowance'].value : this.defaultValues.regrindAllowance;
      //materialInfo.utilisation = this.costingMaterialInfoform.controls['utilisation'].value != null ? this.costingMaterialInfoform.controls['utilisation'].value : this.defaultValues.utilisation;
      //materialInfo.netWeight = this.costingMaterialInfoform.controls['netWeight'].value != null ? this.costingMaterialInfoform.controls['netWeight'].value : this.defaultValues.netWeight;
      if (this.costingMaterialInfoform.controls['utilisation'].value != null) {
        materialInfo.utilisation = this.costingMaterialInfoform.controls['utilisation'].value;
      } else {
        materialInfo.utilisation = 0;
        this.fieldColorsList = this.fieldColorsList.map((x) => (x.formControlName === 'utilisation' ? { ...x, isDirty: false } : x));
      }
      if (this.costingMaterialInfoform.controls['netWeight'].value != null) {
        materialInfo.netWeight = this.costingMaterialInfoform.controls['netWeight'].value;
      } else {
        materialInfo.netWeight = 0;
        this.fieldColorsList = this.fieldColorsList.map((x) => (x.formControlName === 'netWeight' ? { ...x, isDirty: false } : x));
      }
      if (this.processFlag.IsProcessMetalTubeExtrusion) {
        this.defaultValues.scrapPrice = materialInfo.materialPricePerKg * 0.6;
      }
      materialInfo.materialInfoId = this.selectedMaterialInfoId || 0;
      materialInfo.scrapPricePerKg = this.costingMaterialInfoform.controls['scrapPrice'].value != null ? this.costingMaterialInfoform.controls['scrapPrice'].value : this.defaultValues.scrapPrice;
      materialInfo.density = this.costingMaterialInfoform.controls['density'].value != null ? this.costingMaterialInfoform.controls['density'].value : this.defaultValues.density;
      if (this.processFlag.IsProcessCustomizeCable) {
        // materialInfo.materialPricePerKg =
        //   this.getFormGroup(FormGroupKeysMaterial.CustomCable).controls['matPrice'].value != null
        //     ? this.getFormGroup(FormGroupKeysMaterial.CustomCable).controls['matPrice'].value
        //     : this.defaultValues.materialPrice;
        // materialInfo.scrapPricePerKg =
        //   this.getFormGroup(FormGroupKeysMaterial.CustomCable).controls['scrapPrice'].value != null
        //     ? this.getFormGroup(FormGroupKeysMaterial.CustomCable).controls['scrapPrice'].value
        //     : this.defaultValues.scrapPrice;
        // materialInfo.density =
        //   this.getFormGroup(FormGroupKeysMaterial.CustomCable).controls['density'].value != null
        //     ? this.getFormGroup(FormGroupKeysMaterial.CustomCable).controls['density'].value
        //     : this.defaultValues.density;
        const form = this.getFormGroup(FormGroupKeysMaterial.CustomCable)?.controls;
        materialInfo = {
          ...materialInfo,
          materialPricePerKg: form['matPrice']?.value ?? this.defaultValues.materialPrice,
          scrapPricePerKg: form['scrapPrice']?.value ?? this.defaultValues.scrapPrice,
          density: form['density']?.value ?? this.defaultValues.density,
        };
        // materialInfo.density = this.customCableMaterialFormGroup.controls['density'].value != null ? this.customCableMaterialFormGroup.controls['density'].value : this.defaultValues.density;
      }
      const materialmasterid = Number(this.costingMaterialInfoform.controls['materialDescription'].value);
      materialInfo.materialMasterId = materialmasterid > 0 ? materialmasterid : Number(this.materialMarketData?.materialMasterId || 0);
      materialInfo.materialDescriptionList = this.materialDescriptionList;
    }
    if (this.processFlag.IsProcessConventionalPCB || this.processFlag.IsProcessRigidFlexPCB || this.processFlag.IsProcessSemiRigidFlexPCB) {
      materialInfo.scrapPricePerKg = 0;
      materialInfo.materialPricePerKg = 0;
      this.defaultValues.scrapPrice = 0;
      this.defaultValues.materialPrice = 0;
    }
    this.materialMapper.materialFormAssignValue(
      materialInfo,
      this.costingMaterialInfoform.controls,
      this.conversionValue,
      this.isEnableUnitConversion,
      this.defaultValues,
      this.currentPart,
      this.materialDescriptionList,
      this.processFlag,
      this.thermoFormingList
    );
    materialInfo.volumePurchased =
      this.costingMaterialInfoform.controls['volumePurchased'].value != null ? this.costingMaterialInfoform.controls['volumePurchased'].value : this.defaultValues?.volumePurchased;
    materialInfo.volumeDiscountPer = this.costingMaterialInfoform.controls['volumeDiscountPer'].value ?? 0;
    if (materialInfo.volumePurchased && (this.sharedService.checkDirtyProperty('volumePurchased', this.fieldColorsList) || materialInfo.volumeDiscountPer === 0)) {
      materialInfo.volumeDiscountPer = this.getVolumeDiscount(materialInfo.volumePurchased);
      this.costingMaterialInfoform.controls['volumeDiscountPer'].setValue(materialInfo.volumeDiscountPer);
    }
    materialInfo.matPriceGross =
      materialInfo.volumeDiscountPer > 0 ? this.sharedService.isValidNumber(materialInfo.materialPricePerKg * (1 - materialInfo.volumeDiscountPer / 100)) : materialInfo.materialPricePerKg;
    this.costingMaterialInfoform.controls['matPriceGross'].setValue(materialInfo.matPriceGross);
    this.materialMapper.materialDirtyCheck(materialInfo, this.costingMaterialInfoform.controls);
    this.costingMaterialInfoform.controls['length'].value === null && this.costingMaterialInfoform.controls['length'].setValue(0);
    this.costingMaterialInfoform.controls['width'].value === null && this.costingMaterialInfoform.controls['width'].setValue(0);
    this.costingMaterialInfoform.controls['height'].value === null && this.costingMaterialInfoform.controls['height'].setValue(0);
    if (!this.costingMaterialInfoform.controls['utilisation'].dirty || this.costingMaterialInfoform.controls['utilisation'].value == null) {
      if (this.processFlag.IsProcessTypePowderCoating || this.processFlag.IsProcessTypePowderPainting || this.processFlag.IsProcessTypeWetPainting) {
        materialInfo.utilisation = 70;
      }
    }
    materialInfo.materialFamily = Number(this.costingMaterialInfoform.controls['materialFamily'].value);
    if (this.processFlag.IsProcessLaserCutting) {
      materialInfo.laserCutttingTimeList = this.laserCutttingTimeList;
    }
    materialInfo.coatingThickness = 120;
    let paintCoatingTickness = 0;
    if (!this.processFlag.IsProcessTypeWetPainting) {
      paintCoatingTickness = 63.5;
    }
    if (materialInfo.ispaintCoatingTicknessDirty) {
      paintCoatingTickness = this.costingMaterialInfoform.controls['paintCoatingTickness'].value;
    }
    materialInfo.paintCoatingTickness = paintCoatingTickness;
    materialInfo.sandRecovery = !this.processFlag.IsProcessCasting ? 85 : 0;
    if (materialInfo.isSandRecoveryDirty) {
      materialInfo.sandRecovery = this.costingMaterialInfoform.controls['sandRecovery'].value;
    }
    materialInfo.materialInfoList = this.materialInfoList;
    if (
      !this.processFlag.IsProcessCasting &&
      !this.processFlag.IsProcessMigWelding &&
      !this.processFlag.IsProcessTigWelding &&
      !this.processFlag.IsProcessMachining &&
      !this.processFlag.IsProcessTypePlating &&
      !this.processFlag.IsProcessTypePowderCoating &&
      !this.processFlag.IsProcessTypePowderPainting &&
      !this.processFlag.IsProcessTypeWetPainting &&
      !this.processFlag.IsProcessTypeGalvanization &&
      !this.processFlag.IsProcessTypeSiliconCoatingAuto &&
      !this.processFlag.IsProcessTypeSiliconCoatingSemi &&
      !this.processFlag.IsProcessMetalTubeExtrusion &&
      !this.processFlag.IsProcessMetalExtrusion &&
      !this.processFlag.IsProcessTubeBending &&
      !this.processFlag.IsProcessInsulationJacket &&
      !this.processFlag.IsProcessPlasticTubeExtrusion &&
      !this.processFlag.IsProcessPlasticVacuumForming &&
      !this.forging.hotForgingClosedDieHot &&
      !this.processFlag.IsProcessCustomizeCable &&
      !this.processFlag.IsProcessTypeAssembly &&
      !this.processFlag.IsProcessConventionalPCB &&
      !this.processFlag.IsProcessRigidFlexPCB &&
      !this.processFlag.IsProcessSemiRigidFlexPCB &&
      !this.processFlag.IsProcessTypeInjectionMolding &&
      !this.processFlag.IsProcessTypeRubberInjectionMolding &&
      !this.processFlag.IsProcessTypeCompressionMolding &&
      !this.processFlag.IsProcessTypeBlowMolding &&
      !this.processFlag.IsProcessTypeTransferMolding &&
      !this.processFlag.IsProcessThermoForming &&
      !this.processFlag.IsProcessRigidFlexPCB &&
      !this.processFlag.IsProcessSemiRigidFlexPCB
    ) {
      materialInfo = this.commonService.setDirtyChecksForCommonFields(materialInfo, this.fieldColorsList, this.selectedMaterialInfo, this.processFlag);
    }
    switch (true) {
      case this.processFlag.IsProcessCasting:
        this.processFlag.IsProcessInvestmentCasting &&
          this.processFlag.IsProcessTypePatternWax &&
          this.getFormGroup(FormGroupKeysMaterial.Casting)?.controls['netWeight'].setValue(materialInfo.netWeight);
        this.materialMapper.materialCastingMapper.materialFormAssignValue(materialInfo, this.getFormGroup(FormGroupKeysMaterial.Casting)?.controls, this.conversionValue, this.isEnableUnitConversion);
        this.materialMapper.materialCastingMapper.materialDirtyCheck(materialInfo, this.getFormGroup(FormGroupKeysMaterial.Casting)?.controls);
        break;
      case this.processFlag.IsProcessMetalTubeExtrusion || this.processFlag.IsProcessMetalExtrusion:
        this.materialMapper.materialMetalExtrusionMapper.metalExtrusionSetCalculationObject(
          materialInfo,
          this.getFormGroup(FormGroupKeysMaterial.MetalExtrusion)?.controls,
          this.conversionValue,
          this.isEnableUnitConversion
        );
        break;
      case this.processFlag.IsProcessPlasticTubeExtrusion:
        this.materialMapper.materialPlasticTubeExtrusionMapper.plasticTubeExtrusionSetCalculationObject(
          materialInfo,
          this.getFormGroup(FormGroupKeysMaterial.PlasticTubeExtrusion)?.controls,
          this.conversionValue,
          this.isEnableUnitConversion
        );
        break;
      case this.processFlag.IsProcessMachining:
        this.materialConfigService.materialMachiningConfigService.setCalculationObject(
          materialInfo,
          this.getFormGroup(FormGroupKeysMaterial.Machining)?.controls,
          this.conversionValue,
          this.isEnableUnitConversion
        );
        break;
      case this.processFlag.IsProcessTubeBending:
        this.materialMapper.materialTubeBendingMapper.tubeBendingSetCalculationObject(
          materialInfo,
          this.getFormGroup(FormGroupKeysMaterial.TubeBending)?.controls,
          this.conversionValue,
          this.isEnableUnitConversion
        );
        break;
      case this.processFlag.IsProcessInsulationJacket:
        this.materialMapper.materialInsulationJacketMapper.insulationJacketSetCalculationObject(
          materialInfo,
          this.getFormGroup(FormGroupKeysMaterial.InsulationJacket)?.controls,
          this.conversionValue,
          this.isEnableUnitConversion
        );
        break;
      case this.processFlag.IsProcessConventionalPCB || this.processFlag.IsProcessRigidFlexPCB || this.processFlag.IsProcessSemiRigidFlexPCB:
        this.materialMapper.materialPcbMapper.setCalculationObject(materialInfo, this.getFormGroup(FormGroupKeysMaterial.Pcb)?.controls, this.conversionValue, this.isEnableUnitConversion);
        break;
      case this.forging.hotForgingClosedDieHot:
        this.materialMapper.materialHotForgingClosedDieHotMapper.hotForgingClosedDieHotSetCalculationObject(
          materialInfo,
          this.getFormGroup(FormGroupKeysMaterial.HotForgingClosedDieHot)?.controls,
          this.conversionValue,
          this.isEnableUnitConversion
        );
        break;
      case this.processFlag.IsProcessTypeInjectionMolding || this.processFlag.IsProcessTypeRubberInjectionMolding:
        this.materialMapper.injectionMoldingMapper.setCalculationObject(
          materialInfo,
          this.getFormGroup(FormGroupKeysMaterial.InjectionMolding)?.controls,
          this.conversionValue,
          this.isEnableUnitConversion
        );
        this.materialMapper.injectionMoldingMapper.materialDirtyCheck(materialInfo, this.getFormGroup(FormGroupKeysMaterial.InjectionMolding)?.controls);
        break;
      case this.processFlag.IsProcessTypeCompressionMolding ||
        this.processFlag.IsProcessTypeBlowMolding ||
        this.processFlag.IsProcessTypeTransferMolding ||
        this.processFlag.IsProcessThermoForming ||
        this.processFlag.IsProcessPlasticVacuumForming:
        this.materialMapper.compressionMoldingMapper.setCalculationObject(
          materialInfo,
          this.getFormGroup(FormGroupKeysMaterial.CompressionMolding)?.controls,
          this.conversionValue,
          this.isEnableUnitConversion
        );
        this.materialMapper.compressionMoldingMapper.materialDirtyCheck(materialInfo, this.getFormGroup(FormGroupKeysMaterial.CompressionMolding)?.controls);
        break;
      case this.processFlag.IsProcessLaserCutting ||
        this.processFlag.IsProcessPlasmaCutting ||
        this.processFlag.IsProcessOxyCutting ||
        this.processFlag.IsProcessTubeLaserCutting ||
        this.processFlag.IsProcessTPP ||
        this.processFlag.IsProcessStampingStage ||
        this.processFlag.IsProcessStampingProgressive ||
        this.processFlag.IsProcessTransferPress ||
        this.processFlag.IsProcessMigWelding ||
        this.processFlag.IsProcessTigWelding ||
        this.processFlag.IsProcessTypeZincPlating ||
        this.processFlag.IsProcessTypeChromePlating ||
        this.processFlag.IsProcessTypeNickelPlating ||
        this.processFlag.IsProcessTypeCopperPlating ||
        this.processFlag.IsProcessTypeTinPlating ||
        this.processFlag.IsProcessTypeGoldPlating ||
        this.processFlag.IsProcessTypeSilverPlating ||
        this.processFlag.IsProcessTypeR2RPlating ||
        this.processFlag.IsProcessTypePowderCoating ||
        this.processFlag.IsProcessTypePowderPainting ||
        this.processFlag.IsProcessTypeGalvanization:
        this.materialMapper.sheetMetalMaterialMapper.setCalculationObject(
          materialInfo,
          this.getFormGroup(FormGroupKeysMaterial.SheetMetal)?.controls,
          this.conversionValue,
          this.isEnableUnitConversion
        );
        this.materialMapper.sheetMetalMaterialMapper.materialDirtyCheck(materialInfo, this.getFormGroup(FormGroupKeysMaterial.SheetMetal)?.controls);
        break;
      default:
        // No matching process flag
        break;
    }
    this.materialMapper.materialSustainabilityMapper.materialSustainabilitySetCalculationObject(materialInfo, this.getFormGroup(FormGroupKeysMaterial.MaterialSustainability)?.controls);

    // Process Selection
    switch (true) {
      case this.processFlag.IsProcessTypeInjectionMolding:
        this.materialMapper.injectionMoldingMapper.materialDirtyCheck(materialInfo, this.getFormGroup(FormGroupKeysMaterial.InjectionMolding)?.controls);
        this.patchMaterialCalculationResult(this._simulationService._plasticService.calculationsForInjectionMoulding(materialInfo, this.fieldColorsList, this.selectedMaterialInfo));
        break;
      case this.processFlag.IsProcessTypeRubberInjectionMolding:
        this.materialMapper.injectionMoldingMapper.materialDirtyCheck(materialInfo, this.getFormGroup(FormGroupKeysMaterial.InjectionMolding)?.controls);
        this.patchMaterialCalculationResult(
          this._simulationService._plasticService.calculationsForRubberInjectionMoulding(materialInfo, this.fieldColorsList, this.selectedMaterialInfo, this.processMachinesList)
        );
        break;
      case this.processFlag.IsProcessTypeCompressionMolding:
        this.materialMapper.compressionMoldingMapper.materialDirtyCheck(materialInfo, this.getFormGroup(FormGroupKeysMaterial.CompressionMolding)?.controls);
        this._simulationService._plasticService.setCurrentPart(this.currentPart);
        this.patchMaterialCalculationResult(
          this._simulationService._plasticService.calculationsForCompressionMolding(materialInfo, this.fieldColorsList, this.selectedMaterialInfo, this.processMachinesList)
        );
        break;
      case this.processFlag.IsProcessTypeTransferMolding:
        this.materialMapper.compressionMoldingMapper.materialDirtyCheck(materialInfo, this.getFormGroup(FormGroupKeysMaterial.CompressionMolding)?.controls);
        this.patchMaterialCalculationResult(
          this._simulationService._plasticService.calculationsForTransferMolding(materialInfo, this.fieldColorsList, this.selectedMaterialInfo, this.processMachinesList)
        );
        break;
      case this.processFlag.IsProcessTypeBlowMolding:
        this.materialMapper.compressionMoldingMapper.materialDirtyCheck(materialInfo, this.getFormGroup(FormGroupKeysMaterial.CompressionMolding)?.controls);
        this.patchMaterialCalculationResult(this._simulationService._plasticService.blowMolding(materialInfo, this.fieldColorsList, this.selectedMaterialInfo));
        break;
      case this.processFlag.IsProcessThermoForming:
        this.materialMapper.compressionMoldingMapper.materialDirtyCheck(materialInfo, this.getFormGroup(FormGroupKeysMaterial.CompressionMolding)?.controls);
        this.patchMaterialCalculationResult(this._simulationService._materialInsulationJacketCalcService.calculationsForThermalForming(materialInfo, this.fieldColorsList, this.selectedMaterialInfo));
        break;
      case this.processFlag.IsProcessPlasticVacuumForming:
        this.materialMapper.compressionMoldingMapper.materialDirtyCheck(materialInfo, this.getFormGroup(FormGroupKeysMaterial.CompressionMolding)?.controls);
        this.patchMaterialCalculationResult(this._simulationService._materialInsulationJacketCalcService.calculationsForVacuumForming(materialInfo, this.fieldColorsList, this.selectedMaterialInfo));
        break;
      case this.processFlag.IsProcessLaserCutting:
        this.materialMapper.sheetMetalMaterialMapper.materialDirtyCheck(materialInfo, this.getFormGroup(FormGroupKeysMaterial.SheetMetal)?.controls);
        this.patchMaterialCalculationResult(this._simulationService._sheetMetalService.calculationsForCutting(materialInfo, this.fieldColorsList, this.selectedMaterialInfo));
        break;
      case this.processFlag.IsProcessTubeLaserCutting:
        this.materialMapper.sheetMetalMaterialMapper.materialDirtyCheck(materialInfo, this.getFormGroup(FormGroupKeysMaterial.SheetMetal)?.controls);
        this.patchMaterialCalculationResult(this._simulationService._sheetMetalService.calculationsForTubeLaserCutting(materialInfo, this.fieldColorsList, this.selectedMaterialInfo));
        break;

      case this.processFlag.IsProcessPlasmaCutting:
        this.materialMapper.sheetMetalMaterialMapper.materialDirtyCheck(materialInfo, this.getFormGroup(FormGroupKeysMaterial.SheetMetal)?.controls);
        this.patchMaterialCalculationResult(this._simulationService._sheetMetalService.calculationsForPlasmaCutting(materialInfo, this.fieldColorsList, this.selectedMaterialInfo));
        break;
      case this.processFlag.IsProcessOxyCutting:
        this.materialMapper.sheetMetalMaterialMapper.materialDirtyCheck(materialInfo, this.getFormGroup(FormGroupKeysMaterial.SheetMetal)?.controls);
        this.patchMaterialCalculationResult(this._simulationService._sheetMetalService.calculationsForOxyCutting(materialInfo, this.fieldColorsList, this.selectedMaterialInfo));
        break;

      case this.processFlag.IsProcessTPP:
        this.materialMapper.sheetMetalMaterialMapper.materialDirtyCheck(materialInfo, this.getFormGroup(FormGroupKeysMaterial.SheetMetal)?.controls);
        this.patchMaterialCalculationResult(this._simulationService._sheetMetalService.calculationsForTPP(materialInfo, this.fieldColorsList, this.selectedMaterialInfo));
        break;
      case this.processFlag.IsProcessStampingStage || this.processFlag.IsProcessStampingProgressive:
        // this.doCostCalculation(materialInfo, '_simulationService', 'calculationsForStamping');
        this.materialMapper.sheetMetalMaterialMapper.materialDirtyCheck(materialInfo, this.getFormGroup(FormGroupKeysMaterial.SheetMetal)?.controls);
        this.patchMaterialCalculationResult(this._simulationService._sheetMetalService.calculationsForStamping(materialInfo, this.fieldColorsList, this.selectedMaterialInfo));
        break;
      case this.processFlag.IsProcessTransferPress:
        // this.doCostCalculation(materialInfo, '_simulationService', 'calculationsForTransferPress');
        this.materialMapper.sheetMetalMaterialMapper.materialDirtyCheck(materialInfo, this.getFormGroup(FormGroupKeysMaterial.SheetMetal)?.controls);
        this.patchMaterialCalculationResult(this._simulationService._sheetMetalService.calculationsForTransferPress(materialInfo, this.fieldColorsList, this.selectedMaterialInfo));
        break;
      case ((this.processFlag.IsProcessGreenCasting ||
        this.processFlag.IsProcessNoBakeCasting ||
        this.processFlag.IsProcessShellCasting ||
        this.processFlag.IsProcessInvestmentCasting ||
        this.processFlag.IsProcessGDCCasting ||
        this.processFlag.IsProcessLPDCCasting ||
        this.processFlag.IsProcessVProcessSandCasting ||
        this.processFlag.IsProcessSand3DPrinting) &&
        this.processFlag.IsProcessTypePouring) ||
        this.processFlag.IsProcessHPDCCasting:
        fieldName === 'netWeightPercentage' && (materialInfo.netWeight = 0);
        this.patchMaterialCalculationResult(this._materialCastingCalcService.calculationsForPouringCasting(materialInfo, [], this.selectedMaterialInfo, this.currentPart));
        break;
      case (this.processFlag.IsProcessGreenCasting ||
        this.processFlag.IsProcessNoBakeCasting ||
        this.processFlag.IsProcessShellCasting ||
        this.processFlag.IsProcessVProcessSandCasting ||
        this.processFlag.IsProcessSand3DPrinting) &&
        this.processFlag.IsProcessTypeSandForMold:
        this.patchMaterialCalculationResult(this._materialCastingCalcService.calculationsForSandForMoldCasting(materialInfo, [], this.selectedMaterialInfo));
        break;
      case (this.processFlag.IsProcessGreenCasting ||
        this.processFlag.IsProcessNoBakeCasting ||
        this.processFlag.IsProcessShellCasting ||
        this.processFlag.IsProcessGDCCasting ||
        this.processFlag.IsProcessLPDCCasting ||
        this.processFlag.IsProcessVProcessSandCasting ||
        this.processFlag.IsProcessSand3DPrinting) &&
        this.processFlag.IsProcessTypeSandForCore:
        this.calculationsForSandForCoreCasting(materialInfo);
        break;
      case this.processFlag.IsProcessInvestmentCasting && this.processFlag.IsProcessTypePatternWax:
        this.patchMaterialCalculationResult(this._materialCastingCalcService.calculationsForPatternWaxCasting(materialInfo, [], this.selectedMaterialInfo));
        break;
      case this.processFlag.IsProcessInvestmentCasting && this.processFlag.IsProcessTypeSlurryCost:
        this.patchMaterialCalculationResult(this._materialCastingCalcService.calculationsForSlurryCostCasting(materialInfo, [], this.selectedMaterialInfo));
        break;
      // case this.processFlag.IsProcessInvestmentCasting && this.processFlag.IsProcessTypeSandForMold:
      //   this.patchMaterialCalculationResult(this._materialCastingCalcService.calculationsForSandForMoldCastingInvestment(materialInfo, [], this.selectedMaterialInfo));
      //   break;
      case this.processFlag.IsProcessInvestmentCasting && this.processFlag.IsProcessTypeZirconSand:
        this.patchMaterialCalculationResult(this._materialCastingCalcService.calculationsForZirconSandCasting(materialInfo, [], this.selectedMaterialInfo));
        break;
      case this.processFlag.IsProcessMachining:
        Object.keys(this.machining).forEach((type) => {
          const pascalType = type.charAt(0).toUpperCase() + type.slice(1);
          materialInfo[`machining${pascalType}`] = this.machining[type];
        });
        this.patchMaterialCalculationResult(this._materialMachiningCalcService.calculationsForMachining(materialInfo, this.fieldColorsList, this.selectedMaterialInfo));
        break;
      case this.processFlag.IsProcessTubeBending:
        this.doCostCalculation(materialInfo, '_simulationService._materialTubeBendingCalcService', 'calculationsForTubeBending');
        break;
      case this.processFlag.IsProcessInsulationJacket:
        this.patchMaterialCalculationResult(
          this._simulationService._materialInsulationJacketCalcService.calculationsForInsulationJacket(materialInfo, this.fieldColorsList, this.selectedMaterialInfo)
        );
        break;
      case this.processFlag.IsProcessTypeWelding && !this.processFlag.IsProcessSpotWelding && !this.processFlag.IsProcessSeamWelding:
        // this.doCostCalculation(materialInfo, '_simulationService', 'calculationsForWelding');
        this.materialMapper.sheetMetalMaterialMapper.materialDirtyCheck(materialInfo, this.getFormGroup(FormGroupKeysMaterial.SheetMetal).controls);
        // this.patchMaterialCalculationResult(this._simulationService._sheetMetalService.calculationsForWelding(materialInfo, this.fieldColorsList, this.selectedMaterialInfo));
        this.calculationsForWeldingSubMaterial(materialInfo);
        break;
      case this.forging.hotForgingClosedDieHot:
        this.patchMaterialCalculationResult(
          this._simulationService._materialHotForgingClosedDieHotCalcService.calculationForHotForgingClosedDie(materialInfo, this.fieldColorsList, this.selectedMaterialInfo, this.currentPart)
        );
        break;
      case this.forging.hotForgingOpenDieHot:
        this.doCostCalculation(materialInfo, '_simulationService', 'calculationForHotForgingClosedDie', true, true);
        break;
      case this.forging.coldForgingClosedDieHot || this.processFlag.IsProcessColdForgingColdHeading || this.forging.coldForgingColdHeadingDie:
        this.doCostCalculation(materialInfo, '_simulationService', 'calculationForColdForging', true);
        break;
      case this.processFlag.IsProcessTypePlating || this.processFlag.IsProcessTypePowderCoating || this.processFlag.IsProcessTypePowderPainting:
        this.doCostCalculation(materialInfo, '_materialPlatingCalcService', 'calculationsForPlating');
        break;
      case this.processFlag.IsProcessTypeGalvanization ||
        this.processFlag.IsProcessTypeWetPainting ||
        this.processFlag.IsProcessTypeSiliconCoatingAuto ||
        this.processFlag.IsProcessTypeSiliconCoatingSemi:
        this.doCostCalculation(materialInfo, '_materialPlatingCalcService', 'calculationsForCoating');
        break;
      case this.processFlag.IsProcessCustomizeCable:
        this.materialMapper.materialCustomCableMapper.materialFormAssignValue(
          materialInfo,
          this.getFormGroup(FormGroupKeysMaterial.CustomCable).controls,
          this.conversionValue,
          this.isEnableUnitConversion
        );
        this.materialMapper.materialCustomCableMapper.materialDirtyCheck(materialInfo, this.getFormGroup(FormGroupKeysMaterial.CustomCable).controls);
        this.calculationsForCustomizeCable(materialInfo, customCableMarketDataDto, isAutomationEntry, index, materialType);
        break;
      case this.processFlag.IsProcessTypeWireCuttingTermination:
        materialInfo.isPitchForWireCutting = this.costingMaterialInfoform.controls['pitchForWireCutting'].dirty;
        materialInfo.isUnfoldedLength = this.costingMaterialInfoform.controls['unbendPartWeight'].dirty;
        materialInfo.sandForCoreFormArray = this.sandForCoreFormArray;
        this.doCostCalculation(materialInfo, '_simulationService', 'calculationsForWireCuttingTermination');
        break;
      case this.processFlag.IsProcessTypeRubberExtrusion:
        this.doCostCalculation(materialInfo, '_simulationService._plasticService', 'calculationsForRubberExtrusion');
        break;
      case this.processFlag.IsProcessMetalTubeExtrusion || this.processFlag.IsProcessMetalExtrusion:
        this.patchMaterialCalculationResult(this._assemblyService.calculationsForMetalTubeExtrusion(materialInfo, this.fieldColorsList, this.selectedMaterialInfo));
        break;
      case this.processFlag.IsProcessPlasticTubeExtrusion:
        this.patchMaterialCalculationResult(this._simulationService._materialPlasticTubeExtrusion.calculationsForPlasticTubeExtrusion(materialInfo, this.fieldColorsList, this.selectedMaterialInfo));
        break;
      // case this.processFlag.IsProcessPlasticVacuumForming:
      //   this.patchMaterialCalculationResult(this._simulationService._materialPlasticVacuumForming.calculationsForPlasticVacuumForming(materialInfo));
      //   break;
      case this.processFlag.IsProcessTypeAssembly:
        this.patchMaterialCalculationResult(materialInfo);
        break;
      case this.processFlag.IsProcessConventionalPCB || this.processFlag.IsProcessRigidFlexPCB || this.processFlag.IsProcessSemiRigidFlexPCB:
        this.materialMapper.materialPcbMapper.setCalculationObject(materialInfo, this.getFormGroup(FormGroupKeysMaterial.Pcb).controls, this.conversionValue, this.isEnableUnitConversion);
        this.materialMapper.materialPcbMapper.materialDirtyCheck(materialInfo, this.getFormGroup(FormGroupKeysMaterial.Pcb).controls);
        this.calculationsForConventionalPCB(materialInfo);
        break;
      case this.currentPart?.commodityId === CommodityType.Electronics:
        this.materialMapper.materialPcbaMapper.materialFormAssignValue(materialInfo, this.getFormGroup(FormGroupKeysMaterial.Pcba).controls, this.conversionValue, this.isEnableUnitConversion);
        this.materialMapper.materialPcbaMapper.materialDirtyCheck(materialInfo, this.getFormGroup(FormGroupKeysMaterial.Pcba).controls);
        this.patchMaterialCalculationResult(this._pcbaCalculatorService.calculationsForPCBA(materialInfo));
        break;
      default:
        break;
    }
  }

  doCostCalculation(materialInfo: MaterialInfoDto, serviceName: string, methodName: string, needFieldColorsList = true, needCurrentPart = false) {
    const fieldColorsList = needFieldColorsList ? this.fieldColorsList : [];

    const serName = serviceName?.split('.');
    const serviceFn = serName.reduce((obj, key) => obj?.[key], this);

    if (!serviceFn || typeof serviceFn[methodName] !== 'function') {
      console.error(`Service or method not found: ${serviceName}.${methodName}`);
      return;
    }

    const fnCall = needCurrentPart
      ? serviceFn[methodName](materialInfo, fieldColorsList, this.selectedMaterialInfo, this.currentPart)
      : serviceFn[methodName](materialInfo, fieldColorsList, this.selectedMaterialInfo);

    if (fnCall && fnCall.pipe) {
      fnCall.pipe(takeUntil(this.unsubscribe$)).subscribe((result: any) => {
        if (result) {
          this.patchMaterialCalculationResult(result);
        }
      });
    }
  }

  onSearchResultChange(event: any) {
    if (!event?.materialDescId) {
      return;
    }
    const obj = event;
    const materialCategory = this.stockFormCategoriesDto.find((x) => x.materialGroupId === obj?.materialGroupId)?.materialGroup || '';
    this.costingMaterialInfoform.controls.materialCategory.setValue(materialCategory);
    if (obj && obj?.materialGroupId) {
      const matTypeList = this.stockFormCategoriesDto
        .filter((x) => x.materialGroupId == obj?.materialGroupId)
        .map((x) => ({ materialTypeId: x.materialTypeId, materialTypeName: x.materialType, materialGroupId: x.materialGroupId }) as MaterialTypeDto);
      this.materialTypeList = [...new Set(matTypeList)].sort((a, b) => a.materialTypeName.localeCompare(b.materialTypeName));
      if (this.materialTypeList && this.costingMaterialInfoform && obj?.materialTypeId) {
        this.materialMasterService
          .getmaterialsByMaterialTypeId(obj?.materialTypeId)
          .pipe(take(1))
          .subscribe((result) => {
            this.materialDescriptionList = result;
            if (obj?.materialDescId > 0 && this.currentPart?.mfrCountryId > 0) {
              this.updateMaterialDetails(obj?.materialDescId);
              // this.afterChange = true;
              // this.dirtyCheckEvent.emit(this.afterChange);
            }
            this.dialogRef?.close();
          });
      } else {
        this.dialogRef?.close();
      }
    } else {
      this.dialogRef?.close();
    }
  }

  searchMaterialsClick(event: any) {
    const searchText = event.currentTarget.value;
    if (this.currentPart?.mfrCountryId && this.currentPart?.mfrCountryId != 0 && searchText != null && searchText != '') {
      this.materialMasterService
        .searchMaterialByCountryId(this.currentPart?.mfrCountryId, searchText)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((result: any[]) => {
          this.materialSearchList = result;
        });
    }
  }

  resetDataExtracted() {
    const frm = this.costingMaterialInfoform;
    let formName = this._materialHelperService.getSubFormGroup(this.processFlag, this.forging, this.getFormGroup.bind(this));
    !formName && (formName = this.costingMaterialInfoform);

    this.materialConfigService.controlsToReset.forEach((name) => {
      (formName.controls[name] && frm.controls[name])?.markAsPristine();
    });
  }

  setExtractData() {
    if (this.sharedService.extractedMaterialData) {
      let formName = this._materialHelperService.getSubFormGroup(this.processFlag, this.forging, this.getFormGroup.bind(this));
      !formName && (formName = this.costingMaterialInfoform);
      if ((!this.processFlag.IsProcessTypeWelding || this.processFlag.IsProcessMigWelding || this.processFlag.IsProcessTigWelding) && !this.processFlag.IsProcessMachining) {
        let dimensions = [
          {
            key: 'length',
            value: this.sharedService.extractedMaterialData?.DimX,
          },
          {
            key: 'width',
            value: this.sharedService.extractedMaterialData?.DimY,
          },
          {
            key: 'height',
            value: this.sharedService.extractedMaterialData?.DimZ,
          },
          {
            key: 'partSurfaceArea',
            value: this.sharedService.extractedMaterialData?.DimArea,
          },
          {
            key: 'partVolume',
            value: this.sharedService.extractedMaterialData?.DimVolume,
          },
        ];
        if (this.processFlag.IsProcessTypeInjectionMolding || this.processFlag.IsProcessTypeRubberInjectionMolding) {
          dimensions = [
            {
              key: 'length',
              value: this.sharedService.extractedMaterialData?.DimY,
            },
            {
              key: 'width',
              value: this.sharedService.extractedMaterialData?.DimX,
            },
            {
              key: 'height',
              value: this.sharedService.extractedMaterialData?.DimZ,
            },
            {
              key: 'partSurfaceArea',
              value: this.sharedService.extractedMaterialData?.DimArea,
            },
            {
              key: 'partVolume',
              value: this.sharedService.extractedMaterialData?.DimVolume,
            },
          ];
        }
        dimensions.forEach((dim) => {
          this.patchIfEmpty(formName, dim.key, this.sharedService.convertUomInUI(this.sharedService.isValidNumber(dim.value), this.conversionValue, this.isEnableUnitConversion));
        });
      }
      if (
        (!this.processFlag.IsProcessTypeWelding || this.processFlag.IsProcessMigWelding || this.processFlag.IsProcessTigWelding) &&
        !this.processFlag.IsProcessTypePlating &&
        formName.controls['partVolume']
      ) {
        this.patchIfEmpty(
          formName,
          'partVolume',
          this.sharedService.convertUomInUI(this.sharedService.isValidNumber(this.sharedService.extractedMaterialData?.DimVolume), this.conversionValue, this.isEnableUnitConversion)
        );
      }
      if (this.processFlag.IsProcessMachining || this.processFlag.IsProcessMigWelding || this.processFlag.IsProcessTigWelding) {
        this.patchIfEmpty(formName, 'netWeight', this.sharedService.isValidNumber(this.sharedService.extractedMaterialData?.NetWeight));
      } else if (
        !this.processFlag.IsProcessTypePlating &&
        !this.processFlag.IsProcessCasting &&
        !this.processFlag.IsProcessTypeInjectionMolding &&
        !this.processFlag.IsProcessTypeRubberInjectionMolding &&
        !this.processFlag.IsProcessTypeCompressionMolding &&
        !this.processFlag.IsProcessTypeTransferMolding &&
        !this.processFlag.IsProcessTypeBlowMolding &&
        !this.processFlag.IsProcessThermoForming &&
        !this.processFlag.IsProcessPlasticVacuumForming
      ) {
        this.patchIfEmpty(formName, 'netWeight', this.sharedService.isValidNumber(this.sharedService.extractedMaterialData?.NetWeight || this.netWeightForAssembly));
      }
      if (!this.processFlag.IsProcessTypeGalvanization) {
        this.patchIfEmpty(formName, 'typeOfMaterialBase', this.sharedService.isValidNumber(this.sharedService.extractedMaterialData?.TypeOfMaterialBase));
        if (!this.sharedService.extractedMaterialData?.TypeOfMaterialBase) {
          this.costingMaterialInfoform.controls['typeOfMaterialBase'].patchValue(1);
        }
      }
      if (!this.processFlag.IsProcessMetalTubeExtrusion && !this.processFlag.IsProcessMachining) {
        if (formName.controls['partTickness'] && !formName.controls['partTickness'].value) {
          if (this.processFlag.IsProcessCasting && this.sharedService.extractedMaterialData?.PartTickness) {
            formName.controls['partTickness'].patchValue(
              this.sharedService.convertUomInUI(this.sharedService.isValidNumber(this.sharedService.extractedMaterialData?.WallThickessMm), this.conversionValue, this.isEnableUnitConversion)
            );
          } else if (this.sharedService.extractedMaterialData?.PartTickness) {
            formName.controls['partTickness'].patchValue(
              this.sharedService.convertUomInUI(this.sharedService.isValidNumber(this.sharedService.extractedMaterialData?.PartTickness), this.conversionValue, this.isEnableUnitConversion)
            );
          } else if (this.sharedService.extractedMaterialData?.DimUnfoldedZ) {
            formName.controls['partTickness'].patchValue(
              this.sharedService.convertUomInUI(this.sharedService.isValidNumber(this.sharedService.extractedMaterialData?.DimUnfoldedZ), this.conversionValue, this.isEnableUnitConversion)
            );
          } else if (!this.processFlag.IsProcessTypePlating && !this.processFlag.IsProcessTypeWetPainting && !this.processFlag.IsProcessTypeGalvanization) {
            formName.controls['partTickness'].patchValue(6);
          }
        }
      } else if (this.processFlag.IsProcessTubeBending) {
        this.patchIfEmpty(formName, 'partTickness', this.sharedService.isValidNumber(this.sharedService.extractedMaterialData?.partTickness));
      }

      this.patchIfEmpty(
        formName,
        'paintCoatingTickness',
        this.sharedService.convertUomInUI(this.sharedService.isValidNumber(this.sharedService.extractedMaterialData?.PaintCoatingTickness), this.conversionValue, this.isEnableUnitConversion)
      );

      this.patchIfEmpty(formName, 'typeOfWeld', this.sharedService.isValidNumber(this.sharedService.extractedMaterialData?.TypeOfWeld));
      if (!this.sharedService.extractedMaterialData?.TypeOfWeld) {
        this.costingMaterialInfoform.controls['typeOfWeld'].patchValue(1);
      }

      this.patchIfEmpty(
        formName,
        'partOuterDiameter',
        this.sharedService.convertUomInUI(this.sharedService.isValidNumber(this.sharedService.extractedMaterialData?.PartOuterDiameter), this.conversionValue, this.isEnableUnitConversion)
      );

      this.patchIfEmpty(
        formName,
        'partInnerDiameter',
        this.sharedService.convertUomInUI(this.sharedService.isValidNumber(this.sharedService.extractedMaterialData?.PartInnerDiameter), this.conversionValue, this.isEnableUnitConversion)
      );

      this.patchIfEmpty(
        formName,
        'partLength',
        this.sharedService.convertUomInUI(this.sharedService.isValidNumber(this.sharedService.extractedMaterialData?.PartLength), this.conversionValue, this.isEnableUnitConversion)
      );

      this.patchIfEmpty(
        formName,
        'partWidth',
        this.sharedService.convertUomInUI(this.sharedService.isValidNumber(this.sharedService.extractedMaterialData?.PartWidth), this.conversionValue, this.isEnableUnitConversion)
      );

      this.patchIfEmpty(
        formName,
        'partHeight',
        this.sharedService.convertUomInUI(this.sharedService.isValidNumber(this.sharedService.extractedMaterialData?.PartHeight), this.conversionValue, this.isEnableUnitConversion)
      );

      if (
        this.processFlag.IsProcessMachining ||
        this.forging.hotForgingClosedDieHot ||
        this.forging.hotForgingOpenDieHot ||
        this.forging.coldForgingClosedDieHot ||
        this.forging.coldForgingColdHeadingDie
      ) {
        const machineDefaultParams = this.materialConfigService.materialMachiningConfigService.machiningDefaults(this.sharedService.extractedMaterialData);
        if (this.processFlag.IsProcessMachining) {
          this.patchIfEmpty(
            formName,
            'stockCrossSectionWidth',
            this.sharedService.convertUomInUI(this.sharedService.isValidNumber(machineDefaultParams?.stockWidth), this.conversionValue, this.isEnableUnitConversion)
          );
          this.patchIfEmpty(
            formName,
            'stockCrossSectionHeight',
            this.sharedService.convertUomInUI(this.sharedService.isValidNumber(machineDefaultParams?.stockHeight), this.conversionValue, this.isEnableUnitConversion)
          );
        }

        this.patchIfEmpty(
          formName,
          'stockDiameter',
          this.sharedService.convertUomInUI(this.sharedService.isValidNumber(machineDefaultParams?.stockDiameter), this.conversionValue, this.isEnableUnitConversion)
        );
        this.patchIfEmpty(
          formName,
          'stockLength',
          this.sharedService.convertUomInUI(this.sharedService.isValidNumber(machineDefaultParams?.stockLength), this.conversionValue, this.isEnableUnitConversion)
        );
      }

      if (!this.processFlag.IsProcessMetalTubeExtrusion) {
        this.patchIfEmpty(
          formName,
          'maxWallthick',
          this.sharedService.convertUomInUI(this.sharedService.isValidNumber(this.sharedService.extractedMaterialData?.WallThickessMm), this.conversionValue, this.isEnableUnitConversion)
        );
      }
      if (!this.processFlag.IsProcessMetalTubeExtrusion && !this.processFlag.IsProcessMachining) {
        if (formName.controls['wallAverageThickness'] && !formName.controls['wallAverageThickness'].value) {
          formName.controls['wallAverageThickness'].patchValue(
            this.sharedService.convertUomInUI(this.sharedService.isValidNumber(this.sharedService.extractedMaterialData?.WallAverageThickness), this.conversionValue, this.isEnableUnitConversion)
          );
        }
        if (formName.controls['standardDeviation'] && !formName.controls['standardDeviation'].value) {
          formName.controls['standardDeviation'].patchValue(
            this.sharedService.convertUomInUI(this.sharedService.isValidNumber(this.sharedService.extractedMaterialData?.StandardDeviation), this.conversionValue, this.isEnableUnitConversion)
          );
        }
      }

      if (
        this.processFlag.IsProcessLaserCutting ||
        this.processFlag.IsProcessPlasmaCutting ||
        this.processFlag.IsProcessOxyCutting ||
        this.processFlag.IsProcessTubeLaserCutting ||
        this.processFlag.IsProcessTPP ||
        this.processFlag.IsProcessStampingStage ||
        this.processFlag.IsProcessStampingProgressive ||
        this.processFlag.IsProcessTransferPress ||
        this.processFlag.IsProcessMigWelding ||
        this.processFlag.IsProcessTigWelding ||
        this.processFlag.IsProcessTypeZincPlating ||
        this.processFlag.IsProcessTypeChromePlating ||
        this.processFlag.IsProcessTypeNickelPlating ||
        this.processFlag.IsProcessTypeCopperPlating ||
        this.processFlag.IsProcessTypeTinPlating ||
        this.processFlag.IsProcessTypeGoldPlating ||
        this.processFlag.IsProcessTypeSilverPlating ||
        this.processFlag.IsProcessTypeR2RPlating ||
        this.processFlag.IsProcessTypeGalvanization ||
        this.processFlag.IsProcessTypePowderCoating ||
        this.processFlag.IsProcessTypePowderPainting
      ) {
        if (formName.controls['unfoldedLength'] && !formName.controls['unfoldedLength'].value) {
          formName.controls['unfoldedLength'].patchValue(
            this.sharedService.convertUomInUI(this.sharedService.isValidNumber(this.sharedService.extractedMaterialData?.DimUnfoldedX), this.conversionValue, this.isEnableUnitConversion)
          );
        }
        if (formName.controls['unfoldedWidth'] && !formName.controls['unfoldedWidth'].value) {
          formName.controls['unfoldedWidth'].patchValue(
            this.sharedService.convertUomInUI(this.sharedService.isValidNumber(this.sharedService.extractedMaterialData?.DimUnfoldedY), this.conversionValue, this.isEnableUnitConversion)
          );
        }
        if (formName.controls['thickness'] && !formName.controls['thickness'].value) {
          formName.controls['thickness'].patchValue(
            this.sharedService.convertUomInUI(this.sharedService.isValidNumber(this.sharedService.extractedMaterialData?.DimUnfoldedZ), this.conversionValue, this.isEnableUnitConversion)
          );
        }
      } else {
        if (!this.costingMaterialInfoform.controls['unfoldedLength'].value) {
          this.costingMaterialInfoform.controls['unfoldedLength'].patchValue(
            this.sharedService.convertUomInUI(this.sharedService.isValidNumber(this.sharedService.extractedMaterialData?.DimUnfoldedX), this.conversionValue, this.isEnableUnitConversion)
          );
        }
        if (!this.costingMaterialInfoform.controls['unfoldedWidth'].value) {
          this.costingMaterialInfoform.controls['unfoldedWidth'].patchValue(
            this.sharedService.convertUomInUI(this.sharedService.isValidNumber(this.sharedService.extractedMaterialData?.DimUnfoldedY), this.conversionValue, this.isEnableUnitConversion)
          );
        }
        if (!this.costingMaterialInfoform.controls['thickness'].value) {
          this.costingMaterialInfoform.controls['thickness'].patchValue(
            this.sharedService.convertUomInUI(this.sharedService.isValidNumber(this.sharedService.extractedMaterialData?.DimUnfoldedZ), this.conversionValue, this.isEnableUnitConversion)
          );
        }
      }

      if (this.processFlag.IsProcessMachining && !formName.controls['partSurfaceArea'].value) {
        formName.controls['partSurfaceArea'].patchValue(
          this.sharedService.convertUomInUI(this.sharedService.isValidNumber(this.sharedService.extractedMaterialData?.DimArea), this.conversionValue, this.isEnableUnitConversion)
        );
      } else if (!this.costingMaterialInfoform.controls['partSurfaceArea'].value) {
        this.costingMaterialInfoform.controls['partSurfaceArea'].patchValue(
          this.sharedService.convertUomInUI(this.sharedService.isValidNumber(this.sharedService.extractedMaterialData?.DimArea), this.conversionValue, this.isEnableUnitConversion)
        );
      }
      let area = this.sharedService.extractedMaterialData?.DimArea;
      if (
        this.processFlag.IsProcessTypeInjectionMolding ||
        this.processFlag.IsProcessTypeRubberInjectionMolding ||
        this.processFlag.IsProcessTypeCompressionMolding ||
        this.processFlag.IsProcessTypeTransferMolding ||
        this.processFlag.IsProcessTypeBlowMolding ||
        this.processFlag.IsProcessThermoForming ||
        this.processFlag.IsProcessPlasticVacuumForming ||
        this.processFlag.IsProcessCasting
      ) {
        area = this.sharedService.extractedMaterialData?.ProjectedArea;
      } else if (this.processFlag.IsProcessTypeWireCuttingTermination) {
        area = this.sharedService.extractedMaterialData?.PartSurfaceArea;
      }

      if (
        !this.costingMaterialInfoform.controls['paintArea'].value &&
        area > 0 &&
        (this.processFlag.IsProcessTypePlating || this.processFlag.IsProcessTypeWetPainting || this.processFlag.IsProcessTypeGalvanization)
      ) {
        this.costingMaterialInfoform.controls['paintArea'].patchValue(this.sharedService.convertUomInUI(this.sharedService.isValidNumber(area), this.conversionValue, this.isEnableUnitConversion));
      }

      if (formName.controls['partProjectArea'] && area > 0 && !formName.controls['partProjectArea'].dirty) {
        this.patchIfEmpty(formName, 'partProjectArea', this.sharedService.convertUomInUI(this.sharedService.isValidNumber(area), this.conversionValue, this.isEnableUnitConversion));
      }

      if (!this.processFlag.IsProcessMetalTubeExtrusion) {
        this.patchIfEmpty(
          formName,
          'projectedArea',
          this.sharedService.convertUomInUI(this.sharedService.isValidNumber(this.sharedService.extractedMaterialData?.ProjectedArea), this.conversionValue, this.isEnableUnitConversion)
        );
        this.patchIfEmpty(formName, 'partProjectArea', this.sharedService.convertUomInUI(this.sharedService.isValidNumber(area), this.conversionValue, this.isEnableUnitConversion));
      }

      this.patchIfEmpty(formName, 'noOfInserts', this.sharedService.isValidNumber(this.sharedService.extractedMaterialData?.NoOfInserts));

      this.patchIfEmpty(
        formName,
        'unfoldedPartVolume',
        this.sharedService.convertUomInUI(this.sharedService.isValidNumber(this.sharedService.extractedMaterialData?.UnfoldedPartVolume), this.conversionValue, this.isEnableUnitConversion)
      );
      if (this.processFlag.IsProcessMachining || this.processFlag.IsProcessTypeWireCuttingTermination) {
        this.patchIfEmpty(
          formName,
          'partVolume',
          this.sharedService.convertUomInUI(this.sharedService.isValidNumber(this.sharedService.extractedMaterialData?.DimVolume), this.conversionValue, this.isEnableUnitConversion)
        );
      }
      // else if (this.processFlag.IsProcessTypeWireCuttingTermination) {
      //   // this.costingMaterialInfoform.controls['partVolume'].patchValue(this.sharedService.convertUomInUI(this.sharedService.isValidNumber(this.sharedService.extractedMaterialData?.DimVolume), this.conversionValue, this.isEnableUnitConversion));
      //   this.patchIfEmpty(
      //     formName,
      //     'partVolume',
      //     this.sharedService.convertUomInUI(this.sharedService.isValidNumber(this.sharedService.extractedMaterialData?.DimVolume), this.conversionValue, this.isEnableUnitConversion)
      //   );
      // }
      if (this.processFlag.IsProcessTypeWireCuttingTermination) {
        this.patchIfEmpty(
          formName,
          'sheetThickness',
          this.sharedService.convertUomInUI(this.sharedService.isValidNumber(this.sharedService.extractedMaterialData?.WallThickFactor), this.conversionValue, this.isEnableUnitConversion)
        );
      }
      if (this.forging.hotForgingClosedDieHot && this.sharedService.extractedMaterialData?.PerimeterInXDir > 0 && !formName.controls['perimeter'].value) {
        const maxPerimeter = this.sharedService.isValidNumber(
          Math.max(
            Number(this.sharedService.extractedMaterialData?.PerimeterInXDir),
            Number(this.sharedService.extractedMaterialData?.PerimeterInYDir),
            Number(this.sharedService.extractedMaterialData.PerimeterInZDir)
          )
        );
        formName.controls['perimeter'].patchValue(this.sharedService.convertUomInUI(this.sharedService.isValidNumber(maxPerimeter), this.conversionValue, this.isEnableUnitConversion));
      }
      if (
        (this.forging.hotForgingOpenDieHot || this.forging.coldForgingClosedDieHot || this.forging.coldForgingColdHeadingDie || this.processFlag.IsProcessColdForgingColdHeading) &&
        this.sharedService.extractedMaterialData?.PerimeterInXDir > 0 &&
        !this.costingMaterialInfoform.controls['perimeter'].value
      ) {
        const maxPerimeter = this.sharedService.isValidNumber(
          Math.max(
            Number(this.sharedService.extractedMaterialData?.PerimeterInXDir),
            Number(this.sharedService.extractedMaterialData?.PerimeterInYDir),
            Number(this.sharedService.extractedMaterialData.PerimeterInZDir)
          )
        );
        if (this.forging.coldForgingClosedDieHot || this.processFlag.IsProcessColdForgingColdHeading || this.forging.coldForgingColdHeadingDie) {
          const perimeter = this.sharedService.isValidNumber(
            this.sharedService.convertUomInUI(this.sharedService.isValidNumber(maxPerimeter), this.conversionValue, this.isEnableUnitConversion) * 3.142
          );
          this.costingMaterialInfoform.controls['perimeter'].patchValue(perimeter);
        } else {
          this.costingMaterialInfoform.controls['perimeter'].patchValue(
            this.sharedService.convertUomInUI(this.sharedService.isValidNumber(maxPerimeter), this.conversionValue, this.isEnableUnitConversion)
          );
        }
      } else if (this.processFlag.IsProcessInsulationJacket) {
        this.patchIfEmpty(formName, 'perimeter', this.sharedService.isValidNumber(this.sharedService.extractedMaterialData?.Perimeter));
      }

      if (this.forging.hotForgingClosedDieHot) {
        this.patchIfEmpty(
          formName,
          'ultimateTensileStrength',
          this.sharedService.convertUomInUI(this.sharedService.isValidNumber(this.sharedService.extractedMaterialData?.ultimateTensileStrength), this.conversionValue, this.isEnableUnitConversion)
        );

        this.patchIfEmpty(
          formName,
          'projectedArea',
          this.sharedService.convertUomInUI(this.sharedService.isValidNumber(this.sharedService.extractedMaterialData?.ProjectedArea), this.conversionValue, this.isEnableUnitConversion)
        );

        this.patchIfEmpty(
          formName,
          'stockOuterDiameter',
          this.sharedService.convertUomInUI(this.sharedService.isValidNumber(this.sharedService.extractedProcessData?.BilletSizeOD), this.conversionValue, this.isEnableUnitConversion)
        );
      }
    }
  }

  patchIfEmpty(form, field, value) {
    if (form?.controls[field] && form.controls[field].value <= 0 && value !== null) {
      form.controls[field].patchValue(value);
    }
  }

  private patchMaterialCalculationResult(result: MaterialInfoDto) {
    this._simulationService._materialSustainabilityCalcService.calculationsForMaterialSustainability(result, this.fieldColorsList, this.selectedMaterialInfo);
    this.totalSandVolume = result.totalSandVolume || 0;
    if (this.processFlag.IsProcessTypeWireCuttingTermination) {
      this.costingMaterialInfoform.patchValue({
        unfoldedLength: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(result?.dimUnfoldedX)), this.conversionValue, this.isEnableUnitConversion),
      });
    }
    this.costingMaterialInfoform.patchValue(this.materialMapper.materialFormPatchResults(result, this.conversionValue, this.isEnableUnitConversion));
    this.materialSustainabilityData = result;
  }

  private calculationsForWeldingSubMaterial(materialInfo: MaterialInfoDto) {
    // Delegate heavy lifting to SheetMetalCalculatorService to keep component thin
    materialInfo.coreCostDetails = this.materialMapper.coreCostDetailMapper.mapFormArrayToCoreCostDetails(this.sandForCoreFormArray, materialInfo.materialInfoId);
    const result = this._simulationService._sheetMetalService.calculationsForWeldingSubMaterial(materialInfo, this.fieldColorsList, this.selectedMaterialInfo);

    // Patch UI with results
    this.patchMaterialCalculationResult(result);
    this.patchWeldingSubFormArray(result);
  }
  private calculationsForSandForCoreCasting(materialInfo: MaterialInfoDto) {
    materialInfo.sandForCoreFormArray = this.sandForCoreFormArray;
    if (!materialInfo.coreCostDetails) {
      materialInfo.coreCostDetails = [];
    }
    for (let i = 0; i < materialInfo?.sandForCoreFormArray?.controls?.length; i++) {
      const info = materialInfo?.sandForCoreFormArray?.controls[i];
      const coreDetail: any = {
        coreShape: info?.value?.coreShape,
        coreArea: this.sharedService.convertUomToSaveAndCalculation(this.sharedService.isValidNumber(Number(info?.value?.coreArea)), this.conversionValue, this.isEnableUnitConversion),
        coreHeight: this.sharedService.convertUomToSaveAndCalculation(Number(info?.value?.coreHeight), this.conversionValue, this.isEnableUnitConversion),
        coreLength: this.sharedService.convertUomToSaveAndCalculation(Number(info?.value?.coreLength), this.conversionValue, this.isEnableUnitConversion),
        coreWidth: this.sharedService.convertUomToSaveAndCalculation(Number(info?.value?.coreWidth), this.conversionValue, this.isEnableUnitConversion),
        coreVolume: this.sharedService.convertUomToSaveAndCalculation(Number(info?.value?.coreVolume), this.conversionValue, this.isEnableUnitConversion),
        coreSandPrice: this.sharedService.convertUomToSaveAndCalculation(Number(info?.value?.coreSandPrice), this.conversionValue, this.isEnableUnitConversion) || 0,
        noOfCore: this.sharedService.isValidNumber(Number(info?.value?.noOfCore)) || 1,
        // coreName: info?.value?.coreName || '',
      };
      materialInfo.coreCostDetails.push(coreDetail);
    }
    const result: MaterialInfoDto = this._materialCastingCalcService.calculationsForSandForCoreCasting(materialInfo, [], this.selectedMaterialInfo);
    for (let i = 0; i < materialInfo.coreCostDetails.length; i++) {
      const info = materialInfo.coreCostDetails[i];
      (this.sandForCoreFormArray.controls as FormGroup[])[i].patchValue({
        coreShape: info?.coreShape,
        coreArea: this.sharedService.convertUomInUI(this.sharedService.isValidNumber(Number(info?.coreArea)), this.conversionValue, this.isEnableUnitConversion),
        coreWeight: this.sharedService.isValidNumber(Number(info?.coreWeight)),
        coreHeight: this.sharedService.convertUomInUI(Number(info?.coreHeight), this.conversionValue, this.isEnableUnitConversion),
        coreLength: this.sharedService.convertUomInUI(Number(info?.coreLength), this.conversionValue, this.isEnableUnitConversion),
        coreWidth: this.sharedService.convertUomInUI(Number(info?.coreWidth), this.conversionValue, this.isEnableUnitConversion),
        coreVolume: this.sharedService.convertUomInUI(Number(info?.coreVolume), this.conversionValue, this.isEnableUnitConversion),
        coreSandPrice: this.sharedService.convertUomInUI(Number(info?.coreSandPrice), this.conversionValue, this.isEnableUnitConversion),
        // coreName: info?.coreName || '',
      });
    }
    this.patchMaterialCalculationResult(result);
  }

  private patchWeldingSubFormArray(materialInfo: MaterialInfoDto) {
    materialInfo.sandForCoreFormArray = this.sandForCoreFormArray;
    if (!materialInfo.coreCostDetails) {
      materialInfo.coreCostDetails = [];
    }
    for (let i = 0; i < materialInfo.coreCostDetails.length; i++) {
      const info = materialInfo.coreCostDetails[i];
      (this.sandForCoreFormArray.controls as FormGroup[])[i].patchValue({
        coreShape: info?.coreShape,
        grindFlush: info?.grindFlush,
        coreHeight: Number(info?.coreHeight),
        coreWidth: Number(info?.coreWidth),
        coreWeight: Number(info?.coreWeight),
        coreLength: Number(info?.coreLength),
        noOfCore: Number(info?.noOfCore),
        coreVolume: Number(info?.coreVolume),
        weldSide: Number(info?.weldSide),
        coreSandPrice: Number(info?.coreSandPrice),
      });
    }
  }

  private calculationsForConventionalPCB(materialInfo: MaterialInfoDto) {
    materialInfo.sandForCoreFormArray = this.sandForCoreFormArray;
    // for (let i = 0; i < materialInfo?.sandForCoreFormArray?.controls?.length; i++) {
    //   const info = materialInfo?.sandForCoreFormArray?.controls[i];
    //   (materialInfo?.sandForCoreFormArray.controls as FormGroup[])[i].patchValue({
    //     coreHeight: this.sharedService.convertUomToSaveAndCalculation(Number(info?.value?.coreHeight), this.conversionValue, this.isEnableUnitConversion),
    //     coreLength: this.sharedService.convertUomToSaveAndCalculation(Number(info?.value?.coreLength), this.conversionValue, this.isEnableUnitConversion),
    //     coreWidth: this.sharedService.convertUomToSaveAndCalculation(Number(info?.value?.coreWidth), this.conversionValue, this.isEnableUnitConversion),
    //   });
    // }
    this._pcbCalcService
      .calculationsForConventionalPCB(materialInfo, this.fieldColorsList, this.selectedMaterialInfo)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result: MaterialInfoDto) => {
        if (result) {
          // for (let i = 0; i < result?.sandForCoreFormArray?.controls?.length; i++) {
          //   const info = result.sandForCoreFormArray?.controls[i];
          //   (this.sandForCoreFormArray.controls as FormGroup[])[i].patchValue({
          //     coreWeight: this.sharedService.isValidNumber(Number(info?.value?.coreWeight)),
          //     coreHeight: this.sharedService.convertUomInUI(Number(info?.value?.coreHeight), this.conversionValue, this.isEnableUnitConversion),
          //     coreLength: this.sharedService.convertUomInUI(Number(info?.value?.coreLength), this.conversionValue, this.isEnableUnitConversion),
          //     coreWidth: this.sharedService.convertUomInUI(Number(info?.value?.coreWidth), this.conversionValue, this.isEnableUnitConversion),
          //   });
          // }
          this.patchMaterialCalculationResult(result);
        }
      });
  }

  private calculationsForCustomizeCable(materialInfo: MaterialInfoDto, customCableMarketDataDto: any, isAutomation: boolean, index = 0, materialType: number = 0) {
    materialInfo.sandForCoreFormArray = this.sandForCoreFormArray;
    const materialCategory = materialType > 0 ? materialType : this.currentSelectedMatGroupId;
    this.IsMaterialTypePlastics = Number(materialCategory) === MaterialCategory.Plastics ? true : false;
    this.IsMaterialTypeNonFerrous = Number(materialCategory) === MaterialCategory.NonFerrous ? true : false;
    materialInfo.materialGroupId = materialCategory;
    this._customCableCalculatorService.calculationsForCustomizeCable(materialInfo, this.fieldColorsList, this.selectedMaterialInfo, index, isAutomation);

    if (materialInfo) {
      this.patchMaterialCalculationResult(materialInfo);
      if (customCableMarketDataDto) {
        !this.IsMaterialTypePlastics && this.costingMaterialInfoform.controls['materialInfoId'].setValue(0);
        this.onFormSubmit(false, false, materialInfo);
      }
    }
  }

  public onFormSubmit(isPartialCreate = false, isPageLoad = false, customCableData: MaterialInfoDto = null): Observable<MaterialInfoDto> {
    this.isPageLoad = isPageLoad;
    const materialMasterDto = new MaterialMasterDto();
    let materialMasterId = 0,
      materialTypeId = 0;
    if (customCableData) {
      materialMasterId = customCableData.materialMasterId;
      this.materialDescriptionList = customCableData?.materialDescriptionList;
      this.materialMarketData = customCableData?.materialMarketData;
      materialTypeId = customCableData.materialDescriptionList.find((x) => x.materialMasterId == materialMasterId)?.materialTypeId;
    } else {
      materialMasterId = this.costingMaterialInfoform.controls['materialDescription'].value || 0;
      materialTypeId = this.costingMaterialInfoform.controls['materialFamily'].value || 0;
    }
    if (materialMasterId > 0) {
      if (this.IsMaterialTypePlastics && this.processFlag.IsProcessCustomizeCable) {
        materialMasterDto.materialDescription = this.plasticMaterialList.find((x) => x.materialMasterId == materialMasterId)?.materialDescription;
      } else if (this.IsMaterialTypeNonFerrous && this.processFlag.IsProcessCustomizeCable) {
        materialMasterDto.materialDescription = this.nonFerrousMaterialList.find((x) => x.materialMasterId == materialMasterId)?.materialDescription;
      } else {
        materialMasterDto.materialDescription = this.materialDescriptionList.find((x) => x.materialMasterId == materialMasterId)?.materialDescription;
      }
      materialMasterDto.materialMasterId = materialMasterId;
      materialMasterDto.materialTypeId = materialTypeId;
    }
    const materialMarketDto = new MaterialMarketDataDto();
    materialMarketDto.materialMarketId = this.materialMarketData.materialMarketId || undefined;
    materialMarketDto.materialMasterId = this.materialMarketData.materialMasterId || 0;
    materialMarketDto.price = this.materialMarketData.price || 0;
    materialMarketDto.materialMaster = materialMasterDto;
    let materialInfoDto = new MaterialInfoDto();
    materialInfoDto = this.materialMapper.materialFormSubmit(
      this.costingMaterialInfoform.controls,
      this.conversionValue,
      this.isEnableUnitConversion,
      this.currentPart?.partInfoId,
      isPartialCreate,
      materialMarketDto,
      materialMasterDto,
      this.materialMarketData,
      this.dataCompletionPercentage
    );
    if (this.processFlag.IsProcessCasting) {
      materialInfoDto = {
        ...materialInfoDto,
        ...this.materialMapper.materialCastingMapper.castingMaterialPayload(this.getFormGroup(FormGroupKeysMaterial.Casting).controls, this.conversionValue, this.isEnableUnitConversion),
      };
    } else if (this.processFlag.IsProcessMetalTubeExtrusion || this.processFlag.IsProcessMetalExtrusion) {
      materialInfoDto = {
        ...materialInfoDto,
        ...this.materialMapper.materialMetalExtrusionMapper.metalExtrusionMaterialPayload(
          this.getFormGroup(FormGroupKeysMaterial.MetalExtrusion).controls,
          this.conversionValue,
          this.isEnableUnitConversion
        ),
      };
    } else if (this.processFlag.IsProcessMachining) {
      materialInfoDto = {
        ...materialInfoDto,
        ...this.materialConfigService.materialMachiningConfigService.setPayload(this.getFormGroup(FormGroupKeysMaterial.Machining).controls, this.conversionValue, this.isEnableUnitConversion),
      };
    } else if (this.processFlag.IsProcessTubeBending) {
      materialInfoDto = {
        ...materialInfoDto,
        ...this.materialMapper.materialTubeBendingMapper.tubeBendingSetPayload(this.getFormGroup(FormGroupKeysMaterial.TubeBending).controls, this.conversionValue, this.isEnableUnitConversion),
      };
    } else if (this.processFlag.IsProcessInsulationJacket) {
      materialInfoDto = {
        ...materialInfoDto,
        ...this.materialMapper.materialInsulationJacketMapper.insulationJacketSetPayload(
          this.getFormGroup(FormGroupKeysMaterial.InsulationJacket).controls,
          this.conversionValue,
          this.isEnableUnitConversion
        ),
      };
    } else if (this.processFlag.IsProcessCustomizeCable) {
      materialInfoDto = {
        ...materialInfoDto,
        ...this.materialMapper.materialCustomCableMapper.setPayload(
          this.getFormGroup(FormGroupKeysMaterial.CustomCable).controls,
          this.materialMarketData,
          this.conversionValue,
          this.isEnableUnitConversion
        ),
      };
    } else if (this.processFlag.IsProcessConventionalPCB || this.processFlag.IsProcessRigidFlexPCB || this.processFlag.IsProcessSemiRigidFlexPCB) {
      materialInfoDto = {
        ...materialInfoDto,
        ...this.materialMapper.materialPcbMapper.materialPayload(this.getFormGroup(FormGroupKeysMaterial.Pcb).controls, this.conversionValue, this.isEnableUnitConversion),
      };
    } else if (this.processFlag.IsProcessPlasticTubeExtrusion) {
      materialInfoDto = {
        ...materialInfoDto,
        ...this.materialMapper.materialPlasticTubeExtrusionMapper.plasticTubeExtrusionSetPayload(
          this.getFormGroup(FormGroupKeysMaterial.PlasticTubeExtrusion).controls,
          this.conversionValue,
          this.isEnableUnitConversion
        ),
      };
    } else if (this.forging.hotForgingClosedDieHot) {
      materialInfoDto = {
        ...materialInfoDto,
        ...this.materialMapper.materialHotForgingClosedDieHotMapper.hotForgingClosedDieHotSetPayload(
          this.getFormGroup(FormGroupKeysMaterial.HotForgingClosedDieHot).controls,
          this.conversionValue,
          this.isEnableUnitConversion
        ),
      };
    } else if (this.currentPart?.commodityId === this.commodityType.Electronics) {
      materialInfoDto = {
        ...materialInfoDto,
        ...this.materialMapper.materialPcbaMapper.setPayload(this.getFormGroup(FormGroupKeysMaterial.Pcba).controls, this.materialMarketData, this.conversionValue, this.isEnableUnitConversion),
      };
    } else if (this.processFlag.IsProcessTypeInjectionMolding || this.processFlag.IsProcessTypeRubberInjectionMolding) {
      materialInfoDto = {
        ...materialInfoDto,
        ...this.materialMapper.injectionMoldingMapper.setPayload(this.getFormGroup(FormGroupKeysMaterial.InjectionMolding).controls, this.conversionValue, this.isEnableUnitConversion),
      };
    } else if (
      this.processFlag.IsProcessTypeCompressionMolding ||
      this.processFlag.IsProcessTypeBlowMolding ||
      this.processFlag.IsProcessTypeTransferMolding ||
      this.processFlag.IsProcessThermoForming ||
      this.processFlag.IsProcessPlasticVacuumForming
    ) {
      materialInfoDto = {
        ...materialInfoDto,
        ...this.materialMapper.compressionMoldingMapper.setPayload(this.getFormGroup(FormGroupKeysMaterial.CompressionMolding).controls, this.conversionValue, this.isEnableUnitConversion),
      };
    } else if (
      this.processFlag.IsProcessLaserCutting ||
      this.processFlag.IsProcessPlasmaCutting ||
      this.processFlag.IsProcessOxyCutting ||
      this.processFlag.IsProcessTubeLaserCutting ||
      this.processFlag.IsProcessTPP ||
      this.processFlag.IsProcessStampingStage ||
      this.processFlag.IsProcessStampingProgressive ||
      this.processFlag.IsProcessTransferPress ||
      this.processFlag.IsProcessMigWelding ||
      this.processFlag.IsProcessTigWelding ||
      this.processFlag.IsProcessTypeZincPlating ||
      this.processFlag.IsProcessTypeChromePlating ||
      this.processFlag.IsProcessTypeNickelPlating ||
      this.processFlag.IsProcessTypeCopperPlating ||
      this.processFlag.IsProcessTypeTinPlating ||
      this.processFlag.IsProcessTypeGoldPlating ||
      this.processFlag.IsProcessTypeSilverPlating ||
      this.processFlag.IsProcessTypeR2RPlating ||
      this.processFlag.IsProcessTypeGalvanization ||
      this.processFlag.IsProcessTypePowderCoating ||
      this.processFlag.IsProcessTypePowderPainting
    ) {
      materialInfoDto = {
        ...materialInfoDto,
        ...this.materialMapper.sheetMetalMaterialMapper.setPayload(this.getFormGroup(FormGroupKeysMaterial.SheetMetal).controls, this.conversionValue, this.isEnableUnitConversion),
      };
    }
    if (
      ((this.processFlag.IsProcessGreenCasting ||
        this.processFlag.IsProcessNoBakeCasting ||
        this.processFlag.IsProcessShellCasting ||
        this.processFlag.IsProcessGDCCasting ||
        this.processFlag.IsProcessLPDCCasting ||
        this.processFlag.IsProcessVProcessSandCasting ||
        this.processFlag.IsProcessSand3DPrinting) &&
        this.processFlag.IsProcessTypeSandForCore) ||
      this.processFlag.IsProcessCustomizeCable ||
      this.processFlag.IsProcessConventionalPCB ||
      this.processFlag.IsProcessRigidFlexPCB ||
      this.processFlag.IsProcessSemiRigidFlexPCB ||
      this.processFlag.IsProcessMigWelding ||
      this.processFlag.IsProcessTigWelding
    ) {
      materialInfoDto.coreCostDetails = [];
      materialInfoDto.coreCostDetails = this.materialMapper.coreCostDetailMapper.mapFormArrayToCoreCostDetails(this.sandForCoreFormArray, materialInfoDto.materialInfoId);
    }

    materialInfoDto = {
      ...materialInfoDto,
      ...this.materialMapper.materialSustainabilityMapper.materialSustainabilitySetPayload(this.getFormGroup(FormGroupKeysMaterial.MaterialSustainability).controls),
    };

    if (materialInfoDto.materialInfoId > 0) {
      // this._store.dispatch(new MaterialInfoActions.UpdateMaterialInfo(materialInfoDto));
      this._materialInfoSignalsService.updateMaterialInfo(materialInfoDto);
      this.isNewmaterialinfo = false;
      this.updateSaveMaterialLoad(materialInfoDto.materialInfoId, materialInfoDto);
    } else {
      // this._store.dispatch(new MaterialInfoActions.CreateMaterialInfo(materialInfoDto));
      this._materialInfoSignalsService.createMaterialInfo(materialInfoDto);
      this.isNewmaterialinfo = true;
    }
    // commented because of default values cannot be current values...
    // this.defaultValues.materialPrice = materialInfoDto?.materialPricePerKg ?? this.defaultValues.materialPrice;
    // this.defaultValues.scrapPrice = materialInfoDto?.scrapPricePerKg ?? this.defaultValues.scrapPrice;
    // this.defaultValues.volumePurchased = materialInfoDto?.volumePurchased ?? this.defaultValues.volumePurchased;
    // this.defaultValues.volumeDiscount = materialInfoDto?.volumeDiscountPer ?? this.defaultValues.volumeDiscount;
    this.calculateTotalMaterialCost(materialInfoDto);
    this.showAddNewOption = true;
    return new Observable((obs) => {
      obs.next(materialInfoDto);
    });
  }

  updateSaveMaterialLoad(selectedMaterialInfoId: number, materialInfoDto: MaterialInfoDto = null) {
    if (!this.isPageLoad && this.materialInfoList && this.materialInfoList.length > 0) {
      this.selectedMaterialInfoId = selectedMaterialInfoId;
    } else {
      this.selectedMaterialInfoId = 0;
    }
    this.processFlag.IsProcessCustomizeCable && (this.selectedMaterialInfoId = 0);
    this.formIdentifier = {
      ...this.formIdentifier,
      primaryId: this.selectedMaterialInfoId,
    };
    this.afterChange = false;
    this.dirtyCheckEvent.emit(this.afterChange);
    this.saveColoringInfo();
    this.isMaterialDetailsDisplay = true;
    this.percentageCalculator.dispatchHasPartSectionDataUpdateEvent({});
    this.navigatetoNextUrl();
    if (this.processFlag.IsProcessCasting && materialInfoDto && materialInfoDto.secondaryProcessId == 2 && materialInfoDto.coreCostDetails?.some((c) => c.coreCostDetailsId === 0)) {
      this.automateProcessForNewSandCores();
    }
    this.messaging.openSnackBar(`Data saved successfully.`, '', {
      duration: 5000,
    });
  }

  automateProcessForNewSandCores() {
    let processInfoList = this._processInfoSignalsService.processInfos();
    if (!processInfoList?.length) return;
    let materialList = this._materialInfoSignalsService.materialInfos();
    this.coreAutomationSignalService.triggerRecalculation({
      totmaterialList: materialList,
      currentPart: this.currentPart,
      newCoreAdded: true,
    });
  }

  onAddMaterialEdit(materialInfo: MaterialInfoDto) {
    this.reset();
    this.clearProcessTypeFlags();
    this.onEdit(materialInfo);
  }

  public onEdit(materialInfo: MaterialInfoDto) {
    this.isEdit = true;
    this.currentSelectedMaterialInfo = materialInfo;
    if (!this.costingMaterialInfoform) {
      this.createForm();
    }
    if (this.cableHarnessTypeFormArray.length > 0) {
      this.cableHarnessTypeFormArray.clear();
    }
    if (this.sandForCoreFormArray.length > 0) {
      this.sandForCoreFormArray.clear();
    }
    this.selectedMaterialInfoId = materialInfo.materialInfoId;
    this.getColorInfo();
    this.costingMaterialInfoform.controls.materialInfoId.setValue(materialInfo.materialInfoId);
    this.currentSelectedMatGroupId = 0;
    let materialMasterId = 0;
    if (materialInfo?.processId && materialInfo?.processId > 0) {
      this.mapOnPrimaryProcessEditCall(materialInfo?.processId);
      if (this.processFlag.IsProcessCasting && +materialInfo.secondaryProcessId > 0) {
        this.processFlag = {
          ...this.processFlag,
          ...this.materialMapper.materialCastingMapper.setSecondaryProcessTypeFlags(+materialInfo.secondaryProcessId),
        };
      }
    }
    this.formIdentifier = {
      ...this.formIdentifier,
      primaryId: this.selectedMaterialInfoId,
    };
    // if (this.processFlag.IsProcessCustomizeCable) {
    //   this.blockUiService.pushBlockUI('customCable');
    // }
    if (
      materialInfo.materialMarketId &&
      materialInfo.materialMarketId > 0 &&
      !this.processFlag.IsProcessConventionalPCB &&
      !this.processFlag.IsProcessRigidFlexPCB &&
      !this.processFlag.IsProcessSemiRigidFlexPCB
    ) {
      this.materialMasterService
        .getMaterialMasterByMaterialMarketDataId(materialInfo.materialMarketId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((response) => {
          if (response) {
            // if (this.processFlag.IsProcessCustomizeCable) {
            //   this.blockUiService.popBlockUI('customCable');
            // }
            materialInfo = {
              ...materialInfo,
              materialMarketData: response.materialMarketData,
            };
            this.materialMarketData = response.materialMarketData;
            //const typeId = response?.materialMarketData?.materialMaster?.materialTypeId || 0;
            this.currentSelectedMatGroupId = response?.materialMarketData?.materialMaster?.materialType?.materialGroupId || 0;
            materialMasterId = response?.materialMarketData?.materialMaster?.materialMasterId || 0;
            this.IsMaterialTypePlastics = Number(this.currentSelectedMatGroupId) === MaterialCategory.Plastics ? true : false;
            this.IsMaterialTypeNonFerrous = Number(this.currentSelectedMatGroupId) === MaterialCategory.NonFerrous ? true : false;
            if (
              this.IsCountryChanged ||
              this.processFlag.IsProcessCustomizeCable ||
              // this.materialTypeList?.length == 0 ||
              this.materialDescriptionList?.length == 0 ||
              materialInfo.isAiSuggested ||
              this.materialTypeList?.length >= 0
              // (this.materialTypeList?.length > 0 && this.materialTypeList[0].materialGroupId !== this.currentSelectedMatGroupId)
            ) {
              const matTypeList = this.stockFormCategoriesDto
                .filter((x) => x.materialGroupId === this.currentSelectedMatGroupId)
                .map((x) => ({ materialTypeId: x.materialTypeId, materialTypeName: x.materialType, materialGroupId: x.materialGroupId }) as MaterialTypeDto);
              this.materialTypeList = [...new Set(matTypeList)].sort((a, b) => a.materialTypeName.localeCompare(b.materialTypeName));
              const materialCategory = this.stockFormCategoriesDto.find((x) => x.materialGroupId === this.currentSelectedMatGroupId)?.materialGroup || '';
              if (this.materialTypeList.length > 0) {
                if (materialMasterId > 0) {
                  this.setMaterialMasterdataOnEdit(materialMasterId);
                }
                if (response?.materialMasterDto) {
                  this.materialDescriptionList = response?.materialMasterDto;
                }
                this.showAddNewOption = true;
                let matMaster = this.materialDescriptionList.find((x) => x.materialMasterId === Number(materialMasterId));
                this.selectedMaterialDetails = 'Physical Properties' + '                    ' + matMaster.materialDescription + '                    ' + this.currentCountryName;
                this.updateChart(materialMasterId);
                this.stockFormList = matMaster?.stockForms;
                const process = this.processList.length > 0 && this.processList[0].data.find((x) => x.processId === (this.selectedProcessId === 0 ? materialInfo?.processId : this.selectedProcessId));
                let stockForm = '';
                if (this.stockFormList.length > 0) {
                  stockForm = this.getStockForm(process, materialInfo.dimZ, materialInfo.stockForm);
                }
                const stockFormId = this.stockFormDtos.find((x) => x.formName === stockForm)?.stockFormId;
                this.showMasterBatchSection = this.processFlag.IsProcessTypeInjectionMolding && stockFormId === this.materialConfigService.StockForm.GranulesWithMasterbatch;
                const matPriceBystockForm = stockForm ? this.getMatPriceByMultiplier(stockForm) : 0;
                const matPrice = materialInfo.materialPricePerKg ? materialInfo.materialPricePerKg : matPriceBystockForm;
                this.defaultValues.materialPrice = Number(matPriceBystockForm);
                this.defaultValues.regrindAllowance = Number(materialInfo.regrindAllowance);
                this.defaultValues.utilisation = Number(materialInfo.utilisation);
                this.defaultValues.netWeight = Number(materialInfo.netWeight);
                if (this.currentPart?.commodityId === this.commodityType.SheetMetal) {
                  // For Sheet metal these fields mapped for Shearing and yield strength
                  this.costingMaterialInfoform.controls.meltTemp.setValue(matMaster?.shearingStrength);
                  this.costingMaterialInfoform.controls.moldTemp.setValue(matMaster?.yieldStrength);
                  this.costingMaterialInfoform.controls.ultimateTensileStrength.setValue(matMaster?.tensileStrength);
                } else {
                  this.costingMaterialInfoform.controls.meltTemp.setValue(matMaster?.meltingTemp);
                  this.costingMaterialInfoform.controls.moldTemp.setValue(matMaster?.moldTemp);
                }
                this.costingMaterialInfoform.patchValue({
                  materialCategory,
                  materialFamily: matMaster?.materialTypeId,
                  materialDescription: materialMasterId,
                  stockForm,
                  matPrice: this.roundNumber(matPrice),
                  clampingPressure: matMaster?.clampingPressure,
                  ejectTemp: matMaster?.ejectDeflectionTemp,
                  materialDesc: matMaster?.materialDescription,
                  density: matMaster?.density,
                  countryName: this.currentCountryName,
                });
                if (this.forging.hotForgingClosedDieHot || this.forging.hotForgingOpenDieHot || this.forging.coldForgingClosedDieHot || this.processFlag.IsProcessColdForgingColdHeading) {
                  this.updateStockFormFlags();
                }
                if (materialInfo.stockForm !== stockForm) {
                  materialInfo.stockForm = stockForm;
                  this.dirtyCheckEvent.emit(true);
                }
                if (materialInfo.materialPricePerKg !== matPrice) {
                  materialInfo.materialPricePerKg = matPrice;
                  this.dirtyCheckEvent.emit(true);
                }
                this.setForm(materialInfo);
                setTimeout(() => {
                  this.calculateCost();
                }, 1000);
              }
            }
            this.isMaterialDetailsDisplay = true;
            this.setForm(materialInfo);
          }
        });
    } else {
      this.setForm(materialInfo);
    }
    if (this.processFlag.IsProcessTypePlating || this.processFlag.IsProcessTypeWetPainting || this.processFlag.IsProcessTypeSiliconCoatingAuto || this.processFlag.IsProcessTypeSiliconCoatingSemi) {
      this.setBaseMaterialData(materialInfo);
    }
    // if (
    //   (this.processFlag.IsProcessNoBakeCasting ||
    //     this.processFlag.IsProcessShellCasting ||
    //     this.processFlag.IsProcessInvestmentCasting ||
    //     this.processFlag.IsProcessGreenCasting ||
    //     this.processFlag.IsProcessGDCCasting ||
    //     this.processFlag.IsProcessLPDCCasting ||
    //     this.processFlag.IsProcessVProcessSandCasting ||
    //     this.processFlag.IsProcessSand3DPrinting) &&
    //   materialInfo.secondaryProcessId &&
    //   materialInfo.secondaryProcessId > 0
    // ) {
    //   this.costingMaterialInfoform.controls.secondaryProcessId.setValue(materialInfo.secondaryProcessId);
    // }
    if (materialInfo?.coreCostDetails) {
      if (this.sandForCoreFormArray.length > 0) {
        this.sandForCoreFormArray.clear();
      }
      this.isCoreCostDisplay = true;
      this.materialMapper.coreCostDetailMapper.mapCoreCostDetailsToFormArray(this.sandForCoreFormArray, materialInfo?.coreCostDetails, this.selectedMaterialInfoId);
      if (!(this.processFlag.IsProcessMigWelding || this.processFlag.IsProcessTigWelding)) {
        for (let i = 0; i < this.sandForCoreFormArray?.controls?.length; i++) {
          if (!this.sandForCoreFormArray?.controls[i].value.coreSandPrice) {
            (this.sandForCoreFormArray.controls as FormGroup[])[i].patchValue({
              coreSandPrice: Number(this.sandForCoreFormArray?.controls[i].value.coreWeight * Number(materialInfo?.materialPricePerKg)).toFixed(4), // core sand price(kg)
            });
          }
        }
      }
    }
    // if (
    //   materialInfo.secondaryProcessId &&
    //   materialInfo.secondaryProcessId > 0 &&
    //   (this.processFlag.IsProcessGreenCasting ||
    //     this.processFlag.IsProcessInvestmentCasting ||
    //     this.processFlag.IsProcessNoBakeCasting ||
    //     this.processFlag.IsProcessShellCasting ||
    //     this.processFlag.IsProcessGDCCasting ||
    //     this.processFlag.IsProcessLPDCCasting ||
    //     this.processFlag.IsProcessVProcessSandCasting ||
    //     this.processFlag.IsProcessSand3DPrinting)
    // ) {
    //   // this.isMoldCostDisplay = true;
    //   this.processFlag.IsProcessTypePouring = materialInfo.secondaryProcessId === SubProcessType.MetalForPouring;
    //   this.processFlag.IsProcessTypeSandForCore = materialInfo.secondaryProcessId === SubProcessType.SandForCore;
    //   this.processFlag.IsProcessTypeSandForMold = materialInfo.secondaryProcessId === SubProcessType.SandForMold;
    //   this.processFlag.IsProcessTypePatternWax = materialInfo.secondaryProcessId === SubProcessType.PatternWax;
    //   this.processFlag.IsProcessTypeSlurryCost = materialInfo.secondaryProcessId === SubProcessType.SlurryCost;
    //   this.processFlag.IsProcessTypeZirconSand = materialInfo.secondaryProcessId === SubProcessType.ZirconSand;
    // }

    this.selectedMaterialInfo = materialInfo;
    this.selectedMaterialInfoOut.emit(this.selectedMaterialInfo);
    this.listMaterialInfoOut.emit(this.materialInfoList);
    this.processFlag.IsProcessStockFormRound = false;
    if (!this.processFlag.IsProcessMetalTubeExtrusion) {
      let val = 1; // rectangular
      if (this.currentPart?.commodityId === 5 && materialInfo.stockForm) {
        this.processFlag.IsProcessStockFormRound = materialInfo.stockForm === 'Round Bar';
        this.processFlag.IsProcessStockFormRectangleBar = materialInfo.stockForm === 'Rectangular Bar';
        this.processFlag.IsProcessStockFormWire = materialInfo.stockForm === 'Wire';
        if (materialInfo.stockForm === 'Round Bar') {
          val = 2;
        }
      }
      this.costingMaterialInfoform.controls.stockType.setValue(val);
    }
    // Automation for casting co process selection
    if (!materialInfo?.processId && this.currentPart?.commodityId === this.commodityType.Casting && !this.processFlag.IsProcessHPDCCasting && !this.processFlag.IsProcessInvestmentCasting) {
      if (this.materialInfoList.length === 2 && this.materialInfoList[0].secondaryProcessId === SubProcessType.MetalForPouring && !this.materialInfoList[1].secondaryProcessId) {
        this.costingMaterialInfoform.controls.matPrimaryProcessName.setValue(this.materialInfoList[0]?.processId);
        this.onPrimaryProcessChange({ currentTarget: { value: this.materialInfoList[0]?.processId } });
        this.costingMaterialInfoform.controls.secondaryProcessId.setValue(SubProcessType.SandForCore);
        this.onCastingSubProcessChange({ currentTarget: { value: SubProcessType.SandForCore } });
      } else if (this.materialInfoList.length === 3 && this.materialInfoList[1].secondaryProcessId === SubProcessType.SandForCore && !this.materialInfoList[2].secondaryProcessId) {
        if (![PrimaryProcessType.LPDCCasting, PrimaryProcessType.GDCCasting].includes(this.materialInfoList[0].processId)) {
          this.costingMaterialInfoform.controls.matPrimaryProcessName.setValue(this.materialInfoList[0]?.processId);
          this.onPrimaryProcessChange({ currentTarget: { value: this.materialInfoList[0]?.processId } });
          this.costingMaterialInfoform.controls.secondaryProcessId.setValue(SubProcessType.SandForMold);
          this.onCastingSubProcessChange({ currentTarget: { value: SubProcessType.SandForMold } });
        }
      }
    }
  }

  getStockForm(process: ProcessMasterDto, dimZ: number, stockForm?: string): string {
    if (process?.commodityId === this.commodityType.MetalForming) {
      if (process?.processId === PrimaryProcessType.ColdForgingClosedDieHot || process?.processId === PrimaryProcessType.ColdForgingColdHeading) {
        const wireForm = this.stockFormList.find((x) => x.formName === 'Wire');
        return wireForm?.formName || this.stockFormList[0]?.formName || '';
      }

      if (process?.processId === PrimaryProcessType.HotForgingClosedDieHot || process?.processId === PrimaryProcessType.HotForgingOpenDieHot) {
        const roundBarForm = this.stockFormList.find((x) => x.formName === 'Round Bar');
        return roundBarForm?.formName || this.stockFormList[0]?.formName || '';
      }
    }
    if (!stockForm && process?.stockFormId && this.stockFormList.find((x) => x.stockFormId === process?.stockFormId)) {
      return this.stockFormList.find((x) => x.stockFormId === process.stockFormId).formName;
    } else if (!stockForm && process?.stockFormExpression) {
      const stockFormId = new Function('dimZ', `return ${process.stockFormExpression};`)(dimZ);
      return this.stockFormList.find((x) => x.stockFormId === stockFormId)?.formName;
    } else if (stockForm) {
      return stockForm;
    } else {
      return this.stockFormList[0].formName;
    }
  }
  getMatPriceByMultiplier(formName: string) {
    if (formName) {
      const stockFormId = this.stockFormList.find((x) => x.formName === formName)?.stockFormId || 0;
      const multiplier = this.countryFormMatixDtos.find((x) => x.countryId === this.materialMarketData.countryId && x.stockFormId === stockFormId)?.multiplier || 1;
      return this.materialMarketData?.price * multiplier;
    }
    return 0;
  }
  setBaseMaterialData(materialInfo: MaterialInfoDto) {
    if (this.materialInfoList[0].materialMarketId && this.materialInfoList[0].materialMarketId > 0) {
      this.materialMasterService
        .getMaterialMasterByMaterialMarketDataId(this.materialInfoList[0].materialMarketId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((response) => {
          if (response) {
            const baseTypeId = response?.materialMarketData?.materialMaster?.materialTypeId || 0;
            const baseMaterialgroupId = response?.materialMarketData?.materialMaster?.materialType?.materialGroupId || 0;
            const baseMaterialMasterId = response?.materialMarketData?.materialMaster?.materialMasterId || 0;
            if (this.IsCountryChanged || this.baseMaterialTypeList?.length == 0 || this.baseMaterialDescriptionList?.length == 0) {
              this.baseMaterialTypeList = this.stockFormCategoriesDto
                .filter((x) => x.materialGroupId == baseMaterialgroupId)
                .map((x) => ({ materialTypeId: x.materialTypeId, materialTypeName: x.materialType, materialGroupId: x.materialGroupId }) as MaterialTypeDto);
            }
            if (!!materialInfo?.baseMaterialTypeId && materialInfo?.baseMaterialTypeId !== baseTypeId) {
              this.onMaterialTypeChange({ currentTarget: { value: materialInfo?.baseMaterialTypeId } }, 'base');
            } else {
              if (response?.materialMasterDto) {
                this.baseMaterialDescriptionList = response?.materialMasterDto;
              }
            }
            setTimeout(() => {
              this.costingMaterialInfoform.patchValue({
                baseMaterialFamily: materialInfo?.baseMaterialTypeId || baseTypeId,
                baseMaterialDescription: materialInfo?.baseMaterialDescription || baseMaterialMasterId,
                partTickness: this.sharedService.convertUomInUI(materialInfo?.partTickness || this.materialInfoList[0]?.dimUnfoldedZ, this.conversionValue, this.isEnableUnitConversion),
                length: this.sharedService.convertUomInUI(materialInfo?.dimX || this.materialInfoList[0]?.dimX, this.conversionValue, this.isEnableUnitConversion),
                width: this.sharedService.convertUomInUI(materialInfo?.dimY || this.materialInfoList[0]?.dimY, this.conversionValue, this.isEnableUnitConversion),
                height: this.sharedService.convertUomInUI(materialInfo?.dimZ || this.materialInfoList[0]?.dimZ, this.conversionValue, this.isEnableUnitConversion),
              });
            }, 2000);
          }
        });
    }
  }

  private setForm(materialInfo: MaterialInfoDto) {
    this.costingMaterialInfoform?.patchValue(this.materialMapper.materialFormPatch(materialInfo, this.conversionValue, this.isEnableUnitConversion, this.totalSandVolume));
    this.processFlag.IsProcessCasting && this.calculateTotalMaterialCost(this.materialInfoList); // TODO weld
    this.isTypeOfConductorsEnabled = Number(materialInfo.typeOfConductor) > 0 ? true : false;
    this.processFlag.IsProcessCustomizeCable && this.setCableTypeFlags(materialInfo.typeOfCable);
    this.custom.noOfCableValid = materialInfo?.noOfCables > 0 ? true : false;
    this.custom.noOfCableSimilarDia = materialInfo?.noOfCablesWithSameDia > 0 ? true : false;
  }

  public validateUnfoldLength(e: any) {
    const coilWidth = e.currentTarget.value;
    const unfold = Number(this.costingMaterialInfoform.controls['unfoldedWidth'].value);
    if (Number(unfold) > Number(coilWidth)) {
      this.messaging.openSnackBar(`Please enter the value greater than Unfolded Width.`, '', { duration: 5000 });
    }
    this.calculateCost();
  }

  public onMaterialDescChange(event: any, ctrl = '') {
    if (ctrl !== 'base') {
      const materialMasterId = event.currentTarget.value;
      this.mapOnMaterialDesc(materialMasterId);
    }
  }

  onCustomCableEmitterReceived(event: any) {
    this.setCableTypeFlags(event);
  }

  setCableTypeFlags(cableType: number) {
    if (cableType > 0) {
      this.cableTypes.isSolidCore = cableType === CabType.SolidCore;
      this.cableTypes.isMulticonductor = cableType === CabType.Multiconductor;
      this.cableTypes.isCoAxial = cableType === CabType.CoAxial;
      this.cableTypes.isShieldedTwistedPair = cableType === CabType.ShieldedTwistedPair;
      this.cableTypes.isThermalBraidedShelded = cableType === CabType.ThermalBraidedShelded;
      this.cableTypes.isUnsheldedTwistedPair = cableType === CabType.UnsheldedTwistedPair;
      this.isTypeOfConductorsEnabled = true;
    } else {
      this.isTypeOfConductorsEnabled = false;
      this.costingMaterialInfoform.controls.typeOfConductor.setValue('');
      this.processFlag.IsProcessCustomizeCable && this.getFormGroup(FormGroupKeysMaterial.CustomCable).controls.typeOfConductor.setValue('');
    }
    !this.cableTypes.isMulticonductor && this.sandForCoreFormArray.clear();
  }

  private updateChart(materialMasterId: number) {
    this.materialMasterService
      .getMaterialCompositionByMaterialId(materialMasterId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data) => {
        this.materialCompositionDtos = data.map((x) => ({ compositionDescription: x.compositionDescription, min: x.min, max: x.max }));
        switch (this.materialCompositionDtos.length) {
          case 1:
            this.chartHeight = 100;
            break;
          case 2:
            this.chartHeight = 150;
            break;
          case 3:
            this.chartHeight = 200;
            break;
          case 4:
            this.chartHeight = 250;
            break;
          case 5:
            this.chartHeight = 400;
            break;
          default:
            this.chartHeight = 400;
            break;
        }
      });
    this.materialMasterService
      .getMaterialMarketDataByCountryIdAndMaterialId(this.currentPart?.mfrCountryId, materialMasterId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data) => {
        if (data?.length > 0) {
          let dataPoints = data.map((x) => [x.timeStamp, Math.round(x.price * 1000) / 1000]);
          this.stockData = Array.from(dataPoints);
          this.past3MonthChange = 0;
          this.next6MonthChange = 0;
          const currentMonthStartPrice = this.stockData.find(([x, _]) => x === this.threeMonthsStartDate)?.[1];
          const threeMonthsEndPrice = this.stockData.find(([x, _]) => x === this.threeMonthsEndDate)?.[1];

          const next6MonthsStartPrice = this.stockData.find(([x, _]) => x === this.next6MonthsStartDate)?.[1];
          const next6MonthsEndPrice = this.stockData.find(([x, _]) => x === this.next6MonthsEndDate)?.[1];
          if (currentMonthStartPrice && threeMonthsEndPrice) {
            this.past3MonthChange = this.roundNumber(((currentMonthStartPrice - threeMonthsEndPrice) / threeMonthsEndPrice) * 100);
          }
          if (next6MonthsStartPrice && next6MonthsEndPrice) {
            this.next6MonthChange = this.roundNumber(((next6MonthsEndPrice - next6MonthsStartPrice) / next6MonthsStartPrice) * 100);
          }
        }
      });
  }
  private mapOnMaterialDesc(materialMasterId: number) {
    if (materialMasterId != 0 && this.currentPart?.mfrCountryId && this.currentPart?.mfrCountryId != 0) {
      this.updateMaterialDetails(materialMasterId);
    } else if (materialMasterId !== 0) {
      this.costingMaterialInfoform.controls.materialDescription.setValue(materialMasterId);
      this.costingMaterialInfoform.controls.density.setValue(this.materialDescriptionList.find((x) => x.materialMasterId == materialMasterId)?.density);
      this.calculateCost();
    }
  }

  updateMaterialDetails(materialMasterId: number) {
    this.updateChart(materialMasterId);
    const marketMonth = this.currentMarketMonth ?? this.selectedProject.marketMonth ?? this.sharedService.getMarketMonth(this.selectedProject.marketQuarter);
    this.materialMasterService
      .getMaterialMarketDataByMarketQuarter(this.currentPart?.mfrCountryId, materialMasterId, marketMonth)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (result) => {
          if (result?.length > 0) {
            // let multiplier = 1;
            this.materialMarketData = result[0];
            this.costingMaterialInfoform.controls.materialDescription.setValue(materialMasterId);
            let matMaster = this.materialDescriptionList.find((x) => x.materialMasterId === Number(materialMasterId));
            if (matMaster) {
              this.selectedMaterialDetails = 'Physical Properties' + '                    ' + matMaster.materialDescription + '                    ' + this.currentCountryName;
              this.costingMaterialInfoform.controls.materialDesc.setValue(matMaster?.materialDescription);
              this.costingMaterialInfoform.controls.countryName.setValue(this.currentCountryName);
            }
            this.costingMaterialInfoform.controls.materialFamily.setValue(matMaster?.materialTypeId);
            this.costingMaterialInfoform.controls.density.setValue(matMaster?.density);
            this.costingMaterialInfoform.controls.clampingPressure.setValue(matMaster?.clampingPressure);
            if (this.currentPart?.commodityId === this.commodityType.SheetMetal) {
              // For Sheet metal these fields mapped for Shearing and yield strength
              this.costingMaterialInfoform.controls.meltTemp.setValue(matMaster?.shearingStrength);
              this.costingMaterialInfoform.controls.moldTemp.setValue(matMaster?.yieldStrength);
              this.costingMaterialInfoform.controls.ultimateTensileStrength.setValue(matMaster?.tensileStrength);
            } else {
              this.costingMaterialInfoform.controls.meltTemp.setValue(matMaster?.meltingTemp);
              this.costingMaterialInfoform.controls.moldTemp.setValue(matMaster?.moldTemp);
            }
            this.costingMaterialInfoform.controls.ejectTemp.setValue(matMaster?.ejectDeflectionTemp);

            this.defaultValues.density = Number(this.materialMarketData?.materialMaster?.density);
            this.defaultValues.sandCost = Number(this.materialDescriptionList.find((x) => x.materialMasterId == materialMasterId)?.sandCost);
            this.setSupplierValues(materialMasterId);
            // this.calculateCost();
          }
        },
        error: () => {
          console.error();
        },
      });
  }
  private setMaterialMasterdataOnEdit(materialMasterId: number) {
    // if (this.processFlag.IsProcessCustomizeCable) {
    //   this.blockUiService.pushBlockUI('setMaterialMasterdataOnEdit');
    // }
    if (materialMasterId != 0 && this.currentPart?.mfrCountryId && this.currentPart?.mfrCountryId != 0) {
      const marketMonth = this.currentMarketMonth ?? this.selectedProject?.marketMonth ?? this.sharedService.getMarketMonth(this.selectedProject.marketQuarter);
      this.materialMasterService
        .getMaterialMarketDataByMarketQuarter(this.currentPart?.mfrCountryId, materialMasterId, marketMonth)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((result) => {
          if (result?.length > 0) {
            this.materialMarketData = result[0];
            // commented because of default values cannot be current valuess...
            // this.defaultValues.scrapPrice = this.currentSelectedMaterialInfo?.scrapPricePerKg ?? Number(result[0]?.generalScrapPrice);
            // this.defaultValues.materialPrice = this.currentSelectedMaterialInfo?.materialPricePerKg ?? Number(result[0]?.price);
            // this.defaultValues.volumePurchased = this.currentSelectedMaterialInfo?.volumePurchased;
            // this.defaultValues.volumeDiscount = this.currentSelectedMaterialInfo?.volumeDiscountPer;
            const stockForm = this.costingMaterialInfoform.get('stockForm').value ?? this.selectedMaterialInfo.stockForm;
            const matPriceBystockForm = stockForm ? this.getMatPriceByMultiplier(stockForm) : Number(result[0]?.price);
            this.defaultValues.scrapPrice = Number(result[0]?.generalScrapPrice);
            this.defaultValues.materialPrice = Number(matPriceBystockForm);
            this.defaultValues.density = Number(this.materialDescriptionList.find((x) => x.materialMasterId == materialMasterId)?.density);
            this.defaultValues.sandCost = Number(this.materialDescriptionList.find((x) => x.materialMasterId == materialMasterId)?.sandCost);
            // setTimeout(() => {
            //   this.calculateCost();
            //   if (this.processFlag.IsProcessCustomizeCable) {
            //     this.blockUiService.popBlockUI('setMaterialMasterdataOnEdit');
            //   }
            // }, 2000);
            // } else {
            // if (this.processFlag.IsProcessCustomizeCable) {
            //   this.blockUiService.popBlockUI('setMaterialMasterdataOnEdit');
            // }
          }
        });
      // } else {
      // if (this.processFlag.IsProcessCustomizeCable) {
      //   this.blockUiService.popBlockUI('setMaterialMasterdataOnEdit');
      // }
    }
  }

  getNetWeightForAssembly() {
    this._materialService
      .getNetWeightByPartInfoId(this.currentPart?.partInfoId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((result) => {
        if (result) {
          this.netWeightForAssembly = result;
        }
      });
  }

  public onMaterialTypeChange(event: any, ctrl = '') {
    const materialTypeId = event.currentTarget.value;
    const materialTypeIdNone = event?.detail?.value;
    this.mapOnMaterialTypeChange(materialTypeId, materialTypeIdNone, ctrl);
  }

  public mapOnMaterialTypeChange(materialTypeId: number, materialTypeIdNone?: number, ctrl = '') {
    // const materialTypeId = event.currentTarget.value;
    // const materialTypeIdNone = event?.detail?.value;
    // this.materialDescriptionList = [];
    this.costingMaterialInfoform.controls.materialDescription.setValue(0);
    if (materialTypeId && !materialTypeIdNone) {
      // this.blockUiService.pushBlockUI('materialTypeChange');
      this.materialMasterService
        .getmaterialsByMaterialTypeId(materialTypeId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: (result) => {
            if (ctrl === 'base') {
              const baseStockForm = this.materialInfoList[0]?.stockForm || null;
              this.baseMaterialDescriptionList = baseStockForm ? result?.filter((x) => x.stockForm == baseStockForm) : result;
            } else {
              this.materialDescriptionList = result;
            }
            this.costingMaterialInfoform.controls['materialFamily'].setValue(result[0].materialTypeId);
            // this.blockUiService.popBlockUI('materialTypeChange');
          },
          error: () => {
            console.error();
            // this.blockUiService.popBlockUI('materialTypeChange');
          },
        });
    }
    if (!materialTypeId && materialTypeIdNone) {
      // this.blockUiService.pushBlockUI('materialTypeChange');
      this.materialMasterService
        .getmaterialsByMaterialTypeId(materialTypeIdNone)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: (result) => {
            if (ctrl === 'base') {
              const baseStockForm = this.materialInfoList[0]?.stockForm || null;
              this.baseMaterialDescriptionList = baseStockForm ? result?.filter((x) => x.stockForm == baseStockForm) : result;
            } else {
              this.materialDescriptionList = result;
            }
            // this.blockUiService.popBlockUI('materialTypeChange');
            this.costingMaterialInfoform.controls.materialFamily.setValue(materialTypeIdNone);
            this.costingMaterialInfoform.controls.materialDescription.setValue(this.materialDescriptionList[0].materialMasterId);
            this.mapOnMaterialDesc(this.materialDescriptionList[0].materialMasterId);
          },
          error: () => {
            console.error();
            // this.blockUiService.popBlockUI('materialTypeChange');
          },
        });
    }
  }

  public onDelete(materialInfo: MaterialInfoDto) {
    const primaryProcessData = this.processList?.filter((x) => x.group === 'Primary Process')[0]?.data;
    const secondaryProcessData = this.processList?.filter((x) => x.group === 'Secondary Process')[0]?.data;
    if (
      primaryProcessData?.filter((y) => y.processId === Number(materialInfo?.processId))?.length === 1 && // primary material being deleted
      primaryProcessData?.filter((y) => this.materialInfoList?.map((x) => x.processId).includes(y.processId))?.length === 1 && // one primary material exists
      secondaryProcessData?.filter((y) => this.materialInfoList?.map((x) => x.processId).includes(y.processId))?.length > 0 // seconday material exists
    ) {
      this.messaging.openSnackBar(`Secondary material data must be deleted before deleting the base material data.`, '', { duration: 4000 });
      return;
    }
    if (this.materialInfoList?.length === 1 && this.manufactureData?.length > 0) {
      this.messaging.openSnackBar(`Manufacturing data must be deleted before deleting the material data.`, '', { duration: 4000 });
      return;
    }
    if (
      (materialInfo?.processId === PrimaryProcessType.ZincPlating && this.manufactureData.filter((x) => x.processTypeID === ProcessType.ZincPlating).length > 0) ||
      (materialInfo?.processId === PrimaryProcessType.ChromePlating && this.manufactureData.filter((x) => x.processTypeID === ProcessType.ChromePlating).length > 0) ||
      (materialInfo?.processId === PrimaryProcessType.NickelPlating && this.manufactureData.filter((x) => x.processTypeID === ProcessType.NickelPlating).length > 0) ||
      (materialInfo?.processId === PrimaryProcessType.CopperPlating && this.manufactureData.filter((x) => x.processTypeID === ProcessType.CopperPlating).length > 0) ||
      (materialInfo?.processId === PrimaryProcessType.R2RPlating && this.manufactureData.filter((x) => x.processTypeID === ProcessType.R2RPlating).length > 0) ||
      (materialInfo?.processId === PrimaryProcessType.TinPlating && this.manufactureData.filter((x) => x.processTypeID === ProcessType.TinPlating).length > 0) ||
      (materialInfo?.processId === PrimaryProcessType.GoldPlating && this.manufactureData.filter((x) => x.processTypeID === ProcessType.GoldPlating).length > 0) ||
      (materialInfo?.processId === PrimaryProcessType.SilverPlating && this.manufactureData.filter((x) => x.processTypeID === ProcessType.SilverPlating).length > 0) ||
      (materialInfo?.processId === PrimaryProcessType.PowderCoating && this.manufactureData.filter((x) => x.processTypeID === ProcessType.PowderCoating).length > 0) ||
      (materialInfo?.processId === PrimaryProcessType.WetPainting && this.manufactureData.filter((x) => x.processTypeID === ProcessType.WetPainting).length > 0) ||
      (materialInfo?.processId === PrimaryProcessType.Painting && this.manufactureData.filter((x) => x.processTypeID === ProcessType.Painting).length > 0) ||
      (materialInfo?.processId === PrimaryProcessType.Galvanization && this.manufactureData.filter((x) => x.processTypeID === ProcessType.Galvanization).length > 0) ||
      (materialInfo?.processId === PrimaryProcessType.SiliconCoatingAuto && this.manufactureData.filter((x) => x.processTypeID === ProcessType.SiliconCoatingAuto).length > 0) ||
      (materialInfo?.processId === PrimaryProcessType.SiliconCoatingSemi && this.manufactureData.filter((x) => x.processTypeID === ProcessType.SiliconCoatingSemi).length > 0)
    ) {
      // for Plating validation
      this.messaging.openSnackBar(`Manufacturing data must be deleted before deleting the material data for this secondary process.`, '', { duration: 4000 });
      return;
    }
    if (materialInfo) {
      const dialogRef = this.messaging.openConfirmationDialog(<ConfirmationDialogConfig>{
        data: {
          title: 'Confirm Delete',
          message: 'This item will be deleted. Confirm delete by selecting CONFIRM, or cancel this action by selecting CANCEL.',
          action: 'CONFIRM',
          cancelText: 'CANCEL',
        },
      });
      this.dialogSub = dialogRef
        .afterClosed()
        .pipe(first())
        .subscribe((confirmed: boolean) => {
          if (confirmed) {
            if (materialInfo.materialInfoId) {
              // this._store.dispatch(new MaterialInfoActions.DeleteMaterialInfo(materialInfo.materialInfoId, this.currentPart?.partInfoId));
              this._materialInfoSignalsService.deleteMaterialInfo(materialInfo.materialInfoId, this.currentPart?.partInfoId);
              this.materialInfoList = [...this.materialInfoList.filter((x) => x.materialInfoId !== materialInfo.materialInfoId)];
              this.messaging.openSnackBar(`Data updated successfully.`, '', {
                duration: 5000,
              });
              this.reset();
              this.clearProcessTypeFlags();
              if (this.materialInfoList != null && this.materialInfoList.length > 0) {
                this.selectedMaterialInfoId = this.materialInfoList[this.materialInfoList.length - 1].materialInfoId;
              } else {
                this.selectedMaterialInfoId = 0;
              }
              this.listMaterialInfoOut.emit(this.materialInfoList);
              this.formIdentifier = {
                ...this.formIdentifier,
                primaryId: this.selectedMaterialInfoId,
              };
            }
          }
        });
    }
  }

  public checkIfFormDirty() {
    return this.afterChange;
  }

  public resetform() {
    return this.costingMaterialInfoform.reset();
  }

  public getFormData() {
    return this.costingMaterialInfoform.value;
  }

  private navigatetoNextUrl() {
    if (this.nexturltonavigate != '' && this.nexturltonavigate != undefined) {
      const tempUrl = this.nexturltonavigate + '?ignoreactivate=1';
      this.nexturltonavigate = '';
      this.router.navigateByUrl(tempUrl);
    }
  }

  private saveColoringInfo() {
    const dirtyItems = [];
    this.fieldColorsList = [];
    if (this.forging.hotForgingClosedDieHot || this.materialConfigService.processFlagsForSaveColoring.some((flag) => this.processFlag[flag])) {
      const formGroup = this._materialHelperService.getSubFormGroup(this.processFlag, this.forging, this.getFormGroup.bind(this));
      if (formGroup) {
        for (const el in formGroup.controls) {
          if (formGroup.controls[el].dirty || formGroup.controls[el].touched) {
            const fieldColorsDto = new FieldColorsDto();
            fieldColorsDto.isDirty = formGroup.controls[el].dirty;
            fieldColorsDto.formControlName = el;
            fieldColorsDto.isTouched = formGroup.controls[el].touched;
            fieldColorsDto.partInfoId = this.currentPart?.partInfoId;
            fieldColorsDto.screenId = ScreeName.Material;
            fieldColorsDto.primaryId = this.selectedMaterialInfoId;
            fieldColorsDto.subProcessIndex = null;
            dirtyItems.push(fieldColorsDto);
          } else {
            // to update the main form group controls
            this.costingMaterialInfoform.controls[el]?.markAsPristine();
            this.costingMaterialInfoform.controls[el]?.markAsUntouched();
          }
        }
        if (this.sandForCoreFormArray?.length > 0) {
          this.sandForCoreFormArray.controls.forEach((element, index) => {
            const item = this.sandForCoreFormArray.at(index);
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
                    fieldColorsDto.screenId = ScreeName.Material;
                    fieldColorsDto.primaryId = this.selectedMaterialInfoId;
                    fieldColorsDto.subProcessIndex = index;
                    dirtyItems.push(fieldColorsDto);
                  }
                }
              }
            }
          });
        }
      }
    }
    const formSustainability = this.getFormGroup(FormGroupKeysMaterial.MaterialSustainability);
    for (const el in formSustainability.controls) {
      if (formSustainability.controls[el].dirty || formSustainability.controls[el].touched) {
        const fieldColorsDto = new FieldColorsDto();
        fieldColorsDto.isDirty = formSustainability.controls[el].dirty;
        fieldColorsDto.formControlName = el;
        fieldColorsDto.isTouched = formSustainability.controls[el].touched;
        fieldColorsDto.partInfoId = this.currentPart?.partInfoId;
        fieldColorsDto.screenId = ScreeName.Material;
        fieldColorsDto.primaryId = this.selectedMaterialInfoId;
        dirtyItems.push(fieldColorsDto);
      }
    }

    for (const el in this.costingMaterialInfoform.controls) {
      // push only if it was not pushed through sub forms
      const control = this.costingMaterialInfoform.get(el);
      if (control instanceof FormControl) {
        if (!dirtyItems.find((x) => x.formControlName === el) && (this.costingMaterialInfoform.controls[el].dirty || this.costingMaterialInfoform.controls[el].touched)) {
          const fieldColorsDto = new FieldColorsDto();
          fieldColorsDto.isDirty = this.costingMaterialInfoform.controls[el].dirty;
          fieldColorsDto.formControlName = el;
          fieldColorsDto.isTouched = this.costingMaterialInfoform.controls[el].touched;
          fieldColorsDto.partInfoId = this.currentPart?.partInfoId;
          fieldColorsDto.screenId = ScreeName.Material;
          fieldColorsDto.primaryId = this.selectedMaterialInfoId;
          dirtyItems.push(fieldColorsDto);
        }
      }
    }
    if (dirtyItems.length > 0) {
      // this.blockUiService.pushBlockUI('saveColor');
      this.sharedService
        .updateColorInfo(dirtyItems)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((result) => {
          // this.blockUiService.popBlockUI('saveColor');
          if (result) {
            this.fieldColorsList = result;
            result.forEach((element) => {
              this._materialHelperService.markFormGroupControls(element, this.processFlag, this.forging, this.costingMaterialInfoform);
              // if (element.isTouched) {
              // this.costingMaterialInfoform.get(element.formControlName)?.markAsTouched();
              // this.materialSustainabilityFormGroup.get(element.formControlName)?.markAsTouched();
              // this.processFlag.IsProcessCasting && this.castingMaterialFormGroup.get(element.formControlName)?.markAsTouched();
              // (this.processFlag.IsProcessMetalTubeExtrusion || this.processFlag.IsProcessMetalExtrusion) && this.metalExtrusionMaterialFormGroup.get(element.formControlName)?.markAsTouched();
              // this.processFlag.IsProcessMachining && this.machiningMaterialFormGroup.get(element.formControlName)?.markAsTouched();
              // this.processFlag.IsProcessConventionalPCB && this.pcbMaterialFormGroup.get(element.formControlName)?.markAsTouched();
              // this.processFlag.IsProcessRigidFlexPCB && this.pcbMaterialFormGroup.get(element.formControlName)?.markAsTouched();
              // this.processFlag.IsProcessSemiRigidFlexPCB && this.pcbMaterialFormGroup.get(element.formControlName)?.markAsTouched();
              // this.processFlag.IsProcessTubeBending && this.tubeBendingMaterialFormGroup.get(element.formControlName)?.markAsTouched();
              // this.processFlag.IsProcessInsulationJacket && this.insulationJacketMaterialFormGroup.get(element.formControlName)?.markAsTouched();
              // this.processFlag.IsProcessPlasticTubeExtrusion && this.plasticTubeExtrusionMaterialFormGroup.get(element.formControlName)?.markAsTouched();
              // this.processFlag.IsProcessPlasticVacuumForming && this.plasticVacuumFormingMaterialFormGroup.get(element.formControlName)?.markAsTouched();
              // this.forging.hotForgingClosedDieHot && this.hotForgingClosedDieHotMaterialFormGroup.get(element.formControlName)?.markAsTouched();
              // this.processFlag.IsProcessCustomizeCable && this.customCableMaterialFormGroup.get(element.formControlName)?.markAsTouched();
              // this.processFlag.IsProcessTypeInjectionMolding && this.injectionMoldingMaterialFormGroup.get(element.formControlName)?.markAsTouched();
              //   (this.processFlag.IsProcessTypeCompressionMolding ||
              //     this.processFlag.IsProcessTypeBlowMolding ||
              //     this.processFlag.IsProcessTypeTransferMolding ||
              //     this.processFlag.IsProcessThermoForming) &&
              //     this.compressionMoldingMaterialFormGroup.get(element.formControlName)?.markAsTouched();
              //   (this.processFlag.IsProcessLaserCutting ||
              //     this.processFlag.IsProcessPlasmaCutting ||
              //     this.processFlag.IsProcessTPP ||
              //     this.processFlag.IsProcessStampingStage ||
              //     this.processFlag.IsProcessStampingProgressive ||
              //     this.processFlag.IsProcessTransferPress ||
              //     this.processFlag.IsProcessMigWelding ||
              //     this.processFlag.IsProcessTigWelding) &&
              //     this.sheetMetalMaterialFormGroup.get(element.formControlName)?.markAsTouched();
              // }
              // if (element.isDirty) {
              //   this.costingMaterialInfoform.get(element.formControlName)?.markAsDirty();
              //   this.materialSustainabilityFormGroup.get(element.formControlName)?.markAsDirty();
              //   this.processFlag.IsProcessCasting && this.castingMaterialFormGroup.get(element.formControlName)?.markAsDirty();
              //   (this.processFlag.IsProcessMetalTubeExtrusion || this.processFlag.IsProcessMetalExtrusion) && this.metalExtrusionMaterialFormGroup.get(element.formControlName)?.markAsDirty();
              //   this.processFlag.IsProcessMachining && this.machiningMaterialFormGroup.get(element.formControlName)?.markAsDirty();
              //   this.processFlag.IsProcessConventionalPCB && this.pcbMaterialFormGroup.get(element.formControlName)?.markAsDirty();
              //   this.processFlag.IsProcessRigidFlexPCB && this.pcbMaterialFormGroup.get(element.formControlName)?.markAsDirty();
              //   this.processFlag.IsProcessSemiRigidFlexPCB && this.pcbMaterialFormGroup.get(element.formControlName)?.markAsDirty();
              //   this.processFlag.IsProcessTubeBending && this.tubeBendingMaterialFormGroup.get(element.formControlName)?.markAsDirty();
              //   this.processFlag.IsProcessInsulationJacket && this.insulationJacketMaterialFormGroup.get(element.formControlName)?.markAsDirty();
              //   this.processFlag.IsProcessPlasticTubeExtrusion && this.plasticTubeExtrusionMaterialFormGroup.get(element.formControlName)?.markAsDirty();
              //   this.processFlag.IsProcessPlasticVacuumForming && this.plasticVacuumFormingMaterialFormGroup.get(element.formControlName)?.markAsDirty();
              //   this.forging.hotForgingClosedDieHot && this.hotForgingClosedDieHotMaterialFormGroup.get(element.formControlName)?.markAsDirty();
              //   this.processFlag.IsProcessCustomizeCable && this.customCableMaterialFormGroup.get(element.formControlName)?.markAsDirty();
              //   this.processFlag.IsProcessTypeInjectionMolding && this.injectionMoldingMaterialFormGroup.get(element.formControlName)?.markAsDirty();
              //   (this.processFlag.IsProcessTypeCompressionMolding ||
              //     this.processFlag.IsProcessTypeBlowMolding ||
              //     this.processFlag.IsProcessTypeTransferMolding ||
              //     this.processFlag.IsProcessThermoForming) &&
              //     this.compressionMoldingMaterialFormGroup.get(element.formControlName)?.markAsDirty();
              //   (this.processFlag.IsProcessLaserCutting ||
              //     this.processFlag.IsProcessPlasmaCutting ||
              //     this.processFlag.IsProcessTPP ||
              //     this.processFlag.IsProcessStampingStage ||
              //     this.processFlag.IsProcessStampingProgressive ||
              //     this.processFlag.IsProcessTransferPress ||
              //     this.processFlag.IsProcessMigWelding ||
              //     this.processFlag.IsProcessTigWelding) &&
              //     this.sheetMetalMaterialFormGroup.get(element.formControlName)?.markAsDirty();
              // }
            });
            this.afterChange = false;
            this.dirtyCheckEvent.emit(this.afterChange);
          }
        });
    }
  }

  viewUnfoldedPart() {
    const modalRef = this.modalService.open(CadViewerPopupComponent, {
      windowClass: 'fullscreen',
    });
    modalRef.componentInstance.fileName = `${this.currentPart?.azureFileSharedId}_unfolded`;
    modalRef.componentInstance.partData = {
      caller: 'material',
      partId: this.formIdentifier.partInfoId,
      volume: this.sharedService.extractedMaterialData?.DimVolume,
      surfaceArea: this.sharedService.extractedMaterialData?.DimArea,
      projectedArea: this.sharedService.extractedMaterialData?.ProjectedArea,
      dimentions: {
        dimX: this.sharedService.extractedMaterialData?.DimX,
        dimY: this.sharedService.extractedMaterialData?.DimY,
        dimZ: this.sharedService.extractedMaterialData?.DimZ,
      },
      centerMass: {
        centroidX: this.sharedService.extractedProcessData?.CentroidX,
        centroidY: this.sharedService.extractedProcessData?.CentroidY,
        centroidZ: this.sharedService.extractedProcessData?.CentroidZ,
      },
    };
  }

  viewNestingAlgo() {
    const modalRef = this.modalService.open(NestingAlgoComponent, {
      windowClass: 'fullscreen',
    });
    const process = this.costingMaterialInfoform.controls['matPrimaryProcessName'].value;
    console.log('this.sharedService.extractedMaterialData', this.sharedService.extractedMaterialData);
    modalRef.componentInstance.dimX = this.sharedService.extractedMaterialData?.DimX;
    modalRef.componentInstance.dimY = this.sharedService.extractedMaterialData?.DimY;
    modalRef.componentInstance.dimZ = this.sharedService.extractedMaterialData?.DimZ;
    modalRef.componentInstance.unfoldedPartHeight = this.costingMaterialInfoform.controls['unfoldedLength'].value;
    modalRef.componentInstance.unfoldedPartWidth = this.costingMaterialInfoform.controls['unfoldedWidth'].value;
    modalRef.componentInstance.process = process;
    modalRef.componentInstance.partInfoId = this.formIdentifier.partInfoId;
    modalRef.componentInstance.maximumSheetLength = this.costingMaterialInfoform.controls['coilLength'].value;
    modalRef.componentInstance.sheetWidth = this.costingMaterialInfoform.controls['coilWidth'].value;
  }

  viewNestingAlgoNew() {
    const modalRef = this.modalService.open(NestingAlgoNewComponent, {
      windowClass: 'fullscreen',
    });
    const process = this.costingMaterialInfoform.controls['matPrimaryProcessName'].value;
    console.log('this.sharedService.extractedMaterialData', this.sharedService.extractedMaterialData);
    modalRef.componentInstance.dimX = this.sharedService.extractedMaterialData?.DimX;
    modalRef.componentInstance.dimY = this.sharedService.extractedMaterialData?.DimY;
    modalRef.componentInstance.dimZ = this.sharedService.extractedMaterialData?.DimZ;
    modalRef.componentInstance.unfoldedPartHeight = this.costingMaterialInfoform.controls['unfoldedLength'].value;
    modalRef.componentInstance.unfoldedPartWidth = this.costingMaterialInfoform.controls['unfoldedWidth'].value;
    modalRef.componentInstance.thickness = this.costingMaterialInfoform.controls['thickness'].value;
    modalRef.componentInstance.partAllowance = this.costingMaterialInfoform.controls['partAllowance'].value;
    modalRef.componentInstance.edgeAllowance = this.costingMaterialInfoform.controls['moldBoxLength'].value;
    modalRef.componentInstance.bottomClamping = this.costingMaterialInfoform.controls['runnerDia'].value;
    modalRef.componentInstance.leftClamping = this.costingMaterialInfoform.controls['runnerLength'].value;
    modalRef.componentInstance.process = process;
    modalRef.componentInstance.partInfoId = this.formIdentifier.partInfoId;
    modalRef.componentInstance.maximumSheetLength = this.costingMaterialInfoform.controls['coilLength'].value;
    modalRef.componentInstance.sheetWidth = this.costingMaterialInfoform.controls['coilWidth'].value;
  }

  private getColorInfo() {
    this.fieldColorsList = [];
    if (this.selectedMaterialInfoId > 0) {
      this.sharedService
        .getColorInfos(this.currentPart?.partInfoId, ScreeName.Material, this.selectedMaterialInfoId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((result: FieldColorsDto[]) => {
          if (result) {
            this.fieldColorsList = result;
            result?.forEach((element) => {
              this._materialHelperService.markFormGroupControls(element, this.processFlag, this.forging, this.costingMaterialInfoform);
            });
            this.calculateCost();
            this.afterChange = false;
            this.dirtyCheckEvent.emit(this.afterChange);
          }
        });
    }
  }

  showinfo(filterValue: string) {
    let objdesc;
    if (this.lstdescriptions && this.lstdescriptions?.length > 0) {
      objdesc = this.lstdescriptions?.find((item: { id: string }) => item.id.toLowerCase() === filterValue.toLowerCase());
    }
    if (objdesc != null) {
      this.url = objdesc.imageUrl;
      if (this.url != '') {
        this.show = true;
      } else {
        this.show = false;
      }
      this.name = objdesc.descriptions?.replace(/\n/g, '<br>') || '';
    }
    this.popoverHook?.open();
  }

  recalculateMaterialCost(currentPart: PartInfoDto) {
    let materialList = this._materialInfoSignalsService.materialInfos();
    const matPrimaryProcessName = Number(this.costingMaterialInfoform.controls['matPrimaryProcessName'].value);
    if (
      [PrimaryProcessType.ConventionalPCB, PrimaryProcessType.SemiRigidFlex, PrimaryProcessType.RigidFlexPCB].includes(matPrimaryProcessName) ||
      currentPart.commodityId === CommodityType.Electronics
    ) {
      this.recalculationMaterialCompletedEvent.emit({ totmaterialList: materialList, currentPart });
      // currentPart?.commodityId === CommodityType.Electronics && this.fetchAdditionalBOMEntriesData(materialList[0]);
      this.messaging.openSnackBar(`Recalculation completed for Material Section.`, '', { duration: 5000 });
    } else {
      this.currentPart = currentPart;
      this.totmaterialList = [];
      this.blockUiService.pushBlockUI('material recalculate');
      this.materialCount = 0;
      if (this.page === this.pageEnum.BestProcess) {
        const materialObj = materialList[0];
        materialList = this.bestProcessIds.map((processId) => ({ ...materialObj, processId }));
      }
      materialList.forEach((selectedMaterial) => {
        this.sharedService
          .getColorInfos(currentPart?.partInfoId, ScreeName.Material, selectedMaterial?.materialInfoId)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe((materialDirtyFields: FieldColorsDto[]) => {
            const marketDataId = selectedMaterial?.materialMarketId;
            if (marketDataId > 0) {
              this.materialMasterService
                .getMaterialMasterByMaterialMarketDataId(marketDataId)
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe((response) => {
                  if (response) {
                    const materialMasterId = response?.materialMarketData?.materialMaster?.materialMasterId || 0;
                    if (materialMasterId > 0) {
                      const marketMonth = this.currentMarketMonth ?? this.selectedProject?.marketMonth ?? this.sharedService.getMarketMonth(this.selectedProject.marketQuarter);
                      this.materialMasterService
                        .getMaterialMarketDataByMarketQuarter(currentPart?.mfrCountryId, materialMasterId, marketMonth)
                        .pipe(takeUntil(this.unsubscribe$))
                        .subscribe((marketData) => {
                          const materialMasterInfo = response?.materialMarketData?.materialMaster;
                          const typeId = materialMasterInfo?.materialTypeId;
                          const materialGroupId = materialMasterInfo?.materialType?.materialGroupId;
                          this.materialMasterService
                            .getmaterialsByMaterialTypeId(typeId)
                            .pipe(takeUntil(this.unsubscribe$))
                            .subscribe({
                              next: (materialDescriptionList) => {
                                let materialInfo: MaterialInfoDto = Object.assign({}, selectedMaterial);
                                materialInfo.materialInfoList = this.materialInfoList;
                                materialInfo.materialMasterId = materialMasterId;
                                materialInfo.materialFamily = typeId;
                                materialInfo.sandCost = this.sharedService.isValidNumber(materialMasterInfo?.sandCost);
                                materialInfo.eav = currentPart?.eav;
                                materialInfo.materialDescriptionList = materialDescriptionList;
                                materialInfo.materialGroupId = materialGroupId;
                                materialInfo.laserCutttingTimeList = this.laserCutttingTimeList;
                                materialInfo.materialMarketData = marketData?.length > 0 ? marketData[0] : null;
                                if (marketData?.length > 0) {
                                  materialInfo.materialMarketId = marketData[0].materialMarketId;
                                  if (this.IsCountryChanged) {
                                    const stockFormByList = this.stockFormList.length > 0 ? this.stockFormList[0].formName : null;
                                    const stockForm = materialInfo?.stockForm ? materialInfo?.stockForm : stockFormByList;
                                    if (stockForm) {
                                      const stockFormId = this.stockFormDtos.find((x) => x.formName === stockForm)?.stockFormId;
                                      const multiplier = this.countryFormMatixDtos.find((x) => x.countryId === this.materialMarketData.countryId && x.stockFormId === stockFormId)?.multiplier ?? 1;
                                      materialInfo.materialPricePerKg = this.materialMarketData.price * multiplier;
                                    }
                                  }
                                  // materialInfo.scrapPricePerKg = marketData[0]?.generalScrapPrice;
                                  materialInfo.machiningScrapPrice = marketData[0]?.machineScrapPrice;
                                }
                                materialInfo.thermoFormingList = this.thermoFormingList;
                                const machining = {
                                  ...this.materialConfigService.materialMachiningConfigService.getMachiningFlags(Number(selectedMaterial?.processId)),
                                };
                                Object.keys(machining).forEach((type) => {
                                  const pascalType = type.charAt(0).toUpperCase() + type.slice(1);
                                  materialInfo[`machining${pascalType}`] = machining[type];
                                });
                                materialInfo.countryId = currentPart?.mfrCountryId;
                                if (
                                  ![
                                    PrimaryProcessType.NoBakeCasting,
                                    PrimaryProcessType.InvestmentCasting,
                                    PrimaryProcessType.GreenCastingAuto,
                                    PrimaryProcessType.GreenCastingSemiAuto,
                                    PrimaryProcessType.GDCCasting,
                                    PrimaryProcessType.HPDCCasting,
                                    PrimaryProcessType.LPDCCasting,
                                    PrimaryProcessType.ZincPlating,
                                    PrimaryProcessType.ChromePlating,
                                    PrimaryProcessType.NickelPlating,
                                    PrimaryProcessType.CopperPlating,
                                    PrimaryProcessType.R2RPlating,
                                    PrimaryProcessType.TinPlating,
                                    PrimaryProcessType.GoldPlating,
                                    PrimaryProcessType.SilverPlating,
                                    PrimaryProcessType.PowderCoating,
                                    PrimaryProcessType.Painting,
                                    PrimaryProcessType.WetPainting,
                                    PrimaryProcessType.Galvanization,
                                    PrimaryProcessType.SiliconCoatingAuto,
                                    PrimaryProcessType.SiliconCoatingSemi,
                                    PrimaryProcessType.Assembly,
                                  ].includes(selectedMaterial?.processId)
                                ) {
                                  materialInfo = this.commonService.setDirtyChecksForCommonFields(materialInfo, materialDirtyFields, selectedMaterial, this.processFlag);
                                }
                                if (this.IsCountryChanged) {
                                  materialDirtyFields = [];
                                  this.IsCountryChanged = false;
                                }
                                const calcResult = this._materialCommodityService.CalculateMaterialCost(
                                  materialInfo?.processId,
                                  materialInfo,
                                  materialDirtyFields,
                                  selectedMaterial,
                                  this.processMachinesList
                                );
                                this.saveRecalculateMaterial(calcResult, materialDirtyFields, selectedMaterial, materialList);
                              },
                              error: () => {
                                console.error();
                                this.blockUiService.popBlockUI('material recalculate');
                              },
                            });
                        });
                    } else {
                      this.blockUiService.popBlockUI('material recalculate');
                    }
                  } else {
                    this.blockUiService.popBlockUI('material recalculate');
                  }
                });
            } else {
              this.blockUiService.popBlockUI('material recalculate');
              this.recalculationMaterialCompletedEvent.emit({
                totmaterialList: this.totmaterialList,
                currentPart,
              });
              this.messaging.openSnackBar(`Material Information missing !.`, '', {
                duration: 5000,
              });
              return;
            }
          });
      });
      this.mandatoryFieldMissingEvent.emit(false);
    }
  }

  saveRecalculateMaterial(materialInfo: MaterialInfoDto, materialDirtyFields: FieldColorsDto[], selectedMaterial: MaterialInfoDto, materialList: MaterialInfoDto[]) {
    this._simulationService._materialSustainabilityCalcService.calculationsForMaterialSustainability(materialInfo, materialDirtyFields, selectedMaterial);
    this.totmaterialList.push({ ...materialInfo });
    this.materialCount++;
    if (materialList?.length === this.materialCount) {
      // this._store.dispatch(new MaterialInfoActions.BulkUpdateOrCreateMaterialInfo(this.totmaterialList));
      this._materialInfoSignalsService.bulkUpdateOrCreateMaterialInfo(this.totmaterialList);
      // this.bulkUpdateMaterialSubscription$ = this._bulkMaterialUpdateLoading$.subscribe((bulkMaterialUpdateLoading) => {
      // if (bulkMaterialUpdateLoading === false) {
      //   this.bulkUpdateMaterialSubscription$.unsubscribe();
      //   this._store.dispatch(new MaterialInfoActions.SetBulkMaterialUpdateLoading(true));
      //   this.mandatoryFieldMissingEvent.emit(false);
      //   this.messaging.openSnackBar(`Recalculation completed for Material Section.`, '', {
      //     duration: 5000,
      //   });
      //   this.recalculationMaterialCompletedEvent.emit({
      //     totmaterialList: this.totmaterialList,
      //     currentPart,
      //   });
      //   this.blockUiService.popBlockUI('material recalculate');
      //   this.calculateTotalMaterialCost(this.totmaterialList);
      // }
      // this.totmaterialList = totmaterialList;
    }
  }

  calculateTotalMaterialCost(materialList) {
    if (materialList && Array.isArray(materialList)) {
      let totalMaterialCost =
        materialList?.reduce((tot, cur) => {
          return tot + cur.netMatCost;
        }, 0) || 0;
      totalMaterialCost = Math.round(totalMaterialCost * 100) / 100;
      this.getFormGroup(FormGroupKeysMaterial.Casting)?.controls.totalMaterialCost.setValue(totalMaterialCost);
    }
  }

  private onMaterialRecalculation() {
    // if (isLoading === false) {
    this.recalculationUpdateSignalsService.setBulkMaterialUpdateLoading(true);
    this.mandatoryFieldMissingEvent.emit(false);

    this.messaging.openSnackBar(`Recalculation completed for Material Section.`, '', {
      duration: 5000,
    });
    this.recalculationMaterialCompletedEvent.emit({
      totmaterialList: this.totmaterialList,
      currentPart: this.currentPart,
    });
    this.blockUiService.popBlockUI('material recalculate');

    this.calculateTotalMaterialCost(this.totmaterialList);
    // }
  }

  roundNumber(value) {
    return Math.round(value * 1000) / 1000;
  }

  // private watchAndUpdateAiMaterialDetails(materialInfo: MaterialInfoDto) {
  //   if (this.aiCommonService.materialDescriptionDetails) {
  //     this.blockUiService.pushBlockUI('watchAndUpdateAiMaterialDetails');
  //     this.materialMasterService
  //       .getMaterialDataByDescription(this.aiCommonService.materialDescriptionDetails)
  //       .pipe(takeUntil(this.unsubscribe$))
  //       .subscribe((result: MaterialSearchResultDto[]) => {
  //         if (result && result.length > 0) {
  //           this.materialTypeList.push({
  //             materialTypeId: result[0].materialTypeId,
  //             materialGroupId: result[0].materialGroupId,
  //             materialTypeName: result[0].materialTypeName,
  //           });
  //           this.materialDescriptionList.push({
  //             materialMasterId: result[0].materialDescId,
  //             materialDescription: result[0].materialDescription,
  //           } as any);
  //           const selMat = this.stockFormCategoriesDto.find((x) => x.materialGroupId === result[0].materialGroupId);
  //           const marketMonth = this.currentMarketMonth ?? this.selectedProject?.marketMonth ?? this.sharedService.getMarketMonth(this.selectedProject.marketQuarter);
  //           this.materialMasterService
  //             .getMaterialMarketDataByMarketQuarter(this.currentPart?.mfrCountryId, result[0].materialDescId, marketMonth)
  //             .pipe(takeUntil(this.unsubscribe$))
  //             .subscribe((marketData) => {
  //               if (marketData && marketData.length > 0) {
  //                 materialInfo = {
  //                   ...materialInfo,
  //                   materialDescription: result[0].materialDescription,
  //                   materialFamily: result[0].materialTypeId,
  //                   categoryId: result[0].materialGroupId,
  //                   materialMarketData: marketData[0],
  //                   materialMarketId: marketData[0].materialMarketId,
  //                   isAiSuggested: true,
  //                 };
  //                 this.costingMaterialInfoform.patchValue({
  //                   materialCategory: selMat?.materialGroup,
  //                   materialFamily: result[0].materialTypeId,
  //                   materialDescription: result[0].materialDescId,
  //                 });
  //                 this.onEdit(materialInfo);
  //               }
  //             });
  //         } else {
  //           const aiSuggestedMaterialDescriptionData: AiSuggestedData = {
  //             fieldName: 'materialDescription',
  //             partInfoId: this.currentPart.partInfoId,
  //             fieldData: this.aiCommonService.materialDescriptionDetails,
  //             screenId: ScreeName.Material,
  //             primaryId: 0,
  //           };
  //           this.aiCommonService.addAiSuggestedCommentData(aiSuggestedMaterialDescriptionData);
  //         }
  //         this.blockUiService.popBlockUI('watchAndUpdateAiMaterialDetails');
  //       });
  //   } else {
  //     if (!this.costingMaterialInfoform) {
  //       this.createForm();
  //     }
  //     this.setForm(materialInfo);
  //   }
  // }

  private setSupplierValues(materialMasterId: number, stockForm?: string, materialInfo?: MaterialInfoDto, fieldColorsList?: FieldColorsDto[]): any {
    this.digitalFactoryService
      .getDfMaterialInfoByMarketMonth(this.part?.supplierInfoId, materialMasterId, this.currentMarketMonth)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (dfMaterialInfo) => {
          const materialMarketData = materialInfo?.materialMarketData ?? this.materialMarketData;
          const currentSelectedMaterialInfo = this.materialInfoList.find((x) => x.materialMarketData?.materialMasterId == materialMarketData?.materialMasterId);
          const savedMaterialInfo = materialInfo ?? currentSelectedMaterialInfo;
          const materialMaster = this.materialDescriptionList.find((x) => x.materialMasterId === materialMarketData.materialMasterId);
          let stockFormMultiplier = 1;
          this.stockFormList = materialMaster.stockForms;
          const matInfo = this.digitalFactoryHelper.getMaterialInfo(
            dfMaterialInfo,
            stockForm,
            stockFormMultiplier,
            this.stockFormList,
            savedMaterialInfo,
            materialMaster,
            materialMarketData,
            fieldColorsList
          );
          let updatedMatPrice = 0;
          if (stockForm) {
            const stockFormId = this.stockFormList.find((x) => x.formName === stockForm)?.stockFormId || 0;
            stockFormMultiplier = this.countryFormMatixDtos.find((x) => x.countryId === this.materialMarketData.countryId && x.stockFormId === stockFormId)?.multiplier || 1;
            updatedMatPrice = this.roundNumber(matInfo.matPrice * stockFormMultiplier);
            this.costingMaterialInfoform.controls['matPrice'].setValue(updatedMatPrice);
          } else {
            const process =
              this.processList.length > 0 && this.processList[0].data.find((x) => x.processId === (this.selectedProcessId === 0 ? this.selectedMaterialInfo?.processId : this.selectedProcessId));
            this.stockFormList = materialMaster.stockForms;
            if (this.stockFormList.length > 0) {
              stockForm = this.getStockForm(process, this.selectedMaterialInfo?.dimZ ?? this.sharedService.extractedMaterialData?.DimZ, matInfo?.stockForm);
              if (stockForm && !matInfo?.stockForm) {
                const stockFormId = this.stockFormList.find((x) => x.formName === stockForm)?.stockFormId || 0;
                stockFormMultiplier = this.countryFormMatixDtos.find((x) => x.countryId === this.materialMarketData.countryId && x.stockFormId === stockFormId)?.multiplier || 1;
                updatedMatPrice = this.roundNumber(matInfo.matPrice * stockFormMultiplier);
                this.costingMaterialInfoform.controls['matPrice'].setValue(updatedMatPrice);
              } else if (matInfo?.stockForm) {
                updatedMatPrice = matInfo.matPrice;
                this.costingMaterialInfoform.controls['matPrice'].setValue(updatedMatPrice);
              }
            }
          }

          this.costingMaterialInfoform.controls.volumePurchased.setValue(matInfo.volumePurchased);
          if (this.processFlag.IsProcessTypeRubberInjectionMolding || this.processFlag.IsProcessTypeTransferMolding || this.processFlag.IsProcessTypeCompressionMolding) {
            this.costingMaterialInfoform.controls.scrapPrice.setValue(0);
          } else {
            this.costingMaterialInfoform.controls.scrapPrice.setValue(matInfo?.scrapPrice || 0);
          }
          this.costingMaterialInfoform.controls.machiningScrapPrice.setValue(this.sharedService.isValidNumber(Number(matInfo?.scrapPrice || 0) / 2) || 0);
          this.costingMaterialInfoform.controls.volumeDiscountPer.setValue(matInfo.volumeDiscount);
          this.costingMaterialInfoform.controls.matPriceGross.setValue(matInfo.matGrossPrice);
          this.costingMaterialInfoform.controls.stockForm.setValue(stockForm);
          if (this.forging.hotForgingClosedDieHot || this.forging.hotForgingOpenDieHot || this.forging.coldForgingClosedDieHot || this.processFlag.IsProcessColdForgingColdHeading) {
            this.updateStockFormFlags();
          }

          this.defaultValues.materialPrice = updatedMatPrice ? Number(updatedMatPrice) : Number(materialMarketData.price);
          this.defaultValues.scrapPrice = Number(matInfo?.scrapPrice ?? materialMarketData?.generalScrapPrice);
          this.defaultValues.volumeOneMTDiscount = Number(materialMaster.oneMTDiscount);
          this.defaultValues.volumeTwentyFiveMTDiscount = Number(materialMaster.twentyFiveMTDiscount);
          this.defaultValues.volumeFiftyMTDiscount = Number(materialMaster.fiftyMTDiscount);
          this.calculateCost();
          setTimeout(() => {
            this.afterChange = true;
            this.dirtyCheckEvent.emit(this.afterChange);
          }, 1000);
        },
      });
  }

  getSupplierValues(materialInfo: MaterialInfoDto) {
    materialInfo.materialPricePerKg = this.costingMaterialInfoform?.controls?.matPrice?.value;
    materialInfo.volumePurchased = this.costingMaterialInfoform?.controls?.volumePurchased?.value;
    materialInfo.scrapPricePerKg = this.costingMaterialInfoform?.controls?.scrapPrice?.value;
    materialInfo.volumeDiscountPer = this.costingMaterialInfoform?.controls?.volumeDiscountPer?.value;
    materialInfo.matPriceGross = this.costingMaterialInfoform?.controls?.matPriceGross?.value;
    materialInfo.stockForm = this.costingMaterialInfoform?.controls?.stockForm?.value;
    return materialInfo;
  }

  private getVolumeDiscount(volumePurchased: number) {
    if (volumePurchased < 1) {
      return 0;
    }
    if (volumePurchased >= 1 && volumePurchased < 25) {
      return this.defaultValues.volumeOneMTDiscount;
    }
    if (volumePurchased >= 25 && volumePurchased < 50) {
      return this.defaultValues.volumeTwentyFiveMTDiscount;
    }
    return this.defaultValues.volumeFiftyMTDiscount;
  }

  openDialog(templateRef: TemplateRef<any>) {
    this.dialogRef = this.dialog.open(templateRef, {
      panelClass: 'material-modal',
    });
  }

  openCadViewer() {
    const modalRef = this.modalService.open(CadViewerPopupComponent, {
      windowClass: 'fullscreen',
      // beforeDismiss: () => {
      //   console.log('beforeDismiss');
      //   return true; // use false to keep showing the modal
      // }
    });
    modalRef.componentInstance.fileName = `${this.currentPart?.azureFileSharedId}`;
    modalRef.componentInstance.partData = {
      caller: 'material',
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
      commodityId: this.currentPart.commodityId,
    };
  }

  autoPullSandData(searchText = 'core sand') {
    this.materialMasterService.htsMasterService
      .getMasterData('/api/master/MaterialMaster/country/' + this.currentPart?.mfrCountryId, 0, 1, searchText)
      .pipe(take(1))
      .subscribe((marketData) => {
        if (
          this.processFlag.IsProcessTypeSandForCore &&
          this.sharedService.extractedCoreData &&
          this.sharedService.extractedCoreData?.length > 0 &&
          (this.sandForCoreFormArray?.length === 0 || (this.sandForCoreFormArray?.length >= 1 && this.sandForCoreFormArray?.controls[0]?.value?.coreLength === 0))
        ) {
          this.sandForCoreFormArray.clear();
          this.castingMaterialComponent?.addMoreCore(this.sharedService.extractedCoreData);
        }

        if (marketData && marketData?.data && marketData?.data?.length > 0) {
          this.onSearchResultChange(marketData.data[0]);
        }
      });
  }

  applyAiSuggestedMaterialInfo(response: any) {
    const result = response.materialSearchResult;
    if (result && result.length > 0) {
      this.materialTypeList.push({
        materialTypeId: result[0].materialTypeId,
        materialGroupId: result[0].materialGroupId,
        materialTypeName: result[0].materialTypeName,
      });
      this.materialDescriptionList.push({
        materialMasterId: result[0].materialDescId,
        materialDescription: result[0].materialDescription,
      } as any);
      if (response.mostSuggestedPart) {
        this.materialInfoList.push({
          materialDescription: response.mostSuggestedPart.materialDescription,
        } as any);
        this.costingMaterialInfoform.controls.matPrimaryProcessName.setValue(response.mostSuggestedPart?.processId);
        this.costingMaterialInfoform.controls['matPrimaryProcessName'].setValue(response.mostSuggestedPart?.processId);
        this.onPrimaryProcessChange({ currentTarget: { value: response.mostSuggestedPart?.processId } });
      }
      this.mapOnGroupChange(null, result[0].materialGroupId);
      this.costingMaterialInfoform.controls.materialCategory.setValue(result[0].materialGroupName);
      this.mapOnMaterialTypeChange(result[0].materialTypeId);
      this.mapOnMaterialDesc(result[0].materialDescId);
      this.costingMaterialInfoform.patchValue({
        materialCategory: result[0].materialGroupName,
        materialFamily: result[0].materialTypeId,
        materialDescription: result[0].materialDescId,
      });
      this.isNewmaterialinfo = true;
      this.handleNewMaterialInfo();
      this.dirtyCheckEvent.emit(true);
      this.messaging.openSnackBar(`AI has finished costing... Update and recalculate to see all costing details`, '', { duration: 2000, horizontalPosition: 'center' });
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
    if (this.dialogSub) {
      this.dialogSub.unsubscribe();
    }
    if (this.unsubscribeAll$) {
      this.unsubscribeAll$.unsubscribe();
    }
    this.materialInfoEffect.destroy();
    this.bulkMaterialUpdateLoadingEffect.destroy();
  }

  laminatesList: any[] = [];
  prepregList: any[] = [];

  getBillOfMaterial() {
    this._bomService
      .getBoardLoadedComponents(this.currentPart?.projectInfoId, this.currentPart.partInfoId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((bomResponse: BillOfMaterialDto[]) => {
        if (bomResponse?.length > 0) {
          this.billofMaterialList = bomResponse;
        }
      });
  }

  // fetchAdditionalBOMEntriesData(materialInfoDto: MaterialInfoDto) {
  //   if (this.billofMaterialList && this.billofMaterialList?.length > 0) {
  //     const targetMpns = new Set(['Bare PCB', 'Solder Paste Material Cost', 'Conformal Coat 1A33', 'Adhesive RTV162', 'Consumables']);
  //     const filteredEntries = this.billofMaterialList.filter((item: BillOfMaterialDto) => item.mpn && targetMpns.has(item.mpn));
  //     const costSummaryAll = this.costSummarySignalsService.costSummaryAll();
  //     const consumableCost = this.billofMaterialList.filter((x) => x.mpn !== 'Consumables')?.reduce((acc, item) => acc + (item.extendedCost || 0), 0) || 0;
  //     if (costSummaryAll) {
  //       let costSummaryViewData = costSummaryAll[this.currentPart.partInfoId];
  //       let itemToInsert = this._pcbaCalculatorService.calculationsForAdditionalBOMEntries(materialInfoDto, costSummaryViewData, consumableCost);

  //       if (filteredEntries && filteredEntries.length > 0) {
  //         const latestValueMap = new Map(itemToInsert.map((item) => [item.mpn, item]));
  //         const updatedList = this.billofMaterialList
  //           .filter((item) => targetMpns.has(item.mpn))
  //           .map((item) => {
  //             const match = latestValueMap.get(item.mpn);
  //             if (!match) {
  //               return item;
  //             }
  //             return {
  //               ...item,
  //               currentCost: match.currentCost,
  //               extendedCost: match.extendedCost,
  //             };
  //           });
  //         this.bomInfoSignalsService.bulkUpdateOrCreateBOMInfo(updatedList);
  //       } else {
  //         this.bomInfoSignalsService.bulkUpdateOrCreateBOMInfo(itemToInsert);
  //       }

  //       setTimeout(() => {
  //         this.getBillOfMaterial();
  //       }, 100);
  //     }
  //   }
  // }
}
