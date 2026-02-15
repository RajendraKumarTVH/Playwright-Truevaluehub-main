import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { SnackBarErrorHandlerService } from './snackbar-error-handler.service';
import { PCBAResultDto } from '../models/pcb-master..model';

@Injectable({ providedIn: 'root' })
export class PCBAService extends BaseHttpService {
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }
  getMaterialMasterByCountryId(countryId: number): Observable<any[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/PrintedCircuitBoard/materialMaster/${countryId}`;
    return this.getMasterEx<any[]>(url, httpOptions).pipe(catchError(this.handleError<any[]>('getMaterialMasterByCountryId')));
  }

  getMaterialMasterByCountryIdMpnAsync(mpnNos: any[]): Observable<PCBAResultDto> {
    const httpOptions = this.createOptions('post');
    const url = `/api/master/PrintedCircuitBoard/mpndataByName`;
    return this.postMasterEx<PCBAResultDto, any[]>(url, httpOptions, mpnNos).pipe(catchError(this.handleError<PCBAResultDto>('getMaterialMasterByCountryIdMpnAsync')));
  }
}
