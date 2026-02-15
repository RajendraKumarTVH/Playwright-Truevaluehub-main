import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { SnackBarErrorHandlerService } from './snackbar-error-handler.service';
import { MedbFgiccMasterDto, MedbIccMasterDto, MedbOverHeadProfitDto, MedbPaymentMasterDto, CostOverHeadProfitDto } from 'src/app/shared/models/overhead-Profit.model';
import { ViewCostSummaryDto } from '../models';

@Injectable({ providedIn: 'root' })
export class OverHeadProfitMasterService extends BaseHttpService {
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  getMedbFgiccData(): Observable<MedbFgiccMasterDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/OverHeadProfit/getMedbFgicc`;
    return this.getMasterEx<MedbFgiccMasterDto[]>(url, httpOptions).pipe(catchError(this.handleError<MedbFgiccMasterDto[]>('getMedbFgiccData')));
  }

  getMedbIccData(): Observable<MedbIccMasterDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/OverHeadProfit/getMedbIcc`;
    return this.getMasterEx<MedbIccMasterDto[]>(url, httpOptions).pipe(catchError(this.handleError<MedbIccMasterDto[]>('getMedbIccData')));
  }

  getMedbOverHeadProfitData(): Observable<MedbOverHeadProfitDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/OverHeadProfit/getMedbOverHeadProfit`;
    return this.getMasterEx<MedbOverHeadProfitDto[]>(url, httpOptions).pipe(catchError(this.handleError<MedbOverHeadProfitDto[]>('getMedbOverHeadProfitData')));
  }

  getMedbPaymentData(): Observable<MedbPaymentMasterDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/OverHeadProfit/getMedbPayment`;
    return this.getMasterEx<MedbPaymentMasterDto[]>(url, httpOptions).pipe(catchError(this.handleError<MedbPaymentMasterDto[]>('getMedbPaymentData')));
  }

  saveCostOverHeadProfit(costOverHeadProfit: CostOverHeadProfitDto): Observable<CostOverHeadProfitDto> {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/OverHeadProfit/create`;
    return this.postEx<CostOverHeadProfitDto, CostOverHeadProfitDto>(url, httpOptions, costOverHeadProfit).pipe(catchError(this.handleError<CostOverHeadProfitDto>('saveCostOverHeadProfit')));
  }

  updateCostOverHeadProfit(costOverHeadProfit: CostOverHeadProfitDto): Observable<CostOverHeadProfitDto> {
    const httpOptions = this.createOptions('put');
    const url = `/api/costing/OverHeadProfit/${costOverHeadProfit.costOverHeadProfitId}/update`;
    return this.putEx<CostOverHeadProfitDto, CostOverHeadProfitDto>(url, httpOptions, costOverHeadProfit).pipe(catchError(this.handleError<CostOverHeadProfitDto>('updateCostOverHeadProfit')));
  }

  getOverheadProfitByPartInfoId(partInfoId: number): Observable<CostOverHeadProfitDto> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/OverHeadProfit/${partInfoId}/partInfo`;
    return this.getEx<CostOverHeadProfitDto>(url, httpOptions).pipe(catchError(this.handleError<CostOverHeadProfitDto>('getOverheadProfitByPartInfoId')));
  }

  getCostSummaryViewByPartInfoId(partInfoId: number): Observable<ViewCostSummaryDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/OverHeadProfit/partInfo/${partInfoId}`;
    return this.getEx<ViewCostSummaryDto[]>(url, httpOptions).pipe(catchError(this.handleError<ViewCostSummaryDto[]>('getCostSummaryViewByPartInfoId')));
  }
}
