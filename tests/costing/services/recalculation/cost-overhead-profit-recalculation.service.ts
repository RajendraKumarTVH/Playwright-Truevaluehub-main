import { Injectable, inject } from '@angular/core';
import { MedbFgiccMasterDto, SupplierOverHeadResult, MedbIccMasterDto, MedbOverHeadProfitDto, MedbPaymentMasterDto, CostOverHeadProfitDto } from 'src/app/shared/models/overhead-Profit.model';
import { DigitalFactoryHelper } from '../../services/digital-factory-helper';
import { SharedService } from '../../services/shared.service';
import { OverHeadProfitMasterService } from 'src/app/shared/services';
import { FieldColorsDto } from 'src/app/shared/models/field-colors.model';
import { CostingOverheadProfitCalculatorService } from '../../services/costing-overhead-profit-calculator.service';
import { ViewCostSummaryDto } from 'src/app/shared/models';
import { PartInfoDto } from 'src/app/shared/models/part-info.model';
import { CostingCompletionPercentageCalculator } from '../../services';
import { combineLatest, Observable, of } from 'rxjs';
import { switchMap, map, tap, take, filter } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { MedbPaymentMasterState } from 'src/app/modules/_state/medb-payment-master.state';
import { FgiccState } from 'src/app/modules/_state/fgicc.state';
import { IccState } from 'src/app/modules/_state/icc.state';
import { MedbOhpState } from 'src/app/modules/_state/medbOHP.state';
import { DigitalFactoryService } from 'src/app/modules/digital-factory/Service/digital-factory.service';

@Injectable({
  providedIn: 'root',
})
export class CostOverheadProfitRecalculationService {
  private _store = inject(Store);
  costSummaryViewData: ViewCostSummaryDto;
  public medbFgiccMasterList: MedbFgiccMasterDto | undefined;
  public medbIccMasterList: MedbIccMasterDto | undefined;
  public medbMohList: MedbOverHeadProfitDto | undefined;
  public medbFohList: MedbOverHeadProfitDto | undefined;
  public medbSgaList: MedbOverHeadProfitDto | undefined;
  public medbProfitList: MedbOverHeadProfitDto | undefined;
  public medbPaymentList: MedbPaymentMasterDto | undefined;
  public currentPart: PartInfoDto;
  private costOverHeadProfitobj: CostOverHeadProfitDto;
  dirtyFieldList: FieldColorsDto[] = [];
  annualVolume: number;
  lotSize: number;
  _medbohp$: Observable<MedbOverHeadProfitDto[]> = this._store.select(MedbOhpState.getMedbOverHeadProfitData);
  _fgicc$: Observable<MedbFgiccMasterDto[]> = this._store.select(FgiccState.getMedbFgiccData);
  _icc$: Observable<MedbIccMasterDto[]> = this._store.select(IccState.getMedbIccData);
  _paymentmaster$: Observable<MedbPaymentMasterDto[]> = this._store.select(MedbPaymentMasterState.getMedbPaymentData);

  constructor(
    private digitalFactoryHelper: DigitalFactoryHelper,
    private sharedService: SharedService,
    private _overheadProfitService: OverHeadProfitMasterService,
    private _costingOverheadProfitCalculatorService: CostingOverheadProfitCalculatorService,
    private percentageCalculator: CostingCompletionPercentageCalculator,
    private readonly digitalFactoryService: DigitalFactoryService
  ) {}

