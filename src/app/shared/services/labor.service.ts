import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { LaborRateMasterDto } from '../models';
import { SnackBarErrorHandlerService } from './snackbar-error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class LaborService extends BaseHttpService {
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  getLaborRates(): Observable<LaborRateMasterDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/laborRate`;
    return this.getMasterEx<LaborRateMasterDto[]>(url, httpOptions).pipe(catchError(this.handleError<LaborRateMasterDto[]>('getLaborRates')));
  }

  // getLaborRatesByCountry(countryId: number, regionId?: number, marketQuarter: string = localStorage.getItem("marketQuarter")): Observable<LaborRateMasterDto[]> {
  getLaborRatesByCountry(countryId: number, marketMonth: string, regionId?: number): Observable<LaborRateMasterDto[]> {
    if (!countryId) {
      return of(new Array<LaborRateMasterDto>());
    }
    const region = regionId ?? 0;
    const httpOptions = this.createOptions('get');
    const url = `/api/master/laborRate/country/${countryId}/month/${marketMonth}/region/${region}`;
    return this.getMasterEx<LaborRateMasterDto[]>(url, httpOptions).pipe(catchError(this.handleError<LaborRateMasterDto[]>('getLaborRatesByCountry')));
  }

  // getLaborRatesByCountryAndQuarter(countryId: number, labourTypeId: number, marketQuarter: string): Observable<LaborRateMasterDto[]> {
  //     const httpOptions = this.createOptions('get');
  //     const url = `/api/master/laborRate/country/${countryId}/labourType/${labourTypeId}/${marketQuarter}`;
  //     return this.getMasterEx<LaborRateMasterDto[]>(url, httpOptions)
  //         .pipe(catchError(this.handleError<LaborRateMasterDto[]>('getLaborRatesByCountryAndQuarter')))
  // }
  getLaborCountByCountry(countryId: number): Observable<any[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/MedbMaster/laborCountBasedOnMachineType?countryId=` + countryId;
    return this.getMasterEx<any[]>(url, httpOptions).pipe(catchError(this.handleError<any[]>('getLaborRatesByCountry')));
  }
}
