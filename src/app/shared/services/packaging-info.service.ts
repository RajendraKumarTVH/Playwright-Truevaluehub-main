import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiCacheService, AppConfigurationService, BaseHttpService, BlockUiService } from 'src/app/shared/services';
import { MaterialGroupDto, MaterialMarketDataDto, MaterialMasterDto, MaterialTypeDto } from '../models';
import { MaterialPriceDto, MaterialTypeEnum, PackagingInfoDto } from '../models/packaging-info.model';
import { SnackBarErrorHandlerService } from './snackbar-error-handler.service';
import { PackagingDescriptionDto, PackagingFormDto, PackagingMapDto, PackingMaterialDto, PackagingSizeDefinitionDto } from '../models/PackagingMaterialMasterDto.model';

export const PackagingGroup: MaterialGroupDto = {
  materialGroupId: 9,
  materialGroupName: 'Packaging',
};

export const MaxWeight = [
  {
    description: '1000 x 1000 x 700',
    maxWeight: 29478.4580498866,
    type: MaterialTypeEnum.Box,
  },
  {
    description: '1000 x 240 x 120',
    maxWeight: 29478.4580498866,
    type: MaterialTypeEnum.Box,
  },
  {
    description: '1200 x 1000 x 1000',
    maxWeight: 45351.4739229025,
    type: MaterialTypeEnum.Box,
  },
  {
    description: '300 x 250 x 125',
    maxWeight: 29478.4580498866,
    type: MaterialTypeEnum.Box,
  },
  {
    description: '300 x 250 x 250',
    maxWeight: 43083.9002267574,
    type: MaterialTypeEnum.Box,
  },
  {
    description: '500 x 500 x 300',
    maxWeight: 29478.4580498866,
    type: MaterialTypeEnum.Box,
  },
  {
    description: '600 x 500 x 500',
    maxWeight: 29478.4580498866,
    type: MaterialTypeEnum.Box,
  },
  {
    description: '1050 x 1050 x 1000',
    maxWeight: 1814058.9569161,
    type: MaterialTypeEnum.Pallet,
  },
  {
    description: '1200 x 1000 x 1000',
    maxWeight: 1133786.84807256,
    type: MaterialTypeEnum.Pallet,
  },
  {
    description: '1200 x 1200 x 1000',
    maxWeight: 1587301.58730159,
    type: MaterialTypeEnum.Pallet,
  },
  {
    description: '1300 x 1000 x 1000',
    maxWeight: 861678.004535147,
    type: MaterialTypeEnum.Pallet,
  },
  {
    description: '1400 x 1000 x 1000',
    maxWeight: 907029.47845805,
    type: MaterialTypeEnum.Pallet,
  },
  {
    description: '1500 x 1000 x 1000',
    maxWeight: 907029.47845805,
    type: MaterialTypeEnum.Pallet,
  },
  {
    description: '1850 x 1000 x 1000',
    maxWeight: 3174603.17460317,
    type: MaterialTypeEnum.Pallet,
  },
  {
    description: '2000 x 1200 x 1000',
    maxWeight: 3174603.17460317,
    type: MaterialTypeEnum.Pallet,
  },
  {
    description: '2750 x 1000 x 1000',
    maxWeight: 3174603.17460317,
    type: MaterialTypeEnum.Pallet,
  },
];

export const ShrinkWrapCost = 0.95;

export const SplBoxTypes = [
  { id: 0, name: 'None' },
  { id: 1, name: 'Custom Box Size' },
  { id: 2, name: 'Drums' },
  { id: 3, name: 'Labeled Box' },
  { id: 4, name: 'Totes / Bags' },
  { id: 5, name: 'Other' },
];

export const ProtectivePkgTypes = [
  '140g White-top kraft liner board',
  'Environmental cardboard paper 140g',
  'Paper based Friction Sheet',
  'Premium kraft liner board 160g',
  'Recycled kraft paper 70g',
  'Rubberised Cork Sheets T400-1|Less Thickness',
  'Shrink Wrap',
  'Vacuum Tray',
  'White kraft paper 80g',
];

@Injectable({
  providedIn: 'root',
})
export class PackagingInfoService extends BaseHttpService {
  constructor(
    protected http: HttpClient,
    protected appConfigurationService: AppConfigurationService,
    protected _snackBarErrorHandlerService: SnackBarErrorHandlerService,
    protected _blockUIService: BlockUiService,
    protected _apiCacheService: ApiCacheService
  ) {
    super(http, appConfigurationService, _snackBarErrorHandlerService, _blockUIService, _apiCacheService);
  }

