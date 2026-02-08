import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, effect } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialInfoDto, ProcessInfoDto, ViewCostSummaryDto } from 'src/app/shared/models';
import { PartInfoDto } from 'src/app/shared/models/part-info.model';
import { combineLatest, Observable, Subject, Subscription } from 'rxjs';
import { MessagingService } from 'src/app/messaging/messaging.service';
import { MedbFgiccMasterDto, MedbIccMasterDto, MedbOverHeadProfitDto, MedbPaymentMasterDto, CostOverHeadProfitDto } from 'src/app/shared/models/overhead-Profit.model';
import { Router } from '@angular/router';
import { CostingCompletionPercentageCalculator } from '../../services';
import { BlockUiService, OverHeadProfitMasterService } from 'src/app/shared/services';
import { takeUntil, tap } from 'rxjs/operators';
// import { MaterialInfoState } from 'src/app/modules/_state/material-info.state';
import { Store } from '@ngxs/store';
import { OverheadProfitState } from 'src/app/modules/_state/overhead-profit.state';
import { FgiccState } from 'src/app/modules/_state/fgicc.state';
import { IccState } from 'src/app/modules/_state/icc.state';
import { MedbOhpState } from 'src/app/modules/_state/medbOHP.state';
import { MedbPaymentMasterState } from 'src/app/modules/_state/medb-payment-master.state';
import * as OverheadActions from 'src/app/modules/_actions/overhead-profit.action';
// import { CotsInfoState } from '../../../_state/cots-info.state';
import { CotsInfoDto } from '../../../../shared/models';
import { CostingOverheadProfitCalculatorService } from '../../services/costing-overhead-profit-calculator.service';
import { FieldColorsDto } from 'src/app/shared/models/field-colors.model';
import { ScreeName } from '../../costing.config';
import { SharedService } from '../../services/shared.service';
import { DigitalFactoryHelper } from '../../services/digital-factory-helper';
// import * as CostSummaryActions from 'src/app/modules/_actions/cost-summary.action';
import { CommonModule } from '@angular/common';
import { OnlyNumber } from 'src/app/shared/directives';
import * as DescriptionJson from 'src/assets/descriptions.json';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { MatIconModule } from '@angular/material/icon';
import { MaterialInfoSignalsService } from 'src/app/shared/signals/material-info-signals.service';
import { DigitalFactoryService } from 'src/app/modules/digital-factory/Service/digital-factory.service';
import { CostSummarySignalsService } from 'src/app/shared/signals/cost-summary-signals.service';
import { CotsInfoSignalsService } from 'src/app/shared/signals/cots-info-signals.service';

