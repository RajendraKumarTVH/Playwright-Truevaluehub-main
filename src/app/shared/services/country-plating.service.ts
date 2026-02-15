import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { CountryPlatingMasterDto } from '../models';
import { SnackBarErrorHandlerService } from './snackbar-error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class CountryPlatingService extends BaseHttpService {
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  getCountryPlatingData(): Observable<CountryPlatingMasterDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/CountryPlating`;
    return this.getMasterEx<CountryPlatingMasterDto[]>(url, httpOptions).pipe(catchError(this.handleError<CountryPlatingMasterDto[]>('getCountryPlatingData')));
  }
}
