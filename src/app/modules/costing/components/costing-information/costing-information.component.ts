import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild, effect } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { Observable, Subject, Subscription, timer } from 'rxjs';
import { LaborRateMasterDto, MaterialInfoDto, PartInfoDto, ProcessInfoDto, ProjectInfoDto } from 'src/app/shared/models';
import { CostingManufacturingInformationComponent } from '../costing-manufacturing-information/costing-manufacturing-information.component';
import { CostingMaterialInformationComponent } from '../costing-material-information/costing-material-information.component';
import { CostingOverheadProfitComponent } from '../costing-overhead-profit/costing-overhead-profit.component';
import { CostingPackagingInformationComponent } from '../costing-packaging-information/costing-packaging-information.component';
import { CostingPartInformationComponent } from '../costing-part-information/costing-part-information.component';
import { CostingPurchasedCataloguePartInformationComponent } from '../costing-purchased-catalogue-part-information/costing-purchased-catalogue-part-information.component';
import { CostingSecondaryProcessComponent } from '../costing-secondary-process/costing-secondary-process.component';
import { LogisticsSummaryComponent } from '../logistics-summary/logistics-summary.component';
import { DirtyModel } from 'src/app/models/dirtymodel';
import { ConfirmationDialogConfig, MessagingService } from 'src/app/messaging/messaging.service';
import { CommodityType } from '../../costing.config';
import { NotSavedService } from 'src/app/services/not-saved.service';
import { Store } from '@ngxs/store';
// import { PartInfoState } from 'src/app/modules/_state/part-info.state';
// import * as PartInfoActions from 'src/app/modules/_actions/part-info.action';
// import { takeUntil } from 'rxjs/operators';
import { DutiesAndTariffComponent } from '../duties-and-tariff/duties-and-tariff.component';
import { SpendClassificationComponent } from '../spend-classification/spend-classification.component';
// import * as CostSummaryActions from 'src/app/modules/_actions/cost-summary.action';
// import * as CommentFieldActions from 'src/app/modules/_actions/comment-field.action';
import { AiSearchService, ApiCacheService, MaterialMasterService } from 'src/app/shared/services';
import { CostingToolingInfoComponent } from '../costing-tooling-Info/costing-tooling-info/costing-tooling-info.component';
import { SharedService } from '../../services/shared.service';
import { UndoRedoService } from '../../services/undo-redo.service';
import { PcbBoarddetailsComponent } from '../pcb-boarddetails/pcb-boarddetails.component';
import { SustainabilityComponent } from '../sustainability/sustainability.component';
import { PackagingInfoDto } from 'src/app/shared/models/packaging-info.model';
import { LogisticsSummaryDto } from 'src/app/shared/models/logistics-summary.model';
import { MetaDataModel } from 'src/app/shared/models/metaDataModel';
// import { Basic3dViewer } from '../cad-viewer-popup/Common/basic3dviewer';
// import { BaseExample } from '../cad-viewer-popup/Common/BaseExample';
import { ToolingOverheadInfoComponent } from '../costing-tooling-Info/tooling-overhead-info/tooling-overhead-info.component';
import { DigitalFactoryHelper } from '../../services/digital-factory-helper';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import moment, { Moment } from 'moment';
// import { MaterialInfoState } from 'src/app/modules/_state/material-info.state';
import { CommonModule, formatDate } from '@angular/common';
import { ProgressBarComponent } from 'src/app/shared/components';
import { CostingSupportingDocumentsComponent } from '../costing-supporting-documents/costing-supporting-documents.component';
import { CostingDfmComponent } from '../app-costing-dfm/app-costing-dfm.component';
import { CostingPcbContainerComponent } from '../costing-pcb-container/costing-pcb-container.component';
import { MatIconModule } from '@angular/material/icon';
import * as MasterDataActions from 'src/app/modules/_actions/master-data.action';
import { UserInfoService } from 'src/app/shared/services/user-info-service';
import { ProjectScenarioDto } from 'src/app/shared/models/Project-Scenario.model';
import { MaterialInfoSignalsService } from 'src/app/shared/signals/material-info-signals.service';
// import * as BomActions from 'src/app/modules/_actions/bom.action';
// Uncomment below code while integration
// import { VersionHistoryComponent } from '../version-history/version-history.component';
import { BomInfoSignalsService } from 'src/app/shared/signals/bom-info-signals.service';
import { PartInfoSignalsService } from 'src/app/shared/signals/part-info-signals.service';
import { CostSummarySignalsService } from 'src/app/shared/signals/cost-summary-signals.service';
import { CommentFieldSignalsService } from 'src/app/shared/signals/comment-field-signals.service';

@Component({
  selector: 'app-costing-information',
  templateUrl: './costing-information.component.html',
  styleUrls: ['./costing-information.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ProgressBarComponent,
    CostingPartInformationComponent,
    CostingSupportingDocumentsComponent,
    CostingMaterialInformationComponent,
    CostingManufacturingInformationComponent,
    CostingToolingInfoComponent,
    CostingDfmComponent,
    CostingSecondaryProcessComponent,
    CostingPurchasedCataloguePartInformationComponent,
    PcbBoarddetailsComponent,
    CostingPcbContainerComponent,
    PcbBoarddetailsComponent,
    CostingOverheadProfitComponent,
    CostingPackagingInformationComponent,
    LogisticsSummaryComponent,
    DutiesAndTariffComponent,
    SpendClassificationComponent,
    SustainabilityComponent,
    MatExpansionModule,
    MatIconModule,
    MatDatepickerModule,
    // VersionHistoryComponent,
  ],
})
export class CostingInformationComponent implements OnInit, OnChanges, OnDestroy {
  @Input() selectedProject: ProjectInfoDto;
  @Input() selectedProjectId: number;
  @Input() selectedPartId: number;
  @Input() bomQty: number;
  @Input() bomId: number;
  @Input() isCostSummarydirty: boolean;
  @Input() projectInfoList: ProjectInfoDto[];
  @Input() selectedScenario: ProjectScenarioDto;
  hideDom = true;
  currentUser: any;
  private userInfoService = inject(UserInfoService);
  sustainabilityBomId: number;
  public metaDataModel: MetaDataModel;
  bomAnalysisDirtyCheck: boolean = false;
  showDFM = true;
  isCommodityTesting = false;
  currentSelectedPartId: number;
  currentbomQty: number;
  isPlasticDisplay = false;
  isPCADisplay = false;
  isWiringHarness = false; //to show BOM and manufacturing Info accordian combinations
  isPCB = false;
  isElectronics = false;
  isPackingLogisticSectionDisplay = false;
  dirtyCheck = false;
  canUpdate = false;
  // partCommodityChanges = false;
  reextractionLoaderChanges = false;
  currentCommodityId = 0;
  documentCollectionId = 0;
  partDto: PartInfoDto;
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  hasUnsavedEventSub$: Subscription = Subscription.EMPTY;
  hasProjectChangeEventSub$: Subscription = Subscription.EMPTY;
  @ViewChild(MatAccordion) accordion: MatAccordion;

