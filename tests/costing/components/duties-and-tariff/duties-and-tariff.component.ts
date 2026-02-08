import { Component, Input, OnInit, SimpleChanges, OnChanges, OnDestroy, EventEmitter, Output, TemplateRef, AfterViewInit, effect } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { Observable, Subject, Subscription, of, forkJoin, EMPTY } from 'rxjs';
import { tap, catchError, takeUntil, take, switchMap, map } from 'rxjs/operators';
import { MessagingService } from 'src/app/messaging/messaging.service';
// import { CostSummaryState } from 'src/app/modules/_state/cost-summary.state';
import { CountryDataMasterDto, DutiesTariffDto, PartInfoDto, ViewCostSummaryDto } from 'src/app/shared/models';
import { BlockUiService, HtsMasterService } from 'src/app/shared/services';
import { DutiesTariffService } from 'src/app/shared/services/duties-tariff.service';
// import * as CostSummaryActions from 'src/app/modules/_actions/cost-summary.action';
import * as MasterDataActions from 'src/app/modules/_actions/master-data.action';
import { NumberConversionService } from '../../../../services/number-conversion-service/number-conversion-service';
import { CommonModule } from '@angular/common';
import { OnlyNumber } from 'src/app/shared/directives';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
// import { MaterialInfoState } from 'src/app/modules/_state/material-info.state';
import { HtsMasterState } from 'src/app/modules/_state/hts-master.state';
import { HtsMasterDto, HtsSubHeading1Dto, HtsSubHeading2Dto, HtsMasterDataDto } from 'src/app/shared/models/hts-master.model';
import { CountryDataState } from 'src/app/modules/_state/country.state';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { GenericDataTableComponent } from 'src/app/shared/components/generic-data-table/generic-data-table.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { TariffBreakDownRequest, TariffRequestData } from 'src/app/shared/models/tariff-breakdowns-request.model';
import { TariffBreakDownResponse } from 'src/app/shared/models/tariff-breakdowns-response.model';
import { MaterialModule } from 'src/app/shared/material.module';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import * as DescriptionJson from 'src/assets/descriptions.json';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { CostSummarySignalsService } from 'src/app/shared/signals/cost-summary-signals.service';

