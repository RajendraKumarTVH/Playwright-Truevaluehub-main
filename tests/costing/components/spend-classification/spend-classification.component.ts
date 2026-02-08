import { Component, Input, OnInit, SimpleChanges, OnChanges, OnDestroy, EventEmitter, Output, TemplateRef, AfterViewInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { Observable, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessagingService } from 'src/app/messaging/messaging.service';
// import { CostSummaryState } from 'src/app/modules/_state/cost-summary.state';
import { CountryDataMasterDto, PartInfoDto } from 'src/app/shared/models';
import { BlockUiService, UnspscMasterService, MaterialMasterService } from 'src/app/shared/services';
import * as MasterDataActions from 'src/app/modules/_actions/master-data.action';
import { CommonModule } from '@angular/common';
import { OnlyNumber } from 'src/app/shared/directives';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { UnspscMasterDto } from 'src/app/shared/models/unspsc-master.model';
import { UnspscMasterState } from 'src/app/modules/_state/unspsc-master.state';
// import { MaterialInfoState } from 'src/app/modules/_state/material-info.state';
import { CountryDataState } from 'src/app/modules/_state/country.state';
import { SharedService } from 'src/app/modules/costing/services/shared.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { GenericDataTableComponent } from 'src/app/shared/components/generic-data-table/generic-data-table.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { SpendClassificationDto } from 'src/app/shared/models/spend-classification.model';
import { SpendClassificationService } from 'src/app/shared/services/spend-classification.service';
import { MatTooltip } from '@angular/material/tooltip';
import { MaterialInfoSignalsService } from 'src/app/shared/signals/material-info-signals.service';

@Component({
  selector: 'app-spend-classification',
  templateUrl: './spend-classification.component.html',
  styleUrls: ['./spend-classification.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, OnlyNumber, MatIconModule, GenericDataTableComponent, MatTableModule, MatExpansionModule, MatTooltip],
})
export class SpendClassificationComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  // [x: string]: any; // do not use this
  @Input() part: PartInfoDto;
  @Output() completionPercentageChange = new EventEmitter<number>();
  @Output() dirtyCheckEvent = new EventEmitter<boolean>();
  @Input() recalculateSubject: Subject<PartInfoDto>;
  @Output() formLoaded = new EventEmitter<{ componentName: string; formName: string; loadTime?: number }>();
  completionPctg: number;
  spendClassificationDto: SpendClassificationDto;
  hasUnsavedEventSub$: Subscription = Subscription.EMPTY;
  nexturltonavigate: any;
  spendClassificationForm: FormGroup;
  dialogRef!: MatDialogRef<any>;
  countryList: CountryDataMasterDto[] = [];

  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  currentPart: PartInfoDto;

  // spend classification and tariff
  unspscSegmentList: any[] = [];
  unspscSegmentMasterList: any[] = [];
  unspscFamilyList: any[] = [];
  unspscFamilyMasterList: any[] = [];
  unspscClassList: any[] = [];
  unspscClassMasterList: any[] = [];
  unspscCommodityList: any[] = [];
  unspscCommodityMasterList: any[] = [];
  unspscCode: string = '';
  unspscCodeList: any[] = [];

  unspscColumns = [
    { field: 'unspscCode', header: 'UNSPSC Code' },
    { field: 'segment', header: 'Segment' },
    { field: 'family', header: 'Family' },
    { field: 'class', header: 'Class' },
    { field: 'commodity', header: 'Commodity' },
  ];

  dataSource = new MatTableDataSource([]);

  _unspscMasterData$: Observable<UnspscMasterDto>;
  // _materialInfo$: Observable<MaterialInfoDto[]>;
  _countryData$: Observable<CountryDataMasterDto[]>;
  // _costSummary$: Observable<ViewCostSummaryDto[]>;
  private unsubscribeAll$: Subject<undefined> = new Subject<undefined>();

  get f() {
    return this.spendClassificationForm?.controls;
  }

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private messaging: MessagingService,
    private blockUiService: BlockUiService,
    public sharedService: SharedService,
    private _store: Store,
    private unspscMasterService: UnspscMasterService,
    private materialMasterService: MaterialMasterService,
    private spendClassificationService: SpendClassificationService,
    private materialInfoSignalService: MaterialInfoSignalsService
  ) {
    this._unspscMasterData$ = this._store.select(UnspscMasterState.getAllUnspscMasterData);
    // this._materialInfo$ = this._store.select(MaterialInfoState.getMaterialInfos);
    this._countryData$ = this._store.select(CountryDataState.getCountryData);
    // this._costSummary$ = this._store.select(CostSummaryState.getCostSummarys);
  }

  ngOnInit(): void {
    this._unspscMasterData$.pipe(takeUntil(this.unsubscribe$)).subscribe((result: any) => {
      if (result.commodities?.length === 0) {
        this._store.dispatch(new MasterDataActions.GetAllUnspscMasterData());
      }
    });
    this.createForm(this.spendClassificationDto);
    this.completionPercentageChange.emit(0);
    this.recalculateSubject.pipe(takeUntil(this.unsubscribe$)).subscribe((e) => {
      this.recalculateSpendClassification(e);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['part'] && changes['part'].currentValue && changes['part'].currentValue !== changes['part'].previousValue) {
      this.currentPart = changes['part'].currentValue;
      if (changes['part'].currentValue?.partInfoId !== changes['part'].previousValue?.partInfoId || changes['part'].currentValue?.commodityId !== changes['part'].previousValue?.commodityId) {
        if (this.currentPart?.partInfoId > 0) {
          this.spendClassificationDto = new SpendClassificationDto();
          this.createForm(this.spendClassificationDto);
          this.getUnspscMasterData();
          setTimeout(() => {
            this.getSpendClassificationByPartInfoId(this.currentPart.partInfoId);
          }, 1000);
        }
      }
    }
  }

  ngAfterViewInit() {
    this.formLoaded.emit({
      componentName: 'spendClassificationComponent',
      formName: 'spendClassificationForm',
      loadTime: 5000,
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }

  onUNSPSCCodeChanges(code: string) {
    const codeMaxLen = 8;
    code = code?.replaceAll('.', '');
    let codeLen = code?.length;
    if (codeLen) {
      let unspscCode = code;
      while (codeLen < codeMaxLen) {
        unspscCode += '0';
        codeLen++;
      }
      this.f.unspscCode.setValue(unspscCode);
    }
  }

  onFormValueChange() {
    this.dirtyCheckEvent.emit(true);
  }

  public onFormSubmit(message?: any): Observable<SpendClassificationDto> {
    if (this.spendClassificationForm.invalid) {
      const model = new SpendClassificationDto();
      return new Observable((obs) => {
        obs.next(model);
      });
    }

    const { spendClassificationId, partInfoId, projectInfoId, unspscCode, unspscSegmentId, unspscFamilyId, unspscClassId, unspscCommodityId, internalClassificationCode, internalDescription } =
      this.spendClassificationForm.getRawValue();

    this.spendClassificationDto = {
      ...this.spendClassificationDto,
      spendClassificationId,
      partInfoId,
      projectInfoId,
      unspscCode,
      unspscSegmentId,
      unspscFamilyId,
      unspscClassId,
      unspscCommodityId,
      internalClassificationCode,
      internalDescription,
    };

    this.spendClassificationDto.dataCompletionPercentage = this.completionPctg;
    this.spendClassificationDto.partInfoId = this.currentPart.partInfoId;
    this.spendClassificationDto.projectInfoId = this.currentPart.projectInfoId;
    // this.blockUiService.pushBlockUI('save');
    this.spendClassificationService
      .saveSpendClassification(this.spendClassificationDto)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          // this.blockUiService.popBlockUI('save');
          this.spendClassificationDto.spendClassificationId = res.spendClassificationId;
          this.getSpendClassificationByPartInfoId(this.currentPart.partInfoId);
          this.displayMsg(message || 'Data saved sucessfully.');
        },
        error: () => {
          // this.blockUiService.popBlockUI('save');
          console.error();
          this.displayMsg('Something went wrong!.');
        },
      });

    return new Observable((obs) => {
      obs.next(this.spendClassificationDto);
    });
  }

  private createForm(_dto: SpendClassificationDto) {
    this.spendClassificationForm = this.fb.group({
      spendClassificationId: [_dto?.spendClassificationId || 0],
      partInfoId: [_dto?.partInfoId || 0],
      projectInfoId: [_dto?.projectInfoId || 0],

      unspscCode: [_dto?.unspscCode || '', [Validators.required]],
      unspscSegmentId: [_dto?.unspscSegmentId || '', [Validators.required]],
      unspscFamilyId: [_dto?.unspscFamilyId || '', [Validators.required]],
      unspscClassId: [_dto?.unspscClassId || '', [Validators.required]],
      unspscCommodityId: [_dto?.unspscCommodityId || '', [Validators.required]],
      internalClassificationCode: [_dto?.internalClassificationCode || ''],
      internalDescription: [_dto?.internalDescription || ''],
    });

    this.spendClassificationForm.valueChanges.subscribe(() => {
      this.completionPctChng();
    });
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
    const nonEmptyWeightage = this.findNonEmptyControlsRecursive(this.spendClassificationForm)?.length;

    let percentage: number = 0;
    if (totalFields > 0) {
      percentage = (nonEmptyWeightage / totalFields) * 100;
      percentage = Math.ceil(percentage);
      percentage = percentage > 100 ? 100 : percentage;
    }
    return percentage;
  }

  private getFormData() {
    return this.spendClassificationForm.value;
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

  getSpendClassificationByPartInfoId(partInfoId: number) {
    this.spendClassificationService
      .getSpendClassificationByPartInfoId(partInfoId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          if (res && res.length > 0) {
            this.spendClassificationDto = res[0];
          } else {
            this.spendClassificationDto = new SpendClassificationDto();
          }
          this.createForm(this.spendClassificationDto);
          if (!this.spendClassificationDto.unspscCode) {
            this.setUnspsc();
          }

          this.completionPctChng();
        },
        error: () => {
          console.error();
        },
      });
  }

  // UNSPSC
  private getUnspscMasterData() {
    this._unspscMasterData$.pipe(takeUntil(this.unsubscribe$)).subscribe((result: any) => {
      this.unspscSegmentMasterList = result.segments;
      this.unspscFamilyMasterList = result.families;
      this.unspscClassMasterList = result.classes;
      this.unspscCommodityMasterList = result.commodities;

      this.unspscSegmentList = result.segments;
      this.unspscFamilyList = result.families;
      this.unspscClassList = result.classes;
      this.unspscCommodityList = result.commodities;
    });
  }

  setUnspsc() {
    const commodityId = this.currentPart?.commodityId;

    // this._materialInfo$.pipe(takeUntil(this.unsubscribe$)).subscribe((result: MaterialInfoDto[]) => {
    const result = this.materialInfoSignalService.materialInfos();
    if (result?.length > 0 && this.currentPart?.partInfoId === result[0].partInfoId) {
      let materialInfoList = [...result];
      materialInfoList = materialInfoList.filter((x) => x.processId !== null && x.processId > 0);
      if (materialInfoList.length > 0) {
        const maxWeightMaterial = materialInfoList.reduce((prev, current) => {
          return current.netWeight > prev.netWeight ? current : prev;
        });
        if (maxWeightMaterial?.materialMarketId > 0) {
          this.materialMasterService
            .getMaterialMasterByMaterialMarketDataId(maxWeightMaterial?.materialMarketId)
            .pipe(takeUntil(this.unsubscribeAll$))
            .subscribe((response) => {
              if (response) {
                const meterialmasterData = response?.materialMarketData?.materialMaster;
                if (meterialmasterData) {
                  const materialTypeId = meterialmasterData?.materialTypeId;
                  const processId = maxWeightMaterial?.processId;
                  if (commodityId && materialTypeId && processId) {
                    this.unspscMasterService
                      .getUnspscMasterDataByCriteria(commodityId, materialTypeId, processId)
                      .pipe(takeUntil(this.unsubscribeAll$))
                      .subscribe((response: any) => {
                        if (response) {
                          this.unspscCode = response?.unspscCode;
                          this.f.unspscCode.setValue(this.unspscCode);
                          this.f.unspscSegmentId.setValue(response?.unspscSegment?.unspscSegmentId.toString());
                          this.f.unspscFamilyId.setValue(response?.unspscFamily?.unspscFamilyId);
                          this.f.unspscClassId.setValue(response?.unspscClass?.unspscClassId);
                          this.f.unspscCommodityId.setValue(response?.unspscCommodity?.unspscCommodityId);
                        }
                      });
                  }
                }
              }
            });
        }
      }
    }
    // });
  }

  onUnspscSelectionsChange(event: any) {
    // const formValues = this.dutiesTariffForm?.value;
    if (event.target.name === 'unspscSegment') {
      this.unspscFamilyList = this.unspscFamilyMasterList.filter((x) => x.unspscSegmentId == this.spendClassificationForm?.value.unspscSegmentId);
      this.f.unspscFamilyId.patchValue('');
      this.f.unspscClassId.patchValue('');
      this.f.unspscCommodityId.patchValue('');
      this.unspscClassList = [];
      this.unspscCommodityList = [];
    }
    if (event.target.name === 'unspscFamily') {
      this.unspscClassList = this.unspscClassMasterList.filter((x) => x.unspscFamilyId == this.spendClassificationForm?.value.unspscFamilyId);
      this.f.unspscClassId.patchValue('');
      this.f.unspscCommodityId.patchValue('');
      this.unspscCommodityList = [];
    }
    if (event.target.name === 'unspscClass') {
      this.unspscCommodityList = this.unspscCommodityMasterList.filter((x) => x.unspscClassId == this.spendClassificationForm?.value.unspscClassId);
      this.f.unspscCommodityId.patchValue('');
      this.f.unspscCode.patchValue('');
    }
    if (
      this.spendClassificationForm?.value.unspscCommodityId &&
      this.spendClassificationForm?.value.unspscClassId &&
      this.spendClassificationForm?.value.unspscFamilyId &&
      this.spendClassificationForm?.value.unspscSegmentId
    ) {
      this.unspscCode =
        this.unspscSegmentMasterList.find((x) => x.unspscSegmentId == this.spendClassificationForm?.value.unspscSegmentId)?.unspscSegmentCode +
        this.unspscFamilyMasterList.find((x) => x.unspscFamilyId == this.spendClassificationForm?.value.unspscFamilyId)?.unspscFamilyCode +
        this.unspscClassMasterList.find((x) => x.unspscClassId == this.spendClassificationForm?.value.unspscClassId)?.unspscClassCode +
        this.unspscCommodityMasterList.find((x) => x.unspscCommodityId == this.spendClassificationForm?.value.unspscCommodityId)?.unspscCommodityCode;
      this.f.unspscCode.setValue(this.unspscCode);
    } else {
      this.unspscCode = '';
      this.f.unspscCode.setValue(this.unspscCode);
    }
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

  handleUnspscSearchSelection(data: any): void {
    this.unspscSegmentList = this.unspscSegmentMasterList;
    this.unspscFamilyList = this.unspscFamilyMasterList;
    this.unspscClassList = this.unspscClassMasterList;
    this.unspscCommodityList = this.unspscCommodityMasterList;

    this.f.unspscCode.setValue(data?.unspscCode);
    this.f.unspscSegmentId.setValue(data.unspscSegmentId);
    this.f.unspscClassId.setValue(data.unspscClassId);
    this.f.unspscFamilyId.setValue(data.unspscFamilyId);
    this.f.unspscCommodityId.setValue(data.unspscCommodityId);
    this.dirtyCheckEvent.emit(true);
    this.dialogRef.close();
  }

  recalculateSpendClassification(part?: any) {
    if (part) {
      this.currentPart = part;
      this.blockUiService.pushBlockUI('Recalculate Spend Classification');
      setTimeout(() => {
        this.setUnspsc();
        this.messaging.openSnackBar(`Recalculation completed for Spend Classification.`, '', {
          duration: 5000,
        });
        this.blockUiService.popBlockUI('Recalculate Spend Classification');
      }, 1000);
    }
  }
}
