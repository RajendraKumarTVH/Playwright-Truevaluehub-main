import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges, AfterViewInit, OnChanges, inject, effect } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PackagingInfoService, SplBoxTypes } from 'src/app/shared/services/packaging-info.service';
import { AdditionalPackagingDto, MaterialPriceDto, MaterialTypeEnum, PackagingInfoDto } from 'src/app/shared/models/packaging-info.model';
import { BlockUiService } from 'src/app/shared/services';
import { CountryDataMasterDto, LaborRateMasterDto, MaterialInfoDto, PartInfoDto, ProcessInfoDto } from '../../../../shared/models';
import { ProjectInfoDto } from 'src/app/shared/models/project-info.model';
import { Observable, Subject, Subscription } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
// import { MaterialInfoState } from 'src/app/modules/_state/material-info.state';
import { Store } from '@ngxs/store';
import { PackagingInfoState } from 'src/app/modules/_state/packaging-info.state';
import { GetPackagingInfosByPartInfoId, SavePackagingInfo } from 'src/app/modules/_actions/packaging-info.action';
import { FieldColorsDto } from 'src/app/shared/models/field-colors.model';
import { CommodityType, ScreeName } from '../../costing.config';
import { SharedService } from '../../services/shared.service';
import { MessagingService } from 'src/app/messaging/messaging.service';
import { CommonModule } from '@angular/common';
import { OnlyNumber } from 'src/app/shared/directives';
import { MatIconModule } from '@angular/material/icon';
import { MarketMonthState } from 'src/app/modules/_state/market-month.state';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  MaterialFinish,
  MaterialFinishDisplay,
  FragileStatus,
  FragileStatusDisplay,
  Freight,
  FreightDisplay,
  PackagingType,
  PackagingTypeDisplay,
  PackagingUnit,
} from 'src/app/shared/enums/package.enum';
// import { PartSizeConfigs } from 'src/app/shared/config/packaging-size.config';
import { PackagingDescriptionDto, PackagingFormDto, PackagingMapDto, PackingMaterialDto, PackagingSizeDefinitionDto } from 'src/app/shared/models/PackagingMaterialMasterDto.model';
import { MatButtonModule } from '@angular/material/button';
import { PackagingMappingService } from 'src/app/shared/mapping/cost-packaging-mapping.service';
import * as MasterDataActions from 'src/app/modules/_actions/master-data.action';
// import * as CostSummaryActions from 'src/app/modules/_actions/cost-summary.action';
import { LogisticsSummaryService } from 'src/app/shared/services/logistics-summary.service';
import { ModeOfTransportEnum } from 'src/app/shared/models/logistics-summary.model';
import { CountryDataState } from 'src/app/modules/_state/country.state';
import * as DescriptionJson from 'src/assets/descriptions.json';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { MaterialInfoSignalsService } from 'src/app/shared/signals/material-info-signals.service';
import { CostPackagingingRecalculationService } from '../../services/recalculation/cost-packaging-recalculation.service';
import { CostSummarySignalsService } from 'src/app/shared/signals/cost-summary-signals.service';
@Component({
  selector: 'app-costing-packaging-information',
  templateUrl: './costing-packaging-information.component.html',
  styleUrls: ['./costing-packaging-information.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, OnlyNumber, MatIconModule, MatTableModule, MatButtonModule, NgbPopover],
})
export class CostingPackagingInformationComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges {
  @Input() part: PartInfoDto;
  @Input() canUpdate: boolean = false;
  @Input() countryChangeSubject: Subject<boolean>;
  @Input() selectedProject: ProjectInfoDto;
  @Output() partChange: EventEmitter<PartInfoDto> = new EventEmitter<PartInfoDto>();
  @Output() completionPercentageChange = new EventEmitter<number>();
  @Output() dirtyCheckEvent = new EventEmitter<boolean>();
  @Input() reCalculatePackagingSubject: Subject<PartInfoDto>;
  @Output() recalculationCompletedEvent = new EventEmitter<any>();
  @Output() packagingInfoDtoOut = new EventEmitter<PackagingInfoDto>();
  @Input() processInfoDtoOut: ProcessInfoDto;
  @Input() listProcessInfoDtoOut: ProcessInfoDto[];
  @Input() laborRateInfoDtoOut: LaborRateMasterDto[];
  @Output() formProcessInfoDto = new EventEmitter<ProcessInfoDto>();

  // _materialInfo$: Observable<MaterialInfoDto[]>;
  _packgeInfoState$: Observable<PackagingInfoDto>;
  _packagingDescriptionMasterData$: Observable<PackagingDescriptionDto[]>;
  _packagingFormMasterData$: Observable<PackagingFormDto[]>;
  _packagingSizeDefinitionMasterData$: Observable<PackagingSizeDefinitionDto[]>;
  _countryMaster$: Observable<CountryDataMasterDto[]>;

  currentPart: PartInfoDto;
  costingPackagingForm: FormGroup;
  packagingInfoDto?: PackagingInfoDto;
  recalculatePackage?: PackagingInfoDto;
  matDataSubscribe: number = 0;
  corrugatedBoxList: MaterialPriceDto[] = [];
  palletList: MaterialPriceDto[] = [];
  protectList: MaterialPriceDto[] = [];
  fieldColorsList: FieldColorsDto[] = [];
  afterChange = false;
  isRecalculate: boolean = false;
  stopCallingFormSubmit = false;
  hasUnsavedEventSub$: Subscription = Subscription.EMPTY;
  nexturltonavigate: any;
  IsCountryChanged = false;
  isStopcallingState = false;
  defaultFrightId = 0;
  showBoxMessage = false;
  showPalletMessage = false;
  partsPerContainerLabel = 'Parts per Container';

  materialType = Object.assign({}, MaterialTypeEnum);
  completionPctg: number;
  private _store = inject(Store);
  _currentMarketMonth$: Observable<string> = this._store.select(MarketMonthState.getSelectedMarketMonth);
  currentMarketMonth: string = '';
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  materialInfo: MaterialInfoDto;
  rawpackagingMaterialDetails: any;

  totalBoxVol: number = 0;
  bulkUpdatePackagingSubscription$: Subscription = Subscription.EMPTY;
  _bulkPackagingUpdateLoading$ = this._store.select(PackagingInfoState.getBulkPackagingUpdateStatus);
  showMore: boolean = false;
  hasShrinkWrap: boolean = true;
  public isSaveColor = false;
  public selectedPakgInfo = new PackagingInfoDto();
  splBoxTypes: { id: number; name: string }[] = [];
  // private unsubscribeMasterData$: Subscription;
  countNumberOfMatSub: number = 0;
  dataFromMaterialInfo: number = 0;
  getAllMaterialPriceLoaded = true;
  countryList: CountryDataMasterDto[] = [];

  materialFinishList: { value: number; label: string }[] = [];
  fragileList: { value: number; label: string }[] = [];
  freightList: { value: number; label: string }[] = [];

  dataSource = new MatTableDataSource([]);
  displayedColumns: string[] = ['packagingType', 'packagingForm', 'description', 'qtyNeededPerShipment', 'co2', 'cost', 'action'];
  selectedAdnlId: number = 0;

  packagingTypeList: { value: number; label: string }[] = [];
  packagingFormList: PackagingFormDto[] = [];
  packagingSizeDefinitionList: PackagingSizeDefinitionDto[] = [];
  packagingDescriptionList: PackagingDescriptionDto[] = [];
  packagingFormMasterList: PackagingFormDto[] = [];
  packagingSizeDefinitionMasterList: PackagingSizeDefinitionDto[] = [];
  packagingDescriptionMasterList: PackagingDescriptionDto[] = [];

  laborRate: number = 0;
  selectedIndex: number = 0;
  isRecalculatedNeededForLoad: boolean = false;

  public popoverHook: NgbPopover;
  popupUrl: any;
  popupName: any;
  lstdescriptions: any = (DescriptionJson as any).default;
  packagingCommodityTypes = [CommodityType.Electricals, CommodityType.Electronics, CommodityType.PrintedCircuitBoard, CommodityType.PCBAQuickCosting, CommodityType.WiringHarness];
  materialInfoEffect = effect(() => this.handleMaterialInfoEffect(this.materialInfoSignalService.materialInfos()));

  //#region getter
  get f() {
    return this.costingPackagingForm?.controls;
  }

  get adnlPkgFormAry() {
    return this.costingPackagingForm?.controls?.adnlProtectPkgs as FormArray;
  }

  get formAryLen() {
    return this.adnlPkgFormAry?.controls?.length;
  }
  get protectivePkg() {
    return this.adnlPkgFormAry?.get('protectivePkg');
  }
  //#endregion

  constructor(
    private fb: FormBuilder,
    private PackgSvc: PackagingInfoService,
    // private ProjectInfoService: ProjectInfoService,
    private store: Store,
    private sharedService: SharedService,
    private blockUiService: BlockUiService,
    private messaging: MessagingService,
    // private _costingPackagingICalc: CostingPackagingInformationCalculatorService,
    // private _numberConversionService: NumberConversionService,
    private _packagingMappingService: PackagingMappingService,
    private logisticsSummaryService: LogisticsSummaryService,
    private materialInfoSignalService: MaterialInfoSignalsService,
    private costPackagingRecalculationService: CostPackagingingRecalculationService,
    private costSummarySignalsService: CostSummarySignalsService
    // private laborService: LaborService,
  ) {
    // this.getMaterial();
    this._currentMarketMonth$.pipe(takeUntil(this.unsubscribe$)).subscribe((result: string) => {
      if (result) {
        this.currentMarketMonth = result;
      }
    });
    this.splBoxTypes = [...SplBoxTypes];
    // this._materialInfo$ = this.store.select(MaterialInfoState.getMaterialInfos);
    this._packgeInfoState$ = this.store.select(PackagingInfoState.getPackageInfo);
    this._packagingDescriptionMasterData$ = this._store.select(PackagingInfoState.getPackagingDescriptionMasterData);
    this._packagingFormMasterData$ = this._store.select(PackagingInfoState.getPackagingFormMasterData);
    this._packagingSizeDefinitionMasterData$ = this._store.select(PackagingInfoState.getPackagingSizeDefinitionMasterData);
    this._countryMaster$ = this._store.select(CountryDataState.getCountryData);
  }

  ngOnInit(): void {
    this.materialFinishList = this.enumToArray(MaterialFinish, MaterialFinishDisplay);
    this.fragileList = this.enumToArray(FragileStatus, FragileStatusDisplay);
    this.freightList = this.enumToArray(Freight, FreightDisplay);

    this.packagingTypeList = this.enumToArray(PackagingType, PackagingTypeDisplay);

    this.IsCountryChanged = false;
    this.selectedPakgInfo = new PackagingInfoDto();
    this.packagingInfoDto = new PackagingInfoDto();

    this.subscribeState();

    if (this.reCalculatePackagingSubject) {
      this.reCalculatePackagingSubject.pipe(takeUntil(this.unsubscribe$)).subscribe((e) => {
        this.recalculatePackagingCost(e);
        this.isStopcallingState = true;
      });
    }

    this.countryChangeSubject?.pipe(takeUntil(this.unsubscribe$)).subscribe((e) => {
      this.IsCountryChanged = e;
    });
    // this.getLaborRateBasedOnCountry(this.currentPart?.mfrCountryId);
    this.completionPercentageChange.emit(0);
  }

  enumToArray(enumObj: any, displayMap: Record<number, string>): { value: number; label: string }[] {
    return Object.keys(enumObj)
      .filter((k) => !isNaN(Number(k)))
      .map((k) => ({
        value: Number(k),
        label: displayMap[k],
      }));
  }

  ngAfterViewInit() {
    this.costingPackagingForm.valueChanges.subscribe(() => {
      const value = this.calculatePercentage();
      this.completionPercentageChange.emit(value);
      this.completionPctg = value;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['canUpdate']) {
      this.toggleForms();
    }
    if (changes['part'] && changes['part'].currentValue?.partInfoId && changes['part'].currentValue != changes['part'].previousValue) {
      if (changes['part'].currentValue?.partInfoId != changes['part'].previousValue?.partInfoId || changes['part'].currentValue?.commodityId != changes['part'].previousValue?.commodityId) {
        this.packagingInfoDto = new PackagingInfoDto();
        this.selectedPakgInfo = new PackagingInfoDto();
        this.currentPart = changes['part'].currentValue;
        this.store.dispatch(new GetPackagingInfosByPartInfoId(this.currentPart.partInfoId));
      }
    }
  }

  private toggleForms() {
    try {
      if (!this.costingPackagingForm) return;
      if (!this.canUpdate) {
        this.costingPackagingForm.disable({ emitEvent: false });
      } else {
        this.costingPackagingForm.enable({ emitEvent: false });
      }
    } catch {}
  }

  ngOnDestroy() {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }

  onFormValueChange() {
    this.afterChange = true;
    this.dirtyCheckEvent.emit(true);
  }

  private handleMaterialInfoEffect(result: MaterialInfoDto[]) {
    if (!this.currentPart) return;

    if (this.packagingCommodityTypes.includes(this.currentPart.commodityId)) {
      if (result?.length > 0) {
        this.materialInfo = result[0];
      }
      this.getPacakagingWithoutMaterialInfo();
    } else if (!this.isStopcallingState) {
      this.getPackagingModeOfTransport(result);
    }
  }

  private getCountryData() {
    return this._countryMaster$.pipe(takeUntil(this.unsubscribe$)).subscribe((res) => {
      this.countryList = res;
    });
  }

  public onFormSubmit(): Observable<PackagingInfoDto> {
    if (this.costingPackagingForm.invalid) {
      const model = new PackagingInfoDto();
      return new Observable((obs) => {
        obs.next(model);
      });
    }

    const formval = this.costingPackagingForm.value;

    if (
      !formval?.fragileId ||
      !formval.partsPerShipment ||
      formval.fragileId === '' ||
      !formval?.freightId ||
      formval.freightId === '' ||
      !formval?.materialFinishId ||
      formval.materialFinishId === ''
    ) {
      const model = new PackagingInfoDto();
      return new Observable((obs) => {
        obs.next(model);
      });
    }

    if (formval.shrinkWrap == 'true' || formval.shrinkWrap == true) {
      formval.shrinkWrap = true;
    } else {
      formval.shrinkWrap = false;
    }

    let addnlPckges = this.packagingInfoDto.adnlProtectPkgs;
    if (addnlPckges?.length > 0) {
      addnlPckges = addnlPckges.map((pkg) => ({
        ...pkg,
        adnlId: 0,
      }));
    } else {
      if (!this.packagingInfoDto?.adnlProtectPkgs) {
        this.packagingInfoDto.adnlProtectPkgs = [];
        this.selectedAdnlId = 0;
      }
      this.packagingInfoDto.adnlProtectPkgs[0] = {
        adnlId: 0,
        adlnalid: 0,
        packagingId: this.packagingInfoDto.packagingId ?? 0,
        protectivePkg: 0,
        costPerUnit: 0,
        units: 0,
        specialtyBoxType: '1',
        costPerProtectivePackagingUnit: 0,
        totalNumberOfProtectivePackaging: 0,
      };
      addnlPckges = this.packagingInfoDto.adnlProtectPkgs;
    }

    this.packagingInfoDto = {
      ...formval,
      splBoxType: 1,
      dataCompletionPercentage: this.completionPctg,
      adnlProtectPkgs: addnlPckges,
    };
    if (!!formval.packagingId == false) {
      delete this.packagingInfoDto['packagingId'];
    }

    this.packagingInfoDto.partInfoId = this.currentPart?.partInfoId;
    this.packagingInfoDto.projectInfoId = this.currentPart?.projectInfoId;

    this.packagingInfoDto.totalPackagCostPerUnit = (this.packagingInfoDto?.adnlProtectPkgs || []).reduce((acc, curr) => acc + (curr.costPerUnit || 0), 0);

    this.packagingInfoDto.totalESGImpactperPart = (this.packagingInfoDto?.adnlProtectPkgs || []).reduce((acc, curr) => acc + (curr.cO2PerUnit || 0), 0);

    const payLoad = { ...this.packagingInfoDto };
    this.store.dispatch(new SavePackagingInfo(payLoad));
    this.costSummarySignalsService.getCostSummaryByPartInfoId(this.packagingInfoDto?.partInfoId, 'savePackagingInfo');
    this.saveColoringPackaging();
    if (formval?.packagingId && formval?.packagingId > 0) {
      this.isSaveColor = false;
    } else {
      this.isSaveColor = true;
    }
    this.afterChange = false;
    this.dirtyCheckEvent.emit(this.afterChange);

    return new Observable((obs) => {
      obs.next(this.packagingInfoDto);
    });
  }

  private subscribeState() {
    this.getCountryData();
    this.matDataSubscribe = 0;
    if (this.packagingCommodityTypes.includes(this.currentPart?.commodityId)) {
      if (!this.costingPackagingForm) {
        const pakgInfo = new PackagingInfoDto();
        this.createForm(pakgInfo);
      }
      if (this.currentPart?.mfrCountryId && this.currentPart?.deliveryCountryId) {
        this.defaultFrightId = Freight.LandOrAir;
        this.logisticsSummaryService
          .getDefaultModeOfTransport(this.currentPart?.mfrCountryId, this.currentPart?.deliveryCountryId)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe((response: number) => {
            if (response) {
              let modeOfTransport = response || 0;
              if (ModeOfTransportEnum.Ocean === modeOfTransport) {
                this.defaultFrightId = Freight.Sea;
              } else {
                this.defaultFrightId = Freight.LandOrAir;
              }
            }
          });
      }
    }

    this._packagingDescriptionMasterData$.pipe(takeUntil(this.unsubscribe$)).subscribe((packagingDescriptionList: PackagingDescriptionDto[]) => {
      if (!packagingDescriptionList) {
        this._store.dispatch(new MasterDataActions.GetPackageDescriptionMasterData());
        this._packagingDescriptionMasterData$.pipe(takeUntil(this.unsubscribe$)).subscribe((packagingDescriptionList: PackagingDescriptionDto[]) => {
          this.packagingDescriptionMasterList = Object.values(packagingDescriptionList || {});
        });
      } else {
        this.packagingDescriptionMasterList = Object.values(packagingDescriptionList || {});
      }
    });

    this._packagingFormMasterData$.pipe(takeUntil(this.unsubscribe$)).subscribe((packagingFormList: PackagingFormDto[]) => {
      if (!packagingFormList) {
        this._store.dispatch(new MasterDataActions.GetPackageFormMasterData());
        this._packagingFormMasterData$.pipe(takeUntil(this.unsubscribe$)).subscribe((packagingFormList: PackagingFormDto[]) => {
          this.packagingFormMasterList = Object.values(packagingFormList || {});
        });
      } else {
        this.packagingFormMasterList = Object.values(packagingFormList || {});
      }
    });

    this._packagingSizeDefinitionMasterData$.pipe(takeUntil(this.unsubscribe$)).subscribe((packagingSizeDefinitionList: PackagingSizeDefinitionDto[]) => {
      if (!packagingSizeDefinitionList) {
        this._store.dispatch(new MasterDataActions.GetPackageSizeDefinitionMasterData());
        this._packagingSizeDefinitionMasterData$.pipe(takeUntil(this.unsubscribe$)).subscribe((packagingSizeDefinitionList: PackagingSizeDefinitionDto[]) => {
          this.packagingSizeDefinitionMasterList = Object.values(packagingSizeDefinitionList || {});
        });
      } else {
        this.packagingSizeDefinitionMasterList = Object.values(packagingSizeDefinitionList || {});
      }
    });
  }

  private getPackagingModeOfTransport(matInfoList: MaterialInfoDto[]) {
    if (!this.costingPackagingForm) {
      const pakgInfo = new PackagingInfoDto();
      this.createForm(pakgInfo);
    }
    this.countNumberOfMatSub++;
    if (this.countNumberOfMatSub > 2) {
      this.dataFromMaterialInfo = 1;
    }
    this.matDataSubscribe = 1;

    if (matInfoList && matInfoList != null && matInfoList?.length > 0) {
      this.materialInfo = matInfoList?.length && matInfoList[0];
      if (this.currentPart?.partInfoId === this.materialInfo?.partInfoId) {
        if (this.currentPart?.mfrCountryId && this.currentPart?.deliveryCountryId) {
          this.logisticsSummaryService
            .getDefaultModeOfTransport(this.currentPart?.mfrCountryId, this.currentPart?.deliveryCountryId)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe((response: number) => {
              if (response) {
                let modeOfTransport = response || 0;
                if (ModeOfTransportEnum.Ocean === modeOfTransport) {
                  this.defaultFrightId = Freight.Sea;
                } else {
                  this.defaultFrightId = Freight.LandOrAir;
                }
                this.getPacakaging(matInfoList);
              }
            });
        } else {
          this.getPacakaging(matInfoList);
        }
      }
    }
  }

  private getPacakaging(matInfoList: MaterialInfoDto[]) {
    this._packgeInfoState$.pipe(takeUntil(this.unsubscribe$)).subscribe((pkgInfoState: PackagingInfoDto) => {
      if (matInfoList && matInfoList != null && matInfoList?.length > 0) {
        if (this.currentPart) {
          this.selectedPakgInfo = new PackagingInfoDto();
          if (pkgInfoState && pkgInfoState != null && pkgInfoState.packagingId > 0) {
            this.selectedPakgInfo = { ...pkgInfoState };
            this.packagingInfoDto = { ...pkgInfoState };
            this.setform(this.packagingInfoDto);
          } else {
            if (this.matDataSubscribe == 1) {
              if (this.currentPart?.projectInfoId && this.currentPart?.projectInfoId > 0 && this.selectedProject) {
                // this.getMaterialFormload(this.currentPart?.mfrCountryId, localStorage.getItem("marketQuarter"));
                // const month = this.currentMarketMonth ?? this.selectedProject?.marketMonth ?? this.sharedService.getMarketMonth(this.selectedProject.marketQuarter);
                // this.getMaterialFormload(this.currentPart?.mfrCountryId, month);
                this.selectedPakgInfo = { ...new PackagingInfoDto() };
                this.setform(this.selectedPakgInfo);
              }
            }
          }
        }
      } else {
        if (this.currentPart?.projectInfoId && this.currentPart?.projectInfoId > 0) {
          this.selectedPakgInfo = { ...new PackagingInfoDto() };
          this.setform(this.selectedPakgInfo);
        }
      }
    });
    this.completionPercentageChange.emit(this.completionPctg);
    this.completionPctg = this.packagingInfoDto?.dataCompletionPercentage || 0;
  }

  private getPacakagingWithoutMaterialInfo() {
    this._packgeInfoState$.pipe(takeUntil(this.unsubscribe$)).subscribe((pkgInfoState: PackagingInfoDto) => {
      // if (matInfoList && matInfoList != null && matInfoList?.length > 0) {
      if (this.currentPart) {
        this.selectedPakgInfo = new PackagingInfoDto();
        if (pkgInfoState && pkgInfoState != null && pkgInfoState.packagingId > 0) {
          this.selectedPakgInfo = { ...pkgInfoState };
          this.packagingInfoDto = { ...pkgInfoState };
          this.setform(this.packagingInfoDto);
        } else {
          if (this.currentPart?.projectInfoId && this.currentPart?.projectInfoId > 0) {
            this.selectedPakgInfo = { ...new PackagingInfoDto() };
            this.setform(this.selectedPakgInfo);
          }
        }
      }
    });
    this.completionPercentageChange.emit(this.completionPctg);
    this.completionPctg = this.packagingInfoDto?.dataCompletionPercentage || 0;
  }

  calcPackage() {
    const totalPart = this.packagingInfoDto.partsPerShipment;
    let data: AdditionalPackagingDto = { ...this.packagingInfoDto.adnlProtectPkgs.find((p) => p.adnlId === this.selectedAdnlId) };
    let boxData: AdditionalPackagingDto = { ...this.packagingInfoDto.adnlProtectPkgs.find((p) => p.unitId === PackagingUnit.Box) };

    let isPalletDataChanged,
      isBoxDataChanged = false;

    if (data.unitId === PackagingUnit.Pallet) {
      isPalletDataChanged = true;
    } else if (data.unitId === PackagingUnit.Box) {
      isBoxDataChanged = true;
    }

    const rawPackagingMaterialData = this.rawpackagingMaterialDetails?.packingMaterials?.find(
      (p) =>
        p.material.packagingFormId === Number(data.packagingFormId) &&
        p.material.packageDescriptionMasterId === Number(data.packageDescriptionId) && // ✅ Check actual property name
        p.material.packagingTypeId === Number(data.packagingTypeId) &&
        p.material.unitId === Number(data.unitId)
    )?.material;

    if (this.costingPackagingForm.controls['totalPackagingTime'].dirty && this.costingPackagingForm.controls['totalPackagingTime'].value !== null) {
      data.isTotalPackagingTimeDirty = true;
      data.totalPackagingTime = this.costingPackagingForm.controls['totalPackagingTime'].value;
    } else {
      let totalPackagingTime = this.sharedService.isValidNumber(rawPackagingMaterialData?.laborTimeSec) || 0;
      if (this.costingPackagingForm.controls['totalPackagingTime'].value !== null) {
        totalPackagingTime = this.sharedService.checkDirtyProperty('totalPackagingTime', this.fieldColorsList) ? data?.totalPackagingTime : totalPackagingTime;
      }
      data.totalPackagingTime = totalPackagingTime;
    }

    if (this.costingPackagingForm.controls['directLaborRate'].dirty && this.costingPackagingForm.controls['directLaborRate'].value !== null) {
      data.isDirectLaborRateDirty = true;
      data.directLaborRate = this.costingPackagingForm.controls['directLaborRate'].value;
    } else {
      let directLaborRate = this.sharedService.isValidNumber(this.processInfoDtoOut?.lowSkilledLaborRatePerHour) || 0;
      if (this.costingPackagingForm.controls['directLaborRate'].value !== null) {
        directLaborRate = this.sharedService.checkDirtyProperty('directLaborRate', this.fieldColorsList) ? data?.directLaborRate : directLaborRate;
      }
      data.directLaborRate = directLaborRate;
    }

    if (this.costingPackagingForm.controls['partsPerContainer'].dirty && this.costingPackagingForm.controls['partsPerContainer'].value !== null) {
      data.isPartsPerContainerDirty = true;
      data.partsPerContainer = this.costingPackagingForm.controls['partsPerContainer'].value;
    } else {
      // let partsPerContainer = this.sharedService.isValidNumber(this.processInfoDtoOut?.lowSkilledLaborRatePerHour) || 0;
      const partWeight = (this.packagingInfoDto.weightPerShipment / totalPart) * 1000;
      let boxWidth = boxData?.widthInMm || 0;
      let boxLength = boxData?.lengthInMm || 0;
      let boxHeight = boxData?.heightInMm || 0;
      let partsPerBox = 0;
      let boxWeight = 0;

      let units = 0;
      let partsPerContainer = 0;
      let boxPerShipment = boxData?.units || 0;

      const maxWeight = rawPackagingMaterialData?.maxWeightInGms ?? rawPackagingMaterialData?.packageMaxCapacity ?? 0;
      let maxVolume = rawPackagingMaterialData?.maxVolumeInCm3 / 1000 || rawPackagingMaterialData?.packageMaxVolume || 0;

      if (maxVolume === 0) {
        maxVolume = Math.floor(rawPackagingMaterialData?.lengthInMm * rawPackagingMaterialData?.widthInMm * rawPackagingMaterialData?.heightInMm);
      }
      if (data.unitId === PackagingUnit.Box) {
        boxWidth = rawPackagingMaterialData?.widthInMm ?? 0;
        boxLength = rawPackagingMaterialData?.lengthInMm ?? 0;
        boxHeight = rawPackagingMaterialData?.heightInMm ?? 0;

        const dimResult = this.costPackagingRecalculationService.calculateBoxesNeeded(
          { x: boxLength, y: boxWidth, z: boxHeight },
          {
            x: this.materialInfo?.dimX || this.sharedService.extractedMaterialData?.DimX || this.materialInfo?.sheetThickness || this.materialInfo?.closingTime,
            y: this.materialInfo?.dimY || this.sharedService.extractedMaterialData?.DimY || this.materialInfo?.inputBilletWidth || this.materialInfo?.injectionTime,
            z: this.materialInfo?.dimZ || this.sharedService.extractedMaterialData?.DimZ || this.materialInfo?.totalCableLength / 1000 || 1,
          },
          totalPart,
          maxWeight,
          this.materialInfo?.netWeight || 0
        );

        const minCapacity = Math.floor(Math.min(maxWeight / partWeight, dimResult.partsPerBox));
        units = (minCapacity > 0 ? Math.ceil(totalPart / minCapacity) : 0) || 0;
        this.showBoxMessage = dimResult.boxesNeeded === 0;
        partsPerContainer = dimResult.partsPerBox;
        partsPerBox = partsPerContainer;
        boxPerShipment = units;
        boxWeight = rawPackagingMaterialData?.weightInGms || 0;
      } else if (data.unitId === PackagingUnit.Each) {
        units = 1; // partsPerShipment;
        // boxPerShipment = units;
      } else if (data.unitId === PackagingUnit.Pallet) {
        partsPerBox = boxData?.partsPerContainer || 0;
        // ROUNDUP ( [Boxes Per Shipment] / (ROUNDDOWN( PalletWidth(mm)/BoxWidth(mm)) * (PalletLength(mm)/BoxLength(mm)) * (PalletHeight(mm)/BoxHeight(mm)))
        const palletWidth = rawPackagingMaterialData?.widthInMm ?? 1;
        const palletLength = rawPackagingMaterialData?.lengthInMm ?? 1;
        const palletHeight = rawPackagingMaterialData?.heightInMm ?? 1;
        const dimResult = this.costPackagingRecalculationService.calculateBoxesNeeded(
          { x: palletLength, y: palletWidth, z: palletHeight },
          {
            x: boxLength || this.materialInfo?.dimX || this.sharedService.extractedMaterialData?.DimX || this.materialInfo?.sheetThickness || this.materialInfo?.closingTime,
            y: boxWidth || this.materialInfo?.dimY || this.sharedService.extractedMaterialData?.DimY || this.materialInfo?.inputBilletWidth || this.materialInfo?.injectionTime,
            z: boxHeight || this.materialInfo?.dimZ || this.sharedService.extractedMaterialData?.DimZ || this.materialInfo?.totalCableLength / 1000 || 1,
          },
          boxPerShipment || totalPart,
          maxWeight,
          this.materialInfo?.netWeight || 0 + boxWeight
        );
        // const palletCapacity = Math.floor(palletWidth / boxWidth) * Math.floor(palletLength / boxLength) * Math.floor(palletHeight / boxHeight);
        // units = palletCapacity > 0 ? Math.ceil(boxPerShipment / palletCapacity) : 1;
        units = dimResult.boxesNeeded || 1;
        units = units || 1;
        partsPerContainer = dimResult.boxesNeeded === 0 ? 1 : dimResult.partsPerBox;
        // noOfBoxCanFitInPallet = partsPerContainer;
        partsPerContainer = partsPerBox ? partsPerContainer * partsPerBox : partsPerContainer;
        this.showPalletMessage = dimResult.boxesNeeded === 0;
      } else if (data.unitId === PackagingUnit.PerBox) {
        units = boxPerShipment > 0 ? Math.ceil(boxPerShipment) : 1;
      } else if (data.unitId === PackagingUnit.Wrap) {
        let l = this.materialInfo?.dimX || this.sharedService.extractedMaterialData?.DimX || this.materialInfo?.sheetThickness || this.materialInfo?.closingTime,
          y = this.materialInfo?.dimY || this.sharedService.extractedMaterialData?.DimY || this.materialInfo?.inputBilletWidth || this.materialInfo?.injectionTime,
          z = this.materialInfo?.dimZ || this.sharedService.extractedMaterialData?.DimZ || this.materialInfo?.totalCableLength / 1000 || 1;
        let boundingBoxSurfaceArea = 2 * (l * y + l * z + y * z);
        let wrapLength = rawPackagingMaterialData?.lengthInMm ?? 1;
        let wrapWidth = rawPackagingMaterialData?.widthInMm ?? 1;
        units = boundingBoxSurfaceArea / (wrapLength * wrapWidth);
        // units = boxPerShipment > 0 ? Math.ceil(boxPerShipment) : 1;
      } else if (data.unitId === PackagingUnit.Fill) {
        let l = this.materialInfo?.dimX || this.sharedService.extractedMaterialData?.DimX || this.materialInfo?.sheetThickness || this.materialInfo?.closingTime,
          y = this.materialInfo?.dimY || this.sharedService.extractedMaterialData?.DimY || this.materialInfo?.inputBilletWidth || this.materialInfo?.injectionTime,
          z = this.materialInfo?.dimZ || this.sharedService.extractedMaterialData?.DimZ || this.materialInfo?.totalCableLength / 1000 || 1;
        units = Math.floor(maxVolume / (l * y * z || 1));
        // units = boxPerShipment > 0 ? Math.ceil(boxPerShipment) : 1;
      } else {
        units = 1; // Default case if unitId is not recognized
        // boxPerShipment = units;
      }

      partsPerContainer = partsPerContainer || this.sharedService.isValidNumber(Math.ceil(totalPart / units));

      if (this.costingPackagingForm.controls['partsPerContainer'].value !== null) {
        partsPerContainer = this.sharedService.checkDirtyProperty('partsPerContainer', this.fieldColorsList) ? data?.partsPerContainer : partsPerContainer;
      }
      data.partsPerContainer = partsPerContainer;
      data.units = units;
    }

    data.laborCostPerPart = this.sharedService.isValidNumber((data.totalPackagingTime * (data.directLaborRate / 3600)) / data.partsPerContainer);

    // if (!this.costingPackagingForm.controls['qtyNeededPerShipment'].dirty) {
    //   if (data.unitId === PackagingUnit.Pallet) {
    //     // && boxData?.units
    //     // const palletWidth = data.widthInMm ?? 1;
    //     // const palletLength = data.lengthInMm ?? 1;
    //     // const palletHeight = data.heightInMm ?? 1;
    //     // const dimResult = this.calculateBoxesNeeded(
    //     //   { x: palletLength, y: palletWidth, z: palletHeight },
    //     //   {
    //     //     x: boxData.lengthInMm || this.materialInfo?.dimX || this.materialInfo?.sheetThickness || this.materialInfo?.closingTime,
    //     //     y: boxData.widthInMm || this.materialInfo?.dimY || this.materialInfo?.inputBilletWidth || this.materialInfo?.injectionTime,
    //     //     z: boxData.heightInMm || this.materialInfo?.dimZ || this.materialInfo?.totalCableLength / 1000 || 1,
    //     //   },
    //     //   boxData.units,
    //     //   boxData.maxWeightInGms,
    //     //   this.materialInfo.netWeight // + (boxData.boxWeightInGms || 0)
    //     // );

    //     // const noOfBoxCanFitInPallet = dimResult.partsPerBox;
    //     // data.qtyNeededPerShipment = data.qtyNeededPerShipment = this.sharedService.isValidNumber(data.units / noOfBoxCanFitInPallet);
    //     data.qtyNeededPerShipment = this.sharedService.isValidNumber(totalPart / data.partsPerContainer);
    //   } else {
    //     data.qtyNeededPerShipment = this.sharedService.isValidNumber(Math.ceil(totalPart / data.partsPerContainer));
    //   }
    // } else {
    //   data.isQtyNeededPerShipmentDirty = true;
    //   data.qtyNeededPerShipment = this.costingPackagingForm.value.qtyNeededPerShipment || data.qtyNeededPerShipment;
    // }

    if (this.costingPackagingForm.controls['qtyNeededPerShipment'].dirty && this.costingPackagingForm.controls['qtyNeededPerShipment'].value !== null) {
      data.isQtyNeededPerShipmentDirty = true;
      data.qtyNeededPerShipment = this.costingPackagingForm.controls['qtyNeededPerShipment'].value;
    } else {
      let qtyNeededPerShipment =
        data.unitId === PackagingUnit.Pallet
          ? this.sharedService.isValidNumber(totalPart / data.partsPerContainer)
          : this.sharedService.isValidNumber(Math.ceil(totalPart / data.partsPerContainer)) || 0;
      if (this.costingPackagingForm.controls['qtyNeededPerShipment'].value !== null) {
        qtyNeededPerShipment = this.sharedService.checkDirtyProperty('qtyNeededPerShipment', this.fieldColorsList) ? data?.qtyNeededPerShipment : qtyNeededPerShipment;
      }
      data.qtyNeededPerShipment = qtyNeededPerShipment;
      data.isQtyNeededPerShipmentDirty = false;
    }

    if (this.costingPackagingForm.controls['costPerUnit'].dirty && this.costingPackagingForm.controls['costPerUnit'].value !== null) {
      data.isCostPerContainerDirty = true;
      data.costPerUnit = this.costingPackagingForm.controls['costPerUnit'].value;
    } else {
      let costPerUnit = this.sharedService.isValidNumber(data.costPerContainer / data.partsPerContainer + data.laborCostPerPart);
      if (this.costingPackagingForm.controls['costPerUnit'].value !== null) {
        costPerUnit = this.sharedService.checkDirtyProperty('costPerUnit', this.fieldColorsList) ? data?.costPerUnit : costPerUnit;
      }
      data.costPerUnit = costPerUnit;
      data.isCostPerContainerDirty = false;
    }

    if (this.costingPackagingForm.controls['cO2PerUnit'].dirty && this.costingPackagingForm.controls['cO2PerUnit'].value !== null) {
      data.isCO2PerUnitDirty = true;
      data.cO2PerUnit = this.costingPackagingForm.controls['cO2PerUnit'].value;
    } else {
      let cO2PerUnit = this.sharedService.isValidNumber(data.esgkgCo2 / data.partsPerContainer) || 0;
      if (this.costingPackagingForm.controls['cO2PerUnit'].value !== null) {
        cO2PerUnit = this.sharedService.checkDirtyProperty('cO2PerUnit', this.fieldColorsList) ? data?.cO2PerUnit : cO2PerUnit;
      }
      data.cO2PerUnit = cO2PerUnit;
      data.isCO2PerUnitDirty = false;
    }

    if (!this.costingPackagingForm.controls['units'].dirty) {
      data.units = this.sharedService.isValidNumber(data.units);
    } else {
      data.unitsDirty = true;
      data.units = this.costingPackagingForm.value.units || data.units;
    }

    data.calcRequired = false;
    this.packagingInfoDto = {
      ...this.packagingInfoDto,
      adnlProtectPkgs: this.packagingInfoDto.adnlProtectPkgs.map((p) => (p.adnlId === this.selectedAdnlId ? data : p)),
    };
    this.packagingInfoDto.adnlProtectPkgs = this.costPackagingRecalculationService.calculateForAdditionalPackaging(
      this.packagingInfoDto,
      this.materialInfo,
      this.processInfoDtoOut,
      false,
      isPalletDataChanged,
      isBoxDataChanged
    );
    this.setSelectedItem(data, false);
  }

  private createForm(_dto: PackagingInfoDto) {
    this.costingPackagingForm = this.fb.group({
      packagingId: this.sharedService.isValidNumber(_dto?.packagingId) || 0,
      partInfoId: this.sharedService.isValidNumber(_dto?.partInfoId) || 0,
      projectInfoId: this.sharedService.isValidNumber(_dto?.projectInfoId) || 0,
      partsPerShipment: this.sharedService.isValidNumber(_dto?.partsPerShipment) || 0,
      totalShipmentWeight: this.sharedService.isValidNumber(_dto?.totalShipmentWeight) || 0,
      totalShipmentVolume: this.sharedService.isValidNumber(_dto?.totalShipmentVolume) || 0,

      splBoxType: this.sharedService.isValidNumber(_dto?.splBoxType) || 0,

      units: this.sharedService.isValidNumber(_dto?.units) || 0,
      adnlProtectPkgs: this.fb.array([]),

      weightPerShipment: this.sharedService.isValidNumber(_dto?.weightPerShipment) || 0,
      volumePerShipment: this.sharedService.isValidNumber(_dto?.volumePerShipment) || 0,
      materialFinishId: this.sharedService.isValidNumber(_dto?.materialFinishId) || 0,
      fragileId: this.sharedService.isValidNumber(_dto?.fragileId) || 0,
      freightId: this.sharedService.isValidNumber(_dto?.freightId) || 0,

      sizeId: this.sharedService.isValidNumber(_dto?.sizeId) || 0,
      environmentalId: this.sharedService.isValidNumber(_dto?.environmentalId) || 0,
      mfrCountryId: this.sharedService.isValidNumber(_dto?.mfrCountryId) || 0,
      deliveryCountryId: this.sharedService.isValidNumber(_dto?.deliveryCountryId) || 0,

      packagingTypeId: this.sharedService.isValidNumber(_dto?.packagingTypeId) || 0,
      packagingFormId: this.sharedService.isValidNumber(_dto?.packagingFormId) || 0,
      packageDescriptionId: this.sharedService.isValidNumber(_dto?.packageDescriptionId) || 0,

      packagingWeight: this.sharedService.isValidNumber(_dto?.packagingWeight) || 0,
      packageMaxCapacity: this.sharedService.isValidNumber(_dto?.packageMaxCapacity) || 0,
      packageMaxVolume: this.sharedService.isValidNumber(_dto?.packageMaxVolume) || 0,

      totalPackagingTime: this.sharedService.isValidNumber(_dto?.totalPackagingTime) || 0,
      directLaborRate: this.sharedService.isValidNumber(_dto?.directLaborRate) || 0,
      laborCostPerPart: this.sharedService.isValidNumber(_dto?.laborCostPerPart) || 0,

      partsPerContainer: this.sharedService.isValidNumber(_dto?.partsPerContainer) || 0,
      qtyNeededPerShipment: this.sharedService.isValidNumber(_dto?.qtyNeededPerShipment) || 0,
      costPerContainer: this.sharedService.isValidNumber(_dto?.costPerContainer) || 0,

      costPerUnit: this.sharedService.isValidNumber(_dto?.costPerUnit) || 0,
      cO2PerUnit: this.sharedService.isValidNumber(_dto?.cO2PerUnit) || 0,
    });

    if (_dto?.palletCostPerUnit == null || _dto?.palletCostPerUnit == 0) {
      if (this.currentPart?.projectInfoId && this.currentPart?.projectInfoId > 0 && this.selectedProject) {
        // const month = this.currentMarketMonth ?? this.selectedProject?.marketMonth ?? this.sharedService.getMarketMonth(this.selectedProject.marketQuarter);
        // this.getMaterialFormload(this.currentPart?.mfrCountryId, month);
        // this.getMaterialFormload(this.currentPart?.mfrCountryId, localStorage.getItem("marketQuarter"));
      }
    }
    this.packagingInfoDtoOut.emit(_dto);
  }

  private setform(_dto: PackagingInfoDto) {
    this.costingPackagingForm.value.adnlProtectPkgs = _dto.adnlProtectPkgs;
    this.packagingInfoDto = _dto;
    this.packagingInfoDto.partInfoId = this.currentPart?.partInfoId;
    this.packagingInfoDto.projectInfoId = this.currentPart?.projectInfoId;
    const partsPerShipment = this.sharedService.isValidNumber(Math.ceil(this.currentPart?.eav * (this.currentPart?.deliveryFrequency / 365)));

    let weightPerShipment = 0;
    let volumePerShipment = 0;
    let sizeId = 1;

    if (
      this.currentPart?.commodityId === CommodityType.Electricals ||
      this.currentPart?.commodityId === CommodityType.Electronics ||
      this.currentPart?.commodityId === CommodityType.PrintedCircuitBoard ||
      this.currentPart?.commodityId === CommodityType.PCBAQuickCosting ||
      this.currentPart?.commodityId === CommodityType.WiringHarness
    ) {
      if (this.materialInfo && this.materialInfo?.sheetLength && this.materialInfo?.sheetWidth) {
        // weightPerShipment = 0;
        volumePerShipment = (partsPerShipment * this.materialInfo?.sheetLength * this.materialInfo?.sheetWidth) / 1000000000 || 0; // need to do calculation
      }
      sizeId = 1;
    } else {
      weightPerShipment = this.sharedService.isValidNumber((partsPerShipment * (_dto.materialInfo?.netWeight || this.materialInfo?.netWeight || 0)) / 1000 || 0);
      volumePerShipment = this.sharedService.isValidNumber(
        partsPerShipment *
          ((this.materialInfo?.dimX ||
            this.sharedService.extractedMaterialData?.DimX * this.materialInfo?.dimY ||
            this.sharedService.extractedMaterialData?.DimY * this.materialInfo?.dimZ ||
            this.sharedService.extractedMaterialData?.DimZ) /
            1000000000) || 0
      );
      sizeId = this.costPackagingRecalculationService.getPartSizeId(
        this.materialInfo?.netWeight / 1000,
        this.materialInfo?.dimX || this.sharedService.extractedMaterialData?.DimX,
        this.materialInfo?.dimY || this.sharedService.extractedMaterialData?.DimY,
        this.materialInfo?.dimZ || this.sharedService.extractedMaterialData?.DimZ
      );
    }
    this.packagingInfoDto.sizeId = sizeId;
    this.packagingInfoDto.mfrCountryId = this.currentPart?.mfrCountryId;
    this.packagingInfoDto.deliveryCountryId = this.currentPart?.deliveryCountryId;

    let environmentalId = 2;
    if (this.currentPart.packingModeId === 0) {
      environmentalId = 1;
    }

    this.packagingInfoDto.environmentalId = environmentalId;

    this.costingPackagingForm.patchValue({
      packagingId: this.sharedService.isValidNumber(_dto?.packagingId) || 0,
      partInfoId: this.sharedService.isValidNumber(_dto?.partInfoId) || 0,
      projectInfoId: this.sharedService.isValidNumber(_dto?.projectInfoId) || 0,
      partsPerShipment: this.sharedService.isValidNumber(partsPerShipment || 0),
      weightPerShipment: this.sharedService.isValidNumber(weightPerShipment || 0),
      materialFinishId: this.sharedService.isValidNumber(_dto?.materialFinishId || 1) || 0,
      fragileId: this.sharedService.isValidNumber(_dto?.fragileId || 2) || 0,
      freightId: this.sharedService.isValidNumber(_dto?.freightId || this.defaultFrightId) || 0,

      sizeId: this.sharedService.isValidNumber(_dto?.sizeId) || 0,
      environmentalId: this.sharedService.isValidNumber(_dto?.environmentalId) || 0,
      mfrCountryId: this.sharedService.isValidNumber(_dto?.mfrCountryId) || 0,
      deliveryCountryId: this.sharedService.isValidNumber(_dto?.deliveryCountryId) || 0,

      totalShipmentWeight: this.sharedService.isValidNumber(_dto?.totalShipmentWeight) || 0,
      totalShipmentVolume: this.sharedService.isValidNumber(_dto?.totalShipmentVolume) || 0,
      volumePerShipment: this.sharedService.isValidNumber(volumePerShipment || 0),

      splBoxType: this.sharedService.isValidNumber(_dto?.splBoxType) || 1,
    });

    // ✅ Reset dirty/touched state after patch
    this.costingPackagingForm.markAsPristine();
    this.costingPackagingForm.markAsUntouched();

    if (this.packagingFormMasterList && this.packagingDescriptionMasterList) {
      const transformedData = this.mapPackagingData(_dto.adnlProtectPkgs);
      this.showBoxMessage = transformedData?.length > 0 && !transformedData.some((item) => item.unitId === PackagingUnit.Box);
      this.dataSource.data = [...transformedData];
      if (transformedData?.length === 0) {
        this.showPalletMessage = false;
      }
    }

    if (_dto?.adnlProtectPkgs?.length > 0) {
      if (this.selectedIndex) {
        this.selectedAdnlId = _dto.adnlProtectPkgs[this.selectedIndex]?.adnlId || 0;
        this.setSelectedItem(_dto.adnlProtectPkgs[this.selectedIndex], true);
      } else {
        this.setSelectedItem(_dto.adnlProtectPkgs[0], true);
      }
      if (_dto?.adnlProtectPkgs && _dto?.adnlProtectPkgs.length === 1 && !_dto?.adnlProtectPkgs[0].packagingTypeId) {
        this.selectedIndex = 0;
        if (!this.isRecalculatedNeededForLoad) {
          this.onPackagingChange();
        }
      }
    } else {
      this.selectedIndex = 0;
      if (!this.isRecalculatedNeededForLoad) {
        this.onPackagingChange();
      }
    }

    if (!this.rawpackagingMaterialDetails) {
      const formValue = this.costingPackagingForm.value;

      if (formValue.materialFinishId && formValue.fragileId && formValue.freightId && this.currentPart?.commodityId && formValue.sizeId && formValue.environmentalId) {
        this.PackgSvc.getPackagingMaterialDetails(this.currentPart.commodityId, formValue.materialFinishId, formValue.fragileId, formValue.sizeId, formValue.freightId, formValue.environmentalId)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe((res: PackagingMapDto) => (this.rawpackagingMaterialDetails = res));
      }
    }

    this.packagingInfoDtoOut.emit(_dto);
  }

  private calculatePercentage() {
    const totalFields = Object.keys(this.costingPackagingForm).length - 3;
    const nonEmptyWeightage = this.findNonEmptyControlsRecursive(this.costingPackagingForm)?.length;

    let percentage: number = 0;
    if (totalFields > 0) {
      percentage = (nonEmptyWeightage / totalFields) * 100;
      percentage = Math.ceil(percentage);
      percentage = percentage > 100 ? 100 : percentage;
    }
    return percentage;
  }

  private findNonEmptyControlsRecursive(formToInvestigate: FormGroup | FormArray): string[] {
    const nonEmptyControls: string[] = [];
    const recursiveFunc = (form: FormGroup | FormArray) => {
      Object.keys(form.controls).forEach((field) => {
        const control = form.get(field);
        if (control.value) nonEmptyControls.push(field);
        if (control instanceof FormGroup) {
          if (nonEmptyControls.find((x) => x == control.value)) {
            recursiveFunc(control);
          }
        } else if (control instanceof FormArray) {
          if (nonEmptyControls.find((x) => x == control.value)) {
            recursiveFunc(control);
          }
        }
      });
    };
    recursiveFunc(formToInvestigate);
    return nonEmptyControls;
  }

  private getColorInfo(packagingId: number) {
    this.fieldColorsList = [];
    if (packagingId > 0) {
      this.sharedService
        .getColorInfos(this.currentPart?.partInfoId, ScreeName.Packaging, Number(packagingId + '' + this.selectedIndex))
        // .pipe(takeUntil(this.unsubscribe$))
        .pipe(take(1))
        .subscribe((result: FieldColorsDto[]) => {
          this.isSaveColor = false;
          if (result) {
            this.fieldColorsList = result;
          }
          result?.forEach((element) => {
            if (element?.isTouched) {
              this.costingPackagingForm.get(element?.formControlName)?.markAsTouched();
            }
            if (element?.isDirty) {
              this.costingPackagingForm.get(element?.formControlName)?.markAsDirty();
            }
          });
          // this.afterChange = false;
          // this.dirtyCheckEvent.emit(this.afterChange);
        });
    }
  }

  checkDirtyProperty(formCotrolName: string) {
    let res = false;
    if (this.fieldColorsList) {
      const info = this.fieldColorsList.filter((x) => x.formControlName == formCotrolName && x.isDirty == true);
      if (info.length > 0) {
        res = true;
      }
    }
    return res;
  }

  public checkIfFormDirty() {
    return this.afterChange;
  }

  recalculatePackagingCost(info: any) {
    console.info('recalculatePackagingCost', info);
    // this.recalculatePackage = new PackagingInfoDto();
    const matInfoList: MaterialInfoDto[] = info?.materialInfoList;
    const currentPart: PartInfoDto = Object.assign({}, info?.currentPart);
    this.currentPart = currentPart;
    this.blockUiService.pushBlockUI('recalculatePackage');
    this.PackgSvc.getPackagingDetails(currentPart?.partInfoId)
      // .pipe(takeUntil(this.unsubscribe$))
      .pipe(take(1))
      .subscribe((pkgInfoState: PackagingInfoDto) => {
        if (matInfoList && matInfoList != null && matInfoList?.length > 0) {
          this.materialInfo = matInfoList?.length && matInfoList[0];
          if (pkgInfoState && pkgInfoState != null && pkgInfoState.packagingId > 0) {
            this.costPackagingRecalculationService.recalculatePackagingCost(this.currentPart, this.processInfoDtoOut, this.materialInfo, pkgInfoState).subscribe((resPkgInfo: PackagingInfoDto) => {
              this.recalculateFormSubmitCall(resPkgInfo, currentPart);
            });
          } else {
            if (this.currentPart && this.materialInfo) {
              const partsPerShipment = this.sharedService.isValidNumber(Math.ceil(this.currentPart?.eav * (this.currentPart?.deliveryFrequency / 365)));
              const weightPerShipment = this.sharedService.isValidNumber((partsPerShipment * (this.materialInfo?.netWeight || 0)) / 1000 || 0);
              const volumePerShipment = this.sharedService.isValidNumber(partsPerShipment * ((this.materialInfo.dimX * this.materialInfo.dimY * this.materialInfo.dimZ) / 1000000000) || 0);

              if (this.currentPart?.mfrCountryId && this.currentPart?.deliveryCountryId) {
                this.logisticsSummaryService
                  .getDefaultModeOfTransport(this.currentPart?.mfrCountryId, this.currentPart?.deliveryCountryId)
                  .pipe(takeUntil(this.unsubscribe$))
                  .subscribe((response: number) => {
                    if (response) {
                      let modeOfTransport = response || 0;
                      if (ModeOfTransportEnum.Ocean === modeOfTransport) {
                        this.defaultFrightId = Freight.Sea;
                      } else {
                        this.defaultFrightId = Freight.LandOrAir;
                      }
                      this.costingPackagingForm.patchValue({
                        freightId: this.sharedService.isValidNumber(this.defaultFrightId || 0),
                      });
                    }
                  });
              }

              if (!this.costingPackagingForm?.value?.materialFinishId) {
                this.costingPackagingForm.patchValue({ materialFinishId: 1 });
              }

              if (!this.costingPackagingForm?.value?.fragileId) {
                this.costingPackagingForm.patchValue({ fragileId: 2 });
              }

              this.costingPackagingForm.patchValue({
                partsPerShipment: this.sharedService.isValidNumber(partsPerShipment || 0),
                weightPerShipment: this.sharedService.isValidNumber(weightPerShipment || 0),
                volumePerShipment: this.sharedService.isValidNumber(volumePerShipment || 0),
              });
              this.onPackagingChange();
            }
            this.recalculationCompletedEvent.emit(currentPart);
            this.blockUiService.popBlockUI('recalculatePackage');
          }
        } else {
          this.recalculationCompletedEvent.emit(currentPart);
          this.blockUiService.popBlockUI('recalculatePackage');
        }
      });
  }

  recalculateFormSubmitCall(packagedbObj: PackagingInfoDto, currentPart: PartInfoDto) {
    console.info('recalculateFormSubmitCall', packagedbObj, currentPart);

    if (!packagedbObj?.fragileId || !packagedbObj?.freightId || !packagedbObj?.materialFinishId) {
      this.recalculationCompletedEvent.emit(currentPart);
      this.blockUiService.popBlockUI('recalculatePackage');
      return;
    }

    let addnlPckges = packagedbObj.adnlProtectPkgs.filter((x) => x.packageDescriptionId);
    if (addnlPckges?.length > 0) {
      addnlPckges = addnlPckges.map((pkg) => ({
        ...pkg,
        adnlId: 0,
      }));
    } else {
      if (!packagedbObj?.adnlProtectPkgs) {
        packagedbObj.adnlProtectPkgs = [];
        this.selectedAdnlId = 0;
      }
      packagedbObj.adnlProtectPkgs[0] = {
        adnlId: 0,
        adlnalid: 0,
        packagingId: packagedbObj.packagingId ?? 0,
        protectivePkg: 0,
        costPerUnit: 0,
        units: 0,
        specialtyBoxType: '1',
        costPerProtectivePackagingUnit: 0,
        totalNumberOfProtectivePackaging: 0,
      };
      addnlPckges = this.packagingInfoDto.adnlProtectPkgs;
    }

    let newPackage = new PackagingInfoDto();
    newPackage = {
      ...packagedbObj,
      splBoxType: Number(packagedbObj.splBoxType),
      dataCompletionPercentage: this.completionPctg,
      adnlProtectPkgs: addnlPckges,
    };
    newPackage.totalPackagCostPerUnit = (newPackage.adnlProtectPkgs || []).reduce((acc, curr) => acc + (curr.costPerUnit || 0), 0);

    newPackage.totalESGImpactperPart = (newPackage.adnlProtectPkgs || []).reduce((acc, curr) => acc + (curr.cO2PerUnit || 0), 0);

    this.packagingInfoDto = { ...newPackage };
    const payload = { ...newPackage };
    this.store.dispatch(new SavePackagingInfo(payload));
    this.costSummarySignalsService.getCostSummaryByPartInfoId(newPackage?.partInfoId, 'savePackagingInfo');
    this.messaging.openSnackBar(`Recalculation completed for Packaging Section.`, '', {
      duration: 5000,
    });
    this.recalculationCompletedEvent.emit(currentPart);
    this.blockUiService.popBlockUI('recalculatePackage');
  }

  // getPartSizeId(weightKg: number, lengthMm: number, widthMm: number, heightMm: number): number | null {
  //   for (const config of PartSizeConfigs) {
  //     if (weightKg <= config.maxWeightKg && lengthMm <= config.dimensions.lengthMm && widthMm <= config.dimensions.widthMm && heightMm <= config.dimensions.heightMm) {
  //       return config.sizeId;
  //     }
  //   }

  //   return 4; // No match found
  // }

  // getPartSizeId(weightKg: number, lengthMm: number, widthMm: number, heightMm: number): number {
  //   const maxDimension = Math.max(lengthMm, widthMm, heightMm);

  //   const match = this.packagingSizeDefinitionMasterList.find((config) => config.commodityId === this.currentPart?.commodityId && weightKg <= config.maxWeightKG && maxDimension <= config.maxLengthMM);

  //   // TODO: -1 is untill new mapping updatedbfor sizes
  //   return match ? match.sizeId - 1 : 4; // Default if no match
  // }

  private displayMsg(msg: string) {
    this.messaging.openSnackBar(msg, '', { duration: 5000 });
  }

  calculatePackagingDetails() {
    if (this.costingPackagingForm.value.adnlProtectPkgs) {
      const updatedAdnlProtectPkgs = this.costPackagingRecalculationService.calculateForAdditionalPackaging(this.costingPackagingForm.value, this.materialInfo, this.processInfoDtoOut, true);
      this.packagingInfoDto.adnlProtectPkgs = Object.values(updatedAdnlProtectPkgs || {});
      this.costingPackagingForm.value.adnlProtectPkgs = Object.values(updatedAdnlProtectPkgs || {});
    }
  }

  setSelectedItem(_dto: AdditionalPackagingDto, resetRequired) {
    if (_dto) {
      this.selectedAdnlId = _dto?.adnlId || 0;
      this.getColorInfo(_dto.packagingId);
      if (_dto.packagingTypeId) {
        this.PackgSvc.getPackagingFormByPackagingType(_dto.packagingTypeId)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe((res: PackagingFormDto[]) => {
            if (res.length > 0) {
              this.packagingFormList = res;

              this.PackgSvc.getPackagingDescriptionByPackagingTypeAndForm(_dto.packagingTypeId, _dto.packagingFormId)
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe((res: PackagingDescriptionDto[]) => {
                  if (res.length > 0) {
                    this.packagingDescriptionList = res;

                    setTimeout(() => {
                      this.costingPackagingForm.patchValue({
                        packagingTypeId: this.sharedService.isValidNumber(_dto?.packagingTypeId) || 0,
                        packagingFormId: this.sharedService.isValidNumber(_dto?.packagingFormId) || 0,
                        packageDescriptionId: this.sharedService.isValidNumber(_dto?.packageDescriptionId) || 0,

                        packagingWeight: this.sharedService.isValidNumber(_dto?.packagingWeight) || 0,
                        packageMaxCapacity: this.sharedService.isValidNumber(_dto?.packageMaxCapacity) || 0,
                        packageMaxVolume: this.sharedService.isValidNumber(_dto?.packageMaxVolume) || 0,

                        totalPackagingTime: this.sharedService.isValidNumber(_dto?.totalPackagingTime) || 0,
                        directLaborRate: this.sharedService.isValidNumber(_dto?.directLaborRate) || 0,
                        laborCostPerPart: this.sharedService.isValidNumber(_dto?.laborCostPerPart) || 0,

                        partsPerContainer: this.sharedService.isValidNumber(_dto?.partsPerContainer) || 0,
                        qtyNeededPerShipment: this.sharedService.isValidNumber(_dto?.qtyNeededPerShipment) || 0,
                        costPerContainer: this.sharedService.isValidNumber(_dto?.costPerContainer) || 0,

                        costPerUnit: this.sharedService.isValidNumber(_dto?.costPerUnit) || 0,
                        cO2PerUnit: this.sharedService.isValidNumber(_dto?.cO2PerUnit) || 0,
                      });
                      if (resetRequired) {
                        // Reset dirty/touched state after patch
                        this.costingPackagingForm.markAsPristine();
                        this.costingPackagingForm.markAsUntouched();
                      }
                    }, 500);
                  } else {
                    this.displayMsg('No Packaging Details Found.');
                    return;
                  }
                });
            } else {
              this.displayMsg('No Packaging Details Found.');
              return;
            }
          });
      } else {
        setTimeout(() => {
          this.costingPackagingForm.patchValue({
            packagingTypeId: 0,
            packagingFormId: 0,
            packageDescriptionId: 0,

            packagingWeight: 0,
            packageMaxCapacity: 0,
            packageMaxVolume: 0,

            totalPackagingTime: 0,
            directLaborRate: 0,
            laborCostPerPart: 0,

            partsPerContainer: 0,
            qtyNeededPerShipment: 0,
            costPerContainer: 0,

            costPerUnit: 0,
            cO2PerUnit: 0,
          });
          // ✅ Reset dirty/touched state after patch
          this.costingPackagingForm.markAsPristine();
          this.costingPackagingForm.markAsUntouched();
        }, 500);
      }
    }
  }

  onPackagingChange() {
    Object.keys(this.costingPackagingForm.controls).forEach((key) => {
      const control = this.costingPackagingForm.get(key);
      control?.markAsPristine();
      control?.markAsUntouched();
    });

    const isNoMaterialCommodity = [CommodityType.Electricals, CommodityType.Electronics, CommodityType.PrintedCircuitBoard, CommodityType.PCBAQuickCosting, CommodityType.WiringHarness].includes(
      this.currentPart?.commodityId ?? -1
    );
    // Use zeros if materialInfo is missing
    const netWeight = this.materialInfo?.netWeight || 1; // Avoid division by zero
    const dimX = this.materialInfo?.dimX || this.sharedService.extractedMaterialData?.DimX || this.materialInfo?.sheetThickness || this.materialInfo?.closingTime || 1;
    const dimY = this.materialInfo?.dimY || this.sharedService.extractedMaterialData?.DimY || this.materialInfo?.inputBilletWidth || this.materialInfo?.injectionTime || 1;
    const dimZ = this.materialInfo?.dimZ || this.sharedService.extractedMaterialData?.DimZ || this.materialInfo?.totalCableLength / 1000 || 1;

    if (!isNoMaterialCommodity && (netWeight === 0 || dimX === 0 || dimY === 0 || dimZ === 0)) {
      this.displayMsg('No Material Information');
      return;
    }

    const formValue = this.costingPackagingForm.value;
    // const { netWeight, dimX, dimY, dimZ } = this.materialInfo!;
    const sizeId = this.costPackagingRecalculationService.getPartSizeId(netWeight / 1000, dimX, dimY, dimZ);

    formValue.sizeId = sizeId;
    formValue.mfrCountryId = this.currentPart?.mfrCountryId;
    formValue.deliveryCountryId = this.currentPart?.deliveryCountryId;

    const environmentalId = this.currentPart?.packingModeId === 0 ? 1 : 2;
    formValue.environmentalId = environmentalId;

    if (!formValue.freightId) {
      if (!this.defaultFrightId && formValue.mfrCountryId && formValue.deliveryCountryId) {
        this.logisticsSummaryService
          .getDefaultModeOfTransport(formValue.mfrCountryId, formValue.deliveryCountryId)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe((response) => {
            this.defaultFrightId = response === ModeOfTransportEnum.Ocean ? Freight.Sea : Freight.LandOrAir;
            formValue.freightId = this.defaultFrightId;
            this.tryFetchPackaging(sizeId, environmentalId);
          });
      } else {
        formValue.freightId = this.defaultFrightId;
        this.tryFetchPackaging(sizeId, environmentalId);
      }
    } else {
      this.tryFetchPackaging(sizeId, environmentalId);
    }
  }

  private tryFetchPackaging(sizeId: number, environmentalId: number) {
    const formValue = this.costingPackagingForm.value;

    if (formValue.materialFinishId && formValue.fragileId && formValue.freightId && this.currentPart?.commodityId && sizeId && environmentalId) {
      this.PackgSvc.getPackagingMaterialDetails(this.currentPart.commodityId, formValue.materialFinishId, formValue.fragileId, sizeId, formValue.freightId, environmentalId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res: PackagingMapDto) => this.handlePackagingResponse(res));
    }
  }

  private handlePackagingResponse(res: PackagingMapDto) {
    if (!res || Object.keys(res).length === 0 || !res.packingMaterials || res.packingMaterials.length === 0) {
      this.displayMsg('No Packaging Details Found.');
      return;
    }

    this.rawpackagingMaterialDetails = res;
    const packagingPriceMultiplier = this.countryList?.find((x) => x.countryId === this.currentPart.mfrCountryId)?.packagingPriceMultiplier || 1;
    this.costingPackagingForm.value.adnlProtectPkgs = this._packagingMappingService.mapToAdditionalPackagingDto(res.packingMaterials, packagingPriceMultiplier);

    this.calculatePackagingDetails();
    this.packagingInfoDto.adnlProtectPkgs = this.packagingInfoDto.adnlProtectPkgs.filter((x) => x.packageDescriptionId);
    this.costingPackagingForm.value.adnlProtectPkgs = this.costingPackagingForm.value.adnlProtectPkgs.filter((x) => x.packageDescriptionId);

    this.onFormSubmit().subscribe(() => {
      this._packgeInfoState$.pipe(takeUntil(this.unsubscribe$)).subscribe((pkgInfoState: PackagingInfoDto) => {
        this.packagingInfoDto = { ...pkgInfoState };

        if (this.packagingFormMasterList && this.packagingDescriptionMasterList) {
          const transformedData = this.mapPackagingData(this.packagingInfoDto.adnlProtectPkgs);
          this.showBoxMessage = transformedData?.length > 0 && !transformedData.some((item) => item.unitId === PackagingUnit.Box);
          this.dataSource.data = [...transformedData];
          if (transformedData?.length > 0) {
            this.selectedAdnlId = transformedData[0].adnlId;
            this.setform(this.packagingInfoDto);
          } else {
            this.showPalletMessage = false;
          }
        }
      });
    });
  }

  mapPackagingData(raw: AdditionalPackagingDto[]): any[] {
    if (raw) {
      return raw.map((item) => {
        const form = Array.isArray(this.packagingFormMasterList) ? this.packagingFormMasterList.find((p) => p.packagingFormId === item.packagingFormId) : null;

        const desc = Array.isArray(this.packagingDescriptionMasterList) ? this.packagingDescriptionMasterList.find((d) => d.packageDescriptionMasterId === item.packageDescriptionId) : null;

        return {
          ...item,
          packagingType: PackagingTypeDisplay[item.packagingTypeId] || '-',
          packagingForm: form?.packagingForm || 'N/A',
          description: desc?.description || `N/A`,
          units: item.units || 0,
          cost: item.costPerUnit ?? 0,
          co2: item.cO2PerUnit ?? 0,
          adnlId: item.adnlId ?? 0,
        };
      });
    }
    return [];
  }

  onEditPackage(row, i) {
    this.selectedIndex = i;
    this.selectedAdnlId = row.adnlId;
    const data: AdditionalPackagingDto = this.packagingInfoDto.adnlProtectPkgs.find((p) => p.adnlId === row.adnlId);
    if (data?.packagingTypeId === 2) {
      this.partsPerContainerLabel = 'Parts per Cardboard Box';
    } else if (data?.packagingTypeId === 3) {
      this.partsPerContainerLabel = 'Parts per Pallet';
    } else {
      this.partsPerContainerLabel = 'Parts per Container';
    }
    this.setSelectedItem(data, true);
  }

  onDeletePackage(row) {
    this.selectedIndex = 0;
    this.packagingInfoDto.adnlProtectPkgs = [...this.packagingInfoDto.adnlProtectPkgs.filter((pkg) => pkg.adnlId !== row.adnlId)];
    if (this.packagingInfoDto.adnlProtectPkgs.length === 0) {
      this.isRecalculatedNeededForLoad = true;
    }
    this.onFormSubmit().subscribe(() => {
      this._packgeInfoState$.pipe(takeUntil(this.unsubscribe$)).subscribe((pkgInfoState: PackagingInfoDto) => {
        this.packagingInfoDto = { ...pkgInfoState };
        if (this.packagingFormMasterList && this.packagingDescriptionMasterList) {
          const transformedData = this.mapPackagingData(this.packagingInfoDto.adnlProtectPkgs);
          // this.showBoxMessage = !transformedData.some((item) => item.unitId === 1);
          this.dataSource.data = [...transformedData];
        }
      });
    });
  }

  onAddPackagingDetail() {
    const sizeId = this.costPackagingRecalculationService.getPartSizeId(this.materialInfo.netWeight / 1000, this.materialInfo.dimX, this.materialInfo.dimY, this.materialInfo.dimZ);
    this.packagingInfoDto.sizeId = sizeId;
    this.packagingInfoDto.mfrCountryId = this.currentPart?.mfrCountryId;
    this.packagingInfoDto.deliveryCountryId = this.currentPart?.deliveryCountryId;

    let environmentalId = 2;
    if (this.currentPart.packingModeId === 0) {
      environmentalId = 1;
    }

    this.packagingInfoDto.environmentalId = environmentalId;

    this.packagingInfoDto.adnlProtectPkgs = [
      ...this.packagingInfoDto.adnlProtectPkgs,
      {
        adnlId: 0,
        packagingId: this.packagingInfoDto.packagingId ?? 0,
        protectivePkg: null,
        costPerUnit: 0,
        units: 0,
        unitId: null,
        costPerProtectivePackagingUnit: null,
        totalNumberOfProtectivePackaging: null,
        packagingTypeId: null,
        packagingFormId: null,
        packageDescriptionId: null,
        packagingWeight: null,
        packageMaxCapacity: null,
        packageMaxVolume: null,
        totalPackagingTime: null,
        directLaborRate: null,
        laborCostPerPart: null,
        partsPerContainer: null,
        qtyNeededPerShipment: null,
        costPerContainer: null,
        cO2PerUnit: null,
        widthInMm: null,
        lengthInMm: null,
        heightInMm: null,
        bulkPrice: null,
        laborTimeSec: null,
        esgkgCo2: null,
        adlnalid: 0,
        isTotalPackagingTimeDirty: false,
        isDirectLaborRateDirty: false,
        isPartsPerContainerDirty: false,
        // isCostPerUnitDirty:false,
        isQtyNeededPerShipmentDirty: false,
        isCostPerContainerDirty: false,
        isCO2PerUnitDirty: false,
      },
    ];

    if (this.packagingFormMasterList && this.packagingDescriptionMasterList) {
      const transformedData = this.mapPackagingData(this.packagingInfoDto.adnlProtectPkgs);
      this.showBoxMessage = transformedData?.length > 0 && !transformedData.some((item) => item.unitId === PackagingUnit.Box);
      this.dataSource.data = [...transformedData];
      if (transformedData?.length === 0) {
        this.showPalletMessage = false;
      }
    }
    this.selectedAdnlId = 0;
    let item = this.packagingInfoDto.adnlProtectPkgs.find((pkg) => pkg.adnlId === 0);
    this.setSelectedItem(item, true);

    //   });
    // });
  }

  onPackagingDetailChange(event: any) {
    if (event?.target?.name === 'packagingTypeId' && this.costingPackagingForm?.value.packagingTypeId) {
      this.PackgSvc.getPackagingFormByPackagingType(this.costingPackagingForm?.value.packagingTypeId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res: PackagingFormDto[]) => {
          if (res.length > 0) {
            this.packagingFormList = res;
          } else {
            this.displayMsg('No Packaging Details Found.');
            return;
          }
        });
    }
    if (event?.target?.name === 'packagingFormId' && this.costingPackagingForm?.value.packagingTypeId && this.costingPackagingForm?.value.packagingFormId) {
      this.PackgSvc.getPackagingDescriptionByPackagingTypeAndForm(this.costingPackagingForm?.value.packagingTypeId, this.costingPackagingForm?.value.packagingFormId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res: PackagingDescriptionDto[]) => {
          if (res.length > 0) {
            this.packagingDescriptionList = res;
          } else {
            this.displayMsg('No Packaging Details Found.');
            return;
          }
        });
    }
    if (
      event?.target?.name === 'packageDescriptionId' &&
      this.costingPackagingForm?.value.packagingTypeId &&
      this.costingPackagingForm?.value.packagingFormId &&
      this.costingPackagingForm?.value.packageDescriptionId
    ) {
      this.PackgSvc.getPackagingMaterialDetailsByTypeFormDesc(
        this.costingPackagingForm?.value.packagingTypeId,
        this.costingPackagingForm?.value.packagingFormId,
        this.costingPackagingForm?.value.packageDescriptionId
      )
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((res: PackingMaterialDto) => {
          if (res) {
            let data: AdditionalPackagingDto = { ...this.packagingInfoDto.adnlProtectPkgs.find((p) => p.adnlId === this.selectedAdnlId) };
            const packagingPriceMultiplier = this.countryList?.find((x) => x.countryId === this.currentPart.mfrCountryId)?.packagingPriceMultiplier || 1;

            data.packagingTypeId = this.costingPackagingForm?.value.packagingTypeId;
            data.packagingFormId = this.costingPackagingForm?.value.packagingFormId;
            data.packageDescriptionId = this.costingPackagingForm?.value.packageDescriptionId;

            data.costPerContainer = res.bulkPrice * packagingPriceMultiplier;

            data.packageMaxCapacity = res.maxWeightInGms;
            data.packageMaxVolume = res.maxVolumeInCm3;
            data.packagingWeight = res.weightInGms;

            data.widthInMm = res.widthInMm;
            data.lengthInMm = res.lengthInMm;
            data.heightInMm = res.heightInMm;

            data.laborTimeSec = res.laborTimeSec;
            data.esgkgCo2 = res.esgkgCo2;
            data.unitId = res.unitId;

            this.packagingInfoDto = {
              ...this.packagingInfoDto,
              adnlProtectPkgs: this.packagingInfoDto.adnlProtectPkgs.map((p) => (p.adnlId === this.selectedAdnlId ? data : p)),
            };
            data.calcRequired = true;

            this.packagingInfoDto.adnlProtectPkgs = this.costPackagingRecalculationService.calculateForAdditionalPackaging(this.packagingInfoDto, this.materialInfo, this.processInfoDtoOut, false);
            data = { ...this.packagingInfoDto.adnlProtectPkgs.find((p) => p.adnlId === this.selectedAdnlId) };
            this.setSelectedItem(data, true);
            this.dirtyCheckEvent.emit(true);
            // this.packagingDescriptionList = res;
          } else {
            this.displayMsg('No Packaging Details Found.');
            return;
          }
        });
    }
  }

  private saveColoringPackaging() {
    const dirtyItems = [];
    this.fieldColorsList = [];
    for (const el in this.costingPackagingForm.controls) {
      if (this.costingPackagingForm.controls[el].dirty || this.costingPackagingForm.controls[el].touched) {
        const fieldColorsDto = new FieldColorsDto();
        fieldColorsDto.isDirty = this.costingPackagingForm.controls[el].dirty;
        fieldColorsDto.formControlName = el;
        fieldColorsDto.isTouched = this.costingPackagingForm.controls[el].touched;
        fieldColorsDto.partInfoId = this.packagingInfoDto?.partInfoId;
        fieldColorsDto.screenId = ScreeName.Packaging;
        fieldColorsDto.primaryId = Number(this.packagingInfoDto.packagingId + '' + this.selectedIndex);
        fieldColorsDto.subProcessInfoId = this.packagingInfoDto?.adnlProtectPkgs?.length > 0 ? this.packagingInfoDto?.adnlProtectPkgs[this.selectedIndex]?.adnlId : 0;
        fieldColorsDto.subProcessIndex = this.selectedIndex;
        dirtyItems.push(fieldColorsDto);
      }
    }
    if (dirtyItems.length > 0) {
      this.blockUiService.pushBlockUI('saveColor');
      this.sharedService
        .updateColorInfo(dirtyItems)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((result) => {
          this.blockUiService.popBlockUI('saveColor');
          if (result) {
            this.fieldColorsList = result;
            result.forEach((element) => {
              if (element.isTouched) {
                this.costingPackagingForm.get(element.formControlName)?.markAsTouched();
              }
              if (element.isDirty) {
                this.costingPackagingForm.get(element.formControlName)?.markAsDirty();
              }
            });
          }
          this.afterChange = false;
          this.dirtyCheckEvent.emit(this.afterChange);
        });
    }
  }

  showinfo(filterValue: string) {
    let objdesc;
    if (this.lstdescriptions && this.lstdescriptions?.length > 0) {
      objdesc = this.lstdescriptions?.find((item: { id: string }) => item.id.toLowerCase() === filterValue.toLowerCase());
    }

    if (objdesc != null) {
      this.popupUrl = objdesc.imageUrl;
      this.popupName = objdesc.descriptions?.replace(/\n/g, '<br>') || '';
    }
    this.popoverHook?.open();
  }

  // Call it like: this.cleanControl(this.costingPackagingForm, 'cO2PerUnit');
  // Or with a nested path: this.cleanControl(this.costingPackagingForm, 'sectionA.cO2PerUnit');

  cleanControl(form, controlPath) {
    if (!form || !controlPath) return;

    const ctrl = form.get(controlPath);
    if (!ctrl) {
      //console.warn(`Control not found at path: ${controlPath}`);
      return;
    }

    ctrl.markAsPristine();
    ctrl.markAsUntouched();
    ctrl.updateValueAndValidity({ onlySelf: true });
  }
}