  public getMasterData(selectedPart: any): Observable<boolean> {
    this.currentPart = { ...selectedPart };
    this.annualVolume = this.currentPart?.eav ?? 0;
    this.lotSize = this.currentPart?.lotSize ?? 0;
    if (this.lotSize == 0) {
      this.lotSize = this.annualVolume / 12;
    }
    return combineLatest([this._medbohp$, this._fgicc$, this._icc$, this._paymentmaster$]).pipe(
      take(1),
      tap(([medbohp, fgicc, icc, paymentmaster]) => {
        const txtAnnualVolume = selectedPart?.eav | 0;
        let txtVolumeCat = '';

        if (txtAnnualVolume <= 500) {
          txtVolumeCat = 'Low Volume <=500';
        } else if (txtAnnualVolume <= 1000) {
          txtVolumeCat = 'Low Volume >500 to <=1,000';
        } else if (txtAnnualVolume <= 5000) {
          txtVolumeCat = 'Low Volume >1,000 to <=5,000';
        } else if (txtAnnualVolume <= 20000) {
          txtVolumeCat = 'Low Volume >5,000 to <=20,000';
        } else if (txtAnnualVolume <= 100000) {
          txtVolumeCat = 'Medium Volume >20,000 to <=100,000';
        } else {
          txtVolumeCat = 'High Volume >100,000';
        }

        const countryId = this.currentPart?.mfrCountryId;

        if (medbohp?.length) {
          this.getMedbOverHeadProfitData(medbohp, countryId, txtVolumeCat);
        }
        if (fgicc?.length) {
          this.getMedbFgiccData(fgicc, countryId, txtVolumeCat);
        }
        if (icc?.length) {
          this.getMedbIccData(icc, countryId, txtVolumeCat);
        }
        if (paymentmaster?.length) {
          this.getMedbPaymentData(paymentmaster, countryId, selectedPart);
        }
      }),
      map(() => true)
    );
  }

  private getMedbFgiccData(fgicc: MedbFgiccMasterDto[], countryId: number, txtVolumeCat: string) {
    this.medbFgiccMasterList = fgicc.find((s: any) => s.countryId == countryId && s.volumeCategory == txtVolumeCat);
  }
  private getMedbPaymentData(medbPayment: MedbPaymentMasterDto[], countryId: number, selectedPart: any) {
    const paymentTermId = selectedPart?.paymentTermId;
    this.medbPaymentList = medbPayment?.find((s: any) => s.countryId == countryId && s.paymentTermId == paymentTermId);
  }
  private getMedbIccData(icc: MedbIccMasterDto[], countryId: number, txtVolumeCat: string) {
    this.medbIccMasterList = icc.find((s: any) => s.countryId == countryId && s.volumeCategory == txtVolumeCat);
  }
  private getMedbOverHeadProfitData(medbohp: MedbOverHeadProfitDto[], countryId: number, txtVolumeCat: string) {
    const filteredMasterList = medbohp.filter((s: any) => s.countryId == countryId && s.volumeCategory == txtVolumeCat);
    this.medbMohList = filteredMasterList.find((s: any) => s.overHeadProfitType == 'MOH');
    this.medbFohList = filteredMasterList.find((s: any) => s.overHeadProfitType == 'FOH');
    this.medbSgaList = filteredMasterList.find((s: any) => s.overHeadProfitType == 'SGA');
    this.medbProfitList = filteredMasterList.find((s: any) => s.overHeadProfitType == 'Profit');
  }

