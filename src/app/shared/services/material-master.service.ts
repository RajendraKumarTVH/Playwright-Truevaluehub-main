import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import {
  CountryFormMatrixDto,
  MaterialCompositionDto,
  MaterialGroupDto,
  MaterialMarketDataDto,
  MaterialPriceHistoryDto,
  MaterialMasterDto,
  MaterialTypeDto,
  StockFormCategoriesDto,
  StockFormDto,
} from '../models';
import { MaterialMasterMarketDataDto } from '../models/material-master-marketdata.model';
import { SnackBarErrorHandlerService } from './snackbar-error-handler.service';
import { ToolingConfigService } from '../config/cost-tooling-config';
import { MaterialSearchResultDto } from '../models/material-search-result-dto';
import { HtsMasterService } from 'src/app/shared/services';

@Injectable({ providedIn: 'root' })
export class MaterialMasterService extends BaseHttpService {
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _toolConfig: ToolingConfigService,
    protected _apiCacheService: ApiCacheService,
    public htsMasterService: HtsMasterService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  getMaterialById(materialId: number): Observable<MaterialMasterDto> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/MaterialMaster/${materialId}`;
    return this.getMasterEx<MaterialMasterDto>(url, httpOptions).pipe(catchError(this.handleError<MaterialMasterDto>('getMaterialById')));
  }

  getMaterialGroups(): Observable<MaterialGroupDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/MaterialMaster/materialGroups`;
    return this.getMasterEx<MaterialGroupDto[]>(url, httpOptions).pipe(catchError(this.handleError<MaterialGroupDto[]>('getMaterialGroups')));
  }

  getMaterialTypes(): Observable<MaterialTypeDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/MaterialMaster/materialTypes`;
    return this.getMasterEx<MaterialTypeDto[]>(url, httpOptions).pipe(catchError(this.handleError<MaterialTypeDto[]>('getMaterialTypes')));
  }

  getStockForms(): Observable<StockFormDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/MaterialMaster/stockForms`;
    return this.getMasterEx<StockFormDto[]>(url, httpOptions).pipe(catchError(this.handleError<StockFormDto[]>('GetStockForms')));
  }

  getCountryFormMatrix(): Observable<CountryFormMatrixDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/MaterialMaster/countryFormMatrix`;
    return this.getMasterEx<CountryFormMatrixDto[]>(url, httpOptions).pipe(catchError(this.handleError<CountryFormMatrixDto[]>('getCountryFormMatrix')));
  }

  getStockFormCategories(): Observable<StockFormCategoriesDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/MaterialMaster/stockFormCategories`;
    return this.getMasterEx<StockFormCategoriesDto[]>(url, httpOptions).pipe(catchError(this.handleError<StockFormCategoriesDto[]>('getStockFormCategories')));
  }
  getmaterialsByMaterialTypeId(materialTypeId: number): Observable<MaterialMasterDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/MaterialMaster/materialType/${materialTypeId}/material`;
    return this.getMasterEx<MaterialMasterDto[]>(url, httpOptions).pipe(catchError(this.handleError<MaterialMasterDto[]>('getmaterialsByMaterialTypeId')));
  }

  getMaterialTypesByMaterialGroupId(materialGroupId: number): Observable<MaterialTypeDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/MaterialMaster/materialGroup/${materialGroupId}/materialTypes`;
    return this.getMasterEx<MaterialTypeDto[]>(url, httpOptions).pipe(catchError(this.handleError<MaterialTypeDto[]>('getMaterialTypesByMaterialGroupId')));
  }

  getMaterialByMaterialGroupId(materialGroupId: number): Observable<any[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/MaterialMaster/material/${materialGroupId}`;
    return this.getMasterEx<any[]>(url, httpOptions).pipe(catchError(this.handleError<any[]>('getMaterialByMaterialGroupId')));
  }

  getMaterialTypesByStockFormId(materialGroupId: number, stockForm: string): Observable<MaterialTypeDto[]> {
    const httpOptions = this.createOptions('get');
    stockForm = encodeURIComponent(stockForm);
    const url = `/api/master/MaterialMaster/materialGroup/${materialGroupId}/stockForm/${stockForm}/materialTypes`;
    return this.getMasterEx<MaterialTypeDto[]>(url, httpOptions).pipe(catchError(this.handleError<MaterialTypeDto[]>('getMaterialTypesByStockFormId')));
  }

  getMaterialMarketDataByCountryId(countryId: number, materialMasterId: number): Observable<MaterialMarketDataDto> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/MaterialMaster/country/${countryId}/material/${materialMasterId}`;
    return this.getMasterEx<MaterialMarketDataDto>(url, httpOptions).pipe(catchError(this.handleError<MaterialMarketDataDto>('getMaterialMarketDataByCountryId')));
  }
  getMaterialMarketDataByMarketQuarter(countryId: number, materialMasterId: number, marketMonth: string): Observable<MaterialMarketDataDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/MaterialMaster/country/${countryId}/material/${materialMasterId}/marketMonth/${marketMonth}`;
    return this.getMasterEx<MaterialMarketDataDto[]>(url, httpOptions).pipe(
      shareReplay({ bufferSize: 1, refCount: true }),
      catchError(this.handleError<MaterialMarketDataDto[]>('getMaterialMarketDataByMarketQuarter'))
    );
  }

  getMaterialMarketDataByCountryIdAndMaterialId(countryId: number, materialMasterId: number): Observable<MaterialPriceHistoryDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/MaterialMaster/country/${countryId}/material/${materialMasterId}/materialPrice`;
    return this.getMasterEx<MaterialPriceHistoryDto[]>(url, httpOptions).pipe(catchError(this.handleError<MaterialPriceHistoryDto[]>('getMaterialMarketDataByCountryId')));
  }
  getAvailableDataRangeByMaterialMasterIdCountryIdAsync(countryId: number, materialMarketId: number): Observable<string[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/MaterialMaster/country/${countryId}/market/${materialMarketId}`;
    return this.getMasterEx<string[]>(url, httpOptions).pipe(catchError(this.handleError<string[]>('getAvailableDataRangeByMaterialMasterIdCountryIdAsync')));
  }
  getMaterialMasterByMaterialMarketDataId(materialMarketDataId: number): Observable<MaterialMasterMarketDataDto> {
    const httpOptions = this.createOptionsWithHeader('get');
    const url = `/api/master/MaterialMaster/materialMarketData/${materialMarketDataId}`;
    return this.getMasterEtagEx<any>(url, httpOptions).pipe(
      shareReplay({ bufferSize: 1, refCount: true }),
      catchError(this.handleError<MaterialMasterMarketDataDto>('getMaterialMasterByMaterialMarketDataId'))
    );
  }

  getMaterialMarketDataListByCountryId(countryId: number): Observable<MaterialMarketDataDto[]> {
    const materialIds: string[] = this._toolConfig.getDefaultMaterialDescriptions();
    const httpOptions = this.createOptions('get');
    const url = `/api/master/MaterialMaster/country/${countryId}/materials?materialMasterIds=${materialIds}`;
    return this.getMasterEx<MaterialMarketDataDto[]>(url, httpOptions).pipe(catchError(this.handleError<MaterialMarketDataDto[]>('getMaterialMarketDataListByCountryId')));
  }

  getMaterialMarketDataListByMaterialMarketIds(materialMarketIds: string): Observable<MaterialMarketDataDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/MaterialMaster/materialmarketids?materialMarketIds=${materialMarketIds}`;
    return this.getMasterEx<MaterialMarketDataDto[]>(url, httpOptions).pipe(catchError(this.handleError<MaterialMarketDataDto[]>('getMaterialMarketDataListByMaterialMarketIds')));
  }

  getmaterialsByMaterialTypeName(countryId: number, materialTypeName: string, materialdescription: string): Observable<MaterialMasterDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/MaterialMaster/country/${countryId}/materialType/${materialTypeName}/materialdescription/${materialdescription}`;
    return this.getMasterEx<MaterialMasterDto[]>(url, httpOptions).pipe(catchError(this.handleError<MaterialMasterDto[]>('getmaterialsByMaterialTypeName')));
  }

  searchMaterialByCountryId(countryId: number, searchText: string): Observable<MaterialMasterDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/MaterialMaster/country/${countryId}/searchText/${searchText}`;
    return this.getMasterEx<MaterialMasterDto[]>(url, httpOptions).pipe(catchError(this.handleError<MaterialMasterDto[]>('getMaterialMarketDataByCountryId')));
  }

  getMaterialDataByDescription(materialDescription: string): Observable<MaterialSearchResultDto[]> {
    const httpOptions = this.createOptions('get');
    const description = encodeURIComponent(materialDescription);
    const url = `/api/master/MaterialMaster/materialDataByDescriptions`;
    return this.postMasterEx<MaterialSearchResultDto[], string[]>(url, httpOptions, [description]).pipe(
      shareReplay({ bufferSize: 1, refCount: true }),
      catchError(this.handleError<MaterialSearchResultDto[]>('materialDescription'))
    );
  }

  getMaterialDataByMaterialMasterIds(materialMasterIds: number[]): Observable<MaterialSearchResultDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/MaterialMaster/getMaterialsDataByMaterialMasterIds`;
    return this.postMasterEx<MaterialSearchResultDto[], number[]>(url, httpOptions, materialMasterIds).pipe(catchError(this.handleError<MaterialSearchResultDto[]>('materialDescription')));
  }

  getMaterialCompositionByMaterialId(materialId: number): Observable<MaterialCompositionDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/MaterialMaster/materialComposition/${materialId}`;
    return this.getMasterEx<MaterialCompositionDto[]>(url, httpOptions).pipe(catchError(this.handleError<MaterialCompositionDto[]>('getMaterialCompositionByMaterialId')));
  }
}
