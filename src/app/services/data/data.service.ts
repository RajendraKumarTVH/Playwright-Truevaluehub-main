import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiCacheService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { AppConfigurationService } from 'src/app/shared/services/app-configuration.service';
import { SnackBarErrorHandlerService } from 'src/app/shared/services/snackbar-error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class DataService extends BaseHttpService {
  // private readonly baseUrl = environment.baseUrl;
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  getMaterialGroup(): Observable<any> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/Material/GetMaterialGroup`;
    return this.getEx<any>(url, httpOptions).pipe(catchError(this.handleError<any>('getMaterialGroup')));
  }
}
