import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, SimpleChanges, OnChanges, effect } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CotsInfoDto, PartInfoDto } from 'src/app/shared/models';
import { takeUntil, first } from 'rxjs/operators';
import { Observable, Subject, Subscription } from 'rxjs';
import { ConfirmationDialogConfig, MessagingService } from 'src/app/messaging/messaging.service';
import { Router } from '@angular/router';
import { CostingCompletionPercentageCalculator } from '../../services';
// import { CotsInfoState } from '../../../_state/cots-info.state';
// import * as CotsInfoAction from '../../../_actions/cots-info.action';
import { Store } from '@ngxs/store';
import { DataExtraction } from 'src/app/shared/models/data-extraction.model';
import { DataExtractionState } from 'src/app/modules/_state/dataextraction.state';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FourDigitDecimaNumberDirective } from 'src/app/shared/directives';
import { AutoTooltipDirective } from 'src/app/shared/directives/auto-tooltip.directive';
import { SharedSignalsService } from 'src/app/shared/signals/shared-signals.service';
import { CommaNewlineBrPipe } from 'src/app/shared/pipes/comma-newline-br.pipe';
import * as DescriptionJson from 'src/assets/descriptions.json';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { CotsInfoSignalsService } from 'src/app/shared/signals/cots-info-signals.service';

