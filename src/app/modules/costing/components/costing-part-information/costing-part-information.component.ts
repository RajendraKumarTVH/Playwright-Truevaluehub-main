import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges, OnChanges, effect } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AnnualRevenueTypeNameMap, PartComplexity } from 'src/app/shared/enums';
import { Observable, Subject, Subscription } from 'rxjs';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { map, startWith, take, takeUntil } from 'rxjs/operators';
import { BlockUiService, ProjectInfoService } from 'src/app/shared/services';
import { ConfirmationDialogConfig, MessagingService } from 'src/app/messaging/messaging.service';
import { NotSavedService } from 'src/app/services/not-saved.service';
import { Router } from '@angular/router';
import { CostingCompletionPercentageCalculator } from '../../services/costing-completion-percentage-calculator';
import { VendorService } from 'src/app/modules/data/Service/vendor.service';
import { BuLocationDto, CommodityMasterDto, CountryDataMasterDto, PartInfoDto, VendorDto } from 'src/app/shared/models';
import { BuLocationService } from 'src/app/modules/data/Service/bu-location.service';
import * as DescriptionJson from 'src/assets/descriptions.json';
import { FieldColorsDto } from 'src/app/shared/models/field-colors.model';
import { SharedService } from '../../services/shared.service';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngxs/store';
import { CommodityState } from 'src/app/modules/_state/commodity.state';
// import { PartInfoState } from 'src/app/modules/_state/part-info.state';
// import * as PartInfoActions from 'src/app/modules/_actions/part-info.action';
import { CountryDataState } from 'src/app/modules/_state/country.state';
import { DeletePackagingInfo } from 'src/app/modules/_actions/packaging-info.action';
import { CommodityType, ScreeName } from '../../costing.config';
import * as DataExtractionActions from 'src/app/modules/_actions/dataextraction.action';
import { CommentFieldFormIdentifierModel } from 'src/app/shared/models/comment-field-model';
import { ExtractionData, PartsList } from 'src/app/shared/models/extract-data.model';
// import * as CostSummaryActions from 'src/app/modules/_actions/cost-summary.action';
import { DeleteLogisticInfo } from 'src/app/modules/_actions/logistics-summary.action';
import { DigitalFactoryService } from 'src/app/modules/digital-factory/Service/digital-factory.service';
import { DigitalFactoryDtoNew } from 'src/app/modules/digital-factory/Models/digital-factory-dto';
import { CommonModule } from '@angular/common';
import { OnlyNumber } from 'src/app/shared/directives';
import { FieldCommentComponent } from 'src/app/modules/comments/components/field-comment-button/field-comment.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatOptionModule } from '@angular/material/core';
import { MarketMonthState } from 'src/app/modules/_state/market-month.state';
import { SpecialCharacterDirective } from 'src/app/shared/directives/alpha-numeric.directive';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { GoogleMap, GoogleMapsModule, MapMarker } from '@angular/google-maps';
import { DfSupplierDirectoryMasterDto } from 'src/app/modules/digital-factory/Models/df-supplier-directory-master-dto';
import { Clipboard } from '@angular/cdk/clipboard';
import { DutiesTariffService } from 'src/app/shared/services/duties-tariff.service';
import { PartInfoSignalsService } from 'src/app/shared/signals/part-info-signals.service';
import { CostSummarySignalsService } from 'src/app/shared/signals/cost-summary-signals.service';

