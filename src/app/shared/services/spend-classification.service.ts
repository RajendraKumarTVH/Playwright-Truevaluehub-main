import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { AppConfigurationService } from './app-configuration.service';
import { BaseHttpService } from './base-http.service';
import { BlockUiService } from './block-ui.service';
import { SnackBarErrorHandlerService } from './snackbar-error-handler.service';
import { ApiCacheService } from './api-cache.service';
import { SpendClassificationDto } from '../models/spend-classification.model';

@Injectable({
  providedIn: 'root',
})
export class SpendClassificationService extends BaseHttpService {
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  getSpendClassificationByPartInfoId(partInfoId: number) {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/SpendClassification/${partInfoId}`;
    return this.getEx<SpendClassificationDto[]>(url, httpOptions).pipe(catchError(this.handleError<SpendClassificationDto[]>('getSpendClassificationByPartInfoId')));
  }

  saveSpendClassification(spendClassificationDto: SpendClassificationDto) {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/SpendClassification`;
    return this.postEx<SpendClassificationDto, SpendClassificationDto>(url, httpOptions, spendClassificationDto).pipe(catchError(this.handleError<SpendClassificationDto>('saveSpendClassification')));
  }
}
