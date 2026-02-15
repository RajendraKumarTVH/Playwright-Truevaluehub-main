import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { CotsInfoDto, MoveAssembliesInfoDto } from '../models';
import { SnackBarErrorHandlerService } from './snackbar-error-handler.service';
// import { MoveAssembliesInfo } from 'src/app/modules/_actions/cots-info.action';

@Injectable({ providedIn: 'root' })
export class CotsInfoService extends BaseHttpService {
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  getCotsInfoById(cotsInfoId: number): Observable<CotsInfoDto> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/cotsInfo?cotsInfoId=${cotsInfoId}`;
    return this.getEx<CotsInfoDto>(url, httpOptions).pipe(catchError(this.handleError<CotsInfoDto>('getCotsInfoById')));
  }

  getCotsInfoByPartInfoId(partInfoId: number): Observable<CotsInfoDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/cotsInfo/partInfo/${partInfoId}/cotsInfo`;
    return this.getEx<CotsInfoDto[]>(url, httpOptions).pipe(catchError(this.handleError<CotsInfoDto[]>('getCotsInfoByPartInfoId')));
  }

  saveCotsInfo(cotsInfo: CotsInfoDto): Observable<CotsInfoDto> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/cotsInfo/create`;
    return this.postEx<CotsInfoDto, CotsInfoDto>(url, httpOptions, cotsInfo).pipe(catchError(this.handleError<CotsInfoDto>('saveCotsInfo')));
  }

  updateCotsInfo(cotsInfo: CotsInfoDto): Observable<CotsInfoDto> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/cotsInfo/${cotsInfo.cotsInfoId}/update`;
    return this.putEx<CotsInfoDto, CotsInfoDto>(url, httpOptions, cotsInfo).pipe(catchError(this.handleError<CotsInfoDto>('updateCotsInfo')));
  }

  deleteCotsInfo(cotsInfoId: number) {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/cotsInfo/delete?cotsInfoId=${cotsInfoId}`;
    return this.deleteEx(url, httpOptions).pipe(catchError(this.handleError<CotsInfoDto>('deleteCotsInfo')));
  }

  bulkUpdateCotsInfo(cotsInfo: CotsInfoDto[]): Observable<CotsInfoDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/cotsInfo/BulkPurchasedUpdate`;
    return this.putEx<CotsInfoDto[], CotsInfoDto[]>(url, httpOptions, cotsInfo).pipe(catchError(this.handleError<CotsInfoDto[]>('bulkUpdateCotsInfo')));
  }

  moveAssemblies(payload: MoveAssembliesInfoDto): Observable<CotsInfoDto[]> {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/cotsInfo/move-assemblies/${payload.moveType}/${payload.projectInfoId}/${payload.partInfoId}`;
    return this.postEx<CotsInfoDto[], number[]>(url, httpOptions, payload.bomIds).pipe(catchError(this.handleError<CotsInfoDto[]>('moveAssemblies')));
  }
}
