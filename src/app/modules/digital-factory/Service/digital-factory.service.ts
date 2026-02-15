import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, shareReplay } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { homeEndpoints } from 'src/app/modules/home/home.endpoints';
import { DigitalFactoryDto } from 'src/app/shared/models/digital-factory.model';
import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { SnackBarErrorHandlerService } from 'src/app/shared/services/snackbar-error-handler.service';
import { DfSupplierDirectoryMasterDto } from '../Models/df-supplier-directory-master-dto';
import { DigitalFactoryDtoNew } from '../Models/digital-factory-dto';
import { DfSupplierDirectoryTableListDto } from '../Models/df-supplier-directory-table-list-dto';
import { DfMaterialInfoDto } from '../Models/df-material-info-dto';
import { DfMachineInfoDto } from '../Models/df-machine-info-dto';
import { DigitalFactoryResultDto } from '../Models/df-result-dto';
import { SearchBarModelDto } from 'src/app/shared/models/search-bar-model';
import { LaborRateMasterRequestDto, MachineMasterRequestDto } from 'src/app/shared/models/machine-master-request-dto';
import { MedbMachinesMasterDto } from 'src/app/shared/models/medb-machine.model';
import { LaborRateMasterDto } from 'src/app/shared/models';

@Injectable({
  providedIn: 'root',
})
export class DigitalFactoryService extends BaseHttpService {
  vendorDtoSubject$ = new BehaviorSubject<DigitalFactoryDto[]>([]);

  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  getDigitalFactoryById(supplierId: number) {
    const httpOptions = this.createOptions('get');
    const url = homeEndpoints.getDigitaFactory('/api', supplierId);
    return this.getEx<DigitalFactoryDto>(url, httpOptions).pipe(catchError(this.handleError<DigitalFactoryDto>('getAsync')));
  }
  createDigitalFactory(digitalFactory: DigitalFactoryDto) {
    const httpOptions = this.createOptions('post');
    const url = homeEndpoints.createDigitalFactory('/api');
    return this.postEx<DigitalFactoryDto, DigitalFactoryDto>(url, httpOptions, digitalFactory).pipe(catchError(this.handleError<DigitalFactoryDto>('CreateAsync')));
  }
  updateDigitalFactory(digitalFactory: DigitalFactoryDto, supplierId: number) {
    const httpOptions = this.createOptions('put');
    const url = homeEndpoints.updateDigitalFactory('/api', supplierId);
    return this.putEx<DigitalFactoryDto, DigitalFactoryDto>(url, httpOptions, digitalFactory).pipe(catchError(this.handleError<DigitalFactoryDto>('UpdateAsync')));
  }

  addToDigitalFactory(digitalFactory: DigitalFactoryDtoNew) {
    const httpOptions = this.createOptions('post');
    const url = homeEndpoints.createNewDigitalFactory('/api');
    return this.postEx<DigitalFactoryDtoNew, DigitalFactoryDtoNew>(url, httpOptions, digitalFactory).pipe(catchError(this.handleError<DigitalFactoryDtoNew>('CreateNewAsync')));
  }

  updateDigitalFactoryNew(digitalFactory: DigitalFactoryDtoNew) {
    const httpOptions = this.createOptions('put');
    const url = homeEndpoints.updateNewDigitalFactory('/api');
    return this.postEx<DigitalFactoryDtoNew, DigitalFactoryDtoNew>(url, httpOptions, digitalFactory).pipe(catchError(this.handleError<DigitalFactoryDtoNew>('UpdateNewAsync')));
  }

  getSuppliers(pageNumber: number = 0) {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/DFSupplierDirectoryMaster?pageNumber=${pageNumber}&pageSize=20`;
    return this.getMasterEx<DfSupplierDirectoryTableListDto>(url, httpOptions).pipe(catchError(this.handleError<any>('getSuppliers')));
  }

  getAllDigitalFactorySuppliers() {
    const httpOptions = this.createOptions('get');
    const url = homeEndpoints.getAllDigitalFactorySuppliers('/api');
    return this.getEx<DigitalFactoryDtoNew[]>(url, httpOptions).pipe(catchError(this.handleError<any>('getDigitalFactorySuppliers')));
  }

  getDigitalFactorySuppliers(pageNumber: number = 0, pageSize: number = 20, filterDto: SearchBarModelDto[] = []) {
    const httpOptions = this.createOptions('get');
    const url = homeEndpoints.getDigitaFactorySuppliers('/api', pageNumber, pageSize);
    return this.postEx<DigitalFactoryResultDto, SearchBarModelDto[]>(url, httpOptions, filterDto).pipe(catchError(this.handleError<any>('getDigitalFactorySuppliers')));
  }

  getFilteredDigitalFactorySuppliers(pageNumber: number = 0, pageSize: number = 20, filterDto?: SearchBarModelDto[]) {
    const httpOptions = this.createOptions('post');
    const url = `/api/master/DFSupplierDirectoryMaster/getFilteredSuppliers?pageNumber=${pageNumber}&pageSize=${pageSize}`;

    return this.postMasterEx<DfSupplierDirectoryTableListDto[], SearchBarModelDto[]>(url, httpOptions, filterDto).pipe(catchError(this.handleError<any>('getFilteredDigitalFactorySuppliers')));
  }

  updateSupplierInfo(supplierInfo: DfSupplierDirectoryMasterDto) {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/DFSupplierDirectoryMaster/updateSupplierInfo`;
    return this.postMasterEx<DfSupplierDirectoryMasterDto, DfSupplierDirectoryMasterDto>(url, httpOptions, supplierInfo).pipe(catchError(this.handleError<any>('getSuppliers')));
  }