  // _partInfo$: Observable<PartInfoDto>;
  _materialInfo$: Observable<MaterialInfoDto[]>;
  @Output() azureFileSharedEmiiter = new EventEmitter<string>();
  automationSubject: Subject<MaterialInfoDto> = new Subject();
  manufactureDataCheckSubject: Subject<ProcessInfoDto[]> = new Subject();
  @Output() dynamicComponentRegistered = new EventEmitter<{ componentName: string; formName: string; loadTime?: number }>();

  @Output() submissionTriggered = new EventEmitter<string>();
  @Output() commodityChange = new EventEmitter<number>();
  @Output() canUpdateChange = new EventEmitter<boolean>();
  readonly projectDate = new FormControl(moment());
  reCalculateMaterialCostSubject: Subject<PartInfoDto> = new Subject();
  reCalculateProcessSubject: Subject<any> = new Subject();
  reCalculateToolingSubject: Subject<ProcessInfoDto[]> = new Subject();
  reCalculatePackagingSubject: Subject<PartInfoDto> = new Subject();
  reCalculateSecondarySubject: Subject<PartInfoDto> = new Subject();
  reCalculateOverheadProfitSubject: Subject<PartInfoDto> = new Subject();
  reCalculateLogisticSubject: Subject<PartInfoDto> = new Subject();
  reCalculateDutiesTariffSubject: Subject<PartInfoDto> = new Subject();
  reCalculatePurchaseSubject: Subject<any> = new Subject();
  countryChangeSubject: Subject<any> = new Subject();
  lifetimeremainingChangeSubject: Subject<any> = new Subject();
  partComplexityChangeSubject: Subject<PartInfoDto> = new Subject();
  reCalculateBomSubject: Subject<PartInfoDto> = new Subject();
  saveManufactureExecuting = false;
  pendingPackagingEvent: any;
  dutiesTariffPanelOpened = false;
  spendClassificationPanelOpened = false;
  private materialInfoEffect = effect(() => {
    this.getMaterialInfo(this.materialInfoSignalService.materialInfos());
  });
  private partInfoEffect = effect(() => {
    this.getPartDetailsById(this.partInfoSignalsService.partInfo());
  });

  constructor(
    private messaging: MessagingService,
    private notSavedService: NotSavedService,
    private _store: Store,
    public sharedService: SharedService,
    public undoRedoService: UndoRedoService,
    private _apiCacheService: ApiCacheService,
    private digitalFactoryHelper: DigitalFactoryHelper,
    private readonly aiSearchService: AiSearchService,
    private materialMasterService: MaterialMasterService,
    private materialInfoSignalService: MaterialInfoSignalsService,
    private bomInfoSignalsService: BomInfoSignalsService,
    private partInfoSignalsService: PartInfoSignalsService,
    private costSummarySignalsService: CostSummarySignalsService,
    private commentFieldSignalsService: CommentFieldSignalsService
  ) {
    // this._partInfo$ = this._store.select(PartInfoState.getPartInfo);
    // this._materialInfo$ = this._store.select(MaterialInfoState.getMaterialInfos);
  }
  @ViewChild(CostingPartInformationComponent) costPartComponent: CostingPartInformationComponent;
  @ViewChild(CostingMaterialInformationComponent) materialInfoComponent: CostingMaterialInformationComponent;
  @ViewChild(CostingManufacturingInformationComponent) costManufacturingComponent: CostingManufacturingInformationComponent;
  @ViewChild(CostingSecondaryProcessComponent) costSecondaryProcessComponent: CostingSecondaryProcessComponent;
  @ViewChild(CostingToolingInfoComponent) costToolingComponent: CostingToolingInfoComponent;
  @ViewChild(ToolingOverheadInfoComponent) ohComponent: ToolingOverheadInfoComponent;
  @ViewChild(CostingPurchasedCataloguePartInformationComponent) purchasedCatalougeComponent: CostingPurchasedCataloguePartInformationComponent;
  @ViewChild(CostingOverheadProfitComponent) overHeadProfitComponent: CostingOverheadProfitComponent;
  @ViewChild(CostingPackagingInformationComponent) packageInfoComponent: CostingPackagingInformationComponent;
  @ViewChild(LogisticsSummaryComponent) logisticsComponent: LogisticsSummaryComponent;
  @ViewChild(DutiesAndTariffComponent) dutiesAndTariffComponent: DutiesAndTariffComponent;
  @ViewChild(SpendClassificationComponent) spendClassificationComponent: SpendClassificationComponent;
  @ViewChild(SustainabilityComponent) sustainabilityComponent: SustainabilityComponent;
  @ViewChild(PcbBoarddetailsComponent) pcbBoarddetailsComponent: PcbBoarddetailsComponent;

  partCompletionPercentage: string = '0';
  materialCompletionPercentage: string = '0';
  manufacturingCompletionPercentage: string = '0';
  esgImpactCO2Kg: any = 0;
  secondaryCompletionPercentage: string = '0';
  purchasedCompletionPercentage: string = '0';
  overheadCompletionPercentage: string = '0';
  packageCompletionPercentage: string = '0';
  logisticsCompletionPercentage: string = '0';
  dutiesTariffCompletionPercentage: string = '0';
  spendClassificationCompletionPercentage: string = '0';
  sustainabilityCompletionPercentage: string = '0';
  partDirtyCheck: boolean = false;
  materialDirtyCheck: boolean = false;
  sustainabilityMaterialDirtyCheck: boolean = false;
  manufacturingDirtyCheck: boolean = false;
  sustainabilityManufacturingDirtyCheck: boolean = false;
  sustainabilityPackageDirtyCheck: boolean = false;
  secondaryDirtyCheck: boolean = false;
  purchasedDirtyCheck: boolean = false;
  overheadDirtyCheck: boolean = false;
  packageDirtyCheck: boolean = false;
  logisticsDirtyCheck: boolean = false;
  dutiesTariffDirtyCheck: boolean = false;
  spendClassificationDirtyCheck: boolean = false;
  sustainabilityDirtyCheck: boolean = false;
  toolingDirtyCheck: boolean = false;
  countryChanged: boolean = false;
  lifetimeremainingChanged: boolean = false;

