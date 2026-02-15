import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild, OnChanges, OnDestroy, effect } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { Observable, Subject, Subscription, combineLatest } from 'rxjs';
import { map, startWith, take, takeUntil } from 'rxjs/operators';
import { MessagingService } from 'src/app/messaging/messaging.service';
// import { CostSummaryState } from 'src/app/modules/_state/cost-summary.state';
import { CountryDataState } from 'src/app/modules/_state/country.state';
import { MaterialTypeState } from 'src/app/modules/_state/material-type.state';
import { MedbOhpState } from 'src/app/modules/_state/medbOHP.state';
import { OverheadProfitState } from 'src/app/modules/_state/overhead-profit.state';
import { MaterialCategory, MaterialCategoryList, SelectModel, ToolingMaterialIM, ToolingMaterialSheetMetal } from 'src/app/shared/enums';
import {
  CountryDataMasterDto,
  MaterialInfoDto,
  MaterialMarketDataDto,
  MaterialMasterDto,
  MaterialTypeDto,
  PartInfoDto,
  ProcessInfoDto,
  ProjectInfoDto,
  ViewCostSummaryDto,
} from 'src/app/shared/models';
import { CostOverHeadProfitDto, MedbFgiccMasterDto, MedbIccMasterDto, MedbOverHeadProfitDto, MedbPaymentMasterDto } from 'src/app/shared/models/overhead-Profit.model';
import { BlockUiService, MaterialMasterService } from 'src/app/shared/services';
import { BopCostToolingDto, CostToolingDto, ToolingMaterialInfoDto, ToolingProcessInfoDto, ToolingRefLookup } from 'src/app/shared/models/tooling.model';
import { ToolingConfigService } from 'src/app/shared/config/cost-tooling-config';
// import * as ToolingInfoActions from 'src/app/modules/_actions/tooling-info.action';
// import { ToolingInfoState } from 'src/app/modules/_state/costing-tooling-info.state';
// import { MaterialInfoState } from 'src/app/modules/_state/material-info.state';
import { FieldColorsDto } from 'src/app/shared/models/field-colors.model';
import { LaborService } from 'src/app/shared/services/labor.service';
import { CostingConfig, ScreeName } from '../../../costing.config';
import { ToolingLookupState } from 'src/app/modules/_state/tooling-lookup.state';
import { ToolingCalculatorService } from 'src/app/modules/costing/services/tooling-calculator.service';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { FgiccState } from 'src/app/modules/_state/fgicc.state';
import { IccState } from 'src/app/modules/_state/icc.state';
import { ToolingCountryData } from 'src/app/shared/models/tooling-master-data';
import { ToolingCountryMasterState } from 'src/app/modules/_state/ToolingMaster.state';
import { StampingMetrialLookUpState } from 'src/app/modules/_state/stamping-material-lookup.state';
import { StampingMetrialLookUp } from 'src/app/shared/models/sheet-metal-lookup.model';
// import { ProcessInfoState } from 'src/app/modules/_state/process-info.state';
import { CostingToolingMappingService } from 'src/app/shared/mapping/costing-tooling-mapping.service';
import { ToolingBopInfoComponent } from '../tooling-bop-info/tooling-bop-info.component';
import { ToolingOverheadInfoComponent } from 'src/app/modules/costing/components/costing-tooling-Info/tooling-overhead-info/tooling-overhead-info.component';
import { ToolingProcessInfoComponent } from 'src/app/modules/costing/components/costing-tooling-Info/tooling-process-info/tooling-process-info.component';
import { ToolingMaterialInfoComponent } from 'src/app/modules/costing/components/costing-tooling-Info/tooling-material-info/tooling-material-info.component';
import { CostToolingRecalculationService } from 'src/app/modules/costing/services/automation/cost-tooling-recalculation.service';
import { ToolingHelperService } from 'src/app/shared/helpers/tooling-helper.service';
import { CommonModule } from '@angular/common';
import { ToolingInfoComponent } from '../tooling-info/tooling-info.component';
import { MarketMonthState } from 'src/app/modules/_state/market-month.state';
import { MaterialInfoSignalsService } from 'src/app/shared/signals/material-info-signals.service';
import { ProcessInfoSignalsService } from 'src/app/shared/signals/process-info-signals.service';
import { CostingToolingRecalculationService } from 'src/app/modules/costing/services/recalculation/costing-tooling-recalculation.service';
import { CostToolingSignalsService } from 'src/app/shared/signals/cost-tooling-signals.service';
import { CostSummarySignalsService } from 'src/app/shared/signals/cost-summary-signals.service';

