import { PackagingInfoDto } from 'src/app/shared/models/packaging-info.model';

export enum PackagingInfoActionTypes {
  getPackagingInfosByPartInfoId = '[GetPackagingInfoByPartInfoId] Get',
  getPackagingDescriptionMasterData = '[GetPackagingDescriptionMasterData] Get',
  getPackagingFormMasterData = '[GetPackagingFormMasterData] Get',
  getPackagingSizeDefinitionMasterData = '[GetPackagingSizeDefinitionMasterData] Get',
  savePackagingInfo = '[CreatePackagingInfo] Post',
  deletePackagingInfo = '[DeletePackagingInfo] Delete',
  setBulkPackagingUpdateLoading = '[SetBulkPackagingUpdateLoading] Put',
}

export class GetPackagingInfosByPartInfoId {
  static readonly type = PackagingInfoActionTypes.getPackagingInfosByPartInfoId;
  constructor(public partInfoId: number) {}
}

export class GetPackagingDescriptionMasterData {
  static readonly type = PackagingInfoActionTypes.getPackagingDescriptionMasterData;
}

export class GetPackagingFormMasterData {
  static readonly type = PackagingInfoActionTypes.getPackagingFormMasterData;
}

export class GetPackagingSizeDefinitionMasterData {
  static readonly type = PackagingInfoActionTypes.getPackagingSizeDefinitionMasterData;
}

export class SavePackagingInfo {
  static readonly type = PackagingInfoActionTypes.savePackagingInfo;
  constructor(public packagingInfo: PackagingInfoDto) {}
}

export class DeletePackagingInfo {
  static readonly type = PackagingInfoActionTypes.deletePackagingInfo;
  constructor(public partInfoId: number) {}
}

export class SetBulkPackagingUpdateLoading {
  static readonly type = PackagingInfoActionTypes.setBulkPackagingUpdateLoading;
  constructor(public source: boolean) {}
}

export type PackagingInfoActions =
  | GetPackagingInfosByPartInfoId
  | DeletePackagingInfo
  | SetBulkPackagingUpdateLoading
  | GetPackagingDescriptionMasterData
  | GetPackagingFormMasterData
  | GetPackagingSizeDefinitionMasterData
  | SavePackagingInfo;
