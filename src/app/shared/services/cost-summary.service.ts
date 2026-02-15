import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { CostSummaryDto, ViewCostSummaryDto } from '../models';
import { SnackBarErrorHandlerService } from './snackbar-error-handler.service';

@Injectable({ providedIn: 'root' })
export class CostSummaryService extends BaseHttpService {
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  saveCostSummary(costSummary: CostSummaryDto): Observable<CostSummaryDto> {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/costSummary/create`;
    return this.postEx<CostSummaryDto, CostSummaryDto>(url, httpOptions, costSummary).pipe(catchError(this.handleError<CostSummaryDto>('saveCostSummary')));
  }

  updateCostsummary(costSummary: CostSummaryDto): Observable<CostSummaryDto> {
    const httpOptions = this.createOptions('put');
    const url = `/api/costing/costSummary/${costSummary.costSummaryId}/update`;
    return this.putEx<CostSummaryDto, CostSummaryDto>(url, httpOptions, costSummary).pipe(catchError(this.handleError<CostSummaryDto>('updateCostsummary')));
  }

  getCostSummaryViewByPartInfoId(partInfoId: number): Observable<ViewCostSummaryDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/costsummary/partInfo/${partInfoId}`;
    return this.getEx<ViewCostSummaryDto[]>(url, httpOptions).pipe(catchError(this.handleError<ViewCostSummaryDto[]>('getCostSummaryViewByPartInfoId')));
  }

  getCostSummaryViewByMultiplePartInfoIds(partInfoIds: number[]): Observable<ViewCostSummaryDto[]> {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/costsummary/partInfo/byPartIds`;
    return this.postEx<ViewCostSummaryDto[], number[]>(url, httpOptions, partInfoIds).pipe(catchError(this.handleError<ViewCostSummaryDto[]>('getCostSummaryViewByMultiplePartInfoIds')));
  }

  getAICategory(jsonData): Observable<any> {
    const httpOptions = this.createOptions('post');
    const url = `/api/image/aigeometric`;
    console.log('===>', jsonData);
    return this.postEx<any, FormData>(url, httpOptions, jsonData).pipe(catchError(this.handleError<any[]>('getAICategory')));
  }
}
