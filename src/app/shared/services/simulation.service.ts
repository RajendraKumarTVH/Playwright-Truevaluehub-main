import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { SnackBarErrorHandlerService } from './snackbar-error-handler.service';
import { BestRegionAnalyticsDto, ListBestRegionAnalyticsDto } from 'src/app/modules/analytics/models/best-region-analytics.model';
import { SimulationTotalCostDto } from 'src/app/modules/analytics/models/simulationTotalCostDto.model';

@Injectable({ providedIn: 'root' })
export class SimulationService extends BaseHttpService {
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  saveBestRegionAnalytics(payload: ListBestRegionAnalyticsDto): Observable<ListBestRegionAnalyticsDto> {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/BestRegionAnalytics/createorupdate`;
    return this.postEx<ListBestRegionAnalyticsDto, ListBestRegionAnalyticsDto>(url, httpOptions, payload).pipe(catchError(this.handleError<ListBestRegionAnalyticsDto>('saveBestRegionAnalytics')));
  }

  getSimulationResult(partInfoId: number): Observable<SimulationTotalCostDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/SimulationCost/simulation-cost?partInfoId=${partInfoId}`;
    return this.getEx<SimulationTotalCostDto[]>(url, httpOptions).pipe(catchError(this.handleError<SimulationTotalCostDto[]>('getSimulationResult')));
  }

  getBestRegionAnalyticsList(): Observable<BestRegionAnalyticsDto[]> {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/BestRegionAnalytics/GetAllBestRegionAnalytics`;
    return this.postEx<any, BestRegionAnalyticsDto[]>(url, httpOptions, {} as any).pipe(catchError(this.handleError<BestRegionAnalyticsDto[]>('getBestRegionAnalyticsList')));
  }

  deleteBestRegionAnalytics(id: number): Observable<any> {
    const httpOptions = this.createOptions('delete');
    const url = `/api/costing/BestRegionAnalytics/${id}`;
    return this.deleteEx<any>(url, httpOptions).pipe(catchError(this.handleError<any>('deleteBestRegionAnalytics')));
  }
}
