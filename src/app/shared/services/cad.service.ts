import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { MetaDataModel } from '../models/metaDataModel';
import { SnackBarErrorHandlerService } from './snackbar-error-handler.service';
import { DataExtraction } from '../models/data-extraction.model';

@Injectable({ providedIn: 'root' })
export class CadService extends BaseHttpService {
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  getMetaDataModel(formData: FormData): Observable<MetaDataModel> {
    const httpOptions = this.createOptionsForFormFile('post');
    const url = `/api/costing/CadExtractor`;
    return this.postEx<MetaDataModel, FormData>(url, httpOptions, formData).pipe(catchError(this.handleError<MetaDataModel>('getMetaDataModel')));
  }

  getCadExtractedValuesByPartInfoId(partInfoId: number): Observable<DataExtraction> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/CadExtractor/${partInfoId}/cadextraction`;
    return this.getEx<DataExtraction>(url, httpOptions).pipe(catchError(this.handleError<DataExtraction>('getCadExtractedValuesByPartInfoId')));
  }
}
