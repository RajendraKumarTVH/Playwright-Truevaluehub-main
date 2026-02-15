import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { SnackBarErrorHandlerService } from './snackbar-error-handler.service';
import { HtsMasterDto, HtsSubHeading1Dto, HtsSubHeading2Dto } from '../models/hts-master.model';
@Injectable({
  providedIn: 'root',
})
export class HtsMasterService extends BaseHttpService {
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  getAllHtsMasterData(): Observable<HtsMasterDto> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/HtsMaster/GetHtsMasterData`;
    return this.getMasterEx<HtsMasterDto>(url, httpOptions).pipe(catchError(this.handleError<HtsMasterDto>('getAllHtsMasterData')));
  }

  getMasterData(apiUrl: string, skip: number, limit: number, search: string = ''): Observable<{ data: any[]; totalRecords: number }> {
    const httpOptions = this.createOptions('get');
    const params = new HttpParams().set('skip', skip.toString()).set('limit', limit.toString()).set('search', search);
    this._apiCacheService.removeCache(apiUrl);
    return this.getMasterEx<{ data: any[]; totalRecords: number }>(apiUrl, { ...httpOptions, params }).pipe(catchError(this.handleError<{ data: any[]; totalRecords: number }>('getHtsMasterData')));
  }

  getHtsMasterDataByCriteria(sectionId, chapterId, headingId, subHeadingId): Observable<HtsMasterDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/HtsMaster/GetHtsMasterDataByCriteria/${sectionId}/${chapterId}/${headingId}/${subHeadingId}`;
    return this.getMasterEx<HtsMasterDto[]>(url, httpOptions).pipe(catchError(this.handleError<HtsMasterDto[]>('getHtsMasterDataByCriteria')));
  }

  getHtsSubHeading1BySubHeadingId(subHeadingId): Observable<HtsSubHeading1Dto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/HtsMaster/getHtsSubHeading1BySubHeadingId/${subHeadingId}`;
    return this.getMasterEx<HtsSubHeading1Dto[]>(url, httpOptions).pipe(catchError(this.handleError<HtsSubHeading1Dto[]>('getHtsSubHeading1BySubHeadingId')));
  }

  getHtsSubHeading2BySubHeading1Id(subHeading1Id): Observable<HtsSubHeading2Dto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/HtsMaster/getHtsSubHeading2BySubHeading1Id/${subHeading1Id}`;
    return this.getMasterEx<HtsSubHeading2Dto[]>(url, httpOptions).pipe(catchError(this.handleError<HtsSubHeading2Dto[]>('getHtsSubHeading2BySubHeading1Id')));
  }
}