  getPackagingDetails(partInfoId: number): Observable<PackagingInfoDto> {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/PackingInfo/${partInfoId}`;
    return this.getEx<PackagingInfoDto>(url, httpOptions).pipe(catchError(this.handleError<PackagingInfoDto>('getPackagingDetails')));
  }

  savePackagingInfo(packingInfo: PackagingInfoDto) {
    const httpOptions = this.createOptions('post');
    const url = `/api/costing/PackingInfo`;
    return this.postEx<PackagingInfoDto, PackagingInfoDto>(url, httpOptions, packingInfo).pipe(catchError(this.handleError<PackagingInfoDto>('savePackagingInfo')));
  }

  deletePacking(partInfoId: number) {
    const httpOptions = this.createOptions('get');
    const url = `/api/costing/PackingInfo/delete?itemId=${partInfoId}`;
    return this.deleteEx<PackagingInfoDto>(url, httpOptions).pipe(catchError(this.handleError<PackagingInfoDto>('deletePacking')));
  }

  getMaterialTypesByGroupId(materialGroupId: number) {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/MaterialMaster/materialGroup/${materialGroupId}/materialTypes`;
    return this.getMasterEx<MaterialTypeDto[]>(url, httpOptions).pipe(catchError(this.handleError<MaterialTypeDto[]>('getMaterialTypesByGroupId')));
  }

  getMaterialByTypeId(materialTypeId: number) {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/MaterialMaster/materialType/${materialTypeId}/material`;
    return this.getMasterEx<MaterialMasterDto[]>(url, httpOptions).pipe(catchError(this.handleError<MaterialMasterDto[]>('getMaterialByTypeId')));
  }

  getMaterialByGroupId(groupId: number) {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/MaterialMaster/material/${groupId}`;
    return this.getMasterEx<MaterialMasterDto[]>(url, httpOptions).pipe(catchError(this.handleError<MaterialMasterDto[]>('getMaterialByGroupId')));
  }

  getMaterialPrice(materialMasterId: number, countyId: number, marketMonth: string) {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/MaterialMaster/country/${countyId}/material/${materialMasterId}/${marketMonth}`;
    return this.getMasterEx<MaterialMarketDataDto[]>(url, httpOptions).pipe(catchError(this.handleError<MaterialMarketDataDto[]>('getMaterialPrice')));
  }

  getAllMaterialPrice(countyId: number, marketMonth: string) {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/MaterialMaster/GetMaterialPrice/${countyId}/${marketMonth}`;
    return this.getMasterEx<MaterialPriceDto[]>(url, httpOptions).pipe(catchError(this.handleError<MaterialPriceDto[]>('getAllMaterialPrice')));
  }

  getPackagingMaterialDetails(commodityId: number, materialFinishId: number, fragileId: number, packagingSizeId: number, freightId: number, environmentalId: number) {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/PackagingMaster/GetPackagingMasterDataByCriteria/${commodityId}/${materialFinishId}/${fragileId}/${packagingSizeId}/${freightId}/${environmentalId}`;
    return this.getMasterEx<PackagingMapDto>(url, httpOptions).pipe(catchError(this.handleError<PackagingMapDto>('getPackagingMaterialDetails')));
  }

  getPackagingFormByPackagingType(packagingTypeId: number) {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/PackagingMaster/GetPackagingFormByPackagingType/${packagingTypeId}`;
    return this.getMasterEx<PackagingFormDto[]>(url, httpOptions).pipe(catchError(this.handleError<PackagingFormDto[]>('GetPackagingFormByPackagingType')));
  }

  getPackagingDescriptionByPackagingTypeAndForm(packagingTypeId: number, packagingFormId: number) {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/PackagingMaster/GetPackagingDescriptionByPackagingTypeAndForm/${packagingTypeId}/${packagingFormId}`;
    return this.getMasterEx<PackagingDescriptionDto[]>(url, httpOptions).pipe(catchError(this.handleError<PackagingDescriptionDto[]>('getPackagingDescriptionByPackagingTypeAndForm')));
  }

  getPackagingMaterialDetailsByTypeFormDesc(packagingTypeId: number, packagingFormId: number, packageDescriptionId: number) {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/PackagingMaster/GetPackagingMaterialDetailsByTypeFormDesc/${packagingTypeId}/${packagingFormId}/${packageDescriptionId}`;
    return this.getMasterEx<PackingMaterialDto>(url, httpOptions).pipe(catchError(this.handleError<PackingMaterialDto>('getPackagingMaterialDetailsByTypeFormDesc')));
  }

  getPackagingDescriptionMasterData() {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/PackagingMaster/GetPackagingDescriptionMasterData`;
    return this.getMasterEx<PackagingDescriptionDto[]>(url, httpOptions).pipe(catchError(this.handleError<PackagingDescriptionDto[]>('GetPackagingDescriptionMasterData')));
  }
  getPackagingFormMasterData() {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/PackagingMaster/GetPackagingFormMasterData`;
    return this.getMasterEx<PackagingFormDto[]>(url, httpOptions).pipe(catchError(this.handleError<PackagingFormDto[]>('GetPackagingFormMasterData')));
  }
  getPackagingSizeDefinitionMasterData() {
    const httpOptions = this.createOptions('get');
    const url = `/api/master/PackagingMaster/GetPackagingSizeDefinitionData`;
    return this.getMasterEx<PackagingSizeDefinitionDto[]>(url, httpOptions).pipe(catchError(this.handleError<PackagingSizeDefinitionDto[]>('GetPackagingSizeDefinitionMasterData')));
  }
}