  getMasterSupplierInfoByIds(supplierIds: number[]) {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/DFSupplierDirectoryMaster/getSupplierByIds`;
    return this.postMasterEx<DfSupplierDirectoryMasterDto[], number[]>(url, httpOptions, supplierIds).pipe(catchError(this.handleError<any>('getDigitalFactorySuppliers')));
  }

  getDigitalFactoryBySupplierId(supplierId: number) {
    const httpOptions = this.createOptions('post');
    const url = homeEndpoints.getNewDigitaFactoryBySupplierId('/api', supplierId);
    return this.getEx<DigitalFactoryDtoNew>(url, httpOptions).pipe(catchError(this.handleError<DigitalFactoryDtoNew>('CreateNewAsync')));
  }

  removeFromDigitalFactory(digitalFactoryId: number) {
    const httpOptions = this.createOptions('post');
    const url = homeEndpoints.removeFromDigitalFactoryById('/api', digitalFactoryId);
    return this.getEx<DigitalFactoryDtoNew>(url, httpOptions).pipe(catchError(this.handleError<DigitalFactoryDtoNew>('RemoveNewAsync')));
  }

  addDigitalFactoryMaterialCostInfo(dfMaterialInfo: DfMaterialInfoDto) {
    const httpOptions = this.createOptions('post');
    const url = homeEndpoints.addDfMaterialCostInfo('/api');
    return this.postEx<DfMaterialInfoDto, DfMaterialInfoDto>(url, httpOptions, dfMaterialInfo).pipe(catchError(this.handleError<DfMaterialInfoDto>('AddMaterialInfo')));
  }

  addDigitalFactoryMachineCostInfo(dfMachineInfo: DfMachineInfoDto) {
    const httpOptions = this.createOptions('post');
    const url = homeEndpoints.addDfMachineCostInfo('/api');
    return this.postEx<DfMachineInfoDto, DfMachineInfoDto>(url, httpOptions, dfMachineInfo).pipe(catchError(this.handleError<DfMachineInfoDto>('AddMachineInfo')));
  }

  removeDigitalFactoryMachineCostInfo(dfMachineInfo: DfMachineInfoDto) {
    const httpOptions = this.createOptions('post');
    const url = homeEndpoints.removeDfMachineCostInfo('/api');
    return this.postEx<DfMachineInfoDto, DfMachineInfoDto>(url, httpOptions, dfMachineInfo).pipe(catchError(this.handleError<DfMachineInfoDto>('RemoveDfMachineAsync')));
  }

  removeDigitalFactoryMaterialCostInfo(dfMaterialInfoDto: DfMaterialInfoDto) {
    const httpOptions = this.createOptions('post');
    const url = homeEndpoints.removeDfMaterialCostInfo('/api');
    return this.postEx<DfMaterialInfoDto, DfMaterialInfoDto>(url, httpOptions, dfMaterialInfoDto).pipe(catchError(this.handleError<DfMaterialInfoDto>('RemoveDfMaterialAsync')));
  }

  updateDigitalFactoryMachineCostInfo(dfMachineInfo: DfMachineInfoDto) {
    const httpOptions = this.createOptions('post');
    const url = homeEndpoints.updateDfMachineCostInfo('/api');
    return this.postEx<DfMachineInfoDto, DfMachineInfoDto>(url, httpOptions, dfMachineInfo).pipe(catchError(this.handleError<DfMachineInfoDto>('updateDfMachine')));
  }

  updateDigitalFactoryMaterialCostInfo(dfMaterialInfoDto: DfMaterialInfoDto) {
    const httpOptions = this.createOptions('post');
    const url = homeEndpoints.updateDfMaterialCostInfo('/api');
    return this.postEx<DfMaterialInfoDto, DfMaterialInfoDto>(url, httpOptions, dfMaterialInfoDto).pipe(catchError(this.handleError<DfMaterialInfoDto>('updateDfMaterial')));
  }

  getSupplierInfoByCountryIds(countryIds: number[]) {
    const httpOptions = this.createOptions('post');
    const url = `/api/master/DFSupplierDirectoryMaster/getSupplierInfoByCountryIds`;
    return this.postMasterEx<any, number[]>(url, httpOptions, countryIds).pipe(catchError(this.handleError<any>('getSupplierInfoByCountryIds')));
  }

  getSupplierMarkers(zoom: number, bounds?: any, filterDto?: SearchBarModelDto[]) {
    const httpOptions = this.createOptions('post');
    const { north, south, east, west } = bounds;
    const url = `/api/master/DFSupplierDirectoryMaster/GetAllDFSupplierMarkersAsync?north=${north}&south=${south}&east=${east}&west=${west}&zoom=${zoom}`;
    return this.postMasterEx<any, SearchBarModelDto[]>(url, httpOptions, filterDto).pipe(shareReplay(1), catchError(this.handleError<any>('GetAllDFSupplierMarkersAsync')));
  }

  getDFSupplierMarkers(zoom: number, bounds?: any): Observable<any> {
    const { north, south, east, west } = bounds;
    const url = `/api/master/DFSupplierDirectoryMaster/DFSupplierMarkers?north=${north}&south=${south}&east=${east}&west=${west}&zoom=${zoom}`;
    const httpOptions = this.createOptionsWithHeader('get');
    return this.getMasterEtagEx<any>(url, httpOptions).pipe(catchError(this.handleError<any>('getDFSupplierMarkers')));
  }

  getDFHubSupplierMarkers(zoom: number, bounds?: any) {
    const { north, south, east, west } = bounds;
    const url = `/api/master/DfHub/DFHubSupplierMarkers?north=${north}&south=${south}&east=${east}&west=${west}&zoom=${zoom}`;
    return this.getPlainMaster(url).pipe(catchError(this.handleError<any>('getDFHubSupplierMarkers')));
  }

  getMasterUrlBase(): Observable<string> {
    const url$: Observable<string> = this.getMasterBaseUrl();
    return url$;
  }

  getSupplierMarkerByName(supplierName: string) {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/DFSupplierDirectoryMaster/GetDFSupplierMarkerByNameAsync?supplierName=${supplierName}`;
    return this.getMasterEx<string>(url, httpOptions).pipe(catchError(this.handleError<any>('getSupplierMarkerByName')));
  }

