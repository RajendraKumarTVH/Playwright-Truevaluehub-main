import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { DutiesTariffDto } from '../models';
import { AppConfigurationService } from './app-configuration.service';
import { BaseHttpService } from './base-http.service';
import { BlockUiService } from './block-ui.service';
import { SnackBarErrorHandlerService } from './snackbar-error-handler.service';
import { ApiCacheService } from './api-cache.service';
import { TariffBreakDownResponse } from '../models/tariff-breakdowns-response.model';
import { TariffBreakDownRequest } from '../models/tariff-breakdowns-request.model';

@Injectable({
  providedIn: 'root',
})
export class DutiesTariffService extends BaseHttpService {
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  getDutiesTariff() {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/dutiesTariff`;
    return this.getEx<DutiesTariffDto[]>(url, httpOptions).pipe(catchError(this.handleError<DutiesTariffDto[]>('getDutiesTariff')));
  }

  getDutiesTariffByPartInfoId(partInfoId: number) {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/dutiesTariff/${partInfoId}`;
    return this.getEx<DutiesTariffDto[]>(url, httpOptions).pipe(catchError(this.handleError<DutiesTariffDto[]>('getDutiesTariffByPartInfoId')));
  }

  deleteTariffBreakDown(tariffBreakDownId: number) {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/dutiesTariff/tariffBreakdown/${tariffBreakDownId}`;
    return this.deleteEx(url, httpOptions).pipe(catchError(this.handleError('deleteTariffBreakDown')));
  }

  saveDutiesTariff(dutiesTariffDto: DutiesTariffDto) {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/dutiesTariff`;
    return this.postEx<DutiesTariffDto, DutiesTariffDto>(url, httpOptions, dutiesTariffDto).pipe(catchError(this.handleError<DutiesTariffDto>('saveDutiesTariff')));
  }

  getTariffBreakDowns(tariffBreakDownRequest: TariffBreakDownRequest) {
    const httpOptions = this.createOptions('post');
    const url = `/api/master/Tariff/GetTariffBreakDowns`;
    return this.postMasterEx<TariffBreakDownResponse, TariffBreakDownRequest>(url, httpOptions, tariffBreakDownRequest).pipe(
      catchError(this.handleError<TariffBreakDownResponse>('getTariffBreakDowns'))
    );
  }

  deleteDutiesTariffByPartInfoId(partInfoId: number) {
    const httpOptions = this.createOptions('delete');
    const url = `/api/costing/dutiesTariff/${partInfoId}`;
    return this.deleteEx(url, httpOptions).pipe(catchError(this.handleError<DutiesTariffDto[]>('deleteDutiesTariffByPartInfoId')));
  }
}