@Component({
  selector: 'app-costing-part-information',
  templateUrl: './costing-part-information.component.html',
  styleUrls: ['./costing-part-information.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    OnlyNumber,
    FieldCommentComponent,
    NgbPopover,
    MatAutocompleteModule,
    MatTooltipModule,
    MatOptionModule,
    SpecialCharacterDirective,
    MatTabsModule,
    MatIconModule,
    GoogleMapsModule,
    GoogleMap,
    MapMarker,
  ],
})
export class CostingPartInformationComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  lstdescriptions: any = (DescriptionJson as any).default;
  @Input() part: PartInfoDto;
  @Input() bomQty: number;
  @Output() commodityChange: EventEmitter<number> = new EventEmitter<number>();
  @Output() packingChange: EventEmitter<number> = new EventEmitter<number>();
  @Output() partChange: EventEmitter<PartInfoDto> = new EventEmitter<PartInfoDto>();
  @Output() completionPercentageChange = new EventEmitter<number>();
  @Output() dirtyCheckEvent = new EventEmitter<boolean>();
  @Output() countryChangeEmit = new EventEmitter<boolean>();
  // @Output() partCommodityChangeEvent = new EventEmitter<boolean>();
  @Output() reextractionLoaderChangesEvent = new EventEmitter<{ state: boolean; from: string; partInfoId: number; partName: string }>();
  @Output() lifetimeremainingChangeEmit = new EventEmitter<boolean>();

  currentBomQty: number;
  currentBomId: number;
  currentPart: PartInfoDto;
  costingPartInfoform: FormGroup;
  countryList: CountryDataMasterDto[] = [];
  vendorDto: VendorDto[] = [];
  commodityList: CommodityMasterDto[] = [];
  commodityListTemp: CommodityMasterDto[] = [];
  buLocationList: BuLocationDto[] = [];
  subscription: Subscription[] = [];
  isSubmitted = false;
  fieldColorsList: FieldColorsDto[] = [];
  private unsubscribeAll$: Subject<undefined> = new Subject<undefined>();
  filteredMfrCountryList$: Observable<CountryDataMasterDto[]>;
  filteredDeliveryCountryList$: Observable<CountryDataMasterDto[]>;
  filteredSupplierList$: Observable<DigitalFactoryDtoNew[]>;
  filteredBuList$: Observable<BuLocationDto[]>;
  hasUnsavedEventSub$: Subscription = Subscription.EMPTY;
  selectedBOM: any;
  tooltipContent: string;
  nexturltonavigate: any;
  dataCompletionPercentage: any;
  @Input() bomId: number;
  afterChange: boolean = false;
  public defaultValues = {
    annualVolume: 0,
    lotSize: 0,
    prodLifeRemaining: 5,
    lifeTimeQtyRemaining: 0,
  };
  private lotSizeUserEdited = false;
  public popoverHook: NgbPopover;
  url = '';
  name = 'World';
  show = false;
  isCustomCable = false;
  incoterms = [
    { value: '1', name: 'EXW' },
    { value: '2', name: 'DDP' },
    { value: '3', name: 'DAP' },
    { value: '4', name: 'FOB' },
    { value: '5', name: 'FCA' },
    { value: '6', name: 'FAS' },
    { value: '7', name: 'CFR' },
    { value: '8', name: 'CIF' },
    { value: '9', name: 'CTP' },
    { value: '10', name: 'CIP' },
    { value: '11', name: 'DAT' },
  ];
  digitalFactoryDto: DigitalFactoryDtoNew[] = [];
  selectedSupplier?: DigitalFactoryDtoNew;
  _commodityMaster$: Observable<CommodityMasterDto[]>;
  _countryData$: Observable<CountryDataMasterDto[]>;
  // _partInfo$: Observable<PartInfoDto>;
  anualRevenueList: { key: number; name: string }[] = [];
  formIdentifier: CommentFieldFormIdentifierModel;
  _currentMarketMonth$: Observable<string> = this.store.select(MarketMonthState.getSelectedMarketMonth);
  currentMarketMonth: string = '';
  // selectedMachiningProcesses = [];
  extractionQueue: ExtractionData[] = [];
  retryCount = 0;
  supplierInfo: DfSupplierDirectoryMasterDto;
  marker: { lat: number; lng: number; icon: string };
  partInfoEffect = effect(() => {
    this.getPartDetailsById(this.partInfoSignalsService.partInfo());
  });

  constructor(
    private _fb: FormBuilder,
    private vendorService: VendorService,
    private blockUiService: BlockUiService,
    private messaging: MessagingService,
    private notSavedService: NotSavedService,
    private router: Router,
    private percentageCalculator: CostingCompletionPercentageCalculator,
    private buLocationSvc: BuLocationService,
    private sharedService: SharedService,
    private store: Store,
    private projectInfoService: ProjectInfoService,
    private digitalFactoryService: DigitalFactoryService,
    private clipboard: Clipboard,
    private dutyTariffSvc: DutiesTariffService,
    private partInfoSignalsService: PartInfoSignalsService,
    private costSummarySignalsService: CostSummarySignalsService
  ) {
    this._currentMarketMonth$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((result: string) => {
      if (result) {
        this.currentMarketMonth = result;
      }
    });
    this._commodityMaster$ = this.store.select(CommodityState.getCommodityData);
    this._countryData$ = this.store.select(CountryDataState.getCountryData);
    // this._partInfo$ = this.store.select(PartInfoState.getPartInfo);
  }

  get f() {
    return this.costingPartInfoform.controls;
  }
  get manufacturingCountryControl(): AbstractControl {
    return this.costingPartInfoform?.get('ManufacturingCountry') as AbstractControl;
  }

  get deliveryCountryControl(): AbstractControl {
    return this.costingPartInfoform?.get('DeliveryCountry') as AbstractControl;
  }

  get supplierNameControl(): AbstractControl {
    return this.costingPartInfoform?.get('supplierName') as AbstractControl;
  }

  get isPartExist() {
    return this.currentPart && this.currentPart.partInfoId > 0;
  }

  private getSupplierRevenueValue(revValueType: number, revMapList: Map<number, string>) {
    for (const item of revMapList) {
      if (item[0] === revValueType) {
        return item[1];
      }
    }
    return '';
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['bomQty'] && changes['bomQty'].currentValue != changes['bomQty'].previousValue) {
      this.currentBomQty = changes['bomQty'].currentValue;
      if (this.costingPartInfoform) {
        this.costingPartInfoform.controls['bomqty'].setValue(this.currentBomQty);
      }
    }
    if (changes['bomId'] && changes['bomId'].currentValue != changes['bomId'].previousValue && changes['bomId'].currentValue != undefined) {
      this.currentBomId = changes['bomId'].currentValue;
    }

    if (
      // changes['part'] &&
      // changes['part'].currentValue != changes['part'].previousValue
      changes['part'] &&
      changes['part'].currentValue &&
      changes['part'].currentValue?.partInfoId
    ) {
      this.reset();
      this.currentPart = changes['part'].currentValue;
      this.formIdentifier = {
        partInfoId: this.currentPart.partInfoId,
        screenId: ScreeName.PartInfo,
        primaryId: 0,
        secondaryID: 0,
      };
      console.log('---------------------------------setForm ngOnChanges -------------------------------');
      this.setForm();
      this.supplierInfo = this.currentPart?.vendorLocation?.supplierDirectoryMasterDto;
      this.supplierInfo?.vendorName && this.loadMarker(this.supplierInfo?.vendorName);
      this.getColorInfo();
      if (this.currentPart.termId) {
        this.currentPart.incoTerm = this.incoterms.find((x) => x.value === this.currentPart.termId.toString())?.name;
      }
      this.commodityChange.emit(this.currentPart?.commodityId);
      this.setUnitOfMeasurement(this.currentPart?.commodityId);
    }
  }

  ngOnInit(): void {
    this.costingPartInfoform = this._fb.group({
      IntPartNumber: ['', [Validators.required]],
      IntPartDesc: [''],
      partRevision: [''],
      bomqty: [1],
      AnnualVolume: [120000, [Validators.required]],
      supplierName: ['', [Validators.required]],
      HsCode: ['N/A'],
      lotsize: [0, [Validators.required]],
      supplychainmodel: [1],
      // castType: [1],
      // machiningProcesses: '',
      partcomplexcity: [1],
      commdityvalue: ['1', [Validators.required]],
      processname: [''],
      packingtype: [1, [Validators.required]],
      mfrCity: [{ value: '', disabled: true }],
      ManufacturingCountry: [{ value: '', disabled: true }, [Validators.required]],
      IncoTerms: ['1', [Validators.required]],
      PaymentTerms: ['6', [Validators.required]],
      DeliverySite: ['', [Validators.required]],
      DeliveryCity: [{ value: '', disabled: true }],
      DeliveryCountry: [{ value: '', disabled: true }, [Validators.required]],
      DeliveryFrequency: [30, [Validators.required]],
      prodLifeRemaining: [5, [Validators.required]],
      lifeTimeQtyRemaining: [0, [Validators.required]],
      drawingNumber: [''],
      supplierRevenue: [''],
      scenarioId: 0,
      baseScenarioId: 0,
      extractionCategoryId: 0,
    });
    // this.getPartDetailsById();
    this.getCommodityList();
    this.getSiteList();
    this.getCountryList();
    this.getSupplierList();

    console.log('----------------------ngOnInit lotsize-------------------------------');
    console.log('----------------------ngOnInit lotsize end-------------------------------');
    this.costingPartInfoform?.valueChanges.subscribe((change) => {
      const value = this.percentageCalculator.partInformation(change);
      this.completionPercentageChange.emit(value);
      this.dataCompletionPercentage = value;
    });
    //this.updateLotSize();
  }

  ngAfterViewInit() {
    console.log('---------------------------------setForm ngAfterViewInit -------------------------------');
    this.setForm();
  }

  dispatchgetExtractedData(partInfoId: number) {
    if (partInfoId) {
      this.store.dispatch(new DataExtractionActions.GetExtractDataByPartInfoId(partInfoId));
    }
  }

  onPartFormValueChange() {
    this.afterChange = true;
    this.dirtyCheckEvent.emit(this.afterChange);
  }

  updateLotSize(): void {
    if (this.costingPartInfoform) {
      const annualVolValue = this.costingPartInfoform.controls['AnnualVolume'].value;
      if (annualVolValue === null || annualVolValue === '') {
        this.costingPartInfoform.controls['AnnualVolume'].setValue(this.defaultValues.annualVolume > 0 ? this.defaultValues.annualVolume : '');
      }

      const lotSizeControl = this.costingPartInfoform.controls['lotsize'];
      const lotSizeValue = lotSizeControl.value;
      if (lotSizeValue === null || lotSizeValue === '' || (lotSizeControl.dirty && Number(lotSizeValue) === 0)) {
        this.costingPartInfoform.controls['lotsize'].setValue(this.defaultValues.lotSize > 0 ? Math.round(Number(this.defaultValues.lotSize)) : '');
        this.lotSizeUserEdited = false; // Mark as not user-edited since we just restored it
      }

      const lifeTimeQtyControl = this.costingPartInfoform.controls['lifeTimeQtyRemaining'];
      const lifeTimeQtyValue = lifeTimeQtyControl.value;
      if (lifeTimeQtyValue === null || lifeTimeQtyValue === '' || (lifeTimeQtyControl.dirty && Number(lifeTimeQtyValue) === 0)) {
        this.costingPartInfoform.controls['lifeTimeQtyRemaining'].setValue(this.defaultValues.lifeTimeQtyRemaining > 0 ? this.defaultValues.lifeTimeQtyRemaining : '');
      }

      const isAnnualVolumeDirty = this.checkDirtyProperty('AnnualVolume') || this.costingPartInfoform.controls['AnnualVolume'].dirty;

      // Always calculate lot size when Annual Volume changes, unless user manually entered a custom lot size
      if (isAnnualVolumeDirty && !this.lotSizeUserEdited) {
        const annualVol = this.costingPartInfoform.controls['AnnualVolume'].value;
        if (annualVol > 0) {
          const vol = Math.round(Number(annualVol) / 12);
          this.costingPartInfoform.controls['lotsize'].setValue(vol);
        }
      }

      const isLifeTimeQtyDirty = this.checkDirtyProperty('lifeTimeQtyRemaining') || this.costingPartInfoform.controls['lifeTimeQtyRemaining'].dirty;
      if (!isLifeTimeQtyDirty && Number(this.costingPartInfoform.controls['lifeTimeQtyRemaining'].value) === 0) {
        this.updateLifeTimeQtyRemaining();
      }
    }
  }

  liferemaningtimechange(e: any) {
    const lifetime = e.currentTarget.value;
    if (!lifetime) {
      this.updateLifeTimeQtyRemaining();
      return;
    }
    const lifetimeNum = Number(lifetime);
    if (lifetimeNum != Number(this.currentPart.lifeTimeQtyRemaining)) {
      this.lifetimeremainingChangeEmit.emit(true);
    } else {
      this.lifetimeremainingChangeEmit.emit(false);
    }
  }

  onLotSizeChange(e: any) {
    const lotSizeValue = Number(e.currentTarget.value);
    const annualVol = this.costingPartInfoform.controls['AnnualVolume'].value;
    const calculatedLotSize = annualVol > 0 ? Math.round(Number(annualVol) / 12) : 0;
    if (lotSizeValue !== calculatedLotSize) {
      this.lotSizeUserEdited = true;
    } else {
      this.lotSizeUserEdited = false;
    }
  }

  updateLifeTimeQtyRemaining(): void {
    const annualVol = this.costingPartInfoform.controls['AnnualVolume'].value;
    if (annualVol === null || annualVol === '') {
      this.costingPartInfoform.controls['AnnualVolume'].setValue(this.defaultValues.annualVolume > 0 ? this.defaultValues.annualVolume : '');
      return;
    }
    let prodLifeRemaining = this.costingPartInfoform.controls['prodLifeRemaining'].value;
    if (!prodLifeRemaining) {
      prodLifeRemaining = this.defaultValues.prodLifeRemaining > 0 ? this.defaultValues.prodLifeRemaining : 5;
      this.costingPartInfoform.controls['prodLifeRemaining'].setValue(prodLifeRemaining);
    }
    if (annualVol > 0 && prodLifeRemaining > 0) {
      let lifetimeQty = Number(annualVol) * Number(prodLifeRemaining);
      lifetimeQty = lifetimeQty > 100000000 ? 100000000 : lifetimeQty;

      if (lifetimeQty != Number(this.currentPart.lifeTimeQtyRemaining)) {
        this.lifetimeremainingChangeEmit.emit(true);
      } else if (this.checkDirtyProperty('AnnualVolume')) {
        this.lifetimeremainingChangeEmit.emit(true);
      } else {
        this.lifetimeremainingChangeEmit.emit(false);
      }
      this.costingPartInfoform.controls['lifeTimeQtyRemaining'].setValue(lifetimeQty);
    }
  }

  onSupplierOptionChange(event: MatAutocompleteSelectedEvent) {
    this.afterChange = true;
    this.dirtyCheckEvent.emit(this.afterChange);
    this.selectedSupplier = event.option.value as DigitalFactoryDtoNew;
    if (this.selectedSupplier?.supplierId) {
      const country = this.countryList?.find((c) => c.countryId == this.selectedSupplier.supplierDirectoryMasterDto?.countryId);
      const supplierRevenue = this.getSupplierRevenueValue(this.selectedSupplier?.anulSpendType, AnnualRevenueTypeNameMap);
      const previousCountryId = (this.costingPartInfoform.controls['ManufacturingCountry'].value as CountryDataMasterDto)?.countryId || 0;
      if (previousCountryId > 0 && previousCountryId != this.selectedSupplier.supplierDirectoryMasterDto?.countryId) {
        this.countryChangeEmit.emit(true);
      } else {
        this.countryChangeEmit.emit(false);
      }
      this.costingPartInfoform.get('supplierRevenue')?.setValue(supplierRevenue);
      this.costingPartInfoform.get('mfrCity')?.setValue(this.selectedSupplier.supplierDirectoryMasterDto?.city);
      this.costingPartInfoform.get('ManufacturingCountry')?.setValue(country);
      const incoterm = this.selectedSupplier.incoterms?.toString() ?? this.incoterms[1].value;
      this.costingPartInfoform.get('IncoTerms')?.setValue(incoterm);
      this.costingPartInfoform.updateValueAndValidity();
    }
  }

  onNameOptionChange(event: MatAutocompleteSelectedEvent) {
    this.afterChange = true;
    this.dirtyCheckEvent.emit(this.afterChange);
    const val = event.option.value;
    if (val) {
      const dto = this.buLocationList.find((x) => x.buId == val?.buId);
      if (dto) {
        const country = this.countryList.find((x) => x.countryId == dto.country);
        // this.getControl('DeliverySite').setValue(dto.buName);
        this.getControl('DeliveryCity').setValue(dto.city);
        this.getControl('DeliveryCountry').setValue(country);
        this.costingPartInfoform.updateValueAndValidity();
      }
    }
  }

  displayMfrCountry(country: CountryDataMasterDto): string {
    return country?.countryName || '';
  }

  displayDeliveryCountry(country: CountryDataMasterDto): string {
    return country?.countryName || '';
  }

  displaySupplier(supplier: DigitalFactoryDtoNew): string {
    return supplier?.supplierDirectoryMasterDto?.vendorName || '';
  }

  displayBuName(bu: BuLocationDto): string {
    return bu?.buName || '';
  }

  onCommodityChange(event: any) {
    const commodityId = +event.currentTarget.value;
    if (commodityId && commodityId > 0) {
      if (this.isPartExist) {
        this.commodityChange.emit(commodityId);
      }
      const previousCommodityId = this.currentPart.commodityId || 0;
      if (previousCommodityId != commodityId) {
        // this.partCommodityChangeEvent.emit(true);
        this.reextractionLoaderChangesEvent.emit({ state: true, from: 'onCommodityChange', partInfoId: this.currentPart.partInfoId, partName: this.currentPart.intPartNumber });
      } else {
        // this.partCommodityChangeEvent.emit(false);
        this.reextractionLoaderChangesEvent.emit({ state: false, from: 'onCommodityChange', partInfoId: this.currentPart.partInfoId, partName: this.currentPart.intPartNumber });
      }
    }
    this.setUnitOfMeasurement(commodityId);
  }

  setUnitOfMeasurement(commodityId: number) {
    if (commodityId === CommodityType.Electricals) {
      this.isCustomCable = true;
    }
  }

  // onMachiningProcessChange(event: any) {
  //   if (!!event.currentTarget.value) {
  //     this.selectedMachiningProcesses.push(event.currentTarget.value);
  //     this.f.machiningProcesses.setValue('');
  //   }
  // }
  // removeMachiningProcess(event: any) {
  //   !!event && this.selectedMachiningProcesses.splice(this.selectedMachiningProcesses.indexOf(event), 1);
  // }

  onPackingChange(event: any) {
    if (this.currentPart) {
      const packagingId = +event.currentTarget.value;
      this.packingChange.emit(packagingId);
      const partInfoId = this.currentPart.partInfoId;
      const projectInfoId = this.currentPart.projectInfoId;

      if (projectInfoId && partInfoId && packagingId == 2) {
        const dialogRef = this.messaging.openConfirmationDialog(<ConfirmationDialogConfig>{
          data: {
            title: 'Confirm Delete',
            message: 'Previous Packing details and Logistic Details will be deleted. Confirm delete by selecting CONFIRM, or cancel this action by selecting CANCEL.',
            action: 'CONFIRM',
            cancelText: 'CANCEL',
          },
        });

        dialogRef.afterClosed().subscribe((confirmed: boolean) => {
          if (confirmed) {
            this.store.dispatch(new DeletePackagingInfo(partInfoId));
            this.store.dispatch(new DeleteLogisticInfo(partInfoId));
            this.dutyTariffSvc.deleteDutiesTariffByPartInfoId(partInfoId).pipe(takeUntil(this.unsubscribeAll$)).subscribe();
          } else {
            this.costingPartInfoform.controls['packingtype'].setValue(this.currentPart.packingModeId);
            this.packingChange.emit(this.currentPart.packingModeId);
          }
        });
      } else {
        this.costingPartInfoform.controls['packingtype'].setValue(event.currentTarget.value);
        this.packingChange.emit(event.currentTarget.value);
      }
    }
  }

  private getColorInfo() {
    this.fieldColorsList = [];
    if (this.currentPart?.partInfoId > 0) {
      this.sharedService
        .getColorInfos(this.currentPart?.partInfoId, ScreeName.PartInfo, this.currentPart?.partInfoId)
        .pipe(takeUntil(this.unsubscribeAll$))
        .subscribe((result: FieldColorsDto[]) => {
          if (result) {
            this.fieldColorsList = result;
            result.forEach((element) => {
              if (element.isTouched && this.costingPartInfoform.get(element.formControlName)) {
                this.costingPartInfoform.get(element.formControlName).markAsTouched();
              }
              if (element.isDirty) {
                this.costingPartInfoform.get(element.formControlName).markAsDirty();
              }
            });
            this.afterChange = false;
            this.dirtyCheckEvent.emit(this.afterChange);
            this.mapPartDetails();
            this.updateLotSize();
          }
        });
    }
  }

  private saveColoringInfo() {
    const dirtyItems = [];
    this.fieldColorsList = [];
    for (const el in this.costingPartInfoform?.controls) {
      if (this.costingPartInfoform.controls[el].dirty || this.costingPartInfoform.controls[el].touched) {
        const fieldColorsDto = new FieldColorsDto();
        fieldColorsDto.isDirty = this.costingPartInfoform.controls[el].dirty;
        fieldColorsDto.formControlName = el;
        fieldColorsDto.isTouched = this.costingPartInfoform.controls[el].touched;
        fieldColorsDto.partInfoId = this.currentPart.partInfoId;
        fieldColorsDto.screenId = ScreeName.PartInfo;
        fieldColorsDto.primaryId = this.currentPart.partInfoId;
        dirtyItems.push(fieldColorsDto);
      }
    }
    if (dirtyItems.length > 0) {
      this.sharedService
        .updateColorInfo(dirtyItems)
        .pipe(takeUntil(this.unsubscribeAll$))
        .subscribe((result) => {
          if (result) {
            this.fieldColorsList = result;
            result.forEach((element) => {
              if (element.isTouched) {
                this.costingPartInfoform.get(element.formControlName).markAsTouched();
              }
              if (element.isDirty) {
                this.costingPartInfoform.get(element.formControlName).markAsDirty();
              }
            });
            this.getColorInfo();
          }
        });
    }
  }

  public onFormSubmit(): Observable<PartInfoDto> {
    const partInfoDto = new PartInfoDto();
    partInfoDto.bomId = this.currentBomId;
    partInfoDto.partInfoId = this.currentPart.partInfoId;
    partInfoDto.projectInfoId = this.currentPart.projectInfoId;

    partInfoDto.intPartNumber = (this.costingPartInfoform.controls['IntPartNumber'].value || '').trim();
    partInfoDto.intPartDescription = (this.costingPartInfoform.controls['IntPartDesc'].value || '').trim();
    partInfoDto.partRevision = this.costingPartInfoform.controls['partRevision'].value;
    partInfoDto.makeBuy = parseInt(this.costingPartInfoform.controls['supplychainmodel'].value);
    // partInfoDto.castType = parseInt(this.costingPartInfoform.controls['castType'].value);
    // partInfoDto.machiningProcesses = this.selectedMachiningProcesses.join(',') || '';
    partInfoDto.partTypeId = this.currentPart.partTypeId;
    partInfoDto.costingMethodId = this.currentPart.costingMethodId;
    partInfoDto.costType = this.currentPart.costType;
    //partInfoDto.selectedMonth = this.currentMarketMonth;

    partInfoDto.supplierInfoId = (this.costingPartInfoform.controls['supplierName'].value as DigitalFactoryDtoNew)?.supplierId || undefined;
    partInfoDto.supplierRegionId = (this.costingPartInfoform.controls['supplierName'].value as DigitalFactoryDtoNew)?.supplierDirectoryMasterDto?.regionId || undefined;

    partInfoDto.supplierPartNumber = this.currentPart.supplierPartNumber;
    partInfoDto.deliveryCountryId = (this.costingPartInfoform.controls['DeliveryCountry'].value as CountryDataMasterDto)?.countryId || 0;
    partInfoDto.termId = this.costingPartInfoform.controls['IncoTerms'].value;
    const annualVolumeVal = this.costingPartInfoform.controls['AnnualVolume'].value;
    partInfoDto.eav = annualVolumeVal === null || annualVolumeVal === '' ? this.defaultValues.annualVolume : annualVolumeVal;
    console.log('------------------------------------onFormSubmit lotsize-----------------------------');
    const lotSizeVal = this.costingPartInfoform.controls['lotsize'].value;
    partInfoDto.lotSize = lotSizeVal === null || lotSizeVal === '' || Number(lotSizeVal) === 0 ? this.defaultValues.lotSize : lotSizeVal;
    partInfoDto.commodityId = this.costingPartInfoform.controls['commdityvalue'].value == '' ? null : this.costingPartInfoform.controls['commdityvalue'].value;
    partInfoDto.processTypeId = this.costingPartInfoform.controls['processname'].value == '' ? null : this.costingPartInfoform.controls['processname'].value;
    partInfoDto.noOfShifts = this.currentPart.noOfShifts;
    partInfoDto.currentBuyCost = this.currentPart.currentBuyCost;
    partInfoDto.partComplexity = Number(this.costingPartInfoform.controls['partcomplexcity'].value);
    partInfoDto.paymentTermId = this.costingPartInfoform.controls['PaymentTerms'].value == '' ? null : this.costingPartInfoform.controls['PaymentTerms'].value;
    partInfoDto.hscode = this.costingPartInfoform.controls['HsCode'].value;
    partInfoDto.ohpcategory = this.currentPart.ohpcategory;
    partInfoDto.remarksAssumptions = this.currentPart.remarksAssumptions;
    partInfoDto.packingModeId = parseInt(this.costingPartInfoform.controls['packingtype'].value);
    partInfoDto.deliveryFrequency = this.costingPartInfoform.controls['DeliveryFrequency'].value || 0;
    partInfoDto.extractionCategoryId = this.costingPartInfoform.controls['extractionCategoryId'].value || this.currentPart.extractionCategoryId;
    partInfoDto.incoTerm = this.incoterms.find((x) => x.value === this.costingPartInfoform.controls['IncoTerms'].value?.toString())?.name;
    partInfoDto.dataCompletionPercentage = this.dataCompletionPercentage;
    partInfoDto.buId = (this.getControl('DeliverySite').value as BuLocationDto)?.buId;
    partInfoDto.buRegionId = (this.getControl('DeliverySite').value as BuLocationDto)?.regionId;
    partInfoDto.vendorLocation = this.costingPartInfoform.controls['supplierName'].value as DigitalFactoryDtoNew;
    partInfoDto.buLocation = this.getControl('DeliverySite').value as BuLocationDto;
    partInfoDto.documentCollectionId = this.currentPart.documentCollectionDto?.documentCollectionId;
    const prodLifeRemainingVal = this.costingPartInfoform.controls['prodLifeRemaining'].value;
    partInfoDto.prodLifeRemaining = prodLifeRemainingVal === null || prodLifeRemainingVal === '' ? this.defaultValues.prodLifeRemaining : prodLifeRemainingVal;

    const lifeTimeQtyRemainingVal = this.costingPartInfoform.controls['lifeTimeQtyRemaining'].value;
    partInfoDto.lifeTimeQtyRemaining =
      lifeTimeQtyRemainingVal === null || lifeTimeQtyRemainingVal === '' || Number(lifeTimeQtyRemainingVal) === 0 ? this.defaultValues.lifeTimeQtyRemaining : lifeTimeQtyRemainingVal;
    partInfoDto.bomQty = this.costingPartInfoform.controls['bomqty'].value || 1;
    partInfoDto.drawingNumber = this.costingPartInfoform.controls['drawingNumber'].value;
    partInfoDto.scenarioId = this.currentPart.scenarioId || 0;
    partInfoDto.baseScenarioId = this.currentPart.baseScenarioId || 0;

    partInfoDto.mfrCountryId = (this.costingPartInfoform.controls['ManufacturingCountry'].value as CountryDataMasterDto)?.countryId || 0;

    if (!(this.costingPartInfoform.controls['supplierName'].value as DigitalFactoryDtoNew)?.supplierId) {
      partInfoDto.mfrCountryId = 0;
    }

    if (!(this.costingPartInfoform.controls['DeliverySite'].value as BuLocationDto)?.buId) {
      partInfoDto.deliveryCountryId = 0;
    }

    // this._partInfo$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((result: PartInfoDto) => {
    const result = this.partInfoSignalsService.partInfo();
    if (result) {
      partInfoDto.dataExtractionPercentage = result.dataExtractionPercentage;
      partInfoDto.dataExtractionStatus = result.dataExtractionStatus;
    }
    // });

    // partInfoDto.castType === 2 ? localStorage.setItem('machiningProcesses', partInfoDto.machiningProcesses) : localStorage.removeItem('machiningProcesses');
    this.updatePartInfo(partInfoDto);
    return new Observable((obs) => {
      obs.next(partInfoDto);
    });
  }

  checkIfFormDirty() {
    return this.afterChange;
  }

  resetform() {
    this.costingPartInfoform.reset();
  }
  private getPartDetailsById(result: PartInfoDto) {
    // this._partInfo$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((result: PartInfoDto) => {
    if (result) {
      this.costingPartInfoform?.reset();
      this.currentPart = {
        ...result,
        incoTerm: this.incoterms.find((x) => x.value === this.costingPartInfoform?.controls['IncoTerms'].value?.toString())?.name,
        vendorLocation: this.currentPart?.vendorLocation,
        buLocation: this.currentPart?.buLocation,
        // packingInfos: this.currentPart?.packingInfos,
      };
      if (Number(this.currentPart?.commodityId) > 0 && Number(this.currentPart?.extractionCategoryId) > 0 && Number(this.currentPart?.commodityId) != Number(this.currentPart?.extractionCategoryId)) {
        // this.partCommodityChangeEvent.emit(true);
        this.reextractionLoaderChangesEvent.emit({ state: true, from: 'getPart', partInfoId: this.currentPart.partInfoId, partName: this.currentPart.intPartNumber });
      } else {
        // this.partCommodityChangeEvent.emit(false);
        this.reextractionLoaderChangesEvent.emit({ state: false, from: 'getPart', partInfoId: this.currentPart.partInfoId, partName: this.currentPart.intPartNumber });
      }

      this.dispatchgetExtractedData(this.currentPart?.partInfoId);
      const packagingId = this.currentPart.packingModeId;
      this.packingChange.emit(packagingId);
      console.log('---------------------------------setForm getPartDetailsByid -------------------------------');
      this.setForm();
      this.percentageCalculator.dispatchHasPartSectionDataUpdateEvent({});
      this.partChange.emit(this.currentPart);
      this.navigatetoNextUrl();
    }
    // });
  }
  private updatePartInfo(partInfoDto: PartInfoDto) {
    // this.store.dispatch(new PartInfoActions.UpdatePartInfo(partInfoDto));
    this.partInfoSignalsService.updatePartInfo(partInfoDto);
    this.saveColoringInfo();
    this.isSubmitted = true;
    this.messaging.openSnackBar(`Data updated successfully.`, '', {
      duration: 5000,
    });
    this.afterChange = false;
    this.dirtyCheckEvent.emit(this.afterChange);
  }

  private reset() {
    if (this.costingPartInfoform) {
      console.log('------------------------ reset lotsize -------------------------------------');
      this.costingPartInfoform.reset({
        IntPartNumber: '',
        IntPartDesc: '',
        partRevision: '',
        bomqty: 1,
        AnnualVolume: '',
        supplierName: '',
        HsCode: 'N/A',
        lotsize: '',
        supplychainmodel: 2,
        // castType: 1,
        // machiningProcesses: '',
        partcomplexcity: 1,
        commdityvalue: '',
        processname: '',
        packingtype: 1,
        mfrCity: '',
        ManufacturingCountry: '',
        DeliveryCountry: '',
        IncoTerms: '',
        PaymentTerms: '',
        prodLifeRemaining: 5,
        lifeTimeQtyRemaining: 0,
        DeliveryFrequency: 30,
        drawingNumber: '',
      });
    }
  }

  private getCountryList() {
    this._countryData$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((result: CountryDataMasterDto[]) => {
      if (result && result.length > 0) {
        this.countryList = result;

        this.filteredMfrCountryList$ = this.manufacturingCountryControl?.valueChanges?.pipe(
          startWith(''),
          map((value) => this._filter(value || ''))
        );

        this.filteredDeliveryCountryList$ = this.deliveryCountryControl?.valueChanges?.pipe(
          startWith(''),
          map((value) => this._filter(value || ''))
        );
        this.setForm();
      }
    });
  }

  private getSupplierList() {
    this.blockUiService.pushBlockUI('getVendorList');
    // return this.vendorService
    //   .getVendorList()
    //   .pipe(takeUntil(this.unsubscribeAll$))
    //   .subscribe((result: VendorDto[]) => {
    //     this.blockUiService.popBlockUI('getVendorList');
    //     if (result && result.length > 0) {
    //       this.vendorDto = [...result];
    //       this.setForm();
    //       this.filteredSupplierList$ =
    //         this.supplierNameControl.valueChanges.pipe(
    //           startWith(''),
    //           map((value) => this.filterSupplier(value || ''))
    //         );
    //     }
    //   });

    return this.digitalFactoryService
      .getAllDigitalFactorySuppliers()
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe({
        next: (result: DigitalFactoryDtoNew[]) => {
          this.blockUiService.popBlockUI('getVendorList');
          this.digitalFactoryDto = result;
          this.setForm();
          this.filteredSupplierList$ = this.supplierNameControl.valueChanges.pipe(
            startWith(''),
            map((value) => this.filterSupplier(value || ''))
          );
        },
      });
  }

  private getCommodityList() {
    return this._commodityMaster$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((result: CommodityMasterDto[]) => {
      if (result) {
        const obj = {
          commodityId: 0,
          commodity: '----------------------------',
          isActive: false,
          priority: 4,
        };

        result?.forEach((element: any) => {
          if (element.isActive) {
            this.commodityListTemp.push(element);
          }
        });

        this.commodityListTemp.push(obj);

        result?.forEach((element: any) => {
          if (!element.isActive) {
            this.commodityListTemp.push(element);
          }
        });
        this.commodityList = this.commodityListTemp;
      }
    });
  }

  private _filter(value: any): CountryDataMasterDto[] {
    let filterValue = '';
    if (value instanceof Object) {
      filterValue = (value.countryName || '').toLowerCase();
    } else {
      filterValue = (value || '').toLowerCase();
    }
    return this.countryList.filter((country) => (country.countryName || '').toLowerCase().includes(filterValue));
  }

  private filterSupplier(value: any): DigitalFactoryDtoNew[] {
    let filterValue = '';
    if (value instanceof Object) {
      filterValue = (value.supplierName || '').toLowerCase();
    } else {
      filterValue = (value || '').toLowerCase();
    }
    return this.digitalFactoryDto?.filter((supplier) => (supplier.supplierDirectoryMasterDto?.vendorName || '').toLowerCase().includes(filterValue));
  }

  private mapPartDetails() {
    if (this.currentPart && this.currentPart.partInfoId && this.currentPart.commodityId) {
      this.commodityChange.emit(this.currentPart.commodityId);
    } else {
      this.reset();
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

  private setForm() {
    if (this.currentPart) {
      const annualVolumeDefault = Number(this.currentPart.eav || 0);
      const prodLifeRemainingDefault = Number(this.currentPart?.prodLifeRemaining || 5);

      const savedLotSize = Number(this.currentPart.lotSize || 0);
      const computedLotSize = annualVolumeDefault > 0 ? Math.round(annualVolumeDefault / 12) : 0;
      const lotSizeDefault = savedLotSize > 0 ? savedLotSize : computedLotSize;

      const savedLifeTimeQtyRemaining = Number(this.currentPart?.lifeTimeQtyRemaining || 0);
      let computedLifeTimeQtyRemaining = annualVolumeDefault > 0 ? annualVolumeDefault * prodLifeRemainingDefault : 0;
      computedLifeTimeQtyRemaining = computedLifeTimeQtyRemaining > 100000000 ? 100000000 : computedLifeTimeQtyRemaining;
      const lifeTimeQtyRemainingDefault = savedLifeTimeQtyRemaining > 0 ? savedLifeTimeQtyRemaining : computedLifeTimeQtyRemaining;

      this.defaultValues = {
        annualVolume: annualVolumeDefault,
        lotSize: lotSizeDefault,
        prodLifeRemaining: prodLifeRemainingDefault,
        lifeTimeQtyRemaining: lifeTimeQtyRemainingDefault,
      };

      const supplier = this.currentPart.supplierInfoId && this.currentPart.supplierInfoId > 0 ? this.digitalFactoryDto?.find((x) => x.supplierId == this.currentPart.supplierInfoId) : null;
      const supplierRevenue = supplier !== null && supplier?.anulSpendType > 0 ? this.getSupplierRevenueValue(supplier?.anulSpendType, AnnualRevenueTypeNameMap) : null;
      const dlvrySite = this.currentPart?.buId && this.buLocationList.find((x) => x.buId == this.currentPart.buId);
      let mfrCountry = this.currentPart.mfrCountryId && this.currentPart.mfrCountryId > 0 ? this.countryList?.find((x) => x.countryId == this.currentPart.mfrCountryId) : null;
      if (!mfrCountry && supplier?.supplierDirectoryMasterDto?.countryId > 0) {
        mfrCountry =
          supplier?.supplierDirectoryMasterDto?.countryId && supplier?.supplierDirectoryMasterDto?.countryId > 0
            ? this.countryList?.find((x) => x.countryId == supplier?.supplierDirectoryMasterDto?.countryId)
            : null;
      }
      const deliveryCountry = this.currentPart.deliveryCountryId && this.currentPart.deliveryCountryId > 0 ? this.countryList?.find((x) => x.countryId == this.currentPart.deliveryCountryId) : null;
      if (this.currentPart.buId) {
        this.currentPart.buLocation = this.buLocationList.find((x) => x.buId == this.currentPart?.buId);
      }
      if (this.currentPart.supplierInfoId) {
        this.currentPart.vendorLocation = this.digitalFactoryDto?.find((x) => x.supplierId == this.currentPart?.supplierInfoId);
      }
      const incoTermValue = this.getCurrentIncoTermValue(supplier);
      this.costingPartInfoform?.patchValue({
        IntPartNumber: this.currentPart.intPartNumber,
        IntPartDesc: this.currentPart.intPartDescription,
        partRevision: this.currentPart.partRevision,
        bomqty: this.currentPart.bomQty || 1,
        partcomplexcity:
          this.currentPart.commodityId === CommodityType.MetalForming && this.currentPart.partComplexity === PartComplexity.Low
            ? PartComplexity.Medium
            : (this.currentPart.partComplexity ?? PartComplexity.Low),
        AnnualVolume: this.currentPart.eav,
        supplierName: supplier,
        supplierRevenue: supplierRevenue,
        lotsize: this.defaultValues.lotSize > 0 ? Math.round(Number(this.defaultValues.lotSize)) : '',
        supplychainmodel: this.currentPart.makeBuy || 2,
        // castType: this.currentPart.castType || (localStorage.getItem('machiningProcesses')?.split(',')?.length > 0 ? 2 : 1),
        commdityvalue: this.currentPart.commodityId,
        processname: this.currentPart.processTypeId,
        packingtype: this.currentPart.packingModeId,
        HsCode: this.currentPart.hscode,
        ManufacturingCountry: mfrCountry,
        mfrCity: supplier?.supplierDirectoryMasterDto?.city,
        DeliveryCountry: deliveryCountry,
        IncoTerms: Number(incoTermValue) > 0 ? incoTermValue : this.incoterms[1].value,
        PaymentTerms: this.currentPart.paymentTermId,
        DeliveryFrequency: this.currentPart.deliveryFrequency || 30,
        DeliverySite: dlvrySite,
        DeliveryCity: dlvrySite?.city,
        prodLifeRemaining: this.currentPart?.prodLifeRemaining || 5,
        lifeTimeQtyRemaining: this.defaultValues.lifeTimeQtyRemaining > 0 ? this.defaultValues.lifeTimeQtyRemaining : '',
        drawingNumber: this.currentPart?.drawingNumber,
        baseScenarioId: this.currentPart?.baseScenarioId,
        senarioId: this.currentPart?.scenarioId,
        extractionCategoryId: this.currentPart?.extractionCategoryId,
      });
      if (Math.round(Number(this.currentPart.lotSize)) === 0 || !this.currentPart?.lifeTimeQtyRemaining) {
        this.updateLotSize();
      }
      // this.selectedMachiningProcesses = this.currentPart?.machiningProcesses?.split(',') || localStorage.getItem('machiningProcesses')?.split(',')?.map(x => Number(x)) || [];
      this.afterChange = false;
      this.dirtyCheckEvent.emit(this.afterChange);
    }
  }

  private getCurrentIncoTermValue(supplier: DigitalFactoryDtoNew) {
    if (this.currentPart.termId > 0) {
      return this.currentPart.termId.toString();
    }
    if (supplier?.incoterms) {
      return supplier?.incoterms.toString();
    }
    return this.currentPart.termId;
  }

  public reExtraction(partId: number) {
    this.dirtyCheckEvent.emit(false);
    this.afterChange = false;
    this.costingPartInfoform.markAsPristine();

    const extractDataRequest = new ExtractionData();
    extractDataRequest.projectInfoId = this.currentPart.projectInfoId;
    const partList: PartsList = {
      partInfoId: partId,
      partName: this.costingPartInfoform.controls['IntPartNumber'].value,
      commodityId: Number(this.costingPartInfoform.controls['commdityvalue'].value),
    } as PartsList;
    extractDataRequest.partsList = [partList];
    this.extractionQueue.push(extractDataRequest);
    console.log('Reextraction queued for', partId);
    if (this.extractionQueue.length === 1) {
      // first reextracted item
      this.retryCount = 0;
      this.executeReExtraction(this.extractionQueue[0]);
    }
  }

  private executeReExtraction(extractDataRequest: ExtractionData) {
    const partInfoId = extractDataRequest.partsList[0].partInfoId;
    this.projectInfoService
      .reExtraction(extractDataRequest)
      .pipe(take(1))
      .subscribe((result: boolean) => {
        if (result) {
          // console.log('Reextraction completed, fininsing not-triggered');
          // setTimeout(() => {
          if (partInfoId === this.currentPart.partInfoId) {
            // this.store.dispatch(new PartInfoActions.GetPartInfo(partInfoId));
            this.partInfoSignalsService.getPartInfo(partInfoId);
            this.costSummarySignalsService.getCostSummaryByPartInfoId(partInfoId);
            this.messaging.openSnackBar('Data Extraction for selected commodity is completed.', '', { duration: 5000 });
          }
          // this.partCommodityChangeEvent.emit(false);
          console.log('Reextraction fininshed for', partInfoId);
          this.reextractionLoaderChangesEvent.emit({ state: false, from: 'extractionCompleted', partInfoId: partInfoId, partName: extractDataRequest.partsList[0].partName });
          // }, 25000);
        } else {
          this.retryCount++;
          if (this.retryCount <= 5) {
            console.log('Reextraction failed, Retrying for', partInfoId);
            this.executeReExtraction(extractDataRequest);
          } else {
            this.messaging.openSnackBar('Reextraction Failed for ' + partInfoId, '', { duration: 5000 });
            console.log('Reextraction failed for', partInfoId);
            this.reextractionLoaderChangesEvent.emit({ state: false, from: 'extractionFailed', partInfoId: partInfoId, partName: extractDataRequest.partsList[0].partName });
            result = true; // by pass
          }
        }

        if (result) {
          this.extractionQueue.shift();
          this.retryCount = 0;
          if (this.extractionQueue.length > 0) {
            // proceed to reextracted of the next item
            this.executeReExtraction(this.extractionQueue[0]);
          }
        }
      });
  }

  private navigatetoNextUrl() {
    if (this.nexturltonavigate != '' && this.nexturltonavigate != undefined) {
      const tempUrl = this.nexturltonavigate + '?ignoreactivate=1';
      this.nexturltonavigate = '';
      this.router.navigateByUrl(tempUrl);
    }
    if ((this.selectedBOM != '' && this, this.selectedBOM != undefined)) {
      this.notSavedService.dispatchBOMSelectionChanges(this.selectedBOM);
    }
  }

  private getSiteList() {
    // this.blockUiService.pushBlockUI('getSiteList');
    return this.buLocationSvc
      .getBuLocation()
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe((result: BuLocationDto[]) => {
        // this.blockUiService.popBlockUI('getSiteList');
        if (result?.length > 0) {
          this.buLocationList = [...result];
          this.filteredBuList$ = this.getControl('DeliverySite').valueChanges.pipe(
            startWith(''),
            map((value) => this._filterBuName(value || ''))
          );
          console.log('---------------------------------setForm getSiteList -------------------------------');
          this.setForm();
        }
      });
  }

  private _filterBuName(value: any): BuLocationDto[] {
    let filterValue = '';
    if (value instanceof Object) {
      filterValue = (value.countryName || '').toLowerCase();
    } else {
      filterValue = (value || '').toLowerCase();
    }
    return this.buLocationList.filter((bu) => (bu.buName || '').toLowerCase().includes(filterValue));
  }

  private getControl(name: string) {
    return this.costingPartInfoform?.get(name) as AbstractControl;
  }

  showinfo(filterValue: string) {
    let objdesc;
    if (this.lstdescriptions && this.lstdescriptions.length > 0) {
      objdesc = this.lstdescriptions.find((item: { id: string }) => item.id.toLowerCase() === filterValue.toLowerCase());
    }

    if (objdesc) {
      this.url = objdesc.imageUrl;
      this.show = this.url !== '';
      this.name = objdesc.descriptions?.replace(/\n/g, '<br>') || '';
    }
  }

  copyEmail(email: string) {
    this.clipboard.copy(email);
  }

  private loadMarker(vendorName: string): void {
    this.digitalFactoryService
      .getSupplierMarkerByName(vendorName)
      .pipe(takeUntil(this.unsubscribeAll$))
      .subscribe((response) => {
        if (response) {
          this.marker = {
            lat: response.lat,
            lng: response.lng,
            icon: 'assets/icons/map-marker-single.svg',
          };
        }
      });
  }

  ngOnDestroy(): void {
    // this.store.dispatch(new PartInfoActions.ResetPartInfo());
    this.partInfoSignalsService.clearPartInfo();
    this.unsubscribeAll$.next(undefined);
    this.unsubscribeAll$.complete();
  }
}
