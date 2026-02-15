import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { CommodityMasterDto, TechnologyMasterDto } from '../models';
import { SnackBarErrorHandlerService } from './snackbar-error-handler.service';

@Injectable({ providedIn: 'root' })
export class CommodityService extends BaseHttpService {
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  getCommodityData(): Observable<CommodityMasterDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/CommodityMaster`;
    return this.getMasterEx<CommodityMasterDto[]>(url, httpOptions).pipe(catchError(this.handleError<CommodityMasterDto[]>('getCommodityData')));
  }

  // getSubCommodityData(): Observable<SubCommodityMasterDto[]> {
  //     const httpOptions = this.createOptions('get');
  //     const url = `/api/master/CommodityMaster/GetSubCommodity`;
  //     return this.getMasterEx<SubCommodityMasterDto[]>(url, httpOptions)
  //         .pipe(catchError(this.handleError<SubCommodityMasterDto[]>('getSubCommodityData')))
  // }

  getTechnologyData(): Observable<TechnologyMasterDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/CotsPriceBook/GetPartTechnology`;
    return this.getMasterEx<TechnologyMasterDto[]>(url, httpOptions).pipe(catchError(this.handleError<TechnologyMasterDto[]>('getTechnologyData')));
  }
}
