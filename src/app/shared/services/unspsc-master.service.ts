import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { SnackBarErrorHandlerService } from './snackbar-error-handler.service';
import { UnspscMasterDto } from '../models/unspsc-master.model';

@Injectable({
  providedIn: 'root',
})
export class UnspscMasterService extends BaseHttpService {
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  getAllUnspscMasterData(): Observable<UnspscMasterDto> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/UnspscMaster/GetUnspscMasterData`;
    return this.getMasterEx<UnspscMasterDto>(url, httpOptions).pipe(catchError(this.handleError<UnspscMasterDto>('getAllUnspscMasterData')));
  }

  getUnspscMasterDataByCriteria(commodityId, materialTypeId, processId): Observable<UnspscMasterDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/UnspscMaster/GetUnspscMasterDataByCriteria/${commodityId}/${materialTypeId}/${processId}`;
    return this.getMasterEx<UnspscMasterDto[]>(url, httpOptions).pipe(catchError(this.handleError<UnspscMasterDto[]>('getUnspscMasterDataByCriteria')));
  }
}
