import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { ProcessInfoDto } from '../models';
import { SnackBarErrorHandlerService } from './snackbar-error-handler.service';

@Injectable({ providedIn: 'root' })
export class ProcessInfoService extends BaseHttpService {
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  getProcessInfoByPartInfoId(partInfoId: number): Observable<ProcessInfoDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/processInfo/partinfo/${partInfoId}`;
    return this.getEx<ProcessInfoDto[]>(url, httpOptions).pipe(catchError(this.handleError<ProcessInfoDto[]>('getProcessInfoByPartInfoId')));
  }

  saveProcessInfoDetails(processInfo: ProcessInfoDto): Observable<ProcessInfoDto> {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/processInfo/create`;
    return this.postEx<ProcessInfoDto, ProcessInfoDto>(url, httpOptions, processInfo).pipe(catchError(this.handleError<ProcessInfoDto>('saveProcessInfoDetails')));
  }

  updateProcessInfo(processInfo: ProcessInfoDto): Observable<ProcessInfoDto> {
    const httpOptions = this.createOptions('put');
    const url = `/api/costing/processInfo/${processInfo.processInfoId}/update`;
    return this.putEx<ProcessInfoDto, ProcessInfoDto>(url, httpOptions, processInfo).pipe(catchError(this.handleError<ProcessInfoDto>('updateProcessInfo')));
  }

  deleteProcessInfo(processInfoId: number) {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/processInfo/delete?processInfoId=${processInfoId}`;
    return this.deleteEx(url, httpOptions).pipe(catchError(this.handleError<ProcessInfoDto>('deleteProcessInfo')));
  }

  deleteAllProcessInfo(partInfoId: number) {
    const httpOptions = this.createOptions('delete');
    const url = `/api/costing/processInfo/deleteAll?partInfoId=${partInfoId}`;
    return this.deleteEx(url, httpOptions).pipe(catchError(this.handleError<ProcessInfoDto[]>('deleteAllProcessInfo')));
  }

  bulkUpdateOrCreateProcessInfo(processInfo: ProcessInfoDto[]): Observable<ProcessInfoDto[]> {
    const httpOptions = this.createOptions('put');
    const url = `/api/costing/processInfo/BulkUpdateAsync`;
    return this.putEx<ProcessInfoDto[], ProcessInfoDto[]>(url, httpOptions, processInfo).pipe(catchError(this.handleError<ProcessInfoDto[]>('bulkUpdateOrCreateProcessInfo')));
  }

  updateSortOrder(partInfoId: number, sortInfo: { id: number; sortOrder: number }[]): Observable<boolean> {
    const httpOptions = this.createOptions('put');
    const url = `/api/costing/processInfo/updateSortOrder/${partInfoId}`;
    return this.putEx<boolean, { id: number; sortOrder: number }[]>(url, httpOptions, sortInfo).pipe(catchError(this.handleError<boolean>('updateSortOrder')));
  }
}