  getDigitalFactoryMarkers(filterDto?: SearchBarModelDto[]) {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/DigitalFactory/getDigitalFactoryMarkers`;
    return this.postEx<any, SearchBarModelDto[]>(url, httpOptions, filterDto).pipe(shareReplay(1), catchError(this.handleError<any>('getDigitalFactoryMarkers')));
  }

  GetMaterialInfosByMasterId(supplierId?: number, materialMasterId?: number): Observable<DfMaterialInfoDto[]> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/DigitalFactory/${supplierId}/getMaterialInfos/${materialMasterId}`;
    return this.getEx<DfMaterialInfoDto[]>(url, httpOptions).pipe(shareReplay(1), catchError(this.handleError<any>('getMaterialInfos')));
  }

  getDfMaterialInfoByMarketMonth(supplierId: number, materialMasterId: number, marketMonth: string) {
    const httpOptions = this.createOptions('post');
    const url = homeEndpoints.getDfMaterialInfoByMarketMonth('/api', supplierId, materialMasterId, marketMonth);
    return this.getEx<DfMaterialInfoDto>(url, httpOptions).pipe(catchError(this.handleError<DfMaterialInfoDto>('getDfMaterialInfoByMarketMonth')));
  }

  getMachineMaster(machineMasterRequestDto: MachineMasterRequestDto) {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/DigitalFactory/getMachineMaster`;
    return this.postEx<MedbMachinesMasterDto, MachineMasterRequestDto>(url, httpOptions, machineMasterRequestDto).pipe(
      shareReplay(1),
      catchError(this.handleError<MedbMachinesMasterDto>('getMachineMaster'))
    );
  }

  getLaborRateMasterByCountry(laborRateMasterRequestDto: LaborRateMasterRequestDto) {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/DigitalFactory/getLaborRateMasterByCountry`;
    return this.postEx<LaborRateMasterDto[], LaborRateMasterRequestDto>(url, httpOptions, laborRateMasterRequestDto).pipe(
      shareReplay(1),
      catchError(this.handleError<LaborRateMasterDto[]>('getMachineMaster'))
    );
  }

  getMachineMasterByProcessTypeId(machineMasterRequestDto: MachineMasterRequestDto) {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/DigitalFactory/getMachineMasterByProcessTypeId`;
    return this.postEx<MedbMachinesMasterDto[], MachineMasterRequestDto>(url, httpOptions, machineMasterRequestDto).pipe(
      shareReplay(1),
      catchError(this.handleError<MedbMachinesMasterDto[]>('getMachineMasterByProcessTypeId'))
    );
  }
}
