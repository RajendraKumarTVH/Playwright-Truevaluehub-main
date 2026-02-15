import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BopCostToolingDto, CostToolingDto, ToolingMaterialInfoDto, ToolingProcessInfoDto, ToolingRefLookup } from '../models/tooling.model';

import { AppConfigurationService } from './app-configuration.service';
import { BaseHttpService } from './base-http.service';
import { BlockUiService } from './block-ui.service';
import { SnackBarErrorHandlerService } from './snackbar-error-handler.service';
import { ApiCacheService } from './api-cache.service';

@Injectable({
  providedIn: 'root',
})
export class CostToolingService extends BaseHttpService {
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  getCostTooling(): Observable<CostToolingDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/CostTooling`;
    return this.getEx<CostToolingDto[]>(url, httpOptions).pipe(catchError(this.handleError<CostToolingDto[]>('getCostTooling')));
  }

  getCostToolingByPartId(partInfoId: number): Observable<CostToolingDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/CostTooling/${partInfoId}`;
    return this.getEx<CostToolingDto[]>(url, httpOptions).pipe(catchError(this.handleError<CostToolingDto[]>('getCostToolingByPartId')));
  }

  deleteCostToolingById(toolingId: number) {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/CostTooling/DeleteTooling?toolingId=${toolingId}`;
    return this.deleteEx<boolean>(url, httpOptions).pipe(catchError(this.handleError<CostToolingDto>('deleteCostToolingById')));
  }

  saveCostTooling(costToolingDto: CostToolingDto): Observable<CostToolingDto> {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/CostTooling`;
    return this.postEx<CostToolingDto, CostToolingDto>(url, httpOptions, costToolingDto).pipe(catchError(this.handleError<CostToolingDto>('saveCostTooling')));
  }

  saveCostToolingMaterial(toolingMaterialInfoDto: ToolingMaterialInfoDto): Observable<ToolingMaterialInfoDto> {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/CostTooling/CreateOrUpdateToolingMaterialInfo`;
    return this.postEx<ToolingMaterialInfoDto, ToolingMaterialInfoDto>(url, httpOptions, toolingMaterialInfoDto).pipe(catchError(this.handleError<ToolingMaterialInfoDto>('saveCostToolingMaterial')));
  }

  bulkUpdateOrCreateToolingMaterialInfo(toolingMaterialInfoDto: ToolingMaterialInfoDto[]): Observable<ToolingMaterialInfoDto[]> {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/CostTooling/BulkCreateOrUpdateToolingMaterialInfo`;
    return this.postEx<ToolingMaterialInfoDto[], ToolingMaterialInfoDto[]>(url, httpOptions, toolingMaterialInfoDto).pipe(
      catchError(this.handleError<ToolingMaterialInfoDto[]>('bulkUpdateOrCreateToolingMaterialInfo'))
    );
  }

  deleteCostToolingMaterialById(materialId: number) {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/CostTooling/DeleteToolingMaterial?toolingMaterialId=${materialId}`;
    return this.deleteEx<boolean>(url, httpOptions).pipe(catchError(this.handleError<CostToolingDto>('deleteCostToolingMaterialById')));
  }

  saveCostToolingBOP(toolingBopInfoDto: BopCostToolingDto): Observable<BopCostToolingDto> {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/CostTooling/CreateOrUpdateBopCostTooling`;
    return this.postEx<BopCostToolingDto, BopCostToolingDto>(url, httpOptions, toolingBopInfoDto).pipe(catchError(this.handleError<BopCostToolingDto>('saveCostToolingBOP')));
  }

  bulkUpdateOrCreateBOPInfo(toolingBopInfoDto: BopCostToolingDto[]): Observable<BopCostToolingDto[]> {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/CostTooling/BulkCreateOrUpdateBopCostTooling`;
    return this.postEx<BopCostToolingDto[], BopCostToolingDto[]>(url, httpOptions, toolingBopInfoDto).pipe(catchError(this.handleError<BopCostToolingDto[]>('bulkUpdateOrCreateBOPInfo')));
  }

  saveCostToolingProcess(toolingProcessInfoDto: ToolingProcessInfoDto): Observable<ToolingProcessInfoDto> {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/CostTooling/CreateOrUpdateToolingProcessInfo`;
    return this.postEx<ToolingProcessInfoDto, ToolingProcessInfoDto>(url, httpOptions, toolingProcessInfoDto).pipe(catchError(this.handleError<ToolingProcessInfoDto>('saveCostToolingProcess')));
  }

  bulkUpdateOrCreateToolingProcessInfo(toolingProcessInfoDto: ToolingProcessInfoDto[]): Observable<ToolingProcessInfoDto[]> {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/CostTooling/BulkCreateOrUpdateToolingProcessInfo`;
    return this.postEx<ToolingProcessInfoDto[], ToolingProcessInfoDto[]>(url, httpOptions, toolingProcessInfoDto).pipe(
      catchError(this.handleError<ToolingProcessInfoDto[]>('bulkUpdateOrCreateToolingProcessInfo'))
    );
  }

  deleteCostToolingProcessById(processInfoId: number) {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/CostTooling/DeleteToolingProcess?toolingProcessId=${processInfoId}`;
    return this.deleteEx<boolean>(url, httpOptions).pipe(catchError(this.handleError<CostToolingDto>('deleteCostToolingProcessById')));
  }

  deleteCostToolingBOPById(bopId: number) {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/CostTooling/DeleteBopCostTooling?bopCostId=${bopId}`;
    return this.deleteEx<boolean>(url, httpOptions).pipe(catchError(this.handleError<CostToolingDto>('deleteCostToolingBOPById')));
  }

  getToolingLookup(): Observable<ToolingRefLookup[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/ProcessMaster/toolingreflookup`;
    return this.getMasterEx<ToolingRefLookup[]>(url, httpOptions).pipe(catchError(this.handleError<any>('getToolingLookup')));
  }

  bulkUpdateTooling(costToolingDto: CostToolingDto): Observable<CostToolingDto> {
    const httpOptions = this.createOptions('put');
    const url = `/api/costing/CostTooling/BulkUpdateTooling`;
    return this.putEx<CostToolingDto, CostToolingDto>(url, httpOptions, costToolingDto).pipe(catchError(this.handleError<CostToolingDto>('bulkUpdateTooling')));
  }

  bulkUpdateAsync(costToolingDto: CostToolingDto[]): Observable<CostToolingDto[]> {
    const httpOptions = this.createOptions('put');
    const url = `/api/costing/CostTooling/BulkUpdateAsync`;
    return this.putEx<CostToolingDto[], CostToolingDto[]>(url, httpOptions, costToolingDto).pipe(catchError(this.handleError<CostToolingDto[]>('bulkUpdateAsync')));
  }

  updateToolingCostPerPart(costToolingDto: CostToolingDto): Observable<CostToolingDto> {
    const httpOptions = this.createOptions('put');
    const url = `/api/costing/CostTooling/UpdateToolingCostPerPart`;
    return this.putEx<CostToolingDto, CostToolingDto>(url, httpOptions, costToolingDto).pipe(catchError(this.handleError<CostToolingDto>('updateToolingCostPerPart')));
  }

  bulkUpdateToolingCostPerPart(costToolingDto: CostToolingDto[]): Observable<CostToolingDto[]> {
    const httpOptions = this.createOptions('put');
    const url = `/api/costing/CostTooling/BulkUpdateToolingCostPerPart`;
    return this.putEx<CostToolingDto[], CostToolingDto[]>(url, httpOptions, costToolingDto).pipe(catchError(this.handleError<CostToolingDto[]>('bulkUpdateToolingCostPerPart')));
  }
}
