// import { MaterialInfoDto } from 'src/app/shared/models/material-info.model';

// export enum MaterialInfoActionTypes {
//   getMaterialInfo = '[GetMaterialInfoId] Get',
//   getMaterialInfosByPartInfoId = '[GetMaterialInfoByPartInfoId] Get',
//   createMaterialInfo = '[CreateMaterialInfo] Post',
//   updateMaterialInfo = '[UpdateMaterialInfo] Put',
//   deleteMaterialInfo = '[DeleteMaterialInfo] Delete',
//   bulkUpdateOrCreateMaterialInfo = '[BulkUpdateOrCreateMaterialInfo] Put',
//   setBulkMaterialUpdateLoading = '[SetBulkMaterialUpdateLoading] Put',
//   clear = '[ClearMaterialInfos] Clear',
// }

// export class GetMaterialInfo {
//   static readonly type = MaterialInfoActionTypes.getMaterialInfo;
//   constructor(public materialInfoId: number) {}
// }
// export class GetMaterialInfosByPartInfoId {
//   static readonly type = MaterialInfoActionTypes.getMaterialInfosByPartInfoId;
//   constructor(public partInfoId: number) {}
// }

// export class CreateMaterialInfo {
//   static readonly type = MaterialInfoActionTypes.createMaterialInfo;
//   constructor(public materialInfo: MaterialInfoDto) {}
// }

// export class UpdateMaterialInfo {
//   static readonly type = MaterialInfoActionTypes.updateMaterialInfo;
//   constructor(public materialInfo: MaterialInfoDto) {}
// }

// export class BulkUpdateOrCreateMaterialInfo {
//   static readonly type = MaterialInfoActionTypes.bulkUpdateOrCreateMaterialInfo;
//   constructor(public bulkmaterialInfo: MaterialInfoDto[]) {}
// }

// export class DeleteMaterialInfo {
//   static readonly type = MaterialInfoActionTypes.deleteMaterialInfo;
//   constructor(
//     public materialInfoId: number,
//     public partInfoId: number
//   ) {}
// }

// export class ClearMaterialInfos {
//   static readonly type = MaterialInfoActionTypes.clear;
// }

// export class SetBulkMaterialUpdateLoading {
//   static readonly type = MaterialInfoActionTypes.setBulkMaterialUpdateLoading;
//   constructor(public source: boolean) {}
// }

// export type MaterialInfoActions =
//   | GetMaterialInfo
//   | GetMaterialInfosByPartInfoId
//   | CreateMaterialInfo
//   | UpdateMaterialInfo
//   | DeleteMaterialInfo
//   | BulkUpdateOrCreateMaterialInfo
//   | SetBulkMaterialUpdateLoading
//   | ClearMaterialInfos;
