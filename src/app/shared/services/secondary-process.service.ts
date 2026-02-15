import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SecondaryProcessPowderMachineDto } from 'src/app/shared/models';
import { SecondaryProcessDto } from 'src/app/shared/models/secondary-process.model';
import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { SnackBarErrorHandlerService } from 'src/app/shared/services/snackbar-error-handler.service';

@Injectable({ providedIn: 'root' })
export class SecondaryProcessService extends BaseHttpService {
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  getSecondaryProcessDetailsByPartId(partInfoId: number): Observable<SecondaryProcessDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/SecondaryProcess/part/${partInfoId}/SecondaryProcess`;
    return this.getEx<SecondaryProcessDto[]>(url, httpOptions).pipe(catchError(this.handleError<SecondaryProcessDto[]>('getSecondaryProcessDetailsByPartId')));
  }

  // getSecondaryProcessDetailsById(secondaryProcessId: number): Observable<SecondaryProcessDto> {
  //     const httpOptions = this.createOptions('get');
  //     const url = `/api/costing/SecondaryProcess/${secondaryProcessId}`;
  //     return this.getEx<SecondaryProcessDto>(url, httpOptions)
  //         .pipe(catchError(this.handleError<SecondaryProcessDto>('getSecondaryProcessDetailsById')))
  // }

  getSecProcMachineDescription(): Observable<string[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/SecondaryProcessMaster/GetSecProcMachineDescription`;
    return this.getMasterEx<string[]>(url, httpOptions).pipe(catchError(this.handleError<string[]>('getSecProcMachineDescription')));
  }

  getSecProcShotBlastingMachineDescription(): Observable<string[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/SecondaryProcessMaster/GetSecProcShotBlastingMachineDescription`;
    return this.getMasterEx<string[]>(url, httpOptions).pipe(catchError(this.handleError<string[]>('getSecProcShotBlastingMachineDescription')));
  }

  getSecProcDeburringMachineDescription(): Observable<string[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/SecondaryProcessMaster/getSecProcDeburringMachineDescription`;
    return this.getMasterEx<string[]>(url, httpOptions).pipe(catchError(this.handleError<string[]>('getSecProcDeburringMachineDescription')));
  }

  getPowderCoatingStockForm(): Observable<string[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/SecondaryProcessMaster/GetPowderCoatingStockForm`;
    return this.getMasterEx<string[]>(url, httpOptions).pipe(catchError(this.handleError<string[]>('getPowderCoatingStockForm')));
  }

  getPowderCoatingMaterialDescription(): Observable<string[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/SecondaryProcessMaster/GetPowderCoatingMaterialDescription`;
    return this.getMasterEx<string[]>(url, httpOptions).pipe(catchError(this.handleError<string[]>('getPowderCoatingMaterialDescription')));
  }

  getPowderCoatingMachineManufacture(): Observable<SecondaryProcessPowderMachineDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/SecondaryProcessMaster/GetPowderCoatingMachineManufacture`;
    return this.getMasterEx<SecondaryProcessPowderMachineDto[]>(url, httpOptions).pipe(catchError(this.handleError<SecondaryProcessPowderMachineDto[]>()));
  }

  saveSecondaryProcessData(model: SecondaryProcessDto): Observable<SecondaryProcessDto> {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/SecondaryProcess`;
    return this.postEx<SecondaryProcessDto, SecondaryProcessDto>(url, httpOptions, model).pipe(catchError(this.handleError<SecondaryProcessDto>('saveSecondaryProcessData')));
  }

  updateSecondaryProcessData(model: SecondaryProcessDto): Observable<SecondaryProcessDto> {
    const httpOptions = this.createOptions('put');
    const url = `/api/costing/SecondaryProcess`;
    return this.putEx<SecondaryProcessDto, SecondaryProcessDto>(url, httpOptions, model).pipe(catchError(this.handleError<SecondaryProcessDto>('updateSecondaryProcessData')));
  }

  deleteSecondaryProcessData(id: number): Observable<boolean> {
    const httpOptions = this.createOptions('delete');
    const url = `/api/costing/SecondaryProcess/${id}`;
    return this.deleteEx<boolean>(url, httpOptions).pipe(catchError(this.handleError<boolean>('deleteSecondaryProcessData')));
  }

  bulkUpdateOrCreateSecondaryProcessInfo(model: SecondaryProcessDto[]): Observable<SecondaryProcessDto[]> {
    const httpOptions = this.createOptions('put');
    const url = `/api/costing/SecondaryProcess/BulkUpdateSecondaryProcessData`;
    return this.putEx<SecondaryProcessDto[], SecondaryProcessDto[]>(url, httpOptions, model).pipe(catchError(this.handleError<SecondaryProcessDto[]>('bulkUpdateOrCreateSecondaryProcessInfo')));
  }
}