  public setSupplierValues(costOverHeadProfobj: CostOverHeadProfitDto, colorInfo?: FieldColorsDto[]): Observable<SupplierOverHeadResult> {
    const costOverHeadProfitobj = Object.assign(new CostOverHeadProfitDto(), costOverHeadProfobj);

    return this.digitalFactoryService.getMasterSupplierInfoByIds([this.currentPart?.supplierInfoId]).pipe(
      filter((response) => !!response && response.length > 0),
      map((response) => {
        const supplierInfo = response[0];
        const supplierInfoOverHeadValues = this.digitalFactoryHelper.getSupplierOverHeadValues(supplierInfo, costOverHeadProfitobj);
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
          costOverHeadProfitobj,
          this.costOverHeadProfitobj
        );

        if (this.sharedService.checkDirtyProperty('iccPer', colorInfo)) {
          supplierInfoOverHeadValues.iccPer = percentageResult?.iccPer;
        }
        if (this.sharedService.checkDirtyProperty('mohPer', colorInfo)) {
          supplierInfoOverHeadValues.mohPer = percentageResult?.mohPer;
        }
        if (this.sharedService.checkDirtyProperty('fohPer', colorInfo)) {
          supplierInfoOverHeadValues.fohPer = percentageResult?.fohPer;
        }
        if (this.sharedService.checkDirtyProperty('sgaPer', colorInfo)) {
          supplierInfoOverHeadValues.sgaPer = percentageResult?.sgaPer;
        }
        if (this.sharedService.checkDirtyProperty('paymentTermsPer', colorInfo)) {
          supplierInfoOverHeadValues.paymentTermsPer = percentageResult?.paymentTermsPer;
        }
        if (this.sharedService.checkDirtyProperty('fgiccPer', colorInfo)) {
          supplierInfoOverHeadValues.fgiccPer = percentageResult?.fgiccPer;
        }
        if (this.sharedService.checkDirtyProperty('processProfitPer', colorInfo)) {
          supplierInfoOverHeadValues.processProfitPer = percentageResult?.processProfitPer;
        }
        if (this.sharedService.checkDirtyProperty('materialProfitPer', colorInfo)) {
          supplierInfoOverHeadValues.materialProfitPer = percentageResult?.materialProfitPer;
        }

        costOverHeadProfitobj.iccPer = this.sharedService.isValidNumber(+supplierInfoOverHeadValues.iccPer);
        costOverHeadProfitobj.mohPer = this.sharedService.isValidNumber(+supplierInfoOverHeadValues.mohPer);
        costOverHeadProfitobj.fohPer = this.sharedService.isValidNumber(+supplierInfoOverHeadValues.fohPer);
        costOverHeadProfitobj.sgaPer = this.sharedService.isValidNumber(+supplierInfoOverHeadValues.sgaPer);
        costOverHeadProfitobj.paymentTermsPer = this.sharedService.isValidNumber(+supplierInfoOverHeadValues.paymentTermsPer);
        costOverHeadProfitobj.fgiccPer = this.sharedService.isValidNumber(+supplierInfoOverHeadValues.fgiccPer);
        costOverHeadProfitobj.materialProfitPer = this.sharedService.isValidNumber(+supplierInfoOverHeadValues.materialProfitPer);
        costOverHeadProfitobj.processProfitPer = this.sharedService.isValidNumber(+supplierInfoOverHeadValues.processProfitPer);

        return {
          supplierInfoOverHeadValues,
          costOverHeadProfit: costOverHeadProfitobj,
        };
      })
    );
  }

  recalculateOverHeadAndProfit(currentPart: PartInfoDto): Observable<CostOverHeadProfitDto | null> {
    if (!currentPart?.partInfoId) {
      return of(null);
    }

    this.currentPart = { ...currentPart };
    return this._overheadProfitService.getOverheadProfitByPartInfoId(this.currentPart.partInfoId).pipe(
      filter(Boolean),

      tap((info: CostOverHeadProfitDto) => {
        this.costOverHeadProfitobj = Object.assign(new CostOverHeadProfitDto(), info);
      }),

      switchMap(() => this._overheadProfitService.getCostSummaryViewByPartInfoId(this.currentPart.partInfoId)),
      map((result: any[]) => {
        if (!result || !result.length) {
          return null;
        }

        this.costSummaryViewData = result[0];
        const overheadInfo = Object.assign(new CostOverHeadProfitDto(), this.costOverHeadProfitobj);
        overheadInfo.iccCost = this.sharedService.isValidNumber(overheadInfo.iccCost);
        overheadInfo.mohCost = this.sharedService.isValidNumber(overheadInfo.mohCost);
        overheadInfo.fohCost = this.sharedService.isValidNumber(overheadInfo.fohCost);
        overheadInfo.paymentTermsCost = this.sharedService.isValidNumber(overheadInfo.paymentTermsCost);
        overheadInfo.sgaCost = this.sharedService.isValidNumber(overheadInfo.sgaCost);
        overheadInfo.profitCost = this.sharedService.isValidNumber(overheadInfo.profitCost);
        overheadInfo.fgiccCost = this.sharedService.isValidNumber(overheadInfo.fgiccCost);

        overheadInfo.partInfoId = this.currentPart.partInfoId;
        overheadInfo.dataCompletionPercentage = this.percentageCalculator.overheadProfit(overheadInfo);

        overheadInfo.warrentyPer = 0;
        overheadInfo.warrentyCost = 0;
        overheadInfo.toolingId = null;

        return overheadInfo;
      })
    );
  }
}
