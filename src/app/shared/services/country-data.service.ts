import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { CountryDataMasterDto } from '../models';
import { SnackBarErrorHandlerService } from './snackbar-error-handler.service';

@Injectable({ providedIn: 'root' })
export class CountryDataService extends BaseHttpService {
  countryList$ = new BehaviorSubject<CountryDataMasterDto[]>([]);
  subscription: Subscription[] = [];

  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  getCountryData(): Observable<CountryDataMasterDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/CountryData`;
    return this.getMasterEx<CountryDataMasterDto[]>(url, httpOptions).pipe(catchError(this.handleError<CountryDataMasterDto[]>('getCountryData')));
  }

  loadCountryData() {
    this.subscription['CountryDataService:loadCountryData'] = this.getCountryData().subscribe((result: CountryDataMasterDto[]) => {
      if (result?.length > 0) {
        this.countryList$.next(result);
      }
      this.subscription['CountryDataService:loadCountryData'].unsubscribe();
    });
  }
}
