import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { SnackBarErrorHandlerService } from './snackbar-error-handler.service';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NestingAlgo } from '../models/nesting-algo.model';

@Injectable({ providedIn: 'root' })
export class NestingAlgoService extends BaseHttpService {
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  search(formData: NestingAlgo): Observable<any> {
    const httpOptions = this.createOptionsForFormFile('post');
    const url = `/api/costing/nestingalgo/getdetails`;
    return this.postEx<any, NestingAlgo>(url, httpOptions, formData).pipe(catchError(this.handleError<any>('getfile')));
  }

  searchMultiple(formData: NestingAlgo): Observable<any> {
    const httpOptions = this.createOptionsForFormFile('post');
    const url = `/api/costing/nestingalgo/getdetailsForMultipleParts`;
    return this.postEx<any, NestingAlgo>(url, httpOptions, formData).pipe(catchError(this.handleError<any>('getfile')));
  }
}
