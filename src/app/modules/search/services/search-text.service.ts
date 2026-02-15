import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { SnackBarErrorHandlerService } from 'src/app/shared/services/snackbar-error-handler.service';
import { searchEndpoints } from '../search.endpoints';

@Injectable({ providedIn: 'root' })
export class SearchTextService extends BaseHttpService {
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  getSearchDataByText(text: string) {
    const httpOptions = this.createOptions('get');
    const url = searchEndpoints.getSearchDataByText('/api', text);
    return this.getEx<number[]>(url, httpOptions).pipe(catchError(this.handleError<any>('getSearchDataByText')));
  }
}
