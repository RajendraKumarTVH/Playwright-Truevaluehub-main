import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { OverviewFilter } from '../enums/overview-tile-enum';
import { OverviewDto } from '../models';
import { EmbedParametersDto } from '../models/embed-powerbi.model';
import { SnackBarErrorHandlerService } from './snackbar-error-handler.service';

@Injectable({ providedIn: 'root' })
export class OverviewService extends BaseHttpService {
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  getSelectedOverviewTilesData(filter: OverviewFilter, fromDate?: Date, toDate?: Date): Observable<OverviewDto[]> {
    const httpOptions = this.createOptions('get');
    let url = `/api/costing/overview?filter=${filter.toString}`;
    if (fromDate) {
      url = `${url}&fromDate=${fromDate}&toDate=${toDate}`;
    }
    return this.getEx<OverviewDto[]>(url, httpOptions).pipe(catchError(this.handleError<OverviewDto[]>('getSelectedOverviewTilesData')));
  }

  getPowerBiAccessToken() {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/PowerBI/getAccessToken`;
    return this.getEx<EmbedParametersDto>(url, httpOptions).pipe(catchError(this.handleError<EmbedParametersDto>('getPowerBiAccessToken')));
  }
}
