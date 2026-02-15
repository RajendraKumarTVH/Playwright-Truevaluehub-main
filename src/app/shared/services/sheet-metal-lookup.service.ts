import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  HandlingTime,
  LaserCuttingTime,
  StrokeRate,
  StrokeRateManual,
  ToolLoadingTime,
  StampingMetrialLookUp,
  ConnectorAssemblyManufacturingLookUp,
  PlasmaCutting,
} from '../models/sheet-metal-lookup.model';
import { AppConfigurationService } from './app-configuration.service';
import { BaseHttpService } from './base-http.service';
import { BlockUiService } from './block-ui.service';
import { SnackBarErrorHandlerService } from './snackbar-error-handler.service';
import { ApiCacheService } from './api-cache.service';

@Injectable({
  providedIn: 'root',
})
export class SheetMetalLookupService extends BaseHttpService {
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  getStrokeRate(tonnage: number = 0): Observable<StrokeRate[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/sheetmetallookup/GetStrokeRate?tonnage=${tonnage}`;
    return this.getMasterEx<StrokeRate[]>(url, httpOptions).pipe(catchError(this.handleError<StrokeRate[]>('getStrokeRate')));
  }

  getStrokeRateManual(tonnage: number = 0, thickness: number = 0, partComplexity: string = ''): Observable<StrokeRateManual[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/sheetmetallookup/GetStrokeRateManual?tonnage=${tonnage}&thickness=${thickness}&partComplexity=${partComplexity}`;
    return this.getMasterEx<StrokeRateManual[]>(url, httpOptions).pipe(catchError(this.handleError<any>('getStrokeRateManual')));
  }

  getHandlingTime(weight: number = 0): Observable<HandlingTime[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/sheetmetallookup/GetHandlingTimeAssumptions?weight=${weight}`;
    return this.getMasterEx<HandlingTime[]>(url, httpOptions).pipe(catchError(this.handleError<HandlingTime[]>('getHandlingTime')));
  }

  getToolLoadingTime(tonnage: number = 0, length: number = 0): Observable<ToolLoadingTime[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/sheetmetallookup/GetToolLoadingTime?tonnage=${tonnage}&length=${length}`;
    return this.getMasterEx<ToolLoadingTime[]>(url, httpOptions).pipe(catchError(this.handleError<ToolLoadingTime[]>('getToolLoadingTime')));
  }

  getLaserCuttingTime(thickness: number = 0, power: number = 0, materialType: string = ''): Observable<LaserCuttingTime[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/sheetmetallookup/GetLaserCuttingLookup?materialType=${materialType}&thickness=${thickness}&power=${power}`;
    return this.getMasterEx<LaserCuttingTime[]>(url, httpOptions).pipe(catchError(this.handleError<any>('getLaserCuttingTime')));
  }

  getStampingMaterialLookUpAll(): Observable<StampingMetrialLookUp[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/sheetmetallookup/GetStampingMaterialLookUpAll`;
    return this.getMasterEx<StampingMetrialLookUp[]>(url, httpOptions).pipe(catchError(this.handleError<any>('getStampingMaterialLookUpAll')));
  }

  getConnectorAssemblyManufacturingLookUpAll(): Observable<ConnectorAssemblyManufacturingLookUp[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/sheetmetallookup/GetConnectorAssemblyManufacturingLookUpAll`;
    return this.getMasterEx<ConnectorAssemblyManufacturingLookUp[]>(url, httpOptions).pipe(catchError(this.handleError<any>('getConnectorAssemblyManufacturingLookUpAll')));
  }

  getPlasmaCuttingTime(thickness: number = 0, materialType: string = null): Observable<PlasmaCutting[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/SheetMetalLookup/plasmaCuttingLookup?materialType=${materialType}&thickness=${thickness}`;
    return this.getMasterEx<PlasmaCutting[]>(url, httpOptions).pipe(catchError(this.handleError<any>('getPlasmaCuttingTime')));
  }
}