@Component({
  selector: 'app-costing-tooling-info',
  templateUrl: './costing-tooling-info.component.html',
  styleUrls: ['./costing-tooling-info.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ToolingInfoComponent, ToolingMaterialInfoComponent, ToolingProcessInfoComponent, ToolingBopInfoComponent, ToolingOverheadInfoComponent],
})
export class CostingToolingInfoComponent implements OnInit, OnChanges, OnDestroy {
  @Input() part: PartInfoDto;
  @Input() canUpdate: boolean = false;
  @Output() partChange: EventEmitter<PartInfoDto> = new EventEmitter<PartInfoDto>();
  @Output() dirtyCheckEvent = new EventEmitter<boolean>();
  @Input() countryChangeSubject: Subject<boolean>;
  @Input() lifetimeremainingChangeSubject: Subject<boolean>;
  public afterChange = false;
  public toolInfoList: CostToolingDto[];
  public coreMaterialInfoList: ToolingMaterialInfoDto[] = [];
  public diePunchMaterialInfoList: ToolingMaterialInfoDto[] = [];
  public mouldMaterialInfoList: ToolingMaterialInfoDto[] = [];
  public electrodeMaterialInfoList: ToolingMaterialInfoDto[] = [];
  public otherMaterialInfoList: ToolingMaterialInfoDto[] = [];
  public countryList: CountryDataMasterDto[] = [];
  public toolcountryList: CountryDataMasterDto[] = [];
  public currentPart: PartInfoDto;
  private unsubscribeAll$: Subject<undefined> = new Subject<undefined>();
  public filteredMfrCountryList$: Observable<CountryDataMasterDto[]>;
  public mouldid: number;
  public materialTypeMasterList: MaterialTypeDto[] = [];
  public materialTypeList: MaterialTypeDto[] = [];
  public materialGroupList: SelectModel[] = [];
  public materialDescriptionList: MaterialMasterDto[] = [];
  public toolingInfoList: CostToolingDto[] = [];
  public selectedTool: CostToolingDto;
  public selectedProcess: ToolingProcessInfoDto;
  public selectedBop: BopCostToolingDto;
  public selectedMaterial: ToolingMaterialInfoDto;
  public materialInfoList: MaterialInfoDto[];
  public processInfoList: ProcessInfoDto[];
  public toolingFieldColorsList: FieldColorsDto[] = [];
  public savecolorcalled: boolean = false;
  public defaultMarketDataList: MaterialMarketDataDto[] = [];
  public toolingMaterialInfoList: ToolingMaterialInfoDto[] = [];
  public toolingProcessInfoList: ToolingProcessInfoDto[] = [];
  public toolingBOPInfoList: BopCostToolingDto[] = [];
  public isShowOverHead: boolean = true;
  public costSummaryViewData: ViewCostSummaryDto;
  public costOverHeadProfitobj: CostOverHeadProfitDto;
  public nexturltonavigate: string;
  public toolNamesList: any = [];
  public isDropSelected: boolean = false;
  public isHotRunner: boolean = false;
  public mouldCriticalityList: any = [];
  public toolingNoOfShot: any = [];
  public ToolingMasterData: any = [];
  public MouldTypeList: any = [];
  public SurfaceFinishList: any = [];
  public MouldSubTypeList: any = [];
  public dialogSub: Subscription;
  public selectedToolId: number = 0;
  public selectedToolingNameId: number;
  public mouldIndex: number = 0;
  public otherIndex: number = 0;
  public graphiteIndex: number = 0;
  public copperIndex: number = 0;
  public previousCountryId = 0;
  public previousComplexity = 0;
  public previousLifeShort = 0;
  public previoussurfaceFinish = 0;
  public changeFlags = { isSupplierCountryChanged: false, isCountryChanged: false, isToollifeChanged: false, lifeTimeRemainingChange: false, complexityChanged: false, surfaceFinishChanged: false };
  public recalculate = false;
  public selectedToolMaterialId: number = 0;
  public moldDescriptionId: boolean = false;
  public selectedToolProcessId: number = 0;
  public selectedToolBopId: number = 0;
  public totToolingMaterialWeight: number = 0;
  public commodityFlags = this._toolConfig.commodity;
  public moldItems = ToolingMaterialIM;
  public moldItemsSheetMetal = ToolingMaterialSheetMetal;
  public showMaterialProcessSection = false;
  public medbPaymentList: MedbPaymentMasterDto | undefined;
  private unsubscribeMasterData$: Subscription;
  public isEnableUnitConversion = false;
  public conversionValue: any;
  public isHeightformControlNameReadOnly = false;
  public isWidthFormControlNameReadOnly = false;
  public toolingData: any;
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  private recalculationCompletedSubscription: Subscription;
  public toolingLookupData: {
    toolingIMLookupList: ToolingRefLookup[];
    toolingBendingLookupList: ToolingRefLookup[];
    toolingCuttingLookupList: ToolingRefLookup[];
    toolingFormingLookupList: ToolingRefLookup[];
  };
  public medOverHeadProfitData: { medbMohList: MedbOverHeadProfitDto; medbFohList: MedbOverHeadProfitDto; medbSgaList: MedbOverHeadProfitDto; medbProfitList: MedbOverHeadProfitDto };
  @ViewChild(ToolingBopInfoComponent) bopInfoComponent!: ToolingBopInfoComponent;
  @ViewChild(ToolingOverheadInfoComponent) overHeadComponent!: ToolingOverheadInfoComponent;
  @ViewChild(ToolingProcessInfoComponent) processComponent!: ToolingProcessInfoComponent;
  @ViewChild(ToolingMaterialInfoComponent) materialComponent!: ToolingMaterialInfoComponent;
  @Input() recalculateSubject: Subject<any>;
  @Output() recalculationCompletedEvent = new EventEmitter<any>();
  @Input() selectedProject: ProjectInfoDto;
  // _bulkToolingUpdateLoadingSubscription$: Subscription = Subscription.EMPTY;
  // _bulkToolingUpdateLoading$ = this._store.select(ToolingInfoState.getBulkToolingUpdateStatus);

  _countryToolingData$: Observable<ToolingCountryData[]>;
  _countryData$: Observable<CountryDataMasterDto[]>;
  _materialTypeMasterData$: Observable<MaterialTypeDto[]>;
  _costSummary$: Observable<ViewCostSummaryDto[]>;
  _overheadprofit$: Observable<CostOverHeadProfitDto>;
  _medbohp$: Observable<MedbOverHeadProfitDto[]>;
  // _toolingInfo$: Observable<CostToolingDto[]>;
  // _materialInfo$: Observable<MaterialInfoDto[]>;
  // _processInfo$: Observable<ProcessInfoDto[]>;
  _lookup$: Observable<ToolingRefLookup[]>;
  // _defaultValues$: Observable<MaterialMarketDataDto[]>;
  _fgicc$: Observable<MedbFgiccMasterDto[]>;
  _icc$: Observable<MedbIccMasterDto[]>;
  _stampingMetrialLookUp$: Observable<StampingMetrialLookUp[]>;
  _currentMarketMonth$: Observable<string> = this._store.select(MarketMonthState.getSelectedMarketMonth);
  currentMarketMonth: string = '';
  materialInfoEffect = effect(() => {
    const result = this.materialInfoSignalService.materialInfos();
    if (result?.length && this.currentPart?.partInfoId && this.currentPart.partInfoId === result[0]?.partInfoId) {
      this.materialInfoList = result;
    }
  });
  processInfoEffect = effect(() => {
    const result = this.processInfoSignalService.processInfos();
    if (result?.length && this.currentPart?.partInfoId && this.currentPart.partInfoId === result[0]?.partInfoId) {
      this.processInfoList = result;
    }
  });
  defaultValuesForToolingEffect = effect(() => {
    const result = this.toolingInfoSignalsService.defaultMarketDataForTooling();
    if (result?.length >= 0 && this.currentPart?.mfrCountryId > 0) {
      this.defaultMarketDataList = result;
    }
  });
  toolingRecalculationEffect = effect(() => {
    const bulkToolingUpdateLoading = this.costSummarySignalsService._recalculationUpdateSignalsService.bulkToolingUpdateLoading();
    if (!bulkToolingUpdateLoading) {
      // this._bulkToolingUpdateLoadingSubscription$.unsubscribe();
      // this._store.dispatch(new ToolingInfoActions.SetBulkToolingUpdateLoading(true));
      this.handleToolingRecalculation();
    }
  });
  costSummaryEffect = effect(() => {
    const costSummarys = this.costSummarySignalsService.costSummarys();
    if (costSummarys && costSummarys?.length > 0) {
      this.costSummaryViewData = Array.isArray(costSummarys) && costSummarys.length > 0 ? costSummarys[0] : null;
    }
  });
  costingToolingform: FormGroup = this.fb.group(this._toolingMapper.createForm());

  constructor(
    private fb: FormBuilder,
    private messaging: MessagingService,
    private materialMasterService: MaterialMasterService,
    private blockUiService: BlockUiService,
    public _toolConfig: ToolingConfigService,
    private laborService: LaborService,
    private _store: Store,
    private _toolingCalculator: ToolingCalculatorService,
    public sharedService: SharedService,
    private _costingConfig: CostingConfig,
    private _toolingMapper: CostingToolingMappingService,
    private cdRef: ChangeDetectorRef,
    private costToolingRecalculationService: CostToolingRecalculationService,
    public _toolingHelper: ToolingHelperService,
    private materialInfoSignalService: MaterialInfoSignalsService,
    private processInfoSignalService: ProcessInfoSignalsService,
    private costingToolingRecalculationService: CostingToolingRecalculationService,
    private toolingInfoSignalsService: CostToolingSignalsService,
    private costSummarySignalsService: CostSummarySignalsService
  ) {
    this._currentMarketMonth$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((result: string) => {
      if (result) {
        this.currentMarketMonth = result;
      }
    });
    this._countryToolingData$ = this._store.select(ToolingCountryMasterState.getToolingCountryMasterData);
    this._countryData$ = this._store.select(CountryDataState.getCountryData);
    this._materialTypeMasterData$ = this._store.select(MaterialTypeState.getMaterialTypes);
    // this._costSummary$ = this._store.select(CostSummaryState.getCostSummarys);
    this._overheadprofit$ = this._store.select(OverheadProfitState.getOverheadProfit);
    this._medbohp$ = this._store.select(MedbOhpState.getMedbOverHeadProfitData);
    // this._toolingInfo$ = this._store.select(ToolingInfoState.getToolingInfosByPartInfoId);
    // this._materialInfo$ = this._store.select(MaterialInfoState.getMaterialInfos);
    // this._processInfo$ = this._store.select(ProcessInfoState.getProcessInfos);
    this._lookup$ = this._store.select(ToolingLookupState.getToolingLookup);
    // this._defaultValues$ = this._store.select(ToolingInfoState.getDefaultValuesForTooling);
    this._fgicc$ = this._store.select(FgiccState.getMedbFgiccData);
    this._icc$ = this._store.select(IccState.getMedbIccData);
    this._stampingMetrialLookUp$ = this._store.select(StampingMetrialLookUpState.getStampingMetrialLookUp);
  }

  ngOnInit(): void {
    this.changeFlags = { ...this._toolConfig.changeFlags };
    this.recalculate = false;
    this.MouldSubTypeList = this._toolConfig.getMouldSubtype();
    this.mouldCriticalityList = this._toolConfig._bopConfig.getCriticality();
    this.toolingNoOfShot = this._toolConfig.getToolingNoOfShot();
    this.MouldTypeList = this._toolConfig.getMouldType();
    this.SurfaceFinishList = this._toolConfig.surfaceFinish();
    [this.isEnableUnitConversion, this.conversionValue] = this.sharedService.setUnitMeasurement();
    // this.currentPart?.mfrCountryId > 0 && this.subscribeAssign('_defaultValues$', 'defaultMarketDataList', 0);
    this.subscribeAssign('_materialTypeMasterData$', 'materialTypeMasterList', 0);
    this.subscribeAssign('_countryToolingData$', 'ToolingMasterData', 0);
    // this.getMaterialInfos();
    // this.getProcessInfos();
    this.subscribeAssign('_countryData$', 'countryList', 0, 'processCountryList');
    // this.subscribeAssign('_costSummary$', 'costSummaryViewData', 1, 'processCostSummary');
    this.costingToolingRecalculationService.getLookupValues().subscribe((result) => {
      this.toolingLookupData = result;
    });
    //this.loadDataBasedonCommodity();
    if (this.currentPart?.commodityId) {
      this.costingToolingRecalculationService.setCurrentPart(this.currentPart);
    }
    console.log('currentPart');
    console.log(this.currentPart);
    [...MaterialCategoryList.keys()].forEach((x) => {
      const obj = new SelectModel();
      obj.id = x;
      obj.name = MaterialCategoryList.get(x) || '';
      this.materialGroupList.push(obj);
    });
    this.costingToolingRecalculationService.getToolEntries().subscribe((result) => {
      if (result && result?.costTooling?.length > 0) {
        this.toolInfoList = result.costTooling;
        this.toolNamesList = result.toolNamesList;
        this.toolIdToNameConversion();
        this.setToolEntrySelection();
      } else {
        this.toolInfoList = [];
        this.clearToolingInfo();
      }
    });
    this.recalculateSubject.pipe(takeUntil(this.unsubscribeAll$)).subscribe((e) => {
      this.toolingData = e;
      const month = this.currentMarketMonth ?? this.selectedProject?.marketMonth ?? this.sharedService.getMarketMonth(this.selectedProject.marketQuarter);
      this.blockUiService.pushBlockUI('tooling recalculate');
      this.costingToolingRecalculationService
        .recalculateToolingCost(
          e,
          month,
          this.countryList,
          this.changeFlags,
          this.conversionValue,
          this.isEnableUnitConversion,
          this.toolingLookupData,
          this.ToolingMasterData,
          this.costSummaryViewData,
          this.medOverHeadProfitData,
          this.costOverHeadProfitobj
        )
        .subscribe((toolingList) => {
          this.blockUiService.popBlockUI('tooling recalculate');
          // const recalculationFlags = {
          //   isSupplierCountryChanged: false,
          //   isCountryChanged: false,
          //   complexityChanged: false,
          //   surfaceFinishChanged: false,
          //   isToollifeChanged: false,
          //   lifeTimeRemainingChange: false,
          // };
          // this._store.dispatch(new ToolingInfoActions.BulkUpdateAsync(toolingList, e.currentPart.partInfoId));
          this.toolingInfoSignalsService.bulkUpdateAsync(toolingList, e.currentPart.partInfoId);
          // this._bulkToolingUpdateLoadingSubscription$ = this._bulkToolingUpdateLoading$.subscribe((bulkToolingUpdateLoading) => {
          //   if (bulkToolingUpdateLoading === false) {
          //     this._bulkToolingUpdateLoadingSubscription$.unsubscribe();
          //     // this._store.dispatch(new ToolingInfoActions.SetBulkToolingUpdateLoading(true));
          //     this.toolingInfoSignalsService.setBulkToolingUpdateLoadingFalse(true);
          //     this.messaging.openSnackBar(`Recalculation completed for Tooling Section.`, '', { duration: 5000 });
          //     this.blockUiService.popBlockUI('tooling recalculate');
          //     this.recalculationCompletedEvent.emit(e.currentPart);
          //     Object.assign(this.changeFlags, recalculationFlags);
          //   }
          // });
        });
    });
    this.countryChangeSubject?.pipe(takeUntil(this.unsubscribeAll$)).subscribe((e) => {
      this.changeFlags.isSupplierCountryChanged = e;
    });
    this.lifetimeremainingChangeSubject?.pipe(takeUntil(this.unsubscribeAll$)).subscribe((e) => {
      this.changeFlags.lifeTimeRemainingChange = e;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['canUpdate']) {
      this.toggleForms();
    }
    if (changes['part'] && changes['part'].currentValue != changes['part'].previousValue) {
      this.currentPart = changes['part'].currentValue;
      if (
        changes['part'].currentValue?.partInfoId != changes['part'].previousValue?.partInfoId ||
        changes['part'].currentValue?.commodityId != changes['part'].previousValue?.commodityId ||
        changes['part'].currentValue?.mfrCountryId != changes['part'].previousValue?.mfrCountryId
      ) {
        this.currentPart = changes['part'].currentValue;
        this.MouldSubTypeList = this._toolConfig.getMouldSubtype();
        this.mouldCriticalityList = this._toolConfig._bopConfig.getCriticality();
        this.toolingNoOfShot = this._toolConfig.getToolingNoOfShot();
        this.MouldTypeList = this._toolConfig.getMouldType();
        this.SurfaceFinishList = this._toolConfig.surfaceFinish();
        if (this.currentPart?.commodityId) {
          this.costingToolingRecalculationService.setCurrentPart(this.currentPart);
          //this.loadDataBasedonCommodity();
        }
        if (this.currentPart?.partInfoId > 0) {
          this.getColorInfo();
        }
        this.costingToolingRecalculationService.getMasterData().subscribe((result) => {
          this.medOverHeadProfitData = result;
        });
      }
    }
    if (this.defaultMarketDataList.length == 0) {
      // const materialIds: string[] = this._toolConfig.getDefaultMaterialDescriptions();
      if (this.currentPart?.mfrCountryId) {
        // this._store.dispatch(new ToolingInfoActions.GetDefaultValuesForTooling(this.currentPart.mfrCountryId, materialIds));
        this.toolingInfoSignalsService.getDefaultValuesForTooling(this.currentPart.mfrCountryId);
      }
    }
  }

  private toggleForms() {
    try {
      const forms = [this.toolingFormGroup, this.materialFormGroup, this.processFormGroup, this.bopFormGroup, this.OHFormGroup];
      forms.forEach((frm) => {
        if (!frm) return;
        if (!this.canUpdate) {
          frm.disable({ emitEvent: false });
        } else {
          frm.enable({ emitEvent: false });
        }
      });
    } catch {}
  }

  get f() {
    return this.costingToolingform.controls;
  }

  get bopFormGroup(): FormGroup {
    return this.costingToolingform.get('bopFormGroup') as FormGroup;
  }

  get OHFormGroup(): FormGroup {
    return this.costingToolingform.get('OHFormGroup') as FormGroup;
  }

  get processFormGroup(): FormGroup {
    return this.costingToolingform.get('processFormGroup') as FormGroup;
  }

  get materialFormGroup(): FormGroup {
    return this.costingToolingform.get('materialFormGroup') as FormGroup;
  }

  get toolingFormGroup(): FormGroup {
    return this.costingToolingform.get('toolingFormGroup') as FormGroup;
  }

  private subscribeAssign(observer, assignee, minLength, callbackFn = '') {
    const observerArr = observer?.split('.');
    const observerObj = observerArr.length === 2 ? this[observerArr[0]][observerArr[1]]() : this[observerArr[0]];
    observerObj.pipe(takeUntil(this.unsubscribe$)).subscribe((result: any[]) => {
      if (result?.length >= minLength) {
        this[assignee] = result;
        // callbackFn === 'processCostSummary' && this.processCostSummary();
        callbackFn === 'processCountryList' && this.processCountryList();
      }
    });
  }

  private getColorInfo() {
    this.savecolorcalled = false;
    this.toolingFieldColorsList = [];
    this.sharedService
      .getColorInfosByPartinfo(this.currentPart?.partInfoId)
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe((result: FieldColorsDto[]) => {
        result && (this.toolingFieldColorsList = [...result]);
        this.cdRef.detectChanges();
        result && this.dirtyTouchCheckProperty(result);
        this.afterChange = false;
        this.dirtyCheckEvent.emit(this.afterChange);
        this.calculateOHCost();
      });
  }

  private saveColoringInfo() {
    const dirtyItems = [];
    this.toolingFieldColorsList = [];
    const addFieldColorsDto = (primaryId: number, screenId: number, frm: FormGroup) => {
      for (const el in frm.controls) {
        if (frm.controls[el].dirty || frm.controls[el].touched) {
          const fieldColorsDto = new FieldColorsDto();
          fieldColorsDto.isDirty = frm.controls[el].dirty;
          fieldColorsDto.formControlName = el;
          fieldColorsDto.isTouched = frm.controls[el].touched;
          fieldColorsDto.partInfoId = this.currentPart.partInfoId;
          fieldColorsDto.screenId = screenId;
          fieldColorsDto.primaryId = primaryId;
          dirtyItems.push(fieldColorsDto);
        }
      }
    };
    addFieldColorsDto(this.selectedToolId, ScreeName.Tooling, this.toolingFormGroup);
    addFieldColorsDto(this.selectedToolMaterialId, ScreeName.ToolingMaterial, this.materialFormGroup);
    addFieldColorsDto(this.selectedToolProcessId, ScreeName.ToolingManufacturing, this.processFormGroup);
    addFieldColorsDto(this.selectedToolBopId, ScreeName.ToolingBOP, this.bopFormGroup);
    if (dirtyItems.length > 0 && !this.savecolorcalled) {
      this.savecolorcalled = true;
      this.sharedService
        .updateColorInfo(dirtyItems)
        .pipe(takeUntil(this.unsubscribeAll$))
        .subscribe((result) => {
          result && this.getColorInfo();
          this.afterChange = false;
          this.dirtyCheckEvent.emit(this.afterChange);
        });
    }
  }

  dirtyTouchCheckProperty(result: FieldColorsDto[], targetFormGroup?: FormGroup) {
    const formGroups = [
      { id: ScreeName.Tooling, form: this.toolingFormGroup, key: 'toolingId' },
      { id: ScreeName.ToolingMaterial, form: this.materialFormGroup, key: 'toolingMaterialId' },
      { id: ScreeName.ToolingManufacturing, form: this.processFormGroup, key: 'toolingProcessId' },
      { id: ScreeName.ToolingBOP, form: this.bopFormGroup, key: 'bopCostId' },
    ];
    if (!result || !formGroups.some(({ form }) => form)) {
      return;
    }
    result?.forEach((element) => {
      formGroups?.forEach(({ id, form, key }) => {
        if ((!targetFormGroup || targetFormGroup === form) && element.screenId === id && form.get(key).value === element.primaryId) {
          element.isTouched && form.get(element?.formControlName)?.markAsTouched();
          element.isDirty && form.get(element?.formControlName)?.markAsDirty();
        }
      });
    });
  }

  private _filter(value: any): CountryDataMasterDto[] {
    let filterValue = '';
    if (value instanceof Object) {
      filterValue = (value.countryName || '').toLowerCase();
    } else {
      filterValue = (value || '').toLowerCase();
    }
    return this.toolcountryList.filter((country) => (country.countryName || '').toLowerCase().includes(filterValue));
  }

  onToolingFormValueChange() {
    this.afterChange = true;
    this.dirtyCheckEvent.emit(this.afterChange);
  }

  // private processCostSummary() {
  //   this.costSummaryViewData = Array.isArray(this.costSummaryViewData) && this.costSummaryViewData.length > 0 ? this.costSummaryViewData[0] : null;
  // }

  getAllDefaultMaterialEntriesForTooling(moldInfo: CostToolingDto) {
    const materialArray: ToolingMaterialInfoDto[] = [];
    this.toolingMaterialInfoList = [];
    this.costingToolingRecalculationService.moldItemDescsriptionsList = this._toolConfig.getMoldItemDescription(this.currentPart?.commodityId, moldInfo.toolingNameId);
    this.costingToolingRecalculationService.moldItemDescsriptionsList.forEach((element: { grade: string; id: number }) => {
      const defaultData = this.defaultMarketDataList.find((x) => x.materialMaster?.materialDescription == element.grade);
      let materialObj = new ToolingMaterialInfoDto();
      materialObj.toolingId = this.selectedToolId;
      const noOfCavity = (this.materialInfoList?.length && this.materialInfoList[0]?.noOfCavities) || 1;
      const quantity = noOfCavity;
      materialObj = { ...materialObj, ...this._toolingMapper._materialMapper.getAllDefaultMaterialModel(element, defaultData, moldInfo, this.currentPart?.commodityId, quantity) };
      moldInfo.toolingMasterData = this.ToolingMasterData;
      const colorField = []; // first time not required
      moldInfo.annualVolume = this.currentPart?.eav;
      const materialResult = this._toolingCalculator.calculateMaterialCost(materialObj, this.toolingMaterialInfoList, moldInfo, materialObj, colorField);
      this.totToolingMaterialWeight += Number(materialResult?.totalPlateWeight);
      materialArray.push(materialResult);
      this.toolingMaterialInfoList.push(materialObj);
    });
    return materialArray;
  }

  getAllDefaultProcessEntriesForTooling(tool: CostToolingDto) {
    const procesArray: ToolingProcessInfoDto[] = [];
    this.costingToolingRecalculationService.processGroupList.forEach((element: { equipmentRate: any; machineRate: any; cycleTime: any; hardeningCost: any; noOfSkilledLabor: any; id: number }) => {
      let processObj = new ToolingProcessInfoDto();
      processObj = {
        ...processObj,
        ...this._toolingMapper._processMapper.getAllDefaultProcessModel(element, tool, this.currentPart, this.selectedToolId, this.toolingLookupData, this.totToolingMaterialWeight),
      };
      processObj = { ...processObj, ...this._toolConfig._toolingProcessConfig.setProcessFlagsOnEditProcessInfo(this.currentPart.commodityId, processObj?.processGroupId) };
      tool.toolingMasterData = this.ToolingMasterData;
      const colorField = []; // first time not required
      const processCostResult = this._toolingCalculator.calculateProcessCost(processObj, tool?.toolingMaterialInfos, tool, processObj, colorField);
      procesArray.push(processCostResult);
    });
    return procesArray;
  }

  getAllDefaultBOPEntriesForTooling(tool: CostToolingDto) {
    const bopArray: BopCostToolingDto[] = [];
    this.costingToolingRecalculationService.bopDescriptionList.forEach((element: { id: number; quantity: number; cost: number }) => {
      let bopObj = new BopCostToolingDto();
      bopObj = { ...bopObj, ...this._toolingMapper._bopMapper.getAllDefaultBopModel(element, tool, this.currentPart, this.selectedToolId) };
      bopArray.push(bopObj);
    });
    return bopArray;
  }

  private processCountryList() {
    const toolingCountryList = this.countryList?.filter((element) => this._toolConfig.toolingCountry.includes(element.countryId));
    this.toolcountryList = toolingCountryList;
    this.filteredMfrCountryList$ = this.toolingFormGroup.get('sourceCountryId').valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );
  }

  public onMoldDescription(evt: any) {
    const mouldid = evt.currentTarget.value;
    if (mouldid) {
      this.mouldid = Number(mouldid);
      this.materialFormGroup.controls['moldDescriptionId'].setValue(mouldid);
      const toolLifeNoOfShots = this.toolingFormGroup.controls['toolLifeNoOfShots'].value;
      if (!this._toolConfig.excludedMaterialIds.includes(this.mouldid)) {
        const value = this.costingToolingRecalculationService.moldItemDescsriptionsList?.find((x) => x.id == this.mouldid);
        if (value) {
          let grade = value.grade;
          const toolingData = this._toolConfig.getToolingNoOfShot().find((x) => x.id === toolLifeNoOfShots);
          if (this.mouldid === ToolingMaterialIM.CavityInsert || this.mouldid === ToolingMaterialIM.CoreInsert) {
            toolingData && toolingData.coreCavityGrade && (grade = toolingData.coreCavityGrade);
          } else if (this._toolConfig.materialIds.includes(this.mouldid)) {
            toolingData && toolingData.moldGrade && (grade = toolingData.moldGrade);
          }
          const defaultData = this.defaultMarketDataList?.find((x) => x.materialMaster?.materialDescription == grade);
          if (defaultData) {
            let catergoryId = MaterialCategory.Ferrous;
            if (this.mouldid === ToolingMaterialIM.ElectrodeMaterialcost1 || this.mouldid === ToolingMaterialIM.ElectrodeMaterialcost2) {
              catergoryId = MaterialCategory.NonFerrous;
            }
            const previousid = this.materialFormGroup.controls['catergoryId'].value;
            const previousfamilyId = this.materialFormGroup.controls['familyId'].value;
            const familyId = defaultData?.materialMaster?.materialTypeId;
            const contry = this.toolingFormGroup.controls['sourceCountryId'].value;
            const countryId = contry ? contry?.countryId : 0;
            const materialMasterId = defaultData?.materialMasterId;
            this.materialFormGroup.controls['catergoryId'].setValue(catergoryId);
            this.materialFormGroup.controls['catergoryId'].markAsPristine();
            this.materialTypeList = this.materialTypeMasterList?.filter((x) => x.materialGroupId == catergoryId);
            this.recalculate = true;
            if (catergoryId != previousid || previousfamilyId != familyId) {
              // this.blockUiService.pushBlockUI('getmaterialsByMaterialTypeId');
              combineLatest([this.materialMasterService.getmaterialsByMaterialTypeId(familyId), this.materialMasterService.getMaterialMarketDataByCountryId(countryId, materialMasterId)])
                .pipe(takeUntil(this.unsubscribeAll$))
                .subscribe({
                  next: ([materialList, marketData]) => {
                    this.materialDescriptionList = materialList;
                    // this.blockUiService.popBlockUI('getmaterialsByMaterialTypeId');
                    const density = this.materialDescriptionList?.find((x: { materialMasterId: any }) => x.materialMasterId == materialMasterId)?.density;
                    const tensileStrength = this.materialDescriptionList?.find((x: { materialMasterId: any }) => x.materialMasterId == materialMasterId)?.tensileStrength;
                    this.onMoldDescriptionMaterialPatch(marketData, false, density, tensileStrength);
                    this.calculateMaterialCost();
                  },
                  error: () => {
                    console.error();
                    // this.blockUiService.popBlockUI('getmaterialsByMaterialTypeId');
                  },
                });
              // this.materialMasterService.getmaterialsByMaterialTypeId(familyId).pipe(takeUntil(this.unsubscribeAll$)).subscribe(
              //   (result: MaterialMasterDto[]) => {
              //     this.materialDescriptionList = result;
              //     this.materialMasterService.getMaterialMarketDataByCountryId(countryId, materialMasterId).pipe(takeUntil(this.unsubscribeAll$)).subscribe(
              //       (result) => {
              //         this.blockUiService.popBlockUI('getmaterialsByMaterialTypeId');
              //         let density = this.materialDescriptionList?.find((x: { materialMasterId: any; }) => x.materialMasterId == materialMasterId)?.density;
              //         let tensileStrength = this.materialDescriptionList?.find((x: { materialMasterId: any; }) => x.materialMasterId == materialMasterId)?.tensileStrength;
              //         this.onMoldDescriptionMaterialPatch(result, false, density, tensileStrength);
              //         this.calculateMaterialCost();
              //       },
              //       (error) => {
              //         console.error();
              //         this.blockUiService.popBlockUI('getmaterialsByMaterialTypeId');
              //       }
              //     );
              //   },
              // );
            } else {
              this.onMoldDescriptionMaterialPatch(defaultData, true);
              this.calculateMaterialCost();
            }
          }
        }
      } else {
        this.calculateMaterialCost();
      }
    }
  }

  onMoldDescriptionMaterialPatch(defaultOrCustomData, isDefault, density = null, tensileStrength = null) {
    this.materialFormGroup.patchValue(this._toolingMapper._materialMapper.onMoldDescriptionPatch(defaultOrCustomData, density, tensileStrength));
    const formfields = ['familyId', 'gradeId', 'density', 'materialPrice', 'scrapPrice', 'tensileStrength'];
    formfields.forEach((fieldname) => this.materialFormGroup.controls[fieldname].markAsPristine());
    this._toolConfig.defaultValues.density = isDefault ? defaultOrCustomData?.materialMaster?.density : density;
    this._toolConfig.defaultValues.materialPrice = defaultOrCustomData?.price;
    this._toolConfig.defaultValues.scrapPrice = defaultOrCustomData?.generalScrapPrice;
  }

  // getToolEntries() {
  //   this._toolingInfo$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((result: CostToolingDto[]) => {
  //     if (result) {
  //       if (result?.length > 0) {
  //         this.toolInfoList = result;
  //         this.toolIdToNameConversion();
  //         this.setToolEntrySelection();
  //       } else {
  //         this.toolInfoList = [];
  //         this.clearToolingInfo();
  //       }
  //     }
  //   });
  // }

  setTotalToolingCost(toolList: CostToolingDto[]) {
    this._toolConfig.toolingTotal.totCost = 0;
    this._toolConfig.toolingTotal.amortizationTot = 0;
    toolList?.forEach((tool) => {
      // let lifeInParts = Math.min(this.currentPart.lifeTimeQtyRemaining, Number(tool.toolLifeInParts));
      // let bopCost = 0;
      // tool.bopCostTooling?.forEach((bop) => {
      //   bopCost += this.sharedService.isValidNumber(bop.totalProcessCost);
      // });
      // if (this._toolConfig.commodity.isInjMoulding) {
      //   let subsequentToolCost = 0;
      //   const toolcpstist = tool?.toolingMaterialInfos.filter((element) => this._toolConfig.mouldDescriptionIds.includes(element.moldDescriptionId));
      //   toolcpstist?.forEach((mat) => {
      //     subsequentToolCost += this.sharedService.isValidNumber(mat?.totalRawMaterialCost);
      //   });
      //   let totalMouldBaseMaterialCost = 0;
      //   const toolcpstists = tool?.toolingMaterialInfos.filter((element) => !this._toolConfig.mouldDescriptionIds.includes(element.moldDescriptionId));
      //   toolcpstists?.forEach((mat) => {
      //     totalMouldBaseMaterialCost += this.sharedService.isValidNumber(mat?.totalRawMaterialCost);
      //   });
      //   subsequentToolCost += totalMouldBaseMaterialCost * 0.2;
      //   const processCall = tool?.toolingProcessInfos.filter((element) => {
      //     return element.processGroupId === IMProcessGroup.MachineOperations || element.processGroupId === IMProcessGroup.TextureCost;
      //   });
      //   processCall?.forEach((mat) => {
      //     subsequentToolCost += this.sharedService.isValidNumber(mat?.totalProcessCost);
      //   });
      //   const processCall2 = tool?.toolingProcessInfos.filter((element) => element.processGroupId === IMProcessGroup.Validation);
      //   processCall2?.forEach((mat) => {
      //     subsequentToolCost += this.sharedService.isValidNumber(mat?.totalProcessCost) * 0.5;
      //   });
      //   subsequentToolCost += bopCost;
      //   tool.subsequentToolCost = tool.noOfSubsequentTool > 0 ? subsequentToolCost * tool.noOfSubsequentTool : 0;
      // } else if (this._toolConfig.commodity.isCasting) {
      //   !tool?.toolingMasterData && (tool.toolingMasterData = this.ToolingMasterData);
      //   this._toolingCalculator.toolingHpdcCalculatorService.calculateSubSequenctialCostForHPDCCastinTool(tool);
      // } else if (this._toolConfig.commodity.isSheetMetal) {
      //   this._toolingCalculator.toolingSmCalculatorService.calculateSubSequenctialCostForSheetMetal(tool);
      // } else {
      //   tool.subsequentToolCost = 0;
      // }
      // tool.amortizationPerPart = this.sharedService.isValidNumber((Number(tool.toolingCost) + Number(tool.subsiquentToolCost)) / lifeInParts);
      tool.amortizationPerPart = Number(tool.toolingCost) / Number(this.currentPart.lifeTimeQtyRemaining);
      this._toolConfig.toolingTotal.totCost += Number(tool?.toolingCost) + Number(tool.subsequentToolCost);
      // this._toolConfig.toolingTotal.amortizationTot += Number((tool.toolingCost) + Number(tool.subsequentToolCost)) / lifeInParts;
      this._toolConfig.toolingTotal.amortizationTot += Number(tool.toolingCost / Number(this.currentPart.lifeTimeQtyRemaining));
    });
    this._toolConfig.toolingTotal.totCost = this.sharedService.isValidNumber(this._toolConfig.toolingTotal.totCost);
    this._toolConfig.toolingTotal.amortizationTot = this.sharedService.isValidNumber(this._toolConfig.toolingTotal.amortizationTot);
  }

  setTotalCostForAllSections(tool: CostToolingDto) {
    // this._toolConfig._bopConfig.bopInfo.totCost = 0;
    // this._toolConfig._bopConfig.bopInfo.totProcessCost = 0;
    // this._toolConfig._bopConfig.bopInfo.totQty = 0;
    // this._toolConfig._toolingProcessConfig.processInfo.totCost = 0;
    // this._toolConfig._toolingMaterialConfig.materialInfo.totCost = 0;
    // this._toolConfig._toolingMaterialConfig.materialInfo.totWeight = 0;
    // tool?.toolingMaterialInfos?.forEach(material => {
    //   this._toolConfig._toolingMaterialConfig.materialInfo.totCost += Number(material.totalRawMaterialCost);
    //   this._toolConfig._toolingMaterialConfig.materialInfo.totWeight += Number(material.totalPlateWeight);
    // });
    // this._toolConfig._toolingMaterialConfig.materialInfo.totCost = this.sharedService.isValidNumber(this._toolConfig._toolingMaterialConfig.materialInfo.totCost);
    // this._toolConfig._toolingMaterialConfig.materialInfo.totWeight = this.sharedService.isValidNumber(this._toolConfig._toolingMaterialConfig.materialInfo.totWeight);
    // tool?.toolingProcessInfos?.forEach(process => {
    //   this._toolConfig._toolingProcessConfig.processInfo.totCost += Number(process.totalProcessCost);
    // });
    // this._toolConfig._toolingProcessConfig.processInfo.totCost = this.sharedService.isValidNumber(this._toolConfig._toolingProcessConfig.processInfo.totCost);
    // tool?.bopCostTooling?.forEach(bop => {
    //   this._toolConfig._bopConfig.bopInfo.totCost += Number(bop.totalCost);
    //   this._toolConfig._bopConfig.bopInfo.totProcessCost += Number(bop.totalProcessCost);
    //   this._toolConfig._bopConfig.bopInfo.totQty += Number(bop.quantity);
    // });
    // this._toolConfig._bopConfig.bopInfo.totCost = this.sharedService.isValidNumber(this._toolConfig._bopConfig.bopInfo.totCost);
    // this._toolConfig._bopConfig.bopInfo.totProcessCost = this.sharedService.isValidNumber(this._toolConfig._bopConfig.bopInfo.totProcessCost);
    // this._toolConfig._bopConfig.bopInfo.totQty = this.sharedService.isValidNumber(this._toolConfig._bopConfig.bopInfo.totQty);
    // if (tool?.toolingMaterialInfos) {
    // const toolcpstist = tool?.toolingMaterialInfos.filter(element => element.moldDescriptionId === ToolingMaterialIM.CavityInsert || element.moldDescriptionId === ToolingMaterialIM.CoreInsert);
    // let totalCoreCavityWeight = 0;
    // let totalCoreCavityMaterialCost = 0;
    // let totalMouldBaseWeight = 0;
    // let totalMouldBaseMaterialCost = 0;
    // toolcpstist?.forEach(mat => {
    //   totalCoreCavityWeight += Number(mat?.totalPlateWeight);
    //   totalCoreCavityMaterialCost += Number(mat?.totalRawMaterialCost);
    // });
    // tool.totalCoreCavityWeight = this.sharedService.isValidNumber(totalCoreCavityWeight);
    // tool.totalCoreCavityMaterialCost = this.sharedService.isValidNumber(totalCoreCavityMaterialCost);
    // this.toolingFormGroup.controls['totalCoreCavityWeight'].patchValue(tool.totalCoreCavityWeight);
    // this.toolingFormGroup.controls['totalCoreCavityMaterialCost'].patchValue(tool.totalCoreCavityMaterialCost);
    // const toolcpstists = tool?.toolingMaterialInfos.filter(element => !this._toolConfig.mouldDescriptionIds.includes(element.moldDescriptionId) && element.moldDescriptionId !== ToolingMaterialIM.HotRunnerCost);
    // toolcpstists?.forEach(mat => {
    //   totalMouldBaseWeight += Number(mat?.totalPlateWeight);
    //   totalMouldBaseMaterialCost += Number(mat?.totalRawMaterialCost);
    // });
    // tool.totalMouldBaseWeight = this.sharedService.isValidNumber(totalMouldBaseWeight);
    // tool.totalMouldBaseMaterialCost = this.sharedService.isValidNumber(totalMouldBaseMaterialCost);
    // this.toolingFormGroup.controls['totalMouldBaseWeight'].patchValue(tool.totalMouldBaseWeight);
    // this.toolingFormGroup.controls['totalMouldBaseMaterialCost'].patchValue(tool.totalMouldBaseMaterialCost);
    // }
    this._toolConfig.initializeToolConfig(this._toolConfig);
    this._toolingHelper.calculateToolingCosts(tool, this._toolConfig);
    if (tool?.toolingMaterialInfos) {
      const materialCosts = this._toolingHelper.calculateTotalCosts(tool);
      this.toolingFormGroup.patchValue({
        totalCoreCavityWeight: materialCosts.totalCoreCavityWeight,
        totalCoreCavityMaterialCost: materialCosts.totalCoreCavityMaterialCost,
        totalMouldBaseWeight: materialCosts.totalMouldBaseWeight,
        totalMouldBaseMaterialCost: materialCosts.totalMouldBaseMaterialCost,
      });
    }
  }

  clearToolingInfo() {
    this.clearCommon();
    this.coreMaterialInfoList = [];
    this.mouldMaterialInfoList = [];
    this.electrodeMaterialInfoList = [];
    this.otherMaterialInfoList = [];
    this.diePunchMaterialInfoList = [];
  }

  clearAll() {
    this.selectedToolId = 0;
    this.clearCommon();
  }

  private clearCommon() {
    this.toolingMaterialInfoList = [];
    this.toolingProcessInfoList = [];
    this.toolingBOPInfoList = [];
    this.coreMaterialInfoList = [];
    this.mouldMaterialInfoList = [];
    this.electrodeMaterialInfoList = [];
    this.otherMaterialInfoList = [];
    this.diePunchMaterialInfoList = [];
    this._toolConfig._toolingMaterialConfig.materialInfo.totCost = 0;
    this._toolConfig._toolingMaterialConfig.materialInfo.totWeight = 0;
    this._toolConfig._toolingProcessConfig.processInfo.totCost = 0;
    this._toolConfig._bopConfig.bopInfo.totCost = 0;
    this._toolConfig._bopConfig.bopInfo.totProcessCost = 0;
    this._toolConfig._bopConfig.bopInfo.totQty = 0;
    this._toolConfig.toolingTotal.amortizationTot = 0;
    this._toolConfig.toolingTotal.totCost = 0;
    this.showMaterialProcessSection = false;
    this.materialFormGroup.patchValue(this._toolingMapper._materialMapper.clearMaterialForm());
    this.processFormGroup.patchValue(this._toolingMapper._processMapper.getDefaultProcessFormFields());
    this.bopFormGroup.patchValue(this._toolingMapper._bopMapper.clearBOPForm());
    this.toolingFormGroup.patchValue(this._toolingMapper._toolingInfoMapper.clearMoldForm());
  }

  toolIdToNameConversion() {
    // this.toolInfoList.forEach((tool) => {
    //   tool.toolingName = this.toolNamesList?.find((desc) => desc.id === tool.toolingNameId)?.name || null;
    // });
    this.toolInfoList = this.toolInfoList.map((tool) => {
      return {
        ...tool,
        toolingName: this.toolNamesList?.find((desc) => desc.id === tool.toolingNameId)?.name || null,
      };
    });
  }

  setToolEntrySelection() {
    if (this.toolInfoList && this.toolInfoList?.length > 0) {
      if (this._toolConfig.addNewFlags.isNewTool) {
        this.onEditToolInfo(this.toolInfoList[this.toolInfoList.length - 1]);
      } else if (this.selectedToolId > 0) {
        const tool = this.toolInfoList.find((x) => x.toolingId == this.selectedToolId);
        if (tool != undefined) {
          this.onEditToolInfo(tool);
        } else {
          this.onEditToolInfo(this.toolInfoList[0]);
        }
      } else {
        this.onEditToolInfo(this.toolInfoList[0]);
      }
    } else {
      this.toolInfoList = [];
      this.clearToolingInfo();
    }
  }

  onEditToolInfo(tool: CostToolingDto) {
    this.clearAll();
    this.selectedToolId = tool?.toolingId;
    this.selectedToolingNameId = tool?.toolingNameId;
    tool.toolingMasterData = this.ToolingMasterData;
    this.selectedTool = tool;
    this.showMaterialProcessSection = true;
    const fieldColor = this.toolingFieldColorsList?.filter((x) => x.primaryId == this.selectedToolId && x.screenId == ScreeName.Tooling);
    fieldColor?.forEach((element) => {
      const control = this.toolingFormGroup.get(element.formControlName);
      element.isTouched && control?.markAsTouched();
      element.isDirty && control?.markAsDirty();
    });
    const primaryMaterialCavity = this.materialInfoList && this.materialInfoList?.length ? this.materialInfoList[0].noOfCavities : null;
    const cavColsRows = this._costingConfig.cavityColsRows(primaryMaterialCavity);
    this.costingToolingform.patchValue(this._toolingMapper.costingToolingFormPatch(tool));
    this.toolingFormGroup.patchValue(this._toolingMapper._toolingInfoMapper.onEditToolPatch(tool, primaryMaterialCavity, cavColsRows, this.conversionValue, this.isEnableUnitConversion));
    this.previousComplexity = tool?.mouldCriticality;
    this.previoussurfaceFinish = tool?.surfaceFinish;
    this.previousLifeShort = tool.toolLifeNoOfShots;
    this.isHotRunner = tool?.mouldTypeId == 1;
    this.isDropSelected = tool?.mouldSubTypeId === 3 || tool?.mouldSubTypeId === 4;
    if (this.toolInfoList && this.toolInfoList?.length > 0) {
      this.setTotalToolingCost(this.toolInfoList);
    }
    this.setTotalCostForAllSections(tool);
    if (tool?.sourceCountryId > 0) {
      const country = this.toolcountryList?.find((c) => c.countryId == tool?.sourceCountryId);
      this.previousCountryId = tool?.sourceCountryId;
      this.toolingFormGroup.get('sourceCountryId')?.setValue(country);
      this.getLaborRateBasedOnCountry(tool?.sourceCountryId);
    } else {
      this.previousCountryId = 0;
      this.toolingFormGroup.get('sourceCountryId')?.setValue('');
    }
    if (tool?.toolingMaterialInfos?.length > 0) {
      this._toolConfig._toolingMaterialConfig.materialInfo = { ...this._toolConfig._toolingMaterialConfig.materialInfo, ...this._toolingMapper.onEditToolInfoDefaultValues() };
      this.toolingMaterialInfoList = tool?.toolingMaterialInfos;
      this.toolingMaterialInfoList = this._toolingHelper.materialIdToNameConversion(tool?.toolingMaterialInfos, this.costingToolingRecalculationService.moldItemDescsriptionsList);
      // this._toolingHelper.materialIdToNameConversion(this.toolingMaterialInfoList, this.moldItemDescsriptionsList);
      this.coreMaterialInfoList = tool?.toolingMaterialInfos?.filter((element) => {
        return element.moldDescriptionId === ToolingMaterialIM.CavityInsert || element.moldDescriptionId === ToolingMaterialIM.CoreInsert;
      });
      // this.coreMaterialInfoList.forEach((tool) => {
      //   tool.toolingMaterialName = this.moldItemDescsriptionsList?.find((desc) => desc.id === tool.moldDescriptionId)?.name || null;
      // });
      this.coreMaterialInfoList = this.coreMaterialInfoList.map((tool) => ({
        ...tool,
        toolingMaterialName: this.costingToolingRecalculationService.moldItemDescsriptionsList?.find((desc) => desc.id === tool.moldDescriptionId)?.name || null,
      }));
      this.coreMaterialInfoList?.forEach((mat) => {
        this._toolConfig._toolingMaterialConfig.materialInfo.totCoreCost += mat.totalRawMaterialCost;
        this._toolConfig._toolingMaterialConfig.materialInfo.totCoreWeight += mat.totalPlateWeight;
      });
      this._toolConfig._toolingMaterialConfig.materialInfo.totCoreCost = this.sharedService.isValidNumber(this._toolConfig._toolingMaterialConfig.materialInfo.totCoreCost);
      this._toolConfig._toolingMaterialConfig.materialInfo.totCoreWeight = this.sharedService.isValidNumber(this._toolConfig._toolingMaterialConfig.materialInfo.totCoreWeight);

      this.diePunchMaterialInfoList = tool?.toolingMaterialInfos?.filter((element) => {
        return element.moldDescriptionId === ToolingMaterialSheetMetal.Die || element.moldDescriptionId === ToolingMaterialSheetMetal.Punch;
      });
      // this.diePunchMaterialInfoList.forEach((tool) => {
      //   tool.toolingMaterialName = this.moldItemDescsriptionsList?.find((desc) => desc.id === tool.moldDescriptionId)?.name || null;
      // });
      this.diePunchMaterialInfoList = this.diePunchMaterialInfoList.map((tool) => ({
        ...tool,
        toolingMaterialName: this.costingToolingRecalculationService.moldItemDescsriptionsList?.find((desc) => desc.id === tool.moldDescriptionId)?.name || null,
      }));
      this.diePunchMaterialInfoList?.forEach((mat) => {
        this._toolConfig._toolingMaterialConfig.materialInfo.totDiePunchCost += mat.totalRawMaterialCost;
        this._toolConfig._toolingMaterialConfig.materialInfo.totDiePunchWeight += mat.totalPlateWeight;
      });
      this._toolConfig._toolingMaterialConfig.materialInfo.totDiePunchCost = this.sharedService.isValidNumber(this._toolConfig._toolingMaterialConfig.materialInfo.totDiePunchCost);
      this._toolConfig._toolingMaterialConfig.materialInfo.totDiePunchWeight = this.sharedService.isValidNumber(this._toolConfig._toolingMaterialConfig.materialInfo.totDiePunchWeight);

      if (this._toolConfig.commodity.isSheetMetal) {
        this.mouldMaterialInfoList = tool?.toolingMaterialInfos?.filter((element) => {
          return (
            !this._toolConfig.mouldDescriptionIds.includes(element.moldDescriptionId) &&
            element.moldDescriptionId !== ToolingMaterialIM.HotRunnerCost &&
            element.moldDescriptionId !== ToolingMaterialSheetMetal.Die &&
            element.moldDescriptionId !== ToolingMaterialSheetMetal.Punch &&
            element.moldDescriptionId !== 0 &&
            element.moldDescriptionId !== null
          );
        });
        this.mouldIndex = this.coreMaterialInfoList.length + this.diePunchMaterialInfoList.length + 1;
      } else {
        this.mouldMaterialInfoList = tool?.toolingMaterialInfos?.filter((element) => {
          return (
            !this._toolConfig.mouldDescriptionIds.includes(element.moldDescriptionId) &&
            element.moldDescriptionId !== ToolingMaterialIM.HotRunnerCost &&
            element.moldDescriptionId !== 0 &&
            element.moldDescriptionId !== null
          );
        });
        this.mouldIndex = this.coreMaterialInfoList.length + 1;
      }
      // this.mouldMaterialInfoList.forEach((tool) => {
      //   tool.toolingMaterialName = this.moldItemDescsriptionsList?.find((desc) => desc.id === tool.moldDescriptionId)?.name || null;
      // });
      this.mouldMaterialInfoList = this.mouldMaterialInfoList.map((tool) => ({
        ...tool,
        toolingMaterialName: this.costingToolingRecalculationService.moldItemDescsriptionsList?.find((desc) => desc.id === tool.moldDescriptionId)?.name || null,
      }));
      this.mouldMaterialInfoList?.forEach((mat) => {
        this._toolConfig._toolingMaterialConfig.materialInfo.totMouldCost += mat.totalRawMaterialCost;
        this._toolConfig._toolingMaterialConfig.materialInfo.totMouldWieght += mat.totalPlateWeight;
      });
      this._toolConfig._toolingMaterialConfig.materialInfo.totMouldCost = this.sharedService.isValidNumber(this._toolConfig._toolingMaterialConfig.materialInfo.totMouldCost);
      this._toolConfig._toolingMaterialConfig.materialInfo.totMouldWieght = this.sharedService.isValidNumber(this._toolConfig._toolingMaterialConfig.materialInfo.totMouldWieght);

      this.copperIndex = this.coreMaterialInfoList.length + this.mouldMaterialInfoList.length + 1;
      this.electrodeMaterialInfoList = tool?.toolingMaterialInfos?.filter((element) => {
        return element.moldDescriptionId === ToolingMaterialIM.ElectrodeMaterialcost1 || element.moldDescriptionId === ToolingMaterialIM.ElectrodeMaterialcost2;
      });
      // this.electrodeMaterialInfoList.forEach((tool) => {
      //   tool.toolingMaterialName = this.moldItemDescsriptionsList?.find((desc) => desc.id === tool.moldDescriptionId)?.name || null;
      // });
      this.electrodeMaterialInfoList = this.electrodeMaterialInfoList.map((tool) => ({
        ...tool,
        toolingMaterialName: this.costingToolingRecalculationService.moldItemDescsriptionsList?.find((desc) => desc.id === tool.moldDescriptionId)?.name || null,
      }));
      this.electrodeMaterialInfoList?.forEach((mat) => {
        this._toolConfig._toolingMaterialConfig.materialInfo.totElectrodCost += mat.totalRawMaterialCost;
        this._toolConfig._toolingMaterialConfig.materialInfo.totElectrodWeight += mat.totalPlateWeight;
      });
      this._toolConfig._toolingMaterialConfig.materialInfo.totElectrodCost = this.sharedService.isValidNumber(this._toolConfig._toolingMaterialConfig.materialInfo.totElectrodCost);
      this._toolConfig._toolingMaterialConfig.materialInfo.totElectrodWeight = this.sharedService.isValidNumber(this._toolConfig._toolingMaterialConfig.materialInfo.totElectrodWeight);

      this.otherIndex = this.electrodeMaterialInfoList.length + this.coreMaterialInfoList.length + this.mouldMaterialInfoList.length + 1;
      this.otherMaterialInfoList = tool?.toolingMaterialInfos?.filter((element) => {
        return this._toolConfig.excludedMaterialIds.includes(element.moldDescriptionId) || element.moldDescriptionId === 0 || element.moldDescriptionId === null;
      });
      // this.otherMaterialInfoList.forEach((tool) => {
      //   tool.toolingMaterialName = this.moldItemDescsriptionsList?.find((desc) => desc.id === tool.moldDescriptionId)?.name || null;
      // });
      this.otherMaterialInfoList = this.otherMaterialInfoList.map((tool) => ({
        ...tool,
        toolingMaterialName: this.costingToolingRecalculationService.moldItemDescsriptionsList?.find((desc) => desc.id === tool.moldDescriptionId)?.name || null,
      }));
      this.otherMaterialInfoList?.forEach((mat) => {
        this._toolConfig._toolingMaterialConfig.materialInfo.totOtherCost += mat.totalRawMaterialCost;
        this._toolConfig._toolingMaterialConfig.materialInfo.totOtherWeight += mat.totalPlateWeight;
      });
      this._toolConfig._toolingMaterialConfig.materialInfo.totOtherCost = this.sharedService.isValidNumber(this._toolConfig._toolingMaterialConfig.materialInfo.totOtherCost);
      this._toolConfig._toolingMaterialConfig.materialInfo.totOtherWeight = this.sharedService.isValidNumber(this._toolConfig._toolingMaterialConfig.materialInfo.totOtherWeight);

      if (this.toolingMaterialInfoList && this.toolingMaterialInfoList?.length > 0) {
        setTimeout(() => {
          this.materialComponent?.setMaterialEntrySelection();
        }, 0);
      }
    } else {
      this.toolingMaterialInfoList = [];
      this.materialFormGroup.patchValue(this._toolingMapper._materialMapper.clearMaterialForm());
    }
    if (tool?.toolingProcessInfos?.length > 0) {
      this.toolingProcessInfoList = tool?.toolingProcessInfos;
      // this.toolingProcessInfoList.forEach((tool) => {
      //   tool.processGroupName = this.processGroupList?.find((desc) => desc.id === tool.processGroupId)?.name || null;
      // });
      this.toolingProcessInfoList = this.toolingProcessInfoList.map((tool) => ({
        ...tool,
        processGroupName: this.costingToolingRecalculationService.processGroupList?.find((desc) => desc.id === tool.processGroupId)?.name || null,
      }));
      if (this.toolingProcessInfoList && this.toolingProcessInfoList?.length > 0) {
        setTimeout(() => {
          this.processComponent?.setProcessEntrySelection();
        }, 0);
      }
    } else {
      this.toolingProcessInfoList = [];
      this.processFormGroup.patchValue(this._toolingMapper._processMapper.getDefaultProcessFormFields());
    }

    if (tool?.bopCostTooling?.length > 0) {
      this.toolingBOPInfoList = tool?.bopCostTooling;
      // this.toolingBOPInfoList.forEach((tool) => {
      //   tool.descriptionName = this.bopDescriptionList?.find((desc) => desc.id === tool.descriptionId)?.name || null;
      // });
      this.toolingBOPInfoList = this.toolingBOPInfoList.map((tool) => ({
        ...tool,
        descriptionName: this.costingToolingRecalculationService.bopDescriptionList?.find((desc) => desc.id === tool.descriptionId)?.name || null,
      }));
      if (this.toolingBOPInfoList && this.toolingBOPInfoList?.length > 0) {
        setTimeout(() => {
          this.bopInfoComponent?.setBOPEntrySelection();
        }, 0);
      }
    } else {
      this.toolingBOPInfoList = [];
      this.bopFormGroup.patchValue(this._toolingMapper._bopMapper.clearBOPForm());
    }
    if (tool?.costOverHeadProfit?.length > 0) {
      this.costOverHeadProfitobj = tool?.costOverHeadProfit[0];
      if (this.costOverHeadProfitobj != undefined && this.costOverHeadProfitobj.costOverHeadProfitId > 0) {
        setTimeout(() => {
          this.overHeadComponent?.setOHForm();
        }, 0);
      } else {
        this.costOverHeadProfitobj = new CostOverHeadProfitDto();
        this.costingToolingRecalculationService.getOverHeadProfitData().subscribe((result: CostOverHeadProfitDto) => {
          this.setOverHeadProfitData(result);
        });
      }
    } else {
      this.costOverHeadProfitobj = new CostOverHeadProfitDto();
      this.costingToolingRecalculationService.getOverHeadProfitData().subscribe((result: CostOverHeadProfitDto) => {
        this.setOverHeadProfitData(result);
      });
    }
  }

  setOverHeadProfitData(result: CostOverHeadProfitDto) {
    if (result && result?.costOverHeadProfitId > 0 && result.partInfoId == this.currentPart?.partInfoId && result?.toolingId === this.selectedToolId) {
      this.costOverHeadProfitobj = result;
      setTimeout(() => {
        this.overHeadComponent.setOHForm();
      }, 0);
    } else {
      this.costingToolingRecalculationService.getMasterData().subscribe((result) => {
        this.medOverHeadProfitData = result;
      });
    }
  }
  calculateMoldCost() {
    const frm = this.toolingFormGroup;
    if (frm) {
      for (const passEl in frm.controls) {
        if (frm.controls[passEl] && (!frm.controls[passEl].value || Number(frm.controls[passEl].value) === 0)) {
          frm.controls[passEl].markAsPristine();
          frm.controls[passEl].markAsUntouched();
          this.toolingFieldColorsList = this.toolingFieldColorsList.filter((x) => x.formControlName !== passEl);
        }
      }
    }
    const moldInfo = new CostToolingDto();
    this._toolingMapper._toolingInfoMapper.toolingFormDirtyCheck(moldInfo, this.toolingFormGroup.controls);
    this._toolingMapper._toolingInfoMapper.toolingFormAssignValue(
      moldInfo,
      this.toolingFormGroup.controls,
      this.ToolingMasterData,
      this.materialInfoList,
      this.processInfoList,
      this.conversionValue,
      this.isEnableUnitConversion
    );
    this.toolingFormGroup.get('noOfCavity').setValue(moldInfo.noOfCavity);
    moldInfo.toolingMaterialInfos = this.toolingMaterialInfoList;
    const colorField = this.toolingFieldColorsList?.filter((x) => x.primaryId == this.selectedToolId && x.screenId == ScreeName.Tooling);
    const matInfo = this.materialInfoList?.length > 0 ? this.materialInfoList[0] : null;
    const processInfo = this.processInfoList?.length > 0 ? this.processInfoList[0] : null;
    const result = this._toolingCalculator.calculateMoldCost(moldInfo, this.currentPart, this.selectedTool, colorField, matInfo, processInfo, this.toolingMaterialInfoList);
    this.toolingFormGroup.patchValue(this._toolingMapper._toolingInfoMapper.calculateMoldCostPatch(result, this.conversionValue, this.isEnableUnitConversion));
  }

  calculateMaterialCost() {
    const frm = this.materialFormGroup;
    if (frm) {
      for (const passEl in frm.controls) {
        if (frm.controls[passEl] && (!frm.controls[passEl].value || Number(frm.controls[passEl].value) === 0)) {
          frm.controls[passEl].markAsPristine();
          frm.controls[passEl].markAsUntouched();
          this.toolingFieldColorsList = this.toolingFieldColorsList.filter((x) => x.formControlName !== passEl);
        }
      }
    }
    const matInfo = new ToolingMaterialInfoDto();
    this._toolingMapper._materialMapper.setCalculationObject(
      matInfo,
      this.materialFormGroup.controls,
      this.conversionValue,
      this.isEnableUnitConversion,
      this._toolConfig.defaultValues,
      this._toolConfig.commodity
    );
    const tool = this.toolInfoList.find((x) => x.toolingId == this.selectedToolId);
    const colorField = this.toolingFieldColorsList?.filter((x) => x.primaryId == this.selectedToolMaterialId && x.screenId == ScreeName.ToolingMaterial);
    tool.toolingMasterData = this.ToolingMasterData;
    tool.annualVolume = this.currentPart?.eav;
    tool.partThickness = this.materialInfoList?.length && this.materialInfoList[0]?.dimUnfoldedZ;
    const result = this._toolingCalculator.calculateMaterialCost(matInfo, this.toolingMaterialInfoList, tool, this.selectedMaterial, colorField);
    this.materialFormGroup.patchValue(this._toolingMapper._materialMapper.calculateMaterialCostPatch(result, tool, this.conversionValue, this.isEnableUnitConversion));
  }

  calculateProcessCost() {
    const frm = this.processFormGroup;
    if (frm) {
      for (const passEl in frm.controls) {
        if (frm.controls[passEl] && (!frm.controls[passEl].value || Number(frm.controls[passEl].value) === 0)) {
          frm.controls[passEl].markAsPristine();
          frm.controls[passEl].markAsUntouched();
          this.toolingFieldColorsList = this.toolingFieldColorsList.filter((x) => x.formControlName !== passEl);
        }
      }
    }
    const processInfo = new ToolingProcessInfoDto();
    const tool = this.toolInfoList.find((x) => x.toolingId == this.selectedToolId);
    this._toolingMapper._processMapper.setCalculalationObject(
      tool,
      processInfo,
      this.currentPart,
      this.processFormGroup.controls,
      this.toolingFormGroup.controls,
      this.toolingLookupData,
      this._toolConfig._toolingProcessConfig.processFlags,
      this._toolConfig.laborRate,
      this._toolConfig.commodity
    );
    processInfo.totmaterialWeight = Number(this._toolConfig._toolingMaterialConfig.materialInfo?.totWeight);
    const colorField = this.toolingFieldColorsList?.filter((x) => x.primaryId == this.selectedToolProcessId && x.screenId == ScreeName.ToolingManufacturing);
    tool.toolingMasterData = this.ToolingMasterData;
    tool.partThickness = this.materialInfoList?.length && this.materialInfoList[0]?.dimUnfoldedZ;
    const result = this._toolingCalculator.calculateProcessCost(processInfo, this.toolingMaterialInfoList, tool, this.selectedProcess, colorField);
    this.processFormGroup.patchValue(this._toolingMapper._processMapper.processCostPatchResults(result));
  }

  calculateBOPCost() {
    const frm = this.bopFormGroup;
    if (frm) {
      for (const passEl in frm.controls) {
        if (frm.controls[passEl] && (!frm.controls[passEl].value || Number(frm.controls[passEl].value) === 0)) {
          frm.controls[passEl].markAsPristine();
          frm.controls[passEl].markAsUntouched();
          this.toolingFieldColorsList = this.toolingFieldColorsList.filter((x) => x.formControlName !== passEl);
        }
      }
    }
    const tool = this.toolInfoList.find((x) => x.toolingId == this.selectedToolId);
    tool.toolingMasterData = this.ToolingMasterData;
    const bop = new BopCostToolingDto();
    this._toolingMapper._bopMapper.bopFormAssignValue(bop, this.bopFormGroup.controls, this._toolConfig.commodity);
    const colorField = this.toolingFieldColorsList?.filter((x) => x.primaryId == this.selectedToolBopId && x.screenId == ScreeName.ToolingBOP);
    const bopResult = this._toolingCalculator.calculateBopCost(bop, tool, this.selectedBop, colorField);
    this.bopFormGroup.controls['bopTotalProcessCost'].setValue(bopResult?.totalProcessCost);
  }

  calculateOHCost() {
    const frm = this.OHFormGroup;
    if (frm) {
      for (const passEl in frm.controls) {
        if (frm.controls[passEl] && (!frm.controls[passEl].value || Number(frm.controls[passEl].value) === 0)) {
          frm.controls[passEl].markAsPristine();
          frm.controls[passEl].markAsUntouched();
          this.toolingFieldColorsList = this.toolingFieldColorsList.filter((x) => x.formControlName !== passEl);
        }
      }
    }
    const colorField = this.toolingFieldColorsList?.filter((x) => x.screenId == ScreeName.ToolingOverHead);
    const costOverHeadProfitDto = new CostOverHeadProfitDto();
    this.costSummaryViewData && this.costingToolingform && this._toolingMapper.ohMapper.setCalculationObject(this.OHFormGroup.controls, costOverHeadProfitDto);
    const percentageResult = this._toolingCalculator.calculateOVHCost(this.costSummaryViewData, this.medOverHeadProfitData, colorField, costOverHeadProfitDto, this.costOverHeadProfitobj);
    const costResult = this._toolingCalculator.toolingSharedCalculatorService.getAndSetData(
      this.costSummaryViewData,
      this.currentPart?.eav,
      this.currentPart?.lotSize,
      this.currentPart?.paymentTermId,
      percentageResult
    );
    this.OHFormGroup.patchValue(this._toolingMapper.ohMapper.ohCostPatchResult(percentageResult, costResult));
    const total = costResult.mohCost + costResult.fohCost + costResult.sgaCost + costResult.warrentyCost;
    this.OHFormGroup.controls['OverheadandProfitAmount'].patchValue(this.sharedService.isValidNumber(total));
  }

  public bulkUpdateTooling(): Observable<CostToolingDto> {
    let tool = new CostToolingDto();
    this.totToolingMaterialWeight = 0;
    this.recalculate = false;
    let oldTOolNameId = 0;
    if (this.selectedToolId > 0 && this.toolInfoList?.length > 0) {
      oldTOolNameId = this.toolInfoList?.find((x) => x.toolingId == this.selectedToolId)?.toolingNameId;
      tool = this.toolInfoList?.find((x) => x.toolingId == this.selectedToolId);
    }
    const contry = this.toolingFormGroup.controls['sourceCountryId'].value;
    tool.sourceCountryId = contry ? contry?.countryId : 0;
    tool = { ...tool, ...this._toolingMapper._toolingInfoMapper.bulkUpdateToolingModel(this.toolingFormGroup, this.conversionValue, this.isEnableUnitConversion) };
    // let lifeInParts = Math.min(this.currentPart.lifeTimeQtyRemaining, tool.toolLifeInParts);
    tool.toolingMasterData = this.ToolingMasterData;
    if (this.selectedToolId > 0 && (this.toolingMaterialInfoList?.length == 0 || this.toolingProcessInfoList?.length == 0 || this.toolingBOPInfoList?.length == 0)) {
      // if (this.toolingMaterialInfoList?.length == 0) {
      if (this.toolingMaterialInfoList?.length == 0 && this._toolConfig.addNewFlags.isNewTool) {
        tool.toolingMaterialInfos = this.getAllDefaultMaterialEntriesForTooling(tool);
        let materialCost = 0;
        tool.toolingMaterialInfos?.forEach((material) => {
          materialCost += this.sharedService.isValidNumber(material.totalRawMaterialCost);
        });
        tool.totalSheetCost = this.sharedService.isValidNumber(Number(materialCost));
      }
      if (this.toolingProcessInfoList?.length == 0) {
        tool.toolingProcessInfos = this.getAllDefaultProcessEntriesForTooling(tool);
      }
      if (this.toolingBOPInfoList?.length == 0) {
        tool.bopCostTooling = this.getAllDefaultBOPEntriesForTooling(tool);
      }
      tool = this._toolingHelper.setMaterialDetails(tool, this.toolingFormGroup.controls, this.conversionValue, this.isEnableUnitConversion, this._toolConfig.commodity);
    } else if (oldTOolNameId != tool.toolingNameId) {
      tool.toolingMaterialInfos = this.getAllDefaultMaterialEntriesForTooling(tool);
      let materialCost = 0;
      tool.toolingMaterialInfos?.forEach((material) => {
        materialCost += this.sharedService.isValidNumber(material.totalRawMaterialCost);
      });
      tool.totalSheetCost = this.sharedService.isValidNumber(Number(materialCost));
      tool.toolingProcessInfos = this.getAllDefaultProcessEntriesForTooling(tool);
      tool.bopCostTooling = this.getAllDefaultBOPEntriesForTooling(tool);
      tool = this._toolingHelper.setMaterialDetails(tool, this.toolingFormGroup.controls, this.conversionValue, this.isEnableUnitConversion, this._toolConfig.commodity);
    } else if (this.selectedToolId > 0 && this.toolingMaterialInfoList?.length > 0 && this.toolingProcessInfoList?.length > 0 && this.toolingBOPInfoList?.length > 0) {
      tool = this.setAllSubsectionChangeDetails(tool);
      tool = this._toolingHelper.setMaterialDetails(tool, this.toolingFormGroup.controls, this.conversionValue, this.isEnableUnitConversion, this._toolConfig.commodity);
    }
    tool.toolingCost = this._toolingHelper.setTotalperCost(tool, this.currentPart.commodityId);
    let bopCost = 0;
    tool?.bopCostTooling?.forEach((bop) => {
      bopCost += this.sharedService.isValidNumber(bop.totalProcessCost);
    });
    if (this._toolConfig.commodity.isInjMoulding) {
      // let subsequentToolCost = bopCost;
      // const toolcpstist = tool?.toolingMaterialInfos.filter((element) => this._toolConfig.mouldDescriptionIds.includes(element.moldDescriptionId));
      // toolcpstist?.forEach((mat) => {
      //   subsequentToolCost += this.sharedService.isValidNumber(mat?.totalRawMaterialCost);
      // });
      // let totalMouldBaseMaterialCost = 0;
      // const toolcpstists = tool?.toolingMaterialInfos.filter((element) => !this._toolConfig.mouldDescriptionIds.includes(element.moldDescriptionId));
      // toolcpstists?.forEach((mat) => {
      //   totalMouldBaseMaterialCost += this.sharedService.isValidNumber(mat?.totalRawMaterialCost);
      // });
      // subsequentToolCost += totalMouldBaseMaterialCost * 0.2;
      // const processCall = tool?.toolingProcessInfos.filter((element) => {
      //   return element.processGroupId === IMProcessGroup.MachineOperations || element.processGroupId === IMProcessGroup.TextureCost;
      // });
      // processCall?.forEach((mat) => {
      //   subsequentToolCost += this.sharedService.isValidNumber(mat?.totalProcessCost);
      // });
      // const processCall2 = tool?.toolingProcessInfos.filter((element) => element.processGroupId === IMProcessGroup.Validation);
      // processCall2?.forEach((mat) => {
      //   subsequentToolCost += this.sharedService.isValidNumber(mat?.totalProcessCost) * 0.5;
      // });
      // tool.subsequentToolCost = tool.noOfSubsequentTool > 0 ? subsequentToolCost * tool.noOfSubsequentTool : 0;
      tool.subsequentToolCost = this._toolingCalculator.calculateSubsequentToolCost(tool, bopCost, this._toolConfig.mouldDescriptionIds, true);
    } else {
      tool.subsequentToolCost = 0;
    }
    // tool.toolCostPerPart = this.sharedService.isValidNumber((Number(tool.toolingCost) + Number(tool.subsiquentToolCost)) / Number(lifeInParts));
    tool.toolCostPerPart = this.sharedService.isValidNumber(Number(tool.toolingCost) / Number(this.currentPart.lifeTimeQtyRemaining));
    tool.partInfoId = this.currentPart.partInfoId;
    tool.projectInfoId = this.currentPart.projectInfoId;
    this.saveColoringInfo();
    tool.toolingMasterData = [];
    // this._store.dispatch(new ToolingInfoActions.BulkUpdateToolingInfo(tool, this.currentPart?.partInfoId));
    this.toolingInfoSignalsService.bulkUpdateToolingInfo(tool, this.currentPart?.partInfoId);
    this.messaging.openSnackBar(`Data saved successfully.`, '', { duration: 5000 });
    this._toolConfig.addNewFlags.isNewTool = false;
    if (this.toolInfoList.length > 0 && tool.toolingId) {
      this.toolInfoList = [...this.toolInfoList.filter((x) => x.toolingId != tool.toolingId), tool];
      this.toolIdToNameConversion();
    }
    return new Observable((obs) => {
      obs.next(tool);
    });
  }

  private handleToolingRecalculation() {
    this.costSummarySignalsService._recalculationUpdateSignalsService.setBulkToolingUpdateLoading(true);
    this.messaging.openSnackBar(`Recalculation completed for Tooling Section.`, '', { duration: 5000 });
    this.blockUiService.popBlockUI('tooling recalculate');
    this.recalculationCompletedEvent.emit(this.toolingData.currentPart);
    const recalculationFlags = {
      isSupplierCountryChanged: false,
      isCountryChanged: false,
      complexityChanged: false,
      surfaceFinishChanged: false,
      isToollifeChanged: false,
      lifeTimeRemainingChange: false,
    };
    Object.assign(this.changeFlags, recalculationFlags);
  }

  onBOPActionEmitterReceived(event: any) {
    const { type, data } = event;
    type === 'delete' && (this.selectedToolBopId = data.selectedToolBopId);
    if (type === 'edit') {
      this.selectedBop = data.selectedBop;
      this.selectedToolBopId = data.selectedToolBopId;
    } else if (type === 'add') {
      this.selectedToolBopId = data.selectedToolBopId;
    }
  }

  onOHActionEmitterReceived(event: any) {
    const { type } = event;
    type === 'saveColoringInfo' && this.saveColoringInfo();
  }

  onProcessActionEmitterReceived(event: any) {
    const { type, data } = event;
    type === 'add' && (this.selectedToolProcessId = data.selectedToolProcessId);
    type === 'delete' && (this.selectedToolProcessId = data.selectedToolProcessId);
    if (type === 'edit') {
      this.selectedProcess = data.selectedProcess;
      this.selectedToolProcessId = data.selectedToolProcessId;
    }
  }

  onMaterialActionEmitterReceived(event: any) {
    const { type, data } = event;
    type === 'add' && (this.selectedToolMaterialId = data.selectedToolMaterialId);
    type === 'onMoldDescription' && this.onMoldDescription(event.data);
    type === 'onMaterialFamilyChange' && (this.materialDescriptionList = data.materialDescriptionList);
    type === 'calculateMoldCost' && this.calculateMoldCost();
    type === 'mapOnGroupChange' && (this.materialTypeList = data.materialTypeList);
    type === 'setEntry' && (this.selectedToolMaterialId = data.selectedToolMaterialId);
    type === 'dirtyTouchCheckProperty' && this.dirtyTouchCheckProperty(data.toolingFieldColorsList, data.formGroup);
    if (type === 'edit') {
      this.selectedMaterial = data.selectedMaterial;
      this.selectedToolMaterialId = data.selectedToolMaterialId;
      this.mouldid = +data.mouldid;
      this.toolingFieldColorsList = data.toolingFieldColorsList;
    } else if (type === 'delete') {
      this.selectedToolMaterialId = data.selectedToolMaterialId;
      this.toolingMaterialInfoList = data.toolingMaterialInfoList;
      if (this.toolingMaterialInfoList.length === 0) {
        this.coreMaterialInfoList = [];
        this.mouldMaterialInfoList = [];
        this.electrodeMaterialInfoList = [];
        this.otherMaterialInfoList = [];
        this.diePunchMaterialInfoList = [];
      }
    }
  }

  onToolingInfoActionEmitterReceived(event: any) {
    const { type, data } = event;
    type === 'calculateMaterialCost' && this.calculateMaterialCost();
    type === 'clearToolingInfo' && this.clearToolingInfo();
    type === 'clearAll' && this.clearAll();
    type === 'onEditToolInfo' && this.onEditToolInfo(data);
    type === 'changeComplexity' && (this.changeFlags.complexityChanged = data.complexityChanged);
    type === 'changeSurface' && (this.changeFlags.surfaceFinishChanged = data.surfaceFinishChanged);
    type === 'deleteSelectedToolId' && (this.selectedToolId = data.selectedToolId);
    if (type === 'getLaborRateBasedOnCountry') {
      this.changeFlags.isCountryChanged = data.IsCountryChanged;
      this.getLaborRateBasedOnCountry(data.sourceCountryId);
    } else if (type === 'delete') {
      this.toolInfoList = data.toolInfoList;
      this.showMaterialProcessSection = data.showMaterialProcessSection;
    }
  }

  getLaborRateBasedOnCountry(countryId: number) {
    if (countryId > 0) {
      const month = this.currentMarketMonth ?? this.selectedProject?.marketMonth ?? this.sharedService.getMarketMonth(this.selectedProject.marketQuarter);
      this.laborService
        .getLaborRatesByCountry(countryId, month)
        .pipe(take(1))
        .subscribe((result: any) => {
          if (result && result?.length > 0) {
            const countryRates = this.costToolingRecalculationService.supplierRegionCheck(result, this.toolingData?.currentPart.supplierRegionId);
            this._toolConfig.laborRate.skilledRate = countryRates.laborSkilledCost;
            this._toolConfig.laborRate.lowSkilledRate = countryRates.laborLowSkilledCost;
            this._toolConfig.laborRate.skilledLaborRate = countryRates.laborSkilledCost;
          }
        });
    }
  }

  setAllSubsectionChangeDetails(costTooling: CostToolingDto) {
    this.toolingMaterialInfoList = this._toolingHelper.updateToolingMaterials(
      costTooling,
      this.selectedToolId,
      this.selectedToolMaterialId,
      this.materialFormGroup,
      this.conversionValue,
      this.isEnableUnitConversion,
      this.toolingMaterialInfoList,
      this.costingToolingRecalculationService.moldItemDescsriptionsList
    );
    this.toolingProcessInfoList = this._toolingHelper.updateToolingProcess(
      costTooling,
      this.selectedToolId,
      this.selectedToolProcessId,
      this.processFormGroup,
      this.toolingProcessInfoList,
      this.currentPart.commodityId
    );
    this.toolingBOPInfoList = this._toolingHelper.updateBopCostTooling(
      costTooling,
      this.selectedToolId,
      this.selectedToolBopId,
      this.bopFormGroup,
      this.toolingBOPInfoList,
      this.currentPart.commodityId
    );
    this._toolingHelper.updateCostOverHeadProfit(costTooling, this.selectedToolId, this.OHFormGroup, this.currentPart);
    return costTooling;
  }

  ngOnDestroy(): void {
    this.unsubscribeAll$.next(undefined);
    this.unsubscribeAll$.complete();
    this.recalculationCompletedSubscription && this.recalculationCompletedSubscription.unsubscribe();
    this.materialInfoEffect.destroy();
    this.processInfoEffect.destroy();
    this.toolingRecalculationEffect.destroy();
  }
}