@Component({
  selector: 'app-costing-purchased-catalogue-part-information',
  templateUrl: './costing-purchased-catalogue-part-information.component.html',
  styleUrls: ['./costing-purchased-catalogue-part-information.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, FourDigitDecimaNumberDirective, AutoTooltipDirective, CommaNewlineBrPipe, NgbPopover],
})
export class CostingPurchasedCataloguePartInformationComponent implements OnInit, OnDestroy, OnChanges {
  @Input() part: PartInfoDto;
  @Input() canUpdate: boolean = false;
  @Output() completionPercentageChange = new EventEmitter<number>();
  @Output() dirtyCheckEvent = new EventEmitter<boolean>();
  public currentPart: PartInfoDto;
  public costInfoList: CotsInfoDto[] = [];
  public costingCOTsInfoform: FormGroup;
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  public selectedCotsInfoId = 0;
  isSubmitted = false;
  hasUnsavedEventSub$: Subscription = Subscription.EMPTY;
  nexturltonavigate: any;
  // _getCotsInfoStateByPartInfoId$: Observable<CotsInfoDto[]>;
  _dataExtraction$: Observable<DataExtraction>;
  @Input() recalculateSubject: Subject<any>;
  extractedPurchaseData: any;
  public popoverHook: NgbPopover;
  popupUrl: any;
  popupName: any;
  lstdescriptions: any = (DescriptionJson as any).default;
  url = '';
  name = 'World';
  show = false;
  cotsInfoEffect = effect(() => this.getCotsInfo(this.cotsInfoSignalsService.cotsInfo()));

  constructor(
    private _fb: FormBuilder,
    private messaging: MessagingService,
    private router: Router,
    private percentageCalculator: CostingCompletionPercentageCalculator,
    private _store: Store,
    public sharedSignalService: SharedSignalsService,
    private cotsInfoSignalsService: CotsInfoSignalsService
  ) {
    // this._getCotsInfoStateByPartInfoId$ = this._store.select(CotsInfoState.getCotsInfoByPartInfoId);
    this._dataExtraction$ = this._store.select(DataExtractionState.getDataExtraction);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['part'] && changes['part'].currentValue && changes['part'].currentValue != changes['part'].previousValue) {
      if (changes['part'].currentValue?.partInfoId != changes['part'].previousValue?.partInfoId || changes['part'].currentValue?.commodityId != changes['part'].previousValue?.commodityId) {
        this.reset();
        this.currentPart = changes['part'].currentValue;
        this.dispatchCotsInfo(this.currentPart.partInfoId);
      }
    }
  }

  dispatchCotsInfo(partInfoId: number) {
    if (partInfoId) {
      this.cotsInfoSignalsService.getCotsInfoByPartInfoId(partInfoId);
    }
  }

  getCotsInfo(result?: CotsInfoDto[]) {
    // this._getCotsInfoStateByPartInfoId$.pipe(takeUntil(this.unsubscribe$)).subscribe((result: CotsInfoDto[]) => {
    if (result?.length > 0 && this.currentPart?.partInfoId === result[0]?.partInfoId) {
      this.costInfoList = result;
      if (this.selectedCotsInfoId === 0) {
        const costInfoItem = this.isSubmitted ? this.costInfoList[this.costInfoList.length - 1] : this.costInfoList[0];
        this.onEditClick(costInfoItem);
      } else {
        this.onEditClick(this.costInfoList.find((x) => x.cotsInfoId === this.selectedCotsInfoId) || this.costInfoList[0]);
      }
    } else {
      this.costInfoList = [];
      this.reset();
    }
    // });
  }
  getExtractedData() {
    this._dataExtraction$.pipe(takeUntil(this.unsubscribe$)).subscribe((res: DataExtraction) => {
      if (res && res?.partInfoId > 0) {
        console.log('___________________________________________________________________');
        console.log('_________________CAD  PURCHASE EXTRACTED VALUES_____________________________');
        this.extractedPurchaseData = res?.cotsInfoJson ? JSON.parse(res?.cotsInfoJson) : [];
        console.log(this.extractedPurchaseData);
        console.log('___________________________________________________________________');
      } else {
        this.extractedPurchaseData = null;
      }
    });
  }

  ngOnInit(): void {
    this.getExtractedData();
    // this.getCotsInfoInfo();
    this.costingCOTsInfoform = this._fb.group({
      cotsInfoId: [0],
      PartDescription: ['', [Validators.required]],
      Description: ['', [Validators.required]],
      PartCost: [0, [Validators.required]],
      Qty: [0, [Validators.required]],
      PriceRef: ['0'],
      partInfoId: [0],
      PartNo: ['', [Validators.required]],
      ExtCost: [{ value: 0, disabled: true }],
      sourcePartInfoId: [0],
    });

    this.costingCOTsInfoform.valueChanges.subscribe((change) => {
      const value = this.percentageCalculator.purchaseCatalouge(change);
      this.completionPercentageChange.emit(value);
    });

    if (this.costInfoList !== null && this.costInfoList.length > 0) {
      this.onEditClick(this.costInfoList[0]);
    } else {
      this.completionPercentageChange.emit(0);
    }
    this.recalculateSubject.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      this.recalculateCotsInfo();
    });
  }

  recalculateCotsInfo() {
    if (this.extractedPurchaseData && this.costInfoList && this.costInfoList?.length < this.extractedPurchaseData?.length) {
      const costingCotsList: CotsInfoDto[] = [];
      this.extractedPurchaseData?.forEach((purchase) => {
        const cotsInfo = new CotsInfoDto();
        cotsInfo.cotsInfoId = purchase?.CotsInfoId;
        cotsInfo.partInfoId = purchase?.PartInfoId;
        cotsInfo.partName = purchase?.PartName;
        cotsInfo.partCost = purchase?.PartCost;
        cotsInfo.qty = purchase?.Qty;
        cotsInfo.extCost = purchase?.ExtCost;
        cotsInfo.priceRef = purchase?.PriceRef;
        cotsInfo.partNo = purchase.PartNo;
        cotsInfo.description = purchase.Description;
        costingCotsList.push(cotsInfo);
      });
      if (costingCotsList?.length > 0) {
        this.cotsInfoSignalsService.bulkUpdateCotsInfo(costingCotsList);
      }
    }
    this.messaging.openSnackBar(`Recalculation completed for Purchase Section.`, '', { duration: 5000 });
  }

  private reset() {
    if (this.costingCOTsInfoform) {
      this.costingCOTsInfoform.reset({
        cotsInfoId: 0,
        PartDescription: '',
        Description: '',
        PartCost: 0,
        Qty: 0,
        PriceRef: '0',
        partInfoId: 0,
        PartNo: '',
        ExtCost: 0,
        sourcePartInfoId: 0,
      });
    }
    this.selectedCotsInfoId = 0;
  }

  // addCatalogInfo(): void {
  //   this.reset();
  //   this.onFormSubmit();
  // }
  get f() {
    return this.costingCOTsInfoform.controls;
  }

  public onDeleteClick(costInfo: CotsInfoDto) {
    const dialogRef = this.messaging.openConfirmationDialog(<ConfirmationDialogConfig>{
      data: {
        title: 'Confirm Delete',
        message: 'This item will be deleted. Confirm delete by selecting CONFIRM, or cancel this action by selecting CANCEL.',
        action: 'CONFIRM',
        cancelText: 'CANCEL',
      },
    });
    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.unsubscribe$))
      .pipe(first())
      .subscribe((result) => {
        if (result) {
          this.cotsInfoSignalsService.deleteCotsInfo(costInfo.cotsInfoId, costInfo.partInfoId);
          this.selectedCotsInfoId = 0;
          this.isSubmitted = true;
          this.messaging.openSnackBar(`Data deleted successfully.`, '', { duration: 5000 });
          this.costInfoList = [...this.costInfoList.filter((x) => x.cotsInfoId != costInfo.cotsInfoId)];
          this.reset();
        }
      });
  }

  public onEditClick(costInfo: CotsInfoDto) {
    this.reset();
    this.selectedCotsInfoId = costInfo.cotsInfoId;
    const formattedDescription = costInfo.description?.replace(/,\s*/g, '\n');
    if (costInfo) {
      this.costingCOTsInfoform?.setValue({
        cotsInfoId: costInfo.cotsInfoId,
        PartDescription: costInfo.partName,
        Description: formattedDescription || '',
        PriceRef: costInfo.priceRef ?? '0',
        PartCost: costInfo.partCost,
        Qty: costInfo.qty,
        partInfoId: this.currentPart.partInfoId,
        PartNo: costInfo.partNo,
        ExtCost: costInfo.extCost ?? 0,
        sourcePartInfoId: costInfo.sourcePartInfoId ?? 0,
      });
    }
  }

  toggleReadMore(rowId) {
    const content = document.getElementById(rowId + '-content');
    const moreLink = document.getElementById(rowId + '-more');
    const lessLink = document.getElementById(rowId + '-less');

    if (moreLink.style.display === 'none') {
      content.style.maxHeight = '50px'; // You can adjust the height as needed
      moreLink.style.display = 'inline';
      lessLink.style.display = 'none';
    } else {
      content.style.maxHeight = '100px';
      moreLink.style.display = 'none';
      lessLink.style.display = 'inline';
    }
  }

  calculate() {
    const partCost = this.costingCOTsInfoform.controls['PartCost'].value || 0;
    const qty = this.costingCOTsInfoform.controls['Qty'].value || 0;
    this.costingCOTsInfoform.controls['ExtCost'].setValue(partCost * qty);
    this.costingCOTsInfoform.markAsDirty();
  }

  onFormValueChange() {
    this.dirtyCheckEvent.emit(true);
  }
  public onFormSubmit(): Observable<CotsInfoDto> {
    const descwithBreaks = this.costingCOTsInfoform.get('Description')?.value;
    const cleanedDesc = descwithBreaks.replace(/\n/g, ', ');

    const costingCOTsInfoform = this.costingCOTsInfoform.value;
    costingCOTsInfoform.Description = cleanedDesc;
    costingCOTsInfoform.partInfoId = this.currentPart.partInfoId;
    costingCOTsInfoform.partName = costingCOTsInfoform.PartDescription;
    costingCOTsInfoform.partNo = costingCOTsInfoform.PartNo;
    costingCOTsInfoform.extCost = costingCOTsInfoform.ExtCost;
    costingCOTsInfoform.sourcePartInfoId = costingCOTsInfoform?.sourcePartInfoId ? Number(costingCOTsInfoform?.sourcePartInfoId) : costingCOTsInfoform?.sourcePartInfoId;
    costingCOTsInfoform.dataCompletionPercentage = this.percentageCalculator.purchaseCatalouge(costingCOTsInfoform);
    if (costingCOTsInfoform.cotsInfoId > 0) {
      this.cotsInfoSignalsService.updateCotsInfo(costingCOTsInfoform);
      this.selectedCotsInfoId = costingCOTsInfoform.cotsInfoId;
    } else {
      this.cotsInfoSignalsService.createCotsInfo(costingCOTsInfoform);
      this.selectedCotsInfoId = 0;
    }
    this.isSubmitted = true;
    this.costingCOTsInfoform.markAsPristine();
    this.percentageCalculator.dispatchHasPartSectionDataUpdateEvent({});
    this.messaging.openSnackBar(`Data updated successfully.`, '', { duration: 5000 });
    this.navigatetoNextUrl();

    return new Observable((obs) => {
      obs.next(costingCOTsInfoform);
    });
  }

  public checkIfFormDirty() {
    return this.costingCOTsInfoform.dirty;
  }
  public resetform() {
    return this.costingCOTsInfoform.reset();
  }
  public getFormData() {
    return this.costingCOTsInfoform.value;
  }
  ngOnDestroy() {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
  }

  private navigatetoNextUrl() {
    if (this.nexturltonavigate != '' && this.nexturltonavigate != undefined) {
      const tempUrl = this.nexturltonavigate + '?ignoreactivate=1';
      this.nexturltonavigate = '';
      this.router.navigateByUrl(tempUrl);
    }
  }
  showinfo(filterValue: string) {
    let objdesc;
    if (this.lstdescriptions && this.lstdescriptions?.length > 0) {
      objdesc = this.lstdescriptions?.find((item: { id: string }) => item.id.toLowerCase() === filterValue.toLowerCase());
    }

    if (!!objdesc) {
      this.url = objdesc.imageUrl;
      this.show = !!this.url;
      this.name = objdesc.descriptions?.replace(/\n/g, '<br>') || '';
    }
  }
}
