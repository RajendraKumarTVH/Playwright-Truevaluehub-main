import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { MaterialInfoDto } from '../models';
import { SnackBarErrorHandlerService } from './snackbar-error-handler.service';

@Injectable({ providedIn: 'root' })
export class MaterialInfoService extends BaseHttpService {
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  // getMaterialInfoById(materialInfoId: number): Observable<MaterialInfoDto> {
  //     const httpOptions = this.createOptions('get');
  //     const url = `/api/costing/MaterialInfo?MaterialInfoId=${materialInfoId}`;
  //     return this.getEx<MaterialInfoDto>(url, httpOptions)
  //         .pipe(catchError(this.handleError<MaterialInfoDto>('getMaterialInfoById')))
  // }

  getMaterialInfosByPartInfoId(partInfoId: number): Observable<MaterialInfoDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/MaterialInfo/${partInfoId}/materialdetails`;
    return this.getEx<MaterialInfoDto[]>(url, httpOptions).pipe(catchError(this.handleError<MaterialInfoDto[]>('getMaterialInfosByPartInfoId')));
  }

  saveMaterialInfo(materialInfo: MaterialInfoDto): Observable<MaterialInfoDto> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/MaterialInfo/create`;
    return this.postEx<MaterialInfoDto, MaterialInfoDto>(url, httpOptions, materialInfo).pipe(catchError(this.handleError<MaterialInfoDto>('saveMaterialInfo')));
  }

  updateMaterialInfo(materialInfo: MaterialInfoDto): Observable<MaterialInfoDto> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/MaterialInfo/${materialInfo.materialInfoId}/update`;
    return this.putEx<MaterialInfoDto, MaterialInfoDto>(url, httpOptions, materialInfo).pipe(catchError(this.handleError<MaterialInfoDto>('updateMaterialInfo')));
  }

  deleteMaterialInfo(materialInfoId: number) {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/MaterialInfo/delete?materialInfoId=${materialInfoId}`;
    return this.deleteEx<boolean>(url, httpOptions).pipe(catchError(this.handleError<MaterialInfoDto>('deleteMaterialInfo')));
  }

  bulkUpdateOrCreateMaterialInfo(materialInfo: MaterialInfoDto[]): Observable<MaterialInfoDto[]> {
    const httpOptions = this.createOptions('put');
    const url = `/api/costing/MaterialInfo/BulkUpdate`;
    return this.putEx<MaterialInfoDto[], MaterialInfoDto[]>(url, httpOptions, materialInfo).pipe(catchError(this.handleError<MaterialInfoDto[]>('bulkUpdateOrCreateMaterialInfo')));
  }
  getNetWeightByPartInfoId(partInfoId: number): Observable<number> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/MaterialInfo/partInfo/${partInfoId}`;
    return this.getEx<number>(url, httpOptions).pipe(catchError(this.handleError<number>('getNetWeightByPartInfoId')));
  }
}