@Component({
  selector: 'app-duties-and-tariff',
  templateUrl: './duties-and-tariff.component.html',
  styleUrls: ['./duties-and-tariff.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    OnlyNumber,
    MatIconModule,
    GenericDataTableComponent,
    MatTableModule,
    MatExpansionModule,
    MaterialModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTooltip,
    NgbPopover,
  ],
})
export class DutiesAndTariffComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  // [x: string]: any; // do not use this
  @Input() part: PartInfoDto;
  @Input() canUpdate: boolean = false;
  @Output() completionPercentageChange = new EventEmitter<number>();
  @Output() dirtyCheckEvent = new EventEmitter<boolean>();
  @Input() recalculateSubject: Subject<PartInfoDto>;
  @Input() countryChangeSubject: Subject<boolean>;
  @Output() partChange: EventEmitter<PartInfoDto> = new EventEmitter<PartInfoDto>();
  @Output() formLoaded = new EventEmitter<{ componentName: string; formName: string; loadTime?: number }>();
  completionPctg: number;
  dutiesTariffDto: DutiesTariffDto;
  private costSummaryData: ViewCostSummaryDto;
  hasUnsavedEventSub$: Subscription = Subscription.EMPTY;
  nexturltonavigate: any;
  dutiesTariffForm: FormGroup;
  dialogRef!: MatDialogRef<any>;
  countryList: CountryDataMasterDto[] = [];
  tariffBreakDown: any;

  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  currentPart: PartInfoDto;

  // spend classification and tariff
  htsCode: string = '';
  htsSectionList: any[] = [];
  htsGroupedSections: any[] = [];
  htsChapterList: any[] = [];
  htsHeadingList: any[] = [];
  htsSubHeadingList: any[] = [];
  htsSubHeading1List: HtsSubHeading1Dto[] = [];
  htsSubHeading2List: HtsSubHeading2Dto[] = [];
  htsSectionMasterList: any[] = [];
  htsChapterMasterList: any[] = [];
  htsHeadingMasterList: any[] = [];
  htsSubHeadingMasterList: any = [];
  htsMasterList: HtsMasterDataDto[] = [];

  isCountryChanged = false;
  isDeleteAndRecalculateRequired = false;
  selectedIndex = 0;
  tariffLoader = false;
  previousValues: any;

  columns = [
    { field: 'htsCode', header: 'HTS Code' },
    { field: 'htsSectionName', header: 'Section' },
    { field: 'htsChapterName', header: 'Chapter' },
    { field: 'htsHeadingName', header: 'Heading' },
    { field: 'htsSubHeadingName', header: 'Sub Heading' },
    { field: 'htsSubHeading1Name', header: 'Sub Heading 1' },
    { field: 'htsSubHeading2Name', header: 'Sub Heading 2' },
  ];

  totalDutyTariff = 0;
  tariffList: any[] = [];
  displayedColumns: string[] = ['edit', 'tariffTypeExtraction', 'tariffAppliesTo', 'tariffPercentage', 'tariff', 'action'];
  selectedTariffBreakdownId = 0;
  dataSource = new MatTableDataSource([]);
  tariffTypeList: any[] = [
    { tariffTypeId: '1', tariffTypeName: 'Normal Duty Rate' },
    { tariffTypeId: '2', tariffTypeName: 'Other' },
  ];
  tariffAppliesToList: any[] = [
    { tariffAppliesToId: '1', tariffAppliesToName: 'FOB' },
    { tariffAppliesToId: '2', tariffAppliesToName: 'EXW' },
    { tariffAppliesToId: '3', tariffAppliesToName: 'CIF' },
    { tariffAppliesToId: '4', tariffAppliesToName: 'Other' },
  ];
  tariffBreakDownRequest: TariffBreakDownRequest = {} as TariffBreakDownRequest;
  tariffRequestData: TariffRequestData = {} as TariffRequestData;

  _htsMasterData$: Observable<HtsMasterDto>;
  // _materialInfo$: Observable<MaterialInfoDto[]>;
  _countryData$: Observable<CountryDataMasterDto[]>;
  // _costSummary$: Observable<ViewCostSummaryDto[]>;
  private unsubscribeAll$: Subject<undefined> = new Subject<undefined>();

  public popoverHook: NgbPopover;
  popupUrl: any;
  popupName: any;
  lstdescriptions: any = (DescriptionJson as any).default;

  get f() {
    return this.dutiesTariffForm?.controls;
  }

  get tariffBreakdownControls() {
    return (this.dutiesTariffForm.get('tariffBreakDown') as FormGroup).controls;
  }

  get sumOfCost() {
    const { packingCost } = this.dutiesTariffDto;
    const eXWPartCostAmount = this.geteXWPartCostAmount();
    const sum = eXWPartCostAmount + packingCost || 0;
    return sum;
  }

  costSummaryEffect = effect(() => {
    const costSummarys = this.costSummarySignalsService.costSummarys();
    if (costSummarys?.length > 0) {
      this.costSummaryData = costSummarys[0];
    } else {
      this.costSummaryData = new ViewCostSummaryDto();
    }
  });

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private messaging: MessagingService,
    private blockUiService: BlockUiService,
    public sharedService: SharedService,
    private dutieSvc: DutiesTariffService,
    private _store: Store,
    private _numberConversionService: NumberConversionService,
    private htsMasterService: HtsMasterService,
    private costSummarySignalsService: CostSummarySignalsService
  ) {
    this._htsMasterData$ = this._store.select(HtsMasterState.getAllHtsMasterData);
    // this._materialInfo$ = this._store.select(MaterialInfoState.getMaterialInfos);
    this._countryData$ = this._store.select(CountryDataState.getCountryData);
    // this._costSummary$ = this._store.select(CostSummaryState.getCostSummarys);
  }

  ngOnInit(): void {
    this._htsMasterData$.pipe(takeUntil(this.unsubscribe$)).subscribe((result: any) => {
      if (result.sections?.length === 0) {
        this._store.dispatch(new MasterDataActions.GetAllHtsMasterData());
      }
    });
    this.dataSource.data = this.tariffList || [];
    this.createForm(this.dutiesTariffDto);
    // this.getCostSummaryDetails();
    this.completionPercentageChange.emit(0);
    this.recalculateSubject.pipe(takeUntil(this.unsubscribe$)).subscribe((e) => {
      this.recalculateDutifyTariffBreakDowns(e);
    });
    this.countryChangeSubject?.pipe(takeUntil(this.unsubscribe$)).subscribe((e) => {
      console.log('Country change event received:', e);
      this.isCountryChanged = e;
    });
    this.previousValues = this.dutiesTariffForm.getRawValue();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['part'] && changes['part'].currentValue && changes['part'].currentValue !== changes['part'].previousValue) {
      this.currentPart = changes['part'].currentValue;
      if (changes['part'].currentValue?.partInfoId !== changes['part'].previousValue?.partInfoId || changes['part'].currentValue?.commodityId !== changes['part'].previousValue?.commodityId) {
        if (this.currentPart?.partInfoId > 0) {
          this.dutiesTariffDto = new DutiesTariffDto();
          this.createForm(this.dutiesTariffDto);
          this.getHtsMasterData();
          this.getDutiesTariffByPartInfoId(this.currentPart.partInfoId);
          setTimeout(() => {
            this.setHtsCode();
          }, 1000);
        }
      }

      if (
        (changes['part'].previousValue?.mfrCountryId && changes['part'].currentValue?.mfrCountryId !== changes['part'].previousValue?.mfrCountryId) ||
        (changes['part'].previousValue?.deliveryCountryId && changes['part'].currentValue?.deliveryCountryId !== changes['part'].previousValue?.deliveryCountryId) ||
        (changes['part'].previousValue?.lotSize && changes['part'].currentValue?.lotSize !== changes['part'].previousValue?.lotSize)
      ) {
        setTimeout(() => {
          this.htsCode = this.f.htsCode.value;
          this.isDeleteAndRecalculateRequired = true;
          // this.getDutifyTariffBreakDowns();
        }, 2000);
      }
    }
    this.setCooDeliveryCountry();
  }

  ngAfterViewInit() {
    this.formLoaded.emit({
      componentName: 'dutiesAndTariffComponent',
      formName: 'dutiesTariffForm',
      loadTime: 5000,
    });
  }

  // getCostSummaryDetails() {
  //   this._costSummary$.pipe(takeUntil(this.unsubscribe$)).subscribe((result: ViewCostSummaryDto[]) => {
  //     if (result?.length > 0) {
  //       this.costSummaryData = result[0];
  //     } else {
  //       this.costSummaryData = new ViewCostSummaryDto();
  //     }
  //   });
  // }

  geteXWPartCostAmount() {
    if (this.costSummaryData) {
      const manuFactCost = (this.costSummaryData.sumManufacturingCost || 0) + (this.costSummaryData.platingCost || 0);
      const materialCost = this.sharedService.isValidNumber(Number(this.costSummaryData.sumNetMatCost));
      const billOfMaterialCost = this.sharedService.isValidNumber(Number(this.costSummaryData.sumBillOfMaterial));
      const manufacturingCostAmount = this.sharedService.isValidNumber(Number(manuFactCost) || 0);
      const overheadandProfitAmount = this.sharedService.isValidNumber(Number(this.costSummaryData.sumOverHeadCost));
      const toolingCostAmount = this.sharedService.isValidNumber(Number(this.costSummaryData.toolingCost));
      const packagingCostAmount = this.sharedService.isValidNumber(Number(this.costSummaryData.packingCost));
      const eXWPartCostAmount =
        Number(materialCost) + Number(billOfMaterialCost) + Number(manufacturingCostAmount) + Number(overheadandProfitAmount) + Number(toolingCostAmount) + Number(packagingCostAmount);
      return eXWPartCostAmount;
    }
    return 0;
  }

  ngOnDestroy() {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }

  onFormValueChange() {
    this.dirtyCheckEvent.emit(true);
  }

  public onFormSubmit(message?: any): Observable<DutiesTariffDto> {
    if (this.dutiesTariffForm.invalid) {
      const model = new DutiesTariffDto();
      return new Observable((obs) => {
        obs.next(model);
      });
    }

    const {
      htsCode,
      unspscCode,
      duties,
      taxes,
      dutiesPerPart,
      tariffPerPart,
      taxPerPart,
      totalPerPart,

      htsSectionId,
      htsChapterId,
      htsHeadingId,
      htsSubHeadingId,
      htsSubHeading1Id,
      htsSubHeading2Id,
      coo,
      deliveryCountry,
      tariffBreakDowns,
      tariffBreakDown: { tariffBreakDownId = 0, tariffType, tariffAppliesTo, tariffPercentage, tariff, comments, tariffTypeExtraction },
    } = this.dutiesTariffForm.getRawValue();

    // const newTariffBreakDown = {
    //   tariffBreakDownId: tariffBreakDownId || 0,
    //   tariffType: tariffType || 0,
    //   tariffAppliesTo: tariffAppliesTo || 0,
    //   tariffPercentage: tariffPercentage || 0,
    //   tariff: tariff || 0,
    //   tariffTypeExtraction: tariffTypeExtraction || '',
    //   comments,
    // };

    // Update the array only if a matching ID exists
    //const updatedTariffBreakDowns = this.dutiesTariffDto.tariffBreakDowns.map((item) => (item.tariffBreakDownId === tariffBreakDownId ? newTariffBreakDown : item));

    if (
      this.dutiesTariffDto?.tariffBreakDowns &&
      this.dutiesTariffDto?.tariffBreakDowns.length > 0
      // && this.selectedIndex >= 0
      // && this.dutiesTariffDto?.tariffBreakDowns[this.selectedIndex]?.tariffBreakDownId === this.selectedTariffBreakdownId
    ) {
      this.dutiesTariffDto.tariffBreakDowns[this.selectedIndex] = {
        tariffBreakDownId: tariffBreakDownId || 0,
        tariffType: tariffType || 0,
        tariffAppliesTo: tariffAppliesTo || 0,
        tariffPercentage: tariffPercentage || 0,
        tariff: tariff || 0,
        comments,
        tariffTypeExtraction: tariffTypeExtraction || '',
      };
    }
    //tariffBreakDowns = this.dutiesTariffDto?.tariffBreakDowns || [];

    this.dutiesTariffDto = {
      ...this.dutiesTariffDto,
      htsCode,
      unspscCode,
      duties,
      taxes,
      dutiesPerPart,
      tariffPerPart,
      taxPerPart,
      totalPerPart,
      htsSectionId,
      htsChapterId,
      htsHeadingId,
      htsSubHeadingId,
      htsSubHeading1Id,
      htsSubHeading2Id,
      coo,
      deliveryCountry,
      tariffBreakDowns: tariffBreakDowns || this.dutiesTariffDto?.tariffBreakDowns || [],
    };

    this.dataSource.data = this.dutiesTariffDto.tariffBreakDowns || [];
    // if (newTariffBreakDown.tariffBreakDownId === 0) {
    //   this.dutiesTariffDto.tariffBreakDowns = this.dataSource.data;
    // }
    this.dutiesTariffDto.totalPerPart = this.calculateTotalDutyTariff();
    this.dutiesTariffDto.dataCompletionPercentage = this.completionPctg;
    this.dutiesTariffDto.partInfoId = this.currentPart.partInfoId;
    this.dutiesTariffDto.projectInfoId = this.currentPart.projectInfoId;
    // this.blockUiService.pushBlockUI('save');
    this.dutieSvc
      .saveDutiesTariff(this.dutiesTariffDto)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          // this.blockUiService.popBlockUI('save');
          this.dutiesTariffDto.dutiesTariffId = res.dutiesTariffId;
          this.dutiesTariffDto.tariffBreakDowns = this.dataSource.data;
          this.costSummarySignalsService.getCostSummaryByPartInfoId(this.currentPart.partInfoId);
          this.previousValues = this.dutiesTariffForm.getRawValue();
          this.getDutiesTariffByPartInfoId(this.currentPart.partInfoId);
          this.displayMsg(message || 'Data saved sucessfully.');
        },
        error: () => {
          // this.blockUiService.popBlockUI('save');
          console.error();
          this.displayMsg('Something went wrong!.');
        },
      });

    return new Observable((obs) => {
      obs.next(this.dutiesTariffDto);
    });
  }

  private createForm(_dto: DutiesTariffDto) {
    this.dutiesTariffForm = this.fb.group({
      dutiesTariffId: [_dto?.dutiesTariffId || 0],
      partInfoId: [_dto?.partInfoId || 0],
      projectInfoId: [_dto?.projectInfoId || 0],
      duties: [_dto?.duties || 0, [Validators.required]],
      taxes: [_dto?.taxes || 0, [Validators.required]],
      dutiesPerPart: [_dto?.dutiesPerPart || 0],
      tariffPerPart: [_dto?.tariffPerPart || 0],
      taxPerPart: [_dto?.taxPerPart || 0],
      totalPerPart: [_dto?.totalPerPart || 0],
      eXWPartCostAmount: [this.geteXWPartCostAmount() || 0],
      packingCost: [_dto?.packingCost || 0],
      htsCode: [_dto?.htsCode || '', [Validators.required]],

      htsSectionId: [_dto?.htsSectionId || '', [Validators.required]],
      htsChapterId: [_dto?.htsChapterId || '', [Validators.required]],
      htsHeadingId: [_dto?.htsHeadingId || '', [Validators.required]],
      htsSubHeadingId: [_dto?.htsSubHeadingId || '', [Validators.required]],
      htsSubHeading1Id: [_dto?.htsSubHeading1Id || '', [Validators.required]],
      htsSubHeading2Id: [_dto?.htsSubHeading2Id || '', [Validators.required]],
      coo: [_dto?.coo || '', [Validators.required]],
      deliveryCountry: [_dto?.deliveryCountry || '', [Validators.required]],
      htsInternalClassificationCode: [_dto?.htsInternalClassificationCode || ''],
      htsInternalDescription: [_dto?.htsInternalDescription || ''],
      tariffBreakDown: this.fb.group({
        tariffBreakDownId: [_dto?.tariffBreakDown?.tariffBreakDownId || 0],
        tariffType: [_dto?.tariffBreakDown?.tariffType || 0],
        tariffAppliesTo: [_dto?.tariffBreakDown?.tariffAppliesTo || 0],
        tariffPercentage: [_dto?.tariffBreakDown?.tariffPercentage || 0],
        tariff: [_dto?.tariffBreakDown?.tariff || 0],
        comments: [_dto?.tariffBreakDown?.comments || ''],
        tariffTypeExtraction: [_dto?.tariffBreakDown?.tariffTypeExtraction || ''],
      }),
    });

    this.dutiesTariffForm.valueChanges.subscribe(() => {
      this.completionPctChng();
    });
  }

  private calcXWPartCostAmount(costSummary: ViewCostSummaryDto) {
    let eXWPartCostAmount = 0;
    if (costSummary) {
      const { currMaterialCost, sumManufacturingCost, sumOverHeadCost } = costSummary;
      eXWPartCostAmount = currMaterialCost + sumManufacturingCost + sumOverHeadCost;
    }
    return eXWPartCostAmount;
  }

  private displayMsg(msg: string) {
    this.messaging.openSnackBar(msg, '', { duration: 5000 });
  }

  private completionPctChng() {
    const value = this.calculatePercentage();
    this.completionPercentageChange.emit(value);
    this.completionPctg = value;
  }

  private calculatePercentage() {
    const totalFields = Object.keys(this.getFormData()).length - 4;
    const nonEmptyWeightage = this.findNonEmptyControlsRecursive(this.dutiesTariffForm)?.length;

    let percentage: number = 0;
    if (totalFields > 0) {
      percentage = (nonEmptyWeightage / totalFields) * 100;
      percentage = Math.ceil(percentage);
      percentage = percentage > 100 ? 100 : percentage;
    }
    return percentage;
  }

  private getFormData() {
    return this.dutiesTariffForm.value;
  }

  private findNonEmptyControlsRecursive(formToInvestigate: FormGroup | FormArray): string[] {
    const nonEmptyControls: string[] = [];
    const recursiveFunc = (form: FormGroup | FormArray) => {
      Object.keys(form.controls).forEach((field) => {
        const control = form.get(field);
        if (control.value) nonEmptyControls.push(field);
        if (control instanceof FormGroup) {
          recursiveFunc(control);
        } else if (control instanceof FormArray) {
          recursiveFunc(control);
        }
      });
    };
    recursiveFunc(formToInvestigate);
    return nonEmptyControls;
  }

  getDutiesTariffByPartInfoId(partInfoId: number) {
    this.dutieSvc
      .getDutiesTariffByPartInfoId(partInfoId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          let tariffBreakDowns: any[] = [];
          if (res && res.length > 0) {
            this.dutiesTariffDto = res[0];
            tariffBreakDowns = [...this.getTafiffBreakDownList(res[0].tariffBreakDowns, this.tariffTypeList, this.tariffAppliesToList)];
          } else {
            this.dutiesTariffDto = new DutiesTariffDto();
          }
          const eXWPartCostAmount = this.calcXWPartCostAmount(this.costSummaryData);
          this.dutiesTariffDto.eXWPartCostAmount = eXWPartCostAmount;
          this.dutiesTariffDto.packingCost = this.costSummaryData?.packingCost || 0;
          this.tariffList = tariffBreakDowns || [];
          this.dataSource.data = this.tariffList || [];
          this.selectedTariffBreakdownId = this.tariffList.length > 0 ? this.tariffList[this.selectedIndex].tariffBreakDownId : 0;
          this.dutiesTariffDto.tariffBreakDowns = this.tariffList;
          this.createForm(this.dutiesTariffDto);
          this.setBreakdownForm();
          this.setCooDeliveryCountry();
          if (this.dutiesTariffDto.htsCode) {
            const htsSelection = {
              htsChapterId: this.dutiesTariffDto.htsChapterId,
              htsHeadingId: this.dutiesTariffDto.htsHeadingId,
              htsSectionId: this.dutiesTariffDto.htsSectionId,
              htsSubHeading1Id: this.dutiesTariffDto.htsSubHeading1Id,
              htsSubHeading2Id: this.dutiesTariffDto.htsSubHeading2Id,
              htsSubHeadingId: this.dutiesTariffDto.htsSubHeadingId,
              htsCode: this.dutiesTariffDto.htsCode,
              isEdit: true,
            };
            this.handleSearchSelection(htsSelection);
          }
          this.completionPctChng();
        },
        error: () => {
          console.error();
        },
      });
  }

  // HTS
  private getHtsMasterData() {
    this.setCooDeliveryCountry();
    this._htsMasterData$.pipe(takeUntil(this.unsubscribe$)).subscribe((result: any) => {
      // Assuming htsSectionList is the full flat list you shared
      this.htsSectionMasterList = result.sections;
      this.htsChapterMasterList = result.chapters;
      this.htsHeadingMasterList = result.headings;
      this.htsSubHeadingMasterList = result.subHeadings;
      this.htsSectionList = result.sections;
      this.htsChapterList = result.chapters;
      this.htsHeadingList = result.headings;
      this.htsSubHeadingList = result.subHeadings;

      this.htsGroupedSections = [
        {
          groupName: 'Most Common Categories',
          items: this.htsSectionList.filter((x) => x.groupName === 'Most Common Categories').sort((a, b) => a.rank - b.rank),
        },
        {
          groupName: 'Additional Categories',
          items: this.htsSectionList.filter((x) => x.groupName === 'Additional Categories').sort((a, b) => a.rank - b.rank),
        },
      ];
    });
  }

  private setCooDeliveryCountry() {
    if (this.currentPart?.mfrCountryId) {
      this._countryData$.pipe(takeUntil(this.unsubscribeAll$)).subscribe((result: CountryDataMasterDto[]) => {
        if (result && result.length > 0) {
          this.countryList = result.map((country) => ({ ...country, selected: false }));
          setTimeout(() => {
            this.f.coo.setValue(this.countryList.find((c) => c.countryId === this.currentPart.mfrCountryId)?.countryName);
            this.f.deliveryCountry.setValue(this.countryList.find((c) => c.countryId === this.currentPart.deliveryCountryId)?.countryName);
            if (this.dutiesTariffDto) {
              this.dutiesTariffDto.coo = this.countryList.find((c) => c.countryId === this.currentPart.mfrCountryId)?.countryName || '';
              this.dutiesTariffDto.deliveryCountry = this.countryList.find((c) => c.countryId === this.currentPart.deliveryCountryId)?.countryName || '';
            }
          }, 1000);
        } else {
          this._store.dispatch(new MasterDataActions.GetCountryData());
        }
      });
    }
  }

  onHtsSelectionsChange(event: any, fieldName?: string): void {
    const name = fieldName || event?.target?.name;
    const value = fieldName ? event?.value : event?.target?.value;

    switch (name) {
      case 'htsSection':
        this.htsChapterList = this.htsChapterMasterList.filter((x) => x.htsSectionId == this.dutiesTariffForm?.value.htsSectionId);
        this.f.htsChapterId.patchValue('');
        this.f.htsHeadingId.patchValue('');
        this.f.htsSubHeadingId.patchValue('');
        this.f.htsSubHeading1Id.patchValue('');
        this.f.htsSubHeading2Id.patchValue('');
        this.htsHeadingList = [];
        this.htsSubHeadingList = [];
        this.htsSubHeading1List = [];
        this.htsSubHeading2List = [];
        break;

      case 'htsChapter':
        this.htsHeadingList = this.htsHeadingMasterList.filter((x) => x.htsChapterId == this.dutiesTariffForm?.value.htsChapterId);
        this.f.htsHeadingId.patchValue('');
        this.f.htsSubHeadingId.patchValue('');
        this.f.htsSubHeading1Id.patchValue('');
        this.f.htsSubHeading2Id.patchValue('');
        this.htsSubHeadingList = [];
        this.htsSubHeading1List = [];
        this.htsSubHeading2List = [];
        break;

      case 'htsHeading':
        this.htsSubHeadingList = this.htsSubHeadingMasterList.filter((x) => x.htsHeadingId == this.dutiesTariffForm?.value.htsHeadingId);
        this.f.htsSubHeadingId.patchValue('');
        this.f.htsSubHeading1Id.patchValue('');
        this.f.htsSubHeading2Id.patchValue('');
        this.htsSubHeading1List = [];
        this.htsSubHeading2List = [];
        break;

      case 'htsSubHeading':
        if (this.dutiesTariffForm?.value.htsSubHeadingId && this.dutiesTariffForm?.value.htsHeadingId && this.dutiesTariffForm?.value.htsChapterId && this.dutiesTariffForm?.value.htsSectionId) {
          this.htsMasterService
            .getHtsSubHeading1BySubHeadingId(this.dutiesTariffForm?.value.htsSubHeadingId)
            .pipe(takeUntil(this.unsubscribeAll$))
            .subscribe((response: any) => {
              this.f.htsSubHeading1Id.patchValue('');
              this.f.htsSubHeading2Id.patchValue('');
              this.htsSubHeading1List = response || [];
              if (value) {
                const exists = this.htsSubHeading1List.some((item) => item.htsSubHeading1Id === value);
                if (exists) {
                  this.f.htsSubHeading1Id.patchValue(value);
                }
              }
            });
        }
        break;

      case 'htsSubHeading1':
        if (this.dutiesTariffForm?.value.htsSubHeading1Id) {
          this.htsMasterService
            .getHtsSubHeading2BySubHeading1Id(this.dutiesTariffForm?.value.htsSubHeading1Id)
            .pipe(takeUntil(this.unsubscribeAll$))
            .subscribe((response: any) => {
              this.f.htsSubHeading2Id.patchValue('');
              this.htsSubHeading2List = response || [];
              if (value) {
                const exists = this.htsSubHeading2List.some((item) => item.htsSubHeading2Id === value);
                if (exists) {
                  this.f.htsSubHeading2Id.patchValue(value);
                }
              }
            });
        }
        break;
    }

    // Update HTS Code
    this.setHtsCode();

    // Handling Mat inputs - value changes
    const oldValue = this.previousValues[name];
    const newValue = event.value;
    if (oldValue !== newValue) {
      console.log(`Changed: ${name} from ${oldValue} to ${newValue}`);
      this.previousValues[name] = newValue;
      this.onFormValueChange();
    }
  }

  private setHtsCode() {
    const {
      // htsSectionId,
      htsChapterId,
      htsHeadingId,
      htsSubHeadingId,
      htsSubHeading1Id,
      htsSubHeading2Id,
    } = this.dutiesTariffForm.value;

    const parts: string[] = [];

    const chapterCode = this.htsChapterMasterList.find((x) => x.htsChapterId == htsChapterId)?.htsChapterCode;
    const headingCode = this.htsHeadingMasterList.find((x) => x.htsHeadingId == htsHeadingId)?.htsHeadingCode;
    const subHeadingCode = this.htsSubHeadingMasterList.find((x) => x.htsSubHeadingId == htsSubHeadingId)?.htsSubHeadingCode;
    const subHeading1 = this.htsSubHeading1List.find((x) => x.htsSubHeading1Id == htsSubHeading1Id)?.htsSubHeading1Name?.substring(0, 2);
    const subHeading2 = this.htsSubHeading2List.find((x) => x.htsSubHeading2Id == htsSubHeading2Id)?.htsSubHeading2Name?.substring(0, 2);

    if (chapterCode) parts.push(chapterCode);
    if (headingCode) parts.push(headingCode);
    if (subHeadingCode) parts.push(`.${subHeadingCode}`);
    if (subHeading1) parts.push(`.${subHeading1}`);
    if (subHeading2) parts.push(`.${subHeading2}`);

    this.htsCode = parts.join('');
    this.f.htsCode.setValue(this.htsCode || '');
  }

  onHtsCodeEntered(): void {
    this.tariffLoader = true;

    let raw = this.f.htsCode.value?.trim();
    if (raw === '') {
      if (this.dutiesTariffDto?.htsCode) {
        // this.f.htsCode.setValue(this.dutiesTariffDto?.htsCode);
        this.tariffLoader = false;
      }
      this.tariffLoader = false;
      this.resetHtsDropdowns();
      return;
    }

    if (raw.length === 10) {
      raw = this.formatHtsCode(raw);
      this.f.htsCode.setValue(raw);
    }

    if (!/^\d{4}\.\d{2}\.\d{2}\.\d{2}$/.test(raw)) {
      this.displayMsg('Invalid HTS code');
      this.resetHtsDropdowns();
      this.tariffLoader = false;
      return;
    }

    const [chapterHeading, subHeadingCode, subHeading1Seg, subHeading2Seg] = raw?.split('.');

    const chapterCode = chapterHeading.substring(0, 2);
    const headingCode = chapterHeading.substring(2, 4);

    // CHAPTER
    const chapter = this.htsChapterMasterList.find((c) => String(c.htsChapterCode) === chapterCode);
    if (!chapter) {
      this.displayMsg('Invalid HTS code');
      this.resetHtsDropdowns();
      this.tariffLoader = false;
      return;
    }
    setTimeout(() => {
      this.f.htsSectionId.setValue(chapter.htsSectionId);
    }, 500);
    this.f.htsSectionId.setValue(chapter.htsSectionId);

    this.f.htsChapterId.setValue(chapter.htsChapterId);
    this.htsChapterList = this.htsChapterMasterList.filter((c) => c.htsSectionId === chapter.htsSectionId);

    // HEADING
    const heading = this.htsHeadingMasterList.find((h) => String(h.htsHeadingCode) === headingCode && h.htsChapterId === chapter.htsChapterId);
    if (!heading) {
      this.displayMsg('Invalid HTS code');
      this.resetHtsDropdowns();
      this.tariffLoader = false;
      return;
    }

    this.f.htsHeadingId.setValue(heading.htsHeadingId);
    this.htsHeadingList = this.htsHeadingMasterList.filter((h) => h.htsChapterId === chapter.htsChapterId);

    // SUB-HEADING
    const subHeading = this.htsSubHeadingMasterList.find((s) => String(s.htsSubHeadingCode) === subHeadingCode && s.htsHeadingId === heading.htsHeadingId);
    if (!subHeading) {
      this.displayMsg('Invalid HTS code');
      this.resetHtsDropdowns();
      this.tariffLoader = false;
      return;
    }

    this.f.htsSubHeadingId.setValue(subHeading.htsSubHeadingId);
    this.htsSubHeadingList = this.htsSubHeadingMasterList.filter((s) => s.htsHeadingId === heading.htsHeadingId);

    // SUB-HEADING1 & 2
    this.htsMasterService
      .getHtsSubHeading1BySubHeadingId(subHeading.htsSubHeadingId)
      .pipe(
        takeUntil(this.unsubscribeAll$),
        switchMap((subHeading1List: any[] = []) => {
          this.htsSubHeading1List = subHeading1List;

          const subHeading1Match = subHeading1List.find((s1) =>
            'htsSubHeading1Code' in s1 ? String(s1.htsSubHeading1Code) === subHeading1Seg : s1.htsSubHeading1Name?.trim().startsWith(subHeading1Seg)
          );

          if (!subHeading1Match) {
            this.displayMsg('Invalid HTS code');
            this.resetHtsDropdowns();
            this.tariffLoader = false;
            return EMPTY;
          }

          setTimeout(() => {
            this.f.htsSubHeading1Id.setValue(subHeading1Match.htsSubHeading1Id);
            // this.f.htsSubHeading1Id.patchValue(subHeading1Match.htsSubHeading1Id);
            this.dutiesTariffDto.htsSubHeading1Id = subHeading1Match.htsSubHeading1Id;
          }, 500);

          return this.htsMasterService.getHtsSubHeading2BySubHeading1Id(subHeading1Match.htsSubHeading1Id).pipe(
            map((subHeading2List: any[] = []) => ({
              subHeading2List,
              subHeading1Match,
            }))
          );
        })
      )
      .subscribe({
        next: ({ subHeading2List }) => {
          if (!subHeading2List) {
            this.displayMsg('Invalid HTS code');
            this.resetHtsDropdowns();
            this.tariffLoader = false;
            return;
          }

          this.htsSubHeading2List = subHeading2List;

          const subHeading2Match = subHeading2List.find((s2) =>
            'htsSubHeading2Code' in s2 ? String(s2.htsSubHeading2Code) === subHeading2Seg : s2.htsSubHeading2Name?.trim().startsWith(subHeading2Seg)
          );

          if (subHeading2Match) {
            setTimeout(() => {
              this.f.htsSubHeading2Id.setValue(subHeading2Match.htsSubHeading2Id);
              // this.f.htsSubHeading2Id.patchValue(subHeading2Match.htsSubHeading2Id);
              this.dutiesTariffDto.htsSubHeading2Id = subHeading2Match.htsSubHeading2Id;
            }, 500);
          } else {
            this.displayMsg('Invalid HTS code');
            this.resetHtsDropdowns();
          }

          this.tariffLoader = false;
        },
        error: () => {
          this.displayMsg('Invalid HTS code');
          this.resetHtsDropdowns();
          this.tariffLoader = false;
        },
        complete: () => {
          this.tariffLoader = false;
        },
      });
  }

  formatHtsCode(raw: string): string {
    const digits = raw.replace(/\D/g, ''); // Remove non-digit characters

    // if (digits.length !== 12) return raw; // Don't format unless it's exactly 12 digits

    return `${digits.slice(0, 4)}.${digits.slice(4, 6)}.${digits.slice(6, 8)}.${digits.slice(8, 10)}`;
  }

  // Tariff
  onTariffChange(event: any) {
    if (event.target.name === 'tariffPercentage') {
      const eXWPartCostAmount = this.geteXWPartCostAmount();
      const tariffByType = this.sharedService.isValidNumber((eXWPartCostAmount * event.target.value) / 100);
      this.tariffBreakdownControls.tariff.setValue(tariffByType);
    }
  }

  getTafiffBreakDownList(tariffBreakDowns: any[], tariffTypeList: any[], tariffAppliesToList: any[]) {
    return tariffBreakDowns.map((breakdown) => {
      const type = tariffTypeList.find((t) => t.tariffTypeId === breakdown.tariffType.toString());
      const appliesTo = tariffAppliesToList.find((a) => a.tariffAppliesToId === breakdown.tariffAppliesTo.toString());
      return {
        ...breakdown,
        tariffTypeName: type?.tariffTypeName ?? '',
        tariffAppliesToName: appliesTo?.tariffAppliesToName ?? '',
      };
    });
  }

  getDutifyTariffBreakDowns() {
    this.htsCode = this.f.htsCode.value;
    if (!this.htsCode || !this.currentPart?.mfrCountryId) return;

    if (!/^\d{4}\.\d{2}\.\d{2}\.\d{2}$/.test(this.htsCode)) {
      this.displayMsg('Invalid HTS code');
      this.tariffLoader = false;
      return;
    }

    // this.deleteExistingTariffBreakDowns().subscribe({
    //   next: () => {
    this.tariffRequestData = {
      ...this.tariffRequestData,
      exportCountryCode: this.countryList.find((c) => c.countryId === this.currentPart.mfrCountryId)?.isO2,
      importCountryCode: this.countryList.find((c) => c.countryId === this.currentPart.deliveryCountryId)?.isO2,
      importStateCode: '',
      inputCurrencyCode: 'USD',
      description: '', // `${this.currentPart.intPartNumber} ${this.currentPart.intPartDescription} ${this.currentPart.materialDescription}`,
      shippingCost: 0, // 100000, // to get the tariff break down percentages
      // (Number(this._numberConversionService.transformNumberTwoDecimal(this.costSummaryData.packingCost)) +
      //   Number(this._numberConversionService.transformNumberTwoDecimal(this.costSummaryData.freightCost))) *
      // this.currentPart.lotSize,
      insuranceCost: 0,
      modeOfTransport: 'freight',
      importType: 'private',
      lineItems: [
        {
          originCountryCode: this.countryList.find((c) => c.countryId === this.currentPart.mfrCountryId)?.isO2,
          certificateOfOrigin: false,
          productClassificationHs: this.htsCode.replaceAll('.', ''),
          productClassificationHsCountryCode: '',
          quantity: this.currentPart.lotSize,
          unitPrice: this.geteXWPartCostAmount(),
          productTitle: '', //`${this.currentPart.intPartNumber} ${this.currentPart.intPartDescription} ${this.currentPart.materialDescription}`,
          measurements: [
            {
              unitName: 'g',
              value: 0,
            },
          ],
          productClassificationId: 0,
        },
      ],
    };

    this.tariffBreakDownRequest.data = this.tariffRequestData;

    this.dutieSvc
      .getTariffBreakDowns(this.tariffBreakDownRequest)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          if (!res) {
            this.displayMsg('No Tariff found.');
            return;
          }
          const response = res as TariffBreakDownResponse;

          const breakdownItems = response?.dutifyTariffExtractions || [];

          // // Breakdowns from tariffBreakDown
          // if (response.tariffBreakDown) {
          //   breakdownItems.push(
          //     ...this.generateBreakdownList(response.tariffBreakDown, ['exciseTotal', 'handlingFeeTotal', 'salesTaxTotal', 'additionalTaxAndChargesTotal']).map((item) => ({
          //       ...item,
          //       tariffPercentage: item.percentage,
          //       tariff: item.value,
          //     }))
          //   );
          // }

          // // Percent breakdowns
          // if (response.isActive) {
          //   breakdownItems.push(
          //     ...this.generateBreakdownList(response, ['exciseTotalPercent', 'handlingFeeTotalPercent', 'salesTaxTotalPercent', 'additionalTaxAndChargesTotalPercent']).map((item) => ({
          //       ...item,
          //       tariffPercentage: item.percent,
          //       tariff: item.value,
          //     }))
          //   );
          // }

          // Patch form & submit each
          const exVal = this.geteXWPartCostAmount();
          this.dutiesTariffDto.tariffBreakDowns = [];
          let totalTariff = 0;
          let totalPercentage = 0;
          breakdownItems.forEach((item) => {
            const formPatch = {
              tariffBreakDownId: 0,
              tariffType: 1,
              tariffTypeExtraction: item.description,
              tariffAppliesTo: 2,
              tariffPercentage: item.percentage,
              tariff: this.sharedService.isValidNumber(exVal > 0 ? +(exVal * item.percentage) / 100 : 0),
              comments: item.category.replaceAll('_', ' '),
            };
            totalTariff += formPatch.tariff;
            totalPercentage += formPatch.tariffPercentage;
            this.dutiesTariffDto.tariffBreakDown = { ...formPatch };
            this.dutiesTariffForm.get('tariffBreakDown')?.patchValue(formPatch);
            this.dutiesTariffDto.tariffBreakDowns.push(formPatch);
          });

          // let message = `Tariff Updated`;

          //this.onFormSubmit(message).subscribe();
          this.dataSource.data = this.dutiesTariffDto?.tariffBreakDowns || [];
          this.selectedTariffBreakdownId = this.tariffList.length > 0 ? this.tariffList[this.selectedIndex].tariffBreakDownId : 0;
          this.dutiesTariffDto.totalPerPart = totalTariff;
          this.dutiesTariffDto.dutiesPerPart = totalPercentage;
          // this.blockUiService.pushBlockUI('save');
          this.dutieSvc
            .saveDutiesTariff(this.dutiesTariffDto)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe({
              next: (res) => {
                // this.blockUiService.popBlockUI('save');
                this.dutiesTariffDto.dutiesTariffId = res.dutiesTariffId;
                this.dutiesTariffDto.tariffBreakDowns = this.dataSource.data;
                this.costSummaryData = { ...this.costSummaryData, dutiesTariffCost: totalTariff };
                // this.setBreakdownForm();
                this.costSummarySignalsService.getCostSummaryByPartInfoId(this.currentPart.partInfoId);
                this.getDutiesTariffByPartInfoId(this.currentPart.partInfoId);
                this.messaging.openSnackBar(`Recalculation completed for Tariff Section.`, '', {
                  duration: 5000,
                });
                this.displayMsg('Recalculation completed for Tariff Section.');
              },
              error: () => {
                // this.blockUiService.popBlockUI('save');
                console.error();
                this.displayMsg('Something went wrong!.');
              },
            });

          if (breakdownItems?.length === 0) {
            let message = `No Tariff breakdowns found.`;
            this.displayMsg(message);
            //this.onFormSubmit(message).subscribe();
          }
        },
        error: (err) => {
          console.error('Error fetching tariff breakdown:', err);
        },
      });
    //   },
    //   error: (err) => {
    //     console.error('Error in deleteExistingTariffBreakDowns subscription:', err);
    //   },
    // });
  }

  private generateBreakdownList(source: any, keys: string[]) {
    return keys
      .map((key) => {
        const rawValue = parseFloat(source[key] || '0');
        if (rawValue > 0) {
          const value = key.endsWith('Percent') ? +(this.geteXWPartCostAmount() * rawValue) / 100 : rawValue / this.currentPart.lotSize;
          const percent = key.endsWith('Percent') ? rawValue : +((value / this.geteXWPartCostAmount()) * 100).toFixed(2);

          return {
            tariffBreakDownId: 0,
            tariffType: 1,
            tariffTypeExtraction: key,
            tariffAppliesTo: 2,
            value,
            percentage: percent,
            percent,
            comment: this.sharedService.formatCamelCaseKey(key),
          };
        }
        return null;
      })
      .filter(Boolean);
  }

  onEditTariff(row: any, i): void {
    this.selectedTariffBreakdownId = row.tariffBreakDownId;
    this.selectedIndex = i;
    this.dutiesTariffForm.get('tariffBreakDown').patchValue({
      tariffBreakDownId: row.tariffBreakDownId,
      tariffType: row.tariffType,
      tariffAppliesTo: row.tariffAppliesTo,
      tariffPercentage: row.tariffPercentage,
      tariff: row.tariff,
      comments: row.comments,
      tariffTypeExtraction: row.tariffTypeExtraction || '',
    });
  }

  onDeleteTariff(row: any): void {
    const index = this.dataSource.data.findIndex((t) => t.tariffBreakDownId === row.tariffBreakDownId);
    if (index > -1) {
      if (row.tariffBreakDownId !== 0) {
        // this.blockUiService.pushBlockUI('Deleting Tariff breakdown');
        this.dutieSvc
          .deleteTariffBreakDown(row.tariffBreakDownId)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe({
            next: () => {
              this.dataSource.data.splice(index, 1);
              this.dutiesTariffDto.tariffBreakDowns = this.dataSource.data;
              this.dataSource._updateChangeSubscription();
              this.dutiesTariffForm.get('tariffBreakDown').reset();
              this.selectedTariffBreakdownId = 0;
              this.selectedIndex = 0;
              // if (!row.isAutoDel) {
              //   this.dirtyCheckEvent.emit(true);
              // }
              if (this.tariffList && this.tariffList.length > 0) {
                const firstTariff = this.tariffList[0];
                this.selectedTariffBreakdownId = firstTariff.tariffBreakDownId;
                this.setBreakdownForm();
              }
              this.dutiesTariffDto.totalPerPart = this.calculateTotalDutyTariff();
              this.dutiesTariffDto.dataCompletionPercentage = this.completionPctg;
              // this.blockUiService.pushBlockUI('Update tariff total');
              this.dutieSvc
                .saveDutiesTariff(this.dutiesTariffDto)
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe({
                  next: (res) => {
                    // this.blockUiService.popBlockUI('Update tariff total');
                    this.dutiesTariffDto.dutiesTariffId = res.dutiesTariffId;
                    this.dutiesTariffDto.tariffBreakDowns = this.dataSource.data;
                    this.costSummarySignalsService.getCostSummaryByPartInfoId(this.currentPart.partInfoId);
                    this.getDutiesTariffByPartInfoId(this.currentPart.partInfoId);
                  },
                  error: () => {
                    // this.blockUiService.popBlockUI('Update tariff total');
                    console.error();
                    this.displayMsg('Something went wrong!.');
                  },
                });
              // this.blockUiService.popBlockUI('Deleting Tariff breakdown');
            },
            error: () => {
              console.error();
              // this.blockUiService.popBlockUI('Deleting Tariff breakdown');
            },
          });
      } else {
        this.dataSource.data.splice(index, 1);
        this.dutiesTariffDto.tariffBreakDowns = this.dataSource.data;
        this.dataSource._updateChangeSubscription();
        this.dutiesTariffForm.get('tariffBreakDown').reset();
        this.selectedTariffBreakdownId = 0;
        this.selectedIndex = 0;
        if (this.tariffList && this.tariffList.length > 0) {
          const firstTariff = this.tariffList[0];
          this.selectedTariffBreakdownId = firstTariff.tariffBreakDownId;
          this.setBreakdownForm();
        }
      }
    }
  }

  deleteExistingTariffBreakDowns(): Observable<any> {
    const deleteObservables = this.dataSource.data.map((element) => {
      element.isAutoDel = true;
      return this.dutieSvc.deleteTariffBreakDown(element.tariffBreakDownId).pipe(
        take(1),
        tap(() => {
          const index = this.dataSource.data.findIndex((t) => t.tariffBreakDownId === element.tariffBreakDownId);
          if (index > -1) {
            this.dataSource.data.splice(index, 1);
            this.dutiesTariffDto.tariffBreakDowns = this.dataSource.data;
            this.dataSource._updateChangeSubscription();
            this.dutiesTariffForm.get('tariffBreakDown').reset();
            this.selectedTariffBreakdownId = 0;
          }
        }),
        catchError((err) => {
          console.error('Error deleting tariff:', err);
          return of(null);
        })
      );
    });

    if (deleteObservables.length === 0) {
      return of(null);
    }

    return forkJoin(deleteObservables).pipe(tap(() => console.info('All deletes completed')));
  }

  setBreakdownForm() {
    if (this.tariffList && this.tariffList.length > 0) {
      const firstTariff = this.tariffList[this.selectedIndex] || this.tariffList[0];
      this.selectedTariffBreakdownId = firstTariff.tariffBreakDownId;
      this.dutiesTariffForm.get('tariffBreakDown').patchValue({
        tariffBreakDownId: firstTariff.tariffBreakDownId,
        tariffType: firstTariff.tariffType,
        tariffAppliesTo: firstTariff.tariffAppliesTo,
        tariffPercentage: firstTariff.tariffPercentage,
        tariff: firstTariff.tariff,
        comments: firstTariff.comments,
        tariffTypeExtraction: firstTariff.tariffTypeExtraction || '',
      });
    }
  }

  onAddTariff() {
    if (this.currentPart.mfrCountryId === this.currentPart.deliveryCountryId) {
      this.displayMsg('Cannot add tariff when Manufacturer Country and Delivery Country are the same.');
      return;
    }
    // this.dutiesTariffForm.get('tariffBreakDown')?.reset();
    this.dutiesTariffForm.get('tariffBreakDown').patchValue({
      tariffBreakDownId: 0,
      tariffType: 1,
      tariffAppliesTo: 2,
      tariffPercentage: 0,
      tariff: 0,
      comments: '',
      tariffTypeExtraction: '',
    });

    this.selectedTariffBreakdownId = 0;
    this.dutiesTariffForm.markAsDirty();
    this.dutiesTariffForm.markAsTouched();
    this.dutiesTariffForm.updateValueAndValidity();
    this.dirtyCheckEvent.emit(true);

    this.dutiesTariffDto.tariffBreakDown = {
      tariffBreakDownId: 0,
      tariffType: 1,
      tariffAppliesTo: 2,
      tariffPercentage: 0,
      tariff: 0,
      comments: '',
      tariffTypeExtraction: '',
    };
    this.dataSource.data.push(this.dutiesTariffDto.tariffBreakDown);
    this.dataSource._updateChangeSubscription();
    this.dutiesTariffDto.tariffBreakDowns = this.dataSource.data;
    this.selectedIndex = this.dataSource.data.length - 1;
  }

  getTotalPercent(): number {
    return this.dataSource.data.reduce((acc, row) => acc + row.tariffPercentage, 0);
  }

  getTotalTariff(): number {
    return this.dataSource.data.reduce((acc, row) => acc + row.tariff, 0);
  }

  calculateTotalDutyTariff(): number {
    const breakDowns = this.dutiesTariffDto?.tariffBreakDowns || [];
    const selected = this.dutiesTariffDto?.tariffBreakDown;

    if (!breakDowns.length && selected) {
      return selected.tariff || 0;
    }

    if (selected) {
      if (selected.tariffBreakDownId === 0) {
        this.totalDutyTariff = breakDowns.reduce((acc, row) => acc + row.tariff, 0) + (selected.tariff || 0);
      } else {
        this.totalDutyTariff = breakDowns.filter((x) => x.tariffBreakDownId !== selected.tariffBreakDownId).reduce((acc, row) => acc + row.tariff, 0) + (selected.tariff || 0);
      }
    } else {
      this.totalDutyTariff = breakDowns.reduce((acc, row) => acc + row.tariff, 0);
    }

    return Math.round(this.totalDutyTariff * 10000) / 10000;
  }

  openDialog(templateRef: TemplateRef<any>) {
    this.dialogRef = this.dialog.open(templateRef, {
      width: '80vw',
      maxWidth: '90vw',
      panelClass: 'material-modal',
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  handleSearchSelection(data: any): void {
    this.htsSectionList = this.htsSectionMasterList;
    this.htsGroupedSections = [
      {
        groupName: 'Most Common Categories',
        items: this.htsSectionList.filter((x) => x.groupName === 'Most Common Categories').sort((a, b) => a.rank - b.rank),
      },
      {
        groupName: 'Additional Categories',
        items: this.htsSectionList.filter((x) => x.groupName === 'Additional Categories').sort((a, b) => a.rank - b.rank),
      },
    ];
    setTimeout(() => {
      this.f.htsSectionId.setValue(data?.htsSectionId || 0);
    }, 500);
    this.f.htsSectionId.setValue(data?.htsSectionId || 0);

    this.onHtsSelectionsChange({
      target: {
        name: 'htsSection',
        value: data?.htsSectionId || '',
      },
    });

    setTimeout(() => {
      this.f.htsChapterId.setValue(data?.htsChapterId || '');
    }, 500);
    this.f.htsChapterId.setValue(data?.htsChapterId || '');

    this.onHtsSelectionsChange({
      target: {
        name: 'htsChapter',
        value: data?.htsChapterId || '',
      },
    });

    setTimeout(() => {
      this.f.htsHeadingId.setValue(data?.htsHeadingId || '');
    }, 500);
    this.f.htsHeadingId.setValue(data?.htsHeadingId || '');

    this.onHtsSelectionsChange({
      target: {
        name: 'htsHeading',
        value: data?.htsHeadingId || '',
      },
    });

    setTimeout(() => {
      this.f.htsSubHeadingId.setValue(data?.htsSubHeadingId || '');
    }, 500);
    this.f.htsSubHeadingId.setValue(data?.htsSubHeadingId || '');
    this.onHtsSelectionsChange({
      target: {
        name: 'htsSubHeading',
        value: data?.htsSubHeading1Id || '',
      },
    });

    setTimeout(() => {
      this.dutiesTariffForm.get('htsSubHeading1Id').setValue(data?.htsSubHeading1Id || '');
      this.onHtsSelectionsChange({
        target: {
          name: 'htsSubHeading1',
          value: data?.htsSubHeading2Id || '',
        },
      });
      this.f.htsCode.setValue(data?.htsCode || '');
      if (!data?.isEdit) {
        this.htsCode = data?.htsCode;
        // this.getDutifyTariffBreakDowns();
        this.dirtyCheckEvent.emit(true);
        this.dialogRef.close();
      }
    }, 1000);
  }

  recalculateDutifyTariffBreakDowns(part?: any) {
    this.htsCode = this.f.htsCode.value;
    if (part) {
      this.currentPart = part;
    }
    if (!this.htsCode || !this.currentPart?.mfrCountryId) return;

    if (!/^\d{4}\.\d{2}\.\d{2}\.\d{2}$/.test(this.htsCode)) {
      this.displayMsg('Invalid HTS code');
      this.tariffLoader = false;
      return;
    }

    this.setCooDeliveryCountry();
    if (part.deliveryCountryId === part.mfrCountryId) {
      this.displayMsg('Tariff calculation is not applicable for Domestic shipments.');
      if (this.dutiesTariffDto && this.dutiesTariffDto?.tariffBreakDowns?.length > 0) {
        this.deleteExistingTariffBreakDowns().subscribe({
          next: () => {
            this.dutiesTariffDto.totalPerPart = 0;
            this.dutiesTariffDto.dutiesPerPart = 0;
            // this.blockUiService.pushBlockUI('save');
            this.dutieSvc
              .saveDutiesTariff(this.dutiesTariffDto)
              .pipe(takeUntil(this.unsubscribe$))
              .subscribe({
                next: (res) => {
                  // this.blockUiService.popBlockUI('save');
                  this.dutiesTariffDto.dutiesTariffId = res.dutiesTariffId;
                  this.dutiesTariffDto.tariffBreakDowns = this.dataSource.data;
                  this.costSummaryData = { ...this.costSummaryData, dutiesTariffCost: 0 };
                  this.costSummarySignalsService.getCostSummaryByPartInfoId(this.currentPart.partInfoId);
                  this.getDutiesTariffByPartInfoId(this.currentPart.partInfoId);
                  this.messaging.openSnackBar(`Recalculation completed for Tariff Section.`, '', {
                    duration: 5000,
                  });
                  this.displayMsg('Recalculation completed for Tariff Section.');
                },
                error: () => {
                  // this.blockUiService.popBlockUI('save');
                  console.error();
                  this.displayMsg('Something went wrong!.');
                },
              });
          },
          error: (err) => {
            console.error('Error in Deleting Existing Tariff BreakDowns:', err);
          },
        });
      }
      return;
    }

    let totalTariff = 0;
    let totalPercentage = 0;
    if (this.isDeleteAndRecalculateRequired) {
      this.deleteExistingTariffBreakDowns().subscribe({
        next: () => {
          this.getDutifyTariffBreakDowns();
        },
        error: (err) => {
          console.error('Error in deleteExistingTariffBreakDowns:', err);
        },
      });
      this.isDeleteAndRecalculateRequired = false;
      return;
    } else if (this.dutiesTariffDto && this.dutiesTariffDto?.tariffBreakDowns?.length > 0) {
      const exVal = this.geteXWPartCostAmount();
      this.dutiesTariffDto?.tariffBreakDowns.forEach((tariff) => {
        if (tariff.tariffPercentage && tariff.tariffPercentage > 0) {
          tariff.tariff = parseFloat(((exVal * tariff.tariffPercentage) / 100).toFixed(4));
        } else {
          tariff.tariff = 0;
        }
        totalTariff += parseFloat(tariff.tariff.toFixed(4));
        totalPercentage += tariff.tariffPercentage;

        this.dataSource.data = this.dutiesTariffDto?.tariffBreakDowns || [];
        this.dutiesTariffDto.totalPerPart = totalTariff;
        this.dutiesTariffDto.dutiesPerPart = totalPercentage;
        // this.blockUiService.pushBlockUI('save');
        if (!this.dutiesTariffDto.htsCode || this.dutiesTariffDto.htsCode.trim() === '') {
          console.warn('Detecting HTS Code is Empty');
          this.dutiesTariffDto.htsCode = this.dutiesTariffForm.get('htsCode')?.value;
        }
        this.dutieSvc
          .saveDutiesTariff(this.dutiesTariffDto)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe({
            next: (res) => {
              // this.blockUiService.popBlockUI('save');
              this.dutiesTariffDto.dutiesTariffId = res.dutiesTariffId;
              this.dutiesTariffDto.tariffBreakDowns = this.dataSource.data;
              this.costSummaryData = { ...this.costSummaryData, dutiesTariffCost: totalTariff };
              // this.setBreakdownForm();
              this.costSummarySignalsService.getCostSummaryByPartInfoId(this.currentPart.partInfoId);
              this.getDutiesTariffByPartInfoId(this.currentPart.partInfoId);
              this.messaging.openSnackBar(`Recalculation completed for Tariff Section.`, '', {
                duration: 5000,
              });
              this.displayMsg('Recalculation completed for Tariff Section.');
            },
            error: () => {
              // this.blockUiService.popBlockUI('save');
              console.error();
              this.displayMsg('Something went wrong!.');
            },
          });
      });
      return;
    } else {
      this.getDutifyTariffBreakDowns();
      return;
    }
  }

  resetHtsDropdowns(): void {
    this.f.htsSectionId.setValue('');
    this.f.htsChapterId.setValue('');
    this.f.htsHeadingId.setValue('');
    this.f.htsSubHeadingId.setValue('');
    this.f.htsSubHeading1Id.setValue('');
    this.f.htsSubHeading2Id.setValue('');
    // this.f.htsCode.setValue('');

    // Optional: reset the actual select option arrays if needed
    this.htsChapterList = [];
    this.htsHeadingList = [];
    this.htsSubHeadingList = [];
    this.htsSubHeading1List = [];
    this.htsSubHeading2List = [];
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
}
