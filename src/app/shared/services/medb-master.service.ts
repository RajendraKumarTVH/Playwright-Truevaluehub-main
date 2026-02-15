import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SamplingRate } from 'src/app/modules/costing/models/sampling-rate.model';
import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { DfMedbMachineMasterInfoDto, MachineRequestDto, MedbMachinesMasterDto, MedbMachineTypeMasterDto, MedbProcessTypeMasterDto } from '../models';
import { SnackBarErrorHandlerService } from './snackbar-error-handler.service';

@Injectable({ providedIn: 'root' })
export class MedbMasterService extends BaseHttpService {
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  getPrcessTypeList(): Observable<MedbProcessTypeMasterDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/medbMaster/processtype`;
    return this.getMasterEx<MedbProcessTypeMasterDto[]>(url, httpOptions).pipe(catchError(this.handleError<MedbProcessTypeMasterDto[]>('getPrcessTypeList')));
  }

  getProcessTypeList(processIds: string): Observable<MedbProcessTypeMasterDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/medbMaster/processtypeByProcessIds?processIds=` + processIds;
    return this.getMasterEx<MedbProcessTypeMasterDto[]>(url, httpOptions).pipe(catchError(this.handleError<MedbProcessTypeMasterDto[]>('getProcessTypeList')));
  }

  getMachineTypeByProcessTypeId(processTypeId: number): Observable<MedbMachineTypeMasterDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/medbMaster/processtype/${processTypeId}`;
    return this.getMasterEx<MedbMachineTypeMasterDto[]>(url, httpOptions).pipe(catchError(this.handleError<MedbMachineTypeMasterDto[]>('getMachineTypeByProcessTypeId')));
  }

  getAllMachineTypes(): Observable<MedbMachineTypeMasterDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/medbMaster/machineTypes`;
    return this.getMasterEx<MedbMachineTypeMasterDto[]>(url, httpOptions).pipe(catchError(this.handleError<MedbMachineTypeMasterDto[]>('getAllMachineTypes')));
  }

  getMedbMachineMasterByProcessTypeId(countryId: number, processTypeId: number): Observable<MedbMachinesMasterDto[]> {
    const httpOptions = this.createOptionsWithHeader('get');
    const url = `/api/master/medbMaster/country/${countryId}/processType/${processTypeId}/machineDesc`;
    return this.getMasterEtagEx<any>(url, httpOptions).pipe(catchError(this.handleError<any>('getMedbMachineMasterByProcessTypeId')));
  }

  getMedbMachineMasterById(machineId: number, processTypeId: number): Observable<MedbMachinesMasterDto> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/medbMaster/machine/${machineId}/processType/${processTypeId}`;
    return this.getMasterEx<MedbMachinesMasterDto>(url, httpOptions).pipe(catchError(this.handleError<MedbMachinesMasterDto>('getMedbMachineMasterById')));
  }

  getMedbMachineMasterByIdAndCountry(machineId: number, processTypeId: number, countryId: number): Observable<MedbMachinesMasterDto> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/medbMaster/machine/${machineId}/processType/${processTypeId}/country/${countryId}`;
    return this.getMasterEx<MedbMachinesMasterDto>(url, httpOptions).pipe(catchError(this.handleError<MedbMachinesMasterDto>('getMedbMachineMasterById')));
  }

  getSamplingRates(): Observable<SamplingRate[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/SamplingRateData`;
    return this.getMasterEx<SamplingRate[]>(url, httpOptions).pipe(catchError(this.handleError<SamplingRate[]>('getSamplingRates')));
  }

  getMachineDatasByMachineMarketIdsAsync(machineMarketIds: string): Observable<MedbMachinesMasterDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/medbMaster/machineMarketids?machineMarketids=${machineMarketIds}`;
    return this.getMasterEx<MedbMachinesMasterDto[]>(url, httpOptions).pipe(catchError(this.handleError<MedbMachinesMasterDto[]>('getMachineDataListByMachineIds')));
  }

  getMedbMachineMasterInfoByProcessTypeId(processTypeId: number): Observable<MedbMachinesMasterDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/medbMaster/machineByProcessType/${processTypeId}`;
    return this.getMasterEx<MedbMachinesMasterDto[]>(url, httpOptions).pipe(catchError(this.handleError<MedbMachinesMasterDto[]>('getMedbMachineMasterInfoByProcessTypeId')));
  }

  getDfMedbMachineMasterByIds(machineRequestDtos: MachineRequestDto[]): Observable<DfMedbMachineMasterInfoDto[]> {
    const httpOptions = this.createOptions('post');
    const url = `/api/master/medbMaster/getMachineInfoByMachineDetailIds`;
    return this.postMasterEx<DfMedbMachineMasterInfoDto[], MachineRequestDto[]>(url, httpOptions, machineRequestDtos).pipe(
      catchError(this.handleError<DfMedbMachineMasterInfoDto[]>('getMedbMachineMasterByIds'))
    );
  }
}