@Component({
  selector: 'app-costing-overhead-profit',
  templateUrl: './costing-overhead-profit.component.html',
  styleUrls: ['./costing-overhead-profit.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, OnlyNumber, NgbPopover, MatIconModule],
})
export class CostingOverheadProfitComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() part: PartInfoDto;
  @Output() completionPercentageChange = new EventEmitter<number>();
  @Output() dirtyCheckEvent = new EventEmitter<boolean>();
  @Input() reCalculateOverheadProfitSubject: Subject<PartInfoDto>;
  public currentPart: PartInfoDto;
  public costingOverHeadProfitForm: FormGroup;
  private netMatCostSum = 0;
  private extCostSum = 0;
  private materialCost = 0;
  private annualVolume = 0;
  private lotSize = 0;
  public isShowOverHead: boolean = true;
  public isShowCostOfCapital: boolean = true;
  public isShowInventoryCarrying: boolean = true;
  afterChange = false;
  private previousFormValue: any = {};
  public OverHeadIcon: string = 'remove_circle';
  public CostOfCapitalIcon: string = 'remove_circle';
  public InventoryCarryingIcon: string = 'remove_circle';
  private unsubscribe$: Subject<undefined> = new Subject<undefined>();
  private unsubscribeMasterData$: Subscription;
  materialInfoList: MaterialInfoDto[] = [];
  processInfoList: ProcessInfoDto[] = [];
  public medbFgiccMasterList: MedbFgiccMasterDto | undefined;
  public medbIccMasterList: MedbIccMasterDto | undefined;
  public medbMohList: MedbOverHeadProfitDto | undefined;
  public medbFohList: MedbOverHeadProfitDto | undefined;
  public medbSgaList: MedbOverHeadProfitDto | undefined;
  public medbProfitList: MedbOverHeadProfitDto | undefined;
  public medbPaymentList: MedbPaymentMasterDto | undefined;
  private costOverHeadProfitobj: CostOverHeadProfitDto;
  hasUnsavedEventSub$: Subscription = Subscription.EMPTY;
  nexturltonavigate: any;
  costSummaryViewData: ViewCostSummaryDto;
  dirtyFieldList: FieldColorsDto[] = [];
  isDirtyFieldsSaved: boolean = false;
  isCountryChanged = false;
  bulkUpdateOverHeadSubscription$: Subscription = Subscription.EMPTY;
  _bulkOverheadUpdateLoading$ = this._store.select(OverheadProfitState.getBulkOverheadUpdateStatus);
  @Input() countryChangeSubject: Subject<boolean>;
  @Output() recalculationCompletedEvent = new EventEmitter<any>();

  // _materialInfo$: Observable<MaterialInfoDto[]>;
  _viewCostSummary$: Observable<ViewCostSummaryDto[]>;
  // _getCotsInfoStateByPartInfoId$: Observable<CotsInfoDto[]>;
  _overheadprofit$: Observable<CostOverHeadProfitDto>;
  _fgicc$: Observable<MedbFgiccMasterDto[]>;
  _icc$: Observable<MedbIccMasterDto[]>;
  _medbohp$: Observable<MedbOverHeadProfitDto[]>;
  _paymentmaster$: Observable<MedbPaymentMasterDto[]>;
  public popoverHook: NgbPopover;
  popupUrl: any;
  popupName: any;
  lstdescriptions: any = (DescriptionJson as any).default;
  url = '';
  name = 'World';
  show = false;
  materialInfoEffect = effect(() => {
    const result = this.materialInfoSignalService.materialInfos();
    if (result?.length > 0) {
      this.materialInfoList = result;
      this.netMatCostSum = result.reduce((sum, x) => sum + (x.netMatCost || 0), 0);
      this.materialCost = this.netMatCostSum + this.extCostSum;
    }
  });
  cotsInfoEffect = effect(() => this.getCotsInfo(this.cotsInfoSignalsService.cotsInfo()));

  constructor(
    private _fb: FormBuilder,
    private router: Router,
    private messaging: MessagingService,
    private percentageCalculator: CostingCompletionPercentageCalculator,
    private _store: Store,
    private _costingOverheadProfitCalculatorService: CostingOverheadProfitCalculatorService,
    private sharedService: SharedService,
    private _overheadProfitService: OverHeadProfitMasterService,
    private blockUiService: BlockUiService,
    private digitalFactoryHelper: DigitalFactoryHelper,
    private materialInfoSignalService: MaterialInfoSignalsService,
    private readonly digitalFactoryService: DigitalFactoryService,
    private costSummarySignalsService: CostSummarySignalsService,
    private cotsInfoSignalsService: CotsInfoSignalsService
  ) {
    // this._materialInfo$ = this._store.select(MaterialInfoState.getMaterialInfos);
    this._viewCostSummary$ = this._store.select(OverheadProfitState.getViewCostSummary);
    // this._getCotsInfoStateByPartInfoId$ = this._store.select(CotsInfoState.getCotsInfoByPartInfoId);
    this._overheadprofit$ = this._store.select(OverheadProfitState.getOverheadProfit);
    this._fgicc$ = this._store.select(FgiccState.getMedbFgiccData);
    this._icc$ = this._store.select(IccState.getMedbIccData);
    this._medbohp$ = this._store.select(MedbOhpState.getMedbOverHeadProfitData);
    this._paymentmaster$ = this._store.select(MedbPaymentMasterState.getMedbPaymentData);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['part'] && changes['part'].currentValue && changes['part'].currentValue?.partInfoId && changes['part'].currentValue != changes['part'].previousValue) {
      if (
        changes['part'].currentValue?.partInfoId != changes['part'].previousValue?.partInfoId ||
        changes['part'].currentValue?.commodityId != changes['part'].previousValue?.commodityId ||
        changes['part'].currentValue?.annualVolume != changes['part'].previousValue?.annualVolume ||
        changes['part'].currentValue?.lotSize != changes['part'].previousValue?.lotSize ||
        changes['part'].currentValue?.paymentTermId != changes['part'].previousValue?.paymentTermId ||
        changes['part'].currentValue?.supplierInfoId != changes['part'].previousValue?.supplierInfoId
      ) {
        this.costOverHeadProfitobj = new CostOverHeadProfitDto();
        this.currentPart = changes['part'].currentValue;
        this.annualVolume = this.currentPart?.eav ?? 0;
        this.lotSize = this.currentPart?.lotSize ?? 0;
        if (this.lotSize == 0) {
          this.lotSize = this.annualVolume / 12;
        }
        this.getMasterData();
        this.initializeForm();
        if (this.currentPart?.partInfoId > 0) {
          this._store.dispatch(new OverheadActions.GetViewCostSummaryByPartInfoId(this.currentPart?.partInfoId));
          this._store.dispatch(new OverheadActions.GetOverHeadProfitByPartInfoId(this.currentPart?.partInfoId));
          this.previousFormValue = { ...this.costingOverHeadProfitForm.value };
        }
      }
    }
  }

  getCostSummaryDetails() {
    this._viewCostSummary$.pipe(takeUntil(this.unsubscribe$)).subscribe((result: ViewCostSummaryDto[]) => {
      if (result) {
        this.costSummaryViewData = result[0];
      }
    });
  }

  // getMaterialInfoList() {
  //   this._materialInfo$.pipe(takeUntil(this.unsubscribe$)).subscribe((result: MaterialInfoDto[]) => {
  //     if (result?.length > 0) {
  //       this.materialInfoList = result;
  //       this.netMatCostSum = this.materialInfoList?.reduce((sum, x) => (sum || 0) + (x.netMatCost || 0), 0) || 0;
  //       this.materialCost = this.netMatCostSum + this.extCostSum;
  //     }
  //   });
  // }

  ngOnInit(): void {
    this.isCountryChanged = false;
    // this.getCotsInfo();
    this.getCostSummaryDetails();
    // this.getMaterialInfoList(); // need to merge
    this.reCalculateOverheadProfitSubject.pipe(takeUntil(this.unsubscribe$)).subscribe((e) => {
      this.recalculateLOverheadProfitCost(e);
    });
    this.initializeForm();
    this.getOverHeadProfitData();
    this.countryChangeSubject.pipe(takeUntil(this.unsubscribe$)).subscribe((e) => {
      this.isCountryChanged = e;
    });
    this.completionPercentageChange.emit(0);
  }

  clickIcon(section: string) {
    if (section == 'OverHead') {
      if (this.OverHeadIcon == 'add_circle') {
        this.OverHeadIcon = 'remove_circle';
        this.isShowOverHead = true;
      } else if (this.OverHeadIcon == 'remove_circle') {
        this.OverHeadIcon = 'add_circle';
        this.isShowOverHead = false;
      }
    } else if (section == 'CostOfCapital') {
      if (this.CostOfCapitalIcon == 'add_circle') {
        this.CostOfCapitalIcon = 'remove_circle';
        this.isShowCostOfCapital = true;
      } else if (this.CostOfCapitalIcon == 'remove_circle') {
        this.CostOfCapitalIcon = 'add_circle';
        this.isShowCostOfCapital = false;
      }
    } else if (section == 'InventoryCarrying') {
      if (this.InventoryCarryingIcon == 'add_circle') {
        this.InventoryCarryingIcon = 'remove_circle';
        this.isShowInventoryCarrying = true;
      } else if (this.InventoryCarryingIcon == 'remove_circle') {
        this.InventoryCarryingIcon = 'add_circle';
        this.isShowInventoryCarrying = false;
      }
    }
  }

  private getOverHeadProfitData() {
    this._overheadprofit$.pipe(takeUntil(this.unsubscribe$)).subscribe((result: CostOverHeadProfitDto) => {
      if (result && result?.costOverHeadProfitId > 0 && result.partInfoId == this.currentPart?.partInfoId) {
        // this.costOverHeadProfitobj = result;
        this.costOverHeadProfitobj = { ...new CostOverHeadProfitDto(), ...result };
        // if (!this.isDirtyFieldsSaved && this.costOverHeadProfitobj?.costOverHeadProfitId > 0) {
        //   this.saveDirtyFields(this.costOverHeadProfitobj?.costOverHeadProfitId);
        //   this.isDirtyFieldsSaved = true;
        // }
        if (this.costOverHeadProfitobj?.costOverHeadProfitId > 0) {
          setTimeout(() => {
            this.getDirtyFields(this.costOverHeadProfitobj?.costOverHeadProfitId);
          }, 1000);
        }
      } else {
        this.costOverHeadProfitobj = new CostOverHeadProfitDto();
        this.getMasterData();
      }
    });
  }

  ngAfterViewInit() {
    this.previousFormValue = { ...this.costingOverHeadProfitForm.value };
    this.costingOverHeadProfitForm.valueChanges.subscribe((change) => {
      const value = this.percentageCalculator.overheadProfit(change);
      this.completionPercentageChange.emit(value);
      this.previousFormValue = { ...this.costingOverHeadProfitForm.value };
    });
  }

  private setForm() {
    if (this.costOverHeadProfitobj && this.costOverHeadProfitobj?.costOverHeadProfitId !== undefined) {
      if (this.currentPart && this.currentPart.supplierInfoId) {
        this.setSupplierValues(this.costOverHeadProfitobj, this.dirtyFieldList, true);
      }
    }
  }

  public onFormSubmit(isNotShowMsg?: boolean, isRecalculate?: boolean): Observable<CostOverHeadProfitDto> {
    const model = new CostOverHeadProfitDto();
    if (!this.costingOverHeadProfitForm.valid) {
      alert('Please fill the required fields!');
      return new Observable((obs) => {
        obs.next(model);
      });
    }
    model.costOverHeadProfitId = this.costOverHeadProfitobj?.costOverHeadProfitId || 0;
    model.partInfoId = this.currentPart?.partInfoId;
    model.iccPer = this.costingOverHeadProfitForm.controls['iccPer'].value || 0;
    model.iccCost = this.costingOverHeadProfitForm.controls['iccCost'].value || 0;
    model.mohPer = this.costingOverHeadProfitForm.controls['mohPer'].value || 0;
    model.mohCost = this.costingOverHeadProfitForm.controls['mohCost'].value || 0;
    model.fohPer = this.costingOverHeadProfitForm.controls['fohPer'].value || 0;
    model.fohCost = this.costingOverHeadProfitForm.controls['fohCost'].value || 0;
    model.sgaPer = this.costingOverHeadProfitForm.controls['sgaPer'].value || 0;
    model.sgaCost = this.costingOverHeadProfitForm.controls['sgaCost'].value || 0;
    model.materialProfitPer = this.costingOverHeadProfitForm.controls['materialProfitPer'].value || 0;
    model.processProfitPer = this.costingOverHeadProfitForm.controls['processProfitPer'].value || 0;
    model.profitCost = this.costingOverHeadProfitForm.controls['profitCost'].value || 0;
    model.paymentTermsPer = this.costingOverHeadProfitForm.controls['paymentTermsPer'].value || 0;
    model.paymentTermsCost = this.costingOverHeadProfitForm.controls['paymentTermsCost'].value || 0;
    model.fgiccPer = this.costingOverHeadProfitForm.controls['fgiccPer'].value || 0;
    model.fgiccCost = this.costingOverHeadProfitForm.controls['fgiccCost'].value || 0;
    model.dataCompletionPercentage = this.percentageCalculator.overheadProfit(model);

    model.warrentyCost = 0;
    model.warrentyPer = 0;

    if (model.costOverHeadProfitId > 0) {
      this._store.dispatch(new OverheadActions.UpdateOverHeadProfit(model));
      this.costSummarySignalsService.getCostSummaryByPartInfoId(this.currentPart?.partInfoId);
      if (!isNotShowMsg) {
        this.messaging.openSnackBar(`Data updated successfully.`, '', {
          duration: 5000,
        });
      }
      this.percentageCalculator.dispatchHasPartSectionDataUpdateEvent({});
      this.saveDirtyFields(model.costOverHeadProfitId);
      // this.isDirtyFieldsSaved = true;
    } else {
      this._store.dispatch(new OverheadActions.CreateOverHeadProfit(model));
      this.percentageCalculator.dispatchHasPartSectionDataUpdateEvent({});
    }
    if (isRecalculate) {
      this.bulkUpdateOverHeadSubscription$ = this._bulkOverheadUpdateLoading$.subscribe((overheadLoading) => {
        if (overheadLoading === false) {
          this.bulkUpdateOverHeadSubscription$.unsubscribe();
          this._store.dispatch(new OverheadActions.SetBulkOverheadUpdateLoading(true));
          this.messaging.openSnackBar(`Recalculation completed for Overhead Section.`, '', {
            duration: 5000,
          });
          this.recalculationCompletedEvent.emit(this.currentPart);
          this.blockUiService.popBlockUI('recalculate Overhead');
        }
      });
    }
    return new Observable((obs) => {
      obs.next(model);
    });
  }

  private getMedbFgiccData(fgicc: MedbFgiccMasterDto[], countryId: number, txtVolumeCat: string) {
    this.medbFgiccMasterList = fgicc.find((s: any) => s.countryId == countryId && s.volumeCategory == txtVolumeCat);
  }

  private getMedbIccData(icc: MedbIccMasterDto[], countryId: number, txtVolumeCat: string) {
    this.medbIccMasterList = icc.find((s: any) => s.countryId == countryId && s.volumeCategory == txtVolumeCat);
  }

  getMasterData(isRecalculate = false) {
    // add on ngonit and comment all other 4 methods
    this.unsubscribeMasterData$ = combineLatest([this._medbohp$, this._fgicc$, this._icc$, this._paymentmaster$])
      .pipe(
        tap(([medbohp, fgicc, icc, paymentmaster]) => {
          const AnnualVolume = this.currentPart?.eav | 0;
          const txtAnnualVolume = AnnualVolume;
          let txtVolumeCat: string = '';
          if (txtAnnualVolume <= 500) {
            txtVolumeCat = 'Low Volume <=500';
          } else if (txtAnnualVolume >= 500 && txtAnnualVolume <= 1000) {
            txtVolumeCat = 'Low Volume >500 to <=1,000';
          } else if (txtAnnualVolume >= 1000 && txtAnnualVolume <= 5000) {
            txtVolumeCat = 'Low Volume >1,000 to <=5,000';
          } else if (txtAnnualVolume >= 5000 && txtAnnualVolume <= 20000) {
            txtVolumeCat = 'Low Volume >5,000 to <=20,000';
          } else if (txtAnnualVolume >= 20000 && txtAnnualVolume <= 100000) {
            txtVolumeCat = 'Medium Volume >20,000 to <=100,000';
          } else {
            txtVolumeCat = 'High Volume >100,000';
          }
          const countryId = this.currentPart?.mfrCountryId;
          if (medbohp && medbohp.length > 0) {
            this.getMedbOverHeadProfitData(medbohp, countryId, txtVolumeCat);
          }
          if (fgicc && fgicc.length > 0) {
            this.getMedbFgiccData(fgicc, countryId, txtVolumeCat);
          }
          if (icc && icc.length > 0) {
            this.getMedbIccData(icc, countryId, txtVolumeCat);
          }
          if (paymentmaster && paymentmaster.length > 0) {
            this.getMedbPaymentData(paymentmaster, countryId);
          }

          if (isRecalculate) {
            this.recalculateOverHeadAndProfit();
          }
        })
      )
      .subscribe();
  }

  private initializeForm(): void {
    if (this.costingOverHeadProfitForm) return;
    this.costingOverHeadProfitForm = this._fb.group({
      CostOverHeadProfitId: 0,
      iccCost: { value: '', disabled: true },
      iccPer: '',
      mohCost: { value: '', disabled: true },
      mohPer: '',
      fohCost: { value: '', disabled: true },
      fohPer: '',
      sgaCost: { value: '', disabled: true },
      sgaPer: '',
      profitCost: { value: '', disabled: true },
      materialProfitPer: '',
      processProfitPer: '',
      paymentTermsCost: { value: '', disabled: true },
      paymentTermsPer: '',
      fgiccCost: { value: '', disabled: true },
      fgiccPer: '',
      OverheadandProfitAmount: { value: '', disabled: true },
      CostOfCapitalAmount: { value: '', disabled: true },
      InventoryCarryingAmount: { value: '', disabled: true },
    });
  }

  private getMedbOverHeadProfitData(medbohp: MedbOverHeadProfitDto[], countryId: number, txtVolumeCat: string) {
    const FilteredMasterList = medbohp.filter((s: any) => s.countryId == countryId && s.volumeCategory == txtVolumeCat);
    this.medbMohList = FilteredMasterList.find((s: any) => s.overHeadProfitType == 'MOH');
    this.medbFohList = FilteredMasterList.find((s: any) => s.overHeadProfitType == 'FOH');
    this.medbSgaList = FilteredMasterList.find((s: any) => s.overHeadProfitType == 'SGA');
    this.medbProfitList = FilteredMasterList.find((s: any) => s.overHeadProfitType == 'Profit');
  }

  private getMedbPaymentData(medbPayment: MedbPaymentMasterDto[], countryId: number) {
    const paymentTermId = this.currentPart?.paymentTermId;
    this.medbPaymentList = medbPayment?.find((s: any) => s.countryId == countryId && s.paymentTermId == paymentTermId);
  }

  public checkIfFormDirty() {
    return this.afterChange;
  }

  public resetform() {
    return this.costingOverHeadProfitForm.reset();
  }

  public getFormData() {
    return this.costingOverHeadProfitForm.value;
  }

  ngOnDestroy() {
    this.unsubscribe$.next(undefined);
    this.unsubscribe$.complete();
    if (this.unsubscribeMasterData$) {
      this.unsubscribeMasterData$.unsubscribe();
    }
    this.materialInfoEffect.destroy();
  }

  private navigatetoNextUrl() {
    if (this.nexturltonavigate != '' && this.nexturltonavigate != undefined) {
      const tempUrl = this.nexturltonavigate + '?ignoreactivate=1';
      this.nexturltonavigate = '';
      this.router.navigateByUrl(tempUrl);
    }
  }

  calculateCost() {
    const costingOverHeadProfitGet = new CostOverHeadProfitDto();
    if (this.costSummaryViewData && this.costingOverHeadProfitForm) {
      costingOverHeadProfitGet.isMohPerDirty = this.costingOverHeadProfitForm.controls['mohPer'].dirty;
      costingOverHeadProfitGet.isFohPerDirty = this.costingOverHeadProfitForm.controls['fohPer'].dirty;
      costingOverHeadProfitGet.isSgaPerDirty = this.costingOverHeadProfitForm.controls['sgaPer'].dirty;
      costingOverHeadProfitGet.isPaymentTermsPerDirty = this.costingOverHeadProfitForm.controls['paymentTermsPer'].dirty;
      costingOverHeadProfitGet.isIccPerDirty = this.costingOverHeadProfitForm.controls['iccPer'].dirty;
      costingOverHeadProfitGet.isFgiccPerDirty = this.costingOverHeadProfitForm.controls['fgiccPer'].dirty;
      costingOverHeadProfitGet.isMaterialProfitPerDirty = this.costingOverHeadProfitForm.controls['materialProfitPer'].dirty;
      costingOverHeadProfitGet.isProcessProfitPerDirty = this.costingOverHeadProfitForm.controls['processProfitPer'].dirty;

      this.formPristineUntouchMarking();

      costingOverHeadProfitGet.mohPer = (this.costingOverHeadProfitForm.controls['mohPer'].value ?? costingOverHeadProfitGet.mohPer) || this.previousFormValue?.mohPer;
      costingOverHeadProfitGet.fohPer = (this.costingOverHeadProfitForm.controls['fohPer'].value ?? costingOverHeadProfitGet.fohPer) || this.previousFormValue?.fohPer;
      costingOverHeadProfitGet.sgaPer = (this.costingOverHeadProfitForm.controls['sgaPer'].value ?? costingOverHeadProfitGet.sgaPer) || this.previousFormValue?.sgaPer;
      costingOverHeadProfitGet.paymentTermsPer =
        (this.costingOverHeadProfitForm.controls['paymentTermsPer'].value ?? costingOverHeadProfitGet.paymentTermsPer) || this.previousFormValue?.paymentTermsPer;
      costingOverHeadProfitGet.iccPer = (this.costingOverHeadProfitForm.controls['iccPer'].value ?? costingOverHeadProfitGet.iccPer) || this.previousFormValue?.iccPer;
      costingOverHeadProfitGet.fgiccPer = (this.costingOverHeadProfitForm.controls['fgiccPer'].value ?? costingOverHeadProfitGet.fgiccPer) || this.previousFormValue?.fgiccPer;
      costingOverHeadProfitGet.materialProfitPer =
        (this.costingOverHeadProfitForm.controls['materialProfitPer'].value ?? costingOverHeadProfitGet.materialProfitPer) || this.previousFormValue?.materialProfitPer;
      costingOverHeadProfitGet.processProfitPer =
        (this.costingOverHeadProfitForm.controls['processProfitPer'].value ?? costingOverHeadProfitGet.processProfitPer) || this.previousFormValue?.processProfitPer;

      const percentageResult = this._costingOverheadProfitCalculatorService.calculateOverheadCost(
        this.costSummaryViewData,
        this.medbFgiccMasterList,
        this.medbIccMasterList,
        this.medbPaymentList,
        this.medbMohList,
        this.medbFohList,
        this.medbSgaList,
        this.medbProfitList,
        this.dirtyFieldList,
        costingOverHeadProfitGet,
        this.costOverHeadProfitobj
      );

      this.costingOverHeadProfitForm.controls['fgiccPer'].setValue(this.sharedService.transformNumberTwoDecimal(percentageResult.fgiccPer));
      this.costingOverHeadProfitForm.controls['iccPer'].setValue(this.sharedService.transformNumberTwoDecimal(percentageResult.iccPer));
      this.costingOverHeadProfitForm.controls['paymentTermsPer'].setValue(this.sharedService.transformNumberTwoDecimal(percentageResult.paymentTermsPer));
      this.costingOverHeadProfitForm.controls['mohPer'].setValue(this.sharedService.transformNumberTwoDecimal(percentageResult.mohPer));
      this.costingOverHeadProfitForm.controls['fohPer'].setValue(this.sharedService.transformNumberTwoDecimal(percentageResult.fohPer));
      this.costingOverHeadProfitForm.controls['sgaPer'].setValue(this.sharedService.transformNumberTwoDecimal(percentageResult.sgaPer));
      this.costingOverHeadProfitForm.controls['materialProfitPer'].setValue(this.sharedService.transformNumberTwoDecimal(percentageResult.materialProfitPer));
      this.costingOverHeadProfitForm.controls['processProfitPer'].setValue(this.sharedService.transformNumberTwoDecimal(percentageResult.processProfitPer));
      const costResult = this._costingOverheadProfitCalculatorService.getAndSetData(
        this.costSummaryViewData,
        this.annualVolume,
        this.lotSize,
        this.currentPart?.paymentTermId,
        percentageResult,
        this.currentPart?.commodityId
      );

      this.costingOverHeadProfitForm.controls['iccCost'].patchValue(this.sharedService.isValidNumber(costResult.iccCost || 0));
      this.costingOverHeadProfitForm.controls['fgiccCost'].patchValue(this.sharedService.isValidNumber(costResult.fgiccCost || 0));
      this.costingOverHeadProfitForm.controls['paymentTermsCost'].patchValue(this.sharedService.isValidNumber(costResult.paymentTermsCost || 0));
      this.costingOverHeadProfitForm.controls['InventoryCarryingAmount'].patchValue(this.sharedService.isValidNumber(costResult.InventoryCarryingAmount || 0));
      this.costingOverHeadProfitForm.controls['CostOfCapitalAmount'].patchValue(this.sharedService.isValidNumber(costResult.CostOfCapitalAmount || 0));
      this.costingOverHeadProfitForm.controls['mohCost'].patchValue(this.sharedService.isValidNumber(costResult.mohCost || 0));
      this.costingOverHeadProfitForm.controls['fohCost'].patchValue(this.sharedService.isValidNumber(costResult.fohCost || 0));
      this.costingOverHeadProfitForm.controls['sgaCost'].patchValue(this.sharedService.isValidNumber(costResult.sgaCost || 0));
      const overheadTotalCost = Number(costResult.OverheadandProfitAmount || 0);
      this.costingOverHeadProfitForm.controls['OverheadandProfitAmount'].patchValue(this.sharedService.isValidNumber(overheadTotalCost || 0));
      this.costingOverHeadProfitForm.controls['profitCost'].patchValue(this.sharedService.isValidNumber(costResult.profitCost || 0));
    }
  }

  private formPristineUntouchMarking() {
    for (const el in this.costingOverHeadProfitForm.controls) {
      const control = this.costingOverHeadProfitForm.controls[el];
      if (control && [null, '', undefined].includes(control.value)) {
        this.costingOverHeadProfitForm.controls[el].markAsPristine();
        this.costingOverHeadProfitForm.controls[el].markAsUntouched();
        this.dirtyFieldList = this.dirtyFieldList.filter((x) => x.formControlName !== el);
      }
    }
  }

  getCotsInfo(result: CotsInfoDto[]) {
    // this._getCotsInfoStateByPartInfoId$.pipe(takeUntil(this.unsubscribe$)).subscribe((result: CotsInfoDto[]) => {
    if (result) {
      this.extCostSum = result.reduce((sum, x) => (sum || 0) + (x.extCost || 0), 0) || 0;
    }
    // this var should be filled from subscription
    // });
  }

  onFormValueChange() {
    this.afterChange = true;
    this.dirtyCheckEvent.emit(this.afterChange);
  }
  recalculateLOverheadProfitCost(part: any) {
    this.currentPart = part;
    this.getMasterData(true);
  }

  recalculateOverHeadAndProfit() {
    if (this.currentPart?.partInfoId > 0) {
      this.blockUiService.pushBlockUI('recalculate Overhead');
      this._overheadProfitService
        .getOverheadProfitByPartInfoId(this.currentPart?.partInfoId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((info: CostOverHeadProfitDto) => {
          if (info) {
            this.costOverHeadProfitobj = { ...new CostOverHeadProfitDto(), ...info };
            this._overheadProfitService
              .getCostSummaryViewByPartInfoId(this.currentPart?.partInfoId)
              .pipe(takeUntil(this.unsubscribe$))
              .subscribe((result: any) => {
                if (result) {
                  this.sharedService
                    .getColorInfos(this.currentPart?.partInfoId, ScreeName.OverheadProfit, this.costOverHeadProfitobj?.costOverHeadProfitId || 0)
                    .pipe(takeUntil(this.unsubscribe$))
                    .subscribe((colorInfo: FieldColorsDto[]) => {
                      if (colorInfo) {
                        this.costSummaryViewData = result[0];
                        this.setSupplierValues(this.costOverHeadProfitobj, colorInfo, false, true);
                      }
                    });
                } else {
                  this.blockUiService.popBlockUI('recalculate Overhead');
                }
              });
          } else {
            this.blockUiService.popBlockUI('recalculate Overhead');
          }
        });
    }
  }

  private saveDirtyFields(overheadId: number) {
    const dirtyItems = [];
    this.dirtyFieldList = [];
    for (const el in this.costingOverHeadProfitForm.controls) {
      if (this.costingOverHeadProfitForm.controls[el].dirty || this.costingOverHeadProfitForm.controls[el].touched) {
        const fieldColorsDto = new FieldColorsDto();
        fieldColorsDto.isDirty = this.costingOverHeadProfitForm.controls[el].dirty;
        fieldColorsDto.formControlName = el;
        fieldColorsDto.isTouched = this.costingOverHeadProfitForm.controls[el].touched;
        fieldColorsDto.partInfoId = this.currentPart.partInfoId;
        fieldColorsDto.screenId = ScreeName.OverheadProfit;
        fieldColorsDto.primaryId = overheadId;
        dirtyItems.push(fieldColorsDto);
      }
    }
    if (dirtyItems.length > 0) {
      this.sharedService
        .updateColorInfo(dirtyItems)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((result) => {
          if (result) {
            this.dirtyFieldList = result;
            result.forEach((element) => {
              if (element.isTouched) {
                this.costingOverHeadProfitForm.get(element.formControlName).markAsTouched();
              }
              if (element.isDirty) {
                this.costingOverHeadProfitForm.get(element.formControlName).markAsDirty();
              }
            });
          }
          this.afterChange = false;
          this.dirtyCheckEvent.emit(this.afterChange);
        });
    }
  }

  private getDirtyFields(overheadId: number) {
    this.dirtyFieldList = [];
    if (overheadId > 0) {
      this.sharedService
        .getColorInfos(this.currentPart?.partInfoId, ScreeName.OverheadProfit, overheadId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe((result: FieldColorsDto[]) => {
          if (result) {
            this.dirtyFieldList = result;
            result?.forEach((element) => {
              if (element?.isTouched) {
                this.costingOverHeadProfitForm.get(element?.formControlName)?.markAsTouched();
              }
              if (element?.isDirty) {
                this.costingOverHeadProfitForm.get(element?.formControlName)?.markAsDirty();
              }
            });
            this.setForm();
          }
        });
    }
  }

  private setSupplierValues(costOverHeadProfobj: CostOverHeadProfitDto, colorInfo?: FieldColorsDto[], isOnPageLoad: boolean = false, isRecalculate: boolean = false): any {
    const costOverHeadProfitobj: CostOverHeadProfitDto = { ...costOverHeadProfobj };
    if (!this.part?.supplierInfoId) return;
    this.digitalFactoryService
      .getMasterSupplierInfoByIds([this.part?.supplierInfoId])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (response) => {
          let supplierInfoOverHeadValues;
          if (response && response.length > 0) {
            const supplierInfo = response[0];
            supplierInfoOverHeadValues = this.digitalFactoryHelper.getSupplierOverHeadValues(supplierInfo, costOverHeadProfitobj);
          }
          if (!isOnPageLoad) {
            const percentageResult = this._costingOverheadProfitCalculatorService.calculateOverheadCost(
              this.costSummaryViewData,
              this.medbFgiccMasterList,
              this.medbIccMasterList,
              this.medbPaymentList,
              this.medbMohList,
              this.medbFohList,
              this.medbSgaList,
              this.medbProfitList,
              colorInfo,
              costOverHeadProfitobj,
              this.costOverHeadProfitobj
            );
            supplierInfoOverHeadValues.iccPer = percentageResult?.iccPer;
            supplierInfoOverHeadValues.mohPer = percentageResult?.mohPer;
            supplierInfoOverHeadValues.fohPer = percentageResult?.fohPer;
            supplierInfoOverHeadValues.sgaPer = percentageResult?.sgaPer;
            supplierInfoOverHeadValues.paymentTermsPer = percentageResult?.paymentTermsPer;
            supplierInfoOverHeadValues.fgiccPer = percentageResult?.fgiccPer;
            supplierInfoOverHeadValues.processProfitPer = percentageResult?.processProfitPer;
            supplierInfoOverHeadValues.materialProfitPer = percentageResult?.materialProfitPer;
          }
          costOverHeadProfitobj.iccPer = this.sharedService.isValidNumber(Number(supplierInfoOverHeadValues?.iccPer));
          costOverHeadProfitobj.mohPer = this.sharedService.isValidNumber(Number(supplierInfoOverHeadValues?.mohPer));
          costOverHeadProfitobj.fohPer = this.sharedService.isValidNumber(Number(supplierInfoOverHeadValues?.fohPer));
          costOverHeadProfitobj.sgaPer = this.sharedService.isValidNumber(Number(supplierInfoOverHeadValues?.sgaPer));
          costOverHeadProfitobj.paymentTermsPer = this.sharedService.isValidNumber(Number(supplierInfoOverHeadValues?.paymentTermsPer));
          costOverHeadProfitobj.fgiccPer = this.sharedService.isValidNumber(Number(supplierInfoOverHeadValues?.fgiccPer));
          costOverHeadProfitobj.materialProfitPer = this.sharedService.isValidNumber(Number(supplierInfoOverHeadValues?.materialProfitPer));
          costOverHeadProfitobj.processProfitPer = this.sharedService.isValidNumber(Number(supplierInfoOverHeadValues?.processProfitPer));

          this.costingOverHeadProfitForm.patchValue({
            CostOverHeadProfitId: costOverHeadProfitobj?.costOverHeadProfitId,
            iccPer: this.sharedService.transformNumberTwoDecimal(Number(supplierInfoOverHeadValues?.iccPer)),
            mohPer: this.sharedService.transformNumberTwoDecimal(Number(supplierInfoOverHeadValues?.mohPer)),
            fohPer: this.sharedService.transformNumberTwoDecimal(Number(supplierInfoOverHeadValues?.fohPer)),
            sgaPer: this.sharedService.transformNumberTwoDecimal(Number(supplierInfoOverHeadValues?.sgaPer)),
            materialProfitPer: this.sharedService.transformNumberTwoDecimal(Number(supplierInfoOverHeadValues?.materialProfitPer)),
            processProfitPer: this.sharedService.transformNumberTwoDecimal(Number(supplierInfoOverHeadValues?.processProfitPer)),
            paymentTermsPer: this.sharedService.transformNumberTwoDecimal(Number(supplierInfoOverHeadValues?.paymentTermsPer)),
            fgiccPer: this.sharedService.transformNumberTwoDecimal(Number(supplierInfoOverHeadValues?.fgiccPer)),
          });
          this.calculateCost();
          this.afterChange = false;
          this.dirtyCheckEvent.emit(this.afterChange);
          !isOnPageLoad && this.onFormSubmit(true, isRecalculate);
          return costOverHeadProfitobj;
        },
      });
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