  secondaryExpanded = false;
  purchasedExpanded = false;
  overheadExpanded = false;
  packageExpanded = false;
  logisticsExpanded = false;
  dutiesTarifExpanded = false;
  spendClassificationExpanded = false;
  sustainabilityEesxpanded = false;
  toolingExpanded = false;
  dfmExpanded = false;
  bomAnalysisExpanded = false;
  conversionCostExpanded = false;
  recalculateNeeded: boolean = false;
  isMandatoryFieldsMissing: boolean = false;
  // progressBarMode = 'determinate';
  progressBarMode = 'donut';

  selectedMaterialInfoOut: MaterialInfoDto;
  listMaterialInfoOut: MaterialInfoDto[];
  processInfoDtoOut: ProcessInfoDto;
  listProcessInfoDtoOut: ProcessInfoDto[];
  laborRateInfoDtoOut: LaborRateMasterDto[];
  logisticsSummaryDtoOut: LogisticsSummaryDto;
  packagingInfoDto: PackagingInfoDto;
  formprocessInfoDto: ProcessInfoDto;
  message = '';
  reExtractedPartId = [];
  minDate = new Date();
  maxDate = new Date();

  ngOnChanges(changes: SimpleChanges) {
    if (changes['bomQty'] && changes['bomQty'].currentValue != changes['bomQty'].previousValue) {
      // this.partCommodityChanges = false;
      // this.reextractionLoaderChanges = false;
      this.clearDirtyflag();
    }
    if (changes['selectedPartId'] && changes['selectedPartId'].currentValue > 0 && changes['selectedPartId'].currentValue != changes['selectedPartId'].previousValue) {
      this.recalculateNeeded = false;
      this._apiCacheService.removeCache('ALL');
      this.currentSelectedPartId = +changes['selectedPartId'].currentValue;
      if (this.currentSelectedPartId > 0) {
        // this._store.dispatch(new PartInfoActions.GetPartInfo(this.currentSelectedPartId));
        this.partInfoSignalsService.getPartInfo(this.currentSelectedPartId);
        this.costSummarySignalsService.getCostSummaryByPartInfoId(this.currentSelectedPartId);
        this.commentFieldSignalsService.getCommentFieldCountByPartInfoId(this.currentSelectedPartId);
        this.getPercentageCompletionForPart();
      }
    }
  }

  setMonthAndYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.projectDate.value ?? moment();
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    this.projectDate.setValue(ctrlValue);
    const mon = (this.projectDate.value.month() + 1).toString().padStart(2, '0');
    const year = this.projectDate.value.year();
    this._store.dispatch(new MasterDataActions.GetMarketMonth(mon + year.toString()));
    datepicker.close();
  }

  private getPercentageCompletionForPart() {
    this.secondaryExpanded = false;
    this.purchasedExpanded = false;
    this.overheadExpanded = false;
    this.packageExpanded = false;
    this.logisticsExpanded = false;
    this.dutiesTarifExpanded = false;
    this.spendClassificationExpanded = false;
    this.toolingExpanded = false;
    this.dfmExpanded = false;
    this.bomAnalysisExpanded = false;
    this.conversionCostExpanded = false;
    this.sustainabilityEesxpanded = false;
  }

  private loadAllSections() {
    if (this.materialCompletionPercentage && this.manufacturingCompletionPercentage) {
      this.secondaryExpanded = true;
      this.purchasedExpanded = true;
      this.overheadExpanded = true;
      this.packageExpanded = true;
      this.logisticsExpanded = true;
      this.dutiesTarifExpanded = true;
      this.spendClassificationExpanded = true;
      this.toolingExpanded = true;
      this.dfmExpanded = true;
      this.bomAnalysisExpanded = true;
      this.conversionCostExpanded = true;
      this.sustainabilityEesxpanded = true;
    }
  }

  getMaterialInfo(result: MaterialInfoDto[]) {
    // this._materialInfo$.pipe(takeUntil(this.unsubscribe$)).subscribe((result: MaterialInfoDto[]) => {
    if (result?.length > 0 && this.costPartComponent?.currentPart?.partInfoId == result[0].partInfoId && this.costPartComponent?.currentPart?.mfrCountryId && result[0].materialMarketId > 0) {
      this.materialMasterService.getAvailableDataRangeByMaterialMasterIdCountryIdAsync(this.costPartComponent?.currentPart?.mfrCountryId, result[0].materialMarketId).subscribe((x) => {
        if (x && x.length === 2) {
          const first = x[0];
          const last = x[1];
          this.minDate = new Date(+first.slice(2), +first.slice(0, 2) - 1, 1);
          this.maxDate = new Date(+last.slice(2), +last.slice(0, 2) - 1, 1);
        }
      });
    }
    // });
  }

  ngOnInit(): void {
    this.userInfoService.getUserValue().subscribe((user) => {
      this.currentUser = user;
    });
    this.sharedService.getWorkflowStatus().subscribe((status) => {
      if (this.currentUser.roleId === 1) {
        this.canUpdate = true;
      } else if (!status) {
        this.canUpdate = false;
      } else {
        this.canUserUpdate();
      }
      this.canUpdateChange.emit(this.canUpdate);
      this._store.dispatch(new MasterDataActions.GetCanUserUpdateCosting(this.canUpdate));
    });
    this.sustainabilityBomId = this.bomId;
    // this.partCommodityChanges = false;
    // this.reextractionLoaderChanges = false;
    // this.getPartDetailsById();
    //this.listenNotSavedEvents();
    this.listenProjectChange();
    this.clearDirtyflag();
    // this.getMaterialInfo();
    let marketMonth = this.selectedProject?.marketMonth;
    if (!marketMonth) {
      marketMonth = this.sharedService.getMarketMonth(this.selectedProject?.marketQuarter);
    }
    const mon = +marketMonth.slice(0, 2) - 1;
    const year = +marketMonth.slice(2);
    const monValue = moment();
    monValue.month(mon);
    monValue.year(year);
    this.projectDate.setValue(monValue);
  }

  canUserUpdate() {
    this.canUpdate =
      this.sharedService.hasSameGroup(this.selectedProject?.createdUserId, this.currentUser?.userId) ||
      this.currentUser?.userId === this.selectedProject?.createdUserId ||
      this.selectedProject?.projectUserDtos?.find((x) => x.userId === this.currentUser?.userId) !== undefined;
  }
  private clearDirtyflag() {
    this.partDirtyCheck = false;
    this.materialDirtyCheck = false;
    this.manufacturingDirtyCheck = false;
    this.secondaryDirtyCheck = false;
    this.purchasedDirtyCheck = false;
    this.overheadDirtyCheck = false;
    this.packageDirtyCheck = false;
    this.logisticsDirtyCheck = false;
    this.dutiesTariffDirtyCheck = false;
    this.toolingDirtyCheck = false;
    this.isCostSummarydirty = false;
    this.bomAnalysisDirtyCheck = false;
    this.dirtyCheck = false;
  }

  private reset() {
    this.isPlasticDisplay = false;
    this.isCommodityTesting = false;
    this.isPCADisplay = false;
    this.isWiringHarness = false;
    this.currentCommodityId = 0;
    this.isPackingLogisticSectionDisplay = false;
    this.partDto = {} as PartInfoDto;
    this.isPCB = false;
    this.isElectronics = false;
  }

  private getPartDetailsById(result: PartInfoDto) {
    // this._partInfo$.pipe(takeUntil(this.unsubscribe$)).subscribe(
    // (result: PartInfoDto) => {
    this.partDto = { ...result };
    this.partDto.documentCollectionDto = !this.partDto.documentCollectionDto?.deleted ? this.partDto.documentCollectionDto : undefined;

    this.setCommodityFlags(this.partDto.commodityId);
    if (result) {
      this.azureFileSharedEmiiter.emit(result?.azureFileSharedId);
    }
    // this.digitalFactoryHelper.setDigitalFactoryInfo(this.partDto.supplierInfoId);
    // },
    //   (error) => {
    //     console.error(error);
    //   };
    // );
  }

  onCommodityChange(commodityId: number) {
    this.currentCommodityId = commodityId;
    this.setCommodityFlags(commodityId);
    this.commodityChange.emit(commodityId);
  }

  setCommodityFlags(commodityId: number) {
    this.isPlasticDisplay = [
      CommodityType.PlasticAndRubber,
      CommodityType.SheetMetal,
      CommodityType.Casting,
      CommodityType.MetalForming,
      CommodityType.Testing,
      CommodityType.StockMachining,
      CommodityType.Assembly,
      CommodityType.Electricals,
      CommodityType.PCBAQuickCosting,
      CommodityType.PrintedCircuitBoard,
    ].includes(commodityId);
    this.isCommodityTesting = commodityId == CommodityType.Testing;
    this.isPCADisplay = [CommodityType.PCBAQuickCosting].includes(commodityId);
    this.isWiringHarness = [CommodityType.WiringHarness].includes(commodityId);
    this.isPCB = [CommodityType.PCBAQuickCosting, CommodityType.PrintedCircuitBoard].includes(commodityId);
    this.showDFM = [CommodityType.SheetMetal, CommodityType.StockMachining].includes(commodityId);
    this.isElectronics = [CommodityType.Electronics].includes(commodityId);
  }

  onPartChange(partDto: PartInfoDto) {
    this.partDto = { ...partDto };
  }

  onPackingChange(packingId: number) {
    this.isPackingLogisticSectionDisplay = false;
    if (packingId == 2) {
      this.isPackingLogisticSectionDisplay = true;
    }
  }

  ngOnDestroy() {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
    this.materialInfoEffect.destroy();
    this.partInfoEffect.destroy();
  }

  checkIfChildComponentDirty() {
    const resultObj: DirtyModel = new DirtyModel();
    const blDirtyList: boolean[] = [];
    resultObj.dirtyItems = [];
    resultObj.isAnyChildDirty = false;
    if (this.costPartComponent != undefined) {
      if (this.costPartComponent.checkIfFormDirty()) {
        resultObj.dirtyItems.push('Part Information');
      }
      blDirtyList.push(this.costPartComponent.checkIfFormDirty());
      if (this.materialInfoComponent != undefined) {
        if (this.materialInfoComponent.checkIfFormDirty()) {
          resultObj.dirtyItems.push('Material Information');
          blDirtyList.push(this.materialInfoComponent.checkIfFormDirty());
        }
        blDirtyList.push(this.materialInfoComponent.checkIfFormDirty());
      }
      if (this.costManufacturingComponent != undefined) {
        if (this.costManufacturingComponent.checkIfFormDirty()) {
          resultObj.dirtyItems.push('Manufacturing Information');
          blDirtyList.push(this.costManufacturingComponent.checkIfFormDirty());
        }
      }
      if (this.costSecondaryProcessComponent != undefined) {
        if (this.costSecondaryProcessComponent.checkIfFormDirty()) {
          resultObj.dirtyItems.push('Secondary Process');
          blDirtyList.push(this.costSecondaryProcessComponent.checkIfFormDirty());
        }
      }
      if (this.purchasedCatalougeComponent != undefined) {
        if (this.purchasedCatalougeComponent.checkIfFormDirty()) {
          resultObj.dirtyItems.push('Purchased (Catalogue) Parts Information');
          blDirtyList.push(this.purchasedCatalougeComponent.checkIfFormDirty());
        }
      }
      if (this.overHeadProfitComponent != undefined) {
        if (this.overHeadProfitComponent.checkIfFormDirty()) {
          resultObj.dirtyItems.push('Overhead & Profit');
          blDirtyList.push(this.overHeadProfitComponent.checkIfFormDirty());
        }
      }

      if (this.packageInfoComponent != undefined) {
        if (this.packageInfoComponent.checkIfFormDirty()) {
          resultObj.dirtyItems.push('Packaging');
          blDirtyList.push(this.packageInfoComponent.checkIfFormDirty());
        }
      }
      if (this.logisticsComponent != undefined) {
        if (this.logisticsComponent.checkIfFormDirty()) {
          resultObj.dirtyItems.push('Logistics Cost');
          blDirtyList.push(this.logisticsComponent.checkIfFormDirty());
        }
      }
      resultObj.isAnyChildDirty = blDirtyList.some((element) => element === true);
    }
    return resultObj;
  }

  recalculateCost() {
    this._apiCacheService.removeCache('ALL', false);
    if (this.reextractionLoaderChanges && this.reExtractedPartId.includes(this.currentSelectedPartId)) {
      this.messaging.openSnackBar(this.message, '', { duration: 8000 });
      return;
    }
    this.recalculateNeeded = false;
    this.partDirtyCheck = this.costPartComponent && !this.costPartComponent.currentPart?.lotSize && !this.costPartComponent.currentPart?.prodLifeRemaining ? true : this.partDirtyCheck; // for the first time recalculation fix
    if (!!this.costPartComponent && this.partDirtyCheck) {
      this.costPartComponent.onFormSubmit().subscribe((currentPart) => {
        this.recalculateAllSections(currentPart);
      });
    } else {
      const currentPart = this.costPartComponent?.currentPart;
      this.recalculateAllSections(currentPart);
    }
    this.recalculateNeeded = this.isMandatoryFieldsMissing ? true : false;
    this.submissionTriggered.emit('recalculate');
  }

  recalculateAllSections(currentPart: PartInfoDto) {
    if (
      currentPart?.mfrCountryId > 0 &&
      currentPart?.deliveryCountryId > 0 &&
      currentPart?.intPartNumber &&
      currentPart?.commodityId > 0 &&
      currentPart?.eav > 0 &&
      currentPart?.lotSize > 0 &&
      currentPart?.prodLifeRemaining > 0
    ) {
      if ([CommodityType.WiringHarness].includes(currentPart?.commodityId)) {
        this.reCalculateBomSubject.next(currentPart);
      }
      if ([CommodityType.Electronics].includes(currentPart?.commodityId)) {
        this.reCalculateBomSubject.next(currentPart);
        //this.reCalculateMaterialCostSubject.next(currentPart);
      } else {
        this.reCalculateMaterialCostSubject.next(currentPart);
      }
      this.dirtyCheck = false;
    } else {
      const message = 'Please Fill All Mandatory Fields in Part Information Section Listed Below to Perform Recalculation.';
      const mandatoryFields = ['Internal Part Number', 'Catagory', 'Supplier Name', 'Delivery Site Name', 'Lot Size'];
      this.messaging.openSnackBar(message, '', { duration: 8000 }, mandatoryFields, true);
      this.isMandatoryFieldsMissing = true;
    }
  }

  saveFloatingData() {
    // update and save
    this._apiCacheService.removeCache('ALL');
    if (this.reextractionLoaderChanges && this.reExtractedPartId.includes(this.currentSelectedPartId)) {
      this.messaging.openSnackBar(this.message, '', { duration: 8000 });
      return;
    }
    if (
      this.partDirtyCheck ||
      this.materialDirtyCheck ||
      this.manufacturingDirtyCheck ||
      this.secondaryDirtyCheck ||
      this.purchasedDirtyCheck ||
      this.overheadDirtyCheck ||
      this.packageDirtyCheck ||
      this.logisticsDirtyCheck ||
      this.dutiesTariffDirtyCheck ||
      this.toolingDirtyCheck ||
      this.bomAnalysisDirtyCheck
    ) {
      this.recalculateNeeded = true;
    }
    // else {
    //   this.recalculateNeeded = false;
    // }

    if (this.costPartComponent != undefined && this.partDirtyCheck) {
      this.costPartComponent.onFormSubmit().subscribe((respdata) => {
        if (this.countryChanged) {
          setTimeout(() => {
            this.saveAllOtherSections();
            this.partComplexityChangeSubject.next(respdata);
          }, 1000);
        } else {
          this.saveAllOtherSections();
          this.partComplexityChangeSubject.next(respdata);
        }
      });
      this.dirtyCheck = false;
    } else {
      this.saveAllOtherSections();
    }

    // const container = document.getElementById('file-viewer');
    // container?.replaceChildren();
    // this.metaDataModel = { fileName: this.partDto.azureFileSharedId };

    // if (this.metaDataModel && this.metaDataModel?.fileName) {
    //   const baseExample = new BaseExample(new Basic3dViewer('file-viewer'), this._store);
    //   baseExample.initModelSelector(this.metaDataModel.fileName);
    // }
    // this.digitalFactoryHelper.setDigitalFactoryInfo(this.partDto.supplierInfoId);
    // this.aiSearchService.registerAttributeInfo(this.currentSelectedPartId).subscribe();
    this.submissionTriggered.emit('updateSave');
    // this._store.dispatch(new BomActions.GetBomsTreeByProjectId(this.selectedProjectId, this.selectedScenario.scenarioId || 0));
    this.bomInfoSignalsService.getBomTreeByProjectId(this.selectedProjectId, this.selectedScenario?.scenarioId || 0);
  }

  // onPartCommodityChangeEvent(isCommodityChanges: boolean) {
  //   this.partCommodityChanges = isCommodityChanges;
  // }

  reExtraction() {
    this._apiCacheService.removeCache('ALL');
    // if (this.costPartComponent != undefined && this.partCommodityChanges) {
    // this.reextractionLoaderChanges = this.partCommodityChanges;
    if (this.costPartComponent != undefined && this.reextractionLoaderChanges) {
      //this.buttonDisabled = true;
      this.reExtractedPartId.push(this.currentSelectedPartId);
      this.dirtyCheck = false;
      this.message = 'Data Extraction is in progress....';
      this.costPartComponent.reExtraction(this.currentSelectedPartId);
    }
  }

  reextractionLoaderChangesEvent(reExtractionStatus: { state: boolean; from: string; partInfoId: number; partName: string }) {
    // this.partCommodityChanges = isCommodityChanges;
    this.reextractionLoaderChanges = reExtractionStatus.state || this.reExtractedPartId.includes(this.currentSelectedPartId);
    if (['extractionCompleted', 'extractionFailed'].includes(reExtractionStatus.from)) {
      this.reExtractedPartId = this.reExtractedPartId.filter((id) => id !== reExtractionStatus.partInfoId);

      if (reExtractionStatus.from === 'extractionCompleted') {
        this.messaging.openSnackBar('Data Extraction Completed for ' + reExtractionStatus.partName, '', { duration: 5000 });
      } else if (reExtractionStatus.from === 'extractionFailed') {
        this.messaging.openSnackBar('Data Extraction Failed for ' + reExtractionStatus.partName + '. Please retry.', '', { duration: 5000 });
      }
      if (this.reExtractedPartId.length === 0) {
        this.message = '';
        this.messaging.openSnackBar('All Data Extraction Completed.', '', { duration: 5000 });
      }
      //   console.log('Reextraction ' + reExtractionStatus.from + ' for ', reExtractionStatus.partInfoId);
      // } else {
      //   console.log('Reextraction = ', this.reextractionLoaderChanges, ', Current Queue: ', this.reExtractedPartId, ', for', this.currentSelectedPartId);
    }
  }

  saveAllOtherSections() {
    if (this.materialInfoComponent != undefined && this.materialDirtyCheck) {
      // const materialProcessid = Number(this.materialInfoComponent.costingMaterialInfoform.controls['matPrimaryProcessName'].value);
      // const materialInfoId = Number(this.materialInfoComponent.costingMaterialInfoform.controls['materialInfoId'].value);
      // const commodityId = Number(this.costPartComponent.costingPartInfoform.controls['commdityvalue'].value);
      this.saveMaterialinfo();
      this.materialDirtyCheck = false;
      // if (materialProcessid > 0 || materialInfoId > 0) {
      //   this.saveMaterialinfo();
      //   this.materialDirtyCheck = false;
      // } else if (commodityId === CommodityType.Electronics) {
      //   //no process type needed.
      //   this.saveMaterialinfo();
      //   this.materialDirtyCheck = false;
      // }
    }

    if (!!this.pcbBoarddetailsComponent && this.bomAnalysisDirtyCheck) {
      this.saveBillOfMaterialInfo();
      this.bomAnalysisDirtyCheck = false;
    }

    if (this.costManufacturingComponent != undefined && this.manufacturingDirtyCheck) {
      const manufProcessid = Number(this.costManufacturingComponent.costingManufacturingInfoform.controls['processTypeID'].value);
      const processInfoId = Number(this.costManufacturingComponent.costingManufacturingInfoform.controls['processInfoId'].value);
      if (manufProcessid > 0 || processInfoId > 0) {
        this.saveManufature();
        this.manufacturingDirtyCheck = false;
      }
    }

    if (this.costToolingComponent != undefined && this.toolingDirtyCheck) {
      const toolingNameId = Number(this.costToolingComponent.toolingFormGroup.controls['toolingNameId'].value);
      const toolingId = Number(this.costToolingComponent.toolingFormGroup.controls['toolingId'].value);
      if ((toolingNameId > 0 || toolingId > 0) && this.toolingDirtyCheck) {
        this.saveTooling();
        this.toolingDirtyCheck = false;
      }
    }

    if (this.costSecondaryProcessComponent != undefined) {
      const secondaryProcessInfoId = Number(this.costSecondaryProcessComponent.costingSecProcessform.controls['Secondary_Process'].value);
      if (secondaryProcessInfoId > 0 && this.secondaryDirtyCheck) {
        this.saveSecondaryProcess();
        this.secondaryDirtyCheck = false;
      }
    }

    if (this.packageInfoComponent != undefined && this.packageDirtyCheck) {
      this.savePackageInfo();
      this.packageDirtyCheck = false;
    }
    if (this.purchasedCatalougeComponent != undefined && this.purchasedDirtyCheck) {
      if (this.purchasedDirtyCheck) {
        this.savepurchasedCatalouge();
        this.purchasedDirtyCheck = false;
      }
    }

    if (this.overHeadProfitComponent != undefined && this.overheadDirtyCheck) {
      this.saveoverHeadProfit();
      this.overheadDirtyCheck = false;
    }

    if (this.logisticsComponent != undefined && this.logisticsDirtyCheck) {
      this.saveLogistic();
      this.logisticsDirtyCheck = false;
    }

    if (this.dutiesAndTariffComponent != undefined && this.dutiesTariffDirtyCheck) {
      this.saveDuttiesTraffic();
      this.dutiesTariffDirtyCheck = false;
    }

    if (this.spendClassificationComponent != undefined && this.spendClassificationDirtyCheck) {
      this.saveSpendClassification();
      this.spendClassificationDirtyCheck = false;
    }

    if (this.sustainabilityComponent != undefined && this.sustainabilityDirtyCheck) {
      this.saveSustainability();
      this.sustainabilityDirtyCheck = false;
    }

    if (this.materialInfoComponent != undefined && this.sustainabilityMaterialDirtyCheck) {
      this.saveSustainabilityMaterial();
      this.sustainabilityMaterialDirtyCheck = false;
    }

    if (this.costManufacturingComponent != undefined && this.sustainabilityManufacturingDirtyCheck) {
      this.saveSustainabilityManufacturing();
      this.sustainabilityManufacturingDirtyCheck = false;
    }

    if (this.costManufacturingComponent != undefined && this.sustainabilityPackageDirtyCheck) {
      this.saveSustainabilityPackage();
      this.sustainabilityPackageDirtyCheck = false;
    }

    this.dirtyCheck = false;
  }

  saveMaterialinfo() {
    this.materialInfoComponent.onFormSubmit().subscribe((materialdata) => {
      if (materialdata) {
        const manufProcessid = Number(this.costManufacturingComponent.costingManufacturingInfoform.controls['processTypeID'].value);
        const processInfoId = Number(this.costManufacturingComponent.costingManufacturingInfoform.controls['processInfoId'].value);
        if ((manufProcessid > 0 || processInfoId > 0) && this.manufacturingDirtyCheck) {
          this.saveManufature();
        }
      }
    });
  }

  saveBillOfMaterialInfo() {
    this.pcbBoarddetailsComponent.onFormSubmit().subscribe((bomdata) => {
      if (bomdata) {
        const manufProcessid = Number(this.costManufacturingComponent.costingManufacturingInfoform.controls['processTypeID'].value);
        const processInfoId = Number(this.costManufacturingComponent.costingManufacturingInfoform.controls['processInfoId'].value);
        if ((manufProcessid > 0 || processInfoId > 0) && this.manufacturingDirtyCheck) {
          this.saveManufature();
        }
      }
    });
  }

  saveManufature() {
    if (!this.saveManufactureExecuting) {
      this.saveManufactureExecuting = true;
      this.costManufacturingComponent.onFormSubmit().subscribe((manufdata) => {
        if (manufdata) {
          const toolingNameId = Number(this.costToolingComponent?.toolingFormGroup.controls['toolingNameId']?.value);
          const toolingId = Number(this.costToolingComponent?.costingToolingform.controls['toolingId']?.value);
          if ((toolingNameId > 0 || toolingId > 0) && this.toolingDirtyCheck) {
            this.saveTooling();
            this.toolingDirtyCheck = false;
          }
          setTimeout(() => {
            this.saveManufactureExecuting = false;
          }, 2000);
        }
      });
    }
  }

  saveTooling() {
    this.costToolingComponent.bulkUpdateTooling().subscribe(() => {});
  }

  saveOverHeadTooling() {
    this.ohComponent.onOverHeadSubmit().subscribe(() => {});
  }

  saveSecondaryProcess() {
    this.costSecondaryProcessComponent.onFormSubmit().subscribe(() => {});
  }

  savePackageInfo() {
    this.packageInfoComponent.onFormSubmit().subscribe(() => {});
  }

  savepurchasedCatalouge() {
    this.purchasedCatalougeComponent.onFormSubmit().subscribe(() => {});
  }

  saveoverHeadProfit() {
    this.overHeadProfitComponent.onFormSubmit().subscribe(() => {});
  }

  saveLogistic() {
    this.logisticsComponent.onFormSubmit().subscribe(() => {});
  }

  saveDuttiesTraffic() {
    this.dutiesAndTariffComponent.onFormSubmit().subscribe(() => {});
  }

  saveSpendClassification() {
    this.spendClassificationComponent.onFormSubmit().subscribe(() => {});
  }

  saveSustainability() {
    this.sustainabilityComponent.onFormSubmit();
  }
  saveSustainabilityMaterial() {
    this.sustainabilityComponent.onMatrialFormSubmit();
  }
  saveSustainabilityManufacturing() {
    this.sustainabilityComponent.onManufacturingFormSubmit();
  }
  saveSustainabilityPackage() {
    this.sustainabilityComponent.onPackagingFormSubmit();
  }

  resetChildForms() {
    this.costPartComponent?.resetform();
    this.materialInfoComponent?.resetform();
    this.costManufacturingComponent?.resetform();
    this.costSecondaryProcessComponent?.resetform();
    this.purchasedCatalougeComponent?.resetform();
    this.overHeadProfitComponent?.resetform();
    this.packageInfoComponent?.costingPackagingForm?.reset();
    this.dutiesAndTariffComponent?.dutiesTariffForm.reset();
    this.spendClassificationComponent?.spendClassificationForm.reset();
    this.logisticsComponent?.resetform();
  }
  // private listenNotSavedEvents(): void {
  //   this.hasUnsavedEventSub$ = this.notSavedService.hasBOMSelectionChangeEvent().subscribe((data) => {
  //     this.getPartDetailsById();
  //   });
  //}

  private listenProjectChange(): void {
    this.hasUnsavedEventSub$ = this.notSavedService.hasProjectSelectionChangeEvent().subscribe((respdata) => {
      const model = this.checkIfChildComponentDirty();
      if (model.isAnyChildDirty) {
        const dialogRef = this.messaging.openConfirmationDialog(<ConfirmationDialogConfig>{
          data: {
            title: 'Confirm Leave',
            message: 'You have unsaved data which will be lost. Do you still want to proceed?',
            action: 'CONFIRM',
            cancelText: 'CANCEL',
          },
        });
        dialogRef.afterClosed().subscribe((confirmed: boolean) => {
          if (confirmed) {
            this.notSavedService.dispatchProjectSelectionCompleteChanges(respdata);
          } else {
            const req = {
              dirtyItems: model.dirtyItems,
              nextUrl: '',
              source: 'Project',
              Project: respdata,
            };
            this.notSavedService.dispatchHasUnsavedEvent(req);
          }
        });
      } else {
        this.notSavedService.dispatchProjectSelectionCompleteChanges(respdata);
      }
    });
  }

  onPartComplectionPercentageChanged(value: number) {
    setTimeout(() => (this.partCompletionPercentage = value?.toString()), 100);
  }

  onMaterialComplectionPercentageChanged(value: number) {
    setTimeout(() => (this.materialCompletionPercentage = value?.toString()), 100);
    setTimeout(() => this.loadAllSections(), 100);
  }

  onManufacturingComplectionPercentageChanged(value: number) {
    setTimeout(() => (this.manufacturingCompletionPercentage = value?.toString()), 100);
    setTimeout(() => this.loadAllSections(), 100);
  }

  onProcessInfoDtoOut(value: ProcessInfoDto) {
    this.processInfoDtoOut = value;
  }
  onListProcessInfoDtoOut(value: ProcessInfoDto[]) {
    this.listProcessInfoDtoOut = value;
  }
  onLaborRateInfoDtoOut(value: LaborRateMasterDto[]) {
    this.laborRateInfoDtoOut = value;
  }
  onPackagingInfoDtoOut(value: PackagingInfoDto) {
    this.packagingInfoDto = value;
  }
  onFormProcessInfoDto(value: ProcessInfoDto) {
    this.formprocessInfoDto = value;
  }
  onEsgImpactCO2Kg(value: any) {
    this.esgImpactCO2Kg = value;
  }
  onSelectedMaterialInfoOut(value: MaterialInfoDto) {
    this.selectedMaterialInfoOut = value;
    value?.createDate && this.sharedService.setMaterialInfoCreateDate(formatDate(value?.createDate, 'MMM d, y h:mm a', 'en-US'));
  }
  onListMaterialInfoOut(value: MaterialInfoDto[]) {
    this.listMaterialInfoOut = value;
  }

  onSecondaryComplectionPercentageChanged(value: number) {
    this.secondaryCompletionPercentage = value?.toString();
  }

  onPurchasedComplectionPercentageChanged(value: number) {
    setTimeout(() => {
      this.purchasedCompletionPercentage = value?.toString();
    }, 100);
  }

  onOverheadComplectionPercentageChanged(value: number) {
    setTimeout(() => {
      this.overheadCompletionPercentage = value?.toString();
    }, 100);
  }

  onPackagingComplectionPercentageChanged(value: number) {
    setTimeout(() => {
      this.packageCompletionPercentage = value?.toString();
    }, 100);
  }

  onLogisticsComplectionPercentageChanged(value: number) {
    setTimeout(() => {
      this.logisticsCompletionPercentage = value?.toString();
    }, 100);
  }
  onLogisticsSummaryDtoOut(value: LogisticsSummaryDto) {
    this.logisticsSummaryDtoOut = value;
  }

  onDutiesTariffComplectionPercentageChanged(value: number) {
    setTimeout(() => {
      this.dutiesTariffCompletionPercentage = value?.toString();
    }, 100);
  }

  onSpendClassificationComplectionPercentageChanged(value: number) {
    setTimeout(() => {
      this.spendClassificationCompletionPercentage = value?.toString();
    }, 100);
  }

  onSustainabilityComplectionPercentageChanged(value: number) {
    setTimeout(() => {
      this.sustainabilityCompletionPercentage = value?.toString();
    }, 100);
  }
  automationEvent(event: MaterialInfoDto) {
    this.automationSubject.next(event);
  }

  recalculationMaterialCompleteEvent(event: any) {
    this.reCalculateProcessSubject.next(event);
  }

  recalculationBomCompletedEvent(event: PartInfoDto) {
    if (event?.commodityId === CommodityType.Electronics) {
      this.reCalculateMaterialCostSubject.next(event);
    } else {
      const emptyMaterial: MaterialInfoDto[] = [];
      emptyMaterial.push(new MaterialInfoDto());
      this.reCalculateProcessSubject.next({ totmaterialList: emptyMaterial, currentPart: event });
    }
  }

  procesRecalculationCompleteEvent(event: any) {
    const currentPart: PartInfoDto = event?.currentPart;
    if ([CommodityType.Electronics, CommodityType.PrintedCircuitBoard].includes(currentPart?.commodityId)) {
      this.reCalculateOverheadProfitSubject.next(currentPart);
    }
    this.reCalculatePurchaseSubject.next(event);
    if (event?.isToolingNeedToRun === true) {
      this.pendingPackagingEvent = event;
      this.reCalculateToolingSubject.next(event);
    } else {
      this.reCalculateOverheadProfitSubject.next(currentPart);
      this.reCalculatePackagingSubject.next(event);
    }
  }

  toolingRecalculationCompleteEvent(event: PartInfoDto) {
    this.reCalculateSecondarySubject.next(event);
    this.reCalculateOverheadProfitSubject.next(event);
  }

  overheadProfitRecalculationCompleteEvent(_event: any) {
    if (this.pendingPackagingEvent) {
      this.reCalculatePackagingSubject.next(this.pendingPackagingEvent);
      this.pendingPackagingEvent = null; // Clean up
    }
  }

  // packagingRecalculationCompleteEvent(event: PartInfoDto) {
  //   this.reCalculateLogisticSubject.next(event);
  //   this.reCalculateDutiesTariffSubject.next(event);
  // }

  packagingRecalculationCompleteEvent(event: PartInfoDto) {
    timer(2000).subscribe(() => {
      this.reCalculateLogisticSubject.next(event);
    });

    this.reCalculateDutiesTariffSubject.next(event);
  }

  countryChange(isChanges: boolean) {
    this.countryChanged = isChanges;
    this.countryChangeSubject.next(isChanges);
  }

  lifetimeremainingChange(isChanges: boolean) {
    this.lifetimeremainingChanged = isChanges;
    this.lifetimeremainingChangeSubject.next(isChanges);
  }

  manufactureDataCheck(data: ProcessInfoDto[]) {
    this.manufactureDataCheckSubject.next(data);
  }

  manufactureDataDeleteEmit(_data: any) {
    this.toolingDirtyCheck = false;
  }

  onPartdirtyCheckEvent(isDirty: boolean) {
    this.partDirtyCheck = isDirty;
    if (!this.dirtyCheck) {
      this.dirtyCheck = isDirty;
    }
  }

  onMaterialDirtyCheck(isDirty: boolean) {
    this.materialDirtyCheck = isDirty;
    if (!this.dirtyCheck) {
      this.dirtyCheck = isDirty;
    }
  }
  onSustainabilityMaterialDirtyCheck(isDirty: boolean) {
    this.sustainabilityMaterialDirtyCheck = isDirty;
    if (!this.dirtyCheck) {
      this.dirtyCheck = isDirty;
    }
  }
  onSustainabilityManufacturingDirtyCheck(isDirty: boolean) {
    this.sustainabilityManufacturingDirtyCheck = isDirty;
    if (!this.dirtyCheck) {
      this.dirtyCheck = isDirty;
    }
  }
  onManufacturingDirtyCheck(isDirty: boolean) {
    this.manufacturingDirtyCheck = isDirty;
    if (!this.dirtyCheck) {
      this.dirtyCheck = isDirty;
    }
  }
  onSustainabilityPackageDirtyCheck(isDirty: boolean) {
    this.sustainabilityPackageDirtyCheck = isDirty;
    if (!this.dirtyCheck) {
      this.dirtyCheck = isDirty;
    }
  }

  onBillOfMaterialDirtyCheck(isDirty: any) {
    this.bomAnalysisDirtyCheck = isDirty;
    if (!this.dirtyCheck) {
      this.dirtyCheck = isDirty;
    }
  }

  onSecondaryDirtyCheck(isDirty: boolean) {
    this.secondaryDirtyCheck = isDirty;
    if (!this.dirtyCheck) {
      this.dirtyCheck = isDirty;
    }
  }

  onPurchasedDirtyCheck(isDirty: boolean) {
    this.purchasedDirtyCheck = isDirty;
    if (!this.dirtyCheck) {
      this.dirtyCheck = isDirty;
    }
  }

  onOverheadDirtyCheck(isDirty: boolean) {
    this.overheadDirtyCheck = isDirty;
    if (!this.dirtyCheck) {
      this.dirtyCheck = isDirty;
    }
  }

  onPackageDirtyCheck(isDirty: boolean) {
    this.packageDirtyCheck = isDirty;
    if (!this.dirtyCheck) {
      this.dirtyCheck = isDirty;
    }
  }

  onLogisticsDirtyCheck(isDirty: boolean) {
    this.logisticsDirtyCheck = isDirty;
    if (!this.dirtyCheck) {
      this.dirtyCheck = isDirty;
    }
  }

  onDutiesTariffDirtyCheck(isDirty: boolean) {
    this.dutiesTariffDirtyCheck = isDirty;
    if (!this.dirtyCheck) {
      this.dirtyCheck = isDirty;
    }
  }

  onSpendClassificationDirtyCheck(isDirty: boolean) {
    this.spendClassificationDirtyCheck = isDirty;
    if (!this.dirtyCheck) {
      this.dirtyCheck = isDirty;
    }
  }

  onSustainabilityDirtyCheck(isDirty: boolean) {
    this.sustainabilityDirtyCheck = isDirty;
    if (!this.dirtyCheck) {
      this.dirtyCheck = isDirty;
    }
  }
  onTolingDirtyCheck(isDirty: boolean) {
    this.toolingDirtyCheck = isDirty;
    if (!this.dirtyCheck) {
      this.dirtyCheck = isDirty;
    }
  }

  mandatoryFieldMissingEvent(event: any) {
    this.isMandatoryFieldsMissing = event;
  }

  onDutiesTariffPanelOpened(): void {
    this.dutiesTariffPanelOpened = true;
  }

  onSpendClassificationPanelOpened(): void {
    this.spendClassificationPanelOpened = true;
  }

  onFormLoaded(formInfo: { componentName: string; formName: string; loadTime?: number }) {
    this.dynamicComponentRegistered.emit(formInfo);
  }
}
