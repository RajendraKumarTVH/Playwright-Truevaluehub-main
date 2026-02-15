import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { ProcessMasterDto } from '../models';
import { SnackBarErrorHandlerService } from './snackbar-error-handler.service';
import { WiringHarness } from '../models/wiring-harness.model';

@Injectable({ providedIn: 'root' })
export class ProcessMasterService extends BaseHttpService {
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  getAllProcessMasterData(): Observable<ProcessMasterDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/ProcessMaster`;
    return this.getMasterEx<ProcessMasterDto[]>(url, httpOptions).pipe(catchError(this.handleError<ProcessMasterDto[]>('getAllProcessMasterData')));
  }

  getProcessDetailsByCommodityId(commodityId: number): Observable<ProcessMasterDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/ProcessMaster/commodity/${commodityId}`;
    return this.getMasterEx<ProcessMasterDto[]>(url, httpOptions).pipe(catchError(this.handleError<ProcessMasterDto[]>('getProcessDetailsByCommodityId')));
  }

  getWiringHarnessLookup(): Observable<WiringHarness[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/ProcessMaster/wiringHarnessCycletime`;
    return this.getMasterEx<WiringHarness[]>(url, httpOptions).pipe(catchError(this.handleError<any>('getWiringHarnessLookup')));
  }
}
