// import { ProcessInfoDto } from 'src/app/shared/models/process-info.model';

// export enum ProcessInfoActionTypes {
//   getProcessInfo = '[GetProcessInfoId] Get',
//   getProcessInfosByPartInfoId = '[GetProcessInfoByPartInfoId] Get',
//   createProcessInfo = '[CreateProcessInfo] Post',
//   updateProcessInfo = '[UpdateProcessInfo] Put',
//   deleteProcessInfo = '[DeleteProcessInfo] Delete',
//   deleteAllProcessInfo = '[DeleteAllProcessInfo] Delete',
//   bulkUpdateOrCreateProcessInfo = '[BulkUpdateOrCreateProcessInfo] Put',
//   setBulkProcessUpdateLoading = '[SetBulkProcessUpdateLoading] Put',
//   clear = '[ClearProcessInfos] Clear',
// }

// export class GetProcessInfo {
//   static readonly type = ProcessInfoActionTypes.getProcessInfo;
//   constructor(public processInfoId: number) {}
// }
// export class GetProcessInfosByPartInfoId {
//   static readonly type = ProcessInfoActionTypes.getProcessInfosByPartInfoId;
//   constructor(public partInfoId: number) {}
// }

// export class CreateProcessInfo {
//   static readonly type = ProcessInfoActionTypes.createProcessInfo;
//   constructor(public processInfo: ProcessInfoDto) {}
// }

// export class UpdateProcessInfo {
//   static readonly type = ProcessInfoActionTypes.updateProcessInfo;
//   constructor(public processInfo: ProcessInfoDto) {}
// }

// export class BulkUpdateOrCreateProcessInfo {
//   static readonly type = ProcessInfoActionTypes.bulkUpdateOrCreateProcessInfo;
//   constructor(public processInfo: ProcessInfoDto[]) {}
// }

// export class DeleteProcessInfo {
//   static readonly type = ProcessInfoActionTypes.deleteProcessInfo;
//   constructor(
//     public processInfoId: number,
//     public partInfoId: number
//   ) {}
// }

// export class DeleteAllProcessInfo {
//   static readonly type = ProcessInfoActionTypes.deleteAllProcessInfo;
//   constructor(
//     public processInfos: ProcessInfoDto[],
//     public partInfoId: number
//   ) {}
// }

// export class SetBulkProcessUpdateLoading {
//   static readonly type = ProcessInfoActionTypes.setBulkProcessUpdateLoading;
//   constructor(public source: boolean) {}
// }

// export class ClearProcessInfos {
//   static readonly type = ProcessInfoActionTypes.clear;
// }

// export type ProcessInfoActions =
//   | GetProcessInfo
//   | GetProcessInfosByPartInfoId
//   | CreateProcessInfo
//   | UpdateProcessInfo
//   | DeleteProcessInfo
//   | DeleteAllProcessInfo
//   | BulkUpdateOrCreateProcessInfo
//   | SetBulkProcessUpdateLoading
//   | ClearProcessInfos;
